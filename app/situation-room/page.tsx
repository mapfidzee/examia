'use client'

import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIExecutiveBriefing } from '@/lib/cgiExecutiveBriefingGenerator'
import { buildCGIContinuitySnapshot } from '@/lib/cgiContinuitySnapshotEngine'
import { reviewCGIExecutiveHistory } from '@/lib/cgiExecutiveHistoryEngine'
import { buildCGIExecutiveReportPackage } from '@/lib/cgiExecutiveReportingEngine'
import { saveCGISituationReview } from '@/lib/cgiPersistenceEngine'
import {
  formatCGIExecutivePosture,
  formatCGIEvidenceLanguage,
  formatCGISurvivabilityLanguage,
  formatCGIGovernanceSafeLanguage,
} from '@/lib/cgiExecutivePostureFormatter'

export default function SituationRoomPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
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

  const executivePosture = formatCGIExecutivePosture(
    briefing.synthesis.synthesisPosture
  )

  const evidenceLanguage = formatCGIEvidenceLanguage(
    false,
    briefing.synthesis.synthesisPosture
  )

  const survivabilityLanguage = formatCGISurvivabilityLanguage(
    briefing.synthesis.synthesisPosture
  )

  const governanceLanguage = formatCGIGovernanceSafeLanguage()

  async function handleSaveSituationReview() {
    try {
      setSaving(true)
      setSaveMessage('Saving executive situation review...')

      await saveCGISituationReview({
        situationTitle: 'Executive Continuity Situation Room',
        situationPosture: briefing.synthesis.synthesisPosture,
        commandQuestion: briefing.coreQuestion,
        executiveSummary: briefing.executiveSummary,
        dominantConcern: briefing.dominantConcern,
        historyDirection: historyReview.direction,
        continuityDriftDetected: historyReview.continuityDriftDetected,
        reportClassification: report.classification,
        requiredExecutiveAction: report.requiredExecutiveAction,
        requiredEvidence: report.requiredEvidence,
        copyReadySituationReport: report.copyReadyReport,
        rawPayload: {
          briefing,
          latestSnapshot,
          historyReview,
          report,
          savedFrom: '/situation-room',
        },
      })

      setSaveMessage('Executive situation review saved.')
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

          <h1 style={styles.title}>
            Executive Continuity Situation Room
          </h1>

          <p style={styles.subtitle}>
            Highest-level executive continuity theater for command posture,
            cross-site coordination, continuity history, survivability
            protection, reporting, and governance-safe stabilization oversight.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Situation Reading</p>

            <h2 style={styles.heroTitle}>{executivePosture.label}</h2>

            <p style={styles.heroMeaning}>
              {briefing.executiveSummary}
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Command Question</p>

            <p style={styles.statusQuestion}>
              {briefing.coreQuestion}
            </p>
          </div>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Persistence Action</p>

            <h2 style={styles.actionTitle}>
              Preserve this situation review as executive continuity memory.
            </h2>

            <p style={styles.actionText}>
              Saving the situation review creates a durable institutional
              record of the executive operating picture, command question,
              continuity drift, required evidence, and survivability posture.
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

        <section style={styles.gridFour}>
          <SignalCard
            title="Continuity Posture"
            value={briefing.synthesis.synthesisPosture}
            body="Unified executive continuity posture across pressure, trajectory, prediction, recovery, and reliability."
          />

          <SignalCard
            title="History Direction"
            value={historyReview.direction}
            body="Shows whether continuity is improving, holding, worsening, or not yet historically mature."
          />

          <SignalCard
            title="Continuity Drift"
            value={historyReview.continuityDriftDetected ? 'YES' : 'NO'}
            body="Indicates whether continuity degradation or exposure persistence requires leadership review."
          />

          <SignalCard
            title="Report Class"
            value={report.classification}
            body="Current executive report package classification generated by CGI."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Executive Action</p>

          <h2 style={styles.cardTitle}>{executivePosture.headline}</h2>

          <p style={styles.bodyText}>
            {executivePosture.actionLanguage}
          </p>

          <div style={styles.priorityGrid}>
            <PriorityItem title="Evidence" body={evidenceLanguage} />
            <PriorityItem title="Survivability" body={survivabilityLanguage} />
            <PriorityItem title="Governance Meaning" body={governanceLanguage} />
          </div>
        </section>

        <section style={styles.gridThree}>
          <Panel title="Command Center">
            Leadership should coordinate stabilization, require evidence,
            and keep continuity protection visible until credibility improves.
          </Panel>

          <Panel title="Coordination Center">
            Sites with elevated exposure should remain synchronized through
            ownership, action, evidence, and executive review.
          </Panel>

          <Panel title="Continuity History">
            Continuity snapshots indicate whether instability is improving,
            holding, or drifting across time.
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Situation Priorities</p>

          <h2 style={styles.cardTitle}>
            The situation room compresses CGI into one executive operating
            picture.
          </h2>

          <div style={styles.situationList}>
            <SituationItem
              title="Dominant Concern"
              body={briefing.dominantConcern}
            />

            <SituationItem
              title="Required Action"
              body={report.requiredExecutiveAction}
            />

            <SituationItem
              title="Required Evidence"
              body={report.requiredEvidence}
            />

            <SituationItem
              title="History Meaning"
              body={historyReview.executiveMeaning}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>
            Copy-Ready Situation Report
          </p>

          <h2 style={styles.cardTitle}>
            Executive continuity situation package.
          </h2>

          <pre style={styles.summaryBox}>{report.copyReadyReport}</pre>
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
    gridTemplateColumns:
      'minmax(0, 1.35fr) minmax(260px, 0.65fr)',
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
}