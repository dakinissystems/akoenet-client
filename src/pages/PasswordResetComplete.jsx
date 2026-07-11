import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { getApiBaseUrl } from '../lib/apiBase'
import { getRegistrationTokenFromLocation } from '../lib/register-token-url'
import { postAuthDestination } from '../lib/postAuthDestination'
import AuthLegalStrip from '../components/AuthLegalStrip'
import LanguageSwitcher from '../components/LanguageSwitcher'
import PasswordField from '../components/PasswordField'

export default function PasswordResetComplete() {
  const { t } = useTranslation()
  const { passwordResetComplete, user, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => {
    const fromRouter = String(searchParams.get('token') || '').trim()
    if (/^[a-f0-9]{64}$/i.test(fromRouter)) return fromRouter
    return getRegistrationTokenFromLocation()
  }, [searchParams])

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState(false)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [emailMasked, setEmailMasked] = useState('')

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [loading, user, navigate])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
        setPendingLoading(false)
        setLoadError(t('passwordResetComplete.invalidToken'))
        return
      }
      setLoadError('')
      try {
        const { data } = await api.get('/auth/password-reset/pending', { params: { token } })
        if (cancelled) return
        setEmailMasked(data.email_masked || '')
      } catch (err) {
        if (cancelled) return
        const code = err.response?.data?.error
        if (code === 'invalid_or_expired_token') {
          setLoadError(t('passwordResetComplete.tokenExpired'))
        } else if (code === 'database_schema_outdated') {
          setLoadError(t('passwordResetComplete.tokenDbSchema'))
        } else if (!err.response) {
          setLoadError(t('passwordResetComplete.tokenApiUnreachable', { url: getApiBaseUrl() }))
        } else {
          setLoadError(t('passwordResetComplete.tokenVerifyFailed'))
        }
      } finally {
        if (!cancelled) setPendingLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token, t])

  async function onSubmit(e) {
    e.preventDefault()
    if (password !== passwordConfirm) {
      setError(t('passwordResetComplete.passwordMismatch'))
      return
    }
    setError('')
    setBusy(true)
    try {
      const { user: loggedInUser } = await passwordResetComplete(token, password)
      navigate(postAuthDestination(loggedInUser))
    } catch (err) {
      const code = err.response?.data?.error
      const details = err.response?.data?.details
      if (Array.isArray(details) && details.length) {
        setError(details.map((d) => d.message).join(' '))
        return
      }
      const msg =
        code === 'invalid_or_expired_token'
          ? t('passwordResetComplete.errToken')
          : t('passwordResetComplete.errGeneric')
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p className="muted">{t('passwordResetComplete.loading')}</p>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-top-row">
          <div className="brand-block">
            <span className="brand-akoenet">AkoeNet</span>
            <span className="brand-sub">{t('common.community')}</span>
          </div>
          <LanguageSwitcher />
        </div>
        <p className="muted small" style={{ marginBottom: '0.75rem' }}>
          <Link to="/login">{t('passwordResetComplete.backSignIn')}</Link>
        </p>
        <h1>{t('passwordResetComplete.title')}</h1>
        <p className="muted">
          {emailMasked
            ? t('passwordResetComplete.leadMasked', { email: emailMasked })
            : t('passwordResetComplete.leadDefault')}
        </p>
        {pendingLoading && <p className="muted">{t('passwordResetComplete.checkingLink')}</p>}
        {loadError && <div className="error-banner">{loadError}</div>}
        {loadError && (
          <p className="muted small">
            <Link to="/login/forgot">{t('passwordResetComplete.backForgot')}</Link>
          </p>
        )}
        {!pendingLoading && !loadError && (
          <form onSubmit={onSubmit} className="form-stack">
            {error && <div className="error-banner">{error}</div>}
            <PasswordField
              id="password-reset-new"
              name="password"
              label={t('passwordResetComplete.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <PasswordField
              id="password-reset-confirm"
              name="password_confirm"
              label={t('passwordResetComplete.passwordConfirm')}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
            <button type="submit" className="btn primary" disabled={busy}>
              {busy ? t('passwordResetComplete.saving') : t('passwordResetComplete.savePassword')}
            </button>
          </form>
        )}
        <AuthLegalStrip />
      </div>
    </div>
  )
}
