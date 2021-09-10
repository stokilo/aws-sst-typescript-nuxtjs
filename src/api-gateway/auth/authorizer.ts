import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent,
  PolicyDocument
} from 'aws-lambda/trigger/api-gateway-authorizer'
import { logger } from 'common/logger'
import { AuthService } from 'service/auth-service'
import { build, parse } from '@aws-sdk/util-arn-parser'

const authService = new AuthService()

export async function handler (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> {
  try {
    const authHeader = event?.headers?.authorization
    const isValid = await authService.verify(authHeader as string)
    if (isValid) {
      return generatePolicy(true, event.methodArn)
    }
  } catch (e) {
    logger.error(e)
    return generatePolicy(false, event.methodArn)
  }

  return generatePolicy(false, event.methodArn)
}

function generatePolicy (isAllowed: boolean, methodArn: string) {
  return {
    policyDocument: generatePolicyStatement(isAllowed, methodArn),
    principalId: 'user'
  }
}

function generatePolicyStatement (isAllowed: boolean, methodArn: string): PolicyDocument {
  const defaultDenyPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Deny',
        Resource: ['*']
      }
    ]
  }

  if (!isAllowed) {
    return defaultDenyPolicy
  }

  // Replace HTTP method in Arn string with *, otherwise first invoked HTTP method will be cached on Api Gateway side.
  // Subsequent calls to same stage/path, but different method, will fail till cache is expired. This fix this problem.
  // arn:aws:execute-api:me-south-1:262280523204:1d8uw6x4fg/$default/GET/contact ==>
  // arn:aws:execute-api:me-south-1:262280523204:1d8uw6x4fg/$default/*/contact
  const parsedMethodArn = parse(methodArn)
  parsedMethodArn.resource = parsedMethodArn.resource.replace(/GET|POST|DELETE|OPTION|PUT|HEAD/g, '*')
  const methodArnUpdated = build(parsedMethodArn)

  return {
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: methodArnUpdated
      }
    ]
  }
}
