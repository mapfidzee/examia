import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type BottleneckPosture =
  | 'BOTTLENECK CONTAINED'
  | 'BOTTLENECK VISIBLE'
  | 'BOTTLENECK ESCALATING'
  | 'BOTTLENECK CRITICAL'

type InterpretBottleneckInput = {
  routingCongestion: number
  responderConcentration: number
  unresolvedMomentum: number
  continuityDrift: number
  propagationRisk: number
}

type BottleneckInterpretation = {
  posture: BottleneckPosture
  severity: CGISeverity
  summary: string
  executiveAction: string
}

export function interpretBottleneck(
  input: InterpretBottleneckInput
): BottleneckInterpretation {
  const {
    routingCongestion,
    responderConcentration,
    unresolvedMomentum,
    continuityDrift,
    propagationRisk,
  } = input

  const bottleneckPressure =
    (
      routingCongestion +
      responderConcentration +
      unresolvedMomentum +
      continuityDrift +
      propagationRisk
    ) / 5

  if (
    bottleneckPressure >= 75 ||
    routingCongestion >= 80 ||
    responderConcentration >= 80
  ) {
    return {
      posture: 'BOTTLENECK CRITICAL',
      severity: 'CRITICAL',
      summary:
        'Operational bottlenecks are severely restricting continuity flow and stabilization responsiveness.',
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Bottleneck pressure is severely restricting continuity flow.',
        stabilizationNeed:
          'Reduce concentration dependency and restore operational movement.',
        escalationTrigger:
          'Immediate continuity flow review is required.',
      }),
    }
  }

  if (
    bottleneckPressure >= 60 ||
    unresolvedMomentum >= 65 ||
    propagationRisk >= 65
  ) {
    return {
      posture: 'BOTTLENECK ESCALATING',
      severity: 'HIGH',
      summary:
        'Operational bottlenecks are increasing continuity strain across workflow pathways.',
      executiveAction: compactExecutiveAction({
        severity: 'HIGH',
        primaryConcern:
          'Bottleneck pressure is increasing continuity strain.',
        stabilizationNeed:
          'Redistribute operational load and monitor congestion escalation.',
      }),
    }
  }

  if (
    bottleneckPressure >= 40 ||
    continuityDrift >= 45
  ) {
    return {
      posture: 'BOTTLENECK VISIBLE',
      severity: 'MODERATE',
      summary:
        'Bottleneck pressure remains visible and requires continued continuity review.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Bottleneck pressure remains operationally visible.',
        stabilizationNeed:
          'Continue bottleneck monitoring and preserve continuity visibility.',
      }),
    }
  }

  return {
    posture: 'BOTTLENECK CONTAINED',
    severity: 'LOW',
    summary:
      'Operational flow currently appears stable without major bottleneck concentration.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain operational distribution discipline and continuity oversight.',
    }),
  }
}