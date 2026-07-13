'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

type TrendRecord = {
  id: string
  unit: string
  window_start: string
  window_end: string
  assignment_load_skew: number | null
  total_stability_events: number | null
  high_intensity_event_count: number | null
  late_or_last_minute_event_count: number | null
  buffer_use_profile: string | null
  repeated_buffer_depletion_flag: boolean | null
  dominant_stability_forces: string[] | string | null
  trend_status: string | null
  leadership_action_cue: string | null
  stability_score: number | null
  predictability_insight: string | null
  most_affected_role_pool: string | null
  most_affected_shift: string | null
  fragility_level: string | null
  cost_pressure_signal: string | null
  leadership_interpretation: string | null
  immediate_action_1: string | null
  immediate_action_2: string | null
  short_term_action_1: string | null
  short_term_action_2: string | null
  risk_outlook: string | null
  last_action_taken: string | null
  observed_outcome: string | null
  workforce_event_counts: Record<string, number> | null
  organizational_adaptation_counts: Record<string, number> | null
  staffing_instability_event_count: number | null
  buffer_response_count: number | null
  high_cost_buffer_response_count: number | null
  dominant_workforce_event_type: string | null
  dominant_organizational_adaptation: string | null
  repeated_workforce_event_type: string | null
  repeated_organizational_adaptation: string | null
  workforce_reliability_status: string | null
  reliability_pattern_direction: string | null
  repeated_workforce_reliability_flag: boolean | null
  repeated_adaptation_flag: boolean | null
  consecutive_affected_windows: number | null
  workforce_reliability_summary: string | null
  workforce_consequence_outlook: string | null
  created_at: string
  updated_at: string
}

type ProfileTableProps = {
  values: Record<string, number> | null
  firstColumnLabel: string
  emptyMessage: string
}

const allowedRoles = ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']
const allowedStatuses = ['ACTIVE']

const MISSING = 'Not persisted in current buffer.'
const NO_RECORDS = 'No persisted SSI reporting window is available.'
const ACCESS_FAILURE = 'SSI could not verify access. Check the connection and try again.'
const INITIAL_LOAD_FAILURE =
  'The weekly stability record could not be loaded. Check the connection and try again.'
const REFRESH_LOAD_FAILURE =
  'The weekly stability record could not be loaded. The last valid display has not been changed. Check the connection and try again.'
const PDF_FAILURE = 'The PDF could not be generated. Check the browser and try again.'
const REQUEST_TIMEOUT_MS = 12000

const TREND_BUFFER_SELECT = `
  id,
  unit,
  window_start,
  window_end,
  assignment_load_skew,
  total_stability_events,
  high_intensity_event_count,
  late_or_last_minute_event_count,
  buffer_use_profile,
  repeated_buffer_depletion_flag,
  dominant_stability_forces,
  trend_status,
  leadership_action_cue,
  stability_score,
  predictability_insight,
  most_affected_role_pool,
  most_affected_shift,
  fragility_level,
  cost_pressure_signal,
  leadership_interpretation,
  immediate_action_1,
  immediate_action_2,
  short_term_action_1,
  short_term_action_2,
  risk_outlook,
  last_action_taken,
  observed_outcome,
  workforce_event_counts,
  organizational_adaptation_counts,
  staffing_instability_event_count,
  buffer_response_count,
  high_cost_buffer_response_count,
  dominant_workforce_event_type,
  dominant_organizational_adaptation,
  repeated_workforce_event_type,
  repeated_organizational_adaptation,
  workforce_reliability_status,
  reliability_pattern_direction,
  repeated_workforce_reliability_flag,
  repeated_adaptation_flag,
  consecutive_affected_windows,
  workforce_reliability_summary,
  workforce_consequence_outlook,
  created_at,
  updated_at
`

const ssiFlow = [
  {
    label: 'Assignments',
    href: '/ssi/assignments',
    note: 'Shift-start load capture',
    active: false,
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
    active: true,
  },
]

function hasValue(value: unknown) {
  if (value === undefined || value === null || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  return String(value).trim().length > 0
}

function display(value: unknown) {
  if (!hasValue(value)) return MISSING
  if (typeof value === 'boolean') return value ? 'YES' : 'NO'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : MISSING
  return String(value).trim()
}

function withTimeout<T>(
  operation: PromiseLike<T>,
  timeoutMs = REQUEST_TIMEOUT_MS,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false

    const timeoutId = window.setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error('REQUEST_TIMEOUT'))
    }, timeoutMs)

    Promise.resolve(operation).then(
      (value) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        resolve(value)
      },
      () => {
        if (settled) return
        settled = true
        window.clearTimeout(timeoutId)
        reject(new Error('REQUEST_FAILED'))
      },
    )
  })
}

async function safelySignOut() {
  try {
    await withTimeout(supabase.auth.signOut())
  } catch {
    return
  }
}

export default function SSIWeeklyBriefPage() {
  const router = useRouter()
  const briefRef = useRef<HTMLElement | null>(null)
  const mountedRef = useRef(false)
  const recordRef = useRef<TrendRecord | null>(null)
  const printTimerRef = useRef<number | null>(null)

  const [authorized, setAuthorized] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [accessAttempt, setAccessAttempt] = useState(0)

  const [unit, setUnit] = useState('Wing B')
  const [weekStart, setWeekStart] = useState('2026-03-01')
  const [weekEnd, setWeekEnd] = useState('2026-03-07')

  const [record, setRecord] = useState<TrendRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const [downloading, setDownloading] = useState(false)
  const [logoutInProgress, setLogoutInProgress] = useState(false)
  const [hideControlsForPrint, setHideControlsForPrint] = useState(false)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false

      if (printTimerRef.current !== null) {
        window.clearTimeout(printTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    recordRef.current = record
  }, [record])

  const verifyAccess = useCallback(async () => {
    if (mountedRef.current) {
      setCheckingAccess(true)
      setAccessError(null)
      setAuthorized(false)
    }

    try {
      const sessionResult = await withTimeout(supabase.auth.getSession())

      if (!mountedRef.current) return

      if (sessionResult.error) {
        setAccessError(ACCESS_FAILURE)
        return
      }

      const session = sessionResult.data.session

      if (!session?.user) {
        router.replace('/ssi/login')
        return
      }

      if (!session.user.email_confirmed_at) {
        await safelySignOut()

        if (mountedRef.current) {
          router.replace('/ssi/login')
        }

        return
      }

      const roleResult = await withTimeout(
        supabase
          .from('user_roles')
          .select('role,status')
          .eq('user_id', session.user.id)
          .maybeSingle(),
      )

      if (!mountedRef.current) return

      if (roleResult.error) {
        setAccessError(ACCESS_FAILURE)
        return
      }

      const roleRecord = roleResult.data

      if (
        !roleRecord ||
        !allowedRoles.includes(roleRecord.role) ||
        !allowedStatuses.includes(roleRecord.status)
      ) {
        await safelySignOut()

        if (mountedRef.current) {
          router.replace('/ssi/login')
        }

        return
      }

      setAuthorized(true)
      setAccessError(null)
    } catch {
      if (mountedRef.current) {
        setAuthorized(false)
        setAccessError(ACCESS_FAILURE)
      }
    } finally {
      if (mountedRef.current) {
        setCheckingAccess(false)
      }
    }
  }, [router])

  useEffect(() => {
    void verifyAccess()
  }, [accessAttempt, verifyAccess])

  useEffect(() => {
    function beforePrint() {
      if (mountedRef.current) {
        setHideControlsForPrint(true)
      }
    }

    function afterPrint() {
      if (mountedRef.current) {
        setHideControlsForPrint(false)
      }
    }

    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)

    return () => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
    }
  }, [])

  async function handleLogout() {
    if (logoutInProgress) return

    setLogoutInProgress(true)

    try {
      await withTimeout(supabase.auth.signOut())
    } catch {
      return
    } finally {
      if (mountedRef.current) {
        setAuthorized(false)
        setCheckingAccess(false)
        setLogoutInProgress(false)
        router.replace('/ssi/login')
      }
    }
  }

  async function loadBrief() {
    if (loading) return

    if (!unit.trim() || !weekStart.trim() || !weekEnd.trim()) {
      setMessage('Enter Unit, Week Start, and Week End.')
      return
    }

    if (mountedRef.current) {
      setLoading(true)
      setMessage('')
      setLoadError(null)
    }

    try {
      const result = await withTimeout(
        supabase
          .from('ssi_trend_buffer')
          .select(TREND_BUFFER_SELECT)
          .eq('unit', unit.trim())
          .eq('window_start', weekStart.trim())
          .eq('window_end', weekEnd.trim())
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      )

      if (!mountedRef.current) return

      if (result.error) {
        setLoadError(
          recordRef.current ? REFRESH_LOAD_FAILURE : INITIAL_LOAD_FAILURE,
        )
        return
      }

      if (!result.data) {
        setRecord(null)
        setLoadError(null)
        setMessage(NO_RECORDS)
        return
      }

      setRecord(result.data as unknown as TrendRecord)
      setLoadError(null)
      setMessage('')
    } catch {
      if (mountedRef.current) {
        setLoadError(
          recordRef.current ? REFRESH_LOAD_FAILURE : INITIAL_LOAD_FAILURE,
        )
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  function retryAccess() {
    if (checkingAccess) return
    setAccessAttempt((current) => current + 1)
  }

  function returnToLogin() {
    router.replace('/ssi/login')
  }

  function printBrief() {
    if (!record || printTimerRef.current !== null) return

    setHideControlsForPrint(true)

    printTimerRef.current = window.setTimeout(() => {
      printTimerRef.current = null

      try {
        window.print()
      } finally {
        if (mountedRef.current) {
          setHideControlsForPrint(false)
        }
      }
    }, 50)
  }

  async function downloadPdf() {
    if (!briefRef.current || !record || downloading) return

    setDownloading(true)
    setMessage('Preparing PDF download...')

    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

      if (!briefRef.current) {
        throw new Error('BRIEF_NOT_AVAILABLE')
      }

      const canvas = await html2canvas(briefRef.current, {
        scale: 2,
        backgroundColor: '#050505',
        useCORS: true,
      })

      const imageData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imageHeight = (canvas.height * pageWidth) / canvas.width

      let heightLeft = imageHeight
      let position = 0

      pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imageHeight
        pdf.addPage()
        pdf.addImage(imageData, 'PNG', 0, position, pageWidth, imageHeight)
        heightLeft -= pageHeight
      }

      pdf.save(
        `TSINAXA-Weekly-Stability-Brief-${unit.trim()}-${weekStart.trim()}-to-${weekEnd.trim()}.pdf`,
      )

      if (mountedRef.current) {
        setMessage('PDF downloaded.')
      }
    } catch {
      if (mountedRef.current) {
        setMessage(PDF_FAILURE)
      }
    } finally {
      if (mountedRef.current) {
        setDownloading(false)
      }
    }
  }

  const reportingStart = record?.window_start ?? weekStart
  const reportingEnd = record?.window_end ?? weekEnd

  const workforceEventEntries = useMemo(() => {
    if (!record?.workforce_event_counts) return []

    return Object.entries(record.workforce_event_counts).sort(
      ([firstLabel, firstCount], [secondLabel, secondCount]) => {
        if (secondCount !== firstCount) return secondCount - firstCount
        return firstLabel.localeCompare(secondLabel)
      },
    )
  }, [record])

  const adaptationEntries = useMemo(() => {
    if (!record?.organizational_adaptation_counts) return []

    return Object.entries(record.organizational_adaptation_counts).sort(
      ([firstLabel, firstCount], [secondLabel, secondCount]) => {
        if (secondCount !== firstCount) return secondCount - firstCount
        return firstLabel.localeCompare(secondLabel)
      },
    )
  }, [record])

  if (checkingAccess) {
    return (
    <>
      <style>{`
        @media print {
          html,
          body {
            background: #050505 !important;
            color: #fff8e7 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .ssi-weekly-brief-print,
          .ssi-weekly-brief-print * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .ssi-weekly-brief-print {
            background: #070707 !important;
            color: #fff8e7 !important;
            border-color: rgba(214, 178, 94, 0.28) !important;
          }
        }
      `}</style>

      <main style={styles.page}>
        <section style={styles.controls}>
          <p style={styles.eyebrow}>TSINAXA SSI • SECURE ACCESS</p>
          <h1 style={styles.title}>Verifying SSI Access</h1>
          <p style={styles.sub}>
            Checking authorized structural stability access...
          </p>
        </section>
           </main>
    </>
  )
}

  if (accessError || !authorized) {
    return (
      <main style={styles.page}>
        <section style={styles.controls}>
          <p style={styles.eyebrow}>TSINAXA SSI • SECURE ACCESS</p>
          <h1 style={styles.title}>SSI Access Verification</h1>
          <p style={styles.message}>{accessError ?? ACCESS_FAILURE}</p>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={retryAccess}
              disabled={checkingAccess}
              style={styles.button}
            >
              {checkingAccess ? 'Trying Again...' : 'Try Again'}
            </button>

            <button
              type="button"
              onClick={returnToLogin}
              disabled={checkingAccess}
              style={styles.secondaryButton}
            >
              Return to Login
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <section
        style={{
          ...styles.controls,
          display: hideControlsForPrint ? 'none' : 'block',
        }}
      >
        <div style={styles.topbar}>
          <div>
            <p style={styles.eyebrow}>
              TSINAXA SSI — Structural Stability Intelligence System
            </p>
            <h1 style={styles.title}>Weekly Stability Brief</h1>
            <p style={styles.sub}>
              Executive interpretation generated exclusively from persisted SSI
              trend-buffer intelligence.
            </p>
          </div>

          <button
            type="button"
            style={{
              ...styles.logoutButton,
              ...(logoutInProgress ? styles.disabledButton : {}),
            }}
            onClick={handleLogout}
            disabled={logoutInProgress}
          >
            {logoutInProgress ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        <nav aria-label="TSINAXA SSI flow navigation" style={styles.flowNav}>
          <div style={styles.flowNavHeader}>
            <span style={styles.flowNavTitle}>SSI Flow</span>
            <span style={styles.flowNavRule} />
            <span style={styles.flowNavCaption}>
              Assignments → Events → Trend Buffer → Executive Dashboard → Weekly
              Brief
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

                {index < ssiFlow.length - 1 ? (
                  <span style={styles.flowArrow}>→</span>
                ) : null}
              </div>
            ))}
          </div>
        </nav>

        <div style={styles.grid}>
          <Input
            label="Unit"
            value={unit}
            onChange={setUnit}
            placeholder="Wing B"
          />
          <Input
            label="Week Start"
            value={weekStart}
            onChange={setWeekStart}
            placeholder="2026-03-01"
          />
          <Input
            label="Week End"
            value={weekEnd}
            onChange={setWeekEnd}
            placeholder="2026-03-07"
          />
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={loadBrief}
            disabled={
              loading ||
              !unit.trim() ||
              !weekStart.trim() ||
              !weekEnd.trim()
            }
            style={styles.button}
          >
            {loading ? 'Loading...' : 'Generate Brief'}
          </button>

          <button
            type="button"
            onClick={printBrief}
            disabled={!record || loading}
            style={styles.button}
          >
            Print
          </button>

          <button
            type="button"
            onClick={downloadPdf}
            disabled={!record || downloading || loading}
            style={styles.button}
          >
            {downloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>

        {loadError ? (
          <div style={styles.statusPanel}>
            <p style={styles.message}>{loadError}</p>

            <button
              type="button"
              onClick={loadBrief}
              disabled={loading}
              style={styles.secondaryButton}
            >
              {loading ? 'Trying Again...' : 'Try Again'}
            </button>
          </div>
        ) : null}

        {message ? <p style={styles.message}>{message}</p> : null}
      </section>

      {record ? (
        <article className="ssi-weekly-brief-print" style={styles.brief} ref={briefRef}>
          <header style={styles.header}>
            <p style={styles.eyebrow}>TSINAXA — Weekly Stability Brief</p>
            <h2 style={styles.heading}>
              Structural Stability Intelligence System
            </h2>
            <p style={styles.text}>
              <strong>Unit:</strong> {display(record.unit)}
            </p>
            <p style={styles.text}>
              <strong>Reporting Period:</strong> {display(reportingStart)} –{' '}
              {display(reportingEnd)}
            </p>
            <p style={styles.text}>
              <strong>Prepared by:</strong> TSINAXA
            </p>
          </header>

          <BriefSection title="Overall System Status">
            <DataLine label="Stability Status" value={record.trend_status} />
            <DataLine label="Stability Score" value={record.stability_score} />
          </BriefSection>

          <BriefSection title="Workforce Reliability Status">
            <DataLine
              label="Workforce Reliability Status"
              value={record.workforce_reliability_status}
            />
            <DataLine
              label="Pattern Direction"
              value={record.reliability_pattern_direction}
            />
            <DataLine
              label="Consecutive Affected Windows"
              value={record.consecutive_affected_windows}
            />
            <DataLine
              label="Repeated Workforce Reliability"
              value={record.repeated_workforce_reliability_flag}
            />
            <DataLine
              label="Repeated Organizational Adaptation"
              value={record.repeated_adaptation_flag}
            />
          </BriefSection>

          <BriefSection title="Key Structural Signals">
            <DataLine
              label="Total Stability Events"
              value={record.total_stability_events}
            />
            <DataLine
              label="High-Intensity Events"
              value={record.high_intensity_event_count}
            />
            <DataLine
              label="Late or Last-Minute Events"
              value={record.late_or_last_minute_event_count}
            />
            <DataLine
              label="Assignment Load Skew"
              value={record.assignment_load_skew}
            />
            <DataLine
              label="Dominant Stability Forces"
              value={record.dominant_stability_forces}
            />
          </BriefSection>

          <BriefSection title="Workforce Reliability Evidence">
            <DataLine
              label="Staffing Instability Events"
              value={record.staffing_instability_event_count}
            />
            <DataLine
              label="Dominant Workforce Event"
              value={record.dominant_workforce_event_type}
            />
            <DataLine
              label="Repeated Workforce Event"
              value={record.repeated_workforce_event_type}
            />
            <DataLine
              label="Buffer Responses"
              value={record.buffer_response_count}
            />
            <DataLine
              label="High-Cost Buffer Responses"
              value={record.high_cost_buffer_response_count}
            />
            <DataLine
              label="Dominant Organizational Adaptation"
              value={record.dominant_organizational_adaptation}
            />
            <DataLine
              label="Repeated Organizational Adaptation"
              value={record.repeated_organizational_adaptation}
            />
          </BriefSection>

          <BriefSection title="Workforce Event Profile">
            <ProfileTable
              entries={workforceEventEntries}
              firstColumnLabel="Evidence Type"
              emptyMessage="No workforce-event profile was persisted for this window."
            />
          </BriefSection>

          <BriefSection title="Organizational Adaptation Profile">
            <ProfileTable
              entries={adaptationEntries}
              firstColumnLabel="Adaptation"
              emptyMessage="No organizational-adaptation profile was persisted for this window."
            />
          </BriefSection>

          <BriefSection title="Predictability Insight">
            <p style={styles.text}>{display(record.predictability_insight)}</p>
          </BriefSection>

          <BriefSection title="Fragility Focus">
            <DataLine
              label="Most Affected Role Pool"
              value={record.most_affected_role_pool}
            />
            <DataLine
              label="Most Affected Shift"
              value={record.most_affected_shift}
            />
            <DataLine
              label="Fragility Level"
              value={record.fragility_level}
            />
          </BriefSection>

          <BriefSection title="Cost and Buffer Pressure">
            <DataLine
              label="Cost Pressure Signal"
              value={record.cost_pressure_signal}
            />
            <DataLine
              label="Buffer Use Profile"
              value={record.buffer_use_profile}
            />
            <DataLine
              label="Repeated Buffer Depletion"
              value={record.repeated_buffer_depletion_flag}
            />
          </BriefSection>

          <BriefSection title="Leadership Interpretation">
            <p style={styles.text}>
              {display(record.leadership_interpretation)}
            </p>

            <DataLine
              label="Leadership Action Cue"
              value={record.leadership_action_cue}
            />
          </BriefSection>

          <BriefSection title="Workforce Reliability Interpretation">
            <DataLine
              label="Workforce Reliability Summary"
              value={record.workforce_reliability_summary}
            />
            <DataLine
              label="Workforce Consequence Outlook"
              value={record.workforce_consequence_outlook}
            />
          </BriefSection>

          <BriefSection title="Recommended Action">
            <h4 style={styles.smallHeading}>Immediate</h4>
            <ul style={styles.list}>
              <li>{display(record.immediate_action_1)}</li>
              <li>{display(record.immediate_action_2)}</li>
            </ul>

            <h4 style={styles.smallHeading}>Short-Term</h4>
            <ul style={styles.list}>
              <li>{display(record.short_term_action_1)}</li>
              <li>{display(record.short_term_action_2)}</li>
            </ul>
          </BriefSection>

          <BriefSection title="Risk Outlook">
            <p style={styles.text}>{display(record.risk_outlook)}</p>
          </BriefSection>

          <BriefSection title="Action Log">
            <DataLine
              label="Last Leadership Action"
              value={record.last_action_taken}
            />
            <DataLine
              label="Observed Outcome"
              value={record.observed_outcome}
            />
          </BriefSection>

          <footer style={styles.footer}>
            No Names. No Blame. No Surveillance. Only Structural Signals.
          </footer>
        </article>
      ) : null}
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
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </label>
  )
}

function BriefSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section style={styles.briefSection}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </section>
  )
}

function DataLine({ label, value }: { label: string; value: unknown }) {
  return (
    <p style={styles.text}>
      <strong>{label}:</strong> {display(value)}
    </p>
  )
}

function ProfileTable({
  entries,
  firstColumnLabel,
  emptyMessage,
}: {
  entries: Array<[string, number]>
  firstColumnLabel: string
  emptyMessage: string
}) {
  if (entries.length === 0) {
    return <p style={styles.text}>{emptyMessage}</p>
  }

  return (
    <div style={styles.tableScroll}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>{firstColumnLabel}</th>
            <th style={styles.th}>Count</th>
          </tr>
        </thead>

        <tbody>
          {entries.map(([label, count]) => (
            <tr key={label}>
              <th scope="row" style={styles.rowHeader}>
                {display(label)}
              </th>
              <td style={styles.td}>{display(count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#050505',
    color: '#fff8e7',
    padding: '28px',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  controls: {
    maxWidth: '980px',
    margin: '0 auto 20px',
    padding: '24px',
    borderRadius: '20px',
    background: '#090807',
    border: '1px solid rgba(214,178,94,0.28)',
  },
  brief: {
    maxWidth: '980px',
    margin: '0 auto 20px',
    padding: '24px',
    borderRadius: '20px',
    background: '#070707',
    border: '1px solid rgba(214,178,94,0.28)',
  },
  topbar: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '20px',
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
  disabledButton: {
    cursor: 'not-allowed',
    opacity: 0.58,
  },
  eyebrow: {
    color: '#d6b25e',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  title: {
    color: '#d6b25e',
    margin: '8px 0',
    fontSize: '32px',
  },
  heading: {
    color: '#d6b25e',
    margin: '6px 0 10px',
  },
  smallHeading: {
    color: '#d6b25e',
    margin: '10px 0 4px',
    fontSize: '14px',
  },
  sub: {
    color: '#cfc7b5',
    margin: 0,
    lineHeight: 1.5,
  },
  flowNav: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '18px',
    padding: '14px',
    margin: '18px 0 8px',
  },
  flowNavHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '14px',
    marginTop: '20px',
  },
  label: {
    display: 'grid',
    gap: '8px',
    fontSize: '13px',
    color: '#cfc7b5',
  },
  input: {
    padding: '13px',
    borderRadius: '12px',
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#111827',
    color: '#fff8e7',
    fontSize: '15px',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '18px',
  },
  button: {
    padding: '11px 18px',
    border: 0,
    borderRadius: '999px',
    background: '#d6b25e',
    color: '#050505',
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '11px 18px',
    border: '1px solid rgba(214,178,94,0.42)',
    borderRadius: '999px',
    background: '#11100d',
    color: '#d6b25e',
    fontWeight: 800,
    cursor: 'pointer',
  },
  message: {
    marginTop: '14px',
    color: '#d6b25e',
    lineHeight: 1.5,
  },
  statusPanel: {
    marginTop: '14px',
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#11100d',
  },
  header: {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(214,178,94,0.28)',
  },
  briefSection: {
    marginBottom: '12px',
    padding: '16px',
    borderRadius: '16px',
    background: '#11100d',
    border: '1px solid rgba(214,178,94,0.18)',
    breakInside: 'avoid',
  },
  sectionTitle: {
    color: '#d6b25e',
    margin: '0 0 8px',
    fontSize: '15px',
  },
  text: {
    color: '#cfc7b5',
    lineHeight: 1.5,
    margin: '6px 0',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  list: {
    color: '#cfc7b5',
    paddingLeft: '20px',
    margin: '6px 0 0',
    lineHeight: 1.5,
  },
  tableScroll: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '9px 10px',
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#111827',
    color: '#fff8e7',
    fontSize: '11px',
    fontWeight: 900,
    textAlign: 'left',
  },
  rowHeader: {
    padding: '9px 10px',
    border: '1px solid rgba(214,178,94,0.18)',
    background: '#0d0d0c',
    color: '#d6b25e',
    fontSize: '12px',
    fontWeight: 900,
    textAlign: 'left',
  },
  td: {
    padding: '9px 10px',
    border: '1px solid rgba(214,178,94,0.18)',
    color: '#cfc7b5',
    fontSize: '12px',
    textAlign: 'left',
  },
  footer: {
    marginTop: '22px',
    textAlign: 'center',
    color: '#d6b25e',
    fontWeight: 800,
  },
}