'use client'

import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, AlertTriangle, Activity } from 'lucide-react'

interface SeverityAlertModalProps {
  isOpen: boolean
  onClose: () => void
  level: 'yellow' | 'red'
  triggerTitle?: string
  autoRedirect?: boolean
  onAutoRedirect?: () => void
}

// Modal de atenção para severidade em sinais vitais/exames
// Nível yellow: potencialmente grave (Grupo C ou D)
// Nível red: paciente com gravidade (Grupo D)
const SeverityAlertModal: React.FC<SeverityAlertModalProps> = ({
  isOpen,
  onClose,
  level,
  triggerTitle,
  autoRedirect,
  onAutoRedirect
}) => {
  useEffect(() => {
    // Quando em tela inicial dos sinais vitais, redirecionar automaticamente após breve destaque
    if (isOpen && autoRedirect && onAutoRedirect) {
      const t = setTimeout(() => onAutoRedirect(), 1400)
      return () => clearTimeout(t)
    }
  }, [isOpen, autoRedirect, onAutoRedirect])

  const colors = level === 'red'
    ? {
        bg: 'bg-red-600',
        header: 'text-red-100',
        sub: 'text-red-200',
        panel: 'bg-white',
        ring: 'ring-red-600',
        icon: 'text-red-100',
      }
    : {
        bg: 'bg-yellow-500',
        header: 'text-yellow-100',
        sub: 'text-yellow-200',
        panel: 'bg-white',
        ring: 'ring-yellow-500',
        icon: 'text-yellow-100',
      }

  const title = level === 'red'
    ? 'PACIENTE COM GRAVIDADE'
    : 'POTENCIALMENTE GRAVE'

  // Mensagens específicas por gatilho
  const trigger = (triggerTitle || '').toLowerCase()
  const isHyperthermia = level === 'red' && trigger.includes('hipertermia')
  const isHypoglycemiaModerate = level === 'yellow' && trigger.includes('hipoglicemia moderada')
  const isHypoglycemiaSevere = level === 'red' && trigger.includes('hipoglicemia severa')
  const isHyperglycemiaSevere = level === 'red' && trigger.includes('hiperglicemia severa')
  const isHyperglycemiaHI = level === 'red' && (trigger.includes('hiperglicemia extrema') || trigger.includes('(hi)') || trigger.includes(' hi '))

  const description = (() => {
    // Vermelho: hipertermia específica
    if (isHyperthermia) {
      return 'Paciente apresentando hipertermia grave. Temperaturas acima de 40°C cursam com risco de insolação "heat stroke". Podem aparecer sinais de confusão mental, Delirium, convulsões e coma), além de disfunção de múltiplos órgãos (colapso cardiovascular, Injúria Renal Aguda, Rabdomiolise, disfunção hepática, Coagulação intra-vascular disseminada e Síndrome do Distresse Respiratório Agudo). Se não tratada imediatamente pode ter mortalidade próxima à 80%'
    }
    // Amarelo: hipo moderada
    if (isHypoglycemiaModerate) {
      return 'Paciente hipoglicêmico com potencial para piora clínica. Correção rápida hipoglicemia.'
    }
    // Vermelho: hipo severa
    if (isHypoglycemiaSevere) {
      return 'Paciente com hipoglicemia severa. Alto risco de complicações clínicas e neurológicas. Correção imediata da hipoglicemia.'
    }
    // Vermelho: hiper severa
    if (isHyperglycemiaSevere) {
      return 'Paciente com hiperglicemia severa. Necessita de correção da hiperglicemia e possivelmente hidratação. Atenção à possibilidade de Cetoacidose e Coma Hiperosmolar.'
    }
    // Vermelho: HI
    if (isHyperglycemiaHI) {
      return 'Paciente com hiperglicemia extrema. Necessita de internação com urgência em ambiente de terapia intensiva ou sala de emergência para condução. Correção imediata da hiperglicemia e possivelmente hidratação. Sujeito à complicações graves. Avaliar possibilidade de Cetoacidose e Coma hiperosmolar. Gasometria arterial indicada para facilitar interpretação.'
    }
    // Fallback por nível
    if (level === 'red') {
      return 'Paciente com sinais de choque. Necessita de internação em ambiente de terapia intensiva com conduta imediata. Atentar para deterioração clínica/hemodinâmica e choque refratário. GRUPO D.'
    }
    return 'Paciente com sinais de gravidade, necessita de internação para observação e conduta. Atentar para sinais de choque e deterioração clínica/hemodinâmica. Grupo C ou D.'
  })()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className={`relative max-w-xl w-full overflow-hidden rounded-2xl shadow-2xl ${colors.bg}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header banner */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/10 rounded-xl">
                    {level === 'red' ? (
                      <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />
                    ) : (
                      <Activity className={`w-6 h-6 ${colors.icon}`} />
                    )}
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${colors.header}`}>{title}</h2>
                    <p className={`text-xs ${colors.sub}`}>Atenção imediata aos achados</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Fechar"
                >
                  <X className={`w-5 h-5 ${colors.header}`} />
                </button>
              </div>
            </div>

            {/* Content panel */}
            <div className={`${colors.panel} px-6 py-5 rounded-t-2xl -mt-2`}> 
              {triggerTitle && (
                <div className="mb-3">
                  <div className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border bg-white shadow-sm">
                    <span className="text-slate-700">Achado: {triggerTitle}</span>
                  </div>
                </div>
              )}
              <p className="text-sm text-slate-700 leading-relaxed">
                {description}
              </p>

              {autoRedirect && (
                <div className="mt-4 text-xs text-slate-600">
                  Redirecionando automaticamente para o grupo adequado...
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg text-sm font-medium bg-white border ${colors.ring} text-slate-700 hover:bg-slate-50`}
                >
                  Entendi
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SeverityAlertModal

