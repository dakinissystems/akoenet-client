import { useServerView } from '../hooks/useServerView'
import ServerViewLayout from '../components/ServerViewLayout'

export default function ServerView() {
  const viewProps = useServerView()
  return <ServerViewLayout {...viewProps} />
}
