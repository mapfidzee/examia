'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type InstabilityCase = {
  id: string
  beneficiary_name: string
  beneficiary_level: string | null
  support_domain: string
  case_status: string
  severity_level: string
  instability_signals: string[] | null
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  intervention_summary: string | null
  outcome_summary: string | null
  created_at?: string
}

type TimelineEntry = {
  id?: string
  case_id: string
  event_type: string | null
  event_summary: string | null
  created_at?: string | null
}

type InheritedGovernanceContext = {
  inheritedIntakeIdentity: string
  inheritedEntryRoute: string
  inheritedPressureType: string
  inheritedVisibleSignal: string
  inheritedOwnershipPosture: string
  inheritedEvidencePosture: string
  inheritedGovernanceReadiness: string
  inheritedCommandMeaning: string
  triageResult: string
  triageReason: string
  triageGateStatus: string
  triageMaturity: string
  eligibilityConfidence: string
  recommendedPosture: string
  caseReadiness: string
  nextLifecycleState: string
  memorySource: string
  lifecycleNarrative: string
  driftSignal: string
  convergenceSignal: string
}

type CaseIntelligence = {
  phase: string
  maturity: string
  confidence: string
  nextMovement: string
  evidencePosture: string
  stagnationRisk: string
  commandMeaning: string
}

type CaseClimate = {
  stabilityClimate: string
  lifecyclePosture: string
  evidenceVisibility: string
  routingLandscape: string
  pressureMeaning: string
  commandSynthesis: string
  driftIntelligence: string
  convergenceIntelligence: string
}

const ACTIVE_CASE_STATUSES = [
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
  'ACTION_ACTIVE',
  'INTERVENTION_ACTIVE',
  'INTERVENTION_RECORDED',
  'PARTIAL_STABILIZATION',
  'FOLLOW_UP_REQUIRED',
  'IMPROVING',
  'RECOVERY_MONITORING',
  'ESCALATED',
  'REOPENED',
]

const PRESSURE_TYPES = [
  'FLOW',
  'COVERAGE',
  'COORDINATION',
  'OWNERSHIP',
  'EVIDENCE',
  'RECOVERY',
  'RELIABILITY',
]

const FORWARD_MOVEMENTS = [
  'STABILIZATION_OWNER_ROUTED',
  'ACTION_ACTIVE',
  'PARTIAL_STABILIZATION',
  'FOLLOW_UP_REQUIRED',
  'IMPROVING',
  'RECOVERY_MONITORING',
  'STABILIZED',
  'ARCHIVED',
]

const ESCALATION_MOVEMENTS = [
  'GOVERNANCE_REVIEW_REQUIRED',
  'EVIDENCE_REQUIRED_BEFORE_ROUTING',
  'OWNERSHIP_CLARITY_REQUIRED',
  'ROUTING_STALLED',
  'ESCALATED',
  'REOPENED',
]

const OVERRIDE_MOVEMENTS = [
  'ACCEPTED_FOR_GOVERNANCE',
  'STABILIZATION_OWNER_ROUTED',
  'ACTION_ACTIVE',
  'PARTIAL_STABILIZATION',
  'RECOVERY_MONITORING',
]

export default function CasesPage() {
  return (
    <CGIGovernanceShell>
      <CasesContent />
    </CGIGovernanceShell>
  )
}

function CasesContent() {
  const [cases, setCases] = useState<InstabilityCase[]>([])
  const [timelineMemory, setTimelineMemory] = useState<
    Record<string, TimelineEntry[]>
  >({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCases()
  }, [])

  async function loadCases() {
    const [casesResult, timelineResult] = await Promise.all([
      supabase
        .from('beneficiary_cases')
        .select('*')
        .in('support_domain', PRESSURE_TYPES)
        .in('case_status', ACTIVE_CASE_STATUSES)
        .order('created_at', { ascending: false }),
      supabase
        .from('case_timeline')
        .select('*')
        .order('created_at', { ascending: false }),
    ])

    if (casesResult.error) {
      console.error(casesResult.error)
      return
    }

    if (timelineResult.error) {
      console.error(timelineResult.error)
    }

    setCases(casesResult.data || [])
    setTimelineMemory(groupTimelineByCase(timelineResult.data || []))
  }

  async function changeCaseStatus(
    caseItem: InstabilityCase,
    nextStatus: string,
    movementType: 'FORWARD' | 'ESCALATION' | 'OVERRIDE',
  ) {
    const inherited = buildInheritedGovernanceContext(
      caseItem,
      timelineMemory[caseItem.id] || [],
    )

    const { error } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseItem.id)

    if (error) {
      alert(error.message)
      return
    }

    await supabase.from('case_timeline').insert({
      case_id: caseItem.id,
      event_type: `STATUS_${nextStatus}`,
      event_summary: buildCaseTimelineSummary({
        caseItem,
        inherited,
        movementType,
        nextStatus,
      }),
    })

    setMessage(
      `${movementType} governance movement preserved. Continuity posture, inherited memory, command meaning, and lifecycle traceability remain visible.`,
    )

    await loadCases()
  }

  const caseClimate = useMemo(
    () => buildCaseClimate(cases, timelineMemory),
    [cases, timelineMemory],
  )

  const climatePanels = [
    { title: 'Case Stability Climate', value: caseClimate.stabilityClimate },
    {
      title: 'Lifecycle Governance Posture',
      value: caseClimate.lifecyclePosture,
    },
    {
      title: 'Evidence Continuity Visibility',
      value: caseClimate.evidenceVisibility,
    },
    {
      title: 'Routing Readiness Landscape',
      value: caseClimate.routingLandscape,
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
          TSINAXA CGI • CASE GOVERNANCE INTELLIGENCE
        </p>

        <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white">
            Accepted Instability Governance
          </h2>

          <p className="mt-3 max-w-5xl text-sm leading-6 text-neutral-300">
            Govern accepted instability after triage. Preserve inherited intake
            meaning, inherited eligibility posture, lifecycle phase, required next
            movement, evidence posture, stagnation risk, continuity drift,
            convergence visibility, survivability awareness, and executive command
            meaning without executing routing, intervention, outcome, or recovery
            work.
          </p>

          <p className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
            <span className="font-semibold">Boundary:</span> /cases governs
            accepted instability lifecycle visibility. It inherits eligibility
            meaning from /triage and protects continuity memory through timeline
            records. It does not route ownership, execute stabilization action,
            verify outcomes, declare recovery, or erase structural continuity
            memory.
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
            Case Pressure Intelligence
          </h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {caseClimate.pressureMeaning}
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-lg font-semibold text-white">
            Executive Case Synthesis
          </h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {caseClimate.commandSynthesis}
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-lg font-semibold text-white">
              Continuity Drift Intelligence
            </h3>
            <p className="mt-3 text-sm leading-6 text-neutral-300">
              {caseClimate.driftIntelligence}
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-lg font-semibold text-white">
              Cross-Case Convergence Intelligence
            </h3>
            <p className="mt-3 text-sm leading-6 text-neutral-300">
              {caseClimate.convergenceIntelligence}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-xl font-semibold text-white">
            Governed Instability Cases
          </h3>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Triage decides whether visible instability enters governance. Case
            governance inherits the intake and triage record, then preserves
            continuity status, lifecycle maturity, evidence posture, drift
            visibility, convergence patterns, and next movement until the case is
            routed, acted on, verified, recovered, escalated, or archived.
          </p>

          <div className="mt-6 grid gap-5">
            {cases.map((caseItem) => {
              const inherited = buildInheritedGovernanceContext(
                caseItem,
                timelineMemory[caseItem.id] || [],
              )
              const intelligence = buildCaseIntelligence(caseItem, inherited)
              const simplifiedIdentity = buildSimplifiedIdentity(caseItem, inherited)
              const actionEvidenceVisible = hasActionEvidence(caseItem)
              const outcomeEvidenceVisible = hasOutcomeEvidence(caseItem)

              return (
                <article
                  key={caseItem.id}
                  className="rounded-3xl border border-neutral-800 bg-neutral-950 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                        Accepted CGI Case
                      </p>

                      <h4 className="mt-2 text-xl font-semibold text-white">
                        {simplifiedIdentity}
                      </h4>

                      <p className="mt-2 text-xs leading-5 text-neutral-500">
                        Source identity: {caseItem.beneficiary_name}
                      </p>
                    </div>

                    <span className={severityBadgeClass(caseItem.severity_level)}>
                      {caseItem.severity_level}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Info label="Governance State" value={caseItem.case_status} />
                    <Info
                      label="Inherited Pressure"
                      value={inherited.inheritedPressureType}
                    />
                    <Info
                      label="Inherited Signal"
                      value={inherited.inheritedVisibleSignal}
                    />
                    <Info
                      label="Eligibility Confidence"
                      value={inherited.eligibilityConfidence}
                    />
                  </div>

                  <section className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                    <p className="text-sm font-semibold text-cyan-400">
                      Inherited Lifecycle Memory
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <Info label="Memory Source" value={inherited.memorySource} />
                      <Info
                        label="Inherited Intake Identity"
                        value={inherited.inheritedIntakeIdentity}
                      />
                      <Info
                        label="Inherited Ownership"
                        value={inherited.inheritedOwnershipPosture}
                      />
                      <Info
                        label="Inherited Evidence"
                        value={inherited.inheritedEvidencePosture}
                      />
                      <Info label="Triage Result" value={inherited.triageResult} />
                      <Info
                        label="Triage Gate Status"
                        value={inherited.triageGateStatus}
                      />
                      <Info
                        label="Triage Maturity"
                        value={inherited.triageMaturity}
                      />
                      <Info
                        label="Recommended Posture"
                        value={inherited.recommendedPosture}
                      />
                      <Info
                        label="Triage Next Movement"
                        value={inherited.nextLifecycleState}
                      />
                      <Info
                        label="Inherited Command Meaning"
                        value={inherited.inheritedCommandMeaning}
                      />
                    </div>
                  </section>

                  <section className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                    <p className="text-sm font-semibold text-cyan-400">
                      Continuity Memory Intelligence
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <Info
                        label="Lifecycle Narrative"
                        value={inherited.lifecycleNarrative}
                      />
                      <Info label="Drift Signal" value={inherited.driftSignal} />
                      <Info
                        label="Convergence Signal"
                        value={inherited.convergenceSignal}
                      />
                    </div>
                  </section>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <SignalBadge>{caseItem.support_domain}</SignalBadge>
                    <SignalBadge>{caseItem.severity_level}</SignalBadge>
                    <SignalBadge>{inherited.triageResult}</SignalBadge>

                    {(caseItem.instability_signals || []).map((signal, index) => (
                      <SignalBadge key={`${signal}-${index}`}>
                        {signal}
                      </SignalBadge>
                    ))}

                    {caseItem.safeguarding_flag && (
                      <SignalBadge>EXECUTIVE_VISIBILITY</SignalBadge>
                    )}
                  </div>

                  <section className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                    <p className="text-sm font-semibold text-cyan-400">
                      Case Intelligence Panel
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <Info label="Lifecycle Phase" value={intelligence.phase} />
                      <Info label="Case Maturity" value={intelligence.maturity} />
                      <Info
                        label="Governance Confidence"
                        value={intelligence.confidence}
                      />
                      <Info
                        label="Required Next Movement"
                        value={intelligence.nextMovement}
                      />
                      <Info
                        label="Evidence Posture"
                        value={intelligence.evidencePosture}
                      />
                      <Info
                        label="Stagnation Risk"
                        value={intelligence.stagnationRisk}
                      />
                      <Info
                        label="Command Meaning"
                        value={intelligence.commandMeaning}
                      />
                    </div>
                  </section>

                  <section className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
                    <p className="text-sm font-semibold text-cyan-400">
                      Linked Execution Visibility
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <Info
                        label="Action Evidence"
                        value={
                          actionEvidenceVisible
                            ? 'Present in /interventions'
                            : 'Action evidence pending'
                        }
                      />
                      <Info
                        label="Outcome Evidence"
                        value={
                          outcomeEvidenceVisible
                            ? 'Present in /outcomes'
                            : 'Outcome verification pending'
                        }
                      />
                      <Info
                        label="Recovery Observation"
                        value={
                          caseItem.case_status === 'RECOVERY_MONITORING'
                            ? 'Recovery durability watch active'
                            : 'Recovery durability not yet active'
                        }
                      />
                    </div>
                  </section>

                  <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                    <p className="text-sm font-semibold text-cyan-100">
                      Governance Interpretation
                    </p>
                    <p className="mt-2 text-sm leading-6 text-cyan-50">
                      {buildGovernanceInterpretation(caseItem, inherited)}
                    </p>
                  </div>

                  <GovernanceMovementControls
                    caseItem={caseItem}
                    onMove={changeCaseStatus}
                  />

                  {caseItem.intervention_summary && (
                    <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm leading-6 text-neutral-300">
                      <span className="font-semibold text-white">
                        Latest linked action evidence:{' '}
                      </span>
                      {truncateText(caseItem.intervention_summary)}
                    </div>
                  )}

                  {caseItem.outcome_summary && (
                    <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm leading-6 text-neutral-300">
                      <span className="font-semibold text-white">
                        Latest downstream evidence:{' '}
                      </span>
                      {truncateText(caseItem.outcome_summary)}
                    </div>
                  )}
                </article>
              )
            })}

            {cases.length === 0 && (
              <div className="rounded-3xl border border-dashed border-neutral-700 bg-neutral-950 p-8 text-center text-sm leading-6 text-neutral-400">
                No accepted instability is currently under active CGI governance.
                Case governance intelligence will activate when triage accepts
                visible instability into the continuity lifecycle.
              </div>
            )}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-xl font-semibold text-white">
            Case Governance Doctrine
          </h3>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Case governance is lifecycle custody, not task execution. CGI preserves
            accepted instability visibility, inherited intake meaning, inherited
            triage eligibility, movement readiness, evidence posture, stagnation
            risk, command meaning, continuity drift, convergence visibility, and
            structural memory before routing, action, outcome verification, or
            recovery durability occurs.
          </p>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature case governance must preserve proportional continuity
            interpretation. When accepted instability is moving through the lifecycle
            without stall, recurrence, evidence loss, or structural deterioration,
            the system should support measured confidence while preserving inherited
            traceability, executive synthesis readiness, lifecycle discipline, and
            institutional continuity memory.
          </p>
        </section>
      </section>
    </main>
  )
}

function GovernanceMovementControls({
  caseItem,
  onMove,
}: {
  caseItem: InstabilityCase
  onMove: (
    caseItem: InstabilityCase,
    nextStatus: string,
    movementType: 'FORWARD' | 'ESCALATION' | 'OVERRIDE',
  ) => void
}) {
  const forwardMovements = getForwardMovements(caseItem)

  return (
    <section className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <p className="text-sm font-semibold text-cyan-400">
        Governance Movement Controls
      </p>

      <p className="mt-2 text-sm leading-6 text-neutral-400">
        Use forward movement for normal lifecycle progression. Use escalation or
        reopening only when evidence supports it. Governance override preserves
        controlled correction without treating regression as ordinary flow.
      </p>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Forward Movement
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {forwardMovements.map((status) => (
            <MovementButton
              key={status}
              label={status}
              onClick={() => onMove(caseItem, status, 'FORWARD')}
            />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Escalation / Reopening
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ESCALATION_MOVEMENTS.map((status) => (
            <MovementButton
              key={status}
              label={status}
              onClick={() => onMove(caseItem, status, 'ESCALATION')}
            />
          ))}
        </div>
      </div>

      <details className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-amber-100">
          Governance Override
        </summary>

        <p className="mt-3 text-sm leading-6 text-amber-100/80">
          Use only when correcting lifecycle drift, reopening earlier governance
          posture, or preserving a controlled administrative correction.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {OVERRIDE_MOVEMENTS.map((status) => (
            <MovementButton
              key={status}
              label={status}
              onClick={() => onMove(caseItem, status, 'OVERRIDE')}
            />
          ))}
        </div>
      </details>
    </section>
  )
}

function getForwardMovements(caseItem: InstabilityCase) {
  if (caseItem.case_status === 'RECOVERY_MONITORING') {
    return ['STABILIZED', 'ARCHIVED']
  }

  if (
    caseItem.case_status === 'IMPROVING' ||
    caseItem.case_status === 'PARTIAL_STABILIZATION'
  ) {
    return ['RECOVERY_MONITORING', 'FOLLOW_UP_REQUIRED', 'STABILIZED']
  }

  if (
    caseItem.case_status === 'ACTION_ACTIVE' ||
    caseItem.case_status === 'INTERVENTION_ACTIVE' ||
    caseItem.case_status === 'INTERVENTION_RECORDED'
  ) {
    return ['PARTIAL_STABILIZATION', 'FOLLOW_UP_REQUIRED', 'IMPROVING']
  }

  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED')) {
    return ['ACTION_ACTIVE']
  }

  if (caseItem.case_status === 'ACCEPTED_FOR_GOVERNANCE') {
    return ['STABILIZATION_OWNER_ROUTED']
  }

  return FORWARD_MOVEMENTS
}

function MovementButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-xs font-semibold text-neutral-100 transition hover:border-cyan-400 hover:text-cyan-100"
    >
      {label}
    </button>
  )
}

function buildCaseClimate(
  cases: InstabilityCase[],
  timelineMemory: Record<string, TimelineEntry[]>,
): CaseClimate {
  if (cases.length === 0) {
    return {
      stabilityClimate:
        'Awaiting accepted instability before case climate interpretation activates.',
      lifecyclePosture:
        'Lifecycle governance posture will activate when triage accepts instability into CGI.',
      evidenceVisibility:
        'Evidence continuity visibility pending accepted case activity.',
      routingLandscape:
        'Routing readiness visibility pending accepted instability governance.',
      pressureMeaning:
        'Case pressure interpretation will activate when accepted instability enters the continuity lifecycle.',
      commandSynthesis:
        'No active case concentration currently requiring executive continuity synthesis.',
      driftIntelligence:
        'Continuity drift intelligence will activate after accepted cases begin lifecycle movement.',
      convergenceIntelligence:
        'Cross-case convergence intelligence will activate when multiple governed cases share pressure, signal, ownership, evidence, or recurrence patterns.',
    }
  }

  const highPressure = cases.filter(
    (item) =>
      item.severity_level === 'HIGH' || item.severity_level === 'CRITICAL',
  ).length

  const stalled = cases.filter((item) =>
    item.case_status.includes('STALLED'),
  ).length

  const escalated = cases.filter((item) =>
    item.case_status.includes('ESCALATED'),
  ).length

  const recoveryMonitoring = cases.filter(
    (item) => item.case_status === 'RECOVERY_MONITORING',
  ).length

  const incompleteEvidence = cases.filter(
    (item) => !hasActionEvidence(item) || !hasOutcomeEvidence(item),
  ).length

  const driftCases = cases.filter((item) =>
    buildDriftSignal(item, timelineMemory[item.id] || []).includes('visible'),
  ).length

  const convergence = buildCrossCaseConvergence(cases)

  const allVisibleCasesHaveEvidence = incompleteEvidence === 0
  const allVisibleCasesInRecovery =
    cases.length > 0 && recoveryMonitoring === cases.length

  return {
    stabilityClimate:
      allVisibleCasesInRecovery
        ? 'Visible governed cases are currently under recovery durability observation.'
        : stalled === 0 && escalated === 0
          ? 'Accepted instability conditions remain proportionally manageable under current case governance visibility.'
          : 'Some accepted instability pathways show stalled movement or escalation concentration.',
    lifecyclePosture:
      allVisibleCasesInRecovery
        ? 'Lifecycle posture has moved beyond active stabilization and is now observing durability before trust restoration.'
        : highPressure === 0
          ? 'Lifecycle governance posture remains balanced without concentrated high-pressure exposure.'
          : 'High-pressure case concentration remains visible and may require executive continuity awareness.',
    evidenceVisibility:
      allVisibleCasesHaveEvidence
        ? 'Action and outcome evidence are visible across active governed cases.'
        : 'Some governed cases still require action evidence, outcome evidence, or recovery readiness clarification.',
    routingLandscape:
      recoveryMonitoring > 0
        ? 'Some governed cases have progressed into recovery durability observation.'
        : 'Routing readiness remains active for accepted instability that has not yet stabilized.',
    pressureMeaning:
      allVisibleCasesInRecovery && allVisibleCasesHaveEvidence
        ? 'Case governance pressure is calm and proportionate. Visible cases are under recovery durability observation with action and outcome evidence preserved.'
        : stalled === 0 && escalated === 0 && highPressure === 0
          ? 'Case governance pressure remains proportionally active under current continuity conditions.'
          : 'Case governance pressure remains visible through escalation, stalled movement, high-pressure exposure, or evidence incompleteness.',
    commandSynthesis:
      allVisibleCasesInRecovery && allVisibleCasesHaveEvidence
        ? 'No active case deterioration is visible. Command attention may remain focused on durability observation and memory preservation.'
        : stalled > 0 || escalated > 0 || highPressure > 1 || driftCases > 1
          ? 'Case concentration may require executive continuity synthesis visibility.'
          : 'No concentrated case deterioration currently requiring command escalation.',
    driftIntelligence:
      driftCases === 0
        ? 'No concentrated continuity drift pattern is currently visible across active governed cases.'
        : `${driftCases} governed case pathway(s) show continuity drift visibility through stalled movement, recurrence, reopening, escalation, missing evidence, or repeated follow-up pressure.`,
    convergenceIntelligence: convergence,
  }
}

function groupTimelineByCase(entries: TimelineEntry[]) {
  return entries.reduce<Record<string, TimelineEntry[]>>((grouped, entry) => {
    if (!entry.case_id) return grouped

    if (!grouped[entry.case_id]) grouped[entry.case_id] = []
    grouped[entry.case_id].push(entry)

    return grouped
  }, {})
}

function buildInheritedGovernanceContext(
  caseItem: InstabilityCase,
  timelineEntries: TimelineEntry[],
): InheritedGovernanceContext {
  const timelineSource = buildLifecycleMemorySource(timelineEntries)

  const currentSummary =
    caseItem.intervention_summary ||
    caseItem.outcome_summary ||
    ''

  const joinedSource = [currentSummary, timelineSource]
    .filter(Boolean)
    .join('\n\n')

  const memorySource = caseItem.intervention_summary
    ? 'active lifecycle memory + timeline history'
    : caseItem.outcome_summary
      ? 'downstream lifecycle memory + timeline history'
      : timelineSource
        ? 'timeline history only'
        : 'fallback case fields only'

  return {
    inheritedIntakeIdentity:
      extractBlockField(joinedSource, 'INHERITED INTAKE IDENTITY') ||
      extractBlockField(joinedSource, 'INTAKE IDENTITY') ||
      extractInlineField(joinedSource, 'Generated intake identity') ||
      caseItem.beneficiary_name,

    inheritedEntryRoute:
      extractBlockField(joinedSource, 'INHERITED ENTRY ROUTE') ||
      extractBlockField(joinedSource, 'ENTRY ROUTE') ||
      extractInlineField(joinedSource, 'Entry route') ||
      'Inherited entry route not available',

    inheritedPressureType:
      extractBlockField(joinedSource, 'INHERITED PRESSURE TYPE') ||
      extractBlockField(joinedSource, 'OPERATIONAL PRESSURE TYPE') ||
      extractInlineField(joinedSource, 'Operational pressure type') ||
      caseItem.support_domain,

    inheritedVisibleSignal:
      extractBlockField(joinedSource, 'INHERITED VISIBLE SIGNAL') ||
      extractBlockField(joinedSource, 'VISIBLE SIGNAL') ||
      extractInlineField(joinedSource, 'Visible signal') ||
      caseItem.region ||
      'Inherited visible signal not available',

    inheritedOwnershipPosture:
      extractBlockField(joinedSource, 'INHERITED OWNERSHIP POSTURE') ||
      extractBlockField(joinedSource, 'OWNERSHIP POSTURE') ||
      extractBlockField(joinedSource, 'OWNERSHIP STATE') ||
      extractInlineField(joinedSource, 'Ownership posture') ||
      extractInlineField(joinedSource, 'Ownership state') ||
      'Inherited ownership posture not available',

    inheritedEvidencePosture:
      extractBlockField(joinedSource, 'INHERITED EVIDENCE POSTURE') ||
      extractBlockField(joinedSource, 'EVIDENCE POSTURE') ||
      extractBlockField(joinedSource, 'EVIDENCE LEVEL') ||
      extractInlineField(joinedSource, 'Evidence posture') ||
      extractInlineField(joinedSource, 'Evidence level') ||
      'Inherited evidence posture not available',

    inheritedGovernanceReadiness:
      extractBlockField(joinedSource, 'INHERITED GOVERNANCE READINESS') ||
      extractBlockField(joinedSource, 'GOVERNANCE READINESS') ||
      extractInlineField(joinedSource, 'Governance readiness') ||
      'Inherited governance readiness not available',

    inheritedCommandMeaning:
      extractBlockField(joinedSource, 'INHERITED COMMAND MEANING') ||
      extractBlockField(joinedSource, 'COMMAND MEANING') ||
      extractInlineField(joinedSource, 'Command meaning') ||
      'Inherited command meaning not available',

    triageResult:
      extractBlockField(joinedSource, 'TRIAGE RESULT') ||
      caseItem.case_status,

    triageReason:
      extractBlockField(joinedSource, 'TRIAGE REASON') ||
      'Triage reason not available',

    triageGateStatus:
      extractBlockField(joinedSource, 'TRIAGE GATE STATUS') ||
      'Triage gate status not available',

    triageMaturity:
      extractBlockField(joinedSource, 'TRIAGE MATURITY') ||
      'Triage maturity not available',

    eligibilityConfidence:
      extractBlockField(joinedSource, 'ELIGIBILITY CONFIDENCE') ||
      'Eligibility confidence not available',

    recommendedPosture:
      extractBlockField(joinedSource, 'RECOMMENDED POSTURE') ||
      'Recommended posture not available',

    caseReadiness:
      extractBlockField(joinedSource, 'CASE READINESS') ||
      '/cases',

    nextLifecycleState:
      extractBlockField(joinedSource, 'NEXT LIFECYCLE STATE') ||
      'Case lifecycle movement pending.',

    memorySource,

    lifecycleNarrative: buildLifecycleNarrative(caseItem, timelineEntries),

    driftSignal: buildDriftSignal(caseItem, timelineEntries),

    convergenceSignal: buildCaseConvergenceSignal(caseItem),
  }
}

function buildLifecycleMemorySource(timelineEntries: TimelineEntry[]) {
  return timelineEntries
    .map((entry) => entry.event_summary || '')
    .filter(Boolean)
    .join('\n\n')
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

function extractInlineField(source: string, label: string) {
  if (!source) return ''

  const prefix = `${label}:`

  const line = source
    .split('\n')
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix))

  if (!line) return ''

  return line.replace(prefix, '').trim()
}

function buildCaseTimelineSummary(input: {
  caseItem: InstabilityCase
  inherited: InheritedGovernanceContext
  movementType: 'FORWARD' | 'ESCALATION' | 'OVERRIDE'
  nextStatus: string
}) {
  return `
INHERITED INTAKE IDENTITY
${input.inherited.inheritedIntakeIdentity}

INHERITED ENTRY ROUTE
${input.inherited.inheritedEntryRoute}

INHERITED PRESSURE TYPE
${input.inherited.inheritedPressureType}

INHERITED VISIBLE SIGNAL
${input.inherited.inheritedVisibleSignal}

INHERITED OWNERSHIP POSTURE
${input.inherited.inheritedOwnershipPosture}

INHERITED EVIDENCE POSTURE
${input.inherited.inheritedEvidencePosture}

INHERITED GOVERNANCE READINESS
${input.inherited.inheritedGovernanceReadiness}

INHERITED COMMAND MEANING
${input.inherited.inheritedCommandMeaning}

TRIAGE RESULT
${input.inherited.triageResult}

TRIAGE REASON
${input.inherited.triageReason}

TRIAGE GATE STATUS
${input.inherited.triageGateStatus}

TRIAGE MATURITY
${input.inherited.triageMaturity}

ELIGIBILITY CONFIDENCE
${input.inherited.eligibilityConfidence}

RECOMMENDED POSTURE
${input.inherited.recommendedPosture}

CASE READINESS
${input.inherited.caseReadiness}

CASE GOVERNANCE MOVEMENT
${input.movementType}

NEXT LIFECYCLE STATE
${input.nextStatus}

CASE SIGNAL
${input.caseItem.beneficiary_name}

CONTINUITY DRIFT SIGNAL
${input.inherited.driftSignal}

CONVERGENCE SIGNAL
${input.inherited.convergenceSignal}

LIFECYCLE BOUNDARY
Case governance preserves lifecycle custody.
Routing is not action.
Action is not outcome.
Outcome is not recovery.
  `.trim()
}

function buildLifecycleNarrative(
  caseItem: InstabilityCase,
  timelineEntries: TimelineEntry[],
) {
  const eventCount = timelineEntries.length
  const hasRouting = hasRoutingEvidence(caseItem)
  const hasAction = hasActionEvidence(caseItem)
  const hasOutcome = hasOutcomeEvidence(caseItem)
  const hasRecovery = caseItem.case_status === 'RECOVERY_MONITORING'

  const phases = [
    'intake and triage context preserved',
    hasRouting ? 'routing visibility present' : 'routing visibility pending',
    hasAction ? 'action evidence visible' : 'action evidence pending',
    hasOutcome ? 'outcome verification visible' : 'outcome verification pending',
    hasRecovery ? 'recovery durability observation active' : 'recovery not active',
  ]

  return `${phases.join(' • ')}. Timeline memory entries visible: ${eventCount}.`
}

function buildDriftSignal(
  caseItem: InstabilityCase,
  timelineEntries: TimelineEntry[],
) {
  const timelineText = timelineEntries
    .map((entry) => `${entry.event_type || ''} ${entry.event_summary || ''}`)
    .join(' ')
    .toUpperCase()

  const driftMarkers = [
    caseItem.case_status.includes('STALLED'),
    caseItem.case_status.includes('ESCALATED'),
    caseItem.case_status === 'REOPENED',
    caseItem.case_status === 'FOLLOW_UP_REQUIRED',
    !hasActionEvidence(caseItem) &&
      caseItem.case_status !== 'ACCEPTED_FOR_GOVERNANCE',
    !hasOutcomeEvidence(caseItem) &&
      !['ACCEPTED_FOR_GOVERNANCE', 'STABILIZATION_OWNER_ROUTED'].includes(
        caseItem.case_status,
      ),
    timelineText.includes('STALLED'),
    timelineText.includes('RECURRENCE'),
    timelineText.includes('REOPENED'),
    timelineText.includes('FOLLOW_UP_REQUIRED'),
  ].filter(Boolean).length

  if (driftMarkers >= 3) {
    return 'continuity drift visible; repeated delay, recurrence, missing evidence, stalled movement, or follow-up pressure may be weakening lifecycle confidence.'
  }

  if (driftMarkers > 0) {
    return 'limited continuity drift visibility; preserve observation until movement, evidence, or ownership stabilizes.'
  }

  return 'no material continuity drift currently visible in this case pathway.'
}

function buildCaseConvergenceSignal(caseItem: InstabilityCase) {
  const signals = caseItem.instability_signals || []

  if (
    caseItem.support_domain === 'COORDINATION' ||
    signals.includes('CROSS_SITE_OPERATIONS') ||
    caseItem.beneficiary_level === 'CROSS_SITE'
  ) {
    return 'cross-site convergence watch; this case may connect to wider coordination, ownership, or routing patterns.'
  }

  if (
    caseItem.support_domain === 'OWNERSHIP' ||
    signals.includes('OWNERSHIP_UNCLEAR')
  ) {
    return 'ownership convergence watch; this case may connect to repeated responsibility or handoff ambiguity.'
  }

  if (
    caseItem.support_domain === 'EVIDENCE' ||
    signals.includes('EVIDENCE_MISSING')
  ) {
    return 'evidence convergence watch; this case may connect to repeated verification or completion-visibility gaps.'
  }

  return 'no obvious cross-case convergence signal visible from this case alone.'
}

function buildCrossCaseConvergence(cases: InstabilityCase[]) {
  const pressureCounts = countValues(cases.map((item) => item.support_domain))
  const signalCounts = countValues(
    cases.flatMap((item) => item.instability_signals || []),
  )
  const locationCounts = countValues(
    cases.map((item) => item.beneficiary_level || item.region || ''),
  )

  const pressure = findConcentratedValue(pressureCounts)
  const signal = findConcentratedValue(signalCounts)
  const location = findConcentratedValue(locationCounts)

  const patterns = [
    pressure ? `pressure concentration: ${pressure}` : '',
    signal ? `signal concentration: ${signal}` : '',
    location ? `location/site concentration: ${location}` : '',
  ].filter(Boolean)

  if (patterns.length === 0) {
    return 'No concentrated cross-case convergence pattern is currently visible across active governed cases.'
  }

  return `Cross-case convergence is visible through ${patterns.join(
    ' • ',
  )}. Executive review may benefit from comparing these cases as a structural pattern rather than isolated events.`
}

function countValues(values: string[]) {
  return values.reduce<Record<string, number>>((counts, rawValue) => {
    const value = rawValue.trim()
    if (!value) return counts

    counts[value] = (counts[value] || 0) + 1
    return counts
  }, {})
}

function findConcentratedValue(counts: Record<string, number>) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
  const top = entries[0]

  if (!top || top[1] < 2) return ''

  return `${top[0]} (${top[1]} active cases)`
}

function hasActionEvidence(caseItem: InstabilityCase) {
  const summary = caseItem.intervention_summary || ''

  return Boolean(
    summary.includes('ACTION MOVEMENT') ||
      summary.includes('ACTION TRAJECTORY') ||
      summary.includes('EVIDENCE POSTURE') ||
      summary.includes('OWNER VISIBILITY') ||
      summary.includes('RESIDUAL RISK'),
  )
}

function hasOutcomeEvidence(caseItem: InstabilityCase) {
  const summary = caseItem.outcome_summary || ''

  return Boolean(
    summary.includes('VERIFICATION RESULT') ||
      summary.includes('ACTION IMPACT') ||
      summary.includes('VERIFICATION CREDIBILITY') ||
      summary.includes('RECURRENCE SIGNAL') ||
      summary.includes('RECOVERY READINESS') ||
      summary.includes('CONTINUITY OUTLOOK'),
  )
}

function buildSimplifiedIdentity(
  caseItem: InstabilityCase,
  inherited: InheritedGovernanceContext,
) {
  const location =
    caseItem.beneficiary_level ||
    caseItem.region ||
    'Unspecified continuity zone'

  const inheritedIdentity = inherited.inheritedIntakeIdentity

  if (inheritedIdentity && inheritedIdentity !== caseItem.beneficiary_name) {
    return inheritedIdentity
  }

  return `${caseItem.support_domain} instability • ${location}`
}

function buildCaseIntelligence(
  caseItem: InstabilityCase,
  inherited: InheritedGovernanceContext,
): CaseIntelligence {
  const actionEvidenceVisible = hasActionEvidence(caseItem)
  const outcomeEvidenceVisible = hasOutcomeEvidence(caseItem)

  const evidencePosture = [
    `Triage: ${inherited.eligibilityConfidence}`,
    `Routing: ${hasRoutingEvidence(caseItem) ? 'visible' : 'pending'}`,
    `Action: ${actionEvidenceVisible ? 'visible' : 'pending'}`,
    `Outcome: ${outcomeEvidenceVisible ? 'visible' : 'pending'}`,
    `Recovery: ${
      caseItem.case_status === 'RECOVERY_MONITORING' ? 'active' : 'not active'
    }`,
  ].join(' • ')

  if (caseItem.case_status === 'ACCEPTED_FOR_GOVERNANCE') {
    return {
      phase: 'Accepted into governance',
      maturity: 'CASE_GOVERNANCE_OPENED',
      confidence: inherited.eligibilityConfidence || 'PENDING_ROUTING_CONFIDENCE',
      nextMovement: 'Route to stabilization ownership in /routing',
      evidencePosture,
      stagnationRisk: 'Moderate if routing direction does not begin.',
      commandMeaning:
        inherited.inheritedCommandMeaning ||
        'Visible instability has crossed into governance and awaits stabilization direction.',
    }
  }

  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED')) {
    return {
      phase: 'Routed for stabilization',
      maturity: 'DIRECTION_ESTABLISHED',
      confidence: actionEvidenceVisible
        ? 'ACTION_EVIDENCE_BUILDING'
        : 'PENDING_ACTION_EVIDENCE',
      nextMovement: actionEvidenceVisible
        ? 'Review action evidence in /interventions'
        : 'Preserve governed stabilization action in /interventions',
      evidencePosture,
      stagnationRisk: actionEvidenceVisible
        ? 'Low if outcome verification follows.'
        : 'High if action evidence remains missing.',
      commandMeaning:
        'Ownership direction exists, but stabilization credibility depends on action evidence.',
    }
  }

  if (caseItem.case_status.includes('EVIDENCE_REQUIRED')) {
    return {
      phase: 'Evidence gate',
      maturity: 'EVIDENCE_ALIGNMENT_PENDING',
      confidence: 'LIMITED_GOVERNANCE_CONFIDENCE',
      nextMovement: 'Preserve missing evidence before further lifecycle movement.',
      evidencePosture,
      stagnationRisk: 'High if evidence remains missing.',
      commandMeaning:
        'The case cannot be treated as stabilizing until evidence quality improves.',
    }
  }

  if (caseItem.case_status.includes('OWNERSHIP_CLARITY')) {
    return {
      phase: 'Ownership clarity gate',
      maturity: 'OWNERSHIP_ALIGNMENT_UNSTABLE',
      confidence: 'VARIABLE_GOVERNANCE_CONFIDENCE',
      nextMovement: 'Clarify responsible stabilization owner.',
      evidencePosture,
      stagnationRisk: 'High if ownership remains unclear.',
      commandMeaning:
        'Unclear ownership may weaken continuity and require executive visibility.',
    }
  }

  if (caseItem.case_status.includes('STALLED')) {
    return {
      phase: 'Stalled movement',
      maturity: 'CASE_MOVEMENT_DESTABILIZING',
      confidence: 'FRAGILE_GOVERNANCE_CONFIDENCE',
      nextMovement: 'Restore movement or escalate continuity visibility.',
      evidencePosture,
      stagnationRisk: 'Critical until lifecycle movement resumes.',
      commandMeaning:
        'Stalled governance threatens stabilization credibility and should remain visible.',
    }
  }

  if (
    caseItem.case_status === 'ACTION_ACTIVE' ||
    caseItem.case_status === 'INTERVENTION_ACTIVE' ||
    caseItem.case_status === 'INTERVENTION_RECORDED'
  ) {
    return {
      phase: 'Stabilization action active',
      maturity: 'ACTION_EVIDENCE_VISIBLE',
      confidence: outcomeEvidenceVisible
        ? 'OUTCOME_VERIFICATION_BUILDING'
        : 'PENDING_OUTCOME_VERIFICATION',
      nextMovement: outcomeEvidenceVisible
        ? 'Review outcome verification in /outcomes'
        : 'Preserve verification evidence in /outcomes',
      evidencePosture,
      stagnationRisk: outcomeEvidenceVisible
        ? 'Moderate until recovery durability is confirmed.'
        : 'High if outcome verification remains missing.',
      commandMeaning:
        'Action exists, but continuity credibility still requires outcome verification.',
    }
  }

  if (
    caseItem.case_status === 'PARTIAL_STABILIZATION' ||
    caseItem.case_status === 'FOLLOW_UP_REQUIRED' ||
    caseItem.case_status === 'IMPROVING'
  ) {
    return {
      phase: 'Stabilization movement visible',
      maturity: 'STABILITY_BUILDING',
      confidence: outcomeEvidenceVisible
        ? 'VERIFICATION_EVIDENCE_VISIBLE'
        : 'BUILDING',
      nextMovement: outcomeEvidenceVisible
        ? 'Evaluate recovery readiness through /outcomes'
        : 'Preserve outcome verification before recovery observation.',
      evidencePosture,
      stagnationRisk: 'Moderate until improvement holds through verification.',
      commandMeaning:
        'Positive movement is visible, but durable recovery should not be assumed.',
    }
  }

  if (caseItem.case_status === 'RECOVERY_MONITORING') {
    return {
      phase: 'Recovery credibility watch',
      maturity: 'RECOVERY_DURABILITY_OBSERVATION',
      confidence: 'DURABILITY_CONFIDENCE_BUILDING',
      nextMovement: 'Confirm durability in /recovery before trust restoration.',
      evidencePosture,
      stagnationRisk: 'Low if durability continues to hold.',
      commandMeaning:
        'CGI is observing whether stabilization holds long enough to become credible recovery.',
    }
  }

  if (caseItem.case_status.includes('ESCALATED')) {
    return {
      phase: 'Executive escalation',
      maturity: 'EXECUTIVE_CONTINUITY_REVIEW',
      confidence: 'HIGH_ATTENTION_REQUIRED',
      nextMovement: 'Resolve blocker or preserve command-level decision.',
      evidencePosture,
      stagnationRisk: 'High until escalation is resolved.',
      commandMeaning:
        'This case has exceeded ordinary governance movement and requires executive continuity attention.',
    }
  }

  if (caseItem.case_status === 'REOPENED') {
    return {
      phase: 'Reopened instability',
      maturity: 'RECURRENCE_VISIBILITY',
      confidence: 'WEAKENING_GOVERNANCE_CONFIDENCE',
      nextMovement: 'Review recurrence and restore stabilization pathway.',
      evidencePosture,
      stagnationRisk: 'High because instability returned.',
      commandMeaning:
        'Reopened instability may indicate weak recovery, unresolved pressure, or structural recurrence.',
    }
  }

  return {
    phase: 'Active governance',
    maturity: 'CASE_GOVERNANCE_ACTIVE',
    confidence: 'MEASURED_GOVERNANCE_CONFIDENCE',
    nextMovement: 'Continue governed lifecycle movement.',
    evidencePosture,
    stagnationRisk: 'Watch for delayed movement.',
    commandMeaning:
      'Case remains visible until stabilization credibility is achieved.',
  }
}

function hasRoutingEvidence(caseItem: InstabilityCase) {
  return (
    caseItem.case_status.includes('ROUTED') ||
    caseItem.case_status.includes('ROUTING') ||
    caseItem.case_status === 'ACTION_ACTIVE' ||
    caseItem.case_status === 'INTERVENTION_ACTIVE' ||
    caseItem.case_status === 'INTERVENTION_RECORDED' ||
    caseItem.case_status === 'PARTIAL_STABILIZATION' ||
    caseItem.case_status === 'IMPROVING' ||
    caseItem.case_status === 'RECOVERY_MONITORING'
  )
}

function buildGovernanceInterpretation(
  caseItem: InstabilityCase,
  inherited: InheritedGovernanceContext,
) {
  if (caseItem.case_status.includes('STALLED')) {
    return 'Governed lifecycle movement is stalled. CGI should preserve visibility until stabilization direction, ownership, or evidence movement resumes.'
  }

  if (caseItem.case_status.includes('ESCALATED')) {
    return 'This instability has exceeded ordinary governance visibility and requires elevated executive continuity attention.'
  }

  if (caseItem.case_status === 'RECOVERY_MONITORING') {
    return 'Initial stabilization may be holding, but CGI must preserve durability observation before recovery confidence matures.'
  }

  if (
    caseItem.case_status === 'IMPROVING' ||
    caseItem.case_status === 'PARTIAL_STABILIZATION'
  ) {
    return 'Governed movement is improving, but stabilization should not be treated as durable until verification and recovery observation confirm credibility.'
  }

  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED')) {
    return 'This case has direction visibility. CGI should preserve ownership traceability until governed action evidence appears.'
  }

  if (caseItem.case_status === 'ACCEPTED_FOR_GOVERNANCE') {
    return `This inherited triage signal is accepted into case governance. ${inherited.nextLifecycleState}`
  }

  return 'This instability remains under active continuity governance and requires proportional operational oversight.'
}

function truncateText(value: string) {
  if (value.length <= 180) return value
  return `${value.slice(0, 180)}...`
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