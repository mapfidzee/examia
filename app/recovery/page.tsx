'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type CgiOperationalMetric = {
  id: string
  created_at: string
  scope: string
  region: string | null
  institution_id: string | null

  continuity_state: string
  pressure_propagation_state: string
  trajectory_direction: string
  structural_memory_state: string

  continuity_integrity_score: number
  stabilization_confidence_score: number
  escalation_pressure_index: number
  recovery_reliability_score: number
  operational_survivability_score: number

  propagation_risk: number
  trajectory_risk: number
  structural_memory_risk: number

  recovery_direction: number
  stabilization_trend: number
  unresolved_momentum: number
  stabilization_drag: number
  continuity_drift: number
  escalation_momentum: number

  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
  executive_summary: string | null
  action_cue: string | null
}

type RecoveryState =
  | 'INSUFFICIENT_HISTORY'
  | 'RECOVERY_STRENGTHENING'
  | 'RECOVERY_HOLDING'
  | 'RECOVERY_FRAGILE'
  | 'RECOVERY_STALLED'

type PanelRow = {
  label: string
  value: string
}

const SAMPLE_LIMIT = 120

export default function RecoveryPage() {
  return (
    <CGIGovernanceShell>
      <RecoveryContent />
    </CGIGovernanceShell>
  )
}

function RecoveryContent() {
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadRecoveryMetrics()
  }, [])

  async function loadRecoveryMetrics() {
    setMessage('Loading persisted CGI recovery metrics...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Failed to load persisted CGI recovery metrics.')
      return
    }

    setMetrics(data || [])
    setMessage('Persisted CGI recovery metrics loaded.')
  }

  const recovery = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

    const latest = ordered[ordered.length - 1] || null
    const previous = ordered[ordered.length - 2] || null

    const earlyWindow = ordered.slice(0, 5)
    const recentWindow = ordered.slice(-5)

    const averageRecoveryReliability = average(
      metrics.map((item) => item.recovery_reliability_score),
    )

    const averageRecoveryDirection = average(
      metrics.map((item) => item.recovery_direction),
    )

    const averageStabilizationTrend = average(
      metrics.map((item) => item.stabilization_trend),
    )

    const averageStabilizationConfidence = average(
      metrics.map((item) => item.stabilization_confidence_score),
    )

    const averageSurvivability = average(
      metrics.map((item) => item.operational_survivability_score),
    )

    const averageContinuityIntegrity = average(
      metrics.map((item) => item.continuity_integrity_score),
    )

    const averageUnresolvedMomentum = average(
      metrics.map((item) => item.unresolved_momentum),
    )

    const averageStabilizationDrag = average(
      metrics.map((item) => item.stabilization_drag),
    )

    const averageContinuityDrift = average(
      metrics.map((item) => item.continuity_drift),
    )

    const averageEscalationMomentum = average(
      metrics.map((item) => item.escalation_momentum),
    )

    const averageInstabilityBurden = average([
      averageUnresolvedMomentum,
      averageStabilizationDrag,
      averageContinuityDrift,
      averageEscalationMomentum,
      average(metrics.map((item) => item.propagation_risk)),
      average(metrics.map((item) => item.trajectory_risk)),
      average(metrics.map((item) => item.structural_memory_risk)),
    ])

    const recoveryConversionScore = clamp(
      average([
        averageRecoveryReliability,
        averageRecoveryDirection,
        averageStabilizationTrend,
        averageStabilizationConfidence,
        averageSurvivability,
        averageContinuityIntegrity,
        100 - averageInstabilityBurden,
      ]),
    )

    const earlyRecoveryConversion = average(
      earlyWindow.map((item) =>
        recoveryConversionFromSnapshot(item),
      ),
    )

    const recentRecoveryConversion = average(
      recentWindow.map((item) =>
        recoveryConversionFromSnapshot(item),
      ),
    )

    const recoveryVelocity =
      metrics.length < 2
        ? 0
        : Math.round(recentRecoveryConversion - earlyRecoveryConversion)

    const latestRecoveryMovement =
      latest && previous
        ? recoveryConversionFromSnapshot(latest) -
          recoveryConversionFromSnapshot(previous)
        : 0

    const recoveryVolatility = calculateVolatility(
      metrics.map((item) => recoveryConversionFromSnapshot(item)),
    )

    const recoveryBlockageScore = clamp(
      average([
        averageUnresolvedMomentum,
        averageStabilizationDrag,
        averageContinuityDrift,
        averageEscalationMomentum,
        100 - averageRecoveryReliability,
        100 - averageRecoveryDirection,
        100 - averageStabilizationTrend,
        100 - averageSurvivability,
      ]),
    )

    const recoveryState = getRecoveryState({
      count: metrics.length,
      recoveryConversionScore,
      recoveryVelocity,
      recoveryVolatility,
      recoveryBlockageScore,
      latest,
    })

    const dominantRecoveryBlocker = strongestDriver({
      'Unresolved momentum': averageUnresolvedMomentum,
      'Stabilization drag': averageStabilizationDrag,
      'Continuity drift': averageContinuityDrift,
      'Escalation momentum': averageEscalationMomentum,
      'Recovery reliability weakness': 100 - averageRecoveryReliability,
      'Recovery direction weakness': 100 - averageRecoveryDirection,
      'Stabilization trend weakness': 100 - averageStabilizationTrend,
      'Survivability weakness': 100 - averageSurvivability,
      'Stabilization confidence weakness': 100 - averageStabilizationConfidence,
    })

    const executiveSummary = getExecutiveSummary(recoveryState)
    const actionCue = getActionCue(recoveryState)

    return {
      ordered,
      latest,
      previous,
      averageRecoveryReliability,
      averageRecoveryDirection,
      averageStabilizationTrend,
      averageStabilizationConfidence,
      averageSurvivability,
      averageContinuityIntegrity,
      averageUnresolvedMomentum,
      averageStabilizationDrag,
      averageContinuityDrift,
      averageEscalationMomentum,
      averageInstabilityBurden,
      recoveryConversionScore,
      earlyRecoveryConversion,
      recentRecoveryConversion,
      recoveryVelocity,
      latestRecoveryMovement,
      recoveryVolatility,
      recoveryBlockageScore,
      recoveryState,
      dominantRecoveryBlocker,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

  const latestRows: PanelRow[] = recovery.latest
    ? [
        {
          label: 'Latest Continuity State',
          value: recovery.latest.continuity_state,
        },
        {
          label: 'Latest Trajectory Direction',
          value: recovery.latest.trajectory_direction,
        },
        {
          label: 'Latest Pressure State',
          value: recovery.latest.pressure_propagation_state,
        },
        {
          label: 'Latest Structural Memory State',
          value: recovery.latest.structural_memory_state,
        },
        {
          label: 'Dominant Pressure Source',
          value:
            recovery.latest.dominant_pressure_source ||
            'No pressure source recorded',
        },
        {
          label: 'Dominant Trajectory Signal',
          value:
            recovery.latest.dominant_trajectory_signal ||
            'No trajectory signal recorded',
        },
        {
          label: 'Dominant Memory Pattern',
          value:
            recovery.latest.dominant_memory_pattern ||
            'No memory pattern recorded',
        },
      ]
    : []

  const recoveryRows: PanelRow[] = [
    {
      label: 'Dominant Recovery Blocker',
      value: recovery.dominantRecoveryBlocker,
    },
    {
      label: 'Recovery Velocity',
      value: formatDelta(recovery.recoveryVelocity),
    },
    {
      label: 'Latest Recovery Movement',
      value: formatDelta(recovery.latestRecoveryMovement),
    },
    {
      label: 'Recovery Volatility',
      value: `${recovery.recoveryVolatility}/100`,
    },
    {
      label: 'Recovery Blockage Score',
      value: `${recovery.recoveryBlockageScore}/100`,
    },
    {
      label: 'Instability Burden',
      value: `${recovery.averageInstabilityBurden}/100`,
    },
  ]

  const brief = `
TSINAXA CGI RECOVERY INTELLIGENCE BRIEF

Recovery State:
${recovery.recoveryState}

Snapshots Reviewed:
${metrics.length}

Recovery Conversion Score:
${recovery.recoveryConversionScore}/100

Dominant Recovery Blocker:
${recovery.dominantRecoveryBlocker}

Recovery Velocity:
${recovery.recoveryVelocity}

Latest Recovery Movement:
${recovery.latestRecoveryMovement}

Recovery Volatility:
${recovery.recoveryVolatility}/100

Recovery Blockage Score:
${recovery.recoveryBlockageScore}/100

Average Recovery Reliability:
${recovery.averageRecoveryReliability}/100

Average Recovery Direction:
${recovery.averageRecoveryDirection}/100

Average Stabilization Trend:
${recovery.averageStabilizationTrend}/100

Average Stabilization Confidence:
${recovery.averageStabilizationConfidence}/100

Average Operational Survivability:
${recovery.averageSurvivability}/100

Average Continuity Integrity:
${recovery.averageContinuityIntegrity}/100

Average Unresolved Momentum:
${recovery.averageUnresolvedMomentum}/100

Average Stabilization Drag:
${recovery.averageStabilizationDrag}/100

Average Continuity Drift:
${recovery.averageContinuityDrift}/100

Average Escalation Momentum:
${recovery.averageEscalationMomentum}/100

Executive Interpretation:
${recovery.executiveSummary}

Recommended Action:
${recovery.actionCue}

Governance-Safe Meaning:
This recovery view uses persisted CGI operational metric snapshots. It does not judge people. It evaluates whether stabilization, recovery reliability, survivability, and direction are converting into durable recovery over time.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • RECOVERY INTELLIGENCE</p>

          <h1 style={styles.title}>Continuity Recovery Intelligence</h1>

          <p style={styles.subtitle}>
            Use persisted CGI operational metric snapshots to see whether stabilization
            confidence, recovery reliability, survivability, and recovery direction are
            actually converting into durable recovery.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.recoveryHero}>
          <div>
            <p style={styles.scoreLabel}>Recovery State</p>
            <h2 style={styles.recoveryState}>{recovery.recoveryState}</h2>
            <p style={styles.panelNote}>{recovery.executiveSummary}</p>
          </div>

          <div style={styles.scoreGrid}>
            <ScoreMetric
              label="Recovery Conversion"
              value={recovery.recoveryConversionScore}
            />
            <ScoreMetric
              label="Recovery Reliability"
              value={recovery.averageRecoveryReliability}
            />
            <ScoreMetric
              label="Recovery Direction"
              value={recovery.averageRecoveryDirection}
            />
            <ScoreMetric
              label="Stabilization Trend"
              value={recovery.averageStabilizationTrend}
            />
            <ScoreMetric
              label="Survivability"
              value={recovery.averageSurvivability}
            />
            <ScoreMetric
              label="Blockage Score"
              value={recovery.recoveryBlockageScore}
            />
          </div>

          <div style={styles.actionBox}>
            <strong>Recommended Action:</strong>
            <span>{recovery.actionCue}</span>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Snapshots Reviewed" value={metrics.length} />
          <Metric
            label="Dominant Blocker"
            value={recovery.dominantRecoveryBlocker}
          />
          <Metric label="Recovery Velocity" value={formatDelta(recovery.recoveryVelocity)} />
          <Metric
            label="Latest Recovery Movement"
            value={formatDelta(recovery.latestRecoveryMovement)}
          />
          <Metric
            label="Recovery Volatility"
            value={`${recovery.recoveryVolatility}/100`}
          />
          <Metric
            label="Instability Burden"
            value={`${recovery.averageInstabilityBurden}/100`}
          />
          <Metric
            label="Stabilization Confidence Avg"
            value={`${recovery.averageStabilizationConfidence}/100`}
          />
          <Metric
            label="Continuity Integrity Avg"
            value={`${recovery.averageContinuityIntegrity}/100`}
          />
        </section>

        <section style={styles.metricsGrid}>
          <Metric
            label="Unresolved Momentum Avg"
            value={`${recovery.averageUnresolvedMomentum}/100`}
          />
          <Metric
            label="Stabilization Drag Avg"
            value={`${recovery.averageStabilizationDrag}/100`}
          />
          <Metric
            label="Continuity Drift Avg"
            value={`${recovery.averageContinuityDrift}/100`}
          />
          <Metric
            label="Escalation Momentum Avg"
            value={`${recovery.averageEscalationMomentum}/100`}
          />
        </section>

        <section style={styles.layoutGrid}>
          <Panel
            title="Latest Persisted Recovery Context"
            note="Most recent saved operational recovery context."
            rows={latestRows}
          />

          <Panel
            title="Recovery Conversion Reading"
            note="Shows whether stabilization signals are becoming durable recovery."
            rows={recoveryRows}
          />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Recent Recovery Snapshot Trail</h2>

          <p style={styles.panelNote}>
            Latest saved rows from <code>cgi_operational_metrics</code>. These are
            historical recovery records, not live recalculations.
          </p>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Scope</th>
                  <th style={styles.th}>Continuity</th>
                  <th style={styles.th}>Recovery Reliability</th>
                  <th style={styles.th}>Recovery Direction</th>
                  <th style={styles.th}>Stabilization Trend</th>
                  <th style={styles.th}>Survivability</th>
                  <th style={styles.th}>Unresolved</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={8}>
                      No persisted CGI operational metrics found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 12).map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{formatDate(item.created_at)}</td>
                    <td style={styles.td}>{item.scope}</td>
                    <td style={styles.td}>{item.continuity_state}</td>
                    <td style={styles.td}>{item.recovery_reliability_score}/100</td>
                    <td style={styles.td}>{item.recovery_direction}/100</td>
                    <td style={styles.td}>{item.stabilization_trend}/100</td>
                    <td style={styles.td}>{item.operational_survivability_score}/100</td>
                    <td style={styles.td}>{item.unresolved_momentum}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={loadRecoveryMetrics} style={styles.primaryButton}>
            Refresh Recovery Metrics
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Generated Recovery Brief</h2>
          <pre style={styles.summaryBox}>{brief}</pre>
        </section>
      </div>
    </main>
  )
}

function recoveryConversionFromSnapshot(item: CgiOperationalMetric) {
  return clamp(
    average([
      item.recovery_reliability_score,
      item.recovery_direction,
      item.stabilization_trend,
      item.stabilization_confidence_score,
      item.operational_survivability_score,
      item.continuity_integrity_score,
      100 -
        average([
          item.unresolved_momentum,
          item.stabilization_drag,
          item.continuity_drift,
          item.escalation_momentum,
          item.propagation_risk,
          item.trajectory_risk,
          item.structural_memory_risk,
        ]),
    ]),
  )
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))

  if (valid.length === 0) return 0

  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length)
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function calculateVolatility(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))

  if (valid.length < 2) return 0

  const mean = average(valid)

  const variance =
    valid.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    valid.length

  return Math.min(100, Math.round(Math.sqrt(variance)))
}

function strongestDriver(scores: Record<string, number>) {
  return (
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No dominant recovery blocker detected'
  )
}

function getRecoveryState(input: {
  count: number
  recoveryConversionScore: number
  recoveryVelocity: number
  recoveryVolatility: number
  recoveryBlockageScore: number
  latest: CgiOperationalMetric | null
}): RecoveryState {
  if (input.count < 3) return 'INSUFFICIENT_HISTORY'

  if (
    input.recoveryConversionScore >= 65 &&
    input.recoveryVelocity >= 5 &&
    input.recoveryBlockageScore < 40 &&
    input.recoveryVolatility < 25
  ) {
    return 'RECOVERY_STRENGTHENING'
  }

  if (
    input.recoveryConversionScore < 35 ||
    input.recoveryVelocity <= -10 ||
    input.recoveryBlockageScore >= 65 ||
    input.latest?.continuity_state === 'UNSTABLE'
  ) {
    return 'RECOVERY_STALLED'
  }

  if (
    input.recoveryConversionScore < 50 ||
    input.recoveryBlockageScore >= 50 ||
    input.recoveryVolatility >= 25
  ) {
    return 'RECOVERY_FRAGILE'
  }

  return 'RECOVERY_HOLDING'
}

function getExecutiveSummary(state: RecoveryState) {
  if (state === 'INSUFFICIENT_HISTORY') {
    return 'There are not enough persisted snapshots yet to judge recovery conversion over time. Continue saving operational snapshots.'
  }

  if (state === 'RECOVERY_STRENGTHENING') {
    return 'Recovery intelligence shows strengthening recovery conversion. Stabilization, reliability, survivability, and recovery direction are moving in a favorable direction.'
  }

  if (state === 'RECOVERY_STALLED') {
    return 'Recovery intelligence shows stalled recovery. Stabilization signals are not converting into durable recovery strongly enough.'
  }

  if (state === 'RECOVERY_FRAGILE') {
    return 'Recovery intelligence shows fragile recovery. Some recovery movement exists, but unresolved momentum, drag, drift, or volatility may weaken durability.'
  }

  return 'Recovery intelligence is holding. Current persisted snapshots show neither strong strengthening nor clear collapse of recovery conversion.'
}

function getActionCue(state: RecoveryState) {
  if (state === 'INSUFFICIENT_HISTORY') {
    return 'Save more operational snapshots before relying on recovery conversion interpretation.'
  }

  if (state === 'RECOVERY_STRENGTHENING') {
    return 'Preserve recovery discipline and continue confirming that stabilization remains durable.'
  }

  if (state === 'RECOVERY_STALLED') {
    return 'Review unresolved momentum, stabilization drag, recovery direction, survivability, and outcome confirmation immediately.'
  }

  if (state === 'RECOVERY_FRAGILE') {
    return 'Strengthen follow-up, outcome confirmation, routing ownership, and recovery monitoring before recovery weakens.'
  }

  return 'Maintain monitoring and continue saving snapshots to confirm whether recovery remains durable.'
}

function formatDelta(value: number) {
  if (value > 0) return `+${value}`
  return `${value}`
}

function formatDate(value: string) {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleString()
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <h2 style={styles.metricValue}>{value}</h2>
    </div>
  )
}

function ScoreMetric({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.scoreCard}>
      <p style={styles.scoreMetricLabel}>{label}</p>
      <h3 style={styles.scoreMetricValue}>{value}/100</h3>
    </div>
  )
}

function Panel({
  title,
  note,
  rows,
}: {
  title: string
  note: string
  rows: PanelRow[]
}) {
  return (
    <div style={styles.card}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <p style={styles.panelNote}>{note}</p>

      <div style={styles.panelList}>
        {rows.length === 0 && <p style={styles.emptyText}>No data available yet.</p>}

        {rows.map((row, index) => (
          <div key={`${row.label}-${index}`} style={styles.panelRow}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: 'white',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  hero: {
    marginBottom: '32px',
  },
  kicker: {
    color: '#67e8f9',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
  },
  title: {
    fontSize: 'clamp(34px, 6vw, 58px)',
    lineHeight: 1.05,
    margin: '12px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '980px',
    lineHeight: 1.7,
    fontSize: '18px',
  },
  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '20px',
  },
  recoveryHero: {
    background: '#020617',
    border: '1px solid #22c55e',
    borderRadius: '28px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
  },
  scoreLabel: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  recoveryState: {
    fontSize: 'clamp(36px, 7vw, 68px)',
    margin: '8px 0 20px',
    color: '#86efac',
    letterSpacing: '-0.05em',
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '14px',
  },
  scoreCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
  },
  scoreMetricLabel: {
    color: '#94a3b8',
    fontWeight: 800,
    margin: 0,
  },
  scoreMetricValue: {
    color: '#f8fafc',
    fontSize: '28px',
    margin: '10px 0 0',
  },
  actionBox: {
    display: 'grid',
    gap: '8px',
    background: '#052e16',
    border: '1px solid #22c55e',
    borderRadius: '18px',
    padding: '18px',
    marginTop: '16px',
    color: '#dcfce7',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },
  metricCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '20px',
    overflow: 'hidden',
  },
  metricLabel: {
    color: '#94a3b8',
    fontWeight: 800,
    margin: 0,
  },
  metricValue: {
    fontSize: 'clamp(22px, 4vw, 34px)',
    margin: '8px 0 0',
    overflowWrap: 'anywhere',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },
  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '28px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
  },
  sectionTitle: {
    fontSize: '26px',
    margin: '0 0 10px',
  },
  panelNote: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    marginBottom: '18px',
  },
  panelList: {
    display: 'grid',
    gap: '10px',
  },
  panelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '14px',
  },
  emptyText: {
    color: '#94a3b8',
  },
  tableWrap: {
    overflowX: 'auto',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '900px',
  },
  th: {
    textAlign: 'left',
    color: '#94a3b8',
    borderBottom: '1px solid #334155',
    padding: '12px',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  td: {
    borderBottom: '1px solid #1e293b',
    padding: '12px',
    color: '#e2e8f0',
    verticalAlign: 'top',
  },
  primaryButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    background: '#67e8f9',
    color: '#082f49',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '16px',
  },
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
    color: '#e2e8f0',
    lineHeight: 1.6,
    minHeight: '360px',
  },
}