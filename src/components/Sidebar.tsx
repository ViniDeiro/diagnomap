import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Stethoscope, 
  Plus, 
  Activity, 
  Clock, 
  Users, 
  Search, 
  FileText, 
  BookOpen, 
  AlertTriangle, 
  Settings, 
  ChevronRight,
  User
} from 'lucide-react'
import Link from 'next/link'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userAvatar?: string
  userName?: string
  userEmail?: string
  onProfileClick?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  userAvatar, 
  userName, 
  userEmail,
  onProfileClick
}) => {
  
  const menuGroups = [
    {
      items: [
        { icon: Plus, label: 'Novo atendimento', href: '#' },
        { icon: Activity, label: 'Fluxos clínicos', href: '#' },
        { icon: Clock, label: 'Histórico de atendimentos', href: '#' },
      ]
    },
    {
      title: 'Pacientes',
      items: [
        { icon: Users, label: 'Pacientes', href: '#' },
        { icon: Search, label: 'Buscar paciente', href: '#' },
        { icon: FileText, label: 'Registros anteriores', href: '#' },
      ]
    },
    {
      title: 'Suporte Clínico',
      items: [
        { icon: BookOpen, label: 'Protocolos', href: '#' },
        { icon: AlertTriangle, label: 'Classificação de risco', href: '#' },
      ]
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Overlay Escuro) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-[70] overflow-y-auto flex flex-col"
          >
            <div className="p-6 flex-1">
              {/* Botão Fechar (Mobile principalmente) */}
              <div className="flex justify-end mb-4 md:hidden">
                <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Botão Destaque: Atendimentos em Andamento */}
              <div className="mb-8">
                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-4 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-between group transition-all hover:shadow-blue-500/30 hover:scale-[1.02]">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-6 h-6" />
                    <div className="text-left leading-tight">
                      <span className="block font-bold text-sm">Atendimentos</span>
                      <span className="block font-medium text-xs opacity-90">em andamento</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-80 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Grupos de Menu */}
              <div className="space-y-8">
                {menuGroups.map((group, groupIndex) => (
                  <div key={groupIndex}>
                    {group.title && (
                      <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-4 px-2">
                        {group.title}
                      </h3>
                    )}
                    <div className="space-y-1">
                      {group.items.map((item, itemIndex) => (
                        <Link 
                          key={itemIndex} 
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors group"
                        >
                          <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <item.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rodapé: Perfil e Configurações */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div 
                  className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    onProfileClick?.()
                    onClose()
                  }}
                >
                  <div className="relative">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{userName || "Médico(a)"}</p>
                    <p className="text-xs text-slate-400 truncate">{userEmail || "email@exemplo.com"}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    onProfileClick?.()
                    onClose()
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Sidebar