import api from './api'

let cached = null
let cachedAt = 0
const TTL_MS = 60_000

export async function fetchWorkspaceAddons(force = false) {
  const now = Date.now()
  if (!force && cached && now - cachedAt < TTL_MS) return cached
  try {
    const { data } = await api.get('/workspace/addons')
    cached = {
      enabledIds: new Set((data.items || []).map((a) => a.id || a.key)),
      all: data.all || data.items || [],
    }
    cachedAt = now
    return cached
  } catch {
    return null
  }
}

export function isAddonEnabledInWorkspace(addonId, enabledIds) {
  if (!enabledIds) return true
  return enabledIds.has(addonId)
}
