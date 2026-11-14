# AI Notepad

[English](README.md) | [中文](README.zh.md)

[![CI](https://github.com/JackWangSIA/dsh-ai-notepad/actions/workflows/ci.yml/badge.svg)](https://github.com/JackWangSIA/dsh-ai-notepad/actions/workflows/ci.yml)

<p align="center">
  <img src="assets/icon-180.png" width="112" alt="AI Notepad">
</p>

<p align="center">
  <strong>A lightweight, AI-native text editor for DeepSeek Harness.</strong><br>
  Edit any text file, improve only what you select, and never lose a draft to a crash.
</p>

## Why AI Notepad

AI Notepad is not a full IDE and not a Markdown-only previewer. It is the editor you open when you need to read a log, fix a README, polish a paragraph, or change a JSON value without leaving DeepSeek Harness.

It combines three things that usually live in separate tools:

- **A real text editor** for any file that can be detected as text.
- **Selection-scoped AI** that changes the part you chose, not the whole document.
- **Crash-safe autosave and independent history** so experimentation is reversible.

## Highlights

### Write and save safely

- Open, edit, save, and Save As through native pickers on Windows, Linux, and macOS; dropped files also open.
- Multi-tab editing with CodeMirror 6, undo/redo, find, line numbers, wrapping, and unsaved-change protection.
- UTF-8, UTF-8 BOM, UTF-16 LE/BE, GB18030/GBK, and Windows-1252 are detected automatically. Saving preserves the encoding, BOM, and dominant line ending.
- Binary files are rejected before they can be corrupted.
- A SHA-256 compare-before-write guard refuses to overwrite a file that another program changed while it was open.
- New documents start as Markdown (`.md`).

### Selection AI made for real editing

Select text and use the floating card or the AI rail. The same four pairs are available in both places, each pair in one button strip with a visible relation marker:

| Pair | What it does |
|---|---|
| **More concise / Richer** | Compress the selection, or add useful detail |
| **Bullets / Paragraphs** | Turn prose into a list, or turn fragments into natural paragraphs |
| **Simpler / More advanced** | Use plain language, or use more precise and sophisticated wording |
| **Check grammar / Check common sense** | Fix grammar only, or prioritise factual, logical, and common-sense issues |

Quick-action buttons run immediately. Hover a button for a short description. The floating card also contains an inline instruction field: type a custom request and press `Enter`. The rail textarea supports `Enter` to run and `Shift+Enter` for a newline. Prompts clear after every run.

### Review and history without losing later work

- AI edits apply immediately; the rail keeps **Review change** and **Revert change** for the latest result.
- Review shows a non-blocking diff. `Ctrl+Z` remains available.
- Every AI change is recorded per document. The history button sits in the top toolbar with a change count.
- Revert an older **non-overlapping** change and later changes stay intact.
- If a change overlaps later content, or a whole-document change is followed by more edits, it is marked **not independently revertible** instead of silently discarding later work.

### Crash-safe autosave

Dirty content is written to a bounded recovery store about one second after typing stops:

```text
~/.dsh/ai-notepad/autosave/
```

- No second full-text copy is retained in memory.
- One debounced timer per dirty document; the recovery list loads metadata only.
- At most 20 recovery entries or 64 MiB are kept.
- After a crash or forced exit, the next start offers **Restore / Discard / Discard all / Later**.
- Restored content opens as a new unsaved document and never overwrites the original file.
- A normal save removes the recovery copy.

### Markdown and HTML preview

- Markdown and HTML open in preview mode by default.
- The preview/edit button floats at the **top-right of the editing area**, in both directions; `Ctrl+E` also works.
- Markdown preview HTML is cached by content, so selection and rail updates do not re-parse the whole document.
- Markdown raw HTML is escaped; the renderer uses a conservative CommonMark subset.
- HTML preview rewrites relative `href`, `src`, `srcset`, inline CSS, and linked CSS `url()` references through an authenticated local asset route. Relative CSS, images, and fonts resolve from the HTML file's directory.
- Scripts remain blocked in HTML previews.
- Select text in a preview to use selection AI; ranges are mapped back to Markdown/HTML source without the usual “cannot map” warning in normal cases.
- Right-click an image in an HTML preview and choose **Copy original image** to put it on the clipboard.

### Looks like DeepSeek Harness

- Surfaces, labels, borders, status colors, and brand accent come from DSH theme tokens.
- The default `system` theme follows DSH light/dark.
- A separate **accent color** highlights paired buttons, selection cards, file-format chips, and the brand mark. Pick a preset or use the colour picker; the setting is persisted locally.
- New files default to Markdown; file associations use clickable format chips (`.md`, `.txt`, `.json`, `.html`, `.css`, `.js`, `.py`, `.ps1`, `.log`, `.yaml`, `.csv`, and more) that add or remove extensions and normalise the comma-separated list.

### Native integration

- Windows per-user file associations: ProgID, `OpenWithProgids`, `RegisteredApplications`, and a lightweight VBS launcher that delivers paths to the running Harness through the plugin inbox.
- Windows 10/11 protects the default-app choice with a per-user `UserChoice` hash. AI Notepad registers a real Open With entry, but the user still chooses **Always use this app** once in Explorer.
- Linux foreground Open/Save uses `zenity`, `kdialog`, or `yad`; reveal uses the FreeDesktop `FileManager1` D-Bus API with an `xdg-open` fallback.
- macOS uses `osascript` for Open/Save and `open -R` for reveal.
- System associations are Windows-only; the association panel explains this and hides install/remove actions elsewhere.

## Install

From the plugin market after the listing is live. The market entry uses the version-free GitHub Release tarball, so npm is not required.

From GitHub:

```bash
dsh plugin --profile web add JackWangSIA/dsh-ai-notepad
```

Prebuilt tarball:

```text
https://github.com/JackWangSIA/dsh-ai-notepad/releases/latest/download/dsh-ai-notepad.tgz
```

On DSH Desktop, prefer **Plugins → Add plugin** with the repository URL. The `desktop` profile is managed by the app; do not edit it with the CLI by hand.

## Quick start

1. Open AI Notepad from the sidebar or the plugin panel.
2. Press `Ctrl+N` for a new Markdown file, or drop a text file into the editor.
3. Select a sentence or paragraph and choose a paired action, or type your own request in the floating card.
4. Review the applied change in the rail, or open **Change history** in the top toolbar.
5. `Ctrl+E` toggles preview/edit for Markdown and HTML.

## Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` / `Ctrl+Shift+S` | Save / Save As |
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo |
| `Ctrl+F` | Find |
| `Ctrl+E` | Toggle Markdown / HTML preview and edit |
| `Ctrl+wheel`, `Ctrl+=`, `Ctrl+-`, `Ctrl+0` | Font zoom in / out / reset |
| `Ctrl+Alt+1..4` | Selection concise / polish / expand / proofread |
| `Enter` | Run a custom instruction |
| `Shift+Enter` | Newline in the rail instruction box |

## Platform support

- **Windows:** native pickers, font enumeration, file associations, reveal.
- **Linux:** native pickers when `zenity`/`kdialog`/`yad` is installed; `fc-list` fonts; FreeDesktop reveal; editing works without associations.
- **macOS:** `osascript` pickers; `fc-list` fonts when available; `open -R` reveal; editing works without associations.

## Architecture

- `lib/index.js` — Host half. Authenticated `/api/ai-notepad/*` routes, bounded file I/O, encoding, conflict guards, autosave store, LLM calls, Windows registry, inbox watcher, pickers, and font enumeration.
- `src/` — Client source. `app.jsx` renders the page, `editor.jsx` owns CodeMirror, `store.js` owns tabs/AI/review/history/autosave/settings, and `diff.js` / `markdown.js` are pure helpers.
- `lib/client.js` — generated classic ModuleLoader bundle (React stays external).
- `lib/scripts/` — native file pickers, font enumeration, and the Windows external-open launcher.
- `scripts/build.mjs` — esbuild bundle step.
- `test/` — Host route and encoding tests, VBS/inbox delivery, store AI/history/autosave tests, ModuleLoader load, and server-render tests.

## Development

```powershell
$node = "$env:USERPROFILE\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
$pnpm = "$env:USERPROFILE\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\pnpm\bin\pnpm.mjs"
& $node $pnpm install --ignore-scripts --dir .
& $node scripts/build.mjs
& $node --test test/*.test.mjs
```

Install the absolute directory with the Harness `plugin_manager` `install_bundle` action. Do not copy files into the profile manually.

## Limits and security

- Individual file read limit: 64 MiB. Files over 16 MiB show a large-file warning.
- Whole-document AI context is about 120k characters; very long documents omit the middle context.
- History is per document and session-only. It is not persisted across restarts; autosave covers draft recovery, not the history ledger.
- HTML previews block scripts. They are for reading and selection AI, not for running an HTML application.
- External images in HTML previews may fail to copy because of browser CORS rules.
- Autosave is a recovery copy, not a substitute for saving. A normal save is still the source of truth.

## License

[MIT](LICENSE) © 2026 Wang Heran
