export type CommandCaseForDoctrine = {
  id: string
  beneficiary_name: string
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  outcome_summary: string | null
}

export type RoutingActionForDoctrine = {
  id: string
  case_id: string
  assigned_responder_id?: string | null
}

export type InterventionRecordForDoctrine = {
  id: string
  case_id: string
}

export type OutcomeRecordForDoctrine = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
}

export type ResponderForDoctrine = {
  id: string
  operational_status: string
}

export type InstitutionForDoctrine = {
  id: string
  coordination_status: string | null
}

export type CommandPosture =
  | 'COMMAND CLEAR'
  | 'COMMAND WATCH'
  | 'ELEVATED COMMAND'
  | 'CRITICAL COMMAND'

export type CommandReadiness =
  | 'READY_FOR_EXECUTIVE_REPORT'
  | 'NOT_READY_FOR_EXECUTIVE_REPORT'
  | 'CONDITIONAL_REPORT_READINESS'

export type CommandDecision = {
  decision: string
  owner: string
  deadline: string
  evidenceRequired: string
  status: string
}

export type CommandCaseRecord = {
  caseItem: CommandCaseForDoctrine
  recoveryDisposition: string
  commandPosture: string
  reburnVisible: boolean
}

export const COMMAND_VISIBLE_STATUSES = [
  'TRIAGE_COMMAND_ESCALATION',
  'ACCEPTED_FOR_GOVERNANCE',
  'STABILIZATION_OWNER_ROUTED',
  'STABILIZATION_OWNER_ROUTED_RECURRENCE',
  'GOVERNANCE_REVIEW_REQUIRED',
  'GOVERNANCE_REVIEW_REQUIRED_RECURRENCE',
  'EVIDENCE_REQUIRED_BEFORE_ROUTING',
  'OWNERSHIP_CLARITY_REQUIRED',
  'ROUTING_STALLED',
  'ACTION_ACTIVE',
  'INTERVENTION_ACTIVE',
  'INTERVENTION_RECORDED',
  'PARTIAL_STABILIZATION',
  'FOLLOW_UP_REQUIRED',
  'IMPROVING',
  'RECOVERY_MONITORING',
  'ESCALATED',
  'REOPENED',
]

export const PRESSURE_TYPES = [
  'FLOW',
  'COVERAGE',
  'COORDINATION',
  'OWNERSHIP',
  'EVIDENCE',
  'RECOVERY',
  'RELIABILITY',
]

export type CommandIntelligence = {
  posture: CommandPosture
  commandThesis: string
  dominantThreat: string
  executiveAction: string
  readiness: CommandReadiness
  readinessMeaning: string
  movementDecision: string
  nextDestination: string
  whyNow: string
  ifNoAction: string
  activeCases: number
  escalatedCritical: number
  crossSiteSignals: number
  recoveryMonitoring: number
  routingGaps: number
  outcomeGaps: number
  requiredDecisions: CommandDecision[]
  evidenceStandard: string
  recoveryCredibility: string
  coordinationRequired: boolean
  crossSiteRequired: boolean
  executiveReviewRequired: boolean
  auditRequired: boolean
  pressureSignal: string
  trajectorySignal: string
  recoverySignal: string
  reliabilitySignal: string
  survivabilitySignal: string
  memory: string
  persistence: string
  risk: string
  supportingSignals: {
    label: string
    value: string
  }[]
}

export function buildCommandCaseRecords(
  cases: CommandCaseForDoctrine[],
  outcomes: OutcomeRecordForDoctrine[],
): CommandCaseRecord[] {
  return cases.map((caseItem) => {
    const caseOutcomes = outcomes.filter(
      (outcome) => outcome.case_id === caseItem.id,
    )

    const latestRecoveryReview = caseOutcomes.find((outcome) =>
      isRecoverySummary(outcome.outcome_summary || ''),
    )

    const summary =
      latestRecoveryReview?.outcome_summary || caseItem.outcome_summary || ''

    const recoveryDisposition =
      extractField(summary, 'RECOVERY DISPOSITION') ||
      deriveDispositionFromCase(caseItem)

    const durabilityResult =
      extractField(summary, 'DURABILITY RESULT') ||
      latestRecoveryReview?.outcome_status ||
      'DURABILITY_UNRECORDED'

    const reburnSignal = extractField(summary, 'REBURN SIGNAL')

    return {
      caseItem,
      recoveryDisposition,
      commandPosture:
        extractField(summary, 'COMMAND POSTURE') ||
        deriveCommandPostureFromCase(caseItem),
      reburnVisible:
        durabilityResult.includes('REBURN') ||
        reburnSignal.includes('REBURN') ||
        summary.includes('REBURN') ||
        Boolean(caseItem.outcome_summary?.includes('REBURN')),
    }
  })
}

export function buildCommandIntelligence(input: {
  cases: CommandCaseForDoctrine[]
  records: CommandCaseRecord[]
  routingActions: RoutingActionForDoctrine[]
  interventions: InterventionRecordForDoctrine[]
  outcomes: OutcomeRecordForDoctrine[]
  responders: ResponderForDoctrine[]
  institutions: InstitutionForDoctrine[]
}): CommandIntelligence {
  const activeCases = input.cases.filter((item) =>
    COMMAND_VISIBLE_STATUSES.includes(item.case_status),
  ).length

  const escalatedCases = input.cases.filter(
    (item) =>
      item.case_status === 'ESCALATED' ||
      item.case_status === 'TRIAGE_COMMAND_ESCALATION',
  ).length

  const criticalCases = input.cases.filter(
    (item) => item.severity_level === 'CRITICAL',
  ).length

  const safeguardingFlags = input.cases.filter(
    (item) => item.safeguarding_flag,
  ).length

  const recurrenceCases = input.cases.filter(
    (item) =>
      item.case_status.includes('RECURRENCE') ||
      item.case_status === 'REOPENED',
  ).length

  const recoveryMonitoring = input.cases.filter(
    (item) => item.case_status === 'RECOVERY_MONITORING',
  ).length

  const outcomeCaseIds = new Set(input.outcomes.map((item) => item.case_id))
  const interventionCaseIds = new Set(
    input.interventions.map((item) => item.case_id),
  )
  const routedCaseIds = new Set(
    input.routingActions.map((item) => item.case_id),
  )

  const activeWithoutRouting = input.cases.filter(
    (item) =>
      COMMAND_VISIBLE_STATUSES.includes(item.case_status) &&
      !routedCaseIds.has(item.id),
  ).length

  const routedWithoutResponder = input.routingActions.filter(
    (item) => !item.assigned_responder_id,
  ).length

  const activeWithoutOutcome = input.cases.filter(
    (item) =>
      COMMAND_VISIBLE_STATUSES.includes(item.case_status) &&
      !outcomeCaseIds.has(item.id),
  ).length

  const unresolvedInterventionPathways = input.cases.filter(
    (item) =>
      COMMAND_VISIBLE_STATUSES.includes(item.case_status) &&
      interventionCaseIds.has(item.id) &&
      !outcomeCaseIds.has(item.id),
  ).length

  const stalledCases = input.cases.filter(
    (item) =>
      COMMAND_VISIBLE_STATUSES.includes(item.case_status) &&
      outcomeCaseIds.has(item.id) &&
      item.case_status !== 'STABILIZED',
  ).length

  const crossSiteSignals = input.cases.filter(
    (item) =>
      item.region ||
      item.institution_name ||
      item.case_status.includes('RECURRENCE') ||
      item.case_status === 'REOPENED',
  ).length

  const routingGaps = activeWithoutRouting + routedWithoutResponder
  const outcomeGaps = activeWithoutOutcome
  const escalatedCritical = escalatedCases + criticalCases

  const commandPressure =
    escalatedCases * 3 +
    criticalCases * 3 +
    safeguardingFlags * 2 +
    recurrenceCases * 2 +
    routingGaps +
    outcomeGaps +
    unresolvedInterventionPathways +
    stalledCases +
    (crossSiteSignals > 1 ? 2 : 0)

  const posture = deriveActionPosture(commandPressure)

  const readiness = deriveReadiness({
    posture,
    activeWithoutRouting,
    routedWithoutResponder,
    activeWithoutOutcome,
    unresolvedInterventionPathways,
  })

  const dominantThreat = deriveDominantThreat({
    crossSiteSignals,
    recurrenceCases,
    escalatedCases,
    criticalCases,
    safeguardingFlags,
    activeWithoutRouting,
    routedWithoutResponder,
    activeWithoutOutcome,
    unresolvedInterventionPathways,
    stalledCases,
  })

  const requiredDecisions = buildRequiredDecisions({
    activeWithoutRouting,
    routedWithoutResponder,
    activeWithoutOutcome,
    unresolvedInterventionPathways,
    outcomeCoverage:
      input.cases.length === 0
        ? 0
        : Math.round((outcomeCaseIds.size / input.cases.length) * 100),
    crossSiteSignals,
    recurrenceCases,
    escalatedCases,
    criticalCases,
    safeguardingFlags,
  })

  const movementDecision = deriveMovementDecision({
    escalatedCases,
    criticalCases,
    safeguardingFlags,
    recurrenceCases,
    crossSiteSignals,
    routingGaps,
    outcomeGaps,
    recoveryMonitoring,
    posture,
  })

  const nextDestination = deriveNextDestination({
    readiness,
    movementDecision,
    crossSiteSignals,
    routingGaps,
    escalatedCases,
    criticalCases,
  })

  const commandThesis = deriveCommandThesis({ posture, dominantThreat })
  const executiveAction = deriveExecutiveAction({ posture, readiness })

  const coordinationRequired =
    routingGaps > 0 || movementDecision.includes('Coordination')

  const crossSiteRequired = crossSiteSignals > 1 || recurrenceCases > 0

  const executiveReviewRequired =
    escalatedCases > 0 ||
    criticalCases > 0 ||
    safeguardingFlags > 0 ||
    posture === 'CRITICAL COMMAND'

  const auditRequired =
    executiveReviewRequired ||
    recurrenceCases > 0 ||
    crossSiteRequired ||
    safeguardingFlags > 0

  return {
    posture,
    commandThesis,
    dominantThreat,
    executiveAction,
    readiness,
    readinessMeaning: deriveReadinessMeaning(readiness),
    movementDecision,
    nextDestination,
    whyNow:
      'Command is required because visible continuity pressure must become owned, evidenced, time-bound action before the chain can safely move forward.',
    ifNoAction:
      'Unresolved ownership, weak evidence, recurrence, or cross-site exposure can disappear into false stability.',
    activeCases,
    escalatedCritical,
    crossSiteSignals,
    recoveryMonitoring,
    routingGaps,
    outcomeGaps,
    requiredDecisions,
    evidenceStandard:
      'Preserve command decision, owner, deadline, evidence requirement, recovery status, coordination handoff, cross-site exposure, executive rationale, and audit trail.',
    recoveryCredibility:
      recoveryMonitoring > 0
        ? 'Recovery monitoring is visible, but durability must remain under observation.'
        : 'Recovery credibility remains dependent on outcome evidence and recurrence review.',
    coordinationRequired,
    crossSiteRequired,
    executiveReviewRequired,
    auditRequired,
    pressureSignal:
      commandPressure >= 8
        ? 'ELEVATED'
        : commandPressure >= 3
          ? 'VISIBLE'
          : 'CLEAR',
    trajectorySignal:
      recurrenceCases > 0 || crossSiteSignals > 1 ? 'UNSTABLE' : 'WATCH',
    recoverySignal: recoveryMonitoring > 0 ? 'MONITORING' : 'PENDING',
    reliabilitySignal: recurrenceCases > 0 ? 'VARIABLE' : 'STABLE',
    survivabilitySignal: posture === 'COMMAND CLEAR' ? 'CLEAR' : 'WATCH',
    memory: recurrenceCases > 0 ? 'RECURRENCE' : 'PRESERVED',
    persistence:
      recurrenceCases > 0
        ? 'PERSISTENT'
        : commandPressure > 0
          ? 'EMERGING'
          : 'NONE ACTIVE',
    risk:
      posture === 'CRITICAL COMMAND' || posture === 'ELEVATED COMMAND'
        ? 'WATCHED'
        : 'MONITORED',
    supportingSignals: [
      { label: 'Active Cases', value: String(activeCases) },
      { label: 'Escalated / Critical', value: String(escalatedCritical) },
      { label: 'Safeguarding', value: String(safeguardingFlags) },
      { label: 'Cross-Site', value: String(crossSiteSignals) },
      { label: 'Routing Gaps', value: String(routingGaps) },
      { label: 'Outcome Gaps', value: String(outcomeGaps) },
      {
        label: 'Responders Active',
        value: String(
          input.responders.filter(
            (item) => item.operational_status === 'ACTIVE',
          ).length,
        ),
      },
      {
        label: 'Institutions Active',
        value: String(
          input.institutions.filter(
            (item) => item.coordination_status === 'ACTIVE',
          ).length,
        ),
      },
    ],
  }
}

export function buildCommandOrder(input: {
  reportTemplate: string
  commandScope: string
  intelligence: CommandIntelligence
  additionalNotes: string
}) {
  return [
    'TSINAXA CGI EXECUTIVE COMMAND ORDER',
    '',
    `Template: ${input.reportTemplate}`,
    `Scope: ${input.commandScope}`,
    '',
    `Command Posture: ${input.intelligence.posture}`,
    `Movement Decision: ${input.intelligence.movementDecision}`,
    `Next Destination: ${input.intelligence.nextDestination}`,
    '',
    `Command Thesis: ${input.intelligence.commandThesis}`,
    '',
    `Dominant Threat: ${input.intelligence.dominantThreat}`,
    '',
    `Executive Action: ${input.intelligence.executiveAction}`,
    '',
    `Command Readiness: ${input.intelligence.readiness}`,
    `Readiness Meaning: ${input.intelligence.readinessMeaning}`,
    '',
    'Required Decisions:',
    ...input.intelligence.requiredDecisions.map(
      (item, index) =>
        `${index + 1}. ${item.decision}
   Owner: ${item.owner}
   Deadline: ${item.deadline}
   Evidence: ${item.evidenceRequired}
   Status: ${item.status}`,
    ),
    '',
    `Evidence Standard: ${input.intelligence.evidenceStandard}`,
    '',
    'Governance-Safe Meaning:',
    'Command assigns action responsibility without assigning blame. It protects visibility, ownership, evidence, deadlines, movement, memory, and auditability until continuity can safely move forward.',
    '',
    'Additional Operational Notes:',
    input.additionalNotes.trim() || 'No additional operational notes entered.',
  ].join('\n')
}

function deriveActionPosture(commandPressure: number): CommandPosture {
  if (commandPressure >= 14) return 'CRITICAL COMMAND'
  if (commandPressure >= 8) return 'ELEVATED COMMAND'
  if (commandPressure >= 3) return 'COMMAND WATCH'
  return 'COMMAND CLEAR'
}

function deriveReadiness(input: {
  posture: CommandPosture
  activeWithoutRouting: number
  routedWithoutResponder: number
  activeWithoutOutcome: number
  unresolvedInterventionPathways: number
}): CommandReadiness {
  if (
    input.activeWithoutRouting > 0 ||
    input.routedWithoutResponder > 0 ||
    input.activeWithoutOutcome > 0 ||
    input.unresolvedInterventionPathways > 0
  ) {
    return 'NOT_READY_FOR_EXECUTIVE_REPORT'
  }

  if (
    input.posture === 'ELEVATED COMMAND' ||
    input.posture === 'CRITICAL COMMAND'
  ) {
    return 'CONDITIONAL_REPORT_READINESS'
  }

  return 'READY_FOR_EXECUTIVE_REPORT'
}

function deriveReadinessMeaning(readiness: CommandReadiness) {
  if (readiness === 'NOT_READY_FOR_EXECUTIVE_REPORT') {
    return 'Command cannot release the chain to Executive Report until ownership, evidence, and outcome gaps are resolved.'
  }

  if (readiness === 'CONDITIONAL_REPORT_READINESS') {
    return 'Command may move toward Executive Report only if decision ownership and evidence standards remain attached.'
  }

  return 'Command can release the chain toward Executive Report because action evidence is sufficiently clear.'
}

function deriveDominantThreat(input: {
  crossSiteSignals: number
  recurrenceCases: number
  escalatedCases: number
  criticalCases: number
  safeguardingFlags: number
  activeWithoutRouting: number
  routedWithoutResponder: number
  activeWithoutOutcome: number
  unresolvedInterventionPathways: number
  stalledCases: number
}) {
  if (input.crossSiteSignals > 1 && input.recurrenceCases > 0) {
    return 'Distributed recurrence exposure'
  }

  if (input.escalatedCases > 0 || input.criticalCases > 0) {
    return 'Unresolved executive escalation pressure'
  }

  if (input.safeguardingFlags > 0) {
    return 'Safeguarding-visible continuity pressure'
  }

  if (input.activeWithoutRouting > 0 || input.routedWithoutResponder > 0) {
    return 'Ownership and routing uncertainty'
  }

  if (
    input.activeWithoutOutcome > 0 ||
    input.unresolvedInterventionPathways > 0 ||
    input.stalledCases > 0
  ) {
    return 'Evidence and recovery credibility weakness'
  }

  return 'No dominant command threat visible'
}

function deriveMovementDecision(input: {
  escalatedCases: number
  criticalCases: number
  safeguardingFlags: number
  recurrenceCases: number
  crossSiteSignals: number
  routingGaps: number
  outcomeGaps: number
  recoveryMonitoring: number
  posture: CommandPosture
}) {
  if (
    input.escalatedCases > 0 ||
    input.criticalCases > 0 ||
    input.safeguardingFlags > 0
  ) {
    return 'Executive Review Required'
  }

  if (input.crossSiteSignals > 1 || input.recurrenceCases > 0) {
    return 'Cross-Site Review Required'
  }

  if (input.routingGaps > 0) {
    return 'Coordination Required'
  }

  if (input.outcomeGaps > 0) {
    return 'Evidence Review Required'
  }

  if (input.recoveryMonitoring > 0) {
    return 'Continue Recovery Monitoring'
  }

  if (input.posture === 'COMMAND CLEAR') {
    return 'Maintain Clear Command'
  }

  return 'Maintain Command Watch'
}

function deriveNextDestination(input: {
  readiness: CommandReadiness
  movementDecision: string
  crossSiteSignals: number
  routingGaps: number
  escalatedCases: number
  criticalCases: number
}) {
  if (input.escalatedCases > 0 || input.criticalCases > 0) {
    return 'Executive Center'
  }

  if (input.crossSiteSignals > 1 || input.movementDecision.includes('Cross-Site')) {
    return 'Cross-Site Review'
  }

  if (input.routingGaps > 0 || input.movementDecision.includes('Coordination')) {
    return 'Coordination Center'
  }

  if (input.movementDecision.includes('Evidence')) return 'Outcomes Review'
  if (input.movementDecision.includes('Recovery')) return 'Recovery'

  if (input.readiness === 'READY_FOR_EXECUTIVE_REPORT') {
    return 'Executive Report'
  }

  return 'Command Watch'
}

function deriveCommandThesis(input: {
  posture: CommandPosture
  dominantThreat: string
}) {
  if (input.posture === 'CRITICAL COMMAND') {
    return `Command must act immediately because ${input.dominantThreat.toLowerCase()} is threatening continuity credibility.`
  }

  if (input.posture === 'ELEVATED COMMAND') {
    return `Command must keep leadership action visible because ${input.dominantThreat.toLowerCase()} has not been converted into trusted stability.`
  }

  if (input.posture === 'COMMAND WATCH') {
    return `Command should maintain watch until ${input.dominantThreat.toLowerCase()} is resolved or proven absorbable.`
  }

  return 'Command is clear. No active executive action is required beyond monitoring and memory preservation.'
}

function deriveExecutiveAction(input: {
  posture: CommandPosture
  readiness: CommandReadiness
}) {
  if (input.readiness === 'NOT_READY_FOR_EXECUTIVE_REPORT') {
    return 'Hold command visibility and require ownership, outcome, and evidence correction before executive conclusion.'
  }

  if (input.posture === 'CRITICAL COMMAND') {
    return 'Issue immediate executive command order, assign accountable owners, and require evidence within 24 hours.'
  }

  if (input.posture === 'ELEVATED COMMAND') {
    return 'Maintain executive command watch, assign owners, and require evidence before posture reduction.'
  }

  if (input.posture === 'COMMAND WATCH') {
    return 'Continue command watch and confirm whether the threat is resolving or recurring.'
  }

  return 'Maintain monitoring. No command escalation is currently required.'
}

function buildRequiredDecisions(input: {
  activeWithoutRouting: number
  routedWithoutResponder: number
  activeWithoutOutcome: number
  unresolvedInterventionPathways: number
  outcomeCoverage: number
  crossSiteSignals: number
  recurrenceCases: number
  escalatedCases: number
  criticalCases: number
  safeguardingFlags: number
}): CommandDecision[] {
  const decisions: CommandDecision[] = []

  if (input.activeWithoutRouting > 0 || input.routedWithoutResponder > 0) {
    decisions.push({
      decision: 'Resolve ownership and routing gaps',
      owner: 'Coordination Lead',
      deadline: 'Within 24 hours',
      evidenceRequired:
        'Assigned owner, responder, route decision, and routing rationale.',
      status: 'Required before executive report movement',
    })
  }

  if (
    input.activeWithoutOutcome > 0 ||
    input.unresolvedInterventionPathways > 0 ||
    input.outcomeCoverage < 60
  ) {
    decisions.push({
      decision: 'Strengthen outcome and recovery evidence',
      owner: 'Stabilization Owner',
      deadline: 'Within 48 hours',
      evidenceRequired:
        'Outcome verification, intervention closure, recovery confidence, and residual risk.',
      status: 'Evidence gap active',
    })
  }

  if (input.crossSiteSignals > 1 || input.recurrenceCases > 0) {
    decisions.push({
      decision: 'Confirm cross-site exposure and recurrence risk',
      owner: 'Cross-Site Review Owner',
      deadline: 'Within 48 hours',
      evidenceRequired:
        'Affected sites, shared dependency, recurrence pattern, and enterprise exposure statement.',
      status: 'Cross-site interpretation required',
    })
  }

  if (input.escalatedCases > 0 || input.criticalCases > 0) {
    decisions.push({
      decision: 'Maintain escalation visibility',
      owner: 'Command Administrator',
      deadline: 'Immediate',
      evidenceRequired:
        'Escalation reason, executive concern, required action, and consequence if unresolved.',
      status: 'Executive visibility required',
    })
  }

  if (input.safeguardingFlags > 0) {
    decisions.push({
      decision: 'Protect safeguarding-visible continuity records',
      owner: 'Governance Officer',
      deadline: 'Immediate',
      evidenceRequired:
        'Safeguarding visibility, governance-safe language, access control, and audit preservation.',
      status: 'Governance protection required',
    })
  }

  if (decisions.length === 0) {
    decisions.push({
      decision: 'Maintain command monitoring',
      owner: 'Command Center',
      deadline: 'Routine review cycle',
      evidenceRequired:
        'Current posture, monitoring note, and memory preservation statement.',
      status: 'No command escalation required',
    })
  }

  return decisions
}

function deriveDispositionFromCase(caseItem: CommandCaseForDoctrine) {
  if (
    caseItem.case_status === 'TRIAGE_COMMAND_ESCALATION' ||
    caseItem.case_status.includes('ESCALATED') ||
    caseItem.safeguarding_flag
  ) {
    return 'MOVE_TO_COMMAND_ESCALATION'
  }

  if (
    caseItem.case_status === 'EVIDENCE_REQUIRED_BEFORE_ROUTING' ||
    caseItem.case_status === 'OWNERSHIP_CLARITY_REQUIRED' ||
    caseItem.case_status === 'FOLLOW_UP_REQUIRED'
  ) {
    return 'RETURN_TO_OUTCOMES_REVIEW'
  }

  if (caseItem.case_status === 'RECOVERY_MONITORING') {
    return 'CONTINUE_RECOVERY_MONITORING'
  }

  return 'MOVE_TO_COMMAND_WATCH'
}

function deriveCommandPostureFromCase(caseItem: CommandCaseForDoctrine) {
  if (
    caseItem.case_status === 'TRIAGE_COMMAND_ESCALATION' ||
    caseItem.case_status.includes('ESCALATED') ||
    caseItem.safeguarding_flag
  ) {
    return 'EXECUTIVE_CONTINUITY_REVIEW'
  }

  if (
    caseItem.case_status === 'RECOVERY_MONITORING' ||
    caseItem.case_status === 'FOLLOW_UP_REQUIRED'
  ) {
    return 'ELEVATED_RECOVERY_REVIEW'
  }

  return 'COMMAND_WATCH'
}

function isRecoverySummary(summary: string) {
  return (
    summary.includes('DURABILITY RESULT') ||
    summary.includes('RECOVERY TRAJECTORY') ||
    summary.includes('RECOVERY MATURITY') ||
    summary.includes('RECOVERY CONFIDENCE') ||
    summary.includes('RECOVERY DISPOSITION') ||
    summary.includes('RECOMMENDED NEXT MOVEMENT')
  )
}

function extractField(summary: string, label: string) {
  if (!summary) return ''

  const lines = summary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const target = label.trim().toLowerCase()
  const index = lines.findIndex((line) => line.toLowerCase() === target)

  if (index === -1) return ''

  return lines[index + 1] || ''
}