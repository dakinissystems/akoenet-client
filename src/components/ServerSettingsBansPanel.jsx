export default function ServerSettingsBansPanel({ serverBans, canManageServer, unbanUser, t }) {
  return (
    <div className="server-settings-tab-pane">
      <h2 className="server-settings-panel-title">{t('serverModal.bansTitle')}</h2>
      <p className="muted small">{t('serverModal.bansLead')}</p>
      {serverBans.length === 0 ? (
        <p className="muted small">{t('serverModal.noBans')}</p>
      ) : (
        <ul className="server-custom-list">
          {serverBans.map((ban) => (
            <li key={ban.id}>
              <strong>{ban.username || `user_${ban.user_id}`}</strong>
              <span className="muted small">
                ID: {ban.user_id}
                {ban.reason ? ` · ${t('serverModal.reason')}: ${ban.reason}` : ''}
              </span>
              {ban.expires_at ? (
                <span className="muted small">
                  {t('serverModal.expires')}: {new Date(ban.expires_at).toLocaleString()}
                </span>
              ) : (
                <span className="muted small">{t('serverModal.permanent')}</span>
              )}
              {canManageServer ? (
                <button type="button" className="btn small secondary" onClick={() => unbanUser(ban.user_id)}>
                  {t('serverModal.unban')}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {!canManageServer ? <p className="muted small">{t('serverModal.bansReadOnly')}</p> : null}
    </div>
  )
}
