'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import InfrastructureQuickNav from '@/components/InfrastructureQuickNav'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  beneficiary_name: string
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
}

type Institution = {
  id: string
  institution_name: string
  institution_type: string
  region: string | null
  district: string | null
  operating_level: string | null
  coordination_status: string | null
}

type Responder = {
  id: string
  full_name: string
  operational_status: string
  region: string | null
  trust_score: number | null
}

type RoutingAction = {
  id: string
  case_id: string
  routing_status: string | null
  routing_priority: string | null
  routing_reason: string | null
  institution_id: string | null
  assigned_responder_id: string | null
}

type CaseIntervention = {
  id: string
  case_id: string
  intervention_type: string | null
}

type CaseOutcome = {
  id: string
  case_id: string
  outcome_status: string | null
}

type PanelRow = {
  label: string
  value: number
  detail: string
}

const COORDINATION_REPORT_TEMPLATES = [
  'National coordination brief',
  'District coordination pressure brief',
  'NGO partner coordination brief',
  'Ministry operational visibility brief',
  'Safeguarding coordination brief',
  'Responder capacity coordination brief',
  'Institutional load balancing brief',
]

const COORDINATION_FOCUS = [
  'Overall coordination stability',
  'Regional pressure visibility',
  'District escalation coordination',
  'Institutional routing load',
  'Responder capacity alignment',
  'Safeguarding coordination visibility',
  'Intervention-to-outcome conversion',
]

const COORDINATION_SCOPE = [
  'National view',
  'Regional view',
  'District view',
  'Institution view',
  'Responder network view',
  'Safeguarding view',
]

const COORDINATION_ACTIONS = [
  'Maintain current coordination monitoring.',
  'Review regions with rising active stabilization pressure.',
  'Strengthen institution-to-responder coordination.',
  'Prioritize cases with intervention evidence but no stabilization outcome.',
  'Escalate safeguarding-visible cases for governance review.',
  'Review routing load across coordination sites.',
  'Increase responder capacity in regions with visible pressure.',
]

const GOVERNANCE_NOTES = [
  'Coordination pattern is currently manageable.',
  'Coordination pressure is visible and should be monitored.',
  'Institutional routing load needs review.',
  'Responder capacity alignment needs strengthening.',
  'Safeguarding-visible coordination requires careful monitoring.',
  'Intervention activity is visible but outcome conversion needs review.',
  'District or ministry visibility may be required.',
]

export default function CoordinationPage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [responders, setResponders] = useState<Responder[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<CaseIntervention[]>([])
  const [outcomes, setOutcomes] = useState<CaseOutcome[]>([])

  const [reportTemplate, setReportTemplate] = useState('National coordination brief')
  const [coordinationFocus, setCoordinationFocus] = useState(
    'Overall coordination stability'
  )
  const [coordinationScope, setCoordinationScope] = useState('National view')
  const [governanceNote, setGovernanceNote] = useState(
    'Coordination pattern is currently manageable.'
  )
  const [recommendedAction, setRecommendedAction] = useState(
    'Maintain current coordination monitoring.'
  )
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCoordinationData()
  }, [])

  async function loadCoordinationData() {
    const [
      caseResult,
      institutionResult,
      responderResult,
      routingResult,
      interventionResult,
      outcomeResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('institutions').select('*'),
      supabase.from('responders').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*'),
    ])

    if (caseResult.error) console.error(caseResult.error)
    if (institutionResult.error) console.error(institutionResult.error)
    if (responderResult.error) console.error(responderResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionResult.error) console.error(interventionResult.error)
    if (outcomeResult.error) console.error(outcomeResult.error)

    setCases(caseResult.data || [])
    setInstitutions(institutionResult.data || [])
    setResponders(responderResult.data || [])
    setRoutingActions(routingResult.data || [])
    setInterventions(interventionResult.data || [])
    setOutcomes(outcomeResult.data || [])
    setMessage('Coordination intelligence refreshed.')
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
  )

  const stabilizedCases = cases.filter((item) => item.case_status === 'STABILIZED')
  const escalatedCases = cases.filter((item) => item.case_status === 'ESCALATED')
  const criticalCases = cases.filter((item) => item.severity_level === 'CRITICAL')
  const safeguardingCases = cases.filter((item) => item.safeguarding_flag)
  const activeResponders = responders.filter(
    (item) => item.operational_status === 'ACTIVE'
  )
  const activeInstitutions = institutions.filter(
    (item) => item.coordination_status === 'ACTIVE'
  )

  const uniqueInterventionCases = new Set(interventions.map((item) => item.case_id)).size
  const uniqueOutcomeCases = new Set(outcomes.map((item) => item.case_id)).size

  const interventionCoverage =
    cases.length > 0 ? Math.round((uniqueInterventionCases / cases.length) * 100) : 0

  const outcomeCoverage =
    cases.length > 0 ? Math.round((uniqueOutcomeCases / cases.length) * 100) : 0

  const stabilizationRate =
    cases.length > 0 ? Math.round((stabilizedCases.length / cases.length) * 100) : 0

  const coordinationPressure =
    activeCases.length +
    escalatedCases.length * 2 +
    criticalCases.length * 2 +
    safeguardingCases.length

  const coordinationStatus =
    coordinationPressure >= 12
      ? 'NATIONAL_COORDINATION_PRESSURE'
      : coordinationPressure >= 7
        ? 'HIGH_COORDINATION_PRESSURE'
        : coordinationPressure >= 3
          ? 'MODERATE_COORDINATION_PRESSURE'
          : 'COORDINATION_STABLE'

  const regionRows = useMemo(
    () => groupedRows(cases.map((item) => item.region || 'Region not recorded')),
    [cases]
  )

  const institutionRows = useMemo<PanelRow[]>(() => {
    return institutions.map((site) => {
      const load = routingActions.filter((route) => route.institution_id === site.id)
        .length

      return {
        label: site.institution_name || 'Unnamed institution',
        value: load,
        detail: `${site.institution_type || 'Type not recorded'} • ${
          site.operating_level || 'Level not recorded'
        }`,
      }
    })
  }, [institutions, routingActions])

  const responderRows = useMemo<PanelRow[]>(() => {
    return responders.map((responder) => {
      const load = routingActions.filter(
        (route) => route.assigned_responder_id === responder.id
      ).length

      return {
        label: responder.full_name || 'Unnamed responder',
        value: load,
        detail: `${responder.operational_status || 'Status not recorded'} • ${
          responder.region || 'Region not recorded'
        }`,
      }
    })
  }, [responders, routingActions])

  const lifecycleRows = useMemo(
    () => groupedRows(cases.map((item) => item.case_status || 'Status not recorded')),
    [cases]
  )

  function coordinationBrief() {
    return `
EXAMIA LIS NATIONAL COORDINATION INTELLIGENCE BRIEF

Report Template:
${reportTemplate}

Coordination Focus:
${coordinationFocus}

Coordination Scope:
${coordinationScope}

Coordination Status:
${coordinationStatus}

Core Coordination Metrics:
Total Beneficiary Cases: ${cases.length}
Active Stabilization Cases: ${activeCases.length}
Stabilized Cases: ${stabilizedCases.length}
Escalated Cases: ${escalatedCases.length}
Critical Cases: ${criticalCases.length}
Safeguarding Visibility Flags: ${safeguardingCases.length}
Coordination Sites: ${institutions.length}
Active Coordination Sites: ${activeInstitutions.length}
Active Responders: ${activeResponders.length}
Routing Actions: ${routingActions.length}
Intervention Evidence Records: ${interventions.length}
Outcome Records: ${outcomes.length}
Intervention Coverage: ${interventionCoverage}%
Outcome Coverage: ${outcomeCoverage}%
Stabilization Rate: ${stabilizationRate}%

Governance Interpretation:
${governanceNote}

Recommended Coordination Action:
${recommendedAction}

Governance-Safe Meaning:
This coordination brief shows where EXAMIA LIS support pathways are stable, pressured, delayed, or requiring escalation. It supports national, regional, district, NGO, ministry, and institutional coordination without assigning blame to beneficiaries, responders, families, schools, or partners.

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
    `.trim()
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.quickNavWrap}>
          <InfrastructureQuickNav />
        </div>

        <section style={styles.hero}>
          <p style={styles.kicker}>
            EXAMIA LIS • NATIONAL COORDINATION INTELLIGENCE
          </p>

          <h1 style={styles.title}>Coordination Stability Infrastructure</h1>

          <p style={styles.subtitle}>
            Convert cases, institutions, responders, routing actions, interventions,
            outcomes, and safeguarding visibility into governed coordination intelligence
            for national scale.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.metricsGrid}>
          <Metric label="Coordination Status" textValue={coordinationStatus} />
          <Metric label="Active Cases" value={activeCases.length} />
          <Metric label="Coordination Sites" value={institutions.length} />
          <Metric label="Active Responders" value={activeResponders.length} />
          <Metric label="Routing Actions" value={routingActions.length} />
          <Metric label="Safeguarding Flags" value={safeguardingCases.length} />
          <Metric label="Intervention Coverage" value={interventionCoverage} suffix="%" />
          <Metric label="Outcome Coverage" value={outcomeCoverage} suffix="%" />
        </section>

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Coordination Brief Template</h2>

            <p style={styles.panelNote}>
              Use standardized dropdowns to keep coordination intelligence consistent,
              governance-safe, and ready for district, NGO, regional, or ministry review.
            </p>

            <Select
              label="Coordination Report Template"
              value={reportTemplate}
              setValue={setReportTemplate}
              options={COORDINATION_REPORT_TEMPLATES}
            />

            <Select
              label="Coordination Focus"
              value={coordinationFocus}
              setValue={setCoordinationFocus}
              options={COORDINATION_FOCUS}
            />

            <Select
              label="Coordination Scope"
              value={coordinationScope}
              setValue={setCoordinationScope}
              options={COORDINATION_SCOPE}
            />

            <Select
              label="Governance Interpretation"
              value={governanceNote}
              setValue={setGovernanceNote}
              options={GOVERNANCE_NOTES}
            />

            <Select
              label="Recommended Coordination Action"
              value={recommendedAction}
              setValue={setRecommendedAction}
              options={COORDINATION_ACTIONS}
            />

            <label style={styles.label}>
              Optional Additional Operational Notes
              <textarea
                value={additionalNotes}
                onChange={(event) => setAdditionalNotes(event.target.value)}
                placeholder="Use coordination-level notes only. Avoid blame, personal judgment, or unnecessary personal details."
                style={styles.textarea}
              />
            </label>

            <button onClick={loadCoordinationData} style={styles.primaryButton}>
              Refresh Coordination Intelligence
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Generated Coordination Brief</h2>

            <p style={styles.panelNote}>
              This brief is designed for governance visibility, not individual punishment.
            </p>

            <pre style={styles.summaryBox}>{coordinationBrief()}</pre>
          </div>
        </section>

        <section style={styles.layoutGrid}>
          <Panel
            title="Regional Coordination Visibility"
            note="Shows where beneficiary stabilization pressure is appearing."
            rows={regionRows}
          />

          <Panel
            title="Institution Coordination Load"
            note="Shows routing load by coordination site."
            rows={institutionRows}
          />

          <Panel
            title="Responder Coordination Load"
            note="Shows routing load by responder network."
            rows={responderRows}
          />

          <Panel
            title="Lifecycle Coordination View"
            note="Shows where cases are sitting inside the stabilization pathway."
            rows={lifecycleRows}
          />
        </section>
      </div>
    </main>
  )
}

function groupedRows(items: string[]): PanelRow[] {
  const counts: Record<string, number> = {}

  items.forEach((item) => {
    counts[item] = (counts[item] || 0) + 1
  })

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value, detail: 'record(s)' }))
}

function Metric({
  label,
  value,
  suffix = '',
  textValue,
}: {
  label: string
  value?: number
  suffix?: string
  textValue?: string
}) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>

      <h2 style={textValue ? styles.metricTextValue : styles.metricValue}>
        {textValue || `${value ?? 0}${suffix}`}
      </h2>
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
              <strong>{row.label}</strong>
              <p style={styles.rowDetail}>{row.detail}</p>
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
    background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
    color: 'white',
    padding: '56px 18px',
  },
  container: {
    maxWidth: '1280px',
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
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '14px',
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
    margin: 0,
  },
  metricValue: {
    fontSize: '38px',
    margin: '8px 0 0',
  },
  metricTextValue: {
    fontSize: '18px',
    lineHeight: 1.3,
    margin: '10px 0 0',
    color: '#67e8f9',
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
  label: {
    display: 'block',
    fontWeight: 800,
    marginBottom: '16px',
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
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
    color: '#e2e8f0',
    lineHeight: 1.6,
    minHeight: '560px',
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
  rowDetail: {
    color: '#94a3b8',
    margin: '6px 0 0',
    fontSize: '13px',
  },
  emptyText: {
    color: '#94a3b8',
  },
}