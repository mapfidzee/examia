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

type AuditSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

const GOVERNANCE_INSTITUTION = 'TSINAXA CGI'

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
  'UNVERIFIED_IMPROVEMENT',
  'RECURRENCE_DETECTED',
  'ACTION_INEFFECTIVE',
  'ESCALATION_REQUIRED',
]

const ACTION_IMPACTS = [
  'Action produced credible stabilization movement',
  'Action produced partial stabilization movement',
  'Action produced temporary improvement only',
  'Action did not materially reduce instability',
  'Action exposed recurrence after movement',
  'Action requires escalation before verification can continue',
]

const VERIFICATION_CREDIBILITIES = [
  'STRONG',
  'MODERATE',
  'WEAK',
  'UNCERTAIN',
  'CONFLICTED',
]

const RECURRENCE_SIGNALS = [
  'NO_RECURRENCE_VISIBLE',
  'RECURRENCE_OBSERVATION',
  'RECURRENCE_DETECTED',
  'REPEATED_RECURRENCE',
]

const RECOVERY_READINESS = [
  'NOT_READY_FOR_RECOVERY',
  'RECOVERY_WATCH_ELIGIBLE',
  'RECOVERY_MONITORING_RECOMMENDED',
  'RECOVERY_BLOCKED',
]

const CONTINUITY_OUTLOOKS = [
  'STABLE',
  'MONITOR',
  'AT_RISK',
  'UNSTABLE',
  'ESCALATE',
  'HIGH_RISK',
]

const VERIFICATION_TRAJECTORIES = [
  'IMPROVING',
  'STABLE',
  'VARIABLE_STABILITY',
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
    useState('MODERATE')

  const [recurrenceSignal, setRecurrenceSignal] =
    useState('RECURRENCE_OBSERVATION')

  const [recoveryReadiness, setRecoveryReadiness] =
    useState('NOT_READY_FOR_RECOVERY')

  const [continuityOutlook, setContinuityOutlook] =
    useState('MONITOR')

  const [verificationTrajectory, setVerificationTrajectory] =
    useState('VARIABLE_STABILITY')

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

  const outcomePressure = useMemo(() => {
    const verified = outcomes.filter((item) =>
      item.outcome_summary?.includes('VERIFIED_STABILIZATION')
    ).length

    const recurrenceDetected = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes('RECURRENCE_DETECTED') ||
        item.outcome_summary?.includes('REPEATED_RECURRENCE')
    ).length

    const escalationRequired = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes('ESCALATION_REQUIRED') ||
        item.outcome_summary?.includes('HIGH_RISK')
    ).length

    const recoveryEligible = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes(
          'RECOVERY_WATCH_ELIGIBLE'
        ) ||
        item.outcome_summary?.includes(
          'RECOVERY_MONITORING_RECOMMENDED'
        )
    ).length

    const variableVerification = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes('VARIABLE_STABILITY') ||
        item.outcome_summary?.includes('UNCERTAIN') ||
        item.outcome_summary?.includes('CONFLICTED')
    ).length

    return {
      verified,
      recurrenceDetected,
      escalationRequired,
      recoveryEligible,
      variableVerification,
    }
  }, [outcomes])

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
      verificationCredibility,
      recurrenceSignal,
      recoveryReadiness,
      continuityOutlook,
      verificationTrajectory,
      escalationPressure:
        outcomePressure.escalationRequired,
      recurrencePressure:
        outcomePressure.recurrenceDetected,
      variablePressure:
        outcomePressure.variableVerification,
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
      survivabilitySignal,
    })

  const verificationPressureMeaning =
    buildVerificationPressureMeaning({
      variableVerification:
        outcomePressure.variableVerification,
      recurrenceDetected:
        outcomePressure.recurrenceDetected,
      escalationRequired:
        outcomePressure.escalationRequired,
      recoveryEligible:
        outcomePressure.recoveryEligible,
    })

  function buildCaseLabel(caseItem: StabilityCase) {
    return `${caseItem.beneficiary_name} • ${caseItem.support_domain} • ${caseItem.case_status}`
  }

  function verificationSynthesis() {
    return `
VERIFICATION RESULT
${verificationResult || 'Awaiting verification result selection'}

ACTION IMPACT
${actionImpact || 'Awaiting action impact selection'}

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
    : 'Awaiting stabilization verification assignment.'
}

CASE SIGNAL
${
  selectedCase?.beneficiary_name ||
  'Executive synthesis will activate after continuity case selection.'
}

STABILITY DOMAIN
${
  selectedCase?.support_domain ||
  'Continuity domain visibility pending case assignment.'
}

CURRENT CONTINUITY STATUS
${
  selectedCase?.case_status ||
  'Verification continuity posture pending operational review.'
}

GOVERNANCE INTERPRETATION
${
  verificationInterpretation.trim() ||
  'No additional verification interpretation entered.'
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

    const { data: outcomeRecord, error: outcomeError } =
      await supabase
        .from('case_outcomes')
        .insert({
          case_id: selectedCaseId,
          outcome_status: verificationResult,
          outcome_summary: summary,
        })
        .select('id')
        .single()

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
    setVerificationCredibility('MODERATE')
    setRecurrenceSignal('RECURRENCE_OBSERVATION')
    setRecoveryReadiness('NOT_READY_FOR_RECOVERY')
    setContinuityOutlook('MONITOR')
    setVerificationTrajectory('VARIABLE_STABILITY')
    setVerificationInterpretation('')

    setMessage(
      'Stabilization verification preserved. Recovery eligibility, recurrence visibility, continuity posture, survivability interpretation, and lifecycle movement are now updated.'
    )

    setLoading(false)

    await loadCases()
    await loadOutcomes()
  }

  const continuityProfiles = [
    {
      title: 'Verification Stability Distribution',
      value:
        'No concentrated destabilizing verification pattern currently visible.',
    },
    {
      title: 'Verification Observation Load',
      value:
        'Outcome verification activity remains within manageable continuity thresholds.',
    },
    {
      title: 'Recurrence Visibility',
      value:
        'No active recurrence concentration currently requiring executive escalation.',
    },
    {
      title: 'Recovery Eligibility Visibility',
      value:
        'Eligible stabilization outcomes remain visible for proportional recovery durability governance.',
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
        : 'Awaiting stabilization verification assignment.',
    ],
    [
      'CASE SIGNAL',
      selectedCase?.beneficiary_name ||
        'Executive synthesis will activate after continuity case selection.',
    ],
    [
      'STABILITY DOMAIN',
      selectedCase?.support_domain ||
        'Continuity domain visibility pending case assignment.',
    ],
    [
      'CURRENT CONTINUITY STATUS',
      selectedCase?.case_status ||
        'Verification continuity posture pending operational review.',
    ],
    [
      'GOVERNANCE INTERPRETATION',
      verificationInterpretation.trim() ||
        'No additional verification interpretation entered.',
    ],
  ]

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="border-b border-neutral-800 bg-neutral-950 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400">
            TSINAXA CGI
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Stabilization Verification Intelligence
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-300 md:text-base">
            Executive Continuity Intelligence Infrastructure
          </p>

          <p className="mt-4 max-w-5xl text-sm leading-6 text-neutral-400 md:text-base">
            Verify whether governed stabilization action produced credible continuity movement.
            Preserve recurrence visibility, verification credibility,
            recovery eligibility, survivability meaning,
            lifecycle movement, and executive continuity posture
            without prematurely declaring durable recovery.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-wide text-neutral-300">
            <span className="rounded-full border border-neutral-700 px-3 py-2">
              Infrastructure
            </span>

            <span className="rounded-full border border-neutral-700 px-3 py-2">
              Continuity Governance
            </span>

            <span className="rounded-full border border-neutral-700 px-3 py-2">
              Executive Boundary
            </span>

            <span className="rounded-full border border-neutral-700 px-3 py-2">
              Stabilization Visibility
            </span>

            <span className="rounded-full border border-neutral-700 px-3 py-2">
              Governed Continuity Intelligence
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">
          TSINAXA CGI • STABILIZATION VERIFICATION INTELLIGENCE
        </p>

        <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white">
            Stabilization Verification Intelligence
          </h2>

          <p className="mt-3 max-w-5xl text-sm leading-6 text-neutral-300">
            Confirm whether stabilization action is strengthening continuity,
            remaining variable, weakening, recurring,
            or becoming eligible for recovery durability observation.
          </p>

          <p className="mt-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm leading-6 text-cyan-100">
            <span className="font-semibold">Boundary:</span> /outcomes verifies stabilization impact.
            It does not declare durable recovery,
            erase structural continuity memory,
            or close survivability visibility automatically.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {continuityProfiles.map((profile) => (
            <div
              key={profile.title}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
            >
              <p className="text-sm font-semibold text-white">
                {profile.title}
              </p>

              <p className="mt-3 text-sm leading-6 text-neutral-400">
                {profile.value}
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
              survivability meaning,
              recovery eligibility,
              and executive continuity interpretation.
            </p>

            <div className="mt-6 space-y-5">

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Stability Case
                </span>

                <select
                  value={selectedCaseId}
                  onChange={(event) =>
                    setSelectedCaseId(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                >
                  <option value="">
                    {cases.length === 0
                      ? 'No stabilization-stage cases found'
                      : 'Select stability case'}
                  </option>

                  {cases.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {buildCaseLabel(item)}
                    </option>
                  ))}
                </select>
              </label>

              <Select
                label="Verification Result"
                placeholder="Select verification result"
                value={verificationResult}
                setValue={setVerificationResult}
                options={VERIFICATION_RESULTS}
              />

              <Select
                label="Action Impact"
                placeholder="Select action impact"
                value={actionImpact}
                setValue={setActionImpact}
                options={ACTION_IMPACTS}
              />

              <Select
                label="Verification Credibility"
                placeholder="Select verification credibility"
                value={verificationCredibility}
                setValue={setVerificationCredibility}
                options={VERIFICATION_CREDIBILITIES}
              />

              <Select
                label="Verification Trajectory"
                placeholder="Select verification trajectory"
                value={verificationTrajectory}
                setValue={setVerificationTrajectory}
                options={VERIFICATION_TRAJECTORIES}
              />

              <Select
                label="Recurrence Signal"
                placeholder="Select recurrence signal"
                value={recurrenceSignal}
                setValue={setRecurrenceSignal}
                options={RECURRENCE_SIGNALS}
              />

              <Select
                label="Recovery Readiness"
                placeholder="Select recovery readiness"
                value={recoveryReadiness}
                setValue={setRecoveryReadiness}
                options={RECOVERY_READINESS}
              />

              <Select
                label="Continuity Outlook"
                placeholder="Select continuity outlook"
                value={continuityOutlook}
                setValue={setContinuityOutlook}
                options={CONTINUITY_OUTLOOKS}
              />

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Verification Interpretation
                </span>

                <textarea
                  value={verificationInterpretation}
                  onChange={(event) =>
                    setVerificationInterpretation(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder="Use operational facts only. Preserve verification credibility, recurrence visibility, recovery eligibility, survivability meaning, and executive continuity interpretation."
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                />
              </label>

              <button
                onClick={preserveVerificationIntelligence}
                disabled={loading}
                className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-cyan-300"
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
              This synthesis confirms whether stabilization movement is strengthening,
              remaining variable,
              recurring,
              weakening,
              escalating,
              or becoming eligible for recovery durability observation.
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
            or weakening trajectory,
            the system should support measured continuity confidence
            while preserving structural memory and executive traceability.
          </p>
        </section>
      </section>
    </main>
  )
}

function mapVerificationToLifecycleStatus(
  verificationResult: string
) {
  if (verificationResult === 'VERIFIED_STABILIZATION')
    return 'STABILIZED'

  if (verificationResult === 'PARTIAL_VERIFICATION')
    return 'PARTIAL_STABILIZATION'

  if (verificationResult === 'UNVERIFIED_IMPROVEMENT')
    return 'FOLLOW_UP_REQUIRED'

  if (verificationResult === 'RECURRENCE_DETECTED')
    return 'CONTINUITY_RISK_ACTIVE'

  if (verificationResult === 'ACTION_INEFFECTIVE')
    return 'CONTINUITY_RISK_ACTIVE'

  if (verificationResult === 'ESCALATION_REQUIRED')
    return 'ESCALATION_REQUIRED'

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
    input.verificationResult === 'ESCALATION_REQUIRED' ||
    input.continuityOutlook === 'HIGH_RISK'
  ) {
    return 'URGENT_CONTINUITY_REVIEW'
  }

  if (
    input.verificationResult === 'RECURRENCE_DETECTED' ||
    input.recurrenceSignal === 'REPEATED_RECURRENCE'
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
    input.verificationCredibility === 'UNCERTAIN' ||
    input.verificationCredibility === 'CONFLICTED' ||
    input.commandVisibility
  ) {
    return 'CONTINUITY_OBSERVATION'
  }

  return 'STABILITY_HOLDING'
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
    input.verificationResult === 'ESCALATION_REQUIRED'
  ) {
    return 'DESTABILIZING'
  }

  if (
    input.verificationResult === 'RECURRENCE_DETECTED'
  ) {
    return 'WEAKENING'
  }

  if (
    input.verificationTrajectory === 'VARIABLE_STABILITY'
  ) {
    return 'VARIABLE'
  }

  if (
    input.verificationResult ===
      'VERIFIED_STABILIZATION' &&
    input.verificationCredibility === 'STRONG' &&
    input.recurrenceSignal ===
      'NO_RECURRENCE_VISIBLE'
  ) {
    return 'CREDIBLE'
  }

  return 'BUILDING'
}

function buildSurvivabilitySignal(input: {
  verificationResult: string
  verificationCredibility: string
  recurrenceSignal: string
  recoveryReadiness: string
  continuityOutlook: string
  verificationTrajectory: string
  escalationPressure: number
  recurrencePressure: number
  variablePressure: number
}) {
  if (
    input.verificationResult ===
      'ESCALATION_REQUIRED' ||
    input.escalationPressure > 0
  ) {
    return 'SURVIVABILITY_PRESSURE_RISING'
  }

  if (
    input.recurrenceSignal ===
      'REPEATED_RECURRENCE' ||
    input.recurrencePressure > 0
  ) {
    return 'RECURRENCE_REQUIRES_VISIBILITY'
  }

  if (
    input.variablePressure > 0 ||
    input.verificationTrajectory ===
      'VARIABLE_STABILITY'
  ) {
    return 'VARIABLE_STABILITY_REQUIRES_OBSERVATION'
  }

  if (
    input.recoveryReadiness ===
      'RECOVERY_WATCH_ELIGIBLE'
  ) {
    return 'RECOVERY_OBSERVATION_POSSIBLE'
  }

  return 'SURVIVABILITY_BACKGROUND_STABLE'
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
  survivabilitySignal: string
}) {
  if (!input.verificationResult) {
    return 'Awaiting stabilization verification selections. Executive continuity interpretation will activate after verification evidence is preserved.'
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
    return 'Verification evidence indicates recurrence visibility or weakening stabilization movement requiring executive continuity review.'
  }

  if (
    input.commandPosture ===
    'ELEVATED_VERIFICATION_REVIEW'
  ) {
    return 'Verification movement remains variable or weakening. Measured continuity observation should remain active.'
  }

  if (
    input.recoveryReadiness ===
      'RECOVERY_WATCH_ELIGIBLE' ||
    input.recoveryReadiness ===
      'RECOVERY_MONITORING_RECOMMENDED'
  ) {
    return 'Stabilization evidence supports proportional recovery durability observation while structural continuity memory remains preserved.'
  }

  return 'Outcome verification evidence has been preserved. Continuity visibility remains proportional under current operational conditions.'
}

function buildVerificationPressureMeaning(input: {
  variableVerification: number
  recurrenceDetected: number
  escalationRequired: number
  recoveryEligible: number
}) {
  if (
    input.variableVerification === 0 &&
    input.recurrenceDetected === 0 &&
    input.escalationRequired === 0
  ) {
    return 'Verification stability remains proportionally balanced under current continuity observation conditions.'
  }

  const signals: string[] = []

  if (input.variableVerification > 0) {
    signals.push(
      'variable verification conditions remain visible'
    )
  }

  if (input.recurrenceDetected > 0) {
    signals.push(
      'recurrence visibility remains active'
    )
  }

  if (input.escalationRequired > 0) {
    signals.push(
      'escalation pressure remains operationally visible'
    )
  }

  if (input.recoveryEligible > 0) {
    signals.push(
      'some stabilization outcomes are eligible for recovery durability observation'
    )
  }

  return `Verification pressure remains active: ${signals.join(
    ', '
  )}. Continuity governance should preserve proportional operational visibility while monitoring lifecycle movement toward recovery durability observation.`
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
  options: string[]
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
            key={`${option}-${index}`}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}