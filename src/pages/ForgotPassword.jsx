import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLegalStrip from '../components/AuthLegalStrip'
import LanguageSwitcher from '../components/LanguageSwitcher'

export default function ForgotPassword() {
  const { t } = useTranslation()
  const { passwordResetStart, user, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [devLink, setDevLink] = useState(null)

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [loading, user, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    setDevLink(null)
    try {
      const { data } = await passwordResetStart(email)
      if (data?.dev_reset_url) {
        setDevLink(data.dev_reset_url)
      }
      setSent(true)
    } catch (err) {
      const code = err.response?.data?.error
      const msg =
        code === 'email_not_configured' || code === 'email_send_failed'
          ? t('forgotPassword.errorEmail')
          : t('forgotPassword.errorStart')
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p className="muted">{t('forgotPassword.loading')}</p>
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
          <Link to="/login">{t('forgotPassword.backSignIn')}</Link>
        </p>
        <h1>{t('forgotPassword.title')}</h1>
        {!sent ? (
          <>
            <p className="muted">{t('forgotPassword.lead')}</p>
            <form onSubmit={onSubmit} className="form-stack">
              {error && <div className="error-banner">{error}</div>}
              <label>
                {t('forgotPassword.email')}
                <input
                  id="forgot-password-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
              <button type="submit" className="btn primary" disabled={busy}>
                {busy ? t('forgotPassword.sending') : t('forgotPassword.sendLink')}
              </button>
            </form>
          </>
        ) : (
          <div className="form-stack">
            <p className="muted">{t('forgotPassword.sentHint')}</p>
            {devLink && (
              <p className="muted small">
                {t('forgotPassword.devLabel')}{' '}
                <a href={devLink}>{t('forgotPassword.devOpenLink')}</a>
              </p>
            )}
            <p className="muted small">
              <Link to="/login">{t('forgotPassword.backSignIn')}</Link>
            </p>
          </div>
        )}
        <AuthLegalStrip />
      </div>
    </div>
  )
}
