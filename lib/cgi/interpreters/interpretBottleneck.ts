export type BottleneckPosture =
  | 'BOTTLENECK CONTAINED'
  | 'BOTTLENECK VISIBLE'
  | 'BOTTLENECK ESCALATING'
  | 'BOTTLENECK CRITICAL'

export type BottleneckSeverity =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'

type InterpretBottleneckInput = {
  routingCongestion: number
  responderConcentration: number
  unresolvedMomentum: number
  continuityDrift: number
  propagationRisk: number
}

type BottleneckInterpretation = {
  posture: BottleneckPosture
  severity: BottleneckSeverity
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
      executiveAction:
        'Immediate continuity flow review required. Reduce concentration dependency and restore operational movement.',
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
      executiveAction:
        'Redistribute operational load and monitor continuity congestion escalation.',
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
        'Bottleneck pressure remains visible but currently governed.',
      executiveAction:
        'Continue bottleneck monitoring and preserve continuity visibility.',
    }
  }

  return {
    posture: 'BOTTLENECK CONTAINED',
    severity: 'LOW',
    summary:
      'Operational flow currently appears stable without major bottleneck concentration.',
    executiveAction:
      'Maintain operational distribution discipline and continuity oversight.',
  }
}