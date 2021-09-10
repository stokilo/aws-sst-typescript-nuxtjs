import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2, Callback, Context } from 'aws-lambda'
import { APIGatewayProxyResultV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy'

describe('Unit test for app handler', function () {
  it('verifies successful response', async () => {
    // const event: APIGatewayProxyEventV2 = {
    //   headers: {},
    //   isBase64Encoded: false,
    //   rawPath: '',
    //   rawQueryString: '',
    //   requestContext: {
    //     accountId: '',
    //     apiId: '',
    //     domainName: '',
    //     domainPrefix: '',
    //     http: {
    //       method: '',
    //       path: '',
    //       protocol: '',
    //       sourceIp: '',
    //       userAgent: ''
    //     },
    //     requestId: '',
    //     routeKey: '',
    //     stage: '',
    //     time: '',
    //     timeEpoch: 0
    //   },
    //   routeKey: '',
    //   version: '',
    //   queryStringParameters: {
    //     a: '1'
    //   }
    // }

    // const result = (await handler({} as APIGatewayProxyEventV2, {} as Context, {} as Callback)) as APIGatewayProxyStructuredResultV2

    // expect(result.statusCode).toEqual(200)
    // expect(result.body).toEqual(JSON.stringify({ firstName: 'Slawomir Stec' }))
  })
})


