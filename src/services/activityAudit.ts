import { getFlowchartById } from '@/data/emergencyFlowcharts'
import { isSupabaseConfigured, supabase } from './supabaseClient'

export const ADMIN_EMAILS = [
  'joaopedrolopes@gmail.com',
  'rodrigoplutarco@hotmail.com',
  'wrkcristianehellena@gmail.com',
  'makotopanetta@gmail.com'
] as const

// Perfis que já existiam quando o painel administrativo foi disponibilizado para teste.
// Os demais perfis históricos ficam fora da visão administrativa; cadastros feitos depois
// deste marco entram automaticamente, sem exigir manutenção desta lista.
export const ADMIN_VISIBLE_LEGACY_USERS_CUTOFF = '2026-08-07T12:26:35-03:00'

const ADMIN_VISIBLE_LEGACY_EMAILS = [
  'rodrigoplutarco@hotmail.com',
  'makotopanetta@gmail.com',
  'leybueno@hotmail.com'
] as const

const ADMIN_VISIBLE_LEGACY_NAMES = [
  'mariana roveron',
  'mariana abdalla',
  'rafael panetta',
  'rafael panneta',
  'rodrigo machado',
  'rodrigo luiz plutarco nogueira machado',
  'ley ortega bueno'
] as const

type AdminVisibleUser = {
  name?: string | null
  email?: string | null
  created_at?: string | null
}

function normalizeIdentity(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

export function isVisibleAdminPanelUser(user: AdminVisibleUser): boolean {
  const email = normalizeIdentity(user.email)
  const name = normalizeIdentity(user.name)
  const nameParts = new Set(name.split(' ').filter(Boolean))
  const isApprovedLegacyUser = ADMIN_VISIBLE_LEGACY_EMAILS.includes(
    email as (typeof ADMIN_VISIBLE_LEGACY_EMAILS)[number]
  ) || ADMIN_VISIBLE_LEGACY_NAMES.some((approvedName) => (
    approvedName.split(' ').every((part) => nameParts.has(part))
  ))

  if (isApprovedLegacyUser) return true

  const createdAt = user.created_at ? Date.parse(user.created_at) : Number.NaN
  return Number.isFinite(createdAt) && createdAt > Date.parse(ADMIN_VISIBLE_LEGACY_USERS_CUTOFF)
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.trim().toLowerCase() as (typeof ADMIN_EMAILS)[number])
}

export type ActivityEventType =
  | 'patient_created'
  | 'flowchart_started'
  | 'flowchart_progress'
  | 'flowchart_completed'

type ActivityInput = {
  eventType: ActivityEventType
  patientExternalId?: string
  flowchartId?: string
  stepId?: string
  progress?: number
  metadata?: Record<string, unknown>
}

export async function logActivityEvent(input: ActivityInput): Promise<void> {
  if (!isSupabaseConfigured) return

  try {
    const { data: userResult } = await supabase.auth.getUser()
    const user = userResult.user
    if (!user?.email) return

    const { data: doctor } = await supabase
      .from('doctors')
      .select('id, name')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    const flowchart = input.flowchartId ? getFlowchartById(input.flowchartId as never) : null
    await supabase.from('activity_events').insert({
      auth_user_id: user.id,
      doctor_id: doctor?.id ?? null,
      user_email: user.email.toLowerCase(),
      doctor_name: doctor?.name ?? user.user_metadata?.full_name ?? user.email,
      patient_external_id: input.patientExternalId ?? null,
      flowchart_id: input.flowchartId ?? null,
      flowchart_name: flowchart?.name ?? input.flowchartId ?? null,
      event_type: input.eventType,
      step_id: input.stepId ?? null,
      progress: typeof input.progress === 'number' ? Math.round(input.progress) : null,
      metadata: input.metadata ?? {}
    })
  } catch (error) {
    console.warn('Não foi possível registrar o evento de auditoria:', error)
  }
}
