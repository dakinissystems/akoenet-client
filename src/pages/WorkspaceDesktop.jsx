import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppChrome from '../components/AppChrome'
import ServerSidebar from '../components/ServerSidebar'
import DesktopShell from '../workspace/DesktopShell.jsx'
import { DesktopProfileProvider } from '../workspace/desktopRuntime/DesktopProfileContext.jsx'
import {
  addonDescription,
  addonLabel,
  addonRoute,
  addonsByCategory,
  isAddonImplemented,
} from '../workspace/addonCatalog.js'
import '../workspace/workspace.css'

function WorkspaceDesktopContent() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language?.startsWith('en') ? 'en' : 'es'
  const groups = addonsByCategory(locale)

  return (
    <AppChrome>
      <div className="app-shell dashboard-shell">
        <ServerSidebar
          servers={[]}
          activeServerId={null}
          homeAction={() => navigate('/')}
          messagesAction={() => navigate('/messages')}
          mediaAction={() => navigate('/media')}
          workspaceAction={() => navigate('/workspace')}
          workspaceActive
        />
        <DesktopShell>
          <div className="main-panel ws-desktop">
            <header className="ws-desktop-header">
              <h1>{t('workspace.title')}</h1>
              <p className="muted">{t('workspace.lead')}</p>
              <p className="muted small">{t('workspace.cmdHint')}</p>
            </header>
            {groups.map(({ category, label, items }) => (
              <section key={category} className="ws-category">
                <h2>{label}</h2>
                <div className="ws-grid">
                  {items.map((addon) => {
                    const implemented = isAddonImplemented(addon.id)
                    return (
                      <Link
                        key={addon.id}
                        to={addonRoute(addon.id)}
                        className={`ws-card ${addon.phase === 'future' ? 'ws-card--future' : ''}`}
                      >
                        <span className="ws-card-title">{addonLabel(addon, locale)}</span>
                        <span className="muted small">{addonDescription(addon, locale)}</span>
                        <span className="ws-card-phase">
                          {implemented
                            ? t('workspace.statusLive')
                            : addon.phase === 'future'
                              ? t('workspace.phase_future')
                              : t('workspace.statusPreview')}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </DesktopShell>
      </div>
    </AppChrome>
  )
}

export default function WorkspaceDesktop() {
  return (
    <DesktopProfileProvider>
      <WorkspaceDesktopContent />
    </DesktopProfileProvider>
  )
}
