import StandardEmojiPicker from './StandardEmojiPicker'
import { resolveImageUrl } from '../lib/resolveImageUrl'
import { isCapacitorNative } from '../lib/mobile-runtime'

export default function ChatComposer({
  replyTo,
  dispatchChannelUi,
  onFile,
  onPickFromMobileDevice,
  composerInputRef,
  text,
  setText,
  channelId,
  emojis,
  emojiPickerWrapRef,
  pickerOpen,
  setPickerOpen,
  insertEmojiShortcode,
  isVoice,
  isForum,
  channelName,
  handleComposerChange,
  composerHistoryMatches,
  composerHistorySafeIndex,
  composerHighlightId,
  scrollComposerHighlight,
  send,
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
            onClick={() => dispatchChannelUi({ type: 'clear-reply' })}
            aria-label={t('chat.cancelReplyAria')}
          >
            ✕
          </button>
        </div>
      )}
      <label className="file-btn">
        <input id="chat-composer-attachment" name="attachment" type="file" accept="image/*" hidden onChange={onFile} />
        📎
      </label>
      {isCapacitorNative() && (
        <button
          type="button"
          className="btn ghost small file-btn-mobile"
          onClick={onPickFromMobileDevice}
          title={t('chat.attachFromDevice', { defaultValue: 'Attach from device' })}
          aria-label={t('chat.attachFromDevice', { defaultValue: 'Attach from device' })}
        >
          📷
        </button>
      )}
      <StandardEmojiPicker inputRef={composerInputRef} text={text} setText={setText} disabled={!channelId} />
      {emojis.length > 0 && (
        <div className="emoji-picker-wrap" ref={emojiPickerWrapRef}>
          <button
            type="button"
            className="btn ghost small"
            onClick={() => setPickerOpen((prev) => !prev)}
            title={t('chat.serverEmojisTitle')}
          >
            😀
          </button>
          {pickerOpen && (
            <div className="emoji-picker-panel">
              {emojis.map((emoji) => (
                <button
                  key={emoji.id}
                  type="button"
                  className="emoji-picker-item"
                  onClick={() => insertEmojiShortcode(emoji.name)}
                  title={`:${emoji.name}:`}
                >
                  <img src={resolveImageUrl(emoji.image_url)} alt={emoji.name} />
                  <span>:{emoji.name}:</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <input
        ref={composerInputRef}
        id="chat-composer-message"
        name="message"
        className="composer-input"
        aria-label={
          isVoice
            ? t('chat.phVoice')
            : isForum
              ? t('chat.phForum')
              : channelName
                ? t('chat.phChannel', { name: channelName })
                : t('chat.phDefault')
        }
        placeholder={
          isVoice
            ? t('chat.phVoice')
            : isForum
              ? t('chat.phForum')
              : channelName
                ? t('chat.phChannel', { name: channelName })
                : t('chat.phDefault')
        }
        value={text}
        onChange={handleComposerChange}
        onKeyDown={(e) => {
          if (composerHistoryMatches.length > 1 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault()
            const len = composerHistoryMatches.length
            const nextIndex =
              e.key === 'ArrowDown'
                ? (composerHistorySafeIndex + 1) % len
                : (composerHistorySafeIndex - 1 + len) % len
            dispatchChannelUi({ type: 'set-composer-history-index', index: nextIndex })
            scrollComposerHighlight(composerHistoryMatches[nextIndex]?.id)
            return
          }
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
        aria-autocomplete="list"
        aria-controls="chat-composer-history-hint"
        aria-activedescendant={composerHighlightId != null ? `hist-msg-${composerHighlightId}` : undefined}
      />
      <button type="button" className="btn primary chat-send-btn" onClick={send} disabled={uploading || !text.trim()}>
        {isForum ? t('chat.post') : t('chat.send')}
      </button>
      {text.trim().length > 0 && composerHistoryMatches.length > 0 && (
        <div id="chat-composer-history-hint" className="composer-history-hint" role="status" aria-live="polite">
          <span className="composer-history-hint-label">{t('chat.historyMatch')}</span>
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
