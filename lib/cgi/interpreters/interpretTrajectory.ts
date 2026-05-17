export type TrajectoryPosture =
  | 'TRAJECTORY STABILIZING'
  | 'TRAJECTORY MONITORED'
  | 'TRAJECTORY DETERIORATING'
  | 'TRAJECTORY CRITICAL'

export type TrajectorySeverity =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'

type InterpretTrajectoryInput = {
  trajectoryRisk: number
  continuityDrift: number
  unresolvedMomentum: number
  survivabilityRisk: number
}

type TrajectoryInterpretation = {
  posture: TrajectoryPosture
  severity: TrajectorySeverity
  summary: string
  executiveAction: string
}

export function interpretTrajectory(
  input: InterpretTrajectoryInput
): TrajectoryInterpretation {
  const {
    trajectoryRisk,
    continuityDrift,
    unresolvedMomentum,
    survivabilityRisk,
  } = input

  const combinedRisk =
    (
      trajectoryRisk +
      continuityDrift +
      unresolvedMomentum +
      survivabilityRisk
    ) / 4

  if (
    combinedRisk >= 75 ||
    trajectoryRisk >= 80 ||
    survivabilityRisk >= 80
  ) {
    return {
      posture: 'TRAJECTORY CRITICAL',
      severity: 'CRITICAL',
      summary:
        'Operational trajectory is degrading toward continuity instability and survivability failure.',
      executiveAction:
        'Immediate executive stabilization review recommended. Prevent further continuity deterioration.',
    }
  }

  if (
    combinedRisk >= 60 ||
    trajectoryRisk >= 65 ||
    unresolvedMomentum >= 65
  ) {
    return {
      posture: 'TRAJECTORY DETERIORATING',
      severity: 'HIGH',
      summary:
        'Operational trajectory is weakening under sustained instability pressure.',
      executiveAction:
        'Strengthen stabilization coordination and review unresolved continuity disruption.',
    }
  }

  if (
    combinedRisk >= 40 ||
    continuityDrift >= 45
  ) {
    return {
      posture: 'TRAJECTORY MONITORED',
      severity: 'MODERATE',
      summary:
        'Operational trajectory remains active but requires governed continuity review.',
      executiveAction:
        'Maintain continuity monitoring and preserve trajectory visibility.',
    }
  }

  return {
    posture: 'TRAJECTORY STABILIZING',
    severity: 'LOW',
    summary:
      'Operational trajectory currently supports continuity stabilization.',
    executiveAction:
      'Maintain operational discipline and preserve stabilization consistency.',
  }
}