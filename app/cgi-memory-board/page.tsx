'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIExecutiveMemoryBoard } from '@/lib/cgiExecutiveMemoryBoardEngine'
import type { CGIHistoricalContinuitySnapshot } from '@/lib/cgiHistoricalContinuityEngine'
import { loadCGIContinuitySnapshots } from '@/lib/cgiPersistenceEngine'

type PersistedContinuitySnapshot = CGIHistoricalContinuitySnapshot & {
  id: string
  created_at: string
  snapshot_label: string | null
  source_route: string
  continuity_confidence: string | null
  survivability_pressure: string | null
  recovery_credibility: string | null
  recurrence_severity: string | null
  dominant_concern: string | null
  executive_reading: string | null
  required_action: string | null
  required_evidence: string | null
  evidence_verified: boolean
  accountability_active: boolean
  structural_memory_visible: boolean
  raw_payload: Record<string, unknown>
}

export default function CGIMemoryBoardPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
    >
      <CGIGovernanceShell>
        <CGIMemoryBoardContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function CGIMemoryBoardContent() {
  const [snapshots, setSnapshots] = useState<PersistedContinuitySnapshot[]>([])
  const [message, setMessage] = useState('Loading executive memory board...')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadMemoryBoard()
  }, [])

  async function loadMemoryBoard() {
    try {
      setLoading(true)
      setMessage('Loading executive memory board...')

      const records = await loadCGIContinuitySnapshots(50)

      setSnapshots(records as PersistedContinuitySnapshot[])
      setMessage(
        records.length === 0
          ? 'No continuity memory records found yet.'
          : 'Executive memory board loaded.'
      )
    } catch (error) {
      console.error(error)
      setMessage('Executive memory board could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  const board = useMemo(
    () => buildCGIExecutiveMemoryBoard(snapshots),
    [snapshots]
  )

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <InfrastructureNav />

        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • MEMORY BOARD</p>

          <h1 style={styles.title}>Executive Continuity Memory Board</h1>

          <p style={styles.subtitle}>
            Governed executive memory surface for compressing persisted CGI
            continuity meaning into board-level posture, urgency, escalation,
            evidence, recurrence, survivability, and stabilization credibility.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Board-Level Memory Reading</p>

            <h2 style={styles.heroTitle}>{board.boardPostureLabel}</h2>

            <p style={styles.heroMeaning}>{board.executiveSummary}</p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Board Urgency</p>

            <p style={styles.statusValue}>{board.boardUrgencyLabel}</p>
          </div>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Live Memory Compression</p>

            <h2 style={styles.actionTitle}>
              Compress governed continuity memory into executive meaning.
            </h2>

            <p style={styles.actionText}>
              This board uses the CGI executive memory board engine to unify
              historical review, executive compression, survivability exposure,
              recurrence visibility, and evidence credibility.
            </p>
          </div>

          <button
            type="button"
            onClick={loadMemoryBoard}
            disabled={loading}
            style={{
              ...styles.primaryButton,
              ...(loading ? styles.disabledButton : {}),
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh Memory'}
          </button>
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Board Posture"
            value={board.boardPostureLabel}
            body="Compressed executive memory posture derived from persisted continuity records."
          />

          <SignalCard
            title="Board Urgency"
            value={board.boardUrgencyLabel}
            body="Executive urgency level derived from persistence severity, escalation, and memory pressure."
          />

          <SignalCard
            title="Escalation Required"
            value={board.escalationRequired ? 'YES' : 'NO'}
            body="Indicates whether memory compression requires continued executive visibility."
          />
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Memory Posture"
            value={board.compression.memoryPostureLabel}
            body="Executive memory posture from the compression engine."
          />

          <SignalCard
            title="Compression Urgency"
            value={board.compression.urgencyLabel}
            body="Urgency level from executive memory compression."
          />

          <SignalCard
            title="Compression Confidence"
            value={board.compression.confidenceLabel}
            body="Confidence based on available evidence and stabilization credibility."
          />
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Survivability Exposure"
            value={board.survivabilityExposureVisible ? 'VISIBLE' : 'NOT VISIBLE'}
            body="Shows whether survivability pressure remains active in memory."
          />

          <SignalCard
            title="Recurrence Pattern"
            value={board.recurrencePatternVisible ? 'VISIBLE' : 'NOT VISIBLE'}
            body="Shows whether recurrence or structural memory is visible."
          />

          <SignalCard
            title="Evidence Gap"
            value={board.evidenceGapVisible ? 'VISIBLE' : 'NOT VISIBLE'}
            body="Shows whether evidence gaps limit stabilization credibility."
          />
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Memory Pressure"
            value={board.institutionalMemoryPressure}
            body="Institutional pressure carried by persisted continuity memory."
          />

          <SignalCard
            title="Persistence Severity"
            value={board.continuityPersistenceSeverity}
            body="Severity of continuity persistence across historical memory."
          />

          <SignalCard
            title="Snapshot Count"
            value={String(board.historicalReview.snapshotCount)}
            body="Number of continuity snapshots compressed into the board reading."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Dominant Board Concern</p>

          <h2 style={styles.cardTitle}>{board.dominantBoardConcern}</h2>

          <p style={styles.bodyText}>{board.boardReading}</p>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Required Board Action">
            <p style={styles.panelText}>{board.requiredBoardAction}</p>
          </Panel>

          <Panel title="Required Board Evidence">
            <p style={styles.panelText}>{board.requiredBoardEvidence}</p>
          </Panel>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Continuity Memory Statement">
            <p style={styles.panelText}>
              {board.compression.continuityMemoryStatement}
            </p>
          </Panel>

          <Panel title="Board-Level Reading">
            <p style={styles.panelText}>{board.compression.boardLevelReading}</p>
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Executive Compression Summary</p>

          <h2 style={styles.cardTitle}>
            CGI memory compresses continuity history into leadership meaning.
          </h2>

          <p style={styles.bodyText}>
            {board.compression.executiveCompressionSummary}
          </p>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Historical Review">
            <div style={styles.infoList}>
              <Info
                label="Direction"
                value={board.historicalReview.directionLabel}
              />
              <Info
                label="Trend"
                value={board.historicalReview.historicalTrendLabel}
              />
              <Info
                label="Recovery"
                value={board.historicalReview.recoveryTrajectoryLabel}
              />
              <Info
                label="Stabilization"
                value={board.historicalReview.stabilizationCredibilityLabel}
              />
              <Info
                label="Current Posture"
                value={board.historicalReview.currentPosture}
              />
            </div>
          </Panel>

          <Panel title="Memory Visibility">
            <div style={styles.infoList}>
              <Info
                label="Stabilization Visible"
                value={board.stabilizationCredibilityVisible ? 'YES' : 'NO'}
              />
              <Info
                label="Survivability Visible"
                value={board.survivabilityExposureVisible ? 'YES' : 'NO'}
              />
              <Info
                label="Recurrence Visible"
                value={board.recurrencePatternVisible ? 'YES' : 'NO'}
              />
              <Info
                label="Evidence Gap Visible"
                value={board.evidenceGapVisible ? 'YES' : 'NO'}
              />
              <Info
                label="Stabilization Credible"
                value={board.compression.stabilizationCredible ? 'YES' : 'NO'}
              />
            </div>
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Memory Doctrine Statement</p>

          <h2 style={styles.cardTitle}>
            Institutional continuity memory, not dashboard noise.
          </h2>

          <p style={styles.bodyText}>{board.memoryDoctrineStatement}</p>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Compressed Memory Timeline</p>

          <h2 style={styles.cardTitle}>
            Board memory remains grounded in persisted continuity records.
          </h2>

          <div style={styles.memoryList}>
            {snapshots.length === 0 ? (
              <p style={styles.emptyText}>
                No persisted continuity records are available for compression.
              </p>
            ) : (
              snapshots.slice(0, 10).map((snapshot) => (
                <MemoryItem
                  key={snapshot.id}
                  title={`${snapshot.continuity_posture} • ${formatDate(
                    snapshot.created_at
                  )}`}
                  body={
                    snapshot.executive_reading ||
                    snapshot.dominant_concern ||
                    'No executive reading was recorded for this memory record.'
                  }
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function formatDate(value: string) {
  if (!value) return 'Not recorded'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function SignalCard({
  title,
  value,
  body,
}: {
  title: string
  value: string
  body: string
}) {
  return (
    <article style={styles.signalCard}>
      <p style={styles.panelKicker}>{title}</p>

      <h3 style={styles.signalValue}>{value}</h3>

      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function MemoryItem({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <article style={styles.memoryItem}>
      <h3 style={styles.memoryTitle}>{title}</h3>

      <p style={styles.memoryBody}>{body}</p>
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
    <section style={styles.panel}>
      <p style={styles.panelKicker}>{title}</p>

      <div style={styles.panelBody}>{children}</div>
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
    fontSize: 'clamp(34px, 5vw, 52px)',
    lineHeight: 1.05,
    margin: '10px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '860px',
    lineHeight: 1.65,
    fontSize: '16px',
    margin: 0,
  },
  message: {
    background: '#083344',
    color: '#cffafe',
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '16px',
    fontSize: '14px',
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(240px, 0.65fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #67e8f9',
    borderRadius: '26px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  actionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: '16px',
    alignItems: 'center',
    background: '#082f49',
    border: '1px solid #0ea5e9',
    borderRadius: '22px',
    padding: '18px',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  actionTitle: {
    color: '#f8fafc',
    fontSize: '22px',
    lineHeight: 1.2,
    margin: '8px 0',
  },
  actionText: {
    color: '#cbd5e1',
    lineHeight: 1.55,
    margin: 0,
    maxWidth: '760px',
  },
  primaryButton: {
    border: 'none',
    borderRadius: '14px',
    background: '#67e8f9',
    color: '#082f49',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 900,
    minHeight: '48px',
    padding: '0 18px',
    whiteSpace: 'nowrap',
  },
  disabledButton: {
    cursor: 'not-allowed',
    opacity: 0.65,
  },
  sectionKicker: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '12px',
  },
  heroTitle: {
    color: '#a5f3fc',
    fontSize: 'clamp(34px, 5vw, 54px)',
    lineHeight: 1,
    margin: '10px 0 14px',
    letterSpacing: '-0.04em',
  },
  heroMeaning: {
    color: '#e0f2fe',
    lineHeight: 1.65,
    margin: 0,
    maxWidth: '760px',
    fontSize: '16px',
  },
  statusBox: {
    background: '#083344',
    border: '1px solid #22d3ee',
    borderRadius: '20px',
    padding: '18px',
    alignSelf: 'stretch',
  },
  statusLabel: {
    color: '#67e8f9',
    fontWeight: 900,
    margin: '0 0 10px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  statusValue: {
    color: '#cffafe',
    fontSize: '28px',
    lineHeight: 1.1,
    margin: 0,
    fontWeight: 900,
    overflowWrap: 'anywhere',
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  signalCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
    boxSizing: 'border-box',
  },
  signalValue: {
    color: '#f8fafc',
    fontSize: '22px',
    lineHeight: 1.15,
    margin: '10px 0',
    overflowWrap: 'anywhere',
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
  cardTitle: {
    color: '#f8fafc',
    fontSize: '26px',
    lineHeight: 1.15,
    margin: '10px 0 10px',
  },
  bodyText: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    margin: 0,
    maxWidth: '880px',
  },
  memoryList: {
    display: 'grid',
    gap: '12px',
    marginTop: '16px',
  },
  memoryItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },
  memoryTitle: {
    color: '#f8fafc',
    fontSize: '20px',
    margin: 0,
  },
  memoryBody: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    margin: '8px 0 0',
  },
  panel: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '230px',
    boxSizing: 'border-box',
  },
  panelKicker: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  panelBody: {
    color: '#cbd5e1',
    fontSize: '14px',
    lineHeight: 1.6,
    marginTop: '10px',
  },
  panelText: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    margin: 0,
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
    background: '#020617',
    border: '1px solid #1e293b',
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
  emptyText: {
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: 0,
    fontWeight: 700,
  },
}