import { isPresenceOnline } from '../lib/dmConversationUi'

export default function DirectMessagesSidebar({
  conversations,
  selectedConversationId,
  handleSelectConversation,
  formatConversationPreview,
  t,
}) {
  return (
    <aside className="dm-conversations">
      {conversations.length === 0 ? (
        <p className="muted small">{t('dm.noConversations')}</p>
      ) : (
        conversations.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`server-tile server-tile--dm ${c.id === selectedConversationId ? 'active' : ''}`}
            onClick={() => handleSelectConversation(c.id)}
          >
            <span className="server-initial">{c.peer_username.slice(0, 2).toUpperCase()}</span>
            <span className="dm-conversation-meta">
              <span className="server-name">{c.peer_username}</span>
              <span className="dm-conversation-preview">{formatConversationPreview(c.last_message)}</span>
            </span>
            <span className="dm-conversation-time">
              {c.last_message_at
                ? new Date(c.last_message_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : ''}
            </span>
            <span
              className={`dm-presence-dot ${isPresenceOnline(c?.peer_presence_status) ? 'online' : 'offline'}`}
              title={isPresenceOnline(c?.peer_presence_status) ? t('common.online') : t('common.offline')}
            />
          </button>
        ))
      )}
    </aside>
  )
}
