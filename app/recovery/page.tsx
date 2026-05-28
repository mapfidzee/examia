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

type RecoveryEligibleCase = {
  caseItem: StabilityCase
  latestOutcome?: OutcomeRecord
  inheritedVerification: {
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
        const latestOutcome = outcomeRows.find(
          (outcome) => outcome.case_id === caseItem.id,
        )

        return {
          caseItem,
          latestOutcome,
          inheritedVerification: buildInheritedVerification(latestOutcome),
        }
      })
      .filter((item) => isRecoveryEligible(item.caseItem, item.latestOutcome))

    setEligibleCases(inheritedCases)
  }

  const selectedCase = useMemo(
    () => eligibleCases.find((item) => item.caseItem.id === selectedCaseId),
    [eligibleCases, selectedCaseId],
  )

  const hasSelectedRecoveryCase = Boolean(selectedCase)

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

  const survivabilitySignal = useMemo(
    () => deriveSurvivabilitySignal(commandPosture),
    [commandPosture],
  )

  const executiveMeaning = deriveExecutiveMeaning(
    recoveryMaturity,
    durabilityWindow,
  )

  const recoveryPressure = deriveRecoveryPressure(commandPosture)
  const memoryMeaning = deriveMemoryMeaning(memoryImpact)

  const displayedDurabilityResult = hasSelectedRecoveryCase
    ? durabilityResult
    : 'Durability result pending recovery-eligible case selection'

  const displayedRecoveryTrajectory = hasSelectedRecoveryCase
    ? recoveryTrajectory
    : 'Recovery trajectory pending recovery-eligible case selection'

  const displayedReburnSignal = hasSelectedRecoveryCase
    ? reburnSignal
    : 'Reburn interpretation pending recovery-eligible case selection'

  const displayedRecoveryConfidence = hasSelectedRecoveryCase
    ? recoveryConfidence
    : 'Recovery confidence pending recovery-eligible case selection'

  const displayedMemoryImpact = hasSelectedRecoveryCase
    ? memoryImpact
    : 'Memory impact pending recovery-eligible case selection'

  const displayedRecoveryMaturity = hasSelectedRecoveryCase
    ? recoveryMaturity
    : 'RECOVERY_MATURITY_PENDING'

  const displayedCommandPosture = hasSelectedRecoveryCase
    ? commandPosture
    : 'PENDING_RECOVERY_SELECTION'

  const displayedSurvivabilitySignal = hasSelectedRecoveryCase
    ? survivabilitySignal
    : 'SURVIVABILITY_INTERPRETATION_PENDING'

  const displayedExecutiveMeaning = hasSelectedRecoveryCase
    ? executiveMeaning
    : 'Executive recovery meaning will activate after a recovery-eligible case is selected.'

  const displayedRecoveryPressure = hasSelectedRecoveryCase
    ? recoveryPressure
    : 'Recovery pressure interpretation will activate after inherited outcome evidence is selected for durability review.'

  const displayedMemoryMeaning = hasSelectedRecoveryCase
    ? memoryMeaning
    : 'Structural memory interpretation will activate after recovery durability review begins.'

  const inheritedSummary = selectedCase
    ? selectedCase.inheritedVerification
    : buildInheritedVerification(undefined)

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
    ['DURABILITY WINDOW', hasSelectedRecoveryCase ? durabilityWindow : 'Durability window pending recovery-eligible case selection'],
    ['MEMORY IMPACT', displayedMemoryImpact],
    ['RECOVERY MATURITY', displayedRecoveryMaturity],
    ['COMMAND POSTURE', displayedCommandPosture],
    ['RECOVERY SURVIVABILITY SIGNAL', displayedSurvivabilitySignal],
    ['EXECUTIVE MEANING', displayedExecutiveMeaning],
    ['RECOVERY PRESSURE', displayedRecoveryPressure],
    ['MEMORY MEANING', displayedMemoryMeaning],
    [
      'NEXT LIFECYCLE STATE',
      selectedCase
        ? 'Recovery durability observation continues under proportional continuity governance.'
        : 'Awaiting recovery durability review assignment.',
    ],
    [
      'CASE SIGNAL',
      selectedCase?.caseItem.beneficiary_name ??
        'Executive synthesis will activate after recovery-eligible case selection.',
    ],
    [
      'STABILITY DOMAIN',
      selectedCase?.caseItem.support_domain ??
        'Continuity domain visibility pending recovery-eligible case assignment.',
    ],
    [
      'CURRENT CONTINUITY STATUS',
      selectedCase?.caseItem.case_status ??
        'Recovery continuity posture pending inherited outcome selection.',
    ],
    [
      'RECOVERY INTERPRETATION',
      interpretation.trim() ||
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
      survivabilitySignal,
      executiveMeaning,
      recoveryPressure,
      memoryMeaning,
      interpretation,
    })

    const { error: outcomeError } = await supabase
      .from('case_outcomes')
      .insert({
        case_id: selectedCase.caseItem.id,
        outcome_status: durabilityResult,
        outcome_summary: summary,
      })

    if (outcomeError) {
      alert(outcomeError.message)
      setLoading(false)
      return
    }

    const nextStatus =
      durabilityResult === 'DURABLE_RECOVERY_CONFIRMED'
        ? 'STABILIZED'
        : durabilityResult === 'RECOVERY_COLLAPSE' ||
            durabilityResult === 'REBURN_DETECTED'
          ? 'REOPENED'
          : 'RECOVERY_MONITORING'

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

    setMessage(
      'Recovery durability review preserved. Outcome inheritance, durability posture, memory meaning, and lifecycle movement remain visible.',
    )

    setSelectedCaseId('')
    setInterpretation('')
    setLoading(false)

    await loadRecoveryEligibleCases()
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="mx-auto max-w-7xl px-6 py-8">
        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-100">
            {message}
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
          TSINAXA CGI • RECOVERY DURABILITY INTELLIGENCE
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
            <span className="font-semibold">Boundary:</span> /recovery confirms
            durability. It inherits verification evidence from /outcomes, but does
            not erase structural memory, remove recurrence visibility, or restore
            institutional trust automatically.
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
            {selectedCase
              ? 'This recovery review is inheriting verification credibility, recurrence posture, recovery readiness, and continuity outlook from the latest preserved outcome evidence.'
              : 'Select a recovery-eligible case to activate inherited verification context from /outcomes.'}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold text-white">
              Preserve Recovery Durability Review
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Use this after /outcomes confirms recovery readiness or verified
              stabilization. Recovery now inherits outcome verification before
              durability is confirmed.
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
                    {selectedCase.latestOutcome?.outcome_status ||
                      'Outcome status not explicitly recorded'}{' '}
                    • {selectedCase.inheritedVerification.recoveryReadiness} •{' '}
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
                  placeholder="Use operational facts only. Preserve durability evidence, inherited outcome meaning, recurrence visibility, structural memory, survivability relevance, and executive continuity interpretation."
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
              becoming durable recovery.
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
              <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-400">
                Lifecycle Boundary
              </h4>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Action is not outcome. Outcome is not recovery. Recovery is not
                memory erasure. Durability must be observed before trust is
                restored.
              </p>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-xl font-semibold text-white">
            Recovery Doctrine
          </h3>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Recovery is a credibility test, not a status label. CGI does not
            restore trust simply because outcome verification appears positive.
            Recovery durability must hold across time without reburn, unresolved
            continuity pressure, recurring instability, structural deterioration,
            or continuity collapse before institutional confidence matures.
          </p>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature recovery intelligence must recognize earned stability while
            preserving inherited outcome meaning. When recovery holds without
            reburn, collapse, escalation concentration, or structural
            deterioration, the system should express measured confidence while
            preserving structural continuity memory for future institutional
            learning.
          </p>
        </section>
      </section>
    </main>
  )
}

function isRecoveryEligible(caseItem: StabilityCase, latestOutcome?: OutcomeRecord) {
  if (caseItem.case_status === 'RECOVERY_MONITORING') return true

  const summary = latestOutcome?.outcome_summary || caseItem.outcome_summary || ''
  const status = latestOutcome?.outcome_status || ''

  return RECOVERY_READY_OUTCOME_MARKERS.some(
    (marker) => summary.includes(marker) || status.includes(marker),
  )
}

function buildInheritedVerification(outcome?: OutcomeRecord) {
  const summary = outcome?.outcome_summary || ''

  return {
    verificationResult:
      extractField(summary, 'VERIFICATION RESULT') ||
      outcome?.outcome_status ||
      'Verification evidence pending',
    verificationCredibility:
      extractField(summary, 'VERIFICATION CREDIBILITY') ||
      'Verification credibility pending',
    verificationTrajectory:
      extractField(summary, 'VERIFICATION TRAJECTORY') ||
      'Verification trajectory pending',
    recurrenceSignal:
      extractField(summary, 'RECURRENCE SIGNAL') ||
      'Recurrence visibility pending',
    recoveryReadiness:
      extractField(summary, 'RECOVERY READINESS') ||
      'Recovery readiness pending',
    continuityOutlook:
      extractField(summary, 'CONTINUITY OUTLOOK') ||
      'Continuity outlook pending',
    stabilizationConfidence:
      extractField(summary, 'STABILIZATION CONFIDENCE') ||
      'Stabilization confidence pending',
    survivabilitySignal:
      extractField(summary, 'SURVIVABILITY SIGNAL') ||
      'Survivability signal pending',
    executiveMeaning:
      extractField(summary, 'EXECUTIVE MEANING') ||
      'Executive outcome meaning pending',
  }
}

function extractField(summary: string, label: string) {
  if (!summary) return ''

  const lines = summary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const index = lines.findIndex((line) => line === label)

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

  const recurrenceVisible = input.eligibleCases.filter((item) =>
    item.inheritedVerification.recurrenceSignal.includes('RECURRENCE'),
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
    reburnSignal === 'RECURRENT_REBURN_PATTERN'
  ) {
    return 'EXECUTIVE_CONTINUITY_REVIEW'
  }

  if (maturity === 'VARIABLE_STABILITY' || confidence === 'VARIABLE') {
    return 'ELEVATED_RECOVERY_REVIEW'
  }

  if (maturity === 'DURABILITY_BUILDING') return 'DURABILITY_BUILDING'

  if (
    maturity === 'RECOVERY_MATURING' ||
    maturity === 'STABLE_UNDER_OBSERVATION'
  ) {
    return 'STABILITY_HOLDING'
  }

  return 'CONTINUITY_OBSERVATION'
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
) {
  const meanings: Record<RecoveryMaturity, string> = {
    EARLY_RECOVERY:
      'Recovery evidence is still early. Durability observation should continue before confidence matures.',
    VARIABLE_STABILITY: `Recovery is showing variable stability across the ${durabilityWindow} observation window. Current conditions support continued continuity observation without escalation.`,
    HOLDING_STABLE: `Recovery is holding across the ${durabilityWindow} durability window while confidence continues to strengthen.`,
    DURABILITY_BUILDING: `Recovery durability is building steadily across the ${durabilityWindow} observation window. Current continuity signals support measured confidence progression.`,
    RECOVERY_MATURING: `Recovery maturity is strengthening across the ${durabilityWindow} durability window. No major deterioration signal is currently weakening continuity confidence.`,
    STABLE_UNDER_OBSERVATION: `Recovery remains stable across the ${durabilityWindow} durability window under normal continuity observation conditions.`,
    DURABLE_RECOVERY_ESTABLISHED: `Durable recovery credibility is established across the ${durabilityWindow} durability window. Continuity monitoring may remain calm and proportional.`,
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

function buildRecoveryCaseLabel(item: RecoveryEligibleCase) {
  return `${item.caseItem.beneficiary_name} • ${item.caseItem.case_status}`
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
  survivabilitySignal: RecoverySurvivabilitySignal
  executiveMeaning: string
  recoveryPressure: string
  memoryMeaning: string
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
Recovery is not memory erasure.
Durability must be observed before trust is restored.
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