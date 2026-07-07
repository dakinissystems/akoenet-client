export default function ChannelTopCreatePanel({
  createUI,
  popoverRef,
  t,
  setCreateUI,
  draftName,
  setDraftName,
  draftType,
  setDraftType,
  draftCategoryId,
  setDraftCategoryId,
  draftPrivate,
  setDraftPrivate,
  categories,
  onCreateCategory,
  submitNewChannel,
  closeCreate,
}) {
  const tab = createUI.tab
  return (
    <div ref={popoverRef} className="channel-create-inline channel-create-inline--top">
      <div className="channel-create-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'channel'}
          className={`channel-create-tab ${tab === 'channel' ? 'active' : ''}`}
          onClick={() => setCreateUI({ type: 'top', tab: 'channel' })}
        >
          {t('channelList.tabChannel')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'section'}
          className={`channel-create-tab ${tab === 'section' ? 'active' : ''}`}
          onClick={() => setCreateUI({ type: 'top', tab: 'section' })}
        >
          {t('channelList.tabSection')}
        </button>
      </div>
      {tab === 'section' ? (
        <form
          className="channel-create-inline-form"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!draftName.trim()) return
            await onCreateCategory?.({ name: draftName.trim() })
            closeCreate()
          }}
        >
          <input
            id="channel-create-section-name"
            name="section_name"
            className="channel-create-inline-input"
            aria-label={t('channelList.sectionNamePh')}
            placeholder={t('channelList.sectionNamePh')}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
          />
          <button type="submit" className="btn small primary">
            {t('channelList.createSection')}
          </button>
          <button type="button" className="btn small ghost" onClick={closeCreate}>
            {t('channelList.cancel')}
          </button>
        </form>
      ) : (
        <form
          className="channel-create-inline-form channel-create-inline-form--stack"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!draftName.trim()) return
            await submitNewChannel({
              name: draftName.trim(),
              type: draftType,
              categoryId: draftCategoryId ? Number(draftCategoryId) : null,
              isPrivate: draftPrivate,
            })
          }}
        >
          <input
            id="channel-create-top-name"
            name="channel_name"
            className="channel-create-inline-input"
            aria-label={t('channelList.channelNamePh')}
            placeholder={t('channelList.channelNamePh')}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
          />
          <select
            id="channel-create-top-type"
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
          <select
            id="channel-create-top-category"
            name="channel_category_id"
            className="select-friendly channel-create-select"
            aria-label={t('channelList.noSectionTop')}
            value={draftCategoryId}
            onChange={(e) => setDraftCategoryId(e.target.value)}
          >
            <option value="">{t('channelList.noSectionTop')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
          <label className="channel-create-private">
            <input
              id="channel-create-top-private"
              name="channel_is_private"
              type="checkbox"
              checked={draftPrivate}
              onChange={(e) => setDraftPrivate(e.target.checked)}
            />
            {t('channelList.private')}
          </label>
          <div className="channel-create-inline-actions">
            <button type="submit" className="btn small primary">
              {t('channelList.createChannel')}
            </button>
            <button type="button" className="btn small ghost" onClick={closeCreate}>
              {t('channelList.cancel')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
