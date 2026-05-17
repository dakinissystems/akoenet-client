import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { postAuthDestination } from '../lib/postAuthDestination'
import { isTauri } from '../lib/isTauri'
import { getAccessToken, getRefreshToken } from '../services/session-store'
import { completeDesktopTwitchOAuth } from '../services/desktop-integrations'

/** @typedef {'connecting' | 'oauth' | 'notoken' | 'fail' | 'timeout'} TwitchCbPhase */

const OAUTH_WAIT_MS = 30_000

export default function TwitchCallback() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [phase, setPhase] = useState(/** @type {TwitchCbPhase} */ ('connecting'))
  const [oauthCode, setOauthCode] = useState('')

  useEffect(() => {
    if (isTauri()) {
      const token = params.get('token') || getAccessToken()
      const refresh = params.get('refresh_token') || getRefreshToken()
      const error = params.get('error')
      void completeDesktopTwitchOAuth(
        { token, refresh, error },
        { navigate, loginWithToken }
      )
      return undefined
    }

    const token = params.get('token') || getAccessToken()
    const refresh = params.get('refresh_token') || getRefreshToken()
    const error = params.get('error')

    if (error) {
      setOauthCode(error)
      setPhase('oauth')
      return undefined
    }
    if (!token) {
      setPhase('notoken')
      return undefined
    }

    let cancelled = false
    const timer = setTimeout(() => {
      if (!cancelled) setPhase('timeout')
    }, OAUTH_WAIT_MS)

    ;(async () => {
      try {
        const me = await loginWithToken(token, refresh)
        if (cancelled) return
        navigate(postAuthDestination(me), { replace: true })
      } catch {
        if (!cancelled) setPhase('fail')
      }
    })()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [params, loginWithToken, navigate])

  const statusLine =
    phase === 'oauth'
      ? t('twitchCallback.errPrefix', { code: oauthCode })
      : phase === 'notoken'
        ? t('twitchCallback.noToken')
        : phase === 'fail' || phase === 'timeout'
          ? t('twitchCallback.failed')
          : t('twitchCallback.connecting')

  const showBack = phase === 'fail' || phase === 'timeout' || phase === 'notoken'

  return (
    <div className="auth-page">
      <OAuthStatusCard title={t('twitchCallback.title')} statusLine={statusLine} showBack={showBack} navigate={navigate} t={t} />
    </div>
  )
}

function OAuthStatusCard({ title, statusLine, showBack, navigate, t }) {
  return (
    <div className="auth-card">
      <h1>{title}</h1>
      <p className="muted">{statusLine}</p>
      {showBack && (
        <button
          type="button"
          className="btn secondary"
          style={{ marginTop: '1rem' }}
          onClick={() => navigate('/login', { replace: true })}
        >
          {t('login.backToSignIn', { defaultValue: 'Volver al inicio de sesión' })}
        </button>
      )}
    </div>
  )
}
