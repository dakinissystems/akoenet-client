import { resolveDisplayRole, sortServerRoleNames } from '../lib/serverRoles'

export default function ServerRolesMembersTable({
  members,
  sortedMembers,
  query,
  setQuery,
  canManageMemberRoles,
  serverOwnerId,
  serverRoleNames,
  roleBusyId,
  labelForSlug,
  handleMemberRoleChange,
  t,
}) {
  return (
    <div className="server-roles-members-block">
      <h3 className="server-roles-subheading">{t('serverModal.rolesMembersHeading')}</h3>
      <input
        id="server-roles-member-filter"
        name="server_roles_member_filter"
        className="server-roles-member-search"
        type="search"
        placeholder={t('members.searchPh')}
        aria-label={t('members.searchPh')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
      {sortedMembers.length === 0 ? (
        <p className="muted small server-roles-empty">
          {(members || []).length === 0 ? t('serverModal.rolesEmpty') : t('serverModal.rolesFilterEmpty')}
        </p>
      ) : (
        <div className="server-roles-table-wrap">
          <table className="server-roles-table">
            <thead>
              <tr>
                <th scope="col">{t('serverModal.rolesColMember')}</th>
                <th scope="col">{t('serverModal.rolesColRole')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map((member) => {
                const isOwner = serverOwnerId != null && Number(member.id) === Number(serverOwnerId)
                const dr = resolveDisplayRole(member)
                const optionNames = sortServerRoleNames([...new Set([...serverRoleNames, dr])].filter(Boolean))
                return (
                  <tr key={member.id}>
                    <td>
                      <span className="server-roles-username">{String(member.username || '')}</span>
                      {isOwner ? (
                        <span className="muted small server-roles-owner-badge"> · {t('serverModal.rolesOwner')}</span>
                      ) : null}
                    </td>
                    <td>
                      {canManageMemberRoles && !isOwner ? (
                        <select
                          className="select-inline server-roles-role-select"
                          aria-label={t('members.roleLabel')}
                          value={dr}
                          disabled={roleBusyId === Number(member.id) || optionNames.length === 0}
                          onChange={(e) => handleMemberRoleChange(member, e.target.value)}
                        >
                          {optionNames.map((rn) => (
                            <option key={rn} value={rn}>
                              {labelForSlug(rn)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="server-roles-role-readonly">{labelForSlug(dr)}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
