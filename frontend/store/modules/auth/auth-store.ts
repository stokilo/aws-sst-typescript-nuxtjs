import queryString from 'querystring'
import { action, createModule, getter, mutation } from 'vuex-class-component'
import { OAuthStep2Response, OAuthStep2ResponseSchema, UserData, UserSettings } from '@backend/auth'
import AxiosService from '~/store/api/axios-service'
import { $log, $token } from '~/utils/api'

export const VuexModule = createModule({
  namespaced: 'authStore',
  strict: false,
  target: 'nuxt'
})

export class AuthStore extends VuexModule {
  facebookLoginUrl: string = ''
  googleLoginUrl: string = ''

  settings: UserSettings = { darkMode: true }

  userData: UserData = {
    email: '',
    firstName: '',
    lastName: ''
  }

  @mutation mutateGoogleLoginUrl (googleLoginUrl: string) {
    this.googleLoginUrl = googleLoginUrl
  }

  @mutation mutateFacebookLoginUrl (facebookLoginUrl: string) {
    this.facebookLoginUrl = facebookLoginUrl
  }

  @mutation mutateUserData (userDate: UserData) {
    this.userData = userDate
  }

  @mutation mutateSettings (settings: UserSettings) {
    this.settings = settings
  }

  get isLogin () {
    return $token.hasValidJwtToken()
  }

  @action
  async onMounted () {
    const facebookParams = queryString.stringify({
      client_id: process.env.FACEBOOK_CLIENT_ID,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URL,
      scope: ['email', 'user_friends'].join(','),
      response_type: 'code',
      auth_type: 'rerequest',
      display: 'popup'
    })

    this.mutateFacebookLoginUrl(`https://www.facebook.com/v4.0/dialog/oauth?${facebookParams}`)

    const googleParams = queryString.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URL,
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    })

    this.mutateGoogleLoginUrl(`https://accounts.google.com/o/oauth2/v2/auth?${googleParams}`)
  }

  @action
  async onAccessCodeReceived (accessCode: string) {
    const axiosService = new AxiosService()
    const response = await axiosService.$get<OAuthStep2Response, typeof OAuthStep2ResponseSchema>(
      '/authenticate/oauth-step2', OAuthStep2ResponseSchema, { accessCode })

    if (response && response.tokens) {
      const { tokens, settings, userData } = response
      $token.setJwt(tokens.authToken)
      $token.setRefreshToken(tokens.refreshToken)

      sessionStorage.setItem('settings', JSON.stringify(settings))
      sessionStorage.setItem('userData', JSON.stringify(userData))

      this.mutateSettings(settings)
      this.mutateUserData(userData)

      return true
    }
    return false
  }
}
