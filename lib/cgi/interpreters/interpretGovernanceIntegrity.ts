import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type GovernanceIntegrityPosture =
  | 'GOVERNANCE TRACEABILITY STABLE'
  | 'GOVERNANCE REVIEW REQUIRED'
  | 'GOVERNANCE GAP CRITICAL'

type InterpretGovernanceIntegrityInput = {
  activeWithoutRouting: number
  routedWithoutResponder: number
  unresolvedInterventionPathways: number
}

type GovernanceIntegrityInterpretation = {
  posture: GovernanceIntegrityPosture
  severity: CGISeverity
  summary: string
  executiveAction: string
}

export function interpretGovernanceIntegrity(
  input: InterpretGovernanceIntegrityInput
): GovernanceIntegrityInterpretation {
  const governanceGapLoad =
    input.activeWithoutRouting +
    input.routedWithoutResponder +
    input.unresolvedInterventionPathways

  if (governanceGapLoad >= 6) {
    return {
      posture: 'GOVERNANCE GAP CRITICAL',
      severity: 'CRITICAL',
      summary:
        'Traceability gaps may threaten accountability, continuity evidence, and institutional memory.',
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Governance traceability gaps are becoming operationally material.',
        stabilizationNeed:
          'Restore routing, responder, intervention, and outcome evidence integrity.',
        escalationTrigger:
          'Executive governance evidence review is required.',
      }),
    }
  }

  if (governanceGapLoad >= 1) {
    return {
      posture: 'GOVERNANCE REVIEW REQUIRED',
      severity: 'MODERATE',
      summary:
        'Some continuity records require governance review before stability can be trusted.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Some continuity pathways have incomplete governance evidence.',
        stabilizationNeed:
          'Review incomplete routing, responder, intervention, or outcome pathways.',
      }),
    }
  }

  return {
    posture: 'GOVERNANCE TRACEABILITY STABLE',
    severity: 'LOW',
    summary:
      'Routing, intervention, and outcome traceability currently appears stable.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain audit discipline and continuity evidence integrity.',
    }),
  }
}