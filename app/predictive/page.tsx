'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type CgiOperationalMetric = {
  id: string
  created_at: string
  scope: string

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

  continuity_drift: number
  escalation_momentum: number
  recovery_direction: number
  stabilization_trend: number
  unresolved_momentum: number

  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
}

type PredictionState =
  | 'INSUFFICIENT_HISTORY'
  | 'LOW_NEAR_TERM_RISK'
  | 'WATCH_RISK'
  | 'RISING_INSTABILITY'
  | 'HIGH_COLLAPSE_RISK'

type Interpretation = {
  posture: string
  meaning: string
  action: string
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
    setMessage('Loading predictive intelligence...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Predictive intelligence could not be loaded.')
      return
    }

    setMetrics(data || [])
    setMessage('Predictive intelligence loaded.')
  }

  const intelligence = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    const latest = ordered[ordered.length - 1] || null
    const previous = ordered[ordered.length - 2] || null

    const earlyWindow = ordered.slice(0, 5)
    const recentWindow = ordered.slice(-5)

    const propagationRisk = average(ordered.map((item) => item.propagation_risk))
    const trajectoryRisk = average(ordered.map((item) => item.trajectory_risk))
    const memoryRisk = average(ordered.map((item) => item.structural_memory_risk))
    const escalationPressure = average(
      ordered.map((item) => item.escalation_pressure_index)
    )

    const continuityIntegrity = average(
      ordered.map((item) => item.continuity_integrity_score)
    )

    const stabilizationConfidence = average(
      ordered.map((item) => item.stabilization_confidence_score)
    )

    const recoveryReliability = average(
      ordered.map((item) => item.recovery_reliability_score)
    )

    const survivability = average(
      ordered.map((item) => item.operational_survivability_score)
    )

    const earlyRisk = average(
      earlyWindow.map((item) =>
        average([
          item.propagation_risk,
          item.trajectory_risk,
          item.structural_memory_risk,
          item.escalation_pressure_index,
        ])
      )
    )

    const recentRisk = average(
      recentWindow.map((item) =>
        average([
          item.propagation_risk,
          item.trajectory_risk,
          item.structural_memory_risk,
          item.escalation_pressure_index,
        ])
      )
    )

    const riskVelocity = ordered.length < 2 ? 0 : recentRisk - earlyRisk

    const earlyReliability = average(
      earlyWindow.map((item) =>
        average([
          item.continuity_integrity_score,
          item.stabilization_confidence_score,
          item.recovery_reliability_score,
          item.operational_survivability_score,
        ])
      )
    )

    const recentReliability = average(
      recentWindow.map((item) =>
        average([
          item.continuity_integrity_score,
          item.stabilization_confidence_score,
          item.recovery_reliability_score,
          item.operational_survivability_score,
        ])
      )
    )

    const reliabilityVelocity =
      ordered.length < 2 ? 0 : recentReliability - earlyReliability

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
      ordered.map((item) =>
        average([
          item.propagation_risk,
          item.trajectory_risk,
          item.structural_memory_risk,
          item.escalation_pressure_index,
        ])
      )
    )

    const instabilityLoad = average([
      propagationRisk,
      trajectoryRisk,
      memoryRisk,
      escalationPressure,
      100 - continuityIntegrity,
      100 - stabilizationConfidence,
      100 - recoveryReliability,
      100 - survivability,
    ])

    const predictiveRiskScore = clamp(
      instabilityLoad * 0.34 +
        Math.max(riskVelocity, 0) * 0.2 +
        Math.max(-reliabilityVelocity, 0) * 0.2 +
        volatility * 0.16 +
        Math.max(latestRiskMovement, 0) * 0.05 +
        Math.max(-latestReliabilityMovement, 0) * 0.05
    )

    const state = getPredictionState({
      count: ordered.length,
      predictiveRiskScore,
      riskVelocity,
      reliabilityVelocity,
      volatility,
      latest,
    })

    const predictionPosture = interpretPredictionState(state)
    const forecastHorizon = interpretForecastHorizon(state)
    const pressureForecast = interpretPressureForecast(escalationPressure)
    const trajectoryForecast = interpretTrajectoryForecast(trajectoryRisk)
    const memoryForecast = interpretMemoryForecast(memoryRisk)
    const riskMovement = interpretRiskMovement(riskVelocity)
    const reliabilityMovement = interpretReliabilityMovement(reliabilityVelocity)
    const volatilityMeaning = interpretVolatility(volatility)
    const survivabilityForecast = interpretSurvivability(survivability)
    const historyDepth = interpretHistory(ordered.length)

    const dominantDriver = strongestDriver({
      'Pressure propagation risk': propagationRisk,
      'Trajectory risk': trajectoryRisk,
      'Structural memory risk': memoryRisk,
      'Escalation pressure': escalationPressure,
      'Continuity weakness': 100 - continuityIntegrity,
      'Stabilization weakness': 100 - stabilizationConfidence,
      'Recovery reliability weakness': 100 - recoveryReliability,
      'Survivability weakness': 100 - survivability,
      'Risk velocity': Math.max(riskVelocity, 0),
      'Reliability decline': Math.max(-reliabilityVelocity, 0),
      Volatility: volatility,
    })

    const executiveSummary = `${predictionPosture.meaning} Dominant forecast driver: ${dominantDriver}. ${riskMovement.meaning} ${reliabilityMovement.meaning}`

    const actionCue = compactAction([
      predictionPosture.action,
      forecastHorizon.action,
      pressureForecast.action,
      reliabilityMovement.action,
    ])

    return {
      latest,
      predictionPosture,
      forecastHorizon,
      pressureForecast,
      trajectoryForecast,
      memoryForecast,
      riskMovement,
      reliabilityMovement,
      volatilityMeaning,
      survivabilityForecast,
      historyDepth,
      dominantDriver,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

  const brief = `
TSINAXA CGI PREDICTIVE INTELLIGENCE BRIEF

Prediction Posture:
${intelligence.predictionPosture.posture}

Forecast Horizon:
${intelligence.forecastHorizon.posture}

Pressure Forecast:
${intelligence.pressureForecast.posture}

Trajectory Forecast:
${intelligence.trajectoryForecast.posture}

Structural Memory Forecast:
${intelligence.memoryForecast.posture}

Risk Movement:
${intelligence.riskMovement.posture}

Reliability Movement:
${intelligence.reliabilityMovement.posture}

Volatility:
${intelligence.volatilityMeaning.posture}

Survivability Forecast:
${intelligence.survivabilityForecast.posture}

Dominant Forecast Driver:
${intelligence.dominantDriver}

Executive Interpretation:
${intelligence.executiveSummary}

Recommended Action:
${intelligence.actionCue}

Governance-Safe Meaning:
This predictive view interprets persisted continuity memory. It does not judge people. It forecasts system-level instability posture, deterioration risk, and executive action urgency.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • PREDICTIVE INTELLIGENCE</p>

          <h1 style={styles.title}>Continuity Predictive Intelligence</h1>

          <p style={styles.subtitle}>
            Executive foresight into whether continuity instability is contained,
            entering watch status, rising, or approaching collapse risk.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Prediction Posture</p>

            <h2 style={styles.heroPosture}>
              {intelligence.predictionPosture.posture}
            </h2>

            <p style={styles.heroMeaning}>{intelligence.executiveSummary}</p>
          </div>

          <div style={styles.actionBox}>
            <p style={styles.actionLabel}>Recommended Action</p>
            <p style={styles.actionText}>{intelligence.actionCue}</p>
          </div>
        </section>

        <section style={styles.postureGrid}>
          <PostureCard title="Forecast Horizon" interpretation={intelligence.forecastHorizon} />
          <PostureCard title="Pressure Forecast" interpretation={intelligence.pressureForecast} />
          <PostureCard title="Trajectory Forecast" interpretation={intelligence.trajectoryForecast} />
          <PostureCard title="Structural Memory" interpretation={intelligence.memoryForecast} />
          <PostureCard title="Risk Movement" interpretation={intelligence.riskMovement} />
          <PostureCard title="Reliability Movement" interpretation={intelligence.reliabilityMovement} />
        </section>

        <section style={styles.compactGrid}>
          <CompactCard title="History Depth" value={intelligence.historyDepth.posture} />
          <CompactCard title="Dominant Forecast Driver" value={intelligence.dominantDriver} />
          <CompactCard title="Volatility" value={intelligence.volatilityMeaning.posture} />
          <CompactCard title="Survivability Forecast" value={intelligence.survivabilityForecast.posture} />
        </section>

        <section style={styles.twoColumn}>
          <Panel title="Latest Predictive Context">
            <Info label="Continuity State" value={intelligence.latest?.continuity_state || 'Not recorded'} />
            <Info label="Pressure State" value={intelligence.latest?.pressure_propagation_state || 'Not recorded'} />
            <Info label="Trajectory Direction" value={intelligence.latest?.trajectory_direction || 'Not recorded'} />
            <Info label="Structural Memory" value={intelligence.latest?.structural_memory_state || 'Not recorded'} />
            <Info label="Dominant Pressure" value={intelligence.latest?.dominant_pressure_source || 'Not recorded'} />
          </Panel>

          <Panel title="Forecast Reading">
            <Info label="Prediction Posture" value={intelligence.predictionPosture.posture} />
            <Info label="Forecast Horizon" value={intelligence.forecastHorizon.posture} />
            <Info label="Dominant Driver" value={intelligence.dominantDriver} />
            <Info label="Risk Movement" value={intelligence.riskMovement.posture} />
            <Info label="Reliability Movement" value={intelligence.reliabilityMovement.posture} />
          </Panel>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Recent Predictive Memory Trail</h2>
              <p style={styles.cardNote}>
                Recent snapshots are displayed as threshold forecasts, not raw risk scores.
              </p>
            </div>

            <button onClick={loadPredictiveMetrics} style={styles.primaryButton}>
              Refresh
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Continuity</th>
                  <th style={styles.th}>Pressure</th>
                  <th style={styles.th}>Trajectory</th>
                  <th style={styles.th}>Memory</th>
                  <th style={styles.th}>Forecast</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No persisted predictive memory found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 8).map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{formatDate(item.created_at)}</td>
                    <td style={styles.td}>{item.continuity_state}</td>
                    <td style={styles.td}>
                      {interpretPressureForecast(item.escalation_pressure_index).posture}
                    </td>
                    <td style={styles.td}>
                      {interpretTrajectoryForecast(item.trajectory_risk).posture}
                    </td>
                    <td style={styles.td}>
                      {interpretMemoryForecast(item.structural_memory_risk).posture}
                    </td>
                    <td style={styles.td}>
                      {interpretSurvivability(item.operational_survivability_score).posture}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Generated Predictive Brief</h2>
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
    'No dominant forecast driver detected'
  )
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

function interpretPredictionState(state: PredictionState): Interpretation {
  if (state === 'INSUFFICIENT_HISTORY') {
    return {
      posture: 'INSUFFICIENT HISTORY',
      meaning: 'Predictive memory is not yet deep enough to forecast instability.',
      action: 'Continue saving operational snapshots before relying on forecast posture.',
    }
  }

  if (state === 'HIGH_COLLAPSE_RISK') {
    return {
      posture: 'HIGH COLLAPSE RISK',
      meaning:
        'Forecast signals suggest instability may exceed containment if command review does not occur.',
      action: 'Activate command review and inspect pressure, trajectory, memory, and reliability weak points.',
    }
  }

  if (state === 'RISING_INSTABILITY') {
    return {
      posture: 'RISING INSTABILITY',
      meaning:
        'Risk is increasing faster than stabilization confidence or reliability is improving.',
      action: 'Review rising drivers and intervene before instability becomes collapse risk.',
    }
  }

  if (state === 'WATCH_RISK') {
    return {
      posture: 'WATCH RISK',
      meaning:
        'The system is not collapsing, but instability signals require closer monitoring.',
      action: 'Increase monitoring frequency and compare upcoming snapshots.',
    }
  }

  return {
    posture: 'LOW NEAR-TERM RISK',
    meaning:
      'Persisted memory does not currently show major rising instability.',
    action: 'Maintain routine monitoring and continue saving snapshots.',
  }
}

function interpretForecastHorizon(state: PredictionState): Interpretation {
  if (state === 'HIGH_COLLAPSE_RISK') {
    return {
      posture: 'IMMEDIATE COMMAND WINDOW',
      meaning: 'Forecast posture requires immediate command visibility.',
      action: 'Do not wait for another cycle before review.',
    }
  }

  if (state === 'RISING_INSTABILITY') {
    return {
      posture: 'NEAR-TERM RISK WINDOW',
      meaning: 'Instability is rising within the current operating horizon.',
      action: 'Review pressure and trajectory before the next cycle.',
    }
  }

  if (state === 'WATCH_RISK') {
    return {
      posture: 'WATCH WINDOW',
      meaning: 'Instability signals should remain visible under closer monitoring.',
      action: 'Compare upcoming snapshots against current posture.',
    }
  }

  if (state === 'INSUFFICIENT_HISTORY') {
    return {
      posture: 'MORE MEMORY REQUIRED',
      meaning: 'Forecast horizon cannot be trusted with limited history.',
      action: 'Build predictive memory.',
    }
  }

  return {
    posture: 'ROUTINE MONITORING WINDOW',
    meaning: 'Current forecast posture supports routine monitoring.',
    action: 'Maintain snapshot discipline.',
  }
}

function interpretPressureForecast(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'PRESSURE ESCALATING',
      meaning: 'Pressure is high enough to threaten continuity containment.',
      action: 'Escalate pressure review.',
    }
  }

  if (value >= 50) {
    return {
      posture: 'PRESSURE UNDER WATCH',
      meaning: 'Pressure remains visible and may shape near-term instability.',
      action: 'Keep pressure visible.',
    }
  }

  if (value >= 35) {
    return {
      posture: 'PRESSURE MONITORED',
      meaning: 'Pressure exists but is not dominant.',
      action: 'Continue monitoring.',
    }
  }

  return {
    posture: 'PRESSURE CONTAINED',
    meaning: 'Pressure appears contained in the reviewed memory.',
    action: 'Maintain monitoring.',
  }
}

function interpretTrajectoryForecast(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'TRAJECTORY DETERIORATING',
      meaning: 'Trajectory risk suggests the system may be moving toward instability.',
      action: 'Review trajectory immediately.',
    }
  }

  if (value >= 50) {
    return {
      posture: 'TRAJECTORY UNDER WATCH',
      meaning: 'Trajectory requires closer review before deterioration becomes visible.',
      action: 'Keep trajectory under governance watch.',
    }
  }

  return {
    posture: 'TRAJECTORY CONTAINED',
    meaning: 'Trajectory risk is currently contained.',
    action: 'Maintain directional monitoring.',
  }
}

function interpretMemoryForecast(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'MEMORY RISK HIGH',
      meaning: 'Recurring instability patterns are strong enough to threaten survivability.',
      action: 'Review recurrence patterns.',
    }
  }

  if (value >= 50) {
    return {
      posture: 'MEMORY RISK UNDER WATCH',
      meaning: 'Structural memory patterns remain visible.',
      action: 'Keep recurrence visible.',
    }
  }

  return {
    posture: 'MEMORY RISK CONTAINED',
    meaning: 'Structural memory risk appears contained.',
    action: 'Maintain continuity memory.',
  }
}

function interpretRiskMovement(value: number): Interpretation {
  if (value >= 10) {
    return {
      posture: 'RISK RISING',
      meaning: 'Risk is increasing across the reviewed memory window.',
      action: 'Review forecast drivers.',
    }
  }

  if (value <= -10) {
    return {
      posture: 'RISK EASING',
      meaning: 'Risk movement is easing across the reviewed memory window.',
      action: 'Maintain monitoring.',
    }
  }

  return {
    posture: 'RISK HOLDING',
    meaning: 'Risk is neither clearly rising nor clearly easing.',
    action: 'Continue comparison across future snapshots.',
  }
}

function interpretReliabilityMovement(value: number): Interpretation {
  if (value >= 10) {
    return {
      posture: 'RELIABILITY IMPROVING',
      meaning: 'Reliability is improving against forecast risk.',
      action: 'Protect recovery discipline.',
    }
  }

  if (value <= -10) {
    return {
      posture: 'RELIABILITY WEAKENING',
      meaning: 'Reliability is weakening while predictive risk remains visible.',
      action: 'Review reliability deterioration.',
    }
  }

  return {
    posture: 'RELIABILITY HOLDING',
    meaning: 'Reliability movement is currently holding.',
    action: 'Maintain monitoring.',
  }
}

function interpretVolatility(value: number): Interpretation {
  if (value >= 30) {
    return {
      posture: 'FORECAST VOLATILE',
      meaning: 'Predictive signals are fluctuating enough to weaken forecast confidence.',
      action: 'Extend the observation window.',
    }
  }

  if (value >= 18) {
    return {
      posture: 'VARIATION CONTAINED',
      meaning: 'Some forecast variation exists, but not enough to indicate collapse.',
      action: 'Watch for repeated instability.',
    }
  }

  return {
    posture: 'FORECAST CONSISTENT',
    meaning: 'Predictive movement appears steady.',
    action: 'Maintain routine monitoring.',
  }
}

function interpretSurvivability(value: number): Interpretation {
  if (value >= 75) {
    return {
      posture: 'SURVIVABILITY FAVORABLE',
      meaning: 'Survivability signals support continued stability.',
      action: 'Confirm durability.',
    }
  }

  if (value >= 55) {
    return {
      posture: 'SURVIVABILITY MONITORED',
      meaning: 'Survivability exists but still requires review.',
      action: 'Do not assume closure.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'SURVIVABILITY FRAGILE',
      meaning: 'Survivability may weaken if pressure continues.',
      action: 'Continue survivability review.',
    }
  }

  return {
    posture: 'SURVIVABILITY AT RISK',
    meaning: 'Survivability is too weak for confidence.',
    action: 'Escalate survivability review.',
  }
}

function interpretHistory(count: number): Interpretation {
  if (count < 3) {
    return {
      posture: 'INSUFFICIENT HISTORY',
      meaning: 'Too few snapshots exist for predictive interpretation.',
      action: 'Continue saving operational snapshots.',
    }
  }

  if (count < 10) {
    return {
      posture: 'EARLY MEMORY',
      meaning: 'Predictive memory has started but remains early.',
      action: 'Build more continuity memory.',
    }
  }

  return {
    posture: 'PREDICTIVE MEMORY ESTABLISHED',
    meaning: 'Persisted memory supports forecast interpretation.',
    action: 'Use posture to guide executive review.',
  }
}

function compactAction(actions: string[]) {
  return Array.from(new Set(actions)).join(' ')
}

function formatDate(value: string) {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleString()
}

function PostureCard({
  title,
  interpretation,
}: {
  title: string
  interpretation: Interpretation
}) {
  return (
    <article style={styles.postureCard}>
      <p style={styles.cardKicker}>{title}</p>
      <h3 style={styles.postureTitle}>{interpretation.posture}</h3>
      <p style={styles.postureMeaning}>{interpretation.meaning}</p>
    </article>
  )
}

function CompactCard({ title, value }: { title: string; value: string }) {
  return (
    <article style={styles.compactCard}>
      <p style={styles.cardKicker}>{title}</p>
      <h3 style={styles.compactValue}>{value}</h3>
    </article>
  )
}

function Panel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>{title}</h2>
      <div style={styles.infoList}>{children}</div>
    </section>
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

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: 'white',
    overflowX: 'hidden',
  },
  container: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '0 20px 48px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '20px',
    paddingTop: '4px',
  },
  kicker: {
    color: '#fdba74',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
    margin: 0,
  },
  title: {
    fontSize: 'clamp(32px, 5vw, 48px)',
    lineHeight: 1.05,
    margin: '10px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '760px',
    lineHeight: 1.65,
    fontSize: '16px',
    margin: 0,
  },
  message: {
    background: '#431407',
    color: '#ffedd5',
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '16px',
    fontSize: '14px',
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 0.6fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #f97316',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  sectionKicker: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '12px',
  },
  heroPosture: {
    fontSize: 'clamp(34px, 6vw, 56px)',
    margin: '8px 0 12px',
    color: '#fdba74',
    letterSpacing: '-0.05em',
    lineHeight: 1,
  },
  heroMeaning: {
    color: '#ffedd5',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '720px',
  },
  actionBox: {
    background: '#431407',
    border: '1px solid #f97316',
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },
  actionLabel: {
    color: '#fdba74',
    fontWeight: 900,
    margin: '0 0 8px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  actionText: {
    color: '#ffedd5',
    lineHeight: 1.55,
    margin: 0,
    fontSize: '14px',
  },
  postureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  postureCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
    boxSizing: 'border-box',
  },
  cardKicker: {
    color: '#94a3b8',
    fontWeight: 800,
    margin: 0,
    fontSize: '12px',
  },
  postureTitle: {
    color: '#f8fafc',
    fontSize: '19px',
    margin: '10px 0 8px',
    lineHeight: 1.15,
  },
  postureMeaning: {
    color: '#cbd5e1',
    lineHeight: 1.5,
    fontSize: '14px',
    margin: 0,
  },
  compactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  compactCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '104px',
    boxSizing: 'border-box',
  },
  compactValue: {
    fontSize: '18px',
    lineHeight: 1.2,
    margin: '10px 0 0',
    color: '#f8fafc',
    overflowWrap: 'anywhere',
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.24)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
    marginBottom: '14px',
  },
  cardTitle: {
    fontSize: '22px',
    margin: 0,
    lineHeight: 1.2,
  },
  cardNote: {
    color: '#94a3b8',
    lineHeight: 1.5,
    margin: '6px 0 0',
    fontSize: '14px',
  },
  infoList: {
    display: 'grid',
    gap: '10px',
    marginTop: '14px',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '160px minmax(0, 1fr)',
    gap: '12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '12px',
    alignItems: 'start',
  },
  infoLabel: {
    color: '#94a3b8',
    fontWeight: 800,
    fontSize: '12px',
  },
  infoValue: {
    color: '#f8fafc',
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '760px',
  },
  th: {
    textAlign: 'left',
    color: '#94a3b8',
    borderBottom: '1px solid #334155',
    padding: '10px',
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  td: {
    borderBottom: '1px solid #1e293b',
    padding: '10px',
    color: '#e2e8f0',
    verticalAlign: 'top',
    fontWeight: 700,
    fontSize: '13px',
  },
  primaryButton: {
    padding: '10px 14px',
    borderRadius: '12px',
    border: 'none',
    background: '#fdba74',
    color: '#431407',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '16px',
    color: '#e2e8f0',
    lineHeight: 1.55,
    minHeight: '260px',
    fontSize: '14px',
    overflowX: 'auto',
  },
}