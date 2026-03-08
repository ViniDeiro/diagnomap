'use client'

import React, { useState, useEffect } from 'react'
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
import { EmergencyPatient, EmergencyFlowchart, EmergencyStep } from '@/types/emergency'

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
  const [currentStep, setCurrentStep] = useState(patient.emergencyState.currentStep || flowchart.initialStep)
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

  // Carregar estado do paciente na inicialização
  useEffect(() => {
    // Só atualiza se o ID do paciente mudar ou se for inicialização, evitando reset durante a navegação
    if (patient.id) {
      setCurrentStep(patient.emergencyState.currentStep || flowchart.initialStep)
      setHistory(patient.emergencyState.history || [])
      setAnswers(patient.emergencyState.answers || {})
      setProgress(patient.emergencyState.progress || 0)
    }
  }, [patient.id, flowchart.initialStep])

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

              {/* Opções */}
              {currentStepData.options && currentStepData.options.length > 0 && !isTVPWellsScore && !isTVPTreatmentInitial && (
                <div className="grid gap-4">
                  {currentStepData.options.map((option, index) => (
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
              )}

              {/* Step Final */}
              {flowchart.finalSteps.includes(currentStep) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-green-50 border border-green-200 rounded-2xl"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-800">Fluxograma Concluído</h3>
                      <p className="text-green-700 mt-1">Protocolo finalizado com sucesso. O paciente pode ser liberado ou encaminhado conforme decisão clínica.</p>
                    </div>
                    <button
                      onClick={onComplete}
                      className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                    >
                      <CheckCircle className="w-5 h-5" />
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
