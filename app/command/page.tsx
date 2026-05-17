'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { evaluateContinuityIntelligence } from '../lib/continuityIntelligence'
import { evaluatePressurePropagation } from '../lib/pressurePropagation'
import { evaluateTrajectoryIntelligence } from '../lib/trajectoryIntelligence'
import { evaluateStructuralMemory } from '../lib/structuralMemory'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
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

type Interpretation = {
  posture: string
  meaning: string
  action: string
}

type CommandSignal = {
  label: string
  posture: string
  meaning: string
  action: string
}

const ACTIVE_CASE_STATUSES = [
  'NEED_DETECTED',
  'UNDER_ASSESSMENT',
  'ROUTED',
  'RESPONDER_ASSIGNED',
  'INTERVENTION_ACTIVE',
  'STABILIZING',
]

const COMMAND_REPORT_TEMPLATES = [
  'National continuity command brief',
  'District continuity command brief',
  'NGO coordination command brief',
  'Ministry operational command brief',
  'Safeguarding visibility command brief',
  'Recovery and continuity command brief',
  'Pressure propagation command brief',
  'Trajectory intelligence command brief',
  'Structural memory command brief',
]

const COMMAND_FOCUS_OPTIONS = [
  'Overall continuity command view',
  'Operational disruption visibility',
  'Pressure propagation visibility',
  'Trajectory direction visibility',
  'Structural memory visibility',
  'Recovery and continuity visibility',
  'Routing and bottleneck visibility',
  'Safeguarding coordination visibility',
  'Responder and institution capacity visibility',
]

const COMMAND_SCOPE_OPTIONS = [
  'National view',
  'Regional view',
  'District view',
  'Institution-focused',
  'Responder-network view',
  'Safeguarding view',
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
    COMMAND_REPORT_TEMPLATES[0]
  )
  const [commandFocus, setCommandFocus] = useState(COMMAND_FOCUS_OPTIONS[0])
  const [commandScope, setCommandScope] = useState(COMMAND_SCOPE_OPTIONS[0])
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setMessage('Loading executive command intelligence...')

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
    setMessage('Executive command intelligence loaded.')
  }

  const intelligence = useMemo(() => {
    const totalCases = cases.length

    const activeCases = cases.filter((item) =>
      ACTIVE_CASE_STATUSES.includes(item.case_status)
    ).length

    const routedCases = cases.filter((item) =>
      ['ROUTED', 'RESPONDER_ASSIGNED'].includes(item.case_status)
    ).length

    const stabilizedCases = cases.filter(
      (item) => item.case_status === 'STABILIZED'
    ).length

    const escalatedCases = cases.filter(
      (item) => item.case_status === 'ESCALATED'
    ).length

    const criticalCases = cases.filter(
      (item) => item.severity_level === 'CRITICAL'
    ).length

    const safeguardingFlags = cases.filter(
      (item) => item.safeguarding_flag
    ).length

    const activeResponders = responders.filter((item) =>
      ['ACTIVE', 'VERIFIED'].includes(
        String(
          item.governance_status ||
            item.responder_status ||
            item.operational_status ||
            ''
        ).toUpperCase()
      )
    ).length

    const activeInstitutions = institutions.filter(
      (item) => item.coordination_status === 'ACTIVE'
    ).length

    const outcomeCaseIds = new Set(outcomes.map((item) => item.case_id))
    const interventionCaseIds = new Set(
      interventions.map((item) => item.case_id)
    )
    const routedCaseIds = new Set(routingActions.map((item) => item.case_id))

    const interventionCoverage =
      totalCases === 0
        ? 0
        : Math.round((interventionCaseIds.size / totalCases) * 100)

    const outcomeCoverage =
      totalCases === 0
        ? 0
        : Math.round((outcomeCaseIds.size / totalCases) * 100)

    const stabilizationRate =
      totalCases === 0 ? 0 : Math.round((stabilizedCases / totalCases) * 100)

    const activeWithoutRouting = cases.filter(
      (item) =>
        ACTIVE_CASE_STATUSES.includes(item.case_status) &&
        !routedCaseIds.has(item.id)
    ).length

    const routedWithoutResponder = routingActions.filter(
      (item) => !item.assigned_responder_id
    ).length

    const unresolvedInterventionPathways = cases.filter(
      (item) =>
        ACTIVE_CASE_STATUSES.includes(item.case_status) &&
        interventionCaseIds.has(item.id) &&
        !outcomeCaseIds.has(item.id)
    ).length

    const stalledCases = cases.filter(
      (item) =>
        ACTIVE_CASE_STATUSES.includes(item.case_status) &&
        outcomeCaseIds.has(item.id) &&
        item.case_status !== 'STABILIZED'
    ).length

    const activeWithoutOutcome = cases.filter(
      (item) =>
        ACTIVE_CASE_STATUSES.includes(item.case_status) &&
        !outcomeCaseIds.has(item.id)
    ).length

    const responderLoadMap: Record<string, number> = {}

    routingActions.forEach((item) => {
      const responder = item.assigned_responder_id || 'UNASSIGNED'
      responderLoadMap[responder] = (responderLoadMap[responder] || 0) + 1
    })

    const regionalLoadMap: Record<string, number> = {}

    cases.forEach((item) => {
      const region = item.region || 'Region not recorded'
      regionalLoadMap[region] = (regionalLoadMap[region] || 0) + 1
    })

    const highestResponderLoad = Math.max(...Object.values(responderLoadMap), 0)
    const highestRegionalPressure = Math.max(
      ...Object.values(regionalLoadMap),
      0
    )

    const regionalPressureItems = Object.entries(regionalLoadMap)
      .map(([label, value]) => ({
        label,
        posture: interpretRegionalPressure(value).posture,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(0, 5)

    const mappedRoutingActions = routingActions.map((item) => ({
      id: item.id,
      case_id: item.case_id,
      routing_status: item.routing_status,
      priority_level: item.routing_priority,
      routing_decision: item.routing_reason,
      responder_id: item.assigned_responder_id,
      assigned_responder_id: item.assigned_responder_id,
      institution_id: item.institution_id,
      created_at: item.created_at,
    }))

    const mappedInterventions = interventions.map((item) => ({
      id: item.id,
      case_id: item.case_id,
      intervention_type: item.intervention_type,
      intervention_status: item.intervention_status || 'PENDING',
      responder_id: item.responder_id || item.assigned_responder_id,
      assigned_responder_id: item.assigned_responder_id,
      created_at: item.created_at,
      completed_at: item.completed_at,
    }))

    const mappedOutcomes = outcomes.map((item) => ({
      id: item.id,
      case_id: item.case_id,
      outcome_status: item.outcome_status,
      stabilization_status: item.stabilization_status,
      recovery_status: item.recovery_status,
      created_at: item.created_at,
    }))

    const mappedResponders = responders.map((item) => ({
      id: item.id,
      governance_status:
        item.governance_status ||
        item.responder_status ||
        item.operational_status,
      responder_status: item.responder_status || item.operational_status,
      operational_status: item.operational_status,
      trust_score: item.trust_score,
      active_case_count: item.active_case_count,
    }))

    const continuityScores = evaluateContinuityIntelligence({
      totalCases,
      activeCases,
      routedCases,
      interventionCases: interventionCaseIds.size,
      outcomeCases: outcomeCaseIds.size,
      stabilizedCases,
      escalatedCases,
      criticalCases,
      safeguardingCases: safeguardingFlags,
      unresolvedInterventionPathways,
      routedWithoutResponder,
    })

    const pressurePropagation = evaluatePressurePropagation({
      cases,
      routingActions: mappedRoutingActions,
      interventions: mappedInterventions,
      outcomes: mappedOutcomes,
      responders: mappedResponders,
    })

    const trajectoryIntelligence = evaluateTrajectoryIntelligence({
      cases,
      routingActions: mappedRoutingActions,
      interventions: mappedInterventions,
      outcomes: mappedOutcomes,
    })

    const structuralMemory = evaluateStructuralMemory({
      cases,
      routingActions: mappedRoutingActions,
      interventions: mappedInterventions,
      outcomes: mappedOutcomes,
      responders: mappedResponders,
    })

    const predictiveStatus =
      escalatedCases >= 3 || safeguardingFlags >= 3
        ? 'HIGH_FORECAST_PRESSURE'
        : activeCases >= Math.max(stabilizedCases, 1) ||
            highestResponderLoad >= 2
          ? 'MODERATE_FORECAST_PRESSURE'
          : 'CONTROLLED_FORECAST_PRESSURE'

    const routingPressureStatus =
      routedWithoutResponder >= 3 ||
      highestResponderLoad >= 3 ||
      safeguardingFlags >= 3
        ? 'CRITICAL_ROUTING_PRESSURE'
        : highestResponderLoad >= 2 ||
            highestRegionalPressure >= 3 ||
            routedWithoutResponder >= 2
          ? 'HIGH_ROUTING_PRESSURE'
          : highestRegionalPressure >= 2 ||
              activeCases >= 2 ||
              activeWithoutRouting >= 1
            ? 'MODERATE_ROUTING_PRESSURE'
            : 'LOW_ROUTING_PRESSURE'

    const bottleneckStatus =
      highestResponderLoad >= 4 || stalledCases >= 3 || safeguardingFlags >= 3
        ? 'CRITICAL_BOTTLENECK_PRESSURE'
        : highestResponderLoad >= 2 ||
            unresolvedInterventionPathways >= 2 ||
            stalledCases >= 2
          ? 'HIGH_BOTTLENECK_PRESSURE'
          : unresolvedInterventionPathways >= 1 || safeguardingFlags >= 1
            ? 'MODERATE_BOTTLENECK_PRESSURE'
            : 'LOW_BOTTLENECK_PRESSURE'

    const recoveryStatus =
      stabilizationRate >= 70 &&
      interventionCoverage >= 70 &&
      outcomeCoverage >= 70
        ? 'RECOVERY_CONFIRMED'
        : interventionCoverage >= 50 && outcomeCoverage >= 50
          ? 'RECOVERY_IN_PROGRESS'
          : 'RECOVERY_FRAGMENTATION_RISK'

    const governanceIntegrityStatus =
      activeWithoutRouting >= 3 ||
      routedWithoutResponder >= 3 ||
      unresolvedInterventionPathways >= 3
        ? 'GOVERNANCE_GAP_CRITICAL'
        : activeWithoutRouting >= 1 ||
            routedWithoutResponder >= 1 ||
            unresolvedInterventionPathways >= 1
          ? 'GOVERNANCE_REVIEW_REQUIRED'
          : 'GOVERNANCE_TRACEABILITY_STABLE'

    const commandStatus = resolveCommandStatus({
      pressureState: pressurePropagation.pressurePropagationState,
      trajectoryState: trajectoryIntelligence.trajectoryDirection,
      memoryState: structuralMemory.structuralMemoryState,
      predictiveStatus,
      routingPressureStatus,
      bottleneckStatus,
      recoveryStatus,
      governanceIntegrityStatus,
    })

    const commandGuidance = interpretCommandStatus(commandStatus)
    const pressurePosture = interpretPressureState(
      pressurePropagation.pressurePropagationState
    )
    const trajectoryPosture = interpretTrajectoryState(
      trajectoryIntelligence.trajectoryDirection
    )
    const memoryPosture = interpretMemoryState(
      structuralMemory.structuralMemoryState
    )
    const continuityPosture = interpretContinuityState(
      continuityScores.continuityState
    )
    const recoveryPosture = interpretRecoveryStatus(recoveryStatus)
    const governancePosture = interpretGovernanceIntegrity(
      governanceIntegrityStatus
    )
    const routingPosture = interpretRoutingPressure(routingPressureStatus)
    const bottleneckPosture = interpretBottleneckStatus(bottleneckStatus)
    const predictivePosture = interpretPredictiveStatus(predictiveStatus)
    const activeCasePosture = interpretCaseLoad(activeCases)
    const safeguardingPosture = interpretSafeguarding(safeguardingFlags)
    const responderPosture = interpretResponderReadiness(activeResponders)
    const institutionPosture = interpretInstitutionReadiness(activeInstitutions)

    const executiveSummary = `${commandGuidance.meaning} ${pressurePosture.meaning} ${trajectoryPosture.meaning} ${memoryPosture.meaning}`

    const actionCue = compactAction([
      commandGuidance.action,
      pressurePosture.action,
      trajectoryPosture.action,
      memoryPosture.action,
      governancePosture.action,
    ])

    const operationalSignals: CommandSignal[] = [
      {
        label: 'Pressure Propagation',
        posture: pressurePosture.posture,
        meaning: pressurePosture.meaning,
        action: pressurePosture.action,
      },
      {
        label: 'Trajectory Direction',
        posture: trajectoryPosture.posture,
        meaning: trajectoryPosture.meaning,
        action: trajectoryPosture.action,
      },
      {
        label: 'Structural Memory',
        posture: memoryPosture.posture,
        meaning: memoryPosture.meaning,
        action: memoryPosture.action,
      },
      {
        label: 'Continuity State',
        posture: continuityPosture.posture,
        meaning: continuityPosture.meaning,
        action: continuityPosture.action,
      },
      {
        label: 'Recovery Credibility',
        posture: recoveryPosture.posture,
        meaning: recoveryPosture.meaning,
        action: recoveryPosture.action,
      },
      {
        label: 'Governance Integrity',
        posture: governancePosture.posture,
        meaning: governancePosture.meaning,
        action: governancePosture.action,
      },
    ]

    const riskZones: CommandSignal[] = [
      {
        label: 'Predictive Forecast',
        posture: predictivePosture.posture,
        meaning: predictivePosture.meaning,
        action: predictivePosture.action,
      },
      {
        label: 'Routing Ownership',
        posture: routingPosture.posture,
        meaning: routingPosture.meaning,
        action: routingPosture.action,
      },
      {
        label: 'Bottleneck Pressure',
        posture: bottleneckPosture.posture,
        meaning: bottleneckPosture.meaning,
        action: bottleneckPosture.action,
      },
      {
        label: 'Active Case Load',
        posture: activeCasePosture.posture,
        meaning: activeCasePosture.meaning,
        action: activeCasePosture.action,
      },
      {
        label: 'Safeguarding Visibility',
        posture: safeguardingPosture.posture,
        meaning: safeguardingPosture.meaning,
        action: safeguardingPosture.action,
      },
      {
        label: 'Outcome Confirmation',
        posture:
          activeWithoutOutcome > 0
            ? 'OUTCOME CONFIRMATION PENDING'
            : 'OUTCOME CONFIRMATION CONTROLLED',
        meaning:
          activeWithoutOutcome > 0
            ? 'Some active pathways still require outcome confirmation.'
            : 'Outcome confirmation is not currently showing visible command pressure.',
        action:
          activeWithoutOutcome > 0
            ? 'Strengthen outcome confirmation.'
            : 'Maintain outcome monitoring.',
      },
    ]

    return {
      commandStatus,
      commandGuidance,
      executiveSummary,
      actionCue,
      pressurePosture,
      trajectoryPosture,
      memoryPosture,
      continuityPosture,
      recoveryPosture,
      governancePosture,
      routingPosture,
      bottleneckPosture,
      predictivePosture,
      activeCasePosture,
      safeguardingPosture,
      responderPosture,
      institutionPosture,
      operationalSignals,
      riskZones,
      regionalPressureItems,
      pressurePropagation,
      trajectoryIntelligence,
      structuralMemory,
    }
  }, [cases, routingActions, interventions, outcomes, responders, institutions])

  const commandBrief = `
TSINAXA CGI CONTINUITY GOVERNANCE COMMAND BRIEF

Report Template:
${reportTemplate}

Command Focus:
${commandFocus}

Command Scope:
${commandScope}

Overall Command Posture:
${intelligence.commandGuidance.posture}

Continuity Posture:
${intelligence.continuityPosture.posture}

Pressure Propagation:
${intelligence.pressurePosture.posture}

Trajectory Direction:
${intelligence.trajectoryPosture.posture}

Structural Memory:
${intelligence.memoryPosture.posture}

Recovery Credibility:
${intelligence.recoveryPosture.posture}

Governance Integrity:
${intelligence.governancePosture.posture}

Routing Ownership:
${intelligence.routingPosture.posture}

Bottleneck Pressure:
${intelligence.bottleneckPosture.posture}

Predictive Forecast:
${intelligence.predictivePosture.posture}

Safeguarding Visibility:
${intelligence.safeguardingPosture.posture}

Responder Readiness:
${intelligence.responderPosture.posture}

Institution Readiness:
${intelligence.institutionPosture.posture}

Dominant Pressure Source:
${intelligence.pressurePropagation.dominantPressureSource}

Dominant Trajectory Signal:
${intelligence.trajectoryIntelligence.dominantTrajectorySignal}

Dominant Structural Memory Pattern:
${intelligence.structuralMemory.dominantMemoryPattern}

Executive Interpretation:
${intelligence.executiveSummary}

Recommended Command Action:
${intelligence.actionCue}

Governance-Safe Command Meaning:
This command brief consolidates continuity posture, pressure propagation, trajectory direction, structural memory, routing ownership, bottleneck pressure, recovery credibility, safeguarding visibility, governance integrity, and institutional memory into one executive command view. It supports system-level action without assigning blame to responders, institutions, beneficiaries, families, or partners.

Monitoring Note:
${intelligence.commandGuidance.action}

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • EXECUTIVE COMMAND</p>

          <h1 style={styles.title}>Continuity Governance Command Center</h1>

          <p style={styles.subtitle}>
            Executive command interpretation of continuity posture, pressure,
            trajectory, structural memory, recovery credibility, and governance
            action readiness.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Command Posture</p>

            <h2 style={styles.heroPosture}>
              {intelligence.commandGuidance.posture}
            </h2>

            <p style={styles.heroMeaning}>{intelligence.executiveSummary}</p>
          </div>

          <div style={styles.actionBox}>
            <p style={styles.actionLabel}>Recommended Action</p>
            <p style={styles.actionText}>{intelligence.actionCue}</p>
          </div>
        </section>

        <section style={styles.postureGrid}>
          <PostureCard title="Continuity" interpretation={intelligence.continuityPosture} />
          <PostureCard title="Pressure" interpretation={intelligence.pressurePosture} />
          <PostureCard title="Trajectory" interpretation={intelligence.trajectoryPosture} />
          <PostureCard title="Structural Memory" interpretation={intelligence.memoryPosture} />
          <PostureCard title="Recovery Credibility" interpretation={intelligence.recoveryPosture} />
          <PostureCard title="Governance Integrity" interpretation={intelligence.governancePosture} />
        </section>

        <section style={styles.compactGrid}>
          <CompactCard title="Predictive Forecast" value={intelligence.predictivePosture.posture} />
          <CompactCard title="Routing Ownership" value={intelligence.routingPosture.posture} />
          <CompactCard title="Bottleneck Pressure" value={intelligence.bottleneckPosture.posture} />
          <CompactCard title="Safeguarding" value={intelligence.safeguardingPosture.posture} />
        </section>

        <section style={styles.twoColumn}>
          <Panel title="Operational Command Signals">
            {intelligence.operationalSignals.map((signal) => (
              <SignalCard key={signal.label} signal={signal} />
            ))}
          </Panel>

          <Panel title="Continuity Risk Zones">
            {intelligence.riskZones.map((signal) => (
              <SignalCard key={signal.label} signal={signal} />
            ))}
          </Panel>
        </section>

        <section style={styles.twoColumn}>
          <Panel title="Readiness Context">
            <Info label="Responder Readiness" value={intelligence.responderPosture.posture} />
            <Info label="Institution Readiness" value={intelligence.institutionPosture.posture} />
            <Info
              label="Dominant Pressure"
              value={intelligence.pressurePropagation.dominantPressureSource}
            />
            <Info
              label="Dominant Trajectory"
              value={intelligence.trajectoryIntelligence.dominantTrajectorySignal}
            />
            <Info
              label="Dominant Memory"
              value={intelligence.structuralMemory.dominantMemoryPattern}
            />
          </Panel>

          <Panel title="Regional Pressure Posture">
            {intelligence.regionalPressureItems.length === 0 ? (
              <Info label="Regional Pressure" value="NO REGIONAL PRESSURE RECORDED" />
            ) : (
              intelligence.regionalPressureItems.map((item) => (
                <Info key={item.label} label={item.label} value={item.posture} />
              ))
            )}
          </Panel>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Executive Command Brief Template</h2>

          <p style={styles.cardNote}>
            Standardized command framing for institutional, NGO, district,
            ministry, or executive continuity review.
          </p>

          <Select
            label="Command Report Template"
            value={reportTemplate}
            setValue={setReportTemplate}
            options={COMMAND_REPORT_TEMPLATES}
          />

          <Select
            label="Command Focus"
            value={commandFocus}
            setValue={setCommandFocus}
            options={COMMAND_FOCUS_OPTIONS}
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
            Refresh Command Intelligence
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Generated Executive Command Brief</h2>
          <pre style={styles.summaryBox}>{commandBrief}</pre>
        </section>
      </div>
    </main>
  )
}

function resolveCommandStatus(input: {
  pressureState: string
  trajectoryState: string
  memoryState: string
  predictiveStatus: string
  routingPressureStatus: string
  bottleneckStatus: string
  recoveryStatus: string
  governanceIntegrityStatus: string
}) {
  if (
    input.pressureState === 'CASCADE_RISK' ||
    input.trajectoryState === 'COLLAPSE_RISK' ||
    input.memoryState === 'SYSTEMIC_MEMORY_RISK' ||
    input.routingPressureStatus === 'CRITICAL_ROUTING_PRESSURE' ||
    input.bottleneckStatus === 'CRITICAL_BOTTLENECK_PRESSURE' ||
    input.governanceIntegrityStatus === 'GOVERNANCE_GAP_CRITICAL'
  ) {
    return 'CRITICAL_COMMAND_STATUS'
  }

  if (
    input.pressureState === 'SPREADING' ||
    input.trajectoryState === 'DETERIORATING' ||
    input.memoryState === 'STRUCTURAL_FRAGILITY' ||
    input.predictiveStatus === 'HIGH_FORECAST_PRESSURE' ||
    input.recoveryStatus === 'RECOVERY_FRAGMENTATION_RISK'
  ) {
    return 'ELEVATED_COMMAND_STATUS'
  }

  if (
    input.pressureState === 'BUILDING' ||
    input.trajectoryState === 'DRIFTING' ||
    input.memoryState === 'RECURRING_PATTERN' ||
    input.routingPressureStatus === 'MODERATE_ROUTING_PRESSURE' ||
    input.bottleneckStatus === 'MODERATE_BOTTLENECK_PRESSURE' ||
    input.governanceIntegrityStatus === 'GOVERNANCE_REVIEW_REQUIRED'
  ) {
    return 'WATCH_COMMAND_STATUS'
  }

  return 'STABLE_COMMAND_STATUS'
}

function interpretCommandStatus(status: string): Interpretation {
  if (status === 'CRITICAL_COMMAND_STATUS') {
    return {
      posture: 'CRITICAL COMMAND REVIEW',
      meaning:
        'Continuity pressure may be threatening institutional stability and requires immediate executive visibility.',
      action:
        'Activate command review and verify pressure, trajectory, memory, recovery, and governance ownership.',
    }
  }

  if (status === 'ELEVATED_COMMAND_STATUS') {
    return {
      posture: 'ELEVATED COMMAND REVIEW',
      meaning:
        'Multiple command signals require coordinated leadership review before instability spreads.',
      action:
        'Prioritize executive review and strengthen ownership across pressure, routing, recovery, and governance.',
    }
  }

  if (status === 'WATCH_COMMAND_STATUS') {
    return {
      posture: 'COMMAND WATCH',
      meaning:
        'Early continuity pressure is visible and should remain under executive watch.',
      action:
        'Review active pathways, recurrence signals, routing ownership, and recovery credibility.',
    }
  }

  return {
    posture: 'COMMAND STABLE',
    meaning:
      'Continuity signals are currently controlled, but monitoring must remain active.',
    action:
      'Maintain command monitoring and preserve continuity memory.',
  }
}

function interpretPressureState(state: string): Interpretation {
  if (state === 'CASCADE_RISK') {
    return {
      posture: 'PRESSURE CASCADE RISK',
      meaning: 'Pressure may be spreading beyond containment.',
      action: 'Activate pressure containment review.',
    }
  }

  if (state === 'SPREADING') {
    return {
      posture: 'PRESSURE SPREADING',
      meaning: 'Pressure is moving across operational pathways.',
      action: 'Review spread points and rebalance ownership.',
    }
  }

  if (state === 'BUILDING') {
    return {
      posture: 'PRESSURE BUILDING',
      meaning: 'Pressure buildup is visible and requires watch.',
      action: 'Increase pressure monitoring.',
    }
  }

  return {
    posture: 'PRESSURE CONTAINED',
    meaning: 'Pressure appears contained in the current command view.',
    action: 'Maintain pressure monitoring.',
  }
}

function interpretTrajectoryState(state: string): Interpretation {
  if (state === 'COLLAPSE_RISK') {
    return {
      posture: 'TRAJECTORY COLLAPSE RISK',
      meaning: 'Trajectory may be moving toward system-level instability.',
      action: 'Activate trajectory escalation review.',
    }
  }

  if (state === 'DETERIORATING') {
    return {
      posture: 'TRAJECTORY DETERIORATING',
      meaning: 'Continuity direction is weakening.',
      action: 'Review drift, recovery, and stabilization movement.',
    }
  }

  if (state === 'DRIFTING') {
    return {
      posture: 'TRAJECTORY DRIFTING',
      meaning: 'Trajectory has not collapsed, but direction is not yet reliable.',
      action: 'Strengthen monitoring and recovery ownership.',
    }
  }

  return {
    posture: 'TRAJECTORY HOLDING',
    meaning: 'Trajectory is currently holding.',
    action: 'Maintain trajectory monitoring.',
  }
}

function interpretMemoryState(state: string): Interpretation {
  if (state === 'SYSTEMIC_MEMORY_RISK') {
    return {
      posture: 'SYSTEMIC MEMORY RISK',
      meaning: 'Recurring instability may be becoming systemic.',
      action: 'Escalate structural memory review.',
    }
  }

  if (state === 'STRUCTURAL_FRAGILITY') {
    return {
      posture: 'STRUCTURAL FRAGILITY',
      meaning: 'Repeated patterns suggest institutional fragility.',
      action: 'Review recurrence corridors.',
    }
  }

  if (state === 'RECURRING_PATTERN') {
    return {
      posture: 'RECURRING PATTERN VISIBLE',
      meaning: 'Repeated instability remains visible.',
      action: 'Keep recurrence under governance review.',
    }
  }

  return {
    posture: 'MEMORY CONTAINED',
    meaning: 'Structural memory risk is currently contained.',
    action: 'Maintain continuity memory.',
  }
}

function interpretContinuityState(state: string): Interpretation {
  if (state === 'UNSTABLE') {
    return {
      posture: 'CONTINUITY UNSTABLE',
      meaning: 'Continuity is not credible enough for closure.',
      action: 'Escalate continuity review.',
    }
  }

  if (state === 'STRAINED') {
    return {
      posture: 'CONTINUITY STRAINED',
      meaning: 'Continuity pressure remains visible.',
      action: 'Keep continuity under review.',
    }
  }

  return {
    posture: 'CONTINUITY HOLDING',
    meaning: 'Continuity is currently holding.',
    action: 'Maintain continuity monitoring.',
  }
}

function interpretRecoveryStatus(status: string): Interpretation {
  if (status === 'RECOVERY_CONFIRMED') {
    return {
      posture: 'RECOVERY CREDIBLE',
      meaning: 'Recovery evidence appears strong enough to support confidence.',
      action: 'Maintain recovery monitoring.',
    }
  }

  if (status === 'RECOVERY_IN_PROGRESS') {
    return {
      posture: 'RECOVERY IN PROGRESS',
      meaning: 'Recovery movement exists but still needs confirmation.',
      action: 'Strengthen outcome confirmation.',
    }
  }

  return {
    posture: 'RECOVERY FRAGMENTED',
    meaning: 'Recovery evidence is incomplete or fragmented.',
    action: 'Review unresolved recovery pathways.',
  }
}

function interpretGovernanceIntegrity(status: string): Interpretation {
  if (status === 'GOVERNANCE_GAP_CRITICAL') {
    return {
      posture: 'GOVERNANCE GAP CRITICAL',
      meaning: 'Traceability gaps may threaten accountability and institutional memory.',
      action: 'Escalate governance evidence review.',
    }
  }

  if (status === 'GOVERNANCE_REVIEW_REQUIRED') {
    return {
      posture: 'GOVERNANCE REVIEW REQUIRED',
      meaning: 'Some continuity records require governance review.',
      action: 'Review incomplete pathways.',
    }
  }

  return {
    posture: 'GOVERNANCE TRACEABILITY STABLE',
    meaning: 'Routing, intervention, and outcome traceability appears stable.',
    action: 'Maintain audit discipline.',
  }
}

function interpretPredictiveStatus(status: string): Interpretation {
  if (status === 'HIGH_FORECAST_PRESSURE') {
    return {
      posture: 'FORECAST PRESSURE HIGH',
      meaning: 'Forecast pressure suggests near-term command attention is needed.',
      action: 'Review predictive pressure drivers.',
    }
  }

  if (status === 'MODERATE_FORECAST_PRESSURE') {
    return {
      posture: 'FORECAST UNDER WATCH',
      meaning: 'Forecast pressure is visible and should remain under watch.',
      action: 'Compare upcoming continuity movement.',
    }
  }

  return {
    posture: 'FORECAST CONTROLLED',
    meaning: 'Forecast pressure is currently controlled.',
    action: 'Maintain predictive monitoring.',
  }
}

function interpretRoutingPressure(status: string): Interpretation {
  if (status === 'CRITICAL_ROUTING_PRESSURE') {
    return {
      posture: 'ROUTING PRESSURE CRITICAL',
      meaning: 'Routing ownership pressure may threaten continuity.',
      action: 'Escalate routing ownership review.',
    }
  }

  if (status === 'HIGH_ROUTING_PRESSURE') {
    return {
      posture: 'ROUTING PRESSURE HIGH',
      meaning: 'Routing pressure is elevated.',
      action: 'Rebalance routing ownership.',
    }
  }

  if (status === 'MODERATE_ROUTING_PRESSURE') {
    return {
      posture: 'ROUTING PRESSURE VISIBLE',
      meaning: 'Routing pressure remains visible.',
      action: 'Keep routing under review.',
    }
  }

  return {
    posture: 'ROUTING PRESSURE CONTAINED',
    meaning: 'Routing pressure is currently contained.',
    action: 'Maintain routing traceability.',
  }
}

function interpretBottleneckStatus(status: string): Interpretation {
  if (status === 'CRITICAL_BOTTLENECK_PRESSURE') {
    return {
      posture: 'BOTTLENECK CRITICAL',
      meaning: 'Bottleneck pressure may be blocking stabilization.',
      action: 'Escalate bottleneck review.',
    }
  }

  if (status === 'HIGH_BOTTLENECK_PRESSURE') {
    return {
      posture: 'BOTTLENECK PRESSURE HIGH',
      meaning: 'Bottleneck pressure is elevated.',
      action: 'Review stuck pathways.',
    }
  }

  if (status === 'MODERATE_BOTTLENECK_PRESSURE') {
    return {
      posture: 'BOTTLENECK VISIBLE',
      meaning: 'Bottleneck pressure remains visible.',
      action: 'Keep bottlenecks under review.',
    }
  }

  return {
    posture: 'BOTTLENECK CONTAINED',
    meaning: 'Bottleneck pressure is currently contained.',
    action: 'Maintain pathway monitoring.',
  }
}

function interpretCaseLoad(value: number): Interpretation {
  if (value >= 10) {
    return {
      posture: 'CASE LOAD HEAVY',
      meaning: 'Active continuity load is heavy.',
      action: 'Review case distribution.',
    }
  }

  if (value >= 3) {
    return {
      posture: 'CASE LOAD VISIBLE',
      meaning: 'Active continuity load is visible.',
      action: 'Maintain active case monitoring.',
    }
  }

  return {
    posture: 'CASE LOAD CONTAINED',
    meaning: 'Active continuity load appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretSafeguarding(value: number): Interpretation {
  if (value > 0) {
    return {
      posture: 'SAFEGUARDING VISIBILITY ACTIVE',
      meaning: 'Safeguarding visibility is active and must remain protected.',
      action: 'Maintain executive safeguarding visibility.',
    }
  }

  return {
    posture: 'NO ACTIVE SAFEGUARDING FLAG',
    meaning: 'No active safeguarding flag is visible in the current command view.',
    action: 'Maintain safeguarding monitoring.',
  }
}

function interpretResponderReadiness(value: number): Interpretation {
  if (value >= 3) {
    return {
      posture: 'RESPONDER READINESS ACTIVE',
      meaning: 'Responder readiness is visible.',
      action: 'Maintain responder governance.',
    }
  }

  if (value > 0) {
    return {
      posture: 'RESPONDER READINESS LIMITED',
      meaning: 'Responder readiness exists but remains limited.',
      action: 'Review responder coverage.',
    }
  }

  return {
    posture: 'RESPONDER READINESS NOT VISIBLE',
    meaning: 'No active responder readiness is visible.',
    action: 'Review responder registry and activation.',
  }
}

function interpretInstitutionReadiness(value: number): Interpretation {
  if (value > 0) {
    return {
      posture: 'INSTITUTION READINESS ACTIVE',
      meaning: 'Institution coordination readiness is visible.',
      action: 'Maintain institutional coordination.',
    }
  }

  return {
    posture: 'INSTITUTION READINESS NOT VISIBLE',
    meaning: 'No active institution readiness is visible.',
    action: 'Review institution activation.',
  }
}

function interpretRegionalPressure(value: number): Interpretation {
  if (value >= 5) {
    return {
      posture: 'REGIONAL PRESSURE HEAVY',
      meaning: 'Regional pressure concentration is heavy.',
      action: 'Review regional load.',
    }
  }

  if (value >= 2) {
    return {
      posture: 'REGIONAL PRESSURE VISIBLE',
      meaning: 'Regional pressure concentration is visible.',
      action: 'Keep region under review.',
    }
  }

  return {
    posture: 'REGIONAL PRESSURE CONTAINED',
    meaning: 'Regional pressure appears contained.',
    action: 'Maintain monitoring.',
  }
}

function compactAction(actions: string[]) {
  return Array.from(new Set(actions)).join(' ')
}

function PostureCard({
  title,
  interpretation,
}: {
  title: string
  interpretation: Interpretation
}) {
  return (
    <article style={styles.postureCard}>
      <p style={styles.cardKicker}>{title}</p>
      <h3 style={styles.postureTitle}>{interpretation.posture}</h3>
      <p style={styles.postureMeaning}>{interpretation.meaning}</p>
    </article>
  )
}

function CompactCard({ title, value }: { title: string; value: string }) {
  return (
    <article style={styles.compactCard}>
      <p style={styles.cardKicker}>{title}</p>
      <h3 style={styles.compactValue}>{value}</h3>
    </article>
  )
}

function Panel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>{title}</h2>
      <div style={styles.infoList}>{children}</div>
    </section>
  )
}

function SignalCard({ signal }: { signal: CommandSignal }) {
  return (
    <article style={styles.signalCard}>
      <p style={styles.cardKicker}>{signal.label}</p>
      <h3 style={styles.signalStatus}>{signal.posture}</h3>
      <p style={styles.signalText}>{signal.meaning}</p>
      <p style={styles.signalAction}>{signal.action}</p>
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
    fontSize: 'clamp(32px, 5vw, 48px)',
    lineHeight: 1.05,
    margin: '10px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '760px',
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
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 0.6fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #22d3ee',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
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
  postureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  postureCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
    boxSizing: 'border-box',
  },
  cardKicker: {
    color: '#94a3b8',
    fontWeight: 800,
    margin: 0,
    fontSize: '12px',
  },
  postureTitle: {
    color: '#f8fafc',
    fontSize: '19px',
    margin: '10px 0 8px',
    lineHeight: 1.15,
  },
  postureMeaning: {
    color: '#cbd5e1',
    lineHeight: 1.5,
    fontSize: '14px',
    margin: 0,
  },
  compactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  compactCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '104px',
    boxSizing: 'border-box',
  },
  compactValue: {
    fontSize: '18px',
    lineHeight: 1.2,
    margin: '10px 0 0',
    color: '#f8fafc',
    overflowWrap: 'anywhere',
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '16px',
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
    fontSize: '22px',
    margin: 0,
    lineHeight: 1.2,
  },
  cardNote: {
    color: '#94a3b8',
    lineHeight: 1.5,
    margin: '8px 0 18px',
    fontSize: '14px',
  },
  infoList: {
    display: 'grid',
    gap: '10px',
    marginTop: '14px',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '160px minmax(0, 1fr)',
    gap: '12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '12px',
    alignItems: 'start',
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
  signalCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '14px',
  },
  signalStatus: {
    color: '#67e8f9',
    fontSize: '17px',
    margin: '8px 0',
    lineHeight: 1.2,
    overflowWrap: 'anywhere',
  },
  signalText: {
    color: '#cbd5e1',
    lineHeight: 1.5,
    margin: '0 0 8px',
    fontSize: '14px',
  },
  signalAction: {
    color: '#bbf7d0',
    lineHeight: 1.45,
    margin: 0,
    fontWeight: 800,
    fontSize: '14px',
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