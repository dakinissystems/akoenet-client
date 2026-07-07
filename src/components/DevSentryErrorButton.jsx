import './DevSentryErrorButton.css'

export default function DevSentryErrorButton() {
  const show =
    import.meta.env.DEV ||
    String(import.meta.env.VITE_SENTRY_TEST_BUTTON || '').toLowerCase() === 'true'

  if (!show) return null
  if (!import.meta.env.VITE_SENTRY_DSN?.trim()) return null

  return (
    <button
      type="button"
      className="dev-sentry-error-button"
      onClick={() => {
        throw new Error('This is your first error!')
      }}
      title="Sentry verify — quitar en producción"
    >
      Break the world
    </button>
  )
}
