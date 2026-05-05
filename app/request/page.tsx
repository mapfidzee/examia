'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type CreatedLesson = {
  id: string
  subject: string
  problem: string
  preferred_time: string | null
  grade_level: string | null
  status: string
  teacher_status: string | null
}

export default function RequestPage() {
  const router = useRouter()

  const [subject, setSubject] = useState('Mathematics')
  const [otherSubject, setOtherSubject] = useState('')
  const [gradeLevel, setGradeLevel] = useState('')
  const [problem, setProblem] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [message, setMessage] = useState('')
  const [createdLesson, setCreatedLesson] = useState<CreatedLesson | null>(null)
  const [loading, setLoading] = useState(false)

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const finalSubject = subject === 'Other' ? otherSubject.trim() : subject

    if (!finalSubject) {
      alert('Please enter the subject.')
      return
    }

    if (!gradeLevel.trim()) {
      alert('Please select the grade or level.')
      return
    }

    if (!problem.trim()) {
      alert('Please describe the learning problem.')
      return
    }

    setLoading(true)
    setMessage('Submitting request...')
    setCreatedLesson(null)

    const { data, error } = await supabase
      .from('lesson_requests')
      .insert({
        subject: finalSubject,
        grade_level: gradeLevel,
        problem: problem.trim(),
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

    setCreatedLesson(data)
    setMessage('Lesson created. Payment is required before teacher assignment and lesson access.')
    setSubject('Mathematics')
    setOtherSubject('')
    setGradeLevel('')
    setProblem('')
    setPreferredTime('')
    setLoading(false)
  }

  async function copyLessonId() {
    if (!createdLesson) return
    await navigator.clipboard.writeText(createdLesson.id)
    alert('Lesson ID copied.')
  }

  function checkLessonStatus() {
    if (!createdLesson) return
    router.push(`/student-dashboard?lessonId=${createdLesson.id}`)
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <header style={styles.hero}>
          <p style={styles.eyebrow}>EXAMIA STUDENT REQUEST</p>
          <h1 style={styles.h1}>Request a Lesson</h1>
          <p style={styles.heroText}>
            Submit your learning problem. EXAMIA will create a Lesson ID
            immediately so you can track teacher assignment and room readiness.
          </p>
        </header>

        <section style={styles.card}>
          <p style={styles.eyebrow}>Lesson details</p>
          <h2 style={styles.h2}>Tell us what you need help with</h2>

          <form onSubmit={submitRequest} style={styles.form}>
            <label style={styles.label}>
              Subject
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                style={styles.input}
              >
                <option>Mathematics</option>
                <option>English</option>
                <option>General Paper</option>
                <option>Science</option>
                <option>History</option>
                <option>Shona</option>
                <option>Physics</option>
                <option>Biology</option>
                <option>Chemistry</option>
                <option>Accounting</option>
                <option>Economics</option>
                <option>Other</option>
              </select>
            </label>

            {subject === 'Other' && (
              <label style={styles.label}>
                Type Subject
                <input
                  value={otherSubject}
                  onChange={(event) => setOtherSubject(event.target.value)}
                  placeholder="Example: Commerce, Geography, Divinity"
                  style={styles.input}
                />
              </label>
            )}

            <label style={styles.label}>
              Grade / Level
              <select
                value={gradeLevel}
                onChange={(event) => setGradeLevel(event.target.value)}
                style={styles.input}
              >
                <option value="">Select grade or level...</option>
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
                <option>Adult Learner</option>
                <option>Other</option>
              </select>
            </label>

            <label style={styles.label}>
              What is the problem?
              <textarea
                value={problem}
                onChange={(event) => setProblem(event.target.value)}
                placeholder="Describe where the student is struggling."
                style={styles.textarea}
              />
            </label>

            <label style={styles.label}>
              Preferred Time
              <input
                value={preferredTime}
                onChange={(event) => setPreferredTime(event.target.value)}
                type="text"
                placeholder="Example: Today 5pm"
                style={styles.input}
              />
            </label>

            <button type="submit" disabled={loading} style={styles.whiteButton}>
              {loading ? 'Submitting Request...' : 'Submit Lesson Request'}
            </button>
          </form>

          {message && <p style={styles.message}>{message}</p>}
        </section>

        {createdLesson && (
          <section style={styles.successCard}>
            <p style={styles.eyebrow}>Lesson created</p>
            <h2 style={styles.h2}>Save your Lesson ID</h2>

            <div style={styles.lessonIdBox}>{createdLesson.id}</div>

            <p style={styles.smallText}>
              This ID is how the student checks payment status, teacher
              assignment, teacher acceptance, and lesson room readiness.
            </p>

            <div style={styles.buttonGrid}>
              <button type="button" onClick={copyLessonId} style={styles.whiteButton}>
                Copy Lesson ID
              </button>

              <button type="button" onClick={checkLessonStatus} style={styles.greenButton}>
                Check Lesson Status
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg, #062b6f 0%, #0b3b8f 50%, #031b45 100%)',
    color: '#ffffff',
    padding: '72px 22px 140px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
  wrap: {
    width: '100%',
    maxWidth: '980px',
    margin: '0 auto',
  },
  hero: {
    marginBottom: '34px',
  },
  eyebrow: {
    margin: '0 0 10px',
    color: '#dbeafe',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
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
    maxWidth: '760px',
    color: '#dbeafe',
    fontSize: '18px',
    lineHeight: 1.68,
    marginTop: '18px',
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
    boxSizing: 'border-box' as const,
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
    boxSizing: 'border-box' as const,
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '16px',
    color: '#0f172a',
    background: '#ffffff',
    outline: 'none',
    minHeight: '170px',
    resize: 'vertical' as const,
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
  lessonIdBox: {
    marginTop: '18px',
    background: '#1e293b',
    color: '#ffffff',
    borderRadius: '18px',
    padding: '18px',
    wordBreak: 'break-word' as const,
    fontWeight: 900,
    lineHeight: 1.5,
  },
  smallText: {
    color: '#dbeafe',
    lineHeight: 1.6,
    marginTop: '16px',
  },
  buttonGrid: {
    display: 'grid',
    gap: '12px',
    marginTop: '18px',
  },
}