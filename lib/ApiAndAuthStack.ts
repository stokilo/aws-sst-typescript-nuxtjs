import * as sst from '@serverless-stack/resources'
import { CorsHttpMethod } from '@aws-cdk/aws-apigatewayv2'
import { throwExpression } from 'common/utils'
import SharedReferences from './SharedReferences'

export default class ApiAndAuthStack extends sst.Stack {
  constructor (scope: sst.App, id: string, sharedReferences: SharedReferences, props?: sst.StackProps) {
    super(scope, id, props)

    const api = new sst.Api(this, 'Api', {
      defaultAuthorizationType: sst.ApiAuthorizationType.CUSTOM,
      defaultAuthorizer: sharedReferences.authorizer,
      routes: {
        'GET /authenticate/oauth-step1': {
          authorizationType: sst.ApiAuthorizationType.NONE,
          function: 'src/api-gateway/auth/oauth/oauth-step1.handler'
        },
        'GET /authenticate/oauth-step2': {
          authorizationType: sst.ApiAuthorizationType.NONE,
          function: 'src/api-gateway/auth/oauth/oauth-step2.handler'
        },
        'POST /authenticate/oauth-refresh-token': {
          authorizationType: sst.ApiAuthorizationType.NONE,
          function: 'src/api-gateway/auth/oauth/oauth-refresh-token.handler'
        },
        'POST /contact': {
          function: 'src/api-gateway/contact.handler'
        },
        'GET /contact': {
          function: 'src/api-gateway/contact.handler'
        }
      },
      defaultFunctionProps: {
        environment: {
          DYNAMODB_TABLE_NAME: sharedReferences.dynamoDbTable.dynamodbTable.tableName,
          APP_CONFIG_BUCKET_NAME: sharedReferences.applicationConfigBucketName,
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
          FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID ?? throwExpression('FACEBOOK_CLIENT_ID is required'),
          FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET ?? throwExpression('FACEBOOK_CLIENT_SECRET is required'),
          FACEBOOK_REDIRECT_URL: process.env.FACEBOOK_REDIRECT_URL ?? throwExpression('FACEBOOK_REDIRECT_URL is required'),
          GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? throwExpression('GOOGLE_CLIENT_ID is required'),
          GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? throwExpression('GOOGLE_CLIENT_SECRET is required'),
          GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL ?? throwExpression('GOOGLE_REDIRECT_URL is required'),
          REGION: sharedReferences.region,
          ENTRY_PAGE: process.env.ENTRY_PAGE ?? throwExpression('ENTRY_PAGE is required')
        }
      },
      cors: {
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST],
        allowOrigins: ['http://localhost:3000', 'https://api.awss.ws', 'https://awss.ws'],
        allowHeaders: ['*']
      },
      customDomain: {
        domainName: 'api.awss.ws',
        hostedZone: 'awss.ws',
        path: 'v1'
      }
    })

    api.attachPermissions([sharedReferences.dynamoDbTable])
    api.attachPermissions([sharedReferences.applicationConfigBucket])

    this.addOutputs({
      apiRegion: sharedReferences.region,
      apiName: 'TestApi',
      apiEndpoint: api.url

    })
  }
}
