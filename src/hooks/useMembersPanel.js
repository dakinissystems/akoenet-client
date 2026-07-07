import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { normalizedRoles, resolveDisplayRole, ROLE_ORDER, sortServerRoleNames } from '../lib/serverRoles'
import { isMemberOnline } from '../lib/memberUtils'

export function useMembersPanel({
  members,
  connectedUserIds,
  currentUser,
  onClose,
  serverId,
  canManageMemberRoles,
  serverOwnerId,
  onMemberRolesUpdated,
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [avatarFailed, setAvatarFailed] = useState(() => new Set())
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [friendships, setFriendships] = useState([])
  const [friendRequestBusyId, setFriendRequestBusyId] = useState(null)
  const [dmOpenBusyId, setDmOpenBusyId] = useState(null)
  const [friendNotice, setFriendNotice] = useState(null)
  const [roleDefinitions, setRoleDefinitions] = useState([])
  const [roleBusyId, setRoleBusyId] = useState(null)
  const [roleNotice, setRoleNotice] = useState(null)
  const [roleNameBusyId, setRoleNameBusyId] = useState(null)
  const [roleNameNotice, setRoleNameNotice] = useState(null)

  const serverRoleNames = useMemo(
    () => sortServerRoleNames(roleDefinitions.flatMap((r) => (r.slug ? [r.slug] : []))),
    [roleDefinitions]
  )

  const roleLabels = useMemo(() => {
    const m = {}
    for (const r of roleDefinitions) {
      if (r.slug) m[r.slug] = r.name
    }
    return m
  }, [roleDefinitions])

  const connectedSet = useMemo(
    () => new Set((connectedUserIds || []).map((id) => Number(id))),
    [connectedUserIds]
  )

  const refreshFriendships = useCallback(async () => {
    try {
      const { data } = await api.get('/social/friends')
      setFriendships(Array.isArray(data) ? data : [])
    } catch {
      setFriendships([])
    }
  }, [])

  useEffect(() => {
    refreshFriendships()
  }, [refreshFriendships])

  useEffect(() => {
    if (!serverId || !canManageMemberRoles) {
      setRoleDefinitions([])
      return undefined
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get(`/servers/${serverId}/roles`)
        const defs = (Array.isArray(data) ? data : []).map((r) => ({
          id: r.id,
          name: r.name,
          slug: String(r.slug || r.name || '')
            .trim()
            .toLowerCase(),
          permissions: Array.isArray(r.permissions) ? r.permissions : [],
        }))
        if (!cancelled) setRoleDefinitions(defs)
      } catch {
        if (!cancelled) setRoleDefinitions([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [serverId, canManageMemberRoles])

  async function saveRoleDisplayName(def, rawName) {
    if (!serverId || !canManageMemberRoles) return
    const name = String(rawName || '').trim()
    if (!name || name === def.name) return
    setRoleNameNotice(null)
    setRoleNameBusyId(def.id)
    try {
      await api.patch(`/servers/${serverId}/roles/${def.id}`, { name })
      const { data } = await api.get(`/servers/${serverId}/roles`)
      setRoleDefinitions(
        (Array.isArray(data) ? data : []).map((r) => ({
          id: r.id,
          name: r.name,
          slug: String(r.slug || r.name || '')
            .trim()
            .toLowerCase(),
        }))
      )
      await onMemberRolesUpdated?.()
      setRoleNameNotice({ type: 'ok', text: t('members.roleNameSaved') })
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'role_name_taken') {
        setRoleNameNotice({ type: 'err', text: t('members.roleNameTaken') })
      } else {
        setRoleNameNotice({ type: 'err', text: t('members.roleNameErr') })
      }
    } finally {
      setRoleNameBusyId(null)
    }
  }

  const friendshipByPeerId = useMemo(() => {
    const m = new Map()
    for (const f of friendships) {
      m.set(Number(f.peer_id), f)
    }
    return m
  }, [friendships])

  const roleOptions = useMemo(() => {
    const set = new Set(['member'])
    for (const m of members || []) {
      const rs = normalizedRoles(m)
      for (const r of rs) {
        if (r) set.add(String(r).toLowerCase())
      }
    }
    return ['all', ...[...set].toSorted((a, b) => a.localeCompare(b))]
  }, [members])

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (members || []).filter((m) => {
      const username = String(m?.username || '').toLowerCase()
      const roles = normalizedRoles(m)
      const online = isMemberOnline(m, connectedSet, currentUser)
      if (q && !username.includes(q)) return false
      if (roleFilter !== 'all' && !roles.includes(roleFilter)) return false
      if (statusFilter === 'connected' && !online) return false
      if (statusFilter === 'offline' && online) return false
      return true
    })
  }, [members, query, roleFilter, statusFilter, connectedSet, currentUser])

  const groupedMembers = useMemo(() => {
    const sections = new Map()
    const titleFor = (key) =>
      roleLabels[key] || t(`members.roles.${key}`, { defaultValue: key.charAt(0).toUpperCase() + key.slice(1) })
    for (const member of filteredMembers) {
      const key = resolveDisplayRole(member)
      if (!sections.has(key)) {
        sections.set(key, { key, title: titleFor(key), items: [] })
      }
      sections.get(key).items.push(member)
    }
    const arr = [...sections.values()]
    arr.forEach((section) => {
      section.items.sort((a, b) =>
        String(a?.username || '').localeCompare(String(b?.username || ''), undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      )
    })
    arr.sort((a, b) => {
      const ai = ROLE_ORDER.indexOf(a.key)
      const bi = ROLE_ORDER.indexOf(b.key)
      if (ai !== -1 || bi !== -1) {
        if (ai === -1) return 1
        if (bi === -1) return -1
        return ai - bi
      }
      return a.title.localeCompare(b.title)
    })
    return arr
  }, [filteredMembers, t, roleLabels])

  async function openDirectMessage(peerId) {
    setFriendNotice(null)
    setDmOpenBusyId(peerId)
    try {
      const { data } = await api.post('/dm/conversations', { target_user_id: peerId })
      navigate(`/messages?conversation=${encodeURIComponent(String(data.id))}`)
      onClose?.()
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'blocked' || err.response?.status === 403) {
        setFriendNotice({ type: 'err', text: t('members.errDmBlocked') })
      } else {
        setFriendNotice({ type: 'err', text: t('members.errDmOpen') })
      }
    } finally {
      setDmOpenBusyId(null)
    }
  }

  async function handleMemberRoleChange(member, nextRole) {
    if (!serverId || !canManageMemberRoles) return
    const current = resolveDisplayRole(member)
    if (String(nextRole).toLowerCase() === current) return
    setFriendNotice(null)
    setRoleNotice(null)
    setRoleBusyId(Number(member.id))
    try {
      await api.patch(`/servers/${serverId}/members/${member.id}/roles`, {
        role: String(nextRole).toLowerCase(),
      })
      await onMemberRolesUpdated?.()
      setFriendNotice({ type: 'ok', text: t('members.roleUpdated') })
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'last_admin') {
        setRoleNotice({ type: 'err', text: t('members.roleErrLastAdmin') })
      } else if (code === 'cannot_change_owner_role') {
        setRoleNotice({ type: 'err', text: t('members.roleErrOwner') })
      } else {
        setRoleNotice({ type: 'err', text: t('members.roleErrGeneric') })
      }
    } finally {
      setRoleBusyId(null)
    }
  }

  async function handleAddFriend(peerId) {
    setFriendNotice(null)
    setFriendRequestBusyId(peerId)
    try {
      await api.post('/social/friends/request', { user_id: peerId })
      await refreshFriendships()
      setFriendNotice({ type: 'ok', text: t('members.friendSent') })
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'already_exists') {
        await refreshFriendships()
        setFriendNotice({ type: 'muted', text: t('members.friendAlready') })
      } else if (code === 'blocked') {
        setFriendNotice({ type: 'err', text: t('members.errFriendBlocked') })
      } else {
        setFriendNotice({ type: 'err', text: t('members.errFriendSend') })
      }
    } finally {
      setFriendRequestBusyId(null)
    }
  }

  return {
    t,
    avatarFailed,
    setAvatarFailed,
    query,
    setQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    selectedMemberId,
    setSelectedMemberId,
    friendNotice,
    setFriendNotice,
    roleDefinitions,
    roleBusyId,
    roleNotice,
    roleNameBusyId,
    roleNameNotice,
    serverRoleNames,
    roleLabels,
    connectedSet,
    saveRoleDisplayName,
    friendshipByPeerId,
    roleOptions,
    filteredMembers,
    groupedMembers,
    openDirectMessage,
    handleMemberRoleChange,
    handleAddFriend,
    friendRequestBusyId,
    dmOpenBusyId,
  }
}
