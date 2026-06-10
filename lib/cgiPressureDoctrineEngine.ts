import { buildAuditDoctrine } from './cgiAuditDoctrineEngine'
import { buildContinuityDerivationStandard } from './cgiContinuityDerivationStandard'
import { buildContinuityTrustAssessment } from './cgiContinuityTrustEngine'
import type {
  ContinuityTrustAssessment,
  ContinuityTrustInput,
} from './cgiContinuityTrustEngine'
import { buildInstitutionalMemoryDoctrine } from './cgiInstitutionalMemoryDoctrineEngine'

export type CGIPressureMetric = {
  id: string
  created_at: string
  scope: string
  continuity_state: string
  pressure_propagation_state: string
  trajectory_direction: string
  structural_memory_state: string
  escalation_pressure_index: number
  propagation_risk: number
  routing_friction: number
  responder_pressure: number
  escalation_velocity: number
  coordination_instability: number
  stabilization_drag: number
  recovery_reliability_score: number
  operational_survivability_score: number
  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
}

export type CGIPressureDoctrineReading = {
  latest: CGIPressureMetric | null
  pressureQuestion: string
  pressureConclusion: string
  pressureThesis: string
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
    escalation: number
    propagation: number
    routing: number
    responder: number
    velocity: number
    coordination: number
    drag: number
    containment: number
    volatility: number
    recoveryReliability: number
    survivability: number
    recordCount: number
  }
  dominantPressureDriver: string
  evidenceRequirement: string
  commandImplication: string
  executiveReportImplication: string
  memoryBoardImplication: string
  auditImplication: string
  copyReadyBrief: string
}

export function buildCGIPressureDoctrine(
  metrics: CGIPressureMetric[],
): CGIPressureDoctrineReading {
  const ordered = [...metrics].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const latest = ordered.length > 0 ? ordered[ordered.length - 1] : null

  const escalation = average(ordered.map((item) => item.escalation_pressure_index))
  const propagation = average(ordered.map((item) => item.propagation_risk))
  const routing = average(ordered.map((item) => item.routing_friction))
  const responder = average(ordered.map((item) => item.responder_pressure))
  const velocity = average(ordered.map((item) => item.escalation_velocity))
  const coordination = average(ordered.map((item) => item.coordination_instability))
  const drag = average(ordered.map((item) => item.stabilization_drag))
  const recoveryReliability = average(
    ordered.map((item) => item.recovery_reliability_score),
  )
  const survivability = average(
    ordered.map((item) => item.operational_survivability_score),
  )

  const containment = clamp(
    recoveryReliability * 0.35 + survivability * 0.35 + (100 - escalation) * 0.3,
  )

  const volatility = calculateVolatility(
    ordered.map((item) =>
      average([
        item.escalation_pressure_index,
        item.propagation_risk,
        item.routing_friction,
        item.responder_pressure,
        item.escalation_velocity,
        item.coordination_instability,
        item.stabilization_drag,
      ]),
    ),
  )

  const dominantPressureDriver = strongestDriver({
    'Escalation pressure': escalation,
    'Propagation risk': propagation,
    'Routing friction': routing,
    'Responder pressure': responder,
    'Escalation velocity': velocity,
    'Coordination instability': coordination,
    'Stabilization drag': drag,
  })

  const trustInput: ContinuityTrustInput = {
    activeInstability:
      escalation >= 50 || propagation >= 50 || coordination >= 50 ? 1 : 0,
    recoveryRecords: ordered.length,
    fragileRecovery: containment < 45 || drag >= 60 ? 1 : 0,
    commandPressure: escalation >= 65 || velocity >= 65 ? 1 : 0,
    evidenceReturn: ordered.length < 3 || containment < 55 ? 1 : 0,
    absorbable:
      ordered.length >= 3 &&
      escalation < 40 &&
      propagation < 40 &&
      coordination < 40 &&
      drag < 40 &&
      containment >= 70
        ? 1
        : 0,
    historicalMemory: ordered.length,
    recurrenceVisible: volatility >= 30 || propagation >= 60 ? 1 : 0,
    coordinationPressure: coordination >= 45 || routing >= 55 ? 1 : 0,
    crossSitePressure: propagation >= 70 ? 2 : propagation >= 55 ? 1 : 0,
    auditPressure: ordered.length < 3 || containment < 55 ? 1 : 0,
    safeguardingVisible: survivability < 45 ? 1 : 0,
    posture: derivePressurePostureLabel({
      recordCount: ordered.length,
      escalation,
      propagation,
      coordination,
      drag,
      containment,
      volatility,
      survivability,
    }),
  }

  const trustAssessment = buildContinuityTrustAssessment(trustInput)

  const derivation = buildContinuityDerivationStandard({
    ...trustInput,
    visibleSignal: derivePressureVisibleSignal({
      recordCount: ordered.length,
      escalation,
      propagation,
      coordination,
      routing,
      responder,
      velocity,
      drag,
      containment,
      dominantPressureDriver,
    }),
    stage: 'Pressure Intelligence',
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
    recurringInstabilityCount: volatility >= 30 || propagation >= 60 ? 1 : 0,
    recoveryFailureCount: containment < 45 ? 1 : 0,
    verifiedRecoveryCount: containment >= 70 ? 1 : 0,
    commandInterventionCount: trustInput.commandPressure,
    coordinationIssueCount: trustInput.coordinationPressure,
    crossSiteSignalCount: trustInput.crossSitePressure,
    executiveReviewCount: trustAssessment.trustLevel === 'HIGH' ? 0 : 1,
    auditReconstructionCount: ordered.length > 0 ? 1 : 0,
    survivabilityThreatCount: survivability < 45 ? 1 : 0,
    unresolvedMemoryGaps: ordered.length < 3 ? 1 : 0,
    lastKnownPattern: latest?.dominant_pressure_source || undefined,
    memoryPosture: String(trustInput.posture),
    dominantMemoryDomain: 'PRESSURE',
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

  const pressureQuestion = 'Can continuity pressure still be contained?'
  const pressureConclusion = trustAssessment.ceoSentence
  const pressureThesis = derivePressureThesis({
    recordCount: ordered.length,
    trustAssessment,
    containment,
    escalation,
    propagation,
  })

  const scores = {
    escalation,
    propagation,
    routing,
    responder,
    velocity,
    coordination,
    drag,
    containment,
    volatility,
    recoveryReliability,
    survivability,
    recordCount: ordered.length,
  }

  const evidenceRequirement = deriveEvidenceRequirement({
    orderedLength: ordered.length,
    containment,
    escalation,
    propagation,
    trustAssessment,
  })

  const commandImplication = deriveCommandImplication(trustAssessment)
  const executiveReportImplication = deriveExecutiveReportImplication(
    trustAssessment,
  )
  const memoryBoardImplication = memoryDoctrine.requiredMovement
  const auditImplication = auditDoctrine.evidenceGap

  const copyReadyBrief = buildPressureBrief({
    pressureQuestion,
    pressureConclusion,
    pressureThesis,
    trustAssessment,
    continuityStandard,
    memoryDoctrine,
    auditDoctrine,
    scores,
    dominantPressureDriver,
    evidenceRequirement,
    commandImplication,
    executiveReportImplication,
    memoryBoardImplication,
    auditImplication,
  })

  return {
    latest,
    pressureQuestion,
    pressureConclusion,
    pressureThesis,
    trustInput,
    trustAssessment,
    continuityStandard,
    memoryDoctrine,
    auditDoctrine,
    scores,
    dominantPressureDriver,
    evidenceRequirement,
    commandImplication,
    executiveReportImplication,
    memoryBoardImplication,
    auditImplication,
    copyReadyBrief,
  }
}

function derivePressurePostureLabel(input: {
  recordCount: number
  escalation: number
  propagation: number
  coordination: number
  drag: number
  containment: number
  volatility: number
  survivability: number
}) {
  if (input.recordCount < 3) return 'INSUFFICIENT PRESSURE MEMORY'

  if (
    input.escalation >= 75 ||
    input.propagation >= 75 ||
    input.survivability < 35
  ) {
    return 'PRESSURE CRITICAL'
  }

  if (
    input.escalation >= 60 ||
    input.propagation >= 60 ||
    input.coordination >= 60 ||
    input.drag >= 60 ||
    input.containment < 45
  ) {
    return 'PRESSURE ELEVATED'
  }

  if (
    input.escalation >= 40 ||
    input.propagation >= 40 ||
    input.coordination >= 40 ||
    input.volatility >= 25
  ) {
    return 'PRESSURE WATCHED'
  }

  return 'PRESSURE CONTAINED'
}

function derivePressureVisibleSignal(input: {
  recordCount: number
  escalation: number
  propagation: number
  coordination: number
  routing: number
  responder: number
  velocity: number
  drag: number
  containment: number
  dominantPressureDriver: string
}) {
  if (input.recordCount < 3) return 'Insufficient pressure memory'
  if (input.propagation >= 70) return 'Pressure propagation risk'
  if (input.escalation >= 70) return 'Escalation pressure load'
  if (input.velocity >= 65) return 'Escalation velocity'
  if (input.coordination >= 60) return 'Coordination instability pressure'
  if (input.routing >= 60) return 'Routing friction pressure'
  if (input.responder >= 60) return 'Responder pressure'
  if (input.drag >= 60) return 'Stabilization drag'
  if (input.containment < 45) return 'Weak pressure containment'
  return `Contained pressure led by ${input.dominantPressureDriver}`
}

function derivePressureThesis(input: {
  recordCount: number
  trustAssessment: ContinuityTrustAssessment
  containment: number
  escalation: number
  propagation: number
}) {
  if (input.recordCount < 3) return 'BUILD PRESSURE MEMORY BEFORE TRUST'

  if (input.trustAssessment.trustLevel === 'WITHHELD') {
    return 'DO NOT TRUST PRESSURE CONTAINMENT'
  }

  if (input.trustAssessment.trustLevel === 'LOW') {
    return 'DO NOT REDUCE PRESSURE VISIBILITY YET'
  }

  if (input.trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'CONDITIONALLY TRUST PRESSURE CONTAINMENT'
  }

  return 'PRESSURE CAN BE TREATED AS CONTAINED WITH MEMORY PRESERVED'
}

function deriveEvidenceRequirement(input: {
  orderedLength: number
  containment: number
  escalation: number
  propagation: number
  trustAssessment: ContinuityTrustAssessment
}) {
  if (input.orderedLength < 3) {
    return 'Continue saving pressure snapshots before making a containment claim.'
  }

  if (input.containment < 55 || input.escalation >= 60 || input.propagation >= 60) {
    return 'Require ownership, routing, coordination, containment, recovery, and audit evidence before pressure visibility is reduced.'
  }

  return input.trustAssessment.trustMeaning
}

function deriveCommandImplication(trustAssessment: ContinuityTrustAssessment) {
  if (
    trustAssessment.trustLevel === 'WITHHELD' ||
    trustAssessment.trustLevel === 'LOW'
  ) {
    return 'Command should hold pressure visibility until containment is proven.'
  }

  if (trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'Command may reduce pressure posture cautiously with evidence preserved.'
  }

  return 'Command can release pressure watch while preserving memory.'
}

function deriveExecutiveReportImplication(
  trustAssessment: ContinuityTrustAssessment,
) {
  if (
    trustAssessment.trustLevel === 'WITHHELD' ||
    trustAssessment.trustLevel === 'LOW'
  ) {
    return 'Executive Report should not conclude pressure containment.'
  }

  if (trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'Executive Report should state pressure containment is conditional.'
  }

  return 'Executive Report may state pressure is currently contained.'
}

function buildPressureBrief(input: {
  pressureQuestion: string
  pressureConclusion: string
  pressureThesis: string
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
  scores: CGIPressureDoctrineReading['scores']
  dominantPressureDriver: string
  evidenceRequirement: string
  commandImplication: string
  executiveReportImplication: string
  memoryBoardImplication: string
  auditImplication: string
}) {
  return [
    'TSINAXA CGI PRESSURE INTELLIGENCE BRIEF',
    '',
    `Pressure Question: ${input.pressureQuestion}`,
    '',
    `Pressure Thesis: ${input.pressureThesis}`,
    '',
    `Pressure Conclusion: ${input.pressureConclusion}`,
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
    `Dominant Pressure Driver: ${input.dominantPressureDriver}`,
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
    `Escalation Score: ${input.scores.escalation}`,
    '',
    `Propagation Score: ${input.scores.propagation}`,
    '',
    `Containment Score: ${input.scores.containment}`,
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
    'No dominant pressure driver detected'
  )
}