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
  Clock, 
  CheckCircle,
  Brain,
  Target,
  Shield,
  Zap,
  Award,
  RotateCcw,
  Timer,
  UserCheck,
  FileText,
  Pill,
  Syringe,
  Microscope,
  ArrowLeft
} from 'lucide-react'
import { clsx } from 'clsx'
import { EmergencyPatient, EmergencyFlowchart, EmergencyStep } from '@/types/emergency'

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
    const newAnswers = { ...answers, [currentStep]: value || nextStep }
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
              {currentStepData.content && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: currentStepData.content }} />
                  </div>
                </div>
              )}

              {/* Opções */}
              {currentStepData.options && currentStepData.options.length > 0 && (
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