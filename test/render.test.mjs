import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('NotepadApp and settings page render without throwing', async () => {
  globalThis.localStorage = {
    getItem() { return null },
    setItem() {},
    removeItem() {},
  }
  Object.defineProperty(globalThis, 'navigator', { value: { language: 'zh-CN', userAgent: 'test' }, configurable: true })
  Object.defineProperty(globalThis, 'window', { value: {
    addEventListener() {},
    removeEventListener() {},
    confirm() { return true },
    innerWidth: 1200,
    innerHeight: 800,
  }, configurable: true })
  globalThis.document = {
    documentElement: { style: { tabSize: '' } },
    body: { style: { tabSize: '' }, appendChild() {}, removeChild() {} },
    head: { appendChild() {} },
    createElement() { return { style: {}, setAttribute() {}, appendChild() {} } },
    querySelector() { return null },
    addEventListener() {},
    removeEventListener() {},
  }
  const outfile = path.join(root, 'test', '.render-bundle.mjs')
  await build({
    absWorkingDir: root,
    entryPoints: ['test/render-entry.jsx'],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    external: ['react', 'react-dom/server'],
    logLevel: 'silent',
  })
  const module = await import('file://' + outfile.replace(/\\/g, '/') + '?v=' + Date.now())
  const html = module.renderApp()
  assert.match(html, /AI Notepad/)
  assert.match(html, /未命名|Untitled/)
  const settings = module.renderSettings()
  assert.match(settings, /AI Notepad/)

  const review = module.renderReview()
  assert.match(review, /AI (修改对比|change review)|np-diff/)

  const preview = module.renderPreview()
  assert.match(preview, /<h1>Heading<\/h1>/)
  assert.match(preview, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.doesNotMatch(preview, /<script>alert/)

  const about = module.renderAbout()
  assert.match(about, /关于 AI Notepad|About AI Notepad/)
  assert.match(about, /vdev/)
  assert.match(about, /选区 AI|Selection AI/)
  assert.match(about, /Ctrl\+E/)
})
