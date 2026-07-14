import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import FloatingWindow from '../../workspace/components/FloatingWindow.jsx'
import { useDesktopLayout } from '../../workspace/desktopRuntime/useDesktopLayout.js'
import {
  applyWindowSnap,
  constrainToViewport,
} from '../../workspace/desktopRuntime/windowSnap.js'
import {
  fetchServiceHealth,
  memoryPercent,
  sampleClientMetrics,
  summarizeDeps,
} from './monitorMetrics.js'
import { fetchWorkspaceMetrics } from '../../workspace/workspaceApi.js'
import {
  listPlatformServiceRows,
  summarizeWorkspaceMetrics,
} from '../../workspace/platformMetricsSummary.js'
import { MONITOR_WINDOW_REGISTRY, monitorDefaultLayout } from './windowRegistry.js'
import './monitor.css'

const ADDON_ID = 'monitor'
const POLL_MS = 8000
const HISTORY_LEN = 24

function statusDot(ok) {
  if (ok === true) return 'ok'
  if (ok === false) return 'fail'
  return 'unknown'
}

function depOk(value) {
  if (value === true || value === 'ok' || value === 'healthy') return true
  if (value === false || value === 'error' || value === 'down') return false
  return null
}

function MetricCard({ label, value, barPercent }) {
  return (
    <div className="monitor-metric">
      <span className="monitor-metric-label">{label}</span>
      <strong>{value}</strong>
      {barPercent != null ? (
        <div className="monitor-bar" aria-hidden="true">
          <div className="monitor-bar-fill" style={{ width: `${barPercent}%` }} />
        </div>
      ) : null}
    </div>
  )
}

function Sparkline({ values }) {
  if (!values.length) return null
  const max = Math.max(...values, 1)
  return (
    <div className="monitor-sparkline" aria-hidden="true">
      {values.map((v, i) => (
        <div
          key={i}
          className="monitor-spark-bar"
          style={{ height: `${Math.max(8, Math.round((v / max) * 100))}%` }}
        />
      ))}
    </div>
  )
}

function ServiceRow({ label, ok, detail }) {
  return (
    <div className="monitor-status-row">
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <span className={`monitor-dot monitor-dot--${statusDot(ok)}`} />
        {label}
      </span>
      <span className="muted small">{detail}</span>
    </div>
  )
}

export default function MonitorRoot() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const desktopRef = useRef(null)
  const [client, setClient] = useState(() => sampleClientMetrics())
  const [services, setServices] = useState(null)
  const [platformMetrics, setPlatformMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [latencyHistory, setLatencyHistory] = useState([])
  const [memHistory, setMemHistory] = useState([])

  const { windows, setWindows, profileKey } = useDesktopLayout({
    addonId: ADDON_ID,
    registry: MONITOR_WINDOW_REGISTRY,
    factoryLayout: monitorDefaultLayout,
  })

  const [focusedId, setFocusedId] = useState('monitor.overview')

  const depsSummary = useMemo(() => summarizeDeps(services?.deps), [services])
  const metricsSummary = useMemo(
    () => summarizeWorkspaceMetrics(platformMetrics),
    [platformMetrics]
  )
  const platformServices = useMemo(
    () => listPlatformServiceRows(platformMetrics?.platform?.services),
    [platformMetrics]
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    const nextClient = sampleClientMetrics()
    setClient(nextClient)
    if (nextClient.memoryUsedMb != null) {
      setMemHistory((prev) => [...prev, nextClient.memoryUsedMb].slice(-HISTORY_LEN))
    }

    const health = await fetchServiceHealth()
    setServices(health)
    const metrics = await fetchWorkspaceMetrics()
    setPlatformMetrics(metrics)
    if (health.latencyMs != null) {
      setLatencyHistory((prev) => [...prev, health.latencyMs].slice(-HISTORY_LEN))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
    const timer = setInterval(() => {
      void refresh()
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [refresh])

  const memPct = memoryPercent(client.memoryUsedMb, client.memoryLimitMb)

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
        const snapped = applyWindowSnap(id, constrained, siblings, MONITOR_WINDOW_REGISTRY, vp)
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

  const windowBodies = {
    'monitor.overview': (
      <div className="monitor-panel">
        <div className="monitor-actions">
          <button type="button" className="btn ghost small" disabled={loading} onClick={() => refresh()}>
            {loading ? t('monitor.refreshing') : t('monitor.refresh')}
          </button>
        </div>
        <div className="monitor-grid">
          <MetricCard
            label={t('monitor.apiLatency')}
            value={services?.latencyMs != null ? `${services.latencyMs} ms` : '—'}
          />
          <MetricCard
            label={t('monitor.memory')}
            value={
              client.memoryUsedMb != null
                ? `${client.memoryUsedMb} / ${client.memoryLimitMb ?? '?'} MB`
                : t('monitor.na')
            }
            barPercent={memPct}
          />
          <MetricCard
            label={t('monitor.network')}
            value={client.connection || t('monitor.na')}
          />
          <MetricCard
            label={t('monitor.online')}
            value={client.online ? t('monitor.onlineYes') : t('monitor.onlineNo')}
          />
          <MetricCard
            label={t('monitor.platformServices')}
            value={metricsSummary?.platformLabel || metricsSummary?.localLabel || '—'}
          />
        </div>
        {metricsSummary?.railwayEnv ? (
          <p className="muted small">
            {t('monitor.railwayEnv')}: {metricsSummary.railwayEnv}
          </p>
        ) : null}
        {metricsSummary?.stub ? (
          <p className="muted small">{t('monitor.platformStub')}</p>
        ) : null}
        <Sparkline values={latencyHistory} />
        <p className="muted small">{t('monitor.latencyHint')}</p>
      </div>
    ),
    'monitor.system': (
      <div className="monitor-panel">
        <div className="monitor-grid">
          <MetricCard label={t('monitor.cores')} value={client.cores ?? t('monitor.na')} />
          <MetricCard
            label={t('monitor.downlink')}
            value={client.downlinkMbps != null ? `${client.downlinkMbps} Mbps` : t('monitor.na')}
          />
          <MetricCard
            label={t('monitor.rtt')}
            value={client.rttMs != null ? `${client.rttMs} ms` : t('monitor.na')}
          />
          <MetricCard
            label={t('monitor.pageLoad')}
            value={client.loadMs != null ? `${client.loadMs} ms` : t('monitor.na')}
          />
        </div>
        <Sparkline values={memHistory} />
        <p className="muted small">{t('monitor.clientHint')}</p>
      </div>
    ),
    'monitor.services': (
      <div className="monitor-panel">
        <ServiceRow
          label={t('monitor.serviceApi')}
          ok={services?.apiOk ?? null}
          detail={services?.apiOk ? t('monitor.statusOk') : t('monitor.statusFail')}
        />
        <ServiceRow
          label={t('monitor.servicePostgres')}
          ok={depOk(depsSummary.postgres)}
          detail={String(depsSummary.postgres ?? t('monitor.na'))}
        />
        <ServiceRow
          label={t('monitor.serviceRedis')}
          ok={depOk(depsSummary.redis)}
          detail={String(depsSummary.redis ?? t('monitor.na'))}
        />
        <ServiceRow
          label={t('monitor.serviceStorage')}
          ok={depOk(depsSummary.storage)}
          detail={String(depsSummary.storage ?? t('monitor.na'))}
        />
        <ServiceRow
          label={t('monitor.serviceScheduler')}
          ok={depOk(depsSummary.scheduler)}
          detail={String(depsSummary.scheduler ?? t('monitor.na'))}
        />
        {platformServices.length ? (
          <>
            <p className="muted small" style={{ marginTop: '0.35rem' }}>
              {t('monitor.platformServices')}
            </p>
            {platformServices.map((row) => (
              <ServiceRow
                key={row.id}
                label={row.id}
                ok={row.ok}
                detail={
                  row.latencyMs != null ? `${row.detail} · ${row.latencyMs} ms` : String(row.detail)
                }
              />
            ))}
          </>
        ) : null}
        <p className="muted small">
          {depsSummary.version ? `${t('monitor.version')}: ${depsSummary.version} · ` : ''}
          {depsSummary.uptimeMs != null ? `${t('monitor.uptime')}: ${depsSummary.uptimeMs} ms · ` : ''}
          <Link to="/status">{t('monitor.fullStatus')}</Link>
        </p>
      </div>
    ),
  }

  return (
    <div className="monitor-desktop">
      <header className="monitor-toolbar">
        <button type="button" className="btn ghost small" onClick={() => navigate('/workspace')}>
          ← {t('workspace.backDesktop')}
        </button>
        <h1>{t('monitor.title')}</h1>
        {profileKey ? <span className="muted small">· {profileKey}</span> : null}
      </header>
      <div className="monitor-canvas" ref={desktopRef}>
        {windows
          .filter((w) => w.visible && !w.minimized)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((w) => {
            const desc = MONITOR_WINDOW_REGISTRY.find((d) => d.id === w.id)
            return (
              <FloatingWindow
                key={w.id}
                id={w.id}
                title={desc?.title || w.id}
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
