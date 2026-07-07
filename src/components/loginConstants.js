const SESSION_NOTICE_KEY = 'akoenet_session_notice'
const LEGACY_SESSION_NOTICE_KEYS = ['akonet_session_notice', 'Akonet_session_notice']
export const PENDING_INVITE_KEY = 'akoenet_pending_invite'

export function consumeSessionNotice() {
  if (typeof window === 'undefined') return ''
  try {
    let msg = localStorage.getItem(SESSION_NOTICE_KEY)
    if (!msg) {
      for (const k of LEGACY_SESSION_NOTICE_KEYS) {
        msg = localStorage.getItem(k)
        if (msg) break
      }
    }
    if (!msg) return ''
    localStorage.removeItem(SESSION_NOTICE_KEY)
    LEGACY_SESSION_NOTICE_KEYS.forEach((k) => localStorage.removeItem(k))
    return msg
  } catch {
    return ''
  }
}

export function readPendingInviteFromSession() {
  try {
    return sessionStorage.getItem(PENDING_INVITE_KEY)
  } catch {
    return null
  }
}
