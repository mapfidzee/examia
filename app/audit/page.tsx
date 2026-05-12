'use client'

import { useEffect, useMemo, useState } from 'react'
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
  details?: any
}

const severityOrder: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MODERATE: 2,
  LOW: 1,
  INFO: 0,
}

function safeText(value: any, fallback = 'Not recorded') {
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

export default function AuditPage() {
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

  const summary = useMemo(() => {
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

    return {
      total: filteredLogs.length,
      critical,
      high,
      governanceActions,
      uniqueActors,
    }
  }, [filteredLogs])

  const recentCritical = useMemo(() => {
    return filteredLogs
      .filter((log) => ['CRITICAL', 'HIGH'].includes(normalizeSeverity(log.severity)))
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
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Operational Audit Intelligence
              </p>
              <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                Governance memory for continuity protection
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                This surface shows who acted, what changed, where pressure is appearing,
                and whether continuity actions remain visible for institutional review.
              </p>
            </div>

            <button
              onClick={loadAuditLogs}
              className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300"
            >
              Refresh Audit
            </button>
          </div>
        </section>

        {error && (
          <section className="rounded-2xl border border-red-700 bg-red-950/60 p-4 text-sm text-red-200">
            {error}
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-5">
          <MetricCard title="Visible Events" value={summary.total} />
          <MetricCard title="Critical Events" value={summary.critical} />
          <MetricCard title="High-Risk Events" value={summary.high} />
          <MetricCard title="Governance Actions" value={summary.governanceActions} />
          <MetricCard title="Active Actors" value={summary.uniqueActors} />
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <h2 className="text-lg font-bold">Governance Filters</h2>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
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
              placeholder="Search audit memory..."
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
            />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:col-span-1">
            <h2 className="text-lg font-bold">Recent Governance Pressure</h2>
            <p className="mt-2 text-sm text-slate-400">
              Critical and high-risk events requiring leadership visibility.
            </p>

            <div className="mt-4 space-y-3">
              {recentCritical.length === 0 && (
                <p className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-400">
                  No critical or high-risk activity found in the current view.
                </p>
              )}

              {recentCritical.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-300">
                      {normalizeSeverity(log.severity)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(log.created_at)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold">
                    {safeText(log.action_type)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Actor: {safeText(log.actor_email || log.actor_role || log.actor_id)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Source: {safeText(log.route)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 lg:col-span-2">
            <h2 className="text-lg font-bold">Audit Timeline</h2>
            <p className="mt-2 text-sm text-slate-400">
              Sorted by governance risk and recency.
            </p>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
              {loading ? (
                <div className="bg-slate-950 p-6 text-sm text-slate-400">
                  Loading audit intelligence...
                </div>
              ) : sortedLogs.length === 0 ? (
                <div className="bg-slate-950 p-6 text-sm text-slate-400">
                  No audit events match the current filters.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {sortedLogs.map((log) => (
                    <article key={log.id} className="bg-slate-950 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200">
                              {normalizeSeverity(log.severity)}
                            </span>

                            <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                              {safeText(log.action_type)}
                            </span>
                          </div>

                          <p className="mt-3 text-sm text-slate-300">
                            Actor:{' '}
                            <span className="font-semibold text-white">
                              {safeText(log.actor_email || log.actor_role || log.actor_id)}
                            </span>
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Route / source: {safeText(log.route)}
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Institution: {safeText(log.institution_id)}
                          </p>
                        </div>

                        <p className="text-xs text-slate-500">
                          {formatDate(log.created_at)}
                        </p>
                      </div>

                      {log.details && (
                        <details className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                          <summary className="cursor-pointer text-sm font-semibold text-slate-300">
                            View event details
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

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <h2 className="text-lg font-bold">Governance Interpretation</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <InterpretationCard
              title="Continuity Protection"
              text="Audit memory confirms whether visible disruption remained traceable after action was taken."
            />
            <InterpretationCard
              title="Escalation Visibility"
              text="High-risk and critical activity should be reviewed for delayed response, repeated pressure, or unresolved governance exposure."
            />
            <InterpretationCard
              title="Institutional Accountability"
              text="Actor, route, institution, and action visibility protect continuity without turning the system into personal surveillance."
            />
          </div>
        </section>
      </div>
    </main>
  )
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {title}
      </p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

function InterpretationCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <h3 className="font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  )
}