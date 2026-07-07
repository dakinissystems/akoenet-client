import {
  IconHeadphones,
  IconJoinCall,
  IconMic,
  IconScreenShare,
  IconVideo,
  IconVideoOff,
  IconWaveSpeaking,
} from './VoiceRoomIcons'
import VoiceRoomScreenFocus from './VoiceRoomScreenFocus'
import VoiceRoomStageGrid from './VoiceRoomStageGrid'
import VoiceRoomControlsFooter from './VoiceRoomControlsFooter'

export default function VoiceRoomView(props) {
  const {
    tr,
    compact,
    joined,
    participants,
    muted,
    cameraOn,
    screenSharing,
    autoJoin,
    displayTitle,
    showVoiceCap,
    voiceCap,
    voiceConnectedCount,
    hasScreenShareStage,
  } = props

  return (
    <section
      className={`channel-mode-box voice-room-discord${compact ? ' voice-room-compact' : ''}${hasScreenShareStage ? ' voice-room-has-screen-share' : ''}${joined ? ' voice-room--joined' : ' voice-room--idle'}`}
    >
      <header className="voice-room-top">
        <div>
          <h3 className="voice-room-title-row">
            <span className="voice-room-title-icon" aria-hidden>
              {joined ? <IconWaveSpeaking /> : <IconHeadphones />}
            </span>
            {compact ? tr('voiceRoom.titleCompact', { name: displayTitle }) : tr('voiceRoom.defaultChannelName')}
          </h3>
          {showVoiceCap && (
            <p
              className={`voice-room-cap-line ${voiceConnectedCount >= voiceCap ? 'voice-room-cap-line--full' : ''}`}
              aria-live="polite"
            >
              <span className="voice-room-cap-icon" title={tr('voiceRoom.capUsersTitle')} aria-hidden>
                👥
              </span>
              <strong>
                ({voiceConnectedCount}/{voiceCap})
              </strong>{' '}
              {tr('voiceRoom.capInChannel')}
            </p>
          )}
          <p className="voice-room-status-line">
            {joined ? (
              <>
                <span className="voice-status-chip" title={tr('voiceRoom.chipConnectedTitle')}>
                  <span aria-hidden>👤</span> {participants.length}
                </span>
                <span
                  className="voice-status-chip"
                  title={cameraOn ? tr('voiceRoom.camOnTitle') : tr('voiceRoom.camOffTitle')}
                >
                  {cameraOn ? <IconVideo /> : <IconVideoOff />}
                  <span className="voice-status-chip-label">
                    {cameraOn ? tr('voiceRoom.camOnLabel') : tr('voiceRoom.camOffLabel')}
                  </span>
                </span>
                <span
                  className="voice-status-chip"
                  title={screenSharing ? tr('voiceRoom.screenOnTitle') : tr('voiceRoom.screenOffTitle')}
                >
                  <IconScreenShare />
                  <span className="voice-status-chip-label">
                    {screenSharing ? tr('voiceRoom.screenLabel') : tr('voiceRoom.dash')}
                  </span>
                </span>
              </>
            ) : autoJoin ? (
              <>
                <span className="voice-status-chip voice-status-chip--pulse" title={tr('voiceRoom.connectingTitle')}>
                  <IconMic /> {tr('voiceRoom.connectingLabel')}
                </span>
              </>
            ) : (
              <>
                <IconJoinCall /> <span>{tr('voiceRoom.joinHint')}</span>
              </>
            )}
          </p>
        </div>
        <div
          className={`voice-room-chip ${joined ? 'voice-room-chip--live' : 'voice-room-chip--idle'}`}
          title={joined ? tr('voiceRoom.statusLiveTitle') : tr('voiceRoom.statusIdleTitle')}
        >
          <span className="voice-room-chip-dot" aria-hidden />
          {joined ? tr('voiceRoom.statusLive') : tr('voiceRoom.statusReady')}
        </div>
      </header>

      <VoiceRoomScreenFocus {...props} />
      <VoiceRoomStageGrid {...props} />
      <VoiceRoomControlsFooter {...props} />
    </section>
  )
}
