import type { CGIHistoricalContinuityReview } from './cgiHistoricalContinuityEngine'

export type CGIExecutiveMemoryPosture =
  | 'NO_MEMORY'
  | 'STABLE_MEMORY'
  | 'WATCHED_MEMORY'
  | 'ELEVATED_MEMORY'
  | 'CRITICAL_MEMORY'

export type CGIMemoryCompressionUrgency =
  | 'NONE'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'EXECUTIVE'

export type CGIMemoryCompressionConfidence =
  | 'NOT_ESTABLISHED'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'

export type CGIExecutiveMemoryCompression = {
  memoryPosture: CGIExecutiveMemoryPosture
  memoryPostureLabel: string
  urgency: CGIMemoryCompressionUrgency
  urgencyLabel: string
  confidence: CGIMemoryCompressionConfidence
  confidenceLabel: string
  executiveEscalationRequired: boolean
  survivabilityAttentionRequired: boolean
  recurrenceAttentionRequired: boolean
  evidenceAttentionRequired: boolean
  stabilizationCredible: boolean
  dominantMemoryConcern: string
  executiveCompressionSummary: string
  boardLevelReading: string
  requiredExecutiveAction: string
  requiredEvidence: string
  continuityMemoryStatement: string
}

export function compressCGIExecutiveMemory(
  historicalReview: CGIHistoricalContinuityReview
): CGIExecutiveMemoryCompression {
  const survivabilityAttentionRequired =
    historicalReview.survivabilityConcernPersisting ||
    historicalReview.continuityPersistenceSeverity === 'CRITICAL' ||
    historicalReview.continuityPersistenceSeverity === 'HIGH'

  const recurrenceAttentionRequired =
    historicalReview.recurrenceVisible ||
    historicalReview.institutionalMemoryPressure === 'HEAVY' ||
    historicalReview.institutionalMemoryPressure === 'EXECUTIVE'

  const evidenceAttentionRequired =
    historicalReview.evidenceGap ||
    historicalReview.stabilizationCredibility === 'EVIDENCE_DEFICIENT' ||
    historicalReview.stabilizationCredibility === 'NOT_YET_CREDIBLE'

  const memoryPosture = deriveMemoryPosture({
    historicalReview,
    survivabilityAttentionRequired,
    recurrenceAttentionRequired,
  })

  const urgency = deriveCompressionUrgency({
    historicalReview,
    memoryPosture,
    survivabilityAttentionRequired,
    recurrenceAttentionRequired,
    evidenceAttentionRequired,
  })

  const confidence = deriveCompressionConfidence(historicalReview)

  const executiveEscalationRequired =
    urgency === 'EXECUTIVE' || memoryPosture === 'CRITICAL_MEMORY'

  const stabilizationCredible =
    historicalReview.stabilizationCredibility === 'CREDIBLE' &&
    !historicalReview.continuityDriftDetected &&
    !executiveEscalationRequired

  const dominantMemoryConcern = deriveDominantMemoryConcern({
    historicalReview,
    memoryPosture,
    executiveEscalationRequired,
    survivabilityAttentionRequired,
    recurrenceAttentionRequired,
    evidenceAttentionRequired,
  })

  const requiredExecutiveAction = deriveRequiredExecutiveAction({
    memoryPosture,
    urgency,
    executiveEscalationRequired,
    survivabilityAttentionRequired,
    recurrenceAttentionRequired,
    evidenceAttentionRequired,
    stabilizationCredible,
  })

  const requiredEvidence = deriveRequiredEvidence({
    historicalReview,
    evidenceAttentionRequired,
    survivabilityAttentionRequired,
    recurrenceAttentionRequired,
  })

  const continuityMemoryStatement = buildContinuityMemoryStatement(
    historicalReview
  )

  const executiveCompressionSummary = [
    `Memory posture: ${formatCGIExecutiveMemoryPosture(memoryPosture)}.`,
    `Urgency: ${formatCGIMemoryCompressionUrgency(urgency)}.`,
    `Confidence: ${formatCGIMemoryCompressionConfidence(confidence)}.`,
    `Dominant concern: ${dominantMemoryConcern}`,
    `Required action: ${requiredExecutiveAction}`,
  ].join(' ')

  const boardLevelReading = buildBoardLevelReading({
    historicalReview,
    memoryPosture,
    urgency,
    confidence,
    dominantMemoryConcern,
    requiredExecutiveAction,
  })

  return {
    memoryPosture,
    memoryPostureLabel: formatCGIExecutiveMemoryPosture(memoryPosture),
    urgency,
    urgencyLabel: formatCGIMemoryCompressionUrgency(urgency),
    confidence,
    confidenceLabel: formatCGIMemoryCompressionConfidence(confidence),
    executiveEscalationRequired,
    survivabilityAttentionRequired,
    recurrenceAttentionRequired,
    evidenceAttentionRequired,
    stabilizationCredible,
    dominantMemoryConcern,
    executiveCompressionSummary,
    boardLevelReading,
    requiredExecutiveAction,
    requiredEvidence,
    continuityMemoryStatement,
  }
}

function deriveMemoryPosture({
  historicalReview,
  survivabilityAttentionRequired,
  recurrenceAttentionRequired,
}: {
  historicalReview: CGIHistoricalContinuityReview
  survivabilityAttentionRequired: boolean
  recurrenceAttentionRequired: boolean
}): CGIExecutiveMemoryPosture {
  if (historicalReview.snapshotCount === 0) return 'NO_MEMORY'

  const criticalMemoryConfirmed =
    historicalReview.continuityPersistenceSeverity === 'CRITICAL' ||
    historicalReview.institutionalMemoryPressure === 'EXECUTIVE' ||
    historicalReview.criticalCount > 1 ||
    (historicalReview.criticalCount > 0 &&
      (survivabilityAttentionRequired || recurrenceAttentionRequired))

  if (criticalMemoryConfirmed) return 'CRITICAL_MEMORY'

  const elevatedMemoryConfirmed =
    historicalReview.criticalCount > 0 ||
    historicalReview.continuityPersistenceSeverity === 'HIGH' ||
    historicalReview.institutionalMemoryPressure === 'HEAVY' ||
    historicalReview.elevatedCount > 1 ||
    (historicalReview.elevatedCount > 0 &&
      (survivabilityAttentionRequired || recurrenceAttentionRequired))

  if (elevatedMemoryConfirmed) return 'ELEVATED_MEMORY'

  if (
    historicalReview.elevatedCount > 0 ||
    historicalReview.continuityPersistenceSeverity === 'MODERATE' ||
    historicalReview.institutionalMemoryPressure === 'MODERATE' ||
    historicalReview.evidenceGap
  ) {
    return 'WATCHED_MEMORY'
  }

  return 'STABLE_MEMORY'
}

function deriveCompressionUrgency({
  historicalReview,
  memoryPosture,
  survivabilityAttentionRequired,
  recurrenceAttentionRequired,
  evidenceAttentionRequired,
}: {
  historicalReview: CGIHistoricalContinuityReview
  memoryPosture: CGIExecutiveMemoryPosture
  survivabilityAttentionRequired: boolean
  recurrenceAttentionRequired: boolean
  evidenceAttentionRequired: boolean
}): CGIMemoryCompressionUrgency {
  if (historicalReview.snapshotCount === 0) return 'NONE'

  if (
    memoryPosture === 'CRITICAL_MEMORY' ||
    historicalReview.continuityPersistenceSeverity === 'CRITICAL' ||
    historicalReview.institutionalMemoryPressure === 'EXECUTIVE'
  ) {
    return 'EXECUTIVE'
  }

  if (
    memoryPosture === 'ELEVATED_MEMORY' ||
    historicalReview.continuityPersistenceSeverity === 'HIGH' ||
    historicalReview.institutionalMemoryPressure === 'HEAVY'
  ) {
    return 'HIGH'
  }

  if (
    memoryPosture === 'WATCHED_MEMORY' ||
    historicalReview.continuityPersistenceSeverity === 'MODERATE' ||
    historicalReview.institutionalMemoryPressure === 'MODERATE' ||
    survivabilityAttentionRequired ||
    recurrenceAttentionRequired ||
    evidenceAttentionRequired
  ) {
    return 'MODERATE'
  }

  if (
    historicalReview.continuityPersistenceSeverity === 'LOW' ||
    historicalReview.institutionalMemoryPressure === 'LIGHT'
  ) {
    return 'LOW'
  }

  return 'NONE'
}

function deriveCompressionConfidence(
  historicalReview: CGIHistoricalContinuityReview
): CGIMemoryCompressionConfidence {
  if (historicalReview.snapshotCount === 0) return 'NOT_ESTABLISHED'

  const evidenceRatio =
    historicalReview.evidenceVerifiedCount / historicalReview.snapshotCount

  if (
    evidenceRatio >= 0.8 &&
    historicalReview.stabilizationCredibility === 'CREDIBLE'
  ) {
    return 'HIGH'
  }

  if (
    evidenceRatio >= 0.5 ||
    historicalReview.stabilizationCredibility === 'PARTIALLY_CREDIBLE'
  ) {
    return 'MODERATE'
  }

  return 'LOW'
}

function deriveDominantMemoryConcern({
  historicalReview,
  memoryPosture,
  executiveEscalationRequired,
  survivabilityAttentionRequired,
  recurrenceAttentionRequired,
  evidenceAttentionRequired,
}: {
  historicalReview: CGIHistoricalContinuityReview
  memoryPosture: CGIExecutiveMemoryPosture
  executiveEscalationRequired: boolean
  survivabilityAttentionRequired: boolean
  recurrenceAttentionRequired: boolean
  evidenceAttentionRequired: boolean
}) {
  if (historicalReview.snapshotCount === 0) {
    return 'Continuity memory has not yet been established.'
  }

  if (executiveEscalationRequired) {
    return 'Confirmed executive continuity exposure remains visible in institutional memory.'
  }

  if (memoryPosture === 'ELEVATED_MEMORY') {
    return 'Elevated continuity exposure remains visible and should stay under executive review.'
  }

  if (memoryPosture === 'WATCHED_MEMORY' && evidenceAttentionRequired) {
    return 'Continuity exposure is visible, but current memory is not mature enough for critical classification.'
  }

  if (survivabilityAttentionRequired) {
    return 'Survivability pressure remains visible across persisted continuity history.'
  }

  if (recurrenceAttentionRequired) {
    return 'Recurring structural memory is visible and should not be treated as isolated activity.'
  }

  if (evidenceAttentionRequired) {
    return 'Evidence gaps are limiting stabilization credibility.'
  }

  if (historicalReview.continuityImproving) {
    return 'Continuity memory shows improvement, but credibility should remain evidence-based.'
  }

  return 'Continuity memory is currently stable and should remain under routine review.'
}

function deriveRequiredExecutiveAction({
  memoryPosture,
  urgency,
  executiveEscalationRequired,
  survivabilityAttentionRequired,
  recurrenceAttentionRequired,
  evidenceAttentionRequired,
  stabilizationCredible,
}: {
  memoryPosture: CGIExecutiveMemoryPosture
  urgency: CGIMemoryCompressionUrgency
  executiveEscalationRequired: boolean
  survivabilityAttentionRequired: boolean
  recurrenceAttentionRequired: boolean
  evidenceAttentionRequired: boolean
  stabilizationCredible: boolean
}) {
  if (memoryPosture === 'NO_MEMORY') {
    return 'Begin preserving governed continuity memory before executive conclusions are drawn.'
  }

  if (executiveEscalationRequired || urgency === 'EXECUTIVE') {
    return 'Maintain executive escalation until continuity exposure, evidence gaps, and survivability pressure are resolved.'
  }

  if (urgency === 'HIGH') {
    return 'Maintain executive review until elevated continuity exposure is supported by verified stabilization evidence.'
  }

  if (survivabilityAttentionRequired) {
    return 'Keep survivability pressure visible until recovery credibility is supported by evidence.'
  }

  if (recurrenceAttentionRequired) {
    return 'Review recurrence patterns and require stabilization ownership for repeated structural memory.'
  }

  if (evidenceAttentionRequired) {
    return 'Continue evidence follow-up before accepting stabilization credibility.'
  }

  if (stabilizationCredible) {
    return 'Maintain routine memory review and preserve continuity evidence for audit readiness.'
  }

  return 'Continue governed continuity review.'
}

function deriveRequiredEvidence({
  historicalReview,
  evidenceAttentionRequired,
  survivabilityAttentionRequired,
  recurrenceAttentionRequired,
}: {
  historicalReview: CGIHistoricalContinuityReview
  evidenceAttentionRequired: boolean
  survivabilityAttentionRequired: boolean
  recurrenceAttentionRequired: boolean
}) {
  if (historicalReview.snapshotCount === 0) {
    return 'Persisted continuity snapshots are required before evidence can be evaluated.'
  }

  if (evidenceAttentionRequired) {
    return 'Verified stabilization evidence is required before confidence can improve.'
  }

  if (survivabilityAttentionRequired) {
    return 'Recovery credibility evidence and survivability resolution evidence are required.'
  }

  if (recurrenceAttentionRequired) {
    return 'Evidence must show whether recurring exposure was structurally resolved or only temporarily contained.'
  }

  return 'Continue preserving evidence, accountability status, and continuity posture history.'
}

function buildContinuityMemoryStatement(
  historicalReview: CGIHistoricalContinuityReview
) {
  if (historicalReview.snapshotCount === 0) {
    return 'CGI has no continuity memory available for executive compression.'
  }

  return [
    `CGI reviewed ${historicalReview.snapshotCount} persisted continuity records.`,
    `Current posture is ${historicalReview.currentPosture}.`,
    `Historical trend is ${historicalReview.historicalTrendLabel}.`,
    `Stabilization credibility is ${historicalReview.stabilizationCredibilityLabel}.`,
    `Institutional memory pressure is ${historicalReview.institutionalMemoryPressureLabel}.`,
  ].join(' ')
}

function buildBoardLevelReading({
  historicalReview,
  memoryPosture,
  urgency,
  confidence,
  dominantMemoryConcern,
  requiredExecutiveAction,
}: {
  historicalReview: CGIHistoricalContinuityReview
  memoryPosture: CGIExecutiveMemoryPosture
  urgency: CGIMemoryCompressionUrgency
  confidence: CGIMemoryCompressionConfidence
  dominantMemoryConcern: string
  requiredExecutiveAction: string
}) {
  if (historicalReview.snapshotCount === 0) {
    return 'Board-level continuity memory is not yet established. CGI should preserve governed continuity records before leadership conclusions are compressed.'
  }

  return [
    `Board-level memory posture is ${formatCGIExecutiveMemoryPosture(
      memoryPosture
    )}.`,
    `Compression urgency is ${formatCGIMemoryCompressionUrgency(urgency)}.`,
    `Confidence is ${formatCGIMemoryCompressionConfidence(confidence)}.`,
    `Dominant concern: ${dominantMemoryConcern}`,
    `Required executive action: ${requiredExecutiveAction}`,
  ].join(' ')
}

export function formatCGIExecutiveMemoryPosture(
  posture: CGIExecutiveMemoryPosture
) {
  const labels: Record<CGIExecutiveMemoryPosture, string> = {
    NO_MEMORY: 'NO MEMORY',
    STABLE_MEMORY: 'STABLE MEMORY',
    WATCHED_MEMORY: 'WATCHED MEMORY',
    ELEVATED_MEMORY: 'ELEVATED MEMORY',
    CRITICAL_MEMORY: 'CRITICAL MEMORY',
  }

  return labels[posture]
}

export function formatCGIMemoryCompressionUrgency(
  urgency: CGIMemoryCompressionUrgency
) {
  const labels: Record<CGIMemoryCompressionUrgency, string> = {
    NONE: 'NONE',
    LOW: 'LOW',
    MODERATE: 'MODERATE',
    HIGH: 'HIGH',
    EXECUTIVE: 'EXECUTIVE',
  }

  return labels[urgency]
}

export function formatCGIMemoryCompressionConfidence(
  confidence: CGIMemoryCompressionConfidence
) {
  const labels: Record<CGIMemoryCompressionConfidence, string> = {
    NOT_ESTABLISHED: 'NOT ESTABLISHED',
    LOW: 'LOW',
    MODERATE: 'MODERATE',
    HIGH: 'HIGH',
  }

  return labels[confidence]
}