'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type SupportRequest = {
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

export default function BeneficiaryDashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BeneficiaryDashboardContent />
    </Suspense>
  )
}

function BeneficiaryDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [mounted, setMounted] = useState(false)
  const [requestId, setRequestId] = useState('')
  const [request, setRequest] = useState<SupportRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const requestIdFromUrl = searchParams.get('lessonId') || searchParams.get('requestId')
    const savedRequestId =
      typeof window !== 'undefined' ? localStorage.getItem('examia_student_lesson_id') : null

    const targetRequestId = requestIdFromUrl || savedRequestId

    if (targetRequestId) {
      setRequestId(targetRequestId)
      loadRequestById(targetRequestId)
    }
  }, [mounted, searchParams])

  if (!mounted) return null

  async function loadRequestById(id: string) {
    const cleanId = id.trim()

    if (!cleanId) {
      alert('Please enter your Request ID.')
      return
    }

    setLoading(true)
    setMessage('Loading support request status...')
    setRequest(null)

    const { data, error } = await supabase
      .from('lesson_requests')
      .select('*')
      .eq('id', cleanId)
      .single()

    if (error || !data) {
      console.error(error)
      alert('Request not found. Please check the Request ID.')
      setMessage('')
      setLoading(false)
      return
    }

    setRequest(data)
    setMessage('')
    setLoading(false)

    if (typeof window !== 'undefined') {
      localStorage.setItem('examia_student_lesson_id', cleanId)
    }
  }

  async function loadRequest() {
    await loadRequestById(requestId)
  }

  function openSupportRoom(id: string) {
    router.push(`/lesson/${id}`)
  }

  const readiness = getReadiness(request)

  return (
    <main className="beneficiaryPage">
      <div className="pageShell">
        <section className="frontDoorHero">
          <div className="heroContent">
            <p className="eyebrow">EXAMIA BENEFICIARY DASHBOARD</p>
            <h1>My Support Journey</h1>
            <p className="heroText">
              Track your request from need intake to responder routing,
              controlled support room access, active support, and completion
              evidence.
            </p>
          </div>

          <div className="heroPanel">
            <p className="panelKicker">Beneficiary visibility layer</p>
            <h2>Request. Route. Support. Complete.</h2>
            <p>
              This dashboard gives the beneficiary a simple front door. When the
              support room is ready, the next step becomes clear.
            </p>
          </div>
        </section>

        <section className="lookupPanel">
          <div>
            <p className="sectionKicker">Find your request</p>
            <h2>Enter your Request ID</h2>
            <p className="sectionText">
              If your dashboard link includes a Request ID, EXAMIA loads it
              automatically. You can also paste the ID below.
            </p>
          </div>

          <div className="lookupGrid">
            <input
              value={requestId}
              onChange={(event) => setRequestId(event.target.value)}
              placeholder="Paste your Request ID here"
              className="input"
            />

            <button onClick={loadRequest} disabled={loading} className="loadButton">
              {loading ? 'Loading request...' : 'Load My Request'}
            </button>
          </div>
        </section>

        {message && <p className="message">{message}</p>}

        <section className="statusTiles">
          <StatusTile
            label="Request Status"
            value={request?.status || 'Not loaded'}
            tone={readiness.tone}
          />
          <StatusTile
            label="Responder Status"
            value={request?.teacher_status || 'Not loaded'}
            tone="blue"
          />
          <StatusTile
            label="Responder"
            value={request?.assigned_teacher || 'Not assigned'}
            tone="green"
          />
          <StatusTile
            label="Room Access"
            value={readiness.ready ? 'Ready' : 'Not ready'}
            tone={readiness.ready ? 'green' : 'amber'}
          />
        </section>

        {!request && (
          <section className="emptyState">
            <p className="sectionKicker">No request loaded</p>
            <h2>Start with your Request ID</h2>
            <p>
              After the request loads, this dashboard shows responder routing,
              readiness status, controlled room access, scheduled time, and
              completion evidence.
            </p>
          </section>
        )}

        {request && request.status !== 'COMPLETED' && (
          <ActiveSupportPanel
            request={request}
            readiness={readiness}
            openSupportRoom={openSupportRoom}
          />
        )}

        {request && request.status === 'COMPLETED' && (
          <CompletionEvidencePanel request={request} />
        )}
      </div>

      <style jsx global>{`
        .beneficiaryPage {
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
        .supportPanel,
        .evidencePanel,
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

        .supportPanel,
        .evidencePanel {
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

        .needBox {
          border-radius: 22px;
          padding: 16px;
          margin-bottom: 16px;
          background:
            linear-gradient(135deg, rgba(37, 99, 235, 0.28), rgba(15, 23, 42, 0.92)),
            rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(147, 197, 253, 0.22);
        }

        .needBox p {
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
          .beneficiaryPage {
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

function ActiveSupportPanel({
  request,
  readiness,
  openSupportRoom,
}: {
  request: SupportRequest
  readiness: ReturnType<typeof getReadiness>
  openSupportRoom: (id: string) => void
}) {
  return (
    <section className="supportPanel">
      <div className={`sectionHeader header-${readiness.tone}`}>
        <p className="sectionKicker">Current support status</p>
        <h2>{readiness.title}</h2>
        <p>{readiness.message}</p>
      </div>

      <NeedBlock need={request.problem || 'Not provided'} />

      <div className="detailsGrid">
        <Detail label="Category / Topic" value={displayCategory(request)} />
        <Detail label="Beneficiary Level" value={request.grade_level || 'Not provided'} />
        <Detail label="Preferred Time" value={request.preferred_time || 'Not provided'} />
        <Detail label="Scheduled Time" value={formatDate(request.scheduled_time, 'Not scheduled')} />
        <Detail label="Assigned Responder" value={request.assigned_teacher || 'Not assigned'} />
        <Detail label="Responder Status" value={request.teacher_status || 'Not offered yet'} />
        <Detail label="Created At" value={formatDate(request.created_at)} />
        <Detail label="Started At" value={formatDate(request.started_at)} />
        <Detail label="Request ID" value={request.id} />
      </div>

      {readiness.ready && (
        <button className="roomButton" onClick={() => openSupportRoom(request.id)}>
          Open Controlled Support Room
        </button>
      )}
    </section>
  )
}

function CompletionEvidencePanel({ request }: { request: SupportRequest }) {
  return (
    <section className="evidencePanel">
      <div className="sectionHeader header-green">
        <p className="sectionKicker">Completion evidence</p>
        <h2>Support Completed</h2>
        <p>
          This support session is now closed. The room is no longer open for
          normal activity, but the completion record remains visible here.
        </p>
      </div>

      <NeedBlock need={request.problem || 'Not provided'} />

      <div className="detailsGrid">
        <Detail label="Status" value="COMPLETED" />
        <Detail label="Category / Topic" value={displayCategory(request)} />
        <Detail label="Beneficiary Level" value={request.grade_level || 'Not provided'} />
        <Detail label="Responder" value={request.assigned_teacher || 'Not assigned'} />
        <Detail label="Preferred Time" value={request.preferred_time || 'Not provided'} />
        <Detail label="Scheduled Time" value={formatDate(request.scheduled_time, 'Not scheduled')} />
        <Detail label="Created At" value={formatDate(request.created_at)} />
        <Detail label="Started At" value={formatDate(effectiveStartedAt(request))} />
        <Detail label="Completed At" value={formatDate(effectiveCompletedAt(request))} />
        <Detail label="Duration" value={calculateDuration(request)} />
        <Detail label="Request ID" value={request.id} />
      </div>

      <div className="completedNotice">
        This completed support session is locked and kept as part of the evidence record.
      </div>
    </section>
  )
}

function LoadingFallback() {
  return (
    <main className="beneficiaryPage">
      <div className="pageShell">
        <p className="message">Loading beneficiary dashboard...</p>
      </div>
    </main>
  )
}

function NeedBlock({ need }: { need: string }) {
  return (
    <div className="needBox">
      <span className="miniLabel">Support need</span>
      <p>{need}</p>
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

function displayCategory(request: SupportRequest) {
  if (request.subject === 'Other' && request.custom_subject) return request.custom_subject
  if (request.subject === 'Other' && request.subject_other) return request.subject_other
  return request.subject || 'Not provided'
}

function formatDate(value: string | null | undefined, fallback = 'Not recorded') {
  if (!value) return fallback

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return fallback

  return date.toLocaleString()
}

function effectiveStartedAt(request: SupportRequest) {
  if (request.started_at) return request.started_at
  if (request.status === 'COMPLETED') return request.created_at
  return null
}

function effectiveCompletedAt(request: SupportRequest) {
  if (request.completed_at) return request.completed_at
  if (request.status === 'COMPLETED') return request.created_at
  return null
}

function calculateDuration(request: SupportRequest) {
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

function getReadiness(request: SupportRequest | null): {
  ready: boolean
  title: string
  message: string
  tone: 'blue' | 'amber' | 'green' | 'red' | 'purple'
} {
  if (!request) {
    return {
      ready: false,
      title: 'Request not loaded',
      message: 'Enter your Request ID to check the support status.',
      tone: 'blue',
    }
  }

  if (request.status === 'COMPLETED') {
    return {
      ready: false,
      title: 'Support completed',
      message: 'This support session has been completed and the room is now closed for normal use.',
      tone: 'green',
    }
  }

  if (request.status === 'ACTIVE') {
    return {
      ready: true,
      title: 'Support is active',
      message: 'Your support session is already active. Open the controlled support room to continue.',
      tone: 'green',
    }
  }

  if (request.status === 'PAID') {
    return {
      ready: true,
      title: 'Controlled support room is ready',
      message: 'Your request is ready for support. Open the controlled support room to continue.',
      tone: 'green',
    }
  }

  if (request.teacher_status === 'DECLINED') {
    return {
      ready: false,
      title: 'Responder reassignment needed',
      message: 'The responder declined this request. Admin needs to assign another approved responder.',
      tone: 'red',
    }
  }

  if (request.status === 'MATCHED') {
    return {
      ready: false,
      title: 'Responder routed, readiness pending',
      message: 'A responder has been routed to this request. The support room opens after final readiness confirmation.',
      tone: 'purple',
    }
  }

  return {
    ready: false,
    title: 'Support not ready yet',
    message: 'This request is still waiting for routing, readiness confirmation, or activation.',
    tone: 'amber',
  }
}