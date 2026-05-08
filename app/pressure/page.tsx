'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  case_status: string
  region: string | null
  safeguarding_flag: boolean
  assigned_responder_id?: string | null
}

type RoutingAction = {
  id: string
  case_id: string
  assigned_responder_id?: string | null
}

type Responder = {
  id: string
  full_name: string
  operational_status: string
  region: string | null
}

const REPORT_TEMPLATES = [
  'Predictive routing pressure brief',
  'Regional coordination pressure brief',
  'Responder saturation visibility brief',
  'Continuity pressure monitoring brief',
  'Safeguarding accumulation pressure brief',
]

const PRESSURE_FOCUS_OPTIONS = [
  'Routing accumulation visibility',
  'Responder saturation pressure',
  'Regional continuity pressure',
  'Safeguarding density accumulation',
  'Coordination bottleneck visibility',
]

const OPERATING_SCOPE_OPTIONS = [
  'National view',
  'Regional view',
  'District view',
  'Responder-focused',
  'Coordination-focused',
]

const GOVERNANCE_INTERPRETATIONS = [
  'Pressure signals remain manageable with monitoring.',
  'Routing accumulation pressure is becoming visible.',
  'Responder saturation pressure requires coordination review.',
  'Continuity fragmentation pressure is increasing.',
  'Coordination bottlenecks are beginning to form.',
]

const RECOMMENDED_ACTIONS = [
  'Maintain routing monitoring.',
  'Increase responder distribution review.',
  'Strengthen coordination balancing pathways.',
  'Review continuity stabilization bottlenecks.',
  'Increase safeguarding coordination visibility.',
]

const GOVERNANCE_NOTES = [
  'Pressure monitoring remains active.',
  'No immediate coordination overload detected.',
  'Continuity stabilization review remains active.',
  'Routing accumulation signals require observation.',
  'Safeguarding visibility remains monitored.',
]

export default function PressurePage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [responders, setResponders] = useState<Responder[]>([])

  const [message, setMessage] = useState('')

  const [reportTemplate, setReportTemplate] = useState(
    REPORT_TEMPLATES[0]
  )

  const [pressureFocus, setPressureFocus] = useState(
    PRESSURE_FOCUS_OPTIONS[0]
  )

  const [operatingScope, setOperatingScope] = useState(
    OPERATING_SCOPE_OPTIONS[1]
  )

  const [governanceInterpretation, setGovernanceInterpretation] =
    useState(GOVERNANCE_INTERPRETATIONS[0])

  const [recommendedAction, setRecommendedAction] =
    useState(RECOMMENDED_ACTIONS[0])

  const [governanceNote, setGovernanceNote] = useState(
    GOVERNANCE_NOTES[0]
  )

  const [additionalNotes, setAdditionalNotes] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [
      casesResult,
      routingResult,
      respondersResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('responders').select('*'),
    ])

    setCases(casesResult.data || [])
    setRoutingActions(routingResult.data || [])
    setResponders(respondersResult.data || [])
  }

  const metrics = useMemo(() => {
    const safeguardingFlags = cases.filter(
      (item) => item.safeguarding_flag
    ).length

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

    const regionalLoadMap: Record<string, number> = {}

    cases.forEach((item) => {
      const region = item.region || 'Unknown'

      regionalLoadMap[region] =
        (regionalLoadMap[region] || 0) + 1
    })

    const responderLoadMap: Record<string, number> = {}

    routingActions.forEach((item) => {
      const responder =
        item.assigned_responder_id || 'UNASSIGNED'

      responderLoadMap[responder] =
        (responderLoadMap[responder] || 0) + 1
    })

    const highestRegionalPressure =
      Math.max(...Object.values(regionalLoadMap), 0)

    const highestResponderPressure =
      Math.max(...Object.values(responderLoadMap), 0)

    let pressureStatus = 'LOW_ROUTING_PRESSURE'

    if (
      highestResponderPressure >= 3 ||
      safeguardingFlags >= 3
    ) {
      pressureStatus = 'CRITICAL_ROUTING_PRESSURE'
    } else if (
      highestResponderPressure >= 2 ||
      highestRegionalPressure >= 3
    ) {
      pressureStatus = 'HIGH_ROUTING_PRESSURE'
    } else if (
      highestRegionalPressure >= 2 ||
      activeCases >= 2
    ) {
      pressureStatus = 'MODERATE_ROUTING_PRESSURE'
    }

    return {
      safeguardingFlags,
      activeCases,
      highestRegionalPressure,
      highestResponderPressure,
      pressureStatus,
      regionalLoadMap,
      responderLoadMap,
    }
  }, [cases, routingActions])

  function refreshPressure() {
    setMessage(
      'Predictive routing pressure intelligence refreshed.'
    )
  }

  const generatedBrief = `
EXAMIA LIS PREDICTIVE ROUTING PRESSURE BRIEF

Report Template:
${reportTemplate}

Pressure Focus:
${pressureFocus}

Operating Scope:
${operatingScope}

Routing Pressure Status:
${metrics.pressureStatus}

Pressure Metrics:
Total Cases: ${cases.length}
Active Stabilization Cases: ${metrics.activeCases}
Routing Actions: ${routingActions.length}
Safeguarding Flags: ${metrics.safeguardingFlags}
Highest Regional Pressure: ${metrics.highestRegionalPressure}
Highest Responder Pressure: ${metrics.highestResponderPressure}

Governance Interpretation:
${governanceInterpretation}

Recommended Action:
${recommendedAction}

Governance-Safe Operational Meaning:
This predictive routing pressure brief identifies where routing accumulation, responder concentration, safeguarding density, continuity fragmentation, and coordination bottlenecks may begin creating operational instability. It supports early stabilization balancing before coordination overload occurs. It does not assign blame to responders, institutions, beneficiaries, or partners.

Governance Monitoring Note:
${governanceNote}

Additional Operational Notes:
${additionalNotes || 'No additional operational notes entered.'}
  `.trim()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>
            EXAMIA LIS • ROUTING PRESSURE INTELLIGENCE
          </p>

          <h1 style={styles.title}>
            Predictive Routing Pressure Infrastructure
          </h1>

          <p style={styles.subtitle}>
            Detect routing accumulation, responder saturation,
            coordination bottlenecks, safeguarding density,
            and continuity pressure before stabilization pathways overload.
          </p>
        </section>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        <section style={styles.metricsGrid}>
          <Metric
            label="Pressure Status"
            value={metrics.pressureStatus}
          />

          <Metric
            label="Active Cases"
            value={metrics.activeCases.toString()}
          />

          <Metric
            label="Routing Actions"
            value={routingActions.length.toString()}
          />

          <Metric
            label="Safeguarding Flags"
            value={metrics.safeguardingFlags.toString()}
          />

          <Metric
            label="Highest Regional Pressure"
            value={metrics.highestRegionalPressure.toString()}
          />

          <Metric
            label="Highest Responder Pressure"
            value={metrics.highestResponderPressure.toString()}
          />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Predictive Routing Pressure Brief Template
          </h2>

          <p style={styles.helper}>
            Use standardized dropdowns to keep routing pressure
            forecasting governance-safe, operationally coherent,
            and nationally consistent.
          </p>

          <Select
            label="Report Template"
            value={reportTemplate}
            setValue={setReportTemplate}
            options={REPORT_TEMPLATES}
          />

          <Select
            label="Pressure Focus"
            value={pressureFocus}
            setValue={setPressureFocus}
            options={PRESSURE_FOCUS_OPTIONS}
          />

          <Select
            label="Operating Scope"
            value={operatingScope}
            setValue={setOperatingScope}
            options={OPERATING_SCOPE_OPTIONS}
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

          <Select
            label="Governance Monitoring Note"
            value={governanceNote}
            setValue={setGovernanceNote}
            options={GOVERNANCE_NOTES}
          />

          <label style={styles.label}>
            Optional Additional Operational Notes

            <textarea
              value={additionalNotes}
              onChange={(e) =>
                setAdditionalNotes(e.target.value)
              }
              placeholder="Use operational language only. Avoid blame or unnecessary personal details."
              style={styles.textarea}
            />
          </label>

          <button
            onClick={refreshPressure}
            style={styles.button}
          >
            Refresh Routing Pressure Intelligence
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Generated Routing Pressure Brief
          </h2>

          <div style={styles.briefBox}>
            <pre style={styles.pre}>
              {generatedBrief}
            </pre>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Regional Pressure Visibility
          </h2>

          <div style={styles.grid}>
            {Object.entries(metrics.regionalLoadMap).map(
              ([region, count]) => (
                <div key={region} style={styles.smallCard}>
                  <h3 style={styles.smallTitle}>
                    {region}
                  </h3>

                  <p style={styles.smallValue}>
                    {count} case(s)
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Responder Saturation Visibility
          </h2>

          <div style={styles.grid}>
            {Object.entries(metrics.responderLoadMap).map(
              ([responderId, count]) => {
                const responder = responders.find(
                  (item) => item.id === responderId
                )

                return (
                  <div
                    key={responderId}
                    style={styles.smallCard}
                  >
                    <h3 style={styles.smallTitle}>
                      {responder?.full_name ||
                        'Unassigned'}
                    </h3>

                    <p style={styles.smallValue}>
                      {count} routed case(s)
                    </p>
                  </div>
                )
              }
            )}
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
      <p style={styles.metricLabel}>
        {label}
      </p>

      <h2 style={styles.metricValue}>
        {value}
      </h2>
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
        {options.map((item: string) => (
          <option key={item}>
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
    fontSize: '56px',
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
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
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