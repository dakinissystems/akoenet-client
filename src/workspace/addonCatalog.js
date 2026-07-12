import catalog from './catalog.json'

const CATEGORY_I18N = {
  system: { en: 'System', es: 'Sistema' },
  productivity: { en: 'Productivity', es: 'Productividad' },
  developer: { en: 'Developer', es: 'Desarrollo' },
  stream: { en: 'Streaming', es: 'Streaming' },
  media: { en: 'Media', es: 'Media' },
  entertainment: { en: 'Entertainment', es: 'Entretenimiento' },
}

/** Addons with a real UI route today */
export const IMPLEMENTED_ADDON_ROUTES = {
  'media-player': '/media',
}

/** @type {Set<string> | null} */
let enabledFilter = null

export function setWorkspaceEnabledFilter(ids) {
  if (!ids) {
    enabledFilter = null
    return
  }
  enabledFilter = ids instanceof Set ? ids : new Set(ids)
}

export function listCatalogAddons() {
  const all = [...(catalog.addons || [])].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
  if (!enabledFilter) return all
  return all.filter((a) => enabledFilter.has(a.id))
}

export function getAddonById(id) {
  return listCatalogAddons().find((a) => a.id === id) || null
}

export function addonLabel(addon, locale = 'es') {
  return addon?.i18n?.name?.[locale] || addon?.i18n?.name?.en || addon?.id || ''
}

export function addonDescription(addon, locale = 'es') {
  return addon?.i18n?.description?.[locale] || addon?.i18n?.description?.en || ''
}

export function categoryLabel(category, locale = 'es') {
  return CATEGORY_I18N[category]?.[locale] || category || ''
}

export function addonRoute(addonId) {
  if (IMPLEMENTED_ADDON_ROUTES[addonId]) return IMPLEMENTED_ADDON_ROUTES[addonId]
  return `/workspace/${encodeURIComponent(addonId)}`
}

export function isAddonImplemented(addonId) {
  return Boolean(IMPLEMENTED_ADDON_ROUTES[addonId])
}

export function addonsByCategory(locale = 'es') {
  /** @type {Record<string, typeof catalog.addons>} */
  const groups = {}
  for (const addon of listCatalogAddons()) {
    const cat = addon.category || 'system'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(addon)
  }
  return Object.entries(groups).map(([category, items]) => ({
    category,
    label: categoryLabel(category, locale),
    items,
  }))
}

export function buildCommandItems(locale = 'es') {
  return listCatalogAddons().map((addon) => ({
    id: `addon-${addon.id}`,
    label: addonLabel(addon, locale),
    keywords: [addon.id, addon.category, addonLabel(addon, 'en'), addonLabel(addon, 'es')],
    route: addonRoute(addon.id),
    phase: addon.phase,
  }))
}
