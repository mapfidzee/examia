import type {
  CGIContinuitySnapshot,
} from './cgiContinuitySnapshotEngine'
import type {
  CGIRouteSynthesisPosture,
} from './cgiCrossRouteContinuitySynthesisEngine'

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
  count: number
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

function deriveExecutiveMeaning(
  direction: CGIContinuityHistoryDirection,
  current: CGIRouteSynthesisPosture
): string {
  if (direction === 'INSUFFICIENT_HISTORY') {
    return 'Too few continuity snapshots exist to determine whether institutional continuity is improving, holding, or worsening.'
  }

  if (direction === 'WORSENING') {
    return 'Continuity posture is worsening across reviewed snapshots. Leadership should treat this as continuity drift, not isolated operational movement.'
  }

  if (direction === 'IMPROVING') {
    return 'Continuity posture is improving across reviewed snapshots, but stabilization should remain evidence-based before confidence is restored.'
  }

  if (current === 'CRITICAL') {
    return 'Continuity posture is holding at a critical level. This means instability is persisting rather than resolving.'
  }

  if (current === 'ELEVATED') {
    return 'Continuity posture is holding under elevated exposure. Executive review should remain active until evidence confirms improvement.'
  }

  if (current === 'WATCHED') {
    return 'Continuity posture is holding under observation. Monitoring should continue until stability is durable.'
  }

  return 'Continuity posture is holding in a stable range under reviewed conditions.'
}

function deriveRequiredAction(
  direction: CGIContinuityHistoryDirection,
  current: CGIRouteSynthesisPosture
): string {
  if (direction === 'INSUFFICIENT_HISTORY') {
    return 'Continue preserving continuity snapshots until a reliable executive history exists.'
  }

  if (direction === 'WORSENING') {
    return 'Escalate executive continuity review, confirm ownership, and require evidence that drift is being contained.'
  }

  if (direction === 'IMPROVING') {
    return 'Maintain confirmation monitoring and verify that recovery credibility continues to hold.'
  }

  if (current === 'CRITICAL') {
    return 'Keep executive coordination active until continuity credibility improves.'
  }

  if (current === 'ELEVATED') {
    return 'Maintain active executive review and watch for further drift or delayed recovery.'
  }

  return 'Continue continuity monitoring and preserve the executive evidence trail.'
}

export function reviewCGIExecutiveHistory(
  snapshots: CGIContinuitySnapshot[]
): CGIExecutiveHistoryReview {
  const ordered = [...snapshots].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
  )

  const current = ordered[ordered.length - 1] || null
  const previous = ordered[ordered.length - 2] || null

  const currentPosture = current?.synthesisPosture || 'WATCHED'
  const previousPosture = previous?.synthesisPosture || null

  const direction = deriveDirection(
    currentPosture,
    previousPosture,
    ordered.length
  )

  const criticalOrElevatedCount = ordered.filter(
    (snapshot) =>
      snapshot.synthesisPosture === 'CRITICAL' ||
      snapshot.synthesisPosture === 'ELEVATED'
  ).length

  const survivabilityConcernPersisting =
    ordered.length >= 3 &&
    criticalOrElevatedCount >= Math.ceil(ordered.length * 0.6)

  const continuityDriftDetected =
    direction === 'WORSENING' ||
    survivabilityConcernPersisting

  const executiveMeaning = deriveExecutiveMeaning(
    direction,
    currentPosture
  )

  const requiredHistoryAction = deriveRequiredAction(
    direction,
    currentPosture
  )

  const timelineSummary =
    ordered.length === 0
      ? 'No executive continuity snapshots have been preserved yet.'
      : ordered
          .map(
            (snapshot) =>
              `${snapshot.createdAt}: ${snapshot.synthesisPosture} — ${snapshot.dominantConcern}`
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
  }
}

export function summarizeCGIExecutiveHistory(
  review: CGIExecutiveHistoryReview
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

Executive Meaning:
${review.executiveMeaning}

Required History Action:
${review.requiredHistoryAction}

Timeline:
${review.timelineSummary}
  `.trim()
}