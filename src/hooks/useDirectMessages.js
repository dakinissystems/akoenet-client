import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { getSocket } from '../services/socket'
import { getApiBaseUrl } from '../lib/apiBase'
import { pickImageFileFromDevice } from '../services/mobile-media'
import { getAccessToken } from '../services/session-store'
import {
  ALLOWED_DM_IMAGE_MIME_TYPES,
  CONVERSATION_UI_INITIAL,
  MAX_DM_UPLOAD_SIZE_BYTES,
  conversationUiReducer,
  isPresenceOnline,
} from '../lib/dmConversationUi'

const baseURL = getApiBaseUrl()

export function useDirectMessages(user) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const conversationParam = searchParams.get('conversation') ?? ''
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [reportFeedback, setReportFeedback] = useState('')
  const [uploading, setUploading] = useState(false)
  const [convUi, dispatchConvUi] = useReducer(conversationUiReducer, CONVERSATION_UI_INITIAL)
  const {
    peerTypingName,
    replyTo,
    editingMessageId,
    editingDraft,
    dmSearchOpen,
    dmSearchQuery,
    dmSearchResults,
    editHistoryModalOpen,
    editHistoryEntries,
    composerHistoryIndex,
  } = convUi
  const [dmSearchBusy, setDmSearchBusy] = useState(false)
  const [failedAvatarKeys, setFailedAvatarKeys] = useState(() => new Set())
  const [isMobileDm, setIsMobileDm] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 720px)').matches : false
  )
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [mobileDragOffset, setMobileDragOffset] = useState(0)
  const messageNodeRef = useRef(null)
  if (messageNodeRef.current == null) {
    messageNodeRef.current = new Map()
  }
  const bottomRef = useRef(null)
  const dmComposerInputRef = useRef(null)
  const mobileTouchStartYRef = useRef(null)
  const mobileDraggingRef = useRef(false)
  const dmTypingStopTimerRef = useRef(null)
  const lastDmTypingEmitRef = useRef(0)
  const currentUserIdRef = useRef(null)
  const fileDragDepthRef = useRef(0)
  const [fileDragOver, setFileDragOver] = useState(false)
  const loadMessagesGenRef = useRef(0)

  async function loadConversationMessages(conversationId) {
    if (!conversationId) return
    const gen = ++loadMessagesGenRef.current
    try {
      const { data } = await api.get(`/dm/conversations/${conversationId}/messages`)
      if (gen !== loadMessagesGenRef.current) return
      setMessages(data)
    } catch {
      if (gen !== loadMessagesGenRef.current) return
      setMessages([])
    }
  }

  function scrollComposerHighlight(messageId) {
    if (messageId == null) return
    requestAnimationFrame(() => {
      const node = messageNodeRef.current.get(messageId)
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  function formatConversationPreview(message) {
    if (!message) return t('dm.previewEmpty')
    const text = String(message).trim()
    if (!text) return t('dm.previewImage')
    if (text === '(imagen)') return t('dm.previewImage')
    return text
  }

  async function loadConversations() {
    const { data } = await api.get('/dm/conversations')
    setConversations(data)
    setSelectedConversationId((prev) => (prev != null ? prev : data[0]?.id ?? null))
  }

  useEffect(() => {
    currentUserIdRef.current = user?.id != null ? Number(user.id) : null
  }, [user?.id])

  const composerHistoryMatches = useMemo(() => {
    if (!selectedConversationId) return []
    const prefix = text.trim()
    if (prefix.length < 1) return []
    const pl = prefix.toLowerCase()
    const out = []
    for (const m of messages) {
      if (m._optimistic) continue
      const c = m.content
      if (c == null || c === '' || c === '(imagen)') continue
      if (String(c).toLowerCase().startsWith(pl)) out.push(m)
    }
    out.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    return out.slice(0, 40)
  }, [messages, text, selectedConversationId])

  const composerHistorySafeIndex = Math.min(
    composerHistoryIndex,
    Math.max(0, composerHistoryMatches.length - 1)
  )
  const composerHighlightId =
    composerHistoryMatches.length > 0 ? composerHistoryMatches[composerHistorySafeIndex]?.id : null

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await api.get('/dm/conversations')
        if (cancelled) return
        setConversations(data)
        const prefer = conversationParam !== '' ? Number(conversationParam) : null
        if (Number.isFinite(prefer)) {
          setSelectedConversationId(prefer)
          if (typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches) {
            setMobileChatOpen(true)
          }
          void loadConversationMessages(prefer)
          setSearchParams(
            (p) => {
              const n = new URLSearchParams(p)
              n.delete('conversation')
              return n
            },
            { replace: true }
          )
        } else {
          setSelectedConversationId((prev) => prev ?? (data[0]?.id ?? null))
        }
      } catch {
        if (!cancelled) setError(t('dm.errLoad'))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [conversationParam, setSearchParams, t])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(max-width: 720px)')
    const onChange = (e) => {
      const mobile = e.matches
      setIsMobileDm(mobile)
      if (!mobile) setMobileChatOpen(false)
    }
    mq.addEventListener('change', onChange)
    setIsMobileDm(mq.matches)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!(isMobileDm && mobileChatOpen)) {
      setMobileDragOffset(0)
      return undefined
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isMobileDm, mobileChatOpen])

  useEffect(() => {
    if (!(isMobileDm && mobileChatOpen)) return
    const id = window.setTimeout(() => {
      dmComposerInputRef.current?.focus?.()
    }, 120)
    return () => window.clearTimeout(id)
  }, [isMobileDm, mobileChatOpen])

  const [conversationIdSync, setConversationIdSync] = useState(selectedConversationId)

  if (selectedConversationId !== conversationIdSync) {
    setConversationIdSync(selectedConversationId)
    dispatchConvUi({ type: 'reset-for-conversation' })
    setReportFeedback('')
    if (!selectedConversationId) {
      loadMessagesGenRef.current += 1
      setMessages([])
      setFailedAvatarKeys(new Set())
    } else {
      void loadConversationMessages(selectedConversationId)
    }
  }

  function handleSelectConversation(conversationId) {
    setSelectedConversationId(conversationId)
    if (isMobileDm) setMobileChatOpen(true)
    setReportFeedback('')
    if (!conversationId) {
      loadMessagesGenRef.current += 1
      setMessages([])
      setFailedAvatarKeys(new Set())
      dispatchConvUi({ type: 'reset-for-conversation' })
      return
    }
    dispatchConvUi({ type: 'reset-for-conversation' })
    void loadConversationMessages(conversationId)
  }

  function closeMobileChat() {
    setMobileChatOpen(false)
    setMobileDragOffset(0)
  }

  function onMobileSheetTouchStart(event) {
    if (!isMobileDm || !mobileChatOpen) return
    const y = event.touches?.[0]?.clientY
    if (typeof y !== 'number') return
    mobileTouchStartYRef.current = y
    mobileDraggingRef.current = true
  }

  function onMobileSheetTouchMove(event) {
    if (!isMobileDm || !mobileDraggingRef.current) return
    const y = event.touches?.[0]?.clientY
    const start = mobileTouchStartYRef.current
    if (typeof y !== 'number' || typeof start !== 'number') return
    const delta = Math.max(0, y - start)
    setMobileDragOffset(Math.min(delta, 180))
  }

  function onMobileSheetTouchEnd() {
    if (!isMobileDm) return
    mobileDraggingRef.current = false
    const shouldClose = mobileDragOffset > 90
    if (shouldClose) {
      closeMobileChat()
    } else {
      setMobileDragOffset(0)
    }
    mobileTouchStartYRef.current = null
  }

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !selectedConversationId) return
    socket.emit('join_direct_conversation', selectedConversationId)
    const onMessage = (msg) => {
      if (String(msg.conversation_id) !== String(selectedConversationId)) return
      setMessages((prev) => {
        const cleaned = prev.filter((m) => {
          if (!m._optimistic) return true
          if (Number(m.sender_id) !== Number(msg.sender_id)) return true
          return String(m.content || '').trim() !== String(msg.content || '').trim()
        })
        if (cleaned.some((m) => m.id === msg.id)) return cleaned
        return [...cleaned, msg]
      })
    }
    const onTyping = (payload) => {
      if (String(payload?.conversation_id) !== String(selectedConversationId)) return
      const myId = currentUserIdRef.current
      if (myId != null && Number(payload.user_id) === myId) return
      if (payload.typing) {
        dispatchConvUi({ type: 'set-peer-typing', name: payload.username || `user_${payload.user_id}` })
      } else {
        dispatchConvUi({ type: 'set-peer-typing', name: '' })
      }
    }
    const onUpdated = (msg) => {
      if (String(msg.conversation_id) !== String(selectedConversationId)) return
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)))
    }
    const onReconnect = () => {
      api
        .get(`/dm/conversations/${selectedConversationId}/messages`)
        .then(({ data }) => setMessages(data))
        .catch(() => {})
    }
    socket.on('receive_direct_message', onMessage)
    socket.on('direct_typing', onTyping)
    socket.on('direct_message_updated', onUpdated)
    socket.on('reconnect', onReconnect)
    return () => {
      socket.off('reconnect', onReconnect)
      socket.off('direct_typing', onTyping)
      socket.off('direct_message_updated', onUpdated)
      socket.off('receive_direct_message', onMessage)
      socket.emit('leave_direct_conversation', selectedConversationId)
    }
  }, [selectedConversationId])

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const onNotify = ({ conversationId, message }) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === conversationId)
        if (idx < 0) return prev
        const updated = {
          ...prev[idx],
          last_message: message.content,
          last_message_at: message.created_at,
        }
        const copy = [...prev]
        copy.splice(idx, 1)
        return [updated, ...copy]
      })
      if (String(conversationId) === String(selectedConversationId)) {
        setMessages((prev) => {
          const cleaned = prev.filter((m) => {
            if (!m._optimistic) return true
            if (Number(m.sender_id) !== Number(message.sender_id)) return true
            return String(m.content || '').trim() !== String(message.content || '').trim()
          })
          if (cleaned.some((m) => m.id === message.id)) return cleaned
          return [...cleaned, message]
        })
      }
    }
    socket.on('direct_message_notification', onNotify)
    return () => {
      socket.off('direct_message_notification', onNotify)
    }
  }, [selectedConversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedConversationId])

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  )

  async function searchUsers(e) {
    e.preventDefault()
    if (!userQuery.trim()) return
    setError('')
    try {
      const { data } = await api.get('/dm/users', { params: { q: userQuery.trim() } })
      setResults(data)
    } catch {
      setError(t('dm.errSearchUsers'))
    }
  }

  async function startConversation(targetUserId) {
    setError('')
    try {
      const { data } = await api.post('/dm/conversations', { target_user_id: targetUserId })
      setSelectedConversationId(data.id)
      if (isMobileDm) setMobileChatOpen(true)
      setResults([])
      setUserQuery('')
      dispatchConvUi({ type: 'reset-for-conversation' })
      void loadConversationMessages(data.id)
      await loadConversations()
    } catch {
      setError(t('dm.errOpenConversation'))
    }
  }

  function emitDmTyping(typing) {
    const s = getSocket()
    if (!s || !selectedConversationId) return
    s.emit('direct_typing', { conversation_id: selectedConversationId, typing })
  }

  function onComposerChange(e) {
    const v = e.target.value
    setText(v)
    dispatchConvUi({ type: 'reset-composer-history-index' })
    const s = getSocket()
    if (!s || !selectedConversationId) return
    const now = Date.now()
    if (v.trim() && now - lastDmTypingEmitRef.current > 2000) {
      emitDmTyping(true)
      lastDmTypingEmitRef.current = now
    }
    clearTimeout(dmTypingStopTimerRef.current)
    dmTypingStopTimerRef.current = setTimeout(() => emitDmTyping(false), 3000)
  }

  function jumpToDmMessage(messageId) {
    const node = messageNodeRef.current.get(messageId)
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function runDmSearch(e) {
    e?.preventDefault?.()
    const q = dmSearchQuery.trim()
    if (q.length < 2 || !selectedConversationId) return
    setDmSearchBusy(true)
    try {
      const { data } = await api.get(`/dm/conversations/${selectedConversationId}/messages/search`, {
        params: { q },
      })
      dispatchConvUi({ type: 'set-dm-search-results', results: Array.isArray(data) ? data : [] })
    } catch {
      dispatchConvUi({ type: 'set-dm-search-results', results: [] })
    } finally {
      setDmSearchBusy(false)
    }
  }

  function startDmReply(m) {
    const snippet =
      m.content && m.content !== '(imagen)'
        ? m.content.slice(0, 120)
        : m.image_url
          ? t('common.image')
          : ''
    dispatchConvUi({ type: 'set-reply', reply: { id: m.id, username: m.username, snippet } })
  }

  function cancelDmEdit() {
    dispatchConvUi({ type: 'cancel-edit' })
  }

  async function showDmEditHistory(dmMessageId) {
    try {
      const { data } = await api.get(`/dm/messages/${dmMessageId}/edit-history`)
      const items = Array.isArray(data) ? data : []
      dispatchConvUi({ type: 'open-edit-history', entries: items.slice(0, 50) })
    } catch (err) {
      if (err?.response?.status === 403) {
        setError(t('dm.errEditHistory403'))
        return
      }
      setError(t('dm.errEditHistory'))
    }
  }

  function saveDmEdit() {
    if (!editingMessageId || !editingDraft.trim()) return
    const s = getSocket()
    const id = editingMessageId
    const content = editingDraft.trim()
    setError('')
    if (s) {
      s.emit('edit_direct_message', { dm_message_id: id, content }, (ack) => {
        if (ack?.error === 'blocked_content') {
          setError(t('dm.errBlocked'))
          return
        }
        if (ack?.error === 'forbidden' || ack?.error === 'not_found') {
          setError(t('dm.errEditForbidden'))
          return
        }
        if (ack?.ok) cancelDmEdit()
      })
      return
    }
    api
      .patch(`/dm/messages/${id}`, { content })
      .then(({ data }) => {
        setMessages((prev) => prev.map((m) => (m.id === data.id ? { ...m, ...data } : m)))
        cancelDmEdit()
      })
      .catch((err) => {
        const code = err?.response?.data?.error
        setError(
          code === 'blocked_content'
            ? err?.response?.data?.message || t('dm.errEditSaveBlocked')
            : err?.response?.data?.error || t('dm.errEditSave')
        )
      })
  }

  async function sendMessage() {
    if (!selectedConversationId || !text.trim()) return
    const content = text.trim()
    setError('')
    clearTimeout(dmTypingStopTimerRef.current)
    emitDmTyping(false)
    const rawReplyId = replyTo?.id
    const replyToId =
      rawReplyId != null &&
      (typeof rawReplyId === 'number' || (typeof rawReplyId === 'string' && /^\d+$/.test(rawReplyId)))
        ? Number(rawReplyId)
        : null
    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const optimistic = {
      id: `pending-${clientId}`,
      _optimistic: true,
      _clientId: clientId,
      conversation_id: selectedConversationId,
      sender_id: user?.id,
      username: user?.username || 'You',
      content,
      created_at: new Date().toISOString(),
      image_url: null,
      avatar_url: user?.avatar_url || null,
      reply_to_id: replyToId,
      reply_preview_username: replyTo?.username || null,
      reply_preview_content: replyTo?.snippet || null,
    }
    const savedDmReply = replyTo
    setMessages((prev) => [...prev, optimistic])
    setText('')
    dispatchConvUi({ type: 'clear-reply' })
    const socket = getSocket()
    if (socket) {
      socket.emit(
        'send_direct_message',
        {
          conversation_id: selectedConversationId,
          content,
          ...(replyToId ? { reply_to_message_id: replyToId } : {}),
        },
        (ack) => {
          setMessages((prev) => prev.filter((m) => m._clientId !== clientId))
          if (ack?.error === 'rate_limited') {
            setError(t('dm.errDmTooFast'))
            setText(content)
            dispatchConvUi({ type: 'set-reply', reply: savedDmReply })
            return
          }
          if (ack?.error === 'blocked_content') {
            setError(t('dm.errBlocked'))
            setText(content)
            dispatchConvUi({ type: 'set-reply', reply: savedDmReply })
            return
          }
          if (ack?.error === 'save_failed') {
            setError(t('dm.errSaveFailed'))
            setText(content)
            dispatchConvUi({ type: 'set-reply', reply: savedDmReply })
            return
          }
          if (ack?.ok && ack.message) {
            setMessages((prev) =>
              prev.some((m) => m.id === ack.message.id) ? prev : [...prev, ack.message]
            )
          }
        }
      )
      return
    }
    try {
      const { data } = await api.post(`/dm/conversations/${selectedConversationId}/messages`, {
        content,
        ...(replyToId ? { reply_to_message_id: replyToId } : {}),
      })
      setMessages((prev) => {
        const without = prev.filter((m) => m._clientId !== clientId)
        if (without.some((m) => m.id === data.id)) return without
        return [...without, data]
      })
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._clientId !== clientId))
      setText(content)
      dispatchConvUi({ type: 'set-reply', reply: savedDmReply })
      const code = err?.response?.data?.error
      setError(
        code === 'blocked_content'
          ? err?.response?.data?.message || t('dm.errSendBlocked')
          : err?.response?.data?.error || t('dm.errSend')
      )
    }
  }

  async function uploadDmImage(file) {
    if (!file || !selectedConversationId) return
    const fileError = validateUploadFile(file)
    if (fileError) {
      setError(fileError)
      return
    }
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const token = getAccessToken()
      const res = await fetch(`${baseURL}/upload/direct/${selectedConversationId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'upload')
      const socket = getSocket()
      if (socket) {
        socket.emit(
          'send_direct_message',
          {
            conversation_id: selectedConversationId,
            content: '',
            image_url: data.url,
          },
          (ack) => {
            if (ack?.error === 'rate_limited') {
              setError(t('dm.errDmTooFast'))
            }
            if (ack?.error === 'blocked_content') {
              setError(t('dm.errBlocked'))
            }
          }
        )
      } else {
        const { data: message } = await api.post(
          `/dm/conversations/${selectedConversationId}/messages`,
          {
            content: '',
            image_url: data.url,
          }
        )
        setMessages((prev) => [...prev, message])
      }
    } catch {
      setError(t('dm.errUploadSend'))
    } finally {
      setUploading(false)
    }
  }

  async function onFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    await uploadDmImage(file)
  }

  async function onPickFromMobileDevice() {
    const file = await pickImageFileFromDevice()
    if (!file) return
    await uploadDmImage(file)
  }

  function onDmDragEnter(e) {
    if (!selectedConversationId) return
    if (!e.dataTransfer?.types?.includes('Files')) return
    e.preventDefault()
    fileDragDepthRef.current += 1
    setFileDragOver(true)
  }

  function onDmDragLeave(_e) {
    fileDragDepthRef.current -= 1
    if (fileDragDepthRef.current <= 0) {
      fileDragDepthRef.current = 0
      setFileDragOver(false)
    }
  }

  function onDmDragOver(e) {
    if (!selectedConversationId) return
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  async function onDmDrop(e) {
    if (!selectedConversationId) return
    fileDragDepthRef.current = 0
    setFileDragOver(false)
    if (!e.dataTransfer?.types?.includes('Files')) return
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    await uploadDmImage(file)
  }

  async function reportDmMessage(dmMessageId) {
    if (typeof dmMessageId === 'string' && dmMessageId.startsWith('pending-')) return
    const reason = window.prompt(t('dm.promptReport'))
    if (!reason || !reason.trim()) return
    setReportFeedback('')
    try {
      await api.post(`/dm/messages/${dmMessageId}/report`, { reason: reason.trim() })
      setReportFeedback(t('dm.reportSent'))
    } catch (err) {
      const msg =
        err?.response?.status === 429
          ? t('dm.report429')
          : err?.response?.data?.error || t('dm.reportFailed')
      setReportFeedback(msg)
    }
  }

  function validateUploadFile(file) {
    if (!file) return t('dm.uploadNoFile')
    if (!ALLOWED_DM_IMAGE_MIME_TYPES.has(String(file.type || '').toLowerCase())) {
      return t('dm.uploadBadType')
    }
    if (file.size > MAX_DM_UPLOAD_SIZE_BYTES) {
      return t('dm.uploadTooBig')
    }
    return ''
  }

  async function refreshLatestDirectMessages() {
    if (!selectedConversationId) return
    try {
      const latestId = messages.reduce((max, m) => {
        const n = Number(m?.id)
        return Number.isFinite(n) ? Math.max(max, n) : max
      }, 0)
      const params = latestId > 0 ? { after: latestId } : undefined
      const { data } = await api.get(`/dm/conversations/${selectedConversationId}/messages`, { params })
      const incoming = Array.isArray(data) ? data : []
      if (!incoming.length) return
      setMessages((prev) => {
        const map = new Map(prev.map((m) => [String(m.id), m]))
        for (const m of incoming) map.set(String(m.id), m)
        return [...map.values()].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      })
    } catch {
      setError(t('dm.errRefresh'))
    }
  }

  return {
    t,
    conversations,
    selectedConversationId,
    messages,
    text,
    setText,
    userQuery,
    setUserQuery,
    results,
    error,
    reportFeedback,
    uploading,
    convUi,
    dispatchConvUi,
    peerTypingName,
    replyTo,
    editingMessageId,
    editingDraft,
    dmSearchOpen,
    dmSearchQuery,
    dmSearchResults,
    editHistoryModalOpen,
    editHistoryEntries,
    composerHistoryIndex,
    dmSearchBusy,
    failedAvatarKeys,
    setFailedAvatarKeys,
    isMobileDm,
    mobileChatOpen,
    mobileDragOffset,
    messageNodeRef,
    bottomRef,
    dmComposerInputRef,
    fileDragOver,
    composerHistoryMatches,
    composerHistorySafeIndex,
    composerHighlightId,
    selectedConversation,
    searchUsers,
    startConversation,
    handleSelectConversation,
    closeMobileChat,
    onMobileSheetTouchStart,
    onMobileSheetTouchMove,
    onMobileSheetTouchEnd,
    onComposerChange,
    scrollComposerHighlight,
    runDmSearch,
    jumpToDmMessage,
    startDmReply,
    cancelDmEdit,
    saveDmEdit,
    showDmEditHistory,
    sendMessage,
    reportDmMessage,
    onFile,
    onPickFromMobileDevice,
    onDmDragEnter,
    onDmDragLeave,
    onDmDragOver,
    onDmDrop,
    refreshLatestDirectMessages,
    formatConversationPreview,
    isPresenceOnline,
  }
}
