import api from '../services/api.js'

/**
 * @param {'kanban'|'calendar'|'notes'} addonKey
 */
export async function fetchAddonData(addonKey) {
  const { data } = await api.get(`/workspace/data/${encodeURIComponent(addonKey)}`)
  return data
}

/**
 * @param {'kanban'|'calendar'|'notes'} addonKey
 * @param {object} payload
 */
export async function saveAddonData(addonKey, payload) {
  const { data } = await api.put(`/workspace/data/${encodeURIComponent(addonKey)}`, { data: payload })
  return data
}
