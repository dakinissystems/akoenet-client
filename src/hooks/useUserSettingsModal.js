import { useEffect, useMemo, useRef, useState } from 'react'
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
  const { t } = useTranslation()
  const { user, refreshUser } = useAuth()
  const { signOut, signOutAllDevices } = useAuthLogout()
  const [activeSection, setActiveSection] = useState('profile')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [accentColor, setAccentColor] = useState('#7c3aed')
  const [bio, setBio] = useState('')
  const [presenceStatus, setPresenceStatus] = useState('online')
  const [customStatus, setCustomStatus] = useState('')
  const [schedulerStreamerUsername, setSchedulerStreamerUsername] = useState('')
  const [avatarPreviewFailed, setAvatarPreviewFailed] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [testing, setTesting] = useState(false)
  const [eraseConfirm, setEraseConfirm] = useState('')
  const [exportBusy, setExportBusy] = useState(false)
  const [eraseBusy, setEraseBusy] = useState(false)
  const [logoutAllBusy, setLogoutAllBusy] = useState(false)
  const [totpSetupSecret, setTotpSetupSecret] = useState('')
  const [totpEnableCode, setTotpEnableCode] = useState('')
  const [disable2faPassword, setDisable2faPassword] = useState('')
  const [disable2faCode, setDisable2faCode] = useState('')
  const [micLevel, setMicLevel] = useState(0)
  const [micGain, setMicGain] = useState(100)
  const [monitorMic, setMonitorMic] = useState(false)
  const [startWithCamera, setStartWithCamera] = useState(false)
  const [startMuted, setStartMuted] = useState(false)
  const [startDeafened, setStartDeafened] = useState(false)
  const [shareGameActivity, setShareGameActivity] = useState(true)
  const [desktopGameDetect, setDesktopGameDetect] = useState(false)
  const [manualGame, setManualGame] = useState('')
  const [manualPlatform, setManualPlatform] = useState('')
  const [activitySaving, setActivitySaving] = useState(false)
  const [steamBusy, setSteamBusy] = useState(false)
  const [twitchBusy, setTwitchBusy] = useState(false)
  const [twitchGate, setTwitchGate] = useState(/** @type {'loading' | 'ready' | 'disabled' | 'unreachable'} */ ('loading'))
  const [twitchStatusRetryToken, setTwitchStatusRetryToken] = useState(0)
  const [uiTheme, setUiTheme] = useState(() => sanitizeFull({}))
  const [themeReady, setThemeReady] = useState(false)
  const [levelUnlocks, setLevelUnlocks] = useState(null)
  const streamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const dataRef = useRef(null)
  const gainNodeRef = useRef(null)
  const monitorGainRef = useRef(null)
  const loopRef = useRef(null)

  const [formSyncKey, setFormSyncKey] = useState('')
  const nextFormSyncKey = open ? `${user?.id ?? ''}:${initialSection ?? 'profile'}` : ''
  if (open && nextFormSyncKey !== formSyncKey) {
    setFormSyncKey(nextFormSyncKey)
    setActiveSection(initialSection || 'profile')
    setUsername(user?.username || '')
    setAvatarUrl(user?.avatar_url || '')
    setAvatarPreviewFailed(false)
    setBannerUrl(user?.banner_url || '')
    setAccentColor(user?.accent_color || '#7c3aed')
    setBio(user?.bio || '')
    setPresenceStatus(user?.presence_status || 'online')
    setCustomStatus(user?.custom_status || '')
    setSchedulerStreamerUsername(user?.scheduler_streamer_username || '')
    setCurrentPassword('')
    setNewPassword('')
    setEraseConfirm('')
    setError('')
    setInfo('')
    const voice = getSavedVoiceSettings(user?.id)
    setMicGain(voice.micGain)
    setMonitorMic(voice.monitorMic)
    setStartWithCamera(voice.startWithCamera)
    setStartMuted(voice.startMuted)
    setStartDeafened(voice.startDeafened)
  }
  if (!open && formSyncKey) {
    setFormSyncKey('')
    stopMicTest()
  }

  const [themeSyncKey, setThemeSyncKey] = useState('')
  const nextThemeSyncKey = open ? String(user?.id ?? '') : ''
  if (open && nextThemeSyncKey !== themeSyncKey) {
    setThemeSyncKey(nextThemeSyncKey)
    setUiTheme(loadTheme(user?.id))
    setThemeReady(true)
  }
  if (!open && themeSyncKey) {
    setThemeSyncKey('')
    setThemeReady(false)
  }

  const [prevAvatarUrl, setPrevAvatarUrl] = useState(avatarUrl)
  if (avatarUrl !== prevAvatarUrl) {
    setPrevAvatarUrl(avatarUrl)
    setAvatarPreviewFailed(false)
  }

  useEffect(() => {
    if (!open || !themeReady) return
    if (activeSection === 'appearance') {
      const appliedTheme = saveTheme(user?.id, uiTheme)
      applyTheme(appliedTheme, { accentColor: accentColor || user?.accent_color })
    } else {
      applyTheme(loadTheme(user?.id), { accentColor: accentColor || user?.accent_color })
    }
  }, [open, themeReady, activeSection, uiTheme, accentColor, user?.accent_color, user?.id])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    api
      .get('/auth/me/level-unlocks')
      .then((r) => {
        if (!cancelled) setLevelUnlocks(r.data || null)
      })
      .catch(() => {
        if (!cancelled) setLevelUnlocks(null)
      })
    return () => {
      cancelled = true
    }
  }, [open, user?.id])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const ac = new AbortController()
    setTwitchGate('loading')
    api
      .get('/auth/twitch/status', { signal: ac.signal })
      .then((r) => {
        if (!cancelled) setTwitchGate(r.data?.configured ? 'ready' : 'disabled')
      })
      .catch(() => {
        if (!cancelled) setTwitchGate('unreachable')
      })
    return () => {
      cancelled = true
      ac.abort()
    }
  }, [open, twitchStatusRetryToken])

  const canEditAccent = Boolean(
    user?.is_admin || levelUnlocks == null || levelUnlocks?.unlocked?.profile_color
  )
  const canEditBanner = Boolean(
    user?.is_admin || levelUnlocks == null || levelUnlocks?.unlocked?.profile_banner
  )
  const unlockAt = levelUnlocks?.unlockAt || { profile_color: 5, profile_banner: 10 }

  useEffect(() => {
    if (!open) return
    try {
      localStorage.setItem(
        getVoiceStorageKey(user?.id),
        JSON.stringify({
          micGain,
          monitorMic,
          startWithCamera,
          cameraEnabled: startWithCamera,
          startMuted,
          startDeafened,
        }),
      )
    } catch {
      /* ignore storage errors */
    }
    if (gainNodeRef.current) gainNodeRef.current.gain.value = micGain / 100
    if (monitorGainRef.current)
      monitorGainRef.current.gain.value = monitorMic ? getMicMonitorPlaybackGain(micGain) : 0
  }, [open, user?.id, micGain, monitorMic, startWithCamera, startMuted, startDeafened])

  const previewStyle = useMemo(
    () => ({
      border: `1px solid ${accentColor || '#7c3aed'}`,
      borderRadius: '10px',
      overflow: 'hidden',
      background: '#111827',
      marginBottom: '0.7rem',
    }),
    [accentColor],
  )

  async function downloadMyData() {
    setExportBusy(true)
    setError('')
    setInfo('')
    try {
      const { data } = await api.get('/auth/me/export', { responseType: 'blob' })
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `akoenet-user-${user?.id}-export.json`
      a.click()
      window.URL.revokeObjectURL(url)
      setInfo(t('userSettings.account.exportDone'))
    } catch {
      setError(t('userSettings.account.exportFail'))
    } finally {
      setExportBusy(false)
    }
  }

  async function eraseMyAccount() {
    if (eraseConfirm.trim().toUpperCase() !== 'DELETE') {
      setError(t('userSettings.account.eraseConfirmError'))
      return
    }
    setEraseBusy(true)
    setError('')
    setInfo('')
    try {
      await api.delete('/auth/me', { data: { reason: 'User requested self-service account erasure (Settings).' } })
      onClose()
      signOut()
    } catch {
      setError(t('userSettings.account.eraseFail'))
    } finally {
      setEraseBusy(false)
    }
  }

  async function saveActivitySettings() {
    setActivitySaving(true)
    setError('')
    setInfo('')
    try {
      await api.patch('/auth/me', {
        share_game_activity: shareGameActivity,
        desktop_game_detect_opt_in: desktopGameDetect,
        manual_activity_game: toNullable(manualGame),
        manual_activity_platform: toNullable(manualPlatform),
      })
      await refreshUser()
      setInfo(t('userSettings.activity.savedInfo'))
    } catch (err) {
      const code = err.response?.data?.error
      setError(
        code === 'blocked_content'
          ? err.response?.data?.message || t('userSettings.activity.errorBlocked')
          : err.response?.data?.error || t('userSettings.activity.errorSave')
      )
    } finally {
      setActivitySaving(false)
    }
  }

  async function connectTwitch() {
    if (twitchGate !== 'ready') {
      setError(
        twitchGate === 'unreachable'
          ? t('userSettings.activity.errorTwitchApiUnreachable')
          : t('userSettings.activity.errorTwitchUnavailable')
      )
      return
    }
    setTwitchBusy(true)
    setError('')
    try {
      const { data } = await api.post('/auth/twitch/link/begin')
      if (data?.url) window.location.href = data.url
    } catch {
      setError(t('userSettings.activity.errorTwitchStart'))
    } finally {
      setTwitchBusy(false)
    }
  }

  async function unlinkTwitch() {
    setActivitySaving(true)
    setError('')
    setInfo('')
    try {
      await api.patch('/auth/me', { twitch_unlink: true })
      await refreshUser()
      setInfo(t('userSettings.activity.twitchUnlinkedInfo'))
    } catch {
      setError(t('userSettings.activity.errorTwitchUnlink'))
    } finally {
      setActivitySaving(false)
    }
  }

  async function connectSteam() {
    if (!user?.steam_status?.web_api_configured) {
      setError(t('userSettings.activity.errorUnavailable'))
      return
    }
    setSteamBusy(true)
    setError('')
    try {
      const { data } = await api.post('/auth/steam/link/begin')
      if (data?.url) window.location.href = data.url
    } catch {
      setError(t('userSettings.activity.errorSteamStart'))
    } finally {
      setSteamBusy(false)
    }
  }

  async function unlinkSteam() {
    setActivitySaving(true)
    setError('')
    setInfo('')
    try {
      await api.patch('/auth/me', { steam_unlink: true })
      await refreshUser()
      setInfo(t('userSettings.activity.unlinkedInfo'))
    } catch {
      setError(t('userSettings.activity.errorUnlink'))
    } finally {
      setActivitySaving(false)
    }
  }

  async function saveUserSettings() {
    if (!username.trim()) {
      setError(t('userSettings.errors.usernameRequired'))
      return
    }
    if (newPassword && !currentPassword) {
      setError(t('userSettings.errors.passwordRequired'))
      return
    }
    setSaving(true)
    setError('')
    setInfo('')
    try {
      await api.patch('/auth/me', {
        username: username.trim(),
        avatar_url: toNullable(avatarUrl),
        banner_url: canEditBanner ? toNullable(bannerUrl) : undefined,
        accent_color: canEditAccent ? toNullable(accentColor) : undefined,
        bio: toNullable(bio),
        presence_status: presenceStatus,
        custom_status: toNullable(customStatus),
        scheduler_streamer_username: toNullable(schedulerStreamerUsername),
        current_password: newPassword ? currentPassword : undefined,
        new_password: newPassword || undefined,
      })
      await refreshUser()
      setCurrentPassword('')
      setNewPassword('')
      setInfo(t('userSettings.errors.settingsSaved'))
    } catch (err) {
      const data = err.response?.data
      const code = data?.error
      if (code === 'unlock_required') {
        const level = data?.unlockAt
        const unlock = data?.unlock
        setError(
          unlock === 'profile_banner'
            ? t('userSettings.profile.unlockBanner', { level: level || 10 })
            : t('userSettings.profile.unlockAccent', { level: level || 5 })
        )
      } else {
        setError(
          code === 'blocked_content'
            ? data?.message || t('userSettings.errors.notAllowed')
            : data?.error || t('userSettings.errors.saveFailed')
        )
      }
    } finally {
      setSaving(false)
    }
  }

  function computeLevel() {
    const analyser = analyserRef.current
    const data = dataRef.current
    if (!analyser || !data) return 0
    analyser.getByteTimeDomainData(data)
    let sum = 0
    for (let i = 0; i < data.length; i += 1) {
      const centered = (data[i] - 128) / 128
      sum += centered * centered
    }
    return Math.sqrt(sum / data.length)
  }

  function startLoop() {
    if (loopRef.current) return
    loopRef.current = window.setInterval(() => {
      const level = computeLevel()
      setMicLevel(Math.min(1, level * 4))
    }, 120)
  }

  function stopLoop() {
    if (!loopRef.current) return
    window.clearInterval(loopRef.current)
    loopRef.current = null
  }

  async function startMicTest() {
    if (testing) return
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: getMicTestAudioConstraints() })
      streamRef.current = stream
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) {
        setError(t('voiceSettings.errAudioContext'))
        stopMicTest()
        return
      }
      const ctx = new Ctx()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      await ctx.resume()
      const { gain, monitorGain, analyser } = buildMicTestMonitorGraph(ctx, source, {
        micGain,
        monitorMic,
      })
      gainNodeRef.current = gain
      monitorGainRef.current = monitorGain
      analyserRef.current = analyser
      dataRef.current = new Uint8Array(analyser.fftSize)
      startLoop()
      setTesting(true)
    } catch {
      setError(t('voiceSettings.errMicAccess'))
    }
  }

  function stopMicTest() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
    }
    audioCtxRef.current = null
    analyserRef.current = null
    dataRef.current = null
    gainNodeRef.current = null
    monitorGainRef.current = null
    stopLoop()
    setMicLevel(0)
    setTesting(false)
  }

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
    canEditAccent,
    canEditBanner,
    unlockAt,
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
    setLogoutAllBusy,
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
