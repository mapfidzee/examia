'use client'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { logAuditEvent } from '../../../lib/auditLogger'
import { supabase } from '../../../lib/supabase'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

type AuditSeverity = 'LOW' | 'MODERATE' | 'HIGH'

type UserRole = {
  id?: string
  user_id: string
  email: string
  role: string
  governance_scope: string | null
  created_at?: string | null
  updated_at?: string | null
}

type AuditActor = {
  userId: string
  email: string
  role: string
}

const GOVERNANCE_ROLES = [
  'SUPER_ADMIN',
  'COMMAND_ADMIN',
  'GOVERNANCE_OFFICER',
  'INSTITUTION_COORDINATOR',
  'RESPONDER',
  'VIEWER',
]

const GOVERNANCE_SCOPES = [
  'GLOBAL',
  'GLOBAL-TEST',
  'INSTITUTION',
  'REGIONAL',
  'DISTRICT',
  'OPERATIONS',
  'AUDIT_ONLY',
]

export default function AdminRolesPage() {
  return (
    <GovernanceRouteGuard allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN']}>
      <CGIGovernanceShell>
        <AdminRolesContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function AdminRolesContent() {
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedRoleByUser, setSelectedRoleByUser] = useState<Record<string, string>>({})
  const [selectedScopeByUser, setSelectedScopeByUser] = useState<Record<string, string>>({})
  const [reasonByUser, setReasonByUser] = useState<Record<string, string>>({})

  useEffect(() => {
    loadRoles()
  }, [])

  async function loadRoles() {
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('email', { ascending: true })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    const records = data || []
    setRoles(records)

    const roleDefaults: Record<string, string> = {}
    const scopeDefaults: Record<string, string> = {}
    const reasonDefaults: Record<string, string> = {}

    records.forEach((item) => {
      roleDefaults[item.user_id] = item.role
      scopeDefaults[item.user_id] = item.governance_scope || 'GLOBAL'
      reasonDefaults[item.user_id] = ''
    })

    setSelectedRoleByUser(roleDefaults)
    setSelectedScopeByUser(scopeDefaults)
    setReasonByUser(reasonDefaults)
    setLoading(false)
  }

  async function getAuditActor(): Promise<AuditActor> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        userId: 'UNKNOWN_ACTOR',
        email: 'Actor not recorded',
        role: 'UNKNOWN',
      }
    }

    const { data } = await supabase
      .from('user_roles')
      .select('role,email')
      .eq('user_id', user.id)
      .maybeSingle()

    return {
      userId: user.id,
      email: data?.email || user.email || 'Actor not recorded',
      role: data?.role || 'UNKNOWN',
    }
  }

  async function updateGovernanceRole(target: UserRole) {
    const newRole = selectedRoleByUser[target.user_id] || target.role
    const newScope = selectedScopeByUser[target.user_id] || target.governance_scope || 'GLOBAL'
    const reason = reasonByUser[target.user_id]?.trim()

    if (!reason) {
      alert('Enter a governance reason before changing this role.')
      return
    }

    const previousRole = target.role
    const previousScope = target.governance_scope || 'GLOBAL'

    if (newRole === previousRole && newScope === previousScope) {
      alert('No governance change detected.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase
      .from('user_roles')
      .update({
        role: newRole,
        governance_scope: newScope,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', target.user_id)

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    const actor = await getAuditActor()
    const institutionScope = deriveInstitutionScope(newScope)
    const visibilityLevel = deriveVisibilityLevel(newRole, newScope)
    const severity = deriveAuditSeverity(previousRole, newRole, newScope)

    const summary = [
      'UPDATE_GOVERNANCE_ROLE.',
      `Actor: ${actor.email}.`,
      `Actor role: ${actor.role}.`,
      `Target user: ${target.email}.`,
      `Target user ID: ${target.user_id}.`,
      `Previous role: ${previousRole}.`,
      `New role: ${newRole}.`,
      `Previous governance scope: ${previousScope}.`,
      `New governance scope: ${newScope}.`,
      `Institution scope: ${institutionScope}.`,
      `Visibility level: ${visibilityLevel}.`,
      `Governance reason: ${reason}.`,
      'Governance posture: permission change preserved as executive continuity evidence.',
      'Immutability status: IMMUTABLE_EVIDENCE_RECORD.',
      'Non-punitive boundary: role governance only; not staff surveillance, blame, worker ranking, or clinical judgment.',
      'Evidence maturity: EXECUTIVE_RECONSTRUCTABLE.',
    ].join(' ')

    await logAuditEvent({
      userId: actor.userId,
      email: actor.email,
      role: actor.role,
      actionType: 'UPDATE_GOVERNANCE_ROLE',
      route: '/admin/roles',
      recordType: 'user_roles',
      recordId: target.user_id,
      summary,
      severity,
    })

    setMessage(
      `Governance role hardened for ${target.email}. Evidence is now executive-reconstructable.`
    )

    await loadRoles()
    setLoading(false)
  }

  const governanceAdmins = roles.filter((item) =>
    ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER'].includes(item.role)
  ).length

  const scopedUsers = roles.filter((item) => item.governance_scope).length

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.kicker}>TSINAXA CGI • ROLE GOVERNANCE EVIDENCE</p>
        <h1 style={styles.title}>Governance Role Control</h1>
        <p style={styles.subtitle}>
          Role changes are no longer quiet permission edits. Each change preserves
          actor identity, target user, previous role, new role, governance scope,
          institution scope, reason, visibility level, immutability posture, and
          non-punitive boundary.
        </p>
      </section>

      <section style={styles.metrics}>
        <Metric label="Governed Users" value={String(roles.length)} />
        <Metric label="Governance Admins" value={String(governanceAdmins)} />
        <Metric label="Scoped Records" value={String(scopedUsers)} />
        <Metric label="Evidence Maturity" value="EXECUTIVE" />
      </section>

      {message && <div style={styles.message}>{message}</div>}

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>Controlled Role Registry</h2>
            <p style={styles.panelNote}>
              Every saved change writes UPDATE_GOVERNANCE_ROLE evidence into the
              Governance Evidence Ledger.
            </p>
          </div>

          <button style={styles.secondaryButton} onClick={loadRoles} disabled={loading}>
            Refresh
          </button>
        </div>

        <div style={styles.roleList}>
          {roles.map((item) => {
            const selectedRole = selectedRoleByUser[item.user_id] || item.role
            const selectedScope =
              selectedScopeByUser[item.user_id] || item.governance_scope || 'GLOBAL'

            return (
              <article key={item.user_id} style={styles.roleCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>{item.email}</h3>
                    <p style={styles.cardNote}>User ID: {item.user_id}</p>
                  </div>

                  <span style={styles.badge}>{deriveVisibilityLevel(selectedRole, selectedScope)}</span>
                </div>

                <div style={styles.detailGrid}>
                  <Detail label="Current Role" value={item.role} />
                  <Detail label="Current Scope" value={item.governance_scope || 'GLOBAL'} />
                  <Detail label="Institution Scope" value={deriveInstitutionScope(selectedScope)} />
                  <Detail label="Evidence Maturity" value="EXECUTIVE_RECONSTRUCTABLE" />
                </div>

                <div style={styles.formGrid}>
                  <label style={styles.label}>
                    New Governance Role
                    <select
                      style={styles.input}
                      value={selectedRole}
                      onChange={(event) =>
                        setSelectedRoleByUser((current) => ({
                          ...current,
                          [item.user_id]: event.target.value,
                        }))
                      }
                    >
                      {GOVERNANCE_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={styles.label}>
                    New Governance Scope
                    <select
                      style={styles.input}
                      value={selectedScope}
                      onChange={(event) =>
                        setSelectedScopeByUser((current) => ({
                          ...current,
                          [item.user_id]: event.target.value,
                        }))
                      }
                    >
                      {GOVERNANCE_SCOPES.map((scope) => (
                        <option key={scope} value={scope}>
                          {scope}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label style={styles.label}>
                  Governance Reason Required
                  <textarea
                    style={styles.textarea}
                    value={reasonByUser[item.user_id] || ''}
                    onChange={(event) =>
                      setReasonByUser((current) => ({
                        ...current,
                        [item.user_id]: event.target.value,
                      }))
                    }
                    placeholder="Example: Scope corrected after governance review. Access remains non-punitive and limited to continuity oversight."
                  />
                </label>

                <div style={styles.boundaryBox}>
                  <strong>Non-punitive boundary:</strong> this change controls governed access.
                  It must not be interpreted as worker ranking, surveillance, blame, or clinical judgment.
                </div>

                <button
                  style={styles.primaryButton}
                  onClick={() => updateGovernanceRole(item)}
                  disabled={loading}
                >
                  Save Governed Role Evidence
                </button>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function deriveInstitutionScope(scope: string) {
  if (scope === 'GLOBAL' || scope === 'GLOBAL-TEST') return 'TSINAXA CGI Enterprise Governance'
  if (scope === 'INSTITUTION') return 'Institution-Level Continuity Governance'
  if (scope === 'REGIONAL') return 'Regional Continuity Governance'
  if (scope === 'DISTRICT') return 'District Continuity Governance'
  if (scope === 'OPERATIONS') return 'Operational Continuity Governance'
  if (scope === 'AUDIT_ONLY') return 'Audit and Evidence Review'
  return 'Governance Scope Recorded'
}

function deriveVisibilityLevel(role: string, scope: string) {
  if (role === 'SUPER_ADMIN' || role === 'COMMAND_ADMIN') return 'EXECUTIVE'
  if (scope === 'GLOBAL' || scope === 'GLOBAL-TEST') return 'EXECUTIVE'
  if (role === 'GOVERNANCE_OFFICER') return 'GOVERNANCE'
  return 'STANDARD_GOVERNANCE'
}

function deriveAuditSeverity(
  previousRole: string,
  newRole: string,
  newScope: string
): AuditSeverity {
  if (newRole === 'SUPER_ADMIN' || previousRole === 'SUPER_ADMIN') return 'HIGH'
  if (newRole === 'COMMAND_ADMIN' || previousRole === 'COMMAND_ADMIN') return 'HIGH'
  if (newScope === 'GLOBAL' || newScope === 'GLOBAL-TEST') return 'HIGH'
  return 'MODERATE'
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.metric}>
      <span style={styles.metricLabel}>{label}</span>
      <strong style={styles.metricValue}>{value}</strong>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.detail}>
      <span style={styles.detailLabel}>{label}</span>
      <strong style={styles.detailValue}>{value}</strong>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0f1115',
    color: '#f5f1e8',
    padding: '32px',
  },
  hero: {
    maxWidth: '1180px',
    margin: '0 auto 24px',
    padding: '28px',
    border: '1px solid rgba(245,241,232,0.14)',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, rgba(119,93,58,0.24), rgba(23,45,38,0.22))',
  },
  kicker: {
    margin: 0,
    fontSize: '12px',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: '#c9b58a',
    fontWeight: 800,
  },
  title: {
    margin: '10px 0',
    fontSize: '42px',
    lineHeight: 1.05,
  },
  subtitle: {
    margin: 0,
    maxWidth: '820px',
    color: '#d8d0c2',
    fontSize: '16px',
    lineHeight: 1.7,
  },
  metrics: {
    maxWidth: '1180px',
    margin: '0 auto 24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
  },
  metric: {
    padding: '18px',
    borderRadius: '18px',
    background: '#171b22',
    border: '1px solid rgba(245,241,232,0.12)',
  },
  metricLabel: {
    display: 'block',
    color: '#a9a190',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  metricValue: {
    display: 'block',
    marginTop: '8px',
    fontSize: '24px',
  },
  message: {
    maxWidth: '1180px',
    margin: '0 auto 20px',
    padding: '14px 16px',
    borderRadius: '16px',
    background: 'rgba(99, 128, 87, 0.18)',
    border: '1px solid rgba(160, 190, 140, 0.28)',
    color: '#e8f3dc',
  },
  panel: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '22px',
    borderRadius: '24px',
    background: '#141820',
    border: '1px solid rgba(245,241,232,0.12)',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '18px',
  },
  panelTitle: {
    margin: 0,
    fontSize: '24px',
  },
  panelNote: {
    margin: '6px 0 0',
    color: '#b9b0a0',
  },
  roleList: {
    display: 'grid',
    gap: '16px',
  },
  roleCard: {
    padding: '20px',
    borderRadius: '22px',
    background: '#0f131a',
    border: '1px solid rgba(245,241,232,0.12)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-start',
    marginBottom: '16px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '18px',
  },
  cardNote: {
    margin: '6px 0 0',
    color: '#9f9788',
    fontSize: '13px',
  },
  badge: {
    padding: '8px 10px',
    borderRadius: '999px',
    background: 'rgba(201,181,138,0.12)',
    color: '#e6d4a7',
    border: '1px solid rgba(201,181,138,0.26)',
    fontSize: '12px',
    fontWeight: 800,
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '10px',
    marginBottom: '16px',
  },
  detail: {
    padding: '12px',
    borderRadius: '14px',
    background: '#171b22',
    border: '1px solid rgba(245,241,232,0.08)',
  },
  detailLabel: {
    display: 'block',
    color: '#a9a190',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  detailValue: {
    display: 'block',
    marginTop: '6px',
    fontSize: '13px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '12px',
  },
  label: {
    display: 'grid',
    gap: '8px',
    color: '#dcd3c2',
    fontSize: '13px',
    fontWeight: 700,
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '14px',
    border: '1px solid rgba(245,241,232,0.16)',
    background: '#0b0e13',
    color: '#f5f1e8',
  },
  textarea: {
    width: '100%',
    minHeight: '92px',
    padding: '12px',
    borderRadius: '14px',
    border: '1px solid rgba(245,241,232,0.16)',
    background: '#0b0e13',
    color: '#f5f1e8',
    resize: 'vertical',
  },
  boundaryBox: {
    marginTop: '12px',
    padding: '12px',
    borderRadius: '14px',
    background: 'rgba(119,93,58,0.14)',
    border: '1px solid rgba(201,181,138,0.18)',
    color: '#d9ccb2',
    fontSize: '13px',
    lineHeight: 1.6,
  },
  primaryButton: {
    marginTop: '14px',
    padding: '12px 16px',
    borderRadius: '14px',
    border: 'none',
    background: '#c9b58a',
    color: '#111',
    fontWeight: 900,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '10px 14px',
    borderRadius: '14px',
    border: '1px solid rgba(245,241,232,0.18)',
    background: 'transparent',
    color: '#f5f1e8',
    fontWeight: 800,
    cursor: 'pointer',
  },
}