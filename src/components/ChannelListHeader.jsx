import { resolveImageUrl } from '../lib/resolveImageUrl'
import { exportChannelHistory } from '../lib/channelExport'
import AppChromeToolbar from './AppChromeToolbar'

export default function ChannelListHeader({
  serverName,
  serverTag,
  user,
  userMenuOpen,
  setUserMenuOpen,
  userMenuRef,
  userAvatarFailed,
  setUserAvatarFailed,
  avatarInitial,
  onOpenServerSettings,
  onSetAppearOnline,
  onOpenUserSettings,
  onOpenAdminDashboard,
  onLogout,
  exportChannelId = null,
  onExportChannelHistory = exportChannelHistory,
  t,
}) {
  return (
    <header className="channel-header">
      <div className="channel-server-bar">
        <button
          type="button"
          className="channel-server-name-btn"
          onClick={() => onOpenServerSettings?.()}
          title={t('channelList.serverSettings')}
        >
          <span className="channel-server-name">
            <span className="channel-server-name-text">
              {serverName || t('channelList.serverFallback')}
            </span>
            {serverTag ? (
              <span className="channel-server-tag-pill" title={t('channelList.serverTagTitle')}>
                {String(serverTag).toUpperCase()}
              </span>
            ) : null}
          </span>
          <span className="channel-server-chevron" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="channel-server-toolbar-btn"
          title={t('channelList.serverInviteOverview')}
          onClick={() => onOpenServerSettings?.()}
        >
          +
        </button>
      </div>
      <div className="channel-header-row">
        <div className="channel-header-leading">
          <AppChromeToolbar />
          <div className="user-bar" ref={userMenuRef}>
            <button
              type="button"
              className="btn ghost small user-menu-trigger channel-user-trigger"
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <span className="user-trigger-content">
                {user?.avatar_url && !userAvatarFailed ? (
                  <img
                    className="user-avatar-tiny"
                    src={resolveImageUrl(user.avatar_url)}
                    alt={t('channelList.avatarAlt')}
                    onError={() => setUserAvatarFailed(true)}
                  />
                ) : (
                  <span className="user-avatar-tiny user-avatar-fallback" aria-hidden="true">
                    {avatarInitial}
                  </span>
                )}
                <span>{user?.username || t('channelList.userFallback')}</span>
              </span>
            </button>
            {userMenuOpen && (
              <div className="user-menu-popover">
                <button
                  type="button"
                  className="btn link"
                  onClick={async () => {
                    setUserMenuOpen(false)
                    const visible = String(user?.presence_status || '').toLowerCase() !== 'invisible'
                    await onSetAppearOnline?.(!visible)
                  }}
                >
                  {String(user?.presence_status || '').toLowerCase() === 'invisible'
                    ? t('channelList.setOnline')
                    : t('channelList.setOffline')}
                </button>
                <button
                  type="button"
                  className="btn link"
                  onClick={() => {
                    setUserMenuOpen(false)
                    onOpenUserSettings?.()
                  }}
                >
                  {t('channelList.settings')}
                </button>
                {exportChannelId ? (
                  <>
                    <div className="user-menu-divider" role="separator" aria-hidden="true" />
                    <div className="user-menu-export" role="group" aria-label={t('channelList.downloadHistoryAria')}>
                      <button
                        type="button"
                        className="btn link"
                        onClick={() => {
                          setUserMenuOpen(false)
                          void onExportChannelHistory(exportChannelId, 'csv')
                        }}
                      >
                        {t('channelList.spreadsheet')}
                      </button>
                      <button
                        type="button"
                        className="btn link"
                        onClick={() => {
                          setUserMenuOpen(false)
                          void onExportChannelHistory(exportChannelId, 'json')
                        }}
                      >
                        {t('channelList.jsonBackup')}
                      </button>
                    </div>
                  </>
                ) : null}
                <button
                  type="button"
                  className="btn link"
                  onClick={() => {
                    setUserMenuOpen(false)
                    onOpenServerSettings?.()
                  }}
                >
                  {t('channelList.serverSettingsLink')}
                </button>
                {user?.is_admin && (
                  <button
                    type="button"
                    className="btn link"
                    onClick={() => {
                      setUserMenuOpen(false)
                      onOpenAdminDashboard?.()
                    }}
                  >
                    {t('channelList.adminDashboard')}
                  </button>
                )}
                <button
                  type="button"
                  className="btn link"
                  onClick={() => {
                    setUserMenuOpen(false)
                    onLogout?.()
                  }}
                >
                  {t('channelList.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="channel-header-actions">
          <button
            type="button"
            className="channel-server-toolbar-btn channel-server-toolbar-btn--ghost"
            title={t('channelList.serverSettings')}
            onClick={onOpenServerSettings}
          >
            ⚙
          </button>
        </div>
      </div>
    </header>
  )
}
