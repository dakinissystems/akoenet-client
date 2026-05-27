export function reportError(context, error) {
  const label = `[${context}]`
  if (error) {
    console.warn(label, error)
    if (import.meta.env.VITE_SENTRY_DSN?.trim()) {
      import("@sentry/react")
        .then((Sentry) => {
          Sentry.captureException(error, { extra: { context } })
        })
        .catch(() => {})
    }
    return
  }
  console.warn(label)
}

