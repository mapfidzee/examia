'use client'

import { useEffect, useMemo, useState } from 'react'
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

const OWNERSHIP_STATES = [
  'CLEAR',
  'UNCLEAR',
  'MISSING',
  'TRANSFERRED',
  'CONTESTED',
]

const REVIEW_URGENCY = [
  'NEXT_SHIFT',
  'TODAY',
  'WITHIN_24_HOURS',
  'WITHIN_48_HOURS',
  'ROUTINE_REVIEW',
]

const STABILIZATION_ACTIONS = [
  'OWNERSHIP_REVIEW_STARTED',
  'ROUTING_REVIEW_STARTED',
  'BACKLOG_REVIEW_STARTED',
  'HANDOFF_REVIEW_STARTED',
  'EVIDENCE_CHECK_REQUESTED',
  'RECOVERY_WATCH_STARTED',
  'CROSS_TEAM_COORDINATION_REQUESTED',
  'COMMAND_REVIEW_RECOMMENDED',
]

const OUTCOME_OPTIONS = [
  'STABILIZED',
  'IMPROVEMENT_HOLDING',
  'PARTIAL_IMPROVEMENT_ONLY',
  'FURTHER_ACTION_REQUIRED',
  'ESCALATION_REQUIRED',
  'ISSUE_RETURNED_AFTER_IMPROVEMENT',
  'READY_FOR_ARCHIVE',
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

  const [location, setLocation] = useState('SITE_A')
  const [pressureType, setPressureType] = useState('FLOW')
  const [affectedArea, setAffectedArea] = useState('ROUTING')
  const [visibleSignal, setVisibleSignal] = useState('ROUTING_DELAY')
  const [difficultyLevel, setDifficultyLevel] = useState('MODERATE')
  const [sourceArea, setSourceArea] = useState('OPERATIONS_DESK')
  const [currentOwnership, setCurrentOwnership] = useState('UNCLEAR')
  const [reviewUrgency, setReviewUrgency] = useState('WITHIN_24_HOURS')

  const [selectedSignals, setSelectedSignals] = useState<string[]>([
    'ROUTING_DELAY',
  ])

  const [commandVisibility, setCommandVisibility] = useState(false)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCases()
  }, [])

  const generatedCaseIdentity = useMemo(() => {
    return [
      pressureType,
      visibleSignal,
      location,
      affectedArea,
      difficultyLevel,
    ].join(' • ')
  }, [
    pressureType,
    visibleSignal,
    location,
    affectedArea,
    difficultyLevel,
  ])

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
    setLoading(true)
    setMessage('')

    const signals = selectedSignals.includes(visibleSignal)
      ? selectedSignals
      : [visibleSignal, ...selectedSignals]

    const { data, error } = await supabase
      .from('beneficiary_cases')
      .insert({
        beneficiary_name: generatedCaseIdentity,
        beneficiary_level: location,
        support_domain: pressureType,
        severity_level: difficultyLevel,
        instability_signals: signals,
        region: sourceArea,
        institution_name: currentOwnership,
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
      event_summary: `Visible instability accepted into review: ${generatedCaseIdentity}`,
    })

    setLocation('SITE_A')
    setPressureType('FLOW')
    setAffectedArea('ROUTING')
    setVisibleSignal('ROUTING_DELAY')
    setDifficultyLevel('MODERATE')
    setSourceArea('OPERATIONS_DESK')
    setCurrentOwnership('UNCLEAR')
    setReviewUrgency('WITHIN_24_HOURS')
    setSelectedSignals(['ROUTING_DELAY'])
    setCommandVisibility(false)

    setMessage('Instability case created.')
    setLoading(false)

    await loadCases()
  }

  async function changeCaseStatus(
    caseItem: InstabilityCase,
    nextStatus: string
  ) {
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

  async function applyOutcomeSummary(
    caseItem: InstabilityCase,
    outcome: string
  ) {
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
      setSelectedSignals(
        selectedSignals.filter((item) => item !== signal)
      )
    } else {
      setSelectedSignals([...selectedSignals, signal])
    }
  }

  const visibleCases = cases.filter((item) =>
    PRESSURE_TYPES.includes(item.support_domain)
  )

  const totalCases = visibleCases.length

  const highOrCriticalCases = visibleCases.filter(
    (item) =>
      item.severity_level === 'HIGH' ||
      item.severity_level === 'CRITICAL'
  ).length

  const escalatedCases = visibleCases.filter(
    (item) => item.case_status === 'ESCALATED'
  ).length

  const stableCases = visibleCases.filter(
    (item) =>
      item.case_status === 'STABLE' ||
      item.case_status === 'ARCHIVED'
  ).length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>
            TSINAXA CGI • CASE GOVERNANCE
          </p>

          <h1 style={styles.title}>
            Active Instability Cases
          </h1>

          <p style={styles.subtitle}>
            Use this page to govern visible instability
            that has moved beyond intake and now requires
            review, routing, action, evidence, or recovery
            follow-up.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Total Cases" value={totalCases} />
          <Metric
            label="High / Critical"
            value={highOrCriticalCases}
          />
          <Metric
            label="Escalated"
            value={escalatedCases}
          />
          <Metric
            label="Stable / Archived"
            value={stableCases}
          />
        </section>

        {message && (
          <div style={styles.message}>{message}</div>
        )}

        <section style={styles.formCard}>
          <p style={styles.sectionKicker}>
            Create case
          </p>

          <h2 style={styles.sectionTitle}>
            Accept instability into review
          </h2>

          <p style={styles.panelNote}>
            CGI generates the case identity from governed
            operational selections so cases remain
            comparable, searchable, and structurally
            consistent.
          </p>

          <div style={styles.generatedBox}>
            <p style={styles.generatedLabel}>
              Generated Case Identity
            </p>

            <p style={styles.generatedValue}>
              {generatedCaseIdentity}
            </p>
          </div>

          <div style={styles.grid}>
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
              label="Visible Signal"
              value={visibleSignal}
              setValue={setVisibleSignal}
              options={VISIBLE_SIGNALS}
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
              value={currentOwnership}
              setValue={setCurrentOwnership}
              options={OWNERSHIP_STATES}
            />

            <Select
              label="Review Urgency"
              value={reviewUrgency}
              setValue={setReviewUrgency}
              options={REVIEW_URGENCY}
            />
          </div>

          <div style={{ marginTop: '24px' }}>
            <label style={styles.label}>
              Additional Visible Signals
            </label>

            <p style={styles.panelNote}>
              Select any related operational signals.
            </p>

            <div style={styles.signalGrid}>
              {VISIBLE_SIGNALS.map((signal) => (
                <button
                  key={signal}
                  type="button"
                  onClick={() => toggleSignal(signal)}
                  style={{
                    ...styles.signalButton,
                    background:
                      selectedSignals.includes(signal)
                        ? '#a7f3d0'
                        : '#111827',
                    color:
                      selectedSignals.includes(signal)
                        ? '#022c22'
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
              checked={commandVisibility}
              onChange={(event) =>
                setCommandVisibility(event.target.checked)
              }
            />

            <span>
              Command visibility may be needed
            </span>
          </div>

          <button
            onClick={createCase}
            disabled={loading}
            style={styles.primaryButton}
          >
            {loading
              ? 'Creating Case...'
              : 'Create Instability Case'}
          </button>
        </section>

        <section style={styles.caseSection}>
          <p style={styles.sectionKicker}>
            Active review
          </p>

          <h2 style={styles.sectionTitle}>
            Instability under governance
          </h2>

          <div style={styles.caseList}>
            {visibleCases.map((caseItem) => (
              <article
                key={caseItem.id}
                style={styles.caseCard}
              >
                <div style={styles.caseHeader}>
                  <div>
                    <h3 style={styles.caseName}>
                      {caseItem.beneficiary_name}
                    </h3>

                    <p style={styles.caseDomain}>
                      {caseItem.support_domain}
                    </p>
                  </div>

                  <span
                    style={difficultyBadge(
                      caseItem.severity_level
                    )}
                  >
                    {caseItem.severity_level}
                  </span>
                </div>

                <div style={styles.infoGrid}>
                  <Info
                    label="Status"
                    value={caseItem.case_status}
                  />

                  <Info
                    label="Location"
                    value={
                      caseItem.beneficiary_level ||
                      'Not provided'
                    }
                  />

                  <Info
                    label="Source Area"
                    value={
                      caseItem.region || 'Not provided'
                    }
                  />

                  <Info
                    label="Current Ownership"
                    value={
                      caseItem.institution_name ||
                      'Not provided'
                    }
                  />
                </div>

                <div style={styles.signalContainer}>
                  {(caseItem.instability_signals || []).map(
                    (signal, index) => (
                      <span
                        key={`${signal}-${index}`}
                        style={styles.signalBadge}
                      >
                        {signal}
                      </span>
                    )
                  )}
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
                    Stabilization Action
                  </label>

                  <select
                    onChange={(event) =>
                      applyStabilizationAction(
                        caseItem,
                        event.target.value
                      )
                    }
                    style={styles.select}
                    value=""
                  >
                    <option value="">
                      Select stabilization action
                    </option>

                    {STABILIZATION_ACTIONS.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.dropdownSection}>
                  <label style={styles.label}>
                    Outcome Review
                  </label>

                  <select
                    onChange={(event) =>
                      applyOutcomeSummary(
                        caseItem,
                        event.target.value
                      )
                    }
                    style={styles.select}
                    value=""
                  >
                    <option value="">
                      Select outcome review
                    </option>

                    {OUTCOME_OPTIONS.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {caseItem.intervention_summary && (
                  <div style={styles.summaryBox}>
                    <strong>Action:</strong>{' '}
                    {truncateLegacyText(
                      caseItem.intervention_summary
                    )}
                  </div>
                )}

                {caseItem.outcome_summary && (
                  <div style={styles.summaryBox}>
                    <strong>Outcome:</strong>{' '}
                    {truncateLegacyText(
                      caseItem.outcome_summary
                    )}
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

function truncateLegacyText(value: string) {
  if (value.length <= 180) return value

  return `${value.slice(0, 180)}...`
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
        onChange={(event) =>
          setValue(event.target.value)
        }
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

function Info({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.infoBox}>
      <p style={styles.infoLabel}>{label}</p>

      <p style={styles.infoValue}>{value}</p>
    </div>
  )
}

function difficultyBadge(
  level: string
): CSSProperties {
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

  generatedBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    marginBottom: '22px',
  },

  generatedLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },

  generatedValue: {
    color: '#a7f3d0',
    fontSize: '22px',
    fontWeight: 900,
    lineHeight: 1.25,
    margin: '8px 0 0',
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