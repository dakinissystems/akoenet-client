/** Auto-discovered live addons via Vite import.meta.glob */

const manifestGlob = import.meta.glob('../modules/*/manifest.json', { eager: true })
export const rootGlob = import.meta.glob('../modules/*/*Root.jsx')

const discovered = parseManifestGlob(manifestGlob)

/** @type {Record<string, string>} */
export const IMPLEMENTED_ADDON_ROUTES = buildRouteMapFromManifests(discovered)

/**
 * @param {Record<string, { default?: object } | object>} glob
 */
function parseManifestGlob(glob) {
  const items = []
  for (const [filePath, mod] of Object.entries(glob)) {
    const manifest = mod?.default ?? mod
    const match = filePath.match(/\/modules\/([^/]+)\/manifest\.json$/)
    const folder = match?.[1] || manifest?.id
    if (!manifest?.id) continue
    items.push({ id: manifest.id, folder, manifest, manifestPath: filePath })
  }
  return items.sort((a, b) => a.id.localeCompare(b.id))
}

/**
 * @param {ReturnType<typeof parseManifestGlob>} items
 */
function buildRouteMapFromManifests(items) {
  /** @type {Record<string, string>} */
  const routes = {}
  for (const item of items) {
    if (item.manifest.route) routes[item.id] = item.manifest.route
  }
  return routes
}

/**
 * @param {string} addonId
 */
export function lazyAddonRoot(addonId) {
  const key = Object.keys(rootGlob).find(
    (k) => k.includes(`/modules/${addonId}/`) && /Root\.jsx$/.test(k),
  )
  return key ? rootGlob[key] : null
}

export function listDiscoveredAddons() {
  return discovered
}

/**
 * @param {string} addonId
 */
export function getManifestById(addonId) {
  return discovered.find((d) => d.id === addonId)?.manifest ?? null
}
