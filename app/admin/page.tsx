'use client'

import { useEffect, useState } from 'react'
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
  created_at: string
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
  const [message, setMessage] = useState('Loading requests...')
  const [selectedTeachers, setSelectedTeachers] = useState<Record<string, string>>({})
  const [timeInputs, setTimeInputs] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    loadAdminData()
  }, [])

  async function loadAdminData() {
    setMessage('Loading requests...')

    const { data: requestData, error: requestError } = await supabase
      .from('lesson_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (requestError) {
      setMessage('Could not load requests.')
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

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('lesson_requests')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      alert('Status update failed.')
      console.error(error)
      return
    }

    loadAdminData()
  }

  async function copyComputerLessonLink(id: string) {
    const link = `http://localhost:3000/lesson/${id}`
    await navigator.clipboard.writeText(link)
    alert('Computer lesson link copied.')
  }

  async function copyStudentDashboardLink(id: string) {
    const link = `http://localhost:3000/student-dashboard?lessonId=${id}`
    await navigator.clipboard.writeText(link)
    alert('Student dashboard link copied.')
  }

  async function copyPhoneLessonLink(id: string) {
    const link = `http://192.168.1.228:3000/lesson/${id}`
    await navigator.clipboard.writeText(link)
    alert('Phone lesson link copied.')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#020617',
        color: 'white',
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '30px', marginBottom: '10px' }}>
          EXAMIA Admin Dashboard
        </h1>

        <p style={{ color: '#cbd5e1', marginBottom: '25px', lineHeight: '1.6' }}>
          Match each learner with an approved teacher by checking subject, grade level,
          learning problem, preferred time, and teacher fit.
        </p>

        {message && <p>{message}</p>}

        <div style={{ display: 'grid', gap: '18px' }}>
          {requests.map((request) => (
            <div
              key={request.id}
              style={{
                border: '1px solid #334155',
                borderRadius: '16px',
                padding: '16px',
                backgroundColor: '#0f172a',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <p
                    style={{
                      color: '#94a3b8',
                      fontSize: '13px',
                      marginBottom: '4px',
                    }}
                  >
                    Lesson Request
                  </p>

                  <h2 style={{ fontSize: '22px', margin: 0 }}>
                    {displaySubject(request)}
                  </h2>
                </div>

                <span
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#e2e8f0',
                    padding: '7px 12px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    height: 'fit-content',
                  }}
                >
                  {request.status}
                </span>
              </div>

              <div style={{ display: 'grid', gap: '10px', marginBottom: '14px' }}>
                <Info label="Subject" value={displaySubject(request)} />
                <Info label="Grade / Level" value={request.grade_level || 'Not provided'} />
                <Info label="Problem" value={request.problem || 'Not provided'} />
                <Info label="Preferred Time" value={request.preferred_time || 'Not provided'} />
                <Info label="Scheduled Time" value={request.scheduled_time || 'Not scheduled'} />
                <Info label="Assigned Teacher" value={request.assigned_teacher || 'Not assigned'} />
                <Info label="Teacher Status" value={request.teacher_status || 'Not offered yet'} />
                <Info label="Lesson ID" value={request.id} />
              </div>

              <select
                value={selectedTeachers[request.id] || ''}
                onChange={(e) =>
                  setSelectedTeachers((prev) => ({
                    ...prev,
                    [request.id]: e.target.value,
                  }))
                }
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '8px',
                  borderRadius: '10px',
                  border: '1px solid #475569',
                  backgroundColor: '#020617',
                  color: 'white',
                }}
              >
                <option value="">Select approved teacher</option>

                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacherLabel(teacher)}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Enter scheduled time e.g. Saturday 10am"
                value={timeInputs[request.id] || ''}
                onChange={(e) =>
                  setTimeInputs((prev) => ({
                    ...prev,
                    [request.id]: e.target.value,
                  }))
                }
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '10px',
                  borderRadius: '10px',
                  border: '1px solid #475569',
                  backgroundColor: '#020617',
                  color: 'white',
                }}
              />

              <button
                onClick={() => saveAssignment(request)}
                disabled={savingId === request.id}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '12px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  opacity: savingId === request.id ? 0.6 : 1,
                }}
              >
                {savingId === request.id ? 'Saving...' : 'Offer Lesson to Teacher'}
              </button>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  marginTop: '14px',
                }}
              >
                <ActionButton
                  label="Mark MATCHED"
                  color="#2563eb"
                  onClick={() => updateStatus(request.id, 'MATCHED')}
                />

                <ActionButton
                  label="Mark PAID"
                  color="#16a34a"
                  onClick={() => updateStatus(request.id, 'PAID')}
                />

                <ActionButton
                  label="Copy Student Dashboard Link"
                  color="#0891b2"
                  onClick={() => copyStudentDashboardLink(request.id)}
                />

                <ActionButton
                  label="Copy Computer Lesson Room"
                  color="#7c3aed"
                  onClick={() => copyComputerLessonLink(request.id)}
                />

                <ActionButton
                  label="Copy Phone Lesson Room"
                  color="#9333ea"
                  onClick={() => copyPhoneLessonLink(request.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        backgroundColor: '#020617',
        padding: '12px',
        borderRadius: '12px',
      }}
    >
      <p
        style={{
          color: '#94a3b8',
          fontSize: '13px',
          marginBottom: '4px',
        }}
      >
        {label}
      </p>

      <p style={{ margin: 0, lineHeight: '1.5', wordBreak: 'break-word' }}>
        {value}
      </p>
    </div>
  )
}

function ActionButton({
  label,
  color,
  onClick,
}: {
  label: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 160px',
        padding: '11px',
        backgroundColor: color,
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontWeight: 'bold',
      }}
    >
      {label}
    </button>
  )
}