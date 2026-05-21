'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  deriveCommandImplication,
  deriveCommandPosture,
  explainCommandPosture,
} from '@/lib/cgi/deriveCommandPosture'
import {
  buildSmartCommandActions,
  type SmartCommandAction,
} from '@/lib/cgi/buildSmartCommandAction'
import {
  selectCommandDrivers,
  type CGICommandDriver,
} from '@/lib/cgi/selectCommandDrivers'
import { interpretBottleneck } from '@/lib/cgi/interpreters/interpretBottleneck'
import { combineExecutiveActions } from '@/lib/cgi/interpreters/combineExecutiveActions'
import { interpretGovernanceIntegrity } from '@/lib/cgi/interpreters/interpretGovernanceIntegrity'
import { interpretInstitutionReadiness } from '@/lib/cgi/interpreters/interpretInstitutionReadiness'
import { interpretPredictive } from '@/lib/cgi/interpreters/interpretPredictive'
import { interpretPressure } from '@/lib/cgi/interpreters/interpretPressure'
import { interpretRecovery } from '@/lib/cgi/interpreters/interpretRecovery'
import { interpretRegionalPressure } from '@/lib/cgi/interpreters/interpretRegionalPressure'
import { interpretReliability } from '@/lib/cgi/interpreters/interpretReliability'
import { interpretResponderReadiness } from '@/lib/cgi/interpreters/interpretResponderReadiness'
import { interpretRoutingPressure } from '@/lib/cgi/interpreters/interpretRoutingPressure'
import { interpretSafeguarding } from '@/lib/cgi/interpreters/interpretSafeguarding'
import { interpretTrajectory } from '@/lib/cgi/interpreters/interpretTrajectory'
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
        posture: interpretRegionalPressure({
          regionalCaseLoad: value,
        }).posture,
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

    const recurrenceRate =
      totalCases === 0
        ? 0
        : Number(
            (
              (escalatedCases +
                safeguardingFlags +
                unresolvedInterventionPathways) /
              totalCases
            ).toFixed(2)
          )

    const centralizedReliability = interpretReliability({
      unresolvedCases: activeWithoutOutcome,
      overdueCases: routedWithoutResponder + activeWithoutRouting,
      failedRecoveries: stalledCases,
      recurrenceRate,
    })

    const centralizedPressure = interpretPressure({
      escalationPressure: clamp(escalatedCases * 20 + criticalCases * 15),
      propagationRisk: clamp(safeguardingFlags * 25),
      unresolvedMomentum: clamp(
        unresolvedInterventionPathways * 20 + activeWithoutRouting * 10
      ),
      continuityDrift: clamp(stalledCases * 25),
    })

    const centralizedTrajectory = interpretTrajectory({
      trajectoryRisk: clamp(escalatedCases * 20 + activeCases * 6),
      continuityDrift: clamp(stalledCases * 25 + activeWithoutOutcome * 8),
      unresolvedMomentum: clamp(unresolvedInterventionPathways * 20),
      survivabilityRisk: clamp(100 - stabilizationRate),
    })

    const centralizedRecovery = interpretRecovery({
      stabilizationConfidence: stabilizationRate,
      recoveryReliability: outcomeCoverage,
      survivabilityScore: interventionCoverage,
      continuityDrift: clamp(stalledCases * 25),
      unresolvedMomentum: clamp(unresolvedInterventionPathways * 20),
    })

    const centralizedPredictive = interpretPredictive({
      propagationRisk: clamp(safeguardingFlags * 25),
      trajectoryRisk: clamp(escalatedCases * 20 + activeCases * 6),
      structuralMemoryRisk: clamp(
        activeWithoutRouting * 20 + routedWithoutResponder * 20
      ),
      unresolvedMomentum: clamp(unresolvedInterventionPathways * 20),
      stabilizationDrag: clamp(stalledCases * 25),
    })

    const centralizedBottleneck = interpretBottleneck({
      routingCongestion: clamp(highestResponderLoad * 20),
      responderConcentration: clamp(highestResponderLoad * 20),
      unresolvedMomentum: clamp(unresolvedInterventionPathways * 20),
      continuityDrift: clamp(stalledCases * 25),
      propagationRisk: clamp(safeguardingFlags * 25),
    })

    const centralizedGovernance = interpretGovernanceIntegrity({
      activeWithoutRouting,
      routedWithoutResponder,
      unresolvedInterventionPathways,
    })

    const centralizedRouting = interpretRoutingPressure({
      highestResponderLoad,
      highestRegionalPressure,
      routedWithoutResponder,
      activeWithoutRouting,
      safeguardingFlags,
    })

    const centralizedSafeguarding = interpretSafeguarding({
      safeguardingFlags,
    })

    const centralizedResponder = interpretResponderReadiness({
      highestResponderLoad,
      routedWithoutResponder,
      unresolvedInterventionPathways,
    })

    const centralizedInstitution = interpretInstitutionReadiness({
      activeInstitutions,
      totalInstitutions: institutions.length,
    })

    const pressurePosture = toInterpretation(centralizedPressure)
    const trajectoryPosture = toInterpretation(centralizedTrajectory)
    const continuityPosture = toInterpretation(centralizedReliability)
    const recoveryPosture = toInterpretation(centralizedRecovery)
    const bottleneckPosture = toInterpretation(centralizedBottleneck)
    const predictivePosture = toInterpretation(centralizedPredictive)
    const governancePosture = toInterpretation(centralizedGovernance)
    const routingPosture = toInterpretation(centralizedRouting)
    const safeguardingPosture = toInterpretation(centralizedSafeguarding)
    const responderPosture = toInterpretation(centralizedResponder)
    const institutionPosture = toInterpretation(centralizedInstitution)

    const memoryPosture: Interpretation = {
      posture: normalizePosture(structuralMemory.structuralMemoryState),
      meaning:
        structuralMemory.dominantMemoryPattern ||
        'Structural memory visibility is currently preserved.',
      action: 'Maintain structural memory review and recurrence visibility.',
    }

    const activeCasePosture: Interpretation = {
      posture:
        activeCases >= 10
          ? 'CASE LOAD HEAVY'
          : activeCases >= 3
            ? 'CASE LOAD VISIBLE'
            : 'CASE LOAD CONTAINED',
      meaning:
        activeCases >= 10
          ? 'Active continuity load is heavy.'
          : activeCases >= 3
            ? 'Active continuity load is visible.'
            : 'Active continuity load appears contained.',
      action:
        activeCases >= 10
          ? 'Review case distribution.'
          : activeCases >= 3
            ? 'Maintain active case monitoring.'
            : 'Maintain monitoring.',
    }

    const commandPosture = deriveCommandPosture({
      pressureSeverity: centralizedPressure.severity,
      trajectorySeverity: centralizedTrajectory.severity,
      recoverySeverity: centralizedRecovery.severity,
      predictiveSeverity: centralizedPredictive.severity,
      bottleneckSeverity: centralizedBottleneck.severity,
      reliabilitySeverity: centralizedReliability.severity,
      governanceSeverity: centralizedGovernance.severity,
    })

    const commandGuidance: Interpretation = {
      posture: commandPosture,
      meaning: explainCommandPosture(commandPosture),
      action: deriveCommandImplication(commandPosture),
    }

    const commandDrivers: CGICommandDriver[] = [
      {
        label: 'Pressure Propagation',
        posture: centralizedPressure.posture,
        severity: centralizedPressure.severity,
        meaning: centralizedPressure.summary,
        action: centralizedPressure.executiveAction,
      },
      {
        label: 'Trajectory Direction',
        posture: centralizedTrajectory.posture,
        severity: centralizedTrajectory.severity,
        meaning: centralizedTrajectory.summary,
        action: centralizedTrajectory.executiveAction,
      },
      {
        label: 'Recovery Credibility',
        posture: centralizedRecovery.posture,
        severity: centralizedRecovery.severity,
        meaning: centralizedRecovery.summary,
        action: centralizedRecovery.executiveAction,
      },
      {
        label: 'Predictive Forecast',
        posture: centralizedPredictive.posture,
        severity: centralizedPredictive.severity,
        meaning: centralizedPredictive.summary,
        action: centralizedPredictive.executiveAction,
      },
      {
        label: 'Bottleneck Pressure',
        posture: centralizedBottleneck.posture,
        severity: centralizedBottleneck.severity,
        meaning: centralizedBottleneck.summary,
        action: centralizedBottleneck.executiveAction,
      },
      {
        label: 'Continuity Reliability',
        posture: centralizedReliability.posture,
        severity: centralizedReliability.severity,
        meaning: centralizedReliability.summary,
        action: centralizedReliability.executiveAction,
      },
      {
        label: 'Governance Integrity',
        posture: centralizedGovernance.posture,
        severity: centralizedGovernance.severity,
        meaning: centralizedGovernance.summary,
        action: centralizedGovernance.executiveAction,
      },
      {
        label: 'Routing Ownership',
        posture: centralizedRouting.posture,
        severity: centralizedRouting.severity,
        meaning: centralizedRouting.summary,
        action: centralizedRouting.executiveAction,
      },
      {
        label: 'Safeguarding Visibility',
        posture: centralizedSafeguarding.posture,
        severity: centralizedSafeguarding.severity,
        meaning: centralizedSafeguarding.summary,
        action: centralizedSafeguarding.executiveAction,
      },
      {
        label: 'Responder Readiness',
        posture: centralizedResponder.posture,
        severity: centralizedResponder.severity,
        meaning: centralizedResponder.summary,
        action: centralizedResponder.executiveAction,
      },
      {
        label: 'Institution Readiness',
        posture: centralizedInstitution.posture,
        severity: centralizedInstitution.severity,
        meaning: centralizedInstitution.summary,
        action: centralizedInstitution.executiveAction,
      },
    ]

    const primaryDrivers = selectCommandDrivers(commandDrivers)

    const smartActions = buildSmartCommandActions(
      primaryDrivers.map((driver) => ({
        ...driver,
        evidenceMetric: buildEvidenceMetric(driver.label, {
          activeCases,
          activeWithoutOutcome,
          activeWithoutRouting,
          routedWithoutResponder,
          unresolvedInterventionPathways,
          stalledCases,
          safeguardingFlags,
          highestResponderLoad,
          highestRegionalPressure,
          activeInstitutions,
          totalInstitutions: institutions.length,
          stabilizationRate,
          outcomeCoverage,
          interventionCoverage,
        }),
      }))
    )

    const executiveSummary =
      primaryDrivers.length > 0
        ? `${commandGuidance.meaning} Primary command drivers are ${primaryDrivers
            .map((driver) => driver.label)
            .join(', ')}.`
        : `${commandGuidance.meaning} No elevated command driver is currently dominating the operating view.`

    const actionCue = combineExecutiveActions(
      smartActions.length > 0
        ? smartActions.map((action) => action.executiveAction)
        : [commandGuidance.action]
    )

    const operationalSignals: CommandSignal[] = [
      {
        label: 'Pressure Propagation',
        ...pressurePosture,
      },
      {
        label: 'Trajectory Direction',
        ...trajectoryPosture,
      },
      {
        label: 'Structural Memory',
        ...memoryPosture,
      },
      {
        label: 'Continuity State',
        ...continuityPosture,
      },
      {
        label: 'Recovery Credibility',
        ...recoveryPosture,
      },
      {
        label: 'Governance Integrity',
        ...governancePosture,
      },
    ]

    const riskZones: CommandSignal[] = [
      {
        label: 'Predictive Forecast',
        ...predictivePosture,
      },
      {
        label: 'Routing Ownership',
        ...routingPosture,
      },
      {
        label: 'Bottleneck Pressure',
        ...bottleneckPosture,
      },
      {
        label: 'Active Case Load',
        ...activeCasePosture,
      },
      {
        label: 'Safeguarding Visibility',
        ...safeguardingPosture,
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
      commandGuidance,
      executiveSummary,
      actionCue,
      primaryDrivers,
      smartActions,
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

Primary Command Drivers:
${
  intelligence.primaryDrivers.length > 0
    ? intelligence.primaryDrivers
        .map(
          (driver, index) =>
            `${index + 1}. ${driver.label}: ${driver.posture} (${driver.severity})`
        )
        .join('\n')
    : 'No elevated command drivers currently selected.'
}

SMART Command Actions:
${
  intelligence.smartActions.length > 0
    ? intelligence.smartActions
        .map(
          (action, index) =>
            `${index + 1}. ${action.executiveAction}`
        )
        .join('\n')
    : intelligence.commandGuidance.action
}

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
            <p style={styles.actionLabel}>Primary Command Action</p>
            <p style={styles.actionText}>{intelligence.actionCue}</p>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Top Command Drivers</h2>

          <p style={styles.cardNote}>
            These are the highest-priority signals driving the current command
            posture. Lower-priority signals remain visible as supporting
            evidence below.
          </p>

          {intelligence.primaryDrivers.length === 0 ? (
            <p style={styles.emptyText}>
              No elevated command drivers are currently dominating the operating
              view.
            </p>
          ) : (
            <div style={styles.driverGrid}>
              {intelligence.primaryDrivers.map((driver, index) => (
                <DriverCard key={driver.label} driver={driver} index={index} />
              ))}
            </div>
          )}
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>SMART Command Actions</h2>

          <p style={styles.cardNote}>
            Each command action is specific, measurable, achievable, relevant,
            and time-bound.
          </p>

          {intelligence.smartActions.length === 0 ? (
            <p style={styles.emptyText}>
              Routine command monitoring remains appropriate.
            </p>
          ) : (
            <div style={styles.smartGrid}>
              {intelligence.smartActions.map((action, index) => (
                <SmartActionCard
                  key={`${action.label}-${index}`}
                  action={action}
                  index={index}
                />
              ))}
            </div>
          )}
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
          <Panel title="Supporting Command Signals">
            {intelligence.operationalSignals.map((signal) => (
              <SignalCard key={signal.label} signal={signal} />
            ))}
          </Panel>

          <Panel title="Supporting Continuity Risk Zones">
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

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function toInterpretation(input: {
  posture: string
  summary: string
  executiveAction: string
}): Interpretation {
  return {
    posture: input.posture,
    meaning: input.summary,
    action: input.executiveAction,
  }
}

function normalizePosture(value: string | null | undefined) {
  return String(value || 'MEMORY CONTAINED').replaceAll('_', ' ')
}

function buildEvidenceMetric(
  label: string,
  evidence: {
    activeCases: number
    activeWithoutOutcome: number
    activeWithoutRouting: number
    routedWithoutResponder: number
    unresolvedInterventionPathways: number
    stalledCases: number
    safeguardingFlags: number
    highestResponderLoad: number
    highestRegionalPressure: number
    activeInstitutions: number
    totalInstitutions: number
    stabilizationRate: number
    outcomeCoverage: number
    interventionCoverage: number
  }
) {
  if (label === 'Routing Ownership') {
    return `${evidence.routedWithoutResponder} routed actions without responders and ${evidence.activeWithoutRouting} active cases without routing.`
  }

  if (label === 'Governance Integrity') {
    return `${evidence.activeWithoutRouting} active cases without routing, ${evidence.routedWithoutResponder} routed actions without responders, and ${evidence.unresolvedInterventionPathways} unresolved intervention pathways.`
  }

  if (label === 'Recovery Credibility') {
    return `${evidence.stabilizationRate}% stabilization rate, ${evidence.outcomeCoverage}% outcome coverage, and ${evidence.unresolvedInterventionPathways} unresolved intervention pathways.`
  }

  if (label === 'Pressure Propagation') {
    return `${evidence.safeguardingFlags} safeguarding flags, ${evidence.stalledCases} stalled cases, and ${evidence.unresolvedInterventionPathways} unresolved intervention pathways.`
  }

  if (label === 'Trajectory Direction') {
    return `${evidence.activeCases} active cases and ${evidence.activeWithoutOutcome} active cases without outcomes.`
  }

  if (label === 'Predictive Forecast') {
    return `${evidence.unresolvedInterventionPathways} unresolved intervention pathways, ${evidence.stalledCases} stalled cases, and ${evidence.activeWithoutRouting} active cases without routing.`
  }

  if (label === 'Bottleneck Pressure') {
    return `Highest responder load is ${evidence.highestResponderLoad}, and highest regional pressure is ${evidence.highestRegionalPressure}.`
  }

  if (label === 'Continuity Reliability') {
    return `${evidence.activeWithoutOutcome} active cases without outcomes and ${evidence.stalledCases} stalled cases.`
  }

  if (label === 'Safeguarding Visibility') {
    return `${evidence.safeguardingFlags} safeguarding flags are visible.`
  }

  if (label === 'Responder Readiness') {
    return `Highest responder load is ${evidence.highestResponderLoad}, with ${evidence.routedWithoutResponder} routed actions without responders.`
  }

  if (label === 'Institution Readiness') {
    return `${evidence.activeInstitutions} active institutions out of ${evidence.totalInstitutions}.`
  }

  return 'Current CGI signal evidence is visible in the supporting command panels.'
}

function DriverCard({
  driver,
  index,
}: {
  driver: CGICommandDriver
  index: number
}) {
  return (
    <article style={styles.driverCard}>
      <p style={styles.cardKicker}>Driver {index + 1}</p>
      <h3 style={styles.driverTitle}>{driver.label}</h3>
      <strong style={styles.driverPosture}>{driver.posture}</strong>
      <p style={styles.signalText}>{driver.meaning}</p>
    </article>
  )
}

function SmartActionCard({
  action,
  index,
}: {
  action: SmartCommandAction
  index: number
}) {
  return (
    <article style={styles.smartCard}>
      <p style={styles.cardKicker}>SMART Action {index + 1}</p>
      <h3 style={styles.driverTitle}>{action.label}</h3>

      <Info label="Specific" value={action.specific} />
      <Info label="Measurable" value={action.measurable} />
      <Info label="Achievable" value={action.achievable} />
      <Info label="Relevant" value={action.relevant} />
      <Info label="Time Bound" value={action.timeBound} />
    </article>
  )
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
  driverGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
  },
  driverCard: {
    background: '#082f49',
    border: '1px solid #22d3ee',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '170px',
  },
  driverTitle: {
    color: '#f8fafc',
    fontSize: '20px',
    lineHeight: 1.15,
    margin: '8px 0',
  },
  driverPosture: {
    display: 'block',
    color: '#67e8f9',
    fontSize: '15px',
    marginBottom: '10px',
    overflowWrap: 'anywhere',
  },
  smartGrid: {
    display: 'grid',
    gap: '14px',
  },
  smartCard: {
    background: '#0f172a',
    border: '1px solid #22d3ee',
    borderRadius: '18px',
    padding: '16px',
  },
  emptyText: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    margin: 0,
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