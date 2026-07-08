import api from './api'

/**
 * @returns {Promise<{ items: import('../hooks/useServerAssistantModules').AssistantModuleRow[]; configured?: boolean; warning?: string|null }>}
 */
export async function fetchServerAssistantModules(serverId) {
  const { data } = await api.get(`/servers/${serverId}/assistant/modules`)
  return data
}

export async function setServerAssistantModule(serverId, moduleKey, { enabled, config }) {
  const { data } = await api.put(`/servers/${serverId}/assistant/modules/${encodeURIComponent(moduleKey)}`, {
    enabled,
    config: config || {},
  })
  return data
}
