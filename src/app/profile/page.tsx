"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/services/supabaseClient'
import { signOutDoctor, updateDoctorProfile } from '@/services/doctorRepo'
import { User, Mail, MapPin, LogOut } from 'lucide-react'
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

  useEffect(() => {
    const load = async () => {
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
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60">
          <div className="px-8 pt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                  <User className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">Perfil do Médico</h1>
              </div>
              <Link href="/" className="text-blue-600 font-semibold hover:underline">Voltar ao Dashboard</Link>
            </div>
          </div>
          <div className="px-8 pb-8">

            <div className="space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 uppercase mb-2">Foto</div>
                    <div className="flex items-center gap-3">
                      <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                      <label htmlFor="avatar-input" className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 cursor-pointer">
                        Escolher arquivo
                      </label>
                      {avatarUrl && (
                        <span className="text-slate-500 text-sm truncate max-w-[280px]">{avatarUrl}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-5">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-slate-500 mr-3" />
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Email</div>
                    <div className="text-slate-800 font-semibold">{userEmail}</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 uppercase mb-1">Nome</div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase mb-1">CRM</div>
                    <input
                      type="text"
                      value={crm}
                      onChange={(e) => setCrm(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase mb-1">Especialidade</div>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase mb-1">Telefone</div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-xs text-slate-500 uppercase mb-1">Estado (UF)</div>
                    <select
                      value={selectedUf}
                      onChange={(e) => {
                        const uf = e.target.value
                        setSelectedUf(uf)
                        setMunicipalityId(null)
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">Selecione...</option>
                      {ufs.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase mb-1">Município</div>
                    <select
                      value={municipalityId ?? ''}
                      onChange={(e) => setMunicipalityId(Number(e.target.value) || null)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      disabled={!selectedUf}
                    >
                      <option value="">{selectedUf ? 'Selecione...' : 'Escolha o estado'}</option>
                      {municipalities.filter(m => m.uf === selectedUf).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
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

          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSignOut}
              className="m-8 flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow hover:shadow-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
