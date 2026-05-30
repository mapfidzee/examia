'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type CommandCase = {
  id: string
  beneficiary_name: string
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  beneficiary_level: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  intervention_summary: string | null
  outcome_summary: string | null
  created_at?: string | null
}

const COMMAND_VISIBLE_STATUSES = [
  'TRIAGE_COMMAND_ESCALATION',
  'ACCEPTED_FOR_GOVERNANCE',
  'STABILIZATION_OWNER_ROUTED',
  'STABILIZATION_OWNER_ROUTED_RECURRENCE',
  'GOVERNANCE_REVIEW_REQUIRED',
  'GOVERNANCE_REVIEW_REQUIRED_RECURRENCE',
  'EVIDENCE_REQUIRED_BEFORE_ROUTING',
  'OWNERSHIP_CLARITY_REQUIRED',
  'ROUTING_STALLED',
  'ACTION_ACTIVE',
  'INTERVENTION_ACTIVE',
  'INTERVENTION_RECORDED',
  'PARTIAL_STABILIZATION',
  'FOLLOW_UP_REQUIRED',
  'IMPROVING',
  'RECOVERY_MONITORING',
  'ESCALATED',
  'REOPENED',
]

const PRESSURE_TYPES = [
  'FLOW',
  'COVERAGE',
  'COORDINATION',
  'OWNERSHIP',
  'EVIDENCE',
  'RECOVERY',
  'RELIABILITY',
]

export default function CommandPage() {
  const [cases, setCases] = useState<CommandCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCommandCases()
  }, [])

  async function loadCommandCases() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .in('support_domain', PRESSURE_TYPES)
      .in('case_status', COMMAND_VISIBLE_STATUSES)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setCases([])
      setLoading(false)
      return
    }

    setCases(data || [])
    setLoading(false)
  }

  const command = useMemo(() => buildCommandReading(cases), [cases])

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

              <h2 style={styles.commandPostureTitle}>{command.posture}</h2>

              <p style={styles.commandHeadline}>{command.headline}</p>

              <p style={styles.bodyText}>{command.description}</p>

              <div style={styles.commandGrid}>
                <CommandSignal title="Command Action" body={command.action} />

                <CommandSignal
                  title="Evidence Requirement"
                  body={command.evidenceRequirement}
                />

                <CommandSignal
                  title="Survivability Protection"
                  body={command.survivability}
                />

                <CommandSignal
                  title="Governance-Safe Meaning"
                  body="This interpretation does not judge individuals or assign blame. It reads continuity pressure, recurrence, evidence, recovery, and survivability as institutional conditions."
                />
              </div>
            </section>

            <section style={styles.memoryCommandCard}>
              <div>
                <p style={styles.sectionKicker}>Command Memory Reading</p>

                <h2 style={styles.cardTitle}>
                  Command decisions must be traceable to active lifecycle
                  evidence.
                </h2>

                <p style={styles.bodyText}>
                  Command must not manufacture executive threat when no active
                  governed instability exists. It should read only visible
                  lifecycle records and show attribution when pressure is active.
                </p>
              </div>

              <div style={styles.memoryGrid}>
                <MemoryMetric label="Memory Posture" value={command.memory} />
                <MemoryMetric label="Persistence" value={command.persistence} />
                <MemoryMetric label="Command Risk" value={command.risk} />
              </div>
            </section>

            <section style={styles.grid}>
              <CommandPrinciple
                title="What Is Happening?"
                body={command.currentReading}
              />

              <CommandPrinciple
                title="Why It Matters"
                body={command.executiveMeaning}
              />

              <CommandPrinciple
                title="Evidence Gap"
                body={command.evidenceGap}
              />

              <CommandPrinciple
                title="Recovery Credibility"
                body={command.recoveryCredibility}
              />
            </section>

            <section style={styles.card}>
              <p style={styles.sectionKicker}>Command Case Attribution</p>

              <h2 style={styles.cardTitle}>
                {loading
                  ? 'Loading active command evidence...'
                  : command.attributionTitle}
              </h2>

              <p style={styles.bodyText}>{command.attributionMeaning}</p>

              <div style={styles.caseList}>
                {!loading &&
                  cases.map((item) => (
                    <article key={item.id} style={styles.caseCard}>
                      <p style={styles.caseIdentity}>
                        {item.beneficiary_name}
                      </p>

                      <div style={styles.caseMetaGrid}>
                        <MemoryMetric
                          label="Pressure"
                          value={item.support_domain}
                        />
                        <MemoryMetric
                          label="Status"
                          value={item.case_status}
                        />
                        <MemoryMetric
                          label="Severity"
                          value={item.severity_level}
                        />
                        <MemoryMetric
                          label="Area"
                          value={item.region || 'Not recorded'}
                        />
                      </div>
                    </article>
                  ))}

                {!loading && cases.length === 0 && (
                  <div style={styles.emptyState}>
                    No active governed instability is currently visible to
                    Command. Create a new request or preserve a triage command
                    escalation to activate command attribution.
                  </div>
                )}
              </div>
            </section>

            <section style={styles.card}>
              <p style={styles.sectionKicker}>Command Doctrine</p>

              <h2 style={styles.cardTitle}>
                CGI does not govern events. It governs continuity credibility.
              </h2>

              <p style={styles.bodyText}>
                The command center must help leadership understand whether
                visible instability is being contained, whether recovery is
                holding, and whether the institution can still stabilize itself
                reliably under pressure. When no active lifecycle evidence
                exists, Command must remain calm and empty rather than
                preserving old test interpretations.
              </p>
            </section>

            <section style={styles.card}>
              <p style={styles.sectionKicker}>Command-Ready Memory Brief</p>

              <h2 style={styles.cardTitle}>
                One command reading for pressure, memory, evidence, and
                recovery follow-through.
              </h2>

              <pre style={styles.summaryBox}>{command.copyReadyBrief}</pre>
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

function buildCommandReading(cases: CommandCase[]) {
  const total = cases.length
  const commandEscalations = cases.filter(
    (item) =>
      item.case_status === 'TRIAGE_COMMAND_ESCALATION' ||
      item.case_status.includes('ESCALATED') ||
      item.safeguarding_flag,
  ).length

  const highSeverity = cases.filter(
    (item) =>
      item.severity_level === 'HIGH' || item.severity_level === 'CRITICAL',
  ).length

  const recurrenceVisible = cases.filter(
    (item) =>
      item.case_status.includes('RECURRENCE') ||
      item.case_status === 'REOPENED' ||
      item.beneficiary_name.includes('ISSUE_REPEATED') ||
      item.outcome_summary?.includes('RECURRENCE') ||
      item.intervention_summary?.includes('RECURRENCE'),
  ).length

  const recoveryMonitoring = cases.filter(
    (item) => item.case_status === 'RECOVERY_MONITORING',
  ).length

  if (total === 0) {
    return {
      posture: 'NO ACTIVE COMMAND PRESSURE',
      headline: 'Command is clear.',
      description:
        'No active governed instability is currently visible. Command should not display inherited threat language when lifecycle records are empty.',
      action:
        'No executive action required until new visible instability enters command scope.',
      evidenceRequirement:
        'No active command evidence required. Evidence requirements will activate when a governed signal becomes command-visible.',
      survivability:
        'Survivability is not currently under active command pressure from visible CGI records.',
      memory: 'NO_ACTIVE_MEMORY_SIGNAL',
      persistence: 'NONE_VISIBLE',
      risk: 'CLEAR',
      currentReading:
        'No active command-visible instability is currently present.',
      executiveMeaning:
        'Command can remain calm. There is no current lifecycle evidence requiring executive intervention.',
      evidenceGap:
        'No active evidence gap is visible because no command-visible lifecycle case is active.',
      recoveryCredibility:
        'No active recovery credibility concern is currently visible to Command.',
      attributionTitle: 'No active command-attributed cases',
      attributionMeaning:
        'Command is not reading any active lifecycle cases. This confirms prior test data is no longer driving the command interface.',
      copyReadyBrief: [
        'CGI Command Memory Reading',
        '',
        'No active command pressure is visible.',
        'No governed instability is currently attributed to Command.',
        'No executive intervention is required from current lifecycle records.',
        'Command will activate when new command-visible instability enters the lifecycle.',
      ].join('\n'),
    }
  }

  if (commandEscalations > 0 || recurrenceVisible > 0 || highSeverity > 1) {
    return {
      posture: 'ELEVATED CONTINUITY EXPOSURE',
      headline: 'Continuity requires executive review.',
      description:
        'One or more active lifecycle records show command escalation, recurrence visibility, high-pressure instability, or survivability exposure.',
      action:
        'Maintain executive review, confirm ownership, and require evidence-based stabilization follow-through.',
      evidenceRequirement:
        'Executive ownership, active mitigation, recurrence review, and continuity protection evidence are required.',
      survivability:
        'Survivability remains under observation until recurrence, pressure, and recovery durability are understood.',
      memory: recurrenceVisible > 0 ? 'RECURRENCE_MEMORY_VISIBLE' : 'MEMORY_VISIBLE',
      persistence: recurrenceVisible > 0 ? 'PERSISTENT' : 'EMERGING',
      risk: 'WATCHED',
      currentReading:
        'Active command-visible instability is present and should be interpreted with lifecycle memory.',
      executiveMeaning:
        'Command should not allow repeated or escalated instability to move silently through ordinary handling.',
      evidenceGap:
        'Evidence must show ownership, action, outcome credibility, and recovery durability before command concern can relax.',
      recoveryCredibility:
        recoveryMonitoring > 0
          ? 'Some records are in recovery monitoring, but durability must still be confirmed.'
          : 'Recovery credibility is not yet established for all command-visible instability.',
      attributionTitle: `${total} active command-attributed record(s)`,
      attributionMeaning:
        'The command reading below is being generated from active lifecycle records, not hardcoded threat language.',
      copyReadyBrief: [
        'CGI Command Memory Reading',
        '',
        `${total} active command-visible record(s) are present.`,
        `Command escalation count: ${commandEscalations}.`,
        `Recurrence visibility count: ${recurrenceVisible}.`,
        `High-pressure count: ${highSeverity}.`,
        'Command action should focus on evidence, ownership, recurrence, survivability, and follow-through.',
      ].join('\n'),
    }
  }

  return {
    posture: 'ACTIVE COMMAND WATCH',
    headline: 'Continuity remains visible but proportionate.',
    description:
      'Active governed instability exists, but current command exposure is not showing concentrated escalation or recurrence pressure.',
    action:
      'Maintain proportional command visibility and verify lifecycle movement continues.',
    evidenceRequirement:
      'Evidence should continue to show ownership, action movement, outcome credibility, and recovery readiness.',
    survivability:
      'Survivability remains protected through ordinary governed lifecycle monitoring.',
    memory: 'MEMORY_VISIBLE',
    persistence: 'EMERGING',
    risk: 'MONITORED',
    currentReading:
      'Active governed instability is visible under command watch.',
    executiveMeaning:
      'Command should monitor lifecycle movement without over-escalating stable governed cases.',
    evidenceGap:
      'Evidence remains important, but no concentrated command evidence gap is currently visible.',
    recoveryCredibility:
      recoveryMonitoring > 0
        ? 'Recovery monitoring is active for some records.'
        : 'Recovery credibility will mature only after outcome verification and durability observation.',
    attributionTitle: `${total} active command-attributed record(s)`,
    attributionMeaning:
      'Command is reading currently active lifecycle records and preserving proportional executive visibility.',
    copyReadyBrief: [
      'CGI Command Memory Reading',
      '',
      `${total} active command-visible record(s) are present.`,
      'Command pressure remains proportionate.',
      'Continue monitoring ownership, action evidence, outcome credibility, and recovery durability.',
    ].join('\n'),
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
  caseList: {
    display: 'grid',
    gap: '14px',
    marginTop: '18px',
  },
  caseCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },
  caseIdentity: {
    color: '#f8fafc',
    fontWeight: 900,
    margin: '0 0 12px',
    lineHeight: 1.35,
  },
  caseMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '10px',
  },
  emptyState: {
    background: '#0f172a',
    border: '1px dashed #475569',
    borderRadius: '18px',
    padding: '22px',
    color: '#cbd5e1',
    lineHeight: 1.7,
  },
}