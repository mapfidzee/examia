'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import InfrastructureQuickNav from '@/components/InfrastructureQuickNav'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  case_status: string
  safeguarding_flag: boolean
}

type InterventionRecord = {
  case_id: string
}

type OutcomeRecord = {
  case_id: string
}

type RoutingAction = {
  case_id: string
}

const TRAJECTORY_REPORT_TEMPLATES = [
  'Predictive stabilization trajectory brief',
  'Regional continuity trajectory brief',
  'District stabilization pathway brief',
  'Responder continuity visibility brief',
  'Safeguarding trajectory monitoring brief',
]

const TRAJECTORY_FOCUS_OPTIONS = [
  'Stabilization continuity visibility',
  'Escalation trajectory visibility',
  'Responder continuity pressure',
  'Safeguarding accumulation trajectory',
  'Recovery strengthening visibility',
]

const TRAJECTORY_SCOPE_OPTIONS = [
  'National view',
  'Regional view',
  'District view',
  'Institution-focused',
  'Responder-focused',
]

const GOVERNANCE_INTERPRETATIONS = [
  'Trajectory signals remain stable with continued monitoring.',
  'Continuity weakening is visible and requires coordination attention.',
  'Escalation trajectory pressure is increasing.',
  'Recovery strengthening signals are visible.',
  'Fragmented stabilization continuity requires intervention review.',
]

const RECOMMENDED_ACTIONS = [
  'Maintain stabilization monitoring.',
  'Increase continuity coordination review.',
  'Strengthen responder coordination pathways.',
  'Increase safeguarding monitoring visibility.',
  'Review intervention continuity for unstable trajectories.',
]

const GOVERNANCE_NOTE_TEMPLATES = [
  'Continuity monitoring remains active.',
  'No immediate escalation accumulation detected.',
  'Forecast stabilization pressure remains manageable.',
  'Coordination review recommended for fragmented continuity.',
  'Safeguarding trajectory visibility remains active.',
]

export default function TrajectoryPage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])

  const [message, setMessage] = useState('')

  const [reportTemplate, setReportTemplate] = useState(
    TRAJECTORY_REPORT_TEMPLATES[0]
  )

  const [trajectoryFocus, setTrajectoryFocus] = useState(
    TRAJECTORY_FOCUS_OPTIONS[0]
  )

  const [trajectoryScope, setTrajectoryScope] = useState(
    TRAJECTORY_SCOPE_OPTIONS[1]
  )

  const [governanceInterpretation, setGovernanceInterpretation] = useState(
    GOVERNANCE_INTERPRETATIONS[0]
  )

  const [recommendedAction, setRecommendedAction] = useState(
    RECOMMENDED_ACTIONS[0]
  )

  const [governanceNote, setGovernanceNote] = useState(
    GOVERNANCE_NOTE_TEMPLATES[0]
  )

  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [casesResult, interventionsResult, outcomesResult, routingResult] =
      await Promise.all([
        supabase.from('beneficiary_cases').select('*'),
        supabase.from('case_interventions').select('*'),
        supabase.from('case_outcomes').select('*'),
        supabase.from('case_routing_actions').select('*'),
      ])

    if (casesResult.error) console.error(casesResult.error)
    if (interventionsResult.error) console.error(interventionsResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)
    if (routingResult.error) console.error(routingResult.error)

    setCases(casesResult.data || [])
    setInterventions(interventionsResult.data || [])
    setOutcomes(outcomesResult.data || [])
    setRoutingActions(routingResult.data || [])
    setMessage('Trajectory intelligence refreshed.')
  }

  const metrics = useMemo(() => {
    const activeCases = cases.filter((item) =>
      [
        'NEED_DETECTED',
        'UNDER_ASSESSMENT',
        'ROUTED',
        'RESPONDER_ASSIGNED',
        'INTERVENTION_ACTIVE',
        'STABILIZING',
      ].includes(item.case_status)
    ).length

    const stabilizedCases = cases.filter(
      (item) => item.case_status === 'STABILIZED'
    ).length

    const escalatedCases = cases.filter(
      (item) => item.case_status === 'ESCALATED'
    ).length

    const safeguardingFlags = cases.filter(
      (item) => item.safeguarding_flag
    ).length

    const interventionCoverage =
      cases.length === 0
        ? 0
        : Math.round(
            (new Set(interventions.map((item) => item.case_id)).size /
              cases.length) *
              100
          )

    const outcomeCoverage =
      cases.length === 0
        ? 0
        : Math.round(
            (new Set(outcomes.map((item) => item.case_id)).size / cases.length) *
              100
          )

    const stabilizationRate =
      cases.length === 0
        ? 0
        : Math.round((stabilizedCases / cases.length) * 100)

    let trajectoryStatus = 'STABILIZING'

    if (escalatedCases >= 1) {
      trajectoryStatus = 'ESCALATION_RISK'
    } else if (safeguardingFlags >= 1 && stabilizationRate < 50) {
      trajectoryStatus = 'FRAGMENTED_CONTINUITY'
    } else if (interventionCoverage >= 100 && stabilizationRate === 0) {
      trajectoryStatus = 'SLOW_STABILIZATION'
    } else if (stabilizationRate >= 50) {
      trajectoryStatus = 'RECOVERY_STRENGTHENING'
    }

    return {
      activeCases,
      stabilizedCases,
      escalatedCases,
      safeguardingFlags,
      interventionCoverage,
      outcomeCoverage,
      stabilizationRate,
      trajectoryStatus,
    }
  }, [cases, interventions, outcomes])

  const generatedBrief = `
EXAMIA LIS STABILIZATION TRAJECTORY INTELLIGENCE BRIEF

Report Template:
${reportTemplate}

Trajectory Focus:
${trajectoryFocus}

Trajectory Scope:
${trajectoryScope}

Trajectory Status:
${metrics.trajectoryStatus}

Trajectory Metrics:
Total Cases: ${cases.length}
Active Stabilization Cases: ${metrics.activeCases}
Stabilized Cases: ${metrics.stabilizedCases}
Escalated Cases: ${metrics.escalatedCases}
Safeguarding Flags: ${metrics.safeguardingFlags}
Routing Actions: ${routingActions.length}
Intervention Coverage: ${metrics.interventionCoverage}%
Outcome Coverage: ${metrics.outcomeCoverage}%
Stabilization Rate: ${metrics.stabilizationRate}%

Governance Interpretation:
${governanceInterpretation}

Recommended Stabilization Action:
${recommendedAction}

Governance-Safe Operational Meaning:
This trajectory intelligence brief identifies the direction of stabilization continuity across interventions, outcomes, safeguarding visibility, routing activity, and escalation accumulation. It supports early coordination visibility before operational fragmentation occurs. It does not assign blame to institutions, responders, beneficiaries, or coordination partners.

Governance-Safe Monitoring Note:
${governanceNote}

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.quickNavWrap}>
          <InfrastructureQuickNav />
        </div>

        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA LIS • TRAJECTORY INTELLIGENCE</p>

          <h1 style={styles.title}>Stabilization Trajectory Infrastructure</h1>

          <p style={styles.subtitle}>
            Detect stabilization direction, continuity weakening, escalation
            accumulation, safeguarding trajectory pressure, and recovery
            strengthening before operational fragmentation occurs.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.metricsGrid}>
          <Metric label="Trajectory Status" value={metrics.trajectoryStatus} />
          <Metric label="Active Cases" value={metrics.activeCases.toString()} />
          <Metric
            label="Safeguarding Flags"
            value={metrics.safeguardingFlags.toString()}
          />
          <Metric
            label="Intervention Coverage"
            value={`${metrics.interventionCoverage}%`}
          />
          <Metric
            label="Outcome Coverage"
            value={`${metrics.outcomeCoverage}%`}
          />
          <Metric
            label="Stabilization Rate"
            value={`${metrics.stabilizationRate}%`}
          />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Trajectory Intelligence Brief Template</h2>

          <p style={styles.helper}>
            Use standardized dropdowns to keep trajectory intelligence
            governance-safe, operationally coherent, and nationally consistent.
          </p>

          <Select
            label="Report Template"
            value={reportTemplate}
            setValue={setReportTemplate}
            options={TRAJECTORY_REPORT_TEMPLATES}
          />

          <Select
            label="Trajectory Focus"
            value={trajectoryFocus}
            setValue={setTrajectoryFocus}
            options={TRAJECTORY_FOCUS_OPTIONS}
          />

          <Select
            label="Trajectory Scope"
            value={trajectoryScope}
            setValue={setTrajectoryScope}
            options={TRAJECTORY_SCOPE_OPTIONS}
          />

          <Select
            label="Governance Interpretation"
            value={governanceInterpretation}
            setValue={setGovernanceInterpretation}
            options={GOVERNANCE_INTERPRETATIONS}
          />

          <Select
            label="Recommended Stabilization Action"
            value={recommendedAction}
            setValue={setRecommendedAction}
            options={RECOMMENDED_ACTIONS}
          />

          <Select
            label="Governance-Safe Monitoring Note"
            value={governanceNote}
            setValue={setGovernanceNote}
            options={GOVERNANCE_NOTE_TEMPLATES}
          />

          <label style={styles.label}>
            Optional Additional Operational Notes

            <textarea
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
              placeholder="Use operational language only. Avoid blame or unnecessary personal details."
              style={styles.textarea}
            />
          </label>

          <button onClick={loadData} style={styles.button}>
            Refresh Trajectory Intelligence
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Generated Trajectory Brief</h2>

          <div style={styles.briefBox}>
            <pre style={styles.pre}>{generatedBrief}</pre>
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
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
    background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
    color: 'white',
    padding: '56px 18px',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  quickNavWrap: {
    marginBottom: '32px',
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
    maxWidth: '900px',
    lineHeight: 1.7,
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
    fontSize: '28px',
    lineHeight: 1.2,
    wordBreak: 'break-word',
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
    marginBottom: '18px',
    fontWeight: 800,
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

  briefBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '20px',
    overflowX: 'auto',
  },

  pre: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
    margin: 0,
    fontFamily: 'inherit',
  },
}