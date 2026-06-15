'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIDemoScenario } from '@/lib/cgiDemoScenarioEngine'
import { buildCGIExecutiveBriefing } from '@/lib/cgiExecutiveBriefingGenerator'
import { buildCGIContinuitySnapshot } from '@/lib/cgiContinuitySnapshotEngine'
import { reviewCGIExecutiveHistory } from '@/lib/cgiExecutiveHistoryEngine'
import { buildCGIExecutiveReportPackage } from '@/lib/cgiExecutiveReportingEngine'
import { buildCGIContinuityTrajectory } from '@/lib/cgiContinuityTrajectoryEngine'
import {
  buildCGISituationRoomBriefingReport,
  buildCGISituationRoomOperatingPicture,
} from '@/lib/cgiSituationRoomDoctrineEngine'
import {
  loadCGISituationReviews,
  saveCGISituationReview,
} from '@/lib/cgiPersistenceEngine'
import {
  formatCGIEvidenceLanguage,
  formatCGIExecutivePosture,
} from '@/lib/cgiExecutivePostureFormatter'

type PersistedSituationReview = Record<string, any>

export default function SituationRoomPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <SituationRoomContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function SituationRoomContent() {
  const [saveMessage, setSaveMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [reviews, setReviews] = useState<PersistedSituationReview[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')

  const pilotScenario = buildCGIDemoScenario('FUEL_LOGISTICS_CHAIN_PROOF')
  const pilotThread = pilotScenario.pilotThread

  const briefing = buildCGIExecutiveBriefing({
    pressurePosture: 'ELEVATED',
    trajectoryPosture: 'ELEVATED',
    predictivePosture: 'ELEVATED',
    recoveryPosture: 'WATCHED',
    reliabilityPosture: 'ELEVATED',
    evidenceVerified: false,
    accountabilityActive: true,
    structuralMemoryVisible: true,
  })

  const trajectory = buildCGIContinuityTrajectory({
    continuityCondition: 'FRAGILE_RECOVERY',
    continuityConfidence: 'FRAGILE',
    survivabilityPressure: 'ELEVATED',
    recoveryCredibility: 'PARTIAL',
    recurrenceSeverity: 'RECURRING',
    executivePosture: 'VERIFY',
    openCases: 4,
    escalatedCases: 1,
    repeatedInstabilityCount: 3,
    unresolvedCriticalCount: 0,
    recoveryFailures: 1,
    verifiedRecoveries: 1,
    coordinationIssues: 2,
    averageUnresolvedDays: 6,
    crossSiteSignals: 1,
    commandReviews: 1,
    auditGaps: 1,
  })

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

  const latestSnapshot = snapshots[snapshots.length - 1]
  const historyReview = reviewCGIExecutiveHistory(snapshots)

  const report = buildCGIExecutiveReportPackage({
    classification: 'CROSS_SITE_COORDINATION_REPORT',
    latestSnapshot,
    historyReview,
  })

  const operatingPicture = buildCGISituationRoomOperatingPicture({
    pilotThread,
    briefing,
    trajectory,
    historyReview,
    report,
  })

  const situationReport = buildCGISituationRoomBriefingReport({
    operatingPicture,
    trajectory,
    briefing,
    historyReview,
    report,
    pilotThread,
  })

  const executivePosture = formatCGIExecutivePosture(
    briefing.synthesis.synthesisPosture,
  )

  const evidenceLanguage = formatCGIEvidenceLanguage(
    false,
    briefing.synthesis.synthesisPosture,
  )

  async function loadSituationReviews() {
    try {
      setLoadingReviews(true)
      setReviewMessage('Loading situation memory...')

      const loadedReviews = await loadCGISituationReviews()

      setReviews(Array.isArray(loadedReviews) ? loadedReviews : [])
      setReviewMessage('Situation memory loaded.')
    } catch (error) {
      console.error(error)
      setReviewMessage('Situation memory could not be loaded.')
    } finally {
      setLoadingReviews(false)
    }
  }

  useEffect(() => {
    loadSituationReviews()
  }, [])

  async function handleSaveSituationReview() {
    try {
      setSaving(true)
      setSaveMessage('Saving situation review...')

      await saveCGISituationReview({
        situationTitle: 'Enterprise Continuity Situation Room',
        situationPosture: operatingPicture.posture,
        commandQuestion: operatingPicture.operatingQuestion,
        executiveSummary: operatingPicture.executiveMeaning,
        dominantConcern: briefing.dominantConcern,
        historyDirection: historyReview.direction,
        continuityDriftDetected: historyReview.continuityDriftDetected,
        reportClassification: report.classification,
        requiredExecutiveAction: operatingPicture.requiredAction,
        requiredEvidence: operatingPicture.evidenceStandard,
        copyReadySituationReport: situationReport,
        rawPayload: {
          operatingPicture,
          briefing,
          trajectory,
          latestSnapshot,
          historyReview,
          report,
          pilotThread,
          savedFrom: '/situation-room',
        },
      })

      setSaveMessage('Situation review saved.')
      await loadSituationReviews()
    } catch (error) {
      console.error(error)
      setSaveMessage('Situation review could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • SITUATION ROOM</p>

            <h1 style={styles.title}>Enterprise Continuity Situation Room</h1>

            <p style={styles.subtitle}>
              The Situation Room converges pressure, trajectory, predictive
              warning, recovery durability, reliability confidence, command
              visibility, coordination exposure, cross-site intelligence,
              executive meaning, and audit evidence into one current operating
              condition.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>CURRENT CONDITION</p>
            <p style={styles.statusValue}>{operatingPicture.posture}</p>
            <p style={styles.statusMeaning}>
              {operatingPicture.executiveMeaning}
            </p>
          </div>
        </section>

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Executive Situation Question</p>

            <h2 style={styles.commandTitle}>
              {operatingPicture.operatingQuestion}
            </h2>

            <div style={styles.commandMetaGrid}>
              <MiniStat label="Posture" value={operatingPicture.posture} />
              <MiniStat label="History" value={historyReview.direction} />
              <MiniStat
                label="Continuity Drift"
                value={historyReview.continuityDriftDetected ? 'YES' : 'NO'}
              />
              <MiniStat label="Next" value={operatingPicture.nextDestination} />
            </div>
          </div>

          <div style={styles.consequenceCard}>
            <p style={styles.sectionKicker}>Board Warning</p>

            <h2 style={styles.consequenceTitle}>
              Do not separate signals that converge into one condition.
            </h2>

            <p style={styles.bodyText}>{operatingPicture.boardWarning}</p>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Pressure" value="ELEVATED" />
          <Metric label="Trajectory" value={trajectory.trajectory} />
          <Metric label="Predictive" value="ELEVATED" />
          <Metric label="Recovery" value="PARTIAL" />
          <Metric label="Reliability" value="ELEVATED" />
          <Metric label="Cross-Site" value="VISIBLE" />
        </section>

        <section style={styles.panel}>
          <p style={styles.sectionKicker}>Operating Condition Summary</p>

          <h2 style={styles.panelTitle}>
            What is driving the current condition?
          </h2>

          <div style={styles.summaryGrid}>
            <ExecutiveCard
              title="Pressure"
              value="ELEVATED"
              body={operatingPicture.pressureReading}
            />

            <ExecutiveCard
              title="Trajectory"
              value={trajectory.trajectory}
              body={operatingPicture.trajectoryReading}
            />

            <ExecutiveCard
              title="Dominant Concern"
              value={briefing.dominantConcern}
              body={operatingPicture.coordinationReading}
            />

            <ExecutiveCard
              title="Required Action"
              value={operatingPicture.requiredAction}
              body={operatingPicture.crossSiteReading}
            />
          </div>
        </section>

        <section style={styles.memoryPanel}>
          <p style={styles.sectionKicker}>Executive Meaning</p>

          <h2 style={styles.panelTitle}>
            What must leadership understand now?
          </h2>

          <div style={styles.memoryGrid}>
            <MiniStat
              label="Required Action"
              value={operatingPicture.requiredAction}
            />

            <MiniStat label="Watch Next" value={operatingPicture.watchNext} />

            <MiniStat label="Evidence" value={evidenceLanguage} />

            <MiniStat
              label="Executive Posture"
              value={executivePosture.label}
            />
          </div>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Situation Memory</p>

            <h2 style={styles.actionTitle}>
              Preserve and retrieve the operating picture.
            </h2>

            <p style={styles.actionText}>
              CGI preserves posture, movement, convergence, evidence standard,
              executive meaning, required action, and reconstruction memory.
            </p>

            {(saveMessage || reviewMessage) && (
              <p style={styles.saveMessage}>
                {[saveMessage, reviewMessage].filter(Boolean).join(' ')}
              </p>
            )}
          </div>

          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={handleSaveSituationReview}
              disabled={saving}
              style={{
                ...styles.primaryButton,
                ...(saving ? styles.disabledButton : {}),
              }}
            >
              {saving ? 'Saving...' : 'Save Review'}
            </button>

            <button
              type="button"
              onClick={loadSituationReviews}
              disabled={loadingReviews}
              style={{
                ...styles.secondaryButton,
                ...(loadingReviews ? styles.disabledButton : {}),
              }}
            >
              {loadingReviews ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.sectionKicker}>Enterprise Situation Memory</p>

              <h2 style={styles.panelTitle}>Persisted operating pictures</h2>

              <p style={styles.bodyText}>
                Situation memory keeps prior operating conditions
                reconstructable without turning the Situation Room into an
                archive.
              </p>
            </div>
          </div>

          <div style={styles.archiveList}>
            {reviews.length === 0 ? (
              <p style={styles.emptyText}>
                No persisted situation reviews are currently available.
              </p>
            ) : (
              reviews.slice(0, 3).map((item, index) => (
                <article
                  key={item.id ?? `${getReviewValue(item, 'createdAt')}-${index}`}
                  style={styles.archiveItem}
                >
                  <div style={styles.archiveHeader}>
                    <div>
                      <p style={styles.metricLabel}>
                        {getReviewValue(item, 'reportClassification') ??
                          'SITUATION_REVIEW'}
                      </p>

                      <h3 style={styles.archiveTitle}>
                        {getReviewValue(item, 'situationTitle') ??
                          'Enterprise Continuity Situation Room'}
                      </h3>
                    </div>

                    <p style={styles.archiveDate}>
                      {formatDate(getReviewValue(item, 'createdAt'))}
                    </p>
                  </div>

                  <div style={styles.archiveGrid}>
                    <Info
                      label="Posture"
                      value={
                        getReviewValue(item, 'situationPosture') ??
                        'Not recorded'
                      }
                    />

                    <Info
                      label="Direction"
                      value={
                        getReviewValue(item, 'historyDirection') ??
                        'Not recorded'
                      }
                    />

                    <Info
                      label="Required Action"
                      value={
                        getReviewValue(item, 'requiredExecutiveAction') ??
                        'Not recorded'
                      }
                    />
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section style={styles.orderPanel}>
          <p style={styles.sectionKicker}>Copy-Ready Situation Brief</p>

          <h2 style={styles.panelTitle}>
            Can the institution explain its current continuity condition?
          </h2>

          <pre style={styles.summaryBox}>{situationReport}</pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE SITUATION DOCTRINE</strong>

          <span>
            The Situation Room is the enterprise continuity convergence layer.
            Pressure, trajectory, predictive warning, recovery durability,
            reliability confidence, command visibility, coordination exposure,
            cross-site intelligence, executive meaning, and audit evidence
            converge here before executive interpretation occurs.
          </span>
        </section>
      </div>
    </main>
  )
}

function getReviewValue(
  review: PersistedSituationReview,
  key: string,
): string | null {
  const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

  const value =
    review[key] ??
    review[snakeKey] ??
    review.rawPayload?.trajectory?.[key] ??
    review.raw_payload?.trajectory?.[key] ??
    review.rawPayload?.operatingPicture?.[key] ??
    review.raw_payload?.operatingPicture?.[key] ??
    review.rawPayload?.report?.[key] ??
    review.raw_payload?.report?.[key] ??
    null

  if (value === null || value === undefined) return null
  return String(value)
}

function formatDate(value: string | null) {
  if (!value) return 'Date not recorded'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString()
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
    </article>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.miniStat}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.miniValue}>{value}</p>
    </article>
  )
}

function ExecutiveCard({
  title,
  value,
  body,
}: {
  title: string
  value: string
  body: string
}) {
  return (
    <article style={styles.panelCard}>
      <p style={styles.sectionKicker}>{title}</p>
      <h3 style={styles.cardValue}>{value}</h3>
      <p style={styles.panelBody}>{body}</p>
    </article>
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
    background:
      'radial-gradient(circle at top left, rgba(201, 162, 39, 0.14), transparent 34%), linear-gradient(135deg, #050505 0%, #0B0B0B 45%, #111111 100%)',
    color: '#FFFFFF',
    padding: '40px 24px 72px',
  },
  container: {
    width: 'min(1440px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gap: 22,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(300px, 0.72fr)',
    gap: 22,
    padding: 32,
    border: '1px solid rgba(201, 162, 39, 0.34)',
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
    boxShadow: '0 28px 80px rgba(0,0,0,0.38)',
  },
  kicker: {
    margin: 0,
    color: '#C9A227',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '14px 0 0',
    fontSize: 'clamp(2.3rem, 5vw, 5rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.07em',
    fontWeight: 950,
  },
  subtitle: {
    maxWidth: 900,
    margin: '18px 0 0',
    color: '#C8CDD4',
    fontSize: 16,
    lineHeight: 1.75,
  },
  statusBox: {
    border: '1px solid rgba(201, 162, 39, 0.5)',
    borderRadius: 24,
    padding: 24,
    background:
      'linear-gradient(180deg, rgba(201,162,39,0.18), rgba(0,0,0,0.38))',
  },
  statusLabel: {
    margin: 0,
    color: '#D7B84C',
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  statusValue: {
    margin: '16px 0 0',
    fontSize: 30,
    fontWeight: 950,
    letterSpacing: '-0.04em',
    lineHeight: 1.05,
  },
  statusMeaning: {
    margin: '12px 0 0',
    color: '#ECE7D7',
    fontSize: 14,
    lineHeight: 1.7,
  },
  commandDeck: {
    display: 'grid',
    gridTemplateColumns: '1.35fr 0.85fr',
    gap: 22,
  },
  primaryCard: {
    padding: 30,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))',
    border: '1px solid rgba(201,162,39,0.26)',
  },
  consequenceCard: {
    padding: 30,
    borderRadius: 28,
    background: 'rgba(0,0,0,0.38)',
    border: '1px solid rgba(201,162,39,0.28)',
  },
  sectionKicker: {
    margin: 0,
    color: '#C9A227',
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  commandTitle: {
    margin: '14px 0',
    fontSize: 'clamp(1.8rem, 3vw, 3rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  consequenceTitle: {
    margin: '14px 0',
    fontSize: 28,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
  bodyText: {
    margin: '8px 0 0',
    color: '#AEB6C2',
    lineHeight: 1.7,
    fontSize: 14,
  },
  commandMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 22,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 14,
  },
  metricCard: {
    padding: 18,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  metricLabel: {
    margin: 0,
    color: '#858D98',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  metricValue: {
    margin: '10px 0 0',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 950,
    lineHeight: 1.15,
    overflowWrap: 'anywhere',
  },
  miniStat: {
    padding: 14,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  miniValue: {
    margin: '8px 0 0',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 850,
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  panel: {
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  panelTitle: {
    margin: '12px 0 0',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
    marginTop: 22,
  },
  panelCard: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.09)',
    minHeight: 150,
  },
  cardValue: {
    margin: '12px 0 0',
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
  },
  panelBody: {
    marginTop: 10,
    color: '#AEB6C2',
    fontSize: 14,
    lineHeight: 1.65,
  },
  memoryPanel: {
    padding: 28,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(201,162,39,0.13), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.32)',
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
  },
  actionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 16,
    alignItems: 'center',
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(201,162,39,0.24)',
  },
  actionTitle: {
    margin: '12px 0 0',
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.04em',
  },
  actionText: {
    margin: '12px 0 0',
    color: '#AEB6C2',
    lineHeight: 1.7,
    maxWidth: 820,
  },
  saveMessage: {
    color: '#D7B84C',
    fontWeight: 900,
    margin: '12px 0 0',
  },
  buttonRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  primaryButton: {
    border: 'none',
    borderRadius: 999,
    padding: '14px 22px',
    background: '#C9A227',
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  secondaryButton: {
    border: '1px solid rgba(201,162,39,0.34)',
    borderRadius: 999,
    padding: '14px 22px',
    background: 'rgba(201,162,39,0.1)',
    color: '#F8F6F1',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  disabledButton: {
    cursor: 'not-allowed',
    opacity: 0.65,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
  },
  archiveList: {
    display: 'grid',
    gap: 14,
    marginTop: 20,
  },
  archiveItem: {
    padding: 20,
    borderRadius: 22,
    background: 'rgba(0,0,0,0.24)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  archiveHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  archiveTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 1.2,
    margin: '8px 0 0',
  },
  archiveDate: {
    color: '#D7B84C',
    fontWeight: 850,
    fontSize: 13,
    lineHeight: 1.4,
    margin: 0,
    textAlign: 'right',
    minWidth: 180,
  },
  archiveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
  },
  emptyText: {
    color: '#AEB6C2',
    lineHeight: 1.6,
    margin: 0,
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '140px minmax(0, 1fr)',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  infoLabel: {
    color: '#858D98',
    fontWeight: 900,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  infoValue: {
    color: '#FFFFFF',
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
  },
  orderPanel: {
    padding: 28,
    borderRadius: 28,
    background: '#FFFFFF',
    color: '#0B0B0B',
  },
  summaryBox: {
    marginTop: 20,
    padding: 22,
    borderRadius: 20,
    background: '#0A0A0A',
    color: '#F8F6F1',
    whiteSpace: 'pre-wrap',
    fontSize: 13,
    lineHeight: 1.7,
    overflowX: 'auto',
  },
  doctrineCard: {
    display: 'grid',
    gap: 10,
    padding: 24,
    borderRadius: 24,
    background: '#050505',
    border: '1px solid rgba(201,162,39,0.42)',
    color: '#FFFFFF',
    lineHeight: 1.7,
  },
}