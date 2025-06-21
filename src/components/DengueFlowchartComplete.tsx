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
  Droplets,
  Shield,
  Brain,
  Target,
  Zap,
  ArrowLeft,
  RotateCcw
} from 'lucide-react'
import { clsx } from 'clsx'
import { Patient } from '@/types/patient'

interface FlowchartStep {
  id: string
  title: string
  description: string
  type: 'question' | 'action' | 'result' | 'group' | 'wait_labs'
  options?: { text: string; nextStep: string; value?: string }[]
  group?: 'A' | 'B' | 'C' | 'D'
  icon?: React.ReactNode
  color?: string
  content?: React.ReactNode
  requiresLabs?: boolean
}

interface DengueFlowchartProps {
  patient: Patient
  onComplete: () => void
  onUpdate: (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, group?: 'A' | 'B' | 'C' | 'D') => void
  onBack?: () => void
}

const DengueFlowchartComplete: React.FC<DengueFlowchartProps> = ({ patient, onComplete, onUpdate, onBack }) => {
  const [currentStep, setCurrentStep] = useState(patient.flowchartState.currentStep || 'start')
  const [history, setHistory] = useState<string[]>(patient.flowchartState.history || [])
  const [answers, setAnswers] = useState<Record<string, string>>(patient.flowchartState.answers || {})
  const [progress, setProgress] = useState(patient.flowchartState.progress || 0)

  useEffect(() => {
    setCurrentStep(patient.flowchartState.currentStep || 'start')
    setHistory(patient.flowchartState.history || [])
    setAnswers(patient.flowchartState.answers || {})
    
    // Corrigir progresso para pacientes já finalizados
    let correctedProgress = patient.flowchartState.progress || 0
    if (patient.flowchartState.currentStep === 'end') {
      correctedProgress = 100
      // Atualizar no storage também
      onUpdate(patient.id, patient.flowchartState.currentStep, patient.flowchartState.history || [], patient.flowchartState.answers || {}, 100, patient.flowchartState.group)
    } else if (patient.flowchartState.currentStep?.startsWith('end_group_')) {
      correctedProgress = 95
      // Atualizar no storage também
      onUpdate(patient.id, patient.flowchartState.currentStep, patient.flowchartState.history || [], patient.flowchartState.answers || {}, 95, patient.flowchartState.group)
    }
    
    setProgress(correctedProgress)
  }, [patient, onUpdate])

  // Função utilitária para calcular o progresso baseado no caminho específico
  const calculateProgress = (currentStep: string, history: string[]): number => {
    const pathSteps = [...history, currentStep]
    
    // Se chegamos ao final, é 100%
    if (currentStep === 'end') {
      return 100
    }
    
    // Se chegamos aos steps finais específicos de cada grupo, é quase 100%
    if (currentStep.startsWith('end_group_')) {
      return 95
    }
    
    // Determinar o tipo de caminho baseado nos steps visitados
    let expectedTotalSteps = 6 // Caminho mínimo (Grupo A): start -> alarm_check -> bleeding_check -> group_a -> end_group_a -> end
    
    if (pathSteps.includes('group_b') || pathSteps.includes('end_group_b')) {
      expectedTotalSteps = 6 // Grupo B: start -> alarm_check -> bleeding_check -> group_b -> end_group_b -> end
    } else if (pathSteps.includes('group_c') || pathSteps.includes('end_group_c')) {
      expectedTotalSteps = 7 // Grupo C: start -> alarm_check -> group_c_d_classification -> group_c -> end_group_c -> end
    } else if (pathSteps.includes('group_d') || pathSteps.includes('end_group_d')) {
      expectedTotalSteps = 7 // Grupo D: start -> alarm_check -> group_c_d_classification -> group_d -> end_group_d -> end
    }
    
    // Calcular progresso baseado no número de steps completados
    const completedSteps = pathSteps.length
    const progress = Math.round((completedSteps / expectedTotalSteps) * 100)
    
    return Math.min(progress, 90) // Máximo 90% até chegar aos steps finais
  }

  const steps: Record<string, FlowchartStep> = {
    start: {
      id: 'start',
      title: 'Fluxograma de Classificação - Dengue 2024',
      description: 'Relato de febre entre 2-7 dias + sintomas. NOTIFICAR TODO CASO SUSPEITO.',
      type: 'question',
      icon: <Stethoscope className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-blue-600 to-slate-700',
      options: [
        { text: 'Iniciar avaliação', nextStep: 'alarm_check', value: 'start' }
      ]
    },

    alarm_check: {
      id: 'alarm_check',
      title: 'Tem sinal de alarme ou gravidade?',
      description: 'Verificar presença de sinais de alarme',
      type: 'question',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-amber-500 to-orange-600',
      options: [
        { text: 'NÃO', nextStep: 'bleeding_check', value: 'no' },
        { text: 'SIM', nextStep: 'group_c_d_classification', value: 'yes' }
      ]
    },

    bleeding_check: {
      id: 'bleeding_check',
      title: 'Pesquisar sangramento espontâneo',
      description: 'Avaliar sangramento, condições especiais, risco social',
      type: 'question',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-orange-500 to-red-600',
      options: [
        { text: 'NÃO', nextStep: 'group_a', value: 'no' },
        { text: 'SIM', nextStep: 'group_b', value: 'yes' }
      ]
    },

    group_c_d_classification: {
      id: 'group_c_d_classification',
      title: 'CLASSIFICAÇÃO - GRUPO C ou D',
      description: 'Determinar grau de gravidade',
      type: 'question',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-red-500 to-red-700',
      content: (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl border border-amber-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-amber-800 text-lg">GRUPO C - Sinais de alarme</h4>
            </div>
            <ul className="text-amber-700 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Dor abdominal intensa</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Vômitos persistentes</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Acúmulo de líquidos</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Hipotensão postural</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Hepatomegalia &gt; 2cm</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Sangramento de mucosa</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span>Letargia/irritabilidade</span>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-red-800 text-lg">GRUPO D - Dengue grave</h4>
            </div>
            <ul className="text-red-700 space-y-2">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Extravasamento grave de plasma</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Choque com taquicardia</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Sangramento grave</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Comprometimento de órgãos</span>
              </li>
            </ul>
          </div>
        </div>
      ),
      options: [
        { text: 'GRUPO C - Sinais de alarme', nextStep: 'group_c', value: 'group_c' },
        { text: 'GRUPO D - Dengue grave', nextStep: 'group_d', value: 'group_d' }
      ]
    },

    // GRUPO A
    group_a: {
      id: 'group_a',
      title: 'GRUPO A',
      description: 'Dengue sem sinais de alarme, sem comorbidades',
      type: 'group',
      group: 'A',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-700',
      content: (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-blue-800">Acompanhamento</h4>
            </div>
            <p className="text-blue-700 font-medium">Ambulatorial</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-blue-800">Exames</h4>
            </div>
            <p className="text-blue-700 font-medium">A critério médico</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-blue-800">Conduta</h4>
            </div>
            <p className="text-blue-700 font-medium">Hidratação oral</p>
          </div>
        </div>
      ),
      options: [
        { text: 'Orientar hidratação', nextStep: 'hydration_a', value: 'continue' }
      ]
    },

    hydration_a: {
      id: 'hydration_a',
      title: 'Hidratação Oral - Grupo A',
      description: 'Orientações específicas de hidratação',
      type: 'action',
      icon: <Droplets className="w-6 h-6" />,
      color: 'bg-blue-500',
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Adultos:</h4>
            <p className="text-blue-700 text-sm">60 ml/kg/dia (1/3 SRO + 2/3 líquidos caseiros)</p>
          </div>
          
          {patient.age < 18 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Crianças:</h4>
              <p className="text-blue-700 text-sm">Até 10kg: 100ml/kg/dia • 10-20kg: 150ml/kg/dia • &gt;20kg: 80ml/kg/dia</p>
            </div>
          )}

          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">IMPORTANTE:</h4>
            <p className="text-red-700 text-sm">Retornar se sinais de alarme ou no dia da melhora da febre. Entregar cartão de acompanhamento.</p>
          </div>
        </div>
      ),
      options: [
        { text: 'Finalizar - Alta ambulatorial', nextStep: 'end_group_a', value: 'finish' }
      ]
    },

    // GRUPO B
    group_b: {
      id: 'group_b',
      title: 'GRUPO B',
      description: 'Dengue com fatores de risco ou comorbidades',
      type: 'group',
      group: 'B',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-green-500',
      content: (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Acompanhamento:</h4>
            <p className="text-green-700 text-sm">Observação até resultado dos exames</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Exames:</h4>
            <p className="text-green-700 text-sm">Hemograma completo obrigatório</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Conduta:</h4>
            <p className="text-green-700 text-sm">Hidratação oral até resultado</p>
          </div>
        </div>
      ),
      options: [
        { text: 'Solicitar exames', nextStep: 'wait_labs_b', value: 'continue' }
      ]
    },

    wait_labs_b: {
      id: 'wait_labs_b',
      title: 'Aguardando Exames - Grupo B',
      description: 'Paciente em observação',
      type: 'wait_labs',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      requiresLabs: true,
      content: (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Status:</h4>
          <p className="text-yellow-700">• Hemograma completo solicitado</p>
          <p className="text-yellow-700">• Paciente em observação</p>
          <p className="text-yellow-700">• Manter hidratação oral</p>
        </div>
      ),
      options: [
        { text: 'Resultados disponíveis', nextStep: 'evaluate_labs_b', value: 'continue' }
      ]
    },

    evaluate_labs_b: {
      id: 'evaluate_labs_b',
      title: 'Avaliação dos Resultados - Grupo B',
      description: 'Avaliar resultados dos exames laboratoriais',
      type: 'action',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-green-500',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Avaliação dos Exames:</h4>
            <p className="text-green-700 text-sm">Verificar hemograma, hematócrito, plaquetas</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Conduta:</h4>
            <p className="text-yellow-700 text-sm">Se alterações significativas, reavaliar classificação</p>
          </div>
        </div>
      ),
      options: [
        { text: 'Manter Grupo B', nextStep: 'end_group_b', value: 'maintain' },
        { text: 'Reclassificar para Grupo C', nextStep: 'group_c', value: 'upgrade' }
      ]
    },

    end_group_b: {
      id: 'end_group_b',
      title: 'Conclusão - Grupo B',
      description: 'Finalização do atendimento',
      type: 'result',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Orientações finais:</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Retornar se sinais de alarme</li>
              <li>• Retornar no dia da melhora da febre</li>
              <li>• Manter hidratação adequada</li>
              <li>• Cartão de acompanhamento entregue</li>
            </ul>
          </div>
        </div>
      ),
      options: [
        { text: 'Finalizar', nextStep: 'end', value: 'finish' }
      ]
    },

    // GRUPO C
    group_c: {
      id: 'group_c',
      title: 'GRUPO C - Sinais de alarme',
      description: 'Internação obrigatória',
      type: 'group',
      group: 'C',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      content: (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Acompanhamento:</h4>
            <p className="text-yellow-700 text-sm">Internação - mínimo 48h</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Exames:</h4>
            <p className="text-yellow-700 text-sm">Hemograma, albumina, transaminases, RX tórax</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Conduta:</h4>
            <p className="text-yellow-700 text-sm">Reposição 10ml/kg SF 0,9% em 10min</p>
          </div>
        </div>
      ),
      options: [
        { text: 'Iniciar reposição volêmica', nextStep: 'treatment_c', value: 'continue' }
      ]
    },

    treatment_c: {
      id: 'treatment_c',
      title: 'Reposição Volêmica - Grupo C',
      description: '10ml/kg soro fisiológico em 10 minutos',
      type: 'action',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-yellow-500',
      requiresLabs: true,
      content: (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Tratamento iniciado:</h4>
          <p className="text-yellow-700">• Soro fisiológico 0,9% - 10ml/kg</p>
          <p className="text-yellow-700">• Administração em 10 minutos</p>
          <p className="text-yellow-700">• Reavaliação obrigatória em 1 hora</p>
          <p className="text-yellow-700">• Exames complementares solicitados</p>
        </div>
      ),
      options: [
        { text: 'Aguardar reavaliação (1h)', nextStep: 'wait_reevaluation_c', value: 'continue' }
      ]
    },

    wait_reevaluation_c: {
      id: 'wait_reevaluation_c',
      title: 'Aguardando Reavaliação - Grupo C',
      description: 'Paciente internado aguardando reavaliação após 1 hora',
      type: 'wait_labs',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      requiresLabs: true,
      content: (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Status:</h4>
          <p className="text-yellow-700">• Paciente internado</p>
          <p className="text-yellow-700">• Aguardando reavaliação clínica (1 hora)</p>
          <p className="text-yellow-700">• Aguardando resultados dos exames</p>
          <p className="text-yellow-700">• Monitoramento contínuo</p>
        </div>
      ),
      options: [
        { text: 'Reavaliação disponível', nextStep: 'reevaluation_c_1h', value: 'continue' }
      ]
    },

    // GRUPO D
    group_d: {
      id: 'group_d',
      title: 'GRUPO D - Dengue grave',
      description: 'UTI obrigatória',
      type: 'group',
      group: 'D',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-red-600',
      content: (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Acompanhamento:</h4>
            <p className="text-red-700 text-sm">UTI - mínimo 48h</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Exames:</h4>
            <p className="text-red-700 text-sm">Idem Grupo C + gasometria</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Conduta:</h4>
            <p className="text-red-700 text-sm">Reposição 20ml/kg SF 0,9% em 20min</p>
          </div>
        </div>
      ),
      options: [
        { text: 'Iniciar tratamento intensivo', nextStep: 'treatment_d', value: 'continue' }
      ]
    },

    treatment_d: {
      id: 'treatment_d',
      title: 'Tratamento Intensivo - Grupo D',
      description: '20ml/kg soro fisiológico em 20 minutos',
      type: 'action',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-red-600',
      requiresLabs: true,
      content: (
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">Tratamento intensivo iniciado:</h4>
          <p className="text-red-700">• Soro fisiológico 0,9% - 20ml/kg</p>
          <p className="text-red-700">• Administração em até 20 minutos</p>
          <p className="text-red-700">• UTI obrigatória</p>
          <p className="text-red-700">• Monitoramento contínuo</p>
          <p className="text-red-700">• Investigar hemorragia se necessário</p>
        </div>
      ),
      options: [
        { text: 'Aguardar evolução (UTI)', nextStep: 'wait_reevaluation_d', value: 'continue' }
      ]
    },

    wait_reevaluation_d: {
      id: 'wait_reevaluation_d',
      title: 'Aguardando Evolução - UTI',
      description: 'Paciente em UTI com monitoramento contínuo',
      type: 'wait_labs',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-red-600',
      requiresLabs: true,
      content: (
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">Status UTI:</h4>
          <p className="text-red-700">• Paciente em cuidados intensivos</p>
          <p className="text-red-700">• Monitoramento contínuo</p>
          <p className="text-red-700">• Reavaliação constante</p>
          <p className="text-red-700">• Aguardando estabilização</p>
        </div>
      ),
      options: [
        { text: 'Evolução disponível', nextStep: 'reevaluation_d', value: 'continue' }
      ]
    },

    reevaluation_c_1h: {
      id: 'reevaluation_c_1h',
      title: 'Reavaliação após 1h - Grupo C',
      description: 'Avaliação da resposta ao tratamento',
      type: 'action',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Verificar:</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Sinais vitais</li>
              <li>• Diurese</li>
              <li>• Melhora dos sintomas</li>
              <li>• Ausência de novos sinais de alarme</li>
            </ul>
          </div>
        </div>
      ),
      options: [
        { text: 'Melhora - Continuar tratamento', nextStep: 'end_group_c', value: 'improvement' },
        { text: 'Piora - Reclassificar Grupo D', nextStep: 'group_d', value: 'deterioration' }
      ]
    },

    end_group_c: {
      id: 'end_group_c',
      title: 'Conclusão - Grupo C',
      description: 'Finalização do atendimento hospitalar',
      type: 'result',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-yellow-500',
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Alta hospitalar:</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Manter hidratação oral</li>
              <li>• Seguimento ambulatorial</li>
              <li>• Orientações de retorno</li>
              <li>• Cartão de acompanhamento</li>
            </ul>
          </div>
        </div>
      ),
      options: [
        { text: 'Finalizar', nextStep: 'end', value: 'finish' }
      ]
    },

    reevaluation_d: {
      id: 'reevaluation_d',
      title: 'Reavaliação - Grupo D',
      description: 'Avaliação da evolução em UTI',
      type: 'action',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-500',
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Avaliação intensiva:</h4>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• Sinais vitais contínuos</li>
              <li>• Balanço hídrico</li>
              <li>• Função orgânica</li>
              <li>• Exames seriados</li>
            </ul>
          </div>
        </div>
      ),
      options: [
        { text: 'Estável - Continuar UTI', nextStep: 'end_group_d', value: 'stable' },
        { text: 'Instável - Intensificar', nextStep: 'end_group_d', value: 'unstable' }
      ]
    },

    end_group_d: {
      id: 'end_group_d',
      title: 'Conclusão - Grupo D',
      description: 'Finalização do tratamento intensivo',
      type: 'result',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-red-500',
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Evolução UTI:</h4>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• Monitorização contínua</li>
              <li>• Seguimento especializado</li>
              <li>• Critérios de alta rigorosos</li>
              <li>• Acompanhamento ambulatorial</li>
            </ul>
          </div>
        </div>
      ),
      options: [
        { text: 'Finalizar', nextStep: 'end', value: 'finish' }
      ]
    },

    end_group_a: {
      id: 'end_group_a',
      title: 'Alta Ambulatorial - Grupo A',
      description: 'Orientações para seguimento domiciliar',
      type: 'result',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      content: (
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800">Alta Ambulatorial</h3>
          <div className="bg-green-50 p-4 rounded-lg mt-4">
            <h4 className="font-semibold text-green-800 mb-2">Orientações:</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Retornar se sinais de alarme</li>
              <li>• Retornar no dia da melhora da febre</li>
              <li>• Manter hidratação adequada</li>
              <li>• Cartão de acompanhamento entregue</li>
            </ul>
          </div>
        </div>
      ),
      options: [
        { text: 'Finalizar', nextStep: 'end', value: 'finish' }
      ]
    },

    end: {
      id: 'end',
      title: 'Protocolo Finalizado',
      description: 'Atendimento concluído',
      type: 'result',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      content: (
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800">Protocolo Concluído!</h3>
          <p className="text-green-600 mt-2">Fluxograma oficial do Ministério da Saúde 2024</p>
        </div>
      ),
      options: []
    }
  }

  const handleAnswer = (nextStep: string, value?: string) => {
    const newAnswers = value ? { ...answers, [currentStep]: value } : answers
    const newHistory = [...history, currentStep]
    
    if (value) {
      setAnswers(newAnswers)
    }
    
    setHistory(newHistory)
    setCurrentStep(nextStep)
    
    const newProgress = calculateProgress(nextStep, newHistory)
    setProgress(newProgress)
    
    // Detectar grupo
    let group: 'A' | 'B' | 'C' | 'D' | undefined
    if (nextStep === 'group_a' || nextStep === 'hydration_a') group = 'A'
    else if (nextStep === 'group_b' || nextStep === 'wait_labs_b') group = 'B'
    else if (nextStep === 'group_c' || nextStep === 'treatment_c' || value === 'group_c') group = 'C'
    else if (nextStep === 'group_d' || nextStep === 'treatment_d' || value === 'group_d') group = 'D'
    
    // Atualizar estado
    onUpdate(patient.id, nextStep, newHistory, newAnswers, newProgress, group)
    
    // Completar se necessário
    if (nextStep === 'end' || steps[nextStep]?.requiresLabs) {
      if (steps[nextStep]?.requiresLabs) {
        setTimeout(() => onComplete(), 1000)
      } else {
        onComplete()
      }
    }
  }

  const goBack = () => {
    if (history.length > 0) {
      const previousStep = history[history.length - 1]
      const newHistory = history.slice(0, -1)
      setHistory(newHistory)
      setCurrentStep(previousStep)
      
      const newProgress = calculateProgress(previousStep, newHistory)
      setProgress(newProgress)
    }
  }

  const restart = () => {
    setCurrentStep('start')
    setHistory([])
    setAnswers({})
    setProgress(0)
    onUpdate(patient.id, 'start', [], {}, 0)
  }

  const step = steps[currentStep]

  // Verificação de segurança - se o step não existir, voltar para o início
  if (!step) {
    console.error(`Step '${currentStep}' não encontrado. Redirecionando para 'start'.`)
    setCurrentStep('start')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      
      {/* Premium Medical Header */}
      <div className="relative bg-white shadow-xl border-b border-slate-200/50 sticky top-0 z-50">
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
                  {patient.name}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    {patient.age} anos • {patient.medicalRecord}
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        
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
                <h3 className="font-bold text-slate-800">Progresso do Fluxograma</h3>
                <p className="text-sm text-slate-600">Protocolo Oficial MS 2024</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                {Math.round(progress)}%
              </span>
              {step.group && (
                <div className={clsx(
                  "px-3 py-1 rounded-xl text-sm font-bold border",
                  step.group === 'A' && "bg-blue-100 text-blue-800 border-blue-200",
                  step.group === 'B' && "bg-green-100 text-green-800 border-green-200",
                  step.group === 'C' && "bg-amber-100 text-amber-800 border-amber-200",
                  step.group === 'D' && "bg-red-100 text-red-800 border-red-200"
                )}>
                  GRUPO {step.group}
                </div>
              )}
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

        {/* Flowchart Step Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden"
          >
            {/* Card Header Gradient */}
            <div className="h-2 bg-gradient-to-r from-blue-600 via-slate-400 to-blue-600"></div>
            
            <div className="p-6 lg:p-8">
              {/* Step Header */}
              <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-6 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl opacity-30 scale-110 rounded-2xl" style={{ background: step.color }}></div>
                  <div className={clsx("relative p-4 rounded-2xl text-white shadow-2xl border border-white/20", step.color)}>
                    {step.icon}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                      {step.title}
                    </h2>
                    {step.group && (
                      <div className={clsx(
                        "inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold border shadow-lg mt-2 lg:mt-0",
                        step.group === 'A' && "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300",
                        step.group === 'B' && "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300",
                        step.group === 'C' && "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300",
                        step.group === 'D' && "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300"
                      )}>
                        <Shield className="w-4 h-4" />
                        <span>GRUPO {step.group}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-600 text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Step Content */}
              {step.content && (
                <div className="mb-8 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-6 border border-slate-200/50">
                  {step.content}
                </div>
              )}

              {/* Step Options */}
              {step.options && step.options.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    Escolha uma opção:
                  </h3>
                  
                  <div className="grid gap-4">
                    {step.options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswer(option.nextStep, option.value)}
                        className={clsx(
                          "group relative p-6 rounded-2xl text-left transition-all duration-300 border-2 hover:shadow-2xl overflow-hidden",
                          step.type === 'question' && "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200 text-blue-900",
                          step.type === 'group' && "bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200 text-green-900",
                          step.type === 'action' && "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:from-amber-100 hover:to-amber-200 text-amber-900",
                          step.type === 'result' && "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:from-slate-100 hover:to-slate-200 text-slate-900"
                        )}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        
                        <div className="relative flex items-center justify-between">
                          <span className="font-bold text-lg lg:text-xl pr-4">{option.text}</span>
                          <div className="flex-shrink-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <ChevronRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Premium Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl p-6 text-white shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-lg">Protocolo Oficial</p>
                <p className="text-blue-100">Ministério da Saúde - 2024</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Validado Clinicamente</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Interface Intuitiva</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DengueFlowchartComplete 