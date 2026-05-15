export type ContinuityInput = {
  totalCases: number
  activeCases: number
  routedCases: number
  interventionCases: number
  outcomeCases: number
  stabilizedCases: number
  escalatedCases: number
  criticalCases: number
  safeguardingCases: number
  unresolvedInterventionPathways: number
  routedWithoutResponder: number
}

export type ContinuityScores = {
  continuityIntegrityScore: number
  stabilizationConfidenceScore: number
  escalationPressureIndex: number
  recoveryReliabilityScore: number
  operationalSurvivabilityScore: number
  continuityState: 'STABLE' | 'WATCH' | 'STRAINING' | 'UNSTABLE'
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function percent(part: number, whole: number) {
  if (whole <= 0) return 0
  return (part / whole) * 100
}

export function evaluateContinuityIntelligence(
  input: ContinuityInput
): ContinuityScores {
  const interventionCoverage = percent(input.interventionCases, input.totalCases)
  const outcomeCoverage = percent(input.outcomeCases, input.totalCases)
  const stabilizationRate = percent(input.stabilizedCases, input.totalCases)
  const escalationRate = percent(input.escalatedCases, input.totalCases)
  const criticalRate = percent(input.criticalCases, input.totalCases)
  const safeguardingRate = percent(input.safeguardingCases, input.totalCases)
  const unresolvedRate = percent(input.unresolvedInterventionPathways, input.totalCases)
  const routingGapRate = percent(input.routedWithoutResponder, input.totalCases)

  const continuityIntegrityScore = clampScore(
    35 +
      interventionCoverage * 0.2 +
      outcomeCoverage * 0.25 +
      stabilizationRate * 0.3 -
      escalationRate * 0.25 -
      unresolvedRate * 0.2 -
      routingGapRate * 0.2
  )

  const stabilizationConfidenceScore = clampScore(
    stabilizationRate * 0.45 +
      outcomeCoverage * 0.25 +
      interventionCoverage * 0.2 -
      escalationRate * 0.25 -
      criticalRate * 0.15
  )

  const escalationPressureIndex = clampScore(
    escalationRate * 0.35 +
      criticalRate * 0.3 +
      safeguardingRate * 0.2 +
      unresolvedRate * 0.25 +
      routingGapRate * 0.2
  )

  const recoveryReliabilityScore = clampScore(
    outcomeCoverage * 0.35 +
      stabilizationRate * 0.35 +
      interventionCoverage * 0.15 -
      unresolvedRate * 0.25 -
      escalationRate * 0.25
  )

  const operationalSurvivabilityScore = clampScore(
    continuityIntegrityScore * 0.35 +
      stabilizationConfidenceScore * 0.25 +
      recoveryReliabilityScore * 0.25 -
      escalationPressureIndex * 0.2
  )

  const continuityState =
    operationalSurvivabilityScore >= 75
      ? 'STABLE'
      : operationalSurvivabilityScore >= 55
        ? 'WATCH'
        : operationalSurvivabilityScore >= 35
          ? 'STRAINING'
          : 'UNSTABLE'

  return {
    continuityIntegrityScore,
    stabilizationConfidenceScore,
    escalationPressureIndex,
    recoveryReliabilityScore,
    operationalSurvivabilityScore,
    continuityState,
  }
}