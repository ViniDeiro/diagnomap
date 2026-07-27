'use client'

import React, { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Plus, TestTube2, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'

export const UNIVERSAL_LAB_RESULTS_KEY = '__universal_lab_results'

export type UniversalLabEntry = {
  id: string
  test: string
  value: string
  unit: string
  reference: string
  critical: boolean
  collectedAt: string
}

export type UniversalLabNotebookData = {
  entries: UniversalLabEntry[]
  notes: string
  updatedAt?: string
}

export const parseUniversalLabNotebook = (raw?: string | null): UniversalLabNotebookData => {
  if (!raw) return { entries: [], notes: '' }
  try {
    const parsed = JSON.parse(raw)
    return { entries: Array.isArray(parsed?.entries) ? parsed.entries : [], notes: typeof parsed?.notes === 'string' ? parsed.notes : '', updatedAt: parsed?.updatedAt }
  } catch { return { entries: [], notes: '' } }
}

interface Props {
  value?: string
  onChange: (serialized: string) => void
  title?: string
  defaultOpen?: boolean
  suggestedTests?: string[]
}

const blankEntry = (test = ''): UniversalLabEntry => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, test, value: '', unit: '', reference: '', critical: false, collectedAt: new Date().toISOString().slice(0, 16) })

const UniversalLabNotebook: React.FC<Props> = ({ value, onChange, title = 'Resultados de exames', defaultOpen = false, suggestedTests = [] }) => {
  const [open, setOpen] = useState(defaultOpen)
  const data = useMemo(() => parseUniversalLabNotebook(value), [value])
  const save = (next: UniversalLabNotebookData) => onChange(JSON.stringify({ ...next, updatedAt: new Date().toISOString() }))
  const updateEntry = (id: string, patch: Partial<UniversalLabEntry>) => save({ ...data, entries: data.entries.map(entry => entry.id === id ? { ...entry, ...patch } : entry) })
  const add = (test = '') => { save({ ...data, entries: [...data.entries, blankEntry(test)] }); setOpen(true) }
  const filled = data.entries.filter(entry => entry.test.trim() && entry.value.trim()).length
  const critical = data.entries.filter(entry => entry.critical).length

  return <section className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm">
    <button type="button" onClick={() => setOpen(previous => !previous)} className="flex w-full items-center gap-3 p-4 text-left sm:p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-700 text-white"><TestTube2 className="h-5 w-5" /></span>
      <span className="min-w-0 flex-1"><strong className="block text-slate-950">{title}</strong><span className="text-sm text-slate-600">{filled ? `${filled} resultado(s) preenchido(s)` : 'Abra para anotar valores laboratoriais e tendências'}{critical ? ` · ${critical} crítico(s)` : ''}</span></span>
      {open ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
    </button>
    {open && <div className="max-h-[68vh] space-y-5 overflow-y-auto border-t border-cyan-100 bg-cyan-50/35 p-4 sm:p-5">
      {suggestedTests.length > 0 && <div><p className="mb-2 text-xs font-black uppercase tracking-wider text-cyan-800">Adicionar exame sugerido</p><div className="flex flex-wrap gap-2">{suggestedTests.map(test => <button key={test} type="button" onClick={() => add(test)} className="rounded-full border border-cyan-300 bg-white px-3 py-2 text-xs font-bold text-cyan-900 hover:bg-cyan-100">+ {test}</button>)}</div></div>}
      <div className="space-y-3">{data.entries.map(entry => <article key={entry.id} className={clsx('rounded-2xl border bg-white p-4', entry.critical ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200')}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><label className="text-xs font-bold text-slate-600 lg:col-span-2">Exame<input value={entry.test} onChange={event => updateEntry(entry.id, { test: event.target.value })} placeholder="Ex.: Plaquetas" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950" /></label><label className="text-xs font-bold text-slate-600">Resultado<input value={entry.value} onChange={event => updateEntry(entry.id, { value: event.target.value })} placeholder="Valor" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950" /></label><label className="text-xs font-bold text-slate-600">Unidade<input value={entry.unit} onChange={event => updateEntry(entry.id, { unit: event.target.value })} placeholder="Unidade" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950" /></label><label className="text-xs font-bold text-slate-600">Coleta<input type="datetime-local" value={entry.collectedAt} onChange={event => updateEntry(entry.id, { collectedAt: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950" /></label></div>
        <div className="mt-3 flex flex-wrap items-center gap-3"><input value={entry.reference} onChange={event => updateEntry(entry.id, { reference: event.target.value })} placeholder="Referência/tendência (opcional)" className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" /><button type="button" onClick={() => updateEntry(entry.id, { critical: !entry.critical })} className={clsx('inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black', entry.critical ? 'border-red-400 bg-red-50 text-red-800' : 'border-slate-300 bg-white text-slate-600')}><AlertTriangle className="h-4 w-4" /> Resultado crítico</button><button type="button" aria-label="Excluir resultado" onClick={() => save({ ...data, entries: data.entries.filter(item => item.id !== entry.id) })} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div>
      </article>)}</div>
      <button type="button" onClick={() => add()} className="inline-flex items-center gap-2 rounded-xl border border-cyan-300 bg-white px-4 py-3 font-bold text-cyan-900"><Plus className="h-4 w-4" /> Adicionar outro resultado</button>
      <label className="block text-sm font-bold text-slate-700">Interpretação, tendência e pendências<textarea value={data.notes} onChange={event => save({ ...data, notes: event.target.value })} rows={4} placeholder="Ex.: plaquetas em queda; repetir hemograma em 6 horas; resultado comunicado à equipe..." className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium" /></label>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"><CheckCircle2 className="mr-2 inline h-4 w-4" />Os dados são salvos no atendimento e podem ser atualizados durante a evolução.</div>
    </div>}
  </section>
}

export default UniversalLabNotebook
