'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  buildStabilityBoardRecords,
  buildStabilityBoardSummary,
  STABILITY_BOARD_DOCTRINE,
  type OutcomeRecord,
  type StabilityCase,
} from '@/lib/cgiSystemStabilityDoctrineEngine'
import { supabase } from '../../lib/supabase'

const CASE_SAMPLE_LIMIT = 120

export default function SystemPage() {
  return (
    <CGIGovernanceShell>
      <ExecutiveStabilityBoard />
    </CGIGovernanceShell>
  )
}

function ExecutiveStabilityBoard() {
  const [cases, setCases] = useState<StabilityCase[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadStabilityBoard()
  }, [])

  async function loadStabilityBoard() {
    setMessage('Loading Stability Board continuity posture...')

    const [casesResult, outcomesResult] = await Promise.all([
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

    if (casesResult.error) console.error(casesResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)

    if (casesResult.error || outcomesResult.error) {
      setMessage('Some Stability Board intelligence failed to load.')
      return
    }

    setCases(casesResult.data || [])
    setOutcomes(outcomesResult.data || [])
    setMessage('Stability Board continuity posture loaded.')
  }

  const stabilityRecords = useMemo(
    () => buildStabilityBoardRecords(cases, outcomes),
    [cases, outcomes],
  )

  const stabilitySummary = useMemo(
    () => buildStabilityBoardSummary(cases, stabilityRecords),
    [cases, stabilityRecords],
  )

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
              /system is the current Stability Board. Current lifecycle truth
              overrides historical memory when active lifecycle records are
              clear.
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
              Current lifecycle truth overrides historical memory. Recovery is
              absorbed into institutional posture only when durability is
              credible. Historical memory remains visible but does not create
              current command pressure.
            </p>
          </section>
        )}

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Stability Absorption Summary</h2>
          <p style={styles.bodyText}>
            The Stability Board answers whether recovery can be institutionally
            absorbed, whether it remains fragile, what remains unresolved, and
            what memory must not be forgotten.
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

        <details style={styles.evidencePanel}>
          <summary style={styles.evidenceSummary}>
            <span>
              <span style={styles.panelEyebrow}>
                Supporting Stability Evidence
              </span>
              <strong style={styles.evidenceTitle}>
                Recovery records, stability absorption, and audit reconstruction
              </strong>
            </span>

            <span style={styles.evidenceToggle}>Expand Evidence</span>
          </summary>

          <section style={styles.cardNested}>
            <h2 style={styles.sectionTitle}>Recovery-to-Stability Board</h2>
            <p style={styles.bodyText}>
              These records are inherited from recovery durability evidence. The
              Stability Board preserves disposition, reason, command posture,
              recurrence signal, and memory impact.
            </p>

            {stabilityRecords.length === 0 && (
              <div style={styles.emptyState}>
                No recovery durability records are currently available for
                Stability Board absorption. Current lifecycle posture remains
                clean.
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
        </details>

        <section style={styles.doctrineFooter}>
          <strong>STABILITY BOARD DOCTRINE</strong>
          <span>
            Current lifecycle truth overrides historical memory. Recovery is
            absorbed into institutional posture only when durability is credible.
            Historical memory remains visible but does not create current
            command pressure.
          </span>
        </section>

        <button onClick={loadStabilityBoard} style={styles.primaryButton}>
          Refresh Stability Board
        </button>
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
    <div style={styles.absorptionBlock}>
      <p style={styles.panelEyebrow}>{label}</p>
      <strong style={styles.absorptionValue}>{value}</strong>
      <p style={styles.bodyText}>{text}</p>
    </div>
  )
}

const gold = '#d6b25e'
const mutedGold = '#9f8142'
const deepBlack = '#030303'
const panelBlack = '#090807'
const cardBlack = '#11100d'
const softLine = 'rgba(214,178,94,0.24)'
const strongLine = 'rgba(214,178,94,0.42)'

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: '#fff8e7',
    overflowX: 'hidden',
    background:
      'radial-gradient(circle at top left, rgba(214,178,94,0.12), transparent 34%), linear-gradient(135deg, #030303 0%, #090807 48%, #11100d 100%)',
    padding: '32px 24px 64px',
  },
  container: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
    display: 'grid',
    gap: '14px',
    boxSizing: 'border-box',
  },
  hero: {
    marginBottom: '0',
    paddingTop: '0',
  },
  kicker: {
    color: gold,
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.18em',
    margin: 0,
  },
  title: {
    fontSize: 'clamp(32px, 5vw, 48px)',
    lineHeight: 1.02,
    margin: '8px 0',
    letterSpacing: '-0.05em',
  },
  enterpriseSubtitle: {
    color: gold,
    fontSize: 'clamp(20px, 3vw, 27px)',
    fontWeight: 900,
    margin: '0 0 8px',
  },
  subtitle: {
    color: '#cfc7b5',
    maxWidth: '820px',
    lineHeight: 1.6,
    fontSize: '15px',
    margin: 0,
  },
  doctrinePanel: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '18px',
    marginTop: '14px',
    marginBottom: '0',
  },
  doctrineTitle: {
    color: gold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.16em',
    margin: '0 0 12px',
  },
  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '10px',
  },
  doctrineCard: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '13px',
    color: '#fff8e7',
    fontWeight: 850,
    lineHeight: 1.45,
    fontSize: '13px',
  },
  message: {
    background: 'rgba(214,178,94,0.12)',
    color: gold,
    border: `1px solid ${softLine}`,
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: 850,
    fontSize: '13px',
  },
  stabilityPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 0.6fr)',
    gap: '16px',
    background: deepBlack,
    border: `1px solid ${strongLine}`,
    borderRadius: '24px',
    padding: '22px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  stabilityPosture: {
    fontSize: 'clamp(34px, 6vw, 54px)',
    lineHeight: 1,
    margin: '6px 0 10px',
    color: gold,
    letterSpacing: '-0.055em',
  },
  commandMeaning: {
    color: '#f5f0e6',
    fontSize: '15px',
    lineHeight: 1.55,
    maxWidth: '720px',
    margin: 0,
  },
  implicationBox: {
    background: 'rgba(214,178,94,0.1)',
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },
  implicationText: {
    color: '#f5f0e6',
    fontSize: '13px',
    lineHeight: 1.55,
    margin: 0,
    fontWeight: 750,
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
  },
  metricCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '15px',
    minHeight: '118px',
    boxSizing: 'border-box',
  },
  panelEyebrow: {
    color: '#9ca3af',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontSize: '10px',
    margin: '0 0 7px',
  },
  metricValue: {
    color: gold,
    fontSize: '31px',
    lineHeight: 1,
    margin: '6px 0 8px',
  },
  bodyText: {
    color: '#cfc7b5',
    lineHeight: 1.55,
    fontSize: '13px',
    margin: 0,
  },
  memoryOnlyPanel: {
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.13), rgba(255,255,255,0.035))',
    border: `1px solid ${strongLine}`,
    borderRadius: '22px',
    padding: '18px',
  },
  memoryOnlyTitle: {
    color: gold,
    fontSize: 'clamp(28px, 4vw, 38px)',
    lineHeight: 1,
    margin: '6px 0 10px',
    letterSpacing: '-0.04em',
  },
  card: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '18px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: '22px',
    margin: '0 0 10px',
    lineHeight: 1.2,
    color: '#fff8e7',
  },
  absorptionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: '10px',
    marginTop: '14px',
  },
  absorptionBlock: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '14px',
    minHeight: '118px',
  },
  absorptionValue: {
    display: 'block',
    color: gold,
    fontSize: '22px',
    marginBottom: '8px',
    overflowWrap: 'anywhere',
  },
  evidencePanel: {
    padding: '20px',
    borderRadius: '24px',
    background: panelBlack,
    border: `1px solid ${softLine}`,
  },
  evidenceSummary: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '18px',
    listStyle: 'none',
  },
  evidenceTitle: {
    display: 'block',
    color: '#fff8e7',
    fontSize: '20px',
    lineHeight: 1.2,
    marginTop: '6px',
    letterSpacing: '-0.035em',
  },
  evidenceToggle: {
    flex: '0 0 auto',
    borderRadius: '999px',
    padding: '10px 14px',
    background: 'rgba(214,178,94,0.12)',
    border: `1px solid ${softLine}`,
    color: gold,
    fontSize: '11px',
    fontWeight: 950,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  cardNested: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '18px',
    marginTop: '16px',
  },
  emptyState: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '14px',
    color: '#cfc7b5',
    lineHeight: 1.55,
    marginTop: '14px',
    fontSize: '13px',
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
    marginTop: '12px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '940px',
  },
  th: {
    textAlign: 'left',
    color: '#9ca3af',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    padding: '10px',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  td: {
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    padding: '10px',
    color: '#f5f0e6',
    verticalAlign: 'top',
    lineHeight: 1.5,
    fontSize: '12px',
  },
  doctrineFooter: {
    display: 'grid',
    gap: '8px',
    padding: '20px',
    borderRadius: '22px',
    background: deepBlack,
    border: `1px solid ${strongLine}`,
    color: '#fff8e7',
    lineHeight: 1.65,
    fontSize: '13px',
  },
  primaryButton: {
    width: '100%',
    padding: '13px',
    borderRadius: '14px',
    border: 'none',
    background: gold,
    color: '#11100d',
    fontWeight: 950,
    cursor: 'pointer',
    fontSize: '14px',
  },
}