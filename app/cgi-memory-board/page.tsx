import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'

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
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <InfrastructureNav />

        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • MEMORY BOARD</p>

          <h1 style={styles.title}>Executive Continuity Memory Board</h1>

          <p style={styles.subtitle}>
            Governed executive memory surface for compressing persisted CGI
            continuity meaning across reports, situation reviews, coordination
            reviews, site continuity profiles, operational metrics, and audit
            evidence.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Locked Doctrine Boundary</p>

            <h2 style={styles.heroTitle}>
              Institutional continuity memory, not dashboard noise.
            </h2>

            <p style={styles.heroMeaning}>
              The CGI Memory Board is reserved for executive compression of
              continuity history. It will summarize what persisted, what
              worsened, what improved, what recurred, what lacked evidence, and
              what remained survivability-relevant across governed continuity
              records.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Build State</p>

            <p style={styles.statusValue}>LOCKED EARLY</p>
          </div>
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Current Boundary"
            value="DOCTRINE"
            body="This route locks the executive memory concept before full intelligence aggregation is built."
          />

          <SignalCard
            title="Current Mode"
            value="NO DRIFT"
            body="The Memory Board must not become a generic analytics dashboard or duplicate existing pages."
          />

          <SignalCard
            title="Future Role"
            value="COMPRESSION"
            body="This surface will compress persisted continuity memory into executive-grade meaning."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>What This Board Will Eventually Answer</p>

          <h2 style={styles.cardTitle}>
            CGI memory must help leadership see continuity patterns across time.
          </h2>

          <div style={styles.memoryList}>
            <MemoryItem
              title="What worsened?"
              body="Detect continuity posture that moved toward elevated or critical exposure."
            />

            <MemoryItem
              title="What improved?"
              body="Detect movement toward watched or stable posture after prior exposure."
            />

            <MemoryItem
              title="What recurred?"
              body="Identify repeated structural memory, repeated drift, or repeated site-level exposure."
            />

            <MemoryItem
              title="What lacked evidence?"
              body="Surface continuity records where stabilization claims were not supported by verified evidence."
            />

            <MemoryItem
              title="What remained survivability-relevant?"
              body="Preserve executive visibility where pressure, recovery credibility, or reliability concerns persist."
            />

            <MemoryItem
              title="What requires executive action?"
              body="Convert persisted continuity memory into disciplined, governance-safe leadership priorities."
            />
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Memory Sources">
            <div style={styles.sourceList}>
              <SourceItem label="Continuity Snapshots" />
              <SourceItem label="Executive Reports" />
              <SourceItem label="Situation Reviews" />
              <SourceItem label="Coordination Reviews" />
              <SourceItem label="Site Continuity Profiles" />
              <SourceItem label="Operational Metrics" />
              <SourceItem label="Snapshot Audit Log" />
            </div>
          </Panel>

          <Panel title="Strict Boundary">
            <p style={styles.panelText}>
              This page is intentionally not a full analytics board yet. Its
              purpose is to reserve the executive memory layer, protect the
              doctrine, and prevent future drift. Full aggregation should only
              be added after the historical continuity engine is centralized.
            </p>
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Implementation Sequence</p>

          <h2 style={styles.cardTitle}>
            Build the engine first, then populate this board.
          </h2>

          <div style={styles.sequenceGrid}>
            <SequenceItem
              step="01"
              title="Historical Continuity Engine"
              body="Move continuity-history interpretation logic into a reusable engine."
            />

            <SequenceItem
              step="02"
              title="Memory Compression Engine"
              body="Create disciplined executive compression across persisted CGI records."
            />

            <SequenceItem
              step="03"
              title="Memory Board Wiring"
              body="Connect this route to real compressed continuity intelligence."
            />

            <SequenceItem
              step="04"
              title="Executive Readiness Review"
              body="Validate that the board remains governance-safe, concise, and non-punitive."
            />
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

function SourceItem({ label }: { label: string }) {
  return (
    <div style={styles.sourceItem}>
      <span style={styles.sourceDot} />

      <span>{label}</span>
    </div>
  )
}

function SequenceItem({
  step,
  title,
  body,
}: {
  step: string
  title: string
  body: string
}) {
  return (
    <article style={styles.sequenceItem}>
      <p style={styles.sequenceStep}>{step}</p>

      <h3 style={styles.sequenceTitle}>{title}</h3>

      <p style={styles.sequenceBody}>{body}</p>
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
    fontSize: '30px',
    lineHeight: 1.1,
    margin: 0,
    fontWeight: 900,
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
    fontSize: '28px',
    lineHeight: 1.15,
    margin: '10px 0',
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
  sourceList: {
    display: 'grid',
    gap: '10px',
    marginTop: '10px',
  },
  sourceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#e2e8f0',
    fontWeight: 800,
  },
  sourceDot: {
    width: '9px',
    height: '9px',
    borderRadius: '999px',
    background: '#67e8f9',
    flexShrink: 0,
  },
  sequenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  sequenceItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },
  sequenceStep: {
    color: '#67e8f9',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    margin: 0,
  },
  sequenceTitle: {
    color: '#f8fafc',
    fontSize: '18px',
    lineHeight: 1.2,
    margin: '10px 0',
  },
  sequenceBody: {
    color: '#cbd5e1',
    lineHeight: 1.55,
    margin: 0,
  },
}