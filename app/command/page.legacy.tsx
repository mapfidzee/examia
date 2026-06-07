'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  beneficiary_name?: string | null
  support_domain?: string | null
  case_status: string
  severity_level: string
  safeguarding_flag: boolean
  region: string | null
  institution_id?: string | null
  institution_name?: string | null
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
  outcome_status?: string | null
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

const ACTIVE_CASE_STATUSES = [
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
  'REOPENED',
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

export default function CommandCenterPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
    >
      <CGIGovernanceShell>
        <CommandCenterContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function CommandCenterContent() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [responders, setResponders] = useState<Responder[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [message, setMessage] = useState('')

  const [reportTemplate, setReportTemplate] = useState(
    COMMAND_REPORT_TEMPLATES[0],
  )
  const [commandScope, setCommandScope] = useState(COMMAND_SCOPE_OPTIONS[0])
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setMessage('Loading executive command action intelligence...')

    const [
      casesResult,
      routingResult,
      interventionResult,
      outcomeResult,
      responderResult,
      institutionResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*'),
      supabase.from('responders').select('*'),
      supabase.from('institutions').select('*'),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionResult.error) console.error(interventionResult.error)
    if (outcomeResult.error) console.error(outcomeResult.error)
    if (responderResult.error) console.error(responderResult.error)
    if (institutionResult.error) console.error(institutionResult.error)

    setCases(casesResult.data || [])
    setRoutingActions(routingResult.data || [])
    setInterventions(interventionResult.data || [])
    setOutcomes(outcomeResult.data || [])
    setResponders(responderResult.data || [])
    setInstitutions(institutionResult.data || [])
    setMessage('Executive command action intelligence loaded.')
  }

  const intelligence = useMemo(
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
    ],
  )

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • COMMAND</p>

          <h1 style={styles.title}>Executive Action Intelligence</h1>

          <p style={styles.subtitle}>
            Command is the action layer. It converts continuity pressure,
            recovery fragility, coordination exposure, cross-site risk, and
            evidence gaps into required decisions, owners, deadlines, command
            consequences, and report readiness.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Command Posture</p>

            <h2 style={styles.heroPosture}>{intelligence.posture}</h2>

            <p style={styles.heroMeaning}>{intelligence.commandThesis}</p>
          </div>

          <div style={styles.actionBox}>
            <p style={styles.actionLabel}>Required Command Action</p>
            <p style={styles.actionText}>{intelligence.executiveAction}</p>
          </div>
        </section>

        <section style={styles.thesisCard}>
          <div>
            <p style={styles.sectionKicker}>Command Thesis</p>

            <h2 style={styles.cardTitle}>{intelligence.dominantThreat}</h2>

            <p style={styles.bodyText}>{intelligence.whyNow}</p>
          </div>

          <div style={styles.thesisStack}>
            <CommandMini title="Command Question" body={intelligence.commandQuestion} />
            <CommandMini title="If No Action" body={intelligence.ifNoAction} />
            <CommandMini title="Next Destination" body={intelligence.nextDestination} />
          </div>
        </section>

        <section style={styles.chainPanel}>
          <ChainStep label="Executive Center" value="Interprets meaning" />
          <ChainStep label="Command" value="Directs action" active />
          <ChainStep label="Coordination" value="Synchronizes owners" />
          <ChainStep label="Cross-Site" value="Confirms pattern" />
          <ChainStep label="Executive Report" value="Concludes" />
          <ChainStep label="Audit" value="Reconstructs" />
        </section>

        <section style={styles.gridFour}>
          <SignalCard
            title="Command Readiness"
            value={intelligence.readiness}
            body={intelligence.readinessMeaning}
          />

          <SignalCard
            title="Required Decisions"
            value={String(intelligence.requiredDecisions.length)}
            body="Decisions that must be owned before command confidence can reduce."
          />

          <SignalCard
            title="Evidence Standard"
            value="ATTACHED"
            body={intelligence.evidenceStandard}
          />

          <SignalCard
            title="Report Movement"
            value={intelligence.nextDestination}
            body="Command determines whether the chain can move toward Executive Report."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Required Executive Decisions</p>

          <h2 style={styles.cardTitle}>
            Command now asks what leadership must do, not what dashboards are
            showing.
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
          {intelligence.consequences.map((item) => (
            <ConsequenceCard key={item.condition} item={item} />
          ))}
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
                {intelligence.commandLedger.map((item, index) => (
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

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Supporting Intelligence Evidence</p>

          <h2 style={styles.cardTitle}>
            Signals remain attached as evidence, but they no longer dominate
            Command.
          </h2>

          <div style={styles.supportingGrid}>
            {intelligence.supportingSignals.map((signal) => (
              <SignalCard
                key={signal.label}
                title={signal.label}
                value={signal.value}
                body={signal.meaning}
              />
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Command Brief Controls</p>

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

          <button onClick={loadData} style={styles.primaryButton}>
            Refresh Command Action Intelligence
          </button>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Copy-Ready Command Order</p>

          <h2 style={styles.cardTitle}>
            Executive action must be clear enough to execute and evidence-bound
            enough to audit.
          </h2>

          <pre style={styles.summaryBox}>{intelligence.commandOrder}</pre>
        </section>
      </div>
    </main>
  )
}

function buildCommandActionReading(input: {
  cases: BeneficiaryCase[]
  routingActions: RoutingAction[]
  interventions: InterventionRecord[]
  outcomes: OutcomeRecord[]
  responders: Responder[]
  institutions: Institution[]
  reportTemplate: string
  commandScope: string
  additionalNotes: string
}): CommandActionReading {
  const totalCases = input.cases.length
  const activeCases = input.cases.filter((item) =>
    ACTIVE_CASE_STATUSES.includes(item.case_status),
  ).length

  const escalatedCases = input.cases.filter(
    (item) => item.case_status === 'ESCALATED',
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
      ACTIVE_CASE_STATUSES.includes(item.case_status) &&
      !routedCaseIds.has(item.id),
  ).length

  const routedWithoutResponder = input.routingActions.filter(
    (item) => !item.assigned_responder_id,
  ).length

  const activeWithoutOutcome = input.cases.filter(
    (item) =>
      ACTIVE_CASE_STATUSES.includes(item.case_status) &&
      !outcomeCaseIds.has(item.id),
  ).length

  const unresolvedInterventionPathways = input.cases.filter(
    (item) =>
      ACTIVE_CASE_STATUSES.includes(item.case_status) &&
      interventionCaseIds.has(item.id) &&
      !outcomeCaseIds.has(item.id),
  ).length

  const stalledCases = input.cases.filter(
    (item) =>
      ACTIVE_CASE_STATUSES.includes(item.case_status) &&
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
    posture,
    activeCases,
    escalatedCases,
    criticalCases,
    safeguardingFlags,
    recurrenceCases,
    activeWithoutRouting,
    routedWithoutResponder,
    activeWithoutOutcome,
    unresolvedInterventionPathways,
    stalledCases,
    crossSiteSignals,
    activeInstitutions,
    activeResponders,
    interventionCoverage,
    outcomeCoverage,
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
    readiness,
  })

  const executiveAction = deriveExecutiveAction({
    posture,
    readiness,
    dominantThreat,
  })

  const nextDestination =
    readiness === 'READY_FOR_EXECUTIVE_REPORT'
      ? 'Executive Report'
      : readiness === 'CONDITIONAL_REPORT_READINESS'
        ? 'Situation Room'
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
        'Command pressure remains elevated and must return to Coordination, Cross-Site, or Recovery Review.',
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
  ]

  const commandLedger = requiredDecisions

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
    commandLedger,
    evidenceStandard,
    commandOrder,
    supportingSignals,
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
  readiness: CommandReadiness
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
  dominantThreat: string
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
  posture: CommandPosture
  activeCases: number
  escalatedCases: number
  criticalCases: number
  safeguardingFlags: number
  recurrenceCases: number
  activeWithoutRouting: number
  routedWithoutResponder: number
  activeWithoutOutcome: number
  unresolvedInterventionPathways: number
  stalledCases: number
  crossSiteSignals: number
  activeInstitutions: number
  activeResponders: number
  interventionCoverage: number
  outcomeCoverage: number
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
    'Command assigns action responsibility without assigning blame. It protects visibility, ownership, evidence, deadlines, and auditability until continuity can safely move forward.',
    '',
    'Additional Operational Notes:',
    input.additionalNotes.trim() || 'No additional operational notes entered.',
  ].join('\n')
}

function ChainStep({
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
        ...styles.chainStep,
        ...(active ? styles.chainStepActive : {}),
      }}
    >
      <p style={styles.cardKicker}>{label}</p>
      <p style={styles.chainValue}>{value}</p>
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
      <p style={styles.cardKicker}>Decision {index + 1}</p>
      <h3 style={styles.decisionTitle}>{decision.decision}</h3>

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
      <p style={styles.cardKicker}>{item.condition}</p>
      <p style={styles.consequenceText}>{item.meaning}</p>
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
    <article style={styles.signalCard}>
      <p style={styles.cardKicker}>{title}</p>
      <h3 style={styles.signalStatus}>{value}</h3>
      <p style={styles.signalText}>{body}</p>
    </article>
  )
}

function CommandMini({ title, body }: { title: string; body: string }) {
  return (
    <article style={styles.commandMini}>
      <p style={styles.cardKicker}>{title}</p>
      <p style={styles.commandMiniText}>{body}</p>
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

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: 'white',
    overflowX: 'hidden',
  },
  container: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '0 20px 48px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '20px',
    paddingTop: '4px',
  },
  kicker: {
    color: '#67e8f9',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
    margin: 0,
  },
  title: {
    fontSize: 'clamp(32px, 5vw, 52px)',
    lineHeight: 1.05,
    margin: '10px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '860px',
    lineHeight: 1.65,
    fontSize: '16px',
    margin: 0,
  },
  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '16px',
    fontSize: '14px',
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.65fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #22d3ee',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  thesisCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #facc15',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  thesisStack: {
    display: 'grid',
    gap: '12px',
  },
  sectionKicker: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '12px',
  },
  heroPosture: {
    fontSize: 'clamp(34px, 6vw, 56px)',
    margin: '8px 0 12px',
    color: '#67e8f9',
    letterSpacing: '-0.05em',
    lineHeight: 1,
  },
  heroMeaning: {
    color: '#cffafe',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '720px',
  },
  actionBox: {
    background: '#083344',
    border: '1px solid #22d3ee',
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },
  actionLabel: {
    color: '#67e8f9',
    fontWeight: 900,
    margin: '0 0 8px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  actionText: {
    color: '#cffafe',
    lineHeight: 1.55,
    margin: 0,
    fontSize: '14px',
  },
  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.24)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: '24px',
    margin: '0 0 10px',
    lineHeight: 1.2,
  },
  bodyText: {
    color: '#cbd5e1',
    lineHeight: 1.65,
    margin: 0,
  },
  cardKicker: {
    color: '#94a3b8',
    fontWeight: 800,
    margin: 0,
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  chainPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  chainStep: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '14px',
    minHeight: '112px',
  },
  chainStepActive: {
    background: '#083344',
    border: '1px solid #22d3ee',
  },
  chainValue: {
    color: '#e0f2fe',
    fontSize: '13px',
    fontWeight: 900,
    lineHeight: 1.35,
    margin: '10px 0 0',
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  supportingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '16px',
  },
  signalCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '14px',
    minHeight: '132px',
  },
  signalStatus: {
    color: '#67e8f9',
    fontSize: '18px',
    margin: '8px 0',
    lineHeight: 1.2,
    overflowWrap: 'anywhere',
  },
  signalText: {
    color: '#cbd5e1',
    lineHeight: 1.5,
    margin: 0,
    fontSize: '14px',
  },
  decisionList: {
    display: 'grid',
    gap: '14px',
    marginTop: '16px',
  },
  decisionCard: {
    background: '#0f172a',
    border: '1px solid #22d3ee',
    borderRadius: '18px',
    padding: '16px',
  },
  decisionTitle: {
    color: '#f8fafc',
    fontSize: '22px',
    lineHeight: 1.15,
    margin: '8px 0 12px',
  },
  consequenceCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
  },
  consequenceText: {
    color: '#e2e8f0',
    lineHeight: 1.55,
    margin: '10px 0 0',
    fontWeight: 800,
  },
  commandMini: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '14px',
  },
  commandMiniText: {
    color: '#e2e8f0',
    lineHeight: 1.5,
    margin: '10px 0 0',
    fontWeight: 800,
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
    color: '#94a3b8',
    borderBottom: '1px solid #334155',
    padding: '10px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  td: {
    borderBottom: '1px solid #1e293b',
    padding: '10px',
    color: '#e2e8f0',
    verticalAlign: 'top',
    lineHeight: 1.5,
    fontSize: '13px',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '160px minmax(0, 1fr)',
    gap: '12px',
    background: '#020617',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '12px',
    alignItems: 'start',
    marginTop: '8px',
  },
  infoLabel: {
    color: '#94a3b8',
    fontWeight: 800,
    fontSize: '12px',
  },
  infoValue: {
    color: '#f8fafc',
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  label: {
    display: 'block',
    fontWeight: 800,
    marginTop: '16px',
    marginBottom: '12px',
  },
  select: {
    width: '100%',
    marginTop: '8px',
    padding: '12px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
  },
  textarea: {
    width: '100%',
    minHeight: '110px',
    marginTop: '8px',
    padding: '12px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
    resize: 'vertical',
  },
  primaryButton: {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    border: 'none',
    background: '#67e8f9',
    color: '#082f49',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '15px',
  },
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '16px',
    color: '#e2e8f0',
    lineHeight: 1.55,
    minHeight: '260px',
    fontSize: '14px',
    overflowX: 'auto',
  },
}