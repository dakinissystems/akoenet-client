import {
  IconHeadphones,
  IconHeadphonesDeafened,
  IconMic,
  IconMicMuted,
  PhoneHangupIcon,
  VoiceToolbarBtn,
} from './VoiceRoomIcons'

function SidebarVoiceBtn({ onClick, title, ariaLabel, pressed, active, danger, children }) {
  const cls = [
    'voice-icon-btn',
    'voice-icon-btn--sidebar',
    active && 'is-active',
    danger && 'is-danger',
    pressed && 'is-pressed',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={pressed}
    >
      {children}
    </button>
  )
}

export default function VoiceSidebarUserControls({ t, muted, deafened, onToggleMute, onToggleDeafen, onLeave }) {
  return (
    <span className="voice-channel-self-controls" role="group" aria-label={t('channelList.voiceSelfControlsAria')}>
      <SidebarVoiceBtn
        onClick={onToggleMute}
        title={muted ? t('voiceRoom.unmuteMicTitle') : t('voiceRoom.muteMicTitle')}
        ariaLabel={muted ? t('voiceRoom.unmuteMicAria') : t('voiceRoom.muteMicAria')}
        pressed={muted}
        active={!muted}
      >
        {muted ? <IconMicMuted className="voice-toolbar-svg--sidebar" /> : <IconMic className="voice-toolbar-svg--sidebar" />}
      </SidebarVoiceBtn>
      <SidebarVoiceBtn
        onClick={onToggleDeafen}
        title={deafened ? t('voiceRoom.undeafenTitle') : t('voiceRoom.deafenTitle')}
        ariaLabel={deafened ? t('voiceRoom.undeafenAria') : t('voiceRoom.deafenAria')}
        pressed={deafened}
      >
        {deafened ? (
          <IconHeadphonesDeafened className="voice-toolbar-svg--sidebar" />
        ) : (
          <IconHeadphones className="voice-toolbar-svg--sidebar" />
        )}
      </SidebarVoiceBtn>
      <SidebarVoiceBtn
        onClick={onLeave}
        title={t('voiceRoom.leaveVoiceTitle')}
        ariaLabel={t('voiceRoom.leaveVoiceAria')}
        danger
      >
        <PhoneHangupIcon />
      </SidebarVoiceBtn>
    </span>
  )
}
