import api from '../../services/api'
import { urlBase64ToUint8Array } from '../../lib/userSettingsHelpers'
import PasswordField from '../PasswordField'

export default function UserSettingsAccountSection(props) {
  const {
    t,
    user,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    saving,
    saveUserSettings,
    logoutAllBusy,
    setLogoutAllBusy,
    signOutAllDevices,
    onClose,
    totpSetupSecret,
    setTotpSetupSecret,
    totpEnableCode,
    setTotpEnableCode,
    disable2faPassword,
    setDisable2faPassword,
    disable2faCode,
    setDisable2faCode,
    refreshUser,
    exportBusy,
    downloadMyData,
    eraseConfirm,
    setEraseConfirm,
    eraseBusy,
    eraseMyAccount,
    setError,
    setInfo,
  } = props

  return (
    <div className="form-stack">
      <form onSubmit={(e) => { e.preventDefault(); saveUserSettings() }} className="form-stack">
        <PasswordField
          id="settings-current-password"
          name="current_password"
          label={t('userSettings.account.currentPasswordHint')}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
        <PasswordField
          id="settings-new-password"
          name="new_password"
          label={t('userSettings.account.newPassword')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        <button type="submit" className="btn primary" disabled={saving}>
          {saving ? t('userSettings.profile.saving') : t('userSettings.account.saveAccountSettings')}
        </button>
      </form>
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <h4 className="muted small" style={{ margin: '0 0 0.5rem' }}>{t('userSettings.account.sessions')}</h4>
        <p className="muted small" style={{ margin: '0 0 0.5rem' }}>
          {t('userSettings.account.sessionsDetail')}
        </p>
        <button
          type="button"
          className="btn secondary small"
          disabled={logoutAllBusy}
          onClick={async () => {
            setError('')
            setInfo('')
            setLogoutAllBusy(true)
            try {
              await signOutAllDevices()
              onClose()
            } catch {
              setError(t('userSettings.account.logoutAllError'))
            } finally {
              setLogoutAllBusy(false)
            }
          }}
        >
          {logoutAllBusy ? t('userSettings.account.signingOutAll') : t('userSettings.account.signOutAllCta')}
        </button>
      </div>
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <h4 className="muted small" style={{ margin: '0 0 0.5rem' }}>{t('userSettings.account.twofaHeading')}</h4>
        {user?.totp_enabled ? (
          <div className="form-stack">
            <p className="muted small">{t('userSettings.account.twofaEnabledLine')}</p>
            <PasswordField
              id="settings-disable-2fa-password"
              label={t('userSettings.account.currentPassword')}
              value={disable2faPassword}
              onChange={(e) => setDisable2faPassword(e.target.value)}
              autoComplete="current-password"
            />
            <label>
              {t('userSettings.account.authenticatorCode')}
              <input value={disable2faCode} onChange={(e) => setDisable2faCode(e.target.value)} />
            </label>
            <button
              type="button"
              className="btn ghost small"
              onClick={async () => {
                setError('')
                try {
                  await api.post('/auth/2fa/disable', {
                    password: disable2faPassword,
                    code: disable2faCode,
                  })
                  setDisable2faPassword('')
                  setDisable2faCode('')
                  await refreshUser()
                  setInfo(t('userSettings.account.info2faDisabled'))
                } catch {
                  setError(t('userSettings.account.errDisable2fa'))
                }
              }}
            >
              {t('userSettings.account.disable2fa')}
            </button>
          </div>
        ) : (
          <div className="form-stack">
            {!totpSetupSecret ? (
              <button
                type="button"
                className="btn secondary small"
                onClick={async () => {
                  setError('')
                  try {
                    const { data } = await api.post('/auth/2fa/setup')
                    setTotpSetupSecret(data.secret)
                    setInfo(t('userSettings.account.info2faSetup'))
                  } catch {
                    setError(t('userSettings.account.err2faSetup'))
                  }
                }}
              >
                {t('userSettings.account.setupAuthenticator')}
              </button>
            ) : (
              <>
                <p className="muted small" style={{ wordBreak: 'break-all' }}>
                  {t('userSettings.account.secretPrefix')} {totpSetupSecret}
                </p>
                <label>
                  {t('userSettings.account.code6')}
                  <input value={totpEnableCode} onChange={(e) => setTotpEnableCode(e.target.value)} />
                </label>
                <button
                  type="button"
                  className="btn primary small"
                  onClick={async () => {
                    setError('')
                    try {
                      await api.post('/auth/2fa/enable', { code: totpEnableCode })
                      setTotpSetupSecret('')
                      setTotpEnableCode('')
                      await refreshUser()
                      setInfo(t('userSettings.account.info2faEnabled'))
                    } catch {
                      setError(t('userSettings.account.invalid2faCode'))
                    }
                  }}
                >
                  {t('userSettings.account.enable2fa')}
                </button>
              </>
            )}
          </div>
        )}
        <h4 className="muted small" style={{ margin: '1rem 0 0.5rem' }}>{t('userSettings.account.browserNotif')}</h4>
        <button
          type="button"
          className="btn secondary small"
          onClick={async () => {
            setError('')
            try {
              const { data } = await api.get('/auth/push/vapid-public-key')
              if (!data?.publicKey) {
                setError(t('userSettings.account.errPushNotConfigured'))
                return
              }
              const reg = await navigator.serviceWorker.register('/sw.js')
              const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(data.publicKey),
              })
              const j = sub.toJSON()
              await api.post('/auth/push/subscribe', {
                endpoint: j.endpoint,
                keys: { p256dh: j.keys.p256dh, auth: j.keys.auth },
              })
              setInfo(t('userSettings.account.infoPushEnabled'))
            } catch {
              setError(t('userSettings.account.errPushEnable'))
            }
          }}
        >
          {t('userSettings.account.enablePush')}
        </button>
      </div>
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <h4 className="muted small" style={{ margin: '0 0 0.5rem' }}>{t('userSettings.account.dataPrivacy')}</h4>
        <p className="muted small" style={{ margin: '0 0 0.75rem' }}>
          {t('userSettings.account.dataPrivacyDesc')}
        </p>
        <button type="button" className="btn secondary" disabled={exportBusy} onClick={downloadMyData}>
          {exportBusy ? t('userSettings.account.preparingExport') : t('userSettings.account.downloadMyData')}
        </button>
      </div>
      <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(239,68,68,0.25)' }}>
        <h4 className="muted small" style={{ margin: '0 0 0.5rem', color: '#fca5a5' }}>{t('userSettings.account.deleteAccount')}</h4>
        <p className="muted small" style={{ margin: '0 0 0.75rem' }}>
          {t('userSettings.account.deleteWarnBefore')}
          <strong>DELETE</strong>
          {t('userSettings.account.deleteWarnAfter')}
        </p>
        <label>
          {t('userSettings.account.confirmationLabel')}
          <input
            id="settings-erase-confirm"
            name="erase_confirm"
            type="text"
            value={eraseConfirm}
            onChange={(e) => setEraseConfirm(e.target.value)}
            placeholder={t('userSettings.account.deletePlaceholder')}
            autoComplete="off"
          />
        </label>
        <button type="button" className="btn danger" disabled={eraseBusy} onClick={eraseMyAccount}>
          {eraseBusy ? t('userSettings.account.erasing') : t('userSettings.account.eraseMyAccount')}
        </button>
      </div>
    </div>
  )
}
