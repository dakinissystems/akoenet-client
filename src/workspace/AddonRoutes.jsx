import { Component, lazy, Suspense } from 'react'
import { Route } from 'react-router-dom'
import { IMPLEMENTED_ADDON_ROUTES, lazyAddonRoot, getManifestById } from './addonLoader.js'

class AddonErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      const label = this.props.addonId || 'addon'
      return (
        <div className="workspace-addon-error" role="alert">
          <h2>Could not load {label}</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button type="button" onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function AddonLazyBoundary({ addonId }) {
  const importer = lazyAddonRoot(addonId)
  if (!importer) return null
  const LazyRoot = lazy(importer)
  const manifest = getManifestById(addonId)
  const label = manifest?.name || addonId

  return (
    <AddonErrorBoundary addonId={label}>
      <Suspense fallback={<div className="workspace-loading">Loading…</div>}>
        <LazyRoot />
      </Suspense>
    </AddonErrorBoundary>
  )
}

/**
 * Dynamic workspace addon routes from manifest.json discovery.
 * @param {React.ComponentType<{ children: React.ReactNode }>} [AuthGate]
 */
export function buildWorkspaceAddonRoutes(AuthGate) {
  const Gate = AuthGate || (({ children }) => children)
  return Object.entries(IMPLEMENTED_ADDON_ROUTES).map(([addonId, routePath]) => {
    const pattern = `${routePath.replace(/\/$/, '')}/*`
    return (
      <Route
        key={addonId}
        path={pattern}
        element={
          <Gate>
            <AddonLazyBoundary addonId={addonId} />
          </Gate>
        }
      />
    )
  })
}
