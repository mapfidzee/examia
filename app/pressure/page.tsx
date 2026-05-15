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

  escalation_pressure_index: number
  propagation_risk: number
  routing_friction: number
  responder_pressure: number
  escalation_velocity: number
  coordination_instability: number
  stabilization_drag: number

  recovery_reliability_score: number
  operational_survivability_score: number
  continuity_integrity_score: number
  stabilization_confidence_score: number

  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
  executive_summary: string | null
  action_cue: string | null
}

type PressureState =
  | 'INSUFFICIENT_HISTORY'
  | 'PRESSURE_CONTAINED'
  | 'PRESSURE_BUILDING'
  | 'PRESSURE_SPREADING'
  | 'PRESSURE_CRITICAL'

type PanelRow = {
  label: string
  value: string
}

const SAMPLE_LIMIT = 120

export default function PressurePage() {
  return (
    <CGIGovernanceShell>
      <PressureContent />
    </CGIGovernanceShell>
  )
}

function PressureContent() {
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPressureMetrics()
  }, [])

  async function loadPressureMetrics() {
    setMessage('Loading persisted CGI pressure metrics...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Failed to load persisted CGI pressure metrics.')
      return
    }

    setMetrics(data || [])
    setMessage('Persisted CGI pressure metrics loaded.')
  }

  const pressure = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

    const latest = ordered[ordered.length - 1] || null
    const previous = ordered[ordered.length - 2] || null

    const earlyWindow = ordered.slice(0, 5)
    const recentWindow = ordered.slice(-5)

    const averageEscalationPressure = average(
      metrics.map((item) => item.escalation_pressure_index),
    )

    const averagePropagationRisk = average(
      metrics.map((item) => item.propagation_risk),
    )

    const averageRoutingFriction = average(
      metrics.map((item) => item.routing_friction),
    )

    const averageResponderPressure = average(
      metrics.map((item) => item.responder_pressure),
    )

    const averageEscalationVelocity = average(
      metrics.map((item) => item.escalation_velocity),
    )

    const averageCoordinationInstability = average(
      metrics.map((item) => item.coordination_instability),
    )

    const averageStabilizationDrag = average(
      metrics.map((item) => item.stabilization_drag),
    )

    const averageRecoveryReliability = average(
      metrics.map((item) => item.recovery_reliability_score),
    )

    const averageSurvivability = average(
      metrics.map((item) => item.operational_survivability_score),
    )

    const pressureLoad = average([
      averageEscalationPressure,
      averagePropagationRisk,
      averageRoutingFriction,
      averageResponderPressure,
      averageEscalationVelocity,
      averageCoordinationInstability,
      averageStabilizationDrag,
    ])

    const earlyPressure = average(
      earlyWindow.map((item) =>
        average([
          item.escalation_pressure_index,
          item.propagation_risk,
          item.routing_friction,
          item.responder_pressure,
          item.escalation_velocity,
          item.coordination_instability,
          item.stabilization_drag,
        ]),
      ),
    )

    const recentPressure = average(
      recentWindow.map((item) =>
        average([
          item.escalation_pressure_index,
          item.propagation_risk,
          item.routing_friction,
          item.responder_pressure,
          item.escalation_velocity,
          item.coordination_instability,
          item.stabilization_drag,
        ]),
      ),
    )

    const pressureVelocity =
      metrics.length < 2 ? 0 : Math.round(recentPressure - earlyPressure)

    const latestPressureMovement =
      latest && previous
        ? average([
            latest.escalation_pressure_index - previous.escalation_pressure_index,
            latest.propagation_risk - previous.propagation_risk,
            latest.routing_friction - previous.routing_friction,
            latest.responder_pressure - previous.responder_pressure,
            latest.escalation_velocity - previous.escalation_velocity,
            latest.coordination_instability - previous.coordination_instability,
            latest.stabilization_drag - previous.stabilization_drag,
          ])
        : 0

    const pressureVolatility = calculateVolatility(
      metrics.map((item) =>
        average([
          item.escalation_pressure_index,
          item.propagation_risk,
          item.routing_friction,
          item.responder_pressure,
          item.escalation_velocity,
          item.coordination_instability,
          item.stabilization_drag,
        ]),
      ),
    )

    const pressureContainmentScore = clamp(
      averageRecoveryReliability * 0.35 +
        averageSurvivability * 0.35 +
        (100 - pressureLoad) * 0.3,
    )

    const pressureConcentrationScore = strongestScore({
      'Escalation pressure': averageEscalationPressure,
      'Propagation risk': averagePropagationRisk,
      'Routing friction': averageRoutingFriction,
      'Responder pressure': averageResponderPressure,
      'Escalation velocity': averageEscalationVelocity,
      'Coordination instability': averageCoordinationInstability,
      'Stabilization drag': averageStabilizationDrag,
    }).score

    const pressureSpreadScore = clamp(
      average([
        averagePropagationRisk,
        averageCoordinationInstability,
        averageEscalationVelocity,
        averageStabilizationDrag,
      ]),
    )

    const pressureState = getPressureState({
      count: metrics.length,
      pressureLoad,
      pressureVelocity,
      pressureVolatility,
      pressureContainmentScore,
      latest,
    })

    const dominantPressureDriver = strongestScore({
      'Escalation pressure': averageEscalationPressure,
      'Propagation risk': averagePropagationRisk,
      'Routing friction': averageRoutingFriction,
      'Responder pressure': averageResponderPressure,
      'Escalation velocity': averageEscalationVelocity,
      'Coordination instability': averageCoordinationInstability,
      'Stabilization drag': averageStabilizationDrag,
    }).label

    const executiveSummary = getExecutiveSummary(pressureState)
    const actionCue = getActionCue(pressureState)

    return {
      ordered,
      latest,
      previous,
      averageEscalationPressure,
      averagePropagationRisk,
      averageRoutingFriction,
      averageResponderPressure,
      averageEscalationVelocity,
      averageCoordinationInstability,
      averageStabilizationDrag,
      averageRecoveryReliability,
      averageSurvivability,
      pressureLoad,
      earlyPressure,
      recentPressure,
      pressureVelocity,
      latestPressureMovement,
      pressureVolatility,
      pressureContainmentScore,
      pressureConcentrationScore,
      pressureSpreadScore,
      pressureState,
      dominantPressureDriver,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

  const latestRows: PanelRow[] = pressure.latest
    ? [
        {
          label: 'Latest Continuity State',
          value: pressure.latest.continuity_state,
        },
        {
          label: 'Latest Pressure State',
          value: pressure.latest.pressure_propagation_state,
        },
        {
          label: 'Latest Trajectory Direction',
          value: pressure.latest.trajectory_direction,
        },
        {
          label: 'Latest Structural Memory State',
          value: pressure.latest.structural_memory_state,
        },
        {
          label: 'Dominant Saved Pressure Source',
          value:
            pressure.latest.dominant_pressure_source ||
            'No pressure source recorded',
        },
      ]
    : []

  const pressureRows: PanelRow[] = [
    {
      label: 'Dominant Pressure Driver',
      value: pressure.dominantPressureDriver,
    },
    {
      label: 'Pressure Velocity',
      value: formatDelta(pressure.pressureVelocity),
    },
    {
      label: 'Latest Pressure Movement',
      value: formatDelta(pressure.latestPressureMovement),
    },
    {
      label: 'Pressure Volatility',
      value: `${pressure.pressureVolatility}/100`,
    },
    {
      label: 'Pressure Spread Score',
      value: `${pressure.pressureSpreadScore}/100`,
    },
    {
      label: 'Pressure Containment Score',
      value: `${pressure.pressureContainmentScore}/100`,
    },
  ]

  const brief = `
TSINAXA CGI PRESSURE INTELLIGENCE BRIEF

Pressure State:
${pressure.pressureState}

Snapshots Reviewed:
${metrics.length}

Dominant Pressure Driver:
${pressure.dominantPressureDriver}

Pressure Load:
${pressure.pressureLoad}/100

Pressure Velocity:
${pressure.pressureVelocity}

Latest Pressure Movement:
${pressure.latestPressureMovement}

Pressure Volatility:
${pressure.pressureVolatility}/100

Pressure Spread Score:
${pressure.pressureSpreadScore}/100

Pressure Concentration Score:
${pressure.pressureConcentrationScore}/100

Pressure Containment Score:
${pressure.pressureContainmentScore}/100

Average Escalation Pressure:
${pressure.averageEscalationPressure}/100

Average Propagation Risk:
${pressure.averagePropagationRisk}/100

Average Routing Friction:
${pressure.averageRoutingFriction}/100

Average Responder Pressure:
${pressure.averageResponderPressure}/100

Average Escalation Velocity:
${pressure.averageEscalationVelocity}/100

Average Coordination Instability:
${pressure.averageCoordinationInstability}/100

Average Stabilization Drag:
${pressure.averageStabilizationDrag}/100

Average Recovery Reliability:
${pressure.averageRecoveryReliability}/100

Average Operational Survivability:
${pressure.averageSurvivability}/100

Executive Interpretation:
${pressure.executiveSummary}

Recommended Action:
${pressure.actionCue}

Governance-Safe Meaning:
This pressure view uses persisted CGI operational metric snapshots. It does not judge people. It evaluates whether pressure is contained, building, spreading, or becoming critical across routing, responders, escalation, coordination, and stabilization drag.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • PRESSURE INTELLIGENCE</p>

          <h1 style={styles.title}>Continuity Pressure Intelligence</h1>

          <p style={styles.subtitle}>
            Use persisted CGI operational metric snapshots to identify where operational
            pressure is concentrating, spreading, accelerating, or remaining contained.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.pressureHero}>
          <div>
            <p style={styles.scoreLabel}>Pressure State</p>
            <h2 style={styles.pressureState}>{pressure.pressureState}</h2>
            <p style={styles.panelNote}>{pressure.executiveSummary}</p>
          </div>

          <div style={styles.scoreGrid}>
            <ScoreMetric label="Pressure Load" value={pressure.pressureLoad} />
            <ScoreMetric
              label="Pressure Spread"
              value={pressure.pressureSpreadScore}
            />
            <ScoreMetric
              label="Pressure Concentration"
              value={pressure.pressureConcentrationScore}
            />
            <ScoreMetric
              label="Pressure Containment"
              value={pressure.pressureContainmentScore}
            />
            <ScoreMetric
              label="Pressure Volatility"
              value={pressure.pressureVolatility}
            />
            <ScoreMetric
              label="Recent Pressure"
              value={pressure.recentPressure}
            />
          </div>

          <div style={styles.actionBox}>
            <strong>Recommended Action:</strong>
            <span>{pressure.actionCue}</span>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Snapshots Reviewed" value={metrics.length} />
          <Metric label="Dominant Driver" value={pressure.dominantPressureDriver} />
          <Metric label="Pressure Velocity" value={formatDelta(pressure.pressureVelocity)} />
          <Metric
            label="Latest Movement"
            value={formatDelta(pressure.latestPressureMovement)}
          />
          <Metric
            label="Escalation Pressure Avg"
            value={`${pressure.averageEscalationPressure}/100`}
          />
          <Metric
            label="Propagation Risk Avg"
            value={`${pressure.averagePropagationRisk}/100`}
          />
          <Metric
            label="Routing Friction Avg"
            value={`${pressure.averageRoutingFriction}/100`}
          />
          <Metric
            label="Responder Pressure Avg"
            value={`${pressure.averageResponderPressure}/100`}
          />
        </section>

        <section style={styles.metricsGrid}>
          <Metric
            label="Escalation Velocity Avg"
            value={`${pressure.averageEscalationVelocity}/100`}
          />
          <Metric
            label="Coordination Instability Avg"
            value={`${pressure.averageCoordinationInstability}/100`}
          />
          <Metric
            label="Stabilization Drag Avg"
            value={`${pressure.averageStabilizationDrag}/100`}
          />
          <Metric
            label="Recovery Reliability Avg"
            value={`${pressure.averageRecoveryReliability}/100`}
          />
          <Metric
            label="Survivability Avg"
            value={`${pressure.averageSurvivability}/100`}
          />
        </section>

        <section style={styles.layoutGrid}>
          <Panel
            title="Latest Persisted Pressure State"
            note="Most recent saved operational pressure snapshot."
            rows={latestRows}
          />

          <Panel
            title="Pressure Concentration Reading"
            note="Summarizes dominant pressure, spread, velocity, volatility, and containment."
            rows={pressureRows}
          />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Recent Pressure Snapshot Trail</h2>

          <p style={styles.panelNote}>
            Latest saved rows from <code>cgi_operational_metrics</code>. These are
            historical pressure records, not live recalculations.
          </p>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Scope</th>
                  <th style={styles.th}>Pressure State</th>
                  <th style={styles.th}>Escalation</th>
                  <th style={styles.th}>Propagation</th>
                  <th style={styles.th}>Routing</th>
                  <th style={styles.th}>Responder</th>
                  <th style={styles.th}>Drag</th>
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
                    <td style={styles.td}>{item.pressure_propagation_state}</td>
                    <td style={styles.td}>{item.escalation_pressure_index}/100</td>
                    <td style={styles.td}>{item.propagation_risk}/100</td>
                    <td style={styles.td}>{item.routing_friction}/100</td>
                    <td style={styles.td}>{item.responder_pressure}/100</td>
                    <td style={styles.td}>{item.stabilization_drag}/100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={loadPressureMetrics} style={styles.primaryButton}>
            Refresh Pressure Metrics
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Generated Pressure Brief</h2>
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

function strongestScore(scores: Record<string, number>) {
  return (
    Object.entries(scores)
      .map(([label, score]) => ({ label, score }))
      .sort((a, b) => b.score - a.score)[0] || {
      label: 'No dominant pressure driver detected',
      score: 0,
    }
  )
}

function getPressureState(input: {
  count: number
  pressureLoad: number
  pressureVelocity: number
  pressureVolatility: number
  pressureContainmentScore: number
  latest: CgiOperationalMetric | null
}): PressureState {
  if (input.count < 3) return 'INSUFFICIENT_HISTORY'

  if (
    input.pressureLoad >= 75 ||
    input.pressureVelocity >= 18 ||
    input.pressureVolatility >= 35 ||
    input.pressureContainmentScore < 35 ||
    input.latest?.pressure_propagation_state === 'CASCADE_RISK'
  ) {
    return 'PRESSURE_CRITICAL'
  }

  if (
    input.pressureLoad >= 55 ||
    input.pressureVelocity >= 10 ||
    input.pressureVolatility >= 25 ||
    input.latest?.pressure_propagation_state === 'SPREADING'
  ) {
    return 'PRESSURE_SPREADING'
  }

  if (
    input.pressureLoad >= 35 ||
    input.pressureVelocity >= 5 ||
    input.pressureVolatility >= 18 ||
    input.latest?.pressure_propagation_state === 'BUILDING'
  ) {
    return 'PRESSURE_BUILDING'
  }

  return 'PRESSURE_CONTAINED'
}

function getExecutiveSummary(state: PressureState) {
  if (state === 'INSUFFICIENT_HISTORY') {
    return 'There are not enough persisted snapshots yet to judge pressure behavior over time. Continue saving operational snapshots.'
  }

  if (state === 'PRESSURE_CRITICAL') {
    return 'Pressure intelligence shows critical pressure. Escalation, spread, volatility, or weak containment may be threatening stabilization.'
  }

  if (state === 'PRESSURE_SPREADING') {
    return 'Pressure intelligence shows spreading pressure. Operational strain appears to be moving across pathways instead of staying contained.'
  }

  if (state === 'PRESSURE_BUILDING') {
    return 'Pressure intelligence shows building pressure. The system is not yet critical, but pressure signals need closer monitoring.'
  }

  return 'Pressure intelligence shows contained pressure. Current persisted snapshots do not show major spread or critical concentration.'
}

function getActionCue(state: PressureState) {
  if (state === 'INSUFFICIENT_HISTORY') {
    return 'Save more operational snapshots before relying on pressure trend interpretation.'
  }

  if (state === 'PRESSURE_CRITICAL') {
    return 'Activate command pressure review and inspect escalation, propagation, routing friction, responder pressure, coordination instability, and stabilization drag immediately.'
  }

  if (state === 'PRESSURE_SPREADING') {
    return 'Review where pressure is spreading and rebalance routing, response ownership, and stabilization support before pressure becomes critical.'
  }

  if (state === 'PRESSURE_BUILDING') {
    return 'Increase monitoring frequency and compare upcoming snapshots against current pressure velocity and concentration.'
  }

  return 'Maintain routine monitoring and continue saving snapshots to detect early pressure movement.'
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
  pressureHero: {
    background: '#020617',
    border: '1px solid #fbbf24',
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
  pressureState: {
    fontSize: 'clamp(36px, 7vw, 68px)',
    margin: '8px 0 20px',
    color: '#fbbf24',
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
    background: '#422006',
    border: '1px solid #fbbf24',
    borderRadius: '18px',
    padding: '18px',
    marginTop: '16px',
    color: '#fef3c7',
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