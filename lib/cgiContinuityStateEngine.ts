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

export type CGITransitionDecision = {
  previousState: CGIContinuityState
  nextState: CGIContinuityState
  trigger: CGITransitionTrigger
  transitionAllowed: boolean
  reason: string
  requiredEvidence: string
  persistenceRule: string
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

export function evaluateCGIContinuityState(
  input: CGIStateEngineInput
): CGITransitionDecision {
  const trigger = detectTransitionTrigger(input)
  const derivedState = mapConditionToState(input.derivedCondition)

  if (canReturnToStable(input)) {
    return {
      previousState: input.previousState,
      nextState: 'STABLE',
      trigger: 'STABILITY_VERIFICATION',
      transitionAllowed: true,
      reason:
        'Continuity has already passed through verified stability and remains credible.',
      requiredEvidence: buildRequiredEvidence('STABLE'),
      persistenceRule: buildPersistenceRule('STABLE'),
    }
  }

  if (canReturnToVerifiedStability(input)) {
    return {
      previousState: input.previousState,
      nextState: 'VERIFIED_STABILITY',
      trigger: 'STABILITY_VERIFICATION',
      transitionAllowed: true,
      reason:
        'Recovery has demonstrated durability without recurrence, failure, or survivability pressure.',
      requiredEvidence: buildRequiredEvidence('VERIFIED_STABILITY'),
      persistenceRule: buildPersistenceRule('VERIFIED_STABILITY'),
    }
  }

  if (shouldHoldFragileRecovery(input)) {
    return {
      previousState: input.previousState,
      nextState: 'FRAGILE_RECOVERY',
      trigger: 'RECOVERY_VERIFICATION',
      transitionAllowed: true,
      reason:
        'Visible recovery exists, but durability has not yet been proven. CGI must not jump directly from escalated instability to stable.',
      requiredEvidence: buildRequiredEvidence('FRAGILE_RECOVERY'),
      persistenceRule: buildPersistenceRule('FRAGILE_RECOVERY'),
    }
  }

  if (shouldRemainInRecurrenceRisk(input)) {
    return {
      previousState: input.previousState,
      nextState: 'RECURRENCE_RISK',
      trigger: 'RECURRENCE_DETECTION',
      transitionAllowed: true,
      reason:
        'Recurring instability has not yet been structurally resolved or proven durable.',
      requiredEvidence: buildRequiredEvidence('RECURRENCE_RISK'),
      persistenceRule: buildPersistenceRule('RECURRENCE_RISK'),
    }
  }

  if (derivedState === input.previousState) {
    return {
      previousState: input.previousState,
      nextState: input.previousState,
      trigger,
      transitionAllowed: false,
      reason:
        'No material continuity credibility change has been detected. Current state remains valid.',
      requiredEvidence: buildRequiredEvidence(input.previousState),
      persistenceRule: buildPersistenceRule(input.previousState),
    }
  }

  return {
    previousState: input.previousState,
    nextState: derivedState,
    trigger,
    transitionAllowed: true,
    reason:
      'Continuity credibility has changed enough to justify a governed state transition.',
    requiredEvidence: buildRequiredEvidence(derivedState),
    persistenceRule: buildPersistenceRule(derivedState),
  }
}