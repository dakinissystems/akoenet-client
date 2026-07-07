import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'src')
const chatPath = path.join(root, 'components/Chat.jsx')
const lines = fs.readFileSync(chatPath, 'utf8').split(/\r?\n/)
const hookBody = lines.slice(109, 776).join('\n')

const hookHeader = `import { useEffect, useEffectEvent, useMemo, useReducer, useRef, useState } from 'react'
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
`

const hookFooter = `
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
`

fs.writeFileSync(path.join(root, 'hooks/useChatChannel.js'), hookHeader + hookBody + hookFooter)
console.log('done')
