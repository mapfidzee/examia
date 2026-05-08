'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  case_status: string
  safeguarding_flag: boolean
  intervention_summary: string | null
  outcome_summary: string | null
}

type TimelineEvent = {
  id: string
  case_id: string
  event_type: string | null
  event_summary: string | null
  actor?: string | null
}

type RoutingAction = {
  id: string
  case_id: string
  routing_status: string | null
  routing_reason: string | null
  assigned_responder_id?: string | null
  institution_id?: string | null
}

type InterventionRecord = {
  id: string
  case_id: string
  intervention_type: string | null
  intervention_summary: string | null
}

type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
}

type GovernanceAction = {
  id: string
  action_type?: string | null
  action_summary?: string | null
  governance_status?: string | null
}

type Responder = {
  id: string
  full_name: string
  operational_status: string
}

type Institution = {
  id: string
  institution_name: string
  coordination_status: string | null
}

const AUDIT_REPORT_TEMPLATES = [
  'Governance traceability audit brief',
  'Case lifecycle audit brief',
  'Routing traceability audit brief',
  'Intervention evidence audit brief',
  'Outcome evidence audit brief',
  'Institutional coordination audit brief',
  'Responder governance audit brief',
]

const AUDIT_FOCUS_OPTIONS = [
  'Overall governance traceability',
  'Lifecycle trace coverage',
  'Routing trace coverage',
  'Intervention evidence coverage',
  'Outcome evidence coverage',
  'Governance action visibility',
  'Institution and responder traceability',
]

const AUDIT_SCOPE_OPTIONS = [
  'National view',
  'Regional view',
  'District view',
  'Institution-focused',
  'Responder-focused',
  'Safeguarding view',
]

function getAuditGuidance(status: string) {
  if (status === 'STRONG_AUDIT_INTEGRITY') {
    return {
      interpretation:
        'Governance traceability appears strong. Core stabilization actions have visible supporting records.',
      action:
        'Maintain standard audit monitoring and continue structured evidence discipline.',
      monitoring:
        'Strong audit integrity monitoring remains active.',
    }
  }

  if (status === 'DEVELOPING_AUDIT_INTEGRITY') {
    return {
      interpretation:
        'Governance traceability is developing. Some evidence pathways are visible, but trace coverage should continue improving.',
      action:
        'Review missing trace areas and strengthen structured recording across lifecycle, routing, intervention, and outcome records.',
      monitoring:
        'Developing audit integrity monitoring remains active.',
    }
  }

  if (status === 'WEAK_AUDIT_INTEGRITY') {
    return {
      interpretation:
        'Audit traceability gaps are visible. Governance evidence may be insufficient for reliable operational review.',
      action:
        'Prioritize trace completion and review lifecycle, routing, intervention, and outcome evidence gaps.',
      monitoring:
        'Weak audit integrity monitoring remains active.',
    }
  }

  return {
    interpretation:
      'Critical audit traceability gaps are visible. System-level governance review is required before scale.',
    action:
      'Escalate governance traceability review and strengthen mandatory evidence pathways.',
    monitoring:
      'Critical audit integrity escalation monitoring is active.',
  }
}

export default function AuditPage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [governanceActions, setGovernanceActions] = useState<GovernanceAction[]>([])
  const [responders, setResponders] = useState<Responder[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])

  const [message, setMessage] = useState('')
  const [reportTemplate, setReportTemplate] = useState(AUDIT_REPORT_TEMPLATES[0])
  const [auditFocus, setAuditFocus] = useState(AUDIT_FOCUS_OPTIONS[0])
  const [auditScope, setAuditScope] = useState(AUDIT_SCOPE_OPTIONS[0])
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    loadAuditData()
  }, [])

  async function loadAuditData() {
    const [
      casesResult,
      timelineResult,
      routingResult,
      interventionResult,
      outcomeResult,
      governanceResult,
      responderResult,
      institutionResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('case_timeline').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*'),
      supabase.from('governance_actions').select('*'),
      supabase.from('responders').select('*'),
      supabase.from('institutions').select('*'),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (timelineResult.error) console.error(timelineResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionResult.error) console.error(interventionResult.error)
    if (outcomeResult.error) console.error(outcomeResult.error)
    if (governanceResult.error) console.error(governanceResult.error)
    if (responderResult.error) console.error(responderResult.error)
    if (institutionResult.error) console.error(institutionResult.error)

    setCases(casesResult.data || [])
    setTimelineEvents(timelineResult.data || [])
    setRoutingActions(routingResult.data || [])
    setInterventions(interventionResult.data || [])
    setOutcomes(outcomeResult.data || [])
    setGovernanceActions(governanceResult.data || [])
    setResponders(responderResult.data || [])
    setInstitutions(institutionResult.data || [])

    setMessage('Governance audit intelligence refreshed.')
  }

  const audit = useMemo(() => {
    const totalCases = cases.length

    const caseIds = new Set(cases.map((item) => item.id))
    const timelineCaseIds = new Set(timelineEvents.map((item) => item.case_id))
    const routedCaseIds = new Set(routingActions.map((item) => item.case_id))
    const interventionCaseIds = new Set(interventions.map((item) => item.case_id))
    const outcomeCaseIds = new Set(outcomes.map((item) => item.case_id))

    const lifecycleTraceCoverage =
      totalCases === 0 ? 0 : Math.round((timelineCaseIds.size / totalCases) * 100)

    const routingTraceCoverage =
      totalCases === 0 ? 0 : Math.round((routedCaseIds.size / totalCases) * 100)

    const interventionTraceCoverage =
      totalCases === 0 ? 0 : Math.round((interventionCaseIds.size / totalCases) * 100)

    const outcomeTraceCoverage =
      totalCases === 0 ? 0 : Math.round((outcomeCaseIds.size / totalCases) * 100)

    const casesWithInterventionSummary = cases.filter(
      (item) => item.intervention_summary && item.intervention_summary.trim().length > 0
    ).length

    const casesWithOutcomeSummary = cases.filter(
      (item) => item.outcome_summary && item.outcome_summary.trim().length > 0
    ).length

    const interventionSummaryCoverage =
      totalCases === 0 ? 0 : Math.round((casesWithInterventionSummary / totalCases) * 100)

    const outcomeSummaryCoverage =
      totalCases === 0 ? 0 : Math.round((casesWithOutcomeSummary / totalCases) * 100)

    const safeguardingCases = cases.filter((item) => item.safeguarding_flag).length

    const activeResponders = responders.filter(
      (item) => item.operational_status === 'ACTIVE'
    ).length

    const activeInstitutions = institutions.filter(
      (item) => item.coordination_status === 'ACTIVE'
    ).length

    const traceabilityCoverage =
      Math.round(
        (lifecycleTraceCoverage +
          routingTraceCoverage +
          interventionTraceCoverage +
          outcomeTraceCoverage +
          interventionSummaryCoverage +
          outcomeSummaryCoverage) /
          6
      )

    const governanceIntegrityScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          traceabilityCoverage * 0.7 +
            (governanceActions.length > 0 ? 15 : 0) +
            (timelineEvents.length > 0 ? 15 : 0)
        )
      )
    )

    const auditStatus =
      governanceIntegrityScore >= 80
        ? 'STRONG_AUDIT_INTEGRITY'
        : governanceIntegrityScore >= 55
          ? 'DEVELOPING_AUDIT_INTEGRITY'
          : governanceIntegrityScore >= 30
            ? 'WEAK_AUDIT_INTEGRITY'
            : 'CRITICAL_AUDIT_GAP'

    const missingLifecycleTrace = [...caseIds].filter((id) => !timelineCaseIds.has(id)).length
    const missingRoutingTrace = [...caseIds].filter((id) => !routedCaseIds.has(id)).length
    const missingInterventionTrace = [...caseIds].filter(
      (id) => !interventionCaseIds.has(id)
    ).length
    const missingOutcomeTrace = [...caseIds].filter((id) => !outcomeCaseIds.has(id)).length

    return {
      totalCases,
      lifecycleTraceCoverage,
      routingTraceCoverage,
      interventionTraceCoverage,
      outcomeTraceCoverage,
      interventionSummaryCoverage,
      outcomeSummaryCoverage,
      traceabilityCoverage,
      governanceIntegrityScore,
      auditStatus,
      safeguardingCases,
      activeResponders,
      activeInstitutions,
      missingLifecycleTrace,
      missingRoutingTrace,
      missingInterventionTrace,
      missingOutcomeTrace,
    }
  }, [
    cases,
    timelineEvents,
    routingActions,
    interventions,
    outcomes,
    governanceActions,
    responders,
    institutions,
  ])

  const guidance = getAuditGuidance(audit.auditStatus)

  const auditBrief = `
EXAMIA LIS GOVERNANCE AUDIT INTELLIGENCE BRIEF

Report Template:
${reportTemplate}

Audit Focus:
${auditFocus}

Audit Scope:
${auditScope}

Audit Status:
${audit.auditStatus}

Governance Integrity Score:
${audit.governanceIntegrityScore}/100

Audit Coverage Metrics:
Total Cases: ${audit.totalCases}
Traceability Coverage: ${audit.traceabilityCoverage}%
Lifecycle Trace Coverage: ${audit.lifecycleTraceCoverage}%
Routing Trace Coverage: ${audit.routingTraceCoverage}%
Intervention Evidence Trace Coverage: ${audit.interventionTraceCoverage}%
Outcome Evidence Trace Coverage: ${audit.outcomeTraceCoverage}%
Intervention Summary Coverage: ${audit.interventionSummaryCoverage}%
Outcome Summary Coverage: ${audit.outcomeSummaryCoverage}%

Trace Gaps:
Cases Missing Lifecycle Trace: ${audit.missingLifecycleTrace}
Cases Missing Routing Trace: ${audit.missingRoutingTrace}
Cases Missing Intervention Trace: ${audit.missingInterventionTrace}
Cases Missing Outcome Trace: ${audit.missingOutcomeTrace}

Governance System Visibility:
Timeline Events: ${timelineEvents.length}
Routing Actions: ${routingActions.length}
Intervention Records: ${interventions.length}
Outcome Records: ${outcomes.length}
Governance Actions: ${governanceActions.length}
Safeguarding Cases: ${audit.safeguardingCases}
Active Responders: ${audit.activeResponders}
Active Coordination Sites: ${audit.activeInstitutions}

Governance Interpretation:
${guidance.interpretation}

Recommended Governance Action:
${guidance.action}

Governance-Safe Audit Meaning:
This audit brief evaluates traceability coverage across lifecycle events, routing actions, intervention evidence, outcome evidence, governance actions, responders, institutions, and safeguarding visibility. It supports operational integrity and continuity protection without assigning blame to beneficiaries, responders, institutions, families, or partners.

Monitoring Note:
${guidance.monitoring}

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA LIS • GOVERNANCE AUDIT INTELLIGENCE</p>

          <h1 style={styles.title}>Governance Traceability Infrastructure</h1>

          <p style={styles.subtitle}>
            Verify that lifecycle movement, routing, interventions, outcomes, governance
            actions, responder activity, and institutional coordination remain traceable,
            auditable, and governance-safe.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.metricsGrid}>
          <Metric label="Audit Status" value={audit.auditStatus} />
          <Metric label="Governance Integrity" value={`${audit.governanceIntegrityScore}/100`} />
          <Metric label="Traceability Coverage" value={`${audit.traceabilityCoverage}%`} />
          <Metric label="Lifecycle Trace" value={`${audit.lifecycleTraceCoverage}%`} />
          <Metric label="Routing Trace" value={`${audit.routingTraceCoverage}%`} />
          <Metric label="Intervention Trace" value={`${audit.interventionTraceCoverage}%`} />
          <Metric label="Outcome Trace" value={`${audit.outcomeTraceCoverage}%`} />
          <Metric label="Governance Actions" value={`${governanceActions.length}`} />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Audit Brief Template</h2>

          <p style={styles.helper}>
            Use standardized dropdowns to keep audit intelligence governance-safe,
            operationally coherent, and suitable for institutional, NGO, ministry, or
            district review.
          </p>

          <Select
            label="Audit Report Template"
            value={reportTemplate}
            setValue={setReportTemplate}
            options={AUDIT_REPORT_TEMPLATES}
          />

          <Select
            label="Audit Focus"
            value={auditFocus}
            setValue={setAuditFocus}
            options={AUDIT_FOCUS_OPTIONS}
          />

          <Select
            label="Audit Scope"
            value={auditScope}
            setValue={setAuditScope}
            options={AUDIT_SCOPE_OPTIONS}
          />

          <div style={styles.alignedBox}>
            <h3 style={styles.alignedTitle}>Auto-Aligned Audit Interpretation</h3>
            <p style={styles.alignedText}>{guidance.interpretation}</p>

            <h3 style={styles.alignedTitle}>Auto-Aligned Governance Action</h3>
            <p style={styles.alignedText}>{guidance.action}</p>

            <h3 style={styles.alignedTitle}>Auto-Aligned Monitoring Note</h3>
            <p style={styles.alignedText}>{guidance.monitoring}</p>
          </div>

          <label style={styles.label}>
            Optional Additional Operational Notes
            <textarea
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
              placeholder="Use system-level audit notes only. Avoid blame, personal judgment, or unnecessary personal details."
              style={styles.textarea}
            />
          </label>

          <button onClick={loadAuditData} style={styles.button}>
            Refresh Audit Intelligence
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Generated Governance Audit Brief</h2>

          <div style={styles.briefBox}>
            <pre style={styles.pre}>{auditBrief}</pre>
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
    maxWidth: '1280px',
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
    fontSize: 'clamp(34px, 6vw, 58px)',
    lineHeight: 1.05,
    margin: '12px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    maxWidth: '980px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
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
    fontSize: '22px',
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