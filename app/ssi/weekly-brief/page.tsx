'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

type TrendRecord = Record<string, any>

const missing = 'Not persisted in current buffer.'
const allowedRoles = ['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']
const allowedStatuses = ['ACTIVE']

const ssiFlow = [
  { label: 'Assignments', href: '/ssi/assignments', note: 'Shift-start load capture', active: false },
  { label: 'Events', href: '/ssi/events', note: 'Stability event capture', active: false },
  { label: 'Trend Buffer', href: '/ssi/dashboard', note: 'Persisted structural signals', active: false },
  { label: 'Executive Dashboard', href: '/ssi', note: 'Leadership interpretation', active: false },
  { label: 'Weekly Brief', href: '/ssi/weekly-brief', note: 'Printable executive summary', active: true },
]

function formatBool(value: unknown) {
  return value === true ? 'Yes' : value === false ? 'No' : missing
}

function formatValue(value: unknown, fallback = missing) {
  if (value === undefined || value === null) return fallback
  if (Array.isArray(value)) return value.length ? value.join(', ') : fallback
  const text = String(value).trim()
  return text ? text : fallback
}

export default function SSIWeeklyBriefPage() {
  const router = useRouter()
  const briefRef = useRef<HTMLElement | null>(null)

  const [authorized, setAuthorized] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [unit, setUnit] = useState('Wing B')
  const [weekStart, setWeekStart] = useState('2026-03-01')
  const [weekEnd, setWeekEnd] = useState('2026-03-07')
  const [record, setRecord] = useState<TrendRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [hideControlsForPrint, setHideControlsForPrint] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let alive = true

    async function verifyAccess() {
      setCheckingAccess(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!alive) return

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

      if (!alive) return

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

    return () => {
      alive = false
    }
  }, [router])

  useEffect(() => {
    function beforePrint() {
      setHideControlsForPrint(true)
    }

    function afterPrint() {
      setHideControlsForPrint(false)
    }

    window.addEventListener('beforeprint', beforePrint)
    window.addEventListener('afterprint', afterPrint)

    return () => {
      window.removeEventListener('beforeprint', beforePrint)
      window.removeEventListener('afterprint', afterPrint)
    }
  }, [])

  const get = (keys: string[], fallback = missing) => {
    if (!record) return fallback

    for (const key of keys) {
      const value = record[key]
      const formatted = formatValue(value, '')
      if (formatted) return formatted
    }

    return fallback
  }

  const reportingStart = get(['window_start'], weekStart)
  const reportingEnd = get(['window_end'], weekEnd)
  const stabilityStatus = get(['trend_status', 'stability_status'], missing)
  const stabilityScore = get(['stability_score'], missing)

  const structuralSignals = useMemo(
    () => [
      `Total structural events recorded: ${get(['total_stability_events'])}`,
      `High-intensity events observed: ${get(['high_intensity_event_count'])}`,
      `Late or last-minute events observed: ${get(['late_or_last_minute_event_count'])}`,
      `Assignment load skew: ${get(['assignment_load_skew'])}`,
    ],
    [record],
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/ssi/login')
  }

  async function loadBrief() {
    if (!unit || !weekStart || !weekEnd) {
      setMessage('Enter Unit, Week Start, and Week End.')
      return
    }

    setLoading(true)
    setMessage('')
    setRecord(null)

    const { data, error } = await supabase
      .from('ssi_trend_buffer')
      .select('*')
      .eq('unit', unit)
      .eq('window_start', weekStart)
      .eq('window_end', weekEnd)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    if (!data) {
      setMessage('No persisted SSI trend-buffer record found for this unit and reporting period.')
      return
    }

    setRecord(data)
  }

  function printBrief() {
    setHideControlsForPrint(true)
    setTimeout(() => {
      window.print()
      setHideControlsForPrint(false)
    }, 50)
  }

  async function downloadPdf() {
    if (!briefRef.current || !record) return

    setDownloading(true)
    setMessage('Preparing PDF download...')

    try {
      const html2canvas = (await import('html2canvas')).default
      const { jsPDF } = await import('jspdf')

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

      pdf.save(`TSINAXA-Weekly-Stability-Brief-${unit}-${weekStart}-to-${weekEnd}.pdf`)
      setMessage('PDF downloaded.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PDF download failed.')
    }

    setDownloading(false)
  }

  if (checkingAccess || !authorized) {
    return (
      <main style={styles.page}>
        <section style={styles.controls}>
          <p style={styles.eyebrow}>TSINAXA SSI • SECURE ACCESS</p>
          <h1 style={styles.title}>Verifying SSI Access</h1>
          <p style={styles.sub}>Checking authorized structural stability access...</p>
        </section>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <section style={{ ...styles.controls, display: hideControlsForPrint ? 'none' : 'block' }}>
        <div style={styles.topbar}>
          <div>
            <p style={styles.eyebrow}>TSINAXA SSI — Structural Stability Intelligence System</p>
            <h1 style={styles.title}>Weekly Stability Brief</h1>
            <p style={styles.sub}>
              Executive interpretation generated exclusively from persisted ssi_trend_buffer intelligence.
            </p>
          </div>

          <button type="button" style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
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

        <div style={styles.grid}>
          <Input label="Unit" value={unit} onChange={setUnit} placeholder="Wing B" />
          <Input label="Week Start" value={weekStart} onChange={setWeekStart} placeholder="2026-03-01" />
          <Input label="Week End" value={weekEnd} onChange={setWeekEnd} placeholder="2026-03-07" />
        </div>

        <div style={styles.actions}>
          <button type="button" onClick={loadBrief} disabled={loading || !unit || !weekStart || !weekEnd} style={styles.button}>
            {loading ? 'Loading...' : 'Generate Brief'}
          </button>

          <button type="button" onClick={printBrief} disabled={!record} style={styles.button}>
            Print
          </button>

          <button type="button" onClick={downloadPdf} disabled={!record || downloading} style={styles.button}>
            {downloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>

        {message ? <p style={styles.message}>{message}</p> : null}
      </section>

      {record ? (
        <article style={styles.brief} ref={briefRef}>
          <header style={styles.header}>
            <p style={styles.eyebrow}>TSINAXA — Weekly Stability Brief</p>
            <h2 style={styles.heading}>Structural Stability Intelligence System</h2>
            <p style={styles.text}><strong>Unit:</strong> {get(['unit'], unit)}</p>
            <p style={styles.text}><strong>Reporting Period:</strong> {reportingStart} – {reportingEnd}</p>
            <p style={styles.text}><strong>Prepared by:</strong> TSINAXA</p>
          </header>

          <BriefSection title="Overall System Status">
            <p style={styles.text}><strong>Stability Status:</strong> {stabilityStatus}</p>
            <p style={styles.text}><strong>Stability Score:</strong> {stabilityScore === missing ? missing : `${stabilityScore}%`}</p>
          </BriefSection>

          <BriefSection title="Key Structural Signals">
            <ul style={styles.list}>
              {structuralSignals.map((signal) => <li key={signal}>{signal}</li>)}
            </ul>
          </BriefSection>

          <BriefSection title="Predictability Insight">
            <p style={styles.text}>{get(['predictability_insight'])}</p>
          </BriefSection>

          <BriefSection title="Fragility Focus">
            <p style={styles.text}><strong>Most affected role pool:</strong> {get(['most_affected_role_pool'])}</p>
            <p style={styles.text}><strong>Most affected shift:</strong> {get(['most_affected_shift'])}</p>
            <p style={styles.text}><strong>Fragility level:</strong> {get(['fragility_level'])}</p>
          </BriefSection>

          <BriefSection title="Cost Pressure Signal">
            <p style={styles.text}>{get(['cost_pressure_signal', 'buffer_use_profile'])}</p>
            <p style={styles.text}>
              <strong>Repeated buffer depletion:</strong>{' '}
              {record.repeated_buffer_depletion_flag === undefined
                ? missing
                : formatBool(record.repeated_buffer_depletion_flag)}
            </p>
          </BriefSection>

          <BriefSection title="Leadership Interpretation">
            <p style={styles.text}>{get(['leadership_interpretation', 'leadership_action_cue'])}</p>
          </BriefSection>

          <BriefSection title="Recommended Action">
            <h4 style={styles.smallHeading}>Immediate</h4>
            <ul style={styles.list}>
              <li>{get(['immediate_action_1'])}</li>
              <li>{get(['immediate_action_2'])}</li>
            </ul>

            <h4 style={styles.smallHeading}>Short-Term</h4>
            <ul style={styles.list}>
              <li>{get(['short_term_action_1'])}</li>
              <li>{get(['short_term_action_2'])}</li>
            </ul>
          </BriefSection>

          <BriefSection title="Risk Outlook">
            <p style={styles.text}>If current patterns persist, {get(['risk_outlook'])}</p>
          </BriefSection>

          <BriefSection title="Action Log (System Memory)">
            <p style={styles.text}>
              <strong>Last action taken:</strong>{' '}
              {get(['last_action_taken'], 'No leadership action persisted for this reporting period.')}
            </p>
            <p style={styles.text}>
              <strong>Observed outcome:</strong>{' '}
              {get(['observed_outcome'], 'No observed outcome persisted for this reporting period.')}
            </p>
          </BriefSection>

          <footer style={styles.footer}>No Names. No Blame. No Surveillance. Only Structural Signals.</footer>
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

function BriefSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={styles.briefSection}>
      <h3 style={styles.sectionTitle}>{title}</h3>
      {children}
    </section>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#050505',
    color: '#fff8e7',
    padding: '32px',
    fontFamily: 'Inter, Arial, sans-serif',
  },
  controls: {
    maxWidth: '980px',
    margin: '0 auto 24px',
    padding: '28px',
    borderRadius: '22px',
    background: '#090807',
    border: '1px solid rgba(214,178,94,0.28)',
  },
  brief: {
    maxWidth: '980px',
    margin: '0 auto 24px',
    padding: '28px',
    borderRadius: '22px',
    background: '#070707',
    border: '1px solid rgba(214,178,94,0.28)',
  },
  topbar: {
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
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  title: {
    color: '#d6b25e',
    margin: '8px 0',
    fontSize: '34px',
  },
  heading: {
    color: '#d6b25e',
    margin: '6px 0 12px',
  },
  smallHeading: {
    color: '#d6b25e',
    margin: '12px 0 6px',
    fontSize: '14px',
  },
  sub: {
    color: '#cfc7b5',
    margin: 0,
    lineHeight: 1.6,
  },
  flowNav: {
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#090807',
    borderRadius: '20px',
    padding: '16px',
    margin: '22px 0 8px',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '14px',
    marginTop: '24px',
  },
  label: {
    display: 'grid',
    gap: '8px',
    fontSize: '13px',
    color: '#cfc7b5',
  },
  input: {
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid rgba(214,178,94,0.28)',
    background: '#111827',
    color: '#fff8e7',
    fontSize: '15px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  button: {
    padding: '12px 20px',
    border: 0,
    borderRadius: '999px',
    background: '#d6b25e',
    color: '#050505',
    fontWeight: 800,
    cursor: 'pointer',
  },
  message: {
    marginTop: '16px',
    color: '#d6b25e',
  },
  header: {
    marginBottom: '20px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(214,178,94,0.28)',
  },
  briefSection: {
    marginBottom: '16px',
    padding: '20px',
    borderRadius: '18px',
    background: '#11100d',
    border: '1px solid rgba(214,178,94,0.18)',
  },
  sectionTitle: {
    color: '#d6b25e',
    margin: '0 0 10px',
    fontSize: '16px',
  },
  text: {
    color: '#cfc7b5',
    lineHeight: 1.6,
  },
  list: {
    color: '#cfc7b5',
    paddingLeft: '20px',
    margin: '8px 0 0',
    lineHeight: 1.6,
  },
  footer: {
    marginTop: '28px',
    textAlign: 'center',
    color: '#d6b25e',
    fontWeight: 800,
  },
}