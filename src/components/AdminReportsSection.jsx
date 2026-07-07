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

export default function AdminReportsSection(p) {
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
                <h3>{t('admin.reportsTitle')}</h3>
                {!reportsEndpointAvailable ? (
                  <p className="muted small">{t('admin.reports404')}</p>
                ) : null}
                <form onSubmit={(e) => e.preventDefault()} className="form-inline" style={{ marginBottom: '0.6rem', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <select value={reportStatus} onChange={(e) => { setReportStatus(e.target.value); setReportOffset(0) }}>
                    <option value="open">{t('admin.reportStatusOpen')}</option>
                    <option value="resolved">{t('admin.reportStatusResolved')}</option>
                    <option value="rejected">{t('admin.reportStatusRejected')}</option>
                    <option value="all">{t('admin.reportStatusAll')}</option>
                  </select>
                  <input
                    placeholder={t('admin.auditServerIdPh')}
                    aria-label={t('admin.auditServerIdPh')}
                    value={reportServerId}
                    onChange={(e) => { setReportServerId(e.target.value); setReportOffset(0) }}
                    style={{ width: '120px' }}
                  />
                  <button type="button" className="btn ghost" onClick={load}>
                    {t('common.refresh')}
                  </button>
                </form>
                {reportItems.length === 0 ? (
                  <p className="muted small">{t('admin.reportsEmpty')}</p>
                ) : (
                  <ul>
                    {reportItems.map((r) => (
                      <li key={`report-${r.id}`}>
                        <span>{new Date(r.created_at).toLocaleTimeString()}</span>
                        <span>
                          {r.report_action === 'dm_message_report_user'
                            ? t('admin.reportLineDm')
                            : t('admin.reportLineChannel')}{' '}
                          ┬À #{r.id} ┬À {t('admin.reportLineMsg')}
                          {r.target_message_id ?? t('admin.reportLineNa')} ┬À {t('admin.reportLineBy')}{' '}
                          {r.reporter_username || `user:${r.reporter_user_id}`}
                        </span>
                        <span>{reportStatusLabel(r.metadata)}</span>
                        <span style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button type="button" className="btn ghost small" onClick={() => updateReportStatus(r.id, 'resolved')}>
                            {t('admin.resolve')}
                          </button>
                          <button type="button" className="btn ghost small" onClick={() => updateReportStatus(r.id, 'rejected')}>
                            {t('admin.reject')}
                          </button>
                          <button type="button" className="btn ghost small" onClick={() => updateReportStatus(r.id, 'open')}>
                            {t('admin.reopen')}
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="status-actions" style={{ marginTop: '0.55rem', display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn ghost"
                    disabled={!canPrevReports}
                    onClick={() => setReportOffset((v) => Math.max(0, v - reportLimit))}
                  >
                    {t('admin.previous')}
                  </button>
                  <button
                    type="button"
                    className="btn ghost"
                    disabled={!canNextReports}
                    onClick={() => setReportOffset((v) => v + reportLimit)}
                  >
                    {t('admin.next')}
                  </button>
                  <span className="muted small" style={{ margin: 0 }}>
                    {t('admin.showingRange', {
                      from: reportTotal === 0 ? 0 : reportOffset + 1,
                      to: Math.min(reportOffset + reportLimit, reportTotal),
                      total: reportTotal,
                    })}
                  </span>
                </div>
              </div>
  )
}
