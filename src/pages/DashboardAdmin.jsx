import { useDashboardAdmin } from '../hooks/useDashboardAdmin'
import DashboardAdminContent from '../components/DashboardAdminContent'

export default function DashboardAdmin({ embedded = false }) {
  const admin = useDashboardAdmin()
  return <DashboardAdminContent embedded={embedded} {...admin} />
}
