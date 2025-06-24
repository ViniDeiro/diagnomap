'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  BarChart3,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  MoreHorizontal
} from 'lucide-react'
import { Patient } from '@/types/patient'
import { patientService } from '@/services/patientService'
import { clsx } from 'clsx'

interface PatientDashboardProps {
  onNewPatient: () => void
  onSelectPatient: (patient: Patient) => void
  onViewPrescriptions: (patient: Patient) => void
  onViewReport: (patient: Patient) => void
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onNewPatient,
  onSelectPatient,
  onViewPrescriptions,
  onViewReport
}) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const patientsPerPage = 10

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = () => {
    setIsLoading(true)
    setTimeout(() => {
      patientService.fixExistingPatientsProgress()
      
      const allPatients = patientService.getAllPatients()
      setPatients(allPatients)
      setIsLoading(false)
    }, 800)
  }

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medicalRecord.includes(searchTerm)
  )

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

  const handleDeletePatient = (patientId: string) => {
    patientService.deletePatient(patientId)
    setPatients(prev => prev.filter(p => p.id !== patientId))
    setShowDeleteConfirm(null)
    
    // Ajustar página se necessário
    const newTotalPages = Math.ceil((filteredPatients.length - 1) / patientsPerPage)
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages)
    }
  }

  // Calcular paginação
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage)
  const startIndex = (currentPage - 1) * patientsPerPage
  const endIndex = startIndex + patientsPerPage
  const currentPatients = filteredPatients.slice(startIndex, endIndex)



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      
      {/* Premium Medical Header */}
      <div className="relative bg-white shadow-xl border-b border-slate-200/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-slate-50 to-blue-600/3"></div>
        
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23334155" fill-opacity="0.4"%3E%3Cpath d="M20 20h40v40H20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
        }}></div>

        <div className="relative max-w-7xl mx-auto px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            {/* Medical Logo Premium */}
            <div className="flex items-center space-x-6">
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl blur-xl opacity-20 scale-110"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl border border-blue-100">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              <div className="text-center">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent"
                >
                  DiagnoMap Pro
                </motion.h1>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex items-center justify-center space-x-2 mt-2"
                >
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">
                    Sistema de Diagnóstico Clínico
                  </span>
                  <Target className="w-4 h-4 text-blue-600" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Professional Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12"
        >
          <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 justify-between items-start xl:items-center">
            <div className="flex-1">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4">
                <div className="w-2 h-8 sm:h-12 bg-gradient-to-b from-blue-600 to-slate-700 rounded-full"></div>
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800">Gestão de Pacientes</h2>
                  <p className="text-sm sm:text-base text-slate-600 font-medium mt-1">
                    {patients.length} {patients.length === 1 ? 'paciente em acompanhamento' : 'pacientes em acompanhamento'}
                  </p>
                </div>
              </div>
            </div>
            
            <motion.button
              onClick={onNewPatient}
              className="group relative bg-gradient-to-r from-blue-600 to-slate-700 text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-2 sm:space-x-3 font-semibold text-sm sm:text-base lg:text-lg overflow-hidden w-full xl:w-auto justify-center"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span>Novo Atendimento</span>
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Premium Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-2 mb-8 sm:mb-12"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-4 sm:left-6 flex items-center pointer-events-none">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar paciente por nome ou prontuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 sm:pl-16 pr-4 sm:pr-8 py-4 sm:py-6 bg-transparent text-slate-800 placeholder-slate-500 text-base sm:text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-200"
            />
          </div>
        </motion.div>

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
                  <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-slate-200 rounded-full animate-spin border-r-slate-600" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </motion.div>
            ) : filteredPatients.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-300 to-blue-300 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative w-20 h-20 bg-gradient-to-br from-slate-100 to-blue-100 rounded-2xl flex items-center justify-center border border-slate-200">
                    <User className="w-10 h-10 text-slate-500" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  {searchTerm ? 'Paciente não encontrado' : 'Nenhum paciente cadastrado'}
                </h3>
                <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                  {searchTerm 
                    ? 'Verifique os dados inseridos e tente novamente' 
                    : 'Inicie um novo atendimento para começar o diagnóstico'
                  }
                </p>
                {!searchTerm && (
                  <motion.button
                    onClick={onNewPatient}
                    className="bg-gradient-to-r from-blue-600 to-slate-700 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold text-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Iniciar Primeiro Atendimento
                  </motion.button>
                )}
              </motion.div>
            ) : (
              currentPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  onHoverStart={() => setHoveredCard(patient.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-slate-200/60 hover:border-blue-200/60 transition-all duration-300 overflow-hidden"
                >
                  {/* Premium border gradient */}
                  <div className="h-1 bg-gradient-to-r from-blue-600 via-slate-400 to-blue-600"></div>
                  
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 mb-6">
                          <motion.div
                            animate={hoveredCard === patient.id ? { scale: 1.05 } : { scale: 1 }}
                            className="flex items-center space-x-3 sm:space-x-4"
                          >
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-200 to-blue-200 rounded-xl blur-md opacity-50"></div>
                              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-white to-slate-50 rounded-xl flex items-center justify-center border-2 border-slate-200 shadow-lg">
                                {getStatusIcon(patient.status)}
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-1">
                                {patient.name}
                              </h3>
                              <p className="text-sm sm:text-base text-slate-600 font-medium">
                                Prontuário: {patient.medicalRecord}
                              </p>
                            </div>
                          </motion.div>
                          {getGroupBadge(patient.flowchartState.group)}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                          <div className="flex items-center space-x-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Idade</p>
                              <p className="font-bold text-slate-800">{patient.age} anos</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Admissão</p>
                              <p className="font-bold text-slate-800">
                                {formatDate(patient.admission.date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Status</p>
                              <p className="font-bold text-slate-800">{getStatusText(patient.status)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4 lg:ml-8">
                        <div className="flex space-x-3 sm:space-x-2 lg:space-x-3">
                          <motion.button
                            onClick={() => onViewReport(patient)}
                            className="relative p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-200 group/btn shadow-lg flex-1 sm:flex-none"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Gerar Relatório Completo"
                          >
                            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-hover/btn:text-purple-700 mx-auto" />
                          </motion.button>
                          
                          {patient.treatment.prescriptions.length > 0 && (
                            <motion.button
                              onClick={() => onViewPrescriptions(patient)}
                              className="relative p-3 sm:p-4 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 rounded-xl border border-amber-200 hover:border-amber-300 transition-all duration-200 group/btn shadow-lg flex-1 sm:flex-none"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              title="Visualizar Prescrições"
                            >
                              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 group-hover/btn:text-amber-700 mx-auto" />
                            </motion.button>
                          )}
                          
                          <motion.button
                            onClick={() => setShowDeleteConfirm(patient.id)}
                            className="relative p-3 sm:p-4 bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 rounded-xl border border-red-200 hover:border-red-300 transition-all duration-200 group/btn shadow-lg flex-1 sm:flex-none"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            title="Excluir Prontuário"
                          >
                            <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 group-hover/btn:text-red-700 mx-auto" />
                          </motion.button>
                        </div>
                        
                        <motion.button
                          onClick={() => onSelectPatient(patient)}
                          className="relative bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3 font-semibold text-sm sm:text-base shadow-xl hover:shadow-2xl overflow-hidden group/btn w-full sm:w-auto"
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-blue-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative flex items-center space-x-2 sm:space-x-3">
                            <span className="font-semibold">
                              {patient.status === 'active' && patient.flowchartState.currentStep !== 'end' 
                                ? 'Continuar Atendimento' 
                                : 'Visualizar Histórico'}
                            </span>
                            <motion.div
                              animate={{ x: hoveredCard === patient.id ? 3 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.div>
                          </div>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex justify-center"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6">
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={clsx(
                    "p-3 rounded-xl transition-all duration-200 flex items-center justify-center",
                    currentPage === 1
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-slate-700 text-white hover:shadow-lg"
                  )}
                  whileHover={currentPage > 1 ? { scale: 1.05 } : {}}
                  whileTap={currentPage > 1 ? { scale: 0.95 } : {}}
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>

                <div className="flex items-center space-x-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber: number
                    
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                    } else {
                      pageNumber = currentPage - 2 + i
                    }

                    return (
                      <motion.button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={clsx(
                          "w-12 h-12 rounded-xl font-semibold transition-all duration-200",
                          currentPage === pageNumber
                            ? "bg-gradient-to-r from-blue-600 to-slate-700 text-white shadow-lg"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {pageNumber}
                      </motion.button>
                    )
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <div className="px-2 text-slate-400">
                        <MoreHorizontal className="w-5 h-5" />
                      </div>
                      <motion.button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-12 h-12 rounded-xl font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {totalPages}
                      </motion.button>
                    </>
                  )}
                </div>

                <motion.button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={clsx(
                    "p-3 rounded-xl transition-all duration-200 flex items-center justify-center",
                    currentPage === totalPages
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-slate-700 text-white hover:shadow-lg"
                  )}
                  whileHover={currentPage < totalPages ? { scale: 1.05 } : {}}
                  whileTap={currentPage < totalPages ? { scale: 0.95 } : {}}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
              
              <div className="mt-4 text-center text-sm text-slate-600">
                Página {currentPage} de {totalPages} • {filteredPatients.length} {filteredPatients.length === 1 ? 'paciente' : 'pacientes'}
              </div>
            </div>
          </motion.div>
        )}
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
                  Tem certeza que deseja excluir este prontuário? Esta ação não pode ser desfeita e todos os dados do paciente serão perdidos permanentemente.
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
    </div>
  )
}

export default PatientDashboard 