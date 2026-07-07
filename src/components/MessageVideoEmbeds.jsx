import { useMemo } from 'react'
import { getVideoEmbedSpecsFromContent, resolveTwitchEmbedUrl } from '../lib/videoEmbedUrls'

/**
 * Renders inline video embeds for known providers when URLs appear in message text.
 * Works for pasted links (YouTube, Twitch clips/VODs, Vimeo, Streamable) and for Stream Scheduler
 * event URLs once they are in the message.
 */
export default function MessageVideoEmbeds({ content }) {
  const specs = useMemo(() => getVideoEmbedSpecsFromContent(content || ''), [content])
  const parentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

  const frames = useMemo(() => {
    return specs.flatMap((spec) => {
      let src = spec.embedUrl
      if (spec.kind === 'twitch_clip' || spec.kind === 'twitch_vod') {
        src = resolveTwitchEmbedUrl(spec, parentHost)
      }
      return src ? [{ src, originalUrl: spec.originalUrl, kind: spec.kind }] : []
    })
  }, [specs, parentHost])

  if (!frames.length) return null

  return (
    <div className="message-video-embeds">
      {frames.map((f) => (
        <div key={f.src} className="message-video-embed-frame-wrap">
          <iframe
            title="Video"
            src={f.src}
            className="message-video-embed-frame"
            sandbox="allow-scripts allow-presentation allow-popups allow-forms"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
          />
          <a
            href={f.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="message-video-embed-open muted small"
          >
            Open link
          </a>
        </div>
      ))}
    </div>
  )
}
