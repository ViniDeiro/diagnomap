import React from 'react'
import { Heart, Shield, AlertCircle, Phone, Stethoscope, Award, Users, Activity } from 'lucide-react'

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url('data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M20 20h40v40H20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
      }}></div>

      <div className="relative max-w-7xl mx-auto px-8 py-16">
        
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-slate-400 rounded-xl blur-lg opacity-50"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-slate-600 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Siga o Fluxo
                </h3>
                <p className="text-sm text-slate-400">Sistema Clínico</p>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6">
              Plataforma inteligente de apoio à decisão médica para classificação de risco 
              e manejo de pacientes com suspeita de dengue.
            </p>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 px-4 py-3 rounded-xl border border-emerald-500/30">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 text-sm font-medium">Sistema Ativo</span>
            </div>
          </div>

          {/* Protocol Info */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-3 text-emerald-400" />
              Protocolo Oficial
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Award className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300 text-sm">Ministério da Saúde 2024</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300 text-sm">Validado por Especialistas</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-slate-300 text-sm">Baseado em Evidências</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-slate-300 text-sm">Atualizado: 11/10/2024</span>
              </div>
            </div>
          </div>

          {/* Important Notices */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 text-amber-400" />
              Diretrizes Clínicas
            </h4>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border-l-4 border-amber-400">
                <p className="text-slate-300 text-sm font-medium">
                  Ferramenta de apoio - não substitui avaliação médica
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border-l-4 border-blue-400">
                <p className="text-slate-300 text-sm font-medium">
                  Notificar todos os casos suspeitos
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border-l-4 border-purple-400">
                <p className="text-slate-300 text-sm font-medium">
                  Seguir protocolos institucionais locais
                </p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border-l-4 border-green-400">
                <p className="text-slate-300 text-sm font-medium">
                  Manter-se atualizado regularmente
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6 flex items-center">
              <Phone className="w-5 h-5 mr-3 text-red-400" />
              Contatos de Emergência
            </h4>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 rounded-xl shadow-xl border border-red-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold mb-1">SAMU</p>
                    <p className="text-red-100 text-xs">Serviço de Atendimento Móvel</p>
                  </div>
                  <p className="text-3xl font-black text-white">192</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-xl shadow-xl border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold mb-1">Bombeiros</p>
                    <p className="text-blue-100 text-xs">Emergências Médicas</p>
                  </div>
                  <p className="text-3xl font-black text-white">193</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 rounded-xl shadow-xl border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold mb-1">Vigilância</p>
                    <p className="text-purple-100 text-xs">Epidemiológica</p>
                  </div>
                  <p className="text-2xl font-black text-white">136</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          <div className="text-center lg:text-left">
            <p className="text-slate-300 font-medium">
              &copy; 2024 Siga o Fluxo. Sistema de Diagnóstico Clínico.
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Desenvolvido para excelência em cuidados médicos.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-slate-300 text-sm font-medium">Online</span>
            </div>
            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
              <span className="text-slate-300 text-sm font-mono">v1.0.0</span>
            </div>
          </div>
        </div>

        {/* Professional Disclaimer */}
        <div className="mt-12 p-6 bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-2xl border border-slate-600/50 backdrop-blur-sm">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h5 className="text-white font-bold mb-2">Aviso Médico-Legal</h5>
              <p className="text-slate-300 text-sm leading-relaxed">
                <strong>Este sistema é uma ferramenta de apoio à decisão médica</strong> e não substitui 
                o julgamento clínico profissional. Sempre consulte as diretrizes institucionais locais e 
                mantenha-se atualizado com os protocolos mais recentes. Em situações de emergência ou 
                dúvidas clínicas, procure imediatamente assistência médica especializada. O uso desta 
                ferramenta implica na aceitação destas condições.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer