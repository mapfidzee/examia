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
  created_at?: string | null
  updated_at?: string | null
  triage_status?: string | null
  triage_decision?: string | null
  triage_reason?: string | null
  triage_posture?: string | null
  eligibility_status?: string | null
  intake_status?: string | null
  request_status?: string | null
  intake_identity?: string | null
  case_memory?: string | null
  continuity_memory?: string | null
  intervention_summary?: string | null
  outcome_summary?: string | null
  evidence_posture?: string | null
  latest_downstream_evidence?: string | null
  drift_signal?: string | null
  convergence_signal?: string | null
  command_meaning?: string | null
  survivability_interpretation?: string | null
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

type InheritedRoutingContext = {
  intakeIdentity: string
  triagePosture: string
  caseMaturity: string
  driftSignal: string
  convergenceSignal: string
  routingReadiness: string
  evidencePosture: string
  commandMeaning: string
  survivabilityInterpretation: string
  memorySource: string
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

    const inherited = buildInheritedRoutingContext(caseItem, routingStatus)
    const routingReason = buildRoutingReason({
      decision,
      inherited,
      recurrenceCount,
    })

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

    const routingMemory = buildRoutingContinuityMemory({
      caseItem,
      owner,
      inherited,
      routingStatus,
      routingReason,
      recurrenceCount,
    })

    const { error: updateError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: routingStatus,
        outcome_summary: routingMemory,
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
        ? 'Routing recurrence preserved. Inherited case memory, direction, ownership visibility, and structural traceability remain operationally visible.'
        : 'Governed stabilization routing preserved. Inherited case memory, ownership posture, and lifecycle movement are now visible.',
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
            movement. Routing now inherits intake identity, triage posture, case
            governance maturity, drift visibility, convergence visibility,
            evidence posture, command meaning, and survivability interpretation
            before intervention action begins.
          </p>

          <p className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
            <span className="font-semibold">Boundary:</span> /routing governs
            stabilization direction. It does not execute intervention action,
            verify outcomes, declare recovery durability, or erase structural
            continuity memory inherited from earlier lifecycle stages.
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
            context. Routing inherits that case memory and determines stabilization
            direction, ownership posture, evidence gate, directional maturity, and
            action readiness without performing the intervention itself.
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

              const activeRoutingStatus =
                latestRouting?.routing_status || caseItem.case_status

              const inherited = buildInheritedRoutingContext(
                caseItem,
                activeRoutingStatus,
              )

              const intelligence = buildRoutingIntelligence({
                caseItem,
                routingHistory,
                latestOwner,
                inherited,
                activeRoutingStatus,
              })

              return (
                <article
                  key={caseItem.id}
                  className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                        Accepted CGI Routing Case
                      </p>

                      <h4 className="mt-2 break-words text-xl font-semibold text-white">
                        {buildSimplifiedIdentity(caseItem, inherited)}
                      </h4>

                      <p className="mt-2 break-words text-xs leading-5 text-neutral-500">
                        Full identity: {inherited.intakeIdentity}
                      </p>
                    </div>

                    <span className={severityBadgeClass(caseItem.severity_level)}>
                      {caseItem.severity_level}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <Info label="Case State" value={activeRoutingStatus} />
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

                  <section className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
                    <p className="text-sm font-semibold text-cyan-100">
                      Inherited Case Memory
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <Info label="Memory Source" value={inherited.memorySource} />
                      <Info
                        label="Inherited Intake Identity"
                        value={inherited.intakeIdentity}
                      />
                      <Info
                        label="Triage Eligibility Posture"
                        value={inherited.triagePosture}
                      />
                      <Info
                        label="Case Governance Maturity"
                        value={inherited.caseMaturity}
                      />
                      <Info
                        label="Case Drift Signal"
                        value={inherited.driftSignal}
                      />
                      <Info
                        label="Convergence Signal"
                        value={inherited.convergenceSignal}
                      />
                      <Info
                        label="Routing Readiness"
                        value={inherited.routingReadiness}
                      />
                      <Info
                        label="Evidence Posture"
                        value={inherited.evidencePosture}
                      />
                      <Info
                        label="Inherited Command Meaning"
                        value={inherited.commandMeaning}
                      />
                      <Info
                        label="Survivability Interpretation"
                        value={inherited.survivabilityInterpretation}
                      />
                    </div>
                  </section>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <SignalBadge>{caseItem.support_domain}</SignalBadge>
                    <SignalBadge>{caseItem.severity_level}</SignalBadge>
                    <SignalBadge>{inherited.routingReadiness}</SignalBadge>
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
                      {buildRoutingInterpretation({
                        caseItem,
                        routingHistory,
                        inherited,
                        activeRoutingStatus,
                      })}
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
            confidence, stall risk, inherited case memory, and command meaning
            before stabilization action begins.
          </p>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature routing intelligence must preserve proportional continuity
            interpretation. Accepted instability should not become a standalone
            queue item. It must carry intake identity, triage posture, case maturity,
            drift, convergence, evidence posture, and survivability meaning into
            every downstream routing decision.
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
  const inherited = buildInheritedRoutingContext(
    input.caseItem,
    input.routingStatus,
  )

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
      inherited_intake_identity: inherited.intakeIdentity,
      inherited_triage_posture: inherited.triagePosture,
      inherited_case_maturity: inherited.caseMaturity,
      inherited_drift_signal: inherited.driftSignal,
      inherited_convergence_signal: inherited.convergenceSignal,
      inherited_routing_readiness: inherited.routingReadiness,
      inherited_evidence_posture: inherited.evidencePosture,
      inherited_command_meaning: inherited.commandMeaning,
      inherited_survivability_interpretation:
        inherited.survivabilityInterpretation,
      governance_institution: institution,
      institution_name: institution,
      visibility_level: visibilityLevel,
      continuity_interpretation:
        input.recurrenceCount > 0
          ? 'Repeated routing movement indicates instability may not yet be stabilizing.'
          : 'Routing movement has been preserved as governed stabilization direction.',
      survivability_meaning: input.routingStatus.includes('STALLED')
        ? 'A stalled routing pathway may weaken stabilization credibility if unresolved.'
        : inherited.survivabilityInterpretation,
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

  const inheritedDrift = input.cases.filter((caseItem) =>
    resolveCaseDriftSignal(caseItem, latestCaseStatusForClimate(caseItem, input.routingActions)).includes('DRIFT'),
  ).length

  const inheritedConvergence = input.cases.filter((caseItem) =>
    resolveConvergenceSignal(caseItem, latestCaseStatusForClimate(caseItem, input.routingActions)).includes('CONVERGENCE'),
  ).length

  return {
    stabilityClimate:
      recurrence === 0 && inheritedDrift === 0
        ? 'Routing conditions remain proportionally balanced under current continuity direction visibility.'
        : 'Routing recurrence or inherited drift remains operationally visible across some continuity pathways.',
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
      recurrence === 0 &&
      inheritedDrift === 0
        ? 'Routing direction remains proportionally active under inherited case memory and current continuity governance conditions.'
        : 'Routing pressure remains visible through stalled movement, ownership deterioration, evidence concentration, routing recurrence, or inherited case drift.',
    commandInheritance:
      stalled > 1 || recurrence > 1 || inheritedDrift > 1
        ? 'Routing instability concentration may require executive continuity synthesis visibility.'
        : inheritedConvergence > 0
          ? 'Some inherited case pathways show convergence visibility and may be ready for governed stabilization direction.'
          : 'No concentrated routing deterioration currently requiring command escalation.',
  }
}

function latestCaseStatusForClimate(
  caseItem: StabilityCase,
  routingActions: RoutingAction[],
) {
  const latestRouting = routingActions.find(
    (routingAction) => routingAction.case_id === caseItem.id,
  )

  return latestRouting?.routing_status || caseItem.case_status
}

function buildInheritedRoutingContext(
  caseItem: StabilityCase,
  activeRoutingStatus?: string,
): InheritedRoutingContext {
  const source = buildCaseMemorySource(caseItem)
  const activeStatus = activeRoutingStatus || caseItem.case_status

  return {
    intakeIdentity: resolveIntakeIdentity(caseItem, source),
    triagePosture: resolveTriagePosture(caseItem, source, activeStatus),
    caseMaturity: resolveCaseGovernanceMaturity(caseItem, activeStatus),
    driftSignal: resolveCaseDriftSignal(caseItem, activeStatus),
    convergenceSignal: resolveConvergenceSignal(caseItem, activeStatus),
    routingReadiness: resolveRoutingReadiness(activeStatus),
    evidencePosture: resolveEvidencePosture(caseItem, source, activeStatus),
    commandMeaning: resolveInheritedCommandMeaning(caseItem, source, activeStatus),
    survivabilityInterpretation: resolveSurvivabilityInterpretation(
      caseItem,
      activeStatus,
    ),
    memorySource: resolveRoutingMemorySource(caseItem),
  }
}

function buildCaseMemorySource(caseItem: StabilityCase) {
  return [
    caseItem.continuity_memory,
    caseItem.latest_downstream_evidence,
    caseItem.case_memory,
    caseItem.outcome_summary,
    caseItem.intervention_summary,
  ]
    .filter(Boolean)
    .join('\n\n')
}

function resolveRoutingMemorySource(caseItem: StabilityCase) {
  if (caseItem.continuity_memory) return 'active continuity memory'
  if (caseItem.latest_downstream_evidence) return 'latest downstream evidence'
  if (caseItem.case_memory) return 'case memory'
  if (caseItem.outcome_summary) return 'triage / downstream lifecycle summary'
  if (caseItem.intervention_summary) return 'intake lifecycle memory'
  return 'fallback case fields'
}

function extractBlockField(source: string, label: string) {
  if (!source) return ''

  const lines = source
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const target = label.trim().toLowerCase()
  const index = lines.findIndex((line) => line.toLowerCase() === target)

  if (index === -1) return ''

  return lines[index + 1] || ''
}

function resolveIntakeIdentity(caseItem: StabilityCase, source: string) {
  if (caseItem.intake_identity) return caseItem.intake_identity

  return (
    extractBlockField(source, 'INHERITED INTAKE IDENTITY') ||
    extractBlockField(source, 'INTAKE IDENTITY') ||
    caseItem.beneficiary_name ||
    `${caseItem.support_domain} • ${
      caseItem.beneficiary_level || 'continuity zone unspecified'
    } • ${caseItem.institution_name || GOVERNANCE_INSTITUTION} • ${
      caseItem.region || 'region not provided'
    }`
  )
}

function resolveTriagePosture(
  caseItem: StabilityCase,
  source: string,
  activeStatus: string,
) {
  if (caseItem.triage_posture) return caseItem.triage_posture

  return (
    extractBlockField(source, 'INHERITED GOVERNANCE READINESS') ||
    extractBlockField(source, 'RECOMMENDED POSTURE') ||
    extractBlockField(source, 'TRIAGE REASON') ||
    caseItem.triage_decision ||
    resolveFallbackTriagePosture(activeStatus)
  )
}

function resolveFallbackTriagePosture(activeStatus: string) {
  if (activeStatus.includes('GOVERNANCE_REVIEW')) {
    return 'Accepted instability escalated into governance visibility review before routing progression.'
  }

  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return 'Accepted instability progressed into governed stabilization direction.'
  }

  if (activeStatus.includes('EVIDENCE_REQUIRED')) {
    return 'Accepted instability constrained by insufficient routing evidence.'
  }

  if (activeStatus.includes('OWNERSHIP_CLARITY')) {
    return 'Accepted instability awaiting stabilized ownership alignment.'
  }

  if (activeStatus.includes('STALLED')) {
    return 'Accepted instability experiencing directional routing deterioration.'
  }

  if (activeStatus.includes('REOPENED')) {
    return 'Previously governed instability has re-entered continuity review.'
  }

  if (activeStatus === 'ACCEPTED_FOR_GOVERNANCE') {
    return 'Accepted for governance routing.'
  }

  return 'Governed instability remains under active continuity interpretation.'
}

function resolveCaseGovernanceMaturity(
  caseItem: StabilityCase,
  activeStatus: string,
) {
  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return activeStatus.includes('RECURRENCE')
      ? 'CASE_DIRECTION_REPEATED'
      : 'CASE_DIRECTION_STABILIZING'
  }

  if (activeStatus.includes('RECURRENCE')) {
    return 'CASE_RECURRENCE_VISIBLE'
  }

  if (activeStatus.includes('GOVERNANCE_REVIEW')) {
    return 'CASE_UNDER_GOVERNANCE_DIRECTION_REVIEW'
  }

  if (
    activeStatus.includes('STALLED') ||
    activeStatus.includes('OWNERSHIP_CLARITY') ||
    activeStatus.includes('EVIDENCE_REQUIRED')
  ) {
    return 'CASE_GOVERNANCE_CONSTRAINED'
  }

  if (activeStatus === 'ACCEPTED_FOR_GOVERNANCE') {
    return 'CASE_ACCEPTED_ROUTING_READY'
  }

  return caseItem.case_status.includes('RECURRENCE')
    ? 'CASE_RECURRENCE_VISIBLE'
    : 'CASE_GOVERNANCE_ACTIVE'
}

function resolveCaseDriftSignal(
  caseItem: StabilityCase,
  activeStatus: string,
) {
  if (caseItem.drift_signal) return caseItem.drift_signal

  if (activeStatus.includes('STALLED')) {
    return 'ACTIVE_ROUTING_DRIFT_VISIBLE'
  }

  if (activeStatus.includes('RECURRENCE')) {
    return activeStatus.includes('STABILIZATION_OWNER_ROUTED')
      ? 'ROUTING_RECURRENCE_AFTER_DIRECTION_VISIBLE'
      : 'REPEATED_ROUTING_DRIFT_VISIBLE'
  }

  if (
    activeStatus.includes('EVIDENCE_REQUIRED') ||
    activeStatus.includes('OWNERSHIP_CLARITY')
  ) {
    return 'DRIFT_RISK_PRESENT'
  }

  if (activeStatus.includes('GOVERNANCE_REVIEW')) {
    return 'GOVERNANCE_DIRECTION_REVIEW_ACTIVE'
  }

  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return 'NO_ACTIVE_DIRECTIONAL_DRIFT_VISIBLE'
  }

  return 'NO_ACTIVE_DRIFT_VISIBLE'
}

function resolveConvergenceSignal(
  caseItem: StabilityCase,
  activeStatus: string,
) {
  if (caseItem.convergence_signal) return caseItem.convergence_signal

  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return activeStatus.includes('RECURRENCE')
      ? 'CONVERGENCE_BUILDING_THROUGH_REPEATED_OWNER_DIRECTION'
      : 'CONVERGENCE_BUILDING'
  }

  if (activeStatus.includes('GOVERNANCE_REVIEW')) {
    return 'CONVERGENCE_DELAYED_PENDING_GOVERNANCE_REVIEW'
  }

  if (
    activeStatus.includes('STALLED') ||
    activeStatus.includes('EVIDENCE_REQUIRED') ||
    activeStatus.includes('OWNERSHIP_CLARITY')
  ) {
    return 'CONVERGENCE_CONSTRAINED'
  }

  if (activeStatus === 'ACCEPTED_FOR_GOVERNANCE') {
    return 'CONVERGENCE_PENDING_ROUTING_DIRECTION'
  }

  return 'CONVERGENCE_NOT_YET_ESTABLISHED'
}

function resolveRoutingReadiness(activeStatus: string) {
  if (activeStatus === 'ACCEPTED_FOR_GOVERNANCE') {
    return 'ROUTING_READY'
  }

  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return activeStatus.includes('RECURRENCE')
      ? 'ROUTING_DIRECTION_REPEATED_ACTION_READY'
      : 'ROUTING_DIRECTION_ACTIVE'
  }

  if (activeStatus.includes('GOVERNANCE_REVIEW')) {
    return 'ROUTING_HELD_FOR_GOVERNANCE_VISIBILITY'
  }

  if (activeStatus.includes('EVIDENCE_REQUIRED')) {
    return 'ROUTING_CONSTRAINED_BY_EVIDENCE'
  }

  if (activeStatus.includes('OWNERSHIP_CLARITY')) {
    return 'ROUTING_CONSTRAINED_BY_OWNERSHIP'
  }

  if (activeStatus.includes('STALLED')) {
    return 'ROUTING_DESTABILIZED'
  }

  if (activeStatus.includes('REOPENED')) {
    return 'ROUTING_REVIEW_REQUIRED'
  }

  return 'ROUTING_GOVERNANCE_ACTIVE'
}

function resolveEvidencePosture(
  caseItem: StabilityCase,
  source: string,
  activeStatus: string,
) {
  if (caseItem.evidence_posture) return caseItem.evidence_posture

  return (
    extractBlockField(source, 'INHERITED EVIDENCE POSTURE') ||
    extractBlockField(source, 'EVIDENCE POSTURE') ||
    extractBlockField(source, 'EVIDENCE LEVEL') ||
    resolveFallbackEvidencePosture(caseItem, activeStatus)
  )
}

function resolveFallbackEvidencePosture(
  caseItem: StabilityCase,
  activeStatus: string,
) {
  if (caseItem.latest_downstream_evidence) {
    return caseItem.latest_downstream_evidence
  }

  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return 'Routing evidence preserved; intervention evidence pending.'
  }

  if (activeStatus.includes('GOVERNANCE_REVIEW')) {
    return 'Governance review evidence preserved pending routing progression.'
  }

  if (activeStatus.includes('EVIDENCE_REQUIRED')) {
    return 'Evidence gap visible before routing movement.'
  }

  if (activeStatus.includes('STALLED')) {
    return 'Directional deterioration evidence remains operationally visible.'
  }

  if (activeStatus.includes('OWNERSHIP_CLARITY')) {
    return 'Ownership clarification evidence remains required before progression.'
  }

  if (activeStatus === 'ACCEPTED_FOR_GOVERNANCE') {
    return 'Case acceptance evidence present; routing evidence pending.'
  }

  return 'Continuity evidence remains operationally preserved.'
}

function resolveInheritedCommandMeaning(
  caseItem: StabilityCase,
  source: string,
  activeStatus: string,
) {
  if (caseItem.command_meaning) return caseItem.command_meaning

  return (
    extractBlockField(source, 'INHERITED COMMAND MEANING') ||
    extractBlockField(source, 'COMMAND MEANING') ||
    resolveFallbackCommandMeaning(caseItem, activeStatus)
  )
}

function resolveFallbackCommandMeaning(
  caseItem: StabilityCase,
  activeStatus: string,
) {
  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return activeStatus.includes('RECURRENCE')
      ? 'Repeated governed routing direction is visible; action evidence must now determine whether stabilization is becoming credible.'
      : 'Governed routing direction is now operationally active.'
  }

  if (caseItem.severity_level === 'CRITICAL') {
    return 'Critical accepted instability requires accelerated executive routing visibility.'
  }

  if (caseItem.safeguarding_flag) {
    if (activeStatus.includes('GOVERNANCE_REVIEW')) {
      return 'Safeguarding-sensitive instability remains under governance visibility before directional progression.'
    }

    return 'Safeguarding visibility requires protected, traceable routing movement.'
  }

  if (activeStatus.includes('STALLED')) {
    return 'Stalled routing weakens continuity credibility until movement resumes.'
  }

  if (activeStatus.includes('RECURRENCE')) {
    return 'Repeated routing movement may indicate unresolved continuity instability.'
  }

  if (activeStatus.includes('GOVERNANCE_REVIEW')) {
    return 'Governance review remains necessary before stabilization progression becomes directionally credible.'
  }

  if (activeStatus === 'ACCEPTED_FOR_GOVERNANCE') {
    return 'Accepted instability is eligible for governed stabilization direction.'
  }

  return 'Routing should preserve command meaning inherited from case governance.'
}

function resolveSurvivabilityInterpretation(
  caseItem: StabilityCase,
  activeStatus: string,
) {
  if (caseItem.survivability_interpretation) {
    return caseItem.survivability_interpretation
  }

  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return activeStatus.includes('RECURRENCE')
      ? 'Survivability credibility may begin strengthening through repeated owner direction, but action evidence is required before stabilization confidence improves.'
      : 'Survivability credibility begins strengthening when ownership and next movement are visible.'
  }

  if (
    caseItem.severity_level === 'HIGH' &&
    caseItem.safeguarding_flag &&
    activeStatus.includes('GOVERNANCE_REVIEW')
  ) {
    return 'High-pressure safeguarding instability remains survivability-sensitive until governance review resolves.'
  }

  if (caseItem.severity_level === 'CRITICAL') {
    return 'Survivability pressure remains high until ownership and action movement are visible.'
  }

  if (activeStatus.includes('STALLED') || activeStatus.includes('RECURRENCE')) {
    return 'Survivability credibility may weaken if repeated or stalled routing is not resolved.'
  }

  if (activeStatus.includes('GOVERNANCE_REVIEW')) {
    return 'Governance review remains active before survivability confidence can strengthen.'
  }

  if (activeStatus.includes('EVIDENCE_REQUIRED')) {
    return 'Survivability confidence remains constrained by insufficient routing evidence.'
  }

  if (activeStatus.includes('OWNERSHIP_CLARITY')) {
    return 'Survivability stabilization depends on clarified routing ownership.'
  }

  return 'Survivability interpretation remains under active continuity governance.'
}

function buildRoutingReason(input: {
  decision: {
    reason: string
  }
  inherited: InheritedRoutingContext
  recurrenceCount: number
}) {
  const recurrence =
    input.recurrenceCount > 0
      ? ` Previous routing activity exists for this active CGI case. Recurrence count: ${
          input.recurrenceCount + 1
        }.`
      : ''

  return `${input.decision.reason}${recurrence} Inherited case memory: intake identity ${input.inherited.intakeIdentity}; triage posture ${input.inherited.triagePosture}; case maturity ${input.inherited.caseMaturity}; drift ${input.inherited.driftSignal}; convergence ${input.inherited.convergenceSignal}; evidence posture ${input.inherited.evidencePosture}; survivability ${input.inherited.survivabilityInterpretation}.`
}

function buildRoutingContinuityMemory(input: {
  caseItem: StabilityCase
  owner?: StabilizationOwner
  inherited: InheritedRoutingContext
  routingStatus: string
  routingReason: string
  recurrenceCount: number
}) {
  return `
INHERITED INTAKE IDENTITY
${input.inherited.intakeIdentity}

INHERITED TRIAGE POSTURE
${input.inherited.triagePosture}

INHERITED CASE MATURITY
${input.inherited.caseMaturity}

INHERITED DRIFT SIGNAL
${input.inherited.driftSignal}

INHERITED CONVERGENCE SIGNAL
${input.inherited.convergenceSignal}

INHERITED ROUTING READINESS
${input.inherited.routingReadiness}

INHERITED EVIDENCE POSTURE
${input.inherited.evidencePosture}

INHERITED COMMAND MEANING
${input.inherited.commandMeaning}

INHERITED SURVIVABILITY INTERPRETATION
${input.inherited.survivabilityInterpretation}

ROUTING STATUS
${input.routingStatus}

ROUTING REASON
${input.routingReason}

STABILIZATION OWNER
${input.owner?.full_name || 'Ownership direction pending'}

OWNER STATUS
${input.owner?.operational_status || 'Owner status pending'}

ROUTING RECURRENCE COUNT
${input.recurrenceCount + 1}

ACTION READINESS
${input.routingStatus.includes('STABILIZATION_OWNER_ROUTED') ? 'ACTION_READY_AFTER_ROUTING_DIRECTION' : 'ACTION_HELD_UNTIL_ROUTING_CONSTRAINT_RESOLVES'}

LIFECYCLE BOUNDARY
Routing is direction governance.
Routing is not intervention action.
Action evidence must be preserved in /interventions.
  `.trim()
}

function buildSimplifiedIdentity(
  caseItem: StabilityCase,
  inherited: InheritedRoutingContext,
) {
  const identity = inherited.intakeIdentity || caseItem.beneficiary_name

  if (identity && identity !== caseItem.beneficiary_name) {
    return identity
  }

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
  const inherited = buildInheritedRoutingContext(input.caseItem, input.routingStatus)

  if (input.recurrenceCount > 0) {
    return `Routing recurrence preserved for ${inherited.intakeIdentity}. Status: ${
      input.routingStatus
    }. Recurrence visibility count: ${
      input.recurrenceCount + 1
    }. Inherited posture: ${inherited.caseMaturity}.`
  }

  return `Governed stabilization routing preserved for ${
    inherited.intakeIdentity
  }. Status: ${input.routingStatus}. Stabilization owner: ${
    input.owner?.full_name || 'Not assigned'
  }. Inherited posture: ${inherited.routingReadiness}.`
}

function buildRoutingIntelligence(input: {
  caseItem: StabilityCase
  routingHistory: RoutingAction[]
  latestOwner?: StabilizationOwner
  inherited: InheritedRoutingContext
  activeRoutingStatus: string
}) {
  const {
    caseItem,
    routingHistory,
    latestOwner,
    inherited,
    activeRoutingStatus,
  } = input

  const hasOwner = Boolean(latestOwner)
  const recurrenceCount = routingHistory.filter((item) =>
    item.routing_status.includes('RECURRENCE'),
  ).length

  if (activeRoutingStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return {
      phase: activeRoutingStatus.includes('RECURRENCE')
        ? 'Repeated governed stabilization direction'
        : 'Governed stabilization direction active',
      maturity: activeRoutingStatus.includes('RECURRENCE')
        ? 'DIRECTION_REPEATED_ACTION_READY'
        : 'DIRECTION_STABILIZING',
      confidence: hasOwner
        ? 'BUILDING_DIRECTIONAL_CONFIDENCE'
        : 'VARIABLE_DIRECTIONAL_CONFIDENCE',
      nextMovement:
        'Preserve governed stabilization action evidence within /interventions.',
      ownerPosture: hasOwner
        ? `Stabilization ownership aligned with ${latestOwner?.full_name}.`
        : 'Ownership assignment remains incomplete.',
      evidenceRequirement: inherited.evidencePosture,
      stallRisk: activeRoutingStatus.includes('RECURRENCE')
        ? 'Moderate recurrence risk until action evidence confirms stabilization movement.'
        : 'Low directional deterioration risk if action movement proceeds.',
      commandMeaning: inherited.commandMeaning,
    }
  }

  if (activeRoutingStatus.includes('STALLED')) {
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

  if (activeRoutingStatus.includes('EVIDENCE_REQUIRED')) {
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

  if (activeRoutingStatus.includes('OWNERSHIP_CLARITY')) {
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

  if (activeRoutingStatus.includes('GOVERNANCE_REVIEW')) {
    return {
      phase: 'Governance visibility review',
      maturity: activeRoutingStatus.includes('RECURRENCE')
        ? 'DIRECTION_REVIEW_RECURRENCE'
        : 'DIRECTION_UNDER_REVIEW',
      confidence: 'CONDITIONAL_DIRECTIONAL_CONFIDENCE',
      nextMovement:
        'Resolve governance visibility before stabilization movement advances.',
      ownerPosture: hasOwner
        ? 'Ownership remains visible during governance review.'
        : 'Ownership pending governance review outcome.',
      evidenceRequirement: inherited.evidencePosture,
      stallRisk: activeRoutingStatus.includes('RECURRENCE')
        ? 'Elevated routing pressure until repeated governance review resolves.'
        : 'Moderate routing pressure until governance visibility resolves.',
      commandMeaning: inherited.commandMeaning,
    }
  }

  if (recurrenceCount > 0) {
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
    phase: 'Routing direction pending',
    maturity: inherited.caseMaturity,
    confidence:
      inherited.routingReadiness === 'ROUTING_READY'
        ? 'READY_FOR_DIRECTIONAL_CONFIDENCE'
        : 'PENDING_DIRECTIONAL_CONFIDENCE',
    nextMovement: 'Select governed routing direction and ownership posture.',
    ownerPosture: 'Ownership direction pending',
    evidenceRequirement: inherited.evidencePosture,
    stallRisk:
      inherited.driftSignal.includes('DRIFT')
        ? 'Inherited drift requires timely routing movement.'
        : 'Directional stall risk activates if routing movement is delayed.',
    commandMeaning: inherited.commandMeaning,
  }
}

function buildRoutingInterpretation(input: {
  caseItem: StabilityCase
  routingHistory: RoutingAction[]
  inherited: InheritedRoutingContext
  activeRoutingStatus: string
}) {
  const { caseItem, routingHistory, inherited, activeRoutingStatus } = input

  const recurrenceCount = routingHistory.filter((item) =>
    item.routing_status.includes('RECURRENCE'),
  ).length

  if (activeRoutingStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return activeRoutingStatus.includes('RECURRENCE')
      ? 'Governed stabilization direction has repeated and ownership is visible. CGI should now move carefully toward /interventions while preserving recurrence awareness and requiring action evidence before stabilization confidence increases.'
      : 'Governed stabilization direction is active. CGI should now preserve action evidence in /interventions before claiming stabilization credibility.'
  }

  if (activeRoutingStatus.includes('GOVERNANCE_REVIEW_REQUIRED_RECURRENCE')) {
    return 'Governance review recurrence is visible from case custody. Routing should preserve review visibility and avoid false stabilization direction until governance interpretation resolves.'
  }

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

  if (routingHistory.some((item) => item.routing_status.includes('GOVERNANCE_REVIEW'))) {
    return 'Routing is held under governance visibility review. CGI should preserve inherited triage posture, evidence posture, command meaning, and survivability sensitivity until progression becomes directionally credible.'
  }

  if (routingHistory.length > 1) {
    return 'Routing recurrence visibility remains active. CGI should continue monitoring whether stabilization direction is becoming durable or repeatedly weakening.'
  }

  if (caseItem.severity_level === 'CRITICAL') {
    return 'Critical continuity instability requires accelerated routing visibility, survivability awareness, ownership stabilization, and executive continuity oversight.'
  }

  if (inherited.routingReadiness === 'ROUTING_READY') {
    return 'This accepted case is now ready for governed stabilization direction. Routing should preserve inherited intake identity, triage posture, case memory, evidence posture, and command meaning before intervention action begins.'
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
    <div className="min-w-0 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 max-w-full break-words text-sm leading-6 text-neutral-100">
        {value}
      </p>
    </div>
  )
}

function SignalBadge({ children }: { children: ReactNode }) {
  return (
    <span className="max-w-full break-words rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
      {children}
    </span>
  )
}

function severityBadgeClass(level: string) {
  if (level === 'CRITICAL') {
    return 'shrink-0 rounded-full bg-red-900 px-3 py-2 text-xs font-semibold text-red-100'
  }

  if (level === 'HIGH') {
    return 'shrink-0 rounded-full bg-orange-900 px-3 py-2 text-xs font-semibold text-orange-100'
  }

  if (level === 'MODERATE') {
    return 'shrink-0 rounded-full bg-amber-900 px-3 py-2 text-xs font-semibold text-amber-100'
  }

  return 'shrink-0 rounded-full bg-emerald-900 px-3 py-2 text-xs font-semibold text-emerald-100'
}