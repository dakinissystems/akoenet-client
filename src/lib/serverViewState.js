export function normalizeVoicePresencePayload(presence) {
  if (!presence || typeof presence !== 'object') return {}
  const out = {}
  Object.keys(presence).forEach((k) => {
    const v = presence[k]
    out[String(k)] = Array.isArray(v) ? v : []
  })
  return out
}

export function collapsedCategoryStorageKey(serverId) {
  return `akoenet_collapsed_${serverId}`
}

export function collapsedCategoryLegacyKeys(serverId) {
  return [`Akonet_collapsed_${serverId}`, `akonet_collapsed_${serverId}`, `akoe:collapsed:${serverId}`]
}

export const MEMBERS_INLINE_MEDIA = '(min-width: 1201px)'

export function subscribeMembersInlineMedia(onChange) {
  const mq = window.matchMedia(MEMBERS_INLINE_MEDIA)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

export function getMembersInlineMediaSnapshot() {
  return window.matchMedia(MEMBERS_INLINE_MEDIA).matches
}

function useShowInlineMembersPanel() {
  return useSyncExternalStore(
    subscribeMembersInlineMedia,
    getMembersInlineMediaSnapshot,
    () => true
  )
}

export const SERVER_WORKSPACE_INITIAL = {
  channels: [],
  categories: [],
  members: [],
  canManageMemberRoles: false,
  activeChannelId: null,
  emojis: [],
  banStatus: null,
}

export function serverWorkspaceReducer(state, action) {
  switch (action.type) {
    case 'reset-for-server':
      return { ...SERVER_WORKSPACE_INITIAL }
    case 'bootstrap':
      return { ...state, ...action.payload }
    case 'patch': {
      const patch = typeof action.patch === 'function' ? action.patch(state) : action.patch
      return { ...state, ...patch }
    }
    default:
      return state
  }
}
