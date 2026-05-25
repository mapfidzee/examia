'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { loadCGIContinuitySnapshots } from '@/lib/cgiPersistenceEngine'

type PersistedContinuitySnapshot = {
  id: string
  created_at: string
  snapshot_label: string | null
  source_route: string
  continuity_posture: string
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
  const [snapshots, setSnapshots] = useState<PersistedContinuitySnapshot[]>([])
  const [message, setMessage] = useState('Loading continuity memory...')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    try {
      setLoading(true)
      setMessage('Loading continuity memory...')

      const records = await loadCGIContinuitySnapshots(25)

      setSnapshots(records as PersistedContinuitySnapshot[])
      setMessage(
        records.length === 0
          ? 'No persisted continuity snapshots found yet.'
          : 'Continuity memory loaded.'
      )
    } catch (error) {
      console.error(error)
      setMessage('Continuity memory could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  const intelligence = useMemo(() => {
    const latest = snapshots[0] || null
    const elevatedCount = snapshots.filter((snapshot) =>
      ['ELEVATED', 'CRITICAL'].includes(snapshot.continuity_posture)
    ).length

    const criticalCount = snapshots.filter(
      (snapshot) => snapshot.continuity_posture === 'CRITICAL'
    ).length

    const structuralMemoryCount = snapshots.filter(
      (snapshot) => snapshot.structural_memory_visible
    ).length

    const evidenceVerifiedCount = snapshots.filter(
      (snapshot) => snapshot.evidence_verified
    ).length

    const continuityDriftDetected = elevatedCount > 0 || criticalCount > 0
    const survivabilityConcernPersisting = snapshots.some((snapshot) =>
      String(snapshot.survivability_pressure || '')
        .toUpperCase()
        .includes('REVIEW')
    )

    const direction =
      snapshots.length === 0
        ? 'NO MEMORY'
        : criticalCount > 0
          ? 'CRITICAL EXPOSURE PRESENT'
          : elevatedCount > 0
            ? 'HOLDING UNDER PRESSURE'
            : 'MEMORY STABLE'

    const currentPosture = latest?.continuity_posture || 'NOT RECORDED'

    const executiveMeaning =
      snapshots.length === 0
        ? 'CGI has not yet accumulated persisted continuity snapshots for historical review.'
        : continuityDriftDetected
          ? 'Persisted continuity memory shows visible exposure that requires continued executive review.'
          : 'Persisted continuity memory is available and currently shows no elevated continuity drift.'

    const requiredHistoryAction =
      snapshots.length === 0
        ? 'Begin preserving continuity snapshots.'
        : continuityDriftDetected
          ? 'Keep continuity history visible until stabilization credibility is evidenced.'
          : 'Maintain continuity memory review.'

    return {
      latest,
      snapshotCount: snapshots.length,
      elevatedCount,
      criticalCount,
      structuralMemoryCount,
      evidenceVerifiedCount,
      continuityDriftDetected,
      survivabilityConcernPersisting,
      direction,
      currentPosture,
      executiveMeaning,
      requiredHistoryAction,
    }
  }, [snapshots])

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <InfrastructureNav />

        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • CONTINUITY HISTORY</p>

          <h1 style={styles.title}>Executive Continuity History</h1>

          <p style={styles.subtitle}>
            Live institutional memory board for reviewing persisted continuity
            posture, survivability exposure, executive drift, and stabilization
            movement across Supabase continuity snapshots.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Continuity Direction</p>

            <h2 style={styles.heroTitle}>{intelligence.direction}</h2>

            <p style={styles.heroMeaning}>
              {intelligence.executiveMeaning}
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Current Posture</p>

            <p style={styles.statusValue}>
              {intelligence.currentPosture}
            </p>
          </div>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Live Retrieval</p>

            <h2 style={styles.actionTitle}>
              Reconstruct continuity memory from persisted records.
            </h2>

            <p style={styles.actionText}>
              This page now reads from Supabase continuity snapshots instead of
              relying only on static sample memory.
            </p>
          </div>

          <button
            type="button"
            onClick={loadHistory}
            disabled={loading}
            style={{
              ...styles.primaryButton,
              ...(loading ? styles.disabledButton : {}),
            }}
          >
            {loading ? 'Refreshing...' : 'Refresh History'}
          </button>
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Snapshot Count"
            value={String(intelligence.snapshotCount)}
            body="Number of persisted continuity snapshots available for executive history review."
          />

          <SignalCard
            title="Continuity Drift"
            value={intelligence.continuityDriftDetected ? 'YES' : 'NO'}
            body="Indicates whether persisted memory shows elevated or critical continuity exposure."
          />

          <SignalCard
            title="Survivability Persistence"
            value={
              intelligence.survivabilityConcernPersisting ? 'YES' : 'NO'
            }
            body="Indicates whether survivability review language is persisting across memory."
          />
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Elevated Records"
            value={String(intelligence.elevatedCount)}
            body="Persisted snapshots carrying elevated or critical continuity posture."
          />

          <SignalCard
            title="Structural Memory"
            value={String(intelligence.structuralMemoryCount)}
            body="Snapshots where structural memory remained visible."
          />

          <SignalCard
            title="Evidence Verified"
            value={String(intelligence.evidenceVerifiedCount)}
            body="Snapshots with verified continuity evidence marked true."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Required History Action</p>

          <h2 style={styles.cardTitle}>
            {intelligence.requiredHistoryAction}
          </h2>

          <p style={styles.bodyText}>
            CGI does not treat executive continuity readings as isolated
            moments. It preserves them as institutional memory so leadership can
            review whether continuity is improving, holding, or drifting across
            time.
          </p>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Latest Persisted Snapshot">
            {intelligence.latest ? (
              <div style={styles.infoList}>
                <Info
                  label="Label"
                  value={
                    intelligence.latest.snapshot_label ||
                    'Unlabeled snapshot'
                  }
                />

                <Info
                  label="Posture"
                  value={intelligence.latest.continuity_posture}
                />

                <Info
                  label="Source"
                  value={intelligence.latest.source_route}
                />

                <Info
                  label="Dominant Concern"
                  value={
                    intelligence.latest.dominant_concern ||
                    'Not recorded'
                  }
                />

                <Info
                  label="Required Evidence"
                  value={
                    intelligence.latest.required_evidence ||
                    'Not recorded'
                  }
                />
              </div>
            ) : (
              <p style={styles.emptyText}>
                No persisted continuity snapshot is available yet.
              </p>
            )}
          </Panel>

          <Panel title="Executive History Review">
            <div style={styles.infoList}>
              <Info label="Direction" value={intelligence.direction} />
              <Info
                label="Current Posture"
                value={intelligence.currentPosture}
              />
              <Info
                label="Snapshot Count"
                value={String(intelligence.snapshotCount)}
              />
              <Info
                label="Continuity Drift"
                value={
                  intelligence.continuityDriftDetected ? 'YES' : 'NO'
                }
              />
              <Info
                label="History Action"
                value={intelligence.requiredHistoryAction}
              />
            </div>
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Continuity Timeline</p>

          <h2 style={styles.cardTitle}>
            Persisted continuity posture must be reviewed across time.
          </h2>

          <div style={styles.timeline}>
            {snapshots.length === 0 && (
              <p style={styles.emptyText}>
                No continuity timeline records are available yet.
              </p>
            )}

            {snapshots.map((snapshot) => (
              <article key={snapshot.id} style={styles.timelineItem}>
                <p style={styles.timelineDate}>
                  {formatDate(snapshot.created_at)}
                </p>

                <h3 style={styles.timelineTitle}>
                  {snapshot.continuity_posture}
                </h3>

                <p style={styles.timelineBody}>
                  {snapshot.executive_reading ||
                    'No executive reading was recorded for this snapshot.'}
                </p>

                <p style={styles.timelineMeta}>
                  Dominant concern:{' '}
                  {snapshot.dominant_concern || 'Not recorded'}
                </p>

                <p style={styles.timelineMeta}>
                  Required action:{' '}
                  {snapshot.required_action || 'Not recorded'}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function formatDate(value: string) {
  if (!value) return 'Not recorded'

  return new Date(value).toLocaleString()
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
    maxWidth: '820px',
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
  emptyText: {
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: 0,
    fontWeight: 700,
  },
}