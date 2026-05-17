'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { interpretPredictive } from '@/lib/cgi/interpreters/interpretPredictive'
import { supabase } from '../../lib/supabase'

type CgiOperationalMetric = {
  id: string
  created_at: string
  scope: string
  continuity_state: string
  pressure_propagation_state: string
  trajectory_direction: string
  structural_memory_state: string
  propagation_risk: number
  trajectory_risk: number
  structural_memory_risk: number
  unresolved_momentum: number
  stabilization_drag: number
  continuity_drift: number
  escalation_pressure_index: number
  operational_survivability_score: number
  recovery_reliability_score: number
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

  const predictive = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    )

    const latest = ordered[ordered.length - 1] || null

    const propagationRisk = average(
      ordered.map((item) => item.propagation_risk)
    )

    const trajectoryRisk = average(
      ordered.map((item) => item.trajectory_risk)
    )

    const structuralMemoryRisk = average(
      ordered.map((item) => item.structural_memory_risk)
    )

    const unresolvedMomentum = average(
      ordered.map((item) => item.unresolved_momentum)
    )

    const stabilizationDrag = average(
      ordered.map((item) => item.stabilization_drag)
    )

    const continuityDrift = average(
      ordered.map((item) => item.continuity_drift)
    )

    const escalationPressure = average(
      ordered.map((item) => item.escalation_pressure_index)
    )

    const survivabilityWeakness =
      100 -
      average(
        ordered.map((item) => item.operational_survivability_score)
      )

    const reliabilityWeakness =
      100 -
      average(
        ordered.map((item) => item.recovery_reliability_score)
      )

    const predictiveInterpretation = interpretPredictive({
      propagationRisk,
      trajectoryRisk,
      structuralMemoryRisk,
      unresolvedMomentum,
      stabilizationDrag,
    })

    const propagationMeaning = interpretRisk(
      propagationRisk,
      'PROPAGATION'
    )

    const trajectoryMeaning = interpretRisk(
      trajectoryRisk,
      'TRAJECTORY'
    )

    const memoryMeaning = interpretRisk(
      structuralMemoryRisk,
      'MEMORY'
    )

    const unresolvedMeaning = interpretMomentum(unresolvedMomentum)

    const dragMeaning = interpretDrag(stabilizationDrag)

    const driftMeaning = interpretDrift(continuityDrift)

    const survivabilityMeaning = interpretWeakness(
      survivabilityWeakness,
      'SURVIVABILITY'
    )

    const reliabilityMeaning = interpretWeakness(
      reliabilityWeakness,
      'RELIABILITY'
    )

    const pressureMeaning = interpretPressure(escalationPressure)

    const historyMeaning = interpretHistory(ordered.length)

    const dominantForecastDriver = strongestDriver({
      'Propagation risk': propagationRisk,
      'Trajectory risk': trajectoryRisk,
      'Structural memory risk': structuralMemoryRisk,
      'Unresolved momentum': unresolvedMomentum,
      'Stabilization drag': stabilizationDrag,
      'Continuity drift': continuityDrift,
      'Escalation pressure': escalationPressure,
      'Survivability weakness': survivabilityWeakness,
      'Reliability weakness': reliabilityWeakness,
    })

    const executiveSummary = `${predictiveInterpretation.summary} Dominant forecast driver: ${dominantForecastDriver}. ${propagationMeaning.meaning} ${memoryMeaning.meaning}`

    const actionCue = compactAction([
      predictiveInterpretation.executiveAction,
      propagationMeaning.action,
      unresolvedMeaning.action,
      dragMeaning.action,
    ])

    return {
      latest,
      predictiveInterpretation,
      propagationMeaning,
      trajectoryMeaning,
      memoryMeaning,
      unresolvedMeaning,
      dragMeaning,
      driftMeaning,
      survivabilityMeaning,
      reliabilityMeaning,
      pressureMeaning,
      historyMeaning,
      dominantForecastDriver,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

  const brief = `
TSINAXA CGI PREDICTIVE INTELLIGENCE BRIEF

Predictive Posture:
${predictive.predictiveInterpretation.posture}

Propagation Risk:
${predictive.propagationMeaning.posture}

Trajectory Risk:
${predictive.trajectoryMeaning.posture}

Structural Memory Risk:
${predictive.memoryMeaning.posture}

Unresolved Momentum:
${predictive.unresolvedMeaning.posture}

Stabilization Drag:
${predictive.dragMeaning.posture}

Continuity Drift:
${predictive.driftMeaning.posture}

Survivability Weakness:
${predictive.survivabilityMeaning.posture}

Reliability Weakness:
${predictive.reliabilityMeaning.posture}

Dominant Forecast Driver:
${predictive.dominantForecastDriver}

Executive Interpretation:
${predictive.executiveSummary}

Recommended Action:
${predictive.actionCue}

Governance-Safe Meaning:
This predictive view interprets continuity risk before disruption becomes fully visible. It does not judge people. It preserves early-warning visibility for executive prevention.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • PREDICTIVE INTELLIGENCE</p>

          <h1 style={styles.title}>Continuity Predictive Intelligence</h1>

          <p style={styles.subtitle}>
            Executive early-warning interpretation of whether continuity risk is
            low, watched, elevated, or critical before disruption becomes fully visible.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Predictive Posture</p>

            <h2 style={styles.heroPosture}>
              {predictive.predictiveInterpretation.posture}
            </h2>

            <p style={styles.heroMeaning}>
              {predictive.executiveSummary}
            </p>
          </div>

          <div style={styles.actionBox}>
            <p style={styles.actionLabel}>Recommended Action</p>

            <p style={styles.actionText}>
              {predictive.actionCue}
            </p>
          </div>
        </section>

        <section style={styles.postureGrid}>
          <PostureCard title="Propagation Risk" interpretation={predictive.propagationMeaning} />
          <PostureCard title="Trajectory Risk" interpretation={predictive.trajectoryMeaning} />
          <PostureCard title="Structural Memory Risk" interpretation={predictive.memoryMeaning} />
          <PostureCard title="Unresolved Momentum" interpretation={predictive.unresolvedMeaning} />
          <PostureCard title="Stabilization Drag" interpretation={predictive.dragMeaning} />
          <PostureCard title="Continuity Drift" interpretation={predictive.driftMeaning} />
        </section>

        <section style={styles.compactGrid}>
          <CompactCard title="History Depth" value={predictive.historyMeaning.posture} />
          <CompactCard title="Dominant Forecast Driver" value={predictive.dominantForecastDriver} />
          <CompactCard title="Survivability Weakness" value={predictive.survivabilityMeaning.posture} />
          <CompactCard title="Reliability Weakness" value={predictive.reliabilityMeaning.posture} />
        </section>

        <section style={styles.twoColumn}>
          <Panel title="Latest Predictive Context">
            <Info label="Continuity State" value={predictive.latest?.continuity_state || 'Not recorded'} />
            <Info label="Pressure State" value={predictive.latest?.pressure_propagation_state || 'Not recorded'} />
            <Info label="Trajectory Direction" value={predictive.latest?.trajectory_direction || 'Not recorded'} />
            <Info label="Structural Memory" value={predictive.latest?.structural_memory_state || 'Not recorded'} />
            <Info label="Dominant Memory Pattern" value={predictive.latest?.dominant_memory_pattern || 'Not recorded'} />
          </Panel>

          <Panel title="Forecast Reading">
            <Info label="Predictive Posture" value={predictive.predictiveInterpretation.posture} />
            <Info label="Pressure Reading" value={predictive.pressureMeaning.posture} />
            <Info label="Dominant Forecast Driver" value={predictive.dominantForecastDriver} />
            <Info label="Unresolved Momentum" value={predictive.unresolvedMeaning.posture} />
            <Info label="Stabilization Drag" value={predictive.dragMeaning.posture} />
          </Panel>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Recent Predictive Memory Trail</h2>

              <p style={styles.cardNote}>
                Recent snapshots are displayed as predictive postures, not raw scores.
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
                  <th style={styles.th}>Predictive</th>
                  <th style={styles.th}>Propagation</th>
                  <th style={styles.th}>Trajectory</th>
                  <th style={styles.th}>Memory</th>
                  <th style={styles.th}>Drag</th>
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

                {metrics.slice(0, 8).map((item) => {
                  const rowPredictive = interpretPredictive({
                    propagationRisk: item.propagation_risk,
                    trajectoryRisk: item.trajectory_risk,
                    structuralMemoryRisk: item.structural_memory_risk,
                    unresolvedMomentum: item.unresolved_momentum,
                    stabilizationDrag: item.stabilization_drag,
                  })

                  return (
                    <tr key={item.id}>
                      <td style={styles.td}>{formatDate(item.created_at)}</td>
                      <td style={styles.td}>{rowPredictive.posture}</td>
                      <td style={styles.td}>{interpretRisk(item.propagation_risk, 'PROPAGATION').posture}</td>
                      <td style={styles.td}>{interpretRisk(item.trajectory_risk, 'TRAJECTORY').posture}</td>
                      <td style={styles.td}>{interpretRisk(item.structural_memory_risk, 'MEMORY').posture}</td>
                      <td style={styles.td}>{interpretDrag(item.stabilization_drag).posture}</td>
                    </tr>
                  )
                })}
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

  return Math.round(
    valid.reduce((sum, value) => sum + value, 0) / valid.length
  )
}

function strongestDriver(scores: Record<string, number>) {
  return (
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No dominant forecast driver detected'
  )
}

function interpretRisk(value: number, label: string): Interpretation {
  if (value >= 70) {
    return {
      posture: `${label} RISK HIGH`,
      meaning: `${label.toLowerCase()} risk is high enough to threaten continuity stability.`,
      action: `Escalate ${label.toLowerCase()} risk review.`,
    }
  }

  if (value >= 45) {
    return {
      posture: `${label} RISK VISIBLE`,
      meaning: `${label.toLowerCase()} risk is visible and should remain under review.`,
      action: `Keep ${label.toLowerCase()} risk visible.`,
    }
  }

  return {
    posture: `${label} RISK CONTAINED`,
    meaning: `${label.toLowerCase()} risk appears contained.`,
    action: 'Maintain monitoring.',
  }
}

function interpretMomentum(value: number): Interpretation {
  if (value >= 65) {
    return {
      posture: 'UNRESOLVED MOMENTUM HIGH',
      meaning: 'Unresolved momentum may convert forecast risk into visible disruption.',
      action: 'Escalate unresolved momentum review.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'UNRESOLVED MOMENTUM VISIBLE',
      meaning: 'Unresolved momentum remains visible in continuity memory.',
      action: 'Keep follow-up active.',
    }
  }

  return {
    posture: 'UNRESOLVED MOMENTUM CONTAINED',
    meaning: 'Unresolved momentum appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretDrag(value: number): Interpretation {
  if (value >= 65) {
    return {
      posture: 'STABILIZATION DRAG HIGH',
      meaning: 'Stabilization drag may delay prevention and recovery credibility.',
      action: 'Escalate stabilization drag review.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'STABILIZATION DRAG VISIBLE',
      meaning: 'Stabilization drag remains visible and should stay under review.',
      action: 'Keep drag visible until recovery holds.',
    }
  }

  return {
    posture: 'STABILIZATION DRAG CONTAINED',
    meaning: 'Stabilization drag appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretDrift(value: number): Interpretation {
  if (value >= 60) {
    return {
      posture: 'CONTINUITY DRIFT HIGH',
      meaning: 'Continuity drift may undermine prevention credibility.',
      action: 'Escalate continuity drift review.',
    }
  }

  if (value >= 35) {
    return {
      posture: 'CONTINUITY DRIFT VISIBLE',
      meaning: 'Continuity drift remains visible and must stay under governance review.',
      action: 'Keep drift visible.',
    }
  }

  return {
    posture: 'CONTINUITY DRIFT CONTAINED',
    meaning: 'Continuity drift is currently contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretWeakness(value: number, label: string): Interpretation {
  if (value >= 60) {
    return {
      posture: `${label} WEAKNESS HIGH`,
      meaning: `${label.toLowerCase()} weakness may undermine continuity prevention.`,
      action: `Escalate ${label.toLowerCase()} weakness review.`,
    }
  }

  if (value >= 35) {
    return {
      posture: `${label} WEAKNESS VISIBLE`,
      meaning: `${label.toLowerCase()} weakness remains visible.`,
      action: `Keep ${label.toLowerCase()} weakness under review.`,
    }
  }

  return {
    posture: `${label} WEAKNESS CONTAINED`,
    meaning: `${label.toLowerCase()} weakness appears contained.`,
    action: 'Maintain monitoring.',
  }
}

function interpretPressure(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'PRESSURE HIGH',
      meaning: 'Escalation pressure may accelerate continuity disruption.',
      action: 'Escalate pressure review.',
    }
  }

  if (value >= 45) {
    return {
      posture: 'PRESSURE VISIBLE',
      meaning: 'Escalation pressure is visible and should remain under review.',
      action: 'Keep pressure visible.',
    }
  }

  return {
    posture: 'PRESSURE CONTAINED',
    meaning: 'Escalation pressure appears contained.',
    action: 'Maintain monitoring.',
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
      posture: 'EARLY PREDICTIVE MEMORY',
      meaning: 'Predictive memory has started but remains early.',
      action: 'Continue building continuity memory.',
    }
  }

  return {
    posture: 'PREDICTIVE MEMORY ESTABLISHED',
    meaning: 'Persisted memory supports predictive interpretation.',
    action: 'Use posture to guide prevention review.',
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
    color: '#f472b6',
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
    background: '#500724',
    color: '#fce7f3',
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
    border: '1px solid #f472b6',
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
    color: '#f9a8d4',
    letterSpacing: '-0.05em',
    lineHeight: 1,
  },
  heroMeaning: {
    color: '#fce7f3',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '720px',
  },
  actionBox: {
    background: '#500724',
    border: '1px solid #f472b6',
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },
  actionLabel: {
    color: '#f9a8d4',
    fontWeight: 900,
    margin: '0 0 8px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  actionText: {
    color: '#fce7f3',
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
    background: '#f472b6',
    color: '#500724',
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