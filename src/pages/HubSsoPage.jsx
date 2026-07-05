import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { exchangePlatformToken } from '../services/idp-auth'

const HASH_TOKEN_KEY = 'platform_token'

function readPlatformToken() {
  const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''
  if (!hash) return ''
  return new URLSearchParams(hash).get(HASH_TOKEN_KEY) || ''
}

function safeReturnPath(raw) {
  const path = String(raw || '').trim()
  if (!path.startsWith('/') || path.startsWith('//')) return '/'
  if (path.startsWith('/auth/hub-sso')) return '/'
  return path
}

export default function HubSsoPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loginWithToken } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    const platformToken = readPlatformToken()
    if (!platformToken) {
      setError(t('app.hubSsoMissingToken'))
      return undefined
    }

    const returnPath = safeReturnPath(searchParams.get('return_url'))

    ;(async () => {
      try {
        const data = await exchangePlatformToken(api, platformToken)
        await loginWithToken(data.token, data.refresh_token)
        if (typeof window !== 'undefined' && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
        navigate(returnPath, { replace: true })
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          (err instanceof Error ? err.message : null) ||
          t('app.hubSsoFailed')
        setError(String(msg))
      }
    })()

    return undefined
  }, [loginWithToken, navigate, searchParams, t])

  return (
    <div className="auth-page">
      <div className="auth-card">
        {error ? (
          <>
            <p className="error-text">{error}</p>
            <button type="button" className="btn primary" onClick={() => navigate('/login', { replace: true })}>
              {t('login.title')}
            </button>
          </>
        ) : (
          <p className="muted">{t('app.hubSsoLoading')}</p>
        )}
      </div>
    </div>
  )
}
