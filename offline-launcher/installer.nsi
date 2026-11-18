Unicode true
!include "MUI2.nsh"

!ifndef ROOT
  !error "Pass /DROOT=<build folder> to makensis"
!endif

Name "Marjie Birthday Surprise - Offline"
OutFile "${ROOT}/Marjie_Birthday_Offline_Setup.exe"
InstallDir "$LOCALAPPDATA\MarjieBirthdaySurprise"
RequestExecutionLevel user
SetCompressor /SOLID lzma
ShowInstDetails show
ShowUninstDetails show

!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\Marjie_Birthday_Portable.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Open Marjie's birthday surprise now"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"

Section "Install Birthday Surprise"
  SetOutPath "$INSTDIR"
  File "${ROOT}/Marjie_Birthday_Portable.exe"
  CreateDirectory "$SMPROGRAMS\Marjie Birthday Surprise"
  CreateShortCut "$SMPROGRAMS\Marjie Birthday Surprise\Open Birthday Surprise.lnk" "$INSTDIR\Marjie_Birthday_Portable.exe"
  CreateShortCut "$DESKTOP\Marjie Birthday Surprise.lnk" "$INSTDIR\Marjie_Birthday_Portable.exe"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MarjieBirthdaySurprise" "DisplayName" "Marjie Birthday Surprise (Offline)"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MarjieBirthdaySurprise" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MarjieBirthdaySurprise" "InstallLocation" "$INSTDIR"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MarjieBirthdaySurprise" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MarjieBirthdaySurprise" "NoRepair" 1
SectionEnd

Section "Uninstall"
  Delete "$DESKTOP\Marjie Birthday Surprise.lnk"
  Delete "$SMPROGRAMS\Marjie Birthday Surprise\Open Birthday Surprise.lnk"
  RMDir "$SMPROGRAMS\Marjie Birthday Surprise"
  Delete "$INSTDIR\Marjie_Birthday_Portable.exe"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\MarjieBirthdaySurprise"
SectionEnd
