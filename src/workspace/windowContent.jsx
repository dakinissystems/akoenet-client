function humanizeWindowId(id) {
  return String(id || '')
    .split(/[-_]/g)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

/**
 * Preview body per addon category — MVP scaffold until full addon UI ships.
 */
export function getWindowPreviewBody(addon, windowId, locale, t) {
  const cat = addon?.category || 'system'
  const label = humanizeWindowId(windowId)

  if (cat === 'developer' && (windowId.includes('terminal') || windowId === 'logs' || windowId === 'ssh')) {
    return (
      <pre className="ws-preview-terminal">
        {`$ ${windowId === 'railway' ? 'railway logs --tail' : windowId === 'docker' ? 'docker ps' : 'git status'}\n`}
        {t('workspace.previewTerminalHint')}
      </pre>
    )
  }

  if (cat === 'productivity' && windowId.includes('conversation')) {
    return <p className="muted small">{t('workspace.previewAiConversation')}</p>
  }

  if (cat === 'stream') {
    return <p className="muted small">{t('workspace.previewStream', { window: label })}</p>
  }

  if (cat === 'media') {
    return <p className="muted small">{t('workspace.previewMedia')}</p>
  }

  if (addon.id === 'kanban' && windowId.includes('column')) {
    return (
      <ul className="ws-preview-kanban">
        <li>{t('workspace.previewKanbanTodo')}</li>
        <li>{t('workspace.previewKanbanDoing')}</li>
      </ul>
    )
  }

  if (addon.id === 'dashboard') {
    return (
      <div className="ws-preview-metric">
        <strong>—</strong>
        <span className="muted small">{label}</span>
      </div>
    )
  }

  return <p className="muted small">{t('workspace.previewGeneric', { window: label })}</p>
}

export { humanizeWindowId }
