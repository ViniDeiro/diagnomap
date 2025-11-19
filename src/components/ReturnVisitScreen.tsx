'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, RefreshCw, AlertTriangle, Clock, ChevronLeft } from 'lucide-react'
import { Patient } from '@/types/patient'

interface ReturnVisitScreenProps {
  patient: Patient
  onCancel: () => void
  onStartReturn: () => void
}

const ReturnVisitScreen: React.FC<ReturnVisitScreenProps> = ({ patient, onCancel, onStartReturn }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <div className="relative bg-white shadow-xl border-b border-slate-200/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-slate-50 to-blue-600/3"></div>
        <div className="relative max-w-5xl mx-auto px-8 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-slate-700 rounded-xl flex items-center justify-center shadow-2xl border border-blue-100">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">Retorno do Paciente</h1>
                <p className="text-slate-600 font-medium">{patient.name} • ID: {patient.medicalRecord}</p>
              </div>
            </div>
            <motion.button
              onClick={onCancel}
              className="flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Voltar</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-1">Iniciar Retorno para Grupo B</h2>
              <p className="text-slate-600">Ao iniciar o retorno, será necessário preencher todos os dados clínicos novamente. O progresso do fluxograma será reiniciado para este paciente.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center space-x-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Paciente</p>
                <p className="font-bold text-slate-800">{patient.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Última Admissão</p>
                <p className="font-bold text-slate-800">{new Date(patient.admission.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-8">
            <p className="text-slate-700"><span className="font-semibold">O que será feito agora?</span> Vamos reiniciar o atendimento para este paciente, limpar dados temporários e abrir o formulário para reentrada completa das informações.</p>
          </div>

          <div className="flex space-x-4">
            <motion.button
              onClick={onCancel}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancelar
            </motion.button>
            <motion.button
              onClick={onStartReturn}
              className="flex-1 bg-gradient-to-r from-blue-600 to-slate-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Iniciar Retorno
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ReturnVisitScreen