'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  HeartPulse,
  MessageSquareText,
  Search,
  ShieldAlert,
  Sparkles,
  Stethoscope
} from 'lucide-react'
import { clsx } from 'clsx'
import type { EmergencyFlowchart } from '@/types/emergency'
import { allFlowcharts, getFlowchartById } from '@/data/emergencyFlowcharts'
import { INTAKE_SYMPTOMS, recommendClinicalRoutes } from '@/lib/clinicalRouting'

interface Props {
  chiefComplaint: string
  complaintDuration: string
  selectedSymptoms: string[]
  selectedFlowchart?: string
  onComplaintChange: (value: string) => void
  onDurationChange: (value: string) => void
  onSymptomsChange: (values: string[]) => void
  onSelectFlowchart: (flowchart: EmergencyFlowchart) => void
}

const groupMeta = {
  geral: { label: 'Sintomas gerais', icon: Stethoscope },
  neurologico: { label: 'Neurológico', icon: Brain },
  cardiorrespiratorio: { label: 'Coração e respiração', icon: HeartPulse },
  gastrointestinal: { label: 'Abdome e digestivo', icon: ActivityIcon },
  urinario: { label: 'Urinário e lombar', icon: Stethoscope },
  pele_exposicao: { label: 'Pele, articulações e exposições', icon: ShieldAlert }
} as const

function ActivityIcon({ className }: { className?: string }) {
  return <HeartPulse className={className} />
}

const urgencyStyles = {
  critica: 'border-red-200 bg-red-50 text-red-800',
  prioritaria: 'border-amber-200 bg-amber-50 text-amber-800',
  rotina: 'border-blue-200 bg-blue-50 text-blue-800'
}

const urgencyLabels = {
  critica: 'Avaliar imediatamente',
  prioritaria: 'Avaliação prioritária',
  rotina: 'Avaliação direcionada'
}

const ClinicalIntakeNavigator: React.FC<Props> = ({
  chiefComplaint,
  complaintDuration,
  selectedSymptoms,
  selectedFlowchart,
  onComplaintChange,
  onDurationChange,
  onSymptomsChange,
  onSelectFlowchart
}) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['geral', 'neurologico', 'cardiorrespiratorio'])
  const [manualOpen, setManualOpen] = useState(false)
  const [manualSearch, setManualSearch] = useState('')
  const suggestions = useMemo(
    () => recommendClinicalRoutes(chiefComplaint, selectedSymptoms),
    [chiefComplaint, selectedSymptoms]
  )
  const hasInput = chiefComplaint.trim().length >= 3 || selectedSymptoms.length > 0
  const hasCriticalFinding = selectedSymptoms.some(id => INTAKE_SYMPTOMS.find(item => item.id === id)?.critical)
  const implemented = useMemo(() => {
    const normalizedSearch = manualSearch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return allFlowcharts
      .filter(item => item.implemented)
      .filter(item => `${item.name} ${item.id}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(normalizedSearch))
      .slice(0, 12)
  }, [manualSearch])

  const toggleSymptom = (id: string) => onSymptomsChange(
    selectedSymptoms.includes(id) ? selectedSymptoms.filter(item => item !== id) : [...selectedSymptoms, id]
  )

  const choose = (flowchartId: string) => {
    const flowchart = getFlowchartById(flowchartId)
    if (flowchart) onSelectFlowchart(flowchart)
  }

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-100">
        <div className="grid gap-5 p-6 lg:grid-cols-[1fr_240px] lg:p-8">
          <div><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-blue-100"><Sparkles className="h-4 w-4" /> Entrada clínica orientada</div><h3 className="mt-3 text-2xl font-black sm:text-3xl">Comece pelo que o paciente está sentindo</h3><p className="mt-2 max-w-3xl text-sm leading-relaxed text-blue-50 sm:text-base">Descreva a queixa com as palavras do paciente e marque os principais sintomas. O sistema apresentará protocolos compatíveis e explicará por que foram sugeridos.</p></div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm backdrop-blur"><ShieldAlert className="h-6 w-6" /><strong className="mt-3 block">Apoio, não diagnóstico</strong><p className="mt-1 text-blue-50">A escolha final continua sendo clínica e pode ser alterada manualmente.</p></div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
        <label className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700"><MessageSquareText className="h-5 w-5 text-blue-600" /> Queixa principal</span><textarea value={chiefComplaint} onChange={event => onComplaintChange(event.target.value)} rows={4} placeholder="Ex.: começou há duas horas com dor forte no peito, suor frio e falta de ar..." className="mt-4 w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base leading-relaxed text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" /><span className="mt-2 block text-xs text-slate-500">Quanto mais específico o relato, melhores serão as sugestões.</span></label>
        <label className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-700"><Clock3 className="h-5 w-5 text-blue-600" /> Início e duração</span><input value={complaintDuration} onChange={event => onDurationChange(event.target.value)} placeholder="Ex.: início súbito há 2 horas" className="mt-4 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" /><p className="mt-3 text-xs leading-relaxed text-slate-500">Registre início súbito ou progressivo e o tempo desde o primeiro sintoma.</p></label>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="text-xl font-black text-slate-950">Sintomas e sinais percebidos</h3><p className="mt-1 text-sm text-slate-600">Selecione tudo que estiver presente na avaliação inicial.</p></div>{selectedSymptoms.length > 0 && <button type="button" onClick={() => onSymptomsChange([])} className="text-sm font-bold text-slate-500 hover:text-red-600">Limpar seleção ({selectedSymptoms.length})</button>}</div>
        <div className="mt-5 space-y-3">{Object.entries(groupMeta).map(([group, meta]) => {
          const Icon = meta.icon
          const open = expandedGroups.includes(group)
          const items = INTAKE_SYMPTOMS.filter(item => item.group === group)
          const selectedCount = items.filter(item => selectedSymptoms.includes(item.id)).length
          return <div key={group} className="overflow-hidden rounded-2xl border border-slate-200"><button type="button" onClick={() => setExpandedGroups(previous => open ? previous.filter(item => item !== group) : [...previous, group])} className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left"><span className="flex items-center gap-3 font-extrabold text-slate-800"><Icon className="h-5 w-5 text-blue-600" />{meta.label}{selectedCount > 0 && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">{selectedCount}</span>}</span><ChevronDown className={clsx('h-5 w-5 text-slate-400 transition-transform', open && 'rotate-180')} /></button>{open && <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(item => { const selected = selectedSymptoms.includes(item.id); return <button key={item.id} type="button" aria-pressed={selected} onClick={() => toggleSymptom(item.id)} className={clsx('flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-bold transition', selected ? item.critical ? 'border-red-400 bg-red-50 text-red-950 ring-2 ring-red-100' : 'border-blue-500 bg-blue-50 text-blue-950 ring-2 ring-blue-100' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300')}><span className={clsx('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', selected ? item.critical ? 'border-red-600 bg-red-600 text-white' : 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 text-transparent')}><CheckCircle2 className="h-3.5 w-3.5" /></span>{item.label}{item.critical && <AlertTriangle className="ml-auto h-4 w-4 shrink-0 text-red-500" />}</button>})}</div>}</div>
        })}</div>
      </section>

      {hasCriticalFinding && <div className="flex gap-3 rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-red-950"><AlertTriangle className="h-6 w-6 shrink-0" /><div><strong className="block">Há sinal potencialmente grave selecionado</strong><p className="mt-1 text-sm">Priorize estabilização, sinais vitais e avaliação imediata. As sugestões abaixo não devem atrasar medidas de emergência.</p></div></div>}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6"><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-100 p-2 text-blue-700"><Sparkles className="h-6 w-6" /></div><div><h3 className="text-xl font-black text-slate-950">Fluxogramas possivelmente relacionados</h3><p className="text-sm text-slate-600">Ordenados pela correspondência com os dados informados.</p></div></div>
        {!hasInput ? <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600"><MessageSquareText className="mx-auto h-9 w-9 text-slate-400" /><p className="mt-3 font-bold">Escreva a queixa ou selecione sintomas para receber sugestões.</p></div> : suggestions.length === 0 ? <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950"><strong>Não encontramos correspondência suficiente.</strong><p className="mt-1 text-sm">Detalhe localização, início, intensidade e sintomas associados ou utilize a busca manual.</p></div> : <div className="mt-5 grid gap-3">{suggestions.map((suggestion, index) => { const flowchart = getFlowchartById(suggestion.flowchartId); if (!flowchart) return null; const selected = selectedFlowchart === suggestion.flowchartId; return <motion.button key={suggestion.flowchartId} type="button" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:index * .04}} onClick={() => choose(suggestion.flowchartId)} className={clsx('group rounded-2xl border p-4 text-left transition-all sm:p-5', selected ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md')}><div className="flex gap-4"><div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black', index === 0 ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600')}>{index + 1}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="text-lg font-black text-slate-950">{flowchart.name}</h4><span className={clsx('rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-wide', urgencyStyles[suggestion.urgency])}>{urgencyLabels[suggestion.urgency]}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase text-slate-600">Compatibilidade {suggestion.confidence}</span></div><p className="mt-1 text-sm text-slate-600">{suggestion.shortDescription}</p><div className="mt-3 flex flex-wrap gap-2">{suggestion.reasons.map(reason => <span key={reason} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{reason}</span>)}</div></div><ArrowRight className="mt-2 h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" /></div></motion.button>})}</div>}

        <div className="mt-6 border-t border-slate-200 pt-5"><button type="button" onClick={() => setManualOpen(previous => !previous)} className="flex w-full items-center justify-between rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-bold text-slate-700 hover:bg-slate-100"><span className="flex items-center gap-2"><Search className="h-5 w-5" /> Já sei qual protocolo usar / escolher manualmente</span><ChevronDown className={clsx('h-5 w-5 transition-transform', manualOpen && 'rotate-180')} /></button>{manualOpen && <div className="mt-4 rounded-2xl border border-slate-200 p-4"><input value={manualSearch} onChange={event => setManualSearch(event.target.value)} placeholder="Buscar protocolo pelo nome..." className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /><div className="mt-3 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">{implemented.map(item => { const flowchart = getFlowchartById(item.id); return flowchart ? <button key={item.id} type="button" onClick={() => onSelectFlowchart(flowchart)} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-left text-sm font-bold text-slate-700 hover:border-blue-400 hover:bg-blue-50">{item.name}<ArrowRight className="h-4 w-4 text-slate-400" /></button> : null })}</div></div>}</div>
      </section>
    </div>
  )
}

export default ClinicalIntakeNavigator
