import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { addonLabel, addonRoute, isAddonImplemented, listCatalogAddons } from './addonCatalog.js'
import { fetchWorkspaceActivity } from './workspaceApi.js'
import { isExternalActivityHref, resolveActivityHref } from './activityLinks.js'

function formatActivityTime(at) {
  if (!at) return ''
  try {
    return new Date(at).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return ''
  }
}

export default function ActivityCenter({ open, onClose }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language?.startsWith('en') ? 'en' : 'es'
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(false)
  const [stub, setStub] = useState(false)

  const pinned = useMemo(
    () => listCatalogAddons().filter((a) => a.builtin || a.phase === 'mvp' || isAddonImplemented(a.id)).slice(0, 8),
    []
  )

  useEffect(() => {
    if (!open) return undefined
    let cancelled = false
    setLoading(true)
    fetchWorkspaceActivity()
      .then((data) => {
        if (cancelled) return
        setFeed(data?.items || [])
        setStub(Boolean(data?.stub))
      })
      .catch(() => {
        if (!cancelled) {
          setFeed([])
          setStub(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  function openActivityItem(item) {
    const href = resolveActivityHref(item)
    if (!href) return
    onClose()
    if (isExternalActivityHref(item)) {
      window.open(href, '_blank', 'noopener,noreferrer')
      return
    }
    navigate(href)
  }

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

        {loading ? (
          <p className="muted small">{t('workspace.activityLoading')}</p>
        ) : feed.length ? (
          <ul className="ws-activity-list">
            {feed.map((item) => {
              const href = resolveActivityHref(item)
              const content = (
                <>
                  <span className={`ws-activity-dot ws-activity-dot--${item.dot || 'default'}`} />
                  <div>
                    <strong>{item.title}</strong>
                    {item.subtitle ? <p className="muted small">{item.subtitle}</p> : null}
                    {item.at ? (
                      <p className="muted small ws-activity-time">{formatActivityTime(item.at)}</p>
                    ) : null}
                  </div>
                </>
              )
              return (
                <li key={item.id} className="ws-activity-item">
                  {href ? (
                    <button
                      type="button"
                      className="ws-activity-link"
                      onClick={() => openActivityItem(item)}
                    >
                      {content}
                    </button>
                  ) : (
                    content
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
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
            {stub ? (
              <li className="ws-activity-item">
                <p className="muted small">{t('workspace.activityEmptyHint')}</p>
              </li>
            ) : null}
          </ul>
        )}

        <h3 className="ws-activity-subtitle">{t('workspace.activityPinned')}</h3>
        <div className="ws-activity-pinned">
          {pinned.map((addon) => (
            <Link
              key={addon.id}
              className="ws-activity-chip"
              to={addonRoute(addon.id)}
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
