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

type CaseIntelligence = {
  phase: string
  nextMovement: string
  evidencePosture: string
  stagnationRisk: string
  commandMeaning: string
}

const ACTIVE_CASE_STATUSES = [
  'ACCEPTED_FOR_GOVERNANCE',
  'STABILIZATION_OWNER_ROUTED',
  'GOVERNANCE_REVIEW_REQUIRED',
  'EVIDENCE_REQUIRED_BEFORE_ROUTING',
  'OWNERSHIP_CLARITY_REQUIRED',
  'ROUTING_STALLED',
  'ACTION_ACTIVE',
  'IMPROVING',
  'RECOVERY_MONITORING',
  'ESCALATED',
  'REOPENED',
]

const CASE_TRANSITIONS = [
  'ACTION_ACTIVE',
  'IMPROVING',
  'RECOVERY_MONITORING',
  'ESCALATED',
  'REOPENED',
  'STABILIZED',
  'ARCHIVED',
]

const PRESSURE_TYPES = [
  'FLOW',
  'COVERAGE',
  'COORDINATION',
  'OWNERSHIP',
  'EVIDENCE',
  'RECOVERY',
  'RELIABILITY',
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
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCases()
  }, [])

  async function loadCases() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .in('support_domain', PRESSURE_TYPES)
      .in('case_status', ACTIVE_CASE_STATUSES)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setCases(data || [])
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
      event_summary: `Governed instability moved to ${nextStatus}`,
    })

    setMessage('Governed case movement preserved.')
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

    setMessage('Stabilization action preserved.')
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

    setMessage('Outcome review preserved.')
    await loadCases()
  }

  const metrics = useMemo(() => {
    return {
      activeGovernance: cases.length,
      highPressure: cases.filter(
        (item) =>
          item.severity_level === 'HIGH' ||
          item.severity_level === 'CRITICAL'
      ).length,
      routingStalled: cases.filter((item) =>
        item.case_status.includes('STALLED')
      ).length,
      recoveryMonitoring: cases.filter(
        (item) => item.case_status === 'RECOVERY_MONITORING'
      ).length,
      escalated: cases.filter((item) =>
        item.case_status.includes('ESCALATED')
      ).length,
      evidenceIncomplete: cases.filter(
        (item) => !item.intervention_summary || !item.outcome_summary
      ).length,
    }
  }, [cases])

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • CASE GOVERNANCE</p>

          <h1 style={styles.title}>Accepted Instability Governance</h1>

          <p style={styles.subtitle}>
            Govern accepted instability after triage. This surface preserves
            lifecycle phase, required next movement, evidence posture,
            stagnation risk, and command meaning.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Active Governance" value={metrics.activeGovernance} />
          <Metric label="High Pressure" value={metrics.highPressure} />
          <Metric label="Routing Stalled" value={metrics.routingStalled} />
          <Metric label="Recovery Monitoring" value={metrics.recoveryMonitoring} />
          <Metric label="Escalated" value={metrics.escalated} />
          <Metric label="Evidence Incomplete" value={metrics.evidenceIncomplete} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.caseSection}>
          <p style={styles.sectionKicker}>Active governance</p>

          <h2 style={styles.sectionTitle}>Governed instability cases</h2>

          <p style={styles.panelNote}>
            Triage decides whether instability deserves governance. Cases
            govern accepted instability until it is stabilized, archived, or
            escalated.
          </p>

          <div style={styles.caseList}>
            {cases.map((caseItem) => {
              const intelligence = buildCaseIntelligence(caseItem)

              return (
                <article key={caseItem.id} style={styles.caseCard}>
                  <div style={styles.caseHeader}>
                    <div>
                      <p style={styles.caseKicker}>Accepted CGI Case</p>

                      <h3 style={styles.caseName}>
                        {caseItem.beneficiary_name}
                      </h3>

                      <p style={styles.caseDomain}>
                        Pressure type: {caseItem.support_domain}
                      </p>
                    </div>

                    <span style={difficultyBadge(caseItem.severity_level)}>
                      {caseItem.severity_level}
                    </span>
                  </div>

                  <div style={styles.infoGrid}>
                    <Info label="Governance State" value={caseItem.case_status} />

                    <Info
                      label="Location"
                      value={caseItem.beneficiary_level || 'Not provided'}
                    />

                    <Info
                      label="Source Area"
                      value={caseItem.region || 'Not provided'}
                    />

                    <Info
                      label="Ownership"
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

                  <section style={styles.intelligencePanel}>
                    <p style={styles.intelligenceTitle}>
                      Case Intelligence Panel
                    </p>

                    <div style={styles.intelligenceGrid}>
                      <Info label="Lifecycle Phase" value={intelligence.phase} />
                      <Info
                        label="Required Next Movement"
                        value={intelligence.nextMovement}
                      />
                      <Info
                        label="Evidence Posture"
                        value={intelligence.evidencePosture}
                      />
                      <Info
                        label="Stagnation Risk"
                        value={intelligence.stagnationRisk}
                      />
                      <Info
                        label="Command Meaning"
                        value={intelligence.commandMeaning}
                      />
                    </div>
                  </section>

                  <div style={styles.interpretationBox}>
                    <p style={styles.interpretationTitle}>
                      Governance interpretation
                    </p>

                    <p style={styles.interpretationText}>
                      {buildGovernanceInterpretation(caseItem)}
                    </p>
                  </div>

                  <div style={styles.lifecycleGrid}>
                    {CASE_TRANSITIONS.map((status) => (
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
                      <strong>Action:</strong>{' '}
                      {truncateText(caseItem.intervention_summary)}
                    </div>
                  )}

                  {caseItem.outcome_summary && (
                    <div style={styles.summaryBox}>
                      <strong>Outcome:</strong>{' '}
                      {truncateText(caseItem.outcome_summary)}
                    </div>
                  )}
                </article>
              )
            })}

            {cases.length === 0 && (
              <div style={styles.emptyState}>
                No accepted instability is currently under active CGI
                governance.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function buildCaseIntelligence(caseItem: InstabilityCase): CaseIntelligence {
  const hasAction = Boolean(caseItem.intervention_summary)
  const hasOutcome = Boolean(caseItem.outcome_summary)

  const evidencePosture = [
    `Routing evidence: ${hasRoutingEvidence(caseItem) ? 'present' : 'pending'}`,
    `Action evidence: ${hasAction ? 'present' : 'missing'}`,
    `Outcome evidence: ${hasOutcome ? 'present' : 'missing'}`,
    `Recovery evidence: ${
      caseItem.case_status === 'RECOVERY_MONITORING' ? 'active' : 'pending'
    }`,
  ].join(' • ')

  if (caseItem.case_status === 'ACCEPTED_FOR_GOVERNANCE') {
    return {
      phase: 'Accepted into governance',
      nextMovement: 'Route to stabilization ownership',
      evidencePosture,
      stagnationRisk: 'Moderate if routing does not occur',
      commandMeaning: 'Visible instability has crossed into governance.',
    }
  }

  if (caseItem.case_status === 'STABILIZATION_OWNER_ROUTED') {
    return {
      phase: 'Routed for stabilization',
      nextMovement: hasAction
        ? 'Review action effect'
        : 'Begin governed stabilization action',
      evidencePosture,
      stagnationRisk: hasAction
        ? 'Low if outcome review follows'
        : 'High if no action is preserved',
      commandMeaning:
        'Ownership movement exists, but stabilization is not credible until action and outcome evidence appear.',
    }
  }

  if (caseItem.case_status.includes('EVIDENCE_REQUIRED')) {
    return {
      phase: 'Evidence gate',
      nextMovement: 'Preserve missing evidence before further movement',
      evidencePosture,
      stagnationRisk: 'High if evidence remains missing',
      commandMeaning:
        'The case cannot be treated as stabilizing until evidence quality improves.',
    }
  }

  if (caseItem.case_status.includes('OWNERSHIP_CLARITY')) {
    return {
      phase: 'Ownership clarity gate',
      nextMovement: 'Clarify responsible stabilization owner',
      evidencePosture,
      stagnationRisk: 'High if ownership remains unclear',
      commandMeaning:
        'Unclear ownership weakens continuity and may require executive awareness.',
    }
  }

  if (caseItem.case_status.includes('STALLED')) {
    return {
      phase: 'Stalled movement',
      nextMovement: 'Restore movement or escalate',
      evidencePosture,
      stagnationRisk: 'Critical until movement resumes',
      commandMeaning:
        'Stalled governance threatens stabilization credibility.',
    }
  }

  if (caseItem.case_status === 'ACTION_ACTIVE') {
    return {
      phase: 'Stabilization action active',
      nextMovement: hasOutcome
        ? 'Move into improvement or recovery monitoring'
        : 'Preserve outcome review',
      evidencePosture,
      stagnationRisk: hasOutcome
        ? 'Moderate until recovery is confirmed'
        : 'High if outcome remains missing',
      commandMeaning:
        'Action exists, but leadership still needs outcome visibility.',
    }
  }

  if (caseItem.case_status === 'IMPROVING') {
    return {
      phase: 'Improvement visible',
      nextMovement: 'Move into recovery monitoring',
      evidencePosture,
      stagnationRisk: 'Moderate until improvement holds',
      commandMeaning:
        'Improvement is visible, but stabilization is not yet proven.',
    }
  }

  if (caseItem.case_status === 'RECOVERY_MONITORING') {
    return {
      phase: 'Recovery credibility watch',
      nextMovement: 'Confirm holding pattern or archive',
      evidencePosture,
      stagnationRisk: 'Low if recovery evidence holds',
      commandMeaning:
        'CGI is confirming whether stabilization is durable.',
    }
  }

  if (caseItem.case_status.includes('ESCALATED')) {
    return {
      phase: 'Executive escalation',
      nextMovement: 'Resolve blocker or command-level decision',
      evidencePosture,
      stagnationRisk: 'High until escalation is resolved',
      commandMeaning:
        'This case has exceeded ordinary governance movement.',
    }
  }

  if (caseItem.case_status === 'REOPENED') {
    return {
      phase: 'Reopened instability',
      nextMovement: 'Review recurrence and restore stabilization path',
      evidencePosture,
      stagnationRisk: 'High because instability returned',
      commandMeaning:
        'Reopened instability may indicate weak recovery or unresolved root pressure.',
    }
  }

  return {
    phase: 'Active governance',
    nextMovement: 'Continue governed case movement',
    evidencePosture,
    stagnationRisk: 'Watch for delayed movement',
    commandMeaning:
      'Case remains visible until stabilization credibility is achieved.',
  }
}

function hasRoutingEvidence(caseItem: InstabilityCase) {
  return (
    caseItem.case_status.includes('ROUTED') ||
    caseItem.case_status.includes('ROUTING') ||
    caseItem.case_status === 'ACTION_ACTIVE' ||
    caseItem.case_status === 'IMPROVING' ||
    caseItem.case_status === 'RECOVERY_MONITORING'
  )
}

function buildGovernanceInterpretation(caseItem: InstabilityCase) {
  if (caseItem.case_status.includes('STALLED')) {
    return 'Governed movement is stalled. CGI should preserve visibility until stabilization direction resumes.'
  }

  if (caseItem.case_status.includes('ESCALATED')) {
    return 'This instability exceeded ordinary governance visibility and now requires elevated executive attention.'
  }

  if (caseItem.case_status === 'RECOVERY_MONITORING') {
    return 'Initial stabilization may be occurring, but CGI is preserving observation until recovery credibility holds.'
  }

  if (caseItem.case_status === 'IMPROVING') {
    return 'Governed action is showing positive movement, but stabilization should not yet be assumed permanent.'
  }

  return 'This instability remains under active continuity governance and requires operational oversight.'
}

function truncateText(value: string) {
  if (value.length <= 180) return value

  return `${value.slice(0, 180)}...`
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <h2 style={styles.metricValue}>{value}</h2>
    </div>
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

  if (level === 'MODERATE') {
    return {
      background: '#713f12',
      color: '#fde68a',
      padding: '8px 12px',
      borderRadius: '999px',
      fontWeight: 800,
    }
  }

  return {
    background: '#064e3b',
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

  caseSection: {
    marginBottom: '40px',
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
    marginBottom: '24px',
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

  caseKicker: {
    color: '#14b8a6',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '1.5px',
    margin: '0 0 8px',
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

  intelligencePanel: {
    marginTop: '20px',
    background: '#020617',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },

  intelligenceTitle: {
    color: '#5eead4',
    fontWeight: 900,
    margin: '0 0 14px',
  },

  intelligenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
  },

  interpretationBox: {
    marginTop: '20px',
    background: '#042f2e',
    border: '1px solid #115e59',
    borderRadius: '16px',
    padding: '14px',
  },

  interpretationTitle: {
    color: '#5eead4',
    fontWeight: 900,
    margin: 0,
  },

  interpretationText: {
    color: '#ccfbf1',
    lineHeight: 1.6,
    margin: '8px 0 0',
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

  summaryBox: {
    marginTop: '18px',
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '14px',
    padding: '14px',
    lineHeight: 1.6,
  },

  emptyState: {
    border: '1px dashed #334155',
    borderRadius: '18px',
    padding: '24px',
    color: '#94a3b8',
    textAlign: 'center',
  },
}