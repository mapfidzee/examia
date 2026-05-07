'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

type ResponderProfile = {
  id: string
  full_name: string
  email: string
  subjects: string[] | null
  grade_levels: string[] | null
  status: string
}

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
  teacher_id: string | null
  teacher_status: string | null
  created_at: string | null
  started_at: string | null
  completed_at: string | null
}

export default function ResponderDashboardPage() {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [responderEmail, setResponderEmail] = useState('')
  const [responder, setResponder] = useState<ResponderProfile | null>(null)
  const [requests, setRequests] = useState<SupportRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)

    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('examia_teacher_email')
      if (savedEmail) {
        setResponderEmail(savedEmail)
        findResponder(savedEmail)
      }
    }
  }, [])

  const offeredRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.teacher_status === 'OFFERED' && request.status !== 'COMPLETED'
      ),
    [requests]
  )

  const acceptedRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.teacher_status === 'ACCEPTED' && request.status !== 'COMPLETED'
      ),
    [requests]
  )

  const completedRequests = useMemo(
    () => requests.filter((request) => request.status === 'COMPLETED'),
    [requests]
  )

  const declinedRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.teacher_status === 'DECLINED' && request.status !== 'COMPLETED'
      ),
    [requests]
  )

  if (!mounted) return null

  async function findResponder(emailOverride?: string) {
    const emailToUse = (emailOverride || responderEmail).trim().toLowerCase()

    if (!emailToUse) {
      alert('Please enter your responder email.')
      return
    }

    setLoading(true)
    setMessage('Loading responder workspace...')
    setResponder(null)
    setRequests([])

    const { data: responderData, error: responderError } = await supabase
      .from('teacher_profiles')
      .select('*')
      .eq('email', emailToUse)
      .single()

    if (responderError || !responderData) {
      console.error(responderError)
      alert('Responder profile not found.')
      setMessage('')
      setLoading(false)
      return
    }

    setResponder(responderData)

    if (typeof window !== 'undefined') {
      localStorage.setItem('examia_teacher_email', emailToUse)
    }

    if (responderData.status !== 'APPROVED') {
      setMessage('Your responder profile is not approved yet.')
      setLoading(false)
      return
    }

    const { data: requestData, error: requestError } = await supabase
      .from('lesson_requests')
      .select('*')
      .eq('teacher_id', responderData.id)
      .order('created_at', { ascending: false })

    if (requestError) {
      console.error(requestError)
      alert('Could not load your assigned support requests.')
      setMessage('')
      setLoading(false)
      return
    }

    setRequests(requestData || [])
    setMessage('')
    setLoading(false)
  }

  async function updateRequestStatus(
    requestId: string,
    status: 'ACCEPTED' | 'DECLINED'
  ) {
    setSavingId(requestId)
    setMessage(`Updating request as ${status}...`)

    const { error } = await supabase
      .from('lesson_requests')
      .update({ teacher_status: status })
      .eq('id', requestId)

    if (error) {
      console.error(error)
      alert('Could not update request status.')
      setMessage('')
      setSavingId(null)
      return
    }

    setMessage(`Request marked as ${status}.`)
    await findResponder()
    setSavingId(null)
  }

  function openSupportRoom(requestId: string) {
    router.push(`/lesson/${requestId}`)
  }

  return (
    <main className="responderPage">
      <div className="pageShell">
        <section className="frontDoorHero">
          <div className="heroContent">
            <p className="eyebrow">EXAMIA RESPONDER DASHBOARD</p>
            <h1>Responder Control Center</h1>
            <p className="heroText">
              Review routed support requests, accept work you can deliver,
              open controlled support rooms, and track completed support history
              from one clean workspace.
            </p>
          </div>

          <div className="heroPanel">
            <p className="panelKicker">Responder workflow</p>
            <h2>Offer. Accept. Support. Complete.</h2>
            <p>
              This dashboard is the responder front door. Accepted ready requests
              show room access automatically when the Command Center activates them.
            </p>
          </div>
        </section>

        <section className="lookupPanel">
          <div>
            <p className="sectionKicker">Responder access</p>
            <h2>Load your support workspace</h2>
            <p className="sectionText">
              Enter the email used in your approved EXAMIA responder profile.
            </p>
          </div>

          <div className="lookupGrid">
            <input
              type="email"
              value={responderEmail}
              onChange={(event) => setResponderEmail(event.target.value)}
              placeholder="responder@example.com"
              className="input"
            />

            <button onClick={() => findResponder()} disabled={loading} className="loadButton">
              {loading ? 'Loading requests...' : 'Load My Requests'}
            </button>
          </div>
        </section>

        {message && <p className="message">{message}</p>}

        <section className="commandTiles">
          <CommandTile label="Offered" value={offeredRequests.length} tone="blue" />
          <CommandTile label="Accepted / Active" value={acceptedRequests.length} tone="green" />
          <CommandTile label="Completed" value={completedRequests.length} tone="purple" />
          <CommandTile label="Declined" value={declinedRequests.length} tone="red" />
        </section>

        {!responder && (
          <section className="emptyState">
            <p className="sectionKicker">No responder loaded</p>
            <h2>Start with your responder email</h2>
            <p>
              After your profile loads, this dashboard will show your routed
              support offers, active rooms, and completed support history.
            </p>
          </section>
        )}

        {responder && <ResponderProfileCard responder={responder} />}

        {responder && responder.status !== 'APPROVED' && (
          <section className="warningPanel">
            <p className="sectionKicker">Approval required</p>
            <h2>Profile not approved yet</h2>
            <p>
              Your responder profile must be approved by admin before you can
              receive or open routed support assignments.
            </p>
          </section>
        )}

        {responder && responder.status === 'APPROVED' && (
          <>
            <RequestDecisionSection
              kicker="Queue 1"
              title="New Support Offers"
              description="Accept only support requests you can confidently deliver. Decline requests you cannot support well."
              tone="blue"
              requests={offeredRequests}
              emptyText="No new support offers right now."
              savingId={savingId}
              mode="offer"
              onAccept={(id) => updateRequestStatus(id, 'ACCEPTED')}
              onDecline={(id) => updateRequestStatus(id, 'DECLINED')}
              onOpenRoom={openSupportRoom}
            />

            <RequestDecisionSection
              kicker="Queue 2"
              title="Accepted / Active Support"
              description="These requests are accepted. Once ready or active, the support room button opens the controlled room."
              tone="green"
              requests={acceptedRequests}
              emptyText="No accepted support requests right now."
              savingId={savingId}
              mode="accepted"
              onAccept={(id) => updateRequestStatus(id, 'ACCEPTED')}
              onDecline={(id) => updateRequestStatus(id, 'DECLINED')}
              onOpenRoom={openSupportRoom}
            />

            <CompletedHistorySection requests={completedRequests} />

            <RequestDecisionSection
              kicker="Archive"
              title="Declined Support Requests"
              description="These support offers were declined and are kept here for responder records."
              tone="red"
              requests={declinedRequests}
              emptyText="No declined support requests."
              savingId={savingId}
              mode="declined"
              onAccept={(id) => updateRequestStatus(id, 'ACCEPTED')}
              onDecline={(id) => updateRequestStatus(id, 'DECLINED')}
              onOpenRoom={openSupportRoom}
            />
          </>
        )}
      </div>

      <style jsx global>{`
        .responderPage {
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
        .requestCard,
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
        .requestTop {
          display: grid;
          gap: 12px;
          padding-bottom: 14px;
          margin-bottom: 14px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.18);
        }

        .profileEmail,
        .requestMeta {
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

        .requestList,
        .historyList {
          display: grid;
          gap: 14px;
        }

        .requestCard,
        .historyCard {
          padding: 16px;
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
          .responderPage {
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
          .requestTop {
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

function ResponderProfileCard({ responder }: { responder: ResponderProfile }) {
  return (
    <section className="profileCard">
      <div className="profileTop">
        <div>
          <p className="sectionKicker">Responder profile</p>
          <h2>{responder.full_name || 'Unnamed Responder'}</h2>
          <p className="profileEmail">{responder.email || 'No email provided'}</p>
        </div>

        <span className={`statusBadge status-${responder.status}`}>
          {responder.status || 'UNKNOWN'}
        </span>
      </div>

      <div className="profileGrid">
        <Detail label="Support Areas" value={formatList(responder.subjects)} />
        <Detail label="Levels / Groups" value={formatList(responder.grade_levels)} />
        <Detail label="Approval Status" value={responder.status || 'Not set'} />
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

function RequestDecisionSection({
  kicker,
  title,
  description,
  tone,
  requests,
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
  requests: SupportRequest[]
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

      {requests.length === 0 ? (
        <p className="warningBox">{emptyText}</p>
      ) : (
        <div className="requestList">
          {requests.map((request) => {
            const ready = supportRoomReady(request)

            return (
              <article className="requestCard" key={request.id}>
                <div className="requestTop">
                  <div>
                    <p className="miniLabel">Responder support record</p>
                    <h3>{displayCategory(request)}</h3>
                    <p className="requestMeta">Request Status: {request.status || 'Not set'}</p>
                  </div>

                  <span className="statusBadge status-APPROVED">
                    {request.teacher_status || 'NOT SET'}
                  </span>
                </div>

                <NeedBlock need={request.problem || 'Not provided'} />

                <div className="detailsGrid">
                  <Detail label="Category / Topic" value={displayCategory(request)} />
                  <Detail label="Beneficiary Level" value={request.grade_level || 'Not provided'} />
                  <Detail label="Preferred Time" value={request.preferred_time || 'Not provided'} />
                  <Detail label="Scheduled Time" value={formatDate(request.scheduled_time, 'Not scheduled')} />
                  <Detail label="Created At" value={formatDate(request.created_at)} />
                  <Detail label="Started At" value={formatDate(request.started_at)} />
                  <Detail label="Request ID" value={request.id} />
                </div>

                {mode === 'offer' && (
                  <div className="buttonRow">
                    <button
                      className="primaryBtn"
                      onClick={() => onAccept(request.id)}
                      disabled={savingId === request.id}
                    >
                      {savingId === request.id ? 'Updating...' : 'Accept Support Request'}
                    </button>

                    <button
                      className="secondaryBtn"
                      onClick={() => onDecline(request.id)}
                      disabled={savingId === request.id}
                    >
                      Decline Request
                    </button>
                  </div>
                )}

                {mode === 'accepted' && ready && (
                  <div className="buttonRow">
                    <button className="roomButton" onClick={() => onOpenRoom(request.id)}>
                      Open Controlled Support Room
                    </button>
                  </div>
                )}

                {mode === 'accepted' && !ready && (
                  <div className="warningBox">
                    Waiting for Command Center readiness confirmation. The room opens after Admin marks this request as READY.
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

function CompletedHistorySection({ requests }: { requests: SupportRequest[] }) {
  return (
    <section className="sectionShell">
      <div className="sectionHeader header-purple">
        <p className="sectionKicker">Completed support history</p>
        <h2>Completed Support</h2>
        <p>
          These support sessions are closed. They remain visible as your responder record.
        </p>
      </div>

      {requests.length === 0 ? (
        <p className="warningBox">No completed support sessions yet.</p>
      ) : (
        <div className="historyList">
          {requests.map((request) => (
            <article className="historyCard" key={request.id}>
              <div className="requestTop">
                <div>
                  <p className="miniLabel">Completed support record</p>
                  <h3>{displayCategory(request)}</h3>
                </div>

                <span className="statusBadge status-APPROVED">COMPLETED</span>
              </div>

              <NeedBlock need={request.problem || 'Not provided'} />

              <div className="detailsGrid">
                <Detail label="Category / Topic" value={displayCategory(request)} />
                <Detail label="Beneficiary Level" value={request.grade_level || 'Not provided'} />
                <Detail label="Scheduled Time" value={formatDate(request.scheduled_time, 'Not scheduled')} />
                <Detail label="Created At" value={formatDate(request.created_at)} />
                <Detail label="Started At" value={formatDate(effectiveStartedAt(request))} />
                <Detail label="Completed At" value={formatDate(effectiveCompletedAt(request))} />
                <Detail label="Duration" value={calculateDuration(request)} />
                <Detail label="Request ID" value={request.id} />
              </div>

              <div className="completedNotice">
                This support session is completed and locked. It is kept here as
                part of your responder history.
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
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

function supportRoomReady(request: SupportRequest) {
  return (
    request.teacher_status === 'ACCEPTED' &&
    (request.status === 'PAID' || request.status === 'ACTIVE')
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