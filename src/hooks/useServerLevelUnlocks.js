import { useEffect, useState } from 'react'
import api from '../services/api'

/**
 * @param {string|number|null|undefined} serverId
 * @returns {{
 *   loading: boolean
 *   unlocked: Record<string, boolean>
 *   unlockAt: Record<string, number>
 *   level: number | null
 * }}
 */
export function useServerLevelUnlocks(serverId) {
  const [loading, setLoading] = useState(Boolean(serverId))
  const [unlocked, setUnlocked] = useState({})
  const [unlockAt, setUnlockAt] = useState({
    create_events: 15,
    custom_emoji: 20,
  })
  const [level, setLevel] = useState(null)

  useEffect(() => {
    if (!serverId) {
      setLoading(false)
      setUnlocked({})
      setLevel(null)
      return undefined
    }
    let cancelled = false
    setLoading(true)
    api
      .get(`/servers/${serverId}/levels/me`)
      .then((r) => {
        if (cancelled) return
        const rank = r.data?.rank
        const fromList = {}
        for (const u of rank?.unlocks || []) {
          if (u?.key) fromList[u.key] = true
        }
        const fromCosmetics = rank?.cosmetics?.unlocked || {}
        setUnlocked({ ...fromList, ...fromCosmetics })
        setLevel(rank?.level != null ? Number(rank.level) : null)
        setUnlockAt({
          create_events: 15,
          custom_emoji: 20,
          profile_color: 5,
          profile_banner: 10,
          ai_premium_limited: 30,
        })
      })
      .catch(() => {
        if (!cancelled) {
          setUnlocked({})
          setLevel(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [serverId])

  return { loading, unlocked, unlockAt, level }
}
