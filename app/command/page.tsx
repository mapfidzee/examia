'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  cgiVisualStyles as v,
  mergeCGIStyles,
} from '@/lib/cgiVisualSystem'
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
  assigned_responder_id?: string | null
}

type InterventionRecord = {
  id: string
  case_id: string
}

type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
}

type Responder = {
  id: string
  full_name: string
  operational_status: string
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

type CommandCaseRecord = {
  caseItem: CommandCase
  recoveryDisposition: string
  commandPosture: string
  reburnVisible: boolean
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
    setInstitutions(
      institutionResult.error ? [] : institutionResult.data || [],
    )

    setMessage('Consolidated command intelligence loaded.')
    setLoading(false)
  }

  const records = useMemo(
    () => buildCommandCaseRecords(cases, outcomes),
    [cases, outcomes],
  )

  const intelligence = useMemo(
    () =>
      buildCommandIntelligence({
        cases,
        records,
        routingActions,
        interventions,
        outcomes,
        responders,
        institutions,
      }),
    [
      cases,
      records,
      routingActions,
      interventions,
      outcomes,
      responders,
      institutions,
    ],
  )

  const commandOrder = useMemo(
    () =>
      buildCommandOrder({
        reportTemplate,
        commandScope,
        intelligence,
        additionalNotes,
      }),
    [reportTemplate, commandScope, intelligence, additionalNotes],
  )

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • COMMAND</p>
            <h1 style={styles.title}>Enterprise Command Intelligence</h1>
            <p style={styles.subtitle}>
              Command decides what leadership must do, where continuity must
              move, and what evidence must remain attached. Command is not
              closure.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>COMMAND POSTURE</p>
            <p style={styles.statusValue}>{intelligence.posture}</p>
            <p style={styles.statusMeaning}>{intelligence.commandThesis}</p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.commandDeck}>
          <div style={styles.primaryCommandCard}>
            <p style={styles.sectionKicker}>Required Executive Action</p>
            <h2 style={styles.commandTitle}>{intelligence.executiveAction}</h2>
            <p style={styles.bodyText}>{intelligence.whyNow}</p>

            <div style={styles.commandMetaGrid}>
              <MiniStat
                label="Movement"
                value={intelligence.movementDecision}
              />
              <MiniStat
                label="Next Destination"
                value={intelligence.nextDestination}
              />
              <MiniStat label="Readiness" value={intelligence.readiness} />
              <MiniStat
                label="Dominant Threat"
                value={intelligence.dominantThreat}
              />
            </div>
          </div>

          <div style={styles.consequenceCard}>
            <p style={styles.sectionKicker}>If Leadership Does Nothing</p>
            <h2 style={styles.consequenceTitle}>
              False stability risk remains.
            </h2>
            <p style={styles.bodyText}>{intelligence.ifNoAction}</p>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric
            label="Active Cases"
            value={String(intelligence.activeCases)}
          />
          <Metric
            label="Escalated / Critical"
            value={String(intelligence.escalatedCritical)}
          />
          <Metric
            label="Cross-Site Signals"
            value={String(intelligence.crossSiteSignals)}
          />
          <Metric
            label="Recovery Monitoring"
            value={String(intelligence.recoveryMonitoring)}
          />
          <Metric
            label="Routing Gaps"
            value={String(intelligence.routingGaps)}
          />
          <Metric
            label="Outcome Gaps"
            value={String(intelligence.outcomeGaps)}
          />
        </section>

        <section style={styles.panel}>
          <p style={styles.sectionKicker}>Continuity Handoff Chain</p>
          <h2 style={styles.panelTitle}>
            Command must move continuity without hiding instability.
          </h2>

          <div style={styles.chain}>
            <ChainStep label="Recovery" body="Verifies durability" />
            <ChainStep label="Command" body="Moves and acts" active />
            <ChainStep
              label={intelligence.nextDestination}
              body="Next governed destination"
              active
            />
            <ChainStep label="Executive Report" body="Formal conclusion" />
            <ChainStep label="Audit" body="Reconstructs truth" />
          </div>
        </section>

        <section style={styles.requirementGrid}>
          <RequirementCard
            label="Coordination"
            active={intelligence.coordinationRequired}
            body={
              intelligence.coordinationRequired
                ? 'Ownership synchronization is required before continuity can advance.'
                : 'No concentrated coordination handoff is currently required.'
            }
          />
          <RequirementCard
            label="Cross-Site"
            active={intelligence.crossSiteRequired}
            body={
              intelligence.crossSiteRequired
                ? 'Distributed exposure must be interpreted before recovery can be trusted.'
                : 'No cross-site review is required by current command posture.'
            }
          />
          <RequirementCard
            label="Executive"
            active={intelligence.executiveReviewRequired}
            body={
              intelligence.executiveReviewRequired
                ? 'Leadership synthesis is required before continuity confidence can be restored.'
                : 'Executive review remains conditional.'
            }
          />
          <RequirementCard
            label="Audit"
            active={intelligence.auditRequired}
            body={
              intelligence.auditRequired
                ? 'The continuity chain must remain reconstructable.'
                : 'Routine preservation is sufficient.'
            }
          />
        </section>

        <section style={styles.panel}>
          <p style={styles.sectionKicker}>Required Executive Decisions</p>
          <h2 style={styles.panelTitle}>
            Command converts visible instability into owned decisions.
          </h2>

          <div style={styles.decisionList}>
            {intelligence.requiredDecisions.map((decision, index) => (
              <DecisionCard
                key={`${decision.decision}-${index}`}
                decision={decision}
                index={index}
              />
            ))}
          </div>
        </section>

        <section style={styles.gridThree}>
          <EvidenceCard
            title="Readiness Meaning"
            body={intelligence.readinessMeaning}
          />
          <EvidenceCard
            title="Evidence Standard"
            body={intelligence.evidenceStandard}
          />
          <EvidenceCard
            title="Recovery Credibility"
            body={intelligence.recoveryCredibility}
          />
        </section>

        <section style={styles.panel}>
          <p style={styles.sectionKicker}>Command Accountability Ledger</p>
          <h2 style={styles.panelTitle}>
            Every command decision must be owned, timed, and evidence-bound.
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
                {intelligence.requiredDecisions.map((item, index) => (
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
          <Signal label="Pressure" value={intelligence.pressureSignal} />
          <Signal label="Trajectory" value={intelligence.trajectorySignal} />
          <Signal label="Recovery" value={intelligence.recoverySignal} />
          <Signal label="Reliability" value={intelligence.reliabilitySignal} />
          <Signal
            label="Survivability"
            value={intelligence.survivabilitySignal}
          />
        </section>

        <section style={styles.commandGrid}>
          <section style={styles.panel}>
            <p style={styles.sectionKicker}>Command Attribution</p>
            <h2 style={styles.panelTitle}>
              {records.length} active command-visible record(s)
            </h2>
            <p style={styles.bodyText}>
              Active lifecycle evidence remains attached to Command until
              ownership, movement, recovery confidence, and auditability are
              protected.
            </p>

            {!loading && records.length > 0 && (
              <div style={styles.caseList}>
                {records.map((record) => (
                  <article key={record.caseItem.id} style={styles.caseCard}>
                    <p style={styles.caseTitle}>
                      {record.caseItem.beneficiary_name}
                    </p>
                    <div style={styles.caseMetaGrid}>
                      <MiniStat
                        label="Pressure"
                        value={record.caseItem.support_domain}
                      />
                      <MiniStat
                        label="Status"
                        value={record.caseItem.case_status}
                      />
                      <MiniStat
                        label="Severity"
                        value={record.caseItem.severity_level}
                      />
                      <MiniStat
                        label="Area"
                        value={record.caseItem.region || 'Not recorded'}
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section style={styles.panel}>
            <p style={styles.sectionKicker}>Supporting Signals</p>
            <h2 style={styles.panelTitle}>
              Evidence supports Command. It does not replace it.
            </h2>

            <div style={styles.supportingGrid}>
              {intelligence.supportingSignals.map((signal) => (
                <MiniStat
                  key={signal.label}
                  label={signal.label}
                  value={signal.value}
                />
              ))}
            </div>
          </section>
        </section>

        <section style={styles.memoryPanel}>
          <p style={styles.sectionKicker}>Continuity Memory</p>
          <h2 style={styles.panelTitle}>
            Command preserves what institutions are tempted to forget.
          </h2>

          <div style={styles.memoryGrid}>
            <MiniStat label="Memory" value={intelligence.memory} />
            <MiniStat label="Persistence" value={intelligence.persistence} />
            <MiniStat label="Risk" value={intelligence.risk} />
            <MiniStat
              label="Audit Required"
              value={intelligence.auditRequired ? 'YES' : 'NO'}
            />
          </div>
        </section>

        <section style={styles.panel}>
          <p style={styles.sectionKicker}>Command Order Controls</p>
          <h2 style={styles.panelTitle}>
            Generate a governed executive command order.
          </h2>

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

        <section style={styles.orderPanel}>
          <p style={styles.sectionKicker}>Copy-Ready Command Order</p>
          <h2 style={styles.panelTitle}>
            Executive action must be clear enough to execute and evidence-bound
            enough to audit.
          </h2>
          <pre style={styles.summaryBox}>{commandOrder}</pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>EXECUTIVE COMMAND DOCTRINE</strong>
          <span>
            Recovery verifies. Command moves. Coordination synchronizes.
            Cross-Site reveals enterprise pattern. Executive Center interprets.
            Executive Report concludes. Audit preserves continuity truth.
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

function buildCommandIntelligence(input: {
  cases: CommandCase[]
  records: CommandCaseRecord[]
  routingActions: RoutingAction[]
  interventions: InterventionRecord[]
  outcomes: OutcomeRecord[]
  responders: Responder[]
  institutions: Institution[]
}) {
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
      commandPressure >= 8 ? 'ELEVATED' : commandPressure >= 3 ? 'VISIBLE' : 'CLEAR',
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

  if (
    input.crossSiteSignals > 1 ||
    input.movementDecision.includes('Cross-Site')
  ) {
    return 'Cross-Site Review'
  }

  if (
    input.routingGaps > 0 ||
    input.movementDecision.includes('Coordination')
  ) {
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

function buildCommandOrder(input: {
  reportTemplate: string
  commandScope: string
  intelligence: ReturnType<typeof buildCommandIntelligence>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValueLarge}>{value}</p>
    </article>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.miniStat}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.miniValue}>{value}</p>
    </article>
  )
}

function ChainStep({
  label,
  body,
  active,
}: {
  label: string
  body: string
  active?: boolean
}) {
  return (
    <article
      style={mergeCGIStyles(
        styles.chainStep,
        active && styles.chainStepActive,
      )}
    >
      <p style={styles.chainLabel}>{label}</p>
      <p style={styles.chainBody}>{body}</p>
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
      style={mergeCGIStyles(
        styles.requirementCard,
        active && styles.requirementCardActive,
      )}
    >
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.requirementStatus}>
        {active ? 'Required' : 'Conditional'}
      </p>
      <p style={styles.bodyText}>{body}</p>
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
    <article style={styles.decisionCard}>
      <div style={styles.decisionNumber}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div>
        <h3 style={styles.decisionTitle}>{decision.decision}</h3>
        <p style={styles.bodyText}>{decision.evidenceRequired}</p>
        <div style={styles.decisionMeta}>
          <MiniStat label="Owner" value={decision.owner} />
          <MiniStat label="Deadline" value={decision.deadline} />
          <MiniStat label="Status" value={decision.status} />
        </div>
      </div>
    </article>
  )
}

function EvidenceCard({ title, body }: { title: string; body: string }) {
  return (
    <article style={styles.evidenceCard}>
      <p style={styles.sectionKicker}>{title}</p>
      <p style={styles.bodyText}>{body}</p>
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
  return (
    <label style={styles.label}>
      {label}
      <select
        value={value}
        onChange={(event) => setValue(event.target.value)}
        style={styles.select}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

const styles: Record<string, CSSProperties> = {
  page: v.page,
  container: v.wideContainer,
  hero: v.heroSplit,
  kicker: v.kicker,
  title: v.title,
  subtitle: v.subtitle,
  message: v.message,
  sectionKicker: v.sectionKicker,
  bodyText: v.bodyText,
  panel: v.panel,
  panelTitle: v.panelTitle,
  gridThree: v.gridThree,
  tableWrap: v.tableWrap,
  table: v.table,
  th: v.th,
  td: v.td,
  label: v.label,
  select: v.select,
  textarea: v.textarea,
  primaryButton: v.primaryButton,
  summaryBox: v.summaryBox,
  doctrineCard: v.doctrineCard,

  statusBox: v.emphasisPanel,
  statusLabel: v.metricLabel,
  statusValue: mergeCGIStyles(v.metricValueGold, {
    fontSize: 34,
    letterSpacing: '-0.04em',
  }),
  statusMeaning: mergeCGIStyles(v.bodyText, {
    color: '#ece7d7',
  }),

  commandDeck: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.8fr',
    gap: 24,
  },
  primaryCommandCard: v.whitePanel,
  consequenceCard: v.emphasisPanel,
  commandTitle: {
    margin: '14px 0',
    fontSize: 'clamp(1.8rem, 3vw, 3.2rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  consequenceTitle: {
    margin: '14px 0',
    color: '#fff8e7',
    fontSize: 28,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
  commandMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 24,
  },
  metricsGrid: v.gridSix,
  metricCard: v.card,
  metricLabel: v.metricLabel,
  metricValueLarge: v.metricValue,
  miniStat: v.card,
  miniValue: {
    margin: '8px 0 0',
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 850,
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  chain: v.gridFive,
  chainStep: v.card,
  chainStepActive: v.goldCard,
  chainLabel: {
    margin: 0,
    color: '#ffffff',
    fontWeight: 950,
  },
  chainBody: {
    margin: '8px 0 0',
    color: '#9ea7b3',
    fontSize: 13,
    lineHeight: 1.55,
  },
  requirementGrid: v.gridFour,
  requirementCard: v.card,
  requirementCardActive: v.goldCard,
  requirementStatus: {
    margin: '12px 0 0',
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 950,
  },
  decisionList: {
    display: 'grid',
    gap: 14,
    marginTop: 20,
  },
  decisionCard: {
    display: 'grid',
    gridTemplateColumns: '58px 1fr',
    gap: 18,
    padding: 20,
    borderRadius: 22,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(214,178,94,0.18)',
  },
  decisionNumber: {
    width: 48,
    height: 48,
    borderRadius: 16,
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(214,178,94,0.16)',
    border: '1px solid rgba(214,178,94,0.36)',
    color: '#d6b25e',
    fontWeight: 950,
  },
  decisionTitle: {
    margin: 0,
    color: '#ffffff',
    fontSize: 20,
  },
  decisionMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
    marginTop: 16,
  },
  evidenceCard: v.card,
  signalGrid: v.gridFive,
  signalCard: v.goldCard,
  signalValue: {
    margin: '10px 0 0',
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 950,
  },
  commandGrid: {
    display: 'grid',
    gridTemplateColumns: '1.25fr 0.75fr',
    gap: 24,
  },
  caseList: {
    display: 'grid',
    gap: 14,
    marginTop: 20,
  },
  caseCard: {
    padding: 18,
    borderRadius: 20,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  caseTitle: {
    margin: 0,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 950,
  },
  caseMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 10,
    marginTop: 14,
  },
  supportingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
  },
  memoryPanel: v.emphasisPanel,
  memoryGrid: v.gridFour,
  orderPanel: v.darkPanel,
}