import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  buildCGIContinuitySnapshot,
  summarizeCGIContinuitySnapshot,
} from '@/lib/cgiContinuitySnapshotEngine'
import {
  reviewCGIExecutiveHistory,
  summarizeCGIExecutiveHistory,
} from '@/lib/cgiExecutiveHistoryEngine'

export default function ContinuityHistoryPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
    >
      <CGIGovernanceShell>
        <ContinuityHistoryContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function ContinuityHistoryContent() {
  const snapshots = [
    buildCGIContinuitySnapshot({
      pressurePosture: 'WATCHED',
      trajectoryPosture: 'WATCHED',
      predictivePosture: 'WATCHED',
      recoveryPosture: 'WATCHED',
      reliabilityPosture: 'WATCHED',
      evidenceVerified: true,
      accountabilityActive: true,
      structuralMemoryVisible: false,
    }),
    buildCGIContinuitySnapshot({
      pressurePosture: 'ELEVATED',
      trajectoryPosture: 'WATCHED',
      predictivePosture: 'ELEVATED',
      recoveryPosture: 'WATCHED',
      reliabilityPosture: 'ELEVATED',
      evidenceVerified: false,
      accountabilityActive: true,
      structuralMemoryVisible: true,
    }),
    buildCGIContinuitySnapshot({
      pressurePosture: 'ELEVATED',
      trajectoryPosture: 'ELEVATED',
      predictivePosture: 'ELEVATED',
      recoveryPosture: 'WATCHED',
      reliabilityPosture: 'ELEVATED',
      evidenceVerified: false,
      accountabilityActive: true,
      structuralMemoryVisible: true,
    }),
  ]

  const historyReview = reviewCGIExecutiveHistory(snapshots)
  const latestSnapshot = snapshots[snapshots.length - 1]

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <InfrastructureNav />

        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • CONTINUITY HISTORY</p>

          <h1 style={styles.title}>Executive Continuity History</h1>

          <p style={styles.subtitle}>
            Institutional memory board for reviewing continuity posture,
            survivability persistence, executive drift, and stabilization
            movement across preserved continuity snapshots.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Continuity Direction</p>

            <h2 style={styles.heroTitle}>{historyReview.direction}</h2>

            <p style={styles.heroMeaning}>
              {historyReview.executiveMeaning}
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Current Posture</p>

            <p style={styles.statusValue}>{historyReview.currentPosture}</p>
          </div>
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Snapshot Count"
            value={String(historyReview.snapshotCount)}
            body="Number of preserved executive continuity readings used for this review."
          />

          <SignalCard
            title="Continuity Drift"
            value={historyReview.continuityDriftDetected ? 'YES' : 'NO'}
            body="Indicates whether posture movement or persistence suggests continuity degradation."
          />

          <SignalCard
            title="Survivability Persistence"
            value={
              historyReview.survivabilityConcernPersisting ? 'YES' : 'NO'
            }
            body="Indicates whether elevated or critical continuity exposure is persisting across snapshots."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Required History Action</p>

          <h2 style={styles.cardTitle}>
            {historyReview.requiredHistoryAction}
          </h2>

          <p style={styles.bodyText}>
            CGI does not treat executive continuity readings as isolated
            moments. It preserves them as institutional memory so leadership can
            see whether continuity is improving, holding, or drifting.
          </p>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Latest Snapshot">
            <pre style={styles.compactPre}>
              {summarizeCGIContinuitySnapshot(latestSnapshot)}
            </pre>
          </Panel>

          <Panel title="Executive History Review">
            <pre style={styles.compactPre}>
              {summarizeCGIExecutiveHistory(historyReview)}
            </pre>
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Continuity Timeline</p>

          <h2 style={styles.cardTitle}>
            Continuity posture must be reviewed across time.
          </h2>

          <div style={styles.timeline}>
            {snapshots.map((snapshot) => (
              <article key={snapshot.snapshotId} style={styles.timelineItem}>
                <p style={styles.timelineDate}>{snapshot.createdAt}</p>

                <h3 style={styles.timelineTitle}>
                  {snapshot.synthesisPosture}
                </h3>

                <p style={styles.timelineBody}>
                  {snapshot.executiveReading}
                </p>

                <p style={styles.timelineMeta}>
                  Dominant concern: {snapshot.dominantConcern}
                </p>
              </article>
            ))}
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
    maxWidth: '820px',
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
  bodyText: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    margin: 0,
    maxWidth: '880px',
  },
  panel: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '260px',
    boxSizing: 'border-box',
    overflow: 'hidden',
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
  compactPre: {
    whiteSpace: 'pre-wrap',
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '14px',
    padding: '14px',
    color: '#e2e8f0',
    lineHeight: 1.5,
    fontSize: '13px',
    overflowX: 'auto',
    margin: 0,
  },
  timeline: {
    display: 'grid',
    gap: '12px',
    marginTop: '16px',
  },
  timelineItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },
  timelineDate: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 800,
    margin: 0,
  },
  timelineTitle: {
    color: '#f8fafc',
    fontSize: '22px',
    margin: '8px 0',
  },
  timelineBody: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    margin: 0,
  },
  timelineMeta: {
    color: '#a5f3fc',
    lineHeight: 1.5,
    fontWeight: 800,
    margin: '10px 0 0',
  },
}