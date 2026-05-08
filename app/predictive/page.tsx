'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  case_status: string
  severity_level: string
  safeguarding_flag: boolean
  assigned_responder_id?: string | null
  region?: string | null
}

type RoutingAction = {
  id: string
  assigned_responder_id?: string | null
  institution_id?: string | null
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

type Institution = {
  id: string
  institution_name: string
}

type Responder = {
  id: string
  full_name: string
  operational_status: string
}

const REPORT_TEMPLATES = [
  'Predictive stabilization pressure brief',
  'Regional continuity forecasting brief',
  'Responder saturation forecasting brief',
  'Safeguarding accumulation forecasting brief',
  'Institution coordination forecasting brief',
]

const FORECAST_FOCUS = [
  'Escalation forecasting',
  'Continuity risk forecasting',
  'Responder saturation visibility',
  'Institution coordination pressure',
  'Regional destabilization visibility',
]

const OPERATING_SCOPE = [
  'National view',
  'Regional view',
  'District view',
  'Institution-focused',
  'Responder-focused',
]

const GOVERNANCE_INTERPRETATIONS = [
  'Forecast signals remain manageable with continued monitoring.',
  'Pressure accumulation patterns require operational review.',
  'Emerging instability signals suggest increased coordination pressure.',
  'Forecast patterns suggest continuity weakening.',
]

const RECOMMENDED_ACTIONS = [
  'Maintain monitoring and continue stabilization coordination.',
  'Increase responder coordination monitoring.',
  'Review stabilization bottlenecks across coordination sites.',
  'Increase safeguarding visibility review.',
  'Prioritize continuity stabilization review.',
]

export default function PredictiveIntelligencePage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [responders, setResponders] = useState<Responder[]>([])

  const [reportTemplate, setReportTemplate] = useState(REPORT_TEMPLATES[0])
  const [forecastFocus, setForecastFocus] = useState(FORECAST_FOCUS[0])
  const [operatingScope, setOperatingScope] = useState(OPERATING_SCOPE[0])
  const [governanceInterpretation, setGovernanceInterpretation] = useState(
    GOVERNANCE_INTERPRETATIONS[0]
  )
  const [recommendedAction, setRecommendedAction] = useState(RECOMMENDED_ACTIONS[0])
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const [
      casesResult,
      routingResult,
      interventionsResult,
      outcomesResult,
      institutionsResult,
      respondersResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*'),
      supabase.from('institutions').select('*'),
      supabase.from('responders').select('*'),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionsResult.error) console.error(interventionsResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)
    if (institutionsResult.error) console.error(institutionsResult.error)
    if (respondersResult.error) console.error(respondersResult.error)

    setCases(casesResult.data || [])
    setRoutingActions(routingResult.data || [])
    setInterventions(interventionsResult.data || [])
    setOutcomes(outcomesResult.data || [])
    setInstitutions(institutionsResult.data || [])
    setResponders(respondersResult.data || [])
    setMessage('Predictive coordination intelligence refreshed.')
  }

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

  const escalatedCases = cases.filter((item) => item.case_status === 'ESCALATED').length
  const safeguardingFlags = cases.filter((item) => item.safeguarding_flag).length
  const stabilizedCases = cases.filter((item) => item.case_status === 'STABILIZED').length
  const activeResponders = responders.filter(
    (item) => item.operational_status === 'ACTIVE'
  ).length

  const interventionCoverage =
    cases.length > 0
      ? Math.round((new Set(interventions.map((item) => item.case_id)).size / cases.length) * 100)
      : 0

  const outcomeCoverage =
    cases.length > 0
      ? Math.round((new Set(outcomes.map((item) => item.case_id)).size / cases.length) * 100)
      : 0

  const stabilizationRate =
    cases.length > 0 ? Math.round((stabilizedCases / cases.length) * 100) : 0

  const responderLoadRisk =
    activeResponders > 0 && routingActions.length > activeResponders * 2
      ? 'ELEVATED'
      : 'CONTROLLED'

  const continuityRisk =
    activeCases > stabilizedCases ? 'CONTINUITY_PRESSURE_VISIBLE' : 'CONTINUITY_STABLE'

  const safeguardingRisk =
    safeguardingFlags >= 2
      ? 'SAFEGUARDING_ACCUMULATION_VISIBLE'
      : 'SAFEGUARDING_MONITORED'

  const predictiveStatus = useMemo(() => {
    if (escalatedCases >= 3 || safeguardingFlags >= 3) {
      return 'HIGH_FORECAST_PRESSURE'
    }

    if (activeCases >= Math.max(stabilizedCases, 1) || responderLoadRisk === 'ELEVATED') {
      return 'MODERATE_FORECAST_PRESSURE'
    }

    return 'CONTROLLED_FORECAST_PRESSURE'
  }, [activeCases, stabilizedCases, escalatedCases, safeguardingFlags, responderLoadRisk])

  const generatedBrief = `
EXAMIA LIS PREDICTIVE COORDINATION INTELLIGENCE BRIEF

Report Template:
${reportTemplate}

Forecast Focus:
${forecastFocus}

Operating Scope:
${operatingScope}

Predictive Coordination Status:
${predictiveStatus}

Forecast Metrics:
Total Cases: ${cases.length}
Active Stabilization Cases: ${activeCases}
Escalated Cases: ${escalatedCases}
Safeguarding Flags: ${safeguardingFlags}
Routing Actions: ${routingActions.length}
Intervention Coverage: ${interventionCoverage}%
Outcome Coverage: ${outcomeCoverage}%
Stabilization Rate: ${stabilizationRate}%
Coordination Sites: ${institutions.length}
Active Responders: ${activeResponders}

Predictive Signals:
Responder Saturation Risk: ${responderLoadRisk}
Continuity Risk: ${continuityRisk}
Safeguarding Forecast Signal: ${safeguardingRisk}

Governance Interpretation:
${governanceInterpretation}

Recommended Action:
${recommendedAction}

Governance-Safe Meaning:
This predictive intelligence brief identifies early stabilization pressure, continuity weakening, responder saturation patterns, safeguarding accumulation signals, and coordination instability before operational collapse. It supports governance-safe forecasting and stabilization strengthening without assigning blame to institutions, responders, beneficiaries, or partners.

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA LIS • PREDICTIVE INTELLIGENCE</p>

          <h1 style={styles.title}>Predictive Stabilization Infrastructure</h1>

          <p style={styles.subtitle}>
            Detect rising stabilization pressure, responder saturation, continuity weakening,
            safeguarding accumulation, and coordination bottlenecks before escalation occurs.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.metricsGrid}>
          <Metric label="Predictive Status" value={predictiveStatus} />
          <Metric label="Active Cases" value={activeCases} />
          <Metric label="Safeguarding Flags" value={safeguardingFlags} />
          <Metric label="Intervention Coverage" value={`${interventionCoverage}%`} />
          <Metric label="Outcome Coverage" value={`${outcomeCoverage}%`} />
          <Metric label="Stabilization Rate" value={`${stabilizationRate}%`} />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Predictive Coordination Brief Template</h2>

          <p style={styles.helperText}>
            Use dropdown templates to keep predictive coordination intelligence standardized,
            governance-safe, and operationally coherent.
          </p>

          <div style={styles.grid}>
            <Select
              label="Report Template"
              value={reportTemplate}
              setValue={setReportTemplate}
              options={REPORT_TEMPLATES}
            />

            <Select
              label="Forecast Focus"
              value={forecastFocus}
              setValue={setForecastFocus}
              options={FORECAST_FOCUS}
            />

            <Select
              label="Operating Scope"
              value={operatingScope}
              setValue={setOperatingScope}
              options={OPERATING_SCOPE}
            />

            <Select
              label="Governance Interpretation"
              value={governanceInterpretation}
              setValue={setGovernanceInterpretation}
              options={GOVERNANCE_INTERPRETATIONS}
            />

            <Select
              label="Recommended Action"
              value={recommendedAction}
              setValue={setRecommendedAction}
              options={RECOMMENDED_ACTIONS}
            />
          </div>

          <label style={styles.label}>
            Optional Additional Operational Notes
            <textarea
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
              style={styles.textarea}
              placeholder="Use operational language only. Avoid blame or unnecessary personal details."
            />
          </label>

          <button style={styles.primaryButton} onClick={loadAll}>
            Refresh Predictive Intelligence
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Generated Predictive Brief</h2>

          <div style={styles.generatedBox}>
            <pre style={styles.pre}>{generatedBrief}</pre>
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
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
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
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
    maxWidth: '1240px',
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
    fontSize: 'clamp(34px, 6vw, 56px)',
    lineHeight: 1.05,
    margin: '12px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '920px',
    lineHeight: 1.7,
    fontSize: '18px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
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
    margin: 0,
  },
  metricValue: {
    fontSize: '26px',
    marginTop: '12px',
    lineHeight: 1.2,
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
    marginBottom: '10px',
  },
  helperText: {
    color: '#cbd5e1',
    marginBottom: '22px',
    lineHeight: 1.6,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '18px',
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
    border: '1px solid #334155',
    background: '#111827',
    color: 'white',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    marginTop: '8px',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #334155',
    background: '#111827',
    color: 'white',
    resize: 'vertical',
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
  generatedBox: {
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
  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '20px',
  },
}