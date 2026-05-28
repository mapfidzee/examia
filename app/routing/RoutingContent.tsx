'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
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

  const activeCaseIds = useMemo(
    () => new Set(cases.map((caseItem) => caseItem.id)),
    [cases],
  )

  const activeRoutingActions = useMemo(
    () => routingActions.filter((item) => activeCaseIds.has(item.case_id)),
    [routingActions, activeCaseIds],
  )

  const routingClimate = useMemo(
    () =>
      buildRoutingClimate({
        cases,
        routingActions: activeRoutingActions,
      }),
    [cases, activeRoutingActions],
  )

  async function governRouting(caseItem: StabilityCase) {
    const decisionValue = selectedDecisions[caseItem.id]
    const selectedOwnerId = selectedOwners[caseItem.id] || null

    const priorRouting = activeRoutingActions.filter(
      (item) => item.case_id === caseItem.id,
    )

    const latestRouting = priorRouting[0]
    const latestOwner = owners.find(
      (owner) => owner.id === latestRouting?.assigned_responder_id,
    )

    const ownerId = selectedOwnerId || latestOwner?.id || null

    if (!decisionValue) {
      setMessage('Select a governed routing decision before preserving movement.')
      return
    }

    const decision = ROUTING_DECISIONS.find((item) => item.value === decisionValue)

    if (!decision) return

    if (decision.value === 'ROUTE_TO_STABILIZATION_OWNER' && !ownerId) {
      setMessage('Select a stabilization owner before routing this instability forward.')
      return
    }

    const owner = owners.find((item) => item.id === ownerId)
    const recurrenceCount = priorRouting.length

    const routingStatus =
      recurrenceCount > 0 ? `${decision.status}_RECURRENCE` : decision.status

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
        ? 'Routing recurrence preserved. Continuity direction, ownership visibility, and structural traceability remain operationally visible.'
        : 'Governed stabilization routing preserved. Continuity direction, ownership posture, and lifecycle movement are now visible.',
    )

    await loadData()
  }

  const climatePanels = [
    {
      title: 'Routing Stability Climate',
      value: routingClimate.stabilityClimate,
    },
    {
      title: 'Ownership Direction Posture',
      value: routingClimate.ownerPosture,
    },
    {
      title: 'Evidence Gate Visibility',
      value: routingClimate.evidenceVisibility,
    },
    {
      title: 'Action Readiness Landscape',
      value: routingClimate.actionLandscape,
    },
  ]

  return (
    <main className="min-h-screen text-neutral-100">
      <section className="mx-auto max-w-7xl px-6 py-8">
        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-100">
            {message}
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
          TSINAXA CGI • ROUTING DIRECTION INTELLIGENCE
        </p>

        <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white">
            Governed Stabilization Direction
          </h2>

          <p className="mt-3 max-w-5xl text-sm leading-6 text-neutral-300">
            Direct accepted instability toward the next credible stabilization
            movement. Preserve ownership direction, evidence requirements, routing
            stall visibility, recurrence awareness, directional confidence, and
            command meaning before intervention action begins.
          </p>

          <p className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
            <span className="font-semibold">Boundary:</span> /routing governs
            stabilization direction. It does not execute intervention action,
            verify outcomes, declare recovery durability, or erase structural
            continuity memory.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {climatePanels.map((panel) => (
            <div
              key={panel.title}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
            >
              <p className="text-sm font-semibold text-white">{panel.title}</p>
              <p className="mt-3 text-sm leading-6 text-neutral-400">
                {panel.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-lg font-semibold text-white">
            Routing Pressure Intelligence
          </h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {routingClimate.pressureMeaning}
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-lg font-semibold text-white">
            Executive Routing Synthesis
          </h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {routingClimate.commandInheritance}
          </p>
        </div>

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-xl font-semibold text-white">
            Active Stabilization Routing Queue
          </h3>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Triage accepts visible instability. Case governance preserves lifecycle
            context. Routing determines stabilization direction, ownership posture,
            evidence gate, directional maturity, and action readiness without
            performing the intervention itself.
          </p>

          <div className="mt-6 grid gap-5">
            {cases.map((caseItem) => {
              const routingHistory = activeRoutingActions.filter(
                (item) => item.case_id === caseItem.id,
              )

              const latestRouting = routingHistory[0]
              const latestOwner = owners.find(
                (owner) => owner.id === latestRouting?.assigned_responder_id,
              )

              const intelligence = buildRoutingIntelligence({
                caseItem,
                routingHistory,
                latestOwner,
              })

              return (
                <article
                  key={caseItem.id}
                  className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                        Accepted CGI Routing Case
                      </p>

                      <h4 className="mt-2 text-xl font-semibold text-white">
                        {buildSimplifiedIdentity(caseItem)}
                      </h4>

                      <p className="mt-2 text-xs leading-5 text-neutral-500">
                        Full identity: {caseItem.beneficiary_name}
                      </p>
                    </div>

                    <span className={severityBadgeClass(caseItem.severity_level)}>
                      {caseItem.severity_level}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <Info label="Case State" value={caseItem.case_status} />
                    <Info
                      label="Latest Routing"
                      value={latestRouting?.routing_status || 'Routing direction pending'}
                    />
                    <Info
                      label="Stabilization Owner"
                      value={latestOwner?.full_name || 'Ownership direction pending'}
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
                    <Info label="Region" value={caseItem.region || 'Not provided'} />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <SignalBadge>{caseItem.support_domain}</SignalBadge>
                    <SignalBadge>{caseItem.severity_level}</SignalBadge>
                    {caseItem.safeguarding_flag && (
                      <SignalBadge>EXECUTIVE_VISIBILITY</SignalBadge>
                    )}
                  </div>

                  <section className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                    <p className="text-sm font-semibold text-cyan-400">
                      Routing Intelligence Panel
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <Info label="Routing Phase" value={intelligence.phase} />
                      <Info label="Directional Maturity" value={intelligence.maturity} />
                      <Info
                        label="Directional Confidence"
                        value={intelligence.confidence}
                      />
                      <Info
                        label="Required Next Movement"
                        value={intelligence.nextMovement}
                      />
                      <Info label="Owner Posture" value={intelligence.ownerPosture} />
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

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        Governed Routing Decision
                      </span>

                      <select
                        value={selectedDecisions[caseItem.id] || ''}
                        className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
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
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        {latestOwner
                          ? 'Update / Reassign Stabilization Owner'
                          : 'Select Stabilization Owner'}
                      </span>

                      {latestOwner && (
                        <div className="mt-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-sm font-semibold text-cyan-100">
                          Current owner: {latestOwner.full_name} •{' '}
                          {latestOwner.operational_status}
                        </div>
                      )}

                      <select
                        value={selectedOwners[caseItem.id] || ''}
                        className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
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
                    </label>
                  </div>

                  <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                    <p className="text-sm font-semibold text-cyan-100">
                      Routing Interpretation
                    </p>
                    <p className="mt-2 text-sm leading-6 text-cyan-50">
                      {buildRoutingInterpretation(caseItem, routingHistory)}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="mt-5 w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-cyan-300"
                    onClick={() => governRouting(caseItem)}
                  >
                    Preserve Governed Routing Direction
                  </button>
                </article>
              )
            })}

            {cases.length === 0 && (
              <div className="rounded-3xl border border-dashed border-neutral-700 bg-neutral-950 p-8 text-center text-sm leading-6 text-neutral-400">
                No accepted CGI cases are currently awaiting stabilization routing.
                Routing direction intelligence will activate when accepted
                instability enters the routing lifecycle.
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-xl font-semibold text-white">
            Routing Governance Doctrine
          </h3>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Routing is direction governance, not action execution. CGI preserves
            ownership direction, evidence gates, recurrence visibility, directional
            confidence, stall risk, and command meaning before stabilization action
            begins.
          </p>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature routing intelligence must preserve proportional continuity
            interpretation. When accepted instability is directed toward credible
            stabilization ownership without recurrence, evidence gaps, stalled
            movement, or structural deterioration, the system should support measured
            continuity confidence while preserving traceability, executive synthesis
            readiness, and lifecycle discipline.
          </p>
        </section>
      </section>
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

function buildRoutingClimate(input: {
  cases: StabilityCase[]
  routingActions: RoutingAction[]
}) {
  if (input.cases.length === 0) {
    return {
      stabilityClimate:
        'Awaiting accepted instability before routing climate interpretation activates.',
      ownerPosture:
        'Ownership direction posture will activate when a case enters routing governance.',
      evidenceVisibility:
        'Evidence gate visibility pending accepted routing case activity.',
      actionLandscape:
        'Action readiness visibility pending governed routing direction.',
      pressureMeaning:
        'Routing direction interpretation will activate when accepted instability enters the routing lifecycle.',
      commandInheritance:
        'No active routing concentration currently requiring executive continuity synthesis.',
    }
  }

  const stalled = input.routingActions.filter((item) =>
    item.routing_status.includes('STALLED'),
  ).length

  const evidenceRequired = input.routingActions.filter((item) =>
    item.routing_status.includes('EVIDENCE_REQUIRED'),
  ).length

  const ownershipRequired = input.routingActions.filter((item) =>
    item.routing_status.includes('OWNERSHIP_CLARITY'),
  ).length

  const recurrence = input.routingActions.filter((item) =>
    item.routing_status.includes('RECURRENCE'),
  ).length

  const routed = input.routingActions.filter((item) =>
    item.routing_status.includes('STABILIZATION_OWNER_ROUTED'),
  ).length

  return {
    stabilityClimate:
      recurrence === 0
        ? 'Routing conditions remain proportionally balanced under current continuity direction visibility.'
        : 'Routing recurrence remains operationally visible across some continuity pathways.',
    ownerPosture:
      ownershipRequired === 0
        ? 'Ownership direction remains operationally manageable without concentrated alignment deterioration.'
        : 'Ownership alignment gaps remain visible across some stabilization pathways.',
    evidenceVisibility:
      evidenceRequired === 0
        ? 'No concentrated evidence gate is currently weakening stabilization direction.'
        : 'Evidence gate concentration remains operationally visible across some routing pathways.',
    actionLandscape:
      routed > 0
        ? 'Some continuity pathways are becoming eligible for governed stabilization action progression.'
        : 'Action readiness visibility pending governed routing direction.',
    pressureMeaning:
      stalled === 0 &&
      evidenceRequired === 0 &&
      ownershipRequired === 0 &&
      recurrence === 0
        ? 'Routing direction remains proportionally active under current continuity governance conditions.'
        : 'Routing pressure remains visible through stalled movement, ownership deterioration, evidence concentration, or routing recurrence.',
    commandInheritance:
      stalled > 1 || recurrence > 1
        ? 'Routing instability concentration may require executive continuity synthesis visibility.'
        : 'No concentrated routing deterioration currently requiring command escalation.',
  }
}

function buildSimplifiedIdentity(caseItem: StabilityCase) {
  const location =
    caseItem.beneficiary_level || caseItem.region || 'Unspecified continuity zone'

  return `${caseItem.support_domain} routing • ${location}`
}

function buildRoutingSummary(input: {
  caseItem: StabilityCase
  owner?: StabilizationOwner
  routingStatus: string
  recurrenceCount: number
}) {
  const identity = buildSimplifiedIdentity(input.caseItem)

  if (input.recurrenceCount > 0) {
    return `Routing recurrence preserved for ${identity}. Status: ${
      input.routingStatus
    }. Recurrence visibility count: ${input.recurrenceCount + 1}.`
  }

  return `Governed stabilization routing preserved for ${identity}. Status: ${
    input.routingStatus
  }. Stabilization owner: ${input.owner?.full_name || 'Not assigned'}.`
}

function buildRoutingIntelligence(input: {
  caseItem: StabilityCase
  routingHistory: RoutingAction[]
  latestOwner?: StabilizationOwner
}) {
  const { caseItem, routingHistory, latestOwner } = input
  const latestRouting = routingHistory[0]
  const hasOwner = Boolean(latestOwner)

  const recurrenceCount = routingHistory.filter((item) =>
    item.routing_status.includes('RECURRENCE'),
  ).length

  if (!latestRouting) {
    return {
      phase: 'Routing direction pending',
      maturity: 'DIRECTION_NOT_YET_ESTABLISHED',
      confidence: 'PENDING_DIRECTIONAL_CONFIDENCE',
      nextMovement: 'Select governed routing direction and ownership posture.',
      ownerPosture: 'Ownership direction pending',
      evidenceRequirement: 'Routing evidence pending',
      stallRisk: 'Directional stall risk activates if routing movement is delayed.',
      commandMeaning:
        'Accepted instability has not yet been directed toward stabilization movement.',
    }
  }

  if (latestRouting.routing_status.includes('STALLED')) {
    return {
      phase: 'Routing stalled',
      maturity: 'ROUTING_DESTABILIZING',
      confidence: 'FRAGILE_DIRECTIONAL_CONFIDENCE',
      nextMovement: 'Restore movement or escalate continuity visibility.',
      ownerPosture: hasOwner
        ? 'Owner identified but routing movement remains stalled.'
        : 'Ownership clarity remains unstable.',
      evidenceRequirement:
        'Stall evidence and continuity barriers must remain visible.',
      stallRisk:
        'High stall concentration risk until directional movement resumes.',
      commandMeaning:
        'Stalled routing weakens stabilization credibility and may require executive continuity escalation.',
    }
  }

  if (latestRouting.routing_status.includes('EVIDENCE_REQUIRED')) {
    return {
      phase: 'Evidence gate active',
      maturity: 'EVIDENCE_ALIGNMENT_PENDING',
      confidence: 'LIMITED_DIRECTIONAL_CONFIDENCE',
      nextMovement:
        'Preserve stronger operational evidence before movement proceeds.',
      ownerPosture: hasOwner
        ? 'Owner remains available pending evidence alignment.'
        : 'Ownership movement limited until evidence strengthens.',
      evidenceRequirement:
        'Evidence credibility must strengthen before routing becomes reliable.',
      stallRisk:
        'Moderate-to-high routing deterioration risk if evidence remains insufficient.',
      commandMeaning:
        'Routing movement remains constrained by insufficient continuity evidence.',
    }
  }

  if (latestRouting.routing_status.includes('OWNERSHIP_CLARITY')) {
    return {
      phase: 'Ownership alignment review',
      maturity: 'OWNERSHIP_ALIGNMENT_UNSTABLE',
      confidence: 'VARIABLE_DIRECTIONAL_CONFIDENCE',
      nextMovement:
        'Clarify responsible stabilization ownership before progression.',
      ownerPosture: 'Ownership alignment remains unstable.',
      evidenceRequirement:
        'Ownership rationale and continuity accountability must remain visible.',
      stallRisk:
        'High continuity drift risk until ownership alignment stabilizes.',
      commandMeaning:
        'Unclear ownership may weaken stabilization continuity and lifecycle reliability.',
    }
  }

  if (latestRouting.routing_status.includes('GOVERNANCE_REVIEW')) {
    return {
      phase: 'Governance visibility review',
      maturity: 'DIRECTION_UNDER_REVIEW',
      confidence: 'CONDITIONAL_DIRECTIONAL_CONFIDENCE',
      nextMovement:
        'Resolve governance visibility before stabilization movement advances.',
      ownerPosture: hasOwner
        ? 'Ownership remains visible during governance review.'
        : 'Ownership pending governance review outcome.',
      evidenceRequirement:
        'Governance review evidence must remain operationally visible.',
      stallRisk:
        'Moderate routing pressure until governance visibility resolves.',
      commandMeaning:
        'Routing movement remains under governance interpretation before stabilization progression.',
    }
  }

  if (latestRouting.routing_status.includes('RECURRENCE')) {
    return {
      phase: 'Routing recurrence visibility',
      maturity: 'ROUTING_RECURRENCE_CONCENTRATION',
      confidence: 'WEAKENING_DIRECTIONAL_CONFIDENCE',
      nextMovement:
        'Review why routing movement is repeating without durable stabilization.',
      ownerPosture: hasOwner
        ? 'Ownership remains repeatedly engaged.'
        : 'Ownership instability remains operationally visible.',
      evidenceRequirement:
        'Recurrence evidence and continuity deterioration must remain visible.',
      stallRisk:
        'Elevated recurrence concentration may weaken continuity reliability.',
      commandMeaning:
        recurrenceCount > 1
          ? 'Repeated routing recurrence suggests continuity deterioration may be structurally accumulating.'
          : 'Routing recurrence suggests stabilization movement may not yet be durable.',
    }
  }

  if (latestRouting.routing_status.includes('STABILIZATION_OWNER_ROUTED')) {
    return {
      phase: 'Governed stabilization direction active',
      maturity: 'DIRECTION_STABILIZING',
      confidence: hasOwner
        ? 'BUILDING_DIRECTIONAL_CONFIDENCE'
        : 'VARIABLE_DIRECTIONAL_CONFIDENCE',
      nextMovement:
        'Preserve governed stabilization action evidence within /interventions.',
      ownerPosture: hasOwner
        ? `Stabilization ownership aligned with ${latestOwner?.full_name}.`
        : 'Ownership assignment remains incomplete.',
      evidenceRequirement:
        'Intervention evidence should now strengthen stabilization credibility.',
      stallRisk: hasOwner
        ? 'Low directional deterioration risk if action movement proceeds.'
        : 'Moderate risk until ownership becomes visible.',
      commandMeaning:
        'Routing direction has stabilized sufficiently for governed intervention progression.',
    }
  }

  if (caseItem.severity_level === 'CRITICAL') {
    return {
      phase: 'Critical continuity routing',
      maturity: 'CRITICAL_DIRECTIONAL_VISIBILITY',
      confidence: 'HIGH_ATTENTION_REQUIRED',
      nextMovement:
        'Preserve immediate routing direction and executive continuity visibility.',
      ownerPosture: hasOwner
        ? 'Critical stabilization ownership visible.'
        : 'Critical ownership assignment required.',
      evidenceRequirement:
        'Immediate routing evidence required for survivability preservation.',
      stallRisk: 'Critical continuity deterioration risk until routing stabilizes.',
      commandMeaning:
        'Critical instability requires accelerated routing visibility and executive continuity oversight.',
    }
  }

  return {
    phase: 'Active continuity routing',
    maturity: 'ROUTING_DIRECTION_BUILDING',
    confidence: 'MEASURED_DIRECTIONAL_CONFIDENCE',
    nextMovement:
      'Continue governed stabilization routing with proportional continuity visibility.',
    ownerPosture: hasOwner
      ? 'Ownership remains operationally visible.'
      : 'Ownership assignment pending.',
    evidenceRequirement: 'Routing evidence should remain structurally traceable.',
    stallRisk: 'Monitor for delayed directional movement or routing deterioration.',
    commandMeaning:
      'Routing remains proportionally stable under current continuity governance conditions.',
  }
}

function buildRoutingInterpretation(
  caseItem: StabilityCase,
  routingHistory: RoutingAction[],
) {
  const recurrenceCount = routingHistory.filter((item) =>
    item.routing_status.includes('RECURRENCE'),
  ).length

  if (routingHistory.some((item) => item.routing_status.includes('STALLED'))) {
    return 'Routing movement remains stalled. CGI should preserve visibility over ownership barriers, directional deterioration, and continuity weakening until stabilization movement resumes.'
  }

  if (
    routingHistory.some((item) =>
      item.routing_status.includes('EVIDENCE_REQUIRED'),
    )
  ) {
    return 'Operational evidence remains insufficient for credible stabilization routing. Continuity movement should remain proportionally constrained until evidence strengthens.'
  }

  if (
    routingHistory.some((item) =>
      item.routing_status.includes('OWNERSHIP_CLARITY'),
    )
  ) {
    return 'Ownership alignment remains unstable. Routing should not be treated as directionally credible until continuity ownership stabilizes.'
  }

  if (recurrenceCount > 1) {
    return 'Repeated routing recurrence concentration is becoming operationally visible. CGI should preserve continuity deterioration visibility and monitor for structural instability accumulation.'
  }

  if (routingHistory.length > 1) {
    return 'Routing recurrence visibility remains active. CGI should continue monitoring whether stabilization direction is becoming durable or repeatedly weakening.'
  }

  if (caseItem.severity_level === 'CRITICAL') {
    return 'Critical continuity instability requires accelerated routing visibility, survivability awareness, ownership stabilization, and executive continuity oversight.'
  }

  return 'This continuity pathway remains eligible for governed stabilization direction under proportional continuity observation conditions.'
}

function resolveRoutingSeverity(input: {
  caseItem: StabilityCase
  recurrenceCount: number
  routingStatus: string
}): AuditSeverity {
  if (input.caseItem.severity_level === 'CRITICAL') return 'CRITICAL'

  if (
    input.routingStatus.includes('STALLED') ||
    input.recurrenceCount > 1 ||
    input.caseItem.safeguarding_flag
  ) {
    return 'HIGH'
  }

  if (
    input.routingStatus.includes('RECURRENCE') ||
    input.routingStatus.includes('GOVERNANCE_REVIEW')
  ) {
    return 'MODERATE'
  }

  return 'LOW'
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-neutral-100">{value}</p>
    </div>
  )
}

function SignalBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
      {children}
    </span>
  )
}

function severityBadgeClass(level: string) {
  if (level === 'CRITICAL') {
    return 'rounded-full bg-red-900 px-3 py-2 text-xs font-semibold text-red-100'
  }

  if (level === 'HIGH') {
    return 'rounded-full bg-orange-900 px-3 py-2 text-xs font-semibold text-orange-100'
  }

  if (level === 'MODERATE') {
    return 'rounded-full bg-amber-900 px-3 py-2 text-xs font-semibold text-amber-100'
  }

  return 'rounded-full bg-emerald-900 px-3 py-2 text-xs font-semibold text-emerald-100'
}