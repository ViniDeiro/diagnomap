import { getFlowchartById } from '@/data/emergencyFlowcharts'
import { isSupabaseConfigured, supabase } from './supabaseClient'

export const ADMIN_EMAIL = 'joaopedrolopes@gmail.com'

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
