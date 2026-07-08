import { useTranslation } from 'react-i18next'
import VoiceRoom from './VoiceRoom'
import EditHistoryModal from './EditHistoryModal'
import ChatHeader from './ChatHeader'
import ChatSearchPanel from './ChatSearchPanel'
import ChatMessageList from './ChatMessageList'
import ChatComposer from './ChatComposer'
import { useChatChannel } from '../hooks/useChatChannel'

const EMPTY_MEMBERS = []
const EMPTY_EMOJIS = []

export default function Chat({
  channelId,
  channelName,
  channelType = 'text',
  user,
  members = EMPTY_MEMBERS,
  emojis = EMPTY_EMOJIS,
  voiceUserLimit,
  voiceConnectedCount,
  rtcVoiceChannelId,
  rtcVoiceChannelName,
  onVoiceSessionChange,
  onRegisterVoiceSidebarControls,
  onOpenChannelSettings,
  onOpenMembersPanel,
  membersCount = 0,
}) {
  const { t } = useTranslation()
  const chat = useChatChannel({
    channelId,
    channelName,
    channelType,
    user,
    members,
    emojis,
  })

  if (!channelId) {
    return (
      <main className="chat-panel empty">
        <div className="chat-empty-hero">
          <p className="chat-empty-title">{t('chat.emptyChoose')}</p>
          <p className="chat-empty-sub">{t('chat.emptyHint')}</p>
        </div>
      </main>
    )
  }

  const isVoice = channelType === 'voice'
  const isForum = channelType === 'forum'

  function jumpToMessage(messageId) {
    const node = chat.messageNodeRef.current.get(messageId)
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const typingNames = Object.values(chat.typingPeers)
  let typingLine = ''
  if (typingNames.length === 1) typingLine = t('chat.typingOne', { name: typingNames[0] })
  else if (typingNames.length === 2)
    typingLine = t('chat.typingTwo', { a: typingNames[0], b: typingNames[1] })
  else if (typingNames.length > 2) {
    const n = typingNames.length - 2
    typingLine =
      n === 1
        ? t('chat.typingManyOne', { a: typingNames[0], b: typingNames[1] })
        : t('chat.typingMany', { a: typingNames[0], b: typingNames[1], n })
  }

  const pinnedMessages = chat.messages
    .filter((m) => m.is_pinned)
    .sort((a, b) => new Date(b.pinned_at || b.created_at).getTime() - new Date(a.pinned_at || a.created_at).getTime())

  return (
    <main
      className={`chat-panel${chat.fileDragOver ? ' chat-panel--file-drag' : ''}${isVoice ? ' chat-panel--voice' : ''}`}
      onDragEnter={chat.onChatDragEnter}
      onDragLeave={chat.onChatDragLeave}
      onDragOver={chat.onChatDragOver}
      onDrop={chat.onChatDrop}
    >
      <ChatHeader
        channelName={channelName}
        isVoice={isVoice}
        isForum={isForum}
        channelId={channelId}
        membersCount={membersCount}
        searchOpen={chat.searchOpen}
        dispatchChannelUi={chat.dispatchChannelUi}
        refreshLatestMessages={chat.refreshLatestMessages}
        onOpenChannelSettings={onOpenChannelSettings}
        onOpenMembersPanel={onOpenMembersPanel}
        t={t}
      />

      {chat.threadRootId && !isVoice && (
        <div className="thread-banner" role="region" aria-label={t('chat.threadAria')}>
          <button type="button" className="btn ghost small" onClick={chat.closeThread}>
            {t('chat.backToChannel')}
          </button>
          <span className="thread-banner-label">
            {t('chat.threadLabel')}
            {(() => {
              const root = chat.messages.find((m) => Number(m.id) === Number(chat.threadRootId))
              const n = Number(root?.thread_reply_count)
              if (!n || n < 1) return null
              return (
                <span className="thread-banner-count">
                  {' '}
                  {n === 1 ? t('chat.threadReply_one', { count: n }) : t('chat.threadReply_other', { count: n })}
                </span>
              )
            })()}
          </span>
        </div>
      )}

      {chat.searchOpen && (
        <ChatSearchPanel
          searchQuery={chat.searchQuery}
          searchResults={chat.searchResults}
          searchBusy={chat.searchBusy}
          dispatchChannelUi={chat.dispatchChannelUi}
          runSearch={chat.runSearch}
          jumpToMessage={jumpToMessage}
          t={t}
        />
      )}

      <ChatMessageList
        pinnedMessages={pinnedMessages}
        jumpToMessage={jumpToMessage}
        typingLine={typingLine}
        sendError={chat.sendError}
        messages={chat.messages}
        isVoice={isVoice}
        user={user}
        emojis={emojis}
        emojiMap={chat.emojiMap}
        memberAvatarByUserId={chat.memberAvatarByUserId}
        failedAvatarKeys={chat.failedAvatarKeys}
        setFailedAvatarKeys={chat.setFailedAvatarKeys}
        composerHighlightId={chat.composerHighlightId}
        messageNodeRef={chat.messageNodeRef}
        bottomRef={chat.bottomRef}
        editingMessageId={chat.editingMessageId}
        editingDraft={chat.editingDraft}
        dispatchChannelUi={chat.dispatchChannelUi}
        saveEdit={chat.saveEdit}
        cancelEdit={chat.cancelEdit}
        threadRootId={chat.threadRootId}
        channelType={channelType}
        reactionPickerId={chat.reactionPickerId}
        setReactionPickerId={chat.setReactionPickerId}
        reactionPickerWrapRef={chat.reactionPickerWrapRef}
        deleteMessage={chat.deleteMessage}
        startReply={chat.startReply}
        openThread={chat.openThread}
        pinMessage={chat.pinMessage}
        reportMessage={chat.reportMessage}
        showEditHistory={chat.showEditHistory}
        t={t}
      />

      {rtcVoiceChannelId != null && (
        <VoiceRoom
          channelId={rtcVoiceChannelId}
          user={user}
          autoJoin={isVoice && !chat.isMobileViewport}
          compact={!isVoice}
          channelLabel={rtcVoiceChannelName}
          voiceUserLimit={voiceUserLimit}
          voiceConnectedCount={voiceConnectedCount}
          onVoiceSessionChange={onVoiceSessionChange}
          onRegisterVoiceSidebarControls={onRegisterVoiceSidebarControls}
        />
      )}

      <ChatComposer
        replyTo={chat.replyTo}
        dispatchChannelUi={chat.dispatchChannelUi}
        onFile={chat.onFile}
        onPickFromMobileDevice={chat.onPickFromMobileDevice}
        composerInputRef={chat.composerInputRef}
        text={chat.text}
        setText={chat.setText}
        channelId={channelId}
        emojis={emojis}
        emojiPickerWrapRef={chat.emojiPickerWrapRef}
        pickerOpen={chat.pickerOpen}
        setPickerOpen={chat.setPickerOpen}
        insertEmojiShortcode={chat.insertEmojiShortcode}
        isVoice={isVoice}
        isForum={isForum}
        channelName={channelName}
        handleComposerChange={chat.handleComposerChange}
        composerHistoryMatches={chat.composerHistoryMatches}
        composerHistorySafeIndex={chat.composerHistorySafeIndex}
        composerHighlightId={chat.composerHighlightId}
        scrollComposerHighlight={chat.scrollComposerHighlight}
        send={chat.send}
        uploading={chat.uploading}
        t={t}
      />

      <EditHistoryModal
        open={chat.editHistoryModalOpen}
        title={t('chat.editHistoryTitle')}
        entries={chat.editHistoryEntries}
        onClose={() => chat.dispatchChannelUi({ type: 'close-edit-history' })}
      />
    </main>
  )
}
