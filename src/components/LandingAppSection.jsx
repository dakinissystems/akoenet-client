import { useEffect, useState } from 'react'
import {
  getLandingDeviceKind,
  isAndroidBrowser,
  isIosBrowser,
  isWindowsBrowser,
} from '../lib/landingDevice'
import { isCapacitorNative } from '../lib/mobile-runtime'

const appVersion = typeof __APP_VERSION__ !== 'undefined' ? String(__APP_VERSION__) : '1.5.12'

const desktopInstallerUrl =
  String(import.meta.env.VITE_DESKTOP_INSTALLER_URL || '').trim() ||
  `/releases/desktop/AkoeNet_${appVersion}_x64-setup.exe`
const desktopInstallerVersionEnv = String(import.meta.env.VITE_DESKTOP_INSTALLER_VERSION || appVersion).trim()
const playStoreUrl = String(import.meta.env.VITE_ANDROID_PLAY_STORE_URL || '').trim()
const apkUrl = String(import.meta.env.VITE_ANDROID_APK_URL || '').trim()
const androidStoreApproved =
  String(import.meta.env.VITE_ANDROID_STORE_APPROVED || '').trim().toLowerCase() === 'true'

function semverFromInstallerUrl(url) {
  if (!url || typeof url !== 'string') return null
  let path = url
  if (url.includes('://')) {
    try {
      path = new URL(url).pathname
    } catch {
      return null
    }
  }
  const fromFile = path.match(/AkoeNet[_-](\d+\.\d+\.\d+)/i)
  if (fromFile) return fromFile[1]
  const loose = path.match(/(\d+\.\d+\.\d+)/g)
  return loose ? loose[loose.length - 1] : null
}

function installerSemverForDisplay() {
  if (/^\d+\.\d+\.\d+$/.test(desktopInstallerVersionEnv)) return desktopInstallerVersionEnv
  return semverFromInstallerUrl(desktopInstallerUrl)
}

function WindowsDownloadCard({ copy }) {
  const d = copy.desktop
  const version = installerSemverForDisplay()
  return (
    <div className="landing-app-card landing-app-card--primary">
      <h3 className="landing-app-card-title">{d.nativeTitle}</h3>
      <p className="landing-app-card-body">{d.nativeBodyHosted}</p>
      <p className="muted small landing-app-not-extension">{d.notExtensionNote}</p>
      <a
        className="btn primary landing-app-native-download"
        href={desktopInstallerUrl}
        download
        rel="noopener noreferrer"
      >
        {d.nativeDownloadCta}
      </a>
      {version ? (
        <p className="muted small landing-app-installer-version-hint">
          {d.installerVersionHint.replace('{{v}}', version)}
        </p>
      ) : null}
      <p className="muted small landing-app-smartscreen-hint">{d.smartscreenHint}</p>
    </div>
  )
}

function MobileDownloadCard({ copy, mobileOs }) {
  const m = copy.mobile
  const approved = androidStoreApproved && (playStoreUrl || apkUrl)

  if (mobileOs === 'android') {
    return (
      <div className="landing-app-card landing-app-card--primary">
        <h3 className="landing-app-card-title">{m.androidTitle}</h3>
        {approved ? (
          <>
            <p className="landing-app-card-body">{m.androidBodyApproved}</p>
            {playStoreUrl ? (
              <a
                className="btn primary landing-app-store-btn"
                href={playStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {m.playStoreCta}
              </a>
            ) : null}
            {apkUrl ? (
              <a
                className="btn secondary landing-app-apk-btn"
                href={apkUrl}
                download
                rel="noopener noreferrer"
              >
                {m.apkCta}
              </a>
            ) : null}
          </>
        ) : (
          <>
            <p className="landing-app-card-body">{m.androidBodyPending}</p>
            <p className="muted small landing-app-not-extension">{m.notExtensionNote}</p>
          </>
        )}
      </div>
    )
  }

  if (mobileOs === 'ios') {
    return (
      <div className="landing-app-card landing-app-card--muted">
        <h3 className="landing-app-card-title">{m.iosTitle}</h3>
        <p className="landing-app-card-body">{m.iosBody}</p>
      </div>
    )
  }

  return (
    <div className="landing-app-card landing-app-card--muted">
      <h3 className="landing-app-card-title">{m.otherTitle}</h3>
      <p className="landing-app-card-body">{m.otherBody}</p>
    </div>
  )
}

export default function LandingAppSection({ t }) {
  const a = t.appSection
  const nativeMobileApp = isCapacitorNative()
  const [kind, setKind] = useState(() => getLandingDeviceKind())

  const isMobile = kind === 'mobile' || kind === 'tablet'
  const mobileOs = isIosBrowser() ? 'ios' : isAndroidBrowser() ? 'android' : 'other'
  const showWindowsDownload = !isMobile && isWindowsBrowser()

  useEffect(() => {
    setKind(getLandingDeviceKind())
  }, [])

  if (nativeMobileApp) return null

  return (
    <section id="app" className="landing-section landing-app" aria-labelledby="landing-app-title">
      <div className="landing-section-inner landing-app-inner">
        <h2 id="landing-app-title" className="landing-section-title">
          {a.title}
        </h2>
        <p className="landing-app-lead">{a.lead}</p>
        <p className="muted small landing-app-not-extension landing-app-lead-note">{a.notExtensionLead}</p>

        <div className="landing-app-columns landing-app-columns--download">
          {isMobile ? (
            <MobileDownloadCard copy={a} mobileOs={mobileOs} />
          ) : showWindowsDownload ? (
            <WindowsDownloadCard copy={a} />
          ) : (
            <div className="landing-app-card landing-app-card--primary">
              <h3 className="landing-app-card-title">{a.desktop.nativeTitle}</h3>
              <p className="landing-app-card-body">{a.desktop.nativeBodyHosted}</p>
              <p className="muted small">{a.desktop.nonWindowsHint}</p>
              <a
                className="btn primary landing-app-native-download"
                href={desktopInstallerUrl}
                download
                rel="noopener noreferrer"
              >
                {a.desktop.nativeDownloadCta}
              </a>
            </div>
          )}
        </div>

        <p className="muted small landing-app-web-fallback">{a.webFallback}</p>
      </div>
    </section>
  )
}
