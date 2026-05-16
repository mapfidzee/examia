'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../../../lib/supabase'

type BeneficiaryCase = {
  id: string
  beneficiary_name?: string | null
  beneficiary_level?: string | null
  support_domain?: string | null
  case_status?: string | null
  severity_level?: string | null
  region?: string | null
  institution_name?: string | null
  safeguarding_flag?: boolean | null
  intervention_summary?: string | null
  outcome_summary?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type RoutingRecord = {
  id: string
  case_id?: string | null
  assigned_responder_id?: string | null
  routing_status?: string | null
  routing_reason?: string | null
  created_at?: string | null
}

type InterventionRecord = {
  id: string
  case_id?: string | null
  intervention_type?: string | null
  intervention_summary?: string | null
  created_at?: string | null
}

type TimelineRecord = {
  id: string
  case_id?: string | null
  event_type?: string | null
  event_summary?: string | null
  actor?: string | null
  created_at?: string | null
}

type AuditLog = {
  id: string
  email?: string | null
  role?: string | null
  action_type?: string | null
  route?: string | null
  record_type?: string | null
  record_id?: string | null
  summary?: string | null
  severity?: string | null
  created_at?: string | null
  details?: Record<string, unknown> | null
}

type ReconstructionPosture =
  | 'RECONSTRUCTION EMPTY'
  | 'PARTIAL CONTINUITY MEMORY'
  | 'GOVERNED CONTINUITY TRACE'
  | 'EXECUTIVE RECONSTRUCTABLE'

function safeText(value: unknown, fallback = 'Not recorded') {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

function formatDate(value?: string | null) {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleString()
}

function normalizeSeverity(value?: string | null) {
  return safeText(value, 'INFO').toUpperCase()
}

function detailValue(log: AuditLog, key: string) {
  return log.details?.[key]
}

function fullAuditText(log: AuditLog) {
  return `${log.summary || ''} ${JSON.stringify(log.details || {})}`.toUpperCase()
}

function getAuditActor(log: AuditLog) {
  return safeText(
    log.email ||
      detailValue(log, 'actor_email') ||
      detailValue(log, 'actor_id') ||
      detailValue(log, 'user_email'),
    'Actor not recorded'
  )
}

function getAuditInstitution(log: AuditLog) {
  const text = log.summary || ''
  const summaryInstitution = text.match(/Institution:\s*([^.]*)\./i)

  return safeText(
    detailValue(log, 'institution_name') ||
      detailValue(log, 'institution') ||
      detailValue(log, 'institution_id') ||
      summaryInstitution?.[1],
    'Institution not recorded'
  )
}

function getEvidenceMaturity(log: AuditLog) {
  const text = fullAuditText(log)

  if (
    text.includes('EXECUTIVE_RECONSTRUCTABLE') ||
    text.includes('RECONSTRUCTION_CAPABILITY') ||
    text.includes('IMMUTABLE_GOVERNANCE_RECORD')
  ) {
    return 'EXECUTIVE RECONSTRUCTABLE'
  }

  if (
    text.includes('CONTROLLED_INTERVENTION_EVIDENCE') ||
    text.includes('GOVERNED_ROUTING_EVIDENCE') ||
    text.includes('GOVERNANCE REASON') ||
    text.includes('NON_PUNITIVE') ||
    text.includes('VISIBILITY_LEVEL')
  ) {
    return 'HARDENED GOVERNANCE EVIDENCE'
  }

  return 'LEGACY EVIDENCE'
}

export default function CaseContinuityLedgerPage() {
  return (
    <CGIGovernanceShell>
      <CaseContinuityLedger />
    </CGIGovernanceShell>
  )
}

function CaseContinuityLedger() {
  const params = useParams()
  const caseId = String(params?.id || '')

  const [caseRecord, setCaseRecord] = useState<BeneficiaryCase | null>(null)
  const [routingRecords, setRoutingRecords] = useState<RoutingRecord[]>([])
  const [interventionRecords, setInterventionRecords] = useState<InterventionRecord[]>([])
  const [timelineRecords, setTimelineRecords] = useState<TimelineRecord[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (caseId) loadCaseContinuity()
  }, [caseId])

  async function loadCaseContinuity() {
    setLoading(true)
    setError('')

    const { data: caseData, error: caseError } = await supabase
      .from('beneficiary_cases')
      .select('*')
      .eq('id', caseId)
      .maybeSingle()

    if (caseError) {
      setError(caseError.message)
      setLoading(false)
      return
    }

    const [routingResult, interventionResult, timelineResult, auditResult] =
      await Promise.all([
        supabase
          .from('case_routing_actions')
          .select('*')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false }),

        supabase
          .from('case_interventions')
          .select('*')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false }),

        supabase
          .from('case_timeline')
          .select('*')
          .eq('case_id', caseId)
          .order('created_at', { ascending: false }),

        supabase
          .from('audit_logs')
          .select('*')
          .or(`record_id.eq.${caseId},summary.ilike.%${caseId}%`)
          .order('created_at', { ascending: false })
          .limit(100),
      ])

    if (routingResult.error) console.error(routingResult.error)
    if (interventionResult.error) console.error(interventionResult.error)
    if (timelineResult.error) console.error(timelineResult.error)
    if (auditResult.error) console.error(auditResult.error)

    setCaseRecord(caseData)
    setRoutingRecords(routingResult.data || [])
    setInterventionRecords(interventionResult.data || [])
    setTimelineRecords(timelineResult.data || [])
    setAuditLogs(auditResult.data || [])
    setLoading(false)
  }

  const reconstructionPosture = useMemo((): ReconstructionPosture => {
    const hasCase = Boolean(caseRecord)
    const hasRouting = routingRecords.length > 0
    const hasIntervention = interventionRecords.length > 0
    const hasTimeline = timelineRecords.length > 0
    const hasAudit = auditLogs.length > 0
    const hasExecutiveEvidence = auditLogs.some(
      (log) => getEvidenceMaturity(log) === 'EXECUTIVE RECONSTRUCTABLE'
    )

    if (!hasCase && !hasRouting && !hasIntervention && !hasTimeline && !hasAudit) {
      return 'RECONSTRUCTION EMPTY'
    }

    if (
      hasCase &&
      hasRouting &&
      hasIntervention &&
      hasTimeline &&
      hasAudit &&
      hasExecutiveEvidence
    ) {
      return 'EXECUTIVE RECONSTRUCTABLE'
    }

    if (hasCase && (hasRouting || hasIntervention || hasTimeline) && hasAudit) {
      return 'GOVERNED CONTINUITY TRACE'
    }

    return 'PARTIAL CONTINUITY MEMORY'
  }, [caseRecord, routingRecords, interventionRecords, timelineRecords, auditLogs])

  const reconstructionMeaning = useMemo(() => {
    if (reconstructionPosture === 'EXECUTIVE RECONSTRUCTABLE') {
      return 'This case has enough continuity evidence for leadership to reconstruct case identity, routing movement, intervention activity, timeline memory, and governance evidence.'
    }

    if (reconstructionPosture === 'GOVERNED CONTINUITY TRACE') {
      return 'This case has a governed continuity trail, but recovery, reliability, or survivability evidence may still be incomplete.'
    }

    if (reconstructionPosture === 'PARTIAL CONTINUITY MEMORY') {
      return 'Some continuity memory exists, but the case does not yet have a complete governed reconstruction chain.'
    }

    return 'No continuity memory is currently visible for this case.'
  }, [reconstructionPosture])

  const timeline = useMemo(() => {
    const events = [
      ...routingRecords.map((item) => ({
        id: `routing-${item.id}`,
        type: 'ROUTING',
        title: safeText(item.routing_status, 'Routing event'),
        date: item.created_at,
        body: safeText(item.routing_reason, 'Routing reason not recorded'),
      })),
      ...interventionRecords.map((item) => ({
        id: `intervention-${item.id}`,
        type: 'INTERVENTION',
        title: safeText(item.intervention_type, 'Intervention event'),
        date: item.created_at,
        body: safeText(item.intervention_summary, 'Intervention summary not recorded'),
      })),
      ...timelineRecords.map((item) => ({
        id: `timeline-${item.id}`,
        type: 'TIMELINE',
        title: safeText(item.event_type, 'Timeline event'),
        date: item.created_at,
        body: safeText(item.event_summary, 'Timeline summary not recorded'),
      })),
      ...auditLogs.map((item) => ({
        id: `audit-${item.id}`,
        type: 'AUDIT',
        title: safeText(item.action_type, 'Audit evidence'),
        date: item.created_at,
        body: safeText(item.summary, 'Audit reason not recorded'),
      })),
    ]

    return events.sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0
      const bTime = b.date ? new Date(b.date).getTime() : 0
      return bTime - aTime
    })
  }, [routingRecords, interventionRecords, timelineRecords, auditLogs])

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-cyan-400/40 bg-slate-950 p-6 shadow-2xl md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.32em] text-cyan-300">
            TSINAXA CGI
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            Case Continuity Ledger
          </h1>

          <p className="mt-3 text-2xl font-black text-emerald-200 md:text-3xl">
            Continuity Reconstruction Infrastructure
          </p>

          <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300 md:text-lg">
            This view reconstructs a single case across routing, intervention,
            timeline memory, audit evidence, continuity posture, and executive
            reconstructability.
          </p>

          <button
            onClick={loadCaseContinuity}
            className="mt-6 rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
          >
            Refresh Case Continuity
          </button>
        </section>

        {error && (
          <section className="rounded-2xl border border-red-700 bg-red-950/60 p-4 text-sm text-red-200">
            {error}
          </section>
        )}

        {loading ? (
          <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-slate-400">
            Loading case continuity reconstruction...
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                Reconstruction Posture
              </p>

              <h2 className="mt-4 text-4xl font-black tracking-tight text-cyan-300 md:text-6xl">
                {reconstructionPosture}
              </h2>

              <p className="mt-4 max-w-4xl text-base leading-8 text-slate-300">
                {reconstructionMeaning}
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-5">
              <MetricCard title="Routing Records" value={routingRecords.length} />
              <MetricCard title="Intervention Records" value={interventionRecords.length} />
              <MetricCard title="Timeline Records" value={timelineRecords.length} />
              <MetricCard title="Audit Evidence" value={auditLogs.length} />
              <MetricCard title="Total Events" value={timeline.length} />
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 lg:col-span-1">
                <h2 className="text-xl font-black">Case Identity</h2>

                <div className="mt-5 space-y-3">
                  <EvidenceLine label="Case ID" value={caseId} />
                  <EvidenceLine label="Beneficiary" value={safeText(caseRecord?.beneficiary_name)} />
                  <EvidenceLine label="Support Domain" value={safeText(caseRecord?.support_domain)} />
                  <EvidenceLine label="Case Status" value={safeText(caseRecord?.case_status)} />
                  <EvidenceLine label="Severity" value={safeText(caseRecord?.severity_level)} />
                  <EvidenceLine label="Institution" value={safeText(caseRecord?.institution_name)} />
                  <EvidenceLine label="Region" value={safeText(caseRecord?.region)} />
                  <EvidenceLine
                    label="Safeguarding"
                    value={
                      caseRecord?.safeguarding_flag
                        ? 'Safeguarding flag active'
                        : 'No safeguarding flag recorded'
                    }
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 lg:col-span-2">
                <h2 className="text-xl font-black">Continuity Timeline</h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Timeline combines routing, intervention, lifecycle timeline,
                  and audit evidence so visible instability does not disappear.
                </p>

                <div className="mt-5 space-y-3">
                  {timeline.length === 0 ? (
                    <EmptyState text="No continuity timeline exists yet for this case." />
                  ) : (
                    timeline.map((event) => (
                      <article
                        key={event.id}
                        className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-300">
                            {event.type}
                          </span>

                          <span className="text-xs text-slate-500">
                            {formatDate(event.date)}
                          </span>
                        </div>

                        <h3 className="mt-3 font-black text-white">{event.title}</h3>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                          {event.body}
                        </p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <EvidencePanel title="Routing Evidence">
                {routingRecords.length === 0 ? (
                  <EmptyState text="No routing action records linked to this case yet." />
                ) : (
                  routingRecords.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                      <EvidenceLine label="Routing Status" value={safeText(item.routing_status)} />
                      <EvidenceLine label="Reason" value={safeText(item.routing_reason)} />
                      <EvidenceLine label="Assigned Responder ID" value={safeText(item.assigned_responder_id)} />
                      <EvidenceLine label="Created" value={formatDate(item.created_at)} />
                    </article>
                  ))
                )}
              </EvidencePanel>

              <EvidencePanel title="Intervention Evidence">
                {interventionRecords.length === 0 ? (
                  <EmptyState text="No intervention records linked to this case yet." />
                ) : (
                  interventionRecords.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                      <EvidenceLine label="Intervention Type" value={safeText(item.intervention_type)} />
                      <EvidenceLine label="Created" value={formatDate(item.created_at)} />
                      <p className="mt-4 whitespace-pre-wrap rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                        {safeText(item.intervention_summary, 'Intervention summary not recorded')}
                      </p>
                    </article>
                  ))
                )}
              </EvidencePanel>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
              <h2 className="text-xl font-black">Governance Audit Evidence</h2>

              <div className="mt-5 space-y-3">
                {auditLogs.length === 0 ? (
                  <EmptyState text="No audit evidence linked to this case yet." />
                ) : (
                  auditLogs.map((log) => (
                    <article key={log.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-black text-slate-200">
                          {normalizeSeverity(log.severity)}
                        </span>

                        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                          {safeText(log.action_type)}
                        </span>

                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-300">
                          {getEvidenceMaturity(log)}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <EvidenceLine label="Actor" value={getAuditActor(log)} />
                        <EvidenceLine label="Route" value={safeText(log.route)} />
                        <EvidenceLine label="Record Type" value={safeText(log.record_type)} />
                        <EvidenceLine label="Institution" value={getAuditInstitution(log)} />
                        <EvidenceLine label="Linked Record" value={safeText(log.record_id)} />
                        <EvidenceLine label="Created" value={formatDate(log.created_at)} />
                      </div>

                      <p className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
                        {safeText(log.summary, 'Governance reason not recorded')}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
              <h2 className="text-xl font-black">Executive Reconstruction Meaning</h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <InterpretationCard
                  title="Detection Is Not Stabilization"
                  text="The case may be visible, routed, or acted upon, but CGI keeps asking whether stabilization credibility was actually preserved."
                />
                <InterpretationCard
                  title="Closure Is Not Survivability"
                  text="Completion alone does not prove durability. This ledger prepares the case for later recovery and survivability review."
                />
                <InterpretationCard
                  title="Visible Instability Must Not Disappear"
                  text="Routing, intervention, timeline, and audit evidence remain visible as institutional memory instead of fading after the workflow moves on."
                />
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-xl">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-black text-white">{value}</p>
    </div>
  )
}

function EvidencePanel({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  )
}

function EvidenceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-semibold leading-6 text-slate-200">
        {value}
      </p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-2xl bg-slate-900 p-4 text-sm text-slate-400">
      {text}
    </p>
  )
}

function InterpretationCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="font-black text-white">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  )
}