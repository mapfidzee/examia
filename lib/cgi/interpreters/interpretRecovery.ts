export type RecoveryPosture =
  | 'RECOVERY CREDIBLE'
  | 'RECOVERY MONITORED'
  | 'RECOVERY FRAGILE'
  | 'RECOVERY NOT CREDIBLE'

export type RecoverySeverity =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'

type InterpretRecoveryInput = {
  stabilizationConfidence: number
  recoveryReliability: number
  survivabilityScore: number
  continuityDrift: number
  unresolvedMomentum: number
}

type RecoveryInterpretation = {
  posture: RecoveryPosture
  severity: RecoverySeverity
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
      executiveAction:
        'Immediate executive recovery review required. Do not treat visible closure as durable stabilization.',
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
      executiveAction:
        'Strengthen recovery follow-through and preserve continuity evidence before closure.',
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
      executiveAction:
        'Continue recovery monitoring and verify stabilization credibility across time.',
    }
  }

  return {
    posture: 'RECOVERY CREDIBLE',
    severity: 'LOW',
    summary:
      'Recovery evidence currently supports credible continuity stabilization.',
    executiveAction:
      'Maintain recovery discipline and preserve stabilization memory.',
  }
}