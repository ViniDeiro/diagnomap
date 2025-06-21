'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Calendar, 
  Weight, 
  FileText, 
  Thermometer, 
  Activity, 
  Save, 
  AlertCircle,
  ArrowLeft,
  Stethoscope,
  Heart,
  Target,
  Shield
} from 'lucide-react'
import { PatientFormData } from '@/types/patient'
import { clsx } from 'clsx'

interface PatientFormProps {
  onSubmit: (data: PatientFormData) => void
  onCancel: () => void
}

const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    age: 0,
    weight: undefined,
    medicalRecord: '',
    symptoms: [],
    vitalSigns: {
      temperature: undefined,
      bloodPressure: '',
      heartRate: undefined,
      respiratoryRate: undefined
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)

  const dengueSymptoms = [
    'Febre',
    'Cefaleia',
    'Dor retro-orbitária',
    'Mialgia',
    'Artralgia',
    'Náuseas',
    'Vômitos',
    'Exantema',
    'Petéquias',
    'Dor abdominal',
    'Sangramento espontâneo',
    'Letargia',
    'Irritabilidade'
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.age || formData.age < 0 || formData.age > 120) {
      newErrors.age = 'Idade deve ser entre 0 e 120 anos'
    }

    if (!formData.medicalRecord.trim()) {
      newErrors.medicalRecord = 'Prontuário é obrigatório'
    }

    if (formData.symptoms.length === 0) {
      newErrors.symptoms = 'Selecione pelo menos um sintoma'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleSymptomToggle = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      
      {/* Premium Medical Header */}
      <div className="relative bg-white shadow-xl border-b border-slate-200/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-slate-50 to-blue-600/3"></div>
        
        <div className="relative max-w-7xl mx-auto px-8 py-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-6"
          >
            <motion.button
              onClick={onCancel}
              className="group p-3 bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-xl border border-slate-300 shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-6 h-6 text-slate-600 group-hover:text-slate-700" />
            </motion.button>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl blur-xl opacity-20 scale-110"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl border border-blue-100">
                  <User className="w-7 h-7 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                  Novo Atendimento
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">
                    Cadastro de Paciente
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        
        {/* Progress Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              {[
                { step: 1, label: 'Dados Pessoais', icon: User },
                { step: 2, label: 'Sintomas Clínicos', icon: Heart },
                { step: 3, label: 'Sinais Vitais', icon: Activity }
              ].map(({ step, label, icon: Icon }) => (
                <div key={step} className="flex items-center space-x-3">
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    currentStep >= step 
                      ? "bg-gradient-to-r from-blue-600 to-slate-700 text-white shadow-lg" 
                      : "bg-slate-100 text-slate-400"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={clsx(
                    "font-medium",
                    currentStep >= step ? "text-slate-800" : "text-slate-400"
                  )}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden"
        >
          {/* Card Header */}
          <div className="h-2 bg-gradient-to-r from-blue-600 via-slate-400 to-blue-600"></div>
          
          <form onSubmit={handleSubmit} className="p-8">
            
            {/* Step 1: Dados Pessoais */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-12 bg-gradient-to-b from-blue-600 to-slate-700 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Dados Pessoais</h2>
                    <p className="text-slate-600">Informações básicas do paciente</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Nome */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Nome Completo *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={clsx(
                          "w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium",
                          errors.name ? "border-red-400 bg-red-50" : ""
                        )}
                        placeholder="Digite o nome completo do paciente"
                      />
                    </div>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-2 rounded-lg"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  {/* Idade */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Idade *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.age || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                        className={clsx(
                          "w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium",
                          errors.age ? "border-red-400 bg-red-50" : ""
                        )}
                        placeholder="Anos"
                        min="0"
                        max="120"
                      />
                    </div>
                    {errors.age && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-2 rounded-lg"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errors.age}
                      </motion.p>
                    )}
                  </div>

                  {/* Peso */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Peso (kg)
                    </label>
                    <div className="relative">
                      <Weight className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.weight || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                        placeholder="Opcional"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Prontuário */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Número do Prontuário *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.medicalRecord}
                        onChange={(e) => setFormData(prev => ({ ...prev, medicalRecord: e.target.value }))}
                        className={clsx(
                          "w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium",
                          errors.medicalRecord ? "border-red-400 bg-red-50" : ""
                        )}
                        placeholder="Ex: 2024001234"
                      />
                    </div>
                    {errors.medicalRecord && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-2 rounded-lg"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {errors.medicalRecord}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-gradient-to-r from-blue-600 to-slate-700 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Próximo: Sintomas</span>
                    <Heart className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Sintomas */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-12 bg-gradient-to-b from-blue-600 to-slate-700 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Sintomas Clínicos</h2>
                    <p className="text-slate-600">Selecione os sintomas apresentados pelo paciente</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dengueSymptoms.map((symptom, index) => (
                    <motion.button
                      key={symptom}
                      type="button"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSymptomToggle(symptom)}
                      className={clsx(
                        "p-4 rounded-xl border-2 transition-all duration-200 text-left font-medium",
                        formData.symptoms.includes(symptom)
                          ? "bg-gradient-to-r from-blue-50 to-slate-50 border-blue-500 text-blue-700 shadow-lg"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{symptom}</span>
                        {formData.symptoms.includes(symptom) && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {errors.symptoms && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 flex items-center bg-red-50 px-4 py-3 rounded-xl"
                  >
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {errors.symptoms}
                  </motion.p>
                )}

                <div className="flex justify-between pt-6">
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Voltar
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="bg-gradient-to-r from-blue-600 to-slate-700 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Próximo: Sinais Vitais</span>
                    <Activity className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Sinais Vitais */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-3 h-12 bg-gradient-to-b from-blue-600 to-slate-700 rounded-full"></div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Sinais Vitais</h2>
                    <p className="text-slate-600">Dados opcionais para avaliação complementar</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Temperatura */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Temperatura (°C)
                    </label>
                    <div className="relative">
                      <Thermometer className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.vitalSigns?.temperature || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            temperature: parseFloat(e.target.value) || undefined
                          }
                        }))}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                        placeholder="Ex: 37.5"
                        step="0.1"
                        min="35"
                        max="42"
                      />
                    </div>
                  </div>

                  {/* Pressão Arterial */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Pressão Arterial
                    </label>
                    <div className="relative">
                      <Heart className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        value={formData.vitalSigns?.bloodPressure || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            bloodPressure: e.target.value
                          }
                        }))}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                        placeholder="Ex: 120/80"
                      />
                    </div>
                  </div>

                  {/* Frequência Cardíaca */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Frequência Cardíaca (bpm)
                    </label>
                    <div className="relative">
                      <Activity className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.vitalSigns?.heartRate || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            heartRate: parseInt(e.target.value) || undefined
                          }
                        }))}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                        placeholder="Ex: 80"
                        min="40"
                        max="200"
                      />
                    </div>
                  </div>

                  {/* Frequência Respiratória */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
                      Frequência Respiratória (rpm)
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        value={formData.vitalSigns?.respiratoryRate || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          vitalSigns: {
                            ...prev.vitalSigns,
                            respiratoryRate: parseInt(e.target.value) || undefined
                          }
                        }))}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 font-medium"
                        placeholder="Ex: 16"
                        min="8"
                        max="40"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-slate-100 text-slate-700 px-6 py-3 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Voltar
                  </motion.button>
                  
                  <motion.button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-bold flex items-center space-x-3 text-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="w-6 h-6" />
                    <span>Iniciar Fluxograma</span>
                    <Target className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default PatientForm 