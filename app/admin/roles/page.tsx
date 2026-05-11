'use client'

import { useEffect, useMemo, useState } from 'react'
import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import { supabase } from '../../../lib/supabase'
import { logAuditEvent } from '../../../lib/auditLogger'

type UserRole = {
  id?: string
  user_id: string
  email: string
  role: string
  status: string
  governance_scope: string | null
  created_at?: string
  updated_at?: string
}

const ROLE_OPTIONS = [
  'SUPER_ADMIN',
  'COMMAND_ADMIN',
  'GOVERNANCE_OFFICER',
  'INSTITUTION_COORDINATOR',
  'RESPONDER',
  'VIEWER',
]

const STATUS_OPTIONS = ['ACTIVE', 'RESTRICTED', 'SUSPENDED', 'REMOVED']

export default function AdminRolesPage() {
  return (
    <GovernanceRouteGuard allowedRoles={['SUPER_ADMIN']}>
      <AdminRolesContent />
    </GovernanceRouteGuard>
  )
}

function AdminRolesContent() {
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const [newUserId, setNewUserId] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('VIEWER')
  const [newStatus, setNewStatus] = useState('ACTIVE')
  const [newScope, setNewScope] = useState('GLOBAL')

  useEffect(() => {
    loadRoles()
  }, [])

  const activeCount = useMemo(
    () => roles.filter((item) => item.status === 'ACTIVE').length,
    [roles]
  )

  const restrictedCount = useMemo(
    () => roles.filter((item) => item.status === 'RESTRICTED').length,
    [roles]
  )

  const suspendedCount = useMemo(
    () => roles.filter((item) => item.status === 'SUSPENDED').length,
    [roles]
  )

  async function getAuditActor() {
    const { data } = await supabase.auth.getUser()
    const user = data.user

    return {
      userId: user?.id ?? null,
      email: user?.email ?? null,
      role: 'SUPER_ADMIN',
    }
  }

  async function loadRoles() {
    setLoading(true)
    setMessage('Loading governance access roles...')

    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setMessage('Could not load governance roles.')
      setLoading(false)
      return
    }

    setRoles(data || [])
    setMessage('')
    setLoading(false)
  }

  async function createRole() {
    if (!newUserId.trim() || !newEmail.trim()) {
      alert('User ID and email are required.')
      return
    }

    setSavingKey('create')
    setMessage('Creating governance role...')

    const createdRole = {
      user_id: newUserId.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: newStatus,
      governance_scope: newScope.trim() || 'GLOBAL',
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('user_roles').insert(createdRole)

    if (error) {
      console.error(error)
      alert(error.message)
      setSavingKey(null)
      setMessage('')
      return
    }

    const actor = await getAuditActor()

    await logAuditEvent({
      userId: actor.userId,
      email: actor.email,
      role: actor.role,
      actionType: 'CREATE_GOVERNANCE_ROLE',
      route: '/admin/roles',
      recordType: 'user_roles',
      recordId: createdRole.user_id,
      summary: `Created governance role ${createdRole.role} with status ${createdRole.status} for ${createdRole.email}.`,
      severity: createdRole.role === 'SUPER_ADMIN' ? 'HIGH' : 'MODERATE',
    })

    setNewUserId('')
    setNewEmail('')
    setNewRole('VIEWER')
    setNewStatus('ACTIVE')
    setNewScope('GLOBAL')
    setSavingKey(null)
    setMessage('Governance role created.')
    await loadRoles()
  }

  async function updateRole(item: UserRole, field: keyof UserRole, value: string) {
    const key = `${item.user_id}-${field}`
    setSavingKey(key)
    setMessage('Updating governance access...')

    const { error } = await supabase
      .from('user_roles')
      .update({
        [field]: value,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', item.user_id)

    if (error) {
      console.error(error)
      alert(error.message)
      setSavingKey(null)
      setMessage('')
      return
    }

    const actor = await getAuditActor()

    await logAuditEvent({
      userId: actor.userId,
      email: actor.email,
      role: actor.role,
      actionType: 'UPDATE_GOVERNANCE_ROLE',
      route: '/admin/roles',
      recordType: 'user_roles',
      recordId: item.user_id,
      summary: `Updated governance role record for ${item.email}. Field changed: ${field}. New value: ${value}.`,
      severity:
        field === 'role' || field === 'status'
          ? 'HIGH'
          : 'MODERATE',
    })

    setSavingKey(null)
    setMessage('Governance access updated.')
    await loadRoles()
  }

  return (
    <main className="rolesPage">
      <div className="pageShell">
        <header className="hero">
          <p className="eyebrow">EXAMIA PERMISSION INFRASTRUCTURE</p>
          <h1>Role Management</h1>
          <p>
            Control who can access protected EXAMIA governance, command, audit,
            responder governance, and assignment surfaces. This page replaces
            fragile manual SQL access management with governed permission control.
          </p>
        </header>

        <section className="metricsGrid">
          <Metric label="Total Role Records" value={roles.length} />
          <Metric label="Active" value={activeCount} />
          <Metric label="Restricted" value={restrictedCount} />
          <Metric label="Suspended" value={suspendedCount} />
        </section>

        {message && <p className="message">{message}</p>}

        <section className="panel">
          <div className="sectionHeader">
            <p className="sectionKicker">Create access</p>
            <h2>Add Governance Role</h2>
            <p>
              Use the Supabase Auth user ID and email for the person who needs
              controlled EXAMIA access.
            </p>
          </div>

          <div className="formGrid">
            <label>
              User ID
              <input
                value={newUserId}
                onChange={(event) => setNewUserId(event.target.value)}
                placeholder="Supabase auth user_id"
              />
            </label>

            <label>
              Email
              <input
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                placeholder="person@example.com"
              />
            </label>

            <label>
              Role
              <select value={newRole} onChange={(event) => setNewRole(event.target.value)}>
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select value={newStatus} onChange={(event) => setNewStatus(event.target.value)}>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Governance Scope
              <input
                value={newScope}
                onChange={(event) => setNewScope(event.target.value)}
                placeholder="GLOBAL, FACILITY, DISTRICT, etc."
              />
            </label>

            <button onClick={createRole} disabled={savingKey === 'create'}>
              {savingKey === 'create' ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="sectionHeader">
            <p className="sectionKicker">Manage access</p>
            <h2>Existing Governance Roles</h2>
            <p>
              Change role, status, or governance scope without opening Supabase SQL.
            </p>
          </div>

          {loading ? (
            <p className="emptyBox">Loading roles...</p>
          ) : roles.length === 0 ? (
            <p className="emptyBox">No governance roles found.</p>
          ) : (
            <div className="roleList">
              {roles.map((item) => (
                <article className="roleCard" key={item.user_id}>
                  <div className="roleTop">
                    <div>
                      <p className="miniLabel">Governance user</p>
                      <h3>{item.email || 'No email recorded'}</h3>
                      <p className="muted">User ID: {item.user_id}</p>
                    </div>

                    <span className={`statusBadge status-${item.status}`}>
                      {item.status}
                    </span>
                  </div>

                  <div className="editGrid">
                    <label>
                      Role
                      <select
                        value={item.role}
                        onChange={(event) => updateRole(item, 'role', event.target.value)}
                        disabled={savingKey === `${item.user_id}-role`}
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Status
                      <select
                        value={item.status}
                        onChange={(event) => updateRole(item, 'status', event.target.value)}
                        disabled={savingKey === `${item.user_id}-status`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Governance Scope
                      <input
                        value={item.governance_scope || ''}
                        onChange={(event) =>
                          setRoles((current) =>
                            current.map((roleItem) =>
                              roleItem.user_id === item.user_id
                                ? { ...roleItem, governance_scope: event.target.value }
                                : roleItem
                            )
                          )
                        }
                        onBlur={(event) =>
                          updateRole(item, 'governance_scope', event.target.value || 'GLOBAL')
                        }
                      />
                    </label>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .rolesPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.3), transparent 30%),
            radial-gradient(circle at top right, rgba(20, 184, 166, 0.2), transparent 28%),
            linear-gradient(180deg, #020617 0%, #07111f 55%, #020617 100%);
          color: white;
          padding: 60px 18px 120px;
        }

        .pageShell {
          max-width: 1180px;
          margin: 0 auto;
        }

        .hero {
          margin-bottom: 24px;
        }

        .eyebrow,
        .sectionKicker,
        .miniLabel {
          margin: 0 0 8px;
          color: #93c5fd;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(42px, 9vw, 72px);
          line-height: 0.92;
          letter-spacing: -0.06em;
        }

        h2 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -0.04em;
        }

        h3 {
          margin: 0;
          font-size: 24px;
          letter-spacing: -0.03em;
        }

        .hero p:last-child,
        .sectionHeader p {
          max-width: 860px;
          color: #dbeafe;
          font-size: 16px;
          line-height: 1.65;
          margin-top: 14px;
        }

        .metricsGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }

        .metricCard,
        .panel,
        .roleCard {
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 26px;
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
        }

        .metricCard {
          padding: 18px;
        }

        .metricCard p {
          margin: 0;
          color: #bfdbfe;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .metricCard strong {
          display: block;
          margin-top: 8px;
          font-size: 42px;
          line-height: 1;
        }

        .message {
          background: rgba(37, 99, 235, 0.18);
          color: #dbeafe;
          padding: 14px;
          border-radius: 18px;
          border: 1px solid rgba(147, 197, 253, 0.28);
          margin-bottom: 18px;
        }

        .panel {
          padding: 20px;
          margin-bottom: 20px;
        }

        .sectionHeader {
          margin-bottom: 18px;
        }

        .formGrid,
        .editGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        label {
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 900;
        }

        input,
        select {
          width: 100%;
          box-sizing: border-box;
          margin-top: 8px;
          border: none;
          border-radius: 14px;
          padding: 14px;
          font-size: 15px;
          color: #0f172a;
          background: white;
        }

        button {
          border: none;
          border-radius: 14px;
          padding: 15px 16px;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          background: #67e8f9;
          color: #082f49;
          min-height: 52px;
          align-self: end;
        }

        button:disabled,
        select:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .roleList {
          display: grid;
          gap: 14px;
        }

        .roleCard {
          padding: 18px;
        }

        .roleTop {
          display: grid;
          gap: 12px;
          padding-bottom: 14px;
          margin-bottom: 14px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        }

        .muted {
          margin: 8px 0 0;
          color: #bfdbfe;
          word-break: break-word;
        }

        .statusBadge {
          width: fit-content;
          border-radius: 999px;
          padding: 8px 13px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          font-size: 12px;
          font-weight: 900;
        }

        .status-ACTIVE {
          background: #22c55e;
          color: #052e16;
        }

        .status-RESTRICTED {
          background: #f59e0b;
          color: #111827;
        }

        .status-SUSPENDED {
          background: #ef4444;
          color: #ffffff;
        }

        .status-REMOVED {
          background: #111827;
          color: #ffffff;
        }

        .emptyBox {
          color: #e2e8f0;
          background: rgba(2, 6, 23, 0.65);
          padding: 17px;
          border-radius: 18px;
          border: 1px dashed rgba(148, 163, 184, 0.34);
          margin: 0;
        }

        @media (min-width: 760px) {
          .rolesPage {
            padding: 80px 36px 140px;
          }

          .metricsGrid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .formGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .editGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .roleTop {
            grid-template-columns: 1fr auto;
            align-items: start;
          }
        }
      `}</style>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="metricCard">
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}