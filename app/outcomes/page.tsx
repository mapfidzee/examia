'use client'

import { useEffect, useMemo, useState } from 'react'
import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { evaluateOutcomeLifecycle } from '../../lib/lifecycleGovernance'
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
  intervention_summary: string | null
  outcome_summary: string | null
  created_at?: string | null
  updated_at?: string | null
}

type InterventionRecord = {
  id: string
  case_id: string
  intervention_type: string | null
  intervention_summary: string | null
  created_at?: string | null
}

type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
  created_at?: string | null
}

type InheritedOutcomeContext = {
  intakeIdentity: string
  routingPosture: string
  interventionReadiness: string
  actionMovement: string
  actionTrajectory: string
  actionEvidencePosture: string
  ownerVisibility: string
  actionConfidence: string
  inheritedDriftSignal: string
  inheritedConvergenceSignal: string
  inheritedCommandMeaning: string
  inheritedSurvivability: string
  memorySource: string
}

const OUTCOME_READY_STATUSES = [
  'INTERVENTION_ACTIVE',
  'INTERVENTION_RECORDED',
  'PARTIAL_STABILIZATION',
  'STABILIZING',
  'ESCALATED',
  'RECOVERY_MONITORING',
  'RECOVERY_MONITORING_ELIGIBLE',
  'FOLLOW_UP_REQUIRED',
  'CONTINUITY_RISK_ACTIVE',
  'STABILIZATION_OWNER_ROUTED',
  'STABILIZATION_OWNER_ROUTED_RECURRENCE',
  'ROUTING_RECURRENCE',
]

const VERIFICATION_RESULTS = [
  'VERIFIED_STABILIZATION',
  'PARTIAL_VERIFICATION',
  'STABILITY_BUILDING',
  'TRANSITIONAL_STABILITY',
  'RECURRENCE_DETECTED',
  'ACTION_INEFFECTIVE',
  'ESCALATION_REQUIRED',
]

const ACTION_IMPACTS = [
  'Action produced credible stabilization movement',
  'Action produced partial stabilization movement',
  'Action produced temporary improvement only',
  'Action strengthened continuity stabilization',
  'Action preserved continuity without escalation',
  'Action exposed recurrence after movement',
  'Action requires escalation before verification can continue',
]

const VERIFICATION_CREDIBILITIES = [
  'STRONG',
  'MODERATE',
  'BUILDING',
  'VARIABLE',
  'UNCERTAIN',
  'CONFLICTED',
]

const RECURRENCE_SIGNALS = [
  'NO_RECURRENCE_VISIBLE',
  'RECURRENCE_OBSERVATION',
  'RECURRENCE_PATTERN_VISIBLE',
  'RECURRENCE_DETECTED',
  'REPEATED_RECURRENCE',
]

const RECOVERY_READINESS = [
  'NOT_READY_FOR_RECOVERY',
  'RECOVERY_WATCH_ELIGIBLE',
  'RECOVERY_MONITORING_RECOMMENDED',
  'RECOVERY_TRANSITION_READY',
  'RECOVERY_BLOCKED',
]

const CONTINUITY_OUTLOOKS = [
  'STABLE',
  'STABILITY_BUILDING',
  'MONITOR',
  'TRANSITIONAL_STABILITY',
  'AT_RISK',
  'UNSTABLE',
  'ESCALATE',
  'HIGH_RISK',
]

const VERIFICATION_TRAJECTORIES = [
  'IMPROVING',
  'STABILITY_BUILDING',
  'HOLDING_WITH_VARIANCE',
  'TRANSITIONAL_STABILITY',
  'WEAKENING',
  'DESTABILIZING',
]

export default function OutcomesPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
        'INSTITUTION_COORDINATOR',
      ]}
    >
      <CGIGovernanceShell>
        <OutcomesContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function OutcomesContent() {
  const [cases, setCases] = useState<StabilityCase[]>([])
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [lastPreservedCaseId, setLastPreservedCaseId] = useState('')

  const [verificationResult, setVerificationResult] = useState('')
  const [actionImpact, setActionImpact] = useState('')
  const [verificationCredibility, setVerificationCredibility] = useState('')
  const [recurrenceSignal, setRecurrenceSignal] = useState('')
  const [recoveryReadiness, setRecoveryReadiness] = useState('')
  const [continuityOutlook, setContinuityOutlook] = useState('')
  const [verificationTrajectory, setVerificationTrajectory] = useState('')
  const [verificationInterpretation, setVerificationInterpretation] = useState('')

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    await Promise.all([loadCases(), loadInterventions(), loadOutcomes()])
  }

  async function loadCases() {
    const { data: interventionData, error: interventionError } = await supabase
      .from('case_interventions')
      .select('*')
      .order('created_at', { ascending: false })

    if (interventionError) console.error(interventionError)

    const interventionCaseIds = Array.from(
      new Set(
        (interventionData || []).map(
          (item: InterventionRecord) => item.case_id,
        ),
      ),
    )

    const directCasesQuery = supabase
      .from('beneficiary_cases')
      .select('*')
      .in('case_status', OUTCOME_READY_STATUSES)
      .order('created_at', { ascending: false })

    const interventionCasesQuery =
      interventionCaseIds.length > 0
        ? supabase
            .from('beneficiary_cases')
            .select('*')
            .in('id', interventionCaseIds)
            .order('created_at', { ascending: false })
        : null

    const [directCasesResult, interventionCasesResult] = await Promise.all([
      directCasesQuery,
      interventionCasesQuery || Promise.resolve({ data: [], error: null }),
    ])

    if (directCasesResult.error) console.error(directCasesResult.error)
    if (interventionCasesResult.error) console.error(interventionCasesResult.error)

    setCases(
      mergeCases([
        ...(directCasesResult.data || []),
        ...(interventionCasesResult.data || []),
      ]),
    )

    setInterventions(interventionData || [])
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

  async function loadOutcomes() {
    const { data, error } = await supabase
      .from('case_outcomes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setOutcomes(data || [])
  }

  const selectedCase = useMemo(
    () => cases.find((item) => item.id === selectedCaseId),
    [cases, selectedCaseId],
  )

  const lastPreservedCase = useMemo(
    () => cases.find((item) => item.id === lastPreservedCaseId),
    [cases, lastPreservedCaseId],
  )

  const activeCase = selectedCase || lastPreservedCase

  const selectedIntervention = useMemo(
    () =>
      selectedCase
        ? findLatestIntervention(selectedCase.id, interventions)
        : undefined,
    [selectedCase, interventions],
  )

  const lastPreservedIntervention = useMemo(
    () =>
      lastPreservedCase
        ? findLatestIntervention(lastPreservedCase.id, interventions)
        : undefined,
    [lastPreservedCase, interventions],
  )

  const activeIntervention = selectedIntervention || lastPreservedIntervention

  const selectedOutcome = useMemo(
    () => (selectedCase ? findLatestOutcome(selectedCase.id, outcomes) : undefined),
    [selectedCase, outcomes],
  )

  const lastPreservedOutcome = useMemo(
    () =>
      lastPreservedCase
        ? findLatestOutcome(lastPreservedCase.id, outcomes)
        : undefined,
    [lastPreservedCase, outcomes],
  )

  const activeOutcome = selectedOutcome || lastPreservedOutcome

  const inheritedContext = useMemo(
    () =>
      activeCase
        ? buildInheritedOutcomeContext(activeCase, activeIntervention)
        : buildEmptyInheritedOutcomeContext(),
    [activeCase, activeIntervention],
  )

  const hydratedOutcome = useMemo(
    () => hydrateOutcomeEvidence(activeOutcome),
    [activeOutcome],
  )

  const displayVerificationResult =
    verificationResult || hydratedOutcome.verificationResult || ''

  const displayActionImpact = actionImpact || hydratedOutcome.actionImpact || ''

  const displayVerificationCredibility =
    verificationCredibility ||
    hydratedOutcome.verificationCredibility ||
    'Verification credibility pending'

  const displayVerificationTrajectory =
    verificationTrajectory ||
    hydratedOutcome.verificationTrajectory ||
    'Verification trajectory pending'

  const displayRecurrenceSignal =
    recurrenceSignal || hydratedOutcome.recurrenceSignal || 'Recurrence signal pending'

  const displayRecoveryReadiness =
    recoveryReadiness ||
    hydratedOutcome.recoveryReadiness ||
    'Recovery readiness pending'

  const displayContinuityOutlook =
    continuityOutlook ||
    hydratedOutcome.continuityOutlook ||
    'Continuity outlook pending'

  const mappedOutcomeStatus = mapVerificationToLifecycleStatus({
    verificationResult: displayVerificationResult,
    recoveryReadiness: displayRecoveryReadiness,
    recurrenceSignal: displayRecurrenceSignal,
  })

  const lifecycleDecision = evaluateOutcomeLifecycle({
    outcomeStatus: mappedOutcomeStatus,
    continuityOutlook: displayContinuityOutlook,
  })

  const resolvedNextLifecycleState = resolveOutcomeLifecycleState({
    verificationResult: displayVerificationResult,
    verificationCredibility: displayVerificationCredibility,
    recurrenceSignal: displayRecurrenceSignal,
    recoveryReadiness: displayRecoveryReadiness,
    lifecycleNextStatus: lifecycleDecision.nextStatus,
  })

  const continuityClimate = buildContinuityClimate({
    outcomes,
    hasSelectedCase: Boolean(activeCase),
  })

  const commandPosture = buildCommandPosture({
    verificationResult: displayVerificationResult,
    verificationCredibility: displayVerificationCredibility,
    recurrenceSignal: displayRecurrenceSignal,
    recoveryReadiness: displayRecoveryReadiness,
    continuityOutlook: displayContinuityOutlook,
    verificationTrajectory: displayVerificationTrajectory,
    commandVisibility: lifecycleDecision.commandVisibility,
  })

  const stabilizationConfidence = buildStabilizationConfidence({
    verificationResult: displayVerificationResult,
    verificationCredibility: displayVerificationCredibility,
    recurrenceSignal: displayRecurrenceSignal,
    recoveryReadiness: displayRecoveryReadiness,
    continuityOutlook: displayContinuityOutlook,
    verificationTrajectory: displayVerificationTrajectory,
  })

  const survivabilitySignal = buildSurvivabilitySignal({
    verificationResult: displayVerificationResult,
    recurrenceSignal: displayRecurrenceSignal,
    continuityOutlook: displayContinuityOutlook,
    verificationTrajectory: displayVerificationTrajectory,
    recoveryReadiness: displayRecoveryReadiness,
  })

  const executiveMeaning = buildExecutiveVerificationMeaning({
    verificationResult: displayVerificationResult,
    actionImpact: displayActionImpact,
    verificationCredibility: displayVerificationCredibility,
    recurrenceSignal: displayRecurrenceSignal,
    recoveryReadiness: displayRecoveryReadiness,
    continuityOutlook: displayContinuityOutlook,
    verificationTrajectory: displayVerificationTrajectory,
    commandPosture,
    inheritedContext,
  })

  const verificationPressureMeaning = buildVerificationPressureMeaning({
    continuityClimate,
    recoveryReadiness: displayRecoveryReadiness,
    verificationTrajectory: displayVerificationTrajectory,
    hasSelectedCase: Boolean(activeCase),
  })

  function buildCaseLabel(caseItem: StabilityCase) {
    const latestIntervention = findLatestIntervention(caseItem.id, interventions)
    const latestOutcome = findLatestOutcome(caseItem.id, outcomes)
    const inherited = buildInheritedOutcomeContext(caseItem, latestIntervention)
    const activeStatus = latestOutcome
      ? 'VERIFICATION_EVIDENCE_PRESERVED'
      : latestIntervention
        ? 'ACTION_EVIDENCE_READY_FOR_VERIFICATION'
        : caseItem.case_status

    return `${inherited.intakeIdentity} • ${caseItem.support_domain} • ${activeStatus}`
  }

  function verificationSynthesis() {
    return `
INHERITED INTAKE IDENTITY
${inheritedContext.intakeIdentity}

INHERITED ROUTING POSTURE
${inheritedContext.routingPosture}

INHERITED INTERVENTION READINESS
${inheritedContext.interventionReadiness}

INHERITED ACTION MOVEMENT
${inheritedContext.actionMovement}

INHERITED ACTION TRAJECTORY
${inheritedContext.actionTrajectory}

INHERITED ACTION EVIDENCE POSTURE
${inheritedContext.actionEvidencePosture}

INHERITED OWNER VISIBILITY
${inheritedContext.ownerVisibility}

INHERITED ACTION CONFIDENCE
${inheritedContext.actionConfidence}

INHERITED DRIFT SIGNAL
${inheritedContext.inheritedDriftSignal}

INHERITED CONVERGENCE SIGNAL
${inheritedContext.inheritedConvergenceSignal}

INHERITED COMMAND MEANING
${inheritedContext.inheritedCommandMeaning}

INHERITED SURVIVABILITY INTERPRETATION
${inheritedContext.inheritedSurvivability}

VERIFICATION RESULT
${verificationResult || 'Verification evidence pending'}

ACTION IMPACT
${actionImpact || 'Operational impact pending'}

VERIFICATION CREDIBILITY
${verificationCredibility || 'Verification credibility pending'}

VERIFICATION TRAJECTORY
${verificationTrajectory || 'Verification trajectory pending'}

RECURRENCE SIGNAL
${recurrenceSignal || 'Recurrence signal pending'}

RECOVERY READINESS
${recoveryReadiness || 'Recovery readiness pending'}

CONTINUITY OUTLOOK
${continuityOutlook || 'Continuity outlook pending'}

COMMAND POSTURE
${commandPosture}

STABILIZATION CONFIDENCE
${stabilizationConfidence}

SURVIVABILITY SIGNAL
${survivabilitySignal}

EXECUTIVE MEANING
${executiveMeaning}

VERIFICATION PRESSURE
${verificationPressureMeaning}

NEXT LIFECYCLE STATE
${selectedCase ? resolvedNextLifecycleState : 'Continuity lifecycle advancement pending stabilization verification.'}

CASE SIGNAL
${selectedCase?.beneficiary_name || 'Executive continuity interpretation will activate after stabilization verification evidence is preserved.'}

STABILITY DOMAIN
${selectedCase?.support_domain || 'Continuity domain visibility pending verification assignment.'}

CURRENT CONTINUITY STATUS
${selectedCase?.case_status || 'Continuity posture pending verification review.'}

GOVERNANCE INTERPRETATION
${verificationInterpretation.trim() || 'No additional operational continuity interpretation entered.'}

LIFECYCLE BOUNDARY
Action is not outcome.
Outcome is not recovery.
Verification may support recovery monitoring,
but durable recovery must be confirmed separately.
    `.trim()
  }

  async function preserveVerificationIntelligence() {
    if (!selectedCaseId) {
      alert('Select a stability case.')
      return
    }

    if (
      !verificationResult ||
      !actionImpact ||
      !verificationCredibility ||
      !recurrenceSignal ||
      !recoveryReadiness ||
      !continuityOutlook ||
      !verificationTrajectory
    ) {
      alert('Complete all stabilization verification fields.')
      return
    }

    if (!selectedCase) {
      alert('Selected stability case could not be found.')
      return
    }

    setLoading(true)
    setMessage('')

    const summary = verificationSynthesis()

    const { error: outcomeError } = await supabase.from('case_outcomes').insert({
      case_id: selectedCaseId,
      outcome_status: verificationResult,
      outcome_summary: summary,
    })

    if (outcomeError) {
      alert(outcomeError.message)
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: resolvedNextLifecycleState,
        outcome_summary: summary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedCaseId)

    if (updateError) {
      alert(updateError.message)
      setLoading(false)
      return
    }

    const preservedCaseId = selectedCaseId

    setSelectedCaseId('')
    setVerificationResult('')
    setActionImpact('')
    setVerificationCredibility('')
    setRecurrenceSignal('')
    setRecoveryReadiness('')
    setContinuityOutlook('')
    setVerificationTrajectory('')
    setVerificationInterpretation('')
    setLastPreservedCaseId(preservedCaseId)

    setMessage(
      'Stabilization verification preserved. Intervention evidence, verification credibility, recovery monitoring eligibility, survivability posture, and lifecycle movement remain operationally visible.',
    )

    setLoading(false)

    await loadData()
  }

  const continuityPanels = [
    {
      title: 'Verification Stability Climate',
      value: continuityClimate.stabilityClimate,
    },
    {
      title: 'Continuity Verification Posture',
      value: continuityClimate.posture,
    },
    {
      title: 'Recurrence Pressure Distribution',
      value: continuityClimate.recurrence,
    },
    {
      title: 'Recovery Eligibility Landscape',
      value: continuityClimate.recoveryLandscape,
    },
  ]

  const synthesisRows = [
    ['INHERITED INTAKE IDENTITY', inheritedContext.intakeIdentity],
    ['INHERITED ROUTING POSTURE', inheritedContext.routingPosture],
    ['INHERITED INTERVENTION READINESS', inheritedContext.interventionReadiness],
    ['INHERITED ACTION MOVEMENT', inheritedContext.actionMovement],
    ['INHERITED ACTION TRAJECTORY', inheritedContext.actionTrajectory],
    ['INHERITED ACTION EVIDENCE POSTURE', inheritedContext.actionEvidencePosture],
    ['INHERITED OWNER VISIBILITY', inheritedContext.ownerVisibility],
    ['INHERITED ACTION CONFIDENCE', inheritedContext.actionConfidence],
    ['INHERITED DRIFT SIGNAL', inheritedContext.inheritedDriftSignal],
    ['INHERITED CONVERGENCE SIGNAL', inheritedContext.inheritedConvergenceSignal],
    ['INHERITED COMMAND MEANING', inheritedContext.inheritedCommandMeaning],
    ['INHERITED SURVIVABILITY', inheritedContext.inheritedSurvivability],
    ['VERIFICATION RESULT', displayVerificationResult || 'Verification evidence pending'],
    ['ACTION IMPACT', displayActionImpact || 'Operational impact pending'],
    ['VERIFICATION CREDIBILITY', displayVerificationCredibility],
    ['VERIFICATION TRAJECTORY', displayVerificationTrajectory],
    ['RECURRENCE SIGNAL', displayRecurrenceSignal],
    ['RECOVERY READINESS', displayRecoveryReadiness],
    ['CONTINUITY OUTLOOK', displayContinuityOutlook],
    ['COMMAND POSTURE', commandPosture],
    ['STABILIZATION CONFIDENCE', stabilizationConfidence],
    ['SURVIVABILITY SIGNAL', survivabilitySignal],
    ['EXECUTIVE MEANING', executiveMeaning],
    ['VERIFICATION PRESSURE', verificationPressureMeaning],
    [
      'NEXT LIFECYCLE STATE',
      activeCase
        ? resolvedNextLifecycleState
        : 'Continuity lifecycle advancement pending stabilization verification.',
    ],
    [
      'CASE SIGNAL',
      activeCase?.beneficiary_name ||
        'Executive continuity interpretation will activate after stabilization verification evidence is preserved.',
    ],
    [
      'STABILITY DOMAIN',
      activeCase?.support_domain ||
        'Continuity domain visibility pending verification assignment.',
    ],
    [
      'CURRENT CONTINUITY STATUS',
      activeCase?.case_status || 'Continuity posture pending verification review.',
    ],
    [
      'GOVERNANCE INTERPRETATION',
      verificationInterpretation.trim() ||
        hydratedOutcome.governanceInterpretation ||
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
          TSINAXA CGI • STABILIZATION VERIFICATION INTELLIGENCE
        </p>

        <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white">
            Stabilization Verification Intelligence
          </h2>

          <p className="mt-3 max-w-5xl text-sm leading-6 text-neutral-300">
            Confirm whether stabilization action is strengthening continuity,
            transitioning toward stability, remaining under proportional
            observation, weakening, recurring, or becoming eligible for recovery
            durability governance.
          </p>

          <p className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
            <span className="font-semibold">Boundary:</span> /outcomes verifies
            stabilization credibility. It does not automatically declare durable
            recovery, erase structural continuity memory, or remove survivability
            visibility.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {continuityPanels.map((panel) => (
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
            Verification Pressure Intelligence
          </h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {verificationPressureMeaning}
          </p>
        </div>

        {activeOutcome && (
          <section className="mt-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <h3 className="text-lg font-semibold text-emerald-100">
              Latest Preserved Verification Evidence
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Info
                label="Verification Result"
                value={hydratedOutcome.verificationResult || 'Not recorded'}
              />
              <Info
                label="Action Impact"
                value={hydratedOutcome.actionImpact || 'Not recorded'}
              />
              <Info
                label="Verification Credibility"
                value={hydratedOutcome.verificationCredibility || 'Not recorded'}
              />
              <Info
                label="Recurrence Signal"
                value={hydratedOutcome.recurrenceSignal || 'Not recorded'}
              />
              <Info
                label="Recovery Readiness"
                value={hydratedOutcome.recoveryReadiness || 'Not recorded'}
              />
              <Info
                label="Continuity Outlook"
                value={hydratedOutcome.continuityOutlook || 'Not recorded'}
              />
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold text-white">
              Preserve Verification Evidence
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Use this after stabilization action has occurred. Preserve inherited
              action evidence, continuity credibility, recurrence visibility,
              recovery eligibility, survivability relevance, and executive
              continuity interpretation.
            </p>

            <div className="mt-6 space-y-5">
              <Select
                label="Stability Case"
                placeholder={
                  cases.length === 0
                    ? 'No outcome-ready cases found'
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
                    Inherited Action Evidence
                  </p>

                  <div className="mt-4 grid gap-3">
                    <Info label="Memory Source" value={inheritedContext.memorySource} />
                    <Info
                      label="Inherited Intake Identity"
                      value={inheritedContext.intakeIdentity}
                    />
                    <Info
                      label="Inherited Routing Posture"
                      value={inheritedContext.routingPosture}
                    />
                    <Info
                      label="Action Movement"
                      value={inheritedContext.actionMovement}
                    />
                    <Info
                      label="Action Trajectory"
                      value={inheritedContext.actionTrajectory}
                    />
                    <Info
                      label="Action Evidence Posture"
                      value={inheritedContext.actionEvidencePosture}
                    />
                    <Info
                      label="Owner Visibility"
                      value={inheritedContext.ownerVisibility}
                    />
                    <Info
                      label="Action Confidence"
                      value={inheritedContext.actionConfidence}
                    />
                    <Info
                      label="Inherited Survivability"
                      value={inheritedContext.inheritedSurvivability}
                    />
                  </div>
                </section>
              )}

              <Select
                label="Verification Result"
                placeholder="Select verification result"
                value={verificationResult}
                setValue={setVerificationResult}
                options={VERIFICATION_RESULTS.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Action Impact"
                placeholder="Select action impact"
                value={actionImpact}
                setValue={setActionImpact}
                options={ACTION_IMPACTS.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Verification Credibility"
                placeholder="Select verification credibility"
                value={verificationCredibility}
                setValue={setVerificationCredibility}
                options={VERIFICATION_CREDIBILITIES.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Verification Trajectory"
                placeholder="Select verification trajectory"
                value={verificationTrajectory}
                setValue={setVerificationTrajectory}
                options={VERIFICATION_TRAJECTORIES.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Recurrence Signal"
                placeholder="Select recurrence signal"
                value={recurrenceSignal}
                setValue={setRecurrenceSignal}
                options={RECURRENCE_SIGNALS.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Recovery Readiness"
                placeholder="Select recovery readiness"
                value={recoveryReadiness}
                setValue={setRecoveryReadiness}
                options={RECOVERY_READINESS.map((item) => ({
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

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Verification Interpretation
                </span>

                <textarea
                  value={verificationInterpretation}
                  onChange={(event) =>
                    setVerificationInterpretation(event.target.value)
                  }
                  rows={5}
                  placeholder="Use operational facts only. Preserve action evidence, continuity credibility, recurrence visibility, recovery eligibility, survivability relevance, and executive continuity interpretation."
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                />
              </label>

              <button
                onClick={preserveVerificationIntelligence}
                disabled={loading}
                className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {loading
                  ? 'Preserving Verification Intelligence...'
                  : 'Preserve Stabilization Verification'}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold text-white">
              Executive Verification Synthesis
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              This synthesis evaluates whether stabilization credibility is
              strengthening, transitioning toward continuity stability, weakening,
              recurring, escalating, or becoming eligible for recovery durability
              governance.
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
                Action is not outcome. Outcome is not recovery. Verification may
                support recovery monitoring, but durable recovery must still be
                confirmed separately.
              </p>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-xl font-semibold text-white">
            Verification Doctrine
          </h3>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Stabilization verification is a credibility process, not a completion
            label. CGI does not assume continuity durability simply because action
            movement appears positive. Verification credibility, recurrence
            visibility, continuity outlook, survivability relevance, and recovery
            eligibility must remain operationally visible before lifecycle movement
            advances.
          </p>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature verification intelligence must preserve proportional continuity
            interpretation. When stabilization evidence strengthens without
            recurrence, escalation concentration, weakening trajectory, or
            structural deterioration, the system should support measured continuity
            confidence while preserving structural memory, executive traceability,
            and recovery durability governance visibility.
          </p>
        </section>
      </section>
    </main>
  )
}

function mergeCases(items: StabilityCase[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values())
}

function findLatestIntervention(
  caseId: string,
  interventions: InterventionRecord[],
) {
  return interventions.find((item) => item.case_id === caseId)
}

function findLatestOutcome(caseId: string, outcomes: OutcomeRecord[]) {
  return outcomes.find((item) => item.case_id === caseId)
}

function buildEmptyInheritedOutcomeContext(): InheritedOutcomeContext {
  return {
    intakeIdentity:
      'Inherited intake identity will activate after an intervention-ready case is selected.',
    routingPosture:
      'Inherited routing posture pending selected intervention evidence.',
    interventionReadiness:
      'Inherited intervention readiness pending selected action evidence.',
    actionMovement:
      'Inherited action movement pending selected intervention evidence.',
    actionTrajectory:
      'Inherited action trajectory pending selected intervention evidence.',
    actionEvidencePosture:
      'Inherited action evidence posture pending selected intervention evidence.',
    ownerVisibility:
      'Inherited owner visibility pending selected intervention evidence.',
    actionConfidence:
      'Inherited action confidence pending selected intervention evidence.',
    inheritedDriftSignal:
      'Inherited drift signal pending selected intervention evidence.',
    inheritedConvergenceSignal:
      'Inherited convergence signal pending selected intervention evidence.',
    inheritedCommandMeaning:
      'Inherited command meaning pending selected intervention evidence.',
    inheritedSurvivability:
      'Inherited survivability interpretation pending selected intervention evidence.',
    memorySource:
      'Inherited intervention memory pending selected outcome-ready case.',
  }
}

function buildInheritedOutcomeContext(
  caseItem: StabilityCase,
  intervention?: InterventionRecord,
): InheritedOutcomeContext {
  const source = buildOutcomeMemorySource(caseItem, intervention)

  return {
    intakeIdentity:
      extractBlockField(source, 'INHERITED INTAKE IDENTITY') ||
      caseItem.beneficiary_name,
    routingPosture:
      extractBlockField(source, 'INHERITED ROUTING POSTURE') ||
      'Routing posture inherited through intervention evidence.',
    interventionReadiness:
      extractBlockField(source, 'INTERVENTION READINESS') ||
      'Intervention evidence preserved for verification.',
    actionMovement:
      extractBlockField(source, 'ACTION MOVEMENT') ||
      'Action movement not yet preserved.',
    actionTrajectory:
      extractBlockField(source, 'ACTION TRAJECTORY') ||
      'Action trajectory not yet preserved.',
    actionEvidencePosture:
      extractBlockField(source, 'ACTION EVIDENCE POSTURE') ||
      'Action evidence posture not yet preserved.',
    ownerVisibility:
      extractBlockField(source, 'OWNER VISIBILITY') ||
      'Owner visibility not yet preserved.',
    actionConfidence:
      extractBlockField(source, 'ACTION CONFIDENCE') ||
      'Action confidence not yet preserved.',
    inheritedDriftSignal:
      extractBlockField(source, 'INHERITED DRIFT SIGNAL') ||
      'Inherited drift signal pending verification.',
    inheritedConvergenceSignal:
      extractBlockField(source, 'INHERITED CONVERGENCE SIGNAL') ||
      'Inherited convergence signal pending verification.',
    inheritedCommandMeaning:
      extractBlockField(source, 'INHERITED COMMAND MEANING') ||
      extractBlockField(source, 'EXECUTIVE MEANING') ||
      'Inherited command meaning pending verification.',
    inheritedSurvivability:
      extractBlockField(source, 'INHERITED SURVIVABILITY INTERPRETATION') ||
      extractBlockField(source, 'INHERITED SURVIVABILITY') ||
      extractBlockField(source, 'SURVIVABILITY SIGNAL') ||
      'Inherited survivability interpretation pending verification.',
    memorySource: intervention
      ? 'intervention action evidence + case memory'
      : 'case intervention summary',
  }
}

function buildOutcomeMemorySource(
  caseItem: StabilityCase,
  intervention?: InterventionRecord,
) {
  return [
    intervention?.intervention_summary,
    caseItem.intervention_summary,
    caseItem.outcome_summary,
  ]
    .filter(Boolean)
    .join('\n\n')
}

function hydrateOutcomeEvidence(outcome?: OutcomeRecord) {
  const source = outcome?.outcome_summary || ''

  return {
    verificationResult: extractBlockField(source, 'VERIFICATION RESULT'),
    actionImpact: extractBlockField(source, 'ACTION IMPACT'),
    verificationCredibility: extractBlockField(source, 'VERIFICATION CREDIBILITY'),
    verificationTrajectory: extractBlockField(source, 'VERIFICATION TRAJECTORY'),
    recurrenceSignal: extractBlockField(source, 'RECURRENCE SIGNAL'),
    recoveryReadiness: extractBlockField(source, 'RECOVERY READINESS'),
    continuityOutlook: extractBlockField(source, 'CONTINUITY OUTLOOK'),
    governanceInterpretation: extractBlockField(source, 'GOVERNANCE INTERPRETATION'),
  }
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

function buildContinuityClimate({
  outcomes,
  hasSelectedCase,
}: {
  outcomes: OutcomeRecord[]
  hasSelectedCase: boolean
}) {
  if (!hasSelectedCase) {
    return {
      stabilityClimate:
        'Awaiting stabilization verification evidence before continuity climate interpretation activates.',
      posture:
        'Continuity verification posture will activate after stabilization evidence becomes operationally visible.',
      recurrence:
        'Recurrence visibility interpretation pending stabilization verification evidence.',
      recoveryLandscape:
        'Recovery durability eligibility visibility pending stabilization verification progression.',
    }
  }

  const recurrenceCount = outcomes.filter((item) =>
    item.outcome_summary?.includes('RECURRENCE'),
  ).length

  const escalationCount = outcomes.filter((item) =>
    item.outcome_summary?.includes('ESCALATION'),
  ).length

  const recoveryEligibleCount = outcomes.filter(
    (item) =>
      item.outcome_summary?.includes('RECOVERY_WATCH_ELIGIBLE') ||
      item.outcome_summary?.includes('RECOVERY_MONITORING_RECOMMENDED') ||
      item.outcome_summary?.includes('RECOVERY_TRANSITION_READY'),
  ).length

  return {
    stabilityClimate:
      recurrenceCount === 0
        ? 'Continuity stabilization conditions remain proportionally balanced under current verification observation.'
        : 'Some continuity variability remains operationally visible within current verification conditions.',
    posture:
      escalationCount === 0
        ? 'Verification posture remains operationally manageable without concentrated executive escalation.'
        : 'Executive continuity review visibility remains active due to escalation concentration.',
    recurrence:
      recurrenceCount === 0
        ? 'No concentrated recurrence pattern currently requiring escalation visibility.'
        : 'Recurrence visibility remains operationally active across some continuity pathways.',
    recoveryLandscape:
      recoveryEligibleCount === 0
        ? 'Recovery durability eligibility remains limited under current continuity verification conditions.'
        : 'Some stabilization outcomes are becoming eligible for recovery durability governance.',
  }
}

function mapVerificationToLifecycleStatus(input: {
  verificationResult: string
  recoveryReadiness: string
  recurrenceSignal: string
}) {
  if (
    input.verificationResult === 'VERIFIED_STABILIZATION' &&
    input.recurrenceSignal === 'NO_RECURRENCE_VISIBLE' &&
    (input.recoveryReadiness === 'RECOVERY_MONITORING_RECOMMENDED' ||
      input.recoveryReadiness === 'RECOVERY_WATCH_ELIGIBLE' ||
      input.recoveryReadiness === 'RECOVERY_TRANSITION_READY')
  ) {
    return 'RECOVERY_MONITORING'
  }

  if (input.verificationResult === 'VERIFIED_STABILIZATION') {
    return 'RECOVERY_MONITORING_ELIGIBLE'
  }

  if (
    input.verificationResult === 'STABILITY_BUILDING' ||
    input.verificationResult === 'TRANSITIONAL_STABILITY'
  ) {
    return 'PARTIAL_STABILIZATION'
  }

  if (input.verificationResult === 'PARTIAL_VERIFICATION') {
    return 'FOLLOW_UP_REQUIRED'
  }

  if (
    input.verificationResult === 'RECURRENCE_DETECTED' ||
    input.verificationResult === 'ACTION_INEFFECTIVE'
  ) {
    return 'CONTINUITY_RISK_ACTIVE'
  }

  if (input.verificationResult === 'ESCALATION_REQUIRED') {
    return 'ESCALATION_REQUIRED'
  }

  return 'PARTIAL_STABILIZATION'
}

function resolveOutcomeLifecycleState(input: {
  verificationResult: string
  verificationCredibility: string
  recurrenceSignal: string
  recoveryReadiness: string
  lifecycleNextStatus: string
}) {
  if (
    input.verificationResult === 'VERIFIED_STABILIZATION' &&
    input.verificationCredibility === 'STRONG' &&
    input.recurrenceSignal === 'NO_RECURRENCE_VISIBLE' &&
    input.recoveryReadiness === 'RECOVERY_MONITORING_RECOMMENDED'
  ) {
    return 'RECOVERY_MONITORING'
  }

  if (
    input.verificationResult === 'VERIFIED_STABILIZATION' &&
    input.lifecycleNextStatus === 'STABILIZED'
  ) {
    return 'RECOVERY_MONITORING_ELIGIBLE'
  }

  if (input.lifecycleNextStatus === 'STABILIZED') {
    return 'RECOVERY_MONITORING_ELIGIBLE'
  }

  return input.lifecycleNextStatus
}

function buildCommandPosture(input: {
  verificationResult: string
  verificationCredibility: string
  recurrenceSignal: string
  recoveryReadiness: string
  continuityOutlook: string
  verificationTrajectory: string
  commandVisibility: boolean
}) {
  if (
    input.verificationResult === 'ESCALATION_REQUIRED' ||
    input.continuityOutlook === 'HIGH_RISK'
  ) {
    return 'URGENT_CONTINUITY_REVIEW'
  }

  if (
    input.recurrenceSignal === 'REPEATED_RECURRENCE' ||
    input.verificationResult === 'RECURRENCE_DETECTED'
  ) {
    return 'EXECUTIVE_CONTINUITY_REVIEW'
  }

  if (
    input.verificationTrajectory === 'DESTABILIZING' ||
    input.verificationTrajectory === 'WEAKENING'
  ) {
    return 'ELEVATED_VERIFICATION_REVIEW'
  }

  if (
    input.verificationTrajectory === 'TRANSITIONAL_STABILITY' ||
    input.verificationTrajectory === 'HOLDING_WITH_VARIANCE'
  ) {
    return 'CONTINUITY_OBSERVATION'
  }

  if (input.verificationTrajectory === 'STABILITY_BUILDING') {
    return 'STABILITY_HOLDING'
  }

  if (
    input.verificationResult === 'VERIFIED_STABILIZATION' &&
    input.verificationCredibility === 'STRONG' &&
    input.recurrenceSignal === 'NO_RECURRENCE_VISIBLE'
  ) {
    return 'RECOVERY_MONITORING_VISIBILITY'
  }

  if (input.commandVisibility) return 'COMMAND_VISIBILITY_ACTIVE'

  return 'STABLE_CONTINUITY_VISIBILITY'
}

function buildStabilizationConfidence(input: {
  verificationResult: string
  verificationCredibility: string
  recurrenceSignal: string
  recoveryReadiness: string
  continuityOutlook: string
  verificationTrajectory: string
}) {
  if (input.verificationResult === 'ESCALATION_REQUIRED') return 'DESTABILIZING'

  if (
    input.verificationResult === 'RECURRENCE_DETECTED' ||
    input.recurrenceSignal === 'RECURRENCE_DETECTED' ||
    input.recurrenceSignal === 'REPEATED_RECURRENCE'
  ) {
    return 'WEAKENING'
  }

  if (
    input.verificationResult === 'VERIFIED_STABILIZATION' &&
    input.verificationCredibility === 'STRONG' &&
    input.recurrenceSignal === 'NO_RECURRENCE_VISIBLE'
  ) {
    return 'CREDIBLE'
  }

  if (
    input.verificationTrajectory === 'STABILITY_BUILDING' ||
    input.verificationCredibility === 'STRONG'
  ) {
    return 'BUILDING'
  }

  if (input.verificationTrajectory === 'TRANSITIONAL_STABILITY') return 'BUILDING'

  return 'VARIABLE'
}

function buildSurvivabilitySignal(input: {
  verificationResult: string
  recurrenceSignal: string
  continuityOutlook: string
  verificationTrajectory: string
  recoveryReadiness: string
}) {
  if (
    input.verificationResult === 'ESCALATION_REQUIRED' ||
    input.continuityOutlook === 'HIGH_RISK'
  ) {
    return 'SURVIVABILITY_PRESSURE_RISING'
  }

  if (
    input.recurrenceSignal === 'REPEATED_RECURRENCE' ||
    input.recurrenceSignal === 'RECURRENCE_DETECTED'
  ) {
    return 'RECURRENCE_REQUIRES_VISIBILITY'
  }

  if (
    input.recoveryReadiness === 'RECOVERY_WATCH_ELIGIBLE' ||
    input.recoveryReadiness === 'RECOVERY_TRANSITION_READY' ||
    input.recoveryReadiness === 'RECOVERY_MONITORING_RECOMMENDED'
  ) {
    return 'RECOVERY_DURABILITY_OBSERVATION_SUPPORTED'
  }

  if (
    input.verificationTrajectory === 'STABILITY_BUILDING' ||
    input.continuityOutlook === 'STABLE'
  ) {
    return 'SURVIVABILITY_BACKGROUND_STABLE'
  }

  return 'CONTINUITY_VARIABILITY_REMAINS_VISIBLE'
}

function buildExecutiveVerificationMeaning(input: {
  verificationResult: string
  actionImpact: string
  verificationCredibility: string
  recurrenceSignal: string
  recoveryReadiness: string
  continuityOutlook: string
  verificationTrajectory: string
  commandPosture: string
  inheritedContext: InheritedOutcomeContext
}) {
  if (!input.verificationResult) {
    return 'Executive continuity interpretation will activate after stabilization verification evidence is preserved.'
  }

  if (input.commandPosture === 'URGENT_CONTINUITY_REVIEW') {
    return 'Verification evidence indicates continuity deterioration requiring urgent executive continuity visibility.'
  }

  if (input.commandPosture === 'EXECUTIVE_CONTINUITY_REVIEW') {
    return 'Verification evidence indicates recurrence visibility requiring elevated executive continuity review.'
  }

  if (input.commandPosture === 'ELEVATED_VERIFICATION_REVIEW') {
    return 'Verification conditions remain variable and require proportional continuity observation.'
  }

  if (input.commandPosture === 'CONTINUITY_OBSERVATION') {
    return 'Continuity stabilization is holding with manageable variability under current verification observation conditions.'
  }

  if (input.commandPosture === 'RECOVERY_MONITORING_VISIBILITY') {
    return 'Verification evidence supports recovery monitoring visibility while preserving the boundary that durable recovery must still be confirmed separately.'
  }

  if (
    input.commandPosture === 'STABILITY_HOLDING' ||
    input.commandPosture === 'STABLE_CONTINUITY_VISIBILITY'
  ) {
    return 'Verification evidence supports strengthening continuity credibility while preserving structural continuity visibility.'
  }

  return input.inheritedContext.inheritedCommandMeaning
}

function buildVerificationPressureMeaning(input: {
  continuityClimate: {
    stabilityClimate: string
    posture: string
    recurrence: string
    recoveryLandscape: string
  }
  recoveryReadiness: string
  verificationTrajectory: string
  hasSelectedCase: boolean
}) {
  if (!input.hasSelectedCase) {
    return 'Verification continuity interpretation will activate after stabilization evidence becomes operationally visible.'
  }

  if (
    input.verificationTrajectory === 'STABILITY_BUILDING' ||
    input.verificationTrajectory === 'IMPROVING'
  ) {
    return 'Verification continuity conditions remain proportionally stable while continuity confidence continues to mature.'
  }

  if (
    input.recoveryReadiness === 'RECOVERY_WATCH_ELIGIBLE' ||
    input.recoveryReadiness === 'RECOVERY_TRANSITION_READY' ||
    input.recoveryReadiness === 'RECOVERY_MONITORING_RECOMMENDED'
  ) {
    return 'Some stabilization pathways are becoming eligible for recovery durability governance observation.'
  }

  return 'Verification continuity observation remains proportionally active under current operational conditions.'
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm leading-6 text-neutral-100">
        {value}
      </p>
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