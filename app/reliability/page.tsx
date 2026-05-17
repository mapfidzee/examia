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

  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null

  executive_summary: string | null
  action_cue: string | null

  continuity_integrity_score: number
  stabilization_confidence_score: number
  recovery_reliability_score: number
  operational_survivability_score: number

  propagation_risk: number
  trajectory_risk: number
  structural_memory_risk: number
  escalation_pressure_index: number

  unresolved_momentum: number
  stabilization_drag: number
  continuity_drift: number
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
    setMessage('Loading persisted CGI reliability intelligence...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)

      setMessage(
        'Failed to load persisted CGI reliability intelligence.',
      )

      return
    }

    setMetrics(data || [])

    setMessage(
      'Persisted CGI reliability intelligence loaded.',
    )
  }

  const intelligence = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime(),
    )

    const latest = ordered[ordered.length - 1] || null

    const averageReliability = average(
      ordered.map(
        (item) => item.recovery_reliability_score,
      ),
    )

    const averageSurvivability = average(
      ordered.map(
        (item) => item.operational_survivability_score,
      ),
    )

    const averageContinuity = average(
      ordered.map(
        (item) => item.continuity_integrity_score,
      ),
    )

    const instabilityBurden = average([
      average(
        ordered.map(
          (item) => item.propagation_risk,
        ),
      ),

      average(
        ordered.map(
          (item) => item.trajectory_risk,
        ),
      ),

      average(
        ordered.map(
          (item) =>
            item.structural_memory_risk,
        ),
      ),

      average(
        ordered.map(
          (item) =>
            item.escalation_pressure_index,
        ),
      ),
    ])

    const volatility = calculateVolatility(
      ordered.map(
        (item) =>
          item.recovery_reliability_score,
      ),
    )

    const reliabilityPosture =
      resolveReliabilityPosture({
        reliability: averageReliability,
        survivability: averageSurvivability,
        continuity: averageContinuity,
        instabilityBurden,
        volatility,
      })

    const executiveMeaning =
      resolveExecutiveMeaning(
        reliabilityPosture,
      )

    const recommendedAction =
      resolveRecommendedAction(
        reliabilityPosture,
      )

    return {
      latest,

      reliabilityPosture,

      executiveMeaning,

      recommendedAction,

      reliabilityDirection:
        resolveReliabilityDirection(
          averageReliability,
        ),

      survivabilityMeaning:
        resolveSurvivabilityMeaning(
          averageSurvivability,
        ),

      continuityMeaning:
        resolveContinuityMeaning(
          averageContinuity,
        ),

      instabilityMeaning:
        resolveInstabilityMeaning(
          instabilityBurden,
        ),

      volatilityMeaning:
        resolveVolatilityMeaning(
          volatility,
        ),

      driftMeaning:
        resolveDriftMeaning(
          average(
            ordered.map(
              (item) =>
                item.continuity_drift,
            ),
          ),
        ),

      unresolvedMeaning:
        resolveUnresolvedMeaning(
          average(
            ordered.map(
              (item) =>
                item.unresolved_momentum,
            ),
          ),
        ),

      snapshotsReviewed: ordered.length,
    }
  }, [metrics])

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>
            TSINAXA CGI • RELIABILITY
            INTELLIGENCE
          </p>

          <h1 style={styles.title}>
            Continuity Reliability
            Intelligence
          </h1>

          <p style={styles.subtitle}>
            Interpret whether continuity
            stabilization is becoming
            dependable, fragile,
            deteriorating, or structurally
            unstable across persisted CGI
            operational memory.
          </p>
        </section>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        <section style={styles.primaryBoard}>
          <div style={styles.primaryHeader}>
            <div>
              <p style={styles.primaryLabel}>
                Reliability Posture
              </p>

              <h2 style={styles.primaryValue}>
                {
                  intelligence.reliabilityPosture
                }
              </h2>
            </div>

            <div style={styles.primaryBadge}>
              CONTINUITY
              DEPENDABILITY
            </div>
          </div>

          <p style={styles.primaryMeaning}>
            {
              intelligence.executiveMeaning
            }
          </p>

          <div style={styles.actionBox}>
            <strong>
              Recommended Action
            </strong>

            <span>
              {
                intelligence.recommendedAction
              }
            </span>
          </div>
        </section>

        <section style={styles.signalGrid}>
          <SignalCard
            title="Reliability Direction"
            value={
              intelligence.reliabilityDirection
            }
          />

          <SignalCard
            title="Survivability"
            value={
              intelligence.survivabilityMeaning
            }
          />

          <SignalCard
            title="Continuity Integrity"
            value={
              intelligence.continuityMeaning
            }
          />

          <SignalCard
            title="Instability Burden"
            value={
              intelligence.instabilityMeaning
            }
          />

          <SignalCard
            title="Reliability Volatility"
            value={
              intelligence.volatilityMeaning
            }
          />

          <SignalCard
            title="Continuity Drift"
            value={
              intelligence.driftMeaning
            }
          />

          <SignalCard
            title="Unresolved Momentum"
            value={
              intelligence.unresolvedMeaning
            }
          />

          <SignalCard
            title="History Depth"
            value={
              intelligence.snapshotsReviewed >=
              10
                ? 'RELIABILITY MEMORY ESTABLISHED'
                : 'INSUFFICIENT RELIABILITY MEMORY'
            }
          />
        </section>

        {intelligence.latest && (
          <section style={styles.contextCard}>
            <h2 style={styles.sectionTitle}>
              Latest Persisted Reliability
              Context
            </h2>

            <div style={styles.contextGrid}>
              <ContextItem
                label="Latest Continuity State"
                value={
                  intelligence.latest
                    .continuity_state
                }
              />

              <ContextItem
                label="Latest Pressure State"
                value={
                  intelligence.latest
                    .pressure_propagation_state
                }
              />

              <ContextItem
                label="Latest Trajectory Direction"
                value={
                  intelligence.latest
                    .trajectory_direction
                }
              />

              <ContextItem
                label="Structural Memory State"
                value={
                  intelligence.latest
                    .structural_memory_state
                }
              />

              <ContextItem
                label="Dominant Pressure Source"
                value={
                  intelligence.latest
                    .dominant_pressure_source ||
                  'No dominant pressure source recorded'
                }
              />

              <ContextItem
                label="Dominant Trajectory Signal"
                value={
                  intelligence.latest
                    .dominant_trajectory_signal ||
                  'No dominant trajectory signal recorded'
                }
              />

              <ContextItem
                label="Dominant Memory Pattern"
                value={
                  intelligence.latest
                    .dominant_memory_pattern ||
                  'No dominant memory pattern recorded'
                }
              />
            </div>
          </section>
        )}

        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Recent Reliability Memory
              </h2>

              <p style={styles.tableNote}>
                Historical CGI operational
                memory interpreted into
                executive-readable
                reliability posture.
              </p>
            </div>

            <button
              onClick={
                loadReliabilityMetrics
              }
              style={styles.button}
            >
              Refresh Reliability
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
                    Reliability
                  </th>

                  <th style={styles.th}>
                    Survivability
                  </th>

                  <th style={styles.th}>
                    Pressure
                  </th>

                  <th style={styles.th}>
                    Drift
                  </th>
                </tr>
              </thead>

              <tbody>
                {metrics
                  .slice(0, 12)
                  .map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        {formatDate(
                          item.created_at,
                        )}
                      </td>

                      <td style={styles.td}>
                        {
                          item.continuity_state
                        }
                      </td>

                      <td style={styles.td}>
                        {resolveReliabilityDirection(
                          item.recovery_reliability_score,
                        )}
                      </td>

                      <td style={styles.td}>
                        {resolveSurvivabilityMeaning(
                          item.operational_survivability_score,
                        )}
                      </td>

                      <td style={styles.td}>
                        {resolveInstabilityMeaning(
                          item.escalation_pressure_index,
                        )}
                      </td>

                      <td style={styles.td}>
                        {resolveDriftMeaning(
                          item.continuity_drift,
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

function SignalCard({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div style={styles.signalCard}>
      <p style={styles.signalTitle}>
        {title}
      </p>

      <h3 style={styles.signalValue}>
        {value}
      </h3>
    </div>
  )
}

function ContextItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.contextItem}>
      <p style={styles.contextLabel}>
        {label}
      </p>

      <h3 style={styles.contextValue}>
        {value}
      </h3>
    </div>
  )
}

function average(values: number[]) {
  const valid = values.filter((v) =>
    Number.isFinite(v),
  )

  if (valid.length === 0) return 0

  return Math.round(
    valid.reduce((a, b) => a + b, 0) /
      valid.length,
  )
}

function calculateVolatility(
  values: number[],
) {
  const valid = values.filter((v) =>
    Number.isFinite(v),
  )

  if (valid.length < 2) return 0

  const mean = average(valid)

  const variance =
    valid.reduce(
      (sum, value) =>
        sum +
        Math.pow(value - mean, 2),
      0,
    ) / valid.length

  return Math.round(
    Math.sqrt(variance),
  )
}

function resolveReliabilityPosture(
  input: {
    reliability: number
    survivability: number
    continuity: number
    instabilityBurden: number
    volatility: number
  },
) {
  if (
    input.reliability >= 75 &&
    input.survivability >= 75 &&
    input.instabilityBurden <= 35
  ) {
    return 'RELIABILITY STRENGTHENING'
  }

  if (
    input.reliability <= 40 ||
    input.survivability <= 40 ||
    input.instabilityBurden >= 70
  ) {
    return 'RELIABILITY DETERIORATING'
  }

  if (
    input.volatility >= 25
  ) {
    return 'RELIABILITY UNSTABLE'
  }

  return 'RELIABILITY HOLDING'
}

function resolveExecutiveMeaning(
  posture: string,
) {
  if (
    posture ===
    'RELIABILITY STRENGTHENING'
  ) {
    return 'Continuity stabilization is becoming dependable. Recovery reliability, survivability, and operational continuity are holding together with contained structural pressure.'
  }

  if (
    posture ===
    'RELIABILITY DETERIORATING'
  ) {
    return 'Continuity reliability is weakening. Structural pressure, instability burden, or survivability deterioration remain visible and require executive review.'
  }

  if (
    posture ===
    'RELIABILITY UNSTABLE'
  ) {
    return 'Continuity reliability is fluctuating between stabilization and instability. The infrastructure has not yet settled into durable operational dependability.'
  }

  return 'Continuity reliability is holding. Recovery credibility exists, but survivability durability still requires continued governance review.'
}

function resolveRecommendedAction(
  posture: string,
) {
  if (
    posture ===
    'RELIABILITY STRENGTHENING'
  ) {
    return 'Maintain current stabilization posture and continue survivability monitoring.'
  }

  if (
    posture ===
    'RELIABILITY DETERIORATING'
  ) {
    return 'Review recurring instability corridors, escalation burden, and unresolved structural pressure before deterioration becomes systemic.'
  }

  if (
    posture ===
    'RELIABILITY UNSTABLE'
  ) {
    return 'Inspect volatility drivers and compare recent operational memory against continuity drift and unresolved momentum.'
  }

  return 'Maintain monitoring and continue saving operational snapshots to confirm durability.'
}

function resolveReliabilityDirection(
  value: number,
) {
  if (value >= 75)
    return 'RELIABILITY STRENGTHENING'

  if (value >= 55)
    return 'RELIABILITY HOLDING'

  if (value >= 40)
    return 'RELIABILITY FRAGILE'

  return 'RELIABILITY DETERIORATING'
}

function resolveSurvivabilityMeaning(
  value: number,
) {
  if (value >= 75)
    return 'SURVIVABILITY IMPROVING'

  if (value >= 55)
    return 'SURVIVABILITY MONITORED'

  if (value >= 40)
    return 'SURVIVABILITY FRAGILE'

  return 'SURVIVABILITY DETERIORATING'
}

function resolveContinuityMeaning(
  value: number,
) {
  if (value >= 75)
    return 'CONTINUITY HOLDING'

  if (value >= 55)
    return 'CONTINUITY MONITORED'

  if (value >= 40)
    return 'CONTINUITY FRAGILE'

  return 'CONTINUITY DETERIORATING'
}

function resolveInstabilityMeaning(
  value: number,
) {
  if (value >= 70)
    return 'HEAVY INSTABILITY BURDEN'

  if (value >= 50)
    return 'MODERATE STRUCTURAL FRICTION'

  if (value >= 35)
    return 'INSTABILITY MONITORED'

  return 'INSTABILITY CONTAINED'
}

function resolveVolatilityMeaning(
  value: number,
) {
  if (value >= 30)
    return 'HIGH VOLATILITY'

  if (value >= 18)
    return 'CONTAINED VARIATION'

  return 'STABLE RELIABILITY MOVEMENT'
}

function resolveDriftMeaning(
  value: number,
) {
  if (value >= 60)
    return 'SEVERE CONTINUITY DRIFT'

  if (value >= 40)
    return 'MODERATE CONTINUITY DRIFT'

  return 'DRIFT CONTAINED'
}

function resolveUnresolvedMeaning(
  value: number,
) {
  if (value >= 65)
    return 'HEAVY UNRESOLVED MOMENTUM'

  if (value >= 45)
    return 'MODERATE UNRESOLVED MOMENTUM'

  return 'UNRESOLVED MOMENTUM CONTAINED'
}

function formatDate(value: string) {
  return new Date(
    value,
  ).toLocaleString()
}

const styles: Record<
  string,
  CSSProperties
> = {
  page: {
    minHeight: '100vh',
    color: '#f8fafc',
  },

  container: {
    width: '100%',
    maxWidth: '1380px',
    margin: '0 auto',
  },

  hero: {
    marginBottom: '28px',
  },

  kicker: {
    color: '#67e8f9',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.16em',
    marginBottom: '12px',
  },

  title: {
    fontSize:
      'clamp(38px, 6vw, 62px)',
    lineHeight: 1.05,
    margin: 0,
  },

  subtitle: {
    marginTop: '18px',
    color: '#cbd5e1',
    fontSize: '18px',
    lineHeight: 1.7,
    maxWidth: '980px',
  },

  message: {
    background: '#052e16',
    border: '1px solid #14532d',
    color: '#dcfce7',
    padding: '16px',
    borderRadius: '18px',
    marginBottom: '24px',
    fontWeight: 700,
  },

  primaryBoard: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '28px',
    padding: '32px',
    marginBottom: '28px',
  },

  primaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  primaryLabel: {
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontWeight: 900,
    fontSize: '12px',
    margin: 0,
  },

  primaryValue: {
    fontSize:
      'clamp(38px, 6vw, 64px)',
    margin: '10px 0 0',
    lineHeight: 1,
  },

  primaryBadge: {
    padding: '12px 18px',
    borderRadius: '999px',
    background: '#0f172a',
    border: '1px solid #334155',
    fontWeight: 800,
    color: '#67e8f9',
    height: 'fit-content',
  },

  primaryMeaning: {
    marginTop: '24px',
    color: '#cbd5e1',
    lineHeight: 1.8,
    fontSize: '17px',
    maxWidth: '1100px',
  },

  actionBox: {
    marginTop: '24px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '20px',
    display: 'grid',
    gap: '10px',
  },

  signalGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '18px',
    marginBottom: '28px',
  },

  signalCard: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '22px',
    padding: '22px',
  },

  signalTitle: {
    color: '#94a3b8',
    margin: 0,
    marginBottom: '14px',
    fontWeight: 800,
    fontSize: '13px',
    textTransform: 'uppercase',
  },

  signalValue: {
    margin: 0,
    fontSize: '24px',
    lineHeight: 1.4,
  },

  contextCard: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '26px',
    padding: '28px',
    marginBottom: '28px',
  },

  sectionTitle: {
    fontSize: '30px',
    margin: 0,
    marginBottom: '22px',
  },

  contextGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },

  contextItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
  },

  contextLabel: {
    color: '#94a3b8',
    margin: 0,
    marginBottom: '10px',
    fontSize: '12px',
    textTransform: 'uppercase',
    fontWeight: 800,
  },

  contextValue: {
    margin: 0,
    lineHeight: 1.6,
    fontSize: '18px',
  },

  tableCard: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '26px',
    padding: '28px',
  },

  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '24px',
  },

  tableNote: {
    color: '#94a3b8',
    lineHeight: 1.7,
    maxWidth: '900px',
  },

  tableWrap: {
    overflowX: 'auto',
  },

  table: {
    width: '100%',
    minWidth: '1000px',
    borderCollapse: 'collapse',
  },

  th: {
    textAlign: 'left',
    padding: '16px',
    borderBottom: '1px solid #334155',
    color: '#94a3b8',
    fontSize: '12px',
    textTransform: 'uppercase',
  },

  td: {
    padding: '16px',
    borderBottom: '1px solid #1e293b',
    color: '#e2e8f0',
    verticalAlign: 'top',
    lineHeight: 1.6,
  },

  button: {
    padding: '14px 20px',
    borderRadius: '14px',
    border: 'none',
    background: '#67e8f9',
    color: '#082f49',
    fontWeight: 900,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
}