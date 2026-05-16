/**
 * Build-time check: invite links use ?invite= query (works on static hosts / Railway).
 */
import {
  INVITE_QUERY_PARAM,
  buildInviteCreatePayload,
  inviteFullUrl,
  inviteLandingPath,
  parseInviteTokenFromInput,
} from '../src/lib/invites.js';

const origin = 'https://akonet.example.com';
const token = 'build-verify-token';

const landing = inviteLandingPath(token);
if (!landing.startsWith(`/?${INVITE_QUERY_PARAM}=`)) {
  console.error('[verify-invite-links] inviteLandingPath:', landing);
  process.exit(1);
}

const url = inviteFullUrl(origin, token);
if (!url.includes(`${INVITE_QUERY_PARAM}=`) || url.includes('/invite/')) {
  console.error('[verify-invite-links] inviteFullUrl:', url);
  process.exit(1);
}

if (parseInviteTokenFromInput(url) !== token) {
  console.error('[verify-invite-links] parseInviteTokenFromInput failed for', url);
  process.exit(1);
}

const singleUse = buildInviteCreatePayload('temporary', true);
if (singleUse.max_uses !== 1 || !singleUse.expires_in_hours) {
  console.error('[verify-invite-links] buildInviteCreatePayload temporary');
  process.exit(1);
}

console.log('[verify-invite-links] OK');
