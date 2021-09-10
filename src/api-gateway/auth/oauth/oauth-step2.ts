import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { logger } from 'common/logger'
import { OAuthService } from 'service/oauth-service'
import { http200WithJSONBody } from 'api-gateway/common'

const oAuthService = new OAuthService()

export const handler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {

  if (event.queryStringParameters && event.queryStringParameters.accessCode) {
    try {
      const tokens = await oAuthService.onOAuthStep2(event.queryStringParameters.accessCode)
      return http200WithJSONBody(JSON.stringify(tokens))
    } catch (err) {
      logger.error(err)
    }
  }

  return http200WithJSONBody(JSON.stringify({}))
}
