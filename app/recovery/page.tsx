'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type CgiOperationalMetric = {
  id: string
  created_at: string
  scope: string
  region: string | null
  institution_id: string | null

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

  recovery_direction: number
  stabilization_trend: number
  unresolved_momentum: number
  stabilization_drag: number
  continuity_drift: number
  escalation_momentum: number

  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
  executive_summary: string | null
  action_cue: string | null
}

type RecoveryState =
  | 'INSUFFICIENT_HISTORY'
  | 'RECOVERY_STRENGTHENING'
  | 'RECOVERY_HOLDING'
  | 'RECOVERY_FRAGILE'
  | 'RECOVERY_STALLED'

type ThresholdInterpretation = {
  posture: string
  meaning: string
  action: string
}

type PanelRow = {
  label: string
  value: string
  meaning?: string
}

const SAMPLE_LIMIT = 120

export default function RecoveryPage() {
  return (
    <CGIGovernanceShell>
      <RecoveryContent />
    </CGIGovernanceShell>
  )
}

function RecoveryContent() {
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadRecoveryMetrics()
  }, [])

  async function loadRecoveryMetrics() {
    setMessage('Loading persisted CGI recovery intelligence...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Failed to load persisted CGI recovery intelligence.')
      return
    }

    setMetrics(data || [])
    setMessage('Persisted CGI recovery intelligence loaded.')
  }

  const recovery = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    const latest = ordered[ordered.length - 1] || null
    const previous = ordered[ordered.length - 2] || null

    const earlyWindow = ordered.slice(0, 5)
    const recentWindow = ordered.slice(-5)

    const averageRecoveryReliability = average(
      metrics.map((item) => item.recovery_reliability_score)
    )

    const averageRecoveryDirection = average(
      metrics.map((item) => item.recovery_direction)
    )

    const averageStabilizationTrend = average(
      metrics.map((item) => item.stabilization_trend)
    )

    const averageStabilizationConfidence = average(
      metrics.map((item) => item.stabilization_confidence_score)
    )

    const averageSurvivability = average(
      metrics.map((item) => item.operational_survivability_score)
    )

    const averageContinuityIntegrity = average(
      metrics.map((item) => item.continuity_integrity_score)
    )

    const averageUnresolvedMomentum = average(
      metrics.map((item) => item.unresolved_momentum)
    )

    const averageStabilizationDrag = average(
      metrics.map((item) => item.stabilization_drag)
    )

    const averageContinuityDrift = average(
      metrics.map((item) => item.continuity_drift)
    )

    const averageEscalationMomentum = average(
      metrics.map((item) => item.escalation_momentum)
    )

    const averageInstabilityBurden = average([
      averageUnresolvedMomentum,
      averageStabilizationDrag,
      averageContinuityDrift,
      averageEscalationMomentum,
      average(metrics.map((item) => item.propagation_risk)),
      average(metrics.map((item) => item.trajectory_risk)),
      average(metrics.map((item) => item.structural_memory_risk)),
    ])

    const recoveryConversionScore = clamp(
      average([
        averageRecoveryReliability,
        averageRecoveryDirection,
        averageStabilizationTrend,
        averageStabilizationConfidence,
        averageSurvivability,
        averageContinuityIntegrity,
        100 - averageInstabilityBurden,
      ])
    )

    const earlyRecoveryConversion = average(
      earlyWindow.map((item) => recoveryConversionFromSnapshot(item))
    )

    const recentRecoveryConversion = average(
      recentWindow.map((item) => recoveryConversionFromSnapshot(item))
    )

    const recoveryVelocity =
      metrics.length < 2
        ? 0
        : Math.round(recentRecoveryConversion - earlyRecoveryConversion)

    const latestRecoveryMovement =
      latest && previous
        ? recoveryConversionFromSnapshot(latest) -
          recoveryConversionFromSnapshot(previous)
        : 0

    const recoveryVolatility = calculateVolatility(
      metrics.map((item) => recoveryConversionFromSnapshot(item))
    )

    const recoveryBlockageScore = clamp(
      average([
        averageUnresolvedMomentum,
        averageStabilizationDrag,
        averageContinuityDrift,
        averageEscalationMomentum,
        100 - averageRecoveryReliability,
        100 - averageRecoveryDirection,
        100 - averageStabilizationTrend,
        100 - averageSurvivability,
      ])
    )

    const recoveryState = getRecoveryState({
      count: metrics.length,
      recoveryConversionScore,
      recoveryVelocity,
      recoveryVolatility,
      recoveryBlockageScore,
      latest,
    })

    const dominantRecoveryBlocker = strongestDriver({
      'Unresolved momentum': averageUnresolvedMomentum,
      'Stabilization drag': averageStabilizationDrag,
      'Continuity drift': averageContinuityDrift,
      'Escalation momentum': averageEscalationMomentum,
      'Recovery reliability weakness': 100 - averageRecoveryReliability,
      'Recovery direction weakness': 100 - averageRecoveryDirection,
      'Stabilization trend weakness': 100 - averageStabilizationTrend,
      'Survivability weakness': 100 - averageSurvivability,
      'Stabilization confidence weakness': 100 - averageStabilizationConfidence,
    })

    const recoveryPosture = interpretRecoveryPosture(recoveryState)
    const recoveryDurability = interpretDurability(recoveryConversionScore)
    const recoveryReliability = interpretReliability(averageRecoveryReliability)
    const recoveryDirection = interpretDirection(recoveryVelocity)
    const stabilizationTrend = interpretStabilizationTrend(
      averageStabilizationTrend
    )
    const survivability = interpretSurvivability(averageSurvivability)
    const recoveryPressure = interpretRecoveryPressure(recoveryBlockageScore)
    const volatility = interpretVolatility(recoveryVolatility)
    const instabilityBurden = interpretInstabilityBurden(
      averageInstabilityBurden
    )
    const continuityDrift = interpretContinuityDrift(averageContinuityDrift)
    const historyDepth = interpretHistoryDepth(metrics.length)

    const executiveSummary = getExecutiveSummary({
      recoveryState,
      dominantRecoveryBlocker,
      recoveryDurability,
      recoveryPressure,
      volatility,
      continuityDrift,
    })

    const actionCue = getActionCue({
      recoveryState,
      recoveryPressure,
      continuityDrift,
      volatility,
    })

    return {
      ordered,
      latest,
      recoveryState,
      dominantRecoveryBlocker,
      recoveryPosture,
      recoveryDurability,
      recoveryReliability,
      recoveryDirection,
      stabilizationTrend,
      survivability,
      recoveryPressure,
      volatility,
      instabilityBurden,
      continuityDrift,
      historyDepth,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

  const latestRows: PanelRow[] = recovery.latest
    ? [
        {
          label: 'Latest Continuity State',
          value: recovery.latest.continuity_state,
          meaning:
            'The most recent continuity posture preserved in institutional memory.',
        },
        {
          label: 'Latest Trajectory Direction',
          value: recovery.latest.trajectory_direction,
          meaning:
            'The latest directional signal showing whether recovery movement is improving, holding, or weakening.',
        },
        {
          label: 'Latest Pressure State',
          value: recovery.latest.pressure_propagation_state,
          meaning:
            'The latest pressure classification affecting recovery durability.',
        },
        {
          label: 'Latest Structural Memory State',
          value: recovery.latest.structural_memory_state,
          meaning:
            'Whether recurring patterns remain visible in the continuity memory layer.',
        },
        {
          label: 'Dominant Pressure Source',
          value:
            recovery.latest.dominant_pressure_source ||
            'No pressure source recorded',
          meaning:
            'The main pressure source currently shaping recovery credibility.',
        },
        {
          label: 'Dominant Trajectory Signal',
          value:
            recovery.latest.dominant_trajectory_signal ||
            'No trajectory signal recorded',
          meaning:
            'The strongest visible direction signal in the recovery pathway.',
        },
        {
          label: 'Dominant Memory Pattern',
          value:
            recovery.latest.dominant_memory_pattern ||
            'No memory pattern recorded',
          meaning:
            'The recurring pattern that leadership should not allow to disappear.',
        },
      ]
    : []

  const recoveryRows: PanelRow[] = [
    {
      label: 'Dominant Recovery Blocker',
      value: recovery.dominantRecoveryBlocker,
      meaning:
        'The strongest visible barrier preventing recovery from becoming durable.',
    },
    {
      label: 'Recovery Direction',
      value: recovery.recoveryDirection.posture,
      meaning: recovery.recoveryDirection.meaning,
    },
    {
      label: 'Recovery Volatility',
      value: recovery.volatility.posture,
      meaning: recovery.volatility.meaning,
    },
    {
      label: 'Recovery Pressure',
      value: recovery.recoveryPressure.posture,
      meaning: recovery.recoveryPressure.meaning,
    },
    {
      label: 'Instability Burden',
      value: recovery.instabilityBurden.posture,
      meaning: recovery.instabilityBurden.meaning,
    },
    {
      label: 'Continuity Drift',
      value: recovery.continuityDrift.posture,
      meaning: recovery.continuityDrift.meaning,
    },
  ]

  const brief = `
TSINAXA CGI RECOVERY INTELLIGENCE BRIEF

Recovery Posture:
${recovery.recoveryPosture.posture}

History Depth:
${recovery.historyDepth.posture}

Recovery Durability:
${recovery.recoveryDurability.posture}

Recovery Reliability:
${recovery.recoveryReliability.posture}

Recovery Direction:
${recovery.recoveryDirection.posture}

Stabilization Trend:
${recovery.stabilizationTrend.posture}

Survivability:
${recovery.survivability.posture}

Recovery Pressure:
${recovery.recoveryPressure.posture}

Recovery Volatility:
${recovery.volatility.posture}

Continuity Drift:
${recovery.continuityDrift.posture}

Dominant Recovery Blocker:
${recovery.dominantRecoveryBlocker}

Executive Interpretation:
${recovery.executiveSummary}

Recommended Action:
${recovery.actionCue}

Governance-Safe Meaning:
This recovery view uses persisted CGI operational memory. It does not judge people. It interprets whether stabilization, recovery reliability, survivability, and direction are converting into credible recovery over time.
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • RECOVERY INTELLIGENCE</p>

          <h1 style={styles.title}>Continuity Recovery Intelligence</h1>

          <p style={styles.subtitle}>
            Interpret whether stabilization is becoming durable recovery using
            threshold posture, operational meaning, and executive action cues.
            Internal calculations remain hidden; leadership sees recovery
            credibility.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.recoveryHero}>
          <div>
            <p style={styles.scoreLabel}>Recovery Posture</p>
            <h2 style={styles.recoveryState}>
              {recovery.recoveryPosture.posture}
            </h2>
            <p style={styles.panelNote}>{recovery.executiveSummary}</p>
          </div>

          <div style={styles.scoreGrid}>
            <PostureMetric
              label="Recovery Durability"
              interpretation={recovery.recoveryDurability}
            />
            <PostureMetric
              label="Recovery Reliability"
              interpretation={recovery.recoveryReliability}
            />
            <PostureMetric
              label="Recovery Direction"
              interpretation={recovery.recoveryDirection}
            />
            <PostureMetric
              label="Stabilization Trend"
              interpretation={recovery.stabilizationTrend}
            />
            <PostureMetric
              label="Survivability"
              interpretation={recovery.survivability}
            />
            <PostureMetric
              label="Recovery Pressure"
              interpretation={recovery.recoveryPressure}
            />
          </div>

          <div style={styles.actionBox}>
            <strong>Recommended Action:</strong>
            <span>{recovery.actionCue}</span>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="History Depth" value={recovery.historyDepth.posture} />
          <Metric
            label="Dominant Blocker"
            value={recovery.dominantRecoveryBlocker}
          />
          <Metric
            label="Recovery Volatility"
            value={recovery.volatility.posture}
          />
          <Metric
            label="Instability Burden"
            value={recovery.instabilityBurden.posture}
          />
          <Metric
            label="Continuity Drift"
            value={recovery.continuityDrift.posture}
          />
          <Metric
            label="Latest Movement"
            value={recovery.recoveryDirection.posture}
          />
        </section>

        <section style={styles.layoutGrid}>
          <Panel
            title="Latest Persisted Recovery Context"
            note="Most recent saved operational recovery context."
            rows={latestRows}
          />

          <Panel
            title="Recovery Conversion Reading"
            note="Shows whether stabilization signals are becoming credible recovery."
            rows={recoveryRows}
          />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Recent Recovery Memory Trail</h2>

          <p style={styles.panelNote}>
            Latest saved rows from <code>cgi_operational_metrics</code>.
            Values are interpreted into threshold language so the page remains
            executive-readable.
          </p>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Scope</th>
                  <th style={styles.th}>Continuity</th>
                  <th style={styles.th}>Recovery Reliability</th>
                  <th style={styles.th}>Recovery Direction</th>
                  <th style={styles.th}>Stabilization Trend</th>
                  <th style={styles.th}>Survivability</th>
                  <th style={styles.th}>Unresolved Momentum</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={8}>
                      No persisted CGI recovery memory found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 12).map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{formatDate(item.created_at)}</td>
                    <td style={styles.td}>{item.scope}</td>
                    <td style={styles.td}>{item.continuity_state}</td>
                    <td style={styles.td}>
                      {interpretReliability(item.recovery_reliability_score).posture}
                    </td>
                    <td style={styles.td}>
                      {interpretDirection(item.recovery_direction - 50).posture}
                    </td>
                    <td style={styles.td}>
                      {interpretStabilizationTrend(item.stabilization_trend).posture}
                    </td>
                    <td style={styles.td}>
                      {interpretSurvivability(
                        item.operational_survivability_score
                      ).posture}
                    </td>
                    <td style={styles.td}>
                      {interpretInstabilityBurden(item.unresolved_momentum).posture}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={loadRecoveryMetrics} style={styles.primaryButton}>
            Refresh Recovery Intelligence
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Generated Recovery Brief</h2>
          <pre style={styles.summaryBox}>{brief}</pre>
        </section>
      </div>
    </main>
  )
}

function recoveryConversionFromSnapshot(item: CgiOperationalMetric) {
  return clamp(
    average([
      item.recovery_reliability_score,
      item.recovery_direction,
      item.stabilization_trend,
      item.stabilization_confidence_score,
      item.operational_survivability_score,
      item.continuity_integrity_score,
      100 -
        average([
          item.unresolved_momentum,
          item.stabilization_drag,
          item.continuity_drift,
          item.escalation_momentum,
          item.propagation_risk,
          item.trajectory_risk,
          item.structural_memory_risk,
        ]),
    ])
  )
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))
  if (valid.length === 0) return 0
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length)
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
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
    'No dominant recovery blocker detected'
  )
}

function getRecoveryState(input: {
  count: number
  recoveryConversionScore: number
  recoveryVelocity: number
  recoveryVolatility: number
  recoveryBlockageScore: number
  latest: CgiOperationalMetric | null
}): RecoveryState {
  if (input.count < 3) return 'INSUFFICIENT_HISTORY'

  if (
    input.recoveryConversionScore >= 65 &&
    input.recoveryVelocity >= 5 &&
    input.recoveryBlockageScore < 40 &&
    input.recoveryVolatility < 25
  ) {
    return 'RECOVERY_STRENGTHENING'
  }

  if (
    input.recoveryConversionScore < 35 ||
    input.recoveryVelocity <= -10 ||
    input.recoveryBlockageScore >= 65 ||
    input.latest?.continuity_state === 'UNSTABLE'
  ) {
    return 'RECOVERY_STALLED'
  }

  if (
    input.recoveryConversionScore < 50 ||
    input.recoveryBlockageScore >= 50 ||
    input.recoveryVolatility >= 25
  ) {
    return 'RECOVERY_FRAGILE'
  }

  return 'RECOVERY_HOLDING'
}

function interpretRecoveryPosture(state: RecoveryState): ThresholdInterpretation {
  if (state === 'INSUFFICIENT_HISTORY') {
    return {
      posture: 'INSUFFICIENT RECOVERY HISTORY',
      meaning:
        'There is not enough persisted recovery memory to judge durability over time.',
      action:
        'Continue saving operational snapshots before relying on recovery interpretation.',
    }
  }

  if (state === 'RECOVERY_STRENGTHENING') {
    return {
      posture: 'RECOVERY STRENGTHENING',
      meaning:
        'Recovery signals are improving and stabilization credibility is moving in a favorable direction.',
      action:
        'Preserve monitoring discipline and confirm survivability remains durable.',
    }
  }

  if (state === 'RECOVERY_STALLED') {
    return {
      posture: 'RECOVERY STALLED',
      meaning:
        'Stabilization signals are not converting into durable recovery strongly enough.',
      action:
        'Review unresolved momentum, stabilization drag, survivability, and outcome confirmation immediately.',
    }
  }

  if (state === 'RECOVERY_FRAGILE') {
    return {
      posture: 'RECOVERY FRAGILE',
      meaning:
        'Some recovery movement exists, but unresolved instability may weaken durability.',
      action:
        'Strengthen follow-up, ownership, and recovery monitoring before recovery weakens.',
    }
  }

  return {
    posture: 'RECOVERY HOLDING',
    meaning:
      'Recovery is visible and currently holding, but durability still requires continued confirmation.',
    action:
      'Maintain monitoring and continue saving snapshots to confirm whether recovery remains durable.',
  }
}

function interpretDurability(score: number): ThresholdInterpretation {
  if (score >= 70) {
    return {
      posture: 'DURABILITY IMPROVING',
      meaning:
        'Recovery signals are converting into stronger stabilization credibility.',
      action: 'Continue monitoring until survivability is confirmed.',
    }
  }

  if (score >= 50) {
    return {
      posture: 'MONITORED RECOVERY',
      meaning:
        'Recovery signals exist, but stabilization durability is not yet fully credible.',
      action:
        'Maintain governed monitoring and verify whether recovery holds over time.',
    }
  }

  return {
    posture: 'DURABILITY NOT YET CREDIBLE',
    meaning:
      'Recovery evidence is too weak to treat stabilization as durable.',
    action:
      'Escalate review of unresolved pressure, continuity drift, and recovery reliability.',
  }
}

function interpretReliability(score: number): ThresholdInterpretation {
  if (score >= 70) {
    return {
      posture: 'RELIABILITY STRENGTHENING',
      meaning: 'Recovery reliability is moving toward a credible holding pattern.',
      action: 'Preserve the current recovery discipline.',
    }
  }

  if (score >= 45) {
    return {
      posture: 'RELIABILITY HOLDING',
      meaning:
        'Recovery reliability exists, but still needs confirmation before closure is trusted.',
      action: 'Keep follow-up active and watch for recurrence.',
    }
  }

  return {
    posture: 'RELIABILITY WEAK',
    meaning:
      'Recovery reliability is not strong enough to support durable stabilization.',
    action: 'Review intervention quality, ownership, and monitoring continuity.',
  }
}

function interpretDirection(value: number): ThresholdInterpretation {
  if (value >= 10) {
    return {
      posture: 'RECOVERY MOVING FORWARD',
      meaning: 'Recovery direction is improving across the reviewed memory window.',
      action: 'Continue monitoring and protect the recovery pathway.',
    }
  }

  if (value <= -10) {
    return {
      posture: 'RECOVERY LOSING GROUND',
      meaning:
        'Recovery direction is weakening and may require leadership review.',
      action: 'Investigate drift, recurrence, and unresolved stabilization pressure.',
    }
  }

  return {
    posture: 'RECOVERY DIRECTION HOLDING',
    meaning:
      'Recovery direction is not clearly improving or collapsing. Continued monitoring is needed.',
    action: 'Maintain the monitoring window before declaring durability.',
  }
}

function interpretStabilizationTrend(score: number): ThresholdInterpretation {
  if (score >= 70) {
    return {
      posture: 'STABILIZATION STRENGTHENING',
      meaning: 'Stabilization signals are becoming more credible.',
      action: 'Continue validating survivability before closure.',
    }
  }

  if (score >= 45) {
    return {
      posture: 'STABILIZATION FRAGILE',
      meaning:
        'Improvement signals are visible, but not yet durable enough for survivability confidence.',
      action: 'Keep recovery monitoring active.',
    }
  }

  return {
    posture: 'STABILIZATION WEAK',
    meaning:
      'Stabilization signals remain weak and may not support credible recovery.',
    action: 'Review unresolved barriers and intervention follow-through.',
  }
}

function interpretSurvivability(score: number): ThresholdInterpretation {
  if (score >= 70) {
    return {
      posture: 'SURVIVABILITY IMPROVING',
      meaning: 'The system is showing stronger signs of durable recovery.',
      action: 'Maintain monitoring until survivability is confirmed.',
    }
  }

  if (score >= 45) {
    return {
      posture: 'SURVIVABILITY MONITORED',
      meaning:
        'Survivability exists but remains under review. Closure should not be assumed.',
      action: 'Continue continuity monitoring and recurrence review.',
    }
  }

  return {
    posture: 'SURVIVABILITY AT RISK',
    meaning:
      'Recovery may not survive if unresolved pressure or drift continues.',
    action: 'Escalate survivability review.',
  }
}

function interpretRecoveryPressure(score: number): ThresholdInterpretation {
  if (score >= 65) {
    return {
      posture: 'HIGH RECOVERY PRESSURE',
      meaning:
        'Structural friction is strong enough to threaten recovery durability.',
      action: 'Escalate pressure review and verify recovery ownership.',
    }
  }

  if (score >= 35) {
    return {
      posture: 'MODERATE STRUCTURAL FRICTION',
      meaning:
        'Unresolved stabilization drag remains visible and should stay under governance review.',
      action: 'Maintain monitoring and reduce unresolved recovery blockers.',
    }
  }

  return {
    posture: 'PRESSURE CONTAINED',
    meaning: 'Recovery pressure appears contained in the current memory window.',
    action: 'Continue routine recovery monitoring.',
  }
}

function interpretVolatility(score: number): ThresholdInterpretation {
  if (score >= 35) {
    return {
      posture: 'RECOVERY VOLATILE',
      meaning:
        'Recovery movement is fluctuating enough to weaken confidence in durability.',
      action: 'Extend the monitoring window and review recurrence pressure.',
    }
  }

  if (score >= 18) {
    return {
      posture: 'CONTAINED VARIATION',
      meaning:
        'Recovery movement varies, but not enough to indicate clear collapse.',
      action: 'Continue watching for repeated instability.',
    }
  }

  return {
    posture: 'RECOVERY CONSISTENT',
    meaning: 'Recovery movement appears steady in the current memory window.',
    action: 'Maintain confirmation monitoring.',
  }
}

function interpretInstabilityBurden(score: number): ThresholdInterpretation {
  if (score >= 65) {
    return {
      posture: 'HEAVY INSTABILITY BURDEN',
      meaning:
        'Unresolved instability remains high enough to threaten recovery credibility.',
      action: 'Escalate unresolved momentum and pressure review.',
    }
  }

  if (score >= 35) {
    return {
      posture: 'MODERATE INSTABILITY BURDEN',
      meaning:
        'Instability remains visible but is not yet showing full recovery collapse.',
      action: 'Keep continuity monitoring active.',
    }
  }

  return {
    posture: 'INSTABILITY BURDEN CONTAINED',
    meaning:
      'Visible instability burden appears contained in the current recovery window.',
    action: 'Continue routine monitoring.',
  }
}

function interpretContinuityDrift(score: number): ThresholdInterpretation {
  if (score >= 55) {
    return {
      posture: 'CONTINUITY DRIFT RISING',
      meaning:
        'Recovery may be weakening because continuity drift is becoming more visible.',
      action: 'Review drift sources and recovery ownership immediately.',
    }
  }

  if (score >= 25) {
    return {
      posture: 'DRIFT UNDER WATCH',
      meaning:
        'Some continuity drift is visible and should remain under governance review.',
      action: 'Keep drift visible until recovery durability is confirmed.',
    }
  }

  return {
    posture: 'DRIFT CONTAINED',
    meaning:
      'Continuity drift is currently contained in the reviewed memory window.',
    action: 'Maintain monitoring.',
  }
}

function interpretHistoryDepth(count: number): ThresholdInterpretation {
  if (count < 3) {
    return {
      posture: 'INSUFFICIENT HISTORY',
      meaning:
        'There are too few persisted snapshots to judge recovery durability.',
      action: 'Continue saving operational snapshots.',
    }
  }

  if (count < 10) {
    return {
      posture: 'EARLY HISTORY',
      meaning:
        'There is enough memory to begin interpretation, but recovery confidence remains early.',
      action: 'Continue building continuity memory.',
    }
  }

  return {
    posture: 'RECOVERY MEMORY ESTABLISHED',
    meaning:
      'There is enough persisted memory to support recovery interpretation.',
    action: 'Use threshold posture to guide review.',
  }
}

function getExecutiveSummary(input: {
  recoveryState: RecoveryState
  dominantRecoveryBlocker: string
  recoveryDurability: ThresholdInterpretation
  recoveryPressure: ThresholdInterpretation
  volatility: ThresholdInterpretation
  continuityDrift: ThresholdInterpretation
}) {
  if (input.recoveryState === 'INSUFFICIENT_HISTORY') {
    return 'There is not enough persisted recovery memory yet to judge durability. Continue saving operational snapshots before relying on recovery interpretation.'
  }

  return `${input.recoveryDurability.meaning} Dominant blocker: ${input.dominantRecoveryBlocker}. ${input.recoveryPressure.meaning} ${input.volatility.meaning} ${input.continuityDrift.meaning}`
}

function getActionCue(input: {
  recoveryState: RecoveryState
  recoveryPressure: ThresholdInterpretation
  continuityDrift: ThresholdInterpretation
  volatility: ThresholdInterpretation
}) {
  if (input.recoveryState === 'RECOVERY_STALLED') {
    return 'Executive review is required before recovery can be treated as credible.'
  }

  if (input.recoveryState === 'RECOVERY_FRAGILE') {
    return 'Strengthen follow-up, ownership, and recovery monitoring before instability returns.'
  }

  if (input.recoveryState === 'RECOVERY_STRENGTHENING') {
    return 'Preserve recovery discipline and continue confirming survivability.'
  }

  return `${input.recoveryPressure.action} ${input.continuityDrift.action} ${input.volatility.action}`
}

function formatDate(value: string) {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleString()
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <h2 style={styles.metricValue}>{value}</h2>
    </div>
  )
}

function PostureMetric({
  label,
  interpretation,
}: {
  label: string
  interpretation: ThresholdInterpretation
}) {
  return (
    <div style={styles.scoreCard}>
      <p style={styles.scoreMetricLabel}>{label}</p>
      <h3 style={styles.scoreMetricValue}>{interpretation.posture}</h3>
      <p style={styles.scoreMeaning}>{interpretation.meaning}</p>
    </div>
  )
}

function Panel({
  title,
  note,
  rows,
}: {
  title: string
  note: string
  rows: PanelRow[]
}) {
  return (
    <div style={styles.card}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <p style={styles.panelNote}>{note}</p>

      <div style={styles.panelList}>
        {rows.length === 0 && <p style={styles.emptyText}>No data available yet.</p>}

        {rows.map((row, index) => (
          <div key={`${row.label}-${index}`} style={styles.panelRow}>
            <div>
              <span style={styles.panelRowLabel}>{row.label}</span>
              {row.meaning && <p style={styles.panelRowMeaning}>{row.meaning}</p>}
            </div>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: 'white',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  hero: {
    marginBottom: '32px',
  },
  kicker: {
    color: '#67e8f9',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
  },
  title: {
    fontSize: 'clamp(34px, 6vw, 58px)',
    lineHeight: 1.05,
    margin: '12px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '980px',
    lineHeight: 1.7,
    fontSize: '18px',
  },
  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '20px',
  },
  recoveryHero: {
    background: '#020617',
    border: '1px solid #22c55e',
    borderRadius: '28px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
  },
  scoreLabel: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  recoveryState: {
    fontSize: 'clamp(36px, 7vw, 68px)',
    margin: '8px 0 20px',
    color: '#86efac',
    letterSpacing: '-0.05em',
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '14px',
  },
  scoreCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
  },
  scoreMetricLabel: {
    color: '#94a3b8',
    fontWeight: 800,
    margin: 0,
  },
  scoreMetricValue: {
    color: '#f8fafc',
    fontSize: '22px',
    margin: '10px 0 0',
    lineHeight: 1.15,
  },
  scoreMeaning: {
    color: '#cbd5e1',
    lineHeight: 1.55,
    fontSize: '14px',
    marginTop: '10px',
  },
  actionBox: {
    display: 'grid',
    gap: '8px',
    background: '#052e16',
    border: '1px solid #22c55e',
    borderRadius: '18px',
    padding: '18px',
    marginTop: '16px',
    color: '#dcfce7',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },
  metricCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '20px',
    overflow: 'hidden',
  },
  metricLabel: {
    color: '#94a3b8',
    fontWeight: 800,
    margin: 0,
  },
  metricValue: {
    fontSize: 'clamp(20px, 3vw, 28px)',
    margin: '8px 0 0',
    overflowWrap: 'anywhere',
    lineHeight: 1.15,
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },
  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '28px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.35)',
  },
  sectionTitle: {
    fontSize: '26px',
    margin: '0 0 10px',
  },
  panelNote: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    marginBottom: '18px',
  },
  panelList: {
    display: 'grid',
    gap: '10px',
  },
  panelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '14px',
  },
  panelRowLabel: {
    color: '#f8fafc',
    fontWeight: 800,
  },
  panelRowMeaning: {
    color: '#94a3b8',
    margin: '6px 0 0',
    lineHeight: 1.5,
    fontSize: '13px',
  },
  emptyText: {
    color: '#94a3b8',
  },
  tableWrap: {
    overflowX: 'auto',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1000px',
  },
  th: {
    textAlign: 'left',
    color: '#94a3b8',
    borderBottom: '1px solid #334155',
    padding: '12px',
    fontSize: '12px',
    textTransform: 'uppercase',
  },
  td: {
    borderBottom: '1px solid #1e293b',
    padding: '12px',
    color: '#e2e8f0',
    verticalAlign: 'top',
    fontWeight: 700,
  },
  primaryButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '14px',
    border: 'none',
    background: '#67e8f9',
    color: '#082f49',
    fontWeight: 900,
    cursor: 'pointer',
    fontSize: '16px',
  },
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
    color: '#e2e8f0',
    lineHeight: 1.6,
    minHeight: '360px',
  },
}