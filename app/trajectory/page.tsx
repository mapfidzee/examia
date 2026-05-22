'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { interpretTrajectory } from '@/lib/cgi/interpreters/interpretTrajectory'
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
}

type Interpretation = {
  posture: string
  meaning: string
  action: string
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
    setMessage('Loading continuity trajectory memory...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Continuity trajectory memory could not be loaded.')
      return
    }

    setMetrics(data || [])
    setMessage('Continuity trajectory memory loaded.')
  }

  const trajectory = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    )

    const latest = ordered[ordered.length - 1] || null
    const previous = ordered[ordered.length - 2] || null
    const earlyWindow = ordered.slice(0, 5)
    const recentWindow = ordered.slice(-5)

    const trajectoryRisk = average(ordered.map((item) => item.trajectory_risk))
    const drift = average(ordered.map((item) => item.continuity_drift))
    const escalationMomentum = average(
      ordered.map((item) => item.escalation_momentum)
    )
    const recoveryDirection = average(
      ordered.map((item) => item.recovery_direction)
    )
    const stabilizationTrend = average(
      ordered.map((item) => item.stabilization_trend)
    )
    const unresolvedMomentum = average(
      ordered.map((item) => item.unresolved_momentum)
    )
    const continuityIntegrity = average(
      ordered.map((item) => item.continuity_integrity_score)
    )
    const stabilizationConfidence = average(
      ordered.map((item) => item.stabilization_confidence_score)
    )
    const reliability = average(
      ordered.map((item) => item.recovery_reliability_score)
    )
    const survivability = average(
      ordered.map((item) => item.operational_survivability_score)
    )
    const propagation = average(ordered.map((item) => item.propagation_risk))
    const memoryRisk = average(
      ordered.map((item) => item.structural_memory_risk)
    )

    const earlyPressure = average(
      earlyWindow.map((item) =>
        average([
          item.trajectory_risk,
          item.continuity_drift,
          item.escalation_momentum,
          item.unresolved_momentum,
          100 - item.recovery_direction,
          100 - item.stabilization_trend,
        ])
      )
    )

    const recentPressure = average(
      recentWindow.map((item) =>
        average([
          item.trajectory_risk,
          item.continuity_drift,
          item.escalation_momentum,
          item.unresolved_momentum,
          100 - item.recovery_direction,
          100 - item.stabilization_trend,
        ])
      )
    )

    const trajectoryPressureMovement =
      ordered.length < 2 ? 0 : recentPressure - earlyPressure

    const earlyStabilization = average(
      earlyWindow.map((item) =>
        average([
          item.recovery_direction,
          item.stabilization_trend,
          item.recovery_reliability_score,
          item.operational_survivability_score,
        ])
      )
    )

    const recentStabilization = average(
      recentWindow.map((item) =>
        average([
          item.recovery_direction,
          item.stabilization_trend,
          item.recovery_reliability_score,
          item.operational_survivability_score,
        ])
      )
    )

    const stabilizationMovement =
      ordered.length < 2 ? 0 : recentStabilization - earlyStabilization

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

    const trajectoryVolatility = calculateVolatility(
      ordered.map((item) =>
        average([
          item.trajectory_risk,
          item.continuity_drift,
          item.escalation_momentum,
          item.unresolved_momentum,
          100 - item.recovery_direction,
          100 - item.stabilization_trend,
        ])
      )
    )

    const directionStrength = average([
      recoveryDirection,
      stabilizationTrend,
      reliability,
      survivability,
      continuityIntegrity,
      stabilizationConfidence,
    ])

    const deteriorationLoad = average([
      trajectoryRisk,
      drift,
      escalationMomentum,
      unresolvedMomentum,
      propagation,
      memoryRisk,
    ])

    const centralizedTrajectory = interpretTrajectory({
      trajectoryRisk,
      continuityDrift: drift,
      unresolvedMomentum,
      survivabilityRisk: 100 - survivability,
    })

    const dominantDriver = strongestDriver({
      'Trajectory risk': trajectoryRisk,
      'Continuity drift': drift,
      'Escalation momentum': escalationMomentum,
      'Unresolved momentum': unresolvedMomentum,
      'Recovery weakness': 100 - recoveryDirection,
      'Stabilization weakness': 100 - stabilizationTrend,
      'Reliability weakness': 100 - reliability,
      'Survivability weakness': 100 - survivability,
      'Pressure movement': Math.max(trajectoryPressureMovement, 0),
      'Stabilization decline': Math.max(-stabilizationMovement, 0),
      'Trajectory volatility': trajectoryVolatility,
    })

    const trajectoryPosture = {
      posture: centralizedTrajectory.posture,
      meaning: centralizedTrajectory.summary,
      action: centralizedTrajectory.executiveAction,
    }

    const directionPosture = interpretDirectionStrength(directionStrength)
    const driftPosture = interpretDrift(drift)
    const deteriorationSignal = interpretDeterioration(deteriorationLoad)
    const recoveryPosture = interpretRecoveryDirection(recoveryDirection)
    const stabilizationPosture = interpretStabilization(stabilizationTrend)
    const momentumPosture = interpretMomentum(escalationMomentum)
    const unresolvedPosture = interpretUnresolved(unresolvedMomentum)
    const volatilityPosture = interpretVolatility(trajectoryVolatility)
    const movementPosture = interpretMovement(
      trajectoryPressureMovement || latestTrajectoryMovement
    )
    const historyDepth = interpretHistory(ordered.length)

    const executiveSummary = `${trajectoryPosture.meaning} The dominant continuity direction driver is ${dominantDriver}. ${driftPosture.meaning} ${stabilizationPosture.meaning}`

    const actionCue = compactAction([
      trajectoryPosture.action,
      driftPosture.action,
      deteriorationSignal.action,
      stabilizationPosture.action,
    ])

    return {
      latest,
      trajectoryPosture,
      directionPosture,
      driftPosture,
      deteriorationSignal,
      recoveryPosture,
      stabilizationPosture,
      momentumPosture,
      unresolvedPosture,
      volatilityPosture,
      movementPosture,
      historyDepth,
      dominantDriver,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

  const brief = `
TSINAXA CGI TRAJECTORY INTELLIGENCE BRIEF

Continuity Direction:
${trajectory.trajectoryPosture.posture}

Direction Strength:
${trajectory.directionPosture.posture}

Continuity Drift:
${trajectory.driftPosture.posture}

Deterioration Signal:
${trajectory.deteriorationSignal.posture}

Recovery Direction:
${trajectory.recoveryPosture.posture}

Stabilization Movement:
${trajectory.stabilizationPosture.posture}

Momentum State:
${trajectory.momentumPosture.posture}

Unresolved Momentum:
${trajectory.unresolvedPosture.posture}

Trajectory Volatility:
${trajectory.volatilityPosture.posture}

Dominant Continuity Driver:
${trajectory.dominantDriver}

Executive Interpretation:
${trajectory.executiveSummary}

Recommended Action:
${trajectory.actionCue}

Governance-Safe Meaning:
This view does not judge people or assign blame. It reads persisted continuity memory to determine whether the institution is stabilizing, holding, drifting, or deteriorating across time.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • TRAJECTORY INTELLIGENCE</p>

          <h1 style={styles.title}>Continuity Direction Intelligence</h1>

          <p style={styles.subtitle}>
            Executive visibility into whether continuity is stabilizing, holding,
            drifting, or deteriorating across persisted operational memory.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Continuity Direction</p>

            <h2 style={styles.heroPosture}>
              {trajectory.trajectoryPosture.posture}
            </h2>

            <p style={styles.heroMeaning}>{trajectory.executiveSummary}</p>
          </div>

          <div style={styles.actionBox}>
            <p style={styles.actionLabel}>Executive Action</p>
            <p style={styles.actionText}>{trajectory.actionCue}</p>
          </div>
        </section>

        <section style={styles.postureGrid}>
          <PostureCard title="Direction Strength" interpretation={trajectory.directionPosture} />
          <PostureCard title="Continuity Drift" interpretation={trajectory.driftPosture} />
          <PostureCard title="Deterioration Signal" interpretation={trajectory.deteriorationSignal} />
          <PostureCard title="Recovery Direction" interpretation={trajectory.recoveryPosture} />
          <PostureCard title="Stabilization Movement" interpretation={trajectory.stabilizationPosture} />
          <PostureCard title="Escalation Momentum" interpretation={trajectory.momentumPosture} />
        </section>

        <section style={styles.compactGrid}>
          <CompactCard title="Memory Depth" value={trajectory.historyDepth.posture} />
          <CompactCard title="Dominant Driver" value={trajectory.dominantDriver} />
          <CompactCard title="Trajectory Volatility" value={trajectory.volatilityPosture.posture} />
          <CompactCard title="Unresolved Momentum" value={trajectory.unresolvedPosture.posture} />
        </section>

        <section style={styles.twoColumn}>
          <Panel title="Latest Continuity Context">
            <Info label="Continuity State" value={trajectory.latest?.continuity_state || 'Not recorded'} />
            <Info label="Trajectory Direction" value={trajectory.latest?.trajectory_direction || 'Not recorded'} />
            <Info label="Pressure State" value={trajectory.latest?.pressure_propagation_state || 'Not recorded'} />
            <Info label="Structural Memory" value={trajectory.latest?.structural_memory_state || 'Not recorded'} />
            <Info label="Dominant Signal" value={trajectory.latest?.dominant_trajectory_signal || 'Not recorded'} />
          </Panel>

          <Panel title="Trajectory Reading">
            <Info label="Continuity Direction" value={trajectory.trajectoryPosture.posture} />
            <Info label="Continuity Drift" value={trajectory.driftPosture.posture} />
            <Info label="Deterioration Signal" value={trajectory.deteriorationSignal.posture} />
            <Info label="Dominant Driver" value={trajectory.dominantDriver} />
            <Info label="Current Direction" value={trajectory.directionPosture.posture} />
          </Panel>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Recent Continuity Memory Trail</h2>
              <p style={styles.cardNote}>
                Recent snapshots are shown as continuity direction readings, not
                personal performance judgments.
              </p>
            </div>

            <button onClick={loadTrajectoryMetrics} style={styles.primaryButton}>
              Refresh
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Direction</th>
                  <th style={styles.th}>Risk</th>
                  <th style={styles.th}>Drift</th>
                  <th style={styles.th}>Momentum</th>
                  <th style={styles.th}>Stabilization</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No persisted continuity trajectory memory found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 8).map((item) => {
                  const rowTrajectory = interpretTrajectory({
                    trajectoryRisk: item.trajectory_risk,
                    continuityDrift: item.continuity_drift,
                    unresolvedMomentum: item.unresolved_momentum,
                    survivabilityRisk: 100 - item.operational_survivability_score,
                  })

                  return (
                    <tr key={item.id}>
                      <td style={styles.td}>{formatDate(item.created_at)}</td>
                      <td style={styles.td}>{rowTrajectory.posture}</td>
                      <td style={styles.td}>
                        {interpretDeterioration(item.trajectory_risk).posture}
                      </td>
                      <td style={styles.td}>
                        {interpretDrift(item.continuity_drift).posture}
                      </td>
                      <td style={styles.td}>
                        {interpretMomentum(item.escalation_momentum).posture}
                      </td>
                      <td style={styles.td}>
                        {interpretStabilization(item.stabilization_trend).posture}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Generated Trajectory Brief</h2>
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

function strongestDriver(scores: Record<string, number>) {
  return (
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No dominant continuity driver detected'
  )
}

function interpretDirectionStrength(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'DIRECTION STRENGTHENING',
      meaning: 'Continuity direction is becoming more dependable.',
      action: 'Confirm survivability before closure.',
    }
  }

  if (value >= 50) {
    return {
      posture: 'DIRECTION HOLDING',
      meaning: 'Continuity direction is visible but still requires confirmation.',
      action: 'Continue direction monitoring.',
    }
  }

  return {
    posture: 'DIRECTION WEAK',
    meaning: 'Continuity direction is not strong enough for stability confidence.',
    action: 'Review recovery and stabilization barriers.',
  }
}

function interpretDrift(value: number): Interpretation {
  if (value >= 60) {
    return {
      posture: 'DRIFT RISING',
      meaning: 'Continuity drift is strong enough to threaten trajectory.',
      action: 'Escalate drift review.',
    }
  }

  if (value >= 35) {
    return {
      posture: 'DRIFT UNDER WATCH',
      meaning: 'Drift remains visible and must stay under governance review.',
      action: 'Keep drift visible.',
    }
  }

  return {
    posture: 'DRIFT CONTAINED',
    meaning: 'Continuity drift is currently contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretDeterioration(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'DETERIORATION RISK HIGH',
      meaning: 'Deterioration pressure may threaten stabilization credibility.',
      action: 'Escalate deterioration review.',
    }
  }

  if (value >= 45) {
    return {
      posture: 'DETERIORATION UNDER WATCH',
      meaning: 'Deterioration pressure is visible and requires review.',
      action: 'Keep deterioration visible.',
    }
  }

  return {
    posture: 'DETERIORATION CONTAINED',
    meaning: 'Deterioration pressure appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretRecoveryDirection(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'RECOVERY MOVING FORWARD',
      meaning: 'Recovery direction is improving.',
      action: 'Protect the recovery pathway.',
    }
  }

  if (value >= 50) {
    return {
      posture: 'RECOVERY HOLDING',
      meaning: 'Recovery movement is visible but not yet durable.',
      action: 'Continue recovery monitoring.',
    }
  }

  return {
    posture: 'RECOVERY WEAKENING',
    meaning: 'Recovery direction may be weakening.',
    action: 'Review recovery blockers.',
  }
}

function interpretStabilization(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'STABILIZATION STRENGTHENING',
      meaning: 'Stabilization movement is becoming more credible.',
      action: 'Confirm durability before closure.',
    }
  }

  if (value >= 45) {
    return {
      posture: 'STABILIZATION FRAGILE',
      meaning: 'Stabilization movement exists but is not yet durable.',
      action: 'Keep recovery monitoring active.',
    }
  }

  return {
    posture: 'STABILIZATION WEAK',
    meaning: 'Stabilization movement is too weak for confidence.',
    action: 'Review unresolved barriers.',
  }
}

function interpretMomentum(value: number): Interpretation {
  if (value >= 65) {
    return {
      posture: 'ESCALATION MOMENTUM HIGH',
      meaning: 'Escalation momentum may accelerate deterioration.',
      action: 'Escalate momentum review.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'ESCALATION MOMENTUM VISIBLE',
      meaning: 'Escalation momentum remains visible.',
      action: 'Keep escalation under review.',
    }
  }

  return {
    posture: 'ESCALATION MOMENTUM CONTAINED',
    meaning: 'Escalation momentum appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretUnresolved(value: number): Interpretation {
  if (value >= 65) {
    return {
      posture: 'UNRESOLVED MOMENTUM HIGH',
      meaning: 'Unresolved momentum may slow or reverse recovery.',
      action: 'Escalate unresolved momentum review.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'UNRESOLVED MOMENTUM VISIBLE',
      meaning: 'Unresolved momentum remains visible.',
      action: 'Keep follow-up active.',
    }
  }

  return {
    posture: 'UNRESOLVED MOMENTUM CONTAINED',
    meaning: 'Unresolved momentum appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretVolatility(value: number): Interpretation {
  if (value >= 30) {
    return {
      posture: 'TRAJECTORY VOLATILE',
      meaning: 'Trajectory movement fluctuates enough to weaken confidence.',
      action: 'Extend trajectory monitoring.',
    }
  }

  if (value >= 18) {
    return {
      posture: 'VARIATION CONTAINED',
      meaning: 'Trajectory variation exists but is not showing collapse.',
      action: 'Watch for repeated instability.',
    }
  }

  return {
    posture: 'TRAJECTORY MOVEMENT STABLE',
    meaning: 'Trajectory movement appears steady.',
    action: 'Maintain routine monitoring.',
  }
}

function interpretMovement(value: number): Interpretation {
  if (value >= 10) {
    return {
      posture: 'PRESSURE MOVING AGAINST TRAJECTORY',
      meaning: 'Trajectory pressure is rising across the reviewed memory.',
      action: 'Review trajectory pressure drivers.',
    }
  }

  if (value <= -10) {
    return {
      posture: 'TRAJECTORY PRESSURE EASING',
      meaning: 'Trajectory pressure is easing across the reviewed memory.',
      action: 'Maintain monitoring.',
    }
  }

  return {
    posture: 'TRAJECTORY MOVEMENT HOLDING',
    meaning: 'Trajectory movement is neither clearly improving nor deteriorating.',
    action: 'Continue comparison across future snapshots.',
  }
}

function interpretHistory(count: number): Interpretation {
  if (count < 3) {
    return {
      posture: 'INSUFFICIENT MEMORY',
      meaning: 'Too few snapshots exist for reliable trajectory interpretation.',
      action: 'Continue saving operational snapshots.',
    }
  }

  if (count < 10) {
    return {
      posture: 'EARLY TRAJECTORY MEMORY',
      meaning: 'Trajectory memory has started but remains early.',
      action: 'Continue building continuity memory.',
    }
  }

  return {
    posture: 'TRAJECTORY MEMORY ESTABLISHED',
    meaning: 'Persisted memory supports continuity direction interpretation.',
    action: 'Use trajectory posture to guide executive review.',
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

function Panel({ title, children }: { title: string; children: ReactNode }) {
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
    color: '#c4b5fd',
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
    background: '#2e1065',
    color: '#ede9fe',
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
    border: '1px solid #a78bfa',
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
    color: '#c4b5fd',
    letterSpacing: '-0.05em',
    lineHeight: 1,
  },
  heroMeaning: {
    color: '#ede9fe',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '720px',
  },
  actionBox: {
    background: '#2e1065',
    border: '1px solid #a78bfa',
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },
  actionLabel: {
    color: '#c4b5fd',
    fontWeight: 900,
    margin: '0 0 8px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  actionText: {
    color: '#ede9fe',
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
    background: '#c4b5fd',
    color: '#2e1065',
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