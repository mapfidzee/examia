import { supabase } from '../supabase'

type PersistOperationalSnapshotInput = {
  scope: string
  region?: string | null
  institutionId?: string | null

  continuityState: string
  pressurePropagationState: string
  trajectoryDirection: string
  structuralMemoryState: string

  continuityIntegrityScore: number
  stabilizationConfidenceScore: number
  escalationPressureIndex: number
  recoveryReliabilityScore: number
  operationalSurvivabilityScore: number

  propagationRisk: number
  trajectoryRisk: number
  structuralMemoryRisk: number

  recoveryDirection: number
  stabilizationTrend: number
  unresolvedMomentum: number
  stabilizationDrag: number
  continuityDrift: number
  escalationMomentum: number

  dominantPressureSource?: string | null
  dominantTrajectorySignal?: string | null
  dominantMemoryPattern?: string | null
  executiveSummary?: string | null
  actionCue?: string | null
}

function deriveExecutivePriorityScore(
  input: PersistOperationalSnapshotInput
) {
  return Math.round(
    (
      input.escalationPressureIndex +
      input.propagationRisk +
      input.trajectoryRisk +
      input.structuralMemoryRisk +
      input.unresolvedMomentum +
      input.continuityDrift
    ) / 6
  )
}

function deriveSurvivabilityThreatLevel(score: number) {
  if (score >= 80) {
    return 'SURVIVABILITY THREAT'
  }

  if (score >= 60) {
    return 'HIGH RISK'
  }

  if (score >= 40) {
    return 'WATCH REQUIRED'
  }

  return 'STABLE'
}

function deriveExecutiveActionUrgency(score: number) {
  if (score >= 80) {
    return 'IMMEDIATE'
  }

  if (score >= 60) {
    return 'HIGH PRIORITY'
  }

  if (score >= 40) {
    return 'MONITOR CLOSELY'
  }

  return 'ROUTINE'
}

function deriveStructuralDeteriorationState(
  input: PersistOperationalSnapshotInput
) {
  const deteriorationLoad =
    (
      input.continuityDrift +
      input.unresolvedMomentum +
      input.escalationMomentum +
      input.stabilizationDrag
    ) / 4

  if (deteriorationLoad >= 75) {
    return 'STRUCTURAL DETERIORATION ACTIVE'
  }

  if (deteriorationLoad >= 55) {
    return 'STRUCTURAL STRAIN INCREASING'
  }

  if (deteriorationLoad >= 40) {
    return 'STRUCTURAL WATCH'
  }

  return 'STRUCTURALLY STABLE'
}

function deriveExecutiveActionDeadline(score: number) {
  if (score >= 80) {
    return 'WITHIN 4 HOURS'
  }

  if (score >= 60) {
    return 'WITHIN 24 HOURS'
  }

  if (score >= 40) {
    return 'NEXT GOVERNANCE CYCLE'
  }

  return 'ROUTINE REVIEW WINDOW'
}

export async function persistOperationalSnapshot(
  input: PersistOperationalSnapshotInput
) {
  const executivePriorityScore =
    deriveExecutivePriorityScore(input)

  const survivabilityThreatLevel =
    deriveSurvivabilityThreatLevel(
      executivePriorityScore
    )

  const executiveActionUrgency =
    deriveExecutiveActionUrgency(
      executivePriorityScore
    )

  const structuralDeteriorationState =
    deriveStructuralDeteriorationState(input)

  const executiveActionDeadline =
    deriveExecutiveActionDeadline(
      executivePriorityScore
    )

  const { data, error } = await supabase
    .from('cgi_operational_metrics')
    .insert({
      scope: input.scope,
      region: input.region ?? null,
      institution_id: input.institutionId ?? null,

      continuity_state: input.continuityState,
      pressure_propagation_state:
        input.pressurePropagationState,
      trajectory_direction:
        input.trajectoryDirection,
      structural_memory_state:
        input.structuralMemoryState,

      continuity_integrity_score:
        input.continuityIntegrityScore,
      stabilization_confidence_score:
        input.stabilizationConfidenceScore,
      escalation_pressure_index:
        input.escalationPressureIndex,
      recovery_reliability_score:
        input.recoveryReliabilityScore,
      operational_survivability_score:
        input.operationalSurvivabilityScore,

      propagation_risk: input.propagationRisk,
      trajectory_risk: input.trajectoryRisk,
      structural_memory_risk:
        input.structuralMemoryRisk,

      recovery_direction:
        input.recoveryDirection,
      stabilization_trend:
        input.stabilizationTrend,
      unresolved_momentum:
        input.unresolvedMomentum,
      stabilization_drag:
        input.stabilizationDrag,
      continuity_drift:
        input.continuityDrift,
      escalation_momentum:
        input.escalationMomentum,

      dominant_pressure_source:
        input.dominantPressureSource ?? null,
      dominant_trajectory_signal:
        input.dominantTrajectorySignal ?? null,
      dominant_memory_pattern:
        input.dominantMemoryPattern ?? null,

      executive_summary:
        input.executiveSummary ?? null,

      action_cue:
        input.actionCue ?? null,

      executive_priority_score:
        executivePriorityScore,

      survivability_threat_level:
        survivabilityThreatLevel,

      executive_action_urgency:
        executiveActionUrgency,

      structural_deterioration_state:
        structuralDeteriorationState,

      executive_action_deadline:
        executiveActionDeadline,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(
      `Failed to persist CGI operational snapshot: ${error.message}`
    )
  }

  return data
}