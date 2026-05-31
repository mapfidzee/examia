'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type CommandCase = {
  id: string
  beneficiary_name: string
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  beneficiary_level: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  intervention_summary: string | null
  outcome_summary: string | null
  created_at?: string | null
  updated_at?: string | null
}

type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
  created_at?: string | null
}

type CommandCaseRecord = {
  caseItem: CommandCase
  latestRecoveryReview?: OutcomeRecord
  recoveryDisposition: string
  recommendedMovement: string
  movementReason: string
  durabilityResult: string
  commandPosture: string
  recoveryConfidence: string
  memoryImpact: string
  reburnVisible: boolean
}

type CommandReading = {
  statusShort: string
  statusMeaning: string
  activeCaseCount: string
  evidenceShort: string
  survivabilityShort: string
  pressureShort: string
  trajectoryShort: string
  recoveryShort: string
  reliabilityShort: string
  attributionTitle: string
  attributionMeaning: string
  commandVisibility: string
  commandAction: string
  commandDecision: string
  commandQuestion: string
  nextGovernedMovement: string
  movementReason: string
  evidenceGap: string
  recoveryCredibility: string
  memory: string
  persistence: string
  risk: string

  lifecyclePosition: string
  nextDestination: string
  handoffReason: string
  coordinationRequired: boolean
  crossSiteRequired: boolean
  executiveReviewRequired: boolean
  auditRequired: boolean
  continuityHistoryRequired: boolean

  destinationExecutiveCenter: number
  destinationRecovery: number
  destinationCoordination: number
  destinationCrossSite: number
  destinationAudit: number
  destinationStabilityBoard: number

  hasActiveCommandEvidence: boolean
  executiveBrief: {
    cases: string
    evidence: string
    action: string
  }
  continuityMemory: {
    continuityMemory: string
    lastCommandActivity: string
    lastEscalation: string
    lastRecoveryVerification: string
    lastExecutiveReview: string
  }
}

const COMMAND_VISIBLE_STATUSES = [
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

const PRESSURE_TYPES = [
  'FLOW',
  'COVERAGE',
  'COORDINATION',
  'OWNERSHIP',
  'EVIDENCE',
  'RECOVERY',
  'RELIABILITY',
]

export default function CommandPage() {
  const [cases, setCases] = useState<CommandCase[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCommandCases()
  }, [])

  async function loadCommandCases() {
    setLoading(true)

    const [casesResult, outcomesResult] = await Promise.all([
      supabase
        .from('beneficiary_cases')
        .select('*')
        .in('support_domain', PRESSURE_TYPES)
        .in('case_status', COMMAND_VISIBLE_STATUSES)
        .order('created_at', { ascending: false }),
      supabase
        .from('case_outcomes')
        .select('*')
        .order('created_at', { ascending: false }),
    ])

    setCases(casesResult.error ? [] : casesResult.data || [])
    setOutcomes(outcomesResult.error ? [] : outcomesResult.data || [])

    if (casesResult.error) console.error(casesResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)

    setLoading(false)
  }

  const commandRecords = useMemo(
    () => buildCommandCaseRecords(cases, outcomes),
    [cases, outcomes],
  )

  const command = useMemo(
    () => buildCommandReading(commandRecords),
    [commandRecords],
  )

  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <main style={styles.page}>
          <div style={styles.container}>
            <section style={styles.header}>
              <p style={styles.kicker}>TSINAXA CGI • COMMAND</p>
              <h1 style={styles.title}>Command</h1>
              <p style={styles.subtitle}>
                Executive decision gate for active lifecycle pressure, recovery
                fragility, coordination need, cross-site exposure, executive
                review, audit reconstruction, and next governed movement.
              </p>
            </section>

            <section style={styles.commandQuestionPanel}>
              <div>
                <p style={styles.sectionKicker}>Command Question</p>
                <h2 style={styles.questionTitle}>{command.commandQuestion}</h2>
              </div>

              <div style={styles.commandAuthorityBox}>
                <p style={styles.metricLabel}>Command Authority</p>
                <p style={styles.bodyText}>
                  Command determines where continuity must move next: recovery
                  verification, coordination, cross-site review, executive
                  synthesis, audit reconstruction, or monitored stability.
                </p>
              </div>
            </section>

            <section style={styles.commandStatus}>
              <div>
                <p style={styles.sectionKicker}>Command Status</p>
                <h2 style={styles.commandStatusTitle}>{command.statusShort}</h2>
                <p style={styles.bodyText}>{command.statusMeaning}</p>
              </div>

              <div style={styles.commandStatusGrid}>
                <BriefLine label="Cases" value={command.executiveBrief.cases} />
                <BriefLine label="Evidence" value={command.executiveBrief.evidence} />
                <BriefLine label="Action" value={command.executiveBrief.action} />
              </div>
            </section>

            <section style={styles.decisionPanel}>
              <div style={styles.decisionPrimary}>
                <p style={styles.sectionKicker}>Command Decision</p>
                <h2 style={styles.decisionTitle}>{command.commandDecision}</h2>
                <p style={styles.bodyText}>{command.movementReason}</p>
              </div>

              <div style={styles.decisionSecondary}>
                <p style={styles.sectionKicker}>Next Governed Movement</p>
                <h2 style={styles.movementTitle}>{command.nextGovernedMovement}</h2>
                <p style={styles.bodyText}>
                  Command does not close instability. Command determines where
                  continuity must move next.
                </p>
              </div>
            </section>

            <section style={styles.handoffPanel}>
              <div>
                <p style={styles.sectionKicker}>Continuity Handoff Chain</p>
                <h2 style={styles.compactTitle}>{command.lifecyclePosition}</h2>
                <p style={styles.bodyText}>{command.handoffReason}</p>
              </div>

              <div style={styles.handoffGrid}>
                <HandoffStep label="Recovery" value="Verifies durability" />
                <HandoffStep label="Command" value="Decides movement" />
                <HandoffStep
                  label="Next"
                  value={command.nextDestination}
                  active
                />
                <HandoffStep
                  label="Executive"
                  value={
                    command.executiveReviewRequired
                      ? 'Required'
                      : 'Conditional'
                  }
                />
                <HandoffStep
                  label="Audit"
                  value={command.auditRequired ? 'Required' : 'Preserve if needed'}
                />
              </div>
            </section>

            <section style={styles.requirementGrid}>
              <RequirementCard
                label="Coordination"
                active={command.coordinationRequired}
                body={
                  command.coordinationRequired
                    ? 'Coordination must synchronize ownership before continuity advances.'
                    : 'No concentrated coordination handoff is required.'
                }
              />

              <RequirementCard
                label="Cross-Site"
                active={command.crossSiteRequired}
                body={
                  command.crossSiteRequired
                    ? 'Cross-site review is required because the signal may no longer be isolated.'
                    : 'No cross-site review is required by current command posture.'
                }
              />

              <RequirementCard
                label="Executive"
                active={command.executiveReviewRequired}
                body={
                  command.executiveReviewRequired
                    ? 'Leadership synthesis is required before continuity confidence can be restored.'
                    : 'Executive review remains conditional.'
                }
              />

              <RequirementCard
                label="Audit"
                active={command.auditRequired}
                body={
                  command.auditRequired
                    ? 'Evidence must remain reconstructable across the governed chain.'
                    : 'No audit escalation is required beyond routine preservation.'
                }
              />
            </section>

            <section style={styles.destinationPanel}>
              <div>
                <p style={styles.sectionKicker}>Lifecycle Destinations</p>
                <h2 style={styles.compactTitle}>Where Command can move continuity</h2>
                <p style={styles.bodyText}>
                  These destinations now reflect the governed continuity chain:
                  Recovery, Coordination, Cross-Site, Executive Center, Audit,
                  and Stability Board.
                </p>
              </div>

              <div style={styles.destinationGrid}>
                <Destination label="Executive Center" value={command.destinationExecutiveCenter} />
                <Destination label="Recovery" value={command.destinationRecovery} />
                <Destination label="Coordination" value={command.destinationCoordination} />
                <Destination label="Cross-Site" value={command.destinationCrossSite} />
                <Destination label="Audit" value={command.destinationAudit} />
                <Destination label="Stability Board" value={command.destinationStabilityBoard} />
              </div>
            </section>

            <section style={styles.signalGrid}>
              <Signal label="Pressure" value={command.pressureShort} />
              <Signal label="Trajectory" value={command.trajectoryShort} />
              <Signal label="Recovery" value={command.recoveryShort} />
              <Signal label="Reliability" value={command.reliabilityShort} />
              <Signal label="Survivability" value={command.survivabilityShort} />
            </section>

            <section style={styles.commandGrid}>
              <section style={styles.compactCard}>
                <p style={styles.sectionKicker}>Attribution</p>
                <h2 style={styles.compactTitle}>{command.attributionTitle}</h2>
                <p style={styles.bodyText}>{command.attributionMeaning}</p>

                {!loading && commandRecords.length > 0 && (
                  <div style={styles.caseList}>
                    {commandRecords.map((record) => (
                      <article key={record.caseItem.id} style={styles.caseCard}>
                        <p style={styles.caseIdentity}>
                          {record.caseItem.beneficiary_name}
                        </p>

                        <div style={styles.caseMetaGrid}>
                          <SmallMetric label="Pressure" value={record.caseItem.support_domain} />
                          <SmallMetric label="Status" value={record.caseItem.case_status} />
                          <SmallMetric label="Severity" value={record.caseItem.severity_level} />
                          <SmallMetric label="Area" value={record.caseItem.region || 'Not recorded'} />
                        </div>

                        {record.latestRecoveryReview && (
                          <div style={styles.recoveryMiniPanel}>
                            <SmallMetric label="Recovery Disposition" value={record.recoveryDisposition} />
                            <SmallMetric label="Command Posture" value={record.commandPosture} />
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section style={styles.compactCard}>
                <p style={styles.sectionKicker}>Command Visibility</p>
                <h2 style={styles.compactTitle}>{command.commandVisibility}</h2>
                <p style={styles.bodyText}>{command.commandAction}</p>

                <p style={styles.inlineRisk}>
                  Memory: {command.memory} • Persistence: {command.persistence} • Risk:{' '}
                  {command.risk}
                </p>
              </section>
            </section>

            {command.hasActiveCommandEvidence && (
              <section style={styles.twoColumnGrid}>
                <ExecutivePanel title="Evidence" body={command.evidenceGap} />
                <ExecutivePanel title="Recovery" body={command.recoveryCredibility} />
              </section>
            )}

            <section style={styles.memoryBoard}>
              <p style={styles.sectionKicker}>Continuity Memory</p>

              <div style={styles.memoryBoardGrid}>
                <MemoryLine label="Memory" value={command.continuityMemory.continuityMemory} />
                <MemoryLine label="Last Activity" value={command.continuityMemory.lastCommandActivity} />
                <MemoryLine label="Escalation" value={command.continuityMemory.lastEscalation} />
                <MemoryLine label="Recovery Review" value={command.continuityMemory.lastRecoveryVerification} />
                <MemoryLine label="Executive Review" value={command.continuityMemory.lastExecutiveReview} />
              </div>
            </section>

            <section style={styles.doctrineCard}>
              <strong>COMMAND DECISION GATE</strong>
              <span>
                Recovery verifies. Command decides. Coordination synchronizes.
                Cross-Site reveals enterprise pattern. Executive Center
                synthesizes when required. Audit preserves reconstructability.
              </span>
            </section>
          </div>
        </main>
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function buildCommandCaseRecords(
  cases: CommandCase[],
  outcomes: OutcomeRecord[],
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
      latestRecoveryReview,
      recoveryDisposition,
      recommendedMovement:
        extractField(summary, 'RECOMMENDED NEXT MOVEMENT') ||
        deriveRecommendedMovement(recoveryDisposition, caseItem),
      movementReason:
        extractField(summary, 'MOVEMENT REASON') ||
        deriveMovementReason(recoveryDisposition, caseItem),
      durabilityResult,
      commandPosture:
        extractField(summary, 'COMMAND POSTURE') ||
        deriveCommandPostureFromCase(caseItem),
      recoveryConfidence:
        extractField(summary, 'RECOVERY CONFIDENCE') ||
        'RECOVERY_CONFIDENCE_UNRECORDED',
      memoryImpact:
        extractField(summary, 'MEMORY IMPACT') ||
        deriveMemoryImpactFromCase(caseItem),
      reburnVisible:
        durabilityResult.includes('REBURN') ||
        reburnSignal.includes('REBURN') ||
        summary.includes('REBURN') ||
        caseItem.outcome_summary?.includes('REBURN') ||
        false,
    }
  })
}

function buildCommandReading(records: CommandCaseRecord[]): CommandReading {
  const total = records.length

  const commandEscalations = records.filter(
    (record) =>
      record.caseItem.case_status === 'TRIAGE_COMMAND_ESCALATION' ||
      record.caseItem.case_status.includes('ESCALATED') ||
      record.caseItem.safeguarding_flag ||
      record.recoveryDisposition === 'MOVE_TO_COMMAND_ESCALATION',
  ).length

  const commandWatch = records.filter(
    (record) => record.recoveryDisposition === 'MOVE_TO_COMMAND_WATCH',
  ).length

  const evidenceReturn = records.filter(
    (record) =>
      record.recoveryDisposition === 'RETURN_TO_OUTCOMES_REVIEW' ||
      record.recoveryDisposition === 'RETURN_TO_INTERVENTION_REVIEW' ||
      record.caseItem.case_status === 'EVIDENCE_REQUIRED_BEFORE_ROUTING' ||
      record.caseItem.case_status === 'OWNERSHIP_CLARITY_REQUIRED',
  ).length

  const stabilityReady = records.filter(
    (record) => record.recoveryDisposition === 'MOVE_TO_STABILITY_BOARD',
  ).length

  const recoveryDestination = records.filter(
    (record) =>
      record.recoveryDisposition === 'CONTINUE_RECOVERY_MONITORING' ||
      record.caseItem.case_status === 'RECOVERY_MONITORING',
  ).length

  const highSeverity = records.filter(
    (record) =>
      record.caseItem.severity_level === 'HIGH' ||
      record.caseItem.severity_level === 'CRITICAL',
  ).length

  const recurrenceVisible = records.filter(
    (record) =>
      record.caseItem.case_status.includes('RECURRENCE') ||
      record.caseItem.case_status === 'REOPENED' ||
      record.caseItem.beneficiary_name.includes('ISSUE_REPEATED') ||
      record.caseItem.outcome_summary?.includes('RECURRENCE') ||
      record.caseItem.intervention_summary?.includes('RECURRENCE') ||
      record.reburnVisible,
  ).length

  const recoveryMonitoring = records.filter(
    (record) =>
      record.caseItem.case_status === 'RECOVERY_MONITORING' ||
      record.recoveryDisposition === 'CONTINUE_RECOVERY_MONITORING',
  ).length

  const coordinationPressure = records.filter(
    (record) =>
      record.caseItem.support_domain === 'COORDINATION' ||
      record.caseItem.case_status === 'ROUTING_STALLED' ||
      record.caseItem.case_status === 'OWNERSHIP_CLARITY_REQUIRED',
  ).length

  const crossSitePressure = records.filter(
    (record) =>
      record.caseItem.region ||
      record.caseItem.institution_name ||
      record.memoryImpact === 'CONTINUITY_MEMORY_VISIBLE' ||
      record.reburnVisible,
  ).length

  const auditPressure = records.filter(
    (record) =>
      record.caseItem.safeguarding_flag ||
      record.caseItem.case_status.includes('ESCALATED') ||
      record.caseItem.case_status.includes('RECURRENCE') ||
      record.reburnVisible,
  ).length

  const latestCase = records[0]?.caseItem

  if (total === 0) {
    return {
      statusShort: 'CLEAR',
      statusMeaning: 'No active command-visible instability exists.',
      activeCaseCount: '0',
      evidenceShort: 'NONE',
      survivabilityShort: 'CLEAR',
      pressureShort: 'CLEAR',
      trajectoryShort: 'STABLE',
      recoveryShort: 'NONE',
      reliabilityShort: 'STABLE',
      attributionTitle: 'None active',
      attributionMeaning: 'No active lifecycle records are attributed to Command.',
      commandVisibility: 'Clear',
      commandAction:
        'No executive intervention is required. Command remains available if instability, recurrence, recovery fragility, or evidence gaps reappear.',
      commandDecision: 'Maintain Clear Command',
      commandQuestion: 'Where should continuity move next?',
      nextGovernedMovement: 'No Movement Required',
      movementReason:
        'No active command-attributed lifecycle records exist. Do not create artificial pressure.',
      evidenceGap: 'No active evidence gap.',
      recoveryCredibility: 'No active recovery concern.',
      memory: 'PRESERVED',
      persistence: 'NONE ACTIVE',
      risk: 'CLEAR',
      lifecyclePosition: 'Command is clear. No lifecycle handoff is required.',
      nextDestination: 'Monitoring',
      handoffReason:
        'No active command-attributed instability exists. CGI should preserve readiness without manufacturing escalation.',
      coordinationRequired: false,
      crossSiteRequired: false,
      executiveReviewRequired: false,
      auditRequired: false,
      continuityHistoryRequired: false,
      destinationExecutiveCenter: 0,
      destinationRecovery: 0,
      destinationCoordination: 0,
      destinationCrossSite: 0,
      destinationAudit: 0,
      destinationStabilityBoard: 0,
      hasActiveCommandEvidence: false,
      executiveBrief: {
        cases: '0 active command-attributed cases',
        evidence: 'None required',
        action: 'No executive intervention',
      },
      continuityMemory: {
        continuityMemory: 'PRESERVED',
        lastCommandActivity: 'NONE ACTIVE',
        lastEscalation: 'NONE ACTIVE',
        lastRecoveryVerification: 'NONE ACTIVE',
        lastExecutiveReview: 'NONE REQUIRED',
      },
    }
  }

  const destinations = {
    executiveCenter: commandEscalations,
    recovery: recoveryDestination,
    coordination: coordinationPressure,
    crossSite: crossSitePressure,
    audit: auditPressure,
    stabilityBoard: stabilityReady,
  }

  if (commandEscalations > 0) {
    return elevatedReading({
      total,
      highSeverity,
      recurrenceVisible,
      recoveryMonitoring,
      latestCase,
      destinations,
    })
  }

  if (coordinationPressure > 0) {
    return coordinationReading({
      total,
      highSeverity,
      recurrenceVisible,
      recoveryMonitoring,
      latestCase,
      destinations,
    })
  }

  if (crossSitePressure > 1) {
    return crossSiteReading({
      total,
      highSeverity,
      recurrenceVisible,
      recoveryMonitoring,
      latestCase,
      destinations,
    })
  }

  if (evidenceReturn > 0) {
    return evidenceReturnReading({
      total,
      recoveryMonitoring,
      latestCase,
      destinations,
    })
  }

  if (commandWatch > 0 || recurrenceVisible > 0 || highSeverity > 1) {
    return watchReading({
      total,
      highSeverity,
      recurrenceVisible,
      recoveryMonitoring,
      latestCase,
      destinations,
    })
  }

  if (stabilityReady > 0) {
    return stabilityReadyReading({
      total,
      latestCase,
      destinations,
    })
  }

  return watchReading({
    total,
    highSeverity,
    recurrenceVisible,
    recoveryMonitoring,
    latestCase,
    destinations,
  })
}

type ReadingInput = {
  total: number
  highSeverity?: number
  recurrenceVisible?: number
  recoveryMonitoring?: number
  latestCase?: CommandCase
  destinations: {
    executiveCenter: number
    recovery: number
    coordination: number
    crossSite: number
    audit: number
    stabilityBoard: number
  }
}

function elevatedReading(input: ReadingInput): CommandReading {
  return {
    statusShort: 'ELEVATED',
    statusMeaning: 'Executive continuity review is required.',
    activeCaseCount: String(input.total),
    evidenceShort: 'REQUIRED',
    survivabilityShort: 'WATCH',
    pressureShort: (input.highSeverity || 0) > 1 ? 'ELEVATED' : 'VISIBLE',
    trajectoryShort: (input.recurrenceVisible || 0) > 0 ? 'UNSTABLE' : 'WATCH',
    recoveryShort: (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'UNCONFIRMED',
    reliabilityShort: (input.recurrenceVisible || 0) > 0 ? 'VARIABLE' : 'WATCH',
    attributionTitle: `${input.total} active record(s)`,
    attributionMeaning:
      'Active lifecycle evidence requires executive visibility before stability can be trusted.',
    commandVisibility: 'Executive review required',
    commandAction:
      'Do not allow escalated instability, reburn, or severe continuity pressure to move silently.',
    commandDecision: 'Executive Review Required',
    commandQuestion: 'Must leadership become involved before stability is trusted?',
    nextGovernedMovement: 'Move to Executive Center',
    movementReason:
      'Command escalation is visible. Leadership synthesis is required before any final stability absorption.',
    evidenceGap:
      'Ownership, action, outcome credibility, recurrence review, durability evidence, and audit-ready reconstruction are required.',
    recoveryCredibility:
      (input.recoveryMonitoring || 0) > 0
        ? 'Recovery monitoring is visible, but durability is unconfirmed.'
        : 'Recovery credibility is not yet established.',
    memory: (input.recurrenceVisible || 0) > 0 ? 'RECURRENCE' : 'VISIBLE',
    persistence: (input.recurrenceVisible || 0) > 0 ? 'PERSISTENT' : 'EMERGING',
    risk: 'WATCHED',
    lifecyclePosition:
      'Command is escalating continuity toward executive synthesis.',
    nextDestination: 'Executive Center',
    handoffReason:
      'Escalation, severe pressure, safeguarding visibility, or reburn risk requires leadership interpretation before continuity confidence can be restored.',
    coordinationRequired: input.destinations.coordination > 0,
    crossSiteRequired: input.destinations.crossSite > 1,
    executiveReviewRequired: true,
    auditRequired: true,
    continuityHistoryRequired: (input.recurrenceVisible || 0) > 0,
    destinationExecutiveCenter: input.destinations.executiveCenter,
    destinationRecovery: input.destinations.recovery,
    destinationCoordination: input.destinations.coordination,
    destinationCrossSite: input.destinations.crossSite,
    destinationAudit: Math.max(input.destinations.audit, input.destinations.executiveCenter),
    destinationStabilityBoard: input.destinations.stabilityBoard,
    hasActiveCommandEvidence: true,
    executiveBrief: {
      cases: `${input.total} command-attributed record(s)`,
      evidence: 'Executive and audit evidence required',
      action: 'Require leadership synthesis',
    },
    continuityMemory: {
      continuityMemory: (input.recurrenceVisible || 0) > 0 ? 'RECURRENCE' : 'VISIBLE',
      lastCommandActivity: input.latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'VISIBLE',
      lastRecoveryVerification:
        (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'UNCONFIRMED',
      lastExecutiveReview: 'REQUIRED',
    },
  }
}

function coordinationReading(input: ReadingInput): CommandReading {
  return {
    statusShort: 'COORDINATE',
    statusMeaning: 'Coordination ownership is required before continuity can advance.',
    activeCaseCount: String(input.total),
    evidenceShort: 'REQUIRED',
    survivabilityShort: 'WATCH',
    pressureShort: 'VISIBLE',
    trajectoryShort: (input.recurrenceVisible || 0) > 0 ? 'UNSTABLE' : 'WATCH',
    recoveryShort: (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
    reliabilityShort: 'VARIABLE',
    attributionTitle: `${input.total} active record(s)`,
    attributionMeaning:
      'Command visibility remains active because coordination, ownership, or routing clarity is not yet strong enough.',
    commandVisibility: 'Coordination handoff required',
    commandAction:
      'Move continuity to Coordination Center before escalation, cross-site review, or executive synthesis is trusted.',
    commandDecision: 'Coordination Required',
    commandQuestion: 'Must coordination stabilize ownership before continuity moves forward?',
    nextGovernedMovement: 'Move to Coordination Center',
    movementReason:
      'Coordination pressure, stalled routing, or ownership ambiguity requires synchronized action before recovery credibility can mature.',
    evidenceGap:
      'Coordination ownership, routing clarity, response responsibility, and evidence maturity must be strengthened.',
    recoveryCredibility:
      'Recovery cannot become durable until coordination responsibility is clear.',
    memory: (input.recurrenceVisible || 0) > 0 ? 'RECURRENCE' : 'VISIBLE',
    persistence: (input.recurrenceVisible || 0) > 0 ? 'PERSISTENT' : 'EMERGING',
    risk: 'MONITORED',
    lifecyclePosition:
      'Command is handing continuity to Coordination Center for synchronization.',
    nextDestination: 'Coordination Center',
    handoffReason:
      'The current signal requires ownership synchronization before continuity can safely move to recovery, cross-site review, or executive synthesis.',
    coordinationRequired: true,
    crossSiteRequired: input.destinations.crossSite > 1,
    executiveReviewRequired: false,
    auditRequired: true,
    continuityHistoryRequired: (input.recurrenceVisible || 0) > 0,
    destinationExecutiveCenter: input.destinations.executiveCenter,
    destinationRecovery: input.destinations.recovery,
    destinationCoordination: Math.max(input.destinations.coordination, 1),
    destinationCrossSite: input.destinations.crossSite,
    destinationAudit: Math.max(input.destinations.audit, 1),
    destinationStabilityBoard: input.destinations.stabilityBoard,
    hasActiveCommandEvidence: true,
    executiveBrief: {
      cases: `${input.total} command-attributed record(s)`,
      evidence: 'Coordination evidence required',
      action: 'Move to Coordination Center',
    },
    continuityMemory: {
      continuityMemory: (input.recurrenceVisible || 0) > 0 ? 'RECURRENCE' : 'VISIBLE',
      lastCommandActivity: input.latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'NONE CONCENTRATED',
      lastRecoveryVerification:
        (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
      lastExecutiveReview: 'CONDITIONAL',
    },
  }
}

function crossSiteReading(input: ReadingInput): CommandReading {
  return {
    statusShort: 'CROSS-SITE',
    statusMeaning: 'Continuity may no longer be isolated to one operational lane.',
    activeCaseCount: String(input.total),
    evidenceShort: 'REQUIRED',
    survivabilityShort: 'WATCH',
    pressureShort: (input.highSeverity || 0) > 1 ? 'ELEVATED' : 'VISIBLE',
    trajectoryShort: 'UNSTABLE',
    recoveryShort: (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
    reliabilityShort: 'VARIABLE',
    attributionTitle: `${input.total} active record(s)`,
    attributionMeaning:
      'Command visibility indicates continuity may require cross-site pattern review.',
    commandVisibility: 'Cross-site review required',
    commandAction:
      'Move continuity to Cross-Site Review so distributed pressure, recurrence, memory, and survivability exposure remain visible.',
    commandDecision: 'Cross-Site Review Required',
    commandQuestion: 'Has continuity moved beyond one site or isolated operational lane?',
    nextGovernedMovement: 'Move to Cross-Site Review',
    movementReason:
      'Recurring memory, site exposure, reburn, or regional visibility suggests the instability may require enterprise comparison.',
    evidenceGap:
      'Cross-site evidence must preserve affected site, pressure type, recovery posture, recurrence memory, and executive meaning.',
    recoveryCredibility:
      'Recovery credibility cannot be trusted until cross-site pattern risk is interpreted.',
    memory: 'RECURRENCE',
    persistence: 'PERSISTENT',
    risk: 'WATCHED',
    lifecyclePosition:
      'Command is moving continuity into cross-site enterprise pattern review.',
    nextDestination: 'Cross-Site Review',
    handoffReason:
      'The signal may no longer be contained within one case, site, or operational lane. Cross-site review must determine whether the pattern is isolated or distributed.',
    coordinationRequired: true,
    crossSiteRequired: true,
    executiveReviewRequired: true,
    auditRequired: true,
    continuityHistoryRequired: true,
    destinationExecutiveCenter: Math.max(input.destinations.executiveCenter, 1),
    destinationRecovery: input.destinations.recovery,
    destinationCoordination: Math.max(input.destinations.coordination, 1),
    destinationCrossSite: Math.max(input.destinations.crossSite, 1),
    destinationAudit: Math.max(input.destinations.audit, 1),
    destinationStabilityBoard: input.destinations.stabilityBoard,
    hasActiveCommandEvidence: true,
    executiveBrief: {
      cases: `${input.total} command-attributed record(s)`,
      evidence: 'Cross-site evidence required',
      action: 'Move to Cross-Site Review',
    },
    continuityMemory: {
      continuityMemory: 'RECURRENCE',
      lastCommandActivity: input.latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'DISTRIBUTED SIGNAL',
      lastRecoveryVerification:
        (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
      lastExecutiveReview: 'REQUIRED AFTER CROSS-SITE',
    },
  }
}

function evidenceReturnReading(input: ReadingInput): CommandReading {
  return {
    statusShort: 'WATCH',
    statusMeaning:
      'Evidence or intervention review is required before stability can be trusted.',
    activeCaseCount: String(input.total),
    evidenceShort: 'REQUIRED',
    survivabilityShort: 'STABLE',
    pressureShort: 'VISIBLE',
    trajectoryShort: 'WATCH',
    recoveryShort: (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
    reliabilityShort: 'VARIABLE',
    attributionTitle: `${input.total} active record(s)`,
    attributionMeaning:
      'Command visibility remains active because evidence or ownership is not yet strong enough.',
    commandVisibility: 'Evidence watch active',
    commandAction:
      'Return weak evidence to the appropriate operational review point before declaring durability.',
    commandDecision: 'Evidence Insufficient',
    commandQuestion: 'Can the evidence be trusted enough for recovery confidence?',
    nextGovernedMovement: 'Return to Outcomes or Interventions',
    movementReason:
      'Evidence, ownership, or stabilization credibility requires strengthening before recovery can mature.',
    evidenceGap: 'Evidence maturity is insufficient for durability confidence.',
    recoveryCredibility:
      'Recovery cannot become credible until evidence and intervention meaning are strengthened.',
    memory: 'VISIBLE',
    persistence: 'EMERGING',
    risk: 'MONITORED',
    lifecyclePosition:
      'Command is returning continuity to evidence strengthening before further movement.',
    nextDestination: 'Outcomes / Interventions Review',
    handoffReason:
      'The evidence standard is not mature enough to support recovery confidence, executive review, or stability absorption.',
    coordinationRequired: false,
    crossSiteRequired: false,
    executiveReviewRequired: false,
    auditRequired: true,
    continuityHistoryRequired: false,
    destinationExecutiveCenter: input.destinations.executiveCenter,
    destinationRecovery: input.destinations.recovery,
    destinationCoordination: input.destinations.coordination,
    destinationCrossSite: input.destinations.crossSite,
    destinationAudit: Math.max(input.destinations.audit, 1),
    destinationStabilityBoard: input.destinations.stabilityBoard,
    hasActiveCommandEvidence: true,
    executiveBrief: {
      cases: `${input.total} command-attributed record(s)`,
      evidence: 'Evidence review required',
      action: 'Return to evidence or intervention review',
    },
    continuityMemory: {
      continuityMemory: 'VISIBLE',
      lastCommandActivity: input.latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'NONE CONCENTRATED',
      lastRecoveryVerification:
        (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
      lastExecutiveReview: 'WATCH',
    },
  }
}

function watchReading(input: ReadingInput): CommandReading {
  return {
    statusShort: 'WATCH',
    statusMeaning: 'Proportional executive visibility remains active.',
    activeCaseCount: String(input.total),
    evidenceShort: 'MONITOR',
    survivabilityShort: 'STABLE',
    pressureShort: (input.highSeverity || 0) > 1 ? 'ELEVATED' : 'VISIBLE',
    trajectoryShort: (input.recurrenceVisible || 0) > 0 ? 'UNSTABLE' : 'STABLE',
    recoveryShort: (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
    reliabilityShort: (input.recurrenceVisible || 0) > 0 ? 'VARIABLE' : 'STABLE',
    attributionTitle: `${input.total} active record(s)`,
    attributionMeaning: 'Active lifecycle records remain under command watch.',
    commandVisibility: 'Watch active',
    commandAction:
      'Monitor without over-escalating, but do not allow fragile recovery to disappear.',
    commandDecision: 'Maintain Command Watch',
    commandQuestion: 'Can continuity remain under watch without executive escalation?',
    nextGovernedMovement: 'Continue Command Visibility',
    movementReason:
      'Recovery, recurrence, or severity signals remain visible but do not yet require full escalation.',
    evidenceGap: 'Evidence remains important; no concentrated gap is visible.',
    recoveryCredibility:
      (input.recoveryMonitoring || 0) > 0
        ? 'Recovery monitoring is active.'
        : 'Recovery credibility matures after verification.',
    memory: (input.recurrenceVisible || 0) > 0 ? 'RECURRENCE' : 'VISIBLE',
    persistence: (input.recurrenceVisible || 0) > 0 ? 'PERSISTENT' : 'EMERGING',
    risk: 'MONITORED',
    lifecyclePosition:
      'Command is holding proportional visibility while continuity remains watched.',
    nextDestination: 'Command Watch',
    handoffReason:
      'Current signals remain visible but do not yet justify coordination, cross-site review, executive synthesis, or stability absorption.',
    coordinationRequired: false,
    crossSiteRequired: false,
    executiveReviewRequired: false,
    auditRequired: (input.recurrenceVisible || 0) > 0,
    continuityHistoryRequired: (input.recurrenceVisible || 0) > 0,
    destinationExecutiveCenter: input.destinations.executiveCenter,
    destinationRecovery: input.destinations.recovery,
    destinationCoordination: input.destinations.coordination,
    destinationCrossSite: input.destinations.crossSite,
    destinationAudit: input.destinations.audit,
    destinationStabilityBoard: input.destinations.stabilityBoard,
    hasActiveCommandEvidence: true,
    executiveBrief: {
      cases: `${input.total} active command-attributed record(s)`,
      evidence: 'Monitor evidence maturity',
      action: 'Continue proportional visibility',
    },
    continuityMemory: {
      continuityMemory: (input.recurrenceVisible || 0) > 0 ? 'RECURRENCE' : 'VISIBLE',
      lastCommandActivity: input.latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'NONE CONCENTRATED',
      lastRecoveryVerification:
        (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
      lastExecutiveReview: 'WATCH',
    },
  }
}

function stabilityReadyReading(input: ReadingInput): CommandReading {
  return {
    statusShort: 'CLEAR',
    statusMeaning:
      'Command does not need to hold the case. Stability Board absorption is available.',
    activeCaseCount: String(input.total),
    evidenceShort: 'PRESERVED',
    survivabilityShort: 'CLEAR',
    pressureShort: 'CLEARING',
    trajectoryShort: 'STABLE',
    recoveryShort: 'DURABLE',
    reliabilityShort: 'STABLE',
    attributionTitle: `${input.total} active record(s)`,
    attributionMeaning:
      'Durable recovery is visible and can move to institutional posture without memory loss.',
    commandVisibility: 'Release to Stability Board',
    commandAction:
      'Do not hold durable recovery in Command. Move to Stability Board while preserving recurrence and evidence memory.',
    commandDecision: 'Durability Confirmed',
    commandQuestion: 'Can this recovery be absorbed without hiding memory or risk?',
    nextGovernedMovement: 'Move to Stability Board',
    movementReason:
      'Recovery is durable enough for institutional absorption while memory remains preserved.',
    evidenceGap: 'No active evidence gap is driving command pressure.',
    recoveryCredibility:
      'Recovery credibility is durable enough for Stability Board absorption.',
    memory: 'PRESERVED',
    persistence: 'RESOLVED',
    risk: 'CLEARING',
    lifecyclePosition:
      'Command is releasing durable recovery into monitored institutional posture.',
    nextDestination: 'Stability Board',
    handoffReason:
      'Recovery is durable enough to leave Command while continuity memory, evidence, and recurrence visibility remain preserved.',
    coordinationRequired: false,
    crossSiteRequired: false,
    executiveReviewRequired: false,
    auditRequired: true,
    continuityHistoryRequired: true,
    destinationExecutiveCenter: input.destinations.executiveCenter,
    destinationRecovery: input.destinations.recovery,
    destinationCoordination: input.destinations.coordination,
    destinationCrossSite: input.destinations.crossSite,
    destinationAudit: Math.max(input.destinations.audit, 1),
    destinationStabilityBoard: input.destinations.stabilityBoard,
    hasActiveCommandEvidence: true,
    executiveBrief: {
      cases: `${input.total} command-visible record(s)`,
      evidence: 'Preserved',
      action: 'Move to Stability Board',
    },
    continuityMemory: {
      continuityMemory: 'PRESERVED',
      lastCommandActivity: input.latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'NONE CONCENTRATED',
      lastRecoveryVerification: 'DURABLE',
      lastExecutiveReview: 'NOT REQUIRED',
    },
  }
}

function deriveDispositionFromCase(caseItem: CommandCase) {
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

function deriveRecommendedMovement(disposition: string, caseItem: CommandCase) {
  if (disposition === 'MOVE_TO_STABILITY_BOARD') {
    return '/system Stability Board — absorb into institutional posture.'
  }

  if (disposition === 'MOVE_TO_COMMAND_ESCALATION') {
    return '/executive-center Executive Center — leadership synthesis required.'
  }

  if (disposition === 'RETURN_TO_OUTCOMES_REVIEW') {
    return '/outcomes Outcomes Review — evidence credibility requires strengthening.'
  }

  if (disposition === 'RETURN_TO_INTERVENTION_REVIEW') {
    return '/interventions Intervention Review — stabilization action requires review.'
  }

  if (disposition === 'CONTINUE_RECOVERY_MONITORING') {
    return '/recovery Recovery Monitoring — continue durability observation.'
  }

  if (caseItem.case_status === 'RECOVERY_MONITORING') {
    return '/recovery Recovery Monitoring — maintain durability watch.'
  }

  return '/command Command Watch — maintain executive visibility.'
}

function deriveMovementReason(disposition: string, caseItem: CommandCase) {
  if (disposition === 'MOVE_TO_STABILITY_BOARD') {
    return 'Recovery is durable enough for institutional absorption while memory remains preserved.'
  }

  if (disposition === 'MOVE_TO_COMMAND_ESCALATION') {
    return 'Escalation, safeguarding, reburn, or severe continuity pressure requires leadership synthesis.'
  }

  if (disposition === 'RETURN_TO_OUTCOMES_REVIEW') {
    return 'Evidence credibility requires strengthening before stability or durability can be trusted.'
  }

  if (disposition === 'RETURN_TO_INTERVENTION_REVIEW') {
    return 'Stabilization action requires review before recovery can mature.'
  }

  if (disposition === 'CONTINUE_RECOVERY_MONITORING') {
    return 'Recovery is holding but still needs durability observation.'
  }

  if (caseItem.case_status === 'RECOVERY_MONITORING') {
    return 'Recovery remains visible but not yet ready for institutional absorption.'
  }

  return 'Command visibility remains proportionate while the lifecycle continues.'
}

function deriveCommandPostureFromCase(caseItem: CommandCase) {
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

function deriveMemoryImpactFromCase(caseItem: CommandCase) {
  if (
    caseItem.case_status.includes('RECURRENCE') ||
    caseItem.case_status === 'REOPENED' ||
    caseItem.outcome_summary?.includes('RECURRENCE') ||
    caseItem.intervention_summary?.includes('RECURRENCE')
  ) {
    return 'CONTINUITY_MEMORY_VISIBLE'
  }

  return 'STRUCTURAL_MEMORY_PRESERVED'
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

function Destination({ label, value }: { label: string; value: number }) {
  return (
    <article style={styles.destinationCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.destinationValue}>{value}</p>
    </article>
  )
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.signalCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.signalValue}>{value}</p>
    </article>
  )
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.smallMetric}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
    </article>
  )
}

function ExecutivePanel({ title, body }: { title: string; body: string }) {
  return (
    <article style={styles.panelCard}>
      <p style={styles.sectionKicker}>{title}</p>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function BriefLine({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.briefLine}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.briefValue}>{value}</p>
    </article>
  )
}

function MemoryLine({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.memoryLine}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.memoryValue}>{value}</p>
    </article>
  )
}

function HandoffStep({
  label,
  value,
  active,
}: {
  label: string
  value: string
  active?: boolean
}) {
  return (
    <article
      style={{
        ...styles.handoffStep,
        ...(active ? styles.handoffStepActive : {}),
      }}
    >
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.handoffValue}>{value}</p>
    </article>
  )
}

function RequirementCard({
  label,
  active,
  body,
}: {
  label: string
  active: boolean
  body: string
}) {
  return (
    <article
      style={{
        ...styles.requirementCard,
        ...(active ? styles.requirementCardActive : {}),
      }}
    >
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.requirementStatus}>{active ? 'Required' : 'Not Required'}</p>
      <p style={styles.requirementBody}>{body}</p>
    </article>
  )
}

const gold = '#d6b25e'
const mutedGold = '#9f8142'
const deepBlack = '#030303'
const panelBlack = '#090807'
const cardBlack = '#11100d'
const softLine = 'rgba(214,178,94,0.24)'

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: '#f5f0e6',
    overflowX: 'hidden',
    background:
      'radial-gradient(circle at top right, rgba(214,178,94,0.08), transparent 32%), #030303',
  },
  container: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '16px 28px 72px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '28px',
  },
  kicker: {
    color: gold,
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '2px',
    margin: 0,
  },
  title: {
    color: '#fff8e7',
    fontSize: 'clamp(34px, 4vw, 48px)',
    lineHeight: 1,
    margin: '10px 0',
    letterSpacing: '-0.05em',
  },
  subtitle: {
    color: '#cfc7b5',
    maxWidth: '800px',
    lineHeight: 1.65,
    fontSize: '14px',
    margin: 0,
  },
  commandQuestionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
    gap: '24px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
    boxSizing: 'border-box',
  },
  questionTitle: {
    color: gold,
    fontSize: 'clamp(28px, 4vw, 42px)',
    lineHeight: 1.05,
    margin: '10px 0 0',
    letterSpacing: '-0.04em',
  },
  commandAuthorityBox: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '18px',
  },
  commandStatus: {
    display: 'grid',
    gridTemplateColumns: '280px minmax(0, 1fr)',
    gap: '24px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
    boxSizing: 'border-box',
  },
  commandStatusTitle: {
    color: '#fff8e7',
    fontSize: '38px',
    lineHeight: 1,
    margin: '10px 0',
    letterSpacing: '-0.05em',
  },
  commandStatusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
  },
  decisionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '24px',
    marginBottom: '24px',
  },
  decisionPrimary: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '24px',
  },
  decisionSecondary: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '24px',
  },
  decisionTitle: {
    color: gold,
    fontSize: 'clamp(28px, 3vw, 40px)',
    lineHeight: 1.05,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  movementTitle: {
    color: '#fff8e7',
    fontSize: 'clamp(26px, 3vw, 36px)',
    lineHeight: 1.05,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  handoffPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
    gap: '24px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
  },
  handoffGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '12px',
  },
  handoffStep: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    minHeight: '88px',
  },
  handoffStepActive: {
    background: '#201809',
    border: `1px solid ${gold}`,
  },
  handoffValue: {
    color: '#fff8e7',
    fontSize: '13px',
    lineHeight: 1.25,
    fontWeight: 900,
    margin: '8px 0 0',
  },
  requirementGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },
  requirementCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
    minHeight: '138px',
  },
  requirementCardActive: {
    background: '#1a1308',
    border: `1px solid ${gold}`,
  },
  requirementStatus: {
    color: gold,
    fontSize: '17px',
    fontWeight: 950,
    margin: '8px 0',
  },
  requirementBody: {
    color: '#cfc7b5',
    fontSize: '12px',
    lineHeight: 1.5,
    margin: 0,
  },
  destinationPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
    gap: '24px',
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
  },
  destinationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
  },
  destinationCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    minHeight: '76px',
  },
  destinationValue: {
    color: gold,
    fontSize: '26px',
    fontWeight: 950,
    margin: '8px 0 0',
    lineHeight: 1,
  },
  signalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  signalCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
    minHeight: '82px',
  },
  signalValue: {
    color: gold,
    fontSize: '18px',
    fontWeight: 950,
    margin: '8px 0 0',
  },
  commandGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '24px',
    marginBottom: '24px',
  },
  compactCard: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '24px',
    minHeight: '150px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  sectionKicker: {
    color: mutedGold,
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '10px',
  },
  compactTitle: {
    color: '#fff8e7',
    fontSize: 'clamp(20px, 2vw, 26px)',
    lineHeight: 1.1,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  bodyText: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    fontSize: '13px',
    margin: 0,
  },
  inlineRisk: {
    marginTop: '18px',
    color: '#fff8e7',
    fontSize: '12px',
    fontWeight: 850,
    lineHeight: 1.5,
  },
  memoryBoard: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
  },
  memoryBoardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
  },
  memoryLine: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    minHeight: '80px',
  },
  memoryValue: {
    color: '#fff8e7',
    fontSize: '14px',
    fontWeight: 900,
    lineHeight: 1.25,
    margin: '8px 0 0',
  },
  smallMetric: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '12px',
    padding: '10px',
  },
  metricLabel: {
    color: mutedGold,
    fontSize: '9px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  metricValue: {
    color: '#fff8e7',
    fontSize: '13px',
    lineHeight: 1.2,
    fontWeight: 900,
    margin: '6px 0 0',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  panelCard: {
    background: '#100f0d',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '20px',
    minHeight: '110px',
  },
  panelBody: {
    color: '#cfc7b5',
    lineHeight: 1.55,
    fontSize: '13px',
    margin: '10px 0 0',
  },
  briefLine: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    minHeight: '82px',
  },
  briefValue: {
    color: '#fff8e7',
    fontSize: '14px',
    fontWeight: 800,
    lineHeight: 1.35,
    margin: '8px 0 0',
  },
  doctrineCard: {
    display: 'grid',
    gridTemplateColumns: '220px minmax(0, 1fr)',
    gap: '24px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px 24px',
    color: '#e8dec8',
    fontSize: '13px',
    lineHeight: 1.55,
    fontWeight: 750,
    boxSizing: 'border-box',
  },
  caseList: {
    display: 'grid',
    gap: '14px',
    marginTop: '18px',
  },
  caseCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
  },
  caseIdentity: {
    color: '#fff8e7',
    fontWeight: 900,
    margin: '0 0 10px',
    lineHeight: 1.3,
  },
  caseMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
  },
  recoveryMiniPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
    marginTop: '10px',
  },
}