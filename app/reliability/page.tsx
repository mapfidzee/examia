'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
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
  assigned_responder_id?: string | null
}

type Responder = {
  id: string
  full_name: string
  email: string
  operational_status: string
  response_domains: string[] | null
  region: string | null
  trust_score: number | null
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
  intervention_summary: string | null
}

type CaseOutcome = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
}

const RELIABILITY_REPORT_TEMPLATES = [
  'Responder reliability brief',
  'Institution coordination reliability brief',
  'District stabilization reliability brief',
  'Intervention consistency brief',
  'Safeguarding-aware reliability brief',
  'Escalation reliability review',
  'National stabilization reliability brief',
]

const RELIABILITY_FOCUS = [
  'Overall stabilization reliability',
  'Responder consistency',
  'Intervention completion reliability',
  'Outcome conversion reliability',
  'Escalation containment',
  'Safeguarding-aware continuity',
  'Institution coordination reliability',
]

const OPERATING_SCOPE = [
  'All records',
  'Responder-focused',
  'Institution-focused',
  'Region-focused',
  'Safeguarding-focused',
  'Escalation-focused',
]

const RELIABILITY_ACTIONS = [
  'Maintain monitoring; reliability pattern is currently acceptable.',
  'Review cases with intervention evidence but no stabilization outcome.',
  'Strengthen responder follow-up discipline.',
  'Review institutions with repeated coordination pressure.',
  'Prioritize safeguarding-aware continuity review.',
  'Investigate escalation patterns before expansion.',
  'Improve outcome recording consistency across interventions.',
]

const GOVERNANCE_INTERPRETATIONS = [
  'Reliability pattern is stable enough for continued monitoring.',
  'Reliability pattern suggests follow-up discipline needs strengthening.',
  'Intervention activity is visible, but stabilization conversion needs review.',
  'Safeguarding visibility requires careful continuity monitoring.',
  'Escalation pressure requires district or regional governance attention.',
  'Responder and institution coordination should be reviewed together.',
]

export default function ReliabilityPage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [responders, setResponders] = useState<Responder[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<CaseIntervention[]>([])
  const [outcomes, setOutcomes] = useState<CaseOutcome[]>([])

  const [reportTemplate, setReportTemplate] = useState('Responder reliability brief')
  const [reliabilityFocus, setReliabilityFocus] = useState('Overall stabilization reliability')
  const [operatingScope, setOperatingScope] = useState('All records')
  const [recommendedAction, setRecommendedAction] = useState(
    'Maintain monitoring; reliability pattern is currently acceptable.'
  )
  const [governanceInterpretation, setGovernanceInterpretation] = useState(
    'Reliability pattern is stable enough for continued monitoring.'
  )
  const [additionalNotes, setAdditionalNotes] = useState('')

  const [message, setMessage] = useState('')

  useEffect(() => {
    loadReliabilityData()
  }, [])

  async function loadReliabilityData() {
    const [
      caseResult,
      responderResult,
      institutionResult,
      routingResult,
      interventionResult,
      outcomeResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('responders').select('*'),
      supabase.from('institutions').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*'),
    ])

    if (caseResult.error) console.error(caseResult.error)
    if (responderResult.error) console.error(responderResult.error)
    if (institutionResult.error) console.error(institutionResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionResult.error) console.error(interventionResult.error)
    if (outcomeResult.error) console.error(outcomeResult.error)

    setCases(caseResult.data || [])
    setResponders(responderResult.data || [])
    setInstitutions(institutionResult.data || [])
    setRoutingActions(routingResult.data || [])
    setInterventions(interventionResult.data || [])
    setOutcomes(outcomeResult.data || [])

    setMessage('Reliability intelligence refreshed.')
  }

  const activeResponders = responders.filter((item) => item.operational_status === 'ACTIVE')
  const stabilizedCases = cases.filter((item) => item.case_status === 'STABILIZED')
  const escalatedCases = cases.filter((item) => item.case_status === 'ESCALATED')
  const safeguardingCases = cases.filter((item) => item.safeguarding_flag)

  const uniqueInterventionCases = new Set(interventions.map((item) => item.case_id)).size
  const uniqueOutcomeCases = new Set(outcomes.map((item) => item.case_id)).size

  const stabilizationRate =
    cases.length > 0 ? Math.round((stabilizedCases.length / cases.length) * 100) : 0

  const interventionCoverage =
    cases.length > 0 ? Math.round((uniqueInterventionCases / cases.length) * 100) : 0

  const outcomeCoverage =
    cases.length > 0 ? Math.round((uniqueOutcomeCases / cases.length) * 100) : 0

  const escalationRate =
    cases.length > 0 ? Math.round((escalatedCases.length / cases.length) * 100) : 0

  const reliabilityScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        stabilizationRate * 0.4 +
          interventionCoverage * 0.25 +
          outcomeCoverage * 0.25 -
          escalationRate * 0.1
      )
    )
  )

  const reliabilityStatus =
    reliabilityScore >= 80
      ? 'HIGH_RELIABILITY'
      : reliabilityScore >= 60
        ? 'MODERATE_RELIABILITY'
        : reliabilityScore >= 35
          ? 'DEVELOPING_RELIABILITY'
          : 'LOW_RELIABILITY'

  const responderRows = useMemo(() => {
    return responders.map((responder) => {
      const assignedRoutes = routingActions.filter(
        (item) => item.assigned_responder_id === responder.id
      )

      const assignedCaseIds = new Set(assignedRoutes.map((item) => item.case_id))

      const assignedCases = cases.filter((item) => assignedCaseIds.has(item.id))

      const stabilizedAssignedCases = assignedCases.filter(
        (item) => item.case_status === 'STABILIZED'
      )

      const score =
        assignedCases.length > 0
          ? Math.round((stabilizedAssignedCases.length / assignedCases.length) * 100)
          : 0

      return {
        label: responder.full_name,
        value: score,
        detail: `${assignedCases.length} assigned case(s)`,
      }
    })
  }, [responders, routingActions, cases])

  const institutionRows = useMemo(() => {
    return institutions.map((institution) => {
      const siteRoutes = routingActions.filter(
        (item) => item.institution_id === institution.id
      )

      return {
        label: institution.institution_name,
        value: siteRoutes.length,
        detail: institution.operating_level || 'Operating level not recorded',
      }
    })
  }, [institutions, routingActions])

  const outcomeRows = useMemo(() => {
    const counts: Record<string, number> = {}

    outcomes.forEach((item) => {
      const status = item.outcome_status || 'Outcome not recorded'
      counts[status] = (counts[status] || 0) + 1
    })

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value, detail: 'outcome record(s)' }))
  }, [outcomes])

  function reliabilityBrief() {
    return `
EXAMIA LIS RELIABILITY INTELLIGENCE BRIEF

Report Template:
${reportTemplate}

Reliability Focus:
${reliabilityFocus}

Operating Scope:
${operatingScope}

Reliability Status:
${reliabilityStatus}

Reliability Score:
${reliabilityScore}/100

Core Reliability Metrics:
Total Beneficiary Cases: ${cases.length}
Active Responders: ${activeResponders.length}
Coordination Sites: ${institutions.length}
Routing Actions: ${routingActions.length}
Intervention Evidence Records: ${interventions.length}
Cases With Intervention Evidence: ${uniqueInterventionCases}
Outcome Records: ${outcomes.length}
Cases With Outcome Evidence: ${uniqueOutcomeCases}
Stabilized Cases: ${stabilizedCases.length}
Escalated Cases: ${escalatedCases.length}
Safeguarding Visibility Flags: ${safeguardingCases.length}
Intervention Coverage: ${interventionCoverage}%
Outcome Coverage: ${outcomeCoverage}%
Stabilization Rate: ${stabilizationRate}%
Escalation Rate: ${escalationRate}%

Governance Interpretation:
${governanceInterpretation}

Recommended Reliability Action:
${recommendedAction}

Governance-Safe Meaning:
This reliability brief measures system consistency across routing, intervention evidence, outcome evidence, stabilization conversion, escalation pressure, responder activity, and institutional coordination. It does not rank or shame people. It supports governance leaders in finding where the infrastructure needs strengthening before national scale.

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
    `.trim()
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA LIS • RELIABILITY INTELLIGENCE</p>

          <h1 style={styles.title}>Stabilization Reliability Infrastructure</h1>

          <p style={styles.subtitle}>
            Measure whether routing, responders, institutions, interventions, and outcomes
            are producing consistent stabilization without turning reliability into blame.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.metricsGrid}>
          <Metric label="Reliability Score" value={reliabilityScore} suffix="/100" />
          <Metric label="Intervention Coverage" value={interventionCoverage} suffix="%" />
          <Metric label="Outcome Coverage" value={outcomeCoverage} suffix="%" />
          <Metric label="Stabilization Rate" value={stabilizationRate} suffix="%" />
          <Metric label="Escalation Rate" value={escalationRate} suffix="%" />
          <Metric label="Active Responders" value={activeResponders.length} />
          <Metric label="Routing Actions" value={routingActions.length} />
          <Metric label="Outcome Records" value={outcomes.length} />
        </section>

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Reliability Brief Template</h2>

            <p style={styles.panelNote}>
              Use dropdowns to generate standardized reliability intelligence. This keeps
              the architecture tight and prevents unsafe performance language.
            </p>

            <Select
              label="Reliability Report Template"
              value={reportTemplate}
              setValue={setReportTemplate}
              options={RELIABILITY_REPORT_TEMPLATES}
            />

            <Select
              label="Reliability Focus"
              value={reliabilityFocus}
              setValue={setReliabilityFocus}
              options={RELIABILITY_FOCUS}
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
              label="Recommended Reliability Action"
              value={recommendedAction}
              setValue={setRecommendedAction}
              options={RELIABILITY_ACTIONS}
            />

            <label style={styles.label}>
              Optional Additional Operational Notes
              <textarea
                value={additionalNotes}
                onChange={(event) => setAdditionalNotes(event.target.value)}
                placeholder="Use system-level reliability notes only. Avoid personal judgment, blame, or unsafe performance language."
                style={styles.textarea}
              />
            </label>

            <button onClick={loadReliabilityData} style={styles.primaryButton}>
              Refresh Reliability Intelligence
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Generated Reliability Brief</h2>

            <p style={styles.panelNote}>
              This brief separates system reliability from individual blame. It is designed
              for governance review, not punishment.
            </p>

            <pre style={styles.summaryBox}>{reliabilityBrief()}</pre>
          </div>
        </section>

        <section style={styles.layoutGrid}>
          <Panel
            title="Responder Reliability View"
            note="Shows assigned case stabilization visibility by responder. Use as a system signal, not a personal punishment score."
            rows={responderRows}
          />

          <Panel
            title="Institution Coordination Load"
            note="Shows routing load by coordination site."
            rows={institutionRows}
          />

          <Panel
            title="Outcome Evidence Distribution"
            note="Shows how outcome records are currently classified."
            rows={outcomeRows}
          />

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Reliability Status</h2>

            <div style={styles.statusBadge}>{reliabilityStatus}</div>

            <p style={styles.panelNote}>
              Reliability status is an early system signal based on stabilization,
              intervention coverage, outcome coverage, and escalation pressure. It is not
              a final audit or individual evaluation.
            </p>

            <div style={styles.infoGrid}>
              <Info label="Cases With Intervention Evidence" value={`${uniqueInterventionCases}`} />
              <Info label="Cases With Outcome Evidence" value={`${uniqueOutcomeCases}`} />
              <Info label="Safeguarding Flags" value={`${safeguardingCases.length}`} />
              <Info label="Coordination Sites" value={`${institutions.length}`} />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({
  label,
  value,
  suffix = '',
}: {
  label: string
  value: number
  suffix?: string
}) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <h2 style={styles.metricValue}>
        {value}
        {suffix}
      </h2>
    </div>
  )
}

function Select({ label, value, setValue, options }: any) {
  return (
    <label style={styles.label}>
      {label}
      <select
        value={value}
        onChange={(event) => setValue(event.target.value)}
        style={styles.select}
      >
        {options.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoBox}>
      <p style={styles.infoLabel}>{label}</p>
      <p style={styles.infoValue}>{value}</p>
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
  rows: { label: string; value: number; detail: string }[]
}) {
  return (
    <div style={styles.card}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <p style={styles.panelNote}>{note}</p>

      <div style={styles.panelList}>
        {rows.length === 0 && <p style={styles.emptyText}>No data available yet.</p>}

        {rows.map((row) => (
          <div key={row.label} style={styles.panelRow}>
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
  statusBadge: {
    display: 'inline-block',
    background: '#082f49',
    color: '#67e8f9',
    border: '1px solid #0e7490',
    borderRadius: '999px',
    padding: '10px 14px',
    fontWeight: 900,
    marginBottom: '16px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
  },
  infoBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '14px',
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
    margin: 0,
  },
  infoValue: {
    margin: '6px 0 0',
    color: '#f8fafc',
  },
}