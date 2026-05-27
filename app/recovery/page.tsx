'use client';

import { useMemo, useState } from 'react';

type DurabilityResult =
  | 'DURABLE_RECOVERY_CONFIRMED'
  | 'RECOVERY_HOLDING'
  | 'STABILITY_UNDER_VARIANCE'
  | 'REBURN_DETECTED'
  | 'RECOVERY_COLLAPSE';

type RecoveryTrajectory =
  | 'STRENGTHENING'
  | 'HOLDING'
  | 'VARIABLE_STABILITY'
  | 'WEAKENING'
  | 'COLLAPSING';

type ReburnSignal =
  | 'NO_REBURN_VISIBLE'
  | 'RECURRENCE_OBSERVATION'
  | 'REBURN_DETECTED'
  | 'RECURRENT_REBURN_PATTERN';

type RecoveryConfidence =
  | 'CREDIBLE'
  | 'BUILDING'
  | 'VARIABLE'
  | 'LOW'
  | 'COLLAPSED';

type MemoryImpact =
  | 'NO_MEMORY_ESCALATION_REQUIRED'
  | 'STRUCTURAL_MEMORY_PRESERVED'
  | 'CONTINUITY_MEMORY_VISIBLE'
  | 'MEMORY_ESCALATION_REQUIRED'
  | 'RECURRING_STRUCTURAL_PATTERN';

type CommandPosture =
  | 'CONTINUITY_OBSERVATION'
  | 'STABILITY_HOLDING'
  | 'DURABILITY_BUILDING'
  | 'ELEVATED_RECOVERY_REVIEW'
  | 'EXECUTIVE_CONTINUITY_REVIEW'
  | 'URGENT_CONTINUITY_REVIEW';

type RecoveryMaturity =
  | 'EARLY_RECOVERY'
  | 'VARIABLE_STABILITY'
  | 'HOLDING_STABLE'
  | 'DURABILITY_BUILDING'
  | 'RECOVERY_MATURING'
  | 'STABLE_UNDER_OBSERVATION'
  | 'DURABLE_RECOVERY_ESTABLISHED';

type RecoverySurvivabilitySignal =
  | 'SURVIVABILITY_BACKGROUND_STABLE'
  | 'SURVIVABILITY_OBSERVATION_ACTIVE'
  | 'DURABILITY_REQUIRES_OBSERVATION'
  | 'SURVIVABILITY_PRESSURE_RISING'
  | 'SURVIVABILITY_COMPROMISED';

const recoveryCases = [
  {
    id: 'case-001',
    signal: 'Repeated late coverage recovery after escalation',
    domain: 'Coverage Continuity',
    status: 'Verified stabilization under observation',
  },
  {
    id: 'case-002',
    signal: 'Workflow pressure reduced after routing intervention',
    domain: 'Operational Flow',
    status: 'Durability confidence building',
  },
];

const durabilityResults: DurabilityResult[] = [
  'DURABLE_RECOVERY_CONFIRMED',
  'RECOVERY_HOLDING',
  'STABILITY_UNDER_VARIANCE',
  'REBURN_DETECTED',
  'RECOVERY_COLLAPSE',
];

const recoveryTrajectories: RecoveryTrajectory[] = [
  'STRENGTHENING',
  'HOLDING',
  'VARIABLE_STABILITY',
  'WEAKENING',
  'COLLAPSING',
];

const reburnSignals: ReburnSignal[] = [
  'NO_REBURN_VISIBLE',
  'RECURRENCE_OBSERVATION',
  'REBURN_DETECTED',
  'RECURRENT_REBURN_PATTERN',
];

const recoveryConfidences: RecoveryConfidence[] = [
  'CREDIBLE',
  'BUILDING',
  'VARIABLE',
  'LOW',
  'COLLAPSED',
];

const memoryImpacts: MemoryImpact[] = [
  'NO_MEMORY_ESCALATION_REQUIRED',
  'STRUCTURAL_MEMORY_PRESERVED',
  'CONTINUITY_MEMORY_VISIBLE',
  'MEMORY_ESCALATION_REQUIRED',
  'RECURRING_STRUCTURAL_PATTERN',
];

function deriveRecoveryMaturity(
  durabilityResult: DurabilityResult,
  trajectory: RecoveryTrajectory,
  reburnSignal: ReburnSignal,
  confidence: RecoveryConfidence,
  durabilityWindow: string,
  memoryImpact: MemoryImpact,
): RecoveryMaturity {
  const days = Number.parseInt(durabilityWindow, 10);

  if (
    durabilityResult === 'DURABLE_RECOVERY_CONFIRMED' &&
    trajectory === 'STRENGTHENING' &&
    reburnSignal === 'NO_REBURN_VISIBLE' &&
    confidence === 'CREDIBLE' &&
    days >= 30 &&
    memoryImpact === 'NO_MEMORY_ESCALATION_REQUIRED'
  ) {
    return 'DURABLE_RECOVERY_ESTABLISHED';
  }

  if (
    durabilityResult === 'DURABLE_RECOVERY_CONFIRMED' &&
    confidence === 'CREDIBLE'
  ) {
    return 'STABLE_UNDER_OBSERVATION';
  }

  if (
    durabilityResult === 'RECOVERY_HOLDING' &&
    trajectory === 'STRENGTHENING'
  ) {
    return 'RECOVERY_MATURING';
  }

  if (
    durabilityResult === 'RECOVERY_HOLDING' &&
    confidence !== 'LOW'
  ) {
    return 'DURABILITY_BUILDING';
  }

  if (
    durabilityResult === 'STABILITY_UNDER_VARIANCE' ||
    trajectory === 'VARIABLE_STABILITY'
  ) {
    return 'VARIABLE_STABILITY';
  }

  return 'EARLY_RECOVERY';
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
    return 'URGENT_CONTINUITY_REVIEW';
  }

  if (
    durabilityResult === 'REBURN_DETECTED' ||
    reburnSignal === 'RECURRENT_REBURN_PATTERN'
  ) {
    return 'EXECUTIVE_CONTINUITY_REVIEW';
  }

  if (
    maturity === 'VARIABLE_STABILITY' ||
    confidence === 'VARIABLE'
  ) {
    return 'ELEVATED_RECOVERY_REVIEW';
  }

  if (maturity === 'DURABILITY_BUILDING') {
    return 'DURABILITY_BUILDING';
  }

  if (
    maturity === 'RECOVERY_MATURING' ||
    maturity === 'STABLE_UNDER_OBSERVATION'
  ) {
    return 'STABILITY_HOLDING';
  }

  return 'CONTINUITY_OBSERVATION';
}

function deriveSurvivabilitySignal(
  commandPosture: CommandPosture,
): RecoverySurvivabilitySignal {
  switch (commandPosture) {
    case 'URGENT_CONTINUITY_REVIEW':
      return 'SURVIVABILITY_COMPROMISED';

    case 'EXECUTIVE_CONTINUITY_REVIEW':
      return 'SURVIVABILITY_PRESSURE_RISING';

    case 'ELEVATED_RECOVERY_REVIEW':
      return 'DURABILITY_REQUIRES_OBSERVATION';

    case 'DURABILITY_BUILDING':
    case 'STABILITY_HOLDING':
      return 'SURVIVABILITY_OBSERVATION_ACTIVE';

    default:
      return 'SURVIVABILITY_BACKGROUND_STABLE';
  }
}

function deriveExecutiveMeaning(
  maturity: RecoveryMaturity,
  durabilityWindow: string,
): string {
  const meanings: Record<RecoveryMaturity, string> = {
    EARLY_RECOVERY:
      'Recovery evidence is still early. Durability observation should continue before confidence matures.',

    VARIABLE_STABILITY:
      `Recovery is showing variable stability across the ${durabilityWindow} observation window. Current conditions support continued continuity observation without escalation.`,

    HOLDING_STABLE:
      `Recovery is holding across the ${durabilityWindow} durability window while confidence continues to strengthen.`,

    DURABILITY_BUILDING:
      `Recovery durability is building steadily across the ${durabilityWindow} observation window. Current continuity signals support measured confidence progression.`,

    RECOVERY_MATURING:
      `Recovery maturity is strengthening across the ${durabilityWindow} durability window. No major deterioration signal is currently weakening continuity confidence.`,

    STABLE_UNDER_OBSERVATION:
      `Recovery remains stable across the ${durabilityWindow} durability window under normal continuity observation conditions.`,

    DURABLE_RECOVERY_ESTABLISHED:
      `Durable recovery credibility is established across the ${durabilityWindow} durability window. Continuity monitoring may remain calm and proportional.`,
  };

  return meanings[maturity];
}

function deriveRecoveryPressure(
  posture: CommandPosture,
): string {
  switch (posture) {
    case 'CONTINUITY_OBSERVATION':
      return 'Recovery durability remains stable under current continuity observation conditions.';

    case 'STABILITY_HOLDING':
      return 'Recovery stability remains credible while durability confidence continues to mature.';

    case 'DURABILITY_BUILDING':
      return 'Recovery durability is strengthening steadily while continuity observation remains active.';

    case 'ELEVATED_RECOVERY_REVIEW':
      return 'Recovery remains under measured observation due to variability indicators or recurrence visibility conditions.';

    case 'EXECUTIVE_CONTINUITY_REVIEW':
      return 'Recovery durability is weakening. Recurrence visibility or structural instability indicators require executive awareness.';

    case 'URGENT_CONTINUITY_REVIEW':
      return 'Recovery collapse indicators require urgent executive continuity review.';

    default:
      return 'Recovery durability remains under proportional continuity observation.';
  }
}

function deriveMemoryMeaning(
  impact: MemoryImpact,
): string {
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
  };

  return meanings[impact];
}

export default function RecoveryPage() {
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [durabilityResult, setDurabilityResult] =
    useState<DurabilityResult>('STABILITY_UNDER_VARIANCE');

  const [recoveryTrajectory, setRecoveryTrajectory] =
    useState<RecoveryTrajectory>('VARIABLE_STABILITY');

  const [reburnSignal, setReburnSignal] =
    useState<ReburnSignal>('RECURRENCE_OBSERVATION');

  const [recoveryConfidence, setRecoveryConfidence] =
    useState<RecoveryConfidence>('VARIABLE');

  const [durabilityWindow, setDurabilityWindow] = useState('7 days');

  const [memoryImpact, setMemoryImpact] =
    useState<MemoryImpact>('CONTINUITY_MEMORY_VISIBLE');

  const [interpretation, setInterpretation] = useState('');

  const selectedCase = recoveryCases.find(
    (item) => item.id === selectedCaseId,
  );

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
  );

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
  );

  const survivabilitySignal = useMemo(
    () =>
      deriveSurvivabilitySignal(commandPosture),
    [commandPosture],
  );

  const executiveMeaning = deriveExecutiveMeaning(
    recoveryMaturity,
    durabilityWindow,
  );

  const recoveryPressure =
    deriveRecoveryPressure(commandPosture);

  const memoryMeaning =
    deriveMemoryMeaning(memoryImpact);

  const continuityProfiles = [
    {
      title: 'Recovery Stability Distribution',
      value:
        'No concentrated fragile recovery pattern currently visible.',
    },
    {
      title: 'Durability Observation Load',
      value:
        'Recovery observation activity remains within manageable continuity thresholds.',
    },
    {
      title: 'Reburn Visibility',
      value:
        'No active reburn concentration currently requiring escalation.',
    },
    {
      title: 'Continuity Memory Visibility',
      value:
        'Structural continuity memory remains preserved for longitudinal learning.',
    },
  ];

  const synthesisRows = [
    ['DURABILITY RESULT', durabilityResult],
    ['RECOVERY TRAJECTORY', recoveryTrajectory],
    ['REBURN SIGNAL', reburnSignal],
    ['RECOVERY CONFIDENCE', recoveryConfidence],
    ['DURABILITY WINDOW', durabilityWindow],
    ['MEMORY IMPACT', memoryImpact],
    ['RECOVERY MATURITY', recoveryMaturity],
    ['COMMAND POSTURE', commandPosture],
    ['RECOVERY SURVIVABILITY SIGNAL', survivabilitySignal],
    ['EXECUTIVE MEANING', executiveMeaning],
    ['RECOVERY PRESSURE', recoveryPressure],
    ['MEMORY MEANING', memoryMeaning],
    [
      'NEXT LIFECYCLE STATE',
      selectedCase
        ? 'Recovery durability observation continues under proportional continuity governance.'
        : 'Awaiting recovery durability review assignment.',
    ],
    [
      'CASE SIGNAL',
      selectedCase?.signal ??
        'Executive synthesis will activate after continuity case selection.',
    ],
    [
      'STABILITY DOMAIN',
      selectedCase?.domain ??
        'Continuity domain visibility pending case assignment.',
    ],
    [
      'CURRENT CONTINUITY STATUS',
      selectedCase?.status ??
        'Recovery continuity posture pending operational review.',
    ],
    [
      'RECOVERY INTERPRETATION',
      interpretation.trim() ||
        'No additional operational recovery interpretation entered.',
    ],
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="border-b border-neutral-800 bg-neutral-950 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
            TSINAXA CGI
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Recovery Intelligence
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-300 md:text-base">
            Executive Continuity Intelligence Infrastructure
          </p>

          <p className="mt-4 max-w-4xl text-sm leading-6 text-neutral-400 md:text-base">
            Assess whether verified stabilization is converting into durable
            recovery without erasing structural memory, recurrence visibility,
            or survivability awareness.
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
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
          TSINAXA CGI • RECOVERY DURABILITY INTELLIGENCE
        </p>

        <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white">
            Recovery Durability Intelligence
          </h2>

          <p className="mt-3 max-w-5xl text-sm leading-6 text-neutral-300">
            Confirm whether verified stabilization is holding over time.
            Detect reburn, recovery collapse, continuity variance,
            structural memory persistence, survivability pressure,
            and executive continuity posture before trust is restored.
          </p>

          <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
            <span className="font-semibold">Boundary:</span> /recovery confirms durability.
            It does not erase structural memory, remove recurrence visibility,
            or close survivability risk automatically.
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
            Recovery Pressure Intelligence
          </h3>

          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {recoveryPressure}
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold text-white">
              Preserve Recovery Durability Review
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Use this after outcome verification suggests recovery durability
              observation may begin. Preserve continuity visibility,
              recurrence awareness, structural memory relevance,
              and executive continuity meaning.
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
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                >
                  <option value="">
                    Select stability case
                  </option>

                  {recoveryCases.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.signal}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Durability Result
                </span>

                <select
                  value={durabilityResult}
                  onChange={(event) =>
                    setDurabilityResult(
                      event.target.value as DurabilityResult,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                >
                  {durabilityResults.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Recovery Trajectory
                </span>

                <select
                  value={recoveryTrajectory}
                  onChange={(event) =>
                    setRecoveryTrajectory(
                      event.target.value as RecoveryTrajectory,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                >
                  {recoveryTrajectories.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Reburn Signal
                </span>

                <select
                  value={reburnSignal}
                  onChange={(event) =>
                    setReburnSignal(
                      event.target.value as ReburnSignal,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                >
                  {reburnSignals.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Recovery Confidence
                </span>

                <select
                  value={recoveryConfidence}
                  onChange={(event) =>
                    setRecoveryConfidence(
                      event.target.value as RecoveryConfidence,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                >
                  {recoveryConfidences.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Durability Window
                </span>

                <input
                  value={durabilityWindow}
                  onChange={(event) =>
                    setDurabilityWindow(event.target.value)
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Memory Impact
                </span>

                <select
                  value={memoryImpact}
                  onChange={(event) =>
                    setMemoryImpact(
                      event.target.value as MemoryImpact,
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                >
                  {memoryImpacts.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Recovery Interpretation
                </span>

                <textarea
                  value={interpretation}
                  onChange={(event) =>
                    setInterpretation(event.target.value)
                  }
                  rows={5}
                  placeholder="Use operational facts only. Preserve durability evidence, continuity variance, recurrence visibility, structural memory meaning, survivability relevance, and executive continuity interpretation."
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                />
              </label>

              <button className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300">
                Preserve Recovery Durability Review
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-xl font-semibold text-white">
              Executive Recovery Synthesis
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              This synthesis confirms whether stabilization is strengthening,
              varying, reburning, weakening, collapsing,
              or preserving continuity durability over time.
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
              <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-400">
                Lifecycle Boundary
              </h4>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Action is not outcome.
                Outcome is not recovery.
                Recovery is not memory erasure.
                Durability must be observed before trust is restored.
              </p>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="text-xl font-semibold text-white">
            Recovery Doctrine
          </h3>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Recovery is a credibility test, not a status label.
            CGI does not restore trust simply because a case appears recovered.
            Recovery durability must hold across time without reburn,
            unresolved continuity pressure,
            recurring instability,
            structural deterioration,
            or continuity collapse before institutional confidence matures.
          </p>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature recovery intelligence must also recognize earned stability.
            When recovery holds without reburn, collapse,
            escalation concentration,
            or structural deterioration,
            the system should express measured confidence while preserving
            structural continuity memory for future institutional learning.
          </p>
        </section>
      </section>
    </main>
  );
}