import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import FloatingWindow from '../../workspace/components/FloatingWindow.jsx'
import { fetchWorkspaceActivity, fetchWorkspaceMetrics } from '../../workspace/workspaceApi.js'
import { summarizeWorkspaceMetrics } from '../../workspace/platformMetricsSummary.js'
import { useDesktopLayout } from '../../workspace/desktopRuntime/useDesktopLayout.js'
import {
  applyWindowSnap,
  constrainToViewport,
} from '../../workspace/desktopRuntime/windowSnap.js'
import {
  collectLocalStats,
  listWidgets,
  WIDGET_DEFS,
} from './dashboardStorage.js'
import { DASHBOARD_WINDOW_REGISTRY, dashboardDefaultLayout } from './windowRegistry.js'
import './dashboard.css'

const ADDON_ID = 'dashboard'
const HUB_BASE = String(import.meta.env.VITE_DAKINIS_CORPORATE_URL || 'https://dakinissystems.com').replace(/\/$/, '')

export default function DashboardRoot() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const desktopRef = useRef(null)
  const [stats, setStats] = useState(() => collectLocalStats())
  const [activity, setActivity] = useState([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [metrics, setMetrics] = useState(null)
  const metricsSummary = useMemo(() => summarizeWorkspaceMetrics(metrics), [metrics])
  const widgets = useMemo(() => listWidgets(), [])

  const { windows, setWindows, profileKey } = useDesktopLayout({
    addonId: ADDON_ID,
    registry: DASHBOARD_WINDOW_REGISTRY,
    factoryLayout: dashboardDefaultLayout,
  })

  const [focusedId, setFocusedId] = useState('dashboard.widgets')

  useEffect(() => {
    setStats(collectLocalStats())
  }, [])

  useEffect(() => {
    let cancelled = false
    setActivityLoading(true)
    fetchWorkspaceActivity()
      .then((data) => {
        if (!cancelled) setActivity(data?.items?.slice(0, 8) || [])
      })
      .catch(() => {
        if (!cancelled) setActivity([])
      })
      .finally(() => {
        if (!cancelled) setActivityLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = () => {
      fetchWorkspaceMetrics()
        .then((data) => {
          if (!cancelled) setMetrics(data)
        })
        .catch(() => {
          if (!cancelled) setMetrics(null)
        })
    }
    load()
    const timer = setInterval(load, 30000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

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
        const snapped = applyWindowSnap(id, constrained, siblings, DASHBOARD_WINDOW_REGISTRY, vp)
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

  function openWidget(def) {
    if (def.external && def.route?.startsWith('http')) {
      window.open(def.route, '_blank', 'noopener,noreferrer')
      return
    }
    if (def.id === 'hub') {
      window.open(`${HUB_BASE}/hub`, '_blank', 'noopener,noreferrer')
      return
    }
    if (def.route) navigate(def.route)
  }

  function widgetValue(id) {
    switch (id) {
      case 'notes':
        return stats.notes
      case 'kanban':
        return stats.tasks
      case 'calendar':
        return stats.eventsToday
      case 'activity':
        return activity.length
      case 'streams':
        return activity.filter((a) => a.dot === 'live').length
      case 'infra':
        return metricsSummary?.platformLabel || metricsSummary?.localLabel || '—'
      default:
        return '—'
    }
  }

  function widgetStatusClass(id) {
    if (id !== 'infra') return ''
    if (!metricsSummary) return ''
    if (metricsSummary.stub) return 'dashboard-widget-card--unknown'
    if (metricsSummary.platformOk === false || metricsSummary.localOk === false) {
      return 'dashboard-widget-card--fail'
    }
    if (metricsSummary.platformOk === true || metricsSummary.localOk === true) {
      return 'dashboard-widget-card--ok'
    }
    return ''
  }

  function widgetHint(id) {
    if (id !== 'infra' || !metricsSummary) return null
    if (metricsSummary.railwayEnv) return metricsSummary.railwayEnv
    if (metricsSummary.stub) return t('dashboard.infraStub')
    return null
  }

  const enabledWidgets = WIDGET_DEFS.filter((def) => {
    const row = widgets.find((w) => w.id === def.id)
    return row?.enabled !== false
  })

  const windowBodies = {
    'dashboard.widgets': (
      <div className="dashboard-widget-grid">
        {enabledWidgets.map((def) => (
          <button
            key={def.id}
            type="button"
            className={`dashboard-widget-card ${widgetStatusClass(def.id)}`.trim()}
            onClick={() => openWidget(def)}
          >
            <span className="muted small">{t(def.labelKey)}</span>
            <span className="dashboard-widget-value">{widgetValue(def.id)}</span>
            {widgetHint(def.id) ? (
              <span className="muted small dashboard-widget-hint">{widgetHint(def.id)}</span>
            ) : null}
          </button>
        ))}
      </div>
    ),
    'dashboard.activity': (
      <div>
        {activityLoading ? (
          <p className="muted small">{t('workspace.activityLoading')}</p>
        ) : activity.length ? (
          <ul className="dashboard-activity-list">
            {activity.map((item) => (
              <li key={item.id} className="dashboard-activity-item">
                <strong>{item.title}</strong>
                {item.subtitle ? <p className="muted small">{item.subtitle}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted small">{t('dashboard.activityEmpty')}</p>
        )}
      </div>
    ),
    'dashboard.quick': (
      <div className="dashboard-quick-links">
        <button type="button" className="dashboard-quick-link" onClick={() => navigate('/notes')}>
          {t('workspace.cmdNotes')}
        </button>
        <button type="button" className="dashboard-quick-link" onClick={() => navigate('/kanban')}>
          {t('workspace.cmdKanban')}
        </button>
        <button type="button" className="dashboard-quick-link" onClick={() => navigate('/calendar')}>
          {t('workspace.cmdCalendar')}
        </button>
        <button type="button" className="dashboard-quick-link" onClick={() => navigate('/media')}>
          {t('workspace.cmdMedia')}
        </button>
        <button type="button" className="dashboard-quick-link" onClick={() => navigate('/monitor')}>
          {t('workspace.cmdMonitor')}
        </button>
        <button type="button" className="dashboard-quick-link" onClick={() => navigate('/devops')}>
          {t('workspace.cmdDevops')}
        </button>
        <button type="button" className="dashboard-quick-link" onClick={() => navigate('/code')}>
          {t('workspace.cmdCodeEditor')}
        </button>
        <button
          type="button"
          className="dashboard-quick-link"
          onClick={() => window.open(`${HUB_BASE}/hub`, '_blank', 'noopener,noreferrer')}
        >
          {t('workspace.cmdHub')}
        </button>
      </div>
    ),
  }

  return (
    <div className="dashboard-desktop">
      <header className="dashboard-toolbar">
        <button type="button" className="btn ghost small" onClick={() => navigate('/workspace')}>
          ← {t('workspace.backDesktop')}
        </button>
        <h1>{t('dashboard.title')}</h1>
        {profileKey ? <span className="muted small">· {profileKey}</span> : null}
      </header>
      <div className="dashboard-canvas" ref={desktopRef}>
        {windows
          .filter((w) => w.visible && !w.minimized)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((w) => {
            const desc = DASHBOARD_WINDOW_REGISTRY.find((d) => d.id === w.id)
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
