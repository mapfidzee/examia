'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { evaluateContinuityIntelligence } from '../lib/continuityIntelligence'
import { evaluatePressurePropagation } from '../lib/pressurePropagation'
import { evaluateTrajectoryIntelligence } from '../lib/trajectoryIntelligence'
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

type CommandSignal = {
  label: string
  status: string
  interpretation: string
  action: string
}

type PressureItem = {
  label: string
  value: number
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
]

const COMMAND_FOCUS_OPTIONS = [
  'Overall continuity command view',
  'Operational disruption visibility',
  'Pressure propagation visibility',
  'Trajectory direction visibility',
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

function getCommandGuidance(status: string) {
  if (status === 'STABLE_COMMAND_STATUS') {
    return {
      interpretation:
        'Operational continuity appears controlled. Continue monitoring unresolved pathways, recovery movement, pressure propagation, trajectory direction, and governance integrity.',
      action:
        'Maintain standard continuity monitoring and continue routine coordination review.',
      monitoring: 'Stable command monitoring remains active.',
    }
  }

  if (status === 'WATCH_COMMAND_STATUS') {
    return {
      interpretation:
        'Early continuity pressure is visible. Leaders should monitor routing pressure, recovery movement, pressure propagation, trajectory drift, unresolved pathways, and safeguarding signals.',
      action:
        'Review active pathways, responder distribution, stabilization conversion, propagation signals, and trajectory movement before pressure increases.',
      monitoring: 'Watch-level command monitoring remains active.',
    }
  }

  if (status === 'ELEVATED_COMMAND_STATUS') {
    return {
      interpretation:
        'Multiple continuity pressure signals are visible. Routing concentration, pressure spread, trajectory weakness, recovery weakness, bottlenecks, or safeguarding pressure may require coordinated action.',
      action:
        'Prioritize command review, rebalance responder load, inspect propagation sources, review trajectory drift, strengthen recovery pathways, and verify governance traceability.',
      monitoring: 'Elevated command monitoring remains active.',
    }
  }

  return {
    interpretation:
      'Critical continuity pressure is visible. Unresolved disruption, pressure propagation, trajectory deterioration, recovery weakness, safeguarding pressure, or bottlenecks may be threatening institutional stability.',
    action:
      'Activate governance escalation, redistribute stabilization load, review stuck pathways, inspect propagation corridors, verify trajectory direction, and confirm recovery ownership.',
    monitoring: 'Critical command escalation monitoring is active.',
  }
}

export default function CommandCenterPage() {
  return (
    <GovernanceRouteGuard allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}>
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

  const [reportTemplate, setReportTemplate] = useState(COMMAND_REPORT_TEMPLATES[0])
  const [commandFocus, setCommandFocus] = useState(COMMAND_FOCUS_OPTIONS[0])
  const [commandScope, setCommandScope] = useState(COMMAND_SCOPE_OPTIONS[0])
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
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
    setMessage('Executive command intelligence refreshed.')
  }

  const intelligence = useMemo(() => {
    const totalCases = cases.length

    const activeCases = cases.filter((item) =>
      ACTIVE_CASE_STATUSES.includes(item.case_status),
    ).length

    const routedCases = cases.filter((item) =>
      ['ROUTED', 'RESPONDER_ASSIGNED'].includes(item.case_status),
    ).length

    const stabilizedCases = cases.filter((item) => item.case_status === 'STABILIZED').length
    const escalatedCases = cases.filter((item) => item.case_status === 'ESCALATED').length
    const criticalCases = cases.filter((item) => item.severity_level === 'CRITICAL').length
    const safeguardingFlags = cases.filter((item) => item.safeguarding_flag).length

    const activeResponders = responders.filter((item) =>
      ['ACTIVE', 'VERIFIED'].includes(
        String(
          item.governance_status ||
            item.responder_status ||
            item.operational_status ||
            '',
        ).toUpperCase(),
      ),
    ).length

    const activeInstitutions = institutions.filter(
      (item) => item.coordination_status === 'ACTIVE',
    ).length

    const outcomeCaseIds = new Set(outcomes.map((item) => item.case_id))
    const interventionCaseIds = new Set(interventions.map((item) => item.case_id))
    const routedCaseIds = new Set(routingActions.map((item) => item.case_id))

    const uniqueInterventionCases = interventionCaseIds.size
    const uniqueOutcomeCases = outcomeCaseIds.size

    const interventionCoverage =
      totalCases === 0 ? 0 : Math.round((uniqueInterventionCases / totalCases) * 100)

    const outcomeCoverage =
      totalCases === 0 ? 0 : Math.round((uniqueOutcomeCases / totalCases) * 100)

    const stabilizationRate =
      totalCases === 0 ? 0 : Math.round((stabilizedCases / totalCases) * 100)

    const activeWithoutRouting = cases.filter(
      (item) => ACTIVE_CASE_STATUSES.includes(item.case_status) && !routedCaseIds.has(item.id),
    ).length

    const routedWithoutResponder = routingActions.filter(
      (item) => !item.assigned_responder_id,
    ).length

    const unresolvedInterventionPathways = cases.filter(
      (item) =>
        ACTIVE_CASE_STATUSES.includes(item.case_status) &&
        interventionCaseIds.has(item.id) &&
        !outcomeCaseIds.has(item.id),
    ).length

    const stalledCases = cases.filter(
      (item) =>
        ACTIVE_CASE_STATUSES.includes(item.case_status) &&
        outcomeCaseIds.has(item.id) &&
        item.case_status !== 'STABILIZED',
    ).length

    const activeWithoutOutcome = cases.filter(
      (item) => ACTIVE_CASE_STATUSES.includes(item.case_status) && !outcomeCaseIds.has(item.id),
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
    const highestRegionalPressure = Math.max(...Object.values(regionalLoadMap), 0)

    const regionalPressureItems = Object.entries(regionalLoadMap)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
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

    const continuityScores = evaluateContinuityIntelligence({
      totalCases,
      activeCases,
      routedCases,
      interventionCases: uniqueInterventionCases,
      outcomeCases: uniqueOutcomeCases,
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
      responders: responders.map((item) => ({
        id: item.id,
        governance_status:
          item.governance_status || item.responder_status || item.operational_status,
        responder_status: item.responder_status || item.operational_status,
        trust_score: item.trust_score,
        active_case_count: item.active_case_count,
      })),
    })

    const trajectoryIntelligence = evaluateTrajectoryIntelligence({
      cases,
      routingActions: mappedRoutingActions,
      interventions: mappedInterventions,
      outcomes: mappedOutcomes,
    })

    const predictiveStatus =
      escalatedCases >= 3 || safeguardingFlags >= 3
        ? 'HIGH_FORECAST_PRESSURE'
        : activeCases >= Math.max(stabilizedCases, 1) || highestResponderLoad >= 2
          ? 'MODERATE_FORECAST_PRESSURE'
          : 'CONTROLLED_FORECAST_PRESSURE'

    const routingPressureStatus =
      routedWithoutResponder >= 3 || highestResponderLoad >= 3 || safeguardingFlags >= 3
        ? 'CRITICAL_ROUTING_PRESSURE'
        : highestResponderLoad >= 2 || highestRegionalPressure >= 3 || routedWithoutResponder >= 2
          ? 'HIGH_ROUTING_PRESSURE'
          : highestRegionalPressure >= 2 || activeCases >= 2 || activeWithoutRouting >= 1
            ? 'MODERATE_ROUTING_PRESSURE'
            : 'LOW_ROUTING_PRESSURE'

    const bottleneckStatus =
      highestResponderLoad >= 4 || stalledCases >= 3 || safeguardingFlags >= 3
        ? 'CRITICAL_BOTTLENECK_PRESSURE'
        : highestResponderLoad >= 2 || unresolvedInterventionPathways >= 2 || stalledCases >= 2
          ? 'HIGH_BOTTLENECK_PRESSURE'
          : unresolvedInterventionPathways >= 1 || safeguardingFlags >= 1
            ? 'MODERATE_BOTTLENECK_PRESSURE'
            : 'LOW_BOTTLENECK_PRESSURE'

    const recoveryStatus =
      stabilizationRate >= 70 && interventionCoverage >= 70 && outcomeCoverage >= 70
        ? 'RECOVERY_CONFIRMED'
        : interventionCoverage >= 50 && outcomeCoverage >= 50
          ? 'RECOVERY_IN_PROGRESS'
          : 'RECOVERY_FRAGMENTATION_RISK'

    const governanceIntegrityStatus =
      activeWithoutRouting >= 3 || routedWithoutResponder >= 3 || unresolvedInterventionPathways >= 3
        ? 'GOVERNANCE_GAP_CRITICAL'
        : activeWithoutRouting >= 1 || routedWithoutResponder >= 1 || unresolvedInterventionPathways >= 1
          ? 'GOVERNANCE_REVIEW_REQUIRED'
          : 'GOVERNANCE_TRACEABILITY_STABLE'

    const reliabilityScore = continuityScores.recoveryReliabilityScore

    const pressureRiskPoints =
      pressurePropagation.pressurePropagationState === 'CASCADE_RISK'
        ? 4
        : pressurePropagation.pressurePropagationState === 'SPREADING'
          ? 3
          : pressurePropagation.pressurePropagationState === 'BUILDING'
            ? 1
            : 0

    const trajectoryRiskPoints =
      trajectoryIntelligence.trajectoryDirection === 'COLLAPSE_RISK'
        ? 4
        : trajectoryIntelligence.trajectoryDirection === 'DETERIORATING'
          ? 3
          : trajectoryIntelligence.trajectoryDirection === 'DRIFTING'
            ? 2
            : trajectoryIntelligence.trajectoryDirection === 'STABILIZING'
              ? 1
              : 0

    const riskPoints =
      pressureRiskPoints +
      trajectoryRiskPoints +
      (predictiveStatus === 'HIGH_FORECAST_PRESSURE'
        ? 3
        : predictiveStatus === 'MODERATE_FORECAST_PRESSURE'
          ? 2
          : 0) +
      (routingPressureStatus === 'CRITICAL_ROUTING_PRESSURE'
        ? 3
        : routingPressureStatus === 'HIGH_ROUTING_PRESSURE'
          ? 2
          : routingPressureStatus === 'MODERATE_ROUTING_PRESSURE'
            ? 1
            : 0) +
      (bottleneckStatus === 'CRITICAL_BOTTLENECK_PRESSURE'
        ? 3
        : bottleneckStatus === 'HIGH_BOTTLENECK_PRESSURE'
          ? 2
          : bottleneckStatus === 'MODERATE_BOTTLENECK_PRESSURE'
            ? 1
            : 0) +
      (recoveryStatus === 'RECOVERY_FRAGMENTATION_RISK'
        ? 2
        : recoveryStatus === 'RECOVERY_IN_PROGRESS'
          ? 1
          : 0) +
      (governanceIntegrityStatus === 'GOVERNANCE_GAP_CRITICAL'
        ? 3
        : governanceIntegrityStatus === 'GOVERNANCE_REVIEW_REQUIRED'
          ? 1
          : 0)

    const commandStatus =
      riskPoints >= 14
        ? 'CRITICAL_COMMAND_STATUS'
        : riskPoints >= 9
          ? 'ELEVATED_COMMAND_STATUS'
          : riskPoints >= 3
            ? 'WATCH_COMMAND_STATUS'
            : 'STABLE_COMMAND_STATUS'

    const operationalSignals: CommandSignal[] = [
      {
        label: 'Pressure Propagation',
        status: pressurePropagation.pressurePropagationState,
        interpretation: pressurePropagation.executiveSummary,
        action: pressurePropagation.actionCue,
      },
      {
        label: 'Trajectory Intelligence',
        status: trajectoryIntelligence.trajectoryDirection,
        interpretation: trajectoryIntelligence.executiveSummary,
        action: trajectoryIntelligence.actionCue,
      },
      {
        label: 'Continuity State',
        status: continuityScores.continuityState,
        interpretation:
          'Continuity intelligence separates activity from stabilization confidence, recovery reliability, escalation pressure, and survivability.',
        action:
          continuityScores.operationalSurvivabilityScore < 60
            ? 'Review continuity integrity, unresolved pathways, and survivability risk.'
            : 'Maintain continuity monitoring and verify recovery durability.',
      },
      {
        label: 'Operational Stability',
        status: commandStatus,
        interpretation:
          commandStatus === 'STABLE_COMMAND_STATUS'
            ? 'Continuity signals are currently controlled.'
            : commandStatus === 'WATCH_COMMAND_STATUS'
              ? 'Early continuity pressure is visible.'
              : commandStatus === 'ELEVATED_COMMAND_STATUS'
                ? 'Multiple operational pressure points need leadership review.'
                : 'Continuity may be under critical pressure.',
        action:
          commandStatus === 'STABLE_COMMAND_STATUS'
            ? 'Maintain monitoring.'
            : commandStatus === 'WATCH_COMMAND_STATUS'
              ? 'Review active pathways.'
              : commandStatus === 'ELEVATED_COMMAND_STATUS'
                ? 'Coordinate command review.'
                : 'Activate escalation governance.',
      },
      {
        label: 'Recovery Status',
        status: recoveryStatus,
        interpretation:
          recoveryStatus === 'RECOVERY_CONFIRMED'
            ? 'Recovery evidence appears strong across intervention and outcome coverage.'
            : recoveryStatus === 'RECOVERY_IN_PROGRESS'
              ? 'Recovery movement exists but needs continued confirmation.'
              : 'Recovery evidence is fragmented or incomplete.',
        action:
          recoveryStatus === 'RECOVERY_CONFIRMED'
            ? 'Preserve recovery monitoring.'
            : recoveryStatus === 'RECOVERY_IN_PROGRESS'
              ? 'Strengthen outcome confirmation.'
              : 'Review unresolved recovery pathways.',
      },
      {
        label: 'Governance Integrity',
        status: governanceIntegrityStatus,
        interpretation:
          governanceIntegrityStatus === 'GOVERNANCE_TRACEABILITY_STABLE'
            ? 'Routing, intervention, and outcome traceability appears stable.'
            : governanceIntegrityStatus === 'GOVERNANCE_REVIEW_REQUIRED'
              ? 'Some continuity records may require governance review.'
              : 'Traceability gaps may threaten accountability and institutional memory.',
        action:
          governanceIntegrityStatus === 'GOVERNANCE_TRACEABILITY_STABLE'
            ? 'Maintain audit discipline.'
            : governanceIntegrityStatus === 'GOVERNANCE_REVIEW_REQUIRED'
              ? 'Review incomplete pathways.'
              : 'Escalate governance gap review.',
      },
    ]

    return {
      totalCases,
      activeCases,
      routedCases,
      stabilizedCases,
      escalatedCases,
      criticalCases,
      safeguardingFlags,
      activeResponders,
      activeInstitutions,
      interventionCoverage,
      outcomeCoverage,
      stabilizationRate,
      highestResponderLoad,
      highestRegionalPressure,
      unresolvedInterventionPathways,
      stalledCases,
      activeWithoutRouting,
      activeWithoutOutcome,
      routedWithoutResponder,
      predictiveStatus,
      routingPressureStatus,
      bottleneckStatus,
      recoveryStatus,
      governanceIntegrityStatus,
      reliabilityScore,
      commandStatus,
      regionalPressureItems,
      operationalSignals,
      continuityScores,
      pressurePropagation,
      trajectoryIntelligence,
    }
  }, [cases, routingActions, interventions, outcomes, responders, institutions])

  const commandGuidance = getCommandGuidance(intelligence.commandStatus)

  const continuityRiskZones: CommandSignal[] = [
    {
      label: 'Dominant Pressure Source',
      status: intelligence.pressurePropagation.dominantPressureSource,
      interpretation: `The leading pressure source is ${intelligence.pressurePropagation.dominantPressureSource}.`,
      action: intelligence.pressurePropagation.actionCue,
    },
    {
      label: 'Dominant Trajectory Signal',
      status: intelligence.trajectoryIntelligence.dominantTrajectorySignal,
      interpretation: `The leading trajectory signal is ${intelligence.trajectoryIntelligence.dominantTrajectorySignal}.`,
      action: intelligence.trajectoryIntelligence.actionCue,
    },
    {
      label: 'Unresolved Intervention Pathways',
      status: intelligence.unresolvedInterventionPathways > 0 ? 'REVIEW_REQUIRED' : 'CONTROLLED',
      interpretation: `${intelligence.unresolvedInterventionPathways} active pathway(s) have intervention records without confirmed outcome closure.`,
      action:
        intelligence.unresolvedInterventionPathways > 0
          ? 'Review intervention-to-outcome movement.'
          : 'Maintain routine monitoring.',
    },
    {
      label: 'Routed Without Responder',
      status: intelligence.routedWithoutResponder > 0 ? 'ROUTING_OWNERSHIP_GAP' : 'CONTROLLED',
      interpretation: `${intelligence.routedWithoutResponder} routing action(s) do not yet show responder ownership.`,
      action:
        intelligence.routedWithoutResponder > 0
          ? 'Assign or verify responder ownership.'
          : 'Maintain routing traceability.',
    },
    {
      label: 'Active Without Outcome',
      status: intelligence.activeWithoutOutcome > 0 ? 'RECOVERY_CONFIRMATION_PENDING' : 'CONTROLLED',
      interpretation: `${intelligence.activeWithoutOutcome} active case(s) still require outcome confirmation.`,
      action:
        intelligence.activeWithoutOutcome > 0
          ? 'Strengthen recovery confirmation.'
          : 'Continue outcome monitoring.',
    },
  ]

  const commandBrief = `
TSINAXA CGI CONTINUITY GOVERNANCE COMMAND BRIEF

Report Template:
${reportTemplate}

Command Focus:
${commandFocus}

Command Scope:
${commandScope}

Overall Command Status:
${intelligence.commandStatus}

Continuity State:
${intelligence.continuityScores.continuityState}

Pressure Propagation State:
${intelligence.pressurePropagation.pressurePropagationState}

Trajectory Direction:
${intelligence.trajectoryIntelligence.trajectoryDirection}

Pressure Propagation Severity:
${intelligence.pressurePropagation.severity}

Trajectory Severity:
${intelligence.trajectoryIntelligence.severity}

Dominant Pressure Source:
${intelligence.pressurePropagation.dominantPressureSource}

Dominant Trajectory Signal:
${intelligence.trajectoryIntelligence.dominantTrajectorySignal}

Core Command Metrics:
Total Cases: ${intelligence.totalCases}
Active Continuity Cases: ${intelligence.activeCases}
Routed Cases: ${intelligence.routedCases}
Stabilized Cases: ${intelligence.stabilizedCases}
Escalated Cases: ${intelligence.escalatedCases}
Critical Cases: ${intelligence.criticalCases}
Safeguarding Flags: ${intelligence.safeguardingFlags}
Active Responders: ${intelligence.activeResponders}
Active Coordination Sites: ${intelligence.activeInstitutions}
Intervention Coverage: ${intelligence.interventionCoverage}%
Outcome Coverage: ${intelligence.outcomeCoverage}%
Stabilization Rate: ${intelligence.stabilizationRate}%
Reliability Score: ${intelligence.reliabilityScore}/100

Continuity Intelligence Scores:
Continuity Integrity Score: ${intelligence.continuityScores.continuityIntegrityScore}/100
Stabilization Confidence Score: ${intelligence.continuityScores.stabilizationConfidenceScore}/100
Escalation Pressure Index: ${intelligence.continuityScores.escalationPressureIndex}/100
Recovery Reliability Score: ${intelligence.continuityScores.recoveryReliabilityScore}/100
Operational Survivability Score: ${intelligence.continuityScores.operationalSurvivabilityScore}/100

Pressure Propagation Intelligence:
Propagation Risk: ${intelligence.pressurePropagation.propagationRisk}/100
Routing Friction: ${intelligence.pressurePropagation.routingFriction}/100
Responder Pressure: ${intelligence.pressurePropagation.responderPressure}/100
Escalation Velocity: ${intelligence.pressurePropagation.escalationVelocity}/100
Coordination Instability: ${intelligence.pressurePropagation.coordinationInstability}/100
Stabilization Drag: ${intelligence.pressurePropagation.stabilizationDrag}/100

Trajectory Intelligence:
Trajectory Risk: ${intelligence.trajectoryIntelligence.trajectoryRisk}/100
Continuity Drift: ${intelligence.trajectoryIntelligence.continuityDrift}/100
Escalation Momentum: ${intelligence.trajectoryIntelligence.escalationMomentum}/100
Recovery Direction: ${intelligence.trajectoryIntelligence.recoveryDirection}/100
Stabilization Trend: ${intelligence.trajectoryIntelligence.stabilizationTrend}/100
Unresolved Momentum: ${intelligence.trajectoryIntelligence.unresolvedMomentum}/100

Executive Command Signals:
Predictive Status: ${intelligence.predictiveStatus}
Routing Pressure Status: ${intelligence.routingPressureStatus}
Bottleneck Status: ${intelligence.bottleneckStatus}
Recovery Status: ${intelligence.recoveryStatus}
Governance Integrity Status: ${intelligence.governanceIntegrityStatus}

Continuity Risk Zones:
Highest Responder Load: ${intelligence.highestResponderLoad}
Highest Regional Pressure: ${intelligence.highestRegionalPressure}
Unresolved Intervention Pathways: ${intelligence.unresolvedInterventionPathways}
Routed Without Responder Ownership: ${intelligence.routedWithoutResponder}
Active Without Outcome Confirmation: ${intelligence.activeWithoutOutcome}
Stalled Stabilization Cases: ${intelligence.stalledCases}

Pressure Interpretation:
${intelligence.pressurePropagation.executiveSummary}

Trajectory Interpretation:
${intelligence.trajectoryIntelligence.executiveSummary}

Governance Interpretation:
${commandGuidance.interpretation}

Recommended Command Action:
${commandGuidance.action}

Pressure Propagation Action:
${intelligence.pressurePropagation.actionCue}

Trajectory Action:
${intelligence.trajectoryIntelligence.actionCue}

Governance-Safe Command Meaning:
This command brief consolidates operational disruption visibility, continuity risk, pressure propagation, trajectory direction, routing ownership, bottleneck pressure, recovery movement, intervention coverage, outcome coverage, safeguarding visibility, regional pressure, governance integrity, and institutional memory into one executive command view. It supports system-level action without assigning blame to responders, institutions, beneficiaries, families, or partners.

Monitoring Note:
${commandGuidance.monitoring}

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • EXECUTIVE COMMAND INTELLIGENCE</p>

          <h1 style={styles.title}>Continuity Governance Command Center</h1>

          <p style={styles.subtitle}>
            Govern what happens after visible disruption enters an institutional pathway:
            routing, response ownership, pressure propagation, trajectory direction,
            evidence, recovery, escalation, accountability, and institutional memory until
            stabilization is confirmed.
          </p>

          <div style={styles.commandBanner}>
            <strong>{intelligence.commandStatus}</strong>
            <span>{commandGuidance.interpretation}</span>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.metricsGrid}>
          <Metric label="Command Status" value={intelligence.commandStatus} />
          <Metric label="Continuity State" value={intelligence.continuityScores.continuityState} />
          <Metric
            label="Pressure State"
            value={intelligence.pressurePropagation.pressurePropagationState}
          />
          <Metric
            label="Trajectory Direction"
            value={intelligence.trajectoryIntelligence.trajectoryDirection}
          />
          <Metric
            label="Propagation Risk"
            value={`${intelligence.pressurePropagation.propagationRisk}/100`}
          />
          <Metric
            label="Trajectory Risk"
            value={`${intelligence.trajectoryIntelligence.trajectoryRisk}/100`}
          />
          <Metric label="Recovery Status" value={intelligence.recoveryStatus} />
          <Metric
            label="Survivability Score"
            value={`${intelligence.continuityScores.operationalSurvivabilityScore}/100`}
          />
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Routing Friction" value={`${intelligence.pressurePropagation.routingFriction}/100`} />
          <Metric label="Responder Pressure" value={`${intelligence.pressurePropagation.responderPressure}/100`} />
          <Metric label="Escalation Velocity" value={`${intelligence.pressurePropagation.escalationVelocity}/100`} />
          <Metric
            label="Coordination Instability"
            value={`${intelligence.pressurePropagation.coordinationInstability}/100`}
          />
          <Metric label="Stabilization Drag" value={`${intelligence.pressurePropagation.stabilizationDrag}/100`} />
          <Metric label="Active Cases" value={intelligence.activeCases.toString()} />
          <Metric label="Critical Cases" value={intelligence.criticalCases.toString()} />
          <Metric label="Safeguarding Flags" value={intelligence.safeguardingFlags.toString()} />
        </section>

        <section style={styles.trajectoryHero}>
          <div>
            <p style={styles.scoreLabel}>Trajectory Direction</p>
            <h2 style={styles.trajectoryState}>
              {intelligence.trajectoryIntelligence.trajectoryDirection}
            </h2>
            <p style={styles.helper}>
              {intelligence.trajectoryIntelligence.executiveSummary}
            </p>
          </div>

          <div style={styles.metricsGrid}>
            <Metric
              label="Trajectory Risk"
              value={`${intelligence.trajectoryIntelligence.trajectoryRisk}/100`}
            />
            <Metric
              label="Continuity Drift"
              value={`${intelligence.trajectoryIntelligence.continuityDrift}/100`}
            />
            <Metric
              label="Escalation Momentum"
              value={`${intelligence.trajectoryIntelligence.escalationMomentum}/100`}
            />
            <Metric
              label="Recovery Direction"
              value={`${intelligence.trajectoryIntelligence.recoveryDirection}/100`}
            />
            <Metric
              label="Stabilization Trend"
              value={`${intelligence.trajectoryIntelligence.stabilizationTrend}/100`}
            />
            <Metric
              label="Unresolved Momentum"
              value={`${intelligence.trajectoryIntelligence.unresolvedMomentum}/100`}
            />
          </div>

          <div style={styles.metricsGrid}>
            <Metric
              label="Trajectory Severity"
              value={intelligence.trajectoryIntelligence.severity}
            />
            <Metric
              label="Dominant Trajectory Signal"
              value={intelligence.trajectoryIntelligence.dominantTrajectorySignal}
            />
            <Metric
              label="Trajectory Action"
              value={intelligence.trajectoryIntelligence.actionCue}
            />
          </div>
        </section>

        <section style={styles.sectionGrid}>
          <Panel title="Operational Stability Overview" note="Executive view of continuity posture, pressure propagation, and trajectory direction.">
            {intelligence.operationalSignals.map((signal) => (
              <SignalCard key={signal.label} signal={signal} />
            ))}
          </Panel>

          <Panel title="Continuity Risk Zones" note="Where disruption risks spreading, drifting, or disappearing after notice.">
            {continuityRiskZones.map((signal) => (
              <SignalCard key={signal.label} signal={signal} />
            ))}
          </Panel>
        </section>

        <section style={styles.sectionGrid}>
          <Panel title="Recovery Command Status" note="Evidence of movement from intervention to confirmed outcome.">
            <CommandRow label="Intervention Coverage" value={`${intelligence.interventionCoverage}%`} />
            <CommandRow label="Outcome Coverage" value={`${intelligence.outcomeCoverage}%`} />
            <CommandRow
              label="Unresolved Intervention Pathways"
              value={intelligence.unresolvedInterventionPathways.toString()}
            />
            <CommandRow label="Stalled Stabilization Cases" value={intelligence.stalledCases.toString()} />
          </Panel>

          <Panel title="Regional / Institutional Pressure" note="Concentration of visible continuity load.">
            {intelligence.regionalPressureItems.length === 0 ? (
              <p style={styles.emptyText}>No regional pressure recorded yet.</p>
            ) : (
              intelligence.regionalPressureItems.map((item: PressureItem) => (
                <CommandRow key={item.label} label={item.label} value={item.value.toString()} />
              ))
            )}
          </Panel>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Executive Command Brief Template</h2>

          <p style={styles.helper}>
            Use standardized dropdowns to keep executive command intelligence governance-safe,
            operationally coherent, and ready for institutional, NGO, district, or ministry review.
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

          <div style={styles.alignedBox}>
            <h3 style={styles.alignedTitle}>Auto-Aligned Command Interpretation</h3>
            <p style={styles.alignedText}>{commandGuidance.interpretation}</p>

            <h3 style={styles.alignedTitle}>Auto-Aligned Pressure Interpretation</h3>
            <p style={styles.alignedText}>{intelligence.pressurePropagation.executiveSummary}</p>

            <h3 style={styles.alignedTitle}>Auto-Aligned Trajectory Interpretation</h3>
            <p style={styles.alignedText}>{intelligence.trajectoryIntelligence.executiveSummary}</p>

            <h3 style={styles.alignedTitle}>Auto-Aligned Command Action</h3>
            <p style={styles.alignedText}>{commandGuidance.action}</p>

            <h3 style={styles.alignedTitle}>Auto-Aligned Pressure Action</h3>
            <p style={styles.alignedText}>{intelligence.pressurePropagation.actionCue}</p>

            <h3 style={styles.alignedTitle}>Auto-Aligned Trajectory Action</h3>
            <p style={styles.alignedText}>{intelligence.trajectoryIntelligence.actionCue}</p>

            <h3 style={styles.alignedTitle}>Auto-Aligned Monitoring Note</h3>
            <p style={styles.alignedText}>{commandGuidance.monitoring}</p>
          </div>

          <label style={styles.label}>
            Optional Additional Operational Notes
            <textarea
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
              placeholder="Use system-level operational notes only. Avoid blame, personal judgment, or unnecessary personal details."
              style={styles.textarea}
            />
          </label>

          <button onClick={loadData} style={styles.button}>
            Refresh Executive Command Intelligence
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Generated Executive Command Brief</h2>

          <div style={styles.briefBox}>
            <pre style={styles.pre}>{commandBrief}</pre>
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <h2 style={styles.metricValue}>{value}</h2>
    </div>
  )
}

function Panel({
  title,
  note,
  children,
}: {
  title: string
  note: string
  children: ReactNode
}) {
  return (
    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <p style={styles.helper}>{note}</p>
      <div style={styles.signalList}>{children}</div>
    </section>
  )
}

function SignalCard({ signal }: { signal: CommandSignal }) {
  return (
    <article style={styles.signalCard}>
      <div>
        <p style={styles.signalLabel}>{signal.label}</p>
        <h3 style={styles.signalStatus}>{signal.status}</h3>
      </div>

      <p style={styles.signalText}>{signal.interpretation}</p>
      <p style={styles.signalAction}>{signal.action}</p>
    </article>
  )
}

function CommandRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.commandRow}>
      <span>{label}</span>
      <strong>{value}</strong>
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
  return (
    <label style={styles.label}>
      {label}
      <select value={value} onChange={(event) => setValue(event.target.value)} style={styles.select}>
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
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  hero: {
    marginBottom: '28px',
  },
  kicker: {
    color: '#67e8f9',
    fontWeight: 900,
    fontSize: '12px',
    letterSpacing: '2px',
  },
  title: {
    fontSize: 'clamp(34px, 6vw, 62px)',
    lineHeight: 1.02,
    margin: '12px 0',
    letterSpacing: '-0.04em',
  },
  subtitle: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    maxWidth: '980px',
    fontSize: '17px',
  },
  commandBanner: {
    marginTop: '22px',
    background: '#020617',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '18px',
    display: 'grid',
    gap: '8px',
  },
  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '14px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '22px',
  },
  trajectoryHero: {
    background: '#172554',
    border: '1px solid #4338ca',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '24px',
  },
  scoreLabel: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '10px',
  },
  trajectoryState: {
    fontSize: 'clamp(36px, 7vw, 68px)',
    margin: '0 0 18px',
    color: '#a78bfa',
    letterSpacing: '-0.05em',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  sectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '18px',
    marginBottom: '24px',
  },
  metricCard: {
    minHeight: '116px',
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '18px',
    overflow: 'hidden',
  },
  metricLabel: {
    color: '#94a3b8',
    fontWeight: 800,
    fontSize: '13px',
    margin: 0,
  },
  metricValue: {
    marginTop: '10px',
    fontSize: 'clamp(13px, 1.5vw, 17px)',
    lineHeight: 1.25,
    wordBreak: 'break-word',
    overflowWrap: 'anywhere',
    letterSpacing: '-0.01em',
  },
  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '28px',
    marginBottom: '12px',
  },
  helper: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    marginBottom: '20px',
  },
  signalList: {
    display: 'grid',
    gap: '12px',
  },
  signalCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },
  signalLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  signalStatus: {
    color: '#67e8f9',
    fontSize: '18px',
    margin: '8px 0 10px',
    overflowWrap: 'anywhere',
  },
  signalText: {
    color: '#e2e8f0',
    lineHeight: 1.6,
    margin: '0 0 10px',
  },
  signalAction: {
    color: '#bbf7d0',
    lineHeight: 1.5,
    margin: 0,
    fontWeight: 800,
  },
  commandRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '10px',
  },
  emptyText: {
    color: '#cbd5e1',
    lineHeight: 1.6,
  },
  label: {
    display: 'block',
    fontWeight: 800,
    marginBottom: '18px',
  },
  select: {
    width: '100%',
    marginTop: '8px',
    padding: '14px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    marginTop: '8px',
    padding: '14px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
    resize: 'vertical',
  },
  button: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    background: '#67e8f9',
    color: '#082f49',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '16px',
  },
  alignedBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
    marginBottom: '20px',
  },
  alignedTitle: {
    color: '#67e8f9',
    fontSize: '14px',
    margin: '0 0 6px',
  },
  alignedText: {
    color: '#e2e8f0',
    lineHeight: 1.6,
    margin: '0 0 16px',
  },
  briefBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '20px',
  },
  pre: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
    margin: 0,
    fontFamily: 'inherit',
  },
}