'use client'

import { useEffect, useMemo, useState } from 'react'
import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  evaluateInterventionLifecycle,
  type ContinuityRisk,
} from '../../lib/lifecycleGovernance'
import { supabase } from '../../lib/supabase'

type StabilityCase = {
  id: string
  beneficiary_name: string
  beneficiary_level: string | null
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  assigned_responder_id?: string | null
  updated_at?: string | null
  created_at?: string | null
  intake_identity?: string | null
  triage_posture?: string | null
  evidence_posture?: string | null
  latest_downstream_evidence?: string | null
  drift_signal?: string | null
  convergence_signal?: string | null
  command_meaning?: string | null
  survivability_interpretation?: string | null
  continuity_memory?: string | null
  intervention_summary?: string | null
  outcome_summary?: string | null
}

type InterventionRecord = {
  id: string
  case_id: string
  intervention_type: string | null
  intervention_summary: string | null
  created_at?: string | null
}

type InheritedInterventionContext = {
  intakeIdentity: string
  routingPosture: string
  interventionReadiness: string
  inheritedEvidencePosture: string
  inheritedDriftSignal: string
  inheritedConvergenceSignal: string
  inheritedCommandMeaning: string
  inheritedSurvivability: string
  memorySource: string
}

const GOVERNANCE_INSTITUTION = 'TSINAXA CGI'

const ACTION_READY_STATUSES = [
  'STABILIZATION_OWNER_ROUTED',
  'STABILIZATION_OWNER_ROUTED_RECURRENCE',
  'ROUTING_DIRECTION_ACTIVE',
  'ROUTING_DIRECTION_REPEATED_ACTION_READY',
  'ROUTING_CONFIRMED',
  'INTERVENTION_READY',
  'INTERVENTION_ACTIVE',
  'INTERVENTION_RECORDED',
  'STABILIZING',
  'ESCALATED',
]

const ACTION_TYPES = [
  'Continuity stabilization action',
  'Operational coordination action',
  'Owner-directed stabilization action',
  'Institution-directed stabilization action',
  'Escalation pathway action',
  'Continuity follow-up action',
  'Barrier removal action',
  'Executive visibility action',
]

const ACTION_CHANNELS = [
  'Continuity owner confirmation',
  'Operational dependency coordination',
  'Executive escalation routing',
  'Institutional action confirmation',
  'Recovery pathway preparation',
  'Cross-function stabilization coordination',
  'Action barrier review',
  'Command visibility preservation',
  'Governance escalation coordination',
  'Stabilization pathway synchronization',
]

const ACTION_STATUSES = [
  'COMPLETED',
  'PARTIALLY_COMPLETED',
  'INTERRUPTED',
  'FOLLOW_UP_REQUIRED',
  'ESCALATION_REQUIRED',
]

const ACTION_TRAJECTORIES = [
  'STABILIZATION_BUILDING',
  'HOLDING_WITH_VARIANCE',
  'PARTIAL_MOVEMENT',
  'ACTION_STALLED',
  'DESTABILIZING',
]

const EVIDENCE_POSTURES = [
  'Action recorded with sufficient movement evidence',
  'Action partially evidenced; follow-up required',
  'Action attempted but blocked by operational barrier',
  'Action requires escalation before stabilization can continue',
  'Action completed but continuity risk remains active',
]

const OWNER_VISIBILITIES = [
  'Owner confirmed and action moving',
  'Owner confirmed but follow-up required',
  'Owner unclear; governance review required',
  'Owner blocked by dependency',
  'Executive owner visibility required',
]

const CONTINUITY_OUTLOOKS = [
  'STABILITY_BUILDING',
  'MONITOR',
  'VARIABLE_STABILITY',
  'AT_RISK',
  'UNSTABLE',
  'ESCALATE',
]

const REVIEW_TIMINGS = [
  '24 hours',
  '48 hours',
  '72 hours',
  '5 business days',
  '7 days',
  'Governance review required immediately',
]

const CONTINUITY_RISKS: ContinuityRisk[] = [
  'LOW',
  'MODERATE',
  'HIGH',
  'CRITICAL',
]

export default function InterventionCompletionPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
        'INSTITUTION_COORDINATOR',
        'RESPONDER',
      ]}
    >
      <CGIGovernanceShell>
        <InterventionCompletionContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function InterventionCompletionContent() {
  const [cases, setCases] = useState<StabilityCase[]>([])
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [actionType, setActionType] = useState('')
  const [actionChannel, setActionChannel] = useState('')
  const [actionStatus, setActionStatus] = useState('')
  const [actionTrajectory, setActionTrajectory] = useState('')
  const [evidencePosture, setEvidencePosture] = useState('')
  const [ownerVisibility, setOwnerVisibility] = useState('')
  const [continuityOutlook, setContinuityOutlook] = useState('')
  const [reviewTiming, setReviewTiming] = useState('')
  const [continuityRisk, setContinuityRisk] = useState<ContinuityRisk | ''>('')
  const [governanceInterpretation, setGovernanceInterpretation] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCases()
    loadInterventions()
  }, [])

  async function loadCases() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .in('case_status', ACTION_READY_STATUSES)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setCases(data || [])
  }

  async function loadInterventions() {
    const { data, error } = await supabase
      .from('case_interventions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setInterventions(data || [])
  }

  const selectedCase = useMemo(
    () => cases.find((item) => item.id === selectedCaseId),
    [cases, selectedCaseId],
  )

  const inheritedContext = useMemo(
    () =>
      selectedCase
        ? buildInheritedInterventionContext(selectedCase)
        : buildEmptyInheritedInterventionContext(),
    [selectedCase],
  )

  const hasActionEvidence = Boolean(selectedCaseId && actionStatus)

  const lifecycleDecision = evaluateInterventionLifecycle({
    completionStatus: actionStatus,
    continuityRisk: (continuityRisk || 'MODERATE') as ContinuityRisk,
  })

  const actionClimate = buildActionClimate({
    interventions,
    hasSelectedCase: Boolean(selectedCaseId),
    inheritedContext,
  })

  const commandPosture = buildCommandPosture({
    hasActionEvidence,
    actionStatus,
    continuityRisk,
    actionTrajectory,
    continuityOutlook,
    inheritedContext,
  })

  const actionConfidence = buildActionConfidence({
    hasActionEvidence,
    actionStatus,
    continuityRisk,
    actionTrajectory,
    continuityOutlook,
    inheritedContext,
  })

  const survivabilitySignal = buildSurvivabilitySignal({
    hasActionEvidence,
    continuityRisk,
    actionTrajectory,
    continuityOutlook,
    actionStatus,
    inheritedContext,
  })

  const executiveMeaning = buildExecutiveMeaning({
    hasActionEvidence,
    actionStatus,
    continuityRisk,
    actionTrajectory,
    continuityOutlook,
    inheritedContext,
  })

  const pressureMeaning = buildPressureMeaning({
    hasActionEvidence,
    actionTrajectory,
    continuityOutlook,
    continuityRisk,
    inheritedContext,
  })

  function buildCaseLabel(caseItem: StabilityCase) {
    const inherited = buildInheritedInterventionContext(caseItem)

    return `${inherited.intakeIdentity} • ${caseItem.support_domain} • ${caseItem.case_status}`
  }

  function actionSynthesis() {
    return `
INHERITED INTAKE IDENTITY
${inheritedContext.intakeIdentity}

INHERITED ROUTING POSTURE
${inheritedContext.routingPosture}

INTERVENTION READINESS
${inheritedContext.interventionReadiness}

INHERITED EVIDENCE POSTURE
${inheritedContext.inheritedEvidencePosture}

INHERITED DRIFT SIGNAL
${inheritedContext.inheritedDriftSignal}

INHERITED CONVERGENCE SIGNAL
${inheritedContext.inheritedConvergenceSignal}

INHERITED COMMAND MEANING
${inheritedContext.inheritedCommandMeaning}

INHERITED SURVIVABILITY INTERPRETATION
${inheritedContext.inheritedSurvivability}

ACTION MOVEMENT
${actionStatus || 'Awaiting action movement selection'}

ACTION TRAJECTORY
${actionTrajectory || 'Action trajectory pending'}

ACTION EVIDENCE POSTURE
${evidencePosture || 'Awaiting evidence posture selection'}

OWNER VISIBILITY
${ownerVisibility || 'Awaiting owner visibility selection'}

CONTINUITY OUTLOOK
${continuityOutlook || 'Continuity outlook pending'}

CONTINUITY RISK
${continuityRisk || 'Continuity risk pending'}

REVIEW TIMING
${reviewTiming || 'Awaiting review timing selection'}

COMMAND POSTURE
${commandPosture}

ACTION CONFIDENCE
${actionConfidence}

SURVIVABILITY SIGNAL
${survivabilitySignal}

EXECUTIVE MEANING
${executiveMeaning}

ACTION PRESSURE
${pressureMeaning}

NEXT LIFECYCLE STATE
${
  selectedCase
    ? lifecycleDecision.nextStatus
    : 'Continuity lifecycle advancement pending stabilization action governance.'
}

CASE SIGNAL
${
  selectedCase?.beneficiary_name ||
  'Executive continuity interpretation will activate after stabilization action evidence is preserved.'
}

STABILITY DOMAIN
${
  selectedCase?.support_domain ||
  'Continuity domain visibility pending action assignment.'
}

CURRENT CONTINUITY STATUS
${
  selectedCase?.case_status ||
  'Continuity posture pending action governance.'
}

ACTION TYPE
${actionType || 'Awaiting action type selection'}

ACTION CHANNEL
${actionChannel || 'Awaiting action channel selection'}

GOVERNANCE INTERPRETATION
${
  governanceInterpretation.trim() ||
  'No additional operational continuity interpretation entered.'
}

LIFECYCLE BOUNDARY
Routing is not action.
Action is not outcome.
Outcome is not recovery.
    `.trim()
  }

  async function preserveStabilizationActionEvidence() {
    if (!selectedCaseId) {
      alert('Select a stability case.')
      return
    }

    if (
      !actionType ||
      !actionChannel ||
      !actionStatus ||
      !actionTrajectory ||
      !evidencePosture ||
      !ownerVisibility ||
      !continuityOutlook ||
      !reviewTiming ||
      !continuityRisk
    ) {
      alert('Complete all stabilization action governance fields.')
      return
    }

    if (!selectedCase) {
      alert('Selected stability case could not be found.')
      return
    }

    setLoading(true)
    setMessage('')

    const evidence = actionSynthesis()

    const { error: interventionError } = await supabase
      .from('case_interventions')
      .insert({
        case_id: selectedCaseId,
        intervention_type: actionType,
        intervention_summary: evidence,
      })

    if (interventionError) {
      alert(interventionError.message)
      setLoading(false)
      return
    }

    const { error: caseError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: lifecycleDecision.nextStatus,
        intervention_summary: evidence,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedCaseId)

    if (caseError) {
      alert(caseError.message)
      setLoading(false)
      return
    }

    setSelectedCaseId('')
    setActionType('')
    setActionChannel('')
    setActionStatus('')
    setActionTrajectory('')
    setEvidencePosture('')
    setOwnerVisibility('')
    setContinuityOutlook('')
    setReviewTiming('')
    setContinuityRisk('')
    setGovernanceInterpretation('')

    setMessage(
      'Stabilization action evidence preserved. Routing memory, action movement, executive meaning, lifecycle posture, survivability visibility, and structural traceability remain operationally visible.',
    )

    setLoading(false)

    await loadCases()
    await loadInterventions()
  }

  const climatePanels = [
    {
      title: 'Action Stability Climate',
      value: actionClimate.stabilityClimate,
    },
    {
      title: 'Continuity Action Posture',
      value: actionClimate.actionPosture,
    },
    {
      title: 'Dependency Visibility',
      value: actionClimate.dependencyVisibility,
    },
    {
      title: 'Outcome Readiness Landscape',
      value: actionClimate.outcomeLandscape,
    },
  ]

  const synthesisRows = [
    ['INHERITED INTAKE IDENTITY', inheritedContext.intakeIdentity],
    ['INHERITED ROUTING POSTURE', inheritedContext.routingPosture],
    ['INTERVENTION READINESS', inheritedContext.interventionReadiness],
    ['INHERITED EVIDENCE POSTURE', inheritedContext.inheritedEvidencePosture],
    ['INHERITED DRIFT SIGNAL', inheritedContext.inheritedDriftSignal],
    ['INHERITED CONVERGENCE SIGNAL', inheritedContext.inheritedConvergenceSignal],
    ['INHERITED COMMAND MEANING', inheritedContext.inheritedCommandMeaning],
    ['INHERITED SURVIVABILITY', inheritedContext.inheritedSurvivability],
    ['ACTION MOVEMENT', actionStatus || 'Awaiting action movement selection'],
    ['ACTION TRAJECTORY', actionTrajectory || 'Action trajectory pending'],
    ['ACTION EVIDENCE POSTURE', evidencePosture || 'Awaiting evidence posture selection'],
    ['OWNER VISIBILITY', ownerVisibility || 'Awaiting owner visibility selection'],
    ['CONTINUITY OUTLOOK', continuityOutlook || 'Continuity outlook pending'],
    ['CONTINUITY RISK', continuityRisk || 'Continuity risk pending'],
    ['COMMAND POSTURE', commandPosture],
    ['ACTION CONFIDENCE', actionConfidence],
    ['SURVIVABILITY SIGNAL', survivabilitySignal],
    ['EXECUTIVE MEANING', executiveMeaning],
    ['ACTION PRESSURE', pressureMeaning],
    [
      'NEXT LIFECYCLE STATE',
      selectedCase
        ? lifecycleDecision.nextStatus
        : 'Continuity lifecycle advancement pending stabilization action governance.',
    ],
    [
      'CASE SIGNAL',
      selectedCase?.beneficiary_name ||
        'Executive continuity interpretation will activate after stabilization action evidence is preserved.',
    ],
    [
      'STABILITY DOMAIN',
      selectedCase?.support_domain ||
        'Continuity domain visibility pending action assignment.',
    ],
    [
      'CURRENT CONTINUITY STATUS',
      selectedCase?.case_status || 'Continuity posture pending action governance.',
    ],
    ['ACTION TYPE', actionType || 'Awaiting action type selection'],
    ['ACTION CHANNEL', actionChannel || 'Awaiting action channel selection'],
    [
      'GOVERNANCE INTERPRETATION',
      governanceInterpretation.trim() ||
        'No additional operational continuity interpretation entered.',
    ],
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
          TSINAXA CGI • STABILIZATION ACTION GOVERNANCE
        </p>

        <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white">
            Stabilization Action Governance
          </h2>

          <p className="mt-3 max-w-5xl text-sm leading-6 text-neutral-300">
            Convert routed instability into governed action evidence while
            preserving inherited intake identity, routing posture, convergence
            visibility, survivability meaning, command interpretation, and
            structural continuity memory before outcome verification begins.
          </p>

          <p className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
            <span className="font-semibold">Boundary:</span> /interventions
            governs stabilization action evidence. It does not verify outcomes,
            declare recovery durability, or erase routing memory inherited from
            upstream continuity governance.
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
            Continuity Action Intelligence
          </h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {pressureMeaning}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold text-white">
              Preserve Action Evidence
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Use this after routed instability receives governed stabilization
              action. Preserve routing memory, action trajectory, survivability
              visibility, owner posture, and executive continuity interpretation.
            </p>

            <div className="mt-6 space-y-5">
              <Select
                label="Stability Case"
                placeholder={
                  cases.length === 0
                    ? 'No stabilization-stage cases found'
                    : 'Select stability case'
                }
                value={selectedCaseId}
                setValue={setSelectedCaseId}
                options={cases.map((item) => ({
                  label: buildCaseLabel(item),
                  value: item.id,
                }))}
              />

              {selectedCase && (
                <section className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
                  <p className="text-sm font-semibold text-cyan-100">
                    Inherited Routing Memory
                  </p>

                  <div className="mt-4 grid gap-3">
                    <Info
                      label="Memory Source"
                      value={inheritedContext.memorySource}
                    />
                    <Info
                      label="Inherited Intake Identity"
                      value={inheritedContext.intakeIdentity}
                    />
                    <Info
                      label="Inherited Routing Posture"
                      value={inheritedContext.routingPosture}
                    />
                    <Info
                      label="Intervention Readiness"
                      value={inheritedContext.interventionReadiness}
                    />
                    <Info
                      label="Inherited Evidence Posture"
                      value={inheritedContext.inheritedEvidencePosture}
                    />
                    <Info
                      label="Inherited Drift Signal"
                      value={inheritedContext.inheritedDriftSignal}
                    />
                    <Info
                      label="Inherited Convergence Signal"
                      value={inheritedContext.inheritedConvergenceSignal}
                    />
                    <Info
                      label="Inherited Command Meaning"
                      value={inheritedContext.inheritedCommandMeaning}
                    />
                    <Info
                      label="Inherited Survivability"
                      value={inheritedContext.inheritedSurvivability}
                    />
                  </div>
                </section>
              )}

              <Select
                label="Action Type"
                placeholder="Select action type"
                value={actionType}
                setValue={setActionType}
                options={ACTION_TYPES.map((item) => ({ label: item, value: item }))}
              />

              <Select
                label="Action Channel"
                placeholder="Select action channel"
                value={actionChannel}
                setValue={setActionChannel}
                options={ACTION_CHANNELS.map((item) => ({ label: item, value: item }))}
              />

              <Select
                label="Action Movement"
                placeholder="Select action movement"
                value={actionStatus}
                setValue={setActionStatus}
                options={ACTION_STATUSES.map((item) => ({ label: item, value: item }))}
              />

              <Select
                label="Action Trajectory"
                placeholder="Select action trajectory"
                value={actionTrajectory}
                setValue={setActionTrajectory}
                options={ACTION_TRAJECTORIES.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Evidence Posture"
                placeholder="Select evidence posture"
                value={evidencePosture}
                setValue={setEvidencePosture}
                options={EVIDENCE_POSTURES.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Owner Visibility"
                placeholder="Select owner visibility"
                value={ownerVisibility}
                setValue={setOwnerVisibility}
                options={OWNER_VISIBILITIES.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Continuity Outlook"
                placeholder="Select continuity outlook"
                value={continuityOutlook}
                setValue={setContinuityOutlook}
                options={CONTINUITY_OUTLOOKS.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Review Timing"
                placeholder="Select review timing"
                value={reviewTiming}
                setValue={setReviewTiming}
                options={REVIEW_TIMINGS.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Continuity Risk"
                placeholder="Select continuity risk"
                value={continuityRisk}
                setValue={(value) => setContinuityRisk(value as ContinuityRisk)}
                options={CONTINUITY_RISKS.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Governance Interpretation
                </span>

                <textarea
                  value={governanceInterpretation}
                  onChange={(event) => setGovernanceInterpretation(event.target.value)}
                  rows={5}
                  placeholder="Use operational facts only. Preserve routing memory, continuity movement, survivability visibility, structural traceability, and executive continuity interpretation."
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                />
              </label>

              <button
                onClick={preserveStabilizationActionEvidence}
                disabled={loading}
                className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {loading
                  ? 'Preserving Governance Evidence...'
                  : 'Preserve Stabilization Action Evidence'}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold text-white">
              Executive Action Synthesis
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              This synthesis evaluates whether inherited routing direction is
              converting into credible stabilization action, remaining variable,
              stalling, recurring, escalating, or becoming eligible for outcome
              verification governance.
            </p>

            <div className="mt-6 divide-y divide-neutral-800 rounded-2xl border border-neutral-800">
              {synthesisRows.map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-2 p-4 md:grid-cols-[0.42fr_1fr]"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    {label}
                  </p>
                  <p className="break-words text-sm leading-6 text-neutral-100">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-cyan-400">
                Lifecycle Boundary
              </h4>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Routing is not action. Action is not outcome. Outcome is not
                recovery.
              </p>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-xl font-semibold text-white">
            Action Governance Doctrine
          </h3>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Stabilization action governance is not task completion tracking. CGI
            preserves inherited routing memory, continuity movement credibility,
            owner visibility, residual pressure, survivability relevance, and
            operational traceability before verification governance begins.
          </p>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature action governance must preserve proportional continuity
            interpretation. When stabilization movement strengthens without
            escalation concentration, stalled barriers, recurrence visibility, or
            structural deterioration, the system should support measured continuity
            confidence while preserving structural memory, executive visibility,
            and lifecycle traceability.
          </p>
        </section>
      </section>
    </main>
  )
}

function buildEmptyInheritedInterventionContext(): InheritedInterventionContext {
  return {
    intakeIdentity:
      'Inherited intake identity will activate after a routed continuity case is selected.',
    routingPosture:
      'Inherited routing posture pending selected stabilization-stage case.',
    interventionReadiness:
      'Intervention readiness pending selected stabilization-stage case.',
    inheritedEvidencePosture:
      'Inherited evidence posture pending selected stabilization-stage case.',
    inheritedDriftSignal:
      'Inherited drift visibility pending selected stabilization-stage case.',
    inheritedConvergenceSignal:
      'Inherited convergence visibility pending selected stabilization-stage case.',
    inheritedCommandMeaning:
      'Inherited command meaning pending selected stabilization-stage case.',
    inheritedSurvivability:
      'Inherited survivability interpretation pending selected stabilization-stage case.',
    memorySource:
      'Inherited routing memory pending selected stabilization-stage case.',
  }
}

function buildInheritedInterventionContext(
  caseItem: StabilityCase,
): InheritedInterventionContext {
  const source = buildInterventionMemorySource(caseItem)

  return {
    intakeIdentity: resolveIntakeIdentity(caseItem, source),
    routingPosture: resolveRoutingPosture(caseItem, source),
    interventionReadiness: resolveInterventionReadiness(caseItem, source),
    inheritedEvidencePosture: resolveInheritedEvidencePosture(caseItem, source),
    inheritedDriftSignal: resolveInheritedDriftSignal(caseItem, source),
    inheritedConvergenceSignal: resolveInheritedConvergenceSignal(caseItem, source),
    inheritedCommandMeaning: resolveInheritedCommandMeaning(caseItem, source),
    inheritedSurvivability: resolveInheritedSurvivability(caseItem, source),
    memorySource: resolveInterventionMemorySource(caseItem),
  }
}

function buildInterventionMemorySource(caseItem: StabilityCase) {
  return [
    caseItem.continuity_memory,
    caseItem.latest_downstream_evidence,
    caseItem.outcome_summary,
    caseItem.intervention_summary,
  ]
    .filter(Boolean)
    .join('\n\n')
}

function resolveInterventionMemorySource(caseItem: StabilityCase) {
  if (caseItem.continuity_memory) return 'active continuity memory'
  if (caseItem.latest_downstream_evidence) return 'latest downstream evidence'
  if (caseItem.outcome_summary) return 'routing continuity memory'
  if (caseItem.intervention_summary) return 'prior action memory'
  return 'fallback routed case fields'
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

function resolveRoutingPosture(caseItem: StabilityCase, source: string) {
  return (
    extractBlockField(source, 'ROUTING STATUS') ||
    extractBlockField(source, 'INHERITED ROUTING READINESS') ||
    resolveFallbackRoutingPosture(caseItem)
  )
}

function resolveFallbackRoutingPosture(caseItem: StabilityCase) {
  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED')) {
    return caseItem.case_status.includes('RECURRENCE')
      ? 'Repeated governed routing direction has been established for stabilization action.'
      : 'Governed routing direction has been established for stabilization action.'
  }

  if (caseItem.case_status.includes('INTERVENTION_ACTIVE')) {
    return 'Routing has progressed into active stabilization action governance.'
  }

  if (caseItem.case_status.includes('INTERVENTION_RECORDED')) {
    return 'Routing memory has already produced preserved stabilization action evidence.'
  }

  if (caseItem.case_status.includes('STABILIZING')) {
    return 'Routing direction is converting into stabilization movement.'
  }

  if (caseItem.case_status.includes('ESCALATED')) {
    return 'Routing has escalated into executive stabilization visibility.'
  }

  return 'Routing posture requires governed stabilization action interpretation.'
}

function resolveInterventionReadiness(caseItem: StabilityCase, source: string) {
  return (
    extractBlockField(source, 'ACTION READINESS') ||
    resolveFallbackInterventionReadiness(caseItem)
  )
}

function resolveFallbackInterventionReadiness(caseItem: StabilityCase) {
  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED')) {
    return caseItem.case_status.includes('RECURRENCE')
      ? 'ACTION_READY_AFTER_REPEATED_ROUTING_DIRECTION'
      : 'INTERVENTION_READY_FROM_ROUTING'
  }

  if (caseItem.case_status.includes('INTERVENTION_ACTIVE')) {
    return 'INTERVENTION_ALREADY_ACTIVE'
  }

  if (caseItem.case_status.includes('INTERVENTION_RECORDED')) {
    return 'INTERVENTION_EVIDENCE_ALREADY_PRESERVED'
  }

  if (caseItem.case_status.includes('STABILIZING')) {
    return 'STABILIZATION_MOVEMENT_ALREADY_VISIBLE'
  }

  if (caseItem.case_status.includes('ESCALATED')) {
    return 'INTERVENTION_REQUIRES_EXECUTIVE_VISIBILITY'
  }

  return 'INTERVENTION_REQUIRES_ROUTING_DIRECTION'
}

function resolveInheritedEvidencePosture(caseItem: StabilityCase, source: string) {
  if (caseItem.evidence_posture) return caseItem.evidence_posture

  return (
    extractBlockField(source, 'INHERITED EVIDENCE POSTURE') ||
    extractBlockField(source, 'EVIDENCE POSTURE') ||
    resolveFallbackEvidencePosture(caseItem)
  )
}

function resolveFallbackEvidencePosture(caseItem: StabilityCase) {
  if (caseItem.latest_downstream_evidence) return caseItem.latest_downstream_evidence

  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED')) {
    return 'Routing evidence preserved; stabilization action evidence pending.'
  }

  if (caseItem.case_status.includes('INTERVENTION_ACTIVE')) {
    return 'Action evidence is being governed; outcome evidence pending.'
  }

  if (caseItem.case_status.includes('ESCALATED')) {
    return 'Escalation evidence remains visible before outcome verification.'
  }

  return 'Inherited routing evidence pending action governance.'
}

function resolveInheritedDriftSignal(caseItem: StabilityCase, source: string) {
  if (caseItem.drift_signal) return caseItem.drift_signal

  return (
    extractBlockField(source, 'INHERITED DRIFT SIGNAL') ||
    resolveFallbackDriftSignal(caseItem)
  )
}

function resolveFallbackDriftSignal(caseItem: StabilityCase) {
  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED_RECURRENCE')) {
    return 'ROUTING_RECURRENCE_AFTER_DIRECTION_VISIBLE'
  }

  if (caseItem.case_status.includes('ESCALATED')) {
    return 'ACTION_ESCALATION_DRIFT_VISIBLE'
  }

  if (caseItem.case_status.includes('INTERVENTION_ACTIVE')) {
    return 'ACTION_DRIFT_MONITORING_ACTIVE'
  }

  if (caseItem.case_status.includes('STABILIZING')) {
    return 'NO_ACTIVE_ACTION_DRIFT_VISIBLE'
  }

  return 'NO_ACTIVE_ACTION_DRIFT_VISIBLE'
}

function resolveInheritedConvergenceSignal(caseItem: StabilityCase, source: string) {
  if (caseItem.convergence_signal) return caseItem.convergence_signal

  return (
    extractBlockField(source, 'INHERITED CONVERGENCE SIGNAL') ||
    resolveFallbackConvergenceSignal(caseItem)
  )
}

function resolveFallbackConvergenceSignal(caseItem: StabilityCase) {
  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED_RECURRENCE')) {
    return 'CONVERGENCE_BUILDING_THROUGH_REPEATED_OWNER_DIRECTION'
  }

  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED')) {
    return 'CONVERGENCE_READY_FOR_ACTION'
  }

  if (caseItem.case_status.includes('STABILIZING')) {
    return 'CONVERGENCE_BUILDING_THROUGH_ACTION'
  }

  if (caseItem.case_status.includes('ESCALATED')) {
    return 'CONVERGENCE_CONSTRAINED_BY_ESCALATION'
  }

  return 'CONVERGENCE_PENDING_ACTION_EVIDENCE'
}

function resolveInheritedCommandMeaning(caseItem: StabilityCase, source: string) {
  if (caseItem.command_meaning) return caseItem.command_meaning

  return (
    extractBlockField(source, 'INHERITED COMMAND MEANING') ||
    extractBlockField(source, 'COMMAND MEANING') ||
    resolveFallbackCommandMeaning(caseItem)
  )
}

function resolveFallbackCommandMeaning(caseItem: StabilityCase) {
  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED_RECURRENCE')) {
    return 'Repeated governed routing direction is visible; action evidence must now determine whether stabilization is becoming credible.'
  }

  if (caseItem.severity_level === 'CRITICAL') {
    return 'Critical routed instability requires accelerated stabilization action visibility.'
  }

  if (caseItem.safeguarding_flag) {
    return 'Safeguarding-sensitive routed instability requires protected action evidence and traceable owner movement.'
  }

  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED')) {
    return 'Routing direction is ready to become governed stabilization action.'
  }

  return 'Action governance should preserve command meaning inherited from routing.'
}

function resolveInheritedSurvivability(caseItem: StabilityCase, source: string) {
  if (caseItem.survivability_interpretation) {
    return caseItem.survivability_interpretation
  }

  return (
    extractBlockField(source, 'INHERITED SURVIVABILITY INTERPRETATION') ||
    resolveFallbackSurvivability(caseItem)
  )
}

function resolveFallbackSurvivability(caseItem: StabilityCase) {
  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED_RECURRENCE')) {
    return 'Survivability credibility may begin strengthening through repeated owner direction, but action evidence is required before stabilization confidence improves.'
  }

  if (caseItem.severity_level === 'CRITICAL') {
    return 'Survivability pressure remains high until action movement is preserved.'
  }

  if (caseItem.severity_level === 'HIGH' && caseItem.safeguarding_flag) {
    return 'High-pressure safeguarding pathway remains survivability-sensitive until action evidence strengthens.'
  }

  if (caseItem.case_status.includes('STABILIZATION_OWNER_ROUTED')) {
    return 'Survivability credibility can strengthen if routed ownership converts into action movement.'
  }

  return 'Survivability interpretation awaits governed stabilization action evidence.'
}

function buildActionClimate({
  interventions,
  hasSelectedCase,
  inheritedContext,
}: {
  interventions: InterventionRecord[]
  hasSelectedCase: boolean
  inheritedContext: InheritedInterventionContext
}) {
  if (!hasSelectedCase) {
    return {
      stabilityClimate:
        'Awaiting stabilization action evidence before continuity climate interpretation activates.',
      actionPosture:
        'Continuity action posture will activate after governed stabilization evidence becomes operationally visible.',
      dependencyVisibility:
        'Dependency visibility interpretation pending stabilization action evidence.',
      outcomeLandscape:
        'Verification eligibility visibility pending stabilization action progression.',
    }
  }

  const escalationCount = interventions.filter((item) =>
    item.intervention_summary?.includes('ESCALATION_REQUIRED'),
  ).length

  const stalledCount = interventions.filter((item) =>
    item.intervention_summary?.includes('ACTION_STALLED'),
  ).length

  return {
    stabilityClimate:
      escalationCount === 0
        ? 'Continuity action conditions remain proportionally balanced under inherited routing memory and current governance visibility.'
        : 'Some stabilization pathways remain operationally variable under current governance conditions.',
    actionPosture:
      stalledCount === 0
        ? 'Stabilization action posture remains operationally manageable without concentrated escalation pressure.'
        : 'Some stabilization pathways remain slowed by operational dependencies or interrupted movement.',
    dependencyVisibility:
      stalledCount === 0
        ? 'No concentrated dependency barriers currently weakening stabilization movement.'
        : 'Dependency visibility remains operationally active across some stabilization pathways.',
    outcomeLandscape: inheritedContext.inheritedConvergenceSignal.includes('CONVERGENCE')
      ? 'Some stabilization pathways may become eligible for verification governance after continuity movement strengthens.'
      : 'Verification readiness remains limited until stabilization action evidence becomes credible.',
  }
}

function buildCommandPosture(input: {
  hasActionEvidence: boolean
  actionStatus: string
  continuityRisk: ContinuityRisk | ''
  actionTrajectory: string
  continuityOutlook: string
  inheritedContext: InheritedInterventionContext
}) {
  if (!input.hasActionEvidence) {
    return input.inheritedContext.interventionReadiness
  }

  if (
    input.continuityRisk === 'CRITICAL' ||
    input.actionStatus === 'ESCALATION_REQUIRED'
  ) {
    return 'URGENT_CONTINUITY_REVIEW'
  }

  if (input.continuityRisk === 'HIGH' || input.actionTrajectory === 'DESTABILIZING') {
    return 'EXECUTIVE_ACTION_REVIEW'
  }

  if (input.actionTrajectory === 'ACTION_STALLED' || input.continuityOutlook === 'AT_RISK') {
    return 'ELEVATED_ACTION_OBSERVATION'
  }

  if (input.actionTrajectory === 'HOLDING_WITH_VARIANCE') {
    return 'CONTINUITY_OBSERVATION'
  }

  return 'STABILIZATION_HOLDING'
}

function buildActionConfidence(input: {
  hasActionEvidence: boolean
  actionStatus: string
  continuityRisk: ContinuityRisk | ''
  actionTrajectory: string
  continuityOutlook: string
  inheritedContext: InheritedInterventionContext
}) {
  if (!input.hasActionEvidence) {
    return input.inheritedContext.interventionReadiness.includes('READY')
      ? 'ACTION_CONFIDENCE_READY'
      : 'ACTION_CONFIDENCE_PENDING'
  }

  if (
    input.actionStatus === 'ESCALATION_REQUIRED' ||
    input.continuityRisk === 'CRITICAL'
  ) {
    return 'DESTABILIZING'
  }

  if (input.actionTrajectory === 'ACTION_STALLED' || input.continuityOutlook === 'AT_RISK') {
    return 'FRAGILE'
  }

  if (input.actionTrajectory === 'STABILIZATION_BUILDING' && input.continuityRisk === 'LOW') {
    return 'CREDIBLE'
  }

  return 'VARIABLE'
}

function buildSurvivabilitySignal(input: {
  hasActionEvidence: boolean
  continuityRisk: ContinuityRisk | ''
  actionTrajectory: string
  continuityOutlook: string
  actionStatus: string
  inheritedContext: InheritedInterventionContext
}) {
  if (!input.hasActionEvidence) {
    return input.inheritedContext.inheritedSurvivability
  }

  if (
    input.continuityRisk === 'CRITICAL' ||
    input.actionStatus === 'ESCALATION_REQUIRED'
  ) {
    return 'SURVIVABILITY_PRESSURE_RISING'
  }

  if (input.actionTrajectory === 'ACTION_STALLED') {
    return 'ACTION_MOVEMENT_REQUIRES_VISIBILITY'
  }

  if (
    input.actionTrajectory === 'STABILIZATION_BUILDING' &&
    input.continuityOutlook === 'STABILITY_BUILDING'
  ) {
    return 'SURVIVABILITY_BACKGROUND_STABLE'
  }

  return 'CONTINUITY_VARIABILITY_REMAINS_VISIBLE'
}

function buildExecutiveMeaning(input: {
  hasActionEvidence: boolean
  actionStatus: string
  continuityRisk: ContinuityRisk | ''
  actionTrajectory: string
  continuityOutlook: string
  inheritedContext: InheritedInterventionContext
}) {
  if (!input.hasActionEvidence) {
    return input.inheritedContext.inheritedCommandMeaning
  }

  if (
    input.continuityRisk === 'CRITICAL' ||
    input.actionStatus === 'ESCALATION_REQUIRED'
  ) {
    return 'Executive continuity visibility is required due to survivability-level stabilization pressure.'
  }

  if (input.actionTrajectory === 'ACTION_STALLED') {
    return 'Stabilization movement remains interrupted or slowed by operational dependency visibility.'
  }

  if (input.actionTrajectory === 'STABILIZATION_BUILDING') {
    return 'Stabilization movement appears operationally credible while continuity observation remains proportionally active.'
  }

  return 'Stabilization movement remains operationally visible under current governance observation conditions.'
}

function buildPressureMeaning(input: {
  hasActionEvidence: boolean
  actionTrajectory: string
  continuityOutlook: string
  continuityRisk: ContinuityRisk | ''
  inheritedContext: InheritedInterventionContext
}) {
  if (!input.hasActionEvidence) {
    return `Continuity action interpretation is inheriting routing memory: ${input.inheritedContext.routingPosture}`
  }

  if (input.actionTrajectory === 'STABILIZATION_BUILDING' && input.continuityRisk === 'LOW') {
    return 'Stabilization action conditions remain proportionally balanced while continuity confidence continues to mature.'
  }

  if (input.actionTrajectory === 'ACTION_STALLED') {
    return 'Continuity action pressure remains active due to interrupted stabilization movement or operational dependency visibility.'
  }

  if (input.continuityRisk === 'HIGH' || input.continuityRisk === 'CRITICAL') {
    return 'Executive continuity review should remain operationally visible due to elevated stabilization pressure.'
  }

  return 'Continuity action observation remains proportionally active under current governance conditions.'
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm leading-6 text-neutral-100">{value}</p>
    </div>
  )
}

function Select({
  label,
  placeholder,
  value,
  setValue,
  options,
}: {
  label: string
  placeholder: string
  value: string
  setValue: (value: string) => void
  options: {
    label: string
    value: string
  }[]
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
      >
        <option value="">{placeholder}</option>

        {options.map((option, index) => (
          <option key={`${option.value}-${index}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}