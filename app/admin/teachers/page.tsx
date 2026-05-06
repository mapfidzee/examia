'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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
  const [teachers, setTeachers] = useState<TeacherProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    loadTeachers()
  }, [])

  const pendingTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.status === 'PENDING'),
    [teachers]
  )

  const approvedTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.status === 'APPROVED'),
    [teachers]
  )

  const suspendedTeachers = useMemo(
    () => teachers.filter((teacher) => teacher.status === 'SUSPENDED'),
    [teachers]
  )

  async function loadTeachers() {
    setLoading(true)
    setMessage('Loading teacher pool...')

    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setMessage('Could not load teacher profiles.')
      setLoading(false)
      return
    }

    setTeachers(data || [])
    setMessage('')
    setLoading(false)
  }

  async function updateTeacherStatus(id: string, status: string) {
    setSavingId(id)
    setMessage('Updating teacher status...')

    const { error } = await supabase
      .from('teacher_profiles')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Could not update teacher status.')
      setMessage('')
      setSavingId(null)
      return
    }

    setMessage(`Teacher marked as ${status}.`)
    await loadTeachers()
    setSavingId(null)
  }

  return (
    <main className="adminPage">
      <div className="pageShell">
        <header className="hero">
          <div>
            <p className="eyebrow">EXAMIA TEACHER GOVERNANCE</p>
            <h1>Teacher Pool Approval</h1>
            <p className="heroText">
              Review teacher profiles, approve qualified teachers, and protect
              the learning platform by keeping the active teaching pool clean,
              visible, and controlled.
            </p>
          </div>

          <div className="quickLinks">
            <Link href="/admin" className="quickLink blueLink">
              Admin Command Center
            </Link>
            <Link href="/admin/assign" className="quickLink purpleLink">
              Assignment Backup
            </Link>
            <Link href="/teacher" className="quickLink greenLink">
              Teacher Signup
            </Link>
            <button className="quickButton" onClick={loadTeachers}>
              Refresh Teachers
            </button>
          </div>
        </header>

        <section className="statsGrid">
          <StatCard label="Total Teachers" value={teachers.length} tone="blue" />
          <StatCard label="Pending Review" value={pendingTeachers.length} tone="amber" />
          <StatCard label="Approved Pool" value={approvedTeachers.length} tone="green" />
          <StatCard label="Suspended" value={suspendedTeachers.length} tone="red" />
        </section>

        {message && <p className="message">{message}</p>}

        {loading ? (
          <section className="panel">
            <p className="emptyText">Loading teacher profiles...</p>
          </section>
        ) : (
          <>
            <TeacherSection
              title="Pending Teachers"
              kicker="Needs admin review"
              description="These teachers are waiting for approval before they can receive lesson offers."
              teachers={pendingTeachers}
              sectionTone="amber"
              savingId={savingId}
              primaryActionLabel="Approve Teacher"
              primaryAction={(id) => updateTeacherStatus(id, 'APPROVED')}
              secondaryActionLabel="Suspend"
              secondaryAction={(id) => updateTeacherStatus(id, 'SUSPENDED')}
            />

            <TeacherSection
              title="Approved Teachers"
              kicker="Active teaching pool"
              description="These teachers are visible for lesson matching and can receive lesson offers."
              teachers={approvedTeachers}
              sectionTone="green"
              savingId={savingId}
              primaryActionLabel="Suspend"
              primaryAction={(id) => updateTeacherStatus(id, 'SUSPENDED')}
              secondaryActionLabel="Return to Pending"
              secondaryAction={(id) => updateTeacherStatus(id, 'PENDING')}
            />

            <TeacherSection
              title="Suspended Teachers"
              kicker="Blocked from matching"
              description="These teachers are not part of the active pool until reviewed again."
              teachers={suspendedTeachers}
              sectionTone="red"
              savingId={savingId}
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
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.34), transparent 30%),
            radial-gradient(circle at top right, rgba(20, 184, 166, 0.2), transparent 28%),
            radial-gradient(circle at bottom, rgba(168, 85, 247, 0.16), transparent 34%),
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
        .sectionKicker {
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
          font-size: 30px;
          letter-spacing: -0.04em;
        }

        h3 {
          margin: 0;
          font-size: 25px;
          letter-spacing: -0.03em;
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

        .quickLink,
        .quickButton {
          text-decoration: none;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.18);
          padding: 13px 15px;
          border-radius: 16px;
          font-weight: 900;
          text-align: center;
          cursor: pointer;
          font-size: 14px;
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.24);
        }

        .blueLink {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        .purpleLink {
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
        }

        .greenLink {
          background: linear-gradient(135deg, #16a34a, #15803d);
        }

        .quickButton {
          background: linear-gradient(135deg, #f97316, #ea580c);
          font-family: inherit;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }

        .statCard,
        .panel,
        .teacherCard {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 26px;
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
        }

        .statCard {
          padding: 18px;
          position: relative;
          overflow: hidden;
        }

        .statCard::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.3;
          pointer-events: none;
        }

        .stat-blue::before {
          background: linear-gradient(135deg, #2563eb, transparent);
        }

        .stat-amber::before {
          background: linear-gradient(135deg, #f59e0b, transparent);
        }

        .stat-green::before {
          background: linear-gradient(135deg, #16a34a, transparent);
        }

        .stat-red::before {
          background: linear-gradient(135deg, #dc2626, transparent);
        }

        .statLabel,
        .statValue {
          position: relative;
          z-index: 1;
        }

        .statLabel {
          margin: 0;
          color: #dbeafe;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .statValue {
          display: block;
          margin-top: 8px;
          font-size: 40px;
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
          margin-bottom: 20px;
        }

        .sectionHeader {
          border-radius: 24px;
          padding: 18px;
          margin-bottom: 16px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .sectionHeader p {
          margin: 8px 0 0;
          color: #ffffff;
          line-height: 1.55;
        }

        .section-amber {
          background: linear-gradient(135deg, #d97706, #92400e);
        }

        .section-green {
          background: linear-gradient(135deg, #16a34a, #065f46);
        }

        .section-red {
          background: linear-gradient(135deg, #dc2626, #7f1d1d);
        }

        .teacherList {
          display: grid;
          gap: 16px;
        }

        .teacherCard {
          padding: 16px;
          background:
            linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(15, 23, 42, 0.94)),
            rgba(15, 23, 42, 0.9);
        }

        .teacherTop {
          display: grid;
          gap: 12px;
          margin-bottom: 14px;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        }

        .teacherEmail {
          margin: 6px 0 0;
          color: #bfdbfe;
          word-break: break-word;
          line-height: 1.45;
        }

        .statusBadge {
          width: fit-content;
          border-radius: 999px;
          padding: 8px 13px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          font-size: 12px;
          font-weight: 900;
        }

        .status-PENDING {
          background: #f59e0b;
          color: #111827;
        }

        .status-APPROVED {
          background: #22c55e;
          color: #052e16;
        }

        .status-SUSPENDED {
          background: #ef4444;
          color: #ffffff;
        }

        .detailsGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-bottom: 14px;
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
          color: #f8fafc;
          line-height: 1.45;
          word-break: break-word;
        }

        .bioBox {
          border-radius: 20px;
          padding: 15px;
          margin-bottom: 14px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.35), rgba(37, 99, 235, 0.22));
          border: 1px solid rgba(196, 181, 253, 0.24);
        }

        .bioBox span {
          display: block;
          color: #ddd6fe;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .bioBox p {
          margin: 0;
          color: #ffffff;
          line-height: 1.6;
        }

        .buttonRow {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        button {
          border: none;
          border-radius: 16px;
          padding: 15px 16px;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          min-height: 52px;
        }

        button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .primaryBtn {
          background: linear-gradient(135deg, #22c55e, #15803d);
          color: #ffffff;
        }

        .secondaryBtn {
          background: linear-gradient(135deg, #64748b, #334155);
          color: #ffffff;
        }

        .empty {
          color: #e2e8f0;
          background: rgba(2, 6, 23, 0.65);
          padding: 16px;
          border-radius: 18px;
          border: 1px dashed rgba(148, 163, 184, 0.34);
          margin: 0;
        }

        .emptyText {
          color: #cbd5e1;
          margin: 0;
        }

        @media (min-width: 760px) {
          .adminPage {
            padding: 28px;
          }

          .hero {
            grid-template-columns: 1fr 270px;
            align-items: start;
          }

          .statsGrid {
            grid-template-columns: repeat(4, 1fr);
          }

          .teacherTop {
            grid-template-columns: 1fr auto;
            align-items: flex-start;
          }

          .detailsGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .buttonRow {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </main>
  )
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'blue' | 'amber' | 'green' | 'red'
}) {
  return (
    <div className={`statCard stat-${tone}`}>
      <p className="statLabel">{label}</p>
      <strong className="statValue">{value}</strong>
    </div>
  )
}

function TeacherSection({
  title,
  kicker,
  description,
  teachers,
  sectionTone,
  savingId,
  primaryActionLabel,
  primaryAction,
  secondaryActionLabel,
  secondaryAction,
}: {
  title: string
  kicker: string
  description: string
  teachers: TeacherProfile[]
  sectionTone: 'amber' | 'green' | 'red'
  savingId: string | null
  primaryActionLabel: string
  primaryAction: (id: string) => void
  secondaryActionLabel: string
  secondaryAction: (id: string) => void
}) {
  return (
    <section className="panel">
      <div className={`sectionHeader section-${sectionTone}`}>
        <p className="sectionKicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {teachers.length === 0 ? (
        <p className="empty">No teachers in this section.</p>
      ) : (
        <div className="teacherList">
          {teachers.map((teacher) => (
            <article className="teacherCard" key={teacher.id}>
              <div className="teacherTop">
                <div>
                  <h3>{teacher.full_name || 'Unnamed Teacher'}</h3>
                  <p className="teacherEmail">{teacher.email || 'No email provided'}</p>
                </div>

                <span className={`statusBadge status-${teacher.status}`}>
                  {teacher.status || 'UNKNOWN'}
                </span>
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
                <Detail label="Submitted At" value={formatDateTime(teacher.created_at)} />
              </div>

              <div className="bioBox">
                <span>Teaching strength</span>
                <p>{teacher.bio || 'No bio provided.'}</p>
              </div>

              <div className="buttonRow">
                <button
                  className="primaryBtn"
                  onClick={() => primaryAction(teacher.id)}
                  disabled={savingId === teacher.id}
                >
                  {savingId === teacher.id ? 'Updating...' : primaryActionLabel}
                </button>

                <button
                  className="secondaryBtn"
                  onClick={() => secondaryAction(teacher.id)}
                  disabled={savingId === teacher.id}
                >
                  {secondaryActionLabel}
                </button>
              </div>
            </article>
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

function formatDateTime(value: string | null) {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleString()
}