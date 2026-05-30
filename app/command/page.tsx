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
  updated_at?: string | null
}

type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
  created_at?: string | null
}

type CommandCaseRecord = {
  caseItem: CommandCase
  latestRecoveryReview?: OutcomeRecord
  recoveryDisposition: string
  recommendedMovement: string
  movementReason: string
  durabilityResult: string
  commandPosture: string
  recoveryConfidence: string
  memoryImpact: string
  reburnVisible: boolean
}

type CommandReading = {
  statusShort: string
  statusMeaning: string
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
  recommendedMovement: string
  movementReason: string
  evidenceGap: string
  recoveryCredibility: string
  memory: string
  persistence: string
  risk: string
  hasActiveCommandEvidence: boolean
  executiveBrief: {
    cases: string
    evidence: string
    action: string
  }
  continuityMemory: {
    continuityMemory: string
    lastCommandActivity: string
    lastEscalation: string
    lastRecoveryVerification: string
    lastExecutiveReview: string
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
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCommandCases()
  }, [])

  async function loadCommandCases() {
    setLoading(true)

    const [casesResult, outcomesResult] = await Promise.all([
      supabase
        .from('beneficiary_cases')
        .select('*')
        .in('support_domain', PRESSURE_TYPES)
        .in('case_status', COMMAND_VISIBLE_STATUSES)
        .order('created_at', { ascending: false }),
      supabase
        .from('case_outcomes')
        .select('*')
        .order('created_at', { ascending: false }),
    ])

    setCases(casesResult.error ? [] : casesResult.data || [])
    setOutcomes(outcomesResult.error ? [] : outcomesResult.data || [])

    if (casesResult.error) console.error(casesResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)

    setLoading(false)
  }

  const commandRecords = useMemo(
    () => buildCommandCaseRecords(cases, outcomes),
    [cases, outcomes],
  )

  const command = useMemo(
    () => buildCommandReading(commandRecords),
    [commandRecords],
  )

  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <main style={styles.page}>
          <div style={styles.container}>
            <section style={styles.header}>
              <p style={styles.kicker}>TSINAXA CGI • COMMAND</p>
              <h1 style={styles.title}>Command</h1>
              <p style={styles.subtitle}>
                Executive visibility for active lifecycle pressure, recovery
                fragility, command escalation, evidence return, and next governed
                movement.
              </p>
            </section>

            <section style={styles.commandStatus}>
              <div>
                <p style={styles.sectionKicker}>Command Status</p>
                <h2 style={styles.commandStatusTitle}>{command.statusShort}</h2>
                <p style={styles.bodyText}>{command.statusMeaning}</p>
              </div>

              <div style={styles.commandStatusGrid}>
                <BriefLine label="Cases" value={command.executiveBrief.cases} />
                <BriefLine label="Evidence" value={command.executiveBrief.evidence} />
                <BriefLine label="Action" value={command.executiveBrief.action} />
              </div>
            </section>

            <section style={styles.movementPanel}>
              <div>
                <p style={styles.sectionKicker}>Recommended Next Movement</p>
                <h2 style={styles.movementTitle}>{command.recommendedMovement}</h2>
                <p style={styles.bodyText}>{command.movementReason}</p>
              </div>

              <div style={styles.movementDoctrineBox}>
                <p style={styles.metricLabel}>Command Boundary</p>
                <p style={styles.movementDoctrineText}>
                  Command is not closure. Command decides whether instability
                  needs executive review, recovery watch, evidence return,
                  intervention return, or Stability Board absorption.
                </p>
              </div>
            </section>

            <section style={styles.signalGrid}>
              <Signal label="Pressure" value={command.pressureShort} />
              <Signal label="Trajectory" value={command.trajectoryShort} />
              <Signal label="Recovery" value={command.recoveryShort} />
              <Signal label="Reliability" value={command.reliabilityShort} />
              <Signal label="Survivability" value={command.survivabilityShort} />
            </section>

            <section style={styles.commandGrid}>
              <section style={styles.compactCard}>
                <p style={styles.sectionKicker}>Attribution</p>
                <h2 style={styles.compactTitle}>{command.attributionTitle}</h2>
                <p style={styles.bodyText}>{command.attributionMeaning}</p>

                {!loading && commandRecords.length > 0 && (
                  <div style={styles.caseList}>
                    {commandRecords.map((record) => (
                      <article key={record.caseItem.id} style={styles.caseCard}>
                        <p style={styles.caseIdentity}>
                          {record.caseItem.beneficiary_name}
                        </p>

                        <div style={styles.caseMetaGrid}>
                          <SmallMetric label="Pressure" value={record.caseItem.support_domain} />
                          <SmallMetric label="Status" value={record.caseItem.case_status} />
                          <SmallMetric label="Severity" value={record.caseItem.severity_level} />
                          <SmallMetric label="Area" value={record.caseItem.region || 'Not recorded'} />
                        </div>

                        {record.latestRecoveryReview && (
                          <div style={styles.recoveryMiniPanel}>
                            <SmallMetric label="Recovery Disposition" value={record.recoveryDisposition} />
                            <SmallMetric label="Command Posture" value={record.commandPosture} />
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section style={styles.compactCard}>
                <p style={styles.sectionKicker}>Command Visibility</p>
                <h2 style={styles.compactTitle}>{command.commandVisibility}</h2>
                <p style={styles.bodyText}>{command.commandAction}</p>

                <p style={styles.inlineRisk}>
                  Memory: {command.memory} • Persistence: {command.persistence} • Risk:{' '}
                  {command.risk}
                </p>
              </section>
            </section>

            {command.hasActiveCommandEvidence && (
              <section style={styles.twoColumnGrid}>
                <ExecutivePanel title="Evidence" body={command.evidenceGap} />
                <ExecutivePanel title="Recovery" body={command.recoveryCredibility} />
              </section>
            )}

            <section style={styles.memoryBoard}>
              <p style={styles.sectionKicker}>Continuity Memory</p>

              <div style={styles.memoryBoardGrid}>
                <MemoryLine label="Memory" value={command.continuityMemory.continuityMemory} />
                <MemoryLine label="Last Activity" value={command.continuityMemory.lastCommandActivity} />
                <MemoryLine label="Escalation" value={command.continuityMemory.lastEscalation} />
                <MemoryLine label="Recovery Review" value={command.continuityMemory.lastRecoveryVerification} />
                <MemoryLine label="Executive Review" value={command.continuityMemory.lastExecutiveReview} />
              </div>
            </section>

            <section style={styles.doctrineCard}>
              <strong>CONTINUITY CREDIBILITY GOVERNED</strong>
              <span>
                Visible recovery is not durable stabilization. Command preserves
                executive visibility until the next governed movement is clear.
              </span>
            </section>
          </div>
        </main>
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function buildCommandCaseRecords(
  cases: CommandCase[],
  outcomes: OutcomeRecord[],
): CommandCaseRecord[] {
  return cases.map((caseItem) => {
    const caseOutcomes = outcomes.filter(
      (outcome) => outcome.case_id === caseItem.id,
    )

    const latestRecoveryReview = caseOutcomes.find((outcome) =>
      isRecoverySummary(outcome.outcome_summary || ''),
    )

    const summary =
      latestRecoveryReview?.outcome_summary || caseItem.outcome_summary || ''

    const recoveryDisposition =
      extractField(summary, 'RECOVERY DISPOSITION') ||
      deriveDispositionFromCase(caseItem)

    const durabilityResult =
      extractField(summary, 'DURABILITY RESULT') ||
      latestRecoveryReview?.outcome_status ||
      'DURABILITY_UNRECORDED'

    const reburnSignal = extractField(summary, 'REBURN SIGNAL')

    return {
      caseItem,
      latestRecoveryReview,
      recoveryDisposition,
      recommendedMovement:
        extractField(summary, 'RECOMMENDED NEXT MOVEMENT') ||
        deriveRecommendedMovement(recoveryDisposition, caseItem),
      movementReason:
        extractField(summary, 'MOVEMENT REASON') ||
        deriveMovementReason(recoveryDisposition, caseItem),
      durabilityResult,
      commandPosture:
        extractField(summary, 'COMMAND POSTURE') ||
        deriveCommandPostureFromCase(caseItem),
      recoveryConfidence:
        extractField(summary, 'RECOVERY CONFIDENCE') ||
        'RECOVERY_CONFIDENCE_UNRECORDED',
      memoryImpact:
        extractField(summary, 'MEMORY IMPACT') ||
        deriveMemoryImpactFromCase(caseItem),
      reburnVisible:
        durabilityResult.includes('REBURN') ||
        reburnSignal.includes('REBURN') ||
        summary.includes('REBURN') ||
        caseItem.outcome_summary?.includes('REBURN') ||
        false,
    }
  })
}

function buildCommandReading(records: CommandCaseRecord[]): CommandReading {
  const total = records.length

  const commandEscalations = records.filter(
    (record) =>
      record.caseItem.case_status === 'TRIAGE_COMMAND_ESCALATION' ||
      record.caseItem.case_status.includes('ESCALATED') ||
      record.caseItem.safeguarding_flag ||
      record.recoveryDisposition === 'MOVE_TO_COMMAND_ESCALATION',
  ).length

  const commandWatch = records.filter(
    (record) => record.recoveryDisposition === 'MOVE_TO_COMMAND_WATCH',
  ).length

  const evidenceReturn = records.filter(
    (record) =>
      record.recoveryDisposition === 'RETURN_TO_OUTCOMES_REVIEW' ||
      record.recoveryDisposition === 'RETURN_TO_INTERVENTION_REVIEW' ||
      record.caseItem.case_status === 'EVIDENCE_REQUIRED_BEFORE_ROUTING' ||
      record.caseItem.case_status === 'OWNERSHIP_CLARITY_REQUIRED',
  ).length

  const stabilityReady = records.filter(
    (record) => record.recoveryDisposition === 'MOVE_TO_STABILITY_BOARD',
  ).length

  const highSeverity = records.filter(
    (record) =>
      record.caseItem.severity_level === 'HIGH' ||
      record.caseItem.severity_level === 'CRITICAL',
  ).length

  const recurrenceVisible = records.filter(
    (record) =>
      record.caseItem.case_status.includes('RECURRENCE') ||
      record.caseItem.case_status === 'REOPENED' ||
      record.caseItem.beneficiary_name.includes('ISSUE_REPEATED') ||
      record.caseItem.outcome_summary?.includes('RECURRENCE') ||
      record.caseItem.intervention_summary?.includes('RECURRENCE') ||
      record.reburnVisible,
  ).length

  const recoveryMonitoring = records.filter(
    (record) =>
      record.caseItem.case_status === 'RECOVERY_MONITORING' ||
      record.recoveryDisposition === 'CONTINUE_RECOVERY_MONITORING',
  ).length

  const latestCase = records[0]?.caseItem

  if (total === 0) {
    return {
      statusShort: 'CLEAR',
      statusMeaning: 'No active command-visible instability exists.',
      activeCaseCount: '0',
      evidenceShort: 'NONE',
      survivabilityShort: 'CLEAR',
      pressureShort: 'CLEAR',
      trajectoryShort: 'STABLE',
      recoveryShort: 'NONE',
      reliabilityShort: 'STABLE',
      attributionTitle: 'None active',
      attributionMeaning: 'No active lifecycle records are attributed to Command.',
      commandVisibility: 'Clear',
      commandAction:
        'No executive intervention is required. Command remains available if instability, recurrence, recovery fragility, or evidence gaps reappear.',
      recommendedMovement: 'Maintain Clear Command',
      movementReason:
        'No active command-attributed lifecycle records exist. Do not create artificial pressure.',
      evidenceGap: 'No active evidence gap.',
      recoveryCredibility: 'No active recovery concern.',
      memory: 'PRESERVED',
      persistence: 'NONE ACTIVE',
      risk: 'CLEAR',
      hasActiveCommandEvidence: false,
      executiveBrief: {
        cases: '0 active command-attributed cases',
        evidence: 'None required',
        action: 'No executive intervention',
      },
      continuityMemory: {
        continuityMemory: 'PRESERVED',
        lastCommandActivity: 'NONE ACTIVE',
        lastEscalation: 'NONE ACTIVE',
        lastRecoveryVerification: 'NONE ACTIVE',
        lastExecutiveReview: 'NONE REQUIRED',
      },
    }
  }

  if (commandEscalations > 0) {
    return elevatedReading(total, highSeverity, recurrenceVisible, recoveryMonitoring, latestCase)
  }

  if (evidenceReturn > 0) {
    return evidenceReturnReading(total, recoveryMonitoring, latestCase)
  }

  if (commandWatch > 0 || recurrenceVisible > 0 || highSeverity > 1) {
    return watchReading(total, highSeverity, recurrenceVisible, recoveryMonitoring, latestCase)
  }

  if (stabilityReady > 0) {
    return stabilityReadyReading(total, latestCase)
  }

  return watchReading(total, highSeverity, recurrenceVisible, recoveryMonitoring, latestCase)
}

function elevatedReading(
  total: number,
  highSeverity: number,
  recurrenceVisible: number,
  recoveryMonitoring: number,
  latestCase?: CommandCase,
): CommandReading {
  return {
    statusShort: 'ELEVATED',
    statusMeaning: 'Executive continuity review is required.',
    activeCaseCount: String(total),
    evidenceShort: 'REQUIRED',
    survivabilityShort: 'WATCH',
    pressureShort: highSeverity > 1 ? 'ELEVATED' : 'VISIBLE',
    trajectoryShort: recurrenceVisible > 0 ? 'UNSTABLE' : 'WATCH',
    recoveryShort: recoveryMonitoring > 0 ? 'MONITORING' : 'UNCONFIRMED',
    reliabilityShort: recurrenceVisible > 0 ? 'VARIABLE' : 'WATCH',
    attributionTitle: `${total} active record(s)`,
    attributionMeaning:
      'Active lifecycle evidence requires executive visibility before stability can be trusted.',
    commandVisibility: 'Executive review required',
    commandAction:
      'Do not allow escalated instability, reburn, or severe continuity pressure to move silently.',
    recommendedMovement: 'Move to Executive Center',
    movementReason:
      'Command escalation is visible. Leadership synthesis is required before any final stability absorption.',
    evidenceGap:
      'Ownership, action, outcome credibility, recurrence review, and durability evidence are required.',
    recoveryCredibility:
      recoveryMonitoring > 0
        ? 'Recovery monitoring is visible, but durability is unconfirmed.'
        : 'Recovery credibility is not yet established.',
    memory: recurrenceVisible > 0 ? 'RECURRENCE' : 'VISIBLE',
    persistence: recurrenceVisible > 0 ? 'PERSISTENT' : 'EMERGING',
    risk: 'WATCHED',
    hasActiveCommandEvidence: true,
    executiveBrief: {
      cases: `${total} command-attributed record(s)`,
      evidence: 'Executive evidence required',
      action: 'Require leadership synthesis',
    },
    continuityMemory: {
      continuityMemory: recurrenceVisible > 0 ? 'RECURRENCE' : 'VISIBLE',
      lastCommandActivity: latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'VISIBLE',
      lastRecoveryVerification:
        recoveryMonitoring > 0 ? 'MONITORING' : 'UNCONFIRMED',
      lastExecutiveReview: 'REQUIRED',
    },
  }
}

function evidenceReturnReading(
  total: number,
  recoveryMonitoring: number,
  latestCase?: CommandCase,
): CommandReading {
  return {
    statusShort: 'WATCH',
    statusMeaning:
      'Evidence or intervention review is required before stability can be trusted.',
    activeCaseCount: String(total),
    evidenceShort: 'REQUIRED',
    survivabilityShort: 'STABLE',
    pressureShort: 'VISIBLE',
    trajectoryShort: 'WATCH',
    recoveryShort: recoveryMonitoring > 0 ? 'MONITORING' : 'PENDING',
    reliabilityShort: 'VARIABLE',
    attributionTitle: `${total} active record(s)`,
    attributionMeaning:
      'Command visibility remains active because evidence or ownership is not yet strong enough.',
    commandVisibility: 'Evidence watch active',
    commandAction:
      'Return weak evidence to the appropriate operational review point before declaring durability.',
    recommendedMovement: 'Return to Outcomes or Interventions',
    movementReason:
      'Evidence, ownership, or stabilization credibility requires strengthening before recovery can mature.',
    evidenceGap: 'Evidence maturity is insufficient for durability confidence.',
    recoveryCredibility:
      'Recovery cannot become credible until evidence and intervention meaning are strengthened.',
    memory: 'VISIBLE',
    persistence: 'EMERGING',
    risk: 'MONITORED',
    hasActiveCommandEvidence: true,
    executiveBrief: {
      cases: `${total} command-attributed record(s)`,
      evidence: 'Evidence review required',
      action: 'Return to evidence or intervention review',
    },
    continuityMemory: {
      continuityMemory: 'VISIBLE',
      lastCommandActivity: latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'NONE CONCENTRATED',
      lastRecoveryVerification:
        recoveryMonitoring > 0 ? 'MONITORING' : 'PENDING',
      lastExecutiveReview: 'WATCH',
    },
  }
}

function watchReading(
  total: number,
  highSeverity: number,
  recurrenceVisible: number,
  recoveryMonitoring: number,
  latestCase?: CommandCase,
): CommandReading {
  return {
    statusShort: 'WATCH',
    statusMeaning: 'Proportional executive visibility remains active.',
    activeCaseCount: String(total),
    evidenceShort: 'MONITOR',
    survivabilityShort: 'STABLE',
    pressureShort: highSeverity > 1 ? 'ELEVATED' : 'VISIBLE',
    trajectoryShort: recurrenceVisible > 0 ? 'UNSTABLE' : 'STABLE',
    recoveryShort: recoveryMonitoring > 0 ? 'MONITORING' : 'PENDING',
    reliabilityShort: recurrenceVisible > 0 ? 'VARIABLE' : 'STABLE',
    attributionTitle: `${total} active record(s)`,
    attributionMeaning: 'Active lifecycle records remain under command watch.',
    commandVisibility: 'Watch active',
    commandAction:
      'Monitor without over-escalating, but do not allow fragile recovery to disappear.',
    recommendedMovement: 'Maintain Command Watch',
    movementReason:
      'Recovery, recurrence, or severity signals remain visible but do not yet require full escalation.',
    evidenceGap: 'Evidence remains important; no concentrated gap is visible.',
    recoveryCredibility:
      recoveryMonitoring > 0
        ? 'Recovery monitoring is active.'
        : 'Recovery credibility matures after verification.',
    memory: recurrenceVisible > 0 ? 'RECURRENCE' : 'VISIBLE',
    persistence: recurrenceVisible > 0 ? 'PERSISTENT' : 'EMERGING',
    risk: 'MONITORED',
    hasActiveCommandEvidence: true,
    executiveBrief: {
      cases: `${total} active command-attributed record(s)`,
      evidence: 'Monitor evidence maturity',
      action: 'Continue proportional visibility',
    },
    continuityMemory: {
      continuityMemory: recurrenceVisible > 0 ? 'RECURRENCE' : 'VISIBLE',
      lastCommandActivity: latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'NONE CONCENTRATED',
      lastRecoveryVerification:
        recoveryMonitoring > 0 ? 'MONITORING' : 'PENDING',
      lastExecutiveReview: 'WATCH',
    },
  }
}

function stabilityReadyReading(
  total: number,
  latestCase?: CommandCase,
): CommandReading {
  return {
    statusShort: 'CLEAR',
    statusMeaning:
      'Command does not need to hold the case. Stability Board absorption is available.',
    activeCaseCount: String(total),
    evidenceShort: 'PRESERVED',
    survivabilityShort: 'CLEAR',
    pressureShort: 'CLEARING',
    trajectoryShort: 'STABLE',
    recoveryShort: 'DURABLE',
    reliabilityShort: 'STABLE',
    attributionTitle: `${total} active record(s)`,
    attributionMeaning:
      'Durable recovery is visible and can move to institutional posture without memory loss.',
    commandVisibility: 'Release to Stability Board',
    commandAction:
      'Do not hold durable recovery in Command. Move to Stability Board while preserving recurrence and evidence memory.',
    recommendedMovement: 'Move to Stability Board',
    movementReason:
      'Recovery is durable enough for institutional absorption while memory remains preserved.',
    evidenceGap: 'No active evidence gap is driving command pressure.',
    recoveryCredibility:
      'Recovery credibility is durable enough for Stability Board absorption.',
    memory: 'PRESERVED',
    persistence: 'RESOLVED',
    risk: 'CLEARING',
    hasActiveCommandEvidence: true,
    executiveBrief: {
      cases: `${total} command-visible record(s)`,
      evidence: 'Preserved',
      action: 'Move to Stability Board',
    },
    continuityMemory: {
      continuityMemory: 'PRESERVED',
      lastCommandActivity: latestCase?.created_at || 'ACTIVE',
      lastEscalation: 'NONE CONCENTRATED',
      lastRecoveryVerification: 'DURABLE',
      lastExecutiveReview: 'NOT REQUIRED',
    },
  }
}

function deriveDispositionFromCase(caseItem: CommandCase) {
  if (
    caseItem.case_status === 'TRIAGE_COMMAND_ESCALATION' ||
    caseItem.case_status.includes('ESCALATED') ||
    caseItem.safeguarding_flag
  ) {
    return 'MOVE_TO_COMMAND_ESCALATION'
  }

  if (
    caseItem.case_status === 'EVIDENCE_REQUIRED_BEFORE_ROUTING' ||
    caseItem.case_status === 'OWNERSHIP_CLARITY_REQUIRED' ||
    caseItem.case_status === 'FOLLOW_UP_REQUIRED'
  ) {
    return 'RETURN_TO_OUTCOMES_REVIEW'
  }

  if (caseItem.case_status === 'RECOVERY_MONITORING') {
    return 'CONTINUE_RECOVERY_MONITORING'
  }

  return 'MOVE_TO_COMMAND_WATCH'
}

function deriveRecommendedMovement(disposition: string, caseItem: CommandCase) {
  if (disposition === 'MOVE_TO_STABILITY_BOARD') {
    return '/system Stability Board — absorb into institutional posture.'
  }

  if (disposition === 'MOVE_TO_COMMAND_ESCALATION') {
    return '/executive-center Executive Center — leadership synthesis required.'
  }

  if (disposition === 'RETURN_TO_OUTCOMES_REVIEW') {
    return '/outcomes Outcomes Review — evidence credibility requires strengthening.'
  }

  if (disposition === 'RETURN_TO_INTERVENTION_REVIEW') {
    return '/interventions Intervention Review — stabilization action requires review.'
  }

  if (disposition === 'CONTINUE_RECOVERY_MONITORING') {
    return '/recovery Recovery Monitoring — continue durability observation.'
  }

  if (caseItem.case_status === 'RECOVERY_MONITORING') {
    return '/recovery Recovery Monitoring — maintain durability watch.'
  }

  return '/command Command Watch — maintain executive visibility.'
}

function deriveMovementReason(disposition: string, caseItem: CommandCase) {
  if (disposition === 'MOVE_TO_STABILITY_BOARD') {
    return 'Recovery is durable enough for institutional absorption while memory remains preserved.'
  }

  if (disposition === 'MOVE_TO_COMMAND_ESCALATION') {
    return 'Escalation, safeguarding, reburn, or severe continuity pressure requires leadership synthesis.'
  }

  if (disposition === 'RETURN_TO_OUTCOMES_REVIEW') {
    return 'Evidence credibility requires strengthening before stability or durability can be trusted.'
  }

  if (disposition === 'RETURN_TO_INTERVENTION_REVIEW') {
    return 'Stabilization action requires review before recovery can mature.'
  }

  if (disposition === 'CONTINUE_RECOVERY_MONITORING') {
    return 'Recovery is holding but still needs durability observation.'
  }

  if (caseItem.case_status === 'RECOVERY_MONITORING') {
    return 'Recovery remains visible but not yet ready for institutional absorption.'
  }

  return 'Command visibility remains proportionate while the lifecycle continues.'
}

function deriveCommandPostureFromCase(caseItem: CommandCase) {
  if (
    caseItem.case_status === 'TRIAGE_COMMAND_ESCALATION' ||
    caseItem.case_status.includes('ESCALATED') ||
    caseItem.safeguarding_flag
  ) {
    return 'EXECUTIVE_CONTINUITY_REVIEW'
  }

  if (
    caseItem.case_status === 'RECOVERY_MONITORING' ||
    caseItem.case_status === 'FOLLOW_UP_REQUIRED'
  ) {
    return 'ELEVATED_RECOVERY_REVIEW'
  }

  return 'COMMAND_WATCH'
}

function deriveMemoryImpactFromCase(caseItem: CommandCase) {
  if (
    caseItem.case_status.includes('RECURRENCE') ||
    caseItem.case_status === 'REOPENED' ||
    caseItem.outcome_summary?.includes('RECURRENCE') ||
    caseItem.intervention_summary?.includes('RECURRENCE')
  ) {
    return 'CONTINUITY_MEMORY_VISIBLE'
  }

  return 'STRUCTURAL_MEMORY_PRESERVED'
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

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.signalCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.signalValue}>{value}</p>
    </article>
  )
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.smallMetric}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
    </article>
  )
}

function ExecutivePanel({ title, body }: { title: string; body: string }) {
  return (
    <article style={styles.panelCard}>
      <p style={styles.sectionKicker}>{title}</p>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function BriefLine({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.briefLine}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.briefValue}>{value}</p>
    </article>
  )
}

function MemoryLine({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.memoryLine}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.memoryValue}>{value}</p>
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
    padding: '8px 24px 48px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '14px',
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
  subtitle: {
    color: '#cfc7b5',
    maxWidth: '760px',
    lineHeight: 1.5,
    fontSize: '13px',
    margin: 0,
  },
  commandStatus: {
    display: 'grid',
    gridTemplateColumns: '260px minmax(0, 1fr)',
    gap: '14px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '15px',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  commandStatusTitle: {
    color: '#fff8e7',
    fontSize: '32px',
    lineHeight: 1,
    margin: '7px 0',
    letterSpacing: '-0.05em',
  },
  commandStatusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '10px',
  },
  movementPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.3fr) minmax(260px, 0.7fr)',
    gap: '14px',
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '15px',
    marginBottom: '12px',
    boxSizing: 'border-box',
  },
  movementTitle: {
    color: gold,
    fontSize: 'clamp(22px, 3vw, 32px)',
    lineHeight: 1.05,
    margin: '7px 0',
    letterSpacing: '-0.04em',
  },
  movementDoctrineBox: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '13px',
    padding: '12px',
  },
  movementDoctrineText: {
    color: '#fff8e7',
    fontSize: '12px',
    lineHeight: 1.45,
    fontWeight: 750,
    margin: '6px 0 0',
  },
  signalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '12px',
  },
  signalCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '13px',
    padding: '11px 12px',
  },
  signalValue: {
    color: gold,
    fontSize: '16px',
    fontWeight: 950,
    margin: '4px 0 0',
  },
  commandGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '12px',
    marginBottom: '12px',
  },
  compactCard: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '15px',
    padding: '14px',
    minHeight: '88px',
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
    fontSize: 'clamp(18px, 2vw, 22px)',
    lineHeight: 1.1,
    margin: '6px 0',
    letterSpacing: '-0.04em',
  },
  bodyText: {
    color: '#cfc7b5',
    lineHeight: 1.42,
    fontSize: '13px',
    margin: 0,
  },
  inlineRisk: {
    marginTop: '10px',
    color: '#fff8e7',
    fontSize: '11px',
    fontWeight: 850,
  },
  memoryBoard: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '15px',
    padding: '14px',
    marginBottom: '12px',
  },
  memoryBoardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '10px',
    marginTop: '10px',
  },
  memoryLine: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '11px',
    padding: '10px',
    minHeight: '64px',
  },
  memoryValue: {
    color: '#fff8e7',
    fontSize: '13px',
    fontWeight: 900,
    lineHeight: 1.25,
    margin: '5px 0 0',
  },
  smallMetric: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '11px',
    padding: '8px',
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
    fontSize: '13px',
    lineHeight: 1.15,
    fontWeight: 900,
    margin: '4px 0 0',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '12px',
  },
  panelCard: {
    background: '#100f0d',
    border: `1px solid ${softLine}`,
    borderRadius: '13px',
    padding: '12px',
    minHeight: '70px',
  },
  panelBody: {
    color: '#cfc7b5',
    lineHeight: 1.4,
    fontSize: '12px',
    margin: '6px 0 0',
  },
  briefLine: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '11px',
    padding: '10px',
  },
  briefValue: {
    color: '#fff8e7',
    fontSize: '13px',
    fontWeight: 800,
    lineHeight: 1.3,
    margin: '4px 0 0',
  },
  doctrineCard: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '13px',
    padding: '11px 14px',
    color: '#e8dec8',
    fontSize: '13px',
    lineHeight: 1.4,
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
  recoveryMiniPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
    marginTop: '8px',
  },
}