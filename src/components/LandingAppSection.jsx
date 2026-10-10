import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { isCapacitorNative } from '../lib/mobile-runtime'
import {
  formatInstallerDate,
  getStaticDesktopInstaller,
  resolveDesktopInstaller,
} from '../lib/desktopDownloads'
import { useLandingLocale } from '../hooks/useLandingLocale'

/**
 * Compact home teaser: Windows CTA + link to full /download page.
 * Full platform cards live on DownloadPage.
 */
export default function LandingAppSection({ t }) {
  const { locale } = useLandingLocale()
  const a = t.appTeaser
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

  if (isCapacitorNative()) return null

  const dateLabel = formatInstallerDate(installer.publishedAt, locale)
  const metaParts = [
    installer.version ? a.versionLabel.replace('{{v}}', installer.version) : null,
    dateLabel ? a.updatedLabel.replace('{{d}}', dateLabel) : null,
  ].filter(Boolean)

  return (
    <section id="download" className="landing-section landing-app landing-app--teaser" aria-labelledby="landing-app-teaser-title">
      <div className="landing-section-inner landing-app-teaser">
        <div className="landing-app-teaser-copy">
          <h2 id="landing-app-teaser-title" className="landing-app-teaser-title">
            {a.title}
          </h2>
          <p className="landing-app-teaser-lead">{a.lead}</p>
          {metaParts.length ? (
            <p className="muted small landing-app-teaser-meta">{metaParts.join(' · ')}</p>
          ) : null}
        </div>
        <div className="landing-app-teaser-actions">
          {installer.url ? (
            <a
              className="btn primary landing-app-native-download"
              href={installer.url}
              download
              rel="noopener noreferrer"
            >
              {a.windowsCta}
            </a>
          ) : null}
          <Link to="/download" className="landing-app-teaser-all">
            {a.allPlatforms}
          </Link>
        </div>
      </div>
    </section>
  )
}
