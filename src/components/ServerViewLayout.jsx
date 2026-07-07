import ServerSidebar from './ServerSidebar'
import ChannelList from './ChannelList'
import Chat from './Chat'
import MembersPanel from './MembersPanel'
import MembersDrawer from './MembersDrawer'
import UserSettingsModal from './UserSettingsModal'
import ServerSettingsModal from './ServerSettingsModal'
import ChannelSettingsModal from './ChannelSettingsModal'
import AppChrome from './AppChrome'

export default function ServerViewLayout(props) {
  const {
    t, id, navigate, user, signOut, servers, channels, categories, members, canManageMemberRoles,
    activeChannelId, emojis, banStatus, setActiveChannelId, serverName, serverTag, createChannel,
    createCategory, deleteCategory, deleteChannel, moveChannel, moveCategory, collapsedCategories,
    toggleCategoryCollapse, userSettingsOpen, setUserSettingsOpen, userSettingsSection, setUserSettingsSection,
    serverSettingsOpen, setServerSettingsOpen, channelSettingsOpen, setChannelSettingsOpen,
    membersDrawerOpen, closeMembersPanel, openMembersPanel, voicePresence, voiceScreenSharingUserIds,
    rtcVoiceChannelId, rtcVoiceChannelMeta, rtcVoiceConnectedCount, handleVoiceSessionChange,
    connectedUserIds, activityByUserId, gameRanking, serverOwnerId, refreshServerMembers, refreshServerList,
    channelPermissions, togglePermission, userPermissions, toggleUserPermission, updateChannel,
    selectedMemberId, setSelectedMemberId, toast, showInlineMembersPanel, setAppearOnline, activeChannel,
  } = props

  if (banStatus?.banned) {
    return (
      <AppChrome>
        <section className="card" style={{ maxWidth: 680, margin: '2rem auto' }}>
          <h2>{t('serverView.banTitle')}</h2>
          <p className="muted">
            {t('serverView.banBody')}
          </p>
          {banStatus.reason ? (
            <p>
              <strong>{t('serverView.reason')}</strong> {banStatus.reason}
            </p>
          ) : null}
          {banStatus.expires_at ? (
            <p>
              <strong>{t('serverView.expires')}</strong> {new Date(banStatus.expires_at).toLocaleString()}
            </p>
          ) : (
            <p>
              <strong>{t('serverView.duration')}</strong> {t('serverView.permanent')}
            </p>
          )}
          <div style={{ marginTop: '1rem' }}>
            <button type="button" className="btn secondary" onClick={() => navigate('/')}>
              {t('serverView.backHome')}
            </button>
          </div>
        </section>
      </AppChrome>
    )
  }

  return (
    <AppChrome>
      <>
        <div className="app-shell app-shell--server">
          <ServerSidebar
            servers={servers}
            activeServerId={id}
            onSelectServer={(sid) => navigate(`/server/${sid}`)}
            homeAction={() => navigate('/')}
            messagesAction={() => navigate('/messages')}
          />
          <ChannelList
            serverName={serverName}
            serverTag={serverTag}
            categories={categories}
            channels={channels}
            activeChannelId={activeChannelId}
            onSelectChannel={setActiveChannelId}
            onCreateChannel={createChannel}
            onCreateCategory={createCategory}
            onDeleteCategory={deleteCategory}
            onDeleteChannel={deleteChannel}
            onMoveChannel={moveChannel}
            onMoveCategory={moveCategory}
            collapsedCategories={collapsedCategories}
            onToggleCategory={toggleCategoryCollapse}
            user={user}
            onLogout={signOut}
            onOpenUserSettings={() => {
              setUserSettingsSection('profile')
              setUserSettingsOpen(true)
            }}
            onOpenServerSettings={() => setServerSettingsOpen(true)}
            onOpenAdminDashboard={() => navigate('/admin')}
            onSetAppearOnline={setAppearOnline}
            schedulerStreamerUsername={import.meta.env.VITE_SCHEDULER_STREAMER_USERNAME}
            voicePresence={voicePresence}
            voiceScreenSharingUserIds={voiceScreenSharingUserIds}
          />
          <Chat
            channelId={activeChannelId}
            channelName={activeChannel?.name}
            channelType={activeChannel?.type}
            user={user}
            members={members}
            emojis={emojis}
            voiceUserLimit={rtcVoiceChannelMeta?.voice_user_limit}
            voiceConnectedCount={rtcVoiceConnectedCount}
            onVoiceSessionChange={handleVoiceSessionChange}
            rtcVoiceChannelId={rtcVoiceChannelId}
            rtcVoiceChannelName={rtcVoiceChannelMeta?.name}
            onOpenChannelSettings={() => setChannelSettingsOpen(true)}
            onOpenMembersPanel={showInlineMembersPanel ? undefined : openMembersPanel}
            membersCount={members.length}
          />
          {showInlineMembersPanel && (
            <div className="right-column">
              <MembersPanel
                members={members}
                connectedUserIds={connectedUserIds}
                currentUser={user}
                activityByUserId={activityByUserId}
                gameRanking={gameRanking}
                serverId={id}
                canManageMemberRoles={canManageMemberRoles}
                serverOwnerId={serverOwnerId}
                onMemberRolesUpdated={refreshServerMembers}
              />
            </div>
          )}
        </div>

        {!showInlineMembersPanel && (
          <MembersDrawer open={membersDrawerOpen} onClose={closeMembersPanel}>
            <p className="members-drawer-hint muted small">
              {t('serverView.membersDrawerHint')}
            </p>
            <MembersPanel
              members={members}
              connectedUserIds={connectedUserIds}
              currentUser={user}
              activityByUserId={activityByUserId}
              gameRanking={gameRanking}
              serverId={id}
              canManageMemberRoles={canManageMemberRoles}
              serverOwnerId={serverOwnerId}
              onMemberRolesUpdated={refreshServerMembers}
              onClose={closeMembersPanel}
            />
          </MembersDrawer>
        )}

        {toast && (
          <div className="toast" role="status">
            <strong>AkoeNet</strong>
            <span>
              {toast.username}: {toast.snippet}
            </span>
          </div>
        )}
        <UserSettingsModal
          open={userSettingsOpen}
          onClose={() => setUserSettingsOpen(false)}
          initialSection={userSettingsSection}
        />
        <ServerSettingsModal
          open={serverSettingsOpen}
          onClose={() => setServerSettingsOpen(false)}
          serverId={id}
          serverName={serverName}
          serverTag={serverTag}
          members={members}
          serverOwnerId={serverOwnerId}
          onMembersRefresh={refreshServerMembers}
          onServerTagUpdated={refreshServerList}
        />
        <ChannelSettingsModal
          open={channelSettingsOpen}
          onClose={() => setChannelSettingsOpen(false)}
          activeChannel={activeChannel}
          permissions={channelPermissions}
          onTogglePermission={togglePermission}
          members={members}
          userPermissions={userPermissions}
          selectedMemberId={selectedMemberId}
          setSelectedMemberId={setSelectedMemberId}
          onToggleUserPermission={toggleUserPermission}
          categories={categories}
          onUpdateChannel={updateChannel}
        />
      </>
    </AppChrome>
  )
}
