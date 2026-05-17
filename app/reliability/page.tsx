'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

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
  unresolved_momentum: number
  stabilization_drag: number
  continuity_drift: number
  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
}

type Interpretation = {
  posture: string
  meaning: string
  action: string
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
    setMessage('Loading reliability intelligence...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Reliability intelligence could not be loaded.')
      return
    }

    setMetrics(data || [])
    setMessage('Reliability intelligence loaded.')
  }

  const intelligence = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    )

    const latest = ordered[ordered.length - 1] || null

    const reliability = average(
      ordered.map((item) => item.recovery_reliability_score)
    )

    const survivability = average(
      ordered.map((item) => item.operational_survivability_score)
    )

    const continuity = average(
      ordered.map((item) => item.continuity_integrity_score)
    )

    const pressure = average(
      ordered.map((item) => item.escalation_pressure_index)
    )

    const trajectory = average(
      ordered.map((item) => item.trajectory_risk)
    )

    const memoryRisk = average(
      ordered.map((item) => item.structural_memory_risk)
    )

    const drift = average(
      ordered.map((item) => item.continuity_drift)
    )

    const unresolved = average(
      ordered.map((item) => item.unresolved_momentum)
    )

    const volatility = calculateVolatility(
      ordered.map((item) => item.recovery_reliability_score)
    )

    const reliabilityPosture = interpretReliabilityPosture({
      reliability,
      survivability,
      continuity,
      pressure,
      trajectory,
      memoryRisk,
    })

    const survivabilityMeaning = interpretSurvivability(survivability)
    const continuityMeaning = interpretContinuity(continuity)
    const driftMeaning = interpretDrift(drift)
    const unresolvedMeaning = interpretUnresolved(unresolved)
    const volatilityMeaning = interpretVolatility(volatility)
    const historyDepth = interpretHistory(ordered.length)

    const dominantWeakness = strongestDriver({
      'Reliability weakness': 100 - reliability,
      'Survivability weakness': 100 - survivability,
      'Pressure instability': pressure,
      'Trajectory instability': trajectory,
      'Structural memory instability': memoryRisk,
      'Continuity drift': drift,
      'Unresolved instability': unresolved,
    })

    const executiveSummary = compactAction([
      reliabilityPosture.meaning,
      'Structural friction and unresolved instability remain visible under executive review.',
    ])

    const actionCue = compactAction([
      reliabilityPosture.action,
      driftMeaning.action,
      unresolvedMeaning.action,
    ])

    return {
      latest,
      reliabilityPosture,
      survivabilityMeaning,
      continuityMeaning,
      driftMeaning,
      unresolvedMeaning,
      volatilityMeaning,
      historyDepth,
      dominantWeakness,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

  const brief = `
TSINAXA CGI RELIABILITY INTELLIGENCE BRIEF

Reliability Posture:
${intelligence.reliabilityPosture.posture}

Survivability:
${intelligence.survivabilityMeaning.posture}

Continuity Integrity:
${intelligence.continuityMeaning.posture}

Continuity Drift:
${intelligence.driftMeaning.posture}

Unresolved Stability Pressure:
${intelligence.unresolvedMeaning.posture}

Reliability Volatility:
${intelligence.volatilityMeaning.posture}

Dominant Reliability Threat:
${intelligence.dominantWeakness}

Executive Interpretation:
${intelligence.executiveSummary}

Recommended Action:
${intelligence.actionCue}

Governance-Safe Meaning:
This reliability view interprets persisted continuity memory. It does not judge people. It evaluates whether stabilization is becoming dependable across time.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>
            TSINAXA CGI • RELIABILITY INTELLIGENCE
          </p>

          <h1 style={styles.title}>
            Continuity Reliability Intelligence
          </h1>

          <p style={styles.subtitle}>
            Executive interpretation of whether continuity stabilization is
            becoming dependable, unstable, fragile, or deteriorating across
            persisted memory.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Reliability Posture</p>

            <h2 style={styles.heroPosture}>
              {intelligence.reliabilityPosture.posture}
            </h2>

            <p style={styles.heroMeaning}>{intelligence.executiveSummary}</p>
          </div>

          <div style={styles.actionBox}>
            <p style={styles.actionLabel}>Recommended Action</p>
            <p style={styles.actionText}>{intelligence.actionCue}</p>
          </div>
        </section>

        <section style={styles.postureGrid}>
          <PostureCard title="Survivability" interpretation={intelligence.survivabilityMeaning} />
          <PostureCard title="Continuity Integrity" interpretation={intelligence.continuityMeaning} />
          <PostureCard title="Continuity Drift" interpretation={intelligence.driftMeaning} />
          <PostureCard title="Unresolved Stability Pressure" interpretation={intelligence.unresolvedMeaning} />
          <PostureCard title="Reliability Volatility" interpretation={intelligence.volatilityMeaning} />
          <PostureCard title="Memory Depth" interpretation={intelligence.historyDepth} />
        </section>

        <section style={styles.compactGrid}>
          <CompactCard title="Dominant Reliability Threat" value={intelligence.dominantWeakness} />
          <CompactCard title="Current Reliability" value={intelligence.reliabilityPosture.posture} />
          <CompactCard title="Current Drift" value={intelligence.driftMeaning.posture} />
          <CompactCard title="Current Survivability" value={intelligence.survivabilityMeaning.posture} />
        </section>

        <section style={styles.twoColumn}>
          <Panel title="Latest Reliability Context">
            <Info label="Continuity State" value={intelligence.latest?.continuity_state || 'Not recorded'} />
            <Info label="Pressure State" value={intelligence.latest?.pressure_propagation_state || 'Not recorded'} />
            <Info label="Trajectory Direction" value={intelligence.latest?.trajectory_direction || 'Not recorded'} />
            <Info label="Structural Memory" value={intelligence.latest?.structural_memory_state || 'Not recorded'} />
            <Info label="Dominant Pressure" value={intelligence.latest?.dominant_pressure_source || 'Not recorded'} />
          </Panel>

          <Panel title="Dependability Reading">
            <Info label="Reliability" value={intelligence.reliabilityPosture.posture} />
            <Info label="Survivability" value={intelligence.survivabilityMeaning.posture} />
            <Info label="Volatility" value={intelligence.volatilityMeaning.posture} />
            <Info label="Dominant Threat" value={intelligence.dominantWeakness} />
            <Info label="Drift" value={intelligence.driftMeaning.posture} />
          </Panel>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Recent Reliability Memory</h2>

              <p style={styles.cardNote}>
                Recent snapshots are displayed as reliability posture memory,
                not raw scoring.
              </p>
            </div>

            <button onClick={loadReliabilityMetrics} style={styles.primaryButton}>
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
                  <th style={styles.th}>Survivability</th>
                  <th style={styles.th}>Pressure</th>
                  <th style={styles.th}>Drift</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No persisted reliability memory found yet.
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
                      {interpretSurvivability(item.operational_survivability_score).posture}
                    </td>
                    <td style={styles.td}>
                      {
                        interpretReliabilityPosture({
                          reliability: item.recovery_reliability_score,
                          survivability: item.operational_survivability_score,
                          continuity: item.continuity_integrity_score,
                          pressure: item.escalation_pressure_index,
                          trajectory: item.trajectory_risk,
                          memoryRisk: item.structural_memory_risk,
                        }).posture
                      }
                    </td>
                    <td style={styles.td}>
                      {interpretDrift(item.continuity_drift).posture}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Generated Reliability Brief</h2>
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
    'No dominant reliability threat detected'
  )
}

function interpretReliabilityPosture(input: {
  reliability: number
  survivability: number
  continuity: number
  pressure: number
  trajectory: number
  memoryRisk: number
}): Interpretation {
  const instability = average([
    input.pressure,
    input.trajectory,
    input.memoryRisk,
    100 - input.reliability,
    100 - input.survivability,
    100 - input.continuity,
  ])

  if (
    input.reliability >= 75 &&
    input.survivability >= 75 &&
    input.continuity >= 70 &&
    instability < 35
  ) {
    return {
      posture: 'RELIABILITY STRENGTHENING',
      meaning:
        'Continuity stabilization is becoming dependable across persisted memory.',
      action:
        'Maintain stabilization discipline and confirm durability before closure.',
    }
  }

  if (
    input.reliability < 40 ||
    input.survivability < 40 ||
    instability >= 70
  ) {
    return {
      posture: 'RELIABILITY DETERIORATING',
      meaning:
        'Reliability is weakening and may not support durable stabilization.',
      action:
        'Escalate reliability review and inspect survivability weakness.',
    }
  }

  if (instability >= 50 || input.reliability < 55) {
    return {
      posture: 'RELIABILITY UNSTABLE',
      meaning:
        'Reliability remains unstable and should not support closure yet.',
      action:
        'Review unresolved instability and strengthen stabilization follow-through.',
    }
  }

  return {
    posture: 'RELIABILITY HOLDING',
    meaning:
      'Reliability is holding but durability is not yet fully credible.',
    action:
      'Maintain governed reliability monitoring and preserve continuity memory.',
  }
}

function interpretReliability(value: number): Interpretation {
  if (value >= 75) {
    return {
      posture: 'RELIABILITY STRENGTHENING',
      meaning: 'Reliability is moving toward dependable continuity.',
      action: 'Preserve current operating discipline.',
    }
  }

  if (value >= 55) {
    return {
      posture: 'RELIABILITY HOLDING',
      meaning: 'Reliability exists but still requires durability confirmation.',
      action: 'Keep monitoring active.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'RELIABILITY UNSTABLE',
      meaning: 'Reliability is visible but vulnerable to instability.',
      action: 'Review unresolved barriers.',
    }
  }

  return {
    posture: 'RELIABILITY DETERIORATING',
    meaning: 'Reliability is too weak to support durable continuity.',
    action: 'Escalate reliability review.',
  }
}

function interpretSurvivability(value: number): Interpretation {
  if (value >= 75) {
    return {
      posture: 'SURVIVABILITY IMPROVING',
      meaning: 'The continuity pathway is showing stronger durability.',
      action: 'Maintain survivability monitoring.',
    }
  }

  if (value >= 55) {
    return {
      posture: 'SURVIVABILITY MONITORED',
      meaning: 'Survivability exists but remains under review.',
      action: 'Do not assume closure.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'SURVIVABILITY FRAGILE',
      meaning: 'Survivability may weaken under continued pressure.',
      action: 'Continue governed review.',
    }
  }

  return {
    posture: 'SURVIVABILITY DETERIORATING',
    meaning: 'Survivability is not credible enough for closure.',
    action: 'Escalate survivability review.',
  }
}

function interpretContinuity(value: number): Interpretation {
  if (value >= 75) {
    return {
      posture: 'CONTINUITY HOLDING',
      meaning: 'Continuity integrity is holding strongly.',
      action: 'Maintain confirmation monitoring.',
    }
  }

  if (value >= 55) {
    return {
      posture: 'CONTINUITY MONITORED',
      meaning: 'Continuity is present but still requires review.',
      action: 'Continue monitoring.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'CONTINUITY FRAGILE',
      meaning: 'Continuity may weaken if unresolved pressure persists.',
      action: 'Review drift and pressure.',
    }
  }

  return {
    posture: 'CONTINUITY DETERIORATING',
    meaning: 'Continuity integrity is weakening.',
    action: 'Escalate continuity review.',
  }
}

function interpretDrift(value: number): Interpretation {
  if (value >= 60) {
    return {
      posture: 'SEVERE CONTINUITY DRIFT',
      meaning: 'Continuity drift is strong enough to threaten reliability.',
      action: 'Escalate drift review.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'DRIFT UNDER WATCH',
      meaning: 'Continuity drift is visible and must remain under review.',
      action: 'Keep drift visible.',
    }
  }

  return {
    posture: 'DRIFT CONTAINED',
    meaning: 'Continuity drift is currently contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretUnresolved(value: number): Interpretation {
  if (value >= 65) {
    return {
      posture: 'HEAVY UNRESOLVED STABILITY PRESSURE',
      meaning: 'Unresolved pressure may undermine dependability.',
      action: 'Escalate unresolved pressure review.',
    }
  }

  if (value >= 45) {
    return {
      posture: 'UNRESOLVED STABILITY PRESSURE VISIBLE',
      meaning: 'Unresolved stability pressure remains visible.',
      action: 'Keep ownership and follow-up active.',
    }
  }

  return {
    posture: 'UNRESOLVED PRESSURE CONTAINED',
    meaning: 'Unresolved stability pressure appears contained.',
    action: 'Continue monitoring.',
  }
}

function interpretVolatility(value: number): Interpretation {
  if (value >= 30) {
    return {
      posture: 'RELIABILITY VOLATILE',
      meaning: 'Reliability movement is fluctuating too much for confidence.',
      action: 'Extend monitoring.',
    }
  }

  if (value >= 18) {
    return {
      posture: 'VARIATION CONTAINED',
      meaning: 'Variation exists but is not showing collapse.',
      action: 'Watch for repeated instability.',
    }
  }

  return {
    posture: 'RELIABILITY MOVEMENT STABLE',
    meaning: 'Reliability movement appears steady.',
    action: 'Maintain confirmation monitoring.',
  }
}

function interpretHistory(count: number): Interpretation {
  if (count < 3) {
    return {
      posture: 'INSUFFICIENT MEMORY',
      meaning: 'Too few snapshots exist for reliability interpretation.',
      action: 'Continue saving operational snapshots.',
    }
  }

  if (count < 10) {
    return {
      posture: 'EARLY MEMORY',
      meaning: 'Reliability memory has started but remains young.',
      action: 'Continue building continuity memory.',
    }
  }

  return {
    posture: 'MEMORY ESTABLISHED',
    meaning: 'Persisted memory supports reliability interpretation.',
    action: 'Use posture to guide review.',
  }
}

function compactAction(actions: string[]) {
  return Array.from(new Set(actions.filter(Boolean))).join(' ')
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
  children: ReactNode
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