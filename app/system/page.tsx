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

  executive_summary: string | null
  action_cue: string | null

  executive_priority_score: number | null
  survivability_threat_level: string | null
  executive_action_urgency: string | null
  structural_deterioration_state: string | null
  executive_action_deadline: string | null
}

type CommandPosture =
  | 'STABLE'
  | 'WATCH'
  | 'ELEVATED'
  | 'CRITICAL'

type Threshold =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'

type InterpretiveBoard = {
  latest: CgiOperationalMetric
  commandPosture: CommandPosture
  commandMeaning: string
  survivabilityInterpretation: string
  executiveImplication: string
  structuralPattern: string
  pressureThreshold: Threshold
  trajectoryThreshold: Threshold
  recoveryThreshold: Threshold
  survivabilityThreshold: Threshold
  memoryThreshold: Threshold
  actionThreshold: Threshold
  actionDeadline: string
  actionCue: string
}

const SAMPLE_LIMIT = 80

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
    setMessage('Loading interpretive continuity intelligence...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Failed to load interpretive continuity intelligence.')
      return
    }

    setMetrics(data || [])
    setMessage('Interpretive continuity intelligence loaded.')
  }

  const board = useMemo(() => {
    const latest = metrics[0] || null

    if (!latest) {
      return null
    }

    return buildInterpretiveBoard(latest)
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
            Interpretive Continuity Intelligence
          </p>

          <p style={styles.subtitle}>
            This board does not promote score-chasing. It interprets continuity
            posture through thresholds, structural patterns, survivability
            meaning, and executive action implications.
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
            <h2 style={styles.sectionTitle}>
              No continuity memory available yet.
            </h2>

            <p style={styles.bodyText}>
              Save governed snapshots from Operations to activate executive
              interpretation.
            </p>
          </section>
        )}

        {board && (
          <>
            <section style={styles.commandPanel}>
              <div>
                <p style={styles.panelEyebrow}>
                  Executive Command Posture
                </p>

                <h2 style={styles.commandPosture}>
                  {board.commandPosture}
                </h2>

                <p style={styles.commandMeaning}>
                  {board.commandMeaning}
                </p>
              </div>

              <div style={styles.implicationBox}>
                <p style={styles.panelEyebrow}>
                  Executive Implication
                </p>

                <p style={styles.implicationText}>
                  {board.executiveImplication}
                </p>
              </div>
            </section>

            <section style={styles.interpretiveGrid}>
              <InterpretivePanel
                title="Survivability Interpretation"
                threshold={board.survivabilityThreshold}
                text={board.survivabilityInterpretation}
              />

              <InterpretivePanel
                title="Pressure Meaning"
                threshold={board.pressureThreshold}
                text={
                  board.latest.dominant_pressure_source ||
                  'No dominant pressure source recorded.'
                }
              />

              <InterpretivePanel
                title="Trajectory Meaning"
                threshold={board.trajectoryThreshold}
                text={
                  board.latest.dominant_trajectory_signal ||
                  'No dominant trajectory signal recorded.'
                }
              />

              <InterpretivePanel
                title="Structural Memory"
                threshold={board.memoryThreshold}
                text={board.structuralPattern}
              />
            </section>

            <section style={styles.actionPanel}>
              <div>
                <p style={styles.panelEyebrow}>
                  Executive Action Requirement
                </p>

                <h2 style={styles.actionThreshold}>
                  {board.actionThreshold}
                </h2>

                <p style={styles.bodyText}>
                  {board.actionCue}
                </p>
              </div>

              <div style={styles.deadlineBox}>
                <p style={styles.panelEyebrow}>
                  Action Window
                </p>

                <strong>
                  {board.actionDeadline}
                </strong>
              </div>
            </section>

            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Why This Posture Was Reached
              </h2>

              <div style={styles.reasonGrid}>
                <ReasonBlock
                  label="Pressure threshold"
                  value={board.pressureThreshold}
                  text={explainPressure(board)}
                />

                <ReasonBlock
                  label="Recovery threshold"
                  value={board.recoveryThreshold}
                  text={explainRecovery(board)}
                />

                <ReasonBlock
                  label="Survivability threshold"
                  value={board.survivabilityThreshold}
                  text={explainSurvivability(board)}
                />

                <ReasonBlock
                  label="Structural recurrence"
                  value={board.memoryThreshold}
                  text={explainMemory(board)}
                />
              </div>
            </section>

            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Recent Continuity Memory Trail
              </h2>

              <p style={styles.bodyText}>
                The trail is intentionally threshold-based. It shows how
                continuity posture is being interpreted over time without
                encouraging score gaming.
              </p>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Created</th>
                      <th style={styles.th}>Command</th>
                      <th style={styles.th}>Threat</th>
                      <th style={styles.th}>Urgency</th>
                      <th style={styles.th}>Deterioration</th>
                      <th style={styles.th}>Meaning</th>
                    </tr>
                  </thead>

                  <tbody>
                    {metrics.slice(0, 12).map((item) => {
                      const row = buildInterpretiveBoard(item)

                      return (
                        <tr key={item.id}>
                          <td style={styles.td}>
                            {formatDate(item.created_at)}
                          </td>

                          <td style={styles.td}>
                            {row.commandPosture}
                          </td>

                          <td style={styles.td}>
                            {item.survivability_threat_level || 'WATCH'}
                          </td>

                          <td style={styles.td}>
                            {item.executive_action_urgency || 'ROUTINE'}
                          </td>

                          <td style={styles.td}>
                            {item.structural_deterioration_state || 'STABLE'}
                          </td>

                          <td style={styles.td}>
                            {row.commandMeaning}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <button
                onClick={loadBoardMetrics}
                style={styles.primaryButton}
              >
                Refresh Interpretive Continuity Board
              </button>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function buildInterpretiveBoard(
  latest: CgiOperationalMetric
): InterpretiveBoard {
  const pressureThreshold = thresholdFromRisk(
    average([
      latest.propagation_risk,
      latest.routing_friction,
      latest.responder_pressure,
      latest.escalation_velocity,
      latest.coordination_instability,
      latest.stabilization_drag,
      latest.escalation_pressure_index,
    ])
  )

  const trajectoryThreshold = thresholdFromRisk(
    average([
      latest.trajectory_risk,
      latest.continuity_drift,
      latest.escalation_momentum,
      latest.unresolved_momentum,
    ])
  )

  const recoveryThreshold = thresholdFromStrength(
    average([
      latest.recovery_reliability_score,
      latest.recovery_direction,
      latest.stabilization_trend,
    ])
  )

  const survivabilityThreshold = thresholdFromStrength(
    latest.operational_survivability_score
  )

  const memoryThreshold = thresholdFromRisk(
    average([
      latest.structural_memory_risk,
      latest.routing_failure_recurrence,
      latest.escalation_corridor_recurrence,
      latest.institutional_fragility_signature,
      latest.intervention_failure_pattern,
      latest.responder_strain_recurrence,
      latest.continuity_collapse_recurrence,
    ])
  )

  const actionThreshold =
    urgencyToThreshold(latest.executive_action_urgency)

  const deteriorationState =
    latest.structural_deterioration_state || 'STABLE'

  const threatLevel =
    latest.survivability_threat_level || 'WATCH'

  const commandPosture = resolveCommandPosture({
    threatLevel,
    actionThreshold,
    deteriorationState,
    pressureThreshold,
    trajectoryThreshold,
    survivabilityThreshold,
    memoryThreshold,
  })

  const commandMeaning = buildCommandMeaning({
    commandPosture,
    deteriorationState,
    pressureThreshold,
    trajectoryThreshold,
    survivabilityThreshold,
    memoryThreshold,
  })

  const survivabilityInterpretation =
    buildSurvivabilityInterpretation({
      survivabilityThreshold,
      recoveryThreshold,
      deteriorationState,
    })

  const executiveImplication =
    buildExecutiveImplication({
      commandPosture,
      actionThreshold,
      deteriorationState,
    })

  const structuralPattern =
    latest.dominant_memory_pattern ||
    buildStructuralPattern({
      memoryThreshold,
      deteriorationState,
    })

  const actionDeadline =
    latest.executive_action_deadline ||
    'Next governance cycle'

  const actionCue =
    latest.action_cue ||
    buildActionCue({
      commandPosture,
      actionThreshold,
      actionDeadline,
    })

  return {
    latest,
    commandPosture,
    commandMeaning,
    survivabilityInterpretation,
    executiveImplication,
    structuralPattern,
    pressureThreshold,
    trajectoryThreshold,
    recoveryThreshold,
    survivabilityThreshold,
    memoryThreshold,
    actionThreshold,
    actionDeadline,
    actionCue,
  }
}

function resolveCommandPosture(input: {
  threatLevel: string
  actionThreshold: Threshold
  deteriorationState: string
  pressureThreshold: Threshold
  trajectoryThreshold: Threshold
  survivabilityThreshold: Threshold
  memoryThreshold: Threshold
}): CommandPosture {
  if (
    input.threatLevel === 'CRITICAL' ||
    input.actionThreshold === 'CRITICAL' ||
    input.survivabilityThreshold === 'CRITICAL'
  ) {
    return 'CRITICAL'
  }

  if (
    input.deteriorationState === 'ACCELERATING' ||
    input.pressureThreshold === 'HIGH' ||
    input.trajectoryThreshold === 'HIGH'
  ) {
    return 'ELEVATED'
  }

  if (
    input.deteriorationState === 'RECURRING' ||
    input.memoryThreshold === 'MODERATE' ||
    input.pressureThreshold === 'MODERATE' ||
    input.trajectoryThreshold === 'MODERATE'
  ) {
    return 'WATCH'
  }

  return 'STABLE'
}

function buildCommandMeaning(input: {
  commandPosture: CommandPosture
  deteriorationState: string
  pressureThreshold: Threshold
  trajectoryThreshold: Threshold
  survivabilityThreshold: Threshold
  memoryThreshold: Threshold
}) {
  if (input.commandPosture === 'CRITICAL') {
    return 'Continuity survivability is no longer sufficiently credible without immediate executive intervention.'
  }

  if (input.commandPosture === 'ELEVATED') {
    return 'Continuity remains active, but pressure or trajectory signals have intensified enough to require executive prioritization.'
  }

  if (input.commandPosture === 'WATCH') {
    return 'Continuity is not collapsing, but recurring pressure or memory patterns remain visible and must not be treated as resolved.'
  }

  return 'Continuity is currently holding, with no major recurring or accelerating instability pattern dominating the latest snapshot.'
}

function buildSurvivabilityInterpretation(input: {
  survivabilityThreshold: Threshold
  recoveryThreshold: Threshold
  deteriorationState: string
}) {
  if (input.survivabilityThreshold === 'CRITICAL') {
    return 'Survivability credibility is weak. Closure language should be avoided until recovery durability improves.'
  }

  if (
    input.survivabilityThreshold === 'HIGH' ||
    input.deteriorationState === 'ACCELERATING'
  ) {
    return 'Survivability remains vulnerable. Stabilization signals are not yet strong enough to carry executive confidence.'
  }

  if (
    input.survivabilityThreshold === 'MODERATE' ||
    input.recoveryThreshold === 'MODERATE'
  ) {
    return 'Survivability is forming but not fully settled. Recovery must remain under governed review.'
  }

  return 'Survivability posture is currently credible, provided recurring instability does not intensify.'
}

function buildExecutiveImplication(input: {
  commandPosture: CommandPosture
  actionThreshold: Threshold
  deteriorationState: string
}) {
  if (input.commandPosture === 'CRITICAL') {
    return 'Executive action should move immediately from monitoring to command intervention.'
  }

  if (input.commandPosture === 'ELEVATED') {
    return 'Leadership should prioritize the pressure corridor before it converts into survivability risk.'
  }

  if (input.commandPosture === 'WATCH') {
    return 'Executive escalation is not immediate, but recurring continuity drag requires governed review.'
  }

  return 'Continue governed monitoring. No immediate executive escalation is indicated.'
}

function buildStructuralPattern(input: {
  memoryThreshold: Threshold
  deteriorationState: string
}) {
  if (
    input.memoryThreshold === 'HIGH' ||
    input.deteriorationState === 'ACCELERATING'
  ) {
    return 'Structural memory suggests repeated instability is intensifying and may be forming a durable risk pattern.'
  }

  if (
    input.memoryThreshold === 'MODERATE' ||
    input.deteriorationState === 'RECURRING'
  ) {
    return 'Structural memory shows recurring instability. This should remain visible until stabilization credibility is established.'
  }

  return 'Structural memory does not currently show a dominant recurrence pattern.'
}

function buildActionCue(input: {
  commandPosture: CommandPosture
  actionThreshold: Threshold
  actionDeadline: string
}) {
  if (input.commandPosture === 'CRITICAL') {
    return `Immediate executive review required. Action window: ${input.actionDeadline}.`
  }

  if (input.commandPosture === 'ELEVATED') {
    return `Prioritize executive review and stabilize the dominant pressure corridor. Action window: ${input.actionDeadline}.`
  }

  if (input.commandPosture === 'WATCH') {
    return `Maintain governed review. Recurring instability must remain visible. Action window: ${input.actionDeadline}.`
  }

  return `Maintain continuity monitoring. Action window: ${input.actionDeadline}.`
}

function explainPressure(board: InterpretiveBoard) {
  if (board.pressureThreshold === 'HIGH') {
    return 'Pressure has moved beyond routine monitoring and may influence survivability if not governed.'
  }

  if (board.pressureThreshold === 'MODERATE') {
    return 'Pressure is not uncontrolled, but it remains visible enough to require review.'
  }

  return 'Pressure is currently contained within the latest snapshot.'
}

function explainRecovery(board: InterpretiveBoard) {
  if (board.recoveryThreshold === 'LOW') {
    return 'Recovery conversion is weak. Stabilization should not be treated as durable.'
  }

  if (board.recoveryThreshold === 'MODERATE') {
    return 'Recovery is forming, but durability still requires governance review.'
  }

  return 'Recovery is currently credible, provided pressure does not re-intensify.'
}

function explainSurvivability(board: InterpretiveBoard) {
  if (board.survivabilityThreshold === 'LOW') {
    return 'Survivability posture is credible in the latest snapshot.'
  }

  if (board.survivabilityThreshold === 'MODERATE') {
    return 'Survivability remains watchable because recurring strain could weaken durability.'
  }

  return 'Survivability requires executive attention before stabilization can be trusted.'
}

function explainMemory(board: InterpretiveBoard) {
  if (board.memoryThreshold === 'HIGH') {
    return 'Repeated instability patterns are materially visible and should be treated as structural.'
  }

  if (board.memoryThreshold === 'MODERATE') {
    return 'Recurring memory patterns remain visible and should not disappear from executive view.'
  }

  return 'No dominant recurrence pattern is currently driving the latest posture.'
}

function thresholdFromRisk(value: number): Threshold {
  if (value >= 75) return 'CRITICAL'
  if (value >= 55) return 'HIGH'
  if (value >= 35) return 'MODERATE'
  return 'LOW'
}

function thresholdFromStrength(value: number): Threshold {
  if (value < 35) return 'CRITICAL'
  if (value < 55) return 'HIGH'
  if (value < 75) return 'MODERATE'
  return 'LOW'
}

function urgencyToThreshold(value: string | null): Threshold {
  if (value === 'IMMEDIATE') return 'CRITICAL'
  if (value === 'PRIORITY') return 'HIGH'
  if (value === 'REVIEW') return 'MODERATE'
  return 'LOW'
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))

  if (valid.length === 0) return 0

  return Math.round(
    valid.reduce((sum, value) => sum + value, 0) /
      valid.length
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

function InterpretivePanel({
  title,
  threshold,
  text,
}: {
  title: string
  threshold: Threshold
  text: string
}) {
  return (
    <article style={styles.interpretivePanel}>
      <p style={styles.panelEyebrow}>
        {title}
      </p>

      <h3 style={styles.thresholdLabel}>
        {threshold}
      </h3>

      <p style={styles.bodyText}>
        {text}
      </p>
    </article>
  )
}

function ReasonBlock({
  label,
  value,
  text,
}: {
  label: string
  value: string
  text: string
}) {
  return (
    <div style={styles.reasonBlock}>
      <p style={styles.panelEyebrow}>
        {label}
      </p>

      <strong style={styles.reasonValue}>
        {value}
      </strong>

      <p style={styles.bodyText}>
        {text}
      </p>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: 'white',
  },

  container: {
    maxWidth: '1220px',
    margin: '0 auto',
  },

  hero: {
    marginBottom: '34px',
  },

  kicker: {
    color: '#67e8f9',
    fontSize: '13px',
    fontWeight: 900,
    letterSpacing: '3px',
  },

  title: {
    fontSize: 'clamp(42px, 8vw, 76px)',
    lineHeight: 1,
    margin: '12px 0',
    letterSpacing: '-0.06em',
  },

  enterpriseSubtitle: {
    color: '#a7f3d0',
    fontSize: 'clamp(22px, 4vw, 36px)',
    fontWeight: 900,
    margin: '0 0 18px',
  },

  subtitle: {
    color: '#cbd5e1',
    maxWidth: '900px',
    lineHeight: 1.8,
    fontSize: '18px',
  },

  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
    marginTop: '24px',
  },

  doctrineCard: {
    background: '#020617',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
    color: '#cffafe',
    fontWeight: 800,
    lineHeight: 1.5,
  },

  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '16px 18px',
    borderRadius: '16px',
    fontWeight: 800,
    marginBottom: '22px',
  },

  commandPanel: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(0, 1.4fr) minmax(320px, 0.8fr)',
    gap: '22px',
    background: '#020617',
    border: '1px solid #67e8f9',
    borderRadius: '34px',
    padding: '34px',
    marginBottom: '26px',
    boxShadow:
      '0 24px 80px rgba(0,0,0,0.45)',
  },

  panelEyebrow: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: '12px',
    marginTop: 0,
    marginBottom: '10px',
  },

  commandPosture: {
    fontSize: 'clamp(48px, 10vw, 96px)',
    lineHeight: 0.95,
    margin: '0 0 22px',
    color: '#67e8f9',
    letterSpacing: '-0.07em',
  },

  commandMeaning: {
    color: '#e2e8f0',
    fontSize: '21px',
    lineHeight: 1.65,
    maxWidth: '760px',
    margin: 0,
  },

  implicationBox: {
    background: '#082f49',
    border: '1px solid #0891b2',
    borderRadius: '24px',
    padding: '24px',
    alignSelf: 'stretch',
  },

  implicationText: {
    color: '#cffafe',
    fontSize: '18px',
    lineHeight: 1.7,
    margin: 0,
    fontWeight: 700,
  },

  interpretiveGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '18px',
    marginBottom: '26px',
  },

  interpretivePanel: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '26px',
    padding: '26px',
    minHeight: '230px',
    boxShadow:
      '0 20px 60px rgba(0,0,0,0.32)',
  },

  thresholdLabel: {
    color: '#a7f3d0',
    fontSize: '34px',
    lineHeight: 1,
    margin: '0 0 18px',
    letterSpacing: '-0.04em',
  },

  actionPanel: {
    display: 'grid',
    gridTemplateColumns:
      'minmax(0, 1fr) minmax(240px, 0.4fr)',
    gap: '22px',
    background: '#020617',
    border: '1px solid #334155',
    borderRadius: '28px',
    padding: '30px',
    marginBottom: '28px',
  },

  actionThreshold: {
    color: '#67e8f9',
    fontSize: '42px',
    margin: '0 0 14px',
  },

  deadlineBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '22px',
    padding: '22px',
    color: '#e2e8f0',
    fontSize: '20px',
    lineHeight: 1.5,
  },

  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '26px',
    padding: '28px',
    marginBottom: '28px',
    boxShadow:
      '0 24px 70px rgba(0,0,0,0.35)',
  },

  sectionTitle: {
    fontSize: '30px',
    margin: '0 0 16px',
    letterSpacing: '-0.03em',
  },

  bodyText: {
    color: '#cbd5e1',
    lineHeight: 1.8,
    fontSize: '16px',
    marginTop: 0,
  },

  reasonGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '18px',
  },

  reasonBlock: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '22px',
    padding: '22px',
  },

  reasonValue: {
    display: 'block',
    color: '#a7f3d0',
    fontSize: '24px',
    marginBottom: '12px',
  },

  tableWrap: {
    overflowX: 'auto',
    marginTop: '20px',
    marginBottom: '20px',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '980px',
  },

  th: {
    textAlign: 'left',
    color: '#94a3b8',
    borderBottom: '1px solid #334155',
    padding: '14px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },

  td: {
    borderBottom: '1px solid #1e293b',
    padding: '16px 14px',
    color: '#e2e8f0',
    verticalAlign: 'top',
    lineHeight: 1.6,
  },

  primaryButton: {
    width: '100%',
    padding: '17px',
    borderRadius: '16px',
    border: 'none',
    background: '#67e8f9',
    color: '#082f49',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '16px',
  },
}