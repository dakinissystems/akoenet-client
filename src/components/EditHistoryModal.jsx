import { useTranslation } from 'react-i18next'
import ModalDialog from './ModalDialog.jsx'

const EMPTY_ENTRIES = []

export default function EditHistoryModal({ open, title, entries = EMPTY_ENTRIES, onClose }) {
  const { t } = useTranslation()
  const resolvedTitle = title ?? t('editHistory.title')

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      ariaLabelledby="edit-history-title"
      panelClassName="modal-card edit-history-modal"
    >
      <header className="modal-header">
        <h3 id="edit-history-title">{resolvedTitle}</h3>
        <button type="button" className="btn ghost small" onClick={onClose}>
          {t('editHistory.close')}
        </button>
      </header>

      {!entries.length ? (
        <p className="muted small">{t('editHistory.empty')}</p>
      ) : (
        <ol className="edit-history-list">
          {entries.map((entry, idx) => (
            <li key={`${entry.id || idx}-${entry.edited_at || ''}`} className="edit-history-item">
              <div className="edit-history-item-meta">
                <strong>#{idx + 1}</strong>
                <span>{entry.edited_at ? new Date(entry.edited_at).toLocaleString() : t('editHistory.unknownTime')}</span>
                <span>
                  {t('editHistory.byPrefix')} {entry.edited_by_username || t('editHistory.userFallback')}
                </span>
              </div>
              <div className="edit-history-change">
                <p className="edit-history-label">{t('editHistory.from')}</p>
                <p className="edit-history-text">{entry.old_content || t('editHistory.emptyContent')}</p>
              </div>
              <div className="edit-history-change">
                <p className="edit-history-label">{t('editHistory.to')}</p>
                <p className="edit-history-text">{entry.new_content || t('editHistory.emptyContent')}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </ModalDialog>
  )
}
