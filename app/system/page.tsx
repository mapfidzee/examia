'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'

import { supabase } from '../../lib/supabase'

import {
  interpretExecutiveBoard,
  type ExecutiveBoardSnapshot,
} from '../lib/executiveBoard'

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

  executive_summary: string | null
  action_cue: string | null

  executive_priority_score: number | null
  survivability_threat_level: string | null
  executive_action_urgency: string | null
  structural_deterioration_state: string | null
  executive_action_deadline: string | null
}

const SAMPLE_LIMIT = 120

const DOCTRINE = [
  'Visible instability must not disappear.',
  'Detection is not stabilization.',
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
    setMessage(
      'Loading executive continuity command intelligence...'
    )

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)

      setMessage(
        'Failed to load executive continuity command intelligence.'
      )

      return
    }

    setMetrics(data || [])

    setMessage(
      'Executive continuity command intelligence loaded.'
    )
  }

  const board = useMemo(() => {
    const latest = metrics[0] || null

    if (!latest) {
      return null
    }

    const executiveSnapshot: ExecutiveBoardSnapshot = {
      executivePriorityScore:
        latest.executive_priority_score || 0,

      survivabilityThreatLevel:
        latest.survivability_threat_level || 'WATCH',

      executiveActionUrgency:
        latest.executive_action_urgency || 'ROUTINE',

      structuralDeteriorationState:
        latest.structural_deterioration_state ||
        'STABLE',

      executiveActionDeadline:
        latest.executive_action_deadline ||
        'Next governance cycle',

      continuityIntegrityScore:
        latest.continuity_integrity_score,

      operationalSurvivabilityScore:
        latest.operational_survivability_score,

      recoveryReliabilityScore:
        latest.recovery_reliability_score,

      escalationPressureIndex:
        latest.escalation_pressure_index,

      dominantPressureSource:
        latest.dominant_pressure_source || 'Not recorded',

      dominantTrajectorySignal:
        latest.dominant_trajectory_signal ||
        'Not recorded',

      dominantMemoryPattern:
        latest.dominant_memory_pattern ||
        'Not recorded',

      executiveSummary:
        latest.executive_summary || 'No executive summary.',

      actionCue:
        latest.action_cue || 'No executive action cue.',
    }

    const interpretation =
      interpretExecutiveBoard(executiveSnapshot)

    return {
      latest,
      executiveSnapshot,
      interpretation,
    }
  }, [metrics])

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI</p>

          <h1 style={styles.title}>
            Executive Stability Board
          </h1>

          <p style={styles.enterpriseSubtitle}>
            Executive Continuity Intelligence Infrastructure
          </p>

          <p style={styles.subtitle}>
            Continuity command intelligence for executive
            survivability visibility, structural deterioration
            interpretation, and governed operational
            prioritization.
          </p>

          <div style={styles.doctrineGrid}>
            {DOCTRINE.map((item) => (
              <div key={item} style={styles.doctrineCard}>
                {item}
              </div>
            ))}
          </div>
        </section>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        {!board && (
          <section style={styles.card}>
            <h2>No persisted executive continuity data yet.</h2>

            <p style={styles.panelNote}>
              Save governed snapshots from /operations to
              activate executive continuity interpretation.
            </p>
          </section>
        )}

        {board && (
          <>
            <section style={styles.commandHero}>
              <div>
                <p style={styles.scoreLabel}>
                  Executive Command Posture
                </p>

                <h2 style={styles.executiveState}>
                  {
                    board.interpretation
                      .commandPosture
                  }
                </h2>

                <p style={styles.panelNote}>
                  {
                    board.interpretation
                      .survivabilityInterpretation
                  }
                </p>
              </div>

              <div style={styles.scoreGrid}>
                <ScoreMetric
                  label="Executive Priority"
                  value={
                    board.executiveSnapshot
                      .executivePriorityScore
                  }
                />

                <ScoreMetric
                  label="Continuity Integrity"
                  value={
                    board.executiveSnapshot
                      .continuityIntegrityScore
                  }
                />

                <ScoreMetric
                  label="Survivability"
                  value={
                    board.executiveSnapshot
                      .operationalSurvivabilityScore
                  }
                />

                <ScoreMetric
                  label="Recovery Reliability"
                  value={
                    board.executiveSnapshot
                      .recoveryReliabilityScore
                  }
                />

                <ScoreMetric
                  label="Escalation Pressure"
                  value={
                    board.executiveSnapshot
                      .escalationPressureIndex
                  }
                />
              </div>

              <div style={styles.actionBox}>
                <strong>
                  Executive Recommendation
                </strong>

                <span>
                  {
                    board.interpretation
                      .executiveRecommendation
                  }
                </span>
              </div>
            </section>

            <section style={styles.metricsGrid}>
              <Metric
                label="Threat Level"
                value={
                  board.executiveSnapshot
                    .survivabilityThreatLevel
                }
              />

              <Metric
                label="Action Urgency"
                value={
                  board.executiveSnapshot
                    .executiveActionUrgency
                }
              />

              <Metric
                label="Deterioration State"
                value={
                  board.executiveSnapshot
                    .structuralDeteriorationState
                }
              />

              <Metric
                label="Action Deadline"
                value={
                  board.executiveSnapshot
                    .executiveActionDeadline
                }
              />

              <Metric
                label="Risk Direction"
                value={
                  board.interpretation
                    .institutionalRiskDirection
                }
              />

              <Metric
                label="Snapshots Reviewed"
                value={metrics.length}
              />
            </section>

            <section style={styles.layoutGrid}>
              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  Dominant Pressure Source
                </h2>

                <p style={styles.zoneText}>
                  {
                    board.executiveSnapshot
                      .dominantPressureSource
                  }
                </p>
              </div>

              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  Dominant Trajectory Signal
                </h2>

                <p style={styles.zoneText}>
                  {
                    board.executiveSnapshot
                      .dominantTrajectorySignal
                  }
                </p>
              </div>

              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>
                  Dominant Memory Pattern
                </h2>

                <p style={styles.zoneText}>
                  {
                    board.executiveSnapshot
                      .dominantMemoryPattern
                  }
                </p>
              </div>
            </section>

            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Executive Interpretation
              </h2>

              <p style={styles.summaryText}>
                {
                  board.executiveSnapshot
                    .executiveSummary
                }
              </p>

              <div style={styles.zoneAction}>
                <strong>Action Cue:</strong>

                <p
                  style={{
                    marginTop: '8px',
                    marginBottom: 0,
                  }}
                >
                  {
                    board.executiveSnapshot
                      .actionCue
                  }
                </p>
              </div>
            </section>

            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Recent Executive Snapshot Trail
              </h2>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Created
                      </th>

                      <th style={styles.th}>
                        Priority
                      </th>

                      <th style={styles.th}>
                        Threat
                      </th>

                      <th style={styles.th}>
                        Urgency
                      </th>

                      <th style={styles.th}>
                        Survivability
                      </th>

                      <th style={styles.th}>
                        Deterioration
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
                              item.created_at
                            )}
                          </td>

                          <td style={styles.td}>
                            {
                              item.executive_priority_score
                            }
                            /100
                          </td>

                          <td style={styles.td}>
                            {
                              item.survivability_threat_level
                            }
                          </td>

                          <td style={styles.td}>
                            {
                              item.executive_action_urgency
                            }
                          </td>

                          <td style={styles.td}>
                            {
                              item.operational_survivability_score
                            }
                            /100
                          </td>

                          <td style={styles.td}>
                            {
                              item.structural_deterioration_state
                            }
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={loadBoardMetrics}
                style={styles.primaryButton}
              >
                Refresh Executive Stability Board
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>
        {label}
      </p>

      <h2 style={styles.metricValue}>
        {value}
      </h2>
    </div>
  )
}

function ScoreMetric({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div style={styles.scoreCard}>
      <p style={styles.scoreMetricLabel}>
        {label}
      </p>

      <h3 style={styles.scoreMetricValue}>
        {value}/100
      </h3>
    </div>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
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
    fontSize: 'clamp(42px, 8vw, 78px)',
    lineHeight: 1,
    margin: '12px 0',
    letterSpacing: '-0.06em',
  },

  enterpriseSubtitle: {
    color: '#a7f3d0',
    fontSize: 'clamp(20px, 4vw, 34px)',
    fontWeight: 900,
    margin: '0 0 18px',
  },

  subtitle: {
    color: '#cbd5e1',
    maxWidth: '980px',
    lineHeight: 1.7,
    fontSize: '18px',
  },

  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
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
    boxShadow:
      '0 24px 80px rgba(0,0,0,0.45)',
  },

  scoreLabel: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },

  executiveState: {
    fontSize: 'clamp(42px, 9vw, 88px)',
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
    gridTemplateColumns:
      'repeat(auto-fit, minmax(190px, 1fr))',
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
    gridTemplateColumns:
      'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },

  metricCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '20px',
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
    gridTemplateColumns:
      'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },

  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '28px',
    boxShadow:
      '0 24px 70px rgba(0,0,0,0.35)',
  },

  sectionTitle: {
    fontSize: '26px',
    margin: '0 0 10px',
  },

  zoneText: {
    color: '#cbd5e1',
    lineHeight: 1.7,
  },

  summaryText: {
    color: '#e2e8f0',
    lineHeight: 1.8,
    fontSize: '16px',
  },

  zoneAction: {
    marginTop: '16px',
    background: '#082f49',
    border: '1px solid #164e63',
    borderRadius: '14px',
    padding: '16px',
    color: '#cffafe',
    lineHeight: 1.6,
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
}