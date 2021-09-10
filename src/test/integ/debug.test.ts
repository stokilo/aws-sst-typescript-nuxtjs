import axios from 'axios'
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda/trigger/api-gateway-proxy'

describe('Debug endpoint', () => {
  it('should return my name', async () => {
    const response = await axios.get<APIGatewayProxyStructuredResultV2>('https://api.awss.ws/v1/debug')

    expect(response.status).toEqual(200)
  })
})
