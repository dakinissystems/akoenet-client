import ChatPinnedStrip from './ChatPinnedStrip'
import ChatMessageItem from './ChatMessageItem'

export default function ChatMessageList({
  pinnedMessages,
  jumpToMessage,
  typingLine,
  sendError,
  messages,
  isVoice,
  user,
  emojis,
  emojiMap,
  memberAvatarByUserId,
  failedAvatarKeys,
  setFailedAvatarKeys,
  composerHighlightId,
  messageNodeRef,
  bottomRef,
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
  return (
    <>
      <ChatPinnedStrip
        pinnedMessages={pinnedMessages}
        jumpToMessage={jumpToMessage}
        emojiMap={emojiMap}
        t={t}
      />
      <div className="message-list">
        {typingLine && (
          <div className="typing-bar" role="status">
            <span className="typing-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            {typingLine}
          </div>
        )}
        {sendError && <div className="error-banner inline">{sendError}</div>}
        {messages.length === 0 && (
          <div className="empty-chat-tip">
            <p className="empty-chat-title">{t('chat.quietTitle')}</p>
            <p className="empty-chat-sub">{isVoice ? t('chat.quietVoice') : t('chat.quietText')}</p>
          </div>
        )}
        {messages.map((m) => (
          <ChatMessageItem
            key={m.id}
            message={m}
            user={user}
            emojis={emojis}
            emojiMap={emojiMap}
            memberAvatarByUserId={memberAvatarByUserId}
            failedAvatarKeys={failedAvatarKeys}
            setFailedAvatarKeys={setFailedAvatarKeys}
            composerHighlightId={composerHighlightId}
            messageNodeRef={messageNodeRef}
            editingMessageId={editingMessageId}
            editingDraft={editingDraft}
            dispatchChannelUi={dispatchChannelUi}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            threadRootId={threadRootId}
            channelType={channelType}
            reactionPickerId={reactionPickerId}
            setReactionPickerId={setReactionPickerId}
            reactionPickerWrapRef={reactionPickerWrapRef}
            deleteMessage={deleteMessage}
            startReply={startReply}
            openThread={openThread}
            pinMessage={pinMessage}
            reportMessage={reportMessage}
            showEditHistory={showEditHistory}
            t={t}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </>
  )
}
