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

    const memoryRisk = average(
      ordered.map((item) => item.structural_memory_risk)
    )

    const recoveryReliability = average(
      ordered.map((item) => item.recovery_reliability_score)
    )

    const survivability = average(
      ordered.map((item) => item.operational_survivability_score)
    )

    const predictionPosture =
      interpretPredictionPosture({
        propagationRisk,
        trajectoryRisk,
        memoryRisk,
        recoveryReliability,
        survivability,
      })

    const forecastWindow =
      interpretForecastWindow({
        propagationRisk,
        trajectoryRisk,
        memoryRisk,
      })

    const pressureForecast =
      interpretPressureForecast(propagationRisk)

    const trajectoryForecast =
      interpretTrajectoryForecast(trajectoryRisk)

    const memoryForecast =
      interpretMemoryForecast(memoryRisk)

    const reliabilityForecast =
      interpretReliabilityForecast(
        recoveryReliability
      )

    const survivabilityForecast =
      interpretSurvivabilityForecast(
        survivability
      )

    const dominantDriver = strongestDriver({
      'Pressure propagation':
        propagationRisk,
      'Trajectory deterioration':
        trajectoryRisk,
      'Structural memory recurrence':
        memoryRisk,
      'Recovery reliability weakness':
        100 - recoveryReliability,
      'Survivability weakness':
        100 - survivability,
    })

    const executiveInterpretation = compactMeaning([
      predictionPosture.meaning,
      pressureForecast.meaning,
      trajectoryForecast.meaning,
      memoryForecast.meaning,
      reliabilityForecast.meaning,
    ])

    const recommendedAction = compactMeaning([
      predictionPosture.action,
      forecastWindow.action,
      reliabilityForecast.action,
    ])

    return {
      latest,
      predictionPosture,
      forecastWindow,
      pressureForecast,
      trajectoryForecast,
      memoryForecast,
      reliabilityForecast,
      survivabilityForecast,
      dominantDriver,
      executiveInterpretation,
      recommendedAction,
    }
  }, [metrics])

  const brief = `
TSINAXA CGI PREDICTIVE INTELLIGENCE BRIEF

Prediction Posture:
${intelligence.predictionPosture.posture}

Forecast Window:
${intelligence.forecastWindow.posture}

Pressure Forecast:
${intelligence.pressureForecast.posture}

Trajectory Forecast:
${intelligence.trajectoryForecast.posture}

Structural Memory Forecast:
${intelligence.memoryForecast.posture}

Reliability Forecast:
${intelligence.reliabilityForecast.posture}

Survivability Forecast:
${intelligence.survivabilityForecast.posture}

Dominant Forecast Driver:
${intelligence.dominantDriver}

Executive Interpretation:
${intelligence.executiveInterpretation}

Recommended Action:
${intelligence.recommendedAction}

Governance-Safe Meaning:
This predictive view interprets persisted continuity memory. It does not judge people. It forecasts whether instability posture is contained, rising, drifting, or threatening survivability credibility.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>
            TSINAXA CGI • PREDICTIVE INTELLIGENCE
          </p>

          <h1 style={styles.title}>
            Continuity Predictive Intelligence
          </h1>

          <p style={styles.subtitle}>
            Executive foresight into whether continuity instability is contained,
            rising, drifting, or approaching survivability risk.
          </p>
        </section>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>
              Prediction Posture
            </p>

            <h2 style={styles.heroPosture}>
              {intelligence.predictionPosture.posture}
            </h2>

            <p style={styles.heroMeaning}>
              {intelligence.executiveInterpretation}
            </p>
          </div>

          <div style={styles.actionBox}>
            <p style={styles.actionLabel}>
              Recommended Action
            </p>

            <p style={styles.actionText}>
              {intelligence.recommendedAction}
            </p>
          </div>
        </section>

        <section style={styles.postureGrid}>
          <PostureCard
            title="Forecast Window"
            interpretation={
              intelligence.forecastWindow
            }
          />

          <PostureCard
            title="Pressure Forecast"
            interpretation={
              intelligence.pressureForecast
            }
          />

          <PostureCard
            title="Trajectory Forecast"
            interpretation={
              intelligence.trajectoryForecast
            }
          />

          <PostureCard
            title="Structural Memory"
            interpretation={
              intelligence.memoryForecast
            }
          />

          <PostureCard
            title="Reliability Forecast"
            interpretation={
              intelligence.reliabilityForecast
            }
          />

          <PostureCard
            title="Survivability Forecast"
            interpretation={
              intelligence.survivabilityForecast
            }
          />
        </section>

        <section style={styles.compactGrid}>
          <CompactCard
            title="Dominant Forecast Driver"
            value={
              intelligence.dominantDriver
            }
          />

          <CompactCard
            title="Continuity State"
            value={
              intelligence.latest
                ?.continuity_state ||
              'Not recorded'
            }
          />

          <CompactCard
            title="Pressure State"
            value={
              intelligence.latest
                ?.pressure_propagation_state ||
              'Not recorded'
            }
          />

          <CompactCard
            title="Trajectory Direction"
            value={
              intelligence.latest
                ?.trajectory_direction ||
              'Not recorded'
            }
          />
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Recent Predictive Memory Trail
              </h2>

              <p style={styles.cardNote}>
                Recent snapshots are displayed
                as predictive posture memory,
                not raw risk scoring.
              </p>
            </div>

            <button
              onClick={
                loadPredictiveMetrics
              }
              style={
                styles.primaryButton
              }
            >
              Refresh
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    Created
                  </th>

                  <th style={styles.th}>
                    Continuity
                  </th>

                  <th style={styles.th}>
                    Pressure
                  </th>

                  <th style={styles.th}>
                    Trajectory
                  </th>

                  <th style={styles.th}>
                    Memory
                  </th>

                  <th style={styles.th}>
                    Survivability
                  </th>
                </tr>
              </thead>

              <tbody>
                {metrics.length ===
                  0 && (
                  <tr>
                    <td
                      style={styles.td}
                      colSpan={6}
                    >
                      No persisted predictive
                      memory found yet.
                    </td>
                  </tr>
                )}

                {metrics
                  .slice(0, 8)
                  .map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        {formatDate(
                          item.created_at
                        )}
                      </td>

                      <td style={styles.td}>
                        {
                          item.continuity_state
                        }
                      </td>

                      <td style={styles.td}>
                        {
                          interpretPressureForecast(
                            item.propagation_risk
                          ).posture
                        }
                      </td>

                      <td style={styles.td}>
                        {
                          interpretTrajectoryForecast(
                            item.trajectory_risk
                          ).posture
                        }
                      </td>

                      <td style={styles.td}>
                        {
                          interpretMemoryForecast(
                            item.structural_memory_risk
                          ).posture
                        }
                      </td>

                      <td style={styles.td}>
                        {
                          interpretSurvivabilityForecast(
                            item.operational_survivability_score
                          ).posture
                        }
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            Generated Predictive Brief
          </h2>

          <pre style={styles.summaryBox}>
            {brief}
          </pre>
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
    valid.reduce(
      (sum, value) => sum + value,
      0
    ) / valid.length
  )
}

function strongestDriver(
  scores: Record<string, number>
) {
  return (
    Object.entries(scores).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] ||
    'No dominant forecast driver detected'
  )
}

function compactMeaning(
  items: string[]
) {
  return Array.from(
    new Set(
      items.filter(Boolean)
    )
  ).join(' ')
}

function interpretPredictionPosture(
  input: {
    propagationRisk: number
    trajectoryRisk: number
    memoryRisk: number
    recoveryReliability: number
    survivability: number
  }
): Interpretation {
  const instability =
    average([
      input.propagationRisk,
      input.trajectoryRisk,
      input.memoryRisk,
      100 -
        input.recoveryReliability,
      100 - input.survivability,
    ])

  if (instability >= 70) {
    return {
      posture:
        'HIGH COLLAPSE RISK',
      meaning:
        'Forecast signals suggest instability may threaten survivability credibility.',
      action:
        'Activate executive continuity review immediately.',
    }
  }

  if (instability >= 55) {
    return {
      posture:
        'RISING INSTABILITY',
      meaning:
        'Instability pressure is strengthening across the reviewed memory window.',
      action:
        'Review forecast deterioration before instability escalates.',
    }
  }

  if (instability >= 35) {
    return {
      posture:
        'WATCH RISK',
      meaning:
        'The system is not collapsing, but instability signals require closer monitoring.',
      action:
        'Increase monitoring frequency and preserve continuity memory.',
    }
  }

  return {
    posture:
      'LOW NEAR-TERM RISK',
    meaning:
      'Persisted continuity memory does not currently show major rising instability.',
    action:
      'Maintain routine predictive monitoring.',
  }
}

function interpretForecastWindow(
  input: {
    propagationRisk: number
    trajectoryRisk: number
    memoryRisk: number
  }
): Interpretation {
  const value = average([
    input.propagationRisk,
    input.trajectoryRisk,
    input.memoryRisk,
  ])

  if (value >= 70) {
    return {
      posture:
        'IMMEDIATE COMMAND WINDOW',
      meaning:
        'Forecast pressure requires immediate executive visibility.',
      action:
        'Do not delay command review.',
    }
  }

  if (value >= 50) {
    return {
      posture:
        'NEAR-TERM RISK WINDOW',
      meaning:
        'Instability signals remain active in the current operational horizon.',
      action:
        'Compare upcoming snapshots against current posture.',
    }
  }

  if (value >= 35) {
    return {
      posture:
        'WATCH WINDOW',
      meaning:
        'Forecast pressure remains visible under monitoring.',
      action:
        'Continue predictive comparison.',
    }
  }

  return {
    posture:
      'ROUTINE MONITORING WINDOW',
    meaning:
      'Forecast posture currently supports routine monitoring.',
    action:
      'Maintain snapshot discipline.',
  }
}

function interpretPressureForecast(
  value: number
): Interpretation {
  if (value >= 70) {
    return {
      posture:
        'PRESSURE ESCALATING',
      meaning:
        'Pressure propagation may threaten continuity containment.',
      action:
        'Escalate pressure review.',
    }
  }

  if (value >= 50) {
    return {
      posture:
        'PRESSURE UNDER WATCH',
      meaning:
        'Pressure remains visible and should remain monitored.',
      action:
        'Maintain pressure visibility.',
    }
  }

  return {
    posture:
      'PRESSURE CONTAINED',
    meaning:
      'Pressure propagation currently appears contained.',
    action:
      'Continue monitoring.',
  }
}

function interpretTrajectoryForecast(
  value: number
): Interpretation {
  if (value >= 70) {
    return {
      posture:
        'TRAJECTORY DETERIORATING',
      meaning:
        'Trajectory deterioration risk is becoming visible.',
      action:
        'Review continuity direction immediately.',
    }
  }

  if (value >= 50) {
    return {
      posture:
        'TRAJECTORY UNDER WATCH',
      meaning:
        'Trajectory movement should remain under governance review.',
      action:
        'Maintain trajectory visibility.',
    }
  }

  return {
    posture:
      'TRAJECTORY CONTAINED',
    meaning:
      'Trajectory deterioration risk is currently contained.',
    action:
      'Continue directional monitoring.',
    }
}

function interpretMemoryForecast(
  value: number
): Interpretation {
  if (value >= 70) {
    return {
      posture:
        'MEMORY RISK HIGH',
      meaning:
        'Recurring instability patterns may threaten survivability.',
      action:
        'Escalate structural recurrence review.',
    }
  }

  if (value >= 50) {
    return {
      posture:
        'MEMORY RISK UNDER WATCH',
      meaning:
        'Structural memory recurrence remains visible.',
      action:
        'Maintain continuity memory visibility.',
    }
  }

  return {
    posture:
      'MEMORY RISK CONTAINED',
    meaning:
      'Structural memory risk is currently contained.',
    action:
      'Preserve continuity memory.',
  }
}

function interpretReliabilityForecast(
  value: number
): Interpretation {
  if (value >= 75) {
    return {
      posture:
        'RELIABILITY IMPROVING',
      meaning:
        'Reliability movement is strengthening against forecast risk.',
      action:
        'Protect recovery discipline.',
    }
  }

  if (value >= 55) {
    return {
      posture:
        'RELIABILITY MONITORED',
      meaning:
        'Reliability exists but still requires confirmation.',
      action:
        'Continue reliability monitoring.',
    }
  }

  return {
    posture:
      'RELIABILITY WEAKENING',
    meaning:
      'Reliability weakness may increase forecast instability.',
    action:
      'Review reliability deterioration.',
  }
}

function interpretSurvivabilityForecast(
  value: number
): Interpretation {
  if (value >= 75) {
    return {
      posture:
        'SURVIVABILITY FAVORABLE',
      meaning:
        'Survivability posture currently supports continuity stability.',
      action:
        'Confirm survivability durability.',
    }
  }

  if (value >= 55) {
    return {
      posture:
        'SURVIVABILITY MONITORED',
      meaning:
        'Survivability exists but still requires executive visibility.',
      action:
        'Do not assume closure.',
    }
  }

  return {
    posture:
      'SURVIVABILITY AT RISK',
    meaning:
      'Survivability posture may not support stabilization credibility.',
    action:
      'Escalate survivability review.',
  }
}

function formatDate(value: string) {
  if (!value)
    return 'Not recorded'

  return new Date(
    value
  ).toLocaleString()
}

function PostureCard({
  title,
  interpretation,
}: {
  title: string
  interpretation: Interpretation
}) {
  return (
    <article
      style={
        styles.postureCard
      }
    >
      <p style={styles.cardKicker}>
        {title}
      </p>

      <h3
        style={
          styles.postureTitle
        }
      >
        {
          interpretation.posture
        }
      </h3>

      <p
        style={
          styles.postureMeaning
        }
      >
        {
          interpretation.meaning
        }
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
    <article
      style={
        styles.compactCard
      }
    >
      <p style={styles.cardKicker}>
        {title}
      </p>

      <h3
        style={
          styles.compactValue
        }
      >
        {value}
      </h3>
    </article>
  )
}

const styles: Record<
  string,
  CSSProperties
> = {
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
    fontSize:
      'clamp(32px, 5vw, 48px)',
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
    gridTemplateColumns:
      'minmax(0, 1.4fr) minmax(260px, 0.6fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #f97316',
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
    textTransform:
      'uppercase',
    margin: 0,
    fontSize: '12px',
  },

  heroPosture: {
    fontSize:
      'clamp(34px, 6vw, 56px)',
    margin:
      '8px 0 12px',
    color: '#fdba74',
    letterSpacing:
      '-0.05em',
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
    border:
      '1px solid #f97316',
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },

  actionLabel: {
    color: '#fdba74',
    fontWeight: 900,
    margin:
      '0 0 8px',
    fontSize: '12px',
    textTransform:
      'uppercase',
    letterSpacing:
      '0.12em',
  },

  actionText: {
    color: '#ffedd5',
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
    border:
      '1px solid #1e293b',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
    boxSizing:
      'border-box',
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
    margin:
      '10px 0 8px',
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
    border:
      '1px solid #1e293b',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '104px',
    boxSizing:
      'border-box',
  },

  compactValue: {
    fontSize: '18px',
    lineHeight: 1.2,
    margin:
      '10px 0 0',
    color: '#f8fafc',
    overflowWrap:
      'anywhere',
  },

  card: {
    background: '#020617',
    border:
      '1px solid #1e293b',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow:
      '0 20px 50px rgba(0,0,0,0.24)',
    boxSizing:
      'border-box',
    overflow: 'hidden',
  },

  cardHeader: {
    display: 'flex',
    justifyContent:
      'space-between',
    gap: '16px',
    alignItems:
      'flex-start',
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
    margin:
      '6px 0 0',
    fontSize: '14px',
  },

  tableWrap: {
    width: '100%',
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    borderCollapse:
      'collapse',
    minWidth: '760px',
  },

  th: {
    textAlign: 'left',
    color: '#94a3b8',
    borderBottom:
      '1px solid #334155',
    padding: '10px',
    fontSize: '11px',
    textTransform:
      'uppercase',
  },

  td: {
    borderBottom:
      '1px solid #1e293b',
    padding: '10px',
    color: '#e2e8f0',
    verticalAlign: 'top',
    fontWeight: 700,
    fontSize: '13px',
  },

  primaryButton: {
    padding:
      '10px 14px',
    borderRadius: '12px',
    border: 'none',
    background: '#fdba74',
    color: '#431407',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace:
      'nowrap',
  },

  summaryBox: {
    whiteSpace:
      'pre-wrap',
    background: '#0f172a',
    border:
      '1px solid #334155',
    borderRadius: '16px',
    padding: '16px',
    color: '#e2e8f0',
    lineHeight: 1.55,
    minHeight: '260px',
    fontSize: '14px',
    overflowX: 'auto',
  },
}