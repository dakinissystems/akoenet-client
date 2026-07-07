import { useEffect, useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import { dismissOnboarding } from '../lib/onboarding'

function closeOnboarding(onClose) {
  dismissOnboarding()
  onClose()
}

export default function WelcomeOnboardingModal({ open, onClose }) {
  const { t } = useTranslation()
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    function onCancel(e) {
      e.preventDefault()
      closeOnboarding(onClose)
    }
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className="welcome-onboarding-overlay"
      aria-labelledby="welcome-onboarding-title"
    >
      <button
        type="button"
        className="welcome-onboarding-backdrop"
        aria-label={t('common.close')}
        onClick={() => closeOnboarding(onClose)}
      />
      <div className="welcome-onboarding-card card">
        <h2 id="welcome-onboarding-title">{t('onboarding.title')}</h2>
        <p className="muted small">
          <Trans
            i18nKey="onboarding.lead"
            components={{ sched: <strong /> }}
          />
        </p>
        <ul className="welcome-onboarding-list">
          <li>
            <Trans i18nKey="onboarding.bulletServer" components={{ b: <strong /> }} />
          </li>
          <li>
            <Trans
              i18nKey="onboarding.bulletScheduler"
              components={{
                sched: <strong />,
                b2: <strong />,
                code1: <code className="inline-code" />,
                code2: <code className="inline-code" />,
              }}
            />
          </li>
          <li>
            <Trans
              i18nKey="onboarding.bulletMentions"
              components={{
                sched: <strong />,
                codeu: <code className="inline-code" />,
                codee: <code className="inline-code" />,
              }}
            />
          </li>
          <li>
            <Trans
              i18nKey="onboarding.bulletSearch"
              components={{
                sched: <strong />,
                kbd1: <kbd className="kbd" />,
                kbd2: <kbd className="kbd" />,
                kbd3: <kbd className="kbd" />,
                kbd4: <kbd className="kbd" />,
              }}
            />
          </li>
        </ul>
        <div className="welcome-onboarding-actions">
          <button
            type="button"
            className="btn primary"
            onClick={() => closeOnboarding(onClose)}
          >
            {t('onboarding.gotIt')}
          </button>
        </div>
      </div>
    </dialog>
  )
}
