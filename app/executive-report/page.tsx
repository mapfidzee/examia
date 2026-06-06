'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIDemoScenario } from '@/lib/cgiDemoScenarioEngine'
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

  const featured = buildCGIDemoScenario('FUEL_LOGISTICS_CHAIN_PROOF')
  const pilotThread = featured.pilotThread

  const executiveReport = buildPilotExecutiveReport(featured)

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
            Board-ready continuity report for one governed instability moving
            from request to recovery, command visibility, executive
            interpretation, institutional memory, and audit reconstruction.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Report Subject</p>

            <h2 style={styles.heroTitle}>{pilotThread.scenarioName}</h2>

            <p style={styles.heroMeaning}>{executiveReport.executiveSummary}</p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Current Posture</p>
            <p style={styles.statusValue}>{executiveReport.currentPosture}</p>
          </div>
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Case ID"
            value={pilotThread.caseId}
            body="The governed continuity event used for this executive report."
          />

          <SignalCard
            title="Trajectory"
            value={executiveReport.trajectory}
            body="Continuity direction remains under executive interpretation."
          />

          <SignalCard
            title="Report Classification"
            value={executiveReport.classification}
            body="This report is designed for leadership interpretation and board-ready review."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Executive Decision</p>

          <h2 style={styles.cardTitle}>{executiveReport.executiveDecision}</h2>

          <p style={styles.bodyText}>{executiveReport.leadershipMeaning}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem
              title="Dominant Concern"
              body={executiveReport.dominantConcern}
            />

            <PriorityItem
              title="Required Executive Action"
              body={executiveReport.requiredExecutiveAction}
            />

            <PriorityItem
              title="Required Evidence"
              body={executiveReport.requiredEvidence}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Continuity Chain Reconstruction</p>

          <h2 style={styles.cardTitle}>
            The full chain remains visible inside the report.
          </h2>

          <div style={styles.chainList}>
            {pilotThread.chain.map((stage, index) => (
              <article
                key={`${stage.stage}-${stage.title}`}
                style={styles.chainItem}
              >
                <div>
                  <p style={styles.panelKicker}>
                    Step {index + 1} • {formatLabel(stage.stage)}
                  </p>

                  <h3 style={styles.chainTitle}>{stage.title}</h3>
                </div>

                <div style={styles.chainGrid}>
                  <MiniBlock
                    title="Continuity Question"
                    body={stage.continuityQuestion}
                  />

                  <MiniBlock
                    title="Executive Finding"
                    body={stage.executiveFinding}
                  />

                  <MiniBlock
                    title="Evidence Preserved"
                    body={stage.evidencePreserved}
                  />
                </div>
              </article>
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

          <Panel title="Institutional Memory">
            <p style={styles.panelText}>{pilotThread.executiveMemory}</p>
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Audit Reconstruction</p>

          <h2 style={styles.cardTitle}>
            The report preserves the audit trail leadership may need later.
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
            <p style={styles.sectionKicker}>Persistence Action</p>

            <h2 style={styles.actionTitle}>
              Preserve this executive report as continuity memory.
            </h2>

            <p style={styles.actionText}>
              Saving the report creates a reconstructable executive record for
              continuity history, institutional memory, board review, and audit
              verification.
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

        <section style={styles.gridTwo}>
          <Panel title="Copy-Ready Board Report">
            <pre style={styles.compactPre}>{executiveReport.copyReadyReport}</pre>
          </Panel>

          <Panel title="Executive Report Summary">
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

function buildPilotExecutiveReport(
  featured: ReturnType<typeof buildCGIDemoScenario>,
) {
  const pilotThread = featured.pilotThread

  const executiveSummary =
    'Repeated fuel logistics disruption was governed as a continuity event, not treated as isolated operational noise. CGI preserved the chain from first report through executive interpretation, institutional memory, and audit reconstruction.'

  const executiveDecision =
    'Leadership should treat the disruption as a cross-site continuity vulnerability until durability evidence confirms that supplier concentration risk no longer threatens operational reliability.'

  const leadershipMeaning =
    'Recovery occurred, but recovery alone is not closure. The report preserves why command visibility, coordination, cross-site interpretation, evidence, and institutional memory must remain attached before continuity trust is restored.'

  const dominantConcern =
    'Supplier concentration created cross-site continuity exposure while recovery remained uneven.'

  const requiredExecutiveAction =
    'Maintain executive visibility, confirm supplier resilience, preserve audit evidence, and require durability confirmation before reducing continuity posture.'

  const requiredEvidence =
    'Request record, triage decision, case history, routing owner, intervention actions, outcome verification, recovery evidence, command rationale, cross-site pattern, executive report, memory statement, and audit trace.'

  const copyReadySummary = [
    'TSINAXA CGI Executive Report Summary',
    '',
    `Case: ${pilotThread.scenarioName}`,
    `Case ID: ${pilotThread.caseId}`,
    `Current Posture: ${featured.derivation.executivePosture}`,
    '',
    `Executive Summary: ${executiveSummary}`,
    '',
    `Executive Decision: ${executiveDecision}`,
    '',
    `Leadership Meaning: ${leadershipMeaning}`,
  ].join('\n')

  const copyReadyReport = [
    'TSINAXA CGI Executive Continuity Intelligence Report',
    '',
    `Report Classification: PILOT_CHAIN_EXECUTIVE_REPORT`,
    `Case ID: ${pilotThread.caseId}`,
    `Report Subject: ${pilotThread.scenarioName}`,
    `Current Continuity Posture: ${featured.derivation.executivePosture}`,
    `Continuity Condition: ${featured.derivation.continuityCondition}`,
    `Recovery Credibility: ${featured.derivation.recoveryCredibility}`,
    `Recurrence Severity: ${featured.derivation.recurrenceSeverity}`,
    '',
    `Executive Thesis: ${pilotThread.executiveThesis}`,
    '',
    `Executive Summary: ${executiveSummary}`,
    '',
    `Executive Decision: ${executiveDecision}`,
    '',
    `Dominant Concern: ${dominantConcern}`,
    '',
    `Required Executive Action: ${requiredExecutiveAction}`,
    '',
    `Required Evidence: ${requiredEvidence}`,
    '',
    'Continuity Chain:',
    ...pilotThread.chain.map(
      (stage, index) =>
        `${index + 1}. ${formatLabel(stage.stage)} — ${stage.executiveFinding}`,
    ),
    '',
    `Institutional Memory: ${pilotThread.executiveMemory}`,
    '',
    'Audit Reconstruction:',
    ...pilotThread.auditReconstruction.map((item) => `- ${item}`),
  ].join('\n')

  return {
    classification: 'PILOT_CHAIN_EXECUTIVE_REPORT',
    title: 'Executive Continuity Intelligence Report',
    currentPosture: featured.derivation.executivePosture,
    trajectory: 'ELEVATED WATCH',
    executiveSummary,
    executiveDecision,
    leadershipMeaning,
    dominantConcern,
    requiredExecutiveAction,
    requiredEvidence,
    copyReadySummary,
    copyReadyReport,
  }
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

function MiniBlock({ title, body }: { title: string; body: string }) {
  return (
    <div style={styles.miniBlock}>
      <p style={styles.panelKicker}>{title}</p>
      <p style={styles.panelBody}>{body}</p>
    </div>
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
  chainList: {
    display: 'grid',
    gap: '14px',
    marginTop: '16px',
  },
  chainItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },
  chainTitle: {
    color: '#f8fafc',
    fontSize: '22px',
    lineHeight: 1.2,
    margin: '8px 0 14px',
  },
  chainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
  },
  miniBlock: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '14px',
    padding: '12px',
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