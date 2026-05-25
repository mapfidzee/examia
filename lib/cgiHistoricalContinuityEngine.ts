export type CGIHistoricalContinuitySnapshot = {
  id?: string
  created_at?: string
  snapshot_label?: string | null
  source_route?: string | null
  continuity_posture: string
  continuity_confidence?: string | null
  survivability_pressure?: string | null
  recovery_credibility?: string | null
  recurrence_severity?: string | null
  dominant_concern?: string | null
  executive_reading?: string | null
  required_action?: string | null
  required_evidence?: string | null
  evidence_verified?: boolean
  accountability_active?: boolean
  structural_memory_visible?: boolean
  raw_payload?: Record<string, unknown>
}

export type CGIHistoricalContinuityDirection =
  | 'NO_MEMORY'
  | 'MEMORY_STABLE'
  | 'HOLDING_UNDER_PRESSURE'
  | 'IMPROVING_WITH_MEMORY'
  | 'CRITICAL_EXPOSURE_PRESENT'
  | 'DRIFTING_TOWARD_CRITICAL_EXPOSURE'

export type CGIHistoricalContinuityReview = {
  latest: CGIHistoricalContinuitySnapshot | null
  oldest: CGIHistoricalContinuitySnapshot | null
  snapshotCount: number
  elevatedCount: number
  criticalCount: number
  stableOrWatchedCount: number
  structuralMemoryCount: number
  evidenceVerifiedCount: number
  accountabilityActiveCount: number
  continuityDriftDetected: boolean
  continuityImproving: boolean
  survivabilityConcernPersisting: boolean
  recurrenceVisible: boolean
  evidenceGap: boolean
  direction: CGIHistoricalContinuityDirection
  directionLabel: string
  currentPosture: string
  executiveMeaning: string
  recurrenceMeaning: string
  survivabilityMeaning: string
  evidenceMeaning: string
  requiredHistoryAction: string
  memoryCompressionSummary: string
}

const postureWeight: Record<string, number> = {
  STABLE: 1,
  WATCHED: 2,
  ELEVATED: 3,
  CRITICAL: 4,
}

function normalizePosture(posture: string | null | undefined) {
  return String(posture || 'NOT_RECORDED').toUpperCase()
}

function getPostureWeight(posture: string | null | undefined) {
  return postureWeight[normalizePosture(posture)] ?? 0
}

function isElevatedOrCritical(snapshot: CGIHistoricalContinuitySnapshot) {
  return ['ELEVATED', 'CRITICAL'].includes(
    normalizePosture(snapshot.continuity_posture)
  )
}

function isStableOrWatched(snapshot: CGIHistoricalContinuitySnapshot) {
  return ['STABLE', 'WATCHED'].includes(
    normalizePosture(snapshot.continuity_posture)
  )
}

function includesReviewLanguage(value: string | null | undefined) {
  return String(value || '').toUpperCase().includes('REVIEW')
}

function includesRecurrenceLanguage(value: string | null | undefined) {
  const normalized = String(value || '').toUpperCase()

  return (
    normalized.includes('RECUR') ||
    normalized.includes('REPEAT') ||
    normalized.includes('PERSIST')
  )
}

export function reviewCGIHistoricalContinuity(
  snapshots: CGIHistoricalContinuitySnapshot[]
): CGIHistoricalContinuityReview {
  const orderedSnapshots = [...snapshots]

  const latest = orderedSnapshots[0] || null
  const oldest = orderedSnapshots[orderedSnapshots.length - 1] || null

  const elevatedCount = orderedSnapshots.filter(isElevatedOrCritical).length

  const criticalCount = orderedSnapshots.filter(
    (snapshot) => normalizePosture(snapshot.continuity_posture) === 'CRITICAL'
  ).length

  const stableOrWatchedCount =
    orderedSnapshots.filter(isStableOrWatched).length

  const structuralMemoryCount = orderedSnapshots.filter(
    (snapshot) => Boolean(snapshot.structural_memory_visible)
  ).length

  const evidenceVerifiedCount = orderedSnapshots.filter(
    (snapshot) => Boolean(snapshot.evidence_verified)
  ).length

  const accountabilityActiveCount = orderedSnapshots.filter(
    (snapshot) => Boolean(snapshot.accountability_active)
  ).length

  const latestWeight = getPostureWeight(latest?.continuity_posture)
  const oldestWeight = getPostureWeight(oldest?.continuity_posture)

  const continuityDriftDetected =
    orderedSnapshots.length > 1
      ? latestWeight > oldestWeight
      : elevatedCount > 0 || criticalCount > 0

  const continuityImproving =
    orderedSnapshots.length > 1 && latestWeight < oldestWeight

  const survivabilityConcernPersisting =
    criticalCount > 1 ||
    orderedSnapshots.filter((snapshot) =>
      includesReviewLanguage(snapshot.survivability_pressure)
    ).length > 1

  const recurrenceVisible =
    structuralMemoryCount > 1 ||
    orderedSnapshots.filter((snapshot) =>
      includesRecurrenceLanguage(snapshot.recurrence_severity)
    ).length > 1

  const evidenceGap =
    orderedSnapshots.length > 0 &&
    evidenceVerifiedCount < orderedSnapshots.length

  const direction: CGIHistoricalContinuityDirection =
    orderedSnapshots.length === 0
      ? 'NO_MEMORY'
      : criticalCount > 0 && continuityDriftDetected
        ? 'DRIFTING_TOWARD_CRITICAL_EXPOSURE'
        : criticalCount > 0
          ? 'CRITICAL_EXPOSURE_PRESENT'
          : continuityImproving
            ? 'IMPROVING_WITH_MEMORY'
            : elevatedCount > 0
              ? 'HOLDING_UNDER_PRESSURE'
              : 'MEMORY_STABLE'

  const directionLabel = formatCGIHistoricalDirection(direction)
  const currentPosture = normalizePosture(latest?.continuity_posture)

  const executiveMeaning =
    orderedSnapshots.length === 0
      ? 'CGI has not yet accumulated persisted continuity snapshots for historical review.'
      : continuityDriftDetected
        ? 'Persisted continuity memory shows worsening or persistent exposure that requires continued executive review.'
        : continuityImproving
          ? 'Persisted continuity memory shows movement toward improved continuity posture, but evidence must remain visible until stabilization is credible.'
          : elevatedCount > 0 || criticalCount > 0
            ? 'Persisted continuity memory shows active exposure that should remain visible until stabilization evidence is verified.'
            : 'Persisted continuity memory is available and currently shows no elevated continuity drift.'

  const recurrenceMeaning =
    recurrenceVisible
      ? 'Structural memory or recurrence signals are appearing repeatedly. CGI should treat this as a pattern, not an isolated event.'
      : 'No repeated recurrence pattern is yet strong enough to dominate the continuity history.'

  const survivabilityMeaning =
    survivabilityConcernPersisting
      ? 'Survivability concern appears more than once in persisted memory and should remain under executive review.'
      : 'Survivability concern is not yet persisting strongly across the available continuity memory.'

  const evidenceMeaning =
    orderedSnapshots.length === 0
      ? 'Evidence posture is not yet available because continuity memory has not been accumulated.'
      : evidenceGap
        ? 'At least one persisted continuity record still lacks verified evidence, so stabilization credibility remains incomplete.'
        : 'Available continuity records show verified evidence across the current memory set.'

  const requiredHistoryAction =
    orderedSnapshots.length === 0
      ? 'Begin preserving continuity snapshots.'
      : continuityDriftDetected
        ? 'Escalate continuity history review and require current stabilization evidence.'
        : survivabilityConcernPersisting
          ? 'Keep survivability exposure visible until evidence confirms recovery credibility.'
          : evidenceGap
            ? 'Continue evidence follow-up until continuity memory becomes fully verifiable.'
            : 'Maintain continuity memory review.'

  const memoryCompressionSummary =
    orderedSnapshots.length === 0
      ? 'No executive continuity memory is available for compression.'
      : [
          `Current posture: ${currentPosture}.`,
          `Direction: ${directionLabel}.`,
          `Critical records: ${criticalCount}.`,
          `Elevated records: ${elevatedCount}.`,
          `Structural memory records: ${structuralMemoryCount}.`,
          `Evidence verified records: ${evidenceVerifiedCount}.`,
          `Required action: ${requiredHistoryAction}`,
        ].join(' ')

  return {
    latest,
    oldest,
    snapshotCount: orderedSnapshots.length,
    elevatedCount,
    criticalCount,
    stableOrWatchedCount,
    structuralMemoryCount,
    evidenceVerifiedCount,
    accountabilityActiveCount,
    continuityDriftDetected,
    continuityImproving,
    survivabilityConcernPersisting,
    recurrenceVisible,
    evidenceGap,
    direction,
    directionLabel,
    currentPosture,
    executiveMeaning,
    recurrenceMeaning,
    survivabilityMeaning,
    evidenceMeaning,
    requiredHistoryAction,
    memoryCompressionSummary,
  }
}

export function formatCGIHistoricalDirection(
  direction: CGIHistoricalContinuityDirection
) {
  const labels: Record<CGIHistoricalContinuityDirection, string> = {
    NO_MEMORY: 'NO MEMORY',
    MEMORY_STABLE: 'MEMORY STABLE',
    HOLDING_UNDER_PRESSURE: 'HOLDING UNDER PRESSURE',
    IMPROVING_WITH_MEMORY: 'IMPROVING WITH MEMORY',
    CRITICAL_EXPOSURE_PRESENT: 'CRITICAL EXPOSURE PRESENT',
    DRIFTING_TOWARD_CRITICAL_EXPOSURE:
      'DRIFTING TOWARD CRITICAL EXPOSURE',
  }

  return labels[direction]
}

export function getCGIHistoricalDirectionSeverity(
  direction: CGIHistoricalContinuityDirection
) {
  const severity: Record<CGIHistoricalContinuityDirection, number> = {
    NO_MEMORY: 0,
    MEMORY_STABLE: 1,
    IMPROVING_WITH_MEMORY: 2,
    HOLDING_UNDER_PRESSURE: 3,
    CRITICAL_EXPOSURE_PRESENT: 4,
    DRIFTING_TOWARD_CRITICAL_EXPOSURE: 5,
  }

  return severity[direction]
}