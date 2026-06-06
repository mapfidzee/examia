'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIDemoScenario } from '@/lib/cgiDemoScenarioEngine'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  beneficiary_name: string
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
}

type Institution = {
  id: string
  institution_name: string
  institution_type: string
  region: string | null
  district: string | null
  operating_level: string | null
  coordination_status: string | null
}

type Responder = {
  id: string
  full_name: string
  operational_status: string
  region: string | null
  trust_score: number | null
}

type RoutingAction = {
  id: string
  case_id: string
  routing_status: string | null
  routing_priority: string | null
  routing_reason: string | null
  institution_id: string | null
  assigned_responder_id: string | null
}

type CaseIntervention = {
  id: string
  case_id: string
  intervention_type: string | null
}

type CaseOutcome = {
  id: string
  case_id: string
  outcome_status: string | null
}

type PanelRow = {
  label: string
  value: number
  detail: string
}

type CoordinationPatternType =
  | 'ISOLATED_SYNCHRONIZATION'
  | 'REPEATED_COORDINATION_STRAIN'
  | 'SHARED_DEPENDENCY_VISIBLE'
  | 'DISTRIBUTED_PRESSURE'
  | 'ENTERPRISE_PATTERN'

type CoordinationPatternReading = {
  patternType: CoordinationPatternType
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

type CoordinationReading = {
  status: string
  commandQuestion: string
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
]

const COORDINATION_VISIBLE_STATUSES = [
  ...ACTIVE_CASE_STATUSES,
  'ESCALATED',
  'REOPENED',
  'GOVERNANCE_REVIEW_REQUIRED',
  'GOVERNANCE_REVIEW_REQUIRED_RECURRENCE',
  'STABILIZATION_OWNER_ROUTED',
  'STABILIZATION_OWNER_ROUTED_RECURRENCE',
]

export default function CoordinationPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <CoordinationContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function CoordinationContent() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [responders, setResponders] = useState<Responder[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<CaseIntervention[]>([])
  const [outcomes, setOutcomes] = useState<CaseOutcome[]>([])
  const [message, setMessage] = useState('')

  const pilotScenario = buildCGIDemoScenario('FUEL_LOGISTICS_CHAIN_PROOF')
  const pilotThread = pilotScenario.pilotThread

  useEffect(() => {
    loadCoordinationData()
  }, [])

  async function loadCoordinationData() {
    const [
      caseResult,
      institutionResult,
      responderResult,
      routingResult,
      interventionResult,
      outcomeResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('institutions').select('*'),
      supabase.from('responders').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*'),
    ])

    if (caseResult.error) console.error(caseResult.error)
    if (institutionResult.error) console.error(institutionResult.error)
    if (responderResult.error) console.error(responderResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionResult.error) console.error(interventionResult.error)
    if (outcomeResult.error) console.error(outcomeResult.error)

    setCases(caseResult.data || [])
    setInstitutions(institutionResult.data || [])
    setResponders(responderResult.data || [])
    setRoutingActions(routingResult.data || [])
    setInterventions(interventionResult.data || [])
    setOutcomes(outcomeResult.data || [])
    setMessage('Coordination synchronization refreshed.')
  }

  const activeCases = cases.filter((item) =>
    ACTIVE_CASE_STATUSES.includes(item.case_status),
  )

  const coordinationVisibleCases = cases.filter((item) =>
    COORDINATION_VISIBLE_STATUSES.includes(item.case_status),
  )

  const stabilizedCases = cases.filter((item) => item.case_status === 'STABILIZED')
  const escalatedCases = cases.filter((item) => item.case_status === 'ESCALATED')
  const criticalCases = cases.filter((item) => item.severity_level === 'CRITICAL')
  const safeguardingCases = cases.filter((item) => item.safeguarding_flag)

  const stalledCases = cases.filter((item) =>
    ['ROUTING_STALLED', 'OWNERSHIP_CLARITY_REQUIRED'].includes(item.case_status),
  )

  const recurrenceCases = cases.filter(
    (item) =>
      item.case_status.includes('RECURRENCE') ||
      item.case_status === 'REOPENED',
  )

  const activeResponders = responders.filter(
    (item) => item.operational_status === 'ACTIVE',
  )

  const activeInstitutions = institutions.filter(
    (item) => item.coordination_status === 'ACTIVE',
  )

  const uniqueInterventionCases = new Set(interventions.map((item) => item.case_id)).size
  const uniqueOutcomeCases = new Set(outcomes.map((item) => item.case_id)).size

  const interventionCoverage =
    cases.length > 0 ? Math.round((uniqueInterventionCases / cases.length) * 100) : 0

  const outcomeCoverage =
    cases.length > 0 ? Math.round((uniqueOutcomeCases / cases.length) * 100) : 0

  const stabilizationRate =
    cases.length > 0 ? Math.round((stabilizedCases.length / cases.length) * 100) : 0

  const coordinationPressure =
    activeCases.length +
    escalatedCases.length * 2 +
    criticalCases.length * 2 +
    safeguardingCases.length +
    stalledCases.length * 2 +
    recurrenceCases.length * 2

  const coordinationPattern = buildCoordinationPatternReading({
    cases,
    institutions,
    responders,
    routingActions,
    recurrenceCases: recurrenceCases.length,
    stalledCases: stalledCases.length,
    escalatedCases: escalatedCases.length,
    criticalCases: criticalCases.length,
    coordinationVisibleCases: coordinationVisibleCases.length,
    interventionCoverage,
    outcomeCoverage,
  })

  const coordinationReading = buildCoordinationReading({
    totalCases: cases.length,
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
    coordinationPattern,
  })

  const regionRows = useMemo(
    () => groupedRows(cases.map((item) => item.region || 'Region not recorded')),
    [cases],
  )

  const institutionRows = useMemo<PanelRow[]>(() => {
    return institutions.map((site) => {
      const load = routingActions.filter((route) => route.institution_id === site.id)
        .length

      return {
        label: site.institution_name || 'Unnamed institution',
        value: load,
        detail: `${site.institution_type || 'Type not recorded'} • ${
          site.operating_level || 'Level not recorded'
        }`,
      }
    })
  }, [institutions, routingActions])

  const responderRows = useMemo<PanelRow[]>(() => {
    return responders.map((responder) => {
      const load = routingActions.filter(
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
  }, [responders, routingActions])

  const lifecycleRows = useMemo(
    () => groupedRows(cases.map((item) => item.case_status || 'Status not recorded')),
    [cases],
  )

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • COORDINATION</p>

          <h1 style={styles.title}>Coordination Synchronization Intelligence</h1>

          <p style={styles.subtitle}>
            Synchronize ownership, routing, responder capacity, institutional
            load, evidence maturity, recovery readiness, and shared dependency
            before continuity moves to Cross-Site, Situation Room, Executive
            Center, Audit, or Stability Board.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Enterprise Synchronization Pattern</p>
            <h2 style={styles.heroTitle}>{coordinationPattern.patternName}</h2>
            <p style={styles.bodyText}>{coordinationPattern.patternMeaning}</p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Pattern Type</p>
            <p style={styles.statusValue}>{coordinationPattern.patternType}</p>
          </div>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Coordination Chain Position</p>
            <h2 style={styles.heroTitle}>{coordinationReading.chainPosition}</h2>
            <p style={styles.bodyText}>{coordinationReading.synchronizationMeaning}</p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Next Destination</p>
            <p style={styles.statusValue}>{coordinationReading.nextDestination}</p>
          </div>
        </section>

        <section style={styles.chainPanel}>
          <ChainStep label="Command" value="Decides movement" />
          <ChainStep label="Coordination" value="Synchronizes pattern" active />
          <ChainStep
            label="Cross-Site"
            value={coordinationReading.crossSiteRequired ? 'Required' : 'Conditional'}
          />
          <ChainStep
            label="Executive"
            value={coordinationReading.executiveReviewRequired ? 'Required' : 'Conditional'}
          />
          <ChainStep
            label="Audit"
            value={coordinationReading.auditRequired ? 'Required' : 'Preserve if needed'}
          />
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Coordination Status" textValue={coordinationReading.status} />
          <Metric label="Active Cases" value={activeCases.length} />
          <Metric label="Coordination Sites" value={institutions.length} />
          <Metric label="Active Responders" value={activeResponders.length} />
          <Metric label="Routing Actions" value={routingActions.length} />
          <Metric label="Safeguarding Flags" value={safeguardingCases.length} />
          <Metric label="Intervention Coverage" value={interventionCoverage} suffix="%" />
          <Metric label="Outcome Coverage" value={outcomeCoverage} suffix="%" />
        </section>

        <section style={styles.requirementGrid}>
          <RequirementCard
            label="Shared Ownership"
            active={coordinationPattern.sharedOwnershipVisible}
            body="Shows whether multiple cases or routing actions are converging around the same ownership structure."
          />

          <RequirementCard
            label="Shared Institution"
            active={coordinationPattern.sharedInstitutionVisible}
            body="Shows whether institutional load may be creating a distributed coordination pattern."
          />

          <RequirementCard
            label="Shared Responder"
            active={coordinationPattern.sharedResponderVisible}
            body="Shows whether responder concentration may be weakening continuity confidence."
          />

          <RequirementCard
            label="Cross-Site"
            active={coordinationPattern.crossSiteEscalationRequired}
            body="Shows whether synchronization pressure should move into enterprise pattern review."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Cross-Site Handoff Question</p>
          <h2 style={styles.sectionTitle}>{coordinationPattern.crossSiteQuestion}</h2>
          <p style={styles.panelNote}>{coordinationPattern.enterpriseExposure}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem
              title="Executive Meaning"
              body={coordinationPattern.executiveMeaning}
            />
            <PriorityItem
              title="Synchronization Evidence"
              body={coordinationPattern.requiredSynchronizationEvidence}
            />
            <PriorityItem
              title="Pilot Chain Context"
              body={pilotThread.executiveThesis}
            />
          </div>
        </section>

        <section style={styles.requirementGrid}>
          <RequirementCard
            label="Coordination"
            active={coordinationReading.coordinationRequired}
            body="Ownership and routing synchronization must remain visible before continuity moves forward."
          />

          <RequirementCard
            label="Cross-Site"
            active={coordinationReading.crossSiteRequired}
            body="Distributed pressure, recurrence, or multi-site visibility requires enterprise comparison."
          />

          <RequirementCard
            label="Executive"
            active={coordinationReading.executiveReviewRequired}
            body="Leadership synthesis is required when coordination pressure threatens continuity confidence."
          />

          <RequirementCard
            label="Audit"
            active={coordinationReading.auditRequired}
            body="Coordination evidence must remain reconstructable across the lifecycle."
          />
        </section>

        <section style={styles.layoutGrid}>
          <section style={styles.card}>
            <p style={styles.sectionKicker}>Required Coordination Action</p>
            <h2 style={styles.sectionTitle}>{coordinationReading.requiredAction}</h2>
            <p style={styles.panelNote}>{coordinationReading.handoffReason}</p>

            <div style={styles.priorityGrid}>
              <PriorityItem title="Evidence Standard" body={coordinationReading.evidenceStandard} />
              <PriorityItem title="Continuity Risk" body={coordinationReading.continuityRisk} />
              <PriorityItem
                title="History"
                body={
                  coordinationReading.continuityHistoryRequired
                    ? 'Continuity history must preserve recurrence and synchronization memory.'
                    : 'Routine memory preservation is sufficient.'
                }
              />
            </div>

            <button onClick={loadCoordinationData} style={styles.primaryButton}>
              Refresh Coordination Synchronization
            </button>
          </section>

          <section style={styles.card}>
            <p style={styles.sectionKicker}>Generated Coordination Brief</p>
            <h2 style={styles.sectionTitle}>Synchronization brief</h2>

            <pre style={styles.summaryBox}>
              {coordinationBrief({
                reading: coordinationReading,
                pattern: coordinationPattern,
                totalCases: cases.length,
                activeCases: activeCases.length,
                stabilizedCases: stabilizedCases.length,
                escalatedCases: escalatedCases.length,
                criticalCases: criticalCases.length,
                safeguardingCases: safeguardingCases.length,
                stalledCases: stalledCases.length,
                recurrenceCases: recurrenceCases.length,
                institutions: institutions.length,
                activeInstitutions: activeInstitutions.length,
                activeResponders: activeResponders.length,
                routingActions: routingActions.length,
                interventions: interventions.length,
                outcomes: outcomes.length,
                interventionCoverage,
                outcomeCoverage,
                stabilizationRate,
              })}
            </pre>
          </section>
        </section>

        <section style={styles.layoutGrid}>
          <Panel
            title="Regional Coordination Visibility"
            note="Shows where stabilization pressure is appearing."
            rows={regionRows}
          />

          <Panel
            title="Institution Coordination Load"
            note="Shows routing load by coordination site."
            rows={institutionRows}
          />

          <Panel
            title="Responder Coordination Load"
            note="Shows routing load by responder network."
            rows={responderRows}
          />

          <Panel
            title="Lifecycle Coordination View"
            note="Shows where cases are sitting inside the stabilization pathway."
            rows={lifecycleRows}
          />
        </section>

        <section style={styles.doctrineCard}>
          <strong>COORDINATION SYNCHRONIZATION</strong>
          <span>
            Command decides movement. Coordination synchronizes ownership,
            routing, capacity, evidence, shared dependency, and response
            responsibility before continuity can safely move to Cross-Site,
            Situation Room, Executive Center, Audit, Recovery, or Stability
            Board.
          </span>
        </section>
      </div>
    </main>
  )
}

function buildCoordinationPatternReading(input: {
  cases: BeneficiaryCase[]
  institutions: Institution[]
  responders: Responder[]
  routingActions: RoutingAction[]
  recurrenceCases: number
  stalledCases: number
  escalatedCases: number
  criticalCases: number
  coordinationVisibleCases: number
  interventionCoverage: number
  outcomeCoverage: number
}): CoordinationPatternReading {
  const sharedRegionVisible = hasRepeatedValue(
    input.cases.map((item) => item.region || 'Region not recorded'),
  )

  const sharedInstitutionVisible = hasRepeatedValue(
    input.cases.map((item) => item.institution_name || 'Institution not recorded'),
  )

  const sharedResponderVisible = hasRepeatedValue(
    input.routingActions.map(
      (item) => item.assigned_responder_id || 'Responder not recorded',
    ),
  )

  const sharedOwnershipVisible = hasRepeatedValue(
    input.routingActions.map((item) => item.institution_id || 'Institution not recorded'),
  )

  const evidenceWeak =
    input.interventionCoverage < 50 || input.outcomeCoverage < 40

  const enterpriseSignal =
    input.criticalCases > 0 ||
    input.escalatedCases > 0 ||
    input.recurrenceCases > 0 ||
    input.coordinationVisibleCases > 2

  let patternType: CoordinationPatternType = 'ISOLATED_SYNCHRONIZATION'

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
    requiredSynchronizationEvidence: buildRequiredSynchronizationEvidence(
      patternType,
    ),
  }
}

function buildCoordinationReading(input: {
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
  coordinationPattern: CoordinationPatternReading
}): CoordinationReading {
  if (input.totalCases === 0) {
    return {
      status: 'COORDINATION_CLEAR',
      commandQuestion: 'Does continuity require synchronization?',
      chainPosition: 'Coordination is clear. No synchronization handoff is required.',
      synchronizationMeaning:
        'No active coordination-visible records exist. The system should preserve readiness without creating artificial escalation.',
      nextDestination: 'Monitoring',
      handoffReason:
        'There is no current ownership, routing, responder, or institutional pressure requiring coordination movement.',
      coordinationRequired: false,
      crossSiteRequired: false,
      executiveReviewRequired: false,
      auditRequired: false,
      continuityHistoryRequired: false,
      evidenceStandard: 'Routine monitoring evidence only.',
      requiredAction: 'Maintain coordination readiness.',
      continuityRisk: 'No active coordination risk is visible.',
    }
  }

  if (input.coordinationPattern.crossSiteEscalationRequired) {
    return {
      status: 'CROSS_SITE_COORDINATION_REQUIRED',
      commandQuestion:
        'Has coordination revealed a pattern larger than one site or operational lane?',
      chainPosition:
        'Coordination is preparing continuity for Cross-Site Review.',
      synchronizationMeaning:
        input.coordinationPattern.patternMeaning,
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
    }
  }

  if (
    input.escalatedCases > 0 ||
    input.criticalCases > 0 ||
    input.safeguardingCases > 0
  ) {
    return {
      status: 'EXECUTIVE_COORDINATION_PRESSURE',
      commandQuestion:
        'Must coordination escalate to executive synthesis before continuity can be trusted?',
      chainPosition:
        'Coordination is holding executive-relevant continuity pressure.',
      synchronizationMeaning:
        'Escalation, critical severity, or safeguarding visibility means coordination cannot remain only operational.',
      nextDestination: 'Executive Center',
      handoffReason:
        'Leadership synthesis is required because the coordination signal carries executive continuity meaning.',
      coordinationRequired: true,
      crossSiteRequired: input.recurrenceCases > 0 || input.coordinationVisibleCases > 2,
      executiveReviewRequired: true,
      auditRequired: true,
      continuityHistoryRequired: input.recurrenceCases > 0,
      evidenceStandard:
        'Preserve routing ownership, site involvement, responder capacity, escalation reason, safeguarding visibility, and executive rationale.',
      requiredAction: 'Move coordinated pressure to Executive Center.',
      continuityRisk:
        'Failure to escalate may allow executive-relevant instability to remain operationally buried.',
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
      status: 'COORDINATION_SYNCHRONIZATION_REQUIRED',
      commandQuestion:
        'Can continuity move forward before ownership and evidence are synchronized?',
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
    }
  }

  if (input.stabilizationRate >= 60 && input.outcomeCoverage >= 60) {
    return {
      status: 'RECOVERY_HANDOFF_AVAILABLE',
      commandQuestion:
        'Can coordination release continuity toward recovery verification?',
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
    }
  }

  return {
    status: 'COORDINATION_WATCH',
    commandQuestion:
      'Can continuity remain under coordination watch without escalation?',
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
  }
}

function coordinationBrief(input: {
  reading: CoordinationReading
  pattern: CoordinationPatternReading
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
TSINAXA CGI COORDINATION SYNCHRONIZATION BRIEF

Command Question:
${input.reading.commandQuestion}

Coordination Status:
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

Continuity Risk:
${input.reading.continuityRisk}

Executive Meaning:
${input.pattern.executiveMeaning}

Governance-Safe Meaning:
Coordination does not assign blame. It synchronizes ownership, routing, responder capacity, institutional load, evidence maturity, recovery readiness, and shared dependency so continuity does not move forward on weak or invisible foundations.
  `.trim()
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

function buildPatternName(patternType: CoordinationPatternType) {
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
  patternType: CoordinationPatternType,
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

function buildEnterpriseExposure(patternType: CoordinationPatternType) {
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

function buildPatternExecutiveMeaning(patternType: CoordinationPatternType) {
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

function buildCrossSiteQuestion(patternType: CoordinationPatternType) {
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

function buildRequiredSynchronizationEvidence(patternType: CoordinationPatternType) {
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

function groupedRows(items: string[]): PanelRow[] {
  const counts: Record<string, number> = {}

  items.forEach((item) => {
    counts[item] = (counts[item] || 0) + 1
  })

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value, detail: 'record(s)' }))
}

function Metric({
  label,
  value,
  suffix = '',
  textValue,
}: {
  label: string
  value?: number
  suffix?: string
  textValue?: string
}) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>

      <h2 style={textValue ? styles.metricTextValue : styles.metricValue}>
        {textValue || `${value ?? 0}${suffix}`}
      </h2>
    </div>
  )
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
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.chainValue}>{value}</p>
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

function PriorityItem({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <article style={styles.priorityItem}>
      <p style={styles.metricLabel}>{title}</p>
      <p style={styles.priorityBody}>{body}</p>
    </article>
  )
}

function Panel({
  title,
  note,
  rows,
}: {
  title: string
  note: string
  rows: PanelRow[]
}) {
  return (
    <div style={styles.card}>
      <p style={styles.sectionKicker}>{title}</p>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <p style={styles.panelNote}>{note}</p>

      <div style={styles.panelList}>
        {rows.length === 0 && <p style={styles.emptyText}>No data available yet.</p>}

        {rows.map((row, index) => (
          <div key={`${row.label}-${index}`} style={styles.panelRow}>
            <div>
              <strong>{row.label}</strong>
              <p style={styles.rowDetail}>{row.detail}</p>
            </div>

            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
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
  hero: {
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
    maxWidth: '880px',
    lineHeight: 1.65,
    fontSize: '14px',
    margin: 0,
  },
  message: {
    background: '#14210f',
    border: `1px solid ${softLine}`,
    color: '#e8dec8',
    padding: '14px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '20px',
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(260px, 0.8fr)',
    gap: '24px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '20px',
  },
  sectionKicker: {
    color: mutedGold,
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '10px',
  },
  heroTitle: {
    color: gold,
    fontSize: 'clamp(28px, 4vw, 42px)',
    lineHeight: 1.05,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  bodyText: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    fontSize: '13px',
    margin: 0,
  },
  statusBox: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '18px',
  },
  statusLabel: {
    color: mutedGold,
    fontWeight: 900,
    margin: '0 0 10px',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },
  statusValue: {
    color: '#fff8e7',
    fontSize: '30px',
    lineHeight: 1.1,
    margin: 0,
    fontWeight: 900,
  },
  chainPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  chainStep: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    minHeight: '88px',
  },
  chainStepActive: {
    background: '#201809',
    border: `1px solid ${gold}`,
  },
  chainValue: {
    color: '#fff8e7',
    fontSize: '13px',
    lineHeight: 1.25,
    fontWeight: 900,
    margin: '8px 0 0',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },
  metricCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
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
    color: gold,
    fontSize: '34px',
    margin: '8px 0 0',
    lineHeight: 1,
  },
  metricTextValue: {
    color: gold,
    fontSize: '17px',
    lineHeight: 1.3,
    margin: '10px 0 0',
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
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '20px',
    marginBottom: '24px',
  },
  card: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  sectionTitle: {
    color: '#fff8e7',
    fontSize: 'clamp(22px, 2vw, 28px)',
    lineHeight: 1.1,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  panelNote: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    fontSize: '13px',
    margin: '0 0 18px',
  },
  priorityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    margin: '18px 0',
  },
  priorityItem: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
  },
  priorityBody: {
    color: '#e8dec8',
    lineHeight: 1.5,
    margin: '8px 0 0',
    fontSize: '12px',
    fontWeight: 750,
  },
  primaryButton: {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    border: `1px solid ${gold}`,
    background: '#201809',
    color: '#fff8e7',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '14px',
  },
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
    color: '#e8dec8',
    lineHeight: 1.6,
    minHeight: '560px',
    fontSize: '12px',
  },
  panelList: {
    display: 'grid',
    gap: '10px',
  },
  panelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    color: '#fff8e7',
  },
  rowDetail: {
    color: '#cfc7b5',
    margin: '6px 0 0',
    fontSize: '12px',
  },
  emptyText: {
    color: '#cfc7b5',
  },
  doctrineCard: {
    display: 'grid',
    gridTemplateColumns: '240px minmax(0, 1fr)',
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