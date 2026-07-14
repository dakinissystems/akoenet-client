import { useEffect, useRef } from 'react'
import { fetchAddonData, saveAddonData } from './addonDataApi.js'

const SAVE_DEBOUNCE_MS = 900

/**
 * Sync localStorage addon blob with GET/PUT /workspace/data/:addonKey.
 *
 * @param {'kanban'|'calendar'|'notes'} addonKey
 * @param {{
 *   hydrate: (data: object) => void,
 *   dump: () => object,
 *   bindPersist?: (fn: ((data: object) => void) | null) => void,
 *   onHydrated?: () => void,
 * }} opts
 */
export function useAddonDataSync(addonKey, { hydrate, dump, bindPersist, onHydrated }) {
  const readyRef = useRef(false)
  const syncEnabledRef = useRef(false)
  const saveTimer = useRef(null)
  const onHydratedRef = useRef(onHydrated)
  onHydratedRef.current = onHydrated

  const schedulePersist = useRef((data) => {
    if (!readyRef.current || !syncEnabledRef.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveAddonData(addonKey, data).catch(() => {})
    }, SAVE_DEBOUNCE_MS)
  })

  useEffect(() => {
    if (!bindPersist) return undefined
    bindPersist((data) => schedulePersist.current(data))
    return () => bindPersist(null)
  }, [bindPersist])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const remote = await fetchAddonData(addonKey)
        if (cancelled) return

        syncEnabledRef.current = Boolean(remote?.workspaceId)

        if (remote?.data && typeof remote.data === 'object' && remote.workspaceId) {
          hydrate(remote.data)
          onHydratedRef.current?.()
          readyRef.current = true
          return
        }

        const local = dump()
        if (local && remote?.workspaceId) {
          await saveAddonData(addonKey, local)
        }
      } catch {
        /* offline or API unavailable — localStorage only */
      } finally {
        if (!cancelled) readyRef.current = true
      }
    })()

    return () => {
      cancelled = true
    }
  }, [addonKey, hydrate, dump])

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])
}
