type ExecutivePriorityInput = {
  escalationPressureIndex: number
  operationalSurvivabilityScore: number
  recoveryReliabilityScore: number
  unresolvedMomentum: number
  continuityCollapseRecurrence: number
  escalationCorridorRecurrence: number
  responderStrainRecurrence: number
}

export type ExecutivePrioritizationResult = {
  executivePriorityScore: number

  survivabilityThreatLevel:
    | 'STABLE'
    | 'WATCH'
    | 'ELEVATED'
    | 'HIGH_RISK'
    | 'CRITICAL'

  executiveActionUrgency:
    | 'ROUTINE'
    | 'REVIEW'
    | 'PRIORITY'
    | 'IMMEDIATE'

  structuralDeteriorationState:
    | 'STABLE'
    | 'EMERGING'
    | 'RECURRING'
    | 'ACCELERATING'

  executiveActionDeadline: string
}

export function calculateExecutivePrioritization(
  input: ExecutivePriorityInput
): ExecutivePrioritizationResult {
  const pressureWeight =
    input.escalationPressureIndex * 0.22

  const survivabilityWeight =
    (100 - input.operationalSurvivabilityScore) * 0.28

  const recoveryWeight =
    (100 - input.recoveryReliabilityScore) * 0.18

  const unresolvedWeight =
    input.unresolvedMomentum * 0.12

  const collapseWeight =
    input.continuityCollapseRecurrence * 0.12

  const corridorWeight =
    input.escalationCorridorRecurrence * 0.05

  const responderWeight =
    input.responderStrainRecurrence * 0.03

  const executivePriorityScore = Math.round(
    pressureWeight +
      survivabilityWeight +
      recoveryWeight +
      unresolvedWeight +
      collapseWeight +
      corridorWeight +
      responderWeight
  )

  let survivabilityThreatLevel:
    | 'STABLE'
    | 'WATCH'
    | 'ELEVATED'
    | 'HIGH_RISK'
    | 'CRITICAL'

  if (executivePriorityScore >= 85) {
    survivabilityThreatLevel = 'CRITICAL'
  } else if (executivePriorityScore >= 70) {
    survivabilityThreatLevel = 'HIGH_RISK'
  } else if (executivePriorityScore >= 55) {
    survivabilityThreatLevel = 'ELEVATED'
  } else if (executivePriorityScore >= 40) {
    survivabilityThreatLevel = 'WATCH'
  } else {
    survivabilityThreatLevel = 'STABLE'
  }

  let executiveActionUrgency:
    | 'ROUTINE'
    | 'REVIEW'
    | 'PRIORITY'
    | 'IMMEDIATE'

  if (executivePriorityScore >= 80) {
    executiveActionUrgency = 'IMMEDIATE'
  } else if (executivePriorityScore >= 60) {
    executiveActionUrgency = 'PRIORITY'
  } else if (executivePriorityScore >= 40) {
    executiveActionUrgency = 'REVIEW'
  } else {
    executiveActionUrgency = 'ROUTINE'
  }

  let structuralDeteriorationState:
    | 'STABLE'
    | 'EMERGING'
    | 'RECURRING'
    | 'ACCELERATING'

  if (
    input.continuityCollapseRecurrence >= 60 ||
    input.escalationCorridorRecurrence >= 60
  ) {
    structuralDeteriorationState = 'ACCELERATING'
  } else if (
    input.continuityCollapseRecurrence >= 40 ||
    input.escalationCorridorRecurrence >= 40
  ) {
    structuralDeteriorationState = 'RECURRING'
  } else if (
    input.unresolvedMomentum >= 40
  ) {
    structuralDeteriorationState = 'EMERGING'
  } else {
    structuralDeteriorationState = 'STABLE'
  }

  let executiveActionDeadline = 'Next governance cycle'

  if (executiveActionUrgency === 'IMMEDIATE') {
    executiveActionDeadline = 'Within 24 hours'
  } else if (
    executiveActionUrgency === 'PRIORITY'
  ) {
    executiveActionDeadline = 'Within 72 hours'
  } else if (
    executiveActionUrgency === 'REVIEW'
  ) {
    executiveActionDeadline = 'Within 7 days'
  }

  return {
    executivePriorityScore,

    survivabilityThreatLevel,

    executiveActionUrgency,

    structuralDeteriorationState,

    executiveActionDeadline,
  }
}