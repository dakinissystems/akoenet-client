import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchServerAssistantModules, setServerAssistantModule } from '../services/assistant-modules'

/**
 * @typedef {Object} AssistantModuleRow
 * @property {string} key
 * @property {string} name
 * @property {string} [description]
 * @property {string} category
 * @property {string} phase
 * @property {boolean} enabled
 * @property {Record<string, unknown>} [config]
 */

const CATEGORY_ORDER = ['moderation', 'ai', 'community', 'stream', 'automation', 'developer', 'business', 'entertainment']

export function groupModulesByCategory(items) {
  /** @type {Record<string, AssistantModuleRow[]>} */
  const groups = {}
  for (const mod of items) {
    const cat = mod.category || 'system'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(mod)
  }
  return CATEGORY_ORDER.filter((c) => groups[c]?.length).map((c) => ({
    category: c,
    modules: groups[c],
  }))
}

export function canToggleModule(mod) {
  return mod.phase === 'mvp' || mod.phase === 'growth' || mod.enabled
}

/**
 * @param {{ serverId: number|string|null|undefined; canManage: boolean; open?: boolean }} opts
 */
export function useServerAssistantModules({ serverId, canManage, open = true }) {
  const { t } = useTranslation()
  const [modules, setModules] = useState(/** @type {AssistantModuleRow[]} */ ([]))
  const [loading, setLoading] = useState(false)
  const [busyKey, setBusyKey] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [configured, setConfigured] = useState(true)
  const [warning, setWarning] = useState('')

  const load = useCallback(async () => {
    if (!serverId) return
    setLoading(true)
    setError('')
    try {
      const data = await fetchServerAssistantModules(serverId)
      setModules(data.items || [])
      setConfigured(data.configured !== false)
      setWarning(data.warning || '')
    } catch (err) {
      const status = err?.response?.status
      if (status === 404) {
        setError(t('serverAssistant.errApiRoute'))
      } else {
        setError(t('serverAssistant.errLoad'))
      }
      setModules([])
    } finally {
      setLoading(false)
    }
  }, [serverId, t])

  useEffect(() => {
    if (!open || !serverId) return
    load()
  }, [open, serverId, load])

  async function toggleModule(mod) {
    if (!serverId || !canManage || !canToggleModule(mod)) return
    const next = !mod.enabled
    setBusyKey(mod.key)
    setError('')
    setInfo('')
    try {
      await setServerAssistantModule(serverId, mod.key, { enabled: next, config: mod.config || {} })
      setModules((prev) => prev.map((m) => (m.key === mod.key ? { ...m, enabled: next } : m)))
      setInfo(
        next
          ? t('serverAssistant.enabled', { name: mod.name })
          : t('serverAssistant.disabled', { name: mod.name })
      )
    } catch (err) {
      const code = err?.response?.data?.error
      if (code === 'assistant_not_configured') {
        setError(t('serverAssistant.errNotConfigured'))
      } else {
        setError(t('serverAssistant.errToggle'))
      }
    } finally {
      setBusyKey('')
    }
  }

  return {
    modules,
    groups: groupModulesByCategory(modules),
    loading,
    busyKey,
    error,
    info,
    configured,
    warning,
    reload: load,
    toggleModule,
  }
}
