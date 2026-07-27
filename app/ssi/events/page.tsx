'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'

import {
  SSI_COMMON_SHIFT_BLOCK_OPTIONS,
  SSI_SHIFT_TYPE_OPTIONS,
  SSI_TIMING_CATEGORY_OPTIONS,
  buildSSIEventId,
  calculateSSIEvent,
  canCalculateSSIEvent,
} from '@/lib/ssi/ssiContinuityEngine'
import { supabase } from '@/lib/supabase'

type Header = {
  unit: string
  date: string
  shiftType: string
  shiftBlock: string
}

type EventRow = {
  id: string
  active: boolean
  rolePool: string
  timingCategory: string
  eventType: string
  bufferResponse: string
}

const allowedRoles = ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']
const allowedStatuses = ['ACTIVE']

const ACCESS_TIMEOUT_MS = 12000
const SAVE_TIMEOUT_MS = 20000

const ACCESS_FAILURE_MESSAGE =
  'SSI could not verify access. Check the connection and try again.'

const SAVE_FAILURE_MESSAGE =
  'The stability events could not be saved. No rows were added. Check the connection and try again.'

const ssiFlow = [
  {
    label: 'Operational Diagnostic Assignment Set',
    href: '/ssi/assignments',
    note: 'Shift-start structural evidence',
    active: false,
  },
  {
    label: 'Operational Stability Events',
    href: '/ssi/events',
    note: 'Operational disruption evidence',
    active: true,
  },
  {
    label: 'Structural Stability Assessment',
    href: '/ssi/dashboard',
    note: 'Longitudinal structural assessment',
    active: false,
  },
  {
    label: 'Executive Structural Interpretation',
    href: '/ssi',
    note: 'Executive intelligence',
    active: false,
  },
  {
    label: 'Weekly Stability Brief',
    href: '/ssi/weekly-brief',
    note: 'Printable executive summary',
    active: false,
  },
]

const SSI_EVENT_TYPE_OPTIONS = [
  'Late shift cancellation',
  'Short-notice absence',
  'Scheduled shift converted to on-call',
  'On-call activation without use',
  'Delayed arrival',
  'Call-out',
  'No-show',
  'Coverage gap',
  'Unable to secure replacement',
  'Late replacement secured',
  'Mandatory overtime',
  'Agency staffing required',
  'Float staff required',
  'Assignment redistribution',
  'Medication delayed',
  'Medication supply delay',
  'IV therapy delay',
  'Hospice care escalation',
  'Two-person assist required',
  'Admission spike',
  'Discharge pressure',
  'Transfer delay',
  'Late handoff',
  'High-acuity deterioration',
  'Unexpected deterioration',
  'Fall risk escalation',
  'Behavioral escalation',
  'Monitoring burden',
  'Unexpected isolation requirement',
  'Equipment failure',
] as const

const SSI_BUFFER_RESPONSE_OPTIONS = [
  'No response recorded',
  'Peer-to-peer support',
  'Overtime used',
  'Mandatory overtime used',
  'Agency staff deployed',
  'Float staff deployed',
  'Assignment redistribution',
  'Charge nurse coverage',
  'Extra shift creation',
  'Medication pass support',
  'Supervisor support provided',
  'Leadership intervention',
  'Delayed non-urgent tasks',
  'Family communication deferred',
  'Unable to recover coverage',
] as const

const initialHeader: Header = {
  unit: '',
  date: '',
  shiftType: 'DAY',
  shiftBlock: '07:00-19:00',
}

async function withTimeout<T>(
  operation: PromiseLike<T>,
  timeoutMs: number,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('SSI_OPERATION_TIMEOUT'))
    }, timeoutMs)
  })

  try {
    return await Promise.race([Promise.resolve(operation), timeout])
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

function makeRows(): EventRow[] {
  return Array.from({ length: 12 }, (_, index) => ({
    id: `event-${index + 1}`,
    active: false,
    rolePool: '',
    timingCategory: '',
    eventType: '',
    bufferResponse: '',
  }))
}

function isValidCalendarDate(value: string) {
  const normalized = value.trim()
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!match) {
    return false
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1
  ) {
    return false
  }

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate()

  if (day > daysInMonth) {
    return false
  }

  const reconstructed = new Date(Date.UTC(year, month - 1, day))

  return (
    reconstructed.getUTCFullYear() === year &&
    reconstructed.getUTCMonth() === month - 1 &&
    reconstructed.getUTCDate() === day
  )
}

function sequenceLabel(index: number) {
  return String(index + 1).padStart(3, '0')
}

function displayValue(value?: string | null) {
  if (!value) {
    return 'Waiting for event details'
  }

  return value.replaceAll('_', ' ')
}

export default function SSIEventsPage() {
  const router = useRouter()
  const mountedRef = useRef(false)
  const accessAttemptRef = useRef(0)

  const [authorized, setAuthorized] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [accessFailure, setAccessFailure] = useState(false)
  const [redirectingToLogin, setRedirectingToLogin] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [organizationId, setOrganizationId] =
    useState<string | null>(null)

  const [header, setHeader] = useState<Header>(initialHeader)
  const [rows, setRows] = useState<EventRow[]>(makeRows)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [boundaryOpen, setBoundaryOpen] = useState(true)

  useEffect(() => {
    mountedRef.current = true
    void verifyAccess()

    return () => {
      mountedRef.current = false
      accessAttemptRef.current += 1
    }
  }, [])

  async function safeSignOut() {
    try {
      await withTimeout(supabase.auth.signOut(), ACCESS_TIMEOUT_MS)
    } catch {
      // Navigation recovery is handled by the calling operation.
    } finally {
      // Sign-out failure must never leave the interface frozen.
    }
  }

  async function verifyAccess() {
    const attemptId = accessAttemptRef.current + 1
    accessAttemptRef.current = attemptId

    if (!mountedRef.current) {
      return
    }

    setCheckingAccess(true)
    setAccessFailure(false)
    setRedirectingToLogin(false)
    setAuthorized(false)
    setOrganizationId(null)

    try {
      const {
        data: { session },
        error: sessionError,
      } = await withTimeout(supabase.auth.getSession(), ACCESS_TIMEOUT_MS)

      if (sessionError) {
        throw new Error('SSI_AUTH_SERVICE_UNAVAILABLE')
      }

      if (
        !mountedRef.current ||
        accessAttemptRef.current !== attemptId
      ) {
        return
      }

      if (!session?.user) {
        setRedirectingToLogin(true)
        router.replace('/ssi/login')
        router.refresh()
        return
      }

      if (!session.user.email_confirmed_at) {
        await safeSignOut()

        if (
          !mountedRef.current ||
          accessAttemptRef.current !== attemptId
        ) {
          return
        }

        setRedirectingToLogin(true)
        router.replace('/ssi/login')
        router.refresh()
        return
      }

      const { data: roleRecord, error: roleError } = await withTimeout(
        supabase
          .from('user_roles')
          .select('role,status,organization_id')
          .eq('user_id', session.user.id)
          .maybeSingle(),
        ACCESS_TIMEOUT_MS,
      )

      if (roleError) {
        throw new Error('SSI_ROLE_SERVICE_UNAVAILABLE')
      }

      if (
        !mountedRef.current ||
        accessAttemptRef.current !== attemptId
      ) {
        return
      }

      const isAuthorized =
        Boolean(roleRecord) &&
        allowedRoles.includes(roleRecord?.role ?? '') &&
        allowedStatuses.includes(roleRecord?.status ?? '') &&
        Boolean(roleRecord?.organization_id)

      if (!isAuthorized) {
        await safeSignOut()

        if (
          !mountedRef.current ||
          accessAttemptRef.current !== attemptId
        ) {
          return
        }

        setRedirectingToLogin(true)
        router.replace('/ssi/login')
        router.refresh()
        return
      }

      setOrganizationId(roleRecord?.organization_id ?? null)
      setAuthorized(true)
    } catch {
      if (
        mountedRef.current &&
        accessAttemptRef.current === attemptId
      ) {
        setAuthorized(false)
        setAccessFailure(true)
      }
    } finally {
      if (
        mountedRef.current &&
        accessAttemptRef.current === attemptId
      ) {
        setCheckingAccess(false)
      }
    }
  }

  const calculatedRows = useMemo(() => {
    return rows.map((row, index) => {
      const sequenceNumber = index + 1
      const eventId = buildSSIEventId(header.date, sequenceNumber)

      const input = {
        eventId,
        unit: header.unit,
        rolePool: row.rolePool,
        shiftType: header.shiftType,
        shiftBlock: header.shiftBlock,
        date: header.date,
        timingCategory: row.timingCategory,
        eventType: row.eventType,
        bufferResponse: row.bufferResponse,
      }

      const isComplete = row.active && canCalculateSSIEvent(input)
      const output = isComplete ? calculateSSIEvent(input) : null

      return {
        row,
        eventId,
        sequence: sequenceLabel(index),
        isComplete,
        output,
      }
    })
  }, [header, rows])

  const activeRows = calculatedRows.filter((item) => item.row.active)

  const completeRows = calculatedRows.filter(
    (item) => item.isComplete && item.output,
  )

  const snapshot = useMemo(() => {
    return {
      activeEvents: activeRows.length,
      validatedEvents: completeRows.length,
      highIntensity: completeRows.filter(
        (item) => item.output?.event_intensity === 'HIGH',
      ).length,
      bufferResponsesUsed: completeRows.filter((item) =>
        ['HIGH_BUFFER_COST', 'MODERATE_BUFFER_COST'].includes(
          item.output?.buffer_cost_band ?? '',
        ),
      ).length,
    }
  }, [activeRows.length, completeRows])

  function updateHeader(field: keyof Header, value: string) {
    setHeader((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateRow(
    id: string,
    field: keyof EventRow,
    value: string | boolean,
  ) {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    )
  }

  async function handleLogout() {
    if (loggingOut) {
      return
    }

    setLoggingOut(true)

    try {
      await withTimeout(supabase.auth.signOut(), ACCESS_TIMEOUT_MS)
    } catch {
      // Logout must still return to the login page.
    } finally {
      router.replace('/ssi/login')
      router.refresh()

      if (mountedRef.current) {
        setLoggingOut(false)
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (saving) {
      return
    }

    setMessage('')


    if (!organizationId) {
      setMessage(
        'SSI could not identify the healthcare organization. Return to login and try       again.',
      )
       return
    }

    if  (
      !header.unit.trim() ||
      !header.date.trim() ||
      !header.shiftType ||
      !header.shiftBlock
    ) {
      setMessage(
        'Complete the Unit, Date, Shift Type, and Shift Block before saving.',
      )
      return
    }

    if (!isValidCalendarDate(header.date)) {
      setMessage(
        'Enter a valid calendar date in YYYY-MM-DD format, for example 2026-04-06.',
      )
      return
    }

    if (!activeRows.length) {
      setMessage(
        'No event rows are active. This shift may have zero recorded stability events.',
      )
      return
    }

    if (activeRows.some((item) => !item.isComplete || !item.output)) {
      setMessage(
        'Each active event needs Role Pool, Timing Category, and Event Type. Buffer Response is optional.',
      )
      return
    }

    setSaving(true)

    try {
      const payload = completeRows.map((item) => {
        if (!item.output) {
          throw new Error('SSI_EVENT_OUTPUT_UNAVAILABLE')
        }

        return {
          organization_id: organizationId,
          event_id: item.eventId,
          unit: header.unit,
          role_pool: item.row.rolePool,
          shift_type: header.shiftType,
          shift_block: header.shiftBlock,
          event_date: header.date,
          timing_category: item.row.timingCategory,
          event_type: item.row.eventType,
          buffer_response: item.row.bufferResponse,
          stability_force: item.output.stability_force,
          event_intensity: item.output.event_intensity,
          coverage_impact: item.output.coverage_impact,
          buffer_cost_band: item.output.buffer_cost_band,
          buffer_response_definition:
            item.output.buffer_response_definition,
        }
      })

      const { error } = await withTimeout(
        supabase.from('ssi_stability_events').insert(payload),
        SAVE_TIMEOUT_MS,
      )

      if (error) {
        throw new Error('SSI_EVENT_SAVE_FAILED')
      }

      if (!mountedRef.current) {
        return
      }

      setMessage(
        `Saved ${payload.length} operational stability event row(s).`,
      )
      setRows(makeRows())
    } catch {
      if (mountedRef.current) {
        setMessage(SAVE_FAILURE_MESSAGE)
      }
    } finally {
      if (mountedRef.current) {
        setSaving(false)
      }
    }
  }

  if (checkingAccess) {
    return (
      <main style={styles.page}>
        <section style={styles.shell}>
          <div style={styles.header}>
            <p style={styles.eyebrow}>
              TSINAXA SSI • SECURE ACCESS
            </p>

            <h1 style={styles.title}>Verifying SSI Access</h1>

            <p style={styles.subtitle}>
              Checking authorized structural stability access...
            </p>
          </div>
        </section>
      </main>
    )
  }

  if (accessFailure) {
    return (
      <main style={styles.page}>
        <section style={styles.shell}>
          <div style={styles.header}>
            <p style={styles.eyebrow}>
              TSINAXA SSI • SECURE ACCESS
            </p>

            <h1 style={styles.title}>SSI Access Unavailable</h1>

            <p style={styles.subtitle}>{ACCESS_FAILURE_MESSAGE}</p>

            <div style={styles.accessActions}>
              <button
                type="button"
                onClick={() => void verifyAccess()}
                style={styles.button}
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={() => {
                  router.replace('/ssi/login')
                  router.refresh()
                }}
                style={styles.secondaryButton}
              >
                Return to Login
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (redirectingToLogin || !authorized) {
    return (
      <main style={styles.page}>
        <section style={styles.shell}>
          <div style={styles.header}>
            <p style={styles.eyebrow}>
              TSINAXA SSI • SECURE ACCESS
            </p>

            <h1 style={styles.title}>Opening SSI Login</h1>

            <p style={styles.subtitle}>
              Returning to the secure SSI login page...
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div>
              <p style={styles.eyebrow}>
                TSINAXA SSI • OPERATIONAL STABILITY EVIDENCE
              </p>

              <h1 style={styles.title}>
                Operational Stability Events
              </h1>

              <p style={styles.subtitle}>
                Record observable operational facts that occurred
                before or during the shift. One row equals one
                disruption, staffing adaptation, recovery action, or
                buffer response.
              </p>
            </div>

            <button
              type="button"
              style={{
                ...styles.logoutButton,
                ...(loggingOut ? styles.buttonDisabled : {}),
              }}
              onClick={() => void handleLogout()}
              disabled={loggingOut}
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>

        <nav
          aria-label="TSINAXA SSI flow navigation"
          style={styles.flowNav}
        >
          <div style={styles.flowNavHeader}>
            <span style={styles.flowNavTitle}>SSI Flow</span>
            <span style={styles.flowNavRule} />
            <span style={styles.flowNavCaption}>
              Operational Diagnostic Assignment Set → Operational Stability Events → Structural Stability Assessment → Executive Structural Interpretation → Weekly Stability Brief
            </span>
          </div>

          <div style={styles.flowSteps}>
            {ssiFlow.map((item, index) => (
              <div key={item.href} style={styles.flowStepWrap}>
                <a
                  href={item.href}
                  style={{
                    ...styles.flowStep,
                    ...(item.active
                      ? styles.flowStepActive
                      : {}),
                  }}
                >
                  <span style={styles.flowStepIndex}>
                    {index + 1}
                  </span>

                  <span style={styles.flowStepText}>
                    <strong>{item.label}</strong>
                    <small>{item.note}</small>
                  </span>
                </a>

                {index < ssiFlow.length - 1 ? (
                  <span style={styles.flowArrow}>→</span>
                ) : null}
              </div>
            ))}
          </div>
        </nav>

        <form onSubmit={handleSubmit}>
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>
              Shared Event Header
            </h2>

            <Input
              label="Unit"
              value={header.unit}
              onChange={(value) =>
                updateHeader('unit', value)
              }
            />

            <Input
              label="Date"
              placeholder="2026-04-06"
              value={header.date}
              onChange={(value) =>
                updateHeader('date', value)
              }
            />

            <Select
              label="Shift Type"
              value={header.shiftType}
              options={SSI_SHIFT_TYPE_OPTIONS}
              onChange={(value) =>
                updateHeader('shiftType', value)
              }
            />

            <Select
              label="Shift Block"
              value={header.shiftBlock}
              options={SSI_COMMON_SHIFT_BLOCK_OPTIONS}
              onChange={(value) =>
                updateHeader('shiftBlock', value)
              }
            />
          </section>

          <section style={styles.snapshot}>
            <MiniMetric
              label="Active Events"
              value={String(snapshot.activeEvents)}
            />

            <MiniMetric
              label="Validated Events"
              value={String(snapshot.validatedEvents)}
            />

            <MiniMetric
              label="High Intensity Events"
              value={String(snapshot.highIntensity)}
            />

            <MiniMetric
              label="Buffer Responses Used"
              value={String(snapshot.bufferResponsesUsed)}
            />
          </section>

          <section style={styles.tablePanel}>
            <h2 style={styles.panelTitle}>
              Operational Event Rows
            </h2>

            {calculatedRows.map((item) => (
              <div key={item.row.id} style={styles.rowCard}>
                <div style={styles.idBox}>
                  <strong>Event Row {item.sequence}</strong>
                  <code>{item.eventId}</code>
                </div>

                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={item.row.active}
                    onChange={(event) =>
                      updateRow(
                        item.row.id,
                        'active',
                        event.target.checked,
                      )
                    }
                  />

                  Active event row
                </label>

                {item.row.active ? (
                  <>
                    <Input
                      label="Role Pool"
                      placeholder="RN 1"
                      value={item.row.rolePool}
                      onChange={(value) =>
                        updateRow(
                          item.row.id,
                          'rolePool',
                          value,
                        )
                      }
                    />

                    <Select
                      label="Timing Category"
                      value={item.row.timingCategory}
                      options={SSI_TIMING_CATEGORY_OPTIONS}
                      onChange={(value) =>
                        updateRow(
                          item.row.id,
                          'timingCategory',
                          value,
                        )
                      }
                    />

                    <Select
                      label="Event Type"
                      value={item.row.eventType}
                      options={SSI_EVENT_TYPE_OPTIONS}
                      onChange={(value) =>
                        updateRow(
                          item.row.id,
                          'eventType',
                          value,
                        )
                      }
                    />

                    <Select
                      label="Buffer Response"
                      value={item.row.bufferResponse}
                      options={SSI_BUFFER_RESPONSE_OPTIONS}
                      optionalLabel="No response recorded"
                      onChange={(value) =>
                        updateRow(
                          item.row.id,
                          'bufferResponse',
                          value,
                        )
                      }
                    />

                    <div style={styles.calculatedGrid}>
                      <ReadOnly
                        label="Stability Force"
                        value={displayValue(
                          item.output?.stability_force,
                        )}
                      />

                      <ReadOnly
                        label="Event Intensity"
                        value={displayValue(
                          item.output?.event_intensity,
                        )}
                      />

                      <ReadOnly
                        label="Coverage Impact"
                        value={displayValue(
                          item.output?.coverage_impact,
                        )}
                      />

                      <ReadOnly
                        label="Buffer Cost Band"
                        value={displayValue(
                          item.output?.buffer_cost_band,
                        )}
                      />

                      <ReadOnly
                        label="Buffer Response Meaning"
                        value={
                          item.output
                            ?.buffer_response_definition ??
                          'Waiting for event details'
                        }
                        wrap
                      />
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </section>

          <div style={styles.actions}>
            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.button,
                ...(saving ? styles.buttonDisabled : {}),
              }}
            >
              {saving
                ? 'Saving...'
                : 'Save Stability Events'}
            </button>

            {message ? (
              <p
                role="status"
                aria-live="polite"
                style={styles.message}
              >
                {message}
              </p>
            ) : null}
          </div>

          <section style={styles.footerPanel}>
            <button
              type="button"
              style={styles.snapshotToggle}
              onClick={() =>
                setBoundaryOpen((value) => !value)
              }
            >
              {boundaryOpen ? 'Hide' : 'Show'} Event Doctrine Boundary
            </button>

            {boundaryOpen ? (
              <p style={styles.footerText}>
                Operational Diagnostic Assignment Sets describe the structural starting condition before work begins. Operational Stability Events record observable operational facts before or during the shift. Structural Stability Assessment aggregates repeated evidence. Executive Structural Interpretation transforms that evidence into executive intelligence.
              </p>
            ) : null}
          </section>
        </form>
      </section>
    </main>
  )
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label style={styles.label}>
      <span>{label}</span>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      />
    </label>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
  optionalLabel = 'Select...',
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  optionalLabel?: string
}) {
  return (
    <label style={styles.label}>
      <span>{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      >
        <option value="">{optionalLabel}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ReadOnly({
  label,
  value,
  wrap = false,
}: {
  label: string
  value: string
  wrap?: boolean
}) {
  return (
    <div style={styles.readOnlyBox}>
      <span>{label}</span>

      <strong style={wrap ? styles.wrap : undefined}>
        {value}
      </strong>
    </div>
  )
}

function MiniMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div style={styles.miniMetric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#050505',
    color: '#fff8e7',
    padding: '40px',
  },
  shell: {
    maxWidth: '1280px',
    margin: '0 auto',
  },
  header: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '24px',
    padding: '28px',
    marginBottom: '16px',
  },
  headerTop: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '24px',
    alignItems: 'start',
  },
  logoutButton: {
    border: '1px solid rgba(214,178,94,0.42)',
    background: '#11100d',
    color: '#d6b25e',
    borderRadius: '999px',
    padding: '10px 18px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  eyebrow: {
    color: '#d6b25e',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: '12px',
    margin: 0,
  },
  title: {
    fontSize: '38px',
    margin: '12px 0',
  },
  subtitle: {
    color: '#cfc7b5',
    margin: 0,
    maxWidth: '900px',
  },
  accessActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '22px',
  },
  secondaryButton: {
    background: '#11100d',
    color: '#d6b25e',
    border: '1px solid rgba(214,178,94,0.42)',
    borderRadius: '14px',
    padding: '13px 18px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  flowNav: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '20px',
    padding: '16px',
    marginBottom: '18px',
  },
  flowNavHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  flowNavTitle: {
    color: '#d6b25e',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: '12px',
  },
  flowNavRule: {
    height: '1px',
    flex: 1,
    background: 'rgba(214,178,94,0.22)',
  },
  flowNavCaption: {
    color: '#cfc7b5',
    fontSize: '12px',
    fontWeight: 700,
  },
  flowSteps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '10px',
  },
  flowStepWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  },
  flowStep: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: '#cfc7b5',
    border: '1px solid rgba(214,178,94,0.18)',
    background: '#11100d',
    borderRadius: '14px',
    padding: '12px',
    minWidth: 0,
  },
  flowStepActive: {
    border: '1px solid rgba(214,178,94,0.58)',
    background: 'rgba(214,178,94,0.14)',
    color: '#fff8e7',
    boxShadow: 'inset 3px 0 0 #d6b25e',
  },
  flowStepIndex: {
    display: 'grid',
    placeItems: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '999px',
    background: 'rgba(214,178,94,0.16)',
    color: '#d6b25e',
    fontWeight: 900,
    flexShrink: 0,
  },
  flowStepText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    minWidth: 0,
  },
  flowArrow: {
    color: '#9f8142',
    fontWeight: 900,
    flexShrink: 0,
  },
  panel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '22px',
    padding: '22px',
    marginBottom: '18px',
  },
  snapshot: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '10px',
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '18px',
    padding: '12px',
    marginBottom: '18px',
  },
  miniMetric: {
    background: '#11100d',
    border: '1px solid rgba(214,178,94,0.18)',
    borderRadius: '12px',
    padding: '10px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    color: '#cfc7b5',
    gap: '12px',
  },
  tablePanel: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '22px',
    padding: '22px',
    marginBottom: '18px',
  },
  panelTitle: {
    gridColumn: '1 / -1',
    color: '#d6b25e',
    margin: '0 0 8px',
  },
  rowCard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    border: '1px solid rgba(214,178,94,0.16)',
    borderRadius: '16px',
    padding: '14px',
    marginTop: '12px',
  },
  idBox: {
    border: '1px solid rgba(214,178,94,0.22)',
    background: 'rgba(214,178,94,0.08)',
    borderRadius: '14px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    color: '#d6b25e',
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#cfc7b5',
    fontWeight: 700,
  },
  calculatedGrid: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    color: '#cfc7b5',
    fontSize: '13px',
  },
  input: {
    background: '#11100d',
    border: '1px solid rgba(214,178,94,0.28)',
    borderRadius: '14px',
    color: '#fff8e7',
    padding: '12px 14px',
    outline: 'none',
  },
  readOnlyBox: {
    border: '1px solid rgba(214,178,94,0.18)',
    background: '#11100d',
    borderRadius: '14px',
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  wrap: {
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    textAlign: 'right',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '18px',
  },
  button: {
    background: '#d6b25e',
    color: '#050505',
    border: 'none',
    borderRadius: '14px',
    padding: '13px 18px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  buttonDisabled: {
    opacity: 0.58,
    cursor: 'not-allowed',
  },
  message: {
    color: '#cfc7b5',
    margin: 0,
  },
  footerPanel: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '22px',
    padding: '18px',
  },
  snapshotToggle: {
    width: '100%',
    background: '#11100d',
    color: '#d6b25e',
    border: '1px solid rgba(214,178,94,0.28)',
    borderRadius: '14px',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 800,
    cursor: 'pointer',
  },
  footerText: {
    color: '#cfc7b5',
    lineHeight: 1.6,
  },
}