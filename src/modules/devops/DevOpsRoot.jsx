import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import FloatingWindow from '../../workspace/components/FloatingWindow.jsx'
import { useDesktopLayout } from '../../workspace/desktopRuntime/useDesktopLayout.js'
import {
  applyWindowSnap,
  constrainToViewport,
} from '../../workspace/desktopRuntime/windowSnap.js'
import { fetchWorkspaceDevops, fetchWorkspaceMetrics } from '../../workspace/workspaceApi.js'
import { resolveActivityHref } from '../../workspace/activityLinks.js'
import {
  listPlatformServiceRows,
  summarizeWorkspaceMetrics,
} from '../../workspace/platformMetricsSummary.js'
import { DEVOPS_WINDOW_REGISTRY, devopsDefaultLayout } from './windowRegistry.js'
import './devops.css'

const ADDON_ID = 'devops'
const POLL_MS = 12000

function statusDot(ok) {
  if (ok === true) return 'ok'
  if (ok === false) return 'fail'
  return 'unknown'
}

function formatUptime(ms) {
  if (ms == null) return '—'
  const sec = Math.floor(ms / 1000)
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m ${sec % 60}s`
}

function ServiceRow({ label, ok, detail, latencyMs }) {
  const detailText =
    latencyMs != null ? `${detail || ''}${detail ? ' · ' : ''}${latencyMs} ms` : detail || '—'
  return (
    <div className="devops-status-row">
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <span className={`devops-dot devops-dot--${statusDot(ok)}`} />
        {label}
      </span>
      <span className="muted small">{detailText}</span>
    </div>
  )
}

export default function DevOpsRoot() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const desktopRef = useRef(null)
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(false)

  const { windows, setWindows, profileKey } = useDesktopLayout({
    addonId: ADDON_ID,
    registry: DEVOPS_WINDOW_REGISTRY,
    factoryLayout: devopsDefaultLayout,
  })

  const [focusedId, setFocusedId] = useState('devops.deployments')

  const refresh = useCallback(async () => {
    setLoading(true)
    const [data, metrics] = await Promise.all([fetchWorkspaceDevops(), fetchWorkspaceMetrics()])
    setSnapshot({ ...data, metrics })
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    const timer = setInterval(() => {
      void refresh()
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [refresh])

  const getViewport = useCallback(() => {
    const el = desktopRef.current
    if (!el) return { width: 960, height: 680, topBar: 0, bottom: 0 }
    return { width: el.clientWidth, height: el.clientHeight, topBar: 0, bottom: 0 }
  }, [])

  const focus = useCallback(
    (id) => {
      setFocusedId(id)
      setWindows((prev) => {
        const maxZ = Math.max(...prev.map((w) => w.zIndex), 0)
        return prev.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w))
      })
    },
    [setWindows]
  )

  const moveWindow = useCallback(
    (id, rect) => {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, rect } : w)))
    },
    [setWindows]
  )

  const finishMove = useCallback(
    (id, rect) => {
      setWindows((prev) => {
        const vp = getViewport()
        const constrained = constrainToViewport(rect, vp)
        const siblings = prev.map((w) => (w.id === id ? { ...w, rect: constrained } : w))
        const snapped = applyWindowSnap(id, constrained, siblings, DEVOPS_WINDOW_REGISTRY, vp)
        return prev.map((w) => (w.id === id ? { ...w, rect: snapped } : w))
      })
    },
    [getViewport, setWindows]
  )

  const resizeWindow = useCallback(
    (id, rect) => {
      setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, rect } : w)))
    },
    [setWindows]
  )

  const finishResize = useCallback(
    (id, rect) => {
      setWindows((prev) => {
        const vp = getViewport()
        const next = constrainToViewport(rect, vp)
        return prev.map((w) => (w.id === id ? { ...w, rect: next } : w))
      })
    },
    [getViewport, setWindows]
  )

  const infra = snapshot?.infra
  const services = infra?.services || {}
  const links = snapshot?.links || {}
  const deployments = snapshot?.deployments || []
  const logs = snapshot?.logs || []
  const metricsSummary = summarizeWorkspaceMetrics(snapshot?.metrics)
  const platformServices = listPlatformServiceRows(snapshot?.metrics?.platform?.services)

  const openExternal = (url) => {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const windowBodies = {
    'devops.deployments': (
      <div className="devops-panel">
        <div className="devops-actions">
          <button type="button" className="btn ghost small" disabled={loading} onClick={() => refresh()}>
            {loading ? t('devops.refreshing') : t('devops.refresh')}
          </button>
          {snapshot?.stub ? <span className="muted small">{t('devops.stubHint')}</span> : null}
        </div>
        {deployments.length ? (
          <ul className="devops-deploy-list">
            {deployments.map((item, i) => {
              const href = resolveActivityHref(item)
              return (
                <li key={item.id || i} className="devops-deploy-item">
                  <strong>{item.title || t('devops.deployUnknown')}</strong>
                  {item.subtitle ? <span className="muted small"> — {item.subtitle}</span> : null}
                  {item.at ? (
                    <div className="muted small">{new Date(item.at).toLocaleString()}</div>
                  ) : null}
                  {href ? (
                    <button
                      type="button"
                      className="devops-link-btn"
                      style={{ marginTop: '0.35rem' }}
                      onClick={() => openExternal(href)}
                    >
                      {t('devops.openEvent')}
                    </button>
                  ) : null}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="muted small">{t('devops.deployEmpty')}</p>
        )}
      </div>
    ),
    'devops.logs': (
      <div className="devops-panel">
        <ul className="devops-log-scroll">
          {logs.map((line, i) => (
            <li key={i} className="devops-log-line">
              {line}
            </li>
          ))}
        </ul>
      </div>
    ),
    'devops.services': (
      <div className="devops-panel">
        {infra ? (
          <div className="devops-meta muted small">
            <span>
              {t('devops.version')}: v{infra.version}
            </span>
            <span>
              {t('devops.uptime')}: {formatUptime(infra.uptimeMs)}
            </span>
            {metricsSummary?.platformLabel ? (
              <span>
                {t('devops.platform')}: {metricsSummary.platformLabel}
              </span>
            ) : null}
            <span>{infra.checkedAt ? new Date(infra.checkedAt).toLocaleTimeString() : null}</span>
          </div>
        ) : null}
        <ServiceRow
          label={t('devops.serviceApi')}
          ok={services.api?.ok}
          detail={services.api?.detail}
          latencyMs={services.api?.latencyMs}
        />
        <ServiceRow
          label={t('devops.servicePostgres')}
          ok={services.postgres?.ok}
          detail={services.postgres?.detail}
          latencyMs={services.postgres?.latencyMs}
        />
        <ServiceRow
          label={t('devops.serviceRedis')}
          ok={services.redis?.ok}
          detail={services.redis?.detail}
          latencyMs={services.redis?.latencyMs}
        />
        <ServiceRow
          label={t('devops.serviceStorage')}
          ok={services.storage?.ok}
          detail={services.storage?.detail}
          latencyMs={services.storage?.latencyMs}
        />
        <ServiceRow
          label={t('devops.serviceScheduler')}
          ok={services.scheduler?.ok}
          detail={services.scheduler?.detail}
          latencyMs={services.scheduler?.latencyMs}
        />
        {platformServices.length ? (
          <>
            <p className="muted small" style={{ marginTop: '0.35rem' }}>
              {t('devops.platformServices')}
            </p>
            {platformServices.map((row) => (
              <ServiceRow
                key={row.id}
                label={row.id}
                ok={row.ok}
                detail={row.detail}
                latencyMs={row.latencyMs}
              />
            ))}
          </>
        ) : null}
        {metricsSummary?.eventBusDlq != null ? (
          <p className="muted small">
            {t('devops.eventBusDlq')}: {metricsSummary.eventBusDlq}
          </p>
        ) : null}
        <div className="devops-links">
          {links.railway ? (
            <button type="button" className="devops-link-btn" onClick={() => openExternal(links.railway)}>
              Railway
            </button>
          ) : null}
          {links.supabase ? (
            <button type="button" className="devops-link-btn" onClick={() => openExternal(links.supabase)}>
              Supabase
            </button>
          ) : null}
          {links.github ? (
            <button type="button" className="devops-link-btn" onClick={() => openExternal(links.github)}>
              GitHub
            </button>
          ) : null}
          {links.gateway ? (
            <button type="button" className="devops-link-btn" onClick={() => openExternal(links.gateway)}>
              Gateway
            </button>
          ) : null}
          {links.internal ? (
            <button type="button" className="devops-link-btn" onClick={() => openExternal(links.internal)}>
              Internal API
            </button>
          ) : null}
        </div>
      </div>
    ),
  }

  return (
    <div className="devops-desktop">
      <header className="devops-toolbar">
        <button type="button" className="btn ghost small" onClick={() => navigate('/workspace')}>
          ← {t('workspace.backDesktop')}
        </button>
        <h1>{t('devops.title')}</h1>
        {profileKey ? <span className="muted small">· {profileKey}</span> : null}
      </header>
      <div className="devops-canvas" ref={desktopRef}>
        {windows
          .filter((w) => w.visible && !w.minimized)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((w) => {
            const desc = DEVOPS_WINDOW_REGISTRY.find((d) => d.id === w.id)
            return (
              <FloatingWindow
                key={w.id}
                id={w.id}
                title={desc?.title || w.title}
                rect={w.rect}
                zIndex={w.zIndex}
                visible={w.visible}
                minimized={w.minimized}
                focused={focusedId === w.id}
                onFocus={focus}
                onMove={moveWindow}
                onMoveEnd={finishMove}
                onResize={resizeWindow}
                onResizeEnd={finishResize}
              >
                {windowBodies[w.id]}
              </FloatingWindow>
            )
          })}
      </div>
    </div>
  )
}
