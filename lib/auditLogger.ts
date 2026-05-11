import { supabase } from './supabase'

export type AuditSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

export type AuditLogInput = {
  userId?: string | null
  email?: string | null
  role?: string | null
  actionType: string
  route: string
  recordType?: string | null
  recordId?: string | null
  summary: string
  severity?: AuditSeverity
}

export async function logAuditEvent(input: AuditLogInput) {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      user_id: input.userId ?? null,
      email: input.email ?? null,
      role: input.role ?? null,
      action_type: input.actionType,
      route: input.route,
      record_type: input.recordType ?? null,
      record_id: input.recordId ?? null,
      summary: input.summary,
      severity: input.severity ?? 'LOW',
    })

    if (error) {
      console.error('Audit logging failed:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown audit logging error'

    console.error('Audit logging crashed:', message)

    return { success: false, error: message }
  }
}