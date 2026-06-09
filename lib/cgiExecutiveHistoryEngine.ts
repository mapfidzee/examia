import { buildContinuityDerivationStandard } from './cgiContinuityDerivationStandard'
import { buildContinuityTrustAssessment } from './cgiContinuityTrustEngine'
import type {
  ContinuityTrustAssessment,
  ContinuityTrustInput,
} from './cgiContinuityTrustEngine'
import type { CGIContinuitySnapshot } from './cgiContinuitySnapshotEngine'
import type { CGIRouteSynthesisPosture } from './cgiCrossRouteContinuitySynthesisEngine'

export type CGIContinuityHistoryDirection =
  | 'IMPROVING'
  | 'HOLDING'
  | 'WORSENING'
  | 'INSUFFICIENT_HISTORY'

export type CGIExecutiveHistoryReview = {
  snapshotCount: number
  currentPosture: CGIRouteSynthesisPosture
  previousPosture: CGIRouteSynthesisPosture | null
  direction: CGIContinuityHistoryDirection
  continuityDriftDetected: boolean
  survivabilityConcernPersisting: boolean
  executiveMeaning: string
  requiredHistoryAction: string
  timelineSummary: string
  trustAssessment: ContinuityTrustAssessment
  continuityStandard: {
    whatIsVisible: string
    whyItMatters: string
    continuityRisk: string
    requiredMovement: string
    trustLevel: string
    institutionalMeaning: string
  }
}

const postureWeight: Record<CGIRouteSynthesisPosture, number> = {
  STABLE: 1,
  WATCHED: 2,
  ELEVATED: 3,
  CRITICAL: 4,
}

function deriveDirection(
  current: CGIRouteSynthesisPosture,
  previous: CGIRouteSynthesisPosture | null,
  count: number,
): CGIContinuityHistoryDirection {
  if (count < 2 || previous === null) {
    return 'INSUFFICIENT_HISTORY'
  }

  if (postureWeight[current] > postureWeight[previous]) {
    return 'WORSENING'
  }

  if (postureWeight[current] < postureWeight[previous]) {
    return 'IMPROVING'
  }

  return 'HOLDING'
}

function buildHistoryTrustInput({
  ordered,
  currentPosture,
  direction,
  survivabilityConcernPersisting,
  continuityDriftDetected,
}: {
  ordered: CGIContinuitySnapshot[]
  currentPosture: CGIRouteSynthesisPosture
  direction: CGIContinuityHistoryDirection
  survivabilityConcernPersisting: boolean
  continuityDriftDetected: boolean
}): ContinuityTrustInput {
  const criticalCount = ordered.filter(
    (snapshot) => snapshot.synthesisPosture === 'CRITICAL',
  ).length

  const elevatedCount = ordered.filter(
    (snapshot) => snapshot.synthesisPosture === 'ELEVATED',
  ).length

  const watchedCount = ordered.filter(
    (snapshot) => snapshot.synthesisPosture === 'WATCHED',
  ).length

  const stableCount = ordered.filter(
    (snapshot) => snapshot.synthesisPosture === 'STABLE',
  ).length

  return {
    activeInstability: criticalCount + elevatedCount + watchedCount,
    recoveryRecords: ordered.length,
    fragileRecovery:
      currentPosture === 'WATCHED' ||
      currentPosture === 'ELEVATED' ||
      currentPosture === 'CRITICAL'
        ? 1
        : 0,
    commandPressure:
      currentPosture === 'CRITICAL' ||
      continuityDriftDetected ||
      survivabilityConcernPersisting
        ? 1
        : 0,
    evidenceReturn:
      direction === 'INSUFFICIENT_HISTORY' || continuityDriftDetected ? 1 : 0,
    absorbable:
      stableCount > 0 &&
      currentPosture === 'STABLE' &&
      !continuityDriftDetected &&
      !survivabilityConcernPersisting
        ? 1
        : 0,
    historicalMemory: ordered.length,
    recurrenceVisible:
      direction === 'WORSENING' || survivabilityConcernPersisting ? 1 : 0,
    coordinationPressure: continuityDriftDetected ? 1 : 0,
    crossSitePressure: survivabilityConcernPersisting ? 2 : 0,
    auditPressure: ordered.length > 0 ? 1 : 0,
    safeguardingVisible: criticalCount,
    posture: currentPosture,
  }
}

function deriveVisibleSignal({
  direction,
  currentPosture,
  survivabilityConcernPersisting,
  continuityDriftDetected,
}: {
  direction: CGIContinuityHistoryDirection
  currentPosture: CGIRouteSynthesisPosture
  survivabilityConcernPersisting: boolean
  continuityDriftDetected: boolean
}) {
  if (survivabilityConcernPersisting) {
    return 'Persisting survivability concern across executive history'
  }

  if (continuityDriftDetected) {
    return 'Continuity drift across preserved snapshots'
  }

  if (direction === 'WORSENING') {
    return 'Worsening continuity direction'
  }

  if (direction === 'IMPROVING') {
    return 'Improving continuity direction'
  }

  if (direction === 'HOLDING') {
    return `Continuity holding at ${currentPosture}`
  }

  return 'Insufficient executive continuity history'
}

function deriveHistoryMeaning({
  direction,
  currentPosture,
  trustAssessment,
}: {
  direction: CGIContinuityHistoryDirection
  currentPosture: CGIRouteSynthesisPosture
  trustAssessment: ContinuityTrustAssessment
}) {
  if (direction === 'INSUFFICIENT_HISTORY') {
    return 'Too few continuity snapshots exist to determine whether institutional continuity is improving, holding, or worsening.'
  }

  if (direction === 'WORSENING') {
    return trustAssessment.finalInterpretation
  }

  if (direction === 'IMPROVING') {
    return 'Continuity posture is improving across reviewed snapshots, but stabilization should remain evidence-based before confidence is restored.'
  }

  if (currentPosture === 'CRITICAL') {
    return 'Continuity posture is holding at a critical level. This means instability is persisting rather than resolving.'
  }

  return trustAssessment.institutionalMeaning
}

function deriveHistoryAction({
  direction,
  currentPosture,
  trustAssessment,
}: {
  direction: CGIContinuityHistoryDirection
  currentPosture: CGIRouteSynthesisPosture
  trustAssessment: ContinuityTrustAssessment
}) {
  if (direction === 'INSUFFICIENT_HISTORY') {
    return 'Continue preserving continuity snapshots until a reliable executive history exists.'
  }

  if (direction === 'WORSENING') {
    return trustAssessment.executiveDecision
  }

  if (direction === 'IMPROVING') {
    return 'Maintain confirmation monitoring and verify that recovery credibility continues to hold.'
  }

  if (currentPosture === 'CRITICAL') {
    return 'Keep executive coordination active until continuity credibility improves.'
  }

  return trustAssessment.executiveDecision
}

export function reviewCGIExecutiveHistory(
  snapshots: CGIContinuitySnapshot[],
): CGIExecutiveHistoryReview {
  const ordered = [...snapshots].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  const current = ordered[ordered.length - 1] || null
  const previous = ordered[ordered.length - 2] || null

  const currentPosture = current?.synthesisPosture || 'WATCHED'
  const previousPosture = previous?.synthesisPosture || null

  const direction = deriveDirection(currentPosture, previousPosture, ordered.length)

  const criticalOrElevatedCount = ordered.filter(
    (snapshot) =>
      snapshot.synthesisPosture === 'CRITICAL' ||
      snapshot.synthesisPosture === 'ELEVATED',
  ).length

  const survivabilityConcernPersisting =
    ordered.length >= 3 &&
    criticalOrElevatedCount >= Math.ceil(ordered.length * 0.6)

  const continuityDriftDetected =
    direction === 'WORSENING' || survivabilityConcernPersisting

  const trustInput = buildHistoryTrustInput({
    ordered,
    currentPosture,
    direction,
    survivabilityConcernPersisting,
    continuityDriftDetected,
  })

  const trustAssessment = buildContinuityTrustAssessment(trustInput)

  const derivation = buildContinuityDerivationStandard({
    ...trustInput,
    visibleSignal: deriveVisibleSignal({
      direction,
      currentPosture,
      survivabilityConcernPersisting,
      continuityDriftDetected,
    }),
    stage: 'Executive History',
    posture: currentPosture,
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

  const executiveMeaning = deriveHistoryMeaning({
    direction,
    currentPosture,
    trustAssessment,
  })

  const requiredHistoryAction = deriveHistoryAction({
    direction,
    currentPosture,
    trustAssessment,
  })

  const timelineSummary =
    ordered.length === 0
      ? 'No executive continuity snapshots have been preserved yet.'
      : ordered
          .map(
            (snapshot) =>
              `${snapshot.createdAt}: ${snapshot.synthesisPosture} — ${snapshot.dominantConcern}`,
          )
          .join('\n')

  return {
    snapshotCount: ordered.length,
    currentPosture,
    previousPosture,
    direction,
    continuityDriftDetected,
    survivabilityConcernPersisting,
    executiveMeaning,
    requiredHistoryAction,
    timelineSummary,
    trustAssessment,
    continuityStandard,
  }
}

export function summarizeCGIExecutiveHistory(
  review: CGIExecutiveHistoryReview,
): string {
  return `
TSINAXA CGI EXECUTIVE HISTORY REVIEW

Snapshot Count:
${review.snapshotCount}

Current Posture:
${review.currentPosture}

Previous Posture:
${review.previousPosture || 'Not available'}

Continuity Direction:
${review.direction}

Continuity Drift Detected:
${review.continuityDriftDetected ? 'YES' : 'NO'}

Survivability Concern Persisting:
${review.survivabilityConcernPersisting ? 'YES' : 'NO'}

Trust Reading:
${review.trustAssessment.trustReading}

Trust Level:
${review.trustAssessment.trustLevel}

What Is Visible:
${review.continuityStandard.whatIsVisible}

Why It Matters:
${review.continuityStandard.whyItMatters}

Continuity Risk:
${review.continuityStandard.continuityRisk}

Executive Meaning:
${review.executiveMeaning}

Required History Action:
${review.requiredHistoryAction}

Timeline:
${review.timelineSummary}
  `.trim()
}