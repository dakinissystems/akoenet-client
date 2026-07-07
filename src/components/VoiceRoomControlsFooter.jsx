import {
  IconHeadphones,
  IconHeadphonesDeafened,
  IconJoinCall,
  IconMic,
  IconMicMuted,
  IconScreenShare,
  IconTestMic,
  IconVideo,
  IconVideoOff,
  PhoneHangupIcon,
  VoiceToolbarBtn,
} from './VoiceRoomIcons'

export default function VoiceRoomControlsFooter(props) {
  const {
    tr,
    joined,
    testingMic,
    muted,
    deafened,
    micLevel,
    error,
    startMicTest,
    stopMicTest,
    joinVoice,
    leaveVoice,
    toggleMute,
    toggleDeafened,
    toggleCamera,
    toggleScreenShare,
    cameraOn,
    screenSharing,
    localHasScreenShareAudio,
    localScreenAudioSendMuted,
    localScreenPreviewMuted,
    toggleLocalScreenAudioSend,
    setLocalScreenPreviewMuted,
    applyLocalScreenAudioPreview,
    localScreenShareAudioPreviewRef,
  } = props

  return (
    <>
      {(joined || testingMic) && (
        <div className="mic-status mic-status--with-icon">
          <div
            className="mic-status-label"
            title={
              testingMic && !joined
                ? tr('voiceRoom.micStatusTestTitle')
                : muted
                  ? tr('voiceRoom.micStatusMutedTitle')
                  : tr('voiceRoom.micStatusLevelTitle')
            }
          >
            <span className="mic-status-icon" aria-hidden>
              {muted && joined ? <IconMicMuted /> : <IconMic />}
            </span>
            <span className="muted small">
              {testingMic && !joined
                ? tr('voiceRoom.micStatusTestLabel')
                : muted
                  ? tr('voiceRoom.micStatusMutedLabel')
                  : tr('voiceRoom.micStatusLevelLabel')}
            </span>
          </div>
          <meter
            className="mic-meter"
            min={0}
            max={100}
            value={Math.round(micLevel * 100)}
            aria-label={tr('voiceRoom.micMeterAria')}
          >
            <span
              className={`mic-meter-fill ${muted && joined ? 'muted' : ''}`}
              style={{ width: `${Math.max(6, Math.round(micLevel * 100))}%` }}
            />
          </meter>
        </div>
      )}

      {error && <p className="error-banner">{error}</p>}

      <div className="voice-controls discord voice-toolbar-wrap">
        {!joined && (
          <VoiceToolbarBtn
            onClick={testingMic ? stopMicTest : startMicTest}
            title={testingMic ? tr('voiceRoom.stopMicTestTitle') : tr('voiceRoom.startMicTestTitle')}
            ariaLabel={testingMic ? tr('voiceRoom.stopMicTestAria') : tr('voiceRoom.startMicTestAria')}
            active={testingMic}
          >
            <IconTestMic />
          </VoiceToolbarBtn>
        )}
        {!joined ? (
          <VoiceToolbarBtn
            onClick={() => joinVoice()}
            title={tr('voiceRoom.joinVoiceTitle')}
            ariaLabel={tr('voiceRoom.joinVoiceAria')}
            active
          >
            <IconJoinCall />
          </VoiceToolbarBtn>
        ) : (
          <>
            <VoiceToolbarBtn
              onClick={toggleMute}
              title={muted ? tr('voiceRoom.unmuteMicTitle') : tr('voiceRoom.muteMicTitle')}
              ariaLabel={muted ? tr('voiceRoom.unmuteMicAria') : tr('voiceRoom.muteMicAria')}
              pressed={muted}
              active={!muted}
            >
              {muted ? <IconMicMuted /> : <IconMic />}
            </VoiceToolbarBtn>
            <VoiceToolbarBtn
              onClick={toggleDeafened}
              title={deafened ? tr('voiceRoom.undeafenTitle') : tr('voiceRoom.deafenTitle')}
              ariaLabel={deafened ? tr('voiceRoom.undeafenAria') : tr('voiceRoom.deafenAria')}
              pressed={deafened}
            >
              {deafened ? <IconHeadphonesDeafened /> : <IconHeadphones />}
            </VoiceToolbarBtn>
            <VoiceToolbarBtn
              onClick={toggleCamera}
              title={cameraOn ? tr('voiceRoom.cameraOffTitle') : tr('voiceRoom.cameraOnTitle')}
              ariaLabel={cameraOn ? tr('voiceRoom.cameraOffAria') : tr('voiceRoom.cameraOnAria')}
              pressed={cameraOn}
              active={cameraOn}
            >
              {cameraOn ? <IconVideo /> : <IconVideoOff />}
            </VoiceToolbarBtn>
            <VoiceToolbarBtn
              onClick={() => void toggleScreenShare()}
              title={screenSharing ? tr('voiceRoom.screenStopTitle') : tr('voiceRoom.screenStartTitle')}
              ariaLabel={screenSharing ? tr('voiceRoom.screenStopAria') : tr('voiceRoom.screenStartAria')}
              pressed={screenSharing}
              active={screenSharing}
            >
              <IconScreenShare />
            </VoiceToolbarBtn>
            <VoiceToolbarBtn
              onClick={leaveVoice}
              title={tr('voiceRoom.leaveVoiceTitle')}
              ariaLabel={tr('voiceRoom.leaveVoiceAria')}
              danger
            >
              <PhoneHangupIcon />
            </VoiceToolbarBtn>
          </>
        )}
      </div>

      {joined && localHasScreenShareAudio ? (
        <div className="voice-screen-audio-local-toolbar">
          <VoiceToolbarBtn
            onClick={toggleLocalScreenAudioSend}
            title={
              localScreenAudioSendMuted
                ? tr('voiceRoom.localScreenSendOnTitle')
                : tr('voiceRoom.localScreenSendOffTitle')
            }
            ariaLabel={
              localScreenAudioSendMuted
                ? tr('voiceRoom.localScreenSendOnAria')
                : tr('voiceRoom.localScreenSendOffAria')
            }
            pressed={localScreenAudioSendMuted}
          >
            <span aria-hidden>{localScreenAudioSendMuted ? '🔇' : '🔊'}</span>
          </VoiceToolbarBtn>
          <span className="muted small">{tr('voiceRoom.audioToOthers')}</span>
          <VoiceToolbarBtn
            onClick={() => {
              setLocalScreenPreviewMuted((v) => !v)
              requestAnimationFrame(applyLocalScreenAudioPreview)
            }}
            title={
              localScreenPreviewMuted
                ? tr('voiceRoom.localPreviewOnTitle')
                : tr('voiceRoom.localPreviewOffTitle')
            }
            ariaLabel={
              localScreenPreviewMuted ? tr('voiceRoom.localPreviewOnAria') : tr('voiceRoom.localPreviewOffAria')
            }
            pressed={localScreenPreviewMuted}
          >
            <span aria-hidden>{localScreenPreviewMuted ? '🔇' : '🔉'}</span>
          </VoiceToolbarBtn>
          <span className="muted small">{tr('voiceRoom.hearHere')}</span>
        </div>
      ) : null}

      <audio
        ref={localScreenShareAudioPreviewRef}
        className="voice-local-screen-audio-preview"
        tabIndex={-1}
        aria-hidden
      >
        <track kind="captions" />
      </audio>
    </>
  )
}
