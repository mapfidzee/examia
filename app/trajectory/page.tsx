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

  trajectory_risk: number
  continuity_drift: number
  escalation_momentum: number
  recovery_direction: number
  stabilization_trend: number
  unresolved_momentum: number

  propagation_risk: number
  structural_memory_risk: number

  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
  executive_summary: string | null
  action_cue: string | null
}

type TrajectoryState =
  | 'INSUFFICIENT_HISTORY'
  | 'TRAJECTORY_RECOVERING'
  | 'TRAJECTORY_HOLDING'
  | 'TRAJECTORY_DRIFTING'
  | 'TRAJECTORY_DETERIORATING'

type PanelRow = {
  label: string
  value: string
}

const SAMPLE_LIMIT = 120

export default function TrajectoryPage() {
  return (
    <CGIGovernanceShell>
      <TrajectoryContent />
    </CGIGovernanceShell>
  )
}

function TrajectoryContent() {
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadTrajectoryMetrics()
  }, [])

  async function loadTrajectoryMetrics() {
    setMessage('Loading persisted CGI trajectory metrics...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Failed to load persisted CGI trajectory metrics.')
      return
    }

    setMetrics(data || [])
    setMessage('Persisted CGI trajectory metrics loaded.')
  }

  const trajectory = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

    const latest = ordered[ordered.length - 1] || null
    const previous = ordered[ordered.length - 2] || null

    const earlyWindow = ordered.slice(0, 5)
    const recentWindow = ordered.slice(-5)

    const averageTrajectoryRisk = average(metrics.map((item) => item.trajectory_risk))
    const averageContinuityDrift = average(metrics.map((item) => item.continuity_drift))
    const averageEscalationMomentum = average(
      metrics.map((item) => item.escalation_momentum),
    )
    const averageRecoveryDirection = average(
      metrics.map((item) => item.recovery_direction),
    )
    const averageStabilizationTrend = average(
      metrics.map((item) => item.stabilization_trend),
    )
    const averageUnresolvedMomentum = average(
      metrics.map((item) => item.unresolved_momentum),
    )

    const averageContinuityIntegrity = average(
      metrics.map((item) => item.continuity_integrity_score),
    )
    const averageStabilizationConfidence = average(
      metrics.map((item) => item.stabilization_confidence_score),
    )
    const averageRecoveryReliability = average(
      metrics.map((item) => item.recovery_reliability_score),
    )
    const averageSurvivability = average(
      metrics.map((item) => item.operational_survivability_score),
    )

    const earlyTrajectoryPressure = average(
      earlyWindow.map((item) =>
        average([
          item.trajectory_risk,
          item.continuity_drift,
          item.escalation_momentum,
          item.unresolved_momentum,
          100 - item.recovery_direction,
          100 - item.stabilization_trend,
        ]),
      ),
    )

    const recentTrajectoryPressure = average(
      recentWindow.map((item) =>
        average([
          item.trajectory_risk,
          item.continuity_drift,
          item.escalation_momentum,
          item.unresolved_momentum,
          100 - item.recovery_direction,
          100 - item.stabilization_trend,
        ]),
      ),
    )

    const trajectoryPressureVelocity =
      metrics.length < 2
        ? 0
        : Math.round(recentTrajectoryPressure - earlyTrajectoryPressure)

    const earlyStabilizationMovement = average(
      earlyWindow.map((item) =>
        average([
          item.recovery_direction,
          item.stabilization_trend,
          item.recovery_reliability_score,
          item.operational_survivability_score,
        ]),
      ),
    )

    const recentStabilizationMovement = average(
      recentWindow.map((item) =>
        average([
          item.recovery_direction,
          item.stabilization_trend,
          item.recovery_reliability_score,
          item.operational_survivability_score,
        ]),
      ),
    )

    const stabilizationMovementVelocity =
      metrics.length < 2
        ? 0
        : Math.round(recentStabilizationMovement - earlyStabilizationMovement)

    const latestTrajectoryMovement =
      latest && previous
        ? average([
            latest.trajectory_risk - previous.trajectory_risk,
            latest.continuity_drift - previous.continuity_drift,
            latest.escalation_momentum - previous.escalation_momentum,
            latest.unresolved_momentum - previous.unresolved_momentum,
            previous.recovery_direction - latest.recovery_direction,
            previous.stabilization_trend - latest.stabilization_trend,
          ])
        : 0

    const latestStabilizationMovement =
      latest && previous
        ? average([
            latest.recovery_direction - previous.recovery_direction,
            latest.stabilization_trend - previous.stabilization_trend,
            latest.recovery_reliability_score - previous.recovery_reliability_score,
            latest.operational_survivability_score -
              previous.operational_survivability_score,
          ])
        : 0

    const trajectoryVolatility = calculateVolatility(
      metrics.map((item) =>
        average([
          item.trajectory_risk,
          item.continuity_drift,
          item.escalation_momentum,
          item.unresolved_momentum,
          100 - item.recovery_direction,
          100 - item.stabilization_trend,
        ]),
      ),
    )

    const directionStrength = clamp(
      average([
        averageRecoveryDirection,
        averageStabilizationTrend,
        averageRecoveryReliability,
        averageSurvivability,
        averageContinuityIntegrity,
        averageStabilizationConfidence,
      ]),
    )

    const deteriorationLoad = clamp(
      average([
        averageTrajectoryRisk,
        averageContinuityDrift,
        averageEscalationMomentum,
        averageUnresolvedMomentum,
        metrics.length > 0
          ? average(metrics.map((item) => item.propagation_risk))
          : 0,
        metrics.length > 0
          ? average(metrics.map((item) => item.structural_memory_risk))
          : 0,
      ]),
    )

    const trajectoryState = getTrajectoryState({
      count: metrics.length,
      directionStrength,
      deteriorationLoad,
      trajectoryPressureVelocity,
      stabilizationMovementVelocity,
      trajectoryVolatility,
      latest,
    })

    const dominantTrajectoryDriver = strongestDriver({
      'Trajectory risk': averageTrajectoryRisk,
      'Continuity drift': averageContinuityDrift,
      'Escalation momentum': averageEscalationMomentum,
      'Unresolved momentum': averageUnresolvedMomentum,
      'Recovery weakness': 100 - averageRecoveryDirection,
      'Stabilization weakness': 100 - averageStabilizationTrend,
      'Reliability weakness': 100 - averageRecoveryReliability,
      'Survivability weakness': 100 - averageSurvivability,
      'Pressure velocity': Math.max(trajectoryPressureVelocity, 0),
      'Stabilization decline': Math.max(-stabilizationMovementVelocity, 0),
      Volatility: trajectoryVolatility,
    })

    const executiveSummary = getExecutiveSummary(trajectoryState)
    const actionCue = getActionCue(trajectoryState)

    return {
      ordered,
      latest,
      previous,
      averageTrajectoryRisk,
      averageContinuityDrift,
      averageEscalationMomentum,
      averageRecoveryDirection,
      averageStabilizationTrend,
      averageUnresolvedMomentum,
      averageContinuityIntegrity,
      averageStabilizationConfidence,
      averageRecoveryReliability,
      averageSurvivability,
      earlyTrajectoryPressure,
      recentTrajectoryPressure,
      trajectoryPressureVelocity,
      earlyStabilizationMovement,
      recentStabilizationMovement,
      stabilizationMovementVelocity,
      latestTrajectoryMovement,
      latestStabilizationMovement,
      trajectoryVolatility,
      directionStrength,
      deteriorationLoad,
      trajectoryState,
      dominantTrajectoryDriver,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

  const latestRows: PanelRow[] = trajectory.latest
    ? [
        {
          label: 'Latest Continuity State',
          value: trajectory.latest.continuity_state,
        },
        {
          label: 'Latest Trajectory Direction',
          value: trajectory.latest.trajectory_direction,
        },
        {
          label: 'Latest Pressure State',
          value: trajectory.latest.pressure_propagation_state,
        },
        {
          label: 'Latest Structural Memory State',
          value: trajectory.latest.structural_memory_state,
        },
        {
          label: 'Dominant Trajectory Signal',
          value:
            trajectory.latest.dominant_trajectory_signal ||
            'No trajectory signal recorded',
        },
        {
          label: 'Dominant Pressure Source',
          value:
            trajectory.latest.dominant_pressure_source ||
            'No pressure source recorded',
        },
        {
          label: 'Dominant Memory Pattern',
          value:
            trajectory.latest.dominant_memory_pattern ||
            'No memory pattern recorded',
        },
      ]
    : []

  const directionRows: PanelRow[] = [
    {
      label: 'Dominant Trajectory Driver',
      value: trajectory.dominantTrajectoryDriver,
    },
    {
      label: 'Trajectory Pressure Velocity',
      value: formatDelta(trajectory.trajectoryPressureVelocity),
    },
    {
      label: 'Stabilization Movement Velocity',
      value: formatDelta(trajectory.stabilizationMovementVelocity),
    },
    {
      label: 'Latest Trajectory Movement',
      value: formatDelta(trajectory.latestTrajectoryMovement),
    },
    {
      label: 'Latest Stabilization Movement',
      value: formatDelta(trajectory.latestStabilizationMovement),
    },
    {
      label: 'Trajectory Volatility',
      value: `${trajectory.trajectoryVolatility}/100`,
    },
    {
      label: 'Direction Strength',
      value: `${trajectory.directionStrength}/100`,
    },
    {
      label: 'Deterioration Load',
      value: `${trajectory.deteriorationLoad}/100`,
    },
  ]

  const brief = `
TSINAXA CGI TRAJECTORY INTELLIGENCE BRIEF

Trajectory State:
${trajectory.trajectoryState}

Snapshots Reviewed:
${metrics.length}

Dominant Trajectory Driver:
${trajectory.dominantTrajectoryDriver}

Direction Strength:
${trajectory.directionStrength}/100

Deterioration Load:
${trajectory.deteriorationLoad}/100

Trajectory Pressure Velocity:
${trajectory.trajectoryPressureVelocity}

Stabilization Movement Velocity:
${trajectory.stabilizationMovementVelocity}

Latest Trajectory Movement:
${trajectory.latestTrajectoryMovement}

Latest Stabilization Movement:
${trajectory.latestStabilizationMovement}

Trajectory Volatility:
${trajectory.trajectoryVolatility}/100

Average Trajectory Risk:
${trajectory.averageTrajectoryRisk}/100

Average Continuity Drift:
${trajectory.averageContinuityDrift}/100

Average Escalation Momentum:
${trajectory.averageEscalationMomentum}/100

Average Recovery Direction:
${trajectory.averageRecoveryDirection}/100

Average Stabilization Trend:
${trajectory.averageStabilizationTrend}/100

Average Unresolved Momentum:
${trajectory.averageUnresolvedMomentum}/100

Average Continuity Integrity:
${trajectory.averageContinuityIntegrity}/100

Average Stabilization Confidence:
${trajectory.averageStabilizationConfidence}/100

Average Recovery Reliability:
${trajectory.averageRecoveryReliability}/100

Average Operational Survivability:
${trajectory.averageSurvivability}/100

Executive Interpretation:
${trajectory.executiveSummary}

Recommended Action:
${trajectory.actionCue}

Governance-Safe Meaning:
This trajectory view uses persisted CGI operational metric snapshots. It does not judge people. It evaluates whether continuity direction is recovering, holding, drifting, or deteriorating across time.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • TRAJECTORY INTELLIGENCE</p>

          <h1 style={styles.title}>Continuity Trajectory Intelligence</h1>

          <p style={styles.subtitle}>
            Use persisted CGI operational metric snapshots to see whether continuity is
            recovering, holding, drifting, or deteriorating across time.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.trajectoryHero}>
          <div>
            <p style={styles.scoreLabel}>Trajectory State</p>
            <h2 style={styles.trajectoryState}>{trajectory.trajectoryState}</h2>
            <p style={styles.panelNote}>{trajectory.executiveSummary}</p>
          </div>

          <div style={styles.scoreGrid}>
            <ScoreMetric
              label="Direction Strength"
              value={trajectory.directionStrength}
            />
            <ScoreMetric
              label="Deterioration Load"
              value={trajectory.deteriorationLoad}
            />
            <ScoreMetric
              label="Trajectory Risk"
              value={trajectory.averageTrajectoryRisk}
            />
            <ScoreMetric
              label="Continuity Drift"
              value={trajectory.averageContinuityDrift}
            />
            <ScoreMetric
              label="Recovery Direction"
              value={trajectory.averageRecoveryDirection}
            />
            <ScoreMetric
              label="Stabilization Trend"
              value={trajectory.averageStabilizationTrend}
            />
          </div>

          <div style={styles.actionBox}>
            <strong>Recommended Action:</strong>
            <span>{trajectory.actionCue}</span>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Snapshots Reviewed" value={metrics.length} />
          <Metric
            label="Dominant Driver"
            value={trajectory.dominantTrajectoryDriver}
          />
          <Metric
            label="Trajectory Pressure Velocity"
            value={formatDelta(trajectory.trajectoryPressureVelocity)}
          />
          <Metric
            label="Stabilization Velocity"
            value={formatDelta(trajectory.stabilizationMovementVelocity)}
          />
          <Metric
            label="Latest Trajectory Movement"
            value={formatDelta(trajectory.latestTrajectoryMovement)}
          />
          <Metric
            label="Latest Stabilization Movement"
            value={formatDelta(trajectory.latestStabilizationMovement)}
          />
          <Metric
            label="Trajectory Volatility"
            value={`${trajectory.trajectoryVolatility}/100`}
          />
          <Metric
            label="Unresolved Momentum Avg"
            value={`${trajectory.averageUnresolvedMomentum}/100`}
          />
        </section>

        <section style={styles.metricsGrid}>
          <Metric
            label="Escalation Momentum Avg"
            value={`${trajectory.averageEscalationMomentum}/100`}
          />
          <Metric
            label="Continuity Integrity Avg"
            value={`${trajectory.averageContinuityIntegrity}/100`}
          />
          <Metric
            label="Stabilization Confidence Avg"
            value={`${trajectory.averageStabilizationConfidence}/100`}
          />
          <Metric
            label="Recovery Reliability Avg"
            value={`${trajectory.averageRecoveryReliability}/100`}
          />
          <Metric
            label="Survivability Avg"
            value={`${trajectory.averageSurvivability}/100`}
          />
        </section>

        <section style={styles.layoutGrid}>
          <Panel
            title="Latest Persisted Trajectory State"
            note="Most recent saved trajectory snapshot."
            rows={latestRows}
          />

          <Panel
            title="Trajectory Direction Reading"
            note="Shows whether continuity direction is strengthening, weakening, drifting, or volatile."
            rows={directionRows}
          />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Recent Trajectory Snapshot Trail</h2>

          <p style={styles.panelNote}>
            Latest saved rows from <code>cgi_operational_metrics</code>. These are
            historical trajectory records, not live recalculations.
          </p>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Scope</th>
                  <th style={styles.th}>Trajectory</th>
                  <th style={styles.th}>Risk</th>
                  <th style={styles.th}>Drift</th>
                  <th style={styles.th}>Escalation</th>
                  <th style={styles.th}>Recovery</th>
                  <th style={styles.th}>Stabilization</th>
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
                    <td style={styles.td}>{item.trajectory_direction}</td>
                    <td style={styles.td}>{item.trajectory_risk}/100</td>
                    <td style={styles.td}>{item.continuity_drift}/100</td>
                    <td style={styles.td}>{item.escalation_momentum}/100</td>
                    <td style={styles.td}>{item.recovery_direction}/100</td>
                    <td style={styles.td}>{item.stabilization_trend}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={loadTrajectoryMetrics} style={styles.primaryButton}>
            Refresh Trajectory Metrics
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Generated Trajectory Brief</h2>
          <pre style={styles.summaryBox}>{brief}</pre>
        </section>
      </div>
    </main>
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
    'No dominant trajectory driver detected'
  )
}

function getTrajectoryState(input: {
  count: number
  directionStrength: number
  deteriorationLoad: number
  trajectoryPressureVelocity: number
  stabilizationMovementVelocity: number
  trajectoryVolatility: number
  latest: CgiOperationalMetric | null
}): TrajectoryState {
  if (input.count < 3) return 'INSUFFICIENT_HISTORY'

  if (
    input.deteriorationLoad >= 65 ||
    input.trajectoryPressureVelocity >= 15 ||
    input.stabilizationMovementVelocity <= -15 ||
    input.latest?.trajectory_direction === 'DETERIORATING' ||
    input.latest?.trajectory_direction === 'COLLAPSE_RISK'
  ) {
    return 'TRAJECTORY_DETERIORATING'
  }

  if (
    input.deteriorationLoad >= 45 ||
    input.trajectoryPressureVelocity >= 8 ||
    input.stabilizationMovementVelocity <= -8 ||
    input.trajectoryVolatility >= 25 ||
    input.latest?.trajectory_direction === 'DRIFTING'
  ) {
    return 'TRAJECTORY_DRIFTING'
  }

  if (
    input.directionStrength >= 60 &&
    input.stabilizationMovementVelocity >= 5 &&
    input.deteriorationLoad < 45
  ) {
    return 'TRAJECTORY_RECOVERING'
  }

  return 'TRAJECTORY_HOLDING'
}

function getExecutiveSummary(state: TrajectoryState) {
  if (state === 'INSUFFICIENT_HISTORY') {
    return 'There are not enough persisted snapshots yet to judge trajectory movement over time. Continue saving operational snapshots.'
  }

  if (state === 'TRAJECTORY_DETERIORATING') {
    return 'Trajectory intelligence shows deterioration. Continuity pressure is rising, stabilization direction is weakening, or the latest state is moving toward collapse risk.'
  }

  if (state === 'TRAJECTORY_DRIFTING') {
    return 'Trajectory intelligence shows drift. Continuity has not collapsed, but recovery direction and stabilization trend are not yet strong enough.'
  }

  if (state === 'TRAJECTORY_RECOVERING') {
    return 'Trajectory intelligence shows recovery movement. Stabilization direction, recovery reliability, or survivability are improving across persisted snapshots.'
  }

  return 'Trajectory intelligence is holding. Persisted snapshots do not show major recovery acceleration or major deterioration.'
}

function getActionCue(state: TrajectoryState) {
  if (state === 'INSUFFICIENT_HISTORY') {
    return 'Save more operational snapshots before relying on trajectory trend interpretation.'
  }

  if (state === 'TRAJECTORY_DETERIORATING') {
    return 'Activate trajectory review and inspect drift, escalation momentum, unresolved momentum, recovery direction, and stabilization trend immediately.'
  }

  if (state === 'TRAJECTORY_DRIFTING') {
    return 'Strengthen routing ownership, intervention completion, outcome confirmation, and recovery monitoring to restore direction.'
  }

  if (state === 'TRAJECTORY_RECOVERING') {
    return 'Preserve current recovery discipline and continue confirming that stabilization remains durable.'
  }

  return 'Maintain monitoring and continue saving snapshots to detect whether trajectory begins recovering or deteriorating.'
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
  trajectoryHero: {
    background: '#020617',
    border: '1px solid #a78bfa',
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
  trajectoryState: {
    fontSize: 'clamp(36px, 7vw, 68px)',
    margin: '8px 0 20px',
    color: '#c4b5fd',
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
    background: '#2e1065',
    border: '1px solid #a78bfa',
    borderRadius: '18px',
    padding: '18px',
    marginTop: '16px',
    color: '#ede9fe',
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