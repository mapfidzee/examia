export type ExecutiveBoardSnapshot = {
  executivePriorityScore: number

  survivabilityThreatLevel: string

  executiveActionUrgency: string

  structuralDeteriorationState: string

  executiveActionDeadline: string

  continuityIntegrityScore: number

  operationalSurvivabilityScore: number

  recoveryReliabilityScore: number

  escalationPressureIndex: number

  dominantPressureSource: string

  dominantTrajectorySignal: string

  dominantMemoryPattern: string

  executiveSummary: string

  actionCue: string
}

export type ExecutiveBoardInterpretation = {
  commandPosture:
    | 'STABLE'
    | 'WATCH'
    | 'ELEVATED'
    | 'CRITICAL'

  institutionalRiskDirection:
    | 'IMPROVING'
    | 'UNSTABLE'
    | 'DETERIORATING'

  executiveRecommendation: string

  survivabilityInterpretation: string
}

export function interpretExecutiveBoard(
  snapshot: ExecutiveBoardSnapshot
): ExecutiveBoardInterpretation {
  let commandPosture:
    | 'STABLE'
    | 'WATCH'
    | 'ELEVATED'
    | 'CRITICAL'

  if (
    snapshot.survivabilityThreatLevel === 'CRITICAL'
  ) {
    commandPosture = 'CRITICAL'
  } else if (
    snapshot.survivabilityThreatLevel === 'HIGH_RISK'
  ) {
    commandPosture = 'ELEVATED'
  } else if (
    snapshot.survivabilityThreatLevel === 'ELEVATED'
  ) {
    commandPosture = 'WATCH'
  } else {
    commandPosture = 'STABLE'
  }

  let institutionalRiskDirection:
    | 'IMPROVING'
    | 'UNSTABLE'
    | 'DETERIORATING'

  if (
    snapshot.structuralDeteriorationState ===
    'ACCELERATING'
  ) {
    institutionalRiskDirection = 'DETERIORATING'
  } else if (
    snapshot.structuralDeteriorationState ===
    'RECURRING'
  ) {
    institutionalRiskDirection = 'UNSTABLE'
  } else {
    institutionalRiskDirection = 'IMPROVING'
  }

  let executiveRecommendation =
    'Maintain governed continuity review.'

  if (
    snapshot.executiveActionUrgency === 'IMMEDIATE'
  ) {
    executiveRecommendation =
      'Executive intervention required immediately to preserve survivability posture.'
  } else if (
    snapshot.executiveActionUrgency === 'PRIORITY'
  ) {
    executiveRecommendation =
      'Escalate executive review and stabilize recurring pressure corridors.'
  } else if (
    snapshot.executiveActionUrgency === 'REVIEW'
  ) {
    executiveRecommendation =
      'Continue governed review and monitor continuity drift patterns.'
  }

  let survivabilityInterpretation =
    'Operational survivability posture remains stable.'

  if (
    snapshot.operationalSurvivabilityScore < 60
  ) {
    survivabilityInterpretation =
      'Institutional survivability posture is degrading and requires executive attention.'
  } else if (
    snapshot.operationalSurvivabilityScore < 75
  ) {
    survivabilityInterpretation =
      'Survivability posture remains vulnerable to recurring instability.'
  }

  return {
    commandPosture,

    institutionalRiskDirection,

    executiveRecommendation,

    survivabilityInterpretation,
  }
}