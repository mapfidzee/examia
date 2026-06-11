'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIDemoScenario } from '@/lib/cgiDemoScenarioEngine'
import {
  buildCGIMemoryDoctrine,
  formatMemoryDate,
  formatMemoryLabel,
  type PersistedContinuitySnapshotForMemory,
} from '@/lib/cgiMemoryDoctrineEngine'
import { loadCGIContinuitySnapshots } from '@/lib/cgiPersistenceEngine'

type PersistedContinuitySnapshot = PersistedContinuitySnapshotForMemory

export default function CGIMemoryBoardPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
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

  const featured = useMemo(
    () => buildCGIDemoScenario('FUEL_LOGISTICS_CHAIN_PROOF'),
    [],
  )

  const pilotThread = featured.pilotThread

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
          : 'Executive memory board loaded.',
      )
    } catch (error) {
      console.error(error)
      setMessage('Executive memory board could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  const memoryDoctrine = useMemo(
    () => buildCGIMemoryDoctrine(snapshots),
    [snapshots],
  )

  const { board, institutionalMemory } = memoryDoctrine

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <InfrastructureNav />

        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • MEMORY BOARD</p>

          <h1 style={styles.title}>Executive Continuity Memory Board</h1>

          <p style={styles.subtitle}>
            Institutional memory surface preserving what happened, what kept
            returning, what leadership learned, what evidence must remain
            attached, and why visible recovery must not erase structural memory.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Pilot Memory Subject</p>

            <h2 style={styles.heroTitle}>{pilotThread.scenarioName}</h2>

            <p style={styles.heroMeaning}>{pilotThread.executiveMemory}</p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Memory Question</p>

            <p style={styles.statusValue}>{memoryDoctrine.memoryQuestion}</p>
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>What The Institution Must Remember</p>

          <h2 style={styles.cardTitle}>{memoryDoctrine.memoryThesis}</h2>

          <p style={styles.bodyText}>
            Memory Board preserves the meaning of instability after visible
            recovery so structural lessons, recurrence risk, evidence gaps, and
            survivability exposure do not disappear.
          </p>

          <div style={styles.gridThreeInline}>
            <SignalCard
              title="Remembered Vulnerability"
              value={memoryDoctrine.rememberedVulnerability}
              body="The structural weakness CGI must keep visible after the event appears resolved."
            />

            <SignalCard
              title="Remembered Pattern"
              value={memoryDoctrine.rememberedPattern}
              body="The institutional pattern that should influence future continuity decisions."
            />

            <SignalCard
              title="Remembered Rule"
              value={memoryDoctrine.rememberedRule}
              body="The doctrine rule that prevents false closure and memory loss."
            />
          </div>
        </section>

        <section style={styles.gridThree}>
          {pilotThread.sites.map((site) => (
            <SignalCard
              key={site.siteName}
              title={site.siteName}
              value={site.posture}
              body={site.finding}
            />
          ))}
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Memory Chain</p>

          <h2 style={styles.cardTitle}>
            The lesson remains attached to the full continuity chain.
          </h2>

          <div style={styles.memoryChain}>
            {pilotThread.chain.map((stage, index) => (
              <article
                key={`${stage.stage}-${stage.title}`}
                style={styles.memoryChainItem}
              >
                <p style={styles.panelKicker}>
                  Step {index + 1} • {formatMemoryLabel(stage.stage)}
                </p>

                <h3 style={styles.memoryTitle}>{stage.title}</h3>

                <p style={styles.memoryBody}>{stage.executiveFinding}</p>

                <p style={styles.evidenceText}>{stage.evidencePreserved}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Audit Memory</p>

          <h2 style={styles.cardTitle}>
            Memory remains useful because the chain can be reconstructed.
          </h2>

          <div style={styles.auditGrid}>
            {pilotThread.auditReconstruction.map((item) => (
              <div key={item} style={styles.auditItem}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Live Memory Compression</p>

            <h2 style={styles.actionTitle}>
              Compress persisted continuity records into executive memory.
            </h2>

            <p style={styles.actionText}>
              This board combines the pilot memory thread with persisted
              continuity snapshots so CGI can show both the canonical lesson and
              the live institutional memory state.
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

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Live Board-Level Memory Reading</p>

            <h2 style={styles.heroTitle}>{board.boardPostureLabel}</h2>

            <p style={styles.heroMeaning}>{memoryDoctrine.boardMeaning}</p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Board Urgency</p>

            <p style={styles.statusValue}>{board.boardUrgencyLabel}</p>
          </div>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Institutional Memory Reading</p>

            <h2 style={styles.heroTitle}>
              {institutionalMemory.memoryPosture}
            </h2>

            <p style={styles.heroMeaning}>
              {memoryDoctrine.institutionalMeaning}
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Memory Domain</p>

            <p style={styles.statusValue}>
              {institutionalMemory.dominantMemoryDomain}
            </p>
          </div>
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
            title="Institutional Memory"
            value={institutionalMemory.memoryPosture}
            body="Shows whether CGI memory is absent, emerging, active, structural, or critical."
          />

          <SignalCard
            title="Dominant Domain"
            value={institutionalMemory.dominantMemoryDomain}
            body="The continuity domain carrying the strongest remembered significance."
          />

          <SignalCard
            title="Memory Risk"
            value={institutionalMemory.memoryRisk}
            body={memoryDoctrine.memoryRiskMeaning}
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>What CGI Remembers Live</p>

          <h2 style={styles.cardTitle}>
            The organization must not forget what weakened continuity before.
          </h2>

          <p style={styles.bodyText}>{institutionalMemory.memoryNarrative}</p>

          <div style={styles.gridThreeInline}>
            <SignalCard
              title="Executive Question"
              value={institutionalMemory.executiveQuestion}
              body={memoryDoctrine.memoryQuestion}
            />

            <SignalCard
              title="Continuity Learning"
              value={memoryDoctrine.continuityLearning}
              body="What CGI has learned from preserved continuity records."
            />

            <SignalCard
              title="Evidence To Preserve"
              value={memoryDoctrine.evidenceToPreserve}
              body="The proof that should remain attached to future decisions."
            />
          </div>
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
          <Panel title="Memory Recommendation">
            <p style={styles.panelText}>
              {memoryDoctrine.memoryRecommendation}
            </p>
          </Panel>

          <Panel title="Memory Persistence Requirement">
            <p style={styles.panelText}>
              {memoryDoctrine.persistenceRequirement}
            </p>
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
          <p style={styles.sectionKicker}>Memory Doctrine Statement</p>

          <h2 style={styles.cardTitle}>
            Institutional continuity memory, not dashboard noise.
          </h2>

          <p style={styles.bodyText}>{board.memoryDoctrineStatement}</p>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Copy-Ready Memory Brief</p>

          <h2 style={styles.cardTitle}>
            Institutional memory must remain portable, board-readable, and
            audit-aware.
          </h2>

          <pre style={styles.summaryBox}>
            {memoryDoctrine.copyReadyMemoryBrief}
          </pre>
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
                  title={`${snapshot.continuity_posture} • ${formatMemoryDate(
                    snapshot.created_at,
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
  gridThreeInline: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '16px',
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
  memoryChain: {
    display: 'grid',
    gap: '14px',
    marginTop: '16px',
  },
  memoryChainItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },
  evidenceText: {
    color: '#a5f3fc',
    borderTop: '1px solid #334155',
    lineHeight: 1.6,
    margin: '12px 0 0',
    paddingTop: '12px',
    fontSize: '13px',
    fontWeight: 800,
  },
  auditGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  auditItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '14px',
    color: '#e2e8f0',
    fontSize: '13px',
    lineHeight: 1.5,
    padding: '12px',
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
  emptyText: {
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: 0,
    fontWeight: 700,
  },
  summaryBox: {
    marginTop: '16px',
    padding: '18px',
    borderRadius: '18px',
    background: '#0f172a',
    border: '1px solid #334155',
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap',
    fontSize: '13px',
    lineHeight: 1.65,
    overflowX: 'auto',
  },
}