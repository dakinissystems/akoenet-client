import AdminOverviewSection from './AdminOverviewSection'
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
