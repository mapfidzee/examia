import type { CGIDerivationOutput } from './cgiDerivationEngine'
import type {
  CGINextContinuityDestination,
  CGITransitionDecision,
} from './cgiContinuityStateEngine'

export type CGICommandUrgency =
  | 'ROUTINE'
  | 'NEAR_TERM'
  | 'URGENT'
  | 'IMMEDIATE'

export type CGICommandOutput = {
  dominantTruth: string
  primaryDriver: string
  executivePosture: string
  requiredAction: string
  accountableOwner: string
  actionDeadline: string
  requiredEvidence: string
  consequenceIfUnresolved: string
  continuityRisk: string
  nextDestination: CGINextContinuityDestination
  coordinationRequired: boolean
  crossSiteRequired: boolean
  executiveReviewRequired: boolean
  auditRequired: boolean
  handoffReason: string
  commandNarrative: string
}

export type CGICommandInput = {
  derivation: CGIDerivationOutput
  stateDecision: CGITransitionDecision
  ownerRole?: string
}

function normalizeUrgency(timePressure: string): CGICommandUrgency {
  if (timePressure === 'Immediate') return 'IMMEDIATE'
  if (timePressure === 'Urgent') return 'URGENT'
  if (timePressure === 'Near-term') return 'NEAR_TERM'
  return 'ROUTINE'
}

function deriveOwnerRole(input: CGICommandInput): string {
  if (input.ownerRole && input.ownerRole.trim().length > 0) {
    return input.ownerRole
  }

  if (input.stateDecision.crossSiteRequired) {
    return 'Cross-Site Continuity Lead'
  }

  if (input.stateDecision.coordinationRequired) {
    return 'Coordination Lead'
  }

  if (input.stateDecision.executiveReviewRequired) {
    return 'Executive Lead'
  }

  if (
    input.derivation.executivePosture === 'EXECUTIVE_INTERVENTION' ||
    input.derivation.continuityCondition === 'SURVIVABILITY_THREAT'
  ) {
    return 'Executive Lead'
  }

  if (
    input.derivation.executivePosture === 'COMMAND' ||
    input.derivation.continuityCondition === 'ESCALATED_INSTABILITY'
  ) {
    return 'Command Owner'
  }

  if (
    input.derivation.executivePosture === 'COORDINATE' ||
    input.derivation.continuityCondition === 'ACTIVE_INSTABILITY'
  ) {
    return 'Coordination Lead'
  }

  if (
    input.derivation.executivePosture === 'VERIFY' ||
    input.derivation.continuityCondition === 'FRAGILE_RECOVERY'
  ) {
    return 'Recovery Verification Owner'
  }

  if (
    input.derivation.executivePosture === 'REINFORCE' ||
    input.derivation.continuityCondition === 'RECURRENCE_RISK'
  ) {
    return 'Stabilization Reinforcement Owner'
  }

  return 'Monitoring Owner'
}

function deriveDeadline(urgency: CGICommandUrgency): string {
  if (urgency === 'IMMEDIATE') {
    return 'Act now and record stabilization evidence before the next command review.'
  }

  if (urgency === 'URGENT') {
    return 'Assign ownership and document action within 24 hours.'
  }

  if (urgency === 'NEAR_TERM') {
    return 'Review the condition and document response within 72 hours.'
  }

  return 'Continue monitoring through the next review cycle.'
}

function deriveContinuityRisk(input: CGICommandInput): string {
  const condition = input.derivation.continuityCondition
  const confidence = input.derivation.continuityConfidence
  const pressure = input.derivation.survivabilityPressure

  if (input.stateDecision.crossSiteRequired) {
    return 'Continuity risk may no longer be contained within one site or operational lane.'
  }

  if (condition === 'SURVIVABILITY_THREAT') {
    return 'Institutional survivability may weaken if leadership does not intervene.'
  }

  if (condition === 'RECURRENCE_RISK') {
    return 'Repeated instability may become normalized as structural weakness.'
  }

  if (condition === 'FRAGILE_RECOVERY') {
    return 'Visible recovery may collapse if durability is not verified.'
  }

  if (condition === 'ESCALATED_INSTABILITY') {
    return 'Escalated instability may spread or intensify without command control.'
  }

  if (condition === 'ACTIVE_INSTABILITY') {
    return 'Active instability may escalate if coordination remains weak.'
  }

  if (condition === 'EARLY_STRAIN') {
    return 'Early strain may mature into visible disruption if left unattended.'
  }

  if (confidence === 'HIGH' && pressure === 'LOW') {
    return 'Current continuity risk is low.'
  }

  return 'Stabilization reliability may weaken if monitoring is not maintained.'
}

function deriveConsequenceIfUnresolved(input: CGICommandInput): string {
  const condition = input.derivation.continuityCondition

  if (input.stateDecision.crossSiteRequired) {
    return 'Failure to act may allow instability patterns to spread across sites, weaken coordination credibility, and obscure executive accountability.'
  }

  if (condition === 'SURVIVABILITY_THREAT') {
    return 'Failure to act may compromise institutional continuity, executive credibility, and stabilization capacity.'
  }

  if (condition === 'RECURRENCE_RISK') {
    return 'Failure to act may allow repeated instability to harden into a structural pattern.'
  }

  if (condition === 'FRAGILE_RECOVERY') {
    return 'Failure to verify may create false confidence and allow reburn after apparent recovery.'
  }

  if (condition === 'ESCALATED_INSTABILITY') {
    return 'Failure to act may increase escalation load, unresolved duration, and command pressure.'
  }

  if (condition === 'ACTIVE_INSTABILITY') {
    return 'Failure to coordinate may allow active instability to escalate.'
  }

  if (condition === 'EARLY_STRAIN') {
    return 'Failure to prepare may allow early strain to mature into visible disruption.'
  }

  return 'Failure to monitor may reduce early warning visibility.'
}

function buildCommandNarrative(input: {
  dominantTruth: string
  primaryDriver: string
  owner: string
  action: string
  deadline: string
  evidence: string
  consequence: string
  nextDestination: CGINextContinuityDestination
  handoffReason: string
}): string {
  return [
    input.dominantTruth,
    input.primaryDriver,
    `${input.owner} is responsible for ensuring the required action is completed.`,
    `Required action: ${input.action}`,
    `Timing expectation: ${input.deadline}`,
    `Evidence standard: ${input.evidence}`,
    `Continuity handoff: ${input.nextDestination}.`,
    `Handoff reason: ${input.handoffReason}`,
    `Consequence if unresolved: ${input.consequence}`,
  ].join(' ')
}

export function buildCGIExecutiveCommand(
  input: CGICommandInput
): CGICommandOutput {
  const urgency = normalizeUrgency(input.derivation.timePressure)
  const accountableOwner = deriveOwnerRole(input)
  const actionDeadline = deriveDeadline(urgency)
  const continuityRisk = deriveContinuityRisk(input)
  const consequenceIfUnresolved = deriveConsequenceIfUnresolved(input)

  const commandNarrative = buildCommandNarrative({
    dominantTruth: input.derivation.dominantOperationalTruth,
    primaryDriver: input.derivation.primaryDriver,
    owner: accountableOwner,
    action: input.derivation.requiredAction,
    deadline: actionDeadline,
    evidence: input.stateDecision.requiredEvidence,
    consequence: consequenceIfUnresolved,
    nextDestination: input.stateDecision.nextDestination,
    handoffReason: input.stateDecision.handoffReason,
  })

  return {
    dominantTruth: input.derivation.dominantOperationalTruth,
    primaryDriver: input.derivation.primaryDriver,
    executivePosture: input.derivation.executivePosture,
    requiredAction: input.derivation.requiredAction,
    accountableOwner,
    actionDeadline,
    requiredEvidence: input.stateDecision.requiredEvidence,
    consequenceIfUnresolved,
    continuityRisk,
    nextDestination: input.stateDecision.nextDestination,
    coordinationRequired: input.stateDecision.coordinationRequired,
    crossSiteRequired: input.stateDecision.crossSiteRequired,
    executiveReviewRequired: input.stateDecision.executiveReviewRequired,
    auditRequired: input.stateDecision.auditRequired,
    handoffReason: input.stateDecision.handoffReason,
    commandNarrative,
  }
}