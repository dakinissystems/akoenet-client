import EmojiText from './EmojiText'
import { inlineMarkdownToSafeHtml } from '../lib/safeMarkdown'

const MENTION_RE = /@(here|everyone|[a-zA-Z0-9_.]{2,32})/g
const EMOJI_RE = /:([a-z0-9_]{2,32}):/g

const EMPTY_EMOJIS = {}

/**
 * Message text with :emoji: shortcodes, @mention highlighting, and safe inline Markdown.
 */
export default function RichMessageText({ text, emojis = EMPTY_EMOJIS }) {
  if (!text) return null

  const mentionParts = []
  let last = 0
  let m
  const re = new RegExp(MENTION_RE.source, 'g')
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      mentionParts.push({ type: 'text', value: text.slice(last, m.index), start: last })
    }
    mentionParts.push({ type: 'mention', value: m[0], start: m.index })
    last = m.index + m[0].length
  }
  if (last < text.length) {
    mentionParts.push({ type: 'text', value: text.slice(last), start: last })
  }
  if (mentionParts.length === 0) {
    mentionParts.push({ type: 'text', value: text, start: 0 })
  }

  return (
    <>
      {mentionParts.map((p) =>
        p.type === 'mention' ? (
          <span key={`m-${p.start}`} className="message-mention">
            {p.value}
          </span>
        ) : (
          <TextSegmentWithEmojiAndMd key={`t-${p.start}`} text={p.value} emojis={emojis} />
        )
      )}
    </>
  )
}

function TextSegmentWithEmojiAndMd({ text, emojis }) {
  const segments = []
  let segLast = 0
  let em
  const er = new RegExp(EMOJI_RE.source, 'g')
  while ((em = er.exec(text)) !== null) {
    if (em.index > segLast) {
      segments.push({ type: 'md', value: text.slice(segLast, em.index), start: segLast })
    }
    segments.push({ type: 'emoji', token: em[0], start: em.index })
    segLast = em.index + em[0].length
  }
  if (segLast < text.length) {
    segments.push({ type: 'md', value: text.slice(segLast), start: segLast })
  }
  if (segments.length === 0) {
    segments.push({ type: 'md', value: text, start: 0 })
  }

  return (
    <>
      {segments.map((s) =>
        s.type === 'emoji' ? (
          <EmojiText key={`e-${s.start}`} text={s.token} emojis={emojis} />
        ) : (
          <span
            key={`md-${s.start}`}
            className="message-md-inline"
            dangerouslySetInnerHTML={{ __html: inlineMarkdownToSafeHtml(s.value) }}
          />
        )
      )}
    </>
  )
}
