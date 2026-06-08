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
    setMessage('Enterprise coordination intelligence refreshed.')
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

  const uniqueInterventionCases = new Set(
    interventions.map((item) => item.case_id),
  ).size

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
          <div>
            <p style={styles.kicker}>TSINAXA CGI • ENTERPRISE COORDINATION</p>

            <h1 style={styles.title}>Enterprise Coordination Intelligence</h1>

            <p style={styles.subtitle}>
              Coordination governs the dependencies that must synchronize before
              continuity can safely move. It protects ownership, routing,
              responder capacity, institutional load, evidence maturity,
              recovery readiness, and shared dependency visibility before
              Cross-Site, Situation Room, Executive Center, or Audit receives the
              chain.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>COORDINATION POSTURE</p>
            <p style={styles.statusValue}>{coordinationReading.status}</p>
            <p style={styles.statusMeaning}>
              {coordinationReading.synchronizationMeaning}
            </p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Executive Coordination Question</p>

            <h2 style={styles.commandTitle}>
              {coordinationReading.executiveQuestion}
            </h2>

            <p style={styles.primaryText}>
              {coordinationReading.chainPosition}
            </p>

            <div style={styles.commandMetaGrid}>
              <MiniStat label="Pattern" value={coordinationPattern.patternName} />
              <MiniStat label="Next" value={coordinationReading.nextDestination} />
              <MiniStat
                label="Cross-Site"
                value={coordinationReading.crossSiteRequired ? 'REQUIRED' : 'CONDITIONAL'}
              />
              <MiniStat
                label="Audit"
                value={coordinationReading.auditRequired ? 'REQUIRED' : 'CONDITIONAL'}
              />
            </div>
          </div>

          <div style={styles.consequenceCard}>
            <p style={styles.sectionKicker}>Board Warning</p>

            <h2 style={styles.consequenceTitle}>
              Unsynchronized dependencies create false continuity confidence.
            </h2>

            <p style={styles.bodyText}>{coordinationReading.boardWarning}</p>
          </div>
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

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Synchronization Pattern"
            value={coordinationPattern.patternName}
            body={coordinationPattern.patternMeaning}
          />

          <ExecutiveCard
            title="Enterprise Exposure"
            value={coordinationPattern.enterpriseExposure}
            body="Whether coordination pressure is still local or becoming enterprise-visible."
          />

          <ExecutiveCard
            title="Executive Meaning"
            value={coordinationPattern.executiveMeaning}
            body="What leadership should understand before the chain moves forward."
          />

          <ExecutiveCard
            title="Cross-Site Question"
            value={coordinationPattern.crossSiteQuestion}
            body="The question Coordination hands to Cross-Site when dependency visibility expands."
          />
        </section>

        <section style={styles.gridFour}>
          <RequirementCard
            label="Shared Ownership"
            active={coordinationPattern.sharedOwnershipVisible}
            body="Whether multiple records are converging around the same ownership structure."
          />

          <RequirementCard
            label="Shared Institution"
            active={coordinationPattern.sharedInstitutionVisible}
            body="Whether institutional load may be creating distributed coordination pressure."
          />

          <RequirementCard
            label="Shared Responder"
            active={coordinationPattern.sharedResponderVisible}
            body="Whether responder concentration may weaken continuity confidence."
          />

          <RequirementCard
            label="Shared Region"
            active={coordinationPattern.sharedRegionVisible}
            body="Whether visible pressure may be regional rather than isolated."
          />
        </section>

        <section style={styles.memoryPanel}>
          <p style={styles.sectionKicker}>Synchronization Memory</p>

          <h2 style={styles.panelTitle}>
            The institution must remember which dependencies repeatedly require
            synchronization.
          </h2>

          <div style={styles.memoryGrid}>
            <MiniStat label="Regions" value={String(regionRows.length)} />
            <MiniStat label="Institutions" value={String(institutions.length)} />
            <MiniStat label="Responders" value={String(responders.length)} />
            <MiniStat label="Lifecycle States" value={String(lifecycleRows.length)} />
          </div>
        </section>
                <section style={styles.gridTwo}>
          <Panel title="Coordination Movement Requirements">
            <Info label="Required Action" value={coordinationReading.requiredAction} />
            <Info label="Handoff Reason" value={coordinationReading.handoffReason} />
            <Info label="Continuity Risk" value={coordinationReading.continuityRisk} />
            <Info
              label="Synchronization Evidence"
              value={coordinationPattern.requiredSynchronizationEvidence}
            />
          </Panel>

          <Panel title="Enterprise Movement Gates">
            <Info
              label="Coordination"
              value={coordinationReading.coordinationRequired ? 'REQUIRED' : 'WATCH'}
            />
            <Info
              label="Cross-Site"
              value={coordinationReading.crossSiteRequired ? 'REQUIRED' : 'CONDITIONAL'}
            />
            <Info
              label="Executive"
              value={
                coordinationReading.executiveReviewRequired
                  ? 'REQUIRED'
                  : 'CONDITIONAL'
              }
            />
            <Info
              label="Audit"
              value={coordinationReading.auditRequired ? 'REQUIRED' : 'CONDITIONAL'}
            />
          </Panel>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Coordination Refresh</p>

            <h2 style={styles.actionTitle}>
              Refresh enterprise synchronization intelligence.
            </h2>

            <p style={styles.actionText}>
              Refreshing reloads cases, institutions, responders, routing
              actions, interventions, and outcomes before recalculating
              dependency posture.
            </p>
          </div>

          <button onClick={loadCoordinationData} style={styles.primaryButton}>
            Refresh Coordination
          </button>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Regional Synchronization Memory">
            <RowList rows={regionRows} />
          </Panel>

          <Panel title="Institution Synchronization Memory">
            <RowList rows={institutionRows} />
          </Panel>

          <Panel title="Responder Synchronization Memory">
            <RowList rows={responderRows} />
          </Panel>

          <Panel title="Lifecycle Synchronization Memory">
            <RowList rows={lifecycleRows} />
          </Panel>
        </section>

        <section style={styles.orderPanel}>
          <p style={styles.sectionKicker}>Copy-Ready Coordination Brief</p>

          <h2 style={styles.panelTitle}>
            What dependencies must synchronize before continuity can move?
          </h2>

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

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE COORDINATION DOCTRINE</strong>

          <span>
            Command decides movement. Coordination synchronizes dependency.
            Cross-Site compares pattern. Situation Room interprets operating
            condition. Executive Center governs meaning. Audit preserves
            reconstructability. Continuity must not move forward on hidden
            ownership, routing, responder, institutional, evidence, recovery, or
            shared dependency weakness.
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
    requiredSynchronizationEvidence:
      buildRequiredSynchronizationEvidence(patternType),
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
      status: 'COORDINATION CLEAR',
      commandQuestion: 'Does continuity require synchronization?',
      executiveQuestion:
        'Can continuity remain clear without unnecessary synchronization?',
      chainPosition: 'Coordination is clear. No synchronization handoff is required.',
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
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>

      <p style={textValue ? styles.metricTextValue : styles.metricValue}>
        {textValue || `${value ?? 0}${suffix}`}
      </p>
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
        ...styles.panelCard,
        ...(active ? styles.activePanelCard : {}),
      }}
    >
      <p style={styles.sectionKicker}>{label}</p>
      <h3 style={styles.cardValue}>{active ? 'REQUIRED' : 'WATCH'}</h3>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function Panel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
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

function RowList({ rows }: { rows: PanelRow[] }) {
  return (
    <div style={styles.rowList}>
      {rows.length === 0 && (
        <p style={styles.emptyText}>No synchronization memory available yet.</p>
      )}

      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`} style={styles.rowItem}>
          <div>
            <strong style={styles.rowLabel}>{row.label}</strong>
            <p style={styles.rowDetail}>{row.detail}</p>
          </div>

          <strong style={styles.rowValue}>{row.value}</strong>
        </div>
      ))}
    </div>
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
    overflowWrap: 'anywhere',
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
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
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
    fontSize: 28,
    fontWeight: 950,
    lineHeight: 1.15,
    overflowWrap: 'anywhere',
  },
  metricTextValue: {
    margin: '10px 0 0',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 950,
    lineHeight: 1.25,
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
  activePanelCard: {
    background:
      'linear-gradient(135deg, rgba(201,162,39,0.14), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.38)',
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
    gridTemplateColumns: '190px minmax(0, 1fr)',
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
  actionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 16,
    alignItems: 'center',
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(201,162,39,0.24)',
  },
  actionTitle: {
    margin: '12px 0 0',
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.04em',
  },
  actionText: {
    margin: '12px 0 0',
    color: '#AEB6C2',
    lineHeight: 1.7,
    maxWidth: 820,
  },
  primaryButton: {
    border: 'none',
    borderRadius: 999,
    padding: '14px 22px',
    background: '#C9A227',
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  rowList: {
    display: 'grid',
    gap: 10,
  },
  rowItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  rowLabel: {
    color: '#FFFFFF',
    lineHeight: 1.35,
  },
  rowDetail: {
    color: '#AEB6C2',
    margin: '6px 0 0',
    fontSize: 12,
    lineHeight: 1.4,
  },
  rowValue: {
    color: '#D7B84C',
    fontSize: 18,
  },
  emptyText: {
    margin: 0,
    color: '#AEB6C2',
    lineHeight: 1.6,
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