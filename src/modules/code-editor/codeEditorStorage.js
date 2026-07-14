const STORAGE_KEY = 'akoenet.code-editor.v1'

/** @type {((store: object) => void) | null} */
let persistHook = null

const LANG_BY_EXT = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  json: 'json',
  md: 'markdown',
  css: 'css',
  html: 'html',
  sql: 'sql',
  sh: 'shell',
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { files: defaultFiles() }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed?.files)) return { files: defaultFiles() }
    return parsed
  } catch {
    return { files: defaultFiles() }
  }
}

function saveStore(store) {
  try {
    const next = { ...store, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    persistHook?.(next)
  } catch {
    /* ignore */
  }
}

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function defaultFiles() {
  const now = new Date().toISOString()
  return [
    {
      id: 'file_welcome',
      name: 'welcome.js',
      language: 'javascript',
      content: `// Dakinis Code Editor — sandbox local\n\nfunction greet(name) {\n  return \`Hola, \${name}!\`\n}\n\nconsole.log(greet('Workspace'))\n`,
      updatedAt: now,
    },
  ]
}

export function detectLanguage(filename) {
  const ext = String(filename || '').split('.').pop()?.toLowerCase()
  return LANG_BY_EXT[ext] || 'plaintext'
}

export function listFiles() {
  return [...loadStore().files].sort((a, b) => String(a.name).localeCompare(String(b.name)))
}

export function getFile(id) {
  return loadStore().files.find((f) => f.id === id) || null
}

export function createFile(name = 'untitled.js', content = '') {
  const store = loadStore()
  const file = {
    id: newId('file'),
    name: String(name).trim() || 'untitled.js',
    language: detectLanguage(name),
    content: String(content),
    updatedAt: new Date().toISOString(),
  }
  store.files.unshift(file)
  saveStore(store)
  return file
}

export function updateFile(id, patch) {
  const store = loadStore()
  const idx = store.files.findIndex((f) => f.id === id)
  if (idx < 0) return null
  const prev = store.files[idx]
  const nextName = patch.name !== undefined ? String(patch.name).trim() || prev.name : prev.name
  const next = {
    ...prev,
    ...(patch.name !== undefined ? { name: nextName, language: detectLanguage(nextName) } : {}),
    ...(patch.content !== undefined ? { content: String(patch.content) } : {}),
    ...(patch.language !== undefined ? { language: patch.language } : {}),
    updatedAt: new Date().toISOString(),
  }
  store.files[idx] = next
  saveStore(store)
  return next
}

export function deleteFile(id) {
  const store = loadStore()
  store.files = store.files.filter((f) => f.id !== id)
  saveStore(store)
}

export function searchFiles(query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []
  return listFiles().filter((f) => {
    const hay = [f.name, f.content, f.language].join(' ').toLowerCase()
    return hay.includes(q)
  })
}

/**
 * Outline simple — regex para JS/TS/Python.
 * @param {string} content
 * @param {string} [language]
 */
export function extractOutline(content, language = 'javascript') {
  const lines = String(content || '').split('\n')
  /** @type {{ line: number; label: string; kind: string }[]} */
  const items = []
  const lang = String(language || '').toLowerCase()

  lines.forEach((line, i) => {
    const n = i + 1
    if (lang.includes('script') || lang === 'plaintext') {
      const fn = line.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(|class\s+(\w+))/)
      if (fn) {
        items.push({
          line: n,
          label: fn[1] || fn[2] || fn[3] || 'symbol',
          kind: fn[3] ? 'class' : 'function',
        })
      }
    }
    if (lang === 'python') {
      const py = line.match(/^(?:async\s+)?def\s+(\w+)|^class\s+(\w+)/)
      if (py) {
        items.push({ line: n, label: py[1] || py[2], kind: py[2] ? 'class' : 'function' })
      }
    }
  })

  return items
}

/**
 * Problemas básicos — brackets + TODO/FIXME.
 * @param {string} content
 */
export function scanProblems(content) {
  const text = String(content || '')
  /** @type {{ line: number; message: string; severity: 'warn'|'error' }[]} */
  const problems = []

  let depth = 0
  text.split('\n').forEach((line, i) => {
    const n = i + 1
    for (const ch of line) {
      if (ch === '{') depth += 1
      if (ch === '}') depth -= 1
    }
    if (/TODO|FIXME/i.test(line)) {
      problems.push({ line: n, message: 'TODO/FIXME marker', severity: 'warn' })
    }
  })

  if (depth !== 0) {
    problems.push({ line: 1, message: 'Unbalanced curly braces', severity: 'error' })
  }

  return problems
}

export function bindCodeEditorPersistHook(fn) {
  persistHook = fn
}

export function hydrateCodeEditorStore(data) {
  if (!data || typeof data !== 'object') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function dumpCodeEditorStore() {
  return loadStore()
}
