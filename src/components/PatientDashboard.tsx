'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { emergencyFlowcharts } from '@/data/emergencyFlowcharts'
import { AnimatedLogo } from './AnimatedLogo'
import {
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Activity,
  ChevronRight,
  FileText,
  Heart,
  Shield,
  Zap,
  Award,
  Brain,
  Target,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  MoreHorizontal,
  Pill
} from 'lucide-react'
import { Patient } from '@/types/patient'
import { patientService } from '@/services/patientService'
import { listPatients } from '@/services/patientRepo'
import { toUIPatient } from '@/services/patientRepo'
import { updatePatientWithFlowLink } from '@/services/patientRepo'
import { fromUIPatient } from '@/services/patientRepo'
import { clsx } from 'clsx'
import { supabase } from '@/services/supabaseClient'

interface PatientDashboardProps {
  onNewPatient: () => void
  onSelectPatient: (patient: Patient) => void
  onViewPrescriptions: (patient: Patient) => void
  onViewReport: (patient: Patient) => void
  onViewMedicalPrescription: (patient: Patient) => void
  onReturnVisit: (patient: Patient) => void
  refreshTrigger?: number
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onNewPatient,
  onSelectPatient,
  onViewPrescriptions,
  onViewReport,
  onViewMedicalPrescription,
  onReturnVisit,
  refreshTrigger
}) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showTransferModal, setShowTransferModal] = useState<string | null>(null)
  const [transferQuery, setTransferQuery] = useState('')
  const [doctorOptions, setDoctorOptions] = useState<{ id: string; name: string; crm: string | null; email: string | null }[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null)
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)
  const patientsPerPage = 10
  const [avatarUrl, setAvatarUrl] = useState<string>('')

  // Carregar pacientes no início e sempre que houver refreshTrigger
  const isFirstLoadRef = useRef(true)
  useEffect(() => {
    const load = async () => {
      if (isFirstLoadRef.current) {
        setIsLoading(true)
        setLoadError(null)
        setTimeout(async () => {
          try {
            const rows = await listPatients()
            const allPatients = rows.map(toUIPatient)
            if (allPatients.length === 0) {
              const fallback = patientService.getAllPatients()
              setPatients(fallback)
              try {
                for (const p of fallback) {
                  const payload = fromUIPatient(p)
                  await updatePatientWithFlowLink(p.id, payload)
                }
              } catch {}
            } else {
              setPatients(allPatients)
              try {
                const fallback = patientService.getAllPatients()
                if (fallback.length > allPatients.length) {
                  for (const p of fallback) {
                    const payload = fromUIPatient(p)
                    await updatePatientWithFlowLink(p.id, payload)
                  }
                  const rows2 = await listPatients()
                  setPatients(rows2.map(toUIPatient))
                }
              } catch {}
            }
          } catch (e: any) {
            console.error('Falha ao listar pacientes:', e)
            const msg = e?.message || 'Não foi possível carregar pacientes.'
            setLoadError(msg)
            try {
              const fallback = patientService.getAllPatients()
              setPatients(fallback)
            } catch {}
          } finally {
            setIsLoading(false)
            isFirstLoadRef.current = false
          }
        }, 800)
      } else {
        try {
          const rows = await listPatients()
          const allPatients = rows.map(toUIPatient)
          if (allPatients.length === 0) {
            const fallback = patientService.getAllPatients()
            setPatients(fallback)
            try {
              for (const p of fallback) {
                const payload = fromUIPatient(p)
                await updatePatientWithFlowLink(p.id, payload)
              }
            } catch {}
          } else {
            setPatients(allPatients)
            try {
              const fallback = patientService.getAllPatients()
              if (fallback.length > allPatients.length) {
                for (const p of fallback) {
                  const payload = fromUIPatient(p)
                  await updatePatientWithFlowLink(p.id, payload)
                }
                const rows2 = await listPatients()
                setPatients(rows2.map(toUIPatient))
              }
            } catch {}
          }
        } catch (e: any) {
          console.error('Falha ao atualizar lista de pacientes:', e)
          const msg = e?.message || 'Erro ao atualizar lista de pacientes.'
          setLoadError(msg)
          try {
            const fallback = patientService.getAllPatients()
            setPatients(fallback)
          } catch {}
        }
      }
    }
    load()
  }, [refreshTrigger])

  useEffect(() => {
    const loadAvatar = async () => {
      const { data: userRes } = await supabase.auth.getUser()
      const user = userRes?.user
      if (!user) return
      const metaAvatar = (user.user_metadata as any)?.avatar_url || ''
      if (metaAvatar) setAvatarUrl(metaAvatar)
    }
    loadAvatar()
  }, [])

  // Restaurar página atual ao montar (evita voltar para página 1 ao fechar modais)
  useEffect(() => {
    // Página inicial sempre 1; persistência futura via perfil do médico
    setCurrentPage(1)
  }, [])

  // Persistir página ao mudar
  useEffect(() => {
    // Persistência de página será movida para perfil do médico em breve
  }, [currentPage])

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medicalRecord.includes(searchTerm)
  )

  useEffect(() => {
    const t = setTimeout(async () => {
      if (transferQuery.trim().length < 2) {
        setDoctorOptions([])
        return
      }
      try {
        const { searchDoctors } = await import('@/services/doctorRepo')
        const rows = await searchDoctors(transferQuery.trim(), { limit: 8 })
        const opts = rows.map((r: any) => ({
          id: r.id as string,
          name: r.name as string,
          crm: (r.crm ?? null) as string | null,
          email: (r.email ?? null) as string | null
        }))
        setDoctorOptions(opts)
      } catch (e) {
        setDoctorOptions([])
      }
    }, 300)
    return () => clearTimeout(t)
  }, [transferQuery])

  // Reset página quando busca mudar
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const getStatusIcon = (status: Patient['status']) => {
    switch (status) {
      case 'active': return <Activity className="w-5 h-5 text-emerald-500" />
      case 'waiting_labs': return <Clock className="w-5 h-5 text-amber-500" />
      case 'discharged': return <Heart className="w-5 h-5 text-blue-500" />
      default: return <User className="w-5 h-5 text-slate-500" />
    }
  }

  const getStatusText = (status: Patient['status']) => {
    switch (status) {
      case 'active': return 'Em Atendimento'
      case 'waiting_labs': return 'Aguardando Exames'
      case 'discharged': return 'Atendimento Finalizado'
      default: return 'Aguardando Avaliação'
    }
  }

  const getVisitText = (returnCount?: number) => {
    const count = returnCount ?? 0
    if (count <= 0) return 'Primeira visita'
    return `${count}º retorno`
  }

  const getGroupBadge = (group?: 'A' | 'B' | 'C' | 'D') => {
    if (!group) return null

    const colors = {
      A: 'from-blue-600 to-blue-700 border-blue-500',
      B: 'from-emerald-600 to-emerald-700 border-emerald-500',
      C: 'from-amber-600 to-amber-700 border-amber-500',
      D: 'from-red-600 to-red-700 border-red-500'
    }

    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={clsx(
          'inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-gradient-to-r text-white shadow-lg border-l-4',
          colors[group]
        )}
      >
        <Award className="w-3.5 h-3.5 mr-2" />
        Classificação {group}
      </motion.span>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleDeletePatient = async (patientId: string) => {
    try {
      // Tentar deletar do banco
      const { deletePatient } = await import('@/services/patientRepo')
      await deletePatient(patientId)
    } catch (e) {
      console.warn('Erro ao deletar do banco (pode ser paciente local):', e)
    }

    // Deletar do serviço local
    try {
      patientService.deletePatient(patientId)
    } catch (e) {
      console.warn('Erro ao deletar localmente:', e)
    }

    // Atualizar estado da UI
    setPatients(prev => prev.filter(p => p.id !== patientId))
    setShowDeleteConfirm(null)

    const newTotalPages = Math.ceil((filteredPatients.length - 1) / patientsPerPage)
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages)
    }
  }

  const handleConfirmTransfer = async () => {
    if (!showTransferModal) return
    setIsTransferring(true)
    setTransferError(null)
    try {
      const { transferPatient } = await import('@/services/doctorRepo')
      if (!selectedDoctorId) throw new Error('Selecione um médico da lista.')
      await transferPatient(showTransferModal, selectedDoctorId)
      const rows = await listPatients()
      const allPatients = rows.map(toUIPatient)
      setPatients(allPatients)
      setShowTransferModal(null)
      setTransferQuery('')
      setSelectedDoctorId(null)
      setDoctorOptions([])
    } catch (e: any) {
      const msg = e?.message || 'Falha ao transferir paciente.'
      setTransferError(msg)
    } finally {
      setIsTransferring(false)
    }
  }

  // Calcular paginação
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage)
  const startIndex = (currentPage - 1) * patientsPerPage
  const endIndex = startIndex + patientsPerPage
  const currentPatients = filteredPatients.slice(startIndex, endIndex)

  // Pacientes Recentes (Ex: status 'discharged' ou 'active' ordenados por update)
  const recentPatients = patients
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt).getTime()
      const dateB = new Date(b.updatedAt || b.createdAt).getTime()
      return dateB - dateA
    })
    .slice(0, 3) // Pegar os 3 mais recentes

  const getFlowchartName = (id?: string) => {
    if (!id) return 'Não definido'
    return emergencyFlowcharts[id]?.name || id.charAt(0).toUpperCase() + id.slice(1)
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Top Section: Title & New Patient Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
           <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-1">Atendimentos em Andamento</h1>
              <p className="text-slate-500 font-medium">
                {patients.length} {patients.length === 1 ? 'paciente' : 'pacientes'} em atendimento ativo
              </p>
           </div>
           
           <motion.button
              onClick={onNewPatient}
              className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
           >
              <div className="flex items-center space-x-2 relative z-10">
                 <div className="bg-white/20 p-1 rounded-md">
                    <Plus className="w-5 h-5 text-white" />
                 </div>
                 <span>Novo Atendimento</span>
                 <Zap className="w-4 h-4 text-white/80" />
              </div>
              
              {/* Shine effect */}
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-shine" />
           </motion.button>
        </div>

        {/* Search Bar - Clean Pill Style */}
        <div className="relative mb-8 group">
           <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
           </div>
           <input
              type="text"
              placeholder="Buscar paciente por nome ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 text-slate-700 placeholder-slate-400 text-lg rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-300"
           />
        </div>

        {/* Erro de carregamento */}
        {loadError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4"
          >
            {loadError}
          </motion.div>
        )}

        {/* Patients Grid */}
        <div className="space-y-6">
          <AnimatePresence>
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center py-20"
              >
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-500"></div>
                </div>
              </motion.div>
            ) : filteredPatients.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100"
              >
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 bg-slate-50 rounded-full">
                    <User className="w-10 h-10 text-slate-300" />
                </div>

                <h3 className="text-xl font-bold text-slate-700 mb-2">
                  {searchTerm ? 'Paciente não encontrado' : 'Nenhum paciente ativo'}
                </h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  {searchTerm
                    ? 'Verifique o nome ou ID e tente novamente.'
                    : 'Clique em "Novo Atendimento" para começar.'
                  }
                </p>
              </motion.div>
            ) : (
              currentPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                     
                     {/* Esquerda: Identificação e Status */}
                     <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                           <Activity className="w-7 h-7 text-blue-500" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <h3 className="text-xl font-bold text-slate-800 truncate">{patient.name}</h3>
                              {getGroupBadge(patient.flowchartState.group)}
                           </div>
                           <p className="text-slate-400 text-sm font-medium mb-4 uppercase tracking-wide">ID: {patient.medicalRecord}</p>
                           
                           {/* Protocolo Badge - Clean */}
                           <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 inline-block w-full sm:w-auto">
                              <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Protocolo Ativo</p>
                              <div className="flex items-center gap-2">
                                 <Zap className="w-4 h-4 text-slate-400" />
                                 <span className="font-semibold text-slate-700 text-sm truncate max-w-[200px]">
                                    {getFlowchartName(patient.selectedFlowchart)}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Centro: Métricas Grid Clean */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 xl:px-8 xl:border-l xl:border-r border-slate-100 flex-[1.5]">
                        <div className="min-w-0">
                           <div className="flex items-center gap-2 text-slate-400 mb-1">
                              <Calendar className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase">Idade</span>
                           </div>
                           <p className="font-semibold text-slate-700 truncate">{patient.age} anos</p>
                        </div>
                        
                        <div className="min-w-0">
                           <div className="flex items-center gap-2 text-slate-400 mb-1">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase">Admissão</span>
                           </div>
                           <p className="font-semibold text-slate-700 truncate">{formatDate(patient.admission.date)}</p>
                        </div>

                        <div className="min-w-0">
                           <div className="flex items-center gap-2 text-slate-400 mb-1">
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              <span className="text-xs font-bold uppercase">Status</span>
                           </div>
                           <p className="font-semibold text-slate-700 truncate">{getStatusText(patient.status)}</p>
                        </div>

                        <div className="min-w-0">
                           <div className="flex items-center gap-2 text-slate-400 mb-1">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase">Retorno</span>
                           </div>
                           <p className="font-semibold text-slate-700 truncate">{getVisitText(patient.returnCount)}</p>
                        </div>
                     </div>

                     {/* Direita: Ação Principal + Menu */}
                     <div className="flex flex-col sm:flex-row items-center gap-3 justify-end w-full xl:w-auto xl:min-w-[340px]">
                        
                        {/* Botão Continuar Atendimento (Grande e Destacado) */}
                        <motion.button
                           onClick={() => onSelectPatient(patient)}
                           className="order-1 sm:order-2 flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn whitespace-nowrap"
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                        >
                           <span>Continuar Atendimento</span>
                           <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </motion.button>

                        {/* Ações Secundárias (Visíveis) */}
                        <div className="order-2 sm:order-1 flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                           <button 
                              onClick={() => onViewReport(patient)} 
                              className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all relative group/action"
                              title="Relatório"
                           >
                              <FileText className="w-5 h-5" />
                           </button>
                           
                           <button 
                              onClick={() => onViewMedicalPrescription(patient)} 
                              className="p-2.5 text-slate-500 hover:text-green-600 hover:bg-white rounded-lg transition-all relative group/action"
                              title="Receituário"
                           >
                              <Pill className="w-5 h-5" />
                           </button>

                           {patient.treatment.prescriptions.length > 0 && (
                              <button 
                                 onClick={() => onViewPrescriptions(patient)} 
                                 className="p-2.5 text-slate-500 hover:text-amber-600 hover:bg-white rounded-lg transition-all relative group/action"
                                 title="Prescrições"
                              >
                                 <FileText className="w-5 h-5" />
                              </button>
                           )}

                           <div className="w-px h-6 bg-slate-200 mx-1"></div>

                           <button 
                              onClick={() => setShowTransferModal(patient.id)} 
                              className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all relative group/action"
                              title="Transferir"
                           >
                              <Stethoscope className="w-5 h-5" />
                           </button>

                           <button 
                              onClick={() => setShowDeleteConfirm(patient.id)} 
                              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all relative group/action"
                              title="Excluir"
                           >
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                     </div>

                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Paginação Clean */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl hover:bg-slate-50 text-slate-400 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-slate-600 font-medium px-4">
                   Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl hover:bg-slate-50 text-slate-400 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
            </div>
          </div>
        )}

        {/* Seção Pacientes Recentes */}
        <div className="mt-12">
           <h2 className="text-xl font-bold text-slate-700 mb-6">Pacientes Recentes</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPatients.length === 0 ? (
                // Placeholder para quando não houver recentes
                <div className="col-span-3 text-center py-8 text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
                  Nenhum paciente recente encontrado.
                </div>
              ) : (
                recentPatients.map((patient) => (
                  <motion.div 
                    key={patient.id}
                    whileHover={{ y: -4 }}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => onSelectPatient(patient)}
                  >
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                          <User className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                           <h4 className="font-bold text-slate-800 truncate text-sm">{patient.name}</h4>
                           <p className="text-xs text-slate-400 truncate">ID: {patient.medicalRecord}</p>
                        </div>
                     </div>
                     
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                           <Zap className="w-3 h-3 text-slate-400" />
                           <span className="truncate">{getFlowchartName(patient.selectedFlowchart)}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                           <span>{patient.age} anos</span>
                           <span>{formatDate(patient.updatedAt || patient.createdAt)}</span>
                        </div>
                     </div>
                  </motion.div>
                ))
              )}
           </div>
        </div>
      </div>


      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Confirmar Exclusão
                </h3>

                <p className="text-slate-600 mb-8 leading-relaxed">
                  Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita e todos os dados do paciente serão perdidos permanentemente.
                </p>

                <div className="flex space-x-4">
                  <motion.button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>

                  <motion.button
                    onClick={() => handleDeletePatient(showDeleteConfirm)}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Excluir
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTransferModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="w-8 h-8 text-blue-600" />
                </div>

                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Transferir Paciente
                </h3>

                <p className="text-slate-600 mb-6 leading-relaxed">
                  Busque pelo nome ou CRM do médico de destino.
                </p>

                <div className="mb-4">
                  <input
                    type="text"
                    value={transferQuery}
                    onChange={(e) => setTransferQuery(e.target.value)}
                    placeholder="Digite o nome ou CRM..."
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {doctorOptions.length > 0 && (
                  <div className="mb-4 text-left max-h-56 overflow-auto border border-slate-200 rounded-xl">
                    {doctorOptions.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDoctorId(d.id)}
                        className={clsx(
                          "w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors",
                          selectedDoctorId === d.id ? "bg-blue-50" : "bg-white hover:bg-slate-50"
                        )}
                      >
                        <div className="font-semibold text-slate-800">{d.name}</div>
                        <div className="text-sm text-slate-600">CRM: {d.crm || '—'} • {d.email || 'sem e-mail'}</div>
                      </button>
                    ))}
                  </div>
                )}

                {transferError && (
                  <div className="mb-4 text-red-600 text-sm">
                    {transferError}
                  </div>
                )}

                <div className="flex space-x-4">
                  <motion.button
                    onClick={() => { setShowTransferModal(null); setTransferQuery(''); setSelectedDoctorId(null); setDoctorOptions([]); setTransferError(null); }}
                    className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>

                  <motion.button
                    onClick={handleConfirmTransfer}
                    disabled={isTransferring || !selectedDoctorId}
                    className={clsx(
                      "flex-1 py-3 rounded-xl font-semibold transition-all duration-200",
                      isTransferring || !selectedDoctorId
                        ? "bg-blue-200 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-slate-700 text-white hover:shadow-lg"
                    )}
                    whileHover={!isTransferring && selectedDoctorId ? { scale: 1.02 } : {}}
                    whileTap={!isTransferring && selectedDoctorId ? { scale: 0.98 } : {}}
                  >
                    {isTransferring ? 'Transferindo...' : 'Confirmar Transferência'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PatientDashboard
