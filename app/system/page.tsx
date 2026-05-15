'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type CgiOperationalMetric = {
  id: string
  created_at: string
  scope: string

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
}

type StabilityState =
  | 'SYSTEM_STABILIZING'
  | 'STABILIZATION_FRAGILE'
  | 'PRESSURE_PROPAGATING'
  | 'RECOVERY_STALLED'
  | 'TRAJECTORY_DETERIORATING'
  | 'SURVIVABILITY_RISK_RISING'
  | 'INSUFFICIENT_HISTORY'

type BoardZone = {
  title: string
  state: string
  score: string
  interpretation: string
  action: string
}

const SAMPLE_LIMIT = 120

const DOCTRINE = [
  'Detection is not stabilization.',
  'Routing is not intervention.',
  'Intervention is not recovery.',
  'Outcome is not continuity.',
  'Closure is not survivability.',
]

export default function SystemPage() {
  return (
    <CGIGovernanceShell>
      <ExecutiveStabilityBoard />
    </CGIGovernanceShell>
  )
}

function ExecutiveStabilityBoard() {
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadBoardMetrics()
  }, [])

  async function loadBoardMetrics() {
    setMessage('Loading TSINAXA CGI executive stability intelligence...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Failed to load TSINAXA CGI executive stability metrics.')
      return
    }

    setMetrics(data || [])
    setMessage('TSINAXA CGI executive stability intelligence loaded.')
  }

  const board = useMemo(() => {
    const sortedMetrics = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

    const latest = sortedMetrics[sortedMetrics.length - 1] || null
    const prior = sortedMetrics[sortedMetrics.length - 2] || null

    const recentWindow = sortedMetrics.slice(-5)
    const baselineWindow = sortedMetrics.slice(0, 5)

    const continuityConfidence = average([
      average(metrics.map((item) => item.continuity_integrity_score)),
      average(metrics.map((item) => item.stabilization_confidence_score)),
    ])

    const operationalSurvivability = average(
      metrics.map((item) => item.operational_survivability_score),
    )

    const pressureSeverity = average([
      average(metrics.map((item) => item.propagation_risk)),
      average(metrics.map((item) => item.routing_friction)),
      average(metrics.map((item) => item.responder_pressure)),
      average(metrics.map((item) => item.escalation_velocity)),
      average(metrics.map((item) => item.coordination_instability)),
      average(metrics.map((item) => item.stabilization_drag)),
      average(metrics.map((item) => item.escalation_pressure_index)),
    ])

    const recoveryStrength = average([
      average(metrics.map((item) => item.recovery_reliability_score)),
      average(metrics.map((item) => item.recovery_direction)),
      average(metrics.map((item) => item.stabilization_trend)),
    ])

    const reliabilityConfidence = average([
      average(metrics.map((item) => item.recovery_reliability_score)),
      average(metrics.map((item) => item.operational_survivability_score)),
      100 -
        calculateVolatility(
          metrics.map((item) => item.recovery_reliability_score),
        ),
    ])

    const structuralMemorySeverity = average([
      average(metrics.map((item) => item.structural_memory_risk)),
      average(metrics.map((item) => item.routing_failure_recurrence)),
      average(metrics.map((item) => item.escalation_corridor_recurrence)),
      average(metrics.map((item) => item.institutional_fragility_signature)),
      average(metrics.map((item) => item.intervention_failure_pattern)),
      average(metrics.map((item) => item.responder_strain_recurrence)),
      average(metrics.map((item) => item.continuity_collapse_recurrence)),
    ])

    const trajectoryPressure = average([
      average(metrics.map((item) => item.trajectory_risk)),
      average(metrics.map((item) => item.continuity_drift)),
      average(metrics.map((item) => item.escalation_momentum)),
      average(metrics.map((item) => item.unresolved_momentum)),
      100 - average(metrics.map((item) => item.recovery_direction)),
      100 - average(metrics.map((item) => item.stabilization_trend)),
    ])

    const baselineStability = average(
      baselineWindow.map((item) => stabilityScoreFromSnapshot(item)),
    )

    const recentStability = average(
      recentWindow.map((item) => stabilityScoreFromSnapshot(item)),
    )

    const stabilityVelocity =
      metrics.length < 2 ? 0 : Math.round(recentStability - baselineStability)

    const latestStabilityMovement =
      latest && prior
        ? stabilityScoreFromSnapshot(latest) - stabilityScoreFromSnapshot(prior)
        : 0

    const instabilityLoad = average([
      pressureSeverity,
      trajectoryPressure,
      structuralMemorySeverity,
      100 - continuityConfidence,
      100 - recoveryStrength,
      100 - reliabilityConfidence,
      100 - operationalSurvivability,
    ])

    const executiveStabilityScore = clamp(
      average([
        continuityConfidence,
        operationalSurvivability,
        recoveryStrength,
        reliabilityConfidence,
        100 - pressureSeverity,
        100 - trajectoryPressure,
        100 - structuralMemorySeverity,
      ]),
    )

    const executiveStabilityState = getExecutiveStabilityState({
      count: metrics.length,
      latest,
      executiveStabilityScore,
      stabilityVelocity,
      instabilityLoad,
      pressureSeverity,
      recoveryStrength,
      operationalSurvivability,
      trajectoryPressure,
      structuralMemorySeverity,
    })

    const dominantRisk = strongestDriver({
      'Pressure propagation': pressureSeverity,
      'Trajectory deterioration': trajectoryPressure,
      'Recovery weakness': 100 - recoveryStrength,
      'Reliability weakness': 100 - reliabilityConfidence,
      'Survivability weakness': 100 - operationalSurvivability,
      'Structural memory recurrence': structuralMemorySeverity,
      'Continuity confidence weakness': 100 - continuityConfidence,
      'Negative stability movement': Math.max(-stabilityVelocity, 0),
    })

    const executiveInterpretation =
      getExecutiveInterpretation(executiveStabilityState)

    const executiveActionPriorities = getExecutiveActionPriorities({
      pressureSeverity,
      trajectoryPressure,
      recoveryStrength,
      reliabilityConfidence,
      operationalSurvivability,
      structuralMemorySeverity,
      continuityConfidence,
      stabilityVelocity,
    })

    const zones: BoardZone[] = [
      {
        title: 'Continuity Stability Zone',
        state: latest?.continuity_state || 'NO_SNAPSHOT',
        score: `${continuityConfidence}/100`,
        interpretation:
          continuityConfidence >= 65
            ? 'Continuity confidence is holding at executive level.'
            : 'Continuity confidence is weak and requires command attention.',
        action:
          continuityConfidence >= 65
            ? 'Maintain continuity monitoring.'
            : 'Review continuity integrity and stabilization confidence.',
      },
      {
        title: 'Pressure Propagation Zone',
        state: latest?.pressure_propagation_state || 'NO_SNAPSHOT',
        score: `${pressureSeverity}/100`,
        interpretation:
          pressureSeverity >= 55
            ? 'Pressure is materially visible across CGI pressure signals.'
            : 'Pressure is currently contained or moderate.',
        action:
          pressureSeverity >= 55
            ? 'Inspect routing friction, escalation velocity, responder pressure, and stabilization drag.'
            : 'Continue pressure monitoring.',
      },
      {
        title: 'Trajectory Direction Zone',
        state: latest?.trajectory_direction || 'NO_SNAPSHOT',
        score: `${trajectoryPressure}/100`,
        interpretation:
          trajectoryPressure >= 50
            ? 'Trajectory signals suggest drift or deterioration risk.'
            : 'Trajectory direction is not showing severe deterioration.',
        action:
          trajectoryPressure >= 50
            ? 'Review continuity drift, escalation momentum, and unresolved momentum.'
            : 'Continue trajectory review.',
      },
      {
        title: 'Recovery Conversion Zone',
        state:
          recoveryStrength >= 65
            ? 'RECOVERY_STRENGTH_VISIBLE'
            : recoveryStrength >= 45
              ? 'RECOVERY_PARTIAL'
              : 'RECOVERY_WEAK',
        score: `${recoveryStrength}/100`,
        interpretation:
          recoveryStrength >= 65
            ? 'Recovery conversion is becoming visible.'
            : 'Recovery signals are not yet strong enough.',
        action:
          recoveryStrength >= 65
            ? 'Preserve recovery discipline.'
            : 'Strengthen outcome confirmation and recovery follow-through.',
      },
      {
        title: 'Reliability Confidence Zone',
        state:
          reliabilityConfidence >= 65
            ? 'RELIABILITY_CONFIDENT'
            : reliabilityConfidence >= 45
              ? 'RELIABILITY_WATCH'
              : 'RELIABILITY_WEAK',
        score: `${reliabilityConfidence}/100`,
        interpretation:
          reliabilityConfidence >= 65
            ? 'Reliability confidence is holding.'
            : 'Reliability confidence is fragile.',
        action:
          reliabilityConfidence >= 65
            ? 'Maintain snapshot cadence.'
            : 'Review reliability volatility and recovery durability.',
      },
      {
        title: 'Structural Memory Zone',
        state: latest?.structural_memory_state || 'NO_SNAPSHOT',
        score: `${structuralMemorySeverity}/100`,
        interpretation:
          structuralMemorySeverity >= 50
            ? 'Repeated instability patterns are becoming visible.'
            : 'Structural recurrence is currently limited.',
        action:
          structuralMemorySeverity >= 50
            ? 'Review recurring routing gaps, escalation corridors, and fragility signatures.'
            : 'Continue structural memory monitoring.',
      },
      {
        title: 'Survivability Zone',
        state:
          operationalSurvivability >= 65
            ? 'SURVIVABILITY_HOLDING'
            : operationalSurvivability >= 45
              ? 'SURVIVABILITY_WATCH'
              : 'SURVIVABILITY_RISK',
        score: `${operationalSurvivability}/100`,
        interpretation:
          operationalSurvivability >= 65
            ? 'Operational survivability is currently holding.'
            : 'Operational survivability risk requires executive visibility.',
        action:
          operationalSurvivability >= 65
            ? 'Maintain survivability review.'
            : 'Investigate survivability decline and unresolved burden.',
      },
      {
        title: 'Executive Action Zone',
        state: executiveStabilityState,
        score: `${executiveStabilityScore}/100`,
        interpretation: executiveInterpretation,
        action: executiveActionPriorities[0] || 'Maintain executive monitoring.',
      },
    ]

    return {
      latest,
      continuityConfidence,
      operationalSurvivability,
      pressureSeverity,
      recoveryStrength,
      reliabilityConfidence,
      structuralMemorySeverity,
      trajectoryPressure,
      stabilityVelocity,
      latestStabilityMovement,
      instabilityLoad,
      executiveStabilityScore,
      executiveStabilityState,
      dominantRisk,
      executiveInterpretation,
      executiveActionPriorities,
      zones,
    }
  }, [metrics])

  const brief = `
TSINAXA CGI EXECUTIVE STABILITY BOARD

Infrastructure Identity:
TSINAXA CGI
Continuity Governance Infrastructure

Enterprise Subtitle:
Executive Continuity Intelligence Infrastructure

Executive Stability State:
${board.executiveStabilityState}

Executive Stability Score:
${board.executiveStabilityScore}/100

Snapshots Reviewed:
${metrics.length}

Continuity Confidence:
${board.continuityConfidence}/100

Operational Survivability:
${board.operationalSurvivability}/100

Pressure Severity:
${board.pressureSeverity}/100

Trajectory Pressure:
${board.trajectoryPressure}/100

Recovery Strength:
${board.recoveryStrength}/100

Reliability Confidence:
${board.reliabilityConfidence}/100

Structural Memory Severity:
${board.structuralMemorySeverity}/100

Stability Velocity:
${board.stabilityVelocity}

Latest Stability Movement:
${board.latestStabilityMovement}

Instability Load:
${board.instabilityLoad}/100

Dominant Executive Risk:
${board.dominantRisk}

Executive Stability Interpretation:
${board.executiveInterpretation}

Executive Action Priorities:
${board.executiveActionPriorities.map((item, index) => `${index + 1}. ${item}`).join('\n')}

Locked Doctrine:
${DOCTRINE.join('\n')}

Governance-Safe Meaning:
This TSINAXA CGI Executive Stability Board is not workflow software, task management, incident tracking, or a generic dashboard. It is continuity command intelligence. It shows whether visible instability is stabilizing, drifting, propagating, recovering, repeating, or approaching survivability risk.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI</p>

          <h1 style={styles.title}>Continuity Governance Infrastructure</h1>

          <p style={styles.enterpriseSubtitle}>
            Executive Continuity Intelligence Infrastructure
          </p>

          <p style={styles.subtitle}>
            One executive surface for continuity posture visibility. This board shows
            whether continuity is stabilizing, drifting, propagating, recovering,
            repeating, or approaching survivability risk.
          </p>

          <div style={styles.doctrineGrid}>
            {DOCTRINE.map((item) => (
              <div key={item} style={styles.doctrineCard}>
                {item}
              </div>
            ))}
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.commandHero}>
          <div>
            <p style={styles.scoreLabel}>Executive Stability State</p>

            <h2 style={styles.executiveState}>
              {board.executiveStabilityState}
            </h2>

            <p style={styles.panelNote}>{board.executiveInterpretation}</p>
          </div>

          <div style={styles.scoreGrid}>
            <ScoreMetric
              label="Executive Stability"
              value={board.executiveStabilityScore}
            />
            <ScoreMetric
              label="Continuity Confidence"
              value={board.continuityConfidence}
            />
            <ScoreMetric
              label="Operational Survivability"
              value={board.operationalSurvivability}
            />
            <ScoreMetric
              label="Recovery Strength"
              value={board.recoveryStrength}
            />
            <ScoreMetric
              label="Reliability Confidence"
              value={board.reliabilityConfidence}
            />
            <ScoreMetric
              label="Instability Load"
              value={board.instabilityLoad}
            />
          </div>

          <div style={styles.actionBox}>
            <strong>Dominant Executive Risk:</strong>
            <span>{board.dominantRisk}</span>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Snapshots Reviewed" value={metrics.length} />
          <Metric label="Pressure Severity" value={`${board.pressureSeverity}/100`} />
          <Metric label="Trajectory Pressure" value={`${board.trajectoryPressure}/100`} />
          <Metric
            label="Structural Memory Severity"
            value={`${board.structuralMemorySeverity}/100`}
          />
          <Metric label="Stability Velocity" value={formatDelta(board.stabilityVelocity)} />
          <Metric
            label="Latest Stability Movement"
            value={formatDelta(board.latestStabilityMovement)}
          />
          <Metric label="Latest Continuity" value={board.latest?.continuity_state || 'NO_SNAPSHOT'} />
          <Metric label="Latest Trajectory" value={board.latest?.trajectory_direction || 'NO_SNAPSHOT'} />
        </section>

        <section style={styles.zoneGrid}>
          {board.zones.map((zone) => (
            <article key={zone.title} style={styles.zoneCard}>
              <p style={styles.zoneLabel}>{zone.title}</p>
              <h3 style={styles.zoneState}>{zone.state}</h3>
              <div style={styles.zoneScore}>{zone.score}</div>
              <p style={styles.zoneText}>{zone.interpretation}</p>
              <div style={styles.zoneAction}>{zone.action}</div>
            </article>
          ))}
        </section>

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Executive Action Priorities</h2>

            <p style={styles.panelNote}>
              Action cues are generated from continuity confidence, pressure severity,
              trajectory risk, recovery strength, reliability confidence, structural memory,
              and survivability posture.
            </p>

            <div style={styles.priorityList}>
              {board.executiveActionPriorities.map((priority, index) => (
                <div key={priority} style={styles.priorityItem}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{priority}</strong>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Latest Persisted Executive Context</h2>

            <div style={styles.panelList}>
              <PanelRow
                label="Continuity State"
                value={board.latest?.continuity_state || 'No snapshot'}
              />
              <PanelRow
                label="Pressure State"
                value={board.latest?.pressure_propagation_state || 'No snapshot'}
              />
              <PanelRow
                label="Trajectory Direction"
                value={board.latest?.trajectory_direction || 'No snapshot'}
              />
              <PanelRow
                label="Structural Memory State"
                value={board.latest?.structural_memory_state || 'No snapshot'}
              />
              <PanelRow
                label="Dominant Pressure Source"
                value={board.latest?.dominant_pressure_source || 'Not recorded'}
              />
              <PanelRow
                label="Dominant Trajectory Signal"
                value={board.latest?.dominant_trajectory_signal || 'Not recorded'}
              />
              <PanelRow
                label="Dominant Memory Pattern"
                value={board.latest?.dominant_memory_pattern || 'Not recorded'}
              />
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Recent Executive Stability Snapshot Trail</h2>

          <p style={styles.panelNote}>
            Latest saved rows from <code>cgi_operational_metrics</code>. This is
            persisted TSINAXA CGI continuity intelligence, not a live workflow list.
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
                  <th style={styles.th}>Recovery</th>
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

          <button onClick={loadBoardMetrics} style={styles.primaryButton}>
            Refresh Executive Stability Board
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Executive Stability Brief</h2>
          <pre style={styles.summaryBox}>{brief}</pre>
        </section>
      </div>
    </main>
  )
}

function stabilityScoreFromSnapshot(item: CgiOperationalMetric) {
  return clamp(
    average([
      item.continuity_integrity_score,
      item.stabilization_confidence_score,
      item.recovery_reliability_score,
      item.operational_survivability_score,
      item.recovery_direction,
      item.stabilization_trend,
      100 -
        average([
          item.propagation_risk,
          item.routing_friction,
          item.responder_pressure,
          item.escalation_velocity,
          item.coordination_instability,
          item.stabilization_drag,
          item.trajectory_risk,
          item.continuity_drift,
          item.escalation_momentum,
          item.unresolved_momentum,
          item.structural_memory_risk,
        ]),
    ]),
  )
}

function getExecutiveStabilityState(input: {
  count: number
  latest: CgiOperationalMetric | null
  executiveStabilityScore: number
  stabilityVelocity: number
  instabilityLoad: number
  pressureSeverity: number
  recoveryStrength: number
  operationalSurvivability: number
  trajectoryPressure: number
  structuralMemorySeverity: number
}): StabilityState {
  if (input.count < 3) return 'INSUFFICIENT_HISTORY'

  if (input.operationalSurvivability < 35 || input.instabilityLoad >= 75) {
    return 'SURVIVABILITY_RISK_RISING'
  }

  if (
    input.latest?.trajectory_direction === 'DETERIORATING' ||
    input.latest?.trajectory_direction === 'COLLAPSE_RISK' ||
    input.trajectoryPressure >= 65 ||
    input.stabilityVelocity <= -15
  ) {
    return 'TRAJECTORY_DETERIORATING'
  }

  if (input.recoveryStrength < 40) {
    return 'RECOVERY_STALLED'
  }

  if (
    input.pressureSeverity >= 60 ||
    input.latest?.pressure_propagation_state === 'SPREADING' ||
    input.latest?.pressure_propagation_state === 'CASCADE_RISK'
  ) {
    return 'PRESSURE_PROPAGATING'
  }

  if (
    input.executiveStabilityScore >= 65 &&
    input.stabilityVelocity >= 0 &&
    input.structuralMemorySeverity < 50
  ) {
    return 'SYSTEM_STABILIZING'
  }

  return 'STABILIZATION_FRAGILE'
}

function getExecutiveInterpretation(state: StabilityState) {
  if (state === 'INSUFFICIENT_HISTORY') {
    return 'There are not enough persisted CGI snapshots yet to make a confident executive stability judgment.'
  }

  if (state === 'SYSTEM_STABILIZING') {
    return 'TSINAXA CGI shows system-level stabilization. Continuity, recovery, reliability, and survivability are holding better than instability pressure.'
  }

  if (state === 'PRESSURE_PROPAGATING') {
    return 'TSINAXA CGI shows pressure propagation. Instability is spreading or concentrating strongly enough to require executive review.'
  }

  if (state === 'RECOVERY_STALLED') {
    return 'TSINAXA CGI shows stalled recovery. Stabilization signals are not converting into durable recovery strongly enough.'
  }

  if (state === 'TRAJECTORY_DETERIORATING') {
    return 'TSINAXA CGI shows trajectory deterioration. Continuity direction is weakening or moving toward collapse risk.'
  }

  if (state === 'SURVIVABILITY_RISK_RISING') {
    return 'TSINAXA CGI shows survivability risk rising. Operational continuity may not be durable without command intervention.'
  }

  return 'TSINAXA CGI shows fragile stabilization. The system is not collapsing, but continuity confidence is not yet strong enough.'
}

function getExecutiveActionPriorities(input: {
  pressureSeverity: number
  trajectoryPressure: number
  recoveryStrength: number
  reliabilityConfidence: number
  operationalSurvivability: number
  structuralMemorySeverity: number
  continuityConfidence: number
  stabilityVelocity: number
}) {
  const actions: string[] = []

  if (input.pressureSeverity >= 50) {
    actions.push('Review pressure propagation and routing friction.')
  }

  if (input.trajectoryPressure >= 50 || input.stabilityVelocity < 0) {
    actions.push('Review trajectory drift and deterioration acceleration.')
  }

  if (input.recoveryStrength < 55) {
    actions.push('Strengthen recovery follow-through and outcome confirmation.')
  }

  if (input.reliabilityConfidence < 55) {
    actions.push('Inspect reliability volatility and stabilization durability.')
  }

  if (input.operationalSurvivability < 55) {
    actions.push('Investigate operational survivability decline.')
  }

  if (input.structuralMemorySeverity >= 45) {
    actions.push('Review repeated instability signatures and escalation corridors.')
  }

  if (input.continuityConfidence < 55) {
    actions.push('Strengthen continuity integrity and stabilization confidence.')
  }

  if (actions.length === 0) {
    actions.push('Maintain executive monitoring and continue saving snapshots.')
  }

  return actions
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

function strongestDriver(scores: Record<string, number>) {
  return (
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No dominant executive risk detected'
  )
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
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

function PanelRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.panelRow}>
      <span>{label}</span>
      <strong>{value}</strong>
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
    fontSize: '13px',
    fontWeight: 900,
    letterSpacing: '3px',
  },
  title: {
    fontSize: 'clamp(38px, 7vw, 72px)',
    lineHeight: 1,
    margin: '12px 0',
    letterSpacing: '-0.05em',
  },
  enterpriseSubtitle: {
    color: '#a7f3d0',
    fontSize: 'clamp(20px, 4vw, 34px)',
    fontWeight: 900,
    margin: '0 0 16px',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '980px',
    lineHeight: 1.7,
    fontSize: '18px',
  },
  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '12px',
    marginTop: '22px',
  },
  doctrineCard: {
    background: '#020617',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '14px',
    color: '#cffafe',
    fontWeight: 800,
    lineHeight: 1.4,
  },
  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '20px',
  },
  commandHero: {
    background: '#020617',
    border: '1px solid #67e8f9',
    borderRadius: '30px',
    padding: '28px',
    marginBottom: '24px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
  },
  scoreLabel: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  executiveState: {
    fontSize: 'clamp(38px, 8vw, 82px)',
    margin: '8px 0 20px',
    color: '#67e8f9',
    letterSpacing: '-0.06em',
  },
  panelNote: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    marginBottom: '18px',
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
    background: '#082f49',
    border: '1px solid #0891b2',
    borderRadius: '18px',
    padding: '18px',
    marginTop: '16px',
    color: '#cffafe',
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
  zoneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '18px',
    marginBottom: '28px',
  },
  zoneCard: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '22px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
  },
  zoneLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  zoneState: {
    color: '#67e8f9',
    fontSize: '22px',
    margin: '12px 0',
    overflowWrap: 'anywhere',
  },
  zoneScore: {
    display: 'inline-block',
    border: '1px solid #334155',
    background: '#0f172a',
    borderRadius: '999px',
    padding: '8px 12px',
    color: '#f8fafc',
    fontWeight: 900,
    marginBottom: '14px',
  },
  zoneText: {
    color: '#cbd5e1',
    lineHeight: 1.6,
  },
  zoneAction: {
    marginTop: '14px',
    background: '#082f49',
    border: '1px solid #164e63',
    borderRadius: '14px',
    padding: '12px',
    color: '#cffafe',
    fontWeight: 800,
    lineHeight: 1.5,
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
  priorityList: {
    display: 'grid',
    gap: '12px',
  },
  priorityItem: {
    display: 'grid',
    gridTemplateColumns: '48px 1fr',
    gap: '12px',
    alignItems: 'center',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '14px',
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