import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const files = [
  'src/components/ChatMessageList.jsx',
  'src/components/DirectMessagesPanel.jsx',
  'src/components/ServerCustomContentSettings.jsx',
  'src/components/ServerRolesTab.jsx',
  'src/components/ServerSettingsModal.jsx',
  'src/components/UserSettingsModal.jsx',
  'src/components/VoiceRoom.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/DashboardAdmin.jsx',
  'src/pages/Login.jsx',
  'src/pages/ServerView.jsx',
]

function countMainExport(file) {
  const text = fs.readFileSync(path.join(root, file), 'utf8')
  const m = text.match(/export default function [\s\S]*?\{/)
  if (!m) return { file: path.basename(file), err: 'no match' }
  const start = text.indexOf(m[0])
  let i = start + m[0].length
  let depth = 1
  let inStr = null
  let inTpl = 0
  while (i < text.length && depth > 0) {
    const c = text[i]
    const n = text[i + 1]
    if (inStr) {
      if (c === '\\') {
        i += 2
        continue
      }
      if (c === inStr) inStr = null
      i++
      continue
    }
    if (inTpl) {
      if (c === '\\') {
        i += 2
        continue
      }
      if (c === '`') inTpl--
      i++
      continue
    }
    if (c === '"' || c === "'") {
      inStr = c
      i++
      continue
    }
    if (c === '`') {
      inTpl++
      i++
      continue
    }
    if (c === '/' && n === '/') {
      while (i < text.length && text[i] !== '\n') i++
      continue
    }
    if (c === '/' && n === '*') {
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++
      i += 2
      continue
    }
    if (c === '{') depth++
    else if (c === '}') depth--
    i++
  }
  const fn = text.slice(start, i)
  return { file: path.basename(file), lines: fn.split(/\r?\n/).length }
}

for (const f of files) {
  const r = countMainExport(f)
  console.log(`${r.file}: ${r.lines ?? r.err}`)
}
