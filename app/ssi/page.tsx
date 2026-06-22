'use client'

import { useEffect, useMemo, useState } from 'react'
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
  created_at: string
  updated_at: string
}

type LayerTone = 'leadership' | 'evidence' | 'reference'

const MISSING = 'Not persisted in current buffer.'

const ssiFlow = [
  { label: 'Assignments', href: '/ssi/assignments', note: 'Shift-start load capture', active: false },
  { label: 'Events', href: '/ssi/events', note: 'Stability event capture', active: false },
  { label: 'Trend Buffer', href: '/ssi/dashboard', note: 'Persisted structural signals', active: false },
  { label: 'Executive Dashboard', href: '/ssi', note: 'Leadership interpretation', active: true },
  { label: 'Weekly Brief', href: '/ssi/weekly-brief', note: 'Printable executive summary', active: false },
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

function dominantForceAt(value: string[] | string, index: number) {
  if (Array.isArray(value)) return display(value[index])
  return index === 0 ? display(value) : MISSING
}

function Layer({ title, tone, children }: { title: string; tone: LayerTone; children: ReactNode }) {
  const toneStyle: CSSProperties =
    tone === 'leadership'
      ? {
          borderColor: colors.lineStrong,
          background: 'linear-gradient(180deg, rgba(214,178,94,0.045), rgba(255,255,255,0.01))',
        }
      : tone === 'evidence'
        ? { borderColor: colors.line }
        : { borderColor: colors.lineSoft, background: 'rgba(255,255,255,0.008)' }

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
        borderColor: emphasis ? colors.lineStrong : quiet ? colors.lineSoft : colors.line,
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
        <span style={{ ...styles.sectionLine, background: quiet ? colors.goldMuted : colors.gold }} />
        <h2 style={{ ...styles.sectionTitle, color: quiet ? colors.goldMuted : colors.gold }}>
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
    <div style={{ ...styles.dataTile, borderColor: quiet ? colors.lineSoft : colors.line }}>
      <div style={{ ...styles.dataLabel, background: quiet ? colors.slateSoft : colors.slate }}>
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

export default function SSIExecutiveDashboardPage() {
  const router = useRouter()

  const [authorized, setAuthorized] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [records, setRecords] = useState<TrendBufferRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    async function loadDashboard() {
      if (!authorized) return

      setLoading(true)
      setError(null)

      const { data, error: loadError } = await supabase
        .from('ssi_trend_buffer')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)

      if (loadError) {
        setError(loadError.message)
        setRecords([])
      } else {
        setRecords((data ?? []) as unknown as TrendBufferRow[])
      }

      setLoading(false)
    }

    loadDashboard()
  }, [authorized])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/ssi/login')
  }

  const latest = records[0] ?? null
  const fourWeekRecords = useMemo(() => [...records].reverse(), [records])

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

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.hero}>
          <div>
            <div style={styles.eyebrow}>TSINAXA SSI — Structural Stability Intelligence System</div>
            <h1 style={styles.title}>Executive Stability Brief</h1>
            <p style={styles.subtitle}>
              Current structural stability visibility from persisted SSI trend-buffer outputs.
            </p>
          </div>

          <div style={styles.updated}>
            <span style={styles.updatedLabel}>Latest persisted update</span>
            <strong style={styles.updatedValue}>{latest ? formatDate(latest.updated_at) : '—'}</strong>
            <button type="button" style={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

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
                <a href={item.href} style={{ ...styles.flowStep, ...(item.active ? styles.flowStepActive : {}) }}>
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

        {loading ? (
          <Section title="Executive Stability Brief">
            <MissingBand>Loading persisted SSI trend buffer...</MissingBand>
          </Section>
        ) : error ? (
          <Section title="Data Access Issue">
            <MissingBand>{error}</MissingBand>
          </Section>
        ) : !latest ? (
          <Section title="Executive Stability Brief">
            <MissingBand>No persisted ssi_trend_buffer record found.</MissingBand>
          </Section>
        ) : (
          <div style={styles.dashboard}>
            <Layer title="Leadership Layer" tone="leadership">
              <Section title="Executive Stability Brief">
                <div style={styles.compactGrid4}>
                  <Tile label="Unit" value={latest.unit} strong />
                  <Tile label="Window Start" value={latest.window_start} />
                  <Tile label="Window End" value={latest.window_end} />
                  <Tile label="Assignment Load Skew" value={skewStatus(latest.assignment_load_skew)} strong />
                </div>
              </Section>

              <Section title="Leadership Alert Panel" emphasis>
                <div style={styles.compactGrid4}>
                  <Tile label="System Trend Status" value={latest.trend_status} strong />
                  <Tile label="Stability Risk Gauge" value={latest.fragility_level} />
                  <Tile label="Buffer Cost Signal" value={latest.cost_pressure_signal} />
                  <Tile label="Critical Interpretation" value={latest.leadership_interpretation} />
                </div>
              </Section>

              <Section title="Recommended Leadership Action" emphasis>
                <div style={styles.action}>{display(latest.immediate_action_1)}</div>
              </Section>
            </Layer>

            <Layer title="Evidence Layer" tone="evidence">
              <Section title="Stability Events Summary">
                <div style={styles.compactGrid4}>
                  <Tile label="Total Events" value={latest.total_stability_events} strong />
                  <Tile label="High Intensity" value={latest.high_intensity_event_count} strong />
                  <Tile label="Late / Last Minute" value={latest.late_or_last_minute_event_count} strong />
                  <Tile label="Full Buffer" value={MISSING} quiet />
                </div>
              </Section>

              <Section title="Dominant System Force">
                <div style={styles.compactGrid4}>
                  <Tile label="Primary" value={dominantForceAt(latest.dominant_stability_forces, 0)} strong />
                  <Tile label="Secondary" value={dominantForceAt(latest.dominant_stability_forces, 1)} quiet />
                  <Tile label="Supporting Basis" value={latest.predictability_insight} />
                  <Tile label="Force Notes" value={latest.risk_outlook} />
                </div>
              </Section>

              <Section title="Role Pool Comparison">
                <div style={styles.tableScroll}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Role</th>
                        <th style={styles.th}>Current Demand (Assignments)</th>
                        <th style={styles.th}>Available Pool (Current)</th>
                        <th style={styles.th}>Load Balance (Demand / Available)</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['CNA', 'RN', 'LPN'].map((role) => (
                        <tr key={role}>
                          <th scope="row" style={styles.rowHeader}>{role}</th>
                          <td style={styles.td}>
                            {latest.most_affected_role_pool?.startsWith(role) ? latest.most_affected_role_pool : MISSING}
                          </td>
                          <td style={styles.td}>
                            {latest.most_affected_role_pool?.startsWith(role) ? latest.most_affected_shift : MISSING}
                          </td>
                          <td style={styles.td}>{MISSING}</td>
                          <td style={styles.td}>{MISSING}</td>
                          <td style={styles.td}>{MISSING}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title="Cost Pressure Monitor">
                <div style={styles.compactGrid3}>
                  <Tile label="Buffer Use Profile" value={latest.buffer_use_profile} strong />
                  <Tile label="Repeated Buffer Depletion" value={latest.repeated_buffer_depletion_flag} />
                  <Tile label="Cost Pressure Signal" value={latest.cost_pressure_signal} />
                </div>
              </Section>
            </Layer>

            <Layer title="Reference Layer" tone="reference">
              <Section title="System Trend Status" quiet>
                <MissingBand>Trend Status is displayed once in the Leadership Alert Panel to avoid duplicate presentation.</MissingBand>
              </Section>

              <Section title="Stability Cost Matrix" quiet>
                <div style={styles.compactGrid3}>
                  <Tile label="Stable + Low Cost" value="Low operational pressure." quiet />
                  <Tile label="Straining + Moderate Cost" value="Increasing buffer consumption." quiet />
                  <Tile label="Unstable + High Cost" value={latest.risk_outlook} />
                </div>
              </Section>

              <Section title="4-Week Trend View" quiet>
                <div style={styles.tableScroll}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Week</th>
                        <th style={styles.th}>Unit</th>
                        <th style={styles.th}>Window Start</th>
                        <th style={styles.th}>Window End</th>
                        <th style={styles.th}>Persisted Trend Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fourWeekRecords.map((record, index) => (
                        <tr key={record.id}>
                          <th scope="row" style={styles.rowHeader}>Week {index + 1}</th>
                          <td style={styles.td}>{display(record.unit)}</td>
                          <td style={styles.td}>{display(record.window_start)}</td>
                          <td style={styles.td}>{display(record.window_end)}</td>
                          <td style={{ ...styles.td, color: colors.text, fontWeight: 900 }}>{display(record.trend_status)}</td>
                        </tr>
                      ))}

                      {Array.from({ length: Math.max(0, 4 - fourWeekRecords.length) }).map((_, index) => (
                        <tr key={`missing-week-${index}`}>
                          <th scope="row" style={styles.rowHeader}>Week {fourWeekRecords.length + index + 1}</th>
                          <td style={styles.td} colSpan={4}>{MISSING}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title="Doctrine Boundary" quiet>
                <div style={styles.doctrine}>
                  SSI Executive Dashboard reads persisted ssi_trend_buffer outputs only.
                  Assignment logic, event logic, and trend-buffer logic remain locked upstream.
                  This page is executive visibility, not recalculation.
                </div>
              </Section>
            </Layer>
          </div>
        )}
      </div>
    </main>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% -120px, rgba(214,178,94,0.10), transparent 420px), #050505',
    color: colors.text,
    padding: '24px 24px 54px',
  },
  shell: { width: 'min(1240px, 100%)', margin: '0 auto' },
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
  eyebrow: { marginBottom: 6, color: colors.gold, fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase' },
  title: { margin: 0, fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.025em' },
  subtitle: { maxWidth: 760, margin: '8px 0 0', color: colors.muted, fontSize: 13, lineHeight: 1.5 },
  updated: { minWidth: 220, paddingLeft: 20, borderLeft: `1px solid ${colors.line}`, textAlign: 'right' },
  updatedLabel: { display: 'block', marginBottom: 5, color: colors.goldMuted, fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase' },
  updatedValue: { color: colors.text, fontSize: 13 },
  logoutButton: { marginTop: 10, width: '100%', border: `1px solid ${colors.lineStrong}`, borderRadius: 999, background: '#11100d', color: colors.gold, padding: '9px 12px', fontWeight: 900, cursor: 'pointer' },
  flowNav: { border: `1px solid ${colors.line}`, background: colors.shell, borderRadius: 14, padding: 14, marginBottom: 14 },
  flowNavHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  flowNavTitle: { color: colors.gold, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 11 },
  flowNavRule: { height: 1, flex: 1, background: colors.line },
  flowNavCaption: { color: colors.muted, fontSize: 11, fontWeight: 800 },
  flowSteps: { display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 10 },
  flowStepWrap: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 },
  flowStep: { flex: 1, display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: colors.muted, border: `1px solid ${colors.lineSoft}`, background: '#11100d', borderRadius: 12, padding: '10px 12px', minWidth: 0 },
  flowStepActive: { border: `1px solid ${colors.lineStrong}`, background: 'rgba(214,178,94,0.14)', color: colors.text, boxShadow: `inset 3px 0 0 ${colors.gold}` },
  flowStepIndex: { display: 'grid', placeItems: 'center', width: 24, height: 24, borderRadius: 999, background: 'rgba(214,178,94,0.16)', color: colors.gold, fontWeight: 900, flexShrink: 0 },
  flowStepText: { display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 },
  flowArrow: { color: colors.goldMuted, fontWeight: 900, flexShrink: 0 },
  dashboard: { display: 'grid', gap: 12 },
  layer: { display: 'grid', gap: 8, padding: 10, border: `1px solid ${colors.lineSoft}`, borderRadius: 16, background: 'rgba(255,255,255,0.012)' },
  layerHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '2px 4px 4px' },
  layerTitle: { margin: 0, color: colors.goldMuted, fontSize: 10, fontWeight: 900, letterSpacing: '0.17em', textTransform: 'uppercase' },
  layerRule: { flex: 1, height: 1, background: colors.lineSoft },
  section: { overflow: 'hidden', border: `1px solid ${colors.line}`, borderRadius: 12, background: colors.panel },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: 9, minHeight: 34, padding: '0 14px', borderBottom: `1px solid ${colors.line}`, background: colors.section },
  sectionLine: { width: 3, height: 14, borderRadius: 999, background: colors.gold },
  sectionTitle: { margin: 0, color: colors.gold, fontSize: 11, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase' },
  sectionContent: { padding: 10 },
  compactGrid4: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 },
  compactGrid3: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 },
  dataTile: { border: `1px solid ${colors.line}`, background: '#090909' },
  dataLabel: { minHeight: 29, display: 'flex', alignItems: 'center', padding: '7px 10px', color: colors.muted, background: colors.slate, fontSize: 11, fontWeight: 900 },
  dataValue: { minHeight: 32, display: 'flex', alignItems: 'center', padding: '7px 10px', color: colors.text, fontSize: 12, fontWeight: 800 },
  dataValueStrong: { color: '#ffffff', fontSize: 14, fontWeight: 950 },
  action: { padding: '9px 2px', color: colors.text, fontSize: 20, fontWeight: 900, lineHeight: 1.35 },
  missingBand: { padding: '8px 12px', color: colors.quiet, border: `1px dashed ${colors.line}`, background: 'rgba(214,178,94,0.03)', fontSize: 11, fontWeight: 800, lineHeight: 1.45, textAlign: 'center' },
  tableScroll: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
  th: { padding: '8px 9px', border: `1px solid ${colors.line}`, color: colors.text, background: colors.slate, fontSize: 10, fontWeight: 950, letterSpacing: '0.035em', textTransform: 'uppercase', textAlign: 'center', verticalAlign: 'middle' },
  td: { padding: '8px 9px', border: `1px solid ${colors.line}`, color: colors.muted, fontSize: 11, lineHeight: 1.35, textAlign: 'left', verticalAlign: 'middle' },
  rowHeader: { padding: '8px 9px', border: `1px solid ${colors.line}`, color: colors.gold, background: colors.section, fontSize: 11, fontWeight: 950, textAlign: 'left', verticalAlign: 'middle' },
  doctrine: { padding: '6px 2px', color: colors.muted, fontSize: 12, lineHeight: 1.6 },
}