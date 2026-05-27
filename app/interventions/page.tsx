'use client'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  evaluateInterventionLifecycle,
  type ContinuityRisk,
} from '../../lib/lifecycleGovernance'
import { supabase } from '../../lib/supabase'
import { useEffect, useMemo, useState } from 'react'
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
  updated_at?: string | null
  created_at?: string | null
}

type InterventionRecord = {
  id: string
  case_id: string
  intervention_type: string | null
  intervention_summary: string | null
  created_at?: string | null
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

const CONTINUITY_RISKS: ContinuityRisk[] = [
  'LOW',
  'MODERATE',
  'HIGH',
  'CRITICAL',
]

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
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])

  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [actionType, setActionType] = useState('')
  const [actionMode, setActionMode] = useState('')
  const [actionStatus, setActionStatus] = useState('')
  const [evidenceLevel, setEvidenceLevel] = useState('')
  const [ownerPosture, setOwnerPosture] = useState('')
  const [residualRiskNote, setResidualRiskNote] = useState('')
  const [reviewWindow, setReviewWindow] = useState('')
  const [stabilizationMovementScore, setStabilizationMovementScore] =
    useState('3')

  const [continuityRisk, setContinuityRisk] =
    useState<ContinuityRisk>('MODERATE')

  const [additionalGovernanceNotes, setAdditionalGovernanceNotes] =
    useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCases()
    loadInterventions()
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

  async function loadInterventions() {
    const { data, error } = await supabase
      .from('case_interventions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setInterventions(data || [])
  }

  const actionPressure = useMemo(() => {
    const interruptedActions = interventions.filter((item) =>
      item.intervention_summary?.includes('INTERRUPTED')
    ).length

    const escalationActions = interventions.filter((item) =>
      item.intervention_summary?.includes('ESCALATION_REQUIRED')
    ).length

    const followUpActions = interventions.filter((item) =>
      item.intervention_summary?.includes('FOLLOW_UP_REQUIRED')
    ).length

    const recurrenceCases = cases.filter(
      (item) => item.case_status === 'ROUTING_RECURRENCE'
    ).length

    return {
      interruptedActions,
      escalationActions,
      followUpActions,
      recurrenceCases,
    }
  }, [cases, interventions])

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
ACTION MOVEMENT
${actionStatus || 'Not specified'}

OWNER VISIBILITY
${ownerPosture || 'Not specified'}

EVIDENCE POSTURE
${evidenceLevel || 'Not specified'}

RESIDUAL RISK
${residualRiskNote || 'Not specified'}

REVIEW EXPECTATION
${reviewWindow || 'Not specified'}

NEXT LIFECYCLE STATE
${lifecycleDecision.nextStatus}

COMMAND VISIBILITY
${lifecycleDecision.commandVisibility ? 'REQUIRED' : 'NORMAL'}

STABILIZATION CONFIDENCE
${lifecycleDecision.stabilizationConfidence}

CONTINUITY RISK
${continuityRisk}

CASE SIGNAL
${caseItem.beneficiary_name}

STABILITY DOMAIN
${caseItem.support_domain}

CURRENT CONTINUITY STATUS
${caseItem.case_status}

ACTION TYPE
${actionType || 'Not specified'}

ACTION MODE
${actionMode || 'Not specified'}

ADDITIONAL GOVERNANCE NOTES
${
  additionalGovernanceNotes.trim() ||
  'No additional notes entered.'
}

CGI GOVERNANCE PRINCIPLE
Routing is not action.
Action is not outcome.
Outcome is not recovery.
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

    const lifecycleDecision =
      evaluateInterventionLifecycle({
        completionStatus: actionStatus,
        continuityRisk,
      })

    const evidence = interventionEvidence()

    const {
      data: interventionRecord,
      error: interventionError,
    } = await supabase
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

    const { error: timelineError } = await supabase
      .from('case_timeline')
      .insert({
        case_id: selectedCaseId,
        event_type:
          lifecycleDecision.timelineEventType,
        event_summary: `${lifecycleDecision.timelineSummary} Action status: ${actionStatus}. Continuity risk: ${continuityRisk}.`,
        actor:
          'TSINAXA CGI Intervention Evidence Governance',
      })

    if (timelineError) {
      alert(timelineError.message)
      setLoading(false)
      return
    }

    await preserveInterventionGovernanceEvidence({
      caseItem,
      interventionRecordId:
        interventionRecord?.id || null,
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
      'Governed stabilization action evidence saved. Lifecycle movement, continuity memory, and operational visibility preserved.'
    )

    setLoading(false)

    await loadCases()
    await loadInterventions()
  }

  const activeActionCases = cases.length

  const criticalCases = cases.filter(
    (item) => item.severity_level === 'CRITICAL'
  ).length

  const executiveVisibilityCases = cases.filter(
    (item) =>
      item.safeguarding_flag ||
      item.severity_level === 'CRITICAL'
  ).length

  const routedCases = cases.filter((item) =>
    ROUTED_OR_ASSIGNED_STATUSES.includes(
      item.case_status
    )
  ).length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>
            TSINAXA CGI • ACTION EVIDENCE GOVERNANCE
          </p>

          <h1 style={styles.title}>
            Stabilization Action Governance
          </h1>

          <p style={styles.subtitle}>
            Govern stabilization action evidence,
            continuity movement, ownership
            posture, residual risk, review timing,
            and operational survivability.
          </p>

          <div style={styles.boundaryBox}>
            <strong>Boundary:</strong>{' '}
            /interventions governs stabilization
            action evidence only. It does not
            verify outcomes, declare recovery,
            or close continuity instability.
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric
            label="Cases Ready For Action"
            value={activeActionCases}
          />

          <Metric
            label="Routed / Assigned Cases"
            value={routedCases}
          />

          <Metric
            label="Critical Continuity Cases"
            value={criticalCases}
          />

          <Metric
            label="Executive Visibility Cases"
            value={executiveVisibilityCases}
          />
        </section>

        <section style={styles.intelligenceGrid}>
          <IntelligenceCard
            title="Interrupted Actions"
            value={
              actionPressure.interruptedActions
            }
            description="Action pathways interrupted before stabilization movement became credible."
          />

          <IntelligenceCard
            title="Escalation Pressure"
            value={
              actionPressure.escalationActions
            }
            description="Actions requiring executive or governance escalation."
          />

          <IntelligenceCard
            title="Follow-Up Accumulation"
            value={
              actionPressure.followUpActions
            }
            description="Actions still requiring continuity follow-up before recovery evaluation."
          />

          <IntelligenceCard
            title="Recurrence Concentration"
            value={
              actionPressure.recurrenceCases
            }
            description="Cases repeatedly re-entering routing or instability pathways."
          />
        </section>

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Record Stabilization Action
            </h2>

            <p style={styles.panelNote}>
              Use this after routed instability
              receives real stabilization action.
              Preserve operational movement,
              ownership posture, evidence
              credibility, residual risk, and
              review expectations.
            </p>

            <label style={styles.label}>
              Stability Case

              <select
                value={selectedCaseId}
                onChange={(event) =>
                  setSelectedCaseId(
                    event.target.value
                  )
                }
                style={styles.select}
              >
                <option value="">
                  Select stability case
                </option>

                {cases.map((caseItem) => (
                  <option
                    key={caseItem.id}
                    value={caseItem.id}
                  >
                    {buildCaseLabel(caseItem)}
                  </option>
                ))}
              </select>
            </label>

            <Select
              label="Action Type"
              placeholder="Select action type"
              value={actionType}
              setValue={setActionType}
              options={ACTION_TYPES}
            />

            <Select
              label="Action Mode"
              placeholder="Select action mode"
              value={actionMode}
              setValue={setActionMode}
              options={ACTION_MODES}
            />

            <Select
              label="Action Status"
              placeholder="Select action status"
              value={actionStatus}
              setValue={setActionStatus}
              options={ACTION_STATUSES}
            />

            <Select
              label="Evidence Posture"
              placeholder="Select evidence posture"
              value={evidenceLevel}
              setValue={setEvidenceLevel}
              options={EVIDENCE_LEVELS}
            />

            <Select
              label="Owner Visibility"
              placeholder="Select owner posture"
              value={ownerPosture}
              setValue={setOwnerPosture}
              options={OWNER_POSTURES}
            />

            <Select
              label="Residual Risk"
              placeholder="Select residual risk"
              value={residualRiskNote}
              setValue={setResidualRiskNote}
              options={RESIDUAL_RISK_NOTES}
            />

            <Select
              label="Review Timing"
              placeholder="Select review timing"
              value={reviewWindow}
              setValue={setReviewWindow}
              options={REVIEW_WINDOWS}
            />

            <label style={styles.label}>
              Stabilization Movement Score:{' '}
              {stabilizationMovementScore}/5

              <input
                type="range"
                min="1"
                max="5"
                value={
                  stabilizationMovementScore
                }
                onChange={(event) =>
                  setStabilizationMovementScore(
                    event.target.value
                  )
                }
                style={styles.range}
              />
            </label>

            <Select
              label="Continuity Risk"
              placeholder="Select continuity risk"
              value={continuityRisk}
              setValue={(value) =>
                setContinuityRisk(
                  value as ContinuityRisk
                )
              }
              options={CONTINUITY_RISKS}
            />

            <label style={styles.label}>
              Governance Notes

              <textarea
                value={
                  additionalGovernanceNotes
                }
                onChange={(event) =>
                  setAdditionalGovernanceNotes(
                    event.target.value
                  )
                }
                placeholder="Use operational facts only. Preserve continuity visibility and governance relevance."
                style={styles.textarea}
              />
            </label>

            <button
              onClick={
                saveInterventionEvidence
              }
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading
                ? 'Saving Governance Evidence...'
                : 'Preserve Stabilization Action Evidence'}
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Executive Action Synthesis
            </h2>

            <p style={styles.panelNote}>
              This operational synthesis will be
              preserved into intervention memory,
              continuity audit visibility, and
              lifecycle governance interpretation.
            </p>

            <pre style={styles.summaryBox}>
              {interventionEvidence() ||
                'Select a stability case to generate executive stabilization action synthesis.'}
            </pre>
          </div>
        </section>
      </div>
    </main>
  )
}

async function preserveInterventionGovernanceEvidence(
  input: {
    caseItem: StabilityCase
    interventionRecordId: string | null
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
  }
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const institution =
    input.caseItem.institution_name ||
    GOVERNANCE_INSTITUTION

  const visibilityLevel =
    input.lifecycleDecision
      .commandVisibility ||
    input.caseItem.safeguarding_flag ||
    input.continuityRisk === 'CRITICAL' ||
    input.continuityRisk === 'HIGH'
      ? 'EXECUTIVE'
      : 'GOVERNANCE'

  const governancePosture =
    resolveInterventionGovernancePosture({
      continuityRisk:
        input.continuityRisk,
      actionStatus: input.actionStatus,
      commandVisibility:
        input.lifecycleDecision
          .commandVisibility,
      shouldEscalate:
        input.lifecycleDecision
          .shouldEscalate,
    })

  const severity =
    resolveInterventionSeverity({
      continuityRisk:
        input.continuityRisk,
      actionStatus: input.actionStatus,
      commandVisibility:
        input.lifecycleDecision
          .commandVisibility,
    })

  const summary = `Saved governed stabilization action evidence for ${input.caseItem.beneficiary_name}.`

  await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    email: user?.email ?? null,
    role:
      'INTERVENTION_GOVERNANCE_USER',

    action_type:
      'SAVE_STABILIZATION_ACTION_EVIDENCE',
    route: '/interventions',
    record_type: 'beneficiary_cases',
    record_id: input.caseItem.id,
    summary,
    severity,

    details: {
      evidence_type:
        'GOVERNED_STABILIZATION_ACTION_EVIDENCE',

      governance_posture:
        governancePosture,

      visibility_level:
        visibilityLevel,

      continuity_risk:
        input.continuityRisk,

      action_status:
        input.actionStatus,

      review_window:
        input.reviewWindow,

      stabilization_confidence:
        input.lifecycleDecision
          .stabilizationConfidence,

      next_case_status:
        input.lifecycleDecision
          .nextStatus,

      institutional_traceability: true,

      executive_visibility_enabled:
        visibilityLevel ===
        'EXECUTIVE',

      governance_boundary:
        'NON_PUNITIVE_CONTINUITY_GOVERNANCE',
    },
  })
}

function resolveInterventionSeverity(
  input: {
    continuityRisk: ContinuityRisk
    actionStatus: string
    commandVisibility: boolean
  }
): AuditSeverity {
  if (
    input.continuityRisk ===
      'CRITICAL' ||
    input.actionStatus ===
      'ESCALATION_REQUIRED'
  ) {
    return 'CRITICAL'
  }

  if (
    input.continuityRisk ===
      'HIGH' ||
    input.commandVisibility
  ) {
    return 'HIGH'
  }

  if (
    input.continuityRisk ===
    'MODERATE'
  ) {
    return 'MODERATE'
  }

  return 'LOW'
}

function resolveInterventionGovernancePosture(
  input: {
    continuityRisk: ContinuityRisk
    actionStatus: string
    commandVisibility: boolean
    shouldEscalate: boolean
  }
) {
  if (
    input.continuityRisk ===
      'CRITICAL' ||
    input.actionStatus ===
      'ESCALATION_REQUIRED' ||
    input.shouldEscalate
  ) {
    return 'EXECUTIVE_REVIEW'
  }

  if (
    input.continuityRisk ===
      'HIGH' ||
    input.commandVisibility ||
    input.actionStatus ===
      'FOLLOW_UP_REQUIRED' ||
    input.actionStatus ===
      'INTERRUPTED'
  ) {
    return 'GOVERNANCE_WATCH'
  }

  if (
    input.continuityRisk ===
    'MODERATE'
  ) {
    return 'RECOVERY_MONITORING'
  }

  return 'ACTION_EVIDENCE_HOLDING'
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

function IntelligenceCard({
  title,
  value,
  description,
}: {
  title: string
  value: number
  description: string
}) {
  return (
    <div style={styles.intelligenceCard}>
      <p style={styles.intelligenceTitle}>
        {title}
      </p>

      <h2 style={styles.intelligenceValue}>
        {value}
      </h2>

      <p
        style={
          styles.intelligenceDescription
        }
      >
        {description}
      </p>
    </div>
  )
}

function Select({
  label,
  placeholder,
  value,
  setValue,
  options,
}: {
  label: string
  placeholder: string
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
        <option value="">
          {placeholder}
        </option>

        {options.map(
          (option, index) => (
            <option
              key={`${option}-${index}`}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>
    </label>
  )
}

const styles: Record<
  string,
  CSSProperties
> = {
  page: {
    minHeight: '100vh',
    color: 'white',
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
    fontSize:
      'clamp(34px, 6vw, 58px)',
    lineHeight: 1.05,
    margin: '12px 0',
  },

  subtitle: {
    color: '#cbd5e1',
    maxWidth: '960px',
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
    gridTemplateColumns:
      'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px',
    marginBottom: '18px',
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

  intelligenceGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
    marginBottom: '26px',
  },

  intelligenceCard: {
    background: '#020617',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
  },

  intelligenceTitle: {
    color: '#cbd5e1',
    fontWeight: 800,
    margin: 0,
  },

  intelligenceValue: {
    fontSize: '32px',
    margin: '10px 0',
  },

  intelligenceDescription: {
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: 0,
    fontSize: '14px',
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
    gridTemplateColumns:
      'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },

  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
    boxShadow:
      '0 24px 70px rgba(0,0,0,0.35)',
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
    lineHeight: 1.7,
    minHeight: '620px',
  },
}