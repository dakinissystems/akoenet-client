const AUTH_URL =
  import.meta.env.VITE_DAKINIS_AUTH_URL ||
  (import.meta.env.PROD ? 'https://auth.dakinissystems.com' : 'http://localhost:4000')

export function buildGoogleOAuthStartUrl(returnTo) {
  const auth = String(AUTH_URL).replace(/\/$/, '')
  const target = returnTo || window.location.origin
  const url = new URL(`${auth}/auth/oauth/google/start`)
  url.searchParams.set('return_to', target)
  url.searchParams.set('product', 'akoenet')
  return url.href
}

export function readPlatformTokenFromLocation() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('platform_token')
  return token && token.length > 20 ? token : null
}

export function clearPlatformTokenFromUrl() {
  const url = new URL(window.location.href)
  ;['platform_token', 'platform_refresh', 'auth', 'product', 'auth_error'].forEach((k) =>
    url.searchParams.delete(k)
  )
  window.history.replaceState({}, '', url.pathname + url.search)
}
