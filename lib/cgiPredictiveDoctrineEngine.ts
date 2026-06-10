import { buildAuditDoctrine } from './cgiAuditDoctrineEngine'
import { buildContinuityDerivationStandard } from './cgiContinuityDerivationStandard'
import { buildContinuityTrustAssessment } from './cgiContinuityTrustEngine'
import type {
  ContinuityTrustAssessment,
  ContinuityTrustInput,
} from './cgiContinuityTrustEngine'
import { buildInstitutionalMemoryDoctrine } from './cgiInstitutionalMemoryDoctrineEngine'

export type CGIPredictiveMetric = {
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

export type CGIPredictiveDoctrineReading = {
  latest: CGIPredictiveMetric | null
  predictiveQuestion: string
  predictiveConclusion: string
  predictiveThesis: string
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
    predictiveRisk: number
    escalationPressure: number
    propagationRisk: number
    trajectoryRisk: number
    structuralMemoryRisk: number
    unresolvedMomentum: number
    stabilizationDrag: number
    continuityDrift: number
    recoveryReliability: number
    survivability: number
    stabilizationConfidence: number
    continuityIntegrity: number
    forecastVolatility: number
    recordCount: number
  }
  dominantPredictiveSignal: string
  evidenceRequirement: string
  commandImplication: string
  executiveReportImplication: string
  memoryBoardImplication: string
  auditImplication: string
  copyReadyBrief: string
}

export function buildCGIPredictiveDoctrine(
  metrics: CGIPredictiveMetric[],
): CGIPredictiveDoctrineReading {
  const ordered = [...metrics].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const latest = ordered.length > 0 ? ordered[ordered.length - 1] : null

  const escalationPressure = average(
    ordered.map((item) => item.escalation_pressure_index),
  )
  const propagationRisk = average(ordered.map((item) => item.propagation_risk))
  const trajectoryRisk = average(ordered.map((item) => item.trajectory_risk))
  const structuralMemoryRisk = average(
    ordered.map((item) => item.structural_memory_risk),
  )
  const unresolvedMomentum = average(
    ordered.map((item) => item.unresolved_momentum),
  )
  const stabilizationDrag = average(ordered.map((item) => item.stabilization_drag))
  const continuityDrift = average(ordered.map((item) => item.continuity_drift))
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

  const predictiveRisk = clamp(
    escalationPressure * 0.16 +
      propagationRisk * 0.14 +
      trajectoryRisk * 0.16 +
      structuralMemoryRisk * 0.14 +
      unresolvedMomentum * 0.12 +
      stabilizationDrag * 0.1 +
      continuityDrift * 0.12 +
      (100 - recoveryReliability) * 0.08 +
      (100 - survivability) * 0.08,
  )

  const forecastVolatility = calculateVolatility(
    ordered.map((item) =>
      average([
        item.escalation_pressure_index,
        item.propagation_risk,
        item.trajectory_risk,
        item.structural_memory_risk,
        item.unresolved_momentum,
        item.stabilization_drag,
        item.continuity_drift,
      ]),
    ),
  )

  const dominantPredictiveSignal =
    latest?.dominant_memory_pattern ||
    latest?.dominant_trajectory_signal ||
    latest?.dominant_pressure_source ||
    strongestDriver({
      'Escalation pressure': escalationPressure,
      'Propagation risk': propagationRisk,
      'Trajectory risk': trajectoryRisk,
      'Structural memory risk': structuralMemoryRisk,
      'Unresolved momentum': unresolvedMomentum,
      'Stabilization drag': stabilizationDrag,
      'Continuity drift': continuityDrift,
      'Recovery reliability weakness': 100 - recoveryReliability,
      'Survivability weakness': 100 - survivability,
    })

  const trustInput: ContinuityTrustInput = {
    activeInstability:
      predictiveRisk >= 50 ||
      escalationPressure >= 50 ||
      trajectoryRisk >= 50 ||
      structuralMemoryRisk >= 50
        ? 1
        : 0,
    recoveryRecords: ordered.length,
    fragileRecovery:
      recoveryReliability < 60 ||
      stabilizationConfidence < 60 ||
      predictiveRisk >= 60
        ? 1
        : 0,
    commandPressure:
      predictiveRisk >= 70 ||
      escalationPressure >= 70 ||
      propagationRisk >= 70 ||
      survivability < 45
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
      predictiveRisk < 35 &&
      escalationPressure < 40 &&
      propagationRisk < 40 &&
      trajectoryRisk < 40 &&
      structuralMemoryRisk < 40 &&
      recoveryReliability >= 70 &&
      survivability >= 70
        ? 1
        : 0,
    historicalMemory: ordered.length,
    recurrenceVisible:
      structuralMemoryRisk >= 60 ||
      forecastVolatility >= 30 ||
      continuityDrift >= 60
        ? 1
        : 0,
    coordinationPressure:
      unresolvedMomentum >= 55 || stabilizationDrag >= 55 ? 1 : 0,
    crossSitePressure:
      propagationRisk >= 70 || structuralMemoryRisk >= 70
        ? 2
        : propagationRisk >= 55 || structuralMemoryRisk >= 55
          ? 1
          : 0,
    auditPressure:
      ordered.length < 3 ||
      stabilizationConfidence < 65 ||
      continuityIntegrity < 65
        ? 1
        : 0,
    safeguardingVisible: survivability < 45 ? 1 : 0,
    posture: derivePredictivePostureLabel({
      recordCount: ordered.length,
      predictiveRisk,
      escalationPressure,
      propagationRisk,
      trajectoryRisk,
      structuralMemoryRisk,
      recoveryReliability,
      survivability,
      stabilizationConfidence,
      forecastVolatility,
    }),
  }

  const trustAssessment = buildContinuityTrustAssessment(trustInput)

  const derivation = buildContinuityDerivationStandard({
    ...trustInput,
    visibleSignal: derivePredictiveVisibleSignal({
      recordCount: ordered.length,
      predictiveRisk,
      escalationPressure,
      propagationRisk,
      trajectoryRisk,
      structuralMemoryRisk,
      unresolvedMomentum,
      stabilizationDrag,
      continuityDrift,
      forecastVolatility,
      dominantPredictiveSignal,
    }),
    stage: 'Predictive Intelligence',
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
      structuralMemoryRisk >= 60 || forecastVolatility >= 30 ? 1 : 0,
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
      latest?.dominant_memory_pattern ||
      latest?.dominant_trajectory_signal ||
      latest?.dominant_pressure_source ||
      undefined,
    memoryPosture: String(trustInput.posture),
    dominantMemoryDomain: 'PREDICTIVE',
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

  const predictiveQuestion =
    'What visible instability is likely to return, spread, or worsen before leadership notices?'

  const predictiveConclusion = trustAssessment.ceoSentence

  const predictiveThesis = derivePredictiveThesis({
    recordCount: ordered.length,
    trustAssessment,
  })

  const scores = {
    predictiveRisk,
    escalationPressure,
    propagationRisk,
    trajectoryRisk,
    structuralMemoryRisk,
    unresolvedMomentum,
    stabilizationDrag,
    continuityDrift,
    recoveryReliability,
    survivability,
    stabilizationConfidence,
    continuityIntegrity,
    forecastVolatility,
    recordCount: ordered.length,
  }

  const evidenceRequirement = deriveEvidenceRequirement({
    orderedLength: ordered.length,
    predictiveRisk,
    structuralMemoryRisk,
    stabilizationConfidence,
    trustAssessment,
  })

  const commandImplication = deriveCommandImplication(trustAssessment)
  const executiveReportImplication = deriveExecutiveReportImplication(
    trustAssessment,
  )
  const memoryBoardImplication = memoryDoctrine.requiredMovement
  const auditImplication = auditDoctrine.evidenceGap

  const copyReadyBrief = buildPredictiveBrief({
    predictiveQuestion,
    predictiveConclusion,
    predictiveThesis,
    trustAssessment,
    continuityStandard,
    memoryDoctrine,
    auditDoctrine,
    scores,
    dominantPredictiveSignal,
    evidenceRequirement,
    commandImplication,
    executiveReportImplication,
    memoryBoardImplication,
    auditImplication,
  })

  return {
    latest,
    predictiveQuestion,
    predictiveConclusion,
    predictiveThesis,
    trustInput,
    trustAssessment,
    continuityStandard,
    memoryDoctrine,
    auditDoctrine,
    scores,
    dominantPredictiveSignal,
    evidenceRequirement,
    commandImplication,
    executiveReportImplication,
    memoryBoardImplication,
    auditImplication,
    copyReadyBrief,
  }
}

function derivePredictivePostureLabel(input: {
  recordCount: number
  predictiveRisk: number
  escalationPressure: number
  propagationRisk: number
  trajectoryRisk: number
  structuralMemoryRisk: number
  recoveryReliability: number
  survivability: number
  stabilizationConfidence: number
  forecastVolatility: number
}) {
  if (input.recordCount < 3) return 'INSUFFICIENT PREDICTIVE MEMORY'

  if (
    input.predictiveRisk >= 75 ||
    input.escalationPressure >= 75 ||
    input.propagationRisk >= 75 ||
    input.survivability < 35
  ) {
    return 'PREDICTIVE CRITICAL'
  }

  if (
    input.predictiveRisk >= 60 ||
    input.trajectoryRisk >= 60 ||
    input.structuralMemoryRisk >= 60 ||
    input.recoveryReliability < 50 ||
    input.stabilizationConfidence < 50
  ) {
    return 'PREDICTIVE WARNING'
  }

  if (
    input.predictiveRisk >= 40 ||
    input.forecastVolatility >= 25 ||
    input.structuralMemoryRisk >= 45
  ) {
    return 'PREDICTIVE WATCHED'
  }

  return 'PREDICTIVE QUIET'
}

function derivePredictiveVisibleSignal(input: {
  recordCount: number
  predictiveRisk: number
  escalationPressure: number
  propagationRisk: number
  trajectoryRisk: number
  structuralMemoryRisk: number
  unresolvedMomentum: number
  stabilizationDrag: number
  continuityDrift: number
  forecastVolatility: number
  dominantPredictiveSignal: string
}) {
  if (input.recordCount < 3) return 'Insufficient predictive memory'
  if (input.predictiveRisk >= 70) return 'Predictive continuity warning'
  if (input.structuralMemoryRisk >= 70) return 'Structural recurrence warning'
  if (input.propagationRisk >= 70) return 'Propagation warning'
  if (input.trajectoryRisk >= 70) return 'Trajectory deterioration warning'
  if (input.escalationPressure >= 70) return 'Escalation pressure warning'
  if (input.unresolvedMomentum >= 65) return 'Unresolved momentum warning'
  if (input.stabilizationDrag >= 65) return 'Stabilization delay warning'
  if (input.continuityDrift >= 65) return 'Continuity drift warning'
  if (input.forecastVolatility >= 30) return 'Volatile forecast movement'
  return `Predictive signal led by ${input.dominantPredictiveSignal}`
}

function derivePredictiveThesis(input: {
  recordCount: number
  trustAssessment: ContinuityTrustAssessment
}) {
  if (input.recordCount < 3) return 'BUILD PREDICTIVE MEMORY BEFORE TRUST'

  if (input.trustAssessment.trustLevel === 'WITHHELD') {
    return 'DO NOT TRUST PREDICTIVE QUIET'
  }

  if (input.trustAssessment.trustLevel === 'LOW') {
    return 'DO NOT REDUCE PREDICTIVE VISIBILITY YET'
  }

  if (input.trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'CONDITIONALLY TRUST PREDICTIVE STABILITY'
  }

  return 'PREDICTIVE QUIET CAN BE TRUSTED WITH MEMORY PRESERVED'
}

function deriveEvidenceRequirement(input: {
  orderedLength: number
  predictiveRisk: number
  structuralMemoryRisk: number
  stabilizationConfidence: number
  trustAssessment: ContinuityTrustAssessment
}) {
  if (input.orderedLength < 3) {
    return 'Continue saving predictive snapshots before making a forecast claim.'
  }

  if (
    input.predictiveRisk >= 60 ||
    input.structuralMemoryRisk >= 60 ||
    input.stabilizationConfidence < 65
  ) {
    return 'Require recurrence evidence, structural memory review, stabilization proof, ownership action, and audit trail before predictive visibility is reduced.'
  }

  return input.trustAssessment.trustMeaning
}

function deriveCommandImplication(trustAssessment: ContinuityTrustAssessment) {
  if (
    trustAssessment.trustLevel === 'WITHHELD' ||
    trustAssessment.trustLevel === 'LOW'
  ) {
    return 'Command should keep predictive visibility active until forecast quiet is proven.'
  }

  if (trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'Command may reduce predictive visibility cautiously with evidence preserved.'
  }

  return 'Command can release predictive watch while preserving memory.'
}

function deriveExecutiveReportImplication(
  trustAssessment: ContinuityTrustAssessment,
) {
  if (
    trustAssessment.trustLevel === 'WITHHELD' ||
    trustAssessment.trustLevel === 'LOW'
  ) {
    return 'Executive Report should not conclude predictive quiet.'
  }

  if (trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'Executive Report should state predictive stability is conditional.'
  }

  return 'Executive Report may state predictive quiet is currently credible.'
}

function buildPredictiveBrief(input: {
  predictiveQuestion: string
  predictiveConclusion: string
  predictiveThesis: string
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
  scores: CGIPredictiveDoctrineReading['scores']
  dominantPredictiveSignal: string
  evidenceRequirement: string
  commandImplication: string
  executiveReportImplication: string
  memoryBoardImplication: string
  auditImplication: string
}) {
  return [
    'TSINAXA CGI PREDICTIVE INTELLIGENCE BRIEF',
    '',
    `Predictive Question: ${input.predictiveQuestion}`,
    '',
    `Predictive Thesis: ${input.predictiveThesis}`,
    '',
    `Predictive Conclusion: ${input.predictiveConclusion}`,
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
    `Dominant Predictive Signal: ${input.dominantPredictiveSignal}`,
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
    `Predictive Risk: ${input.scores.predictiveRisk}`,
    '',
    `Structural Memory Risk: ${input.scores.structuralMemoryRisk}`,
    '',
    `Forecast Volatility: ${input.scores.forecastVolatility}`,
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

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
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
    'No dominant predictive signal detected'
  )
}