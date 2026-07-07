import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'

/** Axios rejects on 404 unless we accept all statuses; keeps partial UI when one admin route is missing (old deploy). */
const acceptAllStatuses = { validateStatus: () => true }

export function useDashboardAdmin() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [health, setHealth] = useState(null)
  const [ready, setReady] = useState(null)
  const [deps, setDeps] = useState(null)
  const [history, setHistory] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditLimit] = useState(20)
  const [auditOffset, setAuditOffset] = useState(0)
  const [auditAction, setAuditAction] = useState('')
  const [auditServerId, setAuditServerId] = useState('')
  const [auditFrom, setAuditFrom] = useState('')
  const [auditTo, setAuditTo] = useState('')
  const [reportItems, setReportItems] = useState([])
  const [reportTotal, setReportTotal] = useState(0)
  const [reportLimit] = useState(20)
  const [reportOffset, setReportOffset] = useState(0)
  const [reportStatus, setReportStatus] = useState('open')
  const [reportServerId, setReportServerId] = useState('')
  const [metrics, setMetrics] = useState(null)
  const [pushDebug, setPushDebug] = useState(null)
  const [realtime, setRealtime] = useState(null)
  const [overview, setOverview] = useState(null)
  const [overviewEndpointAvailable, setOverviewEndpointAvailable] = useState(true)
  const [reportsEndpointAvailable, setReportsEndpointAvailable] = useState(true)
  const [metricsEndpointAvailable, setMetricsEndpointAvailable] = useState(true)
  const [pushDebugEndpointAvailable, setPushDebugEndpointAvailable] = useState(true)
  const [realtimeEndpointAvailable, setRealtimeEndpointAvailable] = useState(true)
  const [loadWarnings, setLoadWarnings] = useState([])
  const docsUrl = `${String(api.defaults.baseURL || '').replace(/\/$/, '')}/docs`

  const pushHistory = useCallback((payload) => {
    setHistory((prev) => {
      const entry = {
        at: new Date().toISOString(),
        liveness: payload?.liveness ?? false,
        readiness: payload?.readiness ?? false,
        deps: payload?.deps ?? false,
        total: payload?.total_latency_ms ?? null,
      }
      return [entry, ...prev].slice(0, 10)
    })
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    setLoadWarnings([])
    const warnings = []

    const auditParams = new URLSearchParams()
    auditParams.set('limit', String(auditLimit))
    auditParams.set('offset', String(auditOffset))
    if (auditAction.trim()) auditParams.set('action', auditAction.trim())
    if (auditServerId.trim()) auditParams.set('server_id', auditServerId.trim())
    if (auditFrom) auditParams.set('from', new Date(auditFrom).toISOString())
    if (auditTo) auditParams.set('to', new Date(auditTo).toISOString())
    const reportParams = new URLSearchParams()
    reportParams.set('limit', String(reportLimit))
    reportParams.set('offset', String(reportOffset))
    reportParams.set('status', reportStatus)
    if (reportServerId.trim()) reportParams.set('server_id', reportServerId.trim())

    let healthBody = null
    let readyBody = null

    try {
      const healthRes = await api.get('/health', acceptAllStatuses)
      healthBody = healthRes.data && typeof healthRes.data === 'object' ? healthRes.data : null
      setHealth(healthBody)
      if (healthRes.status !== 200 || !healthBody?.ok) {
        setError(t('admin.errHealth'))
        setLoading(false)
        return
      }
    } catch {
      setError(t('admin.errHealth'))
      setLoading(false)
      return
    }

    try {
      const readyRes = await api.get('/health/ready', acceptAllStatuses)
      readyBody = readyRes.data && typeof readyRes.data === 'object' ? readyRes.data : null
      setReady(readyBody)
      if (readyRes.status !== 200 && readyRes.status !== 503) {
        warnings.push(t('admin.warnReadyHttp', { status: readyRes.status }))
      }
    } catch {
      setReady(null)
      warnings.push(t('admin.warnReadyHttp', { status: 'network' }))
    }

    try {
      const reqs = [
        api.get('/admin/health/deps', acceptAllStatuses),
        api.get(`/admin/audit-logs?${auditParams.toString()}`, acceptAllStatuses),
        reportsEndpointAvailable
          ? api.get(`/admin/reports/messages?${reportParams.toString()}`, acceptAllStatuses)
          : Promise.resolve({ status: 404, data: null }),
        metricsEndpointAvailable
          ? api.get('/admin/metrics', acceptAllStatuses)
          : Promise.resolve({ status: 404, data: null }),
        pushDebugEndpointAvailable
          ? api.get('/admin/push/debug', acceptAllStatuses)
          : Promise.resolve({ status: 404, data: null }),
        realtimeEndpointAvailable
          ? api.get('/admin/realtime', acceptAllStatuses)
          : Promise.resolve({ status: 404, data: null }),
        overviewEndpointAvailable
          ? api.get('/admin/overview', acceptAllStatuses)
          : Promise.resolve({ status: 404, data: null }),
      ]
      const [depsRes, auditRes, reportRes, metricsRes, pushDebugRes, realtimeRes, overviewRes] = await Promise.all(reqs)

      const depsBody = depsRes.data && typeof depsRes.data === 'object' ? depsRes.data : null
      if (depsBody?.deps && typeof depsBody.deps === 'object') {
        setDeps(depsBody)
      } else {
        setDeps(null)
        if (depsRes.status === 404) {
          warnings.push(t('admin.warnDeps404'))
        } else if (depsRes.status === 401 || depsRes.status === 403) {
          warnings.push(t('admin.warnDeps403'))
        } else {
          warnings.push(t('admin.warnDepsHttp', { status: depsRes.status }))
        }
      }

      pushHistory({
        liveness: Boolean(healthBody?.ok),
        readiness: Boolean(readyBody?.ok),
        deps: Boolean(depsBody?.ok),
        total_latency_ms: depsBody?.total_latency_ms ?? null,
      })

      if (auditRes.status === 200 && auditRes.data && Array.isArray(auditRes.data.items)) {
        setAuditLogs(auditRes.data.items)
        setAuditTotal(Number(auditRes.data.total || 0))
      } else {
        setAuditLogs([])
        setAuditTotal(0)
        if (auditRes.status === 404) {
          warnings.push(t('admin.warnAudit404'))
        } else if (auditRes.status && auditRes.status !== 200) {
          warnings.push(t('admin.warnAuditHttp', { status: auditRes.status }))
        }
      }

      if (reportRes.status === 200 && reportRes.data && Array.isArray(reportRes.data.items)) {
        setReportItems(reportRes.data.items)
        setReportTotal(Number(reportRes.data.total || 0))
        setReportsEndpointAvailable(true)
      } else {
        setReportItems([])
        setReportTotal(0)
        if (reportRes.status === 404) {
          if (reportsEndpointAvailable) setReportsEndpointAvailable(false)
          warnings.push(t('admin.warnReports404'))
        } else if (reportRes.status && reportRes.status !== 200) {
          warnings.push(t('admin.warnReportsHttp', { status: reportRes.status }))
        }
      }

      if (metricsRes.status === 200 && metricsRes.data && typeof metricsRes.data === 'object') {
        setMetrics(metricsRes.data)
        setMetricsEndpointAvailable(true)
      } else {
        setMetrics(null)
        if (metricsRes.status === 404) {
          if (metricsEndpointAvailable) setMetricsEndpointAvailable(false)
          warnings.push(t('admin.warnMetrics404'))
        }
      }

      if (pushDebugRes.status === 200 && pushDebugRes.data && typeof pushDebugRes.data === 'object') {
        setPushDebug(pushDebugRes.data)
        setPushDebugEndpointAvailable(true)
      } else {
        setPushDebug(null)
        if (pushDebugRes.status === 404) {
          if (pushDebugEndpointAvailable) setPushDebugEndpointAvailable(false)
          warnings.push(t('admin.warnPushDebug404'))
        } else if (pushDebugRes.status && pushDebugRes.status !== 200) {
          warnings.push(t('admin.warnPushDebugHttp', { status: pushDebugRes.status }))
        }
      }

      if (realtimeRes.status === 200 && realtimeRes.data && typeof realtimeRes.data === 'object') {
        setRealtime(realtimeRes.data)
        setRealtimeEndpointAvailable(true)
      } else {
        setRealtime(null)
        if (realtimeRes.status === 404) {
          if (realtimeEndpointAvailable) setRealtimeEndpointAvailable(false)
          warnings.push(t('admin.warnRealtime404'))
        } else if (realtimeRes.status && realtimeRes.status !== 200) {
          warnings.push(t('admin.warnRealtimeHttp', { status: realtimeRes.status }))
        }
      }

      if (overviewRes.status === 200 && overviewRes.data?.ok) {
        setOverview(overviewRes.data)
        setOverviewEndpointAvailable(true)
      } else {
        setOverview(null)
        if (overviewRes.status === 404) {
          if (overviewEndpointAvailable) setOverviewEndpointAvailable(false)
          warnings.push(t('admin.warnOverview404'))
        } else if (overviewRes.status && overviewRes.status !== 200) {
          warnings.push(t('admin.warnOverviewHttp', { status: overviewRes.status }))
        }
      }

      setLoadWarnings(warnings)
    } catch {
      setError(t('admin.errAdminLoad'))
      setLoadWarnings(warnings)
    } finally {
      setLoading(false)
    }
  }, [
    auditLimit,
    auditOffset,
    auditAction,
    auditServerId,
    auditFrom,
    auditTo,
    reportLimit,
    reportOffset,
    reportStatus,
    reportServerId,
    reportsEndpointAvailable,
    metricsEndpointAvailable,
    pushDebugEndpointAvailable,
    realtimeEndpointAvailable,
    overviewEndpointAvailable,
    pushHistory,
    t,
  ])

  useEffect(() => {
    load()
  }, [load])

  function applyAuditFilters(e) {
    e.preventDefault()
    setAuditOffset(0)
    load()
  }

  function clearAuditFilters() {
    setAuditAction('')
    setAuditServerId('')
    setAuditFrom('')
    setAuditTo('')
    setAuditOffset(0)
  }

  function reportStatusLabel(metadata) {
    const status = String(metadata?.status || 'open').toLowerCase()
    if (status === 'resolved') return t('admin.reportTagResolved')
    if (status === 'rejected') return t('admin.reportTagRejected')
    return t('admin.reportTagOpen')
  }

  async function updateReportStatus(auditId, status) {
    const note = window.prompt(t('admin.promptModeratorNote'))
    try {
      await api.patch(`/admin/reports/messages/${auditId}`, { status, note: note || undefined })
      await load()
    } catch {
      setError(t('admin.errUpdateReport'))
    }
  }

  const canPrev = auditOffset > 0
  const canNext = auditOffset + auditLimit < auditTotal
  const canPrevReports = reportOffset > 0
  const canNextReports = reportOffset + reportLimit < reportTotal

  const ov = overview
  const kpis = ov?.kpis
  const act = ov?.activity
  const sch = deps?.deps?.scheduler
  const pendingFromOverview = ov?.alerts?.pending_message_reports
  return {
    t,
    loading,
    error,
    setError,
    loadWarnings,
    health,
    ready,
    deps,
    history,
    auditLogs,
    auditTotal,
    auditLimit,
    auditOffset,
    setAuditOffset,
    auditAction,
    setAuditAction,
    auditServerId,
    setAuditServerId,
    auditFrom,
    setAuditFrom,
    auditTo,
    setAuditTo,
    reportItems,
    reportTotal,
    reportLimit,
    reportOffset,
    setReportOffset,
    reportStatus,
    setReportStatus,
    reportServerId,
    setReportServerId,
    metrics,
    pushDebug,
    realtime,
    overview,
    overviewEndpointAvailable,
    reportsEndpointAvailable,
    metricsEndpointAvailable,
    pushDebugEndpointAvailable,
    realtimeEndpointAvailable,
    docsUrl,
    load,
    applyAuditFilters,
    clearAuditFilters,
    reportStatusLabel,
    updateReportStatus,
    canPrev,
    canNext,
    canPrevReports,
    canNextReports,
    ov,
    kpis,
    act,
    sch,
    pendingFromOverview,
  }
}

