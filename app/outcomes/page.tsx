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

type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
  created_at?: string | null
}

const OUTCOME_READY_STATUSES = [
  'INTERVENTION_ACTIVE',
  'INTERVENTION_RECORDED',
  'PARTIAL_STABILIZATION',
  'STABILIZING',
  'ESCALATED',
  'RECOVERY_MONITORING',
  'FOLLOW_UP_REQUIRED',
  'CONTINUITY_RISK_ACTIVE',
  'STABILIZATION_OWNER_ROUTED',
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
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])

  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [verificationResult, setVerificationResult] = useState('')
  const [actionImpact, setActionImpact] = useState('')
  const [verificationCredibility, setVerificationCredibility] =
    useState('BUILDING')

  const [recurrenceSignal, setRecurrenceSignal] =
    useState('RECURRENCE_OBSERVATION')

  const [recoveryReadiness, setRecoveryReadiness] =
    useState('NOT_READY_FOR_RECOVERY')

  const [continuityOutlook, setContinuityOutlook] =
    useState('STABILITY_BUILDING')

  const [verificationTrajectory, setVerificationTrajectory] =
    useState('HOLDING_WITH_VARIANCE')

  const [verificationInterpretation, setVerificationInterpretation] =
    useState('')

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCases()
    loadOutcomes()
  }, [])

  async function loadCases() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .in('case_status', OUTCOME_READY_STATUSES)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setCases(data || [])
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

  const selectedCase = useMemo(() => {
    return cases.find((item) => item.id === selectedCaseId)
  }, [cases, selectedCaseId])

  const mappedOutcomeStatus =
    mapVerificationToLifecycleStatus(verificationResult)

  const lifecycleDecision = evaluateOutcomeLifecycle({
    outcomeStatus: mappedOutcomeStatus,
    continuityOutlook,
  })

  const continuityClimate =
    buildContinuityClimate(outcomes)

  const commandPosture = buildCommandPosture({
    verificationResult,
    verificationCredibility,
    recurrenceSignal,
    recoveryReadiness,
    continuityOutlook,
    verificationTrajectory,
    commandVisibility:
      lifecycleDecision.commandVisibility,
  })

  const stabilizationConfidence =
    buildStabilizationConfidence({
      verificationResult,
      verificationCredibility,
      recurrenceSignal,
      recoveryReadiness,
      continuityOutlook,
      verificationTrajectory,
    })

  const survivabilitySignal =
    buildSurvivabilitySignal({
      verificationResult,
      recurrenceSignal,
      continuityOutlook,
      verificationTrajectory,
      recoveryReadiness,
    })

  const executiveMeaning =
    buildExecutiveVerificationMeaning({
      verificationResult,
      actionImpact,
      verificationCredibility,
      recurrenceSignal,
      recoveryReadiness,
      continuityOutlook,
      verificationTrajectory,
      commandPosture,
    })

  const verificationPressureMeaning =
    buildVerificationPressureMeaning({
      continuityClimate,
      recoveryReadiness,
      verificationTrajectory,
    })

  function buildCaseLabel(caseItem: StabilityCase) {
    return `${caseItem.beneficiary_name} • ${caseItem.support_domain} • ${caseItem.case_status}`
  }

  function verificationSynthesis() {
    return `
VERIFICATION RESULT
${verificationResult || 'Verification evidence pending'}

ACTION IMPACT
${actionImpact || 'Operational impact pending'}

VERIFICATION CREDIBILITY
${verificationCredibility}

VERIFICATION TRAJECTORY
${verificationTrajectory}

RECURRENCE SIGNAL
${recurrenceSignal}

RECOVERY READINESS
${recoveryReadiness}

CONTINUITY OUTLOOK
${continuityOutlook}

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
${
  selectedCase
    ? lifecycleDecision.nextStatus
    : 'Continuity lifecycle advancement pending stabilization verification.'
}

CASE SIGNAL
${
  selectedCase?.beneficiary_name ||
  'Executive continuity interpretation will activate after stabilization verification evidence is preserved.'
}

STABILITY DOMAIN
${
  selectedCase?.support_domain ||
  'Continuity domain visibility pending verification assignment.'
}

CURRENT CONTINUITY STATUS
${
  selectedCase?.case_status ||
  'Continuity posture pending verification review.'
}

GOVERNANCE INTERPRETATION
${
  verificationInterpretation.trim() ||
  'No additional operational continuity interpretation entered.'
}

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

    const { error: outcomeError } = await supabase
      .from('case_outcomes')
      .insert({
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
        case_status: lifecycleDecision.nextStatus,
        outcome_summary: summary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedCaseId)

    if (updateError) {
      alert(updateError.message)
      setLoading(false)
      return
    }

    setSelectedCaseId('')
    setVerificationResult('')
    setActionImpact('')
    setVerificationCredibility('BUILDING')
    setRecurrenceSignal('RECURRENCE_OBSERVATION')
    setRecoveryReadiness('NOT_READY_FOR_RECOVERY')
    setContinuityOutlook('STABILITY_BUILDING')
    setVerificationTrajectory('HOLDING_WITH_VARIANCE')
    setVerificationInterpretation('')

    setMessage(
      'Stabilization verification preserved. Continuity interpretation, recovery eligibility visibility, survivability posture, and lifecycle movement have been updated.',
    )

    setLoading(false)

    await loadCases()
    await loadOutcomes()
  }

  const continuityPanels = [
    {
      title: 'Verification Stability Climate',
      value:
        continuityClimate.stabilityClimate,
    },
    {
      title: 'Continuity Verification Posture',
      value:
        continuityClimate.posture,
    },
    {
      title: 'Recurrence Pressure Distribution',
      value:
        continuityClimate.recurrence,
    },
    {
      title: 'Recovery Eligibility Landscape',
      value:
        continuityClimate.recoveryLandscape,
    },
  ]

  const synthesisRows = [
    ['VERIFICATION RESULT', verificationResult],
    ['ACTION IMPACT', actionImpact],
    ['VERIFICATION CREDIBILITY', verificationCredibility],
    ['VERIFICATION TRAJECTORY', verificationTrajectory],
    ['RECURRENCE SIGNAL', recurrenceSignal],
    ['RECOVERY READINESS', recoveryReadiness],
    ['CONTINUITY OUTLOOK', continuityOutlook],
    ['COMMAND POSTURE', commandPosture],
    ['STABILIZATION CONFIDENCE', stabilizationConfidence],
    ['SURVIVABILITY SIGNAL', survivabilitySignal],
    ['EXECUTIVE MEANING', executiveMeaning],
    ['VERIFICATION PRESSURE', verificationPressureMeaning],
    [
      'NEXT LIFECYCLE STATE',
      selectedCase
        ? lifecycleDecision.nextStatus
        : 'Continuity lifecycle advancement pending stabilization verification.',
    ],
    [
      'CASE SIGNAL',
      selectedCase?.beneficiary_name ||
        'Executive continuity interpretation will activate after stabilization verification evidence is preserved.',
    ],
    [
      'STABILITY DOMAIN',
      selectedCase?.support_domain ||
        'Continuity domain visibility pending verification assignment.',
    ],
    [
      'CURRENT CONTINUITY STATUS',
      selectedCase?.case_status ||
        'Continuity posture pending verification review.',
    ],
    [
      'GOVERNANCE INTERPRETATION',
      verificationInterpretation.trim() ||
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
            transitioning toward stability,
            remaining under proportional observation,
            weakening,
            recurring,
            or becoming eligible for recovery durability governance.
          </p>

          <p className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
            <span className="font-semibold">Boundary:</span>{' '}
            /outcomes verifies stabilization credibility.
            It does not automatically declare durable recovery,
            erase structural continuity memory,
            or remove survivability visibility.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {continuityPanels.map((panel) => (
            <div
              key={panel.title}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
            >
              <p className="text-sm font-semibold text-white">
                {panel.title}
              </p>

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

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">

          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold text-white">
              Preserve Verification Evidence
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Use this after stabilization action has occurred.
              Preserve continuity credibility,
              recurrence visibility,
              recovery eligibility,
              survivability relevance,
              and executive continuity interpretation.
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
                    setVerificationInterpretation(
                      event.target.value,
                    )
                  }
                  rows={5}
                  placeholder="Use operational facts only. Preserve continuity credibility, recurrence visibility, recovery eligibility, survivability relevance, and executive continuity interpretation."
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
              This synthesis evaluates whether stabilization credibility is strengthening,
              transitioning toward continuity stability,
              weakening,
              recurring,
              escalating,
              or becoming eligible for recovery durability governance.
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

                  <p className="text-sm leading-6 text-neutral-100">
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
                Action is not outcome.
                Outcome is not recovery.
                Verification may support recovery monitoring,
                but durable recovery must still be confirmed separately.
              </p>
            </div>

          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">

          <h3 className="text-xl font-semibold text-white">
            Verification Doctrine
          </h3>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Stabilization verification is a credibility process,
            not a completion label.
            CGI does not assume continuity durability simply because
            action movement appears positive.
            Verification credibility,
            recurrence visibility,
            continuity outlook,
            survivability relevance,
            and recovery eligibility
            must remain operationally visible before lifecycle movement advances.
          </p>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature verification intelligence must preserve proportional continuity interpretation.
            When stabilization evidence strengthens without recurrence,
            escalation concentration,
            weakening trajectory,
            or structural deterioration,
            the system should support measured continuity confidence while preserving
            structural memory,
            executive traceability,
            and recovery durability governance visibility.
          </p>

        </section>

      </section>
    </main>
  )
}

function buildContinuityClimate(
  outcomes: OutcomeRecord[],
) {
  const recurrenceCount = outcomes.filter(
    (item) =>
      item.outcome_summary?.includes(
        'RECURRENCE',
      ),
  ).length

  const escalationCount = outcomes.filter(
    (item) =>
      item.outcome_summary?.includes(
        'ESCALATION',
      ),
  ).length

  const recoveryEligibleCount = outcomes.filter(
    (item) =>
      item.outcome_summary?.includes(
        'RECOVERY_WATCH_ELIGIBLE',
      ) ||
      item.outcome_summary?.includes(
        'RECOVERY_MONITORING_RECOMMENDED',
      ),
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

function mapVerificationToLifecycleStatus(
  verificationResult: string,
) {
  if (
    verificationResult ===
    'VERIFIED_STABILIZATION'
  ) {
    return 'STABILIZED'
  }

  if (
    verificationResult ===
      'STABILITY_BUILDING' ||
    verificationResult ===
      'TRANSITIONAL_STABILITY'
  ) {
    return 'PARTIAL_STABILIZATION'
  }

  if (
    verificationResult ===
    'PARTIAL_VERIFICATION'
  ) {
    return 'FOLLOW_UP_REQUIRED'
  }

  if (
    verificationResult ===
      'RECURRENCE_DETECTED' ||
    verificationResult ===
      'ACTION_INEFFECTIVE'
  ) {
    return 'CONTINUITY_RISK_ACTIVE'
  }

  if (
    verificationResult ===
    'ESCALATION_REQUIRED'
  ) {
    return 'ESCALATION_REQUIRED'
  }

  return 'PARTIAL_STABILIZATION'
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
    input.verificationResult ===
      'ESCALATION_REQUIRED' ||
    input.continuityOutlook ===
      'HIGH_RISK'
  ) {
    return 'URGENT_CONTINUITY_REVIEW'
  }

  if (
    input.recurrenceSignal ===
      'REPEATED_RECURRENCE' ||
    input.verificationResult ===
      'RECURRENCE_DETECTED'
  ) {
    return 'EXECUTIVE_CONTINUITY_REVIEW'
  }

  if (
    input.verificationTrajectory ===
      'DESTABILIZING' ||
    input.verificationTrajectory ===
      'WEAKENING'
  ) {
    return 'ELEVATED_VERIFICATION_REVIEW'
  }

  if (
    input.verificationTrajectory ===
      'TRANSITIONAL_STABILITY' ||
    input.verificationTrajectory ===
      'HOLDING_WITH_VARIANCE'
  ) {
    return 'CONTINUITY_OBSERVATION'
  }

  if (
    input.verificationTrajectory ===
      'STABILITY_BUILDING'
  ) {
    return 'STABILITY_HOLDING'
  }

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
  if (
    input.verificationResult ===
    'ESCALATION_REQUIRED'
  ) {
    return 'DESTABILIZING'
  }

  if (
    input.verificationResult ===
    'RECURRENCE_DETECTED'
  ) {
    return 'WEAKENING'
  }

  if (
    input.verificationTrajectory ===
    'TRANSITIONAL_STABILITY'
  ) {
    return 'BUILDING'
  }

  if (
    input.verificationTrajectory ===
      'STABILITY_BUILDING' ||
    input.verificationCredibility ===
      'STRONG'
  ) {
    return 'CREDIBLE'
  }

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
    input.verificationResult ===
      'ESCALATION_REQUIRED' ||
    input.continuityOutlook ===
      'HIGH_RISK'
  ) {
    return 'SURVIVABILITY_PRESSURE_RISING'
  }

  if (
    input.recurrenceSignal ===
      'REPEATED_RECURRENCE' ||
    input.recurrenceSignal ===
      'RECURRENCE_DETECTED'
  ) {
    return 'RECURRENCE_REQUIRES_VISIBILITY'
  }

  if (
    input.recoveryReadiness ===
      'RECOVERY_WATCH_ELIGIBLE' ||
    input.recoveryReadiness ===
      'RECOVERY_TRANSITION_READY'
  ) {
    return 'RECOVERY_DURABILITY_OBSERVATION_SUPPORTED'
  }

  if (
    input.verificationTrajectory ===
      'STABILITY_BUILDING' ||
    input.continuityOutlook ===
      'STABLE'
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
}) {
  if (!input.verificationResult) {
    return 'Executive continuity interpretation will activate after stabilization verification evidence is preserved.'
  }

  if (
    input.commandPosture ===
    'URGENT_CONTINUITY_REVIEW'
  ) {
    return 'Verification evidence indicates continuity deterioration requiring urgent executive continuity visibility.'
  }

  if (
    input.commandPosture ===
    'EXECUTIVE_CONTINUITY_REVIEW'
  ) {
    return 'Verification evidence indicates recurrence visibility requiring elevated executive continuity review.'
  }

  if (
    input.commandPosture ===
    'ELEVATED_VERIFICATION_REVIEW'
  ) {
    return 'Verification conditions remain variable and require proportional continuity observation.'
  }

  if (
    input.commandPosture ===
    'CONTINUITY_OBSERVATION'
  ) {
    return 'Continuity stabilization is holding with manageable variability under current verification observation conditions.'
  }

  if (
    input.commandPosture ===
      'STABILITY_HOLDING' ||
    input.commandPosture ===
      'STABLE_CONTINUITY_VISIBILITY'
  ) {
    return 'Verification evidence supports strengthening continuity credibility while preserving structural continuity visibility.'
  }

  return 'Continuity verification evidence remains operationally visible under current governance conditions.'
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
}) {
  if (
    input.verificationTrajectory ===
      'STABILITY_BUILDING' ||
    input.verificationTrajectory ===
      'IMPROVING'
  ) {
    return 'Verification continuity conditions remain proportionally stable while continuity confidence continues to mature.'
  }

  if (
    input.recoveryReadiness ===
      'RECOVERY_WATCH_ELIGIBLE' ||
    input.recoveryReadiness ===
      'RECOVERY_TRANSITION_READY'
  ) {
    return 'Some stabilization pathways are becoming eligible for recovery durability governance observation.'
  }

  return 'Verification continuity observation remains proportionally active under current operational conditions.'
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
        onChange={(event) =>
          setValue(event.target.value)
        }
        className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option, index) => (
          <option
            key={`${option.value}-${index}`}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}