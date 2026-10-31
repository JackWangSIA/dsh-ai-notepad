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

test('selection AI review only changes the selected range after acceptance', async () => {
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
    await store.runAI('polish')
    doc = store.activeDoc()
    assert.equal(store.getState().review.before, 'Hello')
    assert.equal(store.getState().review.after, 'REWRITTEN')
    assert.equal(doc.content, 'Hello world')
    store.acceptReview()
    doc = store.activeDoc()
    assert.equal(doc.content, 'REWRITTEN world')
    assert.equal(doc.dirty, true)
    assert.equal(store.getState().review, null)
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
