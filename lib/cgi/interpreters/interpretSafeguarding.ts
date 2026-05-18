import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type SafeguardingPosture =
  | 'NO ACTIVE SAFEGUARDING FLAG'
  | 'SAFEGUARDING VISIBILITY ACTIVE'
  | 'SAFEGUARDING PRESSURE ELEVATED'
  | 'SAFEGUARDING ESCALATION CRITICAL'

type InterpretSafeguardingInput = {
  safeguardingFlags: number
}

type SafeguardingInterpretation = {
  posture: SafeguardingPosture
  severity: CGISeverity
  summary: string
  executiveAction: string
}

export function interpretSafeguarding(
  input: InterpretSafeguardingInput
): SafeguardingInterpretation {
  if (input.safeguardingFlags >= 3) {
    return {
      posture: 'SAFEGUARDING ESCALATION CRITICAL',
      severity: 'CRITICAL',
      summary:
        'Safeguarding escalation is materially visible and requires protected executive continuity oversight.',
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Safeguarding escalation is materially visible.',
        stabilizationNeed:
          'Protect continuity oversight while preserving safeguarding sensitivity.',
        escalationTrigger:
          'Immediate safeguarding governance review is required.',
      }),
    }
  }

  if (input.safeguardingFlags >= 2) {
    return {
      posture: 'SAFEGUARDING PRESSURE ELEVATED',
      severity: 'HIGH',
      summary:
        'Safeguarding pressure is elevated and may affect continuity prioritization.',
      executiveAction: compactExecutiveAction({
        severity: 'HIGH',
        primaryConcern:
          'Safeguarding pressure is elevated.',
        stabilizationNeed:
          'Prioritize protected continuity review without exposing sensitive details.',
      }),
    }
  }

  if (input.safeguardingFlags >= 1) {
    return {
      posture: 'SAFEGUARDING VISIBILITY ACTIVE',
      severity: 'MODERATE',
      summary:
        'Safeguarding visibility is active and must remain protected.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Safeguarding visibility is active.',
        stabilizationNeed:
          'Maintain protected executive safeguarding visibility.',
      }),
    }
  }

  return {
    posture: 'NO ACTIVE SAFEGUARDING FLAG',
    severity: 'LOW',
    summary:
      'No active safeguarding flag is visible in the current command view.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain safeguarding monitoring and protected visibility.',
    }),
  }
}