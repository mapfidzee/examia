'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type VisibleInstability = {
  id: string
  beneficiary_name: string
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  created_at?: string | null
}

type AuditSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

type TriageDecision =
  | 'ACCEPT_FOR_GOVERNANCE'
  | 'REQUEST_MORE_EVIDENCE'
  | 'ESCALATE_TO_COMMAND'
  | 'HOLD_FOR_CLARITY'
  | 'CLOSE_NO_CGI_ACTION'

const GOVERNANCE_INSTITUTION = 'TSINAXA CGI'

const CGI_PRESSURE_TYPES = [
  'FLOW',
  'COVERAGE',
  'COORDINATION',
  'OWNERSHIP',
  'EVIDENCE',
  'RECOVERY',
  'RELIABILITY',
]

const TRIAGE_DECISIONS: {
  value: TriageDecision
  label: string
  status: string
  reason: string
}[] = [
  {
    value: 'ACCEPT_FOR_GOVERNANCE',
    label: 'Accept into case governance',
    status: 'ACCEPTED_FOR_GOVERNANCE',
    reason:
      'Visible instability requires governed continuity oversight and should become an active CGI case.',
  },
  {
    value: 'REQUEST_MORE_EVIDENCE',
    label: 'Request more evidence',
    status: 'TRIAGE_EVIDENCE_REQUIRED',
    reason:
      'Visible instability cannot yet be accepted because evidence is insufficient.',
  },
  {
    value: 'ESCALATE_TO_COMMAND',
    label: 'Escalate to command visibility',
    status: 'TRIAGE_COMMAND_ESCALATION',
    reason:
      'Visible instability requires executive visibility before normal case movement.',
  },
  {
    value: 'HOLD_FOR_CLARITY',
    label: 'Hold for ownership or scope clarity',
    status: 'TRIAGE_CLARITY_REQUIRED',
    reason:
      'Visible instability requires clearer ownership, scope, or institutional context before acceptance.',
  },
  {
    value: 'CLOSE_NO_CGI_ACTION',
    label: 'Close: no CGI action required',
    status: 'TRIAGE_CLOSED_NO_CGI_ACTION',
    reason:
      'Visible instability does not currently require CGI governance.',
  },
]

export default function TriageContent() {
  const [items, setItems] = useState<VisibleInstability[]>([])
  const [selectedDecisions, setSelectedDecisions] = useState<
    Record<string, TriageDecision | ''>
  >({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .in('support_domain', CGI_PRESSURE_TYPES)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setItems(data || [])
  }

  async function preserveTriageDecision(item: VisibleInstability) {
    const decisionValue = selectedDecisions[item.id]

    if (!decisionValue) {
      setMessage('Select a triage decision before preserving review.')
      return
    }

    const decision = TRIAGE_DECISIONS.find(
      (entry) => entry.value === decisionValue
    )

    if (!decision) return

    const { error: updateError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: decision.status,
      })
      .eq('id', item.id)

    if (updateError) {
      alert(updateError.message)
      return
    }

    await preserveTriageEvidence({
      item,
      decision,
      severity: resolveTriageSeverity(item, decision.status),
      summary: buildTriageSummary(item, decision.status),
    })

    setMessage('Triage decision preserved as CGI governance evidence.')

    await loadData()
  }

  const metrics = useMemo(() => {
    return {
      visibleInstability: items.length,
      accepted: items.filter(
        (item) => item.case_status === 'ACCEPTED_FOR_GOVERNANCE'
      ).length,
      evidenceRequired: items.filter((item) =>
        item.case_status.includes('EVIDENCE_REQUIRED')
      ).length,
      commandEscalation: items.filter((item) =>
        item.case_status.includes('COMMAND_ESCALATION')
      ).length,
      clarityRequired: items.filter((item) =>
        item.case_status.includes('CLARITY_REQUIRED')
      ).length,
      closed: items.filter((item) =>
        item.case_status.includes('CLOSED_NO_CGI_ACTION')
      ).length,
    }
  }, [items])

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • TRIAGE GOVERNANCE</p>

          <h1 style={styles.title}>Visible Instability Triage</h1>

          <p style={styles.subtitle}>
            Review visible instability before it becomes an accepted CGI case.
            Triage decides whether the signal requires governance, more
            evidence, command visibility, ownership clarity, or no further CGI
            action.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Visible Instability" value={metrics.visibleInstability} />
          <Metric label="Accepted" value={metrics.accepted} />
          <Metric label="Evidence Required" value={metrics.evidenceRequired} />
          <Metric label="Command Escalation" value={metrics.commandEscalation} />
          <Metric label="Clarity Required" value={metrics.clarityRequired} />
          <Metric label="Closed" value={metrics.closed} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Triage Review Queue</h2>

          <p style={styles.sectionText}>
            A request captures visible instability. Triage decides whether it
            should become a governed case. Cases should only carry accepted
            instability forward.
          </p>

          <div style={styles.caseList}>
            {items.map((item) => (
              <article key={item.id} style={styles.caseCard}>
                <div style={styles.caseHeader}>
                  <div>
                    <p style={styles.caseKicker}>Visible Instability</p>

                    <h3 style={styles.caseName}>
                      {buildInstabilityIdentity(item)}
                    </h3>

                    <p style={styles.caseDomain}>
                      Pressure type: {item.support_domain}
                    </p>
                  </div>

                  <span style={severityBadge(item.severity_level)}>
                    {item.severity_level}
                  </span>
                </div>

                <div style={styles.infoGrid}>
                  <Info label="Current State" value={item.case_status} />

                  <Info
                    label="Site / Institution"
                    value={item.institution_name || GOVERNANCE_INSTITUTION}
                  />

                  <Info
                    label="Region"
                    value={item.region || 'Not provided'}
                  />

                  <Info
                    label="Executive Visibility"
                    value={
                      item.safeguarding_flag ||
                      item.severity_level === 'CRITICAL'
                        ? 'Required'
                        : 'Governance level'
                    }
                  />
                </div>

                <div style={styles.meaningBox}>
                  <p style={styles.meaningTitle}>Triage interpretation</p>

                  <p style={styles.meaningText}>
                    {buildTriageInterpretation(item)}
                  </p>
                </div>

                <div style={styles.dropdownSection}>
                  <label style={styles.label}>Triage Decision</label>

                  <select
                    value={selectedDecisions[item.id] || ''}
                    style={styles.select}
                    onChange={(event) =>
                      setSelectedDecisions((current) => ({
                        ...current,
                        [item.id]: event.target.value as TriageDecision,
                      }))
                    }
                  >
                    <option value="">Select triage decision</option>

                    {TRIAGE_DECISIONS.map((decision) => (
                      <option key={decision.value} value={decision.value}>
                        {decision.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  style={styles.button}
                  onClick={() => preserveTriageDecision(item)}
                >
                  Preserve Triage Decision
                </button>
              </article>
            ))}

            {items.length === 0 && (
              <div style={styles.emptyState}>
                No visible CGI instability is currently waiting for triage.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

async function preserveTriageEvidence(input: {
  item: VisibleInstability
  decision: {
    status: string
    reason: string
  }
  severity: AuditSeverity
  summary: string
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const institution =
    input.item.institution_name || GOVERNANCE_INSTITUTION

  const { error } = await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    email: user?.email ?? null,
    role: 'CGI_TRIAGE_GOVERNANCE_ACTOR',

    action_type: 'CGI_TRIAGE_DECISION_PRESERVED',
    route: '/triage',
    record_type: 'beneficiary_cases',
    record_id: input.item.id,
    summary: input.summary,
    severity: input.severity,

    details: {
      evidence_type: 'CGI_TRIAGE_EVIDENCE',

      linked_case_id: input.item.id,
      pressure_type: input.item.support_domain,

      triage_status: input.decision.status,
      triage_reason: input.decision.reason,

      governance_institution: institution,
      institution_name: institution,

      visibility_level:
        input.item.safeguarding_flag ||
        input.item.severity_level === 'CRITICAL' ||
        input.decision.status.includes('COMMAND_ESCALATION')
          ? 'EXECUTIVE'
          : 'GOVERNANCE',

      continuity_interpretation:
        'Triage preserved the governance decision before instability entered downstream case movement.',

      survivability_meaning:
        'CGI protected downstream routing and intervention from unreviewed or unclear instability.',

      governance_boundary: 'NON_PUNITIVE_CONTINUITY_GOVERNANCE',
      actor_email: user?.email ?? null,
      actor_id: user?.id ?? null,
    },
  })

  if (error) console.error(error)
}

function buildInstabilityIdentity(item: VisibleInstability) {
  const site = item.institution_name || GOVERNANCE_INSTITUTION
  const region = item.region || 'Unspecified region'

  return `${item.support_domain} instability • ${site} • ${region}`
}

function buildTriageSummary(item: VisibleInstability, status: string) {
  return `Triage decision preserved for ${buildInstabilityIdentity(
    item
  )}. Status: ${status}.`
}

function buildTriageInterpretation(item: VisibleInstability) {
  if (item.case_status === 'ACCEPTED_FOR_GOVERNANCE') {
    return 'This instability has already been accepted into CGI case governance and may move toward routing.'
  }

  if (item.case_status.includes('EVIDENCE_REQUIRED')) {
    return 'This instability needs stronger evidence before it can safely become a governed case.'
  }

  if (item.case_status.includes('COMMAND_ESCALATION')) {
    return 'This instability requires command visibility before ordinary case movement continues.'
  }

  if (item.case_status.includes('CLARITY_REQUIRED')) {
    return 'This instability requires clearer ownership, scope, or context before acceptance.'
  }

  if (item.safeguarding_flag || item.severity_level === 'CRITICAL') {
    return 'This instability carries elevated visibility and should not move silently into routine handling.'
  }

  return 'This visible instability is ready for triage review before it becomes an accepted CGI case.'
}

function resolveTriageSeverity(
  item: VisibleInstability,
  status: string
): AuditSeverity {
  if (item.severity_level === 'CRITICAL') return 'CRITICAL'

  if (
    item.safeguarding_flag ||
    status.includes('COMMAND_ESCALATION')
  ) {
    return 'HIGH'
  }

  if (item.severity_level === 'HIGH') return 'HIGH'
  if (item.severity_level === 'MODERATE') return 'MODERATE'

  return 'LOW'
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

function severityBadge(level: string): CSSProperties {
  if (level === 'CRITICAL') {
    return {
      ...styles.badge,
      background: '#7f1d1d',
      color: '#fecaca',
    }
  }

  if (level === 'HIGH') {
    return {
      ...styles.badge,
      background: '#7c2d12',
      color: '#fdba74',
    }
  }

  if (level === 'MODERATE') {
    return {
      ...styles.badge,
      background: '#713f12',
      color: '#fde68a',
    }
  }

  return {
    ...styles.badge,
    background: '#064e3b',
    color: '#a7f3d0',
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
    color: '#14b8a6',
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
    maxWidth: '940px',
    lineHeight: 1.7,
    fontSize: '18px',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
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
    margin: 0,
  },

  metricValue: {
    fontSize: '38px',
    margin: '8px 0 0',
  },

  message: {
    background: '#064e3b',
    color: '#ccfbf1',
    padding: '16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '20px',
    lineHeight: 1.6,
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
    margin: 0,
  },

  sectionText: {
    color: '#94a3b8',
    lineHeight: 1.7,
    maxWidth: '850px',
    marginBottom: '20px',
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
    fontSize: '23px',
    margin: 0,
    lineHeight: 1.25,
  },

  caseDomain: {
    color: '#99f6e4',
    marginTop: '8px',
  },

  badge: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontWeight: 900,
    height: 'fit-content',
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
    margin: 0,
  },

  infoValue: {
    margin: '6px 0 0',
    lineHeight: 1.5,
  },

  meaningBox: {
    marginTop: '18px',
    background: '#042f2e',
    border: '1px solid #115e59',
    borderRadius: '16px',
    padding: '14px',
  },

  meaningTitle: {
    color: '#5eead4',
    fontWeight: 900,
    margin: 0,
  },

  meaningText: {
    color: '#ccfbf1',
    lineHeight: 1.6,
    margin: '8px 0 0',
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
    padding: '14px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
  },

  button: {
    width: '100%',
    marginTop: '18px',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #14b8a6',
    background: '#0f766e',
    color: 'white',
    fontWeight: 900,
    cursor: 'pointer',
  },

  emptyState: {
    border: '1px dashed #334155',
    borderRadius: '18px',
    padding: '24px',
    color: '#94a3b8',
    textAlign: 'center',
  },
}