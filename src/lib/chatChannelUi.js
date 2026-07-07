export const CHANNEL_UI_INITIAL = {
  searchOpen: false,
  searchQuery: '',
  searchResults: [],
  replyTo: null,
  threadRootId: null,
  editingMessageId: null,
  editingDraft: '',
  editHistoryModalOpen: false,
  editHistoryEntries: [],
  composerHistoryIndex: 0,
  typingPeers: {},
}

export function channelUiReducer(state, action) {
  switch (action.type) {
    case 'reset-for-channel':
      return { ...CHANNEL_UI_INITIAL }
    case 'set-search-open':
      return { ...state, searchOpen: action.open }
    case 'set-search-query':
      return { ...state, searchQuery: action.query }
    case 'set-search-results':
      return { ...state, searchResults: action.results }
    case 'close-search':
      return { ...state, searchOpen: false, searchResults: [] }
    case 'set-reply':
      return { ...state, replyTo: action.reply }
    case 'clear-reply':
      return { ...state, replyTo: null }
    case 'open-thread':
      return { ...state, threadRootId: action.threadRootId }
    case 'close-thread':
      return { ...state, threadRootId: null }
    case 'start-edit':
      return { ...state, editingMessageId: action.id, editingDraft: action.draft }
    case 'cancel-edit':
      return { ...state, editingMessageId: null, editingDraft: '' }
    case 'set-editing-draft':
      return { ...state, editingDraft: action.draft }
    case 'open-edit-history':
      return { ...state, editHistoryModalOpen: true, editHistoryEntries: action.entries }
    case 'close-edit-history':
      return { ...state, editHistoryModalOpen: false, editHistoryEntries: [] }
    case 'set-composer-history-index':
      return { ...state, composerHistoryIndex: action.index }
    case 'reset-composer-history-index':
      return { ...state, composerHistoryIndex: 0 }
    case 'set-typing-peers':
      return { ...state, typingPeers: action.peers }
    case 'update-typing-peers':
      return { ...state, typingPeers: action.updater(state.typingPeers) }
    default:
      return state
  }
}

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])
