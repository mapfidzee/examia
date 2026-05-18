import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type ResponderReadinessPosture =
  | 'RESPONDER CAPACITY STABLE'
  | 'RESPONDER LOAD WATCH'
  | 'RESPONDER STRAIN ELEVATED'
  | 'RESPONDER STABILITY CRITICAL'

type InterpretResponderReadinessInput = {
  highestResponderLoad: number
  routedWithoutResponder: number
  unresolvedInterventionPathways: number
}

type ResponderReadinessInterpretation = {
  posture: ResponderReadinessPosture
  severity: CGISeverity
  summary: string
  executiveAction: string
}

export function interpretResponderReadiness(
  input: InterpretResponderReadinessInput
): ResponderReadinessInterpretation {
  const instabilityLoad =
    input.highestResponderLoad +
    input.routedWithoutResponder +
    input.unresolvedInterventionPathways

  if (
    input.highestResponderLoad >= 4 ||
    instabilityLoad >= 7
  ) {
    return {
      posture: 'RESPONDER STABILITY CRITICAL',
      severity: 'CRITICAL',
      summary:
        'Responder concentration pressure may undermine operational continuity responsiveness.',
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Responder concentration dependency is materially elevated.',
        stabilizationNeed:
          'Reduce responder concentration and restore operational resilience.',
        escalationTrigger:
          'Executive responder stabilization review is required.',
      }),
    }
  }

  if (
    input.highestResponderLoad >= 3 ||
    instabilityLoad >= 5
  ) {
    return {
      posture: 'RESPONDER STRAIN ELEVATED',
      severity: 'HIGH',
      summary:
        'Responder operational strain is increasing across continuity pathways.',
      executiveAction: compactExecutiveAction({
        severity: 'HIGH',
        primaryConcern:
          'Responder operational load is elevated.',
        stabilizationNeed:
          'Monitor concentration pressure and rebalance continuity ownership.',
      }),
    }
  }

  if (
    input.highestResponderLoad >= 2 ||
    instabilityLoad >= 2
  ) {
    return {
      posture: 'RESPONDER LOAD WATCH',
      severity: 'MODERATE',
      summary:
        'Responder pressure remains visible and should remain under review.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Responder load remains operationally visible.',
        stabilizationNeed:
          'Continue responder load visibility and continuity monitoring.',
      }),
    }
  }

  return {
    posture: 'RESPONDER CAPACITY STABLE',
    severity: 'LOW',
    summary:
      'Responder distribution currently appears operationally stable.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain responder readiness visibility and balanced continuity ownership.',
    }),
  }
}