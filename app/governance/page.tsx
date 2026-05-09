'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import InfrastructureQuickNav from '@/components/InfrastructureQuickNav'
import { supabase } from '../../lib/supabase'

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
  created_at?: string
}

const STATUS_FLOW = [
  'PENDING',
  'UNDER_REVIEW',
  'VERIFIED',
  'ACTIVE',
  'RESTRICTED',
  'SUSPENDED',
  'REMOVED',
]

const GOVERNANCE_REASONS: Record<string, string[]> = {
  PENDING: [
    'Initial responder submission received',
    'Awaiting governance review',
  ],
  UNDER_REVIEW: [
    'Governance review initiated',
    'Verification evidence under assessment',
    'Safeguarding review in progress',
  ],
  VERIFIED: [
    'Identity reviewed',
    'Capability evidence accepted',
    'Safeguarding accepted',
    'Operational readiness confirmed',
    'Institutional recommendation accepted',
    'Regional approval completed',
  ],
  ACTIVE: [
    'Responder approved for assignment',
    'Governance activation completed',
    'District operational activation approved',
    'Institution-linked activation approved',
    'Responder cleared for intervention routing',
  ],
  RESTRICTED: [
    'Limited operational scope applied',
    'Temporary governance restriction',
    'Escalation monitoring active',
    'Operational visibility reduced',
  ],
  SUSPENDED: [
    'Safeguarding review pending',
    'Operational concern detected',
    'Repeated assignment non-response',
    'Institutional escalation pending',
    'Policy breach investigation',
  ],
  REMOVED: [
    'Governance removal approved',
    'Safeguarding violation confirmed',
    'Operational trust failure',
    'Institutional removal request',
    'Repeated governance breach',
  ],
}

export default function GovernanceConsolePage() {
  const [mounted, setMounted] = useState(false)
  const [profiles, setProfiles] = useState<TeacherProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const [selectedProfile, setSelectedProfile] = useState<TeacherProfile | null>(
    null
  )
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedReason, setSelectedReason] = useState('')
  const [governanceNotes, setGovernanceNotes] = useState('')

  useEffect(() => {
    setMounted(true)
    loadProfiles()
  }, [])

  if (!mounted) return null

  async function loadProfiles() {
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setMessage('Could not load responder verification profiles.')
      setLoading(false)
      return
    }

    setProfiles(data || [])
    setLoading(false)
  }

  function normalizedStatus(status: string) {
    if (status === 'APPROVED') return 'VERIFIED'
    return status || 'PENDING'
  }

  function arrayText(value: string[] | null | undefined) {
    if (!value || value.length === 0) return 'Not provided'
    return value.join(', ')
  }

  function trustScoreForStatus(status: string) {
    if (status === 'ACTIVE') return 75
    if (status === 'VERIFIED') return 65
    if (status === 'UNDER_REVIEW') return 50
    if (status === 'RESTRICTED') return 35
    if (status === 'SUSPENDED') return 20
    if (status === 'REMOVED') return 0
    return 45
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
        { onConflict: 'email' }
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
        governance_actor: 'EXAMIA Governance Console',
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
    setMessage(`Responder moved to ${selectedStatus}. Governance action logged.`)

    await loadProfiles()
  }

  const total = profiles.length
  const pending = profiles.filter(
    (p) => normalizedStatus(p.status) === 'PENDING'
  ).length
  const active = profiles.filter(
    (p) => normalizedStatus(p.status) === 'ACTIVE'
  ).length
  const restricted = profiles.filter((p) =>
    ['RESTRICTED', 'SUSPENDED'].includes(normalizedStatus(p.status))
  ).length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.quickNavWrap}>
          <InfrastructureQuickNav />
        </div>

        <section style={styles.hero}>
          <p style={styles.kicker}>EXAMIA LIS • STRUCTURED GOVERNANCE ENGINE</p>

          <h1 style={styles.title}>Responder Activation + Governance Console</h1>

          <p style={styles.subtitle}>
            This console controls responder verification, activation, restriction,
            suspension, removal, and governance evidence using standardized
            operational reasons for EXAMIA Learning Stabilization Infrastructure.
          </p>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Total Profiles" value={total} />
          <Metric label="Pending Review" value={pending} />
          <Metric label="Active Responders" value={active} />
          <Metric label="Restricted / Suspended" value={restricted} />
        </section>

        {message && <p style={styles.message}>{message}</p>}

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>Responder Verification Queue</h2>

              <p style={styles.cardText}>
                Review each responder and move them through the governed
                lifecycle using structured action reasons.
              </p>
            </div>

            <button onClick={loadProfiles} style={styles.refreshButton}>
              Refresh
            </button>
          </div>

          {loading ? (
            <p style={styles.cardText}>Loading governance queue...</p>
          ) : profiles.length === 0 ? (
            <p style={styles.cardText}>No responder profiles found.</p>
          ) : (
            <div style={styles.profileList}>
              {profiles.map((profile) => {
                const currentStatus = normalizedStatus(profile.status)

                return (
                  <article key={profile.id} style={styles.profileCard}>
                    <div style={styles.profileTop}>
                      <div>
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
                        label="Learner Levels"
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
                        label="Expected Rate"
                        value={
                          profile.hourly_rate !== null &&
                          profile.hourly_rate !== undefined
                            ? String(profile.hourly_rate)
                            : 'Not provided'
                        }
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
      </div>

      {selectedProfile && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Governance Action</h2>

            <p style={styles.modalText}>
              Move <strong>{selectedProfile.full_name}</strong> to{' '}
              <strong>{selectedStatus}</strong>
            </p>

            <label style={styles.label}>Governance Reason</label>

            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
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
              onChange={(e) => setGovernanceNotes(e.target.value)}
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <h2 style={styles.metricValue}>{value}</h2>
    </div>
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

function statusBadge(status: string): CSSProperties {
  const base: CSSProperties = {
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.5px',
  }

  if (status === 'ACTIVE') {
    return { ...base, background: '#dcfce7', color: '#166534' }
  }

  if (status === 'VERIFIED') {
    return { ...base, background: '#dbeafe', color: '#1e40af' }
  }

  if (status === 'UNDER_REVIEW') {
    return { ...base, background: '#fef9c3', color: '#854d0e' }
  }

  if (status === 'RESTRICTED') {
    return { ...base, background: '#ffedd5', color: '#9a3412' }
  }

  if (status === 'SUSPENDED') {
    return { ...base, background: '#fee2e2', color: '#991b1b' }
  }

  if (status === 'REMOVED') {
    return { ...base, background: '#111827', color: '#f9fafb' }
  }

  return { ...base, background: '#e0f2fe', color: '#075985' }
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
    color: 'white',
    padding: '56px 18px',
  },

  container: {
    maxWidth: '1180px',
    margin: '0 auto',
  },

  quickNavWrap: {
    marginBottom: '32px',
  },

  hero: {
    marginBottom: '28px',
  },

  kicker: {
    color: '#67e8f9',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
  },

  title: {
    fontSize: 'clamp(34px, 6vw, 58px)',
    margin: '10px 0',
    lineHeight: 1.05,
  },

  subtitle: {
    maxWidth: '880px',
    color: '#cbd5e1',
    fontSize: '18px',
    lineHeight: 1.6,
  },

  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '14px',
    marginBottom: '22px',
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
    fontSize: '36px',
    margin: '8px 0 0',
  },

  message: {
    background: '#064e3b',
    color: '#bbf7d0',
    padding: '14px',
    borderRadius: '14px',
    fontWeight: 800,
  },

  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.4)',
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },

  cardTitle: {
    margin: 0,
    fontSize: '26px',
  },

  cardText: {
    color: '#cbd5e1',
    lineHeight: 1.5,
  },

  refreshButton: {
    background: '#67e8f9',
    color: '#082f49',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 16px',
    fontWeight: 900,
    cursor: 'pointer',
  },

  profileList: {
    display: 'grid',
    gap: '18px',
  },

  profileCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '20px',
    padding: '20px',
  },

  profileTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },

  profileName: {
    margin: 0,
    fontSize: '22px',
  },

  email: {
    color: '#93c5fd',
    marginTop: '6px',
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

  details: {
    marginTop: '16px',
    background: '#020617',
    borderRadius: '14px',
    padding: '14px',
    border: '1px solid #1e293b',
  },

  summary: {
    cursor: 'pointer',
    fontWeight: 900,
    color: '#67e8f9',
  },

  bio: {
    whiteSpace: 'pre-wrap',
    color: '#dbeafe',
    lineHeight: 1.5,
    marginTop: '12px',
    fontFamily: 'inherit',
  },

  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '10px',
    marginTop: '16px',
  },

  actionButton: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #475569',
    background: '#111827',
    color: 'white',
    fontWeight: 900,
    cursor: 'pointer',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.72)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px',
  },

  modal: {
    width: '100%',
    maxWidth: '620px',
    background: '#020617',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #334155',
    boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
  },

  modalTitle: {
    fontSize: '28px',
    margin: '0 0 10px',
  },

  modalText: {
    color: '#cbd5e1',
    marginBottom: '20px',
    lineHeight: 1.5,
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    marginTop: '16px',
    fontWeight: 800,
  },

  select: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
  },

  textarea: {
    width: '100%',
    minHeight: '120px',
    padding: '14px',
    borderRadius: '12px',
    background: '#111827',
    color: 'white',
    border: '1px solid #334155',
    resize: 'vertical',
  },

  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    flexWrap: 'wrap',
  },

  cancelButton: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    background: '#1e293b',
    color: 'white',
    border: 'none',
    fontWeight: 800,
    cursor: 'pointer',
  },

  confirmButton: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    background: '#67e8f9',
    color: '#082f49',
    border: 'none',
    fontWeight: 900,
    cursor: 'pointer',
  },
}