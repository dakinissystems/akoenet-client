import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import AppChrome from '../components/AppChrome'
import {
  addonDescription,
  addonLabel,
  getAddonById,
  isAddonImplemented,
  addonRoute,
} from '../workspace/addonCatalog.js'
import WorkspaceAddonRuntime from '../workspace/WorkspaceAddonRuntime.jsx'
import '../workspace/workspace.css'

export default function WorkspaceAddonPage() {
  const { addonId } = useParams()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language?.startsWith('en') ? 'en' : 'es'
  const addon = getAddonById(addonId)
  const [servers, setServers] = useState([])

  useEffect(() => {
    let cancelled = false
    api.get('/servers').then(({ data }) => {
      if (!cancelled) setServers(data)
    }).catch(() => {
      if (!cancelled) setServers([])
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!addon) {
    return (
      <AppChrome>
        <div className="auth-page">
          <div className="auth-card">
            <h1>{t('workspace.notFoundTitle')}</h1>
            <p className="muted">{t('workspace.notFoundBody')}</p>
            <Link to="/workspace">{t('workspace.backDesktop')}</Link>
          </div>
        </div>
      </AppChrome>
    )
  }

  if (isAddonImplemented(addon.id)) {
    navigate(addonRoute(addon.id), { replace: true })
    return null
  }

  if (addon.id === 'command-palette') {
    return (
      <AppChrome>
        <div className="auth-page">
          <div className="auth-card">
            <h1>{addonLabel(addon, locale)}</h1>
            <p className="muted">{addonDescription(addon, locale)}</p>
            <p className="info-banner">{t('workspace.builtinCmdk')}</p>
            <Link to="/workspace">{t('workspace.backDesktop')}</Link>
          </div>
        </div>
      </AppChrome>
    )
  }

  if (addon.id === 'activity-center') {
    return (
      <AppChrome>
        <div className="auth-page">
          <div className="auth-card">
            <h1>{addonLabel(addon, locale)}</h1>
            <p className="muted">{addonDescription(addon, locale)}</p>
            <p className="info-banner">{t('workspace.builtinActivity')}</p>
            <Link to="/workspace">{t('workspace.backDesktop')}</Link>
          </div>
        </div>
      </AppChrome>
    )
  }

  return <WorkspaceAddonRuntime addon={addon} servers={servers} />
}
