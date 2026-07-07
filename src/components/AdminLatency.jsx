import { useTranslation } from 'react-i18next'

export default function Latency({ ms }) {
  const { t } = useTranslation()
  if (ms === null || ms === undefined) return <span className="muted small">{t('admin.na')}</span>
  return <span className="status-latency">{ms} ms</span>
}
