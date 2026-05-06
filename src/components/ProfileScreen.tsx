import React, { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/services/supabaseClient'
import { updateDoctorProfile } from '@/services/doctorRepo'
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Camera,
  ChevronRight,
  FileText,
  LogOut,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User
} from 'lucide-react'
import Image from 'next/image'

type DoctorRow = {
  id: string
  auth_user_id: string | null
  name: string
  email: string | null
  municipality_id: number | null
  crm?: string | null
  specialty?: string | null
  phone?: string | null
}

type RecentPatient = {
  id: string
  name: string
  status: string
  selected_flowchart: string
  updated_at: string
}

interface ProfileScreenProps {
  onBack: () => void
  onSignOut: () => void
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  waiting_labs: 'bg-amber-100 text-amber-800 border-amber-200',
  discharged: 'bg-sky-100 text-sky-800 border-sky-200'
}

const statusLabels: Record<string, string> = {
  active: 'Em atendimento',
  waiting_labs: 'Observação',
  discharged: 'Alta'
}

const flowchartLabels: Record<string, string> = {
  dengue: 'Dengue',
  tvp: 'TVP',
  asma: 'Asma',
  sepse: 'Sepse'
}

export default function ProfileScreen({ onBack, onSignOut }: ProfileScreenProps) {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [profile, setProfile] = useState<DoctorRow | null>(null)
  const [name, setName] = useState('')
  const [crm, setCrm] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [stats, setStats] = useState({ total: 0, active: 0, waiting: 0, discharged: 0 })
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: userRes } = await supabase.auth.getUser()
      const user = userRes?.user

      if (!user) {
        onSignOut()
        return
      }

      setUserEmail(user.email || '')
      const metaAvatar = (user.user_metadata as { avatar_url?: string } | null)?.avatar_url || ''
      if (metaAvatar) setAvatarUrl(metaAvatar)

      const { data } = await supabase
        .from('doctors')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (data) {
        const doctor = data as DoctorRow
        setProfile(doctor)
        setName(doctor.name || '')
        setCrm(doctor.crm || '')
        setSpecialty(doctor.specialty || 'Clínico Geral')
        setPhone(doctor.phone || '')
      }

      if (data?.id) {
        const [{ count: totalCount }, { count: activeCount }, { count: waitingCount }, { count: dischargedCount }] = await Promise.all([
          supabase.from('patients').select('*', { count: 'exact', head: true }).eq('assigned_doctor_id', data.id),
          supabase.from('patients').select('*', { count: 'exact', head: true }).eq('assigned_doctor_id', data.id).eq('status', 'active'),
          supabase.from('patients').select('*', { count: 'exact', head: true }).eq('assigned_doctor_id', data.id).eq('status', 'waiting_labs'),
          supabase.from('patients').select('*', { count: 'exact', head: true }).eq('assigned_doctor_id', data.id).eq('status', 'discharged')
        ])

        setStats({
          total: totalCount || 0,
          active: activeCount || 0,
          waiting: waitingCount || 0,
          discharged: dischargedCount || 0
        })

        const { data: recent } = await supabase
          .from('patients')
          .select('id,name,status,selected_flowchart,updated_at')
          .eq('assigned_doctor_id', data.id)
          .order('updated_at', { ascending: false })
          .limit(6)

        if (recent) {
          setRecentPatients(recent as RecentPatient[])
        }
      }

      setLoading(false)
    }

    load()
  }, [onSignOut])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      await updateDoctorProfile(profile.id, {
        name,
        crm,
        specialty,
        phone
      })
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
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

    if (upErr) {
      console.error('Erro no upload:', upErr)
      return
    }

    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filePath)
    const url = pub?.publicUrl || ''
    setAvatarUrl(url)
    await supabase.auth.updateUser({ data: { avatar_url: url } })
  }

  const derivedMetrics = useMemo(() => {
    const completedRate = stats.total > 0 ? Math.round((stats.discharged / stats.total) * 100) : 0
    const activePressure = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0
    return { completedRate, activePressure }
  }, [stats])

  const profileCards = [
    {
      label: 'Nome profissional',
      icon: User,
      value: name || 'Não informado',
      helper: specialty || 'Especialidade não informada'
    },
    {
      label: 'Registro',
      icon: FileText,
      value: crm ? `CRM ${crm}` : 'CRM não informado',
      helper: 'Identificação profissional'
    },
    {
      label: 'Contato',
      icon: Mail,
      value: userEmail || 'E-mail não disponível',
      helper: phone || 'Telefone não informado'
    },
    {
      label: 'Vínculo',
      icon: MapPin,
      value: profile?.municipality_id ? `Município #${profile.municipality_id}` : 'Município não informado',
      helper: 'Cadastro institucional'
    }
  ]

  const statCards = [
    {
      label: 'Atendimentos vinculados',
      value: stats.total,
      accent: 'from-sky-500 to-blue-600',
      surface: 'bg-sky-50 border-sky-100'
    },
    {
      label: 'Casos ativos',
      value: stats.active,
      accent: 'from-emerald-500 to-teal-600',
      surface: 'bg-emerald-50 border-emerald-100'
    },
    {
      label: 'Em observação',
      value: stats.waiting,
      accent: 'from-amber-400 to-orange-500',
      surface: 'bg-amber-50 border-amber-100'
    },
    {
      label: 'Altas concluídas',
      value: stats.discharged,
      accent: 'from-violet-500 to-indigo-600',
      surface: 'bg-violet-50 border-violet-100'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-4 border-sky-100 border-t-sky-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Carregando perfil profissional...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),_transparent_32%),linear-gradient(180deg,_#f7fbff_0%,_#eef4fb_45%,_#f8fafc_100%)] text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 px-4 py-2 font-medium text-slate-600 shadow-sm shadow-slate-200/60 backdrop-blur hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao dashboard
            </button>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span className="hidden sm:block">Perfil profissional</span>
          </div>

          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-2 self-start rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 lg:self-auto"
          >
            <LogOut className="h-4 w-4" />
            Encerrar sessão
          </button>
        </header>

        <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,_rgba(15,23,42,0.96)_0%,_rgba(10,37,64,0.95)_45%,_rgba(2,132,199,0.90)_100%)] p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.20),_transparent_28%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative h-28 w-28 overflow-hidden rounded-[28px] border border-white/30 bg-white/10 shadow-2xl shadow-slate-950/25 backdrop-blur"
                  >
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/10">
                        <User className="h-10 w-10 text-white/90" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-slate-950/35 via-transparent to-transparent p-3 opacity-100">
                      <span className="rounded-full bg-white/90 p-2 text-slate-900 shadow-lg transition group-hover:scale-105">
                        <Camera className="h-4 w-4" />
                      </span>
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/90 backdrop-blur">
                    <Sparkles className="h-3.5 w-3.5" />
                    Área profissional
                  </div>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{name || 'Médico(a) responsável'}</h1>
                    <p className="mt-2 text-base text-sky-50/80 sm:text-lg">
                      {specialty || 'Clínico Geral'} {crm ? `• CRM ${crm}` : '• CRM não informado'}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-sky-50/75">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                      <Mail className="h-4 w-4" />
                      {userEmail || 'Sem e-mail cadastrado'}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                      <Phone className="h-4 w-4" />
                      {phone || 'Telefone não informado'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100/70">Fluxo assistencial</p>
                  <p className="mt-3 text-2xl font-semibold">{stats.active}</p>
                  <p className="mt-1 text-sm text-sky-50/75">pacientes em condução ativa agora</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100/70">Eficiência clínica</p>
                  <p className="mt-3 text-2xl font-semibold">{derivedMetrics.completedRate}%</p>
                  <p className="mt-1 text-sm text-sky-50/75">dos casos já concluídos com alta</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100/70">Pressão assistencial</p>
                  <p className="mt-3 text-2xl font-semibold">{derivedMetrics.activePressure}%</p>
                  <p className="mt-1 text-sm text-sky-50/75">da base atual em atendimento ativo</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/15 p-3 text-sky-50">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100/70">Resumo profissional</p>
                  <h2 className="mt-1 text-xl font-semibold">Visão geral do cadastro</h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {profileCards.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-white/15 p-2.5 text-sky-50">
                        <item.icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/70">{item.label}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{item.value}</p>
                        <p className="mt-1 text-xs text-sky-50/70">{item.helper}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.45fr_0.55fr]">
          <section className="rounded-[34px] border border-white bg-white/90 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.15)] backdrop-blur sm:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">Dados do perfil</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Identidade profissional</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Mantenha suas informações alinhadas com o perfil institucional para que relatórios, prescrições e fluxos saiam com apresentação consistente.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsEditing((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <User className="h-4 w-4" />
                  {isEditing ? 'Cancelar edição' : 'Editar perfil'}
                </button>
                <button
                  onClick={isEditing ? handleSave : () => setIsEditing(true)}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>{isEditing ? (saving ? 'Salvando...' : 'Salvar alterações') : 'Entrar no modo edição'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <User className="h-4 w-4" />
                  Nome profissional
                </label>
                {isEditing ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    placeholder="Nome completo"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-900">{name || 'Não informado'}</p>
                )}
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Stethoscope className="h-4 w-4" />
                  Especialidade
                </label>
                {isEditing ? (
                  <input
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    placeholder="Especialidade"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-900">{specialty || 'Não informada'}</p>
                )}
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <FileText className="h-4 w-4" />
                  CRM
                </label>
                {isEditing ? (
                  <input
                    value={crm}
                    onChange={(e) => setCrm(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    placeholder="Número do CRM"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-900">{crm ? `CRM ${crm}` : 'Não informado'}</p>
                )}
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Phone className="h-4 w-4" />
                  Telefone
                </label>
                {isEditing ? (
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    placeholder="(00) 00000-0000"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-900">{phone || 'Não informado'}</p>
                )}
              </div>

              <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5 sm:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <Mail className="h-4 w-4" />
                  E-mail de acesso
                </label>
                <p className="text-base font-semibold text-slate-900">{userEmail || 'Não informado'}</p>
                <p className="mt-1 text-sm text-slate-500">Usado para autenticação e comunicações do sistema.</p>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[34px] border border-white bg-white/90 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.15)] backdrop-blur sm:p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-900 p-3 text-white">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">Indicadores</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">Pulso da operação</h3>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {statCards.map((card) => (
                  <div key={card.label} className={`overflow-hidden rounded-[26px] border p-4 ${card.surface}`}>
                    <div className={`h-1.5 rounded-full bg-gradient-to-r ${card.accent}`} />
                    <p className="mt-4 text-sm font-medium text-slate-500">{card.label}</p>
                    <div className="mt-2 flex items-end justify-between">
                      <p className="text-3xl font-semibold text-slate-900">{card.value}</p>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Hoje</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-white bg-white/90 p-6 shadow-[0_20px_60px_rgba(148,163,184,0.15)] backdrop-blur sm:p-7">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-500 p-3 text-white shadow-lg shadow-emerald-500/20">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Movimento recente</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">Últimos pacientes</h3>
                </div>
              </div>

              {recentPatients.length === 0 ? (
                <div className="mt-6 rounded-[26px] border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-medium text-slate-500">Nenhuma atividade recente encontrada.</p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {recentPatients.map((patientItem) => {
                    const statusClass = statusStyles[patientItem.status] || 'bg-slate-100 text-slate-700 border-slate-200'
                    const statusLabel = statusLabels[patientItem.status] || patientItem.status
                    const flowLabel = flowchartLabels[patientItem.selected_flowchart] || patientItem.selected_flowchart || 'Fluxo clínico'

                    return (
                      <div key={patientItem.id} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">{patientItem.name}</p>
                            <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">{flowLabel}</p>
                          </div>
                          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            Fluxo em andamento
                          </span>
                          <span>{new Date(patientItem.updated_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
