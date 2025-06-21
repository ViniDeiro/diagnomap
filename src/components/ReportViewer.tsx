'use client'

import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Heart, 
  Thermometer,
  Droplets,
  Shield,
  Brain,
  Stethoscope,
  Award,
  Clock,
  Target,
  Zap
} from 'lucide-react'
import { Patient } from '@/types/patient'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ReportViewerProps {
  patient: Patient
  onClose: () => void
}

const ReportViewer: React.FC<ReportViewerProps> = ({ patient, onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    if (!reportRef.current) return

    try {
      // Configurar o canvas para melhor qualidade
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`relatorio_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Tente novamente.')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getGroupInfo = (group?: 'A' | 'B' | 'C' | 'D') => {
    const groupData = {
      A: { 
        name: 'Grupo A - Dengue sem sinais de alarme', 
        color: 'text-blue-600', 
        bg: 'bg-blue-50',
        description: 'Dengue sem sinais de alarme, sem comorbidades. Tratamento ambulatorial com hidratação oral.',
        icon: <CheckCircle className="w-5 h-5" />
      },
      B: { 
        name: 'Grupo B - Dengue com fatores de risco', 
        color: 'text-green-600', 
        bg: 'bg-green-50',
        description: 'Dengue com fatores de risco ou comorbidades. Observação até resultado dos exames.',
        icon: <Heart className="w-5 h-5" />
      },
      C: { 
        name: 'Grupo C - Dengue com sinais de alarme', 
        color: 'text-amber-600', 
        bg: 'bg-amber-50',
        description: 'Dengue com sinais de alarme. Internação hospitalar para monitorização.',
        icon: <AlertTriangle className="w-5 h-5" />
      },
      D: { 
        name: 'Grupo D - Dengue grave', 
        color: 'text-red-600', 
        bg: 'bg-red-50',
        description: 'Dengue grave com extravasamento de plasma ou choque. Tratamento intensivo.',
        icon: <Shield className="w-5 h-5" />
      }
    }
    return group ? groupData[group] : null
  }

  const getStepName = (stepId: string) => {
    const stepNames: Record<string, string> = {
      start: 'Início da Avaliação',
      alarm_check: 'Verificação de Sinais de Alarme',
      bleeding_check: 'Pesquisa de Sangramento',
      group_c_d_classification: 'Classificação Grupos C/D',
      group_a: 'Classificação Grupo A',
      group_b: 'Classificação Grupo B',
      group_c: 'Classificação Grupo C',
      group_d: 'Classificação Grupo D',
      hydration_a: 'Hidratação Oral (Grupo A)',
      wait_labs_b: 'Aguardando Exames (Grupo B)',
      evaluate_labs_b: 'Avaliação de Exames (Grupo B)',
      treatment_c: 'Tratamento Grupo C',
      treatment_d: 'Tratamento Grupo D',
      reevaluation_c_1h: 'Reavaliação 1h (Grupo C)',
      reevaluation_d: 'Reavaliação (Grupo D)',
      end: 'Protocolo Finalizado'
    }
    return stepNames[stepId] || stepId
  }

  const groupInfo = getGroupInfo(patient.flowchartState.group)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-slate-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Relatório Médico Completo</h2>
                <p className="text-blue-100">Sistema DiagnoMap Pro - Protocolo MS 2024</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={generatePDF}
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-5 h-5" />
                <span className="font-medium">Baixar PDF</span>
              </motion.button>
              <motion.button
                onClick={onClose}
                className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <div ref={reportRef} className="p-8 bg-white">
            
            {/* Report Header */}
            <div className="border-b-2 border-slate-200 pb-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-slate-700 rounded-2xl flex items-center justify-center">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800">DiagnoMap Pro</h1>
                    <p className="text-slate-600">Sistema de Diagnóstico Clínico - Dengue</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Data do Relatório</p>
                  <p className="text-lg font-bold text-slate-800">{formatDate(new Date())}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Dados do Paciente
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Nome:</span>
                      <span className="font-semibold text-slate-800">{patient.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Idade:</span>
                      <span className="font-semibold text-slate-800">{patient.age} anos</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Prontuário:</span>
                      <span className="font-semibold text-slate-800">{patient.medicalRecord}</span>
                    </div>
                    {patient.weight && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Peso:</span>
                        <span className="font-semibold text-slate-800">{patient.weight} kg</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Dados do Atendimento
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Data de Admissão:</span>
                      <span className="font-semibold text-slate-800">{formatDate(patient.admission.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className="font-semibold text-slate-800">
                        {patient.status === 'active' ? 'Em Atendimento' : 
                         patient.status === 'discharged' ? 'Finalizado' : 
                         patient.status === 'waiting_labs' ? 'Aguardando Exames' : 'Aguardando Avaliação'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Progresso:</span>
                      <span className="font-semibold text-slate-800">{Math.round(patient.flowchartState.progress)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sintomas Relatados */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Activity className="w-6 h-6 mr-3 text-red-600" />
                Sintomas Relatados
              </h3>
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.admission.symptoms.map((symptom, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-800 font-medium">{symptom}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sinais Vitais */}
            {patient.admission.vitalSigns && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <Thermometer className="w-6 h-6 mr-3 text-blue-600" />
                  Sinais Vitais
                </h3>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {patient.admission.vitalSigns.temperature && (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <Thermometer className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm text-slate-600">Temperatura</p>
                        <p className="text-lg font-bold text-slate-800">{patient.admission.vitalSigns.temperature}°C</p>
                      </div>
                    )}
                    {patient.admission.vitalSigns.bloodPressure && (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <Activity className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm text-slate-600">Pressão Arterial</p>
                        <p className="text-lg font-bold text-slate-800">{patient.admission.vitalSigns.bloodPressure}</p>
                      </div>
                    )}
                    {patient.admission.vitalSigns.heartRate && (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm text-slate-600">Frequência Cardíaca</p>
                        <p className="text-lg font-bold text-slate-800">{patient.admission.vitalSigns.heartRate} bpm</p>
                      </div>
                    )}
                    {patient.admission.vitalSigns.respiratoryRate && (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <Droplets className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-sm text-slate-600">Freq. Respiratória</p>
                        <p className="text-lg font-bold text-slate-800">{patient.admission.vitalSigns.respiratoryRate} rpm</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Classificação de Risco */}
            {groupInfo && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <Award className="w-6 h-6 mr-3 text-amber-600" />
                  Classificação de Risco
                </h3>
                <div className={`${groupInfo.bg} rounded-xl p-6 border-l-4 border-${groupInfo.color.replace('text-', '')}`}>
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${groupInfo.color.replace('text-', 'bg-')} rounded-xl flex items-center justify-center text-white`}>
                      {groupInfo.icon}
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold ${groupInfo.color} mb-2`}>{groupInfo.name}</h4>
                      <p className="text-slate-700 leading-relaxed">{groupInfo.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Histórico do Fluxograma */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Target className="w-6 h-6 mr-3 text-green-600" />
                Histórico do Fluxograma
              </h3>
              <div className="bg-slate-50 rounded-xl p-6">
                <div className="space-y-4">
                  {patient.flowchartState.history.map((stepId, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{getStepName(stepId)}</p>
                        {patient.flowchartState.answers[stepId] && (
                          <p className="text-sm text-slate-600">Resposta: {patient.flowchartState.answers[stepId]}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Current Step */}
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {patient.flowchartState.history.length + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{getStepName(patient.flowchartState.currentStep)}</p>
                      <p className="text-sm text-blue-600">Em andamento</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exames Laboratoriais */}
            {patient.labResults && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <Brain className="w-6 h-6 mr-3 text-purple-600" />
                  Exames Laboratoriais
                </h3>
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {patient.labResults.hemoglobin && (
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-slate-600">Hemoglobina</p>
                        <p className="text-lg font-bold text-slate-800">{patient.labResults.hemoglobin} g/dL</p>
                      </div>
                    )}
                    {patient.labResults.hematocrit && (
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-slate-600">Hematócrito</p>
                        <p className="text-lg font-bold text-slate-800">{patient.labResults.hematocrit}%</p>
                      </div>
                    )}
                    {patient.labResults.platelets && (
                      <div className="bg-white rounded-lg p-4 border border-purple-200">
                        <p className="text-sm text-slate-600">Plaquetas</p>
                        <p className="text-lg font-bold text-slate-800">{patient.labResults.platelets.toLocaleString()}/mm³</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-slate-600">
                        Status: {patient.labResults.status === 'completed' ? 'Concluído' : 
                                patient.labResults.status === 'pending' ? 'Pendente' : 'Não solicitado'}
                      </span>
                    </div>
                    {patient.labResults.resultDate && (
                      <span className="text-sm text-slate-600">
                        Resultado: {formatDate(patient.labResults.resultDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Prescrições */}
            {patient.treatment.prescriptions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-green-600" />
                  Prescrições Médicas
                </h3>
                <div className="space-y-4">
                  {patient.treatment.prescriptions.map((prescription, index) => (
                    <div key={prescription.id} className="bg-green-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-bold text-green-800">{prescription.medication}</h4>
                        <span className="text-sm text-slate-600">#{index + 1}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-600">Dosagem</p>
                          <p className="font-semibold text-slate-800">{prescription.dosage}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Frequência</p>
                          <p className="font-semibold text-slate-800">{prescription.frequency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Duração</p>
                          <p className="font-semibold text-slate-800">{prescription.duration}</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <p className="text-sm text-slate-600 mb-1">Instruções</p>
                        <p className="text-slate-800">{prescription.instructions}</p>
                      </div>
                      <div className="mt-4 text-sm text-slate-600">
                        Prescrito em: {formatDate(prescription.prescribedAt)} | Por: {prescription.prescribedBy}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observações */}
            {patient.treatment.observations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-amber-600" />
                  Observações Médicas
                </h3>
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                  <ul className="space-y-2">
                    {patient.treatment.observations.map((observation, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                        <span className="text-amber-800">{observation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Footer do Relatório */}
            <div className="border-t-2 border-slate-200 pt-6 mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">DiagnoMap Pro</p>
                    <p className="text-sm text-slate-600">Protocolo Oficial - Ministério da Saúde 2024</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Gerado automaticamente pelo sistema</p>
                  <p className="text-xs text-slate-500">{formatDate(new Date())}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ReportViewer 