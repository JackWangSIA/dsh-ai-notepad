/**
 * Small, safe Markdown renderer for the preview pane.
 *
 * Raw HTML is always escaped. Only a conservative inline subset is recognized;
 * links are limited to http(s), mailto and fragment targets. This is not a full
 * CommonMark implementation, and that is intentional: the editor owns the text,
 * the preview is a convenience.
 */
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, char => HTML_ESCAPES[char])
}

function safeUrl(value) {
  const raw = String(value || '').trim()
  if (raw === '' || raw.startsWith('#')) return raw
  try {
    const url = new URL(raw)
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') return url.href
  } catch {}
  return '#'
}

function inline(text) {
  let value = escapeHtml(text)
  const codes = []
  value = value.replace(/`([^`]+)`/g, (_, code) => {
    codes.push('<code>' + code + '</code>')
    return '\u0000C' + (codes.length - 1) + '\u0000'
  })
  value = value.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, alt, src, title) => {
    return '<img src="' + escapeHtml(safeUrl(src)) + '" alt="' + alt + '"' + (title ? ' title="' + escapeHtml(title) + '"' : '') + ' loading="lazy">'
  })
  value = value.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, (_, label, href, title) => {
    return '<a href="' + escapeHtml(safeUrl(href)) + '" target="_blank" rel="noopener noreferrer"' + (title ? ' title="' + escapeHtml(title) + '"' : '') + '>' + label + '</a>'
  })
  value = value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  value = value.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  value = value.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
  value = value.replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>')
  value = value.replace(/~~([^~]+)~~/g, '<del>$1</del>')
  value = value.replace(/\u0000C(\d+)\u0000/g, (_, index) => codes[Number(index)] || '')
  return value
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)
}

function tableCells(line) {
  let value = line.trim()
  if (value.startsWith('|')) value = value.slice(1)
  if (value.endsWith('|')) value = value.slice(0, -1)
  return value.split('|').map(cell => cell.trim())
}

const LIST_ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/

function parseList(lines, start, baseIndent, ordered) {
  const tag = ordered ? 'ol' : 'ul'
  let index = start
  let html = ''
  while (index < lines.length) {
    const match = lines[index].match(LIST_ITEM)
    if (!match) break
    const indent = match[1].length
    const itemOrdered = /^\d/.test(match[2])
    if (indent !== baseIndent || itemOrdered !== ordered) break
    let text = match[3]
    let task = null
    const taskMatch = text.match(/^\[([ xX])\]\s+(.*)$/)
    if (taskMatch) {
      task = taskMatch[1].toLowerCase() === 'x'
      text = taskMatch[2]
    }
    index += 1
    let nested = ''
    while (index < lines.length) {
      const next = lines[index]
      if (/^\s*$/.test(next)) {
        let look = index
        while (look < lines.length && /^\s*$/.test(lines[look])) look += 1
        const afterBlank = lines[look] && lines[look].match(LIST_ITEM)
        if (afterBlank && afterBlank[1].length > baseIndent) {
          index = look
          continue
        }
        break
      }
      const child = next.match(LIST_ITEM)
      if (child && child[1].length > baseIndent) {
        const childOrdered = /^\d/.test(child[2])
        const parsed = parseList(lines, index, child[1].length, childOrdered)
        nested += parsed.html
        index = parsed.index
        continue
      }
      if (child) break
      const nextIndent = next.match(/^\s*/)[0].length
      if (nextIndent > baseIndent && !/^\s*(?:[-*_]\s*){3,}$/.test(next)) {
        text += '\n' + next.trim()
        index += 1
        continue
      }
      break
    }
    html += '<li>' +
      (task !== null ? '<input type="checkbox" disabled' + (task ? ' checked' : '') + '> ' : '') +
      inline(text).replace(/\n/g, '<br>') +
      nested +
      '</li>'
  }
  return { html: '<' + tag + '>' + html + '</' + tag + '>', index }
}

export function renderMarkdown(source) {
  const lines = String(source == null ? '' : source).replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (/^\s*$/.test(line)) { index++; continue }
    const blockLine = index + 1

    const fence = line.match(/^\s*```([^\s`]*)\s*$/)
    if (fence) {
      const language = fence[1] || ''
      const code = []
      index++
      while (index < lines.length && !/^\s*```\s*$/.test(lines[index])) {
        code.push(lines[index])
        index++
      }
      if (index < lines.length) index++
      blocks.push('<pre class="np-md-code" data-source-line="' + blockLine + '"' + (language ? ' data-lang="' + escapeHtml(language) + '"' : '') + '><code>' + escapeHtml(code.join('\n')) + '</code></pre>')
      continue
    }

    const heading = line.match(/^\s*(#{1,6})\s+(.*?)\s*#*\s*$/)
    if (heading) {
      const level = heading[1].length
      blocks.push(
        '<h' + level + ' class="np-md-heading" data-level="' + level + '" data-source-line="' + blockLine + '">' +
        '<button type="button" class="np-md-fold" aria-label="折叠标题"></button>' +
        '<span>' + inline(heading[2]) + '</span></h' + level + '>',
      )
      index++
      continue
    }

    if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) {
      blocks.push('<hr data-source-line="' + blockLine + '">')
      index++
      continue
    }

    if (/^\s*>/.test(line)) {
      const quote = []
      while (index < lines.length && /^\s*>/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ''))
        index++
      }
      blocks.push('<blockquote data-source-line="' + blockLine + '">' + renderMarkdown(quote.join('\n')) + '</blockquote>')
      continue
    }

    if (/^\s*\|/.test(line) && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const head = tableCells(line)
      index += 2
      const rows = []
      while (index < lines.length && /^\s*\|/.test(lines[index]) && !/^\s*$/.test(lines[index])) {
        rows.push(tableCells(lines[index]))
        index++
      }
      let html = '<div class="np-md-tablewrap" data-source-line="' + blockLine + '"><table><thead><tr>'
      html += head.map(cell => '<th>' + inline(cell) + '</th>').join('')
      html += '</tr></thead><tbody>'
      for (const row of rows) {
        html += '<tr>' + head.map((_, i) => '<td>' + inline(row[i] || '') + '</td>').join('') + '</tr>'
      }
      html += '</tbody></table></div>'
      blocks.push(html)
      continue
    }

    const listMatch = line.match(LIST_ITEM)
    if (listMatch) {
      const ordered = /^\d/.test(listMatch[2])
      const parsed = parseList(lines, index, listMatch[1].length, ordered)
      blocks.push(parsed.html.replace(/^<(ul|ol)/, '<$1 data-source-line="' + blockLine + '"'))
      index = parsed.index
      continue
    }

    const paragraph = [line]
    index++
    const paragraphLine = blockLine
    while (index < lines.length) {
      const next = lines[index]
      if (/^\s*$/.test(next) || /^\s*(#{1,6})\s+/.test(next) || /^\s*```/.test(next) || /^\s*>/.test(next) || /^(\s*)([-*+]|\d+[.)])\s+/.test(next) || /^\s*\|/.test(next)) break
      paragraph.push(next)
      index++
    }
    blocks.push('<p data-source-line="' + paragraphLine + '">' + inline(paragraph.join('\n')).replace(/\n/g, '<br>') + '</p>')
  }

  return blocks.length ? blocks.join('\n') : '<p class="np-md-empty">没有可预览的 Markdown 内容</p>'
}
