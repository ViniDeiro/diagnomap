'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  HeartPulse,
  Pill,
  RotateCcw,
  ShieldAlert,
  Stethoscope,
  TestTube2
} from 'lucide-react'
import { clsx } from 'clsx'
import UniversalCareTransition, { type CareTransitionData } from './UniversalCareTransition'
import { UNIVERSAL_ASSESSMENT_ANSWER_KEY } from './UniversalClinicalAssessment'
import type { EmergencyPatient } from '@/types/emergency'
import {
  classifyHypertensionRoute,
  HYPERTENSION_SCENARIO_TARGETS,
  isMarkedBloodPressureElevation,
  type HypertensionEmergencyScenario,
  type HypertensionRoute
} from '@/lib/hypertension'

export const HYPERTENSION_CASE_ANSWER_KEY = 'hipertensao_caso_estruturado'

export const HYPERTENSION_STAGES = [
  'hipertensao_confirmacao',
  'hipertensao_lesao_orgao',
  'hipertensao_observacao',
  'hipertensao_classificacao_sem_loa',
  'hipertensao_emergencia_preparo',
  'hipertensao_emergencia_cenario',
  'hipertensao_emergencia_plano',
  'hipertensao_alta_sem_loa',
  'hipertensao_cronica_alta'
] as const

export type HypertensionStage = typeof HYPERTENSION_STAGES[number]

export type HypertensionCaseData = {
  updatedAt?: string
  systolic?: number
  diastolic?: number
  symptoms?: string[]
  measurementChecks?: string[]
  organDamage?: string[]
  triggers?: string[]
  observationMeasures?: string[]
  pressureAfterRest?: string
  symptomsImproved?: boolean
  route?: HypertensionRoute
  emergencyMeasures?: string[]
  exams?: string[]
  scenario?: HypertensionEmergencyScenario
  selectedIVAgent?: string
  selectedOralPlan?: string
  disposition?: string
  completedAt?: string
}

export const parseHypertensionCase = (raw?: string | null): HypertensionCaseData => {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as HypertensionCaseData : {}
  } catch {
    return {}
  }
}

const symptomOptions = [
  ['neurologic', 'Déficit neurológico, confusão, convulsão ou cefaleia abrupta'],
  ['chest', 'Dor torácica, dorsal ou sensação de rasgamento'],
  ['dyspnea', 'Dispneia, ortopneia ou sinais de edema pulmonar'],
  ['visual', 'Alteração visual aguda'],
  ['renal', 'Oligúria ou piora renal recente'],
  ['pregnancy', 'Gestação/puerpério com cefaleia, escotomas ou dor epigástrica'],
  ['nonspecific', 'Mal-estar, tontura ou sintomas inespecíficos']
] as const

const measurementOptions = [
  ['cuff', 'Manguito compatível com a circunferência do braço'],
  ['position', 'Paciente sentado ou deitado, braço apoiado na altura do coração'],
  ['repeat', 'Medida repetida após alguns minutos'],
  ['both_arms', 'Pressão conferida nos dois braços quando clinicamente pertinente'],
  ['medication', 'Adesão, interrupções e interações medicamentosas revisadas']
] as const

const organDamageOptions = [
  ['encephalopathy', 'Encefalopatia hipertensiva ou alteração neurológica progressiva'],
  ['stroke', 'AVC isquêmico, hemorragia intracraniana ou hemorragia subaracnoide'],
  ['aorta', 'Síndrome aórtica aguda'],
  ['coronary', 'Síndrome coronariana aguda'],
  ['pulmonary_edema', 'Edema agudo de pulmão'],
  ['renal', 'Injúria renal aguda ou hipertensão acelerada/maligna'],
  ['pregnancy', 'Pré-eclâmpsia grave, eclâmpsia ou síndrome HELLP'],
  ['catecholamine', 'Crise catecolaminérgica por feocromocitoma ou substância simpaticomimética']
] as const

const triggerOptions = [
  ['pain', 'Dor aguda ou insuficientemente controlada'],
  ['anxiety', 'Ansiedade, pânico ou estresse emocional intenso'],
  ['withdrawal', 'Abstinência ou retirada recente de medicamento'],
  ['stimulant', 'Exposição a estimulante/simpaticomimético sem lesão aguda demonstrada'],
  ['other', 'Outro fator transitório plausível']
] as const

const observationOptions = [
  ['quiet', 'Repouso em ambiente calmo por cerca de 30 minutos'],
  ['repeat_bp', 'Nova aferição com técnica adequada'],
  ['cause', 'Dor, ansiedade e fatores precipitantes reavaliados'],
  ['adherence', 'Tratamento habitual e adesão conferidos']
] as const

const emergencyMeasureOptions = [
  ['monitor', 'Monitorização contínua e pressão em intervalos curtos'],
  ['npo', 'Dieta suspensa até definição da estratégia'],
  ['access', 'Acessos venosos e material para infusão titulável'],
  ['oxygen', 'Oxigênio apenas se houver hipoxemia ou insuficiência respiratória'],
  ['urine', 'Diurese e balanço hídrico acompanhados'],
  ['icu', 'CTI/equipe de referência acionados']
] as const

const examOptions = [
  ['cbc', 'Hemograma completo'], ['renal', 'Ureia, creatinina, sódio e potássio'],
  ['ecg', 'Eletrocardiograma'], ['troponin', 'Troponina conforme apresentação'],
  ['chest_xray', 'Radiografia de tórax'], ['glucose', 'Glicemia capilar'],
  ['urinalysis', 'Urina tipo 1'], ['fundoscopy', 'Fundoscopia quando disponível'],
  ['pregnancy', 'Teste de gestação quando aplicável'], ['targeted_image', 'Imagem direcionada à lesão suspeita']
] as const

const scenarioOptions: Array<[HypertensionEmergencyScenario, string, string]> = [
  ['aortic_syndrome', 'Síndrome aórtica aguda', 'Dor súbita torácica/dorsal, assimetria de pulsos ou imagem sugestiva.'],
  ['encephalopathy', 'Encefalopatia hipertensiva', 'Alteração mental, convulsão, sintomas visuais ou edema cerebral.'],
  ['ischemic_stroke_lysis', 'AVC isquêmico candidato à trombólise', 'Aplicar os limites específicos antes e depois da reperfusão.'],
  ['ischemic_stroke_no_lysis', 'AVC isquêmico sem trombólise', 'Evitar queda desnecessária da perfusão cerebral.'],
  ['intracerebral_hemorrhage', 'Hemorragia intracerebral', 'Meta individualizada com neurologia e infusão titulável.'],
  ['subarachnoid_hemorrhage', 'Hemorragia subaracnoide', 'Equilibrar perfusão cerebral e risco de ressangramento.'],
  ['catecholamine_crisis', 'Crise catecolaminérgica', 'Feocromocitoma ou substância simpaticomimética.'],
  ['acute_coronary_syndrome', 'Síndrome coronariana aguda', 'Tratar isquemia e pressão sem reduzir perfusão coronariana.'],
  ['pulmonary_edema', 'Edema agudo de pulmão', 'Redução de pós-carga, oxigenação e suporte ventilatório.'],
  ['pregnancy_emergency', 'Emergência hipertensiva na gestação', 'Pré-eclâmpsia grave, eclâmpsia ou HELLP.'],
  ['other', 'Outra lesão aguda de órgão-alvo', 'Usar a meta geral com titulação e reavaliação contínua.']
]

const ivAgentOptions = [
  ['nitroprusside', 'Nitroprussiato de sódio', 'Vasodilatador titulável; evitar uso indiscriminado e considerar toxicidade/contraindicações.'],
  ['nitroglycerin', 'Nitroglicerina', 'Especialmente útil quando há isquemia coronariana ou edema pulmonar.'],
  ['esmolol', 'Esmolol', 'Controle rápido de frequência/força de ejeção, sobretudo em síndrome aórtica.'],
  ['protocol_specific', 'Agente específico do protocolo institucional', 'Escolha guiada pela lesão, gestação, função renal e disponibilidade local.']
] as const

const oralOptions = [
  ['adjust_chronic', 'Retomar ou ajustar o esquema anti-hipertensivo habitual'],
  ['long_acting', 'Introduzir opção oral de ação prolongada após revisão de contraindicações'],
  ['cause_only', 'Tratar apenas o fator precipitante e reavaliar a pressão'],
  ['no_medication', 'Sem medicação imediata; acompanhamento precoce e plano de adesão']
] as const

const labels = Object.fromEntries([
  ...symptomOptions, ...measurementOptions, ...organDamageOptions, ...triggerOptions,
  ...observationOptions, ...emergencyMeasureOptions, ...examOptions, ...oralOptions,
  ...ivAgentOptions.map(([id, label]) => [id, label])
]) as Record<string, string>

export const HYPERTENSION_LABELS = labels

const toggle = (values: string[] = [], value: string) => values.includes(value)
  ? values.filter(item => item !== value)
  : [...values, value]

const Option = ({ selected, title, description, danger, onClick }: { selected: boolean; title: string; description?: string; danger?: boolean; onClick: () => void }) => (
  <button type="button" aria-pressed={selected} onClick={onClick} className={clsx(
    'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all',
    selected ? danger ? 'border-red-500 bg-red-50 ring-2 ring-red-100' : 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
  )}>
    <span className={clsx('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', selected ? danger ? 'border-red-600 bg-red-600 text-white' : 'border-blue-700 bg-blue-700 text-white' : 'border-slate-300 text-transparent')}><CheckCircle2 className="h-4 w-4" /></span>
    <span><strong className="block text-slate-950">{title}</strong>{description && <span className="mt-1 block text-sm leading-relaxed text-slate-600">{description}</span>}</span>
  </button>
)

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

const stageTitles: Record<HypertensionStage, [string, string]> = {
  hipertensao_confirmacao: ['Confirmar pressão e contexto', 'A classificação depende da aferição correta e da presença de sintomas.'],
  hipertensao_lesao_orgao: ['Há lesão aguda ou progressiva?', 'O valor da pressão isoladamente não define emergência hipertensiva.'],
  hipertensao_observacao: ['Observar e repetir a avaliação', 'Repouso curto e correção de fatores transitórios reduzem classificações indevidas.'],
  hipertensao_classificacao_sem_loa: ['Definir o quadro sem lesão aguda', 'Separe elevação persistente de uma resposta pressórica situacional.'],
  hipertensao_emergencia_preparo: ['Emergência hipertensiva', 'Organize monitorização, exames e cuidado intensivo sem provocar queda abrupta.'],
  hipertensao_emergencia_cenario: ['Qual órgão determina a meta?', 'A lesão predominante define velocidade, alvo e fármaco intravenoso.'],
  hipertensao_emergencia_plano: ['Plano intravenoso e destino crítico', 'Titule conforme resposta clínica e leve o paciente para unidade monitorizada.'],
  hipertensao_alta_sem_loa: ['Alta segura sem lesão aguda', 'A redução deve ser gradual, com vínculo ambulatorial precoce.'],
  hipertensao_cronica_alta: ['Hipertensão fora do critério de crise', 'Investigue adesão, ajuste longitudinal e oriente retorno.']
}

const HypertensionFlowchartInteractive: React.FC<Props> = ({ patient, initialStep, initialHistory, initialAnswers, onUpdate, onComplete, onBack, onOpenReport }) => {
  const initialStage = HYPERTENSION_STAGES.includes(initialStep as HypertensionStage) ? initialStep as HypertensionStage : 'hipertensao_confirmacao'
  const [stage, setStage] = useState<HypertensionStage>(initialStage)
  const [history, setHistory] = useState<string[]>(initialHistory.filter(item => HYPERTENSION_STAGES.includes(item as HypertensionStage)))
  const [answers, setAnswers] = useState(initialAnswers)
  const [data, setData] = useState<HypertensionCaseData>(() => parseHypertensionCase(initialAnswers[HYPERTENSION_CASE_ANSWER_KEY]))
  const [notice, setNotice] = useState('')
  const [showCompletion, setShowCompletion] = useState(() => Boolean(parseHypertensionCase(initialAnswers[HYPERTENSION_CASE_ANSWER_KEY]).completedAt))
  const [criticalTransition, setCriticalTransition] = useState<CareTransitionData | null>(() => {
    try { return initialAnswers.__care_transition_hipertensao_emergencia_plano ? JSON.parse(initialAnswers.__care_transition_hipertensao_emergencia_plano) : null } catch { return null }
  })
  const [title, subtitle] = stageTitles[stage]
  const finalStage = ['hipertensao_emergencia_plano', 'hipertensao_alta_sem_loa', 'hipertensao_cronica_alta'].includes(stage)
  const progress = finalStage ? 100 : Math.max(8, Math.round(((HYPERTENSION_STAGES.indexOf(stage) + 1) / HYPERTENSION_STAGES.length) * 100))
  const markedElevation = isMarkedBloodPressureElevation(data.systolic, data.diastolic)
  const hasSymptoms = (data.symptoms || []).length > 0
  const hasOrganDamage = (data.organDamage || []).length > 0
  const hasTrigger = (data.triggers || []).length > 0
  const target = useMemo(() => data.scenario ? HYPERTENSION_SCENARIO_TARGETS[data.scenario] : [], [data.scenario])

  const update = (patch: Partial<HypertensionCaseData>) => setData(previous => ({ ...previous, ...patch }))
  const selectMany = (key: 'symptoms' | 'measurementChecks' | 'organDamage' | 'triggers' | 'observationMeasures' | 'emergencyMeasures' | 'exams', value: string) =>
    setData(previous => ({ ...previous, [key]: toggle(previous[key], value) }))

  const persist = (nextStage: HypertensionStage, patch: Partial<HypertensionCaseData> = {}) => {
    const nextData = { ...data, ...patch, updatedAt: new Date().toISOString() }
    const nextHistory = [...history, stage]
    const nextAnswers = { ...answers, [HYPERTENSION_CASE_ANSWER_KEY]: JSON.stringify(nextData) }
    setData(nextData); setHistory(nextHistory); setStage(nextStage); setAnswers(nextAnswers); setNotice('')
    onUpdate(patient.id, nextStage, nextHistory, nextAnswers, Math.max(progress, 10), nextData.route === 'emergency' ? 'Emergência hipertensiva' : 'Crise hipertensiva')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const finish = (disposition: string, confirmedTransition?: CareTransitionData) => {
    const nextData = { ...data, disposition, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    const nextAnswers = { ...answers, ...(confirmedTransition ? { __care_transition_hipertensao_emergencia_plano: JSON.stringify(confirmedTransition) } : {}), [HYPERTENSION_CASE_ANSWER_KEY]: JSON.stringify(nextData) }
    setData(nextData); setAnswers(nextAnswers)
    onUpdate(patient.id, stage, [...history, stage], nextAnswers, 100, nextData.route === 'emergency' ? 'Emergência hipertensiva' : 'Sem lesão aguda')
    setShowCompletion(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const persistCriticalTransition = (transition: CareTransitionData) => {
    const nextAnswers = { ...answers, __care_transition_hipertensao_emergencia_plano: JSON.stringify(transition) }
    setCriticalTransition(transition)
    setAnswers(nextAnswers)
    onUpdate(patient.id, stage, history, nextAnswers, progress, 'Emergência hipertensiva')
  }

  const goBack = () => {
    if (!history.length) { onBack?.(); return }
    const previous = history[history.length - 1] as HypertensionStage
    const nextHistory = history.slice(0, -1)
    setHistory(nextHistory); setStage(previous)
    onUpdate(patient.id, previous, nextHistory, answers, Math.max(5, progress - 10), patient.emergencyState.riskGroup)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    if (showCompletion) {
      setShowCompletion(false)
      return
    }
    goBack()
  }

  const restart = () => {
    const preservedAnswers: Record<string, string> = {}
    if (answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY]) preservedAnswers[UNIVERSAL_ASSESSMENT_ANSWER_KEY] = answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY]
    setStage('hipertensao_confirmacao')
    setHistory([])
    setAnswers(preservedAnswers)
    setData({})
    setCriticalTransition(null)
    setNotice('')
    setShowCompletion(false)
    onUpdate(patient.id, 'hipertensao_confirmacao', [], preservedAnswers, 8, 'Crise hipertensiva')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const continueFromConfirmation = () => {
    if (data.systolic == null || data.diastolic == null || !hasSymptoms) { setNotice('Registre a pressão e selecione ao menos um sintoma ou a opção de sintoma inespecífico.'); return }
    const route = classifyHypertensionRoute({ systolic: data.systolic, diastolic: data.diastolic, hasSymptoms, hasAcuteOrganDamage: false, hasSituationalTrigger: false })
    persist(route === 'chronic' ? 'hipertensao_cronica_alta' : 'hipertensao_lesao_orgao', { route })
  }

  const continueFromDamage = () => {
    const route = classifyHypertensionRoute({ systolic: data.systolic, diastolic: data.diastolic, hasSymptoms, hasAcuteOrganDamage: hasOrganDamage, hasSituationalTrigger: false })
    persist(route === 'emergency' ? 'hipertensao_emergencia_preparo' : 'hipertensao_observacao', { route })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pb-12">
      <div className="sticky top-0 z-50 border-b border-white/70 bg-white/90 shadow-lg backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className={clsx('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg', data.route === 'emergency' ? 'bg-gradient-to-br from-red-700 to-rose-600 shadow-red-200' : 'bg-gradient-to-br from-blue-700 to-cyan-600 shadow-blue-200')}><HeartPulse className="h-6 w-6" /></div>
            <div><h1 className="text-xl font-black text-slate-950 sm:text-2xl">{patient.name || 'Paciente sem nome'}</h1><p className="mt-1 text-sm font-medium text-slate-600">{patient.age != null ? `${patient.age} anos` : 'Idade não informada'} · {patient.medicalRecord || 'Prontuário não informado'}</p></div>
          </div>
          <div className="flex flex-wrap gap-3">
            {onBack && <motion.button type="button" onClick={onBack} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-2.5 font-bold text-slate-700 shadow-sm"><ArrowLeft className="h-4 w-4" /> Dashboard</motion.button>}
            <motion.button type="button" onClick={handleBack} disabled={!showCompletion && history.length === 0} whileHover={showCompletion || history.length > 0 ? { scale: 1.02 } : {}} whileTap={showCompletion || history.length > 0 ? { scale: 0.98 } : {}} className={clsx('inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-bold', showCompletion || history.length > 0 ? 'border-amber-300 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 shadow-sm' : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400')}><ChevronLeft className="h-4 w-4" /> Voltar</motion.button>
            <motion.button type="button" onClick={restart} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-gradient-to-br from-blue-100 to-cyan-100 px-4 py-2.5 font-bold text-blue-900 shadow-sm"><RotateCcw className="h-4 w-4" /> Reiniciar</motion.button>
          </div>
        </div>
      </div>
      <header className={clsx('relative overflow-hidden px-5 py-7 text-white shadow-lg sm:px-8', data.route === 'emergency' ? 'bg-gradient-to-r from-red-700 to-rose-600' : 'bg-gradient-to-r from-blue-700 to-cyan-600')}>
        <div className="mx-auto flex max-w-6xl items-center gap-4"><div className="rounded-2xl bg-white/15 p-3"><HeartPulse className="h-8 w-8" /></div><div className="min-w-0 flex-1"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/75">Crise hipertensiva · etapa {HYPERTENSION_STAGES.indexOf(stage) + 1}</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">{title}</h1><p className="mt-1 text-sm text-white/85 sm:text-base">{subtitle}</p></div><div className="hidden text-right sm:block"><strong className="text-2xl">{progress}%</strong><p className="text-xs text-white/70">do protocolo</p></div></div>
        <div className="absolute bottom-0 left-0 h-1.5 bg-white/25" style={{ width: `${progress}%` }} />
      </header>

      <main className="mx-auto mt-7 max-w-6xl px-4 sm:px-6">
        {showCompletion && <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl shadow-emerald-900/15 sm:p-8">
            <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25"><CheckCircle2 className="h-8 w-8" /></span><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Protocolo registrado</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">Atendimento de hipertensão finalizado</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-50">Aferições, classificação, pesquisa de lesão de órgão-alvo e conduta foram preservadas no relatório clínico.</p></div></div><span className="w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-extrabold ring-1 ring-white/25">100% concluído</span></div>
          </section>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Pressão inicial</p><p className="mt-2 text-2xl font-black text-slate-950">{data.systolic != null && data.diastolic != null ? `${data.systolic}/${data.diastolic}` : 'Não informada'}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Classificação</p><p className="mt-2 text-lg font-black text-slate-950">{data.route === 'emergency' ? 'Emergência hipertensiva' : data.route === 'pseudocrisis' ? 'Pseudocrise' : data.route === 'important_elevation' ? 'Elevação sem lesão aguda' : 'Hipertensão crônica'}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Lesão aguda</p><p className="mt-2 text-lg font-black text-slate-950">{(data.organDamage || []).length > 0 ? `${data.organDamage?.length} achado(s)` : 'Não demonstrada'}</p></div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Destino</p><p className="mt-2 text-sm font-black leading-relaxed text-slate-950">{data.disposition || 'Não informado'}</p></div>
          </section>
          <section className="rounded-[1.75rem] border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6 sm:p-7"><div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white"><FileText className="h-5 w-5" /></span><div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Síntese clínica</p><h3 className="mt-1 text-xl font-black text-slate-950">{data.disposition || 'Conduta registrada'}</h3><p className="mt-2 text-sm leading-relaxed text-blue-950">Finalizado em {data.completedAt ? new Date(data.completedAt).toLocaleString('pt-BR') : 'horário não informado'}. Consulte o relatório para revisar sinais, exames, metas e decisões terapêuticas.</p></div></div></section>
          <div className="grid gap-3 sm:grid-cols-2">{onOpenReport && <button type="button" onClick={onOpenReport} className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white px-5 py-4 font-extrabold text-blue-900 shadow-sm hover:bg-blue-50"><FileText className="h-5 w-5" /> Abrir relatório completo</button>}<button type="button" onClick={onComplete} className={clsx('inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white shadow-lg shadow-blue-200 hover:bg-blue-800', !onOpenReport && 'sm:col-span-2')}><CheckCircle2 className="h-5 w-5" /> Concluir e ir ao dashboard</button></div>
        </motion.div>}
        <motion.section key={stage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={clsx('rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7', showCompletion && 'hidden')}>
          {stage === 'hipertensao_confirmacao' && <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2"><label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black">Pressão sistólica (mmHg)<input aria-label="Pressão sistólica" type="number" value={data.systolic ?? ''} onChange={event => update({ systolic: event.target.value === '' ? undefined : Number(event.target.value) })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-xl" /></label><label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black">Pressão diastólica (mmHg)<input aria-label="Pressão diastólica" type="number" value={data.diastolic ?? ''} onChange={event => update({ diastolic: event.target.value === '' ? undefined : Number(event.target.value) })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-xl" /></label></div>
            {data.systolic != null && data.diastolic != null && <div className={clsx('rounded-2xl border p-4 font-bold', markedElevation ? 'border-red-300 bg-red-50 text-red-950' : 'border-amber-300 bg-amber-50 text-amber-950')}>{markedElevation ? 'Elevação acentuada registrada. A próxima decisão procura lesão aguda de órgão-alvo.' : 'A medida está abaixo do limiar operacional do documento. O fluxo direcionará para hipertensão crônica/descompensada e avaliação longitudinal.'}</div>}
            <section><h2 className="mb-3 font-black text-slate-950">Sintomas associados</h2><div className="grid gap-3 md:grid-cols-2">{symptomOptions.map(([id, label]) => <Option key={id} selected={(data.symptoms || []).includes(id)} title={label} danger={id !== 'nonspecific'} onClick={() => selectMany('symptoms', id)} />)}</div></section>
            <section><h2 className="mb-3 font-black text-slate-950">Conferência da aferição</h2><div className="grid gap-3 md:grid-cols-2">{measurementOptions.map(([id, label]) => <Option key={id} selected={(data.measurementChecks || []).includes(id)} title={label} onClick={() => selectMany('measurementChecks', id)} />)}</div></section>
            <button type="button" onClick={continueFromConfirmation} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white">Classificar medida e continuar <ChevronRight /></button>
          </div>}

          {stage === 'hipertensao_lesao_orgao' && <div className="space-y-5"><div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-950"><div className="flex gap-3"><ShieldAlert className="h-6 w-6 shrink-0" /><p><strong>Emergência é uma definição clínica:</strong> selecione somente lesão nova ou em progressão. Sintomas inespecíficos isolados não bastam.</p></div></div><div className="grid gap-3 md:grid-cols-2">{organDamageOptions.map(([id, label]) => <Option key={id} selected={(data.organDamage || []).includes(id)} title={label} danger onClick={() => selectMany('organDamage', id)} />)}</div><div className="grid gap-3 sm:grid-cols-2"><button type="button" disabled={!hasOrganDamage} onClick={continueFromDamage} className="rounded-xl bg-red-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Há lesão aguda: emergência</button><button type="button" disabled={hasOrganDamage} onClick={continueFromDamage} className="rounded-xl border border-blue-300 bg-blue-50 px-5 py-4 font-extrabold text-blue-950 disabled:opacity-40">Sem lesão aguda demonstrada</button></div></div>}

          {stage === 'hipertensao_observacao' && <div className="space-y-5"><div className="grid gap-3 md:grid-cols-2">{observationOptions.map(([id, label]) => <Option key={id} selected={(data.observationMeasures || []).includes(id)} title={label} onClick={() => selectMany('observationMeasures', id)} />)}</div><label className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black">Pressão após repouso<input value={data.pressureAfterRest || ''} onChange={event => update({ pressureAfterRest: event.target.value })} placeholder="Ex.: 172/104 mmHg" className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" /></label><div className="grid gap-3 sm:grid-cols-2"><Option selected={data.symptomsImproved === true} title="Pressão reduziu ou sintomas melhoraram" onClick={() => update({ symptomsImproved: true })} /><Option selected={data.symptomsImproved === false} title="Permanece elevada e/ou sintomática" danger onClick={() => update({ symptomsImproved: false })} /></div><button type="button" disabled={(data.observationMeasures || []).length < 3 || data.symptomsImproved == null || !data.pressureAfterRest} onClick={() => persist('hipertensao_classificacao_sem_loa')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Interpretar reavaliação <ChevronRight /></button></div>}

          {stage === 'hipertensao_classificacao_sem_loa' && <div className="space-y-5"><div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950"><h2 className="font-black">Há um fator transitório que explica a elevação?</h2><p className="mt-1 text-sm">Sem lesão progressiva, dor, ansiedade e outros gatilhos podem produzir uma pseudocrise. Trate a causa, não o número isolado.</p></div><div className="grid gap-3 md:grid-cols-2">{triggerOptions.map(([id, label]) => <Option key={id} selected={(data.triggers || []).includes(id)} title={label} onClick={() => selectMany('triggers', id)} />)}</div><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => persist('hipertensao_alta_sem_loa', { route: hasTrigger ? 'pseudocrisis' : 'important_elevation' })} className="rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white">{hasTrigger ? 'Classificar como pseudocrise' : 'Classificar como elevação sem lesão'}</button><button type="button" onClick={() => setData(previous => ({ ...previous, triggers: [] }))} className="rounded-xl border border-slate-300 px-5 py-4 font-bold text-slate-700">Limpar gatilhos</button></div></div>}

          {stage === 'hipertensao_emergencia_preparo' && <div className="space-y-6"><div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 text-red-950"><h2 className="flex items-center gap-2 text-xl font-black"><AlertTriangle /> Lesão aguda presente</h2><p className="mt-2 text-sm">Indicar tratamento intravenoso titulável e internação monitorizada. A queda aleatória ou excessiva pode causar isquemia.</p></div><section><h2 className="mb-3 flex items-center gap-2 font-black"><Activity className="h-5 w-5" /> Preparação imediata</h2><div className="grid gap-3 md:grid-cols-2">{emergencyMeasureOptions.map(([id, label]) => <Option key={id} selected={(data.emergencyMeasures || []).includes(id)} title={label} danger={id === 'icu'} onClick={() => selectMany('emergencyMeasures', id)} />)}</div></section><section><h2 className="mb-3 flex items-center gap-2 font-black"><TestTube2 className="h-5 w-5" /> Exames iniciais sem atrasar tratamento</h2><div className="grid gap-3 md:grid-cols-2">{examOptions.map(([id, label]) => <Option key={id} selected={(data.exams || []).includes(id)} title={label} onClick={() => selectMany('exams', id)} />)}</div></section><button type="button" disabled={(data.emergencyMeasures || []).length < 4 || (data.exams || []).length < 4} onClick={() => persist('hipertensao_emergencia_cenario')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Definir lesão predominante e meta <ChevronRight /></button></div>}

          {stage === 'hipertensao_emergencia_cenario' && <div className="space-y-5"><div className="grid gap-3 md:grid-cols-2">{scenarioOptions.map(([id, label, description]) => <Option key={id} selected={data.scenario === id} title={label} description={description} danger onClick={() => update({ scenario: id })} />)}</div><button type="button" disabled={!data.scenario} onClick={() => persist('hipertensao_emergencia_plano')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Aplicar meta específica <ChevronRight /></button></div>}

          {stage === 'hipertensao_emergencia_plano' && <div className="space-y-6"><div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 text-red-950"><h2 className="text-xl font-black">Alvo pressórico do cenário</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{target.map(item => <li key={item}>{item}</li>)}</ul></div><section><h2 className="mb-3 font-black">Estratégia intravenosa registrada</h2><div className="grid gap-3 md:grid-cols-2">{ivAgentOptions.map(([id, label, description]) => <Option key={id} selected={data.selectedIVAgent === id} title={label} description={description} danger onClick={() => update({ selectedIVAgent: id })} />)}</div></section><div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><strong>Dupla checagem obrigatória:</strong> a escolha e a dose dependem do órgão acometido, perfusão, gestação, função renal, contraindicações e protocolo institucional.</div>{data.selectedIVAgent ? <UniversalCareTransition destination="icu" value={criticalTransition} onChange={persistCriticalTransition} onConfirmed={(transition) => finish('Internação em CTI/unidade monitorizada com anti-hipertensivo intravenoso titulável', transition)} /> : <p className="rounded-xl bg-slate-100 p-4 text-center text-sm font-bold text-slate-600">Selecione o anti-hipertensivo intravenoso para iniciar a transição à unidade crítica.</p>}</div>}

          {stage === 'hipertensao_alta_sem_loa' && <div className="space-y-6"><div className={clsx('rounded-2xl border p-5', data.route === 'pseudocrisis' ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-emerald-300 bg-emerald-50 text-emerald-950')}><h2 className="text-xl font-black">{data.route === 'pseudocrisis' ? 'Pseudocrise provável' : 'Elevação importante sem lesão aguda'}</h2><p className="mt-2 text-sm">{data.route === 'pseudocrisis' ? 'Direcione a conduta ao fator precipitante e repita a pressão. Evite tratamento agressivo apenas pelo número.' : 'Não há indicação de redução rápida ou medicação intravenosa. Planeje controle gradual e seguimento breve.'}</p></div><div className="grid gap-3 md:grid-cols-2">{oralOptions.map(([id, label]) => <Option key={id} selected={data.selectedOralPlan === id} title={label} onClick={() => update({ selectedOralPlan: id })} />)}</div><div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><strong>Antes da alta:</strong> confirmar estabilidade, ausência de lesão aguda, orientação sobre sinais de alarme e retorno ambulatorial precoce. Fármacos de curta duração não devem ser usados para normalizar a pressão rapidamente.</div><button type="button" disabled={!data.selectedOralPlan} onClick={() => finish(data.route === 'pseudocrisis' ? 'Alta após tratamento do fator precipitante e reavaliação' : 'Alta com ajuste gradual e reavaliação ambulatorial precoce')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300"><Pill /> Registrar alta segura e finalizar</button></div>}

          {stage === 'hipertensao_cronica_alta' && <div className="space-y-6"><div className="rounded-2xl border border-blue-300 bg-blue-50 p-5 text-blue-950"><h2 className="text-xl font-black">Sem critério operacional de crise no caminho atual</h2><p className="mt-2 text-sm">A aferição e os sintomas registrados não preencheram simultaneamente o ponto de entrada do fluxograma. Avalie causas crônicas, adesão, drogas que elevam a pressão e risco cardiovascular global.</p></div><div className="grid gap-3 md:grid-cols-3"><div className="rounded-2xl border border-slate-200 p-4"><Stethoscope className="text-blue-700" /><strong className="mt-3 block">Reavaliar</strong><p className="mt-1 text-sm text-slate-600">Repetir a medida e examinar sinais que mudem a classificação.</p></div><div className="rounded-2xl border border-slate-200 p-4"><Pill className="text-blue-700" /><strong className="mt-3 block">Reconciliar</strong><p className="mt-1 text-sm text-slate-600">Checar adesão, interrupções, automedicação e interações.</p></div><div className="rounded-2xl border border-slate-200 p-4"><Clock3 className="text-blue-700" /><strong className="mt-3 block">Acompanhar</strong><p className="mt-1 text-sm text-slate-600">Garantir seguimento e retorno diante de sinais de alarme.</p></div></div><button type="button" onClick={() => finish('Alta/encaminhamento por hipertensão crônica mal controlada, sem emergência demonstrada')} className="w-full rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white">Registrar orientação e finalizar</button></div>}

          {notice && <p role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-950">{notice}</p>}
          <footer className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5"><button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-5 w-5" /> Voltar</button><span className="hidden text-xs font-semibold text-slate-500 sm:block">Escolhas e alvos ficam registrados no relatório clínico.</span></footer>
        </motion.section>
      </main>
    </div>
  )
}

export default HypertensionFlowchartInteractive
