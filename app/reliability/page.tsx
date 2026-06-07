'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { interpretReliability } from '@/lib/cgi/interpreters/interpretReliability'
import { buildCGIExecutiveBriefing } from '@/lib/cgiExecutiveBriefingGenerator'
import {
  formatCGIExecutivePosture,
  formatCGIEvidenceLanguage,
  formatCGISurvivabilityLanguage,
  formatCGIGovernanceSafeLanguage,
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
        <section style={styles.header}>
          <p style={styles.kicker}>
            TSINAXA CGI • ENTERPRISE RELIABILITY
          </p>

          <h1 style={styles.title}>Enterprise Reliability Intelligence</h1>

          <p style={styles.subtitle}>
            Enterprise reliability determines whether the institution can
            repeatedly stabilize visible instability, not merely recover once.
            It sits between Recovery, Command, Executive Report, Memory Board,
            and Audit.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Enterprise Reliability Thesis</p>

            <h2 style={styles.heroPosture}>
              {intelligence.enterprisePosture}
            </h2>

            <p style={styles.heroMeaning}>
              {intelligence.enterpriseReliabilityThesis}
            </p>
          </div>

          <div style={styles.actionBox}>
            <p style={styles.actionLabel}>Trust Decision</p>

            <p style={styles.actionText}>{intelligence.trustDecision}</p>
          </div>
        </section>

        <section style={styles.thesisCard}>
          <div>
            <p style={styles.sectionKicker}>Executive Reliability Question</p>

            <h2 style={styles.cardTitle}>
              {intelligence.reliabilityQuestion}
            </h2>

            <p style={styles.bodyText}>{intelligence.institutionalMeaning}</p>
          </div>

          <div style={styles.thesisStack}>
            <MiniBlock
              title="Reliability Pattern"
              value={intelligence.reliabilityPattern}
            />

            <MiniBlock
              title="Reliability Threat"
              value={intelligence.reliabilityThreat}
            />

            <MiniBlock
              title="Reliability Forecast"
              value={intelligence.reliabilityForecast}
            />
          </div>
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Reliability Confidence"
            value={intelligence.reliabilityConfidence}
            body="Can repeated stabilization be trusted?"
          />

          <ExecutiveCard
            title="Command Implication"
            value={intelligence.commandImplication}
            body="How Command should treat the reliability posture."
          />

          <ExecutiveCard
            title="Executive Report"
            value={intelligence.executiveReportImplication}
            body="What the report may or may not conclude."
          />

          <ExecutiveCard
            title="Board Warning"
            value={intelligence.boardWarning}
            body="The misunderstanding leadership must avoid."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Synchronized Continuity Reading</p>

          <h2 style={styles.cardTitle}>{synchronizedPosture.label}</h2>

          <p style={styles.bodyText}>{synchronizedPosture.description}</p>

          <div style={styles.infoList}>
            <Info label="Evidence" value={synchronizedEvidence} />

            <Info label="Survivability" value={synchronizedSurvivability} />

            <Info label="Governance" value={synchronizedGovernance} />
          </div>
        </section>

        <section style={styles.gridThree}>
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

        <section style={styles.scoreGrid}>
          <ScoreCard
            title="Reliability"
            value={intelligence.scores.reliability}
            body="Average recovery reliability across reviewed memory."
          />

          <ScoreCard
            title="Survivability"
            value={intelligence.scores.survivability}
            body="Ability to withstand operational pressure."
          />

          <ScoreCard
            title="Continuity"
            value={intelligence.scores.continuity}
            body="Continuity integrity across persisted snapshots."
          />

          <ScoreCard
            title="Memory Risk"
            value={intelligence.scores.memoryRisk}
            body="Structural memory pressure that can weaken trust."
          />
        </section>

        <section style={styles.twoColumn}>
          <Panel title="Enterprise Chain Implications">
            <Info
              label="Command"
              value={intelligence.commandImplication}
            />

            <Info
              label="Executive Report"
              value={intelligence.executiveReportImplication}
            />

            <Info
              label="Memory Board"
              value={intelligence.memoryBoardImplication}
            />

            <Info
              label="Audit"
              value={intelligence.auditImplication}
            />
          </Panel>

          <Panel title="Memory + Evidence Requirement">
            <Info
              label="Evidence"
              value={intelligence.evidenceRequirement}
            />

            <Info
              label="Dominant Weakness"
              value={intelligence.dominantWeakness}
            />

            <Info
              label="Executive Action"
              value={intelligence.executiveAction}
            />

            <Info label="Action Cue" value={intelligence.actionCue} />
          </Panel>
        </section>

        <section style={styles.twoColumn}>
          <Panel title="Latest Continuity Context">
            <Info
              label="Continuity State"
              value={intelligence.latest?.continuity_state || 'Not recorded'}
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
                intelligence.latest?.trajectory_direction || 'Not recorded'
              }
            />

            <Info
              label="Structural Memory"
              value={
                intelligence.latest?.structural_memory_state || 'Not recorded'
              }
            />
          </Panel>

          <Panel title="Reliability Reading">
            <Info
              label="Legacy Interpreter"
              value={intelligence.reliabilityInterpretation.posture}
            />

            <Info
              label="Survivability"
              value={intelligence.survivabilityMeaning.posture}
            />

            <Info
              label="Volatility"
              value={intelligence.volatilityMeaning.posture}
            />

            <Info
              label="Continuity Drift"
              value={intelligence.driftMeaning.posture}
            />
          </Panel>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.sectionKicker}>Reliability Memory</p>

              <h2 style={styles.cardTitle}>
                Recent enterprise reliability memory
              </h2>

              <p style={styles.cardNote}>
                Recent snapshots are shown as reliability memory, not raw
                operational scoring.
              </p>
            </div>

            <button onClick={loadReliabilityMetrics} style={styles.primaryButton}>
              Refresh
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Continuity</th>
                  <th style={styles.th}>Reliability</th>
                  <th style={styles.th}>Survivability</th>
                  <th style={styles.th}>Pressure</th>
                  <th style={styles.th}>Drift</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No persisted reliability memory found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 8).map((item) => {
                  const rowReliability = interpretReliability({
                    unresolvedCases: item.unresolved_momentum >= 50 ? 1 : 0,
                    overdueCases: item.continuity_drift >= 50 ? 1 : 0,
                    failedRecoveries:
                      item.recovery_reliability_score < 45 ? 1 : 0,
                    recurrenceRate:
                      item.escalation_pressure_index >= 60 ||
                      item.structural_memory_risk >= 60
                        ? 0.5
                        : 0,
                  })

                  return (
                    <tr key={item.id}>
                      <td style={styles.td}>{formatDate(item.created_at)}</td>
                      <td style={styles.td}>{item.continuity_state}</td>
                      <td style={styles.td}>{rowReliability.posture}</td>
                      <td style={styles.td}>
                        {
                          interpretSurvivability(
                            item.operational_survivability_score,
                          ).posture
                        }
                      </td>
                      <td style={styles.td}>
                        {interpretUnresolved(item.unresolved_momentum).posture}
                      </td>
                      <td style={styles.td}>
                        {interpretDrift(item.continuity_drift).posture}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Copy-Ready Reliability Brief</p>

          <h2 style={styles.cardTitle}>
            Can this institution stabilize repeatedly?
          </h2>

          <pre style={styles.summaryBox}>{intelligence.copyReadyBrief}</pre>
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
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  const latest = ordered[ordered.length - 1] || null

  const reliability = average(
    ordered.map((item) => item.recovery_reliability_score),
  )

  const survivability = average(
    ordered.map((item) => item.operational_survivability_score),
  )

  const continuity = average(
    ordered.map((item) => item.continuity_integrity_score),
  )

  const pressure = average(
    ordered.map((item) => item.escalation_pressure_index),
  )

  const trajectory = average(ordered.map((item) => item.trajectory_risk))

  const memoryRisk = average(
    ordered.map((item) => item.structural_memory_risk),
  )

  const drift = average(ordered.map((item) => item.continuity_drift))

  const unresolved = average(ordered.map((item) => item.unresolved_momentum))

  const volatility = calculateVolatility(
    ordered.map((item) => item.recovery_reliability_score),
  )

  const unresolvedCases = ordered.filter(
    (item) => item.unresolved_momentum >= 50,
  ).length

  const overdueCases = ordered.filter(
    (item) => item.continuity_drift >= 50,
  ).length

  const failedRecoveries = ordered.filter(
    (item) => item.recovery_reliability_score < 45,
  ).length

  const recurrenceCount = ordered.filter(
    (item) =>
      item.escalation_pressure_index >= 60 ||
      item.structural_memory_risk >= 60,
  ).length

  const recurrenceRate =
    ordered.length === 0
      ? 0
      : Number((recurrenceCount / ordered.length).toFixed(2))

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
    'Pressure instability': pressure,
    'Trajectory instability': trajectory,
    'Structural memory instability': memoryRisk,
    'Continuity drift': drift,
    'Unresolved instability': unresolved,
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

  const commandImplication = deriveCommandImplication(enterprisePosture)
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

  const executiveAction = deriveExecutiveReliabilityAction(enterprisePosture)

  const reliabilityQuestion =
    'Can the institution stabilize repeatedly, or did it only recover temporarily?'

  const enterpriseReliabilityThesis = `${enterprisePosture}: ${reliabilityPattern} Primary threat: ${reliabilityThreat}.`

  const institutionalMeaning = deriveInstitutionalMeaning({
    enterprisePosture,
  })

  const synchronizedExecutiveSummary = `${reliabilityInterpretation.summary} ${enterpriseReliabilityThesis}`

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
    input.recurrenceRate >= 0.55
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
    input.recurrenceRate < 0.25 &&
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
  if (input.recurrenceRate >= 0.5 || input.failedRecoveries >= 3) {
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
  if (input.failedRecoveries >= 3) return 'Repeated recovery failure'
  if (input.recurrenceRate >= 0.5) return 'Recurring instability'
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
    input.recurrenceRate >= 0.4 ||
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
    return 'Command must intervene.'
  }

  if (posture === 'RELIABILITY FRAGILE') {
    return 'Command should hold visibility.'
  }

  if (posture === 'RELIABILITY EMERGING') {
    return 'Command may reduce posture cautiously.'
  }

  if (posture === 'RELIABILITY PROVEN') {
    return 'Command can release with memory preserved.'
  }

  return 'Command should wait for more memory.'
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

  return 'Executive Report should state memory is insufficient.'
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
    return 'The institution is showing evidence that it can stabilize repeatedly, not only recover once.'
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

function calculateVolatility(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))

  if (valid.length < 2) return 0

  const mean = average(valid)

  const variance =
    valid.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    valid.length

  return Math.min(100, Math.round(Math.sqrt(variance)))
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
      meaning:
        'Survivability may weaken under sustained operational pressure.',
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
      meaning:
        'Continuity integrity remains dependable across reviewed memory.',
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
      meaning:
        'Continuity integrity may weaken if unresolved pressure persists.',
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

function PostureCard({
  title,
  interpretation,
}: {
  title: string
  interpretation: Interpretation
}) {
  return (
    <article style={styles.postureCard}>
      <p style={styles.cardKicker}>{title}</p>
      <h3 style={styles.postureTitle}>{interpretation.posture}</h3>
      <p style={styles.postureMeaning}>{interpretation.meaning}</p>
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
    <article style={styles.executiveCard}>
      <p style={styles.cardKicker}>{title}</p>
      <h3 style={styles.executiveValue}>{value}</h3>
      <p style={styles.postureMeaning}>{body}</p>
    </article>
  )
}

function ScoreCard({
  title,
  value,
  body,
}: {
  title: string
  value: number
  body: string
}) {
  return (
    <article style={styles.scoreCard}>
      <p style={styles.cardKicker}>{title}</p>
      <h3 style={styles.scoreValue}>{value}</h3>
      <p style={styles.postureMeaning}>{body}</p>
    </article>
  )
}

function MiniBlock({ title, value }: { title: string; value: string }) {
  return (
    <article style={styles.miniBlock}>
      <p style={styles.cardKicker}>{title}</p>
      <h3 style={styles.miniValue}>{value}</h3>
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
    <section style={styles.card}>
      <h2 style={styles.cardTitle}>{title}</h2>
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
    fontSize: 'clamp(32px, 5vw, 50px)',
    lineHeight: 1.05,
    margin: '10px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '820px',
    lineHeight: 1.65,
    fontSize: '16px',
    margin: 0,
  },
  message: {
    background: '#083344',
    color: '#cffafe',
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '16px',
    fontSize: '14px',
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(260px, 0.65fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #67e8f9',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  thesisCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #facc15',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  thesisStack: {
    display: 'grid',
    gap: '12px',
  },
  sectionKicker: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '12px',
  },
  heroPosture: {
    fontSize: 'clamp(32px, 6vw, 54px)',
    margin: '8px 0 12px',
    color: '#a5f3fc',
    letterSpacing: '-0.05em',
    lineHeight: 1,
  },
  heroMeaning: {
    color: '#e0f2fe',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '720px',
  },
  actionBox: {
    background: '#082f49',
    border: '1px solid #67e8f9',
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },
  actionLabel: {
    color: '#a5f3fc',
    fontWeight: 900,
    margin: '0 0 8px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  actionText: {
    color: '#e0f2fe',
    lineHeight: 1.55,
    margin: 0,
    fontSize: '14px',
    fontWeight: 900,
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  executiveCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '160px',
    boxSizing: 'border-box',
  },
  executiveValue: {
    color: '#f8fafc',
    fontSize: '18px',
    lineHeight: 1.2,
    margin: '10px 0 8px',
    overflowWrap: 'anywhere',
  },
  scoreCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
    boxSizing: 'border-box',
  },
  scoreValue: {
    color: '#67e8f9',
    fontSize: '36px',
    lineHeight: 1,
    margin: '10px 0 8px',
    fontWeight: 900,
  },
  miniBlock: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '14px',
  },
  miniValue: {
    color: '#f8fafc',
    fontSize: '16px',
    lineHeight: 1.35,
    margin: '10px 0 0',
  },
  postureCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
    boxSizing: 'border-box',
  },
  cardKicker: {
    color: '#94a3b8',
    fontWeight: 800,
    margin: 0,
    fontSize: '12px',
  },
  postureTitle: {
    color: '#f8fafc',
    fontSize: '19px',
    margin: '10px 0 8px',
    lineHeight: 1.15,
  },
  postureMeaning: {
    color: '#cbd5e1',
    lineHeight: 1.5,
    fontSize: '14px',
    margin: 0,
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
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
    marginBottom: '14px',
  },
  cardTitle: {
    fontSize: '22px',
    margin: 0,
    lineHeight: 1.2,
  },
  bodyText: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    margin: '10px 0 0',
    maxWidth: '880px',
  },
  cardNote: {
    color: '#94a3b8',
    lineHeight: 1.5,
    margin: '6px 0 0',
    fontSize: '14px',
  },
  infoList: {
    display: 'grid',
    gap: '10px',
    marginTop: '14px',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '180px minmax(0, 1fr)',
    gap: '12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '12px',
    alignItems: 'start',
  },
  infoLabel: {
    color: '#94a3b8',
    fontWeight: 800,
    fontSize: '12px',
  },
  infoValue: {
    color: '#f8fafc',
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '760px',
  },
  th: {
    textAlign: 'left',
    color: '#94a3b8',
    borderBottom: '1px solid #334155',
    padding: '10px',
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  td: {
    borderBottom: '1px solid #1e293b',
    padding: '10px',
    color: '#e2e8f0',
    verticalAlign: 'top',
    fontWeight: 700,
    fontSize: '13px',
  },
  primaryButton: {
    padding: '10px 14px',
    borderRadius: '12px',
    border: 'none',
    background: '#67e8f9',
    color: '#082f49',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '16px',
    color: '#e2e8f0',
    lineHeight: 1.55,
    minHeight: '260px',
    fontSize: '14px',
    overflowX: 'auto',
  },
}