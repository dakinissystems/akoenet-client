export default function ServerRolesDefinitionsList({
  canManage,
  roleDefinitions,
  catalogKeys,
  roleNameNotice,
  roleNameBusyId,
  permBusyId,
  deleteBusyId,
  saveRoleDisplayName,
  handleDeleteRole,
  togglePermission,
  t,
}) {
  if (!canManage || roleDefinitions.length === 0) return null

  return (
    <div className="server-roles-names-block">
      <h3 className="server-roles-subheading">{t('serverModal.rolesRolesAndPermsHeading')}</h3>
      <p className="muted small">{t('members.roleNamesHint')}</p>
      {roleNameNotice ? (
        <p
          className={`server-roles-inline-notice ${
            roleNameNotice.type === 'err' ? 'server-roles-inline-notice--err' : ''
          }`}
          role="status"
        >
          {roleNameNotice.text}
        </p>
      ) : null}
      <ul className="server-roles-role-cards">
        {roleDefinitions.map((def) => (
          <li key={def.id} className="server-roles-role-card">
            <div className="server-roles-role-card-head">
              <label className="server-roles-name-edit-row">
                <span className="server-roles-slug">{def.slug}</span>
                <input
                  type="text"
                  name={`role_display_${def.id}`}
                  defaultValue={def.name}
                  key={`${def.id}-${def.name}`}
                  disabled={roleNameBusyId === def.id}
                  onBlur={(e) => saveRoleDisplayName(def, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                  }}
                />
              </label>
              {!def.is_system ? (
                <button
                  type="button"
                  className="btn ghost small server-roles-delete-btn"
                  disabled={deleteBusyId === def.id}
                  onClick={() => handleDeleteRole(def)}
                >
                  {deleteBusyId === def.id ? t('serverModal.rolesDeleting') : t('serverModal.rolesDelete')}
                </button>
              ) : null}
            </div>
            {catalogKeys.length > 0 ? (
              <fieldset className="server-roles-perm-fieldset" disabled={permBusyId === def.id}>
                <legend className="server-roles-perm-legend">{t('serverModal.rolesPermissionsLegend')}</legend>
                <div className="server-roles-perm-grid">
                  {catalogKeys.map((key) => (
                    <label key={key} className="server-roles-perm-item">
                      <input
                        type="checkbox"
                        name={`perm_${def.id}_${key}`}
                        checked={(def.permissions || []).includes(key)}
                        onChange={(e) => {
                          void togglePermission(def, key, e.target.checked)
                        }}
                      />
                      <span>{t(`serverModal.perm.${key}`, { defaultValue: key })}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
