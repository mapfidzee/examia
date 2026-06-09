import {
  compressCGIExecutiveMemory,
  type CGIExecutiveMemoryCompression,
} from './cgiExecutiveMemoryCompressionEngine'
import {
  buildCGIInstitutionalMemory,
  type CGIInstitutionalMemoryOutput,
} from './cgiInstitutionalMemoryEngine'
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
  institutionalMemory: CGIInstitutionalMemoryOutput
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
  snapshots: CGIHistoricalContinuitySnapshot[],
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

  const institutionalMemory = buildCGIInstitutionalMemory({
    historicalRecords: historicalReview.snapshotCount,
    recurringInstabilityCount: recurrencePatternVisible ? 1 : 0,
    recoveryFailureCount:
      evidenceGapVisible || survivabilityExposureVisible ? 1 : 0,
    verifiedRecoveryCount:
      stabilizationCredibilityVisible && !evidenceGapVisible ? 1 : 0,
    commandInterventionCount: escalationRequired ? 1 : 0,
    coordinationIssueCount: evidenceGapVisible ? 1 : 0,
    crossSiteSignalCount:
      recurrencePatternVisible || survivabilityExposureVisible ? 1 : 0,
    executiveReviewCount:
      escalationRequired || boardUrgency === 'EXECUTIVE_REVIEW' ? 1 : 0,
    auditReconstructionCount: historicalReview.snapshotCount > 0 ? 1 : 0,
    survivabilityThreatCount: survivabilityExposureVisible ? 1 : 0,
    unresolvedMemoryGaps: evidenceGapVisible ? 1 : 0,
    lastKnownPattern: compression.dominantMemoryConcern,
  })

  const dominantBoardConcern = deriveDominantBoardConcern({
    historicalReview,
    compression,
    institutionalMemory,
    escalationRequired,
    survivabilityExposureVisible,
    recurrencePatternVisible,
    evidenceGapVisible,
  })

  const requiredBoardAction = deriveRequiredBoardAction({
    boardPosture,
    boardUrgency,
    compression,
    institutionalMemory,
    escalationRequired,
    survivabilityExposureVisible,
    recurrencePatternVisible,
    evidenceGapVisible,
  })

  const requiredBoardEvidence = deriveRequiredBoardEvidence({
    historicalReview,
    compression,
    institutionalMemory,
    survivabilityExposureVisible,
    recurrencePatternVisible,
    evidenceGapVisible,
  })

  const executiveSummary = buildExecutiveSummary({
    historicalReview,
    compression,
    institutionalMemory,
    boardPosture,
    boardUrgency,
    dominantBoardConcern,
    requiredBoardAction,
  })

  const boardReading = buildBoardReading({
    historicalReview,
    compression,
    institutionalMemory,
    boardPosture,
    boardUrgency,
    escalationRequired,
  })

  const memoryDoctrineStatement = [
    'The CGI Executive Memory Board compresses governed continuity memory into executive meaning.',
    'It does not replace operational records, assign blame, or create surveillance.',
    'It preserves continuity posture, recurrence, survivability pressure, evidence credibility, escalation meaning, and doctrine-derived trust across time.',
    `Doctrine trust reading: ${institutionalMemory.doctrine.trustReading}.`,
    `Doctrine movement: ${institutionalMemory.doctrine.requiredMovement}`,
  ].join(' ')

  return {
    historicalReview,
    compression,
    institutionalMemory,
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
  compression: CGIExecutiveMemoryCompression,
): CGIExecutiveMemoryBoardPosture {
  if (compression.memoryPosture === 'NO_MEMORY') return 'NO_MEMORY'
  if (compression.memoryPosture === 'CRITICAL_MEMORY') return 'CRITICAL_BOARD'
  if (compression.memoryPosture === 'ELEVATED_MEMORY') return 'ELEVATED_BOARD'
  if (compression.memoryPosture === 'WATCHED_MEMORY') return 'WATCHED_BOARD'

  return 'STABLE_BOARD'
}

function deriveBoardUrgency(
  compression: CGIExecutiveMemoryCompression,
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
  institutionalMemory,
  escalationRequired,
  survivabilityExposureVisible,
  recurrencePatternVisible,
  evidenceGapVisible,
}: {
  historicalReview: CGIHistoricalContinuityReview
  compression: CGIExecutiveMemoryCompression
  institutionalMemory: CGIInstitutionalMemoryOutput
  escalationRequired: boolean
  survivabilityExposureVisible: boolean
  recurrencePatternVisible: boolean
  evidenceGapVisible: boolean
}) {
  if (historicalReview.snapshotCount === 0) {
    return 'No governed continuity memory has been established yet.'
  }

  if (escalationRequired) {
    return institutionalMemory.doctrine.boardLevelWarning
  }

  if (survivabilityExposureVisible) {
    return 'Survivability exposure is visible in continuity memory and should remain under executive review.'
  }

  if (recurrencePatternVisible) {
    return institutionalMemory.doctrine.institutionalMeaning
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
  institutionalMemory,
  escalationRequired,
  survivabilityExposureVisible,
  recurrencePatternVisible,
  evidenceGapVisible,
}: {
  boardPosture: CGIExecutiveMemoryBoardPosture
  boardUrgency: CGIExecutiveMemoryBoardUrgency
  compression: CGIExecutiveMemoryCompression
  institutionalMemory: CGIInstitutionalMemoryOutput
  escalationRequired: boolean
  survivabilityExposureVisible: boolean
  recurrencePatternVisible: boolean
  evidenceGapVisible: boolean
}) {
  if (boardPosture === 'NO_MEMORY') {
    return 'Begin preserving governed continuity memory before executive compression is used.'
  }

  if (escalationRequired || boardUrgency === 'EXECUTIVE_ACTION') {
    return institutionalMemory.doctrine.executiveDecision
  }

  if (boardUrgency === 'EXECUTIVE_REVIEW') {
    return 'Maintain executive review and require visible stabilization evidence.'
  }

  if (survivabilityExposureVisible) {
    return 'Keep survivability exposure visible until recovery credibility is verified.'
  }

  if (recurrencePatternVisible || evidenceGapVisible) {
    return institutionalMemory.doctrine.requiredMovement
  }

  return compression.requiredExecutiveAction
}

function deriveRequiredBoardEvidence({
  historicalReview,
  compression,
  institutionalMemory,
  survivabilityExposureVisible,
  recurrencePatternVisible,
  evidenceGapVisible,
}: {
  historicalReview: CGIHistoricalContinuityReview
  compression: CGIExecutiveMemoryCompression
  institutionalMemory: CGIInstitutionalMemoryOutput
  survivabilityExposureVisible: boolean
  recurrencePatternVisible: boolean
  evidenceGapVisible: boolean
}) {
  if (historicalReview.snapshotCount === 0) {
    return 'Persisted continuity records are required before board memory evidence can be compressed.'
  }

  if (evidenceGapVisible) {
    return institutionalMemory.evidenceToPreserve
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
  institutionalMemory,
  boardPosture,
  boardUrgency,
  dominantBoardConcern,
  requiredBoardAction,
}: {
  historicalReview: CGIHistoricalContinuityReview
  compression: CGIExecutiveMemoryCompression
  institutionalMemory: CGIInstitutionalMemoryOutput
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
    `Doctrine trust is ${institutionalMemory.doctrine.trustReading}.`,
    `Historical direction is ${historicalReview.directionLabel}.`,
    `Dominant concern: ${dominantBoardConcern}`,
    `Required action: ${requiredBoardAction}`,
  ].join(' ')
}

function buildBoardReading({
  historicalReview,
  compression,
  institutionalMemory,
  boardPosture,
  boardUrgency,
  escalationRequired,
}: {
  historicalReview: CGIHistoricalContinuityReview
  compression: CGIExecutiveMemoryCompression
  institutionalMemory: CGIInstitutionalMemoryOutput
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
    `Doctrine trust level: ${institutionalMemory.doctrine.trustLevel}.`,
    `Escalation required: ${escalationRequired ? 'YES' : 'NO'}.`,
    `Institutional memory pressure: ${historicalReview.institutionalMemoryPressureLabel}.`,
    `Continuity persistence severity: ${historicalReview.continuityPersistenceSeverityLabel}.`,
  ].join(' ')
}

export function formatCGIExecutiveMemoryBoardPosture(
  posture: CGIExecutiveMemoryBoardPosture,
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
  urgency: CGIExecutiveMemoryBoardUrgency,
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