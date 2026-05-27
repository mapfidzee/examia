'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { evaluateOutcomeLifecycle } from '../../lib/lifecycleGovernance'
import { supabase } from '../../lib/supabase'

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
  intervention_summary: string | null
  outcome_summary: string | null
  created_at?: string | null
  updated_at?: string | null
}

type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
  created_at?: string | null
}

type AuditSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

const GOVERNANCE_INSTITUTION = 'TSINAXA CGI'

const OUTCOME_READY_STATUSES = [
  'INTERVENTION_ACTIVE',
  'INTERVENTION_RECORDED',
  'PARTIAL_STABILIZATION',
  'STABILIZING',
  'ESCALATED',
  'RECOVERY_MONITORING',
  'FOLLOW_UP_REQUIRED',
  'CONTINUITY_RISK_ACTIVE',
  'STABILIZATION_OWNER_ROUTED',
  'ROUTING_RECURRENCE',
]

const VERIFICATION_RESULTS = [
  'VERIFIED_STABILIZATION',
  'PARTIAL_VERIFICATION',
  'UNVERIFIED_IMPROVEMENT',
  'RECURRENCE_DETECTED',
  'ACTION_INEFFECTIVE',
  'ESCALATION_REQUIRED',
]

const ACTION_IMPACTS = [
  'Action produced credible stabilization movement',
  'Action produced partial stabilization movement',
  'Action produced temporary improvement only',
  'Action did not materially reduce instability',
  'Action exposed recurrence after movement',
  'Action requires escalation before verification can continue',
]

const VERIFICATION_CREDIBILITIES = [
  'STRONG',
  'MODERATE',
  'WEAK',
  'UNCERTAIN',
  'CONFLICTED',
]

const RECURRENCE_SIGNALS = [
  'NO_RECURRENCE_VISIBLE',
  'RECURRENCE_WATCH',
  'RECURRENCE_DETECTED',
  'REPEATED_RECURRENCE',
]

const RECOVERY_READINESS = [
  'NOT_READY_FOR_RECOVERY',
  'RECOVERY_WATCH_ELIGIBLE',
  'RECOVERY_MONITORING_RECOMMENDED',
  'RECOVERY_BLOCKED',
]

const CONTINUITY_OUTLOOKS = [
  'STABLE',
  'MONITOR',
  'AT_RISK',
  'UNSTABLE',
  'ESCALATE',
  'HIGH_RISK',
]

const VERIFICATION_TRAJECTORIES = [
  'IMPROVING',
  'STABLE',
  'FRAGILE',
  'WEAKENING',
  'DESTABILIZING',
]

export default function OutcomesPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
        'INSTITUTION_COORDINATOR',
      ]}
    >
      <CGIGovernanceShell>
        <OutcomesContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function OutcomesContent() {
  const [cases, setCases] = useState<StabilityCase[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])

  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [verificationResult, setVerificationResult] = useState('')
  const [actionImpact, setActionImpact] = useState('')
  const [verificationCredibility, setVerificationCredibility] = useState('MODERATE')
  const [recurrenceSignal, setRecurrenceSignal] = useState('RECURRENCE_WATCH')
  const [recoveryReadiness, setRecoveryReadiness] = useState('NOT_READY_FOR_RECOVERY')
  const [continuityOutlook, setContinuityOutlook] = useState('MONITOR')
  const [verificationTrajectory, setVerificationTrajectory] = useState('FRAGILE')
  const [verificationInterpretation, setVerificationInterpretation] = useState('')

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCases()
    loadOutcomes()
  }, [])

  async function loadCases() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .in('case_status', OUTCOME_READY_STATUSES)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setCases(data || [])
  }

  async function loadOutcomes() {
    const { data, error } = await supabase
      .from('case_outcomes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setOutcomes(data || [])
  }

  const selectedCase = useMemo(() => {
    return cases.find((item) => item.id === selectedCaseId)
  }, [cases, selectedCaseId])

  const mappedOutcomeStatus = mapVerificationToLifecycleStatus(verificationResult)

  const lifecycleDecision = evaluateOutcomeLifecycle({
    outcomeStatus: mappedOutcomeStatus,
    continuityOutlook,
  })

  const outcomePressure = useMemo(() => {
    const verified = outcomes.filter((item) =>
      item.outcome_summary?.includes('VERIFIED_STABILIZATION')
    ).length

    const partialOrUncertain = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes('PARTIAL_VERIFICATION') ||
        item.outcome_summary?.includes('UNVERIFIED_IMPROVEMENT') ||
        item.outcome_summary?.includes('UNCERTAIN') ||
        item.outcome_summary?.includes('CONFLICTED')
    ).length

    const recurrenceDetected = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes('RECURRENCE_DETECTED') ||
        item.outcome_summary?.includes('REPEATED_RECURRENCE')
    ).length

    const escalationRequired = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes('ESCALATION_REQUIRED') ||
        item.outcome_summary?.includes('HIGH_RISK')
    ).length

    const recoveryEligible = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes('RECOVERY_WATCH_ELIGIBLE') ||
        item.outcome_summary?.includes('RECOVERY_MONITORING_RECOMMENDED')
    ).length

    const weakeningVerification = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes('WEAKENING') ||
        item.outcome_summary?.includes('DESTABILIZING') ||
        item.outcome_summary?.includes('FRAGILE')
    ).length

    return {
      verified,
      partialOrUncertain,
      recurrenceDetected,
      escalationRequired,
      recoveryEligible,
      weakeningVerification,
    }
  }, [outcomes])

  const commandPosture = buildCommandPosture({
    verificationResult,
    verificationCredibility,
    recurrenceSignal,
    recoveryReadiness,
    continuityOutlook,
    verificationTrajectory,
    commandVisibility: lifecycleDecision.commandVisibility,
  })

  const stabilizationConfidence = buildStabilizationConfidence({
    verificationResult,
    verificationCredibility,
    recurrenceSignal,
    recoveryReadiness,
    continuityOutlook,
    verificationTrajectory,
  })

  const survivabilitySignal = buildSurvivabilitySignal({
    verificationResult,
    verificationCredibility,
    recurrenceSignal,
    recoveryReadiness,
    continuityOutlook,
    verificationTrajectory,
    escalationPressure: outcomePressure.escalationRequired,
    recurrencePressure: outcomePressure.recurrenceDetected,
    partialPressure: outcomePressure.partialOrUncertain,
  })

  const executiveMeaning = buildExecutiveVerificationMeaning({
    verificationResult,
    actionImpact,
    verificationCredibility,
    recurrenceSignal,
    recoveryReadiness,
    continuityOutlook,
    verificationTrajectory,
    commandPosture,
    survivabilitySignal,
  })

  const verificationPressureMeaning = buildVerificationPressureMeaning({
    partialOrUncertain: outcomePressure.partialOrUncertain,
    recurrenceDetected: outcomePressure.recurrenceDetected,
    escalationRequired: outcomePressure.escalationRequired,
    recoveryEligible: outcomePressure.recoveryEligible,
    weakeningVerification: outcomePressure.weakeningVerification,
  })

  function buildCaseLabel(caseItem: StabilityCase) {
    return `${caseItem.beneficiary_name} • ${caseItem.support_domain} • ${caseItem.case_status}`
  }

  function verificationSynthesis() {
    return `
VERIFICATION RESULT
${verificationResult || 'Awaiting verification result selection'}

ACTION IMPACT
${actionImpact || 'Awaiting action impact selection'}

VERIFICATION CREDIBILITY
${verificationCredibility}

VERIFICATION TRAJECTORY
${verificationTrajectory}

RECURRENCE SIGNAL
${recurrenceSignal}

RECOVERY READINESS
${recoveryReadiness}

CONTINUITY OUTLOOK
${continuityOutlook}

COMMAND POSTURE
${commandPosture}

STABILIZATION CONFIDENCE
${stabilizationConfidence}

SURVIVABILITY SIGNAL
${survivabilitySignal}

EXECUTIVE MEANING
${executiveMeaning}

VERIFICATION PRESSURE
${verificationPressureMeaning}

NEXT LIFECYCLE STATE
${selectedCase ? lifecycleDecision.nextStatus : 'Pending stability case selection'}

CASE SIGNAL
${selectedCase?.beneficiary_name || 'Pending stability case selection'}

STABILITY DOMAIN
${selectedCase?.support_domain || 'Pending stability case selection'}

CURRENT CONTINUITY STATUS
${selectedCase?.case_status || 'Pending stability case selection'}

GOVERNANCE INTERPRETATION
${verificationInterpretation.trim() || 'No additional verification interpretation entered.'}

LIFECYCLE BOUNDARY
Action is not outcome.
Outcome is not recovery.
Verification may support recovery monitoring, but durable recovery must be confirmed separately.
    `.trim()
  }

  async function preserveVerificationIntelligence() {
    if (!selectedCaseId) {
      alert('Select a stability case.')
      return
    }

    if (
      !verificationResult ||
      !actionImpact ||
      !verificationCredibility ||
      !recurrenceSignal ||
      !recoveryReadiness ||
      !continuityOutlook ||
      !verificationTrajectory
    ) {
      alert('Complete all stabilization verification fields.')
      return
    }

    if (!selectedCase) {
      alert('Selected stability case could not be found.')
      return
    }

    setLoading(true)
    setMessage('')

    const summary = verificationSynthesis()

    const { data: outcomeRecord, error: outcomeError } = await supabase
      .from('case_outcomes')
      .insert({
        case_id: selectedCaseId,
        outcome_status: verificationResult,
        outcome_summary: summary,
      })
      .select('id')
      .single()

    if (outcomeError) {
      alert(outcomeError.message)
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: lifecycleDecision.nextStatus,
        outcome_summary: summary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedCaseId)

    if (updateError) {
      alert(updateError.message)
      setLoading(false)
      return
    }

    const { error: timelineError } = await supabase.from('case_timeline').insert({
      case_id: selectedCaseId,
      event_type: lifecycleDecision.timelineEventType,
      event_summary: `${lifecycleDecision.timelineSummary} Verification result: ${verificationResult}. Credibility: ${verificationCredibility}. Trajectory: ${verificationTrajectory}. Command posture: ${commandPosture}.`,
      actor: 'TSINAXA CGI Stabilization Verification Intelligence',
    })

    if (timelineError) {
      alert(timelineError.message)
      setLoading(false)
      return
    }

    await preserveOutcomeGovernanceEvidence({
      caseItem: selectedCase,
      outcomeRecordId: outcomeRecord?.id || null,
      lifecycleDecision,
      verificationResult,
      actionImpact,
      verificationCredibility,
      recurrenceSignal,
      recoveryReadiness,
      continuityOutlook,
      verificationTrajectory,
      commandPosture,
      stabilizationConfidence,
      survivabilitySignal,
      executiveMeaning,
      verificationPressureMeaning,
      verificationInterpretation,
    })

    setSelectedCaseId('')
    setVerificationResult('')
    setActionImpact('')
    setVerificationCredibility('MODERATE')
    setRecurrenceSignal('RECURRENCE_WATCH')
    setRecoveryReadiness('NOT_READY_FOR_RECOVERY')
    setContinuityOutlook('MONITOR')
    setVerificationTrajectory('FRAGILE')
    setVerificationInterpretation('')

    setMessage(
      'Stabilization verification preserved. Command posture, verification trajectory, survivability signal, recurrence visibility, and lifecycle memory are now updated.'
    )

    setLoading(false)

    await loadCases()
    await loadOutcomes()
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • STABILIZATION VERIFICATION INTELLIGENCE</p>

          <h1 style={styles.title}>Stabilization Verification Intelligence</h1>

          <p style={styles.subtitle}>
            Verify whether governed stabilization action actually worked. Preserve
            action impact, verification credibility, verification trajectory, recurrence
            signals, recovery readiness, command posture, survivability meaning, and
            lifecycle movement without declaring durable recovery prematurely.
          </p>

          <div style={styles.boundaryBox}>
            <strong>Boundary:</strong> /outcomes verifies stabilization impact. It does
            not declare durable recovery, close continuity instability, or replace
            recovery monitoring.
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.metricsGrid}>
          <Metric label="Cases Awaiting Verification" value={cases.length} />
          <Metric label="Verified Stabilization" value={outcomePressure.verified} />
          <Metric label="Partial / Uncertain Verification" value={outcomePressure.partialOrUncertain} />
          <Metric label="Recurrence Detected" value={outcomePressure.recurrenceDetected} />
          <Metric label="Escalation Required" value={outcomePressure.escalationRequired} />
          <Metric label="Recovery Watch Eligible" value={outcomePressure.recoveryEligible} />
          <Metric label="Weakening Verification" value={outcomePressure.weakeningVerification} />
        </section>

        <section style={styles.pressurePanel}>
          <h2 style={styles.sectionTitle}>Verification Pressure Intelligence</h2>
          <p style={styles.panelNote}>{verificationPressureMeaning}</p>
        </section>

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Preserve Verification Evidence</h2>

            <p style={styles.panelNote}>
              Use this after stabilization action has occurred. Verify whether movement
              is credible, partial, uncertain, recurring, ineffective, weakening, or
              ready for recovery watch.
            </p>

            <label style={styles.label}>
              Stability Case
              <select
                value={selectedCaseId}
                onChange={(event) => setSelectedCaseId(event.target.value)}
                style={styles.select}
              >
                <option value="">
                  {cases.length === 0 ? 'No action-stage cases found' : 'Select stability case'}
                </option>

                {cases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {buildCaseLabel(item)}
                  </option>
                ))}
              </select>
            </label>

            <Select
              label="Verification Result"
              placeholder="Select verification result"
              value={verificationResult}
              setValue={setVerificationResult}
              options={VERIFICATION_RESULTS}
            />

            <Select
              label="Action Impact"
              placeholder="Select action impact"
              value={actionImpact}
              setValue={setActionImpact}
              options={ACTION_IMPACTS}
            />

            <Select
              label="Verification Credibility"
              placeholder="Select verification credibility"
              value={verificationCredibility}
              setValue={setVerificationCredibility}
              options={VERIFICATION_CREDIBILITIES}
            />

            <Select
              label="Verification Trajectory"
              placeholder="Select verification trajectory"
              value={verificationTrajectory}
              setValue={setVerificationTrajectory}
              options={VERIFICATION_TRAJECTORIES}
            />

            <Select
              label="Recurrence Signal"
              placeholder="Select recurrence signal"
              value={recurrenceSignal}
              setValue={setRecurrenceSignal}
              options={RECURRENCE_SIGNALS}
            />

            <Select
              label="Recovery Readiness"
              placeholder="Select recovery readiness"
              value={recoveryReadiness}
              setValue={setRecoveryReadiness}
              options={RECOVERY_READINESS}
            />

            <Select
              label="Continuity Outlook"
              placeholder="Select continuity outlook"
              value={continuityOutlook}
              setValue={setContinuityOutlook}
              options={CONTINUITY_OUTLOOKS}
            />

            <label style={styles.label}>
              Verification Interpretation
              <textarea
                value={verificationInterpretation}
                onChange={(event) => setVerificationInterpretation(event.target.value)}
                placeholder="Use operational facts only. Preserve verification credibility, recurrence visibility, recovery readiness, command posture, survivability meaning, and executive relevance."
                style={styles.textarea}
              />
            </label>

            <button
              onClick={preserveVerificationIntelligence}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading
                ? 'Preserving Verification Intelligence...'
                : 'Preserve Stabilization Verification'}
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Executive Verification Synthesis</h2>

            <p style={styles.panelNote}>
              This synthesis preserves whether action impact is verified, partial,
              uncertain, recurring, ineffective, weakening, or ready for recovery
              monitoring.
            </p>

            <pre style={styles.summaryBox}>{verificationSynthesis()}</pre>
          </div>
        </section>
      </div>
    </main>
  )
}

async function preserveOutcomeGovernanceEvidence(input: {
  caseItem: StabilityCase
  outcomeRecordId: string | null
  lifecycleDecision: {
    nextStatus: string
    continuityRisk: string
    stabilizationConfidence: string
    shouldEscalate: boolean
    shouldMonitorRecovery: boolean
    commandVisibility: boolean
    timelineEventType: string
    timelineSummary: string
  }
  verificationResult: string
  actionImpact: string
  verificationCredibility: string
  recurrenceSignal: string
  recoveryReadiness: string
  continuityOutlook: string
  verificationTrajectory: string
  commandPosture: string
  stabilizationConfidence: string
  survivabilitySignal: string
  executiveMeaning: string
  verificationPressureMeaning: string
  verificationInterpretation: string
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const institution = input.caseItem.institution_name || GOVERNANCE_INSTITUTION

  const severity = resolveOutcomeAuditSeverity({
    verificationResult: input.verificationResult,
    continuityOutlook: input.continuityOutlook,
    commandPosture: input.commandPosture,
  })

  const { error } = await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    email: user?.email ?? null,
    role: 'OUTCOME_GOVERNANCE_USER',

    action_type: 'PRESERVE_STABILIZATION_VERIFICATION',
    route: '/outcomes',
    record_type: 'beneficiary_cases',
    record_id: input.caseItem.id,
    summary: `Preserved stabilization verification for ${input.caseItem.beneficiary_name}. ${input.executiveMeaning}`,
    severity,

    details: {
      evidence_type: 'STABILIZATION_VERIFICATION_INTELLIGENCE',
      governance_institution: institution,

      stability_case_id: input.caseItem.id,
      outcome_record_id: input.outcomeRecordId,

      case_signal: input.caseItem.beneficiary_name,
      stability_domain: input.caseItem.support_domain,
      previous_case_status: input.caseItem.case_status,
      next_case_status: input.lifecycleDecision.nextStatus,

      verification_result: input.verificationResult,
      action_impact: input.actionImpact,
      verification_credibility: input.verificationCredibility,
      verification_trajectory: input.verificationTrajectory,
      recurrence_signal: input.recurrenceSignal,
      recovery_readiness: input.recoveryReadiness,
      continuity_outlook: input.continuityOutlook,
      command_posture: input.commandPosture,
      stabilization_confidence_interpretation: input.stabilizationConfidence,
      survivability_signal: input.survivabilitySignal,

      continuity_risk: input.lifecycleDecision.continuityRisk,
      lifecycle_stabilization_confidence: input.lifecycleDecision.stabilizationConfidence,
      escalation_required: input.lifecycleDecision.shouldEscalate,
      recovery_monitoring_required: input.lifecycleDecision.shouldMonitorRecovery,
      command_visibility_required: input.lifecycleDecision.commandVisibility,

      executive_meaning: input.executiveMeaning,
      verification_pressure: input.verificationPressureMeaning,
      verification_interpretation: input.verificationInterpretation.trim() || null,

      action_is_not_outcome: true,
      outcome_is_not_recovery: true,
      recovery_requires_separate_confirmation: true,
      continuity_memory_preserved: true,
      institutional_traceability: true,
      governance_boundary: 'NON_PUNITIVE_CONTINUITY_GOVERNANCE',
    },
  })

  if (error) {
    console.error('Outcome governance evidence logging failed', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
  }
}

function mapVerificationToLifecycleStatus(verificationResult: string) {
  if (verificationResult === 'VERIFIED_STABILIZATION') return 'STABILIZED'
  if (verificationResult === 'PARTIAL_VERIFICATION') return 'PARTIAL_STABILIZATION'
  if (verificationResult === 'UNVERIFIED_IMPROVEMENT') return 'FOLLOW_UP_REQUIRED'
  if (verificationResult === 'RECURRENCE_DETECTED') return 'CONTINUITY_RISK_ACTIVE'
  if (verificationResult === 'ACTION_INEFFECTIVE') return 'CONTINUITY_RISK_ACTIVE'
  if (verificationResult === 'ESCALATION_REQUIRED') return 'ESCALATION_REQUIRED'

  return 'PARTIAL_STABILIZATION'
}

function buildCommandPosture(input: {
  verificationResult: string
  verificationCredibility: string
  recurrenceSignal: string
  recoveryReadiness: string
  continuityOutlook: string
  verificationTrajectory: string
  commandVisibility: boolean
}) {
  if (
    input.verificationResult === 'ESCALATION_REQUIRED' ||
    input.continuityOutlook === 'HIGH_RISK'
  ) {
    return 'CRITICAL_CONTINUITY_POSTURE'
  }

  if (
    input.verificationResult === 'RECURRENCE_DETECTED' ||
    input.verificationResult === 'ACTION_INEFFECTIVE' ||
    input.recurrenceSignal === 'REPEATED_RECURRENCE' ||
    input.continuityOutlook === 'ESCALATE' ||
    input.verificationTrajectory === 'DESTABILIZING'
  ) {
    return 'EXECUTIVE_REVIEW'
  }

  if (
    input.verificationCredibility === 'WEAK' ||
    input.verificationCredibility === 'CONFLICTED' ||
    input.recurrenceSignal === 'RECURRENCE_DETECTED' ||
    input.recoveryReadiness === 'RECOVERY_BLOCKED' ||
    input.verificationTrajectory === 'WEAKENING'
  ) {
    return 'ELEVATED_REVIEW'
  }

  if (
    input.verificationCredibility === 'UNCERTAIN' ||
    input.recurrenceSignal === 'RECURRENCE_WATCH' ||
    input.recoveryReadiness === 'NOT_READY_FOR_RECOVERY' ||
    input.continuityOutlook === 'MONITOR' ||
    input.verificationTrajectory === 'FRAGILE' ||
    input.commandVisibility
  ) {
    return 'CONTINUITY_WATCH'
  }

  return 'NORMAL_MONITORING'
}

function buildStabilizationConfidence(input: {
  verificationResult: string
  verificationCredibility: string
  recurrenceSignal: string
  recoveryReadiness: string
  continuityOutlook: string
  verificationTrajectory: string
}) {
  if (
    input.verificationResult === 'ESCALATION_REQUIRED' ||
    input.verificationResult === 'ACTION_INEFFECTIVE' ||
    input.continuityOutlook === 'HIGH_RISK' ||
    input.verificationTrajectory === 'DESTABILIZING'
  ) {
    return 'DESTABILIZING'
  }

  if (
    input.verificationResult === 'RECURRENCE_DETECTED' ||
    input.recurrenceSignal === 'REPEATED_RECURRENCE' ||
    input.verificationTrajectory === 'WEAKENING'
  ) {
    return 'FRAGILE'
  }

  if (
    input.verificationResult === 'UNVERIFIED_IMPROVEMENT' ||
    input.verificationCredibility === 'UNCERTAIN' ||
    input.verificationCredibility === 'CONFLICTED'
  ) {
    return 'UNVERIFIED'
  }

  if (
    input.verificationResult === 'PARTIAL_VERIFICATION' ||
    input.recoveryReadiness === 'NOT_READY_FOR_RECOVERY' ||
    input.verificationTrajectory === 'FRAGILE'
  ) {
    return 'CONDITIONAL'
  }

  if (
    input.verificationResult === 'VERIFIED_STABILIZATION' &&
    input.verificationCredibility === 'STRONG' &&
    input.recurrenceSignal === 'NO_RECURRENCE_VISIBLE'
  ) {
    return 'CREDIBLE'
  }

  return 'EMERGING'
}

function buildSurvivabilitySignal(input: {
  verificationResult: string
  verificationCredibility: string
  recurrenceSignal: string
  recoveryReadiness: string
  continuityOutlook: string
  verificationTrajectory: string
  escalationPressure: number
  recurrencePressure: number
  partialPressure: number
}) {
  if (
    input.verificationResult === 'ESCALATION_REQUIRED' ||
    input.continuityOutlook === 'HIGH_RISK' ||
    input.escalationPressure > 0
  ) {
    return 'SURVIVABILITY_RISK_ACTIVE'
  }

  if (
    input.recurrenceSignal === 'REPEATED_RECURRENCE' ||
    input.recurrencePressure > 0 ||
    input.verificationTrajectory === 'DESTABILIZING'
  ) {
    return 'RECURRENCE_THREATENING_DURABILITY'
  }

  if (
    input.verificationCredibility === 'WEAK' ||
    input.verificationCredibility === 'CONFLICTED' ||
    input.verificationTrajectory === 'WEAKENING'
  ) {
    return 'VERIFICATION_CREDIBILITY_WEAKENING'
  }

  if (
    input.recoveryReadiness === 'RECOVERY_WATCH_ELIGIBLE' ||
    input.recoveryReadiness === 'RECOVERY_MONITORING_RECOMMENDED'
  ) {
    return 'RECOVERY_WATCH_POSSIBLE_NOT_CONFIRMED'
  }

  if (input.partialPressure > 0 || input.verificationResult === 'PARTIAL_VERIFICATION') {
    return 'PARTIAL_STABILIZATION_REQUIRES_WATCH'
  }

  return 'NO_SURVIVABILITY_THREAT_VISIBLE'
}

function buildExecutiveVerificationMeaning(input: {
  verificationResult: string
  actionImpact: string
  verificationCredibility: string
  recurrenceSignal: string
  recoveryReadiness: string
  continuityOutlook: string
  verificationTrajectory: string
  commandPosture: string
  survivabilitySignal: string
}) {
  if (!input.verificationResult && !input.actionImpact) {
    return 'Awaiting verification selections. Executive meaning will derive from action impact, credibility, recurrence, recovery readiness, trajectory, and continuity outlook.'
  }

  if (
    input.commandPosture === 'CRITICAL_CONTINUITY_POSTURE' ||
    input.survivabilitySignal === 'SURVIVABILITY_RISK_ACTIVE'
  ) {
    return 'Verification indicates survivability-level continuity exposure. Executive command visibility is required before recovery monitoring can be trusted.'
  }

  if (
    input.commandPosture === 'EXECUTIVE_REVIEW' ||
    input.survivabilitySignal === 'RECURRENCE_THREATENING_DURABILITY'
  ) {
    return 'Verification shows recurrence, ineffective action, or destabilizing movement. Executive review should remain active until action impact becomes credible.'
  }

  if (
    input.commandPosture === 'ELEVATED_REVIEW' ||
    input.survivabilitySignal === 'VERIFICATION_CREDIBILITY_WEAKENING'
  ) {
    return 'Verification credibility is weakening or conflicted. Governance should review whether action must restart, escalate, or be redesigned before recovery readiness is accepted.'
  }

  if (
    input.commandPosture === 'CONTINUITY_WATCH' ||
    input.verificationTrajectory === 'FRAGILE' ||
    input.recoveryReadiness === 'NOT_READY_FOR_RECOVERY'
  ) {
    return 'Stabilization is not yet durable. Continuity watch remains appropriate until verification trajectory strengthens and recurrence pressure remains controlled.'
  }

  if (
    input.verificationResult === 'VERIFIED_STABILIZATION' &&
    input.recoveryReadiness !== 'RECOVERY_BLOCKED'
  ) {
    return 'Action impact appears verified at outcome level. The case may move toward recovery monitoring, but durable recovery must still be confirmed separately.'
  }

  return 'Outcome evidence has been preserved. Verification supports lifecycle movement, but recovery durability remains a separate governance stage.'
}

function buildVerificationPressureMeaning(input: {
  partialOrUncertain: number
  recurrenceDetected: number
  escalationRequired: number
  recoveryEligible: number
  weakeningVerification: number
}) {
  const signals: string[] = []

  if (input.partialOrUncertain > 0) {
    signals.push('partial or uncertain verification is present')
  }

  if (input.recurrenceDetected > 0) {
    signals.push('recurrence has been detected in outcome evidence')
  }

  if (input.escalationRequired > 0) {
    signals.push('escalation pressure remains active')
  }

  if (input.weakeningVerification > 0) {
    signals.push('verification weakening is visible')
  }

  if (input.recoveryEligible > 0) {
    signals.push('some cases are eligible for recovery watch')
  }

  if (signals.length === 0) {
    return 'No material verification pressure is currently visible from preserved outcome evidence.'
  }

  return `Verification pressure is active: ${signals.join(', ')}. Executive review should watch whether verified action impact moves into recovery monitoring or weakens into recurrence, uncertainty, weakening trajectory, or escalation.`
}

function resolveOutcomeAuditSeverity(input: {
  verificationResult: string
  continuityOutlook: string
  commandPosture: string
}): AuditSeverity {
  if (
    input.verificationResult === 'ESCALATION_REQUIRED' ||
    input.continuityOutlook === 'HIGH_RISK' ||
    input.commandPosture === 'CRITICAL_CONTINUITY_POSTURE'
  ) {
    return 'CRITICAL'
  }

  if (
    input.verificationResult === 'RECURRENCE_DETECTED' ||
    input.verificationResult === 'ACTION_INEFFECTIVE' ||
    input.continuityOutlook === 'ESCALATE' ||
    input.commandPosture === 'EXECUTIVE_REVIEW' ||
    input.commandPosture === 'ELEVATED_REVIEW'
  ) {
    return 'HIGH'
  }

  if (
    input.verificationResult === 'PARTIAL_VERIFICATION' ||
    input.verificationResult === 'UNVERIFIED_IMPROVEMENT' ||
    input.continuityOutlook === 'AT_RISK' ||
    input.commandPosture === 'CONTINUITY_WATCH'
  ) {
    return 'MODERATE'
  }

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
    maxWidth: '980px',
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
  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '20px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
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
  pressurePanel: {
    background: '#020617',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '24px',
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
    minHeight: '660px',
  },
}