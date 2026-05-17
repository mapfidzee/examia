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

type InterpretiveThreshold =
  | 'CONTAINED'
  | 'WATCHABLE'
  | 'DESTABILIZING'
  | 'SURVIVABILITY_THREAT'

type CommandPosture =
  | 'STABLE COMMAND'
  | 'COMMAND WATCH'
  | 'ELEVATED COMMAND'
  | 'CRITICAL COMMAND'

type InterpretiveBoard = {
  latest: CgiOperationalMetric

  commandPosture: CommandPosture
  commandMeaning: string
  executiveImplication: string
  actionPosture: string
  actionDeadline: string
  actionCue: string

  pressureThreshold: InterpretiveThreshold
  trajectoryThreshold: InterpretiveThreshold
  survivabilityThreshold: InterpretiveThreshold
  memoryThreshold: InterpretiveThreshold
  recoveryThreshold: InterpretiveThreshold

  survivabilityInterpretation: string
  structuralPattern: string
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
  const [metrics, setMetrics] = useState<
    CgiOperationalMetric[]
  >([])

  const [message, setMessage] = useState('')

  useEffect(() => {
    loadBoardMetrics()
  }, [])

  async function loadBoardMetrics() {
    setMessage(
      'Loading interpretive continuity intelligence...'
    )

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', {
        ascending: false,
      })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)

      setMessage(
        'Failed to load interpretive continuity intelligence.'
      )

      return
    }

    setMetrics(data || [])

    setMessage(
      'Interpretive continuity intelligence loaded.'
    )
  }

  const board = useMemo(() => {
    const latest = metrics[0]

    if (!latest) {
      return null
    }

    return buildInterpretiveBoard(latest)
  }, [metrics])

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>
            TSINAXA CGI
          </p>

          <h1 style={styles.title}>
            Executive Stability Board
          </h1>

          <p style={styles.enterpriseSubtitle}>
            Interpretive Continuity Infrastructure
          </p>

          <p style={styles.subtitle}>
            Executive interpretation of continuity
            survivability, pressure propagation,
            structural recurrence, recovery credibility,
            and governed command readiness.
          </p>

          <section style={styles.doctrinePanel}>
            <p style={styles.doctrineTitle}>
              CGI DOCTRINE
            </p>

            <div style={styles.doctrineGrid}>
              {DOCTRINE.map((item) => (
                <div
                  key={item}
                  style={styles.doctrineCard}
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
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
              Save governed snapshots from
              Operations to activate executive
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
                title="Pressure Meaning"
                threshold={
                  board.pressureThreshold
                }
                text={
                  board.latest
                    .dominant_pressure_source ||
                  'No dominant pressure source recorded.'
                }
              />

              <InterpretivePanel
                title="Trajectory Meaning"
                threshold={
                  board.trajectoryThreshold
                }
                text={
                  board.latest
                    .dominant_trajectory_signal ||
                  'No dominant trajectory signal recorded.'
                }
              />

              <InterpretivePanel
                title="Survivability Meaning"
                threshold={
                  board.survivabilityThreshold
                }
                text={
                  board.survivabilityInterpretation
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
                  {board.actionPosture}
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
                  label="Pressure posture"
                  value={
                    board.pressureThreshold
                  }
                  text={explainPressure(board)}
                />

                <ReasonBlock
                  label="Recovery posture"
                  value={
                    board.recoveryThreshold
                  }
                  text={explainRecovery(board)}
                />

                <ReasonBlock
                  label="Survivability posture"
                  value={
                    board.survivabilityThreshold
                  }
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
                Continuity interpretation remains
                visible over time so recurrence,
                survivability pressure, and
                deterioration do not disappear after
                workflow completion.
              </p>

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Created
                      </th>

                      <th style={styles.th}>
                        Continuity Posture
                      </th>

                      <th style={styles.th}>
                        Recovery Credibility
                      </th>

                      <th style={styles.th}>
                        Structural Memory
                      </th>

                      <th style={styles.th}>
                        Executive Readiness
                      </th>

                      <th style={styles.th}>
                        Interpretation
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {metrics
                      .slice(0, 12)
                      .map((item) => {
                        const row =
                          buildInterpretiveBoard(
                            item
                          )

                        return (
                          <tr key={item.id}>
                            <td style={styles.td}>
                              {formatDate(
                                item.created_at
                              )}
                            </td>

                            <td style={styles.td}>
                              {
                                row.commandPosture
                              }
                            </td>

                            <td style={styles.td}>
                              {
                                row.recoveryThreshold
                              }
                            </td>

                            <td style={styles.td}>
                              {
                                row.memoryThreshold
                              }
                            </td>

                            <td style={styles.td}>
                              {
                                row.actionPosture
                              }
                            </td>

                            <td style={styles.td}>
                              {
                                row.commandMeaning
                              }
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
                Refresh Executive Stability Board
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
  const pressureThreshold =
    thresholdFromRisk(
      average([
        latest.propagation_risk,
        latest.routing_friction,
        latest.responder_pressure,
        latest.escalation_velocity,
        latest.coordination_instability,
        latest.stabilization_drag,
      ])
    )

  const trajectoryThreshold =
    thresholdFromRisk(
      average([
        latest.trajectory_risk,
        latest.continuity_drift,
        latest.escalation_momentum,
        latest.unresolved_momentum,
      ])
    )

  const recoveryThreshold =
    thresholdFromStrength(
      average([
        latest.recovery_reliability_score,
        latest.recovery_direction,
        latest.stabilization_trend,
      ])
    )

  const survivabilityThreshold =
    thresholdFromStrength(
      latest.operational_survivability_score
    )

  const memoryThreshold =
    thresholdFromRisk(
      average([
        latest.structural_memory_risk,
        latest.routing_failure_recurrence,
        latest.escalation_corridor_recurrence,
        latest.intervention_failure_pattern,
        latest.continuity_collapse_recurrence,
      ])
    )

  const commandPosture =
    resolveCommandPosture({
      pressureThreshold,
      trajectoryThreshold,
      survivabilityThreshold,
      memoryThreshold,
    })

  return {
    latest,

    commandPosture,

    commandMeaning:
      buildCommandMeaning(commandPosture),

    executiveImplication:
      buildExecutiveImplication(
        commandPosture
      ),

    actionPosture:
      resolveActionPosture(
        commandPosture
      ),

    actionDeadline:
      latest.executive_action_deadline ||
      'Next governance cycle',

    actionCue:
      latest.action_cue ||
      'Maintain governed executive continuity review.',

    pressureThreshold,
    trajectoryThreshold,
    survivabilityThreshold,
    memoryThreshold,
    recoveryThreshold,

    survivabilityInterpretation:
      buildSurvivabilityInterpretation(
        survivabilityThreshold
      ),

    structuralPattern:
      latest.dominant_memory_pattern ||
      'Structural memory remains visible.',
  }
}

function resolveCommandPosture(input: {
  pressureThreshold: InterpretiveThreshold
  trajectoryThreshold: InterpretiveThreshold
  survivabilityThreshold: InterpretiveThreshold
  memoryThreshold: InterpretiveThreshold
}): CommandPosture {
  if (
    input.pressureThreshold ===
      'SURVIVABILITY_THREAT' ||
    input.trajectoryThreshold ===
      'SURVIVABILITY_THREAT' ||
    input.survivabilityThreshold ===
      'SURVIVABILITY_THREAT'
  ) {
    return 'CRITICAL COMMAND'
  }

  if (
    input.pressureThreshold ===
      'DESTABILIZING' ||
    input.trajectoryThreshold ===
      'DESTABILIZING' ||
    input.memoryThreshold ===
      'DESTABILIZING'
  ) {
    return 'ELEVATED COMMAND'
  }

  if (
    input.pressureThreshold ===
      'WATCHABLE' ||
    input.trajectoryThreshold ===
      'WATCHABLE' ||
    input.memoryThreshold ===
      'WATCHABLE'
  ) {
    return 'COMMAND WATCH'
  }

  return 'STABLE COMMAND'
}

function buildCommandMeaning(
  posture: CommandPosture
) {
  if (posture === 'CRITICAL COMMAND') {
    return 'Continuity survivability is under visible threat and requires executive intervention.'
  }

  if (posture === 'ELEVATED COMMAND') {
    return 'Visible instability is intensifying and requires executive prioritization.'
  }

  if (posture === 'COMMAND WATCH') {
    return 'Instability remains visible and should not be treated as resolved.'
  }

  return 'Continuity posture is currently stable with no dominant survivability escalation visible.'
}

function buildExecutiveImplication(
  posture: CommandPosture
) {
  if (posture === 'CRITICAL COMMAND') {
    return 'Leadership should move from monitoring to direct command intervention.'
  }

  if (posture === 'ELEVATED COMMAND') {
    return 'Leadership should prioritize stabilization before survivability deteriorates further.'
  }

  if (posture === 'COMMAND WATCH') {
    return 'Governed monitoring should remain active until stabilization credibility becomes durable.'
  }

  return 'Routine governed continuity review remains appropriate.'
}

function resolveActionPosture(
  posture: CommandPosture
) {
  if (posture === 'CRITICAL COMMAND') {
    return 'EXECUTIVE INTERVENTION'
  }

  if (posture === 'ELEVATED COMMAND') {
    return 'EXECUTIVE PRIORITIZATION'
  }

  if (posture === 'COMMAND WATCH') {
    return 'GOVERNED REVIEW'
  }

  return 'ROUTINE MONITORING'
}

function buildSurvivabilityInterpretation(
  threshold: InterpretiveThreshold
) {
  if (
    threshold === 'SURVIVABILITY_THREAT'
  ) {
    return 'Survivability credibility is weak and should not be treated as stable.'
  }

  if (
    threshold === 'DESTABILIZING'
  ) {
    return 'Survivability remains vulnerable and requires continued governance review.'
  }

  if (
    threshold === 'WATCHABLE'
  ) {
    return 'Baseline survivability exists but durability still requires confirmation.'
  }

  return 'Survivability posture is currently credible.'
}

function explainPressure(
  board: InterpretiveBoard
) {
  if (
    board.pressureThreshold ===
    'SURVIVABILITY_THREAT'
  ) {
    return 'Pressure is threatening operational survivability.'
  }

  if (
    board.pressureThreshold ===
    'DESTABILIZING'
  ) {
    return 'Pressure is intensifying and requires governance attention.'
  }

  if (
    board.pressureThreshold ===
    'WATCHABLE'
  ) {
    return 'Pressure remains visible and should continue under review.'
  }

  return 'Pressure is currently contained.'
}

function explainRecovery(
  board: InterpretiveBoard
) {
  if (
    board.recoveryThreshold ===
    'SURVIVABILITY_THREAT'
  ) {
    return 'Recovery credibility is weak and should not support closure.'
  }

  if (
    board.recoveryThreshold ===
    'DESTABILIZING'
  ) {
    return 'Recovery remains fragile and requires stabilization reinforcement.'
  }

  if (
    board.recoveryThreshold ===
    'WATCHABLE'
  ) {
    return 'Recovery is visible but durability still requires confirmation.'
  }

  return 'Recovery posture is currently credible.'
}

function explainSurvivability(
  board: InterpretiveBoard
) {
  if (
    board.survivabilityThreshold ===
    'SURVIVABILITY_THREAT'
  ) {
    return 'Survivability posture requires executive attention.'
  }

  if (
    board.survivabilityThreshold ===
    'DESTABILIZING'
  ) {
    return 'Survivability is vulnerable and should remain under governance review.'
  }

  if (
    board.survivabilityThreshold ===
    'WATCHABLE'
  ) {
    return 'Survivability exists but remains watchable.'
  }

  return 'Survivability posture is currently stable.'
}

function explainMemory(
  board: InterpretiveBoard
) {
  if (
    board.memoryThreshold ===
    'SURVIVABILITY_THREAT'
  ) {
    return 'Structural recurrence is materially threatening survivability.'
  }

  if (
    board.memoryThreshold ===
    'DESTABILIZING'
  ) {
    return 'Recurring instability patterns remain operationally significant.'
  }

  if (
    board.memoryThreshold ===
    'WATCHABLE'
  ) {
    return 'Structural recurrence remains visible.'
  }

  return 'No dominant recurrence pattern is currently driving instability.'
}

function thresholdFromRisk(
  value: number
): InterpretiveThreshold {
  if (value >= 75) {
    return 'SURVIVABILITY_THREAT'
  }

  if (value >= 55) {
    return 'DESTABILIZING'
  }

  if (value >= 35) {
    return 'WATCHABLE'
  }

  return 'CONTAINED'
}

function thresholdFromStrength(
  value: number
): InterpretiveThreshold {
  if (value < 35) {
    return 'SURVIVABILITY_THREAT'
  }

  if (value < 55) {
    return 'DESTABILIZING'
  }

  if (value < 75) {
    return 'WATCHABLE'
  }

  return 'CONTAINED'
}

function average(values: number[]) {
  const valid = values.filter((value) =>
    Number.isFinite(value)
  )

  if (valid.length === 0) {
    return 0
  }

  return Math.round(
    valid.reduce(
      (sum, value) => sum + value,
      0
    ) / valid.length
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
  threshold: string
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

const styles: Record<
  string,
  CSSProperties
> = {
  page: {
    minHeight: '100vh',
    color: 'white',
  },

  container: {
    maxWidth: '1240px',
    margin: '0 auto',
    paddingBottom: '80px',
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
    fontSize:
      'clamp(44px, 7vw, 82px)',
    lineHeight: 0.95,
    margin: '12px 0',
    letterSpacing: '-0.07em',
  },

  enterpriseSubtitle: {
    color: '#a7f3d0',
    fontSize:
      'clamp(22px, 4vw, 34px)',
    fontWeight: 900,
    marginBottom: '18px',
  },

  subtitle: {
    color: '#cbd5e1',
    maxWidth: '900px',
    lineHeight: 1.8,
    fontSize: '18px',
  },

  doctrinePanel: {
    background: '#020617',
    border: '1px solid #334155',
    borderRadius: '28px',
    padding: '26px',
    marginTop: '26px',
  },

  doctrineTitle: {
    color: '#67e8f9',
    fontSize: '13px',
    fontWeight: 900,
    letterSpacing: '0.18em',
    marginBottom: '18px',
  },

  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
  },

  doctrineCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
    color: '#cffafe',
    fontWeight: 800,
    lineHeight: 1.6,
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
  },

  panelEyebrow: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: '12px',
    marginBottom: '10px',
  },

  commandPosture: {
    fontSize:
      'clamp(48px, 9vw, 94px)',
    lineHeight: 0.95,
    marginBottom: '20px',
    color: '#67e8f9',
    letterSpacing: '-0.07em',
  },

  commandMeaning: {
    color: '#e2e8f0',
    fontSize: '20px',
    lineHeight: 1.7,
  },

  implicationBox: {
    background: '#082f49',
    border: '1px solid #0891b2',
    borderRadius: '24px',
    padding: '24px',
  },

  implicationText: {
    color: '#cffafe',
    fontSize: '18px',
    lineHeight: 1.7,
    fontWeight: 700,
  },

  interpretiveGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '18px',
    marginBottom: '28px',
  },

  interpretivePanel: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '26px',
    padding: '26px',
    minHeight: '230px',
  },

  thresholdLabel: {
    color: '#a7f3d0',
    fontSize: '32px',
    lineHeight: 1.05,
    marginBottom: '18px',
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
    fontSize:
      'clamp(32px, 5vw, 48px)',
    lineHeight: 1,
    marginBottom: '14px',
  },

  deadlineBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '22px',
    padding: '22px',
    color: '#e2e8f0',
    fontSize: '20px',
  },

  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '26px',
    padding: '28px',
    marginBottom: '28px',
  },

  sectionTitle: {
    fontSize: '30px',
    marginBottom: '16px',
  },

  bodyText: {
    color: '#cbd5e1',
    lineHeight: 1.8,
    fontSize: '16px',
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
    minWidth: '1100px',
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
    lineHeight: 1.7,
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