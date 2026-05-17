export type PressurePosture =
  | 'PRESSURE CONTAINED'
  | 'PRESSURE ELEVATED'
  | 'PRESSURE ESCALATING'
  | 'PRESSURE CRITICAL'

export type PressureSeverity =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'

type InterpretPressureInput = {
  escalationPressure: number
  propagationRisk: number
  unresolvedMomentum: number
  continuityDrift: number
}

type PressureInterpretation = {
  posture: PressurePosture
  severity: PressureSeverity
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
      executiveAction:
        'Immediate executive continuity review recommended. Prevent instability propagation and preserve continuity visibility.',
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
      executiveAction:
        'Strengthen stabilization coordination and monitor unresolved operational pressure.',
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
        'Operational pressure remains active but currently governed.',
      executiveAction:
        'Continue continuity monitoring and preserve escalation visibility.',
    }
  }

  return {
    posture: 'PRESSURE CONTAINED',
    severity: 'LOW',
    summary:
      'Operational pressure currently appears contained within continuity tolerance.',
    executiveAction:
      'Maintain continuity governance and ongoing operational observation.',
  }
}