import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import CommandPalette, { useCommandPaletteShortcut } from './CommandPalette.jsx'
import ActivityCenter from './ActivityCenter.jsx'
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
