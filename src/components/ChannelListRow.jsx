import { resolveImageUrl } from '../lib/resolveImageUrl'
import {
  channelIcon,
  voiceChannelUserMax,
  VoiceSidebarHeadphonesDeafIcon,
  VoiceSidebarMicMutedIcon,
} from './channelListUtils'
import VoiceSidebarUserControls from './VoiceSidebarUserControls'

export default function ChannelListRow({
  channel: c,
  groupId = null,
  activeChannelId,
  onSelectChannel,
  onDeleteChannel,
  onMoveChannel,
  createUI,
  setCreateUI,
  popoverRef,
  draftName,
  setDraftName,
  submitNewChannel,
  closeCreate,
  t,
  voiceUsersForChannel,
  sortedVoiceUsersForChannel,
  isVoiceScreenSharingUser,
  voiceAvatarFailed,
  setVoiceAvatarFailed,
  currentUserId = null,
  voiceSidebarControls = null,
}) {
  const besideOpen = createUI?.type === 'beside' && createUI.channelId === c.id
  const vCount = c.type === 'voice' ? voiceUsersForChannel(c.id).length : 0
  const vMax = c.type === 'voice' ? voiceChannelUserMax(c) : null
  const vSorted = c.type === 'voice' ? sortedVoiceUsersForChannel(c.id) : []
  const hasConnectedUsers = vSorted.length > 0
  const voiceXyFull = c.type === 'voice' && vMax != null && vCount >= vMax
  const showVoiceXy = c.type === 'voice' && vMax != null && voiceXyFull
  const isActiveVoice = c.type === 'voice' && activeChannelId === c.id
  const selfVoiceControlsActive =
    voiceSidebarControls?.joined &&
    voiceSidebarControls.channelId != null &&
    Number(voiceSidebarControls.channelId) === Number(c.id)

  return (
    <li
      className="draggable-item"
      draggable
      onDragStart={(e) => {
        e.currentTarget.classList.add('is-dragging')
        e.dataTransfer.setData('text/plain', JSON.stringify({ kind: 'channel', id: c.id }))
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove('is-dragging')}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const raw = e.dataTransfer.getData('text/plain')
        if (!raw) return
        const payload = JSON.parse(raw)
        if (payload.kind === 'channel') {
          onMoveChannel(payload.id, c.id, groupId ?? null)
        }
      }}
    >
      {c.type === 'voice' ? (
        <div
          className={[
            'voice-channel-discord-wrap',
            isActiveVoice ? 'voice-channel-discord-wrap--active' : '',
            hasConnectedUsers ? 'voice-channel-discord-wrap--has-users' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div
            className={`channel-item channel-item-discord channel-item-discord--voice-header ${isActiveVoice ? 'active' : ''}`}
          >
            <button
              type="button"
              className="channel-item-select channel-item-main channel-item-main--voice"
              onClick={() => onSelectChannel(c.id)}
            >
              {channelIcon(c)}
              {c.is_private && (
                <span className="channel-lock" title={t('common.privateChannel')}>
                  🔒
                </span>
              )}
              <span className="channel-name channel-name--voice">{c.name}</span>
              {showVoiceXy && (
                <span
                  className={`voice-channel-xy ${voiceXyFull ? 'voice-channel-xy--full' : ''}`}
                  title={
                    vMax != null
                      ? t('channelList.voiceConnectedMax', { count: vCount, max: vMax })
                      : t('channelList.voiceConnectedTitle', { count: vCount })
                  }
                >
                  {`(${vCount}/${vMax})`}
                </span>
              )}
            </button>
            <span className="channel-row-tools">
              <button
                type="button"
                className="channel-row-add"
                title={t('channelList.addChannelSameSection')}
                onClick={() => setCreateUI({ type: 'beside', channelId: c.id })}
              >
                +
              </button>
              <button
                type="button"
                className="channel-row-action"
                title={t('channelList.deleteChannel')}
                onClick={() => onDeleteChannel(c.id)}
              >
                🗑
              </button>
            </span>
          </div>
          <ul className="voice-channel-connected" aria-label={t('channelList.voiceConnectedAria', { name: c.name })}>
            {vSorted.map((p) => {
              const uidKey = p.userId != null ? String(p.userId) : ''
              const isSelf =
                currentUserId != null && p.userId != null && String(p.userId) === String(currentUserId)
              const showImg = p.avatar_url && !voiceAvatarFailed.has(uidKey)
              const liveSharing = isVoiceScreenSharingUser(p.userId)
              const displayName = p.username || `User ${p.userId}`
              const showSelfControls = isSelf && selfVoiceControlsActive
              return (
                <li
                  key={`${c.id}-${p.userId}`}
                  className={[
                    'voice-channel-connected-user',
                    isSelf ? 'voice-channel-connected-user--self' : '',
                    p.mic_muted ? 'voice-channel-connected-user--muted' : '',
                    p.deafened ? 'voice-channel-connected-user--deaf' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {showImg ? (
                    <img
                      className="voice-channel-connected-avatar-img"
                      src={resolveImageUrl(p.avatar_url)}
                      alt=""
                      onError={() => {
                        setVoiceAvatarFailed((prev) => new Set(prev).add(uidKey))
                      }}
                    />
                  ) : (
                    <span className="voice-channel-connected-avatar" aria-hidden>
                      {(p.username || '?').slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="voice-channel-connected-name" title={displayName}>
                    {displayName}
                    {isSelf ? (
                      <span className="voice-channel-connected-you">{t('channelList.voiceYouSuffix')}</span>
                    ) : null}
                  </span>
                  {showSelfControls ? (
                    <VoiceSidebarUserControls
                      t={t}
                      muted={voiceSidebarControls.muted}
                      deafened={voiceSidebarControls.deafened}
                      onToggleMute={voiceSidebarControls.toggleMute}
                      onToggleDeafen={voiceSidebarControls.toggleDeafened}
                      onLeave={voiceSidebarControls.leaveVoice}
                    />
                  ) : (
                    <span className="voice-channel-audio-badges" aria-hidden>
                      {p.mic_muted ? (
                        <span className="voice-channel-audio-badge voice-channel-audio-badge--mute" title={t('channelList.micMutedTitle')}>
                          <VoiceSidebarMicMutedIcon />
                        </span>
                      ) : null}
                      {p.deafened ? (
                        <span className="voice-channel-audio-badge voice-channel-audio-badge--deaf" title={t('channelList.deafenedTitle')}>
                          <VoiceSidebarHeadphonesDeafIcon />
                        </span>
                      ) : null}
                    </span>
                  )}
                  {liveSharing ? (
                    <span className="voice-channel-live-badge" title={t('channelList.screenShareTitle')}>
                      {t('channelList.liveBadge')}
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <div className={`channel-item channel-item-discord ${activeChannelId === c.id ? 'active' : ''}`}>
          <button
            type="button"
            className="channel-item-select channel-item-main"
            onClick={() => onSelectChannel(c.id)}
          >
            {channelIcon(c)}
            {c.is_private && (
              <span className="channel-lock" title={t('common.privateChannel')}>
                🔒
              </span>
            )}
            <span className="channel-name">{c.name}</span>
          </button>
          <span className="channel-row-tools">
            <button
              type="button"
              className="channel-row-add"
              title="Add channel with same type in this section"
              onClick={() => setCreateUI({ type: 'beside', channelId: c.id })}
            >
              +
            </button>
            <button
              type="button"
              className="channel-row-action"
              title="Delete channel"
              onClick={() => onDeleteChannel(c.id)}
            >
              🗑
            </button>
          </span>
        </div>
      )}
      {besideOpen && (
        <div ref={popoverRef} className="channel-create-inline channel-create-inline--beside">
          <p className="channel-create-inline-hint">
            {t('channelList.newChannelSameType', { name: c.name })}
          </p>
          <form
            className="channel-create-inline-form"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!draftName.trim()) return
              await submitNewChannel({
                name: draftName.trim(),
                type: c.type,
                categoryId: c.category_id ?? null,
                isPrivate: c.is_private,
              })
            }}
          >
            <input
              id="channel-create-beside-name"
              name="channel_name"
              className="channel-create-inline-input"
              aria-label={t('channelList.channelNamePh')}
              placeholder={t('channelList.channelNamePh')}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
            />
            <button type="submit" className="btn small primary">
              {t('channelList.create')}
            </button>
            <button type="button" className="btn small ghost" onClick={closeCreate}>
              {t('channelList.cancel')}
            </button>
          </form>
        </div>
      )}
    </li>
  )
}
