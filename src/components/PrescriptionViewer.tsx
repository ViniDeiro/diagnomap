'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  User, 
  Pill, 
  CheckCircle, 
  X, 
  Plus,
  Stethoscope,
  Calendar,
  Award,
  Target,
  Download,
  FlaskConical
} from 'lucide-react'
import { Patient } from '@/types/patient'
import { patientService } from '@/services/patientService'
import { clsx } from 'clsx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface PrescriptionViewerProps {
  patient: Patient
  onClose: () => void
  onUpdate: () => void
}

const PrescriptionViewer: React.FC<PrescriptionViewerProps> = ({
  patient,
  onClose,
  onUpdate
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const prescriptionRef = useRef<HTMLDivElement>(null)
  const labRef = useRef<HTMLDivElement>(null)
  const [newPrescription, setNewPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: ''
  })

  const handleAddPrescription = () => {
    if (newPrescription.medication && newPrescription.dosage) {
      patientService.addPrescription(patient.id, {
        ...newPrescription,
        prescribedBy: 'Dr. Sistema Siga o Fluxo'
      })
      
      setNewPrescription({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      })
      setShowAddForm(false)
      onUpdate()
    }
  }

  const handleGenerateAutomaticPrescriptions = () => {
    if (patient.flowchartState.group) {
      patientService.generatePrescriptions(patient.id, patient.flowchartState.group)
      onUpdate()
    }
  }

  const downloadPrescriptions = async () => {
    if (!prescriptionRef.current) return

    try {
      const canvas = await html2canvas(prescriptionRef.current, {
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

      pdf.save(`receita_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF da receita:', error)
      alert('Erro ao gerar PDF da receita. Tente novamente.')
    }
  }

  const downloadLabOrders = async () => {
    if (!labRef.current) return

    try {
      const canvas = await html2canvas(labRef.current, {
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

      pdf.save(`exames_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF dos exames:', error)
      alert('Erro ao gerar PDF dos exames. Tente novamente.')
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

  const getLabOrdersForGroup = (group?: 'A' | 'B' | 'C' | 'D') => {
    const labOrders = {
      A: [],
      B: [
        'Hemograma completo',
        'Hematócrito',
        'Contagem de plaquetas',
        'Albumina sérica',
        'Transaminases (ALT/AST)'
      ],
      C: [
        'Hemograma completo',
        'Hematócrito',
        'Contagem de plaquetas',
        'Albumina sérica',
        'Transaminases (ALT/AST)',
        'Tempo de protrombina',
        'Tempo de tromboplastina parcial ativada',
        'Gasometria arterial'
      ],
      D: [
        'Hemograma completo',
        'Hematócrito',
        'Contagem de plaquetas',
        'Albumina sérica',
        'Transaminases (ALT/AST)',
        'Tempo de protrombina',
        'Tempo de tromboplastina parcial ativada',
        'Gasometria arterial',
        'Lactato',
        'Ureia e creatinina',
        'Eletrólitos'
      ]
    }
    return group ? labOrders[group] : []
  }

  // Função para calcular hidratação oral baseada no peso
  const calculateHydration = (weight?: number) => {
    if (!weight) return null
    
    const totalDaily = Math.round(weight * 60) // mL/dia
    const withSalts = Math.round(totalDaily / 3) // 1/3 com sais
    const withLiquids = Math.round((totalDaily * 2) / 3) // 2/3 com líquidos caseiros
    
    return {
      totalDaily,
      withSalts,
      withLiquids,
      liters: (totalDaily / 1000).toFixed(1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-slate-200"
      >
        {/* Premium Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-slate-600 to-blue-700 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700/30 to-slate-800/30"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
          
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-lg"></div>
                  <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Prescrições Médicas</h1>
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="w-5 h-5 text-blue-200" />
                    <span className="text-blue-100 font-medium">Paciente: {patient.name}</span>
                  </div>
                </div>
              </div>
              
              <motion.button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-xl transition-all duration-200 border border-white/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          
          {/* Patient Information Card */}
          <div className="p-8 border-b border-slate-200">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-2xl border border-slate-200/50">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Informações do Paciente
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-600 font-semibold uppercase tracking-wider">Nome</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{patient.name}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-600 font-semibold uppercase tracking-wider">Idade</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{patient.age} anos</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-600 font-semibold uppercase tracking-wider">ID do Paciente</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{patient.medicalRecord}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-sm text-slate-600 font-semibold uppercase tracking-wider">Grupo</p>
                  <div className="mt-1">
                    {patient.flowchartState.group ? (
                      <span className={clsx(
                        "inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold",
                        patient.flowchartState.group === 'A' && "bg-blue-100 text-blue-800",
                        patient.flowchartState.group === 'B' && "bg-emerald-100 text-emerald-800",
                        patient.flowchartState.group === 'C' && "bg-amber-100 text-amber-800",
                        patient.flowchartState.group === 'D' && "bg-red-100 text-red-800"
                      )}>
                        <Award className="w-3 h-3 mr-1" />
                        GRUPO {patient.flowchartState.group}
                      </span>
                    ) : (
                      <span className="text-slate-500">Não classificado</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 border-b border-slate-200">
            <div className="flex flex-wrap gap-4">
              {patient.flowchartState.group && patient.treatment.prescriptions.length === 0 && (
                <motion.button
                  onClick={handleGenerateAutomaticPrescriptions}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Gerar Receitas Protocolo</span>
                  <Target className="w-4 h-4" />
                </motion.button>
              )}
              
              <motion.button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-gradient-to-r from-blue-600 to-slate-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-5 h-5" />
                <span>Nova Prescrição</span>
              </motion.button>

              <motion.button
                onClick={downloadPrescriptions}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-5 h-5" />
                <span>Baixar Receituário</span>
              </motion.button>

              {patient.flowchartState.group && patient.flowchartState.group !== 'A' && (
                <motion.button
                  onClick={downloadLabOrders}
                  className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FlaskConical className="w-5 h-5" />
                  <span>Baixar Pedido de Exames</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Add Prescription Form */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-8 border-b border-slate-200"
            >
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 p-6 rounded-2xl border border-blue-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <Pill className="w-6 h-6 mr-3 text-blue-600" />
                  Nova Prescrição Médica
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                      Medicamento *
                    </label>
                    <input
                      type="text"
                      value={newPrescription.medication}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, medication: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Nome do medicamento"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                      Dosagem *
                    </label>
                    <input
                      type="text"
                      value={newPrescription.dosage}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Ex: 500mg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                      Frequência
                    </label>
                    <input
                      type="text"
                      value={newPrescription.frequency}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, frequency: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Ex: 3x ao dia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                      Duração
                    </label>
                    <input
                      type="text"
                      value={newPrescription.duration}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                      placeholder="Ex: 7 dias"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                      Instruções de Uso
                    </label>
                    <textarea
                      value={newPrescription.instructions}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Instruções detalhadas para o paciente"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPrescription}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-slate-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                  >
                    Adicionar Prescrição
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Medical Prescription - New Format */}
          <div className="p-8 border-b border-slate-200">
            <div ref={prescriptionRef} className="bg-white p-8 font-serif">
              {/* Header */}
              <div className="text-center mb-8 border-b-2 border-slate-800 pb-6">
                <h1 className="text-4xl font-bold text-slate-800 mb-4">RECEITUÁRIO MÉDICO</h1>
              </div>

              {/* Patient Information */}
              <div className="mb-8">
                <div className="grid grid-cols-2 gap-8 text-lg">
                  <div>
                    <strong>Paciente:</strong> {patient.name}
                  </div>
                  <div>
                    <strong>Idade:</strong> {patient.age} anos
                  </div>
                </div>
                <div className="mt-4 text-lg">
                  <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* Diagnosis */}
              <div className="mb-8">
                <div className="text-lg">
                  <strong>Diagnóstico:</strong> Dengue
                </div>
              </div>

              {/* Orientations */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Orientações:</h2>
                
                {/* 1. Hydration */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">1. Hidratação Oral</h3>
                  {patient.weight && calculateHydration(patient.weight) ? (
                    <div className="ml-6 space-y-3 text-lg leading-relaxed">
                      <div>
                        <strong>• Recomendação:</strong> 60 mL/kg/dia
                      </div>
                      <div>
                        <strong>• Cálculo para um paciente de {patient.weight} kg:</strong>
                      </div>
                      <div className="ml-8 space-y-2">
                        <div>§ {patient.weight} kg × 60 mL = {calculateHydration(patient.weight)!.totalDaily} mL/dia ({calculateHydration(patient.weight)!.liters} litros/dia)</div>
                        <div>§ 1/3 com sais de reidratação oral → {calculateHydration(patient.weight)!.withSalts} mL/dia</div>
                        <div>§ 2/3 com líquidos caseiros → {calculateHydration(patient.weight)!.withLiquids} mL/dia (água, suco de frutas, soro caseiro, chás, água de coco etc.)</div>
                        <div>§ Inicialmente, oferecer maior volume para evitar desidratação.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-6 space-y-3 text-lg leading-relaxed">
                      <div>
                        <strong>• Recomendação:</strong> 60 mL/kg/dia
                      </div>
                      <div>
                        <strong>• Orientação geral:</strong>
                      </div>
                      <div className="ml-8 space-y-2">
                        <div>§ 1/3 com sais de reidratação oral</div>
                        <div>§ 2/3 com líquidos caseiros (água, suco de frutas, soro caseiro, chás, água de coco etc.)</div>
                        <div>§ Inicialmente, oferecer maior volume para evitar desidratação.</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Immediate Return */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">2. Retorno Imediato na presença de sinais de alarme, incluindo:</h3>
                  <div className="ml-6 space-y-2 text-lg leading-relaxed">
                    <div>• Dor abdominal intensa e contínua</div>
                    <div>• Vômitos persistentes</div>
                    <div>• Sangramentos de mucosa ou outros sinais de hemorragia</div>
                    <div>• Letargia ou irritabilidade</div>
                    <div>• Hipotensão ou tontura</div>
                    <div>• Diminuição repentina da diurese (urina reduzida)</div>
                  </div>
                </div>

                {/* 3. Outpatient Follow-up */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">3. Seguimento Ambulatorial</h3>
                  <div className="ml-6 space-y-2 text-lg leading-relaxed">
                    <div>• Caso não haja defervescência (queda da febre), retornar ao serviço de saúde no 5° dia da doença para nova avaliação.</div>
                    <div>• Acompanhamento deve ser realizado em nível ambulatorial, com observação dos sinais clínicos e reavaliação periódica.</div>
                  </div>
                </div>

                {/* 4. Antipyretics */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">4. Antitérmicos Permitidos</h3>
                  <div className="ml-6 space-y-2 text-lg leading-relaxed">
                    <div>• Dipirona: adultos 500–1000 mg VO a cada 6–8h (máx 4 g/dia)</div>
                    <div>• Paracetamol: adultos 500–750 mg VO a cada 6–8h (máx 3 g/dia)</div>
                    <div>• Crianças: 10–15 mg/kg VO a cada 6–8h (máx 60 mg/kg/dia)</div>
                  </div>
                </div>

                {/* 5. Contraindications */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">5. Medicamentos Contraindicados</h3>
                  <div className="ml-6 space-y-2 text-lg leading-relaxed">
                    <div>• Aspirina (ácido acetilsalicílico) e salicilatos</div>
                    <div>• Anti-inflamatórios não esteroidais (AINEs): ibuprofeno, diclofenaco, naproxeno, entre outros</div>
                  </div>
                </div>
              </div>

              {/* Additional Prescriptions */}
              {patient.treatment.prescriptions.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6">Medicamentos Prescritos:</h2>
                  <div className="space-y-4">
                    {patient.treatment.prescriptions.map((prescription, index) => (
                      <div key={prescription.id} className="border-l-4 border-slate-400 pl-6 text-lg">
                        <div className="font-bold">{index + 1}. {prescription.medication}</div>
                        <div className="ml-4 mt-2 space-y-1">
                          <div>Dosagem: {prescription.dosage}</div>
                          <div>Frequência: {prescription.frequency}</div>
                          <div>Duração: {prescription.duration}</div>
                          {prescription.instructions && (
                            <div>Instruções: {prescription.instructions}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Doctor Signature */}
              <div className="mt-16 pt-8 border-t border-slate-400">
                <div className="text-lg">
                  <strong>Assinatura do Médico:</strong>
                </div>
                <div className="mt-8 space-y-2 text-lg">
                  <div>__________________________________________________</div>
                  <div>Dr. Sistema Siga o Fluxo / CRM: XXXX.XXX</div>
                </div>
              </div>
            </div>
          </div>

          {/* Lab Orders - For Download */}
          {patient.flowchartState.group && patient.flowchartState.group !== 'A' && (
            <div className="p-8">
              <div ref={labRef} className="bg-white p-8">
                {/* Lab Order Header */}
                <div className="text-center mb-8 border-b-2 border-slate-200 pb-6">
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">SOLICITAÇÃO DE EXAMES</h1>
                  <p className="text-lg text-slate-600">Sistema Siga o Fluxo</p>
                  <p className="text-sm text-slate-500">Data: {formatDate(new Date())}</p>
                </div>

                {/* Patient Info */}
                <div className="mb-8 p-6 bg-slate-50 rounded-lg">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">Dados do Paciente</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Nome:</p>
                      <p className="text-lg font-semibold text-slate-800">{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Idade:</p>
                      <p className="text-lg font-semibold text-slate-800">{patient.age} anos</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">ID do Paciente:</p>
                      <p className="text-lg font-semibold text-slate-800">{patient.medicalRecord}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Classificação:</p>
                      <p className="text-lg font-semibold text-slate-800">Grupo {patient.flowchartState.group}</p>
                    </div>
                  </div>
                </div>

                {/* Lab Tests */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-800">Exames Solicitados</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {getLabOrdersForGroup(patient.flowchartState.group).map((test, index) => (
                      <div key={index} className="flex items-center p-4 border border-slate-300 rounded-lg">
                        <div className="w-6 h-6 border-2 border-slate-400 rounded mr-4"></div>
                        <span className="text-lg text-slate-800">{test}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t-2 border-slate-200 text-center">
                  <p className="text-sm text-slate-600">Solicitação gerada automaticamente pelo Sistema Siga o Fluxo</p>
                  <p className="text-xs text-slate-500 mt-2">Data de emissão: {formatDate(new Date())}</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Prescriptions Display */}
          {patient.treatment.prescriptions.length > 0 && (
            <div className="p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                <Pill className="w-6 h-6 mr-3 text-green-600" />
                Prescrições Ativas
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
        </div>
      </motion.div>
    </div>
  )
}

export default PrescriptionViewer