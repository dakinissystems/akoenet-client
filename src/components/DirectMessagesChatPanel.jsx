import { isPresenceOnline } from '../lib/dmConversationUi'
import DmMessageItem from './DmMessageItem'
import DirectMessagesComposer from './DirectMessagesComposer'

export default function DirectMessagesChatPanel({
  dm,
  user,
  t,
}) {
  const {
    isMobileDm,
    mobileChatOpen,
    mobileDragOffset,
    closeMobileChat,
    fileDragOver,
    onDmDragEnter,
    onDmDragLeave,
    onDmDragOver,
    onDmDrop,
    onMobileSheetTouchStart,
    onMobileSheetTouchMove,
    onMobileSheetTouchEnd,
    selectedConversation,
    selectedConversationId,
    peerTypingName,
    dispatchConvUi,
    dmSearchOpen,
    dmSearchQuery,
    dmSearchResults,
    dmSearchBusy,
    runDmSearch,
    jumpToDmMessage,
    refreshLatestDirectMessages,
    messages,
    composerHighlightId,
    messageNodeRef,
    bottomRef,
    editingMessageId,
    editingDraft,
    saveDmEdit,
    cancelDmEdit,
    startDmReply,
    reportDmMessage,
    showDmEditHistory,
    failedAvatarKeys,
    setFailedAvatarKeys,
    replyTo,
    onFile,
    onPickFromMobileDevice,
    dmComposerInputRef,
    text,
    setText,
    onComposerChange,
    composerHistoryMatches,
    composerHistorySafeIndex,
    scrollComposerHighlight,
    sendMessage,
    uploading,
  } = dm

  return (
    <>
      {isMobileDm && mobileChatOpen && (
        <button
          type="button"
          className="dm-chat-mobile-backdrop"
          aria-label={t('dm.closeMobileAria')}
          onClick={closeMobileChat}
        />
      )}

      <div
        className={`dm-chat ${isMobileDm ? 'dm-chat-mobile' : ''} ${
          isMobileDm && mobileChatOpen ? 'is-open' : ''
        }${fileDragOver ? ' dm-chat--file-drag' : ''}`}
        style={
          isMobileDm ? { '--dm-sheet-drag': `${mobileChatOpen ? mobileDragOffset : 0}px` } : undefined
        }
        onDragEnter={onDmDragEnter}
        onDragLeave={onDmDragLeave}
        onDragOver={onDmDragOver}
        onDrop={onDmDrop}
        onTouchStart={onMobileSheetTouchStart}
        onTouchMove={onMobileSheetTouchMove}
        onTouchEnd={onMobileSheetTouchEnd}
        onTouchCancel={onMobileSheetTouchEnd}
      >
        <div className="dm-chat-header">
          {isMobileDm && (
            <div className="dm-mobile-sheet-grab-wrap" aria-hidden="true">
              <span className="dm-mobile-sheet-grab" />
            </div>
          )}
          {selectedConversation ? (
            <>
              <div className="dm-chat-header-row">
                <span>{t('dm.chatWith', { name: selectedConversation.peer_username })}</span>
                <div className="dm-chat-header-actions">
                  <button
                    type="button"
                    className="btn ghost small"
                    title={t('dm.refreshTitle')}
                    onClick={refreshLatestDirectMessages}
                  >
                    {t('common.refresh')}
                  </button>
                  {isMobileDm && (
                    <button
                      type="button"
                      className="btn ghost small"
                      onClick={closeMobileChat}
                      title={t('dm.backTitle')}
                    >
                      {t('common.back')}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn ghost small"
                    title={t('dm.searchThisChat')}
                    onClick={() => dispatchConvUi({ type: 'toggle-dm-search', open: !dmSearchOpen })}
                    aria-expanded={dmSearchOpen}
                  >
                    🔎
                  </button>
                  <span
                    className={`dm-chat-header-status ${
                      isPresenceOnline(selectedConversation?.peer_presence_status) ? 'online' : 'offline'
                    }`}
                  >
                    {isPresenceOnline(selectedConversation?.peer_presence_status)
                      ? t('common.online')
                      : t('common.offline')}
                  </span>
                </div>
              </div>
              {peerTypingName ? (
                <p className="dm-typing-hint muted small" role="status">
                  {t('dm.typing', { name: peerTypingName })}
                </p>
              ) : null}
            </>
          ) : (
            <span className="muted small">{t('dm.selectChat')}</span>
          )}
        </div>

        {dmSearchOpen && selectedConversationId && (
          <section className="chat-search-panel dm-inline-search" aria-label={t('dm.searchInConvAria')}>
            <form className="chat-search-form" onSubmit={runDmSearch}>
              <input
                className="composer-input chat-search-input"
                value={dmSearchQuery}
                onChange={(e) => dispatchConvUi({ type: 'set-dm-search-query', query: e.target.value })}
                placeholder={t('dm.dmSearchPh')}
                aria-label={t('dm.dmSearchQueryAria')}
              />
              <button
                type="submit"
                className="btn secondary small"
                disabled={dmSearchBusy || dmSearchQuery.trim().length < 2}
              >
                {dmSearchBusy ? '…' : t('common.search')}
              </button>
              <button
                type="button"
                className="btn ghost small"
                onClick={() => dispatchConvUi({ type: 'close-dm-search' })}
              >
                {t('common.close')}
              </button>
            </form>
            {dmSearchResults.length > 0 && (
              <ul className="chat-search-results">
                {dmSearchResults.map((sm) => (
                  <li key={sm.id}>
                    <button
                      type="button"
                      className="chat-search-hit"
                      onClick={() => {
                        jumpToDmMessage(sm.id)
                        dispatchConvUi({ type: 'close-dm-search' })
                      }}
                    >
                      <span className="chat-search-hit-user">{sm.username}</span>
                      <span className="chat-search-hit-text">
                        {sm.content && sm.content !== '(imagen)'
                          ? sm.content.slice(0, 120)
                          : sm.image_url
                            ? t('common.image')
                            : ''}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="message-list">
          {messages.map((m) => (
            <DmMessageItem
              key={m.id}
              message={m}
              user={user}
              composerHighlightId={composerHighlightId}
              messageNodeRef={messageNodeRef}
              editingMessageId={editingMessageId}
              editingDraft={editingDraft}
              dispatchConvUi={dispatchConvUi}
              saveDmEdit={saveDmEdit}
              cancelDmEdit={cancelDmEdit}
              startDmReply={startDmReply}
              reportDmMessage={reportDmMessage}
              showDmEditHistory={showDmEditHistory}
              failedAvatarKeys={failedAvatarKeys}
              setFailedAvatarKeys={setFailedAvatarKeys}
              t={t}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        <DirectMessagesComposer
          replyTo={replyTo}
          dispatchConvUi={dispatchConvUi}
          onFile={onFile}
          onPickFromMobileDevice={onPickFromMobileDevice}
          dmComposerInputRef={dmComposerInputRef}
          text={text}
          setText={setText}
          selectedConversationId={selectedConversationId}
          selectedConversation={selectedConversation}
          onComposerChange={onComposerChange}
          composerHistoryMatches={composerHistoryMatches}
          composerHistorySafeIndex={composerHistorySafeIndex}
          composerHighlightId={composerHighlightId}
          scrollComposerHighlight={scrollComposerHighlight}
          sendMessage={sendMessage}
          uploading={uploading}
          t={t}
        />
      </div>
    </>
  )
}
