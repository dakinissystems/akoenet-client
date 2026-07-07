import {
  createContext,
  use,
  useCallback,
  useMemo,
} from 'react'
import { useAuthBootstrap } from '../hooks/useAuthBootstrap'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuthBootstrap()

  const updateCurrentUser = useCallback((partial) => {
    auth.setUser((prev) => {
      if (!prev) return prev
      return { ...prev, ...(partial || {}) }
    })
  }, [auth])

  const value = useMemo(
    () => ({
      ...auth,
      updateCurrentUser,
    }),
    [auth, updateCurrentUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth outside AuthProvider')
  return ctx
}
