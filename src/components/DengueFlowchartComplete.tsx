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
  RotateCcw,
  FileText
} from 'lucide-react'
import { clsx } from 'clsx'
import { Patient } from '@/types/patient'
import { patientService } from '@/services/patientService'

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
  onViewPrescriptions?: (patient: Patient) => void
  onViewReport?: (patient: Patient) => void
}

const DengueFlowchartComplete: React.FC<DengueFlowchartProps> = ({ patient, onComplete, onUpdate, onBack, onViewPrescriptions, onViewReport }) => {
  const [currentStep, setCurrentStep] = useState(patient.flowchartState.currentStep || 'start')
  const [history, setHistory] = useState<string[]>(patient.flowchartState.history || [])
  const [answers, setAnswers] = useState<Record<string, string>>(patient.flowchartState.answers || {})
  const [progress, setProgress] = useState(patient.flowchartState.progress || 0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Recarregar estado do paciente quando houver mudanças
  useEffect(() => {
    const flowchartState = patient.flowchartState
    setCurrentStep(flowchartState.currentStep || 'start')
    setHistory(flowchartState.history || [])
    setAnswers(flowchartState.answers || {})
    setProgress(flowchartState.progress || 0)
  }, [patient.id, patient.flowchartState])

  // Função utilitária para calcular o progresso baseado no caminho específico
  const calculateProgress = (currentStep: string, history: string[]): number => {
    const pathSteps = [...history, currentStep]
    
    // Determinar o tipo de caminho baseado nos steps visitados
    let expectedTotalSteps = 6 // Caminho mínimo (Grupo A)
    
    if (pathSteps.includes('group_b') || pathSteps.includes('wait_labs_b')) {
      expectedTotalSteps = 8 // Grupo B básico
    } else if (pathSteps.includes('group_c') || pathSteps.includes('treatment_c')) {
      expectedTotalSteps = 10 // Grupos C mais complexos
    } else if (pathSteps.includes('group_d') || pathSteps.includes('treatment_d')) {
      expectedTotalSteps = 12 // Grupo D mais complexo
    } else if (pathSteps.includes('wait_reevaluation_c') || pathSteps.includes('wait_reevaluation_d')) {
      expectedTotalSteps = 14 // Casos com reavaliações
    }
    
    // Se chegamos ao final, é 100%
    if (currentStep === 'end') {
      return 100
    }
    
    // Calcular progresso baseado no número de steps completados
    const completedSteps = pathSteps.length
    const progress = Math.min((completedSteps / expectedTotalSteps) * 100, 95) // Máximo 95% até chegar ao final
    
    return Math.round(progress)
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
      title: 'Avaliação de Sinais de Alarme e Gravidade',
      description: 'Selecione todos os sinais de alarme e gravidade presentes no paciente',
      type: 'question',
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-amber-500 to-red-600',
      content: (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Grupo C - Sinais de Alarme */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <h4 className="font-bold text-amber-800">SINAIS DE ALARME</h4>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'dor_abdominal', label: 'Dor abdominal intensa' },
                  { id: 'vomitos_persistentes', label: 'Vômitos persistentes' },
                  { id: 'acumulo_liquidos', label: 'Acúmulo de líquidos' },
                  { id: 'hipotensao_postural', label: 'Hipotensão postural' },
                  { id: 'hepatomegalia', label: 'Hepatomegalia > 2cm' },
                  { id: 'sangramento_mucosa', label: 'Sangramento de mucosa' },
                  { id: 'letargia_irritabilidade', label: 'Letargia/irritabilidade' }
                ].map((sinal) => (
                  <label key={sinal.id} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-amber-600 bg-white border-amber-300 rounded focus:ring-amber-500 focus:ring-2"
                      onChange={(e) => {
                        let currentAnswers: { grupoC: string[], grupoD: string[] } = { grupoC: [], grupoD: [] }
                        if (answers.alarm_check) {
                          try {
                            // Verificar se é um JSON válido
                            if (answers.alarm_check.startsWith('{')) {
                              currentAnswers = JSON.parse(answers.alarm_check)
                            }
                          } catch (error) {
                            console.warn('Erro ao parsear alarm_check, usando valor padrão:', error)
                          }
                        }
                        
                        if (e.target.checked) {
                          currentAnswers.grupoC = [...(currentAnswers.grupoC || []), sinal.id]
                        } else {
                          currentAnswers.grupoC = (currentAnswers.grupoC || []).filter((id: string) => id !== sinal.id)
                        }
                        setAnswers(prev => ({ ...prev, alarm_check: JSON.stringify(currentAnswers) }))
                      }}
                    />
                    <span className="text-amber-700 font-medium group-hover:text-amber-800 transition-colors">
                      {sinal.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Grupo D - Sinais de Gravidade */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-400">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <h4 className="font-bold text-red-800">SINAIS DE GRAVIDADE</h4>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'extravasamento_plasma', label: 'Extravasamento grave de plasma' },
                  { id: 'choque_taquicardia', label: 'Choque com taquicardia' },
                  { id: 'sangramento_grave', label: 'Sangramento grave' },
                  { id: 'comprometimento_orgaos', label: 'Comprometimento de órgãos' }
                ].map((sinal) => (
                  <label key={sinal.id} className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-red-600 bg-white border-red-300 rounded focus:ring-red-500 focus:ring-2"
                      onChange={(e) => {
                        let currentAnswers: { grupoC: string[], grupoD: string[] } = { grupoC: [], grupoD: [] }
                        if (answers.alarm_check) {
                          try {
                            // Verificar se é um JSON válido
                            if (answers.alarm_check.startsWith('{')) {
                              currentAnswers = JSON.parse(answers.alarm_check)
                            }
                          } catch (error) {
                            console.warn('Erro ao parsear alarm_check, usando valor padrão:', error)
                          }
                        }
                        
                        if (e.target.checked) {
                          currentAnswers.grupoD = [...(currentAnswers.grupoD || []), sinal.id]
                        } else {
                          currentAnswers.grupoD = (currentAnswers.grupoD || []).filter((id: string) => id !== sinal.id)
                        }
                        setAnswers(prev => ({ ...prev, alarm_check: JSON.stringify(currentAnswers) }))
                      }}
                    />
                    <span className="text-red-700 font-medium group-hover:text-red-800 transition-colors">
                      {sinal.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <h5 className="font-semibold text-blue-800">Critério de Classificação</h5>
            </div>
            <p className="text-blue-700 text-sm">
              <strong>Grupo D:</strong> Presença de qualquer sinal de gravidade<br/>
              <strong>Grupo C:</strong> Presença apenas de sinais de alarme (sem sinais de gravidade)<br/>
              <strong>Grupo A/B:</strong> Ausência de sinais de alarme e gravidade
            </p>
          </div>
          
          {/* Mostrar status da seleção */}
          {(() => {
            let classificationData = { grupoC: [], grupoD: [] }
            if (answers.alarm_check) {
              try {
                if (answers.alarm_check.startsWith('{')) {
                  classificationData = JSON.parse(answers.alarm_check)
                }
              } catch (error) {
                console.warn('Erro ao parsear alarm_check para exibição:', error)
              }
            }
            const hasGrupoD = classificationData.grupoD && classificationData.grupoD.length > 0
            const hasGrupoC = classificationData.grupoC && classificationData.grupoC.length > 0
            
            if (hasGrupoD) {
              return (
                <div className="bg-red-100 border border-red-300 rounded-xl p-4 flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="font-bold text-red-800">Classificação: GRUPO D</p>
                    <p className="text-red-700 text-sm">Sinais de gravidade detectados - Requer cuidados intensivos</p>
                  </div>
                </div>
              )
            } else if (hasGrupoC) {
              return (
                <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-bold text-amber-800">Classificação: GRUPO C</p>
                    <p className="text-amber-700 text-sm">Sinais de alarme presentes - Requer internação</p>
                  </div>
                </div>
              )
            } else {
              return (
                <div className="bg-green-100 border border-green-300 rounded-xl p-4 flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-bold text-green-800">Classificação: GRUPO A ou B</p>
                    <p className="text-green-700 text-sm">Sem sinais de alarme - Continuar avaliação</p>
                  </div>
                </div>
              )
            }
          })()}
        </div>
      ),
      options: [
        { text: 'Confirmar Avaliação', nextStep: 'auto_classify_alarm', value: 'classify' }
      ]
    },

    auto_classify_alarm: {
      id: 'auto_classify_alarm',
      title: 'Processando Classificação...',
      description: 'Determinando grupo baseado nos sinais selecionados',
      type: 'action',
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-700',
      content: (
        <div className="text-center py-8">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Analisando sinais clínicos...</p>
        </div>
      ),
      options: [] // Será determinado automaticamente
    },

    bleeding_check: {
      id: 'bleeding_check',
      title: 'Avaliação de Fatores de Risco',
      description: 'Pesquisar sangramento espontâneo da pele ou induzido (prova do laço), condições clínicas especiais, risco social ou comorbidades',
      type: 'question',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      content: (
        <div className="space-y-6">
          {/* Sangramento */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-200">
            <h4 className="font-bold text-red-800 mb-4 flex items-center">
              <Droplets className="w-5 h-5 mr-2" />
              Sangramento Espontâneo ou Induzido
            </h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  id="sangramento_espontaneo"
                  className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                  onChange={(e) => {
                    const checkbox = e.target as HTMLInputElement
                    if (checkbox.checked) {
                      checkbox.setAttribute('data-checked', 'true')
                    } else {
                      checkbox.removeAttribute('data-checked')
                    }
                  }}
                />
                <span className="text-red-700 font-medium">Sangramento espontâneo da pele</span>
              </label>
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="prova_laco"
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-red-700 font-medium">Prova do laço positiva</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    // Criar e mostrar modal
                    const modal = document.createElement('div')
                    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4'
                    modal.innerHTML = `
                      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div class="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                              <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                              </div>
                              <div>
                                <h2 class="text-xl font-bold">Como Realizar a Prova do Laço</h2>
                                <p class="text-red-100 text-sm">Procedimento técnico padronizado</p>
                              </div>
                            </div>
                            <button 
                              onclick="this.closest('.fixed').remove()"
                              class="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-colors duration-200"
                            >
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <div class="p-6 space-y-6">
                          <div class="rounded-xl overflow-hidden border border-slate-200">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/BP_cuff_circumference.svg/640px-BP_cuff_circumference.svg.png" alt="Prova do laço - posicionamento do manguito" class="w-full h-auto" />
                          </div>
                          <div class="bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <h3 class="font-bold text-blue-800 mb-3 flex items-center">
                              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              Procedimento Passo a Passo
                            </h3>
                            <div class="space-y-3 text-blue-700">
                              <div class="flex items-start space-x-3">
                                <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">1</div>
                                <p><strong>Verificar a PA:</strong> Medir pressão arterial com paciente deitado ou sentado</p>
                              </div>
                              <div class="flex items-start space-x-3">
                                <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">2</div>
                                <p><strong>Calcular valor médio:</strong> (PA sistólica + PA diastólica) ÷ 2</p>
                              </div>
                              <div class="flex items-start space-x-3">
                                <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">3</div>
                                <p><strong>Insuflar manguito:</strong> Até o valor médio calculado. Ex.: PA 120×80 → insuflar até 100 mmHg</p>
                              </div>
                              <div class="flex items-start space-x-3">
                                <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">4</div>
                                <p><strong>Manter pressão:</strong> 5 minutos (adultos) ou 3 minutos (crianças)</p>
                              </div>
                              <div class="flex items-start space-x-3">
                                <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">5</div>
                                <p><strong>Desenhar quadrado:</strong> 2,5 cm no antebraço (ou área ao redor da falange distal do polegar)</p>
                              </div>
                              <div class="flex items-start space-x-3">
                                <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">6</div>
                                <p><strong>Contar petéquias:</strong> Número de micro petéquias no quadrado desenhado</p>
                              </div>
                            </div>
                          </div>
                          
                          <div class="grid md:grid-cols-2 gap-4">
                            <div class="bg-green-50 p-4 rounded-xl border border-green-200">
                              <h4 class="font-bold text-green-800 mb-2 flex items-center">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Resultado Positivo
                              </h4>
                              <div class="space-y-1 text-green-700 text-sm">
                                <p>• <strong>Adultos:</strong> ≥ 20 petéquias</p>
                                <p>• <strong>Crianças:</strong> ≥ 10 petéquias</p>
                              </div>
                            </div>
                            
                            <div class="bg-amber-50 p-4 rounded-xl border border-amber-200">
                              <h4 class="font-bold text-amber-800 mb-2 flex items-center">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                </svg>
                                Observação
                              </h4>
                              <div class="space-y-2 text-amber-700 text-sm">
                                <p>• Retirar o manguito imediatamente se o paciente apresentar dor, dormência ou palidez no braço</p>
                                <p>• Interromper se aparecerem micro petéquias ou equimoses antes do tempo previsto</p>
                                <p>• Cautela em plaquetopenia severa (plaquetas &lt; 20.000/mm³): risco de sangramento local</p>
                                <p>• Resultado positivo reforça diagnóstico de dengue com manifestações hemorrágicas, mas deve ser interpretado no contexto clínico e laboratorial</p>
                              </div>

                          </div>
                          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <h4 class="font-bold text-slate-800 mb-2">Resumo rápido</h4>
                            <ol class="list-decimal list-inside text-slate-700 space-y-1">
                              <li>Medir PA</li>
                              <li>Inflar o manguito na média entre PAS e PAD</li>
                              <li>Manter 5 min (adulto) / 3 min (criança)</li>
                              <li>Soltar e esperar 1 min</li>
                              <li>Delimitar 2,5 × 2,5 cm no antebraço</li>
                              <li>Contar petéquias</li>
                              <li>≥20 (adulto) ou ≥10 (criança) → positivo</li>
                            </ol>
                          </div>
                            </div>
                          </div>
                        </div>
                        
                        <div class="border-t border-slate-200 p-4">
                          <button 
                            onclick="this.closest('.fixed').remove()"
                            class="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200"
                          >
                            Entendi - Fechar
                          </button>
                        </div>
                      </div>
                    `
                    document.body.appendChild(modal)
                  }}
                  className="ml-2 p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  title="Como realizar a prova do laço"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Condições Clínicas */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border border-orange-200">
            <h4 className="font-bold text-orange-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Condições Clínicas Especiais e/ou Risco Social ou Comorbidades
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="lactentes"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-orange-700 font-medium">Lactentes (&lt; 24 meses)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="gestantes"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-orange-700 font-medium">Gestantes</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="idosos"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-orange-700 font-medium">Adultos &gt; 65 anos</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="hipertensao"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-orange-700 font-medium">Hipertensão arterial</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="diabetes"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-orange-700 font-medium">Diabetes mellitus</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="asma"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-orange-700 font-medium">Asma brônquica</span>
                </label>
              </div>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="dpoc"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-orange-700 font-medium">DPOC</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="obesidade"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-orange-700 font-medium">Obesidade</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="hematologicas"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-orange-700 font-medium">Doenças hematológicas</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="renal"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-orange-700 font-medium">Doença renal crônica</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="hepatopatias"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-orange-700 font-medium">Hepatopatias</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="autoimunes"
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                    onChange={(e) => {
                      const checkbox = e.target as HTMLInputElement
                      if (checkbox.checked) {
                        checkbox.setAttribute('data-checked', 'true')
                      } else {
                        checkbox.removeAttribute('data-checked')
                      }
                    }}
                  />
                  <span className="text-orange-700 font-medium">Doenças autoimunes</span>
                </label>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <p className="text-blue-800 text-sm font-medium flex items-center">
              <Brain className="w-4 h-4 mr-2" />
              Marque todas as condições que se aplicam ao paciente e clique em "Avaliar Classificação"
            </p>
          </div>
        </div>
      ),
      options: [
        { text: 'Avaliar Classificação', nextStep: 'auto_classify_risk', value: 'evaluate' }
      ]
    },

    auto_classify_risk: {
      id: 'auto_classify_risk',
      title: 'Processando Classificação...',
      description: 'Analisando fatores de risco identificados',
      type: 'action',
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-gradient-to-r from-blue-500 to-purple-500',
      content: (
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Processando Dados Clínicos</h3>
            <p className="text-slate-600">Analisando fatores de risco para determinar classificação...</p>
          </div>
        </div>
      ),
      options: [] // Será determinado automaticamente
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
            <div className="flex items-center text-blue-700 font-medium">
              <p>Hidratação oral</p>
              <button
                type="button"
                onClick={() => {
                  const modal = document.createElement('div')
                  modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4'
                  modal.innerHTML = `
                    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                      <div class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3v1H8a4 4 0 000 8h8a4 4 0 000-8h-1v-1c0-1.657-1.343-3-3-3z" />
                              </svg>
                            </div>
                            <div>
                              <h2 class="text-xl font-bold">Soro Oral (SRO) – O que é e como usar</h2>
                              <p class="text-blue-100 text-sm">Informações práticas e protocolo institucional</p>
                            </div>
                          </div>
                          <button onclick="this.closest('.fixed').remove()" class="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-colors duration-200">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div class="p-6 space-y-6 overflow-y-auto">
                        <div class="rounded-xl overflow-hidden border border-slate-200">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/3/34/Oral_rehydration_salts_packets.jpg" alt="Soro Oral - pacotes de sais de reidratação" class="w-full h-auto" />
                        </div>
                        <div class="bg-blue-50 p-4 rounded-xl border border-blue-200">
                          <h3 class="font-bold text-blue-800 mb-3">O que é o Soro Oral (SRO)?</h3>
                          <p class="text-blue-700 text-sm">Solução pronta de reidratação com eletrólitos e glicose, indicada para reposição hidroeletrolítica em quadros de desidratação por febre, diarreia e em suporte na dengue. Preferir formulação industrial (envelopes/solução pronta). Caso utilize soro caseiro, seguir estritamente a medida oficial institucional.</p>
                        </div>
                        <div class="bg-white p-4 rounded-xl border border-sky-200">
                          <div class="flex items-center justify-between">
                            <h4 class="font-bold text-sky-800">Como preparar a solução (SRO caseiro)</h4>
                            <a href="https://rehydration.org/solutions/homemade.htm" target="_blank" rel="noopener noreferrer" class="text-sky-700 underline text-sm">Guia completo (externo)</a>
                          </div>
                          <ol class="text-sky-700 text-sm space-y-1 list-decimal list-inside mt-2">
                            <li>Usar <strong>1 litro</strong> de água limpa (filtrada/fervida e resfriada).</li>
                            <li>Adicionar <strong>6 colheres de chá rasas</strong> de açúcar.</li>
                            <li>Adicionar <strong>1/2 colher de chá rasa</strong> de sal de cozinha.</li>
                            <li>Misturar até completa dissolução. Ofertar em pequenos volumes.</li>
                            <li>Descartar após <strong>24 horas</strong>. Não adicionar outros sais ou bicarbonato.</li>
                          </ol>
                          <p class="text-rose-700 text-xs mt-2">Atenção: evitar “colher cheia”. Excesso de sal/açúcar pode causar <strong>hipernatremia</strong> ou hiperglicemia. Preferir solução industrial sempre que disponível.</p>
                        </div>
                        <div class="grid md:grid-cols-2 gap-4">
                          <div class="bg-cyan-50 p-4 rounded-xl border border-cyan-200">
                            <h4 class="font-bold text-cyan-800 mb-2">Como oferecer</h4>
                            <ul class="text-cyan-700 text-sm space-y-1">
                              <li>• Pequenos volumes em intervalos frequentes</li>
                              <li>• Adultos: 60–75 ml/kg/dia (dividir ao longo do dia)</li>
                              <li>• Crianças: volume diário calculado por peso (ver card de hidratação)</li>
                              <li>• Alternar com líquidos caseiros (água, sucos, chá, água de coco)</li>
                            </ul>
                          </div>
                          <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                            <h4 class="font-bold text-emerald-800 mb-2">Quando usar</h4>
                            <ul class="text-emerald-700 text-sm space-y-1">
                              <li>• Febre com risco de desidratação</li>
                              <li>• Diarreia aguda</li>
                              <li>• Dengue grupos A/B em observação</li>
                            </ul>
                          </div>
                        </div>
                        <div class="bg-amber-50 p-4 rounded-xl border border-amber-200">
                          <h4 class="font-bold text-amber-800 mb-2">Cuidados</h4>
                          <ul class="text-amber-700 text-sm space-y-1">
                            <li>• Pausar se vômitos persistentes; retomar com microvolumes</li>
                            <li>• Não substituir alimentação</li>
                            <li>• Em hiponatremia sintomática moderada/grave, seguir protocolo específico abaixo</li>
                          </ul>
                        </div>
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h3 class="font-bold text-slate-800 mb-2">Protocolo institucional: Manejo da Hiponatremia</h3>
                          <div class="text-slate-700 text-sm space-y-2">
                            <p><strong>Escopo:</strong> pacientes pediátricos, adultos e idosos com hiponatremia hipotônica (Na &lt; 135 mmol/L).</p>
                            <p><strong>Classificação:</strong> leve (130–134), moderada (125–129), grave (&lt;125 ou sintomas neurológicos).</p>
                            <p><strong>Meta inicial:</strong> +4–6 mmol/L para alívio; <strong>limites:</strong> não ultrapassar 8–10 mmol/L/24h (6–8 se alto risco de ODS).</p>
                            <div class="grid md:grid-cols-2 gap-4">
                              <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <h4 class="font-semibold text-blue-800 mb-1">Tratamento imediato</h4>
                                <ul class="text-blue-700 text-xs space-y-1">
                                  <li>• Sintomas graves: NaCl 3% bolus 2 mL/kg em 10–20 min; repetir até +4–6 mmol/L</li>
                                  <li>• Sintomas moderados: preferir bolus (RIB) conforme SALSA; monitorizar sNa 2–4 h</li>
                                  <li>• Assintomático/leve: investigar causa, restrição hídrica, monitorizar</li>
                                </ul>
                              </div>
                              <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                <h4 class="font-semibold text-indigo-800 mb-1">Faixas etárias</h4>
                                <ul class="text-indigo-700 text-xs space-y-1">
                                  <li>• Adultos/Idosos: usar 2 mL/kg para bolus; idosos com metas conservadoras</li>
                                  <li>• Pediatria: bolus 2 mL/kg; evitar correção &gt; 8 mmol/L/24h; monitorização próxima</li>
                                </ul>
                              </div>
                            </div>
                            <div class="bg-rose-50 p-3 rounded-lg border border-rose-200">
                              <h4 class="font-semibold text-rose-800 mb-1">Sobrecorreção</h4>
                              <p class="text-rose-700 text-xs">Se &gt; 8–10 mmol/L/24h (conforme risco): desmopressina + água livre ou D5W para <em>relowering</em>. SALSA recomenda abordagem precoce.</p>
                            </div>
                          <p class="text-xs text-slate-500">Referências: SALSA Trial (JAMA 2021), diretrizes europeias de hiponatremia, revisões práticas.</p>
                          </div>
                        </div>
                        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <h3 class="font-bold text-slate-800 mb-2">Protocolo institucional: Manejo da Hipernatremia</h3>
                          <div class="text-slate-700 text-sm space-y-2">
                            <p><strong>Definição e classificação:</strong> leve 146–149, moderada 150–159, grave ≥160; <em>aguda</em> &lt; 48h, <em>crônica</em> ≥ 48h.</p>
                            <div class="grid md:grid-cols-2 gap-4">
                              <div class="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                <h4 class="font-semibold text-orange-800 mb-1">Avaliação inicial</h4>
                                <ul class="text-orange-700 text-xs space-y-1">
                                  <li>• Confirmar Na sérico, osmolaridade plasmática e urinária, Na urinário</li>
                                  <li>• Função renal (ureia/creatinina) e estado de volemia (hipo/eu/hipervolêmica)</li>
                                  <li>• Sintomas neurológicos e causa de base (DI, perdas, soluções hipertônicas)</li>
                                </ul>
                              </div>
                              <div class="bg-cyan-50 p-3 rounded-lg border border-cyan-200">
                                <h4 class="font-semibold text-cyan-800 mb-1">Déficit hídrico</h4>
                                <p class="text-cyan-700 text-xs">Déficit = 0,6 × peso (kg) × (Na/140 − 1); em idosos/mulheres usar 0,5.</p>
                                <p class="text-cyan-700 text-xs">Corrigir ao longo de 48–72 h conforme gravidade e tempo.</p>
                              </div>
                            </div>
                            <div class="grid md:grid-cols-3 gap-4">
                              <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <h4 class="font-semibold text-blue-800 mb-1">Metas de correção</h4>
                                <ul class="text-blue-700 text-xs space-y-1">
                                  <li>• Aguda: 1–2 mmol/L/h; máx. 10–12 mmol/L/24h</li>
                                  <li>• Crônica: 0,5 mmol/L/h; máx. 8–10 mmol/L/24h</li>
                                  <li>• Alto risco: ≤ 8 mmol/L/24h</li>
                                </ul>
                              </div>
                              <div class="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                                <h4 class="font-semibold text-emerald-800 mb-1">Tratamento por volemia</h4>
                                <ul class="text-emerald-700 text-xs space-y-1">
                                  <li>• Hipovolêmica: SF 0,9% até estabilizar → D5W ou NaCl 0,45%</li>
                                  <li>• Euvolêmica (DI): desmopressina 1–2 µg IV/SC (central) ou restrição de Na/proteínas + tiazídico ± amilorida (nefrógeno)</li>
                                  <li>• Hipervolêmica: D5W + furosemida 20–40 mg IV; ajustar volume</li>
                                </ul>
                              </div>
                              <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                <h4 class="font-semibold text-indigo-800 mb-1">Faixas etárias</h4>
                                <ul class="text-indigo-700 text-xs space-y-1">
                                  <li>• Pediatria: ≤0,5 mmol/L/h; máx. 10/24h; monitorar Na 2–4h</li>
                                  <li>• Adultos: seguir déficit calculado; reavaliar função renal e diurese</li>
                                  <li>• Idosos: usar 0,5 × peso; vigiar sobrecarga; monitorar glicemia/coração</li>
                                </ul>
                              </div>
                            </div>
                            <div class="grid md:grid-cols-2 gap-4">
                              <div class="bg-amber-50 p-3 rounded-lg border border-amber-200">
                                <h4 class="font-semibold text-amber-800 mb-1">Monitorização</h4>
                                <ul class="text-amber-700 text-xs space-y-1">
                                  <li>• Na sérico a cada 2–4 h nas primeiras 12–24 h; depois 6–8 h</li>
                                  <li>• Diurese, sinais de edema cerebral, PA e glicemia</li>
                                  <li>• Se correção muito rápida: pausar infusão e considerar desmopressina</li>
                                </ul>
                              </div>
                              <div class="bg-slate-100 p-3 rounded-lg border border-slate-200">
                                <h4 class="font-semibold text-slate-800 mb-1">Manutenção e situações especiais</h4>
                                <ul class="text-slate-700 text-xs space-y-1">
                                  <li>• Tratar a causa; repor perdas contínuas; dieta com menor Na</li>
                                  <li>• Ventilação mecânica: ajustar perdas insensíveis</li>
                                  <li>• Diabetes insipidus: reposição hormonal/monitorização intensiva</li>
                                  <li>• Idoso institucionalizado: prevenção com oferta hídrica adequada</li>
                                </ul>
                              </div>
                            </div>
                            <div class="bg-teal-50 p-3 rounded-lg border border-teal-200">
                              <h4 class="font-semibold text-teal-800 mb-1">Resumo rápido (cartão de bolso)</h4>
                              <ul class="text-teal-700 text-xs space-y-1">
                                <li>• Hipovolêmica: SF 0,9% → D5W; ≤10 mmol/L/24h</li>
                                <li>• Euvolêmica (DI): desmopressina/tiazídico; D5W; ≤8–10/24h</li>
                                <li>• Hipervolêmica: D5W + furosemida; ≤8/24h</li>
                              </ul>
                              <p class="text-xs text-slate-500 mt-2">Referências: Adrogué & Madias NEJM 2000; Verbalis 2013; Hoorn & Zietse 2017; Snyder 1987; Sterns 2015; Spasovski 2014; Berl 2020; Rondon-Berrios 2023; OpenEvidence 2024.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="border-t border-slate-200 p-4">
                        <button onclick="this.closest('.fixed').remove()" class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200">Fechar</button>
                      </div>
                    </div>
                  `
                  document.body.appendChild(modal)
                }}
                className="ml-2 p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 flex items-center justify-center"
                title="O que é Soro Oral?"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
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
        <div className="space-y-6">
          {/* Cálculo automático baseado no peso */}
          {(() => {
            const peso = patient.weight || (patient.age >= 18 ? 70 : patient.age * 2 + 10) // Peso estimado se não informado
            let volumeTotal = 0
            let volumeSRO = 0
            let volumeLiquidos = 0

            if (patient.age >= 18) {
              // Adultos: 60ml/kg/dia
              volumeTotal = peso * 60
              volumeSRO = Math.round(volumeTotal / 3) // 1/3 SRO
              volumeLiquidos = volumeTotal - volumeSRO // 2/3 líquidos caseiros
            } else {
              // Crianças
              if (peso <= 10) {
                volumeTotal = peso * 100 // 100ml/kg/dia
              } else if (peso <= 20) {
                volumeTotal = peso * 150 // 150ml/kg/dia
              } else {
                volumeTotal = peso * 80 // 80ml/kg/dia
              }
              volumeSRO = Math.round(volumeTotal / 3)
              volumeLiquidos = volumeTotal - volumeSRO
            }

            return (
              <div className="space-y-6">
                {/* Volume total - destaque principal */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-2xl text-center">
                  <h3 className="text-2xl font-bold mb-2">Volume Total Diário</h3>
                  <p className="text-4xl font-bold mb-2">{(volumeTotal / 1000).toFixed(1)} L</p>
                  <p className="text-lg opacity-90">{volumeTotal.toLocaleString('pt-BR')} ml para {peso}kg</p>
                </div>

                {/* Distribuição simplificada */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
                    <div className="text-blue-600 mb-2">
                      <Droplets className="w-6 h-6 mx-auto" />
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <h4 className="font-bold text-blue-800 mb-1">Soro Oral</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const modal = document.createElement('div')
                          modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4'
                          modal.innerHTML = `
                            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                              <div class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                                <div class="flex items-center justify-between">
                                  <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3v1H8a4 4 0 000 8h8a4 4 0 000-8h-1v-1c0-1.657-1.343-3-3-3z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h2 class="text-xl font-bold">Soro Oral (SRO) – O que é e como usar</h2>
                                      <p class="text-blue-100 text-sm">Informações práticas e protocolo institucional</p>
                                    </div>
                                  </div>
                                  <button onclick="this.closest('.fixed').remove()" class="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-colors duration-200">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <div class="p-6 space-y-6 overflow-y-auto">
                                <div class="rounded-xl overflow-hidden border border-slate-200">
                                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/34/Oral_rehydration_salts_packets.jpg" alt="Soro Oral - pacotes de sais de reidratação" class="w-full h-auto" />
                                </div>
                                <div class="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                  <h3 class="font-bold text-blue-800 mb-3">O que é o Soro Oral (SRO)?</h3>
                                  <p class="text-blue-700 text-sm">Solução pronta de reidratação com eletrólitos e glicose, indicada para reposição hidroeletrolítica em quadros de desidratação por febre, diarreia e em suporte na dengue. Preferir formulação industrial (envelopes/solução pronta). Caso utilize soro caseiro, seguir estritamente a medida oficial institucional.</p>
                                </div>
                                <div class="bg-white p-4 rounded-xl border border-sky-200">
                                  <div class="flex items-center justify-between">
                                    <h4 class="font-bold text-sky-800">Como preparar a solução (SRO caseiro)</h4>
                                    <a href="https://rehydration.org/solutions/homemade.htm" target="_blank" rel="noopener noreferrer" class="text-sky-700 underline text-sm">Guia completo (externo)</a>
                                  </div>
                                  <ol class="text-sky-700 text-sm space-y-1 list-decimal list-inside mt-2">
                                    <li>Usar <strong>1 litro</strong> de água limpa (filtrada/fervida e resfriada).</li>
                                    <li>Adicionar <strong>6 colheres de chá rasas</strong> de açúcar.</li>
                                    <li>Adicionar <strong>1/2 colher de chá rasa</strong> de sal de cozinha.</li>
                                    <li>Misturar até completa dissolução. Ofertar em pequenos volumes.</li>
                                    <li>Descartar após <strong>24 horas</strong>. Não adicionar outros sais ou bicarbonato.</li>
                                  </ol>
                                  <p class="text-rose-700 text-xs mt-2">Atenção: evitar “colher cheia”. Excesso de sal/açúcar pode causar <strong>hipernatremia</strong> ou hiperglicemia. Preferir solução industrial sempre que disponível.</p>
                                </div>
                                <div class="grid md:grid-cols-2 gap-4">
                                  <div class="bg-cyan-50 p-4 rounded-xl border border-cyan-200">
                                    <h4 class="font-bold text-cyan-800 mb-2">Como oferecer</h4>
                                    <ul class="text-cyan-700 text-sm space-y-1">
                                      <li>• Pequenos volumes em intervalos frequentes</li>
                                      <li>• Adultos: 60–75 ml/kg/dia (dividir ao longo do dia)</li>
                                      <li>• Crianças: volume diário calculado por peso (ver card de hidratação)</li>
                                      <li>• Alternar com líquidos caseiros (água, sucos, chá, água de coco)</li>
                                    </ul>
                                  </div>
                                  <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                                    <h4 class="font-bold text-emerald-800 mb-2">Quando usar</h4>
                                    <ul class="text-emerald-700 text-sm space-y-1">
                                      <li>• Febre com risco de desidratação</li>
                                      <li>• Diarreia aguda</li>
                                      <li>• Dengue grupos A/B em observação</li>
                                    </ul>
                                  </div>
                                </div>
                                <div class="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                  <h4 class="font-bold text-amber-800 mb-2">Cuidados</h4>
                                  <ul class="text-amber-700 text-sm space-y-1">
                                    <li>• Pausar se vômitos persistentes; retomar com microvolumes</li>
                                    <li>• Não substituir alimentação</li>
                                    <li>• Em hiponatremia sintomática moderada/grave, seguir protocolo específico abaixo</li>
                                  </ul>
                                </div>
                                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                  <h3 class="font-bold text-slate-800 mb-2">Protocolo institucional: Manejo da Hiponatremia</h3>
                                  <div class="text-slate-700 text-sm space-y-2">
                                    <p><strong>Escopo:</strong> pacientes pediátricos, adultos e idosos com hiponatremia hipotônica (Na &lt; 135 mmol/L).</p>
                                    <p><strong>Classificação:</strong> leve (130–134), moderada (125–129), grave (&lt;125 ou sintomas neurológicos).</p>
                                    <p><strong>Meta inicial:</strong> +4–6 mmol/L para alívio; <strong>limites:</strong> não ultrapassar 8–10 mmol/L/24h (6–8 se alto risco de ODS).</p>
                                    <div class="grid md:grid-cols-2 gap-4">
                                      <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <h4 class="font-semibold text-blue-800 mb-1">Tratamento imediato</h4>
                                        <ul class="text-blue-700 text-xs space-y-1">
                                          <li>• Sintomas graves: NaCl 3% bolus 2 mL/kg em 10–20 min; repetir até +4–6 mmol/L</li>
                                          <li>• Sintomas moderados: preferir bolus (RIB) conforme SALSA; monitorizar sNa 2–4 h</li>
                                          <li>• Assintomático/leve: investigar causa, restrição hídrica, monitorizar</li>
                                        </ul>
                                      </div>
                                      <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                        <h4 class="font-semibold text-indigo-800 mb-1">Faixas etárias</h4>
                                        <ul class="text-indigo-700 text-xs space-y-1">
                                          <li>• Adultos/Idosos: usar 2 mL/kg para bolus; idosos com metas conservadoras</li>
                                          <li>• Pediatria: bolus 2 mL/kg; evitar correção &gt; 8 mmol/L/24h; monitorização próxima</li>
                                        </ul>
                                      </div>
                                    </div>
                                    <div class="bg-rose-50 p-3 rounded-lg border border-rose-200">
                                      <h4 class="font-semibold text-rose-800 mb-1">Sobrecorreção</h4>
                                      <p class="text-rose-700 text-xs">Se &gt; 8–10 mmol/L/24h (conforme risco): desmopressina + água livre ou D5W para <em>relowering</em>. SALSA recomenda abordagem precoce.</p>
                                    </div>
                                    <p class="text-xs text-slate-500">Referências: SALSA Trial (JAMA 2021), diretrizes europeias de hiponatremia, revisões práticas.</p>
                                  </div>
                                </div>
                                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                  <h3 class="font-bold text-slate-800 mb-2">Protocolo institucional: Manejo da Hipernatremia</h3>
                                  <div class="text-slate-700 text-sm space-y-2">
                                    <p><strong>Definição e classificação:</strong> leve 146–149, moderada 150–159, grave ≥160; <em>aguda</em> &lt; 48h, <em>crônica</em> ≥ 48h.</p>
                                    <div class="grid md:grid-cols-2 gap-4">
                                      <div class="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                        <h4 class="font-semibold text-orange-800 mb-1">Avaliação inicial</h4>
                                        <ul class="text-orange-700 text-xs space-y-1">
                                          <li>• Confirmar Na sérico, osmolaridade plasmática e urinária, Na urinário</li>
                                          <li>• Função renal (ureia/creatinina) e estado de volemia (hipo/eu/hipervolêmica)</li>
                                          <li>• Sintomas neurológicos e causa de base (DI, perdas, soluções hipertônicas)</li>
                                        </ul>
                                      </div>
                                      <div class="bg-cyan-50 p-3 rounded-lg border border-cyan-200">
                                        <h4 class="font-semibold text-cyan-800 mb-1">Déficit hídrico</h4>
                                        <p class="text-cyan-700 text-xs">Déficit = 0,6 × peso (kg) × (Na/140 − 1); em idosos/mulheres usar 0,5.</p>
                                        <p class="text-cyan-700 text-xs">Corrigir ao longo de 48–72 h conforme gravidade e tempo.</p>
                                      </div>
                                    </div>
                                    <div class="grid md:grid-cols-3 gap-4">
                                      <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                        <h4 class="font-semibold text-blue-800 mb-1">Metas de correção</h4>
                                        <ul class="text-blue-700 text-xs space-y-1">
                                          <li>• Aguda: 1–2 mmol/L/h; máx. 10–12 mmol/L/24h</li>
                                          <li>• Crônica: 0,5 mmol/L/h; máx. 8–10 mmol/L/24h</li>
                                          <li>• Alto risco: ≤ 8 mmol/L/24h</li>
                                        </ul>
                                      </div>
                                      <div class="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                                        <h4 class="font-semibold text-emerald-800 mb-1">Tratamento por volemia</h4>
                                        <ul class="text-emerald-700 text-xs space-y-1">
                                          <li>• Hipovolêmica: SF 0,9% até estabilizar → D5W ou NaCl 0,45%</li>
                                          <li>• Euvolêmica (DI): desmopressina 1–2 µg IV/SC (central) ou restrição de Na/proteínas + tiazídico ± amilorida (nefrógeno)</li>
                                          <li>• Hipervolêmica: D5W + furosemida 20–40 mg IV; ajustar volume</li>
                                        </ul>
                                      </div>
                                      <div class="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                                        <h4 class="font-semibold text-indigo-800 mb-1">Faixas etárias</h4>
                                        <ul class="text-indigo-700 text-xs space-y-1">
                                          <li>• Pediatria: ≤0,5 mmol/L/h; máx. 10/24h; monitorar Na 2–4h</li>
                                          <li>• Adultos: seguir déficit calculado; reavaliar função renal e diurese</li>
                                          <li>• Idosos: usar 0,5 × peso; vigiar sobrecarga; monitorar glicemia/coração</li>
                                        </ul>
                                      </div>
                                    </div>
                                    <div class="grid md:grid-cols-2 gap-4">
                                      <div class="bg-amber-50 p-3 rounded-lg border border-amber-200">
                                        <h4 class="font-semibold text-amber-800 mb-1">Monitorização</h4>
                                        <ul class="text-amber-700 text-xs space-y-1">
                                          <li>• Na sérico a cada 2–4 h nas primeiras 12–24 h; depois 6–8 h</li>
                                          <li>• Diurese, sinais de edema cerebral, PA e glicemia</li>
                                          <li>• Se correção muito rápida: pausar infusão e considerar desmopressina</li>
                                        </ul>
                                      </div>
                                      <div class="bg-slate-100 p-3 rounded-lg border border-slate-200">
                                        <h4 class="font-semibold text-slate-800 mb-1">Manutenção e situações especiais</h4>
                                        <ul class="text-slate-700 text-xs space-y-1">
                                          <li>• Tratar a causa; repor perdas contínuas; dieta com menor Na</li>
                                          <li>• Ventilação mecânica: ajustar perdas insensíveis</li>
                                          <li>• Diabetes insipidus: reposição hormonal/monitorização intensiva</li>
                                          <li>• Idoso institucionalizado: prevenção com oferta hídrica adequada</li>
                                        </ul>
                                      </div>
                                    </div>
                                    <div class="bg-teal-50 p-3 rounded-lg border border-teal-200">
                                      <h4 class="font-semibold text-teal-800 mb-1">Resumo rápido (cartão de bolso)</h4>
                                      <ul class="text-teal-700 text-xs space-y-1">
                                        <li>• Hipovolêmica: SF 0,9% → D5W; ≤10 mmol/L/24h</li>
                                        <li>• Euvolêmica (DI): desmopressina/tiazídico; D5W; ≤8–10/24h</li>
                                        <li>• Hipervolêmica: D5W + furosemida; ≤8/24h</li>
                                      </ul>
                                      <p class="text-xs text-slate-500 mt-2">Referências: Adrogué & Madias NEJM 2000; Verbalis 2013; Hoorn & Zietse 2017; Snyder 1987; Sterns 2015; Spasovski 2014; Berl 2020; Rondon-Berrios 2023; OpenEvidence 2024.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div class="border-t border-slate-200 p-4">
                                <button onclick="this.closest('.fixed').remove()" class="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200">Fechar</button>
                              </div>
                            </div>
                          `
                          document.body.appendChild(modal)
                        }}
                        className="ml-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200"
                        title="O que é Soro Oral?"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xl font-bold text-blue-700">{(volumeSRO / 1000).toFixed(1)} L</p>
                    <p className="text-xs text-blue-600 mt-1">1/3 do total</p>
                  </div>

                  <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-200 text-center">
                    <div className="text-cyan-600 mb-2">
                      <Heart className="w-6 h-6 mx-auto" />
                    </div>
                    <h4 className="font-bold text-cyan-800 mb-1">Líquidos</h4>
                    <p className="text-xl font-bold text-cyan-700">{(volumeLiquidos / 1000).toFixed(1)} L</p>
                    <p className="text-xs text-cyan-600 mt-1">2/3 do total</p>
                  </div>
                </div>

                {/* Orientações essenciais */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h4 className="font-bold text-green-800 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Orientações Principais
                  </h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <p>• Oferecer volumes pequenos e frequentes</p>
                    <p>• Líquidos: água, chás, água de coco, sucos naturais</p>
                    <p>• Se vômitos: volumes menores, mais vezes</p>
                  </div>
                </div>

                {/* Sinais de alerta - simplificado */}
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <h4 className="font-bold text-red-800 mb-3 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Retorno ao Serviço
                  </h4>
                  <div className="space-y-2 text-sm text-red-700">
                    <p><strong>Imediatamente se:</strong> Vômitos persistentes • Dor abdominal intensa • Sangramentos • Tontura</p>
                    <p><strong>No 5° dia se:</strong> Não houver defervescência (queda da febre)</p>
                  </div>
                </div>
              </div>
            )
          })()}
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
      type: 'question',
      icon: <Activity className="w-6 h-6" />,
      color: 'bg-green-500',
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Avaliação dos Exames:</h4>
            <p className="text-green-700 text-sm">Verificar hemograma, hematócrito, plaquetas</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Conduta:</h4>
            <p className="text-yellow-700 text-sm">Se alterações significativas, reavaliar classificação</p>
          </div>

          {/* Seção de Exames Opcionais - Grupo B */}
          <div className="bg-white border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Resultados dos Exames (Opcional)</h4>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Não obrigatório</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Hemograma Básico */}
              <div className="space-y-3">
                <h5 className="font-medium text-slate-700 border-b border-slate-200 pb-1">Hemograma Completo</h5>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Hemoglobina (g/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      placeholder="Ex: 12.5"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      onChange={(e) => {
                        const value = e.target.value
                        localStorage.setItem(`lab_hemoglobin_b_${patient.id}`, value)
                      }}
                      defaultValue={localStorage.getItem(`lab_hemoglobin_b_${patient.id}`) || ''}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Hematócrito (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="Ex: 38.0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      onChange={(e) => {
                        const value = e.target.value
                        localStorage.setItem(`lab_hematocrit_b_${patient.id}`, value)
                      }}
                      defaultValue={localStorage.getItem(`lab_hematocrit_b_${patient.id}`) || ''}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-600 mb-1">Plaquetas (/mm³)</label>
                    <input
                      type="number"
                      min="0"
                      max="1000000"
                      placeholder="Ex: 150000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      onChange={(e) => {
                        const value = e.target.value
                        localStorage.setItem(`lab_platelets_b_${patient.id}`, value)
                      }}
                      defaultValue={localStorage.getItem(`lab_platelets_b_${patient.id}`) || ''}
                    />
                  </div>
                </div>
              </div>

              {/* Bioquímica Básica */}
              <div className="space-y-3">
                <h5 className="font-medium text-slate-700 border-b border-slate-200 pb-1">Bioquímica</h5>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Albumina (g/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="Ex: 3.5"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      onChange={(e) => {
                        const value = e.target.value
                        localStorage.setItem(`lab_albumin_b_${patient.id}`, value)
                      }}
                      defaultValue={localStorage.getItem(`lab_albumin_b_${patient.id}`) || ''}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">ALT (U/L)</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        placeholder="Ex: 45"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        onChange={(e) => {
                          const value = e.target.value
                          localStorage.setItem(`lab_alt_b_${patient.id}`, value)
                        }}
                        defaultValue={localStorage.getItem(`lab_alt_b_${patient.id}`) || ''}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">AST (U/L)</label>
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        placeholder="Ex: 40"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        onChange={(e) => {
                          const value = e.target.value
                          localStorage.setItem(`lab_ast_b_${patient.id}`, value)
                        }}
                        defaultValue={localStorage.getItem(`lab_ast_b_${patient.id}`) || ''}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700">
                💡 <strong>Dica:</strong> Preencha os resultados disponíveis para melhor documentação. 
                Baseie sua decisão clínica nos valores alterados conforme protocolo.
              </p>
            </div>
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
              <li>• Retornar se não houver defervescência</li>
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
      color: 'bg-gradient-to-r from-amber-500 to-amber-700',
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Acompanhamento */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border border-amber-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-amber-800">Acompanhamento</h4>
              </div>
              <p className="text-amber-700 font-medium mb-4">Internação - mínimo 48h</p>
              <button 
                onClick={() => onViewPrescriptions?.(patient)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Ver Prescrições</span>
              </button>
            </div>

            {/* Exames */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border border-amber-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-amber-800">Exames</h4>
              </div>
              <div className="text-amber-700 text-sm space-y-1 mb-4">
                <p>• Hemograma completo</p>
                <p>• Albumina sérica</p>
                <p>• Transaminases (ALT/AST)</p>
                <p>• Raio-X de tórax</p>
              </div>
              <button 
                onClick={() => onViewPrescriptions?.(patient)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span>Ver Exames</span>
              </button>
            </div>

            {/* Conduta */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border border-amber-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-amber-800">Conduta</h4>
              </div>
              
              {/* Cálculos automáticos baseados no peso */}
              {(() => {
                const peso = patient.weight || 70 // peso padrão se não informado
                const volumeReposicao = peso * 10 // 10ml/kg
                const volumeManutencao = peso * 25 // 25ml/kg/dia para manutenção
                
                return (
                  <div className="space-y-3">
                    <div className="bg-amber-200/50 p-3 rounded-lg">
                      <p className="font-semibold text-amber-800 text-sm">Reposição Volêmica Inicial:</p>
                      <p className="text-amber-700 font-bold">
                        {volumeReposicao}ml SF 0,9%
                      </p>
                      <p className="text-amber-600 text-xs">
                        ({peso}kg × 10ml/kg) em 10 minutos
                      </p>
                    </div>
                    
                    <div className="bg-amber-200/50 p-3 rounded-lg">
                      <p className="font-semibold text-amber-800 text-sm">Manutenção (24h):</p>
                      <p className="text-amber-700 font-bold">
                        {volumeManutencao}ml/dia
                      </p>
                      <p className="text-amber-600 text-xs">
                        ({peso}kg × 25ml/kg/dia)
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => onViewReport?.(patient)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mt-3"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Protocolo Completo</span>
                    </button>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Resumo do protocolo */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-6 rounded-2xl border border-amber-300">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-amber-700" />
              <h4 className="font-bold text-amber-800 text-lg">Protocolo de Internação - Grupo C</h4>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-amber-800 mb-2">Monitorização Contínua:</h5>
                <ul className="text-amber-700 text-sm space-y-1">
                  <li>• Sinais vitais de 4/4h</li>
                  <li>• Balanço hídrico rigoroso</li>
                  <li>• Controle de diurese</li>
                  <li>• Ausculta pulmonar</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold text-amber-800 mb-2">Critérios de Melhora:</h5>
                <ul className="text-amber-700 text-sm space-y-1">
                  <li>• Estabilização dos sinais vitais</li>
                  <li>• Melhora da dor abdominal</li>
                  <li>• Cessação dos vômitos</li>
                  <li>• Diurese adequada (&gt;1ml/kg/h)</li>
                </ul>
              </div>
            </div>
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
      color: 'bg-gradient-to-r from-red-600 to-red-800',
      content: (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Acompanhamento */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-red-800">Acompanhamento</h4>
              </div>
              <p className="text-red-700 font-medium mb-4">UTI - mínimo 48h</p>
              <button 
                onClick={() => onViewPrescriptions?.(patient)}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Ver Prescrições UTI</span>
              </button>
            </div>

            {/* Exames */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-red-800">Exames</h4>
              </div>
              <div className="text-red-700 text-sm space-y-1 mb-4">
                <p>• Hemograma completo</p>
                <p>• Gasometria arterial</p>
                <p>• Eletrólitos (Na, K, Cl)</p>
                <p>• Função renal (Cr, Ur)</p>
                <p>• Albumina e transaminases</p>
                <p>• Raio-X de tórax</p>
              </div>
              <button 
                onClick={() => onViewPrescriptions?.(patient)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Activity className="w-4 h-4" />
                <span>Ver Exames UTI</span>
              </button>
            </div>

            {/* Conduta */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-800 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-bold text-red-800">Conduta</h4>
              </div>
              
              {/* Cálculos automáticos baseados no peso para UTI */}
              {(() => {
                const peso = patient.weight || 70 // peso padrão se não informado
                const volumeReposicaoUTI = peso * 20 // 20ml/kg para UTI
                const volumeManutencaoUTI = peso * 30 // 30ml/kg/dia para manutenção UTI
                const dopamax = peso * 20 // 20 mcg/kg/min (dose máxima)
                
                return (
                  <div className="space-y-3">
                    <div className="bg-red-200/50 p-3 rounded-lg">
                      <p className="font-semibold text-red-800 text-sm">Reposição Volêmica Emergencial:</p>
                      <p className="text-red-700 font-bold">
                        {volumeReposicaoUTI}ml SF 0,9%
                      </p>
                      <p className="text-red-600 text-xs">
                        ({peso}kg × 20ml/kg) em até 20 minutos
                      </p>
                    </div>
                    
                    <div className="bg-red-200/50 p-3 rounded-lg">
                      <p className="font-semibold text-red-800 text-sm">Manutenção UTI (24h):</p>
                      <p className="text-red-700 font-bold">
                        {volumeManutencaoUTI}ml/dia
                      </p>
                      <p className="text-red-600 text-xs">
                        ({peso}kg × 30ml/kg/dia)
                      </p>
                    </div>
                    
                    <div className="bg-red-200/50 p-3 rounded-lg">
                      <p className="font-semibold text-red-800 text-sm">Dopamina (se necessário):</p>
                      <p className="text-red-700 font-bold">
                        Até {dopamax} mcg/kg/min
                      </p>
                      <p className="text-red-600 text-xs">
                        Peso: {peso}kg × 20 mcg/kg/min
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => onViewReport?.(patient)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 mt-3"
                    >
                      <Heart className="w-4 h-4" />
                      <span>Protocolo UTI</span>
                    </button>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Resumo do protocolo UTI */}
          <div className="bg-gradient-to-r from-red-100 to-red-200 p-6 rounded-2xl border border-red-300">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-700" />
              <h4 className="font-bold text-red-800 text-lg">Protocolo de UTI - Grupo D</h4>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-red-800 mb-2">Monitorização Intensiva:</h5>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Monitor multiparamétrico contínuo</li>
                  <li>• Pressão arterial invasiva</li>
                  <li>• Balanço hídrico horário</li>
                  <li>• Controle de diurese (sonda vesical)</li>
                  <li>• Gasometria de 6/6h</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold text-red-800 mb-2">Suporte Avançado:</h5>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Suporte ventilatório se necessário</li>
                  <li>• Drogas vasoativas conforme PA</li>
                  <li>• Hemoderivados se indicado</li>
                  <li>• Controle rigoroso glicemia</li>
                  <li>• Prevenção de complicações</li>
                </ul>
              </div>
            </div>
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
      type: 'question',
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-yellow-500',
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Verificar:</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Sinais vitais</li>
              <li>• Diurese</li>
              <li>• Melhora dos sintomas</li>
              <li>• Ausência de novos sinais de alarme</li>
            </ul>
          </div>

          {/* Seção de Exames Opcionais */}
          <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Resultados dos Exames (Opcional)</h4>
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Não obrigatório</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Hemograma */}
              <div className="space-y-3">
                <h5 className="font-medium text-slate-700 border-b border-slate-200 pb-1">Hemograma Completo</h5>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Hemoglobina (g/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      placeholder="Ex: 12.5"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const value = e.target.value
                        // Salvar no localStorage temporariamente para não perder os dados
                        localStorage.setItem(`lab_hemoglobin_${patient.id}`, value)
                      }}
                      defaultValue={localStorage.getItem(`lab_hemoglobin_${patient.id}`) || ''}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Hematócrito (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="Ex: 38.0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const value = e.target.value
                        localStorage.setItem(`lab_hematocrit_${patient.id}`, value)
                      }}
                      defaultValue={localStorage.getItem(`lab_hematocrit_${patient.id}`) || ''}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-600 mb-1">Plaquetas (/mm³)</label>
                    <input
                      type="number"
                      min="0"
                      max="1000000"
                      placeholder="Ex: 150000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const value = e.target.value
                        localStorage.setItem(`lab_platelets_${patient.id}`, value)
                      }}
                      defaultValue={localStorage.getItem(`lab_platelets_${patient.id}`) || ''}
                    />
                  </div>
                </div>
              </div>

              {/* Outros Exames */}
              <div className="space-y-3">
                <h5 className="font-medium text-slate-700 border-b border-slate-200 pb-1">Bioquímica</h5>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Albumina (g/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="Ex: 3.5"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const value = e.target.value
                        localStorage.setItem(`lab_albumin_${patient.id}`, value)
                      }}
                      defaultValue={localStorage.getItem(`lab_albumin_${patient.id}`) || ''}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">ALT (U/L)</label>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      placeholder="Ex: 45"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const value = e.target.value
                        localStorage.setItem(`lab_alt_${patient.id}`, value)
                      }}
                      defaultValue={localStorage.getItem(`lab_alt_${patient.id}`) || ''}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-600 mb-1">AST (U/L)</label>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      placeholder="Ex: 40"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const value = e.target.value
                        localStorage.setItem(`lab_ast_${patient.id}`, value)
                      }}
                      defaultValue={localStorage.getItem(`lab_ast_${patient.id}`) || ''}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 <strong>Dica:</strong> Você pode preencher os resultados disponíveis ou prosseguir diretamente com a avaliação clínica. 
                Os dados dos exames serão salvos automaticamente no cadastro do paciente.
              </p>
            </div>
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
              <li>• Retornar se não houver defervescência</li>
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
    // Evitar cliques duplos durante transição
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    const newAnswers = value ? { ...answers, [currentStep]: value } : answers
    const newHistory = [...history, currentStep]
    
    if (value) {
      setAnswers(newAnswers)
    }
    
    // Capturar dados dos exames se estamos saindo da reavaliação
    if (currentStep === 'reevaluation_c_1h' || currentStep === 'evaluate_labs_b') {
      // Capturar dados dos exames do localStorage (diferente para cada grupo)
      const suffix = currentStep === 'evaluate_labs_b' ? '_b' : ''
      const labData = {
        hemoglobin: localStorage.getItem(`lab_hemoglobin${suffix}_${patient.id}`),
        hematocrit: localStorage.getItem(`lab_hematocrit${suffix}_${patient.id}`),
        platelets: localStorage.getItem(`lab_platelets${suffix}_${patient.id}`),
        albumin: localStorage.getItem(`lab_albumin${suffix}_${patient.id}`),
        alt: localStorage.getItem(`lab_alt${suffix}_${patient.id}`),
        ast: localStorage.getItem(`lab_ast${suffix}_${patient.id}`)
      }
      
      // Salvar dados dos exames no serviço se algum foi preenchido
      const hasLabData = Object.values(labData).some(value => value && value.trim() !== '')
      if (hasLabData) {
        try {
          // Salvar os dados dos exames usando o patientService
          patientService.updateLabResults(patient.id, {
            hemoglobin: labData.hemoglobin ? parseFloat(labData.hemoglobin) : undefined,
            hematocrit: labData.hematocrit ? parseFloat(labData.hematocrit) : undefined,
            platelets: labData.platelets ? parseInt(labData.platelets) : undefined,
            albumin: labData.albumin ? parseFloat(labData.albumin) : undefined,
            transaminases: {
              alt: labData.alt ? parseInt(labData.alt) : undefined,
              ast: labData.ast ? parseInt(labData.ast) : undefined
            },
            status: 'completed',
            resultDate: new Date()
          })
          
          // Limpar localStorage após salvar
          Object.keys(labData).forEach(key => {
            localStorage.removeItem(`lab_${key}${suffix}_${patient.id}`)
          })
        } catch (error) {
          console.error('Erro ao salvar resultados dos exames:', error)
        }
      }

      // Avaliação automática dos exames para Grupo B
      if (currentStep === 'evaluate_labs_b') {
        const hemoglobin = labData.hemoglobin ? parseFloat(labData.hemoglobin) : undefined
        const hematocrit = labData.hematocrit ? parseFloat(labData.hematocrit) : undefined
        const platelets = labData.platelets ? parseInt(labData.platelets) : undefined
        const albumin = labData.albumin ? parseFloat(labData.albumin) : undefined
        const shouldUpgrade = (
          (platelets !== undefined && platelets < 100000) ||
          (hematocrit !== undefined && hematocrit >= 45) ||
          (hemoglobin !== undefined && hemoglobin >= 16) ||
          (albumin !== undefined && albumin < 3.5)
        )
        // Se critérios de gravidade laboratorial presentes e usuário tentar manter B, reclassificar para C
        if (shouldUpgrade && nextStep === 'end_group_b') {
          nextStep = 'group_c'
        }
      }
    }
    
    // Lógica especial para classificação automática de fatores de risco
    if (nextStep === 'auto_classify_risk') {
      // Capturar dados dos checkboxes marcados
      const riskFactors: string[] = []
      const checkboxes = [
        { id: 'sangramento_espontaneo', label: 'Sangramento espontâneo da pele' },
        { id: 'prova_laco', label: 'Prova do laço positiva' },
        { id: 'lactentes', label: 'Lactentes (< 24 meses)' },
        { id: 'gestantes', label: 'Gestantes' },
        { id: 'idosos', label: 'Adultos > 65 anos' },
        { id: 'hipertensao', label: 'Hipertensão arterial' },
        { id: 'diabetes', label: 'Diabetes mellitus' },
        { id: 'asma', label: 'Asma brônquica' },
        { id: 'dpoc', label: 'DPOC' },
        { id: 'obesidade', label: 'Obesidade' },
        { id: 'hematologicas', label: 'Doenças hematológicas' },
        { id: 'renal', label: 'Doença renal crônica' },
        { id: 'hepatopatias', label: 'Hepatopatias' },
        { id: 'autoimunes', label: 'Doenças autoimunes' }
      ]
      
      // Capturar fatores de risco marcados
      checkboxes.forEach(checkbox => {
        const element = document.getElementById(checkbox.id) as HTMLInputElement
        if (element && element.checked) {
          riskFactors.push(checkbox.label)
        }
      })
      
      // Determinar classificação
      let finalStep = 'group_a' // Padrão: sem fatores de risco
      let group: 'A' | 'B' | 'C' | 'D' | undefined = 'A'
      
      if (riskFactors.length > 0) {
        finalStep = 'group_b'
        group = 'B'
        // Salvar fatores de risco para usar no relatório
        localStorage.setItem(`risk_factors_${patient.id}`, JSON.stringify(riskFactors))
      } else {
        // Limpar fatores de risco se não houver nenhum
        localStorage.removeItem(`risk_factors_${patient.id}`)
      }
      
      // Usar setTimeout para simular processamento
      setTimeout(() => {
        setHistory([...newHistory, currentStep])
        setCurrentStep(finalStep)
        
        const finalProgress = calculateProgress(finalStep, [...newHistory, currentStep])
        setProgress(finalProgress)
        
        try {
          onUpdate(patient.id, finalStep, [...newHistory, currentStep], newAnswers, finalProgress, group)
        } catch (error) {
          console.error('Erro ao atualizar estado do paciente:', error)
        }
        
        setIsTransitioning(false)
      }, 1500) // 1.5 segundos para mostrar o processamento
      
      // Não continuar com o fluxo normal
      return
    }

    // Lógica especial para classificação automática
    if (nextStep === 'auto_classify_alarm') {
      // Analisar os sinais selecionados
      let classificationData = { grupoC: [], grupoD: [] }
      if (answers.alarm_check) {
        try {
          if (answers.alarm_check.startsWith('{')) {
            classificationData = JSON.parse(answers.alarm_check)
          }
        } catch (error) {
          console.warn('Erro ao parsear alarm_check na classificação:', error)
        }
      }
      const hasGrupoD = classificationData.grupoD && classificationData.grupoD.length > 0
      const hasGrupoC = classificationData.grupoC && classificationData.grupoC.length > 0
      
      let finalStep = 'bleeding_check' // Se não tem sinais de alarme, vai para avaliação de sangramento
      let group: 'A' | 'B' | 'C' | 'D' | undefined = undefined
      
      if (hasGrupoD) {
        finalStep = 'group_d'
        group = 'D'
      } else if (hasGrupoC) {
        finalStep = 'group_c'
        group = 'C'
      }
      // Se não tem sinais de alarme nem gravidade, vai para bleeding_check para determinar A ou B
      
      // Usar setTimeout para simular processamento
      setTimeout(() => {
        setHistory([...newHistory, currentStep])
        setCurrentStep(finalStep)
        
        const finalProgress = calculateProgress(finalStep, [...newHistory, currentStep])
        setProgress(finalProgress)
        
        try {
          onUpdate(patient.id, finalStep, [...newHistory, currentStep], newAnswers, finalProgress, group)
        } catch (error) {
          console.error('Erro ao atualizar estado do paciente:', error)
        }
        
        setIsTransitioning(false)
      }, 1500) // 1.5 segundos para mostrar o processamento
      
      // Não continuar com o fluxo normal
      return
    }
    
    // Ao entrar em espera de exames no Grupo B, gerar prescrição de hidratação
    if (nextStep === 'wait_labs_b') {
      try {
        const peso = patient.weight || (patient.age >= 18 ? 70 : (patient.age * 2 + 10))
        // Orientação de SRO 75 ml/kg/dia divididos em pequenas quantidades
        const volumeInfantil = Math.round(peso * 75)
        patientService.addPrescription(patient.id, {
          medication: 'Solução de Reidratação Oral (SRO)',
          dosage: patient.age >= 18 ? '200–400 ml por vez' : `${volumeInfantil} ml/dia dividido em pequenas quantidades`,
          frequency: 'Oferecer em pequenos volumes, frequentemente',
          duration: 'Até resultado do hemograma e melhora clínica',
          instructions: 'Manter via oral; se não tolerar ou piorar, retornar imediatamente.',
          prescribedBy: 'Sistema Siga o Fluxo'
        })
        patientService.addObservation(patient.id, 'Manter hidratação oral enquanto aguarda hemograma (Grupo B).')
      } catch (error) {
        console.error('Erro ao gerar prescrição de hidratação em espera de exames:', error)
      }
    }

    setHistory(newHistory)
    setCurrentStep(nextStep)
    
    const newProgress = calculateProgress(nextStep, newHistory)
    setProgress(newProgress)
    
    // Detectar grupo
    let group: 'A' | 'B' | 'C' | 'D' | undefined
    if (nextStep === 'group_a' || nextStep === 'hydration_a') group = 'A'
    else if (nextStep === 'group_b' || nextStep === 'wait_labs_b' || nextStep === 'end_group_b') group = 'B'
    else if (nextStep === 'group_c' || nextStep === 'treatment_c') group = 'C'
    else if (nextStep === 'group_d' || nextStep === 'treatment_d') group = 'D'
    
    // Atualizar estado
    try {
      onUpdate(patient.id, nextStep, newHistory, newAnswers, newProgress, group)
    } catch (error) {
      console.error('Erro ao atualizar estado do paciente:', error)
    }
    
    // Resetar transição após um pequeno delay
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
    
    // Completar apenas quando realmente finalizar
    if (nextStep === 'end') {
      setTimeout(() => onComplete(), 500)
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
    setIsTransitioning(true)
    setCurrentStep('start')
    setHistory([])
    setAnswers({})
    setProgress(0)
    
    try {
      onUpdate(patient.id, 'start', [], {}, 0)
    } catch (error) {
      console.error('Erro ao reiniciar fluxograma:', error)
    }
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }

  const step = steps[currentStep]

  // Verificação de segurança - se o step não existir, voltar para o início
  if (!step) {
    console.error(`Step '${currentStep}' não encontrado. Redirecionando para 'start'.`)
    setCurrentStep('start')
    setHistory([])
    setAnswers({})
    setProgress(0)
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
                        disabled={isTransitioning}
                        className={clsx(
                          "group relative p-6 rounded-2xl text-left transition-all duration-300 border-2 hover:shadow-2xl overflow-hidden",
                          isTransitioning && "opacity-50 cursor-not-allowed",
                          !isTransitioning && (
                            step.type === 'question' ? "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200 text-blue-900" :
                            step.type === 'group' ? "bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200 text-green-900" :
                            step.type === 'action' ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 hover:from-amber-100 hover:to-amber-200 text-amber-900" :
                            "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 hover:from-slate-100 hover:to-slate-200 text-slate-900"
                          )
                        )}
                        whileHover={!isTransitioning ? { scale: 1.02, y: -2 } : {}}
                        whileTap={!isTransitioning ? { scale: 0.98 } : {}}
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