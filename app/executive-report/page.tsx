'use client'

import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
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
  const [loadingReports, setLoadingReports] = useState(false)
  const [reportMessage, setReportMessage] = useState('')
  const [reports, setReports] = useState<PersistedExecutiveReport[]>([])

  const featured = useMemo(
    () => buildCGIDemoScenario('FUEL_LOGISTICS_CHAIN_PROOF'),
    [],
  )

  const pilotThread = featured.pilotThread

  const executiveReport = useMemo(
    () => buildExecutiveConclusionReport(featured),
    [featured],
  )

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
    } catch (error) {
      console.error(error)
      setSaveMessage('Executive continuity conclusion could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  async function loadRecentReports() {
    try {
      setLoadingReports(true)
      setReportMessage('Loading recent executive conclusions...')

      const loadedReports = await loadCGIExecutiveReports()

      setReports(Array.isArray(loadedReports) ? loadedReports.slice(0, 3) : [])
      setReportMessage('Recent executive conclusions loaded.')
    } catch (error) {
      console.error(error)
      setReportMessage('Recent executive conclusions could not be loaded.')
    } finally {
      setLoadingReports(false)
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • EXECUTIVE REPORT</p>

          <h1 style={styles.title}>Institutional Continuity Conclusion</h1>

          <p style={styles.subtitle}>
            Board-ready conclusion layer converting the CGI continuity chain
            into a stability decision, CEO sentence, executive recommendation,
            memory transfer, and audit confidence.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Executive Conclusion</p>

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
            <p style={styles.sectionKicker}>Stability Decision</p>

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
              title="Board Eligibility"
              body={executiveReport.stabilityBoardEligibility}
            />
            <PriorityItem
              title="Audit Confidence"
              body={executiveReport.auditConfidence}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Required Executive Action</p>

          <h2 style={styles.cardTitle}>
            {executiveReport.executiveRecommendation}
          </h2>

          <p style={styles.bodyText}>{executiveReport.executiveSummary}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem
              title="Required Action"
              body={executiveReport.requiredExecutiveAction}
            />
            <PriorityItem
              title="Dominant Concern"
              body={executiveReport.dominantConcern}
            />
            <PriorityItem
              title="Required Evidence"
              body={executiveReport.requiredEvidence}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Memory Transfer</p>

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
          <p style={styles.sectionKicker}>Evidence Standard</p>

          <h2 style={styles.cardTitle}>
            The conclusion remains reconstructable without becoming an audit
            page.
          </h2>

          <div style={styles.priorityGrid}>
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
          </div>

          <div style={styles.chainCompact}>
            {pilotThread.chain.map((stage, index) => (
              <div key={`${stage.stage}-${stage.title}`} style={styles.chainPill}>
                <span style={styles.chainNumber}>{index + 1}</span>
                <span>{formatLabel(stage.stage)}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.copyCard}>
          <p style={styles.sectionKicker}>Copy-Ready Board Report</p>

          <h2 style={styles.cardTitle}>
            What must be communicated to leadership?
          </h2>

          <pre style={styles.compactPre}>{executiveReport.copyReadyReport}</pre>

          <div style={styles.buttonRow}>
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

            <button
              type="button"
              onClick={loadRecentReports}
              disabled={loadingReports}
              style={{
                ...styles.secondaryButton,
                ...(loadingReports ? styles.disabledButton : {}),
              }}
            >
              {loadingReports ? 'Loading...' : 'Load Recent Reports'}
            </button>
          </div>

          {(saveMessage || reportMessage) && (
            <p style={styles.saveMessage}>
              {[saveMessage, reportMessage].filter(Boolean).join(' ')}
            </p>
          )}
        </section>

        {reports.length > 0 && (
          <section style={styles.card}>
            <p style={styles.sectionKicker}>Recent Report Memory</p>

            <h2 style={styles.cardTitle}>
              Latest executive conclusions only.
            </h2>

            <div style={styles.archiveList}>
              {reports.map((item, index) => (
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
                      title="Posture"
                      body={
                        getReportValue(item, 'currentContinuityPosture') ??
                        'Not recorded'
                      }
                    />
                    <PriorityItem
                      title="Direction"
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
                </article>
              ))}
            </div>
          </section>
        )}

        <section style={styles.doctrineCard}>
          <strong>EXECUTIVE REPORT DOCTRINE</strong>

          <span>
            Executive Report concludes. It does not reopen operations, replace
            Command, become the Memory Board, or duplicate Audit. It preserves
            the stability decision, required communication, evidence standard,
            memory transfer, and reconstructable conclusion.
          </span>
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

function PriorityItem({ title, body }: { title: string; body: string }) {
  return (
    <article style={styles.priorityItem}>
      <p style={styles.panelKicker}>{title}</p>
      <p style={styles.priorityBody}>{body}</p>
    </article>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: '#fff8e7',
    overflowX: 'hidden',
  },
  container: {
    width: '100%',
    maxWidth: 1120,
    margin: '0 auto',
    padding: '0 20px 48px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: 20,
    paddingTop: 4,
  },
  kicker: {
    color: '#d6b25e',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 2,
    margin: 0,
  },
  title: {
    color: '#fff8e7',
    fontSize: 'clamp(34px, 5vw, 52px)',
    lineHeight: 1.05,
    margin: '10px 0',
  },
  subtitle: {
    color: '#cfc7b5',
    maxWidth: 860,
    lineHeight: 1.65,
    fontSize: 16,
    margin: 0,
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(260px, 0.65fr)',
    gap: 16,
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.1), rgba(255,255,255,0.02))',
    border: '1px solid rgba(214,178,94,0.28)',
    borderRadius: 26,
    padding: 24,
    marginBottom: 16,
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  sectionKicker: {
    color: '#d6b25e',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: 12,
  },
  heroTitle: {
    color: '#fff8e7',
    fontSize: 'clamp(32px, 5vw, 50px)',
    lineHeight: 1,
    margin: '10px 0 14px',
    letterSpacing: '-0.04em',
  },
  heroMeaning: {
    color: '#cfc7b5',
    lineHeight: 1.65,
    margin: 0,
    maxWidth: 760,
    fontSize: 16,
  },
  statusBox: {
    background: 'rgba(214,178,94,0.12)',
    border: '1px solid rgba(214,178,94,0.28)',
    borderRadius: 20,
    padding: 18,
    alignSelf: 'stretch',
  },
  statusLabel: {
    color: '#d6b25e',
    fontWeight: 900,
    margin: '0 0 10px',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  statusValue: {
    color: '#fff8e7',
    fontSize: 22,
    lineHeight: 1.25,
    margin: 0,
    fontWeight: 900,
  },
  decisionCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.1fr) minmax(300px, 0.9fr)',
    gap: 16,
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.1), rgba(255,255,255,0.02))',
    border: '1px solid rgba(214,178,94,0.34)',
    borderRadius: 26,
    padding: 24,
    marginBottom: 16,
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  decisionStack: {
    display: 'grid',
    gap: 12,
  },
  card: {
    background: '#090807',
    border: '1px solid rgba(214,178,94,0.18)',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0 20px 50px rgba(0,0,0,0.24)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  copyCard: {
    background: '#090807',
    border: '1px solid rgba(214,178,94,0.28)',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    boxShadow: '0 20px 50px rgba(0,0,0,0.24)',
  },
  cardTitle: {
    color: '#fff8e7',
    fontSize: 26,
    lineHeight: 1.15,
    margin: '10px 0',
  },
  bodyText: {
    color: '#cfc7b5',
    lineHeight: 1.7,
    margin: 0,
    maxWidth: 900,
  },
  priorityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
    marginTop: 16,
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
    marginTop: 16,
  },
  priorityItem: {
    background: '#11100d',
    border: '1px solid rgba(214,178,94,0.18)',
    borderRadius: 16,
    padding: 14,
  },
  panelKicker: {
    color: '#d6b25e',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  priorityBody: {
    color: '#fff8e7',
    lineHeight: 1.55,
    margin: '10px 0 0',
    fontWeight: 700,
    overflowWrap: 'anywhere',
  },
  chainCompact: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  chainPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#11100d',
    border: '1px solid rgba(214,178,94,0.18)',
    borderRadius: 999,
    color: '#fff8e7',
    fontSize: 13,
    fontWeight: 800,
    padding: '8px 12px',
  },
  chainNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: 999,
    background: 'rgba(214,178,94,0.16)',
    color: '#d6b25e',
    fontSize: 12,
    fontWeight: 900,
  },
  compactPre: {
    whiteSpace: 'pre-wrap',
    background: '#050505',
    border: '1px solid rgba(214,178,94,0.18)',
    borderRadius: 14,
    padding: 14,
    color: '#fff8e7',
    lineHeight: 1.5,
    fontSize: 13,
    overflowX: 'auto',
    maxHeight: 520,
    margin: '16px 0 0',
  },
  buttonRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 16,
  },
  primaryButton: {
    border: 'none',
    borderRadius: 14,
    background: '#c9a227',
    color: '#050505',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 900,
    minHeight: 48,
    padding: '0 18px',
    whiteSpace: 'nowrap',
  },
  secondaryButton: {
    border: '1px solid rgba(214,178,94,0.34)',
    borderRadius: 14,
    background: 'rgba(214,178,94,0.1)',
    color: '#fff8e7',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 900,
    minHeight: 48,
    padding: '0 18px',
    whiteSpace: 'nowrap',
  },
  disabledButton: {
    cursor: 'not-allowed',
    opacity: 0.65,
  },
  saveMessage: {
    color: '#d6b25e',
    fontWeight: 900,
    margin: '12px 0 0',
  },
  archiveList: {
    display: 'grid',
    gap: 12,
    marginTop: 16,
  },
  archiveItem: {
    background: '#11100d',
    border: '1px solid rgba(214,178,94,0.18)',
    borderRadius: 18,
    padding: 16,
  },
  archiveHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  archiveTitle: {
    color: '#fff8e7',
    fontSize: 18,
    lineHeight: 1.2,
    margin: '8px 0 0',
  },
  archiveDate: {
    color: '#d6b25e',
    fontWeight: 800,
    fontSize: 13,
    lineHeight: 1.4,
    margin: 0,
    textAlign: 'right',
    minWidth: 160,
  },
  archiveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
  },
  doctrineCard: {
    display: 'grid',
    gap: 10,
    background: '#050505',
    border: '1px solid rgba(214,178,94,0.28)',
    borderRadius: 18,
    padding: 18,
    color: '#fff8e7',
    lineHeight: 1.65,
  },
}