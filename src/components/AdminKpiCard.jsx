export default function AdminKpiCard({ icon, title, value, delta, deltaLabel, sub }) {
  const d = delta
  const showDelta = d != null && !Number.isNaN(Number(d))
  return (
    <div className="admin-kpi-card">
      <div className="admin-kpi-card-head">
        <span aria-hidden>{icon}</span>
        <span>{title}</span>
      </div>
      <div className="admin-kpi-value">{value}</div>
      {showDelta ? (
        <div className={`admin-kpi-delta ${Number(d) >= 0 ? 'is-pos' : 'is-neg'}`}>
          {Number(d) >= 0 ? '+' : ''}
          {d}%
          {deltaLabel ? <span className="muted small"> {deltaLabel}</span> : null}
        </div>
      ) : null}
      {sub ? <div className="admin-kpi-sub muted">{sub}</div> : null}
    </div>
  )
}
