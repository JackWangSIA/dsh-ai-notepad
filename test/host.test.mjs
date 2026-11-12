import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import iconv from 'iconv-lite'
import {
  detectText,
  encodeText,
  readDocument,
  writeDocument,
  apply,
  _internals,
} from '../lib/index.js'

async function tempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), 'ainp-test-'))
}

test('detects common text encodings and rejects binary data', () => {
  const utf8 = detectText(Buffer.from('你好\r\nworld'))
  assert.equal(utf8.content, '你好\r\nworld')
  assert.equal(utf8.encoding, 'utf-8')
  assert.equal(utf8.eol, '\r\n')

  const bom = detectText(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('BOM')]))
  assert.equal(bom.encoding, 'utf-8-bom')
  assert.equal(bom.bom, true)
  assert.equal(bom.content, 'BOM')

  const gbk = detectText(iconv.encode('中文测试', 'gbk'))
  assert.equal(gbk.encoding, 'gb18030')
  assert.equal(gbk.content, '中文测试')

  const win1252 = detectText(Buffer.from([0x63, 0x61, 0x66, 0xe9]))
  assert.equal(win1252.encoding, 'windows-1252')
  assert.equal(win1252.content, 'café')

  const utf16le = detectText(Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('你好', 'utf16le')]))
  assert.equal(utf16le.encoding, 'utf-16le')
  assert.equal(utf16le.content, '你好')

  const utf16be = detectText(Buffer.concat([Buffer.from([0xfe, 0xff]), Buffer.from('你好', 'utf16le').swap16()]))
  assert.equal(utf16be.encoding, 'utf-16be')
  assert.equal(utf16be.content, '你好')

  assert.equal(detectText(Buffer.from([0, 1, 2, 3, 0, 255])).binary, true)
})

test('round-trips preserved encodings, BOM and line endings', async () => {
  const dir = await tempDir()
  try {
    const file = path.join(dir, 'gbk.txt')
    await fs.writeFile(file, iconv.encode('第一行\r\n第二行', 'gbk'))
    const before = await readDocument(file)
    assert.equal(before.encoding, 'gb18030')
    assert.equal(before.eol, '\r\n')
    await writeDocument({
      path: file,
      content: '第一行\r\n第二行\r\n新增',
      encoding: before.encoding,
      eol: before.eol,
      baseHash: before.hash,
    })
    assert.equal(iconv.decode(await fs.readFile(file), 'gbk'), '第一行\r\n第二行\r\n新增')

    const utf16 = path.join(dir, 'utf16.txt')
    await fs.writeFile(utf16, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('你好\n世界', 'utf16le')]))
    const u = await readDocument(utf16)
    await writeDocument({
      path: utf16,
      content: u.content + '!',
      encoding: u.encoding,
      eol: u.eol,
      bom: u.bom,
      baseHash: u.hash,
    })
    const bytes = await fs.readFile(utf16)
    assert.deepEqual([...bytes.subarray(0, 2)], [0xff, 0xfe])
    assert.equal(bytes.subarray(2).toString('utf16le'), '你好\n世界!')
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('rejects stale writes and binary open', async () => {
  const dir = await tempDir()
  try {
    const file = path.join(dir, 'a.txt')
    await fs.writeFile(file, 'one')
    const before = await readDocument(file)
    await fs.writeFile(file, 'two')
    await assert.rejects(
      () => writeDocument({ path: file, content: 'three', encoding: 'utf-8', eol: '\n', baseHash: before.hash }),
      error => error.code === 'conflict',
    )
    assert.equal(await fs.readFile(file, 'utf8'), 'two')

    const bin = path.join(dir, 'b.bin')
    await fs.writeFile(bin, Buffer.from([0, 1, 2, 3, 255, 0]))
    await assert.rejects(() => readDocument(bin), error => error.code === 'binary-file')
  } finally {
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('host routes expose read/write, AI, batch and inbox operations', async () => {
  const dir = await tempDir()
  const previousHome = process.env.DSH_HOME
  process.env.DSH_HOME = dir
  const routes = new Map()
  let cleanup = async () => {}
  const llm = {
    async *stream(options) {
      const text = options.messages[0].content[0].text
      if (text.includes('JSON 数组')) {
        yield { type: 'text-delta', text: '[{"id":0,"replacement":"B"}]' }
      } else {
        yield { type: 'text-delta', text: 'REWRITTEN' }
      }
      yield { type: 'finish', reason: { kind: 'stop' } }
    },
  }
  const ctx = {
    connection: {
      fetch: {
        register(route) {
          routes.set(route.path, route)
          return async () => {}
        },
      },
    },
    get(name) {
      if (name === 'llm') return llm
      if (name === 'agentDefaultModel') return { currentSelection: () => ({ provider: 'test', model: 'test-model' }) }
      return undefined
    },
    effect(fn) {
      cleanup = fn()
    },
  }
  apply(ctx)
  try {
    const call = async (suffix, body) => {
      const route = routes.get('/api/ai-notepad' + suffix.split('?')[0])
      assert.ok(route, 'route exists: ' + suffix)
      const request = new Request('http://127.0.0.1/api/ai-notepad' + suffix, body === undefined ? {
        method: 'GET',
      } : {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      const response = await route.fetch(request)
      const json = await response.json()
      return { response, json }
    }

    const file = path.join(dir, 'doc.txt')
    await fs.writeFile(file, 'A\r\nB')

    const status = await call('/status')
    assert.equal(status.response.status, 200)
    assert.equal(status.json.ok, true)
    assert.equal(status.json.model.model, 'test-model')

    const read = await call('/read', { path: file })
    assert.equal(read.json.content, 'A\r\nB')
    assert.equal(read.json.eol, '\r\n')

    const write = await call('/write', {
      path: file,
      content: 'A\r\nB\r\nC',
      encoding: read.json.encoding,
      eol: read.json.eol,
      baseHash: read.json.hash,
    })
    assert.equal(write.json.ok, true)
    assert.equal(await fs.readFile(file, 'utf8'), 'A\r\nB\r\nC')

    const ai = await call('/ai', {
      action: 'polish',
      scope: 'selection',
      documentText: 'A\nB',
      selectedText: 'B',
      before: 'A\n',
      after: '',
    })
    assert.equal(ai.json.text, 'REWRITTEN')

    const batch = await call('/ai-batch', {
      documentText: 'A\nB',
      annotations: [{ id: 0, action: 'custom', instruction: 'replace', quote: 'B' }],
    })
    assert.deepEqual(batch.json.replacements, [{ id: 0, replacement: 'B' }])

    const enqueue = await call('/enqueue', { paths: [file] })
    assert.equal(enqueue.json.rev > 0, true)
    const inbox = await call('/inbox?since=0')
    assert.ok(inbox.json.files.some(item => item.path === file))

    const site = path.join(dir, 'site')
    const assets = path.join(site, 'assets')
    await fs.mkdir(assets, { recursive: true })
    const css = path.join(assets, 'theme.css')
    const image = path.join(assets, 'bg.png')
    await fs.writeFile(css, 'body{background:url("./bg.png")}')
    await fs.writeFile(image, Buffer.from([0x89, 0x50, 0x4e, 0x47]))
    const preview = await call('/preview-html', {
      html: '<link rel="stylesheet" href="./assets/theme.css"><img src="./assets/bg.png">',
      basePath: path.join(site, 'index.html'),
    })
    assert.match(preview.json.html, /\/api\/ai-notepad\/asset\?path=/)
    assert.ok(preview.json.html.includes(encodeURIComponent(css)))

    const assetRoute = routes.get('/api/ai-notepad/asset')
    assert.ok(assetRoute)
    const assetResponse = await assetRoute.fetch(new Request('http://127.0.0.1/api/ai-notepad/asset?path=' + encodeURIComponent(css)))
    assert.match(assetResponse.headers.get('content-type') || '', /text\/css/)
    assert.ok((await assetResponse.text()).includes(encodeURIComponent(image)))
  } finally {
    await cleanup()
    if (previousHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousHome
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('custom instructions never combine with a preset action', () => {
  const custom = _internals.buildSelectionPrompt({
    action: 'custom',
    instruction: '改成正式语气',
    documentText: 'Hello world',
    selectedText: 'Hello',
    before: '',
    after: ' world',
  })
  assert.match(custom, /改成正式语气/)
  assert.doesNotMatch(custom, /润色/)
  const preset = _internals.buildSelectionPrompt({
    action: 'polish',
    instruction: '这一句不应出现',
    documentText: 'Hello world',
    selectedText: 'Hello',
    before: '',
    after: ' world',
  })
  assert.doesNotMatch(preset, /这一句不应出现/)
  const trailing = '\n\nThis is the following paragraph that should not be copied.'
  assert.equal(
    _internals.trimSelectionLeak('Hello there' + trailing, { after: trailing }),
    'Hello there',
  )
})

test('VBS launcher writes a queue that the Host inbox consumes', async () => {
  if (process.platform !== 'win32') return
  const dir = await tempDir()
  const previousHome = process.env.DSH_HOME
  process.env.DSH_HOME = dir
  const routes = new Map()
  let cleanup = async () => {}
  const ctx = {
    connection: { fetch: { register(route) { routes.set(route.path, route); return async () => {} } } },
    get() { return undefined },
    effect(fn) { cleanup = fn() },
  }
  apply(ctx)
  try {
    const one = path.join(dir, 'one.txt')
    const two = path.join(dir, 'two.md')
    await fs.writeFile(one, 'one')
    await fs.writeFile(two, 'two')
    const launcher = path.resolve('lib/scripts/launch.vbs')
    await promisify(execFile)('wscript.exe', ['//B', '//NoLogo', launcher, one, two], {
      env: { ...process.env, DSH_HOME: dir, AINP_NO_LAUNCH: '1' },
      windowsHide: true,
    })
    await new Promise(resolve => setTimeout(resolve, 1600))
    const route = routes.get('/api/ai-notepad/inbox')
    const response = await route.fetch(new Request('http://127.0.0.1/api/ai-notepad/inbox?since=0'))
    const json = await response.json()
    assert.ok(json.files.some(item => item.path === one))
    assert.ok(json.files.some(item => item.path === two))
  } finally {
    await cleanup()
    if (previousHome === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previousHome
    await fs.rm(dir, { recursive: true, force: true })
  }
})

test('GB18030 refuses unrepresentable characters instead of writing question marks', () => {
  assert.throws(() => encodeText('\uD800', 'gb18030'), error => error.code === 'unrepresentable')
})
