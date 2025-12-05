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
    Ear
} from 'lucide-react'
import { clsx } from 'clsx'
import { EmergencyFlowchart, EmergencyCategory } from '@/types/emergency'
import { getAllFlowcharts, getFlowchartsByCategory, emergencyCategories, allFlowcharts } from '@/data/emergencyFlowcharts'
import UnderDevelopmentModal from './UnderDevelopmentModal'

interface EmergencySelectorProps {
    onSelectFlowchart: (flowchart: EmergencyFlowchart) => void
    selectedFlowchart?: string
    // Quando presente, clicar em Gasometria abre o fluxo dedicado
    onOpenGasometry?: () => void
}

const EmergencySelector: React.FC<EmergencySelectorProps> = ({
    onSelectFlowchart,
    selectedFlowchart,
    onOpenGasometry
}) => {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [showDevelopmentModal, setShowDevelopmentModal] = useState(false)
    const [selectedProtocol, setSelectedProtocol] = useState<{ name: string; category: string } | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(12)

    // Usar todos os fluxogramas (incluindo os não implementados)
    const allAvailableFlowcharts = allFlowcharts

    const filteredFlowcharts = allAvailableFlowcharts.filter(flowchart => {
        const matchesSearch = flowchart.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || flowchart.category === selectedCategory
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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-800'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800'
            case 'low':
                return 'bg-green-100 text-green-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Protocolos de Emergência
                </h1>
                <p className="text-gray-600">
                    Selecione o protocolo apropriado para o caso clínico
                </p>
            </div>

            {/* Filtros e Busca */}
            <div className="mb-6 space-y-4">
                {/* Barra de Busca */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar protocolos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
                    </div>

                    {/* Categorias */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={clsx(
                                "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                                selectedCategory === 'all'
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            Todos
                        </button>
                        {Object.keys(emergencyCategories).map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={clsx(
                                    "px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center space-x-1",
                                    selectedCategory === category
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                )}
                            >
                                {getCategoryIcon(category as EmergencyCategory)}
                                <span>{getCategoryName(category as EmergencyCategory)}</span>
                            </button>
                        ))}
                    </div>

                    {/* Modo de Visualização */}
                    <div className="flex items-center space-x-2 ml-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={clsx(
                                "p-2 rounded-lg transition-colors",
                                viewMode === 'grid'
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={clsx(
                                "p-2 rounded-lg transition-colors",
                                viewMode === 'list'
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de Protocolos */}
            {filteredFlowcharts.length === 0 ? (
                <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Nenhum protocolo encontrado
                    </h3>
                    <p className="text-gray-500">
                        Tente ajustar os filtros ou termos de busca
                    </p>
                </div>
            ) : (
                <div className={clsx(
                    "gap-6",
                    viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        : "space-y-4"
                )}>
                    {paginatedFlowcharts.map((flowchart) => (
                        <motion.div
                            key={flowchart.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                if (flowchart.implemented) {
                                    // Caso especial: abrir Gasometria no componente dedicado quando solicitado
                                    if (flowchart.id === 'gasometria' && onOpenGasometry) {
                                        onOpenGasometry()
                                        return
                                    }
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
                                "bg-white rounded-xl border-2 cursor-pointer transition-all duration-200",
                                "hover:shadow-lg hover:border-blue-300",
                                selectedFlowchart === flowchart.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300",
                                !flowchart.implemented && "opacity-75"
                            )}
                        >
                            <div className={clsx(
                                "p-6",
                                viewMode === 'list' && "flex items-center space-x-4"
                            )}>
                                {/* Ícone e Categoria */}
                                <div className={clsx(
                                    "flex items-center space-x-3 mb-4",
                                    viewMode === 'list' && "mb-0"
                                )}>
                                    <div className={clsx(
                                        "p-3 rounded-xl text-white",
                                        flowchart.implemented
                                            ? `bg-gradient-to-r from-blue-500 to-blue-600`
                                            : "bg-gradient-to-r from-gray-400 to-gray-500"
                                    )}>
                                        {getCategoryIcon(flowchart.category as EmergencyCategory)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <h3 className="font-bold text-gray-800">{flowchart.name}</h3>
                                            {!flowchart.implemented && (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    EM DESENVOLVIMENTO
                                                </span>
                                            )}
                                            {flowchart.implemented && (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    DISPONÍVEL
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {flowchart.implemented
                                                ? "Protocolo completo disponível"
                                                : "Protocolo em desenvolvimento"}
                                        </p>
                                    </div>
                                </div>

                                {/* Informações Adicionais */}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span className="flex items-center space-x-1">
                                        {getCategoryIcon(flowchart.category as EmergencyCategory)}
                                        <span>{getCategoryName(flowchart.category as EmergencyCategory)}</span>
                                    </span>
                                    <span>
                                        {flowchart.implemented ? "Implementado" : "Em breve"}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Paginação */}
            {filteredFlowcharts.length > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Itens por página:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value))
                                setCurrentPage(1)
                            }}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                        >
                            <option value={12}>12</option>
                            <option value={24}>24</option>
                            <option value={36}>36</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className={clsx(
                                "px-3 py-2 rounded-md text-sm",
                                currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-700">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className={clsx(
                                "px-3 py-2 rounded-md text-sm",
                                currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                            )}
                            disabled={currentPage === totalPages}
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            )}

            {/* Estatísticas */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                        {filteredFlowcharts.length} de {allAvailableFlowcharts.length} protocolos
                    </span>
                    <span>
                        {allAvailableFlowcharts.filter(f => f.implemented).length} implementados, {allAvailableFlowcharts.filter(f => !f.implemented).length} em desenvolvimento
                    </span>
                </div>
            </div>

            {/* Modal de Desenvolvimento */}
            <UnderDevelopmentModal
                isOpen={showDevelopmentModal}
                onClose={() => setShowDevelopmentModal(false)}
                protocolName={selectedProtocol?.name || ''}
                category={selectedProtocol?.category || ''}
            />
        </div>
    )
}

export default EmergencySelector
