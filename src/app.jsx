import React from 'react'
import {
  activateDoc,
  activeDoc,
  addAnnotation,
  api,
  cancelAI,
  closeDoc,
  copySelection,
  ensureInitialDoc,
  loadFonts,
  loadHostStatus,
  newFile,
  openAssociations,
  openAbout,
  openDefaultApps,
  openPath,
  openSettings,
  openAI,
  closeAI,
  setAboutOpen,
  parseExtensions,
  pickOpen,
  persistSettings,
  reloadDoc,
  removeAnnotation,
  removeAssociations,
  resetSettings,
  restoreAssociations,
  runAI,
  runBatch,
  saveDoc,
  setAssociationOpen,
  setSettingsOpen,
  setMenu,
  setContextMenu,
  setAIAction,
  setAIInstruction,
  setPreview,
  setPreviewSelection,
  previewKind,
  t,
  toast,
  useNotepad,
  getState,
  wordCount,
  installAssociations,
  overwriteDoc,
  clearReview,
  acceptReview,
  regenerate,
  openReview,
  closeReview,
  revertLastChange,
} from './store.js'
import { NotepadEditor } from './editor.jsx'
import { lineDiff, compactDiff } from './diff.js'
import { renderMarkdown } from './markdown.js'
import {
  NotepadIcon,
  NewIcon,
  OpenIcon,
  SaveIcon,
  SettingsIcon,
  CloseIcon,
  SparkIcon,
  DiffIcon,
  LinkIcon,
  ExternalIcon,
  EyeIcon,
  EditIcon,
  CopyIcon,
  CheckIcon,
  ReloadIcon,
  WarnIcon,
  TrashIcon,
  ChevronDownIcon,
  SearchIcon,
  InfoIcon,
} from './icons.jsx'
import { PLUGIN_VERSION, PLUGIN_BUILD_TIME } from './version.js'

const h = React.createElement

const RECOMMENDED_FONTS = [
  'Microsoft YaHei UI',
  'Microsoft YaHei',
  'DengXian',
  'SimSun',
  'KaiTi',
  'FangSong',
  'Noto Sans SC',
  'Source Han Sans CN',
  'Segoe UI',
  'Consolas',
  'Cascadia Code',
  'Cascadia Mono',
]

export function cssFontStack(name) {
  const clean = String(name == null ? '' : name).replace(/["'\\]/g, '').trim() || 'Microsoft YaHei UI'
  return `"${clean}", "Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", sans-serif`
}

function fileNameOf(filePath) {
  const value = String(filePath || '').replace(/[\\/]+$/, '')
  const at = Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\'))
  return at === -1 ? value : value.slice(at + 1)
}

function useCloseOnOutside(ref, onClose, active) {
  React.useEffect(() => {
    if (!active) return
    const handler = event => {
      if (ref.current && !ref.current.contains(event.target)) onClose()
    }
    document.addEventListener('mousedown', handler, true)
    return () => document.removeEventListener('mousedown', handler, true)
  }, [active, onClose, ref])
}

function IconButton({ title, onClick, children, active = false, disabled = false, className = '' }) {
  return h('button', {
    type: 'button',
    className: 'np-btn np-icon ' + className + (active ? ' np-active' : ''),
    title,
    onClick,
    disabled,
    'aria-label': title,
  }, children)
}

function Menu({ items }) {
  return h('div', { className: 'np-menu', role: 'menu' },
    items.map((item, index) => {
      if (item === 'separator') return h('div', { className: 'np-menu-sep', key: 's' + index })
      return h('button', {
        type: 'button',
        className: 'np-menu-item',
        key: item.label + index,
        onClick: () => { item.onSelect?.(); setMenu(null) },
        disabled: item.disabled,
      },
        item.icon || null,
        h('span', null, item.label),
        item.shortcut ? h('span', { className: 'np-kbd' }, item.shortcut) : null,
      )
    }))
}

function FileMenuButton() {
  const state = useNotepad()
  const ref = React.useRef(null)
  useCloseOnOutside(ref, () => setMenu(null), state.menu === 'file')
  const doc = activeDoc()
  return h('div', { className: 'np-menu-wrap', ref },
    h('button', {
      type: 'button',
      className: 'np-btn' + (state.menu === 'file' ? ' np-active' : ''),
      onClick: () => setMenu(state.menu === 'file' ? null : 'file'),
    }, t('fileMenu')),
    state.menu === 'file' ? h(Menu, {
      items: [
        { label: t('newFile'), icon: h(NewIcon, { size: 14 }), shortcut: 'Ctrl+N', onSelect: () => newFile() },
        { label: t('open'), icon: h(OpenIcon, { size: 14 }), shortcut: 'Ctrl+O', onSelect: () => pickOpen() },
        { label: t('save'), icon: h(SaveIcon, { size: 14 }), shortcut: 'Ctrl+S', onSelect: () => saveDoc() },
        { label: t('saveAs'), shortcut: 'Ctrl+Shift+S', onSelect: () => saveDoc(state.activeId, { saveAs: true }) },
        ...(doc?.path ? [
          'separator',
          { label: t('openWith'), icon: h(ExternalIcon, { size: 14 }), onSelect: () => api('/reveal', { path: doc.path }).catch(error => toast(error.message, 'error')) },
          { label: t('closeTab'), shortcut: 'Ctrl+W', onSelect: () => closeDoc(doc.id) },
        ] : []),
        ...(state.recent.length ? [
          'separator',
          ...state.recent.slice(0, 6).map(item => ({
            label: fileNameOf(item) + '  ·  ' + item,
            onSelect: () => openPath(item),
          })),
        ] : []),
      ],
    }) : null)
}

function ViewMenuButton() {
  const state = useNotepad()
  const ref = React.useRef(null)
  useCloseOnOutside(ref, () => setMenu(null), state.menu === 'view')
  const doc = activeDoc()
  return h('div', { className: 'np-menu-wrap', ref },
    h('button', {
      type: 'button',
      className: 'np-btn' + (state.menu === 'view' ? ' np-active' : ''),
      onClick: () => setMenu(state.menu === 'view' ? null : 'view'),
    }, t('viewMenu')),
    state.menu === 'view' ? h(Menu, {
      items: [
        { label: t('settings'), icon: h(SettingsIcon, { size: 14 }), onSelect: openSettings },
        { label: t('associations'), icon: h(LinkIcon, { size: 14 }), onSelect: openAssociations },
        ...(previewKind(doc) ? ['separator', {
          label: doc.preview ? t('edit') : (previewKind(doc) === 'html' ? t('htmlPreviewMode') : t('preview')),
          icon: doc.preview ? h(EditIcon, { size: 14 }) : h(EyeIcon, { size: 14 }),
          shortcut: 'Ctrl+E',
          onSelect: () => setPreview(doc.id, !doc.preview),
        }] : []),
        'separator',
        { label: t('find'), shortcut: 'Ctrl+F', onSelect: () => { getState().editorBridge?.openSearch?.() } },
      ],
    }) : null)
}

function Topbar() {
  const state = useNotepad()
  const doc = activeDoc()
  return h('div', { className: 'np-topbar' },
    h('div', { className: 'np-brand' },
      h('span', { className: 'np-brand-mark' }, h(NotepadIcon, { size: 21 })),
      h('div', { className: 'np-brand-text' },
        h('span', null, 'AI Notepad'),
        h('small', null, 'DeepSeek Harness'),
      ),
    ),
    h('div', { className: 'np-menu-cluster' },
      h(FileMenuButton),
      h(ViewMenuButton),
      h('button', {
        type: 'button',
        className: 'np-btn np-about-tab',
        onClick: openAbout,
        title: t('aboutTitle'),
      }, h(InfoIcon, { size: 13 }), h('span', null, t('about'))),
    ),
    h('div', { className: 'np-top-actions' },
      h(IconButton, { title: t('newFile'), onClick: () => newFile() }, h(NewIcon)),
      h(IconButton, { title: t('open'), onClick: () => pickOpen() }, h(OpenIcon)),
      h('span', { className: 'np-top-divider' }),
      h('button', {
        type: 'button',
        className: 'np-btn np-primary np-save',
        onClick: () => saveDoc(),
        disabled: !doc,
        title: t('save') + ' (Ctrl+S)',
      }, h(SaveIcon, { size: 15 }), h('span', null, t('save'))),
      h('button', {
        type: 'button',
        className: 'np-btn np-ai-toggle' + (state.ai.open ? ' np-active' : ''),
        onClick: () => { state.ai.open ? closeAI() : openAI() },
        title: 'AI',
      }, h(SparkIcon, { size: 14 }), h('span', { className: 'np-label' }, 'AI')),
      h(IconButton, { title: t('settings'), onClick: openSettings }, h(SettingsIcon)),
    ),
  )
}

function Tabs() {
  const state = useNotepad()
  return h('div', { className: 'np-tabs', role: 'tablist' },
    state.docs.map(doc => h('div', {
      key: doc.id,
      className: 'np-tab' + (doc.id === state.activeId ? ' active' : ''),
      role: 'tab',
      'aria-selected': doc.id === state.activeId,
      onClick: () => activateDoc(doc.id),
      title: doc.path || doc.name,
    },
      doc.dirty ? h('span', { className: 'np-tab-dot', title: t('dirty') }) : null,
      h('span', { className: 'np-tab-name' }, doc.name),
      h('button', {
        type: 'button',
        className: 'np-tab-close',
        title: t('closeTab'),
        onClick: event => { event.stopPropagation(); closeDoc(doc.id) },
      }, h(CloseIcon, { size: 13 })),
    )),
    h('button', { type: 'button', className: 'np-tab-add', title: t('newFile'), onClick: () => newFile() }, '+'),
  )
}

function StatusBar({ doc }) {
  const state = useNotepad()
  if (!doc) return h('div', { className: 'np-statusbar' }, h('span', null, t('noFile')))
  const chars = doc.content.length
  const words = wordCount(doc.content)
  const model = state.model ? `${state.model.provider}/${state.model.model}` : '—'
  return h('div', { className: 'np-statusbar' },
    h('span', { className: 'np-status-item np-status-path', title: doc.path || doc.name }, doc.path || doc.name),
    h('span', { className: 'np-status-item' }, doc.dirty
      ? h('span', { className: 'np-badge dirty' }, t('dirty'))
      : doc.path
        ? h('span', { className: 'np-badge saved' }, t('saved'))
        : h('span', { className: 'np-badge' }, t('untitled'))),
    doc.readOnly ? h('span', { className: 'np-badge ro' }, t('readOnly')) : null,
    h('span', { className: 'np-grow' }),
    h('span', { className: 'np-status-item' }, h('b', null, t('line')), ' ', doc.cursor?.line || 1, '  ', h('b', null, t('column')), ' ', doc.cursor?.column || 1),
    h('span', { className: 'np-status-item' }, chars.toLocaleString(), ' ', t('chars'), ' · ', words.toLocaleString(), ' ', t('words')),
    h('span', { className: 'np-status-item' }, h('b', null, t('encoding')), ' ', doc.encoding.toUpperCase(), ' · ', doc.eol === '\r\n' ? 'CRLF' : 'LF'),
    h('span', { className: 'np-status-item np-zoom-stat', title: 'Ctrl + 滚轮缩放' }, 'Aa ', state.settings.fontSize, 'px'),
    h('span', { className: 'np-status-item', title: model }, h('b', null, t('model')), ' ', model),
  )
}

function EmptyState() {
  const state = useNotepad()
  return h('div', { className: 'np-empty' },
    h('div', { className: 'np-emptybox' },
      h('div', { className: 'np-mark' }, h(NotepadIcon, { size: 44 })),
      h('h2', null, t('emptyTitle')),
      h('p', null, t('emptyHint')),
      h('div', { className: 'np-empty-actions' },
        h('button', { type: 'button', className: 'np-btn np-primary', onClick: () => pickOpen() }, h(OpenIcon), t('openFile')),
        h('button', { type: 'button', className: 'np-btn np-outline', onClick: () => newFile() }, h(NewIcon), t('createFile')),
      ),
      h('div', { className: 'np-features' },
        h('span', null, h(SparkIcon, { size: 13 }), t('featureSelection')),
        h('span', null, h(ReloadIcon, { size: 13 }), t('featureEncoding')),
        h('span', null, h(LinkIcon, { size: 13 }), t('featureAssoc')),
      ),
      state.recent.length ? h('div', { className: 'np-recent' },
        h('div', { className: 'np-recent-title' }, t('recent')),
        state.recent.slice(0, 8).map(item => h('button', {
          type: 'button',
          key: item,
          className: 'np-recent-item',
          title: item,
          onClick: () => openPath(item),
        }, fileNameOf(item) + '  ·  ' + item)),
      ) : null,
    ),
  )
}

function FloatingBar({ doc }) {
  const selection = doc.selection
  if (!selection || !selection.text || !selection.coords || !doc) return null
  const run = action => event => {
    event.preventDefault()
    event.stopPropagation()
    runAI(action, { instruction: '' })
  }
  return h('div', {
    className: 'np-floatbar',
    style: { left: selection.coords.left + 'px', top: selection.coords.top + 'px' },
    onMouseDown: event => event.preventDefault(),
  },
    h('button', { type: 'button', className: 'np-btn np-sm', onClick: run('concise') }, t('concise')),
    h('button', { type: 'button', className: 'np-btn np-sm', onClick: run('polish') }, t('polish')),
    h('button', { type: 'button', className: 'np-btn np-sm', onClick: run('expand') }, t('expand')),
    h('button', { type: 'button', className: 'np-btn np-sm', onClick: run('proofread') }, t('proofread')),
    h('button', { type: 'button', className: 'np-btn np-sm np-primary', onClick: event => { event.preventDefault(); openAI(); setAIAction('custom') } }, h(SparkIcon, { size: 13 }), 'AI'),
  )
}

const QUICK_ACTIONS = [
  ['concise', 'concise'],
  ['polish', 'polish'],
  ['expand', 'expand'],
  ['restructure', 'restructure'],
  ['proofread', 'proofread'],
  ['custom', 'custom'],
]

function AIPanel({ doc }) {
  const state = useNotepad()
  if (!state.ai.open || !doc) return null
  if (state.reviewOpen && state.review && state.review.docId === doc.id) {
    return h('aside', { className: 'np-ai np-ai-review', 'aria-label': t('reviewDock') }, h(ReviewPanel, { review: state.review }))
  }
  const selection = doc.selection
  const hasSelection = !!(selection && selection.text)
  const mappable = hasSelection && selection.from >= 0
  const run = (action, scope) => runAI(action, {
    scope,
    instruction: action === 'custom' ? state.ai.instruction : '',
  })
  const fullActions = [
    ['polish', t('polish')],
    ['concise', t('concise')],
    ['summarize', t('summarize')],
    ['outline', t('outline')],
    ['titles', t('titles')],
  ]
  return h('aside', { className: 'np-ai', 'aria-label': t('aiEdit') },
    h('div', { className: 'np-ai-head' },
      h('div', { className: 'np-ai-title' }, h(SparkIcon, { size: 16 }), t('aiEdit')),
      h(IconButton, { title: t('close'), onClick: () => closeAI() }, h(CloseIcon, { size: 14 })),
    ),
    h('div', { className: 'np-ai-body' },
      state.review && state.review.docId === doc.id ? h('div', { className: 'np-changebar' },
        h('span', { className: 'np-changebar-label' }, h(DiffIcon, { size: 14 }), t('appliedChange')),
        h('button', { type: 'button', className: 'np-btn np-sm np-outline', onClick: () => openReview() }, t('reviewChange')),
        h('button', { type: 'button', className: 'np-btn np-sm np-danger', onClick: () => revertLastChange() }, t('revertChange')),
      ) : null,
      h('div', { className: 'np-ai-section' },
        h('div', { className: 'np-row' },
          h('p', { className: 'np-ai-label', style: { flex: 1, margin: 0 } }, t('selection')),
          selection?.source === 'preview' ? h('span', { className: 'np-badge' }, t('previewSelection')) : null,
        ),
        h('div', { className: 'np-selbox' + (hasSelection ? '' : ' empty') + (selection?.unmapped ? ' unmapped' : '') },
          hasSelection ? selection.text : t('noSelection')),
        selection?.unmapped ? h('p', { className: 'np-hint np-warn' }, t('previewSelectionUnmapped')) : null,
      ),
      h('div', { className: 'np-ai-section' },
        h('p', { className: 'np-ai-label' }, t('custom')),
        h('div', { className: 'np-actions' }, QUICK_ACTIONS.map(([key, label]) => h('button', {
          type: 'button',
          key,
          className: 'np-action' + (state.ai.action === key ? ' active' : ''),
          onClick: () => setAIAction(key),
        }, t(label)))),
        h('div', { style: { height: 7 } }),
        h('textarea', {
          className: 'np-textarea',
          value: state.ai.instruction,
          placeholder: t('customPlaceholder'),
          onChange: event => setAIInstruction(event.target.value),
          onKeyDown: event => {
            if (event.key !== 'Enter' || event.shiftKey || event.altKey) return
            if (event.nativeEvent?.isComposing) return
            event.preventDefault()
            if (!state.ai.loading) runAI(state.ai.action, { scope: 'selection' })
          },
        }),
        state.ai.instruction.trim() ? h('p', { className: 'np-hint' }, t('customModeHint')) : null,
        h('div', { className: 'np-row', style: { marginTop: 7 } },
          h('button', {
            type: 'button',
            className: 'np-btn np-primary',
            style: { flex: 1 },
            disabled: !mappable || state.ai.loading,
            onClick: () => run(state.ai.action, 'selection'),
          }, state.ai.loading ? h('span', { className: 'np-spin' }) : h(SparkIcon, { size: 14 }), t('run')),
          h('button', {
            type: 'button',
            className: 'np-btn np-outline',
            disabled: !mappable || state.ai.loading,
            onClick: () => addAnnotation(),
            title: 'Ctrl+Alt+B',
          }, t('addAnnotation')),
        ),
        state.ai.error ? h('div', { className: 'np-error' }, state.ai.error) : null,
      ),
      h('div', { className: 'np-ai-section' },
        h('div', { className: 'np-row' },
          h('p', { className: 'np-ai-label', style: { flex: 1, margin: 0 } }, t('fullDocument')),
          h('span', { className: 'np-badge' }, t('fullOnly')),
        ),
        h('div', { className: 'np-actions', style: { marginTop: 6 } }, fullActions.map(([key, label]) => h('button', {
          type: 'button',
          key: 'full-' + key,
          className: 'np-action',
          disabled: state.ai.loading,
          onClick: () => run(key, 'document'),
        }, label))),
      ),
      h('div', { className: 'np-ai-section' },
        h('div', { className: 'np-row' },
          h('p', { className: 'np-ai-label', style: { flex: 1, margin: 0 } }, t('annotations')),
          h('span', { className: 'np-badge' }, doc.annotations.length),
        ),
        doc.annotations.length === 0
          ? h('p', { className: 'np-hint' }, t('noAnnotations'))
          : h('div', { style: { marginTop: 6 } }, doc.annotations.map(annotation => h('div', { className: 'np-ann', key: annotation.id },
            h('div', { className: 'np-ann-top' },
              h('span', { className: 'np-badge' }, annotation.quote.length + ' ' + t('chars')),
              h(IconButton, { title: t('close'), onClick: () => removeAnnotation(annotation.id) }, h(TrashIcon, { size: 13 })),
            ),
            h('div', { className: 'np-ann-quote' }, annotation.quote),
            h('div', { className: 'np-ann-note' }, annotation.instruction),
          ))),
        h('div', { className: 'np-row', style: { marginTop: 8 } },
          h('button', {
            type: 'button',
            className: 'np-btn np-primary',
            style: { flex: 1 },
            disabled: doc.annotations.length === 0 || state.ai.loading,
            onClick: () => runBatch(),
          }, t('batchRun')),
        ),
      ),
    ),
    state.ai.loading ? h('div', { className: 'np-ai-footer' },
      h('span', { className: 'np-spin' }),
      h('span', { style: { flex: 1 } }, t('loading')),
      h('button', { type: 'button', className: 'np-btn np-sm', onClick: cancelAI }, t('cancel')),
    ) : null,
  )
}

async function imageBlobToPng(blob) {
  const url = URL.createObjectURL(blob)
  try {
    const image = await new Promise((resolve, reject) => {
      const node = new Image()
      node.onload = () => resolve(node)
      node.onerror = () => reject(new Error('image decode failed'))
      node.src = url
    })
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth || image.width
    canvas.height = image.naturalHeight || image.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('canvas unavailable')
    context.drawImage(image, 0, 0)
    return await new Promise((resolve, reject) => {
      canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG conversion failed')), 'image/png')
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

function HtmlPreview({ doc, onDoubleClick }) {
  const frameRef = React.useRef(null)
  const [srcDoc, setSrcDoc] = React.useState('')
  const [frameSrc, setFrameSrc] = React.useState('')
  const [error, setError] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [imageMenu, setImageMenu] = React.useState(null)
  React.useEffect(() => {
    const controller = new AbortController()
    const useDisk = !doc.dirty && !!doc.path
    if (useDisk) {
      setError(null)
      setLoading(false)
      setSrcDoc('')
      setFrameSrc('/api/ai-notepad/asset?path=' + encodeURIComponent(doc.path) + '&v=' + encodeURIComponent(doc.hash || ''))
      return () => controller.abort()
    }
    setFrameSrc('')
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const result = await api('/preview-html', { html: doc.content, basePath: doc.path || '' }, { signal: controller.signal })
        setSrcDoc(result.html || '')
        setError(null)
      } catch (failure) {
        if (failure.name !== 'AbortError') setError(failure.message || 'HTML 预览加载失败')
      } finally {
        setLoading(false)
      }
    }, 120)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [doc.content, doc.path, doc.dirty, doc.hash])
  React.useEffect(() => {
    if (!imageMenu) return
    const close = event => {
      if (event.target?.closest?.('.np-image-menu')) return
      setImageMenu(null)
    }
    const key = event => { if (event.key === 'Escape') setImageMenu(null) }
    document.addEventListener('mousedown', close, true)
    window.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', close, true)
      window.removeEventListener('keydown', key)
    }
  }, [imageMenu])
  const capture = () => {
    try {
      const selection = frameRef.current?.contentWindow?.getSelection()
      if (selection && !selection.isCollapsed) setPreviewSelection(selection.toString())
    } catch {}
  }
  const copyImage = async src => {
    setImageMenu(null)
    try {
      const response = await fetch(src, { credentials: 'same-origin' })
      if (!response.ok) throw new Error('HTTP ' + response.status)
      let blob = await response.blob()
      if (blob.type !== 'image/png') blob = await imageBlobToPng(blob)
      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
        throw new Error('clipboard image API unavailable')
      }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      toast(t('imageCopied'), 'success', 1800)
    } catch (failure) {
      toast(t('imageCopyFailed') + ': ' + (failure.message || ''), 'error', 4200)
    }
  }
  const openImageMenu = event => {
    const image = event.target?.closest?.('img')
    if (!image) return
    event.preventDefault()
    const rect = frameRef.current?.getBoundingClientRect()
    const width = 190
    const height = 42
    setImageMenu({
      x: Math.max(8, Math.min((rect?.left || 0) + event.clientX, window.innerWidth - width - 8)),
      y: Math.max(8, Math.min((rect?.top || 0) + event.clientY, window.innerHeight - height - 8)),
      src: image.currentSrc || image.src,
    })
  }
  const onLoad = () => {
    try {
      const target = frameRef.current?.contentDocument
      if (!target) return
      target.addEventListener('mouseup', capture)
      target.addEventListener('keyup', capture)
      target.addEventListener('dblclick', onDoubleClick)
      target.addEventListener('contextmenu', openImageMenu)
      target.addEventListener('scroll', () => setImageMenu(null), true)
    } catch {}
  }
  return h('div', { className: 'np-html-preview' },
    error ? h('div', { className: 'np-preview-error' }, h(WarnIcon, { size: 16 }), h('span', null, error)) : null,
    loading ? h('div', { className: 'np-preview-loading' }, h('span', { className: 'np-spin' }), 'HTML 预览加载中…') : null,
    h('iframe', {
      ref: frameRef,
      className: 'np-html-frame',
      title: 'HTML preview',
      sandbox: 'allow-same-origin',
      src: frameSrc || undefined,
      srcDoc: frameSrc ? undefined : srcDoc,
      onLoad,
    }),
    imageMenu ? h('div', {
      className: 'np-image-menu',
      style: { left: imageMenu.x + 'px', top: imageMenu.y + 'px' },
      onMouseDown: event => event.stopPropagation(),
    }, h('button', {
      type: 'button',
      className: 'np-image-menu-item',
      onClick: () => copyImage(imageMenu.src),
    }, h(CopyIcon, { size: 14 }), t('copyImage'))) : null,
  )
}

export function EditorPane() {
  const state = useNotepad()
  const doc = activeDoc()
  React.useEffect(() => { ensureInitialDoc() }, [])
  React.useEffect(() => {
    loadHostStatus().then(result => {
      if (result) loadFonts()
    })
  }, [])
  React.useEffect(() => {
    const handler = event => {
      if (event.defaultPrevented) return
      const mod = event.ctrlKey || event.metaKey
      if (mod && event.key.toLowerCase() === 'n') { event.preventDefault(); newFile() }
      if (mod && event.key.toLowerCase() === 'o') { event.preventDefault(); pickOpen() }
      if (mod && event.key.toLowerCase() === 's') { event.preventDefault(); saveDoc() }
      if (mod && !event.shiftKey && event.key.toLowerCase() === 'e') {
        const current = activeDoc()
        if (current && previewKind(current)) {
          event.preventDefault()
          setPreview(current.id, !current.preview)
        }
      }
      if (mod && !event.shiftKey && event.key.toLowerCase() === '0') {
        event.preventDefault()
        persistSettings({ fontSize: 15 })
        toast(t('zoom') + ' 15px', 'info', 900)
      }
      if (mod && !event.shiftKey && (event.key === '=' || event.key === '+')) {
        event.preventDefault()
        const next = Math.min(48, Number(activeDoc() ? getState().settings.fontSize : 15) + 1)
        persistSettings({ fontSize: next })
        toast(t('zoom') + ' ' + next + 'px', 'info', 900)
      }
      if (mod && !event.shiftKey && (event.key === '-' || event.key === '_')) {
        event.preventDefault()
        const next = Math.max(8, getState().settings.fontSize - 1)
        persistSettings({ fontSize: next })
        toast(t('zoom') + ' ' + next + 'px', 'info', 900)
      }
      if (event.key === 'Escape') { setContextMenu(null); setMenu(null) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  React.useEffect(() => {
    if (!doc) return
    const handler = event => {
      if (doc.dirty) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [doc?.dirty])

  if (!doc) {
    return h('div', { className: 'np-main' }, h(EmptyState))
  }

  const kind = previewKind(doc)
  const preview = !!kind && doc.preview
  const leavePreview = () => {
    setPreview(doc.id, false)
    setTimeout(() => {
      const bridge = getState().editorBridge
      if (bridge && bridge.view) bridge.view.focus()
    }, 40)
  }
  return h('div', { className: 'np-main' },
    h('div', { className: 'np-editor-col' },
      doc.conflict ? h('div', { className: 'np-conflict' },
        h(WarnIcon, { size: 15 }),
        h('span', null, t('conflict')),
        h('span', { className: 'np-grow' }),
        h('button', { type: 'button', className: 'np-btn np-sm', onClick: () => reloadDoc(doc.id, { force: true }) }, t('reload')),
        h('button', { type: 'button', className: 'np-btn np-sm', onClick: () => saveDoc(doc.id, { saveAs: true }) }, t('saveAs')),
        h('button', { type: 'button', className: 'np-btn np-sm', onClick: () => overwriteDoc(doc.id) }, t('overwrite')),
      ) : null,
      h('div', { className: 'np-editor-wrap' },
        preview
          ? h('div', { className: 'np-preview-shell' + (kind === 'html' ? ' np-preview-shell-html' : '') },
            h('div', { className: 'np-previewbar' },
              h('span', { className: 'np-preview-pill' }, h(EyeIcon, { size: 13 }), kind === 'html' ? t('htmlPreviewMode') : t('previewMode')),
              h('button', { type: 'button', className: 'np-btn np-sm np-preview-edit', onClick: leavePreview, title: t('togglePreview') + ' (Ctrl+E)' }, h(EditIcon, { size: 13 }), t('edit'), h('span', { className: 'np-kbd' }, 'Ctrl+E')),
            ),
            kind === 'html'
              ? h(HtmlPreview, { doc, onDoubleClick: leavePreview })
              : h('div', {
                className: 'np-preview',
                onDoubleClick: leavePreview,
                onMouseUp: event => {
                  const selection = window.getSelection()
                  if (!selection || selection.isCollapsed) return
                  if (!event.currentTarget.contains(selection.anchorNode)) return
                  setPreviewSelection(selection.toString())
                },
                title: t('previewHint'),
                dangerouslySetInnerHTML: { __html: renderMarkdown(doc.content) },
              }),
            h('div', { className: 'np-preview-hint' }, t('previewHint')),
          )
          : h(NotepadEditor, { doc }),
        h(FloatingBar, { doc }),
      ),
    ),
    h(AIPanel, { doc }),
  )
}

class NotepadBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    api('/client-report', {
      mounted: false,
      error: String(error?.stack || error || 'render error').slice(0, 6000),
      componentStack: String(info?.componentStack || '').slice(0, 6000),
    }).catch(() => {})
  }

  render() {
    if (this.state.error) {
      return h('div', { className: 'np-root', 'data-theme': 'light' },
        h('div', { className: 'np-fatal' },
          h(WarnIcon, { size: 22 }),
          h('h2', null, 'AI Notepad 渲染失败'),
          h('p', null, '插件已捕获错误，Harness 的其它界面不受影响。请刷新页面；如果问题持续，请查看 client-report.json。'),
          h('pre', null, String(this.state.error?.stack || this.state.error)),
          h('button', { type: 'button', className: 'np-btn np-primary', onClick: () => window.location.reload() }, '刷新页面'),
        ),
      )
    }
    return this.props.children
  }
}

// Root wrapper handles drag/drop over the entire editor area without disturbing
// CodeMirror's own contentDOM handlers.
function NotepadAppInner() {
  const state = useNotepad()
  const doc = activeDoc()
  const rootRef = React.useRef(null)
  const sizeRef = React.useRef(state.settings.fontSize)
  sizeRef.current = state.settings.fontSize
  React.useEffect(() => {
    ensureInitialDoc()
    loadHostStatus().then(() => loadFonts())
    const current = activeDoc()
    api('/client-report', {
      mounted: true,
      docs: getState().docs.length,
      active: current?.path || current?.name || null,
    }).catch(() => {})
  }, [])
  React.useEffect(() => {
    const node = rootRef.current
    if (!node) return
    const onWheel = event => {
      if (!event.ctrlKey) return
      event.preventDefault()
      event.stopPropagation()
      const direction = event.deltaY < 0 ? 1 : -1
      const next = Math.max(8, Math.min(48, sizeRef.current + direction))
      if (next === sizeRef.current) return
      sizeRef.current = next
      persistSettings({ fontSize: next })
      toast(t('zoom') + ' ' + next + 'px', 'info', 850)
    }
    node.addEventListener('wheel', onWheel, { passive: false, capture: true })
    return () => node.removeEventListener('wheel', onWheel, true)
  }, [])
  const onDragOver = event => {
    if (Array.from(event.dataTransfer?.types || []).includes('Files')) {
      event.preventDefault()
    }
  }
  const onDrop = async event => {
    if (event.defaultPrevented) return
    const files = Array.from(event.dataTransfer?.files || [])
    if (files.length === 0) return
    event.preventDefault()
    for (const file of files) {
      const filePath = file.path && String(file.path)
      if (filePath && /^[A-Za-z]:[\\/]/.test(filePath)) {
        await openPath(filePath)
      } else {
        try {
          const text = await file.text()
          const fresh = newFile()
          const { getState, setState } = await import('./store.js')
          setState({
            docs: getState().docs.map(item => item.id === fresh.id ? { ...item, content: text, savedContent: '', dirty: true, name: file.name || item.name, preview: !!previewKind({ name: file.name }), cmState: null } : item),
            activeId: fresh.id,
          })
        } catch {
          toast('无法读取拖入的文件', 'error')
        }
      }
    }
  }
  return h('div', {
    ref: rootRef,
    className: 'np-root',
    'data-theme': state.settings.theme,
    style: {
      '--np-font': cssFontStack(state.settings.fontFamily),
      '--np-font-size': state.settings.fontSize + 'px',
      '--np-line-height': state.settings.lineHeight,
      '--np-preview-scale': state.settings.previewScale,
      '--np-editor-weight': state.settings.fontWeight,
    },
    onDragOver,
    onDrop,
  },
    h(Topbar),
    h(Tabs),
    state.ai.loading ? h('div', { className: 'np-loadingbar' }) : null,
    h(EditorPane),
    h(StatusBar, { doc }),
    h(SelectionContextMenu),
    state.settingsOpen ? h(SettingsModal) : null,
    state.aboutOpen ? h(AboutModal) : null,
    state.associationOpen ? h(AssociationModal) : null,
    state.toast ? h('div', { className: 'np-toast ' + (state.toast.kind || '') }, state.toast.text) : null,
  )
}

export function NotepadApp() {
  return h(NotepadBoundary, null, h(NotepadAppInner))
}

function SelectionContextMenu() {
  const state = useNotepad()
  const menu = state.contextMenu
  React.useEffect(() => {
    if (!menu) return
    const close = () => setContextMenu(null)
    document.addEventListener('mousedown', close)
    window.addEventListener('blur', close)
    return () => {
      document.removeEventListener('mousedown', close)
      window.removeEventListener('blur', close)
    }
  }, [menu])
  if (!menu) return null
  const item = (label, action, shortcut) => h('button', {
    type: 'button',
    className: 'np-menu-item',
    onClick: () => { setContextMenu(null); action() },
  }, h('span', null, label), shortcut ? h('span', { className: 'np-kbd' }, shortcut) : null)
  const doc = activeDoc()
  return h('div', {
    className: 'np-context',
    style: { left: Math.min(menu.x, window.innerWidth - 220) + 'px', top: Math.min(menu.y, window.innerHeight - 260) + 'px' },
    onMouseDown: event => event.stopPropagation(),
  },
    item(t('polish'), () => runAI('polish', { instruction: '' }), 'Ctrl+Alt+2'),
    item(t('concise'), () => runAI('concise', { instruction: '' }), 'Ctrl+Alt+1'),
    item(t('expand'), () => runAI('expand', { instruction: '' }), 'Ctrl+Alt+3'),
    item(t('proofread'), () => runAI('proofread', { instruction: '' }), 'Ctrl+Alt+4'),
    h('div', { className: 'np-menu-sep' }),
    item(t('addAnnotation'), () => addAnnotation(), 'Ctrl+Alt+B'),
    item(t('copy'), () => copySelection()),
    item(t('openWith'), () => { if (doc?.path) api('/reveal', { path: doc.path }).catch(error => toast(error.message, 'error')) }),
  )
}

function ReviewPanel({ review }) {
  const state = useNotepad()
  const autoApplied = review.autoApplied === true
  const diff = React.useMemo(() => lineDiff(review.before, review.after), [review.before, review.after])
  const ops = React.useMemo(() => compactDiff(diff.ops, 4), [diff])
  React.useEffect(() => {
    const handler = event => {
      if (event.key !== 'Escape') return
      if (autoApplied) closeReview()
      else clearReview()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [autoApplied])
  return h(React.Fragment, null,
    h('div', { className: 'np-ai-head np-review-head' },
      h(DiffIcon, { size: 16 }),
      h('div', { className: 'np-ai-title' }, review.kind === 'batch' ? t('batchTitle') : t('reviewDock')),
      h(IconButton, { title: t('close'), onClick: autoApplied ? closeReview : clearReview }, h(CloseIcon, { size: 14 })),
    ),
    h('div', { className: 'np-review-body' },
      h('div', { className: 'np-diff-meta np-review-meta' },
        h('span', { className: 'np-diff-add' }, '+' + diff.stats.additions),
        h('span', { className: 'np-diff-del' }, '-' + diff.stats.deletions),
        h('span', null, review.kind === 'batch' ? review.changes.length + ' 处修改' : (state.model ? `${state.model.provider}/${state.model.model}` : '')),
        diff.stats.truncated ? h('span', null, '（大规模修改）') : null,
      ),
      h('p', { className: 'np-hint np-review-hint' }, autoApplied ? t('reviewAppliedHint') : t('reviewDockHint')),
      h('div', { className: 'np-diff np-diff-dock' }, ops.map((op, index) => {
        const kind = op.type === 'ins' ? 'add' : op.type === 'del' ? 'del' : op.type
        return h('div', { className: 'np-diff-line ' + kind, key: index },
          h('span', { className: 'ln' }, op.type === 'gap' ? '…' : String(op.newLine || op.oldLine || '')),
          h('span', { className: 'sign' }, op.type === 'ins' ? '+' : op.type === 'del' ? '-' : ' '),
          h('span', { className: 'txt' }, op.text === '' ? ' ' : op.text),
        )
      })),
    ),
    h('div', { className: 'np-review-actions' },
      h('p', { className: 'np-hint', style: { margin: 0 } }, autoApplied
        ? t('reviewAppliedHint')
        : '只有点击「' + (review.kind === 'batch' ? t('acceptBatch') : t('accept')) + '」后才会写入编辑器；写入后可继续 Ctrl+Z 撤销。'),
      h('div', { className: 'np-row' },
        autoApplied
          ? h(React.Fragment, null,
            h('button', { type: 'button', className: 'np-btn np-outline', onClick: closeReview }, t('close')),
            h('button', { type: 'button', className: 'np-btn np-danger', style: { flex: 1 }, onClick: () => revertLastChange() }, t('revertChange')),
          )
          : h(React.Fragment, null,
            h('button', { type: 'button', className: 'np-btn np-outline', onClick: clearReview }, t('reject')),
            h('button', {
              type: 'button',
              className: 'np-btn np-outline',
              disabled: state.ai.loading,
              onClick: () => {
                if (review.kind === 'batch') {
                  clearReview()
                  runBatch()
                } else {
                  clearReview()
                  regenerate()
                }
              },
            }, h(ReloadIcon, { size: 14 }), t('regenerate')),
            h('button', { type: 'button', className: 'np-btn np-primary', style: { flex: 1 }, onClick: () => acceptReview() }, h(CheckIcon, { size: 14 }), review.kind === 'batch' ? t('acceptBatch') : t('accept')),
          ),
      ),
    ),
  )
}

function Toggle({ checked, onChange, label }) {
  return h('label', { className: 'np-switch' },
    h('input', { type: 'checkbox', checked, onChange: event => onChange(event.target.checked) }),
    label,
  )
}

function FontPicker({ value, fonts, onChange }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [active, setActive] = React.useState(0)
  const ref = React.useRef(null)
  useCloseOnOutside(ref, () => setOpen(false), open)

  const ordered = React.useMemo(() => {
    const set = new Set(fonts)
    const list = []
    for (const font of RECOMMENDED_FONTS) {
      if (set.has(font)) list.push(font)
    }
    for (const font of fonts) {
      if (!list.includes(font)) list.push(font)
    }
    return list
  }, [fonts])

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return ordered
    return ordered.filter(font => font.toLowerCase().includes(needle))
  }, [ordered, query])

  React.useEffect(() => {
    if (active >= filtered.length) setActive(0)
  }, [filtered.length, active])

  const choose = font => {
    onChange(font)
    setOpen(false)
    setQuery('')
  }

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) {
      setQuery('')
      setActive(0)
      if (fonts.length === 0) loadFonts(true)
    }
  }

  const onSearchKeyDown = event => {
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive(index => Math.min(filtered.length - 1, index + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive(index => Math.max(0, index - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (filtered[active]) choose(filtered[active])
    }
  }

  return h('div', { className: 'np-font-picker', ref },
    h('div', { className: 'np-font-control' },
      h('span', { className: 'np-font-glyph', 'aria-hidden': true }, 'Aa'),
      h('input', {
        id: 'np-font',
        className: 'np-font-input',
        value,
        placeholder: 'Microsoft YaHei UI',
        role: 'combobox',
        'aria-expanded': open,
        'aria-controls': 'np-font-listbox',
        onChange: event => onChange(event.target.value),
        onFocus: () => { if (!open) toggle() },
        onKeyDown: event => {
          if (event.key === 'ArrowDown') { event.preventDefault(); if (!open) toggle() }
        },
      }),
      h('button', {
        type: 'button',
        className: 'np-font-toggle',
        title: t('font'),
        'aria-label': t('font'),
        onClick: toggle,
        'aria-expanded': open,
      }, h(ChevronDownIcon, { size: 15 })),
    ),
    open ? h('div', { className: 'np-font-popover' },
      h('div', { className: 'np-font-search' },
        h(SearchIcon, { size: 14 }),
        h('input', {
          autoFocus: true,
          value: query,
          placeholder: t('fontSearch'),
          onChange: event => { setQuery(event.target.value); setActive(0) },
          onKeyDown: onSearchKeyDown,
          'aria-label': t('fontSearch'),
        }),
        query ? h('button', { type: 'button', className: 'np-font-clear', onClick: () => { setQuery(''); setActive(0) } }, h(CloseIcon, { size: 12 })) : null,
      ),
      h('div', { className: 'np-font-list', id: 'np-font-listbox', role: 'listbox', 'aria-label': t('fontAll') },
        filtered.length === 0
          ? h('div', { className: 'np-font-empty' }, fonts.length ? '没有匹配的字体' : '正在读取系统字体…')
          : filtered.map((font, index) => h('button', {
            type: 'button',
            key: font,
            role: 'option',
            'aria-selected': font === value,
            className: 'np-font-option' + (index === active ? ' active' : '') + (font === value ? ' selected' : ''),
            onMouseEnter: () => setActive(index),
            onMouseDown: event => event.preventDefault(),
            onClick: () => choose(font),
          },
            h('span', { className: 'np-font-name', style: { fontFamily: cssFontStack(font) } }, font),
            h('span', { className: 'np-font-sample', style: { fontFamily: cssFontStack(font) } }, t('fontPreview')),
            RECOMMENDED_FONTS.includes(font) ? h('span', { className: 'np-font-star', title: t('fontRecommended') }, '★') : null,
          )),
      ),
      h('div', { className: 'np-font-foot' },
        h('span', null, fonts.length + ' ' + t('fontCount')),
        h('button', { type: 'button', className: 'np-font-refresh', onClick: () => loadFonts(true) }, h(ReloadIcon, { size: 12 }), t('fontRefresh')),
      ),
    ) : null,
  )
}

function SettingsForm({ compact = false }) {
  const state = useNotepad()
  const settings = state.settings
  React.useEffect(() => { loadFonts() }, [])
  const set = patch => persistSettings(patch)
  const fonts = state.fonts || []
  return h('div', { className: 'np-settings' + (compact ? ' np-settings-compact' : '') },
    h('section', { className: 'np-settings-card' },
      h('div', { className: 'np-settings-card-head' },
        h('h3', null, '文本外观'),
        h('span', null, '立即生效并记住'),
      ),
      h('div', { className: 'np-field np-field-font' },
        h('label', { htmlFor: 'np-font' }, t('font')),
        h('div', { className: 'np-font-field-body' },
          h(FontPicker, { value: settings.fontFamily, fonts, onChange: value => set({ fontFamily: value }) }),
          h('div', {
            className: 'np-font-preview',
            style: { fontFamily: cssFontStack(settings.fontFamily), fontSize: Math.min(Number(settings.fontSize) + 2, 26) + 'px' },
          },
            h('span', null, '中文排版示例 · AI Notepad'),
            h('small', null, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789'),
          ),
        ),
      ),
      h('div', { className: 'np-field' },
        h('label', { htmlFor: 'np-size' }, t('fontSize')),
        h('div', { className: 'np-range' },
          h('input', { id: 'np-size', type: 'range', min: 8, max: 48, step: 1, value: settings.fontSize, onChange: event => set({ fontSize: Number(event.target.value) }) }),
          h('output', null, settings.fontSize + ' px'),
        ),
      ),
      h('div', { className: 'np-field' },
        h('label', { htmlFor: 'np-line' }, t('lineHeight')),
        h('div', { className: 'np-range' },
          h('input', { id: 'np-line', type: 'range', min: 1, max: 2.6, step: 0.05, value: settings.lineHeight, onChange: event => set({ lineHeight: Number(event.target.value) }) }),
          h('output', null, Number(settings.lineHeight).toFixed(2)),
        ),
      ),
      h('div', { className: 'np-field' },
        h('label', null, t('fontWeight')),
        h('div', { className: 'np-seg' },
          h('button', { type: 'button', className: settings.fontWeight === '400' ? 'active' : '', onClick: () => set({ fontWeight: '400' }) }, t('normal')),
          h('button', { type: 'button', className: settings.fontWeight === '700' ? 'active' : '', onClick: () => set({ fontWeight: '700' }) }, t('bold')),
        ),
      ),
    ),
    h('section', { className: 'np-settings-card' },
      h('div', { className: 'np-settings-card-head' },
        h('h3', null, '排版与行为'),
        h('span', null, 'Ctrl + 滚轮可快速缩放'),
      ),
      h('div', { className: 'np-field' },
        h('label', null, t('theme')),
        h('div', { className: 'np-seg' },
          ['system', 'light', 'dark'].map(theme => h('button', {
            type: 'button',
            key: theme,
            className: settings.theme === theme ? 'active' : '',
            onClick: () => set({ theme }),
          }, t(theme))),
        ),
      ),
      h('div', { className: 'np-field' },
        h('label', null, t('wrap')),
        h(Toggle, { checked: settings.wrap, onChange: value => set({ wrap: value }), label: '' }),
      ),
      h('div', { className: 'np-field' },
        h('label', null, t('lineNumbers')),
        h(Toggle, { checked: settings.lineNumbers, onChange: value => set({ lineNumbers: value }), label: '' }),
      ),
      h('div', { className: 'np-field' },
        h('label', { htmlFor: 'np-tab' }, t('tabSize')),
        h('input', { id: 'np-tab', className: 'np-input', type: 'number', min: 1, max: 8, value: settings.tabSize, onChange: event => set({ tabSize: Math.max(1, Math.min(8, Number(event.target.value) || 2)) }) }),
      ),
      h('div', { className: 'np-field' },
        h('label', { htmlFor: 'np-preview-scale' }, t('previewScale')),
        h('div', { className: 'np-range' },
          h('input', { id: 'np-preview-scale', type: 'range', min: 0.8, max: 1.6, step: 0.05, value: settings.previewScale, onChange: event => set({ previewScale: Number(event.target.value) }) }),
          h('output', null, Number(settings.previewScale).toFixed(2) + '×'),
        ),
      ),
    ),
    h('div', { className: 'np-settings-actions' },
      h('button', { type: 'button', className: 'np-btn np-outline', onClick: () => resetSettings() }, t('reset')),
      h('span', { className: 'np-hint', style: { margin: 0, flex: 1 } }, '设置保存在本机浏览器存储中，重启 Harness 后保留。'),
    ),
  )
}

function formatBuildTime(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(value)
  }
}

function AboutModal() {
  const state = useNotepad()
  React.useEffect(() => {
    const handler = event => { if (event.key === 'Escape') setAboutOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const platform = state.host?.platform === 'win32' ? 'Windows' : (state.host?.platform || '—')
  const model = state.model ? `${state.model.provider} / ${state.model.model}` : '—'
  const association = state.association
    ? (state.association.registered ? t('aboutAssocOn') : t('aboutAssocOff'))
    : '—'
  const features = [
    { icon: NotepadIcon, title: t('featureTextTitle'), desc: t('featureTextDesc') },
    { icon: EditIcon, title: t('featureEditTitle'), desc: t('featureEditDesc') },
    { icon: SparkIcon, title: t('featureSelectionTitle'), desc: t('featureSelectionDesc') },
    { icon: DiffIcon, title: t('featureDocumentTitle'), desc: t('featureDocumentDesc') },
    { icon: CopyIcon, title: t('featureAnnotationTitle'), desc: t('featureAnnotationDesc') },
    { icon: EyeIcon, title: t('featurePreviewTitle'), desc: t('featurePreviewDesc') },
    { icon: LinkIcon, title: t('featureAssocTitle'), desc: t('featureAssocDesc') },
    { icon: ReloadIcon, title: t('featureModelTitle'), desc: t('featureModelDesc') },
  ]
  const shortcuts = [
    ['Ctrl+S', t('save')],
    ['Ctrl+Shift+S', t('saveAs')],
    ['Ctrl+Z / Ctrl+Y', t('undo') + ' / ' + t('redo')],
    ['Ctrl+F', t('find')],
    ['Ctrl+E', t('togglePreview')],
    ['Ctrl+滚轮', t('fontSize')],
    ['Ctrl+Alt+1…4', t('selection') + ' AI'],
    ['Ctrl+Alt+B', t('addAnnotation')],
  ]
  const infoText = [
    `AI Notepad v${PLUGIN_VERSION}`,
    `${t('aboutBuildTime')}: ${formatBuildTime(PLUGIN_BUILD_TIME)}`,
    `${t('aboutPlatform')}: ${platform}`,
    `${t('aboutModel')}: ${model}`,
    `${t('aboutAssoc')}: ${association}`,
  ].join('\n')

  const copyInfo = async () => {
    try {
      await navigator.clipboard.writeText(infoText)
      toast(t('aboutCopied'), 'success', 1600)
    } catch {
      toast('无法访问剪贴板', 'error')
    }
  }

  return h('div', { className: 'np-overlay', onMouseDown: event => { if (event.target === event.currentTarget) setAboutOpen(false) } },
    h('div', { className: 'np-modal np-about-modal', role: 'dialog', 'aria-modal': 'true' },
      h('div', { className: 'np-modal-head' },
        h(InfoIcon, { size: 18 }),
        h('div', { className: 'np-modal-title' }, t('aboutTitle')),
        h(IconButton, { title: t('aboutClose'), onClick: () => setAboutOpen(false) }, h(CloseIcon)),
      ),
      h('div', { className: 'np-modal-body np-about-body' },
        h('div', { className: 'np-about-hero' },
          h('span', { className: 'np-about-mark' }, h(NotepadIcon, { size: 38 })),
          h('div', { className: 'np-about-hero-text' },
            h('div', { className: 'np-about-name' }, 'AI Notepad'),
            h('p', { className: 'np-about-tagline' }, t('aboutTagline')),
            h('div', { className: 'np-about-meta' },
              h('span', { className: 'np-about-version' }, 'v' + PLUGIN_VERSION),
              h('span', null, t('aboutBuildTime') + ' ' + formatBuildTime(PLUGIN_BUILD_TIME)),
              h('span', null, platform),
            ),
          ),
        ),
        h('p', { className: 'np-about-intro' }, t('aboutIntro')),
        h('section', { className: 'np-about-section' },
          h('h3', null, t('aboutFeatures')),
          h('div', { className: 'np-about-grid' }, features.map(item => h('div', { className: 'np-about-feature', key: item.title },
            h('span', { className: 'np-about-ficon' }, h(item.icon, { size: 17 })),
            h('div', null, h('strong', null, item.title), h('p', null, item.desc)),
          )))),
        h('div', { className: 'np-about-columns' },
          h('section', { className: 'np-about-section' },
            h('h3', null, t('aboutShortcuts')),
            h('div', { className: 'np-about-shortcuts' }, shortcuts.map(([keys, label]) => h('div', { className: 'np-about-shortcut', key: keys },
              h('kbd', { className: 'np-kbd' }, keys),
              h('span', null, label),
            ))),
          ),
          h('section', { className: 'np-about-section' },
            h('h3', null, t('aboutRuntime')),
            h('div', { className: 'np-about-runtime' },
              [
                [t('aboutVersion'), 'v' + PLUGIN_VERSION],
                [t('aboutBuildTime'), formatBuildTime(PLUGIN_BUILD_TIME)],
                [t('aboutPlatform'), platform],
                [t('aboutModel'), model],
                [t('aboutAssoc'), association],
              ].map(([label, value]) => h('div', { className: 'np-about-row', key: label },
                h('span', null, label),
                h('b', null, value),
              )),
            ),
          ),
        ),
        h('section', { className: 'np-about-section' },
          h('h3', null, t('aboutUpdates')),
          h('div', { className: 'np-about-updates' },
            h('p', null, h('span', { className: 'np-about-dot' }), t('aboutUpdateCurrent')),
            h('p', null, h('span', { className: 'np-about-dot' }), t('aboutUpdatePrev')),
          ),
        ),
        h('section', { className: 'np-about-section np-about-limits' },
          h('h3', null, t('aboutLimits')),
          h('ul', null,
            h('li', null, t('limitAssoc')),
            h('li', null, t('limitEditor')),
            h('li', null, t('limitSize')),
          ),
        ),
      ),
      h('div', { className: 'np-modal-foot' },
        h('button', { type: 'button', className: 'np-btn np-outline', onClick: copyInfo }, h(CopyIcon, { size: 14 }), t('aboutCopy')),
        h('span', { className: 'np-grow' }),
        h('span', { className: 'np-hint', style: { margin: 0 } }, 'AI Notepad · Local-first · No extra API key'),
        h('button', { type: 'button', className: 'np-btn np-primary', onClick: () => setAboutOpen(false) }, t('aboutClose')),
      ),
    ),
  )
}

function SettingsModal() {
  React.useEffect(() => {
    const handler = event => { if (event.key === 'Escape') setSettingsOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  return h('div', { className: 'np-overlay', onMouseDown: event => { if (event.target === event.currentTarget) setSettingsOpen(false) } },
    h('div', { className: 'np-modal', role: 'dialog', 'aria-modal': 'true' },
      h('div', { className: 'np-modal-head' },
        h(SettingsIcon, { size: 18 }),
        h('div', { className: 'np-modal-title' }, t('settings')),
        h(IconButton, { title: t('close'), onClick: () => setSettingsOpen(false) }, h(CloseIcon)),
      ),
      h('div', { className: 'np-modal-body' }, h(SettingsForm)),
      h('div', { className: 'np-modal-foot' },
        h('span', { className: 'np-grow' }),
        h('button', { type: 'button', className: 'np-btn np-primary', onClick: () => setSettingsOpen(false) }, t('apply')),
      ),
    ),
  )
}

function AssociationRow({ item }) {
  return h('span', { className: 'np-ext' + (item.isDefault ? ' default' : ''), title: item.userChoice || '' },
    '.' + item.extension,
    item.isDefault ? h('span', null, ' ✓') : null,
  )
}

function AssociationModal() {
  const state = useNotepad()
  const [text, setText] = React.useState(() => {
    try { return localStorage.getItem('dsh.ai-notepad.extensions.v1') || '' } catch { return '' }
  })
  const [busy, setBusy] = React.useState(false)
  const association = state.association
  const extensions = parseExtensions(text)
  const refresh = async value => {
    setBusy(true)
    try {
      const result = await import('./store.js').then(module => module.refreshAssociation(value === undefined ? text : value))
      return result
    } finally { setBusy(false) }
  }
  React.useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const saveText = value => {
    setText(value)
    try { localStorage.setItem('dsh.ai-notepad.extensions.v1', value) } catch {}
  }
  const doInstall = async () => {
    setBusy(true)
    try { await installAssociations(extensions); await refresh(text) } finally { setBusy(false) }
  }
  const doRemove = async (restore = false) => {
    setBusy(true)
    try { await (restore ? restoreAssociations() : removeAssociations()); await refresh(text) } finally { setBusy(false) }
  }
  const rows = association?.extensions || []
  return h('div', { className: 'np-overlay', onMouseDown: event => { if (event.target === event.currentTarget) setAssociationOpen(false) } },
    h('div', { className: 'np-modal', role: 'dialog', 'aria-modal': 'true' },
      h('div', { className: 'np-modal-head' },
        h(LinkIcon, { size: 18 }),
        h('div', { className: 'np-modal-title' }, t('associationTitle')),
        h(IconButton, { title: t('close'), onClick: () => setAssociationOpen(false) }, h(CloseIcon)),
      ),
      h('div', { className: 'np-modal-body' },
        h('p', { className: 'np-hint', style: { marginTop: 0 } }, association?.supported === false ? association.note : t('associationHint')),
        association?.supported === false ? null : h('div', { className: 'np-assoc-status' },
          h('span', null, association?.registered ? t('associationRegistered') : t('associationNone')),
          association?.command ? h('span', { className: 'np-badge' }, 'HKCU') : null,
          h('span', { className: 'np-grow', style: { flex: 1 } }),
          h('button', { type: 'button', className: 'np-btn np-sm np-outline', disabled: busy, onClick: () => refresh(text) }, '刷新'),
        ),
        h('div', { style: { height: 10 } }),
        h('div', { className: 'np-field-col' },
          h('label', { htmlFor: 'np-exts' }, t('extensions')),
          h('textarea', {
            id: 'np-exts',
            className: 'np-textarea',
            value: text,
            placeholder: 'txt, md, markdown, json, yaml, log, py, ps1 …',
            onChange: event => saveText(event.target.value),
          }),
          h('span', { className: 'np-settings-note' }, t('extensionsHint')),
        ),
        h('div', { style: { height: 10 } }),
        h('div', { className: 'np-ext-list' }, rows.length ? rows.map(item => h(AssociationRow, { key: item.extension, item })) : h('span', { className: 'np-hint' }, '点击「刷新」读取当前扩展名状态。')),
        association?.supported === false ? null : h('div', { className: 'np-row', style: { marginTop: 12 } },
          h('button', { type: 'button', className: 'np-btn np-primary', disabled: busy, onClick: doInstall }, busy ? h('span', { className: 'np-spin' }) : h(LinkIcon, { size: 14 }), t('associationInstall')),
          h('button', { type: 'button', className: 'np-btn np-outline', disabled: busy, onClick: () => doRemove(false) }, t('associationRemove')),
          h('button', { type: 'button', className: 'np-btn np-danger', disabled: busy, onClick: () => doRemove(true) }, t('associationRestore')),
        ),
        association?.supported === false ? null : h('div', { className: 'np-row', style: { marginTop: 8 } },
          h('button', { type: 'button', className: 'np-btn np-outline', onClick: () => openDefaultApps() }, h(ExternalIcon, { size: 14 }), t('associationDefault')),
          h('button', {
            type: 'button',
            className: 'np-btn np-outline',
            onClick: () => {
              const doc = activeDoc()
              if (!doc?.path) { toast('请先打开一个文件，再选择默认打开方式。', 'warn'); return }
              api('/associations', { action: 'open-with', path: doc.path }).catch(error => toast(error.message, 'error'))
            },
          }, t('associationOpenWith')),
        ),
        association?.supported === false ? null : h('div', { className: 'np-hint', style: { marginTop: 12 } }, t('associationDefaultHint')),
        association?.supported === false ? null : h('div', { className: 'np-hint' },
          '实现说明：Windows 10/11 的默认应用选择由系统哈希保护，任何第三方程序都无法静默改默认。本插件注册的是真实的当前用户级 ProgID / OpenWithProgids / RegisteredApplications；双击文件由随插件安装的 VBS 启动器写入队列并唤起 DSH。卸载会移除这些注册，并在本应用是默认时清理 UserChoice 让系统重新询问。'),
      ),
      h('div', { className: 'np-modal-foot' },
        h('span', { className: 'np-grow' }),
        h('button', { type: 'button', className: 'np-btn np-primary', onClick: () => setAssociationOpen(false) }, t('close')),
      ),
    ),
  )
}

export function NotepadSettingsPage() {
  const state = useNotepad()
  React.useEffect(() => { loadHostStatus(); loadFonts() }, [])
  return h('div', {
    className: 'np-root np-settings-page',
    'data-theme': state.settings.theme,
    style: {
      '--np-font': cssFontStack(state.settings.fontFamily),
      '--np-font-size': state.settings.fontSize + 'px',
      '--np-line-height': state.settings.lineHeight,
      '--np-preview-scale': state.settings.previewScale,
      '--np-editor-weight': state.settings.fontWeight,
    },
  },
    h('h2', null, 'AI Notepad'),
    h('p', null, '通用文本编辑器的字体、字号、行距、换行与主题设置。文件关联和扩展名配置在 Notepad 顶部菜单中打开。'),
    h(SettingsForm),
    h('div', { className: 'np-row', style: { marginTop: 12 } },
      h('button', { type: 'button', className: 'np-btn np-outline', onClick: () => openAssociations() }, h(LinkIcon, { size: 14 }), t('associations')),
      h('button', { type: 'button', className: 'np-btn np-outline', onClick: () => openSettings() }, h(SettingsIcon, { size: 14 }), '打开完整设置'),
    ),
  )
}
