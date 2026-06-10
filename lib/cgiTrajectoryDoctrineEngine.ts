import { buildAuditDoctrine } from './cgiAuditDoctrineEngine'
import { buildContinuityDerivationStandard } from './cgiContinuityDerivationStandard'
import { buildContinuityTrustAssessment } from './cgiContinuityTrustEngine'
import type {
  ContinuityTrustAssessment,
  ContinuityTrustInput,
} from './cgiContinuityTrustEngine'
import { buildInstitutionalMemoryDoctrine } from './cgiInstitutionalMemoryDoctrineEngine'

export type CGITrajectoryMetric = {
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

export type CGITrajectoryDoctrineReading = {
  latest: CGITrajectoryMetric | null
  trajectoryQuestion: string
  trajectoryConclusion: string
  trajectoryThesis: string
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
    trajectoryRisk: number
    continuityDrift: number
    unresolvedMomentum: number
    stabilizationDrag: number
    escalationPressure: number
    propagationRisk: number
    recoveryReliability: number
    survivability: number
    stabilizationConfidence: number
    continuityIntegrity: number
    directionVolatility: number
    recordCount: number
  }
  dominantTrajectorySignal: string
  evidenceRequirement: string
  commandImplication: string
  executiveReportImplication: string
  memoryBoardImplication: string
  auditImplication: string
  copyReadyBrief: string
}

export function buildCGITrajectoryDoctrine(
  metrics: CGITrajectoryMetric[],
): CGITrajectoryDoctrineReading {
  const ordered = [...metrics].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const latest = ordered.length > 0 ? ordered[ordered.length - 1] : null

  const trajectoryRisk = average(ordered.map((item) => item.trajectory_risk))
  const continuityDrift = average(ordered.map((item) => item.continuity_drift))
  const unresolvedMomentum = average(ordered.map((item) => item.unresolved_momentum))
  const stabilizationDrag = average(ordered.map((item) => item.stabilization_drag))
  const escalationPressure = average(
    ordered.map((item) => item.escalation_pressure_index),
  )
  const propagationRisk = average(ordered.map((item) => item.propagation_risk))
  const recoveryReliability = average(
    ordered.map((item) => item.recovery_reliability_score),
  )
  const survivability = average(
    ordered.map((item) => item.operational_survivability_score),
  )
  const stabilizationConfidence = average(
    ordered.map((item) => item.stabilization_confidence_score),
  )
  const continuityIntegrity = average(
    ordered.map((item) => item.continuity_integrity_score),
  )

  const directionVolatility = calculateVolatility(
    ordered.map((item) =>
      average([
        item.trajectory_risk,
        item.continuity_drift,
        item.unresolved_momentum,
        item.stabilization_drag,
        item.propagation_risk,
      ]),
    ),
  )

  const dominantTrajectorySignal =
    latest?.dominant_trajectory_signal ||
    strongestDriver({
      'Trajectory risk': trajectoryRisk,
      'Continuity drift': continuityDrift,
      'Unresolved momentum': unresolvedMomentum,
      'Stabilization drag': stabilizationDrag,
      'Propagation risk': propagationRisk,
      'Escalation pressure': escalationPressure,
    })

  const trustInput: ContinuityTrustInput = {
    activeInstability:
      trajectoryRisk >= 50 ||
      continuityDrift >= 50 ||
      unresolvedMomentum >= 50 ||
      stabilizationDrag >= 50
        ? 1
        : 0,
    recoveryRecords: ordered.length,
    fragileRecovery:
      recoveryReliability < 60 || stabilizationConfidence < 60 ? 1 : 0,
    commandPressure:
      trajectoryRisk >= 70 ||
      continuityDrift >= 70 ||
      escalationPressure >= 65
        ? 1
        : 0,
    evidenceReturn:
      ordered.length < 3 ||
      stabilizationConfidence < 65 ||
      continuityIntegrity < 65
        ? 1
        : 0,
    absorbable:
      ordered.length >= 3 &&
      trajectoryRisk < 35 &&
      continuityDrift < 35 &&
      unresolvedMomentum < 35 &&
      stabilizationDrag < 35 &&
      recoveryReliability >= 70 &&
      survivability >= 70
        ? 1
        : 0,
    historicalMemory: ordered.length,
    recurrenceVisible:
      directionVolatility >= 30 ||
      trajectoryRisk >= 60 ||
      continuityDrift >= 60
        ? 1
        : 0,
    coordinationPressure: unresolvedMomentum >= 55 || stabilizationDrag >= 55 ? 1 : 0,
    crossSitePressure: propagationRisk >= 70 ? 2 : propagationRisk >= 55 ? 1 : 0,
    auditPressure:
      ordered.length < 3 ||
      stabilizationConfidence < 65 ||
      continuityIntegrity < 65
        ? 1
        : 0,
    safeguardingVisible: survivability < 45 ? 1 : 0,
    posture: deriveTrajectoryPostureLabel({
      recordCount: ordered.length,
      trajectoryRisk,
      continuityDrift,
      unresolvedMomentum,
      stabilizationDrag,
      recoveryReliability,
      survivability,
      stabilizationConfidence,
      directionVolatility,
    }),
  }

  const trustAssessment = buildContinuityTrustAssessment(trustInput)

  const derivation = buildContinuityDerivationStandard({
    ...trustInput,
    visibleSignal: deriveTrajectoryVisibleSignal({
      recordCount: ordered.length,
      trajectoryRisk,
      continuityDrift,
      unresolvedMomentum,
      stabilizationDrag,
      propagationRisk,
      directionVolatility,
      dominantTrajectorySignal,
    }),
    stage: 'Trajectory Intelligence',
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
    recurringInstabilityCount:
      directionVolatility >= 30 || trajectoryRisk >= 60 ? 1 : 0,
    recoveryFailureCount: recoveryReliability < 55 ? 1 : 0,
    verifiedRecoveryCount:
      recoveryReliability >= 70 &&
      stabilizationConfidence >= 70 &&
      continuityIntegrity >= 70
        ? 1
        : 0,
    commandInterventionCount: trustInput.commandPressure,
    coordinationIssueCount: trustInput.coordinationPressure,
    crossSiteSignalCount: trustInput.crossSitePressure,
    executiveReviewCount: trustAssessment.trustLevel === 'HIGH' ? 0 : 1,
    auditReconstructionCount: ordered.length > 0 ? 1 : 0,
    survivabilityThreatCount: survivability < 45 ? 1 : 0,
    unresolvedMemoryGaps: ordered.length < 3 ? 1 : 0,
    lastKnownPattern:
      latest?.dominant_trajectory_signal ||
      latest?.dominant_memory_pattern ||
      undefined,
    memoryPosture: String(trustInput.posture),
    dominantMemoryDomain: 'TRAJECTORY',
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

  const trajectoryQuestion =
    'Is continuity moving toward stability, drift, recurrence, or collapse?'

  const trajectoryConclusion = trustAssessment.ceoSentence

  const trajectoryThesis = deriveTrajectoryThesis({
    recordCount: ordered.length,
    trustAssessment,
  })

  const scores = {
    trajectoryRisk,
    continuityDrift,
    unresolvedMomentum,
    stabilizationDrag,
    escalationPressure,
    propagationRisk,
    recoveryReliability,
    survivability,
    stabilizationConfidence,
    continuityIntegrity,
    directionVolatility,
    recordCount: ordered.length,
  }

  const evidenceRequirement = deriveEvidenceRequirement({
    orderedLength: ordered.length,
    trajectoryRisk,
    continuityDrift,
    stabilizationConfidence,
    trustAssessment,
  })

  const commandImplication = deriveCommandImplication(trustAssessment)
  const executiveReportImplication = deriveExecutiveReportImplication(
    trustAssessment,
  )
  const memoryBoardImplication = memoryDoctrine.requiredMovement
  const auditImplication = auditDoctrine.evidenceGap

  const copyReadyBrief = buildTrajectoryBrief({
    trajectoryQuestion,
    trajectoryConclusion,
    trajectoryThesis,
    trustAssessment,
    continuityStandard,
    memoryDoctrine,
    auditDoctrine,
    scores,
    dominantTrajectorySignal,
    evidenceRequirement,
    commandImplication,
    executiveReportImplication,
    memoryBoardImplication,
    auditImplication,
  })

  return {
    latest,
    trajectoryQuestion,
    trajectoryConclusion,
    trajectoryThesis,
    trustInput,
    trustAssessment,
    continuityStandard,
    memoryDoctrine,
    auditDoctrine,
    scores,
    dominantTrajectorySignal,
    evidenceRequirement,
    commandImplication,
    executiveReportImplication,
    memoryBoardImplication,
    auditImplication,
    copyReadyBrief,
  }
}

function deriveTrajectoryPostureLabel(input: {
  recordCount: number
  trajectoryRisk: number
  continuityDrift: number
  unresolvedMomentum: number
  stabilizationDrag: number
  recoveryReliability: number
  survivability: number
  stabilizationConfidence: number
  directionVolatility: number
}) {
  if (input.recordCount < 3) return 'INSUFFICIENT TRAJECTORY MEMORY'

  if (
    input.trajectoryRisk >= 75 ||
    input.continuityDrift >= 75 ||
    input.survivability < 35
  ) {
    return 'TRAJECTORY CRITICAL'
  }

  if (
    input.trajectoryRisk >= 60 ||
    input.continuityDrift >= 60 ||
    input.unresolvedMomentum >= 60 ||
    input.stabilizationDrag >= 60 ||
    input.recoveryReliability < 50 ||
    input.stabilizationConfidence < 50
  ) {
    return 'TRAJECTORY WORSENING'
  }

  if (
    input.trajectoryRisk >= 40 ||
    input.continuityDrift >= 40 ||
    input.unresolvedMomentum >= 40 ||
    input.directionVolatility >= 25
  ) {
    return 'TRAJECTORY WATCHED'
  }

  return 'TRAJECTORY STABILIZING'
}

function deriveTrajectoryVisibleSignal(input: {
  recordCount: number
  trajectoryRisk: number
  continuityDrift: number
  unresolvedMomentum: number
  stabilizationDrag: number
  propagationRisk: number
  directionVolatility: number
  dominantTrajectorySignal: string
}) {
  if (input.recordCount < 3) return 'Insufficient trajectory memory'
  if (input.trajectoryRisk >= 70) return 'Trajectory deterioration risk'
  if (input.continuityDrift >= 70) return 'Continuity drift'
  if (input.unresolvedMomentum >= 65) return 'Unresolved momentum'
  if (input.stabilizationDrag >= 65) return 'Stabilization drag'
  if (input.propagationRisk >= 65) return 'Propagating trajectory exposure'
  if (input.directionVolatility >= 30) return 'Volatile trajectory movement'
  return `Trajectory movement led by ${input.dominantTrajectorySignal}`
}

function deriveTrajectoryThesis(input: {
  recordCount: number
  trustAssessment: ContinuityTrustAssessment
}) {
  if (input.recordCount < 3) return 'BUILD TRAJECTORY MEMORY BEFORE TRUST'

  if (input.trustAssessment.trustLevel === 'WITHHELD') {
    return 'DO NOT TRUST TRAJECTORY STABILITY'
  }

  if (input.trustAssessment.trustLevel === 'LOW') {
    return 'DO NOT DECLARE TRAJECTORY RECOVERY YET'
  }

  if (input.trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'CONDITIONALLY TRUST TRAJECTORY MOVEMENT'
  }

  return 'TRAJECTORY CAN BE TREATED AS STABILIZING WITH MEMORY PRESERVED'
}

function deriveEvidenceRequirement(input: {
  orderedLength: number
  trajectoryRisk: number
  continuityDrift: number
  stabilizationConfidence: number
  trustAssessment: ContinuityTrustAssessment
}) {
  if (input.orderedLength < 3) {
    return 'Continue saving trajectory snapshots before making a direction claim.'
  }

  if (
    input.trajectoryRisk >= 60 ||
    input.continuityDrift >= 60 ||
    input.stabilizationConfidence < 65
  ) {
    return 'Require trend evidence, recovery credibility, ownership action, recurrence history, and audit trail before trajectory confidence is restored.'
  }

  return input.trustAssessment.trustMeaning
}

function deriveCommandImplication(trustAssessment: ContinuityTrustAssessment) {
  if (
    trustAssessment.trustLevel === 'WITHHELD' ||
    trustAssessment.trustLevel === 'LOW'
  ) {
    return 'Command should keep trajectory visible until direction credibility is proven.'
  }

  if (trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'Command may reduce trajectory visibility cautiously with evidence preserved.'
  }

  return 'Command can release trajectory watch while preserving memory.'
}

function deriveExecutiveReportImplication(
  trustAssessment: ContinuityTrustAssessment,
) {
  if (
    trustAssessment.trustLevel === 'WITHHELD' ||
    trustAssessment.trustLevel === 'LOW'
  ) {
    return 'Executive Report should not conclude trajectory stabilization.'
  }

  if (trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'Executive Report should state trajectory movement is conditional.'
  }

  return 'Executive Report may state trajectory is currently stabilizing.'
}

function buildTrajectoryBrief(input: {
  trajectoryQuestion: string
  trajectoryConclusion: string
  trajectoryThesis: string
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
  scores: CGITrajectoryDoctrineReading['scores']
  dominantTrajectorySignal: string
  evidenceRequirement: string
  commandImplication: string
  executiveReportImplication: string
  memoryBoardImplication: string
  auditImplication: string
}) {
  return [
    'TSINAXA CGI TRAJECTORY INTELLIGENCE BRIEF',
    '',
    `Trajectory Question: ${input.trajectoryQuestion}`,
    '',
    `Trajectory Thesis: ${input.trajectoryThesis}`,
    '',
    `Trajectory Conclusion: ${input.trajectoryConclusion}`,
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
    `Dominant Trajectory Signal: ${input.dominantTrajectorySignal}`,
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
    `Trajectory Risk: ${input.scores.trajectoryRisk}`,
    '',
    `Continuity Drift: ${input.scores.continuityDrift}`,
    '',
    `Unresolved Momentum: ${input.scores.unresolvedMomentum}`,
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

function calculateVolatility(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))
  if (valid.length < 2) return 0

  const mean = average(valid)
  const variance =
    valid.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    valid.length

  return Math.min(100, Math.round(Math.sqrt(variance)))
}

function strongestDriver(scores: Record<string, number>) {
  return (
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No dominant trajectory signal detected'
  )
}