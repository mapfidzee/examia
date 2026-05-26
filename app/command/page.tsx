'use client'

import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import CGICommandContinuityPanel from '@/components/cgi-command/CGICommandContinuityPanel'
import { buildCGIExecutiveMemoryBoard } from '@/lib/cgiExecutiveMemoryBoardEngine'
import {
  formatCGIExecutivePosture,
  formatCGIEvidenceLanguage,
  formatCGISurvivabilityLanguage,
  formatCGIGovernanceSafeLanguage,
} from '@/lib/cgiExecutivePostureFormatter'

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

export default function CommandPage() {
  const commandPosture = formatCGIExecutivePosture('ELEVATED')
  const evidenceLanguage = formatCGIEvidenceLanguage(false, 'ELEVATED')
  const survivabilityLanguage = formatCGISurvivabilityLanguage('ELEVATED')
  const governanceSafeLanguage = formatCGIGovernanceSafeLanguage()
  const memoryBoard = buildMemoryBoardView()

  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
    >
      <CGIGovernanceShell>
        <main style={styles.page}>
          <div style={styles.container}>
            <InfrastructureNav />

            <section style={styles.header}>
              <p style={styles.kicker}>TSINAXA CGI • COMMAND</p>

              <h1 style={styles.title}>Continuity Command Center</h1>

              <p style={styles.subtitle}>
                Command visibility for continuity condition, recovery
                credibility, evidence gaps, memory persistence, escalation
                discipline, and stabilization follow-through.
              </p>
            </section>

            <section style={styles.commandPostureCard}>
              <p style={styles.sectionKicker}>Command Posture</p>

              <h2 style={styles.commandPostureTitle}>
                {commandPosture.label}
              </h2>

              <p style={styles.commandHeadline}>
                {commandPosture.headline}
              </p>

              <p style={styles.bodyText}>{commandPosture.description}</p>

              <div style={styles.commandGrid}>
                <CommandSignal
                  title="Command Action"
                  body={commandPosture.actionLanguage}
                />

                <CommandSignal
                  title="Evidence Requirement"
                  body={evidenceLanguage}
                />

                <CommandSignal
                  title="Survivability Protection"
                  body={survivabilityLanguage}
                />

                <CommandSignal
                  title="Governance-Safe Meaning"
                  body={governanceSafeLanguage}
                />
              </div>
            </section>

            <section style={styles.memoryCommandCard}>
              <div>
                <p style={styles.sectionKicker}>Command Memory Reading</p>

                <h2 style={styles.cardTitle}>
                  Command decisions now carry continuity memory.
                </h2>

                <p style={styles.bodyText}>
                  The command center should not treat pressure as a single
                  event. It must read recurrence, persistence, evidence gaps,
                  and recovery credibility before closing command attention.
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
                  label="Command Risk"
                  value={memoryBoard.executiveRisk}
                />
              </div>
            </section>

            <section style={styles.grid}>
              <CommandPrinciple
                title="What Is Happening?"
                body={memoryBoard.currentReading}
              />

              <CommandPrinciple
                title="Why It Matters"
                body={memoryBoard.executiveMeaning}
              />

              <CommandPrinciple
                title="Evidence Gap"
                body={memoryBoard.evidenceGap}
              />

              <CommandPrinciple
                title="Recovery Credibility"
                body={memoryBoard.recoveryCredibility}
              />
            </section>

            <CGICommandContinuityPanel />

            <section style={styles.card}>
              <p style={styles.sectionKicker}>Command Doctrine</p>

              <h2 style={styles.cardTitle}>
                CGI does not govern events. It governs continuity credibility.
              </h2>

              <p style={styles.bodyText}>
                The command center must help leadership understand whether
                visible instability is being contained, whether recovery is
                holding, and whether the institution can still stabilize itself
                reliably under pressure.
              </p>
            </section>

            <section style={styles.card}>
              <p style={styles.sectionKicker}>Command-Ready Memory Brief</p>

              <h2 style={styles.cardTitle}>
                One command reading for pressure, memory, evidence, and
                recovery follow-through.
              </h2>

              <pre style={styles.summaryBox}>
                {memoryBoard.copyReadyExecutiveMemoryBrief}
              </pre>
            </section>

            <section style={styles.grid}>
              <CommandPrinciple
                title="Dominant Truth"
                body="Executives need compressed operational truth before they review detail."
              />

              <CommandPrinciple
                title="Recovery Discipline"
                body="Visible recovery must not be treated as durable stabilization until evidence proves it held."
              />

              <CommandPrinciple
                title="Structural Memory"
                body="Repeated instability must be remembered structurally, not dismissed as isolated noise."
              />

              <CommandPrinciple
                title="Accountability"
                body="Continuity risk must become owned, evidenced, and time-bound responsibility."
              />
            </section>
          </div>
        </main>
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
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
        'Current pressure remains visible and must be interpreted with prior continuity memory.',
      executiveMeaning:
        board.executiveMeaning ??
        'Command should not close attention until recurrence, ownership, evidence, and recovery durability are reviewed.',
      evidenceGap:
        board.evidenceGap ??
        'Evidence is needed to confirm whether stabilization is durable, traceable, and not dependent on temporary relief.',
      recoveryCredibility:
        board.recoveryCredibility ??
        'Recovery remains under command watch until pressure reduction is sustained across time.',
      copyReadyExecutiveMemoryBrief:
        board.copyReadyExecutiveMemoryBrief ??
        [
          'CGI Command Memory Reading',
          '',
          'Current pressure remains visible.',
          'Continuity memory must remain active.',
          'Recovery should not be treated as complete until evidence confirms durable stabilization.',
          'Command action should focus on evidence, ownership, recurrence, survivability, and follow-through.',
        ].join('\n'),
    }
  } catch {
    return {
      boardPosture: 'MEMORY VISIBLE',
      persistenceMaturity: 'EMERGING',
      executiveRisk: 'WATCHED',
      currentReading:
        'Current pressure remains visible and requires command-level memory review.',
      executiveMeaning:
        'Command should determine whether this condition is isolated, recurring, or becoming structurally persistent.',
      evidenceGap:
        'Evidence is needed to confirm whether recovery is durable, traceable, and survivable.',
      recoveryCredibility:
        'Recovery remains under watch until stabilization can be proven across time.',
      copyReadyExecutiveMemoryBrief: [
        'CGI Command Memory Reading',
        '',
        'CGI now preserves continuity memory across time.',
        'The command center should treat unresolved pressure, evidence gaps, and recovery fragility as active command concerns.',
        'Action should remain focused on credible stabilization, survivability, and governance-safe follow-through.',
      ].join('\n'),
    }
  }
}

function CommandSignal({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <article style={styles.commandSignal}>
      <p style={styles.principleKicker}>{title}</p>

      <p style={styles.commandSignalBody}>{body}</p>
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

function CommandPrinciple({
  title,
  body,
}: {
  title: string
  body: ReactNode
}) {
  return (
    <article style={styles.principleCard}>
      <p style={styles.principleKicker}>CGI Command</p>

      <h3 style={styles.principleTitle}>{title}</h3>

      <p style={styles.principleBody}>{body}</p>
    </article>
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
    fontSize: 'clamp(32px, 5vw, 48px)',
    lineHeight: 1.05,
    margin: '10px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '780px',
    lineHeight: 1.65,
    fontSize: '16px',
    margin: 0,
  },
  commandPostureCard: {
    background: '#082f49',
    border: '1px solid #67e8f9',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  commandPostureTitle: {
    color: '#a5f3fc',
    fontSize: 'clamp(30px, 5vw, 46px)',
    lineHeight: 1.05,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  commandHeadline: {
    color: '#f8fafc',
    fontSize: '22px',
    lineHeight: 1.45,
    margin: '0 0 12px',
    fontWeight: 900,
  },
  commandGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
  },
  commandSignal: {
    background: '#020617',
    border: '1px solid #164e63',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '130px',
  },
  commandSignalBody: {
    color: '#e0f2fe',
    lineHeight: 1.55,
    margin: '10px 0 0',
    fontWeight: 800,
  },
  memoryCommandCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, 0.85fr)',
    gap: '16px',
    background: '#02111f',
    border: '1px solid #2563eb',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.24)',
    boxSizing: 'border-box',
    overflow: 'hidden',
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
  sectionKicker: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '12px',
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
    maxWidth: '860px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  principleCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
    minHeight: '160px',
  },
  principleKicker: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  principleTitle: {
    color: '#f8fafc',
    fontSize: '22px',
    lineHeight: 1.15,
    margin: '10px 0',
  },
  principleBody: {
    color: '#cbd5e1',
    lineHeight: 1.6,
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
    minHeight: '220px',
    fontSize: '14px',
    overflowX: 'auto',
  },
}