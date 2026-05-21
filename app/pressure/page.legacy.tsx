'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { interpretPressure } from '@/lib/cgi/interpreters/interpretPressure'
import { supabase } from '../../lib/supabase'

type CgiOperationalMetric = {
  id: string
  created_at: string
  scope: string

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
    setMessage('Loading pressure intelligence...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Pressure intelligence could not be loaded.')
      return
    }

    setMetrics(data || [])
    setMessage('Pressure intelligence loaded.')
  }

  const pressure = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    )

    const latest = ordered[ordered.length - 1] || null

    const escalation = average(
      ordered.map((item) => item.escalation_pressure_index)
    )

    const propagation = average(
      ordered.map((item) => item.propagation_risk)
    )

    const routing = average(
      ordered.map((item) => item.routing_friction)
    )

    const responder = average(
      ordered.map((item) => item.responder_pressure)
    )

    const velocity = average(
      ordered.map((item) => item.escalation_velocity)
    )

    const coordination = average(
      ordered.map((item) => item.coordination_instability)
    )

    const drag = average(
      ordered.map((item) => item.stabilization_drag)
    )

    const recoveryReliability = average(
      ordered.map((item) => item.recovery_reliability_score)
    )

    const survivability = average(
      ordered.map((item) => item.operational_survivability_score)
    )

    const pressureInterpretation = interpretPressure({
      escalationPressure: escalation,
      propagationRisk: propagation,
      unresolvedMomentum: average([
        responder,
        coordination,
        velocity,
      ]),
      continuityDrift: drag,
    })

    const spread = average([
      propagation,
      coordination,
      velocity,
      drag,
    ])

    const containment = clamp(
      recoveryReliability * 0.35 +
        survivability * 0.35 +
        (100 - escalation) * 0.3
    )

    const volatility = calculateVolatility(
      ordered.map((item) =>
        average([
          item.escalation_pressure_index,
          item.propagation_risk,
          item.routing_friction,
          item.responder_pressure,
          item.escalation_velocity,
          item.coordination_instability,
          item.stabilization_drag,
        ])
      )
    )

    const dominantDriver = strongestDriver({
      'Escalation pressure': escalation,
      'Propagation risk': propagation,
      'Routing friction': routing,
      'Responder pressure': responder,
      'Escalation velocity': velocity,
      'Coordination instability': coordination,
      'Stabilization drag': drag,
    })

    const loadMeaning = interpretPressureLoad(escalation)
    const spreadMeaning = interpretSpread(spread)
    const containmentMeaning = interpretContainment(containment)
    const volatilityMeaning = interpretVolatility(volatility)
    const routingMeaning = interpretRouting(routing)
    const responderMeaning = interpretResponder(responder)
    const dragMeaning = interpretDrag(drag)
    const historyDepth = interpretHistory(ordered.length)

    return {
      latest,
      pressureInterpretation,
      loadMeaning,
      spreadMeaning,
      containmentMeaning,
      volatilityMeaning,
      routingMeaning,
      responderMeaning,
      dragMeaning,
      historyDepth,
      dominantDriver,
    }
  }, [metrics])

  const brief = `
TSINAXA CGI PRESSURE INTELLIGENCE BRIEF

Pressure Posture:
${pressure.pressureInterpretation.posture}

Pressure Load:
${pressure.loadMeaning.posture}

Pressure Spread:
${pressure.spreadMeaning.posture}

Pressure Containment:
${pressure.containmentMeaning.posture}

Pressure Volatility:
${pressure.volatilityMeaning.posture}

Routing Friction:
${pressure.routingMeaning.posture}

Responder Pressure:
${pressure.responderMeaning.posture}

Stabilization Drag:
${pressure.dragMeaning.posture}

Dominant Pressure Driver:
${pressure.dominantDriver}

Executive Interpretation:
${pressure.pressureInterpretation.summary}

Recommended Action:
${pressure.pressureInterpretation.executiveAction}

Governance-Safe Meaning:
This pressure view interprets persisted continuity memory. It does not judge people. It asks whether pressure is contained, building, spreading, or becoming critical across the system.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>
            TSINAXA CGI • PRESSURE INTELLIGENCE
          </p>

          <h1 style={styles.title}>
            Continuity Pressure Intelligence
          </h1>

          <p style={styles.subtitle}>
            Executive interpretation of whether operational pressure is contained,
            building, spreading, or threatening stabilization credibility.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Pressure Posture</p>

            <h2 style={styles.heroPosture}>
              {pressure.pressureInterpretation.posture}
            </h2>

            <p style={styles.heroMeaning}>
              {pressure.pressureInterpretation.summary}
            </p>
          </div>

          <div style={styles.actionBox}>
            <p style={styles.actionLabel}>Recommended Action</p>

            <p style={styles.actionText}>
              {pressure.pressureInterpretation.executiveAction}
            </p>
          </div>
        </section>

        <section style={styles.postureGrid}>
          <PostureCard title="Pressure Load" interpretation={pressure.loadMeaning} />
          <PostureCard title="Pressure Spread" interpretation={pressure.spreadMeaning} />
          <PostureCard title="Pressure Containment" interpretation={pressure.containmentMeaning} />
          <PostureCard title="Routing Friction" interpretation={pressure.routingMeaning} />
          <PostureCard title="Responder Pressure" interpretation={pressure.responderMeaning} />
          <PostureCard title="Stabilization Drag" interpretation={pressure.dragMeaning} />
        </section>

        <section style={styles.compactGrid}>
          <CompactCard title="History Depth" value={pressure.historyDepth.posture} />
          <CompactCard title="Dominant Driver" value={pressure.dominantDriver} />
          <CompactCard title="Volatility" value={pressure.volatilityMeaning.posture} />
          <CompactCard title="Current Pressure" value={pressure.pressureInterpretation.posture} />
        </section>

        <section style={styles.twoColumn}>
          <Panel title="Latest Pressure Context">
            <Info label="Continuity State" value={pressure.latest?.continuity_state || 'Not recorded'} />
            <Info label="Pressure State" value={pressure.latest?.pressure_propagation_state || 'Not recorded'} />
            <Info label="Trajectory Direction" value={pressure.latest?.trajectory_direction || 'Not recorded'} />
            <Info label="Structural Memory" value={pressure.latest?.structural_memory_state || 'Not recorded'} />
            <Info label="Dominant Pressure" value={pressure.latest?.dominant_pressure_source || 'Not recorded'} />
          </Panel>

          <Panel title="Pressure Reading">
            <Info label="Pressure Posture" value={pressure.pressureInterpretation.posture} />
            <Info label="Pressure Spread" value={pressure.spreadMeaning.posture} />
            <Info label="Containment" value={pressure.containmentMeaning.posture} />
            <Info label="Dominant Driver" value={pressure.dominantDriver} />
            <Info label="Current Reading" value={pressure.loadMeaning.posture} />
          </Panel>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Recent Pressure Memory Trail
              </h2>

              <p style={styles.cardNote}>
                Recent snapshots are displayed as pressure postures, not raw scores.
              </p>
            </div>

            <button
              onClick={loadPressureMetrics}
              style={styles.primaryButton}
            >
              Refresh
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Pressure State</th>
                  <th style={styles.th}>Escalation</th>
                  <th style={styles.th}>Propagation</th>
                  <th style={styles.th}>Routing</th>
                  <th style={styles.th}>Drag</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No persisted pressure memory found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 8).map((item) => {
                  const rowPressure = interpretPressure({
                    escalationPressure:
                      item.escalation_pressure_index,
                    propagationRisk: item.propagation_risk,
                    unresolvedMomentum: average([
                      item.responder_pressure,
                      item.coordination_instability,
                      item.escalation_velocity,
                    ]),
                    continuityDrift:
                      item.stabilization_drag,
                  })

                  return (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        {formatDate(item.created_at)}
                      </td>

                      <td style={styles.td}>
                        {rowPressure.posture}
                      </td>

                      <td style={styles.td}>
                        {
                          interpretPressureLoad(
                            item.escalation_pressure_index
                          ).posture
                        }
                      </td>

                      <td style={styles.td}>
                        {
                          interpretSpread(
                            item.propagation_risk
                          ).posture
                        }
                      </td>

                      <td style={styles.td}>
                        {
                          interpretRouting(
                            item.routing_friction
                          ).posture
                        }
                      </td>

                      <td style={styles.td}>
                        {
                          interpretDrag(
                            item.stabilization_drag
                          ).posture
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            Generated Pressure Brief
          </h2>

          <pre style={styles.summaryBox}>{brief}</pre>
        </section>
      </div>
    </main>
  )
}

function average(values: number[]) {
  const valid = values.filter((value) =>
    Number.isFinite(value)
  )

  if (valid.length === 0) return 0

  return Math.round(
    valid.reduce((sum, value) => sum + value, 0) /
      valid.length
  )
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function calculateVolatility(values: number[]) {
  const valid = values.filter((value) =>
    Number.isFinite(value)
  )

  if (valid.length < 2) return 0

  const mean = average(valid)

  const variance =
    valid.reduce(
      (sum, value) =>
        sum + Math.pow(value - mean, 2),
      0
    ) / valid.length

  return Math.min(
    100,
    Math.round(Math.sqrt(variance))
  )
}

function strongestDriver(scores: Record<string, number>) {
  return (
    Object.entries(scores).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] ||
    'No dominant pressure driver detected'
  )
}

function interpretPressureLoad(
  value: number
): Interpretation {
  if (value >= 70) {
    return {
      posture: 'HEAVY PRESSURE LOAD',
      meaning:
        'Pressure load is high enough to threaten stabilization.',
      action: 'Escalate pressure review.',
    }
  }

  if (value >= 50) {
    return {
      posture: 'MODERATE PRESSURE LOAD',
      meaning:
        'Pressure load is visible and should remain under review.',
      action: 'Keep pressure visible.',
    }
  }

  if (value >= 35) {
    return {
      posture: 'PRESSURE MONITORED',
      meaning:
        'Pressure exists but is not dominant.',
      action: 'Continue monitoring.',
    }
  }

  return {
    posture: 'PRESSURE CONTAINED',
    meaning: 'Pressure load appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretSpread(
  value: number
): Interpretation {
  if (value >= 70) {
    return {
      posture: 'SPREAD RISK HIGH',
      meaning:
        'Pressure may be spreading across the pathway.',
      action:
        'Review propagation and coordination instability.',
    }
  }

  if (value >= 50) {
    return {
      posture: 'SPREAD UNDER WATCH',
      meaning:
        'Pressure spread is visible and must remain under governance review.',
      action: 'Keep spread visible.',
    }
  }

  return {
    posture: 'SPREAD CONTAINED',
    meaning: 'Pressure spread appears contained.',
    action: 'Continue monitoring.',
  }
}

function interpretContainment(
  value: number
): Interpretation {
  if (value >= 70) {
    return {
      posture: 'CONTAINMENT HOLDING',
      meaning:
        'Recovery reliability and survivability are supporting pressure containment.',
      action:
        'Maintain containment discipline.',
    }
  }

  if (value >= 45) {
    return {
      posture: 'CONTAINMENT MONITORED',
      meaning:
        'Containment exists but still needs confirmation.',
      action: 'Continue monitoring.',
    }
  }

  return {
    posture: 'CONTAINMENT WEAK',
    meaning:
      'Pressure may exceed current stabilization capacity.',
    action: 'Escalate containment review.',
  }
}

function interpretVolatility(
  value: number
): Interpretation {
  if (value >= 30) {
    return {
      posture: 'PRESSURE VOLATILE',
      meaning:
        'Pressure movement is fluctuating enough to weaken confidence.',
      action: 'Extend monitoring.',
    }
  }

  if (value >= 18) {
    return {
      posture: 'VARIATION CONTAINED',
      meaning:
        'Pressure variation exists but is not showing collapse.',
      action:
        'Watch for repeated instability.',
    }
  }

  return {
    posture: 'PRESSURE MOVEMENT STABLE',
    meaning:
      'Pressure movement appears steady.',
    action: 'Maintain routine monitoring.',
  }
}

function interpretRouting(
  value: number
): Interpretation {
  if (value >= 65) {
    return {
      posture: 'ROUTING FRICTION HIGH',
      meaning:
        'Routing friction may be slowing stabilization.',
      action:
        'Review routing ownership and response alignment.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'ROUTING FRICTION VISIBLE',
      meaning:
        'Routing friction exists and should stay visible.',
      action:
        'Monitor routing pressure.',
    }
  }

  return {
    posture: 'ROUTING FRICTION CONTAINED',
    meaning:
      'Routing friction appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretResponder(
  value: number
): Interpretation {
  if (value >= 65) {
    return {
      posture: 'RESPONDER PRESSURE HIGH',
      meaning:
        'Responder pressure may weaken continuity response.',
      action:
        'Review responder load and ownership.',
    }
  }

  if (value >= 40) {
    return {
      posture:
        'RESPONDER PRESSURE VISIBLE',
      meaning:
        'Responder pressure is visible but not dominant.',
      action:
        'Keep responder pressure under review.',
    }
  }

  return {
    posture:
      'RESPONDER PRESSURE CONTAINED',
    meaning:
      'Responder pressure appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretDrag(
  value: number
): Interpretation {
  if (value >= 65) {
    return {
      posture: 'STABILIZATION DRAG HIGH',
      meaning:
        'Stabilization drag may delay recovery credibility.',
      action:
        'Escalate stabilization drag review.',
    }
  }

  if (value >= 40) {
    return {
      posture:
        'STABILIZATION DRAG VISIBLE',
      meaning:
        'Drag remains visible and should stay under review.',
      action:
        'Keep drag visible until recovery holds.',
    }
  }

  return {
    posture:
      'STABILIZATION DRAG CONTAINED',
    meaning:
      'Stabilization drag appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretHistory(
  count: number
): Interpretation {
  if (count < 3) {
    return {
      posture: 'INSUFFICIENT HISTORY',
      meaning:
        'Too few snapshots exist for pressure interpretation.',
      action:
        'Continue saving operational snapshots.',
    }
  }

  if (count < 10) {
    return {
      posture:
        'EARLY PRESSURE MEMORY',
      meaning:
        'Pressure memory has started but remains early.',
      action:
        'Continue building continuity memory.',
    }
  }

  return {
    posture:
      'PRESSURE MEMORY ESTABLISHED',
    meaning:
      'Persisted memory supports pressure interpretation.',
    action:
      'Use posture to guide review.',
  }
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
      <p style={styles.cardKicker}>
        {title}
      </p>

      <h3 style={styles.postureTitle}>
        {interpretation.posture}
      </h3>

      <p style={styles.postureMeaning}>
        {interpretation.meaning}
      </p>
    </article>
  )
}

function CompactCard({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <article style={styles.compactCard}>
      <p style={styles.cardKicker}>
        {title}
      </p>

      <h3 style={styles.compactValue}>
        {value}
      </h3>
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
      <h2 style={styles.cardTitle}>
        {title}
      </h2>

      <div style={styles.infoList}>
        {children}
      </div>
    </section>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>
        {label}
      </span>

      <strong style={styles.infoValue}>
        {value}
      </strong>
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
    color: '#fbbf24',
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
    background: '#422006',
    color: '#fef3c7',
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '16px',
    fontSize: '14px',
  },

  heroCard: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(0, 1.4fr) minmax(260px, 0.6fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #fbbf24',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow:
      '0 20px 50px rgba(0,0,0,0.28)',
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
    fontSize:
      'clamp(34px, 6vw, 56px)',
    margin: '8px 0 12px',
    color: '#fbbf24',
    letterSpacing: '-0.05em',
    lineHeight: 1,
  },

  heroMeaning: {
    color: '#fef3c7',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '720px',
  },

  actionBox: {
    background: '#422006',
    border: '1px solid #fbbf24',
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },

  actionLabel: {
    color: '#fde68a',
    fontWeight: 900,
    margin: '0 0 8px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },

  actionText: {
    color: '#fef3c7',
    lineHeight: 1.55,
    margin: 0,
    fontSize: '14px',
  },

  postureGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, minmax(0, 1fr))',
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
    gridTemplateColumns:
      'repeat(4, minmax(0, 1fr))',
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
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },

  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow:
      '0 20px 50px rgba(0,0,0,0.24)',
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
    gridTemplateColumns:
      '160px minmax(0, 1fr)',
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
    background: '#fbbf24',
    color: '#422006',
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