import MemberFilters from './MemberFilters'
import MemberListItem from './MemberListItem'
import { useMembersPanel } from '../hooks/useMembersPanel'

const EMPTY_CONNECTED_IDS = []
const EMPTY_ACTIVITY = {}
const EMPTY_GAME_RANKING = []

export default function MembersPanel({
  members,
  connectedUserIds = EMPTY_CONNECTED_IDS,
  currentUser = null,
  onClose = null,
  activityByUserId = EMPTY_ACTIVITY,
  gameRanking = EMPTY_GAME_RANKING,
  serverId = null,
  canManageMemberRoles = false,
  serverOwnerId = null,
  onMemberRolesUpdated = null,
}) {
  const panel = useMembersPanel({
    members,
    connectedUserIds,
    currentUser,
    onClose,
    serverId,
    canManageMemberRoles,
    serverOwnerId,
    onMemberRolesUpdated,
  })

  const {
    t,
    avatarFailed,
    setAvatarFailed,
    query,
    setQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    selectedMemberId,
    setSelectedMemberId,
    friendNotice,
    setFriendNotice,
    roleDefinitions,
    roleBusyId,
    roleNotice,
    roleNameBusyId,
    roleNameNotice,
    serverRoleNames,
    roleLabels,
    connectedSet,
    saveRoleDisplayName,
    friendshipByPeerId,
    roleOptions,
    filteredMembers,
    groupedMembers,
    openDirectMessage,
    handleMemberRoleChange,
    handleAddFriend,
    friendRequestBusyId,
    dmOpenBusyId,
  } = panel

  const listItemProps = {
    avatarFailed,
    setAvatarFailed,
    connectedSet,
    currentUser,
    activityByUserId,
    friendshipByPeerId,
    canManageMemberRoles,
    serverId,
    serverOwnerId,
    serverRoleNames,
    roleLabels,
    roleBusyId,
    handleMemberRoleChange,
    dmOpenBusyId,
    openDirectMessage,
    friendRequestBusyId,
    handleAddFriend,
    t,
  }

  return (
    <aside className="members-column">
      <header className="members-header">
        <span className="members-header-title" id={onClose ? 'members-drawer-title' : undefined}>
          {t('members.title')}
        </span>
        {onClose && (
          <button
            type="button"
            className="btn ghost small members-header-close"
            onClick={onClose}
            aria-label={t('members.closeAria')}
          >
            ✕
          </button>
        )}
      </header>
      <MemberFilters
        canManageMemberRoles={canManageMemberRoles}
        serverId={serverId}
        roleDefinitions={roleDefinitions}
        roleNameNotice={roleNameNotice}
        roleNameBusyId={roleNameBusyId}
        saveRoleDisplayName={saveRoleDisplayName}
        gameRanking={gameRanking}
        query={query}
        setQuery={setQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        roleOptions={roleOptions}
        roleLabels={roleLabels}
        t={t}
      />
      {roleNotice && (
        <p
          className={`members-friend-notice ${roleNotice.type === 'err' ? 'members-friend-notice--err' : ''}`}
          role="status"
        >
          {roleNotice.text}
        </p>
      )}
      {friendNotice && (
        <p
          className={`members-friend-notice ${friendNotice.type === 'err' ? 'members-friend-notice--err' : ''}`}
          role="status"
        >
          {friendNotice.text}
        </p>
      )}
      <ul className="members-list">
        {groupedMembers.map((section) => (
          <li key={`section-${section.key}`} className="members-section">
            <div className="members-section-title">
              {section.title} — {section.items.length}
            </div>
            <ul className="members-section-list">
              {section.items.map((member) => (
                <MemberListItem
                  {...listItemProps}
                  member={member}
                  selected={selectedMemberId != null && Number(selectedMemberId) === Number(member.id)}
                  onSelect={() => {
                    setFriendNotice(null)
                    setSelectedMemberId((prev) =>
                      prev != null && Number(prev) === Number(member.id) ? null : member.id
                    )
                  }}
                  key={member.id}
                />
              ))}
            </ul>
          </li>
        ))}
        {filteredMembers.length === 0 && (
          <li className="member-item">
            <div className="member-meta">
              <strong>{t('members.emptyTitle')}</strong>
              <span>{t('members.emptyHint')}</span>
            </div>
          </li>
        )}
      </ul>
    </aside>
  )
}
