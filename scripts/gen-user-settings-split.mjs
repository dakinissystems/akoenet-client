import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'src')
const lines = fs.readFileSync(path.join(root, 'components/UserSettingsModal.jsx'), 'utf8').split(/\r?\n/)

const helpers = `export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}

export function toNullable(value) {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

export function getVoiceStorageKey(userId) {
  return \`akoenet_voice_settings_\${userId || 'anon'}\`
}
`
fs.writeFileSync(path.join(root, 'lib/userSettingsHelpers.js'), helpers)

const hookBody = lines.slice(43, 456).join('\n')
const sectionsBody = lines.slice(479, 1165).join('\n')

const hookHeader = `import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useAuthLogout } from '../hooks/useAuthLogout'
import {
  buildMicTestMonitorGraph,
  getMicMonitorPlaybackGain,
  getMicTestAudioConstraints,
} from '../lib/voiceConstraints'
import { getSavedVoiceSettings } from '../lib/voiceSettings'
import {
  DARK_THEME,
  LIGHT_THEME,
  applyTheme,
  loadTheme,
  sanitizeFull,
  saveTheme,
} from '../lib/themePreferences'
import { isTauri } from '../lib/isTauri'
import { getVoiceStorageKey, toNullable, urlBase64ToUint8Array } from '../lib/userSettingsHelpers'

export function useUserSettingsModal({ open, onClose, initialSection = 'profile' }) {
`

const hookFooter = `
  return {
    t,
    user,
    activeSection,
    setActiveSection,
    username,
    setUsername,
    avatarUrl,
    setAvatarUrl,
    bannerUrl,
    setBannerUrl,
    accentColor,
    setAccentColor,
    bio,
    setBio,
    presenceStatus,
    setPresenceStatus,
    customStatus,
    setCustomStatus,
    schedulerStreamerUsername,
    setSchedulerStreamerUsername,
    avatarPreviewFailed,
    setAvatarPreviewFailed,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    saving,
    error,
    setError,
    info,
    setInfo,
    testing,
    eraseConfirm,
    setEraseConfirm,
    exportBusy,
    eraseBusy,
    logoutAllBusy,
    totpSetupSecret,
    setTotpSetupSecret,
    totpEnableCode,
    setTotpEnableCode,
    disable2faPassword,
    setDisable2faPassword,
    disable2faCode,
    setDisable2faCode,
    micLevel,
    micGain,
    setMicGain,
    monitorMic,
    setMonitorMic,
    startWithCamera,
    setStartWithCamera,
    startMuted,
    setStartMuted,
    startDeafened,
    setStartDeafened,
    shareGameActivity,
    setShareGameActivity,
    desktopGameDetect,
    setDesktopGameDetect,
    manualGame,
    setManualGame,
    manualPlatform,
    setManualPlatform,
    activitySaving,
    steamBusy,
    twitchBusy,
    twitchGate,
    setTwitchStatusRetryToken,
    uiTheme,
    setUiTheme,
    previewStyle,
    saveUserSettings,
    downloadMyData,
    eraseMyAccount,
    saveActivitySettings,
    connectTwitch,
    unlinkTwitch,
    connectSteam,
    unlinkSteam,
    startMicTest,
    stopMicTest,
    refreshUser,
    signOut,
    signOutAllDevices,
    onClose,
  }
}
`

fs.writeFileSync(path.join(root, 'hooks/useUserSettingsModal.js'), hookHeader + hookBody + hookFooter)

const sectionsHeader = `import LanguageSwitcher from './LanguageSwitcher'
import { resolveImageUrl } from '../lib/resolveImageUrl'
import { DARK_THEME, LIGHT_THEME, sanitizeFull, saveTheme, applyTheme } from '../lib/themePreferences'
import { isTauri } from '../lib/isTauri'
import api from '../services/api'
import { urlBase64ToUint8Array } from '../lib/userSettingsHelpers'

export default function UserSettingsSections(props) {
  const {
    t,
    user,
    activeSection,
    username,
    setUsername,
    avatarUrl,
    setAvatarUrl,
    bannerUrl,
    setBannerUrl,
    accentColor,
    setAccentColor,
    bio,
    setBio,
    presenceStatus,
    setPresenceStatus,
    customStatus,
    setCustomStatus,
    schedulerStreamerUsername,
    setSchedulerStreamerUsername,
    avatarPreviewFailed,
    setAvatarPreviewFailed,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    saving,
    eraseConfirm,
    setEraseConfirm,
    exportBusy,
    eraseBusy,
    logoutAllBusy,
    totpSetupSecret,
    setTotpSetupSecret,
    totpEnableCode,
    setTotpEnableCode,
    disable2faPassword,
    setDisable2faPassword,
    disable2faCode,
    setDisable2faCode,
    micLevel,
    micGain,
    setMicGain,
    monitorMic,
    setMonitorMic,
    startWithCamera,
    setStartWithCamera,
    startMuted,
    setStartMuted,
    startDeafened,
    setStartDeafened,
    shareGameActivity,
    setShareGameActivity,
    desktopGameDetect,
    setDesktopGameDetect,
    manualGame,
    setManualGame,
    manualPlatform,
    setManualPlatform,
    activitySaving,
    steamBusy,
    twitchBusy,
    twitchGate,
    setTwitchStatusRetryToken,
    uiTheme,
    setUiTheme,
    previewStyle,
    saveUserSettings,
    downloadMyData,
    eraseMyAccount,
    saveActivitySettings,
    connectTwitch,
    unlinkTwitch,
    connectSteam,
    unlinkSteam,
    startMicTest,
    stopMicTest,
    refreshUser,
    signOutAllDevices,
    onClose,
    setError,
    setInfo,
  } = props

  return (
    <>
`

fs.writeFileSync(
  path.join(root, 'components/UserSettingsSections.jsx'),
  sectionsHeader + sectionsBody.replace(/^          <section/m, '      <section').replace(/^        \{activeSection/m, '      {activeSection') + '\n    </>\n  )\n}\n'
)

fs.writeFileSync(
  path.join(root, 'components/UserSettingsModal.jsx'),
  `import { useTranslation } from 'react-i18next'
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
          <button type="button" className={\`settings-split-nav-btn \${settings.activeSection === 'profile' ? 'active' : ''}\`} onClick={() => settings.setActiveSection('profile')}>{t('userSettings.navProfile')}</button>
          <button type="button" className={\`settings-split-nav-btn \${settings.activeSection === 'language' ? 'active' : ''}\`} onClick={() => settings.setActiveSection('language')}>{t('userSettings.navLanguage')}</button>
          <button type="button" className={\`settings-split-nav-btn \${settings.activeSection === 'appearance' ? 'active' : ''}\`} onClick={() => settings.setActiveSection('appearance')}>{t('userSettings.navAppearance')}</button>
          <button type="button" className={\`settings-split-nav-btn \${settings.activeSection === 'activity' ? 'active' : ''}\`} onClick={() => settings.setActiveSection('activity')}>{t('userSettings.activity.navTab')}</button>
          <button type="button" className={\`settings-split-nav-btn \${settings.activeSection === 'account' ? 'active' : ''}\`} onClick={() => settings.setActiveSection('account')}>{t('userSettings.navAccount')}</button>
          <button type="button" className={\`settings-split-nav-btn \${settings.activeSection === 'voice' ? 'active' : ''}\`} onClick={() => settings.setActiveSection('voice')}>{t('userSettings.navVoice')}</button>
        </aside>
        <section className="settings-split-content">
          <UserSettingsSections {...settings} />
        </section>
      </div>
    </ModalDialog>
  )
}
`
)

console.log('UserSettings split done')
