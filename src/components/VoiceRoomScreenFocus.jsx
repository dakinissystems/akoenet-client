import {
  IconActivityOverlay,
  IconInviteOverlay,
} from './VoiceRoomIcons'

export default function VoiceRoomScreenFocus({
  tr,
  hasScreenShareStage,
  resolvedScreenFocusId,
  screenShareOptions,
  showScreenFocusPip,
  screenFocusVideoRef,
  screenFocusShellRef,
  screenFocusPipVideoRef,
  setScreenFocusId,
  applyScreenFocusVideo,
  applyScreenFocusPipVideo,
  applyLocalVideoElements,
}) {
  if (!hasScreenShareStage) return null

  return (
    <div className="voice-screen-focus-block">
      <div className="voice-screen-focus-canvas">
        <span className="voice-screen-focus-live-badge" aria-hidden>
          {tr('voiceRoom.liveBadge')}
        </span>
        <div className="voice-screen-focus-toolbar voice-screen-focus-toolbar--overlay">
          <label htmlFor="voice-screen-focus-select" className="voice-screen-focus-label">
            {tr('voiceRoom.featuredScreen')}
          </label>
          <select
            id="voice-screen-focus-select"
            className="voice-screen-focus-select"
            value={resolvedScreenFocusId ?? screenShareOptions[0]?.key ?? ''}
            onChange={(e) => {
              setScreenFocusId(e.target.value)
              requestAnimationFrame(() => {
                applyScreenFocusVideo(e.target.value)
                applyScreenFocusPipVideo(e.target.value)
                applyLocalVideoElements(e.target.value)
              })
            }}
            aria-label={tr('voiceRoom.featuredScreen')}
          >
            {screenShareOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="voice-screen-focus-video-shell" ref={screenFocusShellRef}>
          <video
            ref={screenFocusVideoRef}
            className="voice-screen-focus-video"
            autoPlay
            playsInline
            muted
            aria-label={tr('voiceRoom.featuredScreen')}
          />
        </div>
        {showScreenFocusPip ? (
          <video
            ref={screenFocusPipVideoRef}
            className="voice-screen-focus-pip"
            autoPlay
            playsInline
            muted
            aria-label={tr('voiceRoom.camOnLabel')}
          />
        ) : null}
        <div className="voice-screen-focus-overlay-actions">
          <button
            type="button"
            className="voice-screen-overlay-btn"
            onClick={() => {
              const url = window.location.href
              void navigator.clipboard?.writeText(url)
            }}
            title={tr('voiceRoom.copyPageLinkTitle')}
          >
            <span className="voice-screen-overlay-btn-icon" aria-hidden>
              <IconInviteOverlay />
            </span>
            {tr('voiceRoom.inviteVoiceChat')}
          </button>
          <button
            type="button"
            className="voice-screen-overlay-btn voice-screen-overlay-btn--muted"
            disabled
            title={tr('voiceRoom.activitySoonTitle')}
          >
            <span className="voice-screen-overlay-btn-icon" aria-hidden>
              <IconActivityOverlay />
            </span>
            {tr('voiceRoom.chooseActivity')}
          </button>
        </div>
      </div>
    </div>
  )
}
