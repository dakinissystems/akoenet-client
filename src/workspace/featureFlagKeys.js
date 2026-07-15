/** Mirrors @dakinis/shared-feature-flags/keys — keep in sync. */
export const WORKSPACE_ADDON_FLAGS = {
  calendar: 'workspace.addon.calendar',
  codeEditor: 'workspace.addon.code-editor',
  terminal: 'workspace.addon.terminal',
  kanban: 'workspace.addon.kanban',
  notes: 'workspace.addon.notes',
  devops: 'workspace.addon.devops',
  monitor: 'workspace.addon.monitor',
  dashboard: 'workspace.addon.dashboard',
  mediaPlayer: 'workspace.addon.media-player',
}

export const ADDON_ID_TO_FLAG = {
  calendar: WORKSPACE_ADDON_FLAGS.calendar,
  'code-editor': WORKSPACE_ADDON_FLAGS.codeEditor,
  terminal: WORKSPACE_ADDON_FLAGS.terminal,
  kanban: WORKSPACE_ADDON_FLAGS.kanban,
  notes: WORKSPACE_ADDON_FLAGS.notes,
  devops: WORKSPACE_ADDON_FLAGS.devops,
  monitor: WORKSPACE_ADDON_FLAGS.monitor,
  dashboard: WORKSPACE_ADDON_FLAGS.dashboard,
  'media-player': WORKSPACE_ADDON_FLAGS.mediaPlayer,
}

export const DEFAULT_EVAL_KEYS = Object.values(WORKSPACE_ADDON_FLAGS)
