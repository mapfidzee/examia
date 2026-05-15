'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { evaluateContinuityIntelligence } from '../lib/continuityIntelligence'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  beneficiary_name: string
  beneficiary_level: string | null
  support_domain: string
  case_status: string
  severity_level: string
  instability_signals: string[] | null
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  intervention_summary: string | null
  outcome_summary: string | null
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
  response_domains: string[] | null
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
  intervention_summary: string | null
}

type PanelRow = {
  label: string
  value: number
}

const REPORT_TEMPLATES = [
  'District operational stability brief',
  'NGO coordination pressure brief',
  'Ministry visibility brief',
  'Safeguarding visibility brief',
  'Responder workload brief',
  'Institutional routing pressure brief',
  'Intervention completion reliability brief',
]

const OPERATING_LEVELS = [
  'All levels',
  'Local',
  'Ward',
  'District',
  'Regional',
  'National',
]

const PRESSURE_FOCUS = [
  'Overall stabilization pressure',
  'Escalation pressure',
  'Safeguarding visibility',
  'Responder load',
  'Institutional coordination load',
  'Intervention reliability',
  'Regional instability visibility',
]

const ACTION_TEMPLATES = [
  'Maintain monitoring; pressure remains within manageable range.',
  'Increase responder coordination for active stabilization cases.',
  'Review routed cases that have not yet reached intervention evidence.',
  'Prioritize safeguarding-aware review for flagged cases.',
  'Strengthen district coordination where escalation pressure is visible.',
  'Review institution load and rebalance coordination responsibility.',
  'Improve intervention completion evidence and follow-up discipline.',
]

export default function OperationsPage() {
  return (
    <CGIGovernanceShell>
      <OperationsContent />
    </CGIGovernanceShell>
  )
}

function OperationsContent() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [responders, setResponders] = useState<Responder[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<CaseIntervention[]>([])

  const [reportTemplate, setReportTemplate] = useState(
    'District operational stability brief'
  )
  const [operatingLevel, setOperatingLevel] = useState('All levels')
  const [pressureFocus, setPressureFocus] = useState(
    'Overall stabilization pressure'
  )
  const [actionCue, setActionCue] = useState(
    'Maintain monitoring; pressure remains within manageable range.'
  )
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadOperationalData()
  }, [])

  async function loadOperationalData() {
    const [
      caseResult,
      institutionResult,
      responderResult,
      routingResult,
      interventionResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('institutions').select('*'),
      supabase.from('responders').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
    ])

    if (caseResult.error) console.error(caseResult.error)
    if (institutionResult.error) console.error(institutionResult.error)
    if (responderResult.error) console.error(responderResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionResult.error) console.error(interventionResult.error)

    setCases(caseResult.data || [])
    setInstitutions(institutionResult.data || [])
    setResponders(responderResult.data || [])
    setRoutingActions(routingResult.data || [])
    setInterventions(interventionResult.data || [])

    setMessage('Operational intelligence refreshed.')
  }

  const filteredInstitutions = useMemo(() => {
    if (operatingLevel === 'All levels') return institutions
    return institutions.filter((item) => item.operating_level === operatingLevel)
  }, [institutions, operatingLevel])

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

  const routedCases = cases.filter((item) =>
    ['ROUTED', 'RESPONDER_ASSIGNED'].includes(item.case_status)
  )

  const stabilizedCases = cases.filter((item) => item.case_status === 'STABILIZED')
  const escalatedCases = cases.filter((item) => item.case_status === 'ESCALATED')
  const criticalCases = cases.filter((item) => item.severity_level === 'CRITICAL')
  const safeguardingCases = cases.filter((item) => item.safeguarding_flag)
  const activeResponders = responders.filter(
    (item) => item.operational_status === 'ACTIVE'
  )

  const interventionCaseIds = new Set(interventions.map((item) => item.case_id))

  const outcomeCaseIds = new Set(
    cases.filter((item) => item.outcome_summary).map((item) => item.id)
  )

  const uniqueInterventionCases = interventionCaseIds.size

  const stabilizationRate =
    cases.length > 0 ? Math.round((stabilizedCases.length / cases.length) * 100) : 0

  const interventionCoverage =
    cases.length > 0 ? Math.round((uniqueInterventionCases / cases.length) * 100) : 0

  const outcomeCoverage =
    cases.length > 0 ? Math.round((outcomeCaseIds.size / cases.length) * 100) : 0

  const interventionVolume = interventions.length

  const routingPressure =
    routedCases.length +
    escalatedCases.length +
    criticalCases.length +
    safeguardingCases.length

  const pressureStatus =
    routingPressure >= 10
      ? 'CRITICAL_PRESSURE'
      : routingPressure >= 6
        ? 'HIGH_PRESSURE'
        : routingPressure >= 3
          ? 'MODERATE_PRESSURE'
          : 'STABLE'

  const unresolvedInterventionPathways = cases.filter(
    (item) =>
      interventionCaseIds.has(item.id) &&
      !outcomeCaseIds.has(item.id) &&
      item.case_status !== 'STABILIZED'
  ).length

  const routedWithoutResponder = routingActions.filter(
    (item) => !item.assigned_responder_id
  ).length

  const continuityScores = evaluateContinuityIntelligence({
    totalCases: cases.length,
    activeCases: activeCases.length,
    routedCases: routedCases.length,
    interventionCases: uniqueInterventionCases,
    outcomeCases: outcomeCaseIds.size,
    stabilizedCases: stabilizedCases.length,
    escalatedCases: escalatedCases.length,
    criticalCases: criticalCases.length,
    safeguardingCases: safeguardingCases.length,
    unresolvedInterventionPathways,
    routedWithoutResponder,
  })

  const topRegions = regionBreakdown(cases)
  const statusBreakdown = caseStatusBreakdown(cases)
  const severityBreakdown = severityLevelBreakdown(cases)

  function operationalBrief() {
    return `
TSINAXA CGI CONTINUITY INTELLIGENCE BRIEF

Report Template:
${reportTemplate}

Operating Level:
${operatingLevel}

Pressure Focus:
${pressureFocus}

System Pressure Status:
${pressureStatus}

Continuity State:
${continuityScores.continuityState}

Continuity Intelligence Scores:
Continuity Integrity Score: ${continuityScores.continuityIntegrityScore}/100
Stabilization Confidence Score: ${continuityScores.stabilizationConfidenceScore}/100
Escalation Pressure Index: ${continuityScores.escalationPressureIndex}/100
Recovery Reliability Score: ${continuityScores.recoveryReliabilityScore}/100
Operational Survivability Score: ${continuityScores.operationalSurvivabilityScore}/100

Core Metrics:
Total Beneficiary Cases: ${cases.length}
Active Stabilization Cases: ${activeCases.length}
Routed / Assigned Cases: ${routedCases.length}
Escalated Cases: ${escalatedCases.length}
Critical Cases: ${criticalCases.length}
Safeguarding Visibility Flags: ${safeguardingCases.length}
Active Responders: ${activeResponders.length}
Coordination Sites in View: ${filteredInstitutions.length}
Intervention Evidence Records: ${interventionVolume}
Cases With Intervention Evidence: ${uniqueInterventionCases}
Cases With Outcome Evidence: ${outcomeCaseIds.size}
Stabilization Rate: ${stabilizationRate}%
Intervention Coverage: ${interventionCoverage}%
Outcome Coverage: ${outcomeCoverage}%
Unresolved Intervention Pathways: ${unresolvedInterventionPathways}
Routed Without Responder Ownership: ${routedWithoutResponder}

Recommended Action Cue:
${actionCue}

Governance-Safe Interpretation:
This brief separates operational activity from continuity confidence. It does not assume that routing, intervention, or outcome documentation automatically means stabilization is durable. CGI evaluates continuity integrity, stabilization confidence, escalation pressure, recovery reliability, and operational survivability so leaders can see whether the system is merely busy or actually stabilizing.

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
    `.trim()
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • CONTINUITY INTELLIGENCE</p>

          <h1 style={styles.title}>Continuity Governance Operational Intelligence</h1>

          <p style={styles.subtitle}>
            Convert cases, routing activity, intervention evidence, safeguarding flags,
            institutions, and responder capacity into continuity integrity, stabilization
            confidence, escalation pressure, recovery reliability, and operational
            survivability intelligence.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.scoreHero}>
          <div>
            <p style={styles.scoreLabel}>Continuity State</p>
            <h2 style={styles.scoreState}>{continuityScores.continuityState}</h2>
          </div>

          <div style={styles.scoreGrid}>
            <ScoreMetric
              label="Continuity Integrity"
              value={continuityScores.continuityIntegrityScore}
            />
            <ScoreMetric
              label="Stabilization Confidence"
              value={continuityScores.stabilizationConfidenceScore}
            />
            <ScoreMetric
              label="Escalation Pressure"
              value={continuityScores.escalationPressureIndex}
            />
            <ScoreMetric
              label="Recovery Reliability"
              value={continuityScores.recoveryReliabilityScore}
            />
            <ScoreMetric
              label="Operational Survivability"
              value={continuityScores.operationalSurvivabilityScore}
            />
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Total Cases" value={cases.length} />
          <Metric label="Active Stabilization" value={activeCases.length} />
          <Metric label="Routed / Assigned" value={routedCases.length} />
          <Metric label="Escalated" value={escalatedCases.length} />
          <Metric label="Critical" value={criticalCases.length} />
          <Metric label="Safeguarding Flags" value={safeguardingCases.length} />
          <Metric label="Active Responders" value={activeResponders.length} />
          <Metric label="Intervention Records" value={interventionVolume} />
          <Metric label="Cases With Intervention Evidence" value={uniqueInterventionCases} />
          <Metric label="Cases With Outcome Evidence" value={outcomeCaseIds.size} />
        </section>

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Continuity Intelligence Brief Template</h2>

            <p style={styles.panelNote}>
              Use this section to generate a standardized continuity intelligence brief. The
              dropdowns keep executive reporting consistent and prevent narrative drift.
            </p>

            <Select
              label="Report Template"
              value={reportTemplate}
              setValue={setReportTemplate}
              options={REPORT_TEMPLATES}
            />

            <Select
              label="Operating Level View"
              value={operatingLevel}
              setValue={setOperatingLevel}
              options={OPERATING_LEVELS}
            />

            <Select
              label="Pressure Focus"
              value={pressureFocus}
              setValue={setPressureFocus}
              options={PRESSURE_FOCUS}
            />

            <Select
              label="Recommended Action Cue"
              value={actionCue}
              setValue={setActionCue}
              options={ACTION_TEMPLATES}
            />

            <label style={styles.label}>
              Optional Additional Operational Notes
              <textarea
                value={additionalNotes}
                onChange={(event) => setAdditionalNotes(event.target.value)}
                placeholder="Use system-level operational notes only. Avoid personal details or blame language."
                style={styles.textarea}
              />
            </label>

            <button onClick={loadOperationalData} style={styles.primaryButton}>
              Refresh Continuity Intelligence
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Generated Continuity Intelligence Brief</h2>

            <p style={styles.panelNote}>
              This brief separates activity from stabilization confidence so leaders can
              see whether continuity is actually holding.
            </p>

            <pre style={styles.summaryBox}>{operationalBrief()}</pre>
          </div>
        </section>

        <section style={styles.layoutGrid}>
          <Panel
            title="Case Lifecycle Distribution"
            note="Shows where beneficiary cases are sitting inside the stabilization lifecycle."
            rows={statusBreakdown}
          />

          <Panel
            title="Severity Distribution"
            note="Shows operational pressure by severity level."
            rows={severityBreakdown}
          />

          <Panel
            title="Regional Visibility"
            note="Shows where beneficiary stabilization pressure is appearing by region."
            rows={topRegions}
          />

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Infrastructure Pressure Reading</h2>

            <div style={styles.pressureBadge}>{pressureStatus}</div>

            <p style={styles.panelNote}>
              This pressure status is an early operational signal derived from routed cases,
              escalations, critical cases, and safeguarding visibility. The continuity
              scores above go deeper by evaluating whether stabilization is actually
              becoming reliable.
            </p>

            <div style={styles.infoGrid}>
              <Info label="Stabilization Rate" value={`${stabilizationRate}%`} />
              <Info label="Intervention Coverage" value={`${interventionCoverage}%`} />
              <Info label="Outcome Coverage" value={`${outcomeCoverage}%`} />
              <Info label="Intervention Volume" value={`${interventionVolume}`} />
              <Info label="Cases With Evidence" value={`${uniqueInterventionCases}`} />
              <Info label="Routing Actions" value={`${routingActions.length}`} />
              <Info label="Sites in View" value={`${filteredInstitutions.length}`} />
              <Info
                label="Unresolved Pathways"
                value={`${unresolvedInterventionPathways}`}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function regionBreakdown(cases: BeneficiaryCase[]): PanelRow[] {
  const counts: Record<string, number> = {}

  cases.forEach((item) => {
    const region = item.region || 'Region not recorded'
    counts[region] = (counts[region] || 0) + 1
  })

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }))
}

function caseStatusBreakdown(cases: BeneficiaryCase[]): PanelRow[] {
  const counts: Record<string, number> = {}

  cases.forEach((item) => {
    const status = item.case_status || 'Status not recorded'
    counts[status] = (counts[status] || 0) + 1
  })

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }))
}

function severityLevelBreakdown(cases: BeneficiaryCase[]): PanelRow[] {
  const counts: Record<string, number> = {}

  cases.forEach((item) => {
    const severity = item.severity_level || 'Severity not recorded'
    counts[severity] = (counts[severity] || 0) + 1
  })

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }))
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <h2 style={styles.metricValue}>{value}</h2>
    </div>
  )
}

function ScoreMetric({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.scoreCard}>
      <p style={styles.scoreMetricLabel}>{label}</p>
      <h3 style={styles.scoreMetricValue}>{value}/100</h3>
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
            <span>{row.label}</span>
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
  scoreHero: {
    background: '#020617',
    border: '1px solid #1e293b',
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
  scoreState: {
    fontSize: 'clamp(38px, 8vw, 76px)',
    margin: '8px 0 20px',
    color: '#67e8f9',
    letterSpacing: '-0.05em',
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
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
    fontSize: '28px',
    margin: '10px 0 0',
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
    minHeight: '520px',
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
  emptyText: {
    color: '#94a3b8',
  },
  pressureBadge: {
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