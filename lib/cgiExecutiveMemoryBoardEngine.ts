import {
  compressCGIExecutiveMemory,
  type CGIExecutiveMemoryCompression,
} from './cgiExecutiveMemoryCompressionEngine'
import {
  reviewCGIHistoricalContinuity,
  type CGIHistoricalContinuityReview,
  type CGIHistoricalContinuitySnapshot,
} from './cgiHistoricalContinuityEngine'

export type CGIExecutiveMemoryBoardPosture =
  | 'NO_MEMORY'
  | 'STABLE_BOARD'
  | 'WATCHED_BOARD'
  | 'ELEVATED_BOARD'
  | 'CRITICAL_BOARD'

export type CGIExecutiveMemoryBoardUrgency =
  | 'NONE'
  | 'ROUTINE'
  | 'WATCH'
  | 'EXECUTIVE_REVIEW'
  | 'EXECUTIVE_ACTION'

export type CGIExecutiveMemoryBoard = {
  historicalReview: CGIHistoricalContinuityReview
  compression: CGIExecutiveMemoryCompression
  boardPosture: CGIExecutiveMemoryBoardPosture
  boardPostureLabel: string
  boardUrgency: CGIExecutiveMemoryBoardUrgency
  boardUrgencyLabel: string
  escalationRequired: boolean
  stabilizationCredibilityVisible: boolean
  survivabilityExposureVisible: boolean
  recurrencePatternVisible: boolean
  evidenceGapVisible: boolean
  institutionalMemoryPressure: string
  continuityPersistenceSeverity: string
  executiveSummary: string
  boardReading: string
  dominantBoardConcern: string
  requiredBoardAction: string
  requiredBoardEvidence: string
  memoryDoctrineStatement: string
}

export function buildCGIExecutiveMemoryBoard(
  snapshots: CGIHistoricalContinuitySnapshot[]
): CGIExecutiveMemoryBoard {
  const historicalReview = reviewCGIHistoricalContinuity(snapshots)
  const compression = compressCGIExecutiveMemory(historicalReview)

  const boardPosture = deriveBoardPosture(compression)
  const boardUrgency = deriveBoardUrgency(compression)

  const escalationRequired =
    compression.executiveEscalationRequired ||
    boardUrgency === 'EXECUTIVE_ACTION' ||
    boardPosture === 'CRITICAL_BOARD'

  const stabilizationCredibilityVisible =
    historicalReview.stabilizationCredibility !== 'NO_MEMORY'

  const survivabilityExposureVisible =
    compression.survivabilityAttentionRequired ||
    historicalReview.survivabilityConcernPersisting

  const recurrencePatternVisible =
    compression.recurrenceAttentionRequired ||
    historicalReview.recurrenceVisible

  const evidenceGapVisible =
    compression.evidenceAttentionRequired || historicalReview.evidenceGap

  const dominantBoardConcern = deriveDominantBoardConcern({
    historicalReview,
    compression,
    escalationRequired,
    survivabilityExposureVisible,
    recurrencePatternVisible,
    evidenceGapVisible,
  })

  const requiredBoardAction = deriveRequiredBoardAction({
    boardPosture,
    boardUrgency,
    compression,
    escalationRequired,
    survivabilityExposureVisible,
    recurrencePatternVisible,
    evidenceGapVisible,
  })

  const requiredBoardEvidence = deriveRequiredBoardEvidence({
    historicalReview,
    compression,
    survivabilityExposureVisible,
    recurrencePatternVisible,
    evidenceGapVisible,
  })

  const executiveSummary = buildExecutiveSummary({
    historicalReview,
    compression,
    boardPosture,
    boardUrgency,
    dominantBoardConcern,
    requiredBoardAction,
  })

  const boardReading = buildBoardReading({
    historicalReview,
    compression,
    boardPosture,
    boardUrgency,
    escalationRequired,
  })

  const memoryDoctrineStatement =
    'The CGI Executive Memory Board compresses governed continuity memory into executive meaning. It does not replace operational records, assign blame, or create surveillance. It preserves continuity posture, recurrence, survivability pressure, evidence credibility, and escalation meaning across time.'

  return {
    historicalReview,
    compression,
    boardPosture,
    boardPostureLabel: formatCGIExecutiveMemoryBoardPosture(boardPosture),
    boardUrgency,
    boardUrgencyLabel: formatCGIExecutiveMemoryBoardUrgency(boardUrgency),
    escalationRequired,
    stabilizationCredibilityVisible,
    survivabilityExposureVisible,
    recurrencePatternVisible,
    evidenceGapVisible,
    institutionalMemoryPressure:
      historicalReview.institutionalMemoryPressureLabel,
    continuityPersistenceSeverity:
      historicalReview.continuityPersistenceSeverityLabel,
    executiveSummary,
    boardReading,
    dominantBoardConcern,
    requiredBoardAction,
    requiredBoardEvidence,
    memoryDoctrineStatement,
  }
}

function deriveBoardPosture(
  compression: CGIExecutiveMemoryCompression
): CGIExecutiveMemoryBoardPosture {
  if (compression.memoryPosture === 'NO_MEMORY') return 'NO_MEMORY'
  if (compression.memoryPosture === 'CRITICAL_MEMORY') {
    return 'CRITICAL_BOARD'
  }
  if (compression.memoryPosture === 'ELEVATED_MEMORY') {
    return 'ELEVATED_BOARD'
  }
  if (compression.memoryPosture === 'WATCHED_MEMORY') {
    return 'WATCHED_BOARD'
  }

  return 'STABLE_BOARD'
}

function deriveBoardUrgency(
  compression: CGIExecutiveMemoryCompression
): CGIExecutiveMemoryBoardUrgency {
  if (compression.urgency === 'NONE') return 'NONE'
  if (compression.urgency === 'LOW') return 'ROUTINE'
  if (compression.urgency === 'MODERATE') return 'WATCH'
  if (compression.urgency === 'HIGH') return 'EXECUTIVE_REVIEW'

  return 'EXECUTIVE_ACTION'
}

function deriveDominantBoardConcern({
  historicalReview,
  compression,
  escalationRequired,
  survivabilityExposureVisible,
  recurrencePatternVisible,
  evidenceGapVisible,
}: {
  historicalReview: CGIHistoricalContinuityReview
  compression: CGIExecutiveMemoryCompression
  escalationRequired: boolean
  survivabilityExposureVisible: boolean
  recurrencePatternVisible: boolean
  evidenceGapVisible: boolean
}) {
  if (historicalReview.snapshotCount === 0) {
    return 'No governed continuity memory has been established yet.'
  }

  if (escalationRequired) {
    return 'Executive memory indicates continuity exposure that should remain visible until stabilization credibility improves.'
  }

  if (survivabilityExposureVisible) {
    return 'Survivability exposure is visible in continuity memory and should remain under executive review.'
  }

  if (recurrencePatternVisible) {
    return 'Recurrence is visible in the memory record and should be interpreted as a structural pattern.'
  }

  if (evidenceGapVisible) {
    return 'Evidence gaps are limiting confidence in stabilization credibility.'
  }

  if (compression.stabilizationCredible) {
    return 'Continuity memory is stable enough for routine executive review while preserving audit evidence.'
  }

  return compression.dominantMemoryConcern
}

function deriveRequiredBoardAction({
  boardPosture,
  boardUrgency,
  compression,
  escalationRequired,
  survivabilityExposureVisible,
  recurrencePatternVisible,
  evidenceGapVisible,
}: {
  boardPosture: CGIExecutiveMemoryBoardPosture
  boardUrgency: CGIExecutiveMemoryBoardUrgency
  compression: CGIExecutiveMemoryCompression
  escalationRequired: boolean
  survivabilityExposureVisible: boolean
  recurrencePatternVisible: boolean
  evidenceGapVisible: boolean
}) {
  if (boardPosture === 'NO_MEMORY') {
    return 'Begin preserving governed continuity memory before executive compression is used.'
  }

  if (escalationRequired || boardUrgency === 'EXECUTIVE_ACTION') {
    return 'Keep executive action visible until continuity exposure, survivability pressure, and evidence gaps are resolved.'
  }

  if (boardUrgency === 'EXECUTIVE_REVIEW') {
    return 'Maintain executive review and require visible stabilization evidence.'
  }

  if (survivabilityExposureVisible) {
    return 'Keep survivability exposure visible until recovery credibility is verified.'
  }

  if (recurrencePatternVisible) {
    return 'Review recurrence patterns and require structural stabilization ownership.'
  }

  if (evidenceGapVisible) {
    return 'Require evidence follow-up before accepting stabilization credibility.'
  }

  return compression.requiredExecutiveAction
}

function deriveRequiredBoardEvidence({
  historicalReview,
  compression,
  survivabilityExposureVisible,
  recurrencePatternVisible,
  evidenceGapVisible,
}: {
  historicalReview: CGIHistoricalContinuityReview
  compression: CGIExecutiveMemoryCompression
  survivabilityExposureVisible: boolean
  recurrencePatternVisible: boolean
  evidenceGapVisible: boolean
}) {
  if (historicalReview.snapshotCount === 0) {
    return 'Persisted continuity records are required before board memory evidence can be compressed.'
  }

  if (evidenceGapVisible) {
    return 'Verified stabilization evidence is required for unresolved continuity memory.'
  }

  if (survivabilityExposureVisible) {
    return 'Recovery credibility evidence is required for survivability exposure.'
  }

  if (recurrencePatternVisible) {
    return 'Evidence must show whether recurrence was structurally resolved or temporarily contained.'
  }

  return compression.requiredEvidence
}

function buildExecutiveSummary({
  historicalReview,
  compression,
  boardPosture,
  boardUrgency,
  dominantBoardConcern,
  requiredBoardAction,
}: {
  historicalReview: CGIHistoricalContinuityReview
  compression: CGIExecutiveMemoryCompression
  boardPosture: CGIExecutiveMemoryBoardPosture
  boardUrgency: CGIExecutiveMemoryBoardUrgency
  dominantBoardConcern: string
  requiredBoardAction: string
}) {
  if (historicalReview.snapshotCount === 0) {
    return 'CGI has not yet accumulated governed continuity memory for board-level compression.'
  }

  return [
    `Board posture is ${formatCGIExecutiveMemoryBoardPosture(boardPosture)}.`,
    `Board urgency is ${formatCGIExecutiveMemoryBoardUrgency(boardUrgency)}.`,
    `Memory posture is ${compression.memoryPostureLabel}.`,
    `Historical direction is ${historicalReview.directionLabel}.`,
    `Dominant concern: ${dominantBoardConcern}`,
    `Required action: ${requiredBoardAction}`,
  ].join(' ')
}

function buildBoardReading({
  historicalReview,
  compression,
  boardPosture,
  boardUrgency,
  escalationRequired,
}: {
  historicalReview: CGIHistoricalContinuityReview
  compression: CGIExecutiveMemoryCompression
  boardPosture: CGIExecutiveMemoryBoardPosture
  boardUrgency: CGIExecutiveMemoryBoardUrgency
  escalationRequired: boolean
}) {
  if (historicalReview.snapshotCount === 0) {
    return 'No board-level continuity memory reading is available yet.'
  }

  return [
    `CGI compressed ${historicalReview.snapshotCount} continuity memory records.`,
    `Board posture: ${formatCGIExecutiveMemoryBoardPosture(boardPosture)}.`,
    `Urgency: ${formatCGIExecutiveMemoryBoardUrgency(boardUrgency)}.`,
    `Compression confidence: ${compression.confidenceLabel}.`,
    `Escalation required: ${escalationRequired ? 'YES' : 'NO'}.`,
    `Institutional memory pressure: ${historicalReview.institutionalMemoryPressureLabel}.`,
    `Continuity persistence severity: ${historicalReview.continuityPersistenceSeverityLabel}.`,
  ].join(' ')
}

export function formatCGIExecutiveMemoryBoardPosture(
  posture: CGIExecutiveMemoryBoardPosture
) {
  const labels: Record<CGIExecutiveMemoryBoardPosture, string> = {
    NO_MEMORY: 'NO MEMORY',
    STABLE_BOARD: 'STABLE BOARD',
    WATCHED_BOARD: 'WATCHED BOARD',
    ELEVATED_BOARD: 'ELEVATED BOARD',
    CRITICAL_BOARD: 'CRITICAL BOARD',
  }

  return labels[posture]
}

export function formatCGIExecutiveMemoryBoardUrgency(
  urgency: CGIExecutiveMemoryBoardUrgency
) {
  const labels: Record<CGIExecutiveMemoryBoardUrgency, string> = {
    NONE: 'NONE',
    ROUTINE: 'ROUTINE',
    WATCH: 'WATCH',
    EXECUTIVE_REVIEW: 'EXECUTIVE REVIEW',
    EXECUTIVE_ACTION: 'EXECUTIVE ACTION',
  }

  return labels[urgency]
}