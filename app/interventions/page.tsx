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

const ACTION_CHANNELS = [
  'Continuity owner confirmation',
  'Operational dependency coordination',
  'Executive escalation routing',
  'Institutional action confirmation',
  'Recovery pathway preparation',
  'Cross-function stabilization coordination',
  'Action barrier review',
  'Command visibility preservation',
  'Governance escalation coordination',
  'Stabilization pathway synchronization',
]

const ACTION_STATUSES = [
  'COMPLETED',
  'PARTIALLY_COMPLETED',
  'INTERRUPTED',
  'FOLLOW_UP_REQUIRED',
  'ESCALATION_REQUIRED',
]

const EVIDENCE_POSTURES = [
  'Action recorded with sufficient movement evidence',
  'Action partially evidenced; follow-up required',
  'Action attempted but blocked by operational barrier',
  'Action requires escalation before stabilization can continue',
  'Action completed but continuity risk remains active',
]

const OWNER_VISIBILITIES = [
  'Owner confirmed and action moving',
  'Owner confirmed but follow-up required',
  'Owner unclear; governance review required',
  'Owner blocked by dependency',
  'Executive owner visibility required',
]

const RISK_REMAINING = [
  'Residual risk is low; monitor through normal lifecycle review.',
  'Residual risk is moderate; recovery watch should remain active.',
  'Residual risk is high; governance follow-up is required.',
  'Residual risk is critical; executive visibility is required.',
  'Residual risk cannot be reduced until dependency is resolved.',
]

const REVIEW_TIMINGS = [
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
  const [interventions, setInterventions] = useState<InterventionRecord[]>([])

  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [actionType, setActionType] = useState('')
  const [actionChannel, setActionChannel] = useState('')
  const [actionStatus, setActionStatus] = useState('')
  const [evidencePosture, setEvidencePosture] = useState('')
  const [ownerVisibility, setOwnerVisibility] = useState('')
  const [riskRemaining, setRiskRemaining] = useState('')
  const [reviewTiming, setReviewTiming] = useState('')
  const [stabilizationMovementScore, setStabilizationMovementScore] = useState('3')
  const [continuityRisk, setContinuityRisk] = useState<ContinuityRisk>('MODERATE')
  const [governanceInterpretation, setGovernanceInterpretation] = useState('')

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

  const selectedCase = cases.find((item) => item.id === selectedCaseId)

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

    const dependencyBarriers = interventions.filter((item) =>
      item.intervention_summary?.toLowerCase().includes('dependency')
    ).length

    const recurrenceCases = cases.filter(
      (item) => item.case_status === 'ROUTING_RECURRENCE'
    ).length

    return {
      interruptedActions,
      escalationActions,
      followUpActions,
      dependencyBarriers,
      recurrenceCases,
    }
  }, [cases, interventions])

  const activeActionCases = cases.length

  const criticalCases = cases.filter((item) => item.severity_level === 'CRITICAL').length

  const executiveVisibilityCases = cases.filter(
    (item) =>
      item.safeguarding_flag ||
      item.severity_level === 'CRITICAL' ||
      item.case_status === 'ROUTING_RECURRENCE' ||
      item.case_status === 'ESCALATED'
  ).length

  const routedCases = cases.filter((item) =>
    ROUTED_OR_ASSIGNED_STATUSES.includes(item.case_status)
  ).length

  const lifecycleDecision = evaluateInterventionLifecycle({
    completionStatus: actionStatus,
    continuityRisk,
  })

  const commandVisibilityLabel = buildCommandVisibilityLabel({
    continuityRisk,
    actionStatus,
    commandVisibility: lifecycleDecision.commandVisibility,
  })

  const executiveMeaning = buildExecutiveMeaning({
    actionStatus,
    evidencePosture,
    ownerVisibility,
    continuityRisk,
    stabilizationMovementScore,
    commandVisibility: lifecycleDecision.commandVisibility,
    recurrenceCases: actionPressure.recurrenceCases,
    followUpActions: actionPressure.followUpActions,
    escalationActions: actionPressure.escalationActions,
  })

  const pressureMeaning = buildPressureMeaning({
    followUpActions: actionPressure.followUpActions,
    escalationActions: actionPressure.escalationActions,
    interruptedActions: actionPressure.interruptedActions,
    recurrenceCases: actionPressure.recurrenceCases,
    dependencyBarriers: actionPressure.dependencyBarriers,
  })

  function buildCaseLabel(caseItem: StabilityCase) {
    return `${caseItem.beneficiary_name} • ${caseItem.support_domain} • ${caseItem.case_status}`
  }

  function actionSynthesis() {
    return `
ACTION MOVEMENT
${actionStatus || 'Awaiting action movement selection'}

OWNER VISIBILITY
${ownerVisibility || 'Awaiting owner visibility selection'}

EVIDENCE POSTURE
${evidencePosture || 'Awaiting evidence posture selection'}

RISK REMAINING
${riskRemaining || 'Awaiting residual risk selection'}

REVIEW TIMING
${reviewTiming || 'Awaiting review timing selection'}

EXECUTIVE MEANING
${executiveMeaning}

PRESSURE CONCENTRATION
${pressureMeaning}

COMMAND VISIBILITY
${commandVisibilityLabel}

NEXT LIFECYCLE STATE
${selectedCase ? lifecycleDecision.nextStatus : 'Pending stability case selection'}

STABILIZATION CONFIDENCE
${lifecycleDecision.stabilizationConfidence}

CASE SIGNAL
${selectedCase?.beneficiary_name || 'Pending stability case selection'}

STABILITY DOMAIN
${selectedCase?.support_domain || 'Pending stability case selection'}

CURRENT CONTINUITY STATUS
${selectedCase?.case_status || 'Pending stability case selection'}

ACTION TYPE
${actionType || 'Awaiting action type selection'}

ACTION CHANNEL
${actionChannel || 'Awaiting action channel selection'}

GOVERNANCE INTERPRETATION
${governanceInterpretation.trim() || 'No additional governance interpretation entered.'}

LIFECYCLE BOUNDARY
Routing is not action.
Action is not outcome.
Outcome is not recovery.
    `.trim()
  }

  async function preserveStabilizationActionEvidence() {
    if (!selectedCaseId) {
      alert('Select a stability case.')
      return
    }

    if (
      !actionType ||
      !actionChannel ||
      !actionStatus ||
      !evidencePosture ||
      !ownerVisibility ||
      !riskRemaining ||
      !reviewTiming
    ) {
      alert('Complete all required stabilization action governance fields.')
      return
    }

    if (!selectedCase) {
      alert('Selected stability case could not be found.')
      return
    }

    setLoading(true)
    setMessage('')

    const evidence = actionSynthesis()

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

    const { error: timelineError } = await supabase.from('case_timeline').insert({
      case_id: selectedCaseId,
      event_type: lifecycleDecision.timelineEventType,
      event_summary: `${lifecycleDecision.timelineSummary} Action movement: ${actionStatus}. Continuity risk: ${continuityRisk}. Executive meaning: ${executiveMeaning}`,
      actor: 'TSINAXA CGI Stabilization Action Governance',
    })

    if (timelineError) {
      alert(timelineError.message)
      setLoading(false)
      return
    }

    await preserveInterventionGovernanceEvidence({
      caseItem: selectedCase,
      interventionRecordId: interventionRecord?.id || null,
      lifecycleDecision,
      actionType,
      actionChannel,
      actionStatus,
      evidencePosture,
      ownerVisibility,
      riskRemaining,
      reviewTiming,
      stabilizationMovementScore,
      continuityRisk,
      governanceInterpretation,
      executiveMeaning,
      pressureMeaning,
      commandVisibilityLabel,
    })

    setSelectedCaseId('')
    setActionType('')
    setActionChannel('')
    setActionStatus('')
    setEvidencePosture('')
    setOwnerVisibility('')
    setRiskRemaining('')
    setReviewTiming('')
    setStabilizationMovementScore('3')
    setContinuityRisk('MODERATE')
    setGovernanceInterpretation('')

    setMessage(
      'Stabilization action evidence preserved. Executive meaning, continuity pressure, lifecycle movement, and audit memory are now visible.'
    )

    setLoading(false)

    await loadCases()
    await loadInterventions()
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • STABILIZATION ACTION GOVERNANCE</p>

          <h1 style={styles.title}>Stabilization Action Governance</h1>

          <p style={styles.subtitle}>
            Convert routed instability into governed action evidence, derive executive
            meaning, preserve residual risk, expose stalled action pressure, and protect
            the boundary between action, outcome, and recovery.
          </p>

          <div style={styles.boundaryBox}>
            <strong>Boundary:</strong> /interventions governs stabilization action
            evidence only. It does not verify outcomes, declare recovery, or close
            continuity instability.
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Cases Ready For Action" value={activeActionCases} />
          <Metric label="Routed / Assigned Cases" value={routedCases} />
          <Metric label="Critical Continuity Cases" value={criticalCases} />
          <Metric label="Executive Visibility Cases" value={executiveVisibilityCases} />
        </section>

        <p style={styles.visibilityNote}>
          Executive visibility may arise from recurrence, governance sensitivity,
          escalation concentration, or continuity exposure — not severity alone.
        </p>

        <section style={styles.intelligenceGrid}>
          <IntelligenceCard
            title="Interrupted Actions"
            value={actionPressure.interruptedActions}
            description="Action pathways interrupted before stabilization movement became credible."
          />

          <IntelligenceCard
            title="Escalation Pressure"
            value={actionPressure.escalationActions}
            description="Actions requiring executive or governance escalation."
          />

          <IntelligenceCard
            title="Follow-Up Accumulation"
            value={actionPressure.followUpActions}
            description="Actions requiring continuity follow-up before recovery evaluation."
          />

          <IntelligenceCard
            title="Recurrence Concentration"
            value={actionPressure.recurrenceCases}
            description="Cases repeatedly re-entering routing or instability pathways."
          />

          <IntelligenceCard
            title="Stalled Action Visibility"
            value={actionPressure.dependencyBarriers}
            description="Action evidence showing unresolved dependency barriers or stalled movement."
          />
        </section>

        <section style={styles.pressurePanel}>
          <h2 style={styles.sectionTitle}>Continuity Action Intelligence</h2>
          <p style={styles.panelNote}>{pressureMeaning}</p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Preserve Action Evidence</h2>

            <p style={styles.panelNote}>
              Use this after routed instability receives real stabilization action.
              Preserve movement, owner visibility, evidence posture, risk remaining,
              review timing, and executive meaning.
            </p>

            <label style={styles.label}>
              Stability Case
              <select
                value={selectedCaseId}
                onChange={(event) => setSelectedCaseId(event.target.value)}
                style={styles.select}
              >
                <option value="">Select stability case</option>

                {cases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
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
              label="Action Channel"
              placeholder="Select action channel"
              value={actionChannel}
              setValue={setActionChannel}
              options={ACTION_CHANNELS}
            />

            <Select
              label="Action Movement"
              placeholder="Select action movement"
              value={actionStatus}
              setValue={setActionStatus}
              options={ACTION_STATUSES}
            />

            <Select
              label="Evidence Posture"
              placeholder="Select evidence posture"
              value={evidencePosture}
              setValue={setEvidencePosture}
              options={EVIDENCE_POSTURES}
            />

            <Select
              label="Owner Visibility"
              placeholder="Select owner visibility"
              value={ownerVisibility}
              setValue={setOwnerVisibility}
              options={OWNER_VISIBILITIES}
            />

            <Select
              label="Risk Remaining"
              placeholder="Select risk remaining"
              value={riskRemaining}
              setValue={setRiskRemaining}
              options={RISK_REMAINING}
            />

            <Select
              label="Review Timing"
              placeholder="Select review timing"
              value={reviewTiming}
              setValue={setReviewTiming}
              options={REVIEW_TIMINGS}
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
              label="Continuity Risk"
              placeholder="Select continuity risk"
              value={continuityRisk}
              setValue={(value) => setContinuityRisk(value as ContinuityRisk)}
              options={CONTINUITY_RISKS}
            />

            <label style={styles.label}>
              Governance Interpretation
              <textarea
                value={governanceInterpretation}
                onChange={(event) => setGovernanceInterpretation(event.target.value)}
                placeholder="Use operational facts only. Preserve continuity visibility, executive meaning, and governance relevance."
                style={styles.textarea}
              />
            </label>

            <button
              onClick={preserveStabilizationActionEvidence}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading
                ? 'Preserving Governance Evidence...'
                : 'Preserve Stabilization Action Evidence'}
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Executive Action Synthesis</h2>

            <p style={styles.panelNote}>
              This synthesis generates before and after case selection. It preserves
              movement, risk, owner visibility, executive meaning, pressure
              concentration, and lifecycle boundary discipline.
            </p>

            <pre style={styles.summaryBox}>{actionSynthesis()}</pre>
          </div>
        </section>
      </div>
    </main>
  )
}

async function preserveInterventionGovernanceEvidence(input: {
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
  actionChannel: string
  actionStatus: string
  evidencePosture: string
  ownerVisibility: string
  riskRemaining: string
  reviewTiming: string
  stabilizationMovementScore: string
  continuityRisk: ContinuityRisk
  governanceInterpretation: string
  executiveMeaning: string
  pressureMeaning: string
  commandVisibilityLabel: string
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

  const summary = `Preserved stabilization action evidence for ${input.caseItem.beneficiary_name}. ${input.executiveMeaning}`

  const { error } = await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    email: user?.email ?? null,
    role: 'INTERVENTION_GOVERNANCE_USER',

    action_type: 'PRESERVE_STABILIZATION_ACTION_EVIDENCE',
    route: '/interventions',
    record_type: 'beneficiary_cases',
    record_id: input.caseItem.id,
    summary,
    severity,

    details: {
      evidence_type: 'GOVERNED_STABILIZATION_ACTION_EVIDENCE',
      governance_posture: governancePosture,
      visibility_level: visibilityLevel,
      governance_institution: institution,

      stability_case_id: input.caseItem.id,
      intervention_record_id: input.interventionRecordId,

      case_signal: input.caseItem.beneficiary_name,
      stability_domain: input.caseItem.support_domain,
      previous_case_status: input.caseItem.case_status,
      next_case_status: input.lifecycleDecision.nextStatus,

      action_type: input.actionType,
      action_channel: input.actionChannel,
      action_movement: input.actionStatus,
      evidence_posture: input.evidencePosture,
      owner_visibility: input.ownerVisibility,
      risk_remaining: input.riskRemaining,
      review_timing: input.reviewTiming,

      stabilization_movement_score: Number(input.stabilizationMovementScore),
      continuity_risk: input.continuityRisk,
      stabilization_confidence: input.lifecycleDecision.stabilizationConfidence,

      executive_meaning: input.executiveMeaning,
      command_visibility_interpretation: input.commandVisibilityLabel,
      pressure_concentration: input.pressureMeaning,
      governance_interpretation: input.governanceInterpretation.trim() || null,

      escalation_required: input.lifecycleDecision.shouldEscalate,
      recovery_monitoring_required: input.lifecycleDecision.shouldMonitorRecovery,
      command_visibility_required: input.lifecycleDecision.commandVisibility,

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
    console.error('Stabilization action governance evidence logging failed', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
  }
}

function buildCommandVisibilityLabel(input: {
  continuityRisk: ContinuityRisk
  actionStatus: string
  commandVisibility: boolean
}) {
  if (
    input.continuityRisk === 'CRITICAL' ||
    input.actionStatus === 'ESCALATION_REQUIRED'
  ) {
    return 'REQUIRED'
  }

  if (input.continuityRisk === 'HIGH' || input.commandVisibility) {
    return 'ACTIVE GOVERNANCE WATCH'
  }

  if (input.continuityRisk === 'MODERATE') {
    return 'ADVISED IF PRESSURE CONTINUES'
  }

  return 'NORMAL'
}

function buildExecutiveMeaning(input: {
  actionStatus: string
  evidencePosture: string
  ownerVisibility: string
  continuityRisk: ContinuityRisk
  stabilizationMovementScore: string
  commandVisibility: boolean
  recurrenceCases: number
  followUpActions: number
  escalationActions: number
}) {
  if (!input.actionStatus && !input.evidencePosture && !input.ownerVisibility) {
    return 'Awaiting action selections. Executive meaning will derive from movement, owner visibility, evidence posture, residual risk, and continuity pressure.'
  }

  if (
    input.actionStatus === 'ESCALATION_REQUIRED' ||
    input.continuityRisk === 'CRITICAL'
  ) {
    return 'Executive visibility is required due to survivability-level continuity exposure. Governance action must remain active before outcome verification or recovery credibility can be considered.'
  }

  if (input.continuityRisk === 'HIGH' || input.commandVisibility) {
    return 'Executive visibility should remain active until stabilization credibility improves. Action evidence exists, but continuity exposure remains material.'
  }

  if (
    input.actionStatus === 'FOLLOW_UP_REQUIRED' ||
    input.evidencePosture.includes('follow-up') ||
    input.followUpActions > 0
  ) {
    return 'Stabilization movement exists, but continuity credibility is not yet durable. Executive visibility is advised if recurrence, follow-up accumulation, or governance sensitivity continues increasing.'
  }

  if (
    input.actionStatus === 'INTERRUPTED' ||
    input.evidencePosture.includes('blocked') ||
    input.ownerVisibility.includes('blocked')
  ) {
    return 'Action movement is stalled or interrupted. The instability pathway remains exposed until the operational barrier is resolved and movement evidence becomes credible.'
  }

  if (Number(input.stabilizationMovementScore) >= 4 && input.continuityRisk === 'LOW') {
    return 'Stabilization movement appears credible at action level. Executive visibility is not currently required, but outcome verification is still required before recovery can be declared.'
  }

  if (input.recurrenceCases > 0 || input.escalationActions > 0) {
    return 'Action movement is occurring inside a pressure environment. Recurrence or escalation concentration may weaken stabilization durability if not monitored.'
  }

  return 'Stabilization action has been preserved. Continuity movement is visible, but outcome verification and recovery durability remain separate governance stages.'
}

function buildPressureMeaning(input: {
  followUpActions: number
  escalationActions: number
  interruptedActions: number
  recurrenceCases: number
  dependencyBarriers: number
}) {
  const signals: string[] = []

  if (input.followUpActions > 0) {
    signals.push('follow-up accumulation is present')
  }

  if (input.escalationActions > 0) {
    signals.push('escalation pressure is active')
  }

  if (input.interruptedActions > 0) {
    signals.push('interrupted action pathways are visible')
  }

  if (input.recurrenceCases > 0) {
    signals.push('routing recurrence is concentrating')
  }

  if (input.dependencyBarriers > 0) {
    signals.push('dependency barriers are slowing action credibility')
  }

  if (signals.length === 0) {
    return 'No material continuity action pressure is currently visible from preserved action evidence.'
  }

  return `Continuity action pressure is active: ${signals.join(', ')}. Executive review should watch whether action evidence converts into verified outcomes or continues to recycle into follow-up, recurrence, or escalation.`
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <h2 style={styles.metricValue}>{value}</h2>
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
      <p style={styles.intelligenceTitle}>{title}</p>
      <h2 style={styles.intelligenceValue}>{value}</h2>
      <p style={styles.intelligenceDescription}>{description}</p>
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
        onChange={(event) => setValue(event.target.value)}
        style={styles.select}
      >
        <option value="">{placeholder}</option>

        {options.map((option, index) => (
          <option key={`${option}-${index}`} value={option}>
            {option}
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
    fontSize: 'clamp(34px, 6vw, 58px)',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px',
    marginBottom: '10px',
  },
  visibilityNote: {
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: '0 0 20px',
    fontSize: '14px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    marginBottom: '22px',
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
  pressurePanel: {
    background: '#020617',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '24px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },
  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
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
    lineHeight: 1.7,
    minHeight: '620px',
  },
}