'use client'

import { useEffect, useMemo, useState } from 'react'
import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import { supabase } from '../../lib/supabase'

type TimelineEvent = {
  id: string
  case_id: string
  event_type: string
  event_summary: string
  actor: string
  created_at: string
}

export default function TimelinePage() {
  return (
    <GovernanceRouteGuard allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}>
      <TimelineContent />
    </GovernanceRouteGuard>
  )
}

function TimelineContent() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Loading governed stabilization chronology...')

  useEffect(() => {
    loadTimeline()
  }, [])

  const totalEvents = events.length

  const uniqueCases = useMemo(() => {
    return new Set(events.map((event) => event.case_id)).size
  }, [events])

  const routingEvents = useMemo(() => {
    return events.filter((event) => event.event_type.includes('RESPONDER_ASSIGNED')).length
  }, [events])

  const outcomeEvents = useMemo(() => {
    return events.filter((event) => event.event_type.includes('OUTCOME')).length
  }, [events])

  async function loadTimeline() {
    setLoading(true)
    setMessage('Loading governed stabilization chronology...')

    const { data, error } = await supabase
      .from('case_timeline')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setMessage('Could not load stabilization timeline.')
      setLoading(false)
      return
    }

    setEvents(data || [])
    setMessage('')
    setLoading(false)
  }

  function formatDateTime(value: string) {
    if (!value) return 'Not recorded'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
      return 'Not recorded'
    }

    return date.toLocaleString()
  }

  function shortCaseId(caseId: string) {
    if (!caseId) return 'Unknown case'

    return caseId.slice(0, 8)
  }

  return (
    <main className="timelinePage">
      <div className="pageShell">
        <header className="hero">
          <p className="eyebrow">EXAMIA TRACEABILITY INFRASTRUCTURE</p>

          <h1>Governed Stabilization Chronology</h1>

          <p className="heroText">
            This protected timeline preserves institutional memory, continuity visibility,
            routing traceability, intervention chronology, and operational accountability
            after disruption is detected inside EXAMIA.
          </p>
        </header>

        <section className="metricsGrid">
          <Metric label="Timeline Events" value={totalEvents} />
          <Metric label="Cases With Memory" value={uniqueCases} />
          <Metric label="Routing Events" value={routingEvents} />
          <Metric label="Outcome Events" value={outcomeEvents} />
        </section>

        {message && <p className="message">{message}</p>}

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="sectionKicker">Operational memory</p>

              <h2>Timeline Events</h2>

              <p>
                Every stabilization event below strengthens institutional continuity,
                auditability, traceability, governance visibility, and operational memory.
              </p>
            </div>

            <button onClick={loadTimeline}>Refresh Timeline</button>
          </div>

          {loading ? (
            <p className="emptyBox">Loading timeline...</p>
          ) : events.length === 0 ? (
            <p className="emptyBox">No timeline events found.</p>
          ) : (
            <div className="timelineList">
              {events.map((event) => (
                <article className="timelineCard" key={event.id}>
                  <div className="timelineTop">
                    <div>
                      <p className="miniLabel">Case {shortCaseId(event.case_id)}</p>

                      <h3>{event.event_type}</h3>
                    </div>

                    <span className="timeBadge">{formatDateTime(event.created_at)}</span>
                  </div>

                  <p className="summary">{event.event_summary}</p>

                  <div className="detailGrid">
                    <Detail label="Case ID" value={event.case_id} />
                    <Detail label="Actor" value={event.actor || 'Not recorded'} />
                    <Detail label="Event ID" value={event.id} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .timelinePage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.3), transparent 30%),
            radial-gradient(circle at top right, rgba(20, 184, 166, 0.18), transparent 28%),
            linear-gradient(180deg, #020617 0%, #07111f 55%, #020617 100%);
          color: #ffffff;
          padding: 48px 18px 120px;
        }

        .pageShell {
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }

        .hero {
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 30px;
          background:
            linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(15, 23, 42, 0.96)),
            rgba(15, 23, 42, 0.92);
          padding: 26px;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.32);
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
          max-width: 900px;
          font-size: clamp(42px, 9vw, 76px);
          line-height: 0.92;
          letter-spacing: -0.06em;
        }

        h2 {
          margin: 0;
          font-size: 32px;
          letter-spacing: -0.04em;
        }

        h3 {
          margin: 0;
          font-size: 22px;
          letter-spacing: -0.03em;
          word-break: break-word;
        }

        .heroText,
        .panelHeader p {
          max-width: 900px;
          color: #dbeafe;
          line-height: 1.65;
          font-size: 16px;
          margin-top: 16px;
        }

        .metricsGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .metricCard,
        .panel,
        .timelineCard {
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
        }

        .panel {
          padding: 20px;
        }

        .panelHeader {
          display: grid;
          gap: 14px;
          margin-bottom: 18px;
        }

        button {
          border: none;
          border-radius: 16px;
          padding: 14px 16px;
          min-height: 52px;
          background: #67e8f9;
          color: #082f49;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
        }

        .timelineList {
          display: grid;
          gap: 14px;
        }

        .timelineCard {
          padding: 18px;
          background:
            linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(15, 23, 42, 0.96)),
            rgba(15, 23, 42, 0.92);
        }

        .timelineTop {
          display: grid;
          gap: 12px;
          padding-bottom: 14px;
          margin-bottom: 14px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        }

        .timeBadge {
          width: fit-content;
          border-radius: 999px;
          padding: 8px 13px;
          background: rgba(96, 165, 250, 0.16);
          color: #dbeafe;
          border: 1px solid rgba(147, 197, 253, 0.3);
          font-size: 12px;
          font-weight: 900;
        }

        .summary {
          color: #ffffff;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 14px;
        }

        .detailGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .detailBox {
          background: rgba(2, 6, 23, 0.72);
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 18px;
          padding: 13px;
          min-width: 0;
        }

        .detailBox span {
          display: block;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .detailBox p {
          margin: 0;
          color: #ffffff;
          line-height: 1.45;
          word-break: break-word;
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
          .timelinePage {
            padding: 64px 36px 140px;
          }

          .metricsGrid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .panelHeader {
            grid-template-columns: 1fr auto;
            align-items: end;
          }

          .timelineTop {
            grid-template-columns: 1fr auto;
            align-items: start;
          }

          .detailGrid {
            grid-template-columns: 1.2fr 1fr 1.2fr;
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detailBox">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  )
}