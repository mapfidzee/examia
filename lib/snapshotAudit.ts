import { supabase } from './supabase'

type SnapshotAuditInput = {
  snapshotId: string

  auditAction: string
  auditReason?: string

  governanceScope?: string
  governanceInstitution: string

  performedBy?: string | null
  performedByEmail?: string | null

  continuityPosture?: string
  trajectoryState?: string
  pressureClassification?: string
  recoveryStatus?: string

  executiveVisibilityLevel?: string
}

export async function createSnapshotAuditLog(
  input: SnapshotAuditInput
) {
  const { error } = await supabase
    .from('cgi_snapshot_audit_log')
    .insert({
      snapshot_id: input.snapshotId,

      audit_action: input.auditAction,
      audit_reason: input.auditReason ?? null,

      governance_scope: input.governanceScope ?? null,
      governance_institution: input.governanceInstitution,

      performed_by: input.performedBy ?? null,
      performed_by_email: input.performedByEmail ?? null,

      continuity_posture: input.continuityPosture ?? null,
      trajectory_state: input.trajectoryState ?? null,
      pressure_classification:
        input.pressureClassification ?? null,
      recovery_status: input.recoveryStatus ?? null,

      executive_visibility_level:
        input.executiveVisibilityLevel ?? null,
    })

  if (error) {
    console.error(
      'CGI snapshot audit logging failed',
      error
    )

    return {
      success: false,
      error,
    }
  }

  return {
    success: true,
  }
}