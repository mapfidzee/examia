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

type RoutingAction = {
  id: string
  case_id: string
  assigned_responder_id: string | null
  routing_status: string
  routing_reason: string | null
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
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [lastPreservedCaseId, setLastPreservedCaseId] = useState('')
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
    const { data: routingData, error: routingError } = await supabase
      .from('case_routing_actions')
      .select('*')
      .order('created_at', { ascending: false })

    if (routingError) console.error(routingError)

    const routedActions = (routingData || []).filter((item: RoutingAction) =>
      ACTION_READY_STATUSES.includes(item.routing_status),
    )

    const routedCaseIds = Array.from(
      new Set(routedActions.map((item: RoutingAction) => item.case_id)),
    )

    const directCasesQuery = supabase
      .from('beneficiary_cases')
      .select('*')
      .in('case_status', ACTION_READY_STATUSES)
      .order('created_at', { ascending: false })

    const routedCasesQuery =
      routedCaseIds.length > 0
        ? supabase
            .from('beneficiary_cases')
            .select('*')
            .in('id', routedCaseIds)
            .order('created_at', { ascending: false })
        : null

    const [directCasesResult, routedCasesResult] = await Promise.all([
      directCasesQuery,
      routedCasesQuery || Promise.resolve({ data: [], error: null }),
    ])

    if (directCasesResult.error) console.error(directCasesResult.error)
    if (routedCasesResult.error) console.error(routedCasesResult.error)

    setRoutingActions(routingData || [])
    setCases(
      mergeCases([
        ...(directCasesResult.data || []),
        ...(routedCasesResult.data || []),
      ]),
    )
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

  const selectedRoutingAction = useMemo(
    () =>
      selectedCase
        ? findLatestRoutingAction(selectedCase.id, routingActions)
        : undefined,
    [selectedCase, routingActions],
  )

  const selectedIntervention = useMemo(
    () =>
      selectedCase
        ? findLatestIntervention(selectedCase.id, interventions)
        : undefined,
    [selectedCase, interventions],
  )

  const lastPreservedCase = useMemo(
    () => cases.find((item) => item.id === lastPreservedCaseId),
    [cases, lastPreservedCaseId],
  )

  const lastPreservedRoutingAction = useMemo(
    () =>
      lastPreservedCase
        ? findLatestRoutingAction(lastPreservedCase.id, routingActions)
        : undefined,
    [lastPreservedCase, routingActions],
  )

  const lastPreservedIntervention = useMemo(
    () =>
      lastPreservedCase
        ? findLatestIntervention(lastPreservedCase.id, interventions)
        : undefined,
    [lastPreservedCase, interventions],
  )

  const inheritedContext = useMemo(
    () =>
      selectedCase
        ? buildInheritedInterventionContext(selectedCase, selectedRoutingAction)
        : buildEmptyInheritedInterventionContext(),
    [selectedCase, selectedRoutingAction],
  )

  const selectedOrLatestIntervention =
    selectedIntervention || lastPreservedIntervention

  const hydratedEvidence = useMemo(
    () => hydrateInterventionEvidence(selectedOrLatestIntervention),
    [selectedOrLatestIntervention],
  )

  const displayActionStatus =
    actionStatus || hydratedEvidence.actionMovement || ''

  const displayActionTrajectory =
    actionTrajectory || hydratedEvidence.actionTrajectory || ''

  const displayEvidencePosture =
    evidencePosture || hydratedEvidence.actionEvidencePosture || ''

  const displayOwnerVisibility =
    ownerVisibility || hydratedEvidence.ownerVisibility || ''

  const displayContinuityOutlook =
    continuityOutlook || hydratedEvidence.continuityOutlook || ''

  const displayContinuityRisk =
    continuityRisk || (hydratedEvidence.continuityRisk as ContinuityRisk | '') || ''

  const displayReviewTiming =
    reviewTiming || hydratedEvidence.reviewTiming || ''

  const hasActionEvidence = Boolean(
    selectedCaseId
      ? actionStatus || selectedIntervention
      : lastPreservedIntervention,
  )

  const lifecycleDecision = evaluateInterventionLifecycle({
    completionStatus: displayActionStatus,
    continuityRisk: (displayContinuityRisk || 'MODERATE') as ContinuityRisk,
  })

  const actionClimate = buildActionClimate({
    interventions,
    hasSelectedCase: Boolean(selectedCaseId || lastPreservedCaseId),
    inheritedContext:
      selectedCase || !lastPreservedCase
        ? inheritedContext
        : buildInheritedInterventionContext(
            lastPreservedCase,
            lastPreservedRoutingAction,
          ),
  })

  const commandPosture = buildCommandPosture({
    hasActionEvidence,
    actionStatus: displayActionStatus,
    continuityRisk: displayContinuityRisk,
    actionTrajectory: displayActionTrajectory,
    continuityOutlook: displayContinuityOutlook,
    inheritedContext,
  })

  const actionConfidence = buildActionConfidence({
    hasActionEvidence,
    actionStatus: displayActionStatus,
    continuityRisk: displayContinuityRisk,
    actionTrajectory: displayActionTrajectory,
    continuityOutlook: displayContinuityOutlook,
    inheritedContext,
  })

  const survivabilitySignal = buildSurvivabilitySignal({
    hasActionEvidence,
    continuityRisk: displayContinuityRisk,
    actionTrajectory: displayActionTrajectory,
    continuityOutlook: displayContinuityOutlook,
    actionStatus: displayActionStatus,
    inheritedContext,
  })

  const executiveMeaning = buildExecutiveMeaning({
    hasActionEvidence,
    actionStatus: displayActionStatus,
    continuityRisk: displayContinuityRisk,
    actionTrajectory: displayActionTrajectory,
    continuityOutlook: displayContinuityOutlook,
    inheritedContext,
  })

  const pressureMeaning = buildPressureMeaning({
    hasActionEvidence,
    actionTrajectory: displayActionTrajectory,
    continuityOutlook: displayContinuityOutlook,
    continuityRisk: displayContinuityRisk,
    inheritedContext,
  })

  const actionMovementCards = [
    {
      title: 'Execute',
      movement: 'Action Evidence',
      description: 'Preserve stabilization movement after routing direction.',
    },
    {
      title: 'Continue',
      movement: 'Follow-Up',
      description: 'Keep action visible when movement is incomplete.',
    },
    {
      title: 'Strengthen',
      movement: 'Evidence',
      description: 'Increase credibility before outcome verification.',
    },
    {
      title: 'Pause',
      movement: 'Barrier',
      description: 'Hold movement when action is blocked or unstable.',
    },
    {
      title: 'Escalate',
      movement: 'Command',
      description: 'Raise visibility when action pressure threatens continuity.',
    },
  ]

  function buildCaseLabel(caseItem: StabilityCase) {
    const latestRouting = findLatestRoutingAction(caseItem.id, routingActions)
    const inherited = buildInheritedInterventionContext(caseItem, latestRouting)
    const latestIntervention = findLatestIntervention(caseItem.id, interventions)
    const activeStatus = latestIntervention
      ? 'ACTION_EVIDENCE_PRESERVED'
      : latestRouting?.routing_status || caseItem.case_status

    return `${inherited.intakeIdentity} • ${caseItem.support_domain} • ${activeStatus}`
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
${selectedCase ? lifecycleDecision.nextStatus : 'Continuity lifecycle advancement pending stabilization action governance.'}

CASE SIGNAL
${selectedCase?.beneficiary_name || 'Executive continuity interpretation will activate after stabilization action evidence is preserved.'}

STABILITY DOMAIN
${selectedCase?.support_domain || 'Continuity domain visibility pending action assignment.'}

CURRENT CONTINUITY STATUS
${selectedRoutingAction?.routing_status || selectedCase?.case_status || 'Continuity posture pending action governance.'}

ACTION TYPE
${actionType || 'Awaiting action type selection'}

ACTION CHANNEL
${actionChannel || 'Awaiting action channel selection'}

GOVERNANCE INTERPRETATION
${governanceInterpretation.trim() || 'No additional operational continuity interpretation entered.'}

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

    const preservedCaseId = selectedCaseId

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
    setLastPreservedCaseId(preservedCaseId)

    setMessage(
      'Stabilization action evidence preserved. Routing memory, action movement, executive meaning, lifecycle posture, survivability visibility, and structural traceability remain operationally visible.',
    )

    setLoading(false)

    await loadCases()
    await loadInterventions()
  }

  return (
    <main className="min-h-screen text-neutral-100">
      <section className="mx-auto max-w-7xl px-6 py-8">
        {message && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-semibold text-amber-100">
            {message}
          </div>
        )}

        <header className="mb-8 flex flex-col gap-5 border-b border-amber-500/10 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-400">
              TSINAXA CGI
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Interventions
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              Preserve stabilization action evidence.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
            <StageChip label="Operating Layer" value="Continuity Lifecycle" />
            <StageChip label="Executive Meaning" value="Action Evidence" />
            <StageChip label="Movement" value="Outcomes" />
          </div>
        </header>

        <section className="rounded-3xl border border-neutral-800 bg-black p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white">
            Stabilization Action Governance
          </h2>

          <p className="mt-3 max-w-5xl text-sm leading-6 text-neutral-300">
            Convert routed instability into governed action evidence while
            preserving routing memory, action trajectory, owner visibility,
            residual pressure, survivability relevance, and operational
            traceability before verification governance begins.
          </p>

          <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
            <span className="font-semibold">Boundary:</span> /interventions
            governs stabilization action evidence. It does not verify outcomes,
            declare recovery durability, or erase routing memory inherited from
            upstream continuity governance.
          </p>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ClimateCard title="Action Climate" value={actionClimate.stabilityClimate} />
          <ClimateCard title="Action Posture" value={actionClimate.actionPosture} />
          <ClimateCard title="Dependency Visibility" value={actionClimate.dependencyVisibility} />
          <ClimateCard title="Outcome Readiness" value={actionClimate.outcomeLandscape} />
        </div>

        <section className="mt-6 rounded-3xl border border-neutral-800 bg-black p-6">
          <h3 className="text-lg font-semibold text-white">
            Action Governance Workspace
          </h3>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Interventions has one lawful responsibility: preserve what action
            was done, whether it is moving, and whether it is credible enough to
            proceed toward outcome verification.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {actionMovementCards.map((item) => (
              <MovementCard
                key={item.title}
                title={item.title}
                movement={item.movement}
                description={item.description}
              />
            ))}
          </div>
        </section>

        <SimplePanel title="Continuity Action Intelligence" value={pressureMeaning} />

        <SimplePanel
          title="Executive Action Synthesis"
          value={executiveMeaning}
        />

        {lastPreservedIntervention && (
          <section className="mt-6 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
            <h3 className="text-lg font-semibold text-amber-100">
              Latest Preserved Action Evidence
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Info label="Action Movement" value={hydratedEvidence.actionMovement || 'Not recorded'} />
              <Info label="Action Trajectory" value={hydratedEvidence.actionTrajectory || 'Not recorded'} />
              <Info label="Evidence Posture" value={hydratedEvidence.actionEvidencePosture || 'Not recorded'} />
              <Info label="Owner Visibility" value={hydratedEvidence.ownerVisibility || 'Not recorded'} />
              <Info label="Continuity Outlook" value={hydratedEvidence.continuityOutlook || 'Not recorded'} />
              <Info label="Continuity Risk" value={hydratedEvidence.continuityRisk || 'Not recorded'} />
            </div>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-black p-6">
          <h3 className="text-xl font-semibold text-white">
            Preserve Stabilization Action
          </h3>

          <p className="mt-3 text-sm leading-6 text-neutral-400">
            Select a routed case and preserve action evidence. The form remains
            operational, but the page responsibility stays narrow: action is not
            outcome, and outcome is not recovery.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.05fr]">
            <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="space-y-5">
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
                  <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                    <p className="text-sm font-semibold text-amber-100">
                      Inherited Routing Memory
                    </p>

                    <div className="mt-4 grid gap-3">
                      <Info label="Memory Source" value={inheritedContext.memorySource} />
                      <Info label="Inherited Intake Identity" value={inheritedContext.intakeIdentity} />
                      <Info label="Inherited Routing Posture" value={inheritedContext.routingPosture} />
                      <Info label="Intervention Readiness" value={inheritedContext.interventionReadiness} />
                    </div>
                  </section>
                )}

                <Select label="Action Type" placeholder="Select action type" value={actionType} setValue={setActionType} options={ACTION_TYPES.map((item) => ({ label: item, value: item }))} />
                <Select label="Action Channel" placeholder="Select action channel" value={actionChannel} setValue={setActionChannel} options={ACTION_CHANNELS.map((item) => ({ label: item, value: item }))} />
                <Select label="Action Movement" placeholder="Select action movement" value={actionStatus} setValue={setActionStatus} options={ACTION_STATUSES.map((item) => ({ label: item, value: item }))} />
                <Select label="Action Trajectory" placeholder="Select action trajectory" value={actionTrajectory} setValue={setActionTrajectory} options={ACTION_TRAJECTORIES.map((item) => ({ label: item, value: item }))} />
                <Select label="Evidence Posture" placeholder="Select evidence posture" value={evidencePosture} setValue={setEvidencePosture} options={EVIDENCE_POSTURES.map((item) => ({ label: item, value: item }))} />
                <Select label="Owner Visibility" placeholder="Select owner visibility" value={ownerVisibility} setValue={setOwnerVisibility} options={OWNER_VISIBILITIES.map((item) => ({ label: item, value: item }))} />
                <Select label="Continuity Outlook" placeholder="Select continuity outlook" value={continuityOutlook} setValue={setContinuityOutlook} options={CONTINUITY_OUTLOOKS.map((item) => ({ label: item, value: item }))} />
                <Select label="Review Timing" placeholder="Select review timing" value={reviewTiming} setValue={setReviewTiming} options={REVIEW_TIMINGS.map((item) => ({ label: item, value: item }))} />
                <Select label="Continuity Risk" placeholder="Select continuity risk" value={continuityRisk} setValue={(value) => setContinuityRisk(value as ContinuityRisk)} options={CONTINUITY_RISKS.map((item) => ({ label: item, value: item }))} />

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Governance Interpretation
                  </span>

                  <textarea
                    value={governanceInterpretation}
                    onChange={(event) => setGovernanceInterpretation(event.target.value)}
                    rows={4}
                    placeholder="Use operational facts only. Preserve action movement, owner visibility, survivability relevance, and traceability."
                    className="mt-2 w-full rounded-xl border border-neutral-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                  />
                </label>

                <button
                  onClick={preserveStabilizationActionEvidence}
                  disabled={loading}
                  className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300 disabled:opacity-60"
                >
                  {loading
                    ? 'Preserving Action Evidence...'
                    : 'Preserve Stabilization Action Evidence'}
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-6">
              <h3 className="text-xl font-semibold text-white">
                Action Evidence Reading
              </h3>

              <p className="mt-3 text-sm leading-6 text-neutral-400">
                This panel shows whether routing direction is converting into
                credible action movement.
              </p>

              <div className="mt-6 grid gap-3">
                <Info label="Action Movement" value={displayActionStatus || 'Awaiting action movement'} />
                <Info label="Action Trajectory" value={displayActionTrajectory || 'Action trajectory pending'} />
                <Info label="Evidence Posture" value={displayEvidencePosture || 'Evidence posture pending'} />
                <Info label="Owner Visibility" value={displayOwnerVisibility || 'Owner visibility pending'} />
                <Info label="Continuity Outlook" value={displayContinuityOutlook || 'Continuity outlook pending'} />
                <Info label="Continuity Risk" value={displayContinuityRisk || 'Continuity risk pending'} />
                <Info label="Next Lifecycle State" value={selectedCase || lastPreservedCase ? lifecycleDecision.nextStatus : 'Continuity lifecycle advancement pending stabilization action governance.'} />
              </div>

              <div className="mt-6 rounded-2xl border border-neutral-800 bg-black p-5">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-400">
                  Lifecycle Boundary
                </h4>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  Routing is not action. Action is not outcome. Outcome is not
                  recovery.
                </p>
              </div>
            </section>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-black p-6">
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
            interpretation. Action evidence may support outcome verification, but
            it does not prove recovery.
          </p>
        </section>
      </section>
    </main>
  )
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

function ClimateCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-black p-5">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-neutral-400">{value}</p>
    </div>
  )
}

function MovementCard({
  title,
  movement,
  description,
}: {
  title: string
  movement: string
  description: string
}) {
  return (
    <article className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
      <p className="text-sm font-semibold text-amber-100">{title}</p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-amber-400">
        {movement}
      </p>
      <p className="mt-3 text-xs leading-5 text-neutral-400">{description}</p>
    </article>
  )
}

function SimplePanel({ title, value }: { title: string; value: string }) {
  return (
    <section className="mt-6 rounded-3xl border border-neutral-800 bg-black p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-neutral-300">{value}</p>
    </section>
  )
}

function mergeCases(items: StabilityCase[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values())
}

function findLatestRoutingAction(caseId: string, routingActions: RoutingAction[]) {
  return routingActions.find((item) => item.case_id === caseId)
}

function findLatestIntervention(
  caseId: string,
  interventions: InterventionRecord[],
) {
  return interventions.find((item) => item.case_id === caseId)
}

function hydrateInterventionEvidence(intervention?: InterventionRecord) {
  const source = intervention?.intervention_summary || ''

  return {
    actionMovement: extractBlockField(source, 'ACTION MOVEMENT'),
    actionTrajectory: extractBlockField(source, 'ACTION TRAJECTORY'),
    actionEvidencePosture: extractBlockField(source, 'ACTION EVIDENCE POSTURE'),
    ownerVisibility: extractBlockField(source, 'OWNER VISIBILITY'),
    continuityOutlook: extractBlockField(source, 'CONTINUITY OUTLOOK'),
    continuityRisk: extractBlockField(source, 'CONTINUITY RISK'),
    reviewTiming: extractBlockField(source, 'REVIEW TIMING'),
    actionType: extractBlockField(source, 'ACTION TYPE'),
    actionChannel: extractBlockField(source, 'ACTION CHANNEL'),
    governanceInterpretation: extractBlockField(
      source,
      'GOVERNANCE INTERPRETATION',
    ),
  }
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
  latestRouting?: RoutingAction,
): InheritedInterventionContext {
  const source = buildInterventionMemorySource(caseItem, latestRouting)
  const activeRoutingStatus = latestRouting?.routing_status || caseItem.case_status

  return {
    intakeIdentity: resolveIntakeIdentity(caseItem, source),
    routingPosture: resolveRoutingPosture(caseItem, source, latestRouting),
    interventionReadiness: resolveInterventionReadiness(
      caseItem,
      source,
      activeRoutingStatus,
    ),
    inheritedEvidencePosture: resolveInheritedEvidencePosture(
      caseItem,
      source,
      activeRoutingStatus,
    ),
    inheritedDriftSignal: resolveInheritedDriftSignal(
      caseItem,
      source,
      activeRoutingStatus,
    ),
    inheritedConvergenceSignal: resolveInheritedConvergenceSignal(
      caseItem,
      source,
      activeRoutingStatus,
    ),
    inheritedCommandMeaning: resolveInheritedCommandMeaning(
      caseItem,
      source,
      activeRoutingStatus,
    ),
    inheritedSurvivability: resolveInheritedSurvivability(
      caseItem,
      source,
      activeRoutingStatus,
    ),
    memorySource: resolveInterventionMemorySource(caseItem, latestRouting),
  }
}

function buildInterventionMemorySource(
  caseItem: StabilityCase,
  latestRouting?: RoutingAction,
) {
  return [
    latestRouting?.routing_reason,
    latestRouting?.routing_status,
    caseItem.continuity_memory,
    caseItem.latest_downstream_evidence,
    caseItem.outcome_summary,
    caseItem.intervention_summary,
  ]
    .filter(Boolean)
    .join('\n\n')
}

function resolveInterventionMemorySource(
  caseItem: StabilityCase,
  latestRouting?: RoutingAction,
) {
  if (latestRouting) return 'routing action ledger + routed case memory'
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

function resolveRoutingPosture(
  caseItem: StabilityCase,
  source: string,
  latestRouting?: RoutingAction,
) {
  if (latestRouting?.routing_status) return latestRouting.routing_status

  return (
    extractBlockField(source, 'ROUTING STATUS') ||
    extractBlockField(source, 'INHERITED ROUTING READINESS') ||
    resolveFallbackRoutingPosture(caseItem.case_status)
  )
}

function resolveFallbackRoutingPosture(activeStatus: string) {
  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return activeStatus.includes('RECURRENCE')
      ? 'Repeated governed routing direction has been established for stabilization action.'
      : 'Governed routing direction has been established for stabilization action.'
  }

  if (activeStatus.includes('INTERVENTION_ACTIVE')) {
    return 'Routing has progressed into active stabilization action governance.'
  }

  if (activeStatus.includes('INTERVENTION_RECORDED')) {
    return 'Routing memory has already produced preserved stabilization action evidence.'
  }

  if (activeStatus.includes('STABILIZING')) {
    return 'Routing direction is converting into stabilization movement.'
  }

  if (activeStatus.includes('ESCALATED')) {
    return 'Routing has escalated into executive stabilization visibility.'
  }

  return 'Routing posture requires governed stabilization action interpretation.'
}

function resolveInterventionReadiness(
  caseItem: StabilityCase,
  source: string,
  activeStatus: string,
) {
  return (
    extractBlockField(source, 'ACTION READINESS') ||
    resolveFallbackInterventionReadiness(caseItem, activeStatus)
  )
}

function resolveFallbackInterventionReadiness(
  caseItem: StabilityCase,
  activeStatus: string,
) {
  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return activeStatus.includes('RECURRENCE')
      ? 'ACTION_READY_AFTER_REPEATED_ROUTING_DIRECTION'
      : 'INTERVENTION_READY_FROM_ROUTING'
  }

  if (activeStatus.includes('INTERVENTION_ACTIVE')) {
    return 'INTERVENTION_ALREADY_ACTIVE'
  }

  if (activeStatus.includes('INTERVENTION_RECORDED')) {
    return 'INTERVENTION_EVIDENCE_ALREADY_PRESERVED'
  }

  if (activeStatus.includes('STABILIZING')) {
    return 'STABILIZATION_MOVEMENT_ALREADY_VISIBLE'
  }

  if (activeStatus.includes('ESCALATED') || caseItem.severity_level === 'CRITICAL') {
    return 'INTERVENTION_REQUIRES_EXECUTIVE_VISIBILITY'
  }

  return 'INTERVENTION_REQUIRES_ROUTING_DIRECTION'
}

function resolveInheritedEvidencePosture(
  caseItem: StabilityCase,
  source: string,
  activeStatus: string,
) {
  if (caseItem.evidence_posture) return caseItem.evidence_posture

  return (
    extractBlockField(source, 'INHERITED EVIDENCE POSTURE') ||
    extractBlockField(source, 'EVIDENCE POSTURE') ||
    resolveFallbackEvidencePosture(caseItem, activeStatus)
  )
}

function resolveFallbackEvidencePosture(
  caseItem: StabilityCase,
  activeStatus: string,
) {
  if (caseItem.latest_downstream_evidence) return caseItem.latest_downstream_evidence

  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return 'Routing evidence preserved; stabilization action evidence pending.'
  }

  if (activeStatus.includes('INTERVENTION_ACTIVE')) {
    return 'Action evidence is being governed; outcome evidence pending.'
  }

  if (activeStatus.includes('ESCALATED')) {
    return 'Escalation evidence remains visible before outcome verification.'
  }

  return 'Inherited routing evidence pending action governance.'
}

function resolveInheritedDriftSignal(
  caseItem: StabilityCase,
  source: string,
  activeStatus: string,
) {
  if (caseItem.drift_signal) return caseItem.drift_signal

  return (
    extractBlockField(source, 'INHERITED DRIFT SIGNAL') ||
    resolveFallbackDriftSignal(activeStatus)
  )
}

function resolveFallbackDriftSignal(activeStatus: string) {
  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED_RECURRENCE')) {
    return 'ROUTING_RECURRENCE_AFTER_DIRECTION_VISIBLE'
  }

  if (activeStatus.includes('ESCALATED')) {
    return 'ACTION_ESCALATION_DRIFT_VISIBLE'
  }

  if (activeStatus.includes('INTERVENTION_ACTIVE')) {
    return 'ACTION_DRIFT_MONITORING_ACTIVE'
  }

  return 'NO_ACTIVE_ACTION_DRIFT_VISIBLE'
}

function resolveInheritedConvergenceSignal(
  caseItem: StabilityCase,
  source: string,
  activeStatus: string,
) {
  if (caseItem.convergence_signal) return caseItem.convergence_signal

  return (
    extractBlockField(source, 'INHERITED CONVERGENCE SIGNAL') ||
    resolveFallbackConvergenceSignal(activeStatus)
  )
}

function resolveFallbackConvergenceSignal(activeStatus: string) {
  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED_RECURRENCE')) {
    return 'CONVERGENCE_BUILDING_THROUGH_REPEATED_OWNER_DIRECTION'
  }

  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return 'CONVERGENCE_READY_FOR_ACTION'
  }

  if (activeStatus.includes('STABILIZING')) {
    return 'CONVERGENCE_BUILDING_THROUGH_ACTION'
  }

  if (activeStatus.includes('ESCALATED')) {
    return 'CONVERGENCE_CONSTRAINED_BY_ESCALATION'
  }

  return 'CONVERGENCE_PENDING_ACTION_EVIDENCE'
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
  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED_RECURRENCE')) {
    return 'Repeated governed routing direction is visible; action evidence must now determine whether stabilization is becoming credible.'
  }

  if (caseItem.severity_level === 'CRITICAL') {
    return 'Critical routed instability requires accelerated stabilization action visibility.'
  }

  if (caseItem.safeguarding_flag) {
    return 'Safeguarding-sensitive routed instability requires protected action evidence and traceable owner movement.'
  }

  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
    return 'Routing direction is ready to become governed stabilization action.'
  }

  return 'Action governance should preserve command meaning inherited from routing.'
}

function resolveInheritedSurvivability(
  caseItem: StabilityCase,
  source: string,
  activeStatus: string,
) {
  if (caseItem.survivability_interpretation) {
    return caseItem.survivability_interpretation
  }

  return (
    extractBlockField(source, 'INHERITED SURVIVABILITY INTERPRETATION') ||
    resolveFallbackSurvivability(caseItem, activeStatus)
  )
}

function resolveFallbackSurvivability(
  caseItem: StabilityCase,
  activeStatus: string,
) {
  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED_RECURRENCE')) {
    return 'Survivability credibility may begin strengthening through repeated owner direction, but action evidence is required before stabilization confidence improves.'
  }

  if (caseItem.severity_level === 'CRITICAL') {
    return 'Survivability pressure remains high until action movement is preserved.'
  }

  if (caseItem.severity_level === 'HIGH' && caseItem.safeguarding_flag) {
    return 'High-pressure safeguarding pathway remains survivability-sensitive until action evidence strengthens.'
  }

  if (activeStatus.includes('STABILIZATION_OWNER_ROUTED')) {
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
  if (!input.hasActionEvidence) return input.inheritedContext.interventionReadiness

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
  if (!input.hasActionEvidence) return input.inheritedContext.inheritedSurvivability

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
  if (!input.hasActionEvidence) return input.inheritedContext.inheritedCommandMeaning

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
    <div className="min-w-0 rounded-2xl border border-neutral-800 bg-black p-4">
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
  options: { label: string; value: string }[]
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-2 w-full rounded-xl border border-neutral-700 bg-black px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
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