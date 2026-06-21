'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'

import {
  SSI_COMMON_SHIFT_BLOCK_OPTIONS,
  SSI_LOAD_COMPLEXITY_OPTIONS,
  SSI_LOAD_REASON_OPTIONS,
  SSI_SHIFT_TYPE_OPTIONS,
  buildSSIShiftAssignmentId,
  calculateSSIAssignment,
  calculateSSIAssignmentStrainSnapshot,
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
  loadReason: string
  loadComplexity: string
}

const allowedRoles = ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']
const allowedStatuses = ['ACTIVE']

const roleSections: { rolePool: RolePool; count: number }[] = [
  { rolePool: 'RN', count: 6 },
  { rolePool: 'LPN', count: 6 },
  { rolePool: 'CNA', count: 8 },
]

const ssiFlow = [
  { label: 'Assignments', href: '/ssi/assignments', note: 'Shift-start load capture', active: true },
  { label: 'Events', href: '/ssi/events', note: 'Stability event capture', active: false },
  { label: 'Trend Buffer', href: '/ssi/dashboard', note: 'Persisted structural signals', active: false },
  { label: 'Executive Dashboard', href: '/ssi', note: 'Leadership interpretation', active: false },
  { label: 'Weekly Brief', href: '/ssi/weekly-brief', note: 'Printable executive summary', active: false },
]

const initialHeader: ShiftHeader = {
  unit: '',
  date: '',
  shiftType: 'DAY',
  shiftBlock: '07:00-19:00',
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
      loadReason: 'NONE',
      loadComplexity: 'NONE',
    })),
  )
}

function isValidDateText(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
}

function deriveBaselineCount(baselineDesign: string, manualBaselineCount: string) {
  if (manualBaselineCount.trim() !== '') return Number(manualBaselineCount)

  const match = baselineDesign.trim().match(/^1\s*:\s*(\d+)$/)
  if (!match) return Number.NaN

  return Number(match[1])
}

export default function SSIAssignmentsPage() {
  const router = useRouter()

  const [authorized, setAuthorized] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [header, setHeader] = useState<ShiftHeader>(initialHeader)
  const [rows, setRows] = useState<RoleRow[]>(makeInitialRows)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [snapshotOpen, setSnapshotOpen] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<RolePool, boolean>>({
    RN: true,
    LPN: false,
    CNA: false,
  })
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function verifyAccess() {
      setCheckingAccess(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        router.replace('/ssi/login')
        return
      }

      if (!session.user.email_confirmed_at) {
        await supabase.auth.signOut()
        router.replace('/ssi/login')
        return
      }

      const { data: roleRecord, error: roleError } = await supabase
        .from('user_roles')
        .select('role,status')
        .eq('user_id', session.user.id)
        .single()

      if (
        roleError ||
        !roleRecord ||
        !allowedRoles.includes(roleRecord.role) ||
        !allowedStatuses.includes(roleRecord.status)
      ) {
        await supabase.auth.signOut()
        router.replace('/ssi/login')
        return
      }

      setAuthorized(true)
      setCheckingAccess(false)
    }

    verifyAccess()
  }, [router])

  const activeRows = rows.filter((row) => row.active)

  const calculatedRows = useMemo(() => {
    return activeRows.map((row) => {
      const startingCount = Number(row.startingAssignmentCount)
      const baselineCount = deriveBaselineCount(row.baselineDesign, row.baselineCount)
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
            loadReason: row.loadReason,
            loadComplexity: row.loadComplexity,
          })
        : null

      return { row, assignmentId, baselineCount, canCalculate, output }
    })
  }, [activeRows, header])

  const snapshot = useMemo(
    () =>
      calculateSSIAssignmentStrainSnapshot(
        calculatedRows.map((item) => ({
          loadReason: item.row.loadReason,
          loadComplexity: item.row.loadComplexity,
          output: item.output,
        })),
      ),
    [calculatedRows],
  )

  function updateHeader(field: keyof ShiftHeader, value: string) {
    setHeader((current) => ({ ...current, [field]: value }))
  }

  function updateRow(id: string, field: keyof RoleRow, value: string | boolean) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    )
  }

  function toggleSection(rolePool: RolePool) {
    setExpandedSections((current) => ({ ...current, [rolePool]: !current[rolePool] }))
  }

  function toggleRowDetails(id: string) {
    setExpandedRows((current) => ({ ...current, [id]: !current[id] }))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/ssi/login')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!header.unit || !header.date || !header.shiftType || !header.shiftBlock) {
      setMessage('Complete Unit, Date, Shift_Type, and Shift_Block.')
      return
    }

    if (!isValidDateText(header.date)) {
      setMessage('Date must be entered as YYYY-MM-DD, for example 2026-03-06.')
      return
    }

    if (calculatedRows.length === 0) {
      setMessage('Activate and complete at least one role entry before saving.')
      return
    }

    if (
      calculatedRows.some(
        (item) => !item.row.baselineDesign || !item.canCalculate || !item.output,
      )
    ) {
      setMessage(
        'Every active row needs Baseline_Design, Starting_Assignment_Count, and derived or manual Baseline_Count.',
      )
      return
    }

    const payload = calculatedRows.map((item) => {
      if (!item.output) throw new Error('Missing calculated output.')

      return {
        assignment_id: item.assignmentId,
        unit: header.unit,
        role_pool: `${item.row.rolePool} ${item.row.entryNumber}`,
        shift_type: header.shiftType,
        shift_block: header.shiftBlock,
        assignment_date: header.date,
        baseline_design: item.row.baselineDesign,
        starting_assignment_count: Number(item.row.startingAssignmentCount),
        baseline_count: item.baselineCount,
        load_reason: item.row.loadReason,
        load_complexity: item.row.loadComplexity,
        load_modifier: item.output.load_modifier_delta,
        complexity_flag: item.output.complexity_flag === 'YES',
        complexity_status: item.output.complexity_status,
        starting_strain_signal: item.output.starting_strain_signal,
        complexity_weight: item.output.complexity_weight,
      }
    })

    setSaving(true)
    const { error } = await supabase.from('ssi_assignment_instances').insert(payload)
    setSaving(false)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage(`Saved ${payload.length} active assignment instance rows for ${header.shiftType}.`)
    setRows(makeInitialRows())
    setExpandedRows({})
  }

  if (checkingAccess || !authorized) {
    return (
      <main style={styles.page}>
        <section style={styles.shell}>
          <div style={styles.header}>
            <p style={styles.eyebrow}>TSINAXA SSI • SECURE ACCESS</p>
            <h1 style={styles.title}>Verifying SSI Access</h1>
            <p style={styles.subtitle}>Checking authorized structural stability access...</p>
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
              <p style={styles.eyebrow}>TSINAXA SSI • ASSIGNMENT_INSTANCES</p>
              <h1 style={styles.title}>Hospital Shift-Start Assignment Set</h1>
              <p style={styles.subtitle}>
                Capture individual assignment entries inside each role pool. Save only active completed rows.
                Hidden strain is detected at shift start before events are reported.
              </p>
            </div>

            <button type="button" style={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <nav aria-label="TSINAXA SSI flow navigation" style={styles.flowNav}>
          <div style={styles.flowNavHeader}>
            <span style={styles.flowNavTitle}>SSI Flow</span>
            <span style={styles.flowNavRule} />
            <span style={styles.flowNavCaption}>
              Assignments → Events → Trend Buffer → Executive Dashboard → Weekly Brief
            </span>
          </div>

          <div style={styles.flowSteps}>
            {ssiFlow.map((item, index) => (
              <div key={item.href} style={styles.flowStepWrap}>
                <a
                  href={item.href}
                  style={{
                    ...styles.flowStep,
                    ...(item.active ? styles.flowStepActive : {}),
                  }}
                >
                  <span style={styles.flowStepIndex}>{index + 1}</span>
                  <span style={styles.flowStepText}>
                    <strong>{item.label}</strong>
                    <small>{item.note}</small>
                  </span>
                </a>
                {index < ssiFlow.length - 1 ? <span style={styles.flowArrow}>→</span> : null}
              </div>
            ))}
          </div>
        </nav>

        <form onSubmit={handleSubmit}>
          <section style={styles.panel}>
            <h2 style={styles.panelTitle}>Shared Shift Header</h2>
            <Input label="Unit" value={header.unit} onChange={(v) => updateHeader('unit', v)} />
            <Input
              label="Date"
              helper="Enter manually as YYYY-MM-DD"
              placeholder="2026-03-06"
              value={header.date}
              onChange={(v) => updateHeader('date', v)}
            />
            <Select
              label="Shift_Type"
              value={header.shiftType}
              options={SSI_SHIFT_TYPE_OPTIONS}
              onChange={(v) => updateHeader('shiftType', v)}
            />
            <Select
              label="Shift_Block"
              value={header.shiftBlock}
              options={SSI_COMMON_SHIFT_BLOCK_OPTIONS}
              onChange={(v) => updateHeader('shiftBlock', v)}
            />
          </section>

          <section style={styles.stickySnapshot}>
            <div style={styles.stickyTitle}>Current Shift Snapshot</div>
            <MiniMetric label="Active_Rows" value={String(activeRows.length)} />
            <MiniMetric label="Assignment_Load_Skew" value={String(snapshot.assignment_load_skew)} />
            <MiniMetric label="Hidden" value={String(snapshot.hidden_strain_count)} />
            <MiniMetric label="Severe" value={String(snapshot.severe_strain_count)} />
          </section>

          <section style={styles.tablePanel}>
            <h2 style={styles.panelTitle}>Role-Pool Sections</h2>

            {roleSections.map(({ rolePool, count }) => {
              const sectionRows = rows.filter((row) => row.rolePool === rolePool)
              const sectionActive = sectionRows.filter((row) => row.active).length
              const expanded = expandedSections[rolePool]

              return (
                <section key={rolePool} style={styles.roleSection}>
                  <button
                    type="button"
                    style={styles.sectionToggle}
                    onClick={() => toggleSection(rolePool)}
                  >
                    {expanded ? 'Hide' : 'Show'} {rolePool} entries • {sectionActive}/{count} active
                  </button>

                  {expanded
                    ? sectionRows.map((row) => {
                        const item = calculatedRows.find((calculated) => calculated.row.id === row.id)
                        const rowExpanded = expandedRows[row.id] ?? false

                        return (
                          <div key={row.id} style={styles.rowCard}>
                            <div style={styles.assignmentIdBox}>
                              <span style={styles.roleEntry}>
                                {rolePool} Entry {row.entryNumber}
                              </span>
                              <code style={styles.assignmentIdCode}>
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
                                onChange={(event) => updateRow(row.id, 'active', event.target.checked)}
                              />
                              Active row
                            </label>

                            {row.active ? (
                              <>
                                <Input
                                  label="Baseline_Design"
                                  placeholder="1:4"
                                  value={row.baselineDesign}
                                  onChange={(v) => updateRow(row.id, 'baselineDesign', v)}
                                />
                                <Input
                                  label="Starting_Assignment_Count"
                                  type="number"
                                  value={row.startingAssignmentCount}
                                  onChange={(v) => updateRow(row.id, 'startingAssignmentCount', v)}
                                />
                                <Input
                                  label="Baseline_Count"
                                  helper="Optional. If blank, derived from Baseline_Design."
                                  type="number"
                                  value={row.baselineCount}
                                  onChange={(v) => updateRow(row.id, 'baselineCount', v)}
                                />
                                <Select
                                  label="Load_Reason"
                                  value={row.loadReason}
                                  options={SSI_LOAD_REASON_OPTIONS}
                                  onChange={(v) => updateRow(row.id, 'loadReason', v)}
                                />
                                <Select
                                  label="Load_Complexity"
                                  value={row.loadComplexity}
                                  options={SSI_LOAD_COMPLEXITY_OPTIONS}
                                  onChange={(v) => updateRow(row.id, 'loadComplexity', v)}
                                />

                                <div style={styles.primarySignalGrid}>
                                  <ReadOnly
                                    label="Starting_Strain_Signal"
                                    value={item?.output?.starting_strain_signal ?? 'Not calculated yet'}
                                  />
                                  <ReadOnly
                                    label="Structural_Strain_Summary"
                                    value={item?.output?.structural_strain_summary ?? 'Not calculated yet'}
                                    wrap
                                  />
                                </div>

                                <button
                                  type="button"
                                  style={styles.detailToggle}
                                  onClick={() => toggleRowDetails(row.id)}
                                >
                                  {rowExpanded ? 'Hide calculation details' : 'Show calculation details'}
                                </button>

                                {rowExpanded ? (
                                  <div style={styles.calculatedGrid}>
                                    <ReadOnly
                                      label="Load_Modifier"
                                      value={item?.output?.load_modifier ?? 'Not calculated yet'}
                                    />
                                    <ReadOnly
                                      label="Load_Delta"
                                      value={
                                        item?.output
                                          ? String(item.output.load_modifier_delta)
                                          : 'Not calculated yet'
                                      }
                                    />
                                    <ReadOnly
                                      label="Complexity_Flag"
                                      value={item?.output?.complexity_flag ?? 'Not calculated yet'}
                                    />
                                    <ReadOnly
                                      label="Complexity_Status"
                                      value={item?.output?.complexity_status ?? 'Not calculated yet'}
                                    />
                                    <ReadOnly
                                      label="Complexity_Weight"
                                      value={
                                        item?.output
                                          ? String(item.output.complexity_weight)
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
            <button type="submit" disabled={saving} style={styles.button}>
              {saving ? 'Saving...' : 'Save Active Assignment Rows'}
            </button>
            {message ? <p style={styles.message}>{message}</p> : null}
          </div>

          <section style={styles.snapshot}>
            <button
              type="button"
              style={styles.snapshotToggle}
              onClick={() => setSnapshotOpen((v) => !v)}
            >
              {snapshotOpen ? 'Hide' : 'Show'} Assignment Strain Snapshot
            </button>

            {snapshotOpen ? (
              <div style={styles.snapshotGrid}>
                <ReadOnly label="Assignment_Load_Skew" value={String(snapshot.assignment_load_skew)} />
                <ReadOnly label="Hidden_Strain_Count" value={String(snapshot.hidden_strain_count)} />
                <ReadOnly label="Visible_Strain_Count" value={String(snapshot.visible_strain_count)} />
                <ReadOnly label="Severe_Strain_Count" value={String(snapshot.severe_strain_count)} />
                <ReadOnly label="Dominant_Load_Reason" value={snapshot.dominant_load_reason} wrap />
                <ReadOnly label="Dominant_Load_Complexity" value={snapshot.dominant_load_complexity} wrap />
                <ReadOnly label="Structural_Strain_Reading" value={snapshot.structural_strain_reading} wrap />
                <ReadOnly
                  label="Snapshot_Boundary"
                  value="Current shift set only. 7-day trend belongs to /ssi/dashboard."
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
      {helper ? <small style={styles.helper}>{helper}</small> : null}
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
      <select value={value} onChange={(event) => onChange(event.target.value)} style={styles.input}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function ReadOnly({ label, value, wrap = false }: { label: string; value: string; wrap?: boolean }) {
  return (
    <div style={styles.readOnlyBox}>
      <span style={styles.readOnlyLabel}>{label}</span>
      <strong style={wrap ? styles.readOnlyValueWrap : styles.readOnlyValue}>{value}</strong>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.miniMetric}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', background: '#050505', color: '#fff8e7', padding: '40px' },
  shell: { maxWidth: '1280px', margin: '0 auto' },
  header: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '24px',
    padding: '28px',
    marginBottom: '16px',
  },
  headerTop: { display: 'grid', gridTemplateColumns: '1fr auto', gap: '24px', alignItems: 'start' },
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
  title: { fontSize: '38px', margin: '12px 0' },
  subtitle: { color: '#cfc7b5', margin: 0, maxWidth: '920px' },

  flowNav: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '20px',
    padding: '16px',
    marginBottom: '18px',
  },
  flowNavHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  flowNavTitle: {
    color: '#d6b25e',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: '12px',
  },
  flowNavRule: { height: '1px', flex: 1, background: 'rgba(214,178,94,0.22)' },
  flowNavCaption: { color: '#cfc7b5', fontSize: '12px', fontWeight: 700 },
  flowSteps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '10px',
  },
  flowStepWrap: { display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 },
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
  flowStepText: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  flowArrow: { color: '#9f8142', fontWeight: 900, flexShrink: 0 },

  panel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '22px',
    padding: '22px',
    marginBottom: '14px',
  },
  stickySnapshot: {
    position: 'sticky',
    top: 0,
    zIndex: 5,
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
  },
  tablePanel: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '22px',
    padding: '22px',
    marginBottom: '18px',
  },
  panelTitle: { gridColumn: '1 / -1', color: '#d6b25e', margin: '0 0 8px' },
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
  roleEntry: { color: '#d6b25e', fontWeight: 900, fontSize: '16px' },
  assignmentIdCode: {
    color: '#cfc7b5',
    fontWeight: 700,
    fontSize: '12px',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    lineHeight: 1.35,
  },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '10px', color: '#cfc7b5', fontWeight: 700 },
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
  label: { display: 'flex', flexDirection: 'column', gap: '8px', color: '#cfc7b5', fontSize: '13px' },
  helper: { color: '#9f8142', fontSize: '12px' },
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
  readOnlyLabel: { color: '#cfc7b5', flexShrink: 0 },
  readOnlyValue: { color: '#fff8e7', textAlign: 'right' },
  readOnlyValueWrap: {
    color: '#fff8e7',
    textAlign: 'right',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    lineHeight: 1.45,
  },
  actions: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' },
  button: {
    background: '#d6b25e',
    color: '#050505',
    border: 'none',
    borderRadius: '14px',
    padding: '13px 18px',
    fontWeight: 800,
    cursor: 'pointer',
  },
  message: { color: '#cfc7b5', margin: 0 },
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