'use client'

import { useEffect, useMemo, useState } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type AuditLog = {
  id: string
  actor_id?: string | null
  actor_email?: string | null
  actor_role?: string | null
  action_type?: string | null
  route?: string | null
  severity?: string | null
  institution_id?: string | null
  created_at?: string | null
  details?: Record<string, unknown> | null
}

type EvidencePosture =
  | 'LEDGER EMPTY'
  | 'EVIDENCE HOLDING'
  | 'GOVERNANCE WATCH'
  | 'EXECUTIVE REVIEW'

type EvidenceSummary = {
  total: number
  critical: number
  high: number
  governanceActions: number
  uniqueActors: number
  institutionScoped: number
  immutableRecords: number
  visibilityClassified: number
  linkedSnapshots: number
  evidencePosture: EvidencePosture
  evidenceMeaning: string
}

const severityOrder: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MODERATE: 2,
  LOW: 1,
  INFO: 0,
}

const LEDGER_DOCTRINE = [
  'Governance evidence must remain visible.',
  'Continuity memory must be reconstructable.',
  'Audit history must not become a developer log.',
]

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

function getActor(log: AuditLog) {
  return safeText(
    log.actor_email || log.actor_role || log.actor_id,
    'Actor not recorded'
  )
}

function getVisibilityLevel(log: AuditLog) {
  const details = log.details || {}

  return safeText(
    details.visibility_level ||
      details.visibility ||
      details.visibility_tier ||
      details.access_level,
    'Standard governance visibility'
  )
}

function getLinkedSnapshot(log: AuditLog) {
  const details = log.details || {}

  return safeText(
    details.snapshot_id ||
      details.metric_id ||
      details.cgi_operational_metric_id ||
      details.linked_snapshot_id,
    'No linked snapshot recorded'
  )
}

function getEvidenceReason(log: AuditLog) {
  const details = log.details || {}

  return safeText(
    details.reason ||
      details.governance_reason ||
      details.executive_reason ||
      details.message ||
      details.summary,
    'Governance reason not recorded'
  )
}

function hasInstitutionScope(log: AuditLog) {
  return Boolean(log.institution_id)
}

function hasVisibilityClassification(log: AuditLog) {
  const visibility = getVisibilityLevel(log)
  return visibility !== 'Standard governance visibility'
}

function hasLinkedSnapshot(log: AuditLog) {
  const snapshot = getLinkedSnapshot(log)
  return snapshot !== 'No linked snapshot recorded'
}

function isImmutableRecord(log: AuditLog) {
  return Boolean(log.id && log.created_at)
}

export default function AuditPage() {
  return (
    <CGIGovernanceShell>
      <GovernanceEvidenceLedger />
    </CGIGovernanceShell>
  )
}

function GovernanceEvidenceLedger() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [actorFilter, setActorFilter] = useState('ALL')
  const [routeFilter, setRouteFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadAuditLogs()
  }, [])

  async function loadAuditLogs() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(250)

    if (error) {
      setError(error.message)
      setLogs([])
    } else {
      setLogs(data || [])
    }

    setLoading(false)
  }

  const actors = useMemo(() => {
    const values = logs
      .map((log) => log.actor_email || log.actor_role || log.actor_id)
      .filter(Boolean)
      .map(String)

    return ['ALL', ...Array.from(new Set(values))]
  }, [logs])

  const routes = useMemo(() => {
    const values = logs.map((log) => log.route).filter(Boolean).map(String)
    return ['ALL', ...Array.from(new Set(values))]
  }, [logs])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const severity = normalizeSeverity(log.severity)
      const actor = log.actor_email || log.actor_role || log.actor_id || ''
      const route = log.route || ''
      const combined = JSON.stringify(log).toLowerCase()

      const severityMatch =
        severityFilter === 'ALL' || severity === severityFilter

      const actorMatch =
        actorFilter === 'ALL' || String(actor) === actorFilter

      const routeMatch =
        routeFilter === 'ALL' || String(route) === routeFilter

      const searchMatch =
        search.trim() === '' || combined.includes(search.toLowerCase())

      return severityMatch && actorMatch && routeMatch && searchMatch
    })
  }, [logs, severityFilter, actorFilter, routeFilter, search])

  const summary = useMemo((): EvidenceSummary => {
    const critical = filteredLogs.filter(
      (log) => normalizeSeverity(log.severity) === 'CRITICAL'
    ).length

    const high = filteredLogs.filter(
      (log) => normalizeSeverity(log.severity) === 'HIGH'
    ).length

    const governanceActions = filteredLogs.filter((log) =>
      safeText(log.action_type, '').toUpperCase().includes('GOVERNANCE')
    ).length

    const uniqueActors = new Set(
      filteredLogs
        .map((log) => log.actor_email || log.actor_role || log.actor_id)
        .filter(Boolean)
    ).size

    const institutionScoped = filteredLogs.filter(hasInstitutionScope).length
    const immutableRecords = filteredLogs.filter(isImmutableRecord).length
    const visibilityClassified = filteredLogs.filter(
      hasVisibilityClassification
    ).length
    const linkedSnapshots = filteredLogs.filter(hasLinkedSnapshot).length

    const evidencePosture = resolveEvidencePosture({
      total: filteredLogs.length,
      critical,
      high,
      governanceActions,
      institutionScoped,
      immutableRecords,
    })

    return {
      total: filteredLogs.length,
      critical,
      high,
      governanceActions,
      uniqueActors,
      institutionScoped,
      immutableRecords,
      visibilityClassified,
      linkedSnapshots,
      evidencePosture,
      evidenceMeaning: buildEvidenceMeaning(evidencePosture),
    }
  }, [filteredLogs])

  const recentExecutiveReview = useMemo(() => {
    return filteredLogs
      .filter((log) =>
        ['CRITICAL', 'HIGH'].includes(normalizeSeverity(log.severity))
      )
      .slice(0, 6)
  }, [filteredLogs])

  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      const aSeverity = severityOrder[normalizeSeverity(a.severity)] ?? 0
      const bSeverity = severityOrder[normalizeSeverity(b.severity)] ?? 0

      if (bSeverity !== aSeverity) return bSeverity - aSeverity

      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0

      return bTime - aTime
    })
  }, [filteredLogs])

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-cyan-400/40 bg-slate-950 p-6 shadow-2xl md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.32em] text-cyan-300">
                TSINAXA CGI
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
                Governance Evidence Ledger
              </h1>

              <p className="mt-3 text-2xl font-black text-emerald-200 md:text-3xl">
                Executive Continuity Evidence Infrastructure
              </p>

              <p className="mt-5 max-w-4xl text-base leading-8 text-slate-300 md:text-lg">
                This ledger preserves governance evidence for continuity
                interpretation, executive oversight, institutional
                accountability, and survivability reconstruction.
              </p>
            </div>

            <button
              onClick={loadAuditLogs}
              className="rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
            >
              Refresh Evidence Ledger
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {LEDGER_DOCTRINE.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-700 bg-slate-900 p-4 text-sm font-bold leading-6 text-cyan-100"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {error && (
          <section className="rounded-2xl border border-red-700 bg-red-950/60 p-4 text-sm text-red-200">
            {error}
          </section>
        )}

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            Evidence Integrity Status
          </p>

          <div className="mt-4 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-4xl font-black tracking-tight text-cyan-300 md:text-6xl">
                {summary.evidencePosture}
              </h2>

              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
                {summary.evidenceMeaning}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-400">
                Ledger Trust Meaning
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                CGI audit evidence is not designed to blame people. It exists
                to preserve what happened, who governed it, where it occurred,
                why it mattered, and whether continuity memory can be
                reconstructed later.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard title="Evidence Records" value={summary.total} />
          <MetricCard title="Immutable Records" value={summary.immutableRecords} />
          <MetricCard title="Institution Scoped" value={summary.institutionScoped} />
          <MetricCard title="Linked Snapshots" value={summary.linkedSnapshots} />
          <MetricCard title="Critical Evidence" value={summary.critical} />
          <MetricCard title="High-Risk Evidence" value={summary.high} />
          <MetricCard title="Governance Actions" value={summary.governanceActions} />
          <MetricCard title="Evidence Actors" value={summary.uniqueActors} />
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <h2 className="text-xl font-black">
            Evidence Filters
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Filter the ledger by severity, actor, route, or evidence content
            without changing the preserved record.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
            >
              <option value="ALL">All severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>

            <select
              value={actorFilter}
              onChange={(event) => setActorFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
            >
              {actors.map((actor) => (
                <option key={actor} value={actor}>
                  {actor === 'ALL' ? 'All actors' : actor}
                </option>
              ))}
            </select>

            <select
              value={routeFilter}
              onChange={(event) => setRouteFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
            >
              {routes.map((route) => (
                <option key={route} value={route}>
                  {route === 'ALL' ? 'All routes' : route}
                </option>
              ))}
            </select>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search governance evidence..."
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
            />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 lg:col-span-1">
            <h2 className="text-xl font-black">
              Executive Review Evidence
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Critical and high-risk evidence requiring executive visibility.
            </p>

            <div className="mt-5 space-y-3">
              {recentExecutiveReview.length === 0 && (
                <p className="rounded-2xl bg-slate-900 p-4 text-sm text-slate-400">
                  No critical or high-risk evidence found in the current view.
                </p>
              )}

              {recentExecutiveReview.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-black text-red-300">
                      {normalizeSeverity(log.severity)}
                    </span>

                    <span className="text-xs text-slate-500">
                      {formatDate(log.created_at)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-bold text-white">
                    {safeText(log.action_type)}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Actor: {getActor(log)}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Source: {safeText(log.route)}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Institution: {safeText(log.institution_id)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 lg:col-span-2">
            <h2 className="text-xl font-black">
              Immutable Continuity Ledger
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Sorted by governance severity and recency. Each record supports
              continuity reconstruction without turning the system into
              person-level surveillance.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
              {loading ? (
                <div className="bg-slate-900 p-6 text-sm text-slate-400">
                  Loading governance evidence...
                </div>
              ) : sortedLogs.length === 0 ? (
                <div className="bg-slate-900 p-6 text-sm text-slate-400">
                  No evidence records match the current filters.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {sortedLogs.map((log) => (
                    <article key={log.id} className="bg-slate-900 p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-black text-slate-200">
                              {normalizeSeverity(log.severity)}
                            </span>

                            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                              {safeText(log.action_type)}
                            </span>

                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                              {isImmutableRecord(log)
                                ? 'Immutable record'
                                : 'Integrity incomplete'}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                            <EvidenceLine label="Actor" value={getActor(log)} />
                            <EvidenceLine label="Route / Source" value={safeText(log.route)} />
                            <EvidenceLine label="Institution" value={safeText(log.institution_id)} />
                            <EvidenceLine label="Visibility" value={getVisibilityLevel(log)} />
                            <EvidenceLine label="Linked Snapshot" value={getLinkedSnapshot(log)} />
                            <EvidenceLine label="Governance Reason" value={getEvidenceReason(log)} />
                          </div>
                        </div>

                        <p className="text-xs text-slate-500">
                          {formatDate(log.created_at)}
                        </p>
                      </div>

                      {log.details && (
                        <details className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                          <summary className="cursor-pointer text-sm font-bold text-slate-300">
                            View preserved evidence details
                          </summary>

                          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-slate-400">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <h2 className="text-xl font-black">
            Governance Reconstruction Meaning
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <InterpretationCard
              title="Evidence Preservation"
              text="The ledger preserves continuity events so visible instability does not disappear after action is taken."
            />
            <InterpretationCard
              title="Executive Trust"
              text="Actor, institution, route, reason, visibility, and snapshot linkage allow leadership to reconstruct governance decisions."
            />
            <InterpretationCard
              title="Non-Punitive Accountability"
              text="The ledger protects institutional memory without ranking workers, blaming individuals, or becoming a surveillance surface."
            />
          </div>
        </section>
      </div>
    </main>
  )
}

function resolveEvidencePosture(input: {
  total: number
  critical: number
  high: number
  governanceActions: number
  institutionScoped: number
  immutableRecords: number
}): EvidencePosture {
  if (input.total === 0) {
    return 'LEDGER EMPTY'
  }

  if (input.critical > 0 || input.high > 2) {
    return 'EXECUTIVE REVIEW'
  }

  if (
    input.high > 0 ||
    input.governanceActions > 0 ||
    input.institutionScoped < input.total
  ) {
    return 'GOVERNANCE WATCH'
  }

  return 'EVIDENCE HOLDING'
}

function buildEvidenceMeaning(posture: EvidencePosture) {
  if (posture === 'LEDGER EMPTY') {
    return 'No governance evidence is currently visible. Continuity reconstruction cannot begin until auditable records are preserved.'
  }

  if (posture === 'EXECUTIVE REVIEW') {
    return 'The ledger contains critical or high-risk evidence that should remain visible for executive review and continuity reconstruction.'
  }

  if (posture === 'GOVERNANCE WATCH') {
    return 'Governance evidence is present, but visibility, institution scope, or elevated activity should remain under review.'
  }

  return 'Governance evidence is preserved, traceable, and currently sufficient for continuity reconstruction.'
}

function MetricCard({
  title,
  value,
}: {
  title: string
  value: number
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-xl">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-black text-white">
        {value}
      </p>
    </div>
  )
}

function EvidenceLine({
  label,
  value,
}: {
  label: string
  value: string
}) {
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

function InterpretationCard({
  title,
  text,
}: {
  title: string
  text: string
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="font-black text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  )
}