'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type TimelineEvent = {
  id: string
  case_id: string
  event_type: string
  event_summary: string
  actor: string
  created_at: string
}

type MemoryPosture =
  | 'MEMORY ESTABLISHED'
  | 'MEMORY FORMING'
  | 'MEMORY FRAGMENTED'
  | 'MEMORY WEAK'
  | 'MEMORY ABSENT'

type TimelineIntelligence = {
  posture: MemoryPosture
  question: string
  thesis: string
  continuityMeaning: string
  pressureMemory: string
  trajectoryMemory: string
  recoveryMemory: string
  reliabilityMemory: string
  constraintMemory: string
  commandMemory: string
  evidenceRequirement: string
  memoryRequirement: string
  boardWarning: string
  executiveAction: string
  auditImplication: string
  generatedBrief: string
}

const EVENT_MEMORY_TYPES = {
  pressure: ['PRESSURE', 'NEED_DETECTED', 'ESCALATED', 'SAFEGUARDING'],
  trajectory: ['TRIAGE', 'STATUS', 'REOPENED', 'RECURRENCE'],
  recovery: ['RECOVERY', 'STABILIZING', 'STABILIZED', 'OUTCOME'],
  reliability: ['FOLLOW_UP', 'MONITORING', 'REVIEW', 'VERIFICATION'],
  constraint: ['ROUTING', 'RESPONDER_ASSIGNED', 'OWNERSHIP', 'DELAY'],
  command: ['COMMAND', 'GOVERNANCE', 'EXECUTIVE', 'AUDIT'],
}

export default function TimelinePage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <TimelineContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function TimelineContent() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Loading continuity memory timeline...')

  useEffect(() => {
    loadTimeline()
  }, [])

  async function loadTimeline() {
    setLoading(true)
    setMessage('Loading continuity memory timeline...')

    const { data, error } = await supabase
      .from('case_timeline')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setMessage('Continuity memory timeline could not be loaded.')
      setLoading(false)
      return
    }

    setEvents(data || [])
    setMessage('Continuity memory timeline loaded.')
    setLoading(false)
  }

  const intelligence = useMemo(() => buildTimelineIntelligence(events), [events])

  const totalEvents = events.length
  const uniqueCases = useMemo(
    () => new Set(events.map((event) => event.case_id)).size,
    [events],
  )

  const pressureEvents = useMemo(
    () => countEventsByMemory(events, EVENT_MEMORY_TYPES.pressure),
    [events],
  )

  const recoveryEvents = useMemo(
    () => countEventsByMemory(events, EVENT_MEMORY_TYPES.recovery),
    [events],
  )

  const constraintEvents = useMemo(
    () => countEventsByMemory(events, EVENT_MEMORY_TYPES.constraint),
    [events],
  )

  const commandEvents = useMemo(
    () => countEventsByMemory(events, EVENT_MEMORY_TYPES.command),
    [events],
  )

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>
              TSINAXA CGI • INSTITUTIONAL MEMORY TIMELINE
            </p>

            <h1 style={styles.title}>Timeline</h1>

            <p style={styles.subtitle}>
              Institutional continuity memory preserves movement across time.
              Timeline is not archive; it is the evidence chain explaining how
              continuity evolved.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>MEMORY POSTURE</p>
            <p style={styles.statusValue}>{intelligence.posture}</p>
            <p style={styles.statusMeaning}>{intelligence.thesis}</p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Executive Memory Question</p>

            <h2 style={styles.commandTitle}>{intelligence.question}</h2>

            <p style={styles.bodyText}>{intelligence.continuityMeaning}</p>

            <div style={styles.commandMetaGrid}>
              <MiniStat label="Events" value={String(totalEvents)} />
              <MiniStat label="Cases" value={String(uniqueCases)} />
              <MiniStat label="Pressure" value={String(pressureEvents)} />
              <MiniStat label="Recovery" value={String(recoveryEvents)} />
            </div>
          </div>

          <div style={styles.consequenceCard}>
            <p style={styles.sectionKicker}>Board Warning</p>

            <h2 style={styles.consequenceTitle}>
              Institutions repeat what they forget.
            </h2>

            <p style={styles.bodyText}>{intelligence.boardWarning}</p>
          </div>
        </section>

        <section style={styles.memoryPanel}>
          <p style={styles.sectionKicker}>Institutional Memory Requirements</p>

          <h2 style={styles.panelTitle}>
            Continuity memory must explain pressure, movement, recovery,
            reliability, constraints, command, and auditability.
          </h2>

          <div style={styles.memoryGrid}>
            <MiniStat label="Evidence" value={intelligence.evidenceRequirement} />
            <MiniStat label="Memory" value={intelligence.memoryRequirement} />
            <MiniStat
              label="Executive Action"
              value={intelligence.executiveAction}
            />
            <MiniStat label="Audit" value={intelligence.auditImplication} />
          </div>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Continuity Memory Records</p>

            <h2 style={styles.panelTitle}>Refresh institutional timeline</h2>

            <p style={styles.bodyText}>
              Each event is preserved as institutional memory so leadership can
              reconstruct how continuity changed.
            </p>
          </div>

          <button onClick={loadTimeline} style={styles.primaryButton}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </section>

        <details style={styles.evidencePanel}>
          <summary style={styles.evidenceSummary}>
            <span>
              <span style={styles.sectionKicker}>Supporting Timeline Evidence</span>
              <strong style={styles.evidenceTitle}>
                Memory signals, timeline records, and copy-ready brief
              </strong>
            </span>

            <span style={styles.evidenceToggle}>Expand Timeline</span>
          </summary>

          <section style={styles.gridThree}>
            <ExecutiveCard
              title="Pressure Memory"
              value={intelligence.pressureMemory}
              body="Whether the timeline preserves where instability first accumulated."
            />

            <ExecutiveCard
              title="Trajectory Memory"
              value={intelligence.trajectoryMemory}
              body="Whether the timeline explains how continuity direction changed."
            />

            <ExecutiveCard
              title="Recovery Memory"
              value={intelligence.recoveryMemory}
              body="Whether the timeline preserves stabilization and recovery evidence."
            />
          </section>

          <section style={styles.gridThree}>
            <ExecutiveCard
              title="Reliability Memory"
              value={intelligence.reliabilityMemory}
              body="Whether repeated stabilization can be reconstructed."
            />

            <ExecutiveCard
              title="Constraint Memory"
              value={intelligence.constraintMemory}
              body="Whether blocked movement and ownership pressure remain visible."
            />

            <ExecutiveCard
              title="Command Memory"
              value={intelligence.commandMemory}
              body="Whether leadership action and governance decisions remain attached."
            />
          </section>

          <section style={styles.metricsGrid}>
            <Metric label="Constraint" value={String(constraintEvents)} />
            <Metric label="Command" value={String(commandEvents)} />
            <Metric label="Recovery" value={String(recoveryEvents)} />
            <Metric label="Pressure" value={String(pressureEvents)} />
          </section>

          <section style={styles.panel}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.sectionKicker}>Timeline Records</p>

                <h2 style={styles.panelTitle}>
                  Institutional continuity timeline
                </h2>

                <p style={styles.bodyText}>
                  Records reconstruct how instability entered, moved, stalled,
                  recovered, repeated, escalated, or stabilized.
                </p>
              </div>
            </div>

            {loading ? (
              <p style={styles.emptyBox}>Loading continuity memory...</p>
            ) : events.length === 0 ? (
              <p style={styles.emptyBox}>
                No institutional continuity memory events found yet.
              </p>
            ) : (
              <div style={styles.timelineList}>
                {events.map((event) => (
                  <article style={styles.timelineCard} key={event.id}>
                    <div style={styles.timelineTop}>
                      <div>
                        <p style={styles.metricLabel}>
                          Case {shortCaseId(event.case_id)}
                        </p>

                        <h3 style={styles.eventTitle}>{event.event_type}</h3>
                      </div>

                      <span style={styles.timeBadge}>
                        {formatDateTime(event.created_at)}
                      </span>
                    </div>

                    <p style={styles.eventSummary}>{event.event_summary}</p>

                    <div style={styles.detailGrid}>
                      <Detail
                        label="Memory Type"
                        value={deriveMemoryType(event)}
                      />
                      <Detail
                        label="Actor"
                        value={event.actor || 'Not recorded'}
                      />
                      <Detail label="Event ID" value={event.id} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section style={styles.orderPanel}>
            <p style={styles.sectionKicker}>Copy-Ready Timeline Brief</p>

            <h2 style={styles.panelTitle}>
              How did continuity become what it is today?
            </h2>

            <pre style={styles.summaryBox}>{intelligence.generatedBrief}</pre>
          </section>
        </details>

        <section style={styles.doctrineCard}>
          <strong>INSTITUTIONAL CONTINUITY MEMORY DOCTRINE</strong>

          <span>
            Institutions forget. Continuity memory prevents repeated instability
            from becoming invisible. Timeline is not history; it is the evidence
            chain that explains how continuity evolved.
          </span>
        </section>
      </div>
    </main>
  )
}

function buildTimelineIntelligence(events: TimelineEvent[]): TimelineIntelligence {
  const totalEvents = events.length
  const uniqueCases = new Set(events.map((event) => event.case_id)).size

  const pressureEvents = countEventsByMemory(events, EVENT_MEMORY_TYPES.pressure)
  const trajectoryEvents = countEventsByMemory(
    events,
    EVENT_MEMORY_TYPES.trajectory,
  )
  const recoveryEvents = countEventsByMemory(events, EVENT_MEMORY_TYPES.recovery)
  const reliabilityEvents = countEventsByMemory(
    events,
    EVENT_MEMORY_TYPES.reliability,
  )
  const constraintEvents = countEventsByMemory(
    events,
    EVENT_MEMORY_TYPES.constraint,
  )
  const commandEvents = countEventsByMemory(events, EVENT_MEMORY_TYPES.command)

  const posture = deriveMemoryPosture({
    totalEvents,
    uniqueCases,
    pressureEvents,
    trajectoryEvents,
    recoveryEvents,
    reliabilityEvents,
    constraintEvents,
    commandEvents,
  })

  const question = 'How did continuity become what it is today?'

  const pressureMemory =
    pressureEvents > 0
      ? 'Pressure memory is preserved. The timeline can show where instability became visible.'
      : 'Pressure memory is weak. The timeline may not show where instability first accumulated.'

  const trajectoryMemory =
    trajectoryEvents > 0
      ? 'Trajectory memory is visible. The timeline can help explain continuity direction changes.'
      : 'Trajectory memory is limited. Direction changes may be difficult to reconstruct.'

  const recoveryMemory =
    recoveryEvents > 0
      ? 'Recovery memory is preserved. Stabilization and outcome movement can be reconstructed.'
      : 'Recovery memory is weak. Stabilization claims may lack chronological evidence.'

  const reliabilityMemory =
    reliabilityEvents > 0
      ? 'Reliability memory is visible. Repeated monitoring and verification can be reviewed.'
      : 'Reliability memory is limited. Repeatable stabilization may not be provable from timeline evidence.'

  const constraintMemory =
    constraintEvents > 0
      ? 'Constraint memory is visible. Blocked movement, routing, or ownership pressure can be reconstructed.'
      : 'Constraint memory is weak. It may be difficult to explain why continuity movement slowed.'

  const commandMemory =
    commandEvents > 0
      ? 'Command memory is preserved. Governance or leadership decisions remain attached to the continuity chain.'
      : 'Command memory is limited. Executive decisions may not yet be fully reconstructable.'

  const continuityMeaning = deriveContinuityMeaning(posture)

  const evidenceRequirement =
    'Preserve case ID, event type, event summary, actor, timestamp, memory type, continuity meaning, and audit relevance.'

  const memoryRequirement =
    'Preserve the sequence linking instability, routing, ownership, intervention, outcome, recovery, reliability, command, and audit.'

  const boardWarning =
    'Do not allow continuity history to become administrative residue. What the institution forgets can return as repeated instability.'

  const executiveAction =
    posture === 'MEMORY ABSENT' || posture === 'MEMORY WEAK'
      ? 'Strengthen timeline capture before executive conclusions are trusted.'
      : posture === 'MEMORY FRAGMENTED'
        ? 'Repair missing memory links and preserve continuity chronology.'
        : 'Use timeline memory to support executive interpretation and audit reconstruction.'

  const auditImplication =
    posture === 'MEMORY ESTABLISHED'
      ? 'Audit can reconstruct the continuity chain with meaningful chronological evidence.'
      : 'Audit should treat the continuity chain as incomplete until memory gaps are corrected.'

  const thesis = `${posture}: ${continuityMeaning}`

  const generatedBrief = [
    'TSINAXA CGI INSTITUTIONAL CONTINUITY MEMORY TIMELINE BRIEF',
    '',
    `Executive Memory Question: ${question}`,
    '',
    `Memory Posture: ${posture}`,
    '',
    `Timeline Events: ${totalEvents}`,
    '',
    `Cases With Memory: ${uniqueCases}`,
    '',
    `Enterprise Thesis: ${thesis}`,
    '',
    `Pressure Memory: ${pressureMemory}`,
    '',
    `Trajectory Memory: ${trajectoryMemory}`,
    '',
    `Recovery Memory: ${recoveryMemory}`,
    '',
    `Reliability Memory: ${reliabilityMemory}`,
    '',
    `Constraint Memory: ${constraintMemory}`,
    '',
    `Command Memory: ${commandMemory}`,
    '',
    `Evidence Requirement: ${evidenceRequirement}`,
    '',
    `Memory Requirement: ${memoryRequirement}`,
    '',
    `Board Warning: ${boardWarning}`,
    '',
    `Executive Action: ${executiveAction}`,
    '',
    `Audit Implication: ${auditImplication}`,
    '',
    'Governance-Safe Meaning:',
    'Timeline preserves institutional continuity memory without assigning blame. It protects the chronological chain that explains how instability entered, moved, stalled, recovered, repeated, escalated, or stabilized.',
  ].join('\n')

  return {
    posture,
    question,
    thesis,
    continuityMeaning,
    pressureMemory,
    trajectoryMemory,
    recoveryMemory,
    reliabilityMemory,
    constraintMemory,
    commandMemory,
    evidenceRequirement,
    memoryRequirement,
    boardWarning,
    executiveAction,
    auditImplication,
    generatedBrief,
  }
}

function deriveMemoryPosture(input: {
  totalEvents: number
  uniqueCases: number
  pressureEvents: number
  trajectoryEvents: number
  recoveryEvents: number
  reliabilityEvents: number
  constraintEvents: number
  commandEvents: number
}): MemoryPosture {
  if (input.totalEvents === 0) return 'MEMORY ABSENT'

  const memoryCoverage = [
    input.pressureEvents,
    input.trajectoryEvents,
    input.recoveryEvents,
    input.reliabilityEvents,
    input.constraintEvents,
    input.commandEvents,
  ].filter((value) => value > 0).length

  if (input.totalEvents >= 20 && input.uniqueCases >= 5 && memoryCoverage >= 4) {
    return 'MEMORY ESTABLISHED'
  }

  if (input.totalEvents >= 8 && memoryCoverage >= 3) {
    return 'MEMORY FORMING'
  }

  if (input.totalEvents >= 3 && memoryCoverage >= 2) {
    return 'MEMORY FRAGMENTED'
  }

  return 'MEMORY WEAK'
}

function deriveContinuityMeaning(posture: MemoryPosture) {
  if (posture === 'MEMORY ESTABLISHED') {
    return 'The institution has enough continuity memory to reconstruct how instability moved, stabilized, repeated, or escalated.'
  }

  if (posture === 'MEMORY FORMING') {
    return 'Continuity memory is forming, but executive conclusions should remain conditional until more links are preserved.'
  }

  if (posture === 'MEMORY FRAGMENTED') {
    return 'Continuity memory exists, but the chain may contain gaps that weaken executive interpretation.'
  }

  if (posture === 'MEMORY WEAK') {
    return 'Continuity memory is too thin to fully explain how the current posture emerged.'
  }

  return 'No continuity memory is currently available to reconstruct institutional movement.'
}

function countEventsByMemory(events: TimelineEvent[], patterns: string[]) {
  return events.filter((event) => {
    const text = `${event.event_type} ${event.event_summary}`.toUpperCase()
    return patterns.some((pattern) => text.includes(pattern))
  }).length
}

function deriveMemoryType(event: TimelineEvent) {
  const text = `${event.event_type} ${event.event_summary}`.toUpperCase()

  if (EVENT_MEMORY_TYPES.pressure.some((item) => text.includes(item))) {
    return 'Pressure Memory'
  }

  if (EVENT_MEMORY_TYPES.trajectory.some((item) => text.includes(item))) {
    return 'Trajectory Memory'
  }

  if (EVENT_MEMORY_TYPES.recovery.some((item) => text.includes(item))) {
    return 'Recovery Memory'
  }

  if (EVENT_MEMORY_TYPES.reliability.some((item) => text.includes(item))) {
    return 'Reliability Memory'
  }

  if (EVENT_MEMORY_TYPES.constraint.some((item) => text.includes(item))) {
    return 'Constraint Memory'
  }

  if (EVENT_MEMORY_TYPES.command.some((item) => text.includes(item))) {
    return 'Command Memory'
  }

  return 'General Continuity Memory'
}

function formatDateTime(value: string) {
  if (!value) return 'Not recorded'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not recorded'
  }

  return date.toLocaleString()
}

function shortCaseId(caseId: string) {
  if (!caseId) return 'Unknown case'
  return caseId.slice(0, 8)
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
    </article>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.miniStat}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.miniValue}>{value}</p>
    </article>
  )
}

function ExecutiveCard({
  title,
  value,
  body,
}: {
  title: string
  value: string
  body: string
}) {
  return (
    <article style={styles.panelCard}>
      <p style={styles.sectionKicker}>{title}</p>
      <h3 style={styles.cardValue}>{value}</h3>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.detailBox}>
      <span style={styles.detailLabel}>{label}</span>
      <p style={styles.detailValue}>{value}</p>
    </div>
  )
}

const gold = '#d6b25e'
const mutedGold = '#9f8142'
const deepBlack = '#030303'
const panelBlack = '#090807'
const cardBlack = '#11100d'
const softLine = 'rgba(214,178,94,0.24)'
const strongLine = 'rgba(214,178,94,0.42)'

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(214,178,94,0.12), transparent 34%), linear-gradient(135deg, #030303 0%, #090807 48%, #11100d 100%)',
    color: '#fff8e7',
    padding: '40px 24px 72px',
  },
  container: {
    width: 'min(1440px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gap: 24,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.75fr)',
    gap: 24,
    padding: 32,
    border: `1px solid ${strongLine}`,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.08), rgba(255,255,255,0.018))',
    boxShadow: '0 28px 80px rgba(0,0,0,0.38)',
  },
  kicker: {
    margin: 0,
    color: gold,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '14px 0 0',
    fontSize: 'clamp(2.3rem, 5vw, 5rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.07em',
    fontWeight: 950,
  },
  subtitle: {
    maxWidth: 880,
    margin: '18px 0 0',
    color: '#cfc7b5',
    fontSize: 17,
    lineHeight: 1.8,
  },
  statusBox: {
    border: `1px solid ${strongLine}`,
    borderRadius: 24,
    padding: 24,
    background:
      'linear-gradient(180deg, rgba(214,178,94,0.18), rgba(0,0,0,0.38))',
  },
  statusLabel: {
    margin: 0,
    color: gold,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.2em',
  },
  statusValue: {
    margin: '16px 0 0',
    fontSize: 30,
    fontWeight: 950,
    letterSpacing: '-0.04em',
    lineHeight: 1.05,
  },
  statusMeaning: {
    margin: '12px 0 0',
    color: '#f5f0e6',
    fontSize: 14,
    lineHeight: 1.7,
  },
  message: {
    padding: '14px 18px',
    borderRadius: 16,
    color: gold,
    background: 'rgba(214,178,94,0.1)',
    border: `1px solid ${softLine}`,
    fontWeight: 800,
  },
  commandDeck: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.8fr',
    gap: 24,
  },
  primaryCard: {
    padding: 30,
    borderRadius: 28,
    background: cardBlack,
    color: '#fff8e7',
    border: `1px solid ${softLine}`,
  },
  consequenceCard: {
    padding: 30,
    borderRadius: 28,
    background: deepBlack,
    border: `1px solid ${softLine}`,
  },
  sectionKicker: {
    margin: 0,
    color: mutedGold,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  commandTitle: {
    margin: '14px 0',
    fontSize: 'clamp(1.8rem, 3vw, 3.2rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  consequenceTitle: {
    margin: '14px 0',
    fontSize: 28,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
  bodyText: {
    margin: '8px 0 0',
    color: '#cfc7b5',
    lineHeight: 1.7,
    fontSize: 14,
  },
  commandMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 24,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 14,
    marginBottom: 18,
  },
  metricCard: {
    padding: 18,
    borderRadius: 20,
    background: cardBlack,
    border: `1px solid ${softLine}`,
  },
  metricLabel: {
    margin: 0,
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  metricValue: {
    margin: '10px 0 0',
    color: '#fff8e7',
    fontSize: 26,
    fontWeight: 950,
    lineHeight: 1.15,
    overflowWrap: 'anywhere',
  },
  miniStat: {
    padding: 14,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  miniValue: {
    margin: '8px 0 0',
    color: '#fff8e7',
    fontSize: 13,
    fontWeight: 850,
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
    marginBottom: 18,
  },
  panelCard: {
    padding: 22,
    borderRadius: 22,
    background: cardBlack,
    border: `1px solid ${softLine}`,
    minHeight: 150,
  },
  cardValue: {
    margin: '12px 0 0',
    color: '#fff8e7',
    fontSize: 19,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
  },
  panelBody: {
    marginTop: 10,
    color: '#cfc7b5',
    fontSize: 14,
    lineHeight: 1.65,
  },
  memoryPanel: {
    padding: 28,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.13), rgba(255,255,255,0.035))',
    border: `1px solid ${strongLine}`,
  },
  panelTitle: {
    margin: '12px 0 0',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
  },
  actionPanel: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 18,
    alignItems: 'flex-start',
    padding: 28,
    borderRadius: 28,
    background: panelBlack,
    border: `1px solid ${softLine}`,
  },
  primaryButton: {
    border: 'none',
    borderRadius: 999,
    padding: '14px 22px',
    background: gold,
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  evidencePanel: {
    padding: 24,
    borderRadius: 28,
    background: panelBlack,
    border: `1px solid ${softLine}`,
  },
  evidenceSummary: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 18,
    listStyle: 'none',
  },
  evidenceTitle: {
    display: 'block',
    color: '#fff8e7',
    fontSize: 22,
    lineHeight: 1.2,
    marginTop: 8,
    letterSpacing: '-0.035em',
  },
  evidenceToggle: {
    flex: '0 0 auto',
    borderRadius: 999,
    padding: '10px 14px',
    background: 'rgba(214,178,94,0.12)',
    border: `1px solid ${softLine}`,
    color: gold,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  panel: {
    padding: 28,
    borderRadius: 28,
    background: deepBlack,
    border: `1px solid ${softLine}`,
    marginTop: 18,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
  },
  emptyBox: {
    margin: '18px 0 0',
    color: '#cfc7b5',
    padding: 18,
    borderRadius: 18,
    border: '1px dashed rgba(255,255,255,0.18)',
    background: 'rgba(0,0,0,0.22)',
  },
  timelineList: {
    display: 'grid',
    gap: 14,
    marginTop: 20,
  },
  timelineCard: {
    padding: 20,
    borderRadius: 22,
    background: cardBlack,
    border: `1px solid ${softLine}`,
  },
  timelineTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  eventTitle: {
    margin: '8px 0 0',
    color: '#fff8e7',
    fontSize: 22,
    lineHeight: 1.15,
    overflowWrap: 'anywhere',
  },
  timeBadge: {
    borderRadius: 999,
    padding: '8px 13px',
    background: 'rgba(214,178,94,0.12)',
    color: gold,
    border: `1px solid ${softLine}`,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  },
  eventSummary: {
    margin: '0 0 14px',
    color: '#fff8e7',
    fontSize: 15,
    lineHeight: 1.65,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 10,
  },
  detailBox: {
    padding: 13,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.08)',
    minWidth: 0,
  },
  detailLabel: {
    display: 'block',
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: 900,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  detailValue: {
    margin: 0,
    color: '#fff8e7',
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  orderPanel: {
    padding: 28,
    borderRadius: 28,
    background: deepBlack,
    color: '#fff8e7',
    border: `1px solid ${softLine}`,
    marginTop: 18,
  },
  summaryBox: {
    marginTop: 20,
    maxHeight: 520,
    padding: 22,
    borderRadius: 20,
    background: cardBlack,
    color: '#f5f0e6',
    border: `1px solid ${softLine}`,
    whiteSpace: 'pre-wrap',
    fontSize: 13,
    lineHeight: 1.7,
    overflow: 'auto',
  },
  doctrineCard: {
    display: 'grid',
    gap: 10,
    padding: 24,
    borderRadius: 24,
    background: deepBlack,
    border: `1px solid ${strongLine}`,
    color: '#fff8e7',
    lineHeight: 1.7,
  },
}