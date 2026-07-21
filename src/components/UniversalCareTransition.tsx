'use client'

import React from 'react'
import { Activity, CheckCircle2, Hospital, ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'

export type CareDestination = 'observation' | 'ward' | 'transfer' | 'icu'

export interface CareTransitionData {
  destination: CareDestination
  requestedAt: string
  receivingUnit: string
  responsibleTeam: string
  notes: string
  checks: string[]
  transferConfirmed: boolean
  confirmedAt?: string
}

const destinationCopy: Record<CareDestination, { title: string; subtitle: string; tone: string }> = {
  observation: { title: 'Aguardando vaga de observação', subtitle: 'O atendimento permanece ativo até a passagem formal do cuidado.', tone: 'from-sky-700 to-cyan-700' },
  ward: { title: 'Aguardando leito de enfermaria', subtitle: 'Manter tratamento, vigilância e reavaliações até a transferência.', tone: 'from-indigo-700 to-blue-700' },
  transfer: { title: 'Aguardando transferência', subtitle: 'Garantir estabilidade, documentação e transporte monitorizado.', tone: 'from-violet-700 to-indigo-800' },
  icu: { title: 'Aguardando leito de UTI', subtitle: 'Manter suporte intensivo e reavaliação contínua até a transferência.', tone: 'from-red-700 to-rose-800' }
}

const safetyChecks: Record<CareDestination, string[]> = {
  observation: ['Monitorização definida', 'Prescrições em curso', 'Reavaliação programada', 'Sinais de piora orientados'],
  ward: ['Leito solicitado/regulado', 'Monitorização mantida', 'Medicações e hidratação mantidas', 'Exames e pendências revisados', 'Passagem de caso preparada'],
  transfer: ['Serviço receptor contatado', 'Aceite ou regulação documentados', 'Estabilidade para transporte verificada', 'Documentos e exames reunidos', 'Transporte e monitorização definidos'],
  icu: ['UTI/equipe crítica acionada', 'Monitorização contínua', 'ABCDE reavaliado', 'Acessos, oxigênio e suporte mantidos', 'Drogas e infusões conferidas', 'Passagem de caso estruturada']
}

export const inferCareDestination = (step?: { id?: string; title?: string; description?: string; group?: string } | null): CareDestination | null => {
  if (!step) return null
  const text = `${step.id || ''} ${step.title || ''} ${step.description || ''} ${step.group || ''}`.toLowerCase()
  if (/alta|ambulator|domic|exclu[ií]d|sem interna|tratamento de suporte/.test(text)) return null
  if (/uti|intensiv|cr[ií]tic|neurocr[ií]tic/.test(text)) return 'icu'
  if (/transfer|refer[eê]ncia|encaminh/.test(text)) return 'transfer'
  if (/enfermaria|interna[cç][aã]o|internar|hospitalar|admitir/.test(text)) return 'ward'
  if (/observa[cç][aã]o|observar/.test(text)) return 'observation'
  return null
}

interface Props {
  destination: CareDestination
  value?: CareTransitionData | null
  onChange: (value: CareTransitionData) => void
  onConfirmed: (value: CareTransitionData) => void
}

const UniversalCareTransition: React.FC<Props> = ({ destination, value, onChange, onConfirmed }) => {
  const copy = destinationCopy[destination]
  const data: CareTransitionData = value?.destination === destination ? value : {
    destination,
    requestedAt: new Date().toISOString(),
    receivingUnit: '',
    responsibleTeam: '',
    notes: '',
    checks: [],
    transferConfirmed: false
  }
  const requiredChecks = safetyChecks[destination]
  const update = (patch: Partial<CareTransitionData>) => onChange({ ...data, ...patch })
  const toggle = (item: string) => update({ checks: data.checks.includes(item) ? data.checks.filter(entry => entry !== item) : [...data.checks, item] })
  const ready = data.receivingUnit.trim().length > 0 && requiredChecks.every(item => data.checks.includes(item))

  return (
    <div className="space-y-5">
      <header className={clsx('overflow-hidden rounded-2xl bg-gradient-to-r p-6 text-white shadow-xl', copy.tone)}>
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25"><Hospital className="h-8 w-8" /></span>
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-white/75">Transição assistencial obrigatória</p><h2 className="mt-1 text-2xl font-black">{copy.title}</h2><p className="mt-2 text-sm text-white/85">{copy.subtitle}</p></div>
        </div>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2">
        <label className="text-sm font-bold text-slate-800">Destino ou unidade receptora<input value={data.receivingUnit} onChange={event => update({ receivingUnit: event.target.value })} placeholder="Ex.: UTI adulta, enfermaria clínica, sala de observação" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium" /></label>
        <label className="text-sm font-bold text-slate-800">Equipe/profissional receptor<input value={data.responsibleTeam} onChange={event => update({ responsibleTeam: event.target.value })} placeholder="Nome, equipe ou regulação" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-medium" /></label>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-4 flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-indigo-700" /><div><h3 className="font-black text-slate-950">Checklist durante a espera</h3><p className="text-sm text-slate-600">As medidas devem continuar enquanto o leito ou transporte não estiver disponível.</p></div></div>
        <div className="grid gap-3 md:grid-cols-2">{requiredChecks.map(item => <button key={item} type="button" onClick={() => toggle(item)} className={clsx('flex items-center gap-3 rounded-xl border-2 p-4 text-left text-sm font-bold transition-all', data.checks.includes(item) ? 'border-emerald-400 bg-emerald-50 text-emerald-950' : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300')}><span className={clsx('flex h-6 w-6 shrink-0 items-center justify-center rounded-md border', data.checks.includes(item) ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300')}>{data.checks.includes(item) ? '✓' : ''}</span>{item}</button>)}</div>
      </section>

      <label className="block rounded-2xl border border-slate-200 bg-white p-5 text-sm font-bold text-slate-800">Pendências, intercorrências e condições do transporte<textarea value={data.notes} onChange={event => update({ notes: event.target.value })} rows={4} placeholder="Registre mudanças clínicas, resultados pendentes, suporte em curso e condições necessárias para a transferência." className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 font-medium" /></label>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><Activity className="mr-2 inline h-5 w-5" /><strong>O fluxograma permanece ativo:</strong> qualquer deterioração exige nova avaliação e escalonamento imediato, sem esperar o leito.</div>
      <button type="button" disabled={!ready} onClick={() => { const confirmed = { ...data, transferConfirmed: true, confirmedAt: new Date().toISOString() }; onChange(confirmed); onConfirmed(confirmed) }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-4 font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-300"><CheckCircle2 className="h-5 w-5" />Confirmar passagem do cuidado e gerar relatório final</button>
    </div>
  )
}

export default UniversalCareTransition
