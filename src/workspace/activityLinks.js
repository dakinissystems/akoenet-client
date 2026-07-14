const HUB_BASE = String(
  import.meta.env.VITE_DAKINIS_CORPORATE_URL || 'https://dakinissystems.com'
).replace(/\/$/, '')

const PRODUCT_EXTERNAL = {
  streamautomator: 'https://streamautomator.com/director',
  core: `${HUB_BASE}/core`,
  hub: `${HUB_BASE}/hub`,
  lifeflow: `${HUB_BASE}/lifeflow`,
  ai: `${HUB_BASE}/hub`,
}

const PRODUCT_INTERNAL = {
  akoenet: '/messages',
}

/**
 * @param {{ product?: string; eventType?: string; action?: string; href?: string }} item
 */
export function resolveActivityHref(item) {
  if (item?.href) return item.href
  const product = String(item?.product || '').toLowerCase()
  if (PRODUCT_INTERNAL[product]) return PRODUCT_INTERNAL[product]
  if (PRODUCT_EXTERNAL[product]) return PRODUCT_EXTERNAL[product]
  const type = String(item?.eventType || item?.action || '').toLowerCase()
  if (type.includes('stream')) return PRODUCT_EXTERNAL.streamautomator
  if (type.includes('invoice') || type.includes('order') || type.includes('customer')) {
    return PRODUCT_EXTERNAL.core
  }
  if (type.startsWith('ai.') || type.includes('assistant')) return PRODUCT_EXTERNAL.hub
  return null
}

/**
 * @param {{ product?: string; eventType?: string; action?: string; href?: string }} item
 */
export function isExternalActivityHref(item) {
  const href = resolveActivityHref(item)
  return Boolean(href && /^https?:\/\//i.test(href))
}
