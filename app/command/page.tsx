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
  pressureShort: string
  trajectoryShort: string
  recoveryShort: string
  reliabilityShort: string
  attributionTitle: string
  attributionMeaning: string
  commandVisibility: string
  commandAction: string
  evidenceGap: string
  recoveryCredibility: string
  memory: string
  persistence: string
  risk: string
  hasActiveCommandEvidence: boolean
  executiveBrief: {
    status: string
    cases: string
    evidence: string
    action: string
  }
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
              <p style={styles.kicker}>TSINAXA CGI • COMMAND</p>

              <div style={styles.headerRow}>
                <h1 style={styles.title}>Command</h1>
                <p style={styles.headerPosture}>{command.posture}</p>
              </div>

              <p style={styles.subtitle}>
                Executive reading of command-attributed instability, evidence
                pressure, recovery credibility, survivability exposure, and
                institutional continuity posture.
              </p>
            </section>

            <section style={styles.statusStrip}>
              <ExecutiveMetric
                label="Posture"
                value={command.statusShort}
                body={command.posture}
              />
              <ExecutiveMetric
                label="Cases"
                value={loading ? '...' : command.activeCaseCount}
                body={command.attributionTitle}
              />
              <ExecutiveMetric
                label="Evidence"
                value={command.evidenceShort}
                body={command.evidenceGap}
              />
              <ExecutiveMetric
                label="Survivability"
                value={command.survivabilityShort}
                body="Institutional survivability command exposure."
              />
            </section>

            <section style={styles.intelligenceStrip}>
              <MiniSignal label="Pressure" value={command.pressureShort} />
              <MiniSignal label="Trajectory" value={command.trajectoryShort} />
              <MiniSignal label="Recovery" value={command.recoveryShort} />
              <MiniSignal label="Reliability" value={command.reliabilityShort} />
            </section>

            <section style={styles.commandGrid}>
              <section style={styles.compactCard}>
                <p style={styles.sectionKicker}>Attribution</p>
                <h2 style={styles.compactTitle}>{command.attributionTitle}</h2>
                <p style={styles.bodyText}>{command.attributionMeaning}</p>

                {!loading && cases.length > 0 && (
                  <div style={styles.caseList}>
                    {cases.map((item) => (
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
                  </div>
                )}
              </section>

              <section style={styles.compactCard}>
                <p style={styles.sectionKicker}>Command Visibility</p>
                <h2 style={styles.compactTitle}>{command.commandVisibility}</h2>
                <p style={styles.bodyText}>{command.commandAction}</p>

                <div style={styles.memoryRow}>
                  <SmallMetric label="Memory" value={command.memory} />
                  <SmallMetric label="Persistence" value={command.persistence} />
                  <SmallMetric label="Risk" value={command.risk} />
                </div>
              </section>
            </section>

            {command.hasActiveCommandEvidence && (
              <section style={styles.twoColumnGrid}>
                <ExecutivePanel title="Evidence" body={command.evidenceGap} />
                <ExecutivePanel title="Recovery" body={command.recoveryCredibility} />
              </section>
            )}

            <section style={styles.briefCard}>
              <p style={styles.sectionKicker}>Executive Reading</p>

              <div style={styles.briefGrid}>
                <BriefLine label="Status" value={command.executiveBrief.status} />
                <BriefLine label="Cases" value={command.executiveBrief.cases} />
                <BriefLine label="Evidence" value={command.executiveBrief.evidence} />
                <BriefLine label="Action" value={command.executiveBrief.action} />
              </div>
            </section>

            <section style={styles.doctrineCard}>
              CGI governs continuity credibility. Visible recovery is not durable
              stabilization. Command remains traceable to active lifecycle
              evidence.
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
      pressureShort: 'CLEAR',
      trajectoryShort: 'STABLE',
      recoveryShort: 'NONE ACTIVE',
      reliabilityShort: 'STABLE',
      attributionTitle: 'None active',
      attributionMeaning: 'No command-attributed cases are visible.',
      commandVisibility: 'Clear',
      commandAction:
        'No executive intervention is required from current lifecycle evidence.',
      evidenceGap: 'No active evidence gap is visible.',
      recoveryCredibility: 'No active recovery credibility concern is visible.',
      memory: 'NONE',
      persistence: 'NONE',
      risk: 'CLEAR',
      hasActiveCommandEvidence: false,
      executiveBrief: {
        status: 'Clear',
        cases: '0 active command-attributed cases',
        evidence: 'None required',
        action: 'No executive intervention required',
      },
    }
  }

  if (commandEscalations > 0 || recurrenceVisible > 0 || highSeverity > 1) {
    return {
      posture: 'ELEVATED CONTINUITY EXPOSURE',
      statusShort: 'ELEVATED',
      activeCaseCount: String(total),
      evidenceShort: 'REQUIRED',
      survivabilityShort: 'WATCH',
      pressureShort: highSeverity > 1 ? 'ELEVATED' : 'VISIBLE',
      trajectoryShort: recurrenceVisible > 0 ? 'UNSTABLE' : 'WATCH',
      recoveryShort: recoveryMonitoring > 0 ? 'MONITORING' : 'NOT CONFIRMED',
      reliabilityShort: recurrenceVisible > 0 ? 'VARIABLE' : 'WATCH',
      attributionTitle: `${total} active record(s)`,
      attributionMeaning:
        'Command is reading active lifecycle evidence requiring executive visibility.',
      commandVisibility: 'Review required',
      commandAction:
        'Repeated or escalated instability must not move silently through ordinary handling.',
      evidenceGap:
        'Ownership, action, outcome credibility, recurrence review, and recovery durability evidence are required.',
      recoveryCredibility:
        recoveryMonitoring > 0
          ? 'Recovery monitoring is visible, but durability is not yet confirmed.'
          : 'Recovery credibility is not yet established.',
      memory: recurrenceVisible > 0 ? 'RECURRENCE' : 'VISIBLE',
      persistence: recurrenceVisible > 0 ? 'PERSISTENT' : 'EMERGING',
      risk: 'WATCHED',
      hasActiveCommandEvidence: true,
      executiveBrief: {
        status: 'Elevated',
        cases: `${total} command-attributed record(s)`,
        evidence: 'Executive evidence required',
        action: 'Require ownership, recurrence review, and durability proof',
      },
    }
  }

  return {
    posture: 'ACTIVE COMMAND WATCH',
    statusShort: 'WATCH',
    activeCaseCount: String(total),
    evidenceShort: 'MONITOR',
    survivabilityShort: 'STABLE',
    pressureShort: 'VISIBLE',
    trajectoryShort: 'STABLE',
    recoveryShort: recoveryMonitoring > 0 ? 'MONITORING' : 'PENDING',
    reliabilityShort: 'STABLE',
    attributionTitle: `${total} active record(s)`,
    attributionMeaning:
      'Command is reading active lifecycle records under proportional executive visibility.',
    commandVisibility: 'Watch active',
    commandAction:
      'Monitor lifecycle movement without over-escalating stable governed cases.',
    evidenceGap:
      'Evidence remains important, but no concentrated evidence gap is visible.',
    recoveryCredibility:
      recoveryMonitoring > 0
        ? 'Recovery monitoring is active for some records.'
        : 'Recovery credibility matures after verification and durability observation.',
    memory: 'VISIBLE',
    persistence: 'EMERGING',
    risk: 'MONITORED',
    hasActiveCommandEvidence: true,
    executiveBrief: {
      status: 'Watch',
      cases: `${total} active command-attributed record(s)`,
      evidence: 'Monitor evidence maturity',
      action: 'Continue proportional command visibility',
    },
  }
}

function ExecutiveMetric({
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

function MiniSignal({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <article style={styles.miniSignal}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.miniValue}>{value}</p>
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
      <p style={styles.sectionKicker}>{title}</p>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function BriefLine({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <article style={styles.briefLine}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.briefValue}>{value}</p>
    </article>
  )
}

const gold = '#d6b25e'
const mutedGold = '#9f8142'
const deepBlack = '#030303'
const panelBlack = '#090807'
const cardBlack = '#11100d'
const softLine = 'rgba(214,178,94,0.24)'

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: '#f5f0e6',
    overflowX: 'hidden',
    background:
      'radial-gradient(circle at top right, rgba(214,178,94,0.08), transparent 32%), #030303',
  },
  container: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '8px 24px 56px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '16px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '18px',
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
    fontSize: 'clamp(30px, 4vw, 42px)',
    lineHeight: 1,
    margin: '8px 0',
    letterSpacing: '-0.05em',
  },
  headerPosture: {
    color: gold,
    border: `1px solid ${softLine}`,
    borderRadius: '999px',
    padding: '7px 11px',
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
    whiteSpace: 'nowrap',
  },
  subtitle: {
    color: '#cfc7b5',
    maxWidth: '760px',
    lineHeight: 1.5,
    fontSize: '13px',
    margin: 0,
  },
  statusStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '14px',
  },
  statusCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '15px',
    padding: '13px',
    minHeight: '82px',
    boxSizing: 'border-box',
  },
  statusValue: {
    color: '#fff8e7',
    fontSize: '21px',
    lineHeight: 1,
    margin: '6px 0',
    fontWeight: 950,
    letterSpacing: '-0.04em',
  },
  statusBody: {
    color: '#c9c0ad',
    fontSize: '11px',
    lineHeight: 1.35,
    margin: 0,
  },
  intelligenceStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '14px',
  },
  miniSignal: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '13px',
    padding: '11px 12px',
  },
  miniValue: {
    color: gold,
    fontSize: '15px',
    fontWeight: 950,
    margin: '5px 0 0',
  },
  commandGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '14px',
    marginBottom: '14px',
  },
  compactCard: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
    minHeight: '118px',
    boxShadow: '0 14px 34px rgba(0,0,0,0.18)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  sectionKicker: {
    color: mutedGold,
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '10px',
  },
  compactTitle: {
    color: '#fff8e7',
    fontSize: 'clamp(19px, 2vw, 24px)',
    lineHeight: 1.12,
    margin: '7px 0',
    letterSpacing: '-0.04em',
  },
  bodyText: {
    color: '#cfc7b5',
    lineHeight: 1.45,
    fontSize: '13px',
    margin: 0,
  },
  memoryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '8px',
    marginTop: '12px',
  },
  smallMetric: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '12px',
    padding: '9px',
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
    fontSize: '14px',
    lineHeight: 1.15,
    fontWeight: 900,
    margin: '5px 0 0',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '14px',
  },
  panelCard: {
    background: '#100f0d',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    minHeight: '76px',
  },
  panelBody: {
    color: '#cfc7b5',
    lineHeight: 1.45,
    fontSize: '13px',
    margin: '7px 0 0',
  },
  briefCard: {
    display: 'grid',
    gridTemplateColumns: '180px minmax(0, 1fr)',
    gap: '14px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '15px',
    marginBottom: '14px',
    boxSizing: 'border-box',
  },
  briefGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '10px',
  },
  briefLine: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '12px',
    padding: '10px',
  },
  briefValue: {
    color: '#fff8e7',
    fontSize: '13px',
    fontWeight: 800,
    lineHeight: 1.35,
    margin: '5px 0 0',
  },
  doctrineCard: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '12px 15px',
    color: '#e8dec8',
    fontSize: '13px',
    lineHeight: 1.45,
    fontWeight: 750,
    boxSizing: 'border-box',
  },
  caseList: {
    display: 'grid',
    gap: '10px',
    marginTop: '12px',
  },
  caseCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '12px',
    padding: '11px',
  },
  caseIdentity: {
    color: '#fff8e7',
    fontWeight: 900,
    margin: '0 0 8px',
    lineHeight: 1.3,
  },
  caseMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
  },
}