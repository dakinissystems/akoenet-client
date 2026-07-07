import { isTauri } from '../../lib/isTauri'

export default function UserSettingsActivitySection(props) {
  const {
    t,
    user,
    shareGameActivity,
    setShareGameActivity,
    twitchGate,
    twitchBusy,
    connectTwitch,
    unlinkTwitch,
    steamBusy,
    connectSteam,
    unlinkSteam,
    activitySaving,
    manualGame,
    setManualGame,
    manualPlatform,
    setManualPlatform,
    desktopGameDetect,
    setDesktopGameDetect,
    saveActivitySettings,
    setTwitchStatusRetryToken,
  } = props

  return (
    <div className="form-stack">
      <p className="muted small" style={{ margin: '0 0 0.75rem' }}>
        {t('userSettings.activity.intro')}
      </p>
      <label className="voice-setting-toggle-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          id="settings-share-game-activity"
          name="share_game_activity"
          type="checkbox"
          checked={shareGameActivity}
          onChange={(e) => setShareGameActivity(e.target.checked)}
        />
        <span>{t('userSettings.activity.shareLabel')}</span>
      </label>
      {twitchGate === 'loading' ? (
        <p className="muted small" style={{ marginTop: '0.75rem' }}>
          {t('userSettings.activity.twitchChecking')}
        </p>
      ) : twitchGate === 'ready' ? (
        <div style={{ marginTop: '0.75rem' }}>
          <strong className="muted small" style={{ display: 'block', marginBottom: 6 }}>
            {t('userSettings.activity.twitchHeading')}
          </strong>
          <p className="muted small" style={{ margin: '0 0 0.5rem' }}>
            {user?.twitch_username
              ? t('userSettings.activity.twitchLinkedAs', { username: user.twitch_username })
              : t('userSettings.activity.twitchNotLinked')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              className="btn twitch small"
              disabled={twitchBusy || !shareGameActivity}
              onClick={() => connectTwitch()}
            >
              {twitchBusy
                ? t('userSettings.activity.redirecting')
                : user?.twitch_username
                  ? t('userSettings.activity.reconnectTwitch')
                  : t('userSettings.activity.connectTwitch')}
            </button>
            {user?.twitch_username ? (
              <button
                type="button"
                className="btn ghost small"
                disabled={activitySaving}
                onClick={() => unlinkTwitch()}
              >
                {t('userSettings.activity.unlinkTwitch')}
              </button>
            ) : null}
          </div>
        </div>
      ) : twitchGate === 'disabled' ? (
        <p className="muted small" style={{ marginTop: '0.75rem' }}>
          {t('userSettings.activity.twitchUnavailableHint')}
        </p>
      ) : (
        <div className="muted small" style={{ marginTop: '0.75rem' }}>
          <p style={{ margin: '0 0 0.5rem' }}>{t('userSettings.activity.twitchServerUnreachableHint')}</p>
          <button
            type="button"
            className="btn ghost small"
            onClick={() => setTwitchStatusRetryToken((n) => n + 1)}
          >
            {t('userSettings.activity.twitchRetryCheck')}
          </button>
        </div>
      )}
      {user?.steam_status?.web_api_configured ? (
        <div style={{ marginTop: '0.75rem' }}>
          <strong className="muted small" style={{ display: 'block', marginBottom: 6 }}>
            {t('userSettings.activity.steamHeading')}
          </strong>
          <p className="muted small" style={{ margin: '0 0 0.5rem' }}>
            {user?.steam_linked
              ? t('userSettings.activity.steamLinked')
              : t('userSettings.activity.steamNotLinked')}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button
              type="button"
              className="btn secondary small"
              disabled={steamBusy || !shareGameActivity}
              onClick={() => connectSteam()}
            >
              {steamBusy
                ? t('userSettings.activity.redirecting')
                : user?.steam_linked
                  ? t('userSettings.activity.reconnectSteam')
                  : t('userSettings.activity.connectSteam')}
            </button>
            {user?.steam_linked ? (
              <button
                type="button"
                className="btn ghost small"
                disabled={activitySaving}
                onClick={() => unlinkSteam()}
              >
                {t('userSettings.activity.unlinkSteam')}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <label style={{ marginTop: '0.85rem', display: 'block' }}>
        {t('userSettings.activity.manualGame')}
        <input
          id="settings-manual-game"
          name="manual_activity_game"
          value={manualGame}
          onChange={(e) => setManualGame(e.target.value)}
          maxLength={120}
          placeholder={t('userSettings.activity.manualGamePh')}
          disabled={!shareGameActivity}
          autoComplete="off"
        />
      </label>
      <label>
        {t('userSettings.activity.manualPlatform')}
        <input
          id="settings-manual-platform"
          name="manual_activity_platform"
          value={manualPlatform}
          onChange={(e) => setManualPlatform(e.target.value)}
          maxLength={40}
          placeholder={t('userSettings.activity.manualPlatformPh')}
          disabled={!shareGameActivity}
          autoComplete="off"
        />
      </label>
      <label className="voice-setting-toggle-row" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          id="settings-desktop-detect"
          name="desktop_game_detect_opt_in"
          type="checkbox"
          checked={desktopGameDetect}
          disabled={!shareGameActivity || !isTauri()}
          onChange={(e) => setDesktopGameDetect(e.target.checked)}
        />
        <span>
          {t('userSettings.activity.desktopAuto')}{' '}
          {!isTauri() ? (
            <em className="muted small">{t('userSettings.activity.desktopAppHint')}</em>
          ) : null}
        </span>
      </label>
      <button
        type="button"
        className="btn primary"
        disabled={activitySaving || !shareGameActivity}
        onClick={() => saveActivitySettings()}
      >
        {activitySaving ? t('userSettings.activity.saving') : t('userSettings.activity.save')}
      </button>
    </div>
  )
}
