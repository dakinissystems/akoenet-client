/** Positive integer cap from API, or null if unlimited / invalid */
export function voiceChannelUserMax(channel) {
  const lim = channel?.voice_user_limit
  if (lim == null || lim === '') return null
  const n = typeof lim === 'string' ? Number(lim.trim()) : Number(lim)
  if (!Number.isFinite(n) || n < 1) return null
  return Math.min(99, Math.floor(n))
}

export function VoiceSidebarMicMutedIcon() {
  return (
    <svg className="voice-channel-audio-svg" viewBox="0 0 24 24" width="14" height="14" aria-hidden>
      <path
        fill="currentColor"
        d="M19 11h-1.7c0-.74-.16-1.44-.43-2.09l1.23-1.23c.56.98.9 2.09.9 3.32zM12 14c-1.66 0-3-1.34-3-3V6c0-.36.07-.7.18-1.02L7.1 8.06A2.98 2.98 0 0 0 7 9v5a5 5 0 0 0 5 5c1.43 0 2.74-.61 3.68-1.57L13 14.83A2.98 2.98 0 0 1 12 14zm9.71-9.71L4.29 20.29 3 19l3.59-3.59A6.96 6.96 0 0 1 5 11H3a8 8 0 0 0 4.34 7.11L8.55 21H11v2h2v-2h2.45l1.79-2.89A8 8 0 0 0 21 11h-2a6.96 6.96 0 0 1-1.31 3.41l2.39-2.39 1.63 1.63z"
      />
    </svg>
  )
}

export function VoiceSidebarHeadphonesDeafIcon() {
  return (
    <svg
      className="voice-channel-audio-svg"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 13a10 10 0 0 1 20 0" />
      <rect x="2" y="13" width="6" height="8" rx="2" />
      <rect x="16" y="13" width="6" height="8" rx="2" />
      <path d="M4 4l16 16" />
    </svg>
  )
}

export function channelIcon(c) {
  if (c.type === 'voice') {
    return (
      <span className="channel-icon channel-icon--voice" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      </span>
    )
  }
  if (c.type === 'forum') {
    return (
      <span className="channel-icon channel-icon--forum" aria-hidden="true">
        🗂
      </span>
    )
  }
  return (
    <span className="channel-icon channel-icon--text" aria-hidden="true">
      #
    </span>
  )
}
