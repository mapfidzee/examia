export type CGIExecutiveRiskLevel =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'

export type CGIExecutiveRiskTrend =
  | 'CONTAINED'
  | 'WATCH'
  | 'ESCALATING'
  | 'UNKNOWN'

export type CGIExecutiveRiskInput = {
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
  deltaDirection?: string
  deltaConfidence?: string
  recommendationPosture?: string
  recommendationUrgency?: string
  actionEscalationRule?: string
  topThreat?: string
}

export type CGIExecutiveRiskReading = {
  riskLevel: CGIExecutiveRiskLevel
  riskTrend: CGIExecutiveRiskTrend
  topRisk: string
  probability: string
  impact: string
  survivabilityRisk: string
  coordinationRisk: string
  recurrenceRisk: string
  evidenceRisk: string
  riskRationale: string
  protectionMove: string
  boardSentence: string
}

function deriveRiskScore(input: CGIExecutiveRiskInput) {
  return (
    input.activeInstability * 2 +
    input.commandPressure * 3 +
    input.fragileRecovery * 2 +
    input.recurrenceVisible * 3 +
    input.coordinationPressure * 2 +
    input.crossSitePressure * 3 +
    input.auditPressure * 2 +
    input.safeguardingVisible * 4 +
    input.evidenceReturn * 2
  )
}

function deriveRiskLevel(score: number): CGIExecutiveRiskLevel {
  if (score >= 22) return 'CRITICAL'
  if (score >= 14) return 'HIGH'
  if (score >= 6) return 'MODERATE'
  return 'LOW'
}

function deriveRiskTrend(input: CGIExecutiveRiskInput): CGIExecutiveRiskTrend {
  if (!input.deltaDirection || input.deltaDirection === 'INSUFFICIENT_HISTORY') {
    return 'UNKNOWN'
  }

  if (
    input.deltaDirection === 'DEGRADING' ||
    input.recommendationUrgency === 'IMMEDIATE'
  ) {
    return 'ESCALATING'
  }

  if (
    input.deltaDirection === 'WATCH' ||
    input.recommendationPosture === 'COMMAND_WATCH_REQUIRED'
  ) {
    return 'WATCH'
  }

  return 'CONTAINED'
}

function deriveTopRisk(input: CGIExecutiveRiskInput) {
  const risks = [
    {
      label: 'Safeguarding-visible continuity failure',
      value: input.safeguardingVisible * 4,
    },
    {
      label: 'Command pressure without accountable resolution',
      value: input.commandPressure * 3,
    },
    {
      label: 'Cross-site instability spread',
      value: input.crossSitePressure * 3,
    },
    {
      label: 'Recurrence after apparent stabilization',
      value: input.recurrenceVisible * 3,
    },
    {
      label: 'Fragile recovery collapse',
      value: input.fragileRecovery * 2,
    },
    {
      label: 'Coordination or ownership drift',
      value: input.coordinationPressure * 2,
    },
    {
      label: 'Evidence failure weakening executive confidence',
      value: input.evidenceReturn * 2 + input.auditPressure * 2,
    },
    {
      label: 'Active instability persistence',
      value: input.activeInstability * 2,
    },
  ]

  const top = risks.sort((a, b) => b.value - a.value)[0]

  if (!top || top.value <= 0) {
    return input.topThreat || 'No dominant executive risk currently visible'
  }

  return top.label
}

function deriveProbability(level: CGIExecutiveRiskLevel, trend: CGIExecutiveRiskTrend) {
  if (level === 'CRITICAL') return 'HIGH'
  if (level === 'HIGH' && trend === 'ESCALATING') return 'HIGH'
  if (level === 'HIGH') return 'MODERATE_TO_HIGH'
  if (level === 'MODERATE') return 'MODERATE'
  if (trend === 'UNKNOWN') return 'UNKNOWN'
  return 'LOW'
}

function deriveImpact(input: CGIExecutiveRiskInput, level: CGIExecutiveRiskLevel) {
  if (input.safeguardingVisible > 0) return 'HIGH_INSTITUTIONAL_CONSEQUENCE'
  if (input.crossSitePressure > 0) return 'ENTERPRISE_SPREAD_CONSEQUENCE'
  if (input.commandPressure > 0) return 'EXECUTIVE_ACCOUNTABILITY_CONSEQUENCE'
  if (level === 'LOW') return 'LOW_CURRENT_IMPACT'
  return 'CONTINUITY_CONFIDENCE_CONSEQUENCE'
}

function deriveSurvivabilityRisk(input: CGIExecutiveRiskInput) {
  if (
    input.safeguardingVisible > 0 ||
    input.commandPressure >= 5 ||
    input.crossSitePressure >= 2
  ) {
    return 'Survivability risk is high because executive visibility, distributed exposure, or protected continuity records could weaken institutional response capacity.'
  }

  if (
    input.recurrenceVisible > 0 ||
    input.fragileRecovery > 0 ||
    input.coordinationPressure > 0
  ) {
    return 'Survivability risk is moderate because recurrence, fragile recovery, or coordination drift could weaken stability if not governed.'
  }

  return 'Survivability risk is currently low, provided memory and monitoring remain intact.'
}

function deriveCoordinationRisk(input: CGIExecutiveRiskInput) {
  if (input.coordinationPressure > 0 || input.crossSitePressure > 0) {
    return 'Coordination risk is active because ownership, synchronization, or cross-site movement may affect continuity movement.'
  }

  return 'Coordination risk is currently contained.'
}

function deriveRecurrenceRisk(input: CGIExecutiveRiskInput) {
  if (input.recurrenceVisible > 0) {
    return 'Recurrence risk is active because instability has shown signs of returning or persisting.'
  }

  if (input.fragileRecovery > 0) {
    return 'Recurrence risk is watchlisted because recovery remains fragile.'
  }

  return 'Recurrence risk is currently low.'
}

function deriveEvidenceRisk(input: CGIExecutiveRiskInput) {
  if (input.evidenceReturn > 0 || input.auditPressure > 0) {
    return 'Evidence risk is active because executive confidence depends on audit-ready continuity proof.'
  }

  return 'Evidence risk is currently contained.'
}

function deriveProtectionMove(input: CGIExecutiveRiskInput) {
  if (input.safeguardingVisible > 0) {
    return 'Protect safeguarding-visible records, restrict language to governance-safe facts, and preserve auditability.'
  }

  if (input.crossSitePressure > 0) {
    return 'Run cross-site exposure review and confirm whether instability is isolated or distributed.'
  }

  if (input.commandPressure > 0) {
    return 'Hold command visibility and require accountable owner, deadline, and evidence.'
  }

  if (input.recurrenceVisible > 0 || input.fragileRecovery > 0) {
    return 'Continue recovery durability observation and require recurrence explanation before posture reduction.'
  }

  if (input.coordinationPressure > 0) {
    return 'Assign coordination owner and verify synchronization before movement proceeds.'
  }

  if (input.auditPressure > 0 || input.evidenceReturn > 0) {
    return 'Complete the audit-ready evidence chain before executive confidence is restored.'
  }

  return 'Maintain monitoring, preserve memory, and compare against the next executive reading.'
}

export function buildCGIExecutiveRiskReading(
  input: CGIExecutiveRiskInput,
): CGIExecutiveRiskReading {
  const score = deriveRiskScore(input)
  const riskLevel = deriveRiskLevel(score)
  const riskTrend = deriveRiskTrend(input)
  const topRisk = deriveTopRisk(input)
  const probability = deriveProbability(riskLevel, riskTrend)
  const impact = deriveImpact(input, riskLevel)
  const survivabilityRisk = deriveSurvivabilityRisk(input)
  const coordinationRisk = deriveCoordinationRisk(input)
  const recurrenceRisk = deriveRecurrenceRisk(input)
  const evidenceRisk = deriveEvidenceRisk(input)
  const protectionMove = deriveProtectionMove(input)

  const riskRationale =
    riskLevel === 'LOW'
      ? 'Current executive risk is low because no dominant active continuity threat is visible, but monitoring and memory remain necessary.'
      : `Executive risk is ${riskLevel.toLowerCase()} because ${topRisk.toLowerCase()} remains visible or could re-emerge.`

  const boardSentence =
    riskLevel === 'CRITICAL'
      ? `CRITICAL: ${topRisk} could materially weaken continuity survivability without immediate protection.`
      : riskLevel === 'HIGH'
        ? `HIGH: ${topRisk} requires executive protection before stability can be trusted.`
        : riskLevel === 'MODERATE'
          ? `MODERATE: ${topRisk} should remain under governed watch.`
          : 'LOW: no dominant executive risk is currently visible, but memory and monitoring should continue.'

  return {
    riskLevel,
    riskTrend,
    topRisk,
    probability,
    impact,
    survivabilityRisk,
    coordinationRisk,
    recurrenceRisk,
    evidenceRisk,
    riskRationale,
    protectionMove,
    boardSentence,
  }
}