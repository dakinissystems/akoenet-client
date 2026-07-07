export default function ServerRolesCreateForm({
  canManage,
  createNotice,
  newRoleName,
  setNewRoleName,
  newRoleSlug,
  setNewRoleSlug,
  createBusy,
  handleCreateRole,
  t,
}) {
  if (!canManage) return null

  return (
    <form className="server-roles-create-form" onSubmit={handleCreateRole}>
      <h3 className="server-roles-subheading">{t('serverModal.rolesNewRoleHeading')}</h3>
      <p className="muted small">{t('serverModal.rolesNewRoleHint')}</p>
      {createNotice ? (
        <p
          className={`server-roles-inline-notice ${
            createNotice.type === 'err' ? 'server-roles-inline-notice--err' : ''
          }`}
          role="status"
        >
          {createNotice.text}
        </p>
      ) : null}
      <div className="server-roles-create-row">
        <label className="server-roles-create-field">
          <span className="sr-only">{t('serverModal.rolesNewName')}</span>
          <input
            type="text"
            name="new_role_name"
            placeholder={t('serverModal.rolesNewNamePh')}
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            disabled={createBusy}
          />
        </label>
        <label className="server-roles-create-field">
          <span className="sr-only">{t('serverModal.rolesNewSlug')}</span>
          <input
            type="text"
            name="new_role_slug"
            placeholder={t('serverModal.rolesNewSlugPh')}
            value={newRoleSlug}
            onChange={(e) => setNewRoleSlug(e.target.value)}
            disabled={createBusy}
          />
        </label>
        <button type="submit" className="btn secondary" disabled={createBusy}>
          {createBusy ? t('serverModal.rolesCreating') : t('serverModal.rolesCreateCta')}
        </button>
      </div>
    </form>
  )
}
