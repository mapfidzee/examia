import { buildContinuityDerivationStandard } from './cgiContinuityDerivationStandard'
import { buildContinuityTrustAssessment } from './cgiContinuityTrustEngine'
import type {
  ContinuityTrustAssessment,
  ContinuityTrustInput,
} from './cgiContinuityTrustEngine'
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
  trustAssessment: ContinuityTrustAssessment
  continuityStandard: {
    whatIsVisible: string
    whyItMatters: string
    continuityRisk: string
    requiredMovement: string
    trustLevel: string
    institutionalMeaning: string
  }
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

function buildCommandTrustInput(input: CGICommandInput): ContinuityTrustInput {
  const condition = input.derivation.continuityCondition
  const confidence = input.derivation.continuityConfidence
  const pressure = input.derivation.survivabilityPressure

  const isSevere =
    condition === 'SURVIVABILITY_THREAT' ||
    condition === 'ESCALATED_INSTABILITY'

  const isActive =
    condition === 'ACTIVE_INSTABILITY' ||
    condition === 'EARLY_STRAIN' ||
    condition === 'RECURRENCE_RISK'

  const isFragileRecovery = condition === 'FRAGILE_RECOVERY'

  const hasCommandPressure =
    input.stateDecision.executiveReviewRequired ||
    input.derivation.executivePosture === 'COMMAND' ||
    input.derivation.executivePosture === 'EXECUTIVE_INTERVENTION' ||
    isSevere

    const hasEvidenceGap =
    input.stateDecision.auditRequired ||
    input.stateDecision.requiredEvidence.trim().length > 0 ||
    confidence !== 'HIGH'

  return {
    activeInstability: isSevere || isActive || isFragileRecovery ? 1 : 0,
    recoveryRecords: isFragileRecovery || confidence === 'HIGH' ? 1 : 0,
    fragileRecovery: isFragileRecovery ? 1 : 0,
    commandPressure: hasCommandPressure ? 1 : 0,
    evidenceReturn: hasEvidenceGap ? 1 : 0,
    absorbable:
      condition === 'STABLE' ||
      (confidence === 'HIGH' &&
        pressure === 'LOW' &&
        !input.stateDecision.executiveReviewRequired &&
        !input.stateDecision.auditRequired)
        ? 1
        : 0,
    historicalMemory: input.stateDecision.auditRequired ? 1 : 0,
    recurrenceVisible: condition === 'RECURRENCE_RISK' ? 1 : 0,
    coordinationPressure: input.stateDecision.coordinationRequired ? 1 : 0,
    crossSitePressure: input.stateDecision.crossSiteRequired ? 2 : 0,
    auditPressure: input.stateDecision.auditRequired ? 1 : 0,
    safeguardingVisible: condition === 'SURVIVABILITY_THREAT' ? 1 : 0,
    posture: input.derivation.executivePosture,
  }
}

function deriveVisibleSignal(input: CGICommandInput) {
  if (input.stateDecision.crossSiteRequired) {
    return 'Cross-site command continuity exposure'
  }

  if (input.derivation.continuityCondition === 'SURVIVABILITY_THREAT') {
    return 'Survivability threat requiring command visibility'
  }

  if (input.derivation.continuityCondition === 'ESCALATED_INSTABILITY') {
    return 'Escalated instability requiring command control'
  }

  if (input.derivation.continuityCondition === 'RECURRENCE_RISK') {
    return 'Recurring instability requiring reinforcement'
  }

  if (input.derivation.continuityCondition === 'FRAGILE_RECOVERY') {
    return 'Fragile recovery requiring verification'
  }

  if (input.derivation.continuityCondition === 'ACTIVE_INSTABILITY') {
    return 'Active instability requiring coordination'
  }

  if (input.derivation.continuityCondition === 'EARLY_STRAIN') {
    return 'Early strain requiring visibility'
  }

  return input.derivation.dominantOperationalTruth
}

function deriveConsequenceIfUnresolved({
  input,
  trustAssessment,
}: {
  input: CGICommandInput
  trustAssessment: ContinuityTrustAssessment
}) {
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

  return trustAssessment.boardLevelWarning
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
  trustReading: string
  trustLevel: string
  institutionalMeaning: string
}) {
  return [
    input.dominantTruth,
    input.primaryDriver,
    `Trust reading: ${input.trustReading}.`,
    `Trust level: ${input.trustLevel}.`,
    `Institutional meaning: ${input.institutionalMeaning}`,
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
  input: CGICommandInput,
): CGICommandOutput {
  const urgency = normalizeUrgency(input.derivation.timePressure)
  const accountableOwner = deriveOwnerRole(input)
  const actionDeadline = deriveDeadline(urgency)

  const trustInput = buildCommandTrustInput(input)
  const trustAssessment = buildContinuityTrustAssessment(trustInput)

  const derivation = buildContinuityDerivationStandard({
    ...trustInput,
    visibleSignal: deriveVisibleSignal(input),
    stage: 'Executive Command',
    posture: input.derivation.executivePosture,
    currentMeaning: trustAssessment.institutionalMeaning,
    nextMovement: input.stateDecision.handoffReason,
  })

  const continuityStandard = {
    whatIsVisible: derivation.whatIsVisible,
    whyItMatters: derivation.whyItMatters,
    continuityRisk: derivation.continuityRisk,
    requiredMovement: derivation.requiredMovement,
    trustLevel: derivation.trustLevel,
    institutionalMeaning: derivation.institutionalMeaning,
  }

  const requiredAction =
    trustAssessment.trustLevel === 'HIGH' ||
    trustAssessment.trustLevel === 'NOT_APPLICABLE'
      ? input.derivation.requiredAction
      : trustAssessment.executiveDecision

  const requiredEvidence =
    trustAssessment.trustLevel === 'HIGH'
      ? input.stateDecision.requiredEvidence
      : [
          input.stateDecision.requiredEvidence,
          trustAssessment.trustMeaning,
        ]
          .filter(Boolean)
          .join(' ')

  const consequenceIfUnresolved = deriveConsequenceIfUnresolved({
    input,
    trustAssessment,
  })

  const commandNarrative = buildCommandNarrative({
    dominantTruth: input.derivation.dominantOperationalTruth,
    primaryDriver: input.derivation.primaryDriver,
    owner: accountableOwner,
    action: requiredAction,
    deadline: actionDeadline,
    evidence: requiredEvidence,
    consequence: consequenceIfUnresolved,
    nextDestination: input.stateDecision.nextDestination,
    handoffReason: input.stateDecision.handoffReason,
    trustReading: trustAssessment.trustReading,
    trustLevel: trustAssessment.trustLevel,
    institutionalMeaning: trustAssessment.institutionalMeaning,
  })

  return {
    dominantTruth: input.derivation.dominantOperationalTruth,
    primaryDriver: input.derivation.primaryDriver,
    executivePosture: input.derivation.executivePosture,
    requiredAction,
    accountableOwner,
    actionDeadline,
    requiredEvidence,
    consequenceIfUnresolved,
    continuityRisk: continuityStandard.continuityRisk,
    nextDestination: input.stateDecision.nextDestination,
    coordinationRequired: input.stateDecision.coordinationRequired,
    crossSiteRequired: input.stateDecision.crossSiteRequired,
    executiveReviewRequired: input.stateDecision.executiveReviewRequired,
    auditRequired: input.stateDecision.auditRequired,
    handoffReason: input.stateDecision.handoffReason,
    commandNarrative,
    trustAssessment,
    continuityStandard,
  }
}