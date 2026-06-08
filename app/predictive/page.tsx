'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { interpretPredictive } from '@/lib/cgi/interpreters/interpretPredictive'
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
  propagation_risk: number
  trajectory_risk: number
  structural_memory_risk: number
  unresolved_momentum: number
  stabilization_drag: number
  continuity_drift: number
  escalation_pressure_index: number
  operational_survivability_score: number
  recovery_reliability_score: number
  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
}

type Interpretation = {
  posture: string
  meaning: string
  action: string
}

type EnterpriseForecastCondition =
  | 'STABILITY LIKELY'
  | 'FRAGILE RECOVERY LIKELY'
  | 'RECURRENCE LIKELY'
  | 'ESCALATION LIKELY'
  | 'SURVIVABILITY RISK LIKELY'
  | 'INSUFFICIENT FORESIGHT MEMORY'

type ForecastConfidence =
  | 'HIGH CONFIDENCE'
  | 'MODERATE CONFIDENCE'
  | 'WEAK CONFIDENCE'
  | 'INSUFFICIENT EVIDENCE'

type ForecastHorizon =
  | 'IMMEDIATE HORIZON'
  | 'NEAR HORIZON'
  | 'MONITORED HORIZON'
  | 'STABILITY HORIZON'
  | 'UNKNOWN HORIZON'

type EnterpriseForesight = {
  condition: EnterpriseForecastCondition
  confidence: ForecastConfidence
  horizon: ForecastHorizon
  question: string
  thesis: string
  dominantFutureDriver: string
  pressureForecast: string
  trajectoryForecast: string
  reliabilityForecast: string
  recoveryForecast: string
  memoryForecast: string
  crossSiteForecast: string
  likelyToWorsen: string
  likelyToStabilize: string
  likelyToRecur: string
  likelyToPropagate: string
  executivePreventionThesis: string
  preventionAction: string
  evidenceRequirement: string
  memoryRequirement: string
  boardWarning: string
  copyReadyBrief: string
}

const SAMPLE_LIMIT = 120

export default function PredictivePage() {
  return (
    <CGIGovernanceShell>
      <PredictiveContent />
    </CGIGovernanceShell>
  )
}

function PredictiveContent() {
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPredictiveMetrics()
  }, [])

  async function loadPredictiveMetrics() {
    setMessage('Loading enterprise foresight memory...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Enterprise foresight memory could not be loaded.')
      return
    }

    setMetrics(data || [])
    setMessage('Enterprise foresight memory loaded.')
  }

  const predictive = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

    const latest = ordered[ordered.length - 1] || null

    const propagationRisk = average(
      ordered.map((item) => item.propagation_risk),
    )

    const trajectoryRisk = average(
      ordered.map((item) => item.trajectory_risk),
    )

    const structuralMemoryRisk = average(
      ordered.map((item) => item.structural_memory_risk),
    )

    const unresolvedMomentum = average(
      ordered.map((item) => item.unresolved_momentum),
    )

    const stabilizationDrag = average(
      ordered.map((item) => item.stabilization_drag),
    )

    const continuityDrift = average(
      ordered.map((item) => item.continuity_drift),
    )

    const escalationPressure = average(
      ordered.map((item) => item.escalation_pressure_index),
    )

    const survivabilityWeakness =
      100 -
      average(ordered.map((item) => item.operational_survivability_score))

    const reliabilityWeakness =
      100 - average(ordered.map((item) => item.recovery_reliability_score))

    const predictiveInterpretation = interpretPredictive({
      propagationRisk,
      trajectoryRisk,
      structuralMemoryRisk,
      unresolvedMomentum,
      stabilizationDrag,
    })

    const propagationMeaning = interpretRisk(propagationRisk, 'PROPAGATION')
    const trajectoryMeaning = interpretRisk(trajectoryRisk, 'TRAJECTORY')
    const memoryMeaning = interpretRisk(
      structuralMemoryRisk,
      'STRUCTURAL MEMORY',
    )
    const unresolvedMeaning = interpretMomentum(unresolvedMomentum)
    const dragMeaning = interpretDrag(stabilizationDrag)
    const driftMeaning = interpretDrift(continuityDrift)
    const survivabilityMeaning = interpretWeakness(
      survivabilityWeakness,
      'SURVIVABILITY',
    )
    const reliabilityMeaning = interpretWeakness(
      reliabilityWeakness,
      'RELIABILITY',
    )
    const pressureMeaning = interpretPressure(escalationPressure)
    const historyMeaning = interpretHistory(ordered.length)

    const dominantForecastDriver = strongestDriver({
      'Propagation risk': propagationRisk,
      'Trajectory risk': trajectoryRisk,
      'Structural memory risk': structuralMemoryRisk,
      'Unresolved momentum': unresolvedMomentum,
      'Stabilization drag': stabilizationDrag,
      'Continuity drift': continuityDrift,
      'Escalation pressure': escalationPressure,
      'Survivability weakness': survivabilityWeakness,
      'Reliability weakness': reliabilityWeakness,
    })

    const foresight = buildEnterpriseForesight({
      recordCount: ordered.length,
      propagationRisk,
      trajectoryRisk,
      structuralMemoryRisk,
      unresolvedMomentum,
      stabilizationDrag,
      continuityDrift,
      escalationPressure,
      survivabilityWeakness,
      reliabilityWeakness,
      dominantForecastDriver,
    })

    const executiveSummary = `${foresight.thesis} ${predictiveInterpretation.summary}`

    const actionCue = compactAction([
      foresight.preventionAction,
      predictiveInterpretation.executiveAction,
      propagationMeaning.action,
      unresolvedMeaning.action,
      dragMeaning.action,
    ])

    return {
      latest,
      foresight,
      predictiveInterpretation,
      propagationMeaning,
      trajectoryMeaning,
      memoryMeaning,
      unresolvedMeaning,
      dragMeaning,
      driftMeaning,
      survivabilityMeaning,
      reliabilityMeaning,
      pressureMeaning,
      historyMeaning,
      dominantForecastDriver,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

  const synchronizedBriefing = buildCGIExecutiveBriefing({
    pressurePosture: predictive.pressureMeaning.posture.includes('HIGH')
      ? 'CRITICAL'
      : predictive.pressureMeaning.posture.includes('VISIBLE')
        ? 'ELEVATED'
        : 'WATCHED',

    trajectoryPosture: predictive.trajectoryMeaning.posture.includes('HIGH')
      ? 'CRITICAL'
      : predictive.trajectoryMeaning.posture.includes('VISIBLE')
        ? 'ELEVATED'
        : 'WATCHED',

    predictivePosture:
      predictive.foresight.condition.includes('SURVIVABILITY') ||
      predictive.foresight.condition.includes('ESCALATION')
        ? 'CRITICAL'
        : predictive.foresight.condition.includes('RECURRENCE') ||
            predictive.foresight.condition.includes('FRAGILE')
          ? 'ELEVATED'
          : 'WATCHED',

    recoveryPosture: predictive.dragMeaning.posture.includes('HIGH')
      ? 'CRITICAL'
      : predictive.dragMeaning.posture.includes('VISIBLE')
        ? 'ELEVATED'
        : 'WATCHED',

    reliabilityPosture: predictive.reliabilityMeaning.posture.includes('HIGH')
      ? 'CRITICAL'
      : predictive.reliabilityMeaning.posture.includes('VISIBLE')
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

  const brief = buildPredictiveBrief({
    foresight: predictive.foresight,
    synchronizedPosture: synchronizedPosture.label,
    evidence: synchronizedEvidence,
    survivability: synchronizedSurvivability,
    governance: synchronizedGovernance,
    warningPosture: predictive.predictiveInterpretation.posture,
    propagation: predictive.propagationMeaning.posture,
    trajectory: predictive.trajectoryMeaning.posture,
    memory: predictive.memoryMeaning.posture,
    unresolved: predictive.unresolvedMeaning.posture,
    drag: predictive.dragMeaning.posture,
    drift: predictive.driftMeaning.posture,
    survivabilityWeakness: predictive.survivabilityMeaning.posture,
    reliabilityWeakness: predictive.reliabilityMeaning.posture,
    actionCue: predictive.actionCue,
  })

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>
            TSINAXA CGI • ENTERPRISE FORESIGHT
          </p>

          <h1 style={styles.title}>
            Enterprise Continuity Foresight Intelligence
          </h1>

          <p style={styles.subtitle}>
            Predictive intelligence does not forecast random events. It
            forecasts the continuity condition most likely to become visible if
            current pressure, trajectory, memory, reliability, and recovery
            patterns persist.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Enterprise Forecast Thesis</p>

            <h2 style={styles.heroPosture}>
              {predictive.foresight.condition}
            </h2>

            <p style={styles.heroMeaning}>{predictive.foresight.thesis}</p>
          </div>

          <div style={styles.actionBox}>
            <p style={styles.actionLabel}>Forecast Horizon</p>

            <p style={styles.actionText}>{predictive.foresight.horizon}</p>
          </div>
        </section>

        <section style={styles.questionCard}>
          <div>
            <p style={styles.sectionKicker}>Executive Foresight Question</p>

            <h2 style={styles.cardTitle}>{predictive.foresight.question}</h2>

            <p style={styles.bodyText}>
              {predictive.foresight.executivePreventionThesis}
            </p>
          </div>

          <div style={styles.questionStack}>
            <MiniBlock
              title="Forecast Confidence"
              value={predictive.foresight.confidence}
            />

            <MiniBlock
              title="Dominant Future Driver"
              value={predictive.foresight.dominantFutureDriver}
            />

            <MiniBlock
              title="Board Warning"
              value={predictive.foresight.boardWarning}
            />
          </div>
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Pressure Forecast"
            value={predictive.foresight.pressureForecast}
            body="What pressure may become visible next."
          />

          <ExecutiveCard
            title="Trajectory Forecast"
            value={predictive.foresight.trajectoryForecast}
            body="Where continuity direction may move next."
          />

          <ExecutiveCard
            title="Reliability Forecast"
            value={predictive.foresight.reliabilityForecast}
            body="Whether repeated stabilization may remain trustworthy."
          />

          <ExecutiveCard
            title="Recovery Forecast"
            value={predictive.foresight.recoveryForecast}
            body="Whether recovery may hold, stall, or weaken."
          />
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Memory Forecast"
            value={predictive.foresight.memoryForecast}
            body="Whether structural memory may re-enter the chain."
          />

          <ExecutiveCard
            title="Cross-Site Forecast"
            value={predictive.foresight.crossSiteForecast}
            body="Whether emerging risk may spread across sites."
          />

          <ExecutiveCard
            title="Likely To Recur"
            value={predictive.foresight.likelyToRecur}
            body="Whether the same instability may return."
          />

          <ExecutiveCard
            title="Likely To Propagate"
            value={predictive.foresight.likelyToPropagate}
            body="Whether risk may spread before it is governed."
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

        <section style={styles.postureGrid}>
          <PostureCard
            title="Propagation Risk"
            interpretation={predictive.propagationMeaning}
          />

          <PostureCard
            title="Trajectory Risk"
            interpretation={predictive.trajectoryMeaning}
          />

          <PostureCard
            title="Structural Memory Risk"
            interpretation={predictive.memoryMeaning}
          />

          <PostureCard
            title="Unresolved Momentum"
            interpretation={predictive.unresolvedMeaning}
          />

          <PostureCard
            title="Stabilization Drag"
            interpretation={predictive.dragMeaning}
          />

          <PostureCard
            title="Continuity Drift"
            interpretation={predictive.driftMeaning}
          />
        </section>

        <section style={styles.compactGrid}>
          <CompactCard
            title="Memory Depth"
            value={predictive.historyMeaning.posture}
          />

          <CompactCard
            title="Dominant Driver"
            value={predictive.dominantForecastDriver}
          />

          <CompactCard
            title="Survivability Weakness"
            value={predictive.survivabilityMeaning.posture}
          />

          <CompactCard
            title="Reliability Weakness"
            value={predictive.reliabilityMeaning.posture}
          />
        </section>

        <section style={styles.twoColumn}>
          <Panel title="Enterprise Prevention Requirements">
            <Info
              label="Prevention Action"
              value={predictive.foresight.preventionAction}
            />

            <Info
              label="Evidence"
              value={predictive.foresight.evidenceRequirement}
            />

            <Info
              label="Memory"
              value={predictive.foresight.memoryRequirement}
            />

            <Info label="Action Cue" value={predictive.actionCue} />
          </Panel>

          <Panel title="Latest Continuity Context">
            <Info
              label="Continuity State"
              value={predictive.latest?.continuity_state || 'Not recorded'}
            />

            <Info
              label="Pressure State"
              value={
                predictive.latest?.pressure_propagation_state || 'Not recorded'
              }
            />

            <Info
              label="Trajectory Direction"
              value={predictive.latest?.trajectory_direction || 'Not recorded'}
            />

            <Info
              label="Structural Memory"
              value={
                predictive.latest?.structural_memory_state || 'Not recorded'
              }
            />

            <Info
              label="Dominant Memory Pattern"
              value={
                predictive.latest?.dominant_memory_pattern || 'Not recorded'
              }
            />
          </Panel>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Recent Enterprise Foresight Memory
              </h2>

              <p style={styles.cardNote}>
                Recent snapshots are shown as continuity foresight readings, not
                personal performance judgments.
              </p>
            </div>

            <button onClick={loadPredictiveMetrics} style={styles.primaryButton}>
              Refresh
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Warning</th>
                  <th style={styles.th}>Propagation</th>
                  <th style={styles.th}>Trajectory</th>
                  <th style={styles.th}>Memory</th>
                  <th style={styles.th}>Drag</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No persisted continuity foresight memory found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 8).map((item) => {
                  const rowPredictive = interpretPredictive({
                    propagationRisk: item.propagation_risk,
                    trajectoryRisk: item.trajectory_risk,
                    structuralMemoryRisk: item.structural_memory_risk,
                    unresolvedMomentum: item.unresolved_momentum,
                    stabilizationDrag: item.stabilization_drag,
                  })

                  return (
                    <tr key={item.id}>
                      <td style={styles.td}>{formatDate(item.created_at)}</td>

                      <td style={styles.td}>{rowPredictive.posture}</td>

                      <td style={styles.td}>
                        {
                          interpretRisk(item.propagation_risk, 'PROPAGATION')
                            .posture
                        }
                      </td>

                      <td style={styles.td}>
                        {
                          interpretRisk(item.trajectory_risk, 'TRAJECTORY')
                            .posture
                        }
                      </td>

                      <td style={styles.td}>
                        {
                          interpretRisk(
                            item.structural_memory_risk,
                            'STRUCTURAL MEMORY',
                          ).posture
                        }
                      </td>

                      <td style={styles.td}>
                        {interpretDrag(item.stabilization_drag).posture}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Copy-Ready Foresight Brief</p>

          <h2 style={styles.cardTitle}>
            What continuity risk is likely to become visible next?
          </h2>

          <pre style={styles.summaryBox}>{brief}</pre>
        </section>
      </div>
    </main>
  )
}

function buildEnterpriseForesight(input: {
  recordCount: number
  propagationRisk: number
  trajectoryRisk: number
  structuralMemoryRisk: number
  unresolvedMomentum: number
  stabilizationDrag: number
  continuityDrift: number
  escalationPressure: number
  survivabilityWeakness: number
  reliabilityWeakness: number
  dominantForecastDriver: string
}): EnterpriseForesight {
  const condition = deriveForecastCondition(input)
  const confidence = deriveForecastConfidence(input)
  const horizon = deriveForecastHorizon(input)

  const question =
    'What continuity risk is likely to become visible next if current patterns persist?'

  const pressureForecast = derivePressureForecast(input)
  const trajectoryForecast = deriveTrajectoryForecast(input)
  const reliabilityForecast = deriveReliabilityForecast(input)
  const recoveryForecast = deriveRecoveryForecast(input)
  const memoryForecast = deriveMemoryForecast(input)
  const crossSiteForecast = deriveCrossSiteForecast(input)

  const likelyToWorsen = deriveLikelyToWorsen(input)
  const likelyToStabilize = deriveLikelyToStabilize(input)
  const likelyToRecur = deriveLikelyToRecur(input)
  const likelyToPropagate = deriveLikelyToPropagate(input)

  const executivePreventionThesis = deriveExecutivePreventionThesis(
    condition,
    input,
  )

  const preventionAction = derivePreventionAction(condition)
  const evidenceRequirement =
    'Preserve propagation risk, trajectory risk, structural memory risk, unresolved momentum, stabilization drag, continuity drift, escalation pressure, survivability weakness, reliability weakness, and dominant forecast driver.'

  const memoryRequirement =
    input.recordCount < 3
      ? 'Continue saving foresight snapshots before making strong prevention claims.'
      : 'Preserve forecast memory so leadership can reconstruct why prevention action was recommended before visible instability returned.'

  const boardWarning = deriveBoardWarning(condition)

  const thesis = `${condition}: ${executivePreventionThesis} Dominant future driver: ${input.dominantForecastDriver}.`

  const copyReadyBrief = [
    'TSINAXA CGI ENTERPRISE CONTINUITY FORESIGHT BRIEF',
    '',
    `Foresight Question: ${question}`,
    '',
    `Most Probable Future Condition: ${condition}`,
    '',
    `Forecast Confidence: ${confidence}`,
    '',
    `Forecast Horizon: ${horizon}`,
    '',
    `Dominant Future Driver: ${input.dominantForecastDriver}`,
    '',
    `Enterprise Forecast Thesis: ${thesis}`,
    '',
    `Pressure Forecast: ${pressureForecast}`,
    '',
    `Trajectory Forecast: ${trajectoryForecast}`,
    '',
    `Reliability Forecast: ${reliabilityForecast}`,
    '',
    `Recovery Forecast: ${recoveryForecast}`,
    '',
    `Memory Forecast: ${memoryForecast}`,
    '',
    `Cross-Site Forecast: ${crossSiteForecast}`,
    '',
    `Likely To Worsen: ${likelyToWorsen}`,
    '',
    `Likely To Stabilize: ${likelyToStabilize}`,
    '',
    `Likely To Recur: ${likelyToRecur}`,
    '',
    `Likely To Propagate: ${likelyToPropagate}`,
    '',
    `Evidence Requirement: ${evidenceRequirement}`,
    '',
    `Memory Requirement: ${memoryRequirement}`,
    '',
    `Board Warning: ${boardWarning}`,
    '',
    `Prevention Action: ${preventionAction}`,
  ].join('\n')

  return {
    condition,
    confidence,
    horizon,
    question,
    thesis,
    dominantFutureDriver: input.dominantForecastDriver,
    pressureForecast,
    trajectoryForecast,
    reliabilityForecast,
    recoveryForecast,
    memoryForecast,
    crossSiteForecast,
    likelyToWorsen,
    likelyToStabilize,
    likelyToRecur,
    likelyToPropagate,
    executivePreventionThesis,
    preventionAction,
    evidenceRequirement,
    memoryRequirement,
    boardWarning,
    copyReadyBrief,
  }
}

function deriveForecastCondition(input: {
  recordCount: number
  propagationRisk: number
  trajectoryRisk: number
  structuralMemoryRisk: number
  unresolvedMomentum: number
  stabilizationDrag: number
  continuityDrift: number
  escalationPressure: number
  survivabilityWeakness: number
  reliabilityWeakness: number
}): EnterpriseForecastCondition {
  if (input.recordCount < 3) return 'INSUFFICIENT FORESIGHT MEMORY'

  if (
    input.survivabilityWeakness >= 70 ||
    input.escalationPressure >= 75 ||
    input.trajectoryRisk >= 75
  ) {
    return 'SURVIVABILITY RISK LIKELY'
  }

  if (
    input.unresolvedMomentum >= 65 ||
    input.stabilizationDrag >= 65 ||
    input.escalationPressure >= 65
  ) {
    return 'ESCALATION LIKELY'
  }

  if (
    input.structuralMemoryRisk >= 60 ||
    input.continuityDrift >= 60 ||
    input.reliabilityWeakness >= 60
  ) {
    return 'RECURRENCE LIKELY'
  }

  if (
    input.trajectoryRisk >= 45 ||
    input.stabilizationDrag >= 45 ||
    input.reliabilityWeakness >= 45
  ) {
    return 'FRAGILE RECOVERY LIKELY'
  }

  return 'STABILITY LIKELY'
}

function deriveForecastConfidence(input: {
  recordCount: number
  propagationRisk: number
  trajectoryRisk: number
  structuralMemoryRisk: number
  unresolvedMomentum: number
  stabilizationDrag: number
  escalationPressure: number
}): ForecastConfidence {
  if (input.recordCount < 3) return 'INSUFFICIENT EVIDENCE'

  const signalStrength = average([
    input.propagationRisk,
    input.trajectoryRisk,
    input.structuralMemoryRisk,
    input.unresolvedMomentum,
    input.stabilizationDrag,
    input.escalationPressure,
  ])

  if (input.recordCount >= 10 && signalStrength >= 65) return 'HIGH CONFIDENCE'
  if (input.recordCount >= 10 && signalStrength >= 45) {
    return 'MODERATE CONFIDENCE'
  }

  if (input.recordCount >= 3 && signalStrength >= 55) {
    return 'MODERATE CONFIDENCE'
  }

  return input.recordCount >= 10 ? 'MODERATE CONFIDENCE' : 'WEAK CONFIDENCE'
}

function deriveForecastHorizon(input: {
  escalationPressure: number
  unresolvedMomentum: number
  stabilizationDrag: number
  trajectoryRisk: number
  structuralMemoryRisk: number
  survivabilityWeakness: number
}): ForecastHorizon {
  if (
    input.survivabilityWeakness >= 70 ||
    input.escalationPressure >= 75 ||
    input.unresolvedMomentum >= 75
  ) {
    return 'IMMEDIATE HORIZON'
  }

  if (
    input.escalationPressure >= 60 ||
    input.stabilizationDrag >= 60 ||
    input.trajectoryRisk >= 60
  ) {
    return 'NEAR HORIZON'
  }

  if (input.structuralMemoryRisk >= 45 || input.trajectoryRisk >= 45) {
    return 'MONITORED HORIZON'
  }

  if (
    input.escalationPressure < 35 &&
    input.trajectoryRisk < 35 &&
    input.structuralMemoryRisk < 35
  ) {
    return 'STABILITY HORIZON'
  }

  return 'UNKNOWN HORIZON'
}

function derivePressureForecast(input: {
  escalationPressure: number
  unresolvedMomentum: number
  propagationRisk: number
}) {
  if (input.escalationPressure >= 65 || input.unresolvedMomentum >= 65) {
    return 'Pressure is likely to become visible before stability is restored.'
  }

  if (input.propagationRisk >= 45) {
    return 'Pressure may spread if coordination does not tighten.'
  }

  return 'Pressure appears watchable under continued monitoring.'
}

function deriveTrajectoryForecast(input: {
  trajectoryRisk: number
  continuityDrift: number
}) {
  if (input.trajectoryRisk >= 65 || input.continuityDrift >= 60) {
    return 'Trajectory may move toward deterioration or recurrence.'
  }

  if (input.trajectoryRisk >= 45) {
    return 'Trajectory remains fragile and should stay under review.'
  }

  return 'Trajectory appears compatible with stability if evidence holds.'
}

function deriveReliabilityForecast(input: {
  reliabilityWeakness: number
  structuralMemoryRisk: number
}) {
  if (input.reliabilityWeakness >= 60 || input.structuralMemoryRisk >= 60) {
    return 'Reliability may weaken unless recurrence memory and durability evidence improve.'
  }

  if (input.reliabilityWeakness >= 40) {
    return 'Reliability should remain conditional.'
  }

  return 'Reliability appears watchable if recovery evidence remains attached.'
}

function deriveRecoveryForecast(input: {
  stabilizationDrag: number
  unresolvedMomentum: number
}) {
  if (input.stabilizationDrag >= 65 || input.unresolvedMomentum >= 65) {
    return 'Recovery may stall or reverse if unresolved pressure remains active.'
  }

  if (input.stabilizationDrag >= 40) {
    return 'Recovery may continue but durability is not yet fully credible.'
  }

  return 'Recovery appears capable of holding under continued monitoring.'
}

function deriveMemoryForecast(input: {
  structuralMemoryRisk: number
  continuityDrift: number
}) {
  if (input.structuralMemoryRisk >= 60 || input.continuityDrift >= 60) {
    return 'Structural memory is likely to re-enter executive visibility.'
  }

  if (input.structuralMemoryRisk >= 40) {
    return 'Memory risk remains visible and should not be dismissed.'
  }

  return 'Memory risk appears contained but should remain preserved.'
}

function deriveCrossSiteForecast(input: {
  propagationRisk: number
  structuralMemoryRisk: number
}) {
  if (input.propagationRisk >= 60 && input.structuralMemoryRisk >= 45) {
    return 'Cross-site pattern review may be required if the same pressure appears elsewhere.'
  }

  if (input.propagationRisk >= 45) {
    return 'Propagation risk should remain visible for cross-site comparison.'
  }

  return 'Cross-site spread is not yet strongly indicated.'
}

function deriveLikelyToWorsen(input: {
  dominantForecastDriver: string
}) {
  return `${input.dominantForecastDriver} is the most likely worsening driver if no prevention action is taken.`
}

function deriveLikelyToStabilize(input: {
  escalationPressure: number
  trajectoryRisk: number
  stabilizationDrag: number
}) {
  if (
    input.escalationPressure < 40 &&
    input.trajectoryRisk < 40 &&
    input.stabilizationDrag < 40
  ) {
    return 'Continuity may stabilize if evidence remains attached.'
  }

  return 'Stabilization remains conditional and cannot be assumed.'
}

function deriveLikelyToRecur(input: {
  structuralMemoryRisk: number
  continuityDrift: number
  reliabilityWeakness: number
}) {
  if (
    input.structuralMemoryRisk >= 55 ||
    input.continuityDrift >= 55 ||
    input.reliabilityWeakness >= 55
  ) {
    return 'Recurrence is likely enough to require memory preservation.'
  }

  return 'Recurrence is not the dominant forecast but should remain monitored.'
}

function deriveLikelyToPropagate(input: {
  propagationRisk: number
  escalationPressure: number
}) {
  if (input.propagationRisk >= 55 || input.escalationPressure >= 65) {
    return 'Propagation is likely enough to require coordination and cross-site watch.'
  }

  return 'Propagation is currently watchable.'
}

function deriveExecutivePreventionThesis(
  condition: EnterpriseForecastCondition,
  input: {
    dominantForecastDriver: string
  },
) {
  if (condition === 'STABILITY LIKELY') {
    return 'Current signals suggest stability may hold, but evidence and memory must remain attached.'
  }

  if (condition === 'FRAGILE RECOVERY LIKELY') {
    return 'The most probable next condition is fragile recovery, not durable stabilization.'
  }

  if (condition === 'RECURRENCE LIKELY') {
    return 'The same instability may return unless memory and reliability evidence improve.'
  }

  if (condition === 'ESCALATION LIKELY') {
    return 'Current pressure may become command-visible if prevention does not tighten.'
  }

  if (condition === 'SURVIVABILITY RISK LIKELY') {
    return 'Continuity may move toward survivability risk unless executive intervention remains active.'
  }

  return `Foresight memory is insufficient. Dominant available driver: ${input.dominantForecastDriver}.`
}

function derivePreventionAction(condition: EnterpriseForecastCondition) {
  if (condition === 'SURVIVABILITY RISK LIKELY') {
    return 'Hold executive visibility and require immediate prevention evidence.'
  }

  if (condition === 'ESCALATION LIKELY') {
    return 'Prepare command escalation and tighten ownership before visible disruption expands.'
  }

  if (condition === 'RECURRENCE LIKELY') {
    return 'Preserve structural memory and extend reliability monitoring.'
  }

  if (condition === 'FRAGILE RECOVERY LIKELY') {
    return 'Keep recovery monitoring active and require durability evidence.'
  }

  if (condition === 'STABILITY LIKELY') {
    return 'Continue proportional monitoring and preserve proof before reducing visibility.'
  }

  return 'Build foresight memory before making strong prevention claims.'
}

function deriveBoardWarning(condition: EnterpriseForecastCondition) {
  if (condition === 'STABILITY LIKELY') {
    return 'Do not declare stability without evidence preserved.'
  }

  if (condition === 'FRAGILE RECOVERY LIKELY') {
    return 'Do not confuse predicted improvement with durable recovery.'
  }

  if (condition === 'RECURRENCE LIKELY') {
    return 'Do not treat recurrence risk as noise.'
  }

  if (condition === 'ESCALATION LIKELY') {
    return 'Do not wait for visible failure before prevention action.'
  }

  if (condition === 'SURVIVABILITY RISK LIKELY') {
    return 'Do not allow survivability risk to remain below executive attention.'
  }

  return 'Do not overstate prediction without memory.'
}

function buildPredictiveBrief(input: {
  foresight: EnterpriseForesight
  synchronizedPosture: string
  evidence: string
  survivability: string
  governance: string
  warningPosture: string
  propagation: string
  trajectory: string
  memory: string
  unresolved: string
  drag: string
  drift: string
  survivabilityWeakness: string
  reliabilityWeakness: string
  actionCue: string
}) {
  return [
    input.foresight.copyReadyBrief,
    '',
    'SYNCHRONIZED CGI READING',
    '',
    `Synchronized Executive Posture: ${input.synchronizedPosture}`,
    '',
    `Evidence Requirement: ${input.evidence}`,
    '',
    `Survivability Language: ${input.survivability}`,
    '',
    `Governance-Safe Meaning: ${input.governance}`,
    '',
    'SUPPORTING FORESIGHT SIGNALS',
    '',
    `Early-Warning Posture: ${input.warningPosture}`,
    '',
    `Propagation Risk: ${input.propagation}`,
    '',
    `Trajectory Risk: ${input.trajectory}`,
    '',
    `Structural Memory Risk: ${input.memory}`,
    '',
    `Unresolved Momentum: ${input.unresolved}`,
    '',
    `Stabilization Drag: ${input.drag}`,
    '',
    `Continuity Drift: ${input.drift}`,
    '',
    `Survivability Weakness: ${input.survivabilityWeakness}`,
    '',
    `Reliability Weakness: ${input.reliabilityWeakness}`,
    '',
    `Action Cue: ${input.actionCue}`,
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
    'No dominant early-warning driver detected'
  )
}

function interpretRisk(value: number, label: string): Interpretation {
  const normalizedLabel = label.toLowerCase()

  if (value >= 70) {
    return {
      posture: `${label} RISK HIGH`,
      meaning: `${normalizedLabel} risk is high enough to threaten continuity prevention.`,
      action: `Escalate ${normalizedLabel} risk review.`,
    }
  }

  if (value >= 45) {
    return {
      posture: `${label} RISK VISIBLE`,
      meaning: `${normalizedLabel} risk is visible and should remain under governance review.`,
      action: `Keep ${normalizedLabel} risk visible.`,
    }
  }

  return {
    posture: `${label} RISK CONTAINED`,
    meaning: `${normalizedLabel} risk appears contained.`,
    action: 'Maintain monitoring.',
  }
}

function interpretMomentum(value: number): Interpretation {
  if (value >= 65) {
    return {
      posture: 'UNRESOLVED MOMENTUM HIGH',
      meaning:
        'Unresolved momentum may convert early warning into visible disruption.',
      action: 'Escalate unresolved momentum review.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'UNRESOLVED MOMENTUM VISIBLE',
      meaning: 'Unresolved momentum remains visible in continuity memory.',
      action: 'Keep follow-up active.',
    }
  }

  return {
    posture: 'UNRESOLVED MOMENTUM CONTAINED',
    meaning: 'Unresolved momentum appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretDrag(value: number): Interpretation {
  if (value >= 65) {
    return {
      posture: 'STABILIZATION DRAG HIGH',
      meaning:
        'Stabilization drag may delay prevention and weaken recovery credibility.',
      action: 'Escalate stabilization drag review.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'STABILIZATION DRAG VISIBLE',
      meaning:
        'Stabilization drag remains visible and should stay under review.',
      action: 'Keep drag visible until recovery holds.',
    }
  }

  return {
    posture: 'STABILIZATION DRAG CONTAINED',
    meaning: 'Stabilization drag appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretDrift(value: number): Interpretation {
  if (value >= 60) {
    return {
      posture: 'CONTINUITY DRIFT HIGH',
      meaning: 'Continuity drift may undermine prevention credibility.',
      action: 'Escalate continuity drift review.',
    }
  }

  if (value >= 35) {
    return {
      posture: 'CONTINUITY DRIFT VISIBLE',
      meaning:
        'Continuity drift remains visible and must stay under governance review.',
      action: 'Keep drift visible.',
    }
  }

  return {
    posture: 'CONTINUITY DRIFT CONTAINED',
    meaning: 'Continuity drift is currently contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretWeakness(value: number, label: string): Interpretation {
  const normalizedLabel = label.toLowerCase()

  if (value >= 60) {
    return {
      posture: `${label} WEAKNESS HIGH`,
      meaning: `${normalizedLabel} weakness may undermine continuity prevention.`,
      action: `Escalate ${normalizedLabel} weakness review.`,
    }
  }

  if (value >= 35) {
    return {
      posture: `${label} WEAKNESS VISIBLE`,
      meaning: `${normalizedLabel} weakness remains visible.`,
      action: `Keep ${normalizedLabel} weakness under review.`,
    }
  }

  return {
    posture: `${label} WEAKNESS CONTAINED`,
    meaning: `${normalizedLabel} weakness appears contained.`,
    action: 'Maintain monitoring.',
  }
}

function interpretPressure(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'PRESSURE HIGH',
      meaning: 'Escalation pressure may accelerate continuity disruption.',
      action: 'Escalate pressure review.',
    }
  }

  if (value >= 45) {
    return {
      posture: 'PRESSURE VISIBLE',
      meaning:
        'Escalation pressure is visible and should remain under review.',
      action: 'Keep pressure visible.',
    }
  }

  return {
    posture: 'PRESSURE CONTAINED',
    meaning: 'Escalation pressure appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretHistory(count: number): Interpretation {
  if (count < 3) {
    return {
      posture: 'INSUFFICIENT MEMORY',
      meaning:
        'Too few snapshots exist for reliable early-warning interpretation.',
      action: 'Continue saving operational snapshots.',
    }
  }

  if (count < 10) {
    return {
      posture: 'EARLY WARNING MEMORY',
      meaning:
        'Continuity early-warning memory has started but remains early.',
      action: 'Continue building continuity memory.',
    }
  }

  return {
    posture: 'EARLY WARNING MEMORY ESTABLISHED',
    meaning:
      'Persisted memory supports continuity prevention interpretation.',
    action:
      'Use early-warning posture to guide executive prevention review.',
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

function MiniBlock({ title, value }: { title: string; value: string }) {
  return (
    <article style={styles.miniBlock}>
      <p style={styles.cardKicker}>{title}</p>
      <h3 style={styles.miniValue}>{value}</h3>
    </article>
  )
}

function CompactCard({ title, value }: { title: string; value: string }) {
  return (
    <article style={styles.compactCard}>
      <p style={styles.cardKicker}>{title}</p>
      <h3 style={styles.compactValue}>{value}</h3>
    </article>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
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
    color: '#facc15',
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
    color: '#e5e7eb',
    maxWidth: '820px',
    lineHeight: 1.65,
    fontSize: '16px',
    margin: 0,
  },
  message: {
    background: '#1c1917',
    color: '#fef3c7',
    padding: '12px 14px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '16px',
    fontSize: '14px',
    border: '1px solid #92400e',
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(260px, 0.65fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #facc15',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  questionCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, 0.85fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #ca8a04',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  questionStack: {
    display: 'grid',
    gap: '12px',
  },
  sectionKicker: {
    color: '#d6d3d1',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '12px',
  },
  heroPosture: {
    fontSize: 'clamp(34px, 6vw, 56px)',
    margin: '8px 0 12px',
    color: '#facc15',
    letterSpacing: '-0.05em',
    lineHeight: 1,
  },
  heroMeaning: {
    color: '#fefce8',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: '720px',
  },
  actionBox: {
    background: '#1c1917',
    border: '1px solid #facc15',
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },
  actionLabel: {
    color: '#fde68a',
    fontWeight: 900,
    margin: '0 0 8px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  actionText: {
    color: '#fef3c7',
    lineHeight: 1.55,
    margin: 0,
    fontSize: '16px',
    fontWeight: 900,
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  postureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  compactGrid: {
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
    border: '1px solid #44403c',
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
  miniBlock: {
    background: '#0f172a',
    border: '1px solid #44403c',
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
  compactCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '104px',
    boxSizing: 'border-box',
  },
  cardKicker: {
    color: '#d6d3d1',
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
  compactValue: {
    fontSize: '18px',
    lineHeight: 1.2,
    margin: '10px 0 0',
    color: '#f8fafc',
    overflowWrap: 'anywhere',
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
    gridTemplateColumns: '160px minmax(0, 1fr)',
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
    background: '#facc15',
    color: '#111827',
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