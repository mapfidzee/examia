'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const APP_URL = 'https://examia-ten.vercel.app'

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
  started_at: string | null
  completed_at: string | null
}

type TeacherProfile = {
  id: string
  full_name: string
  email: string
  subjects: string[] | null
  grade_levels: string[] | null
  status: string
}

export default function AdminPage() {
  const [requests, setRequests] = useState<LessonRequest[]>([])
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [message, setMessage] = useState('Loading admin command center...')
  const [selectedTeachers, setSelectedTeachers] = useState<Record<string, string>>({})
  const [timeInputs, setTimeInputs] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [statusSavingId, setStatusSavingId] = useState<string | null>(null)

  useEffect(() => {
    loadAdminData()
  }, [])

  const summary = useMemo(() => {
    return {
      total: requests.length,
      new: requests.filter((item) => item.status === 'NEW').length,
      matched: requests.filter((item) => item.status === 'MATCHED').length,
      paid: requests.filter((item) => item.status === 'PAID').length,
      completed: requests.filter((item) => item.status === 'COMPLETED').length,
    }
  }, [requests])

  async function loadAdminData() {
    setMessage('Loading admin command center...')

    const { data: requestData, error: requestError } = await supabase
      .from('lesson_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (requestError) {
      setMessage('Could not load lesson requests.')
      console.error(requestError)
      return
    }

    const { data: teacherData, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('status', 'APPROVED')
      .order('full_name', { ascending: true })

    if (teacherError) {
      setMessage('Could not load approved teachers.')
      console.error(teacherError)
      return
    }

    setRequests(requestData || [])
    setTeachers(teacherData || [])
    setMessage('')

    const teacherMap: Record<string, string> = {}
    const timeMap: Record<string, string> = {}

    requestData?.forEach((request) => {
      teacherMap[request.id] = request.teacher_id || ''
      timeMap[request.id] = request.scheduled_time || ''
    })

    setSelectedTeachers(teacherMap)
    setTimeInputs(timeMap)
  }

  function displaySubject(request: LessonRequest) {
    if (request.subject === 'Other' && request.custom_subject) {
      return request.custom_subject
    }

    return request.subject || 'Not provided'
  }

  function teacherLabel(teacher: TeacherProfile) {
    const subjects =
      teacher.subjects && teacher.subjects.length > 0
        ? teacher.subjects.join(', ')
        : 'Subjects not listed'

    const levels =
      teacher.grade_levels && teacher.grade_levels.length > 0
        ? teacher.grade_levels.join(', ')
        : 'Levels not listed'

    return `${teacher.full_name} — ${subjects} — ${levels}`
  }

  function formatDateTime(value: string | null) {
    if (!value) return 'Not recorded'
    return new Date(value).toLocaleString()
  }

  function calculateDuration(startedAt: string | null, completedAt: string | null) {
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

  async function saveAssignment(request: LessonRequest) {
    const selectedTeacherId = selectedTeachers[request.id]
    const scheduledTime = timeInputs[request.id]?.trim()

    if (!selectedTeacherId) {
      alert('Please select an approved teacher.')
      return
    }

    const selectedTeacher = teachers.find((teacher) => teacher.id === selectedTeacherId)

    if (!selectedTeacher) {
      alert('Selected teacher not found.')
      return
    }

    setSavingId(request.id)

    const { error } = await supabase
      .from('lesson_requests')
      .update({
        teacher_id: selectedTeacher.id,
        assigned_teacher: selectedTeacher.full_name,
        scheduled_time: scheduledTime || null,
        teacher_status: 'OFFERED',
        status: 'MATCHED',
      })
      .eq('id', request.id)

    if (error) {
      alert('Assignment failed.')
      console.error(error)
    } else {
      await loadAdminData()
    }

    setSavingId(null)
  }

  async function updateStatus(request: LessonRequest, newStatus: string) {
    setStatusSavingId(request.id)

    const updateData: Record<string, string | null> = {
      status: newStatus,
    }

    if (newStatus === 'PAID' && !request.started_at) {
      updateData.started_at = new Date().toISOString()
    }

    if (newStatus === 'COMPLETED' && !request.completed_at) {
      updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('lesson_requests')
      .update(updateData)
      .eq('id', request.id)

    if (error) {
      alert('Status update failed.')
      console.error(error)
      setStatusSavingId(null)
      return
    }

    await loadAdminData()
    setStatusSavingId(null)
  }

  async function copyLink(link: string, label: string) {
    await navigator.clipboard.writeText(link)
    alert(`${label} copied.`)
  }

  return (
    <main className="adminPage">
      <div className="pageShell">
        <header className="hero">
          <div>
            <p className="eyebrow">EXAMIA ADMIN COMMAND CENTER</p>
            <h1>Admin Command Center</h1>
            <p className="heroText">
              Manage the full lesson lifecycle from one place: requests,
              teacher assignment, payment status, lesson room access, and
              completed lesson history.
            </p>
          </div>

          <div className="quickLinks">
            <Link href="/admin/teachers" className="quickLink">
              Teacher Approval
            </Link>
            <Link href="/request" className="quickLink">
              Student Request
            </Link>
            <Link href="/student-dashboard" className="quickLink">
              Student Dashboard
            </Link>
            <Link href="/teacher-dashboard" className="quickLink">
              Teacher Dashboard
            </Link>
          </div>
        </header>

        <section className="statsGrid">
          <StatCard label="Total Lessons" value={summary.total} />
          <StatCard label="New" value={summary.new} />
          <StatCard label="Matched" value={summary.matched} />
          <StatCard label="Paid / Active" value={summary.paid} />
          <StatCard label="Completed" value={summary.completed} />
        </section>

        {message && <p className="message">{message}</p>}

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="sectionKicker">Lesson control</p>
              <h2>All Lesson Requests</h2>
            </div>

            <button className="refreshBtn" onClick={loadAdminData}>
              Refresh
            </button>
          </div>

          {requests.length === 0 && !message && (
            <p className="emptyText">No lesson requests found yet.</p>
          )}

          <div className="lessonList">
            {requests.map((request) => {
              const lessonRoomLink = `${APP_URL}/lesson/${request.id}`
              const studentDashboardLink = `${APP_URL}/student-dashboard?lessonId=${request.id}`

              return (
                <article className="lessonCard" key={request.id}>
                  <div className="lessonTop">
                    <div>
                      <p className="smallLabel">Lesson Request</p>
                      <h3>{displaySubject(request)}</h3>
                    </div>

                    <span className={`statusBadge status-${request.status}`}>
                      {request.status || 'UNKNOWN'}
                    </span>
                  </div>

                  <div className="infoGrid">
                    <Info label="Subject" value={displaySubject(request)} />
                    <Info label="Grade / Level" value={request.grade_level || 'Not provided'} />
                    <Info label="Problem" value={request.problem || 'Not provided'} />
                    <Info label="Preferred Time" value={request.preferred_time || 'Not provided'} />
                    <Info label="Scheduled Time" value={request.scheduled_time || 'Not scheduled'} />
                    <Info label="Assigned Teacher" value={request.assigned_teacher || 'Not assigned'} />
                    <Info label="Teacher Status" value={request.teacher_status || 'Not offered yet'} />
                    <Info label="Created At" value={formatDateTime(request.created_at)} />
                    <Info label="Started At" value={formatDateTime(request.started_at)} />
                    <Info label="Completed At" value={formatDateTime(request.completed_at)} />
                    <Info
                      label="Duration"
                      value={calculateDuration(request.started_at, request.completed_at)}
                    />
                    <Info label="Lesson ID" value={request.id} />
                  </div>

                  {request.status !== 'COMPLETED' && (
                    <div className="assignmentBox">
                      <label>
                        Select approved teacher
                        <select
                          value={selectedTeachers[request.id] || ''}
                          onChange={(event) =>
                            setSelectedTeachers((prev) => ({
                              ...prev,
                              [request.id]: event.target.value,
                            }))
                          }
                        >
                          <option value="">Select approved teacher</option>

                          {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacherLabel(teacher)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Scheduled time
                        <input
                          type="text"
                          placeholder="Example: Saturday 10am"
                          value={timeInputs[request.id] || ''}
                          onChange={(event) =>
                            setTimeInputs((prev) => ({
                              ...prev,
                              [request.id]: event.target.value,
                            }))
                          }
                        />
                      </label>

                      <button
                        className="primaryBtn"
                        onClick={() => saveAssignment(request)}
                        disabled={savingId === request.id}
                      >
                        {savingId === request.id
                          ? 'Saving...'
                          : 'Offer Lesson to Teacher'}
                      </button>
                    </div>
                  )}

                  {request.status === 'COMPLETED' && (
                    <div className="completedNotice">
                      This lesson is completed and locked. It remains visible here
                      for admin history and record tracking.
                    </div>
                  )}

                  <div className="actionsGrid">
                    <ActionButton
                      label="Mark NEW"
                      color="#475569"
                      disabled={statusSavingId === request.id}
                      onClick={() => updateStatus(request, 'NEW')}
                    />

                    <ActionButton
                      label="Mark MATCHED"
                      color="#2563eb"
                      disabled={statusSavingId === request.id}
                      onClick={() => updateStatus(request, 'MATCHED')}
                    />

                    <ActionButton
                      label="Mark PAID / Start"
                      color="#16a34a"
                      disabled={statusSavingId === request.id}
                      onClick={() => updateStatus(request, 'PAID')}
                    />

                    <ActionButton
                      label="Mark COMPLETED"
                      color="#dc2626"
                      disabled={statusSavingId === request.id}
                      onClick={() => updateStatus(request, 'COMPLETED')}
                    />

                    <ActionButton
                      label="Copy Lesson Room"
                      color="#7c3aed"
                      disabled={false}
                      onClick={() => copyLink(lessonRoomLink, 'Lesson room link')}
                    />

                    <ActionButton
                      label="Copy Student Dashboard"
                      color="#0891b2"
                      disabled={false}
                      onClick={() =>
                        copyLink(studentDashboardLink, 'Student dashboard link')
                      }
                    />
                  </div>

                  <div className="directLinks">
                    <a href={lessonRoomLink} target="_blank" rel="noreferrer">
                      Open Lesson Room
                    </a>
                    <a
                      href={studentDashboardLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Student Dashboard
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>

      <style jsx>{`
        .adminPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.3), transparent 28%),
            linear-gradient(180deg, #020617 0%, #07111f 48%, #020617 100%);
          color: #ffffff;
          padding: 18px;
        }

        .pageShell {
          max-width: 1220px;
          margin: 0 auto;
        }

        .hero {
          display: grid;
          gap: 18px;
          margin-bottom: 22px;
          padding-top: 10px;
        }

        .eyebrow,
        .sectionKicker,
        .smallLabel {
          margin: 0 0 8px;
          color: #93c5fd;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(36px, 9vw, 64px);
          line-height: 0.95;
          letter-spacing: -0.06em;
        }

        h2 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.04em;
        }

        h3 {
          margin: 0;
          font-size: 25px;
          letter-spacing: -0.04em;
        }

        .heroText {
          max-width: 780px;
          margin: 14px 0 0;
          color: #dbeafe;
          line-height: 1.6;
          font-size: 15px;
        }

        .quickLinks {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .quickLink {
          text-decoration: none;
          color: #ffffff;
          background: rgba(15, 23, 42, 0.86);
          border: 1px solid rgba(148, 163, 184, 0.25);
          padding: 13px 15px;
          border-radius: 16px;
          font-weight: 900;
          text-align: center;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }

        .statCard,
        .panel,
        .lessonCard {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 24px;
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
        }

        .statCard {
          padding: 18px;
        }

        .statLabel {
          margin: 0;
          color: #bfdbfe;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .statValue {
          display: block;
          margin-top: 8px;
          font-size: 38px;
          line-height: 1;
          font-weight: 900;
        }

        .message {
          background: rgba(37, 99, 235, 0.18);
          color: #dbeafe;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid rgba(147, 197, 253, 0.28);
        }

        .panel {
          padding: 16px;
        }

        .panelHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 16px;
        }

        .refreshBtn {
          border: none;
          border-radius: 14px;
          padding: 12px 14px;
          background: #ffffff;
          color: #0f172a;
          font-weight: 900;
          cursor: pointer;
        }

        .lessonList {
          display: grid;
          gap: 16px;
        }

        .lessonCard {
          padding: 16px;
        }

        .lessonTop {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }

        .statusBadge {
          width: fit-content;
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 900;
          border: 1px solid rgba(148, 163, 184, 0.28);
          background: rgba(30, 41, 59, 0.9);
          color: #e2e8f0;
        }

        .status-NEW {
          background: rgba(71, 85, 105, 0.35);
        }

        .status-MATCHED {
          background: rgba(37, 99, 235, 0.25);
          color: #bfdbfe;
        }

        .status-PAID {
          background: rgba(22, 163, 74, 0.22);
          color: #bbf7d0;
        }

        .status-COMPLETED {
          background: rgba(220, 38, 38, 0.2);
          color: #fecaca;
        }

        .infoGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .infoItem {
          background: rgba(2, 6, 23, 0.72);
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 16px;
          padding: 12px;
          min-width: 0;
        }

        .infoLabel {
          margin: 0 0 6px;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 900;
        }

        .infoValue {
          margin: 0;
          color: #ffffff;
          line-height: 1.45;
          word-break: break-word;
          font-size: 14px;
        }

        .assignmentBox {
          display: grid;
          gap: 10px;
          margin-top: 14px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(30, 41, 59, 0.62);
          border: 1px solid rgba(148, 163, 184, 0.16);
        }

        label {
          color: #e2e8f0;
          font-size: 13px;
          font-weight: 900;
        }

        select,
        input {
          width: 100%;
          box-sizing: border-box;
          margin-top: 7px;
          border: 1px solid #475569;
          border-radius: 14px;
          padding: 13px;
          background: #ffffff;
          color: #0f172a;
          font-size: 15px;
        }

        .primaryBtn,
        .actionsGrid button {
          border: none;
          border-radius: 14px;
          padding: 13px;
          color: #ffffff;
          font-weight: 900;
          cursor: pointer;
          min-height: 48px;
        }

        .primaryBtn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .completedNotice {
          margin-top: 14px;
          padding: 14px;
          border-radius: 16px;
          background: rgba(22, 163, 74, 0.16);
          border: 1px solid rgba(34, 197, 94, 0.32);
          color: #bbf7d0;
          font-weight: 800;
          line-height: 1.45;
        }

        .actionsGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-top: 14px;
        }

        .directLinks {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-top: 12px;
        }

        .directLinks a {
          color: #dbeafe;
          text-decoration: none;
          border: 1px solid rgba(147, 197, 253, 0.28);
          background: rgba(37, 99, 235, 0.14);
          border-radius: 14px;
          padding: 12px;
          text-align: center;
          font-weight: 900;
        }

        .emptyText {
          color: #cbd5e1;
        }

        @media (min-width: 760px) {
          .adminPage {
            padding: 28px;
          }

          .hero {
            grid-template-columns: 1fr 260px;
            align-items: start;
          }

          .statsGrid {
            grid-template-columns: repeat(5, 1fr);
          }

          .lessonTop {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
          }

          .infoGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .assignmentBox {
            grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.8fr) 220px;
            align-items: end;
          }

          .actionsGrid {
            grid-template-columns: repeat(3, 1fr);
          }

          .directLinks {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="statCard">
      <p className="statLabel">{label}</p>
      <strong className="statValue">{value}</strong>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="infoItem">
      <p className="infoLabel">{label}</p>
      <p className="infoValue">{value}</p>
    </div>
  )
}

function ActionButton({
  label,
  color,
  disabled,
  onClick,
}: {
  label: string
  color: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{ background: color }}
    >
      {label}
    </button>
  )
}