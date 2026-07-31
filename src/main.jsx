import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import './i18n.js'
import '@dakinis/shared-foundation/tokens.css'
import '@dakinis/shared-theme/tokens.css'
import './index.css'
import { applyTheme, loadTheme } from './lib/themePreferences.js'
import { applyDesTheme } from '@dakinis/shared-theme/themes'
import { isTauri } from './lib/isTauri.js'
import { consumeTauriDeepLinksOnBootstrap } from './services/desktop-integrations.js'
import { runDesktopUpdateCheck } from './lib/desktopUpdates.js'
import { reportError } from './lib/reportError.js'
import App from './App.jsx'
import { akoenetInitSentryBrowser, Sentry } from './lib/sentry.js'
import { AuthProvider } from './context/AuthContext.jsx'
import { LandingLocaleProvider } from './context/LandingLocaleProvider.jsx'
import {
  hydrateSessionFromNativeStorage,
  setAccessToken,
  setRefreshToken,
} from './services/session-store.js'
import { AKOENET_LS_TWITCH_OAUTH_ERROR } from './lib/storageKeys.js'

const AppRouter = __SPA_HASH_ROUTER__ ? HashRouter : BrowserRouter

/** Runs before React so /?twitch_token= or /#/?twitch_token= (HashRouter) works on static hosts. */
function consumeTwitchOAuthFromUrl() {
  try {
    let params = new URLSearchParams(window.location.search)
    let token = params.get('twitch_token')
    let err = params.get('twitch_error')
    if (!token && !err && window.location.hash?.includes('?')) {
      const qi = window.location.hash.indexOf('?')
      const inHash = new URLSearchParams(window.location.hash.slice(qi + 1))
      token = inHash.get('twitch_token')
      err = inHash.get('twitch_error')
      if (token || err) params = inHash
    }
    if (!token && !err) return
    if (token) setAccessToken(token)
    const refresh = params.get('refresh_token')
    if (refresh) setRefreshToken(refresh)
    if (err) {
      const detail = params.get('twitch_detail')
      sessionStorage.setItem(
        AKOENET_LS_TWITCH_OAUTH_ERROR,
        detail ? `${err}:${detail}` : err
      )
    }
    const path = err ? '/login' : window.location.pathname || '/'
    const cleanHash =
      window.location.hash?.includes('?') && (token || err)
        ? window.location.hash.replace(/\?.*$/, '') || '#/'
        : window.location.hash || ''
    window.history.replaceState({}, '', path + cleanHash)
  } catch {
    /* ignore */
  }
}

/** Apply saved UI theme before React paints (reduces flash; accent syncs after /auth/me). */
function bootstrapThemeEarly() {
  try {
    applyDesTheme({ product: 'akoenet', theme: 'dark' })
    const uid = localStorage.getItem('akoenet_ui_theme_active_uid')
    applyTheme(loadTheme(uid || undefined), { accentColor: null })
  } catch {
    /* ignore */
  }
}
async function bootstrapSessionEarly() {
  await hydrateSessionFromNativeStorage()
  if (isTauri()) await consumeTauriDeepLinksOnBootstrap()
  consumeTwitchOAuthFromUrl()
}

if (isTauri() && import.meta.env.DEV) {
  import('@tauri-apps/plugin-log')
    .then(({ attachConsole }) => attachConsole())
    .catch((err) => reportError('tauri.attachConsole', err))
}

void runDesktopUpdateCheck()

/** PWA: manifest + minimal SW so Chrome/Edge can offer install (HTTPS or localhost). */
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const base = import.meta.env.BASE_URL || '/'
    const swPath = `${base.replace(/\/?$/, '/') }sw.js`.replace(/([^:]\/)\/+/g, '$1')
    navigator.serviceWorker.register(swPath).catch((err) => reportError('sw.register', err))
  })
}

function ChunkLoadFallback({ error, resetError }) {
  const msg = String(error?.message || error || '')
  const isChunk =
    /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\d]+ failed/i.test(
      msg
    )

  useEffect(() => {
    if (!isChunk) return
    const key = 'akoenet_chunk_reload'
    const last = Number(sessionStorage.getItem(key) || 0)
    if (Date.now() - last < 15_000) return
    sessionStorage.setItem(key, String(Date.now()))
    window.location.reload()
  }, [isChunk])

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui,sans-serif' }}>
      <h1>Error inesperado</h1>
      <p>
        {isChunk
          ? 'Hay una versión nueva de la app. Recargando…'
          : 'Recarga la página. Si persiste, contacta soporte.'}
      </p>
      {!isChunk ? (
        <button type="button" className="dakinis-btn dakinis-btn--primary dakinis-btn--md" onClick={resetError}>
          Reintentar
        </button>
      ) : null}
    </div>
  )
}

function mountReactApp() {
  akoenetInitSentryBrowser()
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Sentry.ErrorBoundary fallback={ChunkLoadFallback}>
        <AppRouter>
          <LandingLocaleProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </LandingLocaleProvider>
        </AppRouter>
      </Sentry.ErrorBoundary>
    </StrictMode>
  )
}

void bootstrapSessionEarly()
  .catch((err) => reportError('bootstrapSessionEarly', err))
  .finally(() => {
    bootstrapThemeEarly()
    mountReactApp()
  })
