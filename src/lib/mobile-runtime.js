import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import capacitorAndroidPkg from '@capacitor/android/package.json'

/**
 * Imports estáticos de @capacitor/*: un solo grafo; los `import()` dinámicos a @capacitor/app
 * u otros paquetes hacían que Vite emitiera otro chunk con otra copia de @capacitor/core
 * y rompía Preferences ("…then() is not implemented on android").
 * @capacitor/android/package.json keeps the native Gradle project dep in the JS graph for cap sync.
 */
const capacitorAndroidVersion = capacitorAndroidPkg.version
export function isCapacitorNative() {
  try {
    const platform = Capacitor.getPlatform()
    if (platform === 'android') {
      void capacitorAndroidVersion
      return true
    }
    return platform === 'ios'
  } catch {
    return false
  }
}

export async function addNativeAppStateListener(onActive) {
  if (typeof onActive !== 'function') return () => {}
  if (!Capacitor?.isNativePlatform?.()) return () => {}
  if (!App?.addListener) return () => {}
  const handle = await App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) onActive()
  })
  return () => {
    try {
      handle?.remove?.()
    } catch {
      /* ignore */
    }
  }
}
