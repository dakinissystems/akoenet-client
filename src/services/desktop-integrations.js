import { listen } from '@tauri-apps/api/event'
import { getCurrent } from '@tauri-apps/plugin-deep-link'
import { isTauri } from '../lib/isTauri.js'
import { resolveMobileAppUrlToRoute } from '../lib/mobile-deep-links.js'
import { postAuthDestination } from '../lib/postAuthDestination.js'
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from './session-store.js'

const TWITCH_OAUTH_ERR_KEY = 'akoenet_twitch_oauth_error'

function parseTwitchOAuthFromRoute(route) {
  if (!route?.startsWith('/auth/twitch/callback')) return null
  const q = route.includes('?') ? route.slice(route.indexOf('?') + 1) : ''
  const p = new URLSearchParams(q)
  return {
    token: p.get('token') || p.get('twitch_token'),
    refresh: p.get('refresh_token'),
    error: p.get('error') || p.get('twitch_error'),
  }
}

function parseTwitchOAuthFromUrls(urls) {
  if (!Array.isArray(urls)) return null
  for (const url of urls) {
    const route = resolveMobileAppUrlToRoute(url)
    const parsed = parseTwitchOAuthFromRoute(route)
    if (parsed) return parsed
  }
  return null
}

/**
 * Completes Twitch native OAuth in the desktop shell (no /auth/twitch/callback hop).
 * @param {{ token?: string | null, refresh?: string | null, error?: string | null }} payload
 * @param {{ navigate: (to: string | { pathname: string, search?: string }, opts?: object) => void, loginWithToken: (token: string, refresh?: string | null) => Promise<object> }} ctx
 */
export async function completeDesktopTwitchOAuth(payload, { navigate, loginWithToken }) {
  const { token, refresh, error } = payload || {}
  if (error) {
    try {
      sessionStorage.setItem(TWITCH_OAUTH_ERR_KEY, error)
    } catch {
      /* ignore */
    }
    navigate('/login', { replace: true })
    return
  }

  const access = token || getAccessToken()
  if (!access) {
    navigate('/login', { replace: true })
    return
  }

  if (refresh) setRefreshToken(refresh)

  try {
    const me = await loginWithToken(access, refresh || getRefreshToken())
    navigate(postAuthDestination(me), { replace: true })
  } catch {
    try {
      sessionStorage.setItem(TWITCH_OAUTH_ERR_KEY, 'twitch_auth_failed')
    } catch {
      /* ignore */
    }
    navigate('/login', { replace: true })
  }
}

let lastDeepLinkKey = ''

async function handleDeepLinkUrls(urls, ctx) {
  const oauth = parseTwitchOAuthFromUrls(urls)
  if (!oauth) {
    for (const url of urls || []) {
      const route = resolveMobileAppUrlToRoute(url)
      if (route && typeof ctx?.navigate === 'function') {
        ctx.navigate(route)
      }
    }
    return
  }

  const key = `${oauth.token || ''}|${oauth.error || ''}|${oauth.refresh || ''}`
  if (key && key === lastDeepLinkKey) return
  lastDeepLinkKey = key

  if (oauth.token) setAccessToken(oauth.token)
  if (oauth.refresh) setRefreshToken(oauth.refresh)

  if (typeof ctx?.loginWithToken === 'function' && typeof ctx?.navigate === 'function') {
    await completeDesktopTwitchOAuth(oauth, ctx)
    return
  }

  if (oauth.token) setAccessToken(oauth.token)
}

/** Cold start: persist tokens; AuthProvider refreshUser will load the session. */
export async function consumeTauriDeepLinksOnBootstrap() {
  if (!isTauri()) return
  try {
    const urls = await getCurrent()
    if (!urls?.length) return
    const oauth = parseTwitchOAuthFromUrls(urls)
    if (oauth?.token) setAccessToken(oauth.token)
    if (oauth?.refresh) setRefreshToken(oauth.refresh)
  } catch {
    /* ignore */
  }
}

/**
 * @param {{ navigate: Function, loginWithToken: Function }} ctx
 */
export async function initDesktopIntegrations(ctx) {
  if (!isTauri() || typeof ctx?.navigate !== 'function' || typeof ctx?.loginWithToken !== 'function') {
    return () => {}
  }

  try {
    const startUrls = await getCurrent()
    if (startUrls?.length) {
      await handleDeepLinkUrls(startUrls, ctx)
    }

    const unlisten = await listen('deep-link://new-url', (event) => {
      const urls = event?.payload
      void handleDeepLinkUrls(urls, ctx)
    })

    return () => {
      try {
        unlisten()
      } catch {
        /* ignore */
      }
    }
  } catch {
    return () => {}
  }
}
