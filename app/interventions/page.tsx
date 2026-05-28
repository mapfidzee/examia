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
}

type InterventionRecord = {
  id: string
  case_id: string
  intervention_type: string | null
  intervention_summary: string | null
  created_at?: string | null
}

const ACTION_READY_STATUSES = [
  'ACCEPTED_FOR_GOVERNANCE',
  'ROUTED',
  'ASSIGNED',
  'RESPONDER_ASSIGNED',
  'ROUTING_CONFIRMED',
  'STABILIZATION_ROUTED',
  'STABILIZATION_OWNER_ROUTED',
  'ROUTED_TO_RESPONDER',
  'ROUTING_RECURRENCE',
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

  const hasActionEvidence = Boolean(selectedCaseId && actionStatus)

  const lifecycleDecision = evaluateInterventionLifecycle({
    completionStatus: actionStatus,
    continuityRisk: (continuityRisk || 'MODERATE') as ContinuityRisk,
  })

  const actionClimate = buildActionClimate({
    interventions,
    hasSelectedCase: Boolean(selectedCaseId),
  })

  const commandPosture = buildCommandPosture({
    hasActionEvidence,
    actionStatus,
    continuityRisk,
    actionTrajectory,
    continuityOutlook,
  })

  const actionConfidence = buildActionConfidence({
    hasActionEvidence,
    actionStatus,
    continuityRisk,
    actionTrajectory,
    continuityOutlook,
  })

  const survivabilitySignal = buildSurvivabilitySignal({
    hasActionEvidence,
    continuityRisk,
    actionTrajectory,
    continuityOutlook,
    actionStatus,
  })

  const executiveMeaning = buildExecutiveMeaning({
    hasActionEvidence,
    actionStatus,
    continuityRisk,
    actionTrajectory,
    continuityOutlook,
  })

  const pressureMeaning = buildPressureMeaning({
    hasActionEvidence,
    actionTrajectory,
    continuityOutlook,
    continuityRisk,
  })

  function buildCaseLabel(caseItem: StabilityCase) {
    return `${caseItem.beneficiary_name} • ${caseItem.support_domain} • ${caseItem.case_status}`
  }

  function actionSynthesis() {
    return `
ACTION MOVEMENT
${actionStatus || 'Awaiting action movement selection'}

ACTION TRAJECTORY
${actionTrajectory || 'Action trajectory pending'}

EVIDENCE POSTURE
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
      'Stabilization action evidence preserved. Continuity movement, executive meaning, lifecycle posture, survivability visibility, and structural traceability remain operationally visible.',
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
    ['ACTION MOVEMENT', actionStatus || 'Awaiting action movement selection'],
    ['ACTION TRAJECTORY', actionTrajectory || 'Action trajectory pending'],
    ['EVIDENCE POSTURE', evidencePosture || 'Awaiting evidence posture selection'],
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
      selectedCase?.support_domain || 'Continuity domain visibility pending action assignment.',
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
            Convert routed instability into governed action evidence, preserve
            continuity movement, expose stalled stabilization conditions, maintain
            survivability visibility, and protect the lifecycle boundary between
            action, outcome, and recovery.
          </p>

          <p className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
            <span className="font-semibold">Boundary:</span> /interventions
            governs stabilization action evidence. It does not verify outcomes,
            declare recovery durability, or erase structural continuity memory
            automatically.
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
              action. Preserve continuity movement, action trajectory,
              survivability visibility, owner posture, and executive continuity
              interpretation.
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
                  placeholder="Use operational facts only. Preserve continuity movement, survivability visibility, structural traceability, and executive continuity interpretation."
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
              This synthesis evaluates whether stabilization movement is
              strengthening, remaining variable, stalling, recurring, escalating,
              or becoming eligible for verification governance.
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
                  <p className="text-sm leading-6 text-neutral-100">{value}</p>
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
            preserves continuity movement credibility, owner visibility, residual
            pressure, survivability relevance, and operational traceability before
            verification governance begins.
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

function buildActionClimate({
  interventions,
  hasSelectedCase,
}: {
  interventions: InterventionRecord[]
  hasSelectedCase: boolean
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
        ? 'Continuity action conditions remain proportionally balanced under current governance visibility.'
        : 'Some stabilization pathways remain operationally variable under current governance conditions.',
    actionPosture:
      stalledCount === 0
        ? 'Stabilization action posture remains operationally manageable without concentrated escalation pressure.'
        : 'Some stabilization pathways remain slowed by operational dependencies or interrupted movement.',
    dependencyVisibility:
      stalledCount === 0
        ? 'No concentrated dependency barriers currently weakening stabilization movement.'
        : 'Dependency visibility remains operationally active across some stabilization pathways.',
    outcomeLandscape:
      escalationCount === 0
        ? 'Some stabilization pathways may become eligible for verification governance after continuity movement strengthens.'
        : 'Verification readiness remains limited under current stabilization pressure conditions.',
  }
}

function buildCommandPosture(input: {
  hasActionEvidence: boolean
  actionStatus: string
  continuityRisk: ContinuityRisk | ''
  actionTrajectory: string
  continuityOutlook: string
}) {
  if (!input.hasActionEvidence) return 'PENDING_ACTION_EVIDENCE'

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
}) {
  if (!input.hasActionEvidence) return 'ACTION_CONFIDENCE_PENDING'

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
}) {
  if (!input.hasActionEvidence) return 'SURVIVABILITY_INTERPRETATION_PENDING'

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
}) {
  if (!input.hasActionEvidence) {
    return 'Executive continuity interpretation will activate after stabilization action evidence is preserved.'
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
}) {
  if (!input.hasActionEvidence) {
    return 'Continuity action interpretation will activate after stabilization action evidence becomes operationally visible.'
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