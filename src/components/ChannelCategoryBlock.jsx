import ChannelCategoryCreatePanel from './ChannelCategoryCreatePanel'
import ChannelListRow from './ChannelListRow'

export default function ChannelCategoryBlock({
  group,
  collapsedCategories,
  onToggleCategory,
  onDeleteCategory,
  onMoveCategory,
  onMoveChannel,
  createUI,
  setCreateUI,
  popoverRef,
  draftName,
  setDraftName,
  draftType,
  setDraftType,
  draftPrivate,
  setDraftPrivate,
  submitNewChannel,
  closeCreate,
  t,
  activeChannelId,
  onSelectChannel,
  onDeleteChannel,
  voiceUsersForChannel,
  sortedVoiceUsersForChannel,
  isVoiceScreenSharingUser,
  voiceAvatarFailed,
  setVoiceAvatarFailed,
  currentUserId = null,
}) {
  return (
    <li
      key={group.id}
      className="category-block"
      draggable
      onDragStart={(e) => {
        e.currentTarget.classList.add('is-dragging')
        e.dataTransfer.setData('text/plain', JSON.stringify({ kind: 'category', id: group.id }))
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove('is-dragging')}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const raw = e.dataTransfer.getData('text/plain')
        if (!raw) return
        const payload = JSON.parse(raw)
        if (payload.kind === 'category') {
          onMoveCategory(payload.id, group.id)
        }
        if (payload.kind === 'channel') {
          onMoveChannel(payload.id, null, group.id)
        }
      }}
    >
      <div className="category-header-discord">
        <button
          type="button"
          className="category-chevron-btn"
          onClick={() => onToggleCategory(group.id)}
          aria-expanded={!collapsedCategories.includes(group.id)}
          aria-label={
            collapsedCategories.includes(group.id)
              ? t('channelList.expandCategory')
              : t('channelList.collapseCategory')
          }
        >
          <span
            className={`category-chevron ${collapsedCategories.includes(group.id) ? 'is-collapsed' : ''}`}
          />
        </button>
        <button
          type="button"
          className="category-name-discord"
          onClick={() => onToggleCategory(group.id)}
        >
          {group.name}
        </button>
        <div className="category-header-actions">
          <button
            type="button"
            className="category-add-btn"
            title={t('channelList.addChannelInSection')}
            onClick={(e) => {
              e.stopPropagation()
              if (collapsedCategories.includes(group.id)) {
                onToggleCategory(group.id)
              }
              setCreateUI({ type: 'category', categoryId: group.id })
            }}
          >
            +
          </button>
          <button
            type="button"
            className="category-delete"
            title={t('channelList.deleteCategory')}
            onClick={(e) => {
              e.stopPropagation()
              onDeleteCategory(group.id)
            }}
          >
            🗑
          </button>
        </div>
      </div>
      {createUI?.type === 'category' && createUI.categoryId === group.id ? (
        <ChannelCategoryCreatePanel
          groupId={group.id}
          popoverRef={popoverRef}
          t={t}
          draftName={draftName}
          setDraftName={setDraftName}
          draftType={draftType}
          setDraftType={setDraftType}
          draftPrivate={draftPrivate}
          setDraftPrivate={setDraftPrivate}
          submitNewChannel={submitNewChannel}
          closeCreate={closeCreate}
        />
      ) : null}
      <ul
        className={`category-channels ${collapsedCategories.includes(group.id) ? 'collapsed' : ''}`}
      >
        {group.channels.map((c) => (
          <ChannelListRow
            key={c.id}
            channel={c}
            groupId={group.id}
            activeChannelId={activeChannelId}
            onSelectChannel={onSelectChannel}
            onDeleteChannel={onDeleteChannel}
            onMoveChannel={onMoveChannel}
            createUI={createUI}
            setCreateUI={setCreateUI}
            popoverRef={popoverRef}
            draftName={draftName}
            setDraftName={setDraftName}
            submitNewChannel={submitNewChannel}
            closeCreate={closeCreate}
            t={t}
            voiceUsersForChannel={voiceUsersForChannel}
            sortedVoiceUsersForChannel={sortedVoiceUsersForChannel}
            isVoiceScreenSharingUser={isVoiceScreenSharingUser}
            voiceAvatarFailed={voiceAvatarFailed}
            setVoiceAvatarFailed={setVoiceAvatarFailed}
            currentUserId={currentUserId}
          />
        ))}
      </ul>
    </li>
  )
}
