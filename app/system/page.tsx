'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  deriveCommandActionPosture,
  deriveCommandImplication,
  deriveCommandPosture,
  explainCommandPosture,
  type CGICommandPosture,
} from '@/lib/cgi/deriveCommandPosture'
import { combineExecutiveActions } from '@/lib/cgi/interpreters/combineExecutiveActions'
import { interpretBottleneck } from '@/lib/cgi/interpreters/interpretBottleneck'
import { interpretPredictive } from '@/lib/cgi/interpreters/interpretPredictive'
import { interpretPressure } from '@/lib/cgi/interpreters/interpretPressure'
import { interpretRecovery } from '@/lib/cgi/interpreters/interpretRecovery'
import { interpretReliability } from '@/lib/cgi/interpreters/interpretReliability'
import { interpretTrajectory } from '@/lib/cgi/interpreters/interpretTrajectory'
import { supabase } from '../../lib/supabase'

type CgiOperationalMetric = {
  id: string
  created_at: string
  scope: string
  continuity_integrity_score: number
  stabilization_confidence_score: number
  escalation_pressure_index: number
  recovery_reliability_score: number
  operational_survivability_score: number
  continuity_state: string
  propagation_risk: number
  routing_friction: number
  responder_pressure: number
  escalation_velocity: number
  coordination_instability: number
  stabilization_drag: number
  pressure_propagation_state: string
  trajectory_risk: number
  continuity_drift: number
  escalation_momentum: number
  recovery_direction: number
  stabilization_trend: number
  unresolved_momentum: number
  trajectory_direction: string
  structural_memory_risk: number
  routing_failure_recurrence: number
  escalation_corridor_recurrence: number
  institutional_fragility_signature: number
  intervention_failure_pattern: number
  responder_strain_recurrence: number
  continuity_collapse_recurrence: number
  structural_memory_state: string
  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
  executive_summary: string | null
  action_cue: string | null
  executive_priority_score: number | null
  survivability_threat_level: string | null
  executive_action_urgency: string | null
  structural_deterioration_state: string | null
  executive_action_deadline: string | null
}

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

type InterpretiveThreshold =
  | 'CONTAINED'
  | 'WATCHABLE'
  | 'DESTABILIZING'
  | 'SURVIVABILITY THREAT'

type StabilityAbsorptionClass =
  | 'STABILITY_ABSORBABLE'
  | 'STABILITY_WATCH'
  | 'COMMAND_PRESSURE'
  | 'EVIDENCE_RETURN'
  | 'RECOVERY_MONITORING'
  | 'NO_RECOVERY_MEMORY'

type StabilityBoardRecord = {
  caseItem: StabilityCase
  latestRecoveryReview?: OutcomeRecord
  recoveryDisposition: string
  recommendedMovement: string
  movementReason: string
  recoveryMaturity: string
  commandPosture: string
  durabilityResult: string
  reburnSignal: string
  recoveryConfidence: string
  memoryImpact: string
  absorptionClass: StabilityAbsorptionClass
  stabilityMeaning: string
}

type StabilityBoardSummary = {
  totalRecords: number
  absorbable: number
  watch: number
  commandPressure: number
  evidenceReturn: number
  recoveryMonitoring: number
  activeInstability: number
  stabilized: number
  fragileRecovery: number
  unresolvedCommandPressure: number
  memoryPreserved: number
  currentLifecycleClear: boolean
  boardPosture: string
  boardMeaning: string
}

type InterpretiveBoard = {
  latest: CgiOperationalMetric
  commandPosture: CGICommandPosture
  commandMeaning: string
  executiveImplication: string
  actionPosture: string
  actionDeadline: string
  actionCue: string
  pressureThreshold: InterpretiveThreshold
  trajectoryThreshold: InterpretiveThreshold
  survivabilityThreshold: InterpretiveThreshold
  memoryThreshold: InterpretiveThreshold
  recoveryThreshold: InterpretiveThreshold
  survivabilityInterpretation: string
  structuralPattern: string
}

const SAMPLE_LIMIT = 80
const CASE_SAMPLE_LIMIT = 120

const DOCTRINE = [
  'Current lifecycle truth overrides old metrics.',
  'Final posture must be absorbed, not hidden.',
  'Recovery is not durability.',
  'Memory must survive stabilization.',
]

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

export default function SystemPage() {
  return (
    <CGIGovernanceShell>
      <ExecutiveStabilityBoard />
    </CGIGovernanceShell>
  )
}

function ExecutiveStabilityBoard() {
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [cases, setCases] = useState<StabilityCase[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadStabilityBoard()
  }, [])

  async function loadStabilityBoard() {
    setMessage('Loading Stability Board continuity posture...')

    const [metricsResult, casesResult, outcomesResult] = await Promise.all([
      supabase
        .from('cgi_operational_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(SAMPLE_LIMIT),
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
    ])

    if (metricsResult.error) console.error(metricsResult.error)
    if (casesResult.error) console.error(casesResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)

    if (metricsResult.error || casesResult.error || outcomesResult.error) {
      setMessage('Some Stability Board intelligence failed to load.')
      return
    }

    setMetrics(metricsResult.data || [])
    setCases(casesResult.data || [])
    setOutcomes(outcomesResult.data || [])
    setMessage('Stability Board continuity posture loaded.')
  }

  const historicalBoard = useMemo(() => {
    const latest = metrics[0]
    if (!latest) return null
    return buildInterpretiveBoard(latest)
  }, [metrics])

  const stabilityRecords = useMemo(
    () => buildStabilityBoardRecords(cases, outcomes),
    [cases, outcomes],
  )

  const stabilitySummary = useMemo(
    () => buildStabilityBoardSummary(cases, stabilityRecords),
    [cases, stabilityRecords],
  )

  const shouldShowCurrentExecutiveReading =
    Boolean(historicalBoard) && !stabilitySummary.currentLifecycleClear

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • STABILITY BOARD</p>
          <h1 style={styles.title}>System Stability Board</h1>
          <p style={styles.enterpriseSubtitle}>
            Institutional Stability Posture
          </p>
          <p style={styles.subtitle}>
            Absorb recovered instability into institutional posture while
            preserving memory, recurrence, and unresolved risk.
          </p>

          <section style={styles.doctrinePanel}>
            <p style={styles.doctrineTitle}>STABILITY BOARD DOCTRINE</p>
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

        <section style={styles.stabilityPanel}>
          <div>
            <p style={styles.panelEyebrow}>Current Institutional Stability Posture</p>
            <h2 style={styles.stabilityPosture}>
              {stabilitySummary.boardPosture}
            </h2>
            <p style={styles.commandMeaning}>{stabilitySummary.boardMeaning}</p>
          </div>

          <div style={styles.implicationBox}>
            <p style={styles.panelEyebrow}>Board Function</p>
            <p style={styles.implicationText}>
              /system is the current Stability Board. Historical metrics remain
              visible as memory, but they do not create current command pressure
              when active lifecycle records are clear.
            </p>
          </div>
        </section>

        <section style={styles.metricGrid}>
          <MetricCard
            label="Active Instability"
            value={stabilitySummary.activeInstability}
            text="Cases that still carry active lifecycle pressure."
          />
          <MetricCard
            label="Stabilized"
            value={stabilitySummary.stabilized}
            text="Cases currently marked as stabilized."
          />
          <MetricCard
            label="Fragile Recovery"
            value={stabilitySummary.fragileRecovery}
            text="Recovery records requiring watch, monitoring, or return review."
          />
          <MetricCard
            label="Command Pressure"
            value={stabilitySummary.unresolvedCommandPressure}
            text="Current lifecycle records requiring command watch or escalation."
          />
        </section>

        {stabilitySummary.currentLifecycleClear && (
          <section style={styles.memoryOnlyPanel}>
            <p style={styles.panelEyebrow}>Institutional Memory Status</p>
            <h2 style={styles.memoryOnlyTitle}>MEMORY PRESERVED</h2>
            <p style={styles.bodyText}>
              Current lifecycle posture is clear. Historical operational metrics
              remain preserved for institutional learning, but they are not
              allowed to override the current Stability Board posture.
            </p>
          </section>
        )}

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Stability Absorption Summary</h2>
          <p style={styles.bodyText}>
            The Stability Board answers whether recovery can be institutionally
            absorbed, whether it remains fragile, whether command pressure is
            unresolved, whether evidence must return to Outcomes or
            Interventions, and what memory must not be forgotten.
          </p>

          <div style={styles.absorptionGrid}>
            <AbsorptionBlock
              label="Absorbable"
              value={stabilitySummary.absorbable}
              text="Durable recovery can move into institutional posture."
            />
            <AbsorptionBlock
              label="Watch"
              value={stabilitySummary.watch}
              text="Recovery remains visible but not fully escalated."
            />
            <AbsorptionBlock
              label="Command"
              value={stabilitySummary.commandPressure}
              text="Command watch or escalation remains unresolved."
            />
            <AbsorptionBlock
              label="Evidence Return"
              value={stabilitySummary.evidenceReturn}
              text="Evidence or intervention credibility requires review."
            />
            <AbsorptionBlock
              label="Monitoring"
              value={stabilitySummary.recoveryMonitoring}
              text="Durability observation continues."
            />
            <AbsorptionBlock
              label="Memory Preserved"
              value={stabilitySummary.memoryPreserved}
              text="Structural memory remains visible in recovery evidence."
            />
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Recovery-to-Stability Board</h2>
          <p style={styles.bodyText}>
            These records are inherited from recovery durability evidence. The
            Stability Board preserves disposition, reason, command posture,
            recurrence signal, and memory impact.
          </p>

          {stabilityRecords.length === 0 && (
            <div style={styles.emptyState}>
              No recovery durability records are currently available for
              Stability Board absorption. Current lifecycle posture remains clean.
            </div>
          )}

          {stabilityRecords.length > 0 && (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Case</th>
                    <th style={styles.th}>Disposition</th>
                    <th style={styles.th}>Absorption Class</th>
                    <th style={styles.th}>Command Posture</th>
                    <th style={styles.th}>Durability</th>
                    <th style={styles.th}>Board Meaning</th>
                  </tr>
                </thead>

                <tbody>
                  {stabilityRecords.slice(0, 18).map((record) => (
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
                      <td style={styles.td}>{record.recoveryDisposition}</td>
                      <td style={styles.td}>{record.absorptionClass}</td>
                      <td style={styles.td}>{record.commandPosture}</td>
                      <td style={styles.td}>
                        {record.durabilityResult}
                        <br />
                        {record.reburnSignal}
                      </td>
                      <td style={styles.td}>{record.stabilityMeaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {shouldShowCurrentExecutiveReading && historicalBoard && (
          <>
            <section style={styles.commandPanel}>
              <div>
                <p style={styles.panelEyebrow}>Current Executive Continuity Reading</p>
                <h2 style={styles.commandPosture}>
                  {historicalBoard.commandPosture}
                </h2>
                <p style={styles.commandMeaning}>
                  {historicalBoard.commandMeaning}
                </p>
              </div>

              <div style={styles.implicationBox}>
                <p style={styles.panelEyebrow}>Executive Implication</p>
                <p style={styles.implicationText}>
                  {historicalBoard.executiveImplication}
                </p>
              </div>
            </section>

            <section style={styles.interpretiveGrid}>
              <InterpretivePanel
                title="Pressure Meaning"
                threshold={historicalBoard.pressureThreshold}
                text={
                  historicalBoard.latest.dominant_pressure_source ||
                  'No dominant pressure source recorded.'
                }
              />
              <InterpretivePanel
                title="Trajectory Meaning"
                threshold={historicalBoard.trajectoryThreshold}
                text={
                  historicalBoard.latest.dominant_trajectory_signal ||
                  'No dominant trajectory signal recorded.'
                }
              />
              <InterpretivePanel
                title="Survivability Meaning"
                threshold={historicalBoard.survivabilityThreshold}
                text={historicalBoard.survivabilityInterpretation}
              />
              <InterpretivePanel
                title="Structural Memory"
                threshold={historicalBoard.memoryThreshold}
                text={historicalBoard.structuralPattern}
              />
            </section>

            <section style={styles.actionPanel}>
              <div>
                <p style={styles.panelEyebrow}>Executive Action Requirement</p>
                <h2 style={styles.actionThreshold}>{historicalBoard.actionPosture}</h2>
                <p style={styles.bodyText}>{historicalBoard.actionCue}</p>
              </div>

              <div style={styles.deadlineBox}>
                <p style={styles.panelEyebrow}>Action Window</p>
                <strong>{historicalBoard.actionDeadline}</strong>
              </div>
            </section>

            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>Why This Posture Was Reached</h2>
              <div style={styles.reasonGrid}>
                <ReasonBlock
                  label="Pressure posture"
                  value={historicalBoard.pressureThreshold}
                  text={explainPressure(historicalBoard)}
                />
                <ReasonBlock
                  label="Recovery posture"
                  value={historicalBoard.recoveryThreshold}
                  text={explainRecovery(historicalBoard)}
                />
                <ReasonBlock
                  label="Survivability posture"
                  value={historicalBoard.survivabilityThreshold}
                  text={explainSurvivability(historicalBoard)}
                />
                <ReasonBlock
                  label="Structural recurrence"
                  value={historicalBoard.memoryThreshold}
                  text={explainMemory(historicalBoard)}
                />
              </div>
            </section>
          </>
        )}

        {!historicalBoard && (
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>No continuity metrics available yet.</h2>
            <p style={styles.bodyText}>
              Stability Board absorption can still read lifecycle records. The
              historical metric layer will activate when governed snapshots are
              available.
            </p>
          </section>
        )}

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Historical Stability Memory Trail</h2>
          <p style={styles.bodyText}>
            These rows are historical memory. They preserve prior snapshots for
            learning and audit, but they do not override current lifecycle truth
            when the Stability Board is clear.
          </p>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Historical Posture</th>
                  <th style={styles.th}>Recovery Memory</th>
                  <th style={styles.th}>Structural Memory</th>
                  <th style={styles.th}>Historical Readiness</th>
                  <th style={styles.th}>Memory Interpretation</th>
                </tr>
              </thead>

              <tbody>
                {metrics.slice(0, 12).map((item) => {
                  const row = buildInterpretiveBoard(item)

                  return (
                    <tr key={item.id}>
                      <td style={styles.td}>{formatDate(item.created_at)}</td>
                      <td style={styles.td}>{row.commandPosture}</td>
                      <td style={styles.td}>{row.recoveryThreshold}</td>
                      <td style={styles.td}>{row.memoryThreshold}</td>
                      <td style={styles.td}>{row.actionPosture}</td>
                      <td style={styles.td}>{row.commandMeaning}</td>
                    </tr>
                  )
                })}

                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No historical metric memory trail currently available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button onClick={loadStabilityBoard} style={styles.primaryButton}>
            Refresh Stability Board
          </button>
        </section>
      </div>
    </main>
  )
}

function buildStabilityBoardRecords(
  cases: StabilityCase[],
  outcomes: OutcomeRecord[],
): StabilityBoardRecord[] {
  const records: StabilityBoardRecord[] = []

  cases.forEach((caseItem) => {
    const caseOutcomes = outcomes.filter(
      (outcome) => outcome.case_id === caseItem.id,
    )

    const latestRecoveryReview = caseOutcomes.find((outcome) =>
      isRecoveryReview(outcome),
    )

    const summary =
      latestRecoveryReview?.outcome_summary || caseItem.outcome_summary || ''

    if (!summary || !isRecoverySummary(summary)) return

    const recoveryDisposition =
      extractField(summary, 'RECOVERY DISPOSITION') ||
      deriveDispositionFromLegacySummary(summary)

    const recommendedMovement =
      extractField(summary, 'RECOMMENDED NEXT MOVEMENT') ||
      deriveLegacyMovement(recoveryDisposition)

    const movementReason =
      extractField(summary, 'MOVEMENT REASON') ||
      'Movement reason was not explicitly preserved.'

    const recoveryMaturity =
      extractField(summary, 'RECOVERY MATURITY') || 'RECOVERY_MATURITY_UNRECORDED'

    const commandPosture =
      extractField(summary, 'COMMAND POSTURE') || 'COMMAND_POSTURE_UNRECORDED'

    const durabilityResult =
      extractField(summary, 'DURABILITY RESULT') ||
      latestRecoveryReview?.outcome_status ||
      'DURABILITY_UNRECORDED'

    const reburnSignal =
      extractField(summary, 'REBURN SIGNAL') || 'REBURN_SIGNAL_UNRECORDED'

    const recoveryConfidence =
      extractField(summary, 'RECOVERY CONFIDENCE') ||
      'RECOVERY_CONFIDENCE_UNRECORDED'

    const memoryImpact =
      extractField(summary, 'MEMORY IMPACT') || 'MEMORY_IMPACT_UNRECORDED'

    const absorptionClass = deriveAbsorptionClass(recoveryDisposition)

    records.push({
      caseItem,
      latestRecoveryReview,
      recoveryDisposition,
      recommendedMovement,
      movementReason,
      recoveryMaturity,
      commandPosture,
      durabilityResult,
      reburnSignal,
      recoveryConfidence,
      memoryImpact,
      absorptionClass,
      stabilityMeaning: deriveStabilityMeaning(absorptionClass),
    })
  })

  return records
}

function buildStabilityBoardSummary(
  cases: StabilityCase[],
  records: StabilityBoardRecord[],
): StabilityBoardSummary {
  const activeInstability = cases.filter((caseItem) =>
    ACTIVE_CASE_STATUSES.includes(caseItem.case_status),
  ).length

  const stabilized = cases.filter(
    (caseItem) => caseItem.case_status === 'STABILIZED',
  ).length

  const absorbable = records.filter(
    (record) => record.absorptionClass === 'STABILITY_ABSORBABLE',
  ).length

  const watch = records.filter(
    (record) => record.absorptionClass === 'STABILITY_WATCH',
  ).length

  const commandPressure = records.filter(
    (record) => record.absorptionClass === 'COMMAND_PRESSURE',
  ).length

  const evidenceReturn = records.filter(
    (record) => record.absorptionClass === 'EVIDENCE_RETURN',
  ).length

  const recoveryMonitoring = records.filter(
    (record) => record.absorptionClass === 'RECOVERY_MONITORING',
  ).length

  const memoryPreserved = records.filter(
    (record) =>
      record.memoryImpact.includes('MEMORY') ||
      record.memoryImpact.includes('STRUCTURAL'),
  ).length

  const fragileRecovery = watch + evidenceReturn + recoveryMonitoring

  const currentLifecycleClear =
    activeInstability === 0 &&
    records.length === 0 &&
    commandPressure === 0 &&
    evidenceReturn === 0 &&
    fragileRecovery === 0

  let boardPosture = 'STABILITY BOARD CLEAR'
  let boardMeaning =
    'No active final-posture pressure is currently visible. Stability Board remains available for lifecycle absorption.'

  if (commandPressure > 0) {
    boardPosture = 'COMMAND PRESSURE UNRESOLVED'
    boardMeaning =
      'One or more recovery records still require Command Watch or Command Escalation. Stability cannot absorb these cases as closure.'
  } else if (evidenceReturn > 0) {
    boardPosture = 'EVIDENCE RETURN REQUIRED'
    boardMeaning =
      'One or more recovery records require Outcomes or Intervention review before final posture can be trusted.'
  } else if (fragileRecovery > 0) {
    boardPosture = 'FRAGILE RECOVERY VISIBLE'
    boardMeaning =
      'Recovery is visible but not fully absorbable. Stability Board must preserve fragility until durability matures.'
  } else if (absorbable > 0) {
    boardPosture = 'STABILITY ABSORPTION READY'
    boardMeaning =
      'Durable recovery evidence is available for institutional absorption while structural memory remains preserved.'
  } else if (activeInstability > 0) {
    boardPosture = 'ACTIVE INSTABILITY PRESENT'
    boardMeaning =
      'Active lifecycle instability remains visible. Stability Board should not express final closure.'
  }

  return {
    totalRecords: records.length,
    absorbable,
    watch,
    commandPressure,
    evidenceReturn,
    recoveryMonitoring,
    activeInstability,
    stabilized,
    fragileRecovery,
    unresolvedCommandPressure: commandPressure,
    memoryPreserved,
    currentLifecycleClear,
    boardPosture,
    boardMeaning,
  }
}

function isRecoveryReview(outcome: OutcomeRecord) {
  return isRecoverySummary(outcome.outcome_summary || '')
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

function deriveDispositionFromLegacySummary(summary: string) {
  const durabilityResult = extractField(summary, 'DURABILITY RESULT')
  const confidence = extractField(summary, 'RECOVERY CONFIDENCE')
  const reburnSignal = extractField(summary, 'REBURN SIGNAL')

  if (
    durabilityResult === 'RECOVERY_COLLAPSE' ||
    durabilityResult === 'REBURN_DETECTED' ||
    reburnSignal === 'REBURN_DETECTED' ||
    reburnSignal === 'RECURRENT_REBURN_PATTERN'
  ) {
    return 'MOVE_TO_COMMAND_ESCALATION'
  }

  if (durabilityResult === 'DURABLE_RECOVERY_CONFIRMED') {
    return 'MOVE_TO_STABILITY_BOARD'
  }

  if (confidence === 'LOW') {
    return 'RETURN_TO_INTERVENTION_REVIEW'
  }

  if (
    durabilityResult === 'RECOVERY_HOLDING' ||
    durabilityResult === 'STABILITY_UNDER_VARIANCE'
  ) {
    return 'MOVE_TO_COMMAND_WATCH'
  }

  return 'CONTINUE_RECOVERY_MONITORING'
}

function deriveLegacyMovement(disposition: string) {
  if (disposition === 'MOVE_TO_STABILITY_BOARD') {
    return '/system Stability Board — absorb into institutional continuity posture.'
  }

  if (disposition === 'MOVE_TO_COMMAND_ESCALATION') {
    return '/command Command Escalation — executive continuity review required.'
  }

  if (disposition === 'MOVE_TO_COMMAND_WATCH') {
    return '/command Command Watch — preserve executive visibility without full escalation.'
  }

  if (disposition === 'RETURN_TO_OUTCOMES_REVIEW') {
    return '/outcomes Outcomes Review — verification evidence requires strengthening.'
  }

  if (disposition === 'RETURN_TO_INTERVENTION_REVIEW') {
    return '/interventions Intervention Review — stabilization action requires renewed review.'
  }

  return '/recovery Recovery Monitoring — continue durability observation.'
}

function deriveAbsorptionClass(disposition: string): StabilityAbsorptionClass {
  if (disposition === 'MOVE_TO_STABILITY_BOARD') {
    return 'STABILITY_ABSORBABLE'
  }

  if (
    disposition === 'MOVE_TO_COMMAND_ESCALATION' ||
    disposition === 'MOVE_TO_COMMAND_WATCH'
  ) {
    return 'COMMAND_PRESSURE'
  }

  if (
    disposition === 'RETURN_TO_OUTCOMES_REVIEW' ||
    disposition === 'RETURN_TO_INTERVENTION_REVIEW'
  ) {
    return 'EVIDENCE_RETURN'
  }

  if (disposition === 'CONTINUE_RECOVERY_MONITORING') {
    return 'RECOVERY_MONITORING'
  }

  return 'NO_RECOVERY_MEMORY'
}

function deriveStabilityMeaning(absorptionClass: StabilityAbsorptionClass) {
  switch (absorptionClass) {
    case 'STABILITY_ABSORBABLE':
      return 'Durable recovery can be absorbed into institutional posture without erasing memory.'
    case 'STABILITY_WATCH':
      return 'Stability remains watchable and should not be treated as closure.'
    case 'COMMAND_PRESSURE':
      return 'Command pressure remains unresolved and must stay visible.'
    case 'EVIDENCE_RETURN':
      return 'Evidence or intervention credibility requires return review before stability can be trusted.'
    case 'RECOVERY_MONITORING':
      return 'Recovery remains under durability observation.'
    default:
      return 'No recovery memory is currently available for absorption.'
  }
}

function buildInterpretiveBoard(latest: CgiOperationalMetric): InterpretiveBoard {
  const centralizedPressure = interpretPressure({
    escalationPressure: latest.escalation_pressure_index,
    propagationRisk: latest.propagation_risk,
    unresolvedMomentum: latest.unresolved_momentum,
    continuityDrift: latest.continuity_drift,
  })

  const centralizedTrajectory = interpretTrajectory({
    trajectoryRisk: latest.trajectory_risk,
    continuityDrift: latest.continuity_drift,
    unresolvedMomentum: latest.unresolved_momentum,
    survivabilityRisk: 100 - latest.operational_survivability_score,
  })

  const centralizedRecovery = interpretRecovery({
    stabilizationConfidence: latest.stabilization_confidence_score,
    recoveryReliability: latest.recovery_reliability_score,
    survivabilityScore: latest.operational_survivability_score,
    continuityDrift: latest.continuity_drift,
    unresolvedMomentum: latest.unresolved_momentum,
  })

  const centralizedPredictive = interpretPredictive({
    propagationRisk: latest.propagation_risk,
    trajectoryRisk: latest.trajectory_risk,
    structuralMemoryRisk: latest.structural_memory_risk,
    unresolvedMomentum: latest.unresolved_momentum,
    stabilizationDrag: latest.stabilization_drag,
  })

  const centralizedBottleneck = interpretBottleneck({
    routingCongestion: latest.routing_friction,
    responderConcentration: latest.responder_pressure,
    unresolvedMomentum: latest.unresolved_momentum,
    continuityDrift: latest.continuity_drift,
    propagationRisk: latest.propagation_risk,
  })

  const recurrenceRate =
    average([
      latest.routing_failure_recurrence,
      latest.escalation_corridor_recurrence,
      latest.intervention_failure_pattern,
      latest.continuity_collapse_recurrence,
    ]) / 100

  const centralizedReliability = interpretReliability({
    unresolvedCases: Math.round(latest.unresolved_momentum / 10),
    overdueCases: Math.round(latest.routing_friction / 10),
    failedRecoveries: Math.round(latest.intervention_failure_pattern / 10),
    recurrenceRate,
  })

  const commandPosture = deriveCommandPosture({
    pressureSeverity: centralizedPressure.severity,
    trajectorySeverity: centralizedTrajectory.severity,
    recoverySeverity: centralizedRecovery.severity,
    predictiveSeverity: centralizedPredictive.severity,
    bottleneckSeverity: centralizedBottleneck.severity,
    reliabilitySeverity: centralizedReliability.severity,
  })

  return {
    latest,
    commandPosture,
    commandMeaning: explainCommandPosture(commandPosture),
    executiveImplication: deriveCommandImplication(commandPosture),
    actionPosture: deriveCommandActionPosture(commandPosture),
    actionDeadline: latest.executive_action_deadline || 'Next governance cycle',
    actionCue: combineExecutiveActions([
      centralizedPressure.executiveAction,
      centralizedTrajectory.executiveAction,
      centralizedRecovery.executiveAction,
      centralizedPredictive.executiveAction,
      centralizedBottleneck.executiveAction,
      centralizedReliability.executiveAction,
    ]),
    pressureThreshold: severityToThreshold(centralizedPressure.severity),
    trajectoryThreshold: severityToThreshold(centralizedTrajectory.severity),
    survivabilityThreshold: severityToThreshold(centralizedRecovery.severity),
    memoryThreshold: severityToThreshold(centralizedPredictive.severity),
    recoveryThreshold: severityToThreshold(centralizedReliability.severity),
    survivabilityInterpretation: centralizedRecovery.summary,
    structuralPattern:
      latest.dominant_memory_pattern || centralizedPredictive.summary,
  }
}

function explainPressure(board: InterpretiveBoard) {
  if (board.pressureThreshold === 'SURVIVABILITY THREAT') {
    return 'Pressure is threatening operational survivability.'
  }

  if (board.pressureThreshold === 'DESTABILIZING') {
    return 'Pressure is intensifying and requires governance attention.'
  }

  if (board.pressureThreshold === 'WATCHABLE') {
    return 'Pressure remains visible and should continue under review.'
  }

  return 'Pressure is currently contained.'
}

function explainRecovery(board: InterpretiveBoard) {
  if (board.recoveryThreshold === 'SURVIVABILITY THREAT') {
    return 'Recovery credibility is weak and should not support closure.'
  }

  if (board.recoveryThreshold === 'DESTABILIZING') {
    return 'Recovery remains fragile and requires stabilization reinforcement.'
  }

  if (board.recoveryThreshold === 'WATCHABLE') {
    return 'Recovery is visible but durability still requires confirmation.'
  }

  return 'Recovery posture is currently credible.'
}

function explainSurvivability(board: InterpretiveBoard) {
  if (board.survivabilityThreshold === 'SURVIVABILITY THREAT') {
    return 'Survivability posture requires executive attention.'
  }

  if (board.survivabilityThreshold === 'DESTABILIZING') {
    return 'Survivability is vulnerable and should remain under governance review.'
  }

  if (board.survivabilityThreshold === 'WATCHABLE') {
    return 'Survivability exists but remains watchable.'
  }

  return 'Survivability posture is currently stable.'
}

function explainMemory(board: InterpretiveBoard) {
  if (board.memoryThreshold === 'SURVIVABILITY THREAT') {
    return 'Structural recurrence is materially threatening survivability.'
  }

  if (board.memoryThreshold === 'DESTABILIZING') {
    return 'Recurring instability patterns remain operationally significant.'
  }

  if (board.memoryThreshold === 'WATCHABLE') {
    return 'Structural recurrence remains visible.'
  }

  return 'No dominant recurrence pattern is currently driving instability.'
}

function severityToThreshold(severity: string): InterpretiveThreshold {
  if (severity === 'CRITICAL') return 'SURVIVABILITY THREAT'
  if (severity === 'HIGH') return 'DESTABILIZING'
  if (severity === 'MODERATE') return 'WATCHABLE'
  return 'CONTAINED'
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))

  if (valid.length === 0) return 0

  return Math.round(
    valid.reduce((sum, value) => sum + value, 0) / valid.length,
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
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

function MetricCard({
  label,
  value,
  text,
}: {
  label: string
  value: number
  text: string
}) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.panelEyebrow}>{label}</p>
      <h3 style={styles.metricValue}>{value}</h3>
      <p style={styles.bodyText}>{text}</p>
    </article>
  )
}

function AbsorptionBlock({
  label,
  value,
  text,
}: {
  label: string
  value: number
  text: string
}) {
  return (
    <div style={styles.reasonBlock}>
      <p style={styles.panelEyebrow}>{label}</p>
      <strong style={styles.reasonValue}>{value}</strong>
      <p style={styles.bodyText}>{text}</p>
    </div>
  )
}

function InterpretivePanel({
  title,
  threshold,
  text,
}: {
  title: string
  threshold: string
  text: string
}) {
  return (
    <article style={styles.interpretivePanel}>
      <p style={styles.panelEyebrow}>{title}</p>
      <h3 style={styles.thresholdLabel}>{threshold}</h3>
      <p style={styles.bodyText}>{text}</p>
    </article>
  )
}

function ReasonBlock({
  label,
  value,
  text,
}: {
  label: string
  value: string
  text: string
}) {
  return (
    <div style={styles.reasonBlock}>
      <p style={styles.panelEyebrow}>{label}</p>
      <strong style={styles.reasonValue}>{value}</strong>
      <p style={styles.bodyText}>{text}</p>
    </div>
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
  hero: {
    marginBottom: '20px',
    paddingTop: '4px',
  },
  kicker: {
    color: '#fbbf24',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
    margin: 0,
  },
  title: {
    fontSize: 'clamp(32px, 5vw, 48px)',
    lineHeight: 1.05,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  enterpriseSubtitle: {
    color: '#fde68a',
    fontSize: 'clamp(20px, 3vw, 28px)',
    fontWeight: 900,
    margin: '0 0 10px',
  },
  subtitle: {
    color: '#d6d3d1',
    maxWidth: '820px',
    lineHeight: 1.65,
    fontSize: '16px',
    margin: 0,
  },
  doctrinePanel: {
    background: '#111111',
    border: '1px solid rgba(251, 191, 36, 0.28)',
    borderRadius: '22px',
    padding: '20px',
    marginTop: '18px',
    marginBottom: '16px',
  },
  doctrineTitle: {
    color: '#fbbf24',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.16em',
    margin: '0 0 14px',
  },
  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
  },
  doctrineCard: {
    background: '#050505',
    border: '1px solid rgba(251, 191, 36, 0.18)',
    borderRadius: '16px',
    padding: '14px',
    color: '#fef3c7',
    fontWeight: 800,
    lineHeight: 1.5,
    fontSize: '14px',
  },
  message: {
    background: 'rgba(16, 185, 129, 0.14)',
    color: '#bbf7d0',
    border: '1px solid rgba(16, 185, 129, 0.28)',
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '16px',
    fontSize: '14px',
  },
  stabilityPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 0.6fr)',
    gap: '16px',
    background: '#050505',
    border: '1px solid rgba(251, 191, 36, 0.48)',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  stabilityPosture: {
    fontSize: 'clamp(34px, 6vw, 56px)',
    lineHeight: 1,
    margin: '8px 0 12px',
    color: '#fbbf24',
    letterSpacing: '-0.05em',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  metricCard: {
    background: '#111111',
    border: '1px solid #262626',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '136px',
    boxSizing: 'border-box',
  },
  metricValue: {
    color: '#fbbf24',
    fontSize: '34px',
    lineHeight: 1,
    margin: '8px 0 10px',
  },
  memoryOnlyPanel: {
    background: 'rgba(251, 191, 36, 0.08)',
    border: '1px solid rgba(251, 191, 36, 0.28)',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
  },
  memoryOnlyTitle: {
    color: '#fbbf24',
    fontSize: 'clamp(28px, 4vw, 38px)',
    lineHeight: 1,
    margin: '8px 0 12px',
    letterSpacing: '-0.04em',
  },
  panelEyebrow: {
    color: '#a8a29e',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontSize: '12px',
    margin: '0 0 8px',
  },
  commandPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(260px, 0.6fr)',
    gap: '16px',
    background: '#050505',
    border: '1px solid #262626',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  commandPosture: {
    fontSize: 'clamp(34px, 6vw, 56px)',
    lineHeight: 1,
    margin: '8px 0 12px',
    color: '#fbbf24',
    letterSpacing: '-0.05em',
  },
  commandMeaning: {
    color: '#e7e5e4',
    fontSize: '16px',
    lineHeight: 1.6,
    maxWidth: '720px',
    margin: 0,
  },
  implicationBox: {
    background: 'rgba(251, 191, 36, 0.09)',
    border: '1px solid rgba(251, 191, 36, 0.32)',
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },
  implicationText: {
    color: '#fef3c7',
    fontSize: '14px',
    lineHeight: 1.55,
    margin: 0,
    fontWeight: 700,
  },
  interpretiveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  interpretivePanel: {
    background: '#111111',
    border: '1px solid #262626',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
    boxSizing: 'border-box',
  },
  thresholdLabel: {
    color: '#fde68a',
    fontSize: '22px',
    lineHeight: 1.1,
    margin: '8px 0 10px',
    overflowWrap: 'anywhere',
  },
  actionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(220px, 0.45fr)',
    gap: '16px',
    background: '#050505',
    border: '1px solid #262626',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
  },
  actionThreshold: {
    color: '#fbbf24',
    fontSize: 'clamp(28px, 4vw, 38px)',
    lineHeight: 1.05,
    margin: '8px 0 10px',
  },
  deadlineBox: {
    background: '#111111',
    border: '1px solid #262626',
    borderRadius: '18px',
    padding: '16px',
    color: '#e7e5e4',
    fontSize: '16px',
    lineHeight: 1.5,
  },
  card: {
    background: '#050505',
    border: '1px solid #262626',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: '22px',
    margin: '0 0 12px',
    lineHeight: 1.2,
  },
  bodyText: {
    color: '#d6d3d1',
    lineHeight: 1.6,
    fontSize: '14px',
    margin: 0,
  },
  absorptionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '16px',
  },
  reasonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
  },
  reasonBlock: {
    background: '#111111',
    border: '1px solid #262626',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '140px',
  },
  reasonValue: {
    display: 'block',
    color: '#fde68a',
    fontSize: '18px',
    marginBottom: '10px',
    overflowWrap: 'anywhere',
  },
  emptyState: {
    background: '#111111',
    border: '1px solid #262626',
    borderRadius: '18px',
    padding: '16px',
    color: '#d6d3d1',
    lineHeight: 1.6,
    marginTop: '16px',
    fontSize: '14px',
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
    marginTop: '14px',
    marginBottom: '16px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '940px',
  },
  th: {
    textAlign: 'left',
    color: '#a8a29e',
    borderBottom: '1px solid #262626',
    padding: '10px',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  td: {
    borderBottom: '1px solid #1f1f1f',
    padding: '10px',
    color: '#e7e5e4',
    verticalAlign: 'top',
    lineHeight: 1.55,
    fontSize: '13px',
  },
  primaryButton: {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    border: 'none',
    background: '#fbbf24',
    color: '#111111',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '15px',
  },
}