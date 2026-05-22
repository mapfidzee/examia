import {
  getCGIPreferredTerm,
  getCGIExecutiveUse,
} from './cgiExecutiveSemanticRegistry'

export type CGIRouteSynthesisPosture =
  | 'STABLE'
  | 'WATCHED'
  | 'ELEVATED'
  | 'CRITICAL'

export type CGIRouteSynthesisInput = {
  pressurePosture: CGIRouteSynthesisPosture
  trajectoryPosture: CGIRouteSynthesisPosture
  predictivePosture: CGIRouteSynthesisPosture
  recoveryPosture: CGIRouteSynthesisPosture
  reliabilityPosture: CGIRouteSynthesisPosture
  evidenceVerified: boolean
  accountabilityActive: boolean
  structuralMemoryVisible: boolean
}

export type CGICrossRouteContinuitySynthesis = {
  executiveContinuityReading: string
  continuityTrustQuestion: string
  dominantConcern: string
  synthesisPosture: CGIRouteSynthesisPosture
  executiveMeaning: string
  requiredExecutiveAction: string
  requiredEvidence: string
  governanceSafeInterpretation: string
  semanticBasis: string[]
}

const postureWeight: Record<CGIRouteSynthesisPosture, number> = {
  STABLE: 1,
  WATCHED: 2,
  ELEVATED: 3,
  CRITICAL: 4,
}

function strongestPosture(
  postures: CGIRouteSynthesisPosture[]
): CGIRouteSynthesisPosture {
  return postures.reduce((strongest, current) =>
    postureWeight[current] > postureWeight[strongest]
      ? current
      : strongest
  )
}

function countPosture(
  postures: CGIRouteSynthesisPosture[],
  target: CGIRouteSynthesisPosture
): number {
  return postures.filter((posture) => posture === target).length
}

function deriveSynthesisPosture(
  input: CGIRouteSynthesisInput
): CGIRouteSynthesisPosture {
  const postures = [
    input.pressurePosture,
    input.trajectoryPosture,
    input.predictivePosture,
    input.recoveryPosture,
    input.reliabilityPosture,
  ]

  const criticalCount = countPosture(postures, 'CRITICAL')
  const elevatedCount = countPosture(postures, 'ELEVATED')
  const watchedCount = countPosture(postures, 'WATCHED')

  if (
    criticalCount > 0 ||
    (elevatedCount >= 2 && input.evidenceVerified === false)
  ) {
    return 'CRITICAL'
  }

  if (
    elevatedCount > 0 ||
    watchedCount >= 3 ||
    input.structuralMemoryVisible
  ) {
    return 'ELEVATED'
  }

  if (
    watchedCount > 0 ||
    input.accountabilityActive ||
    input.evidenceVerified === false
  ) {
    return 'WATCHED'
  }

  return strongestPosture(postures)
}

function deriveDominantConcern(
  input: CGIRouteSynthesisInput
): string {
  const concerns: Array<{
    label: string
    posture: CGIRouteSynthesisPosture
  }> = [
    {
      label: getCGIPreferredTerm('PRESSURE'),
      posture: input.pressurePosture,
    },
    {
      label: getCGIPreferredTerm('TRAJECTORY'),
      posture: input.trajectoryPosture,
    },
    {
      label: getCGIPreferredTerm('PREDICTIVE'),
      posture: input.predictivePosture,
    },
    {
      label: getCGIPreferredTerm('RECOVERY'),
      posture: input.recoveryPosture,
    },
    {
      label: getCGIPreferredTerm('RELIABILITY'),
      posture: input.reliabilityPosture,
    },
  ]

  return concerns.sort(
    (a, b) => postureWeight[b.posture] - postureWeight[a.posture]
  )[0].label
}

function deriveExecutiveReading(
  posture: CGIRouteSynthesisPosture
): string {
  if (posture === 'CRITICAL') {
    return 'Continuity cannot yet be trusted without direct executive coordination and verified stabilization evidence.'
  }

  if (posture === 'ELEVATED') {
    return 'Continuity remains exposed and requires active executive review before stabilization can be trusted.'
  }

  if (posture === 'WATCHED') {
    return 'Continuity is holding under observation but still requires confirmation before closure confidence.'
  }

  return 'Continuity appears stable across the reviewed intelligence surfaces.'
}

function deriveExecutiveMeaning(
  posture: CGIRouteSynthesisPosture,
  dominantConcern: string
): string {
  if (posture === 'CRITICAL') {
    return `${dominantConcern} is strong enough to threaten continuity credibility. Leadership should treat the condition as an active stabilization concern, not a routine operational variation.`
  }

  if (posture === 'ELEVATED') {
    return `${dominantConcern} is the leading concern in the current continuity reading. Stabilization may be present, but it is not yet dependable enough for relaxed oversight.`
  }

  if (posture === 'WATCHED') {
    return `${dominantConcern} remains visible. Continuity may be holding, but executive confidence should remain conditional until evidence confirms durability.`
  }

  return `${dominantConcern} is not currently showing enough pressure to weaken continuity trust. Routine confirmation remains appropriate.`
}

function deriveRequiredAction(
  posture: CGIRouteSynthesisPosture
): string {
  if (posture === 'CRITICAL') {
    return 'Activate executive coordination, confirm ownership, require stabilization evidence, and keep survivability protection visible until continuity credibility is restored.'
  }

  if (posture === 'ELEVATED') {
    return 'Maintain active executive review, verify recovery credibility, and monitor whether pressure, trajectory, or trustworthiness deteriorates further.'
  }

  if (posture === 'WATCHED') {
    return 'Continue governance monitoring and confirm that recovery evidence remains consistent across the next continuity review.'
  }

  return 'Maintain routine continuity monitoring and preserve the evidence trail.'
}

function deriveRequiredEvidence(
  input: CGIRouteSynthesisInput,
  posture: CGIRouteSynthesisPosture
): string {
  if (input.evidenceVerified && posture === 'STABLE') {
    return 'Current evidence supports routine continuity confidence, with continued monitoring.'
  }

  if (input.evidenceVerified) {
    return 'Evidence exists, but continued verification is required because continuity pressure remains visible.'
  }

  return 'Verified stabilization evidence is required before continuity can be trusted as durable.'
}

export function buildCGICrossRouteContinuitySynthesis(
  input: CGIRouteSynthesisInput
): CGICrossRouteContinuitySynthesis {
  const synthesisPosture = deriveSynthesisPosture(input)
  const dominantConcern = deriveDominantConcern(input)

  return {
    executiveContinuityReading:
      deriveExecutiveReading(synthesisPosture),
    continuityTrustQuestion:
      'Can continuity still be trusted under operational pressure?',
    dominantConcern,
    synthesisPosture,
    executiveMeaning: deriveExecutiveMeaning(
      synthesisPosture,
      dominantConcern
    ),
    requiredExecutiveAction:
      deriveRequiredAction(synthesisPosture),
    requiredEvidence: deriveRequiredEvidence(
      input,
      synthesisPosture
    ),
    governanceSafeInterpretation:
      'This synthesis does not judge individuals or assign blame. It compresses pressure, trajectory, early warning, recovery credibility, and trustworthiness into one governance-safe continuity reading.',
    semanticBasis: [
      getCGIExecutiveUse('PRESSURE'),
      getCGIExecutiveUse('TRAJECTORY'),
      getCGIExecutiveUse('PREDICTIVE'),
      getCGIExecutiveUse('RECOVERY'),
      getCGIExecutiveUse('RELIABILITY'),
      getCGIExecutiveUse('SYNTHESIS'),
    ],
  }
}