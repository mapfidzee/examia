'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '../../lib/supabase'

type TrendBufferRow = {
  id: string
  unit: string
  window_start: string
  window_end: string
  assignment_load_skew: number
  total_stability_events: number
  high_intensity_event_count: number
  late_or_last_minute_event_count: number
  buffer_use_profile: string
  repeated_buffer_depletion_flag: boolean
  dominant_stability_forces: string[] | string
  trend_status: string
  leadership_action_cue: string
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

type LayerTone = 'leadership' | 'evidence' | 'reference'

type ProfileTableProps = {
  values: Record<string, number> | null
  firstColumnLabel: string
  emptyMessage: string
}

const MISSING = 'Not persisted in current buffer.'
const ACCESS_FAILURE = 'SSI could not verify access. Check the connection and try again.'
const INITIAL_LOAD_FAILURE =
  'The executive stability record could not be loaded. Check the connection and try again.'
const REFRESH_LOAD_FAILURE =
  'The executive stability record could not be loaded. The last valid display has not been changed. Check the connection and try again.'
const NO_RECORDS = 'No persisted SSI reporting window is available.'
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
    active: true,
  },
  {
    label: 'Weekly Brief',
    href: '/ssi/weekly-brief',
    note: 'Printable executive summary',
    active: false,
  },
]

const allowedRoles = ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']
const allowedStatuses = ['ACTIVE']

const colors = {
  page: '#050505',
  shell: '#080807',
  panel: '#0b0b0a',
  section: '#0d0d0c',
  slate: '#111827',
  slateSoft: 'rgba(17,24,39,0.58)',
  gold: '#d6b25e',
  goldMuted: '#9f8142',
  text: '#fff8e7',
  muted: '#cfc7b5',
  quiet: '#9f998b',
  line: 'rgba(214,178,94,0.20)',
  lineStrong: 'rgba(214,178,94,0.42)',
  lineSoft: 'rgba(214,178,94,0.12)',
}

function display(value: unknown) {
  if (value === null || value === undefined || value === '') return MISSING
  if (typeof value === 'boolean') return value ? 'YES' : 'NO'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : MISSING
  return String(value)
}

function skewStatus(value: number) {
  return Number(value) > 0 ? 'SKEWED' : 'NOT SKEWED'
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return display(value)
  return date.toLocaleString()
}

function primaryDominantForce(value: string[] | string) {
  if (Array.isArray(value)) return display(value[0])
  return display(value)
}

function hasValue(value: unknown) {
  if (value === null || value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  return String(value).trim().length > 0
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

function Layer({
  title,
  tone,
  children,
}: {
  title: string
  tone: LayerTone
  children: ReactNode
}) {
  const toneStyle: CSSProperties =
    tone === 'leadership'
      ? {
          borderColor: colors.lineStrong,
          background:
            'linear-gradient(180deg, rgba(214,178,94,0.045), rgba(255,255,255,0.01))',
        }
      : tone === 'evidence'
        ? { borderColor: colors.line }
        : {
            borderColor: colors.lineSoft,
            background: 'rgba(255,255,255,0.008)',
          }

  return (
    <div style={{ ...styles.layer, ...toneStyle }}>
      <div style={styles.layerHeader}>
        <h2 style={styles.layerTitle}>{title}</h2>
        <span style={styles.layerRule} />
      </div>
      {children}
    </div>
  )
}

function Section({
  title,
  children,
  emphasis = false,
  quiet = false,
}: {
  title: string
  children: ReactNode
  emphasis?: boolean
  quiet?: boolean
}) {
  return (
    <section
      style={{
        ...styles.section,
        borderColor: emphasis
          ? colors.lineStrong
          : quiet
            ? colors.lineSoft
            : colors.line,
        boxShadow: emphasis ? `inset 3px 0 0 ${colors.gold}` : undefined,
        background: quiet ? 'rgba(11,11,10,0.82)' : colors.panel,
      }}
    >
      <header
        style={{
          ...styles.sectionHeader,
          minHeight: quiet ? 32 : styles.sectionHeader.minHeight,
          background: quiet ? '#0a0a09' : colors.section,
        }}
      >
        <span
          style={{
            ...styles.sectionLine,
            background: quiet ? colors.goldMuted : colors.gold,
          }}
        />
        <h2
          style={{
            ...styles.sectionTitle,
            color: quiet ? colors.goldMuted : colors.gold,
          }}
        >
          {title}
        </h2>
      </header>
      <div style={styles.sectionContent}>{children}</div>
    </section>
  )
}

function Tile({
  label,
  value,
  strong = false,
  quiet = false,
}: {
  label: string
  value: unknown
  strong?: boolean
  quiet?: boolean
}) {
  return (
    <div
      style={{
        ...styles.dataTile,
        borderColor: quiet ? colors.lineSoft : colors.line,
      }}
    >
      <div
        style={{
          ...styles.dataLabel,
          background: quiet ? colors.slateSoft : colors.slate,
        }}
      >
        {label}
      </div>
      <div
        style={{
          ...styles.dataValue,
          color: quiet ? colors.quiet : colors.text,
          ...(strong ? styles.dataValueStrong : {}),
        }}
      >
        {display(value)}
      </div>
    </div>
  )
}

function MissingBand({ children = MISSING }: { children?: ReactNode }) {
  return <div style={styles.missingBand}>{children}</div>
}

function ProfileTable({
  values,
  firstColumnLabel,
  emptyMessage,
}: ProfileTableProps) {
  const entries = useMemo(() => {
    if (!values) return []

    return Object.entries(values).sort(
      ([firstLabel, firstCount], [secondLabel, secondCount]) => {
        if (secondCount !== firstCount) return secondCount - firstCount
        return firstLabel.localeCompare(secondLabel)
      },
    )
  }, [values])

  if (entries.length === 0) {
    return <MissingBand>{emptyMessage}</MissingBand>
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

export default function SSIExecutiveDashboardPage() {
  const router = useRouter()
  const mountedRef = useRef(false)
  const recordsRef = useRef<TrendBufferRow[]>([])

  const [authorized, setAuthorized] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [accessAttempt, setAccessAttempt] = useState(0)

  const [records, setRecords] = useState<TrendBufferRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadAttempt, setLoadAttempt] = useState(0)

  const [logoutInProgress, setLogoutInProgress] = useState(false)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    recordsRef.current = records
  }, [records])

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

  const loadDashboard = useCallback(async () => {
    if (!authorized) return

    if (mountedRef.current) {
      setLoading(true)
      setLoadError(null)
    }

    try {
      const result = await withTimeout(
        supabase
          .from('ssi_trend_buffer')
          .select(TREND_BUFFER_SELECT)
          .order('updated_at', { ascending: false })
          .limit(4),
      )

      if (!mountedRef.current) return

      if (result.error) {
        setLoadError(
          recordsRef.current.length > 0
            ? REFRESH_LOAD_FAILURE
            : INITIAL_LOAD_FAILURE,
        )
        return
      }

      const nextRecords = (result.data ?? []) as unknown as TrendBufferRow[]

      setRecords(nextRecords)
      setLoadError(null)
    } catch {
      if (mountedRef.current) {
        setLoadError(
          recordsRef.current.length > 0
            ? REFRESH_LOAD_FAILURE
            : INITIAL_LOAD_FAILURE,
        )
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [authorized])

  useEffect(() => {
    void loadDashboard()
  }, [loadAttempt, loadDashboard])

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

  function retryAccess() {
    if (checkingAccess) return
    setAccessAttempt((current) => current + 1)
  }

  function retryLoad() {
    if (loading) return
    setLoadAttempt((current) => current + 1)
  }

  function returnToLogin() {
    router.replace('/ssi/login')
  }

  const latest = records[0] ?? null

  const fourWeekRecords = useMemo(() => [...records].reverse(), [records])

  const roleEvidenceAvailable =
    latest &&
    (hasValue(latest.most_affected_role_pool) ||
      hasValue(latest.most_affected_shift))

  if (checkingAccess) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <Section title="SSI Secure Access">
            <MissingBand>Verifying authorized SSI access...</MissingBand>
          </Section>
        </div>
      </main>
    )
  }

  if (accessError || !authorized) {
    return (
      <main style={styles.page}>
        <div style={styles.shell}>
          <Section title="SSI Secure Access" emphasis>
            <MissingBand>{accessError ?? ACCESS_FAILURE}</MissingBand>

            <div style={styles.actionRow}>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={retryAccess}
                disabled={checkingAccess}
              >
                {checkingAccess ? 'Trying Again...' : 'Try Again'}
              </button>

              <button
                type="button"
                style={styles.secondaryButton}
                onClick={returnToLogin}
                disabled={checkingAccess}
              >
                Return to Login
              </button>
            </div>
          </Section>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.hero}>
          <div>
            <div style={styles.eyebrow}>
              TSINAXA SSI — Structural Stability Intelligence System
            </div>
            <h1 style={styles.title}>Executive Stability Brief</h1>
            <p style={styles.subtitle}>
              Current structural stability visibility from persisted SSI
              trend-buffer outputs.
            </p>
          </div>

          <div style={styles.updated}>
            <span style={styles.updatedLabel}>Latest persisted update</span>
            <strong style={styles.updatedValue}>
              {latest ? formatDate(latest.updated_at) : '—'}
            </strong>
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
        </header>

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

        {loadError ? (
          <Section title="Data Access Issue">
            <MissingBand>{loadError}</MissingBand>

            <div style={styles.actionRow}>
              <button
                type="button"
                style={styles.primaryButton}
                onClick={retryLoad}
                disabled={loading}
              >
                {loading ? 'Trying Again...' : 'Try Again'}
              </button>
            </div>
          </Section>
        ) : null}

        {loading && !latest ? (
          <Section title="Executive Stability Brief">
            <MissingBand>Loading persisted SSI trend buffer...</MissingBand>
          </Section>
        ) : null}

        {!loading && !latest && !loadError ? (
          <Section title="Executive Stability Brief">
            <MissingBand>{NO_RECORDS}</MissingBand>
          </Section>
        ) : null}

        {latest ? (
          <div style={styles.dashboard}>
            <Layer title="Leadership Layer" tone="leadership">
              <Section title="Executive Stability Brief">
                <div style={styles.compactGrid4}>
                  <Tile label="Unit" value={latest.unit} strong />
                  <Tile label="Window Start" value={latest.window_start} />
                  <Tile label="Window End" value={latest.window_end} />
                  <Tile
                    label="Assignment Load Skew"
                    value={skewStatus(latest.assignment_load_skew)}
                    strong
                  />
                </div>
              </Section>

              <Section title="Leadership Alert Panel" emphasis>
                <div style={styles.compactGrid4}>
                  <Tile
                    label="System Trend Status"
                    value={latest.trend_status}
                    strong
                  />
                  <Tile
                    label="Stability Risk Gauge"
                    value={latest.fragility_level}
                  />
                  <Tile
                    label="Buffer Cost Signal"
                    value={latest.cost_pressure_signal}
                  />
                  <Tile
                    label="Critical Interpretation"
                    value={latest.leadership_interpretation}
                  />
                </div>
              </Section>

              <Section title="Recommended Leadership Action" emphasis>
                <div style={styles.action}>
                  {display(latest.immediate_action_1)}
                </div>
              </Section>

              <Section title="WORKFORCE RELIABILITY ALERT" emphasis>
                <div style={styles.compactGrid5}>
                  <Tile
                    label="Workforce Reliability Status"
                    value={latest.workforce_reliability_status}
                    strong
                  />
                  <Tile
                    label="Pattern Direction"
                    value={latest.reliability_pattern_direction}
                  />
                  <Tile
                    label="Consecutive Affected Windows"
                    value={latest.consecutive_affected_windows}
                  />
                  <Tile
                    label="Repeated Workforce Reliability"
                    value={latest.repeated_workforce_reliability_flag}
                  />
                  <Tile
                    label="Repeated Organizational Adaptation"
                    value={latest.repeated_adaptation_flag}
                  />
                </div>
              </Section>

              <Section title="WORKFORCE RELIABILITY INTERPRETATION">
                <div style={styles.compactGrid2}>
                  <Tile
                    label="Workforce Reliability Summary"
                    value={latest.workforce_reliability_summary}
                  />
                  <Tile
                    label="Workforce Consequence Outlook"
                    value={latest.workforce_consequence_outlook}
                  />
                </div>
              </Section>
            </Layer>

            <Layer title="Evidence Layer" tone="evidence">
              <Section title="Stability Events Summary">
                <div style={styles.compactGrid3}>
                  <Tile
                    label="Total Events"
                    value={latest.total_stability_events}
                    strong
                  />
                  <Tile
                    label="High Intensity"
                    value={latest.high_intensity_event_count}
                    strong
                  />
                  <Tile
                    label="Late / Last Minute"
                    value={latest.late_or_last_minute_event_count}
                    strong
                  />
                </div>
              </Section>

              <Section title="Dominant System Force">
                <div style={styles.compactGrid3}>
                  <Tile
                    label="Primary Force"
                    value={primaryDominantForce(
                      latest.dominant_stability_forces,
                    )}
                    strong
                  />
                  <Tile
                    label="Supporting Basis"
                    value={latest.predictability_insight}
                  />
                  <Tile label="Force Notes" value={latest.risk_outlook} />
                </div>
              </Section>

              {roleEvidenceAvailable ? (
                <Section title="Role Pool Evidence">
                  <div style={styles.compactGrid3}>
                    <Tile
                      label="Affected Role Evidence"
                      value={latest.most_affected_role_pool}
                      strong
                    />
                    <Tile
                      label="Affected Shift Evidence"
                      value={latest.most_affected_shift}
                    />
                    <Tile
                      label="Interpretation Basis"
                      value="Persisted trend-buffer role and shift concentration."
                      quiet
                    />
                  </div>
                </Section>
              ) : null}

              <Section title="Cost Pressure Monitor">
                <div style={styles.compactGrid3}>
                  <Tile
                    label="Buffer Use Profile"
                    value={latest.buffer_use_profile}
                    strong
                  />
                  <Tile
                    label="Repeated Buffer Depletion"
                    value={latest.repeated_buffer_depletion_flag}
                  />
                  <Tile
                    label="Cost Pressure Signal"
                    value={latest.cost_pressure_signal}
                  />
                </div>
              </Section>

              <Section title="WORKFORCE RELIABILITY EVIDENCE">
                <div style={styles.compactGrid4}>
                  <Tile
                    label="Staffing Instability Events"
                    value={latest.staffing_instability_event_count}
                    strong
                  />
                  <Tile
                    label="Dominant Workforce Event"
                    value={latest.dominant_workforce_event_type}
                  />
                  <Tile
                    label="Repeated Workforce Event"
                    value={latest.repeated_workforce_event_type}
                  />
                  <Tile
                    label="Buffer Responses"
                    value={latest.buffer_response_count}
                    strong
                  />
                  <Tile
                    label="High-Cost Buffer Responses"
                    value={latest.high_cost_buffer_response_count}
                    strong
                  />
                  <Tile
                    label="Dominant Organizational Adaptation"
                    value={latest.dominant_organizational_adaptation}
                  />
                  <Tile
                    label="Repeated Organizational Adaptation"
                    value={latest.repeated_organizational_adaptation}
                  />
                </div>
              </Section>

              <Section title="WORKFORCE EVENT PROFILE">
                <ProfileTable
                  values={latest.workforce_event_counts}
                  firstColumnLabel="Evidence Type"
                  emptyMessage="No workforce-event profile was persisted for this window."
                />
              </Section>

              <Section title="ORGANIZATIONAL ADAPTATION PROFILE">
                <ProfileTable
                  values={latest.organizational_adaptation_counts}
                  firstColumnLabel="Adaptation"
                  emptyMessage="No organizational-adaptation profile was persisted for this window."
                />
              </Section>
            </Layer>

            <Layer title="Reference Layer" tone="reference">
              <Section title="System Trend Status" quiet>
                <MissingBand>
                  Trend Status is displayed once in the Leadership Alert Panel to
                  avoid duplicate presentation.
                </MissingBand>
              </Section>

              <Section title="Stability Cost Matrix" quiet>
                <div style={styles.compactGrid3}>
                  <Tile
                    label="Stable + Low Cost"
                    value="Low operational pressure."
                    quiet
                  />
                  <Tile
                    label="Straining + Moderate Cost"
                    value="Increasing buffer consumption."
                    quiet
                  />
                  <Tile
                    label="Unstable + High Cost"
                    value={latest.risk_outlook}
                  />
                </div>
              </Section>

              <Section title="4-Week Trend View" quiet>
                <div style={styles.tableScroll}>
                  <table style={styles.historyTable}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Week</th>
                        <th style={styles.th}>Unit</th>
                        <th style={styles.th}>Window Start</th>
                        <th style={styles.th}>Window End</th>
                        <th style={styles.th}>Persisted Trend Status</th>
                        <th style={styles.th}>
                          Workforce Reliability Status
                        </th>
                        <th style={styles.th}>Pattern Direction</th>
                        <th style={styles.th}>
                          Dominant Workforce Event
                        </th>
                        <th style={styles.th}>
                          Dominant Organizational Adaptation
                        </th>
                        <th style={styles.th}>
                          Consecutive Affected Windows
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fourWeekRecords.map((record, index) => (
                        <tr key={record.id}>
                          <th scope="row" style={styles.rowHeader}>
                            Week {index + 1}
                          </th>
                          <td style={styles.td}>{display(record.unit)}</td>
                          <td style={styles.td}>
                            {display(record.window_start)}
                          </td>
                          <td style={styles.td}>
                            {display(record.window_end)}
                          </td>
                          <td
                            style={{
                              ...styles.td,
                              color: colors.text,
                              fontWeight: 900,
                            }}
                          >
                            {display(record.trend_status)}
                          </td>
                          <td style={styles.td}>
                            {display(record.workforce_reliability_status)}
                          </td>
                          <td style={styles.td}>
                            {display(record.reliability_pattern_direction)}
                          </td>
                          <td style={styles.td}>
                            {display(record.dominant_workforce_event_type)}
                          </td>
                          <td style={styles.td}>
                            {display(
                              record.dominant_organizational_adaptation,
                            )}
                          </td>
                          <td style={styles.td}>
                            {display(record.consecutive_affected_windows)}
                          </td>
                        </tr>
                      ))}

                      {Array.from({
                        length: Math.max(0, 4 - fourWeekRecords.length),
                      }).map((_, index) => (
                        <tr key={`missing-week-${index}`}>
                          <th scope="row" style={styles.rowHeader}>
                            Week {fourWeekRecords.length + index + 1}
                          </th>
                          <td style={styles.td} colSpan={9}>
                            {MISSING}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title="Doctrine Boundary" quiet>
                <div style={styles.doctrine}>
                  SSI Executive Dashboard reads persisted ssi_trend_buffer
                  outputs only. Assignment logic, event logic, Trend Buffer
                  calculations, Workforce Reliability thresholds, recurrence
                  logic, and consequence interpretation remain locked upstream.
                  This page provides executive presentation only and performs no
                  recalculation.
                </div>
              </Section>
            </Layer>
          </div>
        ) : null}
      </div>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at 50% -120px, rgba(214,178,94,0.10), transparent 420px), #050505',
    color: colors.text,
    padding: '24px 24px 54px',
  },
  shell: {
    width: 'min(1240px, 100%)',
    margin: '0 auto',
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 28,
    alignItems: 'end',
    marginBottom: 14,
    padding: '18px 20px',
    border: `1px solid ${colors.line}`,
    borderRadius: 14,
    background: colors.shell,
    boxShadow: '0 18px 60px rgba(0,0,0,0.28)',
  },
  eyebrow: {
    marginBottom: 6,
    color: colors.gold,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.05,
    letterSpacing: '-0.025em',
  },
  subtitle: {
    maxWidth: 760,
    margin: '8px 0 0',
    color: colors.muted,
    fontSize: 13,
    lineHeight: 1.5,
  },
  updated: {
    minWidth: 220,
    paddingLeft: 20,
    borderLeft: `1px solid ${colors.line}`,
    textAlign: 'right',
  },
  updatedLabel: {
    display: 'block',
    marginBottom: 5,
    color: colors.goldMuted,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  updatedValue: {
    color: colors.text,
    fontSize: 13,
  },
  logoutButton: {
    marginTop: 10,
    width: '100%',
    border: `1px solid ${colors.lineStrong}`,
    borderRadius: 999,
    background: '#11100d',
    color: colors.gold,
    padding: '9px 12px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  disabledButton: {
    cursor: 'not-allowed',
    opacity: 0.58,
  },
  flowNav: {
    border: `1px solid ${colors.line}`,
    background: colors.shell,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  flowNavHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  flowNavTitle: {
    color: colors.gold,
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    fontSize: 11,
  },
  flowNavRule: {
    height: 1,
    flex: 1,
    background: colors.line,
  },
  flowNavCaption: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: 800,
  },
  flowSteps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 10,
  },
  flowStepWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  flowStep: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    color: colors.muted,
    border: `1px solid ${colors.lineSoft}`,
    background: '#11100d',
    borderRadius: 12,
    padding: '10px 12px',
    minWidth: 0,
  },
  flowStepActive: {
    border: `1px solid ${colors.lineStrong}`,
    background: 'rgba(214,178,94,0.14)',
    color: colors.text,
    boxShadow: `inset 3px 0 0 ${colors.gold}`,
  },
  flowStepIndex: {
    display: 'grid',
    placeItems: 'center',
    width: 24,
    height: 24,
    borderRadius: 999,
    background: 'rgba(214,178,94,0.16)',
    color: colors.gold,
    fontWeight: 900,
    flexShrink: 0,
  },
  flowStepText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    minWidth: 0,
  },
  flowArrow: {
    color: colors.goldMuted,
    fontWeight: 900,
    flexShrink: 0,
  },
  dashboard: {
    display: 'grid',
    gap: 12,
  },
  layer: {
    display: 'grid',
    gap: 8,
    padding: 10,
    border: `1px solid ${colors.lineSoft}`,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.012)',
  },
  layerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '2px 4px 4px',
  },
  layerTitle: {
    margin: 0,
    color: colors.goldMuted,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.17em',
    textTransform: 'uppercase',
  },
  layerRule: {
    flex: 1,
    height: 1,
    background: colors.lineSoft,
  },
  section: {
    overflow: 'hidden',
    border: `1px solid ${colors.line}`,
    borderRadius: 12,
    background: colors.panel,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    minHeight: 34,
    padding: '0 14px',
    borderBottom: `1px solid ${colors.line}`,
    background: colors.section,
  },
  sectionLine: {
    width: 3,
    height: 14,
    borderRadius: 999,
    background: colors.gold,
  },
  sectionTitle: {
    margin: 0,
    color: colors.gold,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  sectionContent: {
    padding: 10,
  },
  compactGrid5: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 6,
  },
  compactGrid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 6,
  },
  compactGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 6,
  },
  compactGrid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 6,
  },
  dataTile: {
    border: `1px solid ${colors.line}`,
    background: '#090909',
  },
  dataLabel: {
    minHeight: 29,
    display: 'flex',
    alignItems: 'center',
    padding: '7px 10px',
    color: colors.muted,
    background: colors.slate,
    fontSize: 11,
    fontWeight: 900,
  },
  dataValue: {
    minHeight: 32,
    display: 'flex',
    alignItems: 'center',
    padding: '7px 10px',
    color: colors.text,
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  dataValueStrong: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 950,
  },
  action: {
    padding: '9px 2px',
    color: colors.text,
    fontSize: 20,
    fontWeight: 900,
    lineHeight: 1.35,
  },
  missingBand: {
    padding: '8px 12px',
    color: colors.quiet,
    border: `1px dashed ${colors.line}`,
    background: 'rgba(214,178,94,0.03)',
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1.45,
    textAlign: 'center',
  },
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  primaryButton: {
    border: `1px solid ${colors.lineStrong}`,
    borderRadius: 999,
    background: colors.gold,
    color: '#080807',
    padding: '9px 16px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  secondaryButton: {
    border: `1px solid ${colors.lineStrong}`,
    borderRadius: 999,
    background: '#11100d',
    color: colors.gold,
    padding: '9px 16px',
    fontWeight: 900,
    cursor: 'pointer',
  },
  tableScroll: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  historyTable: {
    width: 'max(1500px, 100%)',
    borderCollapse: 'collapse',
    tableLayout: 'auto',
  },
  th: {
    padding: '8px 9px',
    border: `1px solid ${colors.line}`,
    color: colors.text,
    background: colors.slate,
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.035em',
    textTransform: 'uppercase',
    textAlign: 'center',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '8px 9px',
    border: `1px solid ${colors.line}`,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 1.35,
    textAlign: 'left',
    verticalAlign: 'middle',
    overflowWrap: 'anywhere',
  },
  rowHeader: {
    padding: '8px 9px',
    border: `1px solid ${colors.line}`,
    color: colors.gold,
    background: colors.section,
    fontSize: 11,
    fontWeight: 950,
    textAlign: 'left',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },
  doctrine: {
    padding: '6px 2px',
    color: colors.muted,
    fontSize: 12,
    lineHeight: 1.6,
  },
}