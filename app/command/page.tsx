'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

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
  institution_id?: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  intervention_summary: string | null
  outcome_summary: string | null
  created_at?: string | null
  updated_at?: string | null
}

type RoutingAction = {
  id: string
  case_id: string
  routing_status?: string | null
  routing_priority?: string | null
  routing_reason?: string | null
  institution_id?: string | null
  assigned_responder_id?: string | null
  created_at?: string | null
}

type InterventionRecord = {
  id: string
  case_id: string
  intervention_type?: string | null
  intervention_status?: string | null
  assigned_responder_id?: string | null
  responder_id?: string | null
  created_at?: string | null
  completed_at?: string | null
}

type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
  stabilization_status?: string | null
  recovery_status?: string | null
  created_at?: string | null
}

type Responder = {
  id: string
  full_name: string
  operational_status: string
  governance_status?: string | null
  responder_status?: string | null
  trust_score?: number | null
  active_case_count?: number | null
}

type Institution = {
  id: string
  institution_name: string
  coordination_status: string | null
}

type CommandPosture =
  | 'COMMAND CLEAR'
  | 'COMMAND WATCH'
  | 'ELEVATED COMMAND'
  | 'CRITICAL COMMAND'

type CommandReadiness =
  | 'READY_FOR_EXECUTIVE_REPORT'
  | 'NOT_READY_FOR_EXECUTIVE_REPORT'
  | 'CONDITIONAL_REPORT_READINESS'

type CommandDecision = {
  decision: string
  owner: string
  deadline: string
  evidenceRequired: string
  status: string
}

type CommandConsequence = {
  condition: string
  meaning: string
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

type CommandMovementReading = {
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

type CommandActionReading = {
  posture: CommandPosture
  commandThesis: string
  dominantThreat: string
  whyNow: string
  ifNoAction: string
  executiveAction: string
  readiness: CommandReadiness
  readinessMeaning: string
  nextDestination: string
  commandQuestion: string
  requiredDecisions: CommandDecision[]
  consequences: CommandConsequence[]
  commandLedger: CommandDecision[]
  evidenceStandard: string
  commandOrder: string
  supportingSignals: {
    label: string
    value: string
    meaning: string
  }[]
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

const COMMAND_REPORT_TEMPLATES = [
  'Executive continuity command order',
  'Cross-site command order',
  'Recovery durability command order',
  'Coordination synchronization command order',
  'Safeguarding visibility command order',
  'Institutional stability command order',
]

const COMMAND_SCOPE_OPTIONS = [
  'Enterprise view',
  'Regional view',
  'Institution-focused',
  'Responder-network view',
  'Safeguarding view',
  'Recovery durability view',
]

export default function CommandPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <CommandContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function CommandContent() {
  const [cases, setCases] = useState<CommandCase[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [responders, setResponders] = useState<Responder[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const [reportTemplate, setReportTemplate] = useState(
    COMMAND_REPORT_TEMPLATES[0],
  )
  const [commandScope, setCommandScope] = useState(COMMAND_SCOPE_OPTIONS[0])
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    loadCommandIntelligence()
  }, [])

  async function loadCommandIntelligence() {
    setLoading(true)
    setMessage('Loading consolidated command intelligence...')

    const [
      casesResult,
      routingResult,
      interventionResult,
      outcomeResult,
      responderResult,
      institutionResult,
    ] = await Promise.all([
      supabase
        .from('beneficiary_cases')
        .select('*')
        .in('support_domain', PRESSURE_TYPES)
        .in('case_status', COMMAND_VISIBLE_STATUSES)
        .order('created_at', { ascending: false }),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*').order('created_at', {
        ascending: false,
      }),
      supabase.from('responders').select('*'),
      supabase.from('institutions').select('*'),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionResult.error) console.error(interventionResult.error)
    if (outcomeResult.error) console.error(outcomeResult.error)
    if (responderResult.error) console.error(responderResult.error)
    if (institutionResult.error) console.error(institutionResult.error)

    setCases(casesResult.error ? [] : casesResult.data || [])
    setRoutingActions(routingResult.error ? [] : routingResult.data || [])
    setInterventions(
      interventionResult.error ? [] : interventionResult.data || [],
    )
    setOutcomes(outcomeResult.error ? [] : outcomeResult.data || [])
    setResponders(responderResult.error ? [] : responderResult.data || [])
    setInstitutions(institutionResult.error ? [] : institutionResult.data || [])

    setMessage('Consolidated command intelligence loaded.')
    setLoading(false)
  }

  const commandRecords = useMemo(
    () => buildCommandCaseRecords(cases, outcomes),
    [cases, outcomes],
  )

  const movement = useMemo(
    () => buildCommandMovementReading(commandRecords),
    [commandRecords],
  )

  const action = useMemo(
    () =>
      buildCommandActionReading({
        cases,
        routingActions,
        interventions,
        outcomes,
        responders,
        institutions,
        reportTemplate,
        commandScope,
        additionalNotes,
        movement,
      }),
    [
      cases,
      routingActions,
      interventions,
      outcomes,
      responders,
      institutions,
      reportTemplate,
      commandScope,
      additionalNotes,
      movement,
    ],
  )

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • COMMAND</p>
          <h1 style={styles.title}>Enterprise Command Intelligence</h1>
          <p style={styles.subtitle}>
            Consolidated command gate for determining where continuity must move
            and what leadership must do. Command does not close instability.
            Command protects action, ownership, evidence, deadlines, movement,
            memory, and auditability.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroGrid}>
          <div style={styles.heroCard}>
            <p style={styles.sectionKicker}>Command Movement</p>
            <h2 style={styles.heroTitle}>{movement.statusShort}</h2>
            <p style={styles.bodyText}>{movement.statusMeaning}</p>
          </div>

          <div style={styles.heroCardGold}>
            <p style={styles.sectionKicker}>Executive Action</p>
            <h2 style={styles.heroTitleGold}>{action.posture}</h2>
            <p style={styles.bodyText}>{action.commandThesis}</p>
          </div>
        </section>

        <section style={styles.commandQuestionPanel}>
          <div>
            <p style={styles.sectionKicker}>Command Question</p>
            <h2 style={styles.questionTitle}>{movement.commandQuestion}</h2>
            <p style={styles.bodyText}>{movement.movementReason}</p>
          </div>

          <div style={styles.commandAuthorityBox}>
            <p style={styles.metricLabel}>Action Question</p>
            <p style={styles.bodyText}>{action.commandQuestion}</p>
          </div>
        </section>

        <section style={styles.decisionPanel}>
          <div style={styles.decisionPrimary}>
            <p style={styles.sectionKicker}>Movement Decision</p>
            <h2 style={styles.decisionTitle}>{movement.commandDecision}</h2>
            <p style={styles.bodyText}>{movement.nextGovernedMovement}</p>
          </div>

          <div style={styles.decisionSecondary}>
            <p style={styles.sectionKicker}>Required Action</p>
            <h2 style={styles.movementTitle}>{action.executiveAction}</h2>
            <p style={styles.bodyText}>{action.whyNow}</p>
          </div>
        </section>

        <section style={styles.handoffPanel}>
          <div>
            <p style={styles.sectionKicker}>Continuity Handoff Chain</p>
            <h2 style={styles.compactTitle}>{movement.lifecyclePosition}</h2>
            <p style={styles.bodyText}>{movement.handoffReason}</p>
          </div>

          <div style={styles.handoffGrid}>
            <HandoffStep label="Recovery" value="Verifies durability" />
            <HandoffStep label="Command" value="Moves + acts" active />
            <HandoffStep label="Next" value={movement.nextDestination} active />
            <HandoffStep
              label="Executive"
              value={movement.executiveReviewRequired ? 'Required' : 'Conditional'}
            />
            <HandoffStep
              label="Audit"
              value={movement.auditRequired ? 'Required' : 'Preserve if needed'}
            />
          </div>
        </section>

        <section style={styles.gridFour}>
          <RequirementCard
            label="Coordination"
            active={movement.coordinationRequired}
            body={
              movement.coordinationRequired
                ? 'Coordination must synchronize ownership before continuity advances.'
                : 'No concentrated coordination handoff is required.'
            }
          />

          <RequirementCard
            label="Cross-Site"
            active={movement.crossSiteRequired}
            body={
              movement.crossSiteRequired
                ? 'Cross-site review is required because the signal may no longer be isolated.'
                : 'No cross-site review is required by current command posture.'
            }
          />

          <RequirementCard
            label="Executive"
            active={movement.executiveReviewRequired}
            body={
              movement.executiveReviewRequired
                ? 'Leadership synthesis is required before continuity confidence can be restored.'
                : 'Executive review remains conditional.'
            }
          />

          <RequirementCard
            label="Audit"
            active={movement.auditRequired}
            body={
              movement.auditRequired
                ? 'Evidence must remain reconstructable across the governed chain.'
                : 'No audit escalation is required beyond routine preservation.'
            }
          />
        </section>

        <section style={styles.gridFour}>
          <SignalCard
            title="Readiness"
            value={action.readiness}
            body={action.readinessMeaning}
          />

          <SignalCard
            title="Dominant Threat"
            value={action.dominantThreat}
            body={action.ifNoAction}
          />

          <SignalCard
            title="Next Destination"
            value={action.nextDestination}
            body="Action readiness determines whether Command can release the chain."
          />

          <SignalCard
            title="Evidence Standard"
            value="ATTACHED"
            body={action.evidenceStandard}
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Required Executive Decisions</p>
          <h2 style={styles.cardTitle}>
            Command converts visible instability into owned decisions.
          </h2>

          <div style={styles.decisionList}>
            {action.requiredDecisions.map((decision, index) => (
              <DecisionCard
                key={`${decision.decision}-${index}`}
                decision={decision}
                index={index}
              />
            ))}
          </div>
        </section>

        <section style={styles.gridThree}>
          {action.consequences.map((item) => (
            <ConsequenceCard key={item.condition} item={item} />
          ))}
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Lifecycle Destinations</p>
          <h2 style={styles.cardTitle}>Where Command can move continuity</h2>

          <div style={styles.destinationGrid}>
            <Destination
              label="Executive Center"
              value={movement.destinationExecutiveCenter}
            />
            <Destination label="Recovery" value={movement.destinationRecovery} />
            <Destination
              label="Coordination"
              value={movement.destinationCoordination}
            />
            <Destination
              label="Cross-Site"
              value={movement.destinationCrossSite}
            />
            <Destination label="Audit" value={movement.destinationAudit} />
            <Destination
              label="Stability Board"
              value={movement.destinationStabilityBoard}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Command Accountability Ledger</p>
          <h2 style={styles.cardTitle}>
            Decisions must become owned, time-bound, and evidence-bound.
          </h2>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Decision</th>
                  <th style={styles.th}>Owner</th>
                  <th style={styles.th}>Deadline</th>
                  <th style={styles.th}>Evidence</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {action.commandLedger.map((item, index) => (
                  <tr key={`${item.decision}-${index}`}>
                    <td style={styles.td}>{item.decision}</td>
                    <td style={styles.td}>{item.owner}</td>
                    <td style={styles.td}>{item.deadline}</td>
                    <td style={styles.td}>{item.evidenceRequired}</td>
                    <td style={styles.td}>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.signalGrid}>
          <Signal label="Pressure" value={movement.pressureShort} />
          <Signal label="Trajectory" value={movement.trajectoryShort} />
          <Signal label="Recovery" value={movement.recoveryShort} />
          <Signal label="Reliability" value={movement.reliabilityShort} />
          <Signal label="Survivability" value={movement.survivabilityShort} />
        </section>

        <section style={styles.commandGrid}>
          <section style={styles.compactCard}>
            <p style={styles.sectionKicker}>Attribution</p>
            <h2 style={styles.compactTitle}>{movement.attributionTitle}</h2>
            <p style={styles.bodyText}>{movement.attributionMeaning}</p>

            {!loading && commandRecords.length > 0 && (
              <div style={styles.caseList}>
                {commandRecords.map((record) => (
                  <article key={record.caseItem.id} style={styles.caseCard}>
                    <p style={styles.caseIdentity}>
                      {record.caseItem.beneficiary_name}
                    </p>

                    <div style={styles.caseMetaGrid}>
                      <SmallMetric
                        label="Pressure"
                        value={record.caseItem.support_domain}
                      />
                      <SmallMetric
                        label="Status"
                        value={record.caseItem.case_status}
                      />
                      <SmallMetric
                        label="Severity"
                        value={record.caseItem.severity_level}
                      />
                      <SmallMetric
                        label="Area"
                        value={record.caseItem.region || 'Not recorded'}
                      />
                    </div>

                    {record.latestRecoveryReview && (
                      <div style={styles.recoveryMiniPanel}>
                        <SmallMetric
                          label="Recovery Disposition"
                          value={record.recoveryDisposition}
                        />
                        <SmallMetric
                          label="Command Posture"
                          value={record.commandPosture}
                        />
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section style={styles.compactCard}>
            <p style={styles.sectionKicker}>Command Visibility</p>
            <h2 style={styles.compactTitle}>{movement.commandVisibility}</h2>
            <p style={styles.bodyText}>{movement.commandAction}</p>

            <p style={styles.inlineRisk}>
              Memory: {movement.memory} • Persistence: {movement.persistence} •
              Risk: {movement.risk}
            </p>
          </section>
        </section>

        {movement.hasActiveCommandEvidence && (
          <section style={styles.twoColumnGrid}>
            <ExecutivePanel title="Evidence" body={movement.evidenceGap} />
            <ExecutivePanel title="Recovery" body={movement.recoveryCredibility} />
          </section>
        )}

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Supporting Intelligence Evidence</p>
          <h2 style={styles.cardTitle}>
            Signals remain attached as evidence, but they do not dominate
            Command.
          </h2>

          <div style={styles.supportingGrid}>
            {action.supportingSignals.map((signal) => (
              <SignalCard
                key={signal.label}
                title={signal.label}
                value={signal.value}
                body={signal.meaning}
              />
            ))}
          </div>
        </section>

        <section style={styles.memoryBoard}>
          <p style={styles.sectionKicker}>Continuity Memory</p>

          <div style={styles.memoryBoardGrid}>
            <MemoryLine
              label="Memory"
              value={movement.continuityMemory.continuityMemory}
            />
            <MemoryLine
              label="Last Activity"
              value={movement.continuityMemory.lastCommandActivity}
            />
            <MemoryLine
              label="Escalation"
              value={movement.continuityMemory.lastEscalation}
            />
            <MemoryLine
              label="Recovery Review"
              value={movement.continuityMemory.lastRecoveryVerification}
            />
            <MemoryLine
              label="Executive Review"
              value={movement.continuityMemory.lastExecutiveReview}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Command Order Controls</p>
          <h2 style={styles.cardTitle}>Generate a governed command order.</h2>

          <Select
            label="Command Report Template"
            value={reportTemplate}
            setValue={setReportTemplate}
            options={COMMAND_REPORT_TEMPLATES}
          />

          <Select
            label="Command Scope"
            value={commandScope}
            setValue={setCommandScope}
            options={COMMAND_SCOPE_OPTIONS}
          />

          <label style={styles.label} htmlFor="additional-command-notes">
            Optional Additional Operational Notes
            <textarea
              id="additional-command-notes"
              name="additionalCommandNotes"
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
              placeholder="Use system-level operational notes only. Avoid blame, personal judgment, or unnecessary personal details."
              style={styles.textarea}
            />
          </label>

          <button onClick={loadCommandIntelligence} style={styles.primaryButton}>
            Refresh Consolidated Command Intelligence
          </button>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Copy-Ready Command Order</p>
          <h2 style={styles.cardTitle}>
            Executive action must be clear enough to execute and evidence-bound
            enough to audit.
          </h2>

          <pre style={styles.summaryBox}>{action.commandOrder}</pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>COMMAND DECISION GATE</strong>
          <span>
            Recovery verifies. Command moves and acts. Coordination
            synchronizes. Cross-Site reveals enterprise pattern. Executive
            Center synthesizes. Executive Report concludes. Audit preserves
            reconstructability.
          </span>
        </section>
      </div>
    </main>
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
        Boolean(caseItem.outcome_summary?.includes('REBURN')),
    }
  })
}

function buildCommandMovementReading(
  records: CommandCaseRecord[],
): CommandMovementReading {
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
      Boolean(record.caseItem.outcome_summary?.includes('RECURRENCE')) ||
      Boolean(record.caseItem.intervention_summary?.includes('RECURRENCE')) ||
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
    return clearMovementReading()
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

function buildCommandActionReading(input: {
  cases: CommandCase[]
  routingActions: RoutingAction[]
  interventions: InterventionRecord[]
  outcomes: OutcomeRecord[]
  responders: Responder[]
  institutions: Institution[]
  reportTemplate: string
  commandScope: string
  additionalNotes: string
  movement: CommandMovementReading
}): CommandActionReading {
  const totalCases = input.cases.length
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

  const activeInstitutions = input.institutions.filter(
    (item) => item.coordination_status === 'ACTIVE',
  ).length

  const activeResponders = input.responders.filter(
    (item) => item.operational_status === 'ACTIVE',
  ).length

  const interventionCoverage =
    totalCases === 0
      ? 0
      : Math.round((interventionCaseIds.size / totalCases) * 100)

  const outcomeCoverage =
    totalCases === 0
      ? 0
      : Math.round((outcomeCaseIds.size / totalCases) * 100)

  const commandPressure =
    escalatedCases * 3 +
    criticalCases * 3 +
    safeguardingFlags * 2 +
    recurrenceCases * 2 +
    activeWithoutRouting +
    routedWithoutResponder +
    activeWithoutOutcome +
    unresolvedInterventionPathways +
    stalledCases +
    (crossSiteSignals > 1 ? 2 : 0)

  const posture = deriveActionPosture(commandPressure)

  const requiredDecisions = buildRequiredDecisions({
    activeWithoutRouting,
    routedWithoutResponder,
    activeWithoutOutcome,
    unresolvedInterventionPathways,
    outcomeCoverage,
    crossSiteSignals,
    recurrenceCases,
    escalatedCases,
    criticalCases,
    safeguardingFlags,
  })

  const readiness = deriveReadiness({
    posture,
    activeWithoutRouting,
    routedWithoutResponder,
    activeWithoutOutcome,
    unresolvedInterventionPathways,
    requiredDecisionCount: requiredDecisions.length,
  })

  const readinessMeaning = deriveReadinessMeaning(readiness)

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

  const commandThesis = deriveCommandThesis({
    posture,
    dominantThreat,
  })

  const executiveAction = deriveExecutiveAction({
    posture,
    readiness,
  })

  const nextDestination =
    readiness === 'READY_FOR_EXECUTIVE_REPORT'
      ? 'Executive Report'
      : readiness === 'CONDITIONAL_REPORT_READINESS'
        ? input.movement.nextDestination
        : 'Coordination / Cross-Site Review'

  const evidenceStandard =
    'Preserve command decision, owner, deadline, evidence requirement, recovery status, coordination handoff, cross-site exposure, executive rationale, and audit trail.'

  const consequences = [
    {
      condition: 'If action succeeds',
      meaning:
        'Command can release the chain toward Executive Report with evidence and memory attached.',
    },
    {
      condition: 'If action fails',
      meaning:
        'Command pressure remains elevated and must return to Coordination, Cross-Site, Recovery Review, or Executive Center.',
    },
    {
      condition: 'If action stalls',
      meaning:
        'The institution risks false stability because ownership exists without verified movement.',
    },
  ]

  const supportingSignals = [
    {
      label: 'Active Cases',
      value: String(activeCases),
      meaning: 'Active lifecycle pressure still visible to command.',
    },
    {
      label: 'Escalated / Critical',
      value: String(escalatedCases + criticalCases),
      meaning: 'Records requiring stronger leadership visibility.',
    },
    {
      label: 'Safeguarding',
      value: String(safeguardingFlags),
      meaning: 'Safeguarding-visible records requiring careful command handling.',
    },
    {
      label: 'Cross-Site Signals',
      value: String(crossSiteSignals),
      meaning: 'Potentially distributed continuity exposure.',
    },
    {
      label: 'Routing Gaps',
      value: String(activeWithoutRouting + routedWithoutResponder),
      meaning: 'Ownership and routing evidence gaps visible to command.',
    },
    {
      label: 'Outcome Gaps',
      value: String(activeWithoutOutcome),
      meaning: 'Active records not yet supported by outcome evidence.',
    },
    {
      label: 'Intervention Coverage',
      value: `${interventionCoverage}%`,
      meaning: 'How much of the case base has intervention evidence attached.',
    },
    {
      label: 'Outcome Coverage',
      value: `${outcomeCoverage}%`,
      meaning: 'How much of the case base has outcome evidence attached.',
    },
    {
      label: 'Active Institutions',
      value: String(activeInstitutions),
      meaning: 'Institutional coordination capacity visible to Command.',
    },
    {
      label: 'Active Responders',
      value: String(activeResponders),
      meaning: 'Responder capacity visible to Command.',
    },
  ]

  const commandOrder = buildCommandOrder({
    reportTemplate: input.reportTemplate,
    commandScope: input.commandScope,
    posture,
    commandThesis,
    dominantThreat,
    executiveAction,
    readiness,
    readinessMeaning,
    nextDestination,
    movementDestination: input.movement.nextDestination,
    movementDecision: input.movement.commandDecision,
    evidenceStandard,
    requiredDecisions,
    consequences,
    supportingSignals,
    additionalNotes: input.additionalNotes,
  })

  return {
    posture,
    commandThesis,
    dominantThreat,
    whyNow:
      'Command is required because visible continuity pressure must become owned, evidenced, time-bound action before the chain can safely move forward.',
    ifNoAction:
      'If leadership does nothing, unresolved ownership, weak evidence, recurrence, or cross-site exposure can disappear into false stability.',
    executiveAction,
    readiness,
    readinessMeaning,
    nextDestination,
    commandQuestion:
      'What must leadership do now so continuity does not move forward without ownership, evidence, and consequence?',
    requiredDecisions,
    consequences,
    commandLedger: requiredDecisions,
    evidenceStandard,
    commandOrder,
    supportingSignals,
  }
}

function clearMovementReading(): CommandMovementReading {
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

function elevatedReading(input: ReadingInput): CommandMovementReading {
  return {
    statusShort: 'ELEVATED',
    statusMeaning: 'Executive continuity review is required.',
    activeCaseCount: String(input.total),
    evidenceShort: 'REQUIRED',
    survivabilityShort: 'WATCH',
    pressureShort: (input.highSeverity || 0) > 1 ? 'ELEVATED' : 'VISIBLE',
    trajectoryShort: (input.recurrenceVisible || 0) > 0 ? 'UNSTABLE' : 'WATCH',
    recoveryShort:
      (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'UNCONFIRMED',
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
    destinationAudit: Math.max(
      input.destinations.audit,
      input.destinations.executiveCenter,
    ),
    destinationStabilityBoard: input.destinations.stabilityBoard,
    hasActiveCommandEvidence: true,
    executiveBrief: {
      cases: `${input.total} command-attributed record(s)`,
      evidence: 'Executive and audit evidence required',
      action: 'Require leadership synthesis',
    },
    continuityMemory: {
      continuityMemory:
        (input.recurrenceVisible || 0) > 0 ? 'RECURRENCE' : 'VISIBLE',
      lastCommandActivity: input.latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'VISIBLE',
      lastRecoveryVerification:
        (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'UNCONFIRMED',
      lastExecutiveReview: 'REQUIRED',
    },
  }
}

function coordinationReading(input: ReadingInput): CommandMovementReading {
  return {
    statusShort: 'COORDINATE',
    statusMeaning:
      'Coordination ownership is required before continuity can advance.',
    activeCaseCount: String(input.total),
    evidenceShort: 'REQUIRED',
    survivabilityShort: 'WATCH',
    pressureShort: 'VISIBLE',
    trajectoryShort: (input.recurrenceVisible || 0) > 0 ? 'UNSTABLE' : 'WATCH',
    recoveryShort:
      (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
    reliabilityShort: 'VARIABLE',
    attributionTitle: `${input.total} active record(s)`,
    attributionMeaning:
      'Command visibility remains active because coordination, ownership, or routing clarity is not yet strong enough.',
    commandVisibility: 'Coordination handoff required',
    commandAction:
      'Move continuity to Coordination Center before escalation, cross-site review, or executive synthesis is trusted.',
    commandDecision: 'Coordination Required',
    commandQuestion:
      'Must coordination stabilize ownership before continuity moves forward?',
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
      continuityMemory:
        (input.recurrenceVisible || 0) > 0 ? 'RECURRENCE' : 'VISIBLE',
      lastCommandActivity: input.latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'NONE CONCENTRATED',
      lastRecoveryVerification:
        (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
      lastExecutiveReview: 'CONDITIONAL',
    },
  }
}

function crossSiteReading(input: ReadingInput): CommandMovementReading {
  return {
    statusShort: 'CROSS-SITE',
    statusMeaning:
      'Continuity may no longer be isolated to one operational lane.',
    activeCaseCount: String(input.total),
    evidenceShort: 'REQUIRED',
    survivabilityShort: 'WATCH',
    pressureShort: (input.highSeverity || 0) > 1 ? 'ELEVATED' : 'VISIBLE',
    trajectoryShort: 'UNSTABLE',
    recoveryShort:
      (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
    reliabilityShort: 'VARIABLE',
    attributionTitle: `${input.total} active record(s)`,
    attributionMeaning:
      'Command visibility indicates continuity may require cross-site pattern review.',
    commandVisibility: 'Cross-site review required',
    commandAction:
      'Move continuity to Cross-Site Review so distributed pressure, recurrence, memory, and survivability exposure remain visible.',
    commandDecision: 'Cross-Site Review Required',
    commandQuestion: 'Has continuity moved beyond one site or isolated lane?',
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
      'The signal may no longer be contained within one case, site, or operational lane.',
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

function evidenceReturnReading(input: ReadingInput): CommandMovementReading {
  return {
    statusShort: 'WATCH',
    statusMeaning:
      'Evidence or intervention review is required before stability can be trusted.',
    activeCaseCount: String(input.total),
    evidenceShort: 'REQUIRED',
    survivabilityShort: 'STABLE',
    pressureShort: 'VISIBLE',
    trajectoryShort: 'WATCH',
    recoveryShort:
      (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
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

function watchReading(input: ReadingInput): CommandMovementReading {
  return {
    statusShort: 'WATCH',
    statusMeaning: 'Proportional executive visibility remains active.',
    activeCaseCount: String(input.total),
    evidenceShort: 'MONITOR',
    survivabilityShort: 'STABLE',
    pressureShort: (input.highSeverity || 0) > 1 ? 'ELEVATED' : 'VISIBLE',
    trajectoryShort: (input.recurrenceVisible || 0) > 0 ? 'UNSTABLE' : 'STABLE',
    recoveryShort:
      (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
    reliabilityShort: (input.recurrenceVisible || 0) > 0 ? 'VARIABLE' : 'STABLE',
    attributionTitle: `${input.total} active record(s)`,
    attributionMeaning: 'Active lifecycle records remain under command watch.',
    commandVisibility: 'Watch active',
    commandAction:
      'Monitor without over-escalating, but do not allow fragile recovery to disappear.',
    commandDecision: 'Maintain Command Watch',
    commandQuestion: 'Can continuity remain under watch without escalation?',
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
      continuityMemory:
        (input.recurrenceVisible || 0) > 0 ? 'RECURRENCE' : 'VISIBLE',
      lastCommandActivity: input.latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'NONE CONCENTRATED',
      lastRecoveryVerification:
        (input.recoveryMonitoring || 0) > 0 ? 'MONITORING' : 'PENDING',
      lastExecutiveReview: 'WATCH',
    },
  }
}

function stabilityReadyReading(input: ReadingInput): CommandMovementReading {
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
  requiredDecisionCount: number
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
    input.posture === 'CRITICAL COMMAND' ||
    input.requiredDecisionCount > 1
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

function buildCommandOrder(input: {
  reportTemplate: string
  commandScope: string
  posture: CommandPosture
  commandThesis: string
  dominantThreat: string
  executiveAction: string
  readiness: CommandReadiness
  readinessMeaning: string
  nextDestination: string
  movementDestination: string
  movementDecision: string
  evidenceStandard: string
  requiredDecisions: CommandDecision[]
  consequences: CommandConsequence[]
  supportingSignals: {
    label: string
    value: string
    meaning: string
  }[]
  additionalNotes: string
}) {
  return [
    'TSINAXA CGI EXECUTIVE COMMAND ORDER',
    '',
    `Template: ${input.reportTemplate}`,
    `Scope: ${input.commandScope}`,
    '',
    `Command Posture: ${input.posture}`,
    `Movement Decision: ${input.movementDecision}`,
    `Movement Destination: ${input.movementDestination}`,
    '',
    `Command Thesis: ${input.commandThesis}`,
    '',
    `Dominant Threat: ${input.dominantThreat}`,
    '',
    `Executive Action: ${input.executiveAction}`,
    '',
    `Command Readiness: ${input.readiness}`,
    '',
    `Readiness Meaning: ${input.readinessMeaning}`,
    '',
    `Next Governed Destination: ${input.nextDestination}`,
    '',
    'Required Decisions:',
    ...input.requiredDecisions.map(
      (item, index) =>
        `${index + 1}. ${item.decision}
   Owner: ${item.owner}
   Deadline: ${item.deadline}
   Evidence: ${item.evidenceRequired}
   Status: ${item.status}`,
    ),
    '',
    'Command Consequences:',
    ...input.consequences.map(
      (item) => `- ${item.condition}: ${item.meaning}`,
    ),
    '',
    `Evidence Standard: ${input.evidenceStandard}`,
    '',
    'Supporting Signals:',
    ...input.supportingSignals.map(
      (item) => `- ${item.label}: ${item.value}. ${item.meaning}`,
    ),
    '',
    'Governance-Safe Meaning:',
    'Command assigns action responsibility without assigning blame. It protects visibility, ownership, evidence, deadlines, movement, memory, and auditability until continuity can safely move forward.',
    '',
    'Additional Operational Notes:',
    input.additionalNotes.trim() || 'No additional operational notes entered.',
  ].join('\n')
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
    Boolean(caseItem.outcome_summary?.includes('RECURRENCE')) ||
    Boolean(caseItem.intervention_summary?.includes('RECURRENCE'))
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
      <p style={styles.requirementStatus}>
        {active ? 'Required' : 'Not Required'}
      </p>
      <p style={styles.requirementBody}>{body}</p>
    </article>
  )
}

function SignalCard({
  title,
  value,
  body,
}: {
  title: string
  value: string
  body: string
}) {
  return (
    <article style={styles.supportSignalCard}>
      <p style={styles.metricLabel}>{title}</p>
      <p style={styles.supportSignalValue}>{value}</p>
      <p style={styles.requirementBody}>{body}</p>
    </article>
  )
}

function DecisionCard({
  decision,
  index,
}: {
  decision: CommandDecision
  index: number
}) {
  return (
    <article style={styles.actionDecisionCard}>
      <p style={styles.metricLabel}>Decision {index + 1}</p>
      <h3 style={styles.actionDecisionTitle}>{decision.decision}</h3>

      <Info label="Owner" value={decision.owner} />
      <Info label="Deadline" value={decision.deadline} />
      <Info label="Evidence" value={decision.evidenceRequired} />
      <Info label="Status" value={decision.status} />
    </article>
  )
}

function ConsequenceCard({ item }: { item: CommandConsequence }) {
  return (
    <article style={styles.consequenceCard}>
      <p style={styles.metricLabel}>{item.condition}</p>
      <p style={styles.consequenceText}>{item.meaning}</p>
    </article>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  )
}

function Select({
  label,
  value,
  setValue,
  options,
}: {
  label: string
  value: string
  setValue: (value: string) => void
  options: string[]
}) {
  const id = label.toLowerCase().replaceAll(' ', '-')

  return (
    <label style={styles.label} htmlFor={id}>
      {label}
      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        style={styles.select}
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
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
    maxWidth: '860px',
    lineHeight: 1.65,
    fontSize: '14px',
    margin: 0,
  },
  message: {
    background: '#15110a',
    color: '#fff8e7',
    border: `1px solid ${softLine}`,
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '16px',
    fontSize: '13px',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  heroCard: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '24px',
  },
  heroCardGold: {
    background: panelBlack,
    border: `1px solid ${gold}`,
    borderRadius: '20px',
    padding: '24px',
  },
  heroTitle: {
    color: '#fff8e7',
    fontSize: 'clamp(32px, 4vw, 46px)',
    lineHeight: 1,
    margin: '10px 0',
    letterSpacing: '-0.05em',
  },
  heroTitleGold: {
    color: gold,
    fontSize: 'clamp(30px, 4vw, 42px)',
    lineHeight: 1,
    margin: '10px 0',
    letterSpacing: '-0.05em',
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
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  commandAuthorityBox: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '18px',
  },
  decisionPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
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
    fontSize: 'clamp(22px, 3vw, 32px)',
    lineHeight: 1.1,
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
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
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
    margin: '8px 0 0',
  },
  card: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#fff8e7',
    fontSize: 'clamp(22px, 3vw, 30px)',
    lineHeight: 1.15,
    margin: '10px 0 0',
    letterSpacing: '-0.04em',
  },
  decisionList: {
    display: 'grid',
    gap: '14px',
    marginTop: '18px',
  },
  actionDecisionCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
  },
  actionDecisionTitle: {
    color: '#fff8e7',
    fontSize: '22px',
    lineHeight: 1.15,
    margin: '10px 0 14px',
  },
  consequenceCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
    minHeight: '140px',
  },
  consequenceText: {
    color: '#fff8e7',
    lineHeight: 1.55,
    margin: '10px 0 0',
    fontWeight: 800,
  },
  destinationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
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
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
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
  supportingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
  },
  supportSignalCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    minHeight: '120px',
  },
  supportSignalValue: {
    color: '#fff8e7',
    fontSize: '16px',
    fontWeight: 900,
    margin: '8px 0',
    lineHeight: 1.2,
    overflowWrap: 'anywhere',
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
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
    marginTop: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '920px',
  },
  th: {
    textAlign: 'left',
    color: mutedGold,
    borderBottom: `1px solid ${softLine}`,
    padding: '10px',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  td: {
    borderBottom: '1px solid rgba(214,178,94,0.12)',
    padding: '10px',
    color: '#e8dec8',
    verticalAlign: 'top',
    lineHeight: 1.5,
    fontSize: '12px',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '150px minmax(0, 1fr)',
    gap: '10px',
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '12px',
    padding: '10px',
    alignItems: 'start',
    marginTop: '8px',
  },
  infoLabel: {
    color: mutedGold,
    fontWeight: 900,
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  infoValue: {
    color: '#fff8e7',
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
    fontSize: '12px',
  },
  label: {
    display: 'block',
    fontWeight: 800,
    marginTop: '16px',
    marginBottom: '12px',
    color: '#fff8e7',
  },
  select: {
    width: '100%',
    marginTop: '8px',
    padding: '12px',
    borderRadius: '12px',
    background: '#15110a',
    color: '#fff8e7',
    border: `1px solid ${softLine}`,
  },
  textarea: {
    width: '100%',
    minHeight: '110px',
    marginTop: '8px',
    padding: '12px',
    borderRadius: '12px',
    background: '#15110a',
    color: '#fff8e7',
    border: `1px solid ${softLine}`,
    resize: 'vertical',
  },
  primaryButton: {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    border: 'none',
    background: gold,
    color: '#11100d',
    fontWeight: 950,
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '18px',
  },
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
    color: '#e8dec8',
    lineHeight: 1.55,
    minHeight: '260px',
    fontSize: '13px',
    overflowX: 'auto',
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
}