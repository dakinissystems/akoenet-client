import { resolveImageUrl } from '../lib/resolveImageUrl'
import {
  getVoiceParticipantInitial,
  remoteStreamHasSplittableScreenAudio,
  streamHasScreenShare,
  streamShowsVideoInTile,
} from '../lib/voiceRoomUtils'
import VoiceRemoteParticipantMedia from './VoiceRemoteParticipantMedia'
import {
  IconHeadphonesDeafened,
  IconMicMuted,
  IconScreenShare,
  IconVolume,
  IconWaveSpeaking,
  VoiceToolbarBtn,
} from './VoiceRoomIcons'

export default function VoiceRoomStageGrid(props) {
  const {
    tr,
    joined,
    hasScreenShareStage,
    resolvedScreenFocusId,
    screenSharing,
    localScreenStream,
    cameraOn,
    user,
    localVideoRef,
    localScreenVideoRef,
    localPipVideoRef,
    muted,
    remoteParticipants,
    speakingMap,
    remoteStreams,
    deafened,
    remoteVolumes,
    remoteAvatarFailed,
    setRemoteAvatarFailed,
    ensureAudioContext,
    remoteMediaRef,
    updateParticipantVolume,
    remoteScreenAudioMuted,
    toggleRemoteScreenAudioMute,
  } = props

  return (
    <div
      className={`voice-stage-grid${hasScreenShareStage ? ' voice-stage-grid--with-screen-focus' : ''}`}
    >
      {joined && (
        <article
          className={`voice-stage-tile self${hasScreenShareStage && resolvedScreenFocusId === 'local' ? ' voice-stage-tile--focus' : ''}`}
        >
          {screenSharing && localScreenStream && streamHasScreenShare(localScreenStream) && (
            <span className="voice-tile-live-badge">{tr('voiceRoom.liveBadge')}</span>
          )}
          {screenSharing && localScreenStream ? (
            resolvedScreenFocusId === 'local' ? (
              cameraOn ? (
                <video
                  ref={localVideoRef}
                  className="voice-stage-video"
                  muted
                  playsInline
                  autoPlay
                  aria-label={tr('voiceRoom.camOnLabel')}
                />
              ) : (
                <div className="voice-stage-fallback">
                  {user?.avatar_url ? (
                    <img
                      className="voice-stage-avatar"
                      src={resolveImageUrl(user.avatar_url)}
                      alt={tr('voiceRoom.avatarAlt', { name: user?.username || tr('voiceRoom.you') })}
                    />
                  ) : (
                    <span className="voice-stage-initial">
                      {getVoiceParticipantInitial(user?.username || tr('voiceRoom.you'))}
                    </span>
                  )}
                </div>
              )
            ) : (
              <div className="voice-local-video-stack">
                <video
                  ref={localScreenVideoRef}
                  className="voice-stage-video voice-local-screen"
                  muted
                  playsInline
                  autoPlay
                  aria-label={tr('voiceRoom.yourScreen')}
                />
                {cameraOn ? (
                  <video
                    ref={localPipVideoRef}
                    className="voice-stage-video voice-local-camera-pip"
                    muted
                    playsInline
                    autoPlay
                    aria-label={tr('voiceRoom.camOnLabel')}
                  />
                ) : null}
              </div>
            )
          ) : cameraOn ? (
            <video
              ref={localVideoRef}
              className="voice-stage-video"
              muted
              playsInline
              autoPlay
              aria-label={tr('voiceRoom.camOnLabel')}
            />
          ) : (
            <div className="voice-stage-fallback">
              {user?.avatar_url ? (
                <img
                  className="voice-stage-avatar"
                  src={resolveImageUrl(user.avatar_url)}
                  alt={tr('voiceRoom.avatarAlt', { name: user?.username || tr('voiceRoom.you') })}
                />
              ) : (
                <span className="voice-stage-initial">
                  {getVoiceParticipantInitial(user?.username || tr('voiceRoom.you'))}
                </span>
              )}
            </div>
          )}
          <footer className="voice-stage-meta">
            <span className="voice-stage-name">{tr('voiceRoom.you')}</span>
            {screenSharing && (
              <span className="voice-badge screen" title={tr('voiceRoom.screenBadgeTitle')}>
                <IconScreenShare /> <span className="voice-badge-text">{tr('voiceRoom.screenLabel')}</span>
              </span>
            )}
            {muted && (
              <span className="voice-badge muted" title={tr('voiceRoom.micMutedTitle')}>
                <IconMicMuted /> <span className="voice-badge-text">{tr('voiceRoom.muteLabel')}</span>
              </span>
            )}
          </footer>
        </article>
      )}

      {remoteParticipants.map((p) => (
        <article
          key={p.socketId}
          className={`voice-stage-tile ${speakingMap[p.socketId] ? 'speaking' : ''}${hasScreenShareStage && resolvedScreenFocusId === p.socketId ? ' voice-stage-tile--focus' : ''}`}
        >
          {streamHasScreenShare(remoteStreams[p.socketId]) && (
            <span className="voice-tile-live-badge">{tr('voiceRoom.liveBadge')}</span>
          )}
          <VoiceRemoteParticipantMedia
            stream={remoteStreams[p.socketId]}
            volume={deafened ? 0 : remoteVolumes[p.socketId] ?? 100}
            mutedByDeafen={deafened}
            screenAudioMutedByUser={Boolean(remoteScreenAudioMuted[p.socketId])}
            omitScreen={resolvedScreenFocusId === p.socketId}
            getAudioContext={ensureAudioContext}
            onAudioRef={(el) => {
              if (el) remoteMediaRef.current.set(p.socketId, el)
              else remoteMediaRef.current.delete(p.socketId)
            }}
          />
          {!streamShowsVideoInTile(remoteStreams[p.socketId], resolvedScreenFocusId === p.socketId) && (
            <div className="voice-stage-fallback">
              {p.avatar_url && !remoteAvatarFailed.has(String(p.userId)) ? (
                <img
                  className="voice-stage-avatar"
                  src={resolveImageUrl(p.avatar_url)}
                  alt=""
                  onError={() => {
                    setRemoteAvatarFailed((prev) => new Set(prev).add(String(p.userId)))
                  }}
                />
              ) : (
                <span className="voice-stage-initial">{getVoiceParticipantInitial(p.username)}</span>
              )}
            </div>
          )}
          <footer className="voice-stage-meta">
            <span className="voice-stage-name">{p.username}</span>
            <span className="voice-stage-meta-badges">
              {streamHasScreenShare(remoteStreams[p.socketId]) && (
                <span className="voice-badge screen" title={tr('voiceRoom.screenBadgeTitle')}>
                  <IconScreenShare /> <span className="voice-badge-text">{tr('voiceRoom.screenLabel')}</span>
                </span>
              )}
              {p.mic_muted ? (
                <span className="voice-badge muted" title={tr('voiceRoom.micMutedTitle')}>
                  <IconMicMuted /> <span className="voice-badge-text">{tr('voiceRoom.muteLabel')}</span>
                </span>
              ) : null}
              {p.deafened ? (
                <span className="voice-badge voice-badge--deafened" title={tr('voiceRoom.deafenedTitle')}>
                  <IconHeadphonesDeafened />{' '}
                  <span className="voice-badge-text">{tr('voiceRoom.deafenedLabel')}</span>
                </span>
              ) : null}
              <span
                className={`voice-indicator ${speakingMap[p.socketId] ? 'active' : ''}`}
                title={
                  speakingMap[p.socketId] ? tr('voiceRoom.speakingTitle') : tr('voiceRoom.listeningTitle')
                }
              >
                <IconWaveSpeaking />
                <span className="voice-indicator-label">
                  {speakingMap[p.socketId] ? tr('voiceRoom.speakingLabel') : tr('voiceRoom.listeningLabel')}
                </span>
              </span>
            </span>
          </footer>
          <label className="voice-volume">
            <IconVolume />
            <span className="sr-only">{tr('voiceRoom.volumeFor', { name: p.username })}</span>
            <input
              id={`voice-remote-vol-${p.userId}`}
              name={`voice_remote_volume_${p.userId}`}
              type="range"
              min="0"
              max="100"
              value={remoteVolumes[p.socketId] ?? 100}
              onChange={(e) => updateParticipantVolume(p.socketId, e.target.value)}
            />
            <span>{remoteVolumes[p.socketId] ?? 100}%</span>
          </label>
          {remoteStreamHasSplittableScreenAudio(remoteStreams[p.socketId]) ? (
            <div className="voice-screen-audio-row">
              <VoiceToolbarBtn
                onClick={() => toggleRemoteScreenAudioMute(p.socketId)}
                title={
                  remoteScreenAudioMuted[p.socketId]
                    ? tr('voiceRoom.screenAudioUnmuteTitle')
                    : tr('voiceRoom.screenAudioMuteTitle')
                }
                ariaLabel={
                  remoteScreenAudioMuted[p.socketId]
                    ? tr('voiceRoom.screenAudioUnmuteAria')
                    : tr('voiceRoom.screenAudioMuteAria')
                }
                pressed={Boolean(remoteScreenAudioMuted[p.socketId])}
              >
                <span className="voice-screen-audio-icon" aria-hidden>
                  {remoteScreenAudioMuted[p.socketId] ? '🔇' : '🔊'}
                </span>
              </VoiceToolbarBtn>
              <span className="muted small">{tr('voiceRoom.screenAudioLabel')}</span>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )
}
