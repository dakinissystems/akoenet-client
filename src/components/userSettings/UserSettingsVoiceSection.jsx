export default function UserSettingsVoiceSection(props) {
  const {
    t,
    micGain,
    setMicGain,
    monitorMic,
    setMonitorMic,
    startWithCamera,
    setStartWithCamera,
    startMuted,
    setStartMuted,
    startDeafened,
    setStartDeafened,
    testing,
    micLevel,
    startMicTest,
    stopMicTest,
  } = props

  return (
    <>
      <p className="muted small">{t('userSettings.voice.tabLead')}</p>
      <div className="voice-settings-row">
        <label htmlFor="user-settings-mic-gain">{t('voiceSettings.micVolume', { pct: micGain })}</label>
        <input
          id="user-settings-mic-gain"
          name="mic_gain"
          type="range"
          min="0"
          max="200"
          value={micGain}
          onChange={(e) => setMicGain(Number(e.target.value))}
        />
      </div>
      <div className="voice-setting-toggle-row" style={{ marginTop: '0.5rem' }}>
        <span className="voice-setting-toggle-label">{t('voiceSettings.micMonitorLabel')}</span>
        <button
          id="voice-settings-monitor-mic"
          name="monitor_mic"
          type="button"
          className={`voice-setting-toggle-btn ${monitorMic ? 'is-active' : ''}`}
          onClick={() => setMonitorMic((prev) => !prev)}
        >
          <span className="voice-setting-toggle-icon" aria-hidden>{monitorMic ? '🎧' : '📊'}</span>
          <span>{monitorMic ? t('voiceSettings.monitorOn') : t('voiceSettings.monitorOff')}</span>
        </button>
      </div>
      <div className="voice-setting-toggle-row">
        <span className="voice-setting-toggle-label">{t('voiceSettings.startCameraLabel')}</span>
        <button
          id="voice-settings-camera-enabled"
          name="camera_enabled"
          type="button"
          className={`voice-setting-toggle-btn ${startWithCamera ? 'is-active' : ''}`}
          onClick={() => setStartWithCamera((prev) => !prev)}
        >
          <span className="voice-setting-toggle-icon" aria-hidden>{startWithCamera ? '📷' : '🚫'}</span>
          <span>{startWithCamera ? t('voiceSettings.cameraOn') : t('voiceSettings.cameraOff')}</span>
        </button>
      </div>
      <div className="voice-setting-toggle-row">
        <span className="voice-setting-toggle-label">{t('voiceSettings.startMutedLabel')}</span>
        <button
          id="voice-settings-start-muted"
          name="start_muted"
          type="button"
          className={`voice-setting-toggle-btn ${startMuted ? 'is-active' : ''}`}
          onClick={() =>
            setStartMuted((prev) => {
              const next = !prev
              if (!next) setStartDeafened(false)
              return next
            })
          }
        >
          <span className="voice-setting-toggle-icon" aria-hidden>{startMuted ? '🔇' : '🎙️'}</span>
          <span>{startMuted ? t('voiceSettings.muted') : t('voiceSettings.unmuted')}</span>
        </button>
      </div>
      <div className="voice-setting-toggle-row">
        <span className="voice-setting-toggle-label">{t('voiceSettings.startDeafenedLabel')}</span>
        <button
          id="voice-settings-start-deafened"
          name="start_deafened"
          type="button"
          className={`voice-setting-toggle-btn ${startDeafened ? 'is-active' : ''}`}
          onClick={() =>
            setStartDeafened((prev) => {
              const next = !prev
              if (next) setStartMuted(true)
              return next
            })
          }
        >
          <span className="voice-setting-toggle-icon" aria-hidden>{startDeafened ? '🙉' : '👂'}</span>
          <span>{startDeafened ? t('voiceSettings.deafened') : t('voiceSettings.listening')}</span>
        </button>
      </div>
      <div className="mic-status">
        <span className="muted small">
          {testing
            ? monitorMic
              ? t('voiceSettings.statusListening')
              : t('voiceSettings.statusMeter')
            : t('voiceSettings.statusIdle')}
        </span>
        <div className="mic-meter">
          <span className="mic-meter-fill" style={{ width: `${Math.max(6, Math.round(micLevel * 100))}%` }} />
        </div>
      </div>
      <div className="voice-controls">
        {!testing ? (
          <button type="button" className="btn secondary" onClick={startMicTest}>
            {t('voiceSettings.testMic')}
          </button>
        ) : (
          <button type="button" className="btn ghost" onClick={stopMicTest}>
            {t('voiceSettings.stopTest')}
          </button>
        )}
      </div>
    </>
  )
}
