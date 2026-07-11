import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiBaseUrl } from '../lib/apiBase'
import api from '../services/api'
import { inviteLandingPath, INVITE_QUERY_PARAM } from '../lib/invites'
import { postAuthDestination } from '../lib/postAuthDestination'
import AuthLegalStrip from '../components/AuthLegalStrip'
import LanguageSwitcher from '../components/LanguageSwitcher'
import LoginCredentialsForm, { LoginTwoFactorForm } from '../components/LoginFormFields'
import { consumeSessionNotice, PENDING_INVITE_KEY, readPendingInviteFromSession } from '../components/loginConstants'
import { AKOENET_LS_TWITCH_OAUTH_ERROR } from '../lib/storageKeys'
import { clearPlatformTokenFromUrl, readPlatformTokenFromLocation } from '../lib/platformAuth'
import { exchangePlatformToken } from '../services/idp-auth'
import { storeLoginTokens } from '../lib/authSession'
import { useExternalPoll } from '../hooks/useExternalPoll'

export default function Login() {
  const { login, completeLogin2fa, user, loading } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(consumeSessionNotice)
  const [busy, setBusy] = useState(false)
  const [twoFactorToken, setTwoFactorToken] = useState(null)
  const [code2fa, setCode2fa] = useState('')
  const [twitchStatusRetryToken, setTwitchStatusRetryToken] = useState(0)
  const apiBase = getApiBaseUrl()
  const twitchStatusFetcher = useMemo(
    () => async () => {
      const ac = new AbortController()
      const timer = setTimeout(() => ac.abort(), 8000)
      try {
        const res = await fetch(`${apiBase}/auth/twitch/status`, { signal: ac.signal })
        clearTimeout(timer)
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data = await res.json()
        const ru = data?.redirectUri != null ? String(data.redirectUri).trim() : ''
        return {
          gate: data?.configured ? 'ready' : 'disabled',
          redirectUri: ru || null,
        }
      } catch (err) {
        clearTimeout(timer)
        console.error('[login:twitch-status] unreachable', {
          apiBase,
          endpoint: `${apiBase}/auth/twitch/status`,
          message: err?.message || 'unknown_error',
        })
        throw err
      }
    },
    [apiBase]
  )
  const twitchStatusPoll = useExternalPoll(
    `login-twitch-status:${apiBase}:${twitchStatusRetryToken}`,
    twitchStatusFetcher,
    0
  )
  const twitchGate =
    twitchStatusPoll.status === 'idle' || twitchStatusPoll.status === 'loading'
      ? 'loading'
      : twitchStatusPoll.status === 'error'
        ? 'unreachable'
        : twitchStatusPoll.data?.gate ?? 'disabled'
  const twitchOAuthRedirectUri =
    twitchStatusPoll.status === 'ready' ? twitchStatusPoll.data?.redirectUri ?? null : null

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [loading, user, navigate])

  useEffect(() => {
    const code = sessionStorage.getItem(AKOENET_LS_TWITCH_OAUTH_ERROR)
    if (!code) return
    sessionStorage.removeItem(AKOENET_LS_TWITCH_OAUTH_ERROR)
    setError(t('login.twitchSignInFailed', { code }))
  }, [t])

  useEffect(() => {
    const platformToken = readPlatformTokenFromLocation()
    if (!platformToken || loading || user) return
    setBusy(true)
    void exchangePlatformToken(api, platformToken)
      .then((data) => {
        storeLoginTokens(data)
        clearPlatformTokenFromUrl()
        window.location.reload()
      })
      .catch(() => {
        clearPlatformTokenFromUrl()
        setError(t('login.googleSignInFailed', { defaultValue: 'Google sign-in failed. Try again or use email.' }))
      })
      .finally(() => setBusy(false))
  }, [loading, user, t])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      let loggedInUser
      if (twoFactorToken) {
        loggedInUser = await completeLogin2fa(twoFactorToken, code2fa.trim())
        setTwoFactorToken(null)
        setCode2fa('')
      } else {
        const result = await login(email, password)
        if (result?.requires2fa) {
          setTwoFactorToken(result.twoFactorToken)
          setBusy(false)
          return
        }
        loggedInUser = result.user
      }
      const inv =
        searchParams.get(INVITE_QUERY_PARAM) ||
        (() => {
          try {
            return sessionStorage.getItem(PENDING_INVITE_KEY)
          } catch {
            return null
          }
        })()
      if (inv) {
        try {
          sessionStorage.removeItem(PENDING_INVITE_KEY)
        } catch {
          /* ignore */
        }
        try {
          const { data } = await api.post(`/servers/invite/${encodeURIComponent(inv)}/join`)
          if (data?.server_id != null) {
            navigate(`/server/${data.server_id}`, { replace: true })
            return
          }
        } catch {
          navigate(inviteLandingPath(inv), { replace: true })
          return
        }
      }
      navigate(postAuthDestination(loggedInUser))
    } catch (err) {
      if (twoFactorToken) {
        setError(t('login.invalidCode'))
      } else if (!err?.response) {
        setError(t('login.cannotReachApi', { url: getApiBaseUrl() }))
      } else if (err.response.status === 401) {
        setError(t('login.invalidCredentials'))
      } else {
        setError(String(err.response?.data?.error || err.response?.data?.message || t('login.signInFailed')))
      }
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p className="muted">{t('common.loading')}</p>
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
          <Link to="/">← {t('login.home')}</Link>
        </p>
        <h1>{twoFactorToken ? t('login.twoFactorTitle') : t('login.title')}</h1>
        <p className="muted">
          {searchParams.get(INVITE_QUERY_PARAM) || readPendingInviteFromSession()
            ? t('login.leadInvite')
            : t('login.leadDefault')}
        </p>
        <form onSubmit={onSubmit} className="form-stack">
          {twoFactorToken ? (
            <LoginTwoFactorForm
              code2fa={code2fa}
              setCode2fa={setCode2fa}
              busy={busy}
              error={error}
              onBack={() => {
                setTwoFactorToken(null)
                setCode2fa('')
                setError('')
              }}
              t={t}
            />
          ) : (
            <LoginCredentialsForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              busy={busy}
              notice={notice}
              error={error}
              searchParams={searchParams}
              twitchGate={twitchGate}
              twitchOAuthRedirectUri={twitchOAuthRedirectUri}
              apiBase={apiBase}
              setTwitchStatusRetryToken={setTwitchStatusRetryToken}
              t={t}
            />
          )}
        </form>
        {!twoFactorToken && (
          <p className="muted small">
            {t('login.noAccount')}{' '}
            <Link
              to={
                searchParams.get(INVITE_QUERY_PARAM)
                  ? `/register?${INVITE_QUERY_PARAM}=${encodeURIComponent(searchParams.get(INVITE_QUERY_PARAM))}`
                  : '/register'
              }
            >
              {t('login.signUp')}
            </Link>
          </p>
        )}
        <AuthLegalStrip />
      </div>
    </div>
  )
}
