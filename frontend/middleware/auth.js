import { $token } from '~/utils/api'
import { NuxtJsRouteHelper } from '~/store/api/routes'

/**
 * Redirects to login page if valid JWT is not found in memory or JWT is expired
 * @param redirect
 * @param route
 */
export default async function ({
  redirect,
  route
}) {
  // logout route exists only because of this condition here to reset token
  // we redirect immediately to index page here
  if (NuxtJsRouteHelper.isLogoutRoute(route.name)) {
    $token.reset()
    redirect(NuxtJsRouteHelper.getIndexRoute())
  }

  // recover session after page reload
  if (process.browser && sessionStorage.getItem('authToken')) {

    $token.setJwt(sessionStorage.getItem('authToken'))
    $token.setRefreshToken(sessionStorage.getItem('refreshToken'))

    sessionStorage.setItem('authToken', '')
    sessionStorage.setItem('refreshToken', '')
  }

  // refresh token handler for any route change, we refresh token before API calls but we should additionally
  // do that before any route navigation change, user can leave app open for duration higher than jwt validity but
  // shorter than refresh token validity, when he press any link he should not be log out
  if (!NuxtJsRouteHelper.isUnauthenticatedRoute(route.name)) {
    if (!$token.hasValidJwtToken() && $token.hasValidRefreshToken()) {
      await $token.callRefreshTokenEndPoint()
    }
  }

  if (!$token.hasValidJwtToken() &&
    !NuxtJsRouteHelper.isUnauthenticatedRoute(route.name)) {
    redirect(NuxtJsRouteHelper.getDefaultRedirectRoute())
  }
}
