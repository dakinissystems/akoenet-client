export default function StatusBadge({ ok, label }) {
  return <span className={`status-badge ${ok ? 'ok' : 'fail'}`}>{label}</span>
}
