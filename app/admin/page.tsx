'use client'

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const APP_URL = 'https://examia-ten.vercel.app'

type LessonStatus = 'NEW' | 'MATCHED' | 'PAID' | 'ACTIVE' | 'COMPLETED' | string

type LessonRequest = {
  id: string
  subject: string
  custom_subject?: string | null
  subject_other?: string | null
  grade_level: string | null
  problem: string
  preferred_time: string | null
  scheduled_time: string | null
  status: LessonStatus
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

  const newRequests = useMemo(
    () => requests.filter((item) => item.status === 'NEW'),
    [requests]
  )

  const matchedRequests = useMemo(
    () => requests.filter((item) => item.status === 'MATCHED'),
    [requests]
  )

  const paidActiveRequests = useMemo(
    () => requests.filter((item) => item.status === 'PAID' || item.status === 'ACTIVE'),
    [requests]
  )

  const completedRequests = useMemo(
    () => requests.filter((item) => item.status === 'COMPLETED'),
    [requests]
  )

  const summary = useMemo(
    () => ({
      total: requests.length,
      new: newRequests.length,
      matched: matchedRequests.length,
      paidActive: paidActiveRequests.length,
      completed: completedRequests.length,
    }),
    [requests, newRequests, matchedRequests, paidActiveRequests, completedRequests]
  )

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
    if (request.subject === 'Other' && request.custom_subject) return request.custom_subject
    if (request.subject === 'Other' && request.subject_other) return request.subject_other
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

  function formatDateTime(value: string | null | undefined, fallback = 'Not recorded') {
    if (!value) return fallback

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return fallback

    return date.toLocaleString()
  }

  function effectiveStartedAt(request: LessonRequest) {
    if (request.started_at) return request.started_at
    if (request.status === 'COMPLETED') return request.created_at
    return null
  }

  function effectiveCompletedAt(request: LessonRequest) {
    if (request.completed_at) return request.completed_at
    if (request.status === 'COMPLETED') return request.created_at
    return null
  }

  function calculateDuration(request: LessonRequest) {
    const startedAt = effectiveStartedAt(request)
    const completedAt = effectiveCompletedAt(request)

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

  async function updateStatus(request: LessonRequest, newStatus: LessonStatus) {
    setStatusSavingId(request.id)

    const now = new Date().toISOString()

    const updateData: Record<string, string | null> = {
      status: newStatus,
    }

    if (newStatus === 'ACTIVE' && !request.started_at) {
      updateData.started_at = now
    }

    if (newStatus === 'COMPLETED') {
      if (!request.started_at) {
        updateData.started_at = now
      }

      if (!request.completed_at) {
        updateData.completed_at = now
      }
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
        <section className="frontDoorHero">
          <div className="heroContent">
            <p className="eyebrow">EXAMIA ADMIN COMMAND CENTER</p>
            <h1>Admin Command Center</h1>
            <p className="heroText">
              Control the full lesson lifecycle from one place: requests, teacher
              assignment, payment activation, live lesson access, and completed
              lesson history.
            </p>
          </div>

          <div className="quickLinks">
            <Link href="/admin/teachers" className="quickLink blueLink">
              Teacher Governance
            </Link>
            <Link href="/request" className="quickLink greenLink">
              Student Request
            </Link>
            <Link href="/student-dashboard" className="quickLink purpleLink">
              Student Dashboard
            </Link>
            <Link href="/teacher-dashboard" className="quickLink orangeLink">
              Teacher Dashboard
            </Link>
          </div>
        </section>

        <section className="commandTiles">
          <CommandTile label="Total Lessons" value={summary.total} tone="blue" />
          <CommandTile label="New Requests" value={summary.new} tone="amber" />
          <CommandTile label="Matched" value={summary.matched} tone="purple" />
          <CommandTile label="Paid / Active" value={summary.paidActive} tone="green" />
          <CommandTile label="Completed" value={summary.completed} tone="red" />
        </section>

        {message && <p className="message">{message}</p>}

        <div className="refreshRow">
          <button className="refreshBtn" onClick={loadAdminData}>
            Refresh Admin Command Center
          </button>
        </div>

        <OperationalSection
          kicker="Queue 1"
          title="New Requests"
          description="These lesson requests need teacher assignment and scheduling."
          tone="amber"
          requests={newRequests}
          emptyText="No new lesson requests right now."
          teachers={teachers}
          selectedTeachers={selectedTeachers}
          timeInputs={timeInputs}
          savingId={savingId}
          statusSavingId={statusSavingId}
          displaySubject={displaySubject}
          teacherLabel={teacherLabel}
          formatDateTime={formatDateTime}
          setSelectedTeachers={setSelectedTeachers}
          setTimeInputs={setTimeInputs}
          saveAssignment={saveAssignment}
          updateStatus={updateStatus}
          copyLink={copyLink}
        />

        <OperationalSection
          kicker="Queue 2"
          title="Matched / Offered Lessons"
          description="These lessons have been matched or offered and may be waiting for teacher response, payment, or final activation."
          tone="purple"
          requests={matchedRequests}
          emptyText="No matched lessons waiting right now."
          teachers={teachers}
          selectedTeachers={selectedTeachers}
          timeInputs={timeInputs}
          savingId={savingId}
          statusSavingId={statusSavingId}
          displaySubject={displaySubject}
          teacherLabel={teacherLabel}
          formatDateTime={formatDateTime}
          setSelectedTeachers={setSelectedTeachers}
          setTimeInputs={setTimeInputs}
          saveAssignment={saveAssignment}
          updateStatus={updateStatus}
          copyLink={copyLink}
        />

        <OperationalSection
          kicker="Queue 3"
          title="Paid / Active Lessons"
          description="These lessons are paid or active. Admin can open the room, mark active, or complete the lesson after teaching."
          tone="green"
          requests={paidActiveRequests}
          emptyText="No paid or active lessons right now."
          teachers={teachers}
          selectedTeachers={selectedTeachers}
          timeInputs={timeInputs}
          savingId={savingId}
          statusSavingId={statusSavingId}
          displaySubject={displaySubject}
          teacherLabel={teacherLabel}
          formatDateTime={formatDateTime}
          setSelectedTeachers={setSelectedTeachers}
          setTimeInputs={setTimeInputs}
          saveAssignment={saveAssignment}
          updateStatus={updateStatus}
          copyLink={copyLink}
        />

        <CompletedHistorySection
          requests={completedRequests}
          displaySubject={displaySubject}
          formatDateTime={formatDateTime}
          effectiveStartedAt={effectiveStartedAt}
          effectiveCompletedAt={effectiveCompletedAt}
          calculateDuration={calculateDuration}
          copyLink={copyLink}
        />
      </div>

      <style jsx global>{`
        .adminPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.32), transparent 30%),
            radial-gradient(circle at top right, rgba(20, 184, 166, 0.18), transparent 28%),
            radial-gradient(circle at bottom, rgba(168, 85, 247, 0.14), transparent 34%),
            linear-gradient(180deg, #020617 0%, #07111f 50%, #020617 100%);
          color: #ffffff;
          padding: 18px;
        }

        .pageShell {
          max-width: 1220px;
          margin: 0 auto;
        }

        .frontDoorHero {
          display: grid;
          gap: 18px;
          margin-bottom: 18px;
          padding-top: 8px;
        }

        .heroContent,
        .sectionShell,
        .lessonCard,
        .historyCard,
        .commandTile {
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

        h3 {
          margin: 0;
          font-size: 24px;
          letter-spacing: -0.03em;
        }

        .heroText {
          max-width: 780px;
          margin: 16px 0 0;
          color: #dbeafe;
          line-height: 1.6;
          font-size: 16px;
        }

        .quickLinks {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        .quickLink {
          text-decoration: none;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.18);
          padding: 15px 16px;
          border-radius: 18px;
          font-weight: 900;
          text-align: center;
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.24);
        }

        .blueLink {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        .greenLink {
          background: linear-gradient(135deg, #16a34a, #15803d);
        }

        .purpleLink {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
        }

        .orangeLink {
          background: linear-gradient(135deg, #f97316, #ea580c);
        }

        .commandTiles {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }

        .commandTile {
          padding: 18px;
          position: relative;
          overflow: hidden;
          min-height: 120px;
        }

        .commandTile::before {
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

        .tile-purple::before {
          background: linear-gradient(135deg, #7c3aed, transparent);
        }

        .tile-green::before {
          background: linear-gradient(135deg, #16a34a, transparent);
        }

        .tile-red::before {
          background: linear-gradient(135deg, #dc2626, transparent);
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
          font-size: 44px;
          line-height: 1;
          font-weight: 900;
        }

        .message {
          background: rgba(37, 99, 235, 0.18);
          color: #dbeafe;
          padding: 14px;
          border-radius: 18px;
          border: 1px solid rgba(147, 197, 253, 0.28);
          margin-bottom: 18px;
        }

        .refreshRow {
          display: grid;
          margin-bottom: 18px;
        }

        .refreshBtn {
          border: none;
          border-radius: 18px;
          padding: 15px 16px;
          background: #ffffff;
          color: #0f172a;
          font-weight: 900;
          cursor: pointer;
          min-height: 52px;
        }

        .sectionShell {
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

        .header-purple {
          background: linear-gradient(135deg, #7c3aed, #4c1d95);
        }

        .header-green {
          background: linear-gradient(135deg, #16a34a, #065f46);
        }

        .header-red {
          background: linear-gradient(135deg, #dc2626, #7f1d1d);
        }

        .lessonList,
        .historyList {
          display: grid;
          gap: 14px;
        }

        .lessonCard,
        .historyCard {
          padding: 16px;
        }

        .lessonTop {
          display: grid;
          gap: 12px;
          padding-bottom: 14px;
          margin-bottom: 14px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        }

        .statusBadge {
          width: fit-content;
          border-radius: 999px;
          padding: 8px 13px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          font-size: 12px;
          font-weight: 900;
        }

        .status-NEW {
          background: #f59e0b;
          color: #111827;
        }

        .status-MATCHED {
          background: #7c3aed;
          color: #ffffff;
        }

        .status-PAID {
          background: #22c55e;
          color: #052e16;
        }

        .status-ACTIVE {
          background: #14b8a6;
          color: #042f2e;
        }

        .status-COMPLETED {
          background: #ef4444;
          color: #ffffff;
        }

        .infoGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }

        .infoItem {
          background: rgba(2, 6, 23, 0.72);
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 18px;
          padding: 13px;
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
          border-radius: 20px;
          background: rgba(30, 41, 59, 0.68);
          border: 1px solid rgba(148, 163, 184, 0.18);
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
          border-radius: 15px;
          padding: 13px;
          background: #ffffff;
          color: #0f172a;
          font-size: 15px;
        }

        .primaryBtn,
        .actionBtn {
          border: none;
          border-radius: 16px;
          padding: 15px 16px;
          color: #ffffff;
          font-weight: 900;
          cursor: pointer;
          min-height: 52px;
          width: 100%;
        }

        .primaryBtn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .actionsGrid,
        .historyActions {
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

        .directLinks a,
        .historyActions a {
          color: #dbeafe;
          text-decoration: none;
          border: 1px solid rgba(147, 197, 253, 0.28);
          background: rgba(37, 99, 235, 0.14);
          border-radius: 16px;
          padding: 13px;
          text-align: center;
          font-weight: 900;
        }

        .completedNotice {
          margin-top: 14px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(220, 38, 38, 0.16);
          border: 1px solid rgba(248, 113, 113, 0.32);
          color: #fecaca;
          font-weight: 800;
          line-height: 1.45;
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
          .adminPage {
            padding: 28px;
          }

          .frontDoorHero {
            grid-template-columns: minmax(0, 1.5fr) 270px;
            align-items: start;
          }

          .heroContent {
            padding: 26px;
          }

          .commandTiles {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }

          .lessonTop {
            grid-template-columns: 1fr auto;
            align-items: start;
          }

          .infoGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .assignmentBox {
            grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.8fr) 220px;
            align-items: end;
          }

          .actionsGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .historyActions,
          .directLinks {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </main>
  )
}

function CommandTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'blue' | 'amber' | 'purple' | 'green' | 'red'
}) {
  return (
    <article className={`commandTile tile-${tone}`}>
      <p className="tileLabel">{label}</p>
      <strong className="tileValue">{value}</strong>
    </article>
  )
}

function OperationalSection({
  kicker,
  title,
  description,
  tone,
  requests,
  emptyText,
  teachers,
  selectedTeachers,
  timeInputs,
  savingId,
  statusSavingId,
  displaySubject,
  teacherLabel,
  formatDateTime,
  setSelectedTeachers,
  setTimeInputs,
  saveAssignment,
  updateStatus,
  copyLink,
}: {
  kicker: string
  title: string
  description: string
  tone: 'amber' | 'purple' | 'green'
  requests: LessonRequest[]
  emptyText: string
  teachers: TeacherProfile[]
  selectedTeachers: Record<string, string>
  timeInputs: Record<string, string>
  savingId: string | null
  statusSavingId: string | null
  displaySubject: (request: LessonRequest) => string
  teacherLabel: (teacher: TeacherProfile) => string
  formatDateTime: (value: string | null | undefined, fallback?: string) => string
  setSelectedTeachers: Dispatch<SetStateAction<Record<string, string>>>
  setTimeInputs: Dispatch<SetStateAction<Record<string, string>>>
  saveAssignment: (request: LessonRequest) => void
  updateStatus: (request: LessonRequest, newStatus: LessonStatus) => void
  copyLink: (link: string, label: string) => void
}) {
  return (
    <section className="sectionShell">
      <div className={`sectionHeader header-${tone}`}>
        <p className="sectionKicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {requests.length === 0 ? (
        <p className="emptyBox">{emptyText}</p>
      ) : (
        <div className="lessonList">
          {requests.map((request) => {
            const lessonRoomLink = `${APP_URL}/lesson/${request.id}`
            const studentDashboardLink = `${APP_URL}/student-dashboard?lessonId=${request.id}`

            return (
              <article className="lessonCard" key={request.id}>
                <div className="lessonTop">
                  <div>
                    <p className="miniLabel">Operational lesson record</p>
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
                  <Info label="Scheduled Time" value={formatDateTime(request.scheduled_time, 'Not scheduled')} />
                  <Info label="Assigned Teacher" value={request.assigned_teacher || 'Not assigned'} />
                  <Info label="Teacher Status" value={request.teacher_status || 'Not offered yet'} />
                  <Info label="Created At" value={formatDateTime(request.created_at)} />
                  <Info label="Started At" value={formatDateTime(request.started_at)} />
                  <Info label="Lesson ID" value={request.id} />
                </div>

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
                    {savingId === request.id ? 'Saving...' : 'Offer Lesson'}
                  </button>
                </div>

                <div className="actionsGrid">
                  <ActionButton
                    label="Mark MATCHED"
                    color="#7c3aed"
                    disabled={statusSavingId === request.id}
                    onClick={() => updateStatus(request, 'MATCHED')}
                  />

                  <ActionButton
                    label="Mark PAID"
                    color="#16a34a"
                    disabled={statusSavingId === request.id}
                    onClick={() => updateStatus(request, 'PAID')}
                  />

                  <ActionButton
                    label="Mark ACTIVE / Start"
                    color="#14b8a6"
                    disabled={statusSavingId === request.id}
                    onClick={() => updateStatus(request, 'ACTIVE')}
                  />

                  <ActionButton
                    label="Mark COMPLETED"
                    color="#dc2626"
                    disabled={statusSavingId === request.id}
                    onClick={() => updateStatus(request, 'COMPLETED')}
                  />

                  <ActionButton
                    label="Copy Lesson Room"
                    color="#2563eb"
                    disabled={false}
                    onClick={() => copyLink(lessonRoomLink, 'Lesson room link')}
                  />

                  <ActionButton
                    label="Copy Student Dashboard"
                    color="#0891b2"
                    disabled={false}
                    onClick={() => copyLink(studentDashboardLink, 'Student dashboard link')}
                  />
                </div>

                <div className="directLinks">
                  <a href={lessonRoomLink} target="_blank" rel="noreferrer">
                    Open Lesson Room
                  </a>

                  <a href={studentDashboardLink} target="_blank" rel="noreferrer">
                    Open Student Dashboard
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function CompletedHistorySection({
  requests,
  displaySubject,
  formatDateTime,
  effectiveStartedAt,
  effectiveCompletedAt,
  calculateDuration,
  copyLink,
}: {
  requests: LessonRequest[]
  displaySubject: (request: LessonRequest) => string
  formatDateTime: (value: string | null | undefined, fallback?: string) => string
  effectiveStartedAt: (request: LessonRequest) => string | null
  effectiveCompletedAt: (request: LessonRequest) => string | null
  calculateDuration: (request: LessonRequest) => string
  copyLink: (link: string, label: string) => void
}) {
  return (
    <section className="sectionShell">
      <div className="sectionHeader header-red">
        <p className="sectionKicker">Locked records</p>
        <h2>Completed Lesson History</h2>
        <p>
          These lessons are closed. They remain visible for history, tracking,
          payment justification, and future progress records.
        </p>
      </div>

      {requests.length === 0 ? (
        <p className="emptyBox">No completed lessons yet.</p>
      ) : (
        <div className="historyList">
          {requests.map((request) => {
            const lessonRoomLink = `${APP_URL}/lesson/${request.id}`
            const studentDashboardLink = `${APP_URL}/student-dashboard?lessonId=${request.id}`

            return (
              <article className="historyCard" key={request.id}>
                <div className="lessonTop">
                  <div>
                    <p className="miniLabel">Completed lesson record</p>
                    <h3>{displaySubject(request)}</h3>
                  </div>

                  <span className="statusBadge status-COMPLETED">COMPLETED</span>
                </div>

                <div className="infoGrid">
                  <Info label="Subject" value={displaySubject(request)} />
                  <Info label="Grade / Level" value={request.grade_level || 'Not provided'} />
                  <Info label="Problem" value={request.problem || 'Not provided'} />
                  <Info label="Assigned Teacher" value={request.assigned_teacher || 'Not assigned'} />
                  <Info label="Teacher Status" value={request.teacher_status || 'Not offered yet'} />
                  <Info label="Created At" value={formatDateTime(request.created_at)} />
                  <Info label="Started At" value={formatDateTime(effectiveStartedAt(request))} />
                  <Info label="Completed At" value={formatDateTime(effectiveCompletedAt(request))} />
                  <Info label="Duration" value={calculateDuration(request)} />
                  <Info label="Lesson ID" value={request.id} />
                </div>

                <div className="completedNotice">
                  This lesson is completed and locked. No assignment or status action
                  is shown here because this is now a historical record.
                </div>

                <div className="historyActions">
                  <ActionButton
                    label="Copy Lesson Room"
                    color="#2563eb"
                    disabled={false}
                    onClick={() => copyLink(lessonRoomLink, 'Lesson room link')}
                  />

                  <ActionButton
                    label="Copy Student Dashboard"
                    color="#0891b2"
                    disabled={false}
                    onClick={() => copyLink(studentDashboardLink, 'Student dashboard link')}
                  />

                  <a href={lessonRoomLink} target="_blank" rel="noreferrer">
                    Open Lesson Room
                  </a>

                  <a href={studentDashboardLink} target="_blank" rel="noreferrer">
                    Open Student Dashboard
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
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
      className="actionBtn"
      disabled={disabled}
      onClick={onClick}
      style={{ background: color }}
    >
      {label}
    </button>
  )
}