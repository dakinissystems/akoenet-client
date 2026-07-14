import api from '../services/api.js'

const softFail = { validateStatus: (s) => s < 500 }

/**
 * @param {'kanban'|'calendar'|'notes'} addonKey
 */
export async function fetchAddonData(addonKey) {
  const res = await api.get(`/workspace/data/${encodeURIComponent(addonKey)}`, softFail)
  if (res.status >= 400) return null
  return res.data
}

/**
 * @param {'kanban'|'calendar'|'notes'} addonKey
 * @param {object} payload
 */
export async function saveAddonData(addonKey, payload) {
  const res = await api.put(
    `/workspace/data/${encodeURIComponent(addonKey)}`,
    { data: payload },
    softFail
  )
  if (res.status >= 400) return { stored: false, stub: true }
  return res.data
}
