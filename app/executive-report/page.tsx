'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIDemoScenario } from '@/lib/cgiDemoScenarioEngine'
import { buildExecutiveConclusionReport } from '@/lib/cgiExecutiveReportDoctrineEngine'
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

  const featured = useMemo(
    () => buildCGIDemoScenario('FUEL_LOGISTICS_CHAIN_PROOF'),
    [],
  )

  const pilotThread = featured.pilotThread

  const executiveReport = useMemo(
    () => buildExecutiveConclusionReport(featured),
    [featured],
  )

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
      setSaveMessage('Saving executive continuity conclusion...')

      await saveCGIExecutiveReport({
        reportClassification: executiveReport.classification,
        reportTitle: executiveReport.title,
        currentContinuityPosture: executiveReport.currentPosture,
        historyDirection: executiveReport.trajectory,
        continuityDriftDetected: true,
        survivabilityConcernPersisting: true,
        dominantConcern: executiveReport.dominantConcern,
        requiredExecutiveAction: executiveReport.requiredExecutiveAction,
        requiredEvidence: executiveReport.requiredEvidence,
        executiveSummary: executiveReport.executiveSummary,
        copyReadyReport: executiveReport.copyReadyReport,
        rawPayload: {
          featured,
          pilotThread,
          executiveReport,
          continuityStandard: executiveReport.continuityStandard,
          stabilityDecision: executiveReport.stabilityDecision,
          stabilityBoardEligibility:
            executiveReport.stabilityBoardEligibility,
          memoryTransfer: executiveReport.memoryTransfer,
          savedFrom: '/executive-report',
        },
      })

      setSaveMessage('Executive continuity conclusion saved.')
      await loadReports()
    } catch (error) {
      console.error(error)
      setSaveMessage('Executive continuity conclusion could not be saved.')
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

          <h1 style={styles.title}>Institutional Continuity Conclusion</h1>

          <p style={styles.subtitle}>
            Board-ready conclusion layer converting the full CGI continuity
            chain into a stability decision, CEO sentence, executive
            recommendation, memory transfer package, and audit confidence.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Enterprise Continuity Conclusion</p>

            <h2 style={styles.heroTitle}>
              {executiveReport.stabilityDecision}
            </h2>

            <p style={styles.heroMeaning}>
              {executiveReport.enterpriseConclusion}
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>CEO Sentence</p>
            <p style={styles.statusValue}>{executiveReport.ceoSentence}</p>
          </div>
        </section>

        <section style={styles.decisionCard}>
          <div>
            <p style={styles.sectionKicker}>Institutional Stability Decision</p>

            <h2 style={styles.cardTitle}>
              {executiveReport.institutionalStabilityDecision}
            </h2>

            <p style={styles.bodyText}>{executiveReport.boardBrief}</p>
          </div>

          <div style={styles.decisionStack}>
            <PriorityItem
              title="Trust Reading"
              body={executiveReport.trustReading}
            />
            <PriorityItem title="Trust Level" body={executiveReport.trustLevel} />
            <PriorityItem
              title="Stability Board Eligibility"
              body={executiveReport.stabilityBoardEligibility}
            />
            <PriorityItem
              title="Audit Confidence"
              body={executiveReport.auditConfidence}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Continuity Derivation Standard</p>

          <h2 style={styles.cardTitle}>
            The report conclusion now derives from one CGI doctrine layer.
          </h2>

          <div style={styles.memoryGrid}>
            <PriorityItem
              title="What Is Visible"
              body={executiveReport.continuityStandard.whatIsVisible}
            />
            <PriorityItem
              title="Why It Matters"
              body={executiveReport.continuityStandard.whyItMatters}
            />
            <PriorityItem
              title="Continuity Risk"
              body={executiveReport.continuityStandard.continuityRisk}
            />
            <PriorityItem
              title="Required Movement"
              body={executiveReport.continuityStandard.requiredMovement}
            />
            <PriorityItem
              title="Trust Level"
              body={executiveReport.continuityStandard.trustLevel}
            />
            <PriorityItem
              title="Institutional Meaning"
              body={executiveReport.continuityStandard.institutionalMeaning}
            />
          </div>
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Case ID"
            value={executiveReport.caseId}
            body="The governed continuity event used for this conclusion."
          />

          <SignalCard
            title="Trajectory"
            value={executiveReport.trajectory}
            body="Continuity direction remains under executive interpretation."
          />

          <SignalCard
            title="Report Classification"
            value={executiveReport.classification}
            body="This report is designed as an institutional conclusion, not a dashboard summary."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Executive Recommendation</p>

          <h2 style={styles.cardTitle}>
            {executiveReport.executiveRecommendation}
          </h2>

          <p style={styles.bodyText}>{executiveReport.executiveSummary}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem
              title="Primary Vulnerability"
              body={executiveReport.primaryVulnerability}
            />

            <PriorityItem
              title="Secondary Vulnerability"
              body={executiveReport.secondaryVulnerability}
            />

            <PriorityItem
              title="Dominant Concern"
              body={executiveReport.dominantConcern}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Stability Board Readiness</p>

          <h2 style={styles.cardTitle}>
            Can this instability move toward institutional stability absorption?
          </h2>

          <div style={styles.gridThree}>
            <PriorityItem
              title="Eligibility"
              body={executiveReport.stabilityBoardEligibility}
            />

            <PriorityItem
              title="Decision"
              body={executiveReport.stabilityDecision}
            />

            <PriorityItem
              title="Required Action"
              body={executiveReport.requiredExecutiveAction}
            />
          </div>

          <p style={styles.bodyText}>
            Stability Board movement is not a visual downgrade. It is a governed
            absorption decision. CGI should only allow movement when durability,
            evidence, recurrence memory, and audit reconstructability remain
            attached.
          </p>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Memory Transfer Package</p>

          <h2 style={styles.cardTitle}>
            What must survive after the executive report?
          </h2>

          <div style={styles.memoryGrid}>
            <PriorityItem
              title="Structural Lesson"
              body={executiveReport.memoryTransfer.structuralLesson}
            />

            <PriorityItem
              title="Recurrence Risk"
              body={executiveReport.memoryTransfer.recurrenceRisk}
            />

            <PriorityItem
              title="Durability Status"
              body={executiveReport.memoryTransfer.durabilityStatus}
            />

            <PriorityItem
              title="Evidence Status"
              body={executiveReport.memoryTransfer.evidenceStatus}
            />

            <PriorityItem
              title="Institutional Learning"
              body={executiveReport.memoryTransfer.institutionalLearning}
            />

            <PriorityItem title="Memory Destination" body="CGI Memory Board" />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Continuity Chain Evidence</p>

          <h2 style={styles.cardTitle}>
            The conclusion remains reconstructable without turning the report
            into another audit page.
          </h2>

          <div style={styles.chainCompact}>
            {pilotThread.chain.map((stage, index) => (
              <div key={`${stage.stage}-${stage.title}`} style={styles.chainPill}>
                <span style={styles.chainNumber}>{index + 1}</span>
                <span>{formatLabel(stage.stage)}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Cross-Site Meaning">
            <p style={styles.panelText}>
              The disruption did not remain isolated. North Operations, South
              Operations, and East Operations exposed a shared logistics
              dependency pattern requiring executive continuity interpretation.
            </p>

            <div style={styles.siteGrid}>
              {pilotThread.sites.map((site) => (
                <PriorityItem
                  key={site.siteName}
                  title={`${site.siteName} • ${site.posture}`}
                  body={site.finding}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Audit Meaning">
            <p style={styles.panelText}>{executiveReport.auditMeaning}</p>
          </Panel>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Persistence Action</p>

            <h2 style={styles.actionTitle}>
              Preserve this executive conclusion as continuity memory.
            </h2>

            <p style={styles.actionText}>
              Saving this conclusion creates a reconstructable executive record
              for continuity history, institutional memory, board review, and
              audit verification.
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
            {saving ? 'Saving...' : 'Save Conclusion'}
          </button>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Report Memory Retrieval</p>

            <h2 style={styles.actionTitle}>
              Retrieve persisted executive report history.
            </h2>

            <p style={styles.actionText}>
              CGI can retrieve prior executive conclusions to support continuity
              memory, board review, institutional learning, and audit
              reconstruction.
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

        <section style={styles.gridTwo}>
          <Panel title="Copy-Ready Board Conclusion">
            <pre style={styles.compactPre}>{executiveReport.copyReadyReport}</pre>
          </Panel>

          <Panel title="Executive Summary">
            <pre style={styles.compactPre}>{executiveReport.copyReadySummary}</pre>
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
      </div>
    </main>
  )
}

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ')
}

function getReportValue(
  report: PersistedExecutiveReport,
  key: string,
): string | null {
  const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

  const value =
    report[key] ??
    report[snakeKey] ??
    report.rawPayload?.report?.[key] ??
    report.raw_payload?.report?.[key] ??
    report.rawPayload?.executiveReport?.[key] ??
    report.raw_payload?.executiveReport?.[key] ??
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
    maxWidth: '860px',
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
  decisionCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.1fr) minmax(300px, 0.9fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #facc15',
    borderRadius: '26px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  decisionStack: {
    display: 'grid',
    gap: '12px',
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
    fontSize: '22px',
    lineHeight: 1.25,
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
    overflowWrap: 'anywhere',
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  chainCompact: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '16px',
  },
  chainPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '999px',
    color: '#e2e8f0',
    fontSize: '13px',
    fontWeight: 800,
    padding: '8px 12px',
  },
  chainNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '999px',
    background: '#083344',
    color: '#67e8f9',
    fontSize: '12px',
    fontWeight: 900,
  },
  panel: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '220px',
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
  siteGrid: {
    display: 'grid',
    gap: '12px',
    marginTop: '16px',
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