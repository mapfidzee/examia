'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'

import {
  SSI_COMMON_SHIFT_BLOCK_OPTIONS,
  SSI_SHIFT_TYPE_OPTIONS,
  buildSSIShiftAssignmentId,
  calculateSSIAssignment,
  calculateSSIAssignmentStrainSnapshot,
  getSSIOperationalDiagnosticFindingsForRole,
} from '@/lib/ssi/ssiContinuityEngine'
import { supabase } from '@/lib/supabase'

type RolePool = 'RN' | 'LPN' | 'CNA'

type ShiftHeader = {
  unit: string
  date: string
  shiftType: string
  shiftBlock: string
}

type RoleRow = {
  id: string
  rolePool: RolePool
  entryNumber: number
  active: boolean
  baselineDesign: string
  startingAssignmentCount: string
  baselineCount: string
  operationalDiagnosticFindings: string[]
}

type FindingCategory =
  | 'Clinical Intensity'
  | 'Monitoring / Supervision'
  | 'Medication / Licensed Workflow'
  | 'Flow / Coordination'
  | 'Staffing / Workforce'
  | 'Environment / Equipment'

const allowedRoles = ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']
const allowedStatuses = ['ACTIVE']

const ACCESS_TIMEOUT_MS = 12000
const SAVE_TIMEOUT_MS = 20000

const ACCESS_FAILURE_MESSAGE =
  'SSI could not verify access. Check the connection and try again.'

const SAVE_FAILURE_MESSAGE =
  'The assignment set could not be saved. No rows were added. Check the connection and try again.'

const roleSections: { rolePool: RolePool; count: number }[] = [
  { rolePool: 'RN', count: 6 },
  { rolePool: 'LPN', count: 6 },
  { rolePool: 'CNA', count: 8 },
]

const findingCategoryOrder: FindingCategory[] = [
  'Clinical Intensity',
  'Monitoring / Supervision',
  'Medication / Licensed Workflow',
  'Flow / Coordination',
  'Staffing / Workforce',
  'Environment / Equipment',
]

const ssiFlow = [
  {
    label: 'Assignments',
    href: '/ssi/assignments',
    note: 'ODM evidence acquisition',
    active: true,
  },
  {
    label: 'Events',
    href: '/ssi/events',
    note: 'Stability event capture',
    active: false,
  },
  {
    label: 'Trend Buffer',
    href: '/ssi/dashboard',
    note: 'Persisted structural signals',
    active: false,
  },
  {
    label: 'Executive Dashboard',
    href: '/ssi',
    note: 'Leadership interpretation',
    active: false,
  },
  {
    label: 'Weekly Brief',
    href: '/ssi/weekly-brief',
    note: 'Printable executive summary',
    active: false,
  },
]

const initialHeader: ShiftHeader = {
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

function makeInitialRows(): RoleRow[] {
  return roleSections.flatMap(({ rolePool, count }) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${rolePool}-${index + 1}`,
      rolePool,
      entryNumber: index + 1,
      active: index === 0,
      baselineDesign: '',
      startingAssignmentCount: '',
      baselineCount: '',
      operationalDiagnosticFindings: [],
    })),
  )
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

function deriveBaselineCount(
  baselineDesign: string,
  manualBaselineCount: string,
) {
  if (manualBaselineCount.trim() !== '') {
    return Number(manualBaselineCount)
  }

  const match = baselineDesign.trim().match(/^1\s*:\s*(\d+)$/)

  if (!match) {
    return Number.NaN
  }

  return Number(match[1])
}

function displayFindingCategory(category: string): FindingCategory {
  if (category === 'Monitoring') return 'Monitoring / Supervision'
  if (category === 'Medication') return 'Medication / Licensed Workflow'
  if (category === 'Flow') return 'Flow / Coordination'
  if (category === 'Staffing') return 'Staffing / Workforce'
  if (category === 'Environment') return 'Environment / Equipment'
  return 'Clinical Intensity'
}

function compactFindingLabel(label: string) {
  return label
    .replace(' care recipient assigned', '')
    .replace(' care recipients assigned', '')
    .replace(' assigned', '')
    .replace(' required', '')
    .replace(' cluster', '')
    .replace('High-acuity', 'High acuity')
    .replace('Complex wound care', 'Complex wound')
    .replace('Medication workload pressure', 'Medication workload')
    .replace('Missed medication risk', 'Missed medication')
    .replace('Admission/discharge pressure', 'Admission/discharge')
    .replace('Memory-care supervision density', 'Memory supervision')
    .replace('Isolation/equipment burden', 'Isolation/equipment')
}

function displayStructuralDiagnosis(value?: string) {
  if (value === 'STABLE_START') return 'Stable Structural Start'
  if (value === 'HIDDEN_STRAIN_PRESENT') return 'Hidden Structural Strain'
  if (value === 'VISIBLE_STARTING_STRAIN') {
    return 'Visible Starting Structural Strain'
  }
  if (value === 'SEVERE_STARTING_STRAIN') {
    return 'Severe Starting Structural Strain'
  }

  return 'Not calculated yet'
}

export default function SSIAssignmentsPage() {
  const router = useRouter()
  const mountedRef = useRef(false)
  const accessAttemptRef = useRef(0)

  const [authorized, setAuthorized] = useState(false)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [accessFailure, setAccessFailure] = useState(false)
  const [redirectingToLogin, setRedirectingToLogin] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const [header, setHeader] = useState<ShiftHeader>(initialHeader)
  const [rows, setRows] = useState<RoleRow[]>(makeInitialRows)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [snapshotOpen, setSnapshotOpen] = useState(true)

  const [expandedSections, setExpandedSections] = useState<
    Record<RolePool, boolean>
  >({
    RN: true,
    LPN: false,
    CNA: false,
  })

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [expandedFindings, setExpandedFindings] = useState<
    Record<string, boolean>
  >({})

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
      const result = await withTimeout(
        supabase.auth.signOut(),
        ACCESS_TIMEOUT_MS,
      )

      if (result.error) {
        console.error('SSI sign-out service error.', result.error)
      }
    } catch (error) {
      console.error('SSI sign-out operation failed.', error)
    } finally {
      // Navigation recovery is handled by the calling operation.
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
      } = await withTimeout(
        supabase.auth.getSession(),
        ACCESS_TIMEOUT_MS,
      )

      if (sessionError) {
        throw sessionError
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
        throw roleError
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
    } catch (error) {
      console.error('SSI assignment access verification failed.', error)

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

  const activeRows = rows.filter((row) => row.active)

  const calculatedRows = useMemo(() => {
    return activeRows.map((row) => {
      const startingCount = Number(row.startingAssignmentCount)
      const baselineCount = deriveBaselineCount(
        row.baselineDesign,
        row.baselineCount,
      )

      const assignmentId = buildSSIShiftAssignmentId(
        header.date,
        header.shiftType,
        row.rolePool,
        row.entryNumber,
      )

      const canCalculate =
        row.baselineDesign.trim() !== '' &&
        row.startingAssignmentCount.trim() !== '' &&
        Number.isFinite(startingCount) &&
        Number.isFinite(baselineCount) &&
        baselineCount > 0

      const output = canCalculate
        ? calculateSSIAssignment({
            assignmentId,
            unit: header.unit,
            rolePool: `${row.rolePool} ${row.entryNumber}`,
            shiftType: header.shiftType,
            shiftBlock: header.shiftBlock,
            date: header.date,
            baselineDesign: row.baselineDesign,
            startingAssignmentCount: startingCount,
            baselineCount,
            operationalDiagnosticFindings:
              row.operationalDiagnosticFindings,
          })
        : null

      return {
        row,
        assignmentId,
        baselineCount,
        canCalculate,
        output,
      }
    })
  }, [activeRows, header])

  const snapshot = useMemo(
    () =>
      calculateSSIAssignmentStrainSnapshot(
        calculatedRows.map((item) => ({
          loadReason: item.output?.derived_load_reason ?? 'NONE',
          loadComplexity:
            item.output?.derived_load_complexity ?? 'NONE',
          operationalDiagnosticFindings:
            item.row.operationalDiagnosticFindings,
          output: item.output,
        })),
      ),
    [calculatedRows],
  )

  function updateHeader(field: keyof ShiftHeader, value: string) {
    setHeader((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateRow(
    id: string,
    field: keyof RoleRow,
    value: string | boolean | string[],
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

  function toggleFinding(row: RoleRow, finding: string) {
    const selected = row.operationalDiagnosticFindings.includes(finding)
      ? row.operationalDiagnosticFindings.filter(
          (item) => item !== finding,
        )
      : [...row.operationalDiagnosticFindings, finding]

    updateRow(row.id, 'operationalDiagnosticFindings', selected)
  }

  function toggleSection(rolePool: RolePool) {
    setExpandedSections((current) => ({
      ...current,
      [rolePool]: !current[rolePool],
    }))
  }

  function toggleRowDetails(id: string) {
    setExpandedRows((current) => ({
      ...current,
      [id]: !current[id],
    }))
  }

  function toggleFindingPanel(id: string) {
    setExpandedFindings((current) => ({
      ...current,
      [id]: !current[id],
    }))
  }

  async function handleLogout() {
    if (loggingOut) {
      return
    }

    setLoggingOut(true)

    try {
      const result = await withTimeout(
        supabase.auth.signOut(),
        ACCESS_TIMEOUT_MS,
      )

      if (result.error) {
        console.error('SSI logout service error.', result.error)
      }
    } catch (error) {
      console.error('SSI logout operation failed.', error)
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
        'SSI could not verify the healthcare organization. Please sign in again.',
      )
      return
    }

    if (
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
        'Enter a valid calendar date in YYYY-MM-DD format, for example 2026-03-06.',
      )
      return
    }

    if (calculatedRows.length === 0) {
      setMessage(
        'Activate and complete at least one role entry before saving.',
      )
      return
    }

    if (
      calculatedRows.some(
        (item) =>
          !item.row.baselineDesign.trim() ||
          !item.canCalculate ||
          !item.output,
      )
    ) {
      setMessage(
        'Every active row needs a Baseline Design, Starting Assignment Count, and a valid derived or manual Baseline Count.',
      )
      return
    }

    setSaving(true)

    try {
      const payload = calculatedRows.map((item) => {
        if (!item.output) {
          throw new Error('SSI_ASSIGNMENT_OUTPUT_UNAVAILABLE')
        }

        
        return {
            
          organization_id: organizationId,
          assignment_id: item.assignmentId,
          unit: header.unit,
          role_pool: `${item.row.rolePool} ${item.row.entryNumber}`,
          shift_type: header.shiftType,
          shift_block: header.shiftBlock,
          assignment_date: header.date,
          baseline_design: item.row.baselineDesign,
          starting_assignment_count: Number(
            item.row.startingAssignmentCount,
          ),
          baseline_count: item.baselineCount,
          load_reason: item.output.derived_load_reason,
          load_complexity: item.output.derived_load_complexity,
          load_modifier: item.output.load_modifier_delta,
          complexity_flag: item.output.complexity_flag === 'YES',
          complexity_status: item.output.complexity_status,
          starting_strain_signal:
            item.output.starting_strain_signal,
          complexity_weight: item.output.complexity_weight,
          operational_diagnostic_findings:
            item.output.operational_diagnostic_findings,
          structural_drivers: item.output.structural_drivers,
          workload_composition: item.output.workload_composition,
          derived_strain_signals: item.output.derived_strain_signals,
          reserve_capacity_status:
            item.output.reserve_capacity_status,
          localized_overload_flag:
            item.output.localized_overload_flag,
          localized_strain_interpretation:
            item.output.localized_strain_interpretation,
          above_baseline_flag: item.output.above_baseline_flag,
          assignment_overload_delta:
            item.output.assignment_overload_delta,
        }
      })

      const { error } = await withTimeout(
        supabase
          .from('ssi_assignment_instances')
          .insert(payload),
        SAVE_TIMEOUT_MS,
      )

      if (error) {
        throw error
      }

      if (!mountedRef.current) {
        return
      }

      setMessage(
        `Saved ${payload.length} active ODM assignment rows for ${header.shiftType}.`,
      )
      setRows(makeInitialRows())
      setExpandedRows({})
      setExpandedFindings({})
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
                TSINAXA SSI • ODM ASSIGNMENT EVIDENCE
              </p>

              <h1 style={styles.title}>
                Operational Diagnostic Assignment Set
              </h1>

              <p style={styles.subtitle}>
                Acquire observable assignment evidence at shift start.
                SSI derives structural diagnosis from the complete
                evidence set while preserving downstream compatibility.
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
              Assignments → Events → Trend Buffer → Executive Dashboard
              → Weekly Brief
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
              Shared Shift Header
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
              helper="Enter manually as YYYY-MM-DD"
              placeholder="2026-03-06"
              value={header.date}
              onChange={(value) =>
                updateHeader('date', value)
              }
            />

            <Select
              label="Shift_Type"
              value={header.shiftType}
              options={SSI_SHIFT_TYPE_OPTIONS}
              onChange={(value) =>
                updateHeader('shiftType', value)
              }
            />

            <Select
              label="Shift_Block"
              value={header.shiftBlock}
              options={SSI_COMMON_SHIFT_BLOCK_OPTIONS}
              onChange={(value) =>
                updateHeader('shiftBlock', value)
              }
            />
          </section>

          <section style={styles.topSnapshot}>
            <div style={styles.stickyTitle}>
              Current Shift Diagnostic Snapshot
            </div>

            <MiniMetric
              label="Active Rows"
              value={String(activeRows.length)}
            />

            <MiniMetric
              label="Operational Load Burden"
              value={String(snapshot.assignment_load_skew)}
            />

            <MiniMetric
              label="Hidden Strain Rows"
              value={String(snapshot.hidden_strain_count)}
            />

            <MiniMetric
              label="Severe Strain Rows"
              value={String(snapshot.severe_strain_count)}
            />
          </section>

          <section style={styles.tablePanel}>
            <h2 style={styles.panelTitle}>
              Role-Pool Sections
            </h2>

            {roleSections.map(({ rolePool, count }) => {
              const sectionRows = rows.filter(
                (row) => row.rolePool === rolePool,
              )

              const sectionActive = sectionRows.filter(
                (row) => row.active,
              ).length

              const expanded = expandedSections[rolePool]

              return (
                <section key={rolePool} style={styles.roleSection}>
                  <button
                    type="button"
                    style={styles.sectionToggle}
                    onClick={() => toggleSection(rolePool)}
                  >
                    {expanded ? 'Hide' : 'Show'} {rolePool} entries •{' '}
                    {sectionActive}/{count} active
                  </button>

                  {expanded
                    ? sectionRows.map((row) => {
                        const item = calculatedRows.find(
                          (calculated) =>
                            calculated.row.id === row.id,
                        )

                        const rowExpanded =
                          expandedRows[row.id] ?? false

                        const findingsOpen =
                          expandedFindings[row.id] ??
                          row.operationalDiagnosticFindings.length === 0

                        const selectedCount =
                          row.operationalDiagnosticFindings.length

                        const availableFindings =
                          getSSIOperationalDiagnosticFindingsForRole(
                            row.rolePool,
                          )

                        const groupedFindings =
                          findingCategoryOrder.map((category) => ({
                            category,
                            findings: availableFindings.filter(
                              (finding) =>
                                displayFindingCategory(
                                  finding.category,
                                ) === category,
                            ),
                          }))

                        return (
                          <div key={row.id} style={styles.rowCard}>
                            <div style={styles.assignmentIdBox}>
                              <span style={styles.roleEntry}>
                                {rolePool} Entry {row.entryNumber}
                              </span>

                              <code
                                style={styles.assignmentIdCode}
                              >
                                {buildSSIShiftAssignmentId(
                                  header.date,
                                  header.shiftType,
                                  rolePool,
                                  row.entryNumber,
                                )}
                              </code>
                            </div>

                            <label style={styles.checkLabel}>
                              <input
                                type="checkbox"
                                checked={row.active}
                                onChange={(event) =>
                                  updateRow(
                                    row.id,
                                    'active',
                                    event.target.checked,
                                  )
                                }
                              />
                              Active row
                            </label>

                            {row.active ? (
                              <>
                                <Input
                                  label="Baseline_Design"
                                  placeholder="1:4"
                                  value={row.baselineDesign}
                                  onChange={(value) =>
                                    updateRow(
                                      row.id,
                                      'baselineDesign',
                                      value,
                                    )
                                  }
                                />

                                <Input
                                  label="Starting_Assignment_Count"
                                  type="number"
                                  value={row.startingAssignmentCount}
                                  onChange={(value) =>
                                    updateRow(
                                      row.id,
                                      'startingAssignmentCount',
                                      value,
                                    )
                                  }
                                />

                                <Input
                                  label="Baseline_Count"
                                  helper="Optional. If blank, derived from Baseline_Design."
                                  type="number"
                                  value={row.baselineCount}
                                  onChange={(value) =>
                                    updateRow(
                                      row.id,
                                      'baselineCount',
                                      value,
                                    )
                                  }
                                />

                                <div style={styles.findingPanel}>
                                  <button
                                    type="button"
                                    style={styles.findingPanelToggle}
                                    onClick={() =>
                                      toggleFindingPanel(row.id)
                                    }
                                  >
                                    <span
                                      style={styles.findingPanelTitle}
                                    >
                                      Operational Diagnostic Findings
                                    </span>

                                    <span style={styles.findingCount}>
                                      {selectedCount === 0
                                        ? 'No evidence selected'
                                        : `${selectedCount} finding${
                                            selectedCount === 1
                                              ? ''
                                              : 's'
                                          } selected`}
                                    </span>

                                    <span
                                      style={
                                        styles.findingPanelAction
                                      }
                                    >
                                      {findingsOpen
                                        ? 'Collapse'
                                        : 'Review / edit'}
                                    </span>
                                  </button>

                                  {selectedCount > 0 ? (
                                    <div style={styles.badgeRow}>
                                      {row.operationalDiagnosticFindings.map(
                                        (finding) => (
                                          <span
                                            key={finding}
                                            style={styles.badge}
                                          >
                                            {compactFindingLabel(
                                              finding,
                                            )}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  ) : (
                                    <p
                                      style={styles.noEvidenceText}
                                    >
                                      Capture observable operational
                                      evidence before saving this
                                      assignment row.
                                    </p>
                                  )}

                                  {findingsOpen ? (
                                    <>
                                      <div
                                        style={
                                          styles.findingInstruction
                                        }
                                      >
                                        <strong>
                                          Select every operational
                                          diagnostic finding truly
                                          present in this assignment.
                                        </strong>

                                        <span>
                                          Capture observable
                                          operational evidence.
                                        </span>

                                        <span>
                                          Do not summarize the
                                          assignment into one reason.
                                        </span>

                                        <span>
                                          SSI derives the structural
                                          diagnosis from the complete
                                          evidence set.
                                        </span>
                                      </div>

                                      <div
                                        style={styles.categoryGrid}
                                      >
                                        {groupedFindings.map(
                                          (group) =>
                                            group.findings.length >
                                            0 ? (
                                              <div
                                                key={group.category}
                                                style={
                                                  styles.findingCategoryBox
                                                }
                                              >
                                                <h3
                                                  style={
                                                    styles.categoryTitle
                                                  }
                                                >
                                                  {group.category}
                                                </h3>

                                                <div
                                                  style={
                                                    styles.findingGrid
                                                  }
                                                >
                                                  {group.findings.map(
                                                    (finding) => (
                                                      <label
                                                        key={
                                                          finding.label
                                                        }
                                                        style={
                                                          styles.findingOption
                                                        }
                                                      >
                                                        <input
                                                          type="checkbox"
                                                          checked={row.operationalDiagnosticFindings.includes(
                                                            finding.label,
                                                          )}
                                                          onChange={() =>
                                                            toggleFinding(
                                                              row,
                                                              finding.label,
                                                            )
                                                          }
                                                        />

                                                        <span>
                                                          {
                                                            finding.label
                                                          }
                                                        </span>
                                                      </label>
                                                    ),
                                                  )}
                                                </div>
                                              </div>
                                            ) : null,
                                        )}
                                      </div>
                                    </>
                                  ) : null}
                                </div>

                                <div
                                  style={styles.primarySignalGrid}
                                >
                                  <ReadOnly
                                    label="Structural Diagnosis"
                                    value={displayStructuralDiagnosis(
                                      item?.output
                                        ?.starting_strain_signal,
                                    )}
                                  />

                                  <ReadOnly
                                    label="Structural Strain Summary"
                                    value={
                                      item?.output
                                        ?.structural_strain_summary ??
                                      'Not calculated yet'
                                    }
                                    wrap
                                  />

                                  <ReadOnly
                                    label="Reserve Capacity"
                                    value={
                                      item?.output
                                        ?.reserve_capacity_interpretation ??
                                      'Not calculated yet'
                                    }
                                    wrap
                                  />

                                  <ReadOnly
                                    label="Localized Strain"
                                    value={
                                      item?.output
                                        ?.localized_strain_interpretation ??
                                      'Not calculated yet'
                                    }
                                    wrap
                                  />
                                </div>

                                <button
                                  type="button"
                                  style={styles.detailToggle}
                                  onClick={() =>
                                    toggleRowDetails(row.id)
                                  }
                                >
                                  {rowExpanded
                                    ? 'Hide compatibility details'
                                    : 'Show compatibility details'}
                                </button>

                                {rowExpanded ? (
                                  <div
                                    style={styles.calculatedGrid}
                                  >
                                    <ReadOnly
                                      label="Derived Legacy Load Reason"
                                      value={
                                        item?.output
                                          ?.derived_load_reason ??
                                        'Not calculated yet'
                                      }
                                      wrap
                                    />

                                    <ReadOnly
                                      label="Derived Legacy Load Complexity"
                                      value={
                                        item?.output
                                          ?.derived_load_complexity ??
                                        'Not calculated yet'
                                      }
                                      wrap
                                    />

                                    <ReadOnly
                                      label="Load Modifier"
                                      value={
                                        item?.output
                                          ?.load_modifier ??
                                        'Not calculated yet'
                                      }
                                    />

                                    <ReadOnly
                                      label="Raw Assignment Count Delta"
                                      value={
                                        item?.output
                                          ? String(
                                              item.output
                                                .load_modifier_delta,
                                            )
                                          : 'Not calculated yet'
                                      }
                                    />

                                    <ReadOnly
                                      label="Complexity Flag"
                                      value={
                                        item?.output
                                          ?.complexity_flag ??
                                        'Not calculated yet'
                                      }
                                    />

                                    <ReadOnly
                                      label="Complexity Status"
                                      value={
                                        item?.output
                                          ?.complexity_status ??
                                        'Not calculated yet'
                                      }
                                    />

                                    <ReadOnly
                                      label="Complexity Weight"
                                      value={
                                        item?.output
                                          ? String(
                                              item.output
                                                .complexity_weight,
                                            )
                                          : 'Not calculated yet'
                                      }
                                    />
                                  </div>
                                ) : null}
                              </>
                            ) : null}
                          </div>
                        )
                      })
                    : null}
                </section>
              )
            })}
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
                : 'Save Active Assignment Rows'}
            </button>

            {message ? (
              <p role="status" aria-live="polite" style={styles.message}>
                {message}
              </p>
            ) : null}
          </div>

          <section style={styles.snapshot}>
            <button
              type="button"
              style={styles.snapshotToggle}
              onClick={() =>
                setSnapshotOpen((current) => !current)
              }
            >
              {snapshotOpen ? 'Hide' : 'Show'} Assignment Diagnostic
              Snapshot
            </button>

            {snapshotOpen ? (
              <div style={styles.snapshotGrid}>
                <ReadOnly
                  label="Operational Load Burden"
                  value={String(
                    snapshot.assignment_load_skew,
                  )}
                />

                <ReadOnly
                  label="Hidden Strain Rows"
                  value={String(snapshot.hidden_strain_count)}
                />

                <ReadOnly
                  label="Visible Strain Rows"
                  value={String(snapshot.visible_strain_count)}
                />

                <ReadOnly
                  label="Severe Strain Rows"
                  value={String(snapshot.severe_strain_count)}
                />

                <ReadOnly
                  label="Most Frequent Operational Finding"
                  value={snapshot.dominant_load_reason}
                  wrap
                />

                <ReadOnly
                  label="Dominant Derived Complexity"
                  value={snapshot.dominant_load_complexity}
                  wrap
                />

                <ReadOnly
                  label="Structural Strain Reading"
                  value={snapshot.structural_strain_reading}
                  wrap
                />

                <ReadOnly
                  label="Snapshot Boundary"
                  value="Current shift set only. Longitudinal trend interpretation belongs to /ssi/dashboard."
                  wrap
                />
              </div>
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
  type = 'text',
  placeholder,
  helper,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  helper?: string
}) {
  return (
    <label style={styles.label}>
      <span>{label}</span>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      />

      {helper ? (
        <small style={styles.helper}>{helper}</small>
      ) : null}
    </label>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  return (
    <label style={styles.label}>
      <span>{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={styles.input}
      >
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
      <span style={styles.readOnlyLabel}>{label}</span>

      <strong
        style={
          wrap
            ? styles.readOnlyValueWrap
            : styles.readOnlyValue
        }
      >
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
    maxWidth: '920px',
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
  topSnapshot: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '10px',
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '18px',
    padding: '12px',
    marginBottom: '18px',
  },
  stickyTitle: {
    gridColumn: '1 / -1',
    color: '#d6b25e',
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontSize: '12px',
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
  roleSection: {
    borderTop: '1px solid rgba(214,178,94,0.18)',
    paddingTop: '14px',
    marginTop: '14px',
  },
  sectionToggle: {
    width: '100%',
    background: '#11100d',
    color: '#d6b25e',
    border: '1px solid rgba(214,178,94,0.22)',
    borderRadius: '12px',
    padding: '12px',
    textAlign: 'left',
    fontWeight: 900,
    cursor: 'pointer',
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
  assignmentIdBox: {
    border: '1px solid rgba(214,178,94,0.22)',
    background: 'rgba(214,178,94,0.08)',
    borderRadius: '14px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0,
  },
  roleEntry: {
    color: '#d6b25e',
    fontWeight: 900,
    fontSize: '16px',
  },
  assignmentIdCode: {
    color: '#cfc7b5',
    fontWeight: 700,
    fontSize: '12px',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    lineHeight: 1.35,
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#cfc7b5',
    fontWeight: 700,
  },
  findingPanel: {
    gridColumn: '1 / -1',
    border: '1px solid rgba(214,178,94,0.18)',
    background: '#0d0c0a',
    borderRadius: '16px',
    padding: '12px',
  },
  findingPanelToggle: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    alignItems: 'center',
    gap: '12px',
    background: '#11100d',
    color: '#fff8e7',
    border: '1px solid rgba(214,178,94,0.18)',
    borderRadius: '14px',
    padding: '12px 14px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  findingPanelTitle: {
    color: '#d6b25e',
    fontWeight: 900,
  },
  findingCount: {
    color: '#cfc7b5',
    fontSize: '12px',
    fontWeight: 800,
    border: '1px solid rgba(214,178,94,0.18)',
    borderRadius: '999px',
    padding: '6px 10px',
  },
  findingPanelAction: {
    color: '#d6b25e',
    fontSize: '12px',
    fontWeight: 900,
  },
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '10px',
  },
  badge: {
    border: '1px solid rgba(214,178,94,0.22)',
    background: 'rgba(214,178,94,0.09)',
    color: '#fff8e7',
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: 800,
  },
  noEvidenceText: {
    color: '#9f8142',
    margin: '10px 0 0',
    fontSize: '13px',
  },
  findingInstruction: {
    marginTop: '12px',
    border: '1px solid rgba(214,178,94,0.18)',
    background: 'rgba(214,178,94,0.06)',
    borderRadius: '14px',
    padding: '12px',
    display: 'grid',
    gap: '4px',
    color: '#cfc7b5',
    fontSize: '13px',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '12px',
  },
  findingCategoryBox: {
    border: '1px solid rgba(214,178,94,0.14)',
    background: '#11100d',
    borderRadius: '14px',
    padding: '12px',
  },
  categoryTitle: {
    color: '#d6b25e',
    margin: '0 0 10px',
    fontSize: '13px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  findingGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '8px',
  },
  findingOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#cfc7b5',
    background: '#0d0c0a',
    border: '1px solid rgba(214,178,94,0.13)',
    borderRadius: '12px',
    padding: '10px 12px',
    fontSize: '13px',
  },
  primarySignalGrid: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
  },
  calculatedGrid: {
    gridColumn: '1 / -1',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '10px',
  },
  detailToggle: {
    gridColumn: '1 / -1',
    background: 'transparent',
    color: '#d6b25e',
    border: '1px solid rgba(214,178,94,0.22)',
    borderRadius: '12px',
    padding: '10px 12px',
    cursor: 'pointer',
    textAlign: 'left',
    fontWeight: 800,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    color: '#cfc7b5',
    fontSize: '13px',
  },
  helper: {
    color: '#9f8142',
    fontSize: '12px',
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
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    minWidth: 0,
  },
  readOnlyLabel: {
    color: '#cfc7b5',
    flexShrink: 0,
  },
  readOnlyValue: {
    color: '#fff8e7',
    textAlign: 'right',
  },
  readOnlyValueWrap: {
    color: '#fff8e7',
    textAlign: 'right',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    lineHeight: 1.45,
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
  snapshot: {
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
    padding: '12px 14px',
    textAlign: 'left',
    fontWeight: 800,
    cursor: 'pointer',
  },
  snapshotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '14px',
  },
}