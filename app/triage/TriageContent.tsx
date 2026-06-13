'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
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
  intervention_summary?: string | null
  outcome_summary?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type AuditSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

type TriageDecision =
  | 'ACCEPT_FOR_GOVERNANCE'
  | 'REQUEST_MORE_EVIDENCE'
  | 'ESCALATE_TO_COMMAND'
  | 'HOLD_FOR_CLARITY'
  | 'CLOSE_NO_CGI_ACTION'

type InheritedIntakeContext = {
  intakeIdentity: string
  entryRoute: string
  pressureType: string
  pressureMeaning: string
  severityMeaning: string
  location: string
  affectedArea: string
  visibleSignal: string
  ownershipState: string
  evidenceLevel: string
  reviewUrgency: string
  governanceVisibility: string
  visibilityClassification: string
  intakeMaturity: string
  intakeConfidence: string
  governanceReadiness: string
  ownershipPosture: string
  evidencePosture: string
  stabilizationRisk: string
  triageMeaning: string
  commandMeaning: string
  lifecycleBoundary: string
  briefNote: string
}

type TriageIntelligence = {
  gateStatus: string
  eligibilityDetermination: string
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

const ACTIVE_TRIAGE_STATUSES = ['PENDING_TRIAGE', 'UNDER_REVIEW']

const PRESERVED_TRIAGE_STATUSES = [
  'ACCEPTED_FOR_GOVERNANCE',
  'TRIAGE_EVIDENCE_REQUIRED',
  'TRIAGE_COMMAND_ESCALATION',
  'TRIAGE_CLARITY_REQUIRED',
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

    const inheritedContext = buildInheritedIntakeContext(item)
    const triageIntelligence = buildTriageIntelligenceForStatus(
      item,
      decision.status,
    )
    const triageSummary = buildTriageDecisionSummary({
      item,
      decision,
      inheritedContext,
      triageIntelligence,
    })

    const { error: updateError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: decision.status,
        outcome_summary: triageSummary,
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
      inheritedContext,
      triageIntelligence,
      severity: resolveTriageSeverity(item, decision.status),
      summary: buildTriageSummary(item, decision.status),
    })

    setMessage(
      decision.status === 'ACCEPTED_FOR_GOVERNANCE'
        ? 'Triage accepted inherited intake instability into active CGI case governance. Eligibility meaning, evidence threshold, and lifecycle traceability are preserved.'
        : 'Triage decision preserved as continuity governance evidence with inherited intake context.',
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
      title: 'Eligibility Climate',
      value: triageClimate.stabilityClimate,
    },
    {
      title: 'Gate Posture',
      value: triageClimate.gatePosture,
    },
    {
      title: 'Evidence Threshold',
      value: triageClimate.evidenceVisibility,
    },
    {
      title: 'Case Readiness',
      value: triageClimate.caseReadiness,
    },
  ]

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-5 border-b border-amber-500/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-400">
              TSINAXA CGI
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Triage
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              Judge eligibility before case governance begins.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <StageChip label="Operating Layer" value="Continuity Lifecycle" />
            <StageChip label="Executive Meaning" value="Eligibility Judgment" />
            <StageChip label="Movement" value="Cases or Command" />
          </div>
        </header>

        {message && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-semibold text-amber-100">
            {message}
          </div>
        )}

        <div className="rounded-3xl border border-neutral-800 bg-black p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white">
            Governance Eligibility Review
          </h2>

          <p className="mt-3 max-w-5xl text-sm leading-6 text-neutral-300">
            Decide whether inherited visible instability should become an
            accepted CGI case, require stronger evidence, receive command
            visibility, remain held for clarity, or close without active CGI
            action.
          </p>

          <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
            <span className="font-semibold">Boundary:</span> /triage governs
            eligibility. It inherits intake context from /request, but does not
            manage active case lifecycle movement, route ownership, execute
            stabilization action, verify outcomes, or declare recovery
            durability.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {climatePanels.map((panel) => (
            <div
              key={panel.title}
              className="rounded-2xl border border-neutral-800 bg-black p-5"
            >
              <p className="text-sm font-semibold text-white">{panel.title}</p>
              <p className="mt-3 text-sm leading-6 text-neutral-400">
                {panel.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-black p-6">
          <h3 className="text-lg font-semibold text-white">
            Triage Pressure Intelligence
          </h3>

          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {triageClimate.pressureMeaning}
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-black p-6">
          <h3 className="text-lg font-semibold text-white">
            Executive Triage Synthesis
          </h3>

          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {triageClimate.commandSynthesis}
          </p>
        </div>

        <TriageSection
          title="Awaiting Eligibility Judgment"
          description="Request opens visibility. Triage determines whether visible instability crosses the governance eligibility threshold before it becomes an accepted CGI case."
          emptyText="No visible CGI instability is currently awaiting triage review. Eligibility intelligence will activate when visible instability enters triage from governed intake."
          items={activeReviewItems}
          selectedDecisions={selectedDecisions}
          setSelectedDecisions={setSelectedDecisions}
          preserveTriageDecision={preserveTriageDecision}
        />

        <TriageSection
          title="Preserved Eligibility Decisions"
          description="These signals have already been triaged. Their eligibility decisions remain visible for governance traceability, not repeated review."
          emptyText="No preserved triage decisions are currently visible."
          items={preservedReviewItems}
          selectedDecisions={selectedDecisions}
          setSelectedDecisions={setSelectedDecisions}
          preserveTriageDecision={preserveTriageDecision}
        />

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-black p-6">
          <h3 className="text-xl font-semibold text-white">
            Triage Governance Doctrine
          </h3>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Triage is eligibility governance, not active case management. CGI
            protects the lifecycle by inheriting intake evidence and preventing
            weak, unclear, or unsupported signals from moving downstream before
            evidence, ownership, visibility, and governance relevance are
            proportionally understood.
          </p>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature triage intelligence must preserve proportional
            interpretation. When visible instability meets the governance
            threshold, the system should allow case acceptance without
            over-escalation. When inherited evidence is weak or ownership is
            unclear, the system should pause movement without pretending
            stabilization has begun.
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
  setSelectedDecisions: Dispatch<SetStateAction<Record<string, TriageDecision | ''>>>
  preserveTriageDecision: (item: VisibleInstability) => void
}) {
  return (
    <section className="mt-8 rounded-3xl border border-neutral-800 bg-black p-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-neutral-400">{description}</p>

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
  setSelectedDecisions: Dispatch<SetStateAction<Record<string, TriageDecision | ''>>>
  preserveTriageDecision: (item: VisibleInstability) => void
}) {
  const inheritedContext = buildInheritedIntakeContext(item)
  const intelligence = buildTriageIntelligence(item)
  const locked = isDecisionLocked(item)

  return (
    <article className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
            {locked ? 'Decision Preserved' : 'Eligibility Pending'}
          </p>

          <h4 className="mt-2 text-xl font-semibold text-white">
            {inheritedContext.intakeIdentity}
          </h4>

          <p className="mt-2 text-xs leading-5 text-neutral-500">
            Source record: {item.beneficiary_name}
          </p>
        </div>

        <span className={severityBadgeClass(item.severity_level)}>
          {item.severity_level}
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Info label="Triage State" value={item.case_status} />
        <Info label="Signal" value={inheritedContext.visibleSignal} />
        <Info label="Evidence" value={inheritedContext.evidenceLevel} />
        <Info label="Ownership" value={inheritedContext.ownershipState} />
      </div>

      <section className="mt-5 rounded-2xl border border-neutral-800 bg-black p-5">
        <p className="text-sm font-semibold text-amber-400">
          Eligibility Context
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Info label="Pressure" value={inheritedContext.pressureType} />
          <Info label="Location" value={inheritedContext.location} />
          <Info
            label="Visibility"
            value={inheritedContext.governanceVisibility}
          />
          <Info label="Review Urgency" value={inheritedContext.reviewUrgency} />
        </div>
      </section>

      <div className="mt-5 flex flex-wrap gap-2">
        <SignalBadge>{item.support_domain}</SignalBadge>
        <SignalBadge>{item.severity_level}</SignalBadge>
        <SignalBadge>{inheritedContext.governanceVisibility}</SignalBadge>

        {(item.safeguarding_flag || item.severity_level === 'CRITICAL') && (
          <SignalBadge>EXECUTIVE_VISIBILITY</SignalBadge>
        )}

        {item.case_status === 'ACCEPTED_FOR_GOVERNANCE' && (
          <SignalBadge>CASE_ACCEPTED</SignalBadge>
        )}

        {locked && <SignalBadge>DECISION_LOCKED</SignalBadge>}
      </div>

      <section className="mt-5 rounded-2xl border border-neutral-800 bg-black p-5">
        <p className="text-sm font-semibold text-amber-400">
          Eligibility Intelligence
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <Info label="Gate Status" value={intelligence.gateStatus} />
          <Info
            label="Eligibility"
            value={intelligence.eligibilityDetermination}
          />
          <Info label="Confidence" value={intelligence.confidence} />
          <Info label="Posture" value={intelligence.recommendedPosture} />
          <Info label="Next Movement" value={intelligence.nextMovement} />
          <Info label="Command Meaning" value={intelligence.commandMeaning} />
        </div>
      </section>

      <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <p className="text-sm font-semibold text-amber-100">
          Triage Interpretation
        </p>

        <p className="mt-2 text-sm leading-6 text-amber-50">
          {buildTriageInterpretation(item)}
        </p>
      </div>

      {locked ? (
        <div className="mt-5 rounded-2xl border border-slate-500/30 bg-slate-500/10 p-4">
          <p className="text-sm font-semibold text-slate-100">
            Decision Preserved
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-200">
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
              className="mt-2 w-full rounded-xl border border-neutral-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
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
            className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300"
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
  inheritedContext: InheritedIntakeContext
  triageIntelligence: TriageIntelligence
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
      inherited_intake_identity: input.inheritedContext.intakeIdentity,
      inherited_entry_route: input.inheritedContext.entryRoute,
      inherited_pressure_type: input.inheritedContext.pressureType,
      inherited_visible_signal: input.inheritedContext.visibleSignal,
      inherited_ownership_posture: input.inheritedContext.ownershipPosture,
      inherited_evidence_posture: input.inheritedContext.evidencePosture,
      inherited_command_meaning: input.inheritedContext.commandMeaning,
      triage_gate_status: input.triageIntelligence.gateStatus,
      eligibility_determination:
        input.triageIntelligence.eligibilityDetermination,
      triage_confidence: input.triageIntelligence.confidence,
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
        'Triage preserved the governance eligibility decision using inherited intake context before instability entered downstream case movement.',
      survivability_meaning:
        'CGI protected downstream routing and intervention from unreviewed or unclear instability.',
      governance_boundary: 'NON_PUNITIVE_CONTINUITY_GOVERNANCE',
      actor_email: user?.email ?? null,
      actor_id: user?.id ?? null,
    },
  })

  if (error) console.error(error)
}

function buildInheritedIntakeContext(item: VisibleInstability): InheritedIntakeContext {
  const source = item.intervention_summary || item.outcome_summary || ''

  return {
    intakeIdentity:
      extractIntakeField(source, 'INTAKE IDENTITY') ||
      extractIntakeField(source, 'Generated intake identity') ||
      item.beneficiary_name ||
      buildSimplifiedIdentity(item),
    entryRoute:
      extractIntakeField(source, 'ENTRY ROUTE') ||
      extractIntakeField(source, 'Entry route') ||
      'Entry route not recorded',
    pressureType:
      extractIntakeField(source, 'OPERATIONAL PRESSURE TYPE') ||
      extractIntakeField(source, 'Operational pressure type') ||
      item.support_domain ||
      'Pressure type not recorded',
    pressureMeaning:
      extractIntakeField(source, 'PRESSURE MEANING') ||
      extractIntakeField(source, 'Pressure meaning') ||
      'Pressure meaning not inherited from intake.',
    severityMeaning:
      extractIntakeField(source, 'SEVERITY MEANING') ||
      extractIntakeField(source, 'Severity meaning') ||
      'Severity meaning not inherited from intake.',
    location:
      extractIntakeField(source, 'LOCATION') ||
      extractIntakeField(source, 'Location') ||
      item.beneficiary_level ||
      'Location not recorded',
    affectedArea:
      extractIntakeField(source, 'AFFECTED AREA') ||
      extractIntakeField(source, 'Affected area') ||
      item.region ||
      'Affected area not recorded',
    visibleSignal:
      extractIntakeField(source, 'VISIBLE SIGNAL') ||
      extractIntakeField(source, 'Visible signal') ||
      item.region ||
      'Visible signal not recorded',
    ownershipState:
      extractIntakeField(source, 'OWNERSHIP STATE') ||
      extractIntakeField(source, 'Ownership state') ||
      item.institution_name ||
      'Ownership state not recorded',
    evidenceLevel:
      extractIntakeField(source, 'EVIDENCE LEVEL') ||
      extractIntakeField(source, 'Evidence level') ||
      'Evidence level not recorded',
    reviewUrgency:
      extractIntakeField(source, 'REVIEW URGENCY') ||
      extractIntakeField(source, 'Review urgency') ||
      'Review urgency not recorded',
    governanceVisibility:
      extractIntakeField(source, 'GOVERNANCE VISIBILITY') ||
      extractIntakeField(source, 'Governance visibility') ||
      (item.safeguarding_flag ? 'EXECUTIVE_VISIBILITY' : 'GOVERNANCE_VISIBILITY'),
    visibilityClassification:
      extractIntakeField(source, 'VISIBILITY CLASSIFICATION') ||
      extractIntakeField(source, 'Visibility classification') ||
      'Visibility classification inherited from request is unavailable.',
    intakeMaturity:
      extractIntakeField(source, 'INTAKE MATURITY') ||
      extractIntakeField(source, 'Intake maturity') ||
      'Intake maturity inherited from request is unavailable.',
    intakeConfidence:
      extractIntakeField(source, 'INTAKE CONFIDENCE') ||
      extractIntakeField(source, 'Intake confidence') ||
      'Intake confidence inherited from request is unavailable.',
    governanceReadiness:
      extractIntakeField(source, 'GOVERNANCE READINESS') ||
      extractIntakeField(source, 'Governance readiness') ||
      'Governance readiness inherited from request is unavailable.',
    ownershipPosture:
      extractIntakeField(source, 'OWNERSHIP POSTURE') ||
      extractIntakeField(source, 'Ownership posture') ||
      'Ownership posture inherited from request is unavailable.',
    evidencePosture:
      extractIntakeField(source, 'EVIDENCE POSTURE') ||
      extractIntakeField(source, 'Evidence posture') ||
      'Evidence posture inherited from request is unavailable.',
    stabilizationRisk:
      extractIntakeField(source, 'STABILIZATION RISK') ||
      extractIntakeField(source, 'Stabilization risk') ||
      'Stabilization risk inherited from request is unavailable.',
    triageMeaning:
      extractIntakeField(source, 'TRIAGE MEANING') ||
      extractIntakeField(source, 'Triage meaning') ||
      'Triage meaning inherited from request is unavailable.',
    commandMeaning:
      extractIntakeField(source, 'COMMAND MEANING') ||
      extractIntakeField(source, 'Command meaning') ||
      'Command meaning inherited from request is unavailable.',
    lifecycleBoundary:
      extractIntakeField(source, 'LIFECYCLE BOUNDARY') ||
      extractIntakeField(source, 'Lifecycle boundary') ||
      'Request opens visibility. Triage determines eligibility.',
    briefNote:
      extractIntakeField(source, 'BRIEF NOTE') ||
      extractIntakeField(source, 'Brief note') ||
      'No inherited intake note recorded.',
  }
}

function extractIntakeField(source: string, label: string) {
  if (!source) return ''

  const lines = source.split('\n')
  const target = label.trim().toLowerCase()

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    const normalized = line.replace(':', '').trim().toLowerCase()

    if (normalized !== target) continue

    for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
      const value = lines[nextIndex].trim()

      if (!value) continue

      return value
    }
  }

  const prefix = `${label}:`
  const inline = lines
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix))

  if (!inline) return ''

  return inline.replace(prefix, '').trim()
}

function buildTriageClimate(input: {
  allItems: VisibleInstability[]
  activeItems: VisibleInstability[]
  preservedItems: VisibleInstability[]
}) {
  if (input.allItems.length === 0) {
    return {
      stabilityClimate:
        'Awaiting inherited intake instability before triage climate interpretation activates.',
      gatePosture:
        'Eligibility gate posture will activate when visible instability enters triage from /request.',
      evidenceVisibility:
        'Inherited evidence threshold visibility pending triage activity.',
      caseReadiness:
        'Case governance readiness pending eligibility review.',
      pressureMeaning:
        'Triage pressure interpretation will activate when inherited intake evidence enters the eligibility gate.',
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
        ? 'Inherited intake instability remains proportionally manageable within the triage eligibility gate.'
        : 'Some inherited intake instability requires command visibility before ordinary lifecycle movement.',
    gatePosture:
      active === 0
        ? 'All visible triage items currently have preserved eligibility decisions.'
        : 'Eligibility gate remains active for inherited intake instability awaiting triage judgment.',
    evidenceVisibility:
      evidenceRequired === 0
        ? 'No concentrated inherited evidence threshold gap is currently blocking triage movement.'
        : 'Inherited evidence threshold gaps remain visible and should be resolved before downstream movement.',
    caseReadiness:
      accepted > 0
        ? 'Some inherited intake instability has become eligible for active case governance.'
        : 'Case governance readiness remains pending eligibility acceptance.',
    pressureMeaning:
      commandEscalation === 0 && evidenceRequired === 0 && clarityRequired === 0
        ? 'Triage pressure remains calm and proportionate under current inherited intake eligibility conditions.'
        : 'Triage pressure remains visible through command escalation, inherited evidence gaps, or clarity constraints.',
    commandSynthesis:
      commandEscalation > 0
        ? 'Inherited triage concentration may require executive continuity synthesis visibility.'
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

function buildTriageDecisionSummary(input: {
  item: VisibleInstability
  decision: {
    status: string
    reason: string
  }
  inheritedContext: InheritedIntakeContext
  triageIntelligence: TriageIntelligence
}) {
  return `
INHERITED INTAKE IDENTITY
${input.inheritedContext.intakeIdentity}

INHERITED ENTRY ROUTE
${input.inheritedContext.entryRoute}

INHERITED PRESSURE TYPE
${input.inheritedContext.pressureType}

INHERITED VISIBLE SIGNAL
${input.inheritedContext.visibleSignal}

INHERITED OWNERSHIP POSTURE
${input.inheritedContext.ownershipPosture}

INHERITED EVIDENCE POSTURE
${input.inheritedContext.evidencePosture}

INHERITED GOVERNANCE READINESS
${input.inheritedContext.governanceReadiness}

INHERITED COMMAND MEANING
${input.inheritedContext.commandMeaning}

TRIAGE RESULT
${input.decision.status}

ELIGIBILITY DETERMINATION
${input.triageIntelligence.eligibilityDetermination}

TRIAGE REASON
${input.decision.reason}

TRIAGE GATE STATUS
${input.triageIntelligence.gateStatus}

TRIAGE MATURITY
${input.triageIntelligence.maturity}

ELIGIBILITY CONFIDENCE
${input.triageIntelligence.confidence}

RECOMMENDED POSTURE
${input.triageIntelligence.recommendedPosture}

CASE READINESS
${input.triageIntelligence.downstreamSurface}

NEXT LIFECYCLE STATE
${input.triageIntelligence.nextMovement}

LIFECYCLE BOUNDARY
Request is not triage.
Triage is not case governance.
Case governance is not routing.
Routing is not action.
Action is not outcome.
Outcome is not recovery.
  `.trim()
}

function buildTriageIntelligence(item: VisibleInstability): TriageIntelligence {
  return buildTriageIntelligenceForStatus(item, item.case_status)
}

function buildTriageIntelligenceForStatus(
  item: VisibleInstability,
  status: string,
): TriageIntelligence {
  const inheritedContext = buildInheritedIntakeContext(item)

  if (status === 'ACCEPTED_FOR_GOVERNANCE') {
    return {
      gateStatus: 'Accepted into governance',
      eligibilityDetermination: 'ELIGIBLE_ACCEPTED_FOR_CASE_GOVERNANCE',
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

  if (
    status.includes('EVIDENCE_REQUIRED') ||
    inheritedContext.evidenceLevel === 'NONE' ||
    inheritedContext.evidenceLevel === 'LIMITED'
  ) {
    return {
      gateStatus: 'Evidence gate',
      eligibilityDetermination: 'ELIGIBILITY_WITHHELD_PENDING_EVIDENCE',
      maturity: 'EVIDENCE_ALIGNMENT_PENDING',
      confidence: 'LIMITED_ELIGIBILITY_CONFIDENCE',
      recommendedPosture: 'Do not accept until evidence improves',
      evidenceMeaning:
        'Inherited evidence is not yet sufficient for confident downstream governance.',
      ownershipMeaning:
        'Ownership may remain secondary until evidence threshold strengthens.',
      riskMeaning: 'Risk increases if weak inherited evidence is accepted too early',
      nextMovement: 'Request missing evidence before acceptance',
      downstreamSurface: '/triage',
      commandMeaning:
        'Weak inherited evidence can create false stabilization confidence if accepted too early.',
    }
  }

  if (
    status.includes('COMMAND_ESCALATION') ||
    inheritedContext.governanceVisibility === 'COMMAND_VISIBILITY'
  ) {
    return {
      gateStatus: 'Command visibility required',
      eligibilityDetermination: 'ELIGIBILITY_HELD_FOR_COMMAND_REVIEW',
      maturity: 'EXECUTIVE_TRIAGE_VISIBILITY',
      confidence: 'HIGH_ATTENTION_REQUIRED',
      recommendedPosture: 'Elevate before ordinary case movement',
      evidenceMeaning: 'Inherited evidence should be preserved for executive review',
      ownershipMeaning: 'Ownership may require command-level clarification',
      riskMeaning: 'High visibility risk if handled routinely',
      nextMovement: 'Preserve command review before downstream movement',
      downstreamSurface: '/command',
      commandMeaning:
        'This inherited intake signal exceeds routine triage and requires executive awareness.',
    }
  }

  if (
    status.includes('CLARITY_REQUIRED') ||
    inheritedContext.ownershipState === 'UNCLEAR' ||
    inheritedContext.ownershipState === 'MISSING' ||
    inheritedContext.ownershipState === 'CONTESTED'
  ) {
    return {
      gateStatus: 'Clarity gate',
      eligibilityDetermination:
        'ELIGIBILITY_WITHHELD_PENDING_OWNERSHIP_OR_SCOPE_CLARITY',
      maturity: 'CLARITY_ALIGNMENT_PENDING',
      confidence: 'VARIABLE_ELIGIBILITY_CONFIDENCE',
      recommendedPosture: 'Hold until ownership, scope, or context is clearer',
      evidenceMeaning:
        'Evidence appears usable for triage, but ownership or scope clarity is still required before acceptance.',
      ownershipMeaning: 'Inherited ownership is not clear enough',
      riskMeaning: 'Risk of misrouting if accepted too early',
      nextMovement: 'Clarify ownership, scope, or institutional context',
      downstreamSurface: '/triage',
      commandMeaning:
        'CGI is preventing unclear inherited instability from entering the active chain prematurely.',
    }
  }

  if (status.includes('CLOSED_NO_CGI_ACTION')) {
    return {
      gateStatus: 'Closed at triage',
      eligibilityDetermination: 'NOT_ELIGIBLE_FOR_ACTIVE_CGI_CASE_GOVERNANCE',
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
      eligibilityDetermination:
        'PROVISIONALLY_ELIGIBLE_REQUIRES_EXECUTIVE_VISIBILITY',
      maturity: 'ELEVATED_ELIGIBILITY_REVIEW',
      confidence: 'EXECUTIVE_VISIBILITY_RECOMMENDED',
      recommendedPosture: 'Executive visibility recommended',
      evidenceMeaning: 'Inherited evidence must be preserved carefully',
      ownershipMeaning: 'Ownership must not remain unclear',
      riskMeaning: 'High if review is delayed',
      nextMovement: 'Escalate or accept with strong governance visibility',
      downstreamSurface: '/triage or /command',
      commandMeaning:
        'This inherited instability should not move silently into routine handling.',
    }
  }

  if (item.severity_level === 'HIGH') {
    return {
      gateStatus: 'High-pressure triage',
      eligibilityDetermination: 'PROVISIONALLY_ELIGIBLE_PENDING_TRIAGE_DECISION',
      maturity: 'HIGH_PRESSURE_ELIGIBILITY_REVIEW',
      confidence: 'GOVERNANCE_LIKELY_IF_EVIDENCE_SUPPORTS',
      recommendedPosture: 'Likely accept or escalate depending on evidence',
      evidenceMeaning: 'Inherited evidence should be strong enough to support movement',
      ownershipMeaning: 'Ownership should be identified quickly',
      riskMeaning: 'May expand if triage stalls',
      nextMovement: 'Decide acceptance, evidence request, or escalation',
      downstreamSurface: '/triage',
      commandMeaning:
        'This inherited signal may become broader continuity pressure if delayed.',
    }
  }

  return {
    gateStatus: 'Pending triage judgment',
    eligibilityDetermination: 'ELIGIBILITY_NOT_YET_DETERMINED',
    maturity: 'ELIGIBILITY_REVIEW_PENDING',
    confidence: 'ELIGIBILITY_CONFIDENCE_PENDING',
    recommendedPosture: 'Review for governance eligibility',
    evidenceMeaning: 'Inherited evidence should be checked before case acceptance',
    ownershipMeaning: 'Inherited ownership should be clear enough for routing',
    riskMeaning: 'Moderate if not reviewed',
    nextMovement: 'Choose acceptance, clarity, evidence, escalation, or closure',
    downstreamSurface: '/triage',
    commandMeaning:
      'The inherited intake signal should remain visible until triage determines the correct path.',
  }
}

function buildTriageInterpretation(item: VisibleInstability) {
  const inheritedContext = buildInheritedIntakeContext(item)

  if (item.case_status === 'ACCEPTED_FOR_GOVERNANCE') {
    return 'This inherited intake signal has already been accepted into CGI case governance and should continue through case lifecycle governance.'
  }

  if (item.case_status.includes('EVIDENCE_REQUIRED')) {
    return 'This inherited intake signal needs stronger evidence before it can safely become a governed case.'
  }

  if (item.case_status.includes('COMMAND_ESCALATION')) {
    return 'This inherited intake signal requires command visibility before ordinary case movement continues.'
  }

  if (item.case_status.includes('CLARITY_REQUIRED')) {
    return 'This inherited intake signal requires clearer ownership, scope, or context before acceptance.'
  }

  if (item.case_status.includes('CLOSED_NO_CGI_ACTION')) {
    return 'This inherited intake signal was reviewed and did not require active CGI case governance.'
  }

  if (
    inheritedContext.evidenceLevel === 'NONE' ||
    inheritedContext.evidenceLevel === 'LIMITED'
  ) {
    return 'Inherited intake evidence remains limited. Triage should not treat downstream stabilization as credible until evidence threshold improves.'
  }

  if (
    inheritedContext.ownershipState === 'UNCLEAR' ||
    inheritedContext.ownershipState === 'MISSING' ||
    inheritedContext.ownershipState === 'CONTESTED'
  ) {
    return 'Inherited ownership posture is unclear. Triage should clarify responsibility before accepting this signal into ordinary lifecycle movement.'
  }

  if (item.safeguarding_flag || item.severity_level === 'CRITICAL') {
    return 'This inherited intake signal carries elevated visibility and should not move silently into routine handling.'
  }

  return 'This inherited intake signal is ready for triage review before it becomes an accepted CGI case.'
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

function StageChip({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-amber-50">{value}</p>
    </article>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-black p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-neutral-100">{value}</p>
    </div>
  )
}

function SignalBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-100">
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

  return 'rounded-full bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100'
}