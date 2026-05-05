'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type TeacherProfile = {
  id: string
  full_name: string
  email: string
  subjects: string[] | null
  status: string
}

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
  created_at: string
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #062b6f 0%, #0b3b8f 50%, #031b45 100%)',
    color: '#ffffff',
    padding: '72px 22px 140px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
  wrap: { width: '100%', maxWidth: '1120px', margin: '0 auto' },
  hero: { display: 'grid', gap: '24px', marginBottom: '34px' },
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
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
    background: '#22c55e',
    color: '#052e16',
  },
  redButton: {
    width: '100%',
    border: 'none',
    borderRadius: '18px',
    padding: '18px',
    fontSize: '15px',
    fontWeight: 900,
    cursor: 'pointer',
    background: '#dc2626',
    color: '#ffffff',
  },
  message: {
    background: 'rgba(34,197,94,0.16)',
    color: '#bbf7d0',
    padding: '16px 18px',
    borderRadius: '18px',
    fontWeight: 900,
    marginBottom: '24px',
    border: '1px solid rgba(34,197,94,0.24)',
  },
  warning: {
    background: 'rgba(245,158,11,0.16)',
    color: '#fde68a',
    padding: '16px 18px',
    borderRadius: '18px',
    fontWeight: 900,
    border: '1px solid rgba(245,158,11,0.28)',
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
}

export default function TeacherDashboardPage() {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [teacherEmail, setTeacherEmail] = useState('')
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [lessons, setLessons] = useState<LessonRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  async function findTeacher() {
    if (!teacherEmail.trim()) {
      alert('Please enter your teacher email.')
      return
    }

    setLoading(true)
    setMessage('')
    setTeacher(null)
    setLessons([])

    const { data: teacherData, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('email', teacherEmail.trim().toLowerCase())
      .single()

    if (teacherError || !teacherData) {
      console.error(teacherError)
      alert('Teacher profile not found.')
      setLoading(false)
      return
    }

    if (teacherData.status !== 'APPROVED') {
      setTeacher(teacherData)
      setMessage('Your teacher profile is not approved yet.')
      setLoading(false)
      return
    }

    const { data: lessonData, error: lessonError } = await supabase
      .from('lesson_requests')
      .select('*')
      .eq('teacher_id', teacherData.id)
      .order('created_at', { ascending: false })

    if (lessonError) {
      console.error(lessonError)
      alert('Could not load your assigned lessons.')
      setLoading(false)
      return
    }

    setTeacher(teacherData)
    setLessons(lessonData || [])
    setLoading(false)
  }

  async function updateLessonStatus(
    lessonId: string,
    status: 'ACCEPTED' | 'DECLINED'
  ) {
    setMessage(`Updating lesson as ${status}...`)

    const { error } = await supabase
      .from('lesson_requests')
      .update({ teacher_status: status })
      .eq('id', lessonId)

    if (error) {
      console.error(error)
      alert('Could not update lesson status.')
      setMessage('')
      return
    }

    setMessage(`Lesson marked as ${status}.`)
    await findTeacher()
  }

  function openLessonRoom(lessonId: string) {
    router.push(`/lesson/${lessonId}`)
  }

  const offeredLessons = lessons.filter((lesson) => lesson.teacher_status === 'OFFERED')
  const acceptedLessons = lessons.filter((lesson) => lesson.teacher_status === 'ACCEPTED')
  const declinedLessons = lessons.filter((lesson) => lesson.teacher_status === 'DECLINED')

  return (
    <main style={styles.page}>
      <div style={styles.wrap}>
        <header style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>EXAMIA TEACHER DASHBOARD</p>
            <h1 style={styles.h1}>Teacher Control Center</h1>
            <p style={{ color: '#dbeafe', fontSize: '18px', lineHeight: 1.68, marginTop: '18px' }}>
              Review lesson offers, accept sessions you can deliver, and open lesson rooms only after payment is confirmed.
            </p>
          </div>

          <div style={{ ...styles.card, padding: '24px', display: 'grid', gap: '14px' }}>
            <MiniStat label="Active Role" value="Approved Teacher" />
            <MiniStat label="Workflow" value="Offer → Accept → Payment → Teach" />
            <MiniStat label="Room Rule" value="PAID + ACCEPTED only" />
          </div>
        </header>

        <section style={{ ...styles.panel, display: 'grid', gap: '24px' }}>
          <div>
            <p style={styles.eyebrow}>Teacher access</p>
            <h2 style={styles.h2}>Load your lesson workspace</h2>
            <p style={{ color: '#dbeafe', lineHeight: 1.6, marginTop: '12px' }}>
              Enter the email used in your approved EXAMIA teacher profile.
            </p>
          </div>

          <input
            type="email"
            value={teacherEmail}
            onChange={(event) => setTeacherEmail(event.target.value)}
            placeholder="teacher@example.com"
            style={styles.input}
          />

          <button onClick={findTeacher} disabled={loading} style={styles.whiteButton}>
            {loading ? 'Loading lessons...' : 'Load My Lessons'}
          </button>
        </section>

        {message && <p style={styles.message}>{message}</p>}

        {teacher && (
          <section style={{ ...styles.card, padding: '26px', marginBottom: '28px' }}>
            <p style={styles.eyebrow}>Teacher profile</p>
            <h2 style={styles.h2}>{teacher.full_name}</h2>
            <p style={{ color: '#bfdbfe', marginTop: '8px' }}>{teacher.email}</p>

            <p style={{ color: '#dbeafe', marginTop: '14px', lineHeight: 1.6 }}>
              <strong>Subjects:</strong>{' '}
              {teacher.subjects && teacher.subjects.length > 0
                ? teacher.subjects.join(', ')
                : 'Not listed'}
            </p>

            <span
              style={{
                display: 'inline-block',
                marginTop: '14px',
                borderRadius: '999px',
                padding: '8px 13px',
                background: 'rgba(34,197,94,0.15)',
                color: '#bbf7d0',
                fontWeight: 900,
                border: '1px solid rgba(34,197,94,0.28)',
              }}
            >
              {teacher.status}
            </span>
          </section>
        )}

        {teacher && teacher.status === 'APPROVED' && (
          <>
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '14px',
                marginBottom: '28px',
              }}
            >
              <BigStat title="Offered" value={offeredLessons.length} color="#60a5fa" />
              <BigStat title="Accepted" value={acceptedLessons.length} color="#22c55e" />
              <BigStat title="Declined" value={declinedLessons.length} color="#ef4444" />
            </section>

            <LessonSection
              title="New Lesson Offers"
              description="Accept only the lessons you can confidently support."
              lessons={offeredLessons}
              tone="blue"
              mode="offer"
              onAccept={(id) => updateLessonStatus(id, 'ACCEPTED')}
              onDecline={(id) => updateLessonStatus(id, 'DECLINED')}
              onOpenRoom={openLessonRoom}
            />

            <LessonSection
              title="Accepted Lessons"
              description="Accepted lessons appear here. The room opens only after Admin marks the lesson as PAID."
              lessons={acceptedLessons}
              tone="green"
              mode="accepted"
              onAccept={() => {}}
              onDecline={() => {}}
              onOpenRoom={openLessonRoom}
            />

            <LessonSection
              title="Declined Lessons"
              description="These lesson offers were declined."
              lessons={declinedLessons}
              tone="red"
              mode="declined"
              onAccept={() => {}}
              onDecline={() => {}}
              onOpenRoom={openLessonRoom}
            />
          </>
        )}
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

function lessonRoomReady(lesson: LessonRequest) {
  return lesson.status === 'PAID' && lesson.teacher_status === 'ACCEPTED'
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: '18px', padding: '16px' }}>
      <span style={{ display: 'block', color: '#93c5fd', fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
        {label}
      </span>
      <strong style={{ color: '#ffffff', fontSize: '18px' }}>{value}</strong>
    </div>
  )
}

function BigStat({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div style={{ ...styles.card, padding: '24px', borderTop: `5px solid ${color}` }}>
      <p style={{ margin: 0, color: '#bfdbfe', fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        {title}
      </p>
      <strong style={{ display: 'block', marginTop: '8px', fontSize: '44px', lineHeight: 1 }}>
        {value}
      </strong>
    </div>
  )
}

function LessonSection({
  title,
  description,
  lessons,
  tone,
  mode,
  onAccept,
  onDecline,
  onOpenRoom,
}: {
  title: string
  description: string
  lessons: LessonRequest[]
  tone: 'blue' | 'green' | 'red'
  mode: 'offer' | 'accepted' | 'declined'
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  onOpenRoom: (id: string) => void
}) {
  const color = tone === 'green' ? '#22c55e' : tone === 'red' ? '#ef4444' : '#60a5fa'
  const problemBg = tone === 'green' ? '#166534' : tone === 'red' ? '#7f1d1d' : '#1d4ed8'

  return (
    <section style={{ ...styles.panel, borderTop: `5px solid ${color}` }}>
      <div style={{ marginBottom: '22px' }}>
        <h2 style={styles.h2}>{title}</h2>
        <p style={{ color: '#dbeafe', lineHeight: 1.62, marginTop: '10px' }}>
          {description}
        </p>
      </div>

      {lessons.length === 0 ? (
        <p style={{ color: '#cbd5e1', background: 'rgba(15,23,42,0.75)', padding: '18px', borderRadius: '18px', margin: 0 }}>
          No lessons in this section.
        </p>
      ) : (
        <div style={{ display: 'grid', gap: '18px' }}>
          {lessons.map((lesson) => {
            const ready = lessonRoomReady(lesson)

            return (
              <article key={lesson.id} style={{ ...styles.card, padding: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '27px', letterSpacing: '-0.04em' }}>
                  {displaySubject(lesson)}
                </h3>

                <p style={{ margin: '8px 0 16px', color: '#bfdbfe' }}>
                  Lesson Status: {lesson.status}
                </p>

                <span style={{ display: 'inline-block', borderRadius: '999px', padding: '8px 13px', background: `${color}26`, border: `1px solid ${color}55`, fontSize: '12px', fontWeight: 900, marginBottom: '16px' }}>
                  Teacher Status: {lesson.teacher_status || 'Not set'}
                </span>

                <div style={{ background: problemBg, borderRadius: '18px', padding: '18px', marginBottom: '16px' }}>
                  <span style={{ display: 'block', color: '#bfdbfe', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                    Student problem
                  </span>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{lesson.problem || 'Not provided'}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  <Detail label="Subject" value={displaySubject(lesson)} />
                  <Detail label="Grade / Level" value={lesson.grade_level || 'Not provided'} />
                  <Detail label="Preferred Time" value={lesson.preferred_time || 'Not provided'} />
                  <Detail label="Scheduled Time" value={lesson.scheduled_time || 'Not scheduled'} />
                </div>

                {mode === 'offer' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <button style={styles.whiteButton} onClick={() => onAccept(lesson.id)}>
                      Accept Lesson
                    </button>

                    <button style={styles.redButton} onClick={() => onDecline(lesson.id)}>
                      Decline Lesson
                    </button>
                  </div>
                )}

                {mode === 'accepted' && ready && (
                  <button style={styles.greenButton} onClick={() => onOpenRoom(lesson.id)}>
                    Open Lesson Room
                  </button>
                )}

                {mode === 'accepted' && !ready && (
                  <div style={styles.warning}>
                    Waiting for payment confirmation. The room opens after Admin marks this lesson as PAID.
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: '16px', padding: '15px' }}>
      <span style={{ display: 'block', color: '#bfdbfe', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
        {label}
      </span>
      <p style={{ margin: 0, lineHeight: 1.6 }}>{value}</p>
    </div>
  )
}