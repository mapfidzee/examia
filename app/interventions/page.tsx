'use client'

import { useEffect, useState } from 'react'
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
  assigned_responder_id?: string | null
}

const INTERVENTION_TYPES = [
  'Learning continuity stabilization',
  'Low-data support intervention',
  'Responder-guided support session',
  'Institution-coordinated intervention',
  'Family/guardian coordination intervention',
  'Safeguarding-aware support pathway',
  'District escalation support',
  'Continuity follow-up intervention',
]

const INTERVENTION_MODES = [
  'Text-based support',
  'Audio-first support',
  'Live guided session',
  'File-supported intervention',
  'Institution-led coordination',
  'Responder-led coordination',
  'Hybrid low-bandwidth support',
]

const COMPLETION_STATUSES = [
  'COMPLETED',
  'PARTIALLY_COMPLETED',
  'INTERRUPTED',
  'FOLLOW_UP_REQUIRED',
  'ESCALATION_REQUIRED',
]

const CONTINUITY_RISKS = [
  'LOW',
  'MODERATE',
  'HIGH',
  'CRITICAL',
]

const SESSION_SUMMARIES = [
  'Beneficiary received structured support and immediate pathway is stable.',
  'Beneficiary received partial support; follow-up is needed.',
  'Support was attempted but access or continuity barriers remain.',
  'Responder completed intervention and recommends monitoring.',
  'Institution coordination is still required before stabilization.',
  'Safeguarding-aware escalation is recommended.',
  'District or regional visibility is recommended.',
]

export default function InterventionCompletionPage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])

  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [interventionType, setInterventionType] = useState('')
  const [interventionMode, setInterventionMode] = useState('')
  const [completionStatus, setCompletionStatus] = useState('')
  const [sessionSummary, setSessionSummary] = useState('')
  const [stabilizationScore, setStabilizationScore] = useState('3')
  const [continuityRisk, setContinuityRisk] = useState('MODERATE')
  const [responderNotes, setResponderNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCases()
  }, [])

  async function loadCases() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .in('case_status', [
        'ROUTED',
        'RESPONDER_ASSIGNED',
        'INTERVENTION_ACTIVE',
        'STABILIZING',
        'ESCALATED',
      ])
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setCases(data || [])
  }

  function selectedCase() {
    return cases.find((item) => item.id === selectedCaseId)
  }

  function interventionEvidence() {
    const caseItem = selectedCase()

    if (!caseItem) return ''

    return `
CONTROLLED INTERVENTION EVIDENCE RECORD

Beneficiary Case:
${caseItem.beneficiary_name} • ${caseItem.support_domain} • ${caseItem.severity_level}

Intervention Type:
${interventionType || 'Not specified'}

Intervention Mode:
${interventionMode || 'Not specified'}

Completion Status:
${completionStatus || 'Not specified'}

Structured Session Summary:
${sessionSummary || 'Not specified'}

Stabilization Score:
${stabilizationScore}/5

Continuity Risk After Intervention:
${continuityRisk}

Governance-Safe Responder Notes:
${responderNotes.trim() || 'No responder notes entered.'}

Governance Statement:
This intervention record documents support delivery, stabilization progress, continuity risk, and follow-up needs. It does not blame the beneficiary, family, responder, school, institution, or partner. It exists to support governed learning stabilization, safe coordination, and accountable intervention continuity.
    `.trim()
  }

  async function saveInterventionEvidence() {
    if (!selectedCaseId) {
      alert('Select a beneficiary case.')
      return
    }

    if (!interventionType || !interventionMode || !completionStatus || !sessionSummary) {
      alert('Complete the intervention type, mode, completion status, and session summary.')
      return
    }

    setLoading(true)
    setMessage('')

    const evidence = interventionEvidence()

    const { error: interventionError } = await supabase.from('case_interventions').insert({
      case_id: selectedCaseId,
      intervention_type: interventionType,
      intervention_summary: evidence,
    })

    if (interventionError) {
      alert(interventionError.message)
      setLoading(false)
      return
    }

    let nextStatus = 'STABILIZING'

    if (completionStatus === 'COMPLETED' && ['LOW', 'MODERATE'].includes(continuityRisk)) {
      nextStatus = 'STABILIZED'
    }

    if (
      completionStatus === 'ESCALATION_REQUIRED' ||
      continuityRisk === 'CRITICAL'
    ) {
      nextStatus = 'ESCALATED'
    }

    if (
      completionStatus === 'PARTIALLY_COMPLETED' ||
      completionStatus === 'FOLLOW_UP_REQUIRED' ||
      continuityRisk === 'HIGH'
    ) {
      nextStatus = 'STABILIZING'
    }

    const { error: caseError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: nextStatus,
        intervention_summary: evidence,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedCaseId)

    if (caseError) {
      alert(caseError.message)
      setLoading(false)
      return
    }

    await supabase.from('case_timeline').insert({
      case_id: selectedCaseId,
      event_type: 'INTERVENTION_EVIDENCE_RECORDED',
      event_summary: `Controlled intervention evidence recorded. Completion: ${completionStatus}. Continuity risk: ${continuityRisk}.`,
      actor: 'EXAMIA LIS Controlled Intervention Intelligence',
    })

    setSelectedCaseId('')
    setInterventionType('')
    setInterventionMode('')
    setCompletionStatus('')
    setSessionSummary('')
    setStabilizationScore('3')
    setContinuityRisk('MODERATE')
    setResponderNotes('')

    setMessage('Controlled intervention evidence saved and case lifecycle updated.')
    setLoading(false)

    await loadCases()
  }

  const activeInterventionCases = cases.length
  const criticalCases = cases.filter((item) => item.severity_level === 'CRITICAL').length
  const safeguardingCases = cases.filter((item) => item.safeguarding_flag).length
  const routedCases = cases.filter((item) =>
    ['ROUTED', 'RESPONDER_ASSIGNED', 'INTERVENTION_ACTIVE'].includes(item.case_status)
  ).length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA LIS • CONTROLLED INTERVENTION INTELLIGENCE</p>

          <h1 style={styles.title}>Intervention Completion Evidence</h1>

          <p style={styles.subtitle}>
            Govern actual support delivery by converting each intervention into a
            structured evidence record for stabilization tracking, continuity scoring,
            responder accountability, and safe institutional follow-up.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Cases Ready for Intervention" value={activeInterventionCases} />
          <Metric label="Routed / Assigned Cases" value={routedCases} />
          <Metric label="Critical Cases" value={criticalCases} />
          <Metric label="Safeguarding Flags" value={safeguardingCases} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Record Controlled Intervention</h2>

            <p style={styles.panelNote}>
              Use this after a responder, institution, NGO, district office, or support
              pathway has delivered an intervention. Record what happened in structured,
              governance-safe language.
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
                    ? 'No routed or active cases found'
                    : 'Select beneficiary case'}
                </option>

                {cases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.beneficiary_name} • {caseItem.support_domain} •{' '}
                    {caseItem.case_status}
                  </option>
                ))}
              </select>
            </label>

            <Select
              label="Intervention Type"
              value={interventionType}
              setValue={setInterventionType}
              options={['', ...INTERVENTION_TYPES]}
            />

            <Select
              label="Intervention Mode"
              value={interventionMode}
              setValue={setInterventionMode}
              options={['', ...INTERVENTION_MODES]}
            />

            <Select
              label="Completion Status"
              value={completionStatus}
              setValue={setCompletionStatus}
              options={['', ...COMPLETION_STATUSES]}
            />

            <Select
              label="Structured Session Summary"
              value={sessionSummary}
              setValue={setSessionSummary}
              options={['', ...SESSION_SUMMARIES]}
            />

            <label style={styles.label}>
              Stabilization Score: {stabilizationScore}/5
              <input
                type="range"
                min="1"
                max="5"
                value={stabilizationScore}
                onChange={(event) => setStabilizationScore(event.target.value)}
                style={styles.range}
              />
            </label>

            <Select
              label="Continuity Risk After Intervention"
              value={continuityRisk}
              setValue={setContinuityRisk}
              options={CONTINUITY_RISKS}
            />

            <label style={styles.label}>
              Governance-Safe Responder Notes
              <textarea
                value={responderNotes}
                onChange={(event) => setResponderNotes(event.target.value)}
                placeholder="Use operational facts only. Avoid unnecessary personal details."
                style={styles.textarea}
              />
            </label>

            <button
              onClick={saveInterventionEvidence}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading ? 'Saving Evidence...' : 'Save Intervention Evidence'}
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Generated Evidence Record</h2>

            <p style={styles.panelNote}>
              This is the structured record that will be saved to the intervention table
              and added to the case lifecycle.
            </p>

            <pre style={styles.summaryBox}>
              {interventionEvidence() ||
                'Select a beneficiary case to generate controlled intervention evidence.'}
            </pre>
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
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
    maxWidth: '1240px',
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
    maxWidth: '940px',
    lineHeight: 1.7,
    fontSize: '18px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
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
  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '20px',
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
  range: {
    width: '100%',
    marginTop: '14px',
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
}