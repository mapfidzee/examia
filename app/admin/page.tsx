'use client'

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

const APP_URL = 'https://examia-ten.vercel.app'

type RequestStatus = 'NEW' | 'MATCHED' | 'PAID' | 'ACTIVE' | 'COMPLETED' | string

type SupportRequest = {
  id: string
  subject: string
  custom_subject?: string | null
  subject_other?: string | null
  grade_level: string | null
  problem: string
  preferred_time: string | null
  scheduled_time: string | null
  status: RequestStatus
  assigned_teacher: string | null
  teacher_id: string | null
  teacher_status: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
}

type ResponderProfile = {
  id: string
  full_name: string
  email: string
  subjects: string[] | null
  grade_levels: string[] | null
  status: string
}

export default function AdminPage() {
  return (
    <GovernanceRouteGuard allowedRoles={['SUPER_ADMIN']}>
      <CGIGovernanceShell>
        <AdminContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function AdminContent() {
  const [requests, setRequests] = useState<SupportRequest[]>([])
  const [responders, setResponders] = useState<ResponderProfile[]>([])
  const [message, setMessage] = useState('Loading command...')
  const [selectedResponders, setSelectedResponders] = useState<
    Record<string, string>
  >({})
  const [timeInputs, setTimeInputs] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [statusSavingId, setStatusSavingId] = useState<string | null>(null)

  useEffect(() => {
    loadAdminData()
  }, [])

  const newRequests = useMemo(
    () => requests.filter((item) => item.status === 'NEW'),
    [requests],
  )

  const routedRequests = useMemo(
    () => requests.filter((item) => item.status === 'MATCHED'),
    [requests],
  )

  const readyActiveRequests = useMemo(
    () =>
      requests.filter((item) => item.status === 'PAID' || item.status === 'ACTIVE'),
    [requests],
  )

  const completedRequests = useMemo(
    () => requests.filter((item) => item.status === 'COMPLETED'),
    [requests],
  )

  const summary = useMemo(
    () => ({
      total: requests.length,
      new: newRequests.length,
      routed: routedRequests.length,
      readyActive: readyActiveRequests.length,
      completed: completedRequests.length,
    }),
    [requests, newRequests, routedRequests, readyActiveRequests, completedRequests],
  )

  async function loadAdminData() {
    setMessage('Loading command...')

    const { data: requestData, error: requestError } = await supabase
      .from('lesson_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (requestError) {
      setMessage('Command could not load support requests.')
      console.error(requestError)
      return
    }

    const { data: responderData, error: responderError } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('status', 'APPROVED')
      .order('full_name', { ascending: true })

    if (responderError) {
      setMessage('Command could not load approved responders.')
      console.error(responderError)
      return
    }

    setRequests(requestData || [])
    setResponders(responderData || [])
    setMessage('Command lifecycle loaded.')

    const responderMap: Record<string, string> = {}
    const timeMap: Record<string, string> = {}

    requestData?.forEach((request) => {
      responderMap[request.id] = request.teacher_id || ''
      timeMap[request.id] = request.scheduled_time || ''
    })

    setSelectedResponders(responderMap)
    setTimeInputs(timeMap)
  }

  function displayCategory(request: SupportRequest) {
    if (request.subject === 'Other' && request.custom_subject) {
      return request.custom_subject
    }

    if (request.subject === 'Other' && request.subject_other) {
      return request.subject_other
    }

    return request.subject || 'Not provided'
  }

  function responderLabel(responder: ResponderProfile) {
    const subjects =
      responder.subjects && responder.subjects.length > 0
        ? responder.subjects.join(', ')
        : 'Areas not listed'

    const levels =
      responder.grade_levels && responder.grade_levels.length > 0
        ? responder.grade_levels.join(', ')
        : 'Levels not listed'

    return `${responder.full_name} — ${subjects} — ${levels}`
  }

  function formatDateTime(
    value: string | null | undefined,
    fallback = 'Not recorded',
  ) {
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

  async function saveAssignment(request: SupportRequest) {
    const selectedResponderId = selectedResponders[request.id]
    const scheduledTime = timeInputs[request.id]?.trim()

    if (!selectedResponderId) {
      alert('Please select an approved responder.')
      return
    }

    const selectedResponder = responders.find(
      (responder) => responder.id === selectedResponderId,
    )

    if (!selectedResponder) {
      alert('Selected responder not found.')
      return
    }

    setSavingId(request.id)

    const { error } = await supabase
      .from('lesson_requests')
      .update({
        teacher_id: selectedResponder.id,
        assigned_teacher: selectedResponder.full_name,
        scheduled_time: scheduledTime || null,
        teacher_status: 'OFFERED',
        status: 'MATCHED',
      })
      .eq('id', request.id)

    if (error) {
      alert('Responder routing failed.')
      console.error(error)
    } else {
      await loadAdminData()
    }

    setSavingId(null)
  }

  async function updateStatus(request: SupportRequest, newStatus: RequestStatus) {
    setStatusSavingId(request.id)

    const now = new Date().toISOString()
    const updateData: Record<string, string | null> = { status: newStatus }

    if (newStatus === 'ACTIVE' && !request.started_at) {
      updateData.started_at = now
    }

    if (newStatus === 'COMPLETED') {
      if (!request.started_at) updateData.started_at = now
      if (!request.completed_at) updateData.completed_at = now
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

  return (
    <main className="adminPage">
      <div className="pageShell">
        <section className="hero">
          <div>
            <p className="eyebrow">TSINAXA CGI • COMMAND</p>
            <h1>Command</h1>
            <p className="heroText">
              Govern request movement from routing to active support and locked
              evidence.
            </p>
          </div>

          <div className="postureBox">
            <p className="eyebrow">COMMAND POSTURE</p>
            <strong>CONTROLLED</strong>
            <span>Movement remains governed through routing, readiness, action, and evidence.</span>
          </div>
        </section>

        <section className="topLine">
          <nav className="quickGrid" aria-label="Command links">
            <Link href="/admin/teachers" className="quickLink">
              Responder Governance
            </Link>
            <Link href="/request" className="quickLink">
              Request Intake
            </Link>
            <Link href="/cases" className="quickLink">
              Case Visibility
            </Link>
            <Link href="/routing" className="quickLink">
              Routing
            </Link>
          </nav>

          <button className="refreshBtn" onClick={loadAdminData}>
            Refresh
          </button>
        </section>

        <section className="commandTiles">
          <CommandTile label="Total" value={summary.total} />
          <CommandTile label="New" value={summary.new} />
          <CommandTile label="Routed" value={summary.routed} />
          <CommandTile label="Active" value={summary.readyActive} />
          <CommandTile label="Evidence" value={summary.completed} />
        </section>

        {message && <p className="message">{message}</p>}

        <OperationalSection
          kicker="Queue 1"
          title="New Requests"
          description="Awaiting routing."
          requests={newRequests}
          emptyText="No new requests right now."
          responders={responders}
          selectedResponders={selectedResponders}
          timeInputs={timeInputs}
          savingId={savingId}
          statusSavingId={statusSavingId}
          displayCategory={displayCategory}
          responderLabel={responderLabel}
          formatDateTime={formatDateTime}
          setSelectedResponders={setSelectedResponders}
          setTimeInputs={setTimeInputs}
          saveAssignment={saveAssignment}
          updateStatus={updateStatus}
        />

        <OperationalSection
          kicker="Queue 2"
          title="Routed Interventions"
          description="Awaiting readiness."
          requests={routedRequests}
          emptyText="No routed interventions waiting right now."
          responders={responders}
          selectedResponders={selectedResponders}
          timeInputs={timeInputs}
          savingId={savingId}
          statusSavingId={statusSavingId}
          displayCategory={displayCategory}
          responderLabel={responderLabel}
          formatDateTime={formatDateTime}
          setSelectedResponders={setSelectedResponders}
          setTimeInputs={setTimeInputs}
          saveAssignment={saveAssignment}
          updateStatus={updateStatus}
        />

        <OperationalSection
          kicker="Queue 3"
          title="Ready / Active Interventions"
          description="Awaiting action or completion."
          requests={readyActiveRequests}
          emptyText="No ready or active interventions right now."
          responders={responders}
          selectedResponders={selectedResponders}
          timeInputs={timeInputs}
          savingId={savingId}
          statusSavingId={statusSavingId}
          displayCategory={displayCategory}
          responderLabel={responderLabel}
          formatDateTime={formatDateTime}
          setSelectedResponders={setSelectedResponders}
          setTimeInputs={setTimeInputs}
          saveAssignment={saveAssignment}
          updateStatus={updateStatus}
        />

        <CompletionEvidenceSection
          requests={completedRequests}
          displayCategory={displayCategory}
          formatDateTime={formatDateTime}
          effectiveStartedAt={effectiveStartedAt}
          effectiveCompletedAt={effectiveCompletedAt}
          calculateDuration={calculateDuration}
        />

        <section className="doctrineCard">
          <strong>COMMAND DOCTRINE</strong>
          <span>
            Command is not closure. Command governs movement from request to
            routed ownership, active support, and completion evidence while
            preserving continuity visibility.
          </span>
        </section>
      </div>

      <style jsx global>{`
        .adminPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(214, 178, 94, 0.1), transparent 32%),
            linear-gradient(135deg, #030303 0%, #090807 50%, #11100d 100%);
          color: #fff8e7;
          padding: 22px 22px 52px;
        }

        .pageShell {
          width: min(1180px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 14px;
        }

        .hero {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(250px, 0.55fr);
          gap: 18px;
          padding: 22px;
          border: 1px solid rgba(214, 178, 94, 0.36);
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(214,178,94,0.07), rgba(255,255,255,0.014));
        }

        .eyebrow,
        .miniLabel,
        .sectionKicker,
        .tileLabel,
        .infoLabel {
          margin: 0 0 6px;
          color: #9f8142;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h1 {
          margin: 6px 0;
          font-size: clamp(34px, 6vw, 56px);
          line-height: 0.95;
          letter-spacing: -0.065em;
        }

        h2 {
          margin: 0;
          font-size: clamp(22px, 3.5vw, 32px);
          line-height: 1.05;
          letter-spacing: -0.045em;
        }

        h3 {
          margin: 0;
          font-size: 19px;
          letter-spacing: -0.03em;
        }

        .heroText,
        .bodyText,
        .sectionHeader p,
        .postureBox span {
          color: #cfc7b5;
          line-height: 1.55;
          font-size: 13px;
        }

        .postureBox {
          border: 1px solid rgba(214, 178, 94, 0.32);
          border-radius: 20px;
          padding: 18px;
          background: linear-gradient(180deg, rgba(214,178,94,0.14), rgba(0,0,0,0.32));
        }

        .postureBox strong {
          display: block;
          color: #fff8e7;
          font-size: 24px;
          line-height: 1;
          margin: 8px 0;
        }

        .topLine {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 120px;
          gap: 10px;
          align-items: stretch;
        }

        .quickGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .quickLink {
          color: #fff8e7;
          text-decoration: none;
          border: 1px solid rgba(214,178,94,0.2);
          background: #11100d;
          border-radius: 13px;
          padding: 10px;
          text-align: center;
          font-size: 12px;
          font-weight: 950;
        }

        .refreshBtn {
          border: 1px solid rgba(214,178,94,0.28);
          border-radius: 13px;
          padding: 10px;
          background: rgba(214,178,94,0.14);
          color: #d6b25e;
          font-weight: 950;
          cursor: pointer;
          font-size: 12px;
        }

        .commandTiles {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }

        .commandTile,
        .sectionShell,
        .supportCard,
        .evidenceCard,
        .doctrineCard {
          border: 1px solid rgba(214,178,94,0.22);
          border-radius: 20px;
          background: #090807;
        }

        .commandTile {
          padding: 12px;
          min-height: 78px;
        }

        .tileValue {
          display: block;
          margin-top: 6px;
          color: #d6b25e;
          font-size: 28px;
          line-height: 1;
          font-weight: 950;
        }

        .message {
          background: rgba(214,178,94,0.1);
          color: #d6b25e;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(214,178,94,0.2);
          font-weight: 850;
          font-size: 12px;
          margin: 0;
        }

        .sectionShell {
          padding: 14px;
        }

        .sectionHeader {
          border-radius: 16px;
          padding: 14px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, rgba(214,178,94,0.1), rgba(255,255,255,0.025));
          border: 1px solid rgba(214,178,94,0.32);
        }

        .supportList,
        .evidenceList {
          display: grid;
          gap: 12px;
        }

        .supportCard,
        .evidenceCard {
          padding: 13px;
          background: #11100d;
        }

        .requestTop {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          padding-bottom: 10px;
          margin-bottom: 10px;
          border-bottom: 1px solid rgba(214,178,94,0.16);
        }

        .statusBadge {
          width: fit-content;
          border-radius: 999px;
          padding: 7px 10px;
          border: 1px solid rgba(214,178,94,0.22);
          background: rgba(214,178,94,0.12);
          color: #d6b25e;
          font-size: 10px;
          font-weight: 950;
        }

        .infoGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 10px;
        }

        .infoItem,
        .assignmentBox {
          background: #030303;
          border: 1px solid rgba(214,178,94,0.16);
          border-radius: 13px;
          padding: 10px;
          min-width: 0;
        }

        .infoValue {
          margin: 0;
          color: #fff8e7;
          line-height: 1.35;
          word-break: break-word;
          font-size: 12px;
        }

        .assignmentBox {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.8fr) 180px;
          gap: 8px;
          align-items: end;
          margin-top: 10px;
        }

        label {
          color: #cfc7b5;
          font-size: 11px;
          font-weight: 900;
        }

        select,
        input {
          width: 100%;
          box-sizing: border-box;
          margin-top: 6px;
          border: 1px solid rgba(214,178,94,0.2);
          border-radius: 12px;
          padding: 10px;
          background: #090807;
          color: #fff8e7;
          font-size: 13px;
        }

        .actionRow,
        .evidenceActions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 10px;
        }

        .actionBtn,
        .directLink {
          border: 1px solid rgba(214,178,94,0.2);
          border-radius: 12px;
          padding: 10px;
          background: rgba(214,178,94,0.1);
          color: #fff8e7;
          font-weight: 950;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          font-size: 12px;
        }

        .primaryAction {
          background: #d6b25e;
          color: #11100d;
          border: none;
        }

        button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .completedNotice {
          margin-top: 10px;
          padding: 11px;
          border-radius: 13px;
          background: rgba(214,178,94,0.1);
          border: 1px solid rgba(214,178,94,0.2);
          color: #f5f0e6;
          font-weight: 800;
          line-height: 1.4;
          font-size: 12px;
        }

        .emptyBox {
          color: #cfc7b5;
          background: #030303;
          padding: 12px;
          border-radius: 13px;
          border: 1px dashed rgba(214,178,94,0.24);
          margin: 0;
          font-size: 12px;
        }

        .doctrineCard {
          display: grid;
          gap: 7px;
          padding: 16px;
          line-height: 1.55;
          font-size: 12px;
        }

        .doctrineCard strong {
          color: #fff8e7;
        }

        @media (max-width: 900px) {
          .hero,
          .topLine,
          .assignmentBox,
          .requestTop {
            grid-template-columns: 1fr;
          }

          .quickGrid,
          .commandTiles,
          .infoGrid,
          .actionRow,
          .evidenceActions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  )
}

function CommandTile({ label, value }: { label: string; value: number }) {
  return (
    <article className="commandTile">
      <p className="tileLabel">{label}</p>
      <strong className="tileValue">{value}</strong>
    </article>
  )
}

function OperationalSection({
  kicker,
  title,
  description,
  requests,
  emptyText,
  responders,
  selectedResponders,
  timeInputs,
  savingId,
  statusSavingId,
  displayCategory,
  responderLabel,
  formatDateTime,
  setSelectedResponders,
  setTimeInputs,
  saveAssignment,
  updateStatus,
}: {
  kicker: string
  title: string
  description: string
  requests: SupportRequest[]
  emptyText: string
  responders: ResponderProfile[]
  selectedResponders: Record<string, string>
  timeInputs: Record<string, string>
  savingId: string | null
  statusSavingId: string | null
  displayCategory: (request: SupportRequest) => string
  responderLabel: (responder: ResponderProfile) => string
  formatDateTime: (value: string | null | undefined, fallback?: string) => string
  setSelectedResponders: Dispatch<SetStateAction<Record<string, string>>>
  setTimeInputs: Dispatch<SetStateAction<Record<string, string>>>
  saveAssignment: (request: SupportRequest) => void
  updateStatus: (request: SupportRequest, newStatus: RequestStatus) => void
}) {
  return (
    <section className="sectionShell">
      <div className="sectionHeader">
        <p className="sectionKicker">{kicker}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {requests.length === 0 ? (
        <p className="emptyBox">{emptyText}</p>
      ) : (
        <div className="supportList">
          {requests.map((request) => (
            <OperationalCard
              key={request.id}
              request={request}
              responders={responders}
              selectedResponders={selectedResponders}
              timeInputs={timeInputs}
              savingId={savingId}
              statusSavingId={statusSavingId}
              displayCategory={displayCategory}
              responderLabel={responderLabel}
              formatDateTime={formatDateTime}
              setSelectedResponders={setSelectedResponders}
              setTimeInputs={setTimeInputs}
              saveAssignment={saveAssignment}
              updateStatus={updateStatus}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function OperationalCard({
  request,
  responders,
  selectedResponders,
  timeInputs,
  savingId,
  statusSavingId,
  displayCategory,
  responderLabel,
  formatDateTime,
  setSelectedResponders,
  setTimeInputs,
  saveAssignment,
  updateStatus,
}: {
  request: SupportRequest
  responders: ResponderProfile[]
  selectedResponders: Record<string, string>
  timeInputs: Record<string, string>
  savingId: string | null
  statusSavingId: string | null
  displayCategory: (request: SupportRequest) => string
  responderLabel: (responder: ResponderProfile) => string
  formatDateTime: (value: string | null | undefined, fallback?: string) => string
  setSelectedResponders: Dispatch<SetStateAction<Record<string, string>>>
  setTimeInputs: Dispatch<SetStateAction<Record<string, string>>>
  saveAssignment: (request: SupportRequest) => void
  updateStatus: (request: SupportRequest, newStatus: RequestStatus) => void
}) {
  const interventionRoomLink = `${APP_URL}/lesson/${request.id}`
  const caseVisibilityLink = `${APP_URL}/student-dashboard?lessonId=${request.id}`

  return (
    <article className="supportCard">
      <RecordHeader
        label="Operational support record"
        title={displayCategory(request)}
        status={request.status || 'UNKNOWN'}
      />

      <RequestInfoGrid
        request={request}
        displayCategory={displayCategory}
        formatDateTime={formatDateTime}
      />

      {request.status === 'NEW' && (
        <div className="assignmentBox">
          <label>
            Select approved responder
            <select
              value={selectedResponders[request.id] || ''}
              onChange={(event) =>
                setSelectedResponders((prev) => ({
                  ...prev,
                  [request.id]: event.target.value,
                }))
              }
            >
              <option value="">Select approved responder</option>
              {responders.map((responder) => (
                <option key={responder.id} value={responder.id}>
                  {responderLabel(responder)}
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
            className="actionBtn primaryAction"
            onClick={() => saveAssignment(request)}
            disabled={savingId === request.id}
          >
            {savingId === request.id ? 'Routing...' : 'Route Responder'}
          </button>
        </div>
      )}

      <div className="actionRow">
        {request.status === 'MATCHED' && (
          <ActionButton
            label="Mark Ready"
            primary
            disabled={statusSavingId === request.id}
            onClick={() => updateStatus(request, 'PAID')}
          />
        )}

        {request.status === 'PAID' && (
          <ActionButton
            label="Start Intervention"
            primary
            disabled={statusSavingId === request.id}
            onClick={() => updateStatus(request, 'ACTIVE')}
          />
        )}

        {request.status === 'ACTIVE' && (
          <ActionButton
            label="Complete Intervention"
            primary
            disabled={statusSavingId === request.id}
            onClick={() => updateStatus(request, 'COMPLETED')}
          />
        )}

        {(request.status === 'PAID' || request.status === 'ACTIVE') && (
          <>
            <a
              className="directLink"
              href={interventionRoomLink}
              target="_blank"
              rel="noreferrer"
            >
              Open Intervention Room
            </a>
            <a
              className="directLink"
              href={caseVisibilityLink}
              target="_blank"
              rel="noreferrer"
            >
              Open Case Visibility
            </a>
          </>
        )}
      </div>
    </article>
  )
}

function CompletionEvidenceSection({
  requests,
  displayCategory,
  formatDateTime,
  effectiveStartedAt,
  effectiveCompletedAt,
  calculateDuration,
}: {
  requests: SupportRequest[]
  displayCategory: (request: SupportRequest) => string
  formatDateTime: (value: string | null | undefined, fallback?: string) => string
  effectiveStartedAt: (request: SupportRequest) => string | null
  effectiveCompletedAt: (request: SupportRequest) => string | null
  calculateDuration: (request: SupportRequest) => string
}) {
  return (
    <section className="sectionShell">
      <div className="sectionHeader">
        <p className="sectionKicker">Locked Evidence</p>
        <h2>Completion Evidence</h2>
        <p>Completed interventions remain visible for continuity history and proof.</p>
      </div>

      {requests.length === 0 ? (
        <p className="emptyBox">No completed interventions yet.</p>
      ) : (
        <div className="evidenceList">
          {requests.map((request) => {
            const interventionRoomLink = `${APP_URL}/lesson/${request.id}`
            const caseVisibilityLink = `${APP_URL}/student-dashboard?lessonId=${request.id}`

            return (
              <article className="evidenceCard" key={request.id}>
                <RecordHeader
                  label="Completed intervention record"
                  title={displayCategory(request)}
                  status="COMPLETED"
                />

                <CompactEvidenceGrid
                  request={request}
                  displayCategory={displayCategory}
                  formatDateTime={formatDateTime}
                  effectiveStartedAt={effectiveStartedAt}
                  effectiveCompletedAt={effectiveCompletedAt}
                  calculateDuration={calculateDuration}
                />

                <div className="completedNotice">
                  Completed and locked. No assignment or status action is shown.
                </div>

                <div className="evidenceActions">
                  <a
                    className="directLink"
                    href={interventionRoomLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Intervention Room
                  </a>
                  <a
                    className="directLink"
                    href={caseVisibilityLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Case Visibility
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

function RequestInfoGrid({
  request,
  displayCategory,
  formatDateTime,
}: {
  request: SupportRequest
  displayCategory: (request: SupportRequest) => string
  formatDateTime: (value: string | null | undefined, fallback?: string) => string
}) {
  return (
    <div className="infoGrid">
      <Info label="Domain" value={displayCategory(request)} />
      <Info label="Level" value={request.grade_level || 'Not provided'} />
      <Info label="Need" value={request.problem || 'Not provided'} />
      <Info label="Preferred" value={request.preferred_time || 'Not provided'} />
      <Info
        label="Scheduled"
        value={formatDateTime(request.scheduled_time, 'Not scheduled')}
      />
      <Info label="Responder" value={request.assigned_teacher || 'Not assigned'} />
      <Info label="Responder Status" value={request.teacher_status || 'Not offered yet'} />
      <Info label="Created" value={formatDateTime(request.created_at)} />
      <Info label="Started" value={formatDateTime(request.started_at)} />
      <Info label="Request ID" value={request.id} />
    </div>
  )
}

function CompactEvidenceGrid({
  request,
  displayCategory,
  formatDateTime,
  effectiveStartedAt,
  effectiveCompletedAt,
  calculateDuration,
}: {
  request: SupportRequest
  displayCategory: (request: SupportRequest) => string
  formatDateTime: (value: string | null | undefined, fallback?: string) => string
  effectiveStartedAt: (request: SupportRequest) => string | null
  effectiveCompletedAt: (request: SupportRequest) => string | null
  calculateDuration: (request: SupportRequest) => string
}) {
  return (
    <div className="infoGrid compactGrid">
      <Info label="Domain" value={displayCategory(request)} />
      <Info label="Responder" value={request.assigned_teacher || 'Not assigned'} />
      <Info label="Completed" value={formatDateTime(effectiveCompletedAt(request))} />
      <Info label="Duration" value={calculateDuration(request)} />
      <Info label="Started" value={formatDateTime(effectiveStartedAt(request))} />
      <Info label="Request ID" value={request.id} />
    </div>
  )
}

function RecordHeader({
  label,
  title,
  status,
}: {
  label: string
  title: string
  status: string
}) {
  return (
    <div className="requestTop">
      <div>
        <p className="miniLabel">{label}</p>
        <h3>{title}</h3>
      </div>
      <span className="statusBadge">{status}</span>
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
  disabled,
  onClick,
  primary = false,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      className={`actionBtn ${primary ? 'primaryAction' : ''}`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
}