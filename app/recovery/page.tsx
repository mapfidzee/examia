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
  recovery_reliability_score: number
  operational_survivability_score: number
  recovery_direction: number
  stabilization_trend: number
  unresolved_momentum: number
  stabilization_drag: number
  continuity_drift: number
  escalation_momentum: number
  propagation_risk: number
  trajectory_risk: number
  structural_memory_risk: number
  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
}

type RecoveryState =
  | 'INSUFFICIENT_HISTORY'
  | 'RECOVERY_STRENGTHENING'
  | 'RECOVERY_HOLDING'
  | 'RECOVERY_FRAGILE'
  | 'RECOVERY_STALLED'

type Interpretation = {
  posture: string
  meaning: string
  action: string
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
    setMessage('Loading recovery intelligence...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Recovery intelligence could not be loaded.')
      return
    }

    setMetrics(data || [])
    setMessage('Recovery intelligence loaded.')
  }

  const recovery = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    const latest = ordered[ordered.length - 1] || null
    const previous = ordered[ordered.length - 2] || null

    const earlyWindow = ordered.slice(0, 5)
    const recentWindow = ordered.slice(-5)

    const reliability = average(metrics.map((item) => item.recovery_reliability_score))
    const direction = average(metrics.map((item) => item.recovery_direction))
    const trend = average(metrics.map((item) => item.stabilization_trend))
    const confidence = average(metrics.map((item) => item.stabilization_confidence_score))
    const survivability = average(metrics.map((item) => item.operational_survivability_score))
    const integrity = average(metrics.map((item) => item.continuity_integrity_score))
    const unresolved = average(metrics.map((item) => item.unresolved_momentum))
    const drag = average(metrics.map((item) => item.stabilization_drag))
    const drift = average(metrics.map((item) => item.continuity_drift))
    const escalation = average(metrics.map((item) => item.escalation_momentum))

    const burden = average([
      unresolved,
      drag,
      drift,
      escalation,
      average(metrics.map((item) => item.propagation_risk)),
      average(metrics.map((item) => item.trajectory_risk)),
      average(metrics.map((item) => item.structural_memory_risk)),
    ])

    const conversion = clamp(
      average([
        reliability,
        direction,
        trend,
        confidence,
        survivability,
        integrity,
        100 - burden,
      ])
    )

    const early = average(earlyWindow.map((item) => recoveryConversionFromSnapshot(item)))
    const recent = average(recentWindow.map((item) => recoveryConversionFromSnapshot(item)))

    const velocity = metrics.length < 2 ? 0 : recent - early

    const latestMovement =
      latest && previous
        ? recoveryConversionFromSnapshot(latest) - recoveryConversionFromSnapshot(previous)
        : 0

    const volatility = calculateVolatility(
      metrics.map((item) => recoveryConversionFromSnapshot(item))
    )

    const pressure = clamp(
      average([
        unresolved,
        drag,
        drift,
        escalation,
        100 - reliability,
        100 - direction,
        100 - trend,
        100 - survivability,
      ])
    )

    const state = getRecoveryState({
      count: metrics.length,
      conversion,
      velocity,
      volatility,
      pressure,
      latest,
    })

    const dominantBlocker = strongestDriver({
      'Stabilization trend weakness': 100 - trend,
      'Recovery reliability weakness': 100 - reliability,
      'Recovery direction weakness': 100 - direction,
      'Survivability weakness': 100 - survivability,
      'Unresolved momentum': unresolved,
      'Stabilization drag': drag,
      'Continuity drift': drift,
      'Escalation momentum': escalation,
    })

    const posture = interpretRecoveryPosture(state)
    const durability = interpretDurability(conversion)
    const reliabilityMeaning = interpretReliability(reliability)
    const directionMeaning = interpretDirection(velocity || latestMovement)
    const trendMeaning = interpretTrend(trend)
    const survivabilityMeaning = interpretSurvivability(survivability)
    const pressureMeaning = interpretPressure(pressure)
    const volatilityMeaning = interpretVolatility(volatility)
    const driftMeaning = interpretDrift(drift)
    const historyMeaning = interpretHistory(metrics.length)

    const executiveSummary = `${durability.meaning} Dominant blocker: ${dominantBlocker}. ${pressureMeaning.meaning} ${driftMeaning.meaning}`

    const actionCue = compactAction([
      posture.action,
      pressureMeaning.action,
      driftMeaning.action,
      volatilityMeaning.action,
    ])

    return {
      latest,
      posture,
      durability,
      reliabilityMeaning,
      directionMeaning,
      trendMeaning,
      survivabilityMeaning,
      pressureMeaning,
      volatilityMeaning,
      driftMeaning,
      historyMeaning,
      dominantBlocker,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

  const brief = `
TSINAXA CGI RECOVERY INTELLIGENCE BRIEF

Recovery Posture:
${recovery.posture.posture}

Recovery Durability:
${recovery.durability.posture}

Recovery Reliability:
${recovery.reliabilityMeaning.posture}

Recovery Direction:
${recovery.directionMeaning.posture}

Stabilization Trend:
${recovery.trendMeaning.posture}

Survivability:
${recovery.survivabilityMeaning.posture}

Recovery Pressure:
${recovery.pressureMeaning.posture}

Volatility:
${recovery.volatilityMeaning.posture}

Continuity Drift:
${recovery.driftMeaning.posture}

Dominant Blocker:
${recovery.dominantBlocker}

Executive Interpretation:
${recovery.executiveSummary}

Recommended Action:
${recovery.actionCue}

Governance-Safe Meaning:
This recovery view interprets persisted continuity memory. It does not judge people. It asks whether stabilization is becoming durable recovery.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • RECOVERY INTELLIGENCE</p>
          <h1 style={styles.title}>Continuity Recovery Intelligence</h1>
          <p style={styles.subtitle}>
            Executive interpretation of whether stabilization is becoming durable recovery.
            Internal calculations stay hidden. Leadership sees posture, meaning, and action.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Recovery Posture</p>
            <h2 style={styles.heroPosture}>{recovery.posture.posture}</h2>
            <p style={styles.heroMeaning}>{recovery.executiveSummary}</p>
          </div>

          <div style={styles.actionBox}>
            <p style={styles.actionLabel}>Recommended Action</p>
            <p style={styles.actionText}>{recovery.actionCue}</p>
          </div>
        </section>

        <section style={styles.postureGrid}>
          <PostureCard title="Recovery Durability" interpretation={recovery.durability} />
          <PostureCard title="Recovery Reliability" interpretation={recovery.reliabilityMeaning} />
          <PostureCard title="Recovery Direction" interpretation={recovery.directionMeaning} />
          <PostureCard title="Stabilization Trend" interpretation={recovery.trendMeaning} />
          <PostureCard title="Survivability" interpretation={recovery.survivabilityMeaning} />
          <PostureCard title="Recovery Pressure" interpretation={recovery.pressureMeaning} />
        </section>

        <section style={styles.compactGrid}>
          <CompactCard title="History Depth" value={recovery.historyMeaning.posture} />
          <CompactCard title="Dominant Blocker" value={recovery.dominantBlocker} />
          <CompactCard title="Volatility" value={recovery.volatilityMeaning.posture} />
          <CompactCard title="Continuity Drift" value={recovery.driftMeaning.posture} />
        </section>

        <section style={styles.twoColumn}>
          <Panel title="Latest Recovery Context">
            <Info label="Continuity State" value={recovery.latest?.continuity_state || 'Not recorded'} />
            <Info label="Trajectory Direction" value={recovery.latest?.trajectory_direction || 'Not recorded'} />
            <Info label="Pressure State" value={recovery.latest?.pressure_propagation_state || 'Not recorded'} />
            <Info label="Structural Memory" value={recovery.latest?.structural_memory_state || 'Not recorded'} />
            <Info label="Dominant Pressure" value={recovery.latest?.dominant_pressure_source || 'Not recorded'} />
          </Panel>

          <Panel title="Interpretive Reading">
            <Info label="Recovery Volatility" value={recovery.volatilityMeaning.posture} />
            <Info label="Continuity Drift" value={recovery.driftMeaning.posture} />
            <Info label="Instability Burden" value={recovery.pressureMeaning.posture} />
            <Info label="Dominant Blocker" value={recovery.dominantBlocker} />
            <Info label="Current Reading" value={recovery.posture.posture} />
          </Panel>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Recent Recovery Memory Trail</h2>
              <p style={styles.cardNote}>
                Recent snapshots are displayed as threshold interpretations, not raw scores.
              </p>
            </div>

            <button onClick={loadRecoveryMetrics} style={styles.primaryButton}>
              Refresh
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Continuity</th>
                  <th style={styles.th}>Reliability</th>
                  <th style={styles.th}>Direction</th>
                  <th style={styles.th}>Trend</th>
                  <th style={styles.th}>Survivability</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No persisted recovery memory found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 8).map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{formatDate(item.created_at)}</td>
                    <td style={styles.td}>{item.continuity_state}</td>
                    <td style={styles.td}>
                      {interpretReliability(item.recovery_reliability_score).posture}
                    </td>
                    <td style={styles.td}>
                      {interpretDirection(item.recovery_direction - 50).posture}
                    </td>
                    <td style={styles.td}>
                      {interpretTrend(item.stabilization_trend).posture}
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
          <h2 style={styles.cardTitle}>Generated Recovery Brief</h2>
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
    ])
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
    'No dominant blocker detected'
  )
}

function getRecoveryState(input: {
  count: number
  conversion: number
  velocity: number
  volatility: number
  pressure: number
  latest: CgiOperationalMetric | null
}): RecoveryState {
  if (input.count < 3) return 'INSUFFICIENT_HISTORY'
  if (
    input.conversion >= 65 &&
    input.velocity >= 5 &&
    input.pressure < 40 &&
    input.volatility < 25
  ) {
    return 'RECOVERY_STRENGTHENING'
  }
  if (
    input.conversion < 35 ||
    input.velocity <= -10 ||
    input.pressure >= 65 ||
    input.latest?.continuity_state === 'UNSTABLE'
  ) {
    return 'RECOVERY_STALLED'
  }
  if (input.conversion < 50 || input.pressure >= 50 || input.volatility >= 25) {
    return 'RECOVERY_FRAGILE'
  }
  return 'RECOVERY_HOLDING'
}

function interpretRecoveryPosture(state: RecoveryState): Interpretation {
  if (state === 'INSUFFICIENT_HISTORY') {
    return {
      posture: 'INSUFFICIENT HISTORY',
      meaning: 'Recovery memory is not yet deep enough to judge durability.',
      action: 'Continue saving operational snapshots.',
    }
  }
  if (state === 'RECOVERY_STRENGTHENING') {
    return {
      posture: 'RECOVERY STRENGTHENING',
      meaning: 'Recovery signals are improving and stabilization credibility is rising.',
      action: 'Maintain monitoring and confirm survivability.',
    }
  }
  if (state === 'RECOVERY_STALLED') {
    return {
      posture: 'RECOVERY STALLED',
      meaning: 'Stabilization signals are not converting into durable recovery.',
      action: 'Escalate recovery review.',
    }
  }
  if (state === 'RECOVERY_FRAGILE') {
    return {
      posture: 'RECOVERY FRAGILE',
      meaning: 'Recovery exists, but unresolved instability may weaken durability.',
      action: 'Strengthen follow-up and monitoring.',
    }
  }
  return {
    posture: 'RECOVERY HOLDING',
    meaning: 'Recovery is visible and holding, but durability still requires confirmation.',
    action: 'Maintain monitoring.',
  }
}

function interpretDurability(score: number): Interpretation {
  if (score >= 70) {
    return {
      posture: 'DURABILITY IMPROVING',
      meaning: 'Recovery signals are converting into stronger stabilization credibility.',
      action: 'Confirm survivability before closure.',
    }
  }
  if (score >= 50) {
    return {
      posture: 'MONITORED RECOVERY',
      meaning: 'Recovery signals exist, but durability is not yet fully credible.',
      action: 'Maintain governed monitoring.',
    }
  }
  return {
    posture: 'DURABILITY NOT CREDIBLE',
    meaning: 'Recovery evidence is too weak to treat stabilization as durable.',
    action: 'Escalate recovery review.',
  }
}

function interpretReliability(score: number): Interpretation {
  if (score >= 70) {
    return {
      posture: 'RELIABILITY STRENGTHENING',
      meaning: 'Recovery reliability is moving toward a credible holding pattern.',
      action: 'Preserve current recovery discipline.',
    }
  }
  if (score >= 45) {
    return {
      posture: 'RELIABILITY HOLDING',
      meaning: 'Reliability exists, but still needs confirmation before closure is trusted.',
      action: 'Watch for recurrence.',
    }
  }
  return {
    posture: 'RELIABILITY WEAK',
    meaning: 'Reliability is not strong enough to support durable stabilization.',
    action: 'Review ownership and follow-through.',
  }
}

function interpretDirection(value: number): Interpretation {
  if (value >= 10) {
    return {
      posture: 'MOVING FORWARD',
      meaning: 'Recovery direction is improving.',
      action: 'Protect the recovery pathway.',
    }
  }
  if (value <= -10) {
    return {
      posture: 'LOSING GROUND',
      meaning: 'Recovery direction is weakening.',
      action: 'Investigate drift and recurrence.',
    }
  }
  return {
    posture: 'DIRECTION HOLDING',
    meaning: 'Recovery is neither clearly improving nor collapsing.',
    action: 'Continue monitoring.',
  }
}

function interpretTrend(score: number): Interpretation {
  if (score >= 70) {
    return {
      posture: 'STRENGTHENING',
      meaning: 'Stabilization signals are becoming more credible.',
      action: 'Validate survivability.',
    }
  }
  if (score >= 45) {
    return {
      posture: 'FRAGILE',
      meaning: 'Improvement exists, but durability is not yet certain.',
      action: 'Keep recovery monitoring active.',
    }
  }
  return {
    posture: 'WEAK',
    meaning: 'Stabilization signals remain weak.',
    action: 'Review unresolved barriers.',
  }
}

function interpretSurvivability(score: number): Interpretation {
  if (score >= 70) {
    return {
      posture: 'SURVIVABILITY IMPROVING',
      meaning: 'The recovery pathway is showing stronger durability.',
      action: 'Maintain confirmation monitoring.',
    }
  }
  if (score >= 45) {
    return {
      posture: 'SURVIVABILITY MONITORED',
      meaning: 'Survivability exists but remains under review.',
      action: 'Do not assume closure.',
    }
  }
  return {
    posture: 'SURVIVABILITY AT RISK',
    meaning: 'Recovery may not survive continued pressure.',
    action: 'Escalate survivability review.',
  }
}

function interpretPressure(score: number): Interpretation {
  if (score >= 65) {
    return {
      posture: 'HIGH RECOVERY PRESSURE',
      meaning: 'Structural friction threatens recovery durability.',
      action: 'Escalate pressure review.',
    }
  }
  if (score >= 35) {
    return {
      posture: 'MODERATE FRICTION',
      meaning: 'Unresolved stabilization drag remains visible.',
      action: 'Reduce recovery blockers.',
    }
  }
  return {
    posture: 'PRESSURE CONTAINED',
    meaning: 'Recovery pressure appears contained.',
    action: 'Continue routine monitoring.',
  }
}

function interpretVolatility(score: number): Interpretation {
  if (score >= 35) {
    return {
      posture: 'VOLATILE',
      meaning: 'Recovery movement is fluctuating enough to weaken confidence.',
      action: 'Extend monitoring.',
    }
  }
  if (score >= 18) {
    return {
      posture: 'CONTAINED VARIATION',
      meaning: 'Recovery varies, but not enough to indicate collapse.',
      action: 'Watch for repeated instability.',
    }
  }
  return {
    posture: 'CONSISTENT',
    meaning: 'Recovery movement appears steady.',
    action: 'Maintain confirmation monitoring.',
  }
}

function interpretDrift(score: number): Interpretation {
  if (score >= 55) {
    return {
      posture: 'DRIFT RISING',
      meaning: 'Continuity drift is becoming more visible.',
      action: 'Review drift sources.',
    }
  }
  if (score >= 25) {
    return {
      posture: 'DRIFT UNDER WATCH',
      meaning: 'Some drift is visible and must remain under review.',
      action: 'Keep drift visible.',
    }
  }
  return {
    posture: 'DRIFT CONTAINED',
    meaning: 'Continuity drift is currently contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretHistory(count: number): Interpretation {
  if (count < 3) {
    return {
      posture: 'INSUFFICIENT HISTORY',
      meaning: 'Too few snapshots exist for recovery interpretation.',
      action: 'Continue saving snapshots.',
    }
  }
  if (count < 10) {
    return {
      posture: 'EARLY HISTORY',
      meaning: 'Recovery interpretation has started, but memory remains young.',
      action: 'Build continuity memory.',
    }
  }
  return {
    posture: 'MEMORY ESTABLISHED',
    meaning: 'Persisted memory is sufficient for recovery interpretation.',
    action: 'Use posture to guide review.',
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
    color: '#67e8f9',
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
    background: '#064e3b',
    color: '#bbf7d0',
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
    border: '1px solid #22c55e',
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
    color: '#86efac',
    letterSpacing: '-0.05em',
    lineHeight: 1,
  },
  heroMeaning: {
    color: '#dbeafe',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '720px',
  },
  actionBox: {
    background: '#052e16',
    border: '1px solid #22c55e',
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },
  actionLabel: {
    color: '#86efac',
    fontWeight: 900,
    margin: '0 0 8px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  actionText: {
    color: '#dcfce7',
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
    background: '#67e8f9',
    color: '#082f49',
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