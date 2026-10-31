import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
const React = {
  Component: class Component {
    constructor(props) { this.props = props; this.state = {} }
  },
  createElement() { return null },
  useRef() { return { current: null } },
  useState(value) { return [value, () => {}] },
  useReducer(value) { return [value, () => {}] },
  useEffect() {},
  useMemo(fn) { return fn() },
  useSyncExternalStore() { return 0 },
  Fragment: 'fragment',
}
const jsxRuntime = { jsx() { return null }, jsxs() { return null }, Fragment: 'fragment' }

test('built client is a valid classic ModuleLoader plugin and exports apply/inject', () => {
  const code = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  let definition = null
  const window = {
    __ModuleLoader__: {
      load(value) { definition = value },
    },
  }
  const context = vm.createContext({
    window,
    globalThis: null,
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    URL,
    TextEncoder,
    TextDecoder,
    crypto: globalThis.crypto,
    navigator: { language: 'zh-CN' },
    localStorage: {
      getItem() { return null },
      setItem() {},
      removeItem() {},
    },
  })
  context.globalThis = context
  vm.runInContext(code, context, { filename: 'client.js' })
  assert.ok(definition)
  assert.equal(definition.id, 'dsh-ai-notepad')
  const module = { exports: {} }
  const exports = definition.factory(name => {
    if (name === 'react') return React
    if (name === 'react/jsx-runtime') return jsxRuntime
    if (name === 'react-dom') return {}
    if (name === 'react-dom/client') return {}
    throw new Error('unexpected external: ' + name)
  })
  assert.equal(typeof exports, 'object')
  assert.equal(typeof exports.apply, 'function')
  assert.deepEqual(Array.from(exports.inject), ['slots'])
  assert.equal(exports.name, 'ai-notepad')
})

test('client apply registers the panel, icon and settings page', async () => {
  const code = fs.readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  let definition = null
  const style = { setAttribute() {}, remove() {}, textContent: '' }
  const registrations = []
  const cleanups = []
  const document = {
    head: { appendChild() {} },
    body: { appendChild() {}, removeChild() {}, style: { tabSize: '' } },
    documentElement: { style: { tabSize: '' } },
    querySelector() { return null },
    createElement() { return style },
    addEventListener() {},
    removeEventListener() {},
  }
  const window = {
    __ModuleLoader__: { load(value) { definition = value } },
    addEventListener() {},
    removeEventListener() {},
    confirm() { return true },
    innerWidth: 1200,
    innerHeight: 800,
  }
  const context = vm.createContext({
    window,
    globalThis: null,
    console,
    document,
    localStorage: { getItem() { return null }, setItem() {}, removeItem() {} },
    navigator: { language: 'zh-CN', userAgent: 'test', clipboard: { writeText: async () => {} } },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    fetch: async () => ({ ok: true, json: async () => ({ ok: true, fonts: [], associations: null, model: null, rev: 0, files: [] }) }),
    URL,
    TextEncoder,
    TextDecoder,
    crypto: globalThis.crypto,
  })
  context.globalThis = context
  vm.runInContext(code, context, { filename: 'client.js' })
  const module = { exports: definition.factory(name => {
    if (name === 'react') return React
    if (name === 'react/jsx-runtime') return jsxRuntime
    return {}
  }) }
  const ctx = {
    effect(fn) {
      const dispose = fn()
      cleanups.push(typeof dispose === 'function' ? dispose : () => {})
    },
    slots: {
      inject(key, callback) {
        callback()
        return () => {}
      },
      register(def, component) {
        registrations.push({ key: def.key || def.id, name: def.name, component })
        return () => {}
      },
    },
    get(name) {
      if (name === 'layout') return { selectPanel() {} }
      return undefined
    },
  }
  try {
    module.exports.apply(ctx)
    assert.deepEqual(registrations.map(item => item.key).sort(), ['ai-notepad', 'ai-notepad', 'ai-notepad-settings'])
    assert.deepEqual(registrations.map(item => item.name).sort(), ['main', 'settings.section', 'sidebar.panellist'])
    await Promise.resolve()
  } finally {
    for (const cleanup of cleanups) {
      try { cleanup() } catch {}
    }
  }
})
