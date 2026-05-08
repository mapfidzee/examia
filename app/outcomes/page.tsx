'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  beneficiary_name: string
  beneficiary_level: string | null
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  intervention_summary: string | null
  outcome_summary: string | null
}

const OUTCOME_TEMPLATES = [
  'Stabilization achieved and continuity pathway remains active.',
  'Partial stabilization achieved but continued follow-up is required.',
  'Intervention engagement improved but instability indicators remain.',
  'Escalation risk reduced after intervention.',
  'Safeguarding-aware stabilization remains necessary.',
  'Institutional coordination support remains required.',
  'Continuity instability remains visible after intervention.',
]

const OUTCOME_STATUSES = [
  'STABILIZED',
  'PARTIAL_STABILIZATION',
  'FOLLOW_UP_REQUIRED',
  'CONTINUITY_RISK_ACTIVE',
  'ESCALATION_REQUIRED',
]

const EFFECTIVENESS_LEVELS = [
  'LOW',
  'MODERATE',
  'HIGH',
  'VERY_HIGH',
]

const CONTINUITY_OUTLOOKS = [
  'STABLE',
  'MONITOR',
  'AT_RISK',
  'UNSTABLE',
]

const GOVERNANCE_NOTES = [
  'Beneficiary continuity appears stable after intervention.',
  'Continued monitoring is recommended.',
  'Institution coordination remains active.',
  'Responder follow-up is recommended.',
  'Safeguarding-aware handling remains advised.',
  'Regional visibility may still be required.',
  'Escalation monitoring remains active.',
]

const OUTCOME_ACTIONS = [
  'Maintain stabilization monitoring.',
  'Schedule continuity follow-up.',
  'Increase responder engagement frequency.',
  'Escalate for district coordination review.',
  'Strengthen safeguarding-aware support.',
  'Review intervention quality and continuity barriers.',
]

export default function OutcomesPage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])

  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [outcomeTemplate, setOutcomeTemplate] = useState('')
  const [outcomeStatus, setOutcomeStatus] = useState('PARTIAL_STABILIZATION')
  const [effectivenessLevel, setEffectivenessLevel] = useState('MODERATE')
  const [continuityOutlook, setContinuityOutlook] = useState('MONITOR')
  const [governanceNote, setGovernanceNote] = useState('')
  const [recommendedAction, setRecommendedAction] = useState('')
  const [additionalOperationalNotes, setAdditionalOperationalNotes] = useState('')

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCases()
  }, [])

  async function loadCases() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .in('case_status', [
        'INTERVENTION_ACTIVE',
        'STABILIZING',
        'ESCALATED',
        'RESPONDER_ASSIGNED',
      ])
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setCases(data || [])
  }

  const selectedCase = useMemo(() => {
    return cases.find((item) => item.id === selectedCaseId)
  }, [cases, selectedCaseId])

  function outcomeRecord() {
    if (!selectedCase) return ''

    return `
EXAMIA LIS STRUCTURED OUTCOME RECORD

Beneficiary Case:
${selectedCase.beneficiary_name} • ${selectedCase.support_domain}

Current Lifecycle:
${selectedCase.case_status}

Outcome Status:
${outcomeStatus}

Structured Outcome Template:
${outcomeTemplate || 'Not selected'}

Intervention Effectiveness:
${effectivenessLevel}

Continuity Outlook:
${continuityOutlook}

Governance-Safe Outcome Note:
${governanceNote || 'No governance-safe note selected'}

Recommended Operational Action:
${recommendedAction || 'No action selected'}

Additional Operational Notes:
${additionalOperationalNotes.trim() || 'No additional operational notes entered.'}

Governance Interpretation:
This outcome record summarizes stabilization progress, continuity outlook, intervention effectiveness, and operational follow-up requirements. It exists to support safe stabilization governance and coordinated continuity management without assigning blame to beneficiaries, responders, institutions, or families.
    `.trim()
  }

  async function saveOutcomeRecord() {
    if (!selectedCaseId) {
      alert('Select a beneficiary case.')
      return
    }

    if (
      !outcomeTemplate ||
      !outcomeStatus ||
      !effectivenessLevel ||
      !continuityOutlook
    ) {
      alert('Complete all structured outcome selections.')
      return
    }

    setLoading(true)
    setMessage('')

    const summary = outcomeRecord()

    const { error: outcomeError } = await supabase
      .from('case_outcomes')
      .insert({
        case_id: selectedCaseId,
        outcome_status: outcomeStatus,
        outcome_summary: summary,
      })

    if (outcomeError) {
      alert(outcomeError.message)
      setLoading(false)
      return
    }

    let nextCaseStatus = 'STABILIZING'

    if (
      outcomeStatus === 'STABILIZED' &&
      ['HIGH', 'VERY_HIGH'].includes(effectivenessLevel) &&
      continuityOutlook === 'STABLE'
    ) {
      nextCaseStatus = 'STABILIZED'
    }

    if (
      outcomeStatus === 'ESCALATION_REQUIRED' ||
      continuityOutlook === 'UNSTABLE'
    ) {
      nextCaseStatus = 'ESCALATED'
    }

    const { error: updateError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: nextCaseStatus,
        outcome_summary: summary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedCaseId)

    if (updateError) {
      alert(updateError.message)
      setLoading(false)
      return
    }

    await supabase.from('case_timeline').insert({
      case_id: selectedCaseId,
      event_type: 'OUTCOME_RECORDED',
      event_summary: `Structured outcome recorded. Outcome status: ${outcomeStatus}. Continuity outlook: ${continuityOutlook}.`,
      actor: 'EXAMIA LIS Outcome Intelligence',
    })

    setSelectedCaseId('')
    setOutcomeTemplate('')
    setOutcomeStatus('PARTIAL_STABILIZATION')
    setEffectivenessLevel('MODERATE')
    setContinuityOutlook('MONITOR')
    setGovernanceNote('')
    setRecommendedAction('')
    setAdditionalOperationalNotes('')

    setMessage('Structured outcome intelligence saved successfully.')
    setLoading(false)

    await loadCases()
  }

  const stabilizedCases = cases.filter(
    (item) => item.case_status === 'STABILIZED'
  ).length

  const escalatedCases = cases.filter(
    (item) => item.case_status === 'ESCALATED'
  ).length

  const safeguardingCases = cases.filter(
    (item) => item.safeguarding_flag
  ).length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA LIS • OUTCOME INTELLIGENCE</p>

          <h1 style={styles.title}>
            Structured Stabilization Outcome Infrastructure
          </h1>

          <p style={styles.subtitle}>
            Measure intervention effectiveness, stabilization outcomes,
            continuity outlook, escalation visibility, and governance-safe
            operational follow-up using standardized outcome intelligence.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.metricsGrid}>
          <Metric label="Cases Awaiting Outcome Review" value={cases.length} />
          <Metric label="Stabilized Cases" value={stabilizedCases} />
          <Metric label="Escalated Cases" value={escalatedCases} />
          <Metric label="Safeguarding Visibility" value={safeguardingCases} />
        </section>

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Structured Outcome Recording
            </h2>

            <p style={styles.panelNote}>
              Use dropdown templates to keep stabilization reporting
              governance-safe, nationally consistent, and operationally measurable.
            </p>

            <label style={styles.label}>
              Beneficiary Case
              <select
                value={selectedCaseId}
                onChange={(event) => setSelectedCaseId(event.target.value)}
                style={styles.select}
              >
                <option value="">
                  {cases.length === 0
                    ? 'No intervention-stage cases found'
                    : 'Select beneficiary case'}
                </option>

                {cases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.beneficiary_name} • {item.support_domain} •{' '}
                    {item.case_status}
                  </option>
                ))}
              </select>
            </label>

            <Select
              label="Structured Outcome Template"
              value={outcomeTemplate}
              setValue={setOutcomeTemplate}
              options={['', ...OUTCOME_TEMPLATES]}
            />

            <Select
              label="Outcome Status"
              value={outcomeStatus}
              setValue={setOutcomeStatus}
              options={OUTCOME_STATUSES}
            />

            <Select
              label="Intervention Effectiveness"
              value={effectivenessLevel}
              setValue={setEffectivenessLevel}
              options={EFFECTIVENESS_LEVELS}
            />

            <Select
              label="Continuity Outlook"
              value={continuityOutlook}
              setValue={setContinuityOutlook}
              options={CONTINUITY_OUTLOOKS}
            />

            <Select
              label="Governance-Safe Outcome Note"
              value={governanceNote}
              setValue={setGovernanceNote}
              options={['', ...GOVERNANCE_NOTES]}
            />

            <Select
              label="Recommended Operational Action"
              value={recommendedAction}
              setValue={setRecommendedAction}
              options={['', ...OUTCOME_ACTIONS]}
            />

            <label style={styles.label}>
              Optional Additional Operational Notes
              <textarea
                value={additionalOperationalNotes}
                onChange={(event) =>
                  setAdditionalOperationalNotes(event.target.value)
                }
                placeholder="Use operational language only. Avoid blame or unnecessary personal details."
                style={styles.textarea}
              />
            </label>

            <button
              onClick={saveOutcomeRecord}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading
                ? 'Saving Outcome...'
                : 'Save Structured Outcome Intelligence'}
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Generated Outcome Intelligence
            </h2>

            <p style={styles.panelNote}>
              Structured outcome reporting keeps stabilization intelligence
              measurable and governance-safe across districts, NGOs,
              ministries, and responders.
            </p>

            <pre style={styles.summaryBox}>
              {outcomeRecord() ||
                'Select a beneficiary case to generate structured outcome intelligence.'}
            </pre>
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
  value: number
}) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>

      <h2 style={styles.metricValue}>{value}</h2>
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
          <option key={option || 'blank'} value={option}>
            {option || 'Select option'}
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
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
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
    gridTemplateColumns:
      'repeat(auto-fit, minmax(340px, 1fr))',
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
    minHeight: '540px',
  },
}