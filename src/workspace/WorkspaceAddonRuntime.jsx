import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AppChrome from '../components/AppChrome'
import ServerSidebar from '../components/ServerSidebar'
import FloatingWindow from './components/FloatingWindow.jsx'
import { addonDescription, addonLabel } from './addonCatalog.js'
import { getWindowPreviewBody, humanizeWindowId } from './windowContent.jsx'
import { defaultLayoutForWindows, loadAddonLayout, persistAddonLayout } from './windowManager/layout.js'
import './workspace.css'

export default function WorkspaceAddonRuntime({ addon, servers = [] }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language?.startsWith('en') ? 'en' : 'es'
  const windowIds = useMemo(() => (addon.windows || []).slice(0, 8), [addon.windows])

  const [windows, setWindows] = useState(() => loadAddonLayout(addon.id, windowIds))
  const [focusedId, setFocusedId] = useState(windowIds[0] || null)

  useEffect(() => {
    persistAddonLayout(addon.id, windows)
  }, [addon.id, windows])

  const focus = useCallback((id) => {
    setFocusedId(id)
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex), 0)
      return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w))
    })
  }, [])

  const moveWindow = useCallback((id, rect) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, rect } : w)))
  }, [])

  const toggleWindow = useCallback((id) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible, minimized: false } : w))
    )
  }, [])

  const resetLayout = useCallback(() => {
    setWindows(defaultLayoutForWindows(addon.id, windowIds))
    setFocusedId(windowIds[0] || null)
  }, [addon.id, windowIds])

  return (
    <AppChrome>
      <div className="app-shell dashboard-shell">
        <ServerSidebar
          servers={servers}
          activeServerId={null}
          onSelectServer={(sid) => navigate(`/server/${sid}`)}
          homeAction={() => navigate('/')}
          messagesAction={() => navigate('/messages')}
          mediaAction={() => navigate('/media')}
          workspaceAction={() => navigate('/workspace')}
          workspaceActive
        />
        <div className="main-panel ws-addon-runtime">
          <header className="ws-runtime-header">
            <div>
              <p className="muted small">
                <Link to="/workspace">{t('workspace.backDesktop')}</Link>
              </p>
              <h1>{addonLabel(addon, locale)}</h1>
              <p className="muted">{addonDescription(addon, locale)}</p>
            </div>
            <div className="ws-runtime-actions">
              <span className="ws-preview-badge">{t('workspace.previewBadge')}</span>
              <button type="button" className="btn secondary small" onClick={resetLayout}>
                {t('workspace.resetLayout')}
              </button>
            </div>
          </header>
          {windowIds.length > 0 ? (
            <div className="ws-runtime-toolbar">
              {windowIds.map((wid) => {
                const w = windows.find((x) => x.id === wid)
                return (
                  <button
                    key={wid}
                    type="button"
                    className={`btn ghost small ${w?.visible ? 'active' : ''}`}
                    onClick={() => toggleWindow(wid)}
                  >
                    {humanizeWindowId(wid)}
                  </button>
                )
              })}
            </div>
          ) : null}
          <div className="ws-runtime-canvas">
            {windows.map((w) => (
              <FloatingWindow
                key={w.id}
                id={w.id}
                title={humanizeWindowId(w.id)}
                rect={w.rect}
                zIndex={w.zIndex}
                visible={w.visible}
                minimized={w.minimized}
                focused={focusedId === w.id}
                onFocus={focus}
                onMove={moveWindow}
              >
                {getWindowPreviewBody(addon, w.id, locale, t)}
              </FloatingWindow>
            ))}
          </div>
        </div>
      </div>
    </AppChrome>
  )
}
