import type {
  ContinuityCondition,
  ContinuityConfidence,
  RecoveryCredibility,
  RecurrenceSeverity,
  SurvivabilityPressure,
  ExecutivePosture,
} from './cgiDerivationEngine'

export type CGIContinuityTrajectory =
  | 'CONTINUITY_IMPROVING'
  | 'CONTINUITY_HOLDING'
  | 'CONTINUITY_DEGRADING'
  | 'CONTINUITY_AT_RISK'
  | 'CONTINUITY_THREATENED'

export type CGITrajectoryMomentum =
  | 'POSITIVE'
  | 'STABLE'
  | 'NEGATIVE'
  | 'ACCELERATING_NEGATIVE'
  | 'CRITICAL_NEGATIVE'

export type CGITrajectoryInput = {
  continuityCondition: ContinuityCondition
  continuityConfidence: ContinuityConfidence
  survivabilityPressure: SurvivabilityPressure
  recoveryCredibility: RecoveryCredibility
  recurrenceSeverity: RecurrenceSeverity
  executivePosture: ExecutivePosture
  openCases: number
  escalatedCases: number
  repeatedInstabilityCount: number
  unresolvedCriticalCount: number
  recoveryFailures: number
  verifiedRecoveries: number
  coordinationIssues: number
  averageUnresolvedDays: number
  crossSiteSignals?: number
  commandReviews?: number
  auditGaps?: number
}

export type CGITrajectoryOutput = {
  trajectory: CGIContinuityTrajectory
  momentum: CGITrajectoryMomentum
  trajectoryDirection: string
  trajectoryExplanation: string
  trajectoryEvidence: string
  trajectoryRisk: string
  trajectoryRecommendation: string
  executiveMeaning: string
  commanderQuestion: string
  watchNext: string
}

function pressureScore(pressure: SurvivabilityPressure): number {
  if (pressure === 'SEVERE') return 5
  if (pressure === 'HIGH') return 4
  if (pressure === 'SERIOUS') return 3
  if (pressure === 'ELEVATED') return 2
  return 1
}

function confidenceScore(confidence: ContinuityConfidence): number {
  if (confidence === 'CRITICAL') return 5
  if (confidence === 'DEGRADING') return 4
  if (confidence === 'FRAGILE') return 3
  if (confidence === 'GUARDED') return 2
  return 1
}

function recurrenceScore(recurrence: RecurrenceSeverity): number {
  if (recurrence === 'SYSTEMIC') return 5
  if (recurrence === 'STRUCTURAL') return 4
  if (recurrence === 'PATTERNED') return 3
  if (recurrence === 'RECURRING') return 2
  return 1
}

function recoveryStrength(recovery: RecoveryCredibility): number {
  if (recovery === 'DURABLE') return 5
  if (recovery === 'CREDIBLE') return 4
  if (recovery === 'PARTIAL') return 3
  if (recovery === 'EMERGING') return 2
  return 1
}

function deriveRiskLoad(input: CGITrajectoryInput): number {
  return (
    input.openCases +
    input.escalatedCases * 2 +
    input.repeatedInstabilityCount * 2 +
    input.unresolvedCriticalCount * 4 +
    input.recoveryFailures * 3 +
    input.coordinationIssues * 2 +
    Math.floor(input.averageUnresolvedDays / 7) +
    (input.crossSiteSignals ?? 0) * 3 +
    (input.commandReviews ?? 0) * 2 +
    (input.auditGaps ?? 0) * 2
  )
}

function deriveStabilityLoad(input: CGITrajectoryInput): number {
  return (
    input.verifiedRecoveries * 4 +
    recoveryStrength(input.recoveryCredibility) * 2 +
    (input.continuityConfidence === 'HIGH' ? 5 : 0) +
    (input.survivabilityPressure === 'LOW' ? 4 : 0)
  )
}

function deriveTrajectory(input: CGITrajectoryInput): CGIContinuityTrajectory {
  if (
    input.continuityCondition === 'SURVIVABILITY_THREAT' ||
    input.continuityConfidence === 'CRITICAL' ||
    input.survivabilityPressure === 'SEVERE' ||
    input.unresolvedCriticalCount > 0
  ) {
    return 'CONTINUITY_THREATENED'
  }

  if (
    input.continuityCondition === 'RECURRENCE_RISK' ||
    input.recurrenceSeverity === 'STRUCTURAL' ||
    input.recurrenceSeverity === 'SYSTEMIC' ||
    (input.crossSiteSignals ?? 0) >= 2
  ) {
    return 'CONTINUITY_AT_RISK'
  }

  const riskLoad = deriveRiskLoad(input)
  const stabilityLoad = deriveStabilityLoad(input)

  if (
    input.continuityConfidence === 'DEGRADING' ||
    input.recoveryFailures >= 2 ||
    input.repeatedInstabilityCount >= 3 ||
    riskLoad > stabilityLoad + 8
  ) {
    return 'CONTINUITY_DEGRADING'
  }

  if (
    input.recoveryCredibility === 'DURABLE' &&
    input.verifiedRecoveries > 0 &&
    input.recoveryFailures === 0 &&
    input.repeatedInstabilityCount <= 1 &&
    input.escalatedCases === 0 &&
    input.unresolvedCriticalCount === 0 &&
    input.survivabilityPressure === 'LOW'
  ) {
    return 'CONTINUITY_IMPROVING'
  }

  return 'CONTINUITY_HOLDING'
}

function deriveMomentum(
  trajectory: CGIContinuityTrajectory,
  input: CGITrajectoryInput
): CGITrajectoryMomentum {
  if (trajectory === 'CONTINUITY_THREATENED') {
    return 'CRITICAL_NEGATIVE'
  }

  if (
    trajectory === 'CONTINUITY_AT_RISK' &&
    (input.crossSiteSignals ?? 0) > 0
  ) {
    return 'ACCELERATING_NEGATIVE'
  }

  if (
    trajectory === 'CONTINUITY_DEGRADING' ||
    trajectory === 'CONTINUITY_AT_RISK'
  ) {
    return 'NEGATIVE'
  }

  if (trajectory === 'CONTINUITY_IMPROVING') {
    return 'POSITIVE'
  }

  return 'STABLE'
}

function buildTrajectoryDirection(
  trajectory: CGIContinuityTrajectory
): string {
  if (trajectory === 'CONTINUITY_IMPROVING') {
    return 'Continuity is moving toward stronger stability.'
  }

  if (trajectory === 'CONTINUITY_HOLDING') {
    return 'Continuity is holding, but the direction has not yet strengthened.'
  }

  if (trajectory === 'CONTINUITY_DEGRADING') {
    return 'Continuity is weakening and requires closer governance.'
  }

  if (trajectory === 'CONTINUITY_AT_RISK') {
    return 'Continuity is moving toward enterprise risk if the pattern is not corrected.'
  }

  return 'Continuity is under threat and requires immediate executive intervention.'
}

function buildTrajectoryExplanation(
  trajectory: CGIContinuityTrajectory,
  input: CGITrajectoryInput
): string {
  if (trajectory === 'CONTINUITY_IMPROVING') {
    return 'Recovery evidence is strengthening, recurrence is controlled, survivability pressure is low, and verified recovery is visible.'
  }

  if (trajectory === 'CONTINUITY_HOLDING') {
    return 'The system is not clearly worsening, but recovery, pressure, recurrence, or confidence have not strengthened enough to declare improving continuity.'
  }

  if (trajectory === 'CONTINUITY_DEGRADING') {
    return 'Recovery failures, repeated instability, unresolved duration, or coordination pressure are weakening continuity confidence.'
  }

  if (trajectory === 'CONTINUITY_AT_RISK') {
    return 'Recurrence, cross-site exposure, structural patterning, or command pressure suggests the issue may no longer be isolated.'
  }

  return 'Critical pressure, unresolved severity, or survivability threat means continuity credibility is no longer safe without executive action.'
}

function buildTrajectoryEvidence(input: CGITrajectoryInput): string {
  return [
    `Condition: ${input.continuityCondition}.`,
    `Confidence: ${input.continuityConfidence}.`,
    `Survivability pressure: ${input.survivabilityPressure}.`,
    `Recovery credibility: ${input.recoveryCredibility}.`,
    `Recurrence severity: ${input.recurrenceSeverity}.`,
    `Open cases: ${input.openCases}.`,
    `Escalated cases: ${input.escalatedCases}.`,
    `Repeated instability: ${input.repeatedInstabilityCount}.`,
    `Recovery failures: ${input.recoveryFailures}.`,
    `Verified recoveries: ${input.verifiedRecoveries}.`,
    `Coordination issues: ${input.coordinationIssues}.`,
    `Cross-site signals: ${input.crossSiteSignals ?? 0}.`,
  ].join(' ')
}

function buildTrajectoryRisk(
  trajectory: CGIContinuityTrajectory
): string {
  if (trajectory === 'CONTINUITY_IMPROVING') {
    return 'The main risk is premature confidence if monitoring stops too early.'
  }

  if (trajectory === 'CONTINUITY_HOLDING') {
    return 'The main risk is stagnation: continuity may appear stable while not actually strengthening.'
  }

  if (trajectory === 'CONTINUITY_DEGRADING') {
    return 'The main risk is that weakening continuity becomes normalized before leadership intervenes.'
  }

  if (trajectory === 'CONTINUITY_AT_RISK') {
    return 'The main risk is that a local instability becomes an enterprise continuity pattern.'
  }

  return 'The main risk is loss of continuity credibility, executive control, and institutional readiness.'
}

function buildTrajectoryRecommendation(
  trajectory: CGIContinuityTrajectory
): string {
  if (trajectory === 'CONTINUITY_IMPROVING') {
    return 'Continue verification, preserve memory, and avoid closing visibility before durability is proven over time.'
  }

  if (trajectory === 'CONTINUITY_HOLDING') {
    return 'Maintain watch, strengthen evidence, and look for signs of recurrence, delay, or coordination weakness.'
  }

  if (trajectory === 'CONTINUITY_DEGRADING') {
    return 'Move to command review, assign ownership, verify recovery evidence, and reduce recurring pressure.'
  }

  if (trajectory === 'CONTINUITY_AT_RISK') {
    return 'Escalate to coordination and cross-site review to determine whether the pattern is isolated or distributed.'
  }

  return 'Require executive intervention, command ownership, audit preservation, and immediate continuity protection.'
}

function buildExecutiveMeaning(
  trajectory: CGIContinuityTrajectory
): string {
  if (trajectory === 'CONTINUITY_IMPROVING') {
    return 'Leadership can cautiously trust the direction, but must preserve evidence until stability is durable.'
  }

  if (trajectory === 'CONTINUITY_HOLDING') {
    return 'Leadership should not overreact, but should not assume continuity is strengthening.'
  }

  if (trajectory === 'CONTINUITY_DEGRADING') {
    return 'Leadership should treat this as early warning that continuity credibility is weakening.'
  }

  if (trajectory === 'CONTINUITY_AT_RISK') {
    return 'Leadership should treat this as a possible enterprise pattern, not merely an isolated case.'
  }

  return 'Leadership must treat this as a continuity threat requiring immediate ownership and visible control.'
}

function buildCommanderQuestion(
  trajectory: CGIContinuityTrajectory
): string {
  if (trajectory === 'CONTINUITY_IMPROVING') {
    return 'Can we prove this improvement will hold under pressure?'
  }

  if (trajectory === 'CONTINUITY_HOLDING') {
    return 'Are we stable, or are we simply not seeing the next failure yet?'
  }

  if (trajectory === 'CONTINUITY_DEGRADING') {
    return 'What is weakening, and who owns the correction before it spreads?'
  }

  if (trajectory === 'CONTINUITY_AT_RISK') {
    return 'Is this still a local problem, or is it becoming an organizational pattern?'
  }

  return 'What must leadership do now to protect continuity before readiness is compromised?'
}

function buildWatchNext(
  trajectory: CGIContinuityTrajectory
): string {
  if (trajectory === 'CONTINUITY_IMPROVING') {
    return 'Watch for reburn, recurrence, premature closure, and evidence gaps.'
  }

  if (trajectory === 'CONTINUITY_HOLDING') {
    return 'Watch for delays, repeated strain, weak recovery evidence, and unresolved ownership.'
  }

  if (trajectory === 'CONTINUITY_DEGRADING') {
    return 'Watch recurrence count, recovery failures, unresolved duration, and coordination pressure.'
  }

  if (trajectory === 'CONTINUITY_AT_RISK') {
    return 'Watch cross-site concentration, structural recurrence, command reviews, and audit gaps.'
  }

  return 'Watch unresolved critical pressure, survivability exposure, command ownership, and immediate mitigation evidence.'
}

export function buildCGIContinuityTrajectory(
  input: CGITrajectoryInput
): CGITrajectoryOutput {
  const trajectory = deriveTrajectory(input)
  const momentum = deriveMomentum(trajectory, input)

  return {
    trajectory,
    momentum,
    trajectoryDirection: buildTrajectoryDirection(trajectory),
    trajectoryExplanation: buildTrajectoryExplanation(trajectory, input),
    trajectoryEvidence: buildTrajectoryEvidence(input),
    trajectoryRisk: buildTrajectoryRisk(trajectory),
    trajectoryRecommendation: buildTrajectoryRecommendation(trajectory),
    executiveMeaning: buildExecutiveMeaning(trajectory),
    commanderQuestion: buildCommanderQuestion(trajectory),
    watchNext: buildWatchNext(trajectory),
  }
}