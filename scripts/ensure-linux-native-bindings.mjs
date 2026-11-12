/**
 * Vite 8 needs the Linux native builds of rolldown and lightningcss.
 * A lockfile written on Windows often omits them, and npm then skips them
 * on Railway (https://github.com/npm/cli/issues/4828).
 */
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import process from 'node:process'

const require = createRequire(import.meta.url)

const bindings = [
  ['@rolldown/binding-linux-x64-gnu', '1.2.19'],
  ['lightningcss-linux-x64-gnu', '1.33.0'],
]

if (process.platform !== 'linux' || process.arch !== 'x64') {
  process.exit(0)
}

const missing = bindings.filter(([name]) => {
  try {
    require.resolve(name)
    return false
  } catch {
    return true
  }
})

if (missing.length === 0) process.exit(0)

const result = spawnSync(
  'npm',
  [
    'install',
    '--no-save',
    '--include=optional',
    '--include=dev',
    ...missing.map(([name, version]) => `${name}@${version}`),
  ],
  { stdio: 'inherit' }
)

if (result.status !== 0) process.exit(result.status ?? 1)
