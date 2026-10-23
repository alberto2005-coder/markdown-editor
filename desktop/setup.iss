; =====================================================================
; Script de Inno Setup 7 para Markdown Editor
; Diseñado para Inno Setup 7.x (interfaz moderna, High-DPI y Windows 10/11)
; =====================================================================

#define MyAppName "Markdown Editor"
#define MyAppVersion "1.10.2"
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
ChangesAssociations=yes

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[CustomMessages]
spanish.AssociateFiles=Asociar archivos Markdown (.md, .markdown) con Markdown Editor
spanish.AssociateGroup=Asociaciones de archivo:
spanish.FileDocDesc=Documento Markdown
english.AssociateFiles=Associate Markdown files (.md, .markdown) with Markdown Editor
english.AssociateGroup=File associations:
english.FileDocDesc=Markdown Document

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "associate"; Description: "{cm:AssociateFiles}"; GroupDescription: "{cm:AssociateGroup}"

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

[Registry]
; Asociaciones de archivo (.md, .markdown)
Root: HKA; Subkey: "Software\Classes\.md"; ValueType: string; ValueName: ""; ValueData: "MarkdownEditor.File"; Flags: uninsdeletevalue; Tasks: associate
Root: HKA; Subkey: "Software\Classes\.md\OpenWithProgids"; ValueType: string; ValueName: "MarkdownEditor.File"; ValueData: ""; Flags: uninsdeletevalue; Tasks: associate

Root: HKA; Subkey: "Software\Classes\.markdown"; ValueType: string; ValueName: ""; ValueData: "MarkdownEditor.File"; Flags: uninsdeletevalue; Tasks: associate
Root: HKA; Subkey: "Software\Classes\.markdown\OpenWithProgids"; ValueType: string; ValueName: "MarkdownEditor.File"; ValueData: ""; Flags: uninsdeletevalue; Tasks: associate

Root: HKA; Subkey: "Software\Classes\MarkdownEditor.File"; ValueType: string; ValueName: ""; ValueData: "{cm:FileDocDesc}"; Flags: uninsdeletekey; Tasks: associate
Root: HKA; Subkey: "Software\Classes\MarkdownEditor.File\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppExeName},0"; Tasks: associate
Root: HKA; Subkey: "Software\Classes\MarkdownEditor.File\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""; Tasks: associate

; Registro en Applications para el menú contextual "Abrir con..." de Windows
Root: HKA; Subkey: "Software\Classes\Applications\{#MyAppExeName}"; ValueType: string; ValueName: "FriendlyAppName"; ValueData: "{#MyAppName}"; Flags: uninsdeletekey
Root: HKA; Subkey: "Software\Classes\Applications\{#MyAppExeName}\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\{#MyAppExeName},0"
Root: HKA; Subkey: "Software\Classes\Applications\{#MyAppExeName}\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\{#MyAppExeName}"" ""%1"""
Root: HKA; Subkey: "Software\Classes\Applications\{#MyAppExeName}\SupportedTypes"; ValueType: string; ValueName: ".md"; ValueData: ""
Root: HKA; Subkey: "Software\Classes\Applications\{#MyAppExeName}\SupportedTypes"; ValueType: string; ValueName: ".markdown"; ValueData: ""
Root: HKA; Subkey: "Software\Classes\Applications\{#MyAppExeName}\SupportedTypes"; ValueType: string; ValueName: ".mdown"; ValueData: ""
Root: HKA; Subkey: "Software\Classes\Applications\{#MyAppExeName}\SupportedTypes"; ValueType: string; ValueName: ".txt"; ValueData: ""
