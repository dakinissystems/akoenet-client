import RichMessageText from './RichMessageText'
import { resolveImageUrl } from '../lib/resolveImageUrl'

export default function ChatPinnedStrip({ pinnedMessages, jumpToMessage, emojiMap, t }) {
  if (pinnedMessages.length === 0) return null

  return (
    <section className="pinned-strip">
      <div className="pinned-strip-head">
        <span className="pinned-strip-label">{t('chat.pinnedForEveryone')}</span>
        <span className="pinned-strip-badge">{pinnedMessages.length}</span>
      </div>
      <div className="pinned-strip-list">
        {pinnedMessages.map((m) => (
          <button
            key={`pin-${m.id}`}
            type="button"
            className="pinned-chip"
            onClick={() => jumpToMessage(m.id)}
            title={t('chat.goToMessage')}
          >
            <span className="pinned-chip-user">{m.username}:</span>
            {m.content && m.content !== '(imagen)' && (
              <span className="pinned-chip-text">
                <RichMessageText text={m.content.slice(0, 80)} emojis={emojiMap} />
              </span>
            )}
            {m.image_url && (
              <>
                <img
                  src={resolveImageUrl(m.image_url)}
                  alt={t('chat.pinnedImageAlt')}
                  className="pinned-chip-image"
                />
                <span className="pinned-chip-preview" aria-hidden="true">
                  <img src={resolveImageUrl(m.image_url)} alt="" className="pinned-chip-preview-image" />
                </span>
              </>
            )}
            {!m.content && m.image_url && <span className="pinned-chip-text">{t('common.image')}</span>}
          </button>
        ))}
      </div>
    </section>
  )
}
