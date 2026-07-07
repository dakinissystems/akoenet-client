import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

export default function MembersDrawer({ open, onClose, children }) {
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

  if (!open) return null

  return createPortal(
    <dialog
      ref={dialogRef}
      className="members-drawer members-drawer-native"
      aria-labelledby="members-drawer-title"
    >
      <button
        type="button"
        className="members-drawer-backdrop"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <div className="members-drawer-panel">{children}</div>
    </dialog>,
    document.body
  )
}
