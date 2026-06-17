'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { logAuditEvent } from '../../../lib/auditLogger'
import { supabase } from '../../../lib/supabase'

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
  const [message, setMessage] = useState('Loading role registry...')
  const [selectedRoleByUser, setSelectedRoleByUser] = useState<
    Record<string, string>
  >({})
  const [selectedScopeByUser, setSelectedScopeByUser] = useState<
    Record<string, string>
  >({})
  const [reasonByUser, setReasonByUser] = useState<Record<string, string>>({})

  useEffect(() => {
    loadRoles()
  }, [])

  const governanceAdmins = useMemo(
    () =>
      roles.filter((item) =>
        ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER'].includes(
          item.role,
        ),
      ).length,
    [roles],
  )

  const scopedUsers = useMemo(
    () => roles.filter((item) => item.governance_scope).length,
    [roles],
  )

  async function loadRoles() {
    setLoading(true)
    setMessage('Loading role registry...')

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

    const roleDefaults: Record<string, string> = {}
    const scopeDefaults: Record<string, string> = {}
    const reasonDefaults: Record<string, string> = {}

    records.forEach((item) => {
      roleDefaults[item.user_id] = item.role
      scopeDefaults[item.user_id] = item.governance_scope || 'GLOBAL'
      reasonDefaults[item.user_id] = ''
    })

    setRoles(records)
    setSelectedRoleByUser(roleDefaults)
    setSelectedScopeByUser(scopeDefaults)
    setReasonByUser(reasonDefaults)
    setMessage('Role governance registry loaded.')
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
    const newScope =
      selectedScopeByUser[target.user_id] ||
      target.governance_scope ||
      'GLOBAL'
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
    setMessage('Saving governed role evidence...')

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
      `Governance role hardened for ${target.email}. Evidence is now executive-reconstructable.`,
    )

    await loadRoles()
    setLoading(false)
  }

  return (
    <main style={styles.page}>
      <section style={styles.container}>
        <header style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • ROLES</p>
            <h1 style={styles.title}>Roles</h1>
            <p style={styles.subtitle}>
              Govern role authorization boundaries without quiet permission
              drift.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>AUTHORIZATION POSTURE</p>
            <p style={styles.statusValue}>CONTROLLED</p>
            <p style={styles.statusMeaning}>
              Every role change requires reason, scope, actor identity, and
              audit evidence.
            </p>
          </div>
        </header>

        <section style={styles.metricsGrid}>
          <Metric label="Governed Users" value={String(roles.length)} />
          <Metric label="Governance Admins" value={String(governanceAdmins)} />
          <Metric label="Scoped Records" value={String(scopedUsers)} />
          <Metric label="Evidence Maturity" value="EXECUTIVE" />
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Role Governance Question</p>
            <h2 style={styles.commandTitle}>
              Who is allowed to govern continuity, and within what boundary?
            </h2>
            <p style={styles.bodyText}>
              Role changes are not quiet permission edits. Each change preserves
              actor identity, target user, previous role, new role, governance
              scope, reason, visibility level, and non-punitive boundary.
            </p>
          </div>

          <div style={styles.warningCard}>
            <p style={styles.sectionKicker}>Boundary</p>
            <h2 style={styles.warningTitle}>Authorize, do not rank.</h2>
            <p style={styles.bodyText}>
              Role governance controls access. It must not become surveillance,
              worker ranking, blame logic, or clinical judgment.
            </p>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <p style={styles.sectionKicker}>Controlled Role Registry</p>
              <h2 style={styles.panelTitle}>Governed authorization records</h2>
            </div>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={loadRoles}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {roles.length === 0 ? (
            <p style={styles.emptyBox}>No governed role records found.</p>
          ) : (
            <div style={styles.roleList}>
              {roles.map((item) => {
                const selectedRole = selectedRoleByUser[item.user_id] || item.role
                const selectedScope =
                  selectedScopeByUser[item.user_id] ||
                  item.governance_scope ||
                  'GLOBAL'

                return (
                  <article key={item.user_id} style={styles.roleCard}>
                    <div style={styles.cardHeader}>
                      <div>
                        <p style={styles.metricLabel}>Governed user</p>
                        <h3 style={styles.cardTitle}>{item.email}</h3>
                        <p style={styles.cardNote}>User ID: {item.user_id}</p>
                      </div>

                      <span style={styles.badge}>
                        {deriveVisibilityLevel(selectedRole, selectedScope)}
                      </span>
                    </div>

                    <div style={styles.detailGrid}>
                      <Detail label="Current Role" value={item.role} />
                      <Detail
                        label="Current Scope"
                        value={item.governance_scope || 'GLOBAL'}
                      />
                      <Detail
                        label="Institution Scope"
                        value={deriveInstitutionScope(selectedScope)}
                      />
                      <Detail
                        label="Evidence Maturity"
                        value="EXECUTIVE_RECONSTRUCTABLE"
                      />
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
                      <strong>Non-punitive boundary:</strong> this change
                      controls governed access. It must not be interpreted as
                      worker ranking, surveillance, blame, or clinical judgment.
                    </div>

                    <button
                      type="button"
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
          )}
        </section>

        <section style={styles.doctrineCard}>
          <strong>ROLE GOVERNANCE DOCTRINE</strong>
          <span>
            Role control is not administration noise. Role changes define who
            can govern continuity visibility, within what scope, and with what
            reconstructable evidence.
          </span>
        </section>
      </section>
    </main>
  )
}

function deriveInstitutionScope(scope: string) {
  if (scope === 'GLOBAL' || scope === 'GLOBAL-TEST') {
    return 'TSINAXA CGI Enterprise Governance'
  }

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
  newScope: string,
): AuditSeverity {
  if (newRole === 'SUPER_ADMIN' || previousRole === 'SUPER_ADMIN') return 'HIGH'
  if (newRole === 'COMMAND_ADMIN' || previousRole === 'COMMAND_ADMIN') {
    return 'HIGH'
  }

  if (newScope === 'GLOBAL' || newScope === 'GLOBAL-TEST') return 'HIGH'

  return 'MODERATE'
}

function Metric({ label, value }: { label: string; value: string }) {
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
  roleList: {
    display: 'grid',
    gap: 12,
  },
  roleCard: {
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
    fontSize: 20,
    lineHeight: 1.1,
    wordBreak: 'break-word',
  },
  cardNote: {
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
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    marginBottom: 10,
  },
  label: {
    display: 'grid',
    gap: 7,
    color: '#cfc7b5',
    fontSize: 12,
    fontWeight: 900,
  },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 12,
    border: `1px solid ${softLine}`,
    background: panelBlack,
    color: '#fff8e7',
    fontSize: 13,
  },
  textarea: {
    width: '100%',
    minHeight: 80,
    padding: 10,
    borderRadius: 12,
    border: `1px solid ${softLine}`,
    background: panelBlack,
    color: '#fff8e7',
    resize: 'vertical',
    fontSize: 13,
  },
  boundaryBox: {
    marginTop: 10,
    padding: 11,
    borderRadius: 13,
    background: 'rgba(214,178,94,0.1)',
    border: `1px solid ${softLine}`,
    color: '#f5f0e6',
    fontSize: 12,
    lineHeight: 1.45,
  },
  primaryButton: {
    marginTop: 12,
    padding: '11px 14px',
    borderRadius: 12,
    border: 'none',
    background: gold,
    color: '#11100d',
    fontWeight: 950,
    cursor: 'pointer',
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