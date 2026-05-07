'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
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

const INSTITUTION_TYPES = [
  'SCHOOL',
  'NGO',
  'COMMUNITY',
  'DISTRICT',
  'REGIONAL_COORDINATION',
  'MINISTRY_PARTNER',
]

const OPERATING_LEVELS = [
  'LOCAL',
  'WARD',
  'DISTRICT',
  'REGIONAL',
  'NATIONAL',
]

const ROUTING_REASONS = [
  'Severity requires coordinated intervention',
  'Regional routing required',
  'Institution-linked beneficiary case',
  'Safeguarding-sensitive routing required',
  'Responder specialization required',
  'Low-bandwidth support coordination required',
  'Escalated learning instability requires institutional visibility',
  'Exam-risk intervention requires structured routing',
]

const ROUTING_PRIORITIES = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']

export default function InstitutionalRoutingEnginePage() {
  const [mounted, setMounted] = useState(false)

  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [responders, setResponders] = useState<Responder[]>([])

  const [institutionName, setInstitutionName] = useState('')
  const [institutionType, setInstitutionType] = useState('SCHOOL')
  const [region, setRegion] = useState('')
  const [district, setDistrict] = useState('')
  const [operatingLevel, setOperatingLevel] = useState('LOCAL')
  const [contactPerson, setContactPerson] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [institutionNotes, setInstitutionNotes] = useState('')

  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('')
  const [selectedResponderId, setSelectedResponderId] = useState('')
  const [routingPriority, setRoutingPriority] = useState('MODERATE')
  const [routingReason, setRoutingReason] = useState('')
  const [routingNotes, setRoutingNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMounted(true)
    loadAll()
  }, [])

  if (!mounted) return null

  async function loadAll() {
    await Promise.all([
      loadInstitutions(),
      loadCases(),
      loadResponders(),
    ])
  }

  async function loadInstitutions() {
    const { data, error } = await supabase
      .from('institutions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setInstitutions(data || [])
  }

  async function loadCases() {
    const { data, error } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setCases(data || [])
  }

  async function loadResponders() {
    const { data, error } = await supabase
      .from('responders')
      .select('*')
      .eq('operational_status', 'ACTIVE')
      .order('trust_score', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setResponders(data || [])
  }

  async function createInstitution() {
    if (!institutionName.trim()) {
      alert('Enter institution name.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.from('institutions').insert({
      institution_name: institutionName.trim(),
      institution_type: institutionType,
      region: region.trim(),
      district: district.trim(),
      operating_level: operatingLevel,
      coordination_status: 'ACTIVE',
      contact_person: contactPerson.trim(),
      contact_email: contactEmail.trim().toLowerCase(),
      notes: institutionNotes.trim(),
    })

    if (error) {
      console.error(error)
      alert(error.message)
      setLoading(false)
      return
    }

    setInstitutionName('')
    setInstitutionType('SCHOOL')
    setRegion('')
    setDistrict('')
    setOperatingLevel('LOCAL')
    setContactPerson('')
    setContactEmail('')
    setInstitutionNotes('')

    setMessage('Institutional coordination node created.')
    setLoading(false)

    await loadInstitutions()
  }

  async function routeCase() {
    if (!selectedCaseId || !routingReason) {
      alert('Select a case and routing reason.')
      return
    }

    setLoading(true)
    setMessage('')

    const selectedCase = cases.find((item) => item.id === selectedCaseId)
    const selectedInstitution = institutions.find((item) => item.id === selectedInstitutionId)

    const { error: routeError } = await supabase.from('case_routing_actions').insert({
      case_id: selectedCaseId,
      institution_id: selectedInstitutionId || null,
      assigned_responder_id: selectedResponderId || null,
      routing_status: selectedResponderId ? 'RESPONDER_ASSIGNED' : 'ROUTED',
      routing_priority: routingPriority,
      routing_reason: routingReason,
      routing_notes: routingNotes.trim(),
      routed_by: 'EXAMIA LIS Routing Engine',
    })

    if (routeError) {
      console.error(routeError)
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
          selectedInstitution?.institution_name ||
          selectedCase?.institution_name ||
          null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedCaseId)

    if (caseError) {
      console.error(caseError)
      alert(caseError.message)
      setLoading(false)
      return
    }

    await supabase.from('case_timeline').insert({
      case_id: selectedCaseId,
      event_type: selectedResponderId ? 'RESPONDER_ASSIGNED' : 'CASE_ROUTED',
      event_summary: selectedResponderId
        ? 'Case routed and responder assigned through institutional routing engine'
        : 'Case routed through institutional coordination engine',
      actor: 'EXAMIA LIS Routing Engine',
    })

    setSelectedCaseId('')
    setSelectedInstitutionId('')
    setSelectedResponderId('')
    setRoutingPriority('MODERATE')
    setRoutingReason('')
    setRoutingNotes('')

    setMessage('Case routing action completed and timeline updated.')
    setLoading(false)

    await loadAll()
  }

  const activeInstitutions = institutions.filter(
    (item) => item.coordination_status === 'ACTIVE'
  ).length

  const routedCases = cases.filter((item) =>
    ['ROUTED', 'RESPONDER_ASSIGNED', 'INTERVENTION_ACTIVE', 'STABILIZING'].includes(
      item.case_status
    )
  ).length

  const criticalCases = cases.filter((item) => item.severity_level === 'CRITICAL').length
  const activeResponders = responders.length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA LIS • INSTITUTIONAL ROUTING ENGINE</p>

          <h1 style={styles.title}>Institutional Coordination + Case Routing</h1>

          <p style={styles.subtitle}>
            Distributed coordination infrastructure for routing beneficiary stabilization
            cases across schools, NGOs, community nodes, district operators, regional
            coordinators, and verified responder networks.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Institutions" value={institutions.length} />
          <Metric label="Active Nodes" value={activeInstitutions} />
          <Metric label="Routed Cases" value={routedCases} />
          <Metric label="Critical Cases" value={criticalCases} />
          <Metric label="Active Responders" value={activeResponders} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.layoutGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Create Coordination Node</h2>

            <Input label="Institution / Node Name" value={institutionName} setValue={setInstitutionName} />

            <Select
              label="Institution Type"
              value={institutionType}
              setValue={setInstitutionType}
              options={INSTITUTION_TYPES}
            />

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

            <label style={styles.label}>
              Notes
              <textarea
                value={institutionNotes}
                onChange={(e) => setInstitutionNotes(e.target.value)}
                placeholder="Coordination scope, district notes, NGO mandate, school cluster, etc."
                style={styles.textarea}
              />
            </label>

            <button onClick={createInstitution} disabled={loading} style={styles.primaryButton}>
              {loading ? 'Saving...' : 'Create Coordination Node'}
            </button>
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Route Beneficiary Case</h2>

            <label style={styles.label}>
              Beneficiary Case
              <select
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                style={styles.select}
              >
                <option value="">Select case</option>
                {cases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.beneficiary_name} • {item.support_domain} • {item.severity_level}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Institution / Coordination Node
              <select
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(e.target.value)}
                style={styles.select}
              >
                <option value="">No institution selected</option>
                {institutions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.institution_name} • {item.institution_type}
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
                <option value="">No responder selected</option>
                {responders.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.full_name} • Trust {item.trust_score ?? 0}
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

            <label style={styles.label}>
              Routing Reason
              <select
                value={routingReason}
                onChange={(e) => setRoutingReason(e.target.value)}
                style={styles.select}
              >
                <option value="">Select routing reason</option>
                {ROUTING_REASONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Routing Notes Optional
              <textarea
                value={routingNotes}
                onChange={(e) => setRoutingNotes(e.target.value)}
                placeholder="Optional routing context..."
                style={styles.textarea}
              />
            </label>

            <button onClick={routeCase} disabled={loading} style={styles.primaryButton}>
              {loading ? 'Routing...' : 'Confirm Case Routing'}
            </button>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Coordination Nodes</h2>

          <div style={styles.listGrid}>
            {institutions.map((item) => (
              <article key={item.id} style={styles.nodeCard}>
                <div style={styles.nodeHeader}>
                  <div>
                    <h3 style={styles.nodeTitle}>{item.institution_name}</h3>
                    <p style={styles.nodeMeta}>
                      {item.institution_type} • {item.operating_level || 'LOCAL'}
                    </p>
                  </div>

                  <span style={styles.statusBadge}>{item.coordination_status || 'ACTIVE'}</span>
                </div>

                <div style={styles.infoGrid}>
                  <Info label="Region" value={item.region || 'Not provided'} />
                  <Info label="District" value={item.district || 'Not provided'} />
                  <Info label="Contact" value={item.contact_person || 'Not provided'} />
                  <Info label="Email" value={item.contact_email || 'Not provided'} />
                </div>

                {item.notes && <div style={styles.notesBox}>{item.notes}</div>}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <h2 style={styles.metricValue}>{value}</h2>
    </div>
  )
}

function Input({ label, value, setValue, placeholder = '' }: any) {
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

function Select({ label, value, setValue, options }: any) {
  return (
    <label style={styles.label}>
      {label}
      <select value={value} onChange={(e) => setValue(e.target.value)} style={styles.select}>
        {options.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
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

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
    color: 'white',
    padding: '56px 18px',
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
    maxWidth: '900px',
    lineHeight: 1.7,
    fontSize: '18px',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
    margin: '0 0 18px',
  },
  label: {
    display: 'block',
    fontWeight: 800,
    marginBottom: '16px',
  },
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
  listGrid: {
    display: 'grid',
    gap: '16px',
  },
  nodeCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
  },
  nodeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  nodeTitle: {
    margin: 0,
    fontSize: '22px',
  },
  nodeMeta: {
    color: '#93c5fd',
    marginTop: '6px',
  },
  statusBadge: {
    background: '#dcfce7',
    color: '#166534',
    borderRadius: '999px',
    padding: '8px 12px',
    fontWeight: 900,
    fontSize: '12px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  infoBox: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '14px',
    padding: '12px',
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
    margin: 0,
  },
  infoValue: {
    color: '#f8fafc',
    margin: '6px 0 0',
    lineHeight: 1.4,
  },
  notesBox: {
    marginTop: '14px',
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '14px',
    padding: '14px',
    color: '#dbeafe',
    lineHeight: 1.5,
  },
}