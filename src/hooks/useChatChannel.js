import { useEffect, useEffectEvent, useMemo, useReducer, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { getSocket } from '../services/socket'
import { resolveImageUrl } from '../lib/resolveImageUrl'
import { pickImageFileFromDevice } from '../services/mobile-media'
import { getAccessToken } from '../services/session-store'
import { getApiBaseUrl } from '../lib/apiBase'
import {
  ALLOWED_IMAGE_MIME_TYPES,
  CHANNEL_UI_INITIAL,
  MAX_UPLOAD_SIZE_BYTES,
  channelUiReducer,
} from '../lib/chatChannelUi'

const baseURL = getApiBaseUrl()

export function useChatChannel({
  channelId,
  channelName,
  channelType = 'text',
  user,
  members = [],
  emojis = [],
}) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [sendError, setSendError] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [reactionPickerId, setReactionPickerId] = useState(null)
  const [channelUi, dispatchChannelUi] = useReducer(channelUiReducer, CHANNEL_UI_INITIAL)
  const {
    searchOpen,
    searchQuery,
    searchResults,
    replyTo,
    threadRootId,
    editingMessageId,
    editingDraft,
    editHistoryModalOpen,
    editHistoryEntries,
    composerHistoryIndex,
    typingPeers,
  } = channelUi
  const threadRootIdRef = useRef(null)
  const bottomRef = useRef(null)
  const messageNodeRef = useRef(null)
  if (messageNodeRef.current == null) {
    messageNodeRef.current = new Map()
  }
  const composerInputRef = useRef(null)
  const fileDragDepthRef = useRef(0)
  const [fileDragOver, setFileDragOver] = useState(false)
  const emojiPickerWrapRef = useRef(null)
  const reactionPickerWrapRef = useRef(null)
  const typingStopTimerRef = useRef(null)
  const lastTypingEmitRef = useRef(0)
  const currentUserIdRef = useRef(null)
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 720px)').matches : false
  )
  const [failedAvatarKeys, setFailedAvatarKeys] = useState(() => new Set())
  const loadMessagesGenRef = useRef(0)
  const [searchBusy, setSearchBusy] = useState(false)
  const [channelIdSync, setChannelIdSync] = useState(channelId)

  async function loadChannelMessages(nextChannelId, nextThreadRootId) {
    if (!nextChannelId) return
    const gen = ++loadMessagesGenRef.current
    try {
      const params = nextThreadRootId ? { thread_root: nextThreadRootId } : {}
      const { data } = await api.get(`/messages/channel/${nextChannelId}`, { params })
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

  function openThread(rootId) {
    threadRootIdRef.current = rootId
    dispatchChannelUi({ type: 'open-thread', threadRootId: rootId })
    void loadChannelMessages(channelId, rootId)
  }

  function closeThread() {
    threadRootIdRef.current = null
    dispatchChannelUi({ type: 'close-thread' })
    void loadChannelMessages(channelId, null)
  }

  if (channelId !== channelIdSync) {
    setChannelIdSync(channelId)
    dispatchChannelUi({ type: 'reset-for-channel' })
    threadRootIdRef.current = null
    if (!channelId) {
      loadMessagesGenRef.current += 1
      setMessages([])
      setFailedAvatarKeys(new Set())
    } else {
      void loadChannelMessages(channelId, null)
    }
  }

  useEffect(() => {
    currentUserIdRef.current = user?.id != null ? Number(user.id) : null
  }, [user?.id])

  useEffect(() => {
    function onComposerInsert(e) {
      const t = e.detail?.text
      if (typeof t !== 'string' || !channelId) return
      const s = t.trim()
      if (!s) return
      setText((prev) => (prev && prev.trim() ? `${prev.trimEnd()}\n${s}` : s))
      requestAnimationFrame(() => composerInputRef.current?.focus())
    }
    window.addEventListener('akoenet-composer-insert', onComposerInsert)
    return () => window.removeEventListener('akoenet-composer-insert', onComposerInsert)
  }, [channelId, channelType])

  threadRootIdRef.current = threadRootId

  const emojiMap = Object.fromEntries(emojis.map((e) => [e.name, resolveImageUrl(e.image_url)]))
  const memberAvatarByUserId = useMemo(() => {
    const map = new Map()
    for (const m of members || []) {
      if (m?.id != null && m?.avatar_url) {
        map.set(Number(m.id), m.avatar_url)
      }
    }
    return map
  }, [members])

  /** Messages whose text starts with the current composer prefix (oldest first). */
  const composerHistoryMatches = useMemo(() => {
    if (!channelId) return []
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
  }, [messages, text, channelId])

  const composerHistorySafeIndex = Math.min(
    composerHistoryIndex,
    Math.max(0, composerHistoryMatches.length - 1)
  )
  const composerHighlightId =
    composerHistoryMatches.length > 0 ? composerHistoryMatches[composerHistorySafeIndex]?.id : null

  const onReceiveMessage = useEffectEvent((msg) => {
    if (String(msg.channel_id) !== String(channelId)) return
    const tr = threadRootIdRef.current
    if (tr == null) {
      if (msg.thread_root_message_id) {
        const rootId = Number(msg.thread_root_message_id)
        setMessages((prev) =>
          prev.map((m) =>
            Number(m.id) === rootId
              ? { ...m, thread_reply_count: (Number(m.thread_reply_count) || 0) + 1 }
              : m
          )
        )
        return
      }
    } else if (Number(msg.id) !== Number(tr) && Number(msg.thread_root_message_id) !== Number(tr)) {
      return
    }
    setMessages((prev) => {
      const cleaned = prev.filter((m) => {
        if (!m._optimistic) return true
        if (Number(m.user_id) !== Number(msg.user_id)) return true
        return String(m.content).trim() !== String(msg.content).trim()
      })
      if (cleaned.some((m) => m.id === msg.id)) return cleaned
      const next = [...cleaned, msg]
      if (
        tr != null &&
        Number(msg.thread_root_message_id) === Number(tr) &&
        Number(msg.id) !== Number(tr)
      ) {
        return next.map((m) =>
          Number(m.id) === Number(tr)
            ? { ...m, thread_reply_count: (Number(m.thread_reply_count) || 0) + 1 }
            : m
        )
      }
      return next
    })
  })

  const onMessageDeleted = useEffectEvent(({ id, channel_id: chId }) => {
    if (String(chId) !== String(channelId)) return
    setMessages((prev) => prev.filter((m) => m.id !== id))
  })

  const onMessageUpdated = useEffectEvent((msg) => {
    if (String(msg.channel_id) !== String(channelId)) return
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id
          ? {
              ...m,
              ...msg,
              reactions: Array.isArray(msg.reactions) ? msg.reactions : m.reactions,
            }
          : m
      )
    )
  })

  const onReactionsUpdated = useEffectEvent(({ message_id: messageId, channel_id: chId, reactions }) => {
    if (String(chId) !== String(channelId)) return
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions: reactions || [] } : m)))
  })

  const onChannelTyping = useEffectEvent((payload) => {
    if (String(payload?.channel_id) !== String(channelId)) return
    const myId = currentUserIdRef.current
    if (myId != null && Number(payload.user_id) === myId) return
    dispatchChannelUi({
      type: 'update-typing-peers',
      updater: (prev) => {
        const next = { ...prev }
        const uid = String(payload.user_id)
        if (payload.typing) {
          next[uid] = payload.username || `user_${uid}`
        } else {
          delete next[uid]
        }
        return next
      },
    })
  })

  const onSocketReconnect = useEffectEvent(() => {
    const params = threadRootIdRef.current ? { thread_root: threadRootIdRef.current } : {}
    api
      .get(`/messages/channel/${channelId}`, { params })
      .then(({ data }) => setMessages(data))
      .catch(() => {})
  })

  useEffect(() => {
    const s = getSocket()
    if (!s || !channelId) return

    s.emit('join_channel', channelId)

    s.on('receive_message', onReceiveMessage)
    s.on('message_deleted', onMessageDeleted)
    s.on('message_updated', onMessageUpdated)
    s.on('message_reactions_updated', onReactionsUpdated)
    s.on('channel_typing', onChannelTyping)
    s.on('reconnect', onSocketReconnect)
    return () => {
      s.off('reconnect', onSocketReconnect)
      s.off('receive_message', onReceiveMessage)
      s.off('message_deleted', onMessageDeleted)
      s.off('message_updated', onMessageUpdated)
      s.off('message_reactions_updated', onReactionsUpdated)
      s.off('channel_typing', onChannelTyping)
      s.emit('leave_channel', channelId)
    }
  }, [channelId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, channelId])

  useEffect(() => {
    function onDocumentClick(event) {
      if (emojiPickerWrapRef.current && !emojiPickerWrapRef.current.contains(event.target)) {
        setPickerOpen(false)
      }
      if (reactionPickerWrapRef.current && !reactionPickerWrapRef.current.contains(event.target)) {
        setReactionPickerId(null)
      }
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setPickerOpen(false)
        setReactionPickerId(null)
      }
    }
    document.addEventListener('mousedown', onDocumentClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocumentClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(max-width: 720px)')
    const onChange = (e) => setIsMobileViewport(Boolean(e.matches))
    setIsMobileViewport(Boolean(mq.matches))
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }
    mq.addListener(onChange)
    return () => mq.removeListener(onChange)
  }, [])

  function emitTyping(typing) {
    const s = getSocket()
    if (!s || !channelId) return
    s.emit('channel_typing', { channel_id: channelId, typing })
  }

  function handleComposerChange(e) {
    const v = e.target.value
    setText(v)
    dispatchChannelUi({ type: 'reset-composer-history-index' })
    if (!channelId) return
    const s = getSocket()
    if (!s) return
    const now = Date.now()
    if (v.trim() && now - lastTypingEmitRef.current > 2000) {
      emitTyping(true)
      lastTypingEmitRef.current = now
    }
    clearTimeout(typingStopTimerRef.current)
    typingStopTimerRef.current = setTimeout(() => {
      emitTyping(false)
    }, 3000)
  }

  function send() {
    const s = getSocket()
    if (!s || !channelId || !text.trim()) return
    clearTimeout(typingStopTimerRef.current)
    emitTyping(false)
    setSendError('')
    const toSend = text.trim()
    const clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const rawReplyId = replyTo?.id
    const replyId =
      rawReplyId != null &&
      (typeof rawReplyId === 'number' || (typeof rawReplyId === 'string' && /^\d+$/.test(rawReplyId)))
        ? Number(rawReplyId)
        : null
    const optimistic = {
      id: `pending-${clientId}`,
      _optimistic: true,
      _clientId: clientId,
      channel_id: channelId,
      user_id: user?.id,
      username: user?.username || 'You',
      content: toSend,
      created_at: new Date().toISOString(),
      reactions: [],
      avatar_url: user?.avatar_url || null,
      reply_to_id: replyId,
      reply_preview_username: replyTo?.username || null,
      reply_preview_content: replyTo?.snippet || null,
    }
    const savedReply = replyTo
    setMessages((prev) => [...prev, optimistic])
    setText('')
    setPickerOpen(false)
    dispatchChannelUi({ type: 'clear-reply' })
    s.emit(
      'send_message',
      {
        channel_id: channelId,
        content: toSend,
        ...(replyId ? { reply_to_message_id: replyId } : {}),
        ...(threadRootId ? { thread_root_message_id: threadRootId } : {}),
      },
      (ack) => {
        setMessages((prev) => prev.filter((m) => m._clientId !== clientId))
        if (ack?.error === 'rate_limited') {
          setSendError(t('chat.errRateLimited'))
          setText(toSend)
          dispatchChannelUi({ type: 'set-reply', reply: savedReply })
          return
        }
        if (ack?.error === 'blocked_content') {
          setSendError(t('chat.errBlocked'))
          setText(toSend)
          dispatchChannelUi({ type: 'set-reply', reply: savedReply })
          return
        }
        if (ack?.error === 'duplicate_message') {
          setSendError(ack?.message || t('chat.errDuplicate'))
          setText(toSend)
          dispatchChannelUi({ type: 'set-reply', reply: savedReply })
          return
        }
        if (ack?.error === 'save_failed') {
          setSendError(t('chat.errSaveFailed'))
          setText(toSend)
          dispatchChannelUi({ type: 'set-reply', reply: savedReply })
          return
        }
        if (ack?.ok && ack.message) {
          setMessages((prev) => {
            let next = prev
            if (!next.some((m) => m.id === ack.message.id)) {
              next = [...next, { ...ack.message, reactions: ack.message.reactions || [] }]
            }
            if (ack.scheduler_reply && !next.some((m) => m.id === ack.scheduler_reply.id)) {
              next = [...next, { ...ack.scheduler_reply, reactions: ack.scheduler_reply.reactions || [] }]
            }
            if (ack.dice_reply && !next.some((m) => m.id === ack.dice_reply.id)) {
              next = [...next, { ...ack.dice_reply, reactions: ack.dice_reply.reactions || [] }]
            }
            return next
          })
        }
      }
    )
  }

  function insertEmojiShortcode(name) {
    const shortcode = `:${name}:`
    setText((prev) => {
      if (!prev.trim()) return `${shortcode} `
      return `${prev} ${shortcode} `
    })
  }

  function deleteMessage(messageId) {
    if (typeof messageId === 'string' && messageId.startsWith('pending-')) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      return
    }
    const s = getSocket()
    if (!s) return
    s.emit('delete_message', { message_id: messageId }, (ack) => {
      if (ack?.error === 'forbidden') {
        setSendError(t('chat.errDeleteForbidden'))
      }
    })
  }

  function pinMessage(messageId, pin) {
    const s = getSocket()
    if (!s) return
    s.emit('pin_message', { message_id: messageId, pin }, (ack) => {
      if (ack?.error === 'forbidden') {
        setSendError(t('chat.errPinForbidden'))
      }
    })
  }

  async function runSearch(e) {
    e?.preventDefault?.()
    const q = searchQuery.trim()
    if (q.length < 2 || !channelId) return
    setSearchBusy(true)
    try {
      const { data } = await api.get(`/messages/channel/${channelId}/search`, { params: { q } })
      dispatchChannelUi({ type: 'set-search-results', results: Array.isArray(data) ? data : [] })
    } catch {
      dispatchChannelUi({ type: 'set-search-results', results: [] })
    } finally {
      setSearchBusy(false)
    }
  }

  function startReply(m) {
    const snippet =
      m.content && m.content !== '(imagen)'
        ? m.content.slice(0, 120)
        : m.image_url
          ? t('common.image')
          : ''
    dispatchChannelUi({ type: 'set-reply', reply: { id: m.id, username: m.username, snippet } })
  }

  function cancelEdit() {
    dispatchChannelUi({ type: 'cancel-edit' })
  }

  async function showEditHistory(messageId) {
    try {
      const { data } = await api.get(`/messages/${messageId}/edit-history`)
      const items = Array.isArray(data) ? data : []
      dispatchChannelUi({ type: 'open-edit-history', entries: items.slice(0, 50) })
    } catch (err) {
      if (err?.response?.status === 403) {
        setSendError(t('chat.errEditHistory403'))
        return
      }
      setSendError(t('chat.errEditHistory'))
    }
  }

  function saveEdit() {
    if (!editingMessageId || !editingDraft.trim()) return
    const s = getSocket()
    if (!s) return
    setSendError('')
    const id = editingMessageId
    const content = editingDraft.trim()
    s.emit('edit_message', { message_id: id, content }, (ack) => {
      if (ack?.error === 'blocked_content') {
        setSendError(t('chat.errEditBlocked'))
        return
      }
      if (ack?.error === 'forbidden' || ack?.error === 'not_found') {
        setSendError(t('chat.errEditForbidden'))
        return
      }
      if (ack?.ok) {
        cancelEdit()
      }
    })
  }

  async function reportMessage(messageId) {
    const reason = window.prompt(t('chat.promptReport'))
    if (!reason || !reason.trim()) return
    try {
      await api.post(`/messages/${messageId}/report`, { reason: reason.trim() })
      setSendError(t('chat.reportSent'))
    } catch (err) {
      const msg =
        err?.response?.status === 429
          ? t('chat.report429')
          : err?.response?.data?.error || t('chat.reportFailed')
      setSendError(msg)
    }
  }

  async function exportHistory(format) {
    const token = getAccessToken()
    if (!token || !channelId) return
    try {
      const res = await fetch(`${baseURL}/messages/channel/${channelId}/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `channel-${channelId}-messages.${format}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      /* ignore */
    }
  }

  async function refreshLatestMessages() {
    if (!channelId) return
    try {
      const latestId = messages.reduce((max, m) => {
        const n = Number(m?.id)
        return Number.isFinite(n) ? Math.max(max, n) : max
      }, 0)
      const params = threadRootId ? { thread_root: threadRootId } : {}
      if (latestId > 0) params.after = latestId
      const { data } = await api.get(`/messages/channel/${channelId}`, { params })
      const incoming = Array.isArray(data) ? data : []
      if (!incoming.length) return
      setMessages((prev) => {
        const map = new Map(prev.map((m) => [String(m.id), m]))
        for (const m of incoming) map.set(String(m.id), m)
        return [...map.values()].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      })
    } catch {
      setSendError(t('chat.errRefresh'))
    }
  }

  function validateUploadFile(file) {
    if (!file) return t('chat.uploadNoFile')
    if (!ALLOWED_IMAGE_MIME_TYPES.has(String(file.type || '').toLowerCase())) {
      return t('chat.uploadBadType')
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return t('chat.uploadTooBig')
    }
    return ''
  }

  async function uploadChannelImage(file) {
    if (!file || !channelId) return
    const fileError = validateUploadFile(file)
    if (fileError) {
      setSendError(fileError)
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const token = getAccessToken()
      const res = await fetch(`${baseURL}/upload/channel/${channelId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'upload')
      const s = getSocket()
      s.emit(
        'send_message',
        {
          channel_id: channelId,
          content: '',
          image_url: data.url,
          ...(threadRootId ? { thread_root_message_id: threadRootId } : {}),
        },
        (ack) => {
          if (ack?.error === 'rate_limited') {
            setSendError(t('chat.errRateLimited'))
          }
          if (ack?.error === 'blocked_content') {
            setSendError(t('chat.errBlocked'))
          }
        }
      )
    } catch {
      /* ignore */
    } finally {
      setUploading(false)
    }
  }

  async function onFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    await uploadChannelImage(file)
  }

  async function onPickFromMobileDevice() {
    const file = await pickImageFileFromDevice()
    if (!file) return
    await uploadChannelImage(file)
  }

  function onChatDragEnter(e) {
    if (!channelId) return
    if (!e.dataTransfer?.types?.includes('Files')) return
    e.preventDefault()
    fileDragDepthRef.current += 1
    setFileDragOver(true)
  }

  function onChatDragLeave(_e) {
    fileDragDepthRef.current -= 1
    if (fileDragDepthRef.current <= 0) {
      fileDragDepthRef.current = 0
      setFileDragOver(false)
    }
  }

  function onChatDragOver(e) {
    if (!channelId) return
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  async function onChatDrop(e) {
    if (!channelId) return
    fileDragDepthRef.current = 0
    setFileDragOver(false)
    if (!e.dataTransfer?.types?.includes('Files')) return
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    await uploadChannelImage(file)
  }
  return {
    t,
    messages,
    text,
    setText,
    uploading,
    sendError,
    pickerOpen,
    setPickerOpen,
    reactionPickerId,
    setReactionPickerId,
    dispatchChannelUi,
    searchOpen,
    searchQuery,
    searchResults,
    replyTo,
    threadRootId,
    editingMessageId,
    editingDraft,
    editHistoryModalOpen,
    editHistoryEntries,
    composerHistoryIndex,
    typingPeers,
    bottomRef,
    messageNodeRef,
    composerInputRef,
    fileDragOver,
    emojiPickerWrapRef,
    reactionPickerWrapRef,
    isMobileViewport,
    failedAvatarKeys,
    setFailedAvatarKeys,
    searchBusy,
    emojiMap,
    memberAvatarByUserId,
    composerHistoryMatches,
    composerHistorySafeIndex,
    composerHighlightId,
    closeThread,
    openThread,
    handleComposerChange,
    send,
    insertEmojiShortcode,
    deleteMessage,
    pinMessage,
    runSearch,
    startReply,
    cancelEdit,
    saveEdit,
    showEditHistory,
    reportMessage,
    exportHistory,
    refreshLatestMessages,
    onFile,
    onPickFromMobileDevice,
    onChatDragEnter,
    onChatDragLeave,
    onChatDragOver,
    onChatDrop,
    scrollComposerHighlight,
  }
}
