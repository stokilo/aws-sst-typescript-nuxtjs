import axios from 'axios'
import {
  OAuth2AccessToken,
  OAuth2AccessTokenSchema,
  googleUserDataConverter, GoogleUserData, GoogleUserDataSchema
} from 'backend-frontend/auth'
import { OAuthService } from './oauth-service'

export default class AuthGoogleService {
  readonly oAuthService: OAuthService

  constructor () {
    this.oAuthService = new OAuthService()
  }

  async onGoogleAuthCallback (code: string): Promise<string> {
    const oAuthAccessToken = await this.getAccessTokenFromCode(code)
    const userData = await this.getUserData(oAuthAccessToken.access_token)
    return this.oAuthService.onOAuthStep1(googleUserDataConverter(userData))
  }

  async getAccessTokenFromCode (code: string): Promise<OAuth2AccessToken> {
    const { data } = await axios({
      url: 'https://oauth2.googleapis.com/token',
      method: 'post',
      params: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URL,
        grant_type: 'authorization_code',
        code
      }
    })
    return OAuth2AccessTokenSchema.parse(data)
  }

  async getUserData (accessToken: string): Promise<GoogleUserData> {
    const { data } = await axios({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo',
      method: 'get',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    return GoogleUserDataSchema.parse(data)
  }
}
