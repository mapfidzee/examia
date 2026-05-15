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

type PredictionState =
  | 'INSUFFICIENT_HISTORY'
  | 'LOW_NEAR_TERM_RISK'
  | 'WATCH_RISK'
  | 'RISING_INSTABILITY'
  | 'HIGH_COLLAPSE_RISK'

type PanelRow = {
  label: string
  value: string
}

const SAMPLE_LIMIT = 120

export default function PredictivePage() {
  return (
    <CGIGovernanceShell>
      <PredictiveContent />
    </CGIGovernanceShell>
  )
}

function PredictiveContent() {
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPredictiveMetrics()
  }, [])

  async function loadPredictiveMetrics() {
    setMessage('Loading persisted CGI predictive metrics...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Failed to load persisted CGI predictive metrics.')
      return
    }

    setMetrics(data || [])
    setMessage('Persisted CGI predictive metrics loaded.')
  }

  const prediction = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

    const latest = ordered[ordered.length - 1] || null
    const previous = ordered[ordered.length - 2] || null

    const earlyWindow = ordered.slice(0, 5)
    const recentWindow = ordered.slice(-5)

    const averagePropagationRisk = average(metrics.map((item) => item.propagation_risk))
    const averageTrajectoryRisk = average(metrics.map((item) => item.trajectory_risk))
    const averageMemoryRisk = average(metrics.map((item) => item.structural_memory_risk))
    const averageEscalationPressure = average(
      metrics.map((item) => item.escalation_pressure_index),
    )
    const averageContinuityIntegrity = average(
      metrics.map((item) => item.continuity_integrity_score),
    )
    const averageStabilizationConfidence = average(
      metrics.map((item) => item.stabilization_confidence_score),
    )
    const averageReliability = average(
      metrics.map((item) => item.recovery_reliability_score),
    )
    const averageSurvivability = average(
      metrics.map((item) => item.operational_survivability_score),
    )

    const earlyRisk = average(
      earlyWindow.map((item) =>
        average([
          item.propagation_risk,
          item.trajectory_risk,
          item.structural_memory_risk,
          item.escalation_pressure_index,
        ]),
      ),
    )

    const recentRisk = average(
      recentWindow.map((item) =>
        average([
          item.propagation_risk,
          item.trajectory_risk,
          item.structural_memory_risk,
          item.escalation_pressure_index,
        ]),
      ),
    )

    const riskVelocity = metrics.length < 2 ? 0 : recentRisk - earlyRisk

    const earlyReliability = average(
      earlyWindow.map((item) =>
        average([
          item.continuity_integrity_score,
          item.stabilization_confidence_score,
          item.recovery_reliability_score,
          item.operational_survivability_score,
        ]),
      ),
    )

    const recentReliability = average(
      recentWindow.map((item) =>
        average([
          item.continuity_integrity_score,
          item.stabilization_confidence_score,
          item.recovery_reliability_score,
          item.operational_survivability_score,
        ]),
      ),
    )

    const reliabilityVelocity =
      metrics.length < 2 ? 0 : recentReliability - earlyReliability

    const latestRiskMovement =
      latest && previous
        ? average([
            latest.propagation_risk - previous.propagation_risk,
            latest.trajectory_risk - previous.trajectory_risk,
            latest.structural_memory_risk - previous.structural_memory_risk,
            latest.escalation_pressure_index - previous.escalation_pressure_index,
          ])
        : 0

    const latestReliabilityMovement =
      latest && previous
        ? average([
            latest.continuity_integrity_score - previous.continuity_integrity_score,
            latest.stabilization_confidence_score -
              previous.stabilization_confidence_score,
            latest.recovery_reliability_score - previous.recovery_reliability_score,
            latest.operational_survivability_score -
              previous.operational_survivability_score,
          ])
        : 0

    const volatility = calculateVolatility(
      metrics.map((item) =>
        average([
          item.propagation_risk,
          item.trajectory_risk,
          item.structural_memory_risk,
          item.escalation_pressure_index,
        ]),
      ),
    )

    const instabilityLoad = average([
      averagePropagationRisk,
      averageTrajectoryRisk,
      averageMemoryRisk,
      averageEscalationPressure,
      100 - averageContinuityIntegrity,
      100 - averageStabilizationConfidence,
      100 - averageReliability,
      100 - averageSurvivability,
    ])

    const predictiveRiskScore = clamp(
      instabilityLoad * 0.34 +
        Math.max(riskVelocity, 0) * 0.2 +
        Math.max(-reliabilityVelocity, 0) * 0.2 +
        volatility * 0.16 +
        Math.max(latestRiskMovement, 0) * 0.05 +
        Math.max(-latestReliabilityMovement, 0) * 0.05,
    )

    const predictionState = getPredictionState({
      count: metrics.length,
      predictiveRiskScore,
      riskVelocity,
      reliabilityVelocity,
      volatility,
      latest,
    })

    const forecastHorizon = getForecastHorizon(predictionState)
    const dominantForecastDriver = strongestDriver({
      'Pressure propagation risk': averagePropagationRisk,
      'Trajectory risk': averageTrajectoryRisk,
      'Structural memory risk': averageMemoryRisk,
      'Escalation pressure': averageEscalationPressure,
      'Continuity weakness': 100 - averageContinuityIntegrity,
      'Stabilization weakness': 100 - averageStabilizationConfidence,
      'Recovery reliability weakness': 100 - averageReliability,
      'Survivability weakness': 100 - averageSurvivability,
      'Risk velocity': Math.max(riskVelocity, 0),
      'Reliability decline': Math.max(-reliabilityVelocity, 0),
      Volatility: volatility,
    })

    const executiveSummary = getExecutiveSummary(predictionState)
    const actionCue = getActionCue(predictionState)

    return {
      ordered,
      latest,
      previous,
      averagePropagationRisk,
      averageTrajectoryRisk,
      averageMemoryRisk,
      averageEscalationPressure,
      averageContinuityIntegrity,
      averageStabilizationConfidence,
      averageReliability,
      averageSurvivability,
      earlyRisk,
      recentRisk,
      riskVelocity,
      earlyReliability,
      recentReliability,
      reliabilityVelocity,
      latestRiskMovement,
      latestReliabilityMovement,
      volatility,
      instabilityLoad,
      predictiveRiskScore,
      predictionState,
      forecastHorizon,
      dominantForecastDriver,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

  const latestRows: PanelRow[] = prediction.latest
    ? [
        {
          label: 'Latest Continuity State',
          value: prediction.latest.continuity_state,
        },
        {
          label: 'Latest Pressure State',
          value: prediction.latest.pressure_propagation_state,
        },
        {
          label: 'Latest Trajectory Direction',
          value: prediction.latest.trajectory_direction,
        },
        {
          label: 'Latest Structural Memory State',
          value: prediction.latest.structural_memory_state,
        },
        {
          label: 'Dominant Pressure Source',
          value:
            prediction.latest.dominant_pressure_source ||
            'No pressure source recorded',
        },
        {
          label: 'Dominant Trajectory Signal',
          value:
            prediction.latest.dominant_trajectory_signal ||
            'No trajectory signal recorded',
        },
        {
          label: 'Dominant Memory Pattern',
          value:
            prediction.latest.dominant_memory_pattern ||
            'No memory pattern recorded',
        },
      ]
    : []

  const forecastRows: PanelRow[] = [
    {
      label: 'Forecast Horizon',
      value: prediction.forecastHorizon,
    },
    {
      label: 'Dominant Forecast Driver',
      value: prediction.dominantForecastDriver,
    },
    {
      label: 'Risk Velocity',
      value: formatDelta(prediction.riskVelocity),
    },
    {
      label: 'Reliability Velocity',
      value: formatDelta(prediction.reliabilityVelocity),
    },
    {
      label: 'Latest Risk Movement',
      value: formatDelta(prediction.latestRiskMovement),
    },
    {
      label: 'Latest Reliability Movement',
      value: formatDelta(prediction.latestReliabilityMovement),
    },
    {
      label: 'Volatility',
      value: `${prediction.volatility}/100`,
    },
  ]

  const brief = `
TSINAXA CGI PREDICTIVE INTELLIGENCE BRIEF

Prediction State:
${prediction.predictionState}

Forecast Horizon:
${prediction.forecastHorizon}

Snapshots Reviewed:
${metrics.length}

Predictive Risk Score:
${prediction.predictiveRiskScore}/100

Dominant Forecast Driver:
${prediction.dominantForecastDriver}

Recent Risk Average:
${prediction.recentRisk}/100

Early Risk Average:
${prediction.earlyRisk}/100

Risk Velocity:
${prediction.riskVelocity}

Recent Reliability Average:
${prediction.recentReliability}/100

Early Reliability Average:
${prediction.earlyReliability}/100

Reliability Velocity:
${prediction.reliabilityVelocity}

Volatility:
${prediction.volatility}/100

Instability Load:
${prediction.instabilityLoad}/100

Average Propagation Risk:
${prediction.averagePropagationRisk}/100

Average Trajectory Risk:
${prediction.averageTrajectoryRisk}/100

Average Structural Memory Risk:
${prediction.averageMemoryRisk}/100

Average Escalation Pressure:
${prediction.averageEscalationPressure}/100

Average Continuity Integrity:
${prediction.averageContinuityIntegrity}/100

Average Stabilization Confidence:
${prediction.averageStabilizationConfidence}/100

Average Recovery Reliability:
${prediction.averageReliability}/100

Average Survivability:
${prediction.averageSurvivability}/100

Executive Interpretation:
${prediction.executiveSummary}

Recommended Action:
${prediction.actionCue}

Governance-Safe Meaning:
This predictive view uses persisted CGI operational metric snapshots to forecast whether visible continuity instability is likely to remain controlled, enter watch status, rise toward instability, or approach collapse risk. It does not judge people. It reads system-level historical patterns.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • PREDICTIVE INTELLIGENCE</p>

          <h1 style={styles.title}>Continuity Predictive Intelligence</h1>

          <p style={styles.subtitle}>
            Use persisted CGI operational metric snapshots to forecast whether continuity
            instability is likely to remain controlled, require watch, rise toward
            instability, or approach collapse risk.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.predictiveHero}>
          <div>
            <p style={styles.scoreLabel}>Prediction State</p>
            <h2 style={styles.predictionState}>{prediction.predictionState}</h2>
            <p style={styles.panelNote}>{prediction.executiveSummary}</p>
          </div>

          <div style={styles.scoreGrid}>
            <ScoreMetric
              label="Predictive Risk Score"
              value={prediction.predictiveRiskScore}
            />
            <ScoreMetric
              label="Instability Load"
              value={prediction.instabilityLoad}
            />
            <ScoreMetric label="Risk Velocity" value={prediction.riskVelocity} />
            <ScoreMetric
              label="Reliability Velocity"
              value={prediction.reliabilityVelocity}
            />
            <ScoreMetric label="Volatility" value={prediction.volatility} />
            <ScoreMetric
              label="Recent Risk Average"
              value={prediction.recentRisk}
            />
          </div>

          <div style={styles.actionBox}>
            <strong>Recommended Action:</strong>
            <span>{prediction.actionCue}</span>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Snapshots Reviewed" value={metrics.length} />
          <Metric label="Forecast Horizon" value={prediction.forecastHorizon} />
          <Metric
            label="Dominant Forecast Driver"
            value={prediction.dominantForecastDriver}
          />
          <Metric
            label="Average Propagation Risk"
            value={`${prediction.averagePropagationRisk}/100`}
          />
          <Metric
            label="Average Trajectory Risk"
            value={`${prediction.averageTrajectoryRisk}/100`}
          />
          <Metric
            label="Average Memory Risk"
            value={`${prediction.averageMemoryRisk}/100`}
          />
          <Metric
            label="Average Escalation Pressure"
            value={`${prediction.averageEscalationPressure}/100`}
          />
          <Metric
            label="Average Survivability"
            value={`${prediction.averageSurvivability}/100`}
          />
        </section>

        <section style={styles.layoutGrid}>
          <Panel
            title="Latest Persisted State"
            note="Most recent saved operational intelligence snapshot."
            rows={latestRows}
          />

          <Panel
            title="Forecast Drivers"
            note="Signals used to interpret near-term continuity risk."
            rows={forecastRows}
          />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Recent Predictive Snapshot Trail</h2>

          <p style={styles.panelNote}>
            Latest saved rows from <code>cgi_operational_metrics</code>. These are
            historical predictive inputs, not live recalculations.
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
                  <th style={styles.th}>Risk</th>
                  <th style={styles.th}>Reliability</th>
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
                    <td style={styles.td}>
                      {average([
                        item.propagation_risk,
                        item.trajectory_risk,
                        item.structural_memory_risk,
                        item.escalation_pressure_index,
                      ])}
                      /100
                    </td>
                    <td style={styles.td}>{item.recovery_reliability_score}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={loadPredictiveMetrics} style={styles.primaryButton}>
            Refresh Predictive Metrics
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Generated Predictive Brief</h2>
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

function getPredictionState(input: {
  count: number
  predictiveRiskScore: number
  riskVelocity: number
  reliabilityVelocity: number
  volatility: number
  latest: CgiOperationalMetric | null
}): PredictionState {
  if (input.count < 3) return 'INSUFFICIENT_HISTORY'

  if (
    input.predictiveRiskScore >= 75 ||
    input.riskVelocity >= 18 ||
    input.reliabilityVelocity <= -18 ||
    input.latest?.continuity_state === 'UNSTABLE'
  ) {
    return 'HIGH_COLLAPSE_RISK'
  }

  if (
    input.predictiveRiskScore >= 55 ||
    input.riskVelocity >= 10 ||
    input.reliabilityVelocity <= -10 ||
    input.volatility >= 28
  ) {
    return 'RISING_INSTABILITY'
  }

  if (
    input.predictiveRiskScore >= 35 ||
    input.riskVelocity >= 5 ||
    input.reliabilityVelocity <= -5 ||
    input.volatility >= 18
  ) {
    return 'WATCH_RISK'
  }

  return 'LOW_NEAR_TERM_RISK'
}

function getForecastHorizon(state: PredictionState) {
  if (state === 'INSUFFICIENT_HISTORY') return 'More snapshots required'
  if (state === 'HIGH_COLLAPSE_RISK') return 'Immediate command review'
  if (state === 'RISING_INSTABILITY') return 'Near-term risk window'
  if (state === 'WATCH_RISK') return 'Watch window'
  return 'Routine monitoring window'
}

function getExecutiveSummary(state: PredictionState) {
  if (state === 'INSUFFICIENT_HISTORY') {
    return 'There are not enough persisted snapshots yet to make a reliable predictive judgment. Continue saving operational snapshots across meaningful operating periods.'
  }

  if (state === 'HIGH_COLLAPSE_RISK') {
    return 'Predictive intelligence shows high collapse risk. Risk velocity, reliability decline, or unstable continuity signals suggest command review should happen immediately.'
  }

  if (state === 'RISING_INSTABILITY') {
    return 'Predictive intelligence shows rising instability. Risk is increasing faster than stabilization confidence or reliability is improving.'
  }

  if (state === 'WATCH_RISK') {
    return 'Predictive intelligence shows watch-level risk. The system is not collapsing, but instability signals need closer monitoring.'
  }

  return 'Predictive intelligence shows low near-term risk. Current persisted snapshots do not show major rising instability.'
}

function getActionCue(state: PredictionState) {
  if (state === 'INSUFFICIENT_HISTORY') {
    return 'Save more operational snapshots before relying on forecast signals.'
  }

  if (state === 'HIGH_COLLAPSE_RISK') {
    return 'Activate command review, inspect risk velocity, and prioritize pressure, trajectory, structural memory, and reliability weak points.'
  }

  if (state === 'RISING_INSTABILITY') {
    return 'Review rising risk drivers and intervene before instability becomes operational collapse.'
  }

  if (state === 'WATCH_RISK') {
    return 'Increase monitoring frequency and compare upcoming snapshots against current risk velocity.'
  }

  return 'Maintain routine monitoring and continue saving snapshots to detect early movement.'
}

function strongestDriver(scores: Record<string, number>) {
  return (
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No dominant forecast driver detected'
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
  predictiveHero: {
    background: '#020617',
    border: '1px solid #f97316',
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
  predictionState: {
    fontSize: 'clamp(36px, 7vw, 68px)',
    margin: '8px 0 20px',
    color: '#fdba74',
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
    background: '#431407',
    border: '1px solid #f97316',
    borderRadius: '18px',
    padding: '18px',
    marginTop: '16px',
    color: '#ffedd5',
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