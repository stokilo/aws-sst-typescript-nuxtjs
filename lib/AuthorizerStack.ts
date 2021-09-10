import * as sst from '@serverless-stack/resources'
import { HttpLambdaAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers'
import SharedReferences from './SharedReferences'

export default class AuthorizerStack extends sst.Stack {
  constructor (scope: sst.App, id: string, sharedReferences: SharedReferences, props?: sst.StackProps) {
    super(scope, id, props)

    const authorizerFunction = new sst.Function(this, 'LambdaAuthorizer', {
      handler: 'src/api-gateway/auth/authorizer.handler',
      environment: {
        REGION: sharedReferences.region,
        DYNAMODB_TABLE_NAME: sharedReferences.dynamoDbTable.dynamodbTable.tableName
      }
    })

    authorizerFunction.attachPermissions([sharedReferences.dynamoDbTable])

    sharedReferences.authorizer = new HttpLambdaAuthorizer({
      authorizerName: 'LambdaAuthorizer',
      handler: authorizerFunction
    })
  }
}
