/**
 * Login contra IdP central (platform/auth) + exchange en AkoeNet API.
 */

const IDP_REFRESH_KEY = 'idp_refresh_token'
const IDP_ACCESS_KEY = 'idp_access_token'

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

export function getIdpAccessToken() {
  try {
    return sessionStorage.getItem(IDP_ACCESS_KEY) || ''
  } catch {
    return ''
  }
}

export function setIdpAccessToken(token) {
  try {
    const value = String(token || '').trim()
    if (value && value.split('.').length === 3) sessionStorage.setItem(IDP_ACCESS_KEY, value)
    else sessionStorage.removeItem(IDP_ACCESS_KEY)
  } catch {
    /* ignore */
  }
}

export async function registerViaIdp(email, password) {
  const base = getIdpAuthUrl()
  if (!base) throw new Error('VITE_DAKINIS_AUTH_URL not configured')

  const res = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'IdP register failed')
    err.response = { status: res.status, data }
    throw err
  }
  return data
}

export async function loginViaIdp(email, password) {
  const base = getIdpAuthUrl()
  if (!base) throw new Error('VITE_DAKINIS_AUTH_URL not configured')

  const res = await fetch(`${base}/auth/login`, {
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

async function refreshIdpToken(refreshToken) {
  const base = getIdpAuthUrl()
  const res = await fetch(`${base}/auth/refresh`, {
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

function idpAccessStillValid(token) {
  const parts = String(token || '').split('.')
  if (parts.length !== 3) return false
  try {
    const json = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof json.exp !== 'number' || json.exp * 1000 > Date.now() + 30_000
  } catch {
    return false
  }
}

/** Recupera el access token de Auth para reenviarlo. No crea uno nuevo. */
export async function ensureIdpAccessToken() {
  const current = getIdpAccessToken()
  if (idpAccessStillValid(current)) return current
  const refreshToken = getIdpRefreshToken()
  if (!refreshToken) return ''
  const data = await refreshIdpToken(refreshToken)
  if (data.refreshToken) setIdpRefreshToken(data.refreshToken)
  const next = data.token || data.accessToken || ''
  setIdpAccessToken(next)
  return getIdpAccessToken()
}

export async function exchangePlatformToken(api, platformAccessToken) {
  const { data } = await api.post(
    '/auth/exchange',
    {},
    { headers: { Authorization: `Bearer ${platformAccessToken}` } }
  )
  return data
}

async function logoutIdp(refreshToken) {
  const base = getIdpAuthUrl()
  if (!base || !refreshToken) return
  try {
    await fetch(`${base}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    /* best effort */
  }
}
