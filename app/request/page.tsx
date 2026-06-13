'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type CreatedRequest = {
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
}

type IntakeIntelligence = {
  visibilityClassification: string
  intakeMaturity: string
  intakeConfidence: string
  governanceReadiness: string
  ownershipPosture: string
  evidencePosture: string
  stabilizationRisk: string
  triageMeaning: string
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
  const [createdRequest, setCreatedRequest] = useState<CreatedRequest | null>(
    null,
  )
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
    setMessage('Preserving visible instability for CGI triage review...')
    setCreatedRequest(null)

    const intakeMemory = buildPersistedIntakeMemory({
      generatedIntakeIdentity,
      entryRoute,
      instabilityClass,
      selectedClassDescription,
      severity,
      location,
      affectedArea,
      visibleSignal,
      ownershipState,
      evidenceLevel,
      reviewUrgency,
      governanceVisibility,
      intakeIntelligence,
      briefNote,
    })

    const { data, error } = await supabase
      .from('beneficiary_cases')
      .insert({
        beneficiary_name: generatedIntakeIdentity,
        beneficiary_level: location,
        support_domain: instabilityClass,
        case_status: 'PENDING_TRIAGE',
        severity_level: severity,
        instability_signals: [
          visibleSignal,
          affectedArea,
          `ENTRY_ROUTE:${entryRoute}`,
          `OWNERSHIP_STATE:${ownershipState}`,
          `EVIDENCE_LEVEL:${evidenceLevel}`,
          `REVIEW_URGENCY:${reviewUrgency}`,
          `GOVERNANCE_VISIBILITY:${governanceVisibility}`,
          `VISIBILITY_CLASSIFICATION:${intakeIntelligence.visibilityClassification}`,
          `INTAKE_MATURITY:${intakeIntelligence.intakeMaturity}`,
          `INTAKE_CONFIDENCE:${intakeIntelligence.intakeConfidence}`,
          `GOVERNANCE_READINESS:${intakeIntelligence.governanceReadiness}`,
          `OWNERSHIP_POSTURE:${intakeIntelligence.ownershipPosture}`,
          `EVIDENCE_POSTURE:${intakeIntelligence.evidencePosture}`,
          `STABILIZATION_RISK:${intakeIntelligence.stabilizationRisk}`,
          `TRIAGE_MEANING:${intakeIntelligence.triageMeaning}`,
          `COMMAND_MEANING:${intakeIntelligence.commandMeaning}`,
        ],
        region: affectedArea,
        institution_name: ownershipState,
        safeguarding_flag:
          severity === 'CRITICAL' ||
          governanceVisibility === 'COMMAND_VISIBILITY' ||
          governanceVisibility === 'EXECUTIVE_VISIBILITY',
        intervention_summary: intakeMemory,
        outcome_summary: intakeMemory,
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
      'Visible instability preserved successfully. The signal is now waiting inside CGI triage for eligibility review, clarification, escalation, closure, or acceptance into case governance.',
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

  function openTriageQueue() {
    router.push('/triage')
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <section className="mx-auto max-w-7xl px-6 py-8">
        {message && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-semibold text-amber-100">
            {message}
          </div>
        )}

        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
          TSINAXA CGI • GOVERNED INTAKE INTELLIGENCE
        </p>

        <div className="mt-4 rounded-3xl border border-neutral-800 bg-neutral-950/80 p-6 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white">
            Open Visible Instability
          </h2>

          <p className="mt-3 max-w-5xl text-sm leading-6 text-neutral-300">
            Preserve visible instability using governed operational selections.
            Intake opens continuity visibility before triage, case governance,
            routing, action, outcome verification, or recovery durability begins.
          </p>

          <p className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
            <span className="font-semibold">Boundary:</span> /request opens
            visibility. It does not accept the case, route ownership, execute
            stabilization action, verify outcomes, declare recovery, or erase
            structural continuity memory.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <IntakePanel
            title="Intake Visibility Climate"
            value={intakeIntelligence.visibilityClassification}
          />
          <IntakePanel
            title="Triage Readiness Posture"
            value={intakeIntelligence.governanceReadiness}
          />
          <IntakePanel
            title="Evidence Threshold Visibility"
            value={intakeIntelligence.evidencePosture}
          />
          <IntakePanel
            title="Command Visibility Meaning"
            value={intakeIntelligence.commandMeaning}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-black p-6">
          <h3 className="text-lg font-semibold text-white">
            Intake Pressure Intelligence
          </h3>

          <p className="mt-3 text-sm leading-6 text-neutral-300">
            {intakeIntelligence.triageMeaning}
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-black p-6">
          <h3 className="text-lg font-semibold text-white">
            Generated Intake Identity
          </h3>

          <p className="mt-3 text-xl font-semibold leading-7 text-amber-100">
            {generatedIntakeIdentity}
          </p>

          <p className="mt-3 max-w-4xl text-sm leading-6 text-neutral-400">
            This identity is generated from governed selections so visible
            instability remains comparable, searchable, and ready for triage.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <SignalBadge>{instabilityClass}</SignalBadge>
            <SignalBadge>{visibleSignal}</SignalBadge>
            <SignalBadge>{location}</SignalBadge>
            <SignalBadge>{affectedArea}</SignalBadge>
            <SignalBadge>{severity}</SignalBadge>
            <SignalBadge>{governanceVisibility}</SignalBadge>
          </div>
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.05fr]">
          <section className="rounded-3xl border border-neutral-800 bg-black p-6">
            <h3 className="text-xl font-semibold text-white">
              Operational Intake Workspace
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              Preserve visible instability using standardized operational
              choices. Triage will decide whether the signal should be accepted,
              clarified, escalated, closed, or held for stronger evidence.
            </p>

            <form onSubmit={submitRequest} className="mt-6 space-y-5">
              <Select
                label="How did this enter CGI?"
                value={entryRoute}
                setValue={setEntryRoute}
                options={entryRoutes}
              />

              <Select
                label="What kind of operational pressure is visible?"
                value={instabilityClass}
                setValue={setInstabilityClass}
                options={instabilityClassOptions.map((item) => item.value)}
                helper={selectedClassDescription}
              />

              <Select
                label="How difficult is this becoming to manage?"
                value={severity}
                setValue={setSeverity}
                options={severityLevels}
                helper={resolveSeverityMeaning(severity)}
              />

              <Select
                label="Where is this happening?"
                value={location}
                setValue={setLocation}
                options={locationOptions}
              />

              <Select
                label="What area is affected?"
                value={affectedArea}
                setValue={setAffectedArea}
                options={affectedAreaOptions}
              />

              <Select
                label="What visible signal is present?"
                value={visibleSignal}
                setValue={setVisibleSignal}
                options={visibleSignalOptions}
              />

              <Select
                label="What is the ownership state?"
                value={ownershipState}
                setValue={setOwnershipState}
                options={ownershipStates}
              />

              <Select
                label="What evidence is already available?"
                value={evidenceLevel}
                setValue={setEvidenceLevel}
                options={evidenceLevels}
              />

              <Select
                label="Review urgency"
                value={reviewUrgency}
                setValue={setReviewUrgency}
                options={reviewUrgencyOptions}
              />

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Brief operational note
                </span>

                <textarea
                  value={briefNote}
                  onChange={(event) => setBriefNote(event.target.value)}
                  rows={5}
                  placeholder="Optional: add one short sentence if the dropdowns do not fully capture the context."
                  className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300 disabled:opacity-60"
              >
                {loading
                  ? 'Preserving Visible Instability...'
                  : 'Preserve Visible Instability for Triage'}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-neutral-800 bg-black p-6">
            <h3 className="text-xl font-semibold text-white">
              Intake Intelligence Panel
            </h3>

            <p className="mt-3 text-sm leading-6 text-neutral-400">
              This synthesis explains the intake meaning before triage accepts,
              pauses, escalates, or closes the signal.
            </p>

            <div className="mt-6 divide-y divide-neutral-800 rounded-2xl border border-neutral-800">
              <Info
                label="Visibility Classification"
                value={intakeIntelligence.visibilityClassification}
              />
              <Info
                label="Intake Maturity"
                value={intakeIntelligence.intakeMaturity}
              />
              <Info
                label="Intake Confidence"
                value={intakeIntelligence.intakeConfidence}
              />
              <Info
                label="Governance Readiness"
                value={intakeIntelligence.governanceReadiness}
              />
              <Info
                label="Ownership Posture"
                value={intakeIntelligence.ownershipPosture}
              />
              <Info
                label="Evidence Posture"
                value={intakeIntelligence.evidencePosture}
              />
              <Info
                label="Stabilization Risk"
                value={intakeIntelligence.stabilizationRisk}
              />
              <Info
                label="Triage Meaning"
                value={intakeIntelligence.triageMeaning}
              />
              <Info
                label="Command Meaning"
                value={intakeIntelligence.commandMeaning}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-400">
                Lifecycle Boundary
              </h4>

              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Request is not triage. Triage is not case governance. Case
                governance is not routing. Routing is not action. Action is not
                outcome. Outcome is not recovery.
              </p>
            </div>
          </section>
        </section>

        {createdRequest && (
          <section className="mt-8 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
              Governance Visibility Opened
            </p>

            <h3 className="mt-3 text-2xl font-semibold text-white">
              Request preserved for triage
            </h3>

            <div className="mt-5 rounded-2xl border border-amber-500/30 bg-black p-4 text-sm font-semibold leading-6 text-amber-100">
              {createdRequest.id}
            </div>

            <p className="mt-4 max-w-4xl text-sm leading-6 text-amber-50">
              Intake visibility has been opened successfully. CGI triage now
              determines whether this instability should be clarified, escalated,
              closed, or accepted into active continuity governance.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <CreatedDetail
                label="Intake Identity"
                value={createdRequest.beneficiary_name}
              />
              <CreatedDetail
                label="Location"
                value={createdRequest.beneficiary_level ?? 'Not recorded'}
              />
              <CreatedDetail
                label="Triage State"
                value={createdRequest.case_status}
              />
              <CreatedDetail
                label="Governance Visibility"
                value={
                  createdRequest.safeguarding_flag
                    ? 'EXECUTIVE_VISIBILITY'
                    : 'GOVERNANCE_VISIBILITY'
                }
              />
            </div>

            <button
              type="button"
              onClick={openTriageQueue}
              className="mt-5 w-full rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300"
            >
              Open Triage Queue
            </button>

            <div className="mt-5 rounded-2xl border border-amber-500/30 bg-black p-5">
              <p className="text-sm font-semibold text-amber-100">
                Next Governance Movement
              </p>

              <p className="mt-2 text-sm leading-6 text-amber-50">
                This signal should now appear inside the CGI triage queue for
                governance eligibility review and continuity classification.
              </p>
            </div>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-neutral-800 bg-black p-6">
          <h3 className="text-xl font-semibold text-white">
            Intake Governance Doctrine
          </h3>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Governed intake opens continuity visibility. It does not prove that a
            case exists, that stabilization has begun, that ownership is assigned,
            or that recovery is underway.
          </p>

          <p className="mt-4 text-sm leading-7 text-neutral-300">
            Mature intake intelligence must preserve proportional visibility.
            When a signal is clear and evidence is sufficient, it should move
            calmly into triage. When evidence is weak, ownership is unclear, or
            command visibility is needed, the system should preserve the signal
            without pretending downstream governance has already occurred.
          </p>
        </section>
      </section>
    </main>
  )
}

function buildPersistedIntakeMemory(input: {
  generatedIntakeIdentity: string
  entryRoute: string
  instabilityClass: string
  selectedClassDescription: string
  severity: string
  location: string
  affectedArea: string
  visibleSignal: string
  ownershipState: string
  evidenceLevel: string
  reviewUrgency: string
  governanceVisibility: string
  intakeIntelligence: IntakeIntelligence
  briefNote: string
}) {
  return `
INTAKE IDENTITY
${input.generatedIntakeIdentity}

ENTRY ROUTE
${input.entryRoute}

OPERATIONAL PRESSURE TYPE
${input.instabilityClass}

PRESSURE MEANING
${input.selectedClassDescription}

DIFFICULTY LEVEL
${input.severity}

SEVERITY MEANING
${resolveSeverityMeaning(input.severity)}

LOCATION
${input.location}

AFFECTED AREA
${input.affectedArea}

VISIBLE SIGNAL
${input.visibleSignal}

OWNERSHIP STATE
${input.ownershipState}

EVIDENCE LEVEL
${input.evidenceLevel}

REVIEW URGENCY
${input.reviewUrgency}

GOVERNANCE VISIBILITY
${input.governanceVisibility}

VISIBILITY CLASSIFICATION
${input.intakeIntelligence.visibilityClassification}

INTAKE MATURITY
${input.intakeIntelligence.intakeMaturity}

INTAKE CONFIDENCE
${input.intakeIntelligence.intakeConfidence}

GOVERNANCE READINESS
${input.intakeIntelligence.governanceReadiness}

OWNERSHIP POSTURE
${input.intakeIntelligence.ownershipPosture}

EVIDENCE POSTURE
${input.intakeIntelligence.evidencePosture}

STABILIZATION RISK
${input.intakeIntelligence.stabilizationRisk}

TRIAGE MEANING
${input.intakeIntelligence.triageMeaning}

COMMAND MEANING
${input.intakeIntelligence.commandMeaning}

BRIEF NOTE
${input.briefNote.trim() || 'No additional note provided'}

LIFECYCLE BOUNDARY
Request opens visibility. Triage determines eligibility. A request is not yet a governed case.
  `.trim()
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
    input.ownershipState,
  )

  const evidenceWeak = ['NONE', 'LIMITED'].includes(input.evidenceLevel)

  const crossSite =
    input.location === 'CROSS_SITE' ||
    input.visibleSignal === 'CROSS_TEAM_CONFUSION'

  if (input.severity === 'CRITICAL') {
    return {
      visibilityClassification: 'Critical visible instability',
      intakeMaturity: 'VISIBILITY_OPENED_WITH_COMMAND_RISK',
      intakeConfidence: evidenceWeak
        ? 'EVIDENCE_CONFIDENCE_LIMITED'
        : 'URGENT_VISIBILITY_CONFIDENCE',
      governanceReadiness: 'Immediate triage and command visibility recommended',
      ownershipPosture: ownershipUnclear
        ? 'Ownership unclear under critical conditions'
        : 'Ownership present but urgent confirmation needed',
      evidencePosture: evidenceWeak
        ? 'Evidence weak under critical conditions'
        : 'Evidence available for immediate review',
      stabilizationRisk: 'High risk if review is delayed',
      triageMeaning:
        'This signal should enter triage with executive visibility preserved.',
      commandMeaning:
        'This signal may threaten continuity if not governed quickly.',
    }
  }

  if (input.severity === 'HIGH') {
    return {
      visibilityClassification: 'High-pressure visible instability',
      intakeMaturity: 'VISIBILITY_OPENED_WITH_HIGH_PRESSURE',
      intakeConfidence: evidenceWeak
        ? 'BUILDING_INTAKE_CONFIDENCE'
        : 'INTAKE_CONFIDENCE_SUPPORTED',
      governanceReadiness: 'Triage review likely required',
      ownershipPosture: ownershipUnclear
        ? 'Ownership gap may slow stabilization'
        : 'Ownership appears available',
      evidencePosture: evidenceWeak
        ? 'Evidence may be insufficient for confident routing'
        : 'Evidence appears usable for triage',
      stabilizationRisk: 'Moderate to high if unresolved',
      triageMeaning:
        'This signal is likely eligible for triage review and may become active case governance if evidence supports it.',
      commandMeaning:
        'This signal may become broader continuity pressure if movement stalls.',
    }
  }

  if (ownershipUnclear || evidenceWeak || crossSite) {
    return {
      visibilityClassification: 'Visible instability with governance concern',
      intakeMaturity: 'VISIBILITY_OPENED_WITH_CLARITY_NEED',
      intakeConfidence: 'VARIABLE_INTAKE_CONFIDENCE',
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
      triageMeaning:
        'This signal should enter triage so eligibility, evidence strength, and ownership clarity can be judged before downstream movement.',
      commandMeaning:
        'The signal should remain visible until triage confirms the correct path.',
    }
  }

  return {
    visibilityClassification: 'Routine visible instability',
    intakeMaturity: 'VISIBILITY_OPENED',
    intakeConfidence: 'STANDARD_INTAKE_CONFIDENCE',
    governanceReadiness: 'Ready for standard triage',
    ownershipPosture: 'Ownership appears clear',
    evidencePosture: 'Evidence appears sufficient for triage',
    stabilizationRisk: 'Low to moderate if tracked promptly',
    triageMeaning:
      'This signal can enter triage calmly without assuming case acceptance or downstream stabilization.',
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
  if (severity === 'CRITICAL') return 'Executive visibility recommended immediately.'
  if (severity === 'HIGH') return 'Stabilization delay may increase continuity risk.'
  if (severity === 'MODERATE') {
    return 'Governance review may be required before the issue becomes harder to stabilize.'
  }

  return 'Localized operational visibility; monitor for recurrence or spread.'
}

function Select({
  label,
  value,
  setValue,
  options,
  helper,
}: {
  label: string
  value: string
  setValue: (value: string) => void
  options: string[]
  helper?: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="mt-2 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-sm text-white outline-none focus:border-amber-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {helper && (
        <span className="mt-2 block text-sm leading-6 text-neutral-500">
          {helper}
        </span>
      )}
    </label>
  )
}

function IntakePanel({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-black p-5">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-3 text-sm leading-6 text-neutral-400">{value}</p>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 p-4 md:grid-cols-[0.42fr_1fr]">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="text-sm leading-6 text-neutral-100">{value}</p>
    </div>
  )
}

function CreatedDetail({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-amber-500/30 bg-black p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-amber-50">
        {value}
      </p>
    </article>
  )
}

function SignalBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-100">
      {children}
    </span>
  )
}