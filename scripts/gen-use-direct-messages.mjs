import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'src')
const srcPath = path.join(root, 'components/DirectMessagesPanel.jsx')
const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/)
const hookBody = lines.slice(28, 738).join('\n')

const hookHeader = `import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
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
`

const hookFooter = `
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
`

fs.writeFileSync(path.join(root, 'hooks/useDirectMessages.js'), hookHeader + hookBody + hookFooter)
console.log('generated useDirectMessages.js')
