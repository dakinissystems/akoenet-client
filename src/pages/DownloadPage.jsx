import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../components/SiteFooter'
import LandingMarketingNav from '../components/LandingMarketingNav'
import { useLandingLocale } from '../hooks/useLandingLocale'
import { landingContent } from '../lib/landingContent'
import {
  formatInstallerDate,
  getAndroidDownloadMeta,
  getStaticDesktopInstaller,
  getWebAppVersion,
  resolveDesktopInstaller,
} from '../lib/desktopDownloads'

function WindowsCard({ copy, installer, locale }) {
  const d = copy.desktop
  const dateLabel = formatInstallerDate(installer.publishedAt, locale)
  const webV = getWebAppVersion()
  const showWebAhead =
    webV &&
    installer.version &&
    webV !== installer.version &&
    webV.localeCompare(installer.version, undefined, { numeric: true }) > 0

  return (
    <article className="landing-app-card landing-app-card--primary download-platform-card">
      <h2 className="landing-app-card-title">{d.nativeTitle}</h2>
      <p className="landing-app-card-body">{d.nativeBodyHosted}</p>
      <p className="muted small landing-app-not-extension">{d.notExtensionNote}</p>
      <p className="landing-app-card-body download-optional-note">{d.optionalNote}</p>
      {installer.url ? (
        <a
          className="btn primary landing-app-native-download"
          href={installer.url}
          download
          rel="noopener noreferrer"
        >
          {d.nativeDownloadCta}
        </a>
      ) : (
        <p className="muted small">{d.unavailable}</p>
      )}
      {installer.version ? (
        <p className="muted small landing-app-installer-version-hint">
          {d.installerVersionHint.replace('{{v}}', installer.version)}
          {dateLabel ? ` · ${d.installerUpdatedHint.replace('{{d}}', dateLabel)}` : ''}
        </p>
      ) : null}
      {showWebAhead ? <p className="muted small download-version-ahead">{d.webAheadHint.replace('{{web}}', webV)}</p> : null}
      <p className="muted small landing-app-smartscreen-hint">{d.smartscreenHint}</p>
      <p className="muted small download-install-steps">{d.installSteps}</p>
    </article>
  )
}

function AndroidCard({ copy }) {
  const m = copy.mobile
  const { playStoreUrl, apkUrl, storeApproved } = getAndroidDownloadMeta()
  const approved = storeApproved && (playStoreUrl || apkUrl)

  return (
    <article className="landing-app-card download-platform-card">
      <h2 className="landing-app-card-title">{m.androidTitle}</h2>
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
            <a className="btn secondary landing-app-apk-btn" href={apkUrl} download rel="noopener noreferrer">
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
    </article>
  )
}

function ComingSoonCard({ title, body }) {
  return (
    <article className="landing-app-card landing-app-card--muted download-platform-card">
      <h2 className="landing-app-card-title">{title}</h2>
      <p className="landing-app-card-body">{body}</p>
    </article>
  )
}

export default function DownloadPage() {
  const { locale } = useLandingLocale()
  const t = landingContent[locale]
  const page = t.downloadPage
  const [installer, setInstaller] = useState(() => getStaticDesktopInstaller())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const resolved = await resolveDesktopInstaller()
      if (!cancelled) setInstaller(resolved)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.title = page.documentTitle
    return () => {
      document.title = 'AkoeNet'
    }
  }, [page.documentTitle])

  return (
    <div className="landing-page download-page">
      <LandingMarketingNav t={t} locale={locale} />
      <main>
        <section className="landing-section download-hero" aria-labelledby="download-page-title">
          <div className="landing-section-inner">
            <p className="landing-eyebrow">{page.eyebrow}</p>
            <h1 id="download-page-title" className="landing-presence-title">
              {page.title}
            </h1>
            <p className="landing-lead landing-presence-lead">{page.lead}</p>
            <p className="muted small download-web-first">{page.webFirst}</p>
          </div>
        </section>

        <section className="landing-section landing-app" aria-label={page.platformsLabel}>
          <div className="landing-section-inner download-platforms">
            <WindowsCard copy={page} installer={installer} locale={locale} />
            <AndroidCard copy={page} />
            <ComingSoonCard title={page.mobile.iosTitle} body={page.mobile.iosBody} />
            <ComingSoonCard title={page.otherDesktopTitle} body={page.otherDesktopBody} />
          </div>
        </section>

        <section className="landing-section download-back-strip">
          <div className="landing-section-inner">
            <Link to="/" className="btn secondary">
              {page.backHome}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
