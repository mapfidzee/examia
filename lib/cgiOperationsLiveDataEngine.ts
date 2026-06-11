import type { CGILiveOperationalInput } from '@/lib/cgiLiveOperationalIntegrationEngine'

export type OperationsCase = {
  id: string
  case_status: string
  severity_level?: string | null
  safeguarding_flag?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export type OperationsRoutingAction = {
  id: string
  case_id: string
  assigned_responder_id?: string | null
  created_at?: string | null
}

export type OperationsIntervention = {
  id: string
  case_id: string
  intervention_status?: string | null
  evidence_summary?: string | null
  created_at?: string | null
}

export type OperationsOutcome = {
  id: string
  case_id: string
  outcome_status?: string | null
  outcome_summary?: string | null
  created_at?: string | null
}

export type OperationsTimelineEvent = {
  id: string
  case_id: string
  event_type?: string | null
  event_summary?: string | null
  created_at?: string | null
}

export type OperationsLiveDataInput = {
  cases: OperationsCase[]
  routingActions: OperationsRoutingAction[]
  interventions: OperationsIntervention[]
  outcomes: OperationsOutcome[]
  timelineEvents?: OperationsTimelineEvent[]
}

export const OPERATIONAL_ACTIVE_STATUSES = [
  'NEED_DETECTED',
  'UNDER_ASSESSMENT',
  'ROUTED',
  'RESPONDER_ASSIGNED',
  'INTERVENTION_ACTIVE',
  'STABILIZING',
  'ACCEPTED_FOR_GOVERNANCE',
  'STABILIZATION_OWNER_ROUTED',
  'GOVERNANCE_REVIEW_REQUIRED',
  'EVIDENCE_REQUIRED_BEFORE_ROUTING',
  'OWNERSHIP_CLARITY_REQUIRED',
  'ROUTING_STALLED',
  'ACTION_ACTIVE',
  'RECOVERY_MONITORING',
  'ESCALATED',
  'REOPENED',
  'PARTIAL_STABILIZATION',
  'IMPROVING',
]

export const OPERATIONAL_ESCALATED_STATUSES = [
  'ESCALATED',
  'GOVERNANCE_REVIEW_REQUIRED',
  'ROUTING_STALLED',
  'REOPENED',
]

export const OPERATIONAL_CRITICAL_SEVERITIES = [
  'CRITICAL',
  'HIGH',
  'SEVERE',
]

export function buildCGIOperationsLiveDataInput(
  input: OperationsLiveDataInput,
): CGILiveOperationalInput {
  const activeCases = input.cases.filter((caseItem) =>
    OPERATIONAL_ACTIVE_STATUSES.includes(caseItem.case_status),
  )

  const escalatedCases = activeCases.filter((caseItem) =>
    OPERATIONAL_ESCALATED_STATUSES.includes(caseItem.case_status),
  )

  const unresolvedCriticalCases = activeCases.filter(
    (caseItem) =>
      OPERATIONAL_CRITICAL_SEVERITIES.includes(
        String(caseItem.severity_level || '').toUpperCase(),
      ) && caseItem.case_status !== 'STABILIZED',
  )

  const routedCaseIds = new Set(
    input.routingActions.map((item) => item.case_id),
  )

  const interventionCaseIds = new Set(
    input.interventions.map((item) => item.case_id),
  )

  const verifiedRecoveryOutcomes = input.outcomes.filter((outcome) =>
    isVerifiedRecoveryOutcome(outcome),
  )

  const recoveryFailureOutcomes = input.outcomes.filter((outcome) =>
    isRecoveryFailureOutcome(outcome),
  )

  const activeUnroutedCases = activeCases.filter(
    (caseItem) => !routedCaseIds.has(caseItem.id),
  )

  const actionStartedCases = activeCases.filter((caseItem) =>
    interventionCaseIds.has(caseItem.id),
  )

  const evidenceSubmittedOutcomes = input.outcomes.filter((outcome) =>
    Boolean(outcome.outcome_summary?.trim()),
  )

  const evidenceVerifiedOutcomes = input.outcomes.filter((outcome) =>
    isEvidenceVerified(outcome),
  )

  const repeatedInstabilityCount = countRepeatedInstabilitySignals(input)

  const coordinationIssues =
    activeUnroutedCases.length +
    input.routingActions.filter((item) => !item.assigned_responder_id).length

  const averageUnresolvedDays = averageUnresolvedAge(activeCases)

  const unresolvedDurationDays = maximumUnresolvedAge(activeCases)

  const reburnCount = countReburnSignals(input)

  const priorEscalationCount =
    escalatedCases.length +
    countTimelineMatches(input.timelineEvents || [], [
      'ESCALATION',
      'COMMAND',
      'GOVERNANCE_REVIEW',
    ])

  const priorSurvivabilityThreatCount =
    unresolvedCriticalCases.length +
    countTimelineMatches(input.timelineEvents || [], [
      'SURVIVABILITY',
      'COLLAPSE',
      'CRITICAL',
    ])

  const deadlineMissed = activeCases.some((caseItem) =>
    hasExceededOperationalWindow(caseItem),
  )

  return {
    route: 'OPERATIONS',
    openCases: activeCases.length,
    escalatedCases: escalatedCases.length,
    repeatedInstabilityCount,
    unresolvedCriticalCount: unresolvedCriticalCases.length,
    recoveryFailures: recoveryFailureOutcomes.length,
    verifiedRecoveries: verifiedRecoveryOutcomes.length,
    coordinationIssues,
    averageUnresolvedDays,
    unresolvedDurationDays,
    reburnCount,
    priorEscalationCount,
    priorSurvivabilityThreatCount,
    ownerAssigned: activeCases.length > 0 && activeUnroutedCases.length === 0,
    actionStarted: activeCases.length > 0 && actionStartedCases.length > 0,
    evidenceSubmitted: evidenceSubmittedOutcomes.length > 0,
    evidenceVerified: evidenceVerifiedOutcomes.length > 0,
    deadlineMissed,
  }
}

export function isVerifiedRecoveryOutcome(outcome: OperationsOutcome) {
  const status = String(outcome.outcome_status || '').toUpperCase()
  const summary = String(outcome.outcome_summary || '').toUpperCase()

  return (
    status.includes('STABILIZED') ||
    status.includes('VERIFIED') ||
    status.includes('DURABLE') ||
    summary.includes('DURABLE_RECOVERY_CONFIRMED') ||
    summary.includes('RECOVERY VERIFIED') ||
    summary.includes('STABILIZATION VERIFIED')
  )
}

export function isRecoveryFailureOutcome(outcome: OperationsOutcome) {
  const status = String(outcome.outcome_status || '').toUpperCase()
  const summary = String(outcome.outcome_summary || '').toUpperCase()

  return (
    status.includes('FAILED') ||
    status.includes('COLLAPSE') ||
    status.includes('REBURN') ||
    summary.includes('RECOVERY_COLLAPSE') ||
    summary.includes('REBURN_DETECTED') ||
    summary.includes('RECURRENT_REBURN_PATTERN')
  )
}

export function isEvidenceVerified(outcome: OperationsOutcome) {
  const status = String(outcome.outcome_status || '').toUpperCase()
  const summary = String(outcome.outcome_summary || '').toUpperCase()

  return (
    status.includes('VERIFIED') ||
    status.includes('STABILIZED') ||
    summary.includes('EVIDENCE VERIFIED') ||
    summary.includes('VERIFICATION COMPLETE') ||
    summary.includes('DURABLE_RECOVERY_CONFIRMED')
  )
}

export function countRepeatedInstabilitySignals(input: OperationsLiveDataInput) {
  const caseSignals = input.cases.filter((caseItem) =>
    ['REOPENED', 'RECOVERY_MONITORING', 'PARTIAL_STABILIZATION'].includes(
      caseItem.case_status,
    ),
  ).length

  const outcomeSignals = input.outcomes.filter((outcome) =>
    isRecoveryFailureOutcome(outcome),
  ).length

  const timelineSignals = countTimelineMatches(input.timelineEvents || [], [
    'REPEATED',
    'RECURRENCE',
    'REOPENED',
    'REBURN',
  ])

  return caseSignals + outcomeSignals + timelineSignals
}

export function countReburnSignals(input: OperationsLiveDataInput) {
  const outcomeReburns = input.outcomes.filter((outcome) =>
    isRecoveryFailureOutcome(outcome),
  ).length

  const timelineReburns = countTimelineMatches(input.timelineEvents || [], [
    'REBURN',
    'RECOVERY_COLLAPSE',
    'RECURRENCE',
  ])

  return outcomeReburns + timelineReburns
}

export function countTimelineMatches(
  timelineEvents: OperationsTimelineEvent[],
  terms: string[],
) {
  return timelineEvents.filter((event) => {
    const content = `${event.event_type || ''} ${
      event.event_summary || ''
    }`.toUpperCase()

    return terms.some((term) => content.includes(term))
  }).length
}

export function averageUnresolvedAge(cases: OperationsCase[]) {
  if (cases.length === 0) return 0

  const total = cases.reduce(
    (sum, caseItem) => sum + unresolvedAgeInDays(caseItem),
    0,
  )

  return Math.round(total / cases.length)
}

export function maximumUnresolvedAge(cases: OperationsCase[]) {
  if (cases.length === 0) return 0

  return Math.max(...cases.map((caseItem) => unresolvedAgeInDays(caseItem)))
}

export function unresolvedAgeInDays(caseItem: OperationsCase) {
  const sourceDate = caseItem.updated_at || caseItem.created_at

  if (!sourceDate) return 0

  const parsed = new Date(sourceDate)

  if (Number.isNaN(parsed.getTime())) return 0

  const ageMs = Date.now() - parsed.getTime()

  return Math.max(0, Math.round(ageMs / (1000 * 60 * 60 * 24)))
}

export function hasExceededOperationalWindow(caseItem: OperationsCase) {
  const severity = String(caseItem.severity_level || '').toUpperCase()
  const age = unresolvedAgeInDays(caseItem)

  if (severity === 'CRITICAL') return age > 1
  if (severity === 'HIGH' || severity === 'SEVERE') return age > 3

  return age > 7
}