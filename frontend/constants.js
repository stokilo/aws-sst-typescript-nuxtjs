if (process.env.NODE_ENV === 'production') {

}

export default {
  isDevMode: (process.env.NODE_ENV !== 'production'),
  API_URL: 'https://api.awss.ws/v1',
  BASE_URL: 'https://api.awss.ws/v1',
  FACEBOOK_CLIENT_ID: '',
  FACEBOOK_REDIRECT_URL: 'https://api.awss.ws/v1/authenticate/oauth-step1',
  GOOGLE_CLIENT_ID: '',
  GOOGLE_REDIRECT_URL: 'https://api.awss.ws/v1/authenticate/oauth-step1'
}
