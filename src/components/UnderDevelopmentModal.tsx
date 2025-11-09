'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Construction, 
  Clock, 
  Calendar, 
  CheckCircle,
  AlertTriangle,
  Wrench
} from 'lucide-react'

interface UnderDevelopmentModalProps {
  isOpen: boolean
  onClose: () => void
  protocolName: string
  category: string
}

const UnderDevelopmentModal: React.FC<UnderDevelopmentModalProps> = ({
  isOpen,
  onClose,
  protocolName,
  category
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Construction className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Em Desenvolvimento</h2>
                  <p className="text-sm text-gray-500">Protocolo não disponível</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-blue-800 mb-1">{protocolName}</h3>
                <p className="text-sm text-blue-600">Categoria: {category}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Este protocolo está sendo desenvolvido pela nossa equipe</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Previsão de lançamento: Próximas atualizações</span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Wrench className="w-4 h-4 text-purple-500" />
                  <span>Baseado nas diretrizes do Ministério da Saúde</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progresso do desenvolvimento</span>
                  <span className="text-sm text-gray-500">25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full w-1/4"></div>
                </div>
              </div>

              {/* Available Protocols */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Protocolos Disponíveis</span>
                </div>
                <p className="text-sm text-green-600">
                  Dengue, IAM, AVC e Sepsis já estão implementados e prontos para uso.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Entendi
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ver Disponíveis
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UnderDevelopmentModal