import type {
  ContinuityCondition,
  ContinuityConfidence,
  RecoveryCredibility,
  RecurrenceSeverity,
  SurvivabilityPressure,
} from './cgiDerivationEngine'

export type CGIContinuityState =
  | 'STABLE'
  | 'EARLY_STRAIN'
  | 'ACTIVE_INSTABILITY'
  | 'ESCALATED_INSTABILITY'
  | 'FRAGILE_RECOVERY'
  | 'RECURRENCE_RISK'
  | 'SURVIVABILITY_THREAT'
  | 'VERIFIED_STABILITY'

export type CGITransitionTrigger =
  | 'ESCALATION_ACCUMULATION'
  | 'RECURRENCE_DETECTION'
  | 'RECOVERY_FAILURE'
  | 'PRESSURE_CONCENTRATION'
  | 'COORDINATION_DEGRADATION'
  | 'CONFIDENCE_DEGRADATION'
  | 'SURVIVABILITY_THREAT_DETECTION'
  | 'RECOVERY_VERIFICATION'
  | 'STABILITY_VERIFICATION'
  | 'NO_SIGNIFICANT_CHANGE'

export type CGINextContinuityDestination =
  | 'MONITORING'
  | 'RECOVERY_VERIFICATION'
  | 'COORDINATION_CENTER'
  | 'CROSS_SITE_REVIEW'
  | 'EXECUTIVE_CENTER'
  | 'AUDIT_RECONSTRUCTION'
  | 'CONTINUITY_HISTORY'

export type CGITransitionDecision = {
  previousState: CGIContinuityState
  nextState: CGIContinuityState
  trigger: CGITransitionTrigger
  transitionAllowed: boolean
  reason: string
  requiredEvidence: string
  persistenceRule: string
  nextDestination: CGINextContinuityDestination
  coordinationRequired: boolean
  crossSiteRequired: boolean
  executiveReviewRequired: boolean
  auditRequired: boolean
  handoffReason: string
}

export type CGIStateEngineInput = {
  previousState: CGIContinuityState
  derivedCondition: ContinuityCondition
  continuityConfidence: ContinuityConfidence
  survivabilityPressure: SurvivabilityPressure
  recoveryCredibility: RecoveryCredibility
  recurrenceSeverity: RecurrenceSeverity
  unresolvedDurationDays: number
  repeatedInstabilityCount: number
  recoveryFailureCount: number
  verifiedRecoveryCount: number
  coordinationIssueCount: number
}

function mapConditionToState(
  condition: ContinuityCondition
): CGIContinuityState {
  return condition
}

function detectTransitionTrigger(
  input: CGIStateEngineInput
): CGITransitionTrigger {
  if (
    input.derivedCondition === 'SURVIVABILITY_THREAT' ||
    input.survivabilityPressure === 'SEVERE'
  ) {
    return 'SURVIVABILITY_THREAT_DETECTION'
  }

  if (
    input.recurrenceSeverity === 'STRUCTURAL' ||
    input.recurrenceSeverity === 'SYSTEMIC' ||
    input.repeatedInstabilityCount >= 4
  ) {
    return 'RECURRENCE_DETECTION'
  }

  if (input.recoveryFailureCount > 0) {
    return 'RECOVERY_FAILURE'
  }

  if (
    input.derivedCondition === 'ESCALATED_INSTABILITY' ||
    input.unresolvedDurationDays >= 7
  ) {
    return 'ESCALATION_ACCUMULATION'
  }

  if (input.survivabilityPressure === 'HIGH') {
    return 'PRESSURE_CONCENTRATION'
  }

  if (input.coordinationIssueCount >= 3) {
    return 'COORDINATION_DEGRADATION'
  }

  if (
    input.continuityConfidence === 'DEGRADING' ||
    input.continuityConfidence === 'CRITICAL'
  ) {
    return 'CONFIDENCE_DEGRADATION'
  }

  if (
    input.recoveryCredibility === 'CREDIBLE' ||
    input.recoveryCredibility === 'DURABLE'
  ) {
    return 'RECOVERY_VERIFICATION'
  }

  return 'NO_SIGNIFICANT_CHANGE'
}

function canReturnToVerifiedStability(input: CGIStateEngineInput): boolean {
  return (
    input.recoveryCredibility === 'DURABLE' &&
    input.verifiedRecoveryCount > 0 &&
    input.repeatedInstabilityCount === 0 &&
    input.recoveryFailureCount === 0 &&
    input.survivabilityPressure === 'LOW' &&
    input.continuityConfidence === 'HIGH'
  )
}

function canReturnToStable(input: CGIStateEngineInput): boolean {
  return (
    input.previousState === 'VERIFIED_STABILITY' &&
    input.derivedCondition === 'STABLE' &&
    input.recoveryCredibility === 'DURABLE' &&
    input.continuityConfidence === 'HIGH'
  )
}

function shouldHoldFragileRecovery(input: CGIStateEngineInput): boolean {
  return (
    input.previousState === 'ESCALATED_INSTABILITY' &&
    input.derivedCondition === 'STABLE' &&
    input.recoveryCredibility !== 'DURABLE'
  )
}

function shouldRemainInRecurrenceRisk(
  input: CGIStateEngineInput
): boolean {
  return (
    input.previousState === 'RECURRENCE_RISK' &&
    input.recoveryCredibility !== 'DURABLE'
  )
}

function buildRequiredEvidence(state: CGIContinuityState): string {
  if (state === 'SURVIVABILITY_THREAT') {
    return 'Executive ownership, active mitigation, unresolved-risk review, and continuity protection evidence.'
  }

  if (state === 'RECURRENCE_RISK') {
    return 'Pattern review, recurrence explanation, structural driver evidence, and reinforced recovery plan.'
  }

  if (state === 'FRAGILE_RECOVERY') {
    return 'Recovery must hold across time, without reburn, relapse, or unresolved critical pressure.'
  }

  if (state === 'ESCALATED_INSTABILITY') {
    return 'Command review, owner assignment, action deadline, and escalation containment evidence.'
  }

  if (state === 'ACTIVE_INSTABILITY') {
    return 'Coordination activity, response ownership, and visible reduction of instability pressure.'
  }

  if (state === 'EARLY_STRAIN') {
    return 'Early intervention record and monitoring evidence.'
  }

  if (state === 'VERIFIED_STABILITY') {
    return 'Verified recovery evidence and absence of recurrence across the review window.'
  }

  return 'Routine monitoring evidence.'
}

function buildPersistenceRule(state: CGIContinuityState): string {
  if (state === 'FRAGILE_RECOVERY') {
    return 'Do not return to stable until recovery durability is verified.'
  }

  if (state === 'RECURRENCE_RISK') {
    return 'Do not downgrade until recurrence pattern is explained and recovery holds.'
  }

  if (state === 'SURVIVABILITY_THREAT') {
    return 'Do not downgrade without executive evidence and reduced continuity pressure.'
  }

  if (state === 'VERIFIED_STABILITY') {
    return 'Verified stability may return to stable after continued clean monitoring.'
  }

  return 'State may change only when continuity credibility changes.'
}

function deriveNextDestination(
  input: CGIStateEngineInput,
  nextState: CGIContinuityState,
  trigger: CGITransitionTrigger
): CGINextContinuityDestination {
  if (
    nextState === 'SURVIVABILITY_THREAT' ||
    input.survivabilityPressure === 'SEVERE'
  ) {
    return 'EXECUTIVE_CENTER'
  }

  if (
    trigger === 'COORDINATION_DEGRADATION' ||
    input.coordinationIssueCount >= 3
  ) {
    return 'CROSS_SITE_REVIEW'
  }

  if (
    input.recurrenceSeverity === 'STRUCTURAL' ||
    input.recurrenceSeverity === 'SYSTEMIC' ||
    input.repeatedInstabilityCount >= 4
  ) {
    return 'CROSS_SITE_REVIEW'
  }

  if (nextState === 'ESCALATED_INSTABILITY') {
    return 'COORDINATION_CENTER'
  }

  if (nextState === 'ACTIVE_INSTABILITY') {
    return 'COORDINATION_CENTER'
  }

  if (nextState === 'FRAGILE_RECOVERY') {
    return 'RECOVERY_VERIFICATION'
  }

  if (nextState === 'RECURRENCE_RISK') {
    return 'CONTINUITY_HISTORY'
  }

  if (nextState === 'VERIFIED_STABILITY') {
    return 'AUDIT_RECONSTRUCTION'
  }

  return 'MONITORING'
}

function buildHandoffReason(
  destination: CGINextContinuityDestination,
  nextState: CGIContinuityState
): string {
  if (destination === 'EXECUTIVE_CENTER') {
    return 'Continuity pressure has reached executive significance and requires leadership synthesis.'
  }

  if (destination === 'CROSS_SITE_REVIEW') {
    return 'The pattern may no longer be contained within one operational lane and requires cross-site continuity review.'
  }

  if (destination === 'COORDINATION_CENTER') {
    return 'Active instability requires coordination ownership before it spreads or hardens.'
  }

  if (destination === 'RECOVERY_VERIFICATION') {
    return 'Visible recovery exists, but durability has not yet been proven.'
  }

  if (destination === 'CONTINUITY_HISTORY') {
    return 'Recurring instability must be preserved as continuity memory before it is treated as resolved.'
  }

  if (destination === 'AUDIT_RECONSTRUCTION') {
    return 'Verified stability requires evidence preservation for reconstructability.'
  }

  return `Continuity remains in ${nextState} and should stay under governed monitoring.`
}

function buildDecision(
  input: CGIStateEngineInput,
  nextState: CGIContinuityState,
  trigger: CGITransitionTrigger,
  transitionAllowed: boolean,
  reason: string
): CGITransitionDecision {
  const nextDestination = deriveNextDestination(input, nextState, trigger)

  return {
    previousState: input.previousState,
    nextState,
    trigger,
    transitionAllowed,
    reason,
    requiredEvidence: buildRequiredEvidence(nextState),
    persistenceRule: buildPersistenceRule(nextState),
    nextDestination,
    coordinationRequired:
      nextDestination === 'COORDINATION_CENTER' ||
      nextDestination === 'CROSS_SITE_REVIEW',
    crossSiteRequired: nextDestination === 'CROSS_SITE_REVIEW',
    executiveReviewRequired: nextDestination === 'EXECUTIVE_CENTER',
    auditRequired:
      nextDestination === 'AUDIT_RECONSTRUCTION' ||
      nextState === 'VERIFIED_STABILITY' ||
      nextState === 'SURVIVABILITY_THREAT',
    handoffReason: buildHandoffReason(nextDestination, nextState),
  }
}

export function evaluateCGIContinuityState(
  input: CGIStateEngineInput
): CGITransitionDecision {
  const trigger = detectTransitionTrigger(input)
  const derivedState = mapConditionToState(input.derivedCondition)

  if (canReturnToStable(input)) {
    return buildDecision(
      input,
      'STABLE',
      'STABILITY_VERIFICATION',
      true,
      'Continuity has already passed through verified stability and remains credible.'
    )
  }

  if (canReturnToVerifiedStability(input)) {
    return buildDecision(
      input,
      'VERIFIED_STABILITY',
      'STABILITY_VERIFICATION',
      true,
      'Recovery has demonstrated durability without recurrence, failure, or survivability pressure.'
    )
  }

  if (shouldHoldFragileRecovery(input)) {
    return buildDecision(
      input,
      'FRAGILE_RECOVERY',
      'RECOVERY_VERIFICATION',
      true,
      'Visible recovery exists, but durability has not yet been proven. CGI must not jump directly from escalated instability to stable.'
    )
  }

  if (shouldRemainInRecurrenceRisk(input)) {
    return buildDecision(
      input,
      'RECURRENCE_RISK',
      'RECURRENCE_DETECTION',
      true,
      'Recurring instability has not yet been structurally resolved or proven durable.'
    )
  }

  if (derivedState === input.previousState) {
    return buildDecision(
      input,
      input.previousState,
      trigger,
      false,
      'No material continuity credibility change has been detected. Current state remains valid.'
    )
  }

  return buildDecision(
    input,
    derivedState,
    trigger,
    true,
    'Continuity credibility has changed enough to justify a governed state transition.'
  )
}