'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
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

type CredibilityReading =
  | 'CREDIBILITY NOT ESTABLISHED'
  | 'CREDIBILITY WATCH'
  | 'CREDIBILITY STRENGTHENING'
  | 'CREDIBILITY STRONG'
  | 'CREDIBILITY COMPROMISED'

type AuditEscalation =
  | 'NO ESCALATION'
  | 'COMMAND WATCH'
  | 'GOVERNANCE ESCALATION'
  | 'EXECUTIVE REVIEW'

type ChainReconstructionPosture =
  | 'CHAIN NOT YET RECONSTRUCTABLE'
  | 'PARTIAL CHAIN RECONSTRUCTION'
  | 'CHAIN RECONSTRUCTION ACTIVE'
  | 'EXECUTIVE CHAIN RECONSTRUCTABLE'

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
  reconstructionConfidence: string
  executiveTrustScore: number
  trustMeaning: string
  institutionalCredibility: CredibilityReading
  credibilityMeaning: string
  auditEscalation: AuditEscalation
  escalationReason: string
  evidenceGap: string
  memoryMeaning: string
}

type ProvenanceStage = {
  label: string
  count: number
  status: string
  meaning: string
}

type EvidenceGapItem = {
  label: string
  count: number
  meaning: string
}

type AuditMemoryItem = {
  label: string
  count: number
  meaning: string
}

type ChainStage = {
  label: string
  count: number
  status: string
  meaning: string
}

type ChainReconstruction = {
  posture: ChainReconstructionPosture
  chainQuestion: string
  reconstructionMeaning: string
  weakestLink: string
  nextAuditAction: string
  requiredEvidence: string
  chainTrust: string
  stages: ChainStage[]
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
  'Evidence protects lifecycle credibility.',
]

const PROVENANCE_STAGES = [
  { label: 'Request', terms: ['REQUEST', '/REQUEST'] },
  { label: 'Triage', terms: ['TRIAGE', '/TRIAGE'] },
  { label: 'Cases', terms: ['CASE', 'CASES', '/CASES'] },
  { label: 'Routing', terms: ['ROUTING', 'ROUTED', '/ROUTING'] },
  {
    label: 'Intervention',
    terms: ['INTERVENTION', 'INTERVENTIONS', '/INTERVENTIONS'],
  },
  { label: 'Outcomes', terms: ['OUTCOME', 'OUTCOMES', '/OUTCOMES'] },
  { label: 'Recovery', terms: ['RECOVERY', '/RECOVERY', 'DURABILITY'] },
  { label: 'Command', terms: ['COMMAND', '/COMMAND', 'ESCALATION'] },
  {
    label: 'Coordination',
    terms: ['COORDINATION', '/COORDINATION', 'SYNCHRONIZATION'],
  },
  {
    label: 'Cross-Site',
    terms: ['CROSS-SITE', '/CROSS-SITE', 'ENTERPRISE PATTERN'],
  },
  {
    label: 'Executive Center',
    terms: ['EXECUTIVE CENTER', '/EXECUTIVE-CENTER', 'EXECUTIVE'],
  },
  { label: 'Audit', terms: ['AUDIT', '/AUDIT', 'RECONSTRUCTION'] },
]

const CHAIN_STAGES = [
  {
    label: 'Recovery',
    terms: ['RECOVERY', '/RECOVERY', 'DURABILITY', 'FRAGILE_RECOVERY'],
  },
  {
    label: 'Command',
    terms: ['COMMAND', '/COMMAND', 'COMMAND WATCH', 'ESCALATION'],
  },
  {
    label: 'Coordination',
    terms: ['COORDINATION', '/COORDINATION', 'SYNCHRONIZATION'],
  },
  {
    label: 'Cross-Site',
    terms: ['CROSS-SITE', '/CROSS-SITE', 'ENTERPRISE PATTERN'],
  },
  {
    label: 'Executive Center',
    terms: ['EXECUTIVE CENTER', '/EXECUTIVE-CENTER', 'EXECUTIVE'],
  },
  {
    label: 'Audit',
    terms: ['AUDIT', '/AUDIT', 'RECONSTRUCTION', 'RECONSTRUCTABLE'],
  },
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

  const summary = useMemo(() => buildEvidenceSummary(filteredLogs), [filteredLogs])

  const provenance = useMemo(
    () => buildEvidenceProvenance(filteredLogs),
    [filteredLogs],
  )

  const chainReconstruction = useMemo(
    () => buildChainReconstruction(filteredLogs),
    [filteredLogs],
  )

  const evidenceGaps = useMemo(
    () => buildEvidenceGapDashboard(filteredLogs),
    [filteredLogs],
  )

  const auditMemory = useMemo(
    () => buildAuditMemory(filteredLogs),
    [filteredLogs],
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
            Final evidence seal for reconstructing lifecycle movement,
            governance action, recovery credibility, command decisions,
            coordination synchronization, cross-site exposure, executive
            visibility, memory preservation, and continuity accountability.
          </p>

          <section style={styles.doctrinePanel}>
            <p style={styles.doctrineTitle}>AUDIT DOCTRINE</p>

            <div style={styles.doctrineGrid}>
              {LEDGER_DOCTRINE.map((item) => (
                <div key={item} style={styles.doctrineCard}>
                  {item}
                </div>
              ))}
            </div>
          </section>
        </section>

        {error && <section style={styles.errorBox}>{error}</section>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Evidence Integrity Posture</p>

            <h2 style={styles.heroTitle}>{summary.evidencePosture}</h2>

            <p style={styles.heroMeaning}>{summary.evidenceMeaning}</p>
          </div>

          <div style={styles.questionBox}>
            <p style={styles.metricLabel}>Audit Question</p>

            <p style={styles.questionText}>
              Can leadership reconstruct how continuity moved from recovery
              through command, coordination, cross-site review, executive
              synthesis, and audit preservation?
            </p>
          </div>
        </section>

        <section style={styles.chainHero}>
          <div>
            <p style={styles.sectionKicker}>Continuity Chain Reconstruction</p>

            <h2 style={styles.cardTitle}>{chainReconstruction.posture}</h2>

            <p style={styles.bodyText}>
              {chainReconstruction.reconstructionMeaning}
            </p>
          </div>

          <div style={styles.questionBox}>
            <p style={styles.metricLabel}>Weakest Link</p>

            <p style={styles.questionText}>{chainReconstruction.weakestLink}</p>
          </div>
        </section>

        <section style={styles.chainGrid}>
          {chainReconstruction.stages.map((stage) => (
            <ChainStageCard key={stage.label} stage={stage} />
          ))}
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Next Audit Action">
            <p style={styles.panelText}>
              {chainReconstruction.nextAuditAction}
            </p>
          </Panel>

          <Panel title="Required Evidence">
            <p style={styles.panelText}>
              {chainReconstruction.requiredEvidence}
            </p>
          </Panel>
        </section>

        <section style={styles.reconstructionPanel}>
          <div>
            <p style={styles.sectionKicker}>Institutional Credibility Reading</p>

            <h2 style={styles.cardTitle}>{summary.institutionalCredibility}</h2>

            <p style={styles.bodyText}>{summary.credibilityMeaning}</p>
          </div>

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

        <section style={styles.summaryGrid}>
          <MetricCard title="Evidence Records" value={summary.total} />
          <MetricCard title="Trust Score" value={summary.executiveTrustScore} />
          <MetricCard title="Legacy Evidence" value={summary.legacyEvidence} />
          <MetricCard title="Hardened Evidence" value={summary.hardenedEvidence} />
          <MetricCard
            title="Executive Reconstructable"
            value={summary.executiveReconstructable}
          />
          <MetricCard title="Immutable Records" value={summary.immutableRecords} />
          <MetricCard title="Institution Scoped" value={summary.institutionScoped} />
          <MetricCard title="Linked Snapshots" value={summary.linkedSnapshots} />
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Executive Trust Score">
            <div style={styles.scoreBlock}>
              <p style={styles.scoreNumber}>{summary.executiveTrustScore}</p>
              <p style={styles.scoreLabel}>out of 100</p>
              <p style={styles.panelText}>{summary.trustMeaning}</p>
            </div>
          </Panel>

          <Panel title="Audit Escalation Logic">
            <div style={styles.infoList}>
              <Info label="Escalation" value={summary.auditEscalation} />
              <Info label="Reason" value={summary.escalationReason} />
              <Info label="Chain Trust" value={chainReconstruction.chainTrust} />
              <Info
                label="Command Concern"
                value={
                  summary.auditEscalation === 'COMMAND WATCH' ||
                  summary.auditEscalation === 'EXECUTIVE REVIEW'
                    ? 'VISIBLE'
                    : 'NOT CURRENTLY VISIBLE'
                }
              />
            </div>
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Evidence Provenance</p>

          <h2 style={styles.cardTitle}>Where did evidence come from?</h2>

          <p style={styles.bodyText}>
            Audit reveals which lifecycle stages generated evidence and which
            stages remain difficult to reconstruct.
          </p>

          <div style={styles.provenanceGrid}>
            {provenance.map((stage) => (
              <ProvenanceCard key={stage.label} stage={stage} />
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Evidence Gaps Dashboard</p>

          <h2 style={styles.cardTitle}>Where is credibility weak?</h2>

          <p style={styles.bodyText}>
            Evidence gaps show where lifecycle credibility may weaken if
            decisions, actions, recovery, coordination, cross-site review, audit
            reconstruction, or executive review are not preserved.
          </p>

          <div style={styles.gapGrid}>
            {evidenceGaps.map((gap) => (
              <EvidenceGapCard key={gap.label} gap={gap} />
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Audit Memory</p>

          <h2 style={styles.cardTitle}>Which evidence gaps keep returning?</h2>

          <p style={styles.bodyText}>
            Audit memory tracks recurring weaknesses in reconstruction, evidence
            maturity, governance scope, lifecycle proof, and continuity chain
            preservation.
          </p>

          <div style={styles.gapGrid}>
            {auditMemory.map((item) => (
              <AuditMemoryCard key={item.label} item={item} />
            ))}
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="What Evidence Exists?">
            <div style={styles.infoList}>
              <Info label="Total Records" value={String(summary.total)} />
              <Info
                label="Governance Actions"
                value={String(summary.governanceActions)}
              />
              <Info
                label="Visibility Classified"
                value={String(summary.visibilityClassified)}
              />
              <Info label="Evidence Actors" value={String(summary.uniqueActors)} />
            </div>
          </Panel>

          <Panel title="What Evidence Is Missing?">
            <p style={styles.panelText}>{summary.evidenceGap}</p>
          </Panel>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="What Requires Executive Review?">
            <div style={styles.infoList}>
              <Info label="Critical Records" value={String(summary.critical)} />
              <Info label="High Records" value={String(summary.high)} />
              <Info
                label="Executive Review"
                value={
                  recentExecutiveReview.length > 0
                    ? 'VISIBLE'
                    : 'NOT CURRENTLY VISIBLE'
                }
              />
            </div>
          </Panel>

          <Panel title="What Must Be Preserved For Memory?">
            <p style={styles.panelText}>{summary.memoryMeaning}</p>
          </Panel>
        </section>

        <section style={styles.whyCard}>
          <p style={styles.sectionKicker}>Why Evidence Matters</p>

          <h2 style={styles.cardTitle}>
            Evidence separates recovery from appearance.
          </h2>

          <p style={styles.bodyText}>
            Without reconstructable evidence, leadership cannot distinguish
            recovery from appearance, closure from stabilization, coordination
            from assumption, cross-site exposure from isolated pressure, or
            confidence from proof. Audit protects continuity credibility by
            preserving what happened, why it mattered, what proof exists, and
            what remains unresolved.
          </p>
        </section>

        <section style={styles.filterCard}>
          <p style={styles.sectionKicker}>Evidence Filters</p>

          <h2 style={styles.cardTitle}>Review without altering the record.</h2>

          <p style={styles.bodyText}>
            Filter the ledger by severity, actor, route, maturity, or evidence
            content. Filtering does not change the preserved audit record.
          </p>

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
              placeholder="Search governance evidence..."
              style={styles.searchInput}
            />
          </div>
        </section>

        <section style={styles.gridTwo}>
          <section style={styles.card}>
            <p style={styles.sectionKicker}>Executive Review Evidence</p>

            <h2 style={styles.cardTitle}>Evidence requiring visibility.</h2>

            <p style={styles.bodyText}>
              Critical and high-risk records remain visible for executive review
              before continuity confidence is restored.
            </p>

            <div style={styles.stack}>
              {recentExecutiveReview.length === 0 && (
                <EmptyPanel
                  title="No critical or high-risk evidence visible."
                  body="This is acceptable when the lifecycle is clear. Executive review evidence will appear here when severity rises."
                />
              )}

              {recentExecutiveReview.map((log) => (
                <article key={log.id} style={styles.reviewCard}>
                  <div style={styles.badgeRow}>
                    <span style={styles.severityBadge}>
                      {normalizeSeverity(log.severity)}
                    </span>

                    <span style={styles.dateText}>
                      {formatDate(log.created_at)}
                    </span>
                  </div>

                  <h3 style={styles.reviewTitle}>{safeText(log.action_type)}</h3>

                  <p style={styles.reviewText}>Actor: {getActor(log)}</p>
                  <p style={styles.reviewText}>
                    Institution: {getInstitution(log)}
                  </p>

                  <div style={styles.maturityPill}>
                    {resolveEvidenceMaturity(log)}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section style={styles.card}>
            <p style={styles.sectionKicker}>Governance Reconstruction Meaning</p>

            <h2 style={styles.cardTitle}>Evidence maturity levels.</h2>

            <div style={styles.stack}>
              <MeaningCard
                title="Legacy Evidence"
                text="Historical evidence remains visible, but is clearly separated from newer hardened governance records."
              />
              <MeaningCard
                title="Hardened Evidence"
                text="Structured governance meaning is preserved so role, routing, intervention, coordination, and operational decisions do not disappear."
              />
              <MeaningCard
                title="Executive Reconstruction"
                text="The strongest records preserve enough context for leaders to reconstruct what happened, why it mattered, whether continuity was governed, and whether the chain can be trusted."
              />
            </div>
          </section>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Immutable Continuity Ledger</p>

          <h2 style={styles.cardTitle}>
            Evidence must support reconstruction without becoming surveillance.
          </h2>

          <p style={styles.bodyText}>
            Records are sorted by maturity, severity, and recency. Each record
            supports continuity reconstruction while preserving governance-safe
            interpretation.
          </p>

          <div style={styles.ledgerList}>
            {loading ? (
              <EmptyPanel
                title="Loading governance evidence..."
                body="Audit records are being retrieved from the ledger."
              />
            ) : sortedLogs.length === 0 ? (
              <EmptyPanel
                title="No evidence records match the current view."
                body="This may mean the ledger is clean, the filters are too narrow, or audit records have not yet been created."
              />
            ) : (
              sortedLogs.map((log) => {
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

                        <span style={styles.integrityBadge}>
                          {isImmutableRecord(log)
                            ? 'Immutable record'
                            : 'Integrity incomplete'}
                        </span>

                        <span style={styles.maturityBadge}>{maturity}</span>
                      </div>

                      <p style={styles.dateText}>{formatDate(log.created_at)}</p>
                    </div>

                    <p style={styles.maturityMeaning}>
                      {getMaturityMeaning(maturity)}
                    </p>

                    <div style={styles.evidenceGrid}>
                      <EvidenceLine label="Actor" value={getActor(log)} />
                      <EvidenceLine
                        label="Route / Source"
                        value={safeText(log.route)}
                      />
                      <EvidenceLine
                        label="Record Type"
                        value={getRecordType(log)}
                      />
                      <EvidenceLine
                        label="Institution"
                        value={getInstitution(log)}
                      />
                      <EvidenceLine
                        label="Visibility"
                        value={getVisibilityLevel(log)}
                      />
                      <EvidenceLine
                        label="Linked Snapshot"
                        value={getLinkedSnapshot(log)}
                      />
                      <EvidenceLine
                        label="Governance Reason"
                        value={getEvidenceReason(log)}
                      />
                    </div>

                    {log.details && (
                      <details style={styles.detailsBox}>
                        <summary style={styles.detailsSummary}>
                          View preserved evidence details
                        </summary>

                        <pre style={styles.preBlock}>
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </article>
                )
              })
            )}
          </div>
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

function buildEvidenceSummary(logs: AuditLog[]): EvidenceSummary {
  const critical = logs.filter(
    (log) => normalizeSeverity(log.severity) === 'CRITICAL',
  ).length

  const high = logs.filter(
    (log) => normalizeSeverity(log.severity) === 'HIGH',
  ).length

  const governanceActions = logs.filter((log) =>
    safeText(log.action_type, '').toUpperCase().includes('GOVERNANCE'),
  ).length

  const uniqueActors = new Set(logs.map(getActorKey).filter(Boolean)).size
  const institutionScoped = logs.filter(hasInstitutionScope).length
  const immutableRecords = logs.filter(isImmutableRecord).length
  const visibilityClassified = logs.filter(hasVisibilityClassification).length
  const linkedSnapshots = logs.filter(hasLinkedSnapshot).length

  const legacyEvidence = logs.filter(
    (log) => resolveEvidenceMaturity(log) === 'LEGACY EVIDENCE',
  ).length

  const hardenedEvidence = logs.filter(
    (log) => resolveEvidenceMaturity(log) === 'HARDENED GOVERNANCE EVIDENCE',
  ).length

  const executiveReconstructable = logs.filter(
    (log) => resolveEvidenceMaturity(log) === 'EXECUTIVE RECONSTRUCTABLE',
  ).length

  const evidencePosture = resolveEvidencePosture({
    total: logs.length,
    critical,
    high,
    governanceActions,
    institutionScoped,
    immutableRecords,
    legacyEvidence,
  })

  const reconstructionConfidence = buildReconstructionConfidence({
    total: logs.length,
    immutableRecords,
    institutionScoped,
    visibilityClassified,
    linkedSnapshots,
    executiveReconstructable,
  })

  const executiveTrustScore = buildTrustScore({
    total: logs.length,
    immutableRecords,
    institutionScoped,
    visibilityClassified,
    linkedSnapshots,
    executiveReconstructable,
    high,
    critical,
  })

  const auditEscalation = buildAuditEscalation({
    total: logs.length,
    high,
    critical,
    executiveTrustScore,
    executiveReconstructable,
  })

  const institutionalCredibility = buildInstitutionalCredibility({
    total: logs.length,
    executiveTrustScore,
    high,
    critical,
    evidencePosture,
  })

  return {
    total: logs.length,
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
    reconstructionConfidence,
    executiveTrustScore,
    trustMeaning: buildTrustMeaning(executiveTrustScore, logs.length),
    institutionalCredibility,
    credibilityMeaning: buildCredibilityMeaning(institutionalCredibility),
    auditEscalation,
    escalationReason: buildEscalationReason(auditEscalation),
    evidenceGap: buildEvidenceGap({
      total: logs.length,
      institutionScoped,
      visibilityClassified,
      linkedSnapshots,
      executiveReconstructable,
    }),
    memoryMeaning: buildMemoryMeaning(logs.length),
  }
}

function buildEvidenceProvenance(logs: AuditLog[]): ProvenanceStage[] {
  return PROVENANCE_STAGES.map((stage) => {
    const count = logs.filter((log) => {
      const text = fullEvidenceText(log)
      const route = safeText(log.route, '').toUpperCase()
      return stage.terms.some((term) => text.includes(term) || route.includes(term))
    }).length

    return {
      label: stage.label,
      count,
      status:
        count === 0
          ? 'NO EVIDENCE YET'
          : count >= 3
            ? 'EVIDENCE ACTIVE'
            : 'EVIDENCE PRESENT',
      meaning:
        count === 0
          ? `${stage.label} evidence has not yet appeared in the audit ledger.`
          : `${stage.label} evidence can be reconstructed from preserved audit records.`,
    }
  })
}

function buildChainReconstruction(logs: AuditLog[]): ChainReconstruction {
  const stages: ChainStage[] = CHAIN_STAGES.map((stage) => {
    const count = logs.filter((log) => {
      const text = fullEvidenceText(log)
      const route = safeText(log.route, '').toUpperCase()
      return stage.terms.some((term) => text.includes(term) || route.includes(term))
    }).length

    return {
      label: stage.label,
      count,
      status:
        count === 0
          ? 'MISSING'
          : count >= 3
            ? 'RECONSTRUCTABLE'
            : 'VISIBLE',
      meaning:
        count === 0
          ? `${stage.label} is not yet reconstructable from the current audit evidence.`
          : `${stage.label} has preserved evidence for continuity reconstruction.`,
    }
  })

  const activeStages = stages.filter((stage) => stage.count > 0).length
  const missingStages = stages.filter((stage) => stage.count === 0)
  const executiveStage = stages.find((stage) => stage.label === 'Executive Center')
  const auditStage = stages.find((stage) => stage.label === 'Audit')

  let posture: ChainReconstructionPosture = 'CHAIN NOT YET RECONSTRUCTABLE'

  if (activeStages >= CHAIN_STAGES.length) {
    posture = 'EXECUTIVE CHAIN RECONSTRUCTABLE'
  } else if (activeStages >= 4 && executiveStage && executiveStage.count > 0) {
    posture = 'CHAIN RECONSTRUCTION ACTIVE'
  } else if (activeStages > 0) {
    posture = 'PARTIAL CHAIN RECONSTRUCTION'
  }

  const weakestLink =
    missingStages.length === 0
      ? 'No major chain gap is visible.'
      : missingStages.map((stage) => stage.label).join(', ')

  return {
    posture,
    chainQuestion:
      'Can Audit reconstruct how continuity moved through Recovery, Command, Coordination, Cross-Site, Executive Center, and Audit?',
    reconstructionMeaning: buildChainReconstructionMeaning(posture),
    weakestLink,
    nextAuditAction: buildNextAuditAction(posture, weakestLink),
    requiredEvidence: buildRequiredChainEvidence(missingStages),
    chainTrust:
      auditStage && auditStage.count > 0 && executiveStage && executiveStage.count > 0
        ? 'EXECUTIVE AND AUDIT LINK VISIBLE'
        : 'EXECUTIVE-AUDIT LINK NEEDS STRENGTHENING',
    stages,
  }
}

function buildChainReconstructionMeaning(posture: ChainReconstructionPosture) {
  if (posture === 'EXECUTIVE CHAIN RECONSTRUCTABLE') {
    return 'Audit can reconstruct the full governed continuity chain from recovery through executive synthesis and audit preservation.'
  }

  if (posture === 'CHAIN RECONSTRUCTION ACTIVE') {
    return 'Audit can reconstruct major lifecycle movement, but at least one chain layer still needs stronger evidence.'
  }

  if (posture === 'PARTIAL CHAIN RECONSTRUCTION') {
    return 'Some lifecycle movement is visible, but the governed chain is not yet fully reconstructable.'
  }

  return 'Audit cannot yet reconstruct the governed continuity chain from the current evidence set.'
}

function buildNextAuditAction(
  posture: ChainReconstructionPosture,
  weakestLink: string,
) {
  if (posture === 'EXECUTIVE CHAIN RECONSTRUCTABLE') {
    return 'Preserve current reconstruction depth and continue monitoring for recurring evidence gaps.'
  }

  if (posture === 'CHAIN RECONSTRUCTION ACTIVE') {
    return `Strengthen missing or weak chain evidence: ${weakestLink}.`
  }

  if (posture === 'PARTIAL CHAIN RECONSTRUCTION') {
    return `Do not treat continuity proof as complete. Preserve additional lifecycle evidence for: ${weakestLink}.`
  }

  return 'Begin preserving chain evidence from recovery, command, coordination, cross-site review, executive synthesis, and audit reconstruction.'
}

function buildRequiredChainEvidence(missingStages: ChainStage[]) {
  if (missingStages.length === 0) {
    return 'Current chain evidence is sufficient for reconstruction. Continue preserving actor, route, institution, linked snapshot, visibility, and governance reason.'
  }

  return `Required evidence should be strengthened for: ${missingStages
    .map((stage) => stage.label)
    .join(', ')}.`
}

function buildEvidenceGapDashboard(logs: AuditLog[]): EvidenceGapItem[] {
  return [
    {
      label: 'Missing Intervention Evidence',
      count: countMissingStage(logs, ['INTERVENTION', 'INTERVENTIONS']),
      meaning: 'Intervention action may be difficult to reconstruct.',
    },
    {
      label: 'Missing Outcome Evidence',
      count: countMissingStage(logs, ['OUTCOME', 'OUTCOMES']),
      meaning: 'Outcome credibility may be difficult to verify.',
    },
    {
      label: 'Missing Recovery Verification',
      count: countMissingStage(logs, ['RECOVERY', 'DURABILITY']),
      meaning: 'Recovery durability may not yet be auditable.',
    },
    {
      label: 'Missing Coordination Evidence',
      count: countMissingStage(logs, ['COORDINATION', 'SYNCHRONIZATION']),
      meaning: 'Ownership or routing synchronization may be difficult to reconstruct.',
    },
    {
      label: 'Missing Cross-Site Evidence',
      count: countMissingStage(logs, ['CROSS-SITE', 'ENTERPRISE PATTERN']),
      meaning: 'Distributed continuity exposure may not yet be reconstructable.',
    },
    {
      label: 'Missing Accountability Trail',
      count: logs.filter((log) => getActor(log) === 'Actor not recorded').length,
      meaning: 'Some records do not preserve actor context.',
    },
    {
      label: 'Missing Executive Review',
      count: countMissingStage(logs, ['EXECUTIVE', 'COMMAND']),
      meaning: 'Executive or command review may not yet be traceable.',
    },
    {
      label: 'Missing Audit Reconstruction',
      count: countMissingStage(logs, ['AUDIT', 'RECONSTRUCTION']),
      meaning: 'Final reconstruction evidence may not yet be preserved.',
    },
  ]
}

function buildAuditMemory(logs: AuditLog[]): AuditMemoryItem[] {
  return [
    {
      label: 'Recurring Evidence Gaps',
      count: logs.filter((log) => resolveEvidenceMaturity(log) === 'LEGACY EVIDENCE')
        .length,
      meaning: 'Legacy evidence may recur without full reconstruction depth.',
    },
    {
      label: 'Recurring Scope Gaps',
      count: logs.filter((log) => !hasInstitutionScope(log)).length,
      meaning: 'Institution scope may repeatedly be absent from records.',
    },
    {
      label: 'Recurring Visibility Gaps',
      count: logs.filter((log) => !hasVisibilityClassification(log)).length,
      meaning: 'Visibility classification may repeatedly be missing.',
    },
    {
      label: 'Recurring Snapshot Gaps',
      count: logs.filter((log) => !hasLinkedSnapshot(log)).length,
      meaning: 'Linked lifecycle records may repeatedly be missing.',
    },
  ]
}

function countMissingStage(logs: AuditLog[], terms: string[]) {
  if (logs.length === 0) return 0

  const found = logs.some((log) => {
    const text = fullEvidenceText(log)
    const route = safeText(log.route, '').toUpperCase()
    return terms.some((term) => text.includes(term) || route.includes(term))
  })

  return found ? 0 : 1
}

function buildTrustScore(input: {
  total: number
  immutableRecords: number
  institutionScoped: number
  visibilityClassified: number
  linkedSnapshots: number
  executiveReconstructable: number
  high: number
  critical: number
}) {
  if (input.total === 0) return 0

  const base =
    (input.immutableRecords / input.total) * 20 +
    (input.institutionScoped / input.total) * 20 +
    (input.visibilityClassified / input.total) * 15 +
    (input.linkedSnapshots / input.total) * 15 +
    (input.executiveReconstructable / input.total) * 30

  const severityPenalty = input.critical * 12 + input.high * 5

  return Math.max(0, Math.min(100, Math.round(base - severityPenalty)))
}

function buildTrustMeaning(score: number, total: number) {
  if (total === 0) {
    return 'Trust score is awaiting preserved audit evidence.'
  }

  if (score >= 80) {
    return 'Audit evidence is strong enough to support executive reconstruction.'
  }

  if (score >= 55) {
    return 'Audit evidence is usable, but reconstruction depth should continue improving.'
  }

  if (score >= 30) {
    return 'Audit evidence is limited. Leadership should treat reconstruction as partial.'
  }

  return 'Audit evidence is weak. Continuity credibility should not rely on this record set alone.'
}

function buildAuditEscalation(input: {
  total: number
  high: number
  critical: number
  executiveTrustScore: number
  executiveReconstructable: number
}): AuditEscalation {
  if (input.total === 0) return 'NO ESCALATION'
  if (input.critical > 0) return 'EXECUTIVE REVIEW'
  if (input.high > 2) return 'GOVERNANCE ESCALATION'
  if (input.executiveTrustScore < 35 || input.executiveReconstructable === 0) {
    return 'COMMAND WATCH'
  }

  return 'NO ESCALATION'
}

function buildEscalationReason(escalation: AuditEscalation) {
  if (escalation === 'EXECUTIVE REVIEW') {
    return 'Critical evidence is visible and should remain under executive review.'
  }

  if (escalation === 'GOVERNANCE ESCALATION') {
    return 'High-risk evidence concentration suggests governance escalation.'
  }

  if (escalation === 'COMMAND WATCH') {
    return 'Evidence is too weak or incomplete to support full reconstruction confidence.'
  }

  return 'No audit-driven escalation is currently required.'
}

function buildInstitutionalCredibility(input: {
  total: number
  executiveTrustScore: number
  high: number
  critical: number
  evidencePosture: EvidencePosture
}): CredibilityReading {
  if (input.total === 0) return 'CREDIBILITY NOT ESTABLISHED'
  if (input.critical > 0) return 'CREDIBILITY COMPROMISED'
  if (input.executiveTrustScore >= 80) return 'CREDIBILITY STRONG'
  if (input.executiveTrustScore >= 55) return 'CREDIBILITY STRENGTHENING'
  return 'CREDIBILITY WATCH'
}

function buildCredibilityMeaning(reading: CredibilityReading) {
  if (reading === 'CREDIBILITY NOT ESTABLISHED') {
    return 'Institutional credibility cannot be assessed until audit evidence exists.'
  }

  if (reading === 'CREDIBILITY COMPROMISED') {
    return 'Critical evidence exists. Leadership should preserve visibility until reconstruction is complete.'
  }

  if (reading === 'CREDIBILITY STRONG') {
    return 'Audit evidence is strong enough to support institutional continuity confidence.'
  }

  if (reading === 'CREDIBILITY STRENGTHENING') {
    return 'Audit evidence is improving and can support cautious executive confidence.'
  }

  return 'Audit evidence remains incomplete. Leadership should keep credibility under watch.'
}

function safeText(value: unknown, fallback = 'Not recorded') {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

function formatDate(value?: string | null) {
  if (!value) return 'Not recorded'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function normalizeSeverity(value?: string | null) {
  return safeText(value, 'INFO').toUpperCase()
}

function detailValue(log: AuditLog, key: string) {
  return log.details?.[key]
}

function fullEvidenceText(log: AuditLog) {
  return `${log.route || ''} ${log.action_type || ''} ${log.record_type || ''} ${
    log.summary || ''
  } ${JSON.stringify(log.details || {})}`.toUpperCase()
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
    'Actor not recorded',
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
    '',
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
    'Institution not recorded',
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
    'Standard governance visibility',
  )
}

function getLinkedSnapshot(log: AuditLog) {
  return safeText(
    log.record_id ||
      detailValue(log, 'snapshot_id') ||
      detailValue(log, 'metric_id') ||
      detailValue(log, 'cgi_operational_metric_id') ||
      detailValue(log, 'linked_snapshot_id'),
    'No linked snapshot recorded',
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
    'Governance reason not recorded',
  )
}

function getRecordType(log: AuditLog) {
  return safeText(
    log.record_type ||
      detailValue(log, 'evidence_type') ||
      detailValue(log, 'record_type'),
    'Governance evidence',
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
    (hasActor &&
      hasInstitution &&
      hasVisibility &&
      hasLinkedRecord &&
      hasReason &&
      hasImmutability)
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
    return 'Governance evidence is present, but maturity, visibility, institution scope, or elevated activity should remain under review.'
  }

  return 'Governance evidence is preserved, traceable, and currently sufficient for continuity reconstruction.'
}

function buildReconstructionConfidence(input: {
  total: number
  immutableRecords: number
  institutionScoped: number
  visibilityClassified: number
  linkedSnapshots: number
  executiveReconstructable: number
}) {
  if (input.total === 0) return 'AWAITING EVIDENCE'

  const coverage =
    input.immutableRecords +
    input.institutionScoped +
    input.visibilityClassified +
    input.linkedSnapshots +
    input.executiveReconstructable

  if (coverage >= input.total * 4) return 'STRONG'
  if (coverage >= input.total * 2) return 'MODERATE'
  return 'LIMITED'
}

function buildEvidenceGap(input: {
  total: number
  institutionScoped: number
  visibilityClassified: number
  linkedSnapshots: number
  executiveReconstructable: number
}) {
  if (input.total === 0) {
    return 'No audit records are currently visible. Evidence integrity will activate when lifecycle actions begin creating preserved records.'
  }

  const gaps: string[] = []

  if (input.institutionScoped < input.total) gaps.push('institution scope')
  if (input.visibilityClassified < input.total) {
    gaps.push('visibility classification')
  }
  if (input.linkedSnapshots < input.total) {
    gaps.push('linked lifecycle snapshots')
  }
  if (input.executiveReconstructable === 0) {
    gaps.push('executive reconstruction depth')
  }

  if (gaps.length === 0) {
    return 'No major reconstruction gap is visible in the current filtered evidence set.'
  }

  return `The current evidence set should strengthen: ${gaps.join(', ')}.`
}

function buildMemoryMeaning(total: number) {
  if (total === 0) {
    return 'Audit memory is awaiting preserved evidence. Once lifecycle records exist, audit will protect reconstruction, accountability, and continuity credibility.'
  }

  return 'Audit memory must preserve actor context, route context, institution scope, evidence reason, linked lifecycle records, and timestamp integrity without converting governance into blame.'
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{title}</p>
      <p style={styles.metricValue}>{value}</p>
    </article>
  )
}

function ChainStageCard({ stage }: { stage: ChainStage }) {
  return (
    <article
      style={{
        ...styles.chainStageCard,
        ...(stage.status === 'MISSING' ? styles.chainStageMissing : {}),
      }}
    >
      <p style={styles.metricLabel}>{stage.label}</p>
      <p style={styles.chainStageValue}>{stage.count}</p>
      <strong style={styles.provenanceStatus}>{stage.status}</strong>
      <p style={styles.panelBody}>{stage.meaning}</p>
    </article>
  )
}

function ProvenanceCard({ stage }: { stage: ProvenanceStage }) {
  return (
    <article style={styles.provenanceCard}>
      <p style={styles.metricLabel}>{stage.label}</p>
      <p style={styles.provenanceValue}>{stage.count}</p>
      <strong style={styles.provenanceStatus}>{stage.status}</strong>
      <p style={styles.panelBody}>{stage.meaning}</p>
    </article>
  )
}

function EvidenceGapCard({ gap }: { gap: EvidenceGapItem }) {
  return (
    <article style={styles.gapCard}>
      <p style={styles.metricLabel}>{gap.label}</p>
      <p style={styles.gapValue}>{gap.count}</p>
      <p style={styles.panelBody}>{gap.meaning}</p>
    </article>
  )
}

function AuditMemoryCard({ item }: { item: AuditMemoryItem }) {
  return (
    <article style={styles.gapCard}>
      <p style={styles.metricLabel}>{item.label}</p>
      <p style={styles.gapValue}>{item.count}</p>
      <p style={styles.panelBody}>{item.meaning}</p>
    </article>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={styles.panel}>
      <p style={styles.panelKicker}>{title}</p>
      <div style={styles.panelBody}>{children}</div>
    </section>
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

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  )
}

function MeaningCard({ title, text }: { title: string; text: string }) {
  return (
    <article style={styles.meaningCard}>
      <h3 style={styles.meaningTitle}>{title}</h3>
      <p style={styles.meaningText}>{text}</p>
    </article>
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
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '16px 28px 72px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '28px',
  },
  kicker: {
    color: gold,
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '2px',
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
    maxWidth: '820px',
    lineHeight: 1.65,
    fontSize: '14px',
    margin: 0,
  },
  doctrinePanel: {
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '20px',
    padding: '22px',
    marginTop: '22px',
  },
  doctrineTitle: {
    color: gold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.15em',
    margin: '0 0 14px',
  },
  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
  },
  doctrineCard: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '14px',
    color: '#fff8e7',
    fontSize: '12px',
    lineHeight: 1.45,
    fontWeight: 800,
  },
  errorBox: {
    background: 'rgba(127, 29, 29, 0.52)',
    border: '1px solid rgba(248, 113, 113, 0.45)',
    color: '#fecaca',
    padding: '13px 16px',
    borderRadius: '14px',
    fontWeight: 800,
    marginBottom: '24px',
    fontSize: '13px',
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.65fr)',
    gap: '24px',
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
  },
  chainHero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(280px, 0.65fr)',
    gap: '24px',
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
  },
  chainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  chainStageCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '14px',
    minHeight: '150px',
  },
  chainStageMissing: {
    border: '1px solid rgba(248,113,113,0.45)',
    background: 'rgba(127,29,29,0.18)',
  },
  chainStageValue: {
    color: gold,
    fontSize: '30px',
    fontWeight: 950,
    margin: '10px 0 4px',
    lineHeight: 1,
  },
  sectionKicker: {
    color: mutedGold,
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '10px',
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
    fontSize: '14px',
  },
  questionBox: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px',
  },
  questionText: {
    color: '#fff8e7',
    fontSize: '21px',
    lineHeight: 1.25,
    margin: '10px 0 0',
    fontWeight: 900,
  },
  reconstructionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: '24px',
    alignItems: 'center',
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
  },
  primaryButton: {
    border: 'none',
    borderRadius: '14px',
    background: gold,
    color: '#11100d',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 950,
    minHeight: '52px',
    padding: '0 22px',
    whiteSpace: 'nowrap',
  },
  disabledButton: {
    cursor: 'not-allowed',
    opacity: 0.65,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  metricCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
    minHeight: '116px',
  },
  metricLabel: {
    color: mutedGold,
    fontSize: '9px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  metricValue: {
    color: gold,
    fontSize: '32px',
    fontWeight: 950,
    lineHeight: 1,
    margin: '12px 0 0',
  },
  scoreBlock: {
    textAlign: 'center',
    padding: '10px',
  },
  scoreNumber: {
    color: gold,
    fontSize: '64px',
    fontWeight: 950,
    lineHeight: 1,
    margin: 0,
  },
  scoreLabel: {
    color: mutedGold,
    fontWeight: 900,
    margin: '6px 0 14px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    fontSize: '11px',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  panel: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px',
    minHeight: '180px',
  },
  panelKicker: {
    color: mutedGold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
  },
  panelBody: {
    color: '#cfc7b5',
    fontSize: '13px',
    lineHeight: 1.6,
    marginTop: '10px',
  },
  panelText: {
    color: '#cfc7b5',
    lineHeight: 1.65,
    margin: 0,
  },
  infoList: {
    display: 'grid',
    gap: '10px',
    marginTop: '14px',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '150px minmax(0, 1fr)',
    gap: '12px',
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '12px',
    alignItems: 'start',
  },
  infoLabel: {
    color: mutedGold,
    fontWeight: 900,
    fontSize: '11px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: '#fff8e7',
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  provenanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
  },
  provenanceCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '14px',
    minHeight: '150px',
  },
  provenanceValue: {
    color: gold,
    fontSize: '34px',
    fontWeight: 950,
    margin: '10px 0 4px',
    lineHeight: 1,
  },
  provenanceStatus: {
    display: 'block',
    color: '#fff8e7',
    fontSize: '12px',
    marginBottom: '8px',
  },
  gapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
  },
  gapCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '14px',
    minHeight: '140px',
  },
  gapValue: {
    color: gold,
    fontSize: '34px',
    fontWeight: 950,
    margin: '10px 0',
    lineHeight: 1,
  },
  whyCard: {
    background: 'linear-gradient(135deg, rgba(214,178,94,0.10), #030303)',
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
  },
  filterCard: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
  },
  filterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '18px',
  },
  select: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '12px',
    color: '#fff8e7',
    padding: '12px',
    fontSize: '13px',
    fontWeight: 800,
    minWidth: 0,
  },
  searchInput: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '12px',
    color: '#fff8e7',
    padding: '12px',
    fontSize: '13px',
    fontWeight: 800,
    minWidth: 0,
  },
  card: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
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
    fontSize: '13px',
    margin: 0,
  },
  stack: {
    display: 'grid',
    gap: '14px',
    marginTop: '18px',
  },
  reviewCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  severityBadge: {
    background: 'rgba(127, 29, 29, 0.55)',
    border: '1px solid rgba(248, 113, 113, 0.35)',
    borderRadius: '999px',
    color: '#fecaca',
    padding: '6px 10px',
    fontSize: '10px',
    fontWeight: 950,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  actionBadge: {
    background: 'rgba(214,178,94,0.10)',
    border: `1px solid ${softLine}`,
    borderRadius: '999px',
    color: '#fff8e7',
    padding: '6px 10px',
    fontSize: '10px',
    fontWeight: 900,
  },
  integrityBadge: {
    background: 'rgba(16, 185, 129, 0.10)',
    border: '1px solid rgba(16, 185, 129, 0.28)',
    borderRadius: '999px',
    color: '#bbf7d0',
    padding: '6px 10px',
    fontSize: '10px',
    fontWeight: 900,
  },
  maturityBadge: {
    background: 'rgba(214,178,94,0.12)',
    border: `1px solid ${softLine}`,
    borderRadius: '999px',
    color: gold,
    padding: '6px 10px',
    fontSize: '10px',
    fontWeight: 950,
  },
  dateText: {
    color: '#8c826d',
    fontSize: '12px',
    fontWeight: 800,
    margin: 0,
  },
  reviewTitle: {
    color: '#fff8e7',
    fontSize: '18px',
    margin: '12px 0 8px',
    lineHeight: 1.25,
  },
  reviewText: {
    color: '#cfc7b5',
    fontSize: '12px',
    lineHeight: 1.5,
    margin: '4px 0',
  },
  maturityPill: {
    marginTop: '12px',
    display: 'inline-block',
    background: 'rgba(214,178,94,0.12)',
    border: `1px solid ${softLine}`,
    borderRadius: '999px',
    color: gold,
    padding: '8px 12px',
    fontSize: '10px',
    fontWeight: 950,
  },
  meaningCard: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '16px',
  },
  meaningTitle: {
    color: '#fff8e7',
    fontSize: '17px',
    margin: 0,
  },
  meaningText: {
    color: '#cfc7b5',
    fontSize: '13px',
    lineHeight: 1.6,
    margin: '8px 0 0',
  },
  ledgerList: {
    display: 'grid',
    gap: '16px',
    marginTop: '18px',
  },
  ledgerItem: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '18px',
    padding: '20px',
  },
  ledgerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  maturityMeaning: {
    color: '#cfc7b5',
    fontSize: '12px',
    lineHeight: 1.6,
    margin: '14px 0 0',
  },
  evidenceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  evidenceLine: {
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '14px',
    padding: '12px',
  },
  evidenceLabel: {
    color: mutedGold,
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  evidenceValue: {
    color: '#fff8e7',
    fontSize: '13px',
    lineHeight: 1.45,
    margin: '8px 0 0',
    overflowWrap: 'anywhere',
  },
  detailsBox: {
    marginTop: '16px',
    background: '#050505',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
    padding: '14px',
  },
  detailsSummary: {
    cursor: 'pointer',
    color: '#fff8e7',
    fontSize: '13px',
    fontWeight: 900,
  },
  preBlock: {
    color: '#cfc7b5',
    fontSize: '11px',
    lineHeight: 1.5,
    margin: '12px 0 0',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
  },
  emptyPanel: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '130px',
    textAlign: 'center',
    padding: '12px',
    background: '#15110a',
    border: `1px solid ${softLine}`,
    borderRadius: '16px',
  },
  emptyTitle: {
    color: '#fff8e7',
    fontSize: '18px',
    fontWeight: 900,
    margin: '0 0 8px',
  },
  emptyText: {
    color: '#cfc7b5',
    lineHeight: 1.6,
    margin: 0,
    fontWeight: 700,
  },
  principleCard: {
    display: 'grid',
    gridTemplateColumns: '90px minmax(0, 1fr)',
    gap: '24px',
    alignItems: 'center',
    background: panelBlack,
    border: `1px solid ${softLine}`,
    borderRadius: '22px',
    padding: '24px',
  },
  principleIcon: {
    width: '76px',
    height: '76px',
    borderRadius: '999px',
    border: `1px solid ${softLine}`,
    display: 'grid',
    placeItems: 'center',
    color: gold,
    fontSize: '34px',
    fontWeight: 900,
  },
  principleText: {
    color: '#cfc7b5',
    lineHeight: 1.65,
    margin: '10px 0 0',
    fontSize: '14px',
  },
}