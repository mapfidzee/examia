'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type LessonRequest = {
  id: string
  subject: string
  problem: string
  preferred_time: string
  scheduled_time: string | null
  status: string
  assigned_teacher: string | null
  teacher_id: string | null
  teacher_status: string | null
  created_at: string
}

type TeacherProfile = {
  id: string
  full_name: string
  email: string
  subjects: string[] | null
  grade_levels: string[] | null
  province: string | null
  spoken_languages: string[] | null
  hourly_rate: number | null
  status: string
}

export default function AdminAssignPage() {
  const [mounted, setMounted] = useState(false)
  const [lessons, setLessons] = useState<LessonRequest[]>([])
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [selectedTeacherByLesson, setSelectedTeacherByLesson] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) loadData()
  }, [mounted])

  if (!mounted) return null

  async function loadData() {
    setLoading(true)

    const { data: lessonData, error: lessonError } = await supabase
      .from('lesson_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (lessonError) {
      console.error(lessonError)
      alert('Could not load lesson requests.')
      setLoading(false)
      return
    }

    const { data: teacherData, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('status', 'APPROVED')
      .order('full_name', { ascending: true })

    if (teacherError) {
      console.error(teacherError)
      alert('Could not load approved teachers.')
      setLoading(false)
      return
    }

    setLessons(lessonData || [])
    setTeachers(teacherData || [])
    setLoading(false)
  }

  async function assignTeacher(lesson: LessonRequest) {
    const teacherId = selectedTeacherByLesson[lesson.id]

    if (!teacherId) {
      alert('Please select an approved teacher first.')
      return
    }

    const selectedTeacher = teachers.find((teacher) => teacher.id === teacherId)

    if (!selectedTeacher) {
      alert('Selected teacher was not found.')
      return
    }

    setMessage('Assigning teacher...')

    const { error } = await supabase
      .from('lesson_requests')
      .update({
        teacher_id: selectedTeacher.id,
        assigned_teacher: selectedTeacher.full_name,
        teacher_status: 'OFFERED',
      })
      .eq('id', lesson.id)

    if (error) {
      console.error(error)
      alert('Could not assign teacher.')
      setMessage('')
      return
    }

    setMessage(`Lesson offered to ${selectedTeacher.full_name}.`)
    await loadData()
  }

  function updateSelectedTeacher(lessonId: string, teacherId: string) {
    setSelectedTeacherByLesson((current) => ({
      ...current,
      [lessonId]: teacherId,
    }))
  }

  const unassignedLessons = lessons.filter((lesson) => !lesson.teacher_id)
  const offeredLessons = lessons.filter((lesson) => lesson.teacher_status === 'OFFERED')
  const acceptedLessons = lessons.filter((lesson) => lesson.teacher_status === 'ACCEPTED')
  const declinedLessons = lessons.filter((lesson) => lesson.teacher_status === 'DECLINED')

  return (
    <main className="assignPage">
      <div className="pageWrap">
        <header className="hero">
          <p className="eyebrow">EXAMIA ADMIN ASSIGNMENT</p>
          <h1>Assign Teachers to Lessons</h1>
          <p>
            Match student lesson requests with approved teachers. Once assigned,
            the lesson is offered to the teacher for acceptance.
          </p>
        </header>

        <section className="statsGrid">
          <Stat title="Unassigned" value={unassignedLessons.length} />
          <Stat title="Offered" value={offeredLessons.length} />
          <Stat title="Accepted" value={acceptedLessons.length} />
          <Stat title="Declined" value={declinedLessons.length} />
        </section>

        {message && <p className="message">{message}</p>}

        {loading ? (
          <section className="panel">
            <p>Loading assignment data...</p>
          </section>
        ) : (
          <section className="panel">
            <div className="sectionHeader">
              <h2>Lesson Requests</h2>
              <p>
                Select an approved teacher, then offer the lesson to that teacher.
              </p>
            </div>

            {lessons.length === 0 ? (
              <p className="empty">No lesson requests found.</p>
            ) : (
              <div className="lessonList">
                {lessons.map((lesson) => (
                  <article className="lessonCard" key={lesson.id}>
                    <div className="lessonTop">
                      <div>
                        <h3>{lesson.subject}</h3>
                        <p className="lessonMeta">
                          Lesson status: {lesson.status || 'Not set'} · Teacher status:{' '}
                          {lesson.teacher_status || 'Not offered'}
                        </p>
                      </div>

                      <span className="badge">
                        {lesson.teacher_status || 'UNASSIGNED'}
                      </span>
                    </div>

                    <div className="problemBox">
                      <span>Student problem</span>
                      <p>{lesson.problem}</p>
                    </div>

                    <div className="detailsGrid">
                      <Detail label="Preferred Time" value={lesson.preferred_time || 'Not provided'} />
                      <Detail label="Scheduled Time" value={lesson.scheduled_time || 'Not scheduled'} />
                      <Detail label="Assigned Teacher" value={lesson.assigned_teacher || 'None yet'} />
                    </div>

                    <div className="assignBox">
                      <label>
                        Select approved teacher
                        <select
                          value={selectedTeacherByLesson[lesson.id] || ''}
                          onChange={(event) => updateSelectedTeacher(lesson.id, event.target.value)}
                        >
                          <option value="">Choose teacher...</option>
                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.full_name} — {formatList(teacher.subjects)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button onClick={() => assignTeacher(lesson)}>
                        Offer Lesson to Teacher
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <style jsx>{`
        .assignPage {
          min-height: 100vh;
          background: #07327a;
          color: white;
          padding: 70px 20px 120px;
        }

        .pageWrap {
          width: min(100%, 1120px);
          margin: 0 auto;
        }

        .hero {
          margin-bottom: 34px;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #dbeafe;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(42px, 9vw, 72px);
          line-height: 0.92;
          letter-spacing: -0.06em;
        }

        .hero p:last-child {
          max-width: 780px;
          color: #dbeafe;
          font-size: 18px;
          line-height: 1.65;
          margin-top: 18px;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          margin-bottom: 28px;
        }

        .statCard,
        .panel,
        .lessonCard {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 24px;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
        }

        .statCard {
          padding: 22px;
        }

        .statCard p {
          margin: 0;
          color: #bfdbfe;
          font-weight: 900;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .statCard strong {
          display: block;
          margin-top: 8px;
          font-size: 42px;
          line-height: 1;
        }

        .message {
          background: rgba(34, 197, 94, 0.15);
          color: #bbf7d0;
          padding: 14px 16px;
          border-radius: 16px;
          font-weight: 900;
          margin-bottom: 20px;
        }

        .panel {
          padding: 24px;
        }

        .sectionHeader {
          margin-bottom: 18px;
        }

        .sectionHeader h2 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -0.04em;
        }

        .sectionHeader p {
          margin: 8px 0 0;
          color: #dbeafe;
          line-height: 1.55;
        }

        .lessonList {
          display: grid;
          gap: 16px;
        }

        .lessonCard {
          padding: 22px;
        }

        .lessonTop {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .lessonTop h3 {
          margin: 0;
          font-size: 26px;
          letter-spacing: -0.04em;
        }

        .lessonMeta {
          margin: 8px 0 0;
          color: #bfdbfe;
          line-height: 1.45;
        }

        .badge {
          width: fit-content;
          border-radius: 999px;
          padding: 7px 12px;
          background: rgba(96, 165, 250, 0.16);
          color: #dbeafe;
          border: 1px solid rgba(147, 197, 253, 0.3);
          font-size: 12px;
          font-weight: 900;
        }

        .problemBox {
          background: #1d4ed8;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .problemBox span {
          display: block;
          color: #dbeafe;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .problemBox p {
          margin: 0;
          line-height: 1.6;
        }

        .detailsGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .detailBox {
          background: #1e293b;
          border-radius: 16px;
          padding: 14px;
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
          color: #f8fafc;
          line-height: 1.45;
          word-break: break-word;
        }

        .assignBox {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          background: rgba(30, 41, 59, 0.75);
          border-radius: 18px;
          padding: 16px;
        }

        label {
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 900;
        }

        select {
          width: 100%;
          margin-top: 8px;
          border: none;
          border-radius: 14px;
          padding: 14px;
          font-size: 15px;
          color: #0f172a;
          background: white;
        }

        button {
          border: none;
          border-radius: 14px;
          padding: 15px 16px;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          background: white;
          color: #07327a;
        }

        .empty {
          color: #cbd5e1;
          background: rgba(15, 23, 42, 0.75);
          padding: 18px;
          border-radius: 18px;
        }

        @media (min-width: 760px) {
          .assignPage {
            padding: 80px 48px 140px;
          }

          .statsGrid {
            grid-template-columns: repeat(4, 1fr);
          }

          .lessonTop {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
          }

          .detailsGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .assignBox {
            grid-template-columns: minmax(0, 1.4fr) 240px;
            align-items: end;
          }
        }
      `}</style>
    </main>
  )
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="statCard">
      <p>{title}</p>
      <strong>{value}</strong>
    </div>
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

function formatList(value: string[] | null) {
  if (!value || value.length === 0) return 'No subjects listed'
  return value.join(', ')
}