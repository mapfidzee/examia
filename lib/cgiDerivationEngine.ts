export type ContinuityCondition =
  | 'STABLE'
  | 'EARLY_STRAIN'
  | 'ACTIVE_INSTABILITY'
  | 'ESCALATED_INSTABILITY'
  | 'FRAGILE_RECOVERY'
  | 'RECURRENCE_RISK'
  | 'SURVIVABILITY_THREAT'

export type ContinuityConfidence =
  | 'HIGH'
  | 'GUARDED'
  | 'FRAGILE'
  | 'DEGRADING'
  | 'CRITICAL'

export type SurvivabilityPressure =
  | 'LOW'
  | 'ELEVATED'
  | 'SERIOUS'
  | 'HIGH'
  | 'SEVERE'

export type RecoveryCredibility =
  | 'UNVERIFIED'
  | 'EMERGING'
  | 'PARTIAL'
  | 'CREDIBLE'
  | 'DURABLE'

export type RecurrenceSeverity =
  | 'ISOLATED'
  | 'RECURRING'
  | 'PATTERNED'
  | 'STRUCTURAL'
  | 'SYSTEMIC'

export type ExecutivePosture =
  | 'MONITOR'
  | 'PREPARE'
  | 'COORDINATE'
  | 'COMMAND'
  | 'VERIFY'
  | 'REINFORCE'
  | 'EXECUTIVE_INTERVENTION'

export type CGISeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

export type CGIRecoveryStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'PARTIAL'
  | 'RECOVERED'
  | 'VERIFIED'

export type CGIInput = {
  openCases: number
  escalatedCases: number
  repeatedInstabilityCount: number
  unresolvedCriticalCount: number
  recoveryFailures: number
  verifiedRecoveries: number
  coordinationIssues: number
  averageUnresolvedDays: number
  dominantSeverity: CGISeverity
  recoveryStatus: CGIRecoveryStatus
}

export type CGIDerivationOutput = {
  continuityCondition: ContinuityCondition
  continuityConfidence: ContinuityConfidence
  survivabilityPressure: SurvivabilityPressure
  recoveryCredibility: RecoveryCredibility
  recurrenceSeverity: RecurrenceSeverity
  executivePosture: ExecutivePosture
  dominantOperationalTruth: string
  primaryDriver: string
  requiredAction: string
  timePressure: string
  narrativeSummary: string
}

function hasNoInstability(input: CGIInput): boolean {
  return (
    input.openCases === 0 &&
    input.escalatedCases === 0 &&
    input.repeatedInstabilityCount === 0 &&
    input.unresolvedCriticalCount === 0 &&
    input.recoveryFailures === 0
  )
}

function deriveRecoveryCredibility(input: CGIInput): RecoveryCredibility {
  if (input.recoveryStatus === 'VERIFIED' && input.verifiedRecoveries > 0) {
    return 'DURABLE'
  }

  if (input.recoveryStatus === 'RECOVERED') {
    return 'CREDIBLE'
  }

  if (input.recoveryStatus === 'PARTIAL') {
    return 'PARTIAL'
  }

  if (input.recoveryStatus === 'IN_PROGRESS') {
    return 'EMERGING'
  }

  return 'UNVERIFIED'
}

function deriveRecurrenceSeverity(input: CGIInput): RecurrenceSeverity {
  if (input.repeatedInstabilityCount >= 12) return 'SYSTEMIC'
  if (input.repeatedInstabilityCount >= 8) return 'STRUCTURAL'
  if (input.repeatedInstabilityCount >= 4) return 'PATTERNED'
  if (input.repeatedInstabilityCount >= 2) return 'RECURRING'
  return 'ISOLATED'
}

function deriveSurvivabilityPressure(input: CGIInput): SurvivabilityPressure {
  if (
    input.unresolvedCriticalCount >= 3 ||
    input.recoveryFailures >= 5 ||
    input.dominantSeverity === 'CRITICAL'
  ) {
    return 'SEVERE'
  }

  if (
    input.escalatedCases >= 5 ||
    input.unresolvedCriticalCount >= 2 ||
    input.averageUnresolvedDays >= 14
  ) {
    return 'HIGH'
  }

  if (
    input.escalatedCases >= 3 ||
    input.recoveryFailures >= 3 ||
    input.coordinationIssues >= 5
  ) {
    return 'SERIOUS'
  }

  if (
    input.openCases > 0 ||
    input.coordinationIssues > 0 ||
    input.dominantSeverity === 'MODERATE'
  ) {
    return 'ELEVATED'
  }

  return 'LOW'
}

function deriveContinuityCondition(
  input: CGIInput,
  recoveryCredibility: RecoveryCredibility,
  recurrenceSeverity: RecurrenceSeverity,
  survivabilityPressure: SurvivabilityPressure
): ContinuityCondition {
  if (survivabilityPressure === 'SEVERE') {
    return 'SURVIVABILITY_THREAT'
  }

  if (
    recurrenceSeverity === 'STRUCTURAL' ||
    recurrenceSeverity === 'SYSTEMIC'
  ) {
    return 'RECURRENCE_RISK'
  }

  if (
    recoveryCredibility === 'EMERGING' ||
    recoveryCredibility === 'PARTIAL' ||
    recoveryCredibility === 'CREDIBLE'
  ) {
    return 'FRAGILE_RECOVERY'
  }

  if (
    input.escalatedCases >= 3 ||
    input.unresolvedCriticalCount > 0 ||
    input.dominantSeverity === 'HIGH' ||
    input.dominantSeverity === 'CRITICAL'
  ) {
    return 'ESCALATED_INSTABILITY'
  }

  if (input.openCases >= 3 || input.coordinationIssues >= 3) {
    return 'ACTIVE_INSTABILITY'
  }

  if (input.openCases > 0 || input.coordinationIssues > 0) {
    return 'EARLY_STRAIN'
  }

  return 'STABLE'
}

function deriveContinuityConfidence(
  condition: ContinuityCondition,
  recoveryCredibility: RecoveryCredibility,
  recurrenceSeverity: RecurrenceSeverity
): ContinuityConfidence {
  if (condition === 'SURVIVABILITY_THREAT') return 'CRITICAL'

  if (
    condition === 'RECURRENCE_RISK' ||
    recurrenceSeverity === 'STRUCTURAL' ||
    recurrenceSeverity === 'SYSTEMIC'
  ) {
    return 'DEGRADING'
  }

  if (
    condition === 'FRAGILE_RECOVERY' ||
    recoveryCredibility === 'PARTIAL' ||
    recoveryCredibility === 'EMERGING'
  ) {
    return 'FRAGILE'
  }

  if (
    condition === 'EARLY_STRAIN' ||
    condition === 'ACTIVE_INSTABILITY' ||
    condition === 'ESCALATED_INSTABILITY'
  ) {
    return 'GUARDED'
  }

  return 'HIGH'
}

function deriveExecutivePosture(
  condition: ContinuityCondition,
  recoveryCredibility: RecoveryCredibility
): ExecutivePosture {
  if (condition === 'SURVIVABILITY_THREAT') return 'EXECUTIVE_INTERVENTION'
  if (condition === 'RECURRENCE_RISK') return 'REINFORCE'
  if (condition === 'ESCALATED_INSTABILITY') return 'COMMAND'
  if (condition === 'ACTIVE_INSTABILITY') return 'COORDINATE'
  if (condition === 'EARLY_STRAIN') return 'PREPARE'

  if (
    condition === 'FRAGILE_RECOVERY' ||
    recoveryCredibility === 'CREDIBLE' ||
    recoveryCredibility === 'PARTIAL'
  ) {
    return 'VERIFY'
  }

  return 'MONITOR'
}

function derivePrimaryDriver(input: CGIInput): string {
  if (input.unresolvedCriticalCount > 0) {
    return 'Unresolved critical instability is placing continuity credibility under pressure.'
  }

  if (input.recoveryFailures > 0) {
    return 'Recovery attempts are not holding consistently.'
  }

  if (input.repeatedInstabilityCount > 0) {
    return 'Instability is repeating after apparent recovery.'
  }

  if (input.coordinationIssues > 0) {
    return 'Coordination weakness is affecting stabilization flow.'
  }

  if (input.escalatedCases > 0) {
    return 'Escalated cases are concentrating operational pressure.'
  }

  if (input.openCases > 0) {
    return 'Open cases show early continuity strain.'
  }

  return 'No active continuity driver is currently dominant.'
}

function deriveRequiredAction(
  condition: ContinuityCondition,
  posture: ExecutivePosture
): string {
  if (posture === 'EXECUTIVE_INTERVENTION') {
    return 'Executive leadership must intervene, assign ownership, and require stabilization evidence.'
  }

  if (posture === 'COMMAND') {
    return 'Command review is required with clear owner, deadline, and escalation control.'
  }

  if (posture === 'REINFORCE') {
    return 'Reinforce the recovery pathway and investigate recurring structural weakness.'
  }

  if (posture === 'VERIFY') {
    return 'Verify whether recovery is durable before restoring full confidence.'
  }

  if (posture === 'COORDINATE') {
    return 'Coordinate response activity and reduce operational friction.'
  }

  if (posture === 'PREPARE') {
    return 'Prepare early intervention before strain becomes visible instability.'
  }

  if (condition === 'STABLE') {
    return 'Maintain monitoring and preserve institutional readiness.'
  }

  return 'Monitor condition and prepare escalation if continuity credibility weakens.'
}

function deriveTimePressure(input: CGIInput): string {
  if (input.unresolvedCriticalCount > 0 || input.dominantSeverity === 'CRITICAL') {
    return 'Immediate'
  }

  if (input.escalatedCases >= 3 || input.recoveryFailures >= 3) {
    return 'Urgent'
  }

  if (input.openCases > 0 || input.coordinationIssues > 0) {
    return 'Near-term'
  }

  return 'Routine'
}

function deriveDominantOperationalTruth(
  condition: ContinuityCondition,
  confidence: ContinuityConfidence
): string {
  if (condition === 'SURVIVABILITY_THREAT') {
    return 'Continuity credibility is under serious threat.'
  }

  if (condition === 'RECURRENCE_RISK') {
    return 'Instability is repeating and may reflect structural weakness.'
  }

  if (condition === 'FRAGILE_RECOVERY') {
    return 'Recovery is visible but not yet proven durable.'
  }

  if (condition === 'ESCALATED_INSTABILITY') {
    return 'Visible instability requires command-level attention.'
  }

  if (condition === 'ACTIVE_INSTABILITY') {
    return 'Operational instability is active and requires coordination.'
  }

  if (condition === 'EARLY_STRAIN') {
    return 'Early strain is present before full disruption.'
  }

  if (confidence === 'HIGH') {
    return 'Continuity is currently stable.'
  }

  return 'Continuity condition requires monitoring.'
}

function deriveNarrativeSummary(output: {
  condition: ContinuityCondition
  confidence: ContinuityConfidence
  pressure: SurvivabilityPressure
  recovery: RecoveryCredibility
  recurrence: RecurrenceSeverity
  driver: string
  action: string
}): string {
  return `CGI assessment: condition is ${output.condition}, confidence is ${output.confidence}, survivability pressure is ${output.pressure}, recovery credibility is ${output.recovery}, and recurrence severity is ${output.recurrence}. ${output.driver} ${output.action}`
}

export function deriveCGIIntelligence(input: CGIInput): CGIDerivationOutput {
  if (hasNoInstability(input)) {
    return {
      continuityCondition: 'STABLE',
      continuityConfidence: 'HIGH',
      survivabilityPressure: 'LOW',
      recoveryCredibility: 'DURABLE',
      recurrenceSeverity: 'ISOLATED',
      executivePosture: 'MONITOR',
      dominantOperationalTruth: 'Continuity is currently stable.',
      primaryDriver: 'No active continuity driver is currently dominant.',
      requiredAction: 'Maintain monitoring and preserve institutional readiness.',
      timePressure: 'Routine',
      narrativeSummary:
        'CGI assessment: continuity is stable, confidence is high, survivability pressure is low, and no active instability pattern is currently dominant.',
    }
  }

  const recoveryCredibility = deriveRecoveryCredibility(input)
  const recurrenceSeverity = deriveRecurrenceSeverity(input)
  const survivabilityPressure = deriveSurvivabilityPressure(input)

  const continuityCondition = deriveContinuityCondition(
    input,
    recoveryCredibility,
    recurrenceSeverity,
    survivabilityPressure
  )

  const continuityConfidence = deriveContinuityConfidence(
    continuityCondition,
    recoveryCredibility,
    recurrenceSeverity
  )

  const executivePosture = deriveExecutivePosture(
    continuityCondition,
    recoveryCredibility
  )

  const primaryDriver = derivePrimaryDriver(input)
  const requiredAction = deriveRequiredAction(
    continuityCondition,
    executivePosture
  )
  const timePressure = deriveTimePressure(input)

  const dominantOperationalTruth = deriveDominantOperationalTruth(
    continuityCondition,
    continuityConfidence
  )

  const narrativeSummary = deriveNarrativeSummary({
    condition: continuityCondition,
    confidence: continuityConfidence,
    pressure: survivabilityPressure,
    recovery: recoveryCredibility,
    recurrence: recurrenceSeverity,
    driver: primaryDriver,
    action: requiredAction,
  })

  return {
    continuityCondition,
    continuityConfidence,
    survivabilityPressure,
    recoveryCredibility,
    recurrenceSeverity,
    executivePosture,
    dominantOperationalTruth,
    primaryDriver,
    requiredAction,
    timePressure,
    narrativeSummary,
  }
}