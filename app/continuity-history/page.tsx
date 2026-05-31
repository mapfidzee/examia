'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  reviewCGIHistoricalContinuity,
  type CGIHistoricalContinuitySnapshot,
} from '@/lib/cgiHistoricalContinuityEngine'
import { loadCGIContinuitySnapshots } from '@/lib/cgiPersistenceEngine'

type PersistedContinuitySnapshot = CGIHistoricalContinuitySnapshot & {
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

type HistoryIntelligence = {
  hasHistory: boolean
  memoryDirection: string
  recurrencePatterns: PatternCount[]
  institutionalLearning: InstitutionalLearning
  historicalConfidence: HistoricalConfidence
  movementTimeline: MovementEvent[]
}

type PatternCount = {
  label: string
  count: number
  meaning: string
}

type InstitutionalLearning = {
  mostFrequentConcern: string
  mostFrequentFailure: string
  mostFrequentEscalationTrigger: string
  mostFrequentRecoveryBarrier: string
}

type HistoricalConfidence = {
  snapshotCoverage: string
  evidenceVerification: string
  memoryConfidence: string
  confidenceMeaning: string
}

type MovementEvent = {
  date: string
  title: string
  body: string
  posture: string
}

export default function ContinuityHistoryPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <ContinuityHistoryContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function ContinuityHistoryContent() {
  const [snapshots, setSnapshots] = useState<PersistedContinuitySnapshot[]>([])
  const [message, setMessage] = useState('Loading continuity memory...')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    try {
      setLoading(true)
      setMessage('Loading continuity memory...')

      const records = await loadCGIContinuitySnapshots(50)

      setSnapshots(records as PersistedContinuitySnapshot[])
      setMessage(
        records.length === 0
          ? 'No persisted continuity snapshots found yet.'
          : 'Continuity memory loaded.',
      )
    } catch (error) {
      console.error(error)
      setMessage('Continuity memory could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  const intelligence = useMemo(
    () => reviewCGIHistoricalContinuity(snapshots),
    [snapshots],
  )

  const history = useMemo(() => buildHistoryIntelligence(snapshots), [snapshots])

  const historicalReading = history.hasHistory
    ? executiveLabel(intelligence.directionLabel)
    : 'HISTORY NOT ESTABLISHED'

  const historicalMeaning = history.hasHistory
    ? intelligence.executiveMeaning
    : 'CGI has not yet accumulated persisted continuity snapshots for historical review.'

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • CONTINUITY HISTORY</p>

          <h1 style={styles.title}>Continuity History</h1>

          <p style={styles.subtitle}>
            Institutional memory ledger for preserved continuity posture,
            recurrence, survivability exposure, recovery credibility, evidence,
            and executive movement across time.
          </p>

          <section style={styles.doctrinePanel}>
            <p style={styles.doctrineTitle}>CONTINUITY HISTORY DOCTRINE</p>

            <div style={styles.doctrineGrid}>
              <div style={styles.doctrineCard}>Memory preserves movement.</div>
              <div style={styles.doctrineCard}>
                History does not create current pressure.
              </div>
              <div style={styles.doctrineCard}>
                Recurrence must remain visible.
              </div>
              <div style={styles.doctrineCard}>
                Evidence must remain reconstructable.
              </div>
            </div>
          </section>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Historical Continuity Reading</p>
            <h2 style={styles.heroTitle}>{historicalReading}</h2>
            <p style={styles.heroMeaning}>{historicalMeaning}</p>
          </div>

          <div style={styles.questionBox}>
            <p style={styles.metricLabel}>History Questions</p>
            <p style={styles.questionText}>
              Has this happened before? What keeps returning? Are we improving?
              What must leadership never forget?
            </p>
          </div>
        </section>

        <section style={styles.memoryDirectionPanel}>
          <div>
            <p style={styles.sectionKicker}>Memory Direction</p>
            <h2 style={styles.cardTitle}>{history.memoryDirection}</h2>
            <p style={styles.bodyText}>
              Continuity History preserves prior continuity readings without
              allowing old records to override the current lifecycle truth.
            </p>
          </div>

          <button
            type="button"
            onClick={loadHistory}
            disabled={loading}
            style={{
              ...styles.primaryButton,
              ...(loading ? styles.disabledButton : {}),
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh History'}
          </button>
        </section>

        <section style={styles.summaryGrid}>
          <MetricCard
            label="Snapshots"
            value={String(intelligence.snapshotCount)}
            body={
              history.hasHistory
                ? 'Persisted continuity records available for history review.'
                : 'No persisted continuity records available yet.'
            }
          />

          <MetricCard
            label="Drift"
            value={
              history.hasHistory
                ? yesNoMeaning(intelligence.continuityDriftDetected)
                : 'AWAITING HISTORY'
            }
            body="Shows whether historical memory indicates worsening or persistent exposure."
          />

          <MetricCard
            label="Improving"
            value={
              history.hasHistory
                ? yesNoMeaning(intelligence.continuityImproving)
                : 'AWAITING HISTORY'
            }
            body="Shows whether latest posture is lighter than the oldest compared posture."
          />

          <MetricCard
            label="Confidence"
            value={history.historicalConfidence.memoryConfidence}
            body="Shows whether the historical pattern is strong enough to trust."
          />
        </section>

        <section style={styles.gridTwo}>
          <Panel title="What Changed Over Time">
            {history.hasHistory ? (
              <div style={styles.infoList}>
                <Info
                  label="Direction"
                  value={executiveLabel(intelligence.directionLabel)}
                />
                <Info
                  label="Historical Trend"
                  value={executiveLabel(intelligence.historicalTrendLabel)}
                />
                <Info
                  label="Current Posture"
                  value={executiveLabel(intelligence.currentPosture)}
                />
                <Info
                  label="Continuity Drift"
                  value={yesNoMeaning(intelligence.continuityDriftDetected)}
                />
                <Info
                  label="Improving Movement"
                  value={yesNoMeaning(intelligence.continuityImproving)}
                />
              </div>
            ) : (
              <EmptyPanel
                title="No historical movement to display."
                body="Once snapshots exist, trend, drift, and movement analysis will appear here."
              />
            )}
          </Panel>

          <Panel title="What Must Not Be Forgotten">
            {history.hasHistory ? (
              <div style={styles.infoList}>
                <Info
                  label="Recurrence"
                  value={executiveLabel(intelligence.recurrenceMeaning)}
                />
                <Info
                  label="Survivability"
                  value={executiveLabel(intelligence.survivabilityMeaning)}
                />
                <Info
                  label="Evidence"
                  value={executiveLabel(intelligence.evidenceMeaning)}
                />
                <Info
                  label="History Action"
                  value={executiveLabel(intelligence.requiredHistoryAction)}
                />
              </div>
            ) : (
              <EmptyPanel
                title="No memory references to display."
                body="Recurrence, survivability, evidence, and required actions will appear here once continuity history accumulates."
              />
            )}
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Recurrence Intelligence</p>

          <h2 style={styles.cardTitle}>What keeps returning?</h2>

          {history.recurrencePatterns.length === 0 ? (
            <EmptyPanel
              title="No recurrence pattern established."
              body="Recurring pressure, evidence gaps, recovery fragility, command escalation, and survivability exposure will appear here after history accumulates."
            />
          ) : (
            <div style={styles.patternGrid}>
              {history.recurrencePatterns.map((pattern) => (
                <PatternCard key={pattern.label} pattern={pattern} />
              ))}
            </div>
          )}
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Institutional Learning</p>

          <h2 style={styles.cardTitle}>
            What has the institution learned from continuity memory?
          </h2>

          <div style={styles.learningGrid}>
            <InfoCard
              label="Most Frequent Concern"
              value={history.institutionalLearning.mostFrequentConcern}
            />
            <InfoCard
              label="Most Frequent Failure"
              value={history.institutionalLearning.mostFrequentFailure}
            />
            <InfoCard
              label="Escalation Trigger"
              value={history.institutionalLearning.mostFrequentEscalationTrigger}
            />
            <InfoCard
              label="Recovery Barrier"
              value={history.institutionalLearning.mostFrequentRecoveryBarrier}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Historical Confidence</p>

          <h2 style={styles.cardTitle}>
            Can leadership trust the historical pattern?
          </h2>

          <div style={styles.learningGrid}>
            <InfoCard
              label="Snapshot Coverage"
              value={history.historicalConfidence.snapshotCoverage}
            />
            <InfoCard
              label="Evidence Verification"
              value={history.historicalConfidence.evidenceVerification}
            />
            <InfoCard
              label="Memory Confidence"
              value={history.historicalConfidence.memoryConfidence}
            />
            <InfoCard
              label="Meaning"
              value={history.historicalConfidence.confidenceMeaning}
            />
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Recovery and Stabilization Memory">
            {history.hasHistory ? (
              <div style={styles.infoList}>
                <Info
                  label="Recovery"
                  value={executiveLabel(intelligence.recoveryTrajectoryLabel)}
                />
                <Info
                  label="Stabilization"
                  value={executiveLabel(
                    intelligence.stabilizationCredibilityLabel,
                  )}
                />
                <Info
                  label="Memory Pressure"
                  value={executiveLabel(
                    intelligence.institutionalMemoryPressureLabel,
                  )}
                />
                <Info
                  label="Persistence Severity"
                  value={executiveLabel(
                    intelligence.continuityPersistenceSeverityLabel,
                  )}
                />
              </div>
            ) : (
              <EmptyPanel
                title="Recovery history is awaiting evidence."
                body="Recovery credibility, stabilization confidence, memory pressure, and persistence severity will activate after snapshots exist."
              />
            )}
          </Panel>

          <Panel title="Memory Compression">
            <p style={styles.panelText}>
              {history.hasHistory
                ? intelligence.memoryCompressionSummary
                : 'Memory compression becomes available after continuity snapshots exist. CGI will then summarize trend, drift, recurrence, recovery credibility, evidence maturity, and executive meaning.'}
            </p>
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Historical Interpretation</p>

          <h2 style={styles.cardTitle}>
            {history.hasHistory
              ? executiveLabel(intelligence.requiredHistoryAction)
              : 'Begin preserving continuity snapshots.'}
          </h2>

          <p style={styles.bodyText}>
            {history.hasHistory
              ? intelligence.trajectoryMeaning
              : 'Trajectory meaning becomes available after persisted snapshots exist. CGI will compare posture movement, recurrence, recovery credibility, evidence maturity, and survivability pressure across time.'}
          </p>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Latest Persisted Snapshot">
            {intelligence.latest ? (
              <div style={styles.infoList}>
                <Info
                  label="Label"
                  value={
                    intelligence.latest.snapshot_label || 'Unlabeled snapshot'
                  }
                />
                <Info
                  label="Posture"
                  value={executiveLabel(
                    intelligence.latest.continuity_posture,
                  )}
                />
                <Info
                  label="Source"
                  value={intelligence.latest.source_route || 'Not recorded'}
                />
                <Info
                  label="Dominant Concern"
                  value={
                    intelligence.latest.dominant_concern || 'Not recorded'
                  }
                />
                <Info
                  label="Required Evidence"
                  value={
                    intelligence.latest.required_evidence || 'Not recorded'
                  }
                />
              </div>
            ) : (
              <EmptyPanel
                title="No latest snapshot available."
                body="The most recent continuity snapshot will appear here once saved."
              />
            )}
          </Panel>

          <Panel title="Oldest Compared Snapshot">
            {intelligence.oldest ? (
              <div style={styles.infoList}>
                <Info
                  label="Label"
                  value={
                    intelligence.oldest.snapshot_label || 'Unlabeled snapshot'
                  }
                />
                <Info
                  label="Posture"
                  value={executiveLabel(
                    intelligence.oldest.continuity_posture,
                  )}
                />
                <Info
                  label="Source"
                  value={intelligence.oldest.source_route || 'Not recorded'}
                />
                <Info
                  label="Recorded"
                  value={formatDate(intelligence.oldest.created_at || '')}
                />
              </div>
            ) : (
              <EmptyPanel
                title="No comparison snapshot available."
                body="The oldest available snapshot for comparison will appear here."
              />
            )}
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Historical Movement Timeline</p>

          <h2 style={styles.cardTitle}>
            History should explain movement, not only list records.
          </h2>

          <div style={styles.timeline}>
            {history.movementTimeline.length === 0 && (
              <EmptyPanel
                title="No movement timeline available."
                body="Persisted continuity snapshots will appear here as historical movement events, preserving posture movement, recurrence signals, recovery credibility, evidence maturity, and survivability exposure."
              />
            )}

            {history.movementTimeline.map((event, index) => (
              <article key={`${event.date}-${index}`} style={styles.timelineItem}>
                <p style={styles.timelineDate}>{event.date}</p>

                <h3 style={styles.timelineTitle}>{event.title}</h3>

                <p style={styles.timelineBody}>{event.body}</p>

                <div style={styles.timelineMetaGrid}>
                  <TimelineMeta label="Posture" value={event.posture} />
                  <TimelineMeta
                    label="Movement"
                    value={deriveMovementMeaning(event.posture)}
                  />
                  <TimelineMeta
                    label="Memory"
                    value="Preserved for institutional review"
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.principleCard}>
          <div style={styles.principleIcon}>⚖</div>

          <div>
            <p style={styles.sectionKicker}>Continuity History Principle</p>

            <p style={styles.principleText}>
              Continuity history explains movement. It preserves memory without
              overriding current truth. It is the institutional record that
              ensures leadership never forgets what mattered.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

function buildHistoryIntelligence(
  snapshots: PersistedContinuitySnapshot[],
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

function buildRecurrencePatterns(
  snapshots: PersistedContinuitySnapshot[],
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

function buildInstitutionalLearning(
  snapshots: PersistedContinuitySnapshot[],
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

function buildHistoricalConfidence(
  snapshots: PersistedContinuitySnapshot[],
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

function buildMovementTimeline(
  snapshots: PersistedContinuitySnapshot[],
): MovementEvent[] {
  return snapshots.map((snapshot) => {
    const posture = executiveLabel(snapshot.continuity_posture)
    const concern = snapshot.dominant_concern || 'No dominant concern recorded'
    const action = snapshot.required_action || 'No required action recorded'

    return {
      date: formatDate(snapshot.created_at),
      title: deriveMovementTitle(snapshot),
      body: `${concern}. ${action}.`,
      posture,
    }
  })
}

function deriveMovementTitle(snapshot: PersistedContinuitySnapshot) {
  const text = snapshotText(snapshot)

  if (text.includes('RECOVERY')) return 'Recovery credibility reviewed'
  if (text.includes('EVIDENCE')) return 'Evidence maturity reviewed'
  if (text.includes('COMMAND')) return 'Command visibility preserved'
  if (text.includes('ESCALATION')) return 'Executive escalation preserved'
  if (text.includes('STABILIZATION')) return 'Stabilization meaning preserved'
  if (text.includes('SURVIVABILITY')) return 'Survivability exposure preserved'

  return 'Continuity posture preserved'
}

function deriveMovementMeaning(posture: string) {
  const weight = postureWeight(posture)

  if (weight >= 4) return 'Critical pressure remained visible'
  if (weight === 3) return 'Elevated pressure required visibility'
  if (weight === 2) return 'Continuity remained under watch'
  if (weight === 1) return 'Continuity was stable or clearing'

  return 'Historical posture preserved'
}

function hasMixedHighLowMovement(snapshots: PersistedContinuitySnapshot[]) {
  const weights = snapshots.map((snapshot) =>
    postureWeight(snapshot.continuity_posture),
  )

  return Math.max(...weights) - Math.min(...weights) >= 2
}

function countIncludes(
  snapshots: PersistedContinuitySnapshot[],
  terms: string[],
) {
  return snapshots.filter((snapshot) => {
    const text = snapshotText(snapshot)
    return terms.some((term) => text.includes(term))
  }).length
}

function snapshotText(snapshot: PersistedContinuitySnapshot) {
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

function mostFrequent(values: Array<string | null>) {
  const counts = new Map<string, number>()

  values
    .filter((value): value is string => Boolean(value))
    .forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1)
    })

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || ''
}

function postureWeight(posture: string) {
  const value = posture.toUpperCase()

  if (value.includes('CRITICAL')) return 4
  if (value.includes('ELEVATED')) return 3
  if (value.includes('WATCH')) return 2
  if (value.includes('STABLE')) return 1
  if (value.includes('CLEAR')) return 1

  return 0
}

function yesNoMeaning(value: boolean) {
  return value ? 'VISIBLE' : 'NOT VISIBLE'
}

function executiveLabel(value: string) {
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

function formatDate(value: string) {
  if (!value) return 'Not recorded'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function MetricCard({
  label,
  value,
  body,
}: {
  label: string
  value: string
  body: string
}) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function PatternCard({ pattern }: { pattern: PatternCount }) {
  return (
    <article style={styles.patternCard}>
      <p style={styles.metricLabel}>{pattern.label}</p>
      <p style={styles.patternCount}>{pattern.count}</p>
      <p style={styles.panelBody}>{pattern.meaning}</p>
    </article>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.infoCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.infoCardValue}>{value}</p>
    </article>
  )
}

function Panel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section style={styles.panel}>
      <p style={styles.panelKicker}>{title}</p>
      <div style={styles.panelBody}>{children}</div>
    </section>
  )
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div style={styles.emptyPanel}>
      <p style={styles.emptyTitle}>{title}</p>
      <p style={styles.emptyText}>{body}</p>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  )
}

function TimelineMeta({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.timelineMeta}>
      <span style={styles.timelineMetaLabel}>{label}</span>
      <strong style={styles.timelineMetaValue}>{value}</strong>
    </div>
  )
}

const gold = '#d6b25e'
const mutedGold = '#9f8142'
const deepBlack = '#030303'
const panelBlack = '#090807'
const cardBlack = '#11100d'
const softLine = 'rgba(214,178,94,0.24)'

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: '#f5f0e6',
    overflowX: 'hidden',
    background:
      'radial-gradient(circle at top right, rgba(214,178,94,0.08), transparent 32%), #030303',
  },
  container: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '16px 28px 72px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '28px',
  },
  kicker: {
    color: gold,
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '2px',
    margin: 0,
  },
  title: {
    color: '#fff8e7',
    fontSize: 'clamp(34px, 4vw, 48px)',
    lineHeight: 1,
    margin: '10px 0',
    letterSpacing: '-0.05em',
  },
  subtitle: {
    color: '#cfc7b5',
    maxWidth: '820px',
    lineHeight: 1.65,
    fontSize: '14px',
    margin: 0,
  },
  doctrinePanel: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '22px',
    marginTop: '22px',
  },
  doctrineTitle: {
    color: gold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.15em',
    margin: '0 0 14px',
  },
  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
  },
  doctrineCard: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    color: '#fff8e7',
    fontSize: '12px',
    lineHeight: 1.45,
    fontWeight: 800,
  },
  message: {
    background: 'rgba(16, 185, 129, 0.14)',
    color: '#bbf7d0',
    border: '1px solid rgba(16, 185, 129, 0.28)',
    padding: '13px 16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '24px',
    fontSize: '13px',
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.65fr)',
    gap: '24px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
  },
  sectionKicker: {
    color: mutedGold,
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '10px',
  },
  heroTitle: {
    color: gold,
    fontSize: 'clamp(32px, 4vw, 48px)',
    lineHeight: 1,
    margin: '10px 0',
    letterSpacing: '-0.05em',
  },
  heroMeaning: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
    fontSize: '14px',
  },
  questionBox: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px',
  },
  questionText: {
    color: '#fff8e7',
    fontSize: '22px',
    lineHeight: 1.25,
    margin: '10px 0 0',
    fontWeight: 900,
  },
  memoryDirectionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: '24px',
    alignItems: 'center',
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
  },
  primaryButton: {
    border: 'none',
    borderRadius: '14px',
    background: gold,
    color: '#11100d',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 950,
    minHeight: '52px',
    padding: '0 22px',
    whiteSpace: 'nowrap',
  },
  disabledButton: {
    cursor: 'not-allowed',
    opacity: 0.65,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  metricCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
    minHeight: '144px',
  },
  metricLabel: {
    color: mutedGold,
    fontSize: '9px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  metricValue: {
    color: gold,
    fontSize: '30px',
    fontWeight: 950,
    lineHeight: 1.05,
    margin: '10px 0',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  panel: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px',
    minHeight: '190px',
  },
  panelKicker: {
    color: mutedGold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  panelBody: {
    color: '#cfc7b5',
    fontSize: '13px',
    lineHeight: 1.6,
    marginTop: '10px',
  },
  panelText: {
    color: '#cfc7b5',
    lineHeight: 1.65,
    margin: 0,
  },
  infoList: {
    display: 'grid',
    gap: '10px',
    marginTop: '14px',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '150px minmax(0, 1fr)',
    gap: '12px',
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '12px',
    alignItems: 'start',
  },
  infoLabel: {
    color: mutedGold,
    fontWeight: 900,
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#fff8e7',
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  patternGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
  },
  patternCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '14px',
    minHeight: '150px',
  },
  patternCount: {
    color: gold,
    fontSize: '34px',
    fontWeight: 950,
    margin: '10px 0',
    lineHeight: 1,
  },
  learningGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
  },
  infoCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '14px',
    minHeight: '120px',
  },
  infoCardValue: {
    color: '#fff8e7',
    fontSize: '15px',
    fontWeight: 900,
    lineHeight: 1.35,
    margin: '10px 0 0',
  },
  emptyPanel: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '130px',
    textAlign: 'center',
    padding: '12px',
  },
  emptyTitle: {
    color: '#fff8e7',
    fontSize: '18px',
    fontWeight: 900,
    margin: '0 0 8px',
  },
  emptyText: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
    fontWeight: 700,
  },
  card: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#fff8e7',
    fontSize: 'clamp(22px, 3vw, 30px)',
    lineHeight: 1.15,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  bodyText: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    fontSize: '13px',
    margin: 0,
  },
  timeline: {
    display: 'grid',
    gap: '16px',
    marginTop: '18px',
  },
  timelineItem: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px',
  },
  timelineDate: {
    color: mutedGold,
    fontSize: '12px',
    fontWeight: 900,
    margin: 0,
  },
  timelineTitle: {
    color: gold,
    fontSize: '24px',
    lineHeight: 1.15,
    margin: '8px 0',
  },
  timelineBody: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
  },
  timelineMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '14px',
  },
  timelineMeta: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '12px',
  },
  timelineMetaLabel: {
    display: 'block',
    color: mutedGold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '6px',
  },
  timelineMetaValue: {
    color: '#fff8e7',
    lineHeight: 1.4,
    overflowWrap: 'anywhere',
  },
  principleCard: {
    display: 'grid',
    gridTemplateColumns: '90px minmax(0, 1fr)',
    gap: '24px',
    alignItems: 'center',
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
  },
  principleIcon: {
    width: '76px',
    height: '76px',
    borderRadius: '999px',
    border: `1px solid ${softLine}`,
    display: 'grid',
    placeItems: 'center',
    color: gold,
    fontSize: '34px',
  },
  principleText: {
    color: '#cfc7b5',
    lineHeight: 1.65,
    margin: '10px 0 0',
    fontSize: '14px',
  },
}