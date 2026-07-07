import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'src/components')
const lines = fs.readFileSync(path.join(root, 'DashboardAdminContent.jsx'), 'utf8').split(/\r?\n/)

const dedent = (slice) => slice.map((l) => (l.startsWith('  ') ? l.slice(2) : l))

const helpersImport = `import { Link } from 'react-router-dom'
import {
  AdminKpiCard as KpiCard,
  StatusBadge,
  Latency,
  formatNum,
  formatUptimeMs,
  readyStateIcon,
  readyStateLabel,
} from './AdminOverviewHelpers'
`

function writeSection(name, start, end) {
  const body = dedent(lines.slice(start - 1, end)).join('\n')
  fs.writeFileSync(
    path.join(root, `${name}.jsx`),
    `${helpersImport}
export default function ${name}(p) {
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
    embedded,
  } = p

  return (
${body.split('\n').map((l) => `    ${l}`).join('\n')}
  )
}
`
  )
}

writeSection('AdminOverviewSection', 38, 245)
writeSection('AdminDiagnosticsSection', 247, 477)
writeSection('AdminAuditSection', 479, 551)
writeSection('AdminReportsSection', 552, 630)

fs.writeFileSync(
  path.join(root, 'DashboardAdminContent.jsx'),
  `import AdminOverviewSection from './AdminOverviewSection'
import AdminDiagnosticsSection from './AdminDiagnosticsSection'
import AdminAuditSection from './AdminAuditSection'
import AdminReportsSection from './AdminReportsSection'

export default function DashboardAdminContent({ embedded, ...p }) {
  const props = { embedded, ...p }
  const { loading, error, loadWarnings } = p

  const content = (
    <>
      {error && <div className="error-banner">{error}</div>}
      {!loading &&
        loadWarnings.length > 0 &&
        loadWarnings.map((w) => (
          <div key={w} className="info-banner" style={{ marginBottom: '0.75rem' }}>
            {w}
          </div>
        ))}

      <AdminOverviewSection {...props} />
      {!loading && (
        <>
          <AdminDiagnosticsSection {...props} />
          <AdminAuditSection {...props} />
          <AdminReportsSection {...props} />
        </>
      )}
    </>
  )

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

console.log('DashboardAdminContent split done')
