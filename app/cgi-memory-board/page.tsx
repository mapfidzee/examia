'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
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

const EMPTY_MEMORY = 'No governed continuity memory has been established yet.'

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
  const [message, setMessage] = useState('Loading memory board...')
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
      setMessage('Loading memory board...')

      const records = await loadCGIContinuitySnapshots(50)

      setSnapshots(records as PersistedContinuitySnapshot[])
      setMessage(records.length === 0 ? EMPTY_MEMORY : 'Memory board loaded.')
    } catch (error) {
      console.error(error)
      setMessage('Memory board could not be loaded.')
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
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • MEMORY BOARD</p>
          <h1 style={styles.title}>Memory Board</h1>
          <p style={styles.subtitle}>
            Preserve what happened, what kept returning, what leadership
            learned, what evidence must remain attached, and why visible
            recovery must not erase structural memory.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Executive Memory Question</p>
            <h2 style={styles.heroTitle}>{memoryDoctrine.memoryQuestion}</h2>
            <p style={styles.heroMeaning}>{memoryDoctrine.memoryThesis}</p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Board Memory</p>
            <p style={styles.statusValue}>{board.boardPostureLabel}</p>
            <p style={styles.statusText}>{memoryDoctrine.boardMeaning}</p>
          </div>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Live Memory Compression</p>
            <h2 style={styles.actionTitle}>
              Compress persisted continuity records into executive memory.
            </h2>
            <p style={styles.actionText}>
              Memory Board keeps the canonical pilot lesson visible while
              reading the live institutional memory state from persisted
              continuity snapshots.
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
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
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

        <section style={styles.card}>
          <p style={styles.sectionKicker}>What CGI Remembers</p>
          <h2 style={styles.cardTitle}>
            The organization must not forget what weakened continuity before.
          </h2>
          <p style={styles.bodyText}>{institutionalMemory.memoryNarrative}</p>

          <div style={styles.gridThreeInline}>
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

            <SignalCard
              title="Persistence Requirement"
              value={memoryDoctrine.persistenceRequirement}
              body="What memory must retain so continuity meaning is not lost."
            />
          </div>
        </section>

        <details style={styles.evidencePanel}>
          <summary style={styles.evidenceSummary}>
            <span>
              <span style={styles.sectionKicker}>Supporting Memory Evidence</span>
              <strong style={styles.evidenceTitle}>
                Pilot chain, audit reconstruction, memory brief, and records
              </strong>
            </span>

            <span style={styles.evidenceToggle}>Expand Memory</span>
          </summary>

          <section style={styles.cardNested}>
            <p style={styles.sectionKicker}>Pilot Memory Subject</p>
            <h2 style={styles.cardTitle}>{pilotThread.scenarioName}</h2>
            <p style={styles.bodyText}>{pilotThread.executiveMemory}</p>

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

          <section style={styles.gridThreeNested}>
            {pilotThread.sites.map((site) => (
              <SignalCard
                key={site.siteName}
                title={site.siteName}
                value={site.posture}
                body={site.finding}
              />
            ))}
          </section>

          <section style={styles.cardNested}>
            <p style={styles.sectionKicker}>Memory Chain</p>
            <h2 style={styles.cardTitle}>
              The lesson remains attached to the continuity chain.
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

          <section style={styles.cardNested}>
            <p style={styles.sectionKicker}>Audit Reconstruction</p>
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

          <section style={styles.cardNested}>
            <p style={styles.sectionKicker}>Copy-Ready Memory Brief</p>
            <h2 style={styles.cardTitle}>
              Institutional memory must remain portable and board-readable.
            </h2>

            <pre style={styles.summaryBox}>
              {memoryDoctrine.copyReadyMemoryBrief}
            </pre>
          </section>

          <section style={styles.cardNested}>
            <p style={styles.sectionKicker}>Compressed Memory Timeline</p>
            <h2 style={styles.cardTitle}>
              Board memory remains grounded in persisted continuity records.
            </h2>

            <div style={styles.memoryList}>
              {snapshots.length === 0 ? (
                <p style={styles.emptyText}>{EMPTY_MEMORY}</p>
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
        </details>

        <section style={styles.doctrineCard}>
          <strong>MEMORY BOARD DOCTRINE</strong>
          <span>{board.memoryDoctrineStatement}</span>
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

function MemoryItem({ title, body }: { title: string; body: string }) {
  return (
    <article style={styles.memoryItem}>
      <h3 style={styles.memoryTitle}>{title}</h3>
      <p style={styles.memoryBody}>{body}</p>
    </article>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={styles.panel}>
      <p style={styles.panelKicker}>{title}</p>
      <div style={styles.panelBody}>{children}</div>
    </section>
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
    color: '#f5f0e6',
    overflowX: 'hidden',
    background:
      'radial-gradient(circle at top right, rgba(214,178,94,0.08), transparent 32%), #030303',
  },
  container: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '16px 28px 72px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '24px',
  },
  kicker: {
    color: gold,
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '2px',
    margin: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff8e7',
    fontSize: 'clamp(38px, 5vw, 58px)',
    lineHeight: 0.95,
    margin: '12px 0',
    letterSpacing: '-0.06em',
  },
  subtitle: {
    color: '#cfc7b5',
    maxWidth: '860px',
    lineHeight: 1.65,
    fontSize: '14px',
    margin: 0,
  },
  message: {
    background: 'rgba(214,178,94,0.12)',
    color: gold,
    border: `1px solid ${softLine}`,
    padding: '13px 16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '24px',
    fontSize: '13px',
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(260px, 0.65fr)',
    gap: '24px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
  },
  sectionKicker: {
    color: mutedGold,
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '10px',
  },
  heroTitle: {
    color: gold,
    fontSize: 'clamp(30px, 4vw, 48px)',
    lineHeight: 1,
    margin: '10px 0',
    letterSpacing: '-0.05em',
  },
  heroMeaning: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
    fontSize: '14px',
  },
  statusBox: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px',
  },
  statusLabel: {
    color: gold,
    fontWeight: 900,
    margin: '0 0 10px',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
  },
  statusValue: {
    color: '#fff8e7',
    fontSize: '28px',
    lineHeight: 1.05,
    margin: 0,
    fontWeight: 950,
    overflowWrap: 'anywhere',
  },
  statusText: {
    color: '#cfc7b5',
    lineHeight: 1.55,
    margin: '12px 0 0',
    fontSize: '13px',
  },
  actionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: '24px',
    alignItems: 'center',
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '22px',
    marginBottom: '24px',
    boxSizing: 'border-box',
  },
  actionTitle: {
    color: '#fff8e7',
    fontSize: '24px',
    lineHeight: 1.15,
    margin: '8px 0',
    letterSpacing: '-0.035em',
  },
  actionText: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '760px',
    fontSize: '13px',
  },
  primaryButton: {
    border: 'none',
    borderRadius: '14px',
    background: gold,
    color: '#11100d',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 950,
    minHeight: '52px',
    padding: '0 22px',
    whiteSpace: 'nowrap',
  },
  disabledButton: {
    cursor: 'not-allowed',
    opacity: 0.65,
  },
  gridThreeInline: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
  },
  gridThreeNested: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '18px',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '18px',
    marginBottom: '24px',
  },
  signalCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '16px',
    minHeight: '144px',
    boxSizing: 'border-box',
  },
  signalValue: {
    color: '#fff8e7',
    fontSize: '21px',
    lineHeight: 1.16,
    margin: '10px 0',
    overflowWrap: 'anywhere',
  },
  card: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  cardNested: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '22px',
    marginBottom: '18px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#fff8e7',
    fontSize: 'clamp(22px, 3vw, 30px)',
    lineHeight: 1.15,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  bodyText: {
    color: '#cfc7b5',
    lineHeight: 1.65,
    margin: 0,
    fontSize: '13px',
    maxWidth: '880px',
  },
  panel: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '18px',
    minHeight: '170px',
    boxSizing: 'border-box',
  },
  panelKicker: {
    color: mutedGold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  panelBody: {
    color: '#cfc7b5',
    fontSize: '13px',
    lineHeight: 1.6,
    marginTop: '10px',
  },
  panelText: {
    color: '#cfc7b5',
    lineHeight: 1.7,
    margin: 0,
  },
  evidencePanel: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '22px',
    marginBottom: '24px',
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
    fontSize: '21px',
    lineHeight: 1.2,
    marginTop: '8px',
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
  memoryChain: {
    display: 'grid',
    gap: '14px',
    marginTop: '16px',
  },
  memoryChainItem: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '16px',
  },
  evidenceText: {
    color: gold,
    borderTop: `1px solid ${softLine}`,
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
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    color: '#f5f0e6',
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
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '16px',
  },
  memoryTitle: {
    color: '#fff8e7',
    fontSize: '20px',
    margin: 0,
  },
  memoryBody: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: '8px 0 0',
  },
  emptyText: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
    fontWeight: 700,
  },
  summaryBox: {
    marginTop: '16px',
    maxHeight: '520px',
    padding: '18px',
    borderRadius: '18px',
    background: cardBlack,
    border: `1px solid ${softLine}`,
    color: '#f5f0e6',
    whiteSpace: 'pre-wrap',
    fontSize: '12px',
    lineHeight: 1.65,
    overflow: 'auto',
  },
  doctrineCard: {
    display: 'grid',
    gap: '10px',
    padding: '24px',
    borderRadius: '22px',
    background: deepBlack,
    border: `1px solid ${strongLine}`,
    color: '#fff8e7',
    lineHeight: 1.7,
  },
}