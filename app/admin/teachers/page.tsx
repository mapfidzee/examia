'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
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
  return (
    <GovernanceRouteGuard allowedRoles={['SUPER_ADMIN', 'GOVERNANCE_OFFICER']}>
      <ResponderGovernanceContent />
    </GovernanceRouteGuard>
  )
}

function ResponderGovernanceContent() {
  const [responders, setResponders] = useState<TeacherProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    loadResponders()
  }, [])

  const pendingResponders = useMemo(
    () => responders.filter((responder) => responder.status === 'PENDING'),
    [responders]
  )

  const approvedResponders = useMemo(
    () => responders.filter((responder) => responder.status === 'APPROVED'),
    [responders]
  )

  const suspendedResponders = useMemo(
    () => responders.filter((responder) => responder.status === 'SUSPENDED'),
    [responders]
  )

  async function loadResponders() {
    setLoading(true)
    setMessage('Loading responder governance center...')

    const { data, error } = await supabase
      .from('teacher_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setMessage('Could not load responder profiles.')
      setLoading(false)
      return
    }

    setResponders(data || [])
    setMessage('')
    setLoading(false)
  }

  async function updateResponderStatus(id: string, status: string) {
    setSavingId(id)
    setMessage('Updating responder status...')

    const { error } = await supabase
      .from('teacher_profiles')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Could not update responder status.')
      setMessage('')
      setSavingId(null)
      return
    }

    setMessage(`Responder marked as ${status}.`)
    await loadResponders()
    setSavingId(null)
  }

  return (
    <main className="teacherGovernancePage">
      <div className="pageShell">
        <section className="frontDoorHero">
          <div className="heroContent">
            <p className="eyebrow">EXAMIA RESPONDER GOVERNANCE</p>
            <h1>Responder Governance Center</h1>
            <p className="heroText">
              Review, approve, suspend, and restore responders inside EXAMIA.
              This protected governance surface controls who can receive
              stabilization assignments and participate in governed recovery
              action.
            </p>

            <div className="heroActions">
              <Link href="/admin" className="heroButton primaryHeroButton">
                Admin Command Center
              </Link>

              <Link href="/teacher" className="heroButton successHeroButton">
                Responder Intake
              </Link>

              <button className="heroButton refreshHeroButton" onClick={loadResponders}>
                Refresh Responders
              </button>
            </div>
          </div>

          <div className="heroPanel">
            <p className="panelKicker">Governance focus</p>
            <h2>Controlled responder pool. Clear approval flow.</h2>
            <p>
              Pending responders wait for review. Approved responders can receive
              governed assignments. Suspended responders remain blocked until
              governance restores them.
            </p>
          </div>
        </section>

        <section className="commandTiles">
          <CommandTile
            label="Pending Review"
            value={pendingResponders.length}
            description="Responders waiting for governance decision"
            tone="amber"
          />
          <CommandTile
            label="Approved Pool"
            value={approvedResponders.length}
            description="Responders ready for assignment"
            tone="green"
          />
          <CommandTile
            label="Suspended"
            value={suspendedResponders.length}
            description="Responders blocked from assignment"
            tone="red"
          />
          <CommandTile
            label="Total Profiles"
            value={responders.length}
            description="All responder records in the system"
            tone="blue"
          />
        </section>

        {message && <p className="message">{message}</p>}

        {loading ? (
          <section className="sectionShell">
            <p className="emptyText">Loading responder profiles...</p>
          </section>
        ) : (
          <>
            <ResponderDecisionSection
              kicker="Step 1"
              title="Pending Review"
              description="Review these responder applications before they enter the active assignment pool."
              tone="amber"
              responders={pendingResponders}
              emptyText="No responders are waiting for review."
              savingId={savingId}
              primaryLabel="Approve Responder"
              primaryAction={(id) => updateResponderStatus(id, 'APPROVED')}
              secondaryLabel="Suspend"
              secondaryAction={(id) => updateResponderStatus(id, 'SUSPENDED')}
            />

            <ResponderDecisionSection
              kicker="Step 2"
              title="Approved Responder Pool"
              description="These responders are active and can receive governed assignments from the Admin Command Center."
              tone="green"
              responders={approvedResponders}
              emptyText="No approved responders yet."
              savingId={savingId}
              primaryLabel="Suspend Responder"
              primaryAction={(id) => updateResponderStatus(id, 'SUSPENDED')}
              secondaryLabel="Return to Pending"
              secondaryAction={(id) => updateResponderStatus(id, 'PENDING')}
            />

            <ResponderDecisionSection
              kicker="Step 3"
              title="Suspended Responders"
              description="These responders are blocked from assignment until governance restores them."
              tone="red"
              responders={suspendedResponders}
              emptyText="No suspended responders."
              savingId={savingId}
              primaryLabel="Approve Again"
              primaryAction={(id) => updateResponderStatus(id, 'APPROVED')}
              secondaryLabel="Return to Pending"
              secondaryAction={(id) => updateResponderStatus(id, 'PENDING')}
            />

            <ResponderProfileRecords responders={responders} />
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

function ResponderDecisionSection({
  kicker,
  title,
  description,
  tone,
  responders,
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
  responders: TeacherProfile[]
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

      {responders.length === 0 ? (
        <p className="emptyBox">{emptyText}</p>
      ) : (
        <div className="teacherDecisionList">
          {responders.map((responder) => (
            <article className="teacherDecisionCard" key={responder.id}>
              <div className="teacherTop">
                <div>
                  <p className="miniLabel">Responder decision record</p>
                  <h3>{responder.full_name || 'Unnamed Responder'}</h3>
                  <p className="teacherEmail">
                    {responder.email || 'No email provided'}
                  </p>
                </div>

                <span className={`statusBadge status-${responder.status}`}>
                  {responder.status || 'UNKNOWN'}
                </span>
              </div>

              <div className="decisionInfoGrid">
                <Detail label="Domains" value={formatList(responder.subjects)} />
                <Detail label="Operational Levels" value={formatList(responder.grade_levels)} />
                <Detail label="Expected Rate" value={formatMoney(responder.hourly_rate)} />
              </div>

              <div className="buttonRow">
                <button
                  className="primaryBtn"
                  onClick={() => primaryAction(responder.id)}
                  disabled={savingId === responder.id}
                >
                  {savingId === responder.id ? 'Updating...' : primaryLabel}
                </button>

                <button
                  className="secondaryBtn"
                  onClick={() => secondaryAction(responder.id)}
                  disabled={savingId === responder.id}
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

function ResponderProfileRecords({ responders }: { responders: TeacherProfile[] }) {
  return (
    <section className="sectionShell">
      <div className="sectionHeader header-blue">
        <p className="sectionKicker">Reference records</p>
        <h2>Full Responder Profile Records</h2>
        <p>
          Use this section to review the full responder profile clearly.
          Governance decisions are handled in the decision sections above.
        </p>
      </div>

      {responders.length === 0 ? (
        <p className="emptyBox">No responder profiles found.</p>
      ) : (
        <div className="teacherProfileList">
          {responders.map((responder) => (
            <article className="teacherProfileCard" key={responder.id}>
              <div className="profileTop">
                <div>
                  <p className="miniLabel">Responder profile</p>
                  <h3>{responder.full_name || 'Unnamed Responder'}</h3>
                  <p className="profileEmail">
                    {responder.email || 'No email provided'}
                  </p>
                </div>

                <span className={`statusBadge status-${responder.status}`}>
                  {responder.status || 'UNKNOWN'}
                </span>
              </div>

              <div className="profileInfoGrid">
                <Detail label="Domains" value={formatList(responder.subjects)} />
                <Detail label="Operational Levels" value={formatList(responder.grade_levels)} />
                <Detail label="Region" value={responder.province || 'Not provided'} />
                <Detail label="Languages" value={formatList(responder.spoken_languages)} />
                <Detail label="Expected Rate" value={formatMoney(responder.hourly_rate)} />
                <Detail label="Submitted At" value={formatDateTime(responder.created_at)} />
              </div>

              <div className="bioBox">
                <span>Responder evidence</span>
                <p>{responder.bio || 'No profile evidence provided.'}</p>
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