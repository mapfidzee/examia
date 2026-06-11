import {
  deriveCommandActionPosture,
  deriveCommandImplication,
  deriveCommandPosture,
  explainCommandPosture,
  type CGICommandPosture,
} from '@/lib/cgi/deriveCommandPosture'
import { combineExecutiveActions } from '@/lib/cgi/interpreters/combineExecutiveActions'
import { interpretBottleneck } from '@/lib/cgi/interpreters/interpretBottleneck'
import { interpretPredictive } from '@/lib/cgi/interpreters/interpretPredictive'
import { interpretPressure } from '@/lib/cgi/interpreters/interpretPressure'
import { interpretRecovery } from '@/lib/cgi/interpreters/interpretRecovery'
import { interpretReliability } from '@/lib/cgi/interpreters/interpretReliability'
import { interpretTrajectory } from '@/lib/cgi/interpreters/interpretTrajectory'

export type CgiOperationalMetric = {
  id: string
  created_at: string
  scope: string
  continuity_integrity_score: number
  stabilization_confidence_score: number
  escalation_pressure_index: number
  recovery_reliability_score: number
  operational_survivability_score: number
  continuity_state: string
  propagation_risk: number
  routing_friction: number
  responder_pressure: number
  escalation_velocity: number
  coordination_instability: number
  stabilization_drag: number
  pressure_propagation_state: string
  trajectory_risk: number
  continuity_drift: number
  escalation_momentum: number
  recovery_direction: number
  stabilization_trend: number
  unresolved_momentum: number
  trajectory_direction: string
  structural_memory_risk: number
  routing_failure_recurrence: number
  escalation_corridor_recurrence: number
  institutional_fragility_signature: number
  intervention_failure_pattern: number
  responder_strain_recurrence: number
  continuity_collapse_recurrence: number
  structural_memory_state: string
  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
  executive_summary: string | null
  action_cue: string | null
  executive_priority_score: number | null
  survivability_threat_level: string | null
  executive_action_urgency: string | null
  structural_deterioration_state: string | null
  executive_action_deadline: string | null
}

export type InterpretiveThreshold =
  | 'CONTAINED'
  | 'WATCHABLE'
  | 'DESTABILIZING'
  | 'SURVIVABILITY THREAT'

export type InterpretiveBoard = {
  latest: CgiOperationalMetric
  commandPosture: CGICommandPosture
  commandMeaning: string
  executiveImplication: string
  actionPosture: string
  actionDeadline: string
  actionCue: string
  pressureThreshold: InterpretiveThreshold
  trajectoryThreshold: InterpretiveThreshold
  survivabilityThreshold: InterpretiveThreshold
  memoryThreshold: InterpretiveThreshold
  recoveryThreshold: InterpretiveThreshold
  survivabilityInterpretation: string
  structuralPattern: string
}

export function buildInterpretiveBoard(
  latest: CgiOperationalMetric,
): InterpretiveBoard {
  const centralizedPressure = interpretPressure({
    escalationPressure: latest.escalation_pressure_index,
    propagationRisk: latest.propagation_risk,
    unresolvedMomentum: latest.unresolved_momentum,
    continuityDrift: latest.continuity_drift,
  })

  const centralizedTrajectory = interpretTrajectory({
    trajectoryRisk: latest.trajectory_risk,
    continuityDrift: latest.continuity_drift,
    unresolvedMomentum: latest.unresolved_momentum,
    survivabilityRisk: 100 - latest.operational_survivability_score,
  })

  const centralizedRecovery = interpretRecovery({
    stabilizationConfidence: latest.stabilization_confidence_score,
    recoveryReliability: latest.recovery_reliability_score,
    survivabilityScore: latest.operational_survivability_score,
    continuityDrift: latest.continuity_drift,
    unresolvedMomentum: latest.unresolved_momentum,
  })

  const centralizedPredictive = interpretPredictive({
    propagationRisk: latest.propagation_risk,
    trajectoryRisk: latest.trajectory_risk,
    structuralMemoryRisk: latest.structural_memory_risk,
    unresolvedMomentum: latest.unresolved_momentum,
    stabilizationDrag: latest.stabilization_drag,
  })

  const centralizedBottleneck = interpretBottleneck({
    routingCongestion: latest.routing_friction,
    responderConcentration: latest.responder_pressure,
    unresolvedMomentum: latest.unresolved_momentum,
    continuityDrift: latest.continuity_drift,
    propagationRisk: latest.propagation_risk,
  })

  const recurrenceRate =
    average([
      latest.routing_failure_recurrence,
      latest.escalation_corridor_recurrence,
      latest.intervention_failure_pattern,
      latest.continuity_collapse_recurrence,
    ]) / 100

  const centralizedReliability = interpretReliability({
    unresolvedCases: Math.round(latest.unresolved_momentum / 10),
    overdueCases: Math.round(latest.routing_friction / 10),
    failedRecoveries: Math.round(latest.intervention_failure_pattern / 10),
    recurrenceRate,
  })

  const commandPosture = deriveCommandPosture({
    pressureSeverity: centralizedPressure.severity,
    trajectorySeverity: centralizedTrajectory.severity,
    recoverySeverity: centralizedRecovery.severity,
    predictiveSeverity: centralizedPredictive.severity,
    bottleneckSeverity: centralizedBottleneck.severity,
    reliabilitySeverity: centralizedReliability.severity,
  })

  return {
    latest,
    commandPosture,
    commandMeaning: explainCommandPosture(commandPosture),
    executiveImplication: deriveCommandImplication(commandPosture),
    actionPosture: deriveCommandActionPosture(commandPosture),
    actionDeadline: latest.executive_action_deadline || 'Next governance cycle',
    actionCue: combineExecutiveActions([
      centralizedPressure.executiveAction,
      centralizedTrajectory.executiveAction,
      centralizedRecovery.executiveAction,
      centralizedPredictive.executiveAction,
      centralizedBottleneck.executiveAction,
      centralizedReliability.executiveAction,
    ]),
    pressureThreshold: severityToThreshold(centralizedPressure.severity),
    trajectoryThreshold: severityToThreshold(centralizedTrajectory.severity),
    survivabilityThreshold: severityToThreshold(centralizedRecovery.severity),
    memoryThreshold: severityToThreshold(centralizedPredictive.severity),
    recoveryThreshold: severityToThreshold(centralizedReliability.severity),
    survivabilityInterpretation: centralizedRecovery.summary,
    structuralPattern:
      latest.dominant_memory_pattern || centralizedPredictive.summary,
  }
}

export function explainPressure(board: InterpretiveBoard) {
  if (board.pressureThreshold === 'SURVIVABILITY THREAT') {
    return 'Pressure is threatening operational survivability.'
  }

  if (board.pressureThreshold === 'DESTABILIZING') {
    return 'Pressure is intensifying and requires governance attention.'
  }

  if (board.pressureThreshold === 'WATCHABLE') {
    return 'Pressure remains visible and should continue under review.'
  }

  return 'Pressure is currently contained.'
}

export function explainRecovery(board: InterpretiveBoard) {
  if (board.recoveryThreshold === 'SURVIVABILITY THREAT') {
    return 'Recovery credibility is weak and should not support closure.'
  }

  if (board.recoveryThreshold === 'DESTABILIZING') {
    return 'Recovery remains fragile and requires stabilization reinforcement.'
  }

  if (board.recoveryThreshold === 'WATCHABLE') {
    return 'Recovery is visible but durability still requires confirmation.'
  }

  return 'Recovery posture is currently credible.'
}

export function explainSurvivability(board: InterpretiveBoard) {
  if (board.survivabilityThreshold === 'SURVIVABILITY THREAT') {
    return 'Survivability posture requires executive attention.'
  }

  if (board.survivabilityThreshold === 'DESTABILIZING') {
    return 'Survivability is vulnerable and should remain under governance review.'
  }

  if (board.survivabilityThreshold === 'WATCHABLE') {
    return 'Survivability exists but remains watchable.'
  }

  return 'Survivability posture is currently stable.'
}

export function explainMemory(board: InterpretiveBoard) {
  if (board.memoryThreshold === 'SURVIVABILITY THREAT') {
    return 'Structural recurrence is materially threatening survivability.'
  }

  if (board.memoryThreshold === 'DESTABILIZING') {
    return 'Recurring instability patterns remain operationally significant.'
  }

  if (board.memoryThreshold === 'WATCHABLE') {
    return 'Structural recurrence remains visible.'
  }

  return 'No dominant recurrence pattern is currently driving instability.'
}

export function severityToThreshold(severity: string): InterpretiveThreshold {
  if (severity === 'CRITICAL') return 'SURVIVABILITY THREAT'
  if (severity === 'HIGH') return 'DESTABILIZING'
  if (severity === 'MODERATE') return 'WATCHABLE'
  return 'CONTAINED'
}

export function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))

  if (valid.length === 0) return 0

  return Math.round(
    valid.reduce((sum, value) => sum + value, 0) / valid.length,
  )
}

export function formatSystemDate(value: string) {
  return new Date(value).toLocaleString()
}