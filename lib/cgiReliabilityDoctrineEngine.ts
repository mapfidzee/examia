import { buildAuditDoctrine } from './cgiAuditDoctrineEngine'
import { buildContinuityDerivationStandard } from './cgiContinuityDerivationStandard'
import { buildContinuityTrustAssessment } from './cgiContinuityTrustEngine'
import type {
  ContinuityTrustAssessment,
  ContinuityTrustInput,
} from './cgiContinuityTrustEngine'
import { buildInstitutionalMemoryDoctrine } from './cgiInstitutionalMemoryDoctrineEngine'

export type CGIReliabilityMetric = {
  id: string
  created_at: string
  scope: string
  continuity_state: string
  pressure_propagation_state: string
  trajectory_direction: string
  structural_memory_state: string
  continuity_integrity_score: number
  stabilization_confidence_score: number
  escalation_pressure_index: number
  recovery_reliability_score: number
  operational_survivability_score: number
  propagation_risk: number
  trajectory_risk: number
  structural_memory_risk: number
  unresolved_momentum: number
  stabilization_drag: number
  continuity_drift: number
  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
}

export type CGIReliabilityDoctrineReading = {
  latest: CGIReliabilityMetric | null
  reliabilityQuestion: string
  reliabilityConclusion: string
  reliabilityThesis: string
  trustInput: ContinuityTrustInput
  trustAssessment: ContinuityTrustAssessment
  continuityStandard: {
    whatIsVisible: string
    whyItMatters: string
    continuityRisk: string
    requiredMovement: string
    trustLevel: string
    institutionalMeaning: string
  }
  memoryDoctrine: ReturnType<typeof buildInstitutionalMemoryDoctrine>
  auditDoctrine: ReturnType<typeof buildAuditDoctrine>
  scores: {
    reliability: number
    survivability: number
    continuity: number
    pressure: number
    trajectory: number
    memoryRisk: number
    drift: number
    unresolved: number
    volatility: number
    recurrenceRate: number
    failedRecoveries: number
    unresolvedCases: number
    overdueCases: number
    recordCount: number
  }
  evidenceRequirement: string
  commandImplication: string
  executiveReportImplication: string
  memoryBoardImplication: string
  auditImplication: string
  copyReadyBrief: string
}

export function buildCGIReliabilityDoctrine(
  metrics: CGIReliabilityMetric[],
): CGIReliabilityDoctrineReading {
  const ordered = [...metrics].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const latest = ordered.length > 0 ? ordered[ordered.length - 1] : null

  const reliability = average(ordered.map((m) => m.recovery_reliability_score))
  const survivability = average(
    ordered.map((m) => m.operational_survivability_score),
  )
  const continuity = average(ordered.map((m) => m.continuity_integrity_score))
  const pressure = average(ordered.map((m) => m.escalation_pressure_index))
  const memoryRisk = average(ordered.map((m) => m.structural_memory_risk))
  const drift = average(ordered.map((m) => m.continuity_drift))
  const unresolved = average(ordered.map((m) => m.unresolved_momentum))
  const trajectory = average(ordered.map((m) => m.trajectory_risk))
  const volatility = Math.round(Math.abs(reliability - continuity))

  const recurrenceRate =
    memoryRisk >= 70 ? 4 : memoryRisk >= 50 ? 3 : memoryRisk >= 30 ? 2 : 1

  const failedRecoveries = reliability < 40 ? 4 : reliability < 60 ? 2 : 0
  const unresolvedCases = unresolved >= 60 ? 6 : unresolved >= 40 ? 3 : 1
  const overdueCases = pressure >= 60 ? 5 : pressure >= 40 ? 2 : 0

  const trustInput: ContinuityTrustInput = {
    activeInstability: unresolvedCases + overdueCases,
    recoveryRecords: ordered.length,
    fragileRecovery: failedRecoveries,
    commandPressure: pressure >= 60 || failedRecoveries >= 4 ? 1 : 0,
    evidenceReturn: ordered.length < 3 || reliability < 65 ? 1 : 0,
    absorbable:
      ordered.length >= 3 &&
      reliability >= 75 &&
      survivability >= 70 &&
      continuity >= 70 &&
      failedRecoveries === 0 &&
      memoryRisk < 45
        ? 1
        : 0,
    historicalMemory: ordered.length,
    recurrenceVisible: recurrenceRate >= 3 ? 1 : 0,
    coordinationPressure: unresolved >= 55 ? 1 : 0,
    crossSitePressure: memoryRisk >= 70 || drift >= 60 ? 2 : 0,
    auditPressure: ordered.length < 3 || reliability < 65 ? 1 : 0,
    safeguardingVisible: survivability < 45 ? 1 : 0,
    posture: deriveReliabilityPostureLabel({
      recordCount: ordered.length,
      reliability,
      survivability,
      continuity,
      failedRecoveries,
      recurrenceRate,
      memoryRisk,
      drift,
      unresolved,
      volatility,
    }),
  }

  const trustAssessment = buildContinuityTrustAssessment(trustInput)

  const derivation = buildContinuityDerivationStandard({
    ...trustInput,
    visibleSignal: deriveReliabilityVisibleSignal({
      recordCount: ordered.length,
      reliability,
      survivability,
      failedRecoveries,
      recurrenceRate,
      memoryRisk,
      drift,
    }),
    stage: 'Enterprise Reliability',
    posture: String(trustInput.posture),
    currentMeaning: trustAssessment.institutionalMeaning,
    nextMovement: trustAssessment.executiveDecision,
  })

  const continuityStandard = {
    whatIsVisible: derivation.whatIsVisible,
    whyItMatters: derivation.whyItMatters,
    continuityRisk: derivation.continuityRisk,
    requiredMovement: derivation.requiredMovement,
    trustLevel: derivation.trustLevel,
    institutionalMeaning: derivation.institutionalMeaning,
  }

  const memoryDoctrine = buildInstitutionalMemoryDoctrine({
    historicalRecords: ordered.length,
    recurringInstabilityCount: recurrenceRate >= 3 ? recurrenceRate : 0,
    recoveryFailureCount: failedRecoveries,
    verifiedRecoveryCount:
      reliability >= 70 && survivability >= 70 && continuity >= 70 ? 1 : 0,
    commandInterventionCount: trustInput.commandPressure,
    coordinationIssueCount: trustInput.coordinationPressure,
    crossSiteSignalCount: trustInput.crossSitePressure,
    executiveReviewCount: trustAssessment.trustLevel === 'HIGH' ? 0 : 1,
    auditReconstructionCount: ordered.length > 0 ? 1 : 0,
    survivabilityThreatCount: survivability < 45 ? 1 : 0,
    unresolvedMemoryGaps: ordered.length < 3 ? 1 : 0,
    lastKnownPattern: latest?.dominant_memory_pattern || undefined,
    memoryPosture: String(trustInput.posture),
    dominantMemoryDomain: 'RECOVERY',
  })

  const auditDoctrine = buildAuditDoctrine({
    total: ordered.length,
    critical: trustAssessment.trustLevel === 'WITHHELD' ? 1 : 0,
    high: trustAssessment.trustLevel === 'LOW' ? 1 : 0,
    governanceActions: ordered.length > 0 ? 1 : 0,
    uniqueActors: 1,
    institutionScoped: ordered.length,
    immutableRecords: ordered.length,
    visibilityClassified: ordered.length,
    linkedSnapshots: ordered.length,
    legacyEvidence: ordered.length < 3 ? ordered.length : 0,
    hardenedEvidence: ordered.length >= 3 ? ordered.length : 0,
    executiveReconstructable: ordered.length >= 3 ? 1 : 0,
    activeChainStages: ordered.length > 0 ? 6 : 0,
    missingChainStages: ordered.length >= 3 ? 0 : 3,
    auditLinkVisible: ordered.length > 0,
    executiveLinkVisible: trustAssessment.trustLevel !== 'NOT_APPLICABLE',
    memoryBoardLinkVisible: ordered.length >= 3,
  })

  const reliabilityQuestion =
    'Can the institution stabilize repeatedly under pressure?'

  const reliabilityConclusion = trustAssessment.ceoSentence

  const reliabilityThesis = deriveReliabilityThesis({
    recordCount: ordered.length,
    trustAssessment,
  })

  const scores = {
    reliability,
    survivability,
    continuity,
    pressure,
    trajectory,
    memoryRisk,
    drift,
    unresolved,
    volatility,
    recurrenceRate,
    failedRecoveries,
    unresolvedCases,
    overdueCases,
    recordCount: ordered.length,
  }

  const evidenceRequirement = deriveEvidenceRequirement({
    orderedLength: ordered.length,
    reliability,
    failedRecoveries,
    trustAssessment,
  })

  const commandImplication = deriveCommandImplication(trustAssessment)
  const executiveReportImplication = deriveExecutiveReportImplication(
    trustAssessment,
  )
  const memoryBoardImplication = memoryDoctrine.requiredMovement
  const auditImplication = auditDoctrine.evidenceGap

  const copyReadyBrief = buildReliabilityBrief({
    reliabilityQuestion,
    reliabilityConclusion,
    reliabilityThesis,
    trustAssessment,
    continuityStandard,
    memoryDoctrine,
    auditDoctrine,
    scores,
    evidenceRequirement,
    commandImplication,
    executiveReportImplication,
    memoryBoardImplication,
    auditImplication,
  })

  return {
    latest,
    reliabilityQuestion,
    reliabilityConclusion,
    reliabilityThesis,
    trustInput,
    trustAssessment,
    continuityStandard,
    memoryDoctrine,
    auditDoctrine,
    scores,
    evidenceRequirement,
    commandImplication,
    executiveReportImplication,
    memoryBoardImplication,
    auditImplication,
    copyReadyBrief,
  }
}

function deriveReliabilityPostureLabel(input: {
  recordCount: number
  reliability: number
  survivability: number
  continuity: number
  failedRecoveries: number
  recurrenceRate: number
  memoryRisk: number
  drift: number
  unresolved: number
  volatility: number
}) {
  if (input.recordCount < 3) return 'INSUFFICIENT RELIABILITY MEMORY'

  if (
    input.reliability < 35 ||
    input.survivability < 35 ||
    input.failedRecoveries >= 4
  ) {
    return 'RELIABILITY COLLAPSING'
  }

  if (
    input.reliability < 50 ||
    input.survivability < 45 ||
    input.continuity < 45 ||
    input.recurrenceRate >= 4
  ) {
    return 'RELIABILITY DETERIORATING'
  }

  if (
    input.reliability < 65 ||
    input.memoryRisk >= 60 ||
    input.drift >= 55 ||
    input.unresolved >= 55 ||
    input.volatility >= 30
  ) {
    return 'RELIABILITY FRAGILE'
  }

  if (
    input.reliability >= 75 &&
    input.survivability >= 70 &&
    input.continuity >= 70 &&
    input.recurrenceRate <= 2 &&
    input.memoryRisk < 45
  ) {
    return 'RELIABILITY PROVEN'
  }

  return 'RELIABILITY EMERGING'
}

function deriveReliabilityVisibleSignal(input: {
  recordCount: number
  reliability: number
  survivability: number
  failedRecoveries: number
  recurrenceRate: number
  memoryRisk: number
  drift: number
}) {
  if (input.recordCount < 3) return 'Insufficient reliability memory'
  if (input.failedRecoveries >= 4) return 'Repeated recovery failure'
  if (input.recurrenceRate >= 4) return 'Recurring instability pattern'
  if (input.survivability < 45) return 'Reliability survivability weakness'
  if (input.memoryRisk >= 60) return 'Structural memory pressure'
  if (input.drift >= 55) return 'Continuity drift'
  if (input.reliability >= 75) return 'Repeatable stabilization signal'
  return 'Reliability still forming under observation'
}

function deriveReliabilityThesis(input: {
  recordCount: number
  trustAssessment: ContinuityTrustAssessment
}) {
  if (input.recordCount < 3) return 'BUILD MEMORY BEFORE TRUST'

  if (input.trustAssessment.trustLevel === 'WITHHELD') {
    return 'DO NOT TRUST RELIABILITY'
  }

  if (input.trustAssessment.trustLevel === 'LOW') {
    return 'DO NOT DECLARE RELIABILITY YET'
  }

  if (input.trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'CONDITIONALLY TRUST RELIABILITY'
  }

  return 'RELIABILITY CAN BE TRUSTED WITH MEMORY PRESERVED'
}

function deriveEvidenceRequirement(input: {
  orderedLength: number
  reliability: number
  failedRecoveries: number
  trustAssessment: ContinuityTrustAssessment
}) {
  if (input.orderedLength < 3) {
    return 'Continue saving reliability snapshots before making a reliability claim.'
  }

  if (input.failedRecoveries > 0 || input.reliability < 65) {
    return 'Require durability evidence before reliability is treated as dependable.'
  }

  return input.trustAssessment.trustMeaning
}

function deriveCommandImplication(trustAssessment: ContinuityTrustAssessment) {
  if (
    trustAssessment.trustLevel === 'WITHHELD' ||
    trustAssessment.trustLevel === 'LOW'
  ) {
    return 'Command should hold reliability visibility until repeatability is proven.'
  }

  if (trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'Command may reduce posture cautiously with evidence and memory preserved.'
  }

  return 'Command can release cautiously while preserving reliability memory.'
}

function deriveExecutiveReportImplication(
  trustAssessment: ContinuityTrustAssessment,
) {
  if (
    trustAssessment.trustLevel === 'WITHHELD' ||
    trustAssessment.trustLevel === 'LOW'
  ) {
    return 'Executive Report should not conclude durable reliability.'
  }

  if (trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'Executive Report should state reliability is conditional.'
  }

  return 'Executive Report may state repeatable stabilization is currently credible.'
}

function buildReliabilityBrief(input: {
  reliabilityQuestion: string
  reliabilityConclusion: string
  reliabilityThesis: string
  trustAssessment: ContinuityTrustAssessment
  continuityStandard: {
    whatIsVisible: string
    whyItMatters: string
    continuityRisk: string
    requiredMovement: string
    trustLevel: string
    institutionalMeaning: string
  }
  memoryDoctrine: ReturnType<typeof buildInstitutionalMemoryDoctrine>
  auditDoctrine: ReturnType<typeof buildAuditDoctrine>
  scores: CGIReliabilityDoctrineReading['scores']
  evidenceRequirement: string
  commandImplication: string
  executiveReportImplication: string
  memoryBoardImplication: string
  auditImplication: string
}) {
  return [
    'TSINAXA CGI ENTERPRISE RELIABILITY BRIEF',
    '',
    `Reliability Question: ${input.reliabilityQuestion}`,
    '',
    `Reliability Thesis: ${input.reliabilityThesis}`,
    '',
    `Reliability Conclusion: ${input.reliabilityConclusion}`,
    '',
    `Trust Reading: ${input.trustAssessment.trustReading}`,
    '',
    `Trust Level: ${input.trustAssessment.trustLevel}`,
    '',
    `Trust Meaning: ${input.trustAssessment.trustMeaning}`,
    '',
    `What Is Visible: ${input.continuityStandard.whatIsVisible}`,
    '',
    `Why It Matters: ${input.continuityStandard.whyItMatters}`,
    '',
    `Continuity Risk: ${input.continuityStandard.continuityRisk}`,
    '',
    `Required Movement: ${input.continuityStandard.requiredMovement}`,
    '',
    `Institutional Meaning: ${input.continuityStandard.institutionalMeaning}`,
    '',
    `Memory Doctrine Reading: ${input.memoryDoctrine.trustReading}`,
    '',
    `Memory Doctrine Movement: ${input.memoryDoctrine.requiredMovement}`,
    '',
    `Audit Credibility: ${input.auditDoctrine.auditCredibility}`,
    '',
    `Audit Evidence Gap: ${input.auditDoctrine.evidenceGap}`,
    '',
    `Evidence Requirement: ${input.evidenceRequirement}`,
    '',
    `Command Implication: ${input.commandImplication}`,
    '',
    `Executive Report Implication: ${input.executiveReportImplication}`,
    '',
    `Memory Board Implication: ${input.memoryBoardImplication}`,
    '',
    `Audit Implication: ${input.auditImplication}`,
    '',
    `Reliability Score: ${input.scores.reliability}`,
    '',
    `Survivability Score: ${input.scores.survivability}`,
    '',
    `Continuity Score: ${input.scores.continuity}`,
    '',
    `Memory Risk: ${input.scores.memoryRisk}`,
    '',
    `Record Count: ${input.scores.recordCount}`,
  ].join('\n')
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))
  if (valid.length === 0) return 0

  return Math.round(
    valid.reduce((sum, value) => sum + value, 0) / valid.length,
  )
}