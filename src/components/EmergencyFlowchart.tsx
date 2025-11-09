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
  Microscope
} from 'lucide-react'
import { clsx } from 'clsx'
import { EmergencyPatient, EmergencyFlowchart, EmergencyStep } from '@/types/emergency'

interface EmergencyFlowchartProps {
  patient: EmergencyPatient
  flowchart: EmergencyFlowchart
  onComplete: () => void
  onUpdate: (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, riskGroup?: string) => void
}

const EmergencyFlowchart: React.FC<EmergencyFlowchartProps> = ({ 
  patient, 
  flowchart, 
  onComplete, 
  onUpdate 
}) => {
  const [currentStep, setCurrentStep] = useState(patient.emergencyState.currentStep || flowchart.initialStep)
  const [history, setHistory] = useState<string[]>(patient.emergencyState.history || [])
  const [answers, setAnswers] = useState<Record<string, string>>(patient.emergencyState.answers || {})
  const [progress, setProgress] = useState(patient.emergencyState.progress || 0)

  // Carregar estado do paciente na inicialização
  useEffect(() => {
    setCurrentStep(patient.emergencyState.currentStep || flowchart.initialStep)
    setHistory(patient.emergencyState.history || [])
    setAnswers(patient.emergencyState.answers || {})
    setProgress(patient.emergencyState.progress || 0)
  }, [patient, flowchart])

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
      setTimeout(() => {
        onComplete()
      }, 2000)
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Header do Fluxograma */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={clsx(
              "p-3 rounded-xl text-white",
              `bg-gradient-to-r ${flowchart.color}`
            )}>
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{flowchart.name}</h1>
              <p className="text-gray-600">{flowchart.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={clsx(
              "px-3 py-1 rounded-full text-xs font-medium",
              flowchart.priority === 'high' && "bg-red-100 text-red-800",
              flowchart.priority === 'medium' && "bg-yellow-100 text-yellow-800",
              flowchart.priority === 'low' && "bg-green-100 text-green-800"
            )}>
              {flowchart.priority.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Progresso: {Math.round(progress)}%</span>
          <span>Step {history.length + 1} de {Object.keys(flowchart.steps).length}</span>
        </div>
      </div>

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
              <div className="space-y-3">
                {currentStepData.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(option.nextStep, option.value)}
                    className={clsx(
                      "w-full p-4 text-left rounded-xl border-2 transition-all duration-200",
                      "hover:shadow-md hover:scale-[1.02]",
                      option.critical 
                        ? "border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-400"
                        : option.requiresImmediateAction
                        ? "border-orange-300 bg-orange-50 hover:bg-orange-100 hover:border-orange-400"
                        : "border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-300"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{option.text}</span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                    {option.critical && (
                      <div className="flex items-center space-x-1 mt-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-600">Ação Crítica</span>
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
                className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Fluxograma Concluído</h3>
                    <p className="text-green-700">Protocolo finalizado com sucesso</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controles de Navegação */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex space-x-3">
          <button
            onClick={goBack}
            disabled={history.length === 0}
            className={clsx(
              "flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors",
              history.length === 0
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
          
          <button
            onClick={restart}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reiniciar</span>
          </button>
        </div>

        <div className="text-sm text-gray-500">
          {flowchart.category} • {flowchart.priority} priority
        </div>
      </div>
    </div>
  )
}

export default EmergencyFlowchart 