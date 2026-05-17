'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
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

type ResponderConcentration = {
  responderId: string
  responderName: string
  posture: string
  interpretation: string
}

const REPORT_TEMPLATES = [
  'Executive bottleneck continuity brief',
  'Routing blockage governance brief',
  'Responder concentration governance brief',
  'Stabilization blockage visibility brief',
  'Regional continuity bottleneck brief',
]

const BOTTLENECK_FOCUS_OPTIONS = [
  'Routing congestion visibility',
  'Responder concentration pressure',
  'Stabilization blockage visibility',
  'Safeguarding continuity escalation',
  'Regional continuity congestion',
]

const OPERATING_SCOPE_OPTIONS = [
  'National continuity view',
  'Regional continuity view',
  'District continuity view',
  'Routing governance view',
  'Executive continuity command',
]

export default function BottlenecksPage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [responders, setResponders] = useState<Responder[]>([])
  const [message, setMessage] = useState('')

  const [reportTemplate, setReportTemplate] = useState(REPORT_TEMPLATES[0])
  const [bottleneckFocus, setBottleneckFocus] = useState(BOTTLENECK_FOCUS_OPTIONS[0])
  const [operatingScope, setOperatingScope] = useState(OPERATING_SCOPE_OPTIONS[0])
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

    setMessage('TSINAXA CGI bottleneck intelligence refreshed.')
  }

  const intelligence = useMemo(() => {
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
    } else if (
      highestResponderLoad >= 2 ||
      unresolvedCases >= 2 ||
      stalledCases >= 2
    ) {
      bottleneckStatus = 'HIGH_BOTTLENECK_PRESSURE'
    } else if (unresolvedCases >= 1 || safeguardingFlags >= 1) {
      bottleneckStatus = 'MODERATE_BOTTLENECK_PRESSURE'
    }

    const responderConcentration: ResponderConcentration[] = Object.entries(
      responderLoadMap
    ).map(([responderId, load]) => {
      const responder = responders.find((item) => item.id === responderId) || null

      const responderName =
        responderId === 'UNASSIGNED'
          ? 'Unassigned Pathways'
          : responder?.full_name || 'Unknown Responder'

      let posture = 'RESPONDER LOAD CONTROLLED'
      let interpretation = 'Continuity ownership appears controlled.'

      if (load >= 4) {
        posture = 'RESPONDER CONCENTRATION CRITICAL'
        interpretation =
          'Continuity ownership concentration may threaten survivability.'
      } else if (load >= 2) {
        posture = 'RESPONDER CONCENTRATION VISIBLE'
        interpretation =
          'Visible continuity concentration should remain under governance review.'
      }

      return {
        responderId,
        responderName,
        posture,
        interpretation,
      }
    })

    return {
      bottleneckPosture: interpretBottleneckStatus(bottleneckStatus),
      routingCongestion: interpretRoutingCongestion(highestResponderLoad),
      stabilizationDelay: interpretStabilizationDelay(stalledCases),
      safeguardingVisibility: interpretSafeguarding(safeguardingFlags),
      responderPressure: interpretResponderPressure(highestResponderLoad),
      responderConcentration,
    }
  }, [cases, routingActions, interventions, outcomes, responders])

  const generatedBrief = `
TSINAXA CGI BOTTLENECK INTELLIGENCE BRIEF

Report Template:
${reportTemplate}

Bottleneck Focus:
${bottleneckFocus}

Operating Scope:
${operatingScope}

Bottleneck Posture:
${intelligence.bottleneckPosture.posture}

Routing Congestion:
${intelligence.routingCongestion}

Stabilization Delay:
${intelligence.stabilizationDelay}

Responder Concentration:
${intelligence.responderPressure}

Safeguarding Visibility:
${intelligence.safeguardingVisibility}

Executive Interpretation:
${intelligence.bottleneckPosture.interpretation}

Recommended Action:
${intelligence.bottleneckPosture.action}

Governance-Safe Meaning:
This bottleneck intelligence view preserves visibility over stabilization blockage, responder concentration, routing congestion, safeguarding escalation, and continuity fragmentation before operational survivability weakens.

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
  `.trim()

  return (
    <CGIGovernanceShell>
      <div style={styles.page}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • BOTTLENECK INTELLIGENCE</p>

          <h1 style={styles.title}>Continuity Bottleneck Intelligence</h1>

          <p style={styles.subtitle}>
            Executive visibility over stabilization blockage, routing congestion,
            responder concentration, safeguarding escalation, and continuity
            fragmentation.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.postureGrid}>
          <PostureCard
            label="Bottleneck Posture"
            value={intelligence.bottleneckPosture.posture}
          />

          <PostureCard
            label="Routing Congestion"
            value={intelligence.routingCongestion}
          />

          <PostureCard
            label="Stabilization Delay"
            value={intelligence.stabilizationDelay}
          />

          <PostureCard
            label="Responder Concentration"
            value={intelligence.responderPressure}
          />

          <PostureCard
            label="Safeguarding Visibility"
            value={intelligence.safeguardingVisibility}
          />
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Executive Interpretation</h2>

          <p style={styles.bodyText}>
            {intelligence.bottleneckPosture.interpretation}
          </p>

          <h3 style={styles.inlineHeading}>Recommended Action</h3>

          <p style={styles.bodyText}>{intelligence.bottleneckPosture.action}</p>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Bottleneck Brief Template</h2>

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

          <label style={styles.label}>
            Additional Operational Notes

            <textarea
              value={additionalNotes}
              onChange={(event) => setAdditionalNotes(event.target.value)}
              placeholder="Use governance-safe operational language only."
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
          <h2 style={styles.sectionTitle}>
            Responder Concentration Visibility
          </h2>

          <p style={styles.bodyText}>
            Visibility into continuity concentration, routing accumulation, and
            stabilization ownership pressure across responders.
          </p>

          <div style={styles.responderGrid}>
            {intelligence.responderConcentration.length === 0 && (
              <div style={styles.responderCard}>
                <p style={styles.responderName}>No responder concentration visible</p>
                <h3 style={styles.responderPosture}>RESPONDER LOAD CONTROLLED</h3>
                <p style={styles.responderText}>
                  No routing concentration is currently visible in the bottleneck
                  memory.
                </p>
              </div>
            )}

            {intelligence.responderConcentration.map((item) => (
              <div key={item.responderId} style={styles.responderCard}>
                <p style={styles.responderName}>{item.responderName}</p>

                <h3 style={styles.responderPosture}>{item.posture}</h3>

                <p style={styles.responderText}>{item.interpretation}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </CGIGovernanceShell>
  )
}

function interpretBottleneckStatus(status: string) {
  if (status === 'LOW_BOTTLENECK_PRESSURE') {
    return {
      posture: 'BOTTLENECK CONTAINED',
      interpretation:
        'Operational pathways appear stable with no visible continuity blockage threatening stabilization movement.',
      action:
        'Maintain routine continuity monitoring and preserve pathway visibility.',
    }
  }

  if (status === 'MODERATE_BOTTLENECK_PRESSURE') {
    return {
      posture: 'BOTTLENECK PRESSURE VISIBLE',
      interpretation:
        'Some stabilization pathways are slowing and require closer continuity visibility.',
      action:
        'Review pathway progression and monitor continuity accumulation.',
    }
  }

  if (status === 'HIGH_BOTTLENECK_PRESSURE') {
    return {
      posture: 'BOTTLENECK ESCALATION ACTIVE',
      interpretation:
        'Visible stabilization blockage is slowing continuity movement and increasing operational congestion.',
      action:
        'Redistribute continuity load and review unresolved pathway congestion.',
    }
  }

  return {
    posture: 'CRITICAL BOTTLENECK PRESSURE',
    interpretation:
      'Critical blockage pressure is threatening stabilization continuity and operational survivability.',
    action:
      'Escalate executive continuity review and rebalance stabilization infrastructure immediately.',
  }
}

function interpretRoutingCongestion(load: number) {
  if (load >= 4) return 'ROUTING CONGESTION CRITICAL'
  if (load >= 2) return 'ROUTING CONGESTION VISIBLE'
  return 'ROUTING FLOW CONTROLLED'
}

function interpretStabilizationDelay(stalled: number) {
  if (stalled >= 3) return 'STABILIZATION DELAY CRITICAL'
  if (stalled >= 1) return 'STABILIZATION DELAY ACTIVE'
  return 'STABILIZATION FLOW ACTIVE'
}

function interpretSafeguarding(flags: number) {
  if (flags >= 3) return 'SAFEGUARDING ESCALATION CRITICAL'
  if (flags >= 1) return 'SAFEGUARDING VISIBILITY ACTIVE'
  return 'SAFEGUARDING PRESSURE CONTAINED'
}

function interpretResponderPressure(load: number) {
  if (load >= 4) return 'RESPONDER CONCENTRATION CRITICAL'
  if (load >= 2) return 'RESPONDER CONCENTRATION VISIBLE'
  return 'RESPONDER LOAD CONTROLLED'
}

function PostureCard({
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
}: {
  label: string
  value: string
  setValue: (value: string) => void
  options: string[]
}) {
  const id = label.toLowerCase().replaceAll(' ', '-')

  return (
    <label style={styles.label} htmlFor={id}>
      {label}

      <select
        id={id}
        name={id}
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
    width: '100%',
  },
  hero: {
    marginBottom: '32px',
  },
  kicker: {
    color: '#67e8f9',
    fontWeight: 900,
    fontSize: '12px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '42px',
    lineHeight: 1.1,
    marginTop: '12px',
    marginBottom: '16px',
  },
  subtitle: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    maxWidth: '900px',
    fontSize: '18px',
  },
  message: {
    background: '#082f49',
    border: '1px solid #155e75',
    color: '#cffafe',
    padding: '18px',
    borderRadius: '18px',
    marginBottom: '24px',
    fontWeight: 700,
  },
  postureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
    marginBottom: '24px',
  },
  metricCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
  },
  metricLabel: {
    color: '#94a3b8',
    fontWeight: 700,
    marginBottom: '12px',
  },
  metricValue: {
    fontSize: '22px',
    lineHeight: 1.3,
    margin: 0,
  },
  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '28px',
    padding: '28px',
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '28px',
    marginBottom: '16px',
  },
  inlineHeading: {
    marginTop: '20px',
    marginBottom: '10px',
    color: '#67e8f9',
  },
  bodyText: {
    color: '#cbd5e1',
    lineHeight: 1.8,
  },
  label: {
    display: 'block',
    marginBottom: '18px',
    fontWeight: 700,
  },
  select: {
    width: '100%',
    marginTop: '8px',
    padding: '14px',
    borderRadius: '14px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    marginTop: '8px',
    padding: '14px',
    borderRadius: '14px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
    resize: 'vertical',
  },
  button: {
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    border: 'none',
    background: '#67e8f9',
    color: '#082f49',
    fontWeight: 900,
    cursor: 'pointer',
    marginTop: '12px',
  },
  briefBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '22px',
  },
  pre: {
    whiteSpace: 'pre-wrap',
    margin: 0,
    lineHeight: 1.8,
    fontFamily: 'inherit',
    color: '#e2e8f0',
  },
  responderGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
    marginTop: '20px',
  },
  responderCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '20px',
    padding: '20px',
  },
  responderName: {
    color: '#94a3b8',
    marginBottom: '10px',
    fontWeight: 700,
  },
  responderPosture: {
    margin: 0,
    marginBottom: '12px',
    fontSize: '18px',
  },
  responderText: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    margin: 0,
  },
}