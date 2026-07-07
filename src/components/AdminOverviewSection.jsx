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

export default function AdminOverviewSection(p) {
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
        <div className="admin-overview">
          <div className="admin-overview-top">
            <h1 className="admin-overview-title">­ƒôè {t('admin.title')}</h1>
            <div className="status-actions" style={{ marginTop: 0 }}>
              <button type="button" className="btn secondary" onClick={load} disabled={loading}>
                {t('admin.refresh')} ­ƒöä
              </button>
              {!embedded ? (
                <Link to="/" className="btn ghost">
                  {t('admin.back')}
                </Link>
              ) : null}
            </div>
          </div>
    
          {loading ? (
            <p className="muted">{t('admin.checking')}</p>
          ) : (
            <>
              <div className="admin-kpi-grid">
                <KpiCard
                  icon="­ƒæÑ"
                  title={t('admin.kpiUsers')}
                  value={kpis ? formatNum(kpis.users.total) : 'ÔÇö'}
                  delta={kpis?.users?.delta_pct_24h}
                  deltaLabel={t('admin.kpiUsersDelta')}
                  sub={
                    kpis
                      ? t('admin.kpiUsersSubNew', { count: formatNum(kpis.users.new_today) })
                      : t('admin.kpiUsersSubFallback')
                  }
                />
                <KpiCard icon="­ƒÄ½" title={t('admin.kpiLicenses')} value="ÔÇö" sub={t('admin.kpiLicensesSub')} />
                <KpiCard icon="­ƒÆ░" title={t('admin.kpiRevenue')} value="ÔÇö" sub={t('admin.kpiRevenueSub')} />
                <KpiCard
                  icon="­ƒÆ¼"
                  title={t('admin.kpiMessages')}
                  value={kpis ? formatNum(kpis.messages.total_in_db) : 'ÔÇö'}
                  delta={kpis?.messages?.delta_pct_hour_vs_prior}
                  deltaLabel={t('admin.kpiMessagesDelta')}
                  sub={
                    kpis
                      ? t('admin.kpiMessagesSub', {
                          ch: formatNum(kpis.messages.channel_total),
                          dm: formatNum(kpis.messages.dm_total),
                        })
                      : t('admin.kpiMessagesSubTotal')
                  }
                />
              </div>
    
              {(health || ready || deps?.deps) ? (
                <div className="admin-health-strip">
                  <h3>
                    <span>­ƒƒó {t('admin.healthTitle')}</span>
                    <span className="muted small">
                      {t('admin.healthLastCheck')}{' '}
                      {ready?.checked_at
                        ? new Date(ready.checked_at).toLocaleString()
                        : deps?.checked_at
                          ? new Date(deps.checked_at).toLocaleString()
                          : 'ÔÇö'}
                    </span>
                  </h3>
    
                  <div
                    className="admin-probes-grid"
                    style={{
                      display: 'grid',
                      gap: '0.75rem',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div className="admin-probe-card" style={{ padding: '0.65rem 0.75rem', border: '1px solid var(--border, #333)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                        <strong>{t('admin.healthLivenessTitle')}</strong>
                        <code className="inline-code small">{t('admin.healthLivenessPath')}</code>
                        <StatusBadge
                          ok={Boolean(health?.ok)}
                          label={health?.ok ? t('admin.statusOk') : t('admin.statusError')}
                        />
                      </div>
                      <p className="muted small" style={{ margin: 0 }}>{t('admin.healthLivenessHint')}</p>
                    </div>
                    <div className="admin-probe-card" style={{ padding: '0.65rem 0.75rem', border: '1px solid var(--border, #333)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                        <strong>{t('admin.healthReadinessTitle')}</strong>
                        <code className="inline-code small">{t('admin.healthReadinessPath')}</code>
                        <StatusBadge
                          ok={Boolean(ready?.ok)}
                          label={ready?.ok ? t('admin.statusOk') : t('admin.statusError')}
                        />
                      </div>
                      <p className="muted small" style={{ margin: '0 0 0.35rem' }}>{t('admin.healthReadinessHint')}</p>
                      {ready ? (
                        <div className="admin-health-line">
                          <span>
                            <strong>{t('admin.healthPostgres')}</strong> {readyStateIcon(ready.postgres)}{' '}
                            {readyStateLabel(ready.postgres, t)}
                          </span>
                          <span>
                            <strong>{t('admin.healthRedis')}</strong> {readyStateIcon(ready.redis)}{' '}
                            {readyStateLabel(ready.redis, t)}
                          </span>
                          <span>
                            <strong>{t('admin.healthStorage')}</strong> {readyStateIcon(ready.storage)}{' '}
                            {ready.storage || 'ÔÇö'}
                          </span>
                        </div>
                      ) : (
                        <p className="muted small" style={{ margin: 0 }}>{t('admin.na')}</p>
                      )}
                    </div>
                  </div>
    
                  {deps?.deps ? (
                    <>
                      <h4 className="muted small" style={{ margin: '0 0 0.45rem' }}>GET /admin/health/deps</h4>
                      <div className="admin-health-line">
                        <span>
                          <strong>{t('admin.healthApi')}</strong> {health?.ok ? 'Ô£à' : 'ÔØî'}{' '}
                          <Latency ms={deps.deps.api?.latency_ms} />
                        </span>
                        <span>
                          <strong>{t('admin.healthDb')}</strong> {deps.deps.db?.ok ? 'Ô£à' : 'ÔØî'}{' '}
                          <Latency ms={deps.deps.db?.latency_ms} />
                        </span>
                        <span>
                          <strong>{t('admin.healthRedis')}</strong>{' '}
                          {deps.deps.redis?.enabled ? (deps.deps.redis?.ok ? 'Ô£à' : 'ÔØî') : 'ÔÜ¬'}{' '}
                          <Latency ms={deps.deps.redis?.latency_ms} />
                        </span>
                        <span>
                          <strong>{t('admin.healthStorage')}</strong> {deps.deps.storage?.ok ? 'Ô£à' : 'ÔØî'} (
                          {deps.deps.storage?.driver || 'local'})
                        </span>
                        <span>
                          <strong>{t('admin.healthScheduler')}</strong>{' '}
                          {!sch?.configured ? `ÔÜ¬ ${t('admin.schedulerNotConfigured')}` : sch?.ok ? 'Ô£à' : 'ÔØî'}
                          {sch?.configured && sch?.version
                            ? ` v${sch.version}${sch?.legacy ? ` ${t('admin.schedulerLegacy')}` : ''}`
                            : ''}
                        </span>
                      </div>
                      <p className="muted small" style={{ margin: '0.55rem 0 0' }}>
                        {t('admin.healthFooterProcess')} {formatUptimeMs(deps.uptime_ms)} ┬À {t('admin.healthFooterApp')}{' '}
                        <code className="inline-code">{deps.version || 'unknown'}</code> ┬À {t('admin.healthFooterCheck')}{' '}
                        <Latency ms={deps.total_latency_ms} />
                      </p>
                    </>
                  ) : null}
                </div>
              ) : null}
    
              <div className="admin-overview-columns">
                <div className="admin-overview-panel">
                  <h3>­ƒôê {t('admin.activityTitle')}</h3>
                  <ul>
                    <li>
                      {t('admin.actMsgHourCh')}{' '}
                      {act?.messages_last_hour ? formatNum(act.messages_last_hour.channel) : 'ÔÇö'}
                    </li>
                    <li>
                      {t('admin.actMsgHourDm')} {act?.messages_last_hour ? formatNum(act.messages_last_hour.dm) : 'ÔÇö'}
                    </li>
                    <li>
                      {t('admin.actUsers24h')}{' '}
                      {act?.users_active_24h != null ? formatNum(act.users_active_24h) : 'ÔÇö'}
                    </li>
                    <li>
                      {t('admin.actNewUsersToday')} {act?.users_new_today != null ? formatNum(act.users_new_today) : 'ÔÇö'}
                    </li>
                    {kpis ? (
                      <li>
                        {t('admin.actServersTotal')} {formatNum(kpis.servers_total)}
                      </li>
                    ) : null}
                    {metrics ? (
                      <li className="muted small" style={{ listStyle: 'none', paddingLeft: 0 }}>
                        {t('admin.actMetricsProcess', {
                          ch: metrics.messages_last_60s?.channel ?? 0,
                          dm: metrics.messages_last_60s?.dm ?? 0,
                        })}
                      </li>
                    ) : null}
                  </ul>
                </div>
                <div className="admin-overview-panel">
                  <h3>ÔÜá´©Å {t('admin.alertsTitle')}</h3>
                  <ul>
                    <li>{t('admin.alertLicenses')}</li>
                    {health?.ok && ready && !ready.ok ? (
                      <li>{t('admin.alertReadinessFailed')}</li>
                    ) : null}
                    <li>
                      {t('admin.alertReportsPending')}{' '}
                      {pendingFromOverview != null ? formatNum(pendingFromOverview) : 'ÔÇö'}
                    </li>
                    <li>{t('admin.alertWeakPw')}</li>
                    {sch?.configured && sch?.legacy ? <li>{t('admin.alertSchedulerLegacy')}</li> : null}
                    {sch?.configured && sch?.hint ? <li>{sch.hint}</li> : null}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
  )
}
