export default function MemberFilters({
  canManageMemberRoles,
  serverId,
  roleDefinitions,
  roleNameNotice,
  roleNameBusyId,
  saveRoleDisplayName,
  gameRanking,
  query,
  setQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  roleOptions,
  roleLabels,
  t,
}) {
  return (
    <>
      {canManageMemberRoles && serverId && roleDefinitions.length > 0 && (
        <details className="members-role-names-panel">
          <summary>{t('members.roleNamesEdit')}</summary>
          <p className="muted small members-role-names-hint">{t('members.roleNamesHint')}</p>
          {roleNameNotice && (
            <p
              className={`members-friend-notice ${
                roleNameNotice.type === 'err' ? 'members-friend-notice--err' : ''
              }`}
              role="status"
            >
              {roleNameNotice.text}
            </p>
          )}
          <ul className="members-role-name-edit-list">
            {roleDefinitions.map((def) => (
              <li key={def.id}>
                <label className="members-role-name-edit-row">
                  <span className="members-role-slug">{def.slug}</span>
                  <input
                    type="text"
                    defaultValue={def.name}
                    key={`${def.id}-${def.name}`}
                    disabled={roleNameBusyId === def.id}
                    onBlur={(e) => saveRoleDisplayName(def, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur()
                    }}
                  />
                </label>
              </li>
            ))}
          </ul>
        </details>
      )}
      {Array.isArray(gameRanking) && gameRanking.length > 0 && (
        <div className="members-trending" aria-label={t('members.trendingAria')}>
          <div className="members-trending-title">{t('members.trendingTitle')}</div>
          <ol className="members-trending-list">
            {gameRanking.slice(0, 5).map((row, idx) => (
              <li key={`${row.game}-${idx}`}>
                <span className="members-trending-rank">#{idx + 1}</span>
                <span className="members-trending-game">{row.game}</span>
                <span className="members-trending-count">{t('members.playingCount', { count: row.players })}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <div className="members-filters">
        <input
          id="members-filter-query"
          name="members_filter_query"
          placeholder={t('members.searchPh')}
          aria-label={t('members.searchPh')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="members-filter-row">
          <select
            id="members-filter-role"
            name="members_filter_role"
            className="select-inline"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r === 'all'
                  ? t('members.allRoles')
                  : roleLabels[r] || t(`members.roles.${r}`, { defaultValue: r })}
              </option>
            ))}
          </select>
          <select
            id="members-filter-status"
            name="members_filter_status"
            className="select-inline"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{t('members.all')}</option>
            <option value="connected">{t('members.connected')}</option>
            <option value="offline">{t('members.offline')}</option>
          </select>
        </div>
      </div>
    </>
  )
}
