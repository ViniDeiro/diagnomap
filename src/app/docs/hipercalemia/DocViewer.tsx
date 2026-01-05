"use client"

import React, { useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import Link from 'next/link'

type Doc = { id: string; title: string; markdown: string }

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function mdToEmojiHtml(md: string) {
  const lines = md.split(/\r?\n/)
  let html = ''
  let inList = false
  const closeList = () => {
    if (inList) {
      html += '</ul>'
      inList = false
    }
  }
  const bold = (t: string) => {
    // Emoji when bold starts the line
    let out = t.replace(/^\*\*([^*]+)\*\*\s*/g, '<span class="inline-flex items-center gap-2"><span>🔹</span><span class="font-semibold">$1</span></span> ')
    // Plain bold for remaining occurrences
    out = out.replace(/\*\*([^*]+)\*\*/g, '<span class="font-semibold">$1</span>')
    return out
  }
  for (const raw of lines) {
    const line = raw
    if (/^\s*---\s*$/.test(line)) {
      closeList()
      html += '<hr class="my-6 border-t border-slate-200"/>'
      continue
    }
    let m
    if ((m = line.match(/^#\s+(.*)$/))) {
      closeList()
      html += `<div class="text-2xl font-semibold mb-3">📘 ${escapeHtml(m[1])}</div>`
      continue
    }
    if ((m = line.match(/^##\s+(.*)$/))) {
      closeList()
      html += `<div class="text-xl font-semibold mt-6 mb-2">📌 ${escapeHtml(m[1])}</div>`
      continue
    }
    if ((m = line.match(/^###\s+(.*)$/))) {
      closeList()
      html += `<div class="text-lg font-semibold mt-4 mb-2">➡️ ${escapeHtml(m[1])}</div>`
      continue
    }
    if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
      const item = bold(escapeHtml(m[1]))
      if (!inList) {
        html += '<ul class="list-none space-y-2 my-2">'
        inList = true
      }
      html += `<li class="flex items-start"><span class="mr-2">•</span><span>${item}</span></li>`
      continue
    }
    if (/^\s*$/.test(line)) {
      closeList()
      html += '<div class="h-2"></div>'
      continue
    }
    closeList()
    let content = bold(escapeHtml(line))
    if (/^SE\b/.test(line)) {
      content = `🔹 ${content}`
    } else if (/^ENTÃO\b/.test(line)) {
      content = `✅ ${content}`
    }
    html += `<p class="mb-2 leading-relaxed">${content}</p>`
  }
  closeList()
  return html
}

export default function DocViewer({ docs }: { docs: Doc[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState(false)
  const [active, setActive] = useState(0)
  const rendered = useMemo(() => mdToEmojiHtml(docs[active]?.markdown || ''), [docs, active])

  const handleExport = async () => {
    if (!ref.current) return
    setSaving(true)
    try {
      const canvas = await html2canvas(ref.current, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      const filename = docs[active]?.id ? `fluxograma-${docs[active].id}.pdf` : 'fluxograma.pdf'
      pdf.save(filename)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-slate-800 to-slate-900 text-white shadow-xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent" />
          <div className="relative px-8 pt-8 pb-6 flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-wide text-white/80">Documento</div>
              <h1 className="text-2xl md:text-3xl font-semibold">Fluxogramas para Validação</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors ring-1 ring-white/20">
                Dashboard
              </Link>
              <button
                onClick={handleExport}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                {saving ? 'Gerando...' : 'Baixar PDF'}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-200/60">
          <div className="px-4 pt-4 flex flex-wrap gap-2 border-b border-slate-200">
            {docs.map((d, i) => (
              <button
                key={d.id}
                onClick={() => setActive(i)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active === i ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {d.title}
              </button>
            ))}
          </div>
          <div ref={ref} className="p-8">
            <div className="prose prose-slate max-w-none">
              <div dangerouslySetInnerHTML={{ __html: rendered }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
