import { useTranslation } from 'react-i18next'
import ModalDialog from './ModalDialog.jsx'
import ServerEmojiManager from './ServerEmojiManager'
import ServerCustomContentSettings from './ServerCustomContentSettings'
import ServerRolesTab from './ServerRolesTab'
import ServerSettingsTagPanel from './ServerSettingsTagPanel'
import ServerSettingsInvitesPanel from './ServerSettingsInvitesPanel'
import ServerSettingsBansPanel from './ServerSettingsBansPanel'
import ServerSettingsAssistantPanel from './ServerSettingsAssistantPanel.jsx'
import ServerLevelsPanel from './ServerLevelsPanel.jsx'
import { useServerSettingsModal } from '../hooks/useServerSettingsModal'

const EMPTY_MEMBERS = []

export default function ServerSettingsModal({
  open,
  onClose,
  serverId,
  serverName,
  serverTag = '',
  members = EMPTY_MEMBERS,
  serverOwnerId = null,
  onMembersRefresh = null,
  onServerTagUpdated = null,
}) {
  const { t } = useTranslation()
  const settings = useServerSettingsModal({ open, serverId, serverTag, onServerTagUpdated })

  const navBtn = (id, label) => (
    <button
      key={id}
      type="button"
      className={`settings-split-nav-btn ${settings.activeSection === id ? 'active' : ''}`}
      onClick={() => settings.setActiveSection(id)}
    >
      {label}
    </button>
  )

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      ariaLabelledby="server-settings-title"
      panelClassName="modal-card user-settings-modal server-settings-modal"
    >
      <header className="modal-header">
        <h3 id="server-settings-title">
          {t('serverModal.title', { name: serverName || t('channelList.serverFallback') })}
        </h3>
        <button type="button" className="btn ghost small" onClick={onClose}>
          {t('serverModal.close')}
        </button>
      </header>

      {settings.error && <div className="error-banner inline">{settings.error}</div>}
      {settings.info && <div className="info-banner">{settings.info}</div>}

      <div className="settings-split-layout">
        <aside className="settings-split-nav" aria-label={t('serverModal.navAria')}>
          {navBtn('servertag', t('serverModal.navServerTag'))}
          {navBtn('invites', t('serverModal.navInvites'))}
          {navBtn('emojis', t('serverModal.navEmojis'))}
          {navBtn('roles', t('serverModal.navRoles'))}
          {navBtn('commands', t('serverModal.navCommands'))}
          {navBtn('assistant', t('serverModal.navAssistant'))}
          {navBtn('levels', t('serverModal.navLevels'))}
          {navBtn('events', t('serverModal.navEvents'))}
          {navBtn('announcements', t('serverModal.navAnnouncements'))}
          {navBtn('bans', t('serverModal.navBans'))}
        </aside>

        <section className="settings-split-content">
          {settings.activeSection === 'servertag' && serverId ? (
            <ServerSettingsTagPanel
              serverTag={serverTag}
              canManageServer={settings.canManageServer}
              tagDraft={settings.tagDraft}
              setTagDraft={settings.setTagDraft}
              tagBusy={settings.tagBusy}
              saveServerTag={settings.saveServerTag}
              t={t}
            />
          ) : null}

          {settings.activeSection === 'invites' ? (
            <ServerSettingsInvitesPanel
              inviteType={settings.inviteType}
              setInviteType={settings.setInviteType}
              tempUsesMode={settings.tempUsesMode}
              setTempUsesMode={settings.setTempUsesMode}
              inviteLink={settings.inviteLink}
              inviteToken={settings.inviteToken}
              lastInviteSummary={settings.lastInviteSummary}
              activeInvites={settings.activeInvites}
              copyNotice={settings.copyNotice}
              busy={settings.busy}
              shareOrigin={settings.shareOrigin}
              createInvite={settings.createInvite}
              copyText={settings.copyText}
              revokeInvite={settings.revokeInvite}
              t={t}
            />
          ) : null}

          {settings.activeSection === 'emojis' && serverId ? (
            <div className="server-settings-tab-pane">
              <h2 className="server-settings-panel-title">{t('serverModal.emojisTitle')}</h2>
              <p className="muted small" style={{ margin: '0 0 0.75rem' }}>
                {t('serverModal.emojisLead')}
              </p>
              <ServerEmojiManager
                serverId={Number(serverId)}
                emojis={settings.emojiList}
                onReload={settings.loadEmojis}
                canManage={settings.canManageServer}
              />
            </div>
          ) : null}

          {settings.activeSection === 'roles' && serverId ? (
            <ServerRolesTab
              serverId={serverId}
              members={members}
              canManageMemberRoles={settings.canManageMemberRoles}
              serverOwnerId={serverOwnerId}
              onMembersRefresh={onMembersRefresh}
            />
          ) : null}

          {(settings.activeSection === 'commands' ||
            settings.activeSection === 'events' ||
            settings.activeSection === 'announcements') &&
          serverId ? (
            <ServerCustomContentSettings
              serverId={Number(serverId)}
              canManage={settings.canManageServer}
              tab={settings.activeSection}
            />
          ) : null}

          {settings.activeSection === 'assistant' && serverId ? (
            <ServerSettingsAssistantPanel
              serverId={serverId}
              canManage={settings.canManageServer}
              t={t}
            />
          ) : null}

          {settings.activeSection === 'levels' && serverId ? (
            <div className="server-settings-tab-pane">
              <h2 className="server-settings-panel-title">{t('levels.title')}</h2>
              <p className="muted small" style={{ margin: '0 0 0.75rem' }}>
                {t('levels.lead')}
              </p>
              <ServerLevelsPanel serverId={serverId} t={t} />
            </div>
          ) : null}

          {settings.activeSection === 'bans' && serverId ? (
            <ServerSettingsBansPanel
              serverBans={settings.serverBans}
              canManageServer={settings.canManageServer}
              unbanUser={settings.unbanUser}
              t={t}
            />
          ) : null}
        </section>
      </div>
    </ModalDialog>
  )
}
