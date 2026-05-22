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
    setMessage('Loading continuity trustworthiness memory...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Continuity trustworthiness memory could not be loaded.')
      return
    }

    setMetrics(data || [])
    setMessage('Continuity trustworthiness memory loaded.')
  }

  const intelligence = useMemo(() => {
    const ordered = [...metrics].sort(
      (a, b) =>
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
    )

    const latest = ordered[ordered.length - 1] || null

    const reliability = average(
      ordered.map((item) => item.recovery_reliability_score)
    )

    const survivability = average(
      ordered.map((item) => item.operational_survivability_score)
    )

    const continuity = average(
      ordered.map((item) => item.continuity_integrity_score)
    )

    const pressure = average(
      ordered.map((item) => item.escalation_pressure_index)
    )

    const trajectory = average(
      ordered.map((item) => item.trajectory_risk)
    )

    const memoryRisk = average(
      ordered.map((item) => item.structural_memory_risk)
    )

    const drift = average(
      ordered.map((item) => item.continuity_drift)
    )

    const unresolved = average(
      ordered.map((item) => item.unresolved_momentum)
    )

    const volatility = calculateVolatility(
      ordered.map((item) => item.recovery_reliability_score)
    )

    const unresolvedCases = ordered.filter(
      (item) => item.unresolved_momentum >= 50
    ).length

    const overdueCases = ordered.filter(
      (item) => item.continuity_drift >= 50
    ).length

    const failedRecoveries = ordered.filter(
      (item) => item.recovery_reliability_score < 45
    ).length

    const recurrenceRate =
      ordered.length === 0
        ? 0
        : Number(
            (
              ordered.filter(
                (item) =>
                  item.escalation_pressure_index >= 60 ||
                  item.structural_memory_risk >= 60
              ).length / ordered.length
            ).toFixed(2)
          )

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

    const executiveSummary = `${reliabilityInterpretation.summary} The dominant trustworthiness threat is ${dominantWeakness}. ${continuityMeaning.meaning} ${survivabilityMeaning.meaning}`

    const actionCue = compactAction([
      reliabilityInterpretation.executiveAction,
      driftMeaning.action,
      unresolvedMeaning.action,
      survivabilityMeaning.action,
    ])

    return {
      latest,
      reliabilityInterpretation,
      survivabilityMeaning,
      continuityMeaning,
      driftMeaning,
      unresolvedMeaning,
      volatilityMeaning,
      historyDepth,
      dominantWeakness,
      executiveSummary,
      actionCue,
    }
  }, [metrics])

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
      'VOLATILE'
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
    synchronizedBriefing.synthesis.synthesisPosture
  )

  const synchronizedEvidence = formatCGIEvidenceLanguage(
    false,
    synchronizedBriefing.synthesis.synthesisPosture
  )

  const synchronizedSurvivability = formatCGISurvivabilityLanguage(
    synchronizedBriefing.synthesis.synthesisPosture
  )

  const synchronizedGovernance = formatCGIGovernanceSafeLanguage()

  const brief = `
TSINAXA CGI CONTINUITY TRUSTWORTHINESS BRIEF

Reliability Posture:
${intelligence.reliabilityInterpretation.posture}

Synchronized Executive Posture:
${synchronizedPosture.label}

Survivability:
${intelligence.survivabilityMeaning.posture}

Continuity Integrity:
${intelligence.continuityMeaning.posture}

Continuity Drift:
${intelligence.driftMeaning.posture}

Unresolved Stability Pressure:
${intelligence.unresolvedMeaning.posture}

Reliability Volatility:
${intelligence.volatilityMeaning.posture}

Dominant Trustworthiness Threat:
${intelligence.dominantWeakness}

Executive Interpretation:
${synchronizedBriefing.executiveSummary}

Executive Action:
${synchronizedPosture.actionLanguage}

Evidence Requirement:
${synchronizedEvidence}

Survivability Language:
${synchronizedSurvivability}

Governance-Safe Meaning:
${synchronizedGovernance}
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>
            TSINAXA CGI • TRUSTWORTHINESS INTELLIGENCE
          </p>

          <h1 style={styles.title}>
            Continuity Trustworthiness Intelligence
          </h1>

          <p style={styles.subtitle}>
            Executive interpretation of whether stabilization credibility
            remains dependable under sustained operational pressure and
            persisted continuity memory.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>
              Continuity Trustworthiness
            </p>

            <h2 style={styles.heroPosture}>
              {intelligence.reliabilityInterpretation.posture}
            </h2>

            <p style={styles.heroMeaning}>
              {synchronizedBriefing.executiveSummary}
            </p>
          </div>

          <div style={styles.actionBox}>
            <p style={styles.actionLabel}>Executive Action</p>

            <p style={styles.actionText}>
              {synchronizedPosture.actionLanguage}
            </p>
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>
            Synchronized Continuity Reading
          </p>

          <h2 style={styles.cardTitle}>
            {synchronizedPosture.label}
          </h2>

          <p style={styles.bodyText}>
            {synchronizedPosture.description}
          </p>

          <div style={styles.infoList}>
            <Info
              label="Evidence"
              value={synchronizedEvidence}
            />

            <Info
              label="Survivability"
              value={synchronizedSurvivability}
            />

            <Info
              label="Governance"
              value={synchronizedGovernance}
            />
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

        <section style={styles.compactGrid}>
          <CompactCard
            title="Dominant Threat"
            value={intelligence.dominantWeakness}
          />

          <CompactCard
            title="Trustworthiness"
            value={intelligence.reliabilityInterpretation.posture}
          />

          <CompactCard
            title="Synchronized Posture"
            value={synchronizedBriefing.synthesis.synthesisPosture}
          />

          <CompactCard
            title="Current Survivability"
            value={intelligence.survivabilityMeaning.posture}
          />
        </section>

        <section style={styles.twoColumn}>
          <Panel title="Latest Continuity Context">
            <Info
              label="Continuity State"
              value={
                intelligence.latest?.continuity_state ||
                'Not recorded'
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
              label="Dominant Pressure"
              value={
                intelligence.latest?.dominant_pressure_source ||
                'Not recorded'
              }
            />
          </Panel>

          <Panel title="Trustworthiness Reading">
            <Info
              label="Trustworthiness"
              value={
                intelligence.reliabilityInterpretation.posture
              }
            />

            <Info
              label="Survivability"
              value={
                intelligence.survivabilityMeaning.posture
              }
            />

            <Info
              label="Volatility"
              value={
                intelligence.volatilityMeaning.posture
              }
            />

            <Info
              label="Dominant Threat"
              value={intelligence.dominantWeakness}
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
              <h2 style={styles.cardTitle}>
                Recent Trustworthiness Memory
              </h2>

              <p style={styles.cardNote}>
                Recent snapshots are displayed as continuity
                trustworthiness posture, not raw reliability scoring.
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
                  <th style={styles.th}>Continuity</th>
                  <th style={styles.th}>Trustworthiness</th>
                  <th style={styles.th}>Survivability</th>
                  <th style={styles.th}>Pressure</th>
                  <th style={styles.th}>Drift</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No persisted trustworthiness memory found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 8).map((item) => {
                  const rowReliability = interpretReliability({
                    unresolvedCases:
                      item.unresolved_momentum >= 50 ? 1 : 0,

                    overdueCases:
                      item.continuity_drift >= 50 ? 1 : 0,

                    failedRecoveries:
                      item.recovery_reliability_score < 45
                        ? 1
                        : 0,

                    recurrenceRate:
                      item.escalation_pressure_index >= 60 ||
                      item.structural_memory_risk >= 60
                        ? 0.5
                        : 0,
                  })

                  return (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        {formatDate(item.created_at)}
                      </td>

                      <td style={styles.td}>
                        {item.continuity_state}
                      </td>

                      <td style={styles.td}>
                        {rowReliability.posture}
                      </td>

                      <td style={styles.td}>
                        {
                          interpretSurvivability(
                            item.operational_survivability_score
                          ).posture
                        }
                      </td>

                      <td style={styles.td}>
                        {
                          interpretUnresolved(
                            item.unresolved_momentum
                          ).posture
                        }
                      </td>

                      <td style={styles.td}>
                        {
                          interpretDrift(
                            item.continuity_drift
                          ).posture
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            Generated Trustworthiness Brief
          </h2>

          <pre style={styles.summaryBox}>{brief}</pre>
        </section>
      </div>
    </main>
  )
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))

  if (valid.length === 0) return 0

  return Math.round(
    valid.reduce((sum, value) => sum + value, 0) / valid.length
  )
}

function calculateVolatility(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))

  if (valid.length < 2) return 0

  const mean = average(valid)

  const variance =
    valid.reduce(
      (sum, value) => sum + Math.pow(value - mean, 2),
      0
    ) / valid.length

  return Math.min(100, Math.round(Math.sqrt(variance)))
}

function strongestDriver(scores: Record<string, number>) {
  return (
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No dominant trustworthiness threat detected'
  )
}

function interpretSurvivability(
  value: number
): Interpretation {
  if (value >= 75) {
    return {
      posture: 'SURVIVABILITY HOLDING',
      meaning:
        'Continuity survivability is becoming more dependable.',
      action: 'Maintain survivability confirmation monitoring.',
    }
  }

  if (value >= 55) {
    return {
      posture: 'SURVIVABILITY MONITORED',
      meaning:
        'Survivability exists but still requires governance review.',
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
    meaning:
      'Survivability credibility is no longer dependable.',
    action: 'Escalate survivability protection review.',
  }
}

function interpretContinuity(
  value: number
): Interpretation {
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
      meaning:
        'Continuity integrity exists but still requires review.',
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
    meaning:
      'Continuity integrity is weakening beyond safe confidence.',
    action: 'Escalate continuity protection review.',
  }
}

function interpretDrift(value: number): Interpretation {
  if (value >= 60) {
    return {
      posture: 'SEVERE CONTINUITY DRIFT',
      meaning:
        'Continuity drift is strong enough to weaken trustworthiness.',
      action: 'Escalate drift review.',
    }
  }

  if (value >= 40) {
    return {
      posture: 'DRIFT UNDER WATCH',
      meaning:
        'Continuity drift remains visible and requires governance review.',
      action: 'Keep drift visible.',
    }
  }

  return {
    posture: 'DRIFT CONTAINED',
    meaning: 'Continuity drift is currently contained.',
    action: 'Maintain monitoring.',
  }
}

function interpretUnresolved(
  value: number
): Interpretation {
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
      meaning:
        'Unresolved instability pressure remains visible.',
      action: 'Keep ownership and follow-up active.',
    }
  }

  return {
    posture: 'UNRESOLVED PRESSURE CONTAINED',
    meaning:
      'Unresolved instability pressure appears contained.',
    action: 'Continue monitoring.',
  }
}

function interpretVolatility(
  value: number
): Interpretation {
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

function interpretHistory(
  count: number
): Interpretation {
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
      meaning:
        'Continuity trustworthiness memory has started but remains early.',
      action: 'Continue building continuity memory.',
    }
  }

  return {
    posture: 'TRUSTWORTHINESS MEMORY ESTABLISHED',
    meaning:
      'Persisted memory now supports continuity trustworthiness interpretation.',
    action:
      'Use trustworthiness posture to guide executive review.',
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

      <h3 style={styles.postureTitle}>
        {interpretation.posture}
      </h3>

      <p style={styles.postureMeaning}>
        {interpretation.meaning}
      </p>
    </article>
  )
}

function CompactCard({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <article style={styles.compactCard}>
      <p style={styles.cardKicker}>{title}</p>

      <h3 style={styles.compactValue}>{value}</h3>
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

function Info({
  label,
  value,
}: {
  label: string
  value: string
}) {
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
    fontSize: 'clamp(32px, 5vw, 48px)',
    lineHeight: 1.05,
    margin: '10px 0',
  },

  subtitle: {
    color: '#cbd5e1',
    maxWidth: '760px',
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
    gridTemplateColumns:
      'minmax(0, 1.4fr) minmax(260px, 0.6fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #67e8f9',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
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
    fontSize: 'clamp(34px, 6vw, 56px)',
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
  },

  postureGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
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

  compactGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },

  compactCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '104px',
    boxSizing: 'border-box',
  },

  compactValue: {
    fontSize: '18px',
    lineHeight: 1.2,
    margin: '10px 0 0',
    color: '#f8fafc',
    overflowWrap: 'anywhere',
  },

  twoColumn: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '16px',
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
    gridTemplateColumns:
      '160px minmax(0, 1fr)',
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