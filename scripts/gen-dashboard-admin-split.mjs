import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'src')
const sourcePath = path.join(root, 'pages/DashboardAdmin.jsx.orig')
const lines = fs.readFileSync(sourcePath, 'utf8').split(/\r?\n/)

const helpersBody = lines.slice(5, 65).join('\n')
  .replace('function StatusBadge', 'export function StatusBadge')
  .replace('function Latency', 'export function Latency')
  .replace('function formatNum', 'export function formatNum')
  .replace('function formatUptimeMs', 'export function formatUptimeMs')
  .replace('function readyStateIcon', 'export function readyStateIcon')
  .replace('function readyStateLabel', 'export function readyStateLabel')
  .replace('function KpiCard', 'export function AdminKpiCard')

fs.writeFileSync(
  path.join(root, 'components/AdminOverviewHelpers.jsx'),
  `import { useTranslation } from 'react-i18next'

${helpersBody}
`
)

const hookBody = lines.slice(67, 353).join('\n')
  .replace(/^export default function DashboardAdmin\(\{ embedded = false \}\) \{\n/, '')
  .replace(/^  const \{ t \} = useTranslation\(\)\n/, '  const { t } = useTranslation()\n')

const hookFooter = `
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
`

fs.writeFileSync(
  path.join(root, 'hooks/useDashboardAdmin.js'),
  `import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'

export function useDashboardAdmin() {
${hookBody}${hookFooter}
`
)

const contentInner = lines.slice(354, 962).join('\n').replace(/^  const content = \(/, '  const content = (')

fs.writeFileSync(
  path.join(root, 'components/DashboardAdminContent.jsx'),
  `import { Link } from 'react-router-dom'
import {
  AdminKpiCard as KpiCard,
  StatusBadge,
  Latency,
  formatNum,
  formatUptimeMs,
  readyStateIcon,
  readyStateLabel,
} from './AdminOverviewHelpers'

export default function DashboardAdminContent({ embedded, ...p }) {
  const {
    t, loading, error, loadWarnings, load, health, ready, deps, history,
    auditLogs, auditTotal, auditLimit, auditOffset, setAuditOffset,
    auditAction, setAuditAction, auditServerId, setAuditServerId,
    auditFrom, setAuditFrom, auditTo, setAuditTo,
    reportItems, reportTotal, reportLimit, reportOffset, setReportOffset,
    reportStatus, setReportStatus, reportServerId, setReportServerId,
    metrics, pushDebug, realtime, overview,
    overviewEndpointAvailable, reportsEndpointAvailable,
    metricsEndpointAvailable, pushDebugEndpointAvailable, realtimeEndpointAvailable,
    docsUrl, applyAuditFilters, clearAuditFilters, reportStatusLabel, updateReportStatus,
    canPrev, canNext, canPrevReports, canNextReports, ov, kpis, act, sch, pendingFromOverview,
  } = p

${contentInner}

  if (embedded) {
    return <section className="card status-page status-page--wide">{content}</section>
  }

  return (
    <div className="auth-page">
      <div className="auth-card status-page status-page--wide">{content}</div>
    </div>
  )
}
`
)

fs.writeFileSync(
  path.join(root, 'pages/DashboardAdmin.jsx'),
  `import { useDashboardAdmin } from '../hooks/useDashboardAdmin'
import DashboardAdminContent from '../components/DashboardAdminContent'

export default function DashboardAdmin({ embedded = false }) {
  const admin = useDashboardAdmin()
  return <DashboardAdminContent embedded={embedded} {...admin} />
}
`
)

console.log('DashboardAdmin split done')
