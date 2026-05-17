import { isTauri } from '../lib/isTauri.js'
import { resolveMobileAppUrlToRoute } from '../lib/mobile-deep-links.js'
import { setAccessToken, setRefreshToken } from './session-store.js'

export function persistTokensFromOAuthRoute(route) {
  if (!route?.startsWith('/auth/twitch/callback')) return
  const q = route.includes('?') ? route.slice(route.indexOf('?') + 1) : ''
  const p = new URLSearchParams(q)
  const token = p.get('token')
  const refresh = p.get('refresh_token')
  if (token) setAccessToken(token)
  if (refresh) setRefreshToken(refresh)
}

function handleDeepLinkUrls(urls, navigate) {
  if (!Array.isArray(urls)) return false
  for (const url of urls) {
    const route = resolveMobileAppUrlToRoute(url)
    if (!route) continue
    persistTokensFromOAuthRoute(route)
    if (typeof navigate === 'function') navigate(route)
    return true
  }
  return false
}

/** Runs before React mount so a cold-start deep link still hydrates the session. */
export async function consumeTauriDeepLinksOnBootstrap() {
  if (!isTauri()) return
  try {
    const { getCurrent } = await import('@tauri-apps/plugin-deep-link')
    const urls = await getCurrent()
    if (urls?.length) handleDeepLinkUrls(urls, null)
  } catch {
    /* ignore */
  }
}

export async function initDesktopIntegrations(navigate) {
  if (!isTauri() || typeof navigate !== 'function') return () => {}
  try {
    const { getCurrent, onOpenUrl } = await import('@tauri-apps/plugin-deep-link')
    const startUrls = await getCurrent()
    if (startUrls?.length) handleDeepLinkUrls(startUrls, navigate)

    const unlisten = await onOpenUrl((urls) => {
      handleDeepLinkUrls(urls, navigate)
    })
    return () => {
      try {
        unlisten?.()
      } catch {
        /* ignore */
      }
    }
  } catch {
    return () => {}
  }
}
