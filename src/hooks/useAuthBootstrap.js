import { useCallback, useEffect, useState } from 'react'
import api, { refreshSessionAfterForeground, startSessionKeepAlive, stopSessionKeepAlive } from '../services/api'
import { disconnectAkoeNet } from '../services/socket'
import { addNativeAppStateListener } from '../lib/mobile-runtime'
import {
  clearSessionTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../services/session-store'
import {
  exchangePlatformToken,
  getIdpAuthUrl,
  getIdpRefreshToken,
  isIdpAuthEnabled,
  loginViaIdp,
  setIdpRefreshToken,
} from '../services/idp-auth'
import { dakinisPerformClientLogout, dakinisRevokeIdpRefreshToken } from '../lib/dakinis-client-logout.js'
import { reportError } from '../lib/reportError'
import {
  applyAuthenticatedSession,
  clearIdpRefreshToken,
  disconnectLiveSession,
  isTransientServerError,
  isUnreachableApiError,
  storeLoginTokens,
  writeSessionExpiredNotice,
} from '../lib/authSession'

export function useAuthBootstrap() {
  const [session, setSession] = useState({ user: null, loading: true, serverUnreachable: false })
  const { user, loading, serverUnreachable } = session

  const setUser = useCallback((value) => {
    setSession((s) => ({
      ...s,
      user: typeof value === 'function' ? value(s.user) : value,
    }))
  }, [])

  const setLoading = useCallback((value) => {
    setSession((s) => ({
      ...s,
      loading: typeof value === 'function' ? value(s.loading) : value,
    }))
  }, [])

  const setServerUnreachable = useCallback((value) => {
    setSession((s) => ({
      ...s,
      serverUnreachable: typeof value === 'function' ? value(s.serverUnreachable) : value,
    }))
  }, [])

  const clearLocalSession = useCallback(() => {
    clearSessionTokens()
    clearIdpRefreshToken()
    stopSessionKeepAlive()
    disconnectAkoeNet()
    setUser(null)
    setServerUnreachable(false)
  }, [setUser, setServerUnreachable])
  const refreshUser = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setRefreshToken(null)
      setUser(null)
      setServerUnreachable(false)
      setLoading(false)
      return
    }
    setServerUnreachable(false)
    setLoading(true)

    const delays = [0, 900, 1800]

    async function fetchMeWithRetry(attemptIndex) {
      if (delays[attemptIndex] > 0) {
        await new Promise((r) => setTimeout(r, delays[attemptIndex]))
      }
      try {
        return await api.get('/auth/me')
      } catch (err) {
        if (isUnreachableApiError(err) && attemptIndex < delays.length - 1) {
          return fetchMeWithRetry(attemptIndex + 1)
        }
        throw err
      }
    }

    let lastErr = null
    try {
      const { data } = await fetchMeWithRetry(0)
      setUser(data)
      if (data.needs_terms_acceptance) {
        disconnectLiveSession()
      } else {
        applyAuthenticatedSession(data, getAccessToken() || token)
      }
      setServerUnreachable(false)
      setLoading(false)
      return
    } catch (err) {
      lastErr = err
      if (isUnreachableApiError(err)) {
        disconnectLiveSession()
        setUser(null)
        setServerUnreachable(true)
        setLoading(false)
        return
      }
    }

    if (!lastErr) {
      setLoading(false)
      return
    }

    if (isTransientServerError(lastErr)) {
      disconnectLiveSession()
      setUser(null)
      setServerUnreachable(true)
      setLoading(false)
      return
    }

    if (lastErr.response?.data?.error === 'Token expired, please login again') {
      writeSessionExpiredNotice()
    }
    clearSessionTokens()
    disconnectLiveSession()
    setUser(null)
    setServerUnreachable(false)
    setLoading(false)
  }, [setLoading, setServerUnreachable, setUser])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  useEffect(() => {
    const onSessionLost = () => {
      disconnectAkoeNet()
      setSession((s) => ({ ...s, user: null, loading: false, serverUnreachable: false }))
    }
    window.addEventListener('akoenet:session-lost', onSessionLost)
    return () => window.removeEventListener('akoenet:session-lost', onSessionLost)
  }, [])

  useEffect(() => {
    const onTerms = () => {
      refreshUser()
    }
    window.addEventListener('akoenet:terms-required', onTerms)
    return () => window.removeEventListener('akoenet:terms-required', onTerms)
  }, [refreshUser])

  useEffect(() => {
    if (!user) return undefined
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        refreshSessionAfterForeground()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [user])

  useEffect(() => {
    if (!user) return undefined
    let removeListener = null
    addNativeAppStateListener(() => {
      refreshSessionAfterForeground()
    })
      .then((cleanup) => {
        removeListener = cleanup
      })
      .catch((err) => reportError('auth.nativeAppStateListener', err))
    return () => {
      try {
        removeListener?.()
      } catch (err) {
        reportError('auth.nativeAppStateListener.cleanup', err)
      }
    }
  }, [user])

  const logout = useCallback(async () => {
    const rt = getRefreshToken()
    const idpRt = getIdpRefreshToken()
    await dakinisPerformClientLogout({
      revokeServer: [
        async () => {
          if (!rt) return
          try {
            await api.post('/auth/logout', { refresh_token: rt })
          } catch (err) {
            reportError('auth.logout', err)
          }
        },
        async () => {
          await dakinisRevokeIdpRefreshToken({
            authBaseUrl: getIdpAuthUrl(),
            refreshToken: idpRt,
          })
        },
      ],
      clearLocalSession,
    })
  }, [clearLocalSession])

  const logoutAllDevices = useCallback(async () => {
    const idpRt = getIdpRefreshToken()
    await dakinisPerformClientLogout({
      revokeServer: [
        async () => {
          try {
            await api.post('/auth/logout-all')
          } catch (err) {
            reportError('auth.logoutAllDevices', err)
          }
        },
        async () => {
          await dakinisRevokeIdpRefreshToken({
            authBaseUrl: getIdpAuthUrl(),
            refreshToken: idpRt,
          })
        },
      ],
      clearLocalSession,
    })
  }, [clearLocalSession])

  const login = useCallback(async (email, password) => {
    if (isIdpAuthEnabled()) {
      const idp = await loginViaIdp(email, password)
      if (idp.refreshToken) setIdpRefreshToken(idp.refreshToken)
      const data = await exchangePlatformToken(api, idp.token)
      storeLoginTokens(data)
      setUser(data.user)
      setServerUnreachable(false)
      applyAuthenticatedSession(data.user, data.token)
      return { user: data.user, requires2fa: false }
    }

    const { data } = await api.post('/auth/login', { email, password })
    if (data.requires_2fa && data.two_factor_token) {
      return { requires2fa: true, twoFactorToken: data.two_factor_token }
    }
    storeLoginTokens(data)
    setUser(data.user)
    setServerUnreachable(false)
    applyAuthenticatedSession(data.user, data.token)
    return { user: data.user, requires2fa: false }
  }, [setServerUnreachable, setUser])

  const completeLogin2fa = useCallback(async (twoFactorToken, code) => {
    const { data } = await api.post('/auth/login/2fa', {
      two_factor_token: twoFactorToken,
      code,
    })
    storeLoginTokens(data)
    setUser(data.user)
    setServerUnreachable(false)
    applyAuthenticatedSession(data.user, data.token)
    return data.user
  }, [setServerUnreachable, setUser])

  const loginWithToken = useCallback(async (token, refreshToken) => {
    setAccessToken(token)
    if (refreshToken) setRefreshToken(refreshToken)
    const { data } = await api.get('/auth/me')
    setUser(data)
    applyAuthenticatedSession(data, token)
    return data
  }, [setUser])

  const acceptTerms = useCallback(async () => {
    const { data: ver } = await api.get('/auth/terms/version')
    const { data } = await api.post('/auth/terms/accept', { version: ver.current_terms_version })
    setUser(data.user)
    const t = getAccessToken()
    if (t && data.user && !data.user.needs_terms_acceptance) {
      applyAuthenticatedSession(data.user, t)
    }
    return data.user
  }, [setUser])

  const registerStart = useCallback(async (email, invite) => {
    const body = { email }
    if (invite) body.invite = invite
    const { data } = await api.post('/auth/register/start', body)
    return { data }
  }, [])

  const registerComplete = useCallback(
    async (token, username, password, birth_date) => {
      const { data: ver } = await api.get('/auth/terms/version')
      const { data } = await api.post('/auth/register/complete', {
        token,
        username,
        password,
        birth_date,
        accept_terms_version: ver.current_terms_version,
      })
      return login(data.email, password)
    },
    [login]
  )

  const passwordResetStart = useCallback(async (email) => {
    const { data } = await api.post('/auth/password-reset/start', { email })
    return { data }
  }, [])

  const passwordResetComplete = useCallback(
    async (token, password) => {
      const { data } = await api.post('/auth/password-reset/complete', { token, password })
      return login(data.email, password)
    },
    [login]
  )

  return {
    user,
    loading,
    serverUnreachable,
    setUser,
    clearLocalSession,
    refreshUser,
    logout,
    logoutAllDevices,
    login,
    completeLogin2fa,
    loginWithToken,
    acceptTerms,
    registerStart,
    registerComplete,
    passwordResetStart,
    passwordResetComplete,
  }
}
