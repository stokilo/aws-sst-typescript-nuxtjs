import AuthDao from 'dao/auth-dao'
import { v4 as uuidv4 } from 'uuid'
import {
  AccessCode,
  AccessCodeSchema,
  AuthAndRefreshJwtTokenSecrets,
  OAuthEntity,
  OAuthEntitySchema, OAuthStep2Response,
  User,
  UserData, UserRights,
  UserSchema, UserSettings
} from 'backend-frontend/auth'
import { AuthService } from 'service/auth-service'
import { RecordPrefix } from 'dao/dynamo-db'

export class OAuthService {
  // max access token age in miliseconds
  readonly ACCESS_TOKEN_MAX_AGE_MS = 10 * 1000

  readonly authDao: AuthDao
  readonly authService: AuthService

  constructor () {
    this.authDao = new AuthDao()
    this.authService = new AuthService()
  }

  /**
   * First step of the OAuth handling in the app if performed after callback from the identity source.
   * We have a user data. System save user entity and temp access code. On OAuth step 2 it is possible to exchange
   * temp access code for session tokens.
   * @param userData
   */
  async onOAuthStep1 (userData: UserData): Promise<string> {
    const tokensSecrets: AuthAndRefreshJwtTokenSecrets = {
      authTokenSecret: uuidv4(),
      refreshTokenSecret: uuidv4()
    }

    // save mapping between email and oauth user id
    const oAuthEntity = await this.authDao.fetch<OAuthEntity, typeof OAuthEntitySchema>(
      RecordPrefix.OAUTH_ENTITY, userData.email, OAuthEntitySchema)
    const userId = oAuthEntity.found ? oAuthEntity.data.userId : uuidv4()

    const tokens = this.authService.generateTokens(userId, tokensSecrets)
    const tmpAppAccessCode = `${userId}-${uuidv4()}`
    const accessCode: AccessCode = AccessCodeSchema.parse({
      code: tmpAppAccessCode,
      createdAt: new Date().getTime(),
      isActive: true
    })

    if (!oAuthEntity.found) {
      const settings: UserSettings = { darkMode: false }
      const rights: UserRights = { isAdmin: false }
      const user: User = {
        userData,
        accessCode,
        tokensSecrets,
        tokens,
        settings,
        rights
      }

      await this.authDao.transactBatchSave('Save initial user records', [
        this.authDao.getPutCommandPkEqSk(RecordPrefix.OAUTH_ENTITY, userData.email, OAuthEntitySchema.parse({ userId })),
        this.authDao.getPutCommandPkEqSk(RecordPrefix.USER, userId, UserSchema.parse(user))
      ])
    } else {
      await this.authDao.update(RecordPrefix.USER, userId, {
        accessCode,
        tokens,
        tokensSecrets
      })
    }

    return tmpAppAccessCode
  }

  async onOAuthStep2 (accessCode: string): Promise<OAuthStep2Response | undefined> {
    const userId = accessCode.substr(0, 36)
    const userData = await this.authDao.fetch<User, typeof UserSchema>(
      RecordPrefix.USER, userId, UserSchema)

    if (userData.found) {
      const user = userData.data
      const accessCodeDb = user.accessCode
      const currentDate = new Date().getTime()
      const diff = Math.abs(currentDate - accessCodeDb.createdAt)

      if (accessCodeDb.code === accessCode && diff <= this.ACCESS_TOKEN_MAX_AGE_MS) {
        return {
          tokens: user.tokens,
          settings: user.settings,
          userData: user.userData
        }
      }
    }

    return undefined
  }
}
