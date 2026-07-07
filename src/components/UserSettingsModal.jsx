import { useTranslation } from 'react-i18next'
import ModalDialog from './ModalDialog.jsx'
import UserSettingsSections from './UserSettingsSections'
import { useUserSettingsModal } from '../hooks/useUserSettingsModal'

export default function UserSettingsModal({ open, onClose, initialSection = 'profile' }) {
  const settings = useUserSettingsModal({ open, onClose, initialSection })
  const { t, error, info } = settings

  return (
    <ModalDialog open={open} onClose={onClose} ariaLabelledby="user-settings-title" panelClassName="modal-card user-settings-modal">
      <header className="modal-header">
        <h3 id="user-settings-title">{t('userSettings.modalTitle')}</h3>
        <button type="button" className="btn ghost small" onClick={onClose}>
          {t('userSettings.close')}
        </button>
      </header>

      {error && <div className="error-banner inline">{error}</div>}
      {info && <div className="info-banner">{info}</div>}

      <div className="settings-split-layout">
        <aside className="settings-split-nav">
          <button type="button" className={`settings-split-nav-btn ${settings.activeSection === 'profile' ? 'active' : ''}`} onClick={() => settings.setActiveSection('profile')}>{t('userSettings.navProfile')}</button>
          <button type="button" className={`settings-split-nav-btn ${settings.activeSection === 'language' ? 'active' : ''}`} onClick={() => settings.setActiveSection('language')}>{t('userSettings.navLanguage')}</button>
          <button type="button" className={`settings-split-nav-btn ${settings.activeSection === 'appearance' ? 'active' : ''}`} onClick={() => settings.setActiveSection('appearance')}>{t('userSettings.navAppearance')}</button>
          <button type="button" className={`settings-split-nav-btn ${settings.activeSection === 'activity' ? 'active' : ''}`} onClick={() => settings.setActiveSection('activity')}>{t('userSettings.activity.navTab')}</button>
          <button type="button" className={`settings-split-nav-btn ${settings.activeSection === 'account' ? 'active' : ''}`} onClick={() => settings.setActiveSection('account')}>{t('userSettings.navAccount')}</button>
          <button type="button" className={`settings-split-nav-btn ${settings.activeSection === 'voice' ? 'active' : ''}`} onClick={() => settings.setActiveSection('voice')}>{t('userSettings.navVoice')}</button>
        </aside>
        <section className="settings-split-content">
          <UserSettingsSections {...settings} />
        </section>
      </div>
    </ModalDialog>
  )
}
