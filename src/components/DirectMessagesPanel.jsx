import EditHistoryModal from './EditHistoryModal'
import DirectMessagesUserSearch from './DirectMessagesUserSearch'
import DirectMessagesSidebar from './DirectMessagesSidebar'
import DirectMessagesChatPanel from './DirectMessagesChatPanel'
import { useDirectMessages } from '../hooks/useDirectMessages'

export default function DirectMessagesPanel({ user }) {
  const dm = useDirectMessages(user)
  const { t } = dm

  return (
    <section className="card dm-panel">
      <h2>{t('dm.title')}</h2>
      <p className="muted small">{t('dm.lead')}</p>
      {dm.error && <div className="error-banner inline">{dm.error}</div>}
      {dm.reportFeedback && <div className="error-banner inline">{dm.reportFeedback}</div>}

      <DirectMessagesUserSearch
        userQuery={dm.userQuery}
        setUserQuery={dm.setUserQuery}
        searchUsers={dm.searchUsers}
        results={dm.results}
        startConversation={dm.startConversation}
        t={t}
      />

      <div className="dm-layout">
        <DirectMessagesSidebar
          conversations={dm.conversations}
          selectedConversationId={dm.selectedConversationId}
          handleSelectConversation={dm.handleSelectConversation}
          formatConversationPreview={dm.formatConversationPreview}
          t={t}
        />

        <DirectMessagesChatPanel dm={dm} user={user} t={t} />
      </div>

      <EditHistoryModal
        open={dm.editHistoryModalOpen}
        title={t('dm.editHistoryTitle')}
        entries={dm.editHistoryEntries}
        onClose={() => dm.dispatchConvUi({ type: 'close-edit-history' })}
      />
      <p className="muted small">
        {t('dm.sessionLabel')}
        {user?.username}
      </p>
    </section>
  )
}
