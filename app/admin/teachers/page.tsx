'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type TeacherProfile = {
  id: string
  full_name: string
  email: string
  subjects: string[] | null
  grade_levels: string[] | null
  province: string | null
  spoken_languages: string[] | null
  hourly_rate: number | null
  bio: string | null
  status: string
  created_at: string
}

export default function AdminTeachersPage() {
  const [mounted, setMounted] = useState(false)
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      loadTeachers()
    }
  }, [mounted])

  if (!mounted) return null

  async function loadTeachers() {
    setLoading(true)

    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      alert('Could not load teacher profiles.')
      setLoading(false)
      return
    }

    setTeachers(data || [])
    setLoading(false)
  }

  async function updateTeacherStatus(id: string, status: string) {
    setMessage('Updating teacher status...')

    const { error } = await supabase
      .from('teacher_profiles')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Could not update teacher status.')
      setMessage('')
      return
    }

    setMessage(`Teacher marked as ${status}.`)
    await loadTeachers()
  }

  const pendingTeachers = teachers.filter((teacher) => teacher.status === 'PENDING')
  const approvedTeachers = teachers.filter((teacher) => teacher.status === 'APPROVED')
  const suspendedTeachers = teachers.filter((teacher) => teacher.status === 'SUSPENDED')

  return (
    <main className="adminPage">
      <div className="pageWrap">
        <header className="hero">
          <p className="eyebrow">EXAMIA ADMIN CONTROL</p>
          <h1>Teacher Pool Approval</h1>
          <p>
            Review teacher applications, approve qualified teachers, and suspend
            profiles that should not receive lesson requests.
          </p>
        </header>

        <section className="statsGrid">
          <Stat title="Pending" value={pendingTeachers.length} />
          <Stat title="Approved" value={approvedTeachers.length} />
          <Stat title="Suspended" value={suspendedTeachers.length} />
        </section>

        {message && <p className="message">{message}</p>}

        {loading ? (
          <section className="panel">
            <p>Loading teacher profiles...</p>
          </section>
        ) : (
          <>
            <TeacherSection
              title="Pending Teachers"
              description="These teachers are waiting for EXAMIA approval."
              teachers={pendingTeachers}
              primaryActionLabel="Approve Teacher"
              primaryAction={(id) => updateTeacherStatus(id, 'APPROVED')}
              secondaryActionLabel="Suspend"
              secondaryAction={(id) => updateTeacherStatus(id, 'SUSPENDED')}
            />

            <TeacherSection
              title="Approved Teachers"
              description="These teachers can be matched with lesson requests."
              teachers={approvedTeachers}
              primaryActionLabel="Suspend"
              primaryAction={(id) => updateTeacherStatus(id, 'SUSPENDED')}
              secondaryActionLabel="Return to Pending"
              secondaryAction={(id) => updateTeacherStatus(id, 'PENDING')}
            />

            <TeacherSection
              title="Suspended Teachers"
              description="These teachers are blocked from the active teaching pool."
              teachers={suspendedTeachers}
              primaryActionLabel="Approve Again"
              primaryAction={(id) => updateTeacherStatus(id, 'APPROVED')}
              secondaryActionLabel="Return to Pending"
              secondaryAction={(id) => updateTeacherStatus(id, 'PENDING')}
            />
          </>
        )}
      </div>

      <style jsx>{`
        .adminPage {
          min-height: 100vh;
          background: #062b6f;
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
          max-width: 760px;
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
        .teacherCard {
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
          margin-bottom: 26px;
        }

        .sectionHeader {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .sectionHeader h2 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.04em;
        }

        .sectionHeader p {
          margin: 0;
          color: #dbeafe;
          line-height: 1.55;
        }

        .teacherList {
          display: grid;
          gap: 16px;
        }

        .teacherCard {
          padding: 22px;
        }

        .teacherTop {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .teacherName {
          margin: 0;
          font-size: 24px;
          letter-spacing: -0.03em;
        }

        .teacherEmail {
          margin: 6px 0 0;
          color: #bfdbfe;
          word-break: break-word;
        }

        .statusBadge {
          width: fit-content;
          border-radius: 999px;
          padding: 7px 12px;
          background: rgba(96, 165, 250, 0.16);
          color: #dbeafe;
          border: 1px solid rgba(147, 197, 253, 0.3);
          font-size: 12px;
          font-weight: 900;
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
        }

        .bioBox {
          background: #1d4ed8;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
        }

        .bioBox span {
          display: block;
          color: #dbeafe;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .bioBox p {
          margin: 0;
          line-height: 1.6;
        }

        .buttonRow {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
        }

        button {
          border: none;
          border-radius: 15px;
          padding: 15px 16px;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
        }

        .primaryBtn {
          background: white;
          color: #062b6f;
        }

        .secondaryBtn {
          background: #334155;
          color: white;
        }

        .empty {
          color: #cbd5e1;
          background: rgba(15, 23, 42, 0.75);
          padding: 18px;
          border-radius: 18px;
        }

        @media (min-width: 760px) {
          .adminPage {
            padding: 80px 48px 140px;
          }

          .statsGrid {
            grid-template-columns: repeat(3, 1fr);
          }

          .teacherTop {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
          }

          .detailsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .buttonRow {
            grid-template-columns: repeat(2, minmax(0, 1fr));
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

function TeacherSection({
  title,
  description,
  teachers,
  primaryActionLabel,
  primaryAction,
  secondaryActionLabel,
  secondaryAction,
}: {
  title: string
  description: string
  teachers: TeacherProfile[]
  primaryActionLabel: string
  primaryAction: (id: string) => void
  secondaryActionLabel: string
  secondaryAction: (id: string) => void
}) {
  return (
    <section className="panel">
      <div className="sectionHeader">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {teachers.length === 0 ? (
        <p className="empty">No teachers in this section.</p>
      ) : (
        <div className="teacherList">
          {teachers.map((teacher) => (
            <div className="teacherCard" key={teacher.id}>
              <div className="teacherTop">
                <div>
                  <h3 className="teacherName">{teacher.full_name}</h3>
                  <p className="teacherEmail">{teacher.email}</p>
                </div>
                <span className="statusBadge">{teacher.status}</span>
              </div>

              <div className="detailsGrid">
                <Detail label="Subjects" value={formatList(teacher.subjects)} />
                <Detail label="Grade Levels" value={formatList(teacher.grade_levels)} />
                <Detail label="Province" value={teacher.province || 'Not provided'} />
                <Detail label="Languages" value={formatList(teacher.spoken_languages)} />
                <Detail
                  label="Hourly Rate"
                  value={teacher.hourly_rate ? `$${teacher.hourly_rate}` : 'Not provided'}
                />
              </div>

              <div className="bioBox">
                <span>Teaching strength</span>
                <p>{teacher.bio || 'No bio provided.'}</p>
              </div>

              <div className="buttonRow">
                <button className="primaryBtn" onClick={() => primaryAction(teacher.id)}>
                  {primaryActionLabel}
                </button>

                <button className="secondaryBtn" onClick={() => secondaryAction(teacher.id)}>
                  {secondaryActionLabel}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
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
  if (!value || value.length === 0) return 'Not provided'
  return value.join(', ')
}