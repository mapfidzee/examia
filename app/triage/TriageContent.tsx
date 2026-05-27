'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type VisibleInstability = {
  id: string
  beneficiary_name: string
  beneficiary_level?: string | null
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

type TriageIntelligence = {
  gateStatus: string
  recommendedPosture: string
  evidenceMeaning: string
  ownershipMeaning: string
  riskMeaning: string
  nextMovement: string
  downstreamSurface: string
  commandMeaning: string
}

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

const ACTIVE_TRIAGE_STATUSES = [
  'PENDING_TRIAGE',
  'UNDER_REVIEW',
  'TRIAGE_EVIDENCE_REQUIRED',
  'TRIAGE_COMMAND_ESCALATION',
  'TRIAGE_CLARITY_REQUIRED',
]

const PRESERVED_TRIAGE_STATUSES = [
  'ACCEPTED_FOR_GOVERNANCE',
  'TRIAGE_CLOSED_NO_CGI_ACTION',
]

const TRIAGE_QUEUE_STATUSES = [
  ...ACTIVE_TRIAGE_STATUSES,
  ...PRESERVED_TRIAGE_STATUSES,
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
      .in('case_status', TRIAGE_QUEUE_STATUSES)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setItems(sortByTriagePriority(data || []))
  }

  async function preserveTriageDecision(item: VisibleInstability) {
    if (isDecisionLocked(item)) {
      setMessage('This triage decision is already preserved and locked.')
      return
    }

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
        updated_at: new Date().toISOString(),
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

    setMessage(
      decision.status === 'ACCEPTED_FOR_GOVERNANCE'
        ? 'Triage accepted visible instability into active CGI case governance.'
        : 'Triage decision preserved as CGI governance evidence.'
    )

    await loadData()
  }

  const activeReviewItems = useMemo(() => {
    return items.filter((item) => !isDecisionLocked(item))
  }, [items])

  const preservedReviewItems = useMemo(() => {
    return items.filter((item) => isDecisionLocked(item))
  }, [items])

  const metrics = useMemo(() => {
    return {
      visibleInstability: items.length,
      awaitingTriage: activeReviewItems.length,
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
  }, [items, activeReviewItems])

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • TRIAGE INTELLIGENCE</p>

          <h1 style={styles.title}>Governance Eligibility Review</h1>

          <p style={styles.subtitle}>
            Triage decides whether visible instability becomes an accepted CGI
            case, requires more evidence, needs command visibility, should be
            held for clarity, or should close without CGI action.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Visible Intake" value={metrics.visibleInstability} />
          <Metric label="Awaiting Triage" value={metrics.awaitingTriage} />
          <Metric label="Accepted" value={metrics.accepted} />
          <Metric label="Evidence Required" value={metrics.evidenceRequired} />
          <Metric label="Command Escalation" value={metrics.commandEscalation} />
          <Metric label="Clarity Required" value={metrics.clarityRequired} />
          <Metric label="Closed" value={metrics.closed} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Awaiting Triage Review
              </h2>

              <p style={styles.sectionText}>
                Request opens visibility. Triage judges eligibility. Only
                instability that crosses the acceptance threshold should move
                into active case governance.
              </p>
            </div>
          </div>

          <div style={styles.caseList}>
            {activeReviewItems.map((item) => (
              <TriageCard
                key={item.id}
                item={item}
                selectedDecision={selectedDecisions[item.id] || ''}
                setSelectedDecisions={setSelectedDecisions}
                preserveTriageDecision={preserveTriageDecision}
              />
            ))}

            {activeReviewItems.length === 0 && (
              <div style={styles.emptyState}>
                No visible CGI instability is currently awaiting triage review.
              </div>
            )}
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>
                Preserved Triage Decisions
              </h2>

              <p style={styles.sectionText}>
                These signals have already been triaged. Their decision is
                preserved here for governance visibility, not repeated review.
              </p>
            </div>
          </div>

          <div style={styles.caseList}>
            {preservedReviewItems.map((item) => (
              <TriageCard
                key={item.id}
                item={item}
                selectedDecision={selectedDecisions[item.id] || ''}
                setSelectedDecisions={setSelectedDecisions}
                preserveTriageDecision={preserveTriageDecision}
              />
            ))}

            {preservedReviewItems.length === 0 && (
              <div style={styles.emptyState}>
                No preserved triage decisions are currently visible.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function TriageCard({
  item,
  selectedDecision,
  setSelectedDecisions,
  preserveTriageDecision,
}: {
  item: VisibleInstability
  selectedDecision: TriageDecision | ''
  setSelectedDecisions: React.Dispatch<
    React.SetStateAction<Record<string, TriageDecision | ''>>
  >
  preserveTriageDecision: (item: VisibleInstability) => void
}) {
  const intelligence = buildTriageIntelligence(item)
  const locked = isDecisionLocked(item)

  return (
    <article style={styles.caseCard}>
      <div style={styles.caseHeader}>
        <div>
          <p style={styles.caseKicker}>
            {locked ? 'Decision Preserved' : 'Visible Instability'}
          </p>

          <h3 style={styles.caseName}>
            {buildSimplifiedIdentity(item)}
          </h3>

          <p style={styles.caseDomain}>
            Full identity: {item.beneficiary_name}
          </p>
        </div>

        <span style={severityBadge(item.severity_level)}>
          {item.severity_level}
        </span>
      </div>

      <div style={styles.infoGrid}>
        <Info label="Triage State" value={item.case_status} />

        <Info label="Pressure Type" value={item.support_domain} />

        <Info
          label="Site / Institution"
          value={item.institution_name || GOVERNANCE_INSTITUTION}
        />

        <Info label="Region" value={item.region || 'Not provided'} />

        <Info
          label="Visibility"
          value={
            item.safeguarding_flag || item.severity_level === 'CRITICAL'
              ? 'Executive visibility'
              : 'Governance visibility'
          }
        />

        <Info
          label="Next Surface"
          value={intelligence.downstreamSurface}
        />
      </div>

      <div style={styles.signalContainer}>
        <span style={styles.signalBadge}>{item.support_domain}</span>
        <span style={styles.signalBadge}>{item.severity_level}</span>

        {(item.safeguarding_flag || item.severity_level === 'CRITICAL') && (
          <span style={styles.signalBadge}>EXECUTIVE_VISIBILITY</span>
        )}

        {item.case_status === 'ACCEPTED_FOR_GOVERNANCE' && (
          <span style={styles.signalBadge}>CASE_ACCEPTED</span>
        )}

        {locked && <span style={styles.lockedBadge}>DECISION_LOCKED</span>}
      </div>

      <section style={styles.intelligencePanel}>
        <p style={styles.intelligenceTitle}>
          Triage Intelligence Panel
        </p>

        <div style={styles.intelligenceGrid}>
          <Info label="Gate Status" value={intelligence.gateStatus} />

          <Info
            label="Recommended Posture"
            value={intelligence.recommendedPosture}
          />

          <Info
            label="Evidence Meaning"
            value={intelligence.evidenceMeaning}
          />

          <Info
            label="Ownership Meaning"
            value={intelligence.ownershipMeaning}
          />

          <Info label="Risk Meaning" value={intelligence.riskMeaning} />

          <Info
            label="Required Next Movement"
            value={intelligence.nextMovement}
          />

          <Info
            label="Command Meaning"
            value={intelligence.commandMeaning}
          />
        </div>
      </section>

      <div style={styles.meaningBox}>
        <p style={styles.meaningTitle}>Triage interpretation</p>

        <p style={styles.meaningText}>
          {buildTriageInterpretation(item)}
        </p>
      </div>

      {locked ? (
        <div style={styles.lockBox}>
          <p style={styles.lockTitle}>Decision preserved</p>

          <p style={styles.lockText}>
            This triage decision is locked for governance visibility. Continue
            movement through {intelligence.downstreamSurface}.
          </p>
        </div>
      ) : (
        <>
          <div style={styles.dropdownSection}>
            <label style={styles.label}>Triage Decision</label>

            <select
              value={selectedDecision}
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
        </>
      )}
    </article>
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

  const institution = input.item.institution_name || GOVERNANCE_INSTITUTION

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

function isDecisionLocked(item: VisibleInstability) {
  return PRESERVED_TRIAGE_STATUSES.includes(item.case_status)
}

function sortByTriagePriority(items: VisibleInstability[]) {
  return [...items].sort((a, b) => {
    const aScore = triagePriorityScore(a)
    const bScore = triagePriorityScore(b)

    if (aScore !== bScore) return bScore - aScore

    return (
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
    )
  })
}

function triagePriorityScore(item: VisibleInstability) {
  let score = 0

  if (!isDecisionLocked(item)) score += 100
  if (item.case_status.includes('COMMAND_ESCALATION')) score += 50
  if (item.severity_level === 'CRITICAL') score += 40
  if (item.severity_level === 'HIGH') score += 30
  if (item.safeguarding_flag) score += 20
  if (item.case_status.includes('CLARITY_REQUIRED')) score += 15
  if (item.case_status.includes('EVIDENCE_REQUIRED')) score += 10

  return score
}

function buildSimplifiedIdentity(item: VisibleInstability) {
  const location = item.beneficiary_level || item.region || 'Unspecified site'

  return `${item.support_domain} triage • ${location}`
}

function buildTriageSummary(item: VisibleInstability, status: string) {
  return `Triage decision preserved for ${buildSimplifiedIdentity(
    item
  )}. Status: ${status}.`
}

function buildTriageIntelligence(item: VisibleInstability): TriageIntelligence {
  if (item.case_status === 'ACCEPTED_FOR_GOVERNANCE') {
    return {
      gateStatus: 'Accepted into governance',
      recommendedPosture: 'Ready for active case governance',
      evidenceMeaning: 'Evidence threshold passed or accepted for governance',
      ownershipMeaning: 'Ownership can be clarified downstream if required',
      riskMeaning: 'Risk now belongs inside active case governance',
      nextMovement: 'Move toward case lifecycle governance and routing',
      downstreamSurface: '/cases',
      commandMeaning:
        'This instability has crossed the threshold into active CGI oversight.',
    }
  }

  if (item.case_status.includes('EVIDENCE_REQUIRED')) {
    return {
      gateStatus: 'Evidence gate',
      recommendedPosture: 'Do not accept until evidence improves',
      evidenceMeaning: 'Evidence is not yet sufficient for credible governance',
      ownershipMeaning: 'Ownership may remain secondary until evidence improves',
      riskMeaning: 'Risk increases if evidence remains weak',
      nextMovement: 'Request missing evidence before acceptance',
      downstreamSurface: '/triage',
      commandMeaning:
        'Weak evidence can create false stabilization confidence if accepted too early.',
    }
  }

  if (item.case_status.includes('COMMAND_ESCALATION')) {
    return {
      gateStatus: 'Command visibility required',
      recommendedPosture: 'Elevate before ordinary case movement',
      evidenceMeaning: 'Evidence should be preserved for executive review',
      ownershipMeaning: 'Ownership may require command-level clarification',
      riskMeaning: 'High visibility risk if handled routinely',
      nextMovement: 'Preserve command review before downstream movement',
      downstreamSurface: '/command',
      commandMeaning:
        'This instability exceeds routine triage and requires executive awareness.',
    }
  }

  if (item.case_status.includes('CLARITY_REQUIRED')) {
    return {
      gateStatus: 'Clarity gate',
      recommendedPosture: 'Hold until ownership, scope, or context is clearer',
      evidenceMeaning: 'Evidence may exist but context is not yet actionable',
      ownershipMeaning: 'Ownership or scope is not clear enough',
      riskMeaning: 'Risk of misrouting if accepted too early',
      nextMovement: 'Clarify ownership, scope, or institutional context',
      downstreamSurface: '/triage',
      commandMeaning:
        'CGI is preventing unclear instability from entering the active chain prematurely.',
    }
  }

  if (item.case_status.includes('CLOSED_NO_CGI_ACTION')) {
    return {
      gateStatus: 'Closed at triage',
      recommendedPosture: 'No active CGI case required',
      evidenceMeaning: 'Evidence did not justify active governance',
      ownershipMeaning: 'Ownership can remain outside CGI governance',
      riskMeaning: 'Low if no recurrence appears',
      nextMovement: 'Monitor only if signal returns',
      downstreamSurface: 'Archive / memory watch',
      commandMeaning:
        'Triage protected the system from unnecessary case creation.',
    }
  }

  if (item.safeguarding_flag || item.severity_level === 'CRITICAL') {
    return {
      gateStatus: 'Elevated triage visibility',
      recommendedPosture: 'Executive visibility recommended',
      evidenceMeaning: 'Evidence must be preserved carefully',
      ownershipMeaning: 'Ownership must not remain unclear',
      riskMeaning: 'High if review is delayed',
      nextMovement: 'Escalate or accept with strong governance visibility',
      downstreamSurface: '/triage or /command',
      commandMeaning:
        'This instability should not move silently into routine handling.',
    }
  }

  if (item.severity_level === 'HIGH') {
    return {
      gateStatus: 'High-pressure triage',
      recommendedPosture: 'Likely accept or escalate depending on evidence',
      evidenceMeaning: 'Evidence should be strong enough to support movement',
      ownershipMeaning: 'Ownership should be identified quickly',
      riskMeaning: 'May expand if triage stalls',
      nextMovement: 'Decide acceptance, evidence request, or escalation',
      downstreamSurface: '/triage',
      commandMeaning:
        'This signal may become broader continuity pressure if delayed.',
    }
  }

  return {
    gateStatus: 'Pending triage judgment',
    recommendedPosture: 'Review for governance eligibility',
    evidenceMeaning: 'Evidence should be checked before case acceptance',
    ownershipMeaning: 'Ownership should be clear enough for routing',
    riskMeaning: 'Moderate if not reviewed',
    nextMovement: 'Choose acceptance, clarity, evidence, escalation, or closure',
    downstreamSurface: '/triage',
    commandMeaning:
      'The signal should remain visible until triage determines the correct path.',
  }
}

function buildTriageInterpretation(item: VisibleInstability) {
  if (item.case_status === 'ACCEPTED_FOR_GOVERNANCE') {
    return 'This instability has already been accepted into CGI case governance and should continue through case lifecycle governance.'
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

  if (item.case_status.includes('CLOSED_NO_CGI_ACTION')) {
    return 'This instability was reviewed and did not require active CGI case governance.'
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },

  metricCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '18px',
  },

  metricLabel: {
    color: '#94a3b8',
    fontWeight: 800,
    margin: 0,
    fontSize: '13px',
  },

  metricValue: {
    fontSize: '34px',
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

  sectionHeader: {
    marginBottom: '20px',
  },

  sectionTitle: {
    fontSize: '28px',
    margin: 0,
  },

  sectionText: {
    color: '#94a3b8',
    lineHeight: 1.7,
    maxWidth: '850px',
    marginTop: '12px',
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
    fontSize: '20px',
    margin: 0,
    lineHeight: 1.35,
    wordBreak: 'break-word',
  },

  caseDomain: {
    color: '#94a3b8',
    marginTop: '6px',
    fontSize: '12px',
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },

  badge: {
    padding: '8px 12px',
    borderRadius: '999px',
    fontWeight: 900,
    fontSize: '12px',
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
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    margin: 0,
  },

  infoValue: {
    margin: '6px 0 0',
    lineHeight: 1.45,
    fontSize: '13px',
    wordBreak: 'break-word',
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
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: 800,
    border: '1px solid rgba(167,243,208,0.22)',
  },

  lockedBadge: {
    background: '#312e81',
    color: '#c4b5fd',
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: 900,
    border: '1px solid rgba(196,181,253,0.28)',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
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

  lockBox: {
    marginTop: '18px',
    background: '#111827',
    border: '1px solid #4c1d95',
    borderRadius: '16px',
    padding: '14px',
  },

  lockTitle: {
    color: '#c4b5fd',
    fontWeight: 900,
    margin: 0,
    textTransform: 'uppercase',
    fontSize: '12px',
    letterSpacing: '0.08em',
  },

  lockText: {
    color: '#ddd6fe',
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