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

type BeneficiaryCase = {
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

const INTERVENTION_TYPES = [
  'Learning continuity stabilization',
  'Low-data support intervention',
  'Responder-guided support session',
  'Institution-coordinated intervention',
  'Family/guardian coordination intervention',
  'Safeguarding-aware support pathway',
  'District escalation support',
  'Continuity follow-up intervention',
]

const INTERVENTION_MODES = [
  'Text-based support',
  'Audio-first support',
  'Live guided session',
  'File-supported intervention',
  'Institution-led coordination',
  'Responder-led coordination',
  'Hybrid low-bandwidth support',
]

const COMPLETION_STATUSES = [
  'COMPLETED',
  'PARTIALLY_COMPLETED',
  'INTERRUPTED',
  'FOLLOW_UP_REQUIRED',
  'ESCALATION_REQUIRED',
]

const CONTINUITY_RISKS: ContinuityRisk[] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']

const SESSION_SUMMARIES = [
  'Beneficiary received structured support and immediate pathway is stable.',
  'Beneficiary received partial support; follow-up is needed.',
  'Support was attempted but access or continuity barriers remain.',
  'Responder completed intervention and recommends monitoring.',
  'Institution coordination is still required before stabilization.',
  'Safeguarding-aware escalation is recommended.',
  'District or regional visibility is recommended.',
]

const RESPONDER_NOTE_TEMPLATES = [
  'Beneficiary engaged successfully during intervention.',
  'Continuity pathway remains active but follow-up is recommended.',
  'Access limitations affected intervention continuity.',
  'Institution coordination remains necessary.',
  'Low-bandwidth conditions affected session flow.',
  'Beneficiary requires continued stabilization support.',
  'Safeguarding-aware handling remains advised.',
  'District or regional visibility may be required.',
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
  const [cases, setCases] = useState<BeneficiaryCase[]>([])

  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [interventionType, setInterventionType] = useState('')
  const [interventionMode, setInterventionMode] = useState('')
  const [completionStatus, setCompletionStatus] = useState('')
  const [sessionSummary, setSessionSummary] = useState('')
  const [stabilizationScore, setStabilizationScore] = useState('3')
  const [continuityRisk, setContinuityRisk] = useState<ContinuityRisk>('MODERATE')
  const [responderTemplate, setResponderTemplate] = useState('')
  const [additionalResponderNotes, setAdditionalResponderNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCases()
  }, [])

  async function loadCases() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .in('case_status', [
        'ROUTED',
        'RESPONDER_ASSIGNED',
        'INTERVENTION_ACTIVE',
        'INTERVENTION_RECORDED',
        'RECOVERY_MONITORING',
        'STABILIZING',
        'ESCALATED',
      ])
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

  function interventionEvidence() {
    const caseItem = selectedCase()

    if (!caseItem) return ''

    const lifecycleDecision = evaluateInterventionLifecycle({
      completionStatus,
      continuityRisk,
    })

    return `
CONTROLLED INTERVENTION EVIDENCE RECORD

Beneficiary Case:
${caseItem.beneficiary_name} • ${caseItem.support_domain} • ${caseItem.severity_level}

Institution:
${caseItem.institution_name || GOVERNANCE_INSTITUTION}

Intervention Type:
${interventionType || 'Not specified'}

Intervention Mode:
${interventionMode || 'Not specified'}

Completion Status:
${completionStatus || 'Not specified'}

Structured Session Summary:
${sessionSummary || 'Not specified'}

Stabilization Score:
${stabilizationScore}/5

Continuity Risk After Intervention:
${continuityRisk}

Lifecycle Governance:
Next Status: ${lifecycleDecision.nextStatus}
Stabilization Confidence: ${lifecycleDecision.stabilizationConfidence}
Escalation Required: ${lifecycleDecision.shouldEscalate ? 'YES' : 'NO'}
Recovery Monitoring Required: ${lifecycleDecision.shouldMonitorRecovery ? 'YES' : 'NO'}
Command Visibility: ${lifecycleDecision.commandVisibility ? 'YES' : 'NO'}

Governance-Safe Responder Notes:
${responderTemplate || 'No template selected'}

Additional Operational Notes:
${additionalResponderNotes.trim() || 'No additional notes entered.'}

Governance Statement:
This intervention record documents support delivery, stabilization progress, continuity risk, and follow-up needs. It does not blame the beneficiary, family, responder, school, institution, or partner. It exists to support governed stabilization, safe coordination, accountable intervention continuity, and lifecycle movement.

Lifecycle Principle:
Intervention is not recovery. TSINAXA CGI records the intervention, evaluates continuity risk, and keeps recovery monitoring active until stabilization is confirmed.
    `.trim()
  }

  async function saveInterventionEvidence() {
    if (!selectedCaseId) {
      alert('Select a beneficiary case.')
      return
    }

    if (!interventionType || !interventionMode || !completionStatus || !sessionSummary) {
      alert('Complete the intervention type, mode, completion status, and session summary.')
      return
    }

    setLoading(true)
    setMessage('')

    const caseItem = selectedCase()

    if (!caseItem) {
      alert('Selected case could not be found.')
      setLoading(false)
      return
    }

    const lifecycleDecision = evaluateInterventionLifecycle({
      completionStatus,
      continuityRisk,
    })

    const evidence = interventionEvidence()

    const { data: interventionRecord, error: interventionError } = await supabase
      .from('case_interventions')
      .insert({
        case_id: selectedCaseId,
        intervention_type: interventionType,
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
        event_summary: `${lifecycleDecision.timelineSummary} Completion: ${completionStatus}. Continuity risk: ${continuityRisk}. Stabilization confidence: ${lifecycleDecision.stabilizationConfidence}.`,
        actor: 'TSINAXA CGI Lifecycle Governance Intervention',
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
      evidence,
      interventionType,
      interventionMode,
      completionStatus,
      sessionSummary,
      stabilizationScore,
      continuityRisk,
      responderTemplate,
      additionalResponderNotes,
    })

    setSelectedCaseId('')
    setInterventionType('')
    setInterventionMode('')
    setCompletionStatus('')
    setSessionSummary('')
    setStabilizationScore('3')
    setContinuityRisk('MODERATE')
    setResponderTemplate('')
    setAdditionalResponderNotes('')

    setMessage('Controlled intervention evidence saved. Lifecycle governance, timeline memory, and audit evidence preserved.')
    setLoading(false)

    await loadCases()
  }

  const activeInterventionCases = cases.length
  const criticalCases = cases.filter((item) => item.severity_level === 'CRITICAL').length
  const safeguardingCases = cases.filter((item) => item.safeguarding_flag).length
  const routedCases = cases.filter((item) =>
    ['ROUTED', 'RESPONDER_ASSIGNED', 'INTERVENTION_ACTIVE'].includes(item.case_status)
  ).length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • INTERVENTION GOVERNANCE</p>

          <h1 style={styles.title}>Intervention Completion Evidence</h1>

          <p style={styles.subtitle}>
            Govern actual support delivery by converting each intervention into a
            structured evidence record for stabilization tracking, continuity scoring,
            responder accountability, lifecycle movement, and safe institutional follow-up.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Cases Ready for Intervention" value={activeInterventionCases} />
          <Metric label="Routed / Assigned Cases" value={routedCases} />
          <Metric label="Critical Cases" value={criticalCases} />
          <Metric label="Safeguarding Flags" value={safeguardingCases} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Record Controlled Intervention</h2>

            <p style={styles.panelNote}>
              Use this after a responder, institution, NGO, district office, or support
              pathway has delivered an intervention. Record what happened in structured,
              governance-safe language.
            </p>

            <label style={styles.label}>
              Beneficiary Case
              <select
                value={selectedCaseId}
                onChange={(event) => setSelectedCaseId(event.target.value)}
                style={styles.select}
              >
                <option value="">
                  {cases.length === 0 ? 'No routed or active cases found' : 'Select beneficiary case'}
                </option>

                {cases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.beneficiary_name} • {caseItem.support_domain} • {caseItem.case_status}
                  </option>
                ))}
              </select>
            </label>

            <Select
              label="Intervention Type"
              value={interventionType}
              setValue={setInterventionType}
              options={['', ...INTERVENTION_TYPES]}
            />

            <Select
              label="Intervention Mode"
              value={interventionMode}
              setValue={setInterventionMode}
              options={['', ...INTERVENTION_MODES]}
            />

            <Select
              label="Completion Status"
              value={completionStatus}
              setValue={setCompletionStatus}
              options={['', ...COMPLETION_STATUSES]}
            />

            <Select
              label="Structured Session Summary"
              value={sessionSummary}
              setValue={setSessionSummary}
              options={['', ...SESSION_SUMMARIES]}
            />

            <label style={styles.label}>
              Stabilization Score: {stabilizationScore}/5
              <input
                type="range"
                min="1"
                max="5"
                value={stabilizationScore}
                onChange={(event) => setStabilizationScore(event.target.value)}
                style={styles.range}
              />
            </label>

            <Select
              label="Continuity Risk After Intervention"
              value={continuityRisk}
              setValue={(value) => setContinuityRisk(value as ContinuityRisk)}
              options={CONTINUITY_RISKS}
            />

            <Select
              label="Governance-Safe Responder Notes Template"
              value={responderTemplate}
              setValue={setResponderTemplate}
              options={['', ...RESPONDER_NOTE_TEMPLATES]}
            />

            <label style={styles.label}>
              Optional Additional Operational Notes
              <textarea
                value={additionalResponderNotes}
                onChange={(event) => setAdditionalResponderNotes(event.target.value)}
                placeholder="Use operational facts only. Avoid blame, emotional language, or unnecessary personal details."
                style={styles.textarea}
              />
            </label>

            <button
              onClick={saveInterventionEvidence}
              disabled={loading}
              style={styles.primaryButton}
            >
              {loading ? 'Saving Evidence...' : 'Save Lifecycle Intervention Evidence'}
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Generated Evidence Record</h2>

            <p style={styles.panelNote}>
              This is the structured lifecycle record that will be saved to the
              intervention table, added to the case timeline, and used for recovery
              continuity visibility.
            </p>

            <pre style={styles.summaryBox}>
              {interventionEvidence() ||
                'Select a beneficiary case to generate controlled intervention evidence.'}
            </pre>
          </div>
        </section>
      </div>
    </main>
  )
}

async function preserveInterventionGovernanceEvidence(input: {
  caseItem: BeneficiaryCase
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
  evidence: string
  interventionType: string
  interventionMode: string
  completionStatus: string
  sessionSummary: string
  stabilizationScore: string
  continuityRisk: ContinuityRisk
  responderTemplate: string
  additionalResponderNotes: string
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const institution =
    input.caseItem.institution_name ||
    GOVERNANCE_INSTITUTION

  const visibilityLevel =
    input.lifecycleDecision.commandVisibility ||
    input.caseItem.safeguarding_flag ||
    input.continuityRisk === 'CRITICAL' ||
    input.continuityRisk === 'HIGH'
      ? 'EXECUTIVE'
      : 'GOVERNANCE'

  const governancePosture =
    resolveInterventionGovernancePosture({
      continuityRisk: input.continuityRisk,
      completionStatus: input.completionStatus,
      commandVisibility:
        input.lifecycleDecision.commandVisibility,
      shouldEscalate:
        input.lifecycleDecision.shouldEscalate,
    })

  const severity = resolveInterventionSeverity({
    continuityRisk: input.continuityRisk,
    completionStatus: input.completionStatus,
    commandVisibility:
      input.lifecycleDecision.commandVisibility,
  })

  const summary =
    `Saved intervention evidence for ${input.caseItem.beneficiary_name}. Completion: ${input.completionStatus}. Continuity risk: ${input.continuityRisk}. Next status: ${input.lifecycleDecision.nextStatus}. Institution: ${institution}.`

  const { error } = await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    email: user?.email ?? null,
    role: 'INTERVENTION_GOVERNANCE_USER',

    action_type: 'SAVE_INTERVENTION_EVIDENCE',
    route: '/interventions',
    record_type: 'beneficiary_cases',
    record_id: input.caseItem.id,
    summary,
    severity,

    details: {
      evidence_type: 'CONTROLLED_INTERVENTION_EVIDENCE',
      immutability_status: 'IMMUTABLE_GOVERNANCE_RECORD',
      reconstruction_capability: 'ENABLED',

      linked_snapshot_id: input.caseItem.id,
      beneficiary_case_id: input.caseItem.id,
      intervention_record_id:
        input.interventionRecordId,
      timeline_record_id:
        input.timelineRecordId,

      governance_reason: summary,
      governance_institution: institution,
      governance_scope:
        'Controlled intervention completion and recovery continuity',
      governance_posture: governancePosture,
      visibility_level: visibilityLevel,

      institution_id: null,
      institution_name: institution,
      region: input.caseItem.region,

      actor_id: user?.id ?? null,
      actor_email: user?.email ?? null,
      actor_role: 'INTERVENTION_GOVERNANCE_USER',

      beneficiary_name: input.caseItem.beneficiary_name,
      beneficiary_level: input.caseItem.beneficiary_level,
      support_domain: input.caseItem.support_domain,
      previous_case_status: input.caseItem.case_status,
      next_case_status: input.lifecycleDecision.nextStatus,
      severity_level: input.caseItem.severity_level,
      safeguarding_flag: input.caseItem.safeguarding_flag,

      intervention_type: input.interventionType,
      intervention_mode: input.interventionMode,
      completion_status: input.completionStatus,
      session_summary: input.sessionSummary,
      stabilization_score:
        Number(input.stabilizationScore),
      continuity_risk_after_intervention:
        input.continuityRisk,

      stabilization_confidence:
        input.lifecycleDecision.stabilizationConfidence,
      escalation_required:
        input.lifecycleDecision.shouldEscalate,
      recovery_monitoring_required:
        input.lifecycleDecision.shouldMonitorRecovery,
      command_visibility_required:
        input.lifecycleDecision.commandVisibility,

      responder_note_template:
        input.responderTemplate || null,
      additional_operational_notes:
        input.additionalResponderNotes.trim() || null,

      continuity_relevance:
        'Intervention evidence preserves whether routed support converted into completed action, partial action, escalation, follow-up, or recovery monitoring.',

      survivability_context:
        buildInterventionSurvivabilityContext({
          caseItem: input.caseItem,
          completionStatus: input.completionStatus,
          continuityRisk: input.continuityRisk,
          stabilizationConfidence:
            input.lifecycleDecision.stabilizationConfidence,
          nextStatus: input.lifecycleDecision.nextStatus,
        }),

      intervention_is_not_recovery: true,
      continuity_memory_preserved: true,
      institutional_traceability: true,
      executive_visibility_enabled:
        visibilityLevel === 'EXECUTIVE',

      governance_boundary:
        'NON_PUNITIVE_CONTINUITY_GOVERNANCE',
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
  completionStatus: string
  commandVisibility: boolean
}): AuditSeverity {
  if (
    input.continuityRisk === 'CRITICAL' ||
    input.completionStatus === 'ESCALATION_REQUIRED'
  ) {
    return 'CRITICAL'
  }

  if (
    input.continuityRisk === 'HIGH' ||
    input.commandVisibility
  ) {
    return 'HIGH'
  }

  if (input.continuityRisk === 'MODERATE') {
    return 'MODERATE'
  }

  return 'LOW'
}

function resolveInterventionGovernancePosture(input: {
  continuityRisk: ContinuityRisk
  completionStatus: string
  commandVisibility: boolean
  shouldEscalate: boolean
}) {
  if (
    input.continuityRisk === 'CRITICAL' ||
    input.completionStatus === 'ESCALATION_REQUIRED' ||
    input.shouldEscalate
  ) {
    return 'EXECUTIVE_REVIEW'
  }

  if (
    input.continuityRisk === 'HIGH' ||
    input.commandVisibility ||
    input.completionStatus === 'FOLLOW_UP_REQUIRED' ||
    input.completionStatus === 'INTERRUPTED'
  ) {
    return 'GOVERNANCE_WATCH'
  }

  if (input.continuityRisk === 'MODERATE') {
    return 'RECOVERY_MONITORING'
  }

  return 'STABILIZATION_EVIDENCE_HOLDING'
}

function buildInterventionSurvivabilityContext(input: {
  caseItem: BeneficiaryCase
  completionStatus: string
  continuityRisk: ContinuityRisk
  stabilizationConfidence: string
  nextStatus: string
}) {
  return `Intervention completion is ${input.completionStatus.toLowerCase()} with ${input.continuityRisk.toLowerCase()} continuity risk and ${input.stabilizationConfidence.toLowerCase()} stabilization confidence. The case moves toward ${input.nextStatus.toLowerCase()}. Recovery is not assumed; survivability depends on follow-up, monitoring, escalation handling, and durable stabilization evidence.`
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