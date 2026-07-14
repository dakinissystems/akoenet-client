import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import CommandPalette, { useCommandPaletteShortcut } from './CommandPalette.jsx'
import ActivityCenter from './ActivityCenter.jsx'
import { fetchWorkspaceAddons } from './workspaceApi.js'
import { setWorkspaceEnabledFilter } from './addonCatalog.js'
import './workspace.css'

export default function WorkspaceProviders({ children }) {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const locale = i18n.language?.startsWith('en') ? 'en' : 'es'
  const [cmdOpen, setCmdOpen] = useState(false)
  const [activityOpen, setActivityOpen] = useState(false)
  const openCmd = useCallback(() => setCmdOpen(true), [])
  const closeCmd = useCallback(() => setCmdOpen(false), [])

  useCommandPaletteShortcut(openCmd)

  useEffect(() => {
    const onCmd = () => setCmdOpen(true)
    const onActivity = () => setActivityOpen(true)
    window.addEventListener('akoenet:open-command-palette', onCmd)
    window.addEventListener('akoenet:open-activity-center', onActivity)
    return () => {
      window.removeEventListener('akoenet:open-command-palette', onCmd)
      window.removeEventListener('akoenet:open-activity-center', onActivity)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setWorkspaceEnabledFilter(null)
      return
    }
    let cancelled = false
    fetchWorkspaceAddons().then((data) => {
      if (cancelled || !data?.enabledIds) return
      setWorkspaceEnabledFilter(data.enabledIds)
    })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  if (!user) return children

  return (
    <>
      {children}
      <button
        type="button"
        className="ws-fab"
        title={t('workspace.activityTitle')}
        aria-label={t('workspace.activityTitle')}
        onClick={() => setActivityOpen(true)}
      >
        ◉
      </button>
      <CommandPalette open={cmdOpen} onClose={closeCmd} t={t} locale={locale} />
      <ActivityCenter open={activityOpen} onClose={() => setActivityOpen(false)} />
    </>
  )
}
