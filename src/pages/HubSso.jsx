import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  exchangePlatformToken,
  getIdpRefreshToken,
  isIdpAuthEnabled,
  refreshIdpToken,
  setIdpRefreshToken,
} from '../services/idp-auth'
import { postAuthDestination } from '../lib/postAuthDestination'

const HASH_TOKEN_KEY = 'platform_token'

function dakinisReadHashToken() {
  if (typeof window === 'undefined') return ''
  const raw = window.location.hash.replace(/^#/, '')
  const params = new URLSearchParams(raw)
  const token = params.get(HASH_TOKEN_KEY) || ''
  try {
    return decodeURIComponent(token)
  } catch {
    return token
  }
}

function dakinisClearHashToken() {
  if (typeof window === 'undefined') return
  const { pathname, search } = window.location
  window.history.replaceState(null, '', `${pathname}${search}`)
}

async function dakinisExchangeAndStore(platformToken) {
  const data = await exchangePlatformToken(api, platformToken)
  return data
}

export default function HubSso() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading, loginWithToken } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    if (loading) return
    if (user) {
      navigate(postAuthDestination(searchParams) || '/', { replace: true })
      return
    }

    let cancelled = false

    async function finishWithPlatformToken(platformToken) {
      const data = await dakinisExchangeAndStore(platformToken)
      if (cancelled) return
      await loginWithToken(data.token, data.refresh_token)
      dakinisClearHashToken()
      navigate(postAuthDestination(searchParams) || '/', { replace: true })
    }

    async function run() {
      if (!isIdpAuthEnabled()) {
        setError(t('hubSso.idpDisabled'))
        return
      }

      const hashToken = dakinisReadHashToken()
      if (hashToken) {
        try {
          await finishWithPlatformToken(hashToken)
        } catch (err) {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : t('hubSso.exchangeFailed'))
          }
        }
        return
      }

      const idpRt = getIdpRefreshToken()
      if (idpRt) {
        try {
          const refreshed = await refreshIdpToken(idpRt)
          if (refreshed.refreshToken) setIdpRefreshToken(refreshed.refreshToken)
          await finishWithPlatformToken(refreshed.token)
          return
        } catch {
          /* login manual */
        }
      }

      const loginQs = new URLSearchParams()
      const emailHint = searchParams.get('email')
      const returnUrl = searchParams.get('return_url')
      if (emailHint) loginQs.set('email', emailHint)
      if (returnUrl) loginQs.set('return_url', returnUrl)
      loginQs.set('from', 'dakinis-hub')
      navigate(`/login?${loginQs.toString()}`, { replace: true })
    }

    run()
    return () => {
      cancelled = true
    }
  }, [loading, user, navigate, searchParams, loginWithToken, t])

  return (
    <div className="auth-page">
      <p className="muted">{error || t('hubSso.working')}</p>
      {error ? (
        <button type="button" className="btn primary" onClick={() => navigate('/login')}>
          {t('hubSso.goLogin')}
        </button>
      ) : null}
    </div>
  )
}
