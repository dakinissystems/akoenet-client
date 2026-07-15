import catalog from './catalog.json'
import { ADDON_ID_TO_FLAG } from './featureFlagKeys.js'

const CATEGORY_I18N = {
  system: { en: 'System', es: 'Sistema' },
  productivity: { en: 'Productivity', es: 'Productividad' },
  developer: { en: 'Developer', es: 'Desarrollo' },
  stream: { en: 'Streaming', es: 'Streaming' },
  media: { en: 'Media', es: 'Media' },
  entertainment: { en: 'Entertainment', es: 'Entretenimiento' },
}

/** Addons with a real UI route — auto from manifest.json via addonLoader */
export { IMPLEMENTED_ADDON_ROUTES } from './addonLoader.js'

/** @type {Set<string> | null} */
let enabledFilter = null

/** @type {Record<string, boolean> | null} */
let featureFlags = null

export function setWorkspaceEnabledFilter(ids) {
  if (!ids) {
    enabledFilter = null
    return
  }
  enabledFilter = ids instanceof Set ? ids : new Set(ids)
}

export function setWorkspaceFeatureFlags(flags) {
  featureFlags = flags && typeof flags === 'object' ? flags : null
}

export function listCatalogAddons() {
  const all = [...(catalog.addons || [])].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
  return all.filter((addon) => {
    if (enabledFilter && !enabledFilter.has(addon.id)) return false
    if (featureFlags) {
      const flagKey = ADDON_ID_TO_FLAG[addon.id] || `workspace.addon.${addon.id}`
      if (flagKey in featureFlags && !featureFlags[flagKey]) return false
    }
    return true
  })
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
