'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  case_status: string
  safeguarding_flag: boolean
}

type RoutingAction = {
  id: string
  assigned_responder_id: string | null
}

type InterventionRecord = {
  id: string
  case_id: string
}

type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status: string | null
}

const REPORT_TEMPLATES = [
  'Continuity recovery visibility brief',
  'Recovery strengthening coordination brief',
  'Stabilization recovery pathway brief',
  'Regional recovery continuity brief',
]

const RECOVERY_FOCUS_OPTIONS = [
  'Recovery strengthening visibility',
  'Continuity recovery monitoring',
  'Stabilization rebound visibility',
  'Recovery fragmentation prevention',
]

const OPERATING_SCOPE_OPTIONS = [
  'National view',
  'Regional view',
  'District view',
  'Responder-focused',
]

export default function RecoveryIntelligencePage() {
  const [mounted, setMounted] = useState(false)

  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])

  const [reportTemplate, setReportTemplate] = useState(
    'Continuity recovery visibility brief'
  )

  const [recoveryFocus, setRecoveryFocus] = useState(
    'Recovery strengthening visibility'
  )

  const [operatingScope, setOperatingScope] =
    useState('Regional view')

  const [notes, setNotes] = useState('')

  useEffect(() => {
    setMounted(true)
    loadAll()
  }, [])

  if (!mounted) return null

  async function loadAll() {
    const [
      casesResponse,
      routingResponse,
      interventionResponse,
      outcomeResponse,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*'),
    ])

    setCases(casesResponse.data || [])
    setRoutingActions(routingResponse.data || [])
    setInterventions(interventionResponse.data || [])
    setOutcomes(outcomeResponse.data || [])
  }

  const totalCases = cases.length

  const activeCases = cases.filter(
    (item) =>
      item.case_status !== 'STABILIZED' &&
      item.case_status !== 'CLOSED'
  ).length

  const stabilizedCases = cases.filter(
    (item) => item.case_status === 'STABILIZED'
  ).length

  const safeguardingFlags = cases.filter(
    (item) => item.safeguarding_flag
  ).length

  const interventionCoverage =
    totalCases === 0
      ? 0
      : Math.round(
          (new Set(interventions.map((i) => i.case_id)).size /
            totalCases) *
            100
        )

  const outcomeCoverage =
    totalCases === 0
      ? 0
      : Math.round(
          (new Set(outcomes.map((o) => o.case_id)).size /
            totalCases) *
            100
        )

  const stabilizationRate =
    totalCases === 0
      ? 0
      : Math.round((stabilizedCases / totalCases) * 100)

  const unresolvedCases = activeCases

  const recoveryStatus = deriveRecoveryStatus()

  const governanceInterpretation =
    recoveryStatus === 'RECOVERY_STRENGTHENING'
      ? 'Recovery continuity is strengthening and stabilization pathways remain coordinated.'
      : recoveryStatus === 'RECOVERY_PRESSURE_VISIBLE'
      ? 'Recovery continuity pressure is visible and requires stabilization review.'
      : 'Recovery fragmentation signals are visible and continuity strengthening is required.'

  const recommendedAction =
    recoveryStatus === 'RECOVERY_STRENGTHENING'
      ? 'Maintain continuity monitoring and stabilization coordination.'
      : recoveryStatus === 'RECOVERY_PRESSURE_VISIBLE'
      ? 'Review recovery continuity pathways and monitor stabilization gaps.'
      : 'Strengthen recovery coordination and reduce continuity fragmentation risk.'

  const monitoringNote =
    recoveryStatus === 'RECOVERY_STRENGTHENING'
      ? 'Recovery continuity monitoring remains active.'
      : recoveryStatus === 'RECOVERY_PRESSURE_VISIBLE'
      ? 'Recovery pressure monitoring remains active.'
      : 'Recovery fragmentation monitoring remains active.'

  function deriveRecoveryStatus() {
    if (
      stabilizationRate >= 70 &&
      interventionCoverage >= 70 &&
      outcomeCoverage >= 70
    ) {
      return 'RECOVERY_STRENGTHENING'
    }

    if (
      interventionCoverage >= 50 &&
      outcomeCoverage >= 50
    ) {
      return 'RECOVERY_PRESSURE_VISIBLE'
    }

    return 'RECOVERY_FRAGMENTATION_RISK'
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>
            EXAMIA LIS • CONTINUITY RECOVERY INTELLIGENCE
          </p>

          <h1 style={styles.title}>
            Continuity Recovery Infrastructure
          </h1>

          <p style={styles.subtitle}>
            Detect recovery strengthening, continuity weakening,
            stabilization rebound pressure, and re-fragmentation
            risk before operational recovery pathways collapse.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric
            label="Recovery Status"
            value={recoveryStatus}
          />

          <Metric
            label="Active Cases"
            value={String(activeCases)}
          />

          <Metric
            label="Unresolved Cases"
            value={String(unresolvedCases)}
          />

          <Metric
            label="Safeguarding Flags"
            value={String(safeguardingFlags)}
          />

          <Metric
            label="Intervention Coverage"
            value={`${interventionCoverage}%`}
          />

          <Metric
            label="Outcome Coverage"
            value={`${outcomeCoverage}%`}
          />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Continuity Recovery Brief Template
          </h2>

          <p style={styles.helperText}>
            Use standardized dropdowns to keep recovery
            intelligence governance-safe, operationally coherent,
            and nationally consistent.
          </p>

          <Select
            label="Report Template"
            value={reportTemplate}
            setValue={setReportTemplate}
            options={REPORT_TEMPLATES}
          />

          <Select
            label="Recovery Focus"
            value={recoveryFocus}
            setValue={setRecoveryFocus}
            options={RECOVERY_FOCUS_OPTIONS}
          />

          <Select
            label="Operating Scope"
            value={operatingScope}
            setValue={setOperatingScope}
            options={OPERATING_SCOPE_OPTIONS}
          />

          <div style={styles.autoBox}>
            <strong>
              Auto-Aligned Governance Interpretation
            </strong>

            <p>{governanceInterpretation}</p>
          </div>

          <div style={styles.autoBox}>
            <strong>Auto-Aligned Recommended Action</strong>

            <p>{recommendedAction}</p>
          </div>

          <div style={styles.autoBox}>
            <strong>Auto-Aligned Monitoring Note</strong>

            <p>{monitoringNote}</p>
          </div>

          <label style={styles.label}>
            Optional Additional Operational Notes

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={styles.textarea}
              placeholder="Use operational language only. Avoid blame or unnecessary personal details."
            />
          </label>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Generated Recovery Brief
          </h2>

          <div style={styles.briefBox}>
            <pre style={styles.pre}>
{`EXAMIA LIS CONTINUITY RECOVERY INTELLIGENCE BRIEF

Report Template:
${reportTemplate}

Recovery Focus:
${recoveryFocus}

Operating Scope:
${operatingScope}

Recovery Status:
${recoveryStatus}

Recovery Metrics:
Total Cases: ${totalCases}
Active Cases: ${activeCases}
Unresolved Cases: ${unresolvedCases}
Safeguarding Flags: ${safeguardingFlags}
Routing Actions: ${routingActions.length}
Intervention Coverage: ${interventionCoverage}%
Outcome Coverage: ${outcomeCoverage}%
Stabilization Rate: ${stabilizationRate}%

Governance Interpretation:
${governanceInterpretation}

Recommended Action:
${recommendedAction}

Governance-Safe Operational Meaning:
This continuity recovery intelligence brief identifies whether stabilization pathways are strengthening, weakening, fragmenting, or recovering across interventions, routing activity, outcomes, safeguarding visibility, and coordination continuity. It supports early recovery visibility before operational fragmentation reappears. It does not assign blame to institutions, responders, beneficiaries, or partners.

Governance Monitoring Note:
${monitoringNote}

Additional Operational Notes:
${notes || 'No additional operational notes entered.'}
`}
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
}: any) {
  return (
    <label style={styles.label}>
      {label}

      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={styles.select}
      >
        {options.map((option: string) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
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
    letterSpacing: '2px',
    fontSize: '12px',
  },

  title: {
    fontSize: '56px',
    lineHeight: 1.05,
    margin: '12px 0',
  },

  subtitle: {
    color: '#cbd5e1',
    maxWidth: '900px',
    lineHeight: 1.7,
    fontSize: '18px',
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
    fontSize: '22px',
    marginTop: '8px',
    wordBreak: 'break-word',
  },

  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '28px',
  },

  sectionTitle: {
    fontSize: '28px',
    marginBottom: '14px',
  },

  helperText: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    marginBottom: '22px',
  },

  label: {
    display: 'block',
    fontWeight: 800,
    marginBottom: '16px',
  },

  select: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
    marginTop: '8px',
  },

  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #334155',
    background: '#111827',
    color: 'white',
    marginTop: '8px',
  },

  autoBox: {
    background: '#082f49',
    border: '1px solid #0e7490',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px',
    lineHeight: 1.6,
  },

  briefBox: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '18px',
  },

  pre: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
    fontSize: '14px',
    margin: 0,
  },
}