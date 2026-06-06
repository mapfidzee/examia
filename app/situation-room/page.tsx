'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIDemoScenario } from '@/lib/cgiDemoScenarioEngine'
import { buildCGIExecutiveBriefing } from '@/lib/cgiExecutiveBriefingGenerator'
import { buildCGIContinuitySnapshot } from '@/lib/cgiContinuitySnapshotEngine'
import { reviewCGIExecutiveHistory } from '@/lib/cgiExecutiveHistoryEngine'
import { buildCGIExecutiveReportPackage } from '@/lib/cgiExecutiveReportingEngine'
import { buildCGIContinuityTrajectory } from '@/lib/cgiContinuityTrajectoryEngine'
import {
  loadCGISituationReviews,
  saveCGISituationReview,
} from '@/lib/cgiPersistenceEngine'
import {
  formatCGIExecutivePosture,
  formatCGIEvidenceLanguage,
  formatCGISurvivabilityLanguage,
  formatCGIGovernanceSafeLanguage,
} from '@/lib/cgiExecutivePostureFormatter'

type PersistedSituationReview = Record<string, any>

type EnterpriseOperatingPicture = {
  posture: string
  operatingQuestion: string
  pressureReading: string
  trajectoryReading: string
  predictiveReading: string
  recoveryReading: string
  reliabilityReading: string
  commandReading: string
  coordinationReading: string
  crossSiteReading: string
  executiveMeaning: string
  nextDestination: string
  evidenceStandard: string
}

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

  const operatingPicture = buildEnterpriseOperatingPicture({
    pilotThread,
    briefing,
    trajectory,
    historyReview,
  })

  const executivePosture = formatCGIExecutivePosture(
    briefing.synthesis.synthesisPosture,
  )

  const evidenceLanguage = formatCGIEvidenceLanguage(
    false,
    briefing.synthesis.synthesisPosture,
  )

  const survivabilityLanguage = formatCGISurvivabilityLanguage(
    briefing.synthesis.synthesisPosture,
  )

  const governanceLanguage = formatCGIGovernanceSafeLanguage()

  async function loadSituationReviews() {
    try {
      setLoadingReviews(true)
      setReviewMessage('Loading persisted situation reviews...')

      const loadedReviews = await loadCGISituationReviews()

      setReviews(Array.isArray(loadedReviews) ? loadedReviews : [])
      setReviewMessage('Situation review archive loaded.')
    } catch (error) {
      console.error(error)
      setReviewMessage('Situation review archive could not be loaded.')
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
      setSaveMessage('Saving executive situation review...')

      await saveCGISituationReview({
        situationTitle: 'Enterprise Continuity Situation Room',
        situationPosture: operatingPicture.posture,
        commandQuestion: operatingPicture.operatingQuestion,
        executiveSummary: operatingPicture.executiveMeaning,
        dominantConcern: briefing.dominantConcern,
        historyDirection: historyReview.direction,
        continuityDriftDetected: historyReview.continuityDriftDetected,
        reportClassification: report.classification,
        requiredExecutiveAction: trajectory.trajectoryRecommendation,
        requiredEvidence: operatingPicture.evidenceStandard,
        copyReadySituationReport: buildSituationReport({
          operatingPicture,
          trajectory,
          briefing,
          historyReview,
          report,
          pilotThread,
        }),
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

      setSaveMessage('Executive situation review saved.')
      await loadSituationReviews()
    } catch (error) {
      console.error(error)
      setSaveMessage('Executive situation review could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <InfrastructureNav />

        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • SITUATION ROOM</p>

          <h1 style={styles.title}>Enterprise Continuity Situation Room</h1>

          <p style={styles.subtitle}>
            Enterprise operating picture for fusing pressure, trajectory,
            predictive warning, recovery credibility, reliability, command,
            coordination, cross-site exposure, executive meaning, and audit
            evidence into one live continuity reading.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Enterprise Operating Picture</p>

            <h2 style={styles.heroTitle}>{operatingPicture.posture}</h2>

            <p style={styles.heroMeaning}>{operatingPicture.executiveMeaning}</p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Operating Question</p>

            <p style={styles.statusQuestion}>
              {operatingPicture.operatingQuestion}
            </p>
          </div>
        </section>

        <section style={styles.chainPanel}>
          <ChainStep label="Recovery" value="Uneven durability" />
          <ChainStep label="Command" value="Elevated visibility" />
          <ChainStep label="Coordination" value="Shared dependency" />
          <ChainStep label="Cross-Site" value="Enterprise exposure" />
          <ChainStep label="Situation Room" value="Operating picture" active />
          <ChainStep label="Next" value={operatingPicture.nextDestination} />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Pilot Chain Context</p>

          <h2 style={styles.cardTitle}>{pilotThread.scenarioName}</h2>

          <p style={styles.bodyText}>{pilotThread.scenarioSummary}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem
              title="Pressure"
              body={operatingPicture.pressureReading}
            />
            <PriorityItem
              title="Trajectory"
              body={operatingPicture.trajectoryReading}
            />
            <PriorityItem
              title="Predictive"
              body={operatingPicture.predictiveReading}
            />
          </div>
        </section>

        <section style={styles.gridFour}>
          <SignalCard
            title="Pressure"
            value="ELEVATED"
            body={operatingPicture.pressureReading}
          />

          <SignalCard
            title="Trajectory"
            value={trajectory.trajectory}
            body={operatingPicture.trajectoryReading}
          />

          <SignalCard
            title="Predictive Warning"
            value="ELEVATED"
            body={operatingPicture.predictiveReading}
          />

          <SignalCard
            title="Reliability"
            value="ELEVATED"
            body={operatingPicture.reliabilityReading}
          />
        </section>

        <section style={styles.gridFour}>
          <SignalCard
            title="Recovery"
            value="PARTIAL"
            body={operatingPicture.recoveryReading}
          />

          <SignalCard
            title="Command"
            value="ELEVATED"
            body={operatingPicture.commandReading}
          />

          <SignalCard
            title="Coordination"
            value="REQUIRED"
            body={operatingPicture.coordinationReading}
          />

          <SignalCard
            title="Cross-Site"
            value="VISIBLE"
            body={operatingPicture.crossSiteReading}
          />
        </section>

        <section style={styles.trajectoryPanel}>
          <div>
            <p style={styles.sectionKicker}>Trajectory Reading</p>

            <h2 style={styles.cardTitle}>{trajectory.momentum}</h2>

            <p style={styles.bodyText}>{trajectory.trajectoryExplanation}</p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Watch Next</p>

            <p style={styles.statusQuestion}>{trajectory.watchNext}</p>
          </div>
        </section>

        <section style={styles.gridFour}>
          <SignalCard
            title="Momentum"
            value={trajectory.momentum}
            body="Operational movement pressure behind the current situation."
          />

          <SignalCard
            title="History Direction"
            value={historyReview.direction}
            body="Whether continuity is improving, holding, worsening, or not yet historically mature."
          />

          <SignalCard
            title="Continuity Drift"
            value={historyReview.continuityDriftDetected ? 'YES' : 'NO'}
            body="Whether continuity degradation or exposure persistence requires leadership review."
          />

          <SignalCard
            title="Next Destination"
            value={operatingPicture.nextDestination}
            body="The next governed executive movement from the Situation Room."
          />
        </section>

        <section style={styles.gridThree}>
          <Panel title="Situation Room">
            What is happening institution-wide right now, where continuity is
            heading, and what must remain visible.
          </Panel>

          <Panel title="Executive Center">
            What leadership must understand and what decision posture is
            required.
          </Panel>

          <Panel title="Audit">
            Whether the operating picture, evidence, and movement can be
            reconstructed later.
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Enterprise Evidence Standard</p>

          <h2 style={styles.cardTitle}>
            The operating picture must remain reconstructable.
          </h2>

          <p style={styles.bodyText}>{operatingPicture.evidenceStandard}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem title="Risk" body={trajectory.trajectoryRisk} />
            <PriorityItem
              title="Recommendation"
              body={trajectory.trajectoryRecommendation}
            />
            <PriorityItem
              title="Executive Meaning"
              body={trajectory.executiveMeaning}
            />
          </div>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Persistence Action</p>

            <h2 style={styles.actionTitle}>
              Preserve this situation review as enterprise operating memory.
            </h2>

            <p style={styles.actionText}>
              Saving the situation review creates a durable institutional record
              of enterprise posture, trajectory direction, command visibility,
              coordination pressure, cross-site exposure, required evidence, and
              executive meaning.
            </p>

            {saveMessage && <p style={styles.saveMessage}>{saveMessage}</p>}
          </div>

          <button
            type="button"
            onClick={handleSaveSituationReview}
            disabled={saving}
            style={{
              ...styles.primaryButton,
              ...(saving ? styles.disabledButton : {}),
            }}
          >
            {saving ? 'Saving...' : 'Save Situation Review'}
          </button>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Situation Memory Retrieval</p>

            <h2 style={styles.actionTitle}>
              Retrieve persisted executive situation reviews.
            </h2>

            <p style={styles.actionText}>
              CGI can reconstruct historical operating pictures, continuity
              drift, trajectory direction, required actions, and survivability
              interpretation across time.
            </p>

            {reviewMessage && <p style={styles.saveMessage}>{reviewMessage}</p>}
          </div>

          <button
            type="button"
            onClick={loadSituationReviews}
            disabled={loadingReviews}
            style={{
              ...styles.secondaryButton,
              ...(loadingReviews ? styles.disabledButton : {}),
            }}
          >
            {loadingReviews ? 'Refreshing...' : 'Refresh Reviews'}
          </button>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Executive Action</p>

          <h2 style={styles.cardTitle}>{executivePosture.headline}</h2>

          <p style={styles.bodyText}>{executivePosture.actionLanguage}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem title="Evidence" body={evidenceLanguage} />
            <PriorityItem title="Survivability" body={survivabilityLanguage} />
            <PriorityItem title="Governance Meaning" body={governanceLanguage} />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Persisted Situation Archive</p>

          <h2 style={styles.cardTitle}>
            Executive situation reviews retrieved from Supabase.
          </h2>

          <p style={styles.bodyText}>Review Count: {reviews.length}</p>

          <div style={styles.archiveList}>
            {reviews.length === 0 ? (
              <p style={styles.emptyText}>
                No persisted situation reviews are currently available.
              </p>
            ) : (
              reviews.map((item, index) => (
                <article
                  key={item.id ?? `${getReviewValue(item, 'createdAt')}-${index}`}
                  style={styles.archiveItem}
                >
                  <div style={styles.archiveHeader}>
                    <div>
                      <p style={styles.panelKicker}>
                        {getReviewValue(item, 'reportClassification') ??
                          'SITUATION_REVIEW'}
                      </p>

                      <h3 style={styles.archiveTitle}>
                        {getReviewValue(item, 'situationTitle') ??
                          'Executive Continuity Situation Room'}
                      </h3>
                    </div>

                    <p style={styles.archiveDate}>
                      {formatDate(getReviewValue(item, 'createdAt'))}
                    </p>
                  </div>

                  <div style={styles.archiveGrid}>
                    <PriorityItem
                      title="Situation Posture"
                      body={
                        getReviewValue(item, 'situationPosture') ??
                        'Not recorded'
                      }
                    />

                    <PriorityItem
                      title="History Direction"
                      body={
                        getReviewValue(item, 'historyDirection') ??
                        'Not recorded'
                      }
                    />

                    <PriorityItem
                      title="Required Action"
                      body={
                        getReviewValue(item, 'requiredExecutiveAction') ??
                        'Not recorded'
                      }
                    />
                  </div>

                  <p style={styles.archiveSummary}>
                    {getReviewValue(item, 'executiveSummary') ??
                      'No executive summary was recorded for this review.'}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Situation Priorities</p>

          <h2 style={styles.cardTitle}>
            The Situation Room compresses the enterprise operating picture into
            leadership-ready priorities.
          </h2>

          <div style={styles.situationList}>
            <SituationItem
              title="Dominant Concern"
              body={briefing.dominantConcern}
            />

            <SituationItem
              title="Required Action"
              body={trajectory.trajectoryRecommendation}
            />

            <SituationItem
              title="Required Evidence"
              body={operatingPicture.evidenceStandard}
            />

            <SituationItem
              title="History Meaning"
              body={historyReview.executiveMeaning}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Copy-Ready Situation Report</p>

          <h2 style={styles.cardTitle}>
            Enterprise continuity situation package.
          </h2>

          <pre style={styles.summaryBox}>
            {buildSituationReport({
              operatingPicture,
              trajectory,
              briefing,
              historyReview,
              report,
              pilotThread,
            })}
          </pre>
        </section>
      </div>
    </main>
  )
}

function buildEnterpriseOperatingPicture(input: {
  pilotThread: ReturnType<typeof buildCGIDemoScenario>['pilotThread']
  briefing: ReturnType<typeof buildCGIExecutiveBriefing>
  trajectory: ReturnType<typeof buildCGIContinuityTrajectory>
  historyReview: ReturnType<typeof reviewCGIExecutiveHistory>
}): EnterpriseOperatingPicture {
  return {
    posture: 'ENTERPRISE CONTINUITY WATCH',
    operatingQuestion:
      'Can leadership trust continuity while recovery is uneven and cross-site exposure remains visible?',
    pressureReading:
      'Operational pressure remains elevated because fuel logistics disruption has affected multiple sites.',
    trajectoryReading:
      input.trajectory.trajectoryDirection,
    predictiveReading:
      'Predictive warning remains elevated because supplier concentration can produce recurrence before full recovery durability is proven.',
    recoveryReading:
      'Recovery is visible but uneven. North is stabilizing, South remains under watch, and East still carries recurrence exposure.',
    reliabilityReading:
      'Reliability remains provisional until supplier alternatives, recovery evidence, and cross-site durability are confirmed.',
    commandReading:
      'Command visibility remains justified because recovery credibility is not yet fully proven.',
    coordinationReading:
      'Coordination must synchronize ownership, routing, supplier alternatives, evidence, and site-level recovery proof.',
    crossSiteReading:
      'Cross-site intelligence shows shared supplier dependency and enterprise continuity exposure.',
    executiveMeaning:
      input.pilotThread.executiveThesis,
    nextDestination: 'Executive Center',
    evidenceStandard:
      'Preserve pressure reading, trajectory direction, predictive warning, recovery status, command posture, coordination need, cross-site pattern, executive meaning, required action, and audit reconstruction trail.',
  }
}

function buildSituationReport(input: {
  operatingPicture: EnterpriseOperatingPicture
  trajectory: ReturnType<typeof buildCGIContinuityTrajectory>
  briefing: ReturnType<typeof buildCGIExecutiveBriefing>
  historyReview: ReturnType<typeof reviewCGIExecutiveHistory>
  report: ReturnType<typeof buildCGIExecutiveReportPackage>
  pilotThread: ReturnType<typeof buildCGIDemoScenario>['pilotThread']
}) {
  return [
    'TSINAXA CGI Enterprise Situation Room Report',
    '',
    `Pilot Scenario: ${input.pilotThread.scenarioName}`,
    '',
    `Enterprise Posture: ${input.operatingPicture.posture}`,
    '',
    `Operating Question: ${input.operatingPicture.operatingQuestion}`,
    '',
    `Pressure Reading: ${input.operatingPicture.pressureReading}`,
    '',
    `Trajectory: ${input.trajectory.trajectory}`,
    `Momentum: ${input.trajectory.momentum}`,
    `Direction: ${input.trajectory.trajectoryDirection}`,
    '',
    `Predictive Reading: ${input.operatingPicture.predictiveReading}`,
    '',
    `Recovery Reading: ${input.operatingPicture.recoveryReading}`,
    '',
    `Reliability Reading: ${input.operatingPicture.reliabilityReading}`,
    '',
    `Command Reading: ${input.operatingPicture.commandReading}`,
    '',
    `Coordination Reading: ${input.operatingPicture.coordinationReading}`,
    '',
    `Cross-Site Reading: ${input.operatingPicture.crossSiteReading}`,
    '',
    `Commander Question: ${input.trajectory.commanderQuestion}`,
    '',
    `Operational Meaning: ${input.trajectory.trajectoryExplanation}`,
    '',
    `Risk: ${input.trajectory.trajectoryRisk}`,
    '',
    `Recommendation: ${input.trajectory.trajectoryRecommendation}`,
    '',
    `Watch Next: ${input.trajectory.watchNext}`,
    '',
    `Executive Meaning: ${input.operatingPicture.executiveMeaning}`,
    '',
    `Continuity Posture: ${input.briefing.synthesis.synthesisPosture}`,
    '',
    `Dominant Concern: ${input.briefing.dominantConcern}`,
    '',
    `History Direction: ${input.historyReview.direction}`,
    '',
    `Continuity Drift Detected: ${
      input.historyReview.continuityDriftDetected ? 'YES' : 'NO'
    }`,
    '',
    `Evidence Standard: ${input.operatingPicture.evidenceStandard}`,
    '',
    `Report Classification: ${input.report.classification}`,
  ].join('\n')
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

function ChainStep({
  label,
  value,
  active,
}: {
  label: string
  value: string
  active?: boolean
}) {
  return (
    <article
      style={{
        ...styles.chainStep,
        ...(active ? styles.chainStepActive : {}),
      }}
    >
      <p style={styles.panelKicker}>{label}</p>
      <p style={styles.chainValue}>{value}</p>
    </article>
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

function PriorityItem({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <article style={styles.priorityItem}>
      <p style={styles.panelKicker}>{title}</p>
      <p style={styles.priorityBody}>{body}</p>
    </article>
  )
}

function SituationItem({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <article style={styles.situationItem}>
      <p style={styles.panelKicker}>{title}</p>
      <p style={styles.situationBody}>{body}</p>
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
    maxWidth: '1180px',
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
    fontSize: 'clamp(36px, 5vw, 56px)',
    lineHeight: 1.05,
    margin: '10px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '880px',
    lineHeight: 1.65,
    fontSize: '16px',
    margin: 0,
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(260px, 0.65fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #67e8f9',
    borderRadius: '26px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  chainPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  chainStep: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '14px',
    minHeight: '110px',
  },
  chainStepActive: {
    background: '#083344',
    border: '1px solid #22d3ee',
  },
  chainValue: {
    color: '#e0f2fe',
    fontSize: '13px',
    fontWeight: 900,
    lineHeight: 1.35,
    margin: '10px 0 0',
  },
  trajectoryPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(260px, 0.65fr)',
    gap: '16px',
    background: '#082f49',
    border: '1px solid #0ea5e9',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
    boxSizing: 'border-box',
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
  saveMessage: {
    color: '#cffafe',
    fontWeight: 900,
    margin: '12px 0 0',
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
  secondaryButton: {
    border: '1px solid #67e8f9',
    borderRadius: '14px',
    background: '#0f172a',
    color: '#cffafe',
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
    fontSize: 'clamp(34px, 5vw, 56px)',
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
  statusQuestion: {
    color: '#cffafe',
    fontSize: '22px',
    lineHeight: 1.3,
    margin: 0,
    fontWeight: 900,
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  signalCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '160px',
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
    maxWidth: '900px',
  },
  priorityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  priorityItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '14px',
  },
  priorityBody: {
    color: '#e2e8f0',
    lineHeight: 1.55,
    margin: '10px 0 0',
    fontWeight: 700,
  },
  panel: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
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
  situationList: {
    display: 'grid',
    gap: '12px',
    marginTop: '16px',
  },
  situationItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },
  situationBody: {
    color: '#e2e8f0',
    lineHeight: 1.6,
    margin: '10px 0 0',
    fontWeight: 700,
  },
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '16px',
    color: '#e2e8f0',
    lineHeight: 1.55,
    minHeight: '260px',
    fontSize: '14px',
    overflowX: 'auto',
  },
  archiveList: {
    display: 'grid',
    gap: '14px',
    marginTop: '16px',
  },
  archiveItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },
  archiveHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    alignItems: 'flex-start',
    marginBottom: '14px',
  },
  archiveTitle: {
    color: '#f8fafc',
    fontSize: '20px',
    lineHeight: 1.2,
    margin: '8px 0 0',
  },
  archiveDate: {
    color: '#a5f3fc',
    fontWeight: 800,
    fontSize: '13px',
    lineHeight: 1.4,
    margin: 0,
    textAlign: 'right',
    minWidth: '180px',
  },
  archiveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
  },
  archiveSummary: {
    color: '#cbd5e1',
    lineHeight: 1.65,
    margin: '14px 0 0',
  },
  emptyText: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    margin: 0,
  },
}