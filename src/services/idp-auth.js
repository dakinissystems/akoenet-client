/**
 * Login contra IdP central (platform/auth) + exchange en AkoeNet API.
 */

const IDP_REFRESH_KEY = 'idp_refresh_token'

export function getIdpAuthUrl() {
  const raw =
    import.meta.env.VITE_DAKINIS_AUTH_URL ||
    import.meta.env.VITE_AUTH_URL ||
    ''
  return String(raw).replace(/\/$/, '')
}

export function isIdpAuthEnabled() {
  const url = getIdpAuthUrl()
  if (!url) return false
  if (import.meta.env.VITE_USE_IDP_AUTH === 'false') return false
  return true
}

export function getIdpRefreshToken() {
  try {
    return localStorage.getItem(IDP_REFRESH_KEY)
  } catch {
    return null
  }
}

export function setIdpRefreshToken(token) {
  try {
    if (token) localStorage.setItem(IDP_REFRESH_KEY, token)
    else localStorage.removeItem(IDP_REFRESH_KEY)
  } catch {
    /* ignore */
  }
}

export async function loginViaIdp(email, password) {
  const base = getIdpAuthUrl()
  if (!base) throw new Error('VITE_DAKINIS_AUTH_URL not configured')

  const res = await fetch(`${base}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'IdP login failed')
    err.response = { status: res.status, data }
    throw err
  }
  return data
}

export async function refreshIdpToken(refreshToken) {
  const base = getIdpAuthUrl()
  const res = await fetch(`${base}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'IdP refresh failed')
    err.response = { status: res.status, data }
    throw err
  }
  return data
}

export async function exchangePlatformToken(api, platformAccessToken) {
  const { data } = await api.post(
    '/auth/exchange',
    {},
    { headers: { Authorization: `Bearer ${platformAccessToken}` } }
  )
  return data
}

export async function logoutIdp(refreshToken) {
  const base = getIdpAuthUrl()
  if (!base || !refreshToken) return
  try {
    await fetch(`${base}/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    /* best effort */
  }
}
