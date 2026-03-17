'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, 
  ChevronLeft, 
  AlertTriangle, 
  Heart, 
  Stethoscope, 
  Activity, 
  CheckCircle,
  Brain,
  Target,
  Zap,
  RotateCcw,
  Timer,
  UserCheck,
  Pill,
  Syringe,
  Microscope,
  ArrowLeft,
  Info,
  X
} from 'lucide-react'
import { clsx } from 'clsx'
import { EmergencyPatient, EmergencyFlowchart, EmergencyOption, EmergencyStep } from '@/types/emergency'

type GasometryFieldKey = 'ph' | 'pco2' | 'hco3' | 'be' | 'po2' | 'sodium' | 'chloride' | 'albumin'
type AsthmaInitialFieldKey = 'sato2' | 'fr' | 'fc' | 'pfe' | 'paco2'
type AsthmaReevalFieldKey = 'sato2Re' | 'frRe' | 'pfeRe'

const gasometryFieldConfig: Array<{ key: GasometryFieldKey; label: string; unit: string; min: number; max: number; required: boolean }> = [
  { key: 'ph', label: 'pH', unit: '', min: 6.8, max: 7.8, required: true },
  { key: 'pco2', label: 'PaCO2', unit: 'mmHg', min: 10, max: 120, required: true },
  { key: 'hco3', label: 'HCO3-', unit: 'mEq/L', min: 3, max: 60, required: true },
  { key: 'be', label: 'BE', unit: 'mEq/L', min: -40, max: 40, required: false },
  { key: 'po2', label: 'PaO2', unit: 'mmHg', min: 20, max: 600, required: false },
  { key: 'sodium', label: 'Na+', unit: 'mEq/L', min: 100, max: 180, required: false },
  { key: 'chloride', label: 'Cl-', unit: 'mEq/L', min: 60, max: 150, required: false },
  { key: 'albumin', label: 'Albumina', unit: 'g/dL', min: 0.5, max: 6.5, required: false }
]

const gasometryFieldInfo: Record<GasometryFieldKey, string[]> = {
  ph: [
    'Henderson-Hasselbalch: pH = 6,10 + log[HCO3/(0,03×PaCO2)].',
    'Cortes: <7,35 acidemia | 7,35–7,45 normal | >7,45 alcalemia.'
  ],
  pco2: [
    'PaCO2 define eixo respiratório inicial.',
    'Cortes: >45 sugere acidose respiratória | <35 sugere alcalose respiratória.'
  ],
  hco3: [
    'Winter na acidose metabólica: PaCO2 esperada = 1,5×HCO3 + 8 ±2.',
    'Alcalose metabólica: PaCO2 esperada = HCO3 + 15 ±2.',
    'Delta/Delta usa ΔHCO3 = 24 - HCO3.'
  ],
  be: [
    'BE auxilia leitura metabólica global.',
    'Referência aproximada: -2 a +2 mEq/L.'
  ],
  po2: [
    'PaO2 avalia oxigenação e gravidade respiratória.',
    'Hipoxemia relevante quando PaO2 < 60 mmHg.'
  ],
  sodium: [
    'Ânion Gap: AG = Na - (HCO3 + Cl).',
    'Necessário para diferenciar acidose metabólica hiperclorêmica vs AG elevado.'
  ],
  chloride: [
    'Ânion Gap: AG = Na - (HCO3 + Cl).',
    'Cloro elevado favorece padrão hiperclorêmico.'
  ],
  albumin: [
    'Correção de Figge: AGcorr = AG + [(4 - albumina)×2,5].',
    'Usar quando albumina estiver reduzida.'
  ]
}

const asthmaInitialFieldConfig: Array<{ key: AsthmaInitialFieldKey; label: string; unit: string; min: number; max: number; required: boolean }> = [
  { key: 'sato2', label: 'SatO2', unit: '%', min: 50, max: 100, required: true },
  { key: 'fr', label: 'FR', unit: 'irpm', min: 8, max: 60, required: true },
  { key: 'fc', label: 'FC', unit: 'bpm', min: 30, max: 220, required: true },
  { key: 'pfe', label: 'PFE', unit: '% previsto', min: 5, max: 150, required: true },
  { key: 'paco2', label: 'PaCO2', unit: 'mmHg', min: 10, max: 120, required: false }
]

const asthmaReevalFieldConfig: Array<{ key: AsthmaReevalFieldKey; label: string; unit: string; min: number; max: number; required: boolean }> = [
  { key: 'sato2Re', label: 'SatO2 reavaliação', unit: '%', min: 50, max: 100, required: true },
  { key: 'frRe', label: 'FR reavaliação', unit: 'irpm', min: 8, max: 60, required: true },
  { key: 'pfeRe', label: 'PFE reavaliação', unit: '% previsto', min: 5, max: 150, required: true }
]

const asthmaInitialInfo: Record<AsthmaInitialFieldKey, string[]> = {
  sato2: ['Se SatO2 < 94%, iniciar O2 suplementar.', 'Meta usual no PS: SatO2 93–95%.'],
  fr: ['FR > 30 sugere gravidade.', 'FR 25–30 costuma indicar exacerbação moderada.'],
  fc: ['FC > 120 é marcador de maior gravidade.', 'Interpretar junto de dispneia e esforço respiratório.'],
  pfe: ['PFE (% do previsto): >70 leve, 40–69 moderada, <40 grave.', 'Usar maior valor de 3 tentativas.'],
  paco2: ['PaCO2 normal/elevada em crise grave é sinal de fadiga.', 'Hipercapnia progressiva indica risco de falência respiratória.']
}

const asthmaReevalInfo: Record<AsthmaReevalFieldKey, string[]> = {
  sato2Re: ['Persistência de hipoxemia após 1h sugere falha terapêutica.', 'Manter alvo de SatO2 93–95%.'],
  frRe: ['FR mantendo elevada sugere resposta parcial ou ruim.', 'Queda da FR com conforto respiratório sugere melhora.'],
  pfeRe: ['PFE >70% favorece alta assistida.', 'PFE 40–69%: resposta parcial; <40%: escalonar.']
}

const tvpClassicSigns = [
  'Dor unilateral na perna (panturrilha ou coxa), tipo peso/pressão, que piora ao deambular ou ao ficar em pé',
  'Edema unilateral, de início insidioso ou súbito',
  'Sensação de calor, rubor ou mudança de coloração (eritema ou cianose leve) no membro afetado',
  'Rigidez ou sensação de tensão na panturrilha',
  'Sensibilidade à palpação em trajeto venoso profundo (especialmente panturrilha)',
  'Aumento de circunferência da panturrilha ou coxa comparado ao lado contralateral',
  'Dor à compressão da panturrilha ou ao espremer o gastrocnêmio',
  'Febre baixa inespecífica e taquicardia podem ocorrer'
]

const tvpPhysicalExamFindings = [
  'Edema assimétrico, frequentemente com cacifo',
  'Aumento da circunferência da panturrilha em relação ao lado oposto',
  'Calor local e rubor; pele brilhante e tensa',
  'Veias superficiais colaterais dilatadas (circulação de derivação)',
  'Dor à palpação profunda da panturrilha ou do trajeto venoso',
  'Sinais cutâneos: leve cianose distal em casos extensos',
  'Pulsos arteriais geralmente preservados',
  'Sinal de Homans (dor à dorsiflexão do pé) não é confiável e não deve ser usado isoladamente'
]

const tvpAlertSigns = [
  'Edema súbito e importante com dor intensa e cianose: suspeitar flegmasia cerulea dolens (urgência)',
  'Edema que envolve toda a perna, inclusive raiz da coxa/inguinal (possível TVP iliofemoral)',
  'Progressão rápida do edema e dor em horas/dias',
  'Veias superficiais muito proeminentes e tensas',
  'Dor de início recente associada a imobilização, cirurgia recente (≤4 semanas), trauma, câncer ativo, gravidez/puerpério, uso de estrogênios, história prévia de TVP/TEV ou trombofilia',
  'Sintomas respiratórios concomitantes (dispneia súbita, dor torácica pleurítica, hemoptise, síncope): suspeitar embolia pulmonar'
]

const tvpWellsCriteria = [
  { id: 'cancer_ativo', text: 'Câncer ativo (tratamento nos últimos 6 meses ou paliativo)', score: 1 },
  { id: 'paresia_imobilizacao', text: 'Paralisia/paresia ou imobilização com gesso em membro inferior', score: 1 },
  { id: 'restrito_leito_cirurgia', text: 'Restrito ao leito ≥3 dias ou cirurgia maior nos últimos 12 semanas com anestesia', score: 1 },
  { id: 'dor_trajeto_venoso', text: 'Dor à palpação ao longo do sistema venoso profundo', score: 1 },
  { id: 'perna_inteira_edemaciada', text: 'Perna inteira edemaciada', score: 1 },
  { id: 'panturrilha_3cm', text: 'Aumento de panturrilha ≥3 cm vs lado assintomático (10 cm abaixo da tuberosidade tibial)', score: 1 },
  { id: 'edema_cacifo', text: 'Edema com cacifo limitado à perna sintomática', score: 1 },
  { id: 'veias_colaterais', text: 'Veias colaterais superficiais (não varicosas)', score: 1 },
  { id: 'tvp_previa', text: 'TVP prévia documentada', score: 1 },
  { id: 'diagnostico_alternativo', text: 'Diagnóstico alternativo pelo menos tão provável quanto TVP', score: -2 }
]

const tvpAnticoagContraindications = [
  { id: 'abs_sangramento_ativo', text: 'Sangramento ativo maior', severity: 'absoluta' },
  { id: 'abs_avc_hemorragico', text: 'AVC hemorrágico recente', severity: 'absoluta' },
  { id: 'abs_neurocirurgia_trauma', text: 'Neurocirurgia ou trauma maior recente', severity: 'absoluta' },
  { id: 'abs_trombocitopenia_grave', text: 'Trombocitopenia grave', severity: 'absoluta' },
  { id: 'abs_hipertensao_grave', text: 'Hipertensão grave não controlada', severity: 'absoluta' },
  { id: 'rel_ulcera_ativa', text: 'Úlcera ativa', severity: 'relativa' },
  { id: 'rel_disfuncao_renal_hepatica', text: 'Insuficiência renal ou hepática grave', severity: 'relativa' },
  { id: 'rel_quedas', text: 'Alto risco de queda', severity: 'relativa' },
  { id: 'rel_antiagregantes', text: 'Uso concomitante de antiagregantes', severity: 'relativa' }
]

const tvpTherapeuticOptions = [
  { id: 'rivaroxabana', group: 'DOAC', text: 'Rivaroxabana: 15 mg 2x/dia por 21 dias; depois 20 mg 1x/dia; estendida 10 mg 1x/dia' },
  { id: 'apixabana', group: 'DOAC', text: 'Apixabana: 10 mg 2x/dia por 7 dias; depois 5 mg 2x/dia; estendida 2,5 mg 2x/dia' },
  { id: 'dabigatrana', group: 'DOAC', text: 'Dabigatrana: 150 mg 2x/dia após 5–10 dias de anticoagulação parenteral' },
  { id: 'edoxabana', group: 'DOAC', text: 'Edoxabana: 60 mg 1x/dia após 5–10 dias de parenteral; 30 mg se CrCl 15–50 mL/min ou ≤60 kg' },
  { id: 'enoxaparina', group: 'Parenteral', text: 'Enoxaparina: 1 mg/kg 2x/dia ou 1,5 mg/kg 1x/dia; se CrCl <30: 1 mg/kg 1x/dia' },
  { id: 'hnf', group: 'Parenteral', text: 'HNF EV: bolus 80 U/kg (ou 5.000 U), depois 18 U/kg/h (ou 1.300 U/h), ajustar TTPa 1,5–2,5x basal' },
  { id: 'varfarina', group: 'VKA', text: 'Varfarina: alvo INR 2–3; sobrepor com heparina por ≥5 dias e INR terapêutico por 24h' }
]

const tvpTreatmentDurations = [
  { id: 'duracao_provocada', text: 'Provocada por fator transitório: 3 meses' },
  { id: 'duracao_nao_provocada', text: 'Não provocada/trombofilia persistente: considerar estendido/indefinido se baixo-moderado risco de sangramento' },
  { id: 'duracao_cancer', text: 'Câncer ativo: DOAC (apixabana/rivaroxabana/edoxabana) ou LMWH enquanto câncer/tratamento ativos' },
  { id: 'duracao_gravidez', text: 'Gravidez: LMWH até 6 semanas pós-parto (mínimo 3 meses); evitar varfarina e DOACs na gestação' }
]

interface EmergencyFlowchartProps {
  patient: EmergencyPatient
  flowchart: EmergencyFlowchart
  onComplete: () => void
  onUpdate: (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, riskGroup?: string) => void
  onBack?: () => void
}

const EmergencyFlowchart: React.FC<EmergencyFlowchartProps> = ({ 
  patient, 
  flowchart, 
  onComplete, 
  onUpdate,
  onBack
}) => {
  const resolveCurrentStep = useCallback((step?: string) => {
    if (step && flowchart.steps[step]) return step
    if (flowchart.steps[flowchart.initialStep]) return flowchart.initialStep
    return Object.keys(flowchart.steps)[0]
  }, [flowchart.initialStep, flowchart.steps])
  const [currentStep, setCurrentStep] = useState(resolveCurrentStep(patient.emergencyState.currentStep))
  const [history, setHistory] = useState<string[]>(patient.emergencyState.history || [])
  const [answers, setAnswers] = useState<Record<string, string>>(patient.emergencyState.answers || {})
  const [progress, setProgress] = useState(patient.emergencyState.progress || 0)
  const [selectedClinicalFindings, setSelectedClinicalFindings] = useState<string[]>([])
  const [otherClinicalFinding, setOtherClinicalFinding] = useState('')
  const [selectedWellsCriteria, setSelectedWellsCriteria] = useState<string[]>([])
  const [selectedContraindications, setSelectedContraindications] = useState<string[]>([])
  const [selectedTherapies, setSelectedTherapies] = useState<string[]>([])
  const [selectedDurationPlan, setSelectedDurationPlan] = useState<string>('')
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({})
  const [wellsInfoOpen, setWellsInfoOpen] = useState(false)
  const [gasometryDraft, setGasometryDraft] = useState<Record<GasometryFieldKey, string>>({
    ph: '',
    pco2: '',
    hco3: '',
    be: '',
    po2: '',
    sodium: '',
    chloride: '',
    albumin: ''
  })
  const [gasometryInfoOpen, setGasometryInfoOpen] = useState<GasometryFieldKey | null>(null)
  const [asthmaInitialDraft, setAsthmaInitialDraft] = useState<Record<AsthmaInitialFieldKey, string>>({
    sato2: '',
    fr: '',
    fc: '',
    pfe: '',
    paco2: ''
  })
  const [asthmaReevalDraft, setAsthmaReevalDraft] = useState<Record<AsthmaReevalFieldKey, string>>({
    sato2Re: '',
    frRe: '',
    pfeRe: ''
  })
  const [asthmaFlags, setAsthmaFlags] = useState({
    usoMusculatura: false,
    incapazFrases: false,
    falaPalavras: false,
    cianose: false,
    confusao: false,
    exaustao: false,
    toraxSilente: false,
    sonolencia: false
  })
  const [asthmaReevalFlags, setAsthmaReevalFlags] = useState({
    melhoraClinica: false,
    necessidadeBroncoRepetido: false
  })

  // Carregar estado do paciente na inicialização
  useEffect(() => {
    // Só atualiza se o ID do paciente mudar ou se for inicialização, evitando reset durante a navegação
    if (patient.id) {
      const safeStep = resolveCurrentStep(patient.emergencyState.currentStep)
      setCurrentStep(safeStep)
      setHistory(patient.emergencyState.history || [])
      setAnswers(patient.emergencyState.answers || {})
      setProgress(patient.emergencyState.progress || 0)
    }
  }, [
    patient.id,
    patient.emergencyState.currentStep,
    patient.emergencyState.history,
    patient.emergencyState.answers,
    patient.emergencyState.progress,
    flowchart.id,
    resolveCurrentStep
  ])

  // Função para calcular progresso baseado no fluxograma específico
  const calculateProgress = (currentStep: string, history: string[]): number => {
    const pathSteps = [...history, currentStep]
    const totalSteps = Object.keys(flowchart.steps).length
    
    if (flowchart.finalSteps.includes(currentStep)) {
      return 100
    }
    
    const completedSteps = pathSteps.length
    return Math.min((completedSteps / totalSteps) * 100, 95)
  }

  // Função para obter ícone baseado no tipo de step
  const getStepIcon = (step: EmergencyStep) => {
    switch (step.type) {
      case 'question':
        return <Brain className="w-6 h-6" />
      case 'action':
        return <Activity className="w-6 h-6" />
      case 'result':
        return <CheckCircle className="w-6 h-6" />
      case 'group':
        return <Target className="w-6 h-6" />
      case 'lab_wait':
        return <Microscope className="w-6 h-6" />
      case 'medication':
        return <Pill className="w-6 h-6" />
      case 'procedure':
        return <Syringe className="w-6 h-6" />
      default:
        return <Stethoscope className="w-6 h-6" />
    }
  }

  // Função para obter cor baseada na criticidade
  const getStepColor = (step: EmergencyStep) => {
    if (step.critical) return 'from-red-600 to-red-800'
    if (step.timeSensitive) return 'from-orange-500 to-red-600'
    if (step.requiresSpecialist) return 'from-purple-500 to-purple-700'
    return step.color || 'from-blue-500 to-cyan-600'
  }

  const handleAnswer = (nextStep: string, value?: string) => {
    const newHistory = [...history, currentStep]
    const isTVPClinicalEvaluation = flowchart.id === 'tvp' && currentStep === 'avaliacao_clinica'
    const isTVPWellsScore = flowchart.id === 'tvp' && currentStep === 'wells_score'
    const isTVPTreatmentInitial = flowchart.id === 'tvp' && currentStep === 'tratamento_inicial'
    const clinicalEvaluationAnswer = JSON.stringify({
      decision: value || nextStep,
      sinaisEAchados: selectedClinicalFindings,
      outrosAchados: otherClinicalFinding.trim()
    })
    const wellsScoreAnswer = JSON.stringify({
      decision: value || nextStep,
      score: wellsScoreTotal,
      classificacao: wellsRisk,
      criteriosSelecionados: selectedWellsCriteria
    })
    const treatmentAnswer = JSON.stringify({
      decision: value || nextStep,
      opcoesTerapeuticasSelecionadas: selectedTherapies,
      planoDuracaoSelecionado: selectedDurationPlan,
      contraindicacoesSelecionadas: selectedContraindications,
      possuiContraindicacaoAbsoluta: hasAbsoluteContraindication,
      solicitarAvaliacaoCirurgiaoVascular: true
    })
    const newAnswers = {
      ...answers,
      [currentStep]: isTVPClinicalEvaluation
        ? clinicalEvaluationAnswer
        : isTVPWellsScore
          ? wellsScoreAnswer
          : isTVPTreatmentInitial
            ? treatmentAnswer
            : value || nextStep
    }
    const newProgress = calculateProgress(nextStep, newHistory)

    setCurrentStep(nextStep)
    setHistory(newHistory)
    setAnswers(newAnswers)
    setProgress(newProgress)

    // Determinar grupo de risco se aplicável
    const currentStepData = flowchart.steps[currentStep]
    const riskGroup = currentStepData.group

    onUpdate(patient.id, nextStep, newHistory, newAnswers, newProgress, riskGroup)

    if (flowchart.finalSteps.includes(nextStep)) {
      // No automatic completion
    }
  }

  const goBack = () => {
    if (history.length > 0) {
      const previousStep = history[history.length - 1]
      const newHistory = history.slice(0, -1)
      const newProgress = calculateProgress(previousStep, newHistory)

      setCurrentStep(previousStep)
      setHistory(newHistory)
      setProgress(newProgress)

      onUpdate(patient.id, previousStep, newHistory, answers, newProgress)
    }
  }

  const restart = () => {
    setCurrentStep(flowchart.initialStep)
    setHistory([])
    setAnswers({})
    setProgress(0)
    setGasometryInfoOpen(null)
    setGasometryDraft({
      ph: '',
      pco2: '',
      hco3: '',
      be: '',
      po2: '',
      sodium: '',
      chloride: '',
      albumin: ''
    })
    setAsthmaInitialDraft({
      sato2: '',
      fr: '',
      fc: '',
      pfe: '',
      paco2: ''
    })
    setAsthmaReevalDraft({
      sato2Re: '',
      frRe: '',
      pfeRe: ''
    })
    setAsthmaFlags({
      usoMusculatura: false,
      incapazFrases: false,
      falaPalavras: false,
      cianose: false,
      confusao: false,
      exaustao: false,
      toraxSilente: false,
      sonolencia: false
    })
    setAsthmaReevalFlags({
      melhoraClinica: false,
      necessidadeBroncoRepetido: false
    })
    onUpdate(patient.id, flowchart.initialStep, [], {}, 0)
  }

  const currentStepData = flowchart.steps[currentStep]
  const isTVPClinicalEvaluation = flowchart.id === 'tvp' && currentStepData?.id === 'avaliacao_clinica'
  const isTVPWellsScore = flowchart.id === 'tvp' && currentStepData?.id === 'wells_score'
  const isTVPTreatmentInitial = flowchart.id === 'tvp' && currentStepData?.id === 'tratamento_inicial'
  const wellsScoreTotal = selectedWellsCriteria.reduce((acc, criterionId) => {
    const criterion = tvpWellsCriteria.find(item => item.id === criterionId)
    return acc + (criterion?.score || 0)
  }, 0)
  const wellsRisk = wellsScoreTotal <= 0 ? 'baixa' : wellsScoreTotal <= 2 ? 'moderada' : 'alta'
  const wellsNextStep = wellsScoreTotal <= 0 ? 'baixa_probabilidade' : 'moderada_probabilidade'
  const wellsDecisionValue = wellsScoreTotal <= 0 ? 'low' : wellsScoreTotal <= 2 ? 'moderate' : 'high'
  const hasAbsoluteContraindication = selectedContraindications.some(item => item.startsWith('abs_'))
  const hasSelectedTherapy = selectedTherapies.length > 0
  const isSectionOpen = (key: string, defaultValue = true) => sectionOpen[key] ?? defaultValue
  const toggleSection = (key: string) => setSectionOpen(prev => ({ ...prev, [key]: !(prev[key] ?? true) }))
  const isGasometryFlow = flowchart.id === 'gasometria'
  const isAsthmaFlow = flowchart.id === 'asthma'

  const toNumber = useCallback((value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value !== 'string') return null
    const normalized = value.replace(',', '.').trim()
    if (!normalized) return null
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }, [])

  const normalizeGasometryInput = (key: GasometryFieldKey, raw: string, finalize = false) => {
    let normalized = raw.replace(',', '.').replace(/[^\d.-]/g, '')
    const dotIndex = normalized.indexOf('.')
    if (dotIndex >= 0) {
      normalized = normalized.slice(0, dotIndex + 1) + normalized.slice(dotIndex + 1).replace(/\./g, '')
    }
    if (key === 'ph') {
      const digitsOnly = normalized.replace(/\D/g, '')
      if (digitsOnly.length === 2) normalized = `${digitsOnly[0]}.${digitsOnly[1]}`
      if (digitsOnly.length >= 3) normalized = `${digitsOnly[0]}.${digitsOnly.slice(1, 3)}`
      if (finalize && /^\d$/.test(digitsOnly)) normalized = `${digitsOnly}.0`
    }
    return normalized
  }

  const formatGasometryNumber = (value: number | null, digits = 2) => value === null ? '--' : value.toFixed(digits)

  const validateNumericDraft = useCallback(<K extends string>(
    draft: Record<K, string>,
    config: Array<{ key: K; min: number; max: number; required: boolean; unit: string }>
  ) => {
    const parsed = {} as Record<K, number | null>
    const errors = {} as Record<K, string | null>
    config.forEach((field) => {
      const value = toNumber(draft[field.key])
      parsed[field.key] = value
      if (value === null) {
        errors[field.key] = field.required ? 'Obrigatório para o fluxo' : null
        return
      }
      if (value < field.min || value > field.max) {
        errors[field.key] = `Faixa fisiológica: ${field.min} a ${field.max} ${field.unit}`.trim()
        return
      }
      errors[field.key] = null
    })
    const hasHardError = config.some((field) => {
      if (field.required && parsed[field.key] === null) return true
      return !!errors[field.key]
    })
    return { parsed, errors, hasHardError }
  }, [toNumber])

  const savedGasometryLabs = useMemo(() => {
    const raw = answers['coleta_parametros']
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as Record<string, number>
      return parsed
    } catch {
      return null
    }
  }, [answers])

  const gasometryValidation = useMemo(
    () => validateNumericDraft(gasometryDraft, gasometryFieldConfig),
    [gasometryDraft, validateNumericDraft]
  )

  const savedAsthmaInitial = useMemo(() => {
    const raw = answers['asma_avaliacao_inicial']
    if (!raw) return null
    try {
      return JSON.parse(raw) as {
        values: Record<string, number>
        flags: typeof asthmaFlags
      }
    } catch {
      return null
    }
  }, [answers])

  const savedAsthmaReeval = useMemo(() => {
    const raw = answers['asma_reavaliacao_1h']
    if (!raw) return null
    try {
      return JSON.parse(raw) as {
        values: Record<string, number>
        flags: typeof asthmaReevalFlags
      }
    } catch {
      return null
    }
  }, [answers])

  const asthmaInitialValidation = useMemo(
    () => validateNumericDraft(asthmaInitialDraft, asthmaInitialFieldConfig),
    [asthmaInitialDraft, validateNumericDraft]
  )

  const asthmaReevalValidation = useMemo(
    () => validateNumericDraft(asthmaReevalDraft, asthmaReevalFieldConfig),
    [asthmaReevalDraft, validateNumericDraft]
  )

  const requiredGasometryReady = !gasometryValidation.hasHardError
  const requiredAsthmaInitialReady = !asthmaInitialValidation.hasHardError
  const requiredAsthmaReevalReady = !asthmaReevalValidation.hasHardError

  const getGasometryFieldFeedback = (key: GasometryFieldKey, value: number | null) => {
    if (value === null) return { tone: 'slate', text: 'Aguardando preenchimento' }
    if (key === 'ph') return value < 7.35 ? { tone: 'red', text: 'Acidemia' } : value > 7.45 ? { tone: 'amber', text: 'Alcalemia' } : { tone: 'emerald', text: 'pH normal' }
    if (key === 'pco2') return value > 45 ? { tone: 'red', text: 'Retenção de CO2 (>45)' } : value < 35 ? { tone: 'amber', text: 'Hipocapnia (<35)' } : { tone: 'emerald', text: 'Faixa normal (35–45)' }
    if (key === 'hco3') return value < 22 ? { tone: 'red', text: 'Baixo (<22)' } : value > 27 ? { tone: 'amber', text: 'Elevado (>27)' } : { tone: 'emerald', text: 'Faixa normal (22–27)' }
    if (key === 'be') return value < -2 ? { tone: 'red', text: 'Déficit de base' } : value > 2 ? { tone: 'amber', text: 'Excesso de base' } : { tone: 'emerald', text: 'Próximo do normal' }
    if (key === 'po2') return value < 40 ? { tone: 'red', text: 'Hipoxemia grave (<40)' } : value < 60 ? { tone: 'red', text: 'Hipoxemia moderada (40–59)' } : value < 80 ? { tone: 'amber', text: 'Hipoxemia leve (60–79)' } : { tone: 'emerald', text: 'Oxigenação adequada (≥80)' }
    if (key === 'sodium') return value < 135 ? { tone: 'amber', text: 'Hiponatremia' } : value > 145 ? { tone: 'amber', text: 'Hipernatremia' } : { tone: 'emerald', text: 'Faixa usual' }
    if (key === 'chloride') return value < 98 ? { tone: 'amber', text: 'Hipocloremia' } : value > 107 ? { tone: 'amber', text: 'Hipercloremia' } : { tone: 'emerald', text: 'Faixa usual' }
    if (key === 'albumin') return value < 3.5 ? { tone: 'amber', text: 'Baixa (corrigir AG)' } : { tone: 'emerald', text: 'Faixa usual' }
    return { tone: 'slate', text: 'Sem classificação' }
  }

  const gasometryStepOptions = useMemo(() => {
    if (!isGasometryFlow || !currentStepData) return null
    const pick = (nextStep: string) => currentStepData.options?.find(option => option.nextStep === nextStep)
    const labs = savedGasometryLabs || gasometryValidation.parsed
    const ph = labs.ph ?? null
    const pco2 = labs.pco2 ?? null
    const hco3 = labs.hco3 ?? null
    const na = labs.sodium ?? null
    const cl = labs.chloride ?? null
    const albumin = labs.albumin ?? null
    if (currentStepData.id === 'avaliar_ph' && ph !== null) {
      return [pick(ph < 7.35 ? 'acidemia_eixo' : ph <= 7.45 ? 'ph_normal_checar' : 'alcalemia_eixo')].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'acidemia_eixo' && pco2 !== null && hco3 !== null) {
      const list = []
      if (pco2 > 45) list.push(pick('acidose_respiratoria_classificar'))
      if (hco3 < 22) list.push(pick('acidose_metabolica_winter'))
      return list.filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'ph_normal_checar' && pco2 !== null && hco3 !== null) {
      const normalAcidBase = pco2 >= 35 && pco2 <= 45 && hco3 >= 22 && hco3 <= 26
      const po2 = labs.po2 ?? null
      
      if (normalAcidBase) {
        if (po2 !== null) {
           if (po2 < 40) return [pick('equilibrio_acido_base_com_hipoxemia_grave')].filter(Boolean) as EmergencyOption[]
           if (po2 < 60) return [pick('equilibrio_acido_base_com_hipoxemia_moderada')].filter(Boolean) as EmergencyOption[]
           if (po2 < 80) return [pick('equilibrio_acido_base_com_hipoxemia_leve')].filter(Boolean) as EmergencyOption[]
        }
        return [pick('gasometria_normal')].filter(Boolean) as EmergencyOption[]
      }
      
      return [pick('disturbio_misto_ph_normal')].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'acidose_respiratoria_classificar' && pco2 !== null && hco3 !== null) {
      const delta = (pco2 - 40) / 10
      const acute = 24 + delta
      const chronic = 24 + 4 * delta
      const isAcute = Math.abs(hco3 - acute) <= Math.abs(hco3 - chronic)
      return [pick(isAcute ? 'acidose_respiratoria_aguda' : 'acidose_respiratoria_cronica')].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'acidose_metabolica_winter' && pco2 !== null && hco3 !== null) {
      const expected = 1.5 * hco3 + 8
      const low = expected - 2
      const high = expected + 2
      const next = pco2 < low ? 'acidose_metabolica_alcalose_resp' : pco2 > high ? 'acidose_metabolica_acidose_resp' : 'acidose_metabolica_ag'
      return [pick(next)].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'acidose_metabolica_ag' && na !== null && cl !== null && hco3 !== null) {
      const ag = na - (hco3 + cl)
      const agCorr = albumin !== null ? ag + (4 - albumin) * 2.5 : ag
      return [pick(agCorr <= 12 ? 'acidose_metabolica_hipercloremica' : 'acidose_metabolica_delta_delta')].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'acidose_metabolica_delta_delta' && na !== null && cl !== null && hco3 !== null) {
      const ag = na - (hco3 + cl)
      const agCorr = albumin !== null ? ag + (4 - albumin) * 2.5 : ag
      const deltaHco3 = 24 - hco3
      if (deltaHco3 <= 0) return [pick('acidose_metabolica_ag_alto')].filter(Boolean) as EmergencyOption[]
      const ratio = (agCorr - 10) / deltaHco3
      const next = ratio > 2 ? 'acidose_metabolica_ag_alto_alcalose' : ratio < 1 ? 'acidose_metabolica_ag_alto_acidose_normo_ag' : 'acidose_metabolica_ag_alto'
      return [pick(next)].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'alcalemia_eixo' && pco2 !== null && hco3 !== null) {
      const list = []
      if (hco3 > 27) list.push(pick('alcalose_metabolica_compensacao'))
      if (pco2 < 35) list.push(pick('alcalose_respiratoria_compensacao'))
      return list.filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'alcalose_metabolica_compensacao' && pco2 !== null && hco3 !== null) {
      const expected = hco3 + 15
      const within = pco2 >= expected - 2 && pco2 <= expected + 2
      return [pick(within ? 'alcalose_metabolica_compensada' : 'alcalose_metabolica_mista')].filter(Boolean) as EmergencyOption[]
    }
    if (currentStepData.id === 'alcalose_respiratoria_compensacao' && pco2 !== null && hco3 !== null) {
      const delta = (40 - pco2) / 10
      const acute = 24 - 2 * delta
      const chronic = 24 - 5 * delta
      const acuteOk = hco3 >= acute - 2 && hco3 <= acute + 2
      const chronicOk = hco3 >= chronic - 2 && hco3 <= chronic + 2
      const next = chronicOk ? 'alcalose_respiratoria_cronica' : acuteOk ? 'alcalose_respiratoria_aguda' : 'alcalose_respiratoria_mista'
      return [pick(next)].filter(Boolean) as EmergencyOption[]
    }
    return null
  }, [isGasometryFlow, currentStepData, savedGasometryLabs, gasometryValidation.parsed])

  const asthmaStepOptions = useMemo(() => {
    if (!isAsthmaFlow || !currentStepData) return null
    const pick = (nextStep: string) => currentStepData.options?.find(option => option.nextStep === nextStep)
    const initial = savedAsthmaInitial?.values || asthmaInitialValidation.parsed
    const reeval = savedAsthmaReeval?.values || asthmaReevalValidation.parsed
    const sat = initial.sato2 ?? null
    const fr = initial.fr ?? null
    const fc = initial.fc ?? null
    const pfe = initial.pfe ?? null
    const paco2 = initial.paco2 ?? null
    const satRe = reeval.sato2Re ?? null
    const frRe = reeval.frRe ?? null
    const pfeRe = reeval.pfeRe ?? null
    const flags = savedAsthmaInitial?.flags || asthmaFlags
    const reFlags = savedAsthmaReeval?.flags || asthmaReevalFlags

    if (currentStepData.id === 'asma_classificacao_gravidade' && sat !== null && fr !== null && fc !== null && pfe !== null) {
      const ameacaVida = flags.toraxSilente || flags.cianose || flags.confusao || flags.exaustao || flags.sonolencia || (paco2 !== null && paco2 >= 45)
      if (ameacaVida) return [pick('asma_falencia_respiratoria')].filter(Boolean) as EmergencyOption[]
      const grave = fr > 30 || fc > 120 || sat < 90 || pfe < 40 || flags.falaPalavras
      if (grave) return [pick('asma_bloco_terapeutico')].filter(Boolean) as EmergencyOption[]
      const moderada = (fr >= 25 && fr <= 30) || (sat >= 90 && sat < 95) || (pfe >= 40 && pfe <= 69) || flags.incapazFrases || flags.usoMusculatura
      return [pick(moderada ? 'asma_oxigenio' : 'asma_oxigenio')].filter(Boolean) as EmergencyOption[]
    }

    if (currentStepData.id === 'asma_oxigenio' && sat !== null) {
      return [pick(sat < 94 ? 'asma_bloco_terapeutico' : 'asma_bloco_terapeutico')].filter(Boolean) as EmergencyOption[]
    }

    if (currentStepData.id === 'asma_decisao_1h' && satRe !== null && frRe !== null && pfeRe !== null) {
      const melhora = pfeRe > 70 && satRe >= 94 && frRe < 25 && reFlags.melhoraClinica
      if (melhora) return [pick('asma_alta_assistida')].filter(Boolean) as EmergencyOption[]
      const parcial = (pfeRe >= 40 && pfeRe <= 69) || (satRe >= 90 && satRe < 94) || reFlags.necessidadeBroncoRepetido
      if (parcial) return [pick('asma_observacao_ps')].filter(Boolean) as EmergencyOption[]
      return [pick('asma_escalonamento')].filter(Boolean) as EmergencyOption[]
    }

    if (currentStepData.id === 'asma_escalonamento') {
      if (flags.exaustao || flags.confusao || flags.toraxSilente || (paco2 !== null && paco2 >= 45)) {
        return [pick('asma_falencia_respiratoria')].filter(Boolean) as EmergencyOption[]
      }
      return [pick('asma_internacao')].filter(Boolean) as EmergencyOption[]
    }

    if (currentStepData.id === 'asma_falencia_respiratoria') {
      return [pick('asma_intubacao'), pick('asma_uti')].filter(Boolean) as EmergencyOption[]
    }

    return null
  }, [
    isAsthmaFlow,
    currentStepData,
    savedAsthmaInitial,
    savedAsthmaReeval,
    asthmaInitialValidation.parsed,
    asthmaReevalValidation.parsed,
    asthmaFlags,
    asthmaReevalFlags
  ])

  const gasometryStepNarrative = useMemo(() => {
    if (!isGasometryFlow || !currentStepData) return null
    const labs = savedGasometryLabs || gasometryValidation.parsed
    const ph = labs.ph ?? null
    const pco2 = labs.pco2 ?? null
    const hco3 = labs.hco3 ?? null
    const na = labs.sodium ?? null
    const cl = labs.chloride ?? null
    const albumin = labs.albumin ?? null
    if (currentStepData.id === 'avaliar_ph' && ph !== null) {
      return ph < 7.35
        ? `Acidemia identificada porque pH=${formatGasometryNumber(ph)} (<7,35).`
        : ph <= 7.45
          ? `pH normal identificado porque pH=${formatGasometryNumber(ph)} (7,35–7,45).`
          : `Alcalemia identificada porque pH=${formatGasometryNumber(ph)} (>7,45).`
    }
    if (currentStepData.id === 'acidemia_eixo' && pco2 !== null && hco3 !== null) {
      const reasons = []
      if (pco2 > 45) reasons.push(`PaCO2=${formatGasometryNumber(pco2, 1)} >45 sugere acidose respiratória`)
      if (hco3 < 22) reasons.push(`HCO3=${formatGasometryNumber(hco3, 1)} <22 sugere acidose metabólica`)
      return reasons.length ? reasons.join(' | ') : 'Valores não atendem critérios clássicos de eixo único.'
    }
    if (currentStepData.id === 'ph_normal_checar' && pco2 !== null && hco3 !== null) {
      const normal = pco2 >= 35 && pco2 <= 45 && hco3 >= 22 && hco3 <= 26
      return normal
        ? `pH normal com PaCO2=${formatGasometryNumber(pco2, 1)} e HCO3=${formatGasometryNumber(hco3, 1)} em faixa normal. Verificando oxigenação...`
        : `pH normal, porém PaCO2=${formatGasometryNumber(pco2, 1)} e/ou HCO3=${formatGasometryNumber(hco3, 1)} alterados, sugerindo distúrbio misto.`
    }
    if (currentStepData.id === 'gasometria_normal') {
      const labs = savedGasometryLabs || gasometryValidation.parsed
      const po2 = labs.po2 ?? null
      return po2 !== null 
        ? `Gasometria normal: Equilíbrio ácido-base preservado e PaO2=${formatGasometryNumber(po2, 1)} (Adequada).`
        : `Gasometria normal: Equilíbrio ácido-base preservado (PaO2 não informada).`
    }
    if (currentStepData.id === 'equilibrio_acido_base_com_hipoxemia_leve') {
       const labs = savedGasometryLabs || gasometryValidation.parsed
       const po2 = labs.po2 ?? 0
       return `Hipoxemia Leve: PaO2=${formatGasometryNumber(po2, 1)} (60-79 mmHg).`
    }
    if (currentStepData.id === 'equilibrio_acido_base_com_hipoxemia_moderada') {
       const labs = savedGasometryLabs || gasometryValidation.parsed
       const po2 = labs.po2 ?? 0
       return `Hipoxemia Moderada: PaO2=${formatGasometryNumber(po2, 1)} (40-59 mmHg).`
    }
    if (currentStepData.id === 'equilibrio_acido_base_com_hipoxemia_grave') {
       const labs = savedGasometryLabs || gasometryValidation.parsed
       const po2 = labs.po2 ?? 0
       return `Hipoxemia Grave: PaO2=${formatGasometryNumber(po2, 1)} (<40 mmHg).`
    }
    if (currentStepData.id === 'acidose_metabolica_winter' && pco2 !== null && hco3 !== null) {
      const expected = 1.5 * hco3 + 8
      const low = expected - 2
      const high = expected + 2
      return `Winter: PaCO2 esperada ${formatGasometryNumber(low, 1)}–${formatGasometryNumber(high, 1)}. PaCO2 medida=${formatGasometryNumber(pco2, 1)}.`
    }
    if (currentStepData.id === 'acidose_metabolica_ag' && na !== null && cl !== null && hco3 !== null) {
      const ag = na - (hco3 + cl)
      const agCorr = albumin !== null ? ag + (4 - albumin) * 2.5 : ag
      return albumin !== null
        ? `AG=${formatGasometryNumber(ag, 1)} e AG corrigido=${formatGasometryNumber(agCorr, 1)} (albumina ${formatGasometryNumber(albumin, 1)}).`
        : `AG=${formatGasometryNumber(ag, 1)} sem correção de albumina.`
    }
    if (currentStepData.id === 'acidose_metabolica_delta_delta' && na !== null && cl !== null && hco3 !== null) {
      const ag = na - (hco3 + cl)
      const agCorr = albumin !== null ? ag + (4 - albumin) * 2.5 : ag
      const deltaHco3 = 24 - hco3
      const ratio = deltaHco3 > 0 ? (agCorr - 10) / deltaHco3 : null
      return ratio === null
        ? 'Δ/Δ não aplicável pois ΔHCO3 <= 0.'
        : `ΔAG=${formatGasometryNumber(agCorr - 10, 1)} | ΔHCO3=${formatGasometryNumber(deltaHco3, 1)} | Δ/Δ=${formatGasometryNumber(ratio, 2)}.`
    }
    if (currentStepData.id === 'alcalemia_eixo' && pco2 !== null && hco3 !== null) {
      const reasons = []
      if (hco3 > 27) reasons.push(`HCO3=${formatGasometryNumber(hco3, 1)} >27 sugere alcalose metabólica`)
      if (pco2 < 35) reasons.push(`PaCO2=${formatGasometryNumber(pco2, 1)} <35 sugere alcalose respiratória`)
      return reasons.length ? reasons.join(' | ') : 'Sem critério clássico de eixo único na alcalemia.'
    }
    if (currentStepData.id === 'alcalose_metabolica_compensacao' && pco2 !== null && hco3 !== null) {
      const expected = hco3 + 15
      return `PaCO2 esperada na alcalose metabólica: ${formatGasometryNumber(expected - 2, 1)}–${formatGasometryNumber(expected + 2, 1)}. Medida=${formatGasometryNumber(pco2, 1)}.`
    }
    if (currentStepData.id === 'alcalose_respiratoria_compensacao' && pco2 !== null && hco3 !== null) {
      const delta = (40 - pco2) / 10
      const acute = 24 - 2 * delta
      const chronic = 24 - 5 * delta
      return `HCO3 esperado agudo ${formatGasometryNumber(acute - 2, 1)}–${formatGasometryNumber(acute + 2, 1)} | crônico ${formatGasometryNumber(chronic - 2, 1)}–${formatGasometryNumber(chronic + 2, 1)}. Medido=${formatGasometryNumber(hco3, 1)}.`
    }
    return null
  }, [isGasometryFlow, currentStepData, savedGasometryLabs, gasometryValidation.parsed])

  const asthmaStepNarrative = useMemo(() => {
    if (!isAsthmaFlow || !currentStepData) return null
    const initial = savedAsthmaInitial?.values || asthmaInitialValidation.parsed
    const reeval = savedAsthmaReeval?.values || asthmaReevalValidation.parsed
    const sat = initial.sato2 ?? null
    const fr = initial.fr ?? null
    const fc = initial.fc ?? null
    const pfe = initial.pfe ?? null
    const paco2 = initial.paco2 ?? null
    const satRe = reeval.sato2Re ?? null
    const frRe = reeval.frRe ?? null
    const pfeRe = reeval.pfeRe ?? null
    const flags = savedAsthmaInitial?.flags || asthmaFlags

    if (currentStepData.id === 'asma_classificacao_gravidade' && sat !== null && fr !== null && fc !== null && pfe !== null) {
      if (flags.toraxSilente || flags.cianose || flags.confusao || flags.exaustao || flags.sonolencia || (paco2 !== null && paco2 >= 45)) {
        return `Ameaça à vida: sinais críticos e/ou PaCO2 ${paco2 ?? '--'} indicam risco de falência respiratória.`
      }
      if (fr > 30 || fc > 120 || sat < 90 || pfe < 40 || flags.falaPalavras) {
        return `Crise grave: FR ${fr}, FC ${fc}, SatO2 ${sat}% e PFE ${pfe}% sugerem necessidade de manejo agressivo.`
      }
      if ((fr >= 25 && fr <= 30) || (sat >= 90 && sat < 95) || (pfe >= 40 && pfe <= 69) || flags.incapazFrases || flags.usoMusculatura) {
        return `Crise moderada: parâmetros intermediários com necessidade de tratamento intensivo no PS.`
      }
      return `Crise leve: parâmetros sem critérios de gravidade imediata.`
    }
    if (currentStepData.id === 'asma_oxigenio' && sat !== null) {
      return sat < 94 ? `SatO2 ${sat}%: indicar oxigênio suplementar com meta 93–95%.` : `SatO2 ${sat}%: sem O2 inicial obrigatório, manter monitorização.`
    }
    if (currentStepData.id === 'asma_decisao_1h' && satRe !== null && frRe !== null && pfeRe !== null) {
      return `Reavaliação 1h: SatO2 ${satRe}%, FR ${frRe}, PFE ${pfeRe}% para decidir alta, observação ou escalonamento.`
    }
    if (currentStepData.id === 'asma_escalonamento') {
      return 'Sem resposta adequada após terapia inicial: avançar para magnésio EV, SABA contínuo e avaliação de internação/UTI.'
    }
    if (currentStepData.id === 'asma_falencia_respiratoria') {
      return 'Sinais de exaustão/hipercapnia/consciência alterada exigem via aérea avançada e suporte intensivo.'
    }
    return null
  }, [
    isAsthmaFlow,
    currentStepData,
    savedAsthmaInitial,
    savedAsthmaReeval,
    asthmaInitialValidation.parsed,
    asthmaReevalValidation.parsed,
    asthmaFlags
  ])

  useEffect(() => {
    if (!isGasometryFlow || currentStepData?.id !== 'coleta_parametros') return
    if (!savedGasometryLabs) return
    setGasometryDraft({
      ph: savedGasometryLabs.ph != null ? String(savedGasometryLabs.ph) : '',
      pco2: savedGasometryLabs.pco2 != null ? String(savedGasometryLabs.pco2) : '',
      hco3: savedGasometryLabs.hco3 != null ? String(savedGasometryLabs.hco3) : '',
      be: savedGasometryLabs.be != null ? String(savedGasometryLabs.be) : '',
      po2: savedGasometryLabs.po2 != null ? String(savedGasometryLabs.po2) : '',
      sodium: savedGasometryLabs.sodium != null ? String(savedGasometryLabs.sodium) : '',
      chloride: savedGasometryLabs.chloride != null ? String(savedGasometryLabs.chloride) : '',
      albumin: savedGasometryLabs.albumin != null ? String(savedGasometryLabs.albumin) : ''
    })
  }, [isGasometryFlow, currentStepData?.id, savedGasometryLabs])

  useEffect(() => {
    if (!isAsthmaFlow || currentStepData?.id !== 'asma_avaliacao_inicial') return
    if (!savedAsthmaInitial) return
    setAsthmaInitialDraft({
      sato2: savedAsthmaInitial.values?.sato2 != null ? String(savedAsthmaInitial.values.sato2) : '',
      fr: savedAsthmaInitial.values?.fr != null ? String(savedAsthmaInitial.values.fr) : '',
      fc: savedAsthmaInitial.values?.fc != null ? String(savedAsthmaInitial.values.fc) : '',
      pfe: savedAsthmaInitial.values?.pfe != null ? String(savedAsthmaInitial.values.pfe) : '',
      paco2: savedAsthmaInitial.values?.paco2 != null ? String(savedAsthmaInitial.values.paco2) : ''
    })
    if (savedAsthmaInitial.flags) {
      setAsthmaFlags(savedAsthmaInitial.flags)
    }
  }, [isAsthmaFlow, currentStepData?.id, savedAsthmaInitial])

  useEffect(() => {
    if (!isAsthmaFlow || currentStepData?.id !== 'asma_reavaliacao_1h') return
    if (!savedAsthmaReeval) return
    setAsthmaReevalDraft({
      sato2Re: savedAsthmaReeval.values?.sato2Re != null ? String(savedAsthmaReeval.values.sato2Re) : '',
      frRe: savedAsthmaReeval.values?.frRe != null ? String(savedAsthmaReeval.values.frRe) : '',
      pfeRe: savedAsthmaReeval.values?.pfeRe != null ? String(savedAsthmaReeval.values.pfeRe) : ''
    })
    if (savedAsthmaReeval.flags) {
      setAsthmaReevalFlags(savedAsthmaReeval.flags)
    }
  }, [isAsthmaFlow, currentStepData?.id, savedAsthmaReeval])

  useEffect(() => {
    if (!isTVPClinicalEvaluation) {
      setSelectedClinicalFindings([])
      setOtherClinicalFinding('')
      return
    }
    const saved = answers[currentStep]
    if (!saved) {
      setSelectedClinicalFindings([])
      setOtherClinicalFinding('')
      return
    }
    try {
      const parsed = JSON.parse(saved)
      const achados = Array.isArray(parsed?.sinaisEAchados) ? parsed.sinaisEAchados : []
      const outros = typeof parsed?.outrosAchados === 'string' ? parsed.outrosAchados : ''
      setSelectedClinicalFindings(achados)
      setOtherClinicalFinding(outros)
    } catch {
      setSelectedClinicalFindings([])
      setOtherClinicalFinding('')
    }
  }, [isTVPClinicalEvaluation, answers, currentStep])

  useEffect(() => {
    if (!isTVPWellsScore) {
      setSelectedWellsCriteria([])
      return
    }
    const saved = answers[currentStep]
    if (!saved) {
      setSelectedWellsCriteria([])
      return
    }
    try {
      const parsed = JSON.parse(saved)
      const criteria = Array.isArray(parsed?.criteriosSelecionados) ? parsed.criteriosSelecionados : []
      setSelectedWellsCriteria(criteria)
    } catch {
      setSelectedWellsCriteria([])
    }
  }, [isTVPWellsScore, answers, currentStep])

  useEffect(() => {
    if (!isTVPTreatmentInitial) {
      setSelectedContraindications([])
      setSelectedTherapies([])
      setSelectedDurationPlan('')
      return
    }
    const saved = answers[currentStep]
    if (!saved) {
      setSelectedContraindications([])
      setSelectedTherapies([])
      setSelectedDurationPlan('')
      return
    }
    try {
      const parsed = JSON.parse(saved)
      const items = Array.isArray(parsed?.contraindicacoesSelecionadas) ? parsed.contraindicacoesSelecionadas : []
      const therapies = Array.isArray(parsed?.opcoesTerapeuticasSelecionadas) ? parsed.opcoesTerapeuticasSelecionadas : []
      const duration = typeof parsed?.planoDuracaoSelecionado === 'string' ? parsed.planoDuracaoSelecionado : ''
      setSelectedContraindications(items)
      setSelectedTherapies(therapies)
      setSelectedDurationPlan(duration)
    } catch {
      setSelectedContraindications([])
      setSelectedTherapies([])
      setSelectedDurationPlan('')
    }
  }, [isTVPTreatmentInitial, answers, currentStep])

  useEffect(() => {
    if (isTVPClinicalEvaluation) {
      setSectionOpen({
        tvp_clinical_0: true,
        tvp_clinical_1: false,
        tvp_clinical_2: false,
        tvp_clinical_other: true
      })
      return
    }
    if (isTVPWellsScore) {
      setSectionOpen({
        tvp_wells_criteria: true,
        tvp_wells_interpretation: true
      })
      return
    }
    if (isTVPTreatmentInitial) {
      setSectionOpen({
        tvp_treatment_therapies: true,
        tvp_treatment_duration: false,
        tvp_treatment_contra: true,
        tvp_treatment_guidance: false
      })
    }
  }, [currentStep, isTVPClinicalEvaluation, isTVPWellsScore, isTVPTreatmentInitial])

  if (!currentStepData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800">Erro no Fluxograma</h3>
          <p className="text-gray-600">Step não encontrado: {currentStep}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 pb-12">
      {/* Premium Medical Header */}
      <div className="relative bg-white shadow-xl border-b border-slate-200/50 sticky top-0 z-50 mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-slate-50 to-blue-600/3"></div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
          >
            {/* Left - Patient Info */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl blur-xl opacity-20 scale-110"></div>
                <div className="relative w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl border border-blue-100">
                  <Stethoscope className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
              </div>

              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                  {patient.name || 'Paciente Sem Nome'}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    {patient.age ? `${patient.age} anos` : 'Idade não informada'} • {patient.medicalRecord || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center space-x-3">
              {onBack && (
                <motion.button
                  onClick={onBack}
                  className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 border border-slate-300 text-slate-700 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </motion.button>
              )}

              <motion.button
                onClick={goBack}
                disabled={history.length === 0}
                className={clsx(
                  "group flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all duration-200 font-medium",
                  history.length > 0
                    ? "bg-gradient-to-br from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 border-amber-300 text-amber-700 shadow-lg hover:shadow-xl"
                    : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                )}
                whileHover={history.length > 0 ? { scale: 1.02 } : {}}
                whileTap={history.length > 0 ? { scale: 0.98 } : {}}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </motion.button>

              <motion.button
                onClick={restart}
                className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 border border-blue-300 text-blue-700 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reiniciar</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{flowchart.name}</h3>
                <p className="text-sm text-slate-600">{flowchart.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                {Math.round(progress)}%
              </span>
              <div className={clsx(
                "px-3 py-1 rounded-xl text-sm font-bold border",
                flowchart.priority === 'high' ? "bg-red-100 text-red-800 border-red-200" :
                flowchart.priority === 'medium' ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                "bg-green-100 text-green-800 border-green-200"
              )}>
                {flowchart.priority.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded-full h-4 shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-blue-600 via-blue-500 to-slate-600 h-4 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Conteúdo Principal */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            {/* Header do Step */}
            <div className={clsx(
              "p-6 text-white",
              `bg-gradient-to-r ${getStepColor(currentStepData)}`
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStepIcon(currentStepData)}
                  <div>
                    <h2 className="text-xl font-bold">{currentStepData.title}</h2>
                    <p className="text-sm opacity-90">{currentStepData.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {currentStepData.critical && (
                    <div className="flex items-center space-x-1 bg-red-500 bg-opacity-20 px-2 py-1 rounded">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs">CRÍTICO</span>
                    </div>
                  )}
                  {currentStepData.timeSensitive && (
                    <div className="flex items-center space-x-1 bg-orange-500 bg-opacity-20 px-2 py-1 rounded">
                      <Timer className="w-4 h-4" />
                      <span className="text-xs">TEMPO</span>
                    </div>
                  )}
                  {currentStepData.requiresSpecialist && (
                    <div className="flex items-center space-x-1 bg-purple-500 bg-opacity-20 px-2 py-1 rounded">
                      <UserCheck className="w-4 h-4" />
                      <span className="text-xs">ESPECIALISTA</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conteúdo do Step */}
            <div className="p-6">
              {currentStepData.content && !isTVPClinicalEvaluation && !isTVPWellsScore && !isTVPTreatmentInitial && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: currentStepData.content }} />
                  </div>
                </div>
              )}

              {isGasometryFlow && currentStepData.id === 'coleta_parametros' && (
                <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    {gasometryFieldConfig.map((field) => {
                      const value = gasometryDraft[field.key]
                      const parsed = gasometryValidation.parsed[field.key]
                      const error = gasometryValidation.errors[field.key]
                      const feedback = getGasometryFieldFeedback(field.key, parsed)
                      const toneClass = error
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : feedback.tone === 'red'
                          ? 'border-red-300 bg-red-50 text-red-700'
                          : feedback.tone === 'amber'
                            ? 'border-amber-300 bg-amber-50 text-amber-700'
                            : feedback.tone === 'emerald'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-slate-300 bg-slate-50 text-slate-600'
                      return (
                        <div key={field.key} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-800">
                              {field.label} {field.unit && <span className="text-slate-500">({field.unit})</span>} {field.required && <span className="text-red-600">*</span>}
                            </label>
                            <button
                              type="button"
                              onClick={() => setGasometryInfoOpen(prev => prev === field.key ? null : field.key)}
                              className="w-6 h-6 rounded-full border border-blue-300 bg-blue-50 text-blue-700 inline-flex items-center justify-center hover:bg-blue-100 transition-colors"
                              title="Como esse valor é usado no cálculo"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setGasometryDraft(prev => ({ ...prev, [field.key]: normalizeGasometryInput(field.key, e.target.value) }))}
                            onBlur={(e) => setGasometryDraft(prev => ({ ...prev, [field.key]: normalizeGasometryInput(field.key, e.target.value, true) }))}
                            className={clsx('mt-1 w-full rounded-xl border px-3 py-2.5 focus:ring-2 outline-none', toneClass, 'focus:ring-slate-300')}
                            placeholder={`${field.min} – ${field.max}`}
                          />
                          <div className={clsx('mt-2 inline-flex items-center px-2 py-1 rounded-md border text-xs font-semibold', toneClass)}>
                            {error ? error : feedback.text}
                          </div>
                          {gasometryInfoOpen === field.key && (
                            <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-xs text-blue-900 space-y-1">
                              {gasometryFieldInfo[field.key].map((line) => (
                                <p key={line}>{line}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      onClick={() => {
                        if (!requiredGasometryReady) return
                        const payload = Object.entries(gasometryValidation.parsed).reduce((acc, [key, value]) => {
                          if (value !== null) acc[key] = value
                          return acc
                        }, {} as Record<string, number>)
                        handleAnswer('avaliar_ph', JSON.stringify(payload))
                      }}
                      disabled={!requiredGasometryReady}
                      className={clsx(
                        'px-5 py-2.5 rounded-xl font-semibold transition-all',
                        requiredGasometryReady
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      )}
                    >
                      Aplicar valores e continuar
                    </motion.button>
                  </div>
                </div>
              )}

              {isAsthmaFlow && currentStepData.id === 'asma_avaliacao_inicial' && (
                <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4">
                  <div className="grid md:grid-cols-2 gap-3">
                    {asthmaInitialFieldConfig.map((field) => {
                      const value = asthmaInitialDraft[field.key]
                      const parsed = asthmaInitialValidation.parsed[field.key]
                      const error = asthmaInitialValidation.errors[field.key]
                      const toneClass = error
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : parsed === null
                          ? 'border-slate-300 bg-slate-50 text-slate-600'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      return (
                        <div key={field.key} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-800">
                              {field.label} {field.unit && <span className="text-slate-500">({field.unit})</span>} {field.required && <span className="text-red-600">*</span>}
                            </label>
                            <div className="relative group">
                              <div className="w-6 h-6 rounded-full border border-cyan-300 bg-cyan-50 text-cyan-700 inline-flex items-center justify-center">
                                <Info className="w-3.5 h-3.5" />
                              </div>
                              <div className="absolute z-20 right-0 mt-2 w-72 hidden group-hover:block rounded-lg border border-cyan-200 bg-white p-2.5 shadow-xl text-xs text-slate-700 space-y-1">
                                {asthmaInitialInfo[field.key].map((line) => (
                                  <p key={line}>{line}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setAsthmaInitialDraft(prev => ({ ...prev, [field.key]: e.target.value.replace(',', '.') }))}
                            className={clsx('mt-1 w-full rounded-xl border px-3 py-2.5 focus:ring-2 outline-none', toneClass, 'focus:ring-slate-300')}
                            placeholder={`${field.min} – ${field.max}`}
                          />
                          <div className={clsx('mt-2 inline-flex items-center px-2 py-1 rounded-md border text-xs font-semibold', toneClass)}>
                            {error ? error : parsed === null ? 'Aguardando preenchimento' : 'Valor válido'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    {[
                      { key: 'usoMusculatura', label: 'Uso de musculatura acessória' },
                      { key: 'incapazFrases', label: 'Incapaz de falar frases completas' },
                      { key: 'falaPalavras', label: 'Fala apenas palavras' },
                      { key: 'cianose', label: 'Cianose' },
                      { key: 'confusao', label: 'Confusão/Agitação' },
                      { key: 'exaustao', label: 'Exaustão respiratória' },
                      { key: 'toraxSilente', label: 'Tórax silencioso' },
                      { key: 'sonolencia', label: 'Sonolência/rebaixamento' }
                    ].map((flag) => (
                      <label key={flag.key} className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2">
                        <input
                          type="checkbox"
                          checked={asthmaFlags[flag.key as keyof typeof asthmaFlags]}
                          onChange={(e) => setAsthmaFlags(prev => ({ ...prev, [flag.key]: e.target.checked }))}
                        />
                        <span>{flag.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      onClick={() => {
                        if (!requiredAsthmaInitialReady) return
                        const values = Object.entries(asthmaInitialValidation.parsed).reduce((acc, [key, value]) => {
                          if (value !== null) acc[key] = value
                          return acc
                        }, {} as Record<string, number>)
                        handleAnswer('asma_classificacao_gravidade', JSON.stringify({ values, flags: asthmaFlags }))
                      }}
                      disabled={!requiredAsthmaInitialReady}
                      className={clsx(
                        'px-5 py-2.5 rounded-xl font-semibold transition-all',
                        requiredAsthmaInitialReady ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      )}
                    >
                      Aplicar avaliação e continuar
                    </motion.button>
                  </div>
                </div>
              )}

              {isAsthmaFlow && currentStepData.id === 'asma_reavaliacao_1h' && (
                <div className="mb-6 rounded-2xl border border-cyan-200 bg-cyan-50/40 p-4">
                  <div className="grid md:grid-cols-3 gap-3">
                    {asthmaReevalFieldConfig.map((field) => {
                      const value = asthmaReevalDraft[field.key]
                      const parsed = asthmaReevalValidation.parsed[field.key]
                      const error = asthmaReevalValidation.errors[field.key]
                      const toneClass = error
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : parsed === null
                          ? 'border-slate-300 bg-slate-50 text-slate-600'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      return (
                        <div key={field.key} className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-800">
                              {field.label} {field.unit && <span className="text-slate-500">({field.unit})</span>} {field.required && <span className="text-red-600">*</span>}
                            </label>
                            <div className="relative group">
                              <div className="w-6 h-6 rounded-full border border-cyan-300 bg-cyan-50 text-cyan-700 inline-flex items-center justify-center">
                                <Info className="w-3.5 h-3.5" />
                              </div>
                              <div className="absolute z-20 right-0 mt-2 w-72 hidden group-hover:block rounded-lg border border-cyan-200 bg-white p-2.5 shadow-xl text-xs text-slate-700 space-y-1">
                                {asthmaReevalInfo[field.key].map((line) => (
                                  <p key={line}>{line}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setAsthmaReevalDraft(prev => ({ ...prev, [field.key]: e.target.value.replace(',', '.') }))}
                            className={clsx('mt-1 w-full rounded-xl border px-3 py-2.5 focus:ring-2 outline-none', toneClass, 'focus:ring-slate-300')}
                            placeholder={`${field.min} – ${field.max}`}
                          />
                          <div className={clsx('mt-2 inline-flex items-center px-2 py-1 rounded-md border text-xs font-semibold', toneClass)}>
                            {error ? error : parsed === null ? 'Aguardando preenchimento' : 'Valor válido'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 mt-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2">
                      <input
                        type="checkbox"
                        checked={asthmaReevalFlags.melhoraClinica}
                        onChange={(e) => setAsthmaReevalFlags(prev => ({ ...prev, melhoraClinica: e.target.checked }))}
                      />
                      <span>Melhora clínica global após 1 hora</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2">
                      <input
                        type="checkbox"
                        checked={asthmaReevalFlags.necessidadeBroncoRepetido}
                        onChange={(e) => setAsthmaReevalFlags(prev => ({ ...prev, necessidadeBroncoRepetido: e.target.checked }))}
                      />
                      <span>Necessidade repetida de broncodilatador</span>
                    </label>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      onClick={() => {
                        if (!requiredAsthmaReevalReady) return
                        const values = Object.entries(asthmaReevalValidation.parsed).reduce((acc, [key, value]) => {
                          if (value !== null) acc[key] = value
                          return acc
                        }, {} as Record<string, number>)
                        handleAnswer('asma_decisao_1h', JSON.stringify({ values, flags: asthmaReevalFlags }))
                      }}
                      disabled={!requiredAsthmaReevalReady}
                      className={clsx(
                        'px-5 py-2.5 rounded-xl font-semibold transition-all',
                        requiredAsthmaReevalReady ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      )}
                    >
                      Aplicar reavaliação e continuar
                    </motion.button>
                  </div>
                </div>
              )}

              {isTVPClinicalEvaluation && (
                <div className="mb-6 p-4 bg-white rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      Checklist Clínico Inicial
                    </h4>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
                      {selectedClinicalFindings.length} marcado(s)
                    </span>
                  </div>
                  <div className="grid lg:grid-cols-2 gap-4">
                    {[
                      { title: 'Sinais e sintomas clássicos', items: tvpClassicSigns },
                      { title: 'Achados ao exame físico', items: tvpPhysicalExamFindings },
                      { title: 'Sinais de alerta (maior suspeita/gravidade)', items: tvpAlertSigns }
                    ].map((section, index) => (
                      <div key={section.title} className="bg-gradient-to-r from-blue-50 to-sky-50 p-4 rounded-xl border border-blue-200">
                        <button
                          type="button"
                          onClick={() => toggleSection(`tvp_clinical_${index}`)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">{section.title}</h4>
                          <ChevronRight className={clsx('w-4 h-4 text-blue-700 transition-transform', isSectionOpen(`tvp_clinical_${index}`, index === 0) ? 'rotate-90' : '')} />
                        </button>
                        {isSectionOpen(`tvp_clinical_${index}`, index === 0) && (
                        <div className="space-y-1.5 mt-3">
                          {section.items.map((item) => {
                            const checked = selectedClinicalFindings.includes(item)
                            return (
                              <label
                                key={item}
                                className={clsx(
                                  'flex items-start gap-2 p-2 rounded-lg transition-colors cursor-pointer',
                                  checked ? 'bg-white border border-blue-200' : 'hover:bg-white/70'
                                )}
                              >
                                <input
                                  type="checkbox"
                                  className="mt-0.5 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  checked={checked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedClinicalFindings(prev => [...prev, item])
                                    } else {
                                      setSelectedClinicalFindings(prev => prev.filter(entry => entry !== item))
                                    }
                                  }}
                                />
                                <span className="text-sm text-slate-700 leading-snug">{item}</span>
                              </label>
                            )
                          })}
                        </div>
                        )}
                      </div>
                    ))}
                    <div className="lg:col-span-2">
                      <button
                        type="button"
                        onClick={() => toggleSection('tvp_clinical_other')}
                        className="w-full flex items-center justify-between text-left mb-2"
                      >
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                          Outros achados
                        </label>
                        <ChevronRight className={clsx('w-4 h-4 text-slate-600 transition-transform', isSectionOpen('tvp_clinical_other', true) ? 'rotate-90' : '')} />
                      </button>
                      {isSectionOpen('tvp_clinical_other', true) && (
                        <textarea
                          value={otherClinicalFinding}
                          onChange={(e) => setOtherClinicalFinding(e.target.value)}
                          className="w-full min-h-20 p-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                          placeholder="Descreva outros achados clínicos relevantes"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isTVPWellsScore && (
                <div className="mb-6 p-5 bg-indigo-50 rounded-2xl border border-indigo-200">
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                          Escore de Wells para suspeita de TVP
                        </h4>
                        <button
                          type="button"
                          onClick={() => setWellsInfoOpen(true)}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors"
                          title="Observações práticas do Escore de Wells"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                      <div className={clsx(
                        'px-4 py-2 rounded-xl border text-sm font-bold',
                        wellsRisk === 'alta'
                          ? 'bg-red-100 border-red-300 text-red-800'
                          : wellsRisk === 'moderada'
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      )}>
                        Pontuação: {wellsScoreTotal} ({wellsRisk.toUpperCase()})
                      </div>
                    </div>

                    <div className="bg-white/70 rounded-xl border border-indigo-200 p-3">
                      <button
                        type="button"
                        onClick={() => toggleSection('tvp_wells_criteria')}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Critérios de pontuação</span>
                        <ChevronRight className={clsx('w-4 h-4 text-indigo-700 transition-transform', isSectionOpen('tvp_wells_criteria', true) ? 'rotate-90' : '')} />
                      </button>
                    {isSectionOpen('tvp_wells_criteria', true) && (
                    <div className="space-y-2 mt-3">
                      {tvpWellsCriteria.map((criterion) => {
                        const checked = selectedWellsCriteria.includes(criterion.id)
                        return (
                          <label
                            key={criterion.id}
                            className={clsx(
                              'flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer',
                              checked ? 'bg-white border-indigo-300' : 'bg-white/70 border-slate-200 hover:border-slate-300'
                            )}
                          >
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedWellsCriteria(prev => [...prev, criterion.id])
                                } else {
                                  setSelectedWellsCriteria(prev => prev.filter(item => item !== criterion.id))
                                }
                              }}
                            />
                            <div className="flex-1">
                              <span className="text-sm text-slate-700 leading-relaxed">{criterion.text}</span>
                              <span className={clsx(
                                'ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-md border',
                                criterion.score > 0
                                  ? 'text-blue-700 border-blue-200 bg-blue-50'
                                  : 'text-red-700 border-red-200 bg-red-50'
                              )}>
                                {criterion.score > 0 ? `+${criterion.score}` : criterion.score}
                              </span>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                    )}
                    </div>

                    <div className="bg-white/70 rounded-xl border border-indigo-200 p-3">
                      <button
                        type="button"
                        onClick={() => toggleSection('tvp_wells_interpretation')}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Interpretação e conduta</span>
                        <ChevronRight className={clsx('w-4 h-4 text-indigo-700 transition-transform', isSectionOpen('tvp_wells_interpretation', true) ? 'rotate-90' : '')} />
                      </button>
                    {isSectionOpen('tvp_wells_interpretation', true) && (
                    <>
                    <div className="grid md:grid-cols-3 gap-3 mt-3">
                      <div className={clsx(
                        'rounded-xl p-3 border text-sm',
                        wellsRisk === 'baixa' ? 'bg-emerald-100 border-emerald-300' : 'bg-white border-slate-200'
                      )}>
                        <div className="font-bold text-slate-800">Baixa (≤0)</div>
                        <div className="text-slate-600 mt-1">D-dímero de alta sensibilidade; se positivo, USG compressiva.</div>
                      </div>
                      <div className={clsx(
                        'rounded-xl p-3 border text-sm',
                        wellsRisk === 'moderada' ? 'bg-amber-100 border-amber-300' : 'bg-white border-slate-200'
                      )}>
                        <div className="font-bold text-slate-800">Moderada (1–2)</div>
                        <div className="text-slate-600 mt-1">USG direta ou D-dímero de alta sensibilidade seguido de USG se positivo.</div>
                      </div>
                      <div className={clsx(
                        'rounded-xl p-3 border text-sm',
                        wellsRisk === 'alta' ? 'bg-red-100 border-red-300' : 'bg-white border-slate-200'
                      )}>
                        <div className="font-bold text-slate-800">Alta (≥3)</div>
                        <div className="text-slate-600 mt-1">USG compressiva urgente; se negativa e suspeita persistir, repetir em 5–7 dias.</div>
                      </div>
                    </div>

                    <div className="rounded-xl p-3 bg-white border border-slate-200 text-sm text-slate-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Medir panturrilha 10 cm abaixo da tuberosidade tibial e comparar com o lado assintomático.</li>
                        <li>Veias colaterais são veias não varicosas visíveis ou palpáveis.</li>
                        <li>O escore é apoio à decisão e não substitui julgamento clínico.</li>
                      </ul>
                    </div>

                    <motion.button
                      onClick={() => handleAnswer(wellsNextStep, wellsDecisionValue)}
                      className={clsx(
                        'w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between',
                        wellsRisk === 'alta'
                          ? 'bg-red-50 border-red-200 hover:border-red-400'
                          : wellsRisk === 'moderada'
                            ? 'bg-amber-50 border-amber-200 hover:border-amber-400'
                            : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
                      )}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className="font-semibold text-slate-800">
                        Continuar conforme escore: {wellsRisk === 'baixa' ? 'Probabilidade Baixa' : wellsRisk === 'moderada' ? 'Probabilidade Moderada' : 'Probabilidade Alta'}
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-500" />
                    </motion.button>
                    </>
                    )}
                    </div>
                  </div>
                </div>
              )}

              {isTVPWellsScore && wellsInfoOpen && (
                <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
                      <h4 className="font-bold">Escore de Wells — Observações Práticas</h4>
                      <button
                        type="button"
                        onClick={() => setWellsInfoOpen(false)}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 inline-flex items-center justify-center transition-colors"
                        title="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-5 text-sm text-slate-700">
                      <ul className="list-disc pl-5 space-y-2">
                        <li>Use fita para medir a panturrilha 10 cm abaixo da tuberosidade tibial; compare com o lado assintomático.</li>
                        <li>“Veias colaterais” referem-se a veias não-varicosas visíveis/palpáveis.</li>
                        <li>O escore é menos validado em gestantes, pacientes em anticoagulação, hospitalizados ou com infecções/traumas extensos; interprete com cautela.</li>
                        <li>Considere D-dímero ajustado à idade em idosos para melhorar especificidade.</li>
                        <li>Reavalie se surgir diagnóstico alternativo plausível (p. ex., ruptura de cisto de Baker, celulite).</li>
                        <li>Documente a pontuação e a via diagnóstica escolhida no prontuário.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {isTVPTreatmentInitial && (
                <div className="mb-6 p-5 bg-red-50 rounded-2xl border border-red-200">
                  <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('tvp_treatment_therapies')}
                        className="w-full flex items-center justify-between text-left mb-3"
                      >
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                          Prescrição: opções terapêuticas e doses
                        </h4>
                        <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 inline-flex items-center gap-2">
                          {selectedTherapies.length} opção(ões)
                          <ChevronRight className={clsx('w-3 h-3 text-blue-700 transition-transform', isSectionOpen('tvp_treatment_therapies', true) ? 'rotate-90' : '')} />
                        </span>
                      </button>
                      {isSectionOpen('tvp_treatment_therapies', true) && (
                      <div className="space-y-2">
                        {tvpTherapeuticOptions.map((item) => {
                          const checked = selectedTherapies.includes(item.id)
                          return (
                            <label
                              key={item.id}
                              className={clsx(
                                'flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer',
                                checked ? 'bg-blue-50 border-blue-300' : 'bg-white border-slate-200 hover:border-slate-300'
                              )}
                            >
                              <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTherapies(prev => [...prev, item.id])
                                  } else {
                                    setSelectedTherapies(prev => prev.filter(entry => entry !== item.id))
                                  }
                                }}
                              />
                              <div className="flex-1">
                                <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 mb-1">
                                  {item.group}
                                </span>
                                <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('tvp_treatment_duration')}
                        className="w-full flex items-center justify-between text-left mb-3"
                      >
                        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                          Duração do tratamento
                        </h4>
                        <ChevronRight className={clsx('w-4 h-4 text-emerald-700 transition-transform', isSectionOpen('tvp_treatment_duration', false) ? 'rotate-90' : '')} />
                      </button>
                      {isSectionOpen('tvp_treatment_duration', false) && (
                      <div className="space-y-2">
                        {tvpTreatmentDurations.map((item) => (
                          <label
                            key={item.id}
                            className={clsx(
                              'flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer',
                              selectedDurationPlan === item.id ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'
                            )}
                          >
                            <input
                              type="radio"
                              name="tvp_duration_plan"
                              className="mt-1 h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                              checked={selectedDurationPlan === item.id}
                              onChange={() => setSelectedDurationPlan(item.id)}
                            />
                            <p className="text-sm text-slate-700 leading-snug">{item.text}</p>
                          </label>
                        ))}
                      </div>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                    <button
                      type="button"
                      onClick={() => toggleSection('tvp_treatment_contra')}
                      className="w-full flex items-center justify-between text-left mb-3"
                    >
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        Antes da anticoagulação: checklist de contraindicações
                      </h4>
                      <ChevronRight className={clsx('w-4 h-4 text-red-700 transition-transform', isSectionOpen('tvp_treatment_contra', true) ? 'rotate-90' : '')} />
                    </button>
                    {isSectionOpen('tvp_treatment_contra', true) && (
                    <div className="space-y-2">
                      {tvpAnticoagContraindications.map((item) => {
                        const checked = selectedContraindications.includes(item.id)
                        return (
                          <label
                            key={item.id}
                            className={clsx(
                              'flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer',
                              checked ? 'bg-white border-red-300' : 'bg-white/70 border-slate-200 hover:border-slate-300'
                            )}
                          >
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedContraindications(prev => [...prev, item.id])
                                } else {
                                  setSelectedContraindications(prev => prev.filter(entry => entry !== item.id))
                                }
                              }}
                            />
                            <div className="flex-1">
                              <span className="text-sm text-slate-700 leading-relaxed">{item.text}</span>
                              <span className={clsx(
                                'ml-2 inline-block text-xs font-bold px-2 py-0.5 rounded-md border',
                                item.severity === 'absoluta'
                                  ? 'text-red-700 border-red-200 bg-red-50'
                                  : 'text-amber-700 border-amber-200 bg-amber-50'
                              )}>
                                {item.severity === 'absoluta' ? 'Absoluta' : 'Relativa'}
                              </span>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                    )}
                    </div>

                    <div className={clsx(
                      'rounded-xl p-3 border text-sm',
                      hasAbsoluteContraindication
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : selectedContraindications.length > 0
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    )}>
                      {hasAbsoluteContraindication
                        ? 'Há contraindicação absoluta marcada: priorizar encaminhamento urgente e reavaliar estratégia.'
                        : selectedContraindications.length > 0
                          ? 'Há contraindicações relativas: individualizar risco/benefício e monitorar sangramento.'
                          : 'Sem contraindicações marcadas: apto para anticoagulação conforme protocolo.'}
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                      <button
                        type="button"
                        onClick={() => toggleSection('tvp_treatment_guidance')}
                        className="w-full flex items-center justify-between text-left mb-3"
                      >
                        <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">Complicações, internação e seguimento</span>
                        <ChevronRight className={clsx('w-4 h-4 text-slate-700 transition-transform', isSectionOpen('tvp_treatment_guidance', false) ? 'rotate-90' : '')} />
                      </button>
                    {isSectionOpen('tvp_treatment_guidance', false) && (
                    <div className="rounded-xl p-3 bg-white border border-slate-200 text-sm text-slate-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Sempre solicitar avaliação do cirurgião vascular após confirmação de TVP.</li>
                        <li>Se suspeita de TEP, dor intensa com cianose ou flegmasia, escalar urgência imediatamente.</li>
                        <li>Documentar contraindicações, decisão terapêutica e plano de seguimento no prontuário.</li>
                        <li>Sangramento: considerar protamina (HNF/LMWH), idarucizumabe (dabigatrana), andexanet alfa ou PCC (apixabana/rivaroxabana).</li>
                        <li>HIT: suspender heparina e iniciar anticoagulante não-heparínico.</li>
                        <li>Ambulatorial se estável e baixo risco; internar se flegmasia, dor incapacitante, necessidade de HNF ou comorbidades descompensadas.</li>
                        <li>Seguimento: deambulação precoce, reavaliação em 1–2 semanas e em 3 meses, monitorar sangramento e adesão.</li>
                      </ul>
                    </div>
                    )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <motion.button
                        onClick={() => handleAnswer('anticoagulacao_iniciada', 'anticoag_vascular')}
                        disabled={hasAbsoluteContraindication || !hasSelectedTherapy}
                        className={clsx(
                          'w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between',
                          hasAbsoluteContraindication || !hasSelectedTherapy
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
                        )}
                        whileHover={!hasAbsoluteContraindication && hasSelectedTherapy ? { scale: 1.01 } : {}}
                        whileTap={!hasAbsoluteContraindication && hasSelectedTherapy ? { scale: 0.99 } : {}}
                      >
                        <span className="font-semibold text-slate-800">
                          Iniciar anticoagulação + solicitar cirurgião vascular
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </motion.button>

                      <motion.button
                        onClick={() => handleAnswer('encaminhamento_urgente', 'contraindicacao_ou_gravidade')}
                        className="w-full p-4 text-left rounded-2xl border-2 transition-all duration-300 flex items-center justify-between bg-red-50 border-red-200 hover:border-red-400"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <span className="font-semibold text-slate-800">
                          Encaminhar urgente por contraindicação/gravidade
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {isGasometryFlow && gasometryStepNarrative && currentStepData.id !== 'coleta_parametros' && (
                <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                  <h4 className="text-sm font-bold text-indigo-800 mb-1">Interpretação automática com os valores já informados</h4>
                  <p className="text-sm text-indigo-900">{gasometryStepNarrative}</p>
                </div>
              )}

              {isAsthmaFlow && asthmaStepNarrative && currentStepData.id !== 'asma_avaliacao_inicial' && currentStepData.id !== 'asma_reavaliacao_1h' && (
                <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                  <h4 className="text-sm font-bold text-cyan-800 mb-1">Interpretação automática com os valores já informados</h4>
                  <p className="text-sm text-cyan-900">{asthmaStepNarrative}</p>
                </div>
              )}

              {/* Opções */}
              {(() => {
                const displayedOptions =
                  isGasometryFlow && gasometryStepOptions !== null
                    ? gasometryStepOptions
                    : isAsthmaFlow && asthmaStepOptions !== null
                      ? asthmaStepOptions
                      : currentStepData.options
                if (!(displayedOptions && displayedOptions.length > 0) || isTVPWellsScore || isTVPTreatmentInitial) return null
                return (
                <div className="grid gap-4">
                  {displayedOptions.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(option.nextStep, option.value)}
                      className={clsx(
                        "w-full p-6 text-left rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group",
                        option.critical 
                          ? "bg-red-50 border-red-200 hover:border-red-400 hover:bg-red-100 shadow-sm"
                          : option.requiresImmediateAction
                          ? "bg-orange-50 border-orange-200 hover:border-orange-400 hover:bg-orange-100 shadow-sm"
                          : "bg-white border-slate-100 hover:border-blue-300 hover:shadow-xl hover:bg-slate-50"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                          <span className={clsx(
                            "text-lg font-semibold block mb-1",
                            option.critical ? "text-red-900" : 
                            option.requiresImmediateAction ? "text-orange-900" : "text-slate-800"
                          )}>
                            {option.text}
                          </span>
                          {option.description && (
                            <span className={clsx(
                              "text-sm block",
                              option.critical ? "text-red-700" : "text-slate-500"
                            )}>
                              {option.description}
                            </span>
                          )}
                        </div>
                        
                        <div className={clsx(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ml-4",
                          option.critical 
                            ? "bg-red-100 text-red-600 group-hover:bg-red-200" 
                            : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                        )}>
                          <ChevronRight className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Background decoration for critical options */}
                      {option.critical && (
                        <div className="absolute right-0 top-0 w-24 h-24 bg-red-500 opacity-5 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
                      )}
                      
                      {option.critical && (
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-red-100">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-700">Requer Atenção Imediata</span>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
                )
              })()}

              {isGasometryFlow && gasometryStepOptions !== null && gasometryStepOptions.length === 0 && currentStepData.id !== 'coleta_parametros' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Nenhum critério foi atendido com os valores atuais para esta etapa. Revise os parâmetros em Coleta de Parâmetros.
                </div>
              )}

              {isAsthmaFlow && asthmaStepOptions !== null && asthmaStepOptions.length === 0 && currentStepData.id !== 'asma_avaliacao_inicial' && currentStepData.id !== 'asma_reavaliacao_1h' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  Nenhum critério foi atendido com os valores atuais para esta etapa. Revise os parâmetros de avaliação da asma.
                </div>
              )}

              {/* Step Final */}
              {flowchart.finalSteps.includes(currentStep) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={clsx(
                    "mt-6 p-6 rounded-2xl",
                    isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto')
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-green-50 border border-green-200'
                  )}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={clsx(
                      "w-16 h-16 rounded-full flex items-center justify-center",
                      isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto')
                        ? 'bg-amber-100'
                        : 'bg-green-100'
                    )}>
                      {isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto') ? (
                        <AlertTriangle className="w-8 h-8 text-amber-600" />
                      ) : (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      )}
                    </div>
                    <div>
                      <h3 className={clsx(
                        "text-xl font-bold",
                        isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto')
                          ? 'text-amber-800'
                          : 'text-green-800'
                      )}>
                        {isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto') ? 'Distúrbio Misto Identificado' : 'Fluxograma Concluído'}
                      </h3>
                      <p className={clsx(
                        "mt-1",
                        isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto')
                          ? 'text-amber-700'
                          : 'text-green-700'
                      )}>
                        {isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto')
                          ? 'Este resultado não é benigno por definição: indica combinação de distúrbios ácido-base e requer correlação clínica e conduta direcionada.'
                          : 'Protocolo finalizado com sucesso. O paciente pode ser liberado ou encaminhado conforme decisão clínica.'}
                      </p>
                    </div>
                    <button
                      onClick={onComplete}
                      className={clsx(
                        "mt-4 px-8 py-3 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2",
                        isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto')
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-green-600 hover:bg-green-700'
                      )}
                    >
                      {isGasometryFlow && currentStepData.title.toLowerCase().includes('distúrbio misto') ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      <span>Finalizar Atendimento</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Removed redundant bottom navigation */}
      </div>
    </div>
  )
}

export default EmergencyFlowchart 
