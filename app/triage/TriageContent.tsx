'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../../lib/supabase'

type VisibleInstability = {
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
}

type AuditSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

type TriageDecision =
  | 'ACCEPT_FOR_GOVERNANCE'
  | 'REQUEST_MORE_EVIDENCE'
  | 'ESCALATE_TO_COMMAND'
  | 'HOLD_FOR_CLARITY'
  | 'CLOSE_NO_CGI_ACTION'

type TriageIntelligence = {
  gateStatus: string
  maturity: string
  confidence: string
  recommendedPosture: string
  evidenceMeaning: string
  ownershipMeaning: string
  riskMeaning: string
  nextMovement: string
  downstreamSurface: string
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

const ACTIVE_TRIAGE_STATUSES = [
  'PENDING_TRIAGE',
  'UNDER_REVIEW',
  'TRIAGE_EVIDENCE_REQUIRED',
  'TRIAGE_COMMAND_ESCALATION',
  'TRIAGE_CLARITY_REQUIRED',
]

const PRESERVED_TRIAGE_STATUSES = [
  'ACCEPTED_FOR_GOVERNANCE',
  'TRIAGE_CLOSED_NO_CGI_ACTION',
]

const TRIAGE_QUEUE_STATUSES = [
  ...ACTIVE_TRIAGE_STATUSES,
  ...PRESERVED_TRIAGE_STATUSES,
]

const TRIAGE_DECISIONS: {
  value: TriageDecision
  label: string
  status: string
  reason: string
}[] = [
  {
    value: 'ACCEPT_FOR_GOVERNANCE',
    label: 'Accept into case governance',
    status: 'ACCEPTED_FOR_GOVERNANCE',
    reason:
      'Visible instability requires governed continuity oversight and should become an active CGI case.',
  },
  {
    value: 'REQUEST_MORE_EVIDENCE',
    label: 'Request more evidence',
    status: 'TRIAGE_EVIDENCE_REQUIRED',
    reason:
      'Visible instability cannot yet be accepted because evidence is insufficient.',
  },
  {
    value: 'ESCALATE_TO_COMMAND',
    label: 'Escalate to command visibility',
    status: 'TRIAGE_COMMAND_ESCALATION',
    reason:
      'Visible instability requires executive visibility before normal case movement.',
  },
  {
    value: 'HOLD_FOR_CLARITY',
    label: 'Hold for ownership or scope clarity',
    status: 'TRIAGE_CLARITY_REQUIRED',
    reason:
      'Visible instability requires clearer ownership, scope, or institutional context before acceptance.',
  },
  {
    value: 'CLOSE_NO_CGI_ACTION',
    label: 'Close: no CGI action required',
    status: 'TRIAGE_CLOSED_NO_CGI_ACTION',
    reason:
      'Visible instability does not currently require CGI governance.',
  },
]

export default function TriageContent() {
  const [items, setItems] = useState<VisibleInstability[]>([])
  const [selectedDecisions, setSelectedDecisions] = useState<
    Record<string, TriageDecision | ''>
  >({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .in('support_domain', CGI_PRESSURE_TYPES)
      .in('case_status', TRIAGE_QUEUE_STATUSES)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setItems(sortByTriagePriority(data || []))
  }

  async function preserveTriageDecision(item: VisibleInstability) {
    if (isDecisionLocked(item)) {
      setMessage('This triage decision is already preserved and locked.')
      return
    }

    const decisionValue = selectedDecisions[item.id]

    if (!decisionValue) {
      setMessage('Select a triage decision before preserving review.')
      return
    }

    const decision = TRIAGE_DECISIONS.find(
      (entry) => entry.value === decisionValue,
    )

    if (!decision) return

    const { error: updateError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: decision.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    if (updateError) {
      alert(updateError.message)
      return
    }

    await preserveTriageEvidence({
      item,
      decision,
      severity: resolveTriageSeverity(item, decision.status),
      summary: buildTriageSummary(item, decision.status),
    })

    setMessage(
      decision.status === 'ACCEPTED_FOR_GOVERNANCE'
        ? 'Triage accepted visible instability into active CGI case governance. Eligibility, evidence threshold, and lifecycle traceability are preserved.'
        : 'Triage decision preserved as continuity governance evidence.',
    )

    await loadData()
  }

  const activeReviewItems = useMemo(
    () => items.filter((item) => !isDecisionLocked(item)),
    [items],
  )

  const preservedReviewItems = useMemo(
    () => items.filter((item) => isDecisionLocked(item)),
    [items],
  )

  const triageClimate = useMemo(
    () =>
      buildTriageClimate({
        allItems: items,
        activeItems: activeReviewItems,
        preservedItems: preservedReviewItems,
      }),
    [items, activeReviewItems, preservedReviewItems],
  )

  const climatePanels = [
    {
      title: 'Triage Stability Climate',
      value: triageClimate.stabilityClimate,
    },
    {
      title: 'Eligibility Gate Posture',
      value: triageClimate.gatePosture,
    },
    {
      title: 'Evidence Threshold Visibility',
      value: triageClimate.evidenceVisibility,
    },
    {
      title: 'Case Governance Readiness',
      value: triageClimate.caseReadiness,
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
          TSINAXA CGI • TRIAGE ELIGIBILITY INTELLIGENCE
        </p>

        <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white">
            Governance Eligibility Review
          </h2>

          <p className="mt-3 max-w-5xl text-sm leading-6 text-neutral-300">
            Decide whether visible instability should become an accepted CGI case,
            require stronger evidence, receive command visibility, remain held for
            clarity, or close without active CGI action.
          </p>

          <p className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
            <span className="font-semibold">Boundary:</span> /triage governs
            eligibility. It does not manage active case lifecycle movement, route
            ownership, execute stabilization action, verify outcomes, or declare
            recovery durability.
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
            Triage Pressure Intelligence
          </h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {triageClimate.pressureMeaning}
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-lg font-semibold text-white">
            Executive Triage Synthesis
          </h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {triageClimate.commandSynthesis}
          </p>
        </div>

        <TriageSection
          title="Awaiting Triage Review"
          description="Request opens visibility. Triage determines whether visible instability crosses the governance eligibility threshold before it becomes an accepted CGI case."
          emptyText="No visible CGI instability is currently awaiting triage review. Eligibility intelligence will activate when visible instability enters triage."
          items={activeReviewItems}
          selectedDecisions={selectedDecisions}
          setSelectedDecisions={setSelectedDecisions}
          preserveTriageDecision={preserveTriageDecision}
        />

        <TriageSection
          title="Preserved Triage Decisions"
          description="These signals have already been triaged. Their decisions remain visible for governance traceability, not repeated review."
          emptyText="No preserved triage decisions are currently visible."
          items={preservedReviewItems}
          selectedDecisions={selectedDecisions}
          setSelectedDecisions={setSelectedDecisions}
          preserveTriageDecision={preserveTriageDecision}
        />

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-xl font-semibold text-white">
            Triage Governance Doctrine
          </h3>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Triage is eligibility governance, not active case management. CGI
            protects the lifecycle by preventing weak, unclear, or unsupported
            signals from moving downstream before evidence, ownership, visibility,
            and governance relevance are proportionally understood.
          </p>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature triage intelligence must preserve proportional interpretation.
            When visible instability meets the governance threshold, the system
            should allow case acceptance without over-escalation. When evidence is
            weak or ownership is unclear, the system should pause movement without
            pretending stabilization has begun.
          </p>
        </section>
      </section>
    </main>
  )
}

function TriageSection({
  title,
  description,
  emptyText,
  items,
  selectedDecisions,
  setSelectedDecisions,
  preserveTriageDecision,
}: {
  title: string
  description: string
  emptyText: string
  items: VisibleInstability[]
  selectedDecisions: Record<string, TriageDecision | ''>
  setSelectedDecisions: React.Dispatch<
    React.SetStateAction<Record<string, TriageDecision | ''>>
  >
  preserveTriageDecision: (item: VisibleInstability) => void
}) {
  return (
    <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-neutral-400">
        {description}
      </p>

      <div className="mt-6 grid gap-5">
        {items.map((item) => (
          <TriageCard
            key={item.id}
            item={item}
            selectedDecision={selectedDecisions[item.id] || ''}
            setSelectedDecisions={setSelectedDecisions}
            preserveTriageDecision={preserveTriageDecision}
          />
        ))}

        {items.length === 0 && (
          <div className="rounded-3xl border border-dashed border-neutral-700 bg-neutral-950 p-8 text-center text-sm leading-6 text-neutral-400">
            {emptyText}
          </div>
        )}
      </div>
    </section>
  )
}

function TriageCard({
  item,
  selectedDecision,
  setSelectedDecisions,
  preserveTriageDecision,
}: {
  item: VisibleInstability
  selectedDecision: TriageDecision | ''
  setSelectedDecisions: React.Dispatch<
    React.SetStateAction<Record<string, TriageDecision | ''>>
  >
  preserveTriageDecision: (item: VisibleInstability) => void
}) {
  const intelligence = buildTriageIntelligence(item)
  const locked = isDecisionLocked(item)

  return (
    <article className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
            {locked ? 'Decision Preserved' : 'Visible Instability'}
          </p>

          <h4 className="mt-2 text-xl font-semibold text-white">
            {buildSimplifiedIdentity(item)}
          </h4>

          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Full identity: {item.beneficiary_name}
          </p>
        </div>

        <span className={severityBadgeClass(item.severity_level)}>
          {item.severity_level}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Info label="Triage State" value={item.case_status} />
        <Info label="Pressure Type" value={item.support_domain} />
        <Info
          label="Site / Institution"
          value={item.institution_name || GOVERNANCE_INSTITUTION}
        />
        <Info label="Region" value={item.region || 'Not provided'} />
        <Info
          label="Visibility"
          value={
            item.safeguarding_flag || item.severity_level === 'CRITICAL'
              ? 'Executive visibility'
              : 'Governance visibility'
          }
        />
        <Info label="Next Surface" value={intelligence.downstreamSurface} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <SignalBadge>{item.support_domain}</SignalBadge>
        <SignalBadge>{item.severity_level}</SignalBadge>

        {(item.safeguarding_flag || item.severity_level === 'CRITICAL') && (
          <SignalBadge>EXECUTIVE_VISIBILITY</SignalBadge>
        )}

        {item.case_status === 'ACCEPTED_FOR_GOVERNANCE' && (
          <SignalBadge>CASE_ACCEPTED</SignalBadge>
        )}

        {locked && <SignalBadge>DECISION_LOCKED</SignalBadge>}
      </div>

      <section className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <p className="text-sm font-semibold text-cyan-400">
          Triage Intelligence Panel
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Info label="Gate Status" value={intelligence.gateStatus} />
          <Info label="Triage Maturity" value={intelligence.maturity} />
          <Info
            label="Eligibility Confidence"
            value={intelligence.confidence}
          />
          <Info
            label="Recommended Posture"
            value={intelligence.recommendedPosture}
          />
          <Info label="Evidence Meaning" value={intelligence.evidenceMeaning} />
          <Info
            label="Ownership Meaning"
            value={intelligence.ownershipMeaning}
          />
          <Info label="Risk Meaning" value={intelligence.riskMeaning} />
          <Info
            label="Required Next Movement"
            value={intelligence.nextMovement}
          />
          <Info label="Command Meaning" value={intelligence.commandMeaning} />
        </div>
      </section>

      <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
        <p className="text-sm font-semibold text-cyan-100">
          Triage Interpretation
        </p>

        <p className="mt-2 text-sm leading-6 text-cyan-50">
          {buildTriageInterpretation(item)}
        </p>
      </div>

      {locked ? (
        <div className="mt-5 rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
          <p className="text-sm font-semibold text-violet-100">
            Decision Preserved
          </p>

          <p className="mt-2 text-sm leading-6 text-violet-50">
            This triage decision is locked for governance visibility. Continue
            lifecycle movement through {intelligence.downstreamSurface}.
          </p>
        </div>
      ) : (
        <>
          <label className="mt-5 block">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Triage Decision
            </span>

            <select
              value={selectedDecision}
              onChange={(event) =>
                setSelectedDecisions((current) => ({
                  ...current,
                  [item.id]: event.target.value as TriageDecision,
                }))
              }
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="">Select triage decision</option>

              {TRIAGE_DECISIONS.map((decision) => (
                <option key={decision.value} value={decision.value}>
                  {decision.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => preserveTriageDecision(item)}
            className="mt-5 w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-cyan-300"
          >
            Preserve Triage Decision
          </button>
        </>
      )}
    </article>
  )
}

async function preserveTriageEvidence(input: {
  item: VisibleInstability
  decision: {
    status: string
    reason: string
  }
  severity: AuditSeverity
  summary: string
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const institution = input.item.institution_name || GOVERNANCE_INSTITUTION

  const { error } = await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    email: user?.email ?? null,
    role: 'CGI_TRIAGE_GOVERNANCE_ACTOR',
    action_type: 'CGI_TRIAGE_DECISION_PRESERVED',
    route: '/triage',
    record_type: 'beneficiary_cases',
    record_id: input.item.id,
    summary: input.summary,
    severity: input.severity,
    details: {
      evidence_type: 'CGI_TRIAGE_EVIDENCE',
      linked_case_id: input.item.id,
      pressure_type: input.item.support_domain,
      triage_status: input.decision.status,
      triage_reason: input.decision.reason,
      governance_institution: institution,
      institution_name: institution,
      visibility_level:
        input.item.safeguarding_flag ||
        input.item.severity_level === 'CRITICAL' ||
        input.decision.status.includes('COMMAND_ESCALATION')
          ? 'EXECUTIVE'
          : 'GOVERNANCE',
      continuity_interpretation:
        'Triage preserved the governance eligibility decision before instability entered downstream case movement.',
      survivability_meaning:
        'CGI protected downstream routing and intervention from unreviewed or unclear instability.',
      governance_boundary: 'NON_PUNITIVE_CONTINUITY_GOVERNANCE',
      actor_email: user?.email ?? null,
      actor_id: user?.id ?? null,
    },
  })

  if (error) console.error(error)
}

function buildTriageClimate(input: {
  allItems: VisibleInstability[]
  activeItems: VisibleInstability[]
  preservedItems: VisibleInstability[]
}) {
  if (input.allItems.length === 0) {
    return {
      stabilityClimate:
        'Awaiting visible instability before triage climate interpretation activates.',
      gatePosture:
        'Eligibility gate posture will activate when visible instability enters triage.',
      evidenceVisibility:
        'Evidence threshold visibility pending triage activity.',
      caseReadiness:
        'Case governance readiness pending eligibility review.',
      pressureMeaning:
        'Triage pressure interpretation will activate when visible instability enters the eligibility gate.',
      commandSynthesis:
        'No active triage concentration currently requiring executive continuity synthesis.',
    }
  }

  const commandEscalation = input.allItems.filter((item) =>
    item.case_status.includes('COMMAND_ESCALATION'),
  ).length

  const evidenceRequired = input.allItems.filter((item) =>
    item.case_status.includes('EVIDENCE_REQUIRED'),
  ).length

  const clarityRequired = input.allItems.filter((item) =>
    item.case_status.includes('CLARITY_REQUIRED'),
  ).length

  const accepted = input.allItems.filter(
    (item) => item.case_status === 'ACCEPTED_FOR_GOVERNANCE',
  ).length

  const active = input.activeItems.length

  return {
    stabilityClimate:
      commandEscalation === 0
        ? 'Visible instability remains proportionally manageable within the triage eligibility gate.'
        : 'Some visible instability requires command visibility before ordinary lifecycle movement.',
    gatePosture:
      active === 0
        ? 'All visible triage items currently have preserved eligibility decisions.'
        : 'Eligibility gate remains active for visible instability awaiting triage judgment.',
    evidenceVisibility:
      evidenceRequired === 0
        ? 'No concentrated evidence threshold gap is currently blocking triage movement.'
        : 'Evidence threshold gaps remain visible and should be resolved before downstream movement.',
    caseReadiness:
      accepted > 0
        ? 'Some visible instability has become eligible for active case governance.'
        : 'Case governance readiness remains pending eligibility acceptance.',
    pressureMeaning:
      commandEscalation === 0 && evidenceRequired === 0 && clarityRequired === 0
        ? 'Triage pressure remains calm and proportionate under current eligibility review conditions.'
        : 'Triage pressure remains visible through command escalation, evidence gaps, or clarity constraints.',
    commandSynthesis:
      commandEscalation > 0
        ? 'Triage concentration may require executive continuity synthesis visibility.'
        : 'No concentrated triage deterioration currently requiring command escalation.',
  }
}

function isDecisionLocked(item: VisibleInstability) {
  return PRESERVED_TRIAGE_STATUSES.includes(item.case_status)
}

function sortByTriagePriority(items: VisibleInstability[]) {
  return [...items].sort((a, b) => {
    const aScore = triagePriorityScore(a)
    const bScore = triagePriorityScore(b)

    if (aScore !== bScore) return bScore - aScore

    return (
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
    )
  })
}

function triagePriorityScore(item: VisibleInstability) {
  let score = 0

  if (!isDecisionLocked(item)) score += 100
  if (item.case_status.includes('COMMAND_ESCALATION')) score += 50
  if (item.severity_level === 'CRITICAL') score += 40
  if (item.severity_level === 'HIGH') score += 30
  if (item.safeguarding_flag) score += 20
  if (item.case_status.includes('CLARITY_REQUIRED')) score += 15
  if (item.case_status.includes('EVIDENCE_REQUIRED')) score += 10

  return score
}

function buildSimplifiedIdentity(item: VisibleInstability) {
  const location = item.beneficiary_level || item.region || 'Unspecified site'
  return `${item.support_domain} triage • ${location}`
}

function buildTriageSummary(item: VisibleInstability, status: string) {
  return `Triage eligibility decision preserved for ${buildSimplifiedIdentity(
    item,
  )}. Status: ${status}.`
}

function buildTriageIntelligence(item: VisibleInstability): TriageIntelligence {
  if (item.case_status === 'ACCEPTED_FOR_GOVERNANCE') {
    return {
      gateStatus: 'Accepted into governance',
      maturity: 'ELIGIBILITY_CONFIRMED',
      confidence: 'CASE_GOVERNANCE_READY',
      recommendedPosture: 'Ready for active case governance',
      evidenceMeaning: 'Evidence threshold passed or accepted for governance',
      ownershipMeaning: 'Ownership can be clarified downstream if required',
      riskMeaning: 'Risk now belongs inside active case governance',
      nextMovement: 'Move toward case lifecycle governance and routing',
      downstreamSurface: '/cases',
      commandMeaning:
        'This instability has crossed the threshold into active CGI oversight.',
    }
  }

  if (item.case_status.includes('EVIDENCE_REQUIRED')) {
    return {
      gateStatus: 'Evidence gate',
      maturity: 'EVIDENCE_ALIGNMENT_PENDING',
      confidence: 'LIMITED_ELIGIBILITY_CONFIDENCE',
      recommendedPosture: 'Do not accept until evidence improves',
      evidenceMeaning: 'Evidence is not yet sufficient for credible governance',
      ownershipMeaning: 'Ownership may remain secondary until evidence improves',
      riskMeaning: 'Risk increases if weak evidence is accepted too early',
      nextMovement: 'Request missing evidence before acceptance',
      downstreamSurface: '/triage',
      commandMeaning:
        'Weak evidence can create false stabilization confidence if accepted too early.',
    }
  }

  if (item.case_status.includes('COMMAND_ESCALATION')) {
    return {
      gateStatus: 'Command visibility required',
      maturity: 'EXECUTIVE_TRIAGE_VISIBILITY',
      confidence: 'HIGH_ATTENTION_REQUIRED',
      recommendedPosture: 'Elevate before ordinary case movement',
      evidenceMeaning: 'Evidence should be preserved for executive review',
      ownershipMeaning: 'Ownership may require command-level clarification',
      riskMeaning: 'High visibility risk if handled routinely',
      nextMovement: 'Preserve command review before downstream movement',
      downstreamSurface: '/command',
      commandMeaning:
        'This instability exceeds routine triage and requires executive awareness.',
    }
  }

  if (item.case_status.includes('CLARITY_REQUIRED')) {
    return {
      gateStatus: 'Clarity gate',
      maturity: 'CLARITY_ALIGNMENT_PENDING',
      confidence: 'VARIABLE_ELIGIBILITY_CONFIDENCE',
      recommendedPosture: 'Hold until ownership, scope, or context is clearer',
      evidenceMeaning: 'Evidence may exist but context is not yet actionable',
      ownershipMeaning: 'Ownership or scope is not clear enough',
      riskMeaning: 'Risk of misrouting if accepted too early',
      nextMovement: 'Clarify ownership, scope, or institutional context',
      downstreamSurface: '/triage',
      commandMeaning:
        'CGI is preventing unclear instability from entering the active chain prematurely.',
    }
  }

  if (item.case_status.includes('CLOSED_NO_CGI_ACTION')) {
    return {
      gateStatus: 'Closed at triage',
      maturity: 'NO_ACTIVE_CGI_GOVERNANCE_REQUIRED',
      confidence: 'CLOSURE_CONFIDENCE_PRESERVED',
      recommendedPosture: 'No active CGI case required',
      evidenceMeaning: 'Evidence did not justify active governance',
      ownershipMeaning: 'Ownership can remain outside CGI governance',
      riskMeaning: 'Low if no recurrence appears',
      nextMovement: 'Monitor only if signal returns',
      downstreamSurface: 'Archive / memory watch',
      commandMeaning:
        'Triage protected the system from unnecessary case creation.',
    }
  }

  if (item.safeguarding_flag || item.severity_level === 'CRITICAL') {
    return {
      gateStatus: 'Elevated triage visibility',
      maturity: 'ELEVATED_ELIGIBILITY_REVIEW',
      confidence: 'EXECUTIVE_VISIBILITY_RECOMMENDED',
      recommendedPosture: 'Executive visibility recommended',
      evidenceMeaning: 'Evidence must be preserved carefully',
      ownershipMeaning: 'Ownership must not remain unclear',
      riskMeaning: 'High if review is delayed',
      nextMovement: 'Escalate or accept with strong governance visibility',
      downstreamSurface: '/triage or /command',
      commandMeaning:
        'This instability should not move silently into routine handling.',
    }
  }

  if (item.severity_level === 'HIGH') {
    return {
      gateStatus: 'High-pressure triage',
      maturity: 'HIGH_PRESSURE_ELIGIBILITY_REVIEW',
      confidence: 'GOVERNANCE_LIKELY_IF_EVIDENCE_SUPPORTS',
      recommendedPosture: 'Likely accept or escalate depending on evidence',
      evidenceMeaning: 'Evidence should be strong enough to support movement',
      ownershipMeaning: 'Ownership should be identified quickly',
      riskMeaning: 'May expand if triage stalls',
      nextMovement: 'Decide acceptance, evidence request, or escalation',
      downstreamSurface: '/triage',
      commandMeaning:
        'This signal may become broader continuity pressure if delayed.',
    }
  }

  return {
    gateStatus: 'Pending triage judgment',
    maturity: 'ELIGIBILITY_REVIEW_PENDING',
    confidence: 'ELIGIBILITY_CONFIDENCE_PENDING',
    recommendedPosture: 'Review for governance eligibility',
    evidenceMeaning: 'Evidence should be checked before case acceptance',
    ownershipMeaning: 'Ownership should be clear enough for routing',
    riskMeaning: 'Moderate if not reviewed',
    nextMovement: 'Choose acceptance, clarity, evidence, escalation, or closure',
    downstreamSurface: '/triage',
    commandMeaning:
      'The signal should remain visible until triage determines the correct path.',
  }
}

function buildTriageInterpretation(item: VisibleInstability) {
  if (item.case_status === 'ACCEPTED_FOR_GOVERNANCE') {
    return 'This instability has already been accepted into CGI case governance and should continue through case lifecycle governance.'
  }

  if (item.case_status.includes('EVIDENCE_REQUIRED')) {
    return 'This instability needs stronger evidence before it can safely become a governed case.'
  }

  if (item.case_status.includes('COMMAND_ESCALATION')) {
    return 'This instability requires command visibility before ordinary case movement continues.'
  }

  if (item.case_status.includes('CLARITY_REQUIRED')) {
    return 'This instability requires clearer ownership, scope, or context before acceptance.'
  }

  if (item.case_status.includes('CLOSED_NO_CGI_ACTION')) {
    return 'This instability was reviewed and did not require active CGI case governance.'
  }

  if (item.safeguarding_flag || item.severity_level === 'CRITICAL') {
    return 'This instability carries elevated visibility and should not move silently into routine handling.'
  }

  return 'This visible instability is ready for triage review before it becomes an accepted CGI case.'
}

function resolveTriageSeverity(
  item: VisibleInstability,
  status: string,
): AuditSeverity {
  if (item.severity_level === 'CRITICAL') return 'CRITICAL'

  if (item.safeguarding_flag || status.includes('COMMAND_ESCALATION')) {
    return 'HIGH'
  }

  if (item.severity_level === 'HIGH') return 'HIGH'
  if (item.severity_level === 'MODERATE') return 'MODERATE'

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