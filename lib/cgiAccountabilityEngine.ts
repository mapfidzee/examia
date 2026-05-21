import type { CGIDerivationOutput } from './cgiDerivationEngine'
import type { CGITransitionDecision } from './cgiContinuityStateEngine'
import type { CGICommandOutput } from './cgiExecutiveCommandEngine'
import type { CGIStructuralMemoryOutput } from './cgiStructuralMemoryEngine'

export type CGIAccountabilityStatus =
  | 'NOT_ASSIGNED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'EVIDENCE_DUE'
  | 'OVERDUE'
  | 'ESCALATION_REQUIRED'
  | 'VERIFIED_CLOSED'

export type CGIAccountabilityRisk =
  | 'LOW'
  | 'WATCH'
  | 'ELEVATED'
  | 'HIGH'
  | 'CRITICAL'

export type CGIAccountabilityInput = {
  derivation: CGIDerivationOutput
  stateDecision: CGITransitionDecision
  command: CGICommandOutput
  memory: CGIStructuralMemoryOutput
  ownerAssigned: boolean
  actionStarted: boolean
  evidenceSubmitted: boolean
  evidenceVerified: boolean
  unresolvedDurationDays: number
  deadlineMissed: boolean
}

export type CGIAccountabilityOutput = {
  accountabilityStatus: CGIAccountabilityStatus
  accountabilityRisk: CGIAccountabilityRisk
  ownerRequired: string
  actionRequired: string
  evidenceRequired: string
  verificationStandard: string
  unresolvedDurationWarning: string
  escalationRule: string
  accountabilityNarrative: string
}

function deriveAccountabilityStatus(
  input: CGIAccountabilityInput
): CGIAccountabilityStatus {
  if (input.evidenceVerified) {
    return 'VERIFIED_CLOSED'
  }

  if (
    input.deadlineMissed &&
    (input.derivation.continuityCondition === 'SURVIVABILITY_THREAT' ||
      input.derivation.continuityCondition === 'ESCALATED_INSTABILITY' ||
      input.memory.memoryRiskLevel === 'SEVERE')
  ) {
    return 'ESCALATION_REQUIRED'
  }

  if (input.deadlineMissed) {
    return 'OVERDUE'
  }

  if (input.evidenceSubmitted && !input.evidenceVerified) {
    return 'EVIDENCE_DUE'
  }

  if (input.actionStarted) {
    return 'IN_PROGRESS'
  }

  if (input.ownerAssigned) {
    return 'ASSIGNED'
  }

  return 'NOT_ASSIGNED'
}

function deriveAccountabilityRisk(
  input: CGIAccountabilityInput,
  status: CGIAccountabilityStatus
): CGIAccountabilityRisk {
  if (
    status === 'ESCALATION_REQUIRED' ||
    input.derivation.continuityCondition === 'SURVIVABILITY_THREAT'
  ) {
    return 'CRITICAL'
  }

  if (
    status === 'OVERDUE' ||
    input.memory.memoryRiskLevel === 'SEVERE' ||
    input.derivation.continuityConfidence === 'CRITICAL'
  ) {
    return 'HIGH'
  }

  if (
    input.derivation.continuityCondition === 'ESCALATED_INSTABILITY' ||
    input.memory.memoryRiskLevel === 'HIGH' ||
    input.unresolvedDurationDays >= 14
  ) {
    return 'ELEVATED'
  }

  if (
    input.derivation.continuityCondition === 'EARLY_STRAIN' ||
    input.derivation.continuityCondition === 'ACTIVE_INSTABILITY' ||
    input.unresolvedDurationDays > 0
  ) {
    return 'WATCH'
  }

  return 'LOW'
}

function deriveOwnerRequired(input: CGIAccountabilityInput): string {
  if (input.command.accountableOwner) {
    return input.command.accountableOwner
  }

  if (input.derivation.continuityCondition === 'SURVIVABILITY_THREAT') {
    return 'Executive Lead'
  }

  if (input.derivation.continuityCondition === 'ESCALATED_INSTABILITY') {
    return 'Command Owner'
  }

  if (input.derivation.continuityCondition === 'FRAGILE_RECOVERY') {
    return 'Recovery Verification Owner'
  }

  return 'Continuity Monitoring Owner'
}

function buildVerificationStandard(input: CGIAccountabilityInput): string {
  if (input.derivation.continuityCondition === 'SURVIVABILITY_THREAT') {
    return 'Verified closure requires executive review, active mitigation evidence, reduced pressure, and no unresolved critical continuity threat.'
  }

  if (input.derivation.continuityCondition === 'RECURRENCE_RISK') {
    return 'Verified closure requires recurrence explanation, structural driver review, reinforced controls, and evidence that the pattern has stopped.'
  }

  if (input.derivation.continuityCondition === 'FRAGILE_RECOVERY') {
    return 'Verified closure requires proof that recovery held without reburn, relapse, or unresolved pressure.'
  }

  if (input.derivation.continuityCondition === 'ESCALATED_INSTABILITY') {
    return 'Verified closure requires owner action, deadline completion, reduced escalation pressure, and command review evidence.'
  }

  return 'Verified closure requires documented action and evidence that continuity credibility has not weakened.'
}

function buildUnresolvedDurationWarning(
  unresolvedDurationDays: number
): string {
  if (unresolvedDurationDays >= 30) {
    return 'Instability has remained unresolved for 30 or more days. This now represents serious continuity exposure.'
  }

  if (unresolvedDurationDays >= 14) {
    return 'Instability has remained unresolved for 14 or more days. Pressure accumulation should be reviewed.'
  }

  if (unresolvedDurationDays >= 7) {
    return 'Instability has remained unresolved for 7 or more days. Escalation discipline is required.'
  }

  if (unresolvedDurationDays > 0) {
    return 'Instability is still within the active review window.'
  }

  return 'No unresolved duration warning is currently active.'
}

function buildEscalationRule(
  input: CGIAccountabilityInput,
  status: CGIAccountabilityStatus
): string {
  if (status === 'ESCALATION_REQUIRED') {
    return 'Escalate to executive review because accountability has failed while continuity risk remains serious.'
  }

  if (status === 'OVERDUE') {
    return 'Escalate if ownership, action, or evidence is not restored before the next review cycle.'
  }

  if (!input.ownerAssigned) {
    return 'Escalate if no owner is assigned for a condition requiring action.'
  }

  if (!input.evidenceSubmitted && input.actionStarted) {
    return 'Escalate if action continues without evidence of stabilization.'
  }

  return 'Maintain current accountability pathway unless risk, delay, or recurrence increases.'
}

function buildAccountabilityNarrative(input: {
  status: CGIAccountabilityStatus
  risk: CGIAccountabilityRisk
  owner: string
  action: string
  evidence: string
  warning: string
  escalation: string
}): string {
  return `Accountability status is ${input.status}. Accountability risk is ${input.risk}. Responsible owner: ${input.owner}. Required action: ${input.action}. Required evidence: ${input.evidence}. ${input.warning} ${input.escalation}`
}

export function evaluateCGIAccountability(
  input: CGIAccountabilityInput
): CGIAccountabilityOutput {
  const accountabilityStatus = deriveAccountabilityStatus(input)
  const accountabilityRisk = deriveAccountabilityRisk(
    input,
    accountabilityStatus
  )
  const ownerRequired = deriveOwnerRequired(input)
  const actionRequired = input.command.requiredAction
  const evidenceRequired = input.command.requiredEvidence
  const verificationStandard = buildVerificationStandard(input)
  const unresolvedDurationWarning = buildUnresolvedDurationWarning(
    input.unresolvedDurationDays
  )
  const escalationRule = buildEscalationRule(input, accountabilityStatus)

  return {
    accountabilityStatus,
    accountabilityRisk,
    ownerRequired,
    actionRequired,
    evidenceRequired,
    verificationStandard,
    unresolvedDurationWarning,
    escalationRule,
    accountabilityNarrative: buildAccountabilityNarrative({
      status: accountabilityStatus,
      risk: accountabilityRisk,
      owner: ownerRequired,
      action: actionRequired,
      evidence: evidenceRequired,
      warning: unresolvedDurationWarning,
      escalation: escalationRule,
    }),
  }
}