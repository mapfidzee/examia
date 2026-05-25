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

export type CGIHistoricalTrend =
  | 'NO_TREND'
  | 'STABLE_TREND'
  | 'IMPROVING_TREND'
  | 'PRESSURE_HOLDING'
  | 'DETERIORATING_TREND'
  | 'CRITICAL_PERSISTENCE'

export type CGIRecoveryTrajectory =
  | 'NOT_ESTABLISHED'
  | 'RECOVERY_CREDIBLE'
  | 'RECOVERY_UNDER_REVIEW'
  | 'RECOVERY_WEAK'
  | 'RECOVERY_NOT_CREDIBLE'

export type CGIStabilizationCredibility =
  | 'NO_MEMORY'
  | 'CREDIBLE'
  | 'PARTIALLY_CREDIBLE'
  | 'NOT_YET_CREDIBLE'
  | 'EVIDENCE_DEFICIENT'

export type CGIInstitutionalMemoryPressure =
  | 'NONE'
  | 'LIGHT'
  | 'MODERATE'
  | 'HEAVY'
  | 'EXECUTIVE'

export type CGIContinuityPersistenceSeverity =
  | 'NONE'
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'

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
  executiveEscalationRequired: boolean
  direction: CGIHistoricalContinuityDirection
  directionLabel: string
  currentPosture: string
  historicalTrend: CGIHistoricalTrend
  historicalTrendLabel: string
  recoveryTrajectory: CGIRecoveryTrajectory
  recoveryTrajectoryLabel: string
  stabilizationCredibility: CGIStabilizationCredibility
  stabilizationCredibilityLabel: string
  institutionalMemoryPressure: CGIInstitutionalMemoryPressure
  institutionalMemoryPressureLabel: string
  continuityPersistenceSeverity: CGIContinuityPersistenceSeverity
  continuityPersistenceSeverityLabel: string
  executiveMeaning: string
  recurrenceMeaning: string
  survivabilityMeaning: string
  evidenceMeaning: string
  trajectoryMeaning: string
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

function includesWeakRecoveryLanguage(value: string | null | undefined) {
  const normalized = String(value || '').toUpperCase()

  return (
    normalized.includes('WEAK') ||
    normalized.includes('NOT CREDIBLE') ||
    normalized.includes('INCOMPLETE') ||
    normalized.includes('UNDER REVIEW')
  )
}

function includesCredibleRecoveryLanguage(value: string | null | undefined) {
  const normalized = String(value || '').toUpperCase()

  return (
    normalized.includes('CREDIBLE') ||
    normalized.includes('VERIFIED') ||
    normalized.includes('STABIL')
  )
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

  const weakRecoveryCount = orderedSnapshots.filter((snapshot) =>
    includesWeakRecoveryLanguage(snapshot.recovery_credibility)
  ).length

  const credibleRecoveryCount = orderedSnapshots.filter((snapshot) =>
    includesCredibleRecoveryLanguage(snapshot.recovery_credibility)
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

  const executiveEscalationRequired =
    criticalCount > 0 ||
    survivabilityConcernPersisting ||
    (continuityDriftDetected && evidenceGap)

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

  const historicalTrend = deriveHistoricalTrend({
    snapshotCount: orderedSnapshots.length,
    criticalCount,
    elevatedCount,
    continuityDriftDetected,
    continuityImproving,
  })

  const recoveryTrajectory = deriveRecoveryTrajectory({
    snapshotCount: orderedSnapshots.length,
    evidenceVerifiedCount,
    credibleRecoveryCount,
    weakRecoveryCount,
    evidenceGap,
    criticalCount,
  })

  const stabilizationCredibility = deriveStabilizationCredibility({
    snapshotCount: orderedSnapshots.length,
    evidenceVerifiedCount,
    evidenceGap,
    continuityDriftDetected,
    criticalCount,
  })

  const institutionalMemoryPressure = deriveInstitutionalMemoryPressure({
    snapshotCount: orderedSnapshots.length,
    criticalCount,
    elevatedCount,
    structuralMemoryCount,
    recurrenceVisible,
  })

  const continuityPersistenceSeverity = deriveContinuityPersistenceSeverity({
    snapshotCount: orderedSnapshots.length,
    criticalCount,
    elevatedCount,
    structuralMemoryCount,
    survivabilityConcernPersisting,
    recurrenceVisible,
    evidenceGap,
  })

  const directionLabel = formatCGIHistoricalDirection(direction)
  const historicalTrendLabel = formatCGIHistoricalTrend(historicalTrend)
  const recoveryTrajectoryLabel =
    formatCGIRecoveryTrajectory(recoveryTrajectory)
  const stabilizationCredibilityLabel =
    formatCGIStabilizationCredibility(stabilizationCredibility)
  const institutionalMemoryPressureLabel =
    formatCGIInstitutionalMemoryPressure(institutionalMemoryPressure)
  const continuityPersistenceSeverityLabel =
    formatCGIContinuityPersistenceSeverity(continuityPersistenceSeverity)

  const currentPosture = normalizePosture(latest?.continuity_posture)

  const executiveMeaning =
    orderedSnapshots.length === 0
      ? 'CGI has not yet accumulated persisted continuity snapshots for historical review.'
      : executiveEscalationRequired
        ? 'Persisted continuity memory shows exposure requiring executive visibility, evidence follow-up, and stabilization accountability.'
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

  const trajectoryMeaning = buildTrajectoryMeaning({
    historicalTrend,
    recoveryTrajectory,
    stabilizationCredibility,
    institutionalMemoryPressure,
    continuityPersistenceSeverity,
  })

  const requiredHistoryAction =
    orderedSnapshots.length === 0
      ? 'Begin preserving continuity snapshots.'
      : executiveEscalationRequired
        ? 'Keep executive escalation visible until continuity exposure, evidence gaps, and survivability pressure are resolved.'
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
          `Trend: ${historicalTrendLabel}.`,
          `Recovery trajectory: ${recoveryTrajectoryLabel}.`,
          `Stabilization credibility: ${stabilizationCredibilityLabel}.`,
          `Institutional memory pressure: ${institutionalMemoryPressureLabel}.`,
          `Persistence severity: ${continuityPersistenceSeverityLabel}.`,
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
    executiveEscalationRequired,
    direction,
    directionLabel,
    currentPosture,
    historicalTrend,
    historicalTrendLabel,
    recoveryTrajectory,
    recoveryTrajectoryLabel,
    stabilizationCredibility,
    stabilizationCredibilityLabel,
    institutionalMemoryPressure,
    institutionalMemoryPressureLabel,
    continuityPersistenceSeverity,
    continuityPersistenceSeverityLabel,
    executiveMeaning,
    recurrenceMeaning,
    survivabilityMeaning,
    evidenceMeaning,
    trajectoryMeaning,
    requiredHistoryAction,
    memoryCompressionSummary,
  }
}

function deriveHistoricalTrend({
  snapshotCount,
  criticalCount,
  elevatedCount,
  continuityDriftDetected,
  continuityImproving,
}: {
  snapshotCount: number
  criticalCount: number
  elevatedCount: number
  continuityDriftDetected: boolean
  continuityImproving: boolean
}): CGIHistoricalTrend {
  if (snapshotCount === 0) return 'NO_TREND'
  if (criticalCount > 1) return 'CRITICAL_PERSISTENCE'
  if (continuityDriftDetected) return 'DETERIORATING_TREND'
  if (continuityImproving) return 'IMPROVING_TREND'
  if (elevatedCount > 0) return 'PRESSURE_HOLDING'

  return 'STABLE_TREND'
}

function deriveRecoveryTrajectory({
  snapshotCount,
  evidenceVerifiedCount,
  credibleRecoveryCount,
  weakRecoveryCount,
  evidenceGap,
  criticalCount,
}: {
  snapshotCount: number
  evidenceVerifiedCount: number
  credibleRecoveryCount: number
  weakRecoveryCount: number
  evidenceGap: boolean
  criticalCount: number
}): CGIRecoveryTrajectory {
  if (snapshotCount === 0) return 'NOT_ESTABLISHED'
  if (criticalCount > 0 && evidenceGap) return 'RECOVERY_NOT_CREDIBLE'
  if (weakRecoveryCount > 0) return 'RECOVERY_WEAK'
  if (evidenceGap) return 'RECOVERY_UNDER_REVIEW'
  if (credibleRecoveryCount > 0 || evidenceVerifiedCount === snapshotCount) {
    return 'RECOVERY_CREDIBLE'
  }

  return 'RECOVERY_UNDER_REVIEW'
}

function deriveStabilizationCredibility({
  snapshotCount,
  evidenceVerifiedCount,
  evidenceGap,
  continuityDriftDetected,
  criticalCount,
}: {
  snapshotCount: number
  evidenceVerifiedCount: number
  evidenceGap: boolean
  continuityDriftDetected: boolean
  criticalCount: number
}): CGIStabilizationCredibility {
  if (snapshotCount === 0) return 'NO_MEMORY'
  if (evidenceVerifiedCount === 0) return 'EVIDENCE_DEFICIENT'
  if (criticalCount > 0 || continuityDriftDetected) return 'NOT_YET_CREDIBLE'
  if (evidenceGap) return 'PARTIALLY_CREDIBLE'

  return 'CREDIBLE'
}

function deriveInstitutionalMemoryPressure({
  snapshotCount,
  criticalCount,
  elevatedCount,
  structuralMemoryCount,
  recurrenceVisible,
}: {
  snapshotCount: number
  criticalCount: number
  elevatedCount: number
  structuralMemoryCount: number
  recurrenceVisible: boolean
}): CGIInstitutionalMemoryPressure {
  if (snapshotCount === 0) return 'NONE'
  if (criticalCount > 1 || (criticalCount > 0 && recurrenceVisible)) {
    return 'EXECUTIVE'
  }
  if (criticalCount > 0 || structuralMemoryCount > 2) return 'HEAVY'
  if (elevatedCount > 1 || structuralMemoryCount > 1) return 'MODERATE'
  if (elevatedCount > 0 || structuralMemoryCount > 0) return 'LIGHT'

  return 'NONE'
}

function deriveContinuityPersistenceSeverity({
  snapshotCount,
  criticalCount,
  elevatedCount,
  structuralMemoryCount,
  survivabilityConcernPersisting,
  recurrenceVisible,
  evidenceGap,
}: {
  snapshotCount: number
  criticalCount: number
  elevatedCount: number
  structuralMemoryCount: number
  survivabilityConcernPersisting: boolean
  recurrenceVisible: boolean
  evidenceGap: boolean
}): CGIContinuityPersistenceSeverity {
  if (snapshotCount === 0) return 'NONE'
  if (criticalCount > 1 || (survivabilityConcernPersisting && evidenceGap)) {
    return 'CRITICAL'
  }
  if (criticalCount > 0 || recurrenceVisible) return 'HIGH'
  if (elevatedCount > 1 || structuralMemoryCount > 1) return 'MODERATE'
  if (elevatedCount > 0 || evidenceGap) return 'LOW'

  return 'NONE'
}

function buildTrajectoryMeaning({
  historicalTrend,
  recoveryTrajectory,
  stabilizationCredibility,
  institutionalMemoryPressure,
  continuityPersistenceSeverity,
}: {
  historicalTrend: CGIHistoricalTrend
  recoveryTrajectory: CGIRecoveryTrajectory
  stabilizationCredibility: CGIStabilizationCredibility
  institutionalMemoryPressure: CGIInstitutionalMemoryPressure
  continuityPersistenceSeverity: CGIContinuityPersistenceSeverity
}) {
  return [
    `Historical trend is ${formatCGIHistoricalTrend(historicalTrend)}.`,
    `Recovery trajectory is ${formatCGIRecoveryTrajectory(recoveryTrajectory)}.`,
    `Stabilization credibility is ${formatCGIStabilizationCredibility(
      stabilizationCredibility
    )}.`,
    `Institutional memory pressure is ${formatCGIInstitutionalMemoryPressure(
      institutionalMemoryPressure
    )}.`,
    `Continuity persistence severity is ${formatCGIContinuityPersistenceSeverity(
      continuityPersistenceSeverity
    )}.`,
  ].join(' ')
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

export function formatCGIHistoricalTrend(trend: CGIHistoricalTrend) {
  const labels: Record<CGIHistoricalTrend, string> = {
    NO_TREND: 'NO TREND',
    STABLE_TREND: 'STABLE TREND',
    IMPROVING_TREND: 'IMPROVING TREND',
    PRESSURE_HOLDING: 'PRESSURE HOLDING',
    DETERIORATING_TREND: 'DETERIORATING TREND',
    CRITICAL_PERSISTENCE: 'CRITICAL PERSISTENCE',
  }

  return labels[trend]
}

export function formatCGIRecoveryTrajectory(
  trajectory: CGIRecoveryTrajectory
) {
  const labels: Record<CGIRecoveryTrajectory, string> = {
    NOT_ESTABLISHED: 'NOT ESTABLISHED',
    RECOVERY_CREDIBLE: 'RECOVERY CREDIBLE',
    RECOVERY_UNDER_REVIEW: 'RECOVERY UNDER REVIEW',
    RECOVERY_WEAK: 'RECOVERY WEAK',
    RECOVERY_NOT_CREDIBLE: 'RECOVERY NOT CREDIBLE',
  }

  return labels[trajectory]
}

export function formatCGIStabilizationCredibility(
  credibility: CGIStabilizationCredibility
) {
  const labels: Record<CGIStabilizationCredibility, string> = {
    NO_MEMORY: 'NO MEMORY',
    CREDIBLE: 'CREDIBLE',
    PARTIALLY_CREDIBLE: 'PARTIALLY CREDIBLE',
    NOT_YET_CREDIBLE: 'NOT YET CREDIBLE',
    EVIDENCE_DEFICIENT: 'EVIDENCE DEFICIENT',
  }

  return labels[credibility]
}

export function formatCGIInstitutionalMemoryPressure(
  pressure: CGIInstitutionalMemoryPressure
) {
  const labels: Record<CGIInstitutionalMemoryPressure, string> = {
    NONE: 'NONE',
    LIGHT: 'LIGHT',
    MODERATE: 'MODERATE',
    HEAVY: 'HEAVY',
    EXECUTIVE: 'EXECUTIVE',
  }

  return labels[pressure]
}

export function formatCGIContinuityPersistenceSeverity(
  severity: CGIContinuityPersistenceSeverity
) {
  const labels: Record<CGIContinuityPersistenceSeverity, string> = {
    NONE: 'NONE',
    LOW: 'LOW',
    MODERATE: 'MODERATE',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
  }

  return labels[severity]
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