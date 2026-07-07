export default function ChatMessageActions({
  message,
  user,
  editingMessageId,
  threadRootId,
  channelType,
  deleteMessage,
  startReply,
  openThread,
  pinMessage,
  reportMessage,
  showEditHistory,
  setReactionPickerId,
  dispatchChannelUi,
  t,
}) {
  return (
    <div className="message-actions" aria-label={t('chat.messageActionsAria')}>
      <button
        type="button"
        className="message-action-icon"
        title={t('chat.deleteTitle')}
        aria-label={t('chat.deleteAria')}
        onClick={() => deleteMessage(message.id)}
      >
        🗑️
      </button>
      {!message._optimistic && editingMessageId !== message.id && (
        <button
          type="button"
          className="message-action-icon"
          title={t('chat.replyTitle')}
          aria-label={t('chat.replyAria')}
          onClick={() => startReply(message)}
        >
          ↩
        </button>
      )}
      {!message._optimistic && !threadRootId && channelType === 'text' && (
        <button
          type="button"
          className="message-action-icon message-thread-btn"
          title={
            Number(message.thread_reply_count) > 0
              ? t('chat.threadOpenCount', { count: message.thread_reply_count })
              : t('chat.threadOpen')
          }
          aria-label={t('chat.threadOpenAria')}
          onClick={() => openThread(Number(message.id))}
        >
          <span className="message-thread-btn-inner" aria-hidden>
            #
            {Number(message.thread_reply_count) > 0 ? (
              <span className="thread-reply-count-pill">{message.thread_reply_count}</span>
            ) : null}
          </span>
        </button>
      )}
      {!message._optimistic && (
        <>
          <button
            type="button"
            className={`message-action-icon${message.is_pinned ? ' message-action-icon--on' : ''}`}
            title={message.is_pinned ? t('chat.unpin') : t('chat.pin')}
            aria-label={message.is_pinned ? t('chat.unpinAria') : t('chat.pinAria')}
            onClick={() => pinMessage(message.id, !message.is_pinned)}
          >
            📌
          </button>
          <button
            type="button"
            className="message-action-icon"
            title={t('chat.reactTitle')}
            aria-label={t('chat.reactAria')}
            onClick={() => setReactionPickerId((prev) => (prev === message.id ? null : message.id))}
          >
            ➕
          </button>
          <button
            type="button"
            className="message-action-icon"
            title={t('chat.reportTitle')}
            aria-label={t('chat.reportAria')}
            onClick={() => reportMessage(message.id)}
          >
            🚩
          </button>
          {user?.id != null &&
            Number(message.user_id) === Number(user.id) &&
            message.content &&
            message.content !== '(imagen)' && (
              <button
                type="button"
                className="message-action-icon"
                title={t('chat.editTitle')}
                aria-label={t('chat.editAria')}
                onClick={() =>
                  dispatchChannelUi({
                    type: 'start-edit',
                    id: message.id,
                    draft: message.content || '',
                  })
                }
              >
                ✎
              </button>
            )}
          {!!message.edited_at && (
            <button
              type="button"
              className="message-action-icon"
              title={t('chat.viewHistoryTitle')}
              aria-label={t('chat.viewHistoryAria')}
              onClick={() => showEditHistory(message.id)}
            >
              🕘
            </button>
          )}
        </>
      )}
    </div>
  )
}
