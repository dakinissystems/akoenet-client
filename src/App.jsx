import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './context/AuthContext'
import CookieConsentBanner from './components/CookieConsentBanner'
import ThemeSync from './components/ThemeSync'
import LegalTermsGate from './components/LegalTermsGate'
import { useEffect } from 'react'
import api from './services/api'
import Home from './pages/Home'
import Login from './pages/Login'
import HubSsoPage from './pages/HubSsoPage'
import Register from './pages/Register'
import DashboardAdmin from './pages/DashboardAdmin'
import InvitePage from './pages/InvitePage'
import { initMobileIntegrations } from './services/mobile-integrations'
import { initDesktopIntegrations } from './services/desktop-integrations'
import { isTauri } from './lib/isTauri'
import { reportError } from './lib/reportError'
import { getAccessToken } from './services/session-store'
import WorkspaceProviders from './workspace/WorkspaceProviders.jsx'
import { buildWorkspaceAddonRoutes } from './workspace/AddonRoutes.jsx'
import { GlobalMediaMiniPlayer } from './modules/media-player/components/GlobalMediaMiniPlayer.jsx'

const pushTokenInFlight = new Set()
const pushTokenSent = new Set()
const pushTokenRetryAfter = new Map()

const RegisterComplete = lazy(() => import('./pages/RegisterComplete'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const PasswordResetComplete = lazy(() => import('./pages/PasswordResetComplete'))
const Messages = lazy(() => import('./pages/Messages'))
const ServerView = lazy(() => import('./pages/ServerView'))
const TwitchCallback = lazy(() => import('./pages/TwitchCallback'))
const LegalDocPage = lazy(() => import('./pages/LegalDocPage'))
const DmcaPage = lazy(() => import('./pages/DmcaPage'))
const DpoPage = lazy(() => import('./pages/DpoPage'))
const SystemStatus = lazy(() => import('./pages/SystemStatus'))
const WorkspaceDesktop = lazy(() => import('./pages/WorkspaceDesktop.jsx'))
const WorkspaceAddonPage = lazy(() => import('./pages/WorkspaceAddonPage.jsx'))
const DevSentryErrorButton = lazy(() => import('./components/DevSentryErrorButton.jsx'))

function PageFallback() {
  const { t } = useTranslation()
  return (
    <div className="auth-page">
      <p className="muted">{t('app.loadingAkoeNet')}</p>
    </div>
  )
}

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children
 * @param {boolean} [props.requireAdmin]
 */
function AuthGateRoute({ children, requireAdmin = false }) {
  const { t } = useTranslation()
  const { user, loading, serverUnreachable, refreshUser } = useAuth()

  if (loading) {
    return (
      <div className="auth-page">
        <p className="muted">{t('app.loadingAkoeNet')}</p>
      </div>
    )
  }

  if (!user && serverUnreachable) {
    return (
      <div className="auth-page">
        <div className="auth-card api-offline-card">
          <h1 className="api-offline-title">{t('app.apiOfflineTitle')}</h1>
          {requireAdmin ? (
            <p className="muted api-offline-copy">{t('app.apiOfflineBodyAdmin')}</p>
          ) : (
            <>
              <p className="muted api-offline-copy">{t('app.apiOfflineBodyMember1')}</p>
              <p className="muted api-offline-copy">{t('app.apiOfflineBodyMember2')}</p>
            </>
          )}
          <button type="button" className="btn primary api-offline-retry" onClick={() => refreshUser()}>
            {t('app.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.needs_terms_acceptance) return <LegalTermsGate />
  if (requireAdmin && !user.is_admin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  useEffect(() => {
    let cleanup = null
    const run = isTauri()
      ? initDesktopIntegrations({ navigate, loginWithToken })
      : initMobileIntegrations((to) => navigate(to))
    run
      .then((fn) => {
        cleanup = fn
      })
      .catch((err) => {
        reportError(isTauri() ? 'desktopIntegrations.init' : 'mobileIntegrations.init', err)
      })
    return () => {
      try {
        cleanup?.()
      } catch (err) {
        reportError(isTauri() ? 'desktopIntegrations.cleanup' : 'mobileIntegrations.cleanup', err)
      }
    }
  }, [navigate, loginWithToken])

  useEffect(() => {
    const onMobilePushToken = (event) => {
      const accessToken = String(getAccessToken() || '').trim()
      if (!accessToken) return
      const token = String(event?.detail?.token || '').trim()
      const platform = String(event?.detail?.platform || '').trim().toLowerCase()
      const device_id = String(event?.detail?.device_id || '').trim()
      const app_version = String(event?.detail?.app_version || '').trim()
      if (!token || (platform !== 'android' && platform !== 'ios')) return
      const key = `${platform}:${token}`
      const now = Date.now()
      const retryAfter = Number(pushTokenRetryAfter.get(key) || 0)
      if (pushTokenSent.has(key) || pushTokenInFlight.has(key) || now < retryAfter) return
      pushTokenInFlight.add(key)
      api
        .post('/auth/push/native/subscribe', {
          token,
          platform,
          device_id: device_id || undefined,
          app_version: app_version || undefined,
          device_name: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        })
        .then(() => {
          pushTokenSent.add(key)
          pushTokenRetryAfter.delete(key)
        })
        .catch((err) => {
          const status = Number(err?.response?.status || 0)
          if (status >= 500) {
            // Backend temporalmente inestable: evita spam del mismo token durante 5 minutos.
            pushTokenRetryAfter.set(key, Date.now() + 5 * 60 * 1000)
          }
          const origin = typeof window !== 'undefined' ? window.location.origin : 'unknown'
          console.error('[push.native.subscribe] request failed', {
            endpoint: `${api.defaults?.baseURL || ''}/auth/push/native/subscribe`,
            origin,
            platform,
            hasToken: Boolean(token),
            message: err?.message || 'unknown_error',
            status: status || null,
            response: err?.response?.data || null,
          })
          reportError('push.native.subscribe', err)
        })
        .finally(() => {
          pushTokenInFlight.delete(key)
        })
    }
    window.addEventListener('akoenet:mobile-push-token', onMobilePushToken)
    return () => {
      window.removeEventListener('akoenet:mobile-push-token', onMobilePushToken)
    }
  }, [])

  return (
    <WorkspaceProviders>
      <ThemeSync />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/hub-sso" element={<HubSsoPage />} />
          <Route path="/login/forgot" element={<ForgotPassword />} />
          <Route path="/login/reset" element={<PasswordResetComplete />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/complete" element={<RegisterComplete />} />
          <Route path="/auth/twitch/callback" element={<TwitchCallback />} />
          <Route path="/legal/dmca" element={<DmcaPage />} />
          <Route path="/legal/dpo" element={<DpoPage />} />
          <Route path="/legal/privacidad-solicitudes" element={<Navigate to="/legal/dpo" replace />} />
          <Route path="/legal/privacy-requests" element={<Navigate to="/legal/dpo" replace />} />
          <Route path="/legal/:slug" element={<LegalDocPage />} />
          <Route path="/invite/:token" element={<InvitePage />} />
          <Route path="/status" element={<SystemStatus />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/messages"
            element={
              <AuthGateRoute>
                <Messages />
              </AuthGateRoute>
            }
          />
          <Route
            path="/server/:serverId"
            element={
              <AuthGateRoute>
                <ServerView />
              </AuthGateRoute>
            }
          />
          <Route
            path="/workspace"
            element={
              <AuthGateRoute>
                <WorkspaceDesktop />
              </AuthGateRoute>
            }
          />
          <Route
            path="/workspace/:addonId"
            element={
              <AuthGateRoute>
                <WorkspaceAddonPage />
              </AuthGateRoute>
            }
          />
          {buildWorkspaceAddonRoutes(AuthGateRoute)}
          <Route
            path="/admin"
            element={
              <AuthGateRoute requireAdmin>
                <DashboardAdmin />
              </AuthGateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <GlobalMediaMiniPlayer />
      <CookieConsentBanner />
      <Suspense fallback={null}>
        <DevSentryErrorButton />
      </Suspense>
    </WorkspaceProviders>
  )
}
