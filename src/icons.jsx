import React from 'react'
const h = React.createElement

function Svg({ size = 16, children, viewBox = '0 0 24 24', ...props }) {
  return h('svg', {
    width: size,
    height: size,
    viewBox,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  }, children)
}

export function NotepadIcon({ size = 18 }) {
  return h(Svg, { size, viewBox: '0 0 64 64' },
    h('rect', { x: 9, y: 7, width: 38, height: 50, rx: 6, fill: 'currentColor', opacity: 0.12, stroke: 'currentColor', strokeWidth: 2.6 }),
    h('path', { d: 'M19 21h18M19 29h18M19 37h12M19 45h9', strokeWidth: 2.8 }),
    h('path', { d: 'M47 31l2.4 6.6L56 40l-6.6 2.4L47 49l-2.4-6.6L38 40l6.6-2.4z', fill: 'currentColor', stroke: 'none' }),
  )
}

export function NewIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z' }), h('path', { d: 'M14 3v5h5M9 13h6M12 10v6' })) }
export function OpenIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }), h('path', { d: 'M3 10h18' })) }
export function SaveIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M5 3h11l3 3v15H5z' }), h('path', { d: 'M8 3v6h8V3M8 21v-7h8v7' })) }
export function SettingsIcon({ size }) { return h(Svg, { size }, h('circle', { cx: 12, cy: 12, r: 3 }), h('path', { d: 'M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21h-4v-.08a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3v-4h.05A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3h4v.05a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.6.7 1 1.55 1H21v4h-.05c-.7 0-1.34.4-1.55 1z' })) }
export function CloseIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M6 6l12 12M18 6L6 18' })) }
export function SparkIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z' }), h('path', { d: 'M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z' })) }
export function DiffIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M6 3v18M18 3v18M3 7h6M15 17h6' }), h('path', { d: 'M9 7l-3 3-3-3M15 17l3-3 3 3' })) }
export function LinkIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1' }), h('path', { d: 'M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1' })) }
export function ExternalIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M14 3h7v7M21 3l-9 9' }), h('path', { d: 'M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6' })) }
export function EyeIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z' }), h('circle', { cx: 12, cy: 12, r: 2.6 })) }
export function EditIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M12 20h9' }), h('path', { d: 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z' })) }
export function CopyIcon({ size }) { return h(Svg, { size }, h('rect', { x: 8, y: 8, width: 12, height: 12, rx: 2 }), h('path', { d: 'M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2' })) }
export function CheckIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M4 12l5 5L20 6' })) }
export function ReloadIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M20 11a8 8 0 1 0-2.3 5.7' }), h('path', { d: 'M20 4v7h-7' })) }
export function WarnIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M12 3l10 18H2z' }), h('path', { d: 'M12 9v5M12 18h.01' })) }
export function TrashIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14' })) }
export function ChevronDownIcon({ size }) { return h(Svg, { size }, h('path', { d: 'M6 9l6 6 6-6' })) }
export function SearchIcon({ size }) { return h(Svg, { size }, h('circle', { cx: 11, cy: 11, r: 6.5 }), h('path', { d: 'M16 16l4.5 4.5' })) }
export function InfoIcon({ size }) { return h(Svg, { size }, h('circle', { cx: 12, cy: 12, r: 9 }), h('path', { d: 'M12 11v5M12 8h.01' })) }
