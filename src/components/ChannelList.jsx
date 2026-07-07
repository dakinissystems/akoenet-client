import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDismissiblePopover } from '../hooks/useDismissiblePopover'
import SchedulerUpcomingWidget from './SchedulerUpcomingWidget'
import ChannelTopCreatePanel from './ChannelTopCreatePanel'
import ChannelListHeader from './ChannelListHeader'
import ChannelListRow from './ChannelListRow'
import ChannelCategoryBlock from './ChannelCategoryBlock'

const EMPTY_VOICE_PRESENCE = {}
const EMPTY_SCREEN_SHARING_IDS = []

export default function ChannelList({
  serverName,
  serverTag = null,
  categories,
  channels,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
  onCreateCategory,
  onDeleteCategory,
  onDeleteChannel,
  onMoveChannel,
  onMoveCategory,
  collapsedCategories,
  onToggleCategory,
  user,
  onLogout,
  onOpenUserSettings,
  onOpenServerSettings,
  onOpenAdminDashboard,
  onSetAppearOnline,
  schedulerStreamerUsername,
  voicePresence = EMPTY_VOICE_PRESENCE,
  voiceScreenSharingUserIds = EMPTY_SCREEN_SHARING_IDS,
}) {
  const { t } = useTranslation()

  function voiceUsersForChannel(channelId) {
    const k = String(channelId)
    const raw = voicePresence[k] ?? voicePresence[channelId] ?? voicePresence[Number(channelId)]
    return Array.isArray(raw) ? raw : []
  }

  function sortedVoiceUsersForChannel(channelId) {
    const list = [...voiceUsersForChannel(channelId)]
    list.sort((a, b) => {
      const na = String(a.username || `user_${a.userId}`).toLocaleLowerCase()
      const nb = String(b.username || `user_${b.userId}`).toLocaleLowerCase()
      return na.localeCompare(nb, undefined, { numeric: true, sensitivity: 'base' })
    })
    return list
  }

  function isVoiceScreenSharingUser(userId) {
    if (userId == null || !Array.isArray(voiceScreenSharingUserIds) || voiceScreenSharingUserIds.length === 0)
      return false
    const idStr = String(userId)
    return voiceScreenSharingUserIds.some((x) => String(x) === idStr)
  }

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [userAvatarFailed, setUserAvatarFailed] = useState(false)
  const [voiceAvatarFailed, setVoiceAvatarFailed] = useState(() => new Set())
  const closeUserMenu = useCallback(() => setUserMenuOpen(false), [])
  const userMenuRef = useDismissiblePopover(userMenuOpen, closeUserMenu)
  const avatarInitial = String(user?.username || 'U').trim().charAt(0).toUpperCase() || 'U'

  const [createUI, setCreateUI] = useState(null)
  const [draftName, setDraftName] = useState('')
  const [draftType, setDraftType] = useState('text')
  const [draftCategoryId, setDraftCategoryId] = useState('')
  const [draftPrivate, setDraftPrivate] = useState(false)

  const closeCreate = useCallback(() => setCreateUI(null), [])
  const createOpen = createUI !== null
  const popoverRef = useDismissiblePopover(createOpen, closeCreate)

  const besideChannel =
    createUI?.type === 'beside' ? channels.find((x) => x.id === createUI.channelId) : null
  const createUISyncKey = createUI
    ? createUI.type === 'beside'
      ? `beside:${createUI.channelId}:${besideChannel?.type ?? ''}:${besideChannel?.category_id ?? ''}:${besideChannel?.is_private ?? ''}`
      : createUI.type === 'category'
        ? `category:${createUI.categoryId}`
        : 'top'
    : 'closed'
  const [createUISyncKeyState, setCreateUISyncKeyState] = useState(createUISyncKey)

  if (createUISyncKey !== createUISyncKeyState) {
    setCreateUISyncKeyState(createUISyncKey)
    if (!createUI) {
      setDraftName('')
    } else {
      setDraftName('')
      if (createUI.type === 'top') {
        setDraftType('text')
        setDraftCategoryId('')
        setDraftPrivate(false)
      } else if (createUI.type === 'category') {
        setDraftType('text')
        setDraftCategoryId(String(createUI.categoryId))
        setDraftPrivate(false)
      } else if (createUI.type === 'beside') {
        const ch = besideChannel
        setDraftType(ch?.type || 'text')
        setDraftCategoryId(ch?.category_id != null ? String(ch.category_id) : '')
        setDraftPrivate(Boolean(ch?.is_private))
      }
    }
  }

  const avatarUrl = user?.avatar_url
  const [avatarUrlSync, setAvatarUrlSync] = useState(avatarUrl)

  if (avatarUrl !== avatarUrlSync) {
    setAvatarUrlSync(avatarUrl)
    setUserAvatarFailed(false)
  }

  const grouped = categories.map((category) => ({
    ...category,
    channels: channels.filter((c) => c.category_id === category.id),
  }))
  const uncategorized = channels.filter((c) => !c.category_id)

  async function submitNewChannel(payload) {
    await onCreateChannel?.(payload)
    closeCreate()
  }

  const rowProps = {
    activeChannelId,
    onSelectChannel,
    onDeleteChannel,
    onMoveChannel,
    createUI,
    setCreateUI,
    popoverRef,
    draftName,
    setDraftName,
    submitNewChannel,
    closeCreate,
    t,
    voiceUsersForChannel,
    sortedVoiceUsersForChannel,
    isVoiceScreenSharingUser,
    voiceAvatarFailed,
    setVoiceAvatarFailed,
  }

  return (
    <aside className="channel-column">
      <ChannelListHeader
        serverName={serverName}
        serverTag={serverTag}
        user={user}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
        userMenuRef={userMenuRef}
        userAvatarFailed={userAvatarFailed}
        setUserAvatarFailed={setUserAvatarFailed}
        avatarInitial={avatarInitial}
        onOpenServerSettings={onOpenServerSettings}
        onSetAppearOnline={onSetAppearOnline}
        onOpenUserSettings={onOpenUserSettings}
        onOpenAdminDashboard={onOpenAdminDashboard}
        onLogout={onLogout}
        t={t}
      />
      <SchedulerUpcomingWidget streamerUsername={schedulerStreamerUsername} />
      <div className="channel-list-scroll">
        <div className="channel-list-toolbar">
          <span className="channel-list-toolbar-label">{t('channelList.channelsToolbar')}</span>
          <button
            type="button"
            className="channel-list-toolbar-add"
            title={t('channelList.createChannelOrSection')}
            onClick={() => setCreateUI({ type: 'top', tab: 'channel' })}
          >
            +
          </button>
        </div>
        {createUI?.type === 'top' ? (
          <ChannelTopCreatePanel
            createUI={createUI}
            popoverRef={popoverRef}
            t={t}
            setCreateUI={setCreateUI}
            draftName={draftName}
            setDraftName={setDraftName}
            draftType={draftType}
            setDraftType={setDraftType}
            draftCategoryId={draftCategoryId}
            setDraftCategoryId={setDraftCategoryId}
            draftPrivate={draftPrivate}
            setDraftPrivate={setDraftPrivate}
            categories={categories}
            onCreateCategory={onCreateCategory}
            submitNewChannel={submitNewChannel}
            closeCreate={closeCreate}
          />
        ) : null}
        <ul
          className="channel-list channel-list-discord"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const raw = e.dataTransfer.getData('text/plain')
            if (!raw) return
            const payload = JSON.parse(raw)
            if (payload.kind === 'channel') {
              onMoveChannel(payload.id, null, null)
            }
          }}
        >
          {uncategorized.map((c) => (
            <ChannelListRow {...rowProps} channel={c} groupId={null} key={c.id} />
          ))}
          {grouped.map((group) => (
            <ChannelCategoryBlock
              key={group.id}
              group={group}
              collapsedCategories={collapsedCategories}
              onToggleCategory={onToggleCategory}
              onDeleteCategory={onDeleteCategory}
              onMoveCategory={onMoveCategory}
              onMoveChannel={onMoveChannel}
              createUI={createUI}
              setCreateUI={setCreateUI}
              popoverRef={popoverRef}
              draftName={draftName}
              setDraftName={setDraftName}
              draftType={draftType}
              setDraftType={setDraftType}
              draftPrivate={draftPrivate}
              setDraftPrivate={setDraftPrivate}
              submitNewChannel={submitNewChannel}
              closeCreate={closeCreate}
              t={t}
              activeChannelId={activeChannelId}
              onSelectChannel={onSelectChannel}
              onDeleteChannel={onDeleteChannel}
              voiceUsersForChannel={voiceUsersForChannel}
              sortedVoiceUsersForChannel={sortedVoiceUsersForChannel}
              isVoiceScreenSharingUser={isVoiceScreenSharingUser}
              voiceAvatarFailed={voiceAvatarFailed}
              setVoiceAvatarFailed={setVoiceAvatarFailed}
            />
          ))}
        </ul>
      </div>
    </aside>
  )
}
