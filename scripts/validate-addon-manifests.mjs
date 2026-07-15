import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { discoverAddonManifests } from '../../../../projects/workspace/packages/addon-sdk/src/plugin-loader.js'
import { assertAddonManifest } from '../../../../projects/workspace/packages/addon-sdk/src/manifest.contract.js'
import { CALENDAR_WINDOW_REGISTRY } from '../src/modules/calendar/windowRegistry.js'
import { NOTES_WINDOW_REGISTRY } from '../src/modules/notes/windowRegistry.js'
import { KANBAN_WINDOW_REGISTRY } from '../src/modules/kanban/windowRegistry.js'
import { DASHBOARD_WINDOW_REGISTRY } from '../src/modules/dashboard/windowRegistry.js'
import { TERMINAL_WINDOW_REGISTRY } from '../src/modules/terminal/windowRegistry.js'
import { MONITOR_WINDOW_REGISTRY } from '../src/modules/monitor/windowRegistry.js'
import { DEVOPS_WINDOW_REGISTRY } from '../src/modules/devops/windowRegistry.js'
import { CODE_EDITOR_WINDOW_REGISTRY } from '../src/modules/code-editor/windowRegistry.js'
import { WINDOW_REGISTRY as MEDIA_PLAYER_WINDOW_REGISTRY } from '../src/modules/media-player/windowRegistry.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientRoot = path.resolve(__dirname, '..')
const catalog = JSON.parse(
  readFileSync(path.join(clientRoot, 'src/workspace/catalog.json'), 'utf8'),
)

/** @type {Record<string, { id: string }[]>} */
const REGISTRY_BY_ID = {
  calendar: CALENDAR_WINDOW_REGISTRY,
  notes: NOTES_WINDOW_REGISTRY,
  kanban: KANBAN_WINDOW_REGISTRY,
  dashboard: DASHBOARD_WINDOW_REGISTRY,
  terminal: TERMINAL_WINDOW_REGISTRY,
  monitor: MONITOR_WINDOW_REGISTRY,
  devops: DEVOPS_WINDOW_REGISTRY,
  'code-editor': CODE_EDITOR_WINDOW_REGISTRY,
  'media-player': MEDIA_PLAYER_WINDOW_REGISTRY,
}

function catalogEntryFor(id) {
  return (catalog.addons || []).find((a) => a.id === id) || null
}

function main() {
  const modulesDir = path.join(clientRoot, 'src/modules')
  const discovered = discoverAddonManifests(modulesDir)
  const errors = []

  for (const { id, manifest } of discovered) {
    if (!manifest.route) {
      errors.push(`${id}: manifest.route required for live addon`)
      continue
    }
    const registry = REGISTRY_BY_ID[id]
    if (!registry) {
      errors.push(`${id}: missing window registry mapping in validate script`)
      continue
    }
    const registryIds = registry.map((w) => w.id)
    try {
      assertAddonManifest(manifest, catalogEntryFor(id), registryIds)
    } catch (err) {
      errors.push(err.message)
    }
  }

  if (errors.length > 0) {
    console.error('[validate-addon-manifests] FAILED')
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }

  console.log(`[validate-addon-manifests] OK — ${discovered.length} live addons (auto-discovered)`)
}

main()
