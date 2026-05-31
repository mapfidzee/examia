'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type StabilityCase = {
  id: string
  beneficiary_name: string
  beneficiary_level: string | null
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  intervention_summary: string | null
  outcome_summary: string | null
  created_at?: string | null
  updated_at?: string | null
}

type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
  created_at?: string | null
}

type CgiOperationalMetric = {
  id: string
  created_at: string
  executive_summary: string | null
  action_cue: string | null
  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
}

type ExecutivePosture =
  | 'EXECUTIVE CENTER CLEAR'
  | 'ACTIVE CONTINUITY WATCH'
  | 'RECOVERY WATCH'
  | 'EVIDENCE REVIEW REQUIRED'
  | 'EXECUTIVE REVIEW REQUIRED'
  | 'STABILITY ABSORPTION READY'

type RecoveryDisposition =
  | 'MOVE_TO_STABILITY_BOARD'
  | 'MOVE_TO_COMMAND_WATCH'
  | 'MOVE_TO_COMMAND_ESCALATION'
  | 'RETURN_TO_OUTCOMES_REVIEW'
  | 'RETURN_TO_INTERVENTION_REVIEW'
  | 'CONTINUE_RECOVERY_MONITORING'
  | 'NO_RECOVERY_DISPOSITION'

type RecoveryMemoryRecord = {
  caseItem: StabilityCase
  latestRecoveryReview?: OutcomeRecord
  disposition: RecoveryDisposition
  durabilityResult: string
  commandPosture: string
  recoveryConfidence: string
  memoryImpact: string
  movementReason: string
}

type ExecutiveSynthesis = {
  posture: ExecutivePosture
  meaning: string
  executiveQuestion: string
  whatIsHappening: string
  whyItMatters: string
  nextMovement: string
  leadershipAction: string
  memoryStatus: string
  evidenceStatus: string
  recoveryCredibility: string
  survivabilityMeaning: string
  activeInstability: number
  stabilized: number
  recoveryRecords: number
  fragileRecovery: number
  commandPressure: number
  evidenceReturn: number
  absorbable: number
  historicalMemory: number
}

const CASE_SAMPLE_LIMIT = 120
const METRIC_SAMPLE_LIMIT = 40

const ACTIVE_CASE_STATUSES = [
  'NEW',
  'TRIAGE',
  'UNDER_REVIEW',
  'ROUTED',
  'RESPONDER_ASSIGNED',
  'INTERVENTION_ACTIVE',
  'FOLLOW_UP_REQUIRED',
  'REOPENED',
  'RECOVERY_MONITORING',
  'PARTIAL_STABILIZATION',
  'IMPROVING',
]

const DOCTRINE = [
  'Executive Center synthesizes; it does not close.',
  'Command is not closure.',
  'Recovery is not durability.',
  'Memory must survive stabilization.',
]

export default function ExecutiveCenterPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <ExecutiveCenterContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function ExecutiveCenterContent() {
  const [cases, setCases] = useState<StabilityCase[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadExecutiveCenter()
  }, [])

  async function loadExecutiveCenter() {
    setMessage('Loading executive continuity synthesis...')

    const [casesResult, outcomesResult, metricsResult] = await Promise.all([
      supabase
        .from('beneficiary_cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(CASE_SAMPLE_LIMIT),
      supabase
        .from('case_outcomes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(CASE_SAMPLE_LIMIT),
      supabase
        .from('cgi_operational_metrics')
        .select(
          'id, created_at, executive_summary, action_cue, dominant_pressure_source, dominant_trajectory_signal, dominant_memory_pattern',
        )
        .order('created_at', { ascending: false })
        .limit(METRIC_SAMPLE_LIMIT),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)
    if (metricsResult.error) console.error(metricsResult.error)

    if (casesResult.error || outcomesResult.error || metricsResult.error) {
      setMessage('Some executive continuity intelligence failed to load.')
      return
    }

    setCases(casesResult.data || [])
    setOutcomes(outcomesResult.data || [])
    setMetrics(metricsResult.data || [])
    setMessage('Executive continuity synthesis loaded.')
  }

  const recoveryMemory = useMemo(
    () => buildRecoveryMemoryRecords(cases, outcomes),
    [cases, outcomes],
  )

  const synthesis = useMemo(
    () => buildExecutiveSynthesis(cases, recoveryMemory, metrics),
    [cases, recoveryMemory, metrics],
  )

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • EXECUTIVE CENTER</p>
          <h1 style={styles.title}>Executive Continuity Center</h1>
          <p style={styles.subtitle}>
            One leadership synthesis across current instability, recovery
            credibility, command pressure, institutional posture, evidence, and
            continuity memory.
          </p>

          <section style={styles.doctrinePanel}>
            <p style={styles.doctrineTitle}>EXECUTIVE CENTER DOCTRINE</p>
            <div style={styles.doctrineGrid}>
              {DOCTRINE.map((item) => (
                <div key={item} style={styles.doctrineCard}>
                  {item}
                </div>
              ))}
            </div>
          </section>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Current Executive Continuity Reading</p>
            <h2 style={styles.heroTitle}>{synthesis.posture}</h2>
            <p style={styles.heroMeaning}>{synthesis.meaning}</p>
          </div>

          <div style={styles.questionBox}>
            <p style={styles.metricLabel}>Executive Question</p>
            <p style={styles.questionText}>{synthesis.executiveQuestion}</p>
          </div>
        </section>

        <section style={styles.summaryGrid}>
          <MetricCard
            label="Active Instability"
            value={synthesis.activeInstability}
            body="Current lifecycle records still carrying instability."
          />
          <MetricCard
            label="Recovery Records"
            value={synthesis.recoveryRecords}
            body="Durability reviews available for executive synthesis."
          />
          <MetricCard
            label="Command Pressure"
            value={synthesis.commandPressure}
            body="Records requiring command watch or escalation."
          />
          <MetricCard
            label="Memory Records"
            value={synthesis.historicalMemory}
            body="Continuity memory preserved for institutional learning."
          />
        </section>

        <section style={styles.memoryCard}>
          <div>
            <p style={styles.sectionKicker}>Institutional Memory Status</p>
            <h2 style={styles.cardTitle}>{synthesis.memoryStatus}</h2>
            <p style={styles.bodyText}>
              Memory is not leftover data. Memory is how CGI prevents visible
              instability from disappearing after immediate pressure is gone.
            </p>
          </div>

          <div style={styles.memoryGrid}>
            <MemoryMetric label="Evidence" value={synthesis.evidenceStatus} />
            <MemoryMetric label="Recovery" value={synthesis.recoveryCredibility} />
            <MemoryMetric label="Survivability" value={synthesis.survivabilityMeaning} />
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="What Is Happening?">{synthesis.whatIsHappening}</Panel>
          <Panel title="Why It Matters">{synthesis.whyItMatters}</Panel>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Lifecycle Movement">{synthesis.nextMovement}</Panel>
          <Panel title="Leadership Action">{synthesis.leadershipAction}</Panel>
        </section>

        <section style={styles.signalStrip}>
          <SignalCard
            title="Pressure"
            value={synthesis.activeInstability > 0 ? 'Visible' : 'Clear'}
            body={
              synthesis.activeInstability > 0
                ? 'Active lifecycle pressure remains visible.'
                : 'No active lifecycle pressure is currently visible.'
            }
          />

          <SignalCard
            title="Recovery"
            value={synthesis.recoveryRecords > 0 ? 'Memory Active' : 'No Active Review'}
            body={
              synthesis.recoveryRecords > 0
                ? 'Recovery evidence is available for executive synthesis.'
                : 'No recovery durability records currently require executive interpretation.'
            }
          />

          <SignalCard
            title="Command"
            value={synthesis.commandPressure > 0 ? 'Required' : 'Clear'}
            body={
              synthesis.commandPressure > 0
                ? 'Command attention remains necessary before stability can be absorbed.'
                : 'No current command pressure is visible from lifecycle records.'
            }
          />
        </section>

        {recoveryMemory.length > 0 && (
          <section style={styles.card}>
            <p style={styles.sectionKicker}>Recovery-to-Executive Synthesis</p>
            <h2 style={styles.cardTitle}>
              Recovery evidence remains visible before institutional confidence is restored.
            </h2>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Case</th>
                    <th style={styles.th}>Disposition</th>
                    <th style={styles.th}>Command Posture</th>
                    <th style={styles.th}>Durability</th>
                    <th style={styles.th}>Memory Impact</th>
                    <th style={styles.th}>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {recoveryMemory.slice(0, 12).map((record) => (
                    <tr
                      key={`${record.caseItem.id}-${
                        record.latestRecoveryReview?.id || 'case'
                      }`}
                    >
                      <td style={styles.td}>
                        <strong>{record.caseItem.beneficiary_name}</strong>
                        <br />
                        {record.caseItem.support_domain}
                      </td>
                      <td style={styles.td}>{record.disposition}</td>
                      <td style={styles.td}>{record.commandPosture}</td>
                      <td style={styles.td}>{record.durabilityResult}</td>
                      <td style={styles.td}>{record.memoryImpact}</td>
                      <td style={styles.td}>{record.movementReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Executive Action Posture</p>
          <h2 style={styles.cardTitle}>{synthesis.posture}</h2>
          <p style={styles.bodyText}>{synthesis.leadershipAction}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem title="Dominant Concern" body={deriveDominantConcern(synthesis)} />
            <PriorityItem title="Evidence Meaning" body={synthesis.evidenceStatus} />
            <PriorityItem
              title="Governance Meaning"
              body="Leadership visibility must remain proportional, non-punitive, evidence-aware, and memory-preserving."
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Memory-Aware Executive Brief</p>
          <h2 style={styles.cardTitle}>
            One leadership reading across pressure, recovery, evidence, command,
            stability, and continuity memory.
          </h2>

          <pre style={styles.summaryBox}>{buildCopyReadyExecutiveBrief(synthesis)}</pre>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Historical Memory Trail</p>
          <h2 style={styles.cardTitle}>
            Historical continuity memory remains preserved without driving the current posture.
          </h2>

          {metrics.length === 0 && (
            <div style={styles.emptyState}>
              No historical continuity metric records are currently available.
            </div>
          )}

          {metrics.length > 0 && (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Created</th>
                    <th style={styles.th}>Pressure Memory</th>
                    <th style={styles.th}>Trajectory Memory</th>
                    <th style={styles.th}>Structural Memory</th>
                    <th style={styles.th}>Executive Memory</th>
                  </tr>
                </thead>

                <tbody>
                  {metrics.slice(0, 10).map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>{formatDate(item.created_at)}</td>
                      <td style={styles.td}>
                        {item.dominant_pressure_source || 'No pressure memory recorded'}
                      </td>
                      <td style={styles.td}>
                        {item.dominant_trajectory_signal || 'No trajectory memory recorded'}
                      </td>
                      <td style={styles.td}>
                        {item.dominant_memory_pattern || 'No structural memory recorded'}
                      </td>
                      <td style={styles.td}>
                        {item.executive_summary || 'No executive memory summary recorded'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button onClick={loadExecutiveCenter} style={styles.primaryButton}>
            Refresh Executive Center
          </button>
        </section>
      </div>
    </main>
  )
}

function buildRecoveryMemoryRecords(
  cases: StabilityCase[],
  outcomes: OutcomeRecord[],
): RecoveryMemoryRecord[] {
  const records: RecoveryMemoryRecord[] = []

  cases.forEach((caseItem) => {
    const caseOutcomes = outcomes.filter(
      (outcome) => outcome.case_id === caseItem.id,
    )

    const latestRecoveryReview = caseOutcomes.find((outcome) =>
      isRecoverySummary(outcome.outcome_summary || ''),
    )

    const summary =
      latestRecoveryReview?.outcome_summary || caseItem.outcome_summary || ''

    if (!summary || !isRecoverySummary(summary)) return

    const disposition =
      (extractField(summary, 'RECOVERY DISPOSITION') ||
        'NO_RECOVERY_DISPOSITION') as RecoveryDisposition

    records.push({
      caseItem,
      latestRecoveryReview,
      disposition,
      durabilityResult:
        extractField(summary, 'DURABILITY RESULT') ||
        latestRecoveryReview?.outcome_status ||
        'DURABILITY_UNRECORDED',
      commandPosture:
        extractField(summary, 'COMMAND POSTURE') || 'COMMAND_POSTURE_UNRECORDED',
      recoveryConfidence:
        extractField(summary, 'RECOVERY CONFIDENCE') ||
        'RECOVERY_CONFIDENCE_UNRECORDED',
      memoryImpact:
        extractField(summary, 'MEMORY IMPACT') || 'MEMORY_IMPACT_UNRECORDED',
      movementReason:
        extractField(summary, 'MOVEMENT REASON') ||
        'Movement reason was not explicitly preserved.',
    })
  })

  return records
}

function buildExecutiveSynthesis(
  cases: StabilityCase[],
  recoveryMemory: RecoveryMemoryRecord[],
  metrics: CgiOperationalMetric[],
): ExecutiveSynthesis {
  const activeInstability = cases.filter((caseItem) =>
    ACTIVE_CASE_STATUSES.includes(caseItem.case_status),
  ).length

  const stabilized = cases.filter(
    (caseItem) => caseItem.case_status === 'STABILIZED',
  ).length

  const absorbable = recoveryMemory.filter(
    (record) => record.disposition === 'MOVE_TO_STABILITY_BOARD',
  ).length

  const commandPressure = recoveryMemory.filter(
    (record) =>
      record.disposition === 'MOVE_TO_COMMAND_WATCH' ||
      record.disposition === 'MOVE_TO_COMMAND_ESCALATION',
  ).length

  const evidenceReturn = recoveryMemory.filter(
    (record) =>
      record.disposition === 'RETURN_TO_OUTCOMES_REVIEW' ||
      record.disposition === 'RETURN_TO_INTERVENTION_REVIEW',
  ).length

  const fragileRecovery = recoveryMemory.filter(
    (record) =>
      record.disposition === 'CONTINUE_RECOVERY_MONITORING' ||
      record.disposition === 'MOVE_TO_COMMAND_WATCH' ||
      record.disposition === 'RETURN_TO_OUTCOMES_REVIEW' ||
      record.disposition === 'RETURN_TO_INTERVENTION_REVIEW',
  ).length

  let posture: ExecutivePosture = 'EXECUTIVE CENTER CLEAR'
  let meaning =
    'No active lifecycle instability, command pressure, or fragile recovery is currently visible.'
  let executiveQuestion =
    'What must leadership understand before instability is treated as stabilized?'
  let nextMovement =
    'Maintain executive visibility. No governed movement is currently required.'
  let leadershipAction =
    'Continue monitoring without creating artificial pressure. Preserve institutional memory for future recurrence learning.'

  if (commandPressure > 0) {
    posture = 'EXECUTIVE REVIEW REQUIRED'
    meaning =
      'Recovery or command pressure remains visible and should not be treated as resolved.'
    executiveQuestion = 'Does leadership need to intervene before stability is trusted?'
    nextMovement = 'Move through Command before any stability absorption is trusted.'
    leadershipAction =
      'Review command pressure, recurrence signals, recovery durability, and unresolved evidence before allowing final posture.'
  } else if (evidenceReturn > 0) {
    posture = 'EVIDENCE REVIEW REQUIRED'
    meaning =
      'Evidence or intervention credibility is not strong enough to support final stability confidence.'
    executiveQuestion = 'Can the evidence support recovery confidence?'
    nextMovement = 'Return to Outcomes or Interventions for evidence strengthening.'
    leadershipAction = 'Require clearer verification before recovery is treated as durable.'
  } else if (fragileRecovery > 0) {
    posture = 'RECOVERY WATCH'
    meaning =
      'Recovery is visible but still fragile enough to require executive awareness.'
    executiveQuestion = 'Is recovery durable enough to reduce visibility?'
    nextMovement = 'Continue Recovery Watch before stability absorption.'
    leadershipAction =
      'Maintain proportionate visibility until durability and recurrence conditions are clearer.'
  } else if (activeInstability > 0) {
    posture = 'ACTIVE CONTINUITY WATCH'
    meaning =
      'Active lifecycle instability remains visible and should not be hidden by executive summary language.'
    executiveQuestion = 'Is active instability moving through governed action?'
    nextMovement =
      'Continue governed lifecycle movement through cases, routing, intervention, outcomes, and recovery.'
    leadershipAction =
      'Protect visibility, ownership, evidence, and next movement until stabilization is credible.'
  } else if (absorbable > 0) {
    posture = 'STABILITY ABSORPTION READY'
    meaning =
      'Durable recovery evidence is available for institutional absorption while memory remains preserved.'
    executiveQuestion = 'Can recovered instability be absorbed without hiding memory?'
    nextMovement =
      'Move to Stability Board while preserving recurrence history, evidence meaning, and unresolved risk.'
    leadershipAction = 'Absorb final posture without erasing structural memory.'
  }

  return {
    posture,
    meaning,
    executiveQuestion,
    whatIsHappening: deriveWhatIsHappening({
      activeInstability,
      recoveryRecords: recoveryMemory.length,
      commandPressure,
      evidenceReturn,
      fragileRecovery,
      absorbable,
    }),
    whyItMatters: deriveWhyItMatters(posture),
    nextMovement,
    leadershipAction,
    memoryStatus: 'MEMORY PRESERVED',
    evidenceStatus:
      evidenceReturn > 0
        ? 'Evidence requires review before stability can be trusted.'
        : 'No active evidence gap is currently driving executive posture.',
    recoveryCredibility:
      recoveryMemory.length === 0
        ? 'No active recovery durability review is currently visible.'
        : fragileRecovery > 0 || commandPressure > 0
          ? 'Recovery remains visible but not yet fully durable.'
          : 'Recovery credibility is currently absorbable into institutional posture.',
    survivabilityMeaning:
      commandPressure > 0 || activeInstability > 0
        ? 'Survivability requires continued executive visibility.'
        : 'No current survivability pressure is visible from lifecycle records.',
    activeInstability,
    stabilized,
    recoveryRecords: recoveryMemory.length,
    fragileRecovery,
    commandPressure,
    evidenceReturn,
    absorbable,
    historicalMemory: metrics.length,
  }
}

function deriveWhatIsHappening(input: {
  activeInstability: number
  recoveryRecords: number
  commandPressure: number
  evidenceReturn: number
  fragileRecovery: number
  absorbable: number
}) {
  if (input.commandPressure > 0) {
    return 'Command pressure remains active. Executive Center keeps leadership attention on unresolved instability before stability is trusted.'
  }

  if (input.evidenceReturn > 0) {
    return 'Some recovery evidence is not strong enough for final confidence. The lifecycle must return to evidence or intervention review.'
  }

  if (input.fragileRecovery > 0) {
    return 'Recovery is visible but still fragile. Durability must mature before institutional stability is declared.'
  }

  if (input.activeInstability > 0) {
    return 'Active instability remains in the lifecycle. CGI must keep visibility until governed movement reaches credible stabilization.'
  }

  if (input.absorbable > 0) {
    return 'Recovered instability appears ready for institutional absorption while preserving memory and recurrence history.'
  }

  return 'The current lifecycle is clear. Executive Center remains available as the synthesis layer when instability, recovery, command pressure, or evidence gaps appear.'
}

function deriveWhyItMatters(posture: ExecutivePosture) {
  if (posture === 'EXECUTIVE REVIEW REQUIRED') {
    return 'Leadership risk increases when command pressure disappears before recovery credibility is proven.'
  }

  if (posture === 'EVIDENCE REVIEW REQUIRED') {
    return 'Without evidence, stabilization becomes an assumption rather than a governed continuity conclusion.'
  }

  if (posture === 'RECOVERY WATCH') {
    return 'Fragile recovery can look stable too early. CGI preserves watch until durability becomes credible.'
  }

  if (posture === 'ACTIVE CONTINUITY WATCH') {
    return 'Visible instability must continue moving through governed action rather than fragmenting across pages.'
  }

  if (posture === 'STABILITY ABSORPTION READY') {
    return 'Stable posture has value only if memory, recurrence, and unresolved risk remain visible after recovery.'
  }

  return 'A clear executive center prevents false escalation while keeping institutional memory ready for future recurrence.'
}

function deriveDominantConcern(synthesis: ExecutiveSynthesis) {
  if (synthesis.commandPressure > 0) return 'Command pressure remains unresolved.'
  if (synthesis.evidenceReturn > 0) return 'Evidence requires renewed review.'
  if (synthesis.fragileRecovery > 0) return 'Recovery remains fragile.'
  if (synthesis.activeInstability > 0) return 'Active lifecycle instability remains visible.'
  if (synthesis.absorbable > 0) return 'Stability absorption requires memory preservation.'
  return 'No active executive concern is currently visible.'
}

function buildCopyReadyExecutiveBrief(synthesis: ExecutiveSynthesis) {
  return [
    'TSINAXA CGI Executive Continuity Brief',
    '',
    `Current Posture: ${synthesis.posture}`,
    '',
    `Executive Question: ${synthesis.executiveQuestion}`,
    '',
    `Meaning: ${synthesis.meaning}`,
    '',
    `What is happening: ${synthesis.whatIsHappening}`,
    '',
    `Why it matters: ${synthesis.whyItMatters}`,
    '',
    `Lifecycle movement: ${synthesis.nextMovement}`,
    '',
    `Leadership action: ${synthesis.leadershipAction}`,
    '',
    `Memory status: ${synthesis.memoryStatus}`,
    '',
    `Evidence status: ${synthesis.evidenceStatus}`,
    '',
    `Recovery credibility: ${synthesis.recoveryCredibility}`,
  ].join('\n')
}

function isRecoverySummary(summary: string) {
  return (
    summary.includes('DURABILITY RESULT') ||
    summary.includes('RECOVERY TRAJECTORY') ||
    summary.includes('RECOVERY MATURITY') ||
    summary.includes('RECOVERY CONFIDENCE') ||
    summary.includes('RECOVERY DISPOSITION') ||
    summary.includes('RECOMMENDED NEXT MOVEMENT')
  )
}

function extractField(summary: string, label: string) {
  if (!summary) return ''

  const lines = summary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const target = label.trim().toLowerCase()
  const index = lines.findIndex((line) => line.toLowerCase() === target)

  if (index === -1) return ''

  return lines[index + 1] || ''
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
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

function MetricCard({
  label,
  value,
  body,
}: {
  label: string
  value: number
  body: string
}) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
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
      <p style={styles.memoryMetricValue}>{value}</p>
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
    padding: '16px 28px 72px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '28px',
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
    fontSize: 'clamp(34px, 4vw, 48px)',
    lineHeight: 1,
    margin: '10px 0',
    letterSpacing: '-0.05em',
  },
  subtitle: {
    color: '#cfc7b5',
    maxWidth: '820px',
    lineHeight: 1.65,
    fontSize: '14px',
    margin: 0,
  },
  doctrinePanel: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '22px',
    marginTop: '22px',
  },
  doctrineTitle: {
    color: gold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.15em',
    margin: '0 0 14px',
  },
  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
  },
  doctrineCard: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    color: '#fff8e7',
    fontSize: '12px',
    lineHeight: 1.45,
    fontWeight: 800,
  },
  message: {
    background: 'rgba(16, 185, 129, 0.14)',
    color: '#bbf7d0',
    border: '1px solid rgba(16, 185, 129, 0.28)',
    padding: '13px 16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '24px',
    fontSize: '13px',
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.65fr)',
    gap: '24px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
  },
  sectionKicker: {
    color: mutedGold,
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '10px',
  },
  heroTitle: {
    color: gold,
    fontSize: 'clamp(32px, 4vw, 48px)',
    lineHeight: 1,
    margin: '10px 0',
    letterSpacing: '-0.05em',
  },
  heroMeaning: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
    fontSize: '14px',
  },
  questionBox: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px',
  },
  questionText: {
    color: '#fff8e7',
    fontSize: '22px',
    lineHeight: 1.25,
    margin: '10px 0 0',
    fontWeight: 900,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  metricCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
    minHeight: '144px',
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
    color: gold,
    fontSize: '32px',
    fontWeight: 950,
    lineHeight: 1,
    margin: '10px 0',
  },
  memoryCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(300px, 0.85fr)',
    gap: '24px',
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '14px',
  },
  memoryMetric: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
  },
  memoryMetricValue: {
    color: '#fff8e7',
    fontSize: '14px',
    lineHeight: 1.35,
    fontWeight: 900,
    margin: '8px 0 0',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  signalStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  signalCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '18px',
    minHeight: '136px',
  },
  signalValue: {
    color: gold,
    fontSize: '20px',
    lineHeight: 1.15,
    margin: '10px 0',
    fontWeight: 900,
    textTransform: 'capitalize',
  },
  card: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#fff8e7',
    fontSize: 'clamp(22px, 3vw, 30px)',
    lineHeight: 1.15,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  bodyText: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    fontSize: '13px',
    margin: 0,
  },
  priorityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
  },
  priorityItem: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
  },
  priorityBody: {
    color: '#fff8e7',
    lineHeight: 1.5,
    fontSize: '12px',
    margin: '8px 0 0',
    fontWeight: 700,
  },
  panel: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px',
    minHeight: '150px',
  },
  panelKicker: {
    color: mutedGold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  panelBody: {
    color: '#cfc7b5',
    fontSize: '13px',
    lineHeight: 1.6,
    marginTop: '10px',
  },
  emptyState: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    color: '#cfc7b5',
    lineHeight: 1.55,
    marginTop: '16px',
    fontSize: '13px',
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
    marginTop: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '920px',
  },
  th: {
    textAlign: 'left',
    color: mutedGold,
    borderBottom: `1px solid ${softLine}`,
    padding: '10px',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  td: {
    borderBottom: '1px solid rgba(214,178,94,0.12)',
    padding: '10px',
    color: '#e8dec8',
    verticalAlign: 'top',
    lineHeight: 1.5,
    fontSize: '12px',
  },
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '16px',
    color: '#e8dec8',
    lineHeight: 1.55,
    minHeight: '180px',
    fontSize: '12px',
    overflowX: 'auto',
  },
  primaryButton: {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    border: 'none',
    background: gold,
    color: '#11100d',
    fontWeight: 950,
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '18px',
  },
}