import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type RegionalPressurePosture =
  | 'REGIONAL PRESSURE CONTAINED'
  | 'REGIONAL PRESSURE VISIBLE'
  | 'REGIONAL PRESSURE HEAVY'
  | 'REGIONAL PRESSURE CRITICAL'

type InterpretRegionalPressureInput = {
  regionalCaseLoad: number
}

type RegionalPressureInterpretation = {
  posture: RegionalPressurePosture
  severity: CGISeverity
  summary: string
  executiveAction: string
}

export function interpretRegionalPressure(
  input: InterpretRegionalPressureInput
): RegionalPressureInterpretation {
  if (input.regionalCaseLoad >= 8) {
    return {
      posture: 'REGIONAL PRESSURE CRITICAL',
      severity: 'CRITICAL',
      summary:
        'Regional pressure concentration may threaten continuity capacity and response predictability.',
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Regional pressure concentration is becoming critical.',
        stabilizationNeed:
          'Redistribute regional continuity load and review coordination capacity.',
        escalationTrigger:
          'Executive regional continuity review is required.',
      }),
    }
  }

  if (input.regionalCaseLoad >= 5) {
    return {
      posture: 'REGIONAL PRESSURE HEAVY',
      severity: 'HIGH',
      summary:
        'Regional pressure concentration is heavy and may weaken continuity responsiveness.',
      executiveAction: compactExecutiveAction({
        severity: 'HIGH',
        primaryConcern:
          'Regional pressure concentration is heavy.',
        stabilizationNeed:
          'Review regional load and continuity coordination balance.',
      }),
    }
  }

  if (input.regionalCaseLoad >= 2) {
    return {
      posture: 'REGIONAL PRESSURE VISIBLE',
      severity: 'MODERATE',
      summary:
        'Regional pressure concentration is visible and should remain under review.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Regional pressure remains visible.',
        stabilizationNeed:
          'Keep regional continuity load under review.',
      }),
    }
  }

  return {
    posture: 'REGIONAL PRESSURE CONTAINED',
    severity: 'LOW',
    summary:
      'Regional pressure currently appears contained.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain regional continuity monitoring.',
    }),
  }
}