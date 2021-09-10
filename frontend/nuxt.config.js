import constants from './constants'
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

console.info('---- nuxt-js isDevMode: ' + constants.isDevMode)
console.info('---- nuxt-js BASE_URL: ' + constants.BASE_URL)
console.info('---- nuxt-js API_URL: ' + constants.API_URL)

export default {
  ssr: true,
  target: 'static',
  router: {
    base: constants.isDevMode ? '/' : '/',
    mode: 'history',
    middleware: 'auth',
    prefetchLinks: false
  },
  /*
  ** Headers of the page
  */
  head: {
    htmlAttrs: {
      lang: 'en'
    },
    titleTemplate: 'SST',
    title: 'SST',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, shrink-to-fit=no' },
      { hid: 'description', name: 'description', content: 'Simple AWS serverless applications, personal blog, NuxtJs Vue Lambda Chalice sandbox.' },
      { hid: 'keywords', name: 'keywords', content: 'SST' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    bodyAttrs: {
      class: 'rounded'
    }
  },
  /*
  ** Customize the progress-bar color
  */
  loadingIndicator: {
    name: 'pulse',
    color: '#3B8070',
    background: 'white'
  },
  /*
  ** Global CSS
  */
  css: [
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    { src: '~/plugins/buefy.js', ssr: true },
    { src: '~/plugins/logger.ts', ssr: true },
    { src: '~/plugins/i18n.js', ssr: true },
    { src: '~/plugins/overlay.ts', ssr: true },
    { src: '~/plugins/axios-accessor.ts', ssr: false },
    { src: '~/plugins/vee-validate.js', ssr: false }
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxt/typescript-build',
    '@aceforth/nuxt-optimized-images'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap'
  ],
  robots: [
    { UserAgent: '*', Disallow: '/api' },
    { UserAgent: '*', Disallow: '/login' },
    { UserAgent: '*', Disallow: '/signup' },
    { UserAgent: '*', Disallow: '/logout' },
    { UserAgent: '*', Disallow: '/app' },
    { Sitemap: `${constants.BASE_URL}/sitemap.xml` }
  ],
  sitemap: {
    hostname: constants.BASE_URL,
    gzip: true,
    exclude: [
      '/api',
      '/api/**',
      '/login',
      '/signup',
      '/logout',
      '/app',
      '/app/**'
    ]
  },
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    baseURL: constants.API_URL
  },
  proxy: {
    '/api': constants.API_URL
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      config.output.publicPath = './_nuxt/'

      if (!config.resolve) {
        config.resolve = {}
      }
      if (!config.resolve.plugins) {
        config.resolve.plugins = []
      }
      config.resolve.plugins.push(new TsconfigPathsPlugin({ configFile: './tsconfig.json' }))
    },
    analyze: false,
    babel: {
      compact: true
    },
    parallel: true,
    cache: true,
    hardSource: constants.isDevMode
  },

  components: false,

  optimizedImages: {
    optimizeImages: true,
    optimizeImagesInDev: false
  },
  env: {
    isDevMode: constants.isDevMode,
    API_URL: constants.API_URL,
    FACEBOOK_CLIENT_ID: constants.FACEBOOK_CLIENT_ID,
    FACEBOOK_REDIRECT_URL: constants.FACEBOOK_REDIRECT_URL,
    GOOGLE_CLIENT_ID: constants.GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URL: constants.GOOGLE_REDIRECT_URL
  }

}
