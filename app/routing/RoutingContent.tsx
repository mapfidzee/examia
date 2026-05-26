'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type StabilityCase = {
  id: string
  beneficiary_name: string
  beneficiary_level?: string | null
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
}

type StabilizationOwner = {
  id: string
  full_name: string
  operational_status: string
  region: string | null
  support_domains: string[] | null
}

type RoutingAction = {
  id: string
  case_id: string
  assigned_responder_id: string | null
  routing_status: string
  routing_reason: string | null
  created_at?: string | null
}

type AuditSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

type RoutingDecision =
  | 'ROUTE_TO_STABILIZATION_OWNER'
  | 'ESCALATE_FOR_GOVERNANCE_REVIEW'
  | 'REQUEST_EVIDENCE_BEFORE_MOVEMENT'
  | 'HOLD_FOR_OWNERSHIP_CLARITY'
  | 'MARK_ROUTING_STALLED'

type RoutingIntelligence = {
  phase: string
  nextMovement: string
  ownerPosture: string
  evidenceRequirement: string
  stallRisk: string
  commandMeaning: string
}

const GOVERNANCE_INSTITUTION = 'TSINAXA CGI'

const CGI_PRESSURE_TYPES = [
  'FLOW',
  'COVERAGE',
  'COORDINATION',
  'OWNERSHIP',
  'EVIDENCE',
  'RECOVERY',
  'RELIABILITY',
]

const ACTIVE_ROUTING_CASE_STATUSES = [
  'ACCEPTED_FOR_GOVERNANCE',
  'STABILIZATION_OWNER_ROUTED',
  'STABILIZATION_OWNER_ROUTED_RECURRENCE',
  'GOVERNANCE_REVIEW_REQUIRED',
  'GOVERNANCE_REVIEW_REQUIRED_RECURRENCE',
  'EVIDENCE_REQUIRED_BEFORE_ROUTING',
  'EVIDENCE_REQUIRED_BEFORE_ROUTING_RECURRENCE',
  'OWNERSHIP_CLARITY_REQUIRED',
  'OWNERSHIP_CLARITY_REQUIRED_RECURRENCE',
  'ROUTING_STALLED',
  'ROUTING_STALLED_RECURRENCE',
  'ESCALATED',
  'REOPENED',
]

const ROUTING_DECISIONS: {
  value: RoutingDecision
  label: string
  status: string
  reason: string
}[] = [
  {
    value: 'ROUTE_TO_STABILIZATION_OWNER',
    label: 'Route to stabilization owner',
    status: 'STABILIZATION_OWNER_ROUTED',
    reason:
      'Visible instability requires a responsible stabilization owner and governed next movement.',
  },
  {
    value: 'ESCALATE_FOR_GOVERNANCE_REVIEW',
    label: 'Escalate for governance review',
    status: 'GOVERNANCE_REVIEW_REQUIRED',
    reason:
      'Routing requires higher visibility before stabilization movement can proceed.',
  },
  {
    value: 'REQUEST_EVIDENCE_BEFORE_MOVEMENT',
    label: 'Request evidence before movement',
    status: 'EVIDENCE_REQUIRED_BEFORE_ROUTING',
    reason:
      'Evidence is insufficient for credible stabilization routing.',
  },
  {
    value: 'HOLD_FOR_OWNERSHIP_CLARITY',
    label: 'Hold for ownership clarity',
    status: 'OWNERSHIP_CLARITY_REQUIRED',
    reason:
      'Routing cannot proceed safely until ownership is clarified.',
  },
  {
    value: 'MARK_ROUTING_STALLED',
    label: 'Mark routing stalled',
    status: 'ROUTING_STALLED',
    reason:
      'Routing movement has stalled and requires command visibility.',
  },
]

export default function RoutingContent() {
  const [cases, setCases] = useState<StabilityCase[]>([])
  const [owners, setOwners] = useState<StabilizationOwner[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [selectedOwners, setSelectedOwners] = useState<Record<string, string>>({})
  const [selectedDecisions, setSelectedDecisions] = useState<
    Record<string, RoutingDecision | ''>
  >({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [casesResult, ownersResult, routingResult] = await Promise.all([
      supabase
        .from('beneficiary_cases')
        .select('*')
        .in('support_domain', CGI_PRESSURE_TYPES)
        .in('case_status', ACTIVE_ROUTING_CASE_STATUSES)
        .order('created_at', { ascending: false }),
      supabase.from('responders').select('*'),
      supabase
        .from('case_routing_actions')
        .select('*')
        .order('created_at', { ascending: false }),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (ownersResult.error) console.error(ownersResult.error)
    if (routingResult.error) console.error(routingResult.error)

    setCases(casesResult.data || [])
    setOwners(ownersResult.data || [])
    setRoutingActions(routingResult.data || [])
  }

  const activeCaseIds = useMemo(() => {
    return new Set(cases.map((caseItem) => caseItem.id))
  }, [cases])

  const activeRoutingActions = useMemo(() => {
    return routingActions.filter((item) => activeCaseIds.has(item.case_id))
  }, [routingActions, activeCaseIds])

  async function governRouting(caseItem: StabilityCase) {
    const decisionValue = selectedDecisions[caseItem.id]
    const selectedOwnerId = selectedOwners[caseItem.id] || null

    const priorRouting = activeRoutingActions.filter(
      (item) => item.case_id === caseItem.id
    )

    const latestRouting = priorRouting[0]
    const latestOwner = owners.find(
      (owner) => owner.id === latestRouting?.assigned_responder_id
    )

    const ownerId = selectedOwnerId || latestOwner?.id || null

    if (!decisionValue) {
      setMessage('Select a governed routing decision before preserving movement.')
      return
    }

    const decision = ROUTING_DECISIONS.find(
      (item) => item.value === decisionValue
    )

    if (!decision) return

    if (
      decision.value === 'ROUTE_TO_STABILIZATION_OWNER' &&
      !ownerId &&
      !latestOwner
    ) {
      setMessage(
        'Select a stabilization owner before routing this instability forward.'
      )
      return
    }

    const owner = owners.find((item) => item.id === ownerId)

    const recurrenceCount = priorRouting.length

    const routingStatus =
      recurrenceCount > 0
        ? `${decision.status}_RECURRENCE`
        : decision.status

    const routingReason =
      recurrenceCount > 0
        ? `${decision.reason} Previous routing activity exists for this active CGI case. Recurrence count: ${
            recurrenceCount + 1
          }.`
        : decision.reason

    const { data: routingAction, error } = await supabase
      .from('case_routing_actions')
      .insert({
        case_id: caseItem.id,
        assigned_responder_id: ownerId,
        routing_status: routingStatus,
        routing_reason: routingReason,
      })
      .select('id')
      .single()

    if (error) {
      alert(error.message)
      return
    }

    const { error: updateError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: routingStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseItem.id)

    if (updateError) {
      alert(updateError.message)
      return
    }

    await preserveRoutingEvidence({
      actionType:
        recurrenceCount > 0
          ? 'CGI_ROUTING_RECURRENCE_PRESERVED'
          : 'CGI_STABILIZATION_ROUTING_GOVERNED',
      severity: resolveRoutingSeverity({
        caseItem,
        recurrenceCount,
        routingStatus,
      }),
      recordType: 'beneficiary_cases',
      recordId: caseItem.id,
      summary: buildRoutingSummary({
        caseItem,
        owner,
        routingStatus,
        routingReason,
        recurrenceCount,
      }),
      caseItem,
      owner,
      routingActionId: routingAction?.id || null,
      routingStatus,
      routingReason,
      recurrenceCount,
    })

    setMessage(
      recurrenceCount > 0
        ? 'Routing recurrence preserved for this active CGI case.'
        : 'Governed stabilization routing preserved as continuity evidence.'
    )

    await loadData()
  }

  const metrics = useMemo(() => {
    const stalled = activeRoutingActions.filter((item) =>
      item.routing_status.includes('STALLED')
    ).length

    const evidenceRequired = activeRoutingActions.filter((item) =>
      item.routing_status.includes('EVIDENCE_REQUIRED')
    ).length

    const ownershipRequired = activeRoutingActions.filter((item) =>
      item.routing_status.includes('OWNERSHIP_CLARITY')
    ).length

    const recurrence = activeRoutingActions.filter((item) =>
      item.routing_status.includes('RECURRENCE')
    ).length

    const routed = activeRoutingActions.filter((item) =>
      item.routing_status.includes('STABILIZATION_OWNER_ROUTED')
    ).length

    return {
      activeCases: cases.length,
      routingActions: activeRoutingActions.length,
      routed,
      stalled,
      evidenceRequired,
      ownershipRequired,
      recurrence,
    }
  }, [cases, activeRoutingActions])

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • ROUTING INTELLIGENCE</p>

          <h1 style={styles.title}>Governed Stabilization Direction</h1>

          <p style={styles.subtitle}>
            Routing directs accepted instability toward the next credible
            stabilization movement. It governs ownership direction, evidence
            requirements, routing stall visibility, and recurrence without
            executing intervention work.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Routing Queue" value={metrics.activeCases} />
          <Metric label="Routing Actions" value={metrics.routingActions} />
          <Metric label="Routed" value={metrics.routed} />
          <Metric label="Stalled" value={metrics.stalled} />
          <Metric label="Evidence Required" value={metrics.evidenceRequired} />
          <Metric label="Ownership Clarity" value={metrics.ownershipRequired} />
          <Metric label="Recurrence" value={metrics.recurrence} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Active Stabilization Routing Queue
              </h2>

              <p style={styles.sectionText}>
                Triage accepts instability. Cases preserve lifecycle governance.
                Routing decides the next stabilization direction, owner posture,
                evidence need, and stall risk.
              </p>
            </div>
          </div>

          <div style={styles.caseList}>
            {cases.map((caseItem) => {
              const routingHistory = activeRoutingActions.filter(
                (item) => item.case_id === caseItem.id
              )

              const latestRouting = routingHistory[0]
              const latestOwner = owners.find(
                (owner) => owner.id === latestRouting?.assigned_responder_id
              )

              const intelligence = buildRoutingIntelligence({
                caseItem,
                routingHistory,
                latestOwner,
              })

              return (
                <article key={caseItem.id} style={styles.caseCard}>
                  <div style={styles.caseHeader}>
                    <div>
                      <p style={styles.caseKicker}>Accepted CGI Routing Case</p>

                      <h3 style={styles.caseName}>
                        {buildSimplifiedIdentity(caseItem)}
                      </h3>

                      <p style={styles.caseDomain}>
                        Full identity: {caseItem.beneficiary_name}
                      </p>
                    </div>

                    <span style={severityBadge(caseItem.severity_level)}>
                      {caseItem.severity_level}
                    </span>
                  </div>

                  <div style={styles.infoGrid}>
                    <Info label="Case State" value={caseItem.case_status} />

                    <Info
                      label="Latest Routing"
                      value={latestRouting?.routing_status || 'No routing yet'}
                    />

                    <Info
                      label="Stabilization Owner"
                      value={latestOwner?.full_name || 'Not assigned'}
                    />

                    <Info
                      label="Routing History"
                      value={`${routingHistory.length} preserved movement${
                        routingHistory.length === 1 ? '' : 's'
                      }`}
                    />

                    <Info
                      label="Site / Institution"
                      value={caseItem.institution_name || GOVERNANCE_INSTITUTION}
                    />

                    <Info
                      label="Region"
                      value={caseItem.region || 'Not provided'}
                    />
                  </div>

                  <div style={styles.signalContainer}>
                    <span style={styles.signalBadge}>
                      {caseItem.support_domain}
                    </span>

                    <span style={styles.signalBadge}>
                      {caseItem.severity_level}
                    </span>

                    {caseItem.safeguarding_flag && (
                      <span style={styles.signalBadge}>
                        EXECUTIVE_VISIBILITY
                      </span>
                    )}
                  </div>

                  <section style={styles.intelligencePanel}>
                    <p style={styles.intelligenceTitle}>
                      Routing Intelligence Panel
                    </p>

                    <div style={styles.intelligenceGrid}>
                      <Info label="Routing Phase" value={intelligence.phase} />

                      <Info
                        label="Required Next Movement"
                        value={intelligence.nextMovement}
                      />

                      <Info
                        label="Owner Posture"
                        value={intelligence.ownerPosture}
                      />

                      <Info
                        label="Evidence Requirement"
                        value={intelligence.evidenceRequirement}
                      />

                      <Info label="Stall Risk" value={intelligence.stallRisk} />

                      <Info
                        label="Command Meaning"
                        value={intelligence.commandMeaning}
                      />
                    </div>
                  </section>

                  <div style={styles.routingPanel}>
                    <div>
                      <label style={styles.label}>
                        Governed Routing Decision
                      </label>

                      <select
                        value={selectedDecisions[caseItem.id] || ''}
                        style={styles.select}
                        onChange={(event) =>
                          setSelectedDecisions((current) => ({
                            ...current,
                            [caseItem.id]: event.target.value as RoutingDecision,
                          }))
                        }
                      >
                        <option value="">Select routing decision</option>

                        {ROUTING_DECISIONS.map((decision) => (
                          <option key={decision.value} value={decision.value}>
                            {decision.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={styles.label}>
                        {latestOwner
                          ? 'Update / Reassign Stabilization Owner'
                          : 'Select Stabilization Owner'}
                      </label>

                      {latestOwner && (
                        <div style={styles.ownerConfirmedBox}>
                          Current owner: {latestOwner.full_name} •{' '}
                          {latestOwner.operational_status}
                        </div>
                      )}

                      <select
                        value={selectedOwners[caseItem.id] || ''}
                        style={styles.select}
                        onChange={(event) =>
                          setSelectedOwners((current) => ({
                            ...current,
                            [caseItem.id]: event.target.value,
                          }))
                        }
                      >
                        <option value="">
                          {latestOwner
                            ? 'Keep current owner'
                            : 'Select owner if required'}
                        </option>

                        {owners.map((owner) => (
                          <option key={owner.id} value={owner.id}>
                            {owner.full_name} • {owner.operational_status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={styles.meaningBox}>
                    <p style={styles.meaningTitle}>Routing interpretation</p>

                    <p style={styles.meaningText}>
                      {buildRoutingInterpretation(caseItem, routingHistory)}
                    </p>
                  </div>

                  <button
                    type="button"
                    style={styles.button}
                    onClick={() => governRouting(caseItem)}
                  >
                    Preserve Governed Routing Direction
                  </button>
                </article>
              )
            })}

            {cases.length === 0 && (
              <div style={styles.emptyState}>
                No accepted CGI cases are currently awaiting stabilization
                routing.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

async function preserveRoutingEvidence(input: {
  actionType: string
  severity: AuditSeverity
  recordType: string
  recordId: string
  summary: string
  caseItem: StabilityCase
  owner?: StabilizationOwner
  routingActionId: string | null
  routingStatus: string
  routingReason: string
  recurrenceCount: number
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const institution = input.caseItem.institution_name || GOVERNANCE_INSTITUTION

  const visibilityLevel =
    input.caseItem.safeguarding_flag ||
    input.caseItem.severity_level === 'CRITICAL' ||
    input.routingStatus.includes('STALLED') ||
    input.recurrenceCount > 0
      ? 'EXECUTIVE'
      : 'GOVERNANCE'

  const { error } = await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    email: user?.email ?? null,
    role: 'CGI_ROUTING_GOVERNANCE_ACTOR',

    action_type: input.actionType,
    route: '/routing',
    record_type: input.recordType,
    record_id: input.recordId,
    summary: input.summary,
    severity: input.severity,

    details: {
      evidence_type:
        input.recurrenceCount > 0
          ? 'CGI_ROUTING_RECURRENCE_EVIDENCE'
          : 'CGI_STABILIZATION_ROUTING_EVIDENCE',

      linked_routing_action_id: input.routingActionId,
      linked_case_id: input.recordId,

      pressure_type: input.caseItem.support_domain,
      routing_status: input.routingStatus,
      routing_reason: input.routingReason,

      stabilization_owner_id: input.owner?.id ?? null,
      stabilization_owner_name: input.owner?.full_name ?? null,
      stabilization_owner_status: input.owner?.operational_status ?? null,

      routing_recurrence_detected: input.recurrenceCount > 0,
      routing_recurrence_count: input.recurrenceCount + 1,

      governance_institution: institution,
      institution_name: institution,
      visibility_level: visibilityLevel,

      continuity_interpretation:
        input.recurrenceCount > 0
          ? 'Repeated routing movement indicates instability may not yet be stabilizing.'
          : 'Routing movement has been preserved as governed stabilization direction.',

      survivability_meaning: input.routingStatus.includes('STALLED')
        ? 'A stalled routing pathway may weaken stabilization credibility if unresolved.'
        : 'Routing has identified the next governed movement required for stabilization.',

      governance_boundary: 'NON_PUNITIVE_CONTINUITY_GOVERNANCE',
      actor_email: user?.email ?? null,
      actor_id: user?.id ?? null,
    },
  })

  if (error) console.error(error)
}

function buildSimplifiedIdentity(caseItem: StabilityCase) {
  const location = caseItem.beneficiary_level || caseItem.region || 'Unspecified site'

  return `${caseItem.support_domain} routing • ${location}`
}

function buildRoutingSummary(input: {
  caseItem: StabilityCase
  owner?: StabilizationOwner
  routingStatus: string
  routingReason: string
  recurrenceCount: number
}) {
  const identity = buildSimplifiedIdentity(input.caseItem)

  if (input.recurrenceCount > 0) {
    return `Routing recurrence preserved for ${identity}. Status: ${input.routingStatus}. Recurrence count: ${
      input.recurrenceCount + 1
    }.`
  }

  return `Governed stabilization routing preserved for ${identity}. Status: ${
    input.routingStatus
  }. Owner: ${input.owner?.full_name || 'Not assigned'}.`
}

function buildRoutingIntelligence(input: {
  caseItem: StabilityCase
  routingHistory: RoutingAction[]
  latestOwner?: StabilizationOwner
}): RoutingIntelligence {
  const { caseItem, routingHistory, latestOwner } = input
  const latestRouting = routingHistory[0]
  const hasOwner = Boolean(latestOwner)

  if (!latestRouting) {
    return {
      phase: 'Awaiting first routing decision',
      nextMovement: 'Select routing decision and owner posture',
      ownerPosture: 'Not yet assigned',
      evidenceRequirement: 'Routing evidence missing',
      stallRisk: 'Moderate if routing does not occur',
      commandMeaning:
        'Accepted instability has not yet been directed toward stabilization.',
    }
  }

  if (latestRouting.routing_status.includes('STALLED')) {
    return {
      phase: 'Routing stalled',
      nextMovement: 'Restore movement or escalate',
      ownerPosture: hasOwner ? 'Owner known but movement stalled' : 'Owner unclear',
      evidenceRequirement: 'Stall evidence must remain visible',
      stallRisk: 'High until routing resumes',
      commandMeaning:
        'Stalled routing weakens stabilization credibility and may need executive visibility.',
    }
  }

  if (latestRouting.routing_status.includes('EVIDENCE_REQUIRED')) {
    return {
      phase: 'Evidence gate',
      nextMovement: 'Preserve required evidence before movement',
      ownerPosture: hasOwner ? 'Owner available' : 'Owner may wait until evidence is clear',
      evidenceRequirement: 'Evidence required before credible routing',
      stallRisk: 'High if evidence remains missing',
      commandMeaning:
        'The case cannot move credibly until evidence is strong enough.',
    }
  }

  if (latestRouting.routing_status.includes('OWNERSHIP_CLARITY')) {
    return {
      phase: 'Ownership clarity gate',
      nextMovement: 'Clarify responsible stabilization owner',
      ownerPosture: 'Ownership unclear',
      evidenceRequirement: 'Ownership rationale required',
      stallRisk: 'High if no owner becomes clear',
      commandMeaning:
        'Unclear ownership can turn visible instability into unresolved continuity risk.',
    }
  }

  if (latestRouting.routing_status.includes('GOVERNANCE_REVIEW')) {
    return {
      phase: 'Governance review required',
      nextMovement: 'Resolve governance concern before downstream movement',
      ownerPosture: hasOwner ? 'Owner identified' : 'Owner pending review',
      evidenceRequirement: 'Governance review evidence required',
      stallRisk: 'Moderate to high until review clears',
      commandMeaning:
        'Routing is paused for governance judgment before stabilization proceeds.',
    }
  }

  if (latestRouting.routing_status.includes('RECURRENCE')) {
    return {
      phase: 'Routing recurrence',
      nextMovement: 'Review why routing repeated before stabilization held',
      ownerPosture: hasOwner ? 'Owner repeatedly engaged' : 'Owner still unclear',
      evidenceRequirement: 'Recurrence evidence preserved',
      stallRisk: 'High because repeated movement suggests unresolved instability',
      commandMeaning:
        'Repeated routing may signal that stabilization has not become reliable.',
    }
  }

  if (latestRouting.routing_status.includes('STABILIZATION_OWNER_ROUTED')) {
    return {
      phase: 'Routed to stabilization ownership',
      nextMovement: 'Begin or confirm intervention evidence in /interventions',
      ownerPosture: hasOwner ? `Assigned to ${latestOwner?.full_name}` : 'Owner missing',
      evidenceRequirement: 'Intervention evidence required next',
      stallRisk: hasOwner ? 'Low if intervention follows' : 'High if owner remains missing',
      commandMeaning:
        'Routing direction exists; stabilization credibility now depends on action evidence.',
    }
  }

  if (caseItem.severity_level === 'CRITICAL') {
    return {
      phase: 'Critical routing visibility',
      nextMovement: 'Preserve immediate routing decision and escalation logic',
      ownerPosture: hasOwner ? 'Owner identified' : 'Owner required urgently',
      evidenceRequirement: 'Immediate routing evidence required',
      stallRisk: 'High until direction is confirmed',
      commandMeaning:
        'Critical instability requires fast direction and executive awareness.',
    }
  }

  return {
    phase: 'Active routing governance',
    nextMovement: 'Continue governed stabilization direction',
    ownerPosture: hasOwner ? 'Owner identified' : 'Owner not assigned',
    evidenceRequirement: 'Routing evidence must remain traceable',
    stallRisk: 'Watch for delayed movement',
    commandMeaning:
      'Routing remains visible until the case can move credibly into stabilization action.',
  }
}

function buildRoutingInterpretation(
  caseItem: StabilityCase,
  routingHistory: RoutingAction[]
) {
  if (routingHistory.some((item) => item.routing_status.includes('STALLED'))) {
    return 'This case has stalled routing visibility. CGI should keep it visible until ownership, evidence, or next movement is restored.'
  }

  if (
    routingHistory.some((item) =>
      item.routing_status.includes('EVIDENCE_REQUIRED')
    )
  ) {
    return 'This case requires stronger evidence before stabilization movement can be treated as credible.'
  }

  if (
    routingHistory.some((item) =>
      item.routing_status.includes('OWNERSHIP_CLARITY')
    )
  ) {
    return 'This case has ownership uncertainty. Routing should not be treated as stable until responsibility is clear.'
  }

  if (routingHistory.length > 1) {
    return 'Repeated routing activity is present. CGI should preserve recurrence visibility and watch for unresolved instability.'
  }

  if (caseItem.severity_level === 'CRITICAL') {
    return 'Critical instability requires fast stabilization direction, evidence visibility, and executive awareness.'
  }

  return 'This case is ready for governed routing movement into stabilization action, evidence review, or ownership clarification.'
}

function resolveRoutingSeverity(input: {
  caseItem: StabilityCase
  recurrenceCount: number
  routingStatus: string
}): AuditSeverity {
  if (input.caseItem.severity_level === 'CRITICAL') return 'CRITICAL'

  if (
    input.routingStatus.includes('STALLED') ||
    input.recurrenceCount > 0 ||
    input.caseItem.safeguarding_flag
  ) {
    return 'HIGH'
  }

  if (input.caseItem.severity_level === 'HIGH') return 'HIGH'
  if (input.caseItem.severity_level === 'MODERATE') return 'MODERATE'

  return 'LOW'
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <h2 style={styles.metricValue}>{value}</h2>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoBox}>
      <p style={styles.infoLabel}>{label}</p>
      <p style={styles.infoValue}>{value}</p>
    </div>
  )
}

function severityBadge(level: string): CSSProperties {
  if (level === 'CRITICAL') {
    return {
      ...styles.badge,
      background: '#7f1d1d',
      color: '#fecaca',
    }
  }

  if (level === 'HIGH') {
    return {
      ...styles.badge,
      background: '#7c2d12',
      color: '#fdba74',
    }
  }

  if (level === 'MODERATE') {
    return {
      ...styles.badge,
      background: '#713f12',
      color: '#fde68a',
    }
  }

  return {
    ...styles.badge,
    background: '#064e3b',
    color: '#a7f3d0',
  }
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: 'white',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  hero: {
    marginBottom: '32px',
  },

  kicker: {
    color: '#14b8a6',
    fontWeight: 900,
    letterSpacing: '2px',
    fontSize: '12px',
  },

  title: {
    fontSize: 'clamp(34px, 6vw, 56px)',
    lineHeight: 1.05,
    margin: '12px 0',
  },

  subtitle: {
    color: '#cbd5e1',
    maxWidth: '940px',
    lineHeight: 1.7,
    fontSize: '18px',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },

  metricCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '20px',
  },

  metricLabel: {
    color: '#94a3b8',
    fontWeight: 800,
    margin: 0,
    fontSize: '13px',
  },

  metricValue: {
    fontSize: '36px',
    margin: '8px 0 0',
  },

  message: {
    background: '#064e3b',
    color: '#ccfbf1',
    padding: '16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '20px',
    lineHeight: 1.6,
  },

  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '24px',
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },

  sectionTitle: {
    fontSize: '28px',
    margin: 0,
  },

  sectionText: {
    color: '#94a3b8',
    lineHeight: 1.7,
    maxWidth: '850px',
  },

  caseList: {
    display: 'grid',
    gap: '18px',
  },

  caseCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '20px',
  },

  caseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },

  caseKicker: {
    color: '#14b8a6',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '1.5px',
    margin: '0 0 8px',
  },

  caseName: {
    fontSize: '20px',
    margin: 0,
    lineHeight: 1.35,
    wordBreak: 'break-word',
  },

  caseDomain: {
    color: '#94a3b8',
    marginTop: '6px',
    fontSize: '12px',
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },

  badge: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontWeight: 900,
    fontSize: '12px',
    height: 'fit-content',
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginTop: '18px',
  },

  infoBox: {
    background: '#020617',
    borderRadius: '14px',
    padding: '12px',
    border: '1px solid #1e293b',
  },

  infoLabel: {
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    margin: 0,
  },

  infoValue: {
    margin: '6px 0 0',
    lineHeight: 1.45,
    fontSize: '13px',
    wordBreak: 'break-word',
  },

  signalContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '18px',
  },

  signalBadge: {
    background: '#111827',
    color: '#a7f3d0',
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: 800,
    border: '1px solid rgba(167,243,208,0.22)',
  },

  intelligencePanel: {
    marginTop: '20px',
    background: '#020617',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },

  intelligenceTitle: {
    color: '#5eead4',
    fontWeight: 900,
    margin: '0 0 14px',
  },

  intelligenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
  },

  routingPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '14px',
    marginTop: '20px',
  },

  label: {
    display: 'block',
    fontWeight: 800,
    marginBottom: '10px',
  },

  ownerConfirmedBox: {
    background: '#042f2e',
    border: '1px solid #115e59',
    color: '#ccfbf1',
    borderRadius: '12px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: 800,
    marginBottom: '10px',
  },

  select: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
  },

  meaningBox: {
    marginTop: '18px',
    background: '#042f2e',
    border: '1px solid #115e59',
    borderRadius: '16px',
    padding: '14px',
  },

  meaningTitle: {
    color: '#5eead4',
    fontWeight: 900,
    margin: 0,
  },

  meaningText: {
    color: '#ccfbf1',
    lineHeight: 1.6,
    margin: '8px 0 0',
  },

  button: {
    width: '100%',
    marginTop: '18px',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #14b8a6',
    background: '#0f766e',
    color: 'white',
    fontWeight: 900,
    cursor: 'pointer',
  },

  emptyState: {
    border: '1px dashed #334155',
    borderRadius: '18px',
    padding: '24px',
    color: '#94a3b8',
    textAlign: 'center',
  },
}