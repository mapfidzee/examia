export type CGIExecutiveActionPlanWindow =
  | 'IMMEDIATE'
  | '24_HOURS'
  | '72_HOURS'
  | '7_DAYS'
  | '14_DAYS'
  | 'ROUTINE_CYCLE'

export type CGIExecutiveActionPlanEscalationRule =
  | 'ESCALATE_ON_RECURRENCE'
  | 'ESCALATE_ON_COMMAND_PRESSURE'
  | 'ESCALATE_ON_CROSS_SITE_SPREAD'
  | 'ESCALATE_ON_EVIDENCE_FAILURE'
  | 'ESCALATE_ON_SAFEGUARDING_VISIBILITY'
  | 'NO_ESCALATION_REQUIRED'

export type CGIExecutiveActionPlanInput = {
  recommendationPosture: string
  recommendationUrgency: string
  recommendation: string
  requiredOwner: string
  nextExecutiveMove: string
  requiredEvidence: string
  activeInstability: number
  commandPressure: number
  fragileRecovery: number
  recurrenceVisible: number
  coordinationPressure: number
  crossSitePressure: number
  auditPressure: number
  safeguardingVisible: number
  evidenceReturn: number
  recoveryRecords: number
  historicalMemory: number
  deltaDirection?: string
  deltaConfidence?: string
  topThreat?: string
}

export type CGIExecutiveActionPlanReading = {
  immediateAction: string
  executiveOwner: string
  reviewWindow: CGIExecutiveActionPlanWindow
  escalationRule: CGIExecutiveActionPlanEscalationRule
  successCondition: string
  failureCondition: string
  requiredEvidence: string
  actionSequence: string[]
  boardSentence: string
}

function deriveReviewWindow(
  input: CGIExecutiveActionPlanInput,
): CGIExecutiveActionPlanWindow {
  if (
    input.recommendationUrgency === 'IMMEDIATE' ||
    input.safeguardingVisible > 0 ||
    input.commandPressure >= 5
  ) {
    return 'IMMEDIATE'
  }

  if (
    input.recommendationUrgency === 'WITHIN_24_HOURS' ||
    input.crossSitePressure > 0 ||
    input.recurrenceVisible > 0
  ) {
    return '24_HOURS'
  }

  if (
    input.recommendationUrgency === 'WITHIN_72_HOURS' ||
    input.coordinationPressure > 0 ||
    input.evidenceReturn > 0 ||
    input.fragileRecovery > 0
  ) {
    return '72_HOURS'
  }

  if (
    input.recoveryRecords > 0 ||
    input.deltaDirection === 'WATCH' ||
    input.deltaDirection === 'INSUFFICIENT_HISTORY'
  ) {
    return '14_DAYS'
  }

  if (input.historicalMemory > 0) return '7_DAYS'

  return 'ROUTINE_CYCLE'
}

function deriveEscalationRule(
  input: CGIExecutiveActionPlanInput,
): CGIExecutiveActionPlanEscalationRule {
  if (input.safeguardingVisible > 0) {
    return 'ESCALATE_ON_SAFEGUARDING_VISIBILITY'
  }

  if (input.crossSitePressure > 0) {
    return 'ESCALATE_ON_CROSS_SITE_SPREAD'
  }

  if (input.commandPressure > 0) {
    return 'ESCALATE_ON_COMMAND_PRESSURE'
  }

  if (input.recurrenceVisible > 0 || input.fragileRecovery > 0) {
    return 'ESCALATE_ON_RECURRENCE'
  }

  if (input.auditPressure > 0 || input.evidenceReturn > 0) {
    return 'ESCALATE_ON_EVIDENCE_FAILURE'
  }

  return 'NO_ESCALATION_REQUIRED'
}

function deriveImmediateAction(input: CGIExecutiveActionPlanInput) {
  if (input.safeguardingVisible > 0) {
    return 'Preserve safeguarding-visible continuity records, maintain executive visibility, and require governance-safe evidence immediately.'
  }

  if (input.commandPressure >= 5) {
    return 'Escalate to Command, assign an accountable executive owner, and require command evidence immediately.'
  }

  if (input.crossSitePressure > 0) {
    return 'Activate cross-site review and confirm whether instability is isolated or distributed.'
  }

  if (input.recurrenceVisible > 0 || input.fragileRecovery > 0) {
    return 'Continue recovery durability observation and require recurrence explanation before reducing posture.'
  }

  if (input.coordinationPressure > 0) {
    return 'Assign coordination ownership and verify synchronization before continuity movement proceeds.'
  }

  if (input.auditPressure > 0 || input.evidenceReturn > 0) {
    return 'Hold conclusion until audit-ready evidence and outcome credibility are verified.'
  }

  if (
    input.recommendationPosture === 'GOVERNED_MONITORING' ||
    input.deltaDirection === 'INSUFFICIENT_HISTORY'
  ) {
    return 'Maintain governed monitoring and preserve the current executive reading for future comparison.'
  }

  return 'Maintain stability posture and continue routine executive review.'
}

function deriveSuccessCondition(input: CGIExecutiveActionPlanInput) {
  if (input.safeguardingVisible > 0) {
    return 'Safeguarding-visible records remain protected, evidence remains governance-safe, and executive visibility is preserved.'
  }

  if (input.commandPressure > 0) {
    return 'Command pressure is resolved, accountable ownership is visible, and evidence supports posture reduction.'
  }

  if (input.crossSitePressure > 0) {
    return 'Cross-site review confirms whether exposure is isolated, contained, recurring, or structurally distributed.'
  }

  if (input.recurrenceVisible > 0 || input.fragileRecovery > 0) {
    return 'No recurrence is detected during the review window and recovery durability evidence remains stable.'
  }

  if (input.coordinationPressure > 0) {
    return 'Coordination ownership is assigned, synchronization is verified, and no route remains stalled.'
  }

  if (input.auditPressure > 0 || input.evidenceReturn > 0) {
    return 'Evidence chain is complete, reconstructable, and sufficient for executive interpretation.'
  }

  return 'Stability remains visible, memory is preserved, and no new executive threat appears during review.'
}

function deriveFailureCondition(input: CGIExecutiveActionPlanInput) {
  if (input.safeguardingVisible > 0) {
    return 'Safeguarding visibility weakens, evidence becomes unsafe, or protected continuity records disappear.'
  }

  if (input.commandPressure > 0) {
    return 'Command pressure persists without owner, evidence, deadline, or executive action.'
  }

  if (input.crossSitePressure > 0) {
    return 'Instability appears across more than one site, region, domain, or operational dependency.'
  }

  if (input.recurrenceVisible > 0 || input.fragileRecovery > 0) {
    return 'Instability reappears, recovery weakens, or durability confidence collapses.'
  }

  if (input.coordinationPressure > 0) {
    return 'Ownership remains unclear, routing stalls, or synchronization fails.'
  }

  if (input.auditPressure > 0 || input.evidenceReturn > 0) {
    return 'Evidence remains incomplete, contradictory, non-reconstructable, or insufficient for executive confidence.'
  }

  return 'A new recurrence, command pressure, evidence gap, or cross-site signal becomes visible.'
}

function buildActionSequence(input: CGIExecutiveActionPlanInput) {
  const sequence: string[] = []

  if (input.recommendationPosture === 'EXECUTIVE_ACTION_REQUIRED') {
    sequence.push('Hold executive visibility until ownership is confirmed.')
    sequence.push('Assign accountable owner and deadline.')
    sequence.push('Require evidence before posture reduction.')
  }

  if (input.crossSitePressure > 0) {
    sequence.push('Run cross-site exposure review.')
  }

  if (input.coordinationPressure > 0) {
    sequence.push('Verify coordination ownership and synchronization.')
  }

  if (input.recurrenceVisible > 0 || input.fragileRecovery > 0) {
    sequence.push('Continue recovery durability observation.')
  }

  if (input.auditPressure > 0 || input.evidenceReturn > 0) {
    sequence.push('Complete audit-ready evidence chain.')
  }

  if (input.safeguardingVisible > 0) {
    sequence.push('Protect safeguarding-visible records and language.')
  }

  if (sequence.length === 0) {
    sequence.push('Preserve current executive reading.')
    sequence.push('Continue routine executive review.')
    sequence.push('Compare against next continuity reading.')
  }

  return sequence
}

export function buildCGIExecutiveActionPlan(
  input: CGIExecutiveActionPlanInput,
): CGIExecutiveActionPlanReading {
  const reviewWindow = deriveReviewWindow(input)
  const escalationRule = deriveEscalationRule(input)
  const immediateAction = deriveImmediateAction(input)
  const successCondition = deriveSuccessCondition(input)
  const failureCondition = deriveFailureCondition(input)
  const actionSequence = buildActionSequence(input)

  const executiveOwner =
    input.requiredOwner || 'Executive Center'

  const requiredEvidence =
    input.requiredEvidence ||
    'Preserve current reading, monitoring note, and memory statement.'

  const boardSentence =
    `${reviewWindow}: ${immediateAction} Success means ${successCondition.toLowerCase()}`

  return {
    immediateAction,
    executiveOwner,
    reviewWindow,
    escalationRule,
    successCondition,
    failureCondition,
    requiredEvidence,
    actionSequence,
    boardSentence,
  }
}