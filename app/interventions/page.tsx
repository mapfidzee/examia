'use client'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  evaluateInterventionLifecycle,
  type ContinuityRisk,
} from '../../lib/lifecycleGovernance'
import { supabase } from '../../lib/supabase'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

type StabilityCase = {
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

type AuditSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

const GOVERNANCE_INSTITUTION = 'TSINAXA CGI'

const ACTION_READY_STATUSES = [
  'ACCEPTED_FOR_GOVERNANCE',
  'ROUTED',
  'ASSIGNED',
  'RESPONDER_ASSIGNED',
  'ROUTING_CONFIRMED',
  'STABILIZATION_ROUTED',
  'STABILIZATION_OWNER_ROUTED',
  'ROUTED_TO_RESPONDER',
  'ROUTING_RECURRENCE',
  'INTERVENTION_READY',
  'INTERVENTION_ACTIVE',
  'INTERVENTION_RECORDED',
  'STABILIZING',
  'ESCALATED',
]

const ROUTED_OR_ASSIGNED_STATUSES = [
  'ROUTED',
  'ASSIGNED',
  'RESPONDER_ASSIGNED',
  'ROUTING_CONFIRMED',
  'STABILIZATION_ROUTED',
  'STABILIZATION_OWNER_ROUTED',
  'ROUTED_TO_RESPONDER',
  'ROUTING_RECURRENCE',
  'INTERVENTION_READY',
  'INTERVENTION_ACTIVE',
]

const ACTION_TYPES = [
  'Continuity stabilization action',
  'Operational coordination action',
  'Owner-directed stabilization action',
  'Institution-directed stabilization action',
  'Escalation pathway action',
  'Continuity follow-up action',
  'Barrier removal action',
  'Executive visibility action',
]

const ACTION_MODES = [
  'Direct operational contact',
  'Internal coordination',
  'Owner coordination',
  'Institution coordination',
  'Low-bandwidth communication',
  'Documented follow-up',
  'Escalation coordination',
  'Hybrid stabilization action',
]

const ACTION_STATUSES = [
  'COMPLETED',
  'PARTIALLY_COMPLETED',
  'INTERRUPTED',
  'FOLLOW_UP_REQUIRED',
  'ESCALATION_REQUIRED',
]

const EVIDENCE_LEVELS = [
  'Action recorded with sufficient movement evidence',
  'Action partially evidenced; follow-up required',
  'Action attempted but blocked by operational barrier',
  'Action requires escalation before stabilization can continue',
  'Action completed but continuity risk remains active',
]

const OWNER_POSTURES = [
  'Owner confirmed and action moving',
  'Owner confirmed but follow-up required',
  'Owner unclear; governance review required',
  'Owner blocked by dependency',
  'Executive owner visibility required',
]

const RESIDUAL_RISK_NOTES = [
  'Residual risk is low; monitor through normal lifecycle review.',
  'Residual risk is moderate; recovery watch should remain active.',
  'Residual risk is high; governance follow-up is required.',
  'Residual risk is critical; executive visibility is required.',
  'Residual risk cannot be reduced until dependency is resolved.',
]

const REVIEW_WINDOWS = [
  '24 hours',
  '48 hours',
  '72 hours',
  '5 business days',
  '7 days',
  'Governance review required immediately',
]

const CONTINUITY_RISKS: ContinuityRisk[] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']

export default function InterventionCompletionPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
        'INSTITUTION_COORDINATOR',
        'RESPONDER',
      ]}
    >
      <CGIGovernanceShell>
        <InterventionCompletionContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function InterventionCompletionContent() {
  const [cases, setCases] = useState<StabilityCase[]>([])

  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [actionType, setActionType] = useState('')
  const [actionMode, setActionMode] = useState('')
  const [actionStatus, setActionStatus] = useState('')
  const [evidenceLevel, setEvidenceLevel] = useState('')
  const [ownerPosture, setOwnerPosture] = useState('')
  const [residualRiskNote, setResidualRiskNote] = useState('')
  const [reviewWindow, setReviewWindow] = useState('')
  const [stabilizationMovementScore, setStabilizationMovementScore] = useState('3')
  const [continuityRisk, setContinuityRisk] = useState<ContinuityRisk>('MODERATE')
  const [additionalGovernanceNotes, setAdditionalGovernanceNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCases()
  }, [])

  async function loadCases() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .in('case_status', ACTION_READY_STATUSES)
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

  function buildCaseLabel(caseItem: StabilityCase) {
    return `${caseItem.beneficiary_name} • ${caseItem.support_domain} • ${caseItem.case_status}`
  }

  function interventionEvidence() {
    const caseItem = selectedCase()

    if (!caseItem) return ''

    const lifecycleDecision = evaluateInterventionLifecycle({
      completionStatus: actionStatus,
      continuityRisk,
    })

    return `
GOVERNED STABILIZATION ACTION EVIDENCE

Stability Case:
${caseItem.beneficiary_name}

Stability Domain:
${caseItem.support_domain}

Severity:
${caseItem.severity_level}

Institution / Governance Context:
${caseItem.institution_name || GOVERNANCE_INSTITUTION}

Current Continuity Status:
${caseItem.case_status}

Action Type:
${actionType || 'Not specified'}

Action Mode:
${actionMode || 'Not specified'}

Action Status:
${actionStatus || 'Not specified'}

Evidence Level:
${evidenceLevel || 'Not specified'}

Owner Posture:
${ownerPosture || 'Not specified'}

Residual Risk:
${residualRiskNote || 'Not specified'}

Review Window:
${reviewWindow || 'Not specified'}

Stabilization Movement Score:
${stabilizationMovementScore}/5

Continuity Risk After Action:
${continuityRisk}

Lifecycle Governance:
Next Status: ${lifecycleDecision.nextStatus}
Stabilization Confidence: ${lifecycleDecision.stabilizationConfidence}
Escalation Required: ${lifecycleDecision.shouldEscalate ? 'YES' : 'NO'}
Recovery Monitoring Required: ${lifecycleDecision.shouldMonitorRecovery ? 'YES' : 'NO'}
Command Visibility: ${lifecycleDecision.commandVisibility ? 'YES' : 'NO'}

Additional Governance Notes:
${additionalGovernanceNotes.trim() || 'No additional notes entered.'}

Governance Boundary:
This record confirms whether routed instability converted into governed stabilization action. It does not verify final outcome, declare recovery, or close the case. Outcome verification belongs to /outcomes. Recovery durability belongs to /recovery.

Non-Punitive Statement:
This action evidence record does not blame a person, team, owner, institution, or partner. It preserves operational movement, remaining risk, ownership posture, review need, and continuity visibility.

CGI Principle:
Routing is not action. Action is not outcome. Outcome is not recovery.
    `.trim()
  }

  async function saveInterventionEvidence() {
    if (!selectedCaseId) {
      alert('Select a stability case.')
      return
    }

    if (
      !actionType ||
      !actionMode ||
      !actionStatus ||
      !evidenceLevel ||
      !ownerPosture ||
      !residualRiskNote ||
      !reviewWindow
    ) {
      alert('Complete all required action evidence fields.')
      return
    }

    setLoading(true)
    setMessage('')

    const caseItem = selectedCase()

    if (!caseItem) {
      alert('Selected stability case could not be found.')
      setLoading(false)
      return
    }

    const lifecycleDecision = evaluateInterventionLifecycle({
      completionStatus: actionStatus,
      continuityRisk,
    })

    const evidence = interventionEvidence()

    const { data: interventionRecord, error: interventionError } = await supabase
      .from('case_interventions')
      .insert({
        case_id: selectedCaseId,
        intervention_type: actionType,
        intervention_summary: evidence,
      })
      .select('id')
      .single()

    if (interventionError) {
      alert(interventionError.message)
      setLoading(false)
      return
    }

    const { error: caseError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: lifecycleDecision.nextStatus,
        intervention_summary: evidence,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedCaseId)

    if (caseError) {
      alert(caseError.message)
      setLoading(false)
      return
    }

    const { data: timelineRecord, error: timelineError } = await supabase
      .from('case_timeline')
      .insert({
        case_id: selectedCaseId,
        event_type: lifecycleDecision.timelineEventType,
        event_summary: `${lifecycleDecision.timelineSummary} Action status: ${actionStatus}. Continuity risk: ${continuityRisk}. Evidence level: ${evidenceLevel}. Owner posture: ${ownerPosture}. Review window: ${reviewWindow}.`,
        actor: 'TSINAXA CGI Intervention Evidence Governance',
      })
      .select('id')
      .single()

    if (timelineError) {
      alert(timelineError.message)
      setLoading(false)
      return
    }

    await preserveInterventionGovernanceEvidence({
      caseItem,
      interventionRecordId: interventionRecord?.id || null,
      timelineRecordId: timelineRecord?.id || null,
      lifecycleDecision,
      actionType,
      actionMode,
      actionStatus,
      evidenceLevel,
      ownerPosture,
      residualRiskNote,
      reviewWindow,
      stabilizationMovementScore,
      continuityRisk,
      additionalGovernanceNotes,
    })

    setSelectedCaseId('')
    setActionType('')
    setActionMode('')
    setActionStatus('')
    setEvidenceLevel('')
    setOwnerPosture('')
    setResidualRiskNote('')
    setReviewWindow('')
    setStabilizationMovementScore('3')
    setContinuityRisk('MODERATE')
    setAdditionalGovernanceNotes('')

    setMessage(
      'Governed stabilization action evidence saved. Lifecycle movement, timeline evidence, and audit memory preserved.'
    )

    setLoading(false)
    await loadCases()
  }

  const activeActionCases = cases.length
  const criticalCases = cases.filter((item) => item.severity_level === 'CRITICAL').length
  const executiveVisibilityCases = cases.filter(
    (item) => item.safeguarding_flag || item.severity_level === 'CRITICAL'
  ).length
  const routedCases = cases.filter((item) =>
    ROUTED_OR_ASSIGNED_STATUSES.includes(item.case_status)
  ).length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • INTERVENTION EVIDENCE</p>

          <h1 style={styles.title}>Governed Stabilization Action Evidence</h1>

          <p style={styles.subtitle}>
            Convert routed instability into structured action evidence. This surface
            records what action was taken, who owns the movement, what evidence exists,
            what risk remains, and when governance review is required.
          </p>

          <div style={styles.boundaryBox}>
            <strong>Boundary:</strong> /interventions records governed action evidence only.
            It does not verify outcomes, declare recovery, or close continuity risk.
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Cases Ready for Action" value={activeActionCases} />
          <Metric label="Routed / Assigned Cases" value={routedCases} />
          <Metric label="Critical Continuity Cases" value={criticalCases} />
          <Metric label="Executive Visibility Cases" value={executiveVisibilityCases} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Record Action Evidence</h2>

            <p style={styles.panelNote}>
              Use this after routed instability has received real stabilization action.
              Record operational facts, ownership posture, evidence strength, residual
              risk, and review timing.
            </p>

            <label style={styles.label}>
              Stability Case
              <select
                value={selectedCaseId}
                onChange={(event) => setSelectedCaseId(event.target.value)}
                style={styles.select}
              >
                <option value="">
                  {cases.length === 0
                    ? 'No action-ready stability cases found'
                    : 'Select stability case'}
                </option>

                {cases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {buildCaseLabel(caseItem)}
                  </option>
                ))}
              </select>
            </label>

            <Select
              label="Action Type"
              value={actionType}
              setValue={setActionType}
              options={['', ...ACTION_TYPES]}
            />

            <Select
              label="Action Mode"
              value={actionMode}
              setValue={setActionMode}
              options={['', ...ACTION_MODES]}
            />

            <Select
              label="Action Status"
              value={actionStatus}
              setValue={setActionStatus}
              options={['', ...ACTION_STATUSES]}
            />

            <Select
              label="Evidence Level"
              value={evidenceLevel}
              setValue={setEvidenceLevel}
              options={['', ...EVIDENCE_LEVELS]}
            />

            <Select
              label="Owner Posture"
              value={ownerPosture}
              setValue={setOwnerPosture}
              options={['', ...OWNER_POSTURES]}
            />

            <Select
              label="Residual Risk"
              value={residualRiskNote}
              setValue={setResidualRiskNote}
              options={['', ...RESIDUAL_RISK_NOTES]}
            />

            <Select
              label="Review Window"
              value={reviewWindow}
              setValue={setReviewWindow}
              options={['', ...REVIEW_WINDOWS]}
            />

            <label style={styles.label}>
              Stabilization Movement Score: {stabilizationMovementScore}/5
              <input
                type="range"
                min="1"
                max="5"
                value={stabilizationMovementScore}
                onChange={(event) => setStabilizationMovementScore(event.target.value)}
                style={styles.range}
              />
            </label>

            <Select
              label="Continuity Risk After Action"
              value={continuityRisk}
              setValue={(value) => setContinuityRisk(value as ContinuityRisk)}
              options={CONTINUITY_RISKS}
            />

            <label style={styles.label}>
              Optional Governance Notes
              <textarea
                value={additionalGovernanceNotes}
                onChange={(event) => setAdditionalGovernanceNotes(event.target.value)}
                placeholder="Use operational facts only. Avoid blame, emotional language, or unnecessary personal detail."
                style={styles.textarea}
              />
            </label>

            <button
              onClick={saveInterventionEvidence}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading ? 'Saving Evidence...' : 'Save Stabilization Action Evidence'}
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Generated Evidence Record</h2>

            <p style={styles.panelNote}>
              This is the governed action evidence record that will be saved to the
              intervention table, preserved in the timeline, and carried into lifecycle
              governance.
            </p>

            <pre style={styles.summaryBox}>
              {interventionEvidence() ||
                'Select a stability case to generate governed stabilization action evidence.'}
            </pre>
          </div>
        </section>
      </div>
    </main>
  )
}

async function preserveInterventionGovernanceEvidence(input: {
  caseItem: StabilityCase
  interventionRecordId: string | null
  timelineRecordId: string | null
  lifecycleDecision: {
    nextStatus: string
    stabilizationConfidence: string
    shouldEscalate: boolean
    shouldMonitorRecovery: boolean
    commandVisibility: boolean
    timelineEventType: string
    timelineSummary: string
  }
  actionType: string
  actionMode: string
  actionStatus: string
  evidenceLevel: string
  ownerPosture: string
  residualRiskNote: string
  reviewWindow: string
  stabilizationMovementScore: string
  continuityRisk: ContinuityRisk
  additionalGovernanceNotes: string
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const institution = input.caseItem.institution_name || GOVERNANCE_INSTITUTION

  const visibilityLevel =
    input.lifecycleDecision.commandVisibility ||
    input.caseItem.safeguarding_flag ||
    input.continuityRisk === 'CRITICAL' ||
    input.continuityRisk === 'HIGH'
      ? 'EXECUTIVE'
      : 'GOVERNANCE'

  const governancePosture = resolveInterventionGovernancePosture({
    continuityRisk: input.continuityRisk,
    actionStatus: input.actionStatus,
    commandVisibility: input.lifecycleDecision.commandVisibility,
    shouldEscalate: input.lifecycleDecision.shouldEscalate,
  })

  const severity = resolveInterventionSeverity({
    continuityRisk: input.continuityRisk,
    actionStatus: input.actionStatus,
    commandVisibility: input.lifecycleDecision.commandVisibility,
  })

  const summary = `Saved governed stabilization action evidence for ${input.caseItem.beneficiary_name}. Action status: ${input.actionStatus}. Continuity risk: ${input.continuityRisk}. Next status: ${input.lifecycleDecision.nextStatus}. Institution: ${institution}.`

  const { error } = await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    email: user?.email ?? null,
    role: 'INTERVENTION_GOVERNANCE_USER',

    action_type: 'SAVE_STABILIZATION_ACTION_EVIDENCE',
    route: '/interventions',
    record_type: 'beneficiary_cases',
    record_id: input.caseItem.id,
    summary,
    severity,

    details: {
      evidence_type: 'GOVERNED_STABILIZATION_ACTION_EVIDENCE',
      immutability_status: 'IMMUTABLE_GOVERNANCE_RECORD',
      reconstruction_capability: 'ENABLED',

      linked_snapshot_id: input.caseItem.id,
      stability_case_id: input.caseItem.id,
      intervention_record_id: input.interventionRecordId,
      timeline_record_id: input.timelineRecordId,

      governance_reason: summary,
      governance_institution: institution,
      governance_scope: 'Governed stabilization action evidence',
      governance_posture: governancePosture,
      visibility_level: visibilityLevel,

      institution_id: null,
      institution_name: institution,
      region: input.caseItem.region,

      actor_id: user?.id ?? null,
      actor_email: user?.email ?? null,
      actor_role: 'INTERVENTION_GOVERNANCE_USER',

      case_signal: input.caseItem.beneficiary_name,
      case_level: input.caseItem.beneficiary_level,
      stability_domain: input.caseItem.support_domain,
      previous_case_status: input.caseItem.case_status,
      next_case_status: input.lifecycleDecision.nextStatus,
      severity_level: input.caseItem.severity_level,
      executive_visibility_flag: input.caseItem.safeguarding_flag,

      action_type: input.actionType,
      action_mode: input.actionMode,
      action_status: input.actionStatus,
      evidence_level: input.evidenceLevel,
      owner_posture: input.ownerPosture,
      residual_risk_note: input.residualRiskNote,
      review_window: input.reviewWindow,

      stabilization_movement_score: Number(input.stabilizationMovementScore),
      continuity_risk_after_action: input.continuityRisk,

      stabilization_confidence: input.lifecycleDecision.stabilizationConfidence,
      escalation_required: input.lifecycleDecision.shouldEscalate,
      recovery_monitoring_required: input.lifecycleDecision.shouldMonitorRecovery,
      command_visibility_required: input.lifecycleDecision.commandVisibility,

      additional_governance_notes: input.additionalGovernanceNotes.trim() || null,

      continuity_relevance:
        'This record preserves whether routed instability converted into governed stabilization action, what evidence exists, what risk remains, and when review is required.',

      survivability_context: buildInterventionSurvivabilityContext({
        actionStatus: input.actionStatus,
        continuityRisk: input.continuityRisk,
        stabilizationConfidence: input.lifecycleDecision.stabilizationConfidence,
        nextStatus: input.lifecycleDecision.nextStatus,
        reviewWindow: input.reviewWindow,
      }),

      routing_is_not_action: true,
      action_is_not_outcome: true,
      outcome_is_not_recovery: true,
      continuity_memory_preserved: true,
      institutional_traceability: true,
      executive_visibility_enabled: visibilityLevel === 'EXECUTIVE',

      governance_boundary: 'NON_PUNITIVE_CONTINUITY_GOVERNANCE',
    },
  })

  if (error) {
    console.error('Intervention governance evidence logging failed', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
  }
}

function resolveInterventionSeverity(input: {
  continuityRisk: ContinuityRisk
  actionStatus: string
  commandVisibility: boolean
}): AuditSeverity {
  if (
    input.continuityRisk === 'CRITICAL' ||
    input.actionStatus === 'ESCALATION_REQUIRED'
  ) {
    return 'CRITICAL'
  }

  if (input.continuityRisk === 'HIGH' || input.commandVisibility) {
    return 'HIGH'
  }

  if (input.continuityRisk === 'MODERATE') {
    return 'MODERATE'
  }

  return 'LOW'
}

function resolveInterventionGovernancePosture(input: {
  continuityRisk: ContinuityRisk
  actionStatus: string
  commandVisibility: boolean
  shouldEscalate: boolean
}) {
  if (
    input.continuityRisk === 'CRITICAL' ||
    input.actionStatus === 'ESCALATION_REQUIRED' ||
    input.shouldEscalate
  ) {
    return 'EXECUTIVE_REVIEW'
  }

  if (
    input.continuityRisk === 'HIGH' ||
    input.commandVisibility ||
    input.actionStatus === 'FOLLOW_UP_REQUIRED' ||
    input.actionStatus === 'INTERRUPTED'
  ) {
    return 'GOVERNANCE_WATCH'
  }

  if (input.continuityRisk === 'MODERATE') {
    return 'RECOVERY_MONITORING'
  }

  return 'ACTION_EVIDENCE_HOLDING'
}

function buildInterventionSurvivabilityContext(input: {
  actionStatus: string
  continuityRisk: ContinuityRisk
  stabilizationConfidence: string
  nextStatus: string
  reviewWindow: string
}) {
  return `Stabilization action is ${input.actionStatus.toLowerCase()} with ${input.continuityRisk.toLowerCase()} continuity risk and ${input.stabilizationConfidence.toLowerCase()} stabilization confidence. The case moves toward ${input.nextStatus.toLowerCase()}. Review window is ${input.reviewWindow.toLowerCase()}. Recovery is not assumed; survivability depends on outcome verification, continued monitoring, escalation handling, and durable stabilization evidence.`
}

function Metric({ label, value }: { label: string; value: number }) {
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
        onChange={(event) => setValue(event.target.value)}
        style={styles.select}
      >
        {options.map((option, index) => (
          <option key={`${option || 'blank'}-${index}`} value={option}>
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
    color: 'white',
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
  boundaryBox: {
    marginTop: '18px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    color: '#e2e8f0',
    lineHeight: 1.6,
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