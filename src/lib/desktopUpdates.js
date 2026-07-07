import { isTauri } from './isTauri.js'

async function notifyDesktopUpdateAvailable(version) {
  try {
    const { isPermissionGranted, requestPermission, sendNotification } = await import(
      '@tauri-apps/plugin-notification'
    )
    let granted = await isPermissionGranted()
    if (!granted) {
      const perm = await requestPermission()
      granted = perm === 'granted'
    }
    if (granted) {
      await sendNotification({
        title: 'AkoeNet',
        body: version ? `Update ${version} available — installing…` : 'Update available — installing…',
      })
    }
  } catch {
    /* optional desktop notification */
  }
}

async function logDesktopUpdateFailure(err) {
  const msg = `[AkoeNet desktop] update check failed: ${err?.message ?? String(err)}`
  try {
    const { warn } = await import('@tauri-apps/plugin-log')
    await warn(msg)
  } catch {
    console.warn(msg, err)
  }
}

/**
 * Checks for a newer signed build (production desktop only). On success, downloads, installs, and relaunches.
 * Configure `plugins.updater` in `src-tauri/tauri.conf.json` and host `latest.json` (+ artifacts) at the endpoint.
 */
async function runSequentialSteps(steps, index = 0) {
  if (index >= steps.length) return
  await steps[index]()
  return runSequentialSteps(steps, index + 1)
}

async function runDesktopUpdateInstallPipeline(update, relaunch) {
  await runSequentialSteps([
    () => notifyDesktopUpdateAvailable(update.version),
    () => update.downloadAndInstall(),
    () => relaunch(),
  ])
}

export async function runDesktopUpdateCheck() {
  if (!isTauri() || import.meta.env.DEV) return
  try {
    const [{ check }, { relaunch }] = await Promise.all([
      import('@tauri-apps/plugin-updater'),
      import('@tauri-apps/plugin-process'),
    ])
    const update = await check()
    if (!update) return
    await runDesktopUpdateInstallPipeline(update, relaunch)
  } catch (err) {
    void logDesktopUpdateFailure(err)
  }
}
