import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchDesktopProfiles } from './layoutApi.js'
import {
  loadStoredProfileKey,
  resolveProfileLayout,
  storeProfileKey,
} from './desktopProfileUtils.js'

/** @typedef {{ profileKey: string; name: string; baseLayout?: string|null; windowState?: object; dockPins?: string[]; isDefault?: boolean }} DesktopProfile */

const DesktopProfileContext = createContext(null)

export function DesktopProfileProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [profiles, setProfiles] = useState(/** @type {DesktopProfile[]} */ ([]))
  const [workspaceId, setWorkspaceId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeKey, setActiveKey] = useState(() =>
    loadStoredProfileKey(searchParams.get('profile') || undefined),
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchDesktopProfiles()
      .then((data) => {
        if (cancelled) return
        const items = data?.items || []
        setProfiles(items)
        setWorkspaceId(data?.workspaceId || null)
        const urlKey = searchParams.get('profile')
        const stored = loadStoredProfileKey(urlKey || undefined)
        const fallback =
          stored ||
          items.find((p) => p.isDefault)?.profileKey ||
          items[0]?.profileKey ||
          null
        setActiveKey(fallback)
      })
      .catch(() => {
        if (!cancelled) setProfiles([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeProfile = useMemo(
    () => profiles.find((p) => p.profileKey === activeKey) || profiles[0] || null,
    [profiles, activeKey],
  )

  const resolved = useMemo(
    () => resolveProfileLayout(activeProfile, profiles),
    [activeProfile, profiles],
  )

  const switchProfile = useCallback(
    (profileKey) => {
      if (!profileKey) return
      setActiveKey(profileKey)
      storeProfileKey(profileKey)
      const next = new URLSearchParams(searchParams)
      next.set('profile', profileKey)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const value = useMemo(
    () => ({
      profiles,
      workspaceId,
      loading,
      activeProfile,
      activeKey: activeProfile?.profileKey || activeKey,
      dockPins: resolved.dockPins,
      opens: resolved.opens,
      profileIcon: resolved.icon,
      switchProfile,
    }),
    [profiles, workspaceId, loading, activeProfile, activeKey, resolved, switchProfile],
  )

  return <DesktopProfileContext.Provider value={value}>{children}</DesktopProfileContext.Provider>
}

export function useDesktopProfile() {
  const ctx = useContext(DesktopProfileContext)
  if (!ctx) {
    return {
      profiles: [],
      workspaceId: null,
      loading: false,
      activeProfile: null,
      activeKey: null,
      dockPins: ['media-player', 'command-palette', 'activity-center'],
      opens: [],
      profileIcon: null,
      switchProfile: () => {},
    }
  }
  return ctx
}
