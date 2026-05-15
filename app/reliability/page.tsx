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

  continuity_integrity_score: number
  stabilization_confidence_score: number
  escalation_pressure_index: number
  recovery_reliability_score: number
  operational_survivability_score: number
  continuity_state: string

  propagation_risk: number
  routing_friction: number
  responder_pressure: number
  escalation_velocity: number
  coordination_instability: number
  stabilization_drag: number
  pressure_propagation_state: string

  trajectory_risk: number
  continuity_drift: number
  escalation_momentum: number
  recovery_direction: number
  stabilization_trend: number
  unresolved_momentum: number
  trajectory_direction: string

  structural_memory_risk: number
  routing_failure_recurrence: number
  escalation_corridor_recurrence: number
  institutional_fragility_signature: number
  intervention_failure_pattern: number
  responder_strain_recurrence: number
  continuity_collapse_recurrence: number
  structural_memory_state: string

  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
  executive_summary: string | null
  action_cue: string | null
}

type ReliabilityState =
  | 'RELIABILITY_STRENGTHENING'
  | 'RELIABILITY_HOLDING'
  | 'RELIABILITY_UNSTABLE'
  | 'RELIABILITY_DETERIORATING'
  | 'INSUFFICIENT_HISTORY'

type PanelRow = {
  label: string
  value: string
}

const SAMPLE_LIMIT = 100

export default function ReliabilityPage() {
  return (
    <CGIGovernanceShell>
      <ReliabilityContent />
    </CGIGovernanceShell>
  )
}

function ReliabilityContent() {
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadReliabilityMetrics()
  }, [])

  async function loadReliabilityMetrics() {
    setMessage('Loading persisted CGI reliability metrics...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Failed to load persisted CGI reliability metrics.')
      return
    }

    setMetrics(data || [])
    setMessage('Persisted CGI reliability metrics loaded.')
  }

  const reliability = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

    const latest = ordered[ordered.length - 1] || null
    const previous = ordered[ordered.length - 2] || null

    const firstFive = ordered.slice(0, 5)
    const lastFive = ordered.slice(-5)

    const averageContinuity = average(
      metrics.map((item) => item.continuity_integrity_score),
    )

    const averageStabilization = average(
      metrics.map((item) => item.stabilization_confidence_score),
    )

    const averageRecoveryReliability = average(
      metrics.map((item) => item.recovery_reliability_score),
    )

    const averageSurvivability = average(
      metrics.map((item) => item.operational_survivability_score),
    )

    const averagePropagationRisk = average(
      metrics.map((item) => item.propagation_risk),
    )

    const averageTrajectoryRisk = average(
      metrics.map((item) => item.trajectory_risk),
    )

    const averageStructuralMemoryRisk = average(
      metrics.map((item) => item.structural_memory_risk),
    )

    const earlyReliability = average(
      firstFive.map((item) => item.recovery_reliability_score),
    )

    const recentReliability = average(
      lastFive.map((item) => item.recovery_reliability_score),
    )

    const earlySurvivability = average(
      firstFive.map((item) => item.operational_survivability_score),
    )

    const recentSurvivability = average(
      lastFive.map((item) => item.operational_survivability_score),
    )

    const reliabilityDelta =
      metrics.length < 2 ? 0 : Math.round(recentReliability - earlyReliability)

    const survivabilityDelta =
      metrics.length < 2 ? 0 : Math.round(recentSurvivability - earlySurvivability)

    const latestReliabilityDelta = latest && previous
      ? latest.recovery_reliability_score - previous.recovery_reliability_score
      : 0

    const volatility = calculateVolatility(
      metrics.map((item) => item.recovery_reliability_score),
    )

    const instabilityLoad = average([
      averagePropagationRisk,
      averageTrajectoryRisk,
      averageStructuralMemoryRisk,
      average(metrics.map((item) => item.escalation_pressure_index)),
    ])

    const reliabilityState = getReliabilityState({
      count: metrics.length,
      reliabilityDelta,
      survivabilityDelta,
      volatility,
      latestReliability: latest?.recovery_reliability_score ?? 0,
      instabilityLoad,
    })

    const executiveSummary = getExecutiveSummary(reliabilityState)

    const actionCue = getActionCue(reliabilityState)

    const dominantWeakness = strongestWeakness({
      propagationRisk: averagePropagationRisk,
      trajectoryRisk: averageTrajectoryRisk,
      structuralMemoryRisk: averageStructuralMemoryRisk,
      escalationPressure: average(metrics.map((item) => item.escalation_pressure_index)),
      continuityWeakness: 100 - averageContinuity,
      stabilizationWeakness: 100 - averageStabilization,
      survivabilityWeakness: 100 - averageSurvivability,
    })

    return {
      ordered,
      latest,
      previous,
      averageContinuity,
      averageStabilization,
      averageRecoveryReliability,
      averageSurvivability,
      averagePropagationRisk,
      averageTrajectoryRisk,
      averageStructuralMemoryRisk,
      reliabilityDelta,
      survivabilityDelta,
      latestReliabilityDelta,
      volatility,
      instabilityLoad,
      reliabilityState,
      executiveSummary,
      actionCue,
      dominantWeakness,
    }
  }, [metrics])

  const latestRows: PanelRow[] = reliability.latest
    ? [
        {
          label: 'Latest Continuity State',
          value: reliability.latest.continuity_state,
        },
        {
          label: 'Latest Pressure State',
          value: reliability.latest.pressure_propagation_state,
        },
        {
          label: 'Latest Trajectory Direction',
          value: reliability.latest.trajectory_direction,
        },
        {
          label: 'Latest Structural Memory State',
          value: reliability.latest.structural_memory_state,
        },
        {
          label: 'Dominant Pressure Source',
          value:
            reliability.latest.dominant_pressure_source ||
            'No pressure source recorded',
        },
        {
          label: 'Dominant Trajectory Signal',
          value:
            reliability.latest.dominant_trajectory_signal ||
            'No trajectory signal recorded',
        },
        {
          label: 'Dominant Memory Pattern',
          value:
            reliability.latest.dominant_memory_pattern ||
            'No memory pattern recorded',
        },
      ]
    : []

  const reliabilityRows: PanelRow[] = [
    {
      label: 'Reliability Direction',
      value:
        reliability.reliabilityDelta > 0
          ? `Improving by ${reliability.reliabilityDelta} points`
          : reliability.reliabilityDelta < 0
            ? `Weakening by ${Math.abs(reliability.reliabilityDelta)} points`
            : 'No directional movement yet',
    },
    {
      label: 'Survivability Direction',
      value:
        reliability.survivabilityDelta > 0
          ? `Improving by ${reliability.survivabilityDelta} points`
          : reliability.survivabilityDelta < 0
            ? `Weakening by ${Math.abs(reliability.survivabilityDelta)} points`
            : 'No directional movement yet',
    },
    {
      label: 'Reliability Volatility',
      value: `${reliability.volatility}/100`,
    },
    {
      label: 'Instability Load',
      value: `${reliability.instabilityLoad}/100`,
    },
    {
      label: 'Dominant Weakness',
      value: reliability.dominantWeakness,
    },
  ]

  const brief = `
TSINAXA CGI RELIABILITY INTELLIGENCE BRIEF

Reliability State:
${reliability.reliabilityState}

Snapshots Reviewed:
${metrics.length}

Average Continuity Integrity:
${reliability.averageContinuity}/100

Average Stabilization Confidence:
${reliability.averageStabilization}/100

Average Recovery Reliability:
${reliability.averageRecoveryReliability}/100

Average Operational Survivability:
${reliability.averageSurvivability}/100

Average Propagation Risk:
${reliability.averagePropagationRisk}/100

Average Trajectory Risk:
${reliability.averageTrajectoryRisk}/100

Average Structural Memory Risk:
${reliability.averageStructuralMemoryRisk}/100

Reliability Delta:
${reliability.reliabilityDelta}

Survivability Delta:
${reliability.survivabilityDelta}

Volatility:
${reliability.volatility}/100

Dominant Weakness:
${reliability.dominantWeakness}

Executive Interpretation:
${reliability.executiveSummary}

Recommended Action:
${reliability.actionCue}

Governance-Safe Meaning:
This reliability view uses persisted CGI operational metric snapshots. It does not judge people. It evaluates whether continuity stabilization is becoming more reliable, less reliable, volatile, or still too thin to interpret over time.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • RELIABILITY INTELLIGENCE</p>

          <h1 style={styles.title}>Continuity Reliability Intelligence</h1>

          <p style={styles.subtitle}>
            Read persisted CGI operational metric snapshots to determine whether
            continuity stabilization is becoming more reliable, less reliable,
            volatile, or still too early to interpret.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.reliabilityHero}>
          <div>
            <p style={styles.scoreLabel}>Reliability State</p>
            <h2 style={styles.reliabilityState}>{reliability.reliabilityState}</h2>
            <p style={styles.panelNote}>{reliability.executiveSummary}</p>
          </div>

          <div style={styles.scoreGrid}>
            <ScoreMetric
              label="Average Recovery Reliability"
              value={reliability.averageRecoveryReliability}
            />
            <ScoreMetric
              label="Average Survivability"
              value={reliability.averageSurvivability}
            />
            <ScoreMetric
              label="Average Continuity Integrity"
              value={reliability.averageContinuity}
            />
            <ScoreMetric
              label="Average Stabilization Confidence"
              value={reliability.averageStabilization}
            />
            <ScoreMetric
              label="Reliability Volatility"
              value={reliability.volatility}
            />
            <ScoreMetric
              label="Instability Load"
              value={reliability.instabilityLoad}
            />
          </div>

          <div style={styles.actionBox}>
            <strong>Recommended Action:</strong>
            <span>{reliability.actionCue}</span>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Snapshots Reviewed" value={metrics.length} />
          <Metric
            label="Reliability Delta"
            value={formatDelta(reliability.reliabilityDelta)}
          />
          <Metric
            label="Survivability Delta"
            value={formatDelta(reliability.survivabilityDelta)}
          />
          <Metric
            label="Latest Reliability Movement"
            value={formatDelta(reliability.latestReliabilityDelta)}
          />
          <Metric
            label="Propagation Risk Avg"
            value={`${reliability.averagePropagationRisk}/100`}
          />
          <Metric
            label="Trajectory Risk Avg"
            value={`${reliability.averageTrajectoryRisk}/100`}
          />
          <Metric
            label="Memory Risk Avg"
            value={`${reliability.averageStructuralMemoryRisk}/100`}
          />
          <Metric label="Dominant Weakness" value={reliability.dominantWeakness} />
        </section>

        <section style={styles.layoutGrid}>
          <Panel
            title="Latest Persisted Snapshot"
            note="Most recent saved CGI operational metric state."
            rows={latestRows}
          />

          <Panel
            title="Reliability Direction"
            note="Interprets whether stabilization reliability is strengthening, weakening, or volatile over time."
            rows={reliabilityRows}
          />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Recent Persisted Snapshots</h2>

          <p style={styles.panelNote}>
            Latest saved snapshots from <code>cgi_operational_metrics</code>. These are
            historical records, not live recalculations.
          </p>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Scope</th>
                  <th style={styles.th}>Continuity</th>
                  <th style={styles.th}>Pressure</th>
                  <th style={styles.th}>Trajectory</th>
                  <th style={styles.th}>Memory</th>
                  <th style={styles.th}>Reliability</th>
                  <th style={styles.th}>Survivability</th>
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
                    <td style={styles.td}>{item.pressure_propagation_state}</td>
                    <td style={styles.td}>{item.trajectory_direction}</td>
                    <td style={styles.td}>{item.structural_memory_state}</td>
                    <td style={styles.td}>{item.recovery_reliability_score}/100</td>
                    <td style={styles.td}>{item.operational_survivability_score}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={loadReliabilityMetrics} style={styles.primaryButton}>
            Refresh Reliability Metrics
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Generated Reliability Brief</h2>
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

function calculateVolatility(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))

  if (valid.length < 2) return 0

  const mean = average(valid)

  const variance =
    valid.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    valid.length

  return Math.min(100, Math.round(Math.sqrt(variance)))
}

function getReliabilityState(input: {
  count: number
  reliabilityDelta: number
  survivabilityDelta: number
  volatility: number
  latestReliability: number
  instabilityLoad: number
}): ReliabilityState {
  if (input.count < 3) return 'INSUFFICIENT_HISTORY'

  if (
    input.reliabilityDelta >= 8 &&
    input.survivabilityDelta >= 5 &&
    input.volatility <= 20 &&
    input.instabilityLoad < 45
  ) {
    return 'RELIABILITY_STRENGTHENING'
  }

  if (
    input.reliabilityDelta <= -8 ||
    input.survivabilityDelta <= -8 ||
    input.latestReliability < 35 ||
    input.instabilityLoad >= 65
  ) {
    return 'RELIABILITY_DETERIORATING'
  }

  if (input.volatility >= 25 || input.instabilityLoad >= 50) {
    return 'RELIABILITY_UNSTABLE'
  }

  return 'RELIABILITY_HOLDING'
}

function getExecutiveSummary(state: ReliabilityState) {
  if (state === 'INSUFFICIENT_HISTORY') {
    return 'There are not enough persisted snapshots yet to judge reliability over time. Continue saving operational snapshots after meaningful system changes.'
  }

  if (state === 'RELIABILITY_STRENGTHENING') {
    return 'Continuity reliability is strengthening. Recovery reliability, survivability, and instability load are moving in a favorable direction.'
  }

  if (state === 'RELIABILITY_DETERIORATING') {
    return 'Continuity reliability is deteriorating. Recent snapshots suggest weakening recovery reliability, survivability, or rising instability load.'
  }

  if (state === 'RELIABILITY_UNSTABLE') {
    return 'Continuity reliability is unstable. The system may be fluctuating between improvement and deterioration instead of settling into durable stabilization.'
  }

  return 'Continuity reliability is holding. Current historical snapshots do not show major strengthening or major deterioration.'
}

function getActionCue(state: ReliabilityState) {
  if (state === 'INSUFFICIENT_HISTORY') {
    return 'Save more operational snapshots across different operating periods before making a reliability judgment.'
  }

  if (state === 'RELIABILITY_STRENGTHENING') {
    return 'Preserve the current stabilization pattern and continue monitoring for durability.'
  }

  if (state === 'RELIABILITY_DETERIORATING') {
    return 'Review recent pressure, trajectory, structural memory, and recovery reliability changes before reliability loss becomes systemic.'
  }

  if (state === 'RELIABILITY_UNSTABLE') {
    return 'Inspect volatility drivers and compare recent snapshots against routing friction, trajectory drift, and structural recurrence.'
  }

  return 'Maintain monitoring and continue saving snapshots to confirm whether reliability remains durable.'
}

function strongestWeakness(scores: Record<string, number>) {
  return (
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No dominant weakness detected'
  )
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
  reliabilityHero: {
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
  reliabilityState: {
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
    border: '1px solid #16a34a',
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