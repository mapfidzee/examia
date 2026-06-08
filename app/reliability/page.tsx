'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { interpretReliability } from '@/lib/cgi/interpreters/interpretReliability'
import { buildCGIExecutiveBriefing } from '@/lib/cgiExecutiveBriefingGenerator'
import {
  formatCGIEvidenceLanguage,
  formatCGIExecutivePosture,
  formatCGIGovernanceSafeLanguage,
  formatCGISurvivabilityLanguage,
} from '@/lib/cgiExecutivePostureFormatter'
import { supabase } from '../../lib/supabase'

type CgiOperationalMetric = {
  id: string
  created_at: string
  scope: string
  continuity_state: string
  pressure_propagation_state: string
  trajectory_direction: string
  structural_memory_state: string
  continuity_integrity_score: number
  stabilization_confidence_score: number
  escalation_pressure_index: number
  recovery_reliability_score: number
  operational_survivability_score: number
  propagation_risk: number
  trajectory_risk: number
  structural_memory_risk: number
  unresolved_momentum: number
  stabilization_drag: number
  continuity_drift: number
  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
}

type Interpretation = {
  posture: string
  meaning: string
  action: string
}

type EnterpriseReliabilityPosture =
  | 'RELIABILITY PROVEN'
  | 'RELIABILITY EMERGING'
  | 'RELIABILITY FRAGILE'
  | 'RELIABILITY DETERIORATING'
  | 'RELIABILITY COLLAPSING'
  | 'INSUFFICIENT RELIABILITY MEMORY'

type ReliabilityTrustDecision =
  | 'TRUST_REPEATED_STABILIZATION'
  | 'TRUST_CONDITIONALLY'
  | 'DO_NOT_TRUST_REPEATED_STABILIZATION'
  | 'ESCALATE_RELIABILITY_REVIEW'
  | 'BUILD_MEMORY_BEFORE_TRUST'

type EnterpriseReliabilityIntelligence = {
  latest: CgiOperationalMetric | null
  enterprisePosture: EnterpriseReliabilityPosture
  trustDecision: ReliabilityTrustDecision

  reliabilityQuestion: string
  enterpriseReliabilityThesis: string
  institutionalMeaning: string

  reliabilityPattern: string
  reliabilityThreat: string
  reliabilityConfidence: string
  reliabilityForecast: string

  commandImplication: string
  executiveReportImplication: string
  memoryBoardImplication: string
  auditImplication: string

  evidenceRequirement: string
  boardWarning: string
  executiveAction: string

  reliabilityInterpretation: ReturnType<typeof interpretReliability>

  survivabilityMeaning: Interpretation
  continuityMeaning: Interpretation
  driftMeaning: Interpretation
  unresolvedMeaning: Interpretation
  volatilityMeaning: Interpretation
  historyDepth: Interpretation

  dominantWeakness: string
  synchronizedExecutiveSummary: string
  actionCue: string

  scores: {
    reliability: number
    survivability: number
    continuity: number
    pressure: number
    trajectory: number
    memoryRisk: number
    drift: number
    unresolved: number
    volatility: number
    recurrenceRate: number
    failedRecoveries: number
    unresolvedCases: number
    overdueCases: number
  }

  copyReadyBrief: string
}

const SAMPLE_LIMIT = 100

export default function ReliabilityPage() {
  return (
    <CGIGovernanceShell>
      <ReliabilityContent />
    </CGIGovernanceShell>
  )
}

function ReliabilityContent() {
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadReliabilityMetrics()
  }, [])

  async function loadReliabilityMetrics() {
    setMessage('Loading enterprise reliability memory...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Enterprise reliability memory could not be loaded.')
      return
    }

    setMetrics(data || [])
    setMessage('Enterprise reliability memory loaded.')
  }

  const intelligence = useMemo(
    () => buildEnterpriseReliabilityIntelligence(metrics),
    [metrics],
  )

  const synchronizedBriefing = buildCGIExecutiveBriefing({
    pressurePosture: intelligence.unresolvedMeaning.posture.includes('HIGH')
      ? 'CRITICAL'
      : intelligence.unresolvedMeaning.posture.includes('VISIBLE')
        ? 'ELEVATED'
        : 'WATCHED',

    trajectoryPosture: intelligence.driftMeaning.posture.includes('SEVERE')
      ? 'CRITICAL'
      : intelligence.driftMeaning.posture.includes('WATCH')
        ? 'ELEVATED'
        : 'WATCHED',

    predictivePosture: intelligence.volatilityMeaning.posture.includes(
      'VOLATILE',
    )
      ? 'CRITICAL'
      : intelligence.volatilityMeaning.posture.includes('VARIATION')
        ? 'ELEVATED'
        : 'WATCHED',

    recoveryPosture:
      intelligence.reliabilityInterpretation.posture.includes('FRAGILE') ||
      intelligence.reliabilityInterpretation.posture.includes('DANGEROUS')
        ? 'CRITICAL'
        : intelligence.reliabilityInterpretation.posture.includes('MONITORED')
          ? 'ELEVATED'
          : 'WATCHED',

    reliabilityPosture:
      intelligence.reliabilityInterpretation.posture.includes('DANGEROUS') ||
      intelligence.reliabilityInterpretation.posture.includes('FRAGILE')
        ? 'CRITICAL'
        : intelligence.reliabilityInterpretation.posture.includes('MONITORED')
          ? 'ELEVATED'
          : 'WATCHED',

    evidenceVerified: false,
    accountabilityActive: true,
    structuralMemoryVisible: true,
  })

  const synchronizedPosture = formatCGIExecutivePosture(
    synchronizedBriefing.synthesis.synthesisPosture,
  )

  const synchronizedEvidence = formatCGIEvidenceLanguage(
    false,
    synchronizedBriefing.synthesis.synthesisPosture,
  )

  const synchronizedSurvivability = formatCGISurvivabilityLanguage(
    synchronizedBriefing.synthesis.synthesisPosture,
  )

  const synchronizedGovernance = formatCGIGovernanceSafeLanguage()
    return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • ENTERPRISE RELIABILITY</p>
            <h1 style={styles.title}>Enterprise Reliability Intelligence</h1>
            <p style={styles.subtitle}>
              Reliability determines whether the institution can stabilize
              repeatedly under pressure. CGI does not treat one visible recovery
              as proof that continuity can be trusted.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>RELIABILITY POSTURE</p>
            <p style={styles.statusValue}>{intelligence.enterprisePosture}</p>
            <p style={styles.statusMeaning}>
              {intelligence.enterpriseReliabilityThesis}
            </p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Executive Reliability Question</p>
            <h2 style={styles.commandTitle}>
              {intelligence.reliabilityQuestion}
            </h2>
            <p style={styles.primaryText}>{intelligence.institutionalMeaning}</p>

            <div style={styles.commandMetaGrid}>
              <MiniStat label="Trust Decision" value={intelligence.trustDecision} />
              <MiniStat
                label="Reliability Confidence"
                value={intelligence.reliabilityConfidence}
              />
              <MiniStat
                label="Dominant Weakness"
                value={intelligence.dominantWeakness}
              />
              <MiniStat label="Memory" value={intelligence.historyDepth.posture} />
            </div>
          </div>

          <div style={styles.consequenceCard}>
            <p style={styles.sectionKicker}>Board Warning</p>
            <h2 style={styles.consequenceTitle}>
              Do not confuse recovery with repeatability.
            </h2>
            <p style={styles.bodyText}>{intelligence.boardWarning}</p>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Reliability" value={String(intelligence.scores.reliability)} />
          <Metric label="Survivability" value={String(intelligence.scores.survivability)} />
          <Metric label="Continuity" value={String(intelligence.scores.continuity)} />
          <Metric label="Memory Risk" value={String(intelligence.scores.memoryRisk)} />
          <Metric label="Drift" value={String(intelligence.scores.drift)} />
          <Metric label="Volatility" value={String(intelligence.scores.volatility)} />
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Reliability Pattern"
            value={intelligence.reliabilityPattern}
            body="How stabilization is behaving across reviewed memory."
          />

          <ExecutiveCard
            title="Reliability Threat"
            value={intelligence.reliabilityThreat}
            body="The main reason repeated stabilization cannot be assumed."
          />

          <ExecutiveCard
            title="Reliability Forecast"
            value={intelligence.reliabilityForecast}
            body="What reliability may do if current conditions continue."
          />

          <ExecutiveCard
            title="Executive Action"
            value={intelligence.executiveAction}
            body="What leadership should do before trust is restored."
          />
        </section>

        <section style={styles.panel}>
          <p style={styles.sectionKicker}>Synchronized Continuity Reading</p>
          <h2 style={styles.panelTitle}>{synchronizedPosture.label}</h2>
          <p style={styles.bodyText}>{synchronizedPosture.description}</p>

          <div style={styles.infoList}>
            <Info label="Evidence" value={synchronizedEvidence} />
            <Info label="Survivability" value={synchronizedSurvivability} />
            <Info label="Governance" value={synchronizedGovernance} />
          </div>
        </section>

        <section style={styles.postureGrid}>
          <PostureCard
            title="Survivability"
            interpretation={intelligence.survivabilityMeaning}
          />

          <PostureCard
            title="Continuity Integrity"
            interpretation={intelligence.continuityMeaning}
          />

          <PostureCard
            title="Continuity Drift"
            interpretation={intelligence.driftMeaning}
          />

          <PostureCard
            title="Unresolved Stability Pressure"
            interpretation={intelligence.unresolvedMeaning}
          />

          <PostureCard
            title="Reliability Volatility"
            interpretation={intelligence.volatilityMeaning}
          />

          <PostureCard
            title="Memory Depth"
            interpretation={intelligence.historyDepth}
          />
        </section>

        <section style={styles.memoryPanel}>
          <p style={styles.sectionKicker}>Reliability Memory</p>
          <h2 style={styles.panelTitle}>
            Repeatable stabilization must be proven across memory, not assumed
            from one recovery.
          </h2>

          <div style={styles.memoryGrid}>
            <MiniStat label="Failed Recoveries" value={String(intelligence.scores.failedRecoveries)} />
            <MiniStat label="Unresolved Cases" value={String(intelligence.scores.unresolvedCases)} />
            <MiniStat label="Overdue Cases" value={String(intelligence.scores.overdueCases)} />
            <MiniStat label="Recurrence Rate" value={String(intelligence.scores.recurrenceRate)} />
          </div>
        </section>
                <section style={styles.gridTwo}>
          <Panel title="Enterprise Reliability Requirements">
            <Info
              label="Trust Decision"
              value={intelligence.trustDecision}
            />

            <Info
              label="Evidence Requirement"
              value={intelligence.evidenceRequirement}
            />

            <Info
              label="Executive Action"
              value={intelligence.executiveAction}
            />

            <Info
              label="Action Cue"
              value={intelligence.actionCue}
            />
          </Panel>

          <Panel title="Latest Continuity Context">
            <Info
              label="Continuity State"
              value={
                intelligence.latest?.continuity_state || 'Not recorded'
              }
            />

            <Info
              label="Pressure State"
              value={
                intelligence.latest?.pressure_propagation_state ||
                'Not recorded'
              }
            />

            <Info
              label="Trajectory Direction"
              value={
                intelligence.latest?.trajectory_direction ||
                'Not recorded'
              }
            />

            <Info
              label="Structural Memory"
              value={
                intelligence.latest?.structural_memory_state ||
                'Not recorded'
              }
            />

            <Info
              label="Dominant Memory Pattern"
              value={
                intelligence.latest?.dominant_memory_pattern ||
                'Not recorded'
              }
            />
          </Panel>
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Command Implication"
            value={intelligence.commandImplication}
            body="How command should interpret reliability."
          />

          <ExecutiveCard
            title="Executive Report"
            value={intelligence.executiveReportImplication}
            body="How reliability should appear in executive reporting."
          />

          <ExecutiveCard
            title="Memory Board"
            value={intelligence.memoryBoardImplication}
            body="What institutional memory must preserve."
          />

          <ExecutiveCard
            title="Audit Implication"
            value={intelligence.auditImplication}
            body="What audit must be able to reconstruct."
          />
        </section>

        <section style={styles.panel}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.sectionKicker}>
                Recent Enterprise Reliability Memory
              </p>

              <h2 style={styles.panelTitle}>
                Reliability snapshots
              </h2>

              <p style={styles.bodyText}>
                Reliability readings are continuity observations,
                not personal performance judgments.
              </p>
            </div>

            <button
              onClick={loadReliabilityMetrics}
              style={styles.primaryButton}
            >
              Refresh
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Reliability</th>
                  <th style={styles.th}>Continuity</th>
                  <th style={styles.th}>Drift</th>
                  <th style={styles.th}>Survivability</th>
                  <th style={styles.th}>Memory Risk</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No persisted enterprise reliability memory found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 10).map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>
                      {formatDate(item.created_at)}
                    </td>

                    <td style={styles.td}>
                      {item.recovery_reliability_score}
                    </td>

                    <td style={styles.td}>
                      {item.continuity_integrity_score}
                    </td>

                    <td style={styles.td}>
                      {item.continuity_drift}
                    </td>

                    <td style={styles.td}>
                      {item.operational_survivability_score}
                    </td>

                    <td style={styles.td}>
                      {item.structural_memory_risk}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.orderPanel}>
          <p style={styles.sectionKicker}>
            Copy-Ready Reliability Brief
          </p>

          <h2 style={styles.panelTitle}>
            Can the institution stabilize repeatedly under pressure?
          </h2>

          <pre style={styles.summaryBox}>
            {intelligence.copyReadyBrief}
          </pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE RELIABILITY DOCTRINE</strong>

          <span>
            Reliability is not a single recovery.
            Reliability is the demonstrated ability to stabilize
            repeatedly under pressure without continuity credibility
            collapsing.
          </span>
        </section>
      </div>
    </main>
  )
}

function buildEnterpriseReliabilityIntelligence(
  metrics: CgiOperationalMetric[],
): EnterpriseReliabilityIntelligence {
  const ordered = [...metrics].sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime(),
  )

  const latest =
    ordered.length > 0
      ? ordered[ordered.length - 1]
      : null

  const reliability = average(
    ordered.map((m) => m.recovery_reliability_score),
  )

  const survivability = average(
    ordered.map((m) => m.operational_survivability_score),
  )

  const continuity = average(
    ordered.map((m) => m.continuity_integrity_score),
  )

  const pressure = average(
    ordered.map((m) => m.escalation_pressure_index),
  )

  const memoryRisk = average(
    ordered.map((m) => m.structural_memory_risk),
  )

  const drift = average(
    ordered.map((m) => m.continuity_drift),
  )

  const unresolved = average(
    ordered.map((m) => m.unresolved_momentum),
  )

  const trajectory = average(
    ordered.map((m) => m.trajectory_risk),
  )

  const volatility = Math.round(
    Math.abs(reliability - continuity),
  )

  const recurrenceRate =
    memoryRisk >= 70
      ? 4
      : memoryRisk >= 50
        ? 3
        : memoryRisk >= 30
          ? 2
          : 1

  const failedRecoveries =
    reliability < 40
      ? 4
      : reliability < 60
        ? 2
        : 0

  const unresolvedCases =
    unresolved >= 60
      ? 6
      : unresolved >= 40
        ? 3
        : 1

  const overdueCases =
    pressure >= 60
      ? 5
      : pressure >= 40
        ? 2
        : 0
          const reliabilityInterpretation = interpretReliability({
    unresolvedCases,
    overdueCases,
    failedRecoveries,
    recurrenceRate,
  })

  const survivabilityMeaning = interpretSurvivability(survivability)
  const continuityMeaning = interpretContinuity(continuity)
  const driftMeaning = interpretDrift(drift)
  const unresolvedMeaning = interpretUnresolved(unresolved)
  const volatilityMeaning = interpretVolatility(volatility)
  const historyDepth = interpretHistory(ordered.length)

  const dominantWeakness = strongestDriver({
    'Reliability weakness': 100 - reliability,
    'Survivability weakness': 100 - survivability,
    'Continuity weakness': 100 - continuity,
    'Pressure load': pressure,
    'Trajectory risk': trajectory,
    'Structural memory risk': memoryRisk,
    'Continuity drift': drift,
    'Unresolved pressure': unresolved,
    'Reliability volatility': volatility,
  })

  const enterprisePosture = deriveEnterpriseReliabilityPosture({
    recordCount: ordered.length,
    reliability,
    survivability,
    continuity,
    recurrenceRate,
    failedRecoveries,
    memoryRisk,
    drift,
    unresolved,
    volatility,
  })

  const trustDecision = deriveTrustDecision(enterprisePosture)

  const reliabilityQuestion =
    'Can the institution stabilize repeatedly under pressure?'

  const reliabilityPattern = deriveReliabilityPattern({
    reliability,
    survivability,
    continuity,
    recurrenceRate,
    failedRecoveries,
    memoryRisk,
    volatility,
  })

  const reliabilityThreat = deriveReliabilityThreat({
    dominantWeakness,
    recurrenceRate,
    failedRecoveries,
    drift,
    unresolved,
    memoryRisk,
  })

  const reliabilityConfidence = deriveReliabilityConfidence(
    enterprisePosture,
  )

  const reliabilityForecast = deriveReliabilityForecast({
    enterprisePosture,
    recurrenceRate,
    volatility,
    memoryRisk,
    drift,
  })

  const commandImplication = deriveCommandImplication(
    enterprisePosture,
  )

  const executiveReportImplication =
    deriveExecutiveReportImplication(enterprisePosture)

  const memoryBoardImplication =
    deriveMemoryBoardImplication(enterprisePosture)

  const auditImplication = deriveAuditImplication(enterprisePosture)

  const evidenceRequirement = deriveEvidenceRequirement({
    enterprisePosture,
    failedRecoveries,
    unresolvedCases,
    overdueCases,
  })

  const boardWarning = deriveBoardWarning(enterprisePosture)

  const executiveAction =
    deriveExecutiveReliabilityAction(enterprisePosture)

  const institutionalMeaning = deriveInstitutionalMeaning({
    enterprisePosture,
  })

  const enterpriseReliabilityThesis =
    `${enterprisePosture}: ${reliabilityPattern} Primary threat: ${reliabilityThreat}.`

  const synchronizedExecutiveSummary =
    `${reliabilityInterpretation.summary} ${enterpriseReliabilityThesis}`

  const actionCue = compactAction([
    executiveAction,
    driftMeaning.action,
    unresolvedMeaning.action,
    survivabilityMeaning.action,
  ])

  const copyReadyBrief = buildReliabilityBrief({
    enterprisePosture,
    trustDecision,
    reliabilityQuestion,
    enterpriseReliabilityThesis,
    institutionalMeaning,
    reliabilityPattern,
    reliabilityThreat,
    reliabilityConfidence,
    reliabilityForecast,
    commandImplication,
    executiveReportImplication,
    memoryBoardImplication,
    auditImplication,
    evidenceRequirement,
    boardWarning,
    executiveAction,
    dominantWeakness,
    reliabilityInterpretation,
    survivabilityMeaning,
    continuityMeaning,
    driftMeaning,
    unresolvedMeaning,
    volatilityMeaning,
    historyDepth,
  })

  return {
    latest,
    enterprisePosture,
    trustDecision,
    reliabilityQuestion,
    enterpriseReliabilityThesis,
    institutionalMeaning,
    reliabilityPattern,
    reliabilityThreat,
    reliabilityConfidence,
    reliabilityForecast,
    commandImplication,
    executiveReportImplication,
    memoryBoardImplication,
    auditImplication,
    evidenceRequirement,
    boardWarning,
    executiveAction,
    reliabilityInterpretation,
    survivabilityMeaning,
    continuityMeaning,
    driftMeaning,
    unresolvedMeaning,
    volatilityMeaning,
    historyDepth,
    dominantWeakness,
    synchronizedExecutiveSummary,
    actionCue,
    scores: {
      reliability,
      survivability,
      continuity,
      pressure,
      trajectory,
      memoryRisk,
      drift,
      unresolved,
      volatility,
      recurrenceRate,
      failedRecoveries,
      unresolvedCases,
      overdueCases,
    },
    copyReadyBrief,
  }
}

function deriveEnterpriseReliabilityPosture(input: {
  recordCount: number
  reliability: number
  survivability: number
  continuity: number
  recurrenceRate: number
  failedRecoveries: number
  memoryRisk: number
  drift: number
  unresolved: number
  volatility: number
}): EnterpriseReliabilityPosture {
  if (input.recordCount < 3) return 'INSUFFICIENT RELIABILITY MEMORY'

  if (
    input.reliability < 35 ||
    input.survivability < 35 ||
    input.failedRecoveries >= 4
  ) {
    return 'RELIABILITY COLLAPSING'
  }

  if (
    input.reliability < 50 ||
    input.survivability < 45 ||
    input.continuity < 45 ||
    input.recurrenceRate >= 4
  ) {
    return 'RELIABILITY DETERIORATING'
  }

  if (
    input.reliability < 65 ||
    input.memoryRisk >= 60 ||
    input.drift >= 55 ||
    input.unresolved >= 55 ||
    input.volatility >= 30
  ) {
    return 'RELIABILITY FRAGILE'
  }

  if (
    input.reliability >= 75 &&
    input.survivability >= 70 &&
    input.continuity >= 70 &&
    input.recurrenceRate <= 2 &&
    input.memoryRisk < 45
  ) {
    return 'RELIABILITY PROVEN'
  }

  return 'RELIABILITY EMERGING'
}

function deriveTrustDecision(
  posture: EnterpriseReliabilityPosture,
): ReliabilityTrustDecision {
  if (posture === 'RELIABILITY PROVEN') {
    return 'TRUST_REPEATED_STABILIZATION'
  }

  if (posture === 'RELIABILITY EMERGING') {
    return 'TRUST_CONDITIONALLY'
  }

  if (posture === 'RELIABILITY FRAGILE') {
    return 'DO_NOT_TRUST_REPEATED_STABILIZATION'
  }

  if (
    posture === 'RELIABILITY DETERIORATING' ||
    posture === 'RELIABILITY COLLAPSING'
  ) {
    return 'ESCALATE_RELIABILITY_REVIEW'
  }

  return 'BUILD_MEMORY_BEFORE_TRUST'
}
function deriveReliabilityPattern(input: {
  reliability: number
  survivability: number
  continuity: number
  recurrenceRate: number
  failedRecoveries: number
  memoryRisk: number
  volatility: number
}) {
  if (input.recurrenceRate >= 4 || input.failedRecoveries >= 4) {
    return 'Recovery is recurring or failing often enough that enterprise reliability cannot be trusted.'
  }

  if (input.memoryRisk >= 60) {
    return 'Structural memory remains active, meaning prior instability is still relevant to current reliability.'
  }

  if (input.volatility >= 30) {
    return 'Reliability is fluctuating too much for stable executive confidence.'
  }

  if (
    input.reliability >= 75 &&
    input.survivability >= 70 &&
    input.continuity >= 70
  ) {
    return 'Recovery, survivability, and continuity are aligning into repeatable stabilization.'
  }

  return 'Reliability is forming, but the institution still needs more evidence before repeated stabilization can be trusted.'
}

function deriveReliabilityThreat(input: {
  dominantWeakness: string
  recurrenceRate: number
  failedRecoveries: number
  drift: number
  unresolved: number
  memoryRisk: number
}) {
  if (input.failedRecoveries >= 4) return 'Repeated recovery failure'
  if (input.recurrenceRate >= 4) return 'Recurring instability'
  if (input.memoryRisk >= 60) return 'Structural memory pressure'
  if (input.drift >= 55) return 'Continuity drift'
  if (input.unresolved >= 55) return 'Unresolved instability pressure'
  return input.dominantWeakness
}

function deriveReliabilityConfidence(posture: EnterpriseReliabilityPosture) {
  if (posture === 'RELIABILITY PROVEN') {
    return 'High. Repeated stabilization can currently be trusted with evidence preserved.'
  }

  if (posture === 'RELIABILITY EMERGING') {
    return 'Moderate. Reliability is improving, but executive trust should remain conditional.'
  }

  if (posture === 'RELIABILITY FRAGILE') {
    return 'Low. Recovery may be visible, but repeated stabilization is not yet dependable.'
  }

  if (posture === 'RELIABILITY DETERIORATING') {
    return 'Very low. Reliability is weakening and requires command review.'
  }

  if (posture === 'RELIABILITY COLLAPSING') {
    return 'Critical. Reliability cannot currently be trusted.'
  }

  return 'Insufficient. More continuity memory is required before reliability can be trusted.'
}

function deriveReliabilityForecast(input: {
  enterprisePosture: EnterpriseReliabilityPosture
  recurrenceRate: number
  volatility: number
  memoryRisk: number
  drift: number
}) {
  if (
    input.enterprisePosture === 'RELIABILITY COLLAPSING' ||
    input.enterprisePosture === 'RELIABILITY DETERIORATING'
  ) {
    return 'Reliability is likely to weaken unless command action, ownership, and evidence improve.'
  }

  if (
    input.recurrenceRate >= 3 ||
    input.volatility >= 25 ||
    input.memoryRisk >= 55 ||
    input.drift >= 50
  ) {
    return 'Reliability may hold temporarily, but recurrence or drift could return under pressure.'
  }

  if (input.enterprisePosture === 'RELIABILITY PROVEN') {
    return 'Reliability is likely to hold if memory and evidence remain attached.'
  }

  return 'Reliability is improving but should remain under watch until more stability memory accumulates.'
}

function deriveCommandImplication(posture: EnterpriseReliabilityPosture) {
  if (
    posture === 'RELIABILITY COLLAPSING' ||
    posture === 'RELIABILITY DETERIORATING'
  ) {
    return 'Command must intervene before institutional trust is restored.'
  }

  if (posture === 'RELIABILITY FRAGILE') {
    return 'Command should hold visibility until repeatability is proven.'
  }

  if (posture === 'RELIABILITY EMERGING') {
    return 'Command may reduce posture cautiously while evidence remains attached.'
  }

  if (posture === 'RELIABILITY PROVEN') {
    return 'Command can release cautiously with memory preserved.'
  }

  return 'Command should wait for more reliability memory.'
}

function deriveExecutiveReportImplication(
  posture: EnterpriseReliabilityPosture,
) {
  if (posture === 'RELIABILITY PROVEN') {
    return 'Executive Report may state repeated stabilization is currently credible.'
  }

  if (posture === 'RELIABILITY EMERGING') {
    return 'Executive Report should conclude conditional reliability.'
  }

  if (posture === 'RELIABILITY FRAGILE') {
    return 'Executive Report should not conclude durable reliability.'
  }

  if (
    posture === 'RELIABILITY DETERIORATING' ||
    posture === 'RELIABILITY COLLAPSING'
  ) {
    return 'Executive Report should escalate reliability risk.'
  }

  return 'Executive Report should state reliability memory is insufficient.'
}

function deriveMemoryBoardImplication(posture: EnterpriseReliabilityPosture) {
  if (posture === 'RELIABILITY PROVEN') {
    return 'Memory Board should preserve proof of repeatable stabilization.'
  }

  if (posture === 'RELIABILITY EMERGING') {
    return 'Memory Board should preserve conditional reliability evidence.'
  }

  if (posture === 'RELIABILITY FRAGILE') {
    return 'Memory Board should preserve fragility, recurrence, and durability warnings.'
  }

  if (
    posture === 'RELIABILITY DETERIORATING' ||
    posture === 'RELIABILITY COLLAPSING'
  ) {
    return 'Memory Board should preserve reliability failure as institutional risk.'
  }

  return 'Memory Board should continue accumulating continuity snapshots.'
}

function deriveAuditImplication(posture: EnterpriseReliabilityPosture) {
  if (posture === 'RELIABILITY PROVEN') {
    return 'Audit should preserve why reliability was trusted.'
  }

  if (posture === 'RELIABILITY EMERGING') {
    return 'Audit should preserve the conditions behind conditional reliability.'
  }

  if (posture === 'RELIABILITY FRAGILE') {
    return 'Audit should preserve why reliability was not trusted.'
  }

  if (
    posture === 'RELIABILITY DETERIORATING' ||
    posture === 'RELIABILITY COLLAPSING'
  ) {
    return 'Audit should preserve the chain of reliability degradation.'
  }

  return 'Audit should preserve memory gaps before reliability claims are made.'
}

function deriveEvidenceRequirement(input: {
  enterprisePosture: EnterpriseReliabilityPosture
  failedRecoveries: number
  unresolvedCases: number
  overdueCases: number
}) {
  if (
    input.enterprisePosture === 'RELIABILITY COLLAPSING' ||
    input.enterprisePosture === 'RELIABILITY DETERIORATING'
  ) {
    return 'Require owner, intervention, outcome, recovery, recurrence, command, and audit evidence before trust is restored.'
  }

  if (
    input.enterprisePosture === 'RELIABILITY FRAGILE' ||
    input.failedRecoveries > 0 ||
    input.unresolvedCases > 0 ||
    input.overdueCases > 0
  ) {
    return 'Require durability evidence before reliability is treated as dependable.'
  }

  return 'Maintain evidence trail and continue confirmation monitoring.'
}

function deriveBoardWarning(posture: EnterpriseReliabilityPosture) {
  if (posture === 'RELIABILITY PROVEN') {
    return 'Do not erase the memory that made reliability provable.'
  }

  if (posture === 'RELIABILITY EMERGING') {
    return 'Do not confuse improving reliability with proven reliability.'
  }

  if (posture === 'RELIABILITY FRAGILE') {
    return 'Do not restore confidence merely because recovery is visible.'
  }

  if (
    posture === 'RELIABILITY DETERIORATING' ||
    posture === 'RELIABILITY COLLAPSING'
  ) {
    return 'Do not accept stability claims until reliability risk is governed.'
  }

  return 'Do not make a reliability claim before memory exists.'
}

function deriveExecutiveReliabilityAction(
  posture: EnterpriseReliabilityPosture,
) {
  if (posture === 'RELIABILITY PROVEN') {
    return 'Allow cautious stability absorption while preserving reliability memory.'
  }

  if (posture === 'RELIABILITY EMERGING') {
    return 'Continue reliability watch and require confirmation evidence.'
  }

  if (posture === 'RELIABILITY FRAGILE') {
    return 'Hold command visibility and extend recovery durability monitoring.'
  }

  if (posture === 'RELIABILITY DETERIORATING') {
    return 'Escalate reliability review before executive confidence is restored.'
  }

  if (posture === 'RELIABILITY COLLAPSING') {
    return 'Trigger command intervention and protect continuity evidence immediately.'
  }

  return 'Build reliability memory before declaring trust.'
}

function deriveInstitutionalMeaning(input: {
  enterprisePosture: EnterpriseReliabilityPosture
}) {
  if (input.enterprisePosture === 'RELIABILITY PROVEN') {
    return 'The institution is showing evidence that it can stabilize repeatedly under pressure, not only recover once.'
  }

  if (input.enterprisePosture === 'RELIABILITY EMERGING') {
    return 'The institution is improving, but repeated stabilization still needs confirmation memory.'
  }

  if (input.enterprisePosture === 'RELIABILITY FRAGILE') {
    return 'The institution may recover visibly while remaining unreliable under repeated pressure.'
  }

  if (
    input.enterprisePosture === 'RELIABILITY DETERIORATING' ||
    input.enterprisePosture === 'RELIABILITY COLLAPSING'
  ) {
    return 'The institution cannot safely claim dependable stabilization until reliability risk is governed.'
  }

  return 'The institution lacks enough continuity memory to make a reliability claim.'
}
function buildReliabilityBrief(input: {
  enterprisePosture: EnterpriseReliabilityPosture
  trustDecision: ReliabilityTrustDecision
  reliabilityQuestion: string
  enterpriseReliabilityThesis: string
  institutionalMeaning: string
  reliabilityPattern: string
  reliabilityThreat: string
  reliabilityConfidence: string
  reliabilityForecast: string
  commandImplication: string
  executiveReportImplication: string
  memoryBoardImplication: string
  auditImplication: string
  evidenceRequirement: string
  boardWarning: string
  executiveAction: string
  dominantWeakness: string
  reliabilityInterpretation: ReturnType<typeof interpretReliability>
  survivabilityMeaning: Interpretation
  continuityMeaning: Interpretation
  driftMeaning: Interpretation
  unresolvedMeaning: Interpretation
  volatilityMeaning: Interpretation
  historyDepth: Interpretation
}) {
  return [
    'TSINAXA CGI ENTERPRISE RELIABILITY BRIEF',
    '',
    `Reliability Question: ${input.reliabilityQuestion}`,
    '',
    `Enterprise Reliability Posture: ${input.enterprisePosture}`,
    '',
    `Trust Decision: ${input.trustDecision}`,
    '',
    `Enterprise Reliability Thesis: ${input.enterpriseReliabilityThesis}`,
    '',
    `Institutional Meaning: ${input.institutionalMeaning}`,
    '',
    `Reliability Pattern: ${input.reliabilityPattern}`,
    '',
    `Reliability Threat: ${input.reliabilityThreat}`,
    '',
    `Reliability Confidence: ${input.reliabilityConfidence}`,
    '',
    `Reliability Forecast: ${input.reliabilityForecast}`,
    '',
    `Command Implication: ${input.commandImplication}`,
    '',
    `Executive Report Implication: ${input.executiveReportImplication}`,
    '',
    `Memory Board Implication: ${input.memoryBoardImplication}`,
    '',
    `Audit Implication: ${input.auditImplication}`,
    '',
    `Evidence Requirement: ${input.evidenceRequirement}`,
    '',
    `Board Warning: ${input.boardWarning}`,
    '',
    `Executive Action: ${input.executiveAction}`,
    '',
    `Dominant Weakness: ${input.dominantWeakness}`,
    '',
    `Legacy Reliability Interpreter: ${input.reliabilityInterpretation.posture}`,
    '',
    `Survivability: ${input.survivabilityMeaning.posture}`,
    '',
    `Continuity Integrity: ${input.continuityMeaning.posture}`,
    '',
    `Continuity Drift: ${input.driftMeaning.posture}`,
    '',
    `Unresolved Pressure: ${input.unresolvedMeaning.posture}`,
    '',
    `Volatility: ${input.volatilityMeaning.posture}`,
    '',
    `Memory Depth: ${input.historyDepth.posture}`,
  ].join('\n')
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))
  if (valid.length === 0) return 0

  return Math.round(
    valid.reduce((sum, value) => sum + value, 0) / valid.length,
  )
}

function strongestDriver(scores: Record<string, number>) {
  return (
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No dominant trustworthiness threat detected'
  )
}

function interpretSurvivability(value: number): Interpretation {
  if (value >= 75) {
    return {
      posture: 'SURVIVABILITY HOLDING',
      meaning: 'Continuity survivability is becoming more dependable.',
      action: 'Maintain survivability confirmation monitoring.',
    }
  }

  if (value >= 55) {
    return {
      posture: 'SURVIVABILITY MONITORED',
      meaning: 'Survivability exists but still requires governance review.',
      action: 'Do not assume stabilization closure.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'SURVIVABILITY FRAGILE',
      meaning: 'Survivability may weaken under sustained operational pressure.',
      action: 'Continue governed survivability review.',
    }
  }

  return {
    posture: 'SURVIVABILITY DETERIORATING',
    meaning: 'Survivability credibility is no longer dependable.',
    action: 'Escalate survivability protection review.',
  }
}

function interpretContinuity(value: number): Interpretation {
  if (value >= 75) {
    return {
      posture: 'CONTINUITY HOLDING',
      meaning: 'Continuity integrity remains dependable across reviewed memory.',
      action: 'Maintain confirmation monitoring.',
    }
  }

  if (value >= 55) {
    return {
      posture: 'CONTINUITY MONITORED',
      meaning: 'Continuity integrity exists but still requires review.',
      action: 'Continue governance monitoring.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'CONTINUITY FRAGILE',
      meaning: 'Continuity integrity may weaken if unresolved pressure persists.',
      action: 'Review drift and escalation pressure.',
    }
  }

  return {
    posture: 'CONTINUITY DETERIORATING',
    meaning: 'Continuity integrity is weakening beyond safe confidence.',
    action: 'Escalate continuity protection review.',
  }
}

function interpretDrift(value: number): Interpretation {
  if (value >= 60) {
    return {
      posture: 'SEVERE CONTINUITY DRIFT',
      meaning: 'Continuity drift is strong enough to weaken trustworthiness.',
      action: 'Escalate drift review.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'DRIFT UNDER WATCH',
      meaning: 'Continuity drift remains visible and requires governance review.',
      action: 'Keep drift visible.',
    }
  }

  return {
    posture: 'DRIFT CONTAINED',
    meaning: 'Continuity drift is currently contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretUnresolved(value: number): Interpretation {
  if (value >= 65) {
    return {
      posture: 'UNRESOLVED PRESSURE HIGH',
      meaning:
        'Unresolved instability pressure may undermine stabilization credibility.',
      action: 'Escalate unresolved pressure review.',
    }
  }

  if (value >= 45) {
    return {
      posture: 'UNRESOLVED PRESSURE VISIBLE',
      meaning: 'Unresolved instability pressure remains visible.',
      action: 'Keep ownership and follow-up active.',
    }
  }

  return {
    posture: 'UNRESOLVED PRESSURE CONTAINED',
    meaning: 'Unresolved instability pressure appears contained.',
    action: 'Continue monitoring.',
  }
}

function interpretVolatility(value: number): Interpretation {
  if (value >= 30) {
    return {
      posture: 'TRUSTWORTHINESS VOLATILE',
      meaning:
        'Trustworthiness movement is fluctuating too heavily for confidence.',
      action: 'Extend continuity confirmation monitoring.',
    }
  }

  if (value >= 18) {
    return {
      posture: 'VARIATION CONTAINED',
      meaning:
        'Variation exists but is not showing visible reliability collapse.',
      action: 'Watch for repeated instability patterns.',
    }
  }

  return {
    posture: 'TRUSTWORTHINESS MOVEMENT STABLE',
    meaning:
      'Trustworthiness movement appears steady across reviewed memory.',
    action: 'Maintain confirmation monitoring.',
  }
}

function interpretHistory(count: number): Interpretation {
  if (count < 3) {
    return {
      posture: 'INSUFFICIENT MEMORY',
      meaning:
        'Too few snapshots exist for reliable trustworthiness interpretation.',
      action: 'Continue saving operational snapshots.',
    }
  }

  if (count < 10) {
    return {
      posture: 'EARLY MEMORY',
      meaning: 'Continuity trustworthiness memory has started but remains early.',
      action: 'Continue building continuity memory.',
    }
  }

  return {
    posture: 'TRUSTWORTHINESS MEMORY ESTABLISHED',
    meaning:
      'Persisted memory now supports continuity trustworthiness interpretation.',
    action: 'Use trustworthiness posture to guide executive review.',
  }
}

function compactAction(actions: string[]) {
  return Array.from(new Set(actions)).join(' ')
}

function formatDate(value: string) {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleString()
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

function PostureCard({
  title,
  interpretation,
}: {
  title: string
  interpretation: Interpretation
}) {
  return (
    <article style={styles.postureCard}>
      <p style={styles.sectionKicker}>{title}</p>
      <h3 style={styles.cardValue}>{interpretation.posture}</h3>
      <p style={styles.panelBody}>{interpretation.meaning}</p>
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

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={styles.panel}>
      <p style={styles.sectionKicker}>{title}</p>
      <div style={styles.infoList}>{children}</div>
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(201, 162, 39, 0.14), transparent 34%), linear-gradient(135deg, #050505 0%, #0B0B0B 45%, #111111 100%)',
    color: '#FFFFFF',
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
    border: '1px solid rgba(201, 162, 39, 0.34)',
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
    boxShadow: '0 28px 80px rgba(0,0,0,0.38)',
  },
  kicker: {
    margin: 0,
    color: '#C9A227',
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
    color: '#C8CDD4',
    fontSize: 17,
    lineHeight: 1.8,
  },
  statusBox: {
    border: '1px solid rgba(201, 162, 39, 0.5)',
    borderRadius: 24,
    padding: 24,
    background:
      'linear-gradient(180deg, rgba(201,162,39,0.18), rgba(0,0,0,0.38))',
  },
  statusLabel: {
    margin: 0,
    color: '#D7B84C',
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
    color: '#ECE7D7',
    fontSize: 14,
    lineHeight: 1.7,
  },
  message: {
    padding: '14px 18px',
    borderRadius: 16,
    color: '#D7B84C',
    background: 'rgba(201,162,39,0.1)',
    border: '1px solid rgba(201,162,39,0.22)',
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
    background: '#FFFFFF',
    color: '#0B0B0B',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  consequenceCard: {
    padding: 30,
    borderRadius: 28,
    background: 'rgba(0,0,0,0.38)',
    border: '1px solid rgba(201,162,39,0.28)',
  },
  sectionKicker: {
    margin: 0,
    color: '#C9A227',
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
  primaryText: {
    margin: 0,
    color: '#4A4A4A',
    lineHeight: 1.7,
    fontSize: 14,
  },
  consequenceTitle: {
    margin: '14px 0',
    fontSize: 28,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
  bodyText: {
    margin: '8px 0 0',
    color: '#AEB6C2',
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
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 14,
  },
  metricCard: {
    padding: 18,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  metricLabel: {
    margin: 0,
    color: '#858D98',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  metricValue: {
    margin: '10px 0 0',
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 950,
    lineHeight: 1.15,
    overflowWrap: 'anywhere',
  },
  miniStat: {
    padding: 14,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  miniValue: {
    margin: '8px 0 0',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 850,
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
  },
  postureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
  },
  panel: {
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  panelCard: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.09)',
    minHeight: 150,
  },
  postureCard: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.09)',
    minHeight: 150,
  },
  panelTitle: {
    margin: '12px 0 0',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
  },
  cardValue: {
    margin: '12px 0 0',
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
  },
  panelBody: {
    marginTop: 10,
    color: '#AEB6C2',
    fontSize: 14,
    lineHeight: 1.65,
  },
  infoList: {
    display: 'grid',
    gap: 10,
    marginTop: 18,
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '170px minmax(0, 1fr)',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  infoLabel: {
    color: '#858D98',
    fontWeight: 900,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  infoValue: {
    color: '#FFFFFF',
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
  },
  memoryPanel: {
    padding: 28,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(201,162,39,0.13), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.32)',
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
  },
  primaryButton: {
    border: 'none',
    borderRadius: 999,
    padding: '12px 18px',
    background: '#C9A227',
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tableWrap: {
    marginTop: 20,
    overflowX: 'auto',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 860,
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    color: '#D7B84C',
    background: 'rgba(201,162,39,0.08)',
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  td: {
    padding: '16px',
    color: '#DCE1E8',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    fontSize: 13,
    lineHeight: 1.55,
    verticalAlign: 'top',
  },
  orderPanel: {
    padding: 28,
    borderRadius: 28,
    background: '#FFFFFF',
    color: '#0B0B0B',
  },
  summaryBox: {
    marginTop: 20,
    padding: 22,
    borderRadius: 20,
    background: '#0A0A0A',
    color: '#F8F6F1',
    whiteSpace: 'pre-wrap',
    fontSize: 13,
    lineHeight: 1.7,
    overflowX: 'auto',
  },
  doctrineCard: {
    display: 'grid',
    gap: 10,
    padding: 24,
    borderRadius: 24,
    background: '#050505',
    border: '1px solid rgba(201,162,39,0.42)',
    color: '#FFFFFF',
    lineHeight: 1.7,
  },
}