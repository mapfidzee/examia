export type CGIExecutiveRecommendationUrgency =
  | 'IMMEDIATE'
  | 'WITHIN_24_HOURS'
  | 'WITHIN_72_HOURS'
  | 'ROUTINE_REVIEW'

export type CGIExecutiveRecommendationPosture =
  | 'EXECUTIVE_ACTION_REQUIRED'
  | 'COMMAND_WATCH_REQUIRED'
  | 'GOVERNED_MONITORING'
  | 'MAINTAIN_STABILITY'

export type CGIExecutiveRecommendationInput = {
  activeInstability: number
  commandPressure: number
  recoveryRecords: number
  fragileRecovery: number
  recurrenceVisible: number
  coordinationPressure: number
  crossSitePressure: number
  auditPressure: number
  safeguardingVisible: number
  evidenceReturn: number
  historicalMemory: number
  trustLevel?: string
  executiveDecision?: string
  currentReading?: string
  deltaDirection?: string
  deltaConfidence?: string
  topThreat?: string
}

export type CGIExecutiveRecommendationReading = {
  posture: CGIExecutiveRecommendationPosture
  urgency: CGIExecutiveRecommendationUrgency
  recommendation: string
  rationale: string
  consequenceOfDelay: string
  requiredOwner: string
  requiredEvidence: string
  nextExecutiveMove: string
  boardSentence: string
}

function hasCriticalExposure(input: CGIExecutiveRecommendationInput) {
  return (
    input.safeguardingVisible > 0 ||
    input.commandPressure >= 3 ||
    input.activeInstability >= 5 ||
    input.recurrenceVisible >= 2 ||
    input.crossSitePressure >= 2
  )
}

function hasGovernanceRisk(input: CGIExecutiveRecommendationInput) {
  return (
    input.auditPressure > 0 ||
    input.evidenceReturn > 0 ||
    input.fragileRecovery > 0 ||
    input.coordinationPressure > 0
  )
}

function derivePosture(
  input: CGIExecutiveRecommendationInput,
): CGIExecutiveRecommendationPosture {
  if (hasCriticalExposure(input)) return 'EXECUTIVE_ACTION_REQUIRED'

  if (hasGovernanceRisk(input)) return 'COMMAND_WATCH_REQUIRED'

  if (
    input.recoveryRecords > 0 ||
    input.historicalMemory > 0 ||
    input.deltaDirection === 'WATCH' ||
    input.deltaDirection === 'INSUFFICIENT_HISTORY'
  ) {
    return 'GOVERNED_MONITORING'
  }

  return 'MAINTAIN_STABILITY'
}

function deriveUrgency(
  posture: CGIExecutiveRecommendationPosture,
  input: CGIExecutiveRecommendationInput,
): CGIExecutiveRecommendationUrgency {
  if (
    input.safeguardingVisible > 0 ||
    input.commandPressure >= 5 ||
    input.activeInstability >= 8
  ) {
    return 'IMMEDIATE'
  }

  if (
    posture === 'EXECUTIVE_ACTION_REQUIRED' ||
    input.crossSitePressure > 0 ||
    input.recurrenceVisible > 0
  ) {
    return 'WITHIN_24_HOURS'
  }

  if (posture === 'COMMAND_WATCH_REQUIRED') return 'WITHIN_72_HOURS'

  return 'ROUTINE_REVIEW'
}

function deriveRequiredOwner(
  posture: CGIExecutiveRecommendationPosture,
  input: CGIExecutiveRecommendationInput,
) {
  if (input.safeguardingVisible > 0) return 'Governance Officer'
  if (input.crossSitePressure > 0) return 'Cross-Site Review Owner'
  if (input.coordinationPressure > 0) return 'Coordination Lead'
  if (posture === 'EXECUTIVE_ACTION_REQUIRED') return 'Command Administrator'
  if (posture === 'COMMAND_WATCH_REQUIRED') return 'Stabilization Owner'
  return 'Executive Center'
}

function deriveRequiredEvidence(input: CGIExecutiveRecommendationInput) {
  const evidence: string[] = []

  if (input.activeInstability > 0) {
    evidence.push('active instability status')
  }

  if (input.commandPressure > 0) {
    evidence.push('command pressure rationale')
  }

  if (input.recurrenceVisible > 0) {
    evidence.push('recurrence explanation')
  }

  if (input.crossSitePressure > 0) {
    evidence.push('cross-site exposure statement')
  }

  if (input.coordinationPressure > 0) {
    evidence.push('coordination ownership proof')
  }

  if (input.fragileRecovery > 0) {
    evidence.push('recovery durability evidence')
  }

  if (input.auditPressure > 0 || input.evidenceReturn > 0) {
    evidence.push('audit-ready evidence chain')
  }

  if (evidence.length === 0) {
    return 'Preserve current reading, monitoring note, and memory statement.'
  }

  return `Require ${evidence.join(', ')}.`
}

function deriveRecommendation(
  posture: CGIExecutiveRecommendationPosture,
  urgency: CGIExecutiveRecommendationUrgency,
  input: CGIExecutiveRecommendationInput,
) {
  if (posture === 'EXECUTIVE_ACTION_REQUIRED') {
    return urgency === 'IMMEDIATE'
      ? 'Issue immediate executive action, preserve command visibility, assign accountable ownership, and require evidence before any posture reduction.'
      : 'Maintain executive visibility, assign accountable ownership, and require evidence within the governed review window.'
  }

  if (posture === 'COMMAND_WATCH_REQUIRED') {
    return 'Keep the case under command watch until coordination, recovery, evidence, and audit concerns are resolved.'
  }

  if (posture === 'GOVERNED_MONITORING') {
    return 'Maintain governed monitoring and preserve institutional memory until movement over time is sufficiently verified.'
  }

  if (
    input.deltaDirection === 'IMPROVING' &&
    input.deltaConfidence === 'HIGH'
  ) {
    return 'Maintain stability posture while preserving the improvement evidence that made posture reduction credible.'
  }

  return 'Maintain stability posture with routine executive review and memory preservation.'
}

function deriveRationale(
  posture: CGIExecutiveRecommendationPosture,
  input: CGIExecutiveRecommendationInput,
) {
  if (posture === 'EXECUTIVE_ACTION_REQUIRED') {
    return `Executive action is required because ${
      input.topThreat || 'visible continuity pressure'
    } could weaken institutional stability if leadership visibility drops too early.`
  }

  if (posture === 'COMMAND_WATCH_REQUIRED') {
    return 'Command watch remains necessary because the system still carries governance, coordination, recovery, evidence, or audit pressure.'
  }

  if (posture === 'GOVERNED_MONITORING') {
    return 'Governed monitoring is appropriate because current posture does not require escalation, but movement over time still needs memory and verification.'
  }

  return 'The current reading supports stability maintenance because no dominant active executive threat is visible.'
}

function deriveConsequenceOfDelay(
  posture: CGIExecutiveRecommendationPosture,
  input: CGIExecutiveRecommendationInput,
) {
  if (posture === 'EXECUTIVE_ACTION_REQUIRED') {
    return 'Delay could allow visible instability to disappear without ownership, evidence, recovery confidence, or executive accountability.'
  }

  if (posture === 'COMMAND_WATCH_REQUIRED') {
    return 'Delay could convert manageable continuity pressure into recurrence, coordination drift, or weak recovery credibility.'
  }

  if (input.deltaDirection === 'INSUFFICIENT_HISTORY') {
    return 'Delay in building historical comparison could leave leadership unable to distinguish real stability from a temporary quiet period.'
  }

  return 'Delay risk is currently low, but memory loss could weaken future interpretation if today’s reading is not preserved.'
}

function deriveNextExecutiveMove(
  posture: CGIExecutiveRecommendationPosture,
  urgency: CGIExecutiveRecommendationUrgency,
) {
  if (posture === 'EXECUTIVE_ACTION_REQUIRED') {
    return urgency === 'IMMEDIATE'
      ? 'Escalate to Command and require executive evidence today.'
      : 'Place under executive review and confirm accountable owner.'
  }

  if (posture === 'COMMAND_WATCH_REQUIRED') {
    return 'Hold in Command Watch and verify evidence maturity.'
  }

  if (posture === 'GOVERNED_MONITORING') {
    return 'Continue monitoring through Executive Center and preserve memory.'
  }

  return 'Maintain stability and continue routine review.'
}

export function buildCGIExecutiveRecommendation(
  input: CGIExecutiveRecommendationInput,
): CGIExecutiveRecommendationReading {
  const posture = derivePosture(input)
  const urgency = deriveUrgency(posture, input)
  const requiredOwner = deriveRequiredOwner(posture, input)
  const requiredEvidence = deriveRequiredEvidence(input)
  const recommendation = deriveRecommendation(posture, urgency, input)
  const rationale = deriveRationale(posture, input)
  const consequenceOfDelay = deriveConsequenceOfDelay(posture, input)
  const nextExecutiveMove = deriveNextExecutiveMove(posture, urgency)

  const boardSentence =
    posture === 'EXECUTIVE_ACTION_REQUIRED'
      ? `${urgency}: leadership action is required because ${
          input.topThreat || 'visible continuity pressure'
        } remains executive-relevant.`
      : posture === 'COMMAND_WATCH_REQUIRED'
        ? `${urgency}: command watch should continue until evidence, ownership, and recovery credibility are verified.`
        : posture === 'GOVERNED_MONITORING'
          ? `${urgency}: governed monitoring is sufficient, but memory and movement over time must remain visible.`
          : `${urgency}: maintain stability posture and preserve the executive reading.`

  return {
    posture,
    urgency,
    recommendation,
    rationale,
    consequenceOfDelay,
    requiredOwner,
    requiredEvidence,
    nextExecutiveMove,
    boardSentence,
  }
}