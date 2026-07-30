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
import UniversalLabNotebook, { UNIVERSAL_LAB_RESULTS_KEY } from './UniversalLabNotebook'
import { parseUniversalClinicalAssessment, UNIVERSAL_ASSESSMENT_ANSWER_KEY } from './UniversalClinicalAssessment'
import InlineClinicalCopyButton from './InlineClinicalCopyButton'
import type { EmergencyPatient, EmergencyType } from '@/types/emergency'
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
  obstetricContext?: boolean
  obstetricPressureConfirmed?: boolean
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
  aorticBetaBlocker?: string
  aorticVasodilator?: string
  selectedOralPlan?: string
  magnesiumRegimen?: string
  magnesiumSafety?: string[]
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
  ['nonspecific', 'Mal-estar, tontura ou sintomas inespecíficos'],
  ['asymptomatic', 'Assintomático — sem sintomas associados à elevação pressórica']
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
  ['icu', 'UTI/equipe de referência acionadas']
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
  ['nitroprusside', 'Nitroprussiato de sódio', '50 mg em 250 mL de SG 5% (200 mcg/mL), protegido da luz. Iniciar em 0,3 mcg/kg/min e titular; máximo 10 mcg/kg/min. Considerar toxicidade e evitar na gestação, salvo exceção crítica.'],
  ['nitroglycerin', 'Nitroglicerina', '50 mg em 250 mL de SG 5% ou SF 0,9% (200 mcg/mL). Iniciar em 5 mcg/min e aumentar 5–10 mcg/min a cada 3–5 minutos; máximo usual 200 mcg/min.'],
  ['nicardipine', 'Nicardipina', '25 mg em aproximadamente 250 mL de SF 0,9% ou SG 5% (~100 mcg/mL). Iniciar em 5 mg/h e aumentar 2,5 mg/h a cada 5–15 minutos; máximo 15 mg/h.'],
  ['labetalol', 'Labetalol', '20 mg EV; depois 40 mg e 80 mg a cada 10 minutos conforme resposta, máximo usual 220 mg. Verificar disponibilidade local, asma grave, bradicardia, bloqueio AV e insuficiência cardíaca.'],
  ['hydralazine', 'Hidralazina', 'Ampola de 20 mg diluída em 19 mL de diluente (1 mg/mL). Administrar 5 mg EV e repetir a cada 20 minutos se necessário; máximo 30 mg.'],
  ['esmolol', 'Esmolol', 'Bolus opcional de 500 mcg/kg, seguido de 50–100 mcg/kg/min em bomba; titular até 300 mcg/kg/min, sobretudo em síndrome aórtica.'],
  ['metoprolol', 'Metoprolol', '5 mg EV lentamente; repetir a cada 5 minutos até 15 mg, após avaliar frequência, condução e função ventricular.'],
  ['phentolamine', 'Fentolamina, se disponível', 'Opção para feocromocitoma/crise adrenérgica conforme toxicologia e protocolo institucional; não usar betabloqueador isolado antes do bloqueio alfa.'],
  ['protocol_specific', 'Agente específico do protocolo institucional', 'Escolha guiada pela lesão, gestação, função renal e disponibilidade local.']
] as const

const aorticBetaBlockerOptions = [
  ['esmolol', 'Esmolol — opção preferencial', 'Primeira escolha quando disponível por permitir titulação rápida. Bolus opcional de 500 mcg/kg, seguido de 50–100 mcg/kg/min em bomba; titular conforme frequência, pressão e perfusão, até 300 mcg/kg/min.'],
  ['labetalol', 'Labetalol — alternativa ao esmolol', '20 mg EV; depois 40 mg e 80 mg a cada 10 minutos conforme resposta, respeitando contraindicações e o protocolo local.'],
  ['metoprolol', 'Metoprolol (Seloken®) — alternativa quando os anteriores não estiverem disponíveis', '5 mg EV lentamente; repetir a cada 5 minutos até 15 mg, após avaliar frequência, condução e função ventricular.']
] as const

const aorticVasodilatorOptions = [
  ['not_needed', 'PAS atingiu a meta após o betabloqueio', 'Não associar vasodilatador neste momento; manter titulação, perfusão e monitorização contínua.'],
  ['nitroprusside', 'Associar nitroprussiato após o betabloqueio', 'Usar somente se a PAS continuar acima da meta depois do controle do impulso cardíaco. Nunca iniciar isoladamente.'],
  ['nicardipine', 'Associar nicardipina após o betabloqueio', 'Alternativa titulável, conforme disponibilidade e protocolo, somente após controlar frequência e contratilidade.']
] as const

const pregnancyPressureOptions = [
  ['nifedipine_pregnancy', 'Nifedipino na hipertensão grave da gestação', '10 mg VO; se a pressão permanecer grave, repetir a cada 30 minutos, até o máximo de 40 mg, conforme protocolo obstétrico.'],
  ['hydralazine', 'Hidralazina EV na gestação', 'Diluir 20 mg em 19 mL de diluente (1 mg/mL). Administrar 5 mg EV e repetir a cada 20 minutos se necessário; máximo 30 mg.'],
  ['labetalol', 'Labetalol EV, se disponível e protocolado', '20 mg EV, depois 40 mg e 80 mg a cada 10 minutos, máximo usual 220 mg. Evitar em asma grave, bradicardia, bloqueio AV e insuficiência cardíaca descompensada.'],
  ['protocol_specific', 'Outro anti-hipertensivo do protocolo obstétrico', 'Registrar o fármaco, dose, contraindicações e resposta pressórica conforme a rotina institucional.']
] as const

const scenarioMedicationGuidance: Record<HypertensionEmergencyScenario, { preferred: string; alternatives: string; avoid: string }> = {
  aortic_syndrome: { preferred: 'Esmolol; labetalol ou metoprolol são alternativas quando ele não estiver disponível ou for inadequado', alternatives: 'Nitroprussiato ou nicardipina somente se a PAS persistir acima da meta após o betabloqueio', avoid: 'Vasodilatador isolado ou administrado antes do controle do impulso cardíaco' },
  encephalopathy: { preferred: 'Nicardipina', alternatives: 'Labetalol conforme disponibilidade e contraindicações', avoid: 'Nifedipino de ação imediata para queda não controlada' },
  ischemic_stroke_lysis: { preferred: 'Labetalol ou nicardipina conforme protocolo de AVC', alternatives: 'Agente titulável do protocolo institucional', avoid: 'Redução abaixo da meta ou queda excessiva' },
  ischemic_stroke_no_lysis: { preferred: 'Tratar somente quando indicado pelo limiar e pelo contexto neurológico', alternatives: 'Labetalol ou nicardipina se houver indicação', avoid: 'Redução rotineira que comprometa a perfusão cerebral' },
  intracerebral_hemorrhage: { preferred: 'Nicardipina', alternatives: 'Labetalol', avoid: 'Nitroprussiato quando houver preocupação com pressão intracraniana' },
  subarachnoid_hemorrhage: { preferred: 'Agente titulável definido com neurologia/neurocirurgia', alternatives: 'Nicardipina ou labetalol conforme protocolo', avoid: 'Hipotensão e redução não monitorizada' },
  catecholamine_crisis: { preferred: 'Fentolamina, se disponível', alternatives: 'Nitroprussiato com apoio de toxicologia/especialista', avoid: 'Betabloqueador isolado antes do bloqueio alfa' },
  acute_coronary_syndrome: { preferred: 'Nitroglicerina', alternatives: 'Labetalol em pacientes selecionados', avoid: 'Hidralazina isolada e hipotensão que reduza perfusão coronariana' },
  pulmonary_edema: { preferred: 'Nitroglicerina', alternatives: 'Nitroprussiato em ambiente monitorizado', avoid: 'Betabloqueador na fase aguda descompensada' },
  pregnancy_emergency: { preferred: 'Nifedipino VO ou hidralazina EV; labetalol apenas se disponível e protocolado', alternatives: 'Associar sulfato de magnésio quando indicado para prevenção/tratamento de convulsões', avoid: 'IECA, BRA e nitroprussiato, salvo situação excepcional' },
  other: { preferred: 'Agente intravenoso titulável compatível com o órgão-alvo', alternatives: 'Nicardipina, labetalol ou nitroprussiato conforme contexto e disponibilidade', avoid: 'Normalização abrupta e tratamento sem monitorização' }
}

const oralOptions = [
  ['adjust_chronic', 'Retomar o esquema habitual interrompido', 'Se houve interrupção recente, administrar a dose habitual, observar por 3–6 horas e reavaliar antes da alta.'],
  ['captopril', 'Captopril VO', '6,25–50 mg por via oral, após revisar gestação, função renal, potássio, estenose de artéria renal e demais contraindicações. Não usar por via sublingual.'],
  ['amlodipine', 'Anlodipino VO', '2,5–10 mg por via oral; opção de ação mais prolongada, individualizada conforme tratamento prévio, idade e comorbidades.'],
  ['clonidine', 'Clonidina VO', '0,1–0,2 mg inicialmente; se necessário, 0,1 mg a cada hora até 0,8 mg, com vigilância de sedação, bradicardia e risco de rebote.'],
  ['cause_only', 'Tratar o fator precipitante e reavaliar', 'Opção para pseudocrise por dor, ansiedade ou outro gatilho, sem lesão aguda demonstrada.'],
  ['no_medication', 'Sem medicação imediata', 'Organizar adesão, monitorização domiciliar e seguimento em até 7 dias quando a avaliação clínica permitir.']
] as const

const magnesiumRegimens = [
  ['zuspan', 'Esquema de Zuspan', 'Ataque: 4 g EV lentamente em 15–20 minutos. Manutenção: 1 g/h em infusão contínua; pode aumentar para 2 g/h se persistirem sintomas, conforme protocolo. Manter por 24 horas após o parto ou a última convulsão.'],
  ['pritchard', 'Esquema de Pritchard', 'Ataque: 4 g EV lentamente + 10 g IM, sendo 5 g em cada glúteo. Manutenção: 5 g IM profunda a cada 4 horas, após conferir reflexo patelar, respiração e diurese. Preferível para transferência ou ausência de bomba.']
] as const

const magnesiumSafetyOptions = [
  ['patellar_reflex', 'Reflexo patelar presente'],
  ['respiratory_rate', 'Frequência respiratória igual ou superior a 16 irpm'],
  ['urine_output', 'Diurese igual ou superior a 25 mL/h'],
  ['renal_function', 'Função renal revisada; reduzir manutenção pela metade se creatinina ≥1,2 mg/dL'],
  ['calcium', 'Gluconato de cálcio disponível para toxicidade pelo magnésio']
] as const

const labels = Object.fromEntries([
  ...symptomOptions, ...measurementOptions, ...organDamageOptions, ...triggerOptions,
  ...observationOptions, ...emergencyMeasureOptions, ...examOptions,
  ...oralOptions.map(([id, label]) => [id, label]),
  ...ivAgentOptions.map(([id, label]) => [id, label]),
  ...aorticBetaBlockerOptions.map(([id, label]) => [id, label]),
  ...aorticVasodilatorOptions.map(([id, label]) => [id, label]),
  ...pregnancyPressureOptions.map(([id, label]) => [id, label]),
  ...magnesiumRegimens.map(([id, label]) => [id, label]),
  ...magnesiumSafetyOptions
]) as Record<string, string>

export const HYPERTENSION_LABELS = labels

const toggle = (values: string[] = [], value: string) => values.includes(value)
  ? values.filter(item => item !== value)
  : [...values, value]

const parseBloodPressure = (raw?: string | null) => {
  const match = raw?.match(/(\d{2,3})\s*(?:\/|x)\s*(\d{2,3})/i)
  if (!match) return {}
  return { systolic: Number(match[1]), diastolic: Number(match[2]) }
}

const initialHypertensionData = (initialAnswers: Record<string, string>, patient: EmergencyPatient): HypertensionCaseData => {
  const saved = parseHypertensionCase(initialAnswers[HYPERTENSION_CASE_ANSWER_KEY])
  if (saved.systolic != null && saved.diastolic != null) return saved
  const universal = parseUniversalClinicalAssessment(initialAnswers[UNIVERSAL_ASSESSMENT_ANSWER_KEY])
  const imported = parseBloodPressure(universal?.sinaisVitais.bloodPressure || patient.admission?.vitalSigns?.bloodPressure)
  return { ...imported, ...saved }
}

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
  onSwitchFlowchart?: (targetFlowchart: EmergencyType) => void
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

const HypertensionFlowchartInteractive: React.FC<Props> = ({ patient, initialStep, initialHistory, initialAnswers, onUpdate, onComplete, onBack, onOpenReport, onSwitchFlowchart }) => {
  const initialStage = HYPERTENSION_STAGES.includes(initialStep as HypertensionStage) ? initialStep as HypertensionStage : 'hipertensao_confirmacao'
  const [stage, setStage] = useState<HypertensionStage>(initialStage)
  const [history, setHistory] = useState<string[]>(initialHistory.filter(item => HYPERTENSION_STAGES.includes(item as HypertensionStage)))
  const [answers, setAnswers] = useState(initialAnswers)
  const [data, setData] = useState<HypertensionCaseData>(() => initialHypertensionData(initialAnswers, patient))
  const [notice, setNotice] = useState('')
  const [showCompletion, setShowCompletion] = useState(() => Boolean(parseHypertensionCase(initialAnswers[HYPERTENSION_CASE_ANSWER_KEY]).completedAt))
  const [criticalTransition, setCriticalTransition] = useState<CareTransitionData | null>(() => {
    try { return initialAnswers.__care_transition_hipertensao_emergencia_plano ? JSON.parse(initialAnswers.__care_transition_hipertensao_emergencia_plano) : null } catch { return null }
  })
  const [title, subtitle] = stageTitles[stage]
  const finalStage = ['hipertensao_emergencia_plano', 'hipertensao_alta_sem_loa', 'hipertensao_cronica_alta'].includes(stage)
  const progress = finalStage ? 100 : Math.max(8, Math.round(((HYPERTENSION_STAGES.indexOf(stage) + 1) / HYPERTENSION_STAGES.length) * 100))
  const markedElevation = isMarkedBloodPressureElevation(data.systolic, data.diastolic, Boolean(data.obstetricContext))
  const symptomChoiceMade = (data.symptoms || []).length > 0
  const hasSymptoms = (data.symptoms || []).some(item => item !== 'asymptomatic')
  const hasOrganDamage = (data.organDamage || []).length > 0
  const hasTrigger = (data.triggers || []).length > 0
  const target = useMemo(() => {
    if (!data.scenario) return []
    const guidance = scenarioMedicationGuidance[data.scenario]
    return [
      ...HYPERTENSION_SCENARIO_TARGETS[data.scenario],
      `Preferir: ${guidance.preferred}.`,
      `Alternativas: ${guidance.alternatives}.`,
      `Evitar: ${guidance.avoid}.`
    ]
  }, [data.scenario])
  const pressureTargetDisplay = useMemo(() => {
    if (!data.scenario) return null
    const systolic = data.systolic
    const diastolic = data.diastolic
    const initialMap = systolic != null && diastolic != null ? (systolic + 2 * diastolic) / 3 : null
    const mapRange = initialMap == null ? null : `${Math.round(initialMap * 0.75)}–${Math.round(initialMap * 0.8)} mmHg`
    const displays: Record<HypertensionEmergencyScenario, { headline: string; detail: string; metric?: string }> = {
      aortic_syndrome: { headline: 'PAS <120 mmHg e FC entre 60–80 bpm', detail: 'Ou a menor PAS que mantenha perfusão adequada. Controle primeiro frequência e contratilidade; só depois associe vasodilatador se a PAS continuar acima da meta.', metric: 'Meta imediata anti-impulso' },
      encephalopathy: { headline: 'Reduzir a PAM em 20–25% na primeira hora', detail: 'Evite normalização abrupta. A faixa calculada é apenas uma referência e exige titulação pela perfusão e pelo exame neurológico.', metric: mapRange ? `PAM estimada alvo: ${mapRange}` : undefined },
      ischemic_stroke_lysis: { headline: 'Antes: <185/110 · Depois: <180/105 mmHg', detail: 'Aplicar os limites específicos antes e nas primeiras 24 horas após reperfusão, conforme o protocolo de AVC.' },
      ischemic_stroke_no_lysis: { headline: 'Em geral, tratar apenas se PA ≥220/120 mmHg', detail: 'Quando houver indicação, buscar redução aproximada de 15% nas primeiras 24 horas, evitando perda de perfusão cerebral.' },
      intracerebral_hemorrhage: { headline: 'Alvo de PAS em torno de 140 mmHg', detail: 'Quando aplicável, manter PAS entre 130–150 mmHg; individualizar nos quadros graves ou com PAS >220 mmHg.' },
      subarachnoid_hemorrhage: { headline: 'Meta individualizada com neurologia/neurocirurgia', detail: 'Controlar hipertensão grave e variabilidade sem causar hipotensão ou comprometer a perfusão cerebral.' },
      catecholamine_crisis: { headline: 'PAS <140 mmHg na primeira hora', detail: 'Controlar o estímulo adrenérgico e evitar betabloqueador isolado antes do bloqueio alfa.' },
      acute_coronary_syndrome: { headline: 'Redução titulada, preservando perfusão coronariana', detail: 'Tratar a isquemia em paralelo e evitar PAS abaixo de 100 mmHg ou queda excessiva.' },
      pulmonary_edema: { headline: 'Reduzir pós-carga conforme resposta clínica', detail: 'Titular pela pressão, perfusão, congestão, esforço respiratório e resposta ao suporte ventilatório.' },
      pregnancy_emergency: { headline: 'PAS 140–150 e PAD 90–100 mmHg', detail: 'Tratar urgentemente PA grave persistente e conduzir magnésio em paralelo quando indicado.' },
      other: { headline: 'Reduzir a PAM em 20–25% na primeira hora', detail: 'Depois, aproximar de 160/100 mmHg em 2–6 horas, sem normalização abrupta.', metric: mapRange ? `PAM estimada alvo: ${mapRange}` : undefined }
    }
    return displays[data.scenario]
  }, [data.diastolic, data.scenario, data.systolic])
  const linkedFlow = data.scenario === 'aortic_syndrome' ? { id: 'sindrome_aortica_aguda' as EmergencyType, label: 'Abrir Síndrome Aórtica Aguda' }
    : data.scenario === 'pulmonary_edema' ? { id: 'edema_agudo_pulmao' as EmergencyType, label: 'Abrir Edema Agudo de Pulmão' }
      : data.scenario === 'acute_coronary_syndrome' ? { id: 'iam' as EmergencyType, label: 'Abrir Síndrome Coronariana Aguda (IAM/SCA)' }
      : data.scenario === 'pregnancy_emergency' ? { id: 'hellp' as EmergencyType, label: 'Abrir Pré-eclâmpsia grave / HELLP' }
        : data.scenario === 'subarachnoid_hemorrhage' ? { id: 'hsa' as EmergencyType, label: 'Abrir Hemorragia Subaracnoide' }
        : data.scenario && ['ischemic_stroke_lysis', 'ischemic_stroke_no_lysis', 'intracerebral_hemorrhage', 'encephalopathy'].includes(data.scenario) ? { id: 'avc' as EmergencyType, label: 'Abrir protocolo neurológico / AVC' } : null
  const allowedIVAgents = data.scenario === 'subarachnoid_hemorrhage' || data.scenario === 'intracerebral_hemorrhage'
    ? new Set(['nicardipine', 'labetalol', 'protocol_specific'])
    : data.scenario === 'acute_coronary_syndrome'
      ? new Set(['nitroglycerin', 'metoprolol', 'protocol_specific'])
      : null
  const contextualIVAgentOptions = allowedIVAgents ? ivAgentOptions.filter(([id]) => allowedIVAgents.has(id)) : ivAgentOptions
  const emergencyTreatmentReady = data.scenario === 'aortic_syndrome'
    ? Boolean(data.aorticBetaBlocker && data.aorticVasodilator)
    : Boolean(data.selectedIVAgent) && (data.scenario !== 'pregnancy_emergency' || Boolean(data.magnesiumRegimen) && (data.magnesiumSafety || []).length >= 4)

  const update = (patch: Partial<HypertensionCaseData>) => setData(previous => ({ ...previous, ...patch }))
  const selectMany = (key: 'symptoms' | 'measurementChecks' | 'organDamage' | 'triggers' | 'observationMeasures' | 'emergencyMeasures' | 'exams' | 'magnesiumSafety', value: string) =>
    setData(previous => ({ ...previous, [key]: toggle(previous[key], value) }))
  const selectHypertensionSymptom = (value: string) => setData(previous => {
    const current = previous.symptoms || []
    if (value === 'asymptomatic') {
      return { ...previous, symptoms: current.includes(value) ? [] : ['asymptomatic'] }
    }
    return { ...previous, symptoms: toggle(current.filter(item => item !== 'asymptomatic'), value) }
  })

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

  const persistLabNotebook = (serialized: string) => {
    const nextAnswers = { ...answers, [UNIVERSAL_LAB_RESULTS_KEY]: serialized, [HYPERTENSION_CASE_ANSWER_KEY]: JSON.stringify(data) }
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
    const restartedData = initialHypertensionData(preservedAnswers, patient)
    setData(restartedData)
    setCriticalTransition(null)
    setNotice('')
    setShowCompletion(false)
    onUpdate(patient.id, 'hipertensao_confirmacao', [], { ...preservedAnswers, [HYPERTENSION_CASE_ANSWER_KEY]: JSON.stringify(restartedData) }, 8, 'Crise hipertensiva')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const continueFromConfirmation = () => {
    if (data.systolic == null || data.diastolic == null || !symptomChoiceMade) { setNotice('Registre a pressão e selecione os sintomas presentes ou marque Assintomático.'); return }
    if (data.obstetricContext && markedElevation && !data.obstetricPressureConfirmed) { setNotice('Na gestação ou no puerpério, confirme se a PA grave persistiu por aproximadamente 15 minutos.'); return }
    const route = classifyHypertensionRoute({ systolic: data.systolic, diastolic: data.diastolic, hasSymptoms, hasAcuteOrganDamage: false, hasSituationalTrigger: false, obstetricContext: data.obstetricContext })
    persist(route === 'chronic' ? 'hipertensao_cronica_alta' : 'hipertensao_lesao_orgao', { route })
  }

  const continueFromDamage = () => {
    const route = classifyHypertensionRoute({ systolic: data.systolic, diastolic: data.diastolic, hasSymptoms, hasAcuteOrganDamage: hasOrganDamage, hasSituationalTrigger: false, obstetricContext: data.obstetricContext })
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
        <motion.section id="hypertension-current-conduct" key={stage} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={clsx('rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7', showCompletion && 'hidden')}>
          {stage === 'hipertensao_confirmacao' && <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2"><label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black">Pressão sistólica (mmHg)<input aria-label="Pressão sistólica" type="number" value={data.systolic ?? ''} onChange={event => update({ systolic: event.target.value === '' ? undefined : Number(event.target.value) })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-xl" /></label><label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black">Pressão diastólica (mmHg)<input aria-label="Pressão diastólica" type="number" value={data.diastolic ?? ''} onChange={event => update({ diastolic: event.target.value === '' ? undefined : Number(event.target.value) })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-xl" /></label></div>
            <section className="rounded-2xl border border-violet-200 bg-violet-50 p-4"><Option selected={Boolean(data.obstetricContext)} title="Gestante com 20 semanas ou mais, ou paciente no puerpério" description="Ativa o limiar obstétrico: PAS ≥160 mmHg ou PAD ≥110 mmHg exige avaliação urgente quando persistente." danger onClick={() => update({ obstetricContext: !data.obstetricContext, obstetricPressureConfirmed: false })} />{data.obstetricContext && markedElevation && <div className="mt-3"><Option selected={Boolean(data.obstetricPressureConfirmed)} title="PA grave confirmada como persistente por aproximadamente 15 minutos" description="Não atrasar tratamento se houver deterioração materna, eclâmpsia ou outra ameaça imediata." danger onClick={() => update({ obstetricPressureConfirmed: !data.obstetricPressureConfirmed })} /></div>}</section>
            {data.systolic != null && data.diastolic != null && <div className={clsx('rounded-2xl border p-4 font-bold', markedElevation ? 'border-red-300 bg-red-50 text-red-950' : 'border-amber-300 bg-amber-50 text-amber-950')}>{markedElevation ? 'Elevação acentuada registrada. A próxima decisão procura lesão aguda de órgão-alvo.' : 'A medida está abaixo do limiar operacional do documento. O fluxo direcionará para hipertensão crônica/descompensada e avaliação longitudinal.'}</div>}
            <section><h2 className="mb-3 font-black text-slate-950">Sintomas associados</h2><p className="mb-3 text-sm text-slate-600">Selecione os achados presentes ou marque Assintomático. As opções são mutuamente exclusivas.</p><div className="grid gap-3 md:grid-cols-2">{symptomOptions.map(([id, label]) => <Option key={id} selected={(data.symptoms || []).includes(id)} title={label} danger={id !== 'nonspecific' && id !== 'asymptomatic'} onClick={() => selectHypertensionSymptom(id)} />)}</div></section>
            <section><h2 className="mb-3 font-black text-slate-950">Conferência da aferição</h2><div className="grid gap-3 md:grid-cols-2">{measurementOptions.map(([id, label]) => <Option key={id} selected={(data.measurementChecks || []).includes(id)} title={label} onClick={() => selectMany('measurementChecks', id)} />)}</div></section>
            <button type="button" onClick={continueFromConfirmation} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white">Classificar medida e continuar <ChevronRight /></button>
          </div>}

          {stage === 'hipertensao_lesao_orgao' && <div className="space-y-5"><div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-950"><div className="flex gap-3"><ShieldAlert className="h-6 w-6 shrink-0" /><p><strong>Emergência é uma definição clínica:</strong> selecione somente lesão nova ou em progressão. Sintomas inespecíficos isolados não bastam.</p></div></div><div className="grid gap-3 md:grid-cols-2">{organDamageOptions.map(([id, label]) => <Option key={id} selected={(data.organDamage || []).includes(id)} title={label} danger onClick={() => selectMany('organDamage', id)} />)}</div><div className="grid gap-3 sm:grid-cols-2"><button type="button" disabled={!hasOrganDamage} onClick={continueFromDamage} className="rounded-xl bg-red-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Há lesão aguda: emergência</button><button type="button" disabled={hasOrganDamage} onClick={continueFromDamage} className="rounded-xl border border-blue-300 bg-blue-50 px-5 py-4 font-extrabold text-blue-950 disabled:opacity-40">Sem lesão aguda demonstrada</button></div></div>}

          {stage === 'hipertensao_observacao' && <div className="space-y-5"><div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-blue-950"><span className="text-xs font-black uppercase tracking-wider text-blue-600">Pressão trazida da avaliação inicial</span><strong className="mt-1 block text-2xl">{data.systolic}/{data.diastolic} mmHg</strong></div><div className="grid gap-3 md:grid-cols-2">{observationOptions.map(([id, label]) => <Option key={id} selected={(data.observationMeasures || []).includes(id)} title={label} onClick={() => selectMany('observationMeasures', id)} />)}</div><label className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 font-black">Nova pressão após repouso<input value={data.pressureAfterRest || ''} onChange={event => update({ pressureAfterRest: event.target.value })} placeholder={`PA inicial ${data.systolic}/${data.diastolic}; registre a nova medida`} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" /></label><div className="grid gap-3 sm:grid-cols-2"><Option selected={data.symptomsImproved === true} title="Pressão reduziu ou sintomas melhoraram" onClick={() => update({ symptomsImproved: true })} /><Option selected={data.symptomsImproved === false} title="Permanece elevada e/ou sintomática" danger onClick={() => update({ symptomsImproved: false })} /></div><button type="button" disabled={(data.observationMeasures || []).length < 3 || data.symptomsImproved == null || !data.pressureAfterRest} onClick={() => persist('hipertensao_classificacao_sem_loa')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Interpretar reavaliação <ChevronRight /></button></div>}

          {stage === 'hipertensao_classificacao_sem_loa' && <div className="space-y-5"><div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950"><h2 className="font-black">Há um fator transitório que explica a elevação?</h2><p className="mt-1 text-sm">Sem lesão progressiva, dor, ansiedade e outros gatilhos podem produzir uma pseudocrise. Trate a causa, não o número isolado.</p></div><div className="grid gap-3 md:grid-cols-2">{triggerOptions.map(([id, label]) => <Option key={id} selected={(data.triggers || []).includes(id)} title={label} onClick={() => selectMany('triggers', id)} />)}</div><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => persist('hipertensao_alta_sem_loa', { route: hasTrigger ? 'pseudocrisis' : 'important_elevation' })} className="rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white">{hasTrigger ? 'Classificar como pseudocrise' : 'Classificar como elevação sem lesão'}</button><button type="button" onClick={() => setData(previous => ({ ...previous, triggers: [] }))} className="rounded-xl border border-slate-300 px-5 py-4 font-bold text-slate-700">Limpar gatilhos</button></div></div>}

          {stage === 'hipertensao_emergencia_preparo' && <div className="space-y-6"><div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 text-red-950"><h2 className="flex items-center gap-2 text-xl font-black"><AlertTriangle /> Lesão aguda presente</h2><p className="mt-2 text-sm">Indicar tratamento intravenoso titulável e internação monitorizada. A queda aleatória ou excessiva pode causar isquemia.</p></div><section><h2 className="mb-3 flex items-center gap-2 font-black"><Activity className="h-5 w-5" /> Preparação imediata</h2><div className="grid gap-3 md:grid-cols-2">{emergencyMeasureOptions.map(([id, label]) => <Option key={id} selected={(data.emergencyMeasures || []).includes(id)} title={label} danger={id === 'icu'} onClick={() => selectMany('emergencyMeasures', id)} />)}</div></section><section><h2 className="mb-3 flex items-center gap-2 font-black"><TestTube2 className="h-5 w-5" /> Exames iniciais sem atrasar tratamento</h2><div className="grid gap-3 md:grid-cols-2">{examOptions.map(([id, label]) => <Option key={id} selected={(data.exams || []).includes(id)} title={label} onClick={() => selectMany('exams', id)} />)}</div></section><UniversalLabNotebook value={answers[UNIVERSAL_LAB_RESULTS_KEY]} onChange={persistLabNotebook} title="Anotar resultados da emergência hipertensiva" suggestedTests={(data.exams || []).map(id => labels[id]).filter(Boolean)} /><button type="button" disabled={(data.emergencyMeasures || []).length < 4 || (data.exams || []).length < 4} onClick={() => persist('hipertensao_emergencia_cenario')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Definir lesão predominante e meta <ChevronRight /></button></div>}

          {stage === 'hipertensao_emergencia_cenario' && <div className="space-y-5"><div className="grid gap-3 md:grid-cols-2">{scenarioOptions.map(([id, label, description]) => <Option key={id} selected={data.scenario === id} title={label} description={description} danger onClick={() => update({ scenario: id, selectedIVAgent: undefined, aorticBetaBlocker: undefined, aorticVasodilator: undefined })} />)}</div><button type="button" disabled={!data.scenario} onClick={() => persist('hipertensao_emergencia_plano')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Aplicar meta específica <ChevronRight /></button></div>}

          {stage === 'hipertensao_emergencia_plano' && <div className="space-y-6">
            <div className="sticky top-3 z-10 overflow-hidden rounded-3xl border-2 border-red-500 bg-gradient-to-r from-red-700 to-rose-700 p-5 text-white shadow-xl shadow-red-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-xs font-black uppercase tracking-[0.2em] text-red-100">Meta pressórica deste tratamento</p><h2 className="mt-1 text-2xl font-black">{pressureTargetDisplay?.headline || 'Meta específica do cenário'}</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-red-50">{pressureTargetDisplay?.detail}</p></div>
                <div className="shrink-0 rounded-2xl bg-white/15 px-5 py-3 text-center ring-1 ring-white/25"><span className="block text-xs font-black uppercase tracking-wider text-red-100">PA inicial</span><strong className="text-2xl">{data.systolic}/{data.diastolic}</strong><span className="block text-xs">mmHg</span></div>
              </div>
              {pressureTargetDisplay?.metric && <div className="mt-4 rounded-xl bg-white/15 px-4 py-3 text-sm font-extrabold ring-1 ring-white/20">{pressureTargetDisplay.metric}</div>}
              <details className="mt-4 rounded-xl bg-white/10 p-3"><summary className="cursor-pointer text-sm font-extrabold">Ver critérios e cuidados da meta</summary><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-red-50">{target.map(item => <li key={item}>{item}</li>)}</ul></details>
            </div>
            {linkedFlow && onSwitchFlowchart && <section className="rounded-2xl border border-violet-300 bg-gradient-to-r from-violet-50 to-blue-50 p-5"><p className="text-xs font-black uppercase tracking-wider text-violet-700">Interlink clínico disponível</p><h3 className="mt-1 text-lg font-black text-slate-950">Continuar no protocolo específico do órgão-alvo</h3><p className="mt-2 text-sm text-slate-600">O atendimento atual será preservado no histórico e o novo fluxograma continuará com os dados do mesmo paciente.</p><button type="button" onClick={() => onSwitchFlowchart(linkedFlow.id)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-800 px-5 py-4 font-extrabold text-white">{linkedFlow.label}<ChevronRight className="h-5 w-5" /></button></section>}
            {data.scenario === 'pregnancy_emergency' && <section className="space-y-4 rounded-3xl border-2 border-violet-300 bg-violet-50 p-5"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Pré-eclâmpsia grave / eclâmpsia</p><h2 className="mt-1 text-xl font-black text-violet-950">Sulfato de magnésio sem atrasar o controle pressórico</h2><p className="mt-2 text-sm leading-relaxed text-violet-900">O magnésio previne ou trata convulsões; ele não substitui o anti-hipertensivo. Prepare em paralelo com obstetrícia e vigilância materno-fetal.</p></div><div className="grid gap-3 md:grid-cols-2">{magnesiumRegimens.map(([id, label, description]) => <Option key={id} selected={data.magnesiumRegimen === id} title={label} description={description} danger onClick={() => update({ magnesiumRegimen: id })} />)}</div>{data.magnesiumRegimen === 'zuspan' && <div className="rounded-2xl border border-violet-200 bg-white p-4 text-sm leading-relaxed text-slate-700"><strong className="text-slate-950">Preparo prático:</strong> para o ataque, 8 mL de MgSO₄ 50% correspondem a 4 g; completar para 20 mL e infundir lentamente em 15–20 minutos. Para manutenção, 10 mL de MgSO₄ 50% (5 g) em 490 mL de SF 0,9%, infundindo 100 mL/h para administrar 1 g/h. Em toxicidade, suspender o magnésio e administrar gluconato de cálcio 10%, 10 mL EV lentamente, conforme protocolo e monitorização.</div>}<div className="grid gap-3 md:grid-cols-2">{magnesiumSafetyOptions.map(([id, label]) => <Option key={id} selected={(data.magnesiumSafety || []).includes(id)} title={label} danger onClick={() => selectMany('magnesiumSafety', id)} />)}</div></section>}
            {data.scenario === 'aortic_syndrome' ? <section className="space-y-5 rounded-3xl border-2 border-red-300 bg-red-50 p-5">
              <div><p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Terapia anti-impulso em sequência obrigatória</p><h2 className="mt-1 text-xl font-black text-red-950">1. Controlar frequência e contratilidade</h2><p className="mt-2 text-sm leading-relaxed text-red-900">O esmolol é a opção preferencial pela titulação rápida. Não comece nitroprussiato ou outro vasodilatador antes do betabloqueio, pois a resposta reflexa pode aumentar o estresse sobre a aorta.</p></div>
              <div className="grid gap-3 md:grid-cols-2">{aorticBetaBlockerOptions.map(([id, label, description], index) => <div key={id} className={index === 0 ? 'md:col-span-2' : ''}><Option selected={data.aorticBetaBlocker === id} title={label} description={description} danger onClick={() => update({ aorticBetaBlocker: id, selectedIVAgent: id, aorticVasodilator: undefined })} /></div>)}</div>
              <div className={clsx('space-y-3 rounded-2xl border p-4', data.aorticBetaBlocker ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-slate-100 opacity-60')}><h3 className="font-black text-slate-950">2. Após betabloqueio, reavaliar PAS e perfusão</h3><p className="text-sm text-slate-700">Se a PAS permanecer acima de 120 mmHg, associe um vasodilatador titulável. Se já estiver no alvo, registre que ele não foi necessário.</p><div className="grid gap-3 md:grid-cols-2">{aorticVasodilatorOptions.map(([id, label, description]) => <Option key={id} selected={data.aorticVasodilator === id} title={label} description={description} danger={id !== 'not_needed'} onClick={() => { if (data.aorticBetaBlocker) update({ aorticVasodilator: id }) }} />)}</div></div>
            </section> : <section><h2 className="mb-3 font-black">{data.scenario === 'pregnancy_emergency' ? 'Estratégia para controle da pressão na gestação' : 'Estratégia intravenosa compatível com o cenário'}</h2><div className="grid gap-3 md:grid-cols-2">{(data.scenario === 'pregnancy_emergency' ? pregnancyPressureOptions : contextualIVAgentOptions).map(([id, label, description]) => <Option key={id} selected={data.selectedIVAgent === id} title={label} description={description} danger onClick={() => update({ selectedIVAgent: id })} />)}</div></section>}
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><strong>Dupla checagem obrigatória:</strong> a escolha e a dose dependem do órgão acometido, perfusão, gestação, função renal, contraindicações e protocolo institucional.</div>
            {emergencyTreatmentReady ? <UniversalCareTransition destination="icu" context="hipertensao:emergencia" value={criticalTransition} onChange={persistCriticalTransition} onConfirmed={(transition) => finish('Internação em UTI/unidade monitorizada com tratamento específico e vigilância contínua', transition)} /> : <p className="rounded-xl bg-slate-100 p-4 text-center text-sm font-bold text-slate-600">{data.scenario === 'aortic_syndrome' ? 'Registre primeiro o betabloqueador e depois a decisão sobre o vasodilatador para iniciar a transição à UTI.' : data.scenario === 'pregnancy_emergency' ? 'Selecione o esquema de magnésio, confirme ao menos quatro itens de segurança e registre o controle pressórico para iniciar a transição à UTI.' : 'Selecione o anti-hipertensivo intravenoso para iniciar a transição à unidade crítica.'}</p>}
          </div>}

          {stage === 'hipertensao_alta_sem_loa' && <div className="space-y-6"><div className={clsx('rounded-2xl border p-5', data.route === 'pseudocrisis' ? 'border-amber-300 bg-amber-50 text-amber-950' : 'border-emerald-300 bg-emerald-50 text-emerald-950')}><h2 className="text-xl font-black">{data.route === 'pseudocrisis' ? 'Pseudocrise provável' : 'Elevação importante sem lesão aguda'}</h2><p className="mt-2 text-sm">{data.route === 'pseudocrisis' ? 'Direcione a conduta ao fator precipitante e repita a pressão. Evite tratamento agressivo apenas pelo número.' : 'Mesmo assintomático, o paciente precisa de reconciliação terapêutica e seguimento. Sem lesão aguda, a redução deve ser gradual em 24–72 horas; não aplicar a meta de queda de 25% da emergência hipertensiva.'}</p><p className="mt-3 text-sm font-black">PA inicial: {data.systolic}/{data.diastolic} mmHg · PA após repouso: {data.pressureAfterRest || 'não registrada'}</p></div><section><h2 className="mb-1 text-lg font-black">Definir conduta oral individualizada</h2><p className="mb-3 text-sm text-slate-600">Escolha após revisar medicação prévia, gestação, função renal, eletrólitos, idade, fragilidade e contraindicações.</p><div className="grid gap-3 md:grid-cols-2">{oralOptions.map(([id, label, description]) => <Option key={id} selected={data.selectedOralPlan === id} title={label} description={description} onClick={() => update({ selectedOralPlan: id })} />)}</div></section><div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-950"><strong>Meta segura sem lesão aguda:</strong> reduzir gradualmente, em geral ao longo de 24–72 horas, com retorno em até 7 dias. Não usar fármaco intravenoso nem tentar normalizar a pressão rapidamente apenas pelo valor medido.</div><button type="button" disabled={!data.selectedOralPlan} onClick={() => finish(data.route === 'pseudocrisis' ? 'Alta após tratamento do fator precipitante e reavaliação' : `Alta com redução gradual em 24–72 horas e plano oral: ${labels[data.selectedOralPlan || ''] || 'individualizado'}`)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300"><Pill /> Registrar alta segura e finalizar</button></div>}

          {stage === 'hipertensao_cronica_alta' && <div className="space-y-6"><div className="rounded-2xl border border-blue-300 bg-blue-50 p-5 text-blue-950"><h2 className="text-xl font-black">Sem critério operacional de crise no caminho atual</h2><p className="mt-2 text-sm">A aferição e os sintomas registrados não preencheram simultaneamente o ponto de entrada do fluxograma. Avalie causas crônicas, adesão, drogas que elevam a pressão e risco cardiovascular global.</p></div><div className="grid gap-3 md:grid-cols-3"><div className="rounded-2xl border border-slate-200 p-4"><Stethoscope className="text-blue-700" /><strong className="mt-3 block">Reavaliar</strong><p className="mt-1 text-sm text-slate-600">Repetir a medida e examinar sinais que mudem a classificação.</p></div><div className="rounded-2xl border border-slate-200 p-4"><Pill className="text-blue-700" /><strong className="mt-3 block">Reconciliar</strong><p className="mt-1 text-sm text-slate-600">Checar adesão, interrupções, automedicação e interações.</p></div><div className="rounded-2xl border border-slate-200 p-4"><Clock3 className="text-blue-700" /><strong className="mt-3 block">Acompanhar</strong><p className="mt-1 text-sm text-slate-600">Garantir seguimento e retorno diante de sinais de alarme.</p></div></div><button type="button" onClick={() => finish('Alta/encaminhamento por hipertensão crônica mal controlada, sem emergência demonstrada')} className="w-full rounded-xl bg-blue-700 px-5 py-4 font-extrabold text-white">Registrar orientação e finalizar</button></div>}

          {['hipertensao_emergencia_plano', 'hipertensao_alta_sem_loa'].includes(stage) && <div className="mt-5 flex justify-end"><InlineClinicalCopyButton targetId="hypertension-current-conduct" /></div>}
          {notice && <p role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-950">{notice}</p>}
          <footer className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5"><button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-5 w-5" /> Voltar</button><span className="hidden text-xs font-semibold text-slate-500 sm:block">Escolhas e alvos ficam registrados no relatório clínico.</span></footer>
        </motion.section>
      </main>
    </div>
  )
}

export default HypertensionFlowchartInteractive
