import { Link } from 'react-router-dom'
import { getApiBaseUrl } from '../lib/apiBase'
import { isCapacitorNative } from '../lib/mobile-runtime'
import { isTauri } from '../lib/isTauri'
import { INVITE_QUERY_PARAM } from '../lib/invites'
import { PENDING_INVITE_KEY } from './loginConstants'

export default function LoginCredentialsForm({
  email,
  setEmail,
  password,
  setPassword,
  busy,
  notice,
  error,
  searchParams,
  twitchGate,
  twitchOAuthRedirectUri,
  apiBase,
  setTwitchStatusRetryToken,
  t,
}) {
  return (
    <>
      {notice && <div className="info-banner">{notice}</div>}
      {error && <div className="error-banner">{error}</div>}
      <label>
        {t('login.email')}
        <input
          id="login-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>
      <label>
        {t('login.password')}
        <input
          id="login-password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </label>
      <p className="muted small" style={{ margin: '-0.25rem 0 0.5rem', textAlign: 'right' }}>
        <Link to="/login/forgot">{t('login.forgotPassword')}</Link>
      </p>
      <button type="submit" className="btn primary" disabled={busy}>
        {busy ? t('login.signingIn') : t('login.signIn')}
      </button>
      <button
        type="button"
        className="btn twitch"
        disabled={twitchGate !== 'ready'}
        title={
          twitchGate === 'disabled'
            ? t('login.twitchDisabledTitle')
            : twitchGate === 'unreachable'
              ? t('login.twitchUnreachableTitle')
              : undefined
        }
        onClick={() => {
          void (async () => {
            const inv = searchParams.get(INVITE_QUERY_PARAM)
            if (inv) {
              try {
                sessionStorage.setItem(PENDING_INVITE_KEY, inv)
              } catch {
                /* ignore */
              }
            }
            const nativeFlow = isCapacitorNative() || isTauri()
            const url = nativeFlow ? `${apiBase}/auth/twitch/start?native=1` : `${apiBase}/auth/twitch/start`
            if (isTauri()) {
              try {
                const { openUrl } = await import('@tauri-apps/plugin-opener')
                await openUrl(url)
                return
              } catch {
                /* fallback: in-webview navigation */
              }
            }
            window.location.href = url
          })()
        }}
      >
        {twitchGate === 'loading'
          ? t('login.twitchChecking')
          : twitchGate === 'disabled'
            ? t('login.twitchUnavailable')
            : twitchGate === 'unreachable'
              ? t('login.twitchServicePaused')
              : t('login.twitchSignIn')}
      </button>
      {twitchGate === 'disabled' && (
        <p className="muted small" style={{ marginTop: '0.5rem' }}>
          {t('login.twitchHelpBeforeUri')}{' '}
          <code>{twitchOAuthRedirectUri || `${getApiBaseUrl()}/auth/twitch/callback`}</code>
          {twitchOAuthRedirectUri?.includes('/api/user/') ? <> ({t('login.twitchHelpMountNote')})</> : null}
          {isTauri() ? <> {t('login.twitchHelpDesktopNote')}</> : null}
        </p>
      )}
      {twitchGate === 'unreachable' && (
        <div className="muted small" style={{ marginTop: '0.5rem' }}>
          <p style={{ margin: '0 0 0.5rem' }}>{t('login.twitchUnreachableBody')}</p>
          <button type="button" className="btn ghost small" onClick={() => setTwitchStatusRetryToken((n) => n + 1)}>
            {t('login.twitchRetryCheck')}
          </button>
        </div>
      )}
    </>
  )
}

export function LoginTwoFactorForm({ code2fa, setCode2fa, busy, error, onBack, t }) {
  return (
    <>
      {error && <div className="error-banner">{error}</div>}
      <p className="muted small">{t('login.twoFactorHint')}</p>
      <label>
        {t('login.twoFactorCode')}
        <input
          name="totp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code2fa}
          onChange={(e) => setCode2fa(e.target.value)}
          required
        />
      </label>
      <button type="submit" className="btn primary" disabled={busy}>
        {busy ? t('login.signingIn') : t('login.verify')}
      </button>
      <button type="button" className="btn ghost" onClick={onBack}>
        {t('login.back')}
      </button>
    </>
  )
}
