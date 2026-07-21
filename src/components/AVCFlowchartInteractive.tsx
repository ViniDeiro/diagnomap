'use client'

import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Droplets,
  Heart,
  Hospital,
  FileText,
  RotateCcw,
  ScanLine,
  ShieldAlert,
  Stethoscope,
  Syringe,
  TestTube2
} from 'lucide-react'
import { clsx } from 'clsx'
import type { EmergencyPatient } from '@/types/emergency'
import ABCDEChecklist from './ABCDEChecklist'
import { UNIVERSAL_ASSESSMENT_ANSWER_KEY } from './UniversalClinicalAssessment'
import { ModifiedRankinSelector, NIHSSCalculator, type NIHSSValues } from './ClinicalScaleCalculators'
import UniversalCareTransition, { type CareTransitionData } from './UniversalCareTransition'
import {
  calculateAVCThrombolyticDose,
  evaluateAVCThrombectomy,
  type AVCTimeWindow,
  type AVCThrombectomyRecommendation,
  type AVCThrombolytic,
  type AVCVesselTerritory
} from '@/lib/avc'

export const AVC_CASE_ANSWER_KEY = 'avc_caso_estruturado'

export const AVC_STAGES = [
  'avc_ativacao',
  'avc_glicemia',
  'avc_triagem',
  'avc_nihss',
  'avc_exames',
  'avc_imagem',
  'avc_janela',
  'avc_imagem_avancada',
  'avc_trombolise_seguranca',
  'avc_trombolitico',
  'avc_pos_trombolise',
  'avc_complicacao_trombolise',
  'avc_vaso',
  'avc_trombectomia_criterios',
  'avc_desfecho_trombectomia',
  'avc_cuidados_sem_reperfusao',
  'avc_hemorragico_destino',
  'avc_aguardo_uti'
] as const

export type AVCStage = typeof AVC_STAGES[number]

export type AVCCaseData = {
  updatedAt?: string
  onsetDate?: string
  onsetTime?: string
  onsetUnknown?: boolean
  wakeUpStroke?: boolean
  symptoms?: string[]
  initialMeasures?: string[]
  abcdeDomains?: string[]
  anticoagulantStatus?: 'nao' | 'sim' | 'incerto'
  anticoagulantDetails?: string
  glucose?: number
  glucoseCorrected?: boolean
  cincinnati?: string[]
  nihss?: number
  nihssItems?: NIHSSValues
  disablingDeficit?: boolean
  weight?: number
  currentBloodPressure?: string
  premorbidRankin?: number
  exams?: string[]
  imagingResult?: 'hemorragia' | 'sem_hemorragia' | 'inconclusiva'
  timeWindow?: AVCTimeWindow
  advancedImaging?: 'mismatch' | 'sem_mismatch' | 'indisponivel'
  thrombolysisContraindications?: string[]
  pressureReadyForThrombolysis?: boolean
  thrombolytic?: AVCThrombolytic
  thrombolyticDose?: string
  receivedThrombolysis?: boolean
  postThrombolysisAlerts?: string[]
  vesselTerritory?: AVCVesselTerritory
  aspects?: number
  pcAspects?: number
  thrombectomyRecommendation?: AVCThrombectomyRecommendation
  supportiveCare?: string[]
  utiChecklist?: string[]
  utiDestination?: string
  utiNotes?: string
  utiRequestedAt?: string
  outcome?: string
  completedAt?: string
}

export const parseAVCCase = (raw?: string | null): AVCCaseData => {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed as AVCCaseData : {}
  } catch {
    return {}
  }
}

const stageMeta: Record<AVCStage, { title: string; subtitle: string; icon: React.ReactNode }> = {
  avc_ativacao: { title: 'Ativar protocolo de AVC', subtitle: 'Organize tempo, equipe e estabilização em paralelo.', icon: <Brain /> },
  avc_glicemia: { title: 'Excluir alteração glicêmica', subtitle: 'Hipoglicemia pode simular déficit focal e deve ser corrigida imediatamente.', icon: <Droplets /> },
  avc_triagem: { title: 'Teste AVEI (Escala de Cincinnati)', subtitle: 'Avalie face, braços e fala sem usar o resultado isolado para excluir AVC.', icon: <Activity /> },
  avc_nihss: { title: 'Gravidade e funcionalidade', subtitle: 'Quantifique o déficit e identifique sintomas incapacitantes, mesmo com NIHSS baixo.', icon: <Brain /> },
  avc_exames: { title: 'Exames sem atrasar reperfusão', subtitle: 'Imagem cerebral e glicemia são prioritárias; os demais exames seguem em paralelo.', icon: <TestTube2 /> },
  avc_imagem: { title: 'Resultado da imagem inicial', subtitle: 'Separe hemorragia de provável isquemia e não descarte AVC apenas por TC inicial normal.', icon: <ScanLine /> },
  avc_janela: { title: 'Janela desde o último momento bem', subtitle: 'A decisão utiliza o último horário conhecido sem déficit, não apenas a hora de chegada.', icon: <Clock3 /> },
  avc_imagem_avancada: { title: 'Seleção por imagem avançada', subtitle: 'Procure tecido potencialmente recuperável ou discordância DWI-FLAIR.', icon: <ScanLine /> },
  avc_trombolise_seguranca: { title: 'Segurança para trombólise intravenosa', subtitle: 'Revise contraindicações, pressão arterial e caráter incapacitante do déficit.', icon: <ShieldAlert /> },
  avc_trombolitico: { title: 'Escolher trombolítico e calcular dose', subtitle: 'A dose é calculada pelo peso informado e deve ser conferida à beira-leito.', icon: <Syringe /> },
  avc_pos_trombolise: { title: 'Vigilância após reperfusão IV', subtitle: 'Monitorize neurologia, pressão e sinais de complicação sem retardar trombectomia indicada.', icon: <Activity /> },
  avc_complicacao_trombolise: { title: 'Possível complicação da trombólise', subtitle: 'Interrompa a infusão quando aplicável e investigue transformação hemorrágica.', icon: <AlertTriangle /> },
  avc_vaso: { title: 'Território vascular na angioimagem', subtitle: 'A localização da oclusão define a árvore de trombectomia.', icon: <ScanLine /> },
  avc_trombectomia_criterios: { title: 'Elegibilidade para trombectomia', subtitle: 'Integre território, tempo, ASPECTS, Rankin prévio e NIHSS.', icon: <Brain /> },
  avc_desfecho_trombectomia: { title: 'Trombectomia indicada', subtitle: 'Acione transferência ou equipe neurointervencionista sem observar resposta à trombólise.', icon: <Hospital /> },
  avc_cuidados_sem_reperfusao: { title: 'Cuidados quando não há reperfusão imediata', subtitle: 'Mantenha suporte, prevenção de complicações e prevenção secundária individualizada.', icon: <CheckCircle2 /> },
  avc_hemorragico_destino: { title: 'Hemorragia intracraniana identificada', subtitle: 'Interrompa o caminho de AVC isquêmico e acione protocolo neurocrítico.', icon: <AlertTriangle /> },
  avc_aguardo_uti: { title: 'Aguardar leito de UTI', subtitle: 'O AVC confirmado permanece sob vigilância contínua até a transferência para cuidado intensivo/neurocrítico.', icon: <Hospital /> }
}

const symptomOptions = [
  ['face', 'Assimetria facial súbita'],
  ['motor', 'Fraqueza ou perda de coordenação unilateral'],
  ['sensitivo', 'Alteração sensitiva em um lado'],
  ['fala', 'Afasia, disartria ou dificuldade de compreensão'],
  ['visual', 'Perda visual, diplopia ou hemianopsia'],
  ['equilibrio', 'Ataxia intensa ou incapacidade de marcha'],
  ['posterior', 'Sinais de circulação posterior ou déficit cruzado'],
  ['consciencia', 'Redução do nível de consciência']
] as const

const formatISODateToBR = (value?: string) => {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : ''
}

const parseBRDateToISO = (value: string) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return undefined
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined
  return `${match[3]}-${match[2]}-${match[1]}`
}

const initialMeasureOptions = [
  ['equipe', 'Acionar equipe de AVC/neurologia'],
  ['monitor', 'Monitor cardíaco, pressão seriada e oximetria'],
  ['acesso', 'Acesso venoso obtido'],
  ['hgt', 'Glicemia capilar medida'],
  ['tempo', 'Último momento sem déficit registrado'],
  ['imagem', 'Tomografia priorizada'],
  ['laboratorio', 'Exames laboratoriais colhidos em paralelo']
] as const

const examOptions = [
  ['tc', 'TC de crânio sem contraste'],
  ['angio', 'Angio-TC cervical e intracraniana'],
  ['hemograma', 'Hemograma e plaquetas'],
  ['coagulacao', 'TP/INR e TTPa'],
  ['renal', 'Função renal e eletrólitos'],
  ['ecg', 'Eletrocardiograma'],
  ['troponina', 'Troponina conforme contexto'],
  ['metabolico', 'HbA1c e perfil lipídico para investigação etiológica']
] as const

const absoluteContraindications = [
  ['abs_hemorragia', 'Hemorragia intracraniana ou suspeita de sangramento ativo'],
  ['abs_extensao', 'Infarto já definido em grande extensão na imagem'],
  ['abs_avc_cirurgia', 'AVC isquêmico, neurocirurgia ou cirurgia medular nos últimos 3 meses'],
  ['abs_trauma', 'Traumatismo craniano grave recente'],
  ['abs_coagulacao', 'Plaquetas abaixo de 100 mil ou coagulação acima do limite de segurança'],
  ['abs_anticoagulante', 'Anticoagulante direto nas últimas 48 h ou HBPM terapêutica nas últimas 24 h'],
  ['abs_pa', 'PA persistente acima de 185/110 mmHg apesar do tratamento'],
  ['abs_sangramento_gi', 'Sangramento gastrointestinal recente ou neoplasia gastrointestinal com alto risco'],
  ['abs_disccao', 'Suspeita de dissecção de aorta'],
  ['abs_endocardite', 'Suspeita de endocardite infecciosa'],
  ['abs_intracraniano', 'Hemorragia intracraniana prévia ou tumor intracraniano intra-axial']
] as const

const relativeAlerts = [
  ['rel_idade', 'Idade acima de 80 anos na faixa tardia da janela'],
  ['rel_avc_dm', 'AVC prévio associado a diabetes'],
  ['rel_nihss', 'Déficit muito leve ou NIHSS muito elevado'],
  ['rel_melhora', 'Melhora precoce, porém ainda com limitação funcional'],
  ['rel_crise', 'Crise convulsiva no início do quadro'],
  ['rel_glicemia', 'Glicemia extrema já corrigida ou em correção'],
  ['rel_varfarina', 'Uso de varfarina com coagulação dentro do limite'],
  ['rel_procedimento', 'Cirurgia de grande porte ou punção arterial não compressível recente'],
  ['rel_aneurisma', 'Aneurisma intracraniano não roto sem tratamento prévio']
] as const

const postLysisAlerts = [
  ['nihss', 'Aumento do NIHSS em 4 pontos ou mais'],
  ['glasgow', 'Queda do Glasgow em 2 pontos ou mais'],
  ['cefaleia', 'Cefaleia intensa, náuseas ou vômitos novos'],
  ['convulsao', 'Crise convulsiva'],
  ['pa', 'Hipertensão refratária'],
  ['angioedema', 'Edema de língua, lábios ou via aérea']
] as const

const supportiveOptions = [
  ['disfagia', 'Manter jejum até triagem segura da deglutição'],
  ['temperatura', 'Evitar febre e corrigir alteração térmica'],
  ['glicemia', 'Manter controle glicêmico, evitando hipo e hiperglicemia'],
  ['volume', 'Corrigir hipovolemia e hipotensão com solução isotônica'],
  ['pressao', 'Definir meta pressórica conforme reperfusão realizada ou não'],
  ['antiagregante', 'Iniciar antiagregação somente após excluir hemorragia e respeitar 24 h pós-trombólise'],
  ['tevc', 'Prevenir tromboembolismo venoso e lesões por pressão'],
  ['etiologia', 'Planejar investigação etiológica e prevenção secundária']
] as const

const utiSafetyOptions = [
  ['leito', 'Solicitar e registrar o leito de UTI ou unidade neurocrítica'],
  ['monitor', 'Manter monitorização cardiorrespiratória e oximetria contínuas'],
  ['neurologico', 'Repetir avaliação neurológica e sinais vitais conforme gravidade'],
  ['metas', 'Manter metas de pressão, glicemia, temperatura e oxigenação'],
  ['complicacoes', 'Vigiar deterioração, sangramento, edema cerebral, convulsão e broncoaspiração'],
  ['handoff', 'Preparar passagem de caso com horários, NIHSS, imagem e terapias realizadas'],
  ['transporte', 'Organizar transporte monitorizado com equipe e recursos compatíveis']
] as const

const toggleValue = (values: string[] = [], value: string) => values.includes(value)
  ? values.filter(item => item !== value)
  : [...values, value]

const CardOption = ({ selected, title, description, danger, onClick }: { selected: boolean; title: string; description?: string; danger?: boolean; onClick: () => void }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={clsx(
      'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all',
      selected
        ? danger ? 'border-red-500 bg-red-50 shadow-sm ring-2 ring-red-100' : 'border-indigo-500 bg-indigo-50 shadow-sm ring-2 ring-indigo-100'
        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
    )}
  >
    <span className={clsx('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border', selected ? danger ? 'border-red-600 bg-red-600 text-white' : 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 text-transparent')}>
      <CheckCircle2 className="h-4 w-4" />
    </span>
    <span>
      <span className="block font-extrabold text-slate-900">{title}</span>
      {description && <span className="mt-1 block text-sm leading-relaxed text-slate-600">{description}</span>}
    </span>
  </button>
)

interface AVCFlowchartInteractiveProps {
  patient: EmergencyPatient
  initialStep: string
  initialHistory: string[]
  initialAnswers: Record<string, string>
  onUpdate: (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, riskGroup?: string) => void
  onComplete: () => void
  onBack?: () => void
  onOpenReport?: () => void
}

const AVCFlowchartInteractive: React.FC<AVCFlowchartInteractiveProps> = ({
  patient,
  initialStep,
  initialHistory,
  initialAnswers,
  onUpdate,
  onComplete,
  onBack,
  onOpenReport
}) => {
  const safeInitialStage = AVC_STAGES.includes(initialStep as AVCStage) ? initialStep as AVCStage : 'avc_ativacao'
  const [stage, setStage] = useState<AVCStage>(safeInitialStage)
  const [history, setHistory] = useState<string[]>(initialHistory.filter(item => AVC_STAGES.includes(item as AVCStage)))
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [data, setData] = useState<AVCCaseData>(() => ({ weight: patient.weight, ...parseAVCCase(initialAnswers[AVC_CASE_ANSWER_KEY]) }))
  const [onsetDateText, setOnsetDateText] = useState(() => formatISODateToBR(parseAVCCase(initialAnswers[AVC_CASE_ANSWER_KEY]).onsetDate))
  const [notice, setNotice] = useState('')
  const [showCompletion, setShowCompletion] = useState(() => Boolean(parseAVCCase(initialAnswers[AVC_CASE_ANSWER_KEY]).completedAt))
  const [careTransition, setCareTransition] = useState<CareTransitionData | null>(() => {
    try { return initialAnswers.__care_transition_avc_aguardo_uti ? JSON.parse(initialAnswers.__care_transition_avc_aguardo_uti) : null } catch { return null }
  })

  const isFinalStage = stage === 'avc_aguardo_uti'
  const progress = isFinalStage ? 100 : Math.max(4, Math.round(((AVC_STAGES.indexOf(stage) + 1) / AVC_STAGES.length) * 100))
  const currentMeta = stageMeta[stage]
  const hasAbsoluteContraindication = (data.thrombolysisContraindications || []).some(value => value.startsWith('abs_'))
  const nonDisablingMinorStroke = (data.nihss ?? 0) <= 5 && !data.disablingDeficit
  const thrombolysisBlocked = hasAbsoluteContraindication || nonDisablingMinorStroke || !data.pressureReadyForThrombolysis

  const update = (patch: Partial<AVCCaseData>) => setData(previous => ({ ...previous, ...patch }))
  const persist = (nextStage: AVCStage, patch: Partial<AVCCaseData> = {}) => {
    const nextData = { ...data, ...patch, updatedAt: new Date().toISOString() }
    const nextHistory = [...history, stage]
    const nextAnswers = {
      ...answers,
      [stage]: JSON.stringify(patch),
      [AVC_CASE_ANSWER_KEY]: JSON.stringify(nextData)
    }
    setData(nextData)
    setHistory(nextHistory)
    setAnswers(nextAnswers)
    setStage(nextStage)
    setNotice('')
    onUpdate(patient.id, nextStage, nextHistory, nextAnswers, Math.max(progress, 8), 'AVC')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const goBack = () => {
    const previous = history[history.length - 1]
    if (!previous || !AVC_STAGES.includes(previous as AVCStage)) {
      onBack?.()
      return
    }
    const nextHistory = history.slice(0, -1)
    setHistory(nextHistory)
    setStage(previous as AVCStage)
    onUpdate(patient.id, previous, nextHistory, answers, Math.max(4, progress - 6), 'AVC')
  }
  const restart = () => {
    const preservedAnswers: Record<string, string> = {}
    if (answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY]) {
      preservedAnswers[UNIVERSAL_ASSESSMENT_ANSWER_KEY] = answers[UNIVERSAL_ASSESSMENT_ANSWER_KEY]
    }
    const restartedData: AVCCaseData = { weight: patient.weight }
    setStage('avc_ativacao')
    setHistory([])
    setAnswers(preservedAnswers)
    setData(restartedData)
    setOnsetDateText('')
    setNotice('')
    setShowCompletion(false)
    onUpdate(patient.id, 'avc_ativacao', [], preservedAnswers, 4, 'AVC')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const finalizeCase = (outcome: string, confirmedTransition?: CareTransitionData) => {
    const finalData = { ...data, outcome, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    const nextAnswers = { ...answers, ...(confirmedTransition ? { __care_transition_avc_aguardo_uti: JSON.stringify(confirmedTransition) } : {}), [AVC_CASE_ANSWER_KEY]: JSON.stringify(finalData) }
    setData(finalData)
    setAnswers(nextAnswers)
    onUpdate(patient.id, stage, [...history, stage], nextAnswers, 100, 'AVC')
    setShowCompletion(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const finish = (outcome: string) => {
    finalizeCase(outcome)
  }
  const finishWithTransition = (outcome: string, transition: CareTransitionData) => {
    finalizeCase(outcome, transition)
  }
  const proceedToIcu = (outcome: string) => persist('avc_aguardo_uti', {
    outcome,
    utiRequestedAt: data.utiRequestedAt || new Date().toISOString()
  })
  const persistCareTransition = (transition: CareTransitionData) => {
    const nextAnswers = { ...answers, __care_transition_avc_aguardo_uti: JSON.stringify(transition) }
    setCareTransition(transition)
    setAnswers(nextAnswers)
    onUpdate(patient.id, stage, history, nextAnswers, progress, 'AVC')
  }

  const handleBack = () => {
    if (showCompletion) {
      setShowCompletion(false)
      return
    }
    goBack()
  }

  const lyticDose = useMemo(() => calculateAVCThrombolyticDose(data.weight, data.thrombolytic), [data.thrombolytic, data.weight])

  const thrombectomyRecommendation = useMemo(() => evaluateAVCThrombectomy(data), [data])

  const selectMany = (key: keyof AVCCaseData, value: string) => {
    const current = Array.isArray(data[key]) ? data[key] as string[] : []
    update({ [key]: toggleValue(current, value) } as Partial<AVCCaseData>)
  }

  const updateAbcde = (abcdeDomains: string[]) => {
    const measuresWithoutLegacyAbcde = (data.initialMeasures || []).filter((item) => item !== 'abcde')
    update({
      abcdeDomains,
      initialMeasures: abcdeDomains.length > 0 ? [...measuresWithoutLegacyAbcde, 'abcde'] : measuresWithoutLegacyAbcde
    })
  }

  const nextFromWindow = (windowValue: AVCCaseData['timeWindow']) => {
    if (!windowValue) return
    if (windowValue === 'ate_45h') persist('avc_trombolise_seguranca', { timeWindow: windowValue })
    else if (windowValue === '45_6h' || windowValue === '6_9h' || windowValue === 'desconhecida') persist('avc_imagem_avancada', { timeWindow: windowValue })
    else if (windowValue === '9_24h') persist('avc_vaso', { timeWindow: windowValue })
    else persist('avc_cuidados_sem_reperfusao', { timeWindow: windowValue })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/50 to-violet-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="sticky top-0 z-50 -mx-4 -mt-5 mb-8 border-b border-white/60 bg-white/90 shadow-lg backdrop-blur-md sm:-mx-6 lg:-mx-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-700 to-violet-700 text-white shadow-lg shadow-indigo-200">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 sm:text-2xl">{patient.name || 'Paciente sem nome'}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                <Heart className="h-4 w-4 text-indigo-600" />
                <span>{patient.age ? `${patient.age} anos` : 'Idade não informada'} • {patient.medicalRecord || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onBack && (
              <motion.button
                type="button"
                onClick={onBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-2.5 font-bold text-slate-700 shadow-sm transition-all hover:from-slate-200 hover:to-slate-300 hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </motion.button>
            )}

            <motion.button
              type="button"
              onClick={handleBack}
              disabled={!showCompletion && history.length === 0}
              whileHover={showCompletion || history.length > 0 ? { scale: 1.02 } : {}}
              whileTap={showCompletion || history.length > 0 ? { scale: 0.98 } : {}}
              className={clsx(
                'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 font-bold transition-all',
                showCompletion || history.length > 0
                  ? 'border-amber-300 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 shadow-sm hover:from-amber-200 hover:to-amber-300 hover:shadow-md'
                  : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Voltar</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={restart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-300 bg-gradient-to-br from-indigo-100 to-violet-100 px-4 py-2.5 font-bold text-indigo-800 shadow-sm transition-all hover:from-indigo-200 hover:to-violet-200 hover:shadow-md"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reiniciar</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-indigo-100 bg-white shadow-2xl shadow-indigo-950/10">
        <header className="relative overflow-hidden bg-gradient-to-r from-indigo-800 via-violet-700 to-fuchsia-700 px-5 py-6 text-white sm:px-8">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-start justify-between gap-5">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 [&>svg]:h-7 [&>svg]:w-7">{currentMeta.icon}</div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-100">Protocolo interativo de AVC agudo</p>
                <h1 className="mt-1 text-2xl font-black sm:text-3xl">{currentMeta.title}</h1>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-violet-100">{currentMeta.subtitle}</p>
              </div>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-extrabold ring-1 ring-white/20">{progress}%</span>
          </div>
          <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} /></div>
        </header>

        <main className="p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-extrabold text-indigo-950">{patient.name || 'Paciente em atendimento'}</p><p className="text-sm text-indigo-700">Tempo é determinante: execute estabilização, exames e contato com referência em paralelo.</p></div>
            <div className="flex flex-wrap gap-2 text-xs font-bold text-indigo-800">
              {data.nihss != null && <span className="rounded-full bg-white px-3 py-1.5">NIHSS {data.nihss}</span>}
              {data.timeWindow && <span className="rounded-full bg-white px-3 py-1.5">Janela registrada</span>}
              {data.receivedThrombolysis && <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-800">Trombólise registrada</span>}
            </div>
          </div>

          {showCompletion && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-xl shadow-emerald-900/15 sm:p-8">
                <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25"><CheckCircle2 className="h-8 w-8" /></span>
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Protocolo registrado</p>
                      <h2 className="mt-1 text-2xl font-black sm:text-3xl">Atendimento de AVC finalizado</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-50">As decisões, achados e condutas deste caminho foram preservados no prontuário clínico.</p>
                    </div>
                  </div>
                  <span className="w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-extrabold ring-1 ring-white/25">100% concluído</span>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-black uppercase tracking-wider text-slate-500">NIHSS</p><p className="mt-2 text-2xl font-black text-slate-950">{data.nihss ?? 'Não informado'}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Glicemia</p><p className="mt-2 text-2xl font-black text-slate-950">{data.glucose != null ? `${data.glucose} mg/dL` : 'Não informada'}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Imagem inicial</p><p className="mt-2 text-lg font-black text-slate-950">{data.imagingResult === 'hemorragia' ? 'Hemorragia identificada' : data.imagingResult === 'sem_hemorragia' ? 'Sem hemorragia' : data.imagingResult === 'inconclusiva' ? 'Inconclusiva' : 'Não informada'}</p></div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="text-xs font-black uppercase tracking-wider text-slate-500">Reperfusão</p><p className="mt-2 text-lg font-black text-slate-950">{data.receivedThrombolysis ? 'Trombólise registrada' : data.thrombectomyRecommendation === 'forte' || data.thrombectomyRecommendation === 'considerar' ? 'Via endovascular avaliada' : 'Sem reperfusão registrada'}</p></div>
              </section>

              <section className="rounded-[1.75rem] border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-700 text-white"><FileText className="h-5 w-5" /></span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">Síntese do desfecho</p>
                    <h3 className="mt-1 text-xl font-black text-indigo-950">{data.outcome || 'Conduta final registrada'}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-indigo-800">Finalizado em {data.completedAt ? new Date(data.completedAt).toLocaleString('pt-BR') : 'horário não informado'}. O relatório reúne cronologia, exame, ABCDE, estratificação, imagem e decisões terapêuticas.</p>
                  </div>
                </div>
              </section>

              <section className="rounded-[1.75rem] border border-cyan-200 bg-cyan-50 p-6 sm:p-7">
                <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-700 text-white"><Hospital className="h-5 w-5" /></span><div><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Destino assistencial</p><h3 className="mt-1 text-xl font-black text-cyan-950">UTI / unidade neurocrítica solicitada</h3><p className="mt-2 text-sm leading-relaxed text-cyan-900">{data.utiDestination || 'Destino específico não informado'} · {(data.utiChecklist || []).length} medidas de segurança registradas durante a espera.</p></div></div>
              </section>

              <div className="grid gap-3 sm:grid-cols-3">
                <button type="button" onClick={() => setShowCompletion(false)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-4 font-extrabold text-slate-700 hover:bg-slate-50"><ChevronLeft className="h-5 w-5" /> Revisar última etapa</button>
                {onOpenReport && <button type="button" onClick={onOpenReport} className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-300 bg-indigo-50 px-5 py-4 font-extrabold text-indigo-900 hover:bg-indigo-100"><FileText className="h-5 w-5" /> Abrir relatório completo</button>}
                <button type="button" onClick={onComplete} className={clsx('inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-4 font-extrabold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-800', !onOpenReport && 'sm:col-span-2')}><CheckCircle2 className="h-5 w-5" /> Concluir e ir ao dashboard</button>
              </div>
            </motion.div>
          )}

          <div className={showCompletion ? 'hidden' : undefined}>

          {stage === 'avc_ativacao' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <section><h2 className="text-lg font-black text-slate-950">Manifestações de início súbito</h2><p className="mt-1 text-sm text-slate-600">Marque todos os déficits presentes. Sinais posteriores também exigem ativação do protocolo.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{symptomOptions.map(([id, label]) => <CardOption key={id} selected={(data.symptoms || []).includes(id)} title={label} onClick={() => selectMany('symptoms', id)} />)}</div></section>
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h2 className="font-black text-slate-950">Último momento conhecido sem déficit</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-sm font-bold text-slate-700">Data<input type="text" inputMode="numeric" lang="pt-BR" placeholder="DD/MM/AAAA" maxLength={10} value={onsetDateText} onChange={event => { const digits = event.target.value.replace(/\D/g, '').slice(0, 8); const masked = digits.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2'); const onsetDate = parseBRDateToISO(masked); setOnsetDateText(masked); update({ onsetDate, onsetUnknown: false }) }} aria-label="Data do último momento conhecido sem déficit no formato dia, mês e ano" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3" /></label><label className="text-sm font-bold text-slate-700">Horário<input type="time" lang="pt-BR" value={data.onsetTime || ''} onChange={event => update({ onsetTime: event.target.value, onsetUnknown: false })} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3" /></label><CardOption selected={Boolean(data.wakeUpStroke)} title="Déficit percebido ao acordar" onClick={() => update({ wakeUpStroke: !data.wakeUpStroke, onsetUnknown: true })} /><CardOption selected={Boolean(data.onsetUnknown)} title="Horário não determinado" onClick={() => update({ onsetUnknown: !data.onsetUnknown })} /></div></section>
              <ABCDEChecklist
                value={data.abcdeDomains || []}
                onChange={updateAbcde}
                title="Estabilização inicial — ABCDE"
                subtitle="Registre os cinco domínios em paralelo à ativação do protocolo, sem atrasar glicemia ou imagem cerebral."
              />
              <section><h2 className="text-lg font-black text-slate-950">Medidas simultâneas</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{initialMeasureOptions.map(([id, label]) => <CardOption key={id} selected={(data.initialMeasures || []).includes(id)} title={label} onClick={() => selectMany('initialMeasures', id)} />)}</div></section>
              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-black text-amber-950">Anticoagulantes</h2><div className="mt-3 grid gap-3 sm:grid-cols-3">{([['nao','Não usa'],['sim','Uso confirmado'],['incerto','Informação incerta']] as const).map(([id,label]) => <CardOption key={id} selected={data.anticoagulantStatus === id} title={label} danger={id !== 'nao'} onClick={() => update({ anticoagulantStatus: id })} />)}</div>{data.anticoagulantStatus !== 'nao' && <textarea value={data.anticoagulantDetails || ''} onChange={event => update({ anticoagulantDetails: event.target.value })} placeholder="Fármaco, dose e horário da última administração" className="mt-3 w-full rounded-xl border border-amber-300 bg-white p-3 text-sm" />}</section>
              <button type="button" disabled={(data.symptoms || []).length === 0 || (!data.onsetUnknown && (!data.onsetDate || !data.onsetTime))} onClick={() => persist('avc_glicemia')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-4 font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Registrar ativação e verificar glicemia <ChevronRight /></button>
            </motion.div>
          )}

          {stage === 'avc_glicemia' && (
            <div className="space-y-5"><label className="block rounded-2xl border border-slate-200 bg-slate-50 p-5"><span className="font-black text-slate-950">Glicemia capilar (mg/dL)</span><input type="number" min="10" max="1000" value={data.glucose ?? ''} onChange={event => update({ glucose: event.target.value ? Number(event.target.value) : undefined, glucoseCorrected: false })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-bold" /></label>{data.glucose != null && data.glucose < 60 && <div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-950"><h3 className="font-black">Hipoglicemia identificada</h3><p className="mt-1 text-sm">Corrija imediatamente e repita o exame neurológico. Persistência do déficit mantém a investigação de AVC.</p><CardOption selected={Boolean(data.glucoseCorrected)} title="Hipoglicemia corrigida e paciente reavaliado" danger onClick={() => update({ glucoseCorrected: !data.glucoseCorrected })} /></div>}<button type="button" disabled={data.glucose == null || (data.glucose < 60 && !data.glucoseCorrected)} onClick={() => persist('avc_triagem')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Seguir para triagem neurológica <ChevronRight /></button></div>
          )}

          {stage === 'avc_triagem' && (
            <div className="space-y-5"><div className="grid gap-3 md:grid-cols-3">{[['face','Assimetria ao sorrir','Um lado da face apresenta menor movimento.'],['braco','Queda de um braço','Há queda, ausência de elevação ou assimetria sustentada.'],['fala','Alteração da fala','Fala incompreensível, troca de palavras ou incapacidade de repetir frase.']].map(([id,title,description]) => <CardOption key={id} selected={(data.cincinnati || []).includes(id)} title={title} description={description} onClick={() => selectMany('cincinnati', id)} />)}</div><div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><strong>Importante:</strong> triagem sem alteração não exclui circulação posterior, déficit visual, ataxia, AIT ou outros AVCs. A decisão deve considerar todo o exame neurológico.</div><button type="button" onClick={() => persist('avc_nihss')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-4 font-extrabold text-white">Registrar triagem e calcular gravidade <ChevronRight /></button></div>
          )}

          {stage === 'avc_nihss' && (
            <div className="space-y-5"><NIHSSCalculator value={data.nihssItems || {}} onChange={(nihssItems, nihss) => update({ nihssItems, nihss })} /><ModifiedRankinSelector value={data.premorbidRankin} onChange={premorbidRankin => update({ premorbidRankin })} /><label className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-900">Peso para reperfusão (kg)<input type="number" min="3" max="300" step="0.1" value={data.weight ?? ''} onChange={event => update({ weight: event.target.value === '' ? undefined : Number(event.target.value) })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg" /></label><CardOption selected={Boolean(data.disablingDeficit)} title="Déficit clinicamente incapacitante" description="Ex.: afasia relevante, hemianopsia, perda funcional da mão dominante ou limitação que impeça atividades essenciais." onClick={() => update({ disablingDeficit: !data.disablingDeficit })} />{nonDisablingMinorStroke && data.nihss != null && <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-950">NIHSS baixo com déficit não incapacitante reduz o benefício esperado da trombólise IV; mantenha avaliação de imagem e prevenção secundária.</div>}<button type="button" disabled={data.nihss == null || data.premorbidRankin == null} onClick={() => persist('avc_exames')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Registrar gravidade e organizar exames <ChevronRight /></button></div>
          )}

          {stage === 'avc_exames' && (
            <div className="space-y-5"><div className="grid gap-3 md:grid-cols-2">{examOptions.map(([id,label]) => <CardOption key={id} selected={(data.exams || []).includes(id)} title={label} onClick={() => selectMany('exams', id)} />)}</div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><strong>Não aguarde toda a bateria laboratorial:</strong> quando não há suspeita de coagulopatia ou exposição relevante a anticoagulantes, glicemia e imagem cerebral orientam a decisão inicial de reperfusão.</div><button type="button" disabled={!(data.exams || []).includes('tc')} onClick={() => persist('avc_imagem')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Registrar exames e interpretar imagem <ChevronRight /></button></div>
          )}

          {stage === 'avc_imagem' && (
            <div className="space-y-4"><CardOption selected={data.imagingResult === 'hemorragia'} title="Hemorragia intracraniana presente" description="O caminho de reperfusão isquêmica deve ser interrompido." danger onClick={() => update({ imagingResult: 'hemorragia' })} /><CardOption selected={data.imagingResult === 'sem_hemorragia'} title="Sem hemorragia na imagem inicial" description="Prosseguir como possível AVC isquêmico conforme tempo e déficit." onClick={() => update({ imagingResult: 'sem_hemorragia' })} /><CardOption selected={data.imagingResult === 'inconclusiva'} title="Imagem sem diagnóstico definitivo" description="Uma TC precoce normal não exclui isquemia; correlacionar com clínica e imagem vascular." onClick={() => update({ imagingResult: 'inconclusiva' })} /><button type="button" disabled={!data.imagingResult} onClick={() => data.imagingResult === 'hemorragia' ? persist('avc_hemorragico_destino') : persist('avc_janela')} className={clsx('flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 font-extrabold text-white disabled:bg-slate-300', data.imagingResult === 'hemorragia' ? 'bg-red-700' : 'bg-indigo-700')}>Confirmar resultado e continuar <ChevronRight /></button></div>
          )}

          {stage === 'avc_janela' && (
            <div className="grid gap-3 md:grid-cols-2">{([['ate_45h','Até 4 horas e 30 minutos','Avaliar trombólise IV e, em paralelo, oclusão de grande vaso.'],['45_6h','Entre 4 horas e 30 minutos e 6 horas','Imagem avançada pode selecionar trombólise; grande vaso ainda está na janela precoce da trombectomia.'],['6_9h','Entre 6 e 9 horas','Usar imagem avançada para reperfusão em pacientes selecionados.'],['9_24h','Entre 9 e 24 horas','Priorizar seleção para trombectomia conforme território e imagem.'],['mais_24h','Mais de 24 horas','Sem reperfusão rotineira pelo tempo; instituir cuidados e prevenção secundária.'],['desconhecida','Horário desconhecido ou wake-up stroke','Usar protocolo de imagem avançada quando disponível.']] as const).map(([id,title,description]) => <CardOption key={id} selected={data.timeWindow === id} title={title} description={description} danger={id === 'mais_24h'} onClick={() => nextFromWindow(id)} />)}</div>
          )}

          {stage === 'avc_imagem_avancada' && (
            <div className="space-y-4"><CardOption selected={data.advancedImaging === 'mismatch'} title="Padrão favorável de tecido viável" description="Há discordância compatível com tecido potencialmente recuperável na perfusão ou DWI-FLAIR." onClick={() => update({ advancedImaging: 'mismatch' })} /><CardOption selected={data.advancedImaging === 'sem_mismatch'} title="Sem padrão favorável" description="A imagem não demonstra seleção adequada para trombólise em janela estendida." danger onClick={() => update({ advancedImaging: 'sem_mismatch' })} /><CardOption selected={data.advancedImaging === 'indisponivel'} title="Imagem avançada indisponível" description="Não atrasar angioimagem, transferência ou discussão com centro especializado." onClick={() => update({ advancedImaging: 'indisponivel' })} /><button type="button" disabled={!data.advancedImaging} onClick={() => data.advancedImaging === 'mismatch' ? persist('avc_trombolise_seguranca') : persist('avc_vaso')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Aplicar resultado da imagem <ChevronRight /></button></div>
          )}

          {stage === 'avc_trombolise_seguranca' && (
            <div className="space-y-6"><section><h2 className="text-lg font-black text-red-950">Impedimentos maiores</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{absoluteContraindications.map(([id,label]) => <CardOption key={id} selected={(data.thrombolysisContraindications || []).includes(id)} title={label} danger onClick={() => selectMany('thrombolysisContraindications', id)} />)}</div></section><section><h2 className="text-lg font-black text-amber-950">Alertas para decisão individualizada</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{relativeAlerts.map(([id,label]) => <CardOption key={id} selected={(data.thrombolysisContraindications || []).includes(id)} title={label} onClick={() => selectMany('thrombolysisContraindications', id)} />)}</div></section><div className="grid gap-3 md:grid-cols-2"><label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-900">Pressão arterial atual<input value={data.currentBloodPressure || ''} onChange={event => update({ currentBloodPressure: event.target.value })} placeholder="Ex.: 170/100" className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" /></label><CardOption selected={Boolean(data.pressureReadyForThrombolysis)} title="PA abaixo ou igual a 185/110 mmHg" description="Se inicialmente acima, confirmar redução segura antes de iniciar o trombolítico." danger={!data.pressureReadyForThrombolysis} onClick={() => update({ pressureReadyForThrombolysis: !data.pressureReadyForThrombolysis })} /></div>{thrombolysisBlocked && <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-950">A trombólise IV não está liberada pelos dados registrados. Isso não encerra a avaliação para trombectomia.</div>}<div className="grid gap-3 sm:grid-cols-2"><button type="button" disabled={thrombolysisBlocked} onClick={() => persist('avc_trombolitico')} className="rounded-xl bg-emerald-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Elegível: escolher trombolítico</button><button type="button" onClick={() => persist('avc_vaso')} className="rounded-xl border border-indigo-300 bg-indigo-50 px-5 py-4 font-extrabold text-indigo-900">Sem trombólise IV: avaliar trombectomia</button></div></div>
          )}

          {stage === 'avc_trombolitico' && (
            <div className="space-y-5"><div className="grid gap-3 md:grid-cols-2"><CardOption selected={data.thrombolytic === 'tenecteplase'} title="Tenecteplase" description="0,25 mg/kg, máximo de 25 mg, administrada em bolus único." onClick={() => update({ thrombolytic: 'tenecteplase' })} /><CardOption selected={data.thrombolytic === 'alteplase'} title="Alteplase" description="0,9 mg/kg, máximo de 90 mg: 10% em bolus e o restante em uma hora." onClick={() => update({ thrombolytic: 'alteplase' })} /></div><label className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black text-slate-900">Peso confirmado (kg)<input type="number" min="3" max="300" step="0.1" value={data.weight ?? ''} onChange={event => update({ weight: event.target.value === '' ? undefined : Number(event.target.value) })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg" /></label>{lyticDose && <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5"><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Cálculo para conferência</p><p className="mt-2 text-lg font-black text-emerald-950">{lyticDose}</p><p className="mt-2 text-sm text-emerald-800">Confirmar peso, apresentação disponível, pressão e dupla checagem institucional antes da administração.</p></div>}<button type="button" disabled={!data.thrombolytic || !lyticDose} onClick={() => persist('avc_pos_trombolise', { thrombolyticDose: lyticDose, receivedThrombolysis: true })} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Registrar trombólise e iniciar vigilância <ChevronRight /></button></div>
          )}

          {stage === 'avc_pos_trombolise' && (
            <div className="space-y-5"><div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-950"><h3 className="font-black">Primeiras 24 horas</h3><ul className="mt-2 list-disc space-y-1 pl-5"><li>NIHSS seriado: intervalos curtos na primeira hora, ampliando progressivamente até 24 h.</li><li>Manter PA abaixo de 180/105 mmHg.</li><li>Evitar punções e dispositivos invasivos não indispensáveis.</li><li>Não iniciar antiagregante ou anticoagulante antes da imagem de controle em 24 h.</li></ul></div><h2 className="font-black text-slate-950">Há sinal de complicação?</h2><div className="grid gap-3 md:grid-cols-2">{postLysisAlerts.map(([id,label]) => <CardOption key={id} selected={(data.postThrombolysisAlerts || []).includes(id)} title={label} danger onClick={() => selectMany('postThrombolysisAlerts', id)} />)}</div><div className="grid gap-3 sm:grid-cols-2"><button type="button" disabled={(data.postThrombolysisAlerts || []).length === 0} onClick={() => persist('avc_complicacao_trombolise')} className="rounded-xl bg-red-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Investigar complicação imediatamente</button><button type="button" onClick={() => persist('avc_vaso')} className="rounded-xl bg-indigo-700 px-5 py-4 font-extrabold text-white">Sem alerta: avaliar grande vaso</button></div></div>
          )}

          {stage === 'avc_complicacao_trombolise' && (
            <div className="space-y-5"><div className="rounded-2xl border-2 border-red-400 bg-red-50 p-5 text-red-950"><h2 className="text-xl font-black">Ação imediata</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm"><li>Interromper a infusão do trombolítico, quando ainda estiver em curso.</li><li>Repetir TC de crânio e colher hemograma, coagulação e fibrinogênio.</li><li>Se houver transformação hemorrágica, discutir reversão com hemoterapia, neurologia e neurocirurgia.</li><li>No angioedema orolingual, priorizar avaliação e proteção da via aérea.</li></ul></div><button type="button" onClick={() => proceedToIcu('Complicação após trombólise - manejo neurocrítico imediato')} className="w-full rounded-xl bg-red-700 px-5 py-4 font-extrabold text-white">Registrar intercorrência e solicitar UTI</button></div>
          )}

          {stage === 'avc_vaso' && (
            <div className="grid gap-3 md:grid-cols-2">{([['grande_anterior','Grande vaso da circulação anterior','Carótida interna ou segmento proximal da cerebral média.'],['m2_dominante','Ramo M2 dominante','Oclusão de médio vaso com território funcional relevante.'],['medio_distal','Médio vaso distal ou não dominante','Evidência de benefício rotineiro é insuficiente no protocolo.'],['basilar','Artéria basilar','Aplicar PC-ASPECTS, NIHSS e funcionalidade prévia.'],['sem_ogv','Sem oclusão tratável de grande vaso','Seguir cuidados clínicos e prevenção secundária.']] as const).map(([id,title,description]) => <CardOption key={id} selected={data.vesselTerritory === id} title={title} description={description} danger={id === 'medio_distal'} onClick={() => id === 'sem_ogv' ? persist('avc_cuidados_sem_reperfusao', { vesselTerritory: id }) : update({ vesselTerritory: id })} />)}{data.vesselTerritory && data.vesselTerritory !== 'sem_ogv' && <button type="button" onClick={() => persist('avc_trombectomia_criterios')} className="md:col-span-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-4 font-extrabold text-white">Aplicar critérios de trombectomia <ChevronRight /></button>}</div>
          )}

          {stage === 'avc_trombectomia_criterios' && (
            <div className="space-y-5"><div className="grid gap-4 md:grid-cols-3">{data.vesselTerritory === 'basilar' ? <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black">PC-ASPECTS<input type="number" min="0" max="10" value={data.pcAspects ?? ''} onChange={event => update({ pcAspects: event.target.value === '' ? undefined : Number(event.target.value) })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" /></label> : <label className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-black">ASPECTS<input type="number" min="0" max="10" value={data.aspects ?? ''} onChange={event => update({ aspects: event.target.value === '' ? undefined : Number(event.target.value) })} className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3" /></label>}<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm"><p className="font-black">Rankin prévio</p><p className="mt-3 text-2xl font-black text-indigo-800">{data.premorbidRankin ?? '—'}</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm"><p className="font-black">NIHSS</p><p className="mt-3 text-2xl font-black text-indigo-800">{data.nihss ?? '—'}</p></div></div><div className={clsx('rounded-2xl border p-5', thrombectomyRecommendation === 'forte' ? 'border-emerald-300 bg-emerald-50' : thrombectomyRecommendation === 'considerar' ? 'border-amber-300 bg-amber-50' : 'border-slate-300 bg-slate-50')}><p className="text-xs font-black uppercase tracking-wider">Resultado da árvore decisória</p><p className="mt-2 text-xl font-black">{thrombectomyRecommendation === 'forte' ? 'Indicação sustentada pelo caminho do protocolo' : thrombectomyRecommendation === 'considerar' ? 'Procedimento pode ser considerado com especialista' : thrombectomyRecommendation === 'sem_beneficio' ? 'Sem benefício demonstrado neste cenário' : 'Dados insuficientes para indicação pelo fluxograma'}</p><p className="mt-2 text-sm">A decisão final exige neurologia vascular, neurointervenção e interpretação da imagem completa.</p></div><div className="grid gap-3 sm:grid-cols-2"><button type="button" disabled={!['forte','considerar'].includes(thrombectomyRecommendation || '')} onClick={() => persist('avc_desfecho_trombectomia', { thrombectomyRecommendation })} className="rounded-xl bg-emerald-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Encaminhar para trombectomia</button><button type="button" onClick={() => persist('avc_cuidados_sem_reperfusao', { thrombectomyRecommendation })} className="rounded-xl border border-indigo-300 bg-indigo-50 px-5 py-4 font-extrabold text-indigo-900">Sem indicação pelo caminho atual</button></div></div>
          )}

          {stage === 'avc_desfecho_trombectomia' && (
            <div className="space-y-5"><div className="rounded-2xl border border-emerald-400 bg-emerald-50 p-6 text-emerald-950"><h2 className="text-2xl font-black">Reperfusão endovascular indicada</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm"><li>Acionar imediatamente centro com capacidade de trombectomia.</li><li>Não esperar melhora após trombólise antes de transferir.</li><li>Levar imagem, horários, NIHSS, Rankin, medicações e dados do trombolítico.</li><li>Manter monitorização e suporte durante a transferência.</li></ul></div><button type="button" onClick={() => proceedToIcu('Trombectomia mecânica indicada/encaminhada')} className="w-full rounded-xl bg-emerald-700 px-5 py-4 font-extrabold text-white">Registrar encaminhamento e solicitar UTI</button></div>
          )}

          {stage === 'avc_cuidados_sem_reperfusao' && (
            <div className="space-y-5"><div className="grid gap-3 md:grid-cols-2">{supportiveOptions.map(([id,label]) => <CardOption key={id} selected={(data.supportiveCare || []).includes(id)} title={label} onClick={() => selectMany('supportiveCare', id)} />)}</div>{data.receivedThrombolysis && <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-950">Como houve trombólise, antiagregantes e anticoagulantes somente após 24 horas e imagem de controle sem sangramento.</div>}<button type="button" disabled={(data.supportiveCare || []).length < 4} onClick={() => proceedToIcu(data.receivedThrombolysis ? 'Cuidados pós-trombólise sem trombectomia indicada' : 'Manejo clínico sem reperfusão imediata')} className="w-full rounded-xl bg-indigo-700 px-5 py-4 font-extrabold text-white disabled:bg-slate-300">Registrar plano e solicitar UTI</button></div>
          )}

          {stage === 'avc_hemorragico_destino' && (
            <div className="space-y-5"><div className="rounded-2xl border-2 border-red-500 bg-red-50 p-6 text-red-950"><h2 className="text-2xl font-black">Migrar imediatamente para manejo de hemorragia intracraniana</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm"><li>Suspender trombolítico, antiagregante e anticoagulante até avaliação específica.</li><li>Acionar neurologia/neurocirurgia e controlar pressão e sinais de hipertensão intracraniana.</li><li>Diferenciar hemorragia intraparenquimatosa de hemorragia subaracnoide e outras causas.</li><li>Providenciar reversão de anticoagulação quando indicada.</li></ul></div><ABCDEChecklist value={data.abcdeDomains || []} onChange={updateAbcde} title="ABCDE no destino neurocrítico" subtitle="Atualize os domínios durante a estabilização e transferência para a equipe especializada." tone="red" /><button type="button" onClick={() => proceedToIcu('Hemorragia intracraniana - encaminhado para protocolo neurocrítico')} className="w-full rounded-xl bg-red-700 px-5 py-4 font-extrabold text-white">Registrar destino crítico e solicitar UTI</button></div>
          )}

          {stage === 'avc_aguardo_uti' && (
            <div className="space-y-6">
              <UniversalCareTransition destination="icu" value={careTransition} onChange={persistCareTransition} onConfirmed={(transition) => finishWithTransition(data.outcome || 'AVC confirmado - encaminhado para cuidado intensivo/neurocrítico', transition)} />
              <div className="hidden" aria-hidden="true">
              <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-indigo-800 via-violet-800 to-slate-900 p-6 text-white shadow-xl sm:p-8">
                <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-cyan-300/10 blur-3xl" />
                <div className="relative flex items-start gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20"><Hospital className="h-8 w-8" /></span><div><p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Destino obrigatório</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">Aguardando UTI / unidade neurocrítica</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-indigo-100">O protocolo permanece ativo. Continue estabilização, vigilância neurológica e tratamento das complicações até a passagem formal do cuidado.</p></div></div>
              </section>
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950"><strong>Não é uma tela de espera passiva:</strong> qualquer piora neurológica, respiratória ou hemodinâmica exige reavaliação imediata e acionamento da equipe responsável.</div>
              <section><div className="mb-4"><h3 className="text-xl font-black text-slate-950">Checklist de segurança durante a espera</h3><p className="mt-1 text-sm text-slate-600">Registre as medidas já garantidas antes da transferência.</p></div><div className="grid gap-3 md:grid-cols-2">{utiSafetyOptions.map(([id,label]) => <CardOption key={id} selected={(data.utiChecklist || []).includes(id)} title={label} onClick={() => selectMany('utiChecklist', id)} />)}</div></section>
              <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2"><label className="text-sm font-black text-slate-800">Destino ou equipe receptora<input value={data.utiDestination || ''} onChange={event => update({ utiDestination: event.target.value })} placeholder="Ex.: UTI neurológica, leito regulado, hospital de referência" className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium" /></label><label className="text-sm font-black text-slate-800">Pendências e observações<textarea value={data.utiNotes || ''} onChange={event => update({ utiNotes: event.target.value })} placeholder="Registre pendências, intercorrências ou condições do transporte" rows={3} className="mt-2 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium" /></label></section>
              <button type="button" disabled={!['leito','monitor','neurologico','handoff'].every(item => (data.utiChecklist || []).includes(item))} onClick={() => finish(data.outcome || 'AVC confirmado - encaminhado para cuidado intensivo/neurocrítico')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-4 font-extrabold text-white shadow-lg shadow-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"><CheckCircle2 className="h-5 w-5" /> Confirmar destino e concluir protocolo</button>
              {!['leito','monitor','neurologico','handoff'].every(item => (data.utiChecklist || []).includes(item)) && <p className="text-center text-sm font-semibold text-slate-500">Para concluir, confirme solicitação do leito, monitorização, reavaliação neurológica e passagem de caso.</p>}
              </div>
            </div>
          )}

          {notice && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">{notice}</p>}
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-5"><button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-5 w-5" /> Voltar</button><span className="text-xs font-semibold text-slate-500">As escolhas ficam registradas no relatório clínico.</span></div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AVCFlowchartInteractive
