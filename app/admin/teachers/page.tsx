'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../../lib/supabase'

type TeacherProfile = {
  id: string
  full_name: string
  email: string
  subjects: string[] | null
  grade_levels: string[] | null
  province: string | null
  spoken_languages: string[] | null
  hourly_rate: number | null
  bio: string | null
  status: string
  created_at: string
}

export default function AdminTeachersPage() {
  return (
    <GovernanceRouteGuard allowedRoles={['SUPER_ADMIN', 'GOVERNANCE_OFFICER']}>
      <CGIGovernanceShell>
        <ResponderGovernanceContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function ResponderGovernanceContent() {
  const [responders, setResponders] = useState<TeacherProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Loading responder governance...')
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    loadResponders()
  }, [])

  const pendingResponders = useMemo(
    () => responders.filter((responder) => responder.status === 'PENDING'),
    [responders],
  )

  const approvedResponders = useMemo(
    () => responders.filter((responder) => responder.status === 'APPROVED'),
    [responders],
  )

  const suspendedResponders = useMemo(
    () => responders.filter((responder) => responder.status === 'SUSPENDED'),
    [responders],
  )

  async function loadResponders() {
    setLoading(true)
    setMessage('Loading responder governance...')

    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setMessage('Responder governance could not load profiles.')
      setLoading(false)
      return
    }

    setResponders(data || [])
    setMessage('Responder governance loaded.')
    setLoading(false)
  }

  async function updateResponderStatus(id: string, status: string) {
    setSavingId(id)
    setMessage('Updating responder governance status...')

    const { error } = await supabase
      .from('teacher_profiles')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error(error)
      setMessage('Responder status update failed.')
      setSavingId(null)
      return
    }

    setMessage(`Responder marked as ${status}.`)
    await loadResponders()
    setSavingId(null)
  }

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <header style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • RESPONDER GOVERNANCE</p>
            <h1 style={styles.title}>Responder Governance</h1>
            <p style={styles.subtitle}>
              Control who can receive governed assignments without turning
              responder review into ranking, surveillance, or blame.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>RESPONDER POSTURE</p>
            <p style={styles.statusValue}>CONTROLLED</p>
            <p style={styles.statusMeaning}>
              Pending responders wait for review. Approved responders can be
              assigned. Suspended responders remain blocked until restored.
            </p>
          </div>
        </header>

        <section style={styles.metricsGrid}>
          <Metric label="Pending" value={pendingResponders.length} />
          <Metric label="Approved" value={approvedResponders.length} />
          <Metric label="Suspended" value={suspendedResponders.length} />
          <Metric label="Total Profiles" value={responders.length} />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Responder Governance Question</p>
            <h2 style={styles.commandTitle}>
              Which responders can safely receive governed assignments?
            </h2>
            <p style={styles.bodyText}>
              This surface approves, suspends, or restores responder access. It
              does not score people, diagnose competence, or create performance
              labels.
            </p>
          </div>

          <div style={styles.warningCard}>
            <p style={styles.sectionKicker}>Boundary</p>
            <h2 style={styles.warningTitle}>Authorize, do not rank.</h2>
            <p style={styles.bodyText}>
              Responder governance controls assignment eligibility only.
              Continuity accountability remains structural and non-punitive.
            </p>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.sectionKicker}>Responder Governance Queue</p>
              <h2 style={styles.panelTitle}>Pending review</h2>
            </div>

            <button type="button" onClick={loadResponders} style={styles.secondaryButton}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {loading ? (
            <p style={styles.emptyBox}>Loading responder profiles...</p>
          ) : pendingResponders.length === 0 ? (
            <p style={styles.emptyBox}>No responders are waiting for review.</p>
          ) : (
            <div style={styles.responderList}>
              {pendingResponders.map((responder) => (
                <ResponderDecisionCard
                  key={responder.id}
                  responder={responder}
                  savingId={savingId}
                  primaryLabel="Approve"
                  primaryAction={(id) => updateResponderStatus(id, 'APPROVED')}
                  secondaryLabel="Suspend"
                  secondaryAction={(id) => updateResponderStatus(id, 'SUSPENDED')}
                />
              ))}
            </div>
          )}
        </section>

        <details style={styles.evidencePanel}>
          <summary style={styles.evidenceSummary}>
            <span>
              <span style={styles.sectionKicker}>Supporting Responder Evidence</span>
              <strong style={styles.evidenceTitle}>
                Approved, suspended, and full responder profile records
              </strong>
            </span>

            <span style={styles.evidenceToggle}>Expand Evidence</span>
          </summary>

          <section style={styles.evidenceBlock}>
            <p style={styles.sectionKicker}>Approved responder pool</p>
            <h2 style={styles.evidenceSectionTitle}>Assignment-eligible responders</h2>

            {approvedResponders.length === 0 ? (
              <p style={styles.emptyBox}>No approved responders yet.</p>
            ) : (
              <div style={styles.responderList}>
                {approvedResponders.map((responder) => (
                  <ResponderDecisionCard
                    key={responder.id}
                    responder={responder}
                    savingId={savingId}
                    primaryLabel="Suspend"
                    primaryAction={(id) => updateResponderStatus(id, 'SUSPENDED')}
                    secondaryLabel="Return to Pending"
                    secondaryAction={(id) => updateResponderStatus(id, 'PENDING')}
                  />
                ))}
              </div>
            )}
          </section>

          <section style={styles.evidenceBlock}>
            <p style={styles.sectionKicker}>Suspended responders</p>
            <h2 style={styles.evidenceSectionTitle}>Blocked from assignment</h2>

            {suspendedResponders.length === 0 ? (
              <p style={styles.emptyBox}>No suspended responders.</p>
            ) : (
              <div style={styles.responderList}>
                {suspendedResponders.map((responder) => (
                  <ResponderDecisionCard
                    key={responder.id}
                    responder={responder}
                    savingId={savingId}
                    primaryLabel="Approve Again"
                    primaryAction={(id) => updateResponderStatus(id, 'APPROVED')}
                    secondaryLabel="Return to Pending"
                    secondaryAction={(id) => updateResponderStatus(id, 'PENDING')}
                  />
                ))}
              </div>
            )}
          </section>

          <section style={styles.evidenceBlock}>
            <p style={styles.sectionKicker}>Full responder records</p>
            <h2 style={styles.evidenceSectionTitle}>Profile evidence</h2>

            {responders.length === 0 ? (
              <p style={styles.emptyBox}>No responder profiles found.</p>
            ) : (
              <div style={styles.responderList}>
                {responders.map((responder) => (
                  <ResponderProfileCard key={responder.id} responder={responder} />
                ))}
              </div>
            )}
          </section>
        </details>

        <section style={styles.doctrineCard}>
          <strong>RESPONDER GOVERNANCE DOCTRINE</strong>
          <span>
            Responder governance is not performance ranking. It controls
            assignment eligibility, protects continuity ownership, and preserves
            a safe non-punitive boundary for governed response work.
          </span>
        </section>
      </section>
    </main>
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

function ResponderDecisionCard({
  responder,
  savingId,
  primaryLabel,
  primaryAction,
  secondaryLabel,
  secondaryAction,
}: {
  responder: TeacherProfile
  savingId: string | null
  primaryLabel: string
  primaryAction: (id: string) => void
  secondaryLabel: string
  secondaryAction: (id: string) => void
}) {
  return (
    <article style={styles.responderCard}>
      <ResponderHeader responder={responder} label="Responder decision record" />

      <div style={styles.detailGrid}>
        <Detail label="Domains" value={formatList(responder.subjects)} />
        <Detail label="Levels" value={formatList(responder.grade_levels)} />
        <Detail label="Region" value={responder.province || 'Not provided'} />
      </div>

      <div style={styles.buttonRow}>
        <button
          type="button"
          onClick={() => primaryAction(responder.id)}
          disabled={savingId === responder.id}
          style={styles.primaryButton}
        >
          {savingId === responder.id ? 'Updating...' : primaryLabel}
        </button>

        <button
          type="button"
          onClick={() => secondaryAction(responder.id)}
          disabled={savingId === responder.id}
          style={styles.secondaryActionButton}
        >
          {secondaryLabel}
        </button>
      </div>
    </article>
  )
}

function ResponderProfileCard({ responder }: { responder: TeacherProfile }) {
  return (
    <article style={styles.responderCard}>
      <ResponderHeader responder={responder} label="Responder profile record" />

      <div style={styles.detailGrid}>
        <Detail label="Domains" value={formatList(responder.subjects)} />
        <Detail label="Levels" value={formatList(responder.grade_levels)} />
        <Detail label="Region" value={responder.province || 'Not provided'} />
        <Detail label="Languages" value={formatList(responder.spoken_languages)} />
        <Detail label="Rate" value={formatMoney(responder.hourly_rate)} />
        <Detail label="Submitted" value={formatDateTime(responder.created_at)} />
      </div>

      <div style={styles.bioBox}>
        <p style={styles.metricLabel}>Responder evidence</p>
        <p style={styles.bioText}>{responder.bio || 'No profile evidence provided.'}</p>
      </div>
    </article>
  )
}

function ResponderHeader({
  responder,
  label,
}: {
  responder: TeacherProfile
  label: string
}) {
  return (
    <div style={styles.cardHeader}>
      <div>
        <p style={styles.metricLabel}>{label}</p>
        <h3 style={styles.cardTitle}>
          {responder.full_name || 'Unnamed Responder'}
        </h3>
        <p style={styles.metaText}>{responder.email || 'No email provided'}</p>
      </div>

      <span style={styles.badge}>{responder.status || 'UNKNOWN'}</span>
    </div>
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
  if (!value || value.length === 0) return 'Not provided'
  return value.join(', ')
}

function formatMoney(value: number | null) {
  if (!value) return 'Not provided'
  return `$${value}`
}

function formatDateTime(value: string | null) {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleString()
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
  responderList: {
    display: 'grid',
    gap: 12,
  },
  responderCard: {
    padding: 14,
    borderRadius: 18,
    background: cardBlack,
    border: `1px solid ${softLine}`,
  },
  cardHeader: {
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
    fontSize: 18,
    lineHeight: 1.1,
    wordBreak: 'break-word',
  },
  metaText: {
    margin: '8px 0 0',
    color: '#cfc7b5',
    fontSize: 12,
    lineHeight: 1.45,
    wordBreak: 'break-word',
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
    whiteSpace: 'nowrap',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 8,
    marginBottom: 10,
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
  buttonRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
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
  secondaryActionButton: {
    border: `1px solid ${softLine}`,
    borderRadius: 12,
    padding: '11px 14px',
    background: 'rgba(214,178,94,0.1)',
    color: '#fff8e7',
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
  evidenceBlock: {
    marginTop: 16,
    padding: 16,
    borderRadius: 18,
    background: deepBlack,
    border: `1px solid ${softLine}`,
  },
  evidenceSectionTitle: {
    margin: '8px 0 12px',
    color: '#fff8e7',
    fontSize: 22,
    lineHeight: 1.15,
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
  bioBox: {
    marginTop: 10,
    padding: 13,
    borderRadius: 14,
    background: deepBlack,
    border: `1px solid ${softLine}`,
  },
  bioText: {
    margin: '8px 0 0',
    color: '#fff8e7',
    fontSize: 13,
    lineHeight: 1.55,
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