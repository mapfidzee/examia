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

const SEVERITY_LEVELS = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']

const BENEFICIARY_LEVELS = [
  'Primary school beneficiary',
  'Secondary school beneficiary',
  'Exam-year beneficiary',
  'Out-of-school beneficiary',
  'Rural/low-access beneficiary',
  'Community-supported beneficiary',
  'Institution-referred beneficiary',
  'Other',
]

const SUPPORT_DOMAINS = [
  'Learning continuity stabilization',
  'Access and low-bandwidth support',
  'Responder coordination',
  'Institutional coordination',
  'Safeguarding visibility',
  'District or regional escalation',
  'Family/guardian support coordination',
  'Progression or exam-readiness continuity',
  'Other',
]

const STABILIZATION_SIGNALS = [
  'Support pathway disrupted',
  'Access barrier detected',
  'Low-bandwidth or connectivity barrier',
  'No verified responder currently available',
  'Institution coordination gap',
  'Repeated support breakdown',
  'Progression or continuity risk',
  'Family or guardian support need',
  'Language-sensitive support need',
  'Rural or remote access pressure',
  'Safeguarding visibility concern',
  'District escalation may be needed',
]

const INTERVENTION_TEMPLATES = [
  'Initial stabilization review completed',
  'Responder coordination initiated',
  'Institution coordination initiated',
  'Low-data support pathway recommended',
  'Safeguarding-aware handling recommended',
  'District escalation recommended',
  'Family or guardian coordination recommended',
  'Continuity follow-up recommended',
]

const OUTCOME_TEMPLATES = [
  'Beneficiary pathway stabilized',
  'Partial stabilization achieved',
  'Further responder support required',
  'Institution coordination still required',
  'Escalation required',
  'Case ready for closure',
]

export default function BeneficiaryCaseEnginePage() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])

  const [beneficiaryName, setBeneficiaryName] = useState('')
  const [beneficiaryLevel, setBeneficiaryLevel] = useState('')
  const [otherBeneficiaryLevel, setOtherBeneficiaryLevel] = useState('')
  const [supportDomain, setSupportDomain] = useState('')
  const [otherSupportDomain, setOtherSupportDomain] = useState('')
  const [severityLevel, setSeverityLevel] = useState('MODERATE')
  const [region, setRegion] = useState('')
  const [institutionName, setInstitutionName] = useState('')
  const [selectedSignals, setSelectedSignals] = useState<string[]>([])
  const [safeguardingFlag, setSafeguardingFlag] = useState(false)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCases()
  }, [])

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

  function finalBeneficiaryLevel() {
    return beneficiaryLevel === 'Other'
      ? otherBeneficiaryLevel.trim()
      : beneficiaryLevel
  }

  function finalSupportDomain() {
    return supportDomain === 'Other'
      ? otherSupportDomain.trim()
      : supportDomain
  }

  async function createCase() {
    if (!beneficiaryName.trim() || !finalSupportDomain()) {
      alert('Enter beneficiary name and stabilization domain.')
      return
    }

    setLoading(true)
    setMessage('')

    const { data, error } = await supabase
      .from('beneficiary_cases')
      .insert({
        beneficiary_name: beneficiaryName.trim(),
        beneficiary_level: finalBeneficiaryLevel(),
        support_domain: finalSupportDomain(),
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
    setOtherBeneficiaryLevel('')
    setSupportDomain('')
    setOtherSupportDomain('')
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

  async function applyInterventionSummary(caseItem: BeneficiaryCase, summary: string) {
    if (!summary) return

    const { error } = await supabase
      .from('beneficiary_cases')
      .update({
        intervention_summary: summary,
      })
      .eq('id', caseItem.id)

    if (error) {
      alert(error.message)
      return
    }

    await supabase.from('case_interventions').insert({
      case_id: caseItem.id,
      intervention_type: 'STANDARD_STABILIZATION_INTERVENTION',
      intervention_summary: summary,
    })

    await loadCases()
  }

  async function applyOutcomeSummary(caseItem: BeneficiaryCase, outcome: string) {
    if (!outcome) return

    const { error } = await supabase
      .from('beneficiary_cases')
      .update({
        outcome_summary: outcome,
      })
      .eq('id', caseItem.id)

    if (error) {
      alert(error.message)
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
      setSelectedSignals(selectedSignals.filter((item) => item !== signal))
    } else {
      setSelectedSignals([...selectedSignals, signal])
    }
  }

  const totalCases = cases.length
  const criticalCases = cases.filter((item) => item.severity_level === 'CRITICAL').length
  const escalatedCases = cases.filter((item) => item.case_status === 'ESCALATED').length
  const stabilizedCases = cases.filter((item) => item.case_status === 'STABILIZED').length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA LIS • BENEFICIARY CASE ENGINE</p>

          <h1 style={styles.title}>Beneficiary Stabilization Infrastructure</h1>

          <p style={styles.subtitle}>
            Governed case lifecycle management for beneficiary support breakdowns,
            access barriers, continuity risks, safeguarding visibility, responder
            coordination, escalation control, and institutional stabilization.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Total Cases" value={totalCases} />
          <Metric label="Critical Cases" value={criticalCases} />
          <Metric label="Escalated Cases" value={escalatedCases} />
          <Metric label="Stabilized Cases" value={stabilizedCases} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Create Beneficiary Stabilization Case</h2>

          <p style={styles.panelNote}>
            Use this page when a beneficiary needs structured support coordination.
            The case should describe the stabilization need, not blame the beneficiary,
            school, family, responder, or institution.
          </p>

          <div style={styles.grid}>
            <Input
              label="Beneficiary Name"
              value={beneficiaryName}
              setValue={setBeneficiaryName}
            />

            <Select
              label="Beneficiary Level / Population Group"
              value={beneficiaryLevel}
              setValue={setBeneficiaryLevel}
              options={['', ...BENEFICIARY_LEVELS]}
            />

            {beneficiaryLevel === 'Other' && (
              <Input
                label="Other Beneficiary Level"
                value={otherBeneficiaryLevel}
                setValue={setOtherBeneficiaryLevel}
                placeholder="Describe beneficiary group"
              />
            )}

            <Select
              label="Stabilization Domain"
              value={supportDomain}
              setValue={setSupportDomain}
              options={['', ...SUPPORT_DOMAINS]}
            />

            {supportDomain === 'Other' && (
              <Input
                label="Other Stabilization Domain"
                value={otherSupportDomain}
                setValue={setOtherSupportDomain}
                placeholder="Describe stabilization need"
              />
            )}

            <Input label="Region" value={region} setValue={setRegion} />

            <Input
              label="Institution / Referral Source"
              value={institutionName}
              setValue={setInstitutionName}
              placeholder="School, NGO, district office, community site"
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <Select
              label="Severity Level"
              value={severityLevel}
              setValue={setSeverityLevel}
              options={SEVERITY_LEVELS}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <label style={styles.label}>Stabilization Risk Signals</label>

            <p style={styles.panelNote}>
              Select the visible system signals affecting the beneficiary’s support
              pathway. These signals help routing, escalation, and responder coordination.
            </p>

            <div style={styles.signalGrid}>
              {STABILIZATION_SIGNALS.map((signal) => (
                <button
                  key={signal}
                  type="button"
                  onClick={() => toggleSignal(signal)}
                  style={{
                    ...styles.signalButton,
                    background: selectedSignals.includes(signal) ? '#67e8f9' : '#111827',
                    color: selectedSignals.includes(signal) ? '#082f49' : 'white',
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
              onChange={(event) => setSafeguardingFlag(event.target.checked)}
            />

            <span>Safeguarding visibility required</span>
          </div>

          <button onClick={createCase} disabled={loading} style={styles.primaryButton}>
            {loading ? 'Creating Case...' : 'Create Stabilization Case'}
          </button>
        </section>

        <section style={styles.caseSection}>
          <h2 style={styles.sectionTitle}>Active Beneficiary Cases</h2>

          <div style={styles.caseList}>
            {cases.map((caseItem) => (
              <article key={caseItem.id} style={styles.caseCard}>
                <div style={styles.caseHeader}>
                  <div>
                    <h3 style={styles.caseName}>{caseItem.beneficiary_name}</h3>
                    <p style={styles.caseDomain}>{caseItem.support_domain}</p>
                  </div>

                  <span style={severityBadge(caseItem.severity_level)}>
                    {caseItem.severity_level}
                  </span>
                </div>

                <div style={styles.infoGrid}>
                  <Info label="Lifecycle" value={caseItem.case_status} />
                  <Info
                    label="Beneficiary Level"
                    value={caseItem.beneficiary_level || 'Not provided'}
                  />
                  <Info label="Region" value={caseItem.region || 'Not provided'} />
                  <Info
                    label="Institution / Referral"
                    value={caseItem.institution_name || 'Not provided'}
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
                      onClick={() => changeCaseStatus(caseItem, status)}
                      style={styles.lifecycleButton}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div style={styles.dropdownSection}>
                  <label style={styles.label}>Structured Stabilization Action</label>

                  <select
                    onChange={(event) =>
                      applyInterventionSummary(caseItem, event.target.value)
                    }
                    style={styles.select}
                    value=""
                  >
                    <option value="">Select stabilization action</option>

                    {INTERVENTION_TEMPLATES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.dropdownSection}>
                  <label style={styles.label}>Structured Outcome Summary</label>

                  <select
                    onChange={(event) =>
                      applyOutcomeSummary(caseItem, event.target.value)
                    }
                    style={styles.select}
                    value=""
                  >
                    <option value="">Select outcome summary</option>

                    {OUTCOME_TEMPLATES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {caseItem.intervention_summary && (
                  <div style={styles.summaryBox}>
                    <strong>Stabilization Action:</strong> {caseItem.intervention_summary}
                  </div>
                )}

                {caseItem.outcome_summary && (
                  <div style={styles.summaryBox}>
                    <strong>Outcome:</strong> {caseItem.outcome_summary}
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <h2 style={styles.metricValue}>{value}</h2>
    </div>
  )
}

function Input({ label, value, setValue, placeholder = '' }: any) {
  return (
    <label style={styles.label}>
      {label}
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </label>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoBox}>
      <p style={styles.infoLabel}>{label}</p>
      <p style={styles.infoValue}>{value}</p>
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
    fontSize: 'clamp(34px, 6vw, 56px)',
    lineHeight: 1.05,
    margin: '12px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '920px',
    lineHeight: 1.7,
    fontSize: '18px',
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
    marginBottom: '12px',
  },
  panelNote: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    marginBottom: '18px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
    marginTop: '8px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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