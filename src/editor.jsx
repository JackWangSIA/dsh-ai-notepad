import React from 'react'
import { EditorState, Compartment, StateField, StateEffect } from '@codemirror/state'
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  placeholder,
  Decoration,
} from '@codemirror/view'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  redo,
} from '@codemirror/commands'
import { searchKeymap, highlightSelectionMatches, openSearchPanel } from '@codemirror/search'
import {
  activeDoc,
  closeDoc,
  getState,
  openAI,
  openPath,
  saveDoc,
  setContextMenu,
  setPreview,
  t,
  updateDocContent,
  registerEditorBridge,
  clearEditorBridge,
  runAI,
  addAnnotation,
} from './store.js'

const wrapCompartment = new Compartment()
const lineNumberCompartment = new Compartment()
const tabSizeCompartment = new Compartment()

const setAnnotations = StateEffect.define()

function buildAnnotationDecorations(ranges) {
  if (!Array.isArray(ranges) || ranges.length === 0) return Decoration.none
  const items = ranges
    .filter(item => Number.isInteger(item.from) && Number.isInteger(item.to) && item.to > item.from)
    .sort((a, b) => a.from - b.from || a.to - b.to)
  const decorations = []
  for (const item of items) {
    decorations.push(Decoration.mark({ class: 'cm-ann', attributes: { title: item.instruction || 'AI annotation' } }).range(item.from, item.to))
  }
  return Decoration.set(decorations, true)
}

const annotationField = StateField.define({
  create() { return Decoration.none },
  update(decorations, transaction) {
    let next = decorations.map(transaction.changes)
    for (const effect of transaction.effects) {
      if (effect.is(setAnnotations)) next = buildAnnotationDecorations(effect.value)
    }
    return next
  },
  provide(field) { return EditorView.decorations.from(field) },
})

function createState(doc, settings) {
  const extensions = [
    highlightSpecialChars(),
    history(),
    drawSelection(),
    dropCursor(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    highlightSelectionMatches(),
    annotationField,
    placeholder(t('emptyHint')),
    keymap.of([
      { key: 'Mod-s', preventDefault: true, run: () => { saveDoc(); return true } },
      { key: 'Mod-Shift-s', preventDefault: true, run: () => { saveDoc(getState().activeId, { saveAs: true }); return true } },
      { key: 'Mod-w', preventDefault: true, run: () => { closeDoc(getState().activeId); return true } },
      { key: 'Mod-Alt-a', preventDefault: true, run: () => { openAI(); return true } },
      { key: 'Mod-Alt-1', preventDefault: true, run: () => { runAI('concise'); return true } },
      { key: 'Mod-Alt-2', preventDefault: true, run: () => { runAI('polish'); return true } },
      { key: 'Mod-Alt-3', preventDefault: true, run: () => { runAI('expand'); return true } },
      { key: 'Mod-Alt-4', preventDefault: true, run: () => { runAI('proofread'); return true } },
      { key: 'Mod-Alt-b', preventDefault: true, run: () => { addAnnotation(); return true } },
      { key: 'Mod-y', preventDefault: true, run: redo },
      {
        key: 'Mod-e',
        preventDefault: true,
        run: () => {
          const doc = activeDoc()
          if (!doc || !/\.(md|markdown|mdx)$/i.test(doc.name || '')) return false
          setPreview(doc.id, !doc.preview)
          return true
        },
      },
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
      indentWithTab,
    ]),
    wrapCompartment.of(settings.wrap ? EditorView.lineWrapping : []),
    lineNumberCompartment.of(settings.lineNumbers ? lineNumbers() : []),
    tabSizeCompartment.of(EditorState.tabSize.of(Number(settings.tabSize) || 2)),
    EditorView.domEventHandlers({
      contextmenu(event, view) {
        const selection = view.state.selection.main
        if (selection.empty) return false
        event.preventDefault()
        setContextMenu({ x: event.clientX, y: event.clientY })
        return true
      },
      drop(event, view) {
        const files = Array.from(event.dataTransfer?.files || [])
        if (files.length === 0) return false
        event.preventDefault()
        for (const file of files) {
          const filePath = file.path && String(file.path)
          if (filePath && /^[A-Za-z]:[\\/]/.test(filePath)) {
            openPath(filePath).catch(() => {})
          } else {
            file.text().then(text => {
              const current = activeDoc()
              if (!current) return
              const separator = current.content && !current.content.endsWith('\n') ? '\n' : ''
              view.dispatch({ changes: { from: view.state.doc.length, insert: separator + text } })
            }).catch(() => {})
          }
        }
        return true
      },
    }),
    EditorView.updateListener.of(update => {
      const doc = activeDoc()
      if (!doc) return
      if (!update.docChanged && !update.selectionSet && update.viewportChanged === false) return
      const selection = update.state.selection.main
      const text = selection.empty ? '' : update.state.doc.sliceString(selection.from, selection.to)
      let coords = null
      if (!selection.empty) {
        const start = update.view.coordsAtPos(selection.from)
        const end = update.view.coordsAtPos(selection.to)
        const rect = update.view.dom.getBoundingClientRect()
        if (start && end) {
          coords = {
            left: Math.max(8, Math.min(rect.width - 8, (start.left + end.right) / 2 - rect.left)),
            top: Math.max(4, Math.max(start.bottom, end.bottom) - rect.top + 6),
          }
        }
      }
      const head = selection.head
      const line = update.state.doc.lineAt(head)
      const cursor = { line: line.number, column: head - line.from + 1 }
      if (update.docChanged) {
        updateDocContent(doc.id, update.state.doc.toString(), update.state, {
          from: selection.from,
          to: selection.to,
          text,
          coords,
        }, cursor)
      } else {
        updateDocContent(doc.id, doc.content, update.state, {
          from: selection.from,
          to: selection.to,
          text,
          coords,
        }, cursor)
      }
    }),
  ]
  return EditorState.create({ doc: doc.content || '', extensions })
}

export function NotepadEditor({ doc }) {
  const hostRef = React.useRef(null)
  const viewRef = React.useRef(null)
  const configuredRef = React.useRef({ wrap: true, lineNumbers: true, tabSize: 2 })
  const [, force] = React.useReducer(value => value + 1, 0)

  React.useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const state = doc.cmState || createState(doc, getState().settings)
    const view = new EditorView({ state, parent: host })
    viewRef.current = view
    configuredRef.current = {
      wrap: getState().settings.wrap,
      lineNumbers: getState().settings.lineNumbers,
      tabSize: getState().settings.tabSize,
    }
    registerEditorBridge({
      docId: doc.id,
      view,
      dispatchChange(change) {
        view.dispatch({
          changes: change,
          selection: { anchor: change.from + String(change.insert || '').length },
          scrollIntoView: true,
        })
        view.focus()
      },
      dispatchChanges(changes) {
        if (!Array.isArray(changes) || changes.length === 0) return
        const sorted = changes.slice().sort((a, b) => a.from - b.from)
        view.dispatch({ changes: sorted, scrollIntoView: true })
        view.focus()
      },
      scrollTo(from, to) {
        view.dispatch({
          selection: { anchor: from, head: to },
          effects: EditorView.scrollIntoView(from, { y: 'center' }),
        })
        view.focus()
      },
      clearAnnotations() {
        view.dispatch({ effects: setAnnotations.of([]) })
      },
      openSearch() {
        openSearchPanel(view)
        view.focus()
      },
      replaceAll(text) {
        view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text } })
        view.focus()
      },
    })
    force()
    return () => {
      clearEditorBridge()
      view.destroy()
      viewRef.current = null
    }
    // The editor instance is stable for the lifetime of the pane.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    const view = viewRef.current
    if (!view) return
    if (view.state !== doc.cmState) {
      view.setState(doc.cmState || createState(doc, getState().settings))
    }
    if (getState().editorBridge) getState().editorBridge.docId = doc.id
    view.focus()
  }, [doc.id, doc.cmState])

  React.useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({ effects: setAnnotations.of(doc.annotations || []) })
  }, [doc.id, doc.annotations])

  React.useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const settings = getState().settings
    const effects = []
    if (configuredRef.current.wrap !== settings.wrap) {
      effects.push(wrapCompartment.reconfigure(settings.wrap ? EditorView.lineWrapping : []))
    }
    if (configuredRef.current.lineNumbers !== settings.lineNumbers) {
      effects.push(lineNumberCompartment.reconfigure(settings.lineNumbers ? lineNumbers() : []))
    }
    if (configuredRef.current.tabSize !== settings.tabSize) {
      effects.push(tabSizeCompartment.reconfigure(EditorState.tabSize.of(Number(settings.tabSize) || 2)))
    }
    if (effects.length > 0) {
      view.dispatch({ effects })
      configuredRef.current = {
        wrap: settings.wrap,
        lineNumbers: settings.lineNumbers,
        tabSize: settings.tabSize,
      }
    }
  })

  return React.createElement('div', { className: 'np-editor-host', ref: hostRef, lang: 'text' })
}

export function getEditorView() {
  return getState().editorBridge?.view || null
}
