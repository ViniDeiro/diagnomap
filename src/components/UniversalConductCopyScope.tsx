'use client'

import React, { useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'

type Props = {
  title: string
  children: React.ReactNode
}

const normalizeConductText = (value: string) => value
  .split('\n')
  .map(line => line.replace(/\s+/g, ' ').trim())
  .filter(Boolean)
  .filter(line => !['Dashboard', 'Voltar', 'Reiniciar', 'Confirmar escolha e continuar'].includes(line))
  .join('\n')

const extractConductText = (source: HTMLElement) => {
  const clone = source.cloneNode(true) as HTMLElement
  const originalFields = Array.from(source.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select'))
  const clonedFields = Array.from(clone.querySelectorAll<HTMLElement>('input, textarea, select'))
  clonedFields.forEach((field, index) => {
    const original = originalFields[index]
    const value = original?.value?.trim()
    const replacement = document.createElement('span')
    replacement.textContent = value ? ` ${value}` : ''
    field.replaceWith(replacement)
  })
  clone.querySelectorAll('[data-copy-exclude="true"]').forEach(node => node.remove())
  clone.querySelectorAll<HTMLElement>('button').forEach(button => {
    const label = normalizeConductText(button.innerText)
    const pressed = button.getAttribute('aria-pressed')
    if (pressed === 'false' || /^(dashboard|voltar|reiniciar|confirmar|continuar|concluir)/i.test(label)) {
      button.remove()
      return
    }
    if (pressed === 'true') button.innerText = `Selecionado: ${label}`
  })
  return normalizeConductText(clone.innerText)
}

const writeClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Clipboard unavailable')
}

const UniversalConductCopyScope: React.FC<Props> = ({ title, children }) => {
  const rootRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)

  const copyVisibleConduct = async () => {
    const root = rootRef.current
    const source = root?.querySelector<HTMLElement>('[data-conduct-copy-source]')
      || root?.querySelector<HTMLElement>('main')
      || root
    const body = source ? extractConductText(source) : ''
    const text = [`CONDUTA CLÍNICA — ${title}`, body].filter(Boolean).join('\n\n')

    try {
      await writeClipboard(text)
      setCopied(true)
      setError(false)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError(true)
      window.setTimeout(() => setError(false), 2400)
    }
  }

  return <div ref={rootRef} className="relative">
    {children}
    <div data-copy-exclude="true" className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-2 print:hidden">
      {error && <span role="alert" className="rounded-lg bg-red-950 px-3 py-2 text-xs font-bold text-white shadow-lg">Não foi possível copiar</span>}
      <button type="button" onClick={copyVisibleConduct} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white shadow-2xl ring-1 ring-white/20 transition hover:-translate-y-0.5 hover:bg-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-200" aria-label="Copiar conduta clínica visível">
        {copied ? <Check className="h-5 w-5 text-emerald-300" /> : <Copy className="h-5 w-5" />}
        {copied ? 'Conduta copiada' : 'Copiar conduta'}
      </button>
    </div>
  </div>
}

export default UniversalConductCopyScope
