'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type CreatedRequest = {
  id: string
  subject: string
  problem: string
  preferred_time: string | null
  grade_level: string | null
  status: string
  teacher_status: string | null
}

type IntakeIntelligence = {
  visibilityClassification: string
  governanceReadiness: string
  ownershipPosture: string
  evidencePosture: string
  stabilizationRisk: string
  commandMeaning: string
}

const instabilityClassOptions = [
  {
    value: 'FLOW',
    label: 'FLOW',
    description: 'Work is delayed, stuck, backed up, or not moving clearly.',
  },
  {
    value: 'COVERAGE',
    label: 'COVERAGE',
    description: 'Staffing, capacity, support, or resources are not enough.',
  },
  {
    value: 'COORDINATION',
    label: 'COORDINATION',
    description: 'Teams, sites, or functions are not aligned clearly.',
  },
  {
    value: 'OWNERSHIP',
    label: 'OWNERSHIP',
    description: 'Responsibility is unclear, missing, disputed, or changing.',
  },
  {
    value: 'EVIDENCE',
    label: 'EVIDENCE',
    description: 'Completion or improvement cannot yet be confirmed.',
  },
  {
    value: 'RECOVERY',
    label: 'RECOVERY',
    description: 'The situation improved but may not be holding yet.',
  },
  {
    value: 'RELIABILITY',
    label: 'RELIABILITY',
    description: 'Operations are becoming unpredictable or inconsistent.',
  },
]

const entryRoutes = [
  'HUMAN_SUBMITTED',
  'SYSTEM_DETECTED',
  'GOVERNANCE_INITIATED',
]

const severityLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']

const locationOptions = [
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

const affectedAreaOptions = [
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

const visibleSignalOptions = [
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

const ownershipStates = [
  'CLEAR',
  'UNCLEAR',
  'MISSING',
  'TRANSFERRED',
  'CONTESTED',
]

const evidenceLevels = [
  'NONE',
  'LIMITED',
  'PARTIAL',
  'SUFFICIENT',
  'CONFIRMED',
]

const reviewUrgencyOptions = [
  'NEXT_SHIFT',
  'TODAY',
  'WITHIN_24_HOURS',
  'WITHIN_48_HOURS',
  'ROUTINE_REVIEW',
]

const flowSteps = [
  {
    title: 'Visibility opened',
    body: 'Visible instability is captured with governed context.',
  },
  {
    title: 'Triage decision',
    body: 'CGI decides whether it needs governance, clarity, escalation, monitoring, or closure.',
  },
  {
    title: 'Case acceptance',
    body: 'Accepted instability becomes an active continuity governance case.',
  },
  {
    title: 'Routing direction',
    body: 'Routing identifies the next stabilization movement and owner posture.',
  },
  {
    title: 'Stabilization evidence',
    body: 'Interventions and outcomes confirm whether the situation is improving.',
  },
  {
    title: 'Recovery memory',
    body: 'CGI checks whether recovery holds and preserves institutional memory.',
  },
]

const exampleSignals = [
  'Repeated routing delays between teams',
  'Backlog continues growing after action was taken',
  'The same handoff problem keeps returning',
  'Ownership is unclear across a site, unit, or function',
  'Recovery was reported, but improvement has not been confirmed',
]

const typicalUsers = [
  'site leads',
  'operations coordinators',
  'supervisors',
  'governance reviewers',
  'command reviewers',
]

export default function RequestPage() {
  const router = useRouter()

  const [entryRoute, setEntryRoute] = useState('HUMAN_SUBMITTED')
  const [instabilityClass, setInstabilityClass] = useState('FLOW')
  const [severity, setSeverity] = useState('MODERATE')
  const [location, setLocation] = useState('SITE_A')
  const [affectedArea, setAffectedArea] = useState('ROUTING')
  const [visibleSignal, setVisibleSignal] = useState('ROUTING_DELAY')
  const [ownershipState, setOwnershipState] = useState('UNCLEAR')
  const [evidenceLevel, setEvidenceLevel] = useState('LIMITED')
  const [reviewUrgency, setReviewUrgency] = useState('WITHIN_24_HOURS')
  const [briefNote, setBriefNote] = useState('')
  const [message, setMessage] = useState('')
  const [createdRequest, setCreatedRequest] =
    useState<CreatedRequest | null>(null)
  const [loading, setLoading] = useState(false)

  const selectedClassDescription = useMemo(() => {
    return (
      instabilityClassOptions.find((item) => item.value === instabilityClass)
        ?.description ?? ''
    )
  }, [instabilityClass])

  const generatedIntakeIdentity = useMemo(() => {
    return [
      instabilityClass,
      visibleSignal,
      location,
      affectedArea,
      severity,
    ].join(' • ')
  }, [instabilityClass, visibleSignal, location, affectedArea, severity])

  const intakeIntelligence = useMemo(() => {
    return buildIntakeIntelligence({
      severity,
      ownershipState,
      evidenceLevel,
      location,
      visibleSignal,
      reviewUrgency,
      entryRoute,
    })
  }, [
    severity,
    ownershipState,
    evidenceLevel,
    location,
    visibleSignal,
    reviewUrgency,
    entryRoute,
  ])

  const governanceVisibility = useMemo(() => {
    return resolveGovernanceVisibility({
      severity,
      ownershipState,
      evidenceLevel,
      location,
      visibleSignal,
    })
  }, [severity, ownershipState, evidenceLevel, location, visibleSignal])

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLoading(true)
    setMessage('Preserving visible instability for governance review...')
    setCreatedRequest(null)

    const problemSummary = [
      `Generated intake identity: ${generatedIntakeIdentity}`,
      `Entry route: ${entryRoute}`,
      `Operational pressure type: ${instabilityClass}`,
      `Pressure meaning: ${selectedClassDescription}`,
      `Difficulty level: ${severity}`,
      `Severity meaning: ${resolveSeverityMeaning(severity)}`,
      `Location: ${location}`,
      `Affected area: ${affectedArea}`,
      `Visible signal: ${visibleSignal}`,
      `Ownership state: ${ownershipState}`,
      `Evidence level: ${evidenceLevel}`,
      `Review urgency: ${reviewUrgency}`,
      `Governance visibility: ${governanceVisibility}`,
      `Visibility classification: ${intakeIntelligence.visibilityClassification}`,
      `Governance readiness: ${intakeIntelligence.governanceReadiness}`,
      `Ownership posture: ${intakeIntelligence.ownershipPosture}`,
      `Evidence posture: ${intakeIntelligence.evidencePosture}`,
      `Stabilization risk: ${intakeIntelligence.stabilizationRisk}`,
      `Command meaning: ${intakeIntelligence.commandMeaning}`,
      `Brief note: ${briefNote.trim() || 'No additional note provided'}`,
    ].join('\n')

    const { data, error } = await supabase
      .from('lesson_requests')
      .insert({
        subject: generatedIntakeIdentity,
        grade_level: location,
        problem: problemSummary,
        preferred_time: reviewUrgency,
        status: 'PENDING_TRIAGE',
        teacher_status: governanceVisibility,
      })
      .select()
      .single()

    if (error || !data) {
      console.error(error)
      setMessage('Submission failed. Visible instability was not preserved.')
      setLoading(false)
      return
    }

    setCreatedRequest(data)
    setMessage(
      'Visible instability preserved for governance review. CGI triage can now determine whether this should be monitored, clarified, escalated, merged, or accepted into active continuity governance.'
    )

    setEntryRoute('HUMAN_SUBMITTED')
    setInstabilityClass('FLOW')
    setSeverity('MODERATE')
    setLocation('SITE_A')
    setAffectedArea('ROUTING')
    setVisibleSignal('ROUTING_DELAY')
    setOwnershipState('UNCLEAR')
    setEvidenceLevel('LIMITED')
    setReviewUrgency('WITHIN_24_HOURS')
    setBriefNote('')
    setLoading(false)
  }

  async function copyRequestId() {
    if (!createdRequest) return
    await navigator.clipboard.writeText(createdRequest.id)
    alert('Request ID copied.')
  }

  function checkRequestStatus() {
    if (!createdRequest) return
    router.push(`/student-dashboard?lessonId=${createdRequest.id}`)
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <header style={styles.hero}>
          <p style={styles.eyebrow}>
            TSINAXA CGI • GOVERNED INTAKE INTELLIGENCE
          </p>

          <h1 style={styles.h1}>
            Open Visible Instability
          </h1>

          <p style={styles.heroText}>
            Use this surface when instability becomes visible and needs
            governed continuity review before it can become a case, be routed,
            acted on, or confirmed as stabilizing.
          </p>
        </header>

        <section style={styles.metricsGrid}>
          <Metric label="Current Entry Route" value={entryRoute} />
          <Metric label="Pressure Type" value={instabilityClass} />
          <Metric label="Severity" value={severity} />
          <Metric label="Ownership" value={ownershipState} />
          <Metric label="Evidence" value={evidenceLevel} />
          <Metric label="Visibility" value={governanceVisibility} />
        </section>

        <section style={styles.identityCard}>
          <p style={styles.eyebrow}>Generated intake identity</p>

          <h2 style={styles.identityValue}>{generatedIntakeIdentity}</h2>

          <p style={styles.cardText}>
            This identity is generated from governed selections so visible
            instability remains comparable, searchable, and ready for triage.
          </p>

          <div style={styles.badgeRow}>
            <span style={styles.signalBadge}>{instabilityClass}</span>
            <span style={styles.signalBadge}>{visibleSignal}</span>
            <span style={styles.signalBadge}>{location}</span>
            <span style={styles.signalBadge}>{affectedArea}</span>
            <span style={styles.signalBadge}>{severity}</span>
          </div>
        </section>

        <section style={styles.intelligenceCard}>
          <p style={styles.eyebrow}>Intake intelligence panel</p>

          <h2 style={styles.h2}>What does this visible instability mean?</h2>

          <div style={styles.intelligenceGrid}>
            <IntelligenceItem
              label="Visibility Classification"
              value={intakeIntelligence.visibilityClassification}
            />

            <IntelligenceItem
              label="Governance Readiness"
              value={intakeIntelligence.governanceReadiness}
            />

            <IntelligenceItem
              label="Ownership Posture"
              value={intakeIntelligence.ownershipPosture}
            />

            <IntelligenceItem
              label="Evidence Posture"
              value={intakeIntelligence.evidencePosture}
            />

            <IntelligenceItem
              label="Stabilization Risk"
              value={intakeIntelligence.stabilizationRisk}
            />

            <IntelligenceItem
              label="Command Meaning"
              value={intakeIntelligence.commandMeaning}
            />
          </div>
        </section>

        <section style={styles.guidanceGrid}>
          <article style={styles.guidanceCard}>
            <p style={styles.eyebrow}>Boundary lock</p>

            <h2 style={styles.h2}>A request is not yet a case.</h2>

            <p style={styles.cardText}>
              This page opens governed visibility. Triage decides whether the
              instability should be monitored, returned for clarity, escalated,
              merged, closed, or accepted into active case governance.
            </p>
          </article>

          <article style={styles.guidanceCard}>
            <p style={styles.eyebrow}>Typical users</p>

            <h2 style={styles.h2}>Who usually opens visibility?</h2>

            <div style={styles.pillGrid}>
              {typicalUsers.map((user) => (
                <span key={user} style={styles.pill}>
                  {user}
                </span>
              ))}
            </div>
          </article>
        </section>

        <section style={styles.flowCard}>
          <p style={styles.eyebrow}>From visibility to survivability</p>

          <h2 style={styles.h2}>CGI begins when instability becomes visible.</h2>

          <p style={styles.cardText}>
            Intake preserves the signal. Triage judges it. Cases govern it.
            Routing directs it. Interventions act on it. Outcomes verify it.
            Recovery determines whether stabilization is holding.
          </p>

          <div style={styles.flowGrid}>
            {flowSteps.map((step, index) => (
              <article key={step.title} style={styles.flowStep}>
                <p style={styles.stepNumber}>0{index + 1}</p>

                <h3 style={styles.stepTitle}>{step.title}</h3>

                <p style={styles.stepBody}>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.examplesCard}>
          <p style={styles.eyebrow}>Examples</p>

          <h2 style={styles.h2}>What belongs in governed intake?</h2>

          <div style={styles.exampleGrid}>
            {exampleSignals.map((example) => (
              <article key={example} style={styles.exampleItem}>
                {example}
              </article>
            ))}
          </div>
        </section>

        <section style={styles.classCard}>
          <p style={styles.eyebrow}>Operational pressure types</p>

          <h2 style={styles.h2}>What do these categories mean?</h2>

          <div style={styles.classGrid}>
            {instabilityClassOptions.map((item) => (
              <article key={item.value} style={styles.classItem}>
                <h3 style={styles.classTitle}>{item.label}</h3>

                <p style={styles.classText}>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.eyebrow}>Governed instability intake</p>

          <h2 style={styles.h2}>What has become visible?</h2>

          <p style={styles.cardText}>
            Select the closest governed options first. Use the note only for
            short context that cannot be captured by the dropdowns.
          </p>

          <form onSubmit={submitRequest} style={styles.form}>
            <label style={styles.label}>
              How did this enter CGI?
              <select
                value={entryRoute}
                onChange={(event) => setEntryRoute(event.target.value)}
                style={styles.input}
              >
                {entryRoutes.map((route) => (
                  <option key={route}>{route}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              What kind of operational pressure is visible?
              <select
                value={instabilityClass}
                onChange={(event) => setInstabilityClass(event.target.value)}
                style={styles.input}
              >
                {instabilityClassOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <span style={styles.helperText}>{selectedClassDescription}</span>
            </label>

            <label style={styles.label}>
              How difficult is this becoming to manage?
              <select
                value={severity}
                onChange={(event) => setSeverity(event.target.value)}
                style={styles.input}
              >
                {severityLevels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
              <span style={styles.helperText}>
                {resolveSeverityMeaning(severity)}
              </span>
            </label>

            <label style={styles.label}>
              Where is this happening?
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                style={styles.input}
              >
                {locationOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              What area is affected?
              <select
                value={affectedArea}
                onChange={(event) => setAffectedArea(event.target.value)}
                style={styles.input}
              >
                {affectedAreaOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              What visible signal is present?
              <select
                value={visibleSignal}
                onChange={(event) => setVisibleSignal(event.target.value)}
                style={styles.input}
              >
                {visibleSignalOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              What is the ownership state?
              <select
                value={ownershipState}
                onChange={(event) => setOwnershipState(event.target.value)}
                style={styles.input}
              >
                {ownershipStates.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              What evidence is already available?
              <select
                value={evidenceLevel}
                onChange={(event) => setEvidenceLevel(event.target.value)}
                style={styles.input}
              >
                {evidenceLevels.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Review urgency
              <select
                value={reviewUrgency}
                onChange={(event) => setReviewUrgency(event.target.value)}
                style={styles.input}
              >
                {reviewUrgencyOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Brief operational note
              <textarea
                value={briefNote}
                onChange={(event) => setBriefNote(event.target.value)}
                placeholder="Optional: add one short sentence if the dropdowns do not fully capture the context."
                style={styles.smallTextarea}
              />
            </label>

            <button type="submit" disabled={loading} style={styles.primaryButton}>
              {loading
                ? 'Preserving Instability...'
                : 'Preserve Visible Instability for Triage'}
            </button>
          </form>

          {message && <p style={styles.message}>{message}</p>}
        </section>

        {createdRequest && (
          <section style={styles.successCard}>
            <p style={styles.eyebrow}>Governance visibility opened</p>

            <h2 style={styles.h2}>Request preserved for triage</h2>

            <div style={styles.requestIdBox}>{createdRequest.id}</div>

            <p style={styles.smallText}>
              This request opens visibility only. It becomes a case only if CGI
              triage accepts it into active continuity governance.
            </p>

            <div style={styles.createdGrid}>
              <CreatedDetail
                label="Intake Identity"
                value={createdRequest.subject}
              />

              <CreatedDetail
                label="Location"
                value={createdRequest.grade_level ?? 'Not recorded'}
              />

              <CreatedDetail
                label="Triage State"
                value={createdRequest.status}
              />

              <CreatedDetail
                label="Governance Visibility"
                value={createdRequest.teacher_status ?? 'GOVERNANCE'}
              />
            </div>

            <div style={styles.buttonGrid}>
              <button
                type="button"
                onClick={copyRequestId}
                style={styles.primaryButton}
              >
                Copy Request ID
              </button>

              <button
                type="button"
                onClick={checkRequestStatus}
                style={styles.secondaryButton}
              >
                Check Review Status
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function buildIntakeIntelligence(input: {
  severity: string
  ownershipState: string
  evidenceLevel: string
  location: string
  visibleSignal: string
  reviewUrgency: string
  entryRoute: string
}): IntakeIntelligence {
  const ownershipUnclear = ['UNCLEAR', 'MISSING', 'CONTESTED'].includes(
    input.ownershipState
  )

  const evidenceWeak = ['NONE', 'LIMITED'].includes(input.evidenceLevel)

  const crossSite =
    input.location === 'CROSS_SITE' ||
    input.visibleSignal === 'CROSS_TEAM_CONFUSION'

  if (input.severity === 'CRITICAL') {
    return {
      visibilityClassification: 'Critical visible instability',
      governanceReadiness: 'Immediate triage and command visibility recommended',
      ownershipPosture: ownershipUnclear
        ? 'Ownership unclear under critical conditions'
        : 'Ownership present but urgent confirmation needed',
      evidencePosture: evidenceWeak
        ? 'Evidence weak under critical conditions'
        : 'Evidence available for immediate review',
      stabilizationRisk: 'High risk if review is delayed',
      commandMeaning:
        'This signal may threaten continuity if not governed quickly.',
    }
  }

  if (input.severity === 'HIGH') {
    return {
      visibilityClassification: 'High-pressure visible instability',
      governanceReadiness: 'Triage review likely required',
      ownershipPosture: ownershipUnclear
        ? 'Ownership gap may slow stabilization'
        : 'Ownership appears available',
      evidencePosture: evidenceWeak
        ? 'Evidence may be insufficient for confident routing'
        : 'Evidence appears usable for triage',
      stabilizationRisk: 'Moderate to high if unresolved',
      commandMeaning:
        'This signal may become broader continuity pressure if movement stalls.',
    }
  }

  if (ownershipUnclear || evidenceWeak || crossSite) {
    return {
      visibilityClassification: 'Visible instability with governance concern',
      governanceReadiness: 'Ready for triage review',
      ownershipPosture: ownershipUnclear
        ? 'Ownership requires clarification'
        : 'Ownership appears manageable',
      evidencePosture: evidenceWeak
        ? 'Evidence requires strengthening'
        : 'Evidence appears sufficient for review',
      stabilizationRisk: crossSite
        ? 'Cross-site spread may increase instability'
        : 'Moderate if not reviewed',
      commandMeaning:
        'The signal should remain visible until triage confirms the correct path.',
    }
  }

  return {
    visibilityClassification: 'Routine visible instability',
    governanceReadiness: 'Ready for standard triage',
    ownershipPosture: 'Ownership appears clear',
    evidencePosture: 'Evidence appears sufficient for triage',
    stabilizationRisk: 'Low to moderate if tracked promptly',
    commandMeaning:
      'The signal can enter ordinary governance review without immediate escalation.',
  }
}

function resolveGovernanceVisibility(input: {
  severity: string
  ownershipState: string
  evidenceLevel: string
  location: string
  visibleSignal: string
}) {
  if (input.severity === 'CRITICAL') return 'COMMAND_VISIBILITY'
  if (input.severity === 'HIGH') return 'EXECUTIVE_VISIBILITY'

  if (
    input.location === 'CROSS_SITE' ||
    input.visibleSignal === 'CROSS_TEAM_CONFUSION'
  ) {
    return 'CROSS_SITE_VISIBILITY'
  }

  if (
    ['UNCLEAR', 'MISSING', 'CONTESTED'].includes(input.ownershipState) ||
    ['NONE', 'LIMITED'].includes(input.evidenceLevel)
  ) {
    return 'GOVERNANCE_VISIBILITY'
  }

  return 'STANDARD_VISIBILITY'
}

function resolveSeverityMeaning(severity: string) {
  if (severity === 'CRITICAL') {
    return 'Executive visibility recommended immediately.'
  }

  if (severity === 'HIGH') {
    return 'Stabilization delay may increase continuity risk.'
  }

  if (severity === 'MODERATE') {
    return 'Governance review may be required before the issue becomes harder to stabilize.'
  }

  return 'Localized operational visibility; monitor for recurrence or spread.'
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
    </article>
  )
}

function IntelligenceItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <article style={styles.intelligenceItem}>
      <p style={styles.intelligenceLabel}>{label}</p>
      <p style={styles.intelligenceValue}>{value}</p>
    </article>
  )
}

function CreatedDetail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <article style={styles.createdDetail}>
      <p style={styles.createdLabel}>{label}</p>
      <p style={styles.createdValue}>{value}</p>
    </article>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg, #111827 0%, #0f172a 48%, #020617 100%)',
    color: '#ffffff',
    padding: '56px 22px 140px',
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },

  wrap: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
  },

  hero: {
    marginBottom: '28px',
  },

  eyebrow: {
    margin: '0 0 10px',
    color: '#cbd5e1',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },

  h1: {
    margin: 0,
    color: '#ffffff',
    fontSize: 'clamp(42px, 8vw, 72px)',
    lineHeight: 0.94,
    letterSpacing: '-0.07em',
    fontWeight: 900,
  },

  h2: {
    margin: 0,
    color: '#ffffff',
    fontSize: '28px',
    letterSpacing: '-0.04em',
    fontWeight: 900,
    lineHeight: 1.1,
  },

  heroText: {
    maxWidth: '820px',
    color: '#cbd5e1',
    fontSize: '18px',
    lineHeight: 1.68,
    marginTop: '18px',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '14px',
    marginBottom: '28px',
  },

  metricCard: {
    background: '#0f172a',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '18px',
    padding: '16px',
  },

  metricLabel: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },

  metricValue: {
    margin: '8px 0 0',
    color: '#f8fafc',
    fontSize: '14px',
    fontWeight: 900,
    lineHeight: 1.35,
    wordBreak: 'break-word',
  },

  identityCard: {
    background: '#020617',
    color: '#ffffff',
    border: '1px solid rgba(20,184,166,0.34)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.3)',
    padding: '30px',
    marginBottom: '28px',
  },

  identityValue: {
    color: '#a7f3d0',
    fontSize: 'clamp(24px, 4vw, 38px)',
    fontWeight: 900,
    lineHeight: 1.12,
    margin: 0,
    wordBreak: 'break-word',
  },

  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '18px',
  },

  signalBadge: {
    background: '#111827',
    color: '#a7f3d0',
    borderRadius: '999px',
    padding: '7px 11px',
    fontSize: '11px',
    fontWeight: 900,
    border: '1px solid rgba(167,243,208,0.22)',
  },

  intelligenceCard: {
    background: '#0f172a',
    color: '#ffffff',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.3)',
    padding: '30px',
    marginBottom: '28px',
  },

  intelligenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '12px',
    marginTop: '22px',
  },

  intelligenceItem: {
    background: '#020617',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '16px',
    padding: '14px',
  },

  intelligenceLabel: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },

  intelligenceValue: {
    margin: '8px 0 0',
    color: '#f8fafc',
    fontSize: '13px',
    fontWeight: 800,
    lineHeight: 1.45,
  },

  guidanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },

  guidanceCard: {
    background: 'rgba(15,23,42,0.9)',
    color: '#ffffff',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '24px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
    padding: '24px',
  },

  flowCard: {
    background: 'rgba(15,23,42,0.92)',
    color: '#ffffff',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
    padding: '30px',
    marginBottom: '28px',
  },

  examplesCard: {
    background: '#020617',
    color: '#ffffff',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.3)',
    padding: '30px',
    marginBottom: '28px',
  },

  classCard: {
    background: '#111827',
    color: '#ffffff',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.3)',
    padding: '30px',
    marginBottom: '28px',
  },

  card: {
    background: '#0f172a',
    color: '#ffffff',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.36)',
    padding: '30px',
    marginBottom: '28px',
  },

  successCard: {
    background: '#0f172a',
    color: '#ffffff',
    border: '1px solid rgba(34,197,94,0.34)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.36)',
    padding: '30px',
  },

  cardText: {
    color: '#cbd5e1',
    lineHeight: 1.65,
    margin: '12px 0 0',
    maxWidth: '780px',
  },

  pillGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '18px',
  },

  pill: {
    background: '#020617',
    border: '1px solid rgba(148,163,184,0.28)',
    borderRadius: '999px',
    color: '#e2e8f0',
    padding: '9px 12px',
    fontSize: '13px',
    fontWeight: 800,
    textTransform: 'capitalize',
  },

  flowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginTop: '22px',
  },

  flowStep: {
    background: '#020617',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '160px',
  },

  stepNumber: {
    margin: 0,
    color: '#a7f3d0',
    fontWeight: 900,
    fontSize: '13px',
    letterSpacing: '0.12em',
  },

  stepTitle: {
    margin: '10px 0',
    color: '#ffffff',
    fontSize: '17px',
    lineHeight: 1.15,
  },

  stepBody: {
    margin: 0,
    color: '#cbd5e1',
    lineHeight: 1.55,
    fontSize: '13px',
  },

  exampleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
    marginTop: '22px',
  },

  exampleItem: {
    background: '#111827',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '16px',
    color: '#e2e8f0',
    padding: '14px',
    minHeight: '100px',
    fontSize: '14px',
    lineHeight: 1.45,
    fontWeight: 800,
  },

  classGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '10px',
    marginTop: '22px',
  },

  classItem: {
    background: '#020617',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '16px',
    padding: '14px',
    minHeight: '145px',
  },

  classTitle: {
    color: '#a7f3d0',
    fontSize: '14px',
    fontWeight: 900,
    letterSpacing: '0.08em',
    margin: 0,
  },

  classText: {
    color: '#cbd5e1',
    fontSize: '13px',
    lineHeight: 1.45,
    margin: '10px 0 0',
  },

  form: {
    display: 'grid',
    gap: '16px',
    marginTop: '24px',
  },

  label: {
    display: 'grid',
    gap: '8px',
    color: '#f8fafc',
    fontWeight: 900,
    fontSize: '14px',
  },

  helperText: {
    color: '#cbd5e1',
    fontSize: '13px',
    fontWeight: 700,
    lineHeight: 1.45,
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '16px',
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
  },

  smallTextarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '16px',
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
    minHeight: '120px',
    resize: 'vertical',
  },

  primaryButton: {
    width: '100%',
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
    background: '#e2e8f0',
    color: '#020617',
  },

  secondaryButton: {
    width: '100%',
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
    background: '#a7f3d0',
    color: '#022c22',
  },

  message: {
    marginTop: '18px',
    background: 'rgba(148,163,184,0.14)',
    color: '#e2e8f0',
    padding: '16px 18px',
    borderRadius: '18px',
    fontWeight: 900,
    border: '1px solid rgba(148,163,184,0.24)',
  },

  requestIdBox: {
    marginTop: '18px',
    background: '#1e293b',
    color: '#ffffff',
    borderRadius: '18px',
    padding: '18px',
    wordBreak: 'break-word',
    fontWeight: 900,
    lineHeight: 1.5,
  },

  smallText: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    marginTop: '16px',
  },

  createdGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
    marginTop: '18px',
  },

  createdDetail: {
    background: '#020617',
    border: '1px solid rgba(148,163,184,0.26)',
    borderRadius: '16px',
    padding: '14px',
  },

  createdLabel: {
    margin: 0,
    color: '#a7f3d0',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },

  createdValue: {
    margin: '8px 0 0',
    color: '#f8fafc',
    fontWeight: 900,
    lineHeight: 1.35,
    wordBreak: 'break-word',
  },

  buttonGrid: {
    display: 'grid',
    gap: '12px',
    marginTop: '18px',
  },
}