import React from 'react'
import { renderToString } from 'react-dom/server'
import { NotepadApp, NotepadSettingsPage } from '../src/app.jsx'
import { getState, newFile, setAboutOpen, setReview, setState } from '../src/store.js'

export function renderApp() {
  if (getState().docs.length === 0) newFile()
  return renderToString(React.createElement(NotepadApp))
}

export function renderSettings() {
  return renderToString(React.createElement(NotepadSettingsPage))
}

export function renderReview() {
  if (getState().docs.length === 0) newFile()
  const doc = getState().docs[0]
  setReview({
    kind: 'single',
    docId: doc.id,
    from: 0,
    to: 4,
    before: 'old text',
    after: 'new text',
    action: 'polish',
    scope: 'selection',
    stats: { additions: 1, deletions: 1, truncated: false },
  })
  const html = renderToString(React.createElement(NotepadApp))
  setReview(null)
  return html
}

export function renderAbout() {
  if (getState().docs.length === 0) newFile()
  setAboutOpen(true)
  const html = renderToString(React.createElement(NotepadApp))
  setAboutOpen(false)
  return html
}

export function renderHtmlPreview() {
  if (getState().docs.length === 0) newFile()
  const doc = getState().docs[0]
  setState({
    docs: getState().docs.map(item => item.id === doc.id ? {
      ...item,
      name: 'preview.html',
      content: '<link rel="stylesheet" href="./assets/theme.css"><h1>HTML</h1>',
      preview: true,
    } : item),
  })
  return renderToString(React.createElement(NotepadApp))
}

export function renderPreview() {
  if (getState().docs.length === 0) newFile()
  const doc = getState().docs[0]
  setState({
    docs: getState().docs.map(item => item.id === doc.id ? {
      ...item,
      name: 'preview.md',
      content: '# Heading\n\n**bold** and [link](https://example.com)\n\n<script>alert(1)</script>',
      preview: true,
    } : item),
  })
  const html = renderToString(React.createElement(NotepadApp))
  return html
}
