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

type SnapshotAuditResult = {
  success: boolean
  error?: string
}

export async function createSnapshotAuditLog(
  input: SnapshotAuditInput
): Promise<SnapshotAuditResult> {
  const governanceReason =
    input.auditReason ||
    'Governed continuity snapshot preserved for executive evidence reconstruction.'

  const governancePosture = resolveGovernancePosture({
    continuityPosture: input.continuityPosture,
    trajectoryState: input.trajectoryState,
    pressureClassification: input.pressureClassification,
  })

  const severity = resolveSeverity({
    governancePosture,
    pressureClassification: input.pressureClassification,
  })

  const { error } = await supabase
    .from('audit_logs')
    .insert({
      actor_id: input.performedBy ?? null,
      actor_email: input.performedByEmail ?? null,
      actor_role: 'CONTINUITY_GOVERNANCE_ACTOR',

      action_type: input.auditAction,
      route: '/operations',
      severity,

      institution_id: null,

      details: {
        evidence_type: 'GOVERNED_CONTINUITY_SNAPSHOT',
        immutability_status: 'IMMUTABLE_GOVERNANCE_RECORD',
        reconstruction_capability: 'ENABLED',

        snapshot_id: input.snapshotId,
        linked_snapshot_id: input.snapshotId,

        governance_reason: governanceReason,
        governance_scope: input.governanceScope ?? null,
        governance_institution: input.governanceInstitution,
        governance_posture: governancePosture,

        visibility_level:
          input.executiveVisibilityLevel ??
          'EXECUTIVE',

        continuity_posture:
          input.continuityPosture ?? null,
        trajectory_state:
          input.trajectoryState ?? null,
        pressure_classification:
          input.pressureClassification ?? null,
        recovery_status:
          input.recoveryStatus ?? null,

        survivability_context:
          buildSurvivabilityContext({
            continuityPosture: input.continuityPosture,
            trajectoryState: input.trajectoryState,
            recoveryStatus: input.recoveryStatus,
          }),

        continuity_memory_preserved: true,
        institutional_traceability: true,
        executive_visibility_enabled: true,

        governance_boundary:
          'NON_PUNITIVE_CONTINUITY_GOVERNANCE',
      },
    })

  if (error) {
    console.error(
      'CGI governed snapshot audit logging failed',
      error
    )

    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
  }
}

function resolveSeverity(input: {
  governancePosture: string
  pressureClassification?: string
}) {
  const pressure =
    input.pressureClassification?.toUpperCase() || ''

  if (pressure.includes('UNCONTROLLED')) {
    return 'CRITICAL'
  }

  if (input.governancePosture === 'EXECUTIVE_REVIEW') {
    return 'HIGH'
  }

  if (pressure.includes('PRESSURE')) {
    return 'MODERATE'
  }

  return 'LOW'
}

function resolveGovernancePosture(input: {
  continuityPosture?: string
  trajectoryState?: string
  pressureClassification?: string
}) {
  const continuity =
    input.continuityPosture?.toUpperCase() || ''

  const trajectory =
    input.trajectoryState?.toUpperCase() || ''

  const pressure =
    input.pressureClassification?.toUpperCase() || ''

  if (
    continuity.includes('COLLAPSE') ||
    trajectory.includes('DETERIORATING') ||
    pressure.includes('UNCONTROLLED')
  ) {
    return 'EXECUTIVE_REVIEW'
  }

  if (
    pressure.includes('PRESSURE') ||
    trajectory.includes('STABILIZING') ||
    continuity.includes('STABILIZING')
  ) {
    return 'GOVERNANCE_WATCH'
  }

  return 'CONTINUITY_MONITORING'
}

function buildSurvivabilityContext(input: {
  continuityPosture?: string
  trajectoryState?: string
  recoveryStatus?: string
}) {
  const continuity =
    input.continuityPosture || 'not recorded'

  const trajectory =
    input.trajectoryState || 'not recorded'

  const recovery =
    input.recoveryStatus || 'not recorded'

  return `Continuity posture ${continuity.toLowerCase()} with recovery state ${recovery.toLowerCase()} and trajectory ${trajectory.toLowerCase()}. Stabilization must remain governed until survivability credibility becomes durable.`
}