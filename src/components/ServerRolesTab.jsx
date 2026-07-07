import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import { resolveDisplayRole, sortServerRoleNames } from '../lib/serverRoles'
import ServerRolesCreateForm from './ServerRolesCreateForm'
import ServerRolesDefinitionsList from './ServerRolesDefinitionsList'
import ServerRolesMembersTable from './ServerRolesMembersTable'

/**
 * @typedef {{ id: number, name: string, slug: string, is_system?: boolean, permissions?: string[] }} ServerRoleDef
 */

/**
 * @param {{
 *   serverId: number | string | null
 *   members?: Array<Record<string, unknown>>
 *   canManageMemberRoles?: boolean
 *   serverOwnerId?: number | null
 *   onMembersRefresh?: (() => void | Promise<void>) | null
 * }} props
 */
const EMPTY_MEMBERS = []

export default function ServerRolesTab({
  serverId,
  members = EMPTY_MEMBERS,
  canManageMemberRoles = false,
  serverOwnerId = null,
  onMembersRefresh = null,
}) {
  const { t } = useTranslation()
  /** @type {[ServerRoleDef[], React.Dispatch<React.SetStateAction<ServerRoleDef[]>>]} */
  const [roleDefinitions, setRoleDefinitions] = useState([])
  const [catalogKeys, setCatalogKeys] = useState([])
  const [roleNameBusyId, setRoleNameBusyId] = useState(null)
  const [roleNameNotice, setRoleNameNotice] = useState(null)
  const [roleNotice, setRoleNotice] = useState(null)
  const [roleBusyId, setRoleBusyId] = useState(null)
  const [permBusyId, setPermBusyId] = useState(null)
  const [deleteBusyId, setDeleteBusyId] = useState(null)
  const [createBusy, setCreateBusy] = useState(false)
  const [createNotice, setCreateNotice] = useState(null)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleSlug, setNewRoleSlug] = useState('')
  const [query, setQuery] = useState('')

  const loadCatalog = useCallback(async () => {
    if (!serverId) return
    try {
      const { data } = await api.get(`/servers/${serverId}/server-permission-catalog`)
      const keys = Array.isArray(data?.keys) ? data.keys : []
      setCatalogKeys(keys.map(String))
    } catch {
      setCatalogKeys([])
    }
  }, [serverId])

  const loadRoles = useCallback(async () => {
    if (!serverId) return
    try {
      const { data } = await api.get(`/servers/${serverId}/roles`)
      setRoleDefinitions(
        (Array.isArray(data) ? data : []).map((r) => ({
          id: r.id,
          name: r.name,
          slug: String(r.slug || r.name || '')
            .trim()
            .toLowerCase(),
          is_system: Boolean(r.is_system),
          permissions: Array.isArray(r.permissions) ? r.permissions.map(String) : [],
        }))
      )
    } catch {
      setRoleDefinitions([])
    }
  }, [serverId])

  useEffect(() => {
    loadCatalog()
    loadRoles()
  }, [loadCatalog, loadRoles])

  const roleLabels = useMemo(() => {
    const m = {}
    for (const r of roleDefinitions) {
      if (r.slug) m[r.slug] = r.name
    }
    return m
  }, [roleDefinitions])

  const serverRoleNames = useMemo(
    () => sortServerRoleNames(roleDefinitions.flatMap((r) => (r.slug ? [r.slug] : []))),
    [roleDefinitions]
  )

  async function saveRoleDisplayName(def, rawName) {
    if (!serverId || !canManageMemberRoles) return
    const name = String(rawName || '').trim()
    if (!name || name === def.name) return
    setRoleNameNotice(null)
    setRoleNameBusyId(def.id)
    try {
      await api.patch(`/servers/${serverId}/roles/${def.id}`, { name })
      await Promise.all([loadRoles(), onMembersRefresh?.()])
      setRoleNameNotice({ type: 'ok', text: t('members.roleNameSaved') })
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'role_name_taken') {
        setRoleNameNotice({ type: 'err', text: t('members.roleNameTaken') })
      } else {
        setRoleNameNotice({ type: 'err', text: t('members.roleNameErr') })
      }
    } finally {
      setRoleNameBusyId(null)
    }
  }

  async function saveRolePermissions(roleId, nextKeys) {
    if (!serverId || !canManageMemberRoles) return
    setPermBusyId(roleId)
    try {
      await api.put(`/servers/${serverId}/roles/${roleId}/permissions`, { permissions: nextKeys })
      await loadRoles()
      setRoleNameNotice({ type: 'ok', text: t('serverModal.rolesPermissionsSaved') })
    } catch {
      await loadRoles()
      setRoleNameNotice({ type: 'err', text: t('serverModal.rolesPermissionsErr') })
    } finally {
      setPermBusyId(null)
    }
  }

  async function togglePermission(def, key, checked) {
    const set = new Set(def.permissions || [])
    if (checked) set.add(key)
    else set.delete(key)
    const next = [...set].toSorted()
    await saveRolePermissions(def.id, next)
  }

  async function handleCreateRole(e) {
    e.preventDefault()
    if (!serverId || !canManageMemberRoles) return
    const name = newRoleName.trim()
    if (name.length < 2) {
      setCreateNotice({ type: 'err', text: t('serverModal.rolesCreateNameShort') })
      return
    }
    setCreateNotice(null)
    setCreateBusy(true)
    try {
      const body = { name }
      const slug = newRoleSlug.trim()
      if (slug) body.slug = slug.toLowerCase()
      await api.post(`/servers/${serverId}/roles`, body)
      setNewRoleName('')
      setNewRoleSlug('')
      await loadRoles()
      setCreateNotice({ type: 'ok', text: t('serverModal.rolesCreateOk') })
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'reserved_slug') setCreateNotice({ type: 'err', text: t('serverModal.rolesErrReservedSlug') })
      else if (code === 'role_slug_taken') setCreateNotice({ type: 'err', text: t('serverModal.rolesErrSlugTaken') })
      else if (code === 'role_name_taken') setCreateNotice({ type: 'err', text: t('serverModal.rolesErrNameTaken') })
      else setCreateNotice({ type: 'err', text: t('serverModal.rolesCreateErr') })
    } finally {
      setCreateBusy(false)
    }
  }

  async function handleDeleteRole(def) {
    if (!serverId || !canManageMemberRoles || def.is_system) return
    if (!window.confirm(t('serverModal.rolesDeleteConfirm', { name: def.name }))) return
    setDeleteBusyId(def.id)
    setCreateNotice(null)
    try {
      await api.delete(`/servers/${serverId}/roles/${def.id}`)
      await Promise.all([loadRoles(), onMembersRefresh?.()])
      setRoleNameNotice({ type: 'ok', text: t('serverModal.rolesDeleted') })
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'role_in_use') {
        setRoleNameNotice({ type: 'err', text: t('serverModal.rolesErrInUse') })
      } else {
        setRoleNameNotice({ type: 'err', text: t('serverModal.rolesDeleteErr') })
      }
    } finally {
      setDeleteBusyId(null)
    }
  }

  async function handleMemberRoleChange(member, nextRole) {
    if (!serverId || !canManageMemberRoles) return
    const current = resolveDisplayRole(member)
    if (String(nextRole).toLowerCase() === current) return
    setRoleNotice(null)
    setRoleBusyId(Number(member.id))
    try {
      await api.patch(`/servers/${serverId}/members/${member.id}/roles`, {
        role: String(nextRole).toLowerCase(),
      })
      await onMembersRefresh?.()
      setRoleNotice({ type: 'ok', text: t('members.roleUpdated') })
    } catch (err) {
      const code = err.response?.data?.error
      if (code === 'last_admin') {
        setRoleNotice({ type: 'err', text: t('members.roleErrLastAdmin') })
      } else if (code === 'cannot_change_owner_role') {
        setRoleNotice({ type: 'err', text: t('members.roleErrOwner') })
      } else {
        setRoleNotice({ type: 'err', text: t('members.roleErrGeneric') })
      }
    } finally {
      setRoleBusyId(null)
    }
  }

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (members || []).filter((m) => {
      if (!q) return true
      return String(m?.username || '').toLowerCase().includes(q)
    })
  }, [members, query])

  const sortedMembers = useMemo(
    () =>
      filteredMembers.toSorted((a, b) =>
        String(a?.username || '').localeCompare(String(b?.username || ''), undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      ),
    [filteredMembers]
  )

  function labelForSlug(slug) {
    const s = String(slug || '').toLowerCase()
    return (
      roleLabels[s] ||
      t(`members.roles.${s}`, { defaultValue: s ? s.charAt(0).toUpperCase() + s.slice(1) : '' })
    )
  }

  return (
    <div className="server-settings-tab-pane server-roles-tab">
      <h2 className="server-settings-panel-title">{t('serverModal.rolesTitle')}</h2>
      <p className="muted small server-roles-tab-lead">{t('serverModal.rolesLead')}</p>

      {!canManageMemberRoles ? (
        <p className="muted small server-roles-view-only">{t('serverModal.rolesViewOnly')}</p>
      ) : null}

      <ServerRolesCreateForm
        canManage={canManageMemberRoles}
        createNotice={createNotice}
        newRoleName={newRoleName}
        setNewRoleName={setNewRoleName}
        newRoleSlug={newRoleSlug}
        setNewRoleSlug={setNewRoleSlug}
        createBusy={createBusy}
        handleCreateRole={handleCreateRole}
        t={t}
      />

      <ServerRolesDefinitionsList
        canManage={canManageMemberRoles}
        roleDefinitions={roleDefinitions}
        catalogKeys={catalogKeys}
        roleNameNotice={roleNameNotice}
        roleNameBusyId={roleNameBusyId}
        permBusyId={permBusyId}
        deleteBusyId={deleteBusyId}
        saveRoleDisplayName={saveRoleDisplayName}
        handleDeleteRole={handleDeleteRole}
        togglePermission={togglePermission}
        t={t}
      />

      {roleNotice ? (
        <p
          className={`server-roles-inline-notice ${roleNotice.type === 'err' ? 'server-roles-inline-notice--err' : ''}`}
          role="status"
        >
          {roleNotice.text}
        </p>
      ) : null}

      <ServerRolesMembersTable
        members={members}
        sortedMembers={sortedMembers}
        query={query}
        setQuery={setQuery}
        canManageMemberRoles={canManageMemberRoles}
        serverOwnerId={serverOwnerId}
        serverRoleNames={serverRoleNames}
        roleBusyId={roleBusyId}
        labelForSlug={labelForSlug}
        handleMemberRoleChange={handleMemberRoleChange}
        t={t}
      />
    </div>
  )
}
