'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIContinuitySnapshot } from '@/lib/cgiContinuitySnapshotEngine'
import { reviewCGIExecutiveHistory } from '@/lib/cgiExecutiveHistoryEngine'
import { buildCGIExecutiveReportPackage } from '@/lib/cgiExecutiveReportingEngine'
import { buildCGIContinuityTrajectory } from '@/lib/cgiContinuityTrajectoryEngine'
import { buildCGIInstitutionalMemory } from '@/lib/cgiInstitutionalMemoryEngine'
import {
  loadCGIExecutiveReports,
  saveCGIExecutiveReport,
} from '@/lib/cgiPersistenceEngine'

type PersistedExecutiveReport = Record<string, any>

export default function ExecutiveReportPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <ExecutiveReportContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function ExecutiveReportContent() {
  const [saveMessage, setSaveMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [reports, setReports] = useState<PersistedExecutiveReport[]>([])
  const [loadingReports, setLoadingReports] = useState(false)
  const [reportMessage, setReportMessage] = useState('')

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
    classification: 'BOARD_CONTINUITY_SUMMARY',
    latestSnapshot,
    historyReview,
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

  const institutionalMemory = buildCGIInstitutionalMemory({
    historicalRecords: snapshots.length,
    recurringInstabilityCount: historyReview.continuityDriftDetected ? 2 : 1,
    recoveryFailureCount: report.requiredEvidence.toUpperCase().includes('GAP') ? 1 : 0,
    verifiedRecoveryCount: report.requiredEvidence.toUpperCase().includes('VERIFIED') ? 1 : 0,
    commandInterventionCount: report.requiredExecutiveAction
      .toUpperCase()
      .includes('COMMAND')
      ? 1
      : 0,
    coordinationIssueCount: report.requiredExecutiveAction
      .toUpperCase()
      .includes('COORDIN')
      ? 1
      : 0,
    crossSiteSignalCount: report.classification.includes('CROSS_SITE') ? 1 : 0,
    executiveReviewCount: report.requiredExecutiveAction
      .toUpperCase()
      .includes('EXECUTIVE')
      ? 1
      : 0,
    auditReconstructionCount: report.requiredEvidence
      .toUpperCase()
      .includes('AUDIT')
      ? 1
      : 0,
    survivabilityThreatCount: historyReview.survivabilityConcernPersisting
      ? 1
      : 0,
    unresolvedMemoryGaps: report.requiredEvidence.toUpperCase().includes('GAP') ? 1 : 0,
    lastKnownPattern: report.dominantConcern,
  })

  async function loadReports() {
    try {
      setLoadingReports(true)
      setReportMessage('Loading persisted executive reports...')

      const loadedReports = await loadCGIExecutiveReports()

      setReports(Array.isArray(loadedReports) ? loadedReports : [])
      setReportMessage('Executive report archive loaded.')
    } catch (error) {
      console.error(error)
      setReportMessage('Executive report archive could not be loaded.')
    } finally {
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  async function handleSaveReport() {
    try {
      setSaving(true)
      setSaveMessage('Saving executive continuity report...')

      await saveCGIExecutiveReport({
        reportClassification: report.classification,
        reportTitle: 'Executive Continuity Intelligence Report',
        currentContinuityPosture: report.currentContinuityPosture,
        historyDirection: report.historyDirection,
        continuityDriftDetected: report.continuityDriftDetected,
        survivabilityConcernPersisting:
          report.survivabilityConcernPersisting,
        dominantConcern: report.dominantConcern,
        requiredExecutiveAction: trajectory.trajectoryRecommendation,
        requiredEvidence: institutionalMemory.evidenceToPreserve,
        executiveSummary: buildExecutiveSummary({
          report,
          trajectory,
          institutionalMemory,
        }),
        copyReadyReport: buildCopyReadyIntelligenceReport({
          report,
          trajectory,
          institutionalMemory,
        }),
        rawPayload: {
          report,
          trajectory,
          institutionalMemory,
          latestSnapshot,
          historyReview,
          savedFrom: '/executive-report',
        },
      })

      setSaveMessage('Executive continuity report saved.')
      await loadReports()
    } catch (error) {
      console.error(error)
      setSaveMessage('Executive continuity report could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <InfrastructureNav />

        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • EXECUTIVE REPORT</p>

          <h1 style={styles.title}>Executive Continuity Intelligence Report</h1>

          <p style={styles.subtitle}>
            Board-ready continuity intelligence package combining current
            posture, history direction, trajectory, institutional memory,
            survivability persistence, required action, required evidence, and
            audit-ready interpretation.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Report Classification</p>

            <h2 style={styles.heroTitle}>{report.classification}</h2>

            <p style={styles.heroMeaning}>
              {buildExecutiveSummary({
                report,
                trajectory,
                institutionalMemory,
              })}
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Current Posture</p>

            <p style={styles.statusValue}>
              {report.currentContinuityPosture}
            </p>
          </div>
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Trajectory"
            value={trajectory.trajectory}
            body={trajectory.trajectoryDirection}
          />

          <SignalCard
            title="Memory Posture"
            value={institutionalMemory.memoryPosture}
            body={institutionalMemory.memoryMeaning}
          />

          <SignalCard
            title="Memory Domain"
            value={institutionalMemory.dominantMemoryDomain}
            body="The strongest institutional memory domain influencing this report."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Executive Intelligence Reading</p>

          <h2 style={styles.cardTitle}>{trajectory.commanderQuestion}</h2>

          <p style={styles.bodyText}>{trajectory.executiveMeaning}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem title="Trajectory Risk" body={trajectory.trajectoryRisk} />

            <PriorityItem
              title="Memory Risk"
              body={institutionalMemory.memoryRisk}
            />

            <PriorityItem
              title="Continuity Learning"
              body={institutionalMemory.continuityLearning}
            />
          </div>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Persistence Action</p>

            <h2 style={styles.actionTitle}>
              Preserve this executive report as continuity memory.
            </h2>

            <p style={styles.actionText}>
              Saving the report creates an institutional record that can later
              support history review, board summaries, continuity audits,
              trajectory comparison, institutional memory, and stabilization
              evidence.
            </p>

            {saveMessage && <p style={styles.saveMessage}>{saveMessage}</p>}
          </div>

          <button
            type="button"
            onClick={handleSaveReport}
            disabled={saving}
            style={{
              ...styles.primaryButton,
              ...(saving ? styles.disabledButton : {}),
            }}
          >
            {saving ? 'Saving...' : 'Save Report'}
          </button>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Report Memory Retrieval</p>

            <h2 style={styles.actionTitle}>
              Retrieve persisted executive report history.
            </h2>

            <p style={styles.actionText}>
              This completes the report memory loop by allowing CGI to generate,
              save, retrieve, and display executive continuity records from
              Supabase.
            </p>

            {reportMessage && <p style={styles.saveMessage}>{reportMessage}</p>}
          </div>

          <button
            type="button"
            onClick={loadReports}
            disabled={loadingReports}
            style={{
              ...styles.secondaryButton,
              ...(loadingReports ? styles.disabledButton : {}),
            }}
          >
            {loadingReports ? 'Refreshing...' : 'Refresh Reports'}
          </button>
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="History Direction"
            value={report.historyDirection}
            body="Shows whether continuity posture is improving, holding, worsening, or still lacking sufficient history."
          />

          <SignalCard
            title="Continuity Drift"
            value={report.continuityDriftDetected ? 'YES' : 'NO'}
            body="Indicates whether continuity posture is degrading or exposure is persisting across snapshots."
          />

          <SignalCard
            title="Survivability Persistence"
            value={report.survivabilityConcernPersisting ? 'YES' : 'NO'}
            body="Indicates whether elevated or critical exposure is persisting across the executive continuity record."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Required Executive Action</p>

          <h2 style={styles.cardTitle}>
            {trajectory.trajectoryRecommendation}
          </h2>

          <p style={styles.bodyText}>
            CGI reporting is designed to preserve continuity meaning across
            time, not merely summarize operational activity.
          </p>

          <div style={styles.priorityGrid}>
            <PriorityItem
              title="Dominant Concern"
              body={report.dominantConcern}
            />

            <PriorityItem
              title="Required Evidence"
              body={institutionalMemory.evidenceToPreserve}
            />

            <PriorityItem title="Generated" body={report.generatedAt} />
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Trajectory Interpretation">
            <p style={styles.panelText}>{trajectory.trajectoryExplanation}</p>
            <p style={styles.panelText}>{trajectory.watchNext}</p>
          </Panel>

          <Panel title="Institutional Memory Requirement">
            <p style={styles.panelText}>
              {institutionalMemory.memoryPersistenceRequirement}
            </p>
          </Panel>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Original Report Package">
            <pre style={styles.compactPre}>{report.copyReadyReport}</pre>
          </Panel>

          <Panel title="Executive Intelligence Package">
            <pre style={styles.compactPre}>
              {buildCopyReadyIntelligenceReport({
                report,
                trajectory,
                institutionalMemory,
              })}
            </pre>
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Persisted Report Archive</p>

          <h2 style={styles.cardTitle}>
            Executive continuity reports retrieved from Supabase.
          </h2>

          <p style={styles.bodyText}>Report Count: {reports.length}</p>

          <div style={styles.archiveList}>
            {reports.length === 0 ? (
              <p style={styles.emptyText}>
                No persisted executive reports are currently available.
              </p>
            ) : (
              reports.map((item, index) => (
                <article
                  key={item.id ?? `${getReportValue(item, 'createdAt')}-${index}`}
                  style={styles.archiveItem}
                >
                  <div style={styles.archiveHeader}>
                    <div>
                      <p style={styles.panelKicker}>
                        {getReportValue(item, 'reportClassification') ??
                          'EXECUTIVE_REPORT'}
                      </p>

                      <h3 style={styles.archiveTitle}>
                        {getReportValue(item, 'reportTitle') ??
                          'Executive Continuity Report'}
                      </h3>
                    </div>

                    <p style={styles.archiveDate}>
                      {formatDate(getReportValue(item, 'createdAt'))}
                    </p>
                  </div>

                  <div style={styles.archiveGrid}>
                    <PriorityItem
                      title="Current Posture"
                      body={
                        getReportValue(item, 'currentContinuityPosture') ??
                        'Not recorded'
                      }
                    />

                    <PriorityItem
                      title="History Direction"
                      body={
                        getReportValue(item, 'historyDirection') ??
                        'Not recorded'
                      }
                    />

                    <PriorityItem
                      title="Required Action"
                      body={
                        getReportValue(item, 'requiredExecutiveAction') ??
                        'Not recorded'
                      }
                    />
                  </div>

                  <p style={styles.archiveSummary}>
                    {getReportValue(item, 'executiveSummary') ??
                      'No executive summary was recorded for this report.'}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

        <section style={styles.gridTwo}>
          {report.reportSections.map((section) => (
            <Panel key={section.label} title={section.label}>
              <pre style={styles.compactPre}>{section.content}</pre>
            </Panel>
          ))}
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Copy-Ready Report</p>

          <h2 style={styles.cardTitle}>
            Standardized executive continuity intelligence package.
          </h2>

          <pre style={styles.summaryBox}>
            {buildCopyReadyIntelligenceReport({
              report,
              trajectory,
              institutionalMemory,
            })}
          </pre>
        </section>
      </div>
    </main>
  )
}

function buildExecutiveSummary(input: {
  report: ReturnType<typeof buildCGIExecutiveReportPackage>
  trajectory: ReturnType<typeof buildCGIContinuityTrajectory>
  institutionalMemory: ReturnType<typeof buildCGIInstitutionalMemory>
}) {
  return [
    input.report.executiveSummary,
    `Trajectory is ${input.trajectory.trajectory}: ${input.trajectory.trajectoryDirection}`,
    `Institutional memory posture is ${input.institutionalMemory.memoryPosture} in the ${input.institutionalMemory.dominantMemoryDomain} domain.`,
    input.institutionalMemory.memoryMeaning,
  ].join(' ')
}

function buildCopyReadyIntelligenceReport(input: {
  report: ReturnType<typeof buildCGIExecutiveReportPackage>
  trajectory: ReturnType<typeof buildCGIContinuityTrajectory>
  institutionalMemory: ReturnType<typeof buildCGIInstitutionalMemory>
}) {
  return [
    'TSINAXA CGI Executive Continuity Intelligence Report',
    '',
    `Report Classification: ${input.report.classification}`,
    `Current Continuity Posture: ${input.report.currentContinuityPosture}`,
    `History Direction: ${input.report.historyDirection}`,
    `Continuity Drift Detected: ${
      input.report.continuityDriftDetected ? 'YES' : 'NO'
    }`,
    `Survivability Concern Persisting: ${
      input.report.survivabilityConcernPersisting ? 'YES' : 'NO'
    }`,
    '',
    `Trajectory: ${input.trajectory.trajectory}`,
    `Momentum: ${input.trajectory.momentum}`,
    `Direction: ${input.trajectory.trajectoryDirection}`,
    `Commander Question: ${input.trajectory.commanderQuestion}`,
    `Trajectory Risk: ${input.trajectory.trajectoryRisk}`,
    `Watch Next: ${input.trajectory.watchNext}`,
    '',
    `Institutional Memory Posture: ${input.institutionalMemory.memoryPosture}`,
    `Dominant Memory Domain: ${input.institutionalMemory.dominantMemoryDomain}`,
    `Executive Memory Question: ${input.institutionalMemory.executiveQuestion}`,
    `Continuity Learning: ${input.institutionalMemory.continuityLearning}`,
    `Memory Risk: ${input.institutionalMemory.memoryRisk}`,
    '',
    `Dominant Concern: ${input.report.dominantConcern}`,
    `Required Executive Action: ${input.trajectory.trajectoryRecommendation}`,
    `Required Evidence: ${input.institutionalMemory.evidenceToPreserve}`,
    '',
    `Executive Summary: ${buildExecutiveSummary(input)}`,
  ].join('\n')
}

function getReportValue(
  report: PersistedExecutiveReport,
  key: string
): string | null {
  const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

  const value =
    report[key] ??
    report[snakeKey] ??
    report.rawPayload?.report?.[key] ??
    report.raw_payload?.report?.[key] ??
    null

  if (value === null || value === undefined) {
    return null
  }

  return String(value)
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Date not recorded'
  }

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
    fontSize: 'clamp(32px, 5vw, 50px)',
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
    fontSize: '24px',
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
    overflowWrap: 'anywhere',
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
  panelText: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    margin: '0 0 12px',
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
