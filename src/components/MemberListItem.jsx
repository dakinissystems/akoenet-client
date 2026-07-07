import { resolveImageUrl } from '../lib/resolveImageUrl'
import { isMemberOnline } from '../lib/memberUtils'
import MemberDetailPanel from './MemberDetailPanel'

export default function MemberListItem({
  member,
  selected,
  onSelect,
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
}) {
  const showImg = member.avatar_url && !avatarFailed.has(member.id)
  const isOnline = isMemberOnline(member, connectedSet, currentUser)
  const act = activityByUserId[member.id] ?? member.activity ?? null
  const isSelf = currentUser && Number(member.id) === Number(currentUser.id)
  const link = friendshipByPeerId.get(Number(member.id))
  let friendLabel = null
  if (!isSelf && link) {
    if (link.status === 'accepted') friendLabel = 'friends'
    else if (link.status === 'pending') friendLabel = 'pending'
  }

  return (
    <li className={`member-item ${selected ? 'member-item--selected' : ''}`}>
      <button
        type="button"
        className="member-item-main"
        onClick={onSelect}
      >
        <div className="member-avatar">
          {showImg ? (
            <img
              src={resolveImageUrl(member.avatar_url)}
              alt=""
              onError={() => {
                setAvatarFailed((prev) => new Set(prev).add(member.id))
              }}
            />
          ) : (
            member.username?.slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="member-meta">
          <strong>
            {member.username}
            <span className={`member-status-dot ${isOnline ? 'online' : 'offline'}`} />
          </strong>
          <span>{member.roles?.join(', ') || t('members.roleMember')}</span>
          {act?.game ? (
            <span className="member-game-activity">
              {t('members.playing')} {act.game}
              {act.platform ? ` · ${act.platform}` : ''}
            </span>
          ) : null}
          <span className="member-status-text">
            {isOnline ? t('members.statusConnected') : t('members.statusOffline')}
          </span>
        </div>
      </button>
      {selected && (
        <MemberDetailPanel
          member={member}
          canManageMemberRoles={canManageMemberRoles}
          serverId={serverId}
          serverOwnerId={serverOwnerId}
          serverRoleNames={serverRoleNames}
          roleLabels={roleLabels}
          roleBusyId={roleBusyId}
          handleMemberRoleChange={handleMemberRoleChange}
          isSelf={isSelf}
          dmOpenBusyId={dmOpenBusyId}
          openDirectMessage={openDirectMessage}
          friendLabel={friendLabel}
          friendRequestBusyId={friendRequestBusyId}
          handleAddFriend={handleAddFriend}
          t={t}
        />
      )}
    </li>
  )
}
