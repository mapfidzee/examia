'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type LessonRequest = {
  id: string
  subject: string
  custom_subject: string | null
  grade_level: string | null
  problem: string
  preferred_time: string | null
  scheduled_time: string | null
  status: string
  assigned_teacher: string | null
  teacher_id: string | null
  teacher_status: string | null
  created_at: string | null
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #062b6f 0%, #0b3b8f 50%, #031b45 100%)',
    color: '#ffffff',
    padding: '72px 22px 140px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
  wrap: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
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
  text: {
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
    fontSize: '16px',
    fontWeight: 900,
    cursor: 'pointer',
    background: '#22c55e',
    color: '#052e16',
  },
  panel: {
    background: '#0f172a',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: '26px',
    boxShadow: '0 24px 70px rgba(0,0,0,0.36)',
    padding: '28px',
    marginBottom: '28px',
  },
  message: {
    background: 'rgba(96,165,250,0.16)',
    color: '#dbeafe',
    padding: '16px 18px',
    borderRadius: '18px',
    fontWeight: 900,
    marginBottom: '24px',
    border: '1px solid rgba(96,165,250,0.24)',
  },
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StudentDashboardContent />
    </Suspense>
  )
}

function StudentDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)
  const [lessonId, setLessonId] = useState('')
  const [lesson, setLesson] = useState<LessonRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const lessonIdFromUrl = searchParams.get('lessonId')

    if (lessonIdFromUrl) {
      setLessonId(lessonIdFromUrl)
      loadLessonById(lessonIdFromUrl)
    }
  }, [mounted, searchParams])

  if (!mounted) return null

  async function loadLessonById(id: string) {
    if (!id.trim()) {
      alert('Please enter your lesson ID.')
      return
    }

    setLoading(true)
    setMessage('Loading lesson status...')
    setLesson(null)

    const { data, error } = await supabase
      .from('lesson_requests')
      .select('*')
      .eq('id', id.trim())
      .single()

    if (error || !data) {
      console.error(error)
      alert('Lesson not found. Please check the lesson ID.')
      setMessage('')
      setLoading(false)
      return
    }

    setLesson(data)
    setMessage('')
    setLoading(false)
  }

  async function loadLesson() {
    await loadLessonById(lessonId)
  }

  function openLessonRoom(id: string) {
    router.push(`/lesson/${id}`)
  }

  const readiness = getReadiness(lesson)

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <header style={{ display: 'grid', gap: '24px', marginBottom: '34px' }}>
          <div>
            <p style={styles.eyebrow}>EXAMIA STUDENT DASHBOARD</p>
            <h1 style={styles.h1}>My Lesson Status</h1>
            <p style={{ ...styles.text, maxWidth: '760px' }}>
              Check your lesson progress, teacher assignment, grade level, and
              room readiness in one place.
            </p>
          </div>

          <div style={{ ...styles.card, padding: '24px', display: 'grid', gap: '14px' }}>
            <MiniStat label="Student Flow" value="Request → Match → Learn" />
            <MiniStat label="Room Access" value="PAID + ACCEPTED only" />
            <MiniStat label="System" value="Controlled Lesson Tracking" />
          </div>
        </header>

        <section style={{ ...styles.panel, display: 'grid', gap: '22px' }}>
          <div>
            <p style={styles.eyebrow}>Find your lesson</p>
            <h2 style={styles.h2}>Enter your Lesson ID</h2>
            <p style={{ color: '#dbeafe', lineHeight: 1.6, marginTop: '12px' }}>
              If you came from the request page, your lesson will load automatically.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            <input
              value={lessonId}
              onChange={(event) => setLessonId(event.target.value)}
              placeholder="Paste your lesson ID here"
              style={styles.input}
            />

            <button onClick={loadLesson} disabled={loading} style={styles.whiteButton}>
              {loading ? 'Loading lesson...' : 'Load My Lesson'}
            </button>
          </div>
        </section>

        {message && <p style={styles.message}>{message}</p>}

        {lesson && (
          <>
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
                marginBottom: '28px',
              }}
            >
              <StatusCard title="Payment / Lesson" value={lesson.status || 'Not set'} color="#60a5fa" />
              <StatusCard title="Teacher Status" value={lesson.teacher_status || 'PENDING'} color={readiness.color} />
              <StatusCard title="Assigned Teacher" value={lesson.assigned_teacher || 'Not assigned'} color="#22c55e" />
            </section>

            <section style={{ ...styles.panel, borderTop: `5px solid ${readiness.color}` }}>
              <div style={{ marginBottom: '22px' }}>
                <p style={styles.eyebrow}>Lesson readiness</p>
                <h2 style={styles.h2}>{readiness.title}</h2>
                <p style={{ color: '#dbeafe', lineHeight: 1.62, marginTop: '10px' }}>
                  {readiness.message}
                </p>
              </div>

              <div
                style={{
                  background: '#1d4ed8',
                  borderRadius: '18px',
                  padding: '18px',
                  marginBottom: '16px',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#bfdbfe',
                    fontSize: '12px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '8px',
                  }}
                >
                  Student problem
                </span>

                <p style={{ margin: 0, lineHeight: 1.6, color: '#ffffff' }}>
                  {lesson.problem || 'Not provided'}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '12px',
                  marginBottom: readiness.ready ? '16px' : 0,
                }}
              >
                <Detail label="Subject" value={displaySubject(lesson)} />
                <Detail label="Grade / Level" value={lesson.grade_level || 'Not provided'} />
                <Detail label="Preferred Time" value={lesson.preferred_time || 'Not provided'} />
                <Detail label="Scheduled Time" value={lesson.scheduled_time || 'Not scheduled'} />
                <Detail label="Lesson ID" value={lesson.id} />
              </div>

              {readiness.ready && (
                <button style={styles.greenButton} onClick={() => openLessonRoom(lesson.id)}>
                  Open Lesson Room
                </button>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function LoadingFallback() {
  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <p style={styles.message}>Loading student dashboard...</p>
      </div>
    </main>
  )
}

function displaySubject(lesson: LessonRequest) {
  if (lesson.subject === 'Other' && lesson.custom_subject) {
    return lesson.custom_subject
  }

  return lesson.subject || 'Not provided'
}

function getReadiness(lesson: LessonRequest | null) {
  if (!lesson) {
    return {
      ready: false,
      title: 'Lesson not loaded',
      message: 'Enter your lesson ID to check your lesson status.',
      color: '#60a5fa',
    }
  }

  const paid = lesson.status === 'PAID'
  const teacherStatus = lesson.teacher_status || 'PENDING'

  if (paid && teacherStatus === 'ACCEPTED') {
    return {
      ready: true,
      title: 'Your lesson room is ready',
      message:
        'Your teacher has accepted this lesson. You can now open the lesson room.',
      color: '#22c55e',
    }
  }

  if (paid && teacherStatus === 'OFFERED') {
    return {
      ready: false,
      title: 'Waiting for teacher acceptance',
      message:
        'Your lesson has been offered to a teacher. The room will open after the teacher accepts.',
      color: '#60a5fa',
    }
  }

  if (teacherStatus === 'DECLINED') {
    return {
      ready: false,
      title: 'Teacher reassignment needed',
      message:
        'The teacher declined this lesson. Admin needs to assign another teacher.',
      color: '#ef4444',
    }
  }

  if (!paid) {
    return {
      ready: false,
      title: 'Lesson not ready yet',
      message:
        'This lesson is not marked as paid yet. The room opens after payment and teacher acceptance.',
      color: '#f59e0b',
    }
  }

  return {
    ready: false,
    title: 'Waiting for teacher assignment',
    message:
      'Your lesson is paid, but teacher confirmation is still pending.',
    color: '#60a5fa',
  }
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: '18px',
        padding: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <span
        style={{
          display: 'block',
          color: '#93c5fd',
          fontSize: '11px',
          fontWeight: 900,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '8px',
        }}
      >
        {label}
      </span>

      <strong style={{ color: '#ffffff', fontSize: '18px' }}>{value}</strong>
    </div>
  )
}

function StatusCard({
  title,
  value,
  color,
}: {
  title: string
  value: string
  color: string
}) {
  return (
    <div style={{ ...styles.card, padding: '24px', borderTop: `5px solid ${color}` }}>
      <p
        style={{
          margin: 0,
          color: '#bfdbfe',
          fontWeight: 900,
          fontSize: '13px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}
      >
        {title}
      </p>

      <strong
        style={{
          display: 'block',
          marginTop: '8px',
          fontSize: '24px',
          lineHeight: 1.15,
          color: '#ffffff',
          wordBreak: 'break-word',
        }}
      >
        {value}
      </strong>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '15px' }}>
      <span
        style={{
          display: 'block',
          color: '#bfdbfe',
          fontSize: '12px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '8px',
        }}
      >
        {label}
      </span>

      <p style={{ margin: 0, lineHeight: 1.6, color: '#ffffff', wordBreak: 'break-word' }}>
        {value}
      </p>
    </div>
  )
}