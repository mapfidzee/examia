'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '@/lib/supabase'

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
  updated_at?: string | null
  created_at?: string | null
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

const RECOVERY_READY_STATUSES = [
  'STABILIZED',
  'RECOVERY_MONITORING',
  'RECOVERY_WATCH_ELIGIBLE',
  'RECOVERY_MONITORING_RECOMMENDED',
  'PARTIAL_STABILIZATION',
  'CONTINUITY_RISK_ACTIVE',
  'FOLLOW_UP_REQUIRED',
  'ESCALATED',
]

const DURABILITY_RESULTS = [
  'DURABLE_RECOVERY_CONFIRMED',
  'RECOVERY_HOLDING',
  'RECOVERY_FRAGILE',
  'RECOVERY_WEAKENING',
  'REBURN_DETECTED',
  'RECOVERY_COLLAPSE',
]

const RECOVERY_TRAJECTORIES = [
  'HOLDING',
  'STABILIZING',
  'FRAGILE',
  'WEAKENING',
  'COLLAPSING',
]

const REBURN_SIGNALS = [
  'NO_REBURN_VISIBLE',
  'REBURN_WATCH',
  'REBURN_DETECTED',
  'REPEATED_REBURN',
  'RECOVERY_COLLAPSE',
]

const RECOVERY_CONFIDENCE = [
  'CREDIBLE',
  'CONDITIONAL',
  'FRAGILE',
  'UNVERIFIED',
  'FAILED',
]

const DURABILITY_WINDOWS = [
  '24 hours',
  '48 hours',
  '7 days',
  '14 days',
  '30 days',
  '90 days',
]

const MEMORY_IMPACTS = [
  'NO_MEMORY_ESCALATION_REQUIRED',
  'CARRY_FORWARD_WATCH',
  'RECURRENCE_MEMORY_REQUIRED',
  'REBURN_MEMORY_REQUIRED',
  'STRUCTURAL_MEMORY_ESCALATION',
]

export default function RecoveryPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
    >
      <CGIGovernanceShell>
        <RecoveryContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function RecoveryContent() {
  const [cases, setCases] = useState<StabilityCase[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])

  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [durabilityResult, setDurabilityResult] = useState('')
  const [recoveryTrajectory, setRecoveryTrajectory] = useState('FRAGILE')
  const [reburnSignal, setReburnSignal] = useState('REBURN_WATCH')
  const [recoveryConfidence, setRecoveryConfidence] = useState('CONDITIONAL')
  const [durabilityWindow, setDurabilityWindow] = useState('7 days')
  const [memoryImpact, setMemoryImpact] = useState('CARRY_FORWARD_WATCH')
  const [recoveryInterpretation, setRecoveryInterpretation] = useState('')

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
      .in('case_status', RECOVERY_READY_STATUSES)
      .order('updated_at', { ascending: false })

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

  const recoveryPressure = useMemo(() => {
    const durableRecovery = outcomes.filter((item) =>
      item.outcome_summary?.includes('DURABLE_RECOVERY_CONFIRMED')
    ).length

    const fragileRecovery = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes('RECOVERY_FRAGILE') ||
        item.outcome_summary?.includes('FRAGILE') ||
        item.outcome_summary?.includes('CONDITIONAL')
    ).length

    const reburnDetected = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes('REBURN_DETECTED') ||
        item.outcome_summary?.includes('REPEATED_REBURN')
    ).length

    const recoveryCollapse = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes('RECOVERY_COLLAPSE') ||
        item.outcome_summary?.includes('COLLAPSING')
    ).length

    const memoryCarryForward = outcomes.filter(
      (item) =>
        item.outcome_summary?.includes('CARRY_FORWARD_WATCH') ||
        item.outcome_summary?.includes('RECURRENCE_MEMORY_REQUIRED') ||
        item.outcome_summary?.includes('REBURN_MEMORY_REQUIRED') ||
        item.outcome_summary?.includes('STRUCTURAL_MEMORY_ESCALATION')
    ).length

    return {
      durableRecovery,
      fragileRecovery,
      reburnDetected,
      recoveryCollapse,
      memoryCarryForward,
    }
  }, [outcomes])

  const commandPosture = buildRecoveryCommandPosture({
    durabilityResult,
    recoveryTrajectory,
    reburnSignal,
    recoveryConfidence,
    memoryImpact,
  })

  const recoveryMeaning = buildExecutiveRecoveryMeaning({
    durabilityResult,
    recoveryTrajectory,
    reburnSignal,
    recoveryConfidence,
    durabilityWindow,
    memoryImpact,
    commandPosture,
  })

  const recoveryPressureMeaning = buildRecoveryPressureMeaning({
    durableRecovery: recoveryPressure.durableRecovery,
    fragileRecovery: recoveryPressure.fragileRecovery,
    reburnDetected: recoveryPressure.reburnDetected,
    recoveryCollapse: recoveryPressure.recoveryCollapse,
    memoryCarryForward: recoveryPressure.memoryCarryForward,
  })

  const nextLifecycleState = buildNextRecoveryState({
    durabilityResult,
    reburnSignal,
    recoveryConfidence,
    memoryImpact,
  })

  function buildCaseLabel(caseItem: StabilityCase) {
    return `${caseItem.beneficiary_name} • ${caseItem.support_domain} • ${caseItem.case_status}`
  }

  function recoverySynthesis() {
    return `
DURABILITY RESULT
${durabilityResult || 'Awaiting durability result selection'}

RECOVERY TRAJECTORY
${recoveryTrajectory}

REBURN SIGNAL
${reburnSignal}

RECOVERY CONFIDENCE
${recoveryConfidence}

DURABILITY WINDOW
${durabilityWindow}

MEMORY IMPACT
${memoryImpact}

COMMAND POSTURE
${commandPosture}

EXECUTIVE MEANING
${recoveryMeaning}

RECOVERY PRESSURE
${recoveryPressureMeaning}

NEXT LIFECYCLE STATE
${selectedCase ? nextLifecycleState : 'Pending stability case selection'}

CASE SIGNAL
${selectedCase?.beneficiary_name || 'Pending stability case selection'}

STABILITY DOMAIN
${selectedCase?.support_domain || 'Pending stability case selection'}

CURRENT CONTINUITY STATUS
${selectedCase?.case_status || 'Pending stability case selection'}

RECOVERY INTERPRETATION
${recoveryInterpretation.trim() || 'No additional recovery interpretation entered.'}

LIFECYCLE BOUNDARY
Action is not outcome.
Outcome is not recovery.
Recovery is not memory erasure.
Durability must be observed before trust is restored.
    `.trim()
  }

  async function preserveRecoveryDurabilityReview() {
    if (!selectedCaseId) {
      alert('Select a stability case.')
      return
    }

    if (
      !durabilityResult ||
      !recoveryTrajectory ||
      !reburnSignal ||
      !recoveryConfidence ||
      !durabilityWindow ||
      !memoryImpact
    ) {
      alert('Complete all recovery durability fields.')
      return
    }

    if (!selectedCase) {
      alert('Selected stability case could not be found.')
      return
    }

    setLoading(true)
    setMessage('')

    const synthesis = recoverySynthesis()

    const { data: outcomeRecord, error: outcomeError } = await supabase
      .from('case_outcomes')
      .insert({
        case_id: selectedCaseId,
        outcome_status: durabilityResult,
        outcome_summary: synthesis,
      })
      .select('id')
      .single()

    if (outcomeError) {
      alert(outcomeError.message)
      setLoading(false)
      return
    }

    const { error: caseError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: nextLifecycleState,
        outcome_summary: synthesis,
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
      event_type: 'RECOVERY_DURABILITY_REVIEW',
      event_summary: `Recovery durability reviewed. Result: ${durabilityResult}. Trajectory: ${recoveryTrajectory}. Reburn: ${reburnSignal}. Command posture: ${commandPosture}.`,
      actor: 'TSINAXA CGI Recovery Durability Intelligence',
    })

    if (timelineError) {
      alert(timelineError.message)
      setLoading(false)
      return
    }

    await preserveRecoveryAuditEvidence({
      caseItem: selectedCase,
      outcomeRecordId: outcomeRecord?.id || null,
      durabilityResult,
      recoveryTrajectory,
      reburnSignal,
      recoveryConfidence,
      durabilityWindow,
      memoryImpact,
      commandPosture,
      recoveryMeaning,
      recoveryPressureMeaning,
      nextLifecycleState,
      recoveryInterpretation,
    })

    setSelectedCaseId('')
    setDurabilityResult('')
    setRecoveryTrajectory('FRAGILE')
    setReburnSignal('REBURN_WATCH')
    setRecoveryConfidence('CONDITIONAL')
    setDurabilityWindow('7 days')
    setMemoryImpact('CARRY_FORWARD_WATCH')
    setRecoveryInterpretation('')

    setMessage(
      'Recovery durability review preserved. Reburn visibility, memory impact, command posture, and lifecycle continuity are now updated.'
    )

    setLoading(false)

    await loadCases()
    await loadOutcomes()
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • RECOVERY DURABILITY INTELLIGENCE</p>

          <h1 style={styles.title}>Recovery Durability Intelligence</h1>

          <p style={styles.subtitle}>
            Confirm whether verified stabilization is holding over time. Detect reburn,
            recovery collapse, fragile recovery, memory carry-forward, and command
            posture before trust is restored.
          </p>

          <div style={styles.boundaryBox}>
            <strong>Boundary:</strong> /recovery confirms durability. It does not erase
            structural memory, remove recurrence visibility, or close survivability risk
            automatically.
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.metricsGrid}>
          <Metric label="Cases Under Recovery Watch" value={cases.length} />
          <Metric label="Durable Recovery Confirmed" value={recoveryPressure.durableRecovery} />
          <Metric label="Fragile Recovery" value={recoveryPressure.fragileRecovery} />
          <Metric label="Reburn Detected" value={recoveryPressure.reburnDetected} />
          <Metric label="Recovery Collapse" value={recoveryPressure.recoveryCollapse} />
          <Metric label="Memory Carry-Forward" value={recoveryPressure.memoryCarryForward} />
        </section>

        <section style={styles.pressurePanel}>
          <h2 style={styles.sectionTitle}>Recovery Pressure Intelligence</h2>
          <p style={styles.panelNote}>{recoveryPressureMeaning}</p>
        </section>

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Preserve Recovery Durability Review</h2>

            <p style={styles.panelNote}>
              Use this after outcome verification suggests recovery monitoring may begin.
              Confirm whether stabilization is holding, weakening, reburning, collapsing,
              or requiring structural memory carry-forward.
            </p>

            <label style={styles.label}>
              Stability Case
              <select
                value={selectedCaseId}
                onChange={(event) => setSelectedCaseId(event.target.value)}
                style={styles.select}
              >
                <option value="">
                  {cases.length === 0 ? 'No recovery-watch cases found' : 'Select stability case'}
                </option>

                {cases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {buildCaseLabel(item)}
                  </option>
                ))}
              </select>
            </label>

            <Select
              label="Durability Result"
              placeholder="Select durability result"
              value={durabilityResult}
              setValue={setDurabilityResult}
              options={DURABILITY_RESULTS}
            />

            <Select
              label="Recovery Trajectory"
              placeholder="Select recovery trajectory"
              value={recoveryTrajectory}
              setValue={setRecoveryTrajectory}
              options={RECOVERY_TRAJECTORIES}
            />

            <Select
              label="Reburn Signal"
              placeholder="Select reburn signal"
              value={reburnSignal}
              setValue={setReburnSignal}
              options={REBURN_SIGNALS}
            />

            <Select
              label="Recovery Confidence"
              placeholder="Select recovery confidence"
              value={recoveryConfidence}
              setValue={setRecoveryConfidence}
              options={RECOVERY_CONFIDENCE}
            />

            <Select
              label="Durability Window"
              placeholder="Select durability window"
              value={durabilityWindow}
              setValue={setDurabilityWindow}
              options={DURABILITY_WINDOWS}
            />

            <Select
              label="Memory Impact"
              placeholder="Select memory impact"
              value={memoryImpact}
              setValue={setMemoryImpact}
              options={MEMORY_IMPACTS}
            />

            <label style={styles.label}>
              Recovery Interpretation
              <textarea
                value={recoveryInterpretation}
                onChange={(event) => setRecoveryInterpretation(event.target.value)}
                placeholder="Use operational facts only. Preserve durability evidence, reburn visibility, memory implications, and executive relevance."
                style={styles.textarea}
              />
            </label>

            <button
              onClick={preserveRecoveryDurabilityReview}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading
                ? 'Preserving Recovery Durability...'
                : 'Preserve Recovery Durability Review'}
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Executive Recovery Synthesis</h2>

            <p style={styles.panelNote}>
              This synthesis confirms whether stabilization is holding over time,
              weakening, reburning, collapsing, or requiring memory carry-forward.
            </p>

            <pre style={styles.summaryBox}>{recoverySynthesis()}</pre>
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Recovery Doctrine</p>

          <h2 style={styles.cardTitle}>Recovery is a credibility test, not a status label.</h2>

          <p style={styles.bodyText}>
            CGI does not restore trust simply because a case appears recovered.
            Recovery must hold across time without reburn, relapse, unresolved pressure,
            recurring instability, or memory escalation.
          </p>
        </section>
      </div>
    </main>
  )
}

async function preserveRecoveryAuditEvidence(input: {
  caseItem: StabilityCase
  outcomeRecordId: string | null
  durabilityResult: string
  recoveryTrajectory: string
  reburnSignal: string
  recoveryConfidence: string
  durabilityWindow: string
  memoryImpact: string
  commandPosture: string
  recoveryMeaning: string
  recoveryPressureMeaning: string
  nextLifecycleState: string
  recoveryInterpretation: string
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const institution = input.caseItem.institution_name || GOVERNANCE_INSTITUTION

  const severity = resolveRecoveryAuditSeverity({
    durabilityResult: input.durabilityResult,
    reburnSignal: input.reburnSignal,
    recoveryTrajectory: input.recoveryTrajectory,
    commandPosture: input.commandPosture,
  })

  const { error } = await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    email: user?.email ?? null,
    role: 'RECOVERY_GOVERNANCE_USER',

    action_type: 'PRESERVE_RECOVERY_DURABILITY_REVIEW',
    route: '/recovery',
    record_type: 'beneficiary_cases',
    record_id: input.caseItem.id,
    summary: `Preserved recovery durability review for ${input.caseItem.beneficiary_name}. ${input.recoveryMeaning}`,
    severity,

    details: {
      evidence_type: 'RECOVERY_DURABILITY_INTELLIGENCE',
      governance_institution: institution,

      stability_case_id: input.caseItem.id,
      outcome_record_id: input.outcomeRecordId,

      case_signal: input.caseItem.beneficiary_name,
      stability_domain: input.caseItem.support_domain,
      previous_case_status: input.caseItem.case_status,
      next_case_status: input.nextLifecycleState,

      durability_result: input.durabilityResult,
      recovery_trajectory: input.recoveryTrajectory,
      reburn_signal: input.reburnSignal,
      recovery_confidence: input.recoveryConfidence,
      durability_window: input.durabilityWindow,
      memory_impact: input.memoryImpact,
      command_posture: input.commandPosture,

      executive_meaning: input.recoveryMeaning,
      recovery_pressure: input.recoveryPressureMeaning,
      recovery_interpretation: input.recoveryInterpretation.trim() || null,

      action_is_not_outcome: true,
      outcome_is_not_recovery: true,
      recovery_is_not_memory_erasure: true,
      durability_required_before_trust: true,
      continuity_memory_preserved: true,
      institutional_traceability: true,
      governance_boundary: 'NON_PUNITIVE_CONTINUITY_GOVERNANCE',
    },
  })

  if (error) {
    console.error('Recovery durability audit logging failed', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
  }
}

function buildRecoveryCommandPosture(input: {
  durabilityResult: string
  recoveryTrajectory: string
  reburnSignal: string
  recoveryConfidence: string
  memoryImpact: string
}) {
  if (
    input.durabilityResult === 'RECOVERY_COLLAPSE' ||
    input.reburnSignal === 'RECOVERY_COLLAPSE'
  ) {
    return 'SURVIVABILITY_RISK_ACTIVE'
  }

  if (
    input.durabilityResult === 'REBURN_DETECTED' ||
    input.reburnSignal === 'REPEATED_REBURN' ||
    input.recoveryTrajectory === 'COLLAPSING' ||
    input.memoryImpact === 'STRUCTURAL_MEMORY_ESCALATION'
  ) {
    return 'EXECUTIVE_REVIEW'
  }

  if (
    input.reburnSignal === 'REBURN_DETECTED' ||
    input.recoveryTrajectory === 'WEAKENING' ||
    input.recoveryConfidence === 'FAILED' ||
    input.memoryImpact === 'REBURN_MEMORY_REQUIRED'
  ) {
    return 'ELEVATED_RECOVERY_REVIEW'
  }

  if (
    input.durabilityResult === 'RECOVERY_FRAGILE' ||
    input.recoveryTrajectory === 'FRAGILE' ||
    input.recoveryConfidence === 'CONDITIONAL' ||
    input.reburnSignal === 'REBURN_WATCH' ||
    input.memoryImpact === 'CARRY_FORWARD_WATCH'
  ) {
    return 'RECOVERY_WATCH'
  }

  return 'NORMAL_MONITORING'
}

function buildNextRecoveryState(input: {
  durabilityResult: string
  reburnSignal: string
  recoveryConfidence: string
  memoryImpact: string
}) {
  if (
    input.durabilityResult === 'RECOVERY_COLLAPSE' ||
    input.reburnSignal === 'RECOVERY_COLLAPSE'
  ) {
    return 'RECOVERY_COLLAPSE'
  }

  if (
    input.durabilityResult === 'REBURN_DETECTED' ||
    input.reburnSignal === 'REBURN_DETECTED' ||
    input.reburnSignal === 'REPEATED_REBURN'
  ) {
    return 'REBURN_REVIEW'
  }

  if (
    input.memoryImpact === 'RECURRENCE_MEMORY_REQUIRED' ||
    input.memoryImpact === 'REBURN_MEMORY_REQUIRED' ||
    input.memoryImpact === 'STRUCTURAL_MEMORY_ESCALATION'
  ) {
    return 'MEMORY_REVIEW_REQUIRED'
  }

  if (
    input.durabilityResult === 'DURABLE_RECOVERY_CONFIRMED' &&
    input.recoveryConfidence === 'CREDIBLE'
  ) {
    return 'DURABLE_RECOVERY_CONFIRMED'
  }

  return 'RECOVERY_MONITORING'
}

function buildExecutiveRecoveryMeaning(input: {
  durabilityResult: string
  recoveryTrajectory: string
  reburnSignal: string
  recoveryConfidence: string
  durabilityWindow: string
  memoryImpact: string
  commandPosture: string
}) {
  if (!input.durabilityResult) {
    return 'Awaiting recovery durability selections. Executive meaning will derive from durability result, recovery trajectory, reburn signal, recovery confidence, durability window, and memory impact.'
  }

  if (input.commandPosture === 'SURVIVABILITY_RISK_ACTIVE') {
    return 'Recovery has collapsed or survivability risk is active. Trust cannot be restored, and executive command visibility must remain active.'
  }

  if (input.commandPosture === 'EXECUTIVE_REVIEW') {
    return 'Recovery evidence shows reburn, collapse risk, or structural memory escalation. Executive review should remain active until durability becomes credible.'
  }

  if (input.commandPosture === 'ELEVATED_RECOVERY_REVIEW') {
    return 'Recovery is weakening or reburn evidence is visible. Governance must review whether stabilization needs renewed action before recovery can be trusted.'
  }

  if (input.commandPosture === 'RECOVERY_WATCH') {
    return `Recovery is under watch across the ${input.durabilityWindow} durability window. Trust should not be restored until stability holds without reburn or recurrence.`
  }

  if (
    input.durabilityResult === 'DURABLE_RECOVERY_CONFIRMED' &&
    input.recoveryConfidence === 'CREDIBLE'
  ) {
    return 'Durable recovery appears credible. Structural memory should still be preserved, but active recovery pressure may reduce.'
  }

  return 'Recovery evidence has been preserved. Durability remains governed until recovery holds across the selected observation window.'
}

function buildRecoveryPressureMeaning(input: {
  durableRecovery: number
  fragileRecovery: number
  reburnDetected: number
  recoveryCollapse: number
  memoryCarryForward: number
}) {
  const signals: string[] = []

  if (input.fragileRecovery > 0) {
    signals.push('fragile recovery remains visible')
  }

  if (input.reburnDetected > 0) {
    signals.push('reburn has been detected')
  }

  if (input.recoveryCollapse > 0) {
    signals.push('recovery collapse is visible')
  }

  if (input.memoryCarryForward > 0) {
    signals.push('memory carry-forward is required')
  }

  if (input.durableRecovery > 0) {
    signals.push('some recovery evidence appears durable')
  }

  if (signals.length === 0) {
    return 'No material recovery pressure is currently visible from preserved durability evidence.'
  }

  return `Recovery pressure is active: ${signals.join(', ')}. Executive review should watch whether stabilization continues holding over time or weakens into reburn, collapse, or structural memory escalation.`
}

function resolveRecoveryAuditSeverity(input: {
  durabilityResult: string
  reburnSignal: string
  recoveryTrajectory: string
  commandPosture: string
}): AuditSeverity {
  if (
    input.commandPosture === 'SURVIVABILITY_RISK_ACTIVE' ||
    input.durabilityResult === 'RECOVERY_COLLAPSE' ||
    input.reburnSignal === 'RECOVERY_COLLAPSE'
  ) {
    return 'CRITICAL'
  }

  if (
    input.commandPosture === 'EXECUTIVE_REVIEW' ||
    input.durabilityResult === 'REBURN_DETECTED' ||
    input.reburnSignal === 'REPEATED_REBURN' ||
    input.recoveryTrajectory === 'COLLAPSING'
  ) {
    return 'HIGH'
  }

  if (
    input.commandPosture === 'ELEVATED_RECOVERY_REVIEW' ||
    input.commandPosture === 'RECOVERY_WATCH' ||
    input.recoveryTrajectory === 'FRAGILE' ||
    input.recoveryTrajectory === 'WEAKENING'
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
    overflowX: 'hidden',
  },
  container: {
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 20px 48px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '20px',
    paddingTop: '4px',
  },
  kicker: {
    color: '#67e8f9',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
    margin: 0,
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
    margin: 0,
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
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: '26px',
    margin: '0 0 10px',
  },
  sectionKicker: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '12px',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: '26px',
    lineHeight: 1.15,
    margin: '10px 0 10px',
  },
  bodyText: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    margin: 0,
    maxWidth: '880px',
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