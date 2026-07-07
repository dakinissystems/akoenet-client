export function isMemberOnline(member, connectedSet, currentUser) {
  if (currentUser && Number(member?.id) === Number(currentUser?.id)) {
    const ownStatus = String(currentUser?.presence_status || '').toLowerCase()
    if (ownStatus === 'invisible' || ownStatus === 'offline') return false
    if (ownStatus === 'online' || ownStatus === 'idle' || ownStatus === 'dnd') return true
  }
  const status = String(member?.presence_status || '').toLowerCase()
  const appearsOffline = status === 'invisible' || status === 'offline'
  if (appearsOffline) return false
  const connected = connectedSet.has(Number(member?.id))
  if (connected) return true
  return status === 'online' || status === 'idle' || status === 'dnd'
}
