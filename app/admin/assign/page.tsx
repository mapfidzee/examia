'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../../lib/supabase'

type SupportRequest = {
  id: string
  subject: string
  problem: string
  preferred_time: string
  scheduled_time: string | null
  status: string
  assigned_teacher: string | null
  teacher_id: string | null
  teacher_status: string | null
  created_at: string
}

type ResponderProfile = {
  id: string
  full_name: string
  email: string
  subjects: string[] | null
  grade_levels: string[] | null
  province: string | null
  spoken_languages: string[] | null
  hourly_rate: number | null
  status: string
}

export default function AdminAssignPage() {
  return (
    <GovernanceRouteGuard allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN']}>
      <CGIGovernanceShell>
        <AdminAssignContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function AdminAssignContent() {
  const [requests, setRequests] = useState<SupportRequest[]>([])
  const [responders, setResponders] = useState<ResponderProfile[]>([])
  const [selectedResponderByRequest, setSelectedResponderByRequest] = useState<
    Record<string, string>
  >({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Loading assignment queue...')

  useEffect(() => {
    loadData()
  }, [])

  const assignmentQueue = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status !== 'COMPLETED' &&
          request.teacher_status !== 'ACCEPTED',
      ),
    [requests],
  )

  const lockedEvidence = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === 'COMPLETED' ||
          request.teacher_status === 'ACCEPTED',
      ),
    [requests],
  )

  const unassignedRequests = useMemo(
    () => requests.filter((request) => !request.teacher_id),
    [requests],
  )

  const offeredRequests = useMemo(
    () => requests.filter((request) => request.teacher_status === 'OFFERED'),
    [requests],
  )

  const acceptedRequests = useMemo(
    () => requests.filter((request) => request.teacher_status === 'ACCEPTED'),
    [requests],
  )

  const declinedRequests = useMemo(
    () => requests.filter((request) => request.teacher_status === 'DECLINED'),
    [requests],
  )

  async function loadData() {
    setLoading(true)
    setMessage('Loading assignment queue...')

    const { data: requestData, error: requestError } = await supabase
      .from('lesson_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (requestError) {
      console.error(requestError)
      setMessage('Assignment queue could not load support requests.')
      setLoading(false)
      return
    }

    const { data: responderData, error: responderError } = await supabase
      .from('teacher_profiles')
      .select('*')
      .in('status', ['APPROVED', 'VERIFIED', 'ACTIVE'])
      .order('full_name', { ascending: true })

    if (responderError) {
      console.error(responderError)
      setMessage('Assignment queue could not load approved responders.')
      setLoading(false)
      return
    }

    setRequests(requestData || [])
    setResponders(responderData || [])
    setMessage('Assignment queue loaded.')
    setLoading(false)
  }

  async function routeResponder(request: SupportRequest) {
    if (request.status === 'COMPLETED' || request.teacher_status === 'ACCEPTED') {
      alert('This record is already locked or accepted.')
      return
    }

    const responderId = selectedResponderByRequest[request.id]

    if (!responderId) {
      alert('Please select an approved responder first.')
      return
    }

    const selectedResponder = responders.find(
      (responder) => responder.id === responderId,
    )

    if (!selectedResponder) {
      alert('Selected responder was not found.')
      return
    }

    setMessage('Routing responder...')

    const { error } = await supabase
      .from('lesson_requests')
      .update({
        teacher_id: selectedResponder.id,
        assigned_teacher: selectedResponder.full_name,
        teacher_status: 'OFFERED',
        status: request.status === 'NEW' ? 'MATCHED' : request.status,
      })
      .eq('id', request.id)

    if (error) {
      console.error(error)
      setMessage('Responder routing failed.')
      return
    }

    setMessage(`Request routed to ${selectedResponder.full_name}.`)
    await loadData()
  }

  function updateSelectedResponder(requestId: string, responderId: string) {
    setSelectedResponderByRequest((current) => ({
      ...current,
      [requestId]: responderId,
    }))
  }

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <header style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • ASSIGNMENT</p>
            <h1 style={styles.title}>Assignment</h1>
            <p style={styles.subtitle}>
              Route governed requests to approved responders without changing
              the command lifecycle.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>ASSIGNMENT POSTURE</p>
            <p style={styles.statusValue}>CONTROLLED</p>
            <p style={styles.statusMeaning}>
              Assignment supports responder ownership only. Accepted and
              completed records remain protected evidence.
            </p>
          </div>
        </header>

        <section style={styles.metricsGrid}>
          <Metric label="Unassigned" value={unassignedRequests.length} />
          <Metric label="Offered" value={offeredRequests.length} />
          <Metric label="Accepted" value={acceptedRequests.length} />
          <Metric label="Declined" value={declinedRequests.length} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Assignment Question</p>
            <h2 style={styles.commandTitle}>
              Which requests still need responder ownership?
            </h2>
            <p style={styles.bodyText}>
              This surface routes requests to approved responders. It does not
              create new lifecycle stages, complete interventions, or override
              command evidence.
            </p>
          </div>

          <div style={styles.warningCard}>
            <p style={styles.sectionKicker}>Boundary</p>
            <h2 style={styles.warningTitle}>Assign, do not reopen.</h2>
            <p style={styles.bodyText}>
              Completed records and accepted ownership should remain visible as
              locked evidence, not active routing work.
            </p>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.sectionKicker}>Responder Assignment Queue</p>
              <h2 style={styles.panelTitle}>Requests awaiting assignment</h2>
            </div>

            <button type="button" onClick={loadData} style={styles.secondaryButton}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <p style={styles.emptyBox}>Loading assignment records...</p>
          ) : assignmentQueue.length === 0 ? (
            <p style={styles.emptyBox}>No requests currently require routing.</p>
          ) : (
            <div style={styles.requestList}>
              {assignmentQueue.map((request) => (
                <AssignmentCard
                  key={request.id}
                  request={request}
                  responders={responders}
                  selectedResponderId={selectedResponderByRequest[request.id] || ''}
                  onSelect={updateSelectedResponder}
                  onRoute={routeResponder}
                />
              ))}
            </div>
          )}
        </section>

        <details style={styles.evidencePanel}>
          <summary style={styles.evidenceSummary}>
            <span>
              <span style={styles.sectionKicker}>Locked Assignment Evidence</span>
              <strong style={styles.evidenceTitle}>
                Accepted ownership and completed records
              </strong>
            </span>

            <span style={styles.evidenceToggle}>Expand Evidence</span>
          </summary>

          {lockedEvidence.length === 0 ? (
            <p style={styles.emptyBox}>No accepted or completed records yet.</p>
          ) : (
            <div style={styles.requestList}>
              {lockedEvidence.map((request) => (
                <LockedCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </details>

        <section style={styles.doctrineCard}>
          <strong>ASSIGNMENT DOCTRINE</strong>
          <span>
            Assignment is not command. Assignment routes ownership to an approved
            responder while preserving request visibility, routing evidence, and
            continuity accountability.
          </span>
        </section>
      </section>
    </main>
  )
}

function AssignmentCard({
  request,
  responders,
  selectedResponderId,
  onSelect,
  onRoute,
}: {
  request: SupportRequest
  responders: ResponderProfile[]
  selectedResponderId: string
  onSelect: (requestId: string, responderId: string) => void
  onRoute: (request: SupportRequest) => void
}) {
  return (
    <article style={styles.requestCard}>
      <div style={styles.requestTop}>
        <div>
          <p style={styles.metricLabel}>Operational request</p>
          <h3 style={styles.cardTitle}>{request.subject}</h3>
          <p style={styles.metaText}>
            Request: {request.status || 'Not set'} · Responder:{' '}
            {request.teacher_status || 'Not offered'}
          </p>
        </div>

        <span style={styles.badge}>{request.teacher_status || 'UNROUTED'}</span>
      </div>

      <div style={styles.needBox}>
        <p style={styles.metricLabel}>Support need</p>
        <p style={styles.needText}>{request.problem || 'Not provided'}</p>
      </div>

      <div style={styles.detailGrid}>
        <Detail label="Preferred" value={request.preferred_time || 'Not provided'} />
        <Detail label="Scheduled" value={request.scheduled_time || 'Not scheduled'} />
        <Detail label="Responder" value={request.assigned_teacher || 'None yet'} />
      </div>

      <div style={styles.assignBox}>
        <label style={styles.label}>
          Approved responder
          <select
            value={selectedResponderId}
            onChange={(event) => onSelect(request.id, event.target.value)}
            style={styles.select}
          >
            <option value="">Choose responder...</option>
            {responders.map((responder) => (
              <option key={responder.id} value={responder.id}>
                {responder.full_name} — {formatList(responder.subjects)}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={() => onRoute(request)} style={styles.primaryButton}>
          Route Responder
        </button>
      </div>
    </article>
  )
}

function LockedCard({ request }: { request: SupportRequest }) {
  return (
    <article style={styles.requestCard}>
      <div style={styles.requestTop}>
        <div>
          <p style={styles.metricLabel}>Locked assignment record</p>
          <h3 style={styles.cardTitle}>{request.subject}</h3>
          <p style={styles.metaText}>
            Request: {request.status || 'Not set'} · Responder:{' '}
            {request.teacher_status || 'Not offered'}
          </p>
        </div>

        <span style={styles.badge}>{request.teacher_status || request.status}</span>
      </div>

      <div style={styles.detailGrid}>
        <Detail label="Support Need" value={request.problem || 'Not provided'} />
        <Detail label="Responder" value={request.assigned_teacher || 'None recorded'} />
        <Detail label="Scheduled" value={request.scheduled_time || 'Not scheduled'} />
      </div>
    </article>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <strong style={styles.metricValue}>{value}</strong>
    </article>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.detailBox}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.detailValue}>{value}</p>
    </div>
  )
}

function formatList(value: string[] | null) {
  if (!value || value.length === 0) return 'No domains listed'
  return value.join(', ')
}

const gold = '#d6b25e'
const mutedGold = '#9f8142'
const deepBlack = '#030303'
const panelBlack = '#090807'
const cardBlack = '#11100d'
const softLine = 'rgba(214,178,94,0.24)'
const strongLine = 'rgba(214,178,94,0.42)'

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(214,178,94,0.08), transparent 30%), linear-gradient(180deg, #030303 0%, #090807 100%)',
    color: '#fff8e7',
    padding: '32px 24px 48px',
  },
  container: {
    width: 'min(1180px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gap: 16,
    alignContent: 'start',
    minHeight: 'calc(100vh - 96px)',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(280px, 0.65fr)',
    gap: 20,
    padding: 24,
    border: `1px solid ${strongLine}`,
    borderRadius: 24,
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.08), rgba(255,255,255,0.018))',
  },
  kicker: {
    margin: 0,
    color: gold,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '10px 0 0',
    fontSize: 'clamp(2.2rem, 4.5vw, 4.6rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.07em',
    fontWeight: 950,
  },
  subtitle: {
    margin: '14px 0 0',
    color: '#cfc7b5',
    fontSize: 14,
    lineHeight: 1.65,
    maxWidth: 780,
  },
  statusBox: {
    border: `1px solid ${strongLine}`,
    borderRadius: 20,
    padding: 18,
    background:
      'linear-gradient(180deg, rgba(214,178,94,0.18), rgba(0,0,0,0.38))',
  },
  statusLabel: {
    margin: 0,
    color: gold,
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.18em',
  },
  statusValue: {
    margin: '10px 0',
    fontSize: 26,
    fontWeight: 950,
    lineHeight: 1,
  },
  statusMeaning: {
    margin: 0,
    color: '#f5f0e6',
    fontSize: 13,
    lineHeight: 1.6,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 10,
  },
  metricCard: {
    padding: 14,
    borderRadius: 16,
    background: cardBlack,
    border: `1px solid ${softLine}`,
  },
  metricLabel: {
    margin: 0,
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  metricValue: {
    display: 'block',
    marginTop: 8,
    color: gold,
    fontSize: 28,
    lineHeight: 1,
  },
  message: {
    padding: '10px 12px',
    borderRadius: 12,
    background: 'rgba(214,178,94,0.1)',
    border: `1px solid ${softLine}`,
    color: gold,
    fontWeight: 850,
    fontSize: 12,
  },
  commandDeck: {
    display: 'grid',
    gridTemplateColumns: '1.35fr 0.8fr',
    gap: 16,
  },
  primaryCard: {
    padding: 20,
    borderRadius: 20,
    background: cardBlack,
    border: `1px solid ${softLine}`,
  },
  warningCard: {
    padding: 20,
    borderRadius: 20,
    background: deepBlack,
    border: `1px solid ${softLine}`,
  },
  sectionKicker: {
    margin: 0,
    color: mutedGold,
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
  commandTitle: {
    margin: '10px 0 0',
    fontSize: 'clamp(1.5rem, 3vw, 2.4rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  warningTitle: {
    margin: '10px 0 0',
    fontSize: 24,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
  bodyText: {
    margin: '10px 0 0',
    color: '#cfc7b5',
    fontSize: 13,
    lineHeight: 1.6,
  },
  panel: {
    padding: 18,
    borderRadius: 22,
    background: panelBlack,
    border: `1px solid ${softLine}`,
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  panelTitle: {
    margin: '8px 0 0',
    fontSize: 26,
    lineHeight: 1.12,
    letterSpacing: '-0.045em',
  },
  secondaryButton: {
    border: `1px solid ${softLine}`,
    borderRadius: 999,
    padding: '10px 14px',
    background: 'rgba(214,178,94,0.12)',
    color: gold,
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  requestList: {
    display: 'grid',
    gap: 12,
  },
  requestCard: {
    padding: 14,
    borderRadius: 18,
    background: cardBlack,
    border: `1px solid ${softLine}`,
  },
  requestTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottom: '1px solid rgba(214,178,94,0.16)',
  },
  cardTitle: {
    margin: '6px 0 0',
    color: '#fff8e7',
    fontSize: 22,
    lineHeight: 1.1,
  },
  metaText: {
    margin: '8px 0 0',
    color: '#cfc7b5',
    fontSize: 12,
    lineHeight: 1.45,
  },
  badge: {
    borderRadius: 999,
    padding: '7px 10px',
    background: 'rgba(214,178,94,0.12)',
    border: `1px solid ${softLine}`,
    color: gold,
    fontSize: 10,
    fontWeight: 950,
    textTransform: 'uppercase',
  },
  needBox: {
    padding: 13,
    borderRadius: 14,
    background: deepBlack,
    border: `1px solid ${softLine}`,
    marginBottom: 10,
  },
  needText: {
    margin: '8px 0 0',
    color: '#fff8e7',
    lineHeight: 1.45,
    fontSize: 13,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 8,
  },
  detailBox: {
    padding: 11,
    borderRadius: 13,
    background: deepBlack,
    border: '1px solid rgba(214,178,94,0.16)',
  },
  detailValue: {
    margin: '7px 0 0',
    color: '#fff8e7',
    fontSize: 12,
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },
  assignBox: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 180px',
    gap: 10,
    alignItems: 'end',
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    background: deepBlack,
    border: `1px solid ${softLine}`,
  },
  label: {
    color: '#cfc7b5',
    fontSize: 12,
    fontWeight: 900,
  },
  select: {
    width: '100%',
    marginTop: 7,
    border: `1px solid ${softLine}`,
    borderRadius: 12,
    padding: 10,
    background: panelBlack,
    color: '#fff8e7',
    fontSize: 13,
  },
  primaryButton: {
    border: 'none',
    borderRadius: 12,
    padding: '11px 14px',
    background: gold,
    color: '#11100d',
    fontWeight: 950,
    cursor: 'pointer',
  },
  evidencePanel: {
    padding: 18,
    borderRadius: 22,
    background: panelBlack,
    border: `1px solid ${softLine}`,
  },
  evidenceSummary: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    listStyle: 'none',
  },
  evidenceTitle: {
    display: 'block',
    color: '#fff8e7',
    fontSize: 20,
    lineHeight: 1.2,
    marginTop: 6,
  },
  evidenceToggle: {
    flex: '0 0 auto',
    borderRadius: 999,
    padding: '9px 12px',
    background: 'rgba(214,178,94,0.12)',
    border: `1px solid ${softLine}`,
    color: gold,
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.11em',
    textTransform: 'uppercase',
  },
  emptyBox: {
    margin: 0,
    padding: 13,
    borderRadius: 13,
    border: '1px dashed rgba(214,178,94,0.24)',
    color: '#cfc7b5',
    background: deepBlack,
    fontSize: 12,
  },
  doctrineCard: {
    display: 'grid',
    gap: 8,
    padding: 18,
    borderRadius: 20,
    background: deepBlack,
    border: `1px solid ${strongLine}`,
    color: '#fff8e7',
    lineHeight: 1.6,
    fontSize: 13,
  },
}