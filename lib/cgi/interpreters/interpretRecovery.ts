import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type RecoveryPosture =
  | 'RECOVERY CREDIBLE'
  | 'RECOVERY MONITORED'
  | 'RECOVERY FRAGILE'
  | 'RECOVERY NOT CREDIBLE'

type InterpretRecoveryInput = {
  stabilizationConfidence: number
  recoveryReliability: number
  survivabilityScore: number
  continuityDrift: number
  unresolvedMomentum: number
}

type RecoveryInterpretation = {
  posture: RecoveryPosture
  severity: CGISeverity
  summary: string
  executiveAction: string
}

export function interpretRecovery(
  input: InterpretRecoveryInput
): RecoveryInterpretation {
  const {
    stabilizationConfidence,
    recoveryReliability,
    survivabilityScore,
    continuityDrift,
    unresolvedMomentum,
  } = input

  const recoveryStrength =
    (
      stabilizationConfidence +
      recoveryReliability +
      survivabilityScore
    ) / 3

  const recoveryDrag =
    (
      continuityDrift +
      unresolvedMomentum +
      (100 - recoveryStrength)
    ) / 3

  if (
    recoveryStrength < 40 ||
    recoveryDrag >= 75 ||
    unresolvedMomentum >= 80
  ) {
    return {
      posture: 'RECOVERY NOT CREDIBLE',
      severity: 'CRITICAL',
      summary:
        'Recovery evidence is not strong enough to support stabilization credibility.',
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Recovery evidence is not strong enough to support stabilization credibility.',
        stabilizationNeed:
          'Do not treat visible closure as durable stabilization.',
        escalationTrigger:
          'Immediate executive recovery review is required.',
      }),
    }
  }

  if (
    recoveryStrength < 55 ||
    recoveryDrag >= 60 ||
    continuityDrift >= 65
  ) {
    return {
      posture: 'RECOVERY FRAGILE',
      severity: 'HIGH',
      summary:
        'Recovery remains fragile and may weaken under unresolved continuity pressure.',
      executiveAction: compactExecutiveAction({
        severity: 'HIGH',
        primaryConcern:
          'Recovery remains fragile under unresolved continuity pressure.',
        stabilizationNeed:
          'Strengthen recovery follow-through and preserve continuity evidence before closure.',
      }),
    }
  }

  if (
    recoveryStrength < 75 ||
    recoveryDrag >= 40
  ) {
    return {
      posture: 'RECOVERY MONITORED',
      severity: 'MODERATE',
      summary:
        'Recovery is visible but still requires governed durability confirmation.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Recovery is visible but durability is not yet fully proven.',
        stabilizationNeed:
          'Verify stabilization credibility across time before treating recovery as durable.',
      }),
    }
  }

  return {
    posture: 'RECOVERY CREDIBLE',
    severity: 'LOW',
    summary:
      'Recovery evidence currently supports credible continuity stabilization.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain recovery discipline and preserve stabilization memory.',
    }),
  }
}