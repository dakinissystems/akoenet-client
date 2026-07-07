export const MAX_DM_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024
export const ALLOWED_DM_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

export function isPresenceOnline(status) {
  const s = String(status || '').toLowerCase()
  return s === 'online' || s === 'idle' || s === 'dnd'
}

export const CONVERSATION_UI_INITIAL = {
  peerTypingName: '',
  replyTo: null,
  editingMessageId: null,
  editingDraft: '',
  dmSearchOpen: false,
  dmSearchQuery: '',
  dmSearchResults: [],
  editHistoryModalOpen: false,
  editHistoryEntries: [],
  composerHistoryIndex: 0,
}

export function conversationUiReducer(state, action) {
  switch (action.type) {
    case 'reset-for-conversation':
      return { ...CONVERSATION_UI_INITIAL }
    case 'set-peer-typing':
      return { ...state, peerTypingName: action.name }
    case 'set-reply':
      return { ...state, replyTo: action.reply }
    case 'clear-reply':
      return { ...state, replyTo: null }
    case 'start-edit':
      return { ...state, editingMessageId: action.id, editingDraft: action.draft }
    case 'cancel-edit':
      return { ...state, editingMessageId: null, editingDraft: '' }
    case 'set-editing-draft':
      return { ...state, editingDraft: action.draft }
    case 'toggle-dm-search':
      return { ...state, dmSearchOpen: action.open }
    case 'set-dm-search-query':
      return { ...state, dmSearchQuery: action.query }
    case 'set-dm-search-results':
      return { ...state, dmSearchResults: action.results }
    case 'close-dm-search':
      return { ...state, dmSearchOpen: false, dmSearchResults: [] }
    case 'open-edit-history':
      return { ...state, editHistoryModalOpen: true, editHistoryEntries: action.entries }
    case 'close-edit-history':
      return { ...state, editHistoryModalOpen: false, editHistoryEntries: [] }
    case 'set-composer-history-index':
      return { ...state, composerHistoryIndex: action.index }
    case 'reset-composer-history-index':
      return { ...state, composerHistoryIndex: 0 }
    default:
      return state
  }
}
