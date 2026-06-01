export type CGIInstitutionalMemoryPosture =
  | 'NO_MEMORY'
  | 'EMERGING_MEMORY'
  | 'ACTIVE_MEMORY'
  | 'STRUCTURAL_MEMORY'
  | 'CRITICAL_MEMORY'

export type CGIInstitutionalMemoryDomain =
  | 'RECOVERY'
  | 'RECURRENCE'
  | 'COMMAND'
  | 'COORDINATION'
  | 'CROSS_SITE'
  | 'EXECUTIVE'
  | 'AUDIT'
  | 'SURVIVABILITY'

export type CGIInstitutionalMemoryInput = {
  historicalRecords: number
  recurringInstabilityCount: number
  recoveryFailureCount: number
  verifiedRecoveryCount: number
  commandInterventionCount: number
  coordinationIssueCount: number
  crossSiteSignalCount: number
  executiveReviewCount: number
  auditReconstructionCount: number
  survivabilityThreatCount: number
  unresolvedMemoryGaps?: number
  lastKnownPattern?: string
}

export type CGIInstitutionalMemoryOutput = {
  memoryPosture: CGIInstitutionalMemoryPosture
  dominantMemoryDomain: CGIInstitutionalMemoryDomain
  memoryMeaning: string
  memoryRisk: string
  memoryRecommendation: string
  memoryPersistenceRequirement: string
  executiveQuestion: string
  continuityLearning: string
  memoryNarrative: string
  evidenceToPreserve: string
}

function hasNoMemory(input: CGIInstitutionalMemoryInput): boolean {
  return (
    input.historicalRecords === 0 &&
    input.recurringInstabilityCount === 0 &&
    input.recoveryFailureCount === 0 &&
    input.commandInterventionCount === 0 &&
    input.coordinationIssueCount === 0 &&
    input.crossSiteSignalCount === 0 &&
    input.executiveReviewCount === 0 &&
    input.auditReconstructionCount === 0 &&
    input.survivabilityThreatCount === 0
  )
}

function deriveDominantMemoryDomain(
  input: CGIInstitutionalMemoryInput
): CGIInstitutionalMemoryDomain {
  if (input.survivabilityThreatCount > 0) return 'SURVIVABILITY'
  if (input.crossSiteSignalCount > 0) return 'CROSS_SITE'
  if (input.commandInterventionCount > 0) return 'COMMAND'
  if (input.executiveReviewCount > 0) return 'EXECUTIVE'
  if (input.recurringInstabilityCount > 0) return 'RECURRENCE'
  if (input.recoveryFailureCount > 0 || input.verifiedRecoveryCount > 0) {
    return 'RECOVERY'
  }
  if (input.coordinationIssueCount > 0) return 'COORDINATION'
  if (input.auditReconstructionCount > 0) return 'AUDIT'

  return 'AUDIT'
}

function deriveMemoryPosture(
  input: CGIInstitutionalMemoryInput
): CGIInstitutionalMemoryPosture {
  if (hasNoMemory(input)) return 'NO_MEMORY'

  if (
    input.survivabilityThreatCount > 0 ||
    input.crossSiteSignalCount >= 3 ||
    input.commandInterventionCount >= 3
  ) {
    return 'CRITICAL_MEMORY'
  }

  if (
    input.recurringInstabilityCount >= 4 ||
    input.recoveryFailureCount >= 3 ||
    input.crossSiteSignalCount > 0 ||
    input.commandInterventionCount > 0
  ) {
    return 'STRUCTURAL_MEMORY'
  }

  if (
    input.recurringInstabilityCount > 0 ||
    input.recoveryFailureCount > 0 ||
    input.coordinationIssueCount > 0 ||
    input.executiveReviewCount > 0 ||
    input.auditReconstructionCount > 0
  ) {
    return 'ACTIVE_MEMORY'
  }

  return 'EMERGING_MEMORY'
}

function buildMemoryMeaning(
  posture: CGIInstitutionalMemoryPosture,
  domain: CGIInstitutionalMemoryDomain
): string {
  if (posture === 'NO_MEMORY') {
    return 'No institutional continuity memory is currently visible.'
  }

  if (posture === 'EMERGING_MEMORY') {
    return 'Continuity memory is beginning to form, but the pattern is not yet mature enough to guide major executive interpretation.'
  }

  if (posture === 'ACTIVE_MEMORY') {
    return `Continuity memory is active in the ${domain.toLowerCase()} domain and should remain visible during decision-making.`
  }

  if (posture === 'STRUCTURAL_MEMORY') {
    return `Continuity memory suggests a structural pattern in the ${domain.toLowerCase()} domain that should not be treated as isolated.`
  }

  return `Continuity memory is critical. The ${domain.toLowerCase()} domain carries enough historical weight to affect current continuity credibility.`
}

function buildMemoryRisk(
  posture: CGIInstitutionalMemoryPosture,
  domain: CGIInstitutionalMemoryDomain
): string {
  if (posture === 'NO_MEMORY') {
    return 'The main risk is false confidence if future instability appears without preserved context.'
  }

  if (posture === 'EMERGING_MEMORY') {
    return 'The main risk is that early warning signals may disappear before they mature into recognizable continuity intelligence.'
  }

  if (posture === 'ACTIVE_MEMORY') {
    return `The main risk is that ${domain.toLowerCase()} memory may be ignored and the organization may repeat the same correction cycle.`
  }

  if (posture === 'STRUCTURAL_MEMORY') {
    return `The main risk is normalization: a recurring ${domain.toLowerCase()} pattern may become accepted as ordinary operating friction.`
  }

  return `The main risk is institutional forgetting under pressure: leadership may treat a critical ${domain.toLowerCase()} pattern as a new event instead of a known continuity threat.`
}

function buildMemoryRecommendation(
  posture: CGIInstitutionalMemoryPosture,
  domain: CGIInstitutionalMemoryDomain
): string {
  if (posture === 'NO_MEMORY') {
    return 'Begin preserving continuity records before instability, recovery, or executive decisions disappear from institutional visibility.'
  }

  if (posture === 'EMERGING_MEMORY') {
    return 'Continue preserving evidence and watch whether early memory becomes recurrence, recovery failure, or cross-site exposure.'
  }

  if (posture === 'ACTIVE_MEMORY') {
    return `Use ${domain.toLowerCase()} memory during command, coordination, recovery, and executive review before declaring stability.`
  }

  if (posture === 'STRUCTURAL_MEMORY') {
    return `Require pattern review, owner accountability, and evidence preservation before treating ${domain.toLowerCase()} instability as resolved.`
  }

  return `Require executive visibility, audit preservation, and continuity protection because ${domain.toLowerCase()} memory may affect institutional survivability.`
}

function buildPersistenceRequirement(
  posture: CGIInstitutionalMemoryPosture,
  domain: CGIInstitutionalMemoryDomain
): string {
  if (posture === 'NO_MEMORY') {
    return 'Preserve baseline continuity records, timestamps, owners, and route context.'
  }

  if (posture === 'EMERGING_MEMORY') {
    return 'Preserve early signals, recovery evidence, and any repeated operational friction.'
  }

  if (posture === 'ACTIVE_MEMORY') {
    return `Preserve ${domain.toLowerCase()} evidence, recurrence indicators, owner actions, and recovery outcomes.`
  }

  if (posture === 'STRUCTURAL_MEMORY') {
    return `Preserve full ${domain.toLowerCase()} pattern evidence across time, sites, command reviews, recovery decisions, and audit reconstruction.`
  }

  return `Preserve critical ${domain.toLowerCase()} memory with executive rationale, continuity threat evidence, command ownership, cross-site visibility, and audit reconstruction.`
}

function buildExecutiveQuestion(
  posture: CGIInstitutionalMemoryPosture,
  domain: CGIInstitutionalMemoryDomain
): string {
  if (posture === 'NO_MEMORY') {
    return 'What must we start preserving before the organization forgets?'
  }

  if (posture === 'EMERGING_MEMORY') {
    return 'Is this early signal worth remembering before it becomes a pattern?'
  }

  if (posture === 'ACTIVE_MEMORY') {
    return `Are we using ${domain.toLowerCase()} memory before making today’s continuity decision?`
  }

  if (posture === 'STRUCTURAL_MEMORY') {
    return `Are we treating this ${domain.toLowerCase()} pattern as structural, or are we still reacting to isolated events?`
  }

  return `What must leadership do now so critical ${domain.toLowerCase()} memory does not disappear before continuity is protected?`
}

function buildContinuityLearning(
  input: CGIInstitutionalMemoryInput,
  posture: CGIInstitutionalMemoryPosture,
  domain: CGIInstitutionalMemoryDomain
): string {
  if (posture === 'NO_MEMORY') {
    return 'CGI has not yet accumulated enough memory to identify repeated continuity behavior.'
  }

  if (input.lastKnownPattern && input.lastKnownPattern.trim().length > 0) {
    return `Most recent remembered pattern: ${input.lastKnownPattern}`
  }

  if (domain === 'SURVIVABILITY') {
    return 'The organization has prior survivability pressure that must influence current executive interpretation.'
  }

  if (domain === 'CROSS_SITE') {
    return 'Continuity pressure has appeared across more than one operational environment and should not be read as isolated.'
  }

  if (domain === 'COMMAND') {
    return 'Prior command intervention indicates that continuity pressure has previously required formal decision ownership.'
  }

  if (domain === 'RECURRENCE') {
    return 'Repeated instability suggests that prior corrections may not have removed the underlying driver.'
  }

  if (domain === 'RECOVERY') {
    return 'Recovery history should be used to distinguish durable stabilization from repeated temporary improvement.'
  }

  if (domain === 'COORDINATION') {
    return 'Coordination history should be used to identify repeated ownership, routing, or synchronization weakness.'
  }

  if (domain === 'EXECUTIVE') {
    return 'Executive review history indicates that the issue has previously carried leadership-level meaning.'
  }

  return 'Audit memory should be used to reconstruct what happened, why it mattered, and what evidence remains incomplete.'
}

function buildEvidenceToPreserve(
  posture: CGIInstitutionalMemoryPosture,
  domain: CGIInstitutionalMemoryDomain
): string {
  const commonEvidence =
    'timestamp, owner, route, action taken, evidence result, recovery outcome, recurrence status, and audit reconstruction.'

  if (posture === 'NO_MEMORY') {
    return `Preserve baseline ${commonEvidence}`
  }

  if (domain === 'CROSS_SITE') {
    return `Preserve affected sites, shared pressure signals, cross-site comparison, coordination evidence, executive rationale, and ${commonEvidence}`
  }

  if (domain === 'SURVIVABILITY') {
    return `Preserve survivability pressure, executive intervention, command ownership, mitigation evidence, unresolved exposure, and ${commonEvidence}`
  }

  if (domain === 'COMMAND') {
    return `Preserve command decision, accountable owner, deadline, required evidence, unresolved consequence, and ${commonEvidence}`
  }

  if (domain === 'RECOVERY') {
    return `Preserve recovery credibility, durability result, reburn status, verification window, and ${commonEvidence}`
  }

  if (domain === 'RECURRENCE') {
    return `Preserve recurrence count, repeated driver, prior correction attempts, structural explanation, and ${commonEvidence}`
  }

  if (domain === 'COORDINATION') {
    return `Preserve coordination owner, routing status, responder capacity, institutional load, synchronization gaps, and ${commonEvidence}`
  }

  if (domain === 'EXECUTIVE') {
    return `Preserve executive question, executive meaning, decision rationale, leadership action, and ${commonEvidence}`
  }

  return `Preserve audit reason, evidence maturity, linked snapshot, visibility classification, and ${commonEvidence}`
}

function buildMemoryNarrative(input: {
  posture: CGIInstitutionalMemoryPosture
  domain: CGIInstitutionalMemoryDomain
  meaning: string
  risk: string
  recommendation: string
}): string {
  return [
    `Institutional memory posture is ${input.posture}.`,
    `Dominant memory domain is ${input.domain}.`,
    input.meaning,
    input.risk,
    input.recommendation,
  ].join(' ')
}

export function buildCGIInstitutionalMemory(
  input: CGIInstitutionalMemoryInput
): CGIInstitutionalMemoryOutput {
  const dominantMemoryDomain = deriveDominantMemoryDomain(input)
  const memoryPosture = deriveMemoryPosture(input)

  const memoryMeaning = buildMemoryMeaning(
    memoryPosture,
    dominantMemoryDomain
  )

  const memoryRisk = buildMemoryRisk(memoryPosture, dominantMemoryDomain)

  const memoryRecommendation = buildMemoryRecommendation(
    memoryPosture,
    dominantMemoryDomain
  )

  const memoryPersistenceRequirement = buildPersistenceRequirement(
    memoryPosture,
    dominantMemoryDomain
  )

  const executiveQuestion = buildExecutiveQuestion(
    memoryPosture,
    dominantMemoryDomain
  )

  const continuityLearning = buildContinuityLearning(
    input,
    memoryPosture,
    dominantMemoryDomain
  )

  const evidenceToPreserve = buildEvidenceToPreserve(
    memoryPosture,
    dominantMemoryDomain
  )

  return {
    memoryPosture,
    dominantMemoryDomain,
    memoryMeaning,
    memoryRisk,
    memoryRecommendation,
    memoryPersistenceRequirement,
    executiveQuestion,
    continuityLearning,
    memoryNarrative: buildMemoryNarrative({
      posture: memoryPosture,
      domain: dominantMemoryDomain,
      meaning: memoryMeaning,
      risk: memoryRisk,
      recommendation: memoryRecommendation,
    }),
    evidenceToPreserve,
  }
}