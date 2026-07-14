import { Link } from 'react-router-dom'
import {
  AdminKpiCard as KpiCard,
  StatusBadge,
  Latency,
  formatNum,
  formatUptimeMs,
  readyStateIcon,
  readyStateLabel,
  NA,
  SEP,
  okIcon,
  optionalDepIcon,
} from './AdminOverviewHelpers'

export default function AdminOverviewSection(p) {
  const {
    t, loading, load, health, ready, deps,
    metrics, overview,
    kpis, act, sch, pendingFromOverview,
    embedded,
  } = p

  return (
    <div className="admin-overview">
      <div className="admin-overview-top">
        <h1 className="admin-overview-title">{t('admin.title')}</h1>
        <div className="status-actions" style={{ marginTop: 0 }}>
          <button type="button" className="btn secondary" onClick={load} disabled={loading}>
            {t('admin.refresh')}
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
              title={t('admin.kpiUsers')}
              value={kpis ? formatNum(kpis.users.total) : NA}
              delta={kpis?.users?.delta_pct_24h}
              deltaLabel={t('admin.kpiUsersDelta')}
              sub={
                kpis
                  ? t('admin.kpiUsersSubNew', { count: formatNum(kpis.users.new_today) })
                  : t('admin.kpiUsersSubFallback')
              }
            />
            <KpiCard icon="" title={t('admin.kpiLicenses')} value={NA} sub={t('admin.kpiLicensesSub')} />
            <KpiCard icon="" title={t('admin.kpiRevenue')} value={NA} sub={t('admin.kpiRevenueSub')} />
            <KpiCard
              title={t('admin.kpiMessages')}
              value={kpis ? formatNum(kpis.messages.total_in_db) : NA}
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

          {health || ready || deps?.deps ? (
            <div className="admin-health-strip">
              <h3>
                <span>{t('admin.healthTitle')}</span>
                <span className="muted small">
                  {t('admin.healthLastCheck')}{' '}
                  {ready?.checked_at
                    ? new Date(ready.checked_at).toLocaleString()
                    : deps?.checked_at
                      ? new Date(deps.checked_at).toLocaleString()
                      : NA}
                </span>
              </h3>

              <div className="admin-probes-grid">
                <div className="admin-probe-card">
                  <div className="admin-probe-card-head">
                    <strong>{t('admin.healthLivenessTitle')}</strong>
                    <code className="inline-code small">{t('admin.healthLivenessPath')}</code>
                    <StatusBadge
                      ok={Boolean(health?.ok)}
                      label={health?.ok ? t('admin.statusOk') : t('admin.statusError')}
                    />
                  </div>
                  <p className="muted small">{t('admin.healthLivenessHint')}</p>
                </div>
                <div className="admin-probe-card">
                  <div className="admin-probe-card-head">
                    <strong>{t('admin.healthReadinessTitle')}</strong>
                    <code className="inline-code small">{t('admin.healthReadinessPath')}</code>
                    <StatusBadge
                      ok={Boolean(ready?.ok)}
                      label={ready?.ok ? t('admin.statusOk') : t('admin.statusError')}
                    />
                  </div>
                  <p className="muted small">{t('admin.healthReadinessHint')}</p>
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
                        {ready.storage || NA}
                      </span>
                    </div>
                  ) : (
                    <p className="muted small">{t('admin.na')}</p>
                  )}
                </div>
              </div>

              {deps?.deps ? (
                <>
                  <h4 className="muted small admin-deps-heading">GET /admin/health/deps</h4>
                  <div className="admin-health-line">
                    <span>
                      <strong>{t('admin.healthApi')}</strong> {okIcon(Boolean(health?.ok))}{' '}
                      <Latency ms={deps.deps.api?.latency_ms} />
                    </span>
                    <span>
                      <strong>{t('admin.healthDb')}</strong> {okIcon(Boolean(deps.deps.db?.ok))}{' '}
                      <Latency ms={deps.deps.db?.latency_ms} />
                    </span>
                    <span>
                      <strong>{t('admin.healthRedis')}</strong>{' '}
                      {optionalDepIcon(Boolean(deps.deps.redis?.enabled), Boolean(deps.deps.redis?.ok))}{' '}
                      <Latency ms={deps.deps.redis?.latency_ms} />
                    </span>
                    <span>
                      <strong>{t('admin.healthStorage')}</strong> {okIcon(Boolean(deps.deps.storage?.ok))} (
                      {deps.deps.storage?.driver || 'local'})
                    </span>
                  </div>

                  <div className="admin-scheduler-status">
                    <div className="admin-scheduler-status-head">
                      <strong>{t('admin.healthScheduler')}</strong>
                      <StatusBadge
                        ok={!sch?.configured || Boolean(sch?.ok)}
                        label={
                          !sch?.configured
                            ? t('admin.statusNotSet')
                            : sch?.ok
                              ? t('admin.statusOk')
                              : t('admin.statusError')
                        }
                      />
                      <Latency ms={sch?.latency_ms} />
                      {sch?.configured && sch?.version ? (
                        <span className="muted small">
                          {sch.service || t('admin.schedulerFallback')} v{sch.version}
                          {sch?.legacy ? ` ${t('admin.schedulerLegacy')}` : ''}
                        </span>
                      ) : null}
                    </div>
                    {sch?.configured && !sch?.ok && sch?.error ? (
                      <p className="admin-scheduler-error small">{sch.error}</p>
                    ) : null}
                    {sch?.hint ? <p className="muted small admin-scheduler-hint">{sch.hint}</p> : null}
                    {sch?.admin_url ? (
                      <a href={sch.admin_url} target="_blank" rel="noreferrer" className="btn ghost small">
                        {t('admin.schedulerAdmin')}
                      </a>
                    ) : null}
                  </div>

                  <p className="muted small admin-health-footer">
                    {t('admin.healthFooterProcess')} {formatUptimeMs(deps.uptime_ms)} {SEP}{' '}
                    {t('admin.healthFooterApp')}{' '}
                    <code className="inline-code">{deps.version || 'unknown'}</code> {SEP}{' '}
                    {t('admin.healthFooterCheck')} <Latency ms={deps.total_latency_ms} />
                  </p>
                </>
              ) : null}
            </div>
          ) : null}

          <div className="admin-overview-columns">
            <div className="admin-overview-panel">
              <h3>{t('admin.activityTitle')}</h3>
              <ul>
                <li>
                  {t('admin.actMsgHourCh')}{' '}
                  {act?.messages_last_hour ? formatNum(act.messages_last_hour.channel) : NA}
                </li>
                <li>
                  {t('admin.actMsgHourDm')}{' '}
                  {act?.messages_last_hour ? formatNum(act.messages_last_hour.dm) : NA}
                </li>
                <li>
                  {t('admin.actUsers24h')}{' '}
                  {act?.users_active_24h != null ? formatNum(act.users_active_24h) : NA}
                </li>
                <li>
                  {t('admin.actNewUsersToday')}{' '}
                  {act?.users_new_today != null ? formatNum(act.users_new_today) : NA}
                </li>
                {kpis ? (
                  <li>
                    {t('admin.actServersTotal')} {formatNum(kpis.servers_total)}
                  </li>
                ) : null}
                {metrics ? (
                  <li className="muted small admin-metrics-inline">
                    {t('admin.actMetricsProcess', {
                      ch: metrics.messages_last_60s?.channel ?? 0,
                      dm: metrics.messages_last_60s?.dm ?? 0,
                    })}
                  </li>
                ) : null}
              </ul>
            </div>
            <div className="admin-overview-panel">
              <h3>{t('admin.alertsTitle')}</h3>
              <ul>
                <li>{t('admin.alertLicenses')}</li>
                {health?.ok && ready && !ready.ok ? <li>{t('admin.alertReadinessFailed')}</li> : null}
                {sch?.configured && !sch?.ok ? (
                  <li>
                    {t('admin.alertSchedulerDown', {
                      error: sch?.error || t('admin.statusError'),
                    })}
                  </li>
                ) : null}
                <li>
                  {t('admin.alertReportsPending')}{' '}
                  {pendingFromOverview != null ? formatNum(pendingFromOverview) : NA}
                </li>
                <li>{t('admin.alertWeakPw')}</li>
                {sch?.configured && sch?.legacy ? <li>{t('admin.alertSchedulerLegacy')}</li> : null}
                {sch?.configured && sch?.hint && sch?.ok ? <li>{sch.hint}</li> : null}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
