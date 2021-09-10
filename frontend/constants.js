if (process.env.NODE_ENV === 'production') {

}

export default {
  isDevMode: (process.env.NODE_ENV !== 'production'),
  API_URL: 'https://api.awss.ws/v1',
  BASE_URL: 'https://api.awss.ws/v1',
  FACEBOOK_CLIENT_ID: '365798288420194',
  FACEBOOK_REDIRECT_URL: 'https://api.awss.ws/v1/authenticate/oauth-step1',
  GOOGLE_CLIENT_ID: '848226878916-recutqmif2g0kt7f5tcpno2jomihsj3q.apps.googleusercontent.com',
  GOOGLE_REDIRECT_URL: 'https://api.awss.ws/v1/authenticate/oauth-step1'
}
