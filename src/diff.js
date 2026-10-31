/**
 * Deterministic line diff for the review UI. It is deliberately dependency-free
 * and bounded: the editor refuses to highlight enormous diffs rather than freeze.
 */
const MAX_LINES = 5000
const MAX_CELLS = 4_000_000

function splitLines(text) {
  const normalized = String(text == null ? '' : text).replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  if (normalized === '') return []
  return normalized.split('\n')
}

function lcsMatrix(a, b) {
  const n = a.length
  const m = b.length
  if (n * m > MAX_CELLS || n > MAX_LINES || m > MAX_LINES) return null
  const width = m + 1
  const matrix = new Uint32Array((n + 1) * width)
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      matrix[i * width + j] = a[i] === b[j]
        ? matrix[(i + 1) * width + j + 1] + 1
        : Math.max(matrix[(i + 1) * width + j], matrix[i * width + j + 1])
    }
  }
  return { matrix, width }
}

/**
 * @returns {{ops: Array<{type:'equal'|'del'|'ins',text:string,oldLine?:number,newLine?:number}>, stats:{additions:number,deletions:number,truncated:boolean}}}
 */
export function lineDiff(before, after) {
  const a = splitLines(before)
  const b = splitLines(after)
  const computed = lcsMatrix(a, b)
  if (computed === null) {
    const ops = []
    if (a.length) ops.push({ type: 'del', text: '（内容过大，省略逐行对比）' })
    if (b.length) ops.push({ type: 'ins', text: '（内容过大，省略逐行对比）' })
    return {
      ops,
      stats: { additions: b.length, deletions: a.length, truncated: true },
    }
  }
  const { matrix, width } = computed
  const ops = []
  let i = 0
  let j = 0
  let oldLine = 1
  let newLine = 1
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ type: 'equal', text: a[i], oldLine, newLine })
      i++; j++; oldLine++; newLine++
    } else if (matrix[(i + 1) * width + j] >= matrix[i * width + j + 1]) {
      ops.push({ type: 'del', text: a[i], oldLine })
      i++; oldLine++
    } else {
      ops.push({ type: 'ins', text: b[j], newLine })
      j++; newLine++
    }
  }
  while (i < a.length) {
    ops.push({ type: 'del', text: a[i], oldLine })
    i++; oldLine++
  }
  while (j < b.length) {
    ops.push({ type: 'ins', text: b[j], newLine })
    j++; newLine++
  }
  return {
    ops,
    stats: {
      additions: b.length - matrix[0],
      deletions: a.length - matrix[0],
      truncated: false,
    },
  }
}

export function compactDiff(ops, context = 3) {
  if (!Array.isArray(ops)) return []
  const keep = new Set()
  for (let i = 0; i < ops.length; i++) {
    if (ops[i].type === 'equal') continue
    for (let j = Math.max(0, i - context); j <= Math.min(ops.length - 1, i + context); j++) keep.add(j)
  }
  if (keep.size === 0) return ops.slice(0, Math.min(ops.length, 40))
  const out = []
  let last = -2
  for (let i = 0; i < ops.length; i++) {
    if (!keep.has(i)) continue
    if (last !== -2 && i > last + 1) out.push({ type: 'gap', text: '…' })
    out.push(ops[i])
    last = i
  }
  return out
}
