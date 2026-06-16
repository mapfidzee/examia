'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  buildGovernanceIntelligence,
  GOVERNANCE_REASONS,
  normalizedStatus,
  STATUS_FLOW,
  trustScoreForStatus,
  type TeacherProfileForGovernanceDoctrine,
} from '@/lib/cgiGovernanceDoctrineEngine'
import { supabase } from '../../lib/supabase'

type TeacherProfile = TeacherProfileForGovernanceDoctrine

export default function GovernanceConsolePage() {
  return (
    <GovernanceRouteGuard allowedRoles={['SUPER_ADMIN', 'GOVERNANCE_OFFICER']}>
      <CGIGovernanceShell>
        <GovernanceConsoleContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function GovernanceConsoleContent() {
  const [mounted, setMounted] = useState(false)
  const [profiles, setProfiles] = useState<TeacherProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const [selectedProfile, setSelectedProfile] = useState<TeacherProfile | null>(
    null,
  )
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedReason, setSelectedReason] = useState('')
  const [governanceNotes, setGovernanceNotes] = useState('')

  useEffect(() => {
    setMounted(true)
    loadProfiles()
  }, [])

  async function loadProfiles() {
    setLoading(true)
    setMessage('Loading governance authority memory...')

    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setMessage('Governance authority memory could not be loaded.')
      setLoading(false)
      return
    }

    setProfiles(data || [])
    setMessage('Governance authority memory loaded.')
    setLoading(false)
  }

  function openGovernanceAction(profile: TeacherProfile, nextStatus: string) {
    setSelectedProfile(profile)
    setSelectedStatus(nextStatus)
    setSelectedReason('')
    setGovernanceNotes('')
  }

  async function confirmGovernanceAction() {
    if (!selectedProfile || !selectedStatus || !selectedReason) {
      alert('Please select a governance reason.')
      return
    }

    setActionLoading(`${selectedProfile.id}-${selectedStatus}`)
    setMessage('')

    const previousStatus = normalizedStatus(selectedProfile.status)

    const { error: updateError } = await supabase
      .from('teacher_profiles')
      .update({ status: selectedStatus })
      .eq('id', selectedProfile.id)

    if (updateError) {
      console.error(updateError)
      alert(updateError.message)
      setActionLoading(null)
      return
    }

    const { data: responderData, error: responderError } = await supabase
      .from('responders')
      .upsert(
        {
          source_teacher_profile_id: selectedProfile.id,
          full_name: selectedProfile.full_name,
          email: selectedProfile.email,
          operational_status: selectedStatus,
          governance_status: selectedStatus,
          governance_reason: selectedReason,
          governance_role: 'RESPONDER',
          response_domains: selectedProfile.subjects || [],
          learner_levels: selectedProfile.grade_levels || [],
          languages: selectedProfile.spoken_languages || [],
          region: selectedProfile.province || '',
          trust_score: trustScoreForStatus(selectedStatus),
          safeguarding_status:
            selectedStatus === 'ACTIVE' || selectedStatus === 'VERIFIED'
              ? 'ACCEPTED'
              : 'PENDING',
          verification_summary: selectedProfile.bio || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' },
      )
      .select()
      .single()

    if (responderError) {
      console.error(responderError)
      alert(responderError.message)
      setActionLoading(null)
      return
    }

    const { error: actionError } = await supabase
      .from('governance_actions')
      .insert({
        responder_id: responderData.id,
        teacher_profile_id: selectedProfile.id,
        action_type: `STATUS_CHANGE_TO_${selectedStatus}`,
        previous_status: previousStatus,
        new_status: selectedStatus,
        governance_actor: 'TSINAXA CGI Governance Console',
        reason: selectedReason,
        notes: governanceNotes.trim() || null,
      })

    if (actionError) {
      console.error(actionError)
      alert(actionError.message)
      setActionLoading(null)
      return
    }

    setSelectedProfile(null)
    setSelectedStatus('')
    setSelectedReason('')
    setGovernanceNotes('')
    setActionLoading(null)
    setMessage(`Authority moved to ${selectedStatus}. Governance action logged.`)

    await loadProfiles()
  }

  const governance = useMemo(
    () => buildGovernanceIntelligence(profiles),
    [profiles],
  )

  if (!mounted) return null

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • GOVERNANCE</p>
            <h1 style={styles.title}>Governance</h1>
            <p style={styles.subtitle}>
              Control authority, access, trust, restriction, suspension,
              removal, and audit memory before continuity authority can affect
              institutional survivability.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>GOVERNANCE POSTURE</p>
            <p style={styles.statusValue}>{governance.posture}</p>
            <p style={styles.statusMeaning}>{governance.thesis}</p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Executive Governance Question</p>
            <h2 style={styles.commandTitle}>{governance.question}</h2>
            <p style={styles.bodyText}>{governance.authorityMeaning}</p>

            <div style={styles.commandMetaGrid}>
              <MiniStat label="Decision" value={governance.decision} />
              <MiniStat label="Trust" value={governance.responderTrust} />
              <MiniStat label="Access Risk" value={governance.accessRisk} />
              <MiniStat label="Audit" value={governance.auditMeaning} />
            </div>
          </div>

          <div style={styles.consequenceCard}>
            <p style={styles.sectionKicker}>Board Warning</p>
            <h2 style={styles.consequenceTitle}>
              Authority without evidence becomes institutional risk.
            </h2>
            <p style={styles.bodyText}>{governance.boardWarning}</p>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Profiles" value={governance.counts.total} />
          <Metric label="Pending" value={governance.counts.pending} />
          <Metric label="Review" value={governance.counts.underReview} />
          <Metric label="Active" value={governance.counts.active} />
          <Metric label="Restricted" value={governance.counts.restricted} />
          <Metric label="Removed" value={governance.counts.removed} />
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Access Risk"
            value={governance.accessRisk}
            body="Whether authority may exceed evidence or permission."
          />
          <ExecutiveCard
            title="Responder Trust"
            value={governance.responderTrust}
            body="Whether responders are verified for operational authority."
          />
          <ExecutiveCard
            title="Restriction Meaning"
            value={governance.restrictionMeaning}
            body="Whether restriction is preserving continuity credibility."
          />
          <ExecutiveCard
            title="Doctrine Meaning"
            value={governance.doctrineMeaning}
            body="Whether governance prevents blame, drift, weak closure, and uncontrolled authority."
          />
        </section>

        <section style={styles.memoryPanel}>
          <p style={styles.sectionKicker}>Governance Memory</p>
          <h2 style={styles.panelTitle}>
            Authority must be evidence-bound, role-bound, time-bound, and
            reconstructable.
          </h2>

          <div style={styles.memoryGrid}>
            <MiniStat label="Evidence" value={governance.evidenceRequirement} />
            <MiniStat label="Memory" value={governance.memoryRequirement} />
            <MiniStat
              label="Executive Action"
              value={governance.executiveAction}
            />
            <MiniStat label="Audit" value={governance.auditMeaning} />
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.sectionKicker}>Responder Authority Queue</p>
              <h2 style={styles.panelTitle}>
                Govern activation, restriction, suspension, and removal
              </h2>
              <p style={styles.bodyText}>
                Every authority movement updates responder access, trust,
                safeguarding posture, and governance action memory.
              </p>
            </div>

            <button onClick={loadProfiles} style={styles.primaryButton}>
              Refresh
            </button>
          </div>

          {loading ? (
            <p style={styles.emptyBox}>Loading governance authority queue...</p>
          ) : profiles.length === 0 ? (
            <p style={styles.emptyBox}>No responder authority profiles found.</p>
          ) : (
            <div style={styles.profileList}>
              {profiles.map((profile) => {
                const currentStatus = normalizedStatus(profile.status)

                return (
                  <article key={profile.id} style={styles.profileCard}>
                    <div style={styles.profileTop}>
                      <div>
                        <p style={styles.metricLabel}>Responder Authority</p>
                        <h3 style={styles.profileName}>{profile.full_name}</h3>
                        <p style={styles.email}>{profile.email}</p>
                      </div>

                      <span style={statusBadge(currentStatus)}>
                        {currentStatus}
                      </span>
                    </div>

                    <div style={styles.infoGrid}>
                      <Info label="Domains" value={arrayText(profile.subjects)} />
                      <Info
                        label="Levels"
                        value={arrayText(profile.grade_levels)}
                      />
                      <Info
                        label="Languages"
                        value={arrayText(profile.spoken_languages)}
                      />
                      <Info
                        label="Region"
                        value={profile.province || 'Not provided'}
                      />
                      <Info
                        label="Rate"
                        value={
                          profile.hourly_rate !== null &&
                          profile.hourly_rate !== undefined
                            ? String(profile.hourly_rate)
                            : 'Not provided'
                        }
                      />
                      <Info
                        label="Trust"
                        value={String(trustScoreForStatus(currentStatus))}
                      />
                    </div>

                    <details style={styles.details}>
                      <summary style={styles.summary}>
                        View verification evidence
                      </summary>
                      <pre style={styles.bio}>
                        {profile.bio || 'No verification evidence submitted.'}
                      </pre>
                    </details>

                    <div style={styles.actionGrid}>
                      {STATUS_FLOW.map((status) => (
                        <button
                          key={status}
                          onClick={() => openGovernanceAction(profile, status)}
                          disabled={actionLoading === `${profile.id}-${status}`}
                          style={{
                            ...styles.actionButton,
                            opacity:
                              currentStatus === status ||
                              actionLoading === `${profile.id}-${status}`
                                ? 0.55
                                : 1,
                          }}
                        >
                          {actionLoading === `${profile.id}-${status}`
                            ? 'Saving...'
                            : status}
                        </button>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section style={styles.orderPanel}>
          <p style={styles.sectionKicker}>Governance Brief</p>
          <h2 style={styles.panelTitle}>
            Can continuity authority be trusted, controlled, and reconstructed?
          </h2>
          <pre style={styles.summaryBox}>{governance.generatedBrief}</pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>GOVERNANCE DOCTRINE</strong>
          <span>
            Governance is not administration. Governance controls authority,
            trust, access, restriction, activation, suspension, removal, and
            audit memory before continuity authority can affect survivability.
          </span>
        </section>
      </div>

      {selectedProfile && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <p style={styles.sectionKicker}>Governance Action</p>
            <h2 style={styles.modalTitle}>Change authority state</h2>
            <p style={styles.modalText}>
              Move <strong>{selectedProfile.full_name}</strong> to{' '}
              <strong>{selectedStatus}</strong>
            </p>

            <label style={styles.label}>Governance Reason</label>
            <select
              value={selectedReason}
              onChange={(event) => setSelectedReason(event.target.value)}
              style={styles.select}
            >
              <option value="">Select governance reason</option>
              {(GOVERNANCE_REASONS[selectedStatus] || []).map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            <label style={styles.label}>Governance Notes Optional</label>
            <textarea
              value={governanceNotes}
              onChange={(event) => setGovernanceNotes(event.target.value)}
              style={styles.textarea}
              placeholder="Additional governance notes..."
            />

            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setSelectedProfile(null)
                  setSelectedStatus('')
                  setSelectedReason('')
                  setGovernanceNotes('')
                }}
                style={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                onClick={confirmGovernanceAction}
                style={styles.confirmButton}
              >
                Confirm Governance Action
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function arrayText(value: string[] | null | undefined) {
  if (!value || value.length === 0) return 'Not provided'
  return value.join(', ')
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{String(value)}</p>
    </article>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.miniStat}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.miniValue}>{value}</p>
    </article>
  )
}

function ExecutiveCard({
  title,
  value,
  body,
}: {
  title: string
  value: string
  body: string
}) {
  return (
    <article style={styles.panelCard}>
      <p style={styles.sectionKicker}>{title}</p>
      <h3 style={styles.cardValue}>{value}</h3>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  )
}

function statusBadge(status: string): CSSProperties {
  const base: CSSProperties = {
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: '0.08em',
    border: '1px solid rgba(201,162,39,0.28)',
    textTransform: 'uppercase',
    background: 'rgba(201,162,39,0.12)',
    color: '#D7B84C',
  }

  if (status === 'ACTIVE') {
    return {
      ...base,
      background: 'rgba(255,255,255,0.12)',
      color: '#FFFFFF',
    }
  }

  if (status === 'RESTRICTED' || status === 'SUSPENDED') {
    return {
      ...base,
      background: 'rgba(201,162,39,0.18)',
      color: '#F4D36A',
    }
  }

  if (status === 'REMOVED') {
    return {
      ...base,
      background: 'rgba(255,255,255,0.08)',
      color: '#AEB6C2',
      border: '1px solid rgba(255,255,255,0.18)',
    }
  }

  return base
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(201,162,39,0.14), transparent 34%), linear-gradient(135deg, #050505 0%, #0B0B0B 45%, #111111 100%)',
    color: '#FFFFFF',
    padding: '40px 24px 72px',
  },
  container: {
    width: 'min(1440px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gap: 22,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.75fr)',
    gap: 24,
    padding: 32,
    border: '1px solid rgba(201,162,39,0.34)',
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
    boxShadow: '0 28px 80px rgba(0,0,0,0.38)',
  },
  kicker: {
    margin: 0,
    color: '#C9A227',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '14px 0 0',
    fontSize: 'clamp(2.4rem, 5vw, 5rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.07em',
    fontWeight: 950,
  },
  subtitle: {
    maxWidth: 860,
    margin: '18px 0 0',
    color: '#C8CDD4',
    fontSize: 17,
    lineHeight: 1.75,
  },
  statusBox: {
    border: '1px solid rgba(201,162,39,0.5)',
    borderRadius: 24,
    padding: 24,
    background:
      'linear-gradient(180deg, rgba(201,162,39,0.18), rgba(0,0,0,0.38))',
  },
  statusLabel: {
    margin: 0,
    color: '#D7B84C',
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.2em',
  },
  statusValue: {
    margin: '16px 0 0',
    fontSize: 30,
    fontWeight: 950,
    letterSpacing: '-0.04em',
    lineHeight: 1.05,
  },
  statusMeaning: {
    margin: '12px 0 0',
    color: '#ECE7D7',
    fontSize: 14,
    lineHeight: 1.7,
  },
  message: {
    padding: '14px 18px',
    borderRadius: 16,
    color: '#D7B84C',
    background: 'rgba(201,162,39,0.1)',
    border: '1px solid rgba(201,162,39,0.22)',
    fontWeight: 800,
  },
  commandDeck: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.8fr',
    gap: 22,
  },
  primaryCard: {
    padding: 30,
    borderRadius: 28,
    background: 'rgba(0,0,0,0.34)',
    border: '1px solid rgba(201,162,39,0.28)',
  },
  consequenceCard: {
    padding: 30,
    borderRadius: 28,
    background: 'rgba(0,0,0,0.38)',
    border: '1px solid rgba(201,162,39,0.28)',
  },
  sectionKicker: {
    margin: 0,
    color: '#C9A227',
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  commandTitle: {
    margin: '14px 0',
    fontSize: 'clamp(1.8rem, 3vw, 3.1rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  consequenceTitle: {
    margin: '14px 0',
    fontSize: 28,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
  bodyText: {
    margin: '8px 0 0',
    color: '#AEB6C2',
    lineHeight: 1.7,
    fontSize: 14,
  },
  commandMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 24,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 14,
  },
  metricCard: {
    padding: 18,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  metricLabel: {
    margin: 0,
    color: '#858D98',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  metricValue: {
    margin: '10px 0 0',
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 950,
    lineHeight: 1.15,
    overflowWrap: 'anywhere',
  },
  miniStat: {
    padding: 14,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  miniValue: {
    margin: '8px 0 0',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 850,
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },
  panel: {
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  panelCard: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.09)',
    minHeight: 150,
  },
  panelTitle: {
    margin: '12px 0 0',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
  },
  cardValue: {
    margin: '12px 0 0',
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
  },
  panelBody: {
    marginTop: 10,
    color: '#AEB6C2',
    fontSize: 14,
    lineHeight: 1.65,
  },
  memoryPanel: {
    padding: 28,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(201,162,39,0.13), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.32)',
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
  },
  primaryButton: {
    border: 'none',
    borderRadius: 999,
    padding: '14px 22px',
    background: '#C9A227',
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  emptyBox: {
    margin: '20px 0 0',
    color: '#DCE1E8',
    padding: 18,
    borderRadius: 18,
    border: '1px dashed rgba(255,255,255,0.18)',
    background: 'rgba(0,0,0,0.22)',
  },
  profileList: {
    display: 'grid',
    gap: 18,
    marginTop: 20,
  },
  profileCard: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(0,0,0,0.24)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  profileTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  profileName: {
    margin: '8px 0 0',
    fontSize: 24,
    lineHeight: 1.15,
    color: '#FFFFFF',
  },
  email: {
    color: '#D7B84C',
    marginTop: 6,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 12,
    marginTop: 16,
  },
  infoRow: {
    display: 'grid',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  infoLabel: {
    color: '#858D98',
    fontWeight: 900,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  infoValue: {
    color: '#FFFFFF',
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
  },
  details: {
    marginTop: 16,
    background: 'rgba(0,0,0,0.28)',
    borderRadius: 14,
    padding: 14,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 950,
    color: '#D7B84C',
  },
  bio: {
    whiteSpace: 'pre-wrap',
    color: '#DCE1E8',
    lineHeight: 1.5,
    marginTop: 12,
    fontFamily: 'inherit',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: 10,
    marginTop: 16,
  },
  actionButton: {
    padding: 12,
    borderRadius: 12,
    border: '1px solid rgba(201,162,39,0.24)',
    background: 'rgba(201,162,39,0.1)',
    color: '#FFFFFF',
    fontWeight: 950,
    cursor: 'pointer',
  },
  orderPanel: {
    padding: 28,
    borderRadius: 28,
    background: 'rgba(0,0,0,0.34)',
    border: '1px solid rgba(201,162,39,0.28)',
  },
  summaryBox: {
    marginTop: 20,
    padding: 22,
    borderRadius: 20,
    background: '#050505',
    color: '#F8F6F1',
    border: '1px solid rgba(255,255,255,0.08)',
    whiteSpace: 'pre-wrap',
    fontSize: 13,
    lineHeight: 1.7,
    overflowX: 'auto',
  },
  doctrineCard: {
    display: 'grid',
    gap: 10,
    padding: 24,
    borderRadius: 24,
    background: '#050505',
    border: '1px solid rgba(201,162,39,0.42)',
    color: '#FFFFFF',
    lineHeight: 1.7,
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.78)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 620,
    background: '#050505',
    borderRadius: 24,
    padding: 26,
    border: '1px solid rgba(201,162,39,0.36)',
    boxShadow: '0 28px 90px rgba(0,0,0,0.62)',
  },
  modalTitle: {
    fontSize: 30,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  modalText: {
    color: '#C8CDD4',
    marginBottom: 20,
    lineHeight: 1.5,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    marginTop: 16,
    fontWeight: 900,
    color: '#DCE1E8',
  },
  select: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    background: '#0D0D0D',
    color: '#FFFFFF',
    border: '1px solid rgba(201,162,39,0.24)',
  },
  textarea: {
    width: '100%',
    minHeight: 120,
    padding: 14,
    borderRadius: 14,
    background: '#0D0D0D',
    color: '#FFFFFF',
    border: '1px solid rgba(201,162,39,0.24)',
    resize: 'vertical',
  },
  modalActions: {
    display: 'flex',
    gap: 12,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    background: 'rgba(255,255,255,0.08)',
    color: '#FFFFFF',
    border: '1px solid rgba(255,255,255,0.12)',
    fontWeight: 900,
    cursor: 'pointer',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    background: '#C9A227',
    color: '#090909',
    border: 'none',
    fontWeight: 950,
    cursor: 'pointer',
  },
}