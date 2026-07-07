export default function ChannelCategoryCreatePanel({
  groupId,
  popoverRef,
  t,
  draftName,
  setDraftName,
  draftType,
  setDraftType,
  draftPrivate,
  setDraftPrivate,
  submitNewChannel,
  closeCreate,
}) {
  return (
    <div ref={popoverRef} className="channel-create-inline channel-create-inline--category">
      <form
        className="channel-create-inline-form channel-create-inline-form--stack"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!draftName.trim()) return
          await submitNewChannel({
            name: draftName.trim(),
            type: draftType,
            categoryId: groupId,
            isPrivate: draftPrivate,
          })
        }}
      >
        <input
          id={`channel-create-category-${groupId}-name`}
          name="channel_name"
          className="channel-create-inline-input"
          aria-label={t('channelList.channelNamePh')}
          placeholder={t('channelList.channelNamePh')}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
        />
        <select
          id={`channel-create-category-${groupId}-type`}
          name="channel_type"
          className="select-friendly channel-create-select"
          aria-label={t('channelList.typeText')}
          value={draftType}
          onChange={(e) => setDraftType(e.target.value)}
        >
          <option value="text">{t('channelList.typeText')}</option>
          <option value="voice">{t('channelList.typeVoice')}</option>
          <option value="forum">{t('channelList.typeForum')}</option>
        </select>
        <label className="channel-create-private">
          <input
            id={`channel-create-category-${groupId}-private`}
            name="channel_is_private"
            type="checkbox"
            checked={draftPrivate}
            onChange={(e) => setDraftPrivate(e.target.checked)}
          />
          {t('channelList.private')}
        </label>
        <div className="channel-create-inline-actions">
          <button type="submit" className="btn small primary">
            {t('channelList.create')}
          </button>
          <button type="button" className="btn small ghost" onClick={closeCreate}>
            {t('channelList.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
