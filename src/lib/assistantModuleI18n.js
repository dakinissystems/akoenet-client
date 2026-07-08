export function assistantModuleName(mod, t) {
  if (!mod?.key) return mod?.name || ''
  const key = `serverAssistant.modules.${mod.key}.name`
  const translated = t(key)
  return translated === key ? mod.name || mod.key : translated
}

export function assistantModuleDescription(mod, t) {
  if (!mod?.key) return mod?.description || ''
  const key = `serverAssistant.modules.${mod.key}.description`
  const translated = t(key)
  return translated === key ? mod.description || '' : translated
}
