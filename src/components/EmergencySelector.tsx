'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    Heart,
    Brain,
    Activity,
    Stethoscope,
    Shield,
    Baby,
    User,
    Pill,
    Droplets,
    Zap,
    Thermometer,
    Search,
    Filter,
    Grid,
    List,
    Eye,
    Bone,
    Microscope,
    Syringe,
    Bandage,
    Ear,
    ChevronLeft,
    ChevronRight,
    ArrowRight
} from 'lucide-react'
import { clsx } from 'clsx'
import { EmergencyFlowchart, EmergencyCategory } from '@/types/emergency'
import { getAllFlowcharts, emergencyCategories, allFlowcharts } from '@/data/emergencyFlowcharts'
import UnderDevelopmentModal from './UnderDevelopmentModal'

interface EmergencySelectorProps {
    onSelectFlowchart: (flowchart: EmergencyFlowchart) => void
    selectedFlowchart?: string
}

const EmergencySelector: React.FC<EmergencySelectorProps> = ({
    onSelectFlowchart,
    selectedFlowchart
}) => {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [activeTab, setActiveTab] = useState<'flowcharts' | 'protocols'>('flowcharts')
    const [showDevelopmentModal, setShowDevelopmentModal] = useState(false)
    const [selectedProtocol, setSelectedProtocol] = useState<{ name: string; category: string } | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(12)

    // Usar todos os fluxogramas (incluindo os não implementados)
    const allAvailableFlowcharts = allFlowcharts

    const clinicalProtocols: Array<{ id: string; name: string; category: string; implemented: boolean }> = [
        { id: 'sepse_protocolo', name: 'Sepse Grave (Protocolo Clínico)', category: 'infectious', implemented: false },
        { id: 'iam_protocolo', name: 'IAM (Protocolo Clínico)', category: 'cardiovascular', implemented: false },
        { id: 'avc_protocolo', name: 'AVC (Protocolo Clínico)', category: 'neurological', implemented: false },
        { id: 'dengue_protocolo', name: 'Dengue (Protocolo Clínico)', category: 'infectious', implemented: false },
    ]

    const normalizeText = (value: string) =>
        value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()

    const filteredFlowcharts = allAvailableFlowcharts.filter(flowchart => {
        const normalizedSearch = normalizeText(searchTerm.trim())
        const searchable = `${flowchart.name} ${flowchart.id}`
        const matchesSearch = normalizeText(searchable).includes(normalizedSearch)
        const matchesCategory = normalizedSearch
            ? true
            : selectedCategory === 'all' || flowchart.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    // Paginação
    const totalPages = Math.max(1, Math.ceil(filteredFlowcharts.length / pageSize))
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedFlowcharts = filteredFlowcharts.slice(startIndex, endIndex)

    // Resetar página quando filtros mudarem
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, selectedCategory])

    const getCategoryIcon = (category: EmergencyCategory) => {
        switch (category) {
            case 'cardiovascular':
                return <Heart className="w-5 h-5" />
            case 'neurological':
                return <Brain className="w-5 h-5" />
            case 'infectious':
                return <Activity className="w-5 h-5" />
            case 'respiratory':
                return <Stethoscope className="w-5 h-5" />
            case 'trauma':
                return <Shield className="w-5 h-5" />
            case 'pediatric':
                return <Baby className="w-5 h-5" />
            case 'obstetric':
                return <User className="w-5 h-5" />
            case 'gastrointestinal':
                return <Pill className="w-5 h-5" />
            case 'renal':
                return <Droplets className="w-5 h-5" />
            case 'endocrine':
                return <Zap className="w-5 h-5" />
            case 'environmental':
                return <Thermometer className="w-5 h-5" />
            case 'hematological':
                return <Microscope className="w-5 h-5" />
            case 'musculoskeletal':
                return <Bone className="w-5 h-5" />
            case 'dermatological':
                return <Bandage className="w-5 h-5" />
            case 'ophthalmological':
                return <Eye className="w-5 h-5" />
            case 'psychiatric':
                return <Brain className="w-5 h-5" />
            case 'metabolic':
                return <Zap className="w-5 h-5" />
            case 'gynecological':
                return <User className="w-5 h-5" />
            case 'toxicological':
                return <Syringe className="w-5 h-5" />
            case 'oncological':
                return <Activity className="w-5 h-5" />
            case 'otorhinolaryngological':
                return <Ear className="w-5 h-5" />
            case 'allergic':
                return <Shield className="w-5 h-5" />
            default:
                return <Activity className="w-5 h-5" />
        }
    }

    const getCategoryName = (category: EmergencyCategory) => {
        const names = {
            cardiovascular: 'Cardiovascular',
            neurological: 'Neurológico',
            infectious: 'Infeccioso',
            respiratory: 'Respiratório',
            trauma: 'Trauma',
            pediatric: 'Pediátrico',
            obstetric: 'Obstétrico',
            gastrointestinal: 'Gastrointestinal',
            renal: 'Renal',
            endocrine: 'Endócrino',
            environmental: 'Ambiental',
            hematological: 'Hematológico',
            musculoskeletal: 'Musculoesquelético',
            dermatological: 'Dermatológico',
            ophthalmological: 'Oftalmológico',
            psychiatric: 'Psiquiátrico',
            metabolic: 'Metabólico',
            gynecological: 'Ginecológico',
            toxicological: 'Toxicológico',
            oncological: 'Oncológico',
            otorhinolaryngological: 'Otorrinolaringológico',
            allergic: 'Alérgico/Imunológico'
        }
        return names[category] || category
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-700 mb-1">
                            Protocolos de Emergência
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Selecione o protocolo apropriado para iniciar o atendimento
                        </p>
                    </div>

                    <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex">
                        <button
                            onClick={() => setActiveTab('flowcharts')}
                            className={clsx(
                                "px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300",
                                activeTab === 'flowcharts'
                                    ? "bg-slate-100 text-slate-800 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            Fluxogramas
                        </button>
                        <button
                            onClick={() => setActiveTab('protocols')}
                            className={clsx(
                                "px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300",
                                activeTab === 'protocols'
                                    ? "bg-slate-100 text-slate-800 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}
                        >
                            Protocolos Clínicos
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8 group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar protocolos por nome, sintoma ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 text-slate-700 placeholder-slate-400 text-lg rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-300"
                    />
                </div>

                {activeTab === 'flowcharts' && (
                <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Filtros */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-2 mr-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filtros</span>
                        </div>

                        {/* Categorias */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={clsx(
                                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
                                    selectedCategory === 'all'
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                                )}
                            >
                                Todos
                            </button>
                            {Object.keys(emergencyCategories).map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border flex items-center space-x-2",
                                        selectedCategory === category
                                            ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                                    )}
                                >
                                    {getCategoryIcon(category as EmergencyCategory)}
                                    <span>{getCategoryName(category as EmergencyCategory)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Modo de Visualização */}
                    <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-sm ml-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={clsx(
                                "p-2 rounded-lg transition-colors",
                                viewMode === 'grid'
                                    ? "bg-slate-100 text-slate-800"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-2 rounded-lg transition-colors",
                                viewMode === 'list'
                                    ? "bg-slate-100 text-slate-800"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                )}

                {activeTab === 'flowcharts' && (
                <>
                {filteredFlowcharts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100"
                    >
                        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 bg-slate-50 rounded-full">
                            <Activity className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">
                            Nenhum protocolo encontrado
                        </h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            Tente ajustar os filtros ou termos de busca
                        </p>
                    </motion.div>
                ) : (
                    <div className={clsx(
                        "gap-6",
                        viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "space-y-4"
                    )}>
                        {paginatedFlowcharts.map((flowchart, index) => (
                            <motion.div
                                key={flowchart.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                                onClick={() => {
                                    if (flowchart.implemented) {
                                        // Caso especial: Hiponatremia tem rota dedicada
                                        if (flowchart.id === 'dhel_hiponatremia') {
                                            router.push('/hyponatremia')
                                            return
                                        }
                                        // Se implementado, usar o fluxograma completo
                                        const fullFlowchart = getAllFlowcharts().find(f => f.id === flowchart.id)
                                        if (fullFlowchart) {
                                            onSelectFlowchart(fullFlowchart)
                                        }
                                    } else {
                                        // Se não implementado, mostrar modal de desenvolvimento
                                        setSelectedProtocol({
                                            name: flowchart.name,
                                            category: flowchart.category
                                        })
                                        setShowDevelopmentModal(true)
                                    }
                                }}
                                className={clsx(
                                    "bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden",
                                    selectedFlowchart === flowchart.id && "ring-2 ring-blue-500 bg-blue-50/50",
                                    !flowchart.implemented && "opacity-80 grayscale-[0.3] hover:grayscale-0 hover:opacity-100"
                                )}
                            >
                                <div className={clsx(
                                    "flex flex-col h-full",
                                    viewMode === 'list' && "flex-row items-center gap-6"
                                )}>
                                    {/* Header do Card */}
                                    <div className={clsx(
                                        "flex items-start justify-between mb-4",
                                        viewMode === 'list' && "mb-0 w-1/4"
                                    )}>
                                        <div className={clsx(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                                            flowchart.implemented
                                                ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                                                : "bg-slate-100 text-slate-500"
                                        )}>
                                            {getCategoryIcon(flowchart.category as EmergencyCategory)}
                                        </div>
                                        {viewMode === 'grid' && (
                                            !flowchart.implemented ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">
                                                    Em breve
                                                </span>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            )
                                        )}
                                    </div>

                                    {/* Conteúdo */}
                                    <div className={clsx(
                                        "flex-1 min-w-0",
                                        viewMode === 'list' && "flex items-center justify-between gap-8"
                                    )}>
                                        <div className="mb-4 flex-1">
                                            <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {flowchart.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-2">
                                                {flowchart.description || "Protocolo clínico para diagnóstico e tratamento."}
                                            </p>
                                        </div>

                                        {/* Tags e Footer */}
                                        <div className={clsx(
                                            "flex items-center justify-between mt-auto pt-4 border-t border-slate-50",
                                            viewMode === 'list' && "mt-0 pt-0 border-0 w-1/3 justify-end gap-4"
                                        )}>
                                            <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg">
                                                {getCategoryIcon(flowchart.category as EmergencyCategory)}
                                                <span className="truncate max-w-[140px]">{getCategoryName(flowchart.category as EmergencyCategory)}</span>
                                            </span>

                                            {viewMode === 'list' && (
                                                <div className="flex items-center gap-2">
                                                    {!flowchart.implemented && (
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                                                            EM BREVE
                                                        </span>
                                                    )}
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Paginação Clean */}
                {filteredFlowcharts.length > 0 && (
                    <div className="mt-12 flex justify-center">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-3 rounded-xl hover:bg-slate-50 text-slate-400 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-slate-600 font-medium px-4">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-3 rounded-xl hover:bg-slate-50 text-slate-400 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
                </>
                )}

                {activeTab === 'protocols' && (
                    <div className={clsx(
                        "gap-6",
                        viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            : "space-y-4"
                    )}>
                        {clinicalProtocols
                            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((proto, index) => (
                            <motion.div
                                key={proto.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                                onClick={() => {
                                    setSelectedProtocol({ name: proto.name, category: proto.category })
                                    setShowDevelopmentModal(true)
                                }}
                                className={clsx(
                                    "bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 cursor-pointer group",
                                    !proto.implemented && "opacity-80 grayscale-[0.3] hover:grayscale-0 hover:opacity-100"
                                )}
                            >
                                <div className={clsx(
                                    "flex flex-col h-full",
                                    viewMode === 'list' && "flex-row items-center gap-6"
                                )}>
                                    {/* Header do Card */}
                                    <div className={clsx(
                                        "flex items-start justify-between mb-4",
                                        viewMode === 'list' && "mb-0 w-1/4"
                                    )}>
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                            <Stethoscope className="w-6 h-6" />
                                        </div>
                                        {viewMode === 'grid' && (
                                            !proto.implemented ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">
                                                    Em breve
                                                </span>
                                            ) : (
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            )
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                                            {proto.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                            Diretriz clínica completa para condução de casos de {proto.name.split(' ')[0]}.
                                        </p>

                                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                            <span className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded-lg">
                                                {getCategoryIcon(proto.category as EmergencyCategory)}
                                                <span className="truncate max-w-[140px]">{getCategoryName(proto.category as EmergencyCategory)}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Modal de Desenvolvimento */}
                <UnderDevelopmentModal
                    isOpen={showDevelopmentModal}
                    onClose={() => setShowDevelopmentModal(false)}
                    protocolName={selectedProtocol?.name || ''}
                    category={selectedProtocol?.category || ''}
                />
            </div>
        </div>
    )
}

export default EmergencySelector
