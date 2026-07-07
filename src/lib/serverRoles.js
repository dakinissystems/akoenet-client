/** @param {Record<string, unknown> | null | undefined} member */
export function normalizedRoles(member) {
  const slugs = Array.isArray(member?.role_slugs) ? member.role_slugs : []
  if (slugs.length) {
    return slugs.flatMap((s) => {
      const v = String(s || '').trim().toLowerCase()
      return v ? [v] : []
    })
  }
  const roles = Array.isArray(member?.roles) ? member.roles : []
  const cleaned = roles.flatMap((r) => {
    const v = String(r || '').trim().toLowerCase()
    return v ? [v] : []
  })
  return cleaned.length ? cleaned : ['member']
}

export const ROLE_ORDER = ['admin', 'moderator', 'streamer', 'member']
const ROLE_OPTION_ORDER = ['admin', 'moderator', 'member', 'streamer']
const ROLE_ORDER_SET = new Set(ROLE_ORDER)

export function sortServerRoleNames(names) {
  const lower = (names || []).flatMap((n) => {
    const v = String(n || '').trim().toLowerCase()
    return v ? [v] : []
  })
  const set = new Set(lower)
  const out = []
  for (const k of ROLE_OPTION_ORDER) {
    if (set.has(k)) out.push(k)
  }
  const rest = [...set]
    .filter((k) => !ROLE_OPTION_ORDER.includes(k))
    .toSorted((a, b) => a.localeCompare(b))
  return [...out, ...rest]
}

/** @param {Record<string, unknown> | null | undefined} member */
export function resolveDisplayRole(member) {
  const roles = normalizedRoles(member)
  for (const role of roles) {
    if (ROLE_ORDER_SET.has(role)) return role
  }
  return roles[0] || 'member'
}
