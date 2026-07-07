import StandardEmojiPicker from './StandardEmojiPicker'
import { isCapacitorNative } from '../lib/mobile-runtime'

export default function DirectMessagesComposer({
  replyTo,
  dispatchConvUi,
  onFile,
  onPickFromMobileDevice,
  dmComposerInputRef,
  text,
  setText,
  selectedConversationId,
  selectedConversation,
  onComposerChange,
  composerHistoryMatches,
  composerHistorySafeIndex,
  composerHighlightId,
  scrollComposerHighlight,
  sendMessage,
  uploading,
  t,
}) {
  return (
    <footer className="composer">
      {replyTo && (
        <div className="reply-context-bar">
          <div className="reply-context-text">
            <span className="reply-context-label">{t('chat.replyingToBar', { name: replyTo.username })}</span>
            {replyTo.snippet ? <p className="reply-context-snippet">{replyTo.snippet}</p> : null}
          </div>
          <button
            type="button"
            className="btn ghost small"
            onClick={() => dispatchConvUi({ type: 'clear-reply' })}
            aria-label={t('chat.cancelReplyAria')}
          >
            ✕
          </button>
        </div>
      )}
      <label className="file-btn">
        <input
          id="dm-composer-attachment"
          name="attachment"
          type="file"
          accept="image/*"
          hidden
          aria-label={t('chat.attachImage', { defaultValue: 'Attach image' })}
          onChange={onFile}
          disabled={!selectedConversationId || uploading}
        />
        📎
      </label>
      {isCapacitorNative() && (
        <button
          type="button"
          className="btn ghost small file-btn-mobile"
          onClick={onPickFromMobileDevice}
          title={t('dm.attachFromDevice', { defaultValue: 'Attach from device' })}
          aria-label={t('dm.attachFromDevice', { defaultValue: 'Attach from device' })}
          disabled={!selectedConversationId || uploading}
        >
          📷
        </button>
      )}
      <StandardEmojiPicker
        inputRef={dmComposerInputRef}
        text={text}
        setText={setText}
        disabled={!selectedConversationId}
        triggerAriaLabel={t('chat.emojiPickerAria', { defaultValue: 'Insert emoji' })}
      />
      <input
        ref={dmComposerInputRef}
        id="dm-composer-message"
        name="message"
        className="composer-input"
        aria-label={
          selectedConversation
            ? t('dm.composerPh', { name: selectedConversation.peer_username })
            : t('dm.selectChat')
        }
        placeholder={
          selectedConversation
            ? t('dm.composerPh', { name: selectedConversation.peer_username })
            : t('dm.selectChat')
        }
        value={text}
        onChange={onComposerChange}
        onKeyDown={(e) => {
          if (composerHistoryMatches.length > 1 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault()
            const len = composerHistoryMatches.length
            const nextIndex =
              e.key === 'ArrowDown'
                ? (composerHistorySafeIndex + 1) % len
                : (composerHistorySafeIndex - 1 + len) % len
            dispatchConvUi({ type: 'set-composer-history-index', index: nextIndex })
            scrollComposerHighlight(composerHistoryMatches[nextIndex]?.id)
            return
          }
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
          }
        }}
        disabled={!selectedConversationId}
        aria-controls="dm-composer-history-hint"
        aria-activedescendant={composerHighlightId != null ? `dm-hist-msg-${composerHighlightId}` : undefined}
      />
      <button
        type="button"
        className="btn primary"
        onClick={sendMessage}
        disabled={!selectedConversationId || uploading || !text.trim()}
      >
        {t('chat.send')}
      </button>
      {selectedConversationId && text.trim().length > 0 && composerHistoryMatches.length > 0 && (
        <div id="dm-composer-history-hint" className="composer-history-hint" role="status" aria-live="polite">
          <span className="composer-history-hint-label">{t('dm.historyMatch')}</span>
          <span className="composer-history-hint-meta">
            {composerHistorySafeIndex + 1} / {composerHistoryMatches.length}
          </span>
          <span className="composer-history-hint-snippet">
            {composerHistoryMatches[composerHistorySafeIndex]?.username}:{' '}
            {String(composerHistoryMatches[composerHistorySafeIndex]?.content || '').slice(0, 120)}
            {String(composerHistoryMatches[composerHistorySafeIndex]?.content || '').length > 120 ? '…' : ''}
          </span>
          {composerHistoryMatches.length > 1 ? (
            <span className="composer-history-hint-keys muted small">↑ ↓</span>
          ) : null}
        </div>
      )}
    </footer>
  )
}
