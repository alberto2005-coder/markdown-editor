; =====================================================================
; Script de Inno Setup 7 para Markdown Editor
; Diseñado para Inno Setup 7.x (interfaz moderna, High-DPI y Windows 10/11)
; =====================================================================

#define MyAppName "Markdown Editor"
#define MyAppVersion "1.10.1"
#define MyAppPublisher "Alberto Ortiz (alberto2005-coder)"
#define MyAppURL "https://alberto2005-coder.github.io/markdown-editor/"
#define MyAppExeName "Markdown Editor.exe"
#define MyAppSourceDir "dist\Markdown Editor-win32-x64"

[Setup]
; Identificador único de la aplicación (GUID)
AppId={{C6E2A684-D483-49F8-868C-7E436214B829}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Ruta de instalación:
; {autopf} usa Program Files (64 bits) o LocalAppData según el modo elegido
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; Inno Setup 7: Estilo visual moderno y compatibilidad nativa de 64 bits
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

; Opciones del instalador generado
OutputDir=Output
OutputBaseFilename=MarkdownEditor_Setup_v{#MyAppVersion}
SetupIconFile=icon.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
Compression=lzma2/ultra64
SolidCompression=yes
LicenseFile=..\LICENSE

; Permite instalar sin permisos de administrador (por usuario) o con administrador (todos los usuarios)
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Archivos empaquetados por "npm run pack"
Source: "{#MyAppSourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
; Acceso directo en el Menú Inicio
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
; Acceso directo del desinstalador
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
; Acceso directo en el Escritorio (opcional con casilla)
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
; Casilla para ejecutar la aplicación al finalizar el asistente
Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Filename: "{app}\{#MyAppExeName}"; Flags: nowait postinstall skipifsilent
