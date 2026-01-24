import React, { useEffect, useState } from 'react'
import { supabase } from '@/services/supabaseClient'
import { signOutDoctor, updateDoctorProfile } from '@/services/doctorRepo'
import { 
  User, Mail, MapPin, LogOut, Activity, BarChart3, 
  Phone, ArrowLeft, Edit3, ChevronRight, FileText
} from 'lucide-react'
import Image from 'next/image'

type DoctorRow = {
  id: string
  auth_user_id: string | null
  name: string
  email: string | null
  municipality_id: number | null
}

interface ProfileScreenProps {
  onBack: () => void
  onSignOut: () => void
}

export default function ProfileScreen({ onBack, onSignOut }: ProfileScreenProps) {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')
  const [profile, setProfile] = useState<DoctorRow | null>(null)
  
  // Dados do formulário
  const [name, setName] = useState<string>('')
  const [crm, setCrm] = useState<string>('')
  const [specialty, setSpecialty] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  
  // Estados de UI
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0, waiting: 0, discharged: 0 })
  const [recentPatients, setRecentPatients] = useState<{ id: string; name: string; status: string; selected_flowchart: string; updated_at: string }[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: userRes } = await supabase.auth.getUser()
      const user = userRes?.user
      if (!user) {
        onSignOut()
        return
      }
      setUserEmail(user.email || '')
      const metaAvatar = (user.user_metadata as any)?.avatar_url || ''
      if (metaAvatar) setAvatarUrl(metaAvatar)

      const { data } = await supabase
        .from('doctors')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()
      
      if (data) {
        setProfile(data as DoctorRow)
        setName(data.name || '')
        setCrm((data as any).crm || '')
        setSpecialty((data as any).specialty || 'Clínico Geral')
        setPhone((data as any).phone || '')
      }

      if (data?.id) {
        // Carregar estatísticas reais
        const [{ count: totalCount }, { count: activeCount }, { count: waitingCount }, { count: dischargedCount }] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }).eq('assigned_doctor_id', data.id),
          supabase.from('patients').select('*', { count: 'exact', head: true }).eq('assigned_doctor_id', data.id).eq('status', 'active'),
          supabase.from('patients').select('*', { count: 'exact', head: true }).eq('assigned_doctor_id', data.id).eq('status', 'waiting_labs'),
          supabase.from('patients').select('*', { count: 'exact', head: true }).eq('assigned_doctor_id', data.id).eq('status', 'discharged'),
        ])
        setStats({
          total: totalCount || 0,
          active: activeCount || 0,
          waiting: waitingCount || 0,
          discharged: dischargedCount || 0,
        })
        
        // Carregar pacientes recentes reais
        const { data: recent } = await supabase
          .from('patients')
          .select('id,name,status,selected_flowchart,updated_at')
          .eq('assigned_doctor_id', data.id)
          .order('updated_at', { ascending: false })
          .limit(5)
          
        if (recent) {
          setRecentPatients(recent.map(r => ({
            id: r.id as any,
            name: (r as any).name,
            status: (r as any).status,
            selected_flowchart: (r as any).selected_flowchart,
            updated_at: (r as any).updated_at
          })))
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      await updateDoctorProfile(profile.id, {
        name,
        crm,
        specialty,
        phone,
      })
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Upload simplificado para o Supabase Storage
    const { data: userRes } = await supabase.auth.getUser()
    const user = userRes?.user
    if (!user) return

    const filePath = `${user.id}/${Date.now()}_${file.name}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })
    
    if (upErr) {
      console.error('Erro no upload:', upErr)
      return
    }

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filePath)
    const url = pub?.publicUrl || ''
    setAvatarUrl(url)
    await supabase.auth.updateUser({ data: { avatar_url: url } })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans text-slate-800">
      
      {/* Header Superior */}
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
           {/* Menu icon placeholder se necessário */}
           <div className="w-6 h-0.5 bg-slate-300 rounded-full"></div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Dashboard</span>
          </button>
          
          <button 
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: Cartão de Perfil Principal */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-white">
            
            {/* Cabeçalho do Card */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
              <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100 relative">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="Avatar" width={128} height={128} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                  {/* Overlay de edição de foto */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit3 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <input type="file" className="hidden" onChange={handleAvatarChange} />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-1">{name || "Dr. Nome do Médico"}</h1>
                <p className="text-lg text-slate-500 font-medium">{specialty || "Clínico Geral"}</p>
                <p className="text-slate-400 mt-1">CRM-SP {crm || "000000"}</p>
                <div className="flex items-center gap-2 text-slate-400 mt-1 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>{userEmail}</span>
                </div>
              </div>
            </div>

            {/* Lista de Detalhes (Formulário Read-only ou Editável) */}
            <div className="space-y-6">
              {/* Item: Nome */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1">{name}</label>
                  <p className="text-slate-400 text-sm">{specialty}</p>
                </div>
              </div>

              {/* Item: CRM */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1">CRM-SP {crm}</label>
                </div>
              </div>

              {/* Item: Localização */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1">São Paulo, SP</label>
                </div>
              </div>

              {/* Item: Email */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1">{userEmail}</label>
                </div>
              </div>

              {/* Item: Telefone */}
              <div className="flex items-start gap-4 p-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4">
                  {isEditing ? (
                    <input 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      className="w-full border-b border-blue-500 outline-none pb-1"
                      placeholder="(00) 00000-0000"
                    />
                  ) : (
                    <label className="block text-sm font-bold text-slate-700 mb-1">{phone || "(11) 98765-4321"}</label>
                  )}
                </div>
              </div>
            </div>

            {/* Rodapé do Card: Botões */}
            <div className="flex items-center justify-between mt-10 pt-4">
              <button 
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-slate-500 font-medium hover:bg-slate-50 transition-colors"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="w-4 h-4" />
                <span>{isEditing ? 'Cancelar edição' : 'Edita informações'}</span>
              </button>

              {isEditing && (
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30"
                >
                  <span>{saving ? 'Salvando...' : 'Salvar'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/30"
                >
                  <span>Editar informações</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Coluna Direita: Widgets */}
        <div className="space-y-8">
          
          {/* Card: Atividades Recentes */}
          <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-white min-h-[200px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Atividades Recentes</h3>
            </div>
            
            {recentPatients.length === 0 ? (
              <p className="text-slate-400 font-medium mt-4">Nenhuma atividade recente</p>
            ) : (
              <div className="space-y-4">
                 {recentPatients.map(p => (
                   <div key={p.id} className="flex items-center justify-between border-b border-slate-50 pb-3 last:border-0">
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{p.name}</p>
                        <p className="text-xs text-slate-400">{new Date(p.updated_at).toLocaleDateString()}</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                   </div>
                 ))}
              </div>
            )}
          </div>

          {/* Card: Estatísticas */}
          <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Estatísticas</h3>
            </div>

            <div className="space-y-4">
              {/* Stat Item */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-slate-500 font-medium text-sm mb-1">Atendimentos do dia</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>

              {/* Stat Item */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-slate-500 font-medium text-sm mb-1">Ativos agora</p>
                <p className="text-3xl font-bold text-slate-800">{stats.active}</p>
              </div>

              {/* Stat Item */}
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <p className="text-slate-600 font-medium text-sm mb-1">Em observação</p>
                <p className="text-3xl font-bold text-slate-800">{stats.waiting}</p>
              </div>

              {/* Stat Item */}
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <p className="text-slate-600 font-medium text-sm mb-1">Altas realizadas</p>
                <p className="text-3xl font-bold text-slate-800">{stats.discharged}</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}