const HUB_BASE = String(import.meta.env.VITE_DAKINIS_CORPORATE_URL || 'https://dakinissystems.com').replace(
  /\/$/,
  ''
)

/**
 * Normaliza rutas de mensajes indexados con formato legacy.
 * @param {string} path
 */
export function normalizeAkoenetPath(path) {
  const raw = String(path || '').trim()
  if (!raw) return null

  const legacy = raw.match(/^\/servers?\/(\d+)\/channels\/(\d+)(?:\?(.+))?$/)
  if (legacy) {
    const [, serverId, channelId, qs] = legacy
    const params = new URLSearchParams(qs || '')
    if (!params.has('channel')) params.set('channel', channelId)
    return `/server/${serverId}?${params.toString()}`
  }

  if (raw.startsWith('/server/')) return raw
  return raw
}

/**
 * @param {{ scope?: string; id?: string; title?: string; path?: string; product?: string; external?: boolean; metadata?: { path?: string; product?: string } }} hit
 */
export function resolveAkoenetSearchHitPath(hit) {
  if (hit?.external && hit?.path) {
    return { href: hit.path, external: true }
  }

  const explicit = hit?.path || hit?.metadata?.path
  if (explicit) {
    const normalized = normalizeAkoenetPath(explicit)
    if (normalized?.startsWith('http')) return { href: normalized, external: true }
    if (normalized?.startsWith('/')) return { route: normalized, external: false }
  }

  const product = String(hit?.product || hit?.metadata?.product || '').toLowerCase()
  if (product === 'akoenet') return { route: '/messages', external: false }
  if (product === 'streamautomator') {
    if (hit?.path || hit?.metadata?.path) {
      const path = hit.path || hit.metadata.path
      return { href: path.startsWith('http') ? path : `https://streamautomator.com${path}`, external: true }
    }
    return { href: 'https://streamautomator.com/director', external: true }
  }
  if (product === 'lifeflow') {
    const lf = hit?.path || hit?.metadata?.path || 'https://finance.dakinissystems.com'
    return { href: lf.startsWith('http') ? lf : `https://finance.dakinissystems.com${lf}`, external: true }
  }
  if (product === 'core') return { href: `${HUB_BASE}/core`, external: true }
  if (product === 'hub' || product === 'lifeflow' || product === 'ai') {
    return { href: `${HUB_BASE}/hub`, external: true }
  }

  const scope = hit?.scope || 'global'
  if (scope === 'knowledge' || scope === 'documentation') {
    return { href: `${HUB_BASE}/faq?q=${encodeURIComponent(hit?.title || '')}`, external: true }
  }
  if (scope === 'messages' || scope === 'chats') return { route: '/messages', external: false }

  return null
}
