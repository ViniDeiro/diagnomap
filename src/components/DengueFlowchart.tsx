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
  Award
} from 'lucide-react'
import { clsx } from 'clsx'
import { Patient } from '@/types/patient'

interface FlowchartStep {
  id: string
  title: string
  description: string
  type: 'question' | 'action' | 'result' | 'group'
  options?: { text: string; nextStep: string; value?: string }[]
  group?: 'A' | 'B' | 'C' | 'D'
  icon?: React.ReactNode
  color?: string
  content?: React.ReactNode
}

interface DengueFlowchartProps {
  patient: Patient
  onComplete: () => void
  onUpdate: (patientId: string, currentStep: string, history: string[], answers: Record<string, string>, progress: number, group?: 'A' | 'B' | 'C' | 'D') => void
}

const DengueFlowchart: React.FC<DengueFlowchartProps> = ({ patient, onComplete, onUpdate }) => {
  const [currentStep, setCurrentStep] = useState(patient.flowchartState.currentStep || 'start')
  const [history, setHistory] = useState<string[]>(patient.flowchartState.history || [])
  const [answers, setAnswers] = useState<Record<string, string>>(patient.flowchartState.answers || {})
  const [progress, setProgress] = useState(patient.flowchartState.progress || 0)

  // Carregar estado do paciente na inicialização
  useEffect(() => {
    setCurrentStep(patient.flowchartState.currentStep || 'start')
    setHistory(patient.flowchartState.history || [])
    setAnswers(patient.flowchartState.answers || {})
    setProgress(patient.flowchartState.progress || 0)
  }, [patient])

  // Função utilitária para calcular o progresso baseado no caminho específico
  const calculateProgress = (currentStep: string, history: string[]): number => {
    const pathSteps = [...history, currentStep]
    
    // Determinar o tipo de caminho baseado nos steps visitados
    let expectedTotalSteps = 6 // Caminho mínimo (Grupo A)
    
    if (pathSteps.includes('group_b') || pathSteps.includes('reevaluation_1h')) {
      expectedTotalSteps = 8 // Grupo B básico
    } else if (pathSteps.includes('group_c_treatment') || pathSteps.includes('group_d_treatment')) {
      expectedTotalSteps = 10 // Grupos C/D mais complexos
    } else if (pathSteps.includes('intensive_care') || pathSteps.includes('bleeding_investigation')) {
      expectedTotalSteps = 12 // Casos mais complexos
    }
    
    // Se chegamos ao final, é 100%
    if (currentStep === 'end') {
      return 100
    }
    
    // Calcular progresso baseado no número de steps completados
    const completedSteps = pathSteps.length
    const progress = Math.min((completedSteps / expectedTotalSteps) * 100, 95) // Máximo 95% até chegar ao final
    
    return progress
  }

  const steps: Record<string, FlowchartStep> = {
    start: {
      id: 'start',
      title: 'Protocolo de Classificação de Risco - Dengue 2024',
      description: 'Relato de febre, usualmente entre dois e sete dias de duração, e duas ou mais das seguintes manifestações: náuseas; vômitos; exantema; mialgia; artralgia; cefaleia; dor retro-orbitária; petéquias; prova do laço positiva e leucopenia. Também pode ser considerado caso suspeito toda criança com quadro febril agudo, usualmente entre dois e sete dias de duração, e sem foco de infecção aparente. NOTIFICAR TODO CASO SUSPEITO DE DENGUE.',
      type: 'question',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-blue-600 to-slate-700',
      options: [
        { text: 'Iniciar Avaliação Clínica', nextStep: 'alarm_check', value: 'start' }
      ]
    },

    alarm_check: {
      id: 'alarm_check',
      title: 'Avaliação de Sinais de Alarme',
      description: 'Verificar se o paciente apresenta sinais de alarme ou gravidade que indiquem risco elevado',
      type: 'question',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-600',
      options: [
        { text: 'NÃO - Sem sinais de alarme', nextStep: 'bleeding_check', value: 'no' },
        { text: 'SIM - Presença de sinais de alarme', nextStep: 'group_c_d_classification', value: 'yes' }
      ]
    },

    bleeding_check: {
      id: 'bleeding_check',
      title: 'Avaliação de Fatores de Risco',
      description: 'Pesquisar sangramento espontâneo da pele ou induzido (prova do laço), condições clínicas especiais, risco social ou comorbidades',
      type: 'question',
      icon: <Activity className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      content: (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200/50">
          <h4 className="font-bold text-orange-800 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Condições Clínicas Especiais e/ou Risco Social ou Comorbidades:
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-orange-700 text-sm font-medium">Lactentes (&lt; 24 meses)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-orange-700 text-sm font-medium">Gestantes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-orange-700 text-sm font-medium">Adultos &gt; 65 anos</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-700 text-sm font-medium">Hipertensão arterial</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-700 text-sm font-medium">Diabetes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-700 text-sm font-medium">Doenças crônicas</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-amber-100 rounded-xl border border-amber-300">
            <p className="text-amber-800 text-sm font-medium">
              ⚠️ Estes pacientes podem apresentar evolução desfavorável e devem ter acompanhamento diferenciado.
            </p>
          </div>
        </div>
      ),
      options: [
        { text: 'NÃO - Baixo Risco', nextStep: 'group_a', value: 'no' },
        { text: 'SIM - Fatores de Risco Presentes', nextStep: 'group_b', value: 'yes' }
      ]
    },

    group_a: {
      id: 'group_a',
      title: 'CLASSIFICAÇÃO GRUPO A',
      description: 'Dengue sem sinais de alarme, sem sangramento espontâneo, sem risco social e sem comorbidades.',
      type: 'group',
      group: 'A',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-600',
      content: (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-3">
                <Heart className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-blue-800">Conduta</h4>
              </div>
              <p className="text-blue-700 font-medium">Hidratação oral</p>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200">
              <div className="flex items-center space-x-3 mb-3">
                <Stethoscope className="w-5 h-5 text-cyan-600" />
                <h4 className="font-bold text-cyan-800">Acompanhamento</h4>
              </div>
              <p className="text-cyan-700 font-medium">Ambulatorial</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-3">
                <Activity className="w-5 h-5 text-slate-600" />
                <h4 className="font-bold text-slate-800">Exames</h4>
              </div>
              <p className="text-slate-700 font-medium">A critério médico</p>
            </div>
          </div>
        </div>
      ),
      options: [
        { text: 'Definir Dosagem de Hidratação', nextStep: 'age_check', value: 'continue' }
      ]
    },

    group_b: {
      id: 'group_b',
      title: 'CLASSIFICAÇÃO GRUPO B',
      description: 'Dengue sem sinais de alarme, com sangramento espontâneo, risco social ou comorbidades.',
      type: 'group',
      group: 'B',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-emerald-500 to-green-600',
      content: (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
              <div className="flex items-center space-x-3 mb-3">
                <Heart className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-emerald-800">Conduta</h4>
              </div>
              <p className="text-emerald-700 font-medium">Hidratação oral até resultado dos exames</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="w-5 h-5 text-green-600" />
                <h4 className="font-bold text-green-800">Acompanhamento</h4>
              </div>
              <p className="text-green-700 font-medium">Observação até resultado e reavaliação</p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-slate-50 p-6 rounded-xl border border-emerald-200">
              <div className="flex items-center space-x-3 mb-3">
                <Target className="w-5 h-5 text-slate-600" />
                <h4 className="font-bold text-slate-800">Exames</h4>
              </div>
              <p className="text-slate-700 font-medium">Hemograma completo obrigatório</p>
            </div>
          </div>
        </div>
      ),
      options: [
        { text: 'Aguardar Resultados e Reavaliar', nextStep: 'reevaluation_1h', value: 'continue' }
      ]
    },

    group_c_d: {
      id: 'group_c_d',
      title: 'CLASSIFICAÇÃO GRUPOS C/D - Sinais de Alarme',
      description: 'Paciente apresenta sinais de alarme ou gravidade que requerem atenção médica especializada',
      type: 'question',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'from-red-500 to-red-700',
      content: (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-300">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <h4 className="font-bold text-amber-800">GRUPO C - Sinais de Alarme</h4>
              </div>
              <div className="space-y-2">
                {[
                  'Dor abdominal intensa',
                  'Vômitos persistentes',
                  'Acúmulo de líquidos',
                  'Hipotensão postural',
                  'Hepatomegalia',
                  'Letargia ou irritabilidade'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-amber-700 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-300">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-red-600" />
                <h4 className="font-bold text-red-800">GRUPO D - Dengue Grave</h4>
              </div>
              <div className="space-y-2">
                {[
                  'Extravasamento grave de plasma',
                  'Sangramento grave',
                  'Comprometimento grave de órgãos'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span className="text-red-700 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),
      options: [
        { text: 'GRUPO C - Sinais de Alarme', nextStep: 'group_c_treatment', value: 'group_c' },
        { text: 'GRUPO D - Dengue Grave', nextStep: 'group_d_treatment', value: 'group_d' }
      ]
    },

    group_c_treatment: {
      id: 'group_c_treatment',
      title: 'Protocolo de Tratamento - Grupo C',
      description: 'Manejo clínico para pacientes com sinais de alarme',
      type: 'action',
      icon: <Activity className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-600',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-300">
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="w-5 h-5 text-amber-600" />
              <h4 className="font-bold text-amber-800">Conduta Imediata</h4>
            </div>
            <p className="text-amber-700 font-medium">Iniciar reposição volêmica imediata (10 ml/kg de soro fisiológico 0,9% EV), nos primeiros 10 minutos</p>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-300">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <h4 className="font-bold text-orange-800">Acompanhamento</h4>
            </div>
            <p className="text-orange-700 font-medium">Em leito de internação até estabilização - mínimo de 48h</p>
          </div>
        </div>
      ),
      options: [
        { text: 'Programar Reavaliação em 1 Hora', nextStep: 'reevaluation_c', value: 'continue' }
      ]
    },

    group_d_treatment: {
      id: 'group_d_treatment',
      title: 'Protocolo de Emergência - Grupo D',
      description: 'Manejo crítico para pacientes com dengue grave',
      type: 'action',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'from-red-600 to-red-800',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-xl border border-red-400">
            <div className="flex items-center space-x-3 mb-3">
              <Zap className="w-5 h-5 text-red-600" />
              <h4 className="font-bold text-red-800">Conduta de Emergência</h4>
            </div>
            <p className="text-red-700 font-medium">Reposição volêmica imediata (20 ml/kg de soro fisiológico em até 20 minutos)</p>
          </div>
          <div className="bg-gradient-to-r from-red-100 to-red-50 p-6 rounded-xl border border-red-400">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-5 h-5 text-red-600" />
              <h4 className="font-bold text-red-800">Cuidados Intensivos</h4>
            </div>
            <p className="text-red-700 font-medium">Em leito de UTI até estabilização - mínimo de 48h</p>
          </div>
        </div>
      ),
      options: [
        { text: 'Programar Reavaliação em 1 Hora', nextStep: 'reevaluation_d', value: 'continue' }
      ]
    },

    age_check: {
      id: 'age_check',
      title: 'Definição de Dosagem por Idade',
      description: 'Determinar a dosagem apropriada de hidratação oral baseada na faixa etária do paciente',
      type: 'question',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-600',
      options: [
        { text: 'Paciente Adulto', nextStep: 'adult_dosage', value: 'adult' },
        { text: 'Paciente Pediátrico (< 13 anos)', nextStep: 'child_dosage', value: 'child' }
      ]
    },

    adult_dosage: {
      id: 'adult_dosage',
      title: 'Protocolo de Hidratação - Adultos',
      description: 'Esquema de hidratação oral para pacientes adultos do Grupo A',
      type: 'result',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-600',
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-6 h-6 text-blue-600" />
              <h4 className="font-bold text-blue-800">Dosagem para Adultos</h4>
            </div>
            <p className="text-blue-700 font-medium text-lg">60 ml/kg/dia</p>
            <p className="text-blue-600 text-sm mt-2">Sendo 1/3 com sais de reidratação oral</p>
          </div>
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200">
            <div className="flex items-center space-x-3 mb-4">
              <Award className="w-6 h-6 text-cyan-600" />
              <h4 className="font-bold text-cyan-800">Orientações Complementares</h4>
            </div>
            <p className="text-cyan-700 font-medium">Para os 2/3 restantes, orientar ingestão de líquidos caseiros (água, chás, água de coco)</p>
          </div>
        </div>
      ),
      options: [
        { text: 'Finalizar Consulta', nextStep: 'end', value: 'finish' }
      ]
    },

    child_dosage: {
      id: 'child_dosage',
      title: 'Protocolo de Hidratação - Pediátrico',
      description: 'Esquema de hidratação oral para pacientes pediátricos do Grupo A',
      type: 'result',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-600',
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200 text-center">
              <h4 className="font-bold text-blue-800 mb-2">Até 10 kg</h4>
              <p className="text-2xl font-bold text-blue-700">100 ml/kg/dia</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-200 text-center">
              <h4 className="font-bold text-cyan-800 mb-2">10-20 kg</h4>
              <p className="text-2xl font-bold text-cyan-700">150 ml/kg/dia</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-xl border border-blue-200 text-center">
              <h4 className="font-bold text-slate-800 mb-2">Acima de 20 kg</h4>
              <p className="text-2xl font-bold text-slate-700">80 ml/kg/dia</p>
            </div>
          </div>
        </div>
      ),
      options: [
        { text: 'Finalizar Consulta', nextStep: 'end', value: 'finish' }
      ]
    },

    reevaluation_1h: {
      id: 'reevaluation_1h',
      title: 'Reavaliação após 1 hora',
      description: 'Reavaliação clínica e laboratorial',
      type: 'question',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-purple-500',
      options: [
        { text: 'Melhora clínica e de hematócrito', nextStep: 'improvement', value: 'improved' },
        { text: 'Sem melhora', nextStep: 'no_improvement', value: 'no_improvement' }
      ]
    },

    reevaluation_c: {
      id: 'reevaluation_c',
      title: 'Reavaliação Grupo C',
      description: 'Avaliar resposta ao tratamento',
      type: 'question',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      options: [
        { text: 'Hematócrito normal', nextStep: 'improvement', value: 'normal' },
        { text: 'Hematócrito alto', nextStep: 'hematocrit_high', value: 'high' }
      ]
    },

    reevaluation_d: {
      id: 'reevaluation_d',
      title: 'Reavaliação Grupo D',
      description: 'Avaliar resposta ao tratamento de emergência',
      type: 'question',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-red-600',
      options: [
        { text: 'Melhora clínica', nextStep: 'improvement', value: 'improved' },
        { text: 'Sem melhora', nextStep: 'intensive_care', value: 'no_improvement' }
      ]
    },

    improvement: {
      id: 'improvement',
      title: 'Melhora Clínica',
      description: 'Paciente apresentou melhora',
      type: 'action',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      content: (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">Conduta:</h4>
          <p className="text-green-700 text-sm">Retornar para hidratação oral e continuar acompanhamento</p>
        </div>
      ),
      options: [
        { text: 'Avaliar critérios de alta', nextStep: 'discharge', value: 'discharge' }
      ]
    },

    no_improvement: {
      id: 'no_improvement',
      title: 'Sem Melhora',
      description: 'Paciente não apresentou melhora esperada',
      type: 'action',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-orange-500',
      content: (
        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-semibold text-orange-800 mb-2">Conduta:</h4>
          <p className="text-orange-700 text-sm">Reavaliação em 2 horas e considerar investigação adicional</p>
        </div>
      ),
      options: [
        { text: 'Reavaliação após 2 horas', nextStep: 'reevaluation_2h', value: 'continue' }
      ]
    },

    hematocrit_high: {
      id: 'hematocrit_high',
      title: 'Hematócrito Alto',
      description: 'Hematócrito permanece elevado',
      type: 'action',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-orange-500',
      content: (
        <div className="bg-orange-50 p-4 rounded-lg">
          <h4 className="font-semibold text-orange-800 mb-2">Conduta:</h4>
          <p className="text-orange-700 text-sm">Manter hidratação e reavaliação em 2 horas</p>
        </div>
      ),
      options: [
        { text: 'Reavaliação após 2 horas', nextStep: 'reevaluation_2h', value: 'continue' }
      ]
    },

    reevaluation_2h: {
      id: 'reevaluation_2h',
      title: 'Reavaliação após 2 horas',
      description: 'Segunda reavaliação clínica',
      type: 'question',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-purple-500',
      options: [
        { text: 'Melhora clínica', nextStep: 'improvement', value: 'improved' },
        { text: 'Choque persistente', nextStep: 'shock_management', value: 'shock' }
      ]
    },

    shock_management: {
      id: 'shock_management',
      title: 'Manejo do Choque',
      description: 'Avaliação do hematócrito para conduta',
      type: 'question',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-red-500',
      options: [
        { text: 'Hematócrito em elevação', nextStep: 'albumin_therapy', value: 'elevation' },
        { text: 'Hematócrito em queda', nextStep: 'bleeding_investigation', value: 'drop' }
      ]
    },

    albumin_therapy: {
      id: 'albumin_therapy',
      title: 'Terapia com Albumina',
      description: 'Administração de albumina para choque com hematócrito elevado',
      type: 'action',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-yellow-500',
      content: (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Conduta:</h4>
          <p className="text-yellow-700 text-sm">Albumina 0,5-1 g/kg, preparar solução a 5% e infundir 10 ml/kg/hora</p>
        </div>
      ),
      options: [
        { text: 'Avaliar resposta', nextStep: 'albumin_response', value: 'evaluate' }
      ]
    },

    albumin_response: {
      id: 'albumin_response',
      title: 'Resposta à Albumina',
      description: 'Avaliar se houve resolução do choque',
      type: 'question',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      options: [
        { text: 'Choque resolvido', nextStep: 'discharge', value: 'resolved' },
        { text: 'Choque persiste', nextStep: 'bleeding_investigation', value: 'persists' }
      ]
    },

    bleeding_investigation: {
      id: 'bleeding_investigation',
      title: 'Investigação de Sangramento',
      description: 'Investigar hemorragia e coagulopatia de consumo',
      type: 'action',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-red-600',
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Investigação:</h4>
            <p className="text-red-700 text-sm">Investigar hemorragia interna/oculta</p>
            <p className="text-red-700 text-sm">Considerar transfusão, Vitamina K e crioprecipitado</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Cuidados Intensivos:</h4>
            <p className="text-red-700 text-sm">Monitoramento em UTI com suporte hemodinâmico</p>
          </div>
        </div>
      ),
      options: [
        { text: 'Continuar cuidados intensivos', nextStep: 'intensive_care', value: 'continue' }
      ]
    },

    intensive_care: {
      id: 'intensive_care',
      title: 'Cuidados Intensivos',
      description: 'Suporte avançado em UTI',
      type: 'action',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-red-600',
      content: (
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold text-red-800 mb-2">Cuidados:</h4>
          <p className="text-red-700 text-sm">Monitoramento contínuo com suporte ventilatório e hemodinâmico</p>
        </div>
      ),
      options: [
        { text: 'Avaliar evolução', nextStep: 'discharge', value: 'evolve' }
      ]
    },

    discharge: {
      id: 'discharge',
      title: 'Critérios de Alta',
      description: 'Avaliar se paciente preenche critérios para alta hospitalar',
      type: 'action',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Critérios de Alta:</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Ausência de febre por 24 horas</li>
              <li>• Melhora do quadro clínico</li>
              <li>• Hematócrito estável por 24 horas</li>
              <li>• Plaquetas em elevação</li>
            </ul>
          </div>
        </div>
      ),
      options: [
        { text: 'Finalizar consulta', nextStep: 'end', value: 'finish' }
      ]
    },

    end: {
      id: 'end',
      title: 'Consulta Finalizada',
      description: 'Fluxograma concluído com sucesso',
      type: 'result',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      content: (
        <div className="text-center">
          <div className="mb-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-800">Consulta Finalizada!</h3>
            <p className="text-green-600 mt-2">O protocolo de atendimento foi concluído com sucesso.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Lembrete:</h4>
            <p className="text-green-700 text-sm">Sempre notificar casos suspeitos de dengue conforme orientação epidemiológica local.</p>
          </div>
        </div>
      ),
      options: [
        { text: 'Reiniciar fluxograma', nextStep: 'start', value: 'restart' }
      ]
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
    
    // Detectar grupo baseado no próximo passo
    let group: 'A' | 'B' | 'C' | 'D' | undefined
    if (nextStep === 'group_a' || nextStep === 'age_check') group = 'A'
    else if (nextStep === 'group_b' || nextStep === 'reevaluation_1h') group = 'B'
    else if (nextStep === 'group_c_treatment' || value === 'group_c') group = 'C'
    else if (nextStep === 'group_d_treatment' || value === 'group_d') group = 'D'
    
    // Atualizar estado do paciente
    onUpdate(patient.id, nextStep, newHistory, newAnswers, newProgress, group)
    
    // Se chegou ao fim, completar
    if (nextStep === 'end') {
      onComplete()
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
  }

  const step = steps[currentStep]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-6xl mx-auto px-8 py-12">
        
        {/* Premium Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-12 bg-gradient-to-b from-blue-600 to-slate-700 rounded-full"></div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Progresso do Fluxograma</h3>
                <p className="text-sm text-slate-600">Paciente: {patient.name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-slate-800">{Math.round(progress)}%</span>
              <p className="text-sm text-slate-600">Completo</p>
            </div>
          </div>
          
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-slate-700 rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-between items-center mb-8"
        >
          <motion.button
            onClick={goBack}
            disabled={history.length === 0}
            className={clsx(
              "flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold transition-all duration-200",
              history.length > 0
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-lg hover:shadow-xl"
                : "bg-slate-50 text-slate-400 cursor-not-allowed"
            )}
            whileHover={history.length > 0 ? { scale: 1.02 } : {}}
            whileTap={history.length > 0 ? { scale: 0.98 } : {}}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Etapa Anterior</span>
          </motion.button>

          <motion.button
            onClick={restart}
            className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Target className="w-5 h-5" />
            <span>Reiniciar Protocolo</span>
          </motion.button>
        </motion.div>

        {/* Main Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden"
          >
            {/* Gradient Header */}
            <div className={`h-2 bg-gradient-to-r ${step.color}`}></div>
            
            <div className="p-8">
              {/* Step Header */}
              <div className="flex items-start space-x-6 mb-8">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${step.color} rounded-2xl blur-lg opacity-30`}></div>
                  <div className={`relative w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                    {step.icon}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">{step.title}</h2>
                  {step.group && (
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={clsx(
                        "inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl",
                        step.group === 'A' && "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200",
                        step.group === 'B' && "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200",
                        step.group === 'C' && "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200",
                        step.group === 'D' && "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-200"
                      )}>
                        <Award className="w-4 h-4 mr-2" />
                        CLASSIFICAÇÃO GRUPO {step.group}
                      </span>
                    </div>
                  )}
                  <p className="text-slate-600 text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Step Content */}
              {step.content && (
                <div className="mb-8">
                  {step.content}
                </div>
              )}

              {/* Action Options */}
              {step.options && (
                <div className="space-y-4">
                  {step.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(option.nextStep, option.value)}
                      className={clsx(
                        "w-full p-6 rounded-xl text-left transition-all duration-200 border-2 group",
                        "hover:shadow-xl active:scale-[0.98]",
                        step.type === 'question' 
                          ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:from-blue-100 hover:to-cyan-100 hover:border-blue-300"
                          : step.type === 'action' || step.type === 'result'
                            ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 hover:from-emerald-100 hover:to-green-100 hover:border-emerald-300"
                            : "bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 hover:from-slate-100 hover:to-gray-100 hover:border-slate-300"
                      )}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={clsx(
                          "font-semibold text-lg",
                          step.type === 'question' ? "text-blue-800" :
                          step.type === 'action' || step.type === 'result' ? "text-emerald-800" :
                          "text-slate-800"
                        )}>
                          {option.text}
                        </span>
                        <ChevronRight className={clsx(
                          "w-6 h-6 transition-transform group-hover:translate-x-1",
                          step.type === 'question' ? "text-blue-600" :
                          step.type === 'action' || step.type === 'result' ? "text-emerald-600" :
                          "text-slate-600"
                        )} />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Professional Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-slate-800 to-blue-800 text-white px-8 py-6 rounded-2xl shadow-xl inline-block">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Shield className="w-5 h-5" />
              <span className="font-bold">DiagnoMap Pro - Sistema Médico</span>
              <Shield className="w-5 h-5" />
            </div>
            <p className="text-slate-300 text-sm">
              Baseado no protocolo oficial do Ministério da Saúde - 2024 | Versão 1.0.0
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DengueFlowchart 