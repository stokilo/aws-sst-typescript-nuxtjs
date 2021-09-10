/**
 * API routes
 */
export enum SERVER_API_ROUTES {
  OAUTH_STEP1 = 'authenticate/oauth-step1',
  OAUTH_STEP2 = 'authenticate/oauth-step2',
  OAUTH_REFRESH_TOKEN = 'authenticate/oauth-refresh-token',
  ROUTE_CONTACT = 'contact',
  ROUTE_LOGOUT = 'logout'
}

export class NuxtJsRouteHelper {
  /**
   * Check if nuxtjs route provided as argument can be accessed without valid auth tokens
   * @param nuxtRouteName this is nuxt route name generated from pages/ folder structure
   */
  static isUnauthenticatedRoute (nuxtRouteName: string): boolean {
    return nuxtRouteName === this.getIndexRoute() ||
      nuxtRouteName === 'not-found' ||
      nuxtRouteName === 'index'
  }

  /**
   * Check if API route provided as argument can be called without auth tokens
   * @param apiRoute this is path for our app API call
   */
  static isUnauthenticatedApiRoute (apiRoute: string): boolean {
    return apiRoute === SERVER_API_ROUTES.OAUTH_STEP1 ||
      apiRoute === SERVER_API_ROUTES.OAUTH_STEP2 ||
      apiRoute === SERVER_API_ROUTES.OAUTH_REFRESH_TOKEN
  }

  static isLogoutRoute (route: string): boolean {
    return route === SERVER_API_ROUTES.ROUTE_LOGOUT
  }

  /**
   * return main page route
   */
  static getIndexRoute (): string {
    return '/'
  }

  /**
   * return route that user should see in case something went wrong
   */
  static getDefaultRedirectRoute (): string {
    return '/'
  }

  /**
   * return route for the app that requires authenticated access
   */
  static getDefaultAppRoute (): string {
    return '/contact'
  }
}
