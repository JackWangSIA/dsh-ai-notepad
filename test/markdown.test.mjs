import test from 'node:test'
import assert from 'node:assert/strict'
import { renderMarkdown } from '../src/markdown.js'

test('renders four-space nested bullet and ordered lists', () => {
  const html = renderMarkdown([
    '- one',
    '    - two',
    '        - three',
    '    - four',
    '- five',
    '',
    '1. first',
    '    1. nested',
    '2. second',
  ].join('\n'))
  assert.match(html, /<li>one<ul><li>two<ul><li>three<\/li><\/ul><\/li><li>four<\/li><\/ul><\/li><li>five<\/li>/)
  assert.match(html, /<ol data-source-line="7"><li>first<ol><li>nested<\/li><\/ol><\/li><li>second<\/li><\/ol>/)
})

test('keeps task markers on nested items', () => {
  const html = renderMarkdown('- [ ] parent\n    - [x] child')
  assert.match(html, /<li><input type="checkbox" disabled> parent<ul><li><input type="checkbox" disabled checked> child<\/li><\/ul><\/li>/)
})
