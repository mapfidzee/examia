'use client';

import { useMemo, useState } from 'react';

type DurabilityResult =
  | 'DURABLE_RECOVERY_CONFIRMED'
  | 'RECOVERY_HOLDING'
  | 'RECOVERY_FRAGILE'
  | 'REBURN_DETECTED'
  | 'RECOVERY_COLLAPSE';

type RecoveryTrajectory =
  | 'STRENGTHENING'
  | 'HOLDING'
  | 'FRAGILE'
  | 'WEAKENING'
  | 'COLLAPSING';

type ReburnSignal =
  | 'NO_REBURN_VISIBLE'
  | 'REBURN_WATCH'
  | 'REBURN_DETECTED'
  | 'RECURRENT_REBURN';

type RecoveryConfidence =
  | 'CREDIBLE'
  | 'CONDITIONAL'
  | 'UNCERTAIN'
  | 'LOW'
  | 'COLLAPSED';

type MemoryImpact =
  | 'NO_MEMORY_ESCALATION_REQUIRED'
  | 'STRUCTURAL_MEMORY_PRESERVED'
  | 'CARRY_FORWARD_WATCH'
  | 'MEMORY_ESCALATION_REQUIRED'
  | 'RECURRENT_MEMORY_PATTERN';

type CommandPosture =
  | 'NORMAL_MONITORING'
  | 'STABILITY_HOLDING'
  | 'DURABILITY_BUILDING'
  | 'RECOVERY_WATCH'
  | 'EXECUTIVE_REVIEW'
  | 'URGENT_CONTINUITY_REVIEW';

type RecoveryMaturity =
  | 'EARLY_RECOVERY'
  | 'HOLDING_STABLE'
  | 'DURABILITY_BUILDING'
  | 'RECOVERY_MATURING'
  | 'STABLE_UNDER_OBSERVATION'
  | 'DURABLE_RECOVERY_ESTABLISHED';

type RecoverySurvivabilitySignal =
  | 'SURVIVABILITY_STABLE'
  | 'SURVIVABILITY_OBSERVATION'
  | 'RECOVERY_REMAINS_FRAGILE'
  | 'SURVIVABILITY_RISK_RISING'
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
    status: 'Recovery watch active',
  },
];

const durabilityResults: DurabilityResult[] = [
  'DURABLE_RECOVERY_CONFIRMED',
  'RECOVERY_HOLDING',
  'RECOVERY_FRAGILE',
  'REBURN_DETECTED',
  'RECOVERY_COLLAPSE',
];

const recoveryTrajectories: RecoveryTrajectory[] = [
  'STRENGTHENING',
  'HOLDING',
  'FRAGILE',
  'WEAKENING',
  'COLLAPSING',
];

const reburnSignals: ReburnSignal[] = [
  'NO_REBURN_VISIBLE',
  'REBURN_WATCH',
  'REBURN_DETECTED',
  'RECURRENT_REBURN',
];

const recoveryConfidences: RecoveryConfidence[] = [
  'CREDIBLE',
  'CONDITIONAL',
  'UNCERTAIN',
  'LOW',
  'COLLAPSED',
];

const memoryImpacts: MemoryImpact[] = [
  'NO_MEMORY_ESCALATION_REQUIRED',
  'STRUCTURAL_MEMORY_PRESERVED',
  'CARRY_FORWARD_WATCH',
  'MEMORY_ESCALATION_REQUIRED',
  'RECURRENT_MEMORY_PATTERN',
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
    reburnSignal === 'NO_REBURN_VISIBLE' &&
    confidence === 'CREDIBLE'
  ) {
    return 'STABLE_UNDER_OBSERVATION';
  }

  if (
    durabilityResult === 'RECOVERY_HOLDING' &&
    (trajectory === 'STRENGTHENING' || trajectory === 'HOLDING') &&
    reburnSignal === 'NO_REBURN_VISIBLE'
  ) {
    return 'RECOVERY_MATURING';
  }

  if (
    durabilityResult === 'RECOVERY_HOLDING' &&
    confidence !== 'LOW' &&
    confidence !== 'COLLAPSED'
  ) {
    return 'DURABILITY_BUILDING';
  }

  if (durabilityResult === 'RECOVERY_FRAGILE') {
    return 'HOLDING_STABLE';
  }

  return 'EARLY_RECOVERY';
}

function deriveCommandPosture(
  durabilityResult: DurabilityResult,
  trajectory: RecoveryTrajectory,
  reburnSignal: ReburnSignal,
  confidence: RecoveryConfidence,
  memoryImpact: MemoryImpact,
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
    reburnSignal === 'RECURRENT_REBURN' ||
    memoryImpact === 'RECURRENT_MEMORY_PATTERN'
  ) {
    return 'EXECUTIVE_REVIEW';
  }

  if (
    durabilityResult === 'RECOVERY_FRAGILE' ||
    reburnSignal === 'REBURN_WATCH' ||
    confidence === 'UNCERTAIN' ||
    confidence === 'LOW'
  ) {
    return 'RECOVERY_WATCH';
  }

  if (maturity === 'DURABILITY_BUILDING' || maturity === 'RECOVERY_MATURING') {
    return 'DURABILITY_BUILDING';
  }

  if (maturity === 'STABLE_UNDER_OBSERVATION') {
    return 'STABILITY_HOLDING';
  }

  if (maturity === 'DURABLE_RECOVERY_ESTABLISHED') {
    return 'NORMAL_MONITORING';
  }

  return 'RECOVERY_WATCH';
}

function deriveSurvivabilitySignal(
  durabilityResult: DurabilityResult,
  trajectory: RecoveryTrajectory,
  reburnSignal: ReburnSignal,
  commandPosture: CommandPosture,
): RecoverySurvivabilitySignal {
  if (
    commandPosture === 'URGENT_CONTINUITY_REVIEW' ||
    durabilityResult === 'RECOVERY_COLLAPSE'
  ) {
    return 'SURVIVABILITY_COMPROMISED';
  }

  if (
    commandPosture === 'EXECUTIVE_REVIEW' ||
    durabilityResult === 'REBURN_DETECTED' ||
    reburnSignal === 'RECURRENT_REBURN'
  ) {
    return 'SURVIVABILITY_RISK_RISING';
  }

  if (durabilityResult === 'RECOVERY_FRAGILE' || trajectory === 'FRAGILE') {
    return 'RECOVERY_REMAINS_FRAGILE';
  }

  if (commandPosture === 'DURABILITY_BUILDING' || commandPosture === 'STABILITY_HOLDING') {
    return 'SURVIVABILITY_OBSERVATION';
  }

  return 'SURVIVABILITY_STABLE';
}

function deriveExecutiveMeaning(
  maturity: RecoveryMaturity,
  durabilityWindow: string,
): string {
  const meanings: Record<RecoveryMaturity, string> = {
    EARLY_RECOVERY:
      'Recovery is still early. Stabilization evidence should continue to be observed before institutional confidence is restored.',
    HOLDING_STABLE:
      `Recovery is holding across the ${durabilityWindow} durability window, but fragile indicators still require measured observation.`,
    DURABILITY_BUILDING:
      `Recovery is building credibility across the ${durabilityWindow} durability window. Continued stability may support increased confidence if no reburn or recurrence appears.`,
    RECOVERY_MATURING:
      `Recovery is maturing across the ${durabilityWindow} durability window. Current evidence supports cautious confidence while durability continues to strengthen.`,
    STABLE_UNDER_OBSERVATION:
      `Recovery remains stable across the ${durabilityWindow} durability window. No visible reburn or collapse signal is currently weakening confidence.`,
    DURABLE_RECOVERY_ESTABLISHED:
      `Durable recovery is established across the ${durabilityWindow} durability window. Continued monitoring may return to normal continuity observation.`,
  };

  return meanings[maturity];
}

function deriveRecoveryPressure(
  commandPosture: CommandPosture,
  maturity: RecoveryMaturity,
  reburnSignal: ReburnSignal,
  memoryImpact: MemoryImpact,
): string {
  if (commandPosture === 'URGENT_CONTINUITY_REVIEW') {
    return 'Recovery durability is weakening. Collapse indicators require urgent executive continuity review before trust can be restored.';
  }

  if (commandPosture === 'EXECUTIVE_REVIEW') {
    return 'Recovery has re-entered executive concern. Reburn, recurrence, or memory escalation signals require leadership visibility.';
  }

  if (commandPosture === 'RECOVERY_WATCH') {
    return 'Recovery remains under active observation due to fragile durability indicators or recurrence watch conditions.';
  }

  if (maturity === 'DURABILITY_BUILDING' || maturity === 'RECOVERY_MATURING') {
    return 'Recovery durability is strengthening. Current signals support measured confidence while observation continues.';
  }

  if (
    maturity === 'STABLE_UNDER_OBSERVATION' ||
    maturity === 'DURABLE_RECOVERY_ESTABLISHED'
  ) {
    return 'Recovery durability remains stable across the current observation window. No reburn, collapse, or escalation signals are currently visible.';
  }

  if (
    reburnSignal === 'NO_REBURN_VISIBLE' &&
    memoryImpact === 'NO_MEMORY_ESCALATION_REQUIRED'
  ) {
    return 'Recovery remains calm under current observation. No active reburn or memory escalation signal is visible.';
  }

  return 'Recovery durability remains under measured observation while confidence continues to mature.';
}

function deriveMemoryMeaning(memoryImpact: MemoryImpact): string {
  const meanings: Record<MemoryImpact, string> = {
    NO_MEMORY_ESCALATION_REQUIRED:
      'No memory escalation is required. Structural memory remains available for continuity learning if future recurrence appears.',
    STRUCTURAL_MEMORY_PRESERVED:
      'Structural memory preserved for future continuity learning.',
    CARRY_FORWARD_WATCH:
      'Structural memory should remain visible while recovery confidence continues to mature.',
    MEMORY_ESCALATION_REQUIRED:
      'Memory escalation is required because recovery evidence suggests unresolved structural risk.',
    RECURRENT_MEMORY_PATTERN:
      'Recurring memory patterns are visible. Leadership should review whether the same structural weakness is returning.',
  };

  return meanings[memoryImpact];
}

export default function RecoveryPage() {
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [durabilityResult, setDurabilityResult] =
    useState<DurabilityResult>('RECOVERY_FRAGILE');
  const [recoveryTrajectory, setRecoveryTrajectory] =
    useState<RecoveryTrajectory>('FRAGILE');
  const [reburnSignal, setReburnSignal] = useState<ReburnSignal>('REBURN_WATCH');
  const [recoveryConfidence, setRecoveryConfidence] =
    useState<RecoveryConfidence>('CONDITIONAL');
  const [durabilityWindow, setDurabilityWindow] = useState('7 days');
  const [memoryImpact, setMemoryImpact] =
    useState<MemoryImpact>('CARRY_FORWARD_WATCH');
  const [interpretation, setInterpretation] = useState('');

  const selectedCase = recoveryCases.find((item) => item.id === selectedCaseId);

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
        memoryImpact,
        recoveryMaturity,
      ),
    [
      durabilityResult,
      recoveryTrajectory,
      reburnSignal,
      recoveryConfidence,
      memoryImpact,
      recoveryMaturity,
    ],
  );

  const survivabilitySignal = useMemo(
    () =>
      deriveSurvivabilitySignal(
        durabilityResult,
        recoveryTrajectory,
        reburnSignal,
        commandPosture,
      ),
    [durabilityResult, recoveryTrajectory, reburnSignal, commandPosture],
  );

  const executiveMeaning = deriveExecutiveMeaning(recoveryMaturity, durabilityWindow);
  const recoveryPressure = deriveRecoveryPressure(
    commandPosture,
    recoveryMaturity,
    reburnSignal,
    memoryImpact,
  );
  const memoryMeaning = deriveMemoryMeaning(memoryImpact);

  const metrics = [
    { label: 'Cases Under Recovery Watch', value: recoveryCases.length },
    { label: 'Durable Recovery Confirmed', value: 0 },
    { label: 'Fragile Recovery', value: 0 },
    { label: 'Reburn Detected', value: 0 },
    { label: 'Recovery Collapse', value: 0 },
    { label: 'Memory Carry-Forward', value: 0 },
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
    ['NEXT LIFECYCLE STATE', selectedCase ? 'Recovery durability observation continues' : 'Pending stability case selection'],
    ['CASE SIGNAL', selectedCase?.signal ?? 'Pending stability case selection'],
    ['STABILITY DOMAIN', selectedCase?.domain ?? 'Pending stability case selection'],
    ['CURRENT CONTINUITY STATUS', selectedCase?.status ?? 'Pending stability case selection'],
    [
      'RECOVERY INTERPRETATION',
      interpretation.trim() || 'No additional recovery interpretation entered.',
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
            Assess whether verified stabilization is converting into durable recovery
            without erasing structural memory, recurrence visibility, or survivability
            awareness.
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
            Confirm whether verified stabilization is holding over time. Detect
            reburn, recovery collapse, fragile recovery, memory carry-forward,
            survivability risk, and command posture before trust is restored.
          </p>
          <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
            <span className="font-semibold">Boundary:</span> /recovery confirms
            durability. It does not erase structural memory, remove recurrence
            visibility, or close survivability risk automatically.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
            >
              <p className="text-2xl font-semibold text-white">{metric.value}</p>
              <p className="mt-2 text-xs leading-5 text-neutral-400">
                {metric.label}
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
              Use this after outcome verification suggests recovery monitoring may
              begin. Confirm whether stabilization is holding, weakening, reburning,
              collapsing, or requiring structural memory carry-forward.
            </p>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Stability Case
                </span>
                <select
                  value={selectedCaseId}
                  onChange={(event) => setSelectedCaseId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                >
                  <option value="">Select stability case</option>
                  {recoveryCases.map((item) => (
                    <option key={item.id} value={item.id}>
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
                    setDurabilityResult(event.target.value as DurabilityResult)
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                >
                  {durabilityResults.map((item) => (
                    <option key={item} value={item}>
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
                    setRecoveryTrajectory(event.target.value as RecoveryTrajectory)
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                >
                  {recoveryTrajectories.map((item) => (
                    <option key={item} value={item}>
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
                    setReburnSignal(event.target.value as ReburnSignal)
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                >
                  {reburnSignals.map((item) => (
                    <option key={item} value={item}>
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
                    setRecoveryConfidence(event.target.value as RecoveryConfidence)
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                >
                  {recoveryConfidences.map((item) => (
                    <option key={item} value={item}>
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
                  onChange={(event) => setDurabilityWindow(event.target.value)}
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
                    setMemoryImpact(event.target.value as MemoryImpact)
                  }
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                >
                  {memoryImpacts.map((item) => (
                    <option key={item} value={item}>
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
                  onChange={(event) => setInterpretation(event.target.value)}
                  rows={5}
                  placeholder="Use operational facts only. Preserve durability evidence, reburn visibility, memory implications, survivability meaning, and executive relevance."
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
              This synthesis confirms whether stabilization is holding over time,
              weakening, reburning, collapsing, or requiring memory carry-forward.
            </p>

            <div className="mt-6 divide-y divide-neutral-800 rounded-2xl border border-neutral-800">
              {synthesisRows.map(([label, value]) => (
                <div key={label} className="grid gap-2 p-4 md:grid-cols-[0.42fr_1fr]">
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
          <h3 className="text-xl font-semibold text-white">Recovery Doctrine</h3>
          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Recovery is a credibility test, not a status label. CGI does not restore
            trust simply because a case appears recovered. Recovery must hold across
            time without reburn, relapse, unresolved pressure, recurring instability,
            or memory escalation. Durability must survive time, pressure, and
            recurrence before institutional trust is restored.
          </p>
          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature recovery intelligence must also recognize earned stability.
            When recovery holds without reburn, collapse, or escalation, the system
            should express measured confidence while preserving structural memory
            for future continuity learning.
          </p>
        </section>
      </section>
    </main>
  );
}