'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Droplets,
  FileText,
  Hospital,
  Microscope,
  Pill,
  RotateCcw,
  ShieldCheck,
  Stethoscope
} from 'lucide-react'
import { clsx } from 'clsx'
import type { EmergencyOption, EmergencyPatient, EmergencyStep } from '@/types/emergency'
import { ituFlowchart } from '@/data/emergencyFlowcharts'
import { buildItuPrescriptionItems, ITU_PRESCRIBER } from '@/lib/itu'
import { patientService } from '@/services/patientService'
import UniversalCareTransition, { type CareTransitionData } from './UniversalCareTransition'
import { UNIVERSAL_ASSESSMENT_ANSWER_KEY } from './UniversalClinicalAssessment'

interface Props {
  patient: EmergencyPatient
  initialStep: string
  initialHistory: string[]
  initialAnswers: Record<string, string>
  onUpdate: (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, riskGroup?: string) => void
  onComplete: () => void
  onBack?: () => void
  onOpenReport?: () => void
}

const phaseByStep = (step: string) => {
  if (/apresentacao|complicadores|bacteriuria|pielo_sepse/.test(step)) return 'Classificação'
  if (/exames/.test(step)) return 'Investigação'
  if (/antibiotico|cistite_(fos|nitro|cef|sulfa)|estabilizacao/.test(step)) return 'Tratamento'
  if (/aguarda|internacao|hospitalar|criterios_alta|manutencao/.test(step)) return 'Destino'
  return 'Conclusão'
}

const iconForStep = (step: EmergencyStep) => {
  if (step.type === 'result') return CheckCircle2
  if (/exames/.test(step.id)) return Microscope
  if (/antibiotico|cistite_/.test(step.id)) return Pill
  if (/internacao|hospitalar|aguarda/.test(step.id)) return Hospital
  if (step.critical) return AlertTriangle
  return Stethoscope
}

const optionTone = (option: EmergencyOption, selected: boolean) => selected
  ? option.critical ? 'border-red-500 bg-red-50 ring-2 ring-red-100' : 'border-cyan-600 bg-cyan-50 ring-2 ring-cyan-100'
  : option.critical ? 'border-red-200 bg-white hover:border-red-400 hover:bg-red-50/40' : 'border-slate-200 bg-white hover:border-cyan-400 hover:bg-cyan-50/40'

const ITUFlowchartInteractive: React.FC<Props> = ({ patient, initialStep, initialHistory, initialAnswers, onUpdate, onComplete, onBack, onOpenReport }) => {
  const safeInitialStep = ituFlowchart.steps[initialStep] ? initialStep : ituFlowchart.initialStep
  const [stage, setStage] = useState(safeInitialStep)
  const [history, setHistory] = useState(initialHistory.filter(item => Boolean(ituFlowchart.steps[item])))
  const [answers, setAnswers] = useState(initialAnswers)
  const [selectedValue, setSelectedValue] = useState(initialAnswers[safeInitialStep] || '')
  const [showCompletion, setShowCompletion] = useState(false)
  const [notice, setNotice] = useState('')
  const step = ituFlowchart.steps[stage]
  const isFinal = ituFlowchart.finalSteps.includes(stage)
  const isTransition = stage === 'itu_cuidados_aguarda_internacao' || stage === 'itu_cuidados_aguarda_enfermaria'
  const transitionKey = `__care_transition_${stage}`
  const storedTransition = useMemo<CareTransitionData | null>(() => {
    try { return answers[transitionKey] ? JSON.parse(answers[transitionKey]) : null } catch { return null }
  }, [answers, transitionKey])
  const progress = isFinal ? 100 : Math.min(94, 12 + history.length * 8)
  const StepIcon = iconForStep(step)
  const phase = phaseByStep(stage)

  const riskLabel = (nextStep: string) => /sepse|internacao|hospitalar|aguarda/.test(nextStep) ? 'ITU hospitalar' : /pielo/.test(nextStep) ? 'Pielonefrite' : 'ITU'

  const moveTo = (nextStep: string, value?: string, additionalAnswers: Record<string, string> = {}) => {
    const nextHistory = [...history, stage]
    const nextAnswers = { ...answers, ...additionalAnswers, ...(value ? { [stage]: value } : {}) }
    const prescriptionItems = buildItuPrescriptionItems(value)
    if (prescriptionItems.length > 0) patientService.replacePrescriptionsByPrescriber(patient.id, ITU_PRESCRIBER, prescriptionItems)
    setHistory(nextHistory); setAnswers(nextAnswers); setStage(nextStep); setSelectedValue(nextAnswers[nextStep] || ''); setNotice(''); setShowCompletion(false)
    onUpdate(patient.id, nextStep, nextHistory, nextAnswers, ituFlowchart.finalSteps.includes(nextStep) ? 100 : Math.min(94, progress + 8), riskLabel(nextStep))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmSelection = () => {
    const option = (step.options || []).find(item => item.value === selectedValue)
    if (!option) { setNotice('Selecione uma opção para continuar.'); return }
    moveTo(option.nextStep, option.value)
  }

  const persistTransition = (transition: CareTransitionData) => {
    const nextAnswers = { ...answers, [transitionKey]: JSON.stringify(transition) }
    setAnswers(nextAnswers)
    onUpdate(patient.id, stage, history, nextAnswers, progress, riskLabel(stage))
  }

  const confirmTransition = (transition: CareTransitionData) => {
    const option = step.options?.[0]
    if (!option) return
    moveTo(option.nextStep, option.value, { [transitionKey]: JSON.stringify(transition) })
  }

  const goBack = () => {
    if (showCompletion) { setShowCompletion(false); return }
    if (!history.length) { onBack?.(); return }
    const previous = history[history.length - 1]
    const nextHistory = history.slice(0, -1)
    setHistory(nextHistory); setStage(previous); setSelectedValue(answers[previous] || ''); setNotice('')
    onUpdate(patient.id, previous, nextHistory, answers, Math.max(8, progress - 8), patient.emergencyState.riskGroup)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const restart = () => {
    const preserved: Record<string, string> = {}
    if (answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY]) preserved[UNIVERSAL_ASSESSMENT_ANSWER_KEY] = answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY]
    patientService.replacePrescriptionsByPrescriber(patient.id, ITU_PRESCRIBER, [])
    setStage(ituFlowchart.initialStep); setHistory([]); setAnswers(preserved); setSelectedValue(''); setShowCompletion(false); setNotice('')
    onUpdate(patient.id, ituFlowchart.initialStep, [], preserved, 8, 'ITU')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const finish = () => {
    const nextAnswers = { ...answers, __itu_completed_at: new Date().toISOString() }
    setAnswers(nextAnswers); setShowCompletion(true)
    onUpdate(patient.id, stage, [...history, stage], nextAnswers, 100, riskLabel(stage))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-cyan-50/50 pb-12">
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div><p className="text-lg font-black text-slate-950">{patient.name}</p><p className="text-xs font-semibold text-slate-500">{patient.age ? `${patient.age} anos` : 'Idade não informada'} · {phase}</p></div>
        <div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={onComplete} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"><ChevronLeft className="h-4 w-4" /> Dashboard</button><button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-950"><ArrowLeft className="h-4 w-4" /> Voltar</button><button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-bold text-cyan-950"><RotateCcw className="h-4 w-4" /> Reiniciar</button></div>
      </div>
    </nav>

    <header className={clsx('relative overflow-hidden px-5 py-7 text-white shadow-lg sm:px-8', step.critical ? 'bg-gradient-to-r from-red-700 via-rose-700 to-orange-600' : 'bg-gradient-to-r from-cyan-800 via-blue-700 to-indigo-700')}>
      <div className="mx-auto flex max-w-6xl items-center gap-4"><span className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/25"><StepIcon className="h-8 w-8" /></span><div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/75">ITU · {phase}</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">{step.title}</h1><p className="mt-1 text-sm text-white/85 sm:text-base">{step.description}</p></div><div className="hidden text-right sm:block"><strong className="text-2xl">{showCompletion ? 100 : progress}%</strong><p className="text-xs text-white/70">do protocolo</p></div></div>
      <div className="absolute bottom-0 left-0 h-1.5 bg-white/35 transition-all" style={{ width: `${showCompletion ? 100 : progress}%` }} />
    </header>

    <main className="mx-auto mt-7 max-w-6xl px-4 sm:px-6">
      {showCompletion ? <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <section className="rounded-[1.75rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15"><CheckCircle2 className="h-8 w-8" /></span><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Protocolo registrado</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">Atendimento de ITU finalizado</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-50">Classificação, exames, tratamento e destino deste caminho foram preservados no relatório clínico.</p></div></div><span className="w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-extrabold">100% concluído</span></div></section>
        <section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Apresentação</p><p className="mt-2 text-lg font-black text-slate-950">{answers.itu_apresentacao === 'cistite' ? 'Cistite' : answers.itu_apresentacao === 'pielonefrite' ? 'Pielonefrite' : answers.itu_apresentacao === 'bacteriuria_assintomatica' ? 'Bacteriúria assintomática' : 'Avaliação urinária'}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Desfecho</p><p className="mt-2 text-lg font-black text-slate-950">{step.title}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Etapas registradas</p><p className="mt-2 text-2xl font-black text-slate-950">{new Set([...history, stage]).size}</p></div></section>
        <section className="rounded-[1.75rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-6"><div className="flex items-start gap-4"><span className="rounded-xl bg-cyan-700 p-3 text-white"><ClipboardCheck className="h-5 w-5" /></span><div><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Síntese clínica</p><h3 className="mt-1 text-xl font-black text-slate-950">{step.title}</h3><p className="mt-2 text-sm leading-relaxed text-cyan-950">Consulte o relatório para revisar sintomas, classificação, antimicrobiano selecionado, cuidados durante eventual espera por leito e orientações finais.</p></div></div></section>
        <div className="grid gap-3 sm:grid-cols-2">{onOpenReport && <button type="button" onClick={onOpenReport} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300 bg-white px-5 py-4 font-extrabold text-cyan-950"><FileText className="h-5 w-5" /> Abrir relatório completo</button>}<button type="button" onClick={onComplete} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-800 px-5 py-4 font-extrabold text-white"><CheckCircle2 className="h-5 w-5" /> Concluir e ir ao dashboard</button></div>
      </motion.div> : <motion.section key={stage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7">
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-950"><Droplets className="mt-0.5 h-5 w-5 shrink-0" /><p className="text-sm"><strong>Decisão clínica guiada:</strong> selecione o cenário que corresponde ao paciente. A escolha ficará registrada no relatório e determinará somente o próximo ramo previsto.</p></div>
        {step.content && <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: step.content }} />}

        {isTransition && <div className="mt-6"><UniversalCareTransition destination="ward" context={stage === 'itu_cuidados_aguarda_internacao' ? 'itu sepse urinária com internação solicitada' : 'itu pielonefrite hospitalar'} value={storedTransition} onChange={persistTransition} onConfirmed={confirmTransition} /></div>}

        {!isTransition && !isFinal && <div className="mt-6 space-y-4"><div className={clsx('grid gap-3', (step.options || []).length > 1 && 'md:grid-cols-2')}>{(step.options || []).map(option => { const selected = selectedValue === option.value; return <button key={option.value || option.text} type="button" aria-pressed={selected} onClick={() => { setSelectedValue(option.value || ''); setNotice('') }} className={clsx('group flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md', optionTone(option, selected))}><span className={clsx('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', selected ? option.critical ? 'border-red-600 bg-red-600 text-white' : 'border-cyan-700 bg-cyan-700 text-white' : 'border-slate-300 text-transparent')}><CheckCircle2 className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block text-slate-950">{option.text}</strong>{option.description && <span className="mt-1 block text-sm leading-relaxed text-slate-600">{option.description}</span>}</span><ChevronRight className={clsx('mt-1 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5', option.critical ? 'text-red-500' : 'text-cyan-600')} /></button>})}</div><button type="button" disabled={!selectedValue} onClick={confirmSelection} className={clsx('flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-300', (step.options || []).find(option => option.value === selectedValue)?.critical ? 'bg-red-700 hover:bg-red-800' : 'bg-cyan-800 hover:bg-cyan-900')}>Confirmar escolha e continuar <ChevronRight className="h-5 w-5" /></button></div>}

        {isFinal && <div className="mt-6 space-y-4"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"><ShieldCheck className="mr-2 inline h-5 w-5" /><strong>Antes de concluir:</strong> confirme estabilidade, alergias, função renal, resultados de cultura pendentes, orientação de retorno e destino assistencial.</div><button type="button" onClick={finish} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-extrabold text-white hover:bg-emerald-800"><CheckCircle2 className="h-5 w-5" /> Registrar desfecho e concluir</button></div>}

        {notice && <p role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-950"><AlertTriangle className="mr-2 inline h-4 w-4" />{notice}</p>}
        <footer className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5"><button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-5 w-5" /> Voltar</button><span className="hidden text-xs font-semibold text-slate-500 sm:block">Escolhas e condutas permanecem no relatório clínico.</span></footer>
      </motion.section>}
    </main>
  </div>
}

export default ITUFlowchartInteractive
