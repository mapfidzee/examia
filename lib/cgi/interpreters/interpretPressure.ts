import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type PressurePosture =
  | 'PRESSURE CONTAINED'
  | 'PRESSURE ELEVATED'
  | 'PRESSURE ESCALATING'
  | 'PRESSURE CRITICAL'

type InterpretPressureInput = {
  escalationPressure: number
  propagationRisk: number
  unresolvedMomentum: number
  continuityDrift: number
}

type PressureInterpretation = {
  posture: PressurePosture
  severity: CGISeverity
  summary: string
  executiveAction: string
}

export function interpretPressure(
  input: InterpretPressureInput
): PressureInterpretation {
  const {
    escalationPressure,
    propagationRisk,
    unresolvedMomentum,
    continuityDrift,
  } = input

  const combinedPressure =
    (
      escalationPressure +
      propagationRisk +
      unresolvedMomentum +
      continuityDrift
    ) / 4

  if (
    combinedPressure >= 75 ||
    escalationPressure >= 80 ||
    propagationRisk >= 80
  ) {
    return {
      posture: 'PRESSURE CRITICAL',
      severity: 'CRITICAL',
      summary:
        'Operational pressure is propagating across continuity pathways and may undermine stabilization credibility.',
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Pressure propagation is becoming operationally destabilizing.',
        stabilizationNeed:
          'Prevent continuity deterioration before escalation spreads further.',
        escalationTrigger:
          'Executive continuity review is recommended immediately.',
      }),
    }
  }

  if (
    combinedPressure >= 60 ||
    escalationPressure >= 65 ||
    unresolvedMomentum >= 65
  ) {
    return {
      posture: 'PRESSURE ESCALATING',
      severity: 'HIGH',
      summary:
        'Pressure escalation is becoming operationally visible across continuity operations.',
      executiveAction: compactExecutiveAction({
        severity: 'HIGH',
        primaryConcern:
          'Operational pressure accumulation is intensifying.',
        stabilizationNeed:
          'Confirm whether stabilization coordination is reducing escalation exposure.',
      }),
    }
  }

  if (
    combinedPressure >= 40 ||
    continuityDrift >= 45
  ) {
    return {
      posture: 'PRESSURE ELEVATED',
      severity: 'MODERATE',
      summary:
        'Operational pressure remains visible and requires continued continuity monitoring.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Pressure remains operationally active.',
        stabilizationNeed:
          'Preserve escalation visibility and monitor continuity drift.',
      }),
    }
  }

  return {
    posture: 'PRESSURE CONTAINED',
    severity: 'LOW',
    summary:
      'Operational pressure currently appears contained within continuity tolerance.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain continuity governance and operational visibility.',
    }),
  }
}