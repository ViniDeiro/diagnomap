import React from 'react'
import { Activity, Shield, Award, Zap } from 'lucide-react'
import { AnimatedLogo } from './AnimatedLogo'

const Header: React.FC = () => {
  return (
    <header className="relative bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-50 transition-all duration-300">
      {/* Gradient overlay suave */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-slate-50/50 to-blue-500/5 pointer-events-none"></div>

      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url('data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23334155" fill-opacity="0.4"%3E%3Cpath d="M20 20h40v40H20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Logo Animado */}
          <div className="flex items-center relative z-10 group cursor-pointer">
             <div className="transform transition-transform duration-500 group-hover:scale-105">
                <AnimatedLogo className="h-10 sm:h-12 lg:h-14 w-auto" />
             </div>
          </div>

          {/* Premium Status Indicators - Modernizados */}
          <div className="hidden xl:flex items-center space-x-6">
            <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="p-1.5 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Protocolo</p>
                <p className="text-sm font-bold text-emerald-900">MS 2024</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Especialidade</p>
                <p className="text-sm font-bold text-blue-900">Dengue</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="p-1.5 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Status</p>
                <p className="text-sm font-bold text-amber-900">Validado</p>
              </div>
            </div>
          </div>

          {/* Mobile Status Badge */}
          <div className="xl:hidden flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-bold text-blue-800">MS 2024</span>
          </div>
        </div>

        {/* Premium Info Card - Refinado */}
        <div className="mt-6 sm:mt-8 rounded-3xl p-1 shadow-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-800 relative overflow-hidden group hover:shadow-blue-500/20 transition-all duration-500">
           <div className="bg-slate-900/10 backdrop-blur-[1px] absolute inset-0"></div>
           
           <div className="relative bg-slate-900/40 rounded-[22px] p-4 sm:p-6 text-white overflow-hidden">
              {/* Efeitos de luz de fundo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-blue-400/40 transition-all duration-700"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/30 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 group-hover:bg-indigo-400/40 transition-all duration-700"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center">
                      <div className="p-1.5 bg-white/10 rounded-lg mr-3 backdrop-blur-md border border-white/10">
                        <Zap className="w-5 h-5 text-yellow-300" />
                      </div>
                      <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">Fluxograma de Classificação de Risco - Dengue 2024</span>
                      <span className="sm:hidden text-white">Protocolo Dengue 2024</span>
                    </h2>
                    <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed font-light max-w-3xl">
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

                <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-default">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                    <span className="text-xs font-medium text-emerald-100">Atualizado</span>
                  </div>

                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-default">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                    <span className="text-xs font-medium text-blue-100">Protocolo MS</span>
                  </div>

                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/20 transition-all duration-300 cursor-default">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)]"></div>
                    <span className="text-xs font-medium text-purple-100">Validado</span>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </header>
  )
}

export default Header