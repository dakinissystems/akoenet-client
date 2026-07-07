export function PhoneHangupIcon() {
  return (
    <svg
      className="voice-hangup-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconMic({ className = '' }) {
  return (
    <svg className={`voice-toolbar-svg ${className}`} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill="currentColor"
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V22h2v-4.08A7 7 0 0 0 19 11h-2z"
      />
    </svg>
  )
}

export function IconMicMuted({ className = '' }) {
  return (
    <svg className={`voice-toolbar-svg ${className}`} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill="currentColor"
        d="M19 11h-1.7c0-.74-.16-1.44-.43-2.09l1.23-1.23c.56.98.9 2.09.9 3.32zM12 14c-1.66 0-3-1.34-3-3V6c0-.36.07-.7.18-1.02L7.1 8.06A2.98 2.98 0 0 0 7 9v5a5 5 0 0 0 5 5c1.43 0 2.74-.61 3.68-1.57L13 14.83A2.98 2.98 0 0 1 12 14zm9.71-9.71L4.29 20.29 3 19l3.59-3.59A6.96 6.96 0 0 1 5 11H3a8 8 0 0 0 4.34 7.11L8.55 21H11v2h2v-2h2.45l1.79-2.89A8 8 0 0 0 21 11h-2a6.96 6.96 0 0 1-1.31 3.41l2.39-2.39 1.63 1.63z"
      />
    </svg>
  )
}

export function IconHeadphones({ className = '' }) {
  return (
    <svg
      className={`voice-toolbar-svg ${className}`}
      viewBox="0 0 24 24"
      width="22"
      height="22"
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
    </svg>
  )
}

export function IconHeadphonesDeafened({ className = '' }) {
  return (
    <svg
      className={`voice-toolbar-svg ${className}`}
      viewBox="0 0 24 24"
      width="22"
      height="22"
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

export function IconVideo({ className = '' }) {
  return (
    <svg className={`voice-toolbar-svg ${className}`} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill="currentColor"
        d="M18 10.48V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.48l4 3.52v-11l-4 3.48zM16 18H4V6h12v12z"
      />
    </svg>
  )
}

export function IconVideoOff({ className = '' }) {
  return (
    <svg className={`voice-toolbar-svg ${className}`} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill="currentColor"
        d="M21 6.5l-4 3.5v-4a2 2 0 0 0-2-2h-9.17L21 17.17V6.5zM3.27 2L2 3.27 4.73 6H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12.73l2 2L21 20.73 3.27 2zM6 10h4.73L6 5.27V10zm6 8H4v-8h2.73l8 8z"
      />
    </svg>
  )
}

export function IconScreenShare({ className = '' }) {
  return (
    <svg className={`voice-toolbar-svg ${className}`} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill="currentColor"
        d="M20 18c1.1 0 1.99-.9 1.99-2L22 6a2 2 0 0 0-2-2H4c-1.11 0-2 .89-2 2v10a2 2 0 0 0 2 2H0v2h24v-2h-4zm-7-3.12l3.17-3.17 1.41 1.41L12 19l-5.59-5.88 1.41-1.41L11 14.88V8h2v6.88zM4 16V6h16v10H4z"
      />
    </svg>
  )
}

export function IconJoinCall({ className = '' }) {
  return (
    <svg className={`voice-toolbar-svg ${className}`} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path
        fill="currentColor"
        d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 0 0-1.02.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM12 3v10l3-3h6V3h-9z"
      />
    </svg>
  )
}

export function IconTestMic({ className = '' }) {
  return (
    <svg className={`voice-toolbar-svg ${className}`} viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path
        fill="currentColor"
        d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
      />
    </svg>
  )
}

export function IconWaveSpeaking({ className = '' }) {
  return (
    <svg className={`voice-wave-speaking-icon ${className}`} viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="currentColor"
        d="M3 10v4c0 .55.45 1 1 1h3l4 4V5L7 9H4c-.55 0-1 .45-1 1zm13.5 2A4.5 4.5 0 0 0 12 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c3.91-.91 7-4.49 7-8.77s-3.09-7.86-7-8.77z"
      />
    </svg>
  )
}

export function IconVolume({ className = '' }) {
  return (
    <svg className={`voice-volume-icon ${className}`} viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M3 10v4h4l5 5V5L7 10H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c3.91-.91 7-4.49 7-8.77s-3.09-7.86-7-8.77z"
      />
    </svg>
  )
}

export function IconInviteOverlay() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </svg>
  )
}

export function IconActivityOverlay() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path
        fill="currentColor"
        d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h18v8zM9 10.5c0 .83-.67 1.5-1.5 1.5S6 11.33 6 10.5 6.67 9 7.5 9s1.5.67 1.5 1.5zm6 0c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5S12.67 9 13.5 9s1.5.67 1.5 1.5zM12 17c-2.61 0-4.83-1.67-5.65-4h11.3c-.82 2.33-3.04 4-5.65 4z"
      />
    </svg>
  )
}

export function VoiceToolbarBtn({ onClick, title, ariaLabel, pressed, active, danger, children }) {
  const cls = ['voice-icon-btn', active && 'is-active', danger && 'is-danger', pressed && 'is-pressed']
    .filter(Boolean)
    .join(' ')
  return (
    <button type="button" className={cls} onClick={onClick} title={title} aria-label={ariaLabel} aria-pressed={pressed}>
      {children}
    </button>
  )
}
