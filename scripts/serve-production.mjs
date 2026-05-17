import { spawnSync } from 'node:child_process'
import process from 'node:process'

const port = String(process.env.PORT || '4173')
const r = spawnSync(
  'npx',
  ['vite', 'preview', '--host', '0.0.0.0', '--port', port],
  { stdio: 'inherit', shell: process.platform === 'win32' }
)
process.exit(r.status ?? 1)
