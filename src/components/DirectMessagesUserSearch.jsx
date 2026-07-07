import { isPresenceOnline } from '../lib/dmConversationUi'

export default function DirectMessagesUserSearch({
  userQuery,
  setUserQuery,
  searchUsers,
  results,
  startConversation,
  t,
}) {
  return (
    <>
      <form onSubmit={searchUsers} className="form-inline">
        <input
          id="dm-search-user"
          name="user_query"
          placeholder={t('dm.searchUserPh')}
          aria-label={t('dm.searchUserPh')}
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
        />
        <button type="submit" className="btn secondary">
          {t('dm.searchUsersBtn')}
        </button>
      </form>
      {results.length > 0 && (
        <div className="dm-search-results">
          <p className="muted small">{t('dm.pickUserHint')}</p>
          {results.map((u) => (
            <button
              key={u.id}
              type="button"
              className="server-tile"
              onClick={() => startConversation(u.id)}
            >
              <span className="server-initial">{u.username.slice(0, 2).toUpperCase()}</span>
              <span className="server-name">{u.username}</span>
              <span className={`dm-presence-dot ${isPresenceOnline(u?.presence_status) ? 'online' : 'offline'}`} />
            </button>
          ))}
        </div>
      )}
      {userQuery.trim().length > 1 && results.length === 0 && (
        <p className="muted small">{t('dm.noUsersFound')}</p>
      )}
    </>
  )
}
