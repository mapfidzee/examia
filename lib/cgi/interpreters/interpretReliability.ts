import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type ReliabilityPosture =
  | 'RELIABILITY STABLE'
  | 'RELIABILITY HOLDING'
  | 'RELIABILITY STRAINING'
  | 'RELIABILITY UNSTABLE'

type InterpretReliabilityInput = {
  unresolvedCases: number
  overdueCases: number
  failedRecoveries: number
  recurrenceRate: number
}

type ReliabilityInterpretation = {
  posture: ReliabilityPosture
  severity: CGISeverity
  summary: string
  executiveAction: string
}

export function interpretReliability(
  input: InterpretReliabilityInput
): ReliabilityInterpretation {
  const {
    unresolvedCases,
    overdueCases,
    failedRecoveries,
    recurrenceRate,
  } = input

  const instabilityLoad =
    unresolvedCases + overdueCases + failedRecoveries

  if (instabilityLoad >= 20 || recurrenceRate >= 0.45) {
    return {
      posture: 'RELIABILITY UNSTABLE',
      severity: 'CRITICAL',
      summary:
        'Continuity reliability is degrading under repeated unresolved instability.',
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Repeated instability remains unresolved across continuity operations.',
        stabilizationNeed:
          'Recovery credibility is not yet safe to trust.',
        escalationTrigger:
          'Executive continuity intervention may be required.',
      }),
    }
  }

  if (instabilityLoad >= 12 || recurrenceRate >= 0.3) {
    return {
      posture: 'RELIABILITY STRAINING',
      severity: 'HIGH',
      summary:
        'Continuity reliability is under visible strain and recurrence exposure is elevated.',
      executiveAction: compactExecutiveAction({
        severity: 'HIGH',
        primaryConcern:
          'Operational continuity pressure is accumulating.',
        stabilizationNeed:
          'Confirm whether recovery evidence is reducing recurrence, delay, and unresolved load.',
      }),
    }
  }

  if (instabilityLoad >= 5 || recurrenceRate >= 0.15) {
    return {
      posture: 'RELIABILITY HOLDING',
      severity: 'MODERATE',
      summary:
        'Continuity reliability is holding, but durability still requires monitoring.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Operational recovery remains dependent on continued monitoring.',
        stabilizationNeed:
          'Watch for recurrence, delay, or unresolved load before treating reliability as stable.',
      }),
    }
  }

  return {
    posture: 'RELIABILITY STABLE',
    severity: 'LOW',
    summary:
      'Continuity reliability currently shows stable operational posture.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain continuity visibility and operational governance.',
    }),
  }
}