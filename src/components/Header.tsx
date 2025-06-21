import React from 'react'
import { Activity, Shield, Award, Stethoscope, Brain, Target, Zap } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="relative bg-white shadow-2xl border-b border-slate-200/50 sticky top-0 z-50">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-slate-50 to-blue-600/3"></div>
      
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url('data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23334155" fill-opacity="0.4"%3E%3Cpath d="M20 20h40v40H20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          {/* Premium Logo */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl blur-xl opacity-20 scale-110"></div>
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-2xl border border-blue-100">
                <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </div>
            
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
                DiagnoMap Pro
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-slate-600 uppercase tracking-wider">
                  Sistema de Diagnóstico
                </span>
                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Premium Status Indicators */}
          <div className="hidden xl:flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 rounded-xl border border-emerald-200">
              <Shield className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Protocolo</p>
                <p className="text-sm font-bold text-emerald-800">MS 2024</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-xl border border-blue-200">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Especialidade</p>
                <p className="text-sm font-bold text-blue-800">Dengue</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-xl border border-amber-200">
              <Award className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Status</p>
                <p className="text-sm font-bold text-amber-800">Validado</p>
              </div>
            </div>
          </div>

          {/* Mobile Status Badge */}
          <div className="xl:hidden flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-2 rounded-lg border border-blue-200">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-800">MS 2024</span>
          </div>
        </div>

        {/* Premium Info Card */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-blue-600 to-slate-700 rounded-2xl p-4 sm:p-6 shadow-2xl text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700/30 to-slate-800/30"></div>
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16 sm:-translate-y-32 sm:translate-x-32 blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-300" />
                  <span className="hidden sm:inline">Fluxograma de Classificação de Risco - Dengue 2024</span>
                  <span className="sm:hidden">Protocolo Dengue 2024</span>
                </h2>
                <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
                  <span className="hidden sm:inline">
                    Sistema inteligente desenvolvido com base no protocolo oficial do Ministério da Saúde 
                    para classificação de risco e tomada de decisões clínicas em pacientes com suspeita de dengue.
                  </span>
                  <span className="sm:hidden">
                    Sistema para classificação de risco baseado no protocolo oficial do MS.
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center space-x-1 sm:space-x-2 bg-white/20 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-white/30">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs sm:text-sm font-semibold">Atualizado</span>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 bg-white/20 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-white/30">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-xs sm:text-sm font-semibold">Protocolo MS</span>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 bg-white/20 backdrop-blur-sm px-2 sm:px-4 py-1 sm:py-2 rounded-lg border border-white/30">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-xs sm:text-sm font-semibold">Validado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 