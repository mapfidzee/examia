'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
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

type CommandReading = {
  posture: string
  statusShort: string
  activeCaseCount: string
  evidenceShort: string
  survivabilityShort: string
  headline: string
  attributionTitle: string
  attributionMeaning: string
  currentReading: string
  executiveMeaning: string
  evidenceGap: string
  recoveryCredibility: string
  evidenceRequirement: string
  survivability: string
  memory: string
  persistence: string
  risk: string
  copyReadyBrief: string
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
            <section style={styles.header}>
              <div>
                <p style={styles.kicker}>TSINAXA CGI • COMMAND</p>

                <h1 style={styles.title}>Command Center</h1>

                <p style={styles.subtitle}>
                  Executive visibility for command-attributed instability,
                  recurrence, evidence pressure, survivability exposure, and
                  recovery credibility.
                </p>
              </div>

              <div style={styles.headerSignal}>
                <p style={styles.headerSignalLabel}>Current Posture</p>
                <p style={styles.headerSignalValue}>{command.statusShort}</p>
              </div>
            </section>

            <section style={styles.statusStrip}>
              <ExecutiveStatus
                label="Status"
                value={command.statusShort}
                body={command.headline}
              />

              <ExecutiveStatus
                label="Active Cases"
                value={loading ? '...' : command.activeCaseCount}
                body={command.attributionTitle}
              />

              <ExecutiveStatus
                label="Evidence"
                value={command.evidenceShort}
                body={command.evidenceRequirement}
              />

              <ExecutiveStatus
                label="Survivability"
                value={command.survivabilityShort}
                body={command.survivability}
              />
            </section>

            <section style={styles.primaryCard}>
              <div style={styles.sectionHeaderRow}>
                <div>
                  <p style={styles.sectionKicker}>Command Attribution</p>

                  <h2 style={styles.cardTitle}>
                    {loading
                      ? 'Loading command evidence...'
                      : command.attributionTitle}
                  </h2>
                </div>

                <p style={styles.statusPill}>{command.posture}</p>
              </div>

              <p style={styles.bodyText}>{command.attributionMeaning}</p>

              <div style={styles.caseList}>
                {!loading &&
                  cases.map((item) => (
                    <article key={item.id} style={styles.caseCard}>
                      <p style={styles.caseIdentity}>
                        {item.beneficiary_name}
                      </p>

                      <div style={styles.caseMetaGrid}>
                        <SmallMetric label="Pressure" value={item.support_domain} />
                        <SmallMetric label="Status" value={item.case_status} />
                        <SmallMetric label="Severity" value={item.severity_level} />
                        <SmallMetric
                          label="Area"
                          value={item.region || 'Not recorded'}
                        />
                      </div>
                    </article>
                  ))}

                {!loading && cases.length === 0 && (
                  <div style={styles.emptyState}>
                    No active governed instability is currently visible to
                    Command. Preserve a triage command escalation or create a
                    new visible instability signal to activate command
                    attribution.
                  </div>
                )}
              </div>
            </section>

            <section style={styles.interpretationCard}>
              <div>
                <p style={styles.sectionKicker}>Command Interpretation</p>

                <h2 style={styles.cardTitle}>{command.currentReading}</h2>

                <p style={styles.bodyText}>{command.executiveMeaning}</p>
              </div>

              <div style={styles.memoryGrid}>
                <SmallMetric label="Memory" value={command.memory} />
                <SmallMetric label="Persistence" value={command.persistence} />
                <SmallMetric label="Risk" value={command.risk} />
              </div>
            </section>

            <section style={styles.twoColumnGrid}>
              <ExecutivePanel title="Evidence Gap" body={command.evidenceGap} />

              <ExecutivePanel
                title="Recovery Credibility"
                body={command.recoveryCredibility}
              />
            </section>

            <section style={styles.primaryCard}>
              <p style={styles.sectionKicker}>Command-Ready Brief</p>

              <h2 style={styles.cardTitle}>
                One command reading for pressure, memory, evidence, and
                recovery follow-through.
              </h2>

              <pre style={styles.summaryBox}>{command.copyReadyBrief}</pre>
            </section>

            <section style={styles.doctrineCard}>
              <p style={styles.sectionKicker}>Doctrine Lock</p>

              <p style={styles.doctrineText}>
                CGI governs continuity credibility. Visible recovery is not
                durable stabilization. Command must remain traceable to active
                lifecycle evidence.
              </p>
            </section>
          </div>
        </main>
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function buildCommandReading(cases: CommandCase[]): CommandReading {
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
      statusShort: 'CLEAR',
      activeCaseCount: '0',
      evidenceShort: 'NONE',
      survivabilityShort: 'CLEAR',
      headline: 'Command is clear.',
      attributionTitle: 'No active command-attributed cases',
      attributionMeaning:
        'Command is not reading any active lifecycle cases. Prior test data is no longer driving the command interface.',
      currentReading:
        'No active command-visible instability is currently present.',
      executiveMeaning:
        'Command can remain calm. There is no current lifecycle evidence requiring executive intervention.',
      evidenceGap:
        'No active evidence gap is visible because no command-visible lifecycle case is active.',
      recoveryCredibility:
        'No active recovery credibility concern is currently visible to Command.',
      evidenceRequirement: 'No active command evidence required.',
      survivability:
        'Survivability is not currently under active command pressure.',
      memory: 'NO_ACTIVE_MEMORY_SIGNAL',
      persistence: 'NONE_VISIBLE',
      risk: 'CLEAR',
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
      statusShort: 'ELEVATED',
      activeCaseCount: String(total),
      evidenceShort: 'REQUIRED',
      survivabilityShort: 'WATCH',
      headline: 'Continuity requires executive review.',
      attributionTitle: `${total} active command-attributed record(s)`,
      attributionMeaning:
        'This command reading is generated from active lifecycle records, not hardcoded threat language.',
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
      evidenceRequirement:
        'Executive ownership, recurrence review, mitigation evidence, and continuity protection evidence are required.',
      survivability:
        'Survivability remains under observation until pressure and durability are understood.',
      memory:
        recurrenceVisible > 0 ? 'RECURRENCE_MEMORY_VISIBLE' : 'MEMORY_VISIBLE',
      persistence: recurrenceVisible > 0 ? 'PERSISTENT' : 'EMERGING',
      risk: 'WATCHED',
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
    statusShort: 'WATCH',
    activeCaseCount: String(total),
    evidenceShort: 'MONITOR',
    survivabilityShort: 'STABLE',
    headline: 'Continuity remains visible but proportionate.',
    attributionTitle: `${total} active command-attributed record(s)`,
    attributionMeaning:
      'Command is reading currently active lifecycle records and preserving proportional executive visibility.',
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
    evidenceRequirement:
      'Evidence should continue to show ownership, action movement, outcome credibility, and recovery readiness.',
    survivability:
      'Survivability remains protected through ordinary governed lifecycle monitoring.',
    memory: 'MEMORY_VISIBLE',
    persistence: 'EMERGING',
    risk: 'MONITORED',
    copyReadyBrief: [
      'CGI Command Memory Reading',
      '',
      `${total} active command-visible record(s) are present.`,
      'Command pressure remains proportionate.',
      'Continue monitoring ownership, action evidence, outcome credibility, and recovery durability.',
    ].join('\n'),
  }
}

function ExecutiveStatus({
  label,
  value,
  body,
}: {
  label: string
  value: string
  body: string
}) {
  return (
    <article style={styles.statusCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.statusValue}>{value}</p>
      <p style={styles.statusBody}>{body}</p>
    </article>
  )
}

function SmallMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <article style={styles.smallMetric}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
    </article>
  )
}

function ExecutivePanel({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <article style={styles.panelCard}>
      <p style={styles.sectionKicker}>CGI Command</p>
      <h3 style={styles.panelTitle}>{title}</h3>
      <p style={styles.panelBody}>{body}</p>
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
    maxWidth: '1040px',
    margin: '0 auto',
    padding: '10px 24px 72px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '28px',
    alignItems: 'flex-start',
    marginBottom: '34px',
  },
  kicker: {
    color: '#67e8f9',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '2px',
    margin: 0,
  },
  title: {
    fontSize: 'clamp(38px, 5vw, 56px)',
    lineHeight: 1,
    margin: '12px 0',
    letterSpacing: '-0.055em',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '760px',
    lineHeight: 1.75,
    fontSize: '15px',
    margin: 0,
  },
  headerSignal: {
    minWidth: '180px',
    background: '#080d16',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '16px',
  },
  headerSignalLabel: {
    color: '#94a3b8',
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  headerSignalValue: {
    color: '#f8fafc',
    fontSize: '22px',
    fontWeight: 950,
    margin: '8px 0 0',
  },
  statusStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '30px',
  },
  statusCard: {
    background: '#080d16',
    border: '1px solid #1e293b',
    borderRadius: '22px',
    padding: '20px',
    minHeight: '148px',
    boxSizing: 'border-box',
  },
  statusValue: {
    color: '#f8fafc',
    fontSize: '26px',
    lineHeight: 1.05,
    margin: '10px 0',
    fontWeight: 950,
    letterSpacing: '-0.04em',
  },
  statusBody: {
    color: '#cbd5e1',
    fontSize: '13px',
    lineHeight: 1.6,
    margin: 0,
  },
  primaryCard: {
    background: '#050914',
    border: '1px solid #1e293b',
    borderRadius: '26px',
    padding: '28px',
    marginBottom: '30px',
    boxShadow: '0 18px 44px rgba(0,0,0,0.22)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  interpretationCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.18fr) minmax(260px, 0.82fr)',
    gap: '28px',
    background: '#050914',
    border: '1px solid #1e293b',
    borderRadius: '26px',
    padding: '28px',
    marginBottom: '30px',
    boxShadow: '0 18px 44px rgba(0,0,0,0.22)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  doctrineCard: {
    background: '#050914',
    border: '1px solid #1e293b',
    borderRadius: '22px',
    padding: '20px 24px',
    marginBottom: '30px',
    boxSizing: 'border-box',
  },
  doctrineText: {
    color: '#e2e8f0',
    fontSize: '16px',
    lineHeight: 1.7,
    margin: '10px 0 0',
    fontWeight: 750,
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '24px',
    alignItems: 'flex-start',
    marginBottom: '14px',
  },
  statusPill: {
    color: '#a5f3fc',
    background: '#042636',
    border: '1px solid #155e75',
    borderRadius: '999px',
    padding: '8px 12px',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: 0,
    whiteSpace: 'nowrap',
  },
  sectionKicker: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '11px',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 'clamp(24px, 3vw, 34px)',
    lineHeight: 1.15,
    margin: '12px 0',
    letterSpacing: '-0.04em',
  },
  bodyText: {
    color: '#cbd5e1',
    lineHeight: 1.8,
    margin: 0,
    maxWidth: '820px',
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '14px',
  },
  smallMetric: {
    background: '#0f172a',
    border: '1px solid #263244',
    borderRadius: '16px',
    padding: '14px',
  },
  metricLabel: {
    color: '#93c5fd',
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  metricValue: {
    color: '#f8fafc',
    fontSize: '18px',
    lineHeight: 1.2,
    fontWeight: 900,
    margin: '8px 0 0',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '22px',
    marginBottom: '30px',
  },
  panelCard: {
    background: '#0f172a',
    border: '1px solid #263244',
    borderRadius: '20px',
    padding: '22px',
    minHeight: '150px',
  },
  panelTitle: {
    color: '#f8fafc',
    fontSize: '24px',
    lineHeight: 1.15,
    margin: '10px 0',
  },
  panelBody: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    margin: 0,
  },
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#0f172a',
    border: '1px solid #263244',
    borderRadius: '18px',
    padding: '20px',
    color: '#e2e8f0',
    lineHeight: 1.65,
    minHeight: '150px',
    fontSize: '14px',
    overflowX: 'auto',
    marginTop: '16px',
  },
  caseList: {
    display: 'grid',
    gap: '16px',
    marginTop: '22px',
  },
  caseCard: {
    background: '#0f172a',
    border: '1px solid #263244',
    borderRadius: '18px',
    padding: '18px',
  },
  caseIdentity: {
    color: '#f8fafc',
    fontWeight: 900,
    margin: '0 0 14px',
    lineHeight: 1.35,
  },
  caseMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
  },
  emptyState: {
    background: '#0f172a',
    border: '1px dashed #475569',
    borderRadius: '20px',
    padding: '24px',
    color: '#cbd5e1',
    lineHeight: 1.75,
  },
}