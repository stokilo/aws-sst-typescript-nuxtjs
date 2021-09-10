import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from 'aws-lambda'
import { logger } from 'common/logger'
import {
  AuthAndRefreshJwtToken,
  AuthAndRefreshJwtTokenSchema
} from 'backend-frontend/auth'
import { AuthService } from 'service/auth-service'
import { http200WithJSONBody } from 'api-gateway/common'

const authService = new AuthService()

export const handler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  let newTokens: AuthAndRefreshJwtToken = {
    authToken: '',
    refreshToken: ''
  }

  try {
    const tokens: AuthAndRefreshJwtToken = AuthAndRefreshJwtTokenSchema.parse(JSON.parse(event.body as string))
    newTokens = await authService.handleRefreshToken(tokens)
  } catch (e) {
    logger.error(e)
  }

  return http200WithJSONBody(JSON.stringify(newTokens))
}
