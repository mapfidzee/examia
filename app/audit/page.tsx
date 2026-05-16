'use client'

import { useEffect, useMemo, useState } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { supabase } from '../../lib/supabase'

type AuditDetails = Record<string, unknown>

type AuditLog = {
  id: string
  user_id?: string | null
  email?: string | null
  role?: string | null
  action_type?: string | null
  route?: string | null
  record_type?: string | null
  record_id?: string | null
  summary?: string | null
  severity?: string | null
  created_at?: string | null
  details?: AuditDetails | null
  actor_id?: string | null
  actor_email?: string | null
  actor_role?: string | null
  institution_id?: string | null
}

type EvidencePosture =
  | 'LEDGER EMPTY'
  | 'EVIDENCE HOLDING'
  | 'GOVERNANCE WATCH'
  | 'EXECUTIVE REVIEW'

type EvidenceMaturity =
  | 'LEGACY EVIDENCE'
  | 'HARDENED GOVERNANCE EVIDENCE'
  | 'EXECUTIVE RECONSTRUCTABLE'

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
  legacyEvidence: number
  hardenedEvidence: number
  executiveReconstructable: number
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

const maturityOrder: Record<EvidenceMaturity, number> = {
  'EXECUTIVE RECONSTRUCTABLE': 3,
  'HARDENED GOVERNANCE EVIDENCE': 2,
  'LEGACY EVIDENCE': 1,
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

function detailValue(log: AuditLog, key: string) {
  return log.details?.[key]
}

function fullEvidenceText(log: AuditLog) {
  return `${log.summary || ''} ${JSON.stringify(log.details || {})}`.toUpperCase()
}

function getActor(log: AuditLog) {
  return safeText(
    log.email ||
      log.actor_email ||
      log.user_id ||
      log.actor_id ||
      detailValue(log, 'actor_email') ||
      detailValue(log, 'actor_id') ||
      detailValue(log, 'actor') ||
      detailValue(log, 'user_email'),
    'Actor not recorded'
  )
}

function getActorKey(log: AuditLog) {
  return safeText(
    log.email ||
      log.user_id ||
      log.actor_email ||
      log.actor_id ||
      detailValue(log, 'actor_email') ||
      detailValue(log, 'actor_id') ||
      detailValue(log, 'user_email'),
    ''
  )
}

function getInstitution(log: AuditLog) {
  const text = log.summary || ''

  const summaryInstitution = text.match(/Institution scope:\s*([^.]*)\./i)

  return safeText(
    log.institution_id ||
      detailValue(log, 'institution_id') ||
      detailValue(log, 'governance_institution') ||
      detailValue(log, 'institution') ||
      detailValue(log, 'institution_name') ||
      summaryInstitution?.[1],
    'Institution not recorded'
  )
}

function getVisibilityLevel(log: AuditLog) {
  const text = log.summary || ''

  const summaryVisibility = text.match(/Visibility level:\s*([^.]*)\./i)

  return safeText(
    detailValue(log, 'visibility_level') ||
      detailValue(log, 'visibility') ||
      detailValue(log, 'visibility_tier') ||
      detailValue(log, 'access_level') ||
      summaryVisibility?.[1],
    'Standard governance visibility'
  )
}

function getLinkedSnapshot(log: AuditLog) {
  return safeText(
    log.record_id ||
      detailValue(log, 'snapshot_id') ||
      detailValue(log, 'metric_id') ||
      detailValue(log, 'cgi_operational_metric_id') ||
      detailValue(log, 'linked_snapshot_id'),
    'No linked snapshot recorded'
  )
}

function getEvidenceReason(log: AuditLog) {
  return safeText(
    log.summary ||
      detailValue(log, 'reason') ||
      detailValue(log, 'governance_reason') ||
      detailValue(log, 'executive_reason') ||
      detailValue(log, 'message') ||
      detailValue(log, 'summary'),
    'Governance reason not recorded'
  )
}

function getRecordType(log: AuditLog) {
  return safeText(
    log.record_type ||
      detailValue(log, 'evidence_type') ||
      detailValue(log, 'record_type'),
    'Governance evidence'
  )
}

function hasInstitutionScope(log: AuditLog) {
  return getInstitution(log) !== 'Institution not recorded'
}

function hasVisibilityClassification(log: AuditLog) {
  return getVisibilityLevel(log) !== 'Standard governance visibility'
}

function hasLinkedSnapshot(log: AuditLog) {
  return getLinkedSnapshot(log) !== 'No linked snapshot recorded'
}

function isImmutableRecord(log: AuditLog) {
  return Boolean(log.id && log.created_at)
}

function resolveEvidenceMaturity(log: AuditLog): EvidenceMaturity {
  const text = fullEvidenceText(log)

  const hasActor = getActor(log) !== 'Actor not recorded'
  const hasInstitution = hasInstitutionScope(log)
  const hasVisibility = hasVisibilityClassification(log)
  const hasLinkedRecord = hasLinkedSnapshot(log)
  const hasReason = getEvidenceReason(log) !== 'Governance reason not recorded'
  const hasImmutability = isImmutableRecord(log)

  if (
    text.includes('EXECUTIVE_RECONSTRUCTABLE') ||
    (hasActor && hasInstitution && hasVisibility && hasLinkedRecord && hasReason && hasImmutability)
  ) {
    return 'EXECUTIVE RECONSTRUCTABLE'
  }

  if (
    text.includes('HARDENED') ||
    text.includes('GOVERNANCE REASON') ||
    text.includes('VISIBILITY LEVEL') ||
    text.includes('NON-PUNITIVE') ||
    (hasActor && hasReason && hasImmutability)
  ) {
    return 'HARDENED GOVERNANCE EVIDENCE'
  }

  return 'LEGACY EVIDENCE'
}

function getMaturityMeaning(maturity: EvidenceMaturity) {
  if (maturity === 'EXECUTIVE RECONSTRUCTABLE') {
    return 'This record preserves enough evidence for leadership to reconstruct who acted, what changed, why it mattered, where it applied, and what continuity posture was preserved.'
  }

  if (maturity === 'HARDENED GOVERNANCE EVIDENCE') {
    return 'This record preserves strengthened governance meaning, but may not yet contain every enterprise-grade reconstruction field.'
  }

  return 'This is historical evidence created before the current CGI hardening standard. It remains valid, but its reconstruction depth is limited.'
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
  const [maturityFilter, setMaturityFilter] = useState('ALL')
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
    const values = logs.map(getActorKey).filter(Boolean).map(String)
    return ['ALL', ...Array.from(new Set(values))]
  }, [logs])

  const routes = useMemo(() => {
    const values = logs.map((log) => log.route).filter(Boolean).map(String)
    return ['ALL', ...Array.from(new Set(values))]
  }, [logs])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const severity = normalizeSeverity(log.severity)
      const actor = getActorKey(log)
      const route = log.route || ''
      const maturity = resolveEvidenceMaturity(log)
      const combined = JSON.stringify(log).toLowerCase()

      return (
        (severityFilter === 'ALL' || severity === severityFilter) &&
        (actorFilter === 'ALL' || String(actor) === actorFilter) &&
        (routeFilter === 'ALL' || String(route) === routeFilter) &&
        (maturityFilter === 'ALL' || maturity === maturityFilter) &&
        (search.trim() === '' || combined.includes(search.toLowerCase()))
      )
    })
  }, [logs, severityFilter, actorFilter, routeFilter, maturityFilter, search])

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

    const uniqueActors = new Set(filteredLogs.map(getActorKey).filter(Boolean)).size
    const institutionScoped = filteredLogs.filter(hasInstitutionScope).length
    const immutableRecords = filteredLogs.filter(isImmutableRecord).length
    const visibilityClassified = filteredLogs.filter(hasVisibilityClassification).length
    const linkedSnapshots = filteredLogs.filter(hasLinkedSnapshot).length

    const legacyEvidence = filteredLogs.filter(
      (log) => resolveEvidenceMaturity(log) === 'LEGACY EVIDENCE'
    ).length

    const hardenedEvidence = filteredLogs.filter(
      (log) => resolveEvidenceMaturity(log) === 'HARDENED GOVERNANCE EVIDENCE'
    ).length

    const executiveReconstructable = filteredLogs.filter(
      (log) => resolveEvidenceMaturity(log) === 'EXECUTIVE RECONSTRUCTABLE'
    ).length

    const evidencePosture = resolveEvidencePosture({
      total: filteredLogs.length,
      critical,
      high,
      governanceActions,
      institutionScoped,
      immutableRecords,
      legacyEvidence,
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
      legacyEvidence,
      hardenedEvidence,
      executiveReconstructable,
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
      const aMaturity = maturityOrder[resolveEvidenceMaturity(a)]
      const bMaturity = maturityOrder[resolveEvidenceMaturity(b)]

      if (bMaturity !== aMaturity) return bMaturity - aMaturity

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
                This ledger now distinguishes legacy records from hardened
                governance evidence and executive-reconstructable continuity
                evidence.
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
                Ledger Maturity Meaning
              </p>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                Older evidence is not treated as broken. It is identified as
                legacy evidence. Hardened records are separated from records
                that are fully executive-reconstructable.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <MetricCard title="Evidence Records" value={summary.total} />
          <MetricCard title="Legacy Evidence" value={summary.legacyEvidence} />
          <MetricCard title="Hardened Evidence" value={summary.hardenedEvidence} />
          <MetricCard title="Executive Reconstructable" value={summary.executiveReconstructable} />
          <MetricCard title="Immutable Records" value={summary.immutableRecords} />
          <MetricCard title="Institution Scoped" value={summary.institutionScoped} />
          <MetricCard title="Linked Snapshots" value={summary.linkedSnapshots} />
          <MetricCard title="Evidence Actors" value={summary.uniqueActors} />
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <h2 className="text-xl font-black">Evidence Filters</h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Filter the ledger by severity, actor, route, maturity, or evidence
            content without changing the preserved record.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-5">
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

            <select
              value={maturityFilter}
              onChange={(event) => setMaturityFilter(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
            >
              <option value="ALL">All maturity levels</option>
              <option value="LEGACY EVIDENCE">Legacy Evidence</option>
              <option value="HARDENED GOVERNANCE EVIDENCE">
                Hardened Governance Evidence
              </option>
              <option value="EXECUTIVE RECONSTRUCTABLE">
                Executive Reconstructable
              </option>
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
            <h2 className="text-xl font-black">Executive Review Evidence</h2>

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
                    Institution: {getInstitution(log)}
                  </p>

                  <p className="mt-3 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-black text-cyan-300">
                    {resolveEvidenceMaturity(log)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 lg:col-span-2">
            <h2 className="text-xl font-black">Immutable Continuity Ledger</h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Sorted by maturity, governance severity, and recency. Each record
              supports continuity reconstruction without turning the system into
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
                  {sortedLogs.map((log) => {
                    const maturity = resolveEvidenceMaturity(log)

                    return (
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

                              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-300">
                                {maturity}
                              </span>
                            </div>

                            <p className="mt-3 max-w-3xl text-xs leading-5 text-slate-400">
                              {getMaturityMeaning(maturity)}
                            </p>

                            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                              <EvidenceLine label="Actor" value={getActor(log)} />
                              <EvidenceLine label="Route / Source" value={safeText(log.route)} />
                              <EvidenceLine label="Record Type" value={getRecordType(log)} />
                              <EvidenceLine label="Institution" value={getInstitution(log)} />
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
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <h2 className="text-xl font-black">Governance Reconstruction Meaning</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <InterpretationCard
              title="Legacy Evidence"
              text="Historical evidence remains visible, but is clearly separated from newer hardened governance records."
            />
            <InterpretationCard
              title="Hardened Evidence"
              text="Structured governance meaning is preserved so role, routing, intervention, and operational decisions do not disappear."
            />
            <InterpretationCard
              title="Executive Reconstruction"
              text="The strongest records preserve enough context for leaders to reconstruct what happened, why it mattered, and whether continuity was governed."
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
  legacyEvidence: number
}): EvidencePosture {
  if (input.total === 0) return 'LEDGER EMPTY'
  if (input.critical > 0 || input.high > 2) return 'EXECUTIVE REVIEW'
  if (input.legacyEvidence > input.total / 2) return 'GOVERNANCE WATCH'
  if (input.high > 0 || input.governanceActions > 0 || input.institutionScoped < input.total) {
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
    return 'Governance evidence is present, but maturity, visibility, institution scope, or elevated activity should remain under review.'
  }

  return 'Governance evidence is preserved, traceable, and currently sufficient for continuity reconstruction.'
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

function InterpretationCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="font-black text-white">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  )
}