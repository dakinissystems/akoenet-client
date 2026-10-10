import { Link, useLocation } from 'react-router-dom'
import LanguageSwitcher from './LanguageSwitcher'

/**
 * Shared top nav for public marketing pages (home, /download).
 * @param {{ t: { nav: Record<string, string> }, locale: string }} props
 */
export default function LandingMarketingNav({ t, locale }) {
  const { pathname } = useLocation()
  const onHome = pathname === '/'
  const featuresHref = onHome ? '#features' : '/#features'
  const faqHref = onHome ? '#faq' : '/#faq'

  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">
        <Link to="/" className="landing-logo landing-logo--link">
          <span className="landing-logo-text">AkoeNet</span>
          <img src="/Akoenet.png" alt="" className="landing-logo-mark" aria-hidden="true" />
        </Link>
        <nav className="landing-nav-links" aria-label={locale === 'es' ? 'Principal' : 'Primary'}>
          <LanguageSwitcher ariaLabel={t.nav.langLabel} />
          <a href={featuresHref}>{t.nav.features}</a>
          <Link to="/download">{t.nav.downloads}</Link>
          <a href={faqHref}>{t.nav.faq}</a>
          <Link to="/legal/terminos">{t.nav.terms}</Link>
          <Link to="/legal/privacidad">{t.nav.privacy}</Link>
          <Link to="/login" className="btn ghost small landing-nav-cta">
            {t.nav.signIn}
          </Link>
          <Link to="/register" className="btn primary small">
            {t.nav.signUp}
          </Link>
        </nav>
      </div>
    </header>
  )
}
