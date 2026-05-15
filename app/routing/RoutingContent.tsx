'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  beneficiary_name: string
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
  operational_status: string
  region: string | null
  support_domains: string[] | null
}

type RoutingAction = {
  id: string
  case_id: string
  assigned_responder_id: string | null
  routing_status: string
  routing_reason: string | null
}

const ROUTING_STATUSES = [
  'ROUTING_PENDING',
  'ROUTED',
  'RESPONDER_ASSIGNED',
  'ESCALATED',
]

export default function RoutingContent() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [responders, setResponders] = useState<Responder[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const [casesResult, respondersResult, routingResult] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('responders').select('*'),
      supabase.from('case_routing_actions').select('*'),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (respondersResult.error) console.error(respondersResult.error)
    if (routingResult.error) console.error(routingResult.error)

    setCases(casesResult.data || [])
    setResponders(respondersResult.data || [])
    setRoutingActions(routingResult.data || [])

    setMessage('Routing intelligence refreshed.')
  }

  async function assignResponder(
    caseItem: BeneficiaryCase,
    responderId: string
  ) {
    if (!responderId) return

    const { error } = await supabase.from('case_routing_actions').insert({
      case_id: caseItem.id,
      assigned_responder_id: responderId,
      routing_status: 'RESPONDER_ASSIGNED',
      routing_reason: 'Governed routing assignment completed',
    })

    if (error) {
      alert(error.message)
      return
    }

    await supabase
      .from('beneficiary_cases')
      .update({
        case_status: 'RESPONDER_ASSIGNED',
      })
      .eq('id', caseItem.id)

    setMessage('Responder assigned successfully.')

    await loadData()
  }

  const totalCases = cases.length

  const routedCases = routingActions.length

  const assignedCases = routingActions.filter(
    (item) => item.routing_status === 'RESPONDER_ASSIGNED'
  ).length

  const escalatedCases = routingActions.filter(
    (item) => item.routing_status === 'ESCALATED'
  ).length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <p style={styles.kicker}>TSINAXA CGI • ROUTING GOVERNANCE</p>

          <h1 style={styles.title}>Continuity Routing Infrastructure</h1>

          <p style={styles.subtitle}>
            Govern responder assignment, escalation visibility, continuity
            ownership, operational routing pressure, and institutional
            stabilization pathways.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Total Cases" value={totalCases} />
          <Metric label="Routing Actions" value={routedCases} />
          <Metric label="Assigned Responders" value={assignedCases} />
          <Metric label="Escalated Cases" value={escalatedCases} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Active Continuity Routing Queue
          </h2>

          <div style={styles.caseList}>
            {cases.map((caseItem) => (
              <article key={caseItem.id} style={styles.caseCard}>
                <div style={styles.caseHeader}>
                  <div>
                    <h3 style={styles.caseName}>
                      {caseItem.beneficiary_name}
                    </h3>

                    <p style={styles.caseDomain}>
                      {caseItem.support_domain}
                    </p>
                  </div>

                  <span style={severityBadge(caseItem.severity_level)}>
                    {caseItem.severity_level}
                  </span>
                </div>

                <div style={styles.infoGrid}>
                  <Info label="Lifecycle" value={caseItem.case_status} />

                  <Info
                    label="Region"
                    value={caseItem.region || 'Not provided'}
                  />

                  <Info
                    label="Institution"
                    value={caseItem.institution_name || 'Not provided'}
                  />

                  <Info
                    label="Safeguarding"
                    value={
                      caseItem.safeguarding_flag
                        ? 'Visibility required'
                        : 'No active flag'
                    }
                  />
                </div>

                <div style={styles.dropdownSection}>
                  <label style={styles.label}>
                    Assign Responder
                  </label>

                  <select
                    defaultValue=""
                    style={styles.select}
                    onChange={(event) =>
                      assignResponder(caseItem, event.target.value)
                    }
                  >
                    <option value="">
                      Select responder
                    </option>

                    {responders.map((responder) => (
                      <option
                        key={responder.id}
                        value={responder.id}
                      >
                        {responder.full_name} •{' '}
                        {responder.operational_status}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            Routing Governance Visibility
          </h2>

          <div style={styles.routingList}>
            {routingActions.map((action) => (
              <div key={action.id} style={styles.routingCard}>
                <p style={styles.routingStatus}>
                  {action.routing_status}
                </p>

                <p style={styles.routingText}>
                  {action.routing_reason ||
                    'No routing reason documented'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
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
      <p style={styles.metricLabel}>{label}</p>

      <h2 style={styles.metricValue}>{value}</h2>
    </div>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.infoBox}>
      <p style={styles.infoLabel}>{label}</p>

      <p style={styles.infoValue}>{value}</p>
    </div>
  )
}

function severityBadge(level: string): CSSProperties {
  if (level === 'CRITICAL') {
    return {
      background: '#7f1d1d',
      color: '#fecaca',
      padding: '8px 12px',
      borderRadius: '999px',
      fontWeight: 800,
    }
  }

  if (level === 'HIGH') {
    return {
      background: '#7c2d12',
      color: '#fdba74',
      padding: '8px 12px',
      borderRadius: '999px',
      fontWeight: 800,
    }
  }

  return {
    background: '#082f49',
    color: '#67e8f9',
    padding: '8px 12px',
    borderRadius: '999px',
    fontWeight: 800,
  }
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: 'white',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  hero: {
    marginBottom: '32px',
  },

  kicker: {
    color: '#67e8f9',
    fontWeight: 900,
    letterSpacing: '2px',
    fontSize: '12px',
  },

  title: {
    fontSize: 'clamp(34px, 6vw, 56px)',
    lineHeight: 1.05,
    margin: '12px 0',
  },

  subtitle: {
    color: '#cbd5e1',
    maxWidth: '920px',
    lineHeight: 1.7,
    fontSize: '18px',
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
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
  },

  metricValue: {
    fontSize: '42px',
    marginTop: '8px',
  },

  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '20px',
  },

  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '24px',
  },

  sectionTitle: {
    fontSize: '28px',
    marginBottom: '18px',
  },

  caseList: {
    display: 'grid',
    gap: '18px',
  },

  caseCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '20px',
  },

  caseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },

  caseName: {
    fontSize: '24px',
    margin: 0,
  },

  caseDomain: {
    color: '#93c5fd',
    marginTop: '6px',
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginTop: '18px',
  },

  infoBox: {
    background: '#020617',
    borderRadius: '14px',
    padding: '12px',
    border: '1px solid #1e293b',
  },

  infoLabel: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
  },

  infoValue: {
    marginTop: '6px',
    lineHeight: 1.5,
  },

  dropdownSection: {
    marginTop: '20px',
  },

  label: {
    display: 'block',
    fontWeight: 800,
    marginBottom: '10px',
  },

  select: {
    width: '100%',
    marginTop: '8px',
    padding: '14px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
  },

  routingList: {
    display: 'grid',
    gap: '12px',
  },

  routingCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '16px',
  },

  routingStatus: {
    color: '#67e8f9',
    fontWeight: 900,
    marginBottom: '8px',
  },

  routingText: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    margin: 0,
  },
}