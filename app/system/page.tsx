'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  buildInterpretiveBoard,
  explainMemory,
  explainPressure,
  explainRecovery,
  explainSurvivability,
  formatSystemDate,
  type CgiOperationalMetric,
} from '@/lib/cgiSystemExecutiveInterpretationEngine'
import {
  buildStabilityBoardRecords,
  buildStabilityBoardSummary,
  STABILITY_BOARD_DOCTRINE,
  type OutcomeRecord,
  type StabilityCase,
} from '@/lib/cgiSystemStabilityDoctrineEngine'
import { supabase } from '../../lib/supabase'

const SAMPLE_LIMIT = 80
const CASE_SAMPLE_LIMIT = 120

export default function SystemPage() {
  return (
    <CGIGovernanceShell>
      <ExecutiveStabilityBoard />
    </CGIGovernanceShell>
  )
}

function ExecutiveStabilityBoard() {
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [cases, setCases] = useState<StabilityCase[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadStabilityBoard()
  }, [])

  async function loadStabilityBoard() {
    setMessage('Loading Stability Board continuity posture...')

    const [metricsResult, casesResult, outcomesResult] = await Promise.all([
      supabase
        .from('cgi_operational_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(SAMPLE_LIMIT),
      supabase
        .from('beneficiary_cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(CASE_SAMPLE_LIMIT),
      supabase
        .from('case_outcomes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(CASE_SAMPLE_LIMIT),
    ])

    if (metricsResult.error) console.error(metricsResult.error)
    if (casesResult.error) console.error(casesResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)

    if (metricsResult.error || casesResult.error || outcomesResult.error) {
      setMessage('Some Stability Board intelligence failed to load.')
      return
    }

    setMetrics(metricsResult.data || [])
    setCases(casesResult.data || [])
    setOutcomes(outcomesResult.data || [])
    setMessage('Stability Board continuity posture loaded.')
  }

  const historicalBoard = useMemo(() => {
    const latest = metrics[0]
    if (!latest) return null
    return buildInterpretiveBoard(latest)
  }, [metrics])

  const stabilityRecords = useMemo(
    () => buildStabilityBoardRecords(cases, outcomes),
    [cases, outcomes],
  )

  const stabilitySummary = useMemo(
    () => buildStabilityBoardSummary(cases, stabilityRecords),
    [cases, stabilityRecords],
  )

  const shouldShowCurrentExecutiveReading =
    Boolean(historicalBoard) && !stabilitySummary.currentLifecycleClear

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • STABILITY BOARD</p>
          <h1 style={styles.title}>System Stability Board</h1>
          <p style={styles.enterpriseSubtitle}>
            Institutional Stability Posture
          </p>
          <p style={styles.subtitle}>
            Absorb recovered instability into institutional posture while
            preserving memory, recurrence, and unresolved risk.
          </p>

          <section style={styles.doctrinePanel}>
            <p style={styles.doctrineTitle}>STABILITY BOARD DOCTRINE</p>
            <div style={styles.doctrineGrid}>
              {STABILITY_BOARD_DOCTRINE.map((item) => (
                <div key={item} style={styles.doctrineCard}>
                  {item}
                </div>
              ))}
            </div>
          </section>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.stabilityPanel}>
          <div>
            <p style={styles.panelEyebrow}>
              Current Institutional Stability Posture
            </p>
            <h2 style={styles.stabilityPosture}>
              {stabilitySummary.boardPosture}
            </h2>
            <p style={styles.commandMeaning}>{stabilitySummary.boardMeaning}</p>
          </div>

          <div style={styles.implicationBox}>
            <p style={styles.panelEyebrow}>Board Function</p>
            <p style={styles.implicationText}>
              /system is the current Stability Board. Historical metrics remain
              visible as memory, but they do not create current command pressure
              when active lifecycle records are clear.
            </p>
          </div>
        </section>

        <section style={styles.metricGrid}>
          <MetricCard
            label="Active Instability"
            value={stabilitySummary.activeInstability}
            text="Cases that still carry active lifecycle pressure."
          />
          <MetricCard
            label="Stabilized"
            value={stabilitySummary.stabilized}
            text="Cases currently marked as stabilized."
          />
          <MetricCard
            label="Fragile Recovery"
            value={stabilitySummary.fragileRecovery}
            text="Recovery records requiring watch, monitoring, or return review."
          />
          <MetricCard
            label="Command Pressure"
            value={stabilitySummary.unresolvedCommandPressure}
            text="Current lifecycle records requiring command watch or escalation."
          />
        </section>

        {stabilitySummary.currentLifecycleClear && (
          <section style={styles.memoryOnlyPanel}>
            <p style={styles.panelEyebrow}>Institutional Memory Status</p>
            <h2 style={styles.memoryOnlyTitle}>MEMORY PRESERVED</h2>
            <p style={styles.bodyText}>
              Current lifecycle posture is clear. Historical operational metrics
              remain preserved for institutional learning, but they are not
              allowed to override the current Stability Board posture.
            </p>
          </section>
        )}

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Stability Absorption Summary</h2>
          <p style={styles.bodyText}>
            The Stability Board answers whether recovery can be institutionally
            absorbed, whether it remains fragile, whether command pressure is
            unresolved, whether evidence must return to Outcomes or
            Interventions, and what memory must not be forgotten.
          </p>

          <div style={styles.absorptionGrid}>
            <AbsorptionBlock
              label="Absorbable"
              value={stabilitySummary.absorbable}
              text="Durable recovery can move into institutional posture."
            />
            <AbsorptionBlock
              label="Watch"
              value={stabilitySummary.watch}
              text="Recovery remains visible but not fully escalated."
            />
            <AbsorptionBlock
              label="Command"
              value={stabilitySummary.commandPressure}
              text="Command watch or escalation remains unresolved."
            />
            <AbsorptionBlock
              label="Evidence Return"
              value={stabilitySummary.evidenceReturn}
              text="Evidence or intervention credibility requires review."
            />
            <AbsorptionBlock
              label="Monitoring"
              value={stabilitySummary.recoveryMonitoring}
              text="Durability observation continues."
            />
            <AbsorptionBlock
              label="Memory Preserved"
              value={stabilitySummary.memoryPreserved}
              text="Structural memory remains visible in recovery evidence."
            />
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Recovery-to-Stability Board</h2>
          <p style={styles.bodyText}>
            These records are inherited from recovery durability evidence. The
            Stability Board preserves disposition, reason, command posture,
            recurrence signal, and memory impact.
          </p>

          {stabilityRecords.length === 0 && (
            <div style={styles.emptyState}>
              No recovery durability records are currently available for
              Stability Board absorption. Current lifecycle posture remains clean.
            </div>
          )}

          {stabilityRecords.length > 0 && (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Case</th>
                    <th style={styles.th}>Disposition</th>
                    <th style={styles.th}>Absorption Class</th>
                    <th style={styles.th}>Command Posture</th>
                    <th style={styles.th}>Durability</th>
                    <th style={styles.th}>Board Meaning</th>
                  </tr>
                </thead>

                <tbody>
                  {stabilityRecords.slice(0, 18).map((record) => (
                    <tr
                      key={`${record.caseItem.id}-${
                        record.latestRecoveryReview?.id || 'case'
                      }`}
                    >
                      <td style={styles.td}>
                        <strong>{record.caseItem.beneficiary_name}</strong>
                        <br />
                        {record.caseItem.support_domain}
                      </td>
                      <td style={styles.td}>{record.recoveryDisposition}</td>
                      <td style={styles.td}>{record.absorptionClass}</td>
                      <td style={styles.td}>{record.commandPosture}</td>
                      <td style={styles.td}>
                        {record.durabilityResult}
                        <br />
                        {record.reburnSignal}
                      </td>
                      <td style={styles.td}>{record.stabilityMeaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {shouldShowCurrentExecutiveReading && historicalBoard && (
          <>
            <section style={styles.commandPanel}>
              <div>
                <p style={styles.panelEyebrow}>
                  Current Executive Continuity Reading
                </p>
                <h2 style={styles.commandPosture}>
                  {historicalBoard.commandPosture}
                </h2>
                <p style={styles.commandMeaning}>
                  {historicalBoard.commandMeaning}
                </p>
              </div>

              <div style={styles.implicationBox}>
                <p style={styles.panelEyebrow}>Executive Implication</p>
                <p style={styles.implicationText}>
                  {historicalBoard.executiveImplication}
                </p>
              </div>
            </section>

            <section style={styles.interpretiveGrid}>
              <InterpretivePanel
                title="Pressure Meaning"
                threshold={historicalBoard.pressureThreshold}
                text={
                  historicalBoard.latest.dominant_pressure_source ||
                  'No dominant pressure source recorded.'
                }
              />
              <InterpretivePanel
                title="Trajectory Meaning"
                threshold={historicalBoard.trajectoryThreshold}
                text={
                  historicalBoard.latest.dominant_trajectory_signal ||
                  'No dominant trajectory signal recorded.'
                }
              />
              <InterpretivePanel
                title="Survivability Meaning"
                threshold={historicalBoard.survivabilityThreshold}
                text={historicalBoard.survivabilityInterpretation}
              />
              <InterpretivePanel
                title="Structural Memory"
                threshold={historicalBoard.memoryThreshold}
                text={historicalBoard.structuralPattern}
              />
            </section>

            <section style={styles.actionPanel}>
              <div>
                <p style={styles.panelEyebrow}>Executive Action Requirement</p>
                <h2 style={styles.actionThreshold}>
                  {historicalBoard.actionPosture}
                </h2>
                <p style={styles.bodyText}>{historicalBoard.actionCue}</p>
              </div>

              <div style={styles.deadlineBox}>
                <p style={styles.panelEyebrow}>Action Window</p>
                <strong>{historicalBoard.actionDeadline}</strong>
              </div>
            </section>

            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>Why This Posture Was Reached</h2>
              <div style={styles.reasonGrid}>
                <ReasonBlock
                  label="Pressure posture"
                  value={historicalBoard.pressureThreshold}
                  text={explainPressure(historicalBoard)}
                />
                <ReasonBlock
                  label="Recovery posture"
                  value={historicalBoard.recoveryThreshold}
                  text={explainRecovery(historicalBoard)}
                />
                <ReasonBlock
                  label="Survivability posture"
                  value={historicalBoard.survivabilityThreshold}
                  text={explainSurvivability(historicalBoard)}
                />
                <ReasonBlock
                  label="Structural recurrence"
                  value={historicalBoard.memoryThreshold}
                  text={explainMemory(historicalBoard)}
                />
              </div>
            </section>
          </>
        )}

        {!historicalBoard && (
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              No continuity metrics available yet.
            </h2>
            <p style={styles.bodyText}>
              Stability Board absorption can still read lifecycle records. The
              historical metric layer will activate when governed snapshots are
              available.
            </p>
          </section>
        )}

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Historical Stability Memory Trail</h2>
          <p style={styles.bodyText}>
            These rows are historical memory. They preserve prior snapshots for
            learning and audit, but they do not override current lifecycle truth
            when the Stability Board is clear.
          </p>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Historical Posture</th>
                  <th style={styles.th}>Recovery Memory</th>
                  <th style={styles.th}>Structural Memory</th>
                  <th style={styles.th}>Historical Readiness</th>
                  <th style={styles.th}>Memory Interpretation</th>
                </tr>
              </thead>

              <tbody>
                {metrics.slice(0, 12).map((item) => {
                  const row = buildInterpretiveBoard(item)

                  return (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        {formatSystemDate(item.created_at)}
                      </td>
                      <td style={styles.td}>{row.commandPosture}</td>
                      <td style={styles.td}>{row.recoveryThreshold}</td>
                      <td style={styles.td}>{row.memoryThreshold}</td>
                      <td style={styles.td}>{row.actionPosture}</td>
                      <td style={styles.td}>{row.commandMeaning}</td>
                    </tr>
                  )
                })}

                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No historical metric memory trail currently available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button onClick={loadStabilityBoard} style={styles.primaryButton}>
            Refresh Stability Board
          </button>
        </section>
      </div>
    </main>
  )
}

function MetricCard({
  label,
  value,
  text,
}: {
  label: string
  value: number
  text: string
}) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.panelEyebrow}>{label}</p>
      <h3 style={styles.metricValue}>{value}</h3>
      <p style={styles.bodyText}>{text}</p>
    </article>
  )
}

function AbsorptionBlock({
  label,
  value,
  text,
}: {
  label: string
  value: number
  text: string
}) {
  return (
    <div style={styles.reasonBlock}>
      <p style={styles.panelEyebrow}>{label}</p>
      <strong style={styles.reasonValue}>{value}</strong>
      <p style={styles.bodyText}>{text}</p>
    </div>
  )
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
      <p style={styles.panelEyebrow}>{title}</p>
      <h3 style={styles.thresholdLabel}>{threshold}</h3>
      <p style={styles.bodyText}>{text}</p>
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
      <p style={styles.panelEyebrow}>{label}</p>
      <strong style={styles.reasonValue}>{value}</strong>
      <p style={styles.bodyText}>{text}</p>
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
  hero: {
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
    letterSpacing: '-0.04em',
  },
  enterpriseSubtitle: {
    color: '#fde68a',
    fontSize: 'clamp(20px, 3vw, 28px)',
    fontWeight: 900,
    margin: '0 0 10px',
  },
  subtitle: {
    color: '#d6d3d1',
    maxWidth: '820px',
    lineHeight: 1.65,
    fontSize: '16px',
    margin: 0,
  },
  doctrinePanel: {
    background: '#111111',
    border: '1px solid rgba(251, 191, 36, 0.28)',
    borderRadius: '22px',
    padding: '20px',
    marginTop: '18px',
    marginBottom: '16px',
  },
  doctrineTitle: {
    color: '#fbbf24',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.16em',
    margin: '0 0 14px',
  },
  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
  },
  doctrineCard: {
    background: '#050505',
    border: '1px solid rgba(251, 191, 36, 0.18)',
    borderRadius: '16px',
    padding: '14px',
    color: '#fef3c7',
    fontWeight: 800,
    lineHeight: 1.5,
    fontSize: '14px',
  },
  message: {
    background: 'rgba(16, 185, 129, 0.14)',
    color: '#bbf7d0',
    border: '1px solid rgba(16, 185, 129, 0.28)',
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '16px',
    fontSize: '14px',
  },
  stabilityPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 0.6fr)',
    gap: '16px',
    background: '#050505',
    border: '1px solid rgba(251, 191, 36, 0.48)',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  stabilityPosture: {
    fontSize: 'clamp(34px, 6vw, 56px)',
    lineHeight: 1,
    margin: '8px 0 12px',
    color: '#fbbf24',
    letterSpacing: '-0.05em',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  metricCard: {
    background: '#111111',
    border: '1px solid #262626',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '136px',
    boxSizing: 'border-box',
  },
  metricValue: {
    color: '#fbbf24',
    fontSize: '34px',
    lineHeight: 1,
    margin: '8px 0 10px',
  },
  memoryOnlyPanel: {
    background: 'rgba(251, 191, 36, 0.08)',
    border: '1px solid rgba(251, 191, 36, 0.28)',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
  },
  memoryOnlyTitle: {
    color: '#fbbf24',
    fontSize: 'clamp(28px, 4vw, 38px)',
    lineHeight: 1,
    margin: '8px 0 12px',
    letterSpacing: '-0.04em',
  },
  panelEyebrow: {
    color: '#a8a29e',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontSize: '12px',
    margin: '0 0 8px',
  },
  commandPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 0.6fr)',
    gap: '16px',
    background: '#050505',
    border: '1px solid #262626',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  commandPosture: {
    fontSize: 'clamp(34px, 6vw, 56px)',
    lineHeight: 1,
    margin: '8px 0 12px',
    color: '#fbbf24',
    letterSpacing: '-0.05em',
  },
  commandMeaning: {
    color: '#e7e5e4',
    fontSize: '16px',
    lineHeight: 1.6,
    maxWidth: '720px',
    margin: 0,
  },
  implicationBox: {
    background: 'rgba(251, 191, 36, 0.09)',
    border: '1px solid rgba(251, 191, 36, 0.32)',
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },
  implicationText: {
    color: '#fef3c7',
    fontSize: '14px',
    lineHeight: 1.55,
    margin: 0,
    fontWeight: 700,
  },
  interpretiveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  interpretivePanel: {
    background: '#111111',
    border: '1px solid #262626',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
    boxSizing: 'border-box',
  },
  thresholdLabel: {
    color: '#fde68a',
    fontSize: '22px',
    lineHeight: 1.1,
    margin: '8px 0 10px',
    overflowWrap: 'anywhere',
  },
  actionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 0.45fr)',
    gap: '16px',
    background: '#050505',
    border: '1px solid #262626',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
  },
  actionThreshold: {
    color: '#fbbf24',
    fontSize: 'clamp(28px, 4vw, 38px)',
    lineHeight: 1.05,
    margin: '8px 0 10px',
  },
  deadlineBox: {
    background: '#111111',
    border: '1px solid #262626',
    borderRadius: '18px',
    padding: '16px',
    color: '#e7e5e4',
    fontSize: '16px',
    lineHeight: 1.5,
  },
  card: {
    background: '#050505',
    border: '1px solid #262626',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: '22px',
    margin: '0 0 12px',
    lineHeight: 1.2,
  },
  bodyText: {
    color: '#d6d3d1',
    lineHeight: 1.6,
    fontSize: '14px',
    margin: 0,
  },
  absorptionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '16px',
  },
  reasonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
  },
  reasonBlock: {
    background: '#111111',
    border: '1px solid #262626',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '140px',
  },
  reasonValue: {
    display: 'block',
    color: '#fde68a',
    fontSize: '18px',
    marginBottom: '10px',
    overflowWrap: 'anywhere',
  },
  emptyState: {
    background: '#111111',
    border: '1px solid #262626',
    borderRadius: '18px',
    padding: '16px',
    color: '#d6d3d1',
    lineHeight: 1.6,
    marginTop: '16px',
    fontSize: '14px',
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
    marginTop: '14px',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '940px',
  },
  th: {
    textAlign: 'left',
    color: '#a8a29e',
    borderBottom: '1px solid #262626',
    padding: '10px',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  td: {
    borderBottom: '1px solid #1f1f1f',
    padding: '10px',
    color: '#e7e5e4',
    verticalAlign: 'top',
    lineHeight: 1.55,
    fontSize: '13px',
  },
  primaryButton: {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    border: 'none',
    background: '#fbbf24',
    color: '#111111',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '15px',
  },
}