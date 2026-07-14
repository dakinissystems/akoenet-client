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
} from './AdminOverviewHelpers'

export default function AdminDiagnosticsSection(p) {
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
    <>
              <p className="muted small" style={{ marginTop: '1rem' }}>
                {t('admin.footerHint')}
              </p>
              <div className="status-meta">
                <span>
                  <strong>{t('admin.metaVersion')}</strong> {deps?.version || 'unknown'}
                </span>
                <span>
                  <strong>{t('admin.metaUptime')}</strong> {deps?.uptime_ms ?? 0} ms
                </span>
                <span>
                  <strong>{t('admin.metaTotalCheck')}</strong> {deps?.total_latency_ms ?? 0} ms
                </span>
              </div>
              {metrics && (
                <div className="status-meta" style={{ marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span>
                    <strong>{t('admin.metaMsgsTotal')}</strong> ch {metrics.messages_total?.channel ?? 0} {SEP} dm{' '}
                    {metrics.messages_total?.dm ?? 0}
                  </span>
                  <span>
                    <strong>{t('admin.metaMsgs60')}</strong> ch {metrics.messages_last_60s?.channel ?? 0} {SEP} dm{' '}
                    {metrics.messages_last_60s?.dm ?? 0}
                  </span>
                  <span className="muted small">
                    {t('admin.metaProcessUptime', { sec: Math.round((metrics.uptime_ms || 0) / 1000) })}
                  </span>
                </div>
              )}
              <div className="status-history">
                <h3>{t('admin.realtimeStatusTitle')}</h3>
                {!realtimeEndpointAvailable ? (
                  <p className="muted small">{t('admin.realtimeStatus404')}</p>
                ) : realtime ? (
                  <div className="status-meta" style={{ marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <span>
                      <strong>{t('admin.realtimeConnectedClients')}</strong>{' '}
                      {formatNum(realtime?.socket_connected_clients ?? 0)}
                    </span>
                    <span>
                      <strong>{t('admin.realtimeNamespaceSockets')}</strong>{' '}
                      {formatNum(realtime?.namespace_connected_sockets ?? 0)}
                    </span>
                    <span>
                      <strong>{t('admin.realtimeRoomsTotal')}</strong> {formatNum(realtime?.rooms?.total ?? 0)}
                    </span>
                    <span>
                      <strong>{t('admin.realtimeRoomsUser')}</strong> {formatNum(realtime?.rooms?.user ?? 0)}
                    </span>
                    <span>
                      <strong>{t('admin.realtimeRoomsVoice')}</strong> {formatNum(realtime?.rooms?.voice ?? 0)}
                    </span>
                  </div>
                ) : (
                  <p className="muted small">{t('admin.na')}</p>
                )}
              </div>
              <div className="status-history">
                <h3>{t('admin.mobileStatusTitle')}</h3>
                {!pushDebugEndpointAvailable ? (
                  <p className="muted small">{t('admin.mobileStatus404')}</p>
                ) : pushDebug ? (
                  <>
                    <div className="status-grid">
                      <div className="status-item">
                        <strong>{t('admin.mobileAndroidFcm')}</strong>
                        <div className="status-right">
                          <StatusBadge
                            ok={Boolean(pushDebug?.configured?.android_fcm)}
                            label={pushDebug?.configured?.android_fcm ? t('admin.statusOk') : t('admin.statusError')}
                          />
                        </div>
                      </div>
                      <div className="status-item">
                        <strong>{t('admin.mobileWebPush')}</strong>
                        <div className="status-right">
                          <StatusBadge
                            ok={Boolean(pushDebug?.configured?.web_push_vapid)}
                            label={pushDebug?.configured?.web_push_vapid ? t('admin.statusOk') : t('admin.statusError')}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="status-meta" style={{ marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span>
                        <strong>{t('admin.mobileNativeTokens')}</strong>{' '}
                        {formatNum(pushDebug?.subscriptions?.native_total ?? 0)}
                      </span>
                      <span>
                        <strong>{t('admin.mobileAndroidTokens')}</strong>{' '}
                        {formatNum(pushDebug?.subscriptions?.native_android_total ?? 0)}
                      </span>
                      <span>
                        <strong>{t('admin.mobileIosTokens')}</strong>{' '}
                        {formatNum(pushDebug?.subscriptions?.native_ios_total ?? 0)}
                      </span>
                      <span>
                        <strong>{t('admin.mobileUsersAndroid')}</strong>{' '}
                        {formatNum(pushDebug?.users?.with_android_native ?? 0)}
                      </span>
                    </div>
                    <p className="muted small" style={{ marginTop: '0.5rem' }}>
                      {t('admin.mobileHint')}
                    </p>
                  </>
                ) : (
                  <p className="muted small">{t('admin.na')}</p>
                )}
              </div>
              <div className="status-grid">
                <div className="status-item">
                  <strong>{t('admin.healthApi')}</strong>
                  <div className="status-right">
                    <StatusBadge
                      ok={Boolean(health?.ok)}
                      label={health?.ok ? t('admin.statusOk') : t('admin.statusError')}
                    />
                    <Latency ms={deps?.deps?.api?.latency_ms} />
                  </div>
                </div>
                <div className="status-item">
                  <strong>{t('admin.healthDb')}</strong>
                  <div className="status-right">
                    <StatusBadge
                      ok={Boolean(deps?.deps?.db?.ok)}
                      label={deps?.deps?.db?.ok ? t('admin.statusOk') : t('admin.statusError')}
                    />
                    <Latency ms={deps?.deps?.db?.latency_ms} />
                  </div>
                </div>
                <div className="status-item">
                  <strong>{t('admin.healthRedis')}</strong>
                  <div className="status-right">
                    <StatusBadge
                      ok={Boolean(deps?.deps?.redis?.ok)}
                      label={
                        deps?.deps?.redis?.enabled
                          ? deps?.deps?.redis?.ok
                            ? t('admin.statusOk')
                            : t('admin.statusError')
                          : t('admin.statusNoConfig')
                      }
                    />
                    <Latency ms={deps?.deps?.redis?.latency_ms} />
                  </div>
                </div>
                <div className="status-item">
                  <strong>
                    {t('admin.healthStorage')} ({deps?.deps?.storage?.driver || 'local'})
                  </strong>
                  <div className="status-right">
                    <StatusBadge
                      ok={Boolean(deps?.deps?.storage?.ok)}
                      label={deps?.deps?.storage?.ok ? t('admin.statusOk') : t('admin.statusError')}
                    />
                    <Latency ms={deps?.deps?.storage?.latency_ms} />
                  </div>
                </div>
                <div className="status-item">
                  <strong>{t('admin.healthScheduler')}</strong>
                  <div className="status-right">
                    <StatusBadge
                      ok={
                        !deps?.deps?.scheduler?.configured ||
                        Boolean(deps?.deps?.scheduler?.ok)
                      }
                      label={
                        !deps?.deps?.scheduler?.configured
                          ? t('admin.statusNotSet')
                          : deps?.deps?.scheduler?.ok
                            ? t('admin.statusOk')
                            : t('admin.statusError')
                      }
                    />
                    <Latency ms={deps?.deps?.scheduler?.latency_ms} />
                    {deps?.deps?.scheduler?.version ? (
                      <span className="muted small" style={{ marginLeft: '0.35rem' }}>
                        {deps.deps.scheduler.service || t('admin.schedulerFallback')} v{deps.deps.scheduler.version}
                        {deps?.deps?.scheduler?.legacy ? ` ${t('admin.legacyApi')}` : ''}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              {deps?.deps?.scheduler?.hint ? (
                <p className="muted small" style={{ marginTop: '0.5rem' }}>
                  {deps.deps.scheduler.hint}
                </p>
              ) : null}
    
              <div className="status-actions">
                <button type="button" className="btn secondary" onClick={load}>
                  {t('admin.retry')}
                </button>
                <a href={docsUrl} target="_blank" rel="noreferrer" className="btn ghost">
                  {t('admin.apiDocs')}
                </a>
                {deps?.deps?.scheduler?.admin_url ? (
                  <a
                    href={deps.deps.scheduler.admin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn ghost"
                  >
                    {t('admin.schedulerAdmin')}
                  </a>
                ) : null}
              </div>
    
              <div className="status-history">
                <h3>{t('admin.historyChecksTitle')}</h3>
                {history.length === 0 ? (
                  <p className="muted small">{t('admin.historyEmpty')}</p>
                ) : (
                  <ul>
                    {history.map((h, i) => (
                      <li key={`${h.at}-${i}`}>
                        <span>{new Date(h.at).toLocaleTimeString()}</span>
                        <span>
                          {t('admin.healthLivenessTitle')}: {h.liveness ? okIcon(true) : okIcon(false)} {SEP}{' '}
                          {t('admin.healthReadinessTitle')}: {h.readiness ? okIcon(true) : okIcon(false)}
                          {h.deps != null ? ` ${SEP} deps: ${h.deps ? okIcon(true) : okIcon(false)}` : ''}
                        </span>
                        <span>{h.total ?? t('admin.na')} ms</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
    </>
  )
}
