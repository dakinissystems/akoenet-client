import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..', 'src')
const srcPath = path.join(root, 'components/ServerSettingsModal.jsx')
const lines = fs.readFileSync(srcPath, 'utf8').split(/\r?\n/)
const hookBody = lines.slice(27, 232).join('\n')

const hookHeader = `import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import {
  buildInviteCreatePayload,
  getInviteShareOrigin,
  inviteFullUrl,
  summarizeInvitePolicy,
} from '../lib/invites'

export function useServerSettingsModal({
  open,
  serverId,
  serverTag = '',
  onServerTagUpdated = null,
}) {
`

const hookFooter = `
  return {
    t,
    inviteType,
    setInviteType,
    tempUsesMode,
    setTempUsesMode,
    inviteLink,
    inviteToken,
    lastInviteSummary,
    activeInvites,
    emojiList,
    error,
    info,
    copyNotice,
    busy,
    canManageServer,
    canManageMemberRoles,
    serverBans,
    activeSection,
    setActiveSection,
    tagDraft,
    setTagDraft,
    tagBusy,
    shareOrigin,
    loadEmojis,
    unbanUser,
    createInvite,
    revokeInvite,
    saveServerTag,
    copyText,
  }
}
`

fs.writeFileSync(path.join(root, 'hooks/useServerSettingsModal.js'), hookHeader + hookBody + hookFooter)
console.log('generated useServerSettingsModal.js')
