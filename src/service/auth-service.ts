import AuthDao from 'dao/auth-dao'
import * as jwt from 'jsonwebtoken'
import {
  AuthAndRefreshJwtToken, AuthAndRefreshJwtTokenSecrets, User, UserSchema
} from 'backend-frontend/auth'
import { JwtPayload } from 'jsonwebtoken'
import { logger } from 'common/logger'
import { v4 as uuidv4 } from 'uuid'
import { RecordPrefix } from 'dao/dynamo-db'

export class AuthService {
  readonly JWT_ISS = 'sso.awss.ws'
  readonly JWT_AUD = 'www.awss.ws'
  readonly authDao: AuthDao

  constructor () {
    this.authDao = new AuthDao()
  }

  generateTokens (subject: string, secrets: AuthAndRefreshJwtTokenSecrets): AuthAndRefreshJwtToken {
    const payload = {
      iss: this.JWT_ISS,
      sub: subject,
      aud: this.JWT_AUD
    }

    const authToken = jwt.sign(payload, secrets.authTokenSecret, { expiresIn: '30m' })
    const refreshToken = jwt.sign(payload, secrets.refreshTokenSecret, { expiresIn: '1h' })

    return {
      authToken,
      refreshToken
    }
  }

  /**
   * Verify token against user provided as 'sub' claim in the token.
   * Fetch secrets from data store and decode the token.
   * @param jwtValue
   */
  async verify (jwtValue: string) {
    try {
      const decodedNotVerified = jwt.decode(jwtValue)
      if (decodedNotVerified) {
        const userId = decodedNotVerified.sub as string

        if (userId) {
          const userData = await this.authDao.fetch<User, typeof UserSchema>(
            RecordPrefix.USER, userId, UserSchema)
          if (userData.found) {
            const secret = userData.data.tokensSecrets.authTokenSecret
            const decodedVerified = this.verifyJwt(jwtValue, secret, userId)
            if (decodedVerified) {
              return true
            }
          }
        }
      }
    } catch (e) {
      logger.error(e)
    }

    return false
  }

  /**
   * Verify refresh token. Valid token lead to exchange of secrets, auth, and refresh tokens in database.
   * User receives fresh pair of tokens or empty one in case of any error.
   * @param tokens
   */
  async handleRefreshToken (tokens: AuthAndRefreshJwtToken) : Promise<AuthAndRefreshJwtToken> {
    try {
      const decodedNotVerified = jwt.decode(tokens.refreshToken)
      if (decodedNotVerified) {
        const userId = decodedNotVerified.sub as string

        if (userId) {
          const userData = await this.authDao.fetch<User, typeof UserSchema>(
            RecordPrefix.USER, userId, UserSchema)

          if (userData.found) {
            const secret = userData.data.tokensSecrets.refreshTokenSecret
            const decodedVerified = this.verifyJwt(tokens.refreshToken, secret, userId)

            if (decodedVerified) {
              const newTokensSecrets: AuthAndRefreshJwtTokenSecrets = {
                authTokenSecret: uuidv4(),
                refreshTokenSecret: uuidv4()
              }
              const newTokens = this.generateTokens(userId, newTokensSecrets)

              userData.data.tokensSecrets = newTokensSecrets
              userData.data.tokens = newTokens

              await this.authDao.save(RecordPrefix.USER, userId,
                UserSchema.parse(userData.data))

              return newTokens
            }
          }
        }
      }
    } catch (e) {
      logger.error(e)
    }

    return {
      authToken: '',
      refreshToken: ''
    }
  }

  /**
   * Verify the token and throw an error in case if invalid or expired
   * @param authHeader
   * @param secret
   * @param subject
   */
  private verifyJwt (authHeader: string, secret: string, subject: string) : string | JwtPayload {
    return jwt.verify(authHeader, secret, {
      algorithms: ['HS256'],
      issuer: this.JWT_ISS,
      audience: this.JWT_AUD,
      subject,
      complete: false,
      ignoreExpiration: false,
      ignoreNotBefore: true
    })
  }
}
