import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import {
  buildInviteCreatePayload,
  getInviteShareOrigin,
  inviteFullUrl,
  summarizeInvitePolicy,
} from '../lib/invites'

export function useServerSettingsModal({
  open,
  serverId,
  serverTag = '',
  onServerTagUpdated = null,
}) {
  const { t } = useTranslation()
  const [inviteType, setInviteType] = useState('temporary')
  /** For 7-day links only: one person vs up to N. */
  const [tempUsesMode, setTempUsesMode] = useState('multi')
  const [inviteLink, setInviteLink] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  const [lastInviteSummary, setLastInviteSummary] = useState('')
  const [activeInvites, setActiveInvites] = useState([])
  const [emojiList, setEmojiList] = useState([])
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [copyNotice, setCopyNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [canManageServer, setCanManageServer] = useState(false)
  const [canManageMemberRoles, setCanManageMemberRoles] = useState(false)
  const [serverBans, setServerBans] = useState([])
  const [activeSection, setActiveSection] = useState(
    /** @type {'servertag' | 'invites' | 'emojis' | 'roles' | 'commands' | 'events' | 'announcements' | 'bans'} */ ('invites')
  )
  const [tagDraft, setTagDraft] = useState('')
  const [tagBusy, setTagBusy] = useState(false)
  const copyTimerRef = useRef(null)

  const shareOrigin = getInviteShareOrigin()

  const inviteResetKey = `${inviteType}|${tempUsesMode}`
  const [inviteResetSync, setInviteResetSync] = useState(inviteResetKey)

  if (inviteResetKey !== inviteResetSync) {
    setInviteResetSync(inviteResetKey)
    setInviteLink('')
    setInviteToken('')
    setLastInviteSummary('')
  }

  const [wasOpen, setWasOpen] = useState(false)
  const [prevServerTag, setPrevServerTag] = useState(serverTag)
  if (open && !wasOpen) {
    setWasOpen(true)
    setActiveSection('invites')
    setTagDraft(serverTag && String(serverTag).trim() ? String(serverTag).trim().toUpperCase() : '')
    setPrevServerTag(serverTag)
  }
  if (!open && wasOpen) {
    setWasOpen(false)
  }
  if (open && serverTag !== prevServerTag) {
    setPrevServerTag(serverTag)
    setTagDraft(serverTag && String(serverTag).trim() ? String(serverTag).trim().toUpperCase() : '')
  }

  function flashCopy(message) {
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
    setCopyNotice(message)
    copyTimerRef.current = window.setTimeout(() => setCopyNotice(''), 2000)
  }

  useEffect(() => {
    if (!open || !serverId) return
    loadInvites()
    loadEmojis()
    loadBans()
    api
      .get(`/servers/${serverId}/my-permissions`)
      .then((r) => {
        setCanManageServer(Boolean(r.data?.can_manage_channels))
        setCanManageMemberRoles(Boolean(r.data?.can_manage_member_roles))
      })
      .catch(() => {
        setCanManageServer(false)
        setCanManageMemberRoles(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-doctor/exhaustive-deps
  }, [open, serverId])

  useEffect(() => {
    if (!open || !serverId || activeSection !== 'bans') return
    loadBans()
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-doctor/exhaustive-deps
  }, [activeSection, open, serverId])

  async function loadInvites() {
    if (!serverId) return
    try {
      const { data } = await api.get(`/servers/${serverId}/invites`)
      setActiveInvites(data)
      setError('')
    } catch {
      setActiveInvites([])
      setError(t('serverModal.errLoadInvites'))
    }
  }

  async function loadEmojis() {
    if (!serverId) return
    try {
      const { data } = await api.get(`/servers/${serverId}/emojis`)
      setEmojiList(data)
    } catch {
      setEmojiList([])
    }
  }

  async function loadBans() {
    if (!serverId) return
    try {
      const { data } = await api.get(`/servers/${serverId}/bans`)
      setServerBans(Array.isArray(data) ? data : [])
    } catch {
      setServerBans([])
    }
  }

  async function unbanUser(userId) {
    if (!serverId || !userId || !canManageServer) return
    setError('')
    setInfo('')
    try {
      await api.delete(`/servers/${serverId}/bans/${userId}`)
      setInfo(t('serverModal.banRemovedOk'))
      await loadBans()
    } catch {
      setError(t('serverModal.errUnban'))
    }
  }

  async function createInvite(e) {
    e.preventDefault()
    if (!serverId) {
      setError(t('serverModal.errMissingServer'))
      return
    }
    setError('')
    setInfo('')
    setCopyNotice('')
    setBusy(true)
    try {
      const payload = buildInviteCreatePayload(inviteType, tempUsesMode === 'single')
      const { data } = await api.post(`/servers/${serverId}/invites`, payload)
      const token = String(data?.token || '').trim()
      setInviteToken(token)
      setInviteLink(token ? inviteFullUrl(shareOrigin, token) : '')
      setLastInviteSummary(summarizeInvitePolicy(data))
      setInfo(t('serverModal.inviteCreatedInfo'))
      await loadInvites()
    } catch (err) {
      const msg =
        err.response?.status === 403 ? t('serverModal.errCreateForbidden') : t('serverModal.errCreate')
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  async function revokeInvite(inviteId) {
    if (!serverId || !inviteId) return
    setError('')
    setInfo('')
    try {
      await api.delete(`/servers/${serverId}/invites/${inviteId}`)
      setInfo(t('serverModal.inviteRevoked'))
      await loadInvites()
    } catch {
      setError(t('serverModal.errRevoke'))
    }
  }

  async function saveServerTag(e) {
    e.preventDefault()
    if (!serverId || !canManageServer) return
    setError('')
    setInfo('')
    const raw = String(tagDraft || '').trim()
    if (raw.length > 0 && !/^[a-zA-Z0-9]{2,4}$/.test(raw)) {
      setError(t('serverModal.tagErrFormat'))
      return
    }
    setTagBusy(true)
    try {
      const payload = { tag: raw === '' ? null : raw.toLowerCase() }
      await api.patch(`/servers/${serverId}`, payload)
      setInfo(t('serverModal.tagSaved'))
      onServerTagUpdated?.()
    } catch (err) {
      const st = err.response?.status
      const code = err.response?.data?.error
      if (st === 409 || code === 'tag_taken') {
        setError(t('serverModal.tagErrDuplicate'))
      } else {
        setError(t('serverModal.tagErr'))
      }
    } finally {
      setTagBusy(false)
    }
  }

  async function copyText(value, successLabel) {
    try {
      await navigator.clipboard.writeText(value)
      flashCopy(successLabel || t('serverModal.copied'))
    } catch {
      setError(t('serverModal.errClipboard'))
    }
  }

  return {
    t,
    inviteType,
    setInviteType,
    tempUsesMode,
    setTempUsesMode,
    inviteLink,
    inviteToken,
    lastInviteSummary,
    activeInvites,
    emojiList,
    error,
    info,
    copyNotice,
    busy,
    canManageServer,
    canManageMemberRoles,
    serverBans,
    activeSection,
    setActiveSection,
    tagDraft,
    setTagDraft,
    tagBusy,
    shareOrigin,
    loadEmojis,
    unbanUser,
    createInvite,
    revokeInvite,
    saveServerTag,
    copyText,
  }
}
