import api from '../services/api.js'

const softFail = { validateStatus: (s) => s < 500 }

/** @type {Map<string, number | null>} */
const revisionByAddon = new Map()

/**
 * @param {'kanban'|'calendar'|'notes'} addonKey
 */
export async function fetchAddonData(addonKey) {
  const res = await api.get(`/workspace/data/${encodeURIComponent(addonKey)}`, softFail)
  if (res.status >= 400) return null
  if (res.data?.revision != null) {
    revisionByAddon.set(addonKey, Number(res.data.revision))
  }
  return res.data
}

/**
 * @param {'kanban'|'calendar'|'notes'} addonKey
 * @param {object} payload
 */
export async function saveAddonData(addonKey, payload) {
  const body = { data: payload }
  if (revisionByAddon.has(addonKey)) {
    const rev = revisionByAddon.get(addonKey)
    if (rev != null) body.revision = rev
  }

  const res = await api.put(
    `/workspace/data/${encodeURIComponent(addonKey)}`,
    body,
    softFail
  )
  if (res.status >= 400) return { stored: false, stub: true }
  if (res.data?.revision != null) {
    revisionByAddon.set(addonKey, Number(res.data.revision))
  }
  return res.data
}
