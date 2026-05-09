'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import InfrastructureQuickNav from '@/components/InfrastructureQuickNav'
import { supabase } from '../../lib/supabase'

type Institution = {
  id: string
  institution_name: string
  institution_type: string
  region: string | null
  district: string | null
  operating_level: string | null
  coordination_status: string | null
  contact_person: string | null
  contact_email: string | null
  notes: string | null
}

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
}

type Responder = {
  id: string
  full_name: string
  email: string
  operational_status: string
  response_domains: string[] | null
  region: string | null
  trust_score: number | null
}

const SITE_TYPES = [
  'School',
  'NGO',
  'Community support site',
  'Learning center',
  'Church/community group',
  'District office',
  'Regional coordination office',
  'Ministry partner',
  'Health/social support partner',
  'Private support center',
  'Other',
]

const OPERATING_LEVELS = ['Local', 'Ward', 'District', 'Regional', 'National']

const SITE_NOTE_TEMPLATES = [
  'This site receives beneficiary cases and coordinates first-line support.',
  'This site supports low-bandwidth or rural beneficiaries.',
  'This site acts as a school-based coordination point.',
  'This site acts as an NGO/community intervention partner.',
  'This site supports district-level escalation and monitoring.',
  'This site supports safeguarding-aware case coordination.',
  'This site provides regional or ministry visibility for serious cases.',
  'Other',
]

const CASE_TYPES = [
  'Learning stabilization case',
  'Safeguarding-sensitive case',
  'Low-bandwidth access case',
  'Family/guardian support case',
  'Institution-referred case',
  'NGO/community-referred case',
  'District escalation case',
  'Exam-readiness risk case',
  'Continuity-of-support case',
  'Other',
]

const PRIMARY_CONCERNS = [
  'Learning continuity risk',
  'Access barrier',
  'Responder availability gap',
  'Safeguarding visibility concern',
  'Institutional coordination gap',
  'District escalation need',
  'Family or guardian support need',
  'Repeated support disruption',
  'Exam or progression risk',
  'Other',
]

const STABILIZATION_OBJECTIVES = [
  'Stabilize immediate support pathway',
  'Connect beneficiary to verified responder',
  'Create institution-level coordination record',
  'Escalate to district or regional visibility',
  'Maintain continuity until full intervention begins',
  'Protect beneficiary through safeguarding-aware routing',
  'Reduce access barriers using low-data response mode',
  'Coordinate school, NGO, district, or ministry response',
  'Other',
]

const CONSTRAINTS = [
  'Low data access',
  'Limited device access',
  'Remote or rural location',
  'No verified responder nearby',
  'Safeguarding-sensitive handling required',
  'Needs institution-level coordination',
  'Needs district or regional escalation',
  'Needs family or guardian involvement',
  'Needs language-sensitive support',
  'Time-sensitive case',
]

const RESPONSE_MODES = [
  'Verified responder assignment',
  'Institution-led coordination',
  'NGO/community partner pathway',
  'District escalation pathway',
  'Regional visibility pathway',
  'Ministry visibility record',
  'Low-data support pathway',
  'Safeguarding-aware restricted routing',
  'Hybrid coordination pathway',
]

const ROUTING_REASONS = [
  'Route to nearest available responder',
  'Route through institution partner',
  'Route through NGO/community partner',
  'Route through district coordination',
  'Route because safeguarding visibility is needed',
  'Route because access constraints are limiting support',
  'Route because continuity of support is unstable',
  'Route because severity level requires escalation',
  'Route for specialist domain support',
  'Other',
]

const ROUTING_PRIORITIES = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']

export default function RoutingPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [responders, setResponders] = useState<Responder[]>([])

  const [siteName, setSiteName] = useState('')
  const [siteType, setSiteType] = useState('School')
  const [otherSiteType, setOtherSiteType] = useState('')
  const [region, setRegion] = useState('')
  const [district, setDistrict] = useState('')
  const [operatingLevel, setOperatingLevel] = useState('Local')
  const [contactPerson, setContactPerson] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [siteNotesTemplate, setSiteNotesTemplate] = useState('')
  const [otherSiteNotes, setOtherSiteNotes] = useState('')

  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [caseType, setCaseType] = useState('')
  const [otherCaseType, setOtherCaseType] = useState('')
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('')
  const [selectedResponderId, setSelectedResponderId] = useState('')
  const [routingPriority, setRoutingPriority] = useState('MODERATE')
  const [routingReason, setRoutingReason] = useState('')
  const [otherRoutingReason, setOtherRoutingReason] = useState('')
  const [primaryConcern, setPrimaryConcern] = useState('')
  const [stabilizationObjective, setStabilizationObjective] = useState('')
  const [constraintOne, setConstraintOne] = useState('')
  const [constraintTwo, setConstraintTwo] = useState('')
  const [constraintThree, setConstraintThree] = useState('')
  const [responseMode, setResponseMode] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    await Promise.all([loadInstitutions(), loadCases(), loadResponders()])
  }

  async function loadInstitutions() {
    const { data } = await supabase
      .from('institutions')
      .select('*')
      .order('created_at', { ascending: false })

    setInstitutions(data || [])
  }

  async function loadCases() {
    const { data } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .order('created_at', { ascending: false })

    setCases(data || [])
  }

  async function loadResponders() {
    const { data } = await supabase
      .from('responders')
      .select('*')
      .eq('operational_status', 'ACTIVE')
      .order('trust_score', { ascending: false })

    setResponders(data || [])
  }

  function finalSiteType() {
    return siteType === 'Other' ? otherSiteType.trim() : siteType
  }

  function finalSiteNotes() {
    return siteNotesTemplate === 'Other' ? otherSiteNotes.trim() : siteNotesTemplate
  }

  function finalCaseType() {
    return caseType === 'Other' ? otherCaseType.trim() : caseType
  }

  function finalRoutingReason() {
    return routingReason === 'Other' ? otherRoutingReason.trim() : routingReason
  }

  function selectedCase() {
    return cases.find((item) => item.id === selectedCaseId)
  }

  function selectedInstitution() {
    return institutions.find((item) => item.id === selectedInstitutionId)
  }

  function selectedResponder() {
    return responders.find((item) => item.id === selectedResponderId)
  }

  function selectedConstraints() {
    return [constraintOne, constraintTwo, constraintThree].filter(Boolean)
  }

  function routingSummary() {
    const currentCase = selectedCase()

    if (!currentCase) {
      return ''
    }

    return `
STRUCTURED ROUTING INTELLIGENCE RECORD

Beneficiary Case:
${currentCase.beneficiary_name} • ${currentCase.support_domain} • ${currentCase.severity_level}

Case Type:
${finalCaseType() || 'Not specified'}

Primary Infrastructure Concern:
${primaryConcern || 'Not specified'}

Stabilization Objective:
${stabilizationObjective || 'Not specified'}

Operational Constraints:
${selectedConstraints().length ? selectedConstraints().join(', ') : 'No operational constraints selected'}

Recommended Response Mode:
${responseMode || 'Not specified'}

Routing Priority:
${routingPriority}

Priority Guide:
${priorityGuideText(routingPriority)}

Routing Reason:
${finalRoutingReason() || 'Not specified'}

Coordination Site:
${selectedInstitution()?.institution_name || 'No coordination site selected'}

Assigned Responder:
${selectedResponder()?.full_name || 'No responder selected'}

Governance-Safe Summary:
This routing record creates a structured coordination pathway for beneficiary stabilization. It supports consistent action across schools, NGOs, community sites, district offices, regional teams, ministry partners, and verified responders. The record focuses on access, continuity, safeguarding visibility, responder availability, escalation needs, and institutional coordination. It avoids blame and unnecessary personal exposure.

Additional Operational Notes:
${additionalNotes.trim() || 'No additional operational notes entered.'}
    `.trim()
  }

  async function createInstitution() {
    if (!siteName.trim()) {
      alert('Enter the coordination site name.')
      return
    }

    if (!finalSiteType()) {
      alert('Select or enter the site type.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('institutions').insert({
      institution_name: siteName.trim(),
      institution_type: finalSiteType(),
      region: region.trim(),
      district: district.trim(),
      operating_level: operatingLevel,
      coordination_status: 'ACTIVE',
      contact_person: contactPerson.trim(),
      contact_email: contactEmail.trim().toLowerCase(),
      notes: finalSiteNotes(),
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    setSiteName('')
    setSiteType('School')
    setOtherSiteType('')
    setRegion('')
    setDistrict('')
    setOperatingLevel('Local')
    setContactPerson('')
    setContactEmail('')
    setSiteNotesTemplate('')
    setOtherSiteNotes('')

    setMessage('Coordination site registered.')
    setLoading(false)

    await loadInstitutions()
  }

  async function routeCase() {
    if (!selectedCaseId) {
      alert(
        'Select a beneficiary case. If no cases appear, create a beneficiary case first in the Cases page.'
      )
      return
    }

    if (!finalRoutingReason()) {
      alert('Select a routing reason.')
      return
    }

    setLoading(true)
    setMessage('')

    const currentCase = selectedCase()
    const currentInstitution = selectedInstitution()

    const { error: routeError } = await supabase.from('case_routing_actions').insert({
      case_id: selectedCaseId,
      institution_id: selectedInstitutionId || null,
      assigned_responder_id: selectedResponderId || null,
      routing_status: selectedResponderId ? 'RESPONDER_ASSIGNED' : 'ROUTED',
      routing_priority: routingPriority,
      routing_reason: finalRoutingReason(),
      routing_notes: routingSummary(),
      routed_by: 'EXAMIA LIS Structured Routing Intelligence System',
    })

    if (routeError) {
      alert(routeError.message)
      setLoading(false)
      return
    }

    const nextStatus = selectedResponderId ? 'RESPONDER_ASSIGNED' : 'ROUTED'

    const { error: caseError } = await supabase
      .from('beneficiary_cases')
      .update({
        case_status: nextStatus,
        assigned_responder_id: selectedResponderId || null,
        institution_name:
          currentInstitution?.institution_name || currentCase?.institution_name || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedCaseId)

    if (caseError) {
      alert(caseError.message)
      setLoading(false)
      return
    }

    await supabase.from('case_timeline').insert({
      case_id: selectedCaseId,
      event_type: selectedResponderId ? 'RESPONDER_ASSIGNED' : 'CASE_ROUTED',
      event_summary: selectedResponderId
        ? 'Case routed and responder assigned through structured routing intelligence.'
        : 'Case routed through institutional coordination pathway.',
      actor: 'EXAMIA LIS Structured Routing Intelligence System',
    })

    setSelectedCaseId('')
    setCaseType('')
    setOtherCaseType('')
    setSelectedInstitutionId('')
    setSelectedResponderId('')
    setRoutingPriority('MODERATE')
    setRoutingReason('')
    setOtherRoutingReason('')
    setPrimaryConcern('')
    setStabilizationObjective('')
    setConstraintOne('')
    setConstraintTwo('')
    setConstraintThree('')
    setResponseMode('')
    setAdditionalNotes('')

    setMessage('Structured routing completed and timeline updated.')
    setLoading(false)

    await loadAll()
  }

  const activeSites = institutions.filter((item) => item.coordination_status === 'ACTIVE').length
  const routedCases = cases.filter((item) =>
    ['ROUTED', 'RESPONDER_ASSIGNED', 'INTERVENTION_ACTIVE', 'STABILIZING'].includes(
      item.case_status
    )
  ).length
  const criticalCases = cases.filter((item) => item.severity_level === 'CRITICAL').length
  const safeguardingCases = cases.filter((item) => item.safeguarding_flag).length
  const activeResponders = responders.length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.quickNavWrap}>
          <InfrastructureQuickNav />
        </div>

        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA LIS • STRUCTURED ROUTING INTELLIGENCE</p>
          <h1 style={styles.title}>Institutional Coordination + Response Routing</h1>
          <p style={styles.subtitle}>
            Route beneficiary stabilization cases through the right coordination site,
            responder pathway, escalation level, and governance-safe intervention record.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Coordination Sites" value={institutions.length} />
          <Metric label="Active Sites" value={activeSites} />
          <Metric label="Routed Cases" value={routedCases} />
          <Metric label="Critical Cases" value={criticalCases} />
          <Metric label="Safeguarding Flags" value={safeguardingCases} />
          <Metric label="Active Responders" value={activeResponders} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Register Coordination Site</h2>
            <p style={styles.panelNote}>
              Use this to register a school, NGO, district office, community site,
              ministry partner, or support hub that can receive or coordinate cases.
            </p>

            <Input label="Site Name" value={siteName} setValue={setSiteName} />
            <Select label="Site Type" value={siteType} setValue={setSiteType} options={SITE_TYPES} />

            {siteType === 'Other' && (
              <Input
                label="Other Site Type"
                value={otherSiteType}
                setValue={setOtherSiteType}
                placeholder="Example: rural support hub"
              />
            )}

            <Input label="Region" value={region} setValue={setRegion} />
            <Input label="District" value={district} setValue={setDistrict} />

            <Select
              label="Operating Level"
              value={operatingLevel}
              setValue={setOperatingLevel}
              options={OPERATING_LEVELS}
            />

            <Input label="Contact Person" value={contactPerson} setValue={setContactPerson} />
            <Input label="Contact Email" value={contactEmail} setValue={setContactEmail} />

            <Select
              label="Site Coordination Notes Template"
              value={siteNotesTemplate}
              setValue={setSiteNotesTemplate}
              options={['', ...SITE_NOTE_TEMPLATES]}
            />

            {siteNotesTemplate === 'Other' && (
              <label style={styles.label}>
                Other Site Coordination Notes
                <textarea
                  value={otherSiteNotes}
                  onChange={(e) => setOtherSiteNotes(e.target.value)}
                  placeholder="Describe the site’s coordination role. Do not include private case details."
                  style={styles.textarea}
                />
              </label>
            )}

            <button onClick={createInstitution} disabled={loading} style={styles.primaryButton}>
              {loading ? 'Saving...' : 'Register Coordination Site'}
            </button>

            <div style={styles.instructionsBox}>
              <strong>Simple guide:</strong>
              <p>
                Register the place or partner that can help coordinate support. This may be
                a school, NGO, district office, ministry partner, or community support site.
                Do not enter private beneficiary information here.
              </p>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Route Beneficiary Case</h2>
            <p style={styles.panelNote}>
              Use this section after a beneficiary case has already been created. If the
              dropdown is empty, go to the Cases page and create a case first.
            </p>

            <label style={styles.label}>
              Beneficiary Case
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                style={styles.select}
              >
                <option value="">
                  {cases.length === 0
                    ? 'No beneficiary cases found — create one in Cases first'
                    : 'Select beneficiary case'}
                </option>

                {cases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.beneficiary_name || 'Unnamed case'} • {item.support_domain || 'Domain'} •{' '}
                    {item.severity_level || 'Severity'} • {item.case_status || 'Status'}
                  </option>
                ))}
              </select>
            </label>

            <Select
              label="Structured Case Type"
              value={caseType}
              setValue={setCaseType}
              options={['', ...CASE_TYPES]}
            />

            {caseType === 'Other' && (
              <Input
                label="Other Case Type"
                value={otherCaseType}
                setValue={setOtherCaseType}
                placeholder="Describe the case type"
              />
            )}

            <Select
              label="Primary Infrastructure Concern"
              value={primaryConcern}
              setValue={setPrimaryConcern}
              options={['', ...PRIMARY_CONCERNS]}
            />

            <Select
              label="Stabilization Objective"
              value={stabilizationObjective}
              setValue={setStabilizationObjective}
              options={['', ...STABILIZATION_OBJECTIVES]}
            />

            <div style={styles.softBox}>
              <strong>Operational Constraints</strong>
              <p>
                Select up to three visible constraints affecting coordination. Leave unused
                fields blank.
              </p>

              <Select
                label="Constraint 1"
                value={constraintOne}
                setValue={setConstraintOne}
                options={['', ...CONSTRAINTS]}
              />

              <Select
                label="Constraint 2"
                value={constraintTwo}
                setValue={setConstraintTwo}
                options={['', ...CONSTRAINTS]}
              />

              <Select
                label="Constraint 3"
                value={constraintThree}
                setValue={setConstraintThree}
                options={['', ...CONSTRAINTS]}
              />
            </div>

            <Select
              label="Recommended Response Mode"
              value={responseMode}
              setValue={setResponseMode}
              options={['', ...RESPONSE_MODES]}
            />

            <label style={styles.label}>
              Coordination Site
              <select
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(e.target.value)}
                style={styles.select}
              >
                <option value="">
                  {institutions.length === 0
                    ? 'No coordination sites found — register one first'
                    : 'Select site if this case needs school, NGO, district, or ministry coordination'}
                </option>

                {institutions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.institution_name} • {item.institution_type} •{' '}
                    {item.operating_level || 'Local'}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Active Responder
              <select
                value={selectedResponderId}
                onChange={(e) => setSelectedResponderId(e.target.value)}
                style={styles.select}
              >
                <option value="">
                  {responders.length === 0
                    ? 'No active responders found'
                    : 'Optional — assign active responder now'}
                </option>

                {responders.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.full_name} • {item.region || 'No region'} • Trust {item.trust_score ?? 0}
                  </option>
                ))}
              </select>
            </label>

            <Select
              label="Routing Priority"
              value={routingPriority}
              setValue={setRoutingPriority}
              options={ROUTING_PRIORITIES}
            />

            <div style={styles.guideBox}>
              <strong>Priority Guide:</strong>
              <p>{priorityGuideText(routingPriority)}</p>
            </div>

            <Select
              label="Routing Reason"
              value={routingReason}
              setValue={setRoutingReason}
              options={['', ...ROUTING_REASONS]}
            />

            {routingReason === 'Other' && (
              <Input
                label="Other Routing Reason"
                value={otherRoutingReason}
                setValue={setOtherRoutingReason}
                placeholder="Describe the routing reason"
              />
            )}

            <label style={styles.label}>
              Optional Additional Operational Notes
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Use only coordination-relevant notes. Avoid unnecessary personal details."
                style={styles.textarea}
              />
            </label>

            <button onClick={routeCase} disabled={loading} style={styles.primaryButton}>
              {loading ? 'Routing...' : 'Confirm Structured Routing'}
            </button>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Auto-Generated Routing Summary</h2>
          <p style={styles.panelNote}>
            This summary becomes the governance-safe intervention record for coordination,
            escalation, responder assignment, and future review.
          </p>

          <pre style={styles.summaryBox}>
            {routingSummary() ||
              'Select a beneficiary case to generate structured routing intelligence.'}
          </pre>
        </section>
      </div>
    </main>
  )
}

function priorityGuideText(priority: string) {
  if (priority === 'LOW') return 'Support is needed, but no immediate infrastructure risk is visible.'
  if (priority === 'MODERATE') return 'A visible support gap requires structured follow-up and coordination.'
  if (priority === 'HIGH') return 'Continuity, access, safeguarding, or escalation pressure is present.'
  if (priority === 'CRITICAL') return 'Urgent safeguarding, severe disruption, or high-level escalation may be required.'
  return 'Select a routing priority.'
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <h2 style={styles.metricValue}>{value}</h2>
    </div>
  )
}

function Input({
  label,
  value,
  setValue,
  placeholder = '',
}: {
  label: string
  value: string
  setValue: (value: string) => void
  placeholder?: string
}) {
  return (
    <label style={styles.label}>
      {label}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </label>
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
      <select value={value} onChange={(e) => setValue(e.target.value)} style={styles.select}>
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
    background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
    color: 'white',
    padding: '56px 18px',
  },
  container: { maxWidth: '1240px', margin: '0 auto' },
  quickNavWrap: { marginBottom: '32px' },
  hero: { marginBottom: '32px' },
  kicker: { color: '#67e8f9', fontSize: '12px', fontWeight: 900, letterSpacing: '2px' },
  title: { fontSize: 'clamp(34px, 6vw, 58px)', lineHeight: 1.05, margin: '12px 0' },
  subtitle: { color: '#cbd5e1', maxWidth: '940px', lineHeight: 1.7, fontSize: '18px' },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '14px',
    marginBottom: '24px',
  },
  metricCard: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '18px',
    padding: '20px',
  },
  metricLabel: { color: '#94a3b8', fontWeight: 800, margin: 0 },
  metricValue: { fontSize: '38px', margin: '8px 0 0' },
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
  sectionTitle: { fontSize: '26px', margin: '0 0 10px' },
  panelNote: { color: '#cbd5e1', lineHeight: 1.6, marginBottom: '18px' },
  label: { display: 'block', fontWeight: 800, marginBottom: '16px' },
  input: {
    width: '100%',
    marginTop: '8px',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #334155',
    background: '#111827',
    color: 'white',
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
    minHeight: '110px',
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
  instructionsBox: {
    marginTop: '18px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '16px',
    color: '#dbeafe',
    lineHeight: 1.6,
  },
  softBox: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '16px',
    color: '#dbeafe',
    lineHeight: 1.6,
  },
  guideBox: {
    background: '#082f49',
    border: '1px solid #0e7490',
    color: '#e0f2fe',
    borderRadius: '14px',
    padding: '14px',
    marginBottom: '16px',
    lineHeight: 1.5,
  },
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
    color: '#e2e8f0',
    lineHeight: 1.6,
    minHeight: '260px',
  },
}