import { startSessionKeepAlive, stopSessionKeepAlive } from '../services/api'
import { connectAkoeNet, disconnectAkoeNet } from '../services/socket'
import { setAccessToken, setRefreshToken } from '../services/session-store'
import { setIdpRefreshToken } from '../services/idp-auth'

const SESSION_NOTICE_KEY = 'akoenet_session_notice'

/** True when the browser got no HTTP response (server down, restarting, wrong port, etc.). */
export function isUnreachableApiError(err) {
  if (!err) return false
  const code = err.code
  if (code === 'ERR_NETWORK' || code === 'ECONNABORTED' || code === 'ECONNREFUSED') return true
  if (err.message === 'Network Error') return true
  const msg = String(err.message || '')
  if (msg.includes('CONNECTION_REFUSED') || msg.includes('Failed to fetch')) return true
  return !err.response
}

/** 5xx / rate-limit: do not clear tokens; backend may be cold or saturated. */
export function isTransientServerError(err) {
  const s = err?.response?.status
  if (s == null) return false
  if (s >= 500 && s <= 599) return true
  if (s === 429 || s === 408) return true
  return false
}

export function applyAuthenticatedSession(user, token) {
  setAccessToken(token)
  if (!user?.needs_terms_acceptance) {
    connectAkoeNet(token)
    startSessionKeepAlive()
  } else {
    stopSessionKeepAlive()
    disconnectAkoeNet()
  }
}

export function storeLoginTokens(data) {
  setAccessToken(data.token)
  if (data.refresh_token) setRefreshToken(data.refresh_token)
}

export function clearIdpRefreshToken() {
  setIdpRefreshToken(null)
}

export function disconnectLiveSession() {
  stopSessionKeepAlive()
  disconnectAkoeNet()
}

export function writeSessionExpiredNotice() {
  localStorage.setItem(
    SESSION_NOTICE_KEY,
    'Your session expired due to a security update. Please sign in again.'
  )
}
