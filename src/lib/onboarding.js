const STORAGE_KEY = 'akoenet_onboarding_v1'

export function hasSeenOnboarding() {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY))
  } catch {
    return true
  }
}

export function dismissOnboarding() {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}
