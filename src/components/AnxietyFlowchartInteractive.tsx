'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Pill,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope
} from 'lucide-react'
import { clsx } from 'clsx'
import type { EmergencyPatient, EmergencyType } from '@/types/emergency'
import { ansiedadeFlowchart } from '@/data/emergencyFlowcharts'
import {
  ANSIEDADE_MEDICATION_OPTIONS,
  ANSIEDADE_PRESCRIBER,
  buildAnsiedadePrescriptionItems,
  type AnsiedadeMedicationCode
} from '@/lib/ansiedade'
import { patientService } from '@/services/patientService'
import { UNIVERSAL_ASSESSMENT_ANSWER_KEY } from './UniversalClinicalAssessment'

type AnxietyStage = keyof typeof ansiedadeFlowchart.steps
type MentalPlan = 'urgent' | 'ambulatory'

interface Props {
  patient: EmergencyPatient
  initialStep: string
  initialHistory: string[]
  initialAnswers: Record<string, string>
  onUpdate: (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, riskGroup?: string) => void
  onComplete: () => void
  onBack?: () => void
  onOpenReport?: () => void
  onSwitchFlowchart?: (targetFlowchart: EmergencyType) => void
}

const symptomOptions = [
  ['cardiovascular', 'Palpitação, taquicardia ou sudorese', 'Sintomas autonômicos percebidos durante a crise.'],
  ['respiratory', 'Sensação de falta de ar ou aperto', 'Hiperventilação, sensação de asfixia ou desconforto torácico.'],
  ['neurological', 'Tontura, tremor ou parestesias', 'Formigamentos, instabilidade, calafrios ou ondas de calor.'],
  ['cognitive', 'Medo intenso ou perda de controle', 'Medo de morrer, enlouquecer ou não conseguir controlar a crise.'],
  ['dissociative', 'Desrealização ou despersonalização', 'Sensação de irrealidade ou de afastamento de si.'],
  ['gastrointestinal', 'Náusea ou desconforto abdominal', 'Manifestação gastrointestinal associada ao episódio.']
] as const

const assessmentOptions = [
  ['vitals', 'Sinais vitais aferidos'],
  ['oximetry', 'Oximetria avaliada'],
  ['glucose', 'Glicemia considerada conforme o quadro'],
  ['cardiopulmonary', 'Exame cardiovascular e respiratório direcionado'],
  ['neurological', 'Exame neurológico direcionado'],
  ['substances', 'Uso de substâncias, abstinência e medicações revisados']
] as const

const organicAlerts = [
  ['sca', 'Síndrome coronariana aguda', 'Dor precordial, irradiação, sudorese fria ou risco cardiovascular.', [{ id: 'iam' as EmergencyType, label: 'Abrir fluxo de IAM / SCA' }]],
  ['arritmia', 'Arritmia', 'Taquicardia sustentada, pulso irregular, síncope ou palpitação importante.', []],
  ['neurologico', 'AVC ou outra causa neurológica', 'Déficit focal, assimetria, alteração da fala ou confusão.', [{ id: 'avc' as EmergencyType, label: 'Abrir fluxo de AVC' }]],
  ['respiratorio_toxico', 'Causa respiratória, tóxica ou metabólica', 'Hipoxemia, sibilância, intoxicação, abstinência ou hipoglicemia.', [{ id: 'asthma' as EmergencyType, label: 'Abrir fluxo de asma' }]]
] as const

const nonDrugOptions = [
  ['environment', 'Redução de estímulos', 'Ambiente calmo, fala curta e postura acolhedora.'],
  ['validation', 'Validação e psicoeducação', 'Reconhecer o sofrimento e explicar a natureza transitória da crise após a triagem de segurança.'],
  ['breathing', 'Respiração diafragmática', 'Inspiração nasal lenta e expiração prolongada, sem hiperventilação forçada.'],
  ['grounding', 'Técnica de aterramento', 'Reconhecer o ambiente, apoiar os pés e direcionar a atenção ao presente.']
] as const

const contraindicationOptions = [
  ['depressants', 'Álcool ou outros depressores'],
  ['sedation', 'Sedação excessiva ou rebaixamento'],
  ['respiratory', 'Hipoxemia ou risco respiratório'],
  ['sleep_apnea', 'Apneia do sono descompensada'],
  ['pregnancy', 'Gestação sem avaliação individualizada'],
  ['other', 'Outra contraindicação clínica']
] as const

const mentalRiskOptions = [
  ['suicide', 'Ideação suicida ou autoagressão'],
  ['aggression', 'Risco de heteroagressão'],
  ['psychosis', 'Psicose ou desorganização importante'],
  ['intoxication', 'Intoxicação grave'],
  ['self_care', 'Incapacidade de autocuidado ou ausência de suporte seguro']
] as const

const dischargeOptions = [
  ['stable', 'Estabilidade clínica confirmada'],
  ['return', 'Sinais de retorno explicados'],
  ['technique', 'Respiração e aterramento revisados'],
  ['follow_up', 'Seguimento ambulatorial orientado quando indicado']
] as const

const parseObject = (raw?: string) => {
  if (!raw) return {} as Record<string, unknown>
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

const readList = (raw: string | undefined, key: string) => {
  const value = parseObject(raw)[key]
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

const readString = (raw: string | undefined, key: string) => {
  const value = parseObject(raw)[key]
  return typeof value === 'string' ? value : ''
}

const toggle = (values: string[], value: string) => values.includes(value)
  ? values.filter(item => item !== value)
  : [...values, value]

const Choice = ({ selected, title, description, danger = false, onClick }: { selected: boolean; title: string; description?: string; danger?: boolean; onClick: () => void }) => (
  <button type="button" aria-pressed={selected} onClick={onClick} className={clsx(
    'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
    selected
      ? danger ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-100' : 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100'
      : danger ? 'border-rose-200 bg-white hover:border-rose-400' : 'border-slate-200 bg-white hover:border-indigo-400'
  )}>
    <span className={clsx('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', selected ? danger ? 'border-rose-600 bg-rose-600 text-white' : 'border-indigo-700 bg-indigo-700 text-white' : 'border-slate-300 text-transparent')}><CheckCircle2 className="h-4 w-4" /></span>
    <span><strong className="block text-slate-950">{title}</strong>{description && <span className="mt-1 block text-sm leading-relaxed text-slate-600">{description}</span>}</span>
  </button>
)

const phaseFor = (stage: string) => stage === 'ansiedade_inicio' ? 'Reconhecimento'
  : stage === 'ansiedade_excluir_organico' || stage === 'ansiedade_causa_organica' ? 'Segurança clínica'
    : stage === 'ansiedade_abordagem_nao_medicamentosa' ? 'Intervenção inicial'
      : stage === 'ansiedade_medicamentosa' ? 'Tratamento'
        : 'Destino'

const AnxietyFlowchartInteractive: React.FC<Props> = ({ patient, initialStep, initialHistory, initialAnswers, onUpdate, onComplete, onBack, onOpenReport, onSwitchFlowchart }) => {
  const safeInitialStage = ansiedadeFlowchart.steps[initialStep] ? initialStep as AnxietyStage : ansiedadeFlowchart.initialStep as AnxietyStage
  const [stage, setStage] = useState<AnxietyStage>(safeInitialStage)
  const [history, setHistory] = useState<AnxietyStage[]>(initialHistory.filter(item => Boolean(ansiedadeFlowchart.steps[item])) as AnxietyStage[])
  const [answers, setAnswers] = useState(initialAnswers)
  const [showCompletion, setShowCompletion] = useState(Boolean(initialAnswers.__ansiedade_completed_at))
  const [notice, setNotice] = useState('')
  const [symptoms, setSymptoms] = useState(() => readList(initialAnswers.ansiedade_inicio, 'symptoms'))
  const [assessmentChecks, setAssessmentChecks] = useState(() => readList(initialAnswers.ansiedade_excluir_organico, 'assessmentChecks'))
  const [routeAlerts, setRouteAlerts] = useState(() => readList(initialAnswers.ansiedade_excluir_organico, 'routeAlerts'))
  const [interventions, setInterventions] = useState(() => readList(initialAnswers.ansiedade_abordagem_nao_medicamentosa, 'interventions'))
  const [medication, setMedication] = useState<AnsiedadeMedicationCode | ''>(() => readString(initialAnswers.ansiedade_medicamentosa, 'medication') as AnsiedadeMedicationCode | '')
  const [contraindications, setContraindications] = useState(() => readList(initialAnswers.ansiedade_medicamentosa, 'contraindications'))
  const [mentalRisks, setMentalRisks] = useState(() => readList(initialAnswers.ansiedade_avaliacao_psiquiatrica, 'mentalRisks'))
  const [mentalPlan, setMentalPlan] = useState<MentalPlan | ''>(() => readString(initialAnswers.ansiedade_avaliacao_psiquiatrica, 'mentalPlan') as MentalPlan | '')
  const [dischargeChecks, setDischargeChecks] = useState(() => readList(initialAnswers.ansiedade_alta_orientada, 'dischargeChecks'))
  const step = ansiedadeFlowchart.steps[stage]
  const isFinal = ansiedadeFlowchart.finalSteps.includes(stage)
  const progress = showCompletion ? 100 : isFinal ? 92 : Math.min(84, 14 + history.length * 18)
  const phase = phaseFor(stage)
  const hasHighMentalRisk = mentalRisks.length > 0

  const persistAndMove = (nextStage: AnxietyStage, payload: Record<string, unknown>, riskGroup = 'Crise de ansiedade') => {
    const nextHistory = [...history, stage]
    const nextAnswers = { ...answers, [stage]: JSON.stringify(payload) }
    setHistory(nextHistory); setAnswers(nextAnswers); setStage(nextStage); setNotice(''); setShowCompletion(false)
    onUpdate(patient.id, nextStage, nextHistory, nextAnswers, ansiedadeFlowchart.finalSteps.includes(nextStage) ? 92 : Math.min(84, progress + 18), riskGroup)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    if (showCompletion) { setShowCompletion(false); return }
    if (!history.length) { onBack?.(); return }
    const previous = history[history.length - 1]
    const nextHistory = history.slice(0, -1)
    setStage(previous); setHistory(nextHistory); setNotice('')
    onUpdate(patient.id, previous, nextHistory, answers, Math.max(8, progress - 18), patient.emergencyState.riskGroup)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const restart = () => {
    const preserved: Record<string, string> = {}
    if (answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY]) preserved[UNIVERSAL_ASSESSMENT_ANSWER_KEY] = answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY]
    patientService.replacePrescriptionsByPrescriber(patient.id, ANSIEDADE_PRESCRIBER, [])
    setStage('ansiedade_inicio'); setHistory([]); setAnswers(preserved); setShowCompletion(false); setNotice('')
    setSymptoms([]); setAssessmentChecks([]); setRouteAlerts([]); setInterventions([]); setMedication(''); setContraindications([]); setMentalRisks([]); setMentalPlan(''); setDischargeChecks([])
    onUpdate(patient.id, 'ansiedade_inicio', [], preserved, 8, 'Crise de ansiedade')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const finish = (payload: Record<string, unknown>, riskGroup = 'Crise de ansiedade') => {
    const completedAt = new Date().toISOString()
    const nextAnswers = { ...answers, [stage]: JSON.stringify(payload), __ansiedade_completed_at: completedAt }
    setAnswers(nextAnswers); setShowCompletion(true)
    onUpdate(patient.id, stage, [...history, stage], nextAnswers, 100, riskGroup)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const continueStart = () => {
    if (!symptoms.length) { setNotice('Marque ao menos uma manifestação observada para registrar o início da avaliação.'); return }
    persistAndMove('ansiedade_excluir_organico', { decision: 'iniciar', symptoms })
  }

  const continueSafety = () => {
    if (!assessmentChecks.length) { setNotice('Registre ao menos um item da avaliação clínica dirigida.'); return }
    if (routeAlerts.length) {
      persistAndMove('ansiedade_causa_organica', { decision: 'organico', assessmentChecks, routeAlerts }, 'Suspeita de causa orgânica')
      return
    }
    persistAndMove('ansiedade_abordagem_nao_medicamentosa', { decision: 'sem_organico', assessmentChecks, routeAlerts: [] })
  }

  const continueNonDrug = (improved: boolean) => {
    if (!interventions.length) { setNotice('Registre ao menos uma intervenção realizada antes da reavaliação.'); return }
    persistAndMove(improved ? 'ansiedade_alta_orientada' : 'ansiedade_medicamentosa', { decision: improved ? 'melhorou' : 'persistente', interventions })
  }

  const continueMedication = (useMedication: boolean) => {
    if (useMedication && contraindications.length) { setNotice('Há contraindicação selecionada. Registre a decisão de não medicar ou reveja a avaliação clínica.'); return }
    if (useMedication && !medication) { setNotice('Selecione a opção medicamentosa utilizada.'); return }
    const selectedMedication = useMedication ? medication as AnsiedadeMedicationCode : ''
    patientService.replacePrescriptionsByPrescriber(patient.id, ANSIEDADE_PRESCRIBER, selectedMedication ? buildAnsiedadePrescriptionItems(selectedMedication) : [])
    persistAndMove('ansiedade_avaliacao_psiquiatrica', { decision: 'avaliacao_saude_mental', medication: selectedMedication, contraindications, medicationWithheld: !useMedication }, 'Ansiedade persistente')
  }

  return <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/50 pb-12">
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6"><div><p className="text-lg font-black text-slate-950">{patient.name}</p><p className="text-xs font-semibold text-slate-500">{patient.age ? `${patient.age} anos` : 'Idade não informada'} · {phase}</p></div><div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={onComplete} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700"><ChevronLeft className="h-4 w-4" /> Dashboard</button><button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-950"><ArrowLeft className="h-4 w-4" /> Voltar</button><button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-950"><RotateCcw className="h-4 w-4" /> Reiniciar</button></div></div></nav>

    <header className={clsx('relative overflow-hidden px-5 py-7 text-white shadow-lg sm:px-8', stage === 'ansiedade_causa_organica' ? 'bg-gradient-to-r from-rose-800 via-red-700 to-orange-600' : 'bg-gradient-to-r from-indigo-900 via-violet-800 to-blue-700')}><div className="mx-auto flex max-w-6xl items-center gap-4"><span className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/25">{stage === 'ansiedade_excluir_organico' || stage === 'ansiedade_causa_organica' ? <Activity className="h-8 w-8" /> : <Brain className="h-8 w-8" />}</span><div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/75">Crise de ansiedade · {phase}</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">{step.title}</h1><p className="mt-1 text-sm text-white/85 sm:text-base">{step.description}</p></div><div className="hidden text-right sm:block"><strong className="text-2xl">{progress}%</strong><p className="text-xs text-white/70">do protocolo</p></div></div><div className="absolute bottom-0 left-0 h-1.5 bg-white/35 transition-all" style={{ width: `${progress}%` }} /></header>

    <main className="mx-auto mt-7 max-w-6xl px-4 sm:px-6">
      {showCompletion ? <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6"><section className="rounded-[1.75rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15"><CheckCircle2 className="h-8 w-8" /></span><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Atendimento registrado</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">Fluxo de ansiedade concluído</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-50">Triagem de segurança, intervenções, resposta e destino foram preservados no relatório clínico.</p></div></div><span className="w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-extrabold">100% concluído</span></div></section><section className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase text-slate-500">Desfecho</p><p className="mt-2 text-lg font-black text-slate-950">{step.title}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase text-slate-500">Sinais orgânicos</p><p className="mt-2 text-2xl font-black text-slate-950">{routeAlerts.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase text-slate-500">Intervenções registradas</p><p className="mt-2 text-2xl font-black text-slate-950">{interventions.length}</p></div></section><div className="grid gap-3 sm:grid-cols-2">{onOpenReport && <button type="button" onClick={onOpenReport} className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-300 bg-white px-5 py-4 font-extrabold text-indigo-950"><FileText className="h-5 w-5" /> Abrir relatório completo</button>}<button type="button" onClick={onComplete} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-800 px-5 py-4 font-extrabold text-white"><CheckCircle2 className="h-5 w-5" /> Concluir e ir ao dashboard</button></div></motion.div> :
      <motion.section key={stage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7">
        {stage === 'ansiedade_inicio' && <div className="space-y-6"><div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-indigo-950"><Brain className="h-7 w-7" /><h2 className="mt-3 text-lg font-black">Reconheça as manifestações do episódio</h2><p className="mt-1 text-sm">Os sintomas são reais; a hipótese de pânico só deve ser concluída após avaliação clínica dirigida.</p></div><div className="grid gap-3 md:grid-cols-2">{symptomOptions.map(([id, title, description]) => <Choice key={id} selected={symptoms.includes(id)} title={title} description={description} onClick={() => setSymptoms(previous => toggle(previous, id))} />)}</div><button type="button" onClick={continueStart} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-800 px-5 py-4 font-extrabold text-white">Iniciar triagem de segurança <ChevronRight className="h-5 w-5" /></button></div>}

        {stage === 'ansiedade_excluir_organico' && <div className="space-y-6"><div className="rounded-2xl border border-rose-300 bg-rose-50 p-5 text-rose-950"><AlertTriangle className="h-7 w-7" /><h2 className="mt-3 text-lg font-black">Não atribuir automaticamente à ansiedade</h2><p className="mt-1 text-sm">Registre a avaliação realizada e marque todo sinal que exige outra investigação.</p></div><section><h3 className="mb-3 font-black text-slate-950">Avaliação dirigida</h3><div className="grid gap-3 md:grid-cols-2">{assessmentOptions.map(([id, title]) => <Choice key={id} selected={assessmentChecks.includes(id)} title={title} onClick={() => setAssessmentChecks(previous => toggle(previous, id))} />)}</div></section><section><h3 className="mb-3 font-black text-slate-950">Sinais que mudam a rota</h3><div className="grid gap-3 md:grid-cols-2">{organicAlerts.map(([id, title, description]) => <Choice key={id} selected={routeAlerts.includes(id)} title={title} description={description} danger onClick={() => setRouteAlerts(previous => toggle(previous, id))} />)}</div></section><button type="button" onClick={continueSafety} className={clsx('flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 font-extrabold text-white', routeAlerts.length ? 'bg-rose-700' : 'bg-indigo-800')}>{routeAlerts.length ? 'Registrar suspeita orgânica' : 'Prosseguir sem sinais orgânicos'} <ChevronRight className="h-5 w-5" /></button></div>}

        {stage === 'ansiedade_abordagem_nao_medicamentosa' && <div className="space-y-6"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"><ShieldCheck className="h-7 w-7" /><h2 className="mt-3 text-lg font-black">Primeira linha: acolhimento e regulação</h2><p className="mt-1 text-sm">Selecione as medidas realizadas e então registre a resposta clínica.</p></div><div className="grid gap-3 md:grid-cols-2">{nonDrugOptions.map(([id, title, description]) => <Choice key={id} selected={interventions.includes(id)} title={title} description={description} onClick={() => setInterventions(previous => toggle(previous, id))} />)}</div><div className="grid gap-3 md:grid-cols-2"><button type="button" onClick={() => continueNonDrug(true)} className="rounded-2xl bg-emerald-700 px-5 py-4 font-extrabold text-white">Melhora sustentada</button><button type="button" onClick={() => continueNonDrug(false)} className="rounded-2xl bg-amber-600 px-5 py-4 font-extrabold text-white">Sintomas persistentes</button></div></div>}

        {stage === 'ansiedade_medicamentosa' && <div className="space-y-6"><div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950"><Pill className="h-7 w-7" /><h2 className="mt-3 text-lg font-black">Segunda linha: considerar dose baixa e reavaliar</h2><p className="mt-1 text-sm">Antes de selecionar uma opção, registre contraindicações e riscos de sedação.</p></div><section><h3 className="mb-3 font-black text-slate-950">Contraindicações ou cautelas presentes</h3><div className="grid gap-3 md:grid-cols-2">{contraindicationOptions.map(([id, title]) => <Choice key={id} selected={contraindications.includes(id)} title={title} danger onClick={() => setContraindications(previous => toggle(previous, id))} />)}</div></section><section><h3 className="mb-3 font-black text-slate-950">Opção utilizada no pronto-socorro</h3><div className="grid gap-3 md:grid-cols-2">{ANSIEDADE_MEDICATION_OPTIONS.map(option => <Choice key={option.code} selected={medication === option.code} title={option.label} description={`${option.dose}. ${option.note}`} onClick={() => setMedication(option.code)} />)}</div></section>{contraindications.length > 0 && <p className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-950">Há cautela selecionada: a opção medicamentosa permanece bloqueada até revisão clínica.</p>}<div className="grid gap-3 md:grid-cols-2"><button type="button" disabled={contraindications.length > 0} onClick={() => continueMedication(true)} className="rounded-2xl bg-indigo-800 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Registrar medicação e reavaliar</button><button type="button" onClick={() => continueMedication(false)} className="rounded-2xl border border-slate-300 bg-white px-5 py-4 font-extrabold text-slate-800">Não medicar e seguir avaliação</button></div></div>}

        {stage === 'ansiedade_causa_organica' && <div className="space-y-6"><div className="rounded-2xl border border-rose-300 bg-rose-50 p-5 text-rose-950"><AlertTriangle className="h-8 w-8" /><h2 className="mt-3 text-xl font-black">Não encerrar como crise de ansiedade</h2><p className="mt-2 text-sm">Investigue e estabilize a causa orgânica predominante antes de retomar a hipótese de pânico.</p></div><div className="grid gap-3 md:grid-cols-2">{organicAlerts.filter(([id]) => routeAlerts.includes(id)).map(([id, title, description, destinations]) => <div key={id} className="rounded-2xl border border-rose-200 bg-white p-5"><h3 className="font-black text-slate-950">{title}</h3><p className="mt-1 text-sm text-slate-600">{description}</p>{onSwitchFlowchart && destinations.map(destination => <button key={destination.id} type="button" onClick={() => onSwitchFlowchart(destination.id)} className="mt-4 w-full rounded-xl bg-rose-700 px-4 py-3 text-sm font-extrabold text-white">{destination.label}</button>)}</div>)}</div><button type="button" onClick={() => finish({ decision: 'organico', assessmentChecks, routeAlerts }, 'Suspeita de causa orgânica')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-700 px-5 py-4 font-extrabold text-white"><CheckCircle2 className="h-5 w-5" /> Registrar encaminhamento e concluir</button></div>}

        {stage === 'ansiedade_alta_orientada' && <div className="space-y-6"><div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-950"><ShieldCheck className="h-8 w-8" /><h2 className="mt-3 text-xl font-black">Alta após melhora sustentada</h2><p className="mt-2 text-sm">Confirme estabilidade, orientação e rede de seguimento antes de concluir.</p></div><div className="grid gap-3 md:grid-cols-2">{dischargeOptions.map(([id, title]) => <Choice key={id} selected={dischargeChecks.includes(id)} title={title} onClick={() => setDischargeChecks(previous => toggle(previous, id))} />)}</div><button type="button" disabled={dischargeChecks.length !== dischargeOptions.length} onClick={() => finish({ decision: 'melhorou', dischargeChecks }, 'Alta orientada')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300"><CheckCircle2 className="h-5 w-5" /> Registrar alta e concluir</button></div>}

        {stage === 'ansiedade_avaliacao_psiquiatrica' && <div className="space-y-6"><div className="rounded-2xl border border-violet-300 bg-violet-50 p-5 text-violet-950"><Stethoscope className="h-8 w-8" /><h2 className="mt-3 text-xl font-black">Definir segurança e seguimento em saúde mental</h2><p className="mt-2 text-sm">Marque fatores de risco presentes. A ausência de marcação não substitui a avaliação clínica.</p></div><div className="grid gap-3 md:grid-cols-2">{mentalRiskOptions.map(([id, title]) => <Choice key={id} selected={mentalRisks.includes(id)} title={title} danger onClick={() => setMentalRisks(previous => toggle(previous, id))} />)}</div><div className="grid gap-3 md:grid-cols-2"><Choice selected={mentalPlan === 'urgent'} title="Avaliação especializada urgente" description="Observação protegida e avaliação presencial quando houver risco atual." danger onClick={() => setMentalPlan('urgent')} /><Choice selected={mentalPlan === 'ambulatory'} title="Seguimento ambulatorial programado" description="Para estabilidade clínica, suporte seguro e ausência de risco imediato identificado." onClick={() => setMentalPlan('ambulatory')} /></div>{hasHighMentalRisk && mentalPlan === 'ambulatory' && <p className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-950">Há fator de alto risco selecionado. Registre avaliação especializada urgente para concluir com segurança.</p>}<button type="button" disabled={!mentalPlan || (hasHighMentalRisk && mentalPlan !== 'urgent')} onClick={() => finish({ decision: 'avaliacao_saude_mental', mentalRisks, mentalPlan }, mentalPlan === 'urgent' ? 'Saúde mental urgente' : 'Seguimento em saúde mental')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-800 px-5 py-4 font-extrabold text-white disabled:bg-slate-300"><Sparkles className="h-5 w-5" /> Registrar destino e concluir</button></div>}

        {notice && <p role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-950"><AlertTriangle className="mr-2 inline h-4 w-4" />{notice}</p>}
        <footer className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5"><button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-5 w-5" /> Voltar</button><span className="hidden text-xs font-semibold text-slate-500 sm:block">Escolhas, resposta e destino permanecem no relatório clínico.</span></footer>
      </motion.section>}
    </main>
  </div>
}

export default AnxietyFlowchartInteractive
