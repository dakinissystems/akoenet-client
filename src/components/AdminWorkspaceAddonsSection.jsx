import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'

const acceptAll = { validateStatus: () => true }

export default function AdminWorkspaceAddonsSection() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language?.startsWith('en') ? 'en' : 'es'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [addons, setAddons] = useState([])
  const [workspaceId, setWorkspaceId] = useState(null)
  const [stub, setStub] = useState(false)
  const [savingKey, setSavingKey] = useState(null)

  const load = useCallback(async () => {
    const q = email.trim()
    if (!q) return
    setLoading(true)
    setError('')
    try {
      const params = q.includes('@') ? { email: q } : { user_id: q }
      const res = await api.get('/admin/workspace/addons', { params, ...acceptAll })
      if (res.status === 404) {
        setError(t('admin.workspaceAddonsUserNotFound'))
        setUser(null)
        setAddons([])
        return
      }
      if (res.status >= 400) {
        setError(t('admin.workspaceAddonsLoadFailed'))
        return
      }
      setUser(res.data?.user || null)
      setAddons(res.data?.items || [])
      setWorkspaceId(res.data?.workspaceId || null)
      setStub(Boolean(res.data?.stub))
    } catch {
      setError(t('admin.workspaceAddonsLoadFailed'))
    } finally {
      setLoading(false)
    }
  }, [email, t])

  const toggleAddon = async (addonKey, enabled) => {
    if (!user?.id) return
    setSavingKey(addonKey)
    setError('')
    try {
      const res = await api.put(
        `/admin/workspace/addons/${encodeURIComponent(addonKey)}`,
        { user_id: user.id, enabled },
        acceptAll
      )
      if (res.status >= 400) {
        setError(t('admin.workspaceAddonsSaveFailed'))
        return
      }
      setAddons((prev) =>
        prev.map((a) => (a.key === addonKey || a.id === addonKey ? { ...a, enabled } : a))
      )
    } catch {
      setError(t('admin.workspaceAddonsSaveFailed'))
    } finally {
      setSavingKey(null)
    }
  }

  function addonName(addon) {
    return addon?.i18n?.name?.[locale] || addon?.i18n?.name?.en || addon.key || addon.id
  }

  return (
    <section className="card status-page" style={{ marginTop: '1rem' }}>
      <h2>{t('admin.workspaceAddonsTitle')}</h2>
      <p className="muted small">{t('admin.workspaceAddonsLead')}</p>
      {stub ? <p className="info-banner">{t('admin.workspaceAddonsStub')}</p> : null}
      {error ? <div className="error-banner">{error}</div> : null}
      <div className="status-actions" style={{ marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <input
          type="text"
          className="input"
          placeholder={t('admin.workspaceAddonsEmailPh')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button type="button" className="btn secondary" disabled={loading || !email.trim()} onClick={load}>
          {loading ? t('admin.checking') : t('admin.workspaceAddonsLoad')}
        </button>
      </div>
      {user ? (
        <p className="muted small">
          {t('admin.workspaceAddonsUserLine', {
            id: user.id,
            email: user.email,
            workspace: workspaceId || '—',
          })}
        </p>
      ) : null}
      {addons.length ? (
        <ul className="admin-workspace-addons-list">
          {addons.map((addon) => {
            const key = addon.key || addon.id
            const on = Boolean(addon.enabled)
            return (
              <li key={key} className="admin-workspace-addons-row">
                <span>
                  <strong>{addonName(addon)}</strong>
                  <span className="muted small"> · {addon.phase || '—'}</span>
                </span>
                <label className="admin-workspace-addons-toggle">
                  <input
                    type="checkbox"
                    checked={on}
                    disabled={savingKey === key}
                    onChange={(e) => toggleAddon(key, e.target.checked)}
                  />
                  {on ? t('admin.workspaceAddonsVisible') : t('admin.workspaceAddonsHidden')}
                </label>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}
