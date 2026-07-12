import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { addonLabel, listCatalogAddons } from './addonCatalog.js'

export default function ActivityCenter({ open, onClose }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language?.startsWith('en') ? 'en' : 'es'
  const pinned = useMemo(
    () => listCatalogAddons().filter((a) => a.builtin || a.phase === 'mvp').slice(0, 8),
    []
  )

  if (!open) return null

  return (
    <div className="ws-activity-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="ws-activity-panel"
        role="dialog"
        aria-label={t('workspace.activityTitle')}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ws-activity-header">
          <h2>{t('workspace.activityTitle')}</h2>
          <button type="button" className="btn ghost small" onClick={onClose}>
            {t('common.back')}
          </button>
        </header>
        <p className="muted small">{t('workspace.activityLead')}</p>
        <ul className="ws-activity-list">
          <li className="ws-activity-item">
            <span className="ws-activity-dot ws-activity-dot--live" />
            <div>
              <strong>{t('workspace.activityStreams')}</strong>
              <p className="muted small">{t('workspace.activityStreamsHint')}</p>
            </div>
          </li>
          <li className="ws-activity-item">
            <span className="ws-activity-dot ws-activity-dot--deploy" />
            <div>
              <strong>{t('workspace.activityDeploys')}</strong>
              <p className="muted small">{t('workspace.activityDeploysHint')}</p>
            </div>
          </li>
          <li className="ws-activity-item">
            <span className="ws-activity-dot ws-activity-dot--ai" />
            <div>
              <strong>{t('workspace.activityAi')}</strong>
              <p className="muted small">{t('workspace.activityAiHint')}</p>
            </div>
          </li>
        </ul>
        <h3 className="ws-activity-subtitle">{t('workspace.activityPinned')}</h3>
        <div className="ws-activity-pinned">
          {pinned.map((addon) => (
            <Link
              key={addon.id}
              className="ws-activity-chip"
              to={addon.id === 'media-player' ? '/media' : `/workspace/${addon.id}`}
              onClick={onClose}
            >
              {addonLabel(addon, locale)}
            </Link>
          ))}
        </div>
      </aside>
    </div>
  )
}
