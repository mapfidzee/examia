import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIExecutiveBriefing } from '@/lib/cgiExecutiveBriefingGenerator'
import { buildCGIExecutiveMemoryBoard } from '@/lib/cgiExecutiveMemoryBoardEngine'
import {
  formatCGIExecutivePosture,
  formatCGIEvidenceLanguage,
  formatCGISurvivabilityLanguage,
  formatCGIGovernanceSafeLanguage,
} from '@/lib/cgiExecutivePostureFormatter'
import { getCGIPreferredTerm } from '@/lib/cgiExecutiveSemanticRegistry'

type MemoryBoardView = {
  boardPosture: string
  persistenceMaturity: string
  executiveRisk: string
  currentReading: string
  executiveMeaning: string
  evidenceGap: string
  recoveryCredibility: string
  copyReadyExecutiveMemoryBrief: string
}

export default function ExecutiveCenterPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
    >
      <CGIGovernanceShell>
        <ExecutiveCenterContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function ExecutiveCenterContent() {
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

  const memoryBoard = buildMemoryBoardView()

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

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <InfrastructureNav />

        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • EXECUTIVE CENTER</p>

          <h1 style={styles.title}>Executive Continuity Center</h1>

          <p style={styles.subtitle}>
            A unified leadership surface for current pressure, continuity
            memory, recovery credibility, evidence gaps, and required executive
            action.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Current Continuity Reading</p>

            <h2 style={styles.heroTitle}>{executivePosture.label}</h2>

            <p style={styles.heroMeaning}>{briefing.executiveSummary}</p>
          </div>

          <div style={styles.commandBox}>
            <p style={styles.commandLabel}>Executive Question</p>

            <p style={styles.commandText}>{briefing.coreQuestion}</p>
          </div>
        </section>

        <section style={styles.memoryCard}>
          <div>
            <p style={styles.sectionKicker}>Continuity Memory Board</p>

            <h2 style={styles.cardTitle}>
              Memory is now part of the executive reading.
            </h2>

            <p style={styles.bodyText}>
              CGI now carries prior pressure, unresolved evidence, recovery
              fragility, and recurring instability into the leadership view.
            </p>
          </div>

          <div style={styles.memoryGrid}>
            <MemoryMetric
              label="Memory Posture"
              value={memoryBoard.boardPosture}
            />

            <MemoryMetric
              label="Persistence"
              value={memoryBoard.persistenceMaturity}
            />

            <MemoryMetric
              label="Executive Risk"
              value={memoryBoard.executiveRisk}
            />
          </div>
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Pressure"
            value={getCGIPreferredTerm('PRESSURE')}
            body="Visible strain requires leadership attention before disruption becomes normalized."
          />

          <SignalCard
            title="Early Warning"
            value={getCGIPreferredTerm('PREDICTIVE')}
            body="The system is reading whether current signals may become continuity failure."
          />

          <SignalCard
            title="Trajectory"
            value={getCGIPreferredTerm('TRAJECTORY')}
            body="Direction matters more than a single snapshot. CGI reads whether conditions are improving, holding, or worsening."
          />
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Recovery"
            value={getCGIPreferredTerm('RECOVERY')}
            body="Recovery must prove durability before confidence is restored."
          />

          <SignalCard
            title="Trustworthiness"
            value={getCGIPreferredTerm('RELIABILITY')}
            body="Stabilization cannot be treated as dependable until evidence supports it."
          />

          <SignalCard
            title="Survivability"
            value={getCGIPreferredTerm('SURVIVABILITY')}
            body={survivabilityLanguage}
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Executive Action Posture</p>

          <h2 style={styles.cardTitle}>{executivePosture.headline}</h2>

          <p style={styles.bodyText}>{executivePosture.actionLanguage}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem
              title="Dominant Concern"
              body={briefing.dominantConcern}
            />

            <PriorityItem
              title="Evidence Missing"
              body={evidenceLanguage}
            />

            <PriorityItem
              title="Governance Meaning"
              body={governanceLanguage}
            />
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="What Is Happening?">
            {memoryBoard.currentReading}
          </Panel>

          <Panel title="Why It Matters">
            {memoryBoard.executiveMeaning}
          </Panel>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="What Evidence Is Missing?">
            {memoryBoard.evidenceGap}
          </Panel>

          <Panel title="Is Recovery Credible?">
            {memoryBoard.recoveryCredibility}
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Memory-Aware Executive Brief</p>

          <h2 style={styles.cardTitle}>
            One leadership reading across pressure, recovery, evidence, and
            continuity memory.
          </h2>

          <pre style={styles.summaryBox}>
            {memoryBoard.copyReadyExecutiveMemoryBrief}
          </pre>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Current Executive Continuity Brief</p>

          <h2 style={styles.cardTitle}>
            Snapshot interpretation remains available for immediate review.
          </h2>

          <pre style={styles.summaryBox}>{briefing.copyReadyBrief}</pre>
        </section>
      </div>
    </main>
  )
}

function buildMemoryBoardView(): MemoryBoardView {
  try {
    const engineInput =
      [] as Parameters<typeof buildCGIExecutiveMemoryBoard>[0]

    const board = buildCGIExecutiveMemoryBoard(
      engineInput
    ) as unknown as Partial<MemoryBoardView>

    return {
      boardPosture: board.boardPosture ?? 'MEMORY VISIBLE',
      persistenceMaturity: board.persistenceMaturity ?? 'EMERGING',
      executiveRisk: board.executiveRisk ?? 'WATCHED',
      currentReading:
        board.currentReading ??
        'Current pressure remains visible and must be interpreted together with prior continuity memory.',
      executiveMeaning:
        board.executiveMeaning ??
        'Leadership should not treat the current snapshot as isolated until recurrence, evidence, and recovery durability are reviewed.',
      evidenceGap:
        board.evidenceGap ??
        'Evidence is still needed to confirm whether stabilization is durable, traceable, and not dependent on temporary relief.',
      recoveryCredibility:
        board.recoveryCredibility ??
        'Recovery is not yet fully credible until pressure reduction is sustained across time.',
      copyReadyExecutiveMemoryBrief:
        board.copyReadyExecutiveMemoryBrief ??
        [
          'CGI Executive Memory Reading',
          '',
          'Current pressure remains visible.',
          'Continuity memory must remain active.',
          'Recovery should not be treated as fully credible until evidence confirms durable stabilization.',
          'Executive action should focus on evidence, recurrence, survivability, and follow-through.',
        ].join('\n'),
    }
  } catch {
    return {
      boardPosture: 'MEMORY VISIBLE',
      persistenceMaturity: 'EMERGING',
      executiveRisk: 'WATCHED',
      currentReading:
        'Current pressure remains visible and requires memory-aware leadership review.',
      executiveMeaning:
        'Leadership should review whether the current condition is isolated, recurring, or becoming structurally persistent.',
      evidenceGap:
        'Evidence is needed to confirm whether recovery is durable, traceable, and survivable.',
      recoveryCredibility:
        'Recovery remains under watch until stabilization can be proven across time.',
      copyReadyExecutiveMemoryBrief: [
        'CGI Executive Memory Reading',
        '',
        'CGI now preserves continuity memory across time.',
        'The executive center should treat unresolved pressure, evidence gaps, and recovery fragility as part of the current leadership reading.',
        'Action should remain focused on credible stabilization, survivability, and governance-safe follow-through.',
      ].join('\n'),
    }
  }
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

function MemoryMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <article style={styles.memoryMetric}>
      <p style={styles.metricLabel}>{label}</p>

      <p style={styles.metricValue}>{value}</p>
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
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(260px, 0.65fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #67e8f9',
    borderRadius: '26px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  memoryCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)',
    gap: '16px',
    background: '#02111f',
    border: '1px solid #2563eb',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.24)',
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
  commandBox: {
    background: '#083344',
    border: '1px solid #22d3ee',
    borderRadius: '20px',
    padding: '18px',
    alignSelf: 'stretch',
  },
  commandLabel: {
    color: '#67e8f9',
    fontWeight: 900,
    margin: '0 0 10px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  commandText: {
    color: '#cffafe',
    fontSize: '24px',
    lineHeight: 1.25,
    margin: 0,
    fontWeight: 900,
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '10px',
  },
  memoryMetric: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '14px',
  },
  metricLabel: {
    color: '#93c5fd',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: '20px',
    lineHeight: 1.2,
    fontWeight: 900,
    margin: '8px 0 0',
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
    minHeight: '160px',
    boxSizing: 'border-box',
  },
  signalValue: {
    color: '#f8fafc',
    fontSize: '22px',
    lineHeight: 1.15,
    margin: '10px 0',
    textTransform: 'capitalize',
  },
  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
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
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '16px',
    color: '#e2e8f0',
    lineHeight: 1.55,
    minHeight: '220px',
    fontSize: '14px',
    overflowX: 'auto',
  },
}