export type StructuralMemorySeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

export type StructuralMemoryState =
  | 'LIMITED_PATTERN'
  | 'RECURRING_PATTERN'
  | 'STRUCTURAL_FRAGILITY'
  | 'SYSTEMIC_MEMORY_RISK'

export type BeneficiaryCaseMemoryLike = {
  id: string
  case_status?: string | null
  severity_level?: string | null
  safeguarding_flag?: boolean | null
  region?: string | null
  institution_id?: string | null
  institution_name?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type RoutingMemoryLike = {
  id: string
  case_id?: string | null
  routing_status?: string | null
  priority_level?: string | null
  routing_decision?: string | null
  responder_id?: string | null
  assigned_responder_id?: string | null
  institution_id?: string | null
  created_at?: string | null
}

export type InterventionMemoryLike = {
  id: string
  case_id?: string | null
  intervention_status?: string | null
  intervention_type?: string | null
  responder_id?: string | null
  assigned_responder_id?: string | null
  created_at?: string | null
  completed_at?: string | null
}

export type OutcomeMemoryLike = {
  id: string
  case_id?: string | null
  outcome_status?: string | null
  stabilization_status?: string | null
  recovery_status?: string | null
  created_at?: string | null
}

export type ResponderMemoryLike = {
  id: string
  governance_status?: string | null
  responder_status?: string | null
  operational_status?: string | null
  trust_score?: number | null
  active_case_count?: number | null
}

export type StructuralMemoryInput = {
  cases: BeneficiaryCaseMemoryLike[]
  routingActions: RoutingMemoryLike[]
  interventions: InterventionMemoryLike[]
  outcomes: OutcomeMemoryLike[]
  responders?: ResponderMemoryLike[]
}

export type StructuralMemoryResult = {
  structuralMemoryRisk: number
  routingFailureRecurrence: number
  escalationCorridorRecurrence: number
  institutionalFragilitySignature: number
  interventionFailurePattern: number
  responderStrainRecurrence: number
  continuityCollapseRecurrence: number
  structuralMemoryState: StructuralMemoryState
  severity: StructuralMemorySeverity
  dominantMemoryPattern: string
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

const countValues = (values: string[]) => {
  const counts: Record<string, number> = {}

  values.forEach((value) => {
    const safeValue = value || 'UNKNOWN'
    counts[safeValue] = (counts[safeValue] || 0) + 1
  })

  return counts
}

const highestRepeatPressure = (counts: Record<string, number>) => {
  const values = Object.values(counts)

  if (values.length === 0) return 0

  const highest = Math.max(...values)

  if (highest <= 1) return 0

  const total = values.reduce((sum, value) => sum + value, 0)

  return percentage(highest, total)
}

const isRoutingFailure = (item: RoutingMemoryLike) => {
  const status = normalize(item.routing_status)

  if (!item.responder_id && !item.assigned_responder_id) return true

  return [
    'FAILED',
    'DECLINED',
    'REJECTED',
    'UNASSIGNED',
    'DELAYED',
    'ESCALATED',
    'UNDER_REVIEW',
  ].includes(status)
}

const isEscalationSignal = (item: BeneficiaryCaseMemoryLike) => {
  const status = normalize(item.case_status)
  const severity = normalize(item.severity_level)

  return (
    ['ESCALATED', 'CRITICAL', 'URGENT'].includes(status) ||
    ['HIGH', 'CRITICAL', 'URGENT'].includes(severity) ||
    item.safeguarding_flag === true
  )
}

const isInterventionFailure = (item: InterventionMemoryLike) => {
  const status = normalize(item.intervention_status)

  return [
    'FAILED',
    'INCOMPLETE',
    'DELAYED',
    'ESCALATED',
    'UNDER_REVIEW',
    'PENDING',
  ].includes(status)
}

const isWeakOutcome = (item: OutcomeMemoryLike) => {
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

const isCollapsedCase = (item: BeneficiaryCaseMemoryLike) => {
  const status = normalize(item.case_status)
  return ['ESCALATED', 'FAILED', 'CANCELLED', 'COLLAPSED', 'UNRESOLVED'].includes(status)
}

const isResponderConstrained = (item: ResponderMemoryLike) => {
  const status = normalize(
    item.governance_status || item.responder_status || item.operational_status,
  )

  return ['RESTRICTED', 'SUSPENDED', 'REMOVED', 'UNDER_REVIEW', 'INACTIVE'].includes(status)
}

const getSeverity = (score: number): StructuralMemorySeverity => {
  if (score >= 80) return 'CRITICAL'
  if (score >= 60) return 'HIGH'
  if (score >= 35) return 'MODERATE'
  return 'LOW'
}

const getState = (score: number): StructuralMemoryState => {
  if (score >= 80) return 'SYSTEMIC_MEMORY_RISK'
  if (score >= 60) return 'STRUCTURAL_FRAGILITY'
  if (score >= 35) return 'RECURRING_PATTERN'
  return 'LIMITED_PATTERN'
}

const strongestPattern = (scores: Record<string, number>) => {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No dominant structural memory pattern detected'
}

export function evaluateStructuralMemory(
  input: StructuralMemoryInput,
): StructuralMemoryResult {
  const cases = input.cases ?? []
  const routingActions = input.routingActions ?? []
  const interventions = input.interventions ?? []
  const outcomes = input.outcomes ?? []
  const responders = input.responders ?? []

  const totalCases = cases.length

  const failedRouting = routingActions.filter((item) => isRoutingFailure(item))
  const escalationSignals = cases.filter((item) => isEscalationSignal(item))
  const failedInterventions = interventions.filter((item) => isInterventionFailure(item))
  const weakOutcomes = outcomes.filter((item) => isWeakOutcome(item))
  const collapsedCases = cases.filter((item) => isCollapsedCase(item))
  const constrainedResponders = responders.filter((item) => isResponderConstrained(item))

  const routingFailureCaseCounts = countValues(
    failedRouting.map((item) => item.case_id || 'CASE_NOT_RECORDED'),
  )

  const escalationRegionCounts = countValues(
    escalationSignals.map(
      (item) => item.region || item.institution_name || item.institution_id || 'LOCATION_NOT_RECORDED',
    ),
  )

  const institutionalCounts = countValues(
    cases.map(
      (item) => item.institution_name || item.institution_id || item.region || 'INSTITUTION_NOT_RECORDED',
    ),
  )

  const failedInterventionTypeCounts = countValues(
    failedInterventions.map((item) => item.intervention_type || 'INTERVENTION_NOT_RECORDED'),
  )

  const responderLoadCounts = countValues(
    [
      ...routingActions.map(
        (item) => item.responder_id || item.assigned_responder_id || 'UNASSIGNED',
      ),
      ...interventions.map(
        (item) => item.responder_id || item.assigned_responder_id || 'UNASSIGNED',
      ),
    ],
  )

  const collapseLocationCounts = countValues(
    collapsedCases.map(
      (item) => item.region || item.institution_name || item.institution_id || 'LOCATION_NOT_RECORDED',
    ),
  )

  const routingFailureRecurrence = clamp(
    percentage(failedRouting.length, Math.max(routingActions.length, 1)) * 0.65 +
      highestRepeatPressure(routingFailureCaseCounts) * 0.35,
  )

  const escalationCorridorRecurrence = clamp(
    percentage(escalationSignals.length, Math.max(totalCases, 1)) * 0.55 +
      highestRepeatPressure(escalationRegionCounts) * 0.45,
  )

  const institutionalFragilitySignature = clamp(
    highestRepeatPressure(institutionalCounts) * 0.7 +
      percentage(escalationSignals.length + weakOutcomes.length, Math.max(totalCases + outcomes.length, 1)) *
        0.3,
  )

  const interventionFailurePattern = clamp(
    percentage(failedInterventions.length + weakOutcomes.length, Math.max(interventions.length + outcomes.length, 1)) *
      0.65 +
      highestRepeatPressure(failedInterventionTypeCounts) * 0.35,
  )

  const responderStrainRecurrence = clamp(
    highestRepeatPressure(responderLoadCounts) * 0.55 +
      percentage(constrainedResponders.length, Math.max(responders.length, 1)) * 0.45,
  )

  const continuityCollapseRecurrence = clamp(
    percentage(collapsedCases.length + weakOutcomes.length, Math.max(totalCases + outcomes.length, 1)) *
      0.65 +
      highestRepeatPressure(collapseLocationCounts) * 0.35,
  )

  const structuralMemoryRisk = clamp(
    routingFailureRecurrence * 0.17 +
      escalationCorridorRecurrence * 0.18 +
      institutionalFragilitySignature * 0.17 +
      interventionFailurePattern * 0.17 +
      responderStrainRecurrence * 0.14 +
      continuityCollapseRecurrence * 0.17,
  )

  const memoryScores = {
    'Routing failure recurrence': routingFailureRecurrence,
    'Escalation corridor recurrence': escalationCorridorRecurrence,
    'Institutional fragility signature': institutionalFragilitySignature,
    'Intervention failure pattern': interventionFailurePattern,
    'Responder strain recurrence': responderStrainRecurrence,
    'Continuity collapse recurrence': continuityCollapseRecurrence,
  }

  const structuralMemoryState = getState(structuralMemoryRisk)
  const severity = getSeverity(structuralMemoryRisk)
  const dominantMemoryPattern = strongestPattern(memoryScores)

  const executiveSummary =
    structuralMemoryState === 'SYSTEMIC_MEMORY_RISK'
      ? 'Structural memory shows systemic recurrence. Instability is not only present; it is repeating across pathways, locations, responders, or stabilization outcomes.'
      : structuralMemoryState === 'STRUCTURAL_FRAGILITY'
        ? 'Structural memory shows fragility. Repeated patterns suggest the system may be reproducing instability rather than fully resolving it.'
        : structuralMemoryState === 'RECURRING_PATTERN'
          ? 'Structural memory shows recurring signals. Some continuity problems are repeating and should be reviewed before they become institutional habits.'
          : 'Structural memory currently shows limited recurrence. Continue monitoring for repeated routing, escalation, intervention, and recovery patterns.'

  const actionCue =
    structuralMemoryState === 'SYSTEMIC_MEMORY_RISK'
      ? 'Activate structural memory review, inspect recurring instability corridors, and prioritize repeat-failure pathways for governance correction.'
      : structuralMemoryState === 'STRUCTURAL_FRAGILITY'
        ? 'Review repeated routing gaps, escalation corridors, intervention failures, and weak recovery patterns before they harden into systemic fragility.'
        : structuralMemoryState === 'RECURRING_PATTERN'
          ? 'Track repeated patterns and compare them against routing, responder, institution, and outcome records.'
          : 'Maintain structural memory monitoring and continue routine recurrence checks.'

  return {
    structuralMemoryRisk,
    routingFailureRecurrence,
    escalationCorridorRecurrence,
    institutionalFragilitySignature,
    interventionFailurePattern,
    responderStrainRecurrence,
    continuityCollapseRecurrence,
    structuralMemoryState,
    severity,
    dominantMemoryPattern,
    executiveSummary,
    actionCue,
  }
}