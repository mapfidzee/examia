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
    setMessage('Loading teacher governance center...')

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
    <main className="teacherGovernancePage">
      <div className="pageShell">
        <section className="frontDoorHero">
          <div className="heroContent">
            <p className="eyebrow">EXAMIA TEACHER GOVERNANCE</p>
            <h1>Teacher Governance Center</h1>
            <p className="heroText">
              Approve teachers, protect the learning pool, and keep lesson
              matching safe. This page controls who can receive student lesson
              offers inside EXAMIA.
            </p>

            <div className="heroActions">
              <Link href="/admin" className="heroButton primaryHeroButton">
                Admin Command Center
              </Link>

              <Link href="/teacher" className="heroButton successHeroButton">
                Teacher Signup
              </Link>

              <button className="heroButton refreshHeroButton" onClick={loadTeachers}>
                Refresh Teachers
              </button>
            </div>
          </div>

          <div className="heroPanel">
            <p className="panelKicker">Governance focus</p>
            <h2>Clean teacher pool. Clear approval flow.</h2>
            <p>
              Pending teachers wait for review. Approved teachers can receive
              lesson offers. Suspended teachers stay blocked until restored.
            </p>
          </div>
        </section>

        <section className="commandTiles">
          <CommandTile
            label="Pending Approval"
            value={pendingTeachers.length}
            description="Teachers waiting for admin decision"
            tone="amber"
          />
          <CommandTile
            label="Approved Pool"
            value={approvedTeachers.length}
            description="Teachers ready for lesson matching"
            tone="green"
          />
          <CommandTile
            label="Suspended"
            value={suspendedTeachers.length}
            description="Teachers blocked from matching"
            tone="red"
          />
          <CommandTile
            label="Total Profiles"
            value={teachers.length}
            description="All teacher records in the system"
            tone="blue"
          />
        </section>

        {message && <p className="message">{message}</p>}

        {loading ? (
          <section className="sectionShell">
            <p className="emptyText">Loading teacher profiles...</p>
          </section>
        ) : (
          <>
            <TeacherDecisionSection
              kicker="Step 1"
              title="Pending Approval"
              description="Review these teacher applications before they enter the active teaching pool."
              tone="amber"
              teachers={pendingTeachers}
              emptyText="No teachers are waiting for approval."
              savingId={savingId}
              primaryLabel="Approve Teacher"
              primaryAction={(id) => updateTeacherStatus(id, 'APPROVED')}
              secondaryLabel="Suspend"
              secondaryAction={(id) => updateTeacherStatus(id, 'SUSPENDED')}
            />

            <TeacherDecisionSection
              kicker="Step 2"
              title="Approved Teacher Pool"
              description="These teachers are active and can receive lesson offers from the Admin Command Center."
              tone="green"
              teachers={approvedTeachers}
              emptyText="No approved teachers yet."
              savingId={savingId}
              primaryLabel="Suspend Teacher"
              primaryAction={(id) => updateTeacherStatus(id, 'SUSPENDED')}
              secondaryLabel="Return to Pending"
              secondaryAction={(id) => updateTeacherStatus(id, 'PENDING')}
            />

            <TeacherDecisionSection
              kicker="Step 3"
              title="Suspended Teachers"
              description="These teachers are blocked from lesson matching until admin restores them."
              tone="red"
              teachers={suspendedTeachers}
              emptyText="No suspended teachers."
              savingId={savingId}
              primaryLabel="Approve Again"
              primaryAction={(id) => updateTeacherStatus(id, 'APPROVED')}
              secondaryLabel="Return to Pending"
              secondaryAction={(id) => updateTeacherStatus(id, 'PENDING')}
            />

            <TeacherProfileRecords teachers={teachers} />
          </>
        )}
      </div>

      <style jsx global>{`
        .teacherGovernancePage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(37, 99, 235, 0.34), transparent 30%),
            radial-gradient(circle at top right, rgba(20, 184, 166, 0.2), transparent 28%),
            radial-gradient(circle at bottom, rgba(168, 85, 247, 0.18), transparent 34%),
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
        .heroPanel,
        .commandTile,
        .sectionShell,
        .teacherDecisionCard,
        .teacherProfileCard {
          border: 1px solid rgba(148, 163, 184, 0.24);
          border-radius: 28px;
          background: rgba(15, 23, 42, 0.9);
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
        }

        .heroContent {
          padding: 22px;
          background:
            linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(15, 23, 42, 0.94)),
            rgba(15, 23, 42, 0.9);
        }

        .heroPanel {
          padding: 20px;
          background:
            linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(15, 23, 42, 0.94)),
            rgba(15, 23, 42, 0.9);
        }

        .eyebrow,
        .sectionKicker,
        .miniLabel,
        .panelKicker {
          margin: 0 0 8px;
          color: #93c5fd;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          max-width: 760px;
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
          font-size: 23px;
          letter-spacing: -0.03em;
        }

        .heroText {
          max-width: 760px;
          margin: 16px 0 0;
          color: #dbeafe;
          line-height: 1.6;
          font-size: 16px;
        }

        .heroPanel p:not(.panelKicker) {
          color: #dbeafe;
          line-height: 1.6;
          margin: 14px 0 0;
        }

        .heroActions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
          margin-top: 20px;
        }

        .heroButton {
          text-decoration: none;
          border: none;
          border-radius: 18px;
          padding: 15px 16px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          text-align: center;
          cursor: pointer;
          min-height: 52px;
          box-shadow: 0 14px 32px rgba(0, 0, 0, 0.24);
        }

        .primaryHeroButton {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }

        .successHeroButton {
          background: linear-gradient(135deg, #16a34a, #15803d);
        }

        .refreshHeroButton {
          background: linear-gradient(135deg, #f97316, #ea580c);
          font-family: inherit;
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
          min-height: 128px;
        }

        .commandTile::before {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.28;
          pointer-events: none;
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

        .tile-blue::before {
          background: linear-gradient(135deg, #2563eb, transparent);
        }

        .tileLabel,
        .tileValue,
        .tileDescription {
          position: relative;
          z-index: 1;
        }

        .tileLabel {
          margin: 0;
          color: #dbeafe;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .tileValue {
          display: block;
          margin-top: 8px;
          font-size: 46px;
          line-height: 1;
          font-weight: 900;
        }

        .tileDescription {
          margin: 10px 0 0;
          color: #e2e8f0;
          line-height: 1.45;
          font-size: 14px;
        }

        .message {
          background: rgba(37, 99, 235, 0.18);
          color: #dbeafe;
          padding: 14px;
          border-radius: 18px;
          border: 1px solid rgba(147, 197, 253, 0.28);
          margin-bottom: 18px;
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

        .header-green {
          background: linear-gradient(135deg, #16a34a, #065f46);
        }

        .header-red {
          background: linear-gradient(135deg, #dc2626, #7f1d1d);
        }

        .header-blue {
          background: linear-gradient(135deg, #2563eb, #1e3a8a);
        }

        .teacherDecisionList,
        .teacherProfileList {
          display: grid;
          gap: 14px;
        }

        .teacherDecisionCard {
          padding: 16px;
          background:
            linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(15, 23, 42, 0.96)),
            rgba(15, 23, 42, 0.92);
        }

        .teacherTop,
        .profileTop {
          display: grid;
          gap: 12px;
          padding-bottom: 14px;
          margin-bottom: 14px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        }

        .teacherEmail,
        .profileEmail {
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

        .decisionInfoGrid,
        .profileInfoGrid {
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
          color: #ffffff;
          line-height: 1.45;
          word-break: break-word;
        }

        .buttonRow {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .primaryBtn,
        .secondaryBtn {
          border: none;
          border-radius: 17px;
          padding: 15px 16px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          min-height: 54px;
          width: 100%;
        }

        .primaryBtn {
          background: linear-gradient(135deg, #22c55e, #15803d);
        }

        .secondaryBtn {
          background: linear-gradient(135deg, #64748b, #334155);
        }

        .primaryBtn:disabled,
        .secondaryBtn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .emptyBox {
          color: #e2e8f0;
          background: rgba(2, 6, 23, 0.65);
          padding: 17px;
          border-radius: 18px;
          border: 1px dashed rgba(148, 163, 184, 0.34);
          margin: 0;
        }

        .emptyText {
          color: #cbd5e1;
          margin: 0;
        }

        .teacherProfileCard {
          padding: 16px;
          background:
            linear-gradient(135deg, rgba(124, 58, 237, 0.18), rgba(15, 23, 42, 0.96)),
            rgba(15, 23, 42, 0.92);
        }

        .bioBox {
          border-radius: 20px;
          padding: 15px;
          margin-top: 10px;
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

        @media (min-width: 760px) {
          .teacherGovernancePage {
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

          .heroActions {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .commandTiles {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .teacherTop,
          .profileTop {
            grid-template-columns: 1fr auto;
            align-items: start;
          }

          .decisionInfoGrid,
          .profileInfoGrid {
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

function CommandTile({
  label,
  value,
  description,
  tone,
}: {
  label: string
  value: number
  description: string
  tone: 'amber' | 'green' | 'red' | 'blue'
}) {
  return (
    <article className={`commandTile tile-${tone}`}>
      <p className="tileLabel">{label}</p>
      <strong className="tileValue">{value}</strong>
      <p className="tileDescription">{description}</p>
    </article>
  )
}

function TeacherDecisionSection({
  kicker,
  title,
  description,
  tone,
  teachers,
  emptyText,
  savingId,
  primaryLabel,
  primaryAction,
  secondaryLabel,
  secondaryAction,
}: {
  kicker: string
  title: string
  description: string
  tone: 'amber' | 'green' | 'red'
  teachers: TeacherProfile[]
  emptyText: string
  savingId: string | null
  primaryLabel: string
  primaryAction: (id: string) => void
  secondaryLabel: string
  secondaryAction: (id: string) => void
}) {
  return (
    <section className="sectionShell">
      <div className={`sectionHeader header-${tone}`}>
        <p className="sectionKicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {teachers.length === 0 ? (
        <p className="emptyBox">{emptyText}</p>
      ) : (
        <div className="teacherDecisionList">
          {teachers.map((teacher) => (
            <article className="teacherDecisionCard" key={teacher.id}>
              <div className="teacherTop">
                <div>
                  <p className="miniLabel">Teacher decision record</p>
                  <h3>{teacher.full_name || 'Unnamed Teacher'}</h3>
                  <p className="teacherEmail">
                    {teacher.email || 'No email provided'}
                  </p>
                </div>

                <span className={`statusBadge status-${teacher.status}`}>
                  {teacher.status || 'UNKNOWN'}
                </span>
              </div>

              <div className="decisionInfoGrid">
                <Detail label="Subjects" value={formatList(teacher.subjects)} />
                <Detail label="Grade Levels" value={formatList(teacher.grade_levels)} />
                <Detail label="Hourly Rate" value={formatMoney(teacher.hourly_rate)} />
              </div>

              <div className="buttonRow">
                <button
                  className="primaryBtn"
                  onClick={() => primaryAction(teacher.id)}
                  disabled={savingId === teacher.id}
                >
                  {savingId === teacher.id ? 'Updating...' : primaryLabel}
                </button>

                <button
                  className="secondaryBtn"
                  onClick={() => secondaryAction(teacher.id)}
                  disabled={savingId === teacher.id}
                >
                  {secondaryLabel}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function TeacherProfileRecords({ teachers }: { teachers: TeacherProfile[] }) {
  return (
    <section className="sectionShell">
      <div className="sectionHeader header-blue">
        <p className="sectionKicker">Reference records</p>
        <h2>Full Teacher Profile Records</h2>
        <p>
          Use this section to read the full teacher profile clearly. Approval
          decisions are handled in the decision sections above.
        </p>
      </div>

      {teachers.length === 0 ? (
        <p className="emptyBox">No teacher profiles found.</p>
      ) : (
        <div className="teacherProfileList">
          {teachers.map((teacher) => (
            <article className="teacherProfileCard" key={teacher.id}>
              <div className="profileTop">
                <div>
                  <p className="miniLabel">Teacher profile</p>
                  <h3>{teacher.full_name || 'Unnamed Teacher'}</h3>
                  <p className="profileEmail">
                    {teacher.email || 'No email provided'}
                  </p>
                </div>

                <span className={`statusBadge status-${teacher.status}`}>
                  {teacher.status || 'UNKNOWN'}
                </span>
              </div>

              <div className="profileInfoGrid">
                <Detail label="Subjects" value={formatList(teacher.subjects)} />
                <Detail label="Grade Levels" value={formatList(teacher.grade_levels)} />
                <Detail label="Province" value={teacher.province || 'Not provided'} />
                <Detail label="Languages" value={formatList(teacher.spoken_languages)} />
                <Detail label="Hourly Rate" value={formatMoney(teacher.hourly_rate)} />
                <Detail label="Submitted At" value={formatDateTime(teacher.created_at)} />
              </div>

              <div className="bioBox">
                <span>Teaching strength</span>
                <p>{teacher.bio || 'No bio provided.'}</p>
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

function formatMoney(value: number | null) {
  if (!value) return 'Not provided'
  return `$${value}`
}

function formatDateTime(value: string | null) {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleString()
}