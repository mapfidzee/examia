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
  copyReadyBrief: string[]
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
                <h1 style={styles.title}>Command</h1>
                <p style={styles.subtitle}>
                  Executive reading of attributed instability, recurrence,
                  evidence pressure, survivability exposure, and recovery
                  credibility.
                </p>
              </div>

              <div style={styles.headerSignal}>
                <p style={styles.headerSignalLabel}>Posture</p>
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
                label="Cases"
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

            <section style={styles.executiveBand}>
              <div>
                <p style={styles.sectionKicker}>Executive Reading</p>
                <h2 style={styles.bandTitle}>{command.posture}</h2>
              </div>
              <p style={styles.bandText}>{command.currentReading}</p>
            </section>

            <section style={styles.primaryGrid}>
              <section style={styles.primaryCard}>
                <div style={styles.sectionHeaderRow}>
                  <div>
                    <p style={styles.sectionKicker}>Attribution</p>
                    <h2 style={styles.cardTitle}>
                      {loading
                        ? 'Loading command evidence...'
                        : command.attributionTitle}
                    </h2>
                  </div>
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
                      Command.
                    </div>
                  )}
                </div>
              </section>

              <section style={styles.primaryCard}>
                <p style={styles.sectionKicker}>Interpretation</p>
                <h2 style={styles.cardTitle}>{command.executiveMeaning}</h2>

                <div style={styles.compactMetrics}>
                  <SmallMetric label="Memory" value={command.memory} />
                  <SmallMetric label="Persistence" value={command.persistence} />
                  <SmallMetric label="Risk" value={command.risk} />
                </div>
              </section>
            </section>

            <section style={styles.twoColumnGrid}>
              <ExecutivePanel title="Evidence" body={command.evidenceGap} />
              <ExecutivePanel
                title="Recovery"
                body={command.recoveryCredibility}
              />
            </section>

            <section style={styles.briefCard}>
              <div>
                <p style={styles.sectionKicker}>Executive Brief</p>
                <h2 style={styles.briefTitle}>Command-ready summary</h2>
              </div>

              <ul style={styles.briefList}>
                {command.copyReadyBrief.map((line) => (
                  <li key={line} style={styles.briefItem}>
                    {line}
                  </li>
                ))}
              </ul>
            </section>

            <section style={styles.doctrineCard}>
              <p style={styles.doctrineText}>
                CGI governs continuity credibility. Visible recovery is not
                durable stabilization. Command remains traceable to active
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
      attributionTitle: 'No active attributed cases',
      attributionMeaning:
        'Command is not reading active lifecycle cases. Prior test data is no longer driving this surface.',
      currentReading:
        'No command-visible instability is currently present.',
      executiveMeaning:
        'No executive intervention is required from current lifecycle evidence.',
      evidenceGap:
        'No active evidence gap is visible because no command-visible lifecycle case is active.',
      recoveryCredibility:
        'No active recovery credibility concern is currently visible to Command.',
      evidenceRequirement: 'No active command evidence required.',
      survivability:
        'No active survivability pressure is visible.',
      memory: 'NONE',
      persistence: 'NONE',
      risk: 'CLEAR',
      copyReadyBrief: [
        'No active command pressure is visible.',
        'No governed instability is currently attributed to Command.',
        'No executive intervention is required.',
        'Command will activate when command-visible instability enters the lifecycle.',
      ],
    }
  }

  if (commandEscalations > 0 || recurrenceVisible > 0 || highSeverity > 1) {
    return {
      posture: 'ELEVATED CONTINUITY EXPOSURE',
      statusShort: 'ELEVATED',
      activeCaseCount: String(total),
      evidenceShort: 'REQUIRED',
      survivabilityShort: 'WATCH',
      headline: 'Executive review required.',
      attributionTitle: `${total} active attributed record(s)`,
      attributionMeaning:
        'This command reading is generated from active lifecycle records, not hardcoded threat language.',
      currentReading:
        'Command-visible instability requires executive attention.',
      executiveMeaning:
        'Repeated or escalated instability must not move silently through ordinary handling.',
      evidenceGap:
        'Evidence must show ownership, action, outcome credibility, and recovery durability before command concern relaxes.',
      recoveryCredibility:
        recoveryMonitoring > 0
          ? 'Recovery monitoring is visible, but durability is not yet confirmed.'
          : 'Recovery credibility is not yet established for all command-visible instability.',
      evidenceRequirement:
        'Ownership, recurrence review, mitigation evidence, and continuity protection evidence are required.',
      survivability:
        'Survivability remains under observation until pressure and durability are understood.',
      memory:
        recurrenceVisible > 0 ? 'RECURRENCE_VISIBLE' : 'VISIBLE',
      persistence: recurrenceVisible > 0 ? 'PERSISTENT' : 'EMERGING',
      risk: 'WATCHED',
      copyReadyBrief: [
        `${total} active command-visible record(s) are present.`,
        `Escalation count: ${commandEscalations}.`,
        `Recurrence count: ${recurrenceVisible}.`,
        `High-pressure count: ${highSeverity}.`,
        'Command action should focus on evidence, ownership, recurrence, survivability, and follow-through.',
      ],
    }
  }

  return {
    posture: 'ACTIVE COMMAND WATCH',
    statusShort: 'WATCH',
    activeCaseCount: String(total),
    evidenceShort: 'MONITOR',
    survivabilityShort: 'STABLE',
    headline: 'Continuity remains proportionate.',
    attributionTitle: `${total} active attributed record(s)`,
    attributionMeaning:
      'Command is reading active lifecycle records and preserving proportional executive visibility.',
    currentReading:
      'Active governed instability is visible under command watch.',
    executiveMeaning:
      'Monitor lifecycle movement without over-escalating stable governed cases.',
    evidenceGap:
      'Evidence remains important, but no concentrated command evidence gap is currently visible.',
    recoveryCredibility:
      recoveryMonitoring > 0
        ? 'Recovery monitoring is active for some records.'
        : 'Recovery credibility matures after outcome verification and durability observation.',
    evidenceRequirement:
      'Evidence should continue to show ownership, action movement, outcome credibility, and recovery readiness.',
    survivability:
      'Survivability remains protected through ordinary governed lifecycle monitoring.',
    memory: 'VISIBLE',
    persistence: 'EMERGING',
    risk: 'MONITORED',
    copyReadyBrief: [
      `${total} active command-visible record(s) are present.`,
      'Command pressure remains proportionate.',
      'Continue monitoring ownership, action evidence, outcome credibility, and recovery durability.',
    ],
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

const gold = '#d6b25e'
const mutedGold = '#9f8142'
const deepBlack = '#030303'
const panelBlack = '#0a0a0a'
const cardBlack = '#101010'
const softLine = 'rgba(214,178,94,0.22)'

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: '#f5f0e6',
    overflowX: 'hidden',
    background:
      'radial-gradient(circle at top right, rgba(214,178,94,0.08), transparent 34%), #030303',
  },
  container: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '8px 24px 64px',
    boxSizing: 'border-box',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '24px',
    alignItems: 'flex-start',
    marginBottom: '18px',
  },
  kicker: {
    color: gold,
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '2px',
    margin: 0,
  },
  title: {
    color: '#fff8e7',
    fontSize: 'clamp(30px, 4vw, 44px)',
    lineHeight: 1,
    margin: '8px 0',
    letterSpacing: '-0.05em',
  },
  subtitle: {
    color: '#cfc7b5',
    maxWidth: '720px',
    lineHeight: 1.55,
    fontSize: '14px',
    margin: 0,
  },
  headerSignal: {
    minWidth: '138px',
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '13px',
  },
  headerSignalLabel: {
    color: mutedGold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  headerSignalValue: {
    color: gold,
    fontSize: '20px',
    fontWeight: 950,
    margin: '6px 0 0',
  },
  statusStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '18px',
  },
  statusCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '14px',
    minHeight: '92px',
    boxSizing: 'border-box',
  },
  statusValue: {
    color: '#fff8e7',
    fontSize: '22px',
    lineHeight: 1,
    margin: '7px 0',
    fontWeight: 950,
    letterSpacing: '-0.04em',
  },
  statusBody: {
    color: '#c9c0ad',
    fontSize: '12px',
    lineHeight: 1.42,
    margin: 0,
  },
  executiveBand: {
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 0.7fr) minmax(0, 1.3fr)',
    gap: '18px',
    alignItems: 'center',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '16px 18px',
    marginBottom: '18px',
  },
  bandTitle: {
    color: gold,
    fontSize: '20px',
    lineHeight: 1.15,
    margin: '6px 0 0',
    letterSpacing: '-0.03em',
  },
  bandText: {
    color: '#efe6d1',
    lineHeight: 1.55,
    fontSize: '14px',
    margin: 0,
  },
  primaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '16px',
    marginBottom: '18px',
  },
  primaryCard: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '18px',
    boxShadow: '0 18px 44px rgba(0,0,0,0.22)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  doctrineCard: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '14px 18px',
    marginBottom: '20px',
    boxSizing: 'border-box',
  },
  doctrineText: {
    color: '#e8dec8',
    fontSize: '14px',
    lineHeight: 1.55,
    margin: 0,
    fontWeight: 750,
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  sectionKicker: {
    color: mutedGold,
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '10px',
  },
  cardTitle: {
    color: '#fff8e7',
    fontSize: 'clamp(20px, 2.2vw, 26px)',
    lineHeight: 1.12,
    margin: '8px 0',
    letterSpacing: '-0.04em',
  },
  bodyText: {
    color: '#cfc7b5',
    lineHeight: 1.55,
    fontSize: '13px',
    margin: 0,
    maxWidth: '720px',
  },
  compactMetrics: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '8px',
    marginTop: '14px',
  },
  smallMetric: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '13px',
    padding: '10px',
  },
  metricLabel: {
    color: mutedGold,
    fontSize: '9px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  metricValue: {
    color: '#fff8e7',
    fontSize: '15px',
    lineHeight: 1.2,
    fontWeight: 900,
    margin: '5px 0 0',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '18px',
  },
  panelCard: {
    background: '#100f0d',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
    minHeight: '96px',
  },
  panelTitle: {
    color: '#fff8e7',
    fontSize: '20px',
    lineHeight: 1.15,
    margin: '8px 0',
  },
  panelBody: {
    color: '#cfc7b5',
    lineHeight: 1.5,
    fontSize: '13px',
    margin: 0,
  },
  briefCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(200px, 0.65fr) minmax(0, 1.35fr)',
    gap: '18px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '18px',
    marginBottom: '18px',
    boxSizing: 'border-box',
  },
  briefTitle: {
    color: '#fff8e7',
    fontSize: '22px',
    lineHeight: 1.15,
    margin: '8px 0 0',
    letterSpacing: '-0.03em',
  },
  briefList: {
    margin: 0,
    paddingLeft: '18px',
    color: '#efe6d1',
    lineHeight: 1.55,
    fontSize: '13px',
  },
  briefItem: {
    marginBottom: '3px',
  },
  caseList: {
    display: 'grid',
    gap: '10px',
    marginTop: '14px',
  },
  caseCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '12px',
  },
  caseIdentity: {
    color: '#fff8e7',
    fontWeight: 900,
    margin: '0 0 10px',
    lineHeight: 1.3,
  },
  caseMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
  },
  emptyState: {
    background: '#15110a',
    border: `1px dashed ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    color: '#d8cfba',
    lineHeight: 1.5,
    fontSize: '13px',
  },
}