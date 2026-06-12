export type CGIExecutiveConfidenceLevel =
  | 'HIGH'
  | 'MODERATE'
  | 'LOW'
  | 'INSUFFICIENT'

export type CGIExecutiveConfidenceInput = {
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
  chainConfidence?: string
  deltaConfidence?: string
  recommendationPosture?: string
  recommendationUrgency?: string
  actionEscalationRule?: string
  riskLevel?: string
  riskTrend?: string
}

export type CGIExecutiveConfidenceReading = {
  confidenceScore: number
  confidenceLevel: CGIExecutiveConfidenceLevel
  dataSufficiency: string
  evidenceConfidence: string
  memoryCoverage: string
  recoveryConfidence: string
  recommendationConfidence: string
  conclusionConfidence: string
  confidenceRationale: string
  confidenceGaps: string[]
  boardSentence: string
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function deriveConfidenceLevel(score: number): CGIExecutiveConfidenceLevel {
  if (score >= 82) return 'HIGH'
  if (score >= 62) return 'MODERATE'
  if (score >= 40) return 'LOW'
  return 'INSUFFICIENT'
}

function scoreFromText(value: string | undefined) {
  if (!value) return 0

  if (value.includes('HIGH')) return 14
  if (value.includes('MODERATE')) return 8
  if (value.includes('LOW')) return -6
  if (value.includes('INSUFFICIENT')) return -12

  return 0
}

function deriveDataSufficiency(input: CGIExecutiveConfidenceInput) {
  if (
    input.activeInstability === 0 &&
    input.commandPressure === 0 &&
    input.recoveryRecords === 0 &&
    input.historicalMemory === 0
  ) {
    return 'LIMITED_CURRENT_DATA'
  }

  if (input.historicalMemory > 0 || input.recoveryRecords > 0) {
    return 'SUFFICIENT_FOR_EXECUTIVE_READING'
  }

  if (input.activeInstability > 0 || input.commandPressure > 0) {
    return 'CURRENT_DATA_VISIBLE_HISTORY_LIMITED'
  }

  return 'PARTIAL_DATA'
}

function deriveEvidenceConfidence(input: CGIExecutiveConfidenceInput) {
  if (input.evidenceReturn > 0 || input.auditPressure > 0) {
    return 'EVIDENCE_CONFIDENCE_REDUCED'
  }

  if (input.commandPressure > 0 || input.activeInstability > 0) {
    return 'EVIDENCE_CONFIDENCE_CONDITIONAL'
  }

  return 'EVIDENCE_CONFIDENCE_STABLE'
}

function deriveMemoryCoverage(input: CGIExecutiveConfidenceInput) {
  if (input.historicalMemory >= 3) return 'MEMORY_COVERAGE_STRONG'
  if (input.historicalMemory > 0) return 'MEMORY_COVERAGE_PRESENT'
  if (input.recoveryRecords > 0) return 'MEMORY_COVERAGE_RECOVERY_ONLY'
  return 'MEMORY_COVERAGE_LIMITED'
}

function deriveRecoveryConfidence(input: CGIExecutiveConfidenceInput) {
  if (input.fragileRecovery > 0 || input.recurrenceVisible > 0) {
    return 'RECOVERY_CONFIDENCE_FRAGILE'
  }

  if (input.recoveryRecords > 0) {
    return 'RECOVERY_CONFIDENCE_VISIBLE'
  }

  return 'RECOVERY_CONFIDENCE_NOT_CURRENTLY_TESTED'
}

function deriveRecommendationConfidence(input: CGIExecutiveConfidenceInput) {
  if (
    input.recommendationUrgency === 'IMMEDIATE' ||
    input.riskLevel === 'CRITICAL'
  ) {
    return 'RECOMMENDATION_CONFIDENCE_HIGH_URGENCY'
  }

  if (
    input.recommendationPosture === 'EXECUTIVE_ACTION_REQUIRED' ||
    input.recommendationPosture === 'COMMAND_WATCH_REQUIRED'
  ) {
    return 'RECOMMENDATION_CONFIDENCE_ACTIONABLE'
  }

  if (
    input.recommendationPosture === 'GOVERNED_MONITORING' ||
    input.recommendationPosture === 'MAINTAIN_STABILITY'
  ) {
    return 'RECOMMENDATION_CONFIDENCE_STABLE'
  }

  return 'RECOMMENDATION_CONFIDENCE_PARTIAL'
}

function deriveConclusionConfidence(input: CGIExecutiveConfidenceInput) {
  if (
    input.riskLevel === 'CRITICAL' ||
    input.riskTrend === 'ESCALATING' ||
    input.safeguardingVisible > 0
  ) {
    return 'CONCLUSION_CONFIDENCE_REQUIRES_PROTECTION'
  }

  if (
    input.auditPressure > 0 ||
    input.evidenceReturn > 0 ||
    input.deltaConfidence === 'LOW'
  ) {
    return 'CONCLUSION_CONFIDENCE_CONDITIONAL'
  }

  if (
    input.chainConfidence?.includes('HIGH') ||
    input.deltaConfidence === 'HIGH'
  ) {
    return 'CONCLUSION_CONFIDENCE_STRONG'
  }

  return 'CONCLUSION_CONFIDENCE_MODERATE'
}

function buildConfidenceGaps(input: CGIExecutiveConfidenceInput) {
  const gaps: string[] = []

  if (!input.chainConfidence) {
    gaps.push('chain confidence not explicitly available')
  }

  if (!input.deltaConfidence || input.deltaConfidence === 'LOW') {
    gaps.push('delta confidence is limited')
  }

  if (input.historicalMemory === 0) {
    gaps.push('historical memory coverage is limited')
  }

  if (input.recoveryRecords === 0) {
    gaps.push('recovery durability evidence is not currently active')
  }

  if (input.auditPressure > 0 || input.evidenceReturn > 0) {
    gaps.push('audit or evidence pressure remains active')
  }

  if (input.fragileRecovery > 0 || input.recurrenceVisible > 0) {
    gaps.push('recovery fragility or recurrence remains visible')
  }

  if (gaps.length === 0) {
    gaps.push('no material confidence gap currently visible')
  }

  return gaps
}

function deriveConfidenceScore(input: CGIExecutiveConfidenceInput) {
  let score = 64

  score += scoreFromText(input.chainConfidence)
  score += scoreFromText(input.deltaConfidence)

  if (input.historicalMemory > 0) score += 8
  if (input.historicalMemory >= 3) score += 6
  if (input.recoveryRecords > 0) score += 6

  if (input.evidenceReturn > 0) score -= 10
  if (input.auditPressure > 0) score -= 8
  if (input.fragileRecovery > 0) score -= 9
  if (input.recurrenceVisible > 0) score -= 10
  if (input.commandPressure > 0) score -= 6
  if (input.coordinationPressure > 0) score -= 5
  if (input.crossSitePressure > 0) score -= 6
  if (input.safeguardingVisible > 0) score -= 8

  if (input.riskLevel === 'LOW') score += 8
  if (input.riskLevel === 'MODERATE') score -= 2
  if (input.riskLevel === 'HIGH') score -= 9
  if (input.riskLevel === 'CRITICAL') score -= 16

  if (input.recommendationPosture === 'MAINTAIN_STABILITY') score += 8
  if (input.recommendationPosture === 'GOVERNED_MONITORING') score += 3
  if (input.recommendationPosture === 'EXECUTIVE_ACTION_REQUIRED') score -= 10

  return clampScore(score)
}

export function buildCGIExecutiveConfidenceReading(
  input: CGIExecutiveConfidenceInput,
): CGIExecutiveConfidenceReading {
  const confidenceScore = deriveConfidenceScore(input)
  const confidenceLevel = deriveConfidenceLevel(confidenceScore)
  const dataSufficiency = deriveDataSufficiency(input)
  const evidenceConfidence = deriveEvidenceConfidence(input)
  const memoryCoverage = deriveMemoryCoverage(input)
  const recoveryConfidence = deriveRecoveryConfidence(input)
  const recommendationConfidence = deriveRecommendationConfidence(input)
  const conclusionConfidence = deriveConclusionConfidence(input)
  const confidenceGaps = buildConfidenceGaps(input)

  const confidenceRationale =
    confidenceLevel === 'HIGH'
      ? 'The executive reading is strongly supported by available continuity, memory, evidence, and risk signals.'
      : confidenceLevel === 'MODERATE'
        ? 'The executive reading is usable, but leadership should preserve evidence and continue comparison across future readings.'
        : confidenceLevel === 'LOW'
          ? 'The executive reading is directionally useful but should not be treated as fully settled without stronger evidence, memory, or recovery confirmation.'
          : 'The executive reading is insufficiently supported for confident executive reliance.'

  const boardSentence =
    confidenceLevel === 'HIGH'
      ? `Executive confidence is ${confidenceScore}%. Leadership can rely on this reading while preserving audit memory.`
      : confidenceLevel === 'MODERATE'
        ? `Executive confidence is ${confidenceScore}%. The reading is usable, but continued monitoring remains necessary.`
        : confidenceLevel === 'LOW'
          ? `Executive confidence is ${confidenceScore}%. Treat the reading as provisional until gaps are resolved.`
          : `Executive confidence is ${confidenceScore}%. Do not treat this reading as settled.`

  return {
    confidenceScore,
    confidenceLevel,
    dataSufficiency,
    evidenceConfidence,
    memoryCoverage,
    recoveryConfidence,
    recommendationConfidence,
    conclusionConfidence,
    confidenceRationale,
    confidenceGaps,
    boardSentence,
  }
}