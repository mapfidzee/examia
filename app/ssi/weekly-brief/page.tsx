'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

type TrendRecord = Record<string, any>

const missing = 'Not persisted in current buffer.'

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
  const briefRef = useRef<HTMLElement | null>(null)

  const [mounted, setMounted] = useState(false)
  const [unit, setUnit] = useState('Wing B')
  const [weekStart, setWeekStart] = useState('2026-03-01')
  const [weekEnd, setWeekEnd] = useState('2026-03-07')
  const [record, setRecord] = useState<TrendRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMounted(true)
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

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (!data) {
      setMessage('No persisted SSI trend-buffer record found for this unit and reporting period.')
      setLoading(false)
      return
    }

    setRecord(data)
    setLoading(false)
  }

  function printBrief() {
    window.print()
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
      const imageWidth = pageWidth
      const imageHeight = (canvas.height * imageWidth) / canvas.width

      let heightLeft = imageHeight
      let position = 0

      pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imageHeight
        pdf.addPage()
        pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`TSINAXA-Weekly-Stability-Brief-${unit}-${weekStart}-to-${weekEnd}.pdf`)
      setMessage('PDF downloaded.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PDF download failed.')
    }

    setDownloading(false)
  }

  if (!mounted) return null

  return (
    <main className="page">
      <section className="controls no-print">
        <p className="eyebrow">TSINAXA™ SSI</p>
        <h1>Weekly Stability Brief</h1>
        <p className="sub">
          Executive interpretation generated exclusively from persisted ssi_trend_buffer intelligence.
        </p>

        <div className="grid">
          <label>
            Unit
            <input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="Wing B" />
          </label>

          <label>
            Week Start
            <input value={weekStart} onChange={(event) => setWeekStart(event.target.value)} placeholder="2026-03-01" />
          </label>

          <label>
            Week End
            <input value={weekEnd} onChange={(event) => setWeekEnd(event.target.value)} placeholder="2026-03-07" />
          </label>
        </div>

        <div className="actions">
          <button onClick={loadBrief} disabled={loading || !unit || !weekStart || !weekEnd}>
            {loading ? 'Loading...' : 'Generate Brief'}
          </button>

          <button onClick={printBrief} disabled={!record}>
            Print
          </button>

          <button onClick={downloadPdf} disabled={!record || downloading}>
            {downloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>

        {message && <p className="message">{message}</p>}
      </section>

      {record && (
        <article className="brief" ref={briefRef}>
          <header className="header">
            <p className="eyebrow">TSINAXA™ — Weekly Stability Brief</p>
            <h2>Structural Stability Intelligence System</h2>
            <p>
              <strong>Unit:</strong> {get(['unit'], unit)}
            </p>
            <p>
              <strong>Reporting Period:</strong> {reportingStart} – {reportingEnd}
            </p>
            <p>
              <strong>Prepared by:</strong> TSINAXA
            </p>
          </header>

          <section>
            <h3>Overall System Status</h3>
            <p>
              <strong>Stability Status:</strong> {stabilityStatus}
            </p>
            <p>
              <strong>Stability Score:</strong> {stabilityScore === missing ? missing : `${stabilityScore}%`}
            </p>
          </section>

          <section>
            <h3>Key Structural Signals</h3>
            <ul>
              {structuralSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Predictability Insight</h3>
            <p>{get(['predictability_insight'])}</p>
          </section>

          <section>
            <h3>Fragility Focus</h3>
            <p>
              <strong>Most affected role pool:</strong> {get(['most_affected_role_pool'])}
            </p>
            <p>
              <strong>Most affected shift:</strong> {get(['most_affected_shift'])}
            </p>
            <p>
              <strong>Fragility level:</strong> {get(['fragility_level'])}
            </p>
          </section>

          <section>
            <h3>Cost Pressure Signal</h3>
            <p>{get(['cost_pressure_signal', 'buffer_use_profile'])}</p>
            <p>
              <strong>Repeated buffer depletion:</strong>{' '}
              {record.repeated_buffer_depletion_flag === undefined
                ? missing
                : formatBool(record.repeated_buffer_depletion_flag)}
            </p>
          </section>

          <section>
            <h3>Leadership Interpretation</h3>
            <p>{get(['leadership_interpretation', 'leadership_action_cue'])}</p>
          </section>

          <section>
            <h3>Recommended Action</h3>

            <h4>Immediate</h4>
            <ul>
              <li>{get(['immediate_action_1'])}</li>
              <li>{get(['immediate_action_2'])}</li>
            </ul>

            <h4>Short-Term</h4>
            <ul>
              <li>{get(['short_term_action_1'])}</li>
              <li>{get(['short_term_action_2'])}</li>
            </ul>
          </section>

          <section>
            <h3>Risk Outlook</h3>
            <p>If current patterns persist, {get(['risk_outlook'])}</p>
          </section>

          <section>
            <h3>Action Log (System Memory)</h3>
            <p>
              <strong>Last action taken:</strong>{' '}
              {get(['last_action_taken'], 'No leadership action persisted for this reporting period.')}
            </p>
            <p>
              <strong>Observed outcome:</strong>{' '}
              {get(['observed_outcome'], 'No leadership action persisted for this reporting period.')}
            </p>
          </section>

          <footer>No Names. No Blame. No Surveillance. Only Structural Signals.</footer>
        </article>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #050505;
          color: #fff8e7;
          padding: 32px;
          font-family: Inter, Arial, sans-serif;
        }

        .controls,
        .brief {
          max-width: 980px;
          margin: 0 auto 24px;
          padding: 28px;
          border-radius: 22px;
          background: #090807;
          border: 1px solid rgba(214, 178, 94, 0.28);
        }

        .brief {
          background: #070707;
        }

        .eyebrow {
          color: #d6b25e;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        h1,
        h2,
        h3,
        h4 {
          color: #d6b25e;
        }

        h1 {
          margin: 8px 0;
        }

        h2 {
          margin: 6px 0 12px;
        }

        h3 {
          margin: 0 0 10px;
          font-size: 16px;
        }

        h4 {
          margin: 12px 0 6px;
          font-size: 14px;
        }

        .sub,
        p,
        li,
        label {
          color: #cfc7b5;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 24px;
        }

        label {
          display: grid;
          gap: 8px;
          font-size: 13px;
        }

        input {
          padding: 14px;
          border-radius: 12px;
          border: 1px solid rgba(214, 178, 94, 0.28);
          background: #111827;
          color: #fff8e7;
          font-size: 15px;
        }

        .actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        button {
          padding: 12px 20px;
          border: 0;
          border-radius: 999px;
          background: #d6b25e;
          color: #050505;
          font-weight: 800;
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .message {
          margin-top: 16px;
          color: #d6b25e;
        }

        .header {
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(214, 178, 94, 0.28);
        }

        section {
          margin-bottom: 16px;
          padding: 20px;
          border-radius: 18px;
          background: #11100d;
          border: 1px solid rgba(214, 178, 94, 0.18);
        }

        ul {
          padding-left: 20px;
          margin: 8px 0 0;
        }

        strong {
          color: #fff8e7;
        }

        footer {
          margin-top: 28px;
          text-align: center;
          color: #d6b25e;
          font-weight: 800;
        }

        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .actions {
            flex-direction: column;
          }
        }

        @media print {
          .no-print {
            display: none;
          }

          .page,
          .brief,
          section {
            background: white;
            color: black;
          }

          .page {
            padding: 0;
          }

          .brief {
            border: none;
          }

          section {
            break-inside: avoid;
            border: 1px solid #999;
          }

          h1,
          h2,
          h3,
          h4,
          .eyebrow,
          footer,
          p,
          li,
          strong {
            color: black;
          }
        }
      `}</style>
    </main>
  )
}