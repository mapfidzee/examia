'use client'

import { useMemo, useState } from 'react'
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

const categoryOptions: Record<string, string[]> = {
  Education: [
    'Mathematics',
    'English',
    'Science',
    'History',
    'Shona',
    'Physics',
    'Biology',
    'Chemistry',
    'Accounting',
    'Economics',
    'General Paper',
    'Other',
  ],
  'Health Education / Outreach': [
    'Health education',
    'Community health outreach',
    'HIV education',
    'TB education',
    'Maternal health education',
    'Adolescent health education',
    'Medication adherence education',
    'Training support',
    'Other',
  ],
  'NGO / Community Program': [
    'Program training',
    'Field worker support',
    'Community mobilization',
    'Report follow-up',
    'Beneficiary support',
    'Youth program support',
    'Other',
  ],
  'Rural Operations': [
    'Skills training',
    'Agriculture support',
    'Digital literacy',
    'Community coordination',
    'Livelihood support',
    'Other',
  ],
  Other: ['Other'],
}

const flowSteps = [
  {
    title: 'Need captured',
    body: 'The system records the support need and creates a traceable Request ID.',
  },
  {
    title: 'Routing begins',
    body: 'The need can move toward governance review, priority reading, and responder assignment.',
  },
  {
    title: 'Action becomes visible',
    body: 'Intervention activity, room readiness, and completion evidence can be tracked.',
  },
  {
    title: 'Meaning reaches command',
    body: 'Unresolved needs, delays, and completion evidence can inform continuity review.',
  },
]

export default function RequestPage() {
  const router = useRouter()

  const [supportArea, setSupportArea] = useState('Education')
  const [category, setCategory] = useState('Mathematics')
  const [otherCategory, setOtherCategory] = useState('')
  const [beneficiaryLevel, setBeneficiaryLevel] = useState('')
  const [needDescription, setNeedDescription] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [message, setMessage] = useState('')
  const [createdRequest, setCreatedRequest] =
    useState<CreatedRequest | null>(null)
  const [loading, setLoading] = useState(false)

  const availableCategories = useMemo(() => {
    return categoryOptions[supportArea] || categoryOptions.Other
  }, [supportArea])

  function handleSupportAreaChange(value: string) {
    setSupportArea(value)
    setCategory(categoryOptions[value]?.[0] || 'Other')
    setOtherCategory('')
  }

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const finalCategory = category === 'Other' ? otherCategory.trim() : category

    if (!finalCategory) {
      alert('Please write the category, topic, or support area.')
      return
    }

    if (!beneficiaryLevel.trim()) {
      alert('Please select the beneficiary level.')
      return
    }

    if (!needDescription.trim()) {
      alert('Please describe the support need.')
      return
    }

    setLoading(true)
    setMessage('Submitting support request...')
    setCreatedRequest(null)

    const { data, error } = await supabase
      .from('lesson_requests')
      .insert({
        subject: `${supportArea} — ${finalCategory}`,
        grade_level: beneficiaryLevel,
        problem: needDescription.trim(),
        preferred_time: preferredTime.trim() || null,
        status: 'NEW',
        teacher_status: 'PENDING',
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
      'Support request created. EXAMIA can now route this need through governed review, responder assignment, intervention tracking, and completion evidence.'
    )
    setSupportArea('Education')
    setCategory('Mathematics')
    setOtherCategory('')
    setBeneficiaryLevel('')
    setNeedDescription('')
    setPreferredTime('')
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
          <p style={styles.eyebrow}>EXAMIA • NEED INTAKE</p>

          <h1 style={styles.h1}>Submit a Support Need</h1>

          <p style={styles.heroText}>
            Intake is the first point of continuity. A need enters the system,
            receives a Request ID, and becomes traceable through routing,
            response, evidence, and outcome review.
          </p>
        </header>

        <section style={styles.flowCard}>
          <p style={styles.eyebrow}>Intake to meaning</p>

          <h2 style={styles.h2}>A request is not just a form.</h2>

          <p style={styles.cardText}>
            It is the beginning of a governed support pathway. EXAMIA helps make
            the need visible, routeable, trackable, and reviewable.
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

        <section style={styles.card}>
          <p style={styles.eyebrow}>Need intake</p>

          <h2 style={styles.h2}>Tell us what support is needed</h2>

          <p style={styles.cardText}>
            Keep the description clear and practical. The stronger the intake,
            the easier it is to route the need, assign support, and confirm
            completion evidence.
          </p>

          <form onSubmit={submitRequest} style={styles.form}>
            <label style={styles.label}>
              Support Area
              <select
                value={supportArea}
                onChange={(event) =>
                  handleSupportAreaChange(event.target.value)
                }
                style={styles.input}
              >
                <option>Education</option>
                <option>Health Education / Outreach</option>
                <option>NGO / Community Program</option>
                <option>Rural Operations</option>
                <option>Other</option>
              </select>
            </label>

            <label style={styles.label}>
              Category / Topic
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                style={styles.input}
              >
                {availableCategories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            {category === 'Other' && (
              <label style={styles.label}>
                Write Category / Topic
                <input
                  value={otherCategory}
                  onChange={(event) => setOtherCategory(event.target.value)}
                  placeholder="Example: Geography, diabetes education, youth training, farming support"
                  style={styles.input}
                />
              </label>
            )}

            <label style={styles.label}>
              Beneficiary Level
              <select
                value={beneficiaryLevel}
                onChange={(event) => setBeneficiaryLevel(event.target.value)}
                style={styles.input}
              >
                <option value="">Select level...</option>
                <option>Grade 1</option>
                <option>Grade 2</option>
                <option>Grade 3</option>
                <option>Grade 4</option>
                <option>Grade 5</option>
                <option>Grade 6</option>
                <option>Grade 7</option>
                <option>Form 1</option>
                <option>Form 2</option>
                <option>Form 3</option>
                <option>Form 4</option>
                <option>Form 5</option>
                <option>Form 6</option>
                <option>O Level</option>
                <option>A Level</option>
                <option>College</option>
                <option>Adult Beneficiary</option>
                <option>Community Member</option>
                <option>Field Worker</option>
                <option>Parent / Caregiver</option>
                <option>Youth Group</option>
                <option>Other</option>
              </select>
            </label>

            <label style={styles.label}>
              What is the need?
              <textarea
                value={needDescription}
                onChange={(event) => setNeedDescription(event.target.value)}
                placeholder="Describe the education support need, health education need, training need, community support issue, or coordination request."
                style={styles.textarea}
              />
            </label>

            <label style={styles.label}>
              Preferred Support Time
              <input
                value={preferredTime}
                onChange={(event) => setPreferredTime(event.target.value)}
                type="text"
                placeholder="Example: Today 5pm"
                style={styles.input}
              />
            </label>

            <button type="submit" disabled={loading} style={styles.whiteButton}>
              {loading ? 'Submitting Request...' : 'Submit Support Request'}
            </button>
          </form>

          {message && <p style={styles.message}>{message}</p>}
        </section>

        {createdRequest && (
          <section style={styles.successCard}>
            <p style={styles.eyebrow}>Request created</p>

            <h2 style={styles.h2}>Save your Request ID</h2>

            <div style={styles.requestIdBox}>{createdRequest.id}</div>

            <p style={styles.smallText}>
              This ID connects the need to routing status, responder assignment,
              room readiness, intervention progress, completion evidence, and
              outcome review.
            </p>

            <div style={styles.createdGrid}>
              <CreatedDetail label="Support Area" value={createdRequest.subject} />

              <CreatedDetail
                label="Beneficiary Level"
                value={createdRequest.grade_level ?? 'Not recorded'}
              />

              <CreatedDetail label="Status" value={createdRequest.status} />

              <CreatedDetail
                label="Responder Status"
                value={createdRequest.teacher_status ?? 'PENDING'}
              />
            </div>

            <div style={styles.buttonGrid}>
              <button
                type="button"
                onClick={copyRequestId}
                style={styles.whiteButton}
              >
                Copy Request ID
              </button>

              <button
                type="button"
                onClick={checkRequestStatus}
                style={styles.greenButton}
              >
                Check Request Status
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
      'linear-gradient(135deg, #062b6f 0%, #0b3b8f 50%, #031b45 100%)',
    color: '#ffffff',
    padding: '56px 22px 140px',
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
  wrap: {
    width: '100%',
    maxWidth: '980px',
    margin: '0 auto',
  },
  hero: {
    marginBottom: '28px',
  },
  eyebrow: {
    margin: '0 0 10px',
    color: '#dbeafe',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  h1: {
    margin: 0,
    color: '#ffffff',
    fontSize: 'clamp(44px, 9vw, 76px)',
    lineHeight: 0.92,
    letterSpacing: '-0.07em',
    fontWeight: 900,
  },
  h2: {
    margin: 0,
    color: '#ffffff',
    fontSize: '30px',
    letterSpacing: '-0.04em',
    fontWeight: 900,
  },
  heroText: {
    maxWidth: '780px',
    color: '#dbeafe',
    fontSize: '18px',
    lineHeight: 1.68,
    marginTop: '18px',
  },
  flowCard: {
    background: 'rgba(15,23,42,0.86)',
    color: '#ffffff',
    border: '1px solid rgba(125,211,252,0.28)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
    padding: '30px',
    marginBottom: '28px',
  },
  card: {
    background: '#0f172a',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.36)',
    padding: '30px',
    marginBottom: '28px',
  },
  successCard: {
    background: '#0f172a',
    color: '#ffffff',
    border: '1px solid rgba(34,197,94,0.35)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.36)',
    padding: '30px',
  },
  cardText: {
    color: '#dbeafe',
    lineHeight: 1.65,
    margin: '12px 0 0',
    maxWidth: '760px',
  },
  flowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '22px',
  },
  flowStep: {
    background: '#020617',
    border: '1px solid rgba(96,165,250,0.24)',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '170px',
  },
  stepNumber: {
    margin: 0,
    color: '#67e8f9',
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
  whiteButton: {
    width: '100%',
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
    background: '#ffffff',
    color: '#07327a',
  },
  greenButton: {
    width: '100%',
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
    background: '#22c55e',
    color: '#052e16',
  },
  message: {
    marginTop: '18px',
    background: 'rgba(96,165,250,0.16)',
    color: '#dbeafe',
    padding: '16px 18px',
    borderRadius: '18px',
    fontWeight: 900,
    border: '1px solid rgba(96,165,250,0.24)',
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
    color: '#dbeafe',
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
    color: '#93c5fd',
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