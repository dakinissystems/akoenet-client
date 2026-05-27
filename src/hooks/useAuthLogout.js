import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DAKINIS_LOGOUT_REDIRECT } from '../lib/dakinis-client-logout.js'
import { useAuth } from '../context/AuthContext'

/** Sign-out + redirect (same redirect as Core / StreamAutomator). */
export function useAuthLogout() {
  const { logout, logoutAllDevices } = useAuth()
  const navigate = useNavigate()

  const signOut = useCallback(async () => {
    await logout()
    navigate(DAKINIS_LOGOUT_REDIRECT, { replace: true })
  }, [logout, navigate])

  const signOutAllDevices = useCallback(async () => {
    await logoutAllDevices()
    navigate(DAKINIS_LOGOUT_REDIRECT, { replace: true })
  }, [logoutAllDevices, navigate])

  return { signOut, signOutAllDevices }
}
