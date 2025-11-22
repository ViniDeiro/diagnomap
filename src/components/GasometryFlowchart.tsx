import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity,
    ArrowLeft,
    Check,
    AlertCircle,
    Droplet,
    Heart,
    Wind,
    ChevronRight,
    TestTube2,
    Syringe
} from 'lucide-react'
import { clsx } from 'clsx'
import { GasometryData, GasometryType } from '@/types/gasometry'

interface GasometryFlowchartProps {
    onComplete: () => void
    onCancel: () => void
}

export function GasometryFlowchart({ onComplete, onCancel }: GasometryFlowchartProps) {
    const [selectedType, setSelectedType] = useState<GasometryType | null>(null)
    const [arterialData, setArterialData] = useState<GasometryData>({
        ph: NaN,
        pco2: NaN,
        po2: NaN,
        hco3: NaN,
        be: NaN,
        sato2: NaN
    })

    const handleTypeSelect = (type: GasometryType) => {
        setSelectedType(type)
    }

    const handleArterialChange = (field: keyof GasometryData, value: string) => {
        const parsed = value === '' ? NaN : parseFloat(value)
        setArterialData(prev => ({
            ...prev,
            [field]: parsed
        }))
    }

    const renderTypeSelection = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Gasometria</h2>
                <p className="text-slate-600 mt-2">Selecione o tipo de gasometria para iniciar a análise</p>
            </div>

            <div className="grid gap-4">
                <button
                    onClick={() => handleTypeSelect('arterial')}
                    className="flex items-center p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-red-200 transition-colors">
                        <Syringe className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Gasometria Arterial</h3>
                        <p className="text-sm text-slate-500">Avaliação de distúrbios ácido-básicos e trocas gasosas</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 ml-auto group-hover:text-blue-500" />
                </button>

                <button
                    onClick={() => handleTypeSelect('venous_central')}
                    className="flex items-center p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                        <Heart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Venosa Central</h3>
                        <p className="text-sm text-slate-500">Coletada de cateter venoso central (veia cava superior)</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 ml-auto group-hover:text-blue-500" />
                </button>

                <button
                    onClick={() => handleTypeSelect('venous_peripheral')}
                    className="flex items-center p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                >
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                        <TestTube2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Venosa Periférica</h3>
                        <p className="text-sm text-slate-500">Coletada de acesso venoso periférico</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 ml-auto group-hover:text-blue-500" />
                </button>
            </div>
        </div>
    )

    const renderArterialForm = () => (
        <div className="space-y-6">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => setSelectedType(null)}
                    className="p-2 hover:bg-slate-100 rounded-full mr-2 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Gasometria Arterial</h2>
                    <p className="text-sm text-slate-500">Informe os parâmetros coletados</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* pH */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">pH</label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Digite o pH (ex.: 7.40)"
                            value={Number.isFinite(arterialData.ph) ? arterialData.ph : ''}
                            onChange={(e) => handleArterialChange('ph', e.target.value)}
                            className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                        />
                        <Droplet className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                    <p className="text-xs text-slate-500">Valor de referência: 7.35 - 7.45</p>
                </div>

                {/* pCO2 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">pCO2 (mmHg)</label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Informe pCO2 (mmHg)"
                            value={Number.isFinite(arterialData.pco2) ? arterialData.pco2 : ''}
                            onChange={(e) => handleArterialChange('pco2', e.target.value)}
                            className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                        />
                        <Wind className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                    <p className="text-xs text-slate-500">Valor de referência: 35 - 45 mmHg</p>
                </div>

                {/* pO2 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">pO2 (mmHg)</label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Informe pO2 (mmHg)"
                            value={Number.isFinite(arterialData.po2) ? arterialData.po2 : ''}
                            onChange={(e) => handleArterialChange('po2', e.target.value)}
                            className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                        />
                        <Wind className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                    <p className="text-xs text-slate-500">Valor de referência: 80 - 100 mmHg</p>
                </div>

                {/* HCO3 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">HCO3 (mEq/L)</label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Informe HCO3 (mEq/L)"
                            value={Number.isFinite(arterialData.hco3) ? arterialData.hco3 : ''}
                            onChange={(e) => handleArterialChange('hco3', e.target.value)}
                            className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                        />
                        <TestTube2 className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                    <p className="text-xs text-slate-500">Valor de referência: 22 - 26 mEq/L</p>
                </div>

                {/* BE */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Base Excess (BE)</label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Informe BE (Base Excess)"
                            value={Number.isFinite(arterialData.be) ? arterialData.be : ''}
                            onChange={(e) => handleArterialChange('be', e.target.value)}
                            className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                        />
                        <Activity className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                    <p className="text-xs text-slate-500">Valor de referência: -2 a +2</p>
                </div>

                {/* SatO2 */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Saturação (SatO2 %)</label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Informe Saturação (SatO2 %)"
                            value={Number.isFinite(arterialData.sato2) ? arterialData.sato2 : ''}
                            onChange={(e) => handleArterialChange('sato2', e.target.value)}
                            className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                        />
                        <Activity className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                    <p className="text-xs text-slate-500">Valor de referência: 95 - 100%</p>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
                <button
                    onClick={() => {
                        // Placeholder for analysis logic
                        console.log('Analyzing:', arterialData)
                    }}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center"
                >
                    <Activity className="w-6 h-6 mr-2" />
                    Analisar Resultados
                </button>
            </div>
        </div>
    )

    const renderPlaceholder = (title: string) => (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-500 mb-6">Funcionalidade em desenvolvimento.</p>
            <button
                onClick={() => setSelectedType(null)}
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
            >
                Voltar
            </button>
        </div>
    )

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-bold text-slate-700 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-600" />
                        Gasometria
                    </h2>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {!selectedType && (
                            <motion.div
                                key="selection"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                {renderTypeSelection()}
                            </motion.div>
                        )}

                        {selectedType === 'arterial' && (
                            <motion.div
                                key="arterial"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {renderArterialForm()}
                            </motion.div>
                        )}

                        {selectedType === 'venous_central' && (
                            <motion.div
                                key="venous_central"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {renderPlaceholder('Gasometria Venosa Central')}
                            </motion.div>
                        )}

                        {selectedType === 'venous_peripheral' && (
                            <motion.div
                                key="venous_peripheral"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {renderPlaceholder('Gasometria Venosa Periférica')}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
