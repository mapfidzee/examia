'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  case_status: string
  safeguarding_flag: boolean
  region: string | null
}

type InterventionRecord = {
  id: string
  case_id: string
}

type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status?: string | null
}

const RECOVERY_REPORT_OPTIONS = [
  'Recovery continuity monitoring brief',
  'Recovery stabilization visibility brief',
  'Recovery fragmentation risk brief',
  'Continuity strengthening review',
  'Recovery governance monitoring brief',
]

const RECOVERY_FOCUS_OPTIONS = [
  'Recovery continuity visibility',
  'Stabilization progression monitoring',
  'Fragmentation risk visibility',
  'Safeguarding recovery visibility',
  'Operational recovery governance',
]

const RECOVERY_SCOPE_OPTIONS = [
  'National recovery view',
  'Regional recovery view',
  'District recovery view',
  'Safeguarding recovery view',
  'Continuity governance view',
]

function getRecoveryInterpretation(status: string) {
  if (status === 'RECOVERY_STRENGTHENING') {
    return {
      interpretation:
        'Recovery continuity appears stable and stabilization pathways are strengthening.',
      action:
        'Maintain continuity monitoring and preserve recovery coordination consistency.',
      monitoring: 'Recovery strengthening monitoring remains active.',
    }
  }

  if (status === 'RECOVERY_PRESSURE_VISIBLE') {
    return {
      interpretation:
        'Recovery pressure signals are visible and continuity movement requires closer monitoring.',
      action:
        'Review continuity pathways and reinforce recovery coordination where needed.',
      monitoring: 'Recovery pressure monitoring remains active.',
    }
  }

  return {
    interpretation:
      'Recovery fragmentation risk is visible and stabilization continuity may weaken without coordinated review.',
    action:
      'Escalate recovery continuity review and reinforce stabilization follow-through.',
    monitoring: 'Recovery fragmentation monitoring escalation is active.',
  }
}

export default function RecoveryPage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])

  const [message, setMessage] = useState('')

  const [reportTemplate, setReportTemplate] = useState(
    RECOVERY_REPORT_OPTIONS[0]
  )

  const [recoveryFocus, setRecoveryFocus] = useState(
    RECOVERY_FOCUS_OPTIONS[0]
  )

  const [recoveryScope, setRecoveryScope] = useState(
    RECOVERY_SCOPE_OPTIONS[0]
  )

  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [casesResult, interventionResult, outcomeResult] =
      await Promise.all([
        supabase.from('beneficiary_cases').select('*'),
        supabase.from('case_interventions').select('*'),
        supabase.from('case_outcomes').select('*'),
      ])

    if (casesResult.error) console.error(casesResult.error)
    if (interventionResult.error) console.error(interventionResult.error)
    if (outcomeResult.error) console.error(outcomeResult.error)

    setCases(casesResult.data || [])
    setInterventions(interventionResult.data || [])
    setOutcomes(outcomeResult.data || [])

    setMessage('Recovery continuity intelligence refreshed.')
  }

  const recoveryMetrics = useMemo(() => {
    const totalCases = cases.length

    const stabilizedCases = cases.filter(
      (item) => item.case_status === 'STABILIZED'
    ).length

    const safeguardingFlags = cases.filter(
      (item) => item.safeguarding_flag
    ).length

    const interventionCaseIds = new Set(
      interventions.map((item) => item.case_id)
    )

    const outcomeCaseIds = new Set(
      outcomes.map((item) => item.case_id)
    )

    const interventionCoverage =
      totalCases === 0
        ? 0
        : Math.round((interventionCaseIds.size / totalCases) * 100)

    const outcomeCoverage =
      totalCases === 0
        ? 0
        : Math.round((outcomeCaseIds.size / totalCases) * 100)

    const stabilizationRate =
      totalCases === 0
        ? 0
        : Math.round((stabilizedCases / totalCases) * 100)

    let recoveryStatus = 'RECOVERY_FRAGMENTATION_RISK'

    if (
      stabilizationRate >= 70 &&
      interventionCoverage >= 70 &&
      outcomeCoverage >= 70
    ) {
      recoveryStatus = 'RECOVERY_STRENGTHENING'
    } else if (
      interventionCoverage >= 50 &&
      outcomeCoverage >= 50
    ) {
      recoveryStatus = 'RECOVERY_PRESSURE_VISIBLE'
    }

    return {
      totalCases,
      stabilizedCases,
      safeguardingFlags,
      interventionCoverage,
      outcomeCoverage,
      stabilizationRate,
      recoveryStatus,
    }
  }, [cases, interventions, outcomes])

  const alignedRecovery =
    getRecoveryInterpretation(recoveryMetrics.recoveryStatus)

  const generatedRecoveryBrief = `
EXAMIA LIS RECOVERY CONTINUITY BRIEF

Report Template:
${reportTemplate}

Recovery Focus:
${recoveryFocus}

Recovery Scope:
${recoveryScope}

Recovery Status:
${recoveryMetrics.recoveryStatus}

Recovery Metrics:
Total Cases: ${recoveryMetrics.totalCases}
Stabilized Cases: ${recoveryMetrics.stabilizedCases}
Safeguarding Flags: ${recoveryMetrics.safeguardingFlags}
Intervention Coverage: ${recoveryMetrics.interventionCoverage}%
Outcome Coverage: ${recoveryMetrics.outcomeCoverage}%
Stabilization Rate: ${recoveryMetrics.stabilizationRate}%

Governance Interpretation:
${alignedRecovery.interpretation}

Recommended Action:
${alignedRecovery.action}

Governance-Safe Operational Meaning:
This recovery continuity brief monitors whether stabilization pathways continue moving toward recovery completion, continuity reinforcement, and governance-safe follow-through. It strengthens visibility without assigning blame to responders, institutions, beneficiaries, or partners.

Monitoring Note:
${alignedRecovery.monitoring}

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>
            EXAMIA LIS • RECOVERY CONTINUITY INTELLIGENCE
          </p>

          <h1 style={styles.title}>
            Recovery Continuity Infrastructure
          </h1>

          <p style={styles.subtitle}>
            Monitor stabilization continuity, recovery progression,
            safeguarding recovery pressure, and operational recovery
            fragmentation risk across governed stabilization pathways.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.metricsGrid}>
          <Metric
            label="Recovery Status"
            value={recoveryMetrics.recoveryStatus}
          />

          <Metric
            label="Stabilization Rate"
            value={`${recoveryMetrics.stabilizationRate}%`}
          />

          <Metric
            label="Intervention Coverage"
            value={`${recoveryMetrics.interventionCoverage}%`}
          />

          <Metric
            label="Outcome Coverage"
            value={`${recoveryMetrics.outcomeCoverage}%`}
          />

          <Metric
            label="Safeguarding Flags"
            value={recoveryMetrics.safeguardingFlags.toString()}
          />

          <Metric
            label="Stabilized Cases"
            value={recoveryMetrics.stabilizedCases.toString()}
          />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Recovery Continuity Brief Template
          </h2>

          <p style={styles.helper}>
            Use standardized recovery governance templates to maintain
            continuity visibility, stabilization monitoring, and
            governance-safe recovery interpretation.
          </p>

          <Select
            label="Recovery Report Template"
            value={reportTemplate}
            setValue={setReportTemplate}
            options={RECOVERY_REPORT_OPTIONS}
          />

          <Select
            label="Recovery Focus"
            value={recoveryFocus}
            setValue={setRecoveryFocus}
            options={RECOVERY_FOCUS_OPTIONS}
          />

          <Select
            label="Recovery Scope"
            value={recoveryScope}
            setValue={setRecoveryScope}
            options={RECOVERY_SCOPE_OPTIONS}
          />

          <div style={styles.alignedBox}>
            <h3 style={styles.alignedTitle}>
              Auto-Aligned Recovery Interpretation
            </h3>

            <p style={styles.alignedText}>
              {alignedRecovery.interpretation}
            </p>

            <h3 style={styles.alignedTitle}>
              Auto-Aligned Recommended Action
            </h3>

            <p style={styles.alignedText}>
              {alignedRecovery.action}
            </p>

            <h3 style={styles.alignedTitle}>
              Auto-Aligned Monitoring Note
            </h3>

            <p style={styles.alignedText}>
              {alignedRecovery.monitoring}
            </p>
          </div>

          <label style={styles.label}>
            Optional Additional Operational Notes

            <textarea
              value={additionalNotes}
              onChange={(event) =>
                setAdditionalNotes(event.target.value)
              }
              placeholder="Use operational governance language only."
              style={styles.textarea}
            />
          </label>

          <button onClick={loadData} style={styles.button}>
            Refresh Recovery Intelligence
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Generated Recovery Continuity Brief
          </h2>

          <div style={styles.briefBox}>
            <pre style={styles.pre}>
              {generatedRecoveryBrief}
            </pre>
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>

      <h2 style={styles.metricValue}>{value}</h2>
    </div>
  )
}

function Select({
  label,
  value,
  setValue,
  options,
}: {
  label: string
  value: string
  setValue: (value: string) => void
  options: string[]
}) {
  return (
    <label style={styles.label}>
      {label}

      <select
        value={value}
        onChange={(event) => setValue(event.target.value)}
        style={styles.select}
      >
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
    color: 'white',
    padding: '56px 18px',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  hero: {
    marginBottom: '32px',
  },

  kicker: {
    color: '#67e8f9',
    fontWeight: 900,
    fontSize: '12px',
    letterSpacing: '2px',
  },

  title: {
    fontSize: 'clamp(34px, 6vw, 56px)',
    lineHeight: 1.05,
    margin: '12px 0',
  },

  subtitle: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    maxWidth: '900px',
    fontSize: '18px',
  },

  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '24px',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },

  metricCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '20px',
  },

  metricLabel: {
    color: '#94a3b8',
    fontWeight: 800,
  },

  metricValue: {
    marginTop: '8px',
    fontSize: '26px',
    lineHeight: 1.2,
  },

  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '24px',
  },

  sectionTitle: {
    fontSize: '28px',
    marginBottom: '12px',
  },

  helper: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    marginBottom: '20px',
  },

  label: {
    display: 'block',
    fontWeight: 800,
    marginBottom: '18px',
  },

  select: {
    width: '100%',
    marginTop: '8px',
    padding: '14px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
  },

  textarea: {
    width: '100%',
    minHeight: '120px',
    marginTop: '8px',
    padding: '14px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
    resize: 'vertical',
  },

  button: {
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

  alignedBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
    marginBottom: '20px',
  },

  alignedTitle: {
    color: '#67e8f9',
    fontSize: '14px',
    margin: '0 0 6px',
  },

  alignedText: {
    color: '#e2e8f0',
    lineHeight: 1.6,
    margin: '0 0 16px',
  },

  briefBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '20px',
  },

  pre: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
    margin: 0,
    fontFamily: 'inherit',
  },
}