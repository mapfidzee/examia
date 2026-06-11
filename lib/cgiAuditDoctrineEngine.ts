export type AuditDetails = Record<string, unknown>

export type AuditLogForDoctrine = {
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

export type EvidenceMaturity =
  | 'LEGACY EVIDENCE'
  | 'HARDENED GOVERNANCE EVIDENCE'
  | 'EXECUTIVE RECONSTRUCTABLE'

export type ProvenanceStage = {
  label: string
  count: number
  status: string
  meaning: string
}

export type EvidenceGapItem = {
  label: string
  count: number
  meaning: string
}

export type AuditMemoryItem = {
  label: string
  count: number
  meaning: string
}

export type ChainStage = {
  label: string
  count: number
  status: string
  meaning: string
}

export type ChainReconstruction = {
  activeStages: number
  missingStages: number
  auditLinkVisible: boolean
  executiveLinkVisible: boolean
  memoryBoardLinkVisible: boolean
  weakestLink: string
  chainTrust: string
  stages: ChainStage[]
}

export type AuditDoctrineReading = {
  reconstructionPosture: string
  auditCredibility: string
  trustReading: string
  trustLevel: string
  trustMeaning: string
  institutionalMeaning: string
  whatIsVisible: string
  whyItMatters: string
  continuityRisk: string
  requiredMovement: string
  evidenceGap: string
  auditEscalation: string
  executiveDecision: string
}

export type EvidenceSummary = {
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
  executiveTrustScore: number
  doctrine: AuditDoctrineReading
}

export const severityOrder: Record<string, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MODERATE: 2,
  LOW: 1,
  INFO: 0,
}

export const maturityOrder: Record<EvidenceMaturity, number> = {
  'EXECUTIVE RECONSTRUCTABLE': 3,
  'HARDENED GOVERNANCE EVIDENCE': 2,
  'LEGACY EVIDENCE': 1,
}

export const PROVENANCE_STAGES = [
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
    label: 'Situation Room',
    terms: ['SITUATION ROOM', '/SITUATION-ROOM', 'TRAJECTORY'],
  },
  {
    label: 'Executive Center',
    terms: ['EXECUTIVE CENTER', '/EXECUTIVE-CENTER', 'EXECUTIVE'],
  },
  {
    label: 'Executive Report',
    terms: ['EXECUTIVE REPORT', '/EXECUTIVE-REPORT', 'BOARD REPORT'],
  },
  {
    label: 'Memory Board',
    terms: ['MEMORY BOARD', '/CGI-MEMORY-BOARD', 'INSTITUTIONAL MEMORY'],
  },
  { label: 'Audit', terms: ['AUDIT', '/AUDIT', 'RECONSTRUCTION'] },
]

export function buildAuditDoctrine(input: {
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
  activeChainStages: number
  missingChainStages: number
  auditLinkVisible: boolean
  executiveLinkVisible: boolean
  memoryBoardLinkVisible: boolean
}): AuditDoctrineReading {
  if (input.total === 0) {
    return {
      reconstructionPosture: 'NO LIVE AUDIT EVIDENCE',
      auditCredibility: 'AUDIT CREDIBILITY NOT YET ESTABLISHED',
      trustReading: 'NOT YET TRUSTED',
      trustLevel: 'LOW',
      trustMeaning:
        'No live audit records are currently available for continuity reconstruction.',
      institutionalMeaning:
        'The institution cannot yet defend continuity credibility from the live ledger because no evidence records are visible.',
      whatIsVisible:
        'No live governance evidence is currently visible in the audit ledger.',
      whyItMatters:
        'Without audit evidence, leadership cannot reconstruct what happened, what was decided, or why continuity confidence was restored.',
      continuityRisk:
        'Continuity credibility may depend on memory or assertion rather than reconstructable evidence.',
      requiredMovement:
        'Generate or preserve audit evidence across request, triage, lifecycle movement, executive report, memory, and audit.',
      evidenceGap:
        'No live audit records are currently available. Evidence generation or audit instrumentation must be strengthened.',
      auditEscalation: 'AUDIT WATCH',
      executiveDecision:
        'Do not rely on the audit page as proof until evidence records are available.',
    }
  }

  const executiveRatio = input.executiveReconstructable / input.total
  const hardenedRatio =
    (input.hardenedEvidence + input.executiveReconstructable) / input.total
  const immutableRatio = input.immutableRecords / input.total
  const chainCoverage =
    input.activeChainStages / Math.max(1, input.activeChainStages + input.missingChainStages)

  let reconstructionPosture = 'RECONSTRUCTION FRAGILE'
  let auditCredibility = 'AUDIT CREDIBILITY LIMITED'
  let trustReading = 'NOT YET TRUSTED'
  let trustLevel = 'LOW'
  let auditEscalation = 'AUDIT WATCH'

  if (
    executiveRatio >= 0.6 &&
    immutableRatio >= 0.7 &&
    chainCoverage >= 0.7 &&
    input.auditLinkVisible &&
    input.executiveLinkVisible
  ) {
    reconstructionPosture = 'EXECUTIVE RECONSTRUCTABLE'
    auditCredibility = 'AUDIT CREDIBILITY STRONG'
    trustReading = 'RECONSTRUCTABLE'
    trustLevel = 'HIGH'
    auditEscalation = 'ROUTINE AUDIT PRESERVATION'
  } else if (
    hardenedRatio >= 0.45 &&
    immutableRatio >= 0.5 &&
    chainCoverage >= 0.45
  ) {
    reconstructionPosture = 'PARTIALLY RECONSTRUCTABLE'
    auditCredibility = 'AUDIT CREDIBILITY DEVELOPING'
    trustReading = 'CONDITIONALLY RECONSTRUCTABLE'
    trustLevel = 'MODERATE'
    auditEscalation = 'EVIDENCE HARDENING REQUIRED'
  }

  if (input.critical > 0 || input.high > 2) {
    auditEscalation = 'EXECUTIVE REVIEW'
  } else if (input.high > 0 || input.missingChainStages > 4) {
    auditEscalation = 'COMMAND WATCH'
  }

  const evidenceGap = deriveEvidenceGap(input)

  return {
    reconstructionPosture,
    auditCredibility,
    trustReading,
    trustLevel,
    trustMeaning: deriveTrustMeaning({
      reconstructionPosture,
      executiveRatio,
      hardenedRatio,
      immutableRatio,
      chainCoverage,
    }),
    institutionalMeaning: deriveInstitutionalMeaning({
      reconstructionPosture,
      auditEscalation,
      missingChainStages: input.missingChainStages,
      executiveLinkVisible: input.executiveLinkVisible,
      memoryBoardLinkVisible: input.memoryBoardLinkVisible,
    }),
    whatIsVisible: `${input.total} audit record(s), ${input.executiveReconstructable} executive reconstructable record(s), ${input.hardenedEvidence} hardened governance record(s), and ${input.legacyEvidence} legacy evidence record(s) are visible.`,
    whyItMatters:
      'Audit evidence determines whether leadership can reconstruct the continuity chain without relying on memory, assumption, or dashboard appearance.',
    continuityRisk:
      input.missingChainStages > 0
        ? `Continuity credibility is weakened because ${input.missingChainStages} chain stage(s) are not yet reconstructable.`
        : 'Continuity credibility is strengthened because the chain has visible evidence across all monitored stages.',
    requiredMovement:
      auditEscalation === 'ROUTINE AUDIT PRESERVATION'
        ? 'Maintain audit preservation and transfer institutional lessons into memory governance.'
        : 'Strengthen missing evidence, preserve linked snapshots, and ensure executive report, memory board, and audit links remain visible.',
    evidenceGap,
    auditEscalation,
    executiveDecision: deriveExecutiveDecision({
      auditEscalation,
      reconstructionPosture,
      evidenceGap,
    }),
  }
}

export function buildChainReconstruction(
  logs: AuditLogForDoctrine[],
): ChainReconstruction {
  const stages: ChainStage[] = PROVENANCE_STAGES.map((stage) => {
    const count = logs.filter((log) => {
      const text = fullEvidenceText(log)
      const route = safeText(log.route, '').toUpperCase()

      return stage.terms.some(
        (term) => text.includes(term) || route.includes(term),
      )
    }).length

    return {
      label: stage.label,
      count,
      status:
        count === 0 ? 'MISSING' : count >= 3 ? 'RECONSTRUCTABLE' : 'VISIBLE',
      meaning:
        count === 0
          ? `${stage.label} is not yet reconstructable from the current audit evidence.`
          : `${stage.label} has preserved evidence for continuity reconstruction.`,
    }
  })

  const activeStages = stages.filter((stage) => stage.count > 0).length
  const missingStages = stages.filter((stage) => stage.count === 0)
  const auditStage = stages.find((stage) => stage.label === 'Audit')
  const executiveCenterStage = stages.find(
    (stage) => stage.label === 'Executive Center',
  )
  const executiveReportStage = stages.find(
    (stage) => stage.label === 'Executive Report',
  )
  const memoryBoardStage = stages.find((stage) => stage.label === 'Memory Board')

  return {
    activeStages,
    missingStages: missingStages.length,
    auditLinkVisible: Boolean(auditStage && auditStage.count > 0),
    executiveLinkVisible: Boolean(
      (executiveCenterStage && executiveCenterStage.count > 0) ||
        (executiveReportStage && executiveReportStage.count > 0),
    ),
    memoryBoardLinkVisible: Boolean(
      memoryBoardStage && memoryBoardStage.count > 0,
    ),
    weakestLink:
      missingStages.length === 0
        ? 'No major chain gap is visible.'
        : missingStages.map((stage) => stage.label).join(', '),
    chainTrust:
      auditStage && auditStage.count > 0
        ? 'AUDIT LINK VISIBLE'
        : 'AUDIT LINK NEEDS STRENGTHENING',
    stages,
  }
}

export function buildEvidenceSummary(
  logs: AuditLogForDoctrine[],
  chain: ChainReconstruction,
): EvidenceSummary {
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

  const doctrine = buildAuditDoctrine({
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
    activeChainStages: chain.activeStages,
    missingChainStages: chain.missingStages,
    auditLinkVisible: chain.auditLinkVisible,
    executiveLinkVisible: chain.executiveLinkVisible,
    memoryBoardLinkVisible: chain.memoryBoardLinkVisible,
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
    executiveTrustScore,
    doctrine,
  }
}

export function buildEvidenceProvenance(
  logs: AuditLogForDoctrine[],
): ProvenanceStage[] {
  return PROVENANCE_STAGES.map((stage) => {
    const count = logs.filter((log) => {
      const text = fullEvidenceText(log)
      const route = safeText(log.route, '').toUpperCase()

      return stage.terms.some(
        (term) => text.includes(term) || route.includes(term),
      )
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

export function buildEvidenceGapDashboard(
  logs: AuditLogForDoctrine[],
): EvidenceGapItem[] {
  return [
    {
      label: 'Missing Request Evidence',
      count: countMissingStage(logs, ['REQUEST']),
      meaning: 'Entry visibility may be difficult to reconstruct.',
    },
    {
      label: 'Missing Triage Evidence',
      count: countMissingStage(logs, ['TRIAGE']),
      meaning: 'Eligibility decision may be difficult to reconstruct.',
    },
    {
      label: 'Missing Routing Evidence',
      count: countMissingStage(logs, ['ROUTING']),
      meaning: 'Ownership direction may be difficult to reconstruct.',
    },
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
      label: 'Missing Executive Report',
      count: countMissingStage(logs, ['EXECUTIVE REPORT', '/EXECUTIVE-REPORT']),
      meaning: 'Board-ready executive interpretation may not yet be auditable.',
    },
    {
      label: 'Missing Memory Board',
      count: countMissingStage(logs, ['MEMORY BOARD', 'INSTITUTIONAL MEMORY']),
      meaning: 'Institutional lesson preservation may not yet be auditable.',
    },
  ]
}

export function buildAuditMemory(
  logs: AuditLogForDoctrine[],
): AuditMemoryItem[] {
  return [
    {
      label: 'Recurring Evidence Gaps',
      count: logs.filter(
        (log) => resolveEvidenceMaturity(log) === 'LEGACY EVIDENCE',
      ).length,
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

export function buildTrustScore(input: {
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

export function resolveEvidenceMaturity(
  log: AuditLogForDoctrine,
): EvidenceMaturity {
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

export function getMaturityMeaning(maturity: EvidenceMaturity) {
  if (maturity === 'EXECUTIVE RECONSTRUCTABLE') {
    return 'This record preserves enough evidence for leadership to reconstruct who acted, what changed, why it mattered, where it applied, and what continuity posture was preserved.'
  }

  if (maturity === 'HARDENED GOVERNANCE EVIDENCE') {
    return 'This record preserves strengthened governance meaning, but may not yet contain every enterprise-grade reconstruction field.'
  }

  return 'This is historical evidence created before the current CGI hardening standard. It remains valid, but its reconstruction depth is limited.'
}

export function countMissingStage(logs: AuditLogForDoctrine[], terms: string[]) {
  if (logs.length === 0) return 0

  const found = logs.some((log) => {
    const text = fullEvidenceText(log)
    const route = safeText(log.route, '').toUpperCase()

    return terms.some((term) => text.includes(term) || route.includes(term))
  })

  return found ? 0 : 1
}

export function safeText(value: unknown, fallback = 'Not recorded') {
  if (value === null || value === undefined || value === '') return fallback
  return String(value)
}

export function normalizeSeverity(value?: string | null) {
  return safeText(value, 'INFO').toUpperCase()
}

export function detailValue(log: AuditLogForDoctrine, key: string) {
  return log.details?.[key]
}

export function fullEvidenceText(log: AuditLogForDoctrine) {
  return `${log.route || ''} ${log.action_type || ''} ${log.record_type || ''} ${
    log.summary || ''
  } ${JSON.stringify(log.details || {})}`.toUpperCase()
}

export function getActor(log: AuditLogForDoctrine) {
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

export function getActorKey(log: AuditLogForDoctrine) {
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

export function getInstitution(log: AuditLogForDoctrine) {
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

export function getVisibilityLevel(log: AuditLogForDoctrine) {
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

export function getLinkedSnapshot(log: AuditLogForDoctrine) {
  return safeText(
    log.record_id ||
      detailValue(log, 'snapshot_id') ||
      detailValue(log, 'metric_id') ||
      detailValue(log, 'cgi_operational_metric_id') ||
      detailValue(log, 'linked_snapshot_id'),
    'No linked snapshot recorded',
  )
}

export function getEvidenceReason(log: AuditLogForDoctrine) {
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

export function getRecordType(log: AuditLogForDoctrine) {
  return safeText(
    log.record_type ||
      detailValue(log, 'evidence_type') ||
      detailValue(log, 'record_type'),
    'Governance evidence',
  )
}

export function hasInstitutionScope(log: AuditLogForDoctrine) {
  return getInstitution(log) !== 'Institution not recorded'
}

export function hasVisibilityClassification(log: AuditLogForDoctrine) {
  return getVisibilityLevel(log) !== 'Standard governance visibility'
}

export function hasLinkedSnapshot(log: AuditLogForDoctrine) {
  return getLinkedSnapshot(log) !== 'No linked snapshot recorded'
}

export function isImmutableRecord(log: AuditLogForDoctrine) {
  return Boolean(log.id && log.created_at)
}

function deriveEvidenceGap(input: {
  total: number
  missingChainStages: number
  auditLinkVisible: boolean
  executiveLinkVisible: boolean
  memoryBoardLinkVisible: boolean
  institutionScoped: number
  visibilityClassified: number
  linkedSnapshots: number
}) {
  if (input.total === 0) {
    return 'No live audit evidence exists yet.'
  }

  const gaps: string[] = []

  if (input.missingChainStages > 0) {
    gaps.push(`${input.missingChainStages} continuity chain stage(s) missing`)
  }

  if (!input.auditLinkVisible) gaps.push('audit link missing')
  if (!input.executiveLinkVisible) gaps.push('executive link missing')
  if (!input.memoryBoardLinkVisible) gaps.push('memory board link missing')
  if (input.institutionScoped === 0) gaps.push('institution scope missing')
  if (input.visibilityClassified === 0) gaps.push('visibility classification missing')
  if (input.linkedSnapshots === 0) gaps.push('linked snapshot missing')

  if (gaps.length === 0) {
    return 'No major audit evidence gap is currently visible.'
  }

  return `Audit evidence needs strengthening: ${gaps.join(', ')}.`
}

function deriveTrustMeaning(input: {
  reconstructionPosture: string
  executiveRatio: number
  hardenedRatio: number
  immutableRatio: number
  chainCoverage: number
}) {
  if (input.reconstructionPosture === 'EXECUTIVE RECONSTRUCTABLE') {
    return 'The audit ledger contains enough mature evidence for leadership to reconstruct the continuity chain with strong confidence.'
  }

  if (input.reconstructionPosture === 'PARTIALLY RECONSTRUCTABLE') {
    return 'The audit ledger contains meaningful evidence, but some chain links or reconstruction fields still require hardening.'
  }

  return 'The audit ledger is visible but not yet mature enough to defend continuity credibility without additional evidence hardening.'
}

function deriveInstitutionalMeaning(input: {
  reconstructionPosture: string
  auditEscalation: string
  missingChainStages: number
  executiveLinkVisible: boolean
  memoryBoardLinkVisible: boolean
}) {
  if (input.reconstructionPosture === 'EXECUTIVE RECONSTRUCTABLE') {
    return 'The institution can defend the continuity conclusion because audit evidence, executive interpretation, and reconstruction memory are sufficiently visible.'
  }

  if (!input.executiveLinkVisible) {
    return 'The institution may struggle to defend leadership interpretation because executive evidence is not yet visible in the audit chain.'
  }

  if (!input.memoryBoardLinkVisible) {
    return 'The institution can partially reconstruct the chain, but the lesson may not survive unless memory board evidence is preserved.'
  }

  return `The institution has partial audit credibility, but ${input.missingChainStages} chain stage(s) require stronger evidence before the conclusion is fully defensible.`
}

function deriveExecutiveDecision(input: {
  auditEscalation: string
  reconstructionPosture: string
  evidenceGap: string
}) {
  if (input.auditEscalation === 'EXECUTIVE REVIEW') {
    return 'Leadership should review high-risk evidence before relying on the continuity conclusion.'
  }

  if (input.auditEscalation === 'COMMAND WATCH') {
    return 'Command should keep visibility until missing audit evidence is strengthened.'
  }

  if (input.auditEscalation === 'EVIDENCE HARDENING REQUIRED') {
    return input.evidenceGap
  }

  if (input.reconstructionPosture === 'EXECUTIVE RECONSTRUCTABLE') {
    return 'Preserve the audit trail and transfer institutional lessons into memory governance.'
  }

  return 'Strengthen audit evidence before treating the continuity chain as defensible.'
}