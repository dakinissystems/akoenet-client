import { use } from 'react'
import { LandingLocaleContext } from '../context/landingLocaleContext'

export function useLandingLocale() {
  const ctx = use(LandingLocaleContext)
  if (!ctx) {
    throw new Error('useLandingLocale must be used within LandingLocaleProvider')
  }
  return ctx
}
