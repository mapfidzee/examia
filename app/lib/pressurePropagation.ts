export type PressureSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

export type PressurePropagationState =
  | 'CONTAINED'
  | 'BUILDING'
  | 'SPREADING'
  | 'CASCADE_RISK'

export type BeneficiaryCaseLike = {
  id: string
  case_status?: string | null
  severity_level?: string | null
  safeguarding_flag?: boolean | null
  region?: string | null
  institution_name?: string | null
  institution_id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type RoutingActionLike = {
  id: string
  case_id?: string | null
  routing_status?: string | null
  routing_decision?: string | null
  priority_level?: string | null
  responder_id?: string | null
  institution_id?: string | null
  created_at?: string | null
}

export type InterventionLike = {
  id: string
  case_id?: string | null
  intervention_status?: string | null
  intervention_type?: string | null
  responder_id?: string | null
  created_at?: string | null
  completed_at?: string | null
}

export type OutcomeLike = {
  id: string
  case_id?: string | null
  outcome_status?: string | null
  stabilization_status?: string | null
  recovery_status?: string | null
  created_at?: string | null
}

export type ResponderLike = {
  id: string
  governance_status?: string | null
  responder_status?: string | null
  trust_score?: number | null
  active_case_count?: number | null
}

export type PressurePropagationInput = {
  cases: BeneficiaryCaseLike[]
  routingActions: RoutingActionLike[]
  interventions: InterventionLike[]
  outcomes: OutcomeLike[]
  responders?: ResponderLike[]
}

export type PressurePropagationResult = {
  propagationRisk: number
  routingFriction: number
  responderPressure: number
  escalationVelocity: number
  coordinationInstability: number
  stabilizationDrag: number
  pressurePropagationState: PressurePropagationState
  severity: PressureSeverity
  dominantPressureSource: string
  executiveSummary: string
  actionCue: string
}

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const normalize = (value?: string | null) =>
  String(value ?? '')
    .trim()
    .toUpperCase()

const isOpenCase = (status?: string | null) => {
  const value = normalize(status)
  return !['CLOSED', 'COMPLETED', 'RESOLVED', 'STABILIZED', 'CANCELLED'].includes(value)
}

const isHighSeverity = (severity?: string | null) => {
  const value = normalize(severity)
  return ['HIGH', 'CRITICAL', 'URGENT'].includes(value)
}

const isFailedRouting = (status?: string | null) => {
  const value = normalize(status)
  return ['FAILED', 'DECLINED', 'REJECTED', 'UNASSIGNED', 'ESCALATED', 'DELAYED'].includes(value)
}

const isActiveRouting = (status?: string | null) => {
  const value = normalize(status)
  return ['PENDING', 'ASSIGNED', 'ESCALATED', 'DELAYED', 'UNDER_REVIEW'].includes(value)
}

const isIncompleteIntervention = (status?: string | null) => {
  const value = normalize(status)
  return !['COMPLETED', 'CLOSED', 'STABILIZED', 'RESOLVED'].includes(value)
}

const isWeakOutcome = (outcome?: OutcomeLike) => {
  const combined = [
    normalize(outcome?.outcome_status),
    normalize(outcome?.stabilization_status),
    normalize(outcome?.recovery_status),
  ]

  return combined.some((value) =>
    ['FAILED', 'UNSTABLE', 'DETERIORATING', 'ESCALATED', 'PARTIAL', 'NOT_STABILIZED'].includes(value),
  )
}

const percentage = (part: number, total: number) => {
  if (!total) return 0
  return (part / total) * 100
}

const getSeverity = (score: number): PressureSeverity => {
  if (score >= 80) return 'CRITICAL'
  if (score >= 60) return 'HIGH'
  if (score >= 35) return 'MODERATE'
  return 'LOW'
}

const getState = (score: number): PressurePropagationState => {
  if (score >= 80) return 'CASCADE_RISK'
  if (score >= 60) return 'SPREADING'
  if (score >= 35) return 'BUILDING'
  return 'CONTAINED'
}

const strongestSource = (scores: Record<string, number>) => {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No dominant pressure source detected'
}

export function evaluatePressurePropagation(
  input: PressurePropagationInput,
): PressurePropagationResult {
  const cases = input.cases ?? []
  const routingActions = input.routingActions ?? []
  const interventions = input.interventions ?? []
  const outcomes = input.outcomes ?? []
  const responders = input.responders ?? []

  const totalCases = cases.length
  const openCases = cases.filter((item) => isOpenCase(item.case_status))
  const highSeverityCases = cases.filter((item) => isHighSeverity(item.severity_level))
  const safeguardingCases = cases.filter((item) => item.safeguarding_flag === true)

  const failedRouting = routingActions.filter((item) => isFailedRouting(item.routing_status))
  const activeRouting = routingActions.filter((item) => isActiveRouting(item.routing_status))
  const unassignedRouting = routingActions.filter((item) => !item.responder_id)

  const incompleteInterventions = interventions.filter((item) =>
    isIncompleteIntervention(item.intervention_status),
  )

  const weakOutcomes = outcomes.filter((item) => isWeakOutcome(item))

  const activeResponders = responders.filter((item) =>
    ['ACTIVE', 'VERIFIED'].includes(normalize(item.governance_status ?? item.responder_status)),
  )

  const restrictedResponders = responders.filter((item) =>
    ['RESTRICTED', 'SUSPENDED', 'REMOVED', 'UNDER_REVIEW'].includes(
      normalize(item.governance_status ?? item.responder_status),
    ),
  )

  const routingFriction = clamp(
    percentage(failedRouting.length + unassignedRouting.length, Math.max(routingActions.length, 1)),
  )

  const responderPressure = clamp(
    percentage(activeRouting.length + incompleteInterventions.length, Math.max(activeResponders.length * 3, 1)) +
      percentage(restrictedResponders.length, Math.max(responders.length, 1)) * 0.35,
  )

  const escalationVelocity = clamp(
    percentage(highSeverityCases.length + safeguardingCases.length, Math.max(totalCases, 1)),
  )

  const coordinationInstability = clamp(
    percentage(openCases.length + activeRouting.length + incompleteInterventions.length, Math.max(totalCases + routingActions.length + interventions.length, 1)),
  )

  const stabilizationDrag = clamp(
    percentage(incompleteInterventions.length + weakOutcomes.length, Math.max(interventions.length + outcomes.length, 1)),
  )

  const propagationRisk = clamp(
    routingFriction * 0.22 +
      responderPressure * 0.18 +
      escalationVelocity * 0.2 +
      coordinationInstability * 0.2 +
      stabilizationDrag * 0.2,
  )

  const pressureScores = {
    'Routing friction': routingFriction,
    'Responder pressure': responderPressure,
    'Escalation velocity': escalationVelocity,
    'Coordination instability': coordinationInstability,
    'Stabilization drag': stabilizationDrag,
  }

  const pressurePropagationState = getState(propagationRisk)
  const severity = getSeverity(propagationRisk)
  const dominantPressureSource = strongestSource(pressureScores)

  const executiveSummary =
    pressurePropagationState === 'CASCADE_RISK'
      ? 'Continuity pressure is no longer contained. Instability is spreading across routing, response, and stabilization pathways.'
      : pressurePropagationState === 'SPREADING'
        ? 'Continuity pressure is spreading. Routing friction, responder load, or unresolved interventions may weaken stabilization confidence.'
        : pressurePropagationState === 'BUILDING'
          ? 'Continuity pressure is building. Current instability is still manageable but requires early governance attention.'
          : 'Continuity pressure appears contained. Current pathways show limited propagation risk.'

  const actionCue =
    pressurePropagationState === 'CASCADE_RISK'
      ? 'Activate command review, inspect unresolved pathways, and prioritize high-severity or safeguarding-linked cases.'
      : pressurePropagationState === 'SPREADING'
        ? 'Review routing delays, responder load, and intervention gaps before pressure becomes systemic.'
        : pressurePropagationState === 'BUILDING'
          ? 'Monitor pressure sources and resolve early bottlenecks before escalation spreads.'
          : 'Maintain monitoring and continue routine continuity governance.'

  return {
    propagationRisk,
    routingFriction,
    responderPressure,
    escalationVelocity,
    coordinationInstability,
    stabilizationDrag,
    pressurePropagationState,
    severity,
    dominantPressureSource,
    executiveSummary,
    actionCue,
  }
}