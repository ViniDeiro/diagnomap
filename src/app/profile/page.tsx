"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/services/supabaseClient'
import { signOutDoctor, updateDoctorProfile } from '@/services/doctorRepo'
import { User, Mail, MapPin, LogOut, Activity, BarChart3 } from 'lucide-react'
import Image from 'next/image'

type DoctorRow = {
  id: string
  auth_user_id: string | null
  name: string
  email: string | null
  municipality_id: number | null
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')
  const [profile, setProfile] = useState<DoctorRow | null>(null)
  const [ufs, setUfs] = useState<string[]>([])
  const [municipalities, setMunicipalities] = useState<{ id: number; name: string; uf: string }[]>([])
  const [selectedUf, setSelectedUf] = useState<string>('')
  const [municipalityId, setMunicipalityId] = useState<number | null>(null)
  const [name, setName] = useState<string>('')
  const [crm, setCrm] = useState<string>('')
  const [specialty, setSpecialty] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<{ total: number; active: number; waiting: number; discharged: number }>({ total: 0, active: 0, waiting: 0, discharged: 0 })
  const [recentPatients, setRecentPatients] = useState<{ id: string; name: string; status: string; selected_flowchart: string; updated_at: string }[]>([])
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const load = async () => {
      const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (!configured) {
        setOnline(false)
        setLoading(false)
        return
      }
      const { data: userRes } = await supabase.auth.getUser()
      const user = userRes?.user
      if (!user) {
        router.replace('/login')
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
      if (data) setProfile(data as DoctorRow)

      const { data: munis } = await supabase.from('municipalities').select('id,name,uf').order('name', { ascending: true })
      if (Array.isArray(munis)) {
        const rows = munis as any[]
        setMunicipalities(rows.map(r => ({ id: r.id, name: r.name, uf: r.uf })))
        const distinctUfs = Array.from(new Set(rows.map(r => (r.uf || '').trim()).filter(Boolean))).sort()
        setUfs(distinctUfs)
      }

      if (data?.id) {
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
        const { data: recent } = await supabase
          .from('patients')
          .select('id,name,status,selected_flowchart,updated_at')
          .eq('assigned_doctor_id', data.id)
          .order('updated_at', { ascending: false })
          .limit(5)
        setRecentPatients(Array.isArray(recent) ? recent.map(r => ({
          id: r.id as unknown as string,
          name: (r as any).name as string,
          status: (r as any).status as string,
          selected_flowchart: (r as any).selected_flowchart as string,
          updated_at: (r as any).updated_at as string
        })) : [])
      }

      setLoading(false)
    }
    load()
  }, [router])

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setMunicipalityId(profile.municipality_id || null)
      const ufOfMun = municipalities.find(m => m.id === (profile.municipality_id || -1))?.uf || ''
      setSelectedUf(ufOfMun)
    }
  }, [profile, municipalities])

  const handleSignOut = async () => {
    await signOutDoctor()
    router.replace('/login')
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const { data: userRes } = await supabase.auth.getUser()
    const user = userRes?.user
    if (!user) return
    const filePath = `${user.id}/${Date.now()}_${file.name}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })
    if (upErr) return
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filePath)
    const url = pub?.publicUrl || ''
    setAvatarUrl(url)
    await supabase.auth.updateUser({ data: { avatar_url: url } })
  }

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      await updateDoctorProfile(profile.id, {
        name,
        crm,
        specialty,
        phone,
        municipality_id: municipalityId ?? null
      })
      const { data } = await supabase.from('doctors').select('*').eq('id', profile.id).single()
      if (data) setProfile(data as DoctorRow)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Carregando perfil...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {!online && (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-6 py-4 text-amber-800">
            Supabase não configurado para ambiente local. Exibindo visual do perfil em modo demonstração.
          </div>
        )}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-slate-800 to-slate-900 text-white shadow-xl">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent" />
          <div className="relative px-8 pt-8 pb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden flex items-center justify-center ring-1 ring-white/30">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="text-sm uppercase tracking-wide text-white/80">Perfil</div>
                <h1 className="text-2xl md:text-3xl font-semibold">{name || profile?.name || 'Médico'}</h1>
                <div className="flex items-center text-white/80 text-sm mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{userEmail}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="inline-flex items-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors ring-1 ring-white/20">
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 transition-colors shadow-sm">
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60">
              <div className="px-8 pt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Informações Pessoais</h2>
                </div>
              </div>
              <div className="px-8 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <div className="text-xs text-slate-500 uppercase mb-1">Nome</div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="group">
                    <div className="text-xs text-slate-500 uppercase mb-1">CRM</div>
                    <input
                      type="text"
                      value={crm}
                      onChange={(e) => setCrm(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="group">
                    <div className="text-xs text-slate-500 uppercase mb-1">Especialidade</div>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="group">
                    <div className="text-xs text-slate-500 uppercase mb-1">Telefone</div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-3 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="group">
                    <div className="text-xs text-slate-500 uppercase mb-1">Estado (UF)</div>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
                      <MapPin className="w-5 h-5 text-slate-400 mr-2" />
                      <select
                        value={selectedUf}
                        onChange={(e) => {
                          const uf = e.target.value
                          setSelectedUf(uf)
                          setMunicipalityId(null)
                        }}
                        className="w-full bg-transparent py-3 outline-none"
                      >
                        <option value="">Selecione...</option>
                        {ufs.map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="group">
                    <div className="text-xs text-slate-500 uppercase mb-1">Município</div>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3">
                      <MapPin className="w-5 h-5 text-slate-400 mr-2" />
                      <select
                        value={municipalityId ?? ''}
                        onChange={(e) => setMunicipalityId(Number(e.target.value) || null)}
                        className="w-full bg-transparent py-3 outline-none"
                        disabled={!selectedUf}
                      >
                        <option value="">{selectedUf ? 'Selecione...' : 'Escolha o estado'}</option>
                        {municipalities.filter(m => m.uf === selectedUf).map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center bg-gradient-to-r from-blue-600 to-slate-700 text-white px-6 py-3 rounded-xl font-semibold shadow hover:shadow-lg transition-all"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60">
              <div className="px-8 pt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Estatísticas</h2>
                </div>
              </div>
              <div className="px-8 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:shadow-md transition-shadow">
                    <div className="text-slate-500 text-sm">Pacientes atribuídos</div>
                    <div className="mt-2 text-3xl font-semibold text-slate-800">{stats.total}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:shadow-md transition-shadow">
                    <div className="text-slate-500 text-sm">Em atendimento</div>
                    <div className="mt-2 text-3xl font-semibold text-slate-800">{stats.active}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:shadow-md transition-shadow">
                    <div className="text-slate-500 text-sm">Aguardando exames</div>
                    <div className="mt-2 text-3xl font-semibold text-slate-800">{stats.waiting}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:shadow-md transition-shadow">
                    <div className="text-slate-500 text-sm">Altas</div>
                    <div className="mt-2 text-3xl font-semibold text-slate-800">{stats.discharged}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60">
              <div className="px-8 pt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Atividades Recentes</h2>
                </div>
              </div>
              <div className="px-8 pb-8">
                <div className="space-y-4">
                  {recentPatients.length === 0 && (
                    <div className="text-slate-500">Sem atividades recentes</div>
                  )}
                  {recentPatients.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 hover:bg-slate-100 transition-colors">
                      <div>
                        <div className="font-semibold text-slate-800">{p.name}</div>
                        <div className="text-sm text-slate-500">{p.selected_flowchart} • {new Date(p.updated_at).toLocaleString('pt-BR')}</div>
                      </div>
                      <div className="text-xs px-3 py-1 rounded-full border"
                        data-status={p.status}
                      >
                        {p.status === 'active' && <span className="border-green-600 text-green-700">Ativo</span>}
                        {p.status === 'waiting_labs' && <span className="border-amber-600 text-amber-700">Exames</span>}
                        {p.status === 'discharged' && <span className="border-slate-600 text-slate-700">Alta</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60">
              <div className="px-8 pt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-600 text-white rounded-xl flex items-center justify-center shadow-md">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-800">Imagem de Perfil</h2>
                </div>
              </div>
              <div className="px-8 pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-200 overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                      <label htmlFor="avatar-input" className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 cursor-pointer transition-colors">
                        Escolher arquivo
                      </label>
                      {avatarUrl && (
                        <span className="text-slate-500 text-sm truncate max-w-[220px]">{avatarUrl}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
