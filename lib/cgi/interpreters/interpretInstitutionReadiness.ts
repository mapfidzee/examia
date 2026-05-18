import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type InstitutionReadinessPosture =
  | 'INSTITUTION READINESS ACTIVE'
  | 'INSTITUTION READINESS LIMITED'
  | 'INSTITUTION READINESS WEAK'
  | 'INSTITUTION READINESS NOT VISIBLE'

type InterpretInstitutionReadinessInput = {
  activeInstitutions: number
  totalInstitutions: number
}

type InstitutionReadinessInterpretation = {
  posture: InstitutionReadinessPosture
  severity: CGISeverity
  summary: string
  executiveAction: string
}

export function interpretInstitutionReadiness(
  input: InterpretInstitutionReadinessInput
): InstitutionReadinessInterpretation {
  const readinessRate =
    input.totalInstitutions === 0
      ? 0
      : input.activeInstitutions / input.totalInstitutions

  if (input.totalInstitutions === 0 || input.activeInstitutions === 0) {
    return {
      posture: 'INSTITUTION READINESS NOT VISIBLE',
      severity: 'CRITICAL',
      summary:
        'No active institutional readiness is visible in the current continuity command view.',
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Institutional readiness is not visible.',
        stabilizationNeed:
          'Activate institutional coordination visibility before continuity load expands.',
        escalationTrigger:
          'Executive institutional readiness review is required.',
      }),
    }
  }

  if (readinessRate < 0.35) {
    return {
      posture: 'INSTITUTION READINESS WEAK',
      severity: 'HIGH',
      summary:
        'Institution readiness is weak and may limit continuity coordination capacity.',
      executiveAction: compactExecutiveAction({
        severity: 'HIGH',
        primaryConcern:
          'Institutional coordination readiness is weak.',
        stabilizationNeed:
          'Strengthen institution activation and continuity coordination coverage.',
      }),
    }
  }

  if (readinessRate < 0.75) {
    return {
      posture: 'INSTITUTION READINESS LIMITED',
      severity: 'MODERATE',
      summary:
        'Institution readiness exists but remains limited across the operating view.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Institution readiness exists but remains limited.',
        stabilizationNeed:
          'Continue building institutional coordination coverage.',
      }),
    }
  }

  return {
    posture: 'INSTITUTION READINESS ACTIVE',
    severity: 'LOW',
    summary:
      'Institution coordination readiness is active across the current operating view.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain institutional coordination and continuity readiness visibility.',
    }),
  }
}