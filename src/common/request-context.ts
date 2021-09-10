import { APIGatewayProxyEventV2 } from 'aws-lambda'
import * as jwt from 'jsonwebtoken'

export interface RequestContext {
  userId: string
}

export const toRequestContext = (e: APIGatewayProxyEventV2) => {
  const authHeader = e?.headers?.authorization
  const decodedNotVerified = jwt.decode(authHeader as string)
  const userId = decodedNotVerified?.sub as string

  if (!userId || !userId.length) {
    throw new Error('Unable to construct request context, user id is not defined')
  }

  return {
    userId
  }
}
