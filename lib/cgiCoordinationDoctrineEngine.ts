export type CGIBeneficiaryCase = {
  id: string
  beneficiary_name: string
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
}

export type CGIInstitution = {
  id: string
  institution_name: string
  institution_type: string
  region: string | null
  district: string | null
  operating_level: string | null
  coordination_status: string | null
}

export type CGIResponder = {
  id: string
  full_name: string
  operational_status: string
  region: string | null
  trust_score: number | null
}

export type CGIRoutingAction = {
  id: string
  case_id: string
  routing_status: string | null
  routing_priority: string | null
  routing_reason: string | null
  institution_id: string | null
  assigned_responder_id: string | null
}

export type CGICaseIntervention = {
  id: string
  case_id: string
  intervention_type: string | null
}

export type CGICaseOutcome = {
  id: string
  case_id: string
  outcome_status: string | null
}

export type CGICoordinationPatternType =
  | 'ISOLATED_SYNCHRONIZATION'
  | 'REPEATED_COORDINATION_STRAIN'
  | 'SHARED_DEPENDENCY_VISIBLE'
  | 'DISTRIBUTED_PRESSURE'
  | 'ENTERPRISE_PATTERN'

export type CGICoordinationPatternReading = {
  patternType: CGICoordinationPatternType
  patternName: string
  patternMeaning: string
  sharedOwnershipVisible: boolean
  sharedInstitutionVisible: boolean
  sharedResponderVisible: boolean
  sharedRegionVisible: boolean
  crossSiteEscalationRequired: boolean
  enterpriseExposure: string
  executiveMeaning: string
  crossSiteQuestion: string
  requiredSynchronizationEvidence: string
}

export type CGICoordinationReading = {
  status: string
  commandQuestion: string
  executiveQuestion: string
  chainPosition: string
  synchronizationMeaning: string
  nextDestination: string
  handoffReason: string
  coordinationRequired: boolean
  crossSiteRequired: boolean
  executiveReviewRequired: boolean
  auditRequired: boolean
  continuityHistoryRequired: boolean
  evidenceStandard: string
  requiredAction: string
  continuityRisk: string
  boardWarning: string
}

export type CGICoordinationRow = {
  label: string
  value: number
  detail: string
}

export type CGICoordinationDoctrineInput = {
  cases: CGIBeneficiaryCase[]
  institutions: CGIInstitution[]
  responders: CGIResponder[]
  routingActions: CGIRoutingAction[]
  interventions: CGICaseIntervention[]
  outcomes: CGICaseOutcome[]
}

export type CGICoordinationDoctrineReading = {
  activeCases: CGIBeneficiaryCase[]
  coordinationVisibleCases: CGIBeneficiaryCase[]
  stabilizedCases: CGIBeneficiaryCase[]
  escalatedCases: CGIBeneficiaryCase[]
  criticalCases: CGIBeneficiaryCase[]
  safeguardingCases: CGIBeneficiaryCase[]
  stalledCases: CGIBeneficiaryCase[]
  recurrenceCases: CGIBeneficiaryCase[]
  activeResponders: CGIResponder[]
  activeInstitutions: CGIInstitution[]
  interventionCoverage: number
  outcomeCoverage: number
  stabilizationRate: number
  coordinationPressure: number
  pattern: CGICoordinationPatternReading
  reading: CGICoordinationReading
  regionRows: CGICoordinationRow[]
  institutionRows: CGICoordinationRow[]
  responderRows: CGICoordinationRow[]
  lifecycleRows: CGICoordinationRow[]
  copyReadyBrief: string
}

export const CGI_ACTIVE_CASE_STATUSES = [
  'NEED_DETECTED',
  'UNDER_ASSESSMENT',
  'ROUTED',
  'RESPONDER_ASSIGNED',
  'INTERVENTION_ACTIVE',
  'STABILIZING',
  'ACTION_ACTIVE',
  'RECOVERY_MONITORING',
  'FOLLOW_UP_REQUIRED',
  'ROUTING_STALLED',
  'OWNERSHIP_CLARITY_REQUIRED',
]

export const CGI_COORDINATION_VISIBLE_STATUSES = [
  ...CGI_ACTIVE_CASE_STATUSES,
  'ESCALATED',
  'REOPENED',
  'GOVERNANCE_REVIEW_REQUIRED',
  'GOVERNANCE_REVIEW_REQUIRED_RECURRENCE',
  'STABILIZATION_OWNER_ROUTED',
  'STABILIZATION_OWNER_ROUTED_RECURRENCE',
]

export function buildCGICoordinationDoctrine(
  input: CGICoordinationDoctrineInput,
): CGICoordinationDoctrineReading {
  const activeCases = input.cases.filter((item) =>
    CGI_ACTIVE_CASE_STATUSES.includes(item.case_status),
  )

  const coordinationVisibleCases = input.cases.filter((item) =>
    CGI_COORDINATION_VISIBLE_STATUSES.includes(item.case_status),
  )

  const stabilizedCases = input.cases.filter(
    (item) => item.case_status === 'STABILIZED',
  )

  const escalatedCases = input.cases.filter(
    (item) => item.case_status === 'ESCALATED',
  )

  const criticalCases = input.cases.filter(
    (item) => item.severity_level === 'CRITICAL',
  )

  const safeguardingCases = input.cases.filter((item) => item.safeguarding_flag)

  const stalledCases = input.cases.filter((item) =>
    ['ROUTING_STALLED', 'OWNERSHIP_CLARITY_REQUIRED'].includes(
      item.case_status,
    ),
  )

  const recurrenceCases = input.cases.filter(
    (item) =>
      item.case_status.includes('RECURRENCE') ||
      item.case_status === 'REOPENED',
  )

  const activeResponders = input.responders.filter(
    (item) => item.operational_status === 'ACTIVE',
  )

  const activeInstitutions = input.institutions.filter(
    (item) => item.coordination_status === 'ACTIVE',
  )

  const uniqueInterventionCases = new Set(
    input.interventions.map((item) => item.case_id),
  ).size

  const uniqueOutcomeCases = new Set(
    input.outcomes.map((item) => item.case_id),
  ).size

  const interventionCoverage =
    input.cases.length > 0
      ? Math.round((uniqueInterventionCases / input.cases.length) * 100)
      : 0

  const outcomeCoverage =
    input.cases.length > 0
      ? Math.round((uniqueOutcomeCases / input.cases.length) * 100)
      : 0

  const stabilizationRate =
    input.cases.length > 0
      ? Math.round((stabilizedCases.length / input.cases.length) * 100)
      : 0

  const coordinationPressure =
    activeCases.length +
    escalatedCases.length * 2 +
    criticalCases.length * 2 +
    safeguardingCases.length +
    stalledCases.length * 2 +
    recurrenceCases.length * 2

  const pattern = buildCoordinationPatternReading({
    cases: input.cases,
    routingActions: input.routingActions,
    recurrenceCases: recurrenceCases.length,
    stalledCases: stalledCases.length,
    escalatedCases: escalatedCases.length,
    criticalCases: criticalCases.length,
    coordinationVisibleCases: coordinationVisibleCases.length,
    interventionCoverage,
    outcomeCoverage,
  })

  const reading = buildCoordinationReading({
    totalCases: input.cases.length,
    activeCases: activeCases.length,
    coordinationVisibleCases: coordinationVisibleCases.length,
    escalatedCases: escalatedCases.length,
    criticalCases: criticalCases.length,
    safeguardingCases: safeguardingCases.length,
    stalledCases: stalledCases.length,
    recurrenceCases: recurrenceCases.length,
    activeInstitutions: activeInstitutions.length,
    activeResponders: activeResponders.length,
    interventionCoverage,
    outcomeCoverage,
    stabilizationRate,
    coordinationPressure,
    coordinationPattern: pattern,
  })

  const regionRows = groupedRows(
    input.cases.map((item) => item.region || 'Region not recorded'),
  )

  const institutionRows = input.institutions.map((site) => {
    const load = input.routingActions.filter(
      (route) => route.institution_id === site.id,
    ).length

    return {
      label: site.institution_name || 'Unnamed institution',
      value: load,
      detail: `${site.institution_type || 'Type not recorded'} • ${
        site.operating_level || 'Level not recorded'
      }`,
    }
  })

  const responderRows = input.responders.map((responder) => {
    const load = input.routingActions.filter(
      (route) => route.assigned_responder_id === responder.id,
    ).length

    return {
      label: responder.full_name || 'Unnamed responder',
      value: load,
      detail: `${responder.operational_status || 'Status not recorded'} • ${
        responder.region || 'Region not recorded'
      }`,
    }
  })

  const lifecycleRows = groupedRows(
    input.cases.map((item) => item.case_status || 'Status not recorded'),
  )

  const copyReadyBrief = buildCoordinationBrief({
    reading,
    pattern,
    totalCases: input.cases.length,
    activeCases: activeCases.length,
    stabilizedCases: stabilizedCases.length,
    escalatedCases: escalatedCases.length,
    criticalCases: criticalCases.length,
    safeguardingCases: safeguardingCases.length,
    stalledCases: stalledCases.length,
    recurrenceCases: recurrenceCases.length,
    institutions: input.institutions.length,
    activeInstitutions: activeInstitutions.length,
    activeResponders: activeResponders.length,
    routingActions: input.routingActions.length,
    interventions: input.interventions.length,
    outcomes: input.outcomes.length,
    interventionCoverage,
    outcomeCoverage,
    stabilizationRate,
  })

  return {
    activeCases,
    coordinationVisibleCases,
    stabilizedCases,
    escalatedCases,
    criticalCases,
    safeguardingCases,
    stalledCases,
    recurrenceCases,
    activeResponders,
    activeInstitutions,
    interventionCoverage,
    outcomeCoverage,
    stabilizationRate,
    coordinationPressure,
    pattern,
    reading,
    regionRows,
    institutionRows,
    responderRows,
    lifecycleRows,
    copyReadyBrief,
  }
}

export function buildCoordinationPatternReading(input: {
  cases: CGIBeneficiaryCase[]
  routingActions: CGIRoutingAction[]
  recurrenceCases: number
  stalledCases: number
  escalatedCases: number
  criticalCases: number
  coordinationVisibleCases: number
  interventionCoverage: number
  outcomeCoverage: number
}): CGICoordinationPatternReading {
  const sharedRegionVisible = hasRepeatedValue(
    input.cases.map((item) => item.region || 'Region not recorded'),
  )

  const sharedInstitutionVisible = hasRepeatedValue(
    input.cases.map(
      (item) => item.institution_name || 'Institution not recorded',
    ),
  )

  const sharedResponderVisible = hasRepeatedValue(
    input.routingActions.map(
      (item) => item.assigned_responder_id || 'Responder not recorded',
    ),
  )

  const sharedOwnershipVisible = hasRepeatedValue(
    input.routingActions.map(
      (item) => item.institution_id || 'Institution not recorded',
    ),
  )

  const evidenceWeak =
    input.interventionCoverage < 50 || input.outcomeCoverage < 40

  const enterpriseSignal =
    input.criticalCases > 0 ||
    input.escalatedCases > 0 ||
    input.recurrenceCases > 0 ||
    input.coordinationVisibleCases > 2

  let patternType: CGICoordinationPatternType = 'ISOLATED_SYNCHRONIZATION'

  if (enterpriseSignal && (sharedInstitutionVisible || sharedResponderVisible)) {
    patternType = 'ENTERPRISE_PATTERN'
  } else if (sharedOwnershipVisible || sharedInstitutionVisible) {
    patternType = 'SHARED_DEPENDENCY_VISIBLE'
  } else if (input.recurrenceCases > 0 || input.stalledCases > 1) {
    patternType = 'REPEATED_COORDINATION_STRAIN'
  } else if (input.coordinationVisibleCases > 2 || sharedRegionVisible) {
    patternType = 'DISTRIBUTED_PRESSURE'
  }

  const crossSiteEscalationRequired =
    patternType === 'ENTERPRISE_PATTERN' ||
    patternType === 'SHARED_DEPENDENCY_VISIBLE' ||
    patternType === 'DISTRIBUTED_PRESSURE'

  return {
    patternType,
    patternName: buildPatternName(patternType),
    patternMeaning: buildPatternMeaning(patternType, evidenceWeak),
    sharedOwnershipVisible,
    sharedInstitutionVisible,
    sharedResponderVisible,
    sharedRegionVisible,
    crossSiteEscalationRequired,
    enterpriseExposure: buildEnterpriseExposure(patternType),
    executiveMeaning: buildPatternExecutiveMeaning(patternType),
    crossSiteQuestion: buildCrossSiteQuestion(patternType),
    requiredSynchronizationEvidence:
      buildRequiredSynchronizationEvidence(patternType),
  }
}

export function buildCoordinationReading(input: {
  totalCases: number
  activeCases: number
  coordinationVisibleCases: number
  escalatedCases: number
  criticalCases: number
  safeguardingCases: number
  stalledCases: number
  recurrenceCases: number
  activeInstitutions: number
  activeResponders: number
  interventionCoverage: number
  outcomeCoverage: number
  stabilizationRate: number
  coordinationPressure: number
  coordinationPattern: CGICoordinationPatternReading
}): CGICoordinationReading {
  if (input.totalCases === 0) {
    return {
      status: 'COORDINATION CLEAR',
      commandQuestion: 'Does continuity require synchronization?',
      executiveQuestion:
        'Can continuity remain clear without unnecessary synchronization?',
      chainPosition:
        'Coordination is clear. No synchronization handoff is required.',
      synchronizationMeaning:
        'No active coordination-visible records exist. The system should preserve readiness without creating artificial escalation.',
      nextDestination: 'Monitoring',
      handoffReason:
        'There is no current ownership, routing, responder, institutional, or evidence pressure requiring coordination movement.',
      coordinationRequired: false,
      crossSiteRequired: false,
      executiveReviewRequired: false,
      auditRequired: false,
      continuityHistoryRequired: false,
      evidenceStandard: 'Routine monitoring evidence only.',
      requiredAction: 'Maintain coordination readiness.',
      continuityRisk: 'No active coordination risk is visible.',
      boardWarning:
        'Do not manufacture coordination pressure when no synchronization signal exists.',
    }
  }

  if (input.coordinationPattern.crossSiteEscalationRequired) {
    return {
      status: 'CROSS-SITE COORDINATION REQUIRED',
      commandQuestion:
        'Has coordination revealed a pattern larger than one site or operational lane?',
      executiveQuestion:
        'What dependency pattern must move to Cross-Site before continuity can be trusted?',
      chainPosition:
        'Coordination is preparing continuity for Cross-Site Review.',
      synchronizationMeaning: input.coordinationPattern.patternMeaning,
      nextDestination: 'Cross-Site Review',
      handoffReason:
        'Cross-site review must determine whether instability is isolated, repeated, distributed, or structurally shared across operational environments.',
      coordinationRequired: true,
      crossSiteRequired: true,
      executiveReviewRequired: true,
      auditRequired: true,
      continuityHistoryRequired: true,
      evidenceStandard:
        input.coordinationPattern.requiredSynchronizationEvidence,
      requiredAction: 'Move synchronized pattern evidence to Cross-Site Review.',
      continuityRisk:
        'Failure to review across sites may allow a distributed continuity pattern to look like isolated cases.',
      boardWarning:
        'Do not allow a shared dependency pattern to remain buried inside local coordination workload.',
    }
  }

  if (
    input.escalatedCases > 0 ||
    input.criticalCases > 0 ||
    input.safeguardingCases > 0
  ) {
    return {
      status: 'EXECUTIVE COORDINATION PRESSURE',
      commandQuestion:
        'Must coordination escalate to executive synthesis before continuity can be trusted?',
      executiveQuestion:
        'Can continuity authority move safely while coordination carries executive pressure?',
      chainPosition:
        'Coordination is holding executive-relevant continuity pressure.',
      synchronizationMeaning:
        'Escalation, critical severity, or safeguarding visibility means coordination cannot remain only operational.',
      nextDestination: 'Executive Center',
      handoffReason:
        'Leadership synthesis is required because the coordination signal carries executive continuity meaning.',
      coordinationRequired: true,
      crossSiteRequired:
        input.recurrenceCases > 0 || input.coordinationVisibleCases > 2,
      executiveReviewRequired: true,
      auditRequired: true,
      continuityHistoryRequired: input.recurrenceCases > 0,
      evidenceStandard:
        'Preserve routing ownership, site involvement, responder capacity, escalation reason, safeguarding visibility, and executive rationale.',
      requiredAction: 'Move coordinated pressure to Executive Center.',
      continuityRisk:
        'Failure to escalate may allow executive-relevant instability to remain operationally buried.',
      boardWarning:
        'Do not treat executive-relevant coordination pressure as ordinary routing work.',
    }
  }

  if (
    input.stalledCases > 0 ||
    input.activeResponders === 0 ||
    input.activeInstitutions === 0 ||
    input.interventionCoverage < 50 ||
    input.outcomeCoverage < 40
  ) {
    return {
      status: 'SYNCHRONIZATION REQUIRED',
      commandQuestion:
        'Can continuity move forward before ownership and evidence are synchronized?',
      executiveQuestion:
        'What dependency must synchronize before continuity movement can be trusted?',
      chainPosition:
        'Coordination is still synchronizing ownership, routing, capacity, and evidence.',
      synchronizationMeaning:
        'Routing, responder capacity, institutional activity, intervention evidence, or outcome evidence is not mature enough yet.',
      nextDestination: 'Coordination Center',
      handoffReason:
        'Continuity should remain in coordination until ownership, evidence, and response capacity become sufficiently clear.',
      coordinationRequired: true,
      crossSiteRequired: false,
      executiveReviewRequired: false,
      auditRequired: true,
      continuityHistoryRequired: false,
      evidenceStandard:
        'Preserve routing status, owner assignment, institutional activity, responder availability, intervention record, and outcome record.',
      requiredAction: 'Strengthen coordination before lifecycle movement.',
      continuityRisk:
        'Weak synchronization may create false recovery confidence or premature escalation.',
      boardWarning:
        'Do not move continuity forward while ownership, evidence, capacity, or routing remain unsynchronized.',
    }
  }

  if (input.stabilizationRate >= 60 && input.outcomeCoverage >= 60) {
    return {
      status: 'RECOVERY HANDOFF AVAILABLE',
      commandQuestion:
        'Can coordination release continuity toward recovery verification?',
      executiveQuestion:
        'Can synchronized continuity now move toward recovery verification?',
      chainPosition:
        'Coordination can release continuity toward recovery verification.',
      synchronizationMeaning:
        'Ownership and outcome visibility are strong enough for recovery credibility review.',
      nextDestination: 'Recovery Verification',
      handoffReason:
        'Coordination has enough evidence to allow recovery verification without hiding ownership or response gaps.',
      coordinationRequired: false,
      crossSiteRequired: false,
      executiveReviewRequired: false,
      auditRequired: true,
      continuityHistoryRequired: false,
      evidenceStandard:
        'Preserve intervention evidence, outcome evidence, ownership trail, and recovery readiness rationale.',
      requiredAction: 'Move stabilized records to Recovery Verification.',
      continuityRisk:
        'Main risk is premature closure if recovery durability is not verified.',
      boardWarning:
        'Do not confuse synchronized handoff with durable recovery. Recovery must still be verified.',
    }
  }

  return {
    status: 'COORDINATION WATCH',
    commandQuestion:
      'Can continuity remain under coordination watch without escalation?',
    executiveQuestion:
      'Can coordination remain under watch while synchronization evidence matures?',
    chainPosition:
      'Coordination remains active under proportional synchronization watch.',
    synchronizationMeaning:
      'Coordination pressure is visible but not yet executive, cross-site, or recovery-ready.',
    nextDestination: 'Coordination Watch',
    handoffReason:
      'Continue synchronized monitoring until evidence, ownership, recovery readiness, or escalation pressure changes.',
    coordinationRequired: true,
    crossSiteRequired: false,
    executiveReviewRequired: false,
    auditRequired: false,
    continuityHistoryRequired: false,
    evidenceStandard:
      'Maintain routine coordination evidence, routing visibility, and ownership clarity.',
    requiredAction: 'Continue coordination watch.',
    continuityRisk:
      'Risk remains monitored while synchronization evidence continues to mature.',
    boardWarning:
      'Do not let visible coordination pressure disappear before synchronization evidence matures.',
  }
}

export function buildCoordinationBrief(input: {
  reading: CGICoordinationReading
  pattern: CGICoordinationPatternReading
  totalCases: number
  activeCases: number
  stabilizedCases: number
  escalatedCases: number
  criticalCases: number
  safeguardingCases: number
  stalledCases: number
  recurrenceCases: number
  institutions: number
  activeInstitutions: number
  activeResponders: number
  routingActions: number
  interventions: number
  outcomes: number
  interventionCoverage: number
  outcomeCoverage: number
  stabilizationRate: number
}) {
  return `
TSINAXA CGI ENTERPRISE COORDINATION INTELLIGENCE BRIEF

Executive Coordination Question:
${input.reading.executiveQuestion}

Command Question:
${input.reading.commandQuestion}

Coordination Posture:
${input.reading.status}

Enterprise Synchronization Pattern:
${input.pattern.patternName}

Pattern Type:
${input.pattern.patternType}

Pattern Meaning:
${input.pattern.patternMeaning}

Lifecycle Position:
${input.reading.chainPosition}

Next Governed Destination:
${input.reading.nextDestination}

Cross-Site Question:
${input.pattern.crossSiteQuestion}

Handoff Reason:
${input.reading.handoffReason}

Core Coordination Metrics:
Total Cases: ${input.totalCases}
Active Cases: ${input.activeCases}
Stabilized Cases: ${input.stabilizedCases}
Escalated Cases: ${input.escalatedCases}
Critical Cases: ${input.criticalCases}
Safeguarding Flags: ${input.safeguardingCases}
Stalled / Ownership-Clarity Cases: ${input.stalledCases}
Recurrence Cases: ${input.recurrenceCases}
Coordination Sites: ${input.institutions}
Active Coordination Sites: ${input.activeInstitutions}
Active Responders: ${input.activeResponders}
Routing Actions: ${input.routingActions}
Intervention Evidence Records: ${input.interventions}
Outcome Records: ${input.outcomes}
Intervention Coverage: ${input.interventionCoverage}%
Outcome Coverage: ${input.outcomeCoverage}%
Stabilization Rate: ${input.stabilizationRate}%

Required Action:
${input.reading.requiredAction}

Evidence Standard:
${input.reading.evidenceStandard}

Required Synchronization Evidence:
${input.pattern.requiredSynchronizationEvidence}

Continuity Risk:
${input.reading.continuityRisk}

Executive Meaning:
${input.pattern.executiveMeaning}

Board Warning:
${input.reading.boardWarning}

Governance-Safe Meaning:
Coordination does not assign blame. It synchronizes ownership, routing, responder capacity, institutional load, evidence maturity, recovery readiness, and shared dependency so continuity does not move forward on weak or invisible foundations.
  `.trim()
}

export function groupedRows(items: string[]): CGICoordinationRow[] {
  const counts: Record<string, number> = {}

  items.forEach((item) => {
    counts[item] = (counts[item] || 0) + 1
  })

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value, detail: 'record(s)' }))
}

function hasRepeatedValue(items: string[]) {
  const normalized = items.filter(
    (item) =>
      item &&
      !item.toLowerCase().includes('not recorded') &&
      item.trim().length > 0,
  )

  return new Set(normalized).size < normalized.length && normalized.length > 1
}

function buildPatternName(patternType: CGICoordinationPatternType) {
  if (patternType === 'ENTERPRISE_PATTERN') {
    return 'Enterprise Synchronization Pattern'
  }

  if (patternType === 'SHARED_DEPENDENCY_VISIBLE') {
    return 'Shared Dependency Coordination Pattern'
  }

  if (patternType === 'DISTRIBUTED_PRESSURE') {
    return 'Distributed Coordination Pressure'
  }

  if (patternType === 'REPEATED_COORDINATION_STRAIN') {
    return 'Repeated Coordination Strain'
  }

  return 'Isolated Coordination Synchronization'
}

function buildPatternMeaning(
  patternType: CGICoordinationPatternType,
  evidenceWeak: boolean,
) {
  if (patternType === 'ENTERPRISE_PATTERN') {
    return 'Coordination is revealing a pattern that may be larger than one site, owner, routing lane, or operational unit.'
  }

  if (patternType === 'SHARED_DEPENDENCY_VISIBLE') {
    return 'Multiple records appear to share institution, responder, ownership, or routing dependency. Cross-Site should determine whether this is structural exposure.'
  }

  if (patternType === 'DISTRIBUTED_PRESSURE') {
    return 'Coordination pressure appears across multiple records or regions and should not be treated as an isolated operational queue.'
  }

  if (patternType === 'REPEATED_COORDINATION_STRAIN') {
    return 'Repeated or stalled coordination signals indicate that routing or ownership may be weakening continuity confidence.'
  }

  return evidenceWeak
    ? 'The signal appears isolated, but evidence remains weak and should mature before continuity trust is restored.'
    : 'Coordination appears isolated and can remain under proportional synchronization watch.'
}

function buildEnterpriseExposure(patternType: CGICoordinationPatternType) {
  if (patternType === 'ENTERPRISE_PATTERN') {
    return 'A coordination pattern may be moving from operational synchronization into enterprise continuity exposure.'
  }

  if (patternType === 'SHARED_DEPENDENCY_VISIBLE') {
    return 'A shared dependency may be causing multiple records to inherit the same continuity weakness.'
  }

  if (patternType === 'DISTRIBUTED_PRESSURE') {
    return 'Pressure is distributed enough that Cross-Site may need to confirm whether the signal is structural.'
  }

  if (patternType === 'REPEATED_COORDINATION_STRAIN') {
    return 'Repeated coordination strain may become structural if ownership, routing, and evidence remain unresolved.'
  }

  return 'No enterprise exposure is currently dominant.'
}

function buildPatternExecutiveMeaning(patternType: CGICoordinationPatternType) {
  if (patternType === 'ENTERPRISE_PATTERN') {
    return 'Leadership should not treat the signal as an isolated coordination workload. It may represent enterprise continuity exposure.'
  }

  if (patternType === 'SHARED_DEPENDENCY_VISIBLE') {
    return 'Leadership should know whether the same dependency is creating repeated continuity weakness across different records or sites.'
  }

  if (patternType === 'DISTRIBUTED_PRESSURE') {
    return 'Leadership may need visibility if distributed pressure begins weakening recovery credibility.'
  }

  if (patternType === 'REPEATED_COORDINATION_STRAIN') {
    return 'Repeated coordination strain should remain visible because unresolved ownership can create false recovery confidence.'
  }

  return 'Leadership does not need escalation unless the isolated signal begins repeating, spreading, or weakening evidence maturity.'
}

function buildCrossSiteQuestion(patternType: CGICoordinationPatternType) {
  if (patternType === 'ENTERPRISE_PATTERN') {
    return 'Is this coordination pressure becoming a cross-site enterprise continuity pattern?'
  }

  if (patternType === 'SHARED_DEPENDENCY_VISIBLE') {
    return 'Are multiple sites or records inheriting the same dependency weakness?'
  }

  if (patternType === 'DISTRIBUTED_PRESSURE') {
    return 'Is pressure distributed across operational environments or still isolated?'
  }

  if (patternType === 'REPEATED_COORDINATION_STRAIN') {
    return 'Is repeated coordination strain evidence of structural ownership weakness?'
  }

  return 'Can coordination remain local without cross-site review?'
}

function buildRequiredSynchronizationEvidence(
  patternType: CGICoordinationPatternType,
) {
  if (patternType === 'ENTERPRISE_PATTERN') {
    return 'Preserve affected records, shared owner, shared institution, shared responder, routing lane, region, recurrence evidence, intervention coverage, outcome coverage, and cross-site handoff rationale.'
  }

  if (patternType === 'SHARED_DEPENDENCY_VISIBLE') {
    return 'Preserve shared dependency, institution load, responder concentration, routing owner, evidence maturity, and reason for cross-site review.'
  }

  if (patternType === 'DISTRIBUTED_PRESSURE') {
    return 'Preserve affected regions, case statuses, routing load, intervention evidence, outcome evidence, and distribution pattern.'
  }

  if (patternType === 'REPEATED_COORDINATION_STRAIN') {
    return 'Preserve stalled routing, ownership clarity gaps, recurrence indicators, responder capacity, and outcome evidence.'
  }

  return 'Preserve routing ownership, evidence maturity, intervention record, outcome record, and reason for continued coordination watch.'
}