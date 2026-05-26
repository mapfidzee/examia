'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type StabilityCase = {
  id: string
  beneficiary_name: string
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
  const [selectedOwners, setSelectedOwners] = useState<Record<string, string>>(
    {}
  )
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

  async function governRouting(caseItem: StabilityCase) {
    const decisionValue = selectedDecisions[caseItem.id]
    const ownerId = selectedOwners[caseItem.id] || null

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
      !ownerId
    ) {
      setMessage(
        'Select a stabilization owner before routing this instability forward.'
      )
      return
    }

    const owner = owners.find((item) => item.id === ownerId)

    const priorRouting = routingActions.filter(
      (item) => item.case_id === caseItem.id
    )

    const recurrenceCount = priorRouting.length

    const routingStatus =
      recurrenceCount > 0
        ? `${decision.status}_RECURRENCE`
        : decision.status

    const routingReason =
      recurrenceCount > 0
        ? `${decision.reason} Previous routing activity exists. Recurrence count: ${
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
        ? 'Routing recurrence preserved. CGI kept the instability visible instead of hiding repeated movement.'
        : 'Governed stabilization routing preserved as continuity evidence.'
    )

    await loadData()
  }

  const metrics = useMemo(() => {
    const stalled = routingActions.filter((item) =>
      item.routing_status.includes('STALLED')
    ).length

    const evidenceRequired = routingActions.filter((item) =>
      item.routing_status.includes('EVIDENCE_REQUIRED')
    ).length

    const ownershipRequired = routingActions.filter((item) =>
      item.routing_status.includes('OWNERSHIP_CLARITY')
    ).length

    const recurrence = routingActions.filter((item) =>
      item.routing_status.includes('RECURRENCE')
    ).length

    return {
      activeCases: cases.length,
      routingActions: routingActions.length,
      stalled,
      evidenceRequired,
      ownershipRequired,
      recurrence,
    }
  }, [cases, routingActions])

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • STABILIZATION ROUTING</p>

          <h1 style={styles.title}>Governed Stabilization Routing</h1>

          <p style={styles.subtitle}>
            Direct visible instability into the next governed stabilization
            movement. Routing in CGI is not assignment. It decides where the
            instability must go next, who owns the next movement, what evidence
            is required, and whether routing has stalled.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Active CGI Cases" value={metrics.activeCases} />
          <Metric label="Routing Actions" value={metrics.routingActions} />
          <Metric label="Routing Stalled" value={metrics.stalled} />
          <Metric label="Evidence Required" value={metrics.evidenceRequired} />
          <Metric label="Ownership Clarity" value={metrics.ownershipRequired} />
          <Metric label="Routing Recurrence" value={metrics.recurrence} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Active Stabilization Routing Queue
              </h2>

              <p style={styles.sectionText}>
                Each case below represents visible instability already accepted
                into governance. Use this surface to preserve the next routing
                movement without losing ownership, urgency, evidence, or stall
                visibility.
              </p>
            </div>
          </div>

          <div style={styles.caseList}>
            {cases.map((caseItem) => {
              const routingHistory = routingActions.filter(
                (item) => item.case_id === caseItem.id
              )

              const latestRouting = routingHistory[0]

              return (
                <article key={caseItem.id} style={styles.caseCard}>
                  <div style={styles.caseHeader}>
                    <div>
                      <p style={styles.caseKicker}>CGI Instability Case</p>

                      <h3 style={styles.caseName}>
                        {buildCaseIdentity(caseItem)}
                      </h3>

                      <p style={styles.caseDomain}>
                        Pressure type: {caseItem.support_domain}
                      </p>
                    </div>

                    <span style={severityBadge(caseItem.severity_level)}>
                      {caseItem.severity_level}
                    </span>
                  </div>

                  <div style={styles.infoGrid}>
                    <Info label="Current State" value={caseItem.case_status} />

                    <Info
                      label="Site / Institution"
                      value={caseItem.institution_name || GOVERNANCE_INSTITUTION}
                    />

                    <Info
                      label="Region"
                      value={caseItem.region || 'Not provided'}
                    />

                    <Info
                      label="Routing History"
                      value={`${routingHistory.length} preserved movement${
                        routingHistory.length === 1 ? '' : 's'
                      }`}
                    />

                    <Info
                      label="Latest Routing"
                      value={latestRouting?.routing_status || 'No routing yet'}
                    />

                    <Info
                      label="Executive Visibility"
                      value={
                        caseItem.safeguarding_flag ||
                        caseItem.severity_level === 'CRITICAL'
                          ? 'Required'
                          : 'Governance level'
                      }
                    />
                  </div>

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
                            [caseItem.id]: event.target
                              .value as RoutingDecision,
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
                        Stabilization Owner
                      </label>

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
                        <option value="">Select owner if required</option>

                        {owners.map((owner) => (
                          <option key={owner.id} value={owner.id}>
                            {owner.full_name} • {owner.operational_status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={styles.meaningBox}>
                    <p style={styles.meaningTitle}>
                      Routing interpretation
                    </p>

                    <p style={styles.meaningText}>
                      {buildRoutingInterpretation(caseItem, routingHistory)}
                    </p>
                  </div>

                  <button
                    type="button"
                    style={styles.button}
                    onClick={() => governRouting(caseItem)}
                  >
                    Preserve Governed Routing Movement
                  </button>
                </article>
              )
            })}

            {cases.length === 0 && (
              <div style={styles.emptyState}>
                No active CGI pressure cases are currently available for
                stabilization routing.
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

  const institution =
    input.caseItem.institution_name || GOVERNANCE_INSTITUTION

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

      survivability_meaning:
        input.routingStatus.includes('STALLED')
          ? 'A stalled routing pathway may weaken stabilization credibility if unresolved.'
          : 'Routing has identified the next governed movement required for stabilization.',

      governance_boundary: 'NON_PUNITIVE_CONTINUITY_GOVERNANCE',
      actor_email: user?.email ?? null,
      actor_id: user?.id ?? null,
    },
  })

  if (error) console.error(error)
}

function buildCaseIdentity(caseItem: StabilityCase) {
  const site = caseItem.institution_name || GOVERNANCE_INSTITUTION
  const region = caseItem.region || 'Unspecified region'

  return `${caseItem.support_domain} instability • ${site} • ${region}`
}

function buildRoutingSummary(input: {
  caseItem: StabilityCase
  owner?: StabilizationOwner
  routingStatus: string
  routingReason: string
  recurrenceCount: number
}) {
  const identity = buildCaseIdentity(input.caseItem)

  if (input.recurrenceCount > 0) {
    return `Routing recurrence preserved for ${identity}. Status: ${input.routingStatus}. Recurrence count: ${
      input.recurrenceCount + 1
    }.`
  }

  return `Governed stabilization routing preserved for ${identity}. Status: ${
    input.routingStatus
  }. Owner: ${input.owner?.full_name || 'Not assigned'}.`
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
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
  },

  metricValue: {
    fontSize: '38px',
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
    fontSize: '23px',
    margin: 0,
    lineHeight: 1.25,
  },

  caseDomain: {
    color: '#99f6e4',
    marginTop: '8px',
  },

  badge: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontWeight: 900,
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
    fontSize: '12px',
    fontWeight: 900,
    margin: 0,
  },

  infoValue: {
    margin: '6px 0 0',
    lineHeight: 1.5,
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