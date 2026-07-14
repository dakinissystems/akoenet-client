import api from '../services/api.js'

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

export async function fetchWorkspaceActivity() {
  try {
    const { data } = await api.get('/workspace/activity')
    return data
  } catch {
    return { items: [], stub: true }
  }
}

export async function fetchWorkspaceDevops() {
  try {
    const { data } = await api.get('/workspace/devops')
    return data
  } catch {
    return { deployments: [], logs: [], infra: null, links: {}, stub: true }
  }
}

export async function fetchWorkspaceMetrics() {
  try {
    const { data } = await api.get('/workspace/metrics')
    return data
  } catch {
    return { local: null, platform: null, stub: true }
  }
}

/**
 * @param {string} q
 * @param {string} [scope='all']
 * @param {{ signal?: AbortSignal }} [options]
 */
export async function fetchWorkspaceSearchHits(q, scope = 'all', options = {}) {
  try {
    const params = new URLSearchParams({
      q: String(q || '').trim(),
      scope: String(scope || 'all'),
    })
    const { data } = await api.get(`/workspace/search?${params}`, {
      signal: options.signal,
    })
    return data?.hits || []
  } catch {
    return []
  }
}

export function isAddonEnabledInWorkspace(addonId, enabledIds) {
  if (!enabledIds) return true
  return enabledIds.has(addonId)
}
