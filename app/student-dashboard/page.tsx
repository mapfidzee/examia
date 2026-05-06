'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type LessonRequest = {
  id: string
  subject: string
  custom_subject?: string | null
  subject_other?: string | null
  grade_level: string | null
  problem: string
  preferred_time: string | null
  scheduled_time: string | null
  status: string
  assigned_teacher: string | null
  teacher_id?: string | null
  teacher_status?: string | null
  created_at: string | null
  started_at: string | null
  completed_at: string | null
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
    const savedLessonId =
      typeof window !== 'undefined' ? localStorage.getItem('examia_student_lesson_id') : null

    const targetLessonId = lessonIdFromUrl || savedLessonId

    if (targetLessonId) {
      setLessonId(targetLessonId)
      loadLessonById(targetLessonId)
    }
  }, [mounted, searchParams])

  if (!mounted) return null

  async function loadLessonById(id: string) {
    const cleanId = id.trim()

    if (!cleanId) {
      alert('Please enter your lesson ID.')
      return
    }

    setLoading(true)
    setMessage('Loading lesson status...')
    setLesson(null)

    const { data, error } = await supabase
      .from('lesson_requests')
      .select('*')
      .eq('id', cleanId)
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

    if (typeof window !== 'undefined') {
      localStorage.setItem('examia_student_lesson_id', cleanId)
    }
  }

  async function loadLesson() {
    await loadLessonById(lessonId)
  }

  function openLessonRoom(id: string) {
    router.push(`/lesson/${id}`)
  }

  const readiness = getReadiness(lesson)

  return (
    <main className="studentPage">
      <div className="pageShell">
        <section className="frontDoorHero">
          <div className="heroContent">
            <p className="eyebrow">EXAMIA STUDENT DASHBOARD</p>
            <h1>My Lesson Journey</h1>
            <p className="heroText">
              Track your lesson from request to teacher assignment, room access,
              active learning, and completed history.
            </p>
          </div>

          <div className="heroPanel">
            <p className="panelKicker">Student flow</p>
            <h2>Request. Match. Learn. Complete.</h2>
            <p>
              Your dashboard now acts as the front door. When your lesson is ready,
              you simply click Join Lesson.
            </p>
          </div>
        </section>

        <section className="lookupPanel">
          <div>
            <p className="sectionKicker">Find your lesson</p>
            <h2>Enter your Lesson ID</h2>
            <p className="sectionText">
              If your dashboard link includes a Lesson ID, EXAMIA loads it automatically.
              You can also paste the ID below.
            </p>
          </div>

          <div className="lookupGrid">
            <input
              value={lessonId}
              onChange={(event) => setLessonId(event.target.value)}
              placeholder="Paste your lesson ID here"
              className="input"
            />

            <button onClick={loadLesson} disabled={loading} className="loadButton">
              {loading ? 'Loading lesson...' : 'Load My Lesson'}
            </button>
          </div>
        </section>

        {message && <p className="message">{message}</p>}

        <section className="statusTiles">
          <StatusTile
            label="Lesson Status"
            value={lesson?.status || 'Not loaded'}
            tone={readiness.tone}
          />
          <StatusTile
            label="Teacher Status"
            value={lesson?.teacher_status || 'Not loaded'}
            tone="blue"
          />
          <StatusTile
            label="Teacher"
            value={lesson?.assigned_teacher || 'Not assigned'}
            tone="green"
          />
          <StatusTile
            label="Room Access"
            value={readiness.ready ? 'Ready' : 'Not ready'}
            tone={readiness.ready ? 'green' : 'amber'}
          />
        </section>

        {!lesson && (
          <section className="emptyState">
            <p className="sectionKicker">No lesson loaded</p>
            <h2>Start with your Lesson ID</h2>
            <p>
              After the lesson loads, this dashboard shows teacher assignment,
              payment status, room readiness, scheduled time, and completion history.
            </p>
          </section>
        )}

        {lesson && lesson.status !== 'COMPLETED' && (
          <ActiveLessonPanel
            lesson={lesson}
            readiness={readiness}
            openLessonRoom={openLessonRoom}
          />
        )}

        {lesson && lesson.status === 'COMPLETED' && (
          <CompletedLessonHistory lesson={lesson} />
        )}
      </div>

      <style jsx global>{`
        .studentPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.34), transparent 30%),
            radial-gradient(circle at top right, rgba(20, 184, 166, 0.18), transparent 28%),
            radial-gradient(circle at bottom, rgba(168, 85, 247, 0.14), transparent 34%),
            linear-gradient(180deg, #020617 0%, #07111f 50%, #020617 100%);
          color: #ffffff;
          padding: 18px;
        }

        .pageShell {
          max-width: 1120px;
          margin: 0 auto;
        }

        .frontDoorHero {
          display: grid;
          gap: 18px;
          margin-bottom: 18px;
          padding-top: 8px;
        }

        .heroContent,
        .heroPanel,
        .lookupPanel,
        .statusTile,
        .lessonPanel,
        .historyPanel,
        .emptyState {
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 28px;
          background: rgba(15, 23, 42, 0.92);
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
        }

        .heroContent {
          padding: 22px;
          background:
            linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(15, 23, 42, 0.94)),
            rgba(15, 23, 42, 0.92);
        }

        .heroPanel {
          padding: 20px;
          background:
            linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(15, 23, 42, 0.94)),
            rgba(15, 23, 42, 0.92);
        }

        .eyebrow,
        .sectionKicker,
        .panelKicker,
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
          font-size: clamp(42px, 10vw, 76px);
          line-height: 0.9;
          letter-spacing: -0.07em;
        }

        h2 {
          margin: 0;
          font-size: clamp(28px, 5vw, 42px);
          line-height: 1;
          letter-spacing: -0.05em;
        }

        .heroText,
        .sectionText,
        .heroPanel p:not(.panelKicker),
        .emptyState p {
          color: #dbeafe;
          line-height: 1.6;
          font-size: 15px;
        }

        .heroText {
          max-width: 760px;
          margin: 16px 0 0;
          font-size: 16px;
        }

        .heroPanel p:not(.panelKicker) {
          margin: 14px 0 0;
        }

        .lookupPanel {
          padding: 18px;
          margin-bottom: 18px;
        }

        .sectionText {
          margin: 12px 0 0;
        }

        .lookupGrid {
          display: grid;
          gap: 12px;
          margin-top: 16px;
        }

        .input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #475569;
          border-radius: 18px;
          padding: 16px;
          font-size: 16px;
          color: #0f172a;
          background: #ffffff;
          outline: none;
        }

        .loadButton,
        .roomButton {
          border: none;
          border-radius: 18px;
          padding: 16px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          min-height: 54px;
          width: 100%;
        }

        .loadButton {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        .roomButton {
          background: linear-gradient(135deg, #16a34a, #15803d);
          margin-top: 16px;
        }

        button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .message {
          background: rgba(37, 99, 235, 0.18);
          color: #dbeafe;
          padding: 14px;
          border-radius: 18px;
          border: 1px solid rgba(147, 197, 253, 0.28);
          margin-bottom: 18px;
        }

        .statusTiles {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }

        .statusTile {
          padding: 18px;
          position: relative;
          overflow: hidden;
          min-height: 118px;
        }

        .statusTile::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.3;
          pointer-events: none;
        }

        .tile-blue::before {
          background: linear-gradient(135deg, #2563eb, transparent);
        }

        .tile-amber::before {
          background: linear-gradient(135deg, #f59e0b, transparent);
        }

        .tile-green::before {
          background: linear-gradient(135deg, #16a34a, transparent);
        }

        .tile-red::before {
          background: linear-gradient(135deg, #dc2626, transparent);
        }

        .tile-purple::before {
          background: linear-gradient(135deg, #7c3aed, transparent);
        }

        .tileLabel,
        .tileValue {
          position: relative;
          z-index: 1;
        }

        .tileLabel {
          margin: 0;
          color: #dbeafe;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .tileValue {
          display: block;
          margin-top: 10px;
          font-size: 24px;
          line-height: 1.15;
          font-weight: 900;
          word-break: break-word;
        }

        .emptyState {
          padding: 20px;
        }

        .emptyState p {
          margin: 14px 0 0;
        }

        .lessonPanel,
        .historyPanel {
          padding: 16px;
          margin-bottom: 20px;
        }

        .sectionHeader {
          border-radius: 24px;
          padding: 18px;
          margin-bottom: 16px;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        .sectionHeader p {
          margin: 9px 0 0;
          color: #ffffff;
          line-height: 1.55;
        }

        .header-amber {
          background: linear-gradient(135deg, #d97706, #92400e);
        }

        .header-blue {
          background: linear-gradient(135deg, #2563eb, #1e3a8a);
        }

        .header-green {
          background: linear-gradient(135deg, #16a34a, #065f46);
        }

        .header-red {
          background: linear-gradient(135deg, #dc2626, #7f1d1d);
        }

        .header-purple {
          background: linear-gradient(135deg, #7c3aed, #4c1d95);
        }

        .problemBox {
          border-radius: 22px;
          padding: 16px;
          margin-bottom: 16px;
          background:
            linear-gradient(135deg, rgba(37, 99, 235, 0.28), rgba(15, 23, 42, 0.92)),
            rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(147, 197, 253, 0.22);
        }

        .problemBox p {
          margin: 0;
          color: #ffffff;
          line-height: 1.6;
        }

        .detailsGrid {
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

        .completedNotice {
          margin-top: 16px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(22, 163, 74, 0.16);
          border: 1px solid rgba(34, 197, 94, 0.32);
          color: #bbf7d0;
          font-weight: 800;
          line-height: 1.45;
        }

        @media (min-width: 760px) {
          .studentPage {
            padding: 28px;
          }

          .frontDoorHero {
            grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.8fr);
            align-items: stretch;
          }

          .heroContent,
          .heroPanel {
            padding: 26px;
          }

          .lookupPanel {
            padding: 22px;
          }

          .lookupGrid {
            grid-template-columns: minmax(0, 1fr) 220px;
            align-items: center;
          }

          .statusTiles {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .detailsGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </main>
  )
}

function ActiveLessonPanel({
  lesson,
  readiness,
  openLessonRoom,
}: {
  lesson: LessonRequest
  readiness: ReturnType<typeof getReadiness>
  openLessonRoom: (id: string) => void
}) {
  return (
    <section className="lessonPanel">
      <div className={`sectionHeader header-${readiness.tone}`}>
        <p className="sectionKicker">Current lesson status</p>
        <h2>{readiness.title}</h2>
        <p>{readiness.message}</p>
      </div>

      <ProblemBlock problem={lesson.problem || 'Not provided'} />

      <div className="detailsGrid">
        <Detail label="Subject" value={displaySubject(lesson)} />
        <Detail label="Grade / Level" value={lesson.grade_level || 'Not provided'} />
        <Detail label="Preferred Time" value={lesson.preferred_time || 'Not provided'} />
        <Detail label="Scheduled Time" value={formatDate(lesson.scheduled_time, 'Not scheduled')} />
        <Detail label="Assigned Teacher" value={lesson.assigned_teacher || 'Not assigned'} />
        <Detail label="Teacher Status" value={lesson.teacher_status || 'Not offered yet'} />
        <Detail label="Created At" value={formatDate(lesson.created_at)} />
        <Detail label="Started At" value={formatDate(lesson.started_at)} />
        <Detail label="Lesson ID" value={lesson.id} />
      </div>

      {readiness.ready && (
        <button className="roomButton" onClick={() => openLessonRoom(lesson.id)}>
          Join Lesson
        </button>
      )}
    </section>
  )
}

function CompletedLessonHistory({ lesson }: { lesson: LessonRequest }) {
  return (
    <section className="historyPanel">
      <div className="sectionHeader header-green">
        <p className="sectionKicker">Completed lesson history</p>
        <h2>Lesson Completed</h2>
        <p>
          This lesson is now closed. The room is no longer open for normal learning
          activity, but your learning record remains available here.
        </p>
      </div>

      <ProblemBlock problem={lesson.problem || 'Not provided'} />

      <div className="detailsGrid">
        <Detail label="Status" value="COMPLETED" />
        <Detail label="Subject" value={displaySubject(lesson)} />
        <Detail label="Grade / Level" value={lesson.grade_level || 'Not provided'} />
        <Detail label="Teacher" value={lesson.assigned_teacher || 'Not assigned'} />
        <Detail label="Preferred Time" value={lesson.preferred_time || 'Not provided'} />
        <Detail label="Scheduled Time" value={formatDate(lesson.scheduled_time, 'Not scheduled')} />
        <Detail label="Created At" value={formatDate(lesson.created_at)} />
        <Detail label="Started At" value={formatDate(effectiveStartedAt(lesson))} />
        <Detail label="Completed At" value={formatDate(effectiveCompletedAt(lesson))} />
        <Detail label="Duration" value={calculateDuration(lesson)} />
        <Detail label="Lesson ID" value={lesson.id} />
      </div>

      <div className="completedNotice">
        This completed lesson is locked and kept as part of your learning history.
      </div>
    </section>
  )
}

function LoadingFallback() {
  return (
    <main className="studentPage">
      <div className="pageShell">
        <p className="message">Loading student dashboard...</p>
      </div>
    </main>
  )
}

function ProblemBlock({ problem }: { problem: string }) {
  return (
    <div className="problemBox">
      <span className="miniLabel">Student problem</span>
      <p>{problem}</p>
    </div>
  )
}

function StatusTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'blue' | 'amber' | 'green' | 'red' | 'purple'
}) {
  return (
    <article className={`statusTile tile-${tone}`}>
      <p className="tileLabel">{label}</p>
      <strong className="tileValue">{value}</strong>
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

function displaySubject(lesson: LessonRequest) {
  if (lesson.subject === 'Other' && lesson.custom_subject) return lesson.custom_subject
  if (lesson.subject === 'Other' && lesson.subject_other) return lesson.subject_other
  return lesson.subject || 'Not provided'
}

function formatDate(value: string | null | undefined, fallback = 'Not recorded') {
  if (!value) return fallback

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleString()
}

function effectiveStartedAt(lesson: LessonRequest) {
  if (lesson.started_at) return lesson.started_at
  if (lesson.status === 'COMPLETED') return lesson.created_at
  return null
}

function effectiveCompletedAt(lesson: LessonRequest) {
  if (lesson.completed_at) return lesson.completed_at
  if (lesson.status === 'COMPLETED') return lesson.created_at
  return null
}

function calculateDuration(lesson: LessonRequest) {
  const startedAt = effectiveStartedAt(lesson)
  const completedAt = effectiveCompletedAt(lesson)

  if (!startedAt || !completedAt) return 'Not available'

  const start = new Date(startedAt).getTime()
  const end = new Date(completedAt).getTime()

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return 'Not available'
  }

  const totalMinutes = Math.round((end - start) / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes} min`
  return `${hours} hr ${minutes} min`
}

function getReadiness(lesson: LessonRequest | null): {
  ready: boolean
  title: string
  message: string
  tone: 'blue' | 'amber' | 'green' | 'red' | 'purple'
} {
  if (!lesson) {
    return {
      ready: false,
      title: 'Lesson not loaded',
      message: 'Enter your lesson ID to check your lesson status.',
      tone: 'blue',
    }
  }

  if (lesson.status === 'COMPLETED') {
    return {
      ready: false,
      title: 'Lesson completed',
      message: 'This lesson has been completed and the room is now closed for normal use.',
      tone: 'green',
    }
  }

  if (lesson.status === 'ACTIVE') {
    return {
      ready: true,
      title: 'Lesson is active',
      message: 'Your lesson is already active. Click Join Lesson to enter the room.',
      tone: 'green',
    }
  }

  if (lesson.status === 'PAID') {
    return {
      ready: true,
      title: 'Your lesson room is ready',
      message: 'Your lesson is paid and ready. Click Join Lesson to enter the room.',
      tone: 'green',
    }
  }

  if (lesson.teacher_status === 'DECLINED') {
    return {
      ready: false,
      title: 'Teacher reassignment needed',
      message: 'The teacher declined this lesson. Admin needs to assign another teacher.',
      tone: 'red',
    }
  }

  if (lesson.status === 'MATCHED') {
    return {
      ready: false,
      title: 'Teacher matched, payment pending',
      message: 'A teacher has been matched. The lesson room opens after payment.',
      tone: 'purple',
    }
  }

  return {
    ready: false,
    title: 'Lesson not ready yet',
    message: 'This lesson is not marked as paid or active yet.',
    tone: 'amber',
  }
}