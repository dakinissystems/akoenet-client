const PROFILE_STORAGE_KEY = 'akoenet:desktop:profileKey'

const BUILTIN_DOCK_IDS = new Set(['command-palette', 'activity-center'])

const DEFAULT_DOCK_PINS = ['media-player', 'command-palette', 'activity-center']

/** Presets alineados con projects/workspace/catalog/desktop-layouts.json */
const PRESET_OPENS = {
  gaming: [
    { addonId: 'media-player', windows: ['player', 'friends'] },
    { addonId: 'soundboard', windows: ['favorites', 'hotkeys'] },
  ],
  streaming: [
    { addonId: 'obs-companion', windows: ['scenes', 'streaming', 'chat'] },
    { addonId: 'stream-deck', windows: ['buttons', 'macros'] },
    { addonId: 'media-player', windows: ['mini-player'] },
    { addonId: 'dashboard', windows: ['streams', 'analytics'] },
  ],
  developer: [
    { addonId: 'terminal', windows: ['terminal', 'logs', 'railway'] },
    { addonId: 'devops', windows: ['deployments', 'metrics'] },
    { addonId: 'code-editor', windows: ['explorer', 'editor'] },
    { addonId: 'monitor', windows: ['overview'] },
    { addonId: 'notes', windows: ['editor'] },
  ],
  office: [
    { addonId: 'calendar', windows: ['agenda', 'week'] },
    { addonId: 'kanban', windows: ['boards', 'tasks'] },
    { addonId: 'notes', windows: ['wiki', 'search'] },
    { addonId: 'dashboard', windows: ['widgets'] },
  ],
}

/**
 * @param {string} [profileKey]
 */
export function loadStoredProfileKey(profileKey) {
  if (profileKey) return profileKey
  try {
    return localStorage.getItem(PROFILE_STORAGE_KEY) || null
  } catch {
    return null
  }
}

/**
 * @param {string} profileKey
 */
export function storeProfileKey(profileKey) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, profileKey)
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} baseLayoutId
 */
export function getPresetOpens(baseLayoutId) {
  return PRESET_OPENS[baseLayoutId] || []
}

/**
 * @param {string} baseLayoutId
 */
export function getPresetDockPins(baseLayoutId) {
  const map = {
    gaming: ['media-player', 'command-palette', 'activity-center'],
    streaming: ['obs-companion', 'stream-deck', 'media-player'],
    developer: ['terminal', 'devops', 'monitor', 'ai-actions', 'code-editor'],
    office: ['calendar', 'kanban', 'notes', 'dashboard'],
  }
  return map[baseLayoutId] || DEFAULT_DOCK_PINS
}

/**
 * Resuelve opens[] y dock heredando baseLayout.
 * @param {{ profileKey?: string; baseLayout?: string|null; windowState?: object; dockPins?: string[] }} profile
 * @param {Array<{ profileKey: string; baseLayout?: string|null; windowState?: object; dockPins?: string[] }>} allProfiles
 */
export function resolveProfileLayout(profile, allProfiles = []) {
  if (!profile) {
    return { opens: [], dockPins: DEFAULT_DOCK_PINS, icon: null }
  }

  const ws = profile.windowState && typeof profile.windowState === 'object' ? profile.windowState : {}
  let opens = Array.isArray(ws.opens) ? ws.opens : []
  let dockPins = Array.isArray(profile.dockPins) && profile.dockPins.length ? [...profile.dockPins] : []
  const icon = ws.icon || null

  const baseKey = profile.baseLayout || ws.baseLayout || null
  if (!opens.length && baseKey) {
    const baseProfile = allProfiles.find((p) => p.profileKey === baseKey)
    if (baseProfile) {
      const baseResolved = resolveProfileLayout(baseProfile, allProfiles)
      opens = baseResolved.opens
      if (!dockPins.length) dockPins = baseResolved.dockPins
    } else {
      opens = getPresetOpens(baseKey)
      if (!dockPins.length) dockPins = getPresetDockPins(baseKey)
    }
  }

  if (!dockPins.length) dockPins = DEFAULT_DOCK_PINS

  return { opens, dockPins, icon }
}

/**
 * @param {string} addonId
 */
export function isBuiltinDockItem(addonId) {
  return BUILTIN_DOCK_IDS.has(addonId)
}

/**
 * Primer addon live a abrir al cambiar perfil.
 * @param {Array<{ addonId: string }>} opens
 * @param {(id: string) => string} addonRouteFn
 * @param {(id: string) => boolean} [isImplementedFn]
 */
export function pickPrimaryOpenRoute(opens, addonRouteFn, isImplementedFn) {
  if (!Array.isArray(opens)) return null
  for (const entry of opens) {
    if (isImplementedFn?.(entry.addonId)) return addonRouteFn(entry.addonId)
  }
  const first = opens[0]
  return first ? addonRouteFn(first.addonId) : null
}
