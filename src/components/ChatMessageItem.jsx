import RichMessageText from './RichMessageText'
import MessageLinkPreview from './MessageLinkPreview'
import MessageVideoEmbeds from './MessageVideoEmbeds'
import ChatMessageEditBlock from './ChatMessageEditBlock'
import ChatMessageReactions from './ChatMessageReactions'
import ChatMessageActions from './ChatMessageActions'
import { resolveImageUrl } from '../lib/resolveImageUrl'

export default function ChatMessageItem({
  serverId = null,
  message,
  user,
  emojis,
  emojiMap,
  memberAvatarByUserId,
  failedAvatarKeys,
  setFailedAvatarKeys,
  composerHighlightId,
  messageNodeRef,
  editingMessageId,
  editingDraft,
  dispatchChannelUi,
  saveEdit,
  cancelEdit,
  threadRootId,
  channelType,
  reactionPickerId,
  setReactionPickerId,
  reactionPickerWrapRef,
  deleteMessage,
  startReply,
  openThread,
  pinMessage,
  reportMessage,
  showEditHistory,
  t,
}) {
  const isOwnMessage = user?.id != null && Number(message.user_id) === Number(user.id)
  const avatarSrc = message.avatar_url || memberAvatarByUserId.get(Number(message.user_id))
  const avatarKey = `${message.id}:${avatarSrc}`

  return (
    <article
      className={`message-row${message._optimistic ? ' message-row--optimistic' : ''}${
        isOwnMessage ? ' message-row--own' : ''
      }${
        composerHighlightId != null && String(message.id) === String(composerHighlightId)
          ? ' message-row--composer-history-match'
          : ''
      }`}
      id={
        composerHighlightId != null && String(message.id) === String(composerHighlightId)
          ? `hist-msg-${message.id}`
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
          alt={t('chat.userAvatar', { name: message.username || t('channelList.userFallback') })}
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
      <div className="message-content">
        <div className="message-meta">
          <strong>{message.username}</strong>
          {message.is_pinned && <span className="pin-badge">{t('chat.pinned')}</span>}
          <time>
            {new Date(message.created_at).toLocaleString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
          {message.edited_at && <span className="edited-badge">{t('common.edited')}</span>}
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
          <ChatMessageEditBlock
            editingDraft={editingDraft}
            dispatchChannelUi={dispatchChannelUi}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            t={t}
          />
        ) : (
          <>
            {message.content && message.content !== '(imagen)' && (
              <p className="message-body">
                <RichMessageText text={message.content} emojis={emojiMap} />
              </p>
            )}
            {message.content && message.content !== '(imagen)' && <MessageVideoEmbeds content={message.content} />}
            {message.content && message.content !== '(imagen)' && <MessageLinkPreview content={message.content} />}
            {message.image_url && (
              <a href={message.image_url} target="_blank" rel="noreferrer" aria-label={t('common.image')}>
                <img src={resolveImageUrl(message.image_url)} alt="" className="message-image" />
              </a>
            )}
          </>
        )}
        <ChatMessageReactions
          message={message}
          emojis={emojis}
          emojiMap={emojiMap}
          editingMessageId={editingMessageId}
          reactionPickerId={reactionPickerId}
          reactionPickerWrapRef={reactionPickerWrapRef}
          setReactionPickerId={setReactionPickerId}
          serverId={serverId}
          currentUserId={user?.id}
        />
        <ChatMessageActions
          message={message}
          user={user}
          editingMessageId={editingMessageId}
          threadRootId={threadRootId}
          channelType={channelType}
          deleteMessage={deleteMessage}
          startReply={startReply}
          openThread={openThread}
          pinMessage={pinMessage}
          reportMessage={reportMessage}
          showEditHistory={showEditHistory}
          setReactionPickerId={setReactionPickerId}
          dispatchChannelUi={dispatchChannelUi}
          t={t}
        />
      </div>
    </article>
  )
}
