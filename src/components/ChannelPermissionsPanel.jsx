import { useTranslation } from 'react-i18next'
import ChannelGeneralSettings from './ChannelGeneralSettings.jsx'

export default function ChannelPermissionsPanel({
  channelType,
  permissions,
  onTogglePermission,
  members,
  userPermissions,
  selectedMemberId,
  setSelectedMemberId,
  onToggleUserPermission,
  categories,
  activeChannel,
  onUpdateChannel,
}) {
  const { t } = useTranslation()
  const voiceLimitHintId = useId()
  const isVoice = channelType === 'voice'

  if (!permissions?.length) {
    return (
      <section className="perm-panel perm-panel--channel-settings">
        <p className="muted small channel-settings-empty">{t('channelPerm.selectChannelHint')}</p>
      </section>
    )
  }

  const cid = activeChannel?.id ?? 'none'

  return (
    <section className="perm-panel perm-panel--channel-settings">
      <ChannelGeneralSettings
        key={activeChannel?.id ?? 'none'}
        activeChannel={activeChannel}
        categories={categories}
        isVoice={isVoice}
        onUpdateChannel={onUpdateChannel}
      />

      <div className="channel-settings-section">
        <h4 className="channel-settings-section-title">{t('channelPerm.rolePermTitle')}</h4>
        <p className="channel-settings-section-desc">{t('channelPerm.rolePermDesc')}</p>
        <div className={`perm-matrix${isVoice ? ' perm-matrix--voice' : ' perm-matrix--text'}`}>
          <div className={`perm-matrix-head${isVoice ? ' perm-matrix-head--voice' : ' perm-matrix-head--text'}`}>
            <span className="perm-matrix-corner">{t('channelPerm.colRole')}</span>
            <span>{t('channelPerm.colView')}</span>
            <span>{t('channelPerm.colSend')}</span>
            {isVoice ? <span>{t('channelPerm.colConnect')}</span> : null}
          </div>
          <div className="perm-matrix-body">
            {permissions.map((role) => (
              <div key={role.id} className={`perm-row${isVoice ? ' perm-row--voice' : ' perm-row--text'}`}>
                <div className="perm-role">{role.name}</div>
                <label className="perm-cell">
                  <input
                    id={`ch-perm-${cid}-role-${role.id}-view`}
                    name={`role_perm_${role.id}_view`}
                    type="checkbox"
                    checked={role.can_view}
                    onChange={(e) =>
                      onTogglePermission(role.id, {
                        ...role,
                        can_view: e.target.checked,
                      })
                    }
                  />
                  <span className="sr-only">
                    {t('channelPerm.srRoleAction', { role: role.name, action: t('channelPerm.colView') })}
                  </span>
                </label>
                <label className="perm-cell">
                  <input
                    id={`ch-perm-${cid}-role-${role.id}-send`}
                    name={`role_perm_${role.id}_send`}
                    type="checkbox"
                    checked={role.can_send}
                    onChange={(e) =>
                      onTogglePermission(role.id, {
                        ...role,
                        can_send: e.target.checked,
                      })
                    }
                  />
                  <span className="sr-only">
                    {t('channelPerm.srRoleAction', { role: role.name, action: t('channelPerm.colSend') })}
                  </span>
                </label>
                {isVoice ? (
                  <label className="perm-cell">
                    <input
                      id={`ch-perm-${cid}-role-${role.id}-connect`}
                      name={`role_perm_${role.id}_connect`}
                      type="checkbox"
                      checked={role.can_connect}
                      onChange={(e) =>
                        onTogglePermission(role.id, {
                          ...role,
                          can_connect: e.target.checked,
                        })
                      }
                    />
                    <span className="sr-only">
                      {t('channelPerm.srRoleAction', { role: role.name, action: t('channelPerm.colConnect') })}
                    </span>
                  </label>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="channel-settings-section">
        <h4 className="channel-settings-section-title">{t('channelPerm.memberOverridesTitle')}</h4>
        <p className="channel-settings-section-desc">{t('channelPerm.memberOverridesDesc')}</p>
        <label className="channel-settings-field">
          <span className="channel-settings-label">{t('channelPerm.memberLabel')}</span>
          <select
            id={`ch-perm-member-select-${cid}`}
            name="channel_perm_member"
            className="select-inline channel-settings-member-select"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
          >
            <option value="">{t('channelPerm.chooseMember')}</option>
            {members.map((m) => (
              <option key={m.id} value={String(m.id)}>
                {m.username}
              </option>
            ))}
          </select>
        </label>
        {selectedMemberId ? (
          <div className={`perm-matrix perm-matrix--member${isVoice ? ' perm-matrix--voice' : ' perm-matrix--text'}`}>
            <div className={`perm-matrix-head${isVoice ? ' perm-matrix-head--voice' : ' perm-matrix-head--text'}`}>
              <span className="perm-matrix-corner">{t('channelPerm.colMember')}</span>
              <span>{t('channelPerm.colView')}</span>
              <span>{t('channelPerm.colSend')}</span>
              {isVoice ? <span>{t('channelPerm.colConnect')}</span> : null}
            </div>
            <div className="perm-matrix-body">
              <div className={`perm-row${isVoice ? ' perm-row--voice' : ' perm-row--text'}`}>
                <div className="perm-role">
                  {members.find((m) => String(m.id) === String(selectedMemberId))?.username ??
                    t('channelPerm.dash')}
                </div>
                {(() => {
                  const selected =
                    userPermissions.find((up) => String(up.user_id) === String(selectedMemberId)) || {
                      can_view: true,
                      can_send: true,
                      can_connect: true,
                    }
                  return (
                    <>
                      <label className="perm-cell">
                        <input
                          id={`ch-user-perm-${cid}-u-${selectedMemberId}-view`}
                          name={`user_perm_${selectedMemberId}_view`}
                          type="checkbox"
                          checked={selected.can_view}
                          onChange={(e) =>
                            onToggleUserPermission(Number(selectedMemberId), {
                              ...selected,
                              can_view: e.target.checked,
                            })
                          }
                        />
                        <span className="sr-only">{t('channelPerm.colView')}</span>
                      </label>
                      <label className="perm-cell">
                        <input
                          id={`ch-user-perm-${cid}-u-${selectedMemberId}-send`}
                          name={`user_perm_${selectedMemberId}_send`}
                          type="checkbox"
                          checked={selected.can_send}
                          onChange={(e) =>
                            onToggleUserPermission(Number(selectedMemberId), {
                              ...selected,
                              can_send: e.target.checked,
                            })
                          }
                        />
                        <span className="sr-only">{t('channelPerm.colSend')}</span>
                      </label>
                      {isVoice ? (
                        <label className="perm-cell">
                          <input
                            id={`ch-user-perm-${cid}-u-${selectedMemberId}-connect`}
                            name={`user_perm_${selectedMemberId}_connect`}
                            type="checkbox"
                            checked={selected.can_connect}
                            onChange={(e) =>
                              onToggleUserPermission(Number(selectedMemberId), {
                                ...selected,
                                can_connect: e.target.checked,
                              })
                            }
                          />
                          <span className="sr-only">{t('channelPerm.colConnect')}</span>
                        </label>
                      ) : null}
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        ) : (
          <p className="channel-settings-hint channel-settings-hint--spaced">
            {t('channelPerm.pickMemberHintText')}
            {isVoice ? t('channelPerm.pickMemberHintVoice') : ''}
            {t('channelPerm.pickMemberHintEnd')}
          </p>
        )}
      </div>
    </section>
  )
}
