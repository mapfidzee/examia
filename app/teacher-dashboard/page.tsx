'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type TeacherProfile = {
  id: string
  full_name: string
  email: string
  subjects: string[] | null
  grade_levels: string[] | null
  status: string
}

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
  teacher_id: string | null
  teacher_status: string | null
  created_at: string | null
  started_at: string | null
  completed_at: string | null
}

export default function TeacherDashboardPage() {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [teacherEmail, setTeacherEmail] = useState('')
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null)
  const [lessons, setLessons] = useState<LessonRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)

    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('examia_teacher_email')
      if (savedEmail) {
        setTeacherEmail(savedEmail)
        findTeacher(savedEmail)
      }
    }
  }, [])

  const offeredLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) =>
          lesson.teacher_status === 'OFFERED' && lesson.status !== 'COMPLETED'
      ),
    [lessons]
  )

  const acceptedLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) =>
          lesson.teacher_status === 'ACCEPTED' && lesson.status !== 'COMPLETED'
      ),
    [lessons]
  )

  const completedLessons = useMemo(
    () => lessons.filter((lesson) => lesson.status === 'COMPLETED'),
    [lessons]
  )

  const declinedLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) =>
          lesson.teacher_status === 'DECLINED' && lesson.status !== 'COMPLETED'
      ),
    [lessons]
  )

  if (!mounted) return null

  async function findTeacher(emailOverride?: string) {
    const emailToUse = (emailOverride || teacherEmail).trim().toLowerCase()

    if (!emailToUse) {
      alert('Please enter your teacher email.')
      return
    }

    setLoading(true)
    setMessage('Loading teacher workspace...')
    setTeacher(null)
    setLessons([])

    const { data: teacherData, error: teacherError } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('email', emailToUse)
      .single()

    if (teacherError || !teacherData) {
      console.error(teacherError)
      alert('Teacher profile not found.')
      setMessage('')
      setLoading(false)
      return
    }

    setTeacher(teacherData)

    if (typeof window !== 'undefined') {
      localStorage.setItem('examia_teacher_email', emailToUse)
    }

    if (teacherData.status !== 'APPROVED') {
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
      setMessage('')
      setLoading(false)
      return
    }

    setLessons(lessonData || [])
    setMessage('')
    setLoading(false)
  }

  async function updateLessonStatus(
    lessonId: string,
    status: 'ACCEPTED' | 'DECLINED'
  ) {
    setSavingId(lessonId)
    setMessage(`Updating lesson as ${status}...`)

    const { error } = await supabase
      .from('lesson_requests')
      .update({ teacher_status: status })
      .eq('id', lessonId)

    if (error) {
      console.error(error)
      alert('Could not update lesson status.')
      setMessage('')
      setSavingId(null)
      return
    }

    setMessage(`Lesson marked as ${status}.`)
    await findTeacher()
    setSavingId(null)
  }

  function openLessonRoom(lessonId: string) {
    router.push(`/lesson/${lessonId}`)
  }

  return (
    <main className="teacherPage">
      <div className="pageShell">
        <section className="frontDoorHero">
          <div className="heroContent">
            <p className="eyebrow">EXAMIA TEACHER DASHBOARD</p>
            <h1>Teacher Control Center</h1>
            <p className="heroText">
              Review lesson offers, accept sessions you can deliver, open active
              lesson rooms, and track completed teaching history from one clean
              workspace.
            </p>
          </div>

          <div className="heroPanel">
            <p className="panelKicker">Teacher workflow</p>
            <h2>Offer. Accept. Teach. Complete.</h2>
            <p>
              This dashboard is now your teaching front door. Accepted paid lessons
              show a Join Lesson button automatically.
            </p>
          </div>
        </section>

        <section className="lookupPanel">
          <div>
            <p className="sectionKicker">Teacher access</p>
            <h2>Load your teaching workspace</h2>
            <p className="sectionText">
              Enter the email used in your approved EXAMIA teacher profile.
            </p>
          </div>

          <div className="lookupGrid">
            <input
              type="email"
              value={teacherEmail}
              onChange={(event) => setTeacherEmail(event.target.value)}
              placeholder="teacher@example.com"
              className="input"
            />

            <button onClick={() => findTeacher()} disabled={loading} className="loadButton">
              {loading ? 'Loading lessons...' : 'Load My Lessons'}
            </button>
          </div>
        </section>

        {message && <p className="message">{message}</p>}

        <section className="commandTiles">
          <CommandTile label="Offered" value={offeredLessons.length} tone="blue" />
          <CommandTile label="Accepted / Active" value={acceptedLessons.length} tone="green" />
          <CommandTile label="Completed" value={completedLessons.length} tone="purple" />
          <CommandTile label="Declined" value={declinedLessons.length} tone="red" />
        </section>

        {!teacher && (
          <section className="emptyState">
            <p className="sectionKicker">No teacher loaded</p>
            <h2>Start with your teacher email</h2>
            <p>
              After your profile loads, this dashboard will show your lesson
              offers, active rooms, and completed teaching history.
            </p>
          </section>
        )}

        {teacher && <TeacherProfileCard teacher={teacher} />}

        {teacher && teacher.status !== 'APPROVED' && (
          <section className="warningPanel">
            <p className="sectionKicker">Approval required</p>
            <h2>Profile not approved yet</h2>
            <p>
              Your teacher profile must be approved by admin before you can receive
              or open lesson assignments.
            </p>
          </section>
        )}

        {teacher && teacher.status === 'APPROVED' && (
          <>
            <LessonDecisionSection
              kicker="Queue 1"
              title="New Lesson Offers"
              description="Accept only lessons you can confidently support. Decline lessons you cannot deliver well."
              tone="blue"
              lessons={offeredLessons}
              emptyText="No new lesson offers right now."
              savingId={savingId}
              mode="offer"
              onAccept={(id) => updateLessonStatus(id, 'ACCEPTED')}
              onDecline={(id) => updateLessonStatus(id, 'DECLINED')}
              onOpenRoom={openLessonRoom}
            />

            <LessonDecisionSection
              kicker="Queue 2"
              title="Accepted / Active Lessons"
              description="These lessons are accepted. Once paid or active, the Join Lesson button opens the room."
              tone="green"
              lessons={acceptedLessons}
              emptyText="No accepted lessons right now."
              savingId={savingId}
              mode="accepted"
              onAccept={(id) => updateLessonStatus(id, 'ACCEPTED')}
              onDecline={(id) => updateLessonStatus(id, 'DECLINED')}
              onOpenRoom={openLessonRoom}
            />

            <CompletedHistorySection lessons={completedLessons} />

            <LessonDecisionSection
              kicker="Archive"
              title="Declined Lessons"
              description="These lesson offers were declined and are kept here for teaching records."
              tone="red"
              lessons={declinedLessons}
              emptyText="No declined lessons."
              savingId={savingId}
              mode="declined"
              onAccept={(id) => updateLessonStatus(id, 'ACCEPTED')}
              onDecline={(id) => updateLessonStatus(id, 'DECLINED')}
              onOpenRoom={openLessonRoom}
            />
          </>
        )}
      </div>

      <style jsx global>{`
        .teacherPage {
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
        .commandTile,
        .profileCard,
        .sectionShell,
        .lessonCard,
        .historyCard,
        .emptyState,
        .warningPanel {
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

        h3 {
          margin: 0;
          font-size: 24px;
          letter-spacing: -0.03em;
        }

        .heroText,
        .sectionText,
        .heroPanel p:not(.panelKicker),
        .emptyState p,
        .warningPanel p {
          color: #dbeafe;
          line-height: 1.6;
          font-size: 15px;
        }

        .heroText {
          max-width: 760px;
          margin: 16px 0 0;
          font-size: 16px;
        }

        .heroPanel p:not(.panelKicker),
        .warningPanel p,
        .emptyState p {
          margin: 14px 0 0;
        }

        .lookupPanel {
          padding: 18px;
          margin-bottom: 18px;
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
        .roomButton,
        .primaryBtn,
        .secondaryBtn {
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
        }

        .primaryBtn {
          background: linear-gradient(135deg, #22c55e, #15803d);
        }

        .secondaryBtn {
          background: linear-gradient(135deg, #dc2626, #991b1b);
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
          min-height: 118px;
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

        .tile-green::before {
          background: linear-gradient(135deg, #16a34a, transparent);
        }

        .tile-purple::before {
          background: linear-gradient(135deg, #7c3aed, transparent);
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
          font-size: 42px;
          line-height: 1;
          font-weight: 900;
        }

        .emptyState,
        .warningPanel,
        .profileCard,
        .sectionShell {
          padding: 18px;
          margin-bottom: 20px;
        }

        .profileTop,
        .lessonTop {
          display: grid;
          gap: 12px;
          padding-bottom: 14px;
          margin-bottom: 14px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        }

        .profileEmail,
        .lessonMeta {
          margin: 6px 0 0;
          color: #bfdbfe;
          line-height: 1.45;
          word-break: break-word;
        }

        .statusBadge {
          width: fit-content;
          border-radius: 999px;
          padding: 8px 13px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          font-size: 12px;
          font-weight: 900;
        }

        .status-APPROVED {
          background: #22c55e;
          color: #052e16;
        }

        .status-PENDING {
          background: #f59e0b;
          color: #111827;
        }

        .status-SUSPENDED {
          background: #ef4444;
          color: #ffffff;
        }

        .profileGrid,
        .detailsGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 10px;
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

        .header-blue {
          background: linear-gradient(135deg, #2563eb, #1e3a8a);
        }

        .header-green {
          background: linear-gradient(135deg, #16a34a, #065f46);
        }

        .header-purple {
          background: linear-gradient(135deg, #7c3aed, #4c1d95);
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
          margin-top: 16px;
        }

        .warningBox {
          margin-top: 16px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(245, 158, 11, 0.16);
          border: 1px solid rgba(251, 191, 36, 0.32);
          color: #fde68a;
          font-weight: 800;
          line-height: 1.45;
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
          .teacherPage {
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

          .lookupGrid {
            grid-template-columns: minmax(0, 1fr) 220px;
            align-items: center;
          }

          .commandTiles {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .profileTop,
          .lessonTop {
            grid-template-columns: 1fr auto;
            align-items: start;
          }

          .profileGrid,
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

function TeacherProfileCard({ teacher }: { teacher: TeacherProfile }) {
  return (
    <section className="profileCard">
      <div className="profileTop">
        <div>
          <p className="sectionKicker">Teacher profile</p>
          <h2>{teacher.full_name || 'Unnamed Teacher'}</h2>
          <p className="profileEmail">{teacher.email || 'No email provided'}</p>
        </div>

        <span className={`statusBadge status-${teacher.status}`}>
          {teacher.status || 'UNKNOWN'}
        </span>
      </div>

      <div className="profileGrid">
        <Detail label="Subjects" value={formatList(teacher.subjects)} />
        <Detail label="Grade Levels" value={formatList(teacher.grade_levels)} />
        <Detail label="Approval Status" value={teacher.status || 'Not set'} />
      </div>
    </section>
  )
}

function CommandTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'blue' | 'green' | 'purple' | 'red'
}) {
  return (
    <article className={`commandTile tile-${tone}`}>
      <p className="tileLabel">{label}</p>
      <strong className="tileValue">{value}</strong>
    </article>
  )
}

function LessonDecisionSection({
  kicker,
  title,
  description,
  tone,
  lessons,
  emptyText,
  savingId,
  mode,
  onAccept,
  onDecline,
  onOpenRoom,
}: {
  kicker: string
  title: string
  description: string
  tone: 'blue' | 'green' | 'red'
  lessons: LessonRequest[]
  emptyText: string
  savingId: string | null
  mode: 'offer' | 'accepted' | 'declined'
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  onOpenRoom: (id: string) => void
}) {
  return (
    <section className="sectionShell">
      <div className={`sectionHeader header-${tone}`}>
        <p className="sectionKicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {lessons.length === 0 ? (
        <p className="warningBox">{emptyText}</p>
      ) : (
        <div className="lessonList">
          {lessons.map((lesson) => {
            const ready = lessonRoomReady(lesson)

            return (
              <article className="lessonCard" key={lesson.id}>
                <div className="lessonTop">
                  <div>
                    <p className="miniLabel">Teacher lesson record</p>
                    <h3>{displaySubject(lesson)}</h3>
                    <p className="lessonMeta">Lesson Status: {lesson.status || 'Not set'}</p>
                  </div>

                  <span className="statusBadge status-APPROVED">
                    {lesson.teacher_status || 'NOT SET'}
                  </span>
                </div>

                <ProblemBlock problem={lesson.problem || 'Not provided'} />

                <div className="detailsGrid">
                  <Detail label="Subject" value={displaySubject(lesson)} />
                  <Detail label="Grade / Level" value={lesson.grade_level || 'Not provided'} />
                  <Detail label="Preferred Time" value={lesson.preferred_time || 'Not provided'} />
                  <Detail label="Scheduled Time" value={formatDate(lesson.scheduled_time, 'Not scheduled')} />
                  <Detail label="Created At" value={formatDate(lesson.created_at)} />
                  <Detail label="Started At" value={formatDate(lesson.started_at)} />
                  <Detail label="Lesson ID" value={lesson.id} />
                </div>

                {mode === 'offer' && (
                  <div className="buttonRow">
                    <button
                      className="primaryBtn"
                      onClick={() => onAccept(lesson.id)}
                      disabled={savingId === lesson.id}
                    >
                      {savingId === lesson.id ? 'Updating...' : 'Accept Lesson'}
                    </button>

                    <button
                      className="secondaryBtn"
                      onClick={() => onDecline(lesson.id)}
                      disabled={savingId === lesson.id}
                    >
                      Decline Lesson
                    </button>
                  </div>
                )}

                {mode === 'accepted' && ready && (
                  <div className="buttonRow">
                    <button className="roomButton" onClick={() => onOpenRoom(lesson.id)}>
                      Join Lesson
                    </button>
                  </div>
                )}

                {mode === 'accepted' && !ready && (
                  <div className="warningBox">
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

function CompletedHistorySection({ lessons }: { lessons: LessonRequest[] }) {
  return (
    <section className="sectionShell">
      <div className="sectionHeader header-purple">
        <p className="sectionKicker">Completed teaching history</p>
        <h2>Completed Lessons</h2>
        <p>
          These lessons are closed. They remain visible as your teaching record.
        </p>
      </div>

      {lessons.length === 0 ? (
        <p className="warningBox">No completed lessons yet.</p>
      ) : (
        <div className="historyList">
          {lessons.map((lesson) => (
            <article className="historyCard" key={lesson.id}>
              <div className="lessonTop">
                <div>
                  <p className="miniLabel">Completed lesson record</p>
                  <h3>{displaySubject(lesson)}</h3>
                </div>

                <span className="statusBadge status-APPROVED">COMPLETED</span>
              </div>

              <ProblemBlock problem={lesson.problem || 'Not provided'} />

              <div className="detailsGrid">
                <Detail label="Subject" value={displaySubject(lesson)} />
                <Detail label="Grade / Level" value={lesson.grade_level || 'Not provided'} />
                <Detail label="Scheduled Time" value={formatDate(lesson.scheduled_time, 'Not scheduled')} />
                <Detail label="Created At" value={formatDate(lesson.created_at)} />
                <Detail label="Started At" value={formatDate(effectiveStartedAt(lesson))} />
                <Detail label="Completed At" value={formatDate(effectiveCompletedAt(lesson))} />
                <Detail label="Duration" value={calculateDuration(lesson)} />
                <Detail label="Lesson ID" value={lesson.id} />
              </div>

              <div className="completedNotice">
                This lesson is completed and locked. It is kept here as part of
                your teaching history.
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
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

function lessonRoomReady(lesson: LessonRequest) {
  return (
    lesson.teacher_status === 'ACCEPTED' &&
    (lesson.status === 'PAID' || lesson.status === 'ACTIVE')
  )
}

function formatList(value: string[] | null) {
  if (!value || value.length === 0) return 'Not provided'
  return value.join(', ')
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