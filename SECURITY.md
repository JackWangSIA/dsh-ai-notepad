# Security

## Scope

AI Notepad is a local-first DeepSeek Harness plugin. It reads and writes files chosen by the user and can register current-user Windows file associations when the user explicitly requests it.

## Data handling

- Files are read and written locally by the Host process. The plugin does not upload file contents to a separate service.
- AI requests use the Harness `llm` service and therefore the model route configured in the current Harness profile. The user does not configure a separate API key in AI Notepad.
- Attachment or prompt text sent to a model is governed by that configured model provider, not by this plugin.
- The plugin keeps settings and recent paths in browser storage. It keeps a local Windows association state file and a small diagnostic log under `%USERPROFILE%\.dsh\ai-notepad\`.
- The diagnostic log stores action type, text lengths and error messages, not document contents.

## File safety

- Binary-looking files are refused.
- Saves compare a SHA-256 hash of the on-disk bytes before writing; a changed file produces a conflict instead of a blind overwrite.
- Writes are atomic via a temporary file in the target directory.
- UTF-8, UTF-8 BOM, UTF-16 LE/BE, GB18030 and Windows-1252 are preserved. Lossy GB18030/Windows-1252 writes are refused.

## HTML preview

- HTML is rendered in a sandboxed iframe without `allow-scripts`; scripts, forms and popups are blocked.
- Relative assets are served through the authenticated `/api/ai-notepad/asset` route, limited to files explicitly referenced by the preview. The route serves local assets with `cache-control: no-store` and `x-content-type-options: nosniff`.
- Preview asset paths are resolved from the opened HTML file's directory, so relative CSS and images work without exposing the Harness application origin to the page.
- HTML preview is a reading surface, not a browser: JavaScript-driven pages render their static fallback only.

## Windows associations

- All registry writes are under `HKCU` and require no administrator rights.
- The plugin registers Open With entries; it does not bypass Windows `UserChoice` protection or silently force itself as the default app.
- The launcher and output queue live under `%USERPROFILE%\.dsh\ai-notepad\`.

## Reporting

Please report a vulnerability privately through GitHub Security Advisories on the repository, or by opening an issue that does not include exploit details or personal file contents.
