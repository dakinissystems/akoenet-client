export default function DashboardJoinSection({
  newName,
  setNewName,
  joinLink,
  setJoinLink,
  joinId,
  setJoinId,
  creatingServer,
  joiningByLinkState,
  joiningById,
  createServer,
  joinByLink,
  joinServer,
  t,
}) {
  return (
    <section className="home-grid">
      <div className="card">
        <h2>{t('dashboard.home.createTitle')}</h2>
        <p className="muted small">{t('dashboard.home.createHint')}</p>
        <form onSubmit={createServer} className="form-inline">
          <input
            id="dashboard-new-server-name"
            name="server_name"
            placeholder={t('dashboard.home.serverNamePh')}
            aria-label={t('dashboard.home.serverNamePh')}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit" className="btn primary" disabled={creatingServer || !newName.trim()}>
            {creatingServer ? t('dashboard.home.creatingServer') : t('dashboard.home.createBtn')}
          </button>
        </form>
      </div>
      <div className="card card-join-server">
        <h2>{t('dashboard.home.joinTitle')}</h2>
        <p className="muted small join-lead">{t('dashboard.home.joinLead')}</p>
        <form onSubmit={joinByLink} className="form-inline invite-inline">
          <input
            id="dashboard-join-invite-link"
            name="invite_link"
            placeholder={t('dashboard.home.joinPh')}
            aria-label={t('dashboard.home.joinPh')}
            value={joinLink}
            onChange={(e) => setJoinLink(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="btn primary" disabled={joiningByLinkState || !joinLink.trim()}>
            {joiningByLinkState ? t('dashboard.home.joining') : t('dashboard.home.joinBtn')}
          </button>
        </form>
        <p className="muted small join-hint">{t('dashboard.home.joinHintFooter')}</p>
        <p className="join-or-divider muted small" role="presentation">
          {t('dashboard.home.orJoinDivider')}
        </p>
        <form onSubmit={joinServer} className="form-inline">
          <input
            id="dashboard-join-server-id"
            name="server_id"
            placeholder={t('dashboard.home.serverIdPh')}
            aria-label={t('dashboard.home.serverIdPh')}
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            inputMode="numeric"
          />
          <button type="submit" className="btn secondary" disabled={joiningById || !joinId.trim()}>
            {joiningById ? t('dashboard.home.joining') : t('dashboard.home.joinById')}
          </button>
        </form>
      </div>
    </section>
  )
}

export function DashboardServerListSection({ loading, servers, navigate, t }) {
  return (
    <section className="server-list-section">
      <h2>{t('dashboard.home.yourServers')}</h2>
      {loading ? (
        <p className="muted">{t('dashboard.home.serversLoading')}</p>
      ) : servers.length === 0 ? (
        <p className="muted">{t('dashboard.home.serversEmpty')}</p>
      ) : (
        <ul className="server-tiles">
          {servers.map((s) => (
            <li key={s.id}>
              <button type="button" className="server-tile" onClick={() => navigate(`/server/${s.id}`)}>
                <span className="server-initial">{s.name.slice(0, 2).toUpperCase()}</span>
                <span className="server-name">
                  {s.name}
                  {s.tag && String(s.tag).trim() ? (
                    <span className="server-tag-pill--dashboard" aria-hidden="true">
                      {String(s.tag).trim().toUpperCase()}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
