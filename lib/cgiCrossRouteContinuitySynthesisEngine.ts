import { buildContinuityDerivationStandard } from './cgiContinuityDerivationStandard'
import { buildContinuityTrustAssessment } from './cgiContinuityTrustEngine'
import type {
  ContinuityTrustAssessment,
  ContinuityTrustInput,
} from './cgiContinuityTrustEngine'
import {
  getCGIExecutiveUse,
  getCGIPreferredTerm,
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

function strongestPosture(
  postures: CGIRouteSynthesisPosture[],
): CGIRouteSynthesisPosture {
  return postures.reduce((strongest, current) =>
    postureWeight[current] > postureWeight[strongest] ? current : strongest,
  )
}

function countPosture(
  postures: CGIRouteSynthesisPosture[],
  target: CGIRouteSynthesisPosture,
): number {
  return postures.filter((posture) => posture === target).length
}

function deriveSynthesisPosture(
  input: CGIRouteSynthesisInput,
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

function deriveDominantConcern(input: CGIRouteSynthesisInput): string {
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
    (a, b) => postureWeight[b.posture] - postureWeight[a.posture],
  )[0].label
}

function buildRouteTrustInput(
  input: CGIRouteSynthesisInput,
  synthesisPosture: CGIRouteSynthesisPosture,
): ContinuityTrustInput {
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

  return {
    activeInstability: criticalCount + elevatedCount + watchedCount,
    recoveryRecords:
      input.recoveryPosture === 'STABLE'
        ? 1
        : input.recoveryPosture === 'WATCHED'
          ? 1
          : input.recoveryPosture === 'ELEVATED'
            ? 1
            : 1,
    fragileRecovery:
      input.recoveryPosture === 'WATCHED' ||
      input.recoveryPosture === 'ELEVATED' ||
      input.recoveryPosture === 'CRITICAL'
        ? 1
        : 0,
    commandPressure:
      synthesisPosture === 'CRITICAL' || synthesisPosture === 'ELEVATED'
        ? 1
        : 0,
    evidenceReturn: input.evidenceVerified ? 0 : 1,
    absorbable:
      synthesisPosture === 'STABLE' &&
      input.evidenceVerified &&
      !input.accountabilityActive &&
      !input.structuralMemoryVisible
        ? 1
        : 0,
    historicalMemory: input.structuralMemoryVisible ? 1 : 0,
    recurrenceVisible:
      input.structuralMemoryVisible ||
      input.trajectoryPosture === 'ELEVATED' ||
      input.trajectoryPosture === 'CRITICAL'
        ? 1
        : 0,
    coordinationPressure: input.accountabilityActive ? 1 : 0,
    crossSitePressure:
      input.pressurePosture === 'ELEVATED' ||
      input.pressurePosture === 'CRITICAL'
        ? 1
        : 0,
    auditPressure: input.evidenceVerified ? 0 : 1,
    safeguardingVisible: criticalCount,
    posture: synthesisPosture,
  }
}

function deriveVisibleSignal(
  input: CGIRouteSynthesisInput,
  synthesisPosture: CGIRouteSynthesisPosture,
  dominantConcern: string,
) {
  if (synthesisPosture === 'CRITICAL') {
    return `Critical cross-route continuity pressure led by ${dominantConcern}`
  }

  if (synthesisPosture === 'ELEVATED') {
    return `Elevated cross-route continuity exposure led by ${dominantConcern}`
  }

  if (synthesisPosture === 'WATCHED') {
    return `Watched cross-route continuity condition led by ${dominantConcern}`
  }

  if (!input.evidenceVerified) {
    return 'Evidence credibility gap'
  }

  return `Stable cross-route continuity condition led by ${dominantConcern}`
}

function deriveRequiredEvidence({
  input,
  trustAssessment,
}: {
  input: CGIRouteSynthesisInput
  trustAssessment: ContinuityTrustAssessment
}) {
  if (!input.evidenceVerified) {
    return 'Verified stabilization evidence is required before continuity can be trusted as durable.'
  }

  if (trustAssessment.trustLevel === 'WITHHELD') {
    return 'Cross-route evidence, recurrence history, executive rationale, and audit reconstruction must remain attached before stability is trusted.'
  }

  if (trustAssessment.trustLevel === 'LOW') {
    return 'Evidence exists, but additional verification is required because continuity pressure remains visible.'
  }

  if (trustAssessment.trustLevel === 'CONDITIONAL') {
    return 'Preserve evidence, recurrence memory, and stabilization proof before reducing visibility.'
  }

  return 'Current evidence supports routine continuity confidence, with continued monitoring.'
}

export function buildCGICrossRouteContinuitySynthesis(
  input: CGIRouteSynthesisInput,
): CGICrossRouteContinuitySynthesis {
  const synthesisPosture = deriveSynthesisPosture(input)
  const dominantConcern = deriveDominantConcern(input)

  const trustInput = buildRouteTrustInput(input, synthesisPosture)
  const trustAssessment = buildContinuityTrustAssessment(trustInput)

  const derivation = buildContinuityDerivationStandard({
    ...trustInput,
    visibleSignal: deriveVisibleSignal(input, synthesisPosture, dominantConcern),
    stage: 'Cross Route Continuity Synthesis',
    posture: synthesisPosture,
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

  const executiveContinuityReading = trustAssessment.finalInterpretation

  const executiveMeaning = trustAssessment.institutionalMeaning

  const requiredExecutiveAction = trustAssessment.executiveDecision

  const requiredEvidence = deriveRequiredEvidence({
    input,
    trustAssessment,
  })

  const governanceSafeInterpretation = [
    'This synthesis does not judge individuals or assign blame.',
    'It compresses pressure, trajectory, early warning, recovery credibility, and trustworthiness into one governance-safe continuity reading.',
    trustAssessment.trustMeaning,
  ].join(' ')

  return {
    executiveContinuityReading,
    continuityTrustQuestion:
      'Can continuity still be trusted under operational pressure?',
    dominantConcern:
      trustAssessment.primaryVulnerability === 'No active vulnerability visible'
        ? dominantConcern
        : trustAssessment.primaryVulnerability,
    synthesisPosture,
    executiveMeaning,
    requiredExecutiveAction,
    requiredEvidence,
    governanceSafeInterpretation,
    semanticBasis: [
      getCGIExecutiveUse('PRESSURE'),
      getCGIExecutiveUse('TRAJECTORY'),
      getCGIExecutiveUse('PREDICTIVE'),
      getCGIExecutiveUse('RECOVERY'),
      getCGIExecutiveUse('RELIABILITY'),
      getCGIExecutiveUse('SYNTHESIS'),
    ],
    trustAssessment,
    continuityStandard,
  }
}