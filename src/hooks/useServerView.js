import {
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { getAccessToken } from '../services/session-store'
import { getSocket } from '../services/socket'
import { useAuth } from '../context/AuthContext'
import { useAuthLogout } from '../hooks/useAuthLogout'
import { useDesktopGameActivity } from '../hooks/useDesktopGameActivity'
import { useTranslation } from 'react-i18next'
import {
  SERVER_WORKSPACE_INITIAL,
  collapsedCategoryLegacyKeys,
  collapsedCategoryStorageKey,
  normalizeVoicePresencePayload,
  serverWorkspaceReducer,
  MEMBERS_INLINE_MEDIA,
  subscribeMembersInlineMedia,
  getMembersInlineMediaSnapshot,
} from '../lib/serverViewState'

function useShowInlineMembersPanel() {
  return useSyncExternalStore(subscribeMembersInlineMedia, getMembersInlineMediaSnapshot, () => true)
}

export function useServerView() {
  const { t } = useTranslation()
  const { serverId } = useParams()
  const id = parseInt(serverId, 10)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, updateCurrentUser } = useAuth()
  const { signOut } = useAuthLogout()
  const [servers, setServers] = useState([])
  const [workspace, dispatchWorkspace] = useReducer(serverWorkspaceReducer, SERVER_WORKSPACE_INITIAL)
  const {
    channels,
    categories,
    members,
    canManageMemberRoles,
    activeChannelId,
    emojis,
    banStatus,
  } = workspace
  const patchWorkspace = useCallback((patch) => {
    dispatchWorkspace({ type: 'patch', patch })
  }, [])
  const setChannels = useCallback((value) => {
    dispatchWorkspace({
      type: 'patch',
      patch: (state) => ({ channels: typeof value === 'function' ? value(state.channels) : value }),
    })
  }, [])
  const setCategories = useCallback((value) => {
    dispatchWorkspace({
      type: 'patch',
      patch: (state) => ({ categories: typeof value === 'function' ? value(state.categories) : value }),
    })
  }, [])
  const setMembers = useCallback((value) => {
    dispatchWorkspace({
      type: 'patch',
      patch: (state) => ({ members: typeof value === 'function' ? value(state.members) : value }),
    })
  }, [])
  const setCanManageMemberRoles = useCallback(
    (value) => dispatchWorkspace({ type: 'patch', patch: { canManageMemberRoles: value } }),
    []
  )
  const setActiveChannelId = useCallback((value) => {
    dispatchWorkspace({
      type: 'patch',
      patch: (state) => ({
        activeChannelId: typeof value === 'function' ? value(state.activeChannelId) : value,
      }),
    })
  }, [])
  const setEmojis = useCallback((value) => {
    dispatchWorkspace({
      type: 'patch',
      patch: (state) => ({ emojis: typeof value === 'function' ? value(state.emojis) : value }),
    })
  }, [])
  const setBanStatus = useCallback(
    (value) => dispatchWorkspace({ type: 'patch', patch: { banStatus: value } }),
    []
  )
  const [serverName, setServerName] = useState('')
  const [serverTag, setServerTag] = useState('')
  const [toast, setToast] = useState(null)
  const [channelPermissions, setChannelPermissions] = useState([])
  const [userPermissions, setUserPermissions] = useState([])
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState([])
  const [userSettingsOpen, setUserSettingsOpen] = useState(false)
  const [userSettingsSection, setUserSettingsSection] = useState('profile')
  const [serverSettingsOpen, setServerSettingsOpen] = useState(false)
  const [channelSettingsOpen, setChannelSettingsOpen] = useState(false)
  const [membersDrawerOpen, setMembersDrawerOpen] = useState(false)
  const [serverOwnerId, setServerOwnerId] = useState(null)
  const showInlineMembersPanel = useShowInlineMembersPanel()
  const membersAutoCloseTimerRef = useRef(null)

  const clearMembersAutoCloseTimer = useCallback(() => {
    if (membersAutoCloseTimerRef.current != null) {
      clearTimeout(membersAutoCloseTimerRef.current)
      membersAutoCloseTimerRef.current = null
    }
  }, [])

  const closeMembersPanel = useCallback(() => {
    clearMembersAutoCloseTimer()
    setMembersDrawerOpen(false)
  }, [clearMembersAutoCloseTimer])

  const openMembersPanel = useCallback(() => {
    clearMembersAutoCloseTimer()
    setMembersDrawerOpen(true)
  }, [clearMembersAutoCloseTimer])

  const refreshServerList = useCallback(async () => {
    if (Number.isNaN(id)) return
    try {
      const { data } = await api.get('/servers')
      setServers(data)
      const cur = data.find((s) => s.id === id)
      if (cur) {
        setServerName(cur.name)
        setServerTag(cur?.tag && String(cur.tag).trim() ? String(cur.tag).trim() : '')
        setServerOwnerId(cur?.owner_id != null ? Number(cur.owner_id) : null)
      }
    } catch {
      /* ignore */
    }
  }, [id])

  const [voicePresence, setVoicePresence] = useState({})
  /** User ids currently sharing screen in the active voice session (local client view). */
  const [voiceScreenSharingUserIds, setVoiceScreenSharingUserIds] = useState([])
  const [connectedUserIds, setConnectedUserIds] = useState([])
  const [activityRealtime, setActivityRealtime] = useState({})
  const [gameRanking, setGameRanking] = useState([])

  const resetRealtimePresence = useCallback(() => {
    setVoicePresence({})
    setConnectedUserIds([])
    setGameRanking([])
  }, [])

  const onVoicePresenceSnap = useEffectEvent(({ serverId, presence }) => {
    if (serverId !== id) return
    setVoicePresence(normalizeVoicePresencePayload(presence))
  })

  const onServerPresenceSnapshot = useEffectEvent(({ serverId, connectedUserIds: ids }) => {
    if (serverId !== id) return
    setConnectedUserIds(Array.isArray(ids) ? ids : [])
  })

  const onServerPresenceUpdate = useEffectEvent(({ serverId, connectedUserIds: ids }) => {
    if (serverId !== id) return
    setConnectedUserIds(Array.isArray(ids) ? ids : [])
  })

  const onVoiceChannelPresence = useEffectEvent(({ channelId, participants }) => {
    if (channelId == null) return
    const key = String(channelId)
    setVoicePresence((prev) => ({ ...prev, [key]: participants || [] }))
  })

  const onGameActivitySnap = useEffectEvent(({ serverId, entries, ranking }) => {
    if (serverId !== id) return
    const o = {}
    for (const e of entries || []) {
      o[e.userId] = e.activity ?? null
    }
    setActivityRealtime(o)
    if (Array.isArray(ranking)) setGameRanking(ranking)
  })

  const onGameActivity = useEffectEvent(({ serverId, userId, activity }) => {
    if (serverId !== id) return
    setActivityRealtime((p) => ({ ...p, [userId]: activity ?? null }))
  })

  const onGameRanking = useEffectEvent(({ serverId, top }) => {
    if (serverId !== id) return
    setGameRanking(Array.isArray(top) ? top : [])
  })

  const joinServerRoom = useEffectEvent(() => {
    const s = getSocket()
    if (s) s.emit('join_server', id)
  })

  const activityFromMembers = useMemo(() => {
    const o = {}
    for (const m of members) {
      o[m.id] = m.activity ?? null
    }
    return o
  }, [members])

  const activityByUserId = useMemo(
    () => ({ ...activityFromMembers, ...activityRealtime }),
    [activityFromMembers, activityRealtime]
  )
  /** Voice channel id kept while user reads text channels (stay connected). Cleared on leave / server change. */
  const [voicePersistChannelId, setVoicePersistChannelId] = useState(null)
  /** Stops HTTP voice-presence polling after auth/404 errors or when socket is live */
  const voicePresencePollStoppedHttp = useRef(false)
  const voicePresencePollServerId = useRef(null)
  /** Avoid re-applying `?channel=` from the URL on every searchParams change after first apply. */
  const appliedChannelFromQuery = useRef(false)

  const rtcVoiceChannelId = useMemo(() => {
    const active = channels.find((c) => c.id === activeChannelId)
    if (active?.type === 'voice') return activeChannelId
    return voicePersistChannelId
  }, [channels, activeChannelId, voicePersistChannelId])

  const rtcVoiceChannelMeta = useMemo(() => {
    if (rtcVoiceChannelId == null) return null
    return channels.find((c) => c.id === rtcVoiceChannelId) || null
  }, [channels, rtcVoiceChannelId])

  useDesktopGameActivity(user)

  const rtcVoiceConnectedCount = useMemo(() => {
    if (rtcVoiceChannelId == null) return undefined
    const raw = voicePresence[String(rtcVoiceChannelId)] ?? voicePresence[rtcVoiceChannelId]
    return Array.isArray(raw) ? raw.length : undefined
  }, [voicePresence, rtcVoiceChannelId])

  const handleVoiceSessionChange = useCallback((payload) => {
    if (!payload || typeof payload !== 'object') return
    if ('joined' in payload) {
      setVoicePersistChannelId(payload.joined && payload.channelId != null ? Number(payload.channelId) : null)
      if (!payload.joined) setVoiceScreenSharingUserIds([])
    }
    if (Array.isArray(payload.screenSharingUserIds)) {
      setVoiceScreenSharingUserIds(payload.screenSharingUserIds)
    }
  }, [])

  const memberIdsKeyRef = useRef('')

  useEffect(() => {
    memberIdsKeyRef.current = ''
    setVoicePersistChannelId(null)
    setVoiceScreenSharingUserIds([])
    setActivityRealtime({})
  }, [id])

  useEffect(() => {
    const memberIdsKey = members.map((m) => m?.id).join(',')
    if (memberIdsKey === memberIdsKeyRef.current) return
    memberIdsKeyRef.current = memberIdsKey
    setActivityRealtime({})
  }, [members])

  useEffect(() => {
    appliedChannelFromQuery.current = false
  }, [id])

  useEffect(() => {
    if (appliedChannelFromQuery.current || !channels.length) return
    const raw = searchParams.get('channel')
    if (!raw) return
    const cid = parseInt(raw, 10)
    if (Number.isNaN(cid)) return
    if (!channels.some((c) => c.id === cid)) return
    setActiveChannelId(cid)
    appliedChannelFromQuery.current = true
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete('channel')
        return next
      },
      { replace: true }
    )
  }, [channels, searchParams, setSearchParams, setActiveChannelId])

  useEffect(() => {
    if (Number.isNaN(id)) {
      navigate('/')
      return
    }
    ;(async () => {
      try {
        setBanStatus(null)
        const { data } = await api.get('/servers')
        setServers(data)
        const current = data.find((s) => s.id === id)
        if (!current) {
          setServerOwnerId(null)
          setServerTag('')
          try {
            await api.get(`/servers/${id}/ban-status`)
            navigate('/')
            return
          } catch (e) {
            if (e?.response?.status === 403 && e?.response?.data?.banned) {
              setBanStatus(e.response.data)
              return
            }
            navigate('/')
            return
          }
        }
        setServerName(current.name)
        setServerTag(current?.tag && String(current.tag).trim() ? String(current.tag).trim() : '')
        setServerOwnerId(current?.owner_id != null ? Number(current.owner_id) : null)
      } catch {
        setServerOwnerId(null)
        setServerTag('')
        navigate('/')
      }
    })()
  }, [id, navigate, setBanStatus])

  useEffect(() => {
    if (Number.isNaN(id)) return
    if (!getAccessToken()) return
    dispatchWorkspace({ type: 'reset-for-server' })
    ;(async () => {
      try {
        const [{ data: channelData }, { data: categoriesData }, { data: membersData }, { data: permData }] =
          await Promise.all([
            api.get(`/channels/server/${id}`),
            api.get(`/channels/server/${id}/categories`),
            api.get(`/servers/${id}/members`),
            api.get(`/servers/${id}/my-permissions`).catch(() => ({ data: {} })),
          ])
        const { data: emojiData } = await api.get(`/servers/${id}/emojis`)
        dispatchWorkspace({
          type: 'bootstrap',
          payload: {
            channels: channelData,
            categories: categoriesData,
            members: membersData,
            canManageMemberRoles: Boolean(permData?.can_manage_member_roles),
            activeChannelId: channelData[0]?.id ?? null,
            emojis: emojiData,
            banStatus: null,
          },
        })
      } catch (e) {
        if (e?.response?.status === 403) {
          try {
            await api.get(`/servers/${id}/ban-status`)
            navigate('/')
            return
          } catch (banErr) {
            if (banErr?.response?.status === 403 && banErr?.response?.data?.banned) {
              setBanStatus(banErr.response.data)
              return
            }
          }
        }
        navigate('/')
      }
    })()
  }, [id, navigate, setBanStatus])

  useLayoutEffect(() => {
    const s = getSocket()
    if (!s || Number.isNaN(id)) return undefined
    resetRealtimePresence()

    s.on('voice:presence_snapshot', onVoicePresenceSnap)
    s.on('server:presence_snapshot', onServerPresenceSnapshot)
    s.on('server:presence_update', onServerPresenceUpdate)
    s.on('voice:presence', onVoiceChannelPresence)
    s.on('server:game_activity_snapshot', onGameActivitySnap)
    s.on('server:game_activity', onGameActivity)
    s.on('server:game_ranking', onGameRanking)
    s.on('connect', joinServerRoom)
    if (s.connected) joinServerRoom()

    return () => {
      s.off('voice:presence_snapshot', onVoicePresenceSnap)
      s.off('server:presence_snapshot', onServerPresenceSnapshot)
      s.off('server:presence_update', onServerPresenceUpdate)
      s.off('voice:presence', onVoiceChannelPresence)
      s.off('server:game_activity_snapshot', onGameActivitySnap)
      s.off('server:game_activity', onGameActivity)
      s.off('server:game_ranking', onGameRanking)
      s.off('connect', joinServerRoom)
      s.emit('leave_server', id)
    }
  }, [id, resetRealtimePresence])

  useEffect(() => {
    if (Number.isNaN(id) || !user?.id) return undefined
    if (voicePresencePollServerId.current !== id) {
      voicePresencePollServerId.current = id
      voicePresencePollStoppedHttp.current = false
    }
    let cancelled = false
    let intervalId = null

    function stopVoicePresencePoll() {
      voicePresencePollStoppedHttp.current = true
      if (intervalId != null) {
        window.clearInterval(intervalId)
        intervalId = null
      }
    }

    async function fetchVoicePresence() {
      if (cancelled || voicePresencePollStoppedHttp.current) return
      if (!getAccessToken()) {
        stopVoicePresencePoll()
        return
      }
      const socket = getSocket()
      if (socket?.connected) {
        stopVoicePresencePoll()
        return
      }
      try {
        const { data } = await api.get(`/servers/${id}/voice-presence`)
        if (cancelled) return
        setVoicePresence(normalizeVoicePresencePayload(data))
      } catch (e) {
        const status = e?.response?.status
        if (!cancelled && (status === 404 || status === 401 || status === 403)) {
          stopVoicePresencePoll()
        }
        /* other errors ignored — socket may still update */
      }
    }

    const onSocketConnect = () => {
      stopVoicePresencePoll()
    }

    const socket = getSocket()
    socket?.on('connect', onSocketConnect)

    ;(async () => {
      if (!getAccessToken()) return
      await fetchVoicePresence()
      if (cancelled || voicePresencePollStoppedHttp.current) return
      intervalId = window.setInterval(fetchVoicePresence, 5000)
    })()

    return () => {
      cancelled = true
      socket?.off('connect', onSocketConnect)
      if (intervalId != null) window.clearInterval(intervalId)
    }
  }, [id, user?.id])

  useEffect(() => {
    const s = getSocket()
    if (!s) return
    let hide
    const onNote = (payload) => {
      if (payload.channelId === activeChannelId) return
      setToast({ ...payload, at: Date.now() })
      window.clearTimeout(hide)
      hide = window.setTimeout(() => setToast(null), 4500)
    }
    s.on('echonet_notification', onNote)
    return () => {
      s.off('echonet_notification', onNote)
      window.clearTimeout(hide)
    }
  }, [activeChannelId])

  async function createChannel({ name, type, categoryId, isPrivate }) {
    if (!name?.trim() || Number.isNaN(id)) return
    await api.post('/channels', {
      name: name.trim(),
      server_id: id,
      type,
      category_id: categoryId != null ? Number(categoryId) : null,
      is_private: Boolean(isPrivate),
    })
    const { data } = await api.get(`/channels/server/${id}`)
    setChannels(data)
  }

  async function updateChannel(channelId, payload) {
    if (!channelId) return
    await api.put(`/channels/${channelId}`, payload)
    const { data } = await api.get(`/channels/server/${id}`)
    setChannels(data)
  }

  const refreshServerMembers = useCallback(async () => {
    if (Number.isNaN(id)) return
    try {
      const { data } = await api.get(`/servers/${id}/members`)
      setMembers(data)
    } catch {
      /* ignore */
    }
  }, [id, setMembers])

  async function createCategory({ name }) {
    if (!name?.trim() || Number.isNaN(id)) return
    await api.post('/channels/categories', {
      server_id: id,
      name: name.trim(),
    })
    const { data } = await api.get(`/channels/server/${id}/categories`)
    setCategories(data)
  }

  async function deleteCategory(categoryId) {
    if (!window.confirm(t('serverView.confirmDeleteCategory'))) return
    try {
      await api.delete(`/channels/categories/${categoryId}`)
    } catch (err) {
      if (err.response?.status !== 404) {
        setToast({
          username: t('serverView.toastSystem'),
          snippet: t('serverView.toastDeleteCategoryFailed'),
          at: Date.now(),
        })
        return
      }
    }

    const [{ data: categoriesData }, { data: channelsData }] = await Promise.all([
      api.get(`/channels/server/${id}/categories`),
      api.get(`/channels/server/${id}`),
    ])
    setCategories(categoriesData)
    setChannels(channelsData)
    setCollapsedCategories((prev) => {
      const next = prev.filter((cid) => cid !== categoryId)
      localStorage.setItem(collapsedCategoryStorageKey(id), JSON.stringify(next))
      return next
    })
  }

  async function deleteChannel(channelId) {
    if (!window.confirm(t('serverView.confirmDeleteChannel'))) return
    await api.delete(`/channels/${channelId}`)
    const { data } = await api.get(`/channels/server/${id}`)
    setChannels(data)
    if (activeChannelId === channelId) {
      setActiveChannelId(data[0]?.id ?? null)
    }
  }

  async function moveChannel(channelId, targetChannelId, targetCategoryId) {
    if (!id) return
    await api.post('/channels/reorder', {
      server_id: id,
      channel_id: channelId,
      target_channel_id: targetChannelId,
      target_category_id: targetCategoryId,
    })
    const { data } = await api.get(`/channels/server/${id}`)
    setChannels(data)
  }

  async function moveCategory(categoryId, targetCategoryId) {
    if (!id) return
    await api.post('/channels/categories/reorder', {
      server_id: id,
      category_id: categoryId,
      target_category_id: targetCategoryId,
    })
    const { data } = await api.get(`/channels/server/${id}/categories`)
    setCategories(data)
  }

  useEffect(() => {
    if (!activeChannelId || !getAccessToken()) {
      setChannelPermissions([])
      setUserPermissions([])
      return
    }
    ;(async () => {
      const [{ data: roleData }, { data: userData }] = await Promise.all([
        api.get(`/channels/${activeChannelId}/permissions`),
        api.get(`/channels/${activeChannelId}/user-permissions`),
      ])
      setChannelPermissions(roleData)
      setUserPermissions(userData)
    })().catch(() => {
      setChannelPermissions([])
      setUserPermissions([])
    })
  }, [activeChannelId])

  async function togglePermission(roleId, next) {
    if (!activeChannelId) return
    const payload = {
      role_id: roleId,
      can_view: Boolean(next.can_view),
      can_send: Boolean(next.can_send),
      can_connect: Boolean(next.can_connect),
    }
    await api.put(`/channels/${activeChannelId}/permissions`, payload)
    setChannelPermissions((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, ...payload } : r))
    )
  }

  async function toggleUserPermission(userId, next) {
    if (!activeChannelId) return
    const payload = {
      can_view: Boolean(next.can_view),
      can_send: Boolean(next.can_send),
      can_connect: Boolean(next.can_connect),
    }
    await api.put(`/channels/${activeChannelId}/user-permissions/${userId}`, payload)
    const user = members.find((m) => m.id === userId)
    setUserPermissions((prev) => {
      const exists = prev.some((p) => p.user_id === userId)
      if (exists) {
        return prev.map((p) => (p.user_id === userId ? { ...p, ...payload } : p))
      }
      return [...prev, { user_id: userId, username: user?.username || `user_${userId}`, ...payload }]
    })
  }

  async function setAppearOnline(nextOnline) {
    const previousPresence =
      String(user?.presence_status || '').toLowerCase() === 'invisible' ? 'invisible' : 'online'
    try {
      const nextPresence = nextOnline ? 'online' : 'invisible'
      updateCurrentUser?.({ presence_status: nextPresence })
      await api.patch('/auth/me', {
        presence_status: nextPresence,
      })
      setMembers((prev) =>
        prev.map((m) =>
          Number(m.id) === Number(user?.id)
            ? { ...m, presence_status: nextPresence }
            : m
        )
      )
      try {
        const { data: membersData } = await api.get(`/servers/${id}/members`)
        setMembers(membersData)
      } catch {
        /* keep local optimistic value if fetch fails */
      }
    } catch {
      updateCurrentUser?.({ presence_status: previousPresence })
      setToast({
        username: t('serverView.toastSystem'),
        snippet: t('serverView.toastOnlineStatusFailed'),
        at: Date.now(),
      })
    }
  }

  useEffect(() => {
    if (!id) return
    const key = collapsedCategoryStorageKey(id)
    try {
      let raw = localStorage.getItem(key)
      if (!raw) {
        for (const lk of collapsedCategoryLegacyKeys(id)) {
          raw = localStorage.getItem(lk)
          if (raw) break
        }
      }
      const parsed = raw ? JSON.parse(raw) : []
      if (Array.isArray(parsed)) setCollapsedCategories(parsed)
    } catch {
      setCollapsedCategories([])
    }
  }, [id])

  useEffect(() => {
    if (showInlineMembersPanel) closeMembersPanel()
  }, [showInlineMembersPanel, closeMembersPanel])

  useEffect(() => {
    return () => clearMembersAutoCloseTimer()
  }, [clearMembersAutoCloseTimer])

  const onMembersDrawerEscape = useEffectEvent(() => {
    closeMembersPanel()
  })

  useEffect(() => {
    if (!membersDrawerOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onMembersDrawerEscape()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [membersDrawerOpen])

  useEffect(() => {
    if (!membersDrawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [membersDrawerOpen])

  function toggleCategoryCollapse(categoryId) {
    setCollapsedCategories((prev) => {
      const next = prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
      localStorage.setItem(collapsedCategoryStorageKey(id), JSON.stringify(next))
      return next
    })
  }

  if (Number.isNaN(id)) return null

  const activeChannel = channels.find((c) => c.id === activeChannelId)
  return {
    t,
    id,
    navigate,
    user,
    signOut,
    servers,
    channels,
    categories,
    members,
    canManageMemberRoles,
    activeChannelId,
    emojis,
    banStatus,
    setActiveChannelId,
    serverName,
    serverTag,
    createChannel,
    createCategory,
    deleteCategory,
    deleteChannel,
    moveChannel,
    moveCategory,
    collapsedCategories,
    toggleCategoryCollapse,
    userSettingsOpen,
    setUserSettingsOpen,
    userSettingsSection,
    setUserSettingsSection,
    serverSettingsOpen,
    setServerSettingsOpen,
    channelSettingsOpen,
    setChannelSettingsOpen,
    membersDrawerOpen,
    closeMembersPanel,
    openMembersPanel,
    voicePresence,
    voiceScreenSharingUserIds,
    rtcVoiceChannelId,
    rtcVoiceChannelMeta,
    rtcVoiceConnectedCount,
    handleVoiceSessionChange,
    connectedUserIds,
    activityByUserId,
    gameRanking,
    serverOwnerId,
    refreshServerMembers,
    refreshServerList,
    channelPermissions,
    togglePermission,
    userPermissions,
    toggleUserPermission,
    updateChannel,
    selectedMemberId,
    setSelectedMemberId,
    toast,
    showInlineMembersPanel,
    setAppearOnline,
    activeChannel,
  }
}
