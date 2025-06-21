'use client'

import React, { useState } from 'react'
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
  Target
} from 'lucide-react'
import { Patient } from '@/types/patient'
import { patientService } from '@/services/patientService'
import { clsx } from 'clsx'

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
        prescribedBy: 'Dr. Sistema DiagnoMap Pro'
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
                  <p className="text-sm text-slate-600 font-semibold uppercase tracking-wider">Prontuário</p>
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
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                      placeholder="Ex: Paracetamol"
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
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
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
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                      placeholder="Ex: 8/8h"
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
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                      placeholder="Ex: 7 dias"
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                    Instruções Especiais
                  </label>
                  <textarea
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium h-24 resize-none"
                    placeholder="Instruções adicionais para o paciente..."
                  />
                </div>
                
                <div className="flex space-x-4">
                  <motion.button
                    onClick={handleAddPrescription}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Adicionar Prescrição</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setShowAddForm(false)}
                    className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Prescriptions List */}
          <div className="p-8">
            {patient.treatment.prescriptions.length > 0 ? (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-3 h-12 bg-gradient-to-b from-blue-600 to-slate-700 rounded-full"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      Prescrições Médicas
                    </h3>
                    <p className="text-slate-600">{patient.treatment.prescriptions.length} prescrição(ões) ativa(s)</p>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  {patient.treatment.prescriptions.map((prescription, index) => (
                    <motion.div
                      key={prescription.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-r from-white to-slate-50 border border-slate-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-slate-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Pill className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-slate-800 mb-4">{prescription.medication}</h4>
                          
                          <div className="grid lg:grid-cols-4 gap-4 mb-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Dosagem</p>
                              <p className="text-lg font-bold text-blue-800 mt-1">{prescription.dosage}</p>
                            </div>
                            
                            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Frequência</p>
                              <p className="text-lg font-bold text-emerald-800 mt-1">{prescription.frequency}</p>
                            </div>
                            
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                              <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Duração</p>
                              <p className="text-lg font-bold text-amber-800 mt-1">{prescription.duration}</p>
                            </div>
                            
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                              <p className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Prescrito por</p>
                              <p className="text-sm font-bold text-purple-800 mt-1">{prescription.prescribedBy}</p>
                            </div>
                          </div>
                          
                          {prescription.instructions && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Instruções</p>
                              <p className="text-slate-800">{prescription.instructions}</p>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2 mt-4 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            <span>Prescrito em: {new Date(prescription.prescribedAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-300 to-blue-300 rounded-2xl blur-xl opacity-20"></div>
                  <div className="relative w-24 h-24 bg-gradient-to-br from-slate-200 to-blue-200 rounded-2xl flex items-center justify-center mx-auto">
                    <Pill className="w-12 h-12 text-slate-500" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhuma Prescrição</h3>
                <p className="text-slate-600 mb-6">Ainda não há prescrições cadastradas para este paciente</p>
                
                {patient.flowchartState.group && (
                  <motion.button
                    onClick={handleGenerateAutomaticPrescriptions}
                    className="bg-gradient-to-r from-blue-600 to-slate-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Target className="w-5 h-5" />
                    <span>Gerar Prescrições Automáticas</span>
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PrescriptionViewer 