'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowLeft, CheckCircle2, Clock3, Download, FileSignature, RefreshCw, ShieldCheck, Stethoscope, Users } from 'lucide-react'
import { isAdminEmail, isVisibleAdminPanelUser } from '@/services/activityAudit'
import { getFlowchartById } from '@/data/emergencyFlowcharts'
import { supabase } from '@/services/supabaseClient'
import { ConfidentialityAgreementRow, createConfidentialityPdfDownload } from '@/lib/confidentialityTerm'

type AuditRow = {
  id: string
  doctor_name: string | null
  user_email: string
  flowchart_id: string | null
  flowchart_name: string | null
  event_type: string
  step_id: string | null
  progress: number | null
  occurred_at: string
}

type PatientRow = {
  id: string
  assigned_doctor_id: string | null
  selected_flowchart: string
  status: string
  flowchart_state: { progress?: number; currentStep?: string } | null
  created_at: string
  updated_at: string
}

type DoctorRow = { id: string; name: string; email: string | null; created_at: string | null }

const labels: Record<string, string> = {
  patient_created: 'Atendimento criado',
  flowchart_started: 'Fluxograma iniciado',
  flowchart_progress: 'Etapa registrada',
  flowchart_completed: 'Fluxograma concluído'
}

export default function AdminActivityPanel({ onBack }: { onBack: () => void }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<AuditRow[]>([])
  const [patients, setPatients] = useState<PatientRow[]>([])
  const [doctors, setDoctors] = useState<DoctorRow[]>([])
  const [agreements, setAgreements] = useState<ConfidentialityAgreementRow[]>([])
  const [downloadingAgreementId, setDownloadingAgreementId] = useState<string | null>(null)
  const [agreementError, setAgreementError] = useState<string | null>(null)
  const [doctorFilter, setDoctorFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    const { data: authData } = await supabase.auth.getUser()
    const isAdmin = isAdminEmail(authData.user?.email)
    setAuthorized(isAdmin)
    if (!isAdmin) {
      setLoading(false)
      return
    }

    const [eventResult, patientResult, doctorResult, agreementResult] = await Promise.all([
      supabase.from('activity_events').select('*').order('occurred_at', { ascending: false }).limit(500),
      supabase.from('patients').select('id, assigned_doctor_id, selected_flowchart, status, flowchart_state, created_at, updated_at').order('updated_at', { ascending: false }).limit(500),
      supabase.from('doctors').select('id, name, email, created_at').order('name'),
      supabase.from('confidentiality_agreements').select('*').order('signed_at', { ascending: false }).limit(500)
    ])
    setEvents((eventResult.data ?? []) as AuditRow[])
    setPatients((patientResult.data ?? []) as PatientRow[])
    setDoctors((doctorResult.data ?? []) as DoctorRow[])
    setAgreements((agreementResult.data ?? []) as ConfidentialityAgreementRow[])
    setAgreementError(agreementResult.error ? 'Não foi possível carregar os termos. Verifique se a migração de confidencialidade foi aplicada no Supabase.' : null)
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  const panelDoctors = useMemo(() => doctors.filter(isVisibleAdminPanelUser), [doctors])
  const doctorMap = useMemo(() => new Map(panelDoctors.map((doctor) => [doctor.id, doctor])), [panelDoctors])
  const panelDoctorIds = useMemo(() => new Set(panelDoctors.map((doctor) => doctor.id)), [panelDoctors])
  const panelDoctorEmails = useMemo(
    () => new Set(panelDoctors.flatMap((doctor) => doctor.email ? [doctor.email.trim().toLowerCase()] : [])),
    [panelDoctors]
  )
  const panelPatients = useMemo(
    () => patients.filter((patient) => patient.assigned_doctor_id !== null && panelDoctorIds.has(patient.assigned_doctor_id)),
    [patients, panelDoctorIds]
  )
  const panelEvents = useMemo(
    () => events.filter((event) => panelDoctorEmails.has(event.user_email.trim().toLowerCase())),
    [events, panelDoctorEmails]
  )
  const visiblePatients = doctorFilter === 'all' ? panelPatients : panelPatients.filter((patient) => patient.assigned_doctor_id === doctorFilter)
  const visibleEvents = doctorFilter === 'all'
    ? panelEvents
    : panelEvents.filter((event) => doctorMap.get(doctorFilter)?.email?.toLowerCase() === event.user_email.toLowerCase())
  const panelAgreements = useMemo(
    () => agreements.filter((agreement) => (
      (agreement.doctor_id !== null && panelDoctorIds.has(agreement.doctor_id))
      || panelDoctorEmails.has(agreement.email.trim().toLowerCase())
    )),
    [agreements, panelDoctorEmails, panelDoctorIds]
  )
  const visibleAgreements = doctorFilter === 'all'
    ? panelAgreements
    : panelAgreements.filter((agreement) => agreement.doctor_id === doctorFilter || agreement.email.toLowerCase() === doctorMap.get(doctorFilter)?.email?.toLowerCase())
  const today = new Date().toDateString()
  const eventsToday = visibleEvents.filter((event) => new Date(event.occurred_at).toDateString() === today).length
  const completed = visiblePatients.filter((patient) => patient.status === 'discharged').length
  const activeDoctors = new Set(visibleEvents.map((event) => event.user_email)).size

  const downloadAgreement = async (agreement: ConfidentialityAgreementRow) => {
    setAgreementError(null)
    setDownloadingAgreementId(agreement.id)
    try {
      const safeName = agreement.full_name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase()
      const url = await createConfidentialityPdfDownload(agreement.pdf_path, `termo-confidencialidade-${safeName || agreement.id}.pdf`)
      const link = document.createElement('a')
      link.href = url
      link.download = `termo-confidencialidade-${safeName || agreement.id}.pdf`
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      setAgreementError(error instanceof Error ? error.message : 'Não foi possível baixar o documento assinado.')
    } finally {
      setDownloadingAgreementId(null)
    }
  }

  if (authorized === false) {
    return <main className="min-h-[calc(100vh-8rem)] bg-slate-50 p-6"><div className="mx-auto max-w-xl rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm"><ShieldCheck className="mx-auto mb-4 h-10 w-10 text-red-500"/><h1 className="text-2xl font-bold text-slate-900">Acesso administrativo restrito</h1><p className="mt-2 text-slate-600">Este painel está disponível somente para o perfil autorizado.</p><button onClick={onBack} className="mt-6 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white">Voltar</button></div></main>
  }

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><button onClick={onBack} className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-700"><ArrowLeft className="h-4 w-4"/>Voltar ao dashboard</button><p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Área exclusiva</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Painel administrativo</h1><p className="mt-2 text-slate-600">Acompanhe quem está testando, qual protocolo percorreu e o estado atual do atendimento.</p></div>
          <div className="flex gap-3"><select value={doctorFilter} onChange={(event) => setDoctorFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"><option value="all">Todos os usuários</option>{panelDoctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}</select><button onClick={() => void load()} className="rounded-xl border border-slate-200 bg-white p-3 text-slate-600 hover:text-blue-700" aria-label="Atualizar"><RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}/></button></div>
        </div>

        <section className="grid gap-4 md:grid-cols-5">
          {[[Activity, eventsToday, 'Eventos hoje'], [Users, activeDoctors, 'Usuários ativos'], [FileSignature, visibleAgreements.length, 'Termos assinados'], [Stethoscope, visiblePatients.length, 'Atendimentos salvos'], [CheckCircle2, completed, 'Fluxos concluídos']].map(([Icon, value, label]) => { const CardIcon = Icon as typeof Activity; return <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><CardIcon className="mb-4 h-6 w-6 text-blue-600"/><p className="text-3xl font-bold text-slate-950">{String(value)}</p><p className="mt-1 text-sm text-slate-500">{String(label)}</p></div> })}
        </section>

        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
            <div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><FileSignature className="h-5 w-5 text-blue-600" />Termos de confidencialidade assinados</h2><p className="mt-1 text-sm text-slate-500">Documentos vinculados ao cadastro, armazenados de forma privada.</p></div>
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{visibleAgreements.length} documento{visibleAgreements.length === 1 ? '' : 's'}</span>
          </div>
          {agreementError && <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{agreementError}</div>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-4">Usuário</th><th className="px-6 py-4">CRM</th><th className="px-6 py-4">Assinado em</th><th className="px-6 py-4">Versão</th><th className="px-6 py-4 text-right">Documento</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {visibleAgreements.map((agreement) => <tr key={agreement.id}><td className="px-6 py-4"><p className="font-semibold text-slate-900">{agreement.full_name}</p><p className="text-xs text-slate-500">{agreement.email}</p></td><td className="px-6 py-4 text-slate-700">{agreement.crm}</td><td className="px-6 py-4 text-slate-600">{new Date(agreement.signed_at).toLocaleString('pt-BR')}</td><td className="px-6 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{agreement.term_version}</span></td><td className="px-6 py-4 text-right"><button type="button" onClick={() => void downloadAgreement(agreement)} disabled={downloadingAgreementId === agreement.id} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-wait disabled:bg-slate-400"><Download className="h-4 w-4" />{downloadingAgreementId === agreement.id ? 'Preparando...' : 'Baixar PDF'}</button></td></tr>)}
              </tbody>
            </table>
            {!loading && visibleAgreements.length === 0 && !agreementError && <p className="p-8 text-center text-slate-500">Nenhum termo de confidencialidade assinado encontrado.</p>}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-6"><h2 className="text-lg font-bold text-slate-900">Atendimentos mais recentes</h2><p className="text-sm text-slate-500">Visão consolidada do banco de dados.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-4">Profissional</th><th className="px-6 py-4">Fluxograma</th><th className="px-6 py-4">Progresso</th><th className="px-6 py-4">Situação</th><th className="px-6 py-4">Atualizado</th></tr></thead><tbody className="divide-y divide-slate-100">{visiblePatients.map((patient) => { const doctor = patient.assigned_doctor_id ? doctorMap.get(patient.assigned_doctor_id) : null; const flow = getFlowchartById(patient.selected_flowchart as never); return <tr key={patient.id}><td className="px-6 py-4"><p className="font-semibold text-slate-900">{doctor?.name ?? 'Profissional não vinculado'}</p><p className="text-xs text-slate-500">{doctor?.email ?? '—'}</p></td><td className="px-6 py-4 text-slate-700">{flow?.name ?? patient.selected_flowchart}</td><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${patient.flowchart_state?.progress ?? 0}%` }}/></div><span>{patient.flowchart_state?.progress ?? 0}%</span></div></td><td className="px-6 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{patient.status === 'discharged' ? 'Concluído' : patient.status === 'waiting_labs' ? 'Aguardando exames' : 'Em andamento'}</span></td><td className="px-6 py-4 text-slate-500">{new Date(patient.updated_at).toLocaleString('pt-BR')}</td></tr>})}</tbody></table>{!loading && visiblePatients.length === 0 && <p className="p-8 text-center text-slate-500">Nenhum atendimento encontrado.</p>}</div></div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Atividade detalhada</h2><p className="mb-6 text-sm text-slate-500">Eventos registrados a partir desta versão.</p><div className="max-h-[620px] space-y-4 overflow-y-auto pr-2">{visibleEvents.map((event) => <div key={event.id} className="flex gap-3 rounded-2xl border border-slate-100 p-4"><div className="mt-1 rounded-lg bg-blue-50 p-2"><Clock3 className="h-4 w-4 text-blue-600"/></div><div className="min-w-0"><p className="font-semibold text-slate-900">{labels[event.event_type] ?? event.event_type}</p><p className="truncate text-sm text-slate-600">{event.doctor_name ?? event.user_email} · {event.flowchart_name ?? event.flowchart_id ?? 'Atendimento'}</p><p className="mt-1 text-xs text-slate-400">{new Date(event.occurred_at).toLocaleString('pt-BR')}{event.progress !== null ? ` · ${event.progress}%` : ''}</p></div></div>)}{!loading && visibleEvents.length === 0 && <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">A trilha detalhada começará a aparecer conforme os novos testes forem realizados.</p>}</div></div>
        </section>
      </div>
    </main>
  )
}
