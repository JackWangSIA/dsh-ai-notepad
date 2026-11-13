import { useSyncExternalStore } from 'react'
import { lineDiff } from './diff.js'

const SETTINGS_KEY = 'dsh.ai-notepad.settings.v1'
const RECENT_KEY = 'dsh.ai-notepad.recent.v1'
const REV_KEY = 'dsh.ai-notepad.inbox-rev.v1'

export const DEFAULT_SETTINGS = Object.freeze({
  fontFamily: 'Microsoft YaHei UI',
  fontSize: 15,
  lineHeight: 1.65,
  fontWeight: '400',
  wrap: true,
  theme: 'system',
  lineNumbers: true,
  tabSize: 2,
  previewScale: 1.05,
  aiPanelOpen: true,
})

const MESSAGES = {
  zh: {
    app: 'AI Notepad',
    newFile: '新建',
    open: '打开',
    save: '保存',
    saveAs: '另存为',
    settings: '设置',
    associations: '文件关联',
    close: '关闭',
    untitled: '未命名',
    noFile: '没有打开的文件',
    emptyTitle: '开始写作，或打开一个文本文件',
    emptyHint: '支持 TXT、Markdown、JSON、代码和任意可识别为文本的文件。拖入文件也可以打开。',
    openFile: '打开文件',
    createFile: '新建文本',
    recent: '最近文件',
    aiEdit: 'AI 编辑',
    selection: '当前选区',
    noSelection: '选中文字后可使用局部 AI 编辑',
    fullDocument: '全文处理',
    concise: '精简',
    polish: '润色',
    expand: '扩写',
    restructure: '重构',
    proofread: '纠错',
    custom: '自定义',
    summarize: '内容总结',
    outline: '逻辑梳理',
    titles: '生成标题',
    run: '运行',
    regenerate: '重新生成',
    accept: '接受修改',
    reject: '拒绝',
    reviewTitle: 'AI 修改对比',
    diffBefore: '原文',
    diffAfter: '修改后',
    instruction: '修改要求（可选）',
    quickActions: '快捷操作',
    clickToRun: '点击即运行',
    customInstruction: '自定义要求',
    selectFirst: '请先选中文字',
    descConcise: '压缩选区内文字，保留关键信息、事实和数字。',
    descPolish: '改善用词、语气和流畅度，不改变原意。',
    descExpand: '补充解释、细节或例子，不改变核心意思。',
    descRestructure: '调整语序和逻辑层次，使表达更清晰。',
    descProofread: '修正错别字、语法、标点和明显的表达问题。',
    descFullPolish: '在不改变事实和结构的前提下改善全文表达。',
    descFullConcise: '压缩全文，删除重复和空话。',
    descFullProofread: '检查并修正全文的错别字、语法和标点。',
    descFullRestructure: '重排全文结构与段落顺序。',
    descSummarize: '生成全文摘要并替换全文（可回退）。',
    descOutline: '重排标题层级和章节结构。',
    descTitles: '为全文生成标题与小标题。',
    customPlaceholder: '输入自定义要求；Enter 运行，Shift+Enter 换行',
    loading: 'AI 正在处理…',
    cancel: '取消',
    conflict: '文件已被其他程序修改',
    conflictHint: '为避免覆盖外部修改，AI Notepad 没有写入。你可以重新加载，或另存为新文件。',
    reload: '重新加载',
    overwrite: '仍然覆盖',
    binary: '这是一个二进制文件，已拒绝打开以保护文件。',
    saved: '已保存',
    largeFile: '已打开超过 16 MiB 的大文件；渲染、预览和 AI 可能变慢，保存时会占用更多内存。',
    copyImage: '复制原图',
    imageCopied: '图片已复制到剪贴板',
    imageCopyFailed: '复制图片失败',
    aiApplied: '已应用 AI 修改；可回看或退回',
    appliedChange: '已应用修改',
    reviewChange: '回看修改',
    revertChange: '退回修改',
    reverted: '已退回本次修改',
    revertBlocked: '文档内容已变化，无法精确退回；请使用 Ctrl+Z',
    history: '修改历史',
    historyEmpty: '还没有 AI 修改记录。',
    historyHint: '每次 AI 修改都会保留在这里；回退会恢复到该次修改前。',
    historyConfirm: '回退到此次修改前会丢弃它之后的修改，继续吗？',
    historyRolledBack: '已回退到此次修改前',
    viewChange: '查看',
    rollback: '回退',
    noPath: '新文件还没有路径',
    dirty: '未保存',
    chars: '字符',
    words: '词',
    line: '行',
    column: '列',
    encoding: '编码',
    eol: '换行',
    model: '模型',
    preview: '预览',
    edit: '编辑',
    previewEmpty: '没有可预览的 Markdown 或 HTML 内容',
    previewMode: 'Markdown 预览',
    htmlPreviewMode: 'HTML 预览',
    previewSelection: '预览选区',
    previewSelectionUnmapped: '这段预览选区无法精确映射回源码，请在编辑器中重新选中。',
    previewSelectionHint: '在预览中选中文字后，可直接用 AI 修改；只有能定位到源码的选区才会启用。',
    reviewDock: '审阅修改',
    reviewAppliedHint: '修改已应用；可回看 Diff，或退回本次修改。',
    reviewDockHint: '编辑器保持可见，接受或拒绝后再继续。',
    togglePreview: '切换预览 / 编辑',
    about: '关于',
    aboutTitle: '关于 AI Notepad',
    aboutTagline: '轻量、通用、AI 原生的文本编辑器',
    aboutIntro: '普通文本编辑 + 选区 AI 智能修改 + 跨平台原生文件选择。它不是完整 IDE，只把日常写作、查看和局部改写文本这件事做轻、做顺。',
    aboutFeatures: '能做什么',
    aboutShortcuts: '常用快捷键',
    aboutRuntime: '运行信息',
    aboutUpdates: '近期更新',
    aboutLimits: '使用边界',
    aboutVersion: '版本',
    aboutBuildTime: '更新时间',
    aboutPlatform: '平台',
    aboutModel: '当前模型',
    aboutAssoc: '文件关联',
    aboutAssocOn: '已注册',
    aboutAssocOff: '未注册',
    aboutCopy: '复制版本信息',
    aboutCopied: '版本信息已复制',
    aboutClose: '关闭',
    featureTextTitle: '通用文本',
    featureTextDesc: '任意文本、编码保留、二进制保护',
    featureEditTitle: '轻量编辑',
    featureEditDesc: 'CodeMirror 6、多标签、撤销/重做、查找',
    featureSelectionTitle: '选区 AI',
    featureSelectionDesc: '只改选中区域，应用后可回看或退回',
    featureDocumentTitle: '全文 AI',
    featureDocumentDesc: '润色、精简、总结、梳理结构、生成标题',
    featurePreviewTitle: 'Markdown / HTML 预览',
    featurePreviewDesc: 'Markdown 与 HTML 预览，相对 CSS/图片可加载',
    featureAssocTitle: '跨平台原生集成',
    featureAssocDesc: 'Linux/macOS 选择器；Windows 当前用户级 Open With',
    featureModelTitle: '复用 Harness 模型',
    featureModelDesc: '无需额外 API Key，沿用当前默认模型',
    limitAssoc: 'Windows 默认应用仍受 UserChoice 哈希保护，注册 Open With 后需要手动选择一次“始终使用”。',
    limitEditor: '预览是快速查看模式，可通过右上角按钮或 Ctrl+E 回到编辑，不提供完整的 WYSIWYG 富文本编辑。',
    limitSize: '单文件读取上限 64 MiB（超过 16 MiB 会提示大文件）；全文 AI 上下文约 120k 字符，超长文档会截断中间上下文。',
    aboutUpdateCurrent: '当前版本：界面沿用 DSH 主题 token；右上角双向预览/编辑按钮；AI 快捷操作点击即运行并带悬停说明；自定义输入独立运行。',
    aboutUpdatePrev: '此前版本：搜索式字体选择器、Ctrl+滚轮缩放、Markdown 预览、Windows 文件关联与启动器。',
    fontSearch: '搜索字体…',
    fontRecommended: '推荐',
    fontAll: '全部字体',
    fontRefresh: '刷新字体列表',
    fontCount: '个字体',
    fontPreview: '中文 Aa 123',
    featureSelection: '选区 AI',
    featureEncoding: '编码保留',
    featureAssoc: '原生文件集成',
    zoom: '字号',
    find: '查找',
    fileMenu: '文件',
    viewMenu: '视图',
    associationTitle: 'Windows 文件关联',
    associationHint: '注册后，在资源管理器右键「打开方式」中会出现 DeepSeek Harness AI Notepad。',
    associationInstall: '注册文件关联',
    associationRemove: '移除文件关联',
    associationRestore: '卸载并恢复',
    associationDefault: '打开 Windows 默认应用',
    associationOpenWith: '选择默认打开方式',
    associationDefaultHint: 'Windows 10/11 禁止程序静默修改默认应用。注册后请右键文件 →「打开方式」→ 选择本应用并勾选「始终使用」。',
    associationNone: '尚未注册',
    associationRegistered: '已注册',
    associationDefaultOn: '当前默认',
    extensions: '关联扩展名',
    extensionsHint: '用逗号、分号或换行分隔；留空使用默认文本扩展名。',
    font: '字体',
    fontSize: '字号',
    lineHeight: '行间距',
    fontWeight: '字体粗细',
    wrap: '自动换行',
    theme: '编辑器主题',
    lineNumbers: '显示行号',
    tabSize: 'Tab 宽度',
    previewScale: '预览字号比例',
    normal: '普通',
    bold: '加粗',
    light: '浅色',
    dark: '深色',
    system: '跟随系统',
    reset: '恢复默认',
    apply: '完成',
    toastCopied: '已复制',
    toastNothing: '没有可复制的内容',
    readOnly: '只读',
    openWith: '在资源管理器中显示',
    closeTab: '关闭标签',
    undo: '撤销',
    redo: '重做',
    copy: '复制',
    cut: '剪切',
    paste: '粘贴',
    selectAll: '全选',
    wordCount: '字数',
    aiError: 'AI 处理失败',
    modelUnavailable: '没有可用的默认模型，请先在 Harness 设置中选择模型。',
    selectionChanged: '内容在 AI 处理期间已被修改，已取消替换。',
    conflictSaved: '已保留本地内容，请另存为',
  },
  en: {
    app: 'AI Notepad',
    newFile: 'New',
    open: 'Open',
    save: 'Save',
    saveAs: 'Save As',
    settings: 'Settings',
    associations: 'File associations',
    close: 'Close',
    untitled: 'Untitled',
    noFile: 'No file open',
    emptyTitle: 'Start writing, or open a text file',
    emptyHint: 'TXT, Markdown, JSON, code and any file detected as text. Drop files here to open.',
    openFile: 'Open file',
    createFile: 'New text file',
    recent: 'Recent files',
    aiEdit: 'AI Edit',
    selection: 'Selection',
    noSelection: 'Select text to use local AI editing',
    fullDocument: 'Whole document',
    concise: 'Concise',
    polish: 'Polish',
    expand: 'Expand',
    restructure: 'Restructure',
    proofread: 'Proofread',
    custom: 'Custom',
    summarize: 'Summarize',
    outline: 'Outline',
    titles: 'Titles',
    run: 'Run',
    regenerate: 'Regenerate',
    accept: 'Accept',
    reject: 'Reject',
    reviewTitle: 'AI change review',
    diffBefore: 'Before',
    diffAfter: 'After',
    instruction: 'Instruction (optional)',
    quickActions: 'Quick actions',
    clickToRun: 'Click to run',
    customInstruction: 'Custom instruction',
    selectFirst: 'Select text first',
    descConcise: 'Compress the selected text while keeping key facts and numbers.',
    descPolish: 'Improve wording, tone and flow without changing the meaning.',
    descExpand: 'Add explanation or detail without changing the core meaning.',
    descRestructure: 'Reorder sentences and logic for clearer structure.',
    descProofread: 'Fix typos, grammar, punctuation and obvious wording issues.',
    descFullPolish: 'Improve the whole document while keeping facts and structure.',
    descFullConcise: 'Compress the whole document and remove repetition.',
    descFullProofread: 'Check and fix typos, grammar and punctuation throughout.',
    descFullRestructure: 'Reorder the document structure and paragraphs.',
    descSummarize: 'Generate a summary and replace the document (revertible).',
    descOutline: 'Rework heading levels and section structure.',
    descTitles: 'Generate a title and section headings for the document.',
    customPlaceholder: 'Enter a custom instruction; Enter runs, Shift+Enter adds a line',
    loading: 'AI is working…',
    cancel: 'Cancel',
    conflict: 'File changed outside AI Notepad',
    conflictHint: 'Nothing was written. Reload, or save the local content as a new file.',
    reload: 'Reload',
    overwrite: 'Overwrite anyway',
    binary: 'This looks like a binary file. It was not opened.',
    saved: 'Saved',
    largeFile: 'Opened a file larger than 16 MiB. Rendering, preview and AI may be slower, and saving uses more memory.',
    copyImage: 'Copy original image',
    imageCopied: 'Image copied to clipboard',
    imageCopyFailed: 'Could not copy image',
    aiApplied: 'AI change applied; review or revert it here',
    appliedChange: 'Change applied',
    reviewChange: 'Review change',
    revertChange: 'Revert change',
    reverted: 'Change reverted',
    revertBlocked: 'The document changed, so it cannot be reverted precisely; use Ctrl+Z',
    history: 'Change history',
    historyEmpty: 'No AI changes yet.',
    historyHint: 'Every AI change is kept here; reverting restores the content before that change.',
    historyConfirm: 'Reverting to before this change discards the changes after it. Continue?',
    historyRolledBack: 'Reverted to before this change',
    viewChange: 'View',
    rollback: 'Revert',
    noPath: 'This new file has no path yet',
    dirty: 'Unsaved',
    chars: 'chars',
    words: 'words',
    line: 'Line',
    column: 'Col',
    encoding: 'Encoding',
    eol: 'EOL',
    model: 'Model',
    preview: 'Preview',
    edit: 'Edit',
    previewEmpty: 'No Markdown or HTML to preview',
    previewMode: 'Markdown preview',
    htmlPreviewMode: 'HTML preview',
    previewSelection: 'Preview selection',
    previewSelectionUnmapped: 'This preview selection cannot be mapped back to the source. Select it in the editor instead.',
    previewSelectionHint: 'Select text in the preview to edit it with AI. Only selections that map back to source are enabled.',
    reviewDock: 'Review changes',
    reviewAppliedHint: 'The change is applied; inspect the diff or revert it.',
    reviewDockHint: 'The editor stays visible; accept or reject when ready.',
    togglePreview: 'Toggle preview / edit',
    about: 'About',
    aboutTitle: 'About AI Notepad',
    aboutTagline: 'A lightweight, general-purpose, AI-native text editor',
    aboutIntro: 'Plain text editing + selection-scoped AI + native file pickers. Not an IDE: it keeps daily writing, viewing and local rewriting light and direct.',
    aboutFeatures: 'What it does',
    aboutShortcuts: 'Shortcuts',
    aboutRuntime: 'Runtime',
    aboutUpdates: 'Recent updates',
    aboutLimits: 'Boundaries',
    aboutVersion: 'Version',
    aboutBuildTime: 'Updated',
    aboutPlatform: 'Platform',
    aboutModel: 'Model',
    aboutAssoc: 'File associations',
    aboutAssocOn: 'Registered',
    aboutAssocOff: 'Not registered',
    aboutCopy: 'Copy version info',
    aboutCopied: 'Version info copied',
    aboutClose: 'Close',
    featureTextTitle: 'Any text',
    featureTextDesc: 'Encoding-preserving, binary-safe file editing',
    featureEditTitle: 'Light editor',
    featureEditDesc: 'CodeMirror 6, tabs, undo/redo, find',
    featureSelectionTitle: 'Selection AI',
    featureSelectionDesc: 'Only the selection changes; review or revert after applying',
    featureDocumentTitle: 'Document AI',
    featureDocumentDesc: 'Polish, condense, summarize, outline, titles',
    featurePreviewTitle: 'Markdown / HTML preview',
    featurePreviewDesc: 'Markdown and HTML preview with relative CSS and images',
    featureAssocTitle: 'Cross-platform native integration',
    featureAssocDesc: 'Linux/macOS pickers; Windows per-user Open With',
    featureModelTitle: 'Harness model',
    featureModelDesc: 'No extra API key; uses the current default model',
    limitAssoc: 'Windows still protects the default-app choice with UserChoice. After registering Open With, choose “Always use” once.',
    limitEditor: 'Preview is a quick reading mode; use the top-right button or Ctrl+E to return to editing. It is not a full WYSIWYG editor.',
    limitSize: 'File read limit 64 MiB (files over 16 MiB show a large-file warning); document AI context about 120k characters; very long documents omit the middle context.',
    aboutUpdateCurrent: 'Current: DSH theme-token chrome, a bidirectional preview/edit button, immediate AI quick actions with hover descriptions, and independent custom instructions.',
    aboutUpdatePrev: 'Earlier: searchable font picker, Ctrl+wheel zoom, Markdown preview, Windows associations and launcher.',
    fontSearch: 'Search fonts…',
    fontRecommended: 'Recommended',
    fontAll: 'All fonts',
    fontRefresh: 'Refresh font list',
    fontCount: 'fonts',
    fontPreview: 'Aa 中文 123',
    featureSelection: 'Selection AI',
    featureEncoding: 'Encoding-safe',
    featureAssoc: 'Native file integration',
    zoom: 'Font size',
    find: 'Find',
    fileMenu: 'File',
    viewMenu: 'View',
    associationTitle: 'Windows file associations',
    associationHint: 'After registration, “DeepSeek Harness AI Notepad” appears in Explorer’s Open with menu.',
    associationInstall: 'Register associations',
    associationRemove: 'Remove associations',
    associationRestore: 'Uninstall and restore',
    associationDefault: 'Open Windows Default Apps',
    associationOpenWith: 'Choose default app',
    associationDefaultHint: 'Windows 10/11 protects the default app choice. After registering, use Open with → choose this app → “Always use”.',
    associationNone: 'Not registered',
    associationRegistered: 'Registered',
    associationDefaultOn: 'Default',
    extensions: 'Extensions',
    extensionsHint: 'Comma, semicolon or newline separated. Leave empty for the built-in text list.',
    font: 'Font',
    fontSize: 'Size',
    lineHeight: 'Line spacing',
    fontWeight: 'Weight',
    wrap: 'Wrap lines',
    theme: 'Editor theme',
    lineNumbers: 'Line numbers',
    tabSize: 'Tab size',
    previewScale: 'Preview scale',
    normal: 'Normal',
    bold: 'Bold',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    reset: 'Reset',
    apply: 'Done',
    toastCopied: 'Copied',
    toastNothing: 'Nothing to copy',
    readOnly: 'Read only',
    openWith: 'Show in Explorer',
    closeTab: 'Close tab',
    undo: 'Undo',
    redo: 'Redo',
    copy: 'Copy',
    cut: 'Cut',
    paste: 'Paste',
    selectAll: 'Select all',
    wordCount: 'Words',
    aiError: 'AI failed',
    modelUnavailable: 'No default model is configured. Choose one in Harness settings.',
    selectionChanged: 'The content changed while AI was working; the replacement was cancelled.',
    conflictSaved: 'Local content kept; save as a new file',
  },
}

function initialLanguage() {
  const lang = typeof navigator !== 'undefined' ? String(navigator.language || '') : ''
  return /^zh/i.test(lang) ? 'zh' : 'en'
}

export function message(key) {
  const lang = state.lang || 'en'
  return (MESSAGES[lang] && MESSAGES[lang][key]) || MESSAGES.en[key] || key
}

/**
 * Settings store one family name, not a full CSS stack. Older builds stored a
 * complete stack; keep those users working by extracting its first family.
 */
export function normalizeFontFamily(value) {
  let name = String(value == null ? '' : value).trim()
  if (name === '') return DEFAULT_SETTINGS.fontFamily
  name = name.split(',')[0].trim()
  name = name.replace(/^['"]+|['"]+$/g, '').trim()
  return name || DEFAULT_SETTINGS.fontFamily
}

function readSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw)
    const merged = { ...DEFAULT_SETTINGS, ...(parsed && typeof parsed === 'object' ? parsed : {}) }
    return { ...merged, fontFamily: normalizeFontFamily(merged.fontFamily) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

function readRecent() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(item => typeof item === 'string').slice(0, 12) : []
  } catch {
    return []
  }
}

function readRev() {
  const value = Number(localStorage.getItem(REV_KEY) || 0)
  return Number.isFinite(value) && value >= 0 ? value : 0
}

let nextId = 1
function makeId() {
  return 'doc-' + Date.now().toString(36) + '-' + (nextId++).toString(36)
}

function newDoc(name) {
  const ordinal = nextId
  return {
    id: makeId(),
    path: null,
    name: name || (message('untitled') + ' ' + ordinal),
    content: '',
    savedContent: '',
    cmState: null,
    dirty: false,
    readOnly: false,
    encoding: 'utf-8',
    bom: false,
    eol: '\n',
    hash: null,
    size: 0,
    mtimeMs: 0,
    preview: false,
    conflict: false,
    selection: { from: 0, to: 0, text: '', coords: null },
    cursor: { line: 1, column: 1 },
  }
}

const state = {
  version: 0,
  lang: initialLanguage(),
  settings: readSettings(),
  docs: [],
  activeId: null,
  recent: readRecent(),
  busy: null,
  toast: null,
  toastTimer: null,
  menu: null,
  contextMenu: null,
  ai: {
    open: true,
    action: 'polish',
    instruction: '',
    loading: false,
    error: null,
    controller: null,
    request: null,
    selection: null,
  },
  review: null,
  reviewOpen: false,
  history: [],
  historyOpen: false,
  settingsOpen: false,
  aboutOpen: false,
  associationOpen: false,
  association: null,
  associationBusy: false,
  fonts: null,
  model: null,
  host: null,
  inboxRev: readRev(),
  inboxBusy: false,
  previewHtml: '',
}

const listeners = new Set()

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getState() {
  return state
}

export function useNotepad() {
  useSyncExternalStore(subscribe, () => state.version, () => state.version)
  return state
}

function emit(patch) {
  Object.assign(state, patch)
  state.version += 1
  for (const fn of listeners) {
    try { fn() } catch (error) { console.error('[ai-notepad] listener failed', error) }
  }
}

export function t(key) {
  return message(key)
}

export function setLang(lang) {
  state.lang = lang === 'zh' ? 'zh' : 'en'
  emit({})
}

export function persistSettings(patch) {
  const next = { ...state.settings, ...patch }
  if (Object.prototype.hasOwnProperty.call(patch, 'fontFamily')) next.fontFamily = normalizeFontFamily(next.fontFamily)
  state.settings = next
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)) } catch {}
  emit({})
}

export function resetSettings() {
  state.settings = { ...DEFAULT_SETTINGS }
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)) } catch {}
  emit({})
}

export function activeDoc() {
  return state.docs.find(doc => doc.id === state.activeId) || null
}

export function previewKind(doc) {
  const name = String(doc?.name || doc?.path || '').toLowerCase()
  if (/\.(md|markdown|mdx)$/.test(name)) return 'markdown'
  if (/\.(html?|htm)$/.test(name)) return 'html'
  return null
}

function replaceDoc(id, patch) {
  const index = state.docs.findIndex(doc => doc.id === id)
  if (index === -1) return null
  const next = typeof patch === 'function' ? patch(state.docs[index]) : { ...state.docs[index], ...patch }
  const docs = state.docs.slice()
  docs[index] = next
  return { docs, doc: next }
}

export function setState(patch) {
  emit(patch)
}

export function toast(text, kind = 'info', ms = 3200) {
  if (state.toastTimer) clearTimeout(state.toastTimer)
  const value = { id: Date.now(), text, kind }
  state.toast = value
  state.toastTimer = setTimeout(() => {
    if (state.toast && state.toast.id === value.id) emit({ toast: null, toastTimer: null })
  }, ms)
  emit({})
}

export function ensureInitialDoc() {
  if (state.docs.length > 0) return
  const doc = newDoc()
  emit({ docs: [doc], activeId: doc.id })
}

export function newFile() {
  const doc = newDoc()
  emit({ docs: [...state.docs, doc], activeId: doc.id, review: null })
  return doc
}

export function activateDoc(id) {
  if (!state.docs.some(doc => doc.id === id)) return
  emit({ activeId: id, review: null })
}

export function setDocState(id, cmState) {
  const updated = replaceDoc(id, { cmState })
  if (updated) emit({ docs: updated.docs })
}

export function updateDocContent(id, content, cmState, selection, cursor) {
  const updated = replaceDoc(id, doc => {
    if (doc.content === content && doc.cmState === cmState && !selection) return doc
    return {
      ...doc,
      content,
      cmState: cmState || doc.cmState,
      dirty: content !== doc.savedContent,
      selection: selection || doc.selection,
      cursor: cursor || doc.cursor,
      conflict: content === doc.savedContent ? false : doc.conflict,
    }
  })
  if (updated && updated.doc !== state.docs.find(doc => doc.id === id)) emit({ docs: updated.docs })
}

export function setSelection(id, selection) {
  const updated = replaceDoc(id, { selection })
  if (updated) emit({ docs: updated.docs })
}

const HTML_BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'br', 'dd', 'div', 'dl', 'dt',
  'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre', 'section', 'table',
  'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul',
])

function decodeEntityAt(source, index) {
  const match = source.slice(index, index + 16).match(/^&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/i)
  if (!match) return null
  const body = match[1]
  let char = ''
  if (body[0] === '#') {
    const code = body[1] && body[1].toLowerCase() === 'x'
      ? Number.parseInt(body.slice(2), 16)
      : Number.parseInt(body.slice(1), 10)
    if (Number.isFinite(code)) {
      try { char = String.fromCodePoint(code) } catch {}
    }
  } else {
    char = ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[body.toLowerCase()] || ''
  }
  return char ? { char, length: match[0].length } : null
}

function buildIndexedPreviewText(source, kind) {
  const chars = []
  const starts = []
  const ends = []
  const append = (value, from, to) => {
    if (!value) return
    if (/\s/.test(value)) {
      if (chars.length === 0) return
      if (chars[chars.length - 1] === ' ') {
        ends[ends.length - 1] = to
        return
      }
      chars.push(' ')
      starts.push(from)
      ends.push(to)
      return
    }
    chars.push(value)
    starts.push(from)
    ends.push(to)
  }
  const appendTwice = (value, from, to) => {
    for (const char of value) append(char, from, to)
  }
  let i = 0
  if (kind === 'html') {
    const lower = source.toLowerCase()
    while (i < source.length) {
      if (source.startsWith('<!--', i)) {
        const end = source.indexOf('-->', i + 4)
        i = end < 0 ? source.length : end + 3
        continue
      }
      if (source[i] === '<') {
        const end = source.indexOf('>', i + 1)
        if (end < 0) break
        let tag = source.slice(i + 1, end).trim()
        tag = tag.replace(/^\/?/, '').split(/\s/)[0].toLowerCase()
        if (tag === 'script' || tag === 'style') {
          const close = lower.indexOf(`</${tag}>`, end + 1)
          i = close < 0 ? source.length : close
          continue
        }
        if (HTML_BLOCK_TAGS.has(tag)) append(' ', i, i + 1)
        i = end + 1
        continue
      }
      if (source[i] === '&') {
        const entity = decodeEntityAt(source, i)
        if (entity) {
          appendTwice(entity.char, i, i + entity.length)
          i += entity.length
          continue
        }
      }
      append(source[i], i, i + 1)
      i += 1
    }
  } else {
    let lineStart = true
    while (i < source.length) {
      const char = source[i]
      if (char === '\n' || char === '\r') {
        append(' ', i, i + 1)
        i += 1
        lineStart = true
        continue
      }
      if (lineStart) {
        if (source.startsWith('```', i)) {
          const eol = source.indexOf('\n', i)
          i = eol < 0 ? source.length : eol + 1
          lineStart = true
          continue
        }
        if ('#>+-*'.includes(char)) {
          let j = i
          while (source[j] === char) j += 1
          if (source[j] === ' ') {
            i = j + 1
            lineStart = false
            continue
          }
        }
        lineStart = false
      }
      if ('*_`~'.includes(char)) {
        i += 1
        continue
      }
      if (char === '!' && source[i + 1] === '[') {
        i += 1
        continue
      }
      if (char === '[' || char === ']') {
        if (char === ']' && source[i + 1] === '(') {
          let depth = 1
          let j = i + 2
          while (j < source.length && depth > 0) {
            if (source[j] === '(') depth += 1
            else if (source[j] === ')') depth -= 1
            j += 1
          }
          i = j
          continue
        }
        i += 1
        continue
      }
      append(char, i, i + 1)
      i += 1
    }
  }
  return { text: chars.join(''), starts, ends }
}

function findIndexedRange(source, needle, kind, offset = 0) {
  const indexed = buildIndexedPreviewText(source, kind)
  const at = indexed.text.indexOf(needle)
  if (at === -1) return null
  const from = indexed.starts[at]
  const to = indexed.ends[at + needle.length - 1]
  if (!Number.isInteger(from) || !Number.isInteger(to)) return null
  return { from: from + offset, to: to + offset }
}

function findLargePreviewRange(source, needle, kind) {
  const tokens = needle.match(/[\p{L}\p{N}_]+/gu) || []
  if (tokens.length === 0) return null
  const first = tokens[0]
  const last = tokens[tokens.length - 1]
  const maxSpan = 600_000
  let from = 0
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const start = source.indexOf(first, from)
    if (start < 0) break
    const lastAt = source.indexOf(last, start + first.length)
    if (lastAt >= 0 && lastAt - start <= maxSpan) {
      const sliceStart = Math.max(0, start - 200)
      const sliceEnd = Math.min(source.length, lastAt + last.length + 200)
      const slice = source.slice(sliceStart, sliceEnd)
      const mapped = findIndexedRange(slice, needle, kind)
      if (mapped) return { from: mapped.from + sliceStart, to: mapped.to + sliceStart }
    }
    from = start + Math.max(1, first.length)
  }
  return null
}

export function findPreviewRange(content, text, kind) {
  const source = String(content || '')
  const raw = String(text || '').trim()
  if (!raw) return null
  const exact = source.indexOf(raw)
  if (exact !== -1) return { from: exact, to: exact + raw.length }
  const needle = raw.replace(/\s+/g, ' ').trim()
  if (!needle) return null
  const mapped = source.length > 1_000_000
    ? findLargePreviewRange(source, needle, kind === 'html' ? 'html' : 'markdown')
    : findIndexedRange(source, needle, kind === 'html' ? 'html' : 'markdown')
  if (!mapped) return null
  if (kind === 'html') return expandHtmlRange(source, mapped.from, mapped.to)
  return expandMarkdownRange(source, mapped.from, mapped.to)
}

function expandMarkdownRange(source, from, to) {
  let start = from
  let end = to
  const isMarker = char => char === '*' || char === '_' || char === '~'
  for (;;) {
    let moved = false
    while (start > 0 && isMarker(source[start - 1])) {
      start -= 1
      moved = true
    }
    if (start > 0 && source[start - 1] === '[') {
      start -= 1
      if (start > 0 && source[start - 1] === '!') start -= 1
      moved = true
    }
    if (!moved) break
  }
  for (;;) {
    let moved = false
    while (end < source.length && isMarker(source[end])) {
      end += 1
      moved = true
    }
    if (source[end] === ']' && source[end + 1] === '(') {
      let depth = 1
      let index = end + 2
      while (index < source.length && depth > 0) {
        if (source[index] === '(') depth += 1
        else if (source[index] === ')') depth -= 1
        index += 1
      }
      end = index
      moved = true
    }
    if (!moved) break
  }
  return { from: start, to: end }
}

const HTML_VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
])

function expandHtmlRange(source, from, to) {
  const opened = []
  const slice = source.slice(from, to)
  const tagPattern = /<\s*(\/?)\s*([a-z][a-z0-9:-]*)\b([^>]*)>/gi
  let match
  while ((match = tagPattern.exec(slice))) {
    const closing = match[1] === '/'
    const tag = match[2].toLowerCase()
    if (HTML_VOID_TAGS.has(tag) || /\/\s*$/.test(match[3])) continue
    if (closing) {
      const index = opened.lastIndexOf(tag)
      if (index !== -1) opened.splice(index, 1)
    } else {
      opened.push(tag)
    }
  }
  let end = to
  for (let index = opened.length - 1; index >= 0; index -= 1) {
    const tag = opened[index]
    const close = new RegExp(`<\\s*/\\s*${tag}\\s*>`, 'i').exec(source.slice(end))
    if (!close) continue
    end += close.index + close[0].length
  }
  return { from, to: end }
}

function findTextRange(content, text, kind) {
  const source = String(content || '')
  const needle = String(text || '').trim()
  if (!needle) return null
  const exact = source.indexOf(needle)
  if (exact !== -1) return { from: exact, to: exact + needle.length }
  return findPreviewRange(source, needle, kind)
}

export function setPreviewSelection(text) {
  const doc = activeDoc()
  if (!doc) return
  const value = String(text || '').trim()
  if (!value) {
    setSelection(doc.id, { from: 0, to: 0, text: '', coords: null, source: 'preview' })
    return
  }
  const range = findTextRange(doc.content, value, previewKind(doc))
  setSelection(doc.id, {
    from: range ? range.from : -1,
    to: range ? range.to : -1,
    text: value,
    coords: null,
    source: 'preview',
    unmapped: !range,
  })
  if (!range) toast(t('previewSelectionUnmapped'), 'warn', 4200)
}

export function updateCursor(id, cursor) {
  const updated = replaceDoc(id, { cursor })
  if (updated) emit({ docs: updated.docs })
}

export function setPreview(id, preview) {
  const updated = replaceDoc(id, doc => {
    const patch = { preview }
    if (!preview && doc.selection?.source === 'preview') {
      patch.selection = { from: 0, to: 0, text: '', coords: null }
    }
    return { ...doc, ...patch }
  })
  if (updated) emit({ docs: updated.docs })
}

export function closeDoc(id) {
  const doc = state.docs.find(item => item.id === id)
  if (!doc) return
  if (doc.dirty && !window.confirm(`“${doc.name}” 有未保存的修改，确定关闭吗？`)) return
  const rest = state.docs.filter(item => item.id !== id)
  if (rest.length === 0) {
    const fresh = newDoc()
    emit({ docs: [fresh], activeId: fresh.id, review: null })
    return
  }
  const index = state.docs.findIndex(item => item.id === id)
  const nextActive = state.activeId === id ? rest[Math.max(0, index - 1)].id : state.activeId
  emit({ docs: rest, activeId: nextActive, review: null })
}

function rememberRecent(filePath) {
  const list = [filePath, ...state.recent.filter(item => item.toLowerCase() !== filePath.toLowerCase())].slice(0, 12)
  state.recent = list
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)) } catch {}
}

export function samePath(a, b) {
  if (!a || !b) return false
  return String(a).replace(/\//g, '\\').toLowerCase() === String(b).replace(/\//g, '\\').toLowerCase()
}

export async function openPath(filePath, options = {}) {
  if (!filePath) return
  const existing = state.docs.find(doc => doc.path && samePath(doc.path, filePath))
  if (existing) {
    if (!existing.dirty && options.forceReload) {
      await reloadDoc(existing.id)
    } else {
      emit({ activeId: existing.id, review: null })
      if (existing.dirty) toast('该文件已打开且包含未保存修改；请先保存或关闭标签。', 'warn')
    }
    return existing
  }
  try {
    const result = await api('/read', { path: filePath })
    const doc = newDoc(result.name)
    Object.assign(doc, {
      path: result.path,
      name: result.name,
      content: result.content,
      savedContent: result.content,
      encoding: result.encoding,
      bom: result.bom,
      eol: result.eol,
      hash: result.hash,
      size: result.size,
      large: result.large === true,
      preview: !!previewKind({ name: result.name, path: result.path }),
      mtimeMs: result.mtimeMs,
      readOnly: result.readOnly,
      dirty: false,
    })
    rememberRecent(result.path)
    emit({ docs: [...state.docs, doc], activeId: doc.id, review: null })
    if (result.large) toast(t('largeFile'), 'warn', 6500)
    return doc
  } catch (error) {
    toast(error.message || t('binary'), 'error', 6000)
    return null
  }
}

export async function openPaths(paths) {
  if (!Array.isArray(paths)) return
  for (const item of paths) await openPath(item)
}

export async function pickOpen() {
  try {
    const result = await api('/pick-open', {})
    if (result.canceled) return
    await openPaths(result.paths)
  } catch (error) {
    toast(error.message || '打开文件失败', 'error')
  }
}

export async function saveDoc(id = state.activeId, { saveAs = false } = {}) {
  const doc = state.docs.find(item => item.id === id)
  if (!doc) return false
  if (doc.readOnly && !saveAs) {
    toast('该文件为只读，请使用另存为。', 'warn')
    return false
  }
  try {
    let targetPath = doc.path
    if (!targetPath || saveAs) {
      const picked = await api('/pick-save', { suggestedName: doc.name || 'untitled.txt' })
      if (picked.canceled || !picked.path) return false
      targetPath = picked.path
    }
    const result = await api('/write', {
      path: targetPath,
      content: doc.content,
      encoding: doc.encoding,
      bom: doc.bom,
      eol: doc.eol,
      baseHash: doc.hash,
      create: !doc.path || saveAs,
      overwrite: saveAs,
    })
    const updated = replaceDoc(id, {
      path: result.path,
      name: result.name,
      hash: result.hash,
      size: result.size,
      mtimeMs: result.mtimeMs,
      dirty: false,
      savedContent: doc.content,
      readOnly: false,
      conflict: false,
    })
    rememberRecent(result.path)
    if (updated) emit({ docs: updated.docs })
    toast(t('saved'), 'success', 1600)
    return true
  } catch (error) {
    if (error.code === 'conflict') {
      const updated = replaceDoc(id, { conflict: true, dirty: true })
      if (updated) emit({ docs: updated.docs })
      toast(t('conflict'), 'warn', 6000)
    } else {
      toast(error.message || '保存失败', 'error', 5000)
    }
    return false
  }
}

export async function reloadDoc(id, { force = false } = {}) {
  const doc = state.docs.find(item => item.id === id)
  if (!doc || !doc.path) return
  if (doc.dirty && !force && !window.confirm('重新加载会丢弃未保存的修改，继续吗？')) return
  try {
    const result = await api('/read', { path: doc.path })
    const updated = replaceDoc(id, {
      content: result.content,
      savedContent: result.content,
      cmState: null,
      dirty: false,
      encoding: result.encoding,
      bom: result.bom,
      eol: result.eol,
      hash: result.hash,
      size: result.size,
      large: result.large === true,
      mtimeMs: result.mtimeMs,
      readOnly: result.readOnly,
      conflict: false,
      name: result.name,
      path: result.path,
    })
    if (updated) emit({ docs: updated.docs })
    toast('已重新加载', 'success', 1500)
    if (result.large) toast(t('largeFile'), 'warn', 6500)
  } catch (error) {
    toast(error.message || '重新加载失败', 'error')
  }
}

export async function overwriteDoc(id) {
  const doc = state.docs.find(item => item.id === id)
  if (!doc || !doc.path) return
  try {
    const result = await api('/write', {
      path: doc.path,
      content: doc.content,
      encoding: doc.encoding,
      bom: doc.bom,
      eol: doc.eol,
      baseHash: null,
      create: false,
      overwrite: true,
    })
    const updated = replaceDoc(id, {
      hash: result.hash,
      size: result.size,
      mtimeMs: result.mtimeMs,
      dirty: false,
      savedContent: doc.content,
      conflict: false,
    })
    if (updated) emit({ docs: updated.docs })
    toast(t('saved'), 'success', 1500)
  } catch (error) {
    toast(error.message || '保存失败', 'error')
  }
}

export function setActiveSelection(selection) {
  if (!state.activeId) return
  setSelection(state.activeId, selection)
}

export function openAI() {
  state.ai.open = true
  emit({})
}

export function closeAI() {
  state.ai.open = false
  emit({})
}

export function setAIInstruction(value) {
  state.ai.instruction = value
  if (String(value || '').trim() !== '') state.ai.action = 'custom'
  emit({})
}

export function setAIAction(action) {
  state.ai.action = action
  if (action !== 'custom') state.ai.instruction = ''
  emit({})
}

export function setMenu(menu) {
  emit({ menu })
}

export function setContextMenu(menu) {
  emit({ contextMenu: menu })
}

export function setSettingsOpen(open) {
  emit({ settingsOpen: open })
}

export function setAboutOpen(open) {
  emit({ aboutOpen: open })
}

export function setAssociationOpen(open) {
  emit({ associationOpen: open })
}

export function setHostStatus(host) {
  emit({ host })
}

export function setModel(model) {
  emit({ model })
}

export function setFonts(fonts) {
  emit({ fonts })
}

export function setAssociation(association) {
  emit({ association })
}

export function setAssociationBusy(busy) {
  emit({ associationBusy: busy })
}

export function setBusy(busy) {
  emit({ busy })
}

export function setReview(review) {
  emit({ review, reviewOpen: true })
}

export function clearReview() {
  emit({ review: null, reviewOpen: false })
}

const MAX_HISTORY_ENTRIES = 40
const MAX_HISTORY_BYTES = 64 * 1024 * 1024

function pushHistory(change) {
  state.history.push(change)
  while (state.history.length > MAX_HISTORY_ENTRIES) state.history.shift()
  let bytes = state.history.reduce((total, item) => total
    + String(item.beforeContent || '').length
    + String(item.afterContent || '').length, 0)
  while (bytes > MAX_HISTORY_BYTES && state.history.length > 1) {
    const removed = state.history.shift()
    bytes -= String(removed.beforeContent || '').length + String(removed.afterContent || '').length
  }
}

export function openReview() {
  if (state.review) emit({ reviewOpen: true })
}

export function closeReview() {
  emit({ reviewOpen: false })
}

export function openHistory() {
  emit({ historyOpen: true, reviewOpen: false })
}

export function closeHistory() {
  emit({ historyOpen: false })
}

export function openHistoryReview(id) {
  const record = state.history.find(item => item.id === id)
  if (!record) return
  emit({ review: record, reviewOpen: true, historyOpen: false })
}

function normalizeSelectionOutput(selected, output) {
  let text = String(output || '')
  if (!/^\s{0,3}#{1,6}\s+/.test(selected)) text = text.replace(/^\s{0,3}#{1,6}\s+/, '')
  if (!/^\s{0,3}[-*+]\s+/.test(selected)) text = text.replace(/^\s{0,3}[-*+]\s+/, '')
  if (!/^\s{0,3}>\s+/.test(selected)) text = text.replace(/^\s{0,3}>\s+/, '')
  return text
}

export async function runAI(action, options = {}) {
  const doc = activeDoc()
  if (!doc) return
  const scope = options.scope === 'document' ? 'document' : 'selection'
  const selection = doc.selection || { from: 0, to: 0, text: '' }
  if (scope === 'selection' && (!selection.text || selection.from === selection.to)) {
    toast(t('noSelection'), 'warn')
    return
  }
  if (scope === 'selection' && selection.from < 0) {
    toast(t('previewSelectionUnmapped'), 'warn', 4200)
    return
  }
  const instruction = options.instruction !== undefined ? options.instruction : state.ai.instruction
  const effectiveAction = action === 'custom' || String(instruction || '').trim() !== '' ? 'custom' : action
  if (effectiveAction === 'custom' && !String(instruction || '').trim()) {
    toast('请填写自定义修改要求。', 'warn')
    return
  }
  if (state.ai.loading) return
  const controller = new AbortController()
  const request = {
    action: effectiveAction,
    instruction,
    scope,
    docId: doc.id,
    from: scope === 'document' ? 0 : selection.from,
    to: scope === 'document' ? doc.content.length : selection.to,
    before: scope === 'document' ? doc.content : selection.text,
    documentText: doc.content,
    selectedText: scope === 'document' ? doc.content : selection.text,
    beforeContext: scope === 'document' ? '' : doc.content.slice(0, selection.from),
    afterContext: scope === 'document' ? '' : doc.content.slice(selection.to),
  }
  state.ai.loading = true
  state.ai.error = null
  state.ai.controller = controller
  state.ai.request = request
  state.ai.instruction = ''
  if (state.ai.action === 'custom') state.ai.action = 'polish'
  emit({})
  try {
    const result = await api('/ai', {
      action: effectiveAction,
      instruction: request.instruction,
      scope,
      documentText: request.documentText,
      selectedText: request.selectedText,
      before: request.beforeContext,
      after: request.afterContext,
    }, { signal: controller.signal })
    const after = scope === 'selection'
      ? normalizeSelectionOutput(request.before, result.text)
      : result.text
    const change = {
      kind: 'single',
      autoApplied: true,
      id: 'h' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      at: Date.now(),
      docId: doc.id,
      from: request.from,
      to: request.to,
      before: request.before,
      after,
      beforeContent: request.documentText,
      afterContent: request.documentText.slice(0, request.from) + after + request.documentText.slice(request.to),
      action: effectiveAction,
      scope,
      request,
      baseContent: request.documentText,
      model: result.model,
      stats: lineDiff(request.before, after).stats,
    }
    if (!applySingleChange(change)) {
      state.ai.loading = false
      state.ai.controller = null
      emit({})
      return
    }
    state.ai.loading = false
    state.ai.controller = null
    state.ai.open = true
    pushHistory(change)
    state.review = change
    state.reviewOpen = false
    state.historyOpen = false
    emit({})
    toast(t('aiApplied'), 'success', 2800)
  } catch (error) {
    state.ai.loading = false
    state.ai.controller = null
    if (error.name === 'AbortError') {
      state.ai.error = null
      emit({})
      return
    }
    state.ai.error = error.message || t('aiError')
    toast(error.message || t('aiError'), 'error', 6000)
    emit({})
  }
}

export function cancelAI() {
  if (state.ai.controller) {
    state.ai.controller.abort()
    state.ai.controller = null
  }
  state.ai.loading = false
  emit({})
}

export function regenerate() {
  const request = state.ai.request
  if (!request) return
  state.review = null
  emit({})
  runAI(request.action, {
    scope: request.scope,
    instruction: request.instruction,
  })
}

function applySingleChange(change) {
  const doc = state.docs.find(item => item.id === change.docId)
  if (!doc) return false
  if (
    (change.baseContent !== undefined && doc.content !== change.baseContent) ||
    doc.content.slice(change.from, change.to) !== change.before
  ) {
    toast(t('selectionChanged'), 'warn', 5000)
    return false
  }
  if (state.editorBridge && state.editorBridge.docId === change.docId) {
    state.editorBridge.dispatchChange({ from: change.from, to: change.to, insert: change.after })
  } else {
    const content = change.afterContent !== undefined
      ? change.afterContent
      : doc.content.slice(0, change.from) + change.after + doc.content.slice(change.to)
    const updated = replaceDoc(change.docId, { content, cmState: null, dirty: content !== doc.savedContent })
    if (updated) emit({ docs: updated.docs })
  }
  return true
}

export function revertHistory(id) {
  const index = state.history.findIndex(item => item.id === id)
  const change = index >= 0 ? state.history[index] : null
  if (!change) return
  const doc = state.docs.find(item => item.id === change.docId)
  if (!doc) return
  const later = state.history.some((item, at) => at > index && item.docId === doc.id)
  const currentIsAfter = doc.content === change.afterContent
  if (!currentIsAfter && !window.confirm(t('historyConfirm'))) return
  const target = typeof change.beforeContent === 'string' ? change.beforeContent : null
  if (target === null) {
    toast(t('revertBlocked'), 'warn', 5000)
    return
  }
  if (state.editorBridge && state.editorBridge.docId === doc.id) {
    state.editorBridge.dispatchChange({ from: 0, to: doc.content.length, insert: target })
  } else {
    const updated = replaceDoc(doc.id, { content: target, cmState: null, dirty: target !== doc.savedContent })
    if (updated) emit({ docs: updated.docs })
  }
  state.history = state.history.filter((item, at) => !(item.docId === doc.id && at >= index))
  state.review = null
  state.reviewOpen = false
  state.historyOpen = false
  state.ai.open = true
  emit({})
  toast(later ? t('historyRolledBack') : t('reverted'), 'success', 2200)
}

export function revertLastChange() {
  const change = state.review
  if (!change) return
  if (change.id && state.history.some(item => item.id === change.id)) {
    revertHistory(change.id)
    return
  }
  if (change.kind !== 'single') return
  const doc = state.docs.find(item => item.id === change.docId)
  if (!doc) return
  const from = change.from
  const to = change.from + String(change.after || '').length
  if (doc.content.slice(from, to) !== change.after) {
    toast(t('revertBlocked'), 'warn', 5000)
    return
  }
  if (state.editorBridge && state.editorBridge.docId === change.docId) {
    state.editorBridge.dispatchChange({ from, to, insert: change.before })
  } else {
    const content = doc.content.slice(0, from) + change.before + doc.content.slice(to)
    const updated = replaceDoc(change.docId, { content, cmState: null, dirty: content !== doc.savedContent })
    if (updated) emit({ docs: updated.docs })
  }
  state.review = null
  state.reviewOpen = false
  state.ai.open = true
  emit({})
  toast(t('reverted'), 'success', 1800)
}

export function applyReplacement(docId, from, to, insert) {
  const doc = state.docs.find(item => item.id === docId)
  if (!doc) return false
  const review = state.review
  if (review?.kind === 'single' && (
    doc.content !== review.baseContent ||
    doc.content.slice(from, to) !== review.before
  )) {
    toast(t('selectionChanged'), 'warn', 5000)
    return false
  }
  if (state.editorBridge && state.editorBridge.docId === docId) {
    state.editorBridge.dispatchChange({ from, to, insert })
  } else {
    const content = doc.content.slice(0, from) + insert + doc.content.slice(to)
    const updated = replaceDoc(docId, { content, cmState: null, dirty: content !== doc.savedContent })
    if (updated) emit({ docs: updated.docs })
  }
  emit({ review: null })
  return true
}

export function acceptReview() {
  const review = state.review
  if (review?.kind === 'single') {
    applyReplacement(review.docId, review.from, review.to, review.after)
  }
}

export function registerEditorBridge(bridge) {
  state.editorBridge = bridge
}

export function setInboxRev(rev) {
  state.inboxRev = rev
  try { localStorage.setItem(REV_KEY, String(rev)) } catch {}
}

export function setPreviewHtml(html) {
  state.previewHtml = html
  emit({})
}

export function wordCount(text) {
  const cjk = (text.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length
  const latin = (text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) || []).length
  return cjk + latin
}

export function openSettings() {
  emit({ settingsOpen: true, menu: null, contextMenu: null })
}

export function openAssociations() {
  emit({ associationOpen: true, menu: null, contextMenu: null })
}

export function openAbout() {
  emit({ aboutOpen: true, menu: null, contextMenu: null })
}

export async function copySelection() {
  const doc = activeDoc()
  const text = doc?.selection?.text
  if (!text) {
    toast(t('toastNothing'), 'warn', 1500)
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    toast(t('toastCopied'), 'success', 1400)
  } catch {
    toast('无法访问剪贴板', 'error')
  }
}

export function bindEditorBridge(bridge) {
  state.editorBridge = bridge
}

export function clearEditorBridge() {
  state.editorBridge = null
}

export async function api(suffix, body, options = {}) {
  const response = await fetch('/api/ai-notepad' + suffix, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: options.signal,
  })
  let data = null
  try { data = await response.json() } catch {}
  if (!response.ok || !data || data.ok === false) {
    const error = new Error((data && data.error && data.error.message) || ('HTTP ' + response.status))
    error.code = data && data.error && data.error.code
    error.status = response.status
    throw error
  }
  return data
}

export async function refreshAssociation(extensions) {
  try {
    const result = await api('/associations', {
      action: 'status',
      extensions: extensions ? parseExtensions(extensions) : undefined,
    })
    setAssociation(result)
    return result
  } catch (error) {
    toast(error.message, 'error')
    return null
  }
}

export function parseExtensions(text) {
  if (Array.isArray(text)) return text
  const values = String(text || '')
    .split(/[\s,;，；]+/)
    .map(item => item.trim().replace(/^\*?\./, '').toLowerCase())
    .filter(Boolean)
  return values
}

export async function installAssociations(extensions) {
  setAssociationBusy(true)
  try {
    const result = await api('/associations', { action: 'install', extensions })
    setAssociation(result)
    toast('文件关联已注册到当前 Windows 用户。', 'success', 4000)
    return result
  } catch (error) {
    toast(error.message, 'error', 6000)
    return null
  } finally {
    setAssociationBusy(false)
  }
}

export async function removeAssociations() {
  setAssociationBusy(true)
  try {
    const result = await api('/associations', { action: 'uninstall' })
    setAssociation(null)
    toast(result.note || '已移除文件关联。', 'info', 8000)
    return result
  } catch (error) {
    toast(error.message, 'error', 6000)
    return null
  } finally {
    setAssociationBusy(false)
  }
}

export async function restoreAssociations() {
  setAssociationBusy(true)
  try {
    const result = await api('/associations', { action: 'restore' })
    setAssociation(null)
    toast(result.note || '已移除文件关联。', 'info', 8000)
    return result
  } catch (error) {
    toast(error.message, 'error', 6000)
    return null
  } finally {
    setAssociationBusy(false)
  }
}

export async function openDefaultApps() {
  try {
    await api('/associations', { action: 'default-apps' })
  } catch (error) {
    toast(error.message, 'error')
  }
}

let inboxTimer = null
export function startInboxPolling(getLayout) {
  if (inboxTimer) return
  let stopped = false
  const poll = async () => {
    if (stopped || state.inboxBusy) return
    state.inboxBusy = true
    try {
      const result = await api('/inbox?since=' + encodeURIComponent(state.inboxRev))
      if (Array.isArray(result.files) && result.files.length > 0) {
        const cursor = Number.isFinite(Number(result.cursor)) ? Number(result.cursor) : Date.now()
        const paths = result.files.map(item => item.path).filter(Boolean)
        if (paths.length > 0) {
          await openPaths(paths)
          const layout = typeof getLayout === 'function' ? getLayout() : getLayout
          if (layout && typeof layout.selectPanel === 'function') {
            try { layout.selectPanel('ai-notepad') } catch {}
          }
        }
        setInboxRev(cursor)
      } else if (Number.isFinite(Number(result.cursor)) && Number(result.cursor) > 0) {
        setInboxRev(Number(result.cursor))
      }
    } catch {
      // The Host may still be starting; the next tick retries.
    } finally {
      state.inboxBusy = false
    }
  }
  poll()
  inboxTimer = setInterval(poll, 1600)
  return () => {
    stopped = true
    if (inboxTimer) clearInterval(inboxTimer)
    inboxTimer = null
  }
}

export async function loadHostStatus() {
  try {
    const result = await api('/status')
    setHostStatus(result)
    setAssociation(result.associations)
    setModel(result.model)
    return result
  } catch {
    return null
  }
}

export async function loadFonts(force = false) {
  if (state.fonts && state.fonts.length > 0 && !force) return state.fonts
  try {
    const result = await api('/fonts', {})
    setFonts(result.fonts || [])
    return result.fonts || []
  } catch {
    setFonts([])
    return []
  }
}
