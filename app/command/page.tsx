 'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  case_status: string
  severity_level: string
  safeguarding_flag: boolean
  region: string | null
}

type RoutingAction = {
  id: string
  case_id: string
  assigned_responder_id?: string | null
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

const COMMAND_REPORT_TEMPLATES = [
  'National stabilization command brief',
  'District stabilization command brief',
  'NGO coordination command brief',
  'Ministry operational command brief',
  'Safeguarding visibility command brief',
  'Recovery and continuity command brief',
]

const COMMAND_FOCUS_OPTIONS = [
  'Overall stabilization command view',
  'Predictive pressure visibility',
  'Recovery and continuity visibility',
  'Routing and bottleneck visibility',
  'Safeguarding coordination visibility',
  'Responder and institution capacity visibility',
]

const COMMAND_SCOPE_OPTIONS = [
  'National view',
  'Regional view',
  'District view',
  'Institution-focused',
  'Responder-network view',
  'Safeguarding view',
]

function getCommandGuidance(status: string) {
  if (status === 'STABLE_COMMAND_STATUS') {
    return {
      interpretation:
        'System-wide stabilization pressure appears controlled. Continue monitoring core continuity and recovery signals.',
      action:
        'Maintain standard stabilization monitoring and continue routine coordination review.',
      monitoring:
        'Stable command monitoring remains active.',
    }
  }

  if (status === 'WATCH_COMMAND_STATUS') {
    return {
      interpretation:
        'Early stabilization pressure is visible. Coordination leaders should monitor trajectory, routing pressure, and recovery movement.',
      action:
        'Review active cases, responder distribution, and stabilization conversion before pressure increases.',
      monitoring:
        'Watch-level command monitoring remains active.',
    }
  }

  if (status === 'ELEVATED_COMMAND_STATUS') {
    return {
      interpretation:
        'Multiple stabilization pressure signals are visible. Continuity weakening, routing concentration, or recovery pressure may require coordinated action.',
      action:
        'Prioritize coordination review, rebalance responder load, and strengthen recovery continuity pathways.',
      monitoring:
        'Elevated command monitoring remains active.',
    }
  }

  return {
    interpretation:
      'Critical stabilization pressure is visible. Coordination bottlenecks, recovery weakness, or safeguarding pressure may be threatening continuity.',
    action:
      'Escalate governance review, redistribute stabilization load, and activate high-priority coordination monitoring.',
    monitoring:
      'Critical command escalation monitoring is active.',
  }
}

export default function CommandCenterPage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [responders, setResponders] = useState<Responder[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])

  const [message, setMessage] = useState('')

  const [reportTemplate, setReportTemplate] = useState(COMMAND_REPORT_TEMPLATES[0])
  const [commandFocus, setCommandFocus] = useState(COMMAND_FOCUS_OPTIONS[0])
  const [commandScope, setCommandScope] = useState(COMMAND_SCOPE_OPTIONS[0])
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [
      casesResult,
      routingResult,
      interventionResult,
      outcomeResult,
      responderResult,
      institutionResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*'),
      supabase.from('responders').select('*'),
      supabase.from('institutions').select('*'),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionResult.error) console.error(interventionResult.error)
    if (outcomeResult.error) console.error(outcomeResult.error)
    if (responderResult.error) console.error(responderResult.error)
    if (institutionResult.error) console.error(institutionResult.error)

    setCases(casesResult.data || [])
    setRoutingActions(routingResult.data || [])
    setInterventions(interventionResult.data || [])
    setOutcomes(outcomeResult.data || [])
    setResponders(responderResult.data || [])
    setInstitutions(institutionResult.data || [])
    setMessage('Stabilization command intelligence refreshed.')
  }

  const intelligence = useMemo(() => {
    const totalCases = cases.length

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

    const stabilizedCases = cases.filter((item) => item.case_status === 'STABILIZED').length
    const escalatedCases = cases.filter((item) => item.case_status === 'ESCALATED').length
    const criticalCases = cases.filter((item) => item.severity_level === 'CRITICAL').length
    const safeguardingFlags = cases.filter((item) => item.safeguarding_flag).length

    const activeResponders = responders.filter(
      (item) => item.operational_status === 'ACTIVE'
    ).length

    const activeInstitutions = institutions.filter(
      (item) => item.coordination_status === 'ACTIVE'
    ).length

    const uniqueInterventionCases = new Set(interventions.map((item) => item.case_id)).size
    const uniqueOutcomeCases = new Set(outcomes.map((item) => item.case_id)).size

    const interventionCoverage =
      totalCases === 0 ? 0 : Math.round((uniqueInterventionCases / totalCases) * 100)

    const outcomeCoverage =
      totalCases === 0 ? 0 : Math.round((uniqueOutcomeCases / totalCases) * 100)

    const stabilizationRate =
      totalCases === 0 ? 0 : Math.round((stabilizedCases / totalCases) * 100)

    const responderLoadMap: Record<string, number> = {}

    routingActions.forEach((item) => {
      const responder = item.assigned_responder_id || 'UNASSIGNED'
      responderLoadMap[responder] = (responderLoadMap[responder] || 0) + 1
    })

    const regionalLoadMap: Record<string, number> = {}

    cases.forEach((item) => {
      const region = item.region || 'Region not recorded'
      regionalLoadMap[region] = (regionalLoadMap[region] || 0) + 1
    })

    const highestResponderLoad = Math.max(...Object.values(responderLoadMap), 0)
    const highestRegionalPressure = Math.max(...Object.values(regionalLoadMap), 0)

    const predictiveStatus =
      escalatedCases >= 3 || safeguardingFlags >= 3
        ? 'HIGH_FORECAST_PRESSURE'
        : activeCases >= Math.max(stabilizedCases, 1) || highestResponderLoad >= 2
          ? 'MODERATE_FORECAST_PRESSURE'
          : 'CONTROLLED_FORECAST_PRESSURE'

    const trajectoryStatus =
      escalatedCases >= 1
        ? 'ESCALATION_RISK'
        : safeguardingFlags >= 1 && stabilizationRate < 50
          ? 'FRAGMENTED_CONTINUITY'
          : interventionCoverage >= 100 && stabilizationRate === 0
            ? 'SLOW_STABILIZATION'
            : stabilizationRate >= 50
              ? 'RECOVERY_STRENGTHENING'
              : 'STABILIZING'

    const routingPressureStatus =
      highestResponderLoad >= 3 || safeguardingFlags >= 3
        ? 'CRITICAL_ROUTING_PRESSURE'
        : highestResponderLoad >= 2 || highestRegionalPressure >= 3
          ? 'HIGH_ROUTING_PRESSURE'
          : highestRegionalPressure >= 2 || activeCases >= 2
            ? 'MODERATE_ROUTING_PRESSURE'
            : 'LOW_ROUTING_PRESSURE'

    const outcomeCaseIds = new Set(outcomes.map((item) => item.case_id))
    const interventionCaseIds = new Set(interventions.map((item) => item.case_id))

    const unresolvedInterventionPathways = cases.filter(
      (item) =>
        [
          'NEED_DETECTED',
          'UNDER_ASSESSMENT',
          'ROUTED',
          'RESPONDER_ASSIGNED',
          'INTERVENTION_ACTIVE',
          'STABILIZING',
        ].includes(item.case_status) &&
        interventionCaseIds.has(item.id) &&
        !outcomeCaseIds.has(item.id)
    ).length

    const stalledCases = cases.filter(
      (item) =>
        [
          'NEED_DETECTED',
          'UNDER_ASSESSMENT',
          'ROUTED',
          'RESPONDER_ASSIGNED',
          'INTERVENTION_ACTIVE',
          'STABILIZING',
        ].includes(item.case_status) &&
        outcomeCaseIds.has(item.id) &&
        item.case_status !== 'STABILIZED'
    ).length

    const bottleneckStatus =
      highestResponderLoad >= 4 || stalledCases >= 3 || safeguardingFlags >= 3
        ? 'CRITICAL_BOTTLENECK_PRESSURE'
        : highestResponderLoad >= 2 || unresolvedInterventionPathways >= 2 || stalledCases >= 2
          ? 'HIGH_BOTTLENECK_PRESSURE'
          : unresolvedInterventionPathways >= 1 || safeguardingFlags >= 1
            ? 'MODERATE_BOTTLENECK_PRESSURE'
            : 'LOW_BOTTLENECK_PRESSURE'

    const recoveryStatus =
      stabilizationRate >= 70 && interventionCoverage >= 70 && outcomeCoverage >= 70
        ? 'RECOVERY_STRENGTHENING'
        : interventionCoverage >= 50 && outcomeCoverage >= 50
          ? 'RECOVERY_PRESSURE_VISIBLE'
          : 'RECOVERY_FRAGMENTATION_RISK'

    const reliabilityScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(
          stabilizationRate * 0.4 +
            interventionCoverage * 0.25 +
            outcomeCoverage * 0.25 -
            (totalCases === 0 ? 0 : Math.round((escalatedCases / totalCases) * 100)) * 0.1
        )
      )
    )

    const riskPoints =
      (predictiveStatus === 'HIGH_FORECAST_PRESSURE' ? 3 : predictiveStatus === 'MODERATE_FORECAST_PRESSURE' ? 2 : 0) +
      (trajectoryStatus === 'ESCALATION_RISK' ? 3 : trajectoryStatus === 'FRAGMENTED_CONTINUITY' ? 2 : trajectoryStatus === 'SLOW_STABILIZATION' ? 1 : 0) +
      (routingPressureStatus === 'CRITICAL_ROUTING_PRESSURE' ? 3 : routingPressureStatus === 'HIGH_ROUTING_PRESSURE' ? 2 : routingPressureStatus === 'MODERATE_ROUTING_PRESSURE' ? 1 : 0) +
      (bottleneckStatus === 'CRITICAL_BOTTLENECK_PRESSURE' ? 3 : bottleneckStatus === 'HIGH_BOTTLENECK_PRESSURE' ? 2 : bottleneckStatus === 'MODERATE_BOTTLENECK_PRESSURE' ? 1 : 0) +
      (recoveryStatus === 'RECOVERY_FRAGMENTATION_RISK' ? 2 : recoveryStatus === 'RECOVERY_PRESSURE_VISIBLE' ? 1 : 0)

    const commandStatus =
      riskPoints >= 9
        ? 'CRITICAL_COMMAND_STATUS'
        : riskPoints >= 6
          ? 'ELEVATED_COMMAND_STATUS'
          : riskPoints >= 3
            ? 'WATCH_COMMAND_STATUS'
            : 'STABLE_COMMAND_STATUS'

    return {
      totalCases,
      activeCases,
      stabilizedCases,
      escalatedCases,
      criticalCases,
      safeguardingFlags,
      activeResponders,
      activeInstitutions,
      interventionCoverage,
      outcomeCoverage,
      stabilizationRate,
      highestResponderLoad,
      highestRegionalPressure,
      unresolvedInterventionPathways,
      stalledCases,
      predictiveStatus,
      trajectoryStatus,
      routingPressureStatus,
      bottleneckStatus,
      recoveryStatus,
      reliabilityScore,
      commandStatus,
    }
  }, [cases, routingActions, interventions, outcomes, responders, institutions])

  const commandGuidance = getCommandGuidance(intelligence.commandStatus)

  const commandBrief = `
EXAMIA LIS STABILIZATION COMMAND BRIEF

Report Template:
${reportTemplate}

Command Focus:
${commandFocus}

Command Scope:
${commandScope}

Overall Command Status:
${intelligence.commandStatus}

Core Command Metrics:
Total Cases: ${intelligence.totalCases}
Active Stabilization Cases: ${intelligence.activeCases}
Stabilized Cases: ${intelligence.stabilizedCases}
Escalated Cases: ${intelligence.escalatedCases}
Critical Cases: ${intelligence.criticalCases}
Safeguarding Flags: ${intelligence.safeguardingFlags}
Active Responders: ${intelligence.activeResponders}
Active Coordination Sites: ${intelligence.activeInstitutions}
Intervention Coverage: ${intelligence.interventionCoverage}%
Outcome Coverage: ${intelligence.outcomeCoverage}%
Stabilization Rate: ${intelligence.stabilizationRate}%
Reliability Score: ${intelligence.reliabilityScore}/100

Integrated Intelligence Signals:
Predictive Status: ${intelligence.predictiveStatus}
Trajectory Status: ${intelligence.trajectoryStatus}
Routing Pressure Status: ${intelligence.routingPressureStatus}
Bottleneck Status: ${intelligence.bottleneckStatus}
Recovery Status: ${intelligence.recoveryStatus}
Highest Responder Load: ${intelligence.highestResponderLoad}
Highest Regional Pressure: ${intelligence.highestRegionalPressure}
Unresolved Intervention Pathways: ${intelligence.unresolvedInterventionPathways}
Stalled Stabilization Cases: ${intelligence.stalledCases}

Governance Interpretation:
${commandGuidance.interpretation}

Recommended Command Action:
${commandGuidance.action}

Governance-Safe Command Meaning:
This command brief consolidates stabilization pressure, continuity trajectory, routing pressure, bottleneck visibility, recovery movement, intervention coverage, outcome coverage, safeguarding visibility, and reliability into one executive coordination view. It supports system-level action without assigning blame to responders, institutions, beneficiaries, families, or partners.

Monitoring Note:
${commandGuidance.monitoring}

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA LIS • STABILIZATION COMMAND CENTER</p>

          <h1 style={styles.title}>Stabilization Command Infrastructure</h1>

          <p style={styles.subtitle}>
            Consolidate predictive pressure, trajectory, routing pressure, bottlenecks,
            recovery, reliability, safeguarding visibility, and stabilization movement into
            one governance-safe command view.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.metricsGrid}>
          <Metric label="Command Status" value={intelligence.commandStatus} />
          <Metric label="Predictive Status" value={intelligence.predictiveStatus} />
          <Metric label="Trajectory Status" value={intelligence.trajectoryStatus} />
          <Metric label="Routing Pressure" value={intelligence.routingPressureStatus} />
          <Metric label="Bottleneck Status" value={intelligence.bottleneckStatus} />
          <Metric label="Recovery Status" value={intelligence.recoveryStatus} />
          <Metric label="Reliability Score" value={`${intelligence.reliabilityScore}/100`} />
          <Metric label="Stabilization Rate" value={`${intelligence.stabilizationRate}%`} />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Command Brief Template</h2>

          <p style={styles.helper}>
            Use standardized dropdowns to keep executive command intelligence
            governance-safe, operationally coherent, and ready for district, NGO, ministry,
            or institutional review.
          </p>

          <Select
            label="Command Report Template"
            value={reportTemplate}
            setValue={setReportTemplate}
            options={COMMAND_REPORT_TEMPLATES}
          />

          <Select
            label="Command Focus"
            value={commandFocus}
            setValue={setCommandFocus}
            options={COMMAND_FOCUS_OPTIONS}
          />

          <Select
            label="Command Scope"
            value={commandScope}
            setValue={setCommandScope}
            options={COMMAND_SCOPE_OPTIONS}
          />

          <div style={styles.alignedBox}>
            <h3 style={styles.alignedTitle}>Auto-Aligned Command Interpretation</h3>
            <p style={styles.alignedText}>{commandGuidance.interpretation}</p>

            <h3 style={styles.alignedTitle}>Auto-Aligned Command Action</h3>
            <p style={styles.alignedText}>{commandGuidance.action}</p>

            <h3 style={styles.alignedTitle}>Auto-Aligned Monitoring Note</h3>
            <p style={styles.alignedText}>{commandGuidance.monitoring}</p>
          </div>

          <label style={styles.label}>
            Optional Additional Operational Notes
            <textarea
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
              placeholder="Use system-level operational notes only. Avoid blame, personal judgment, or unnecessary personal details."
              style={styles.textarea}
            />
          </label>

          <button onClick={loadData} style={styles.button}>
            Refresh Command Intelligence
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Generated Stabilization Command Brief</h2>

          <div style={styles.briefBox}>
            <pre style={styles.pre}>{commandBrief}</pre>
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