import { APIGatewayProxyResultV2 } from 'aws-lambda/trigger/api-gateway-proxy'

export function http200WithJSONBody (body: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/json' },
    body
  }
}

/**
 * redirect to location
 * @param location
 */
export function http302 (location: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 302,
    headers: {
      'Content-Type': 'text/json',
      Location: location
    },
    body: ''
  }
}
