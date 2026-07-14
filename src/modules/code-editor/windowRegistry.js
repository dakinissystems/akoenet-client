export const CODE_EDITOR_WINDOW_REGISTRY = [
  {
    id: 'code-editor.explorer',
    title: 'Explorer',
    defaultRect: { x: 48, y: 56, width: 220, height: 420 },
    defaultVisible: true,
    snapTo: ['code-editor.editor', 'code-editor.outline'],
  },
  {
    id: 'code-editor.editor',
    title: 'Editor',
    defaultRect: { x: 280, y: 56, width: 540, height: 420 },
    defaultVisible: true,
    snapTo: ['code-editor.explorer', 'code-editor.outline'],
  },
  {
    id: 'code-editor.outline',
    title: 'Outline',
    defaultRect: { x: 48, y: 488, width: 772, height: 120 },
    defaultVisible: true,
    snapTo: ['code-editor.explorer'],
  },
]

export function codeEditorDefaultLayout() {
  return CODE_EDITOR_WINDOW_REGISTRY.map((desc, i) => ({
    id: desc.id,
    title: desc.title,
    rect: { ...desc.defaultRect },
    visible: desc.defaultVisible ?? true,
    minimized: false,
    zIndex: i + 1,
  }))
}
