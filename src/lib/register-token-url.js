/** 64-char hex token issued by POST /auth/register/start */
const REGISTRATION_TOKEN_RE = /^[a-f0-9]{64}$/i

function normalizeRegistrationToken(raw) {
  const t = String(raw || '').trim()
  return REGISTRATION_TOKEN_RE.test(t) ? t : ''
}

/**
 * Reads registration token from query or hash (HashRouter emails use #/register/complete?token=…).
 */
export function getRegistrationTokenFromLocation(loc = typeof window !== 'undefined' ? window.location : null) {
  if (!loc) return ''
  const fromSearch = normalizeRegistrationToken(new URLSearchParams(loc.search || '').get('token'))
  if (fromSearch) return fromSearch

  const hash = String(loc.hash || '')
  const qi = hash.indexOf('?')
  if (qi >= 0) {
    return normalizeRegistrationToken(new URLSearchParams(hash.slice(qi + 1)).get('token'))
  }
  return ''
}
