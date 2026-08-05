'use client'

import React from 'react'
import { ImageIcon } from 'lucide-react'

export const UNIVERSAL_IMAGING_RESULTS_KEY = '__universal_imaging_results'

export type UniversalImagingRecord = {
  chestXrayStatus: '' | 'solicitado' | 'pendente' | 'realizado' | 'indisponivel'
  chestXrayReport: string
  chestXrayImpression: string
  notes: string
}

const emptyRecord: UniversalImagingRecord = { chestXrayStatus: '', chestXrayReport: '', chestXrayImpression: '', notes: '' }

export const parseUniversalImagingRecord = (raw?: string | null): UniversalImagingRecord => {
  if (!raw) return emptyRecord
  try { return { ...emptyRecord, ...JSON.parse(raw) } } catch { return emptyRecord }
}

type Props = { value?: string; onChange: (value: string) => void; title?: string }

export default function UniversalImagingNotebook({ value, onChange, title = 'Registro de radiografia de tórax' }: Props) {
  const record = parseUniversalImagingRecord(value)
  const update = (patch: Partial<UniversalImagingRecord>) => onChange(JSON.stringify({ ...record, ...patch, updatedAt: new Date().toISOString() }))

  return <section className="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-sm">
    <header className="flex items-center gap-3 border-b border-sky-100 bg-sky-50 p-4 sm:p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-700 text-white"><ImageIcon className="h-5 w-5" /></span>
      <div><h3 className="font-extrabold text-slate-950">{title}</h3><p className="text-sm text-slate-600">Documente solicitação, disponibilidade e resultado para a evolução clínica.</p></div>
    </header>
    <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2">
      <label className="text-sm font-bold text-slate-700">Situação do RX de tórax<select value={record.chestXrayStatus} onChange={(event) => update({ chestXrayStatus: event.target.value as UniversalImagingRecord['chestXrayStatus'] })} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"><option value="">Selecione</option><option value="solicitado">Solicitado</option><option value="pendente">Aguardando resultado</option><option value="realizado">Realizado</option><option value="indisponivel">Indisponível no serviço</option></select></label>
      <label className="text-sm font-bold text-slate-700">Impressão diagnóstica<input value={record.chestXrayImpression} onChange={(event) => update({ chestXrayImpression: event.target.value })} placeholder="Ex.: infiltrado em base direita" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
      <label className="text-sm font-bold text-slate-700 md:col-span-2">Resultado/laudo<textarea value={record.chestXrayReport} onChange={(event) => update({ chestXrayReport: event.target.value })} rows={4} placeholder="Transcreva os achados relevantes do exame" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
      <label className="text-sm font-bold text-slate-700 md:col-span-2">Observações e pendências<textarea value={record.notes} onChange={(event) => update({ notes: event.target.value })} rows={2} placeholder="Horário, comparação, exame pendente ou necessidade de reavaliação" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" /></label>
    </div>
  </section>
}
