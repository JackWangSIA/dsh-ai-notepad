import test from 'node:test'
import assert from 'node:assert/strict'

const stored = new Map()
globalThis.localStorage = {
  getItem(key) { return stored.has(key) ? stored.get(key) : null },
  setItem(key, value) { stored.set(key, String(value)) },
  removeItem(key) { stored.delete(key) },
}
Object.defineProperty(globalThis, 'navigator', {
  value: { language: 'zh-CN', clipboard: { writeText: async () => {} } },
  configurable: true,
})

const store = await import('../src/store.js')

test('editor settings persist immediately and reset cleanly', () => {
  assert.equal(store.normalizeFontFamily('"Microsoft YaHei UI", "Segoe UI", sans-serif'), 'Microsoft YaHei UI')
  assert.equal(store.normalizeFontFamily('"Consolas"'), 'Consolas')
  store.persistSettings({ fontSize: 22, theme: 'dark', fontFamily: '"Consolas", monospace' })
  assert.equal(store.getState().settings.fontSize, 22)
  assert.equal(store.getState().settings.theme, 'dark')
  assert.equal(store.getState().settings.fontFamily, 'Consolas')
  const saved = JSON.parse(stored.get('dsh.ai-notepad.settings.v1'))
  assert.equal(saved.fontSize, 22)
  assert.equal(saved.theme, 'dark')
  assert.equal(saved.fontFamily, 'Consolas')
  store.resetSettings()
  assert.equal(store.getState().settings.fontSize, 15)
  assert.equal(store.getState().settings.theme, 'system')
  assert.equal(store.getState().settings.fontFamily, 'Microsoft YaHei UI')
})

test('selection AI applies immediately and can be reviewed or reverted', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /\/api\/ai-notepad\/ai$/)
    return new Response(JSON.stringify({ ok: true, text: 'REWRITTEN', provider: 'test', model: 'test' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
  try {
    store.newFile()
    let doc = store.activeDoc()
    store.updateDocContent(doc.id, 'Hello world', null, { from: 0, to: 5, text: 'Hello', coords: null }, { line: 1, column: 6 })
    store.setAIInstruction('make it different')
    await store.runAI('polish')
    doc = store.activeDoc()
    assert.equal(store.getState().review.before, 'Hello')
    assert.equal(store.getState().review.after, 'REWRITTEN')
    assert.equal(store.getState().review.autoApplied, true)
    assert.equal(store.getState().reviewOpen, false)
    assert.equal(store.getState().ai.instruction, '')
    assert.equal(doc.content, 'REWRITTEN world')
    assert.equal(doc.dirty, true)
    store.revertLastChange()
    doc = store.activeDoc()
    assert.equal(doc.content, 'Hello world')
    assert.equal(store.getState().review, null)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('preview selections map back to source offsets', () => {
  store.newFile()
  const doc = store.activeDoc()
  store.updateDocContent(doc.id, 'before Hello after', null, null, { line: 1, column: 1 })
  store.setPreviewSelection('Hello')
  assert.equal(store.activeDoc().selection.from, 7)
  assert.equal(store.activeDoc().selection.to, 12)
  assert.equal(store.activeDoc().selection.source, 'preview')
  store.setPreviewSelection('not in source')
  assert.equal(store.activeDoc().selection.from, -1)
  assert.equal(store.activeDoc().selection.unmapped, true)
})

test('opening HTML and Markdown starts in preview mode', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body)
    assert.equal(body.path, 'C:\\demo\\sample.html')
    return new Response(JSON.stringify({
      ok: true,
      path: body.path,
      name: 'sample.html',
      content: '<h1>Hello</h1>',
      encoding: 'utf-8',
      bom: false,
      eol: '\n',
      hash: 'hash',
      size: 14,
      large: false,
      mtimeMs: 1,
      readOnly: false,
    }), { status: 200, headers: { 'content-type': 'application/json' } })
  }
  try {
    const doc = await store.openPath('C:\\demo\\sample.html')
    assert.ok(doc)
    assert.equal(doc.preview, true)
    assert.equal(store.previewKind({ name: 'sample.md' }), 'markdown')
    assert.equal(store.previewKind({ name: 'sample.html' }), 'html')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('preview selection mapping crosses inline HTML and Markdown formatting', () => {
  const html = '<p>Hello <b>world</b></p>'
  const htmlRange = store.findPreviewRange(html, 'Hello world', 'html')
  assert.ok(htmlRange)
  assert.equal(html.slice(htmlRange.from, htmlRange.to), 'Hello <b>world</b>')
  const entity = store.findPreviewRange('<p>Tom &amp; Jerry</p>', 'Tom & Jerry', 'html')
  assert.ok(entity)
  assert.equal('<p>Tom &amp; Jerry</p>'.slice(entity.from, entity.to), 'Tom &amp; Jerry')

  const markdown = '# Heading\n\nHello **world** and [link](https://example.com)'
  const mdRange = store.findPreviewRange(markdown, 'Hello world and link', 'markdown')
  assert.ok(mdRange)
  assert.equal(markdown.slice(mdRange.from, mdRange.to), 'Hello **world** and [link](https://example.com)')

  const largeHtml = '<p>' + 'x '.repeat(600_000) + 'Hello <b>world</b></p>'
  const largeRange = store.findPreviewRange(largeHtml, 'Hello world', 'html')
  assert.ok(largeRange)
  assert.equal(largeHtml.slice(largeRange.from, largeRange.to), 'Hello <b>world</b>')
})

test('typing a custom instruction cannot combine with a preset action', async () => {
  const originalFetch = globalThis.fetch
  let requestBody = null
  globalThis.fetch = async (url, init) => {
    requestBody = JSON.parse(init.body)
    return new Response(JSON.stringify({ ok: true, text: 'Formal hello', provider: 'test', model: 'test' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
  try {
    store.newFile()
    let doc = store.activeDoc()
    store.updateDocContent(doc.id, 'Hello world', null, { from: 0, to: 5, text: 'Hello', coords: null }, { line: 1, column: 1 })
    store.setAIAction('polish')
    store.setAIInstruction('make it formal')
    assert.equal(store.getState().ai.action, 'custom')
    await store.runAI('polish')
    assert.equal(requestBody.action, 'custom')
    assert.equal(requestBody.instruction, 'make it formal')
    assert.equal(store.getState().ai.instruction, '')
    store.clearReview()
    store.setAIAction('concise')
    assert.equal(store.getState().ai.instruction, '')
    doc = store.activeDoc()
    store.updateDocContent(doc.id, 'Hello world', null, { from: 0, to: 5, text: 'Hello', coords: null }, { line: 1, column: 1 })
    await store.runAI('concise')
    assert.equal(requestBody.action, 'concise')
    assert.equal(requestBody.instruction, '')
  } finally {
    store.clearReview()
    globalThis.fetch = originalFetch
  }
})

test('a heading replacement does not gain a second hash marker', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({
    ok: true,
    text: '# New Heading',
    provider: 'test',
    model: 'test',
  }), { status: 200, headers: { 'content-type': 'application/json' } })
  try {
    store.newFile()
    const doc = store.activeDoc()
    store.updateDocContent(doc.id, '# Old Heading', null, { from: 2, to: 13, text: 'Old Heading', coords: null }, { line: 1, column: 1 })
    await store.runAI('polish')
    assert.equal(store.activeDoc().content, '# New Heading')
    assert.equal(store.getState().review.after, 'New Heading')
    store.revertLastChange()
    assert.equal(store.activeDoc().content, '# Old Heading')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('batch annotations apply every reviewed region in one undoable edit', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => {
    assert.match(String(url), /\/api\/ai-notepad\/ai-batch$/)
    return new Response(JSON.stringify({ ok: true, replacements: [{ id: 0, replacement: 'Hi' }, { id: 1, replacement: 'Earth' }] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }
  try {
    store.newFile()
    let doc = store.activeDoc()
    store.updateDocContent(doc.id, 'Hello world', null, { from: 0, to: 5, text: 'Hello', coords: null }, { line: 1, column: 1 })
    store.setAIInstruction('make it short')
    store.addAnnotation()
    store.updateDocContent(doc.id, 'Hello world', null, { from: 6, to: 11, text: 'world', coords: null }, { line: 1, column: 1 })
    store.setAIInstruction('use the planet name')
    store.addAnnotation()
    doc = store.activeDoc()
    assert.equal(doc.annotations.length, 2)
    await store.runBatch()
    assert.equal(store.getState().review.kind, 'batch')
    store.acceptReview()
    assert.equal(store.activeDoc().content, 'Hi Earth')
    assert.equal(store.activeDoc().annotations.length, 0)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('a stale selection is never replaced', async () => {
  store.newFile()
  const doc = store.activeDoc()
  store.updateDocContent(doc.id, 'Hello world', null, { from: 0, to: 5, text: 'Hello', coords: null }, { line: 1, column: 6 })
  store.setReview({
    kind: 'single',
    docId: doc.id,
    from: 0,
    to: 5,
    before: 'Hello',
    after: 'REWRITTEN',
    baseContent: 'Hello world',
    scope: 'selection',
  })
  store.updateDocContent(doc.id, 'Hello brave world', null, null, { line: 1, column: 1 })
  store.acceptReview()
  assert.equal(store.activeDoc().content, 'Hello brave world')
})
