import { resolveImageUrl } from '../../lib/resolveImageUrl'

export default function UserSettingsProfileSection(props) {
  const {
    t,
    user,
    username,
    setUsername,
    avatarUrl,
    setAvatarUrl,
    bannerUrl,
    setBannerUrl,
    accentColor,
    setAccentColor,
    bio,
    setBio,
    presenceStatus,
    setPresenceStatus,
    customStatus,
    setCustomStatus,
    schedulerStreamerUsername,
    setSchedulerStreamerUsername,
    avatarPreviewFailed,
    setAvatarPreviewFailed,
    previewStyle,
    saveUserSettings,
    saving,
    canEditAccent = true,
    canEditBanner = true,
    unlockAt = { profile_color: 5, profile_banner: 10 },
  } = props

  return (
    <form onSubmit={(e) => { e.preventDefault(); saveUserSettings() }} className="form-stack">
      <div style={previewStyle}>
        <div style={{ height: 86, backgroundImage: bannerUrl ? `url("${resolveImageUrl(bannerUrl).replace(/"/g, '\\"')}")` : 'linear-gradient(120deg, #1f2937, #0f172a)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.65rem 0.75rem' }}>
          {avatarUrl && !avatarPreviewFailed ? (
            <img
              src={resolveImageUrl(avatarUrl)}
              alt={t('userSettings.profile.avatarPreviewAlt')}
              style={{ width: 42, height: 42, borderRadius: '999px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
              onError={() => setAvatarPreviewFailed(true)}
            />
          ) : (
            <span
              className="user-avatar-fallback"
              aria-hidden="true"
              style={{ width: 42, height: 42, borderRadius: '999px', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {String(username || user?.username || 'U').trim().charAt(0).toUpperCase() || 'U'}
            </span>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '999px', display: 'inline-block', background: presenceStatus === 'online' ? '#22c55e' : presenceStatus === 'idle' ? '#f59e0b' : presenceStatus === 'dnd' ? '#ef4444' : '#6b7280' }} />
              {username || t('channelList.userFallback')}
            </div>
            <div className="muted small" style={{ margin: 0 }}>
              {customStatus || bio || t('userSettings.profile.noBio')}
            </div>
          </div>
        </div>
      </div>
      <label>
        {t('userSettings.profile.username')}
        <input id="settings-username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={40} />
      </label>
      <label>
        {t('userSettings.profile.avatarUrl')}
        <input id="settings-avatar-url" name="avatar_url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder={t('userSettings.profile.urlPlaceholder')} />
      </label>
      <label>
        {t('userSettings.profile.bannerUrl')}
        <input
          id="settings-banner-url"
          name="banner_url"
          value={bannerUrl}
          onChange={(e) => setBannerUrl(e.target.value)}
          placeholder={t('userSettings.profile.urlPlaceholder')}
          disabled={!canEditBanner}
        />
        {!canEditBanner && (
          <span className="muted small" style={{ display: 'block', marginTop: 4 }}>
            {t('userSettings.profile.unlockBanner', { level: unlockAt.profile_banner || 10 })}
          </span>
        )}
      </label>
      <label>
        {t('userSettings.profile.accentColor')}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            id="settings-accent-color-picker"
            name="accent_color_picker"
            type="color"
            value={/^#([0-9a-fA-F]{6})$/.test(accentColor || '') ? accentColor : '#7c3aed'}
            onChange={(e) => setAccentColor(e.target.value)}
            style={{ width: 48, height: 34, padding: 2 }}
            disabled={!canEditAccent}
          />
          <input
            id="settings-accent-color-text"
            name="accent_color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            placeholder={t('userSettings.profile.accentHexPlaceholder')}
            maxLength={7}
            disabled={!canEditAccent}
          />
        </div>
        {!canEditAccent && (
          <span className="muted small" style={{ display: 'block', marginTop: 4 }}>
            {t('userSettings.profile.unlockAccent', { level: unlockAt.profile_color || 5 })}
          </span>
        )}
      </label>
      <label>
        {t('userSettings.profile.presence')}
        <select id="settings-presence-status" name="presence_status" value={presenceStatus} onChange={(e) => setPresenceStatus(e.target.value)} className="select-inline">
          <option value="online">{t('userSettings.profile.presenceOnline')}</option>
          <option value="idle">{t('userSettings.profile.presenceIdle')}</option>
          <option value="dnd">{t('userSettings.profile.presenceDnd')}</option>
          <option value="invisible">{t('userSettings.profile.presenceInvisible')}</option>
        </select>
      </label>
      <label>
        {t('userSettings.profile.customStatus')}
        <input id="settings-custom-status" name="custom_status" value={customStatus} onChange={(e) => setCustomStatus(e.target.value)} maxLength={120} placeholder={t('userSettings.profile.customStatusPh')} />
      </label>
      <label>
        {t('userSettings.profile.bio')}
        <input id="settings-bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={240} placeholder={t('userSettings.profile.bioPh')} />
      </label>
      <label>
        {t('userSettings.profile.schedulerSlug')}
        <input id="settings-scheduler-slug" name="scheduler_streamer_username" value={schedulerStreamerUsername} onChange={(e) => setSchedulerStreamerUsername(e.target.value)} maxLength={80} placeholder={t('userSettings.profile.schedulerSlugPh')} autoComplete="off" />
        <span className="muted small" style={{ display: 'block', marginTop: 4 }}>{t('userSettings.profile.schedulerSlugHint')}</span>
      </label>
      <button type="submit" className="btn primary" disabled={saving}>
        {saving ? t('userSettings.profile.saving') : t('userSettings.profile.saveProfile')}
      </button>
    </form>
  )
}
