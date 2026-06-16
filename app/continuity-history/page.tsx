'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { reviewCGIHistoricalContinuity } from '@/lib/cgiHistoricalContinuityEngine'
import {
  buildHistoryIntelligence,
  continuityHistoryDoctrine,
  deriveMovementMeaning,
  executiveLabel,
  formatHistoryDate,
  yesNoMeaning,
  type PatternCount,
  type PersistedContinuitySnapshotForHistory,
} from '@/lib/cgiHistoricalMemoryDoctrineEngine'
import { loadCGIContinuitySnapshots } from '@/lib/cgiPersistenceEngine'

type PersistedContinuitySnapshot = PersistedContinuitySnapshotForHistory

const EMPTY_HISTORY = 'Historical memory not yet established.'

export default function ContinuityHistoryPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
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

      const records = await loadCGIContinuitySnapshots(50)

      setSnapshots(records as PersistedContinuitySnapshot[])
      setMessage(records.length === 0 ? EMPTY_HISTORY : 'Continuity memory loaded.')
    } catch (error) {
      console.error(error)
      setMessage('Continuity memory could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  const intelligence = useMemo(
    () => reviewCGIHistoricalContinuity(snapshots),
    [snapshots],
  )

  const history = useMemo(() => buildHistoryIntelligence(snapshots), [snapshots])

  const historicalReading = history.hasHistory
    ? executiveLabel(intelligence.directionLabel)
    : 'HISTORY NOT ESTABLISHED'

  const historicalMeaning = history.hasHistory
    ? intelligence.executiveMeaning
    : EMPTY_HISTORY

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • CONTINUITY HISTORY</p>
          <h1 style={styles.title}>Continuity History</h1>
          <p style={styles.subtitle}>
            Institutional memory ledger for continuity posture, recurrence,
            survivability exposure, recovery credibility, evidence, and
            executive movement across time.
          </p>

          <section style={styles.doctrinePanel}>
            <p style={styles.doctrineTitle}>CONTINUITY HISTORY DOCTRINE</p>
            <div style={styles.doctrineGrid}>
              {continuityHistoryDoctrine.map((item) => (
                <div key={item} style={styles.doctrineCard}>
                  {item}
                </div>
              ))}
            </div>
          </section>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Historical Continuity Reading</p>
            <h2 style={styles.heroTitle}>{historicalReading}</h2>
            <p style={styles.heroMeaning}>{historicalMeaning}</p>
          </div>

          <div style={styles.questionBox}>
            <p style={styles.metricLabel}>History Question</p>
            <p style={styles.questionText}>
              What must leadership never forget?
            </p>
          </div>
        </section>

        <section style={styles.memoryDirectionPanel}>
          <div>
            <p style={styles.sectionKicker}>Memory Direction</p>
            <h2 style={styles.cardTitle}>{history.memoryDirection}</h2>
            <p style={styles.bodyText}>
              Continuity History preserves prior readings without allowing old
              records to override current lifecycle truth.
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
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </section>

        <section style={styles.summaryGrid}>
          <MetricCard
            label="Snapshots"
            value={String(intelligence.snapshotCount)}
            body={
              history.hasHistory
                ? 'Persisted continuity records available.'
                : EMPTY_HISTORY
            }
          />

          <MetricCard
            label="Drift"
            value={
              history.hasHistory
                ? yesNoMeaning(intelligence.continuityDriftDetected)
                : 'AWAITING HISTORY'
            }
            body="Whether historical memory shows worsening or persistent exposure."
          />

          <MetricCard
            label="Improving"
            value={
              history.hasHistory
                ? yesNoMeaning(intelligence.continuityImproving)
                : 'AWAITING HISTORY'
            }
            body="Whether the latest posture is lighter than the oldest compared posture."
          />

          <MetricCard
            label="Confidence"
            value={history.historicalConfidence.memoryConfidence}
            body="Whether the historical pattern is strong enough to trust."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Historical Movement Summary</p>
          <h2 style={styles.cardTitle}>
            What changed, and what must not be forgotten?
          </h2>

          {history.hasHistory ? (
            <div style={styles.movementGrid}>
              <Info
                label="Direction"
                value={executiveLabel(intelligence.directionLabel)}
              />
              <Info
                label="Trend"
                value={executiveLabel(intelligence.historicalTrendLabel)}
              />
              <Info
                label="Current Posture"
                value={executiveLabel(intelligence.currentPosture)}
              />
              <Info
                label="Drift"
                value={yesNoMeaning(intelligence.continuityDriftDetected)}
              />
              <Info
                label="Recurrence"
                value={executiveLabel(intelligence.recurrenceMeaning)}
              />
              <Info
                label="Survivability"
                value={executiveLabel(intelligence.survivabilityMeaning)}
              />
              <Info
                label="Evidence"
                value={executiveLabel(intelligence.evidenceMeaning)}
              />
              <Info
                label="Required Action"
                value={executiveLabel(intelligence.requiredHistoryAction)}
              />
            </div>
          ) : (
            <EmptyPanel title={EMPTY_HISTORY} body={EMPTY_HISTORY} />
          )}
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Recurrence Intelligence</p>
          <h2 style={styles.cardTitle}>What keeps returning?</h2>

          {history.recurrencePatterns.length === 0 ? (
            <EmptyPanel title={EMPTY_HISTORY} body={EMPTY_HISTORY} />
          ) : (
            <div style={styles.patternGrid}>
              {history.recurrencePatterns.map((pattern) => (
                <PatternCard key={pattern.label} pattern={pattern} />
              ))}
            </div>
          )}
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Institutional Learning</p>
          <h2 style={styles.cardTitle}>
            What has the institution learned from continuity memory?
          </h2>

          <div style={styles.learningGrid}>
            <InfoCard
              label="Most Frequent Concern"
              value={history.institutionalLearning.mostFrequentConcern}
            />
            <InfoCard
              label="Most Frequent Failure"
              value={history.institutionalLearning.mostFrequentFailure}
            />
            <InfoCard
              label="Escalation Trigger"
              value={history.institutionalLearning.mostFrequentEscalationTrigger}
            />
            <InfoCard
              label="Recovery Barrier"
              value={history.institutionalLearning.mostFrequentRecoveryBarrier}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Historical Confidence</p>
          <h2 style={styles.cardTitle}>
            Can leadership trust the historical pattern?
          </h2>

          <div style={styles.learningGrid}>
            <InfoCard
              label="Snapshot Coverage"
              value={history.historicalConfidence.snapshotCoverage}
            />
            <InfoCard
              label="Evidence Verification"
              value={history.historicalConfidence.evidenceVerification}
            />
            <InfoCard
              label="Memory Confidence"
              value={history.historicalConfidence.memoryConfidence}
            />
            <InfoCard
              label="Meaning"
              value={history.historicalConfidence.confidenceMeaning}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Historical Interpretation</p>
          <h2 style={styles.cardTitle}>
            {history.hasHistory
              ? executiveLabel(intelligence.requiredHistoryAction)
              : 'Begin preserving continuity snapshots.'}
          </h2>
          <p style={styles.bodyText}>
            {history.hasHistory ? intelligence.trajectoryMeaning : EMPTY_HISTORY}
          </p>
        </section>

        <details style={styles.evidencePanel}>
          <summary style={styles.evidenceSummary}>
            <span>
              <span style={styles.sectionKicker}>Historical Evidence</span>
              <strong style={styles.evidenceTitle}>
                Recovery, snapshots, compression, and movement timeline
              </strong>
            </span>
            <span style={styles.evidenceToggle}>Expand Memory</span>
          </summary>

          <div style={styles.evidenceGrid}>
            <Panel title="Recovery and Stabilization Memory">
              {history.hasHistory ? (
                <div style={styles.infoList}>
                  <Info
                    label="Recovery"
                    value={executiveLabel(intelligence.recoveryTrajectoryLabel)}
                  />
                  <Info
                    label="Stabilization"
                    value={executiveLabel(
                      intelligence.stabilizationCredibilityLabel,
                    )}
                  />
                  <Info
                    label="Memory Pressure"
                    value={executiveLabel(
                      intelligence.institutionalMemoryPressureLabel,
                    )}
                  />
                  <Info
                    label="Persistence"
                    value={executiveLabel(
                      intelligence.continuityPersistenceSeverityLabel,
                    )}
                  />
                </div>
              ) : (
                <EmptyPanel title={EMPTY_HISTORY} body={EMPTY_HISTORY} />
              )}
            </Panel>

            <Panel title="Memory Compression">
              <p style={styles.panelText}>
                {history.hasHistory
                  ? intelligence.memoryCompressionSummary
                  : EMPTY_HISTORY}
              </p>
            </Panel>

            <Panel title="Latest Persisted Snapshot">
              {intelligence.latest ? (
                <div style={styles.infoList}>
                  <Info
                    label="Label"
                    value={
                      intelligence.latest.snapshot_label || 'Unlabeled snapshot'
                    }
                  />
                  <Info
                    label="Posture"
                    value={executiveLabel(
                      intelligence.latest.continuity_posture,
                    )}
                  />
                  <Info
                    label="Source"
                    value={intelligence.latest.source_route || 'Not recorded'}
                  />
                  <Info
                    label="Concern"
                    value={
                      intelligence.latest.dominant_concern || 'Not recorded'
                    }
                  />
                </div>
              ) : (
                <EmptyPanel title={EMPTY_HISTORY} body={EMPTY_HISTORY} />
              )}
            </Panel>

            <Panel title="Oldest Compared Snapshot">
              {intelligence.oldest ? (
                <div style={styles.infoList}>
                  <Info
                    label="Label"
                    value={
                      intelligence.oldest.snapshot_label || 'Unlabeled snapshot'
                    }
                  />
                  <Info
                    label="Posture"
                    value={executiveLabel(
                      intelligence.oldest.continuity_posture,
                    )}
                  />
                  <Info
                    label="Source"
                    value={intelligence.oldest.source_route || 'Not recorded'}
                  />
                  <Info
                    label="Recorded"
                    value={formatHistoryDate(
                      intelligence.oldest.created_at || '',
                    )}
                  />
                </div>
              ) : (
                <EmptyPanel title={EMPTY_HISTORY} body={EMPTY_HISTORY} />
              )}
            </Panel>
          </div>

          <section style={styles.timelinePanel}>
            <p style={styles.sectionKicker}>Historical Movement Timeline</p>
            <h2 style={styles.cardTitle}>
              History should explain movement, not only list records.
            </h2>

            <div style={styles.timeline}>
              {history.movementTimeline.length === 0 && (
                <EmptyPanel title={EMPTY_HISTORY} body={EMPTY_HISTORY} />
              )}

              {history.movementTimeline.map((event, index) => (
                <article
                  key={`${event.date}-${index}`}
                  style={styles.timelineItem}
                >
                  <p style={styles.timelineDate}>{event.date}</p>
                  <h3 style={styles.timelineTitle}>{event.title}</h3>
                  <p style={styles.timelineBody}>{event.body}</p>

                  <div style={styles.timelineMetaGrid}>
                    <TimelineMeta label="Posture" value={event.posture} />
                    <TimelineMeta
                      label="Movement"
                      value={deriveMovementMeaning(event.posture)}
                    />
                    <TimelineMeta
                      label="Memory"
                      value="Preserved for institutional review"
                    />
                  </div>
                </article>
              ))}
            </div>
          </section>
        </details>

        <section style={styles.principleCard}>
          <div style={styles.principleIcon}>⚖</div>

          <div>
            <p style={styles.sectionKicker}>Continuity History Principle</p>
            <p style={styles.principleText}>
              Continuity history explains movement. It preserves memory without
              overriding current truth. It ensures leadership never forgets what
              mattered.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

function MetricCard({
  label,
  value,
  body,
}: {
  label: string
  value: string
  body: string
}) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function PatternCard({ pattern }: { pattern: PatternCount }) {
  return (
    <article style={styles.patternCard}>
      <p style={styles.metricLabel}>{pattern.label}</p>
      <p style={styles.patternCount}>{pattern.count}</p>
      <p style={styles.panelBody}>{pattern.meaning}</p>
    </article>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.infoCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.infoCardValue}>{value}</p>
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

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div style={styles.emptyPanel}>
      <p style={styles.emptyTitle}>{title}</p>
      <p style={styles.emptyText}>{body}</p>
    </div>
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

function TimelineMeta({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.timelineMeta}>
      <span style={styles.timelineMetaLabel}>{label}</span>
      <strong style={styles.timelineMetaValue}>{value}</strong>
    </div>
  )
}

const gold = '#d6b25e'
const mutedGold = '#9f8142'
const deepBlack = '#030303'
const panelBlack = '#090807'
const cardBlack = '#11100d'
const softLine = 'rgba(214,178,94,0.24)'

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
  header: { marginBottom: '24px' },
  kicker: {
    color: gold,
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '2px',
    margin: 0,
  },
  title: {
    color: '#fff8e7',
    fontSize: 'clamp(34px, 4vw, 48px)',
    lineHeight: 1,
    margin: '10px 0',
    letterSpacing: '-0.05em',
  },
  subtitle: {
    color: '#cfc7b5',
    maxWidth: '820px',
    lineHeight: 1.65,
    fontSize: '14px',
    margin: 0,
  },
  doctrinePanel: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '22px',
    marginTop: '22px',
  },
  doctrineTitle: {
    color: gold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.15em',
    margin: '0 0 14px',
  },
  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
  },
  doctrineCard: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    color: '#fff8e7',
    fontSize: '12px',
    lineHeight: 1.45,
    fontWeight: 800,
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
    fontSize: 'clamp(32px, 4vw, 48px)',
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
  questionBox: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px',
  },
  questionText: {
    color: '#fff8e7',
    fontSize: '24px',
    lineHeight: 1.16,
    margin: '10px 0 0',
    fontWeight: 950,
  },
  memoryDirectionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: '24px',
    alignItems: 'center',
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
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
  disabledButton: { cursor: 'not-allowed', opacity: 0.65 },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  metricCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
    minHeight: '140px',
  },
  metricLabel: {
    color: mutedGold,
    fontSize: '9px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  metricValue: {
    color: gold,
    fontSize: '30px',
    fontWeight: 950,
    lineHeight: 1.05,
    margin: '10px 0',
  },
  card: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
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
    lineHeight: 1.6,
    fontSize: '13px',
    margin: 0,
  },
  movementGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '18px',
  },
  patternGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
  },
  patternCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '14px',
    minHeight: '150px',
  },
  patternCount: {
    color: gold,
    fontSize: '34px',
    fontWeight: 950,
    margin: '10px 0',
    lineHeight: 1,
  },
  learningGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
  },
  infoCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '14px',
    minHeight: '120px',
  },
  infoCardValue: {
    color: '#fff8e7',
    fontSize: '15px',
    fontWeight: 900,
    lineHeight: 1.35,
    margin: '10px 0 0',
  },
  infoList: {
    display: 'grid',
    gap: '10px',
    marginTop: '14px',
  },
  infoRow: {
    display: 'grid',
    gap: '8px',
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '12px',
    alignItems: 'start',
  },
  infoLabel: {
    color: mutedGold,
    fontWeight: 900,
    fontSize: '10px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#fff8e7',
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  emptyPanel: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '112px',
    textAlign: 'center',
    padding: '12px',
  },
  emptyTitle: {
    color: '#fff8e7',
    fontSize: '18px',
    fontWeight: 900,
    margin: '0 0 8px',
  },
  emptyText: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
    fontWeight: 700,
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
    fontSize: '22px',
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
  evidenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '18px',
    marginTop: '20px',
  },
  panel: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px',
    minHeight: '180px',
  },
  panelKicker: {
    color: mutedGold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.14em',
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
    lineHeight: 1.65,
    margin: 0,
  },
  timelinePanel: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '22px',
    marginTop: '18px',
  },
  timeline: {
    display: 'grid',
    gap: '16px',
    marginTop: '18px',
  },
  timelineItem: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px',
  },
  timelineDate: {
    color: mutedGold,
    fontSize: '12px',
    fontWeight: 900,
    margin: 0,
  },
  timelineTitle: {
    color: gold,
    fontSize: '24px',
    lineHeight: 1.15,
    margin: '8px 0',
  },
  timelineBody: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
  },
  timelineMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '14px',
  },
  timelineMeta: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '12px',
  },
  timelineMetaLabel: {
    display: 'block',
    color: mutedGold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '6px',
  },
  timelineMetaValue: {
    color: '#fff8e7',
    lineHeight: 1.4,
    overflowWrap: 'anywhere',
  },
  principleCard: {
    display: 'grid',
    gridTemplateColumns: '76px minmax(0, 1fr)',
    gap: '20px',
    alignItems: 'center',
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
  },
  principleIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '999px',
    border: `1px solid ${softLine}`,
    display: 'grid',
    placeItems: 'center',
    color: gold,
    fontSize: '30px',
  },
  principleText: {
    color: '#cfc7b5',
    lineHeight: 1.65,
    margin: '10px 0 0',
    fontSize: '14px',
  },
}