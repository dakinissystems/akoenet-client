/** Shared desktop installer URLs / version for landing + /download. */

const appVersion = typeof __APP_VERSION__ !== 'undefined' ? String(__APP_VERSION__) : ''

export const DESKTOP_LATEST_JSON = '/releases/desktop/latest.json'

export function semverFromInstallerUrl(url) {
  if (!url || typeof url !== 'string') return null
  let path = url
  if (url.includes('://')) {
    try {
      path = new URL(url).pathname
    } catch {
      return null
    }
  }
  const fromFile = path.match(/AkoeNet[_-](\d+\.\d+\.\d+)/i)
  if (fromFile) return fromFile[1]
  const loose = path.match(/(\d+\.\d+\.\d+)/g)
  return loose ? loose[loose.length - 1] : null
}

function windowsUrlFromLatestJson(data) {
  if (!data || typeof data !== 'object') return null
  if (typeof data.url === 'string' && data.url.trim()) return data.url.trim()
  const platforms = data.platforms
  if (!platforms || typeof platforms !== 'object') return null
  const win =
    platforms['windows-x86_64'] ||
    platforms['windows-x86_64-setup'] ||
    platforms['windows'] ||
    null
  if (win && typeof win.url === 'string' && win.url.trim()) return win.url.trim()
  return null
}

/**
 * Build-time / env fallback (used when latest.json is missing or SPA-fallback HTML).
 * @returns {{ url: string, version: string, publishedAt: string | null, source: 'env' }}
 */
export function getStaticDesktopInstaller() {
  const url =
    String(import.meta.env.VITE_DESKTOP_INSTALLER_URL || '').trim() ||
    (appVersion ? `/releases/desktop/AkoeNet_${appVersion}_x64-setup.exe` : '')
  const versionEnv = String(import.meta.env.VITE_DESKTOP_INSTALLER_VERSION || '').trim()
  const version =
    (/^\d+\.\d+\.\d+$/.test(versionEnv) && versionEnv) ||
    semverFromInstallerUrl(url) ||
    appVersion ||
    ''
  return { url, version, publishedAt: null, source: 'env' }
}

export function getWebAppVersion() {
  return appVersion || ''
}

/**
 * Prefer hosted Tauri updater manifest when it returns real JSON.
 * @returns {Promise<{ url: string, version: string, publishedAt: string | null, source: 'latest.json' | 'env' }>}
 */
export async function resolveDesktopInstaller() {
  const fallback = getStaticDesktopInstaller()
  try {
    const res = await fetch(DESKTOP_LATEST_JSON, {
      headers: { Accept: 'application/json' },
      cache: 'no-cache',
    })
    if (!res.ok) return fallback
    const ct = String(res.headers.get('content-type') || '').toLowerCase()
    if (!ct.includes('json') && !ct.includes('text/plain')) return fallback
    const text = await res.text()
    if (!text || text.trimStart().startsWith('<')) return fallback
    const data = JSON.parse(text)
    const url = windowsUrlFromLatestJson(data) || fallback.url
    const version =
      (typeof data.version === 'string' && data.version.replace(/^v/i, '')) ||
      semverFromInstallerUrl(url) ||
      fallback.version
    const publishedAt =
      (typeof data.pub_date === 'string' && data.pub_date) ||
      (typeof data.published_at === 'string' && data.published_at) ||
      null
    return {
      url,
      version: /^\d+\.\d+\.\d+$/.test(version) ? version : fallback.version,
      publishedAt,
      source: 'latest.json',
    }
  } catch {
    return fallback
  }
}

export function formatInstallerDate(iso, locale) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  try {
    return new Intl.DateTimeFormat(locale === 'es' ? 'es' : 'en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch {
    return d.toISOString().slice(0, 10)
  }
}

export function getAndroidDownloadMeta() {
  const playStoreUrl = String(import.meta.env.VITE_ANDROID_PLAY_STORE_URL || '').trim()
  const apkUrl = String(import.meta.env.VITE_ANDROID_APK_URL || '').trim()
  const storeApproved =
    String(import.meta.env.VITE_ANDROID_STORE_APPROVED || '').trim().toLowerCase() === 'true'
  return { playStoreUrl, apkUrl, storeApproved }
}
