'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type DurabilityResult =
  | 'DURABLE_RECOVERY_CONFIRMED'
  | 'RECOVERY_HOLDING'
  | 'STABILITY_UNDER_VARIANCE'
  | 'REBURN_DETECTED'
  | 'RECOVERY_COLLAPSE'

type RecoveryTrajectory =
  | 'STRENGTHENING'
  | 'HOLDING'
  | 'VARIABLE_STABILITY'
  | 'WEAKENING'
  | 'COLLAPSING'

type ReburnSignal =
  | 'NO_REBURN_VISIBLE'
  | 'RECURRENCE_OBSERVATION'
  | 'REBURN_DETECTED'
  | 'RECURRENT_REBURN_PATTERN'

type RecoveryConfidence =
  | 'CREDIBLE'
  | 'BUILDING'
  | 'VARIABLE'
  | 'LOW'
  | 'COLLAPSED'

type MemoryImpact =
  | 'NO_MEMORY_ESCALATION_REQUIRED'
  | 'STRUCTURAL_MEMORY_PRESERVED'
  | 'CONTINUITY_MEMORY_VISIBLE'
  | 'MEMORY_ESCALATION_REQUIRED'
  | 'RECURRING_STRUCTURAL_PATTERN'

type CommandPosture =
  | 'CONTINUITY_OBSERVATION'
  | 'STABILITY_HOLDING'
  | 'DURABILITY_BUILDING'
  | 'ELEVATED_RECOVERY_REVIEW'
  | 'EXECUTIVE_CONTINUITY_REVIEW'
  | 'URGENT_CONTINUITY_REVIEW'

type RecoveryMaturity =
  | 'EARLY_RECOVERY'
  | 'VARIABLE_STABILITY'
  | 'HOLDING_STABLE'
  | 'DURABILITY_BUILDING'
  | 'RECOVERY_MATURING'
  | 'STABLE_UNDER_OBSERVATION'
  | 'DURABLE_RECOVERY_ESTABLISHED'

type RecoverySurvivabilitySignal =
  | 'SURVIVABILITY_BACKGROUND_STABLE'
  | 'SURVIVABILITY_OBSERVATION_ACTIVE'
  | 'DURABILITY_REQUIRES_OBSERVATION'
  | 'SURVIVABILITY_PRESSURE_RISING'
  | 'SURVIVABILITY_COMPROMISED'

type RecoveryDisposition =
  | 'MOVE_TO_STABILITY_BOARD'
  | 'MOVE_TO_COMMAND_WATCH'
  | 'MOVE_TO_COMMAND_ESCALATION'
  | 'RETURN_TO_OUTCOMES_REVIEW'
  | 'RETURN_TO_INTERVENTION_REVIEW'
  | 'CONTINUE_RECOVERY_MONITORING'

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

type InheritedVerification = {
  verificationResult: string
  verificationCredibility: string
  verificationTrajectory: string
  recurrenceSignal: string
  recoveryReadiness: string
  continuityOutlook: string
  stabilizationConfidence: string
  survivabilitySignal: string
  executiveMeaning: string
}

type RecoveryEligibleCase = {
  caseItem: StabilityCase
  latestVerificationOutcome?: OutcomeRecord
  latestRecoveryReview?: OutcomeRecord
  inheritedVerification: InheritedVerification
}

const RECOVERY_ELIGIBLE_CASE_STATUSES = [
  'RECOVERY_MONITORING',
  'STABILIZED',
  'PARTIAL_STABILIZATION',
  'FOLLOW_UP_REQUIRED',
  'IMPROVING',
]

const RECOVERY_READY_OUTCOME_MARKERS = [
  'RECOVERY_WATCH_ELIGIBLE',
  'RECOVERY_MONITORING_RECOMMENDED',
  'RECOVERY_TRANSITION_READY',
  'VERIFIED_STABILIZATION',
  'STABILITY_BUILDING',
  'TRANSITIONAL_STABILITY',
]

const durabilityResults: DurabilityResult[] = [
  'DURABLE_RECOVERY_CONFIRMED',
  'RECOVERY_HOLDING',
  'STABILITY_UNDER_VARIANCE',
  'REBURN_DETECTED',
  'RECOVERY_COLLAPSE',
]

const recoveryTrajectories: RecoveryTrajectory[] = [
  'STRENGTHENING',
  'HOLDING',
  'VARIABLE_STABILITY',
  'WEAKENING',
  'COLLAPSING',
]

const reburnSignals: ReburnSignal[] = [
  'NO_REBURN_VISIBLE',
  'RECURRENCE_OBSERVATION',
  'REBURN_DETECTED',
  'RECURRENT_REBURN_PATTERN',
]

const recoveryConfidences: RecoveryConfidence[] = [
  'CREDIBLE',
  'BUILDING',
  'VARIABLE',
  'LOW',
  'COLLAPSED',
]

const memoryImpacts: MemoryImpact[] = [
  'NO_MEMORY_ESCALATION_REQUIRED',
  'STRUCTURAL_MEMORY_PRESERVED',
  'CONTINUITY_MEMORY_VISIBLE',
  'MEMORY_ESCALATION_REQUIRED',
  'RECURRING_STRUCTURAL_PATTERN',
]

export default function RecoveryPage() {
  const [eligibleCases, setEligibleCases] = useState<RecoveryEligibleCase[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [lastPreservedCaseId, setLastPreservedCaseId] = useState('')

  const [durabilityResult, setDurabilityResult] =
    useState<DurabilityResult>('STABILITY_UNDER_VARIANCE')
  const [recoveryTrajectory, setRecoveryTrajectory] =
    useState<RecoveryTrajectory>('VARIABLE_STABILITY')
  const [reburnSignal, setReburnSignal] =
    useState<ReburnSignal>('RECURRENCE_OBSERVATION')
  const [recoveryConfidence, setRecoveryConfidence] =
    useState<RecoveryConfidence>('VARIABLE')
  const [durabilityWindow, setDurabilityWindow] = useState('7 days')
  const [memoryImpact, setMemoryImpact] =
    useState<MemoryImpact>('CONTINUITY_MEMORY_VISIBLE')
  const [interpretation, setInterpretation] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRecoveryEligibleCases()
  }, [])

  async function loadRecoveryEligibleCases() {
    const [casesResult, outcomesResult] = await Promise.all([
      supabase
        .from('beneficiary_cases')
        .select('*')
        .in('case_status', RECOVERY_ELIGIBLE_CASE_STATUSES)
        .order('created_at', { ascending: false }),
      supabase
        .from('case_outcomes')
        .select('*')
        .order('created_at', { ascending: false }),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)

    const caseRows = casesResult.data || []
    const outcomeRows = outcomesResult.data || []

    setOutcomes(outcomeRows)

    const inheritedCases = caseRows
      .map((caseItem) => {
        const caseOutcomes = outcomeRows.filter(
          (outcome) => outcome.case_id === caseItem.id,
        )

        const latestVerificationOutcome = findLatestVerificationOutcome(
          caseOutcomes,
          caseItem,
        )

        const latestRecoveryReview = findLatestRecoveryReview(caseOutcomes)

        return {
          caseItem,
          latestVerificationOutcome,
          latestRecoveryReview,
          inheritedVerification: buildInheritedVerification(
            latestVerificationOutcome,
            caseItem,
          ),
        }
      })
      .filter((item) =>
        isRecoveryEligible(item.caseItem, item.latestVerificationOutcome),
      )

    setEligibleCases(inheritedCases)
  }

  const selectedCase = useMemo(
    () => eligibleCases.find((item) => item.caseItem.id === selectedCaseId),
    [eligibleCases, selectedCaseId],
  )

  const lastPreservedCase = useMemo(
    () => eligibleCases.find((item) => item.caseItem.id === lastPreservedCaseId),
    [eligibleCases, lastPreservedCaseId],
  )

  const activeCase = selectedCase || lastPreservedCase
  const hasActiveRecoveryContext = Boolean(activeCase)

  const recoveryMaturity = useMemo(
    () =>
      deriveRecoveryMaturity(
        durabilityResult,
        recoveryTrajectory,
        reburnSignal,
        recoveryConfidence,
        durabilityWindow,
        memoryImpact,
      ),
    [
      durabilityResult,
      recoveryTrajectory,
      reburnSignal,
      recoveryConfidence,
      durabilityWindow,
      memoryImpact,
    ],
  )

  const commandPosture = useMemo(
    () =>
      deriveCommandPosture(
        durabilityResult,
        recoveryTrajectory,
        reburnSignal,
        recoveryConfidence,
        recoveryMaturity,
      ),
    [
      durabilityResult,
      recoveryTrajectory,
      reburnSignal,
      recoveryConfidence,
      recoveryMaturity,
    ],
  )

  const recoveryDisposition = useMemo(
    () =>
      deriveRecoveryDisposition({
        durabilityResult,
        recoveryTrajectory,
        reburnSignal,
        recoveryConfidence,
        memoryImpact,
        recoveryMaturity,
        inheritedVerification: activeCase?.inheritedVerification,
      }),
    [
      durabilityResult,
      recoveryTrajectory,
      reburnSignal,
      recoveryConfidence,
      memoryImpact,
      recoveryMaturity,
      activeCase,
    ],
  )

  const survivabilitySignal = useMemo(
    () => deriveSurvivabilitySignal(commandPosture),
    [commandPosture],
  )

  const executiveMeaning = deriveExecutiveMeaning(
    recoveryMaturity,
    durabilityWindow,
    activeCase?.inheritedVerification,
  )

  const recoveryPressure = deriveRecoveryPressure(commandPosture)
  const memoryMeaning = deriveMemoryMeaning(memoryImpact)

  const movementMeaning = deriveRecoveryMovementMeaning(recoveryDisposition)
  const movementDestination = deriveRecoveryMovementDestination(recoveryDisposition)
  const movementReason = deriveRecoveryMovementReason(recoveryDisposition)

  const inheritedSummary = activeCase
    ? activeCase.inheritedVerification
    : buildInheritedVerification(undefined)

  const displayedDurabilityResult = hasActiveRecoveryContext
    ? durabilityResult
    : 'Durability result pending recovery-eligible case selection'

  const displayedRecoveryTrajectory = hasActiveRecoveryContext
    ? recoveryTrajectory
    : 'Recovery trajectory pending recovery-eligible case selection'

  const displayedReburnSignal = hasActiveRecoveryContext
    ? reburnSignal
    : 'Reburn interpretation pending recovery-eligible case selection'

  const displayedRecoveryConfidence = hasActiveRecoveryContext
    ? recoveryConfidence
    : 'Recovery confidence pending recovery-eligible case selection'

  const displayedMemoryImpact = hasActiveRecoveryContext
    ? memoryImpact
    : 'Memory impact pending recovery-eligible case selection'

  const displayedRecoveryMaturity = hasActiveRecoveryContext
    ? recoveryMaturity
    : 'RECOVERY_MATURITY_PENDING'

  const displayedCommandPosture = hasActiveRecoveryContext
    ? commandPosture
    : 'PENDING_RECOVERY_SELECTION'

  const displayedRecoveryDisposition = hasActiveRecoveryContext
    ? recoveryDisposition
    : 'PENDING_RECOVERY_SELECTION'

  const displayedMovementDestination = hasActiveRecoveryContext
    ? movementDestination
    : 'Select a recovery-eligible case before lifecycle movement is assigned.'

  const displayedMovementReason = hasActiveRecoveryContext
    ? movementReason
    : 'Recovery has not yet inherited outcome evidence for durability review.'

  const displayedSurvivabilitySignal = hasActiveRecoveryContext
    ? survivabilitySignal
    : 'SURVIVABILITY_INTERPRETATION_PENDING'

  const displayedExecutiveMeaning = hasActiveRecoveryContext
    ? executiveMeaning
    : 'Executive recovery meaning will activate after a recovery-eligible case is selected.'

  const displayedRecoveryPressure = hasActiveRecoveryContext
    ? recoveryPressure
    : 'Recovery pressure interpretation will activate after inherited outcome evidence is selected for durability review.'

  const displayedMemoryMeaning = hasActiveRecoveryContext
    ? memoryMeaning
    : 'Structural memory interpretation will activate after recovery durability review begins.'

  const continuityProfiles = buildRecoveryContinuityProfiles({
    eligibleCases,
    outcomes,
  })

  const synthesisRows = [
    ['INHERITED VERIFICATION RESULT', inheritedSummary.verificationResult],
    ['INHERITED VERIFICATION CREDIBILITY', inheritedSummary.verificationCredibility],
    ['INHERITED VERIFICATION TRAJECTORY', inheritedSummary.verificationTrajectory],
    ['INHERITED RECURRENCE SIGNAL', inheritedSummary.recurrenceSignal],
    ['INHERITED RECOVERY READINESS', inheritedSummary.recoveryReadiness],
    ['INHERITED CONTINUITY OUTLOOK', inheritedSummary.continuityOutlook],
    ['INHERITED STABILIZATION CONFIDENCE', inheritedSummary.stabilizationConfidence],
    ['DURABILITY RESULT', displayedDurabilityResult],
    ['RECOVERY TRAJECTORY', displayedRecoveryTrajectory],
    ['REBURN SIGNAL', displayedReburnSignal],
    ['RECOVERY CONFIDENCE', displayedRecoveryConfidence],
    [
      'DURABILITY WINDOW',
      hasActiveRecoveryContext
        ? durabilityWindow
        : 'Durability window pending recovery-eligible case selection',
    ],
    ['MEMORY IMPACT', displayedMemoryImpact],
    ['RECOVERY MATURITY', displayedRecoveryMaturity],
    ['COMMAND POSTURE', displayedCommandPosture],
    ['RECOVERY DISPOSITION', displayedRecoveryDisposition],
    ['RECOMMENDED NEXT MOVEMENT', displayedMovementDestination],
    ['MOVEMENT REASON', displayedMovementReason],
    ['RECOVERY SURVIVABILITY SIGNAL', displayedSurvivabilitySignal],
    ['EXECUTIVE MEANING', displayedExecutiveMeaning],
    ['RECOVERY PRESSURE', displayedRecoveryPressure],
    ['MEMORY MEANING', displayedMemoryMeaning],
    [
      'CASE SIGNAL',
      activeCase?.caseItem.beneficiary_name ??
        'Executive synthesis will activate after recovery-eligible case selection.',
    ],
    [
      'STABILITY DOMAIN',
      activeCase?.caseItem.support_domain ??
        'Continuity domain visibility pending recovery-eligible case assignment.',
    ],
    [
      'CURRENT CONTINUITY STATUS',
      activeCase?.caseItem.case_status ??
        'Recovery continuity posture pending inherited outcome selection.',
    ],
    [
      'RECOVERY INTERPRETATION',
      interpretation.trim() ||
        getLatestRecoveryInterpretation(activeCase?.latestRecoveryReview) ||
        'No additional operational recovery interpretation entered.',
    ],
  ]

  async function preserveRecoveryReview() {
    if (!selectedCase) {
      setMessage('Select a recovery-eligible case before preserving durability review.')
      return
    }

    setLoading(true)
    setMessage('')

    const summary = buildRecoverySummary({
      selectedCase,
      durabilityResult,
      recoveryTrajectory,
      reburnSignal,
      recoveryConfidence,
      durabilityWindow,
      memoryImpact,
      recoveryMaturity,
      commandPosture,
      recoveryDisposition,
      survivabilitySignal,
      executiveMeaning,
      recoveryPressure,
      memoryMeaning,
      movementMeaning,
      movementDestination,
      movementReason,
      interpretation,
    })

    const { error: outcomeError } = await supabase.from('case_outcomes').insert({
      case_id: selectedCase.caseItem.id,
      outcome_status: durabilityResult,
      outcome_summary: summary,
    })

    if (outcomeError) {
      alert(outcomeError.message)
      setLoading(false)
      return
    }

    const nextStatus = deriveCaseStatusAfterRecovery(recoveryDisposition)

    const { error: caseError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: nextStatus,
        outcome_summary: summary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedCase.caseItem.id)

    if (caseError) {
      alert(caseError.message)
      setLoading(false)
      return
    }

    const preservedCaseId = selectedCase.caseItem.id

    setMessage(
      `Recovery durability review preserved. Next governed movement: ${movementDestination}.`,
    )

    setSelectedCaseId('')
    setLastPreservedCaseId(preservedCaseId)
    setInterpretation('')
    setLoading(false)

    await loadRecoveryEligibleCases()
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="mx-auto max-w-7xl px-6 py-8">
        {message && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-semibold text-amber-100">
            {message}
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
          TSINAXA CGI â€¢ RECOVERY DURABILITY INTELLIGENCE
        </p>

        <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white">
            Recovery Durability Intelligence
          </h2>

          <p className="mt-3 max-w-5xl text-sm leading-6 text-neutral-300">
            Confirm whether inherited outcome verification is converting into
            durable recovery. Preserve recurrence visibility, durability confidence,
            structural memory, survivability posture, and executive continuity
            meaning before trust is restored.
          </p>

          <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
            <span className="font-semibold">Boundary:</span> /recovery is now a
            governed decision gate. It inherits verification evidence from
            /outcomes, tests durability, and directs the next movement toward
            Stability Board, Command Watch, Command Escalation, Outcomes Review,
            Intervention Review, or continued recovery monitoring.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {continuityProfiles.map((profile) => (
            <div
              key={profile.title}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
            >
              <p className="text-sm font-semibold text-white">{profile.title}</p>
              <p className="mt-3 text-sm leading-6 text-neutral-400">
                {profile.value}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">
            Recommended Next Movement
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Recovery Disposition
              </p>
              <p className="mt-3 break-words text-2xl font-semibold text-white">
                {displayedRecoveryDisposition}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Move To
              </p>
              <p className="mt-3 text-lg font-semibold text-amber-100">
                {displayedMovementDestination}
              </p>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                {displayedMovementReason}
              </p>
            </div>
          </div>

          <p className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm leading-6 text-neutral-300">
            {hasActiveRecoveryContext
              ? movementMeaning
              : 'Recovery movement activates only after a recovery-eligible case is selected and durability evidence is reviewed.'}
          </p>
        </section>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-lg font-semibold text-white">
            Recovery Pressure Intelligence
          </h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {displayedRecoveryPressure}
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-lg font-semibold text-white">
            Outcome Inheritance Intelligence
          </h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {activeCase
              ? 'This recovery review is inheriting verification credibility, recurrence posture, recovery readiness, and continuity outlook from the latest preserved outcome verification evidence.'
              : 'Select a recovery-eligible case to activate inherited verification context from /outcomes.'}
          </p>
        </div>

        {activeCase?.latestRecoveryReview && (
          <section className="mt-6 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
            <h3 className="text-lg font-semibold text-amber-100">
              Latest Preserved Recovery Durability Evidence
            </h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Info
                label="Durability Result"
                value={
                  extractField(
                    activeCase.latestRecoveryReview.outcome_summary || '',
                    'DURABILITY RESULT',
                  ) || 'Not recorded'
                }
              />
              <Info
                label="Recovery Trajectory"
                value={
                  extractField(
                    activeCase.latestRecoveryReview.outcome_summary || '',
                    'RECOVERY TRAJECTORY',
                  ) || 'Not recorded'
                }
              />
              <Info
                label="Reburn Signal"
                value={
                  extractField(
                    activeCase.latestRecoveryReview.outcome_summary || '',
                    'REBURN SIGNAL',
                  ) || 'Not recorded'
                }
              />
              <Info
                label="Recovery Confidence"
                value={
                  extractField(
                    activeCase.latestRecoveryReview.outcome_summary || '',
                    'RECOVERY CONFIDENCE',
                  ) || 'Not recorded'
                }
              />
              <Info
                label="Recovery Disposition"
                value={
                  extractField(
                    activeCase.latestRecoveryReview.outcome_summary || '',
                    'RECOVERY DISPOSITION',
                  ) || 'Not recorded'
                }
              />
              <Info
                label="Recommended Movement"
                value={
                  extractField(
                    activeCase.latestRecoveryReview.outcome_summary || '',
                    'RECOMMENDED NEXT MOVEMENT',
                  ) || 'Not recorded'
                }
              />
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold text-white">
              Preserve Recovery Durability Review
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Use this after /outcomes confirms recovery readiness or verified
              stabilization. Recovery now inherits outcome verification before
              durability is confirmed and assigns the next governed movement.
            </p>

            <div className="mt-6 space-y-5">
              <Select
                label="Recovery-Eligible Case"
                value={selectedCaseId}
                setValue={setSelectedCaseId}
                placeholder={
                  eligibleCases.length === 0
                    ? 'No recovery-eligible cases found'
                    : 'Select recovery-eligible case'
                }
                options={eligibleCases.map((item) => ({
                  label: buildRecoveryCaseLabel(item),
                  value: item.caseItem.id,
                }))}
              />

              {selectedCase && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
                  <p className="font-semibold">Inherited outcome context</p>
                  <p className="mt-2">
                    {selectedCase.inheritedVerification.verificationResult} â€¢{' '}
                    {selectedCase.inheritedVerification.recoveryReadiness} â€¢{' '}
                    {selectedCase.inheritedVerification.recurrenceSignal}
                  </p>
                </div>
              )}

              <Select
                label="Durability Result"
                value={durabilityResult}
                setValue={(value) => setDurabilityResult(value as DurabilityResult)}
                options={durabilityResults.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Recovery Trajectory"
                value={recoveryTrajectory}
                setValue={(value) =>
                  setRecoveryTrajectory(value as RecoveryTrajectory)
                }
                options={recoveryTrajectories.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Reburn Signal"
                value={reburnSignal}
                setValue={(value) => setReburnSignal(value as ReburnSignal)}
                options={reburnSignals.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <Select
                label="Recovery Confidence"
                value={recoveryConfidence}
                setValue={(value) =>
                  setRecoveryConfidence(value as RecoveryConfidence)
                }
                options={recoveryConfidences.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Durability Window
                </span>
                <input
                  value={durabilityWindow}
                  onChange={(event) => setDurabilityWindow(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                />
              </label>

              <Select
                label="Memory Impact"
                value={memoryImpact}
                setValue={(value) => setMemoryImpact(value as MemoryImpact)}
                options={memoryImpacts.map((item) => ({
                  label: item,
                  value: item,
                }))}
              />

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Recovery Interpretation
                </span>
                <textarea
                  value={interpretation}
                  onChange={(event) => setInterpretation(event.target.value)}
                  rows={5}
                  placeholder="Use operational facts only. Preserve durability evidence, inherited outcome meaning, recurrence visibility, structural memory, survivability relevance, executive continuity interpretation, and next governed movement."
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                />
              </label>

              <button
                type="button"
                onClick={preserveRecoveryReview}
                disabled={loading}
                className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300 disabled:opacity-60"
              >
                {loading
                  ? 'Preserving Recovery Review...'
                  : 'Preserve Recovery Durability Review'}
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold text-white">
              Executive Recovery Synthesis
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              This synthesis confirms whether inherited stabilization evidence is
              holding, strengthening, varying, reburning, weakening, collapsing, or
              becoming durable enough for institutional absorption.
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
              <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-400">
                Lifecycle Boundary
              </h4>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Action is not outcome. Outcome is not recovery. Recovery is not
                closure. Recovery decides whether continuity can move to Stability
                Board, remain under Command Watch, escalate to Command, return to
                Outcomes, return to Intervention, or continue durability monitoring.
              </p>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-xl font-semibold text-white">
            Recovery Doctrine
          </h3>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Recovery is a credibility test and a decision gate, not a status label.
            CGI does not restore trust simply because outcome verification appears
            positive. Recovery durability must hold across time without reburn,
            unresolved continuity pressure, recurring instability, structural
            deterioration, or continuity collapse before institutional confidence
            matures.
          </p>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature recovery intelligence must recognize earned stability while
            preserving inherited outcome meaning. Durable recovery may move toward
            Stability Board. Fragile recovery moves to Command Watch. Reburn or
            collapse moves to Command Escalation. Weak evidence returns to Outcomes
            or Intervention Review. Memory survives every movement.
          </p>
        </section>
      </section>
    </main>
  )
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

function isRecoveryEligible(
  caseItem: StabilityCase,
  latestVerificationOutcome?: OutcomeRecord,
) {
  if (caseItem.case_status === 'RECOVERY_MONITORING') return true

  const summary =
    latestVerificationOutcome?.outcome_summary || caseItem.outcome_summary || ''
  const status = latestVerificationOutcome?.outcome_status || ''

  return RECOVERY_READY_OUTCOME_MARKERS.some(
    (marker) => summary.includes(marker) || status.includes(marker),
  )
}

function findLatestVerificationOutcome(
  caseOutcomes: OutcomeRecord[],
  caseItem?: StabilityCase,
) {
  const verificationOutcome = caseOutcomes.find((outcome) =>
    isPureVerificationOutcome(outcome),
  )

  if (verificationOutcome) return verificationOutcome

  if (
    caseItem?.outcome_summary &&
    isPureVerificationSummary(caseItem.outcome_summary)
  ) {
    return {
      id: `${caseItem.id}-case-outcome-summary`,
      case_id: caseItem.id,
      outcome_status: extractField(caseItem.outcome_summary, 'VERIFICATION RESULT'),
      outcome_summary: caseItem.outcome_summary,
      created_at: caseItem.updated_at || caseItem.created_at,
    }
  }

  return undefined
}

function findLatestRecoveryReview(caseOutcomes: OutcomeRecord[]) {
  return caseOutcomes.find((outcome) => isRecoveryReview(outcome))
}

function isPureVerificationOutcome(outcome: OutcomeRecord) {
  return isPureVerificationSummary(outcome.outcome_summary || '')
}

function isPureVerificationSummary(summary: string) {
  if (!summary) return false

  if (
    summary.includes('DURABILITY RESULT') ||
    summary.includes('RECOVERY TRAJECTORY') ||
    summary.includes('REBURN SIGNAL') ||
    summary.includes('RECOVERY MATURITY') ||
    summary.includes('RECOVERY CONFIDENCE') ||
    summary.includes('RECOVERY DISPOSITION')
  ) {
    return false
  }

  return (
    hasExactLabel(summary, 'VERIFICATION RESULT') &&
    hasExactLabel(summary, 'VERIFICATION CREDIBILITY') &&
    hasExactLabel(summary, 'RECOVERY READINESS')
  )
}

function isRecoveryReview(outcome: OutcomeRecord) {
  const summary = outcome.outcome_summary || ''

  return (
    summary.includes('DURABILITY RESULT') ||
    summary.includes('RECOVERY TRAJECTORY') ||
    summary.includes('REBURN SIGNAL') ||
    summary.includes('RECOVERY MATURITY') ||
    summary.includes('RECOVERY CONFIDENCE') ||
    summary.includes('RECOVERY DISPOSITION')
  )
}

function buildInheritedVerification(
  outcome?: OutcomeRecord,
  caseItem?: StabilityCase,
): InheritedVerification {
  const summary = outcome?.outcome_summary || ''
  const caseSummary =
    caseItem?.outcome_summary && isPureVerificationSummary(caseItem.outcome_summary)
      ? caseItem.outcome_summary
      : ''

  return {
    verificationResult:
      extractField(summary, 'VERIFICATION RESULT') ||
      outcome?.outcome_status ||
      extractField(caseSummary, 'VERIFICATION RESULT') ||
      'Verification evidence pending',
    verificationCredibility:
      extractField(summary, 'VERIFICATION CREDIBILITY') ||
      extractField(caseSummary, 'VERIFICATION CREDIBILITY') ||
      'Verification credibility pending',
    verificationTrajectory:
      extractField(summary, 'VERIFICATION TRAJECTORY') ||
      extractField(caseSummary, 'VERIFICATION TRAJECTORY') ||
      'Verification trajectory pending',
    recurrenceSignal:
      extractField(summary, 'RECURRENCE SIGNAL') ||
      extractField(caseSummary, 'RECURRENCE SIGNAL') ||
      'Recurrence visibility pending',
    recoveryReadiness:
      extractField(summary, 'RECOVERY READINESS') ||
      extractField(caseSummary, 'RECOVERY READINESS') ||
      'Recovery readiness pending',
    continuityOutlook:
      extractField(summary, 'CONTINUITY OUTLOOK') ||
      extractField(caseSummary, 'CONTINUITY OUTLOOK') ||
      'Continuity outlook pending',
    stabilizationConfidence:
      extractField(summary, 'STABILIZATION CONFIDENCE') ||
      extractField(caseSummary, 'STABILIZATION CONFIDENCE') ||
      'Stabilization confidence pending',
    survivabilitySignal:
      extractField(summary, 'SURVIVABILITY SIGNAL') ||
      extractField(caseSummary, 'SURVIVABILITY SIGNAL') ||
      'Survivability signal pending',
    executiveMeaning:
      extractField(summary, 'EXECUTIVE MEANING') ||
      extractField(caseSummary, 'EXECUTIVE MEANING') ||
      'Executive outcome meaning pending',
  }
}

function hasExactLabel(summary: string, label: string) {
  const lines = summary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const target = label.trim().toLowerCase()

  return lines.some((line) => line.toLowerCase() === target)
}

function extractField(summary: string, label: string) {
  if (!summary) return ''

  const lines = summary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const target = label.trim().toLowerCase()
  const index = lines.findIndex((line) => line.toLowerCase() === target)

  if (index === -1) return ''

  return lines[index + 1] || ''
}

function buildRecoveryContinuityProfiles(input: {
  eligibleCases: RecoveryEligibleCase[]
  outcomes: OutcomeRecord[]
}) {
  if (input.eligibleCases.length === 0) {
    return [
      {
        title: 'Recovery Stability Distribution',
        value:
          'Awaiting recovery-eligible outcome evidence before durability distribution activates.',
      },
      {
        title: 'Durability Observation Load',
        value:
          'Recovery observation load will activate when outcomes become eligible for durability review.',
      },
      {
        title: 'Reburn Visibility',
        value:
          'Reburn visibility pending inherited recurrence signals from /outcomes.',
      },
      {
        title: 'Continuity Memory Visibility',
        value:
          'Structural continuity memory remains available for future recovery learning.',
      },
    ]
  }

  const recurrenceVisible = input.eligibleCases.filter(
    (item) =>
      item.inheritedVerification.recurrenceSignal.includes('RECURRENCE') &&
      item.inheritedVerification.recurrenceSignal !== 'NO_RECURRENCE_VISIBLE',
  ).length

  const recoveryReady = input.eligibleCases.filter((item) =>
    item.inheritedVerification.recoveryReadiness.includes('RECOVERY'),
  ).length

  return [
    {
      title: 'Recovery Stability Distribution',
      value:
        recurrenceVisible === 0
          ? 'No concentrated fragile recovery pattern currently visible across recovery-eligible outcomes.'
          : 'Some recovery-eligible outcomes carry inherited recurrence visibility.',
    },
    {
      title: 'Durability Observation Load',
      value:
        input.eligibleCases.length <= 3
          ? 'Recovery observation activity remains within manageable continuity thresholds.'
          : 'Recovery observation load is increasing and may require continuity review prioritization.',
    },
    {
      title: 'Reburn Visibility',
      value:
        recurrenceVisible === 0
          ? 'No active reburn concentration currently requiring escalation.'
          : 'Inherited recurrence posture remains visible and should be watched during durability review.',
    },
    {
      title: 'Continuity Memory Visibility',
      value:
        recoveryReady > 0
          ? 'Structural continuity memory remains preserved while recovery-ready outcomes mature.'
          : 'Continuity memory remains visible while recovery eligibility continues to strengthen.',
    },
  ]
}

function deriveRecoveryMaturity(
  durabilityResult: DurabilityResult,
  trajectory: RecoveryTrajectory,
  reburnSignal: ReburnSignal,
  confidence: RecoveryConfidence,
  durabilityWindow: string,
  memoryImpact: MemoryImpact,
): RecoveryMaturity {
  const days = Number.parseInt(durabilityWindow, 10)

  if (
    durabilityResult === 'RECOVERY_COLLAPSE' ||
    trajectory === 'COLLAPSING' ||
    confidence === 'COLLAPSED'
  ) {
    return 'EARLY_RECOVERY'
  }

  if (
    durabilityResult === 'DURABLE_RECOVERY_CONFIRMED' &&
    trajectory === 'STRENGTHENING' &&
    reburnSignal === 'NO_REBURN_VISIBLE' &&
    confidence === 'CREDIBLE' &&
    days >= 30 &&
    memoryImpact === 'NO_MEMORY_ESCALATION_REQUIRED'
  ) {
    return 'DURABLE_RECOVERY_ESTABLISHED'
  }

  if (durabilityResult === 'DURABLE_RECOVERY_CONFIRMED' && confidence === 'CREDIBLE') {
    return 'STABLE_UNDER_OBSERVATION'
  }

  if (durabilityResult === 'RECOVERY_HOLDING' && trajectory === 'STRENGTHENING') {
    return 'RECOVERY_MATURING'
  }

  if (durabilityResult === 'RECOVERY_HOLDING' && confidence !== 'LOW') {
    return 'DURABILITY_BUILDING'
  }

  if (
    durabilityResult === 'STABILITY_UNDER_VARIANCE' ||
    trajectory === 'VARIABLE_STABILITY'
  ) {
    return 'VARIABLE_STABILITY'
  }

  return 'EARLY_RECOVERY'
}

function deriveCommandPosture(
  durabilityResult: DurabilityResult,
  trajectory: RecoveryTrajectory,
  reburnSignal: ReburnSignal,
  confidence: RecoveryConfidence,
  maturity: RecoveryMaturity,
): CommandPosture {
  if (
    durabilityResult === 'RECOVERY_COLLAPSE' ||
    trajectory === 'COLLAPSING' ||
    confidence === 'COLLAPSED'
  ) {
    return 'URGENT_CONTINUITY_REVIEW'
  }

  if (
    durabilityResult === 'REBURN_DETECTED' ||
    reburnSignal === 'REBURN_DETECTED' ||
    reburnSignal === 'RECURRENT_REBURN_PATTERN'
  ) {
    return 'EXECUTIVE_CONTINUITY_REVIEW'
  }

  if (confidence === 'LOW') {
    return 'ELEVATED_RECOVERY_REVIEW'
  }

  if (maturity === 'VARIABLE_STABILITY' || confidence === 'VARIABLE') {
    return 'ELEVATED_RECOVERY_REVIEW'
  }

  if (maturity === 'DURABILITY_BUILDING') return 'DURABILITY_BUILDING'

  if (
    maturity === 'RECOVERY_MATURING' ||
    maturity === 'STABLE_UNDER_OBSERVATION' ||
    maturity === 'DURABLE_RECOVERY_ESTABLISHED'
  ) {
    return 'STABILITY_HOLDING'
  }

  return 'CONTINUITY_OBSERVATION'
}

function deriveRecoveryDisposition(input: {
  durabilityResult: DurabilityResult
  recoveryTrajectory: RecoveryTrajectory
  reburnSignal: ReburnSignal
  recoveryConfidence: RecoveryConfidence
  memoryImpact: MemoryImpact
  recoveryMaturity: RecoveryMaturity
  inheritedVerification?: InheritedVerification
}): RecoveryDisposition {
  if (
    input.durabilityResult === 'RECOVERY_COLLAPSE' ||
    input.recoveryTrajectory === 'COLLAPSING' ||
    input.recoveryConfidence === 'COLLAPSED'
  ) {
    return 'MOVE_TO_COMMAND_ESCALATION'
  }

  if (
    input.durabilityResult === 'REBURN_DETECTED' ||
    input.reburnSignal === 'REBURN_DETECTED' ||
    input.reburnSignal === 'RECURRENT_REBURN_PATTERN'
  ) {
    return 'MOVE_TO_COMMAND_ESCALATION'
  }

  if (
    input.recoveryConfidence === 'LOW' &&
    input.inheritedVerification?.verificationCredibility
      .toUpperCase()
      .includes('LOW')
  ) {
    return 'RETURN_TO_OUTCOMES_REVIEW'
  }

  if (
    input.recoveryConfidence === 'LOW' ||
    input.memoryImpact === 'MEMORY_ESCALATION_REQUIRED'
  ) {
    return 'RETURN_TO_INTERVENTION_REVIEW'
  }

  if (
    input.durabilityResult === 'DURABLE_RECOVERY_CONFIRMED' &&
    input.recoveryMaturity === 'DURABLE_RECOVERY_ESTABLISHED'
  ) {
    return 'MOVE_TO_STABILITY_BOARD'
  }

  if (
    input.durabilityResult === 'DURABLE_RECOVERY_CONFIRMED' &&
    input.recoveryConfidence === 'CREDIBLE' &&
    input.reburnSignal === 'NO_REBURN_VISIBLE'
  ) {
    return 'MOVE_TO_STABILITY_BOARD'
  }

  if (
    input.durabilityResult === 'RECOVERY_HOLDING' &&
    input.recoveryTrajectory === 'STRENGTHENING' &&
    input.recoveryConfidence !== 'VARIABLE'
  ) {
    return 'CONTINUE_RECOVERY_MONITORING'
  }

  if (
    input.durabilityResult === 'RECOVERY_HOLDING' ||
    input.durabilityResult === 'STABILITY_UNDER_VARIANCE' ||
    input.recoveryConfidence === 'VARIABLE' ||
    input.reburnSignal === 'RECURRENCE_OBSERVATION'
  ) {
    return 'MOVE_TO_COMMAND_WATCH'
  }

  return 'CONTINUE_RECOVERY_MONITORING'
}

function deriveSurvivabilitySignal(
  commandPosture: CommandPosture,
): RecoverySurvivabilitySignal {
  switch (commandPosture) {
    case 'URGENT_CONTINUITY_REVIEW':
      return 'SURVIVABILITY_COMPROMISED'
    case 'EXECUTIVE_CONTINUITY_REVIEW':
      return 'SURVIVABILITY_PRESSURE_RISING'
    case 'ELEVATED_RECOVERY_REVIEW':
      return 'DURABILITY_REQUIRES_OBSERVATION'
    case 'DURABILITY_BUILDING':
    case 'STABILITY_HOLDING':
      return 'SURVIVABILITY_OBSERVATION_ACTIVE'
    default:
      return 'SURVIVABILITY_BACKGROUND_STABLE'
  }
}

function deriveExecutiveMeaning(
  maturity: RecoveryMaturity,
  durabilityWindow: string,
  inherited?: InheritedVerification,
) {
  const inheritedPrefix =
    inherited?.verificationResult === 'VERIFIED_STABILIZATION'
      ? 'Verified stabilization is inherited from Outcomes. '
      : ''

  const meanings: Record<RecoveryMaturity, string> = {
    EARLY_RECOVERY:
      `${inheritedPrefix}Recovery evidence is still early. Durability observation should continue before confidence matures.`,
    VARIABLE_STABILITY: `${inheritedPrefix}Recovery is showing variable stability across the ${durabilityWindow} observation window. Stabilization remains verified, but durability is still under observation.`,
    HOLDING_STABLE: `${inheritedPrefix}Recovery is holding across the ${durabilityWindow} durability window while confidence continues to strengthen.`,
    DURABILITY_BUILDING: `${inheritedPrefix}Recovery durability is building steadily across the ${durabilityWindow} observation window. Current continuity signals support measured confidence progression.`,
    RECOVERY_MATURING: `${inheritedPrefix}Recovery maturity is strengthening across the ${durabilityWindow} durability window. No major deterioration signal is currently weakening continuity confidence.`,
    STABLE_UNDER_OBSERVATION: `${inheritedPrefix}Recovery remains stable across the ${durabilityWindow} durability window under normal continuity observation conditions.`,
    DURABLE_RECOVERY_ESTABLISHED: `${inheritedPrefix}Durable recovery credibility is established across the ${durabilityWindow} durability window. Continuity monitoring may remain calm and proportional.`,
  }

  return meanings[maturity]
}

function deriveRecoveryPressure(posture: CommandPosture) {
  switch (posture) {
    case 'CONTINUITY_OBSERVATION':
      return 'Recovery durability remains stable under current continuity observation conditions.'
    case 'STABILITY_HOLDING':
      return 'Recovery stability remains credible while durability confidence continues to mature.'
    case 'DURABILITY_BUILDING':
      return 'Recovery durability is strengthening steadily while continuity observation remains active.'
    case 'ELEVATED_RECOVERY_REVIEW':
      return 'Recovery remains under measured observation due to variability indicators or recurrence visibility conditions.'
    case 'EXECUTIVE_CONTINUITY_REVIEW':
      return 'Recovery durability is weakening. Recurrence visibility or structural instability indicators require executive awareness.'
    case 'URGENT_CONTINUITY_REVIEW':
      return 'Recovery collapse indicators require urgent executive continuity review.'
    default:
      return 'Recovery durability remains under proportional continuity observation.'
  }
}

function deriveMemoryMeaning(impact: MemoryImpact) {
  const meanings: Record<MemoryImpact, string> = {
    NO_MEMORY_ESCALATION_REQUIRED:
      'No memory escalation is currently required. Structural continuity memory remains available for future learning.',
    STRUCTURAL_MEMORY_PRESERVED:
      'Structural memory preserved for future continuity learning.',
    CONTINUITY_MEMORY_VISIBLE:
      'Continuity memory remains visible while durability confidence continues to mature.',
    MEMORY_ESCALATION_REQUIRED:
      'Structural memory escalation is advised because unresolved continuity instability may still exist.',
    RECURRING_STRUCTURAL_PATTERN:
      'Recurring structural continuity patterns remain visible and may require leadership review.',
  }

  return meanings[impact]
}

function deriveRecoveryMovementDestination(disposition: RecoveryDisposition) {
  const destinations: Record<RecoveryDisposition, string> = {
    MOVE_TO_STABILITY_BOARD:
      '/system Stability Board â€” absorb into institutional continuity posture.',
    MOVE_TO_COMMAND_WATCH:
      '/command Command Watch â€” preserve executive visibility without full escalation.',
    MOVE_TO_COMMAND_ESCALATION:
      '/command Command Escalation â€” executive continuity review required.',
    RETURN_TO_OUTCOMES_REVIEW:
      '/outcomes Outcomes Review â€” verification evidence requires strengthening.',
    RETURN_TO_INTERVENTION_REVIEW:
      '/interventions Intervention Review â€” stabilization action requires renewed review.',
    CONTINUE_RECOVERY_MONITORING:
      '/recovery Recovery Monitoring â€” continue durability observation.',
  }

  return destinations[disposition]
}

function deriveRecoveryMovementReason(disposition: RecoveryDisposition) {
  const reasons: Record<RecoveryDisposition, string> = {
    MOVE_TO_STABILITY_BOARD:
      'Recovery is durable enough to be absorbed into institutional posture while structural memory remains preserved.',
    MOVE_TO_COMMAND_WATCH:
      'Recovery is not collapsing, but durability remains fragile, variable, or recurrence-visible enough to require executive watch.',
    MOVE_TO_COMMAND_ESCALATION:
      'Recovery has reburned, collapsed, or moved toward continuity compromise. Executive review is required.',
    RETURN_TO_OUTCOMES_REVIEW:
      'Verification evidence is not strong enough to support durability confidence. Outcome credibility must be reviewed.',
    RETURN_TO_INTERVENTION_REVIEW:
      'Recovery weakness suggests stabilization action may need renewed intervention review before durability can mature.',
    CONTINUE_RECOVERY_MONITORING:
      'Recovery is holding but has not yet matured enough for final institutional absorption.',
  }

  return reasons[disposition]
}

function deriveRecoveryMovementMeaning(disposition: RecoveryDisposition) {
  const meanings: Record<RecoveryDisposition, string> = {
    MOVE_TO_STABILITY_BOARD:
      'Recovery can move toward the Stability Board. This is not memory erasure. Stability Board must preserve recurrence history, recovery evidence, and durability context.',
    MOVE_TO_COMMAND_WATCH:
      'Recovery should remain visible to Command. The case does not require urgent escalation, but executive awareness should continue until durability becomes credible.',
    MOVE_TO_COMMAND_ESCALATION:
      'Recovery has failed or reburned. CGI must prevent the instability from disappearing behind a false recovery label.',
    RETURN_TO_OUTCOMES_REVIEW:
      'Recovery cannot mature because outcome evidence remains weak. The system should return to verification before continuing durability claims.',
    RETURN_TO_INTERVENTION_REVIEW:
      'Recovery cannot be trusted yet because stabilization action may not be sufficient. The system should return to intervention review.',
    CONTINUE_RECOVERY_MONITORING:
      'Recovery is still under observation. Durability may be building, but the case should remain in recovery until stronger confidence is established.',
  }

  return meanings[disposition]
}

function deriveCaseStatusAfterRecovery(disposition: RecoveryDisposition) {
  switch (disposition) {
    case 'MOVE_TO_STABILITY_BOARD':
      return 'STABILIZED'
    case 'MOVE_TO_COMMAND_ESCALATION':
      return 'REOPENED'
    case 'RETURN_TO_OUTCOMES_REVIEW':
      return 'FOLLOW_UP_REQUIRED'
    case 'RETURN_TO_INTERVENTION_REVIEW':
      return 'FOLLOW_UP_REQUIRED'
    case 'MOVE_TO_COMMAND_WATCH':
    case 'CONTINUE_RECOVERY_MONITORING':
    default:
      return 'RECOVERY_MONITORING'
  }
}

function getLatestRecoveryInterpretation(outcome?: OutcomeRecord) {
  return extractField(outcome?.outcome_summary || '', 'RECOVERY INTERPRETATION')
}

function buildRecoveryCaseLabel(item: RecoveryEligibleCase) {
  return `${item.caseItem.beneficiary_name} â€¢ ${item.caseItem.case_status}`
}

function buildRecoverySummary(input: {
  selectedCase: RecoveryEligibleCase
  durabilityResult: DurabilityResult
  recoveryTrajectory: RecoveryTrajectory
  reburnSignal: ReburnSignal
  recoveryConfidence: RecoveryConfidence
  durabilityWindow: string
  memoryImpact: MemoryImpact
  recoveryMaturity: RecoveryMaturity
  commandPosture: CommandPosture
  recoveryDisposition: RecoveryDisposition
  survivabilitySignal: RecoverySurvivabilitySignal
  executiveMeaning: string
  recoveryPressure: string
  memoryMeaning: string
  movementMeaning: string
  movementDestination: string
  movementReason: string
  interpretation: string
}) {
  return `
INHERITED VERIFICATION RESULT
${input.selectedCase.inheritedVerification.verificationResult}

INHERITED VERIFICATION CREDIBILITY
${input.selectedCase.inheritedVerification.verificationCredibility}

INHERITED VERIFICATION TRAJECTORY
${input.selectedCase.inheritedVerification.verificationTrajectory}

INHERITED RECURRENCE SIGNAL
${input.selectedCase.inheritedVerification.recurrenceSignal}

INHERITED RECOVERY READINESS
${input.selectedCase.inheritedVerification.recoveryReadiness}

INHERITED CONTINUITY OUTLOOK
${input.selectedCase.inheritedVerification.continuityOutlook}

INHERITED STABILIZATION CONFIDENCE
${input.selectedCase.inheritedVerification.stabilizationConfidence}

DURABILITY RESULT
${input.durabilityResult}

RECOVERY TRAJECTORY
${input.recoveryTrajectory}

REBURN SIGNAL
${input.reburnSignal}

RECOVERY CONFIDENCE
${input.recoveryConfidence}

DURABILITY WINDOW
${input.durabilityWindow}

MEMORY IMPACT
${input.memoryImpact}

RECOVERY MATURITY
${input.recoveryMaturity}

COMMAND POSTURE
${input.commandPosture}

RECOVERY DISPOSITION
${input.recoveryDisposition}

RECOMMENDED NEXT MOVEMENT
${input.movementDestination}

MOVEMENT REASON
${input.movementReason}

MOVEMENT MEANING
${input.movementMeaning}

RECOVERY SURVIVABILITY SIGNAL
${input.survivabilitySignal}

EXECUTIVE MEANING
${input.executiveMeaning}

RECOVERY PRESSURE
${input.recoveryPressure}

MEMORY MEANING
${input.memoryMeaning}

RECOVERY INTERPRETATION
${input.interpretation.trim() || 'No additional operational recovery interpretation entered.'}

LIFECYCLE BOUNDARY
Action is not outcome.
Outcome is not recovery.
Recovery is not closure.
Durability must be observed before trust is restored.
Final posture must be absorbed into Stability Board only when recovery can preserve evidence, recurrence history, and structural memory.
  `.trim()
}

function Select({
  label,
  value,
  setValue,
  options,
  placeholder,
}: {
  label: string
  value: string
  setValue: (value: string) => void
  options: { label: string; value: string }[]
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}

