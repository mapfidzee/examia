import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type TrajectoryPosture =
  | 'TRAJECTORY STABILIZING'
  | 'TRAJECTORY MONITORED'
  | 'TRAJECTORY DETERIORATING'
  | 'TRAJECTORY CRITICAL'

type InterpretTrajectoryInput = {
  trajectoryRisk: number
  continuityDrift: number
  unresolvedMomentum: number
  survivabilityRisk: number
}

type TrajectoryInterpretation = {
  posture: TrajectoryPosture
  severity: CGISeverity
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
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Continuity trajectory is deteriorating toward survivability instability.',
        stabilizationNeed:
          'Prevent further operational deterioration before stabilization credibility collapses.',
        escalationTrigger:
          'Immediate executive stabilization review is recommended.',
      }),
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
      executiveAction: compactExecutiveAction({
        severity: 'HIGH',
        primaryConcern:
          'Trajectory deterioration remains operationally visible.',
        stabilizationNeed:
          'Review unresolved continuity disruption and confirm whether stabilization efforts are reducing deterioration momentum.',
      }),
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
        'Operational trajectory remains active and requires governed continuity review.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Trajectory movement remains operationally visible.',
        stabilizationNeed:
          'Maintain continuity monitoring and preserve trajectory visibility.',
      }),
    }
  }

  return {
    posture: 'TRAJECTORY STABILIZING',
    severity: 'LOW',
    summary:
      'Operational trajectory currently remains directionally stable within continuity tolerance.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain operational discipline and continuity visibility.',
    }),
  }
}