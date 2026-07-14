import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  addonLabel,
  addonRoute,
  getAddonById,
  isAddonImplemented,
} from './addonCatalog.js'
import { useDesktopProfile } from './desktopRuntime/DesktopProfileContext.jsx'
import {
  isBuiltinDockItem,
  pickPrimaryOpenRoute,
  resolveProfileLayout,
} from './desktopRuntime/desktopProfileUtils.js'

const DOCK_ICONS = {
  'media-player': '▶',
  'command-palette': '⌘',
  'activity-center': '◉',
  terminal: '>_',
  notes: '📝',
  calendar: '📅',
  dashboard: '◫',
  kanban: '▦',
  'obs-companion': '●',
  'stream-deck': '⊞',
  monitor: '◉',
  devops: '⚙',
  'ai-actions': '✦',
  'code-editor': '{ }',
}

/**
 * @param {{ onOpenCommandPalette?: () => void; onOpenActivity?: () => void; children: import('react').ReactNode }} props
 */
export default function DesktopShell({ onOpenCommandPalette, onOpenActivity, children }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language?.startsWith('en') ? 'en' : 'es'
  const { profiles, activeKey, activeProfile, dockPins, loading, switchProfile } = useDesktopProfile()

  function activateDockItem(addonId) {
    if (addonId === 'command-palette') {
      onOpenCommandPalette?.()
      window.dispatchEvent(new CustomEvent('akoenet:open-command-palette'))
      return
    }
    if (addonId === 'activity-center') {
      onOpenActivity?.()
      window.dispatchEvent(new CustomEvent('akoenet:open-activity-center'))
      return
    }
    navigate(addonRoute(addonId))
  }

  function handleProfileChange(event) {
    const key = event.target.value
    if (!key || key === activeKey) return
    switchProfile(key)
    const profile = profiles.find((p) => p.profileKey === key)
    if (!profile) return
    const { opens } = resolveProfileLayout(profile, profiles)
    const route = pickPrimaryOpenRoute(opens, addonRoute, isAddonImplemented)
    if (route) navigate(route)
  }

  return (
    <div className="ws-shell">
      <div className="ws-shell-toolbar">
        <div className="ws-profile-switcher">
          <label className="ws-profile-label" htmlFor="ws-profile-select">
            {t('workspace.profileLabel')}
          </label>
          <select
            id="ws-profile-select"
            className="ws-profile-select"
            value={activeKey || ''}
            disabled={loading || !profiles.length}
            onChange={handleProfileChange}
          >
            {!profiles.length ? (
              <option value="">{t('workspace.profileDefault')}</option>
            ) : (
              profiles.map((p) => (
                <option key={p.profileKey} value={p.profileKey}>
                  {p.name || p.profileKey}
                </option>
              ))
            )}
          </select>
          {activeProfile?.baseLayout ? (
            <span className="ws-profile-base muted small">
              {t('workspace.profileBasedOn', { layout: activeProfile.baseLayout })}
            </span>
          ) : null}
        </div>
      </div>

      <div className="ws-shell-body">{children}</div>

      <nav className="ws-dock" aria-label={t('workspace.dockLabel')}>
        {dockPins.map((addonId) => {
          const addon = getAddonById(addonId)
          const label = addon
            ? addonLabel(addon, locale)
            : addonId === 'command-palette'
              ? t('workspace.cmdTitle')
              : addonId === 'activity-center'
                ? t('workspace.activityTitle')
                : addonId
          const icon = DOCK_ICONS[addonId] || (addon ? '◆' : '·')
          const live = isAddonImplemented(addonId) || isBuiltinDockItem(addonId)
          return (
            <button
              key={addonId}
              type="button"
              className={`ws-dock-item${live ? '' : ' ws-dock-item--preview'}`}
              title={label}
              onClick={() => activateDockItem(addonId)}
            >
              <span className="ws-dock-icon" aria-hidden="true">
                {icon}
              </span>
              <span className="ws-dock-label">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
