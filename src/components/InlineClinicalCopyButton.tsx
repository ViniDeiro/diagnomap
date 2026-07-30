'use client'

import React, { useState } from 'react'
import { ClipboardCheck, Copy } from 'lucide-react'

interface Props {
  targetId?: string
  text?: string
  label?: string
  className?: string
}

const readableTextFrom = (targetId: string) => {
  const source = document.getElementById(targetId)
  if (!source) return ''
  const clone = source.cloneNode(true) as HTMLElement
  clone.querySelectorAll('[data-copy-exclude="true"], button, input, textarea, select').forEach(node => node.remove())
  return (clone.innerText || clone.textContent || '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
}

const InlineClinicalCopyButton: React.FC<Props> = ({ targetId, text, label = 'Copiar conduta', className = '' }) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    const content = (text || (targetId ? readableTextFrom(targetId) : '')).trim()
    if (!content) return
    await navigator.clipboard.writeText(content)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      data-copy-exclude="true"
      onClick={copy}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 ${className}`}
    >
      {copied ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Conduta copiada' : label}
    </button>
  )
}

export default InlineClinicalCopyButton
