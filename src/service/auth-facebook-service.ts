import axios from 'axios'
import {
  OAuth2AccessToken,
  OAuth2AccessTokenSchema,
  FacebookUserData,
  FacebookUserDataSchema, faceBookUserDataConverter
} from 'backend-frontend/auth'
import { OAuthService } from './oauth-service'

export default class AuthFacebookService {
  readonly oAuthService: OAuthService

  constructor () {
    this.oAuthService = new OAuthService()
  }

  async onFacebookAuthCallback (code: string): Promise<string> {
    const oAuth2AccessToken = await this.getAccessTokenFromCode(code)
    const userData = await this.getUserData(oAuth2AccessToken.access_token)
    return this.oAuthService.onOAuthStep1(faceBookUserDataConverter(userData))
  }

  async getAccessTokenFromCode (code: string): Promise<OAuth2AccessToken> {
    const { data } = await axios({
      url: 'https://graph.facebook.com/v4.0/oauth/access_token',
      method: 'get',
      params: {
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URL,
        code
      }
    })
    return OAuth2AccessTokenSchema.parse(data)
  }

  async getUserData (accessToken: string): Promise<FacebookUserData> {
    const { data } = await axios({
      url: 'https://graph.facebook.com/me',
      method: 'get',
      params: {
        fields: ['id', 'email', 'first_name', 'last_name'].join(','),
        access_token: accessToken
      }
    })
    return FacebookUserDataSchema.parse(data)
  }
}
