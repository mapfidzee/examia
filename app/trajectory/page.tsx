'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { interpretTrajectory } from '@/lib/cgi/interpreters/interpretTrajectory'
import { buildCGIExecutiveBriefing } from '@/lib/cgiExecutiveBriefingGenerator'
import {
  formatCGIExecutivePosture,
  formatCGIEvidenceLanguage,
  formatCGISurvivabilityLanguage,
  formatCGIGovernanceSafeLanguage,
} from '@/lib/cgiExecutivePostureFormatter'
import type { CGIRouteSynthesisPosture } from '@/lib/cgiCrossRouteContinuitySynthesisEngine'
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
  recovery_reliability_score: number
  operational_survivability_score: number
  trajectory_risk: number
  continuity_drift: number
  escalation_momentum: number
  recovery_direction: number
  stabilization_trend: number
  unresolved_momentum: number
  propagation_risk: number
  structural_memory_risk: number
  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
}

type Interpretation = {
  posture: string
  meaning: string
  action: string
}

type EnterpriseTrajectoryPosture =
  | 'TRAJECTORY STRENGTHENING'
  | 'TRAJECTORY HOLDING'
  | 'TRAJECTORY DRIFTING'
  | 'TRAJECTORY REVERSING'
  | 'TRAJECTORY EXECUTIVE RISK'
  | 'INSUFFICIENT TRAJECTORY MEMORY'

type TrajectoryDestination =
  | 'TOWARD STABILITY'
  | 'TOWARD FRAGILE RECOVERY'
  | 'TOWARD RECURRENCE'
  | 'TOWARD ESCALATION'
  | 'TOWARD SURVIVABILITY THREAT'
  | 'DESTINATION UNCERTAIN'

type TrajectoryVelocity =
  | 'ACCELERATING RECOVERY'
  | 'STABLE MOVEMENT'
  | 'SLOW DRIFT'
  | 'RAPID DETERIORATION'
  | 'VOLATILE TRANSITION'
  | 'INSUFFICIENT VELOCITY MEMORY'

type TrajectoryConfidence =
  | 'HIGH CONFIDENCE'
  | 'MODERATE CONFIDENCE'
  | 'WEAK CONFIDENCE'
  | 'INSUFFICIENT EVIDENCE'

type EnterpriseTrajectoryIntelligence = {
  posture: EnterpriseTrajectoryPosture
  destination: TrajectoryDestination
  velocity: TrajectoryVelocity
  confidence: TrajectoryConfidence
  executiveHorizon: string
  trajectoryQuestion: string
  thesis: string
  destinationReason: string
  commandImplication: string
  pressureImplication: string
  reliabilityImplication: string
  predictiveImplication: string
  evidenceRequirement: string
  memoryRequirement: string
  executiveAction: string
  boardWarning: string
  copyReadyBrief: string
}

const SAMPLE_LIMIT = 120

export default function TrajectoryPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <TrajectoryContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function TrajectoryContent() {
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadTrajectoryMetrics()
  }, [])

  async function loadTrajectoryMetrics() {
    setMessage('Loading enterprise trajectory memory...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Enterprise trajectory memory could not be loaded.')
      return
    }

    setMetrics(data || [])
    setMessage('Enterprise trajectory memory loaded.')
  }

  const trajectory = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime(),
    )

    const latest = ordered[ordered.length - 1] || null
    const previous = ordered[ordered.length - 2] || null
    const earlyWindow = ordered.slice(0, 5)
    const recentWindow = ordered.slice(-5)

    const trajectoryRisk = average(
      ordered.map((item) => item.trajectory_risk),
    )

    const drift = average(ordered.map((item) => item.continuity_drift))

    const escalationMomentum = average(
      ordered.map((item) => item.escalation_momentum),
    )

    const recoveryDirection = average(
      ordered.map((item) => item.recovery_direction),
    )

    const stabilizationTrend = average(
      ordered.map((item) => item.stabilization_trend),
    )

    const unresolvedMomentum = average(
      ordered.map((item) => item.unresolved_momentum),
    )

    const continuityIntegrity = average(
      ordered.map((item) => item.continuity_integrity_score),
    )

    const stabilizationConfidence = average(
      ordered.map((item) => item.stabilization_confidence_score),
    )

    const reliability = average(
      ordered.map((item) => item.recovery_reliability_score),
    )

    const survivability = average(
      ordered.map((item) => item.operational_survivability_score),
    )

    const propagation = average(ordered.map((item) => item.propagation_risk))

    const memoryRisk = average(
      ordered.map((item) => item.structural_memory_risk),
    )

    const earlyPressure = average(
      earlyWindow.map((item) =>
        average([
          item.trajectory_risk,
          item.continuity_drift,
          item.escalation_momentum,
          item.unresolved_momentum,
          100 - item.recovery_direction,
          100 - item.stabilization_trend,
        ]),
      ),
    )

    const recentPressure = average(
      recentWindow.map((item) =>
        average([
          item.trajectory_risk,
          item.continuity_drift,
          item.escalation_momentum,
          item.unresolved_momentum,
          100 - item.recovery_direction,
          100 - item.stabilization_trend,
        ]),
      ),
    )

    const trajectoryPressureMovement =
      ordered.length < 2 ? 0 : recentPressure - earlyPressure

    const earlyStabilization = average(
      earlyWindow.map((item) =>
        average([
          item.recovery_direction,
          item.stabilization_trend,
          item.recovery_reliability_score,
          item.operational_survivability_score,
        ]),
      ),
    )

    const recentStabilization = average(
      recentWindow.map((item) =>
        average([
          item.recovery_direction,
          item.stabilization_trend,
          item.recovery_reliability_score,
          item.operational_survivability_score,
        ]),
      ),
    )

    const stabilizationMovement =
      ordered.length < 2 ? 0 : recentStabilization - earlyStabilization

    const latestTrajectoryMovement =
      latest && previous
        ? average([
            latest.trajectory_risk - previous.trajectory_risk,
            latest.continuity_drift - previous.continuity_drift,
            latest.escalation_momentum - previous.escalation_momentum,
            latest.unresolved_momentum - previous.unresolved_momentum,
            previous.recovery_direction - latest.recovery_direction,
            previous.stabilization_trend - latest.stabilization_trend,
          ])
        : 0

    const trajectoryVolatility = calculateVolatility(
      ordered.map((item) =>
        average([
          item.trajectory_risk,
          item.continuity_drift,
          item.escalation_momentum,
          item.unresolved_momentum,
          100 - item.recovery_direction,
          100 - item.stabilization_trend,
        ]),
      ),
    )

    const directionStrength = average([
      recoveryDirection,
      stabilizationTrend,
      reliability,
      survivability,
      continuityIntegrity,
      stabilizationConfidence,
    ])

    const deteriorationLoad = average([
      trajectoryRisk,
      drift,
      escalationMomentum,
      unresolvedMomentum,
      propagation,
      memoryRisk,
    ])

    const centralizedTrajectory = interpretTrajectory({
      trajectoryRisk,
      continuityDrift: drift,
      unresolvedMomentum,
      survivabilityRisk: 100 - survivability,
    })

    const dominantDriver = strongestDriver({
      'Trajectory risk': trajectoryRisk,
      'Continuity drift': drift,
      'Escalation momentum': escalationMomentum,
      'Unresolved momentum': unresolvedMomentum,
      'Recovery weakness': 100 - recoveryDirection,
      'Stabilization weakness': 100 - stabilizationTrend,
      'Reliability weakness': 100 - reliability,
      'Survivability weakness': 100 - survivability,
      'Pressure movement': Math.max(trajectoryPressureMovement, 0),
      'Stabilization decline': Math.max(-stabilizationMovement, 0),
      'Trajectory volatility': trajectoryVolatility,
    })

    const trajectoryPosture = {
      posture: centralizedTrajectory.posture,
      meaning: centralizedTrajectory.summary,
      action: centralizedTrajectory.executiveAction,
    }

    const directionPosture = interpretDirectionStrength(directionStrength)
    const driftPosture = interpretDrift(drift)
    const deteriorationSignal = interpretDeterioration(deteriorationLoad)
    const recoveryPosture = interpretRecoveryDirection(recoveryDirection)
    const stabilizationPosture = interpretStabilization(stabilizationTrend)
    const momentumPosture = interpretMomentum(escalationMomentum)
    const unresolvedPosture = interpretUnresolved(unresolvedMomentum)
    const volatilityPosture = interpretVolatility(trajectoryVolatility)
    const movementPosture = interpretMovement(
      trajectoryPressureMovement || latestTrajectoryMovement,
    )
    const historyDepth = interpretHistory(ordered.length)

    const enterprise = buildEnterpriseTrajectoryIntelligence({
      recordCount: ordered.length,
      directionStrength,
      deteriorationLoad,
      trajectoryRisk,
      drift,
      escalationMomentum,
      unresolvedMomentum,
      recoveryDirection,
      stabilizationTrend,
      reliability,
      survivability,
      propagation,
      memoryRisk,
      trajectoryPressureMovement,
      stabilizationMovement,
      latestTrajectoryMovement,
      trajectoryVolatility,
      dominantDriver,
    })

    const executiveSummary = `${enterprise.thesis} ${trajectoryPosture.meaning} The dominant continuity direction driver is ${dominantDriver}.`

    const actionCue = compactAction([
      enterprise.executiveAction,
      trajectoryPosture.action,
      driftPosture.action,
      deteriorationSignal.action,
      stabilizationPosture.action,
    ])

    return {
      latest,
      enterprise,
      trajectoryPosture,
      directionPosture,
      driftPosture,
      deteriorationSignal,
      recoveryPosture,
      stabilizationPosture,
      momentumPosture,
      unresolvedPosture,
      volatilityPosture,
      movementPosture,
      historyDepth,
      dominantDriver,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

  const synchronizedBriefing = buildCGIExecutiveBriefing({
    pressurePosture: trajectory.unresolvedPosture.posture.includes('HIGH')
      ? 'CRITICAL'
      : trajectory.unresolvedPosture.posture.includes('VISIBLE')
        ? 'ELEVATED'
        : 'WATCHED',

    trajectoryPosture:
      trajectory.trajectoryPosture.posture.includes('DETERIORATING') ||
      trajectory.driftPosture.posture.includes('RISING')
        ? 'CRITICAL'
        : trajectory.driftPosture.posture.includes('WATCH')
          ? 'ELEVATED'
          : 'WATCHED',

    predictivePosture: trajectory.volatilityPosture.posture.includes(
      'VOLATILE',
    )
      ? 'CRITICAL'
      : trajectory.volatilityPosture.posture.includes('VARIATION')
        ? 'ELEVATED'
        : 'WATCHED',

    recoveryPosture: trajectory.stabilizationPosture.posture.includes('WEAK')
      ? 'CRITICAL'
      : trajectory.stabilizationPosture.posture.includes('FRAGILE')
        ? 'ELEVATED'
        : 'WATCHED',

    reliabilityPosture: trajectory.directionPosture.posture.includes('WEAK')
      ? 'CRITICAL'
      : trajectory.directionPosture.posture.includes('HOLDING')
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

  const brief = buildTrajectoryBrief({
    enterprise: trajectory.enterprise,
    synchronizedPosture: synchronizedPosture.label,
    evidence: synchronizedEvidence,
    survivability: synchronizedSurvivability,
    governance: synchronizedGovernance,
    dominantDriver: trajectory.dominantDriver,
    direction: trajectory.trajectoryPosture.posture,
    directionStrength: trajectory.directionPosture.posture,
    drift: trajectory.driftPosture.posture,
    deterioration: trajectory.deteriorationSignal.posture,
    recovery: trajectory.recoveryPosture.posture,
    stabilization: trajectory.stabilizationPosture.posture,
    momentum: trajectory.momentumPosture.posture,
    unresolved: trajectory.unresolvedPosture.posture,
    volatility: trajectory.volatilityPosture.posture,
  })

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • ENTERPRISE TRAJECTORY</p>
            <h1 style={styles.title}>Enterprise Trajectory Intelligence</h1>
            <p style={styles.subtitle}>
              Trajectory shows where continuity is heading. CGI does not wait
              for collapse; it reads direction, velocity, confidence, memory,
              and executive risk before the institution loses continuity
              credibility.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>TRAJECTORY POSTURE</p>
            <p style={styles.statusValue}>{trajectory.enterprise.posture}</p>
            <p style={styles.statusMeaning}>{trajectory.enterprise.thesis}</p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}
                <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Executive Trajectory Question</p>
            <h2 style={styles.commandTitle}>
              {trajectory.enterprise.trajectoryQuestion}
            </h2>
            <p style={styles.primaryText}>
              {trajectory.enterprise.destinationReason}
            </p>

            <div style={styles.commandMetaGrid}>
              <MiniStat label="Destination" value={trajectory.enterprise.destination} />
              <MiniStat label="Velocity" value={trajectory.enterprise.velocity} />
              <MiniStat label="Confidence" value={trajectory.enterprise.confidence} />
              <MiniStat label="Memory" value={trajectory.historyDepth.posture} />
            </div>
          </div>

          <div style={styles.consequenceCard}>
            <p style={styles.sectionKicker}>Board Warning</p>
            <h2 style={styles.consequenceTitle}>
              Do not confuse movement with stability.
            </h2>
            <p style={styles.bodyText}>{trajectory.enterprise.boardWarning}</p>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Direction" value={trajectory.directionPosture.posture} />
          <Metric label="Drift" value={trajectory.driftPosture.posture} />
          <Metric label="Momentum" value={trajectory.momentumPosture.posture} />
          <Metric label="Unresolved" value={trajectory.unresolvedPosture.posture} />
          <Metric label="Volatility" value={trajectory.volatilityPosture.posture} />
          <Metric label="Dominant Driver" value={trajectory.dominantDriver} />
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Command"
            value={trajectory.enterprise.commandImplication}
            body="How Command should treat trajectory movement."
          />

          <ExecutiveCard
            title="Pressure"
            value={trajectory.enterprise.pressureImplication}
            body="How current direction relates to pressure accumulation."
          />

          <ExecutiveCard
            title="Reliability"
            value={trajectory.enterprise.reliabilityImplication}
            body="Whether repeated stabilization can be trusted."
          />

          <ExecutiveCard
            title="Predictive"
            value={trajectory.enterprise.predictiveImplication}
            body="What the predictive layer should watch next."
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
            title="Direction Strength"
            interpretation={trajectory.directionPosture}
          />
          <PostureCard
            title="Continuity Drift"
            interpretation={trajectory.driftPosture}
          />
          <PostureCard
            title="Deterioration Signal"
            interpretation={trajectory.deteriorationSignal}
          />
          <PostureCard
            title="Recovery Direction"
            interpretation={trajectory.recoveryPosture}
          />
          <PostureCard
            title="Stabilization Movement"
            interpretation={trajectory.stabilizationPosture}
          />
          <PostureCard
            title="Escalation Momentum"
            interpretation={trajectory.momentumPosture}
          />
        </section>

        <section style={styles.memoryPanel}>
          <p style={styles.sectionKicker}>Trajectory Memory</p>
          <h2 style={styles.panelTitle}>
            Continuity direction must remain reconstructable over time.
          </h2>

          <div style={styles.memoryGrid}>
            <MiniStat label="Memory Depth" value={trajectory.historyDepth.posture} />
            <MiniStat label="Movement" value={trajectory.movementPosture.posture} />
            <MiniStat label="Volatility" value={trajectory.volatilityPosture.posture} />
            <MiniStat label="Executive Horizon" value={trajectory.enterprise.executiveHorizon} />
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Enterprise Movement Requirements">
            <Info
              label="Executive Action"
              value={trajectory.enterprise.executiveAction}
            />
            <Info
              label="Evidence"
              value={trajectory.enterprise.evidenceRequirement}
            />
            <Info
              label="Memory"
              value={trajectory.enterprise.memoryRequirement}
            />
            <Info
              label="Board Warning"
              value={trajectory.enterprise.boardWarning}
            />
            <Info label="Action Cue" value={trajectory.actionCue} />
          </Panel>

          <Panel title="Latest Continuity Context">
            <Info
              label="Continuity State"
              value={trajectory.latest?.continuity_state || 'Not recorded'}
            />
            <Info
              label="Trajectory Direction"
              value={trajectory.latest?.trajectory_direction || 'Not recorded'}
            />
            <Info
              label="Pressure State"
              value={
                trajectory.latest?.pressure_propagation_state || 'Not recorded'
              }
            />
            <Info
              label="Structural Memory"
              value={
                trajectory.latest?.structural_memory_state || 'Not recorded'
              }
            />
            <Info
              label="Dominant Signal"
              value={
                trajectory.latest?.dominant_trajectory_signal || 'Not recorded'
              }
            />
          </Panel>
        </section>

        <section style={styles.panel}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.sectionKicker}>Recent Continuity Memory Trail</p>
              <h2 style={styles.panelTitle}>Enterprise trajectory snapshots</h2>
              <p style={styles.bodyText}>
                Recent snapshots are shown as continuity readings, not personal
                performance judgments.
              </p>
            </div>

            <button onClick={loadTrajectoryMetrics} style={styles.primaryButton}>
              Refresh
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Direction</th>
                  <th style={styles.th}>Risk</th>
                  <th style={styles.th}>Drift</th>
                  <th style={styles.th}>Momentum</th>
                  <th style={styles.th}>Stabilization</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No persisted continuity trajectory memory found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 8).map((item) => {
                  const rowTrajectory = interpretTrajectory({
                    trajectoryRisk: item.trajectory_risk,
                    continuityDrift: item.continuity_drift,
                    unresolvedMomentum: item.unresolved_momentum,
                    survivabilityRisk:
                      100 - item.operational_survivability_score,
                  })

                  return (
                    <tr key={item.id}>
                      <td style={styles.td}>{formatDate(item.created_at)}</td>
                      <td style={styles.td}>{rowTrajectory.posture}</td>
                      <td style={styles.td}>
                        {interpretDeterioration(item.trajectory_risk).posture}
                      </td>
                      <td style={styles.td}>
                        {interpretDrift(item.continuity_drift).posture}
                      </td>
                      <td style={styles.td}>
                        {interpretMomentum(item.escalation_momentum).posture}
                      </td>
                      <td style={styles.td}>
                        {
                          interpretStabilization(item.stabilization_trend)
                            .posture
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.orderPanel}>
          <p style={styles.sectionKicker}>Copy-Ready Trajectory Brief</p>
          <h2 style={styles.panelTitle}>
            What future continuity posture is becoming increasingly probable?
          </h2>
          <pre style={styles.summaryBox}>{brief}</pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE TRAJECTORY DOCTRINE</strong>
          <span>
            Pressure shows where instability is accumulating. Trajectory shows
            where continuity is heading. Direction must be governed before risk
            becomes unavoidable.
          </span>
        </section>
      </div>
    </main>
  )
}

function mapToSynthesisPosture(value: unknown): CGIRouteSynthesisPosture {
  const normalized = String(value).toUpperCase()

  if (
    normalized.includes('SURVIVABILITY_THREAT') ||
    normalized.includes('CRITICAL') ||
    normalized.includes('HIGH') ||
    normalized.includes('FAILED') ||
    normalized.includes('SEVERE')
  ) {
    return 'CRITICAL'
  }

  if (
    normalized.includes('ELEVATED') ||
    normalized.includes('MODERATE') ||
    normalized.includes('ACTIVE_INSTABILITY') ||
    normalized.includes('FRAGILE') ||
    normalized.includes('PARTIAL') ||
    normalized.includes('UNCERTAIN') ||
    normalized.includes('LOW') ||
    normalized.includes('WEAK') ||
    normalized.includes('CONDITIONAL')
  ) {
    return 'ELEVATED'
  }

  return 'WATCHED'
}

function buildEnterpriseTrajectoryIntelligence(input: {
  recordCount: number
  directionStrength: number
  deteriorationLoad: number
  trajectoryRisk: number
  drift: number
  escalationMomentum: number
  unresolvedMomentum: number
  recoveryDirection: number
  stabilizationTrend: number
  reliability: number
  survivability: number
  propagation: number
  memoryRisk: number
  trajectoryPressureMovement: number
  stabilizationMovement: number
  latestTrajectoryMovement: number
  trajectoryVolatility: number
  dominantDriver: string
}): EnterpriseTrajectoryIntelligence {
  const posture = deriveEnterpriseTrajectoryPosture(input)
  const destination = deriveTrajectoryDestination(input)
  const velocity = deriveTrajectoryVelocity(input)
  const confidence = deriveTrajectoryConfidence(input)

  const trajectoryQuestion =
    'What future continuity posture is becoming increasingly probable?'

  const destinationReason = deriveDestinationReason(destination, input)
  const executiveHorizon = deriveExecutiveHorizon(destination, velocity, input)

  const commandImplication = deriveCommandImplication(posture, destination)
  const pressureImplication = derivePressureImplication(destination, input)
  const reliabilityImplication = deriveReliabilityImplication(destination, input)
  const predictiveImplication = derivePredictiveImplication(destination, velocity)

  const evidenceRequirement =
    'Preserve trajectory direction, pressure movement, drift, deterioration, unresolved momentum, recovery direction, stabilization movement, dominant driver, and executive horizon.'

  const memoryRequirement =
    input.recordCount < 3
      ? 'Continue saving trajectory snapshots before making a strong direction claim.'
      : 'Preserve trajectory memory so future executive readings can reconstruct when direction began changing.'

  const executiveAction = deriveExecutiveAction(posture, destination)
  const boardWarning = deriveBoardWarning(posture, destination)

  const thesis = `${posture}: trajectory is ${velocity.toLowerCase()} and appears ${destination.toLowerCase()}. ${destinationReason}`

  const copyReadyBrief = [
    'TSINAXA CGI ENTERPRISE TRAJECTORY BRIEF',
    '',
    `Trajectory Question: ${trajectoryQuestion}`,
    '',
    `Enterprise Trajectory Posture: ${posture}`,
    '',
    `Trajectory Velocity: ${velocity}`,
    '',
    `Probable Destination: ${destination}`,
    '',
    `Trajectory Confidence: ${confidence}`,
    '',
    `Executive Horizon: ${executiveHorizon}`,
    '',
    `Trajectory Thesis: ${thesis}`,
    '',
    `Destination Reason: ${destinationReason}`,
    '',
    `Dominant Driver: ${input.dominantDriver}`,
    '',
    `Command Implication: ${commandImplication}`,
    '',
    `Pressure Implication: ${pressureImplication}`,
    '',
    `Reliability Implication: ${reliabilityImplication}`,
    '',
    `Predictive Implication: ${predictiveImplication}`,
    '',
    `Evidence Requirement: ${evidenceRequirement}`,
    '',
    `Memory Requirement: ${memoryRequirement}`,
    '',
    `Board Warning: ${boardWarning}`,
    '',
    `Executive Action: ${executiveAction}`,
  ].join('\n')

  return {
    posture,
    destination,
    velocity,
    confidence,
    executiveHorizon,
    trajectoryQuestion,
    thesis,
    destinationReason,
    commandImplication,
    pressureImplication,
    reliabilityImplication,
    predictiveImplication,
    evidenceRequirement,
    memoryRequirement,
    executiveAction,
    boardWarning,
    copyReadyBrief,
  }
}
function deriveEnterpriseTrajectoryPosture(input: {
  recordCount: number
  directionStrength: number
  deteriorationLoad: number
  trajectoryRisk: number
  drift: number
  escalationMomentum: number
  unresolvedMomentum: number
  recoveryDirection: number
  stabilizationTrend: number
  reliability: number
  survivability: number
  memoryRisk: number
  trajectoryVolatility: number
}): EnterpriseTrajectoryPosture {
  if (input.recordCount < 3) return 'INSUFFICIENT TRAJECTORY MEMORY'

  if (
    input.trajectoryRisk >= 70 ||
    input.deteriorationLoad >= 70 ||
    input.survivability < 40 ||
    input.escalationMomentum >= 70
  ) {
    return 'TRAJECTORY EXECUTIVE RISK'
  }

  if (
    input.drift >= 60 ||
    input.unresolvedMomentum >= 65 ||
    input.recoveryDirection < 45 ||
    input.stabilizationTrend < 45
  ) {
    return 'TRAJECTORY REVERSING'
  }

  if (
    input.memoryRisk >= 55 ||
    input.trajectoryVolatility >= 25 ||
    input.directionStrength < 55
  ) {
    return 'TRAJECTORY DRIFTING'
  }

  if (input.directionStrength >= 70 && input.deteriorationLoad < 45) {
    return 'TRAJECTORY STRENGTHENING'
  }

  return 'TRAJECTORY HOLDING'
}

function deriveTrajectoryDestination(input: {
  recordCount: number
  deteriorationLoad: number
  trajectoryRisk: number
  drift: number
  escalationMomentum: number
  unresolvedMomentum: number
  recoveryDirection: number
  stabilizationTrend: number
  reliability: number
  survivability: number
  memoryRisk: number
}): TrajectoryDestination {
  if (input.recordCount < 3) return 'DESTINATION UNCERTAIN'

  if (
    input.survivability < 40 ||
    input.deteriorationLoad >= 70 ||
    input.trajectoryRisk >= 75
  ) {
    return 'TOWARD SURVIVABILITY THREAT'
  }

  if (input.escalationMomentum >= 65 || input.unresolvedMomentum >= 65) {
    return 'TOWARD ESCALATION'
  }

  if (input.memoryRisk >= 60 || input.drift >= 55) {
    return 'TOWARD RECURRENCE'
  }

  if (
    input.recoveryDirection < 55 ||
    input.stabilizationTrend < 55 ||
    input.reliability < 60
  ) {
    return 'TOWARD FRAGILE RECOVERY'
  }

  return 'TOWARD STABILITY'
}

function deriveTrajectoryVelocity(input: {
  recordCount: number
  trajectoryPressureMovement: number
  stabilizationMovement: number
  latestTrajectoryMovement: number
  trajectoryVolatility: number
}): TrajectoryVelocity {
  if (input.recordCount < 3) return 'INSUFFICIENT VELOCITY MEMORY'
  if (input.trajectoryVolatility >= 30) return 'VOLATILE TRANSITION'

  if (
    input.trajectoryPressureMovement >= 12 ||
    input.latestTrajectoryMovement >= 12
  ) {
    return 'RAPID DETERIORATION'
  }

  if (
    input.stabilizationMovement >= 10 &&
    input.trajectoryPressureMovement <= 0
  ) {
    return 'ACCELERATING RECOVERY'
  }

  if (input.trajectoryPressureMovement >= 5) return 'SLOW DRIFT'

  return 'STABLE MOVEMENT'
}

function deriveTrajectoryConfidence(input: {
  recordCount: number
  trajectoryVolatility: number
  directionStrength: number
  deteriorationLoad: number
}): TrajectoryConfidence {
  if (input.recordCount < 3) return 'INSUFFICIENT EVIDENCE'
  if (input.trajectoryVolatility >= 30) return 'WEAK CONFIDENCE'
  if (input.recordCount < 10) return 'MODERATE CONFIDENCE'

  if (input.directionStrength >= 70 || input.deteriorationLoad >= 65) {
    return 'HIGH CONFIDENCE'
  }

  return 'MODERATE CONFIDENCE'
}

function deriveDestinationReason(
  destination: TrajectoryDestination,
  input: {
    dominantDriver: string
    recoveryDirection: number
    stabilizationTrend: number
    escalationMomentum: number
    unresolvedMomentum: number
    drift: number
    memoryRisk: number
    survivability: number
  },
) {
  if (destination === 'TOWARD STABILITY') {
    return 'Recovery, survivability, and stabilization are strong enough to suggest movement toward stability.'
  }

  if (destination === 'TOWARD FRAGILE RECOVERY') {
    return 'Recovery or stabilization remains too weak for durable confidence.'
  }

  if (destination === 'TOWARD RECURRENCE') {
    return 'Drift or structural memory risk suggests the same instability may return.'
  }

  if (destination === 'TOWARD ESCALATION') {
    return 'Escalation or unresolved momentum is strong enough to threaten continuity direction.'
  }

  if (destination === 'TOWARD SURVIVABILITY THREAT') {
    return 'Survivability or deterioration pressure is severe enough to threaten institutional continuity.'
  }

  return `Trajectory destination remains uncertain. Dominant driver: ${input.dominantDriver}.`
}

function deriveExecutiveHorizon(
  destination: TrajectoryDestination,
  velocity: TrajectoryVelocity,
  input: {
    trajectoryVolatility: number
    escalationMomentum: number
    unresolvedMomentum: number
  },
) {
  if (destination === 'TOWARD SURVIVABILITY THREAT') {
    return 'Executive survivability risk may become visible unless action improves immediately.'
  }

  if (destination === 'TOWARD ESCALATION') {
    return 'Escalation risk may increase if unresolved momentum remains active.'
  }

  if (destination === 'TOWARD RECURRENCE') {
    return 'Recurrence risk is increasing and should remain visible to Memory Board.'
  }

  if (destination === 'TOWARD FRAGILE RECOVERY') {
    return 'Recovery may continue, but durability is not yet credible.'
  }

  if (velocity === 'ACCELERATING RECOVERY') {
    return 'Recovery is likely to strengthen if evidence and memory remain attached.'
  }

  if (input.trajectoryVolatility >= 30) {
    return 'Trajectory may swing quickly; predictive monitoring should stay active.'
  }

  return 'Continuity direction is likely to remain stable under continued monitoring.'
}

function deriveCommandImplication(
  posture: EnterpriseTrajectoryPosture,
  destination: TrajectoryDestination,
) {
  if (
    posture === 'TRAJECTORY EXECUTIVE RISK' ||
    destination === 'TOWARD SURVIVABILITY THREAT'
  ) {
    return 'Command must hold executive visibility.'
  }

  if (
    posture === 'TRAJECTORY REVERSING' ||
    destination === 'TOWARD ESCALATION'
  ) {
    return 'Command should prepare escalation review.'
  }

  if (destination === 'TOWARD RECURRENCE') {
    return 'Command should preserve recurrence visibility.'
  }

  if (destination === 'TOWARD STABILITY') {
    return 'Command can reduce posture cautiously if evidence remains attached.'
  }

  return 'Command should maintain proportional watch.'
}

function derivePressureImplication(
  destination: TrajectoryDestination,
  input: {
    trajectoryPressureMovement: number
    unresolvedMomentum: number
  },
) {
  if (
    destination === 'TOWARD ESCALATION' ||
    input.trajectoryPressureMovement > 8 ||
    input.unresolvedMomentum >= 60
  ) {
    return 'Pressure is moving against continuity direction.'
  }

  if (destination === 'TOWARD STABILITY') {
    return 'Pressure appears compatible with stabilization.'
  }

  return 'Pressure should remain visible until direction strengthens.'
}

function deriveReliabilityImplication(
  destination: TrajectoryDestination,
  input: {
    reliability: number
    recoveryDirection: number
    stabilizationTrend: number
  },
) {
  if (
    destination === 'TOWARD STABILITY' &&
    input.reliability >= 70 &&
    input.recoveryDirection >= 70
  ) {
    return 'Repeated stabilization is becoming more trustworthy.'
  }

  if (
    destination === 'TOWARD FRAGILE RECOVERY' ||
    input.stabilizationTrend < 55
  ) {
    return 'Reliability cannot yet be trusted as durable.'
  }

  return 'Reliability should remain under confirmation monitoring.'
}

function derivePredictiveImplication(
  destination: TrajectoryDestination,
  velocity: TrajectoryVelocity,
) {
  if (
    destination === 'TOWARD SURVIVABILITY THREAT' ||
    velocity === 'RAPID DETERIORATION' ||
    velocity === 'VOLATILE TRANSITION'
  ) {
    return 'Predictive warning should remain active.'
  }

  if (destination === 'TOWARD RECURRENCE') {
    return 'Predictive layer should watch for reburn and repeated instability.'
  }

  return 'Predictive layer should continue proportional monitoring.'
}

function deriveExecutiveAction(
  posture: EnterpriseTrajectoryPosture,
  destination: TrajectoryDestination,
) {
  if (
    posture === 'TRAJECTORY EXECUTIVE RISK' ||
    destination === 'TOWARD SURVIVABILITY THREAT'
  ) {
    return 'Escalate trajectory review and preserve executive evidence immediately.'
  }

  if (
    posture === 'TRAJECTORY REVERSING' ||
    destination === 'TOWARD ESCALATION'
  ) {
    return 'Prepare command escalation and require direction evidence.'
  }

  if (destination === 'TOWARD RECURRENCE') {
    return 'Preserve recurrence memory and extend trajectory monitoring.'
  }

  if (destination === 'TOWARD STABILITY') {
    return 'Continue confirmation monitoring before reducing visibility.'
  }

  return 'Continue trajectory memory building.'
}

function deriveBoardWarning(
  posture: EnterpriseTrajectoryPosture,
  destination: TrajectoryDestination,
) {
  if (destination === 'TOWARD STABILITY') {
    return 'Do not declare stability until trajectory evidence is attached.'
  }

  if (destination === 'TOWARD FRAGILE RECOVERY') {
    return 'Do not confuse forward movement with durable stabilization.'
  }

  if (destination === 'TOWARD RECURRENCE') {
    return 'Do not treat repeated direction drift as isolated noise.'
  }

  if (
    posture === 'TRAJECTORY EXECUTIVE RISK' ||
    destination === 'TOWARD SURVIVABILITY THREAT'
  ) {
    return 'Do not allow trajectory risk to remain below executive visibility.'
  }

  return 'Do not make strong trajectory claims without sufficient memory.'
}

function buildTrajectoryBrief(input: {
  enterprise: EnterpriseTrajectoryIntelligence
  synchronizedPosture: string
  evidence: string
  survivability: string
  governance: string
  dominantDriver: string
  direction: string
  directionStrength: string
  drift: string
  deterioration: string
  recovery: string
  stabilization: string
  momentum: string
  unresolved: string
  volatility: string
}) {
  return [
    input.enterprise.copyReadyBrief,
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
    'SUPPORTING TRAJECTORY SIGNALS',
    '',
    `Continuity Direction: ${input.direction}`,
    '',
    `Direction Strength: ${input.directionStrength}`,
    '',
    `Continuity Drift: ${input.drift}`,
    '',
    `Deterioration Signal: ${input.deterioration}`,
    '',
    `Recovery Direction: ${input.recovery}`,
    '',
    `Stabilization Movement: ${input.stabilization}`,
    '',
    `Momentum State: ${input.momentum}`,
    '',
    `Unresolved Momentum: ${input.unresolved}`,
    '',
    `Trajectory Volatility: ${input.volatility}`,
    '',
    `Dominant Continuity Driver: ${input.dominantDriver}`,
  ].join('\n')
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))
  if (valid.length === 0) return 0
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length)
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
    'No dominant continuity driver detected'
  )
}

function interpretDirectionStrength(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'DIRECTION STRENGTHENING',
      meaning: 'Continuity direction is becoming more dependable.',
      action: 'Confirm survivability before closure.',
    }
  }

  if (value >= 50) {
    return {
      posture: 'DIRECTION HOLDING',
      meaning: 'Continuity direction is visible but still requires confirmation.',
      action: 'Continue direction monitoring.',
    }
  }

  return {
    posture: 'DIRECTION WEAK',
    meaning: 'Continuity direction is not strong enough for stability confidence.',
    action: 'Review recovery and stabilization barriers.',
  }
}
function interpretDrift(value: number): Interpretation {
  if (value >= 60) {
    return {
      posture: 'DRIFT RISING',
      meaning: 'Continuity drift is strong enough to threaten trajectory.',
      action: 'Escalate drift review.',
    }
  }

  if (value >= 35) {
    return {
      posture: 'DRIFT UNDER WATCH',
      meaning: 'Drift remains visible and must stay under governance review.',
      action: 'Keep drift visible.',
    }
  }

  return {
    posture: 'DRIFT CONTAINED',
    meaning: 'Continuity drift is currently contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretDeterioration(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'DETERIORATION RISK HIGH',
      meaning: 'Deterioration pressure may threaten stabilization credibility.',
      action: 'Escalate deterioration review.',
    }
  }

  if (value >= 45) {
    return {
      posture: 'DETERIORATION UNDER WATCH',
      meaning: 'Deterioration pressure is visible and requires review.',
      action: 'Keep deterioration visible.',
    }
  }

  return {
    posture: 'DETERIORATION CONTAINED',
    meaning: 'Deterioration pressure appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretRecoveryDirection(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'RECOVERY MOVING FORWARD',
      meaning: 'Recovery direction is improving.',
      action: 'Protect the recovery pathway.',
    }
  }

  if (value >= 50) {
    return {
      posture: 'RECOVERY HOLDING',
      meaning: 'Recovery movement is visible but not yet durable.',
      action: 'Continue recovery monitoring.',
    }
  }

  return {
    posture: 'RECOVERY WEAKENING',
    meaning: 'Recovery direction may be weakening.',
    action: 'Review recovery blockers.',
  }
}

function interpretStabilization(value: number): Interpretation {
  if (value >= 70) {
    return {
      posture: 'STABILIZATION STRENGTHENING',
      meaning: 'Stabilization movement is becoming more credible.',
      action: 'Confirm durability before closure.',
    }
  }

  if (value >= 45) {
    return {
      posture: 'STABILIZATION FRAGILE',
      meaning: 'Stabilization movement exists but is not yet durable.',
      action: 'Keep recovery monitoring active.',
    }
  }

  return {
    posture: 'STABILIZATION WEAK',
    meaning: 'Stabilization movement is too weak for confidence.',
    action: 'Review unresolved barriers.',
  }
}

function interpretMomentum(value: number): Interpretation {
  if (value >= 65) {
    return {
      posture: 'ESCALATION MOMENTUM HIGH',
      meaning: 'Escalation momentum may accelerate deterioration.',
      action: 'Escalate momentum review.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'ESCALATION MOMENTUM VISIBLE',
      meaning: 'Escalation momentum remains visible.',
      action: 'Keep escalation under review.',
    }
  }

  return {
    posture: 'ESCALATION MOMENTUM CONTAINED',
    meaning: 'Escalation momentum appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretUnresolved(value: number): Interpretation {
  if (value >= 65) {
    return {
      posture: 'UNRESOLVED MOMENTUM HIGH',
      meaning: 'Unresolved momentum may slow or reverse recovery.',
      action: 'Escalate unresolved momentum review.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'UNRESOLVED MOMENTUM VISIBLE',
      meaning: 'Unresolved momentum remains visible.',
      action: 'Keep follow-up active.',
    }
  }

  return {
    posture: 'UNRESOLVED MOMENTUM CONTAINED',
    meaning: 'Unresolved momentum appears contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretVolatility(value: number): Interpretation {
  if (value >= 30) {
    return {
      posture: 'TRAJECTORY VOLATILE',
      meaning: 'Trajectory movement fluctuates enough to weaken confidence.',
      action: 'Extend trajectory monitoring.',
    }
  }

  if (value >= 18) {
    return {
      posture: 'VARIATION CONTAINED',
      meaning: 'Trajectory variation exists but is not showing collapse.',
      action: 'Watch for repeated instability.',
    }
  }

  return {
    posture: 'TRAJECTORY MOVEMENT STABLE',
    meaning: 'Trajectory movement appears steady.',
    action: 'Maintain routine monitoring.',
  }
}

function interpretMovement(value: number): Interpretation {
  if (value >= 10) {
    return {
      posture: 'PRESSURE MOVING AGAINST TRAJECTORY',
      meaning: 'Trajectory pressure is rising across the reviewed memory.',
      action: 'Review trajectory pressure drivers.',
    }
  }

  if (value <= -10) {
    return {
      posture: 'TRAJECTORY PRESSURE EASING',
      meaning: 'Trajectory pressure is easing across the reviewed memory.',
      action: 'Maintain monitoring.',
    }
  }

  return {
    posture: 'TRAJECTORY MOVEMENT HOLDING',
    meaning: 'Trajectory movement is neither clearly improving nor deteriorating.',
    action: 'Continue comparison across future snapshots.',
  }
}

function interpretHistory(count: number): Interpretation {
  if (count < 3) {
    return {
      posture: 'INSUFFICIENT MEMORY',
      meaning: 'Too few snapshots exist for reliable trajectory interpretation.',
      action: 'Continue saving operational snapshots.',
    }
  }

  if (count < 10) {
    return {
      posture: 'EARLY TRAJECTORY MEMORY',
      meaning: 'Trajectory memory has started but remains early.',
      action: 'Continue building continuity memory.',
    }
  }

  return {
    posture: 'TRAJECTORY MEMORY ESTABLISHED',
    meaning: 'Persisted memory supports continuity direction interpretation.',
    action: 'Use trajectory posture to guide executive review.',
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
    background: 'linear-gradient(180deg, rgba(201,162,39,0.18), rgba(0,0,0,0.38))',
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
    fontSize: 20,
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
    background: 'linear-gradient(135deg, rgba(201,162,39,0.13), rgba(255,255,255,0.035))',
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