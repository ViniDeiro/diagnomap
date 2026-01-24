import React from 'react'
import { Bell, Search, Menu, User } from 'lucide-react'
import { AnimatedLogo } from './AnimatedLogo'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabaseClient'
import Sidebar from './Sidebar'

interface HeaderProps {
  onProfileClick?: () => void
}

const Header: React.FC<HeaderProps> = ({ onProfileClick }) => {
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      const { data: userRes } = await supabase.auth.getUser()
      const user = userRes?.user
      if (!user) return

      // Avatar
      const metaAvatar = (user.user_metadata as any)?.avatar_url || ''
      if (metaAvatar) setAvatarUrl(metaAvatar)

      // Nome
      const metaName = (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name || 'Médico(a)'
      setUserName(metaName)

      // Email
      setUserEmail(user.email || '')
    }
    loadUserData()
  }, [])

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        userAvatar={avatarUrl}
        userName={userName}
        userEmail={userEmail}
        onProfileClick={onProfileClick}
      />
      <header className="relative bg-white sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-32">
          <div className="flex items-center justify-between h-full relative">
            
            {/* Esquerda: Menu e Breadcrumbs */}
            <div className="flex items-center gap-4 z-20">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-50"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden sm:flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
               <div className="h-1.5 w-8 rounded-full bg-blue-500"></div>
            </div>
          </div>

          {/* Centro: Logo Animado (Responsivo) */}
          {/* Mobile: Logo aparece ao lado do menu ou centralizado se couber */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-full pointer-events-none pt-4">
             <div className="pointer-events-auto h-full flex items-center">
                <AnimatedLogo className="h-full w-auto max-h-24 sm:max-h-28" />
             </div>
          </div>

          {/* Direita: Ações e Perfil */}
          <div className="flex items-center gap-4 z-20">
            {/* Container de Ações (Busca e Notificação) */}
            <div className="hidden sm:flex items-center border border-slate-200 rounded-2xl p-1 bg-white shadow-sm">
              <button className="p-2.5 text-slate-400 hover:text-blue-500 transition-colors rounded-xl hover:bg-slate-50">
                <Search className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-slate-100 mx-1"></div>
              <button className="p-2.5 text-slate-400 hover:text-blue-500 transition-colors rounded-xl hover:bg-slate-50 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>
            
            {/* Avatar do Usuário */}
            <div 
              onClick={onProfileClick}
              className="flex items-center pl-2 cursor-pointer"
            >
              <div className="relative group">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Perfil" 
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-white shadow-sm group-hover:shadow-md transition-all" 
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm group-hover:shadow-md transition-all">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
    </>
  )
}

export default Header