'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import { supabase } from '../../lib/supabase'

type CreatedRequest = {
  id: string
  subject: string
  problem: string
  preferred_time: string | null
  grade_level: string | null
  status: string
  teacher_status: string | null
}

const instabilityClasses = [
  'FLOW',
  'COVERAGE',
  'COORDINATION',
  'OWNERSHIP',
  'EVIDENCE',
  'RECOVERY',
  'RELIABILITY',
]

const entryRoutes = [
  'HUMAN_SUBMITTED',
  'SYSTEM_DETECTED',
  'GOVERNANCE_INITIATED',
]

const severityLevels = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL']

const flowSteps = [
  {
    title: 'Instability entered',
    body: 'A visible issue is recorded with enough context for review.',
  },
  {
    title: 'Triage review',
    body: 'CGI decides whether to watch, merge, return, escalate, or accept it as a case.',
  },
  {
    title: 'Routing decision',
    body: 'The right owner, next action, urgency, and evidence need are identified.',
  },
  {
    title: 'Stability check',
    body: 'CGI checks whether the situation improved and whether recovery is holding.',
  },
]

const exampleSignals = [
  'Repeated routing delays between teams',
  'Backlog continues growing after action was taken',
  'The same handoff problem keeps returning',
  'Ownership is unclear across a site, unit, or function',
  'Recovery was reported, but improvement has not been confirmed',
]

const typicalUsers = [
  'site leads',
  'operations coordinators',
  'supervisors',
  'governance reviewers',
  'command reviewers',
]

export default function RequestPage() {
  const router = useRouter()

  const [entryRoute, setEntryRoute] = useState('HUMAN_SUBMITTED')
  const [instabilityClass, setInstabilityClass] = useState('FLOW')
  const [severity, setSeverity] = useState('MODERATE')
  const [location, setLocation] = useState('')
  const [affectedArea, setAffectedArea] = useState('')
  const [visibleIssue, setVisibleIssue] = useState('')
  const [currentOwner, setCurrentOwner] = useState('')
  const [evidenceAvailable, setEvidenceAvailable] = useState('')
  const [reviewTime, setReviewTime] = useState('')
  const [message, setMessage] = useState('')
  const [createdRequest, setCreatedRequest] =
    useState<CreatedRequest | null>(null)
  const [loading, setLoading] = useState(false)

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!location.trim()) {
      alert('Please state where the instability is happening.')
      return
    }

    if (!affectedArea.trim()) {
      alert('Please state what area, team, unit, site, or function is affected.')
      return
    }

    if (!visibleIssue.trim()) {
      alert('Please describe what has become visible.')
      return
    }

    setLoading(true)
    setMessage('Submitting visible instability for review...')
    setCreatedRequest(null)

    const problemSummary = [
      `Visible issue: ${visibleIssue.trim()}`,
      `Location: ${location.trim()}`,
      `Affected area: ${affectedArea.trim()}`,
      `Entry route: ${entryRoute}`,
      `Operational pressure type: ${instabilityClass}`,
      `Difficulty level: ${severity}`,
      `Current owner: ${currentOwner.trim() || 'Not clear yet'}`,
      `Evidence available: ${evidenceAvailable.trim() || 'Not provided yet'}`,
    ].join('\n')

    const { data, error } = await supabase
      .from('lesson_requests')
      .insert({
        subject: `${instabilityClass} — ${affectedArea.trim()}`,
        grade_level: location.trim(),
        problem: problemSummary,
        preferred_time: reviewTime.trim() || null,
        status: 'UNDER_REVIEW',
        teacher_status: 'PENDING_TRIAGE',
      })
      .select()
      .single()

    if (error || !data) {
      console.error(error)
      setMessage('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    setCreatedRequest(data)
    setMessage(
      'Visible instability submitted. CGI can now review, route, track, and confirm whether the situation is stabilizing.'
    )
    setEntryRoute('HUMAN_SUBMITTED')
    setInstabilityClass('FLOW')
    setSeverity('MODERATE')
    setLocation('')
    setAffectedArea('')
    setVisibleIssue('')
    setCurrentOwner('')
    setEvidenceAvailable('')
    setReviewTime('')
    setLoading(false)
  }

  async function copyRequestId() {
    if (!createdRequest) return
    await navigator.clipboard.writeText(createdRequest.id)
    alert('Request ID copied.')
  }

  function checkRequestStatus() {
    if (!createdRequest) return
    router.push(`/student-dashboard?lessonId=${createdRequest.id}`)
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <header style={styles.hero}>
          <p style={styles.eyebrow}>TSINAXA CGI • INSTABILITY INTAKE</p>

          <h1 style={styles.h1}>Submit Visible Instability</h1>

          <p style={styles.heroText}>
            Use this page when an operational issue has become visible and may
            need review, routing, ownership, evidence, or follow-up before it
            can be treated as stable.
          </p>
        </header>

        <section style={styles.guidanceGrid}>
          <article style={styles.guidanceCard}>
            <p style={styles.eyebrow}>When to use CGI</p>

            <h2 style={styles.h2}>Use CGI when normal handling may not be enough.</h2>

            <p style={styles.cardText}>
              CGI is intended for issues that may continue affecting operations
              unless they are reviewed, routed, tracked, or stabilized.
            </p>
          </article>

          <article style={styles.guidanceCard}>
            <p style={styles.eyebrow}>Typical users</p>

            <h2 style={styles.h2}>Who usually submits?</h2>

            <div style={styles.pillGrid}>
              {typicalUsers.map((user) => (
                <span key={user} style={styles.pill}>
                  {user}
                </span>
              ))}
            </div>
          </article>
        </section>

        <section style={styles.flowCard}>
          <p style={styles.eyebrow}>From visibility to stabilization</p>

          <h2 style={styles.h2}>CGI begins when instability becomes visible.</h2>

          <p style={styles.cardText}>
            A submission does not automatically become a case. It first enters
            review so CGI can decide whether to watch it, merge it, return it
            for clarity, escalate it, or accept it for active tracking.
          </p>

          <div style={styles.flowGrid}>
            {flowSteps.map((step, index) => (
              <article key={step.title} style={styles.flowStep}>
                <p style={styles.stepNumber}>0{index + 1}</p>

                <h3 style={styles.stepTitle}>{step.title}</h3>

                <p style={styles.stepBody}>{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.examplesCard}>
          <p style={styles.eyebrow}>Examples</p>

          <h2 style={styles.h2}>What belongs here?</h2>

          <div style={styles.exampleGrid}>
            {exampleSignals.map((example) => (
              <article key={example} style={styles.exampleItem}>
                {example}
              </article>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.eyebrow}>Instability intake</p>

          <h2 style={styles.h2}>What has become visible?</h2>

          <p style={styles.cardText}>
            Keep the description simple and practical. CGI needs to understand
            what is happening, where it is happening, what is affected, who owns
            it now, and what evidence already exists.
          </p>

          <form onSubmit={submitRequest} style={styles.form}>
            <label style={styles.label}>
              How did this enter CGI?
              <select
                value={entryRoute}
                onChange={(event) => setEntryRoute(event.target.value)}
                style={styles.input}
              >
                {entryRoutes.map((route) => (
                  <option key={route}>{route}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              What kind of operational pressure is visible?
              <select
                value={instabilityClass}
                onChange={(event) => setInstabilityClass(event.target.value)}
                style={styles.input}
              >
                {instabilityClasses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              How difficult is this becoming to manage?
              <select
                value={severity}
                onChange={(event) => setSeverity(event.target.value)}
                style={styles.input}
              >
                {severityLevels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </label>

            <label style={styles.label}>
              Where is this happening?
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Example: Site A, Unit 2, Region North, Operations Desk"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              What area is affected?
              <input
                value={affectedArea}
                onChange={(event) => setAffectedArea(event.target.value)}
                placeholder="Example: routing, staffing, handoff, backlog, recovery, coordination"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              What became visible?
              <textarea
                value={visibleIssue}
                onChange={(event) => setVisibleIssue(event.target.value)}
                placeholder="Describe the visible issue in plain language. Example: The same handoff delay has happened three times this week and the next owner is unclear."
                style={styles.textarea}
              />
            </label>

            <label style={styles.label}>
              Who owns it right now?
              <input
                value={currentOwner}
                onChange={(event) => setCurrentOwner(event.target.value)}
                placeholder="Example: unit lead, site coordinator, governance reviewer, unclear"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              What evidence is already available?
              <textarea
                value={evidenceAvailable}
                onChange={(event) => setEvidenceAvailable(event.target.value)}
                placeholder="Example: missed handoff note, delay record, backlog count, completion note, recovery update, or none yet"
                style={styles.smallTextarea}
              />
            </label>

            <label style={styles.label}>
              Preferred review time
              <input
                value={reviewTime}
                onChange={(event) => setReviewTime(event.target.value)}
                type="text"
                placeholder="Example: Today 3pm, next shift, within 24 hours"
                style={styles.input}
              />
            </label>

            <button type="submit" disabled={loading} style={styles.primaryButton}>
              {loading
                ? 'Submitting Instability...'
                : 'Submit Visible Instability'}
            </button>
          </form>

          {message && <p style={styles.message}>{message}</p>}
        </section>

        {createdRequest && (
          <section style={styles.successCard}>
            <p style={styles.eyebrow}>Instability submitted</p>

            <h2 style={styles.h2}>Save this Request ID</h2>

            <div style={styles.requestIdBox}>{createdRequest.id}</div>

            <p style={styles.smallText}>
              This ID connects the visible instability to triage, routing,
              ownership, stabilization action, evidence review, and recovery
              follow-up.
            </p>

            <div style={styles.createdGrid}>
              <CreatedDetail
                label="Operational Pressure"
                value={createdRequest.subject}
              />

              <CreatedDetail
                label="Location"
                value={createdRequest.grade_level ?? 'Not recorded'}
              />

              <CreatedDetail label="Triage Status" value={createdRequest.status} />

              <CreatedDetail
                label="Routing Status"
                value={createdRequest.teacher_status ?? 'PENDING_TRIAGE'}
              />
            </div>

            <div style={styles.buttonGrid}>
              <button
                type="button"
                onClick={copyRequestId}
                style={styles.primaryButton}
              >
                Copy Request ID
              </button>

              <button
                type="button"
                onClick={checkRequestStatus}
                style={styles.secondaryButton}
              >
                Check Review Status
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function CreatedDetail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <article style={styles.createdDetail}>
      <p style={styles.createdLabel}>{label}</p>

      <p style={styles.createdValue}>{value}</p>
    </article>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg, #111827 0%, #0f172a 48%, #020617 100%)',
    color: '#ffffff',
    padding: '56px 22px 140px',
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
  wrap: {
    width: '100%',
    maxWidth: '1060px',
    margin: '0 auto',
  },
  hero: {
    marginBottom: '28px',
  },
  eyebrow: {
    margin: '0 0 10px',
    color: '#cbd5e1',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  h1: {
    margin: 0,
    color: '#ffffff',
    fontSize: 'clamp(42px, 8vw, 72px)',
    lineHeight: 0.94,
    letterSpacing: '-0.07em',
    fontWeight: 900,
  },
  h2: {
    margin: 0,
    color: '#ffffff',
    fontSize: '28px',
    letterSpacing: '-0.04em',
    fontWeight: 900,
    lineHeight: 1.1,
  },
  heroText: {
    maxWidth: '790px',
    color: '#cbd5e1',
    fontSize: '18px',
    lineHeight: 1.68,
    marginTop: '18px',
  },
  guidanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  guidanceCard: {
    background: 'rgba(15,23,42,0.9)',
    color: '#ffffff',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '24px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
    padding: '24px',
  },
  flowCard: {
    background: 'rgba(15,23,42,0.92)',
    color: '#ffffff',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
    padding: '30px',
    marginBottom: '28px',
  },
  examplesCard: {
    background: '#020617',
    color: '#ffffff',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.3)',
    padding: '30px',
    marginBottom: '28px',
  },
  card: {
    background: '#0f172a',
    color: '#ffffff',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.36)',
    padding: '30px',
    marginBottom: '28px',
  },
  successCard: {
    background: '#0f172a',
    color: '#ffffff',
    border: '1px solid rgba(34,197,94,0.34)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.36)',
    padding: '30px',
  },
  cardText: {
    color: '#cbd5e1',
    lineHeight: 1.65,
    margin: '12px 0 0',
    maxWidth: '760px',
  },
  pillGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '18px',
  },
  pill: {
    background: '#020617',
    border: '1px solid rgba(148,163,184,0.28)',
    borderRadius: '999px',
    color: '#e2e8f0',
    padding: '9px 12px',
    fontSize: '13px',
    fontWeight: 800,
    textTransform: 'capitalize',
  },
  flowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '22px',
  },
  flowStep: {
    background: '#020617',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '170px',
  },
  stepNumber: {
    margin: 0,
    color: '#a7f3d0',
    fontWeight: 900,
    fontSize: '13px',
    letterSpacing: '0.12em',
  },
  stepTitle: {
    margin: '10px 0',
    color: '#ffffff',
    fontSize: '18px',
    lineHeight: 1.15,
  },
  stepBody: {
    margin: 0,
    color: '#cbd5e1',
    lineHeight: 1.55,
    fontSize: '14px',
  },
  exampleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '22px',
  },
  exampleItem: {
    background: '#111827',
    border: '1px solid rgba(148,163,184,0.24)',
    borderRadius: '16px',
    color: '#e2e8f0',
    padding: '14px',
    minHeight: '100px',
    fontSize: '14px',
    lineHeight: 1.45,
    fontWeight: 800,
  },
  form: {
    display: 'grid',
    gap: '16px',
    marginTop: '24px',
  },
  label: {
    display: 'grid',
    gap: '8px',
    color: '#f8fafc',
    fontWeight: 900,
    fontSize: '14px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '16px',
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '16px',
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
    minHeight: '170px',
    resize: 'vertical',
  },
  smallTextarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '16px',
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
    minHeight: '120px',
    resize: 'vertical',
  },
  primaryButton: {
    width: '100%',
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
    background: '#e2e8f0',
    color: '#020617',
  },
  secondaryButton: {
    width: '100%',
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
    background: '#a7f3d0',
    color: '#022c22',
  },
  message: {
    marginTop: '18px',
    background: 'rgba(148,163,184,0.14)',
    color: '#e2e8f0',
    padding: '16px 18px',
    borderRadius: '18px',
    fontWeight: 900,
    border: '1px solid rgba(148,163,184,0.24)',
  },
  requestIdBox: {
    marginTop: '18px',
    background: '#1e293b',
    color: '#ffffff',
    borderRadius: '18px',
    padding: '18px',
    wordBreak: 'break-word',
    fontWeight: 900,
    lineHeight: 1.5,
  },
  smallText: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    marginTop: '16px',
  },
  createdGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '18px',
  },
  createdDetail: {
    background: '#020617',
    border: '1px solid rgba(148,163,184,0.26)',
    borderRadius: '16px',
    padding: '14px',
  },
  createdLabel: {
    margin: 0,
    color: '#a7f3d0',
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  createdValue: {
    margin: '8px 0 0',
    color: '#f8fafc',
    fontWeight: 900,
    lineHeight: 1.35,
  },
  buttonGrid: {
    display: 'grid',
    gap: '12px',
    marginTop: '18px',
  },
}