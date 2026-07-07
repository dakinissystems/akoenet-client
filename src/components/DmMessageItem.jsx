import RichMessageText from './RichMessageText'
import MessageLinkPreview from './MessageLinkPreview'
import MessageVideoEmbeds from './MessageVideoEmbeds'
import { resolveImageUrl } from '../lib/resolveImageUrl'

export default function DmMessageItem({
  message,
  user,
  composerHighlightId,
  messageNodeRef,
  editingMessageId,
  editingDraft,
  dispatchConvUi,
  saveDmEdit,
  cancelDmEdit,
  startDmReply,
  reportDmMessage,
  showDmEditHistory,
  failedAvatarKeys,
  setFailedAvatarKeys,
  t,
}) {
  const avatarSrc = message.avatar_url || (message._optimistic && user?.avatar_url)
  const avatarKey = `${message.id}:${avatarSrc || user?.avatar_url || ''}`

  return (
    <article
      className={`message-row${message._optimistic ? ' message-row--optimistic' : ''}${
        composerHighlightId != null && String(message.id) === String(composerHighlightId)
          ? ' message-row--composer-history-match'
          : ''
      }`}
      id={
        composerHighlightId != null && String(message.id) === String(composerHighlightId)
          ? `dm-hist-msg-${message.id}`
          : undefined
      }
      ref={(el) => {
        if (el) messageNodeRef.current.set(message.id, el)
        else messageNodeRef.current.delete(message.id)
      }}
    >
      {avatarSrc && !failedAvatarKeys.has(avatarKey) ? (
        <img
          className="avatar avatar-img"
          src={resolveImageUrl(avatarSrc)}
          alt=""
          onError={() =>
            setFailedAvatarKeys((prev) => {
              const next = new Set(prev)
              next.add(avatarKey)
              return next
            })
          }
        />
      ) : (
        <div className="avatar">{message.username?.slice(0, 1).toUpperCase()}</div>
      )}
      <div>
        <div className="dm-message-meta-row">
          <div className="message-meta">
            <strong>{message.username}</strong>
            <time>
              {new Date(message.created_at).toLocaleString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </time>
            {message.edited_at && <span className="edited-badge">{t('common.edited')}</span>}
          </div>
          <div className="message-actions dm-message-actions" aria-label={t('chat.messageActionsAria')}>
            {!message._optimistic && editingMessageId !== message.id && (
              <button
                type="button"
                className="message-action-icon"
                title={t('chat.replyTitle')}
                aria-label={t('chat.replyAria')}
                onClick={() => startDmReply(message)}
              >
                ↩
              </button>
            )}
            {user?.id != null && Number(message.sender_id) !== Number(user.id) && !message._optimistic && (
              <button
                type="button"
                className="message-action-icon"
                title={t('chat.reportTitle')}
                aria-label={t('chat.reportAria')}
                onClick={() => reportDmMessage(message.id)}
              >
                🚩
              </button>
            )}
            {user?.id != null &&
              Number(message.sender_id) === Number(user.id) &&
              !message._optimistic &&
              message.content &&
              message.content !== '(imagen)' &&
              editingMessageId !== message.id && (
                <button
                  type="button"
                  className="message-action-icon"
                  title={t('chat.editTitle')}
                  aria-label={t('chat.editAria')}
                  onClick={() =>
                    dispatchConvUi({
                      type: 'start-edit',
                      id: message.id,
                      draft: message.content || '',
                    })
                  }
                >
                  ✎
                </button>
              )}
            {!!message.edited_at &&
              !message._optimistic &&
              Number(message.sender_id) === Number(user?.id) && (
                <button
                  type="button"
                  className="message-action-icon"
                  title={t('chat.viewHistoryTitle')}
                  aria-label={t('chat.viewHistoryAria')}
                  onClick={() => showDmEditHistory(message.id)}
                >
                  🕘
                </button>
              )}
          </div>
        </div>
        {(message.reply_preview_username || message.reply_preview_content) && (
          <div className="message-reply-preview">
            <span className="message-reply-preview-label">
              {t('chat.replyingTo', {
                name: message.reply_preview_username || t('chat.replyingToGeneric'),
              })}
            </span>
            {message.reply_preview_content && message.reply_preview_content !== '(imagen)' && (
              <span className="message-reply-preview-snippet">
                {String(message.reply_preview_content).slice(0, 100)}
              </span>
            )}
          </div>
        )}
        {editingMessageId === message.id ? (
          <div className="message-edit-block">
            <textarea
              className="composer-input message-edit-textarea"
              value={editingDraft}
              aria-label={t('chat.editMessage', { defaultValue: 'Edit message' })}
              onChange={(e) => dispatchConvUi({ type: 'set-editing-draft', draft: e.target.value })}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  saveDmEdit()
                }
                if (e.key === 'Escape') cancelDmEdit()
              }}
            />
            <div className="message-edit-actions">
              <button type="button" className="btn primary small" onClick={saveDmEdit}>
                {t('common.save')}
              </button>
              <button type="button" className="btn ghost small" onClick={cancelDmEdit}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {message.content && message.content !== '(imagen)' && (
              <p className="message-body">
                <RichMessageText text={message.content} emojis={{}} />
              </p>
            )}
            {message.content && message.content !== '(imagen)' && <MessageVideoEmbeds content={message.content} />}
            {message.content && message.content !== '(imagen)' && <MessageLinkPreview content={message.content} />}
            {message.image_url && (
              <a
                href={resolveImageUrl(message.image_url)}
                target="_blank"
                rel="noreferrer"
                aria-label={t('common.image')}
              >
                <img src={resolveImageUrl(message.image_url)} alt="" className="message-image" />
              </a>
            )}
          </>
        )}
      </div>
    </article>
  )
}
