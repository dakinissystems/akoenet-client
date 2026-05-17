; Ensures Programs and Features shows "Dakinis Systems" as Publisher (Editor).
!macro NSIS_HOOK_POSTINSTALL
  WriteRegStr SHCTX "${UNINSTKEY}" "Publisher" "Dakinis Systems"
!macroend
