'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  buildAuditMemory,
  buildChainReconstruction,
  buildEvidenceGapDashboard,
  buildEvidenceProvenance,
  buildEvidenceSummary,
  getActor,
  getActorKey,
  getEvidenceReason,
  getInstitution,
  getLinkedSnapshot,
  getMaturityMeaning,
  getRecordType,
  getVisibilityLevel,
  isImmutableRecord,
  maturityOrder,
  normalizeSeverity,
  resolveEvidenceMaturity,
  safeText,
  severityOrder,
  type AuditDetails,
  type AuditLogForDoctrine,
  type ChainStage,
  type EvidenceGapItem,
  type ProvenanceStage,
} from '@/lib/cgiAuditDoctrineEngine'
import { buildCGIDemoScenario } from '@/lib/cgiDemoScenarioEngine'
import { supabase } from '../../lib/supabase'

type AuditLog = AuditLogForDoctrine & {
  details?: AuditDetails | null
}

type ReconstructionGroup = {
  label: string
  count: number
  status: string
}

const LEDGER_DOCTRINE = [
  'Governance evidence must remain visible.',
  'Continuity memory must be reconstructable.',
  'Evidence protects lifecycle credibility.',
]

export default function AuditPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <GovernanceEvidenceLedger />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
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

  const featured = useMemo(
    () => buildCGIDemoScenario('FUEL_LOGISTICS_CHAIN_PROOF'),
    [],
  )

  const pilotThread = featured.pilotThread

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

  const chainReconstruction = useMemo(
    () => buildChainReconstruction(filteredLogs),
    [filteredLogs],
  )

  const summary = useMemo(
    () => buildEvidenceSummary(filteredLogs, chainReconstruction),
    [filteredLogs, chainReconstruction],
  )

  const provenance = useMemo(
    () => buildEvidenceProvenance(filteredLogs),
    [filteredLogs],
  )

  const evidenceGaps = useMemo(
    () => buildEvidenceGapDashboard(filteredLogs),
    [filteredLogs],
  )

  const auditMemory = useMemo(() => buildAuditMemory(filteredLogs), [filteredLogs])

  const groupedChain = useMemo(
    () => buildReconstructionGroups(chainReconstruction.stages),
    [chainReconstruction],
  )

  const integrityGroups = useMemo(
    () => buildIntegrityGroups(provenance, evidenceGaps, auditMemory),
    [provenance, evidenceGaps, auditMemory],
  )

  const recentExecutiveReview = useMemo(() => {
    return filteredLogs
      .filter((log) =>
        ['CRITICAL', 'HIGH'].includes(normalizeSeverity(log.severity)),
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
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • AUDIT</p>

          <h1 style={styles.title}>Continuity Reconstruction Audit</h1>

          <p style={styles.subtitle}>
            Final evidence seal proving whether visible instability can be
            reconstructed from request through recovery, command, executive
            reporting, memory preservation, and audit.
          </p>

          <div style={styles.doctrineGrid}>
            {LEDGER_DOCTRINE.map((item) => (
              <div key={item} style={styles.doctrineCard}>
                {item}
              </div>
            ))}
          </div>
        </section>

        {error && <section style={styles.errorBox}>{error}</section>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Audit Verdict</p>

            <h2 style={styles.heroTitle}>
              {summary.doctrine.reconstructionPosture}
            </h2>

            <p style={styles.heroMeaning}>{summary.doctrine.trustMeaning}</p>
          </div>

          <div style={styles.questionBox}>
            <p style={styles.metricLabel}>Audit Question</p>

            <p style={styles.questionText}>
              Can continuity be reconstructed from the available evidence?
            </p>
          </div>
        </section>

        <section style={styles.metricGrid}>
          <MetricCard title="Evidence Records" value={summary.total} />
          <MetricCard
            title="Trust Score"
            value={summary.executiveTrustScore}
          />
          <MetricCard title="Linked Snapshots" value={summary.linkedSnapshots} />
          <MetricCard
            title="Immutable Records"
            value={summary.immutableRecords}
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Pilot Reconstruction Proof</p>

          <h2 style={styles.cardTitle}>{pilotThread.scenarioName}</h2>

          <p style={styles.bodyText}>{pilotThread.executiveThesis}</p>

          <div style={styles.pilotGrid}>
            <PilotItem
              title="Subject"
              body="Repeated fuel logistics disruption."
            />
            <PilotItem
              title="Verdict"
              body="Pilot chain remains reconstructable."
            />
            <PilotItem title="Memory" body={pilotThread.executiveMemory} />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Reconstruction Gaps</p>

          <h2 style={styles.cardTitle}>{chainReconstruction.chainTrust}</h2>

          <p style={styles.bodyText}>
            Weakest link: {chainReconstruction.weakestLink}
          </p>

          <div style={styles.groupGrid}>
            {groupedChain.map((group) => (
              <GroupCard key={group.label} group={group} />
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Evidence Integrity</p>

          <h2 style={styles.cardTitle}>Where is credibility weak?</h2>

          <p style={styles.bodyText}>{summary.doctrine.evidenceGap}</p>

          <div style={styles.groupGrid}>
            {integrityGroups.map((group) => (
              <GroupCard key={group.label} group={group} />
            ))}
          </div>
        </section>

        <details style={styles.filterCard}>
          <summary style={styles.filterSummary}>Advanced Evidence Filters</summary>

          <div style={styles.filterGrid}>
            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value)}
              style={styles.select}
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
              style={styles.select}
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
              style={styles.select}
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
              style={styles.select}
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
              placeholder="Search evidence..."
              style={styles.searchInput}
            />
          </div>
        </details>

        <section style={styles.gridTwo}>
          <section style={styles.card}>
            <p style={styles.sectionKicker}>Executive Review Evidence</p>

            <h2 style={styles.cardTitle}>Evidence requiring visibility.</h2>

            <div style={styles.stack}>
              {recentExecutiveReview.length === 0 ? (
                <EmptyPanel
                  title="No critical or high-risk evidence visible."
                  body="Executive review evidence will appear here when severity rises."
                />
              ) : (
                recentExecutiveReview.map((log) => (
                  <article key={log.id} style={styles.reviewCard}>
                    <div style={styles.badgeRow}>
                      <span style={styles.severityBadge}>
                        {normalizeSeverity(log.severity)}
                      </span>

                      <span style={styles.dateText}>
                        {formatDate(log.created_at)}
                      </span>
                    </div>

                    <h3 style={styles.reviewTitle}>
                      {safeText(log.action_type)}
                    </h3>

                    <p style={styles.reviewText}>Actor: {getActor(log)}</p>
                    <p style={styles.reviewText}>
                      Institution: {getInstitution(log)}
                    </p>

                    <div style={styles.maturityPill}>
                      {resolveEvidenceMaturity(log)}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section style={styles.card}>
            <p style={styles.sectionKicker}>Required Next Action</p>

            <h2 style={styles.cardTitle}>
              {summary.doctrine.auditCredibility}
            </h2>

            <p style={styles.bodyText}>{summary.doctrine.requiredMovement}</p>

            <button
              type="button"
              onClick={loadAuditLogs}
              disabled={loading}
              style={{
                ...styles.primaryButton,
                ...(loading ? styles.disabledButton : {}),
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh Evidence Ledger'}
            </button>
          </section>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Immutable Continuity Ledger</p>

          <h2 style={styles.cardTitle}>
            Evidence must support reconstruction without becoming surveillance.
          </h2>

          {loading ? (
            <EmptyPanel
              title="Loading governance evidence..."
              body="Audit records are being retrieved from the ledger."
            />
          ) : sortedLogs.length === 0 ? (
            <EmptyPanel
              title="Immutable ledger activates when audit evidence exists."
              body="No live evidence records match the current view. The interface remains ready without displaying empty archives."
            />
          ) : (
            <div style={styles.ledgerList}>
              {sortedLogs.map((log) => {
                const maturity = resolveEvidenceMaturity(log)

                return (
                  <article key={log.id} style={styles.ledgerItem}>
                    <div style={styles.ledgerHeader}>
                      <div style={styles.badgeRow}>
                        <span style={styles.severityBadge}>
                          {normalizeSeverity(log.severity)}
                        </span>

                        <span style={styles.actionBadge}>
                          {safeText(log.action_type)}
                        </span>

                        <span style={styles.maturityBadge}>{maturity}</span>
                      </div>

                      <p style={styles.dateText}>{formatDate(log.created_at)}</p>
                    </div>

                    <div style={styles.ledgerSummaryGrid}>
                      <EvidenceLine label="Actor" value={getActor(log)} />
                      <EvidenceLine
                        label="Institution"
                        value={getInstitution(log)}
                      />
                      <EvidenceLine
                        label="Record Type"
                        value={getRecordType(log)}
                      />
                      <EvidenceLine
                        label="Integrity"
                        value={
                          isImmutableRecord(log)
                            ? 'Immutable record'
                            : 'Integrity incomplete'
                        }
                      />
                      <EvidenceLine
                        label="Visibility"
                        value={getVisibilityLevel(log)}
                      />
                      <EvidenceLine
                        label="Linked Snapshot"
                        value={getLinkedSnapshot(log)}
                      />
                    </div>

                    <details style={styles.detailsBox}>
                      <summary style={styles.detailsSummary}>
                        View evidence details
                      </summary>

                      <p style={styles.maturityMeaning}>
                        {getMaturityMeaning(maturity)}
                      </p>

                      <EvidenceLine
                        label="Governance Reason"
                        value={getEvidenceReason(log)}
                      />

                      {log.details && (
                        <pre style={styles.preBlock}>
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </details>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section style={styles.principleCard}>
          <div style={styles.principleIcon}>§</div>

          <div>
            <p style={styles.sectionKicker}>Audit Principle</p>

            <p style={styles.principleText}>
              Audit preserves evidence integrity. It does not create blame,
              closure, or operational noise. It protects the institution’s
              ability to reconstruct what happened when continuity credibility is
              questioned.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

function buildReconstructionGroups(
  stages: ChainStage[],
): ReconstructionGroup[] {
  const groups = [
    {
      label: 'Lifecycle',
      keys: [
        'REQUEST',
        'TRIAGE',
        'CASES',
        'ROUTING',
        'INTERVENTION',
        'OUTCOMES',
        'RECOVERY',
      ],
    },
    {
      label: 'Executive',
      keys: ['COMMAND', 'COORDINATION', 'CROSS', 'SITUATION', 'EXECUTIVE'],
    },
    {
      label: 'Memory',
      keys: ['MEMORY'],
    },
    {
      label: 'Audit',
      keys: ['AUDIT'],
    },
  ]

  return groups.map((group) => {
    const matched = stages.filter((stage) =>
      group.keys.some((key) => stage.label.toUpperCase().includes(key)),
    )

    const count = matched.reduce((total, stage) => total + stage.count, 0)
    const missing = matched.length === 0 || matched.some((stage) => stage.status === 'MISSING')

    return {
      label: group.label,
      count,
      status: missing ? 'MISSING' : 'VISIBLE',
    }
  })
}

function buildIntegrityGroups(
  provenance: ProvenanceStage[],
  evidenceGaps: EvidenceGapItem[],
  auditMemory: { label: string; count: number }[],
): ReconstructionGroup[] {
  const evidenceGapCount = evidenceGaps.reduce(
    (total, gap) => total + gap.count,
    0,
  )

  const ownershipGapCount = evidenceGaps
    .filter((gap) =>
      ['OWNER', 'ACTOR', 'ROUTE', 'SCOPE'].some((key) =>
        gap.label.toUpperCase().includes(key),
      ),
    )
    .reduce((total, gap) => total + gap.count, 0)

  const visibilityGapCount =
    evidenceGaps
      .filter((gap) =>
        ['VISIBILITY', 'SNAPSHOT', 'LINK'].some((key) =>
          gap.label.toUpperCase().includes(key),
        ),
      )
      .reduce((total, gap) => total + gap.count, 0) +
    provenance
      .filter((stage) => stage.status === 'MISSING')
      .reduce((total, stage) => total + stage.count, 0)

  const memoryGapCount = auditMemory.reduce(
    (total, item) => total + item.count,
    0,
  )

  return [
    { label: 'Evidence Gaps', count: evidenceGapCount, status: 'Gap' },
    { label: 'Ownership Gaps', count: ownershipGapCount, status: 'Gap' },
    { label: 'Visibility Gaps', count: visibilityGapCount, status: 'Gap' },
    { label: 'Memory Gaps', count: memoryGapCount, status: 'Memory' },
  ]
}

function formatDate(value?: string | null) {
  if (!value) return 'Not recorded'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString()
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{title}</p>
      <p style={styles.metricValue}>{value}</p>
    </article>
  )
}

function PilotItem({ title, body }: { title: string; body: string }) {
  return (
    <article style={styles.pilotItem}>
      <p style={styles.metricLabel}>{title}</p>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function GroupCard({ group }: { group: ReconstructionGroup }) {
  return (
    <article
      style={{
        ...styles.groupCard,
        ...(group.status === 'MISSING' ? styles.groupCardMissing : {}),
      }}
    >
      <p style={styles.metricLabel}>{group.label}</p>
      <p style={styles.groupValue}>{group.count}</p>
      <strong style={styles.groupStatus}>{group.status}</strong>
    </article>
  )
}

function EmptyPanel({ title, body }: { title: string; body: string }) {
  return (
    <div style={styles.emptyPanel}>
      <p style={styles.emptyTitle}>{title}</p>
      <p style={styles.emptyText}>{body}</p>
    </div>
  )
}

function EvidenceLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.evidenceLine}>
      <p style={styles.evidenceLabel}>{label}</p>
      <p style={styles.evidenceValue}>{value}</p>
    </div>
  )
}

const gold = '#d6b25e'
const mutedGold = '#9f8142'
const deepBlack = '#030303'
const panelBlack = '#090807'
const cardBlack = '#11100d'
const softLine = 'rgba(214,178,94,0.24)'

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: '#f5f0e6',
    overflowX: 'hidden',
    background:
      'radial-gradient(circle at top right, rgba(214,178,94,0.08), transparent 32%), #030303',
  },
  container: {
    width: '100%',
    maxWidth: 1120,
    margin: '0 auto',
    padding: '16px 28px 72px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: 24,
  },
  kicker: {
    color: gold,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 2,
    margin: 0,
  },
  title: {
    color: '#fff8e7',
    fontSize: 'clamp(34px, 4vw, 48px)',
    lineHeight: 1,
    margin: '10px 0',
    letterSpacing: '-0.05em',
  },
  subtitle: {
    color: '#cfc7b5',
    maxWidth: 820,
    lineHeight: 1.65,
    fontSize: 14,
    margin: 0,
  },
  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
    marginTop: 18,
  },
  doctrineCard: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: 14,
    padding: 14,
    color: '#fff8e7',
    fontSize: 12,
    lineHeight: 1.45,
    fontWeight: 800,
  },
  errorBox: {
    background: 'rgba(127, 29, 29, 0.52)',
    border: '1px solid rgba(248, 113, 113, 0.45)',
    color: '#fecaca',
    padding: '13px 16px',
    borderRadius: 14,
    fontWeight: 800,
    marginBottom: 24,
    fontSize: 13,
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.65fr)',
    gap: 24,
    background: 'linear-gradient(135deg, rgba(214,178,94,0.13), #030303)',
    border: `1px solid ${gold}`,
    borderRadius: 22,
    padding: 24,
    marginBottom: 20,
  },
  sectionKicker: {
    color: mutedGold,
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: 10,
  },
  heroTitle: {
    color: gold,
    fontSize: 'clamp(32px, 4vw, 48px)',
    lineHeight: 1,
    margin: '10px 0',
    letterSpacing: '-0.05em',
  },
  heroMeaning: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
    fontSize: 14,
  },
  questionBox: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: 18,
    padding: 20,
  },
  questionText: {
    color: '#fff8e7',
    fontSize: 21,
    lineHeight: 1.25,
    margin: '10px 0 0',
    fontWeight: 900,
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 14,
    marginBottom: 20,
  },
  metricCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: 16,
    padding: 16,
    minHeight: 104,
  },
  metricLabel: {
    color: mutedGold,
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  metricValue: {
    color: gold,
    fontSize: 32,
    fontWeight: 950,
    lineHeight: 1,
    margin: '12px 0 0',
  },
  card: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: 22,
    padding: 24,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#fff8e7',
    fontSize: 'clamp(22px, 3vw, 30px)',
    lineHeight: 1.15,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  bodyText: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    fontSize: 13,
    margin: 0,
  },
  pilotGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
    marginTop: 16,
  },
  pilotItem: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: 16,
    padding: 14,
  },
  panelBody: {
    color: '#cfc7b5',
    fontSize: 13,
    lineHeight: 1.6,
    marginTop: 10,
  },
  groupGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 16,
  },
  groupCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: 16,
    padding: 14,
    minHeight: 116,
  },
  groupCardMissing: {
    border: '1px solid rgba(248,113,113,0.45)',
    background: 'rgba(127,29,29,0.18)',
  },
  groupValue: {
    color: gold,
    fontSize: 30,
    fontWeight: 950,
    margin: '10px 0 4px',
    lineHeight: 1,
  },
  groupStatus: {
    display: 'block',
    color: '#fff8e7',
    fontSize: 12,
    marginTop: 8,
  },
  filterCard: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },
  filterSummary: {
    color: gold,
    cursor: 'pointer',
    fontWeight: 950,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 12,
    marginTop: 16,
  },
  select: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: 12,
    color: '#fff8e7',
    padding: 12,
    fontSize: 13,
    fontWeight: 800,
    minWidth: 0,
  },
  searchInput: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: 12,
    color: '#fff8e7',
    padding: 12,
    fontSize: 13,
    fontWeight: 800,
    minWidth: 0,
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 20,
    marginBottom: 20,
  },
  stack: {
    display: 'grid',
    gap: 12,
    marginTop: 16,
  },
  reviewCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: 16,
    padding: 16,
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  severityBadge: {
    background: 'rgba(127, 29, 29, 0.55)',
    border: '1px solid rgba(248, 113, 113, 0.35)',
    borderRadius: 999,
    color: '#fecaca',
    padding: '6px 10px',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  actionBadge: {
    background: 'rgba(214,178,94,0.14)',
    border: `1px solid ${softLine}`,
    borderRadius: 999,
    color: '#f8e7b8',
    padding: '6px 10px',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  maturityBadge: {
    background: '#111827',
    border: '1px solid rgba(148,163,184,0.28)',
    borderRadius: 999,
    color: '#e5e7eb',
    padding: '6px 10px',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  dateText: {
    color: '#b8aa8a',
    fontSize: 12,
    margin: 0,
  },
  reviewTitle: {
    color: '#fff8e7',
    margin: '12px 0 10px',
    fontSize: 18,
  },
  reviewText: {
    color: '#cfc7b5',
    fontSize: 13,
    margin: '6px 0',
  },
  maturityPill: {
    display: 'inline-flex',
    marginTop: 10,
    background: '#111827',
    border: '1px solid rgba(148,163,184,0.28)',
    borderRadius: 999,
    color: '#e5e7eb',
    padding: '7px 10px',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  primaryButton: {
    border: 'none',
    borderRadius: 14,
    background: gold,
    color: '#11100d',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 950,
    minHeight: 48,
    padding: '0 18px',
    marginTop: 18,
    whiteSpace: 'nowrap',
  },
  disabledButton: {
    cursor: 'not-allowed',
    opacity: 0.65,
  },
  ledgerList: {
    display: 'grid',
    gap: 14,
    marginTop: 16,
  },
  ledgerItem: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: 18,
    padding: 16,
  },
  ledgerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  ledgerSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 10,
    marginTop: 14,
  },
  evidenceLine: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: 14,
    padding: 12,
  },
  evidenceLabel: {
    color: mutedGold,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  evidenceValue: {
    color: '#fff8e7',
    lineHeight: 1.45,
    margin: '7px 0 0',
    overflowWrap: 'anywhere',
  },
  detailsBox: {
    marginTop: 14,
    borderTop: `1px solid ${softLine}`,
    paddingTop: 14,
  },
  detailsSummary: {
    color: gold,
    cursor: 'pointer',
    fontWeight: 900,
    fontSize: 13,
  },
  maturityMeaning: {
    color: '#f8e7b8',
    lineHeight: 1.6,
    fontSize: 13,
    margin: '12px 0',
  },
  preBlock: {
    marginTop: 12,
    whiteSpace: 'pre-wrap',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: 12,
    padding: 12,
    color: '#e8dec8',
    fontSize: 12,
    overflowX: 'auto',
    maxHeight: 360,
  },
  emptyPanel: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: 16,
    padding: 16,
  },
  emptyTitle: {
    color: '#fff8e7',
    margin: '0 0 8px',
    fontWeight: 900,
  },
  emptyText: {
    color: '#cfc7b5',
    margin: 0,
    lineHeight: 1.6,
  },
  principleCard: {
    display: 'grid',
    gridTemplateColumns: '58px minmax(0, 1fr)',
    gap: 16,
    alignItems: 'start',
    background: panelBlack,
    border: `1px solid ${gold}`,
    borderRadius: 22,
    padding: 22,
  },
  principleIcon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    background: gold,
    color: deepBlack,
    display: 'grid',
    placeItems: 'center',
    fontSize: 28,
    fontWeight: 950,
  },
  principleText: {
    color: '#fff8e7',
    fontSize: 17,
    lineHeight: 1.55,
    margin: '8px 0 0',
    fontWeight: 800,
  },
}