import { Link } from 'react-router-dom'
import {
  AdminKpiCard as KpiCard,
  StatusBadge,
  Latency,
  formatNum,
  formatUptimeMs,
  readyStateIcon,
  readyStateLabel,
} from './AdminOverviewHelpers'

export default function AdminAuditSection(p) {
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
              <div className="status-history">
                <h3>{t('admin.auditTitle')}</h3>
                <form onSubmit={applyAuditFilters} className="form-inline" style={{ marginBottom: '0.6rem', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <input
                    placeholder={t('admin.auditActionPh')}
                    aria-label={t('admin.auditActionPh')}
                    value={auditAction}
                    onChange={(e) => setAuditAction(e.target.value)}
                    style={{ minWidth: '180px' }}
                  />
                  <input
                    placeholder={t('admin.auditServerIdPh')}
                    aria-label={t('admin.auditServerIdPh')}
                    value={auditServerId}
                    onChange={(e) => setAuditServerId(e.target.value)}
                    style={{ width: '120px' }}
                  />
                  <input
                    type="datetime-local"
                    value={auditFrom}
                    onChange={(e) => setAuditFrom(e.target.value)}
                    title={t('admin.auditFromTitle')}
                    aria-label={t('admin.auditFromTitle')}
                  />
                  <input
                    type="datetime-local"
                    value={auditTo}
                    onChange={(e) => setAuditTo(e.target.value)}
                    title={t('admin.auditToTitle')}
                    aria-label={t('admin.auditToTitle')}
                  />
                  <button type="submit" className="btn secondary">
                    {t('admin.apply')}
                  </button>
                  <button type="button" className="btn ghost" onClick={clearAuditFilters}>
                    {t('admin.clear')}
                  </button>
                </form>
                {auditLogs.length === 0 ? (
                  <p className="muted small">{t('admin.auditEmpty')}</p>
                ) : (
                  <ul>
                    {auditLogs.map((log) => (
                      <li key={log.id}>
                        <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                        <span>{log.action}</span>
                        <span>{log.actor_username || `user:${log.actor_user_id}`}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="status-actions" style={{ marginTop: '0.55rem', display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn ghost"
                    disabled={!canPrev}
                    onClick={() => setAuditOffset((v) => Math.max(0, v - auditLimit))}
                  >
                    {t('admin.previous')}
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    disabled={!canNext}
                    onClick={() => setAuditOffset((v) => v + auditLimit)}
                  >
                    {t('admin.next')}
                  </button>
                  <span className="muted small" style={{ margin: 0 }}>
                    {t('admin.showingRange', {
                      from: auditTotal === 0 ? 0 : auditOffset + 1,
                      to: Math.min(auditOffset + auditLimit, auditTotal),
                      total: auditTotal,
                    })}
                  </span>
                </div>
              </div>
  )
}
