export type TrajectoryDirection =
  | 'RECOVERING'
  | 'STABILIZING'
  | 'DRIFTING'
  | 'DETERIORATING'
  | 'COLLAPSE_RISK'

export type TrajectorySeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

export type BeneficiaryCaseTrajectoryLike = {
  id: string
  case_status?: string | null
  severity_level?: string | null
  safeguarding_flag?: boolean | null
  created_at?: string | null
  updated_at?: string | null
  region?: string | null
  institution_id?: string | null
  institution_name?: string | null
}

export type RoutingTrajectoryLike = {
  id: string
  case_id?: string | null
  routing_status?: string | null
  priority_level?: string | null
  responder_id?: string | null
  assigned_responder_id?: string | null
  created_at?: string | null
}

export type InterventionTrajectoryLike = {
  id: string
  case_id?: string | null
  intervention_status?: string | null
  created_at?: string | null
  completed_at?: string | null
}

export type OutcomeTrajectoryLike = {
  id: string
  case_id?: string | null
  outcome_status?: string | null
  stabilization_status?: string | null
  recovery_status?: string | null
  created_at?: string | null
}

export type TrajectoryIntelligenceInput = {
  cases: BeneficiaryCaseTrajectoryLike[]
  routingActions: RoutingTrajectoryLike[]
  interventions: InterventionTrajectoryLike[]
  outcomes: OutcomeTrajectoryLike[]
}

export type TrajectoryIntelligenceResult = {
  trajectoryRisk: number
  continuityDrift: number
  escalationMomentum: number
  recoveryDirection: number
  stabilizationTrend: number
  unresolvedMomentum: number
  trajectoryDirection: TrajectoryDirection
  severity: TrajectorySeverity
  dominantTrajectorySignal: string
  executiveSummary: string
  actionCue: string
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const normalize = (value?: string | null) =>
  String(value ?? '')
    .trim()
    .toUpperCase()

const percentage = (part: number, total: number) => {
  if (!total) return 0
  return (part / total) * 100
}

const isActiveCase = (status?: string | null) => {
  const value = normalize(status)

  return [
    'NEED_DETECTED',
    'UNDER_ASSESSMENT',
    'ROUTED',
    'RESPONDER_ASSIGNED',
    'INTERVENTION_ACTIVE',
    'STABILIZING',
    'ESCALATED',
  ].includes(value)
}

const isStabilizedCase = (status?: string | null) => {
  const value = normalize(status)
  return ['STABILIZED', 'RESOLVED', 'COMPLETED', 'CLOSED'].includes(value)
}

const isEscalatedCase = (status?: string | null) => {
  const value = normalize(status)
  return ['ESCALATED', 'CRITICAL', 'URGENT'].includes(value)
}

const isHighSeverity = (severity?: string | null) => {
  const value = normalize(severity)
  return ['HIGH', 'CRITICAL', 'URGENT'].includes(value)
}

const isRoutingIncomplete = (item: RoutingTrajectoryLike) => {
  const value = normalize(item.routing_status)

  if (!item.responder_id && !item.assigned_responder_id) return true

  return [
    'PENDING',
    'DELAYED',
    'FAILED',
    'DECLINED',
    'REJECTED',
    'UNASSIGNED',
    'ESCALATED',
    'UNDER_REVIEW',
  ].includes(value)
}

const isInterventionIncomplete = (status?: string | null) => {
  const value = normalize(status)
  return !['COMPLETED', 'STABILIZED', 'RESOLVED', 'CLOSED'].includes(value)
}

const isOutcomeWeak = (item: OutcomeTrajectoryLike) => {
  const values = [
    normalize(item.outcome_status),
    normalize(item.stabilization_status),
    normalize(item.recovery_status),
  ]

  return values.some((value) =>
    [
      'FAILED',
      'UNSTABLE',
      'DETERIORATING',
      'ESCALATED',
      'PARTIAL',
      'NOT_STABILIZED',
      'UNDER_REVIEW',
    ].includes(value),
  )
}

const getSeverity = (score: number): TrajectorySeverity => {
  if (score >= 80) return 'CRITICAL'
  if (score >= 60) return 'HIGH'
  if (score >= 35) return 'MODERATE'
  return 'LOW'
}

const getDirection = (
  trajectoryRisk: number,
  recoveryDirection: number,
  stabilizationTrend: number,
): TrajectoryDirection => {
  if (trajectoryRisk >= 85) return 'COLLAPSE_RISK'
  if (trajectoryRisk >= 65) return 'DETERIORATING'
  if (trajectoryRisk >= 40) return 'DRIFTING'
  if (recoveryDirection >= 60 && stabilizationTrend >= 50) return 'RECOVERING'
  return 'STABILIZING'
}

const strongestSignal = (scores: Record<string, number>) => {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No dominant trajectory signal detected'
}

export function evaluateTrajectoryIntelligence(
  input: TrajectoryIntelligenceInput,
): TrajectoryIntelligenceResult {
  const cases = input.cases ?? []
  const routingActions = input.routingActions ?? []
  const interventions = input.interventions ?? []
  const outcomes = input.outcomes ?? []

  const totalCases = cases.length

  const activeCases = cases.filter((item) => isActiveCase(item.case_status))
  const stabilizedCases = cases.filter((item) => isStabilizedCase(item.case_status))
  const escalatedCases = cases.filter((item) => isEscalatedCase(item.case_status))
  const highSeverityCases = cases.filter((item) => isHighSeverity(item.severity_level))
  const safeguardingCases = cases.filter((item) => item.safeguarding_flag === true)

  const routedCaseIds = new Set(
    routingActions
      .map((item) => item.case_id)
      .filter((caseId): caseId is string => Boolean(caseId)),
  )

  const interventionCaseIds = new Set(
    interventions
      .map((item) => item.case_id)
      .filter((caseId): caseId is string => Boolean(caseId)),
  )

  const outcomeCaseIds = new Set(
    outcomes
      .map((item) => item.case_id)
      .filter((caseId): caseId is string => Boolean(caseId)),
  )

  const incompleteRouting = routingActions.filter((item) => isRoutingIncomplete(item))

  const incompleteInterventions = interventions.filter((item) =>
    isInterventionIncomplete(item.intervention_status),
  )

  const weakOutcomes = outcomes.filter((item) => isOutcomeWeak(item))

  const activeWithoutRouting = activeCases.filter((item) => !routedCaseIds.has(item.id))

  const activeWithoutIntervention = activeCases.filter(
    (item) => !interventionCaseIds.has(item.id),
  )

  const activeWithoutOutcome = activeCases.filter((item) => !outcomeCaseIds.has(item.id))

  const unresolvedAfterIntervention = activeCases.filter(
    (item) => interventionCaseIds.has(item.id) && !outcomeCaseIds.has(item.id),
  )

  const continuityDrift = clamp(
    percentage(
      activeWithoutRouting.length +
        activeWithoutIntervention.length +
        activeWithoutOutcome.length,
      Math.max(activeCases.length * 3, 1),
    ),
  )

  const escalationMomentum = clamp(
    percentage(
      escalatedCases.length + highSeverityCases.length + safeguardingCases.length,
      Math.max(totalCases, 1),
    ),
  )

  const recoveryDirection = clamp(
    percentage(stabilizedCases.length + outcomeCaseIds.size, Math.max(totalCases * 2, 1)),
  )

  const stabilizationTrend = clamp(
    recoveryDirection -
      percentage(weakOutcomes.length + incompleteInterventions.length, Math.max(outcomes.length + interventions.length, 1)) *
        0.45,
  )

  const unresolvedMomentum = clamp(
    percentage(
      incompleteRouting.length +
        incompleteInterventions.length +
        weakOutcomes.length +
        unresolvedAfterIntervention.length,
      Math.max(routingActions.length + interventions.length + outcomes.length + activeCases.length, 1),
    ),
  )

  const trajectoryRisk = clamp(
    continuityDrift * 0.24 +
      escalationMomentum * 0.24 +
      unresolvedMomentum * 0.22 +
      (100 - recoveryDirection) * 0.15 +
      (100 - stabilizationTrend) * 0.15,
  )

  const trajectoryScores = {
    'Continuity drift': continuityDrift,
    'Escalation momentum': escalationMomentum,
    'Unresolved momentum': unresolvedMomentum,
    'Recovery weakness': 100 - recoveryDirection,
    'Stabilization weakness': 100 - stabilizationTrend,
  }

  const trajectoryDirection = getDirection(
    trajectoryRisk,
    recoveryDirection,
    stabilizationTrend,
  )

  const severity = getSeverity(trajectoryRisk)
  const dominantTrajectorySignal = strongestSignal(trajectoryScores)

  const executiveSummary =
    trajectoryDirection === 'COLLAPSE_RISK'
      ? 'Continuity trajectory shows collapse risk. Escalation, unresolved pathways, or weak recovery signals may be overwhelming stabilization capacity.'
      : trajectoryDirection === 'DETERIORATING'
        ? 'Continuity trajectory is deteriorating. Pressure is moving faster than stabilization evidence.'
        : trajectoryDirection === 'DRIFTING'
          ? 'Continuity trajectory is drifting. The system is active, but stabilization direction is not yet strong enough.'
          : trajectoryDirection === 'RECOVERING'
            ? 'Continuity trajectory is recovering. Stabilization and outcome evidence are strengthening.'
            : 'Continuity trajectory is stabilizing. Current signals show manageable direction with continued monitoring required.'

  const actionCue =
    trajectoryDirection === 'COLLAPSE_RISK'
      ? 'Activate command review, inspect escalation corridors, and prioritize unresolved high-severity pathways.'
      : trajectoryDirection === 'DETERIORATING'
        ? 'Review pressure sources, stuck pathways, incomplete interventions, and weak outcomes before trajectory worsens.'
        : trajectoryDirection === 'DRIFTING'
          ? 'Strengthen routing ownership, intervention completion, and outcome confirmation to restore clear stabilization direction.'
          : trajectoryDirection === 'RECOVERING'
            ? 'Preserve recovery discipline and continue validating durable stabilization.'
            : 'Maintain monitoring and verify that current stabilization movement continues.'

  return {
    trajectoryRisk,
    continuityDrift,
    escalationMomentum,
    recoveryDirection,
    stabilizationTrend,
    unresolvedMomentum,
    trajectoryDirection,
    severity,
    dominantTrajectorySignal,
    executiveSummary,
    actionCue,
  }
}