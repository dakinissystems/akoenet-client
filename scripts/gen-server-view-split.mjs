import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'src')
const lines = fs.readFileSync(path.join(root, 'pages/ServerView.jsx'), 'utf8').split(/\r?\n/)

fs.writeFileSync(
  path.join(root, 'lib/serverViewState.js'),
  `${lines
    .slice(28, 90)
    .join('\n')
    .replace(/^function normalizeVoicePresencePayload/m, 'export function normalizeVoicePresencePayload')
    .replace(/^function collapsedCategoryStorageKey/m, 'export function collapsedCategoryStorageKey')
    .replace(/^function collapsedCategoryLegacyKeys/m, 'export function collapsedCategoryLegacyKeys')
    .replace(/^const MEMBERS_INLINE_MEDIA/m, 'export const MEMBERS_INLINE_MEDIA')
    .replace(/^function subscribeMembersInlineMedia/m, 'export function subscribeMembersInlineMedia')
    .replace(/^function getMembersInlineMediaSnapshot/m, 'export function getMembersInlineMediaSnapshot')
    .replace(/^const SERVER_WORKSPACE_INITIAL/m, 'export const SERVER_WORKSPACE_INITIAL')
    .replace(/^function serverWorkspaceReducer/m, 'export function serverWorkspaceReducer')}
`
)

const hookBody = lines.slice(92, 748).join('\n')
const viewBody = lines.slice(749).join('\n')

const hookHeader = `import {
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
`

const hookFooter = `
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
    channelSettingsTarget,
    membersDrawerOpen,
    closeMembersPanel,
    openMembersPanel,
    membersPanelAutoClose,
    voicePresenceByChannel,
    voiceConnectedCountByChannel,
    screenSharingUserIds,
    showInlineMembersPanel,
    setAppearOnline,
    activeChannel,
  }
}
`

fs.writeFileSync(path.join(root, 'hooks/useServerView.js'), hookHeader + hookBody + hookFooter)

fs.writeFileSync(
  path.join(root, 'components/ServerViewLayout.jsx'),
  `import ServerSidebar from './ServerSidebar'
import ChannelList from './ChannelList'
import Chat from './Chat'
import MembersPanel from './MembersPanel'
import MembersDrawer from './MembersDrawer'
import UserSettingsModal from './UserSettingsModal'
import ServerSettingsModal from './ServerSettingsModal'
import ChannelSettingsModal from './ChannelSettingsModal'
import AppChrome from './AppChrome'

export default function ServerViewLayout(props) {
  const {
    t, id, navigate, user, signOut, servers, channels, categories, members, canManageMemberRoles,
    activeChannelId, emojis, banStatus, setActiveChannelId, serverName, serverTag, createChannel,
    createCategory, deleteCategory, deleteChannel, moveChannel, moveCategory, collapsedCategories,
    toggleCategoryCollapse, userSettingsOpen, setUserSettingsOpen, userSettingsSection, setUserSettingsSection,
    serverSettingsOpen, setServerSettingsOpen, channelSettingsOpen, setChannelSettingsOpen, channelSettingsTarget,
    membersDrawerOpen, closeMembersPanel, openMembersPanel, membersPanelAutoClose, voicePresenceByChannel,
    voiceConnectedCountByChannel, screenSharingUserIds, showInlineMembersPanel, setAppearOnline, activeChannel,
  } = props

${lines.slice(749, 914).join('\n')}
}
`
)

fs.writeFileSync(
  path.join(root, 'pages/ServerView.jsx'),
  `import { useServerView } from '../hooks/useServerView'
import ServerViewLayout from '../components/ServerViewLayout'

export default function ServerView() {
  const viewProps = useServerView()
  return <ServerViewLayout {...viewProps} />
}
`
)

console.log('ServerView split done')
