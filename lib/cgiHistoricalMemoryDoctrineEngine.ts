import type { CGIHistoricalContinuitySnapshot } from '@/lib/cgiHistoricalContinuityEngine'

export type PersistedContinuitySnapshotForHistory =
  CGIHistoricalContinuitySnapshot & {
    id: string
    created_at: string
    snapshot_label: string | null
    source_route: string
    continuity_confidence: string | null
    survivability_pressure: string | null
    recovery_credibility: string | null
    recurrence_severity: string | null
    dominant_concern: string | null
    executive_reading: string | null
    required_action: string | null
    required_evidence: string | null
    evidence_verified: boolean
    accountability_active: boolean
    structural_memory_visible: boolean
    raw_payload: Record<string, unknown>
  }

export type HistoryIntelligence = {
  hasHistory: boolean
  memoryDirection: string
  recurrencePatterns: PatternCount[]
  institutionalLearning: InstitutionalLearning
  historicalConfidence: HistoricalConfidence
  movementTimeline: MovementEvent[]
}

export type PatternCount = {
  label: string
  count: number
  meaning: string
}

export type InstitutionalLearning = {
  mostFrequentConcern: string
  mostFrequentFailure: string
  mostFrequentEscalationTrigger: string
  mostFrequentRecoveryBarrier: string
}

export type HistoricalConfidence = {
  snapshotCoverage: string
  evidenceVerification: string
  memoryConfidence: string
  confidenceMeaning: string
}

export type MovementEvent = {
  date: string
  title: string
  body: string
  posture: string
}

export const continuityHistoryDoctrine = [
  'Memory preserves movement.',
  'History does not create current pressure.',
  'Recurrence must remain visible.',
  'Evidence must remain reconstructable.',
]

export function buildHistoryIntelligence(
  snapshots: PersistedContinuitySnapshotForHistory[],
): HistoryIntelligence {
  const hasHistory = snapshots.length > 0

  if (!hasHistory) {
    return {
      hasHistory: false,
      memoryDirection: 'MEMORY AWAITING ACCUMULATION',
      recurrencePatterns: [],
      institutionalLearning: {
        mostFrequentConcern: 'Awaiting continuity history',
        mostFrequentFailure: 'Awaiting evidence history',
        mostFrequentEscalationTrigger: 'Awaiting escalation history',
        mostFrequentRecoveryBarrier: 'Awaiting recovery history',
      },
      historicalConfidence: {
        snapshotCoverage: 'NOT ESTABLISHED',
        evidenceVerification: 'NOT ESTABLISHED',
        memoryConfidence: 'AWAITING HISTORY',
        confidenceMeaning:
          'Historical confidence will activate after continuity snapshots are preserved.',
      },
      movementTimeline: [],
    }
  }

  const sorted = [...snapshots].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  const latest = sorted[0]
  const oldest = sorted[sorted.length - 1]

  const latestWeight = postureWeight(latest.continuity_posture)
  const oldestWeight = postureWeight(oldest.continuity_posture)

  const recurrencePatterns = buildRecurrencePatterns(sorted)
  const institutionalLearning = buildInstitutionalLearning(sorted)
  const historicalConfidence = buildHistoricalConfidence(sorted)
  const movementTimeline = buildMovementTimeline(sorted)

  let memoryDirection = 'HOLDING'

  if (recurrencePatterns.some((pattern) => pattern.count >= 3)) {
    memoryDirection = 'RECURRING'
  }

  if (latestWeight > oldestWeight) {
    memoryDirection = 'DETERIORATING'
  }

  if (latestWeight < oldestWeight) {
    memoryDirection = 'IMPROVING'
  }

  if (sorted.length >= 4 && hasMixedHighLowMovement(sorted)) {
    memoryDirection = 'VOLATILE'
  }

  return {
    hasHistory,
    memoryDirection,
    recurrencePatterns,
    institutionalLearning,
    historicalConfidence,
    movementTimeline,
  }
}

export function buildRecurrencePatterns(
  snapshots: PersistedContinuitySnapshotForHistory[],
): PatternCount[] {
  const patterns = [
    {
      label: 'Recovery Fragility',
      count: countIncludes(snapshots, [
        'RECOVERY',
        'DURABILITY',
        'FRAGILE',
        'WATCH',
      ]),
      meaning: 'Recovery repeatedly requires credibility or durability review.',
    },
    {
      label: 'Evidence Deficit',
      count: countIncludes(snapshots, [
        'EVIDENCE',
        'VERIFY',
        'VERIFIED',
        'GAP',
      ]),
      meaning: 'Evidence repeatedly prevents stabilization confidence.',
    },
    {
      label: 'Command Escalation',
      count: countIncludes(snapshots, [
        'COMMAND',
        'ESCALATION',
        'EXECUTIVE',
        'ELEVATED',
        'CRITICAL',
      ]),
      meaning: 'Executive visibility repeatedly becomes necessary.',
    },
    {
      label: 'Survivability Exposure',
      count: countIncludes(snapshots, [
        'SURVIVABILITY',
        'SURVIVAL',
        'PRESSURE',
        'EXPOSURE',
      ]),
      meaning: 'Continuity pressure repeatedly carries survivability meaning.',
    },
    {
      label: 'Recurrence Visibility',
      count: countIncludes(snapshots, [
        'RECURRENCE',
        'RECURRING',
        'REOPENED',
        'REPEAT',
      ]),
      meaning: 'Similar instability signals appear repeatedly in memory.',
    },
  ]

  return patterns
    .filter((pattern) => pattern.count > 0)
    .sort((a, b) => b.count - a.count)
}

export function buildInstitutionalLearning(
  snapshots: PersistedContinuitySnapshotForHistory[],
): InstitutionalLearning {
  const concern = mostFrequent(
    snapshots.map((snapshot) => snapshot.dominant_concern),
  )

  const evidenceFailure = countIncludes(snapshots, [
    'EVIDENCE',
    'VERIFY',
    'VERIFIED',
    'REQUIRED EVIDENCE',
  ])

  const recoveryBarrier = countIncludes(snapshots, [
    'RECOVERY',
    'DURABILITY',
    'STABILIZATION',
  ])

  const escalationTrigger = countIncludes(snapshots, [
    'COMMAND',
    'EXECUTIVE',
    'ESCALATION',
    'ELEVATED',
    'CRITICAL',
  ])

  return {
    mostFrequentConcern: concern || 'No dominant concern repeated yet',
    mostFrequentFailure:
      evidenceFailure > 0
        ? 'Evidence maturity / verification'
        : 'No repeated failure identified yet',
    mostFrequentEscalationTrigger:
      escalationTrigger > 0
        ? 'Executive or command visibility'
        : 'No repeated escalation trigger identified yet',
    mostFrequentRecoveryBarrier:
      recoveryBarrier > 0
        ? 'Recovery credibility / durability'
        : 'No repeated recovery barrier identified yet',
  }
}

export function buildHistoricalConfidence(
  snapshots: PersistedContinuitySnapshotForHistory[],
): HistoricalConfidence {
  const total = snapshots.length

  const verified = snapshots.filter((snapshot) => snapshot.evidence_verified)
    .length

  const memoryVisible = snapshots.filter(
    (snapshot) => snapshot.structural_memory_visible,
  ).length

  const snapshotCoverage =
    total >= 10 ? 'STRONG' : total >= 4 ? 'MODERATE' : 'LOW'

  const evidenceVerification =
    verified === 0
      ? 'UNVERIFIED'
      : verified === total
        ? 'FULL'
        : verified / total >= 0.5
          ? 'PARTIAL'
          : 'LIMITED'

  const memoryConfidence =
    total >= 10 && verified / total >= 0.5
      ? 'HIGH'
      : total >= 4 || memoryVisible > 0
        ? 'MODERATE'
        : 'LOW'

  return {
    snapshotCoverage,
    evidenceVerification,
    memoryConfidence,
    confidenceMeaning:
      memoryConfidence === 'HIGH'
        ? 'Enough history exists to support stronger pattern interpretation.'
        : memoryConfidence === 'MODERATE'
          ? 'Some history exists, but leadership should interpret patterns carefully.'
          : 'History is still thin. Treat patterns as early signals, not settled truth.',
  }
}

export function buildMovementTimeline(
  snapshots: PersistedContinuitySnapshotForHistory[],
): MovementEvent[] {
  return snapshots.map((snapshot) => {
    const posture = executiveLabel(snapshot.continuity_posture)
    const concern = snapshot.dominant_concern || 'No dominant concern recorded'
    const action = snapshot.required_action || 'No required action recorded'

    return {
      date: formatHistoryDate(snapshot.created_at),
      title: deriveMovementTitle(snapshot),
      body: `${concern}. ${action}.`,
      posture,
    }
  })
}

export function deriveMovementTitle(
  snapshot: PersistedContinuitySnapshotForHistory,
) {
  const text = snapshotText(snapshot)

  if (text.includes('RECOVERY')) return 'Recovery credibility reviewed'
  if (text.includes('EVIDENCE')) return 'Evidence maturity reviewed'
  if (text.includes('COMMAND')) return 'Command visibility preserved'
  if (text.includes('ESCALATION')) return 'Executive escalation preserved'
  if (text.includes('STABILIZATION')) return 'Stabilization meaning preserved'
  if (text.includes('SURVIVABILITY')) return 'Survivability exposure preserved'

  return 'Continuity posture preserved'
}

export function deriveMovementMeaning(posture: string) {
  const weight = postureWeight(posture)

  if (weight >= 4) return 'Critical pressure remained visible'
  if (weight === 3) return 'Elevated pressure required visibility'
  if (weight === 2) return 'Continuity remained under watch'
  if (weight === 1) return 'Continuity was stable or clearing'

  return 'Historical posture preserved'
}

export function hasMixedHighLowMovement(
  snapshots: PersistedContinuitySnapshotForHistory[],
) {
  const weights = snapshots.map((snapshot) =>
    postureWeight(snapshot.continuity_posture),
  )

  return Math.max(...weights) - Math.min(...weights) >= 2
}

export function countIncludes(
  snapshots: PersistedContinuitySnapshotForHistory[],
  terms: string[],
) {
  return snapshots.filter((snapshot) => {
    const text = snapshotText(snapshot)
    return terms.some((term) => text.includes(term))
  }).length
}

export function snapshotText(snapshot: PersistedContinuitySnapshotForHistory) {
  return [
    snapshot.snapshot_label,
    snapshot.source_route,
    snapshot.continuity_posture,
    snapshot.continuity_confidence,
    snapshot.survivability_pressure,
    snapshot.recovery_credibility,
    snapshot.recurrence_severity,
    snapshot.dominant_concern,
    snapshot.executive_reading,
    snapshot.required_action,
    snapshot.required_evidence,
  ]
    .filter(Boolean)
    .join(' ')
    .toUpperCase()
}

export function mostFrequent(values: Array<string | null>) {
  const counts = new Map<string, number>()

  values
    .filter((value): value is string => Boolean(value))
    .forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1)
    })

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || ''
}

export function postureWeight(posture: string) {
  const value = posture.toUpperCase()

  if (value.includes('CRITICAL')) return 4
  if (value.includes('ELEVATED')) return 3
  if (value.includes('WATCH')) return 2
  if (value.includes('STABLE')) return 1
  if (value.includes('CLEAR')) return 1

  return 0
}

export function yesNoMeaning(value: boolean) {
  return value ? 'VISIBLE' : 'NOT VISIBLE'
}

export function executiveLabel(value: string) {
  if (!value) return 'Awaiting history'

  const cleaned = value.replace(/_/g, ' ').trim()

  if (cleaned === 'NO MEMORY') return 'History not yet established'
  if (cleaned === 'NOT RECORDED') return 'Memory awaiting accumulation'
  if (cleaned === 'NO TREND') return 'Trend awaiting history'
  if (cleaned === 'NOT ESTABLISHED') return 'Awaiting history'
  if (cleaned === 'NONE') return 'None currently visible'
  if (cleaned === 'NO') return 'No current signal'
  if (cleaned === 'YES') return 'Visible'

  return cleaned
}

export function formatHistoryDate(value: string) {
  if (!value) return 'Not recorded'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}