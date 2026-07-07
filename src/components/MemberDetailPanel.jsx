import { resolveDisplayRole, sortServerRoleNames } from '../lib/serverRoles'

export default function MemberDetailPanel({
  member,
  canManageMemberRoles,
  serverId,
  serverOwnerId,
  serverRoleNames,
  roleLabels,
  roleBusyId,
  handleMemberRoleChange,
  isSelf,
  dmOpenBusyId,
  openDirectMessage,
  friendLabel,
  friendRequestBusyId,
  handleAddFriend,
  t,
}) {
  if (!member) return null

  return (
    <>
      {canManageMemberRoles && serverId && (
        <div
          className="member-item-actions member-item-role-row"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          {serverOwnerId != null && Number(member.id) === Number(serverOwnerId) ? (
            <p className="muted small member-owner-role-hint">{t('members.ownerRoleLocked')}</p>
          ) : (
            <label className="member-role-select-label">
              <span className="member-role-select-text">{t('members.roleLabel')}</span>
              {(() => {
                const dr = resolveDisplayRole(member)
                const optionNames = sortServerRoleNames([...new Set([...serverRoleNames, dr])].filter(Boolean))
                return (
                  <select
                    className="select-inline member-role-select"
                    aria-label={t('members.roleLabel')}
                    value={dr}
                    disabled={roleBusyId === Number(member.id) || optionNames.length === 0}
                    onChange={(e) => handleMemberRoleChange(member, e.target.value)}
                  >
                    {optionNames.map((rn) => (
                      <option key={rn} value={rn}>
                        {roleLabels[rn] ||
                          t(`members.roles.${rn}`, {
                            defaultValue: rn.charAt(0).toUpperCase() + rn.slice(1),
                          })}
                      </option>
                    ))}
                  </select>
                )
              })()}
            </label>
          )}
        </div>
      )}
      {!isSelf && (
        <div
          className="member-item-actions member-item-actions--stack"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <button
            type="button"
            className="btn secondary small member-dm-btn"
            disabled={dmOpenBusyId === Number(member.id)}
            onClick={() => openDirectMessage(Number(member.id))}
          >
            {dmOpenBusyId === Number(member.id) ? t('members.opening') : t('members.message')}
          </button>
          {friendLabel === 'friends' && <span className="member-friend-status">{t('members.friends')}</span>}
          {friendLabel === 'pending' && (
            <span className="member-friend-status">{t('members.requestPending')}</span>
          )}
          {!friendLabel && (
            <button
              type="button"
              className="btn primary small member-add-friend-btn"
              disabled={friendRequestBusyId === Number(member.id)}
              onClick={() => handleAddFriend(Number(member.id))}
            >
              {friendRequestBusyId === Number(member.id) ? t('members.sending') : t('members.addFriend')}
            </button>
          )}
        </div>
      )}
    </>
  )
}
