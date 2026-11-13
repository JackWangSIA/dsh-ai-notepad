# Changelog

All notable changes to AI Notepad are documented here.

## 1.2.2 — 2026-11-13

- Renamed the custom-instruction submit action to a neutral “Run” button; custom mode is represented only by the textarea.

## 1.2.1 — 2026-11-13

- Aligned the plugin chrome with DeepSeek Harness theme tokens instead of a separate purple palette; the default `system` theme follows DSH light/dark automatically.
- Added a single top-right preview/edit mode button that works in both directions; removed double-click-to-edit and its hint.
- Replaced the AI preset/custom action picker with immediate-run quick actions, removed the Custom button, and added hover descriptions for selection and full-document actions.
- Kept custom instructions in the textarea with Enter to run, Shift+Enter for a newline, and automatic prompt clearing after each run.

## 1.2.0 — 2026-11-12

- Added Linux/macOS native open/save dialogs (zenity, kdialog, yad, osascript) and cross-platform font discovery, reveal-in-file-manager and graceful association fallbacks.
- Made HTML a first-class document type: HTML preview, CodeMirror HTML syntax highlighting, and `Ctrl+E` preview/edit.
- Reworked HTML preview resource loading: relative CSS, images, fonts and CSS `url()` references are rewritten through an authenticated local asset route instead of resolving against the Harness app URL.
- Replaced the blocking Diff modal with a docked review panel that leaves the editor visible and preserves its scroll position; review opens beside the document.
- Isolated custom instructions from preset actions in both the client and Host prompts, and added output-boundary cleanup for selection rewrites.
- Preview selections in Markdown and HTML can now be mapped back to source offsets and sent to selection AI, including selections crossing inline formatting and HTML entities.
- Markdown and HTML files now open directly in preview mode; HTML previews load disk-backed files through the asset route instead of copying the full document through JSON.
- HTML preview images expose a right-click **Copy original image** action; the image is converted to PNG when needed and written to the clipboard.
- Preview assets are cached briefly and rewritten once per file, reducing repeated HTML render work.
- Selection AI now applies immediately; the AI rail shows **Review change** and **Revert change** for the last result. `Enter` runs the instruction, `Shift+Enter` inserts a newline, and the prompt clears after every run.
- Preset/selection output is normalized so a Markdown heading selection does not gain a duplicate `#` marker.
- Markdown preview HTML is cached by content and rendered through a deferred value; repeated rail/selection updates no longer re-parse the whole document.

## 1.1.8 — 2026-10-31

- Added the **About** panel beside File and View with version, build/update time, feature overview, shortcuts, runtime information, recent updates, usage boundaries and one-click version-info copy.
- Build metadata is injected at bundle time, so the About version and update time follow the actual build.

## 1.1.7 — 2026-10-31

- Replaced the system-font datalist with a searchable font picker: recommended fonts, per-font samples, live typography preview, keyboard navigation and refresh.
- Added `Ctrl+wheel` zoom plus `Ctrl+=`, `Ctrl+-` and `Ctrl+0`; the status bar shows the current size.
- Added `Ctrl+E` preview/edit toggle and double-click-to-edit from the Markdown preview.
- Refreshed the UI: compact menu cluster, gradient brand mark, save pill, card-based AI rail and settings, empty-state features, custom scrollbars and dark variants.

## 1.1.5 — 2026-10-31

- Added Windows per-user file associations: ProgID, `OpenWithProgids`, `RegisteredApplications`, capability declarations and a stable VBS launcher.
- Added the external-open inbox so a running DSH instance receives files opened from Explorer.
- Added file association status, install, remove, restore and Windows Default Apps actions.

## 1.1.0 — 2026-10-31

- Added Markdown preview, whole-document AI operations, batch annotations, recent files, conflict recovery and Windows-1252 support.
- Added the multi-region diff review flow that validates every range before applying one undoable edit.

## 1.0.0 — 2026-10-31

- Initial V1: CodeMirror 6 editor, tabs, native open/save, encoding-preserving I/O, binary protection, selection AI, diff review and persisted display settings.
