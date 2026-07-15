import api from '../services/api.js'
import { DEFAULT_EVAL_KEYS } from './featureFlagKeys.js'

let cached = null
let cachedAt = 0
const TTL_MS = 60_000

/**
 * @param {{ keys?: string[], workspaceId?: string, force?: boolean }} [opts]
 */
export async function fetchWorkspaceFeatureFlags(opts = {}) {
  const now = Date.now()
  if (!opts.force && cached && now - cachedAt < TTL_MS) return cached

  const params = new URLSearchParams()
  const keys = opts.keys?.length ? opts.keys : DEFAULT_EVAL_KEYS
  params.set('keys', keys.join(','))
  if (opts.workspaceId) params.set('workspaceId', opts.workspaceId)

  try {
    const { data } = await api.get(`/workspace/feature-flags?${params.toString()}`)
    cached = {
      flags: data?.flags || {},
      stub: Boolean(data?.stub),
    }
    cachedAt = now
    return cached
  } catch {
    return { flags: {}, stub: true }
  }
}

export function clearFeatureFlagsCache() {
  cached = null
  cachedAt = 0
}

/**
 * @param {Record<string, boolean>} flags
 * @param {string} addonId
 */
export function isAddonFlagEnabled(flags, addonId) {
  const key = `workspace.addon.${addonId}`
  if (!(key in flags)) return true
  return Boolean(flags[key])
}
