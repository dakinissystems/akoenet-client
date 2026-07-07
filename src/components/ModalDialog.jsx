import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Centered modal — native `<dialog>` with focus trap and Escape.
 */
export default function ModalDialog({
  open,
  onClose,
  ariaLabelledby,
  ariaLabel,
  panelClassName = 'modal-card',
  children,
}) {
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
    function onCancel(event) {
      event.preventDefault()
      onClose?.()
    }
    dialog.addEventListener('cancel', onCancel)
    return () => dialog.removeEventListener('cancel', onCancel)
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className="modal-backdrop modal-dialog-native"
      aria-labelledby={ariaLabelledby}
      aria-label={ariaLabel}
      onClose={onClose}
    >
      <button
        type="button"
        className="modal-dialog-backdrop"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <div className={panelClassName}>{children}</div>
    </dialog>
  )
}
