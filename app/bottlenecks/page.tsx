'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { interpretBottleneck } from '@/lib/cgi/interpreters/interpretBottleneck'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  beneficiary_name: string
  case_status: string
  safeguarding_flag: boolean
  region: string | null
  assigned_responder_id?: string | null
}

type RoutingAction = {
  id: string
  case_id: string
  assigned_responder_id?: string | null
}

type Intervention = {
  id: string
  case_id: string
}

type Outcome = {
  id: string
  case_id: string
  outcome_status?: string | null
}

type Responder = {
  id: string
  full_name: string
}

type ConstraintPosture =
  | 'CONSTRAINTS CLEAR'
  | 'CONSTRAINTS VISIBLE'
  | 'CONSTRAINTS ACCUMULATING'
  | 'CONSTRAINTS STRUCTURAL'
  | 'CONSTRAINTS COMMAND THRESHOLD'

type EnterpriseConstraintIntelligence = {
  posture: ConstraintPosture
  question: string
  thesis: string
  dominantConstraint: string
  routingConstraint: string
  ownershipConstraint: string
  stabilizationConstraint: string
  safeguardingConstraint: string
  regionalConstraint: string
  commandImplication: string
  coordinationImplication: string
  crossSiteImplication: string
  reliabilityImplication: string
  evidenceRequirement: string
  memoryRequirement: string
  boardWarning: string
  executiveAction: string
  generatedBrief: string
}

type ResponderConcentration = {
  responderId: string
  responderName: string
  posture: string
  interpretation: string
}

const REPORT_TEMPLATES = [
  'Executive constraint intelligence brief',
  'Routing constraint governance brief',
  'Ownership concentration governance brief',
  'Stabilization blockage intelligence brief',
  'Regional continuity constraint brief',
]

const CONSTRAINT_FOCUS_OPTIONS = [
  'Routing constraint visibility',
  'Ownership concentration pressure',
  'Stabilization blockage visibility',
  'Safeguarding continuity constraint',
  'Regional continuity constraint',
]

const OPERATING_SCOPE_OPTIONS = [
  'Enterprise continuity view',
  'Regional continuity view',
  'District continuity view',
  'Routing governance view',
  'Executive command view',
]

export default function BottlenecksPage() {
  return (
    <CGIGovernanceShell>
      <BottlenecksContent />
    </CGIGovernanceShell>
  )
}

function BottlenecksContent() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [responders, setResponders] = useState<Responder[]>([])
  const [message, setMessage] = useState('')

  const [reportTemplate, setReportTemplate] = useState(REPORT_TEMPLATES[0])
  const [constraintFocus, setConstraintFocus] = useState(
    CONSTRAINT_FOCUS_OPTIONS[0],
  )
  const [operatingScope, setOperatingScope] = useState(
    OPERATING_SCOPE_OPTIONS[0],
  )
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setMessage('Loading enterprise constraint intelligence...')

    const [
      casesResult,
      routingResult,
      interventionsResult,
      outcomesResult,
      respondersResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*'),
      supabase.from('responders').select('*'),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionsResult.error) console.error(interventionsResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)
    if (respondersResult.error) console.error(respondersResult.error)

    setCases(casesResult.data || [])
    setRoutingActions(routingResult.data || [])
    setInterventions(interventionsResult.data || [])
    setOutcomes(outcomesResult.data || [])
    setResponders(respondersResult.data || [])

    setMessage('Enterprise constraint intelligence loaded.')
  }

  const intelligence = useMemo(() => {
    const safeguardingFlags = cases.filter((item) => item.safeguarding_flag).length

    const activeCases = cases.filter((item) =>
      [
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
      ].includes(item.case_status),
    )

    const interventionCaseIds = new Set(interventions.map((item) => item.case_id))
    const outcomeCaseIds = new Set(outcomes.map((item) => item.case_id))
    const routedCaseIds = new Set(routingActions.map((item) => item.case_id))

    const unresolvedCases = activeCases.filter(
      (item) => interventionCaseIds.has(item.id) && !outcomeCaseIds.has(item.id),
    ).length

    const stalledCases = activeCases.filter(
      (item) => outcomeCaseIds.has(item.id) && item.case_status !== 'STABILIZED',
    ).length

    const unroutedCases = activeCases.filter(
      (item) => !routedCaseIds.has(item.id),
    ).length

    const unclearOwnership = routingActions.filter(
      (item) => !item.assigned_responder_id,
    ).length

    const regionalMap: Record<string, number> = {}

    activeCases.forEach((item) => {
      const region = item.region || 'Unspecified region'
      regionalMap[region] = (regionalMap[region] || 0) + 1
    })

    const highestRegionalLoad = Math.max(...Object.values(regionalMap), 0)

    const responderLoadMap: Record<string, number> = {}

    routingActions.forEach((item) => {
      const responder = item.assigned_responder_id || 'UNASSIGNED'
      responderLoadMap[responder] = (responderLoadMap[responder] || 0) + 1
    })

    const highestResponderLoad = Math.max(...Object.values(responderLoadMap), 0)

    const centralizedConstraint = interpretBottleneck({
      routingCongestion: clamp(highestResponderLoad * 20 + unroutedCases * 15),
      responderConcentration: clamp(highestResponderLoad * 20),
      unresolvedMomentum: clamp(unresolvedCases * 25 + unclearOwnership * 15),
      continuityDrift: clamp(stalledCases * 25),
      propagationRisk: clamp(safeguardingFlags * 25 + highestRegionalLoad * 10),
    })

    const responderConcentration: ResponderConcentration[] = Object.entries(
      responderLoadMap,
    ).map(([responderId, load]) => {
      const responder = responders.find((item) => item.id === responderId) || null

      const responderName =
        responderId === 'UNASSIGNED'
          ? 'Unassigned Pathways'
          : responder?.full_name || 'Unknown Responder'

      let posture = 'OWNERSHIP LOAD CONTROLLED'
      let interpretation = 'Continuity ownership appears controlled.'

      if (load >= 4) {
        posture = 'OWNERSHIP CONCENTRATION CRITICAL'
        interpretation =
          'Continuity ownership concentration may prevent movement and threaten survivability.'
      } else if (load >= 2) {
        posture = 'OWNERSHIP CONCENTRATION VISIBLE'
        interpretation =
          'Visible ownership concentration should remain under governance review.'
      }

      return {
        responderId,
        responderName,
        posture,
        interpretation,
      }
    })

    const enterprise = buildEnterpriseConstraintIntelligence({
      reportTemplate,
      constraintFocus,
      operatingScope,
      additionalNotes,
      bottleneckPosture: centralizedConstraint.posture,
      bottleneckInterpretation: centralizedConstraint.summary,
      bottleneckAction: centralizedConstraint.executiveAction,
      activeCases: activeCases.length,
      safeguardingFlags,
      unresolvedCases,
      stalledCases,
      unroutedCases,
      unclearOwnership,
      highestResponderLoad,
      highestRegionalLoad,
    })

    return {
      enterprise,
      activeCases: activeCases.length,
      safeguardingFlags,
      unresolvedCases,
      stalledCases,
      unroutedCases,
      unclearOwnership,
      highestResponderLoad,
      highestRegionalLoad,
      routingCongestion: interpretRoutingCongestion(highestResponderLoad, unroutedCases),
      stabilizationDelay: interpretStabilizationDelay(stalledCases),
      safeguardingVisibility: interpretSafeguarding(safeguardingFlags),
      responderPressure: interpretResponderPressure(highestResponderLoad),
      regionalPressure: interpretRegionalPressure(highestRegionalLoad),
      responderConcentration,
    }
  }, [
    cases,
    routingActions,
    interventions,
    outcomes,
    responders,
    reportTemplate,
    constraintFocus,
    operatingScope,
    additionalNotes,
  ])
    return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • ENTERPRISE CONSTRAINTS</p>

            <h1 style={styles.title}>Enterprise Constraint Intelligence</h1>

            <p style={styles.subtitle}>
              Constraint Intelligence identifies what is preventing continuity
              from moving forward. CGI does not treat delay as administration;
              it treats blocked movement as a continuity risk.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>CONSTRAINT POSTURE</p>
            <p style={styles.statusValue}>
              {intelligence.enterprise.posture}
            </p>
            <p style={styles.statusMeaning}>
              {intelligence.enterprise.thesis}
            </p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Executive Constraint Question</p>

            <h2 style={styles.commandTitle}>
              {intelligence.enterprise.question}
            </h2>

            <p style={styles.primaryText}>
              {intelligence.enterprise.dominantConstraint}
            </p>

            <div style={styles.commandMetaGrid}>
              <MiniStat
                label="Active Cases"
                value={String(intelligence.activeCases)}
              />

              <MiniStat
                label="Unrouted"
                value={String(intelligence.unroutedCases)}
              />

              <MiniStat
                label="Unclear Ownership"
                value={String(intelligence.unclearOwnership)}
              />

              <MiniStat
                label="Highest Load"
                value={String(intelligence.highestResponderLoad)}
              />
            </div>
          </div>

          <div style={styles.consequenceCard}>
            <p style={styles.sectionKicker}>Board Warning</p>

            <h2 style={styles.consequenceTitle}>
              Blocked movement becomes hidden instability.
            </h2>

            <p style={styles.bodyText}>
              {intelligence.enterprise.boardWarning}
            </p>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric
            label="Routing"
            value={intelligence.routingCongestion}
          />

          <Metric
            label="Ownership"
            value={intelligence.responderPressure}
          />

          <Metric
            label="Stabilization"
            value={intelligence.stabilizationDelay}
          />

          <Metric
            label="Safeguarding"
            value={intelligence.safeguardingVisibility}
          />

          <Metric
            label="Regional"
            value={intelligence.regionalPressure}
          />

          <Metric
            label="Stalled"
            value={String(intelligence.stalledCases)}
          />
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Routing Constraint"
            value={intelligence.enterprise.routingConstraint}
            body="Whether the chain is blocked before ownership or action."
          />

          <ExecutiveCard
            title="Ownership Constraint"
            value={intelligence.enterprise.ownershipConstraint}
            body="Whether too much continuity depends on unclear or concentrated ownership."
          />

          <ExecutiveCard
            title="Stabilization Constraint"
            value={intelligence.enterprise.stabilizationConstraint}
            body="Whether interventions are failing to convert into verified outcomes."
          />

          <ExecutiveCard
            title="Safeguarding Constraint"
            value={intelligence.enterprise.safeguardingConstraint}
            body="Whether safeguarding visibility raises continuity risk."
          />
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Regional Constraint"
            value={intelligence.enterprise.regionalConstraint}
            body="Whether constraint pressure may be geographically concentrated."
          />

          <ExecutiveCard
            title="Command"
            value={intelligence.enterprise.commandImplication}
            body="How Command should treat the constraint posture."
          />

          <ExecutiveCard
            title="Coordination"
            value={intelligence.enterprise.coordinationImplication}
            body="What synchronization is required to unblock movement."
          />

          <ExecutiveCard
            title="Reliability"
            value={intelligence.enterprise.reliabilityImplication}
            body="How constraints affect repeatable stabilization."
          />
        </section>

        <section style={styles.memoryPanel}>
          <p style={styles.sectionKicker}>Constraint Memory</p>

          <h2 style={styles.panelTitle}>
            The institution must remember what repeatedly prevents continuity
            from moving.
          </h2>

          <div style={styles.memoryGrid}>
            <MiniStat
              label="Unresolved"
              value={String(intelligence.unresolvedCases)}
            />

            <MiniStat
              label="Stalled"
              value={String(intelligence.stalledCases)}
            />

            <MiniStat
              label="Safeguarding"
              value={String(intelligence.safeguardingFlags)}
            />

            <MiniStat
              label="Regional Load"
              value={String(intelligence.highestRegionalLoad)}
            />
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Enterprise Constraint Requirements">
            <Info
              label="Executive Action"
              value={intelligence.enterprise.executiveAction}
            />

            <Info
              label="Evidence"
              value={intelligence.enterprise.evidenceRequirement}
            />

            <Info
              label="Memory"
              value={intelligence.enterprise.memoryRequirement}
            />

            <Info
              label="Cross-Site"
              value={intelligence.enterprise.crossSiteImplication}
            />
          </Panel>

          <Panel title="Brief Controls">
            <Select
              label="Report Template"
              value={reportTemplate}
              setValue={setReportTemplate}
              options={REPORT_TEMPLATES}
            />

            <Select
              label="Constraint Focus"
              value={constraintFocus}
              setValue={setConstraintFocus}
              options={CONSTRAINT_FOCUS_OPTIONS}
            />

            <Select
              label="Operating Scope"
              value={operatingScope}
              setValue={setOperatingScope}
              options={OPERATING_SCOPE_OPTIONS}
            />

            <label style={styles.label}>
              Additional Operational Notes

              <textarea
                value={additionalNotes}
                onChange={(event) => setAdditionalNotes(event.target.value)}
                placeholder="Use governance-safe operational language only."
                style={styles.textarea}
              />
            </label>

            <button onClick={loadData} style={styles.primaryButton}>
              Refresh Constraint Intelligence
            </button>
          </Panel>
        </section>
                <section style={styles.panel}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.sectionKicker}>
                Ownership Concentration Visibility
              </p>

              <h2 style={styles.panelTitle}>
                Constraint concentration across responders
              </h2>

              <p style={styles.bodyText}>
                Ownership concentration shows where continuity movement may
                depend too heavily on one person, one pathway, or no assigned
                owner.
              </p>
            </div>
          </div>

          <div style={styles.responderGrid}>
            {intelligence.responderConcentration.length === 0 && (
              <div style={styles.responderCard}>
                <p style={styles.metricLabel}>No ownership concentration visible</p>

                <h3 style={styles.cardValue}>OWNERSHIP LOAD CONTROLLED</h3>

                <p style={styles.panelBody}>
                  No routing concentration is currently visible in constraint
                  memory.
                </p>
              </div>
            )}

            {intelligence.responderConcentration.map((item) => (
              <div key={item.responderId} style={styles.responderCard}>
                <p style={styles.metricLabel}>{item.responderName}</p>

                <h3 style={styles.cardValue}>{item.posture}</h3>

                <p style={styles.panelBody}>{item.interpretation}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.orderPanel}>
          <p style={styles.sectionKicker}>Copy-Ready Constraint Brief</p>

          <h2 style={styles.panelTitle}>
            What is preventing continuity from moving forward?
          </h2>

          <pre style={styles.summaryBox}>
            {intelligence.enterprise.generatedBrief}
          </pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE CONSTRAINT DOCTRINE</strong>

          <span>
            Constraints are not delays. Constraints are blocked continuity
            movement. When routing, ownership, evidence, stabilization, or
            coordination cannot move, instability can remain visible without
            becoming resolved.
          </span>
        </section>
      </div>
    </main>
  )
}

function buildEnterpriseConstraintIntelligence(input: {
  reportTemplate: string
  constraintFocus: string
  operatingScope: string
  additionalNotes: string
  bottleneckPosture: string
  bottleneckInterpretation: string
  bottleneckAction: string
  activeCases: number
  safeguardingFlags: number
  unresolvedCases: number
  stalledCases: number
  unroutedCases: number
  unclearOwnership: number
  highestResponderLoad: number
  highestRegionalLoad: number
}): EnterpriseConstraintIntelligence {
  const constraintScore =
    input.unresolvedCases * 3 +
    input.stalledCases * 3 +
    input.unroutedCases * 3 +
    input.unclearOwnership * 2 +
    input.highestResponderLoad * 3 +
    input.highestRegionalLoad +
    input.safeguardingFlags * 4

  const posture = deriveConstraintPosture(constraintScore, input)

  const question = 'What is preventing continuity from moving forward?'

  const routingConstraint =
    input.unroutedCases > 0
      ? 'Routing is blocking movement because some active continuity records have not reached an owned pathway.'
      : 'Routing is not currently the dominant constraint.'

  const ownershipConstraint =
    input.unclearOwnership > 0 || input.highestResponderLoad >= 2
      ? 'Ownership is constrained by unclear assignment or concentrated responsibility.'
      : 'Ownership appears proportionally distributed.'

  const stabilizationConstraint =
    input.unresolvedCases > 0 || input.stalledCases > 0
      ? 'Stabilization is constrained because action has not converted into verified movement.'
      : 'Stabilization movement is not currently blocked by visible outcome gaps.'

  const safeguardingConstraint =
    input.safeguardingFlags > 0
      ? 'Safeguarding-visible pressure requires executive constraint visibility.'
      : 'Safeguarding pressure is not currently driving constraint posture.'

  const regionalConstraint =
    input.highestRegionalLoad >= 4
      ? 'Regional concentration suggests constraint pressure may be geographically structural.'
      : 'Regional constraint pressure is not yet structurally dominant.'

  const dominantConstraint = strongestConstraint({
    'Routing blockage': input.unroutedCases * 3,
    'Ownership concentration': input.highestResponderLoad * 3 + input.unclearOwnership * 2,
    'Stabilization blockage': input.unresolvedCases * 3 + input.stalledCases * 3,
    'Safeguarding constraint': input.safeguardingFlags * 4,
    'Regional concentration': input.highestRegionalLoad,
  })

  const commandImplication =
    posture === 'CONSTRAINTS COMMAND THRESHOLD' ||
    posture === 'CONSTRAINTS STRUCTURAL'
      ? 'Command must hold visibility until blocked movement is converted into owned action.'
      : posture === 'CONSTRAINTS ACCUMULATING'
        ? 'Command should keep constraint pressure visible before escalation is forced.'
        : 'Command can monitor constraints proportionally.'

  const coordinationImplication =
    input.unclearOwnership > 0 ||
    input.highestResponderLoad >= 2 ||
    input.unroutedCases > 0
      ? 'Coordination must synchronize ownership and unblock movement.'
      : 'Coordination remains watchable.'

  const crossSiteImplication =
    input.highestRegionalLoad >= 4 || input.safeguardingFlags >= 2
      ? 'Cross-site review may be required if the same constraint appears across regions or sites.'
      : 'Cross-site review remains conditional.'

  const reliabilityImplication =
    input.unresolvedCases > 0 || input.stalledCases > 0
      ? 'Reliability cannot be trusted while continuity movement remains blocked.'
      : 'Reliability remains watchable if constraint memory stays attached.'

  const evidenceRequirement =
    'Preserve routing blockage, ownership assignment, unresolved interventions, stalled outcomes, safeguarding flags, regional concentration, responder concentration, command implication, and evidence of movement.'

  const memoryRequirement =
    'Preserve repeated constraints so the institution does not normalize blocked continuity movement as ordinary delay.'

  const boardWarning =
    'Do not treat delay as administration. Blocked movement is continuity risk when ownership, evidence, action, or stabilization cannot advance.'

  const executiveAction =
    posture === 'CONSTRAINTS COMMAND THRESHOLD'
      ? 'Hold command visibility and require ownership correction, routing release, and stabilization evidence within 24 hours.'
      : posture === 'CONSTRAINTS STRUCTURAL'
        ? 'Escalate structural constraint review and preserve constraint memory.'
        : posture === 'CONSTRAINTS ACCUMULATING'
          ? 'Synchronize coordination and require movement evidence before constraints normalize.'
          : posture === 'CONSTRAINTS VISIBLE'
            ? 'Maintain constraint watch and preserve evidence of movement.'
            : 'Continue monitoring and preserve constraint baseline.'

  const thesis = `${posture}: ${dominantConstraint} is the dominant constraint. ${input.bottleneckInterpretation}`

  const generatedBrief = [
    'TSINAXA CGI ENTERPRISE CONSTRAINT INTELLIGENCE BRIEF',
    '',
    `Report Template: ${input.reportTemplate}`,
    '',
    `Constraint Focus: ${input.constraintFocus}`,
    '',
    `Operating Scope: ${input.operatingScope}`,
    '',
    `Executive Constraint Question: ${question}`,
    '',
    `Constraint Posture: ${posture}`,
    '',
    `Enterprise Thesis: ${thesis}`,
    '',
    `Dominant Constraint: ${dominantConstraint}`,
    '',
    `Routing Constraint: ${routingConstraint}`,
    '',
    `Ownership Constraint: ${ownershipConstraint}`,
    '',
    `Stabilization Constraint: ${stabilizationConstraint}`,
    '',
    `Safeguarding Constraint: ${safeguardingConstraint}`,
    '',
    `Regional Constraint: ${regionalConstraint}`,
    '',
    `Command Implication: ${commandImplication}`,
    '',
    `Coordination Implication: ${coordinationImplication}`,
    '',
    `Cross-Site Implication: ${crossSiteImplication}`,
    '',
    `Reliability Implication: ${reliabilityImplication}`,
    '',
    `Evidence Requirement: ${evidenceRequirement}`,
    '',
    `Memory Requirement: ${memoryRequirement}`,
    '',
    `Board Warning: ${boardWarning}`,
    '',
    `Executive Action: ${executiveAction}`,
    '',
    'Central Interpreter Reading:',
    input.bottleneckPosture,
    '',
    'Central Interpreter Action:',
    input.bottleneckAction,
    '',
    'Governance-Safe Meaning:',
    'Constraint intelligence assigns movement responsibility without assigning blame. It protects visibility over routing, ownership, evidence, stabilization, safeguarding, and cross-site movement before reliability is weakened.',
    '',
    'Additional Operational Notes:',
    input.additionalNotes.trim() || 'No additional operational notes entered.',
  ].join('\n')

  return {
    posture,
    question,
    thesis,
    dominantConstraint,
    routingConstraint,
    ownershipConstraint,
    stabilizationConstraint,
    safeguardingConstraint,
    regionalConstraint,
    commandImplication,
    coordinationImplication,
    crossSiteImplication,
    reliabilityImplication,
    evidenceRequirement,
    memoryRequirement,
    boardWarning,
    executiveAction,
    generatedBrief,
  }
}

function deriveConstraintPosture(
  score: number,
  input: {
    safeguardingFlags: number
    unresolvedCases: number
    stalledCases: number
    unroutedCases: number
    unclearOwnership: number
    highestResponderLoad: number
    highestRegionalLoad: number
  },
): ConstraintPosture {
  if (
    score >= 24 ||
    input.safeguardingFlags >= 3 ||
    input.highestResponderLoad >= 5
  ) {
    return 'CONSTRAINTS COMMAND THRESHOLD'
  }

  if (
    input.unresolvedCases >= 3 ||
    input.stalledCases >= 3 ||
    input.highestRegionalLoad >= 5
  ) {
    return 'CONSTRAINTS STRUCTURAL'
  }

  if (
    score >= 12 ||
    input.unroutedCases >= 2 ||
    input.unclearOwnership >= 2 ||
    input.highestResponderLoad >= 3
  ) {
    return 'CONSTRAINTS ACCUMULATING'
  }

  if (score > 0) return 'CONSTRAINTS VISIBLE'

  return 'CONSTRAINTS CLEAR'
}
function strongestConstraint(scores: Record<string, number>) {
  return (
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No dominant constraint detected'
  )
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function interpretRoutingCongestion(load: number, unrouted: number) {
  if (load >= 4 || unrouted >= 3) return 'ROUTING CONSTRAINT CRITICAL'
  if (load >= 2 || unrouted >= 1) return 'ROUTING CONSTRAINT VISIBLE'
  return 'ROUTING FLOW CONTROLLED'
}

function interpretStabilizationDelay(stalled: number) {
  if (stalled >= 3) return 'STABILIZATION CONSTRAINT CRITICAL'
  if (stalled >= 1) return 'STABILIZATION CONSTRAINT ACTIVE'
  return 'STABILIZATION FLOW ACTIVE'
}

function interpretSafeguarding(flags: number) {
  if (flags >= 3) return 'SAFEGUARDING CONSTRAINT CRITICAL'
  if (flags >= 1) return 'SAFEGUARDING VISIBILITY ACTIVE'
  return 'SAFEGUARDING PRESSURE CONTAINED'
}

function interpretResponderPressure(load: number) {
  if (load >= 4) return 'OWNERSHIP CONCENTRATION CRITICAL'
  if (load >= 2) return 'OWNERSHIP CONCENTRATION VISIBLE'
  return 'OWNERSHIP LOAD CONTROLLED'
}

function interpretRegionalPressure(load: number) {
  if (load >= 5) return 'REGIONAL CONSTRAINT STRUCTURAL'
  if (load >= 3) return 'REGIONAL CONSTRAINT VISIBLE'
  return 'REGIONAL PRESSURE CONTROLLED'
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
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

function ExecutiveCard({
  title,
  value,
  body,
}: {
  title: string
  value: string
  body: string
}) {
  return (
    <article style={styles.panelCard}>
      <p style={styles.sectionKicker}>{title}</p>
      <h3 style={styles.cardValue}>{value}</h3>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={styles.panel}>
      <p style={styles.sectionKicker}>{title}</p>
      <div style={styles.infoList}>{children}</div>
    </section>
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
    background:
      'radial-gradient(circle at top left, rgba(201, 162, 39, 0.14), transparent 34%), linear-gradient(135deg, #050505 0%, #0B0B0B 45%, #111111 100%)',
    color: '#FFFFFF',
    padding: '40px 24px 72px',
  },
  container: {
    width: 'min(1440px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gap: 24,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.75fr)',
    gap: 24,
    padding: 32,
    border: '1px solid rgba(201, 162, 39, 0.34)',
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
    boxShadow: '0 28px 80px rgba(0,0,0,0.38)',
  },
  kicker: {
    margin: 0,
    color: '#C9A227',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '14px 0 0',
    fontSize: 'clamp(2.3rem, 5vw, 5rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.07em',
    fontWeight: 950,
  },
  subtitle: {
    maxWidth: 880,
    margin: '18px 0 0',
    color: '#C8CDD4',
    fontSize: 17,
    lineHeight: 1.8,
  },
  statusBox: {
    border: '1px solid rgba(201, 162, 39, 0.5)',
    borderRadius: 24,
    padding: 24,
    background:
      'linear-gradient(180deg, rgba(201,162,39,0.18), rgba(0,0,0,0.38))',
  },
  statusLabel: {
    margin: 0,
    color: '#D7B84C',
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.2em',
  },
  statusValue: {
    margin: '16px 0 0',
    fontSize: 30,
    fontWeight: 950,
    letterSpacing: '-0.04em',
    lineHeight: 1.05,
  },
  statusMeaning: {
    margin: '12px 0 0',
    color: '#ECE7D7',
    fontSize: 14,
    lineHeight: 1.7,
  },
  message: {
    padding: '14px 18px',
    borderRadius: 16,
    color: '#D7B84C',
    background: 'rgba(201,162,39,0.1)',
    border: '1px solid rgba(201,162,39,0.22)',
    fontWeight: 800,
  },
  commandDeck: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.8fr',
    gap: 24,
  },
  primaryCard: {
    padding: 30,
    borderRadius: 28,
    background: '#FFFFFF',
    color: '#0B0B0B',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  consequenceCard: {
    padding: 30,
    borderRadius: 28,
    background: 'rgba(0,0,0,0.38)',
    border: '1px solid rgba(201,162,39,0.28)',
  },
  sectionKicker: {
    margin: 0,
    color: '#C9A227',
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  commandTitle: {
    margin: '14px 0',
    fontSize: 'clamp(1.8rem, 3vw, 3.2rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  primaryText: {
    margin: 0,
    color: '#4A4A4A',
    lineHeight: 1.7,
    fontSize: 14,
  },
  consequenceTitle: {
    margin: '14px 0',
    fontSize: 28,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
  bodyText: {
    margin: '8px 0 0',
    color: '#AEB6C2',
    lineHeight: 1.7,
    fontSize: 14,
  },
  commandMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 24,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 14,
  },
  metricCard: {
    padding: 18,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  metricLabel: {
    margin: 0,
    color: '#858D98',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  metricValue: {
    margin: '10px 0 0',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 950,
    lineHeight: 1.15,
    overflowWrap: 'anywhere',
  },
  miniStat: {
    padding: 14,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  miniValue: {
    margin: '8px 0 0',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 850,
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
  },
  panel: {
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  panelCard: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.09)',
    minHeight: 150,
  },
  panelTitle: {
    margin: '12px 0 0',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
  },
  cardValue: {
    margin: '12px 0 0',
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
  },
  panelBody: {
    marginTop: 10,
    color: '#AEB6C2',
    fontSize: 14,
    lineHeight: 1.65,
  },
  memoryPanel: {
    padding: 28,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(201,162,39,0.13), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.32)',
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
  },
  infoList: {
    display: 'grid',
    gap: 10,
    marginTop: 18,
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '170px minmax(0, 1fr)',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  infoLabel: {
    color: '#858D98',
    fontWeight: 900,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  infoValue: {
    color: '#FFFFFF',
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
  },
  label: {
    display: 'grid',
    gap: 8,
    color: '#DDE3EA',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  select: {
    width: '100%',
    borderRadius: 16,
    border: '1px solid rgba(201,162,39,0.22)',
    background: '#0D0D0D',
    color: '#FFFFFF',
    padding: '14px 16px',
    fontSize: 14,
    outline: 'none',
  },
  textarea: {
    minHeight: 120,
    resize: 'vertical',
    borderRadius: 18,
    border: '1px solid rgba(201,162,39,0.22)',
    background: '#0D0D0D',
    color: '#FFFFFF',
    padding: 16,
    fontSize: 14,
    lineHeight: 1.6,
    outline: 'none',
  },
  primaryButton: {
    border: 'none',
    borderRadius: 999,
    padding: '14px 22px',
    background: '#C9A227',
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
  },
  responderGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16,
    marginTop: 20,
  },
  responderCard: {
    padding: 20,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  orderPanel: {
    padding: 28,
    borderRadius: 28,
    background: '#FFFFFF',
    color: '#0B0B0B',
  },
  summaryBox: {
    marginTop: 20,
    padding: 22,
    borderRadius: 20,
    background: '#0A0A0A',
    color: '#F8F6F1',
    whiteSpace: 'pre-wrap',
    fontSize: 13,
    lineHeight: 1.7,
    overflowX: 'auto',
  },
  doctrineCard: {
    display: 'grid',
    gap: 10,
    padding: 24,
    borderRadius: 24,
    background: '#050505',
    border: '1px solid rgba(201,162,39,0.42)',
    color: '#FFFFFF',
    lineHeight: 1.7,
  },
}