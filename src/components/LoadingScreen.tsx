import React from 'react'
import { motion } from 'framer-motion'
import {
  Loader2,
  Brain,
  Target
} from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Inicializando Siga o Fluxo..."
}) => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center relative overflow-hidden">

      {/* Background pattern igual ao site */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-slate-50 to-blue-600/3"></div>

      {/* Padrão geométrico sutil */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url('data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23334155" fill-opacity="0.4"%3E%3Cpath d="M20 20h40v40H20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
      }}></div>

      <div className="text-center relative z-10 max-w-xl mx-auto px-8">

        {/* Logo igual ao Header */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.div
            className="relative"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Glow igual ao site */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl blur-xl opacity-20 scale-110"></div>

            {/* Container do logo */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <img
                  src="/logo.jpeg"
                  alt="Siga o Fluxo"
                  className="h-32 w-auto object-contain rounded-2xl shadow-2xl"
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Container de Texto e Loading */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1.2 }}
        >
          {/* Subtítulo igual ao Header */}
          <motion.div
            className="flex items-center justify-center space-x-2 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">
              Fluxogramas de apoio para decisão terapêutica
            </span>
            <Target className="w-4 h-4 text-blue-600" />
          </motion.div>

          {/* Linha divisória elegante */}
          <motion.div
            className="h-0.5 w-24 bg-gradient-to-r from-transparent via-blue-600 to-transparent mx-auto mb-6"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ delay: 1.3, duration: 1.5 }}
          />
        </motion.div>

        {/* Loading card com estilo do site */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1.2 }}
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <motion.div
              className="relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full blur opacity-20"></div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-white" />
              </div>
            </motion.div>
            <motion.span
              className="text-slate-700 font-semibold text-lg"
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {message}
            </motion.span>
          </div>

          {/* Barra de progresso com cores do site */}
          <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
          </div>

          {/* Status text */}
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
          >
            <p className="text-slate-500 text-sm font-medium">
              Preparando ambiente clínico...
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoadingScreen