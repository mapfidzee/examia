'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  beneficiary_name: string
  case_status: string
  safeguarding_flag: boolean
  region: string | null
  assigned_responder_id?: string | null
}

type RoutingAction = {
  id: string
  case_id: string
  assigned_responder_id?: string | null
}

type Intervention = {
  id: string
  case_id: string
}

type Outcome = {
  id: string
  case_id: string
  outcome_status?: string | null
}

type Responder = {
  id: string
  full_name: string
}

const REPORT_TEMPLATES = [
  'Coordination bottleneck visibility brief',
  'Responder concentration bottleneck brief',
  'Continuity blockage visibility brief',
  'Safeguarding bottleneck visibility brief',
  'Regional coordination bottleneck brief',
]

const BOTTLENECK_FOCUS_OPTIONS = [
  'Routing accumulation visibility',
  'Responder concentration pressure',
  'Unresolved stabilization pathways',
  'Safeguarding continuity blockage',
  'Regional coordination bottlenecks',
]

const OPERATING_SCOPE_OPTIONS = [
  'National view',
  'Regional view',
  'District view',
  'Responder-focused',
  'Coordination-focused',
]

function getBottleneckInterpretation(status: string) {
  if (status === 'LOW_BOTTLENECK_PRESSURE') {
    return {
      interpretation:
        'Coordination pathways appear stable with minimal operational blockage visibility.',
      action: 'Maintain standard coordination monitoring.',
      monitoring: 'Low bottleneck monitoring remains active.',
    }
  }

  if (status === 'MODERATE_BOTTLENECK_PRESSURE') {
    return {
      interpretation:
        'Some coordination pathways are slowing and require visibility monitoring.',
      action: 'Review continuity pathways and monitor stabilization progression.',
      monitoring: 'Moderate bottleneck monitoring remains active.',
    }
  }

  if (status === 'HIGH_BOTTLENECK_PRESSURE') {
    return {
      interpretation:
        'Visible coordination bottlenecks are slowing stabilization continuity and require intervention review.',
      action:
        'Redistribute coordination load and review unresolved stabilization pathways.',
      monitoring: 'High bottleneck monitoring remains active.',
    }
  }

  return {
    interpretation:
      'Critical coordination bottlenecks are visible and continuity fragmentation risk is increasing.',
    action:
      'Escalate operational coordination review and rebalance stabilization infrastructure immediately.',
    monitoring: 'Critical bottleneck escalation monitoring is active.',
  }
}

export default function BottlenecksPage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [responders, setResponders] = useState<Responder[]>([])

  const [message, setMessage] = useState('')

  const [reportTemplate, setReportTemplate] = useState(REPORT_TEMPLATES[0])
  const [bottleneckFocus, setBottleneckFocus] = useState(BOTTLENECK_FOCUS_OPTIONS[0])
  const [operatingScope, setOperatingScope] = useState(OPERATING_SCOPE_OPTIONS[1])
  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [
      casesResult,
      routingResult,
      interventionsResult,
      outcomesResult,
      respondersResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*'),
      supabase.from('responders').select('*'),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionsResult.error) console.error(interventionsResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)
    if (respondersResult.error) console.error(respondersResult.error)

    setCases(casesResult.data || [])
    setRoutingActions(routingResult.data || [])
    setInterventions(interventionsResult.data || [])
    setOutcomes(outcomesResult.data || [])
    setResponders(respondersResult.data || [])

    setMessage('Coordination bottleneck intelligence refreshed.')
  }

  const metrics = useMemo(() => {
    const safeguardingFlags = cases.filter((item) => item.safeguarding_flag).length

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

    const stabilizedCases = cases.filter(
      (item) => item.case_status === 'STABILIZED'
    ).length

    const interventionCaseIds = new Set(interventions.map((item) => item.case_id))
    const outcomeCaseIds = new Set(outcomes.map((item) => item.case_id))

    const unresolvedCases = activeCases.filter(
      (item) => interventionCaseIds.has(item.id) && !outcomeCaseIds.has(item.id)
    ).length

    const stalledCases = activeCases.filter(
      (item) => outcomeCaseIds.has(item.id) && item.case_status !== 'STABILIZED'
    ).length

    const responderLoadMap: Record<string, number> = {}

    routingActions.forEach((item) => {
      const responder = item.assigned_responder_id || 'UNASSIGNED'
      responderLoadMap[responder] = (responderLoadMap[responder] || 0) + 1
    })

    const highestResponderLoad = Math.max(...Object.values(responderLoadMap), 0)

    let bottleneckStatus = 'LOW_BOTTLENECK_PRESSURE'

    if (highestResponderLoad >= 4 || stalledCases >= 3 || safeguardingFlags >= 3) {
      bottleneckStatus = 'CRITICAL_BOTTLENECK_PRESSURE'
    } else if (highestResponderLoad >= 2 || unresolvedCases >= 2 || stalledCases >= 2) {
      bottleneckStatus = 'HIGH_BOTTLENECK_PRESSURE'
    } else if (unresolvedCases >= 1 || safeguardingFlags >= 1) {
      bottleneckStatus = 'MODERATE_BOTTLENECK_PRESSURE'
    }

    return {
      safeguardingFlags,
      activeCases: activeCases.length,
      stabilizedCases,
      unresolvedCases,
      stalledCases,
      highestResponderLoad,
      responderLoadMap,
      bottleneckStatus,
    }
  }, [cases, routingActions, interventions, outcomes])

  const aligned = getBottleneckInterpretation(metrics.bottleneckStatus)

  const generatedBrief = `
EXAMIA LIS COORDINATION BOTTLENECK VISIBILITY BRIEF

Report Template:
${reportTemplate}

Bottleneck Focus:
${bottleneckFocus}

Operating Scope:
${operatingScope}

Bottleneck Status:
${metrics.bottleneckStatus}

Bottleneck Metrics:
Total Cases: ${cases.length}
Active Stabilization Cases: ${metrics.activeCases}
Stabilized Cases: ${metrics.stabilizedCases}
Safeguarding Flags: ${metrics.safeguardingFlags}
Unresolved Intervention Pathways: ${metrics.unresolvedCases}
Stalled Stabilization Cases: ${metrics.stalledCases}
Highest Responder Load: ${metrics.highestResponderLoad}

Governance Interpretation:
${aligned.interpretation}

Recommended Action:
${aligned.action}

Governance-Safe Operational Meaning:
This coordination bottleneck visibility brief identifies where stabilization pathways are slowing, fragmenting, accumulating, or failing to progress despite routing activity, intervention evidence, or responder assignment. It supports early coordination balancing before operational overload occurs. It does not assign blame to responders, beneficiaries, institutions, or partners.

Governance Monitoring Note:
${aligned.monitoring}

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>
            EXAMIA LIS • COORDINATION BOTTLENECK VISIBILITY
          </p>

          <h1 style={styles.title}>Coordination Bottleneck Infrastructure</h1>

          <p style={styles.subtitle}>
            Detect slowing stabilization pathways, responder concentration,
            safeguarding accumulation, unresolved interventions, and continuity
            fragmentation before coordination overload occurs.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.metricsGrid}>
          <Metric label="Bottleneck Status" value={metrics.bottleneckStatus} />
          <Metric label="Active Cases" value={metrics.activeCases.toString()} />
          <Metric
            label="Unresolved Pathways"
            value={metrics.unresolvedCases.toString()}
          />
          <Metric label="Stalled Cases" value={metrics.stalledCases.toString()} />
          <Metric
            label="Safeguarding Flags"
            value={metrics.safeguardingFlags.toString()}
          />
          <Metric
            label="Highest Responder Load"
            value={metrics.highestResponderLoad.toString()}
          />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Coordination Bottleneck Brief Template</h2>

          <p style={styles.helper}>
            Use standardized dropdowns to keep bottleneck visibility
            governance-safe, operationally coherent, and nationally consistent.
          </p>

          <Select
            label="Report Template"
            value={reportTemplate}
            setValue={setReportTemplate}
            options={REPORT_TEMPLATES}
          />

          <Select
            label="Bottleneck Focus"
            value={bottleneckFocus}
            setValue={setBottleneckFocus}
            options={BOTTLENECK_FOCUS_OPTIONS}
          />

          <Select
            label="Operating Scope"
            value={operatingScope}
            setValue={setOperatingScope}
            options={OPERATING_SCOPE_OPTIONS}
          />

          <div style={styles.alignedBox}>
            <h3 style={styles.alignedTitle}>
              Auto-Aligned Governance Interpretation
            </h3>

            <p style={styles.alignedText}>{aligned.interpretation}</p>

            <h3 style={styles.alignedTitle}>Auto-Aligned Recommended Action</h3>

            <p style={styles.alignedText}>{aligned.action}</p>

            <h3 style={styles.alignedTitle}>Auto-Aligned Monitoring Note</h3>

            <p style={styles.alignedText}>{aligned.monitoring}</p>
          </div>

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
            Refresh Bottleneck Intelligence
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Generated Bottleneck Brief</h2>

          <div style={styles.briefBox}>
            <pre style={styles.pre}>{generatedBrief}</pre>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Responder Concentration Visibility</h2>

          <div style={styles.grid}>
            {Object.entries(metrics.responderLoadMap).map(([responderId, count]) => {
              const responder = responders.find((item) => item.id === responderId)

              return (
                <div key={responderId} style={styles.smallCard}>
                  <h3 style={styles.smallTitle}>
                    {responder?.full_name || 'Unassigned'}
                  </h3>

                  <p style={styles.smallValue}>{count} routed case(s)</p>
                </div>
              )
            })}
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
    fontSize: '24px',
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

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },

  smallCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
  },

  smallTitle: {
    margin: 0,
    fontSize: '20px',
  },

  smallValue: {
    marginTop: '10px',
    color: '#cbd5e1',
  },
}