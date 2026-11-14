/**
 * AI Notepad — Host half.
 *
 * Responsibilities:
 *  - bounded, encoding-aware local file read/write with hash-based conflict guards;
 *  - selection/document AI calls through the Harness `llm` service (no extra key);
 *  - Windows per-user file association registration and the external-open inbox;
 *  - native file/font pickers on Windows.
 *
 * The browser half never touches the filesystem directly. Every route below is
 * mounted on the Connection shared `/api` channel, which is authenticated by the
 * same browser cookie / Origin fence as the rest of the Harness API.
 */
import { promises as fsp } from 'node:fs'
import * as fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { execFile } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import iconv from 'iconv-lite'

export const name = 'ai-notepad'
export const inject = ['connection']

const API_BASE = '/api/ai-notepad'
const MAX_FILE_BYTES = 64 * 1024 * 1024
const MAX_REQUEST_BYTES = 128 * 1024 * 1024
const LARGE_FILE_BYTES = 16 * 1024 * 1024
const MAX_PREVIEW_CACHE_BYTES = 32 * 1024 * 1024
const MAX_PREVIEW_CACHE_ENTRIES = 2
const htmlPreviewCache = new Map()
const MAX_AI_CONTEXT = 120_000
const PROG_ID = 'DSH.AINotepad'
const APP_NAME = 'DeepSeek Harness AI Notepad'
const DEFAULT_EXTENSIONS = [
  'txt', 'text', 'log', 'md', 'markdown', 'mdx',
  'json', 'xml', 'yaml', 'yml', 'csv', 'tsv', 'toml',
  'ini', 'cfg', 'conf', 'properties', 'env',
  'html', 'htm', 'css', 'js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx', 'vue', 'svelte',
  'py', 'c', 'h', 'cpp', 'cc', 'hpp', 'cs', 'java', 'go', 'rs', 'sql',
  'sh', 'bash', 'zsh', 'bat', 'cmd', 'ps1', 'psm1',
]

const SCRIPT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'scripts')
const SCRIPTS = {
  open: path.join(SCRIPT_DIR, 'pick-open.ps1'),
  save: path.join(SCRIPT_DIR, 'pick-save.ps1'),
  fonts: path.join(SCRIPT_DIR, 'fonts.ps1'),
  launcher: path.join(SCRIPT_DIR, 'launch.vbs'),
}

class ApiError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.code = code
    this.status = status
  }
}

function fail(code, message, status = 400) {
  throw new ApiError(code, message, status)
}

function dataDir() {
  const home = process.env.DSH_HOME && process.env.DSH_HOME.trim() !== ''
    ? process.env.DSH_HOME
    : path.join(os.homedir(), '.dsh')
  return path.join(home, 'ai-notepad')
}

function inboxDir() {
  return path.join(dataDir(), 'inbox')
}

function statePath() {
  return path.join(dataDir(), 'state.json')
}

const AUTOSAVE_MAX_ENTRIES = 20
const AUTOSAVE_MAX_BYTES = 64 * 1024 * 1024

function autosaveDir() {
  return path.join(dataDir(), 'autosave')
}

function autosaveId(value) {
  const id = String(value || '').trim()
  if (!/^[A-Za-z0-9_-]{1,120}$/.test(id)) fail('bad-autosave-id', '无效的自动保存标识')
  return id
}

function autosaveFile(id, extension) {
  return path.join(autosaveDir(), id + extension)
}

function autosaveMeta(body, id, content) {
  return {
    version: 1,
    id,
    name: String(body.name || '未命名.md').slice(0, 260),
    path: typeof body.path === 'string' ? body.path.slice(0, 2048) : null,
    encoding: typeof body.encoding === 'string' ? body.encoding.slice(0, 40) : 'utf-8',
    bom: body.bom === true,
    eol: body.eol === '\r\n' ? '\r\n' : '\n',
    size: Buffer.byteLength(content, 'utf8'),
    updatedAt: Date.now(),
  }
}

async function pruneAutosaves() {
  let names
  try { names = await fsp.readdir(autosaveDir()) } catch { return }
  const entries = []
  for (const name of names) {
    if (!name.endsWith('.json')) continue
    try {
      const meta = JSON.parse(await fsp.readFile(path.join(autosaveDir(), name), 'utf8'))
      const stat = await fsp.stat(autosaveFile(meta.id, '.txt'))
      entries.push({ id: meta.id, updatedAt: Number(meta.updatedAt) || 0, size: stat.size })
    } catch {}
  }
  entries.sort((a, b) => b.updatedAt - a.updatedAt)
  let total = 0
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    total += entry.size
    if (index < AUTOSAVE_MAX_ENTRIES && total <= AUTOSAVE_MAX_BYTES) continue
    await dropAutosave(entry.id).catch(() => {})
  }
}

async function saveAutosave(body) {
  const id = autosaveId(body.id)
  const content = typeof body.content === 'string' ? body.content : ''
  if (Buffer.byteLength(content, 'utf8') > MAX_FILE_BYTES) fail('too-large', '自动保存内容超过 64 MiB', 413)
  await fsp.mkdir(autosaveDir(), { recursive: true })
  const contentTemp = autosaveFile(id, '.txt.tmp-' + crypto.randomBytes(4).toString('hex'))
  const metaTemp = autosaveFile(id, '.json.tmp-' + crypto.randomBytes(4).toString('hex'))
  const meta = autosaveMeta(body, id, content)
  await fsp.writeFile(contentTemp, content, 'utf8')
  await fsp.rename(contentTemp, autosaveFile(id, '.txt'))
  await fsp.writeFile(metaTemp, JSON.stringify(meta), 'utf8')
  await fsp.rename(metaTemp, autosaveFile(id, '.json'))
  await pruneAutosaves()
  return { ok: true, id, updatedAt: meta.updatedAt, size: meta.size }
}

async function listAutosaves() {
  let names
  try { names = await fsp.readdir(autosaveDir()) } catch { return { ok: true, entries: [] } }
  const entries = []
  for (const name of names) {
    if (!name.endsWith('.json')) continue
    try {
      const meta = JSON.parse(await fsp.readFile(path.join(autosaveDir(), name), 'utf8'))
      const stat = await fsp.stat(autosaveFile(meta.id, '.txt'))
      entries.push({
        id: meta.id,
        name: meta.name || '未命名.md',
        path: meta.path || null,
        encoding: meta.encoding || 'utf-8',
        bom: meta.bom === true,
        eol: meta.eol === '\r\n' ? '\r\n' : '\n',
        updatedAt: Number(meta.updatedAt) || stat.mtimeMs,
        size: stat.size,
      })
    } catch {}
  }
  entries.sort((a, b) => b.updatedAt - a.updatedAt)
  return { ok: true, entries: entries.slice(0, AUTOSAVE_MAX_ENTRIES) }
}

async function readAutosave(body) {
  const id = autosaveId(body.id)
  let meta
  try {
    meta = JSON.parse(await fsp.readFile(autosaveFile(id, '.json'), 'utf8'))
  } catch {
    fail('autosave-missing', '自动保存内容不存在', 404)
  }
  const content = await fsp.readFile(autosaveFile(id, '.txt'), 'utf8')
  return {
    ok: true,
    entry: {
      id,
      name: meta.name || '未命名.md',
      path: meta.path || null,
      encoding: meta.encoding || 'utf-8',
      bom: meta.bom === true,
      eol: meta.eol === '\r\n' ? '\r\n' : '\n',
      updatedAt: Number(meta.updatedAt) || Date.now(),
      size: Buffer.byteLength(content, 'utf8'),
    },
    content,
  }
}

async function dropAutosave(id) {
  id = autosaveId(id)
  await Promise.all([
    fsp.rm(autosaveFile(id, '.txt'), { force: true }),
    fsp.rm(autosaveFile(id, '.json'), { force: true }),
  ])
  return { ok: true }
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex')
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeExtension(value) {
  const ext = String(value || '').trim().replace(/^\*?\./, '').toLowerCase()
  if (!/^[a-z0-9][a-z0-9._-]{0,31}$/.test(ext)) return null
  return ext
}

function normalizeExtensions(values) {
  const source = Array.isArray(values) ? values : DEFAULT_EXTENSIONS
  const seen = new Set()
  const out = []
  for (const value of source) {
    const ext = normalizeExtension(value)
    if (ext === null || seen.has(ext)) continue
    seen.add(ext)
    out.push(ext)
  }
  return out.length > 0 ? out : DEFAULT_EXTENSIONS.slice()
}

function toPosixPath(value) {
  return String(value || '').replace(/\\/g, '/')
}

function baseName(filePath) {
  const value = String(filePath || '').replace(/[\\/]+$/, '')
  const at = Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\'))
  return at === -1 ? value : value.slice(at + 1)
}

function assertFilePath(filePath) {
  if (typeof filePath !== 'string' || filePath.trim() === '' || filePath.length > 32767 || filePath.includes('\0')) {
    fail('bad-path', '文件路径无效')
  }
  if (!path.isAbsolute(filePath)) fail('relative-path', '只接受绝对文件路径')
  return filePath
}

function eolOf(text) {
  const crlf = (text.match(/\r\n/g) || []).length
  const withoutCrlf = text.replace(/\r\n/g, '')
  const lf = (withoutCrlf.match(/\n/g) || []).length
  return crlf > lf ? '\r\n' : '\n'
}

function normalizeEol(text, eol) {
  const lf = String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  return eol === '\r\n' ? lf.replace(/\n/g, '\r\n') : lf
}

function decodeUtf16be(bytes) {
  const swapped = Buffer.allocUnsafe(bytes.length)
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    swapped[i] = bytes[i + 1]
    swapped[i + 1] = bytes[i]
  }
  return new TextDecoder('utf-16le', { fatal: true }).decode(swapped)
}

function encodeUtf16be(text) {
  const le = Buffer.from(text, 'utf16le')
  const out = Buffer.allocUnsafe(le.length)
  for (let i = 0; i + 1 < le.length; i += 2) {
    out[i] = le[i + 1]
    out[i + 1] = le[i]
  }
  return out
}

function hasUtf16Pattern(bytes) {
  if (bytes.length < 4) return false
  const sample = bytes.subarray(0, Math.min(bytes.length, 4096))
  let zeroEven = 0
  let zeroOdd = 0
  for (let i = 0; i + 1 < sample.length; i += 2) {
    if (sample[i] === 0) zeroEven++
    if (sample[i + 1] === 0) zeroOdd++
  }
  const pairs = Math.floor(sample.length / 2)
  return pairs > 3 && (zeroEven / pairs > 0.55 || zeroOdd / pairs > 0.55)
}

function binaryByBytes(bytes) {
  const sample = bytes.subarray(0, Math.min(bytes.length, 8192))
  if (sample.length === 0) return false
  let control = 0
  for (const byte of sample) {
    if (byte === 0) return true
    if (byte < 9 || (byte > 13 && byte < 32) || byte === 127) control++
  }
  return control > Math.max(8, sample.length * 0.01)
}

/**
 * Detect a text encoding, BOM and line ending. Returns `{binary:true,reason}`
 * for data that must not enter the editor.
 */
export function detectText(bytes, { fileName = '' } = {}) {
  if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes)
  if (bytes.length === 0) return { content: '', encoding: 'utf-8', bom: false, eol: '\n' }
  if (bytes.length > MAX_FILE_BYTES) fail('too-large', '文件超过 64 MiB 上限', 413)

  let encoding
  let bom = false
  let content

  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    encoding = 'utf-8-bom'
    bom = true
    try {
      content = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(3))
    } catch {
      return { binary: true, reason: 'invalid-utf8' }
    }
  } else if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    encoding = 'utf-16le'
    bom = true
    try {
      content = new TextDecoder('utf-16le', { fatal: true }).decode(bytes.subarray(2))
    } catch {
      return { binary: true, reason: 'invalid-utf16' }
    }
  } else if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    encoding = 'utf-16be'
    bom = true
    try {
      content = decodeUtf16be(bytes.subarray(2))
    } catch {
      return { binary: true, reason: 'invalid-utf16' }
    }
  } else if (binaryByBytes(bytes)) {
    if (!hasUtf16Pattern(bytes)) return { binary: true, reason: 'binary-bytes' }
    // UTF-16 without a BOM. Guess byte order from zero-byte positions.
    let zeroEven = 0
    let zeroOdd = 0
    for (let i = 0; i + 1 < bytes.length; i += 2) {
      if (bytes[i] === 0) zeroEven++
      if (bytes[i + 1] === 0) zeroOdd++
    }
    encoding = zeroOdd >= zeroEven ? 'utf-16le' : 'utf-16be'
    try {
      content = encoding === 'utf-16le'
        ? new TextDecoder('utf-16le', { fatal: true }).decode(bytes)
        : decodeUtf16be(bytes)
    } catch {
      return { binary: true, reason: 'invalid-utf16' }
    }
  } else {
    try {
      content = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
      encoding = 'utf-8'
    } catch {
      try {
        content = new TextDecoder('gb18030', { fatal: true }).decode(bytes)
        encoding = 'gb18030'
      } catch {
        try {
          content = new TextDecoder('windows-1252', { fatal: true }).decode(bytes)
          encoding = 'windows-1252'
        } catch {
          return { binary: true, reason: 'unsupported-encoding' }
        }
      }
    }
  }

  if (content.includes('\u0000')) return { binary: true, reason: 'nul-character' }
  const sample = content.slice(0, 8192)
  let controls = 0
  for (const char of sample) {
    const code = char.codePointAt(0)
    if (code < 9 || (code > 13 && code < 32) || code === 127) controls++
  }
  if (controls > Math.max(0, sample.length * 0.005)) return { binary: true, reason: 'control-characters' }

  return { content, encoding, bom, eol: eolOf(content), name: fileName ? baseName(fileName) : undefined }
}

/** Encode editor text back into the original encoding, preserving BOM. */
export function encodeText(content, encoding = 'utf-8', bom = false) {
  const text = String(content)
  switch (encoding) {
    case 'utf-8':
      return bom ? Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(text, 'utf8')]) : Buffer.from(text, 'utf8')
    case 'utf-8-bom':
      return Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(text, 'utf8')])
    case 'utf-16le':
      return Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, 'utf16le')])
    case 'utf-16be':
      return Buffer.concat([Buffer.from([0xfe, 0xff]), encodeUtf16be(text)])
    case 'gb18030': {
      const encoded = iconv.encode(text, 'gb18030')
      const roundTrip = iconv.decode(encoded, 'gb18030')
      if (roundTrip !== text) {
        fail('unrepresentable', '当前文本包含 GB18030 无法表示的字符；请另存为 UTF-8', 422)
      }
      return encoded
    }
    case 'windows-1252': {
      const encoded = iconv.encode(text, 'windows-1252')
      const roundTrip = iconv.decode(encoded, 'windows-1252')
      if (roundTrip !== text) {
        fail('unrepresentable', '当前文本包含 Windows-1252 无法表示的字符；请另存为 UTF-8', 422)
      }
      return encoded
    }
    default:
      fail('bad-encoding', `不支持的编码：${encoding}`)
  }
}

async function readAllBytes(filePath, signal) {
  const stat = await fsp.stat(filePath)
  if (!stat.isFile()) fail('not-a-file', '只能打开普通文件', 415)
  if (stat.size > MAX_FILE_BYTES) fail('too-large', '文件超过 64 MiB 上限', 413)
  const bytes = await fsp.readFile(filePath, signal ? { signal } : undefined)
  if (bytes.length > MAX_FILE_BYTES) fail('too-large', '文件超过 64 MiB 上限', 413)
  return { bytes, stat }
}

export async function readDocument(filePath, signal) {
  const absolute = assertFilePath(filePath)
  let real
  try {
    real = await fsp.realpath(absolute)
  } catch (error) {
    if (error?.code === 'ENOENT') fail('not-found', '文件不存在', 404)
    throw error
  }
  const { bytes, stat } = await readAllBytes(real, signal)
  const detected = detectText(bytes, { fileName: real })
  if (detected.binary) {
    fail('binary-file', `检测到二进制内容（${detected.reason || 'binary'}），已拒绝打开以保护文件`, 415)
  }
  let writable = true
  try {
    await fsp.access(real, fs.constants.W_OK)
  } catch {
    writable = false
  }
  return {
    ok: true,
    path: real,
    name: baseName(real),
    content: detected.content,
    encoding: detected.encoding,
    bom: detected.bom,
    eol: detected.eol,
    hash: sha256(bytes),
    size: bytes.length,
    large: bytes.length > LARGE_FILE_BYTES,
    mtimeMs: stat.mtimeMs,
    readOnly: !writable,
  }
}

async function atomicWrite(filePath, bytes, mode) {
  const dir = path.dirname(filePath)
  const temp = path.join(dir, `.${baseName(filePath)}.ainp-${crypto.randomBytes(6).toString('hex')}.tmp`)
  let handle
  try {
    handle = await fsp.open(temp, 'wx', mode || 0o666)
    await handle.writeFile(bytes)
    await handle.sync()
    await handle.close()
    handle = undefined
    await fsp.rename(temp, filePath)
  } catch (error) {
    if (handle) {
      await handle.close().catch(() => {})
    }
    await fsp.unlink(temp).catch(() => {})
    if (error?.code === 'EPERM' || error?.code === 'EACCES') {
      fail('permission-denied', '没有写入该文件的权限', 403)
    }
    throw error
  }
}

export async function writeDocument(input, signal) {
  if (!isObject(input)) fail('bad-request', '请求体必须是对象')
  const requested = assertFilePath(input.path)
  const content = input.content
  if (typeof content !== 'string') fail('bad-request', 'content 必须是字符串')
  if (content.includes('\u0000')) fail('not-text', '文本包含 NUL 字符，拒绝写入')
  const encoding = typeof input.encoding === 'string' ? input.encoding : 'utf-8'
  const eol = input.eol === '\r\n' ? '\r\n' : '\n'
  const normalized = normalizeEol(content, eol)
  const bytes = encodeText(normalized, encoding, input.bom === true)
  if (bytes.length > MAX_FILE_BYTES) fail('too-large', '文件超过 64 MiB 上限', 413)

  let real
  let exists = false
  try {
    real = await fsp.realpath(requested)
    exists = true
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
    if (input.create !== true) fail('not-found', '文件不存在；新建文件请使用另存为', 404)
    const parent = await fsp.realpath(path.dirname(requested)).catch(() => path.dirname(requested))
    real = path.join(parent, path.basename(requested))
    exists = fs.existsSync(real)
  }

  if (exists) {
    const current = await readAllBytes(real, signal)
    const currentHash = sha256(current.bytes)
    if (typeof input.baseHash === 'string' && input.baseHash !== '' && currentHash !== input.baseHash) {
      fail('conflict', '文件在编辑期间已被其他程序修改；未写入。请重新加载或另存为', 409)
    }
    if (input.baseHash === null && input.create !== true && input.overwrite !== true) {
      fail('exists', '目标文件已存在', 409)
    }
    await atomicWrite(real, bytes, current.stat.mode & 0o777)
  } else {
    await atomicWrite(real, bytes, 0o666)
  }

  const stat = await fsp.stat(real)
  return {
    ok: true,
    path: real,
    name: baseName(real),
    hash: sha256(bytes),
    size: bytes.length,
    encoding,
    bom: encoding === 'utf-8-bom' || encoding === 'utf-16le' || encoding === 'utf-16be' || input.bom === true,
    eol,
    mtimeMs: stat.mtimeMs,
  }
}

function execFileAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { windowsHide: true, maxBuffer: 4 * 1024 * 1024, ...options }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = String(stdout || '')
        error.stderr = String(stderr || '')
        reject(error)
        return
      }
      resolve({ stdout: String(stdout || ''), stderr: String(stderr || '') })
    })
  })
}

function powershellPath() {
  const root = process.env.SystemRoot || process.env.WINDIR || 'C:\\Windows'
  const full = path.join(root, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  return fs.existsSync(full) ? full : 'powershell.exe'
}

function parseJsonOutput(stdout) {
  const text = String(stdout || '').trim()
  if (text === '') return null
  try { return JSON.parse(text) } catch {}
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  for (let i = lines.length - 1; i >= 0; i--) {
    try { return JSON.parse(lines.slice(i).join('\n')) } catch {}
  }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)) } catch {}
  }
  return null
}

async function commandExists(command) {
  try {
    const finder = process.platform === 'win32' ? 'where.exe' : 'which'
    await execFileAsync(finder, [command], { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

function splitDialogPaths(stdout, separator = /\r?\n/) {
  return String(stdout || '')
    .split(separator)
    .map(value => value.trim())
    .filter(Boolean)
}

async function runLinuxPicker(mode, suggestedName) {
  const home = os.homedir() || process.cwd()
  const suggested = suggestedName ? String(suggestedName) : 'untitled.txt'
  const start = path.join(home, suggested)
  if (await commandExists('zenity')) {
    const args = ['--file-selection', `--title=${mode === 'save' ? 'Save in AI Notepad' : 'Open in AI Notepad'}`]
    if (mode === 'save') args.push('--save', '--confirm-overwrite', `--filename=${start}`)
    else args.push('--multiple', '--separator=\n')
    args.push('--file-filter=All files | *')
    const { stdout } = await execFileAsync('zenity', args, { timeout: 180_000 })
    const paths = splitDialogPaths(stdout)
    return mode === 'save'
      ? { ok: true, canceled: paths.length === 0, path: paths[0] || null }
      : { ok: true, canceled: paths.length === 0, paths }
  }
  if (await commandExists('kdialog')) {
    const args = mode === 'save'
      ? ['--getsavefilename', start, 'All files (*)']
      : ['--getopenfilename', home, 'All files (*)', '--multiple', '--separate-output']
    const { stdout } = await execFileAsync('kdialog', args, { timeout: 180_000 })
    const paths = splitDialogPaths(stdout)
    return mode === 'save'
      ? { ok: true, canceled: paths.length === 0, path: paths[0] || null }
      : { ok: true, canceled: paths.length === 0, paths }
  }
  if (await commandExists('yad')) {
    const args = mode === 'save'
      ? ['--file', '--save', '--confirm-overwrite', `--filename=${start}`, '--title=Save in AI Notepad']
      : ['--file', '--multiple', '--separator=\n', '--title=Open in AI Notepad']
    const { stdout } = await execFileAsync('yad', args, { timeout: 180_000 })
    const paths = splitDialogPaths(stdout)
    return mode === 'save'
      ? { ok: true, canceled: paths.length === 0, path: paths[0] || null }
      : { ok: true, canceled: paths.length === 0, paths }
  }
  fail('picker-unavailable', '未找到 zenity、kdialog 或 yad。请安装其中一个文件选择器，或在 Windows/macOS 上使用原生对话框。', 501)
}

async function runMacPicker(mode, suggestedName) {
  const osascript = '/usr/bin/osascript'
  if (!fs.existsSync(osascript)) fail('picker-unavailable', '找不到 macOS osascript，无法打开文件选择器', 501)
  const safeName = String(suggestedName || 'untitled.txt').replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const script = mode === 'save'
    ? `set f to choose file name with prompt "Save in AI Notepad" default name "${safeName}"\nreturn POSIX path of f`
    : 'set fs to choose file with prompt "Open in AI Notepad" with multiple selections allowed\nset out to ""\nrepeat with f in fs\nset out to out & (POSIX path of f) & linefeed\nend repeat\nreturn out'
  try {
    const { stdout } = await execFileAsync(osascript, ['-e', script], { timeout: 180_000 })
    const paths = splitDialogPaths(stdout)
    return mode === 'save'
      ? { ok: true, canceled: paths.length === 0, path: paths[0] || null }
      : { ok: true, canceled: paths.length === 0, paths }
  } catch (error) {
    if (String(error.stderr || error.message).includes('-128')) return { ok: true, canceled: true, paths: [] }
    throw error
  }
}

async function runPicker(mode, suggestedName) {
  try {
    if (process.platform === 'linux') return await runLinuxPicker(mode, suggestedName)
    if (process.platform === 'darwin') return await runMacPicker(mode, suggestedName)
    if (process.platform !== 'win32') fail('unsupported-platform', '当前平台暂不支持原生文件选择器', 501)
    const script = mode === 'save' ? SCRIPTS.save : SCRIPTS.open
    if (!fs.existsSync(script)) fail('missing-script', '文件选择器脚本缺失，请重新安装插件', 500)
    const env = { ...process.env }
    if (suggestedName) env.AINP_SUGGESTED = String(suggestedName)
    const { stdout } = await execFileAsync(powershellPath(), [
      '-NoLogo', '-NoProfile', '-NonInteractive', '-STA',
      '-ExecutionPolicy', 'Bypass', '-File', script,
    ], { env, timeout: 180_000 })
    const parsed = parseJsonOutput(stdout)
    if (!parsed) fail('picker-failed', '文件选择器没有返回有效结果', 500)
    if (parsed.canceled === true) return { ok: true, canceled: true, paths: [] }
    const paths = Array.isArray(parsed.paths) ? parsed.paths.filter(p => typeof p === 'string' && p !== '') : []
    if (mode === 'save') {
      return { ok: true, canceled: paths.length === 0, path: paths[0] || null }
    }
    return { ok: true, canceled: paths.length === 0, paths }
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error.code === 1 || error.code === '1' || /cancel|dismiss/i.test(String(error.stderr || error.message))) {
      return { ok: true, canceled: true, paths: [] }
    }
    fail('picker-failed', `无法打开文件选择器：${error.message}`, 500)
  }
}

async function listFonts() {
  if (process.platform === 'win32') {
    if (!fs.existsSync(SCRIPTS.fonts)) return { ok: true, fonts: [] }
    try {
      const { stdout } = await execFileAsync(powershellPath(), [
        '-NoLogo', '-NoProfile', '-NonInteractive', '-STA',
        '-ExecutionPolicy', 'Bypass', '-File', SCRIPTS.fonts,
      ], { timeout: 30_000 })
      const parsed = parseJsonOutput(stdout)
      const fonts = parsed && Array.isArray(parsed.fonts) ? parsed.fonts.filter(f => typeof f === 'string') : []
      return { ok: true, fonts }
    } catch {
      return { ok: true, fonts: [] }
    }
  }
  if (await commandExists('fc-list')) {
    try {
      const { stdout } = await execFileAsync('fc-list', ['--format=%{family}\n'], { timeout: 30_000 })
      const fonts = Array.from(new Set(String(stdout || '')
        .split(/\r?\n/)
        .flatMap(line => line.split(','))
        .map(value => value.trim())
        .filter(Boolean)))
        .sort((a, b) => a.localeCompare(b))
      if (fonts.length > 0) return { ok: true, fonts }
    } catch {}
  }
  return { ok: true, fonts: ['Arial', 'DejaVu Sans', 'Liberation Sans', 'Noto Sans', 'Segoe UI'] }
}

function regQuery(keyValue) {
  return execFileAsync('reg.exe', ['query', keyValue], { timeout: 15_000 })
}

async function regValue(key, valueName) {
  try {
    const { stdout } = await regQuery(key)
    if (valueName === '') {
      // reg.exe localizes the "(Default)" label; match any parenthesized label.
      const match = stdout.match(/^\s*\([^)]*\)\s+(REG_[A-Z_]+)\s+(.*)$/mi)
      return match ? match[2].trim() : null
    }
    const escaped = valueName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const matcher = new RegExp(`^\\s*${escaped}\\s+(REG_[A-Z_]+)\\s+(.*)$`, 'mi')
    const match = stdout.match(matcher)
    return match ? match[2].trim() : null
  } catch {
    return null
  }
}

async function regAdd(key, valueName, value, type = 'REG_SZ') {
  const args = ['add', key]
  if (valueName === null) args.push('/ve')
  else args.push('/v', valueName)
  args.push('/t', type, '/d', value, '/f')
  await execFileAsync('reg.exe', args, { timeout: 15_000 })
}

async function regDelete(key, valueName) {
  const args = ['delete', key]
  if (valueName !== null) args.push('/v', valueName)
  args.push('/f')
  try {
    await execFileAsync('reg.exe', args, { timeout: 15_000 })
    return true
  } catch {
    return false
  }
}

function desktopExecutable() {
  const candidates = []
  if (process.env.DSH_DESKTOP_EXECUTABLE) candidates.push(process.env.DSH_DESKTOP_EXECUTABLE)
  if (process.execPath && /DeepSeek[ -]?Harness\.exe$/i.test(process.execPath)) candidates.push(process.execPath)
  if (process.env.LOCALAPPDATA) candidates.push(path.join(process.env.LOCALAPPDATA, 'Programs', 'DeepSeek Harness', 'DeepSeek Harness.exe'))
  if (process.env.ProgramFiles) candidates.push(path.join(process.env.ProgramFiles, 'DeepSeek Harness', 'DeepSeek Harness.exe'))
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate
  }
  return null
}

async function dshProtocolExecutable() {
  try {
    const value = await regValue('HKCU\\Software\\Classes\\dsh\\shell\\open\\command', '')
    if (!value) return null
    const match = value.match(/"([^"]+\.exe)"/i)
    if (match && fs.existsSync(match[1])) return match[1]
  } catch {}
  return desktopExecutable()
}

function normalizeExecutablePath(value) {
  return String(value || '').replace(/"/g, '')
}

async function readState() {
  try {
    const raw = await fsp.readFile(statePath(), 'utf8')
    const parsed = JSON.parse(raw)
    return isObject(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

async function writeState(state) {
  await fsp.mkdir(dataDir(), { recursive: true })
  await fsp.writeFile(statePath(), JSON.stringify(state, null, 2), 'utf8')
}

function associationCommand(exe, launcher) {
  const wscript = path.join(process.env.SystemRoot || process.env.WINDIR || 'C:\\Windows', 'System32', 'wscript.exe')
  return `"${wscript}" //B //NoLogo "${launcher}" "%1"`
}

export async function getAssociationStatus(extensions = DEFAULT_EXTENSIONS) {
  const exts = normalizeExtensions(extensions)
  if (process.platform !== 'win32') {
    return {
      ok: true,
      platform: process.platform,
      supported: false,
      progId: PROG_ID,
      appName: APP_NAME,
      registered: false,
      command: null,
      note: '当前平台暂不支持系统文件关联；打开/另存文件使用平台原生选择器。',
      extensions: exts.map(extension => ({ extension, registered: false, isDefault: false, userChoice: null, fallback: null })),
    }
  }
  const command = await regValue(`HKCU\\Software\\Classes\\${PROG_ID}\\shell\\open\\command`, '')
  const app = await regValue(`HKCU\\Software\\RegisteredApplications`, APP_NAME)
  const rows = []
  for (const ext of exts) {
    const openWith = await regValue(`HKCU\\Software\\Classes\\.${ext}\\OpenWithProgids`, PROG_ID)
    const userChoice = await regValue(`HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.${ext}\\UserChoice`, 'ProgId')
    const fallback = await regValue(`HKCU\\Software\\Classes\\.${ext}`, '')
    rows.push({
      extension: ext,
      registered: openWith !== null,
      isDefault: userChoice === PROG_ID,
      userChoice: userChoice || null,
      fallback: fallback || null,
    })
  }
  return {
    ok: true,
    platform: process.platform,
    progId: PROG_ID,
    appName: APP_NAME,
    registered: command !== null && app !== null,
    command: command || null,
    extensions: rows,
  }
}

export async function installAssociations(extensions = DEFAULT_EXTENSIONS) {
  if (process.platform !== 'win32') {
    fail('unsupported-platform', '当前平台暂不支持注册系统文件关联；仍可正常打开和另存文件。', 501)
  }
  const exts = normalizeExtensions(extensions)
  const exe = await dshProtocolExecutable()
  if (!exe) fail('dsh-not-found', '未找到 DeepSeek Harness 可执行文件，无法注册文件关联', 500)
  if (!fs.existsSync(SCRIPTS.launcher)) fail('missing-launcher', '启动器脚本缺失，请重新安装插件', 500)

  // Keep the launcher in the stable per-user data directory. The installed
  // package may be a linked workspace; a registry command must not point into a
  // development checkout that can move or disappear.
  await fsp.mkdir(dataDir(), { recursive: true })
  const launcherCopy = path.join(dataDir(), 'launch.vbs')
  await fsp.copyFile(SCRIPTS.launcher, launcherCopy)

  const previous = await readState()
  const previousFallback = isObject(previous.fallback) ? previous.fallback : {}
  for (const ext of exts) {
    if (previousFallback[ext] === undefined) {
      previousFallback[ext] = (await regValue(`HKCU\\Software\\Classes\\.${ext}`, '')) || null
    }
  }

  const command = associationCommand(exe, launcherCopy)
  await regAdd(`HKCU\\Software\\Classes\\${PROG_ID}`, null, APP_NAME)
  await regAdd(`HKCU\\Software\\Classes\\${PROG_ID}`, 'FriendlyAppName', APP_NAME)
  await regAdd(`HKCU\\Software\\Classes\\${PROG_ID}\\DefaultIcon`, null, `"${exe}",0`)
  await regAdd(`HKCU\\Software\\Classes\\${PROG_ID}\\shell\\open\\command`, null, command)
  await regAdd(`HKCU\\Software\\Classes\\${PROG_ID}\\Application`, 'ApplicationName', APP_NAME)
  await regAdd(`HKCU\\Software\\Classes\\${PROG_ID}\\Application`, 'ApplicationIcon', `"${exe}",0`)
  // Document-style multi-select lets Explorer hand every selected path to the
  // handler when it supports that model; each launch still queues independently
  // when Explorer chooses one process per file.
  await regAdd(`HKCU\\Software\\Classes\\${PROG_ID}`, 'MultiSelectModel', 'Document')

  await regAdd(`HKCU\\Software\\Classes\\${PROG_ID}\\Capabilities`, 'ApplicationName', APP_NAME)
  await regAdd(`HKCU\\Software\\Classes\\${PROG_ID}\\Capabilities`, 'ApplicationDescription', 'AI Notepad — DeepSeek Harness 通用 AI 文本编辑器')
  for (const ext of exts) {
    await regAdd(`HKCU\\Software\\Classes\\${PROG_ID}\\Capabilities\\FileAssociations`, `.${ext}`, PROG_ID)
    await regAdd(`HKCU\\Software\\Classes\\.${ext}\\OpenWithProgids`, PROG_ID, '', 'REG_SZ')
  }
  await regAdd('HKCU\\Software\\RegisteredApplications', APP_NAME, `Software\\Classes\\${PROG_ID}\\Capabilities`)

  await writeState({
    ...previous,
    installedAt: new Date().toISOString(),
    executable: exe,
    launcher: launcherCopy,
    extensions: Array.from(new Set([...(Array.isArray(previous.extensions) ? previous.extensions : []), ...exts])),
    fallback: previousFallback,
  })

  // Best effort: notify Explorer. Failure never invalidates the registry write.
  try { await execFileAsync(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'ie4uinit.exe'), ['-show'], { timeout: 8000 }) } catch {}
  return { ok: true, ...(await getAssociationStatus(exts)) }
}

export async function uninstallAssociations({ restore = true } = {}) {
  if (process.platform !== 'win32') {
    return { ok: true, platform: process.platform, removed: false, message: '非 Windows 平台无需文件关联' }
  }
  const state = await readState()
  const exts = normalizeExtensions(state.extensions || DEFAULT_EXTENSIONS)
  const clearedDefaults = []
  for (const ext of exts) {
    await regDelete(`HKCU\\Software\\Classes\\.${ext}\\OpenWithProgids`, PROG_ID)
    const userChoice = await regValue(`HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.${ext}\\UserChoice`, 'ProgId')
    if (userChoice === PROG_ID) {
      // Windows protects UserChoice with a hash. Removing it lets the shell fall
      // back to the extension's ordinary ProgID and ask the user again.
      const removed = await regDelete(`HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.${ext}\\UserChoice`, null)
      if (removed) clearedDefaults.push(ext)
    }
  }
  await regDelete(`HKCU\\Software\\Classes\\${PROG_ID}`, null)
  await regDelete('HKCU\\Software\\RegisteredApplications', APP_NAME)
  if (restore) {
    for (const [ext, value] of Object.entries(isObject(state.fallback) ? state.fallback : {})) {
      if (typeof value === 'string' && value !== '') {
        // Do not overwrite a real user default; only restore a missing fallback.
        const current = await regValue(`HKCU\\Software\\Classes\\.${ext}`, '')
        if (!current) await regAdd(`HKCU\\Software\\Classes\\.${ext}`, null, value).catch(() => {})
      }
    }
  }
  await fsp.unlink(statePath()).catch(() => {})
  try { await execFileAsync(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'ie4uinit.exe'), ['-show'], { timeout: 8000 }) } catch {}
  return {
    ok: true,
    removed: true,
    clearedDefaults,
    note: '已移除 AI Notepad 的 Open With 与 ProgID 注册。Windows 10/11 的默认应用选择受系统哈希保护，无法静默恢复旧默认；若本应用曾被设为默认，系统会重新询问打开方式。',
  }
}

async function openDefaultApps() {
  if (process.platform === 'win32') {
    await execFileAsync('cmd.exe', ['/d', '/s', '/c', 'start', '', 'ms-settings:defaultapps'], { timeout: 10_000 })
    return { ok: true }
  }
  if (process.platform === 'darwin') {
    await execFileAsync('open', ['x-apple.systempreferences:com.apple.Desktop-Settings.extension'], { timeout: 10_000 }).catch(() => {})
    return { ok: true }
  }
  fail('unsupported-platform', '当前桌面环境没有统一的默认应用设置入口', 501)
}

async function openAssociationDialog(filePath) {
  if (process.platform !== 'win32') {
    fail('unsupported-platform', '当前平台暂不支持“打开方式”注册；请直接在系统文件管理器中设置。', 501)
  }
  const target = typeof filePath === 'string' && filePath ? filePath : path.join(os.tmpdir(), 'ai-notepad-open-with.txt')
  await fsp.writeFile(target, '', { flag: 'a' }).catch(() => {})
  await execFileAsync('rundll32.exe', ['shell32.dll,OpenAs_RunDLL', target], { timeout: 15_000 }).catch(() => {})
  return { ok: true }
}

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
}

function isExternalRef(ref) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref) || ref.startsWith('#') || ref.startsWith('data:')
}

function resolveLocalAsset(baseDir, ref) {
  const raw = String(ref || '').trim()
  if (!raw) return null
  if (raw.startsWith('file://')) {
    try { return path.normalize(fileURLToPath(raw)) } catch { return null }
  }
  if (isExternalRef(raw)) return null
  let decoded = raw
  try { decoded = decodeURIComponent(raw) } catch {}
  decoded = decoded.split(/[?#]/)[0]
  if (!decoded || decoded.startsWith('#')) return null
  const target = path.isAbsolute(decoded) ? decoded : path.resolve(baseDir, decoded)
  if (target.includes('\0')) return null
  return path.normalize(target)
}

function assetUrl(target) {
  return `${API_BASE}/asset?path=${encodeURIComponent(target)}`
}

function rewriteCssUrls(css, baseDir) {
  let output = String(css || '').replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, (match, quote, ref) => {
    const target = resolveLocalAsset(baseDir, ref)
    return target ? `url("${assetUrl(target)}")` : match
  })
  output = output.replace(/@import\s+(?:url\(\s*)?(['"])(.*?)\1\)?/gi, (match, quote, ref) => {
    const target = resolveLocalAsset(baseDir, ref)
    return target ? `@import url("${assetUrl(target)}")` : match
  })
  return output
}

function rewriteSrcset(value, baseDir) {
  return String(value || '').split(',').map(part => {
    const pieces = part.trim().split(/\s+/)
    const target = resolveLocalAsset(baseDir, pieces[0])
    if (!target) return part.trim()
    return [assetUrl(target), ...pieces.slice(1)].join(' ')
  }).join(', ')
}

function rewriteHtmlAssets(html, baseDir) {
  let output = String(html || '')
  output = output.replace(/\b(src|href|poster|data|action)\s*=\s*(["'])(.*?)\2/gi, (match, name, quote, ref) => {
    const target = resolveLocalAsset(baseDir, ref)
    return target ? `${name}=${quote}${assetUrl(target)}${quote}` : match
  })
  output = output.replace(/\bsrcset\s*=\s*(["'])(.*?)\1/gi, (match, quote, value) => {
    return `srcset=${quote}${rewriteSrcset(value, baseDir)}${quote}`
  })
  output = output.replace(/\bstyle\s*=\s*(["'])(.*?)\1/gi, (match, quote, value) => {
    return `style=${quote}${rewriteCssUrls(value, baseDir)}${quote}`
  })
  output = output.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (match, open, css, close) => {
    return `${open}${rewriteCssUrls(css, baseDir)}${close}`
  })
  return output
}

async function prepareHtmlPreview(input) {
  const basePath = typeof input.basePath === 'string' && input.basePath ? assertFilePath(input.basePath) : null
  const baseDir = basePath ? path.dirname(basePath) : process.cwd()
  let html = typeof input.html === 'string' ? input.html : ''

  if (!html && input.useDisk === true && basePath) {
    let stat
    try { stat = await fsp.stat(basePath) } catch { fail('not-found', 'HTML 文件不存在', 404) }
    const cached = htmlPreviewCache.get(basePath)
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
      return { ok: true, html: cached.html, baseDir, cached: true }
    }
    const document = await readDocument(basePath)
    html = document.content
    if (Buffer.byteLength(html, 'utf8') > MAX_FILE_BYTES) fail('too-large', 'HTML 文件过大，无法预览', 413)
    const actualBaseDir = path.dirname(document.path)
    const rewritten = rewriteHtmlAssets(html, actualBaseDir)
    if (Buffer.byteLength(rewritten, 'utf8') <= MAX_PREVIEW_CACHE_BYTES) {
      htmlPreviewCache.delete(basePath)
      htmlPreviewCache.set(basePath, { html: rewritten, mtimeMs: stat.mtimeMs, size: stat.size })
      while (htmlPreviewCache.size > MAX_PREVIEW_CACHE_ENTRIES) {
        htmlPreviewCache.delete(htmlPreviewCache.keys().next().value)
      }
    }
    return { ok: true, html: rewritten, baseDir: actualBaseDir }
  }

  if (!html) fail('empty-content', 'HTML 内容为空')
  if (Buffer.byteLength(html, 'utf8') > MAX_FILE_BYTES) fail('too-large', 'HTML 文件过大，无法预览', 413)
  return { ok: true, html: rewriteHtmlAssets(html, baseDir), baseDir }
}

async function readPreviewAsset(rawPath) {
  const target = assertFilePath(rawPath)
  let stat
  try { stat = await fsp.stat(target) } catch { fail('not-found', '资源文件不存在', 404) }
  if (!stat.isFile()) fail('not-file', '资源不是普通文件', 400)
  if (stat.size > 64 * 1024 * 1024) fail('too-large', '资源文件过大', 413)
  const ext = path.extname(target).toLowerCase()
  const mime = MIME_TYPES[ext] || 'application/octet-stream'
  if (ext === '.css') {
    const text = await fsp.readFile(target, 'utf8')
    return { body: Buffer.from(rewriteCssUrls(text, path.dirname(target)), 'utf8'), mime, mtimeMs: stat.mtimeMs, size: stat.size }
  }
  if (ext === '.html' || ext === '.htm') {
    const text = await fsp.readFile(target, 'utf8')
    return { body: Buffer.from(rewriteHtmlAssets(text, path.dirname(target)), 'utf8'), mime, mtimeMs: stat.mtimeMs, size: stat.size }
  }
  return { body: await fsp.readFile(target), mime, mtimeMs: stat.mtimeMs, size: stat.size }
}

const AI_ACTIONS = {
  concise: '精简：压缩文字，保留核心信息，删除重复和空话。',
  polish: '润色：改善表达、用词和语言流畅度，保持原意和事实。',
  expand: '扩写：在不改变原意的前提下补充细节、解释或论证。',
  restructure: '重构：调整逻辑结构和表达顺序，使层次更清晰。',
  proofread: '语法纠错：只修正语法、错别字、标点和明显的表达问题。',
  bullets: '条目化：把选中内容整理成清晰的条目或 Markdown 列表，保留关键信息和事实。',
  paragraph: '段落化：把条目或碎片整理成自然、连贯的段落，减少列表符号和机械分段。',
  plain: '易懂：用更简单、直白的词汇和句式表达，保留事实和关键信息。',
  advanced: '高级：在保持准确的前提下，使用更精确、成熟的词汇和表达。',
  common: '常识纠错：优先检查事实、逻辑和常识矛盾，修正明显错误；不要只做语法润色。',
  custom: '',
  summarize: '总结：提炼全文核心内容，生成简洁摘要。',
  outline: '梳理逻辑与章节结构：优化标题层级和段落顺序。',
  titles: '生成标题和小标题：为全文生成合适的标题与层级小标题。',
}

function buildSelectionPrompt(input) {
  const isCustom = input.action === 'custom'
  const action = isCustom ? '' : (AI_ACTIONS[input.action] || '')
  const instruction = typeof input.instruction === 'string' ? input.instruction.trim() : ''
  const doc = typeof input.documentText === 'string' ? input.documentText : ''
  const selected = typeof input.selectedText === 'string' ? input.selectedText : ''
  const before = typeof input.before === 'string' ? input.before : ''
  const after = typeof input.after === 'string' ? input.after : ''
  let context = doc
  let contextNote = '以下是完整文档。'
  if (doc.length > MAX_AI_CONTEXT) {
    contextNote = '文档较长，以下只提供选区前后各 18000 字符的上下文和文档开头；仍只改选中区域。'
    const head = doc.slice(0, 24000)
    const left = before.slice(-18000)
    const right = after.slice(0, 18000)
    context = `${head}\n\n[…中间内容省略…]\n\n${left}\n<selection>\n${selected}\n</selection>\n${right}`
  }
  return [
    '你是 AI Notepad 的文本编辑引擎，只对指定的选中区域做最小必要修改。',
    '硬性规则：',
    '1. 只输出修改后的“选中区域”文本，不要输出解释、前后缀、Diff、引号或代码围栏。',
    '2. 绝不修改选区以外的内容；全文只作为理解上下文的参考。',
    '3. 保留原文的 Markdown 结构、代码缩进、专有名词和事实；不要编造事实。',
    '4. 如果不需要修改，原样输出选中区域。',
    '5. 不要复制选区后面的原文；结果中不得包含任何未选中的句子或段落。',
    '6. 选区通常是可见文本，不要额外添加 Markdown 标题 #、列表符号、引用符号或代码围栏；除非选中区域本来包含它们。',
    '',
    isCustom ? `编辑任务：按用户的自定义要求修改选中区域。${instruction}` : `编辑任务：${action}`,
    '',
    `文档上下文说明：${contextNote}`,
    '<document>',
    context,
    '</document>',
    '<selection_to_rewrite>',
    selected,
    '</selection_to_rewrite>',
    '',
    '现在只输出替换 <selection_to_rewrite> 的新文本。',
  ].filter(Boolean).join('\n')
}

function buildDocumentPrompt(input) {
  const isCustom = input.action === 'custom'
  const action = isCustom ? '' : (AI_ACTIONS[input.action] || '')
  const instruction = typeof input.instruction === 'string' ? input.instruction.trim() : ''
  const doc = typeof input.documentText === 'string' ? input.documentText : ''
  let body = doc
  let note = '以下是完整文档。'
  if (doc.length > MAX_AI_CONTEXT) {
    note = '文档超过 120000 字符，以下只提供开头 60000 字符和结尾 20000 字符；请在不了解的中段保持保守。'
    body = `${doc.slice(0, 60000)}\n\n[…中间内容省略…]\n\n${doc.slice(-20000)}`
  }
  return [
    '你是 AI Notepad 的全文编辑引擎。',
    '硬性规则：',
    '1. 只输出修改后的完整文档，不要输出解释、Diff、标题前缀或代码围栏。',
    '2. 保留 Markdown 结构、代码块、链接、专有名词和事实；不要编造。',
    '3. 不要删除必要内容，除非任务明确要求精简或总结。',
    '4. 输出必须是可直接替换原文件的完整文本。',
    '',
    isCustom ? `全文任务：按用户的自定义要求修改全文。${instruction}` : `全文任务：${action}`,
    '',
    `上下文说明：${note}`,
    '<document>',
    body,
    '</document>',
    '',
    '现在输出修改后的完整文档。',
  ].filter(Boolean).join('\n')
}

function stripWrapper(text) {
  let value = String(text || '')
  const fence = value.match(/^\s*```[^\n]*\n([\s\S]*?)\n```\s*$/)
  if (fence) value = fence[1]
  return value.replace(/^\n+/, '').replace(/\n+$/, '')
}

function trimSelectionLeak(text, input) {
  let value = stripWrapper(text)
  value = value.replace(/^\s*<selection_to_rewrite>\s*/i, '').replace(/\s*<\/selection_to_rewrite>\s*$/i, '')
  const after = typeof input.after === 'string' ? input.after : ''
  if (after.trim() === '') return value
  const candidates = [after.slice(0, 240), after.slice(0, 120), after.slice(0, 60)]
    .map(item => item.replace(/\s+$/, ''))
    .filter(item => item.trim().length >= 24)
  for (const candidate of candidates) {
    if (value.length > candidate.length && value.endsWith(candidate)) {
      return value.slice(0, value.length - candidate.length).replace(/\s+$/, '')
    }
  }
  return value
}

async function generate(ctx, prompt, system, signal) {
  const llm = ctx.get('llm')
  if (!llm || typeof llm.stream !== 'function') fail('model-unavailable', '当前 Harness 没有可用的模型服务', 503)
  const owner = ctx.get('agentDefaultModel')
  const selection = owner && typeof owner.currentSelection === 'function' ? owner.currentSelection() : null
  const provider = selection && selection.provider
  const model = selection && selection.model
  if (!provider || !model) fail('model-unavailable', '没有配置默认模型；请先在 Harness 设置中选择模型', 503)

  let text = ''
  let failure = null
  const timeout = AbortSignal.timeout(180_000)
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout
  for await (const chunk of llm.stream({
    provider,
    model,
    system,
    messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
    maxTokens: 8192,
    temperature: 0.2,
    signal: combined,
  })) {
    if (!chunk || typeof chunk !== 'object') continue
    if (chunk.type === 'text-delta' && typeof chunk.text === 'string') text += chunk.text
    else if (chunk.type === 'finish') {
      const kind = chunk.reason && chunk.reason.kind
      if (kind === 'error' || kind === 'aborted') {
        failure = chunk.reason.failure || { code: kind, message: '模型调用失败' }
      }
    }
  }
  if (failure) fail('model-error', String(failure.message || '模型调用失败'), 502)
  const cleaned = stripWrapper(text)
  if (cleaned.trim() === '') fail('empty-result', '模型没有返回修改结果', 502)
  return { ok: true, text: cleaned, provider, model }
}

class Inbox {
  constructor() {
    this.dir = inboxDir()
    this.rev = 0
    this.items = []
    this.timer = null
    this.scanning = false
  }

  async start() {
    await fsp.mkdir(this.dir, { recursive: true })
    await this.scan()
    this.timer = setInterval(() => { this.scan().catch(() => {}) }, 1200)
    if (this.timer.unref) this.timer.unref()
  }

  stop() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  async scan() {
    if (this.scanning) return
    this.scanning = true
    try {
      const entries = await fsp.readdir(this.dir, { withFileTypes: true }).catch(() => [])
      for (const entry of entries) {
        if (!entry.isFile()) continue
        const full = path.join(this.dir, entry.name)
        if (!entry.name.toLowerCase().endsWith('.txt') && !entry.name.toLowerCase().endsWith('.json')) continue
        try {
          const raw = await fsp.readFile(full)
          let text
          if (raw.length >= 2 && raw[0] === 0xff && raw[1] === 0xfe) {
            text = new TextDecoder('utf-16le').decode(raw.subarray(2))
          } else {
            text = raw.toString('utf8').replace(/^\uFEFF/, '')
          }
          let paths = []
          if (entry.name.toLowerCase().endsWith('.json')) {
            const parsed = JSON.parse(text)
            paths = Array.isArray(parsed?.paths) ? parsed.paths : []
          } else {
            paths = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
          }
          for (const candidate of paths) {
            if (typeof candidate !== 'string' || candidate === '' || candidate.includes('\0')) continue
            const absolute = path.isAbsolute(candidate) ? candidate : path.resolve(candidate)
            this.rev += 1
            this.items.push({ path: absolute, rev: this.rev, at: Date.now() })
          }
          if (this.items.length > 200) this.items.splice(0, this.items.length - 200)
          await fsp.unlink(full).catch(() => {})
        } catch {
          // A half-written queue file is retried on the next scan.
        }
      }
    } finally {
      this.scanning = false
    }
  }

  since(since) {
    // `since` is an epoch-millisecond cursor, not the in-memory revision. The
    // revision resets whenever the Host process restarts; timestamps do not.
    const value = Number.isFinite(Number(since)) ? Number(since) : 0
    const files = this.items.filter(item => item.at > value)
    const cursor = files.reduce((max, item) => Math.max(max, item.at), value)
    return {
      ok: true,
      rev: this.rev,
      cursor,
      files,
      inboxDir: this.dir,
    }
  }

  async enqueue(paths) {
    for (const candidate of paths) {
      if (typeof candidate !== 'string' || !path.isAbsolute(candidate)) continue
      this.rev += 1
      this.items.push({ path: candidate, rev: this.rev, at: Date.now() })
    }
    return this.since(0)
  }
}

async function appendAiLog(entry) {
  try {
    await fsp.mkdir(dataDir(), { recursive: true })
    const file = path.join(dataDir(), 'ai-events.log')
    const info = await fsp.stat(file).catch(() => null)
    if (info && info.size > 512 * 1024) await fsp.writeFile(file, '', 'utf8')
    await fsp.appendFile(file, JSON.stringify({ at: new Date().toISOString(), ...entry }) + '\n', 'utf8')
  } catch {}
}

async function revealInFileManager(target) {
  if (process.platform === 'win32') {
    await execFileAsync('explorer.exe', [`/select,${target}`], { timeout: 15_000 }).catch(() => {})
    return
  }
  const existing = fs.existsSync(target) ? target : path.dirname(target)
  if (process.platform === 'darwin') {
    await execFileAsync('open', ['-R', existing], { timeout: 15_000 })
    return
  }
  if (await commandExists('dbus-send')) {
    try {
      await execFileAsync('dbus-send', [
        '--session',
        '--dest=org.freedesktop.FileManager1',
        '--type=method_call',
        '/org/freedesktop/FileManager1',
        'org.freedesktop.FileManager1.ShowItems',
        `array:string:${pathToFileURL(existing).href}`,
        '',
      ], { timeout: 15_000 })
      return
    } catch {}
  }
  await execFileAsync('xdg-open', [path.dirname(existing)], { timeout: 15_000 })
}

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  })
}

function errorResponse(error) {
  if (error instanceof ApiError) {
    return jsonResponse(error.status, { ok: false, error: { code: error.code, message: error.message } })
  }
  const message = error && error.message ? String(error.message) : String(error)
  const mapped = {
    FS_STALE_VERSION: [409, 'conflict', '文件已变化，请重新加载或另存为'],
    FS_NOT_FOUND: [404, 'not-found', '文件不存在'],
    FS_PERMISSION_DENIED: [403, 'permission-denied', '没有文件权限'],
    ENOENT: [404, 'not-found', '文件或目录不存在'],
    EACCES: [403, 'permission-denied', '没有访问权限'],
    EPERM: [403, 'permission-denied', '操作被系统拒绝'],
  }[error && error.code]
  if (mapped) return jsonResponse(mapped[0], { ok: false, error: { code: mapped[1], message: mapped[2] } })
  return jsonResponse(500, { ok: false, error: { code: 'internal', message } })
}

async function readJson(request) {
  const contentType = request.headers.get('content-type') || ''
  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) fail('content-type', '需要 application/json', 415)
  const text = await request.text()
  if (text.length > MAX_REQUEST_BYTES) fail('too-large', '请求体过大', 413)
  if (text.trim() === '') return {}
  try {
    const parsed = JSON.parse(text)
    if (!isObject(parsed)) fail('bad-request', '请求体必须是 JSON 对象')
    return parsed
  } catch (error) {
    if (error instanceof ApiError) throw error
    fail('bad-json', 'JSON 请求无效')
  }
}

function route(ctx, method, suffix, handler, inbox) {
  return ctx.connection.fetch.register({
    path: `${API_BASE}${suffix}`,
    methods: method,
    requestBody: method === 'GET' ? 'buffered' : 'buffered',
    fetch: async (request) => {
      try {
        return await handler(request, inbox)
      } catch (error) {
        if (request.signal?.aborted) return jsonResponse(499, { ok: false, error: { code: 'aborted', message: '操作已取消' } })
        return errorResponse(error)
      }
    },
  })
}

export function apply(ctx) {
  const inbox = new Inbox()
  inbox.start().catch(error => console.error('[ai-notepad] inbox start failed:', error))

  const disposers = [
    route(ctx, ['GET'], '/status', async () => {
      const status = await getAssociationStatus()
      return jsonResponse(200, {
        ok: true,
        platform: process.platform,
        version: '1.0.0',
        dataDir: dataDir(),
        inboxDir: inbox.dir,
        associations: status,
        model: (() => {
          try {
            const owner = ctx.get('agentDefaultModel')
            return owner && typeof owner.currentSelection === 'function' ? owner.currentSelection() : null
          } catch { return null }
        })(),
      })
    }, inbox),
    route(ctx, ['POST'], '/pick-open', async () => jsonResponse(200, await runPicker('open')), inbox),
    route(ctx, ['POST'], '/pick-save', async (request) => {
      const body = await readJson(request)
      return jsonResponse(200, await runPicker('save', body.suggestedName))
    }, inbox),
    route(ctx, ['POST'], '/preview-html', async (request) => {
      const body = await readJson(request)
      return jsonResponse(200, await prepareHtmlPreview(body))
    }, inbox),
    route(ctx, ['GET'], '/asset', async (request) => {
      const url = new URL(request.url)
      const asset = await readPreviewAsset(url.searchParams.get('path') || '')
      return new Response(asset.body, {
        status: 200,
        headers: {
          'content-type': asset.mime,
          'cache-control': 'private, max-age=30',
          'etag': `"${Math.round(asset.mtimeMs)}-${asset.size}"`,
          'x-content-type-options': 'nosniff',
        },
      })
    }, inbox),
    route(ctx, ['POST'], '/read', async (request) => {
      const body = await readJson(request)
      return jsonResponse(200, await readDocument(body.path, request.signal))
    }, inbox),
    route(ctx, ['POST'], '/write', async (request) => {
      const body = await readJson(request)
      return jsonResponse(200, await writeDocument(body, request.signal))
    }, inbox),
    route(ctx, ['POST'], '/fonts', async () => jsonResponse(200, await listFonts()), inbox),
    route(ctx, ['POST'], '/reveal', async (request) => {
      const body = await readJson(request)
      await revealInFileManager(assertFilePath(body.path))
      return jsonResponse(200, { ok: true })
    }, inbox),
    route(ctx, ['GET'], '/inbox', async (request) => {
      const url = new URL(request.url)
      return jsonResponse(200, inbox.since(url.searchParams.get('since') || 0))
    }, inbox),
    route(ctx, ['POST'], '/enqueue', async (request) => {
      const body = await readJson(request)
      const paths = Array.isArray(body.paths) ? body.paths : (typeof body.path === 'string' ? [body.path] : [])
      const result = await inbox.enqueue(paths)
      return jsonResponse(200, { ...result, cursor: Date.now() })
    }, inbox),
    route(ctx, ['POST'], '/ai', async (request) => {
      const body = await readJson(request)
      if (typeof body.documentText !== 'string') fail('bad-request', '缺少 documentText')
      if (typeof body.selectedText !== 'string' || body.selectedText === '') fail('empty-selection', '请先选中要修改的文字')
      const isDocument = body.scope === 'document'
      await appendAiLog({ event: 'start', action: body.action, scope: body.scope || 'selection', selected: body.selectedText.length, document: body.documentText.length })
      try {
        const system = '你是严谨的中文/多语言文本编辑引擎。严格遵守边界，只输出要求的文本，不输出解释或 Markdown 代码围栏。'
        const prompt = isDocument ? buildDocumentPrompt(body) : buildSelectionPrompt(body)
        const result = await generate(ctx, prompt, system, request.signal)
        if (!isDocument) result.text = trimSelectionLeak(result.text, body)
        await appendAiLog({ event: 'ok', action: body.action, scope: body.scope || 'selection', bytes: result.text.length })
        return jsonResponse(200, result)
      } catch (error) {
        await appendAiLog({ event: 'error', action: body.action, scope: body.scope || 'selection', code: error?.code || 'unknown', message: String(error?.message || error) })
        throw error
      }
    }, inbox),
    route(ctx, ['POST'], '/client-report', async (request) => {
      const body = await readJson(request)
      const report = {
        at: new Date().toISOString(),
        mounted: body.mounted === true,
        docs: Number.isFinite(Number(body.docs)) ? Number(body.docs) : 0,
        active: typeof body.active === 'string' ? body.active.slice(0, 260) : null,
        error: typeof body.error === 'string' ? body.error.slice(0, 6000) : null,
        componentStack: typeof body.componentStack === 'string' ? body.componentStack.slice(0, 6000) : null,
        version: '1.2.3',
      }
      await fsp.mkdir(dataDir(), { recursive: true })
      await fsp.writeFile(path.join(dataDir(), 'client-report.json'), JSON.stringify(report, null, 2), 'utf8')
      return jsonResponse(200, { ok: true })
    }, inbox),
    route(ctx, ['POST'], '/associations', async (request) => {
      const body = await readJson(request)
      const action = body.action || 'status'
      if (action === 'status') return jsonResponse(200, await getAssociationStatus(body.extensions))
      if (action === 'install') return jsonResponse(200, await installAssociations(body.extensions))
      if (action === 'uninstall' || action === 'restore') return jsonResponse(200, await uninstallAssociations({ restore: action === 'restore' }))
      if (action === 'default-apps') return jsonResponse(200, await openDefaultApps())
      if (action === 'open-with') return jsonResponse(200, await openAssociationDialog(body.path))
      fail('bad-action', '未知的文件关联操作')
    }, inbox),
    route(ctx, ['POST'], '/open-with', async (request) => {
      const body = await readJson(request)
      return jsonResponse(200, await openAssociationDialog(body.path))
    }, inbox),
    route(ctx, ['POST'], '/autosave', async (request) => {
      const body = await readJson(request)
      const action = body.action || 'save'
      if (action === 'save') return jsonResponse(200, await saveAutosave(body))
      if (action === 'list') return jsonResponse(200, await listAutosaves())
      if (action === 'read') return jsonResponse(200, await readAutosave(body))
      if (action === 'drop') return jsonResponse(200, await dropAutosave(body.id))
      fail('bad-action', '未知的自动保存操作')
    }, inbox),
  ]

  ctx.effect(() => {
    return () => {
      inbox.stop()
      for (const disposer of disposers) {
        try {
          Promise.resolve(disposer()).catch(() => {})
        } catch {}
      }
    }
  }, 'ai-notepad: host routes and inbox')

  console.log('[ai-notepad] host ready; inbox=' + inbox.dir)
}

// Test/diagnostic exports (pure functions are safe to import without a Host).
export const _internals = {
  MAX_FILE_BYTES,
  MAX_REQUEST_BYTES,
  LARGE_FILE_BYTES,
  DEFAULT_EXTENSIONS,
  normalizeExtensions,
  eolOf,
  normalizeEol,
  buildSelectionPrompt,
  buildDocumentPrompt,
  stripWrapper,
  trimSelectionLeak,
  rewriteHtmlAssets,
  rewriteCssUrls,
  resolveLocalAsset,
  sha256,
  baseName,
  regValue,
  regQuery,
  dshProtocolExecutable,
}
