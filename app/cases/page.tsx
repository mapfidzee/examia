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
  instability_signals: string[] | null
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  intervention_summary: string | null
  outcome_summary: string | null
  created_at?: string
}

const CASE_STATUSES = [
  'NEED_DETECTED',
  'UNDER_ASSESSMENT',
  'ROUTED',
  'RESPONDER_ASSIGNED',
  'INTERVENTION_ACTIVE',
  'STABILIZING',
  'STABILIZED',
  'ESCALATED',
  'CLOSED',
  'REOPENED',
]

const SEVERITY_LEVELS = [
  'LOW',
  'MODERATE',
  'HIGH',
  'CRITICAL',
]

const INSTABILITY_SIGNALS = [
  'Repeated comprehension breakdown',
  'Exam risk detected',
  'Extended learning gap',
  'Attendance instability',
  'Engagement instability',
  'Repeated assignment failure',
  'Low confidence indicators',
  'Connectivity instability',
  'Safeguarding concern',
  'Language barrier',
  'Chronic intervention dependency',
]

const INTERVENTION_TEMPLATES = [
  'Concept clarification completed',
  'Exam preparation intervention initiated',
  'Reading stabilization initiated',
  'Connectivity barriers identified',
  'Follow-up intervention recommended',
  'Assignment recovery intervention initiated',
  'Safeguarding escalation required',
]

const OUTCOME_TEMPLATES = [
  'Learner stabilized',
  'Partial stabilization achieved',
  'Intervention incomplete',
  'Repeated instability detected',
  'Case escalated for continued support',
]

export default function BeneficiaryCaseEnginePage() {
  const [mounted, setMounted] = useState(false)

  const [cases, setCases] = useState<BeneficiaryCase[]>([])

  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [beneficiaryLevel, setBeneficiaryLevel] = useState('')
  const [supportDomain, setSupportDomain] = useState('')
  const [severityLevel, setSeverityLevel] = useState('MODERATE')
  const [region, setRegion] = useState('')
  const [institutionName, setInstitutionName] = useState('')
  const [selectedSignals, setSelectedSignals] = useState<string[]>([])
  const [safeguardingFlag, setSafeguardingFlag] = useState(false)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMounted(true)
    loadCases()
  }, [])

  if (!mounted) return null

  async function loadCases() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setCases(data || [])
  }

  async function createCase() {
    if (!beneficiaryName.trim() || !supportDomain.trim()) {
      alert('Enter beneficiary name and support domain.')
      return
    }

    setLoading(true)
    setMessage('')

    const { data, error } = await supabase
      .from('beneficiary_cases')
      .insert({
        beneficiary_name: beneficiaryName.trim(),
        beneficiary_level: beneficiaryLevel.trim(),
        support_domain: supportDomain.trim(),
        severity_level: severityLevel,
        instability_signals: selectedSignals,
        region: region.trim(),
        institution_name: institutionName.trim(),
        safeguarding_flag: safeguardingFlag,
        case_status: 'NEED_DETECTED',
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      alert(error.message)
      setLoading(false)
      return
    }

    await supabase.from('case_timeline').insert({
      case_id: data.id,
      event_type: 'CASE_CREATED',
      event_summary: 'Beneficiary stabilization case created',
    })

    setBeneficiaryName('')
    setBeneficiaryLevel('')
    setSupportDomain('')
    setSeverityLevel('MODERATE')
    setRegion('')
    setInstitutionName('')
    setSelectedSignals([])
    setSafeguardingFlag(false)

    setMessage('Beneficiary stabilization case created.')

    setLoading(false)

    await loadCases()
  }

  async function changeCaseStatus(caseItem: BeneficiaryCase, nextStatus: string) {
    const { error } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseItem.id)

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    await supabase.from('case_timeline').insert({
      case_id: caseItem.id,
      event_type: `STATUS_${nextStatus}`,
      event_summary: `Case moved to ${nextStatus}`,
    })

    await loadCases()
  }

  async function applyInterventionSummary(
    caseItem: BeneficiaryCase,
    summary: string
  ) {
    const { error } = await supabase
      .from('beneficiary_cases')
      .update({
        intervention_summary: summary,
      })
      .eq('id', caseItem.id)

    if (error) {
      console.error(error)
      return
    }

    await supabase.from('case_interventions').insert({
      case_id: caseItem.id,
      intervention_type: 'STANDARD_INTERVENTION',
      intervention_summary: summary,
    })

    await loadCases()
  }

  async function applyOutcomeSummary(
    caseItem: BeneficiaryCase,
    outcome: string
  ) {
    const { error } = await supabase
      .from('beneficiary_cases')
      .update({
        outcome_summary: outcome,
      })
      .eq('id', caseItem.id)

    if (error) {
      console.error(error)
      return
    }

    await supabase.from('case_outcomes').insert({
      case_id: caseItem.id,
      outcome_status: outcome,
      outcome_summary: outcome,
    })

    await loadCases()
  }

  function toggleSignal(signal: string) {
    if (selectedSignals.includes(signal)) {
      setSelectedSignals(selectedSignals.filter((s) => s !== signal))
    } else {
      setSelectedSignals([...selectedSignals, signal])
    }
  }

  const totalCases = cases.length
  const criticalCases = cases.filter(
    (c) => c.severity_level === 'CRITICAL'
  ).length

  const escalatedCases = cases.filter(
    (c) => c.case_status === 'ESCALATED'
  ).length

  const stabilizedCases = cases.filter(
    (c) => c.case_status === 'STABILIZED'
  ).length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>
            EXAMIA LIS • BENEFICIARY CASE ENGINE
          </p>

          <h1 style={styles.title}>
            Learning Stabilization Coordination Infrastructure
          </h1>

          <p style={styles.subtitle}>
            Governed beneficiary stabilization lifecycle management for
            learning distress detection, intervention routing,
            stabilization tracking, safeguarding visibility,
            escalation control, and institutional coordination.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Total Cases" value={totalCases} />
          <Metric label="Critical Cases" value={criticalCases} />
          <Metric label="Escalated Cases" value={escalatedCases} />
          <Metric label="Stabilized Cases" value={stabilizedCases} />
        </section>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        <section style={styles.formCard}>
          <h2 style={styles.sectionTitle}>
            Create Beneficiary Stabilization Case
          </h2>

          <div style={styles.grid}>
            <Input
              label="Beneficiary Name"
              value={beneficiaryName}
              setValue={setBeneficiaryName}
            />

            <Input
              label="Learner Level"
              value={beneficiaryLevel}
              setValue={setBeneficiaryLevel}
              placeholder="Grade 7, O Level, A Level"
            />

            <Input
              label="Support Domain"
              value={supportDomain}
              setValue={setSupportDomain}
              placeholder="Math recovery, Reading stabilization"
            />

            <Input
              label="Region"
              value={region}
              setValue={setRegion}
            />

            <Input
              label="Institution"
              value={institutionName}
              setValue={setInstitutionName}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <label style={styles.label}>Severity Level</label>

            <select
              value={severityLevel}
              onChange={(e) => setSeverityLevel(e.target.value)}
              style={styles.select}
            >
              {SEVERITY_LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '24px' }}>
            <label style={styles.label}>
              Learning Instability Signals
            </label>

            <div style={styles.signalGrid}>
              {INSTABILITY_SIGNALS.map((signal) => (
                <button
                  key={signal}
                  type="button"
                  onClick={() => toggleSignal(signal)}
                  style={{
                    ...styles.signalButton,
                    background: selectedSignals.includes(signal)
                      ? '#67e8f9'
                      : '#111827',
                    color: selectedSignals.includes(signal)
                      ? '#082f49'
                      : 'white',
                  }}
                >
                  {signal}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={safeguardingFlag}
              onChange={(e) => setSafeguardingFlag(e.target.checked)}
            />

            <span>
              Safeguarding concern present
            </span>
          </div>

          <button
            onClick={createCase}
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading
              ? 'Creating Case...'
              : 'Create Stabilization Case'}
          </button>
        </section>

        <section style={styles.caseSection}>
          <h2 style={styles.sectionTitle}>
            Active Beneficiary Cases
          </h2>

          <div style={styles.caseList}>
            {cases.map((caseItem) => (
              <article key={caseItem.id} style={styles.caseCard}>
                <div style={styles.caseHeader}>
                  <div>
                    <h3 style={styles.caseName}>
                      {caseItem.beneficiary_name}
                    </h3>

                    <p style={styles.caseDomain}>
                      {caseItem.support_domain}
                    </p>
                  </div>

                  <span style={severityBadge(caseItem.severity_level)}>
                    {caseItem.severity_level}
                  </span>
                </div>

                <div style={styles.infoGrid}>
                  <Info
                    label="Lifecycle"
                    value={caseItem.case_status}
                  />

                  <Info
                    label="Level"
                    value={
                      caseItem.beneficiary_level || 'Not provided'
                    }
                  />

                  <Info
                    label="Region"
                    value={caseItem.region || 'Not provided'}
                  />

                  <Info
                    label="Institution"
                    value={
                      caseItem.institution_name || 'Not provided'
                    }
                  />
                </div>

                <div style={styles.signalContainer}>
                  {(caseItem.instability_signals || []).map((signal) => (
                    <span key={signal} style={styles.signalBadge}>
                      {signal}
                    </span>
                  ))}
                </div>

                <div style={styles.lifecycleGrid}>
                  {CASE_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        changeCaseStatus(caseItem, status)
                      }
                      style={styles.lifecycleButton}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div style={styles.dropdownSection}>
                  <label style={styles.label}>
                    Structured Intervention Summary
                  </label>

                  <select
                    onChange={(e) =>
                      applyInterventionSummary(
                        caseItem,
                        e.target.value
                      )
                    }
                    style={styles.select}
                    value=""
                  >
                    <option value="">
                      Select intervention summary
                    </option>

                    {INTERVENTION_TEMPLATES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.dropdownSection}>
                  <label style={styles.label}>
                    Structured Outcome Summary
                  </label>

                  <select
                    onChange={(e) =>
                      applyOutcomeSummary(
                        caseItem,
                        e.target.value
                      )
                    }
                    style={styles.select}
                    value=""
                  >
                    <option value="">
                      Select outcome summary
                    </option>

                    {OUTCOME_TEMPLATES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {caseItem.intervention_summary && (
                  <div style={styles.summaryBox}>
                    <strong>Intervention:</strong>{' '}
                    {caseItem.intervention_summary}
                  </div>
                )}

                {caseItem.outcome_summary && (
                  <div style={styles.summaryBox}>
                    <strong>Outcome:</strong>{' '}
                    {caseItem.outcome_summary}
                  </div>
                )}
              </article>
            ))}
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
      <p style={styles.metricLabel}>
        {label}
      </p>

      <h2 style={styles.metricValue}>
        {value}
      </h2>
    </div>
  )
}

function Input({
  label,
  value,
  setValue,
  placeholder = '',
}: any) {
  return (
    <label style={styles.label}>
      {label}

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </label>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.infoBox}>
      <p style={styles.infoLabel}>
        {label}
      </p>

      <p style={styles.infoValue}>
        {value}
      </p>
    </div>
  )
}

function severityBadge(level: string): CSSProperties {
  if (level === 'CRITICAL') {
    return {
      background: '#7f1d1d',
      color: '#fecaca',
      padding: '8px 12px',
      borderRadius: '999px',
      fontWeight: 800,
    }
  }

  if (level === 'HIGH') {
    return {
      background: '#7c2d12',
      color: '#fdba74',
      padding: '8px 12px',
      borderRadius: '999px',
      fontWeight: 800,
    }
  }

  return {
    background: '#082f49',
    color: '#67e8f9',
    padding: '8px 12px',
    borderRadius: '999px',
    fontWeight: 800,
  }
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
    letterSpacing: '2px',
    fontSize: '12px',
  },

  title: {
    fontSize: '56px',
    lineHeight: 1.05,
    margin: '12px 0',
  },

  subtitle: {
    color: '#cbd5e1',
    maxWidth: '900px',
    lineHeight: 1.7,
    fontSize: '18px',
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
    fontSize: '42px',
    marginTop: '8px',
  },

  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '20px',
  },

  formCard: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '32px',
  },

  sectionTitle: {
    fontSize: '28px',
    marginBottom: '18px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },

  label: {
    display: 'block',
    fontWeight: 800,
    marginBottom: '10px',
  },

  input: {
    width: '100%',
    marginTop: '8px',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #334155',
    background: '#111827',
    color: 'white',
  },

  select: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
  },

  signalGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '12px',
  },

  signalButton: {
    border: '1px solid #334155',
    borderRadius: '999px',
    padding: '10px 14px',
    cursor: 'pointer',
    fontWeight: 700,
  },

  checkboxRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    marginBottom: '24px',
    alignItems: 'center',
  },

  primaryButton: {
    background: '#67e8f9',
    color: '#082f49',
    border: 'none',
    borderRadius: '14px',
    padding: '16px 20px',
    fontWeight: 900,
    cursor: 'pointer',
    width: '100%',
    fontSize: '16px',
  },

  caseSection: {
    marginBottom: '40px',
  },

  caseList: {
    display: 'grid',
    gap: '18px',
  },

  caseCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '20px',
  },

  caseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },

  caseName: {
    fontSize: '24px',
    margin: 0,
  },

  caseDomain: {
    color: '#93c5fd',
    marginTop: '6px',
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginTop: '18px',
  },

  infoBox: {
    background: '#020617',
    borderRadius: '14px',
    padding: '12px',
    border: '1px solid #1e293b',
  },

  infoLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
  },

  infoValue: {
    marginTop: '6px',
    lineHeight: 1.5,
  },

  signalContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '18px',
  },

  signalBadge: {
    background: '#082f49',
    color: '#67e8f9',
    borderRadius: '999px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 800,
  },

  lifecycleGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px',
    marginTop: '22px',
  },

  lifecycleButton: {
    background: '#111827',
    border: '1px solid #334155',
    color: 'white',
    padding: '12px',
    borderRadius: '12px',
    fontWeight: 800,
    cursor: 'pointer',
  },

  dropdownSection: {
    marginTop: '20px',
  },

  summaryBox: {
    marginTop: '18px',
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '14px',
    padding: '14px',
    lineHeight: 1.6,
  },
}