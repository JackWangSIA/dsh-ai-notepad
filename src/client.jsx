import React from 'react'
import { NotepadApp, NotepadSettingsPage } from './app.jsx'
import { NotepadIcon } from './icons.jsx'
import { CSS } from './styles.js'
import {
  ensureInitialDoc,
  loadFonts,
  loadHostStatus,
  startInboxPolling,
} from './store.js'

export const name = 'ai-notepad'
export const inject = ['slots']

const STYLE_ATTR = 'data-dsh-ai-notepad-styles'

function installStyles() {
  const existing = document.querySelector('style[' + STYLE_ATTR + ']')
  if (existing) return () => {}
  const style = document.createElement('style')
  style.setAttribute(STYLE_ATTR, '')
  style.textContent = CSS
  document.head.appendChild(style)
  return () => style.remove()
}

export function apply(ctx) {
  ctx.effect(installStyles, 'ai-notepad: styles')

  // The editor is a first-class main-column page. Registering the panel icon and
  // the keyed main cell is what makes `layout.selectPanel('ai-notepad')` work for
  // files delivered by the Windows launcher.
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: 'ai-notepad',
    order: 5,
    label: () => 'AI Notepad',
  }, NotepadIcon))

  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: 'ai-notepad',
  }, NotepadApp))

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: 'ai-notepad-settings',
    order: 80,
    label: () => 'AI Notepad',
  }, NotepadSettingsPage))

  ensureInitialDoc()
  loadHostStatus().then(() => loadFonts())
  let layoutService = typeof ctx.get === 'function' ? ctx.get('layout') : ctx.layout
  try {
    ctx.inject(['layout'], sctx => {
      layoutService = sctx.layout || (typeof sctx.get === 'function' ? sctx.get('layout') : undefined) || layoutService
    })
  } catch {}
  const resolveLayout = () => {
    if (!layoutService && typeof ctx.get === 'function') layoutService = ctx.get('layout')
    return layoutService
  }
  const stopInbox = startInboxPolling(resolveLayout)
  ctx.effect(() => stopInbox, 'ai-notepad: inbox polling')

  // Ensure the page can be summoned by keyboard even when the user is in chat.
  const onKeyDown = event => {
    if (event.defaultPrevented) return
    if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'n') {
      event.preventDefault()
      const current = resolveLayout()
      if (current && typeof current.selectPanel === 'function') current.selectPanel('ai-notepad')
    }
  }
  window.addEventListener('keydown', onKeyDown)
  ctx.effect(() => () => window.removeEventListener('keydown', onKeyDown), 'ai-notepad: shortcut')

  console.log('[ai-notepad] client ready')
}
