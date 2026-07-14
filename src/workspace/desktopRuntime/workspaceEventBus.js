/**
 * Event bus ligero del Workspace OS (CustomEvent en window).
 * @param {string} name — e.g. layout.restored
 * @param {unknown} [detail]
 */
export function emitWorkspaceEvent(name, detail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(`akoenet:workspace:${name}`, { detail }))
}

/**
 * @param {string} name
 * @param {(detail: unknown) => void} handler
 */
export function onWorkspaceEvent(name, handler) {
  if (typeof window === 'undefined') return () => {}
  const eventName = `akoenet:workspace:${name}`
  function listener(e) {
    handler(e.detail)
  }
  window.addEventListener(eventName, listener)
  return () => window.removeEventListener(eventName, listener)
}
