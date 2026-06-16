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
  const [selectedResponders, setSelectedResponders] = useState<Record<string, string>>({})
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
    () => requests.filter((item) => item.status === 'PAID' || item.status === 'ACTIVE'),
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
    if (request.subject === 'Other' && request.custom_subject) return request.custom_subject
    if (request.subject === 'Other' && request.subject_other) return request.subject_other
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

  function formatDateTime(value: string | null | undefined, fallback = 'Not recorded') {
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

    const selectedResponder = responders.find((responder) => responder.id === selectedResponderId)

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

    const updateData: Record<string, string | null> = {
      status: newStatus,
    }

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
              Convert governed requests into coordinated intervention movement while
              preserving responder ownership, active support, completion evidence,
              and continuity visibility.
            </p>
          </div>

          <div className="postureBox">
            <p className="eyebrow">COMMAND POSTURE</p>
            <strong>CONTROLLED</strong>
            <span>Request movement remains governed through routing, readiness, action, and evidence.</span>
          </div>
        </section>

        <section className="quickGrid">
          <Link href="/admin/teachers" className="quickLink">Responder Governance</Link>
          <Link href="/request" className="quickLink">Request Intake</Link>
          <Link href="/cases" className="quickLink">Case Visibility</Link>
          <Link href="/routing" className="quickLink">Routing</Link>
        </section>

        <section className="commandTiles">
          <CommandTile label="Total Requests" value={summary.total} />
          <CommandTile label="New" value={summary.new} />
          <CommandTile label="Routed" value={summary.routed} />
          <CommandTile label="Ready / Active" value={summary.readyActive} />
          <CommandTile label="Evidence Locked" value={summary.completed} />
        </section>

        {message && <p className="message">{message}</p>}

        <button className="refreshBtn" onClick={loadAdminData}>
          Refresh Command
        </button>

        <OperationalSection
          kicker="Queue 1"
          title="New Requests"
          description="Requests needing responder routing and scheduled coordination."
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
          description="Requests already routed and waiting for readiness or activation."
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
          description="Interventions ready for action or currently active."
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
            Command is not closure. Command governs movement from request to routed
            ownership, active support, and completion evidence while preserving
            continuity visibility.
          </span>
        </section>
      </div>

      <style jsx global>{`
        .adminPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(214, 178, 94, 0.12), transparent 34%),
            linear-gradient(135deg, #030303 0%, #090807 48%, #11100d 100%);
          color: #fff8e7;
          padding: 32px 24px 64px;
        }

        .pageShell {
          width: min(1220px, 100%);
          margin: 0 auto;
          display: grid;
          gap: 18px;
        }

        .hero {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.65fr);
          gap: 24px;
          padding: 30px;
          border: 1px solid rgba(214, 178, 94, 0.42);
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(214,178,94,0.08), rgba(255,255,255,0.018));
        }

        .eyebrow,
        .miniLabel,
        .sectionKicker,
        .tileLabel,
        .infoLabel {
          margin: 0 0 8px;
          color: #9f8142;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h1 {
          margin: 10px 0;
          font-size: clamp(42px, 8vw, 72px);
          line-height: 0.92;
          letter-spacing: -0.075em;
        }

        h2 {
          margin: 0;
          font-size: clamp(26px, 4vw, 38px);
          line-height: 1.05;
          letter-spacing: -0.05em;
        }

        h3 {
          margin: 0;
          font-size: 22px;
          letter-spacing: -0.035em;
        }

        .heroText,
        .bodyText,
        .sectionHeader p,
        .postureBox span {
          color: #cfc7b5;
          line-height: 1.65;
          font-size: 14px;
        }

        .postureBox {
          border: 1px solid rgba(214, 178, 94, 0.42);
          border-radius: 24px;
          padding: 22px;
          background: linear-gradient(180deg, rgba(214,178,94,0.18), rgba(0,0,0,0.38));
        }

        .postureBox strong {
          display: block;
          color: #fff8e7;
          font-size: 30px;
          line-height: 1;
          margin: 10px 0;
        }

        .quickGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .quickLink {
          color: #fff8e7;
          text-decoration: none;
          border: 1px solid rgba(214,178,94,0.24);
          background: #11100d;
          border-radius: 16px;
          padding: 14px;
          text-align: center;
          font-size: 13px;
          font-weight: 950;
        }

        .commandTiles {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .commandTile,
        .sectionShell,
        .supportCard,
        .evidenceCard,
        .doctrineCard {
          border: 1px solid rgba(214,178,94,0.24);
          border-radius: 22px;
          background: #090807;
        }

        .commandTile {
          padding: 16px;
          min-height: 108px;
        }

        .tileValue {
          display: block;
          margin-top: 8px;
          color: #d6b25e;
          font-size: 36px;
          line-height: 1;
          font-weight: 950;
        }

        .message {
          background: rgba(214,178,94,0.12);
          color: #d6b25e;
          padding: 12px 14px;
          border-radius: 14px;
          border: 1px solid rgba(214,178,94,0.24);
          font-weight: 850;
          margin: 0;
        }

        .refreshBtn {
          border: none;
          border-radius: 14px;
          padding: 13px;
          background: #d6b25e;
          color: #11100d;
          font-weight: 950;
          cursor: pointer;
        }

        .sectionShell {
          padding: 18px;
        }

        .sectionHeader {
          border-radius: 18px;
          padding: 18px;
          margin-bottom: 14px;
          background: linear-gradient(135deg, rgba(214,178,94,0.13), rgba(255,255,255,0.035));
          border: 1px solid rgba(214,178,94,0.42);
        }

        .supportList,
        .evidenceList {
          display: grid;
          gap: 14px;
        }

        .supportCard,
        .evidenceCard {
          padding: 16px;
          background: #11100d;
        }

        .requestTop {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          padding-bottom: 12px;
          margin-bottom: 12px;
          border-bottom: 1px solid rgba(214,178,94,0.18);
        }

        .statusBadge {
          width: fit-content;
          border-radius: 999px;
          padding: 8px 12px;
          border: 1px solid rgba(214,178,94,0.24);
          background: rgba(214,178,94,0.12);
          color: #d6b25e;
          font-size: 11px;
          font-weight: 950;
        }

        .infoGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }

        .infoItem,
        .assignmentBox {
          background: #030303;
          border: 1px solid rgba(214,178,94,0.18);
          border-radius: 16px;
          padding: 12px;
          min-width: 0;
        }

        .infoValue {
          margin: 0;
          color: #fff8e7;
          line-height: 1.45;
          word-break: break-word;
          font-size: 13px;
        }

        .assignmentBox {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.8fr) 200px;
          gap: 10px;
          align-items: end;
          margin-top: 12px;
        }

        label {
          color: #cfc7b5;
          font-size: 12px;
          font-weight: 900;
        }

        select,
        input {
          width: 100%;
          box-sizing: border-box;
          margin-top: 7px;
          border: 1px solid rgba(214,178,94,0.24);
          border-radius: 14px;
          padding: 12px;
          background: #090807;
          color: #fff8e7;
          font-size: 14px;
        }

        .actionRow,
        .evidenceActions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 12px;
        }

        .actionBtn,
        .directLink {
          border: 1px solid rgba(214,178,94,0.24);
          border-radius: 14px;
          padding: 13px;
          background: rgba(214,178,94,0.12);
          color: #fff8e7;
          font-weight: 950;
          cursor: pointer;
          text-align: center;
          text-decoration: none;
          font-size: 13px;
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
          margin-top: 12px;
          padding: 13px;
          border-radius: 16px;
          background: rgba(214,178,94,0.1);
          border: 1px solid rgba(214,178,94,0.24);
          color: #f5f0e6;
          font-weight: 800;
          line-height: 1.45;
        }

        .emptyBox {
          color: #cfc7b5;
          background: #030303;
          padding: 15px;
          border-radius: 16px;
          border: 1px dashed rgba(214,178,94,0.28);
          margin: 0;
        }

        .doctrineCard {
          display: grid;
          gap: 8px;
          padding: 20px;
          line-height: 1.65;
          font-size: 13px;
        }

        .doctrineCard strong {
          color: #fff8e7;
        }

        @media (max-width: 900px) {
          .hero,
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
            <a className="directLink" href={interventionRoomLink} target="_blank" rel="noreferrer">
              Open Intervention Room
            </a>
            <a className="directLink" href={caseVisibilityLink} target="_blank" rel="noreferrer">
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
        <p>
          Completed interventions remain visible for continuity history,
          accountability, institutional reporting, and proof of completed work.
        </p>
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

                <div className="infoGrid">
                  <Info label="Support Domain" value={displayCategory(request)} />
                  <Info label="Beneficiary Level" value={request.grade_level || 'Not provided'} />
                  <Info label="Support Need" value={request.problem || 'Not provided'} />
                  <Info label="Assigned Responder" value={request.assigned_teacher || 'Not assigned'} />
                  <Info label="Responder Status" value={request.teacher_status || 'Not offered yet'} />
                  <Info label="Created At" value={formatDateTime(request.created_at)} />
                  <Info label="Started At" value={formatDateTime(effectiveStartedAt(request))} />
                  <Info label="Completed At" value={formatDateTime(effectiveCompletedAt(request))} />
                  <Info label="Duration" value={calculateDuration(request)} />
                  <Info label="Request ID" value={request.id} />
                </div>

                <div className="completedNotice">
                  This intervention is completed and locked. No assignment or
                  status action is shown because this is now an evidence record.
                </div>

                <div className="evidenceActions">
                  <a className="directLink" href={interventionRoomLink} target="_blank" rel="noreferrer">
                    Open Intervention Room
                  </a>
                  <a className="directLink" href={caseVisibilityLink} target="_blank" rel="noreferrer">
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
      <Info label="Support Domain" value={displayCategory(request)} />
      <Info label="Beneficiary Level" value={request.grade_level || 'Not provided'} />
      <Info label="Support Need" value={request.problem || 'Not provided'} />
      <Info label="Preferred Time" value={request.preferred_time || 'Not provided'} />
      <Info label="Scheduled Time" value={formatDateTime(request.scheduled_time, 'Not scheduled')} />
      <Info label="Assigned Responder" value={request.assigned_teacher || 'Not assigned'} />
      <Info label="Responder Status" value={request.teacher_status || 'Not offered yet'} />
      <Info label="Created At" value={formatDateTime(request.created_at)} />
      <Info label="Started At" value={formatDateTime(request.started_at)} />
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