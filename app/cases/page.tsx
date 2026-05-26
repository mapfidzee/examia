'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type InstabilityCase = {
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
  'UNDER_REVIEW',
  'WATCH_ONLY',
  'ACCEPTED_AS_CASE',
  'ROUTED',
  'ACTION_ACTIVE',
  'IMPROVING',
  'HOLDING',
  'STABLE',
  'ESCALATED',
  'REOPENED',
  'ARCHIVED',
]

const DIFFICULTY_LEVELS = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']

const PRESSURE_TYPES = [
  'FLOW',
  'COVERAGE',
  'COORDINATION',
  'OWNERSHIP',
  'EVIDENCE',
  'RECOVERY',
  'RELIABILITY',
]

const LOCATION_OPTIONS = [
  'SITE_A',
  'SITE_B',
  'SITE_C',
  'REGION_NORTH',
  'REGION_SOUTH',
  'UNIT_1',
  'UNIT_2',
  'OPERATIONS_DESK',
  'CROSS_SITE',
  'OTHER_LOCATION',
]

const AFFECTED_AREAS = [
  'ROUTING',
  'STAFFING',
  'HANDOFF',
  'BACKLOG',
  'RECOVERY',
  'COORDINATION',
  'EVIDENCE',
  'OWNERSHIP',
  'COMMAND_REVIEW',
  'SITE_OPERATIONS',
  'CROSS_SITE_OPERATIONS',
  'OTHER_AREA',
]

const VISIBLE_SIGNALS = [
  'ROUTING_DELAY',
  'BACKLOG_GROWING',
  'HANDOFF_DELAY',
  'OWNERSHIP_UNCLEAR',
  'ACTION_STALLED',
  'RECOVERY_NOT_HOLDING',
  'ISSUE_REPEATED',
  'EVIDENCE_MISSING',
  'ESCALATION_DELAYED',
  'CROSS_TEAM_CONFUSION',
  'RESOURCE_GAP',
  'OTHER_VISIBLE_SIGNAL',
]

const STABILIZATION_ACTIONS = [
  'Ownership review started',
  'Routing review started',
  'Backlog review started',
  'Handoff review started',
  'Evidence check requested',
  'Recovery watch started',
  'Cross-team coordination requested',
  'Command review recommended',
]

const OUTCOME_OPTIONS = [
  'Situation stabilized',
  'Improvement holding',
  'Partial improvement only',
  'Further action required',
  'Escalation required',
  'Issue returned after improvement',
  'Ready for archive',
]

export default function CasesPage() {
  return (
    <CGIGovernanceShell>
      <CasesContent />
    </CGIGovernanceShell>
  )
}

function CasesContent() {
  const [cases, setCases] = useState<InstabilityCase[]>([])
  const [caseTitle, setCaseTitle] = useState('')
  const [location, setLocation] = useState('SITE_A')
  const [pressureType, setPressureType] = useState('FLOW')
  const [affectedArea, setAffectedArea] = useState('ROUTING')
  const [difficultyLevel, setDifficultyLevel] = useState('MODERATE')
  const [sourceArea, setSourceArea] = useState('OPERATIONS_DESK')
  const [currentOwner, setCurrentOwner] = useState('UNCLEAR')
  const [selectedSignals, setSelectedSignals] = useState<string[]>([])
  const [commandVisibility, setCommandVisibility] = useState(false)
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

  async function createCase() {
    if (!caseTitle.trim()) {
      alert('Enter a short case title.')
      return
    }

    setLoading(true)
    setMessage('')

    const { data, error } = await supabase
      .from('beneficiary_cases')
      .insert({
        beneficiary_name: caseTitle.trim(),
        beneficiary_level: location,
        support_domain: pressureType,
        severity_level: difficultyLevel,
        instability_signals: selectedSignals,
        region: sourceArea,
        institution_name: currentOwner,
        safeguarding_flag: commandVisibility,
        case_status: 'UNDER_REVIEW',
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
      event_summary: 'Visible instability accepted into case review',
    })

    setCaseTitle('')
    setLocation('SITE_A')
    setPressureType('FLOW')
    setAffectedArea('ROUTING')
    setDifficultyLevel('MODERATE')
    setSourceArea('OPERATIONS_DESK')
    setCurrentOwner('UNCLEAR')
    setSelectedSignals([])
    setCommandVisibility(false)
    setMessage('Instability case created for review.')
    setLoading(false)

    await loadCases()
  }

  async function changeCaseStatus(caseItem: InstabilityCase, nextStatus: string) {
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

  async function applyStabilizationAction(
    caseItem: InstabilityCase,
    summary: string
  ) {
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
      intervention_type: 'CGI_STABILIZATION_ACTION',
      intervention_summary: summary,
    })

    await loadCases()
  }

  async function applyOutcomeSummary(caseItem: InstabilityCase, outcome: string) {
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
  const highOrCriticalCases = cases.filter(
    (item) => item.severity_level === 'HIGH' || item.severity_level === 'CRITICAL'
  ).length
  const escalatedCases = cases.filter((item) => item.case_status === 'ESCALATED').length
  const stableCases = cases.filter(
    (item) => item.case_status === 'STABLE' || item.case_status === 'ARCHIVED'
  ).length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • CASE GOVERNANCE</p>

          <h1 style={styles.title}>Active Instability Cases</h1>

          <p style={styles.subtitle}>
            Use this page to govern visible instability that has moved beyond
            simple intake and now requires review, ownership, routing, action,
            evidence, or recovery follow-up.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Total Cases" value={totalCases} />
          <Metric label="High / Critical" value={highOrCriticalCases} />
          <Metric label="Escalated" value={escalatedCases} />
          <Metric label="Stable / Archived" value={stableCases} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.formCard}>
          <p style={styles.sectionKicker}>Create case</p>

          <h2 style={styles.sectionTitle}>Accept instability into review</h2>

          <p style={styles.panelNote}>
            A case is visible instability under active review. It should remain
            open until the situation is routed, action is visible, evidence is
            checked, and stability is no longer uncertain.
          </p>

          <div style={styles.grid}>
            <Input
              label="Case Title"
              value={caseTitle}
              setValue={setCaseTitle}
              placeholder="Example: Repeated routing delay on Site A"
            />

            <Select
              label="Location"
              value={location}
              setValue={setLocation}
              options={LOCATION_OPTIONS}
            />

            <Select
              label="Operational Pressure"
              value={pressureType}
              setValue={setPressureType}
              options={PRESSURE_TYPES}
            />

            <Select
              label="Affected Area"
              value={affectedArea}
              setValue={setAffectedArea}
              options={AFFECTED_AREAS}
            />

            <Select
              label="Difficulty Level"
              value={difficultyLevel}
              setValue={setDifficultyLevel}
              options={DIFFICULTY_LEVELS}
            />

            <Select
              label="Source Area"
              value={sourceArea}
              setValue={setSourceArea}
              options={LOCATION_OPTIONS}
            />

            <Select
              label="Current Ownership"
              value={currentOwner}
              setValue={setCurrentOwner}
              options={['CLEAR', 'UNCLEAR', 'MISSING', 'TRANSFERRED', 'CONTESTED']}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <label style={styles.label}>Visible Signals</label>

            <p style={styles.panelNote}>
              Select the governed signals that explain why this instability
              requires review.
            </p>

            <div style={styles.signalGrid}>
              {VISIBLE_SIGNALS.map((signal) => (
                <button
                  key={signal}
                  type="button"
                  onClick={() => toggleSignal(signal)}
                  style={{
                    ...styles.signalButton,
                    background: selectedSignals.includes(signal)
                      ? '#a7f3d0'
                      : '#111827',
                    color: selectedSignals.includes(signal) ? '#022c22' : 'white',
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
              checked={commandVisibility}
              onChange={(event) => setCommandVisibility(event.target.checked)}
            />

            <span>Command visibility may be needed</span>
          </div>

          <button onClick={createCase} disabled={loading} style={styles.primaryButton}>
            {loading ? 'Creating Case...' : 'Create Instability Case'}
          </button>
        </section>

        <section style={styles.caseSection}>
          <p style={styles.sectionKicker}>Active review</p>

          <h2 style={styles.sectionTitle}>Instability under governance</h2>

          <div style={styles.caseList}>
            {cases.map((caseItem) => (
              <article key={caseItem.id} style={styles.caseCard}>
                <div style={styles.caseHeader}>
                  <div>
                    <h3 style={styles.caseName}>{caseItem.beneficiary_name}</h3>
                    <p style={styles.caseDomain}>{caseItem.support_domain}</p>
                  </div>

                  <span style={difficultyBadge(caseItem.severity_level)}>
                    {caseItem.severity_level}
                  </span>
                </div>

                <div style={styles.infoGrid}>
                  <Info label="Status" value={caseItem.case_status} />
                  <Info
                    label="Location"
                    value={caseItem.beneficiary_level || 'Not provided'}
                  />
                  <Info label="Source Area" value={caseItem.region || 'Not provided'} />
                  <Info
                    label="Current Ownership"
                    value={caseItem.institution_name || 'Not provided'}
                  />
                </div>

                <div style={styles.signalContainer}>
                  {(caseItem.instability_signals || []).map((signal, index) => (
                    <span key={`${signal}-${index}`} style={styles.signalBadge}>
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
                  <label style={styles.label}>Stabilization Action</label>

                  <select
                    onChange={(event) =>
                      applyStabilizationAction(caseItem, event.target.value)
                    }
                    style={styles.select}
                    value=""
                  >
                    <option value="">Select stabilization action</option>

                    {STABILIZATION_ACTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.dropdownSection}>
                  <label style={styles.label}>Outcome Review</label>

                  <select
                    onChange={(event) =>
                      applyOutcomeSummary(caseItem, event.target.value)
                    }
                    style={styles.select}
                    value=""
                  >
                    <option value="">Select outcome review</option>

                    {OUTCOME_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {caseItem.intervention_summary && (
                  <div style={styles.summaryBox}>
                    <strong>Action:</strong> {caseItem.intervention_summary}
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

function Input({
  label,
  value,
  setValue,
  placeholder = '',
}: {
  label: string
  value: string
  setValue: (value: string) => void
  placeholder?: string
}) {
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

function difficultyBadge(level: string): CSSProperties {
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
    background: '#111827',
    color: '#a7f3d0',
    padding: '8px 12px',
    borderRadius: '999px',
    fontWeight: 800,
    border: '1px solid rgba(167,243,208,0.26)',
  }
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: 'white',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  hero: {
    marginBottom: '32px',
  },
  kicker: {
    color: '#cbd5e1',
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
  sectionKicker: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: '0 0 10px',
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
    background: '#e2e8f0',
    color: '#020617',
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
    color: '#cbd5e1',
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
    background: '#111827',
    color: '#a7f3d0',
    borderRadius: '999px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 800,
    border: '1px solid rgba(167,243,208,0.22)',
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