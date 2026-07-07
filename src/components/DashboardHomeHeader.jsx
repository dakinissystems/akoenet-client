import { resolveImageUrl } from '../lib/resolveImageUrl'
import LanguageSwitcher from './LanguageSwitcher'
import AppChromeToolbar from './AppChromeToolbar'

export default function DashboardHomeHeader({
  user,
  userAvatarFailed,
  setUserAvatarFailed,
  avatarInitial,
  userMenuOpen,
  setUserMenuOpen,
  userMenuRef,
  closeUserMenu,
  setUserSettingsOpen,
  navigate,
  signOut,
  t,
}) {
  return (
    <header className="home-header">
      <div>
        <h1>AkoeNet</h1>
        <p className="akoenet-tag">{t('dashboard.home.tagline')}</p>
      </div>
      <div className="home-header-actions">
        <LanguageSwitcher />
        <AppChromeToolbar />
        <div className="user-bar" ref={userMenuRef}>
          <button
            type="button"
            className="btn ghost small user-menu-trigger"
            onClick={() => setUserMenuOpen((v) => !v)}
          >
            <span className="user-trigger-content">
              {user?.avatar_url && !userAvatarFailed ? (
                <img
                  className="user-avatar-tiny"
                  src={resolveImageUrl(user.avatar_url)}
                  alt={t('dashboard.home.avatarAlt')}
                  onError={() => setUserAvatarFailed(true)}
                />
              ) : (
                <span className="user-avatar-tiny user-avatar-fallback" aria-hidden="true">
                  {avatarInitial}
                </span>
              )}
              <span>{user?.username || t('dashboard.home.userFallback')}</span>
            </span>
          </button>
          {userMenuOpen && (
            <div className="user-menu-popover user-menu-popover-right">
              <button
                type="button"
                className="btn link"
                onClick={() => {
                  closeUserMenu()
                  setUserSettingsOpen(true)
                }}
              >
                {t('dashboard.home.userMenuSettings')}
              </button>
              {user?.is_admin && (
                <button
                  type="button"
                  className="btn link"
                  onClick={() => {
                    closeUserMenu()
                    navigate('/admin')
                  }}
                >
                  {t('dashboard.home.userMenuAdmin')}
                </button>
              )}
              <button
                type="button"
                className="btn link"
                onClick={() => {
                  closeUserMenu()
                  signOut()
                }}
              >
                {t('dashboard.home.userMenuLogout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
