import { buildContinuityDerivationStandard } from './cgiContinuityDerivationStandard'
import type { ContinuityTrustInput } from './cgiContinuityTrustEngine'

export type InstitutionalMemoryDoctrineInput = {
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
  memoryPosture?: string
  dominantMemoryDomain?: string
}

export type InstitutionalMemoryDoctrine = {
  whatIsVisible: string
  whyItMatters: string
  continuityRisk: string
  requiredMovement: string
  trustLevel: string
  institutionalMeaning: string
  trustReading: string
  trustMeaning: string
  executiveDecision: string
  boardLevelWarning: string
  ceoSentence: string
}

export function buildInstitutionalMemoryDoctrine(
  input: InstitutionalMemoryDoctrineInput,
): InstitutionalMemoryDoctrine {
  const trustInput = buildMemoryTrustInput(input)

  const derivation = buildContinuityDerivationStandard({
    ...trustInput,
    visibleSignal: deriveVisibleSignal(input),
    stage: 'Institutional Memory',
    posture: input.memoryPosture || deriveMemoryPostureLabel(input),
    currentMeaning: deriveCurrentMeaning(input),
    nextMovement: deriveRequiredMovement(input),
  })

  return {
    whatIsVisible: derivation.whatIsVisible,
    whyItMatters: derivation.whyItMatters,
    continuityRisk: derivation.continuityRisk,
    requiredMovement: derivation.requiredMovement,
    trustLevel: derivation.trustLevel,
    institutionalMeaning: derivation.institutionalMeaning,
    trustReading: derivation.trustAssessment.trustReading,
    trustMeaning: derivation.trustAssessment.trustMeaning,
    executiveDecision: derivation.trustAssessment.executiveDecision,
    boardLevelWarning: derivation.trustAssessment.boardLevelWarning,
    ceoSentence: derivation.trustAssessment.ceoSentence,
  }
}

function buildMemoryTrustInput(
  input: InstitutionalMemoryDoctrineInput,
): ContinuityTrustInput {
  return {
    activeInstability:
      input.recurringInstabilityCount +
      input.recoveryFailureCount +
      input.coordinationIssueCount,
    recoveryRecords: input.verifiedRecoveryCount + input.recoveryFailureCount,
    fragileRecovery: input.recoveryFailureCount,
    commandPressure: input.commandInterventionCount,
    evidenceReturn: input.unresolvedMemoryGaps || 0,
    absorbable:
      input.historicalRecords > 0 &&
      input.recoveryFailureCount === 0 &&
      (input.unresolvedMemoryGaps || 0) === 0
        ? 1
        : 0,
    historicalMemory: input.historicalRecords,
    recurrenceVisible: input.recurringInstabilityCount,
    coordinationPressure: input.coordinationIssueCount,
    crossSitePressure: input.crossSiteSignalCount,
    auditPressure: input.auditReconstructionCount,
    safeguardingVisible: input.survivabilityThreatCount,
    posture: input.memoryPosture || deriveMemoryPostureLabel(input),
  }
}

function deriveVisibleSignal(input: InstitutionalMemoryDoctrineInput) {
  if (input.survivabilityThreatCount > 0) {
    return 'Survivability memory pressure'
  }

  if (input.crossSiteSignalCount > 0) {
    return 'Cross-site institutional memory'
  }

  if (input.commandInterventionCount > 0) {
    return 'Command memory pressure'
  }

  if (input.recurringInstabilityCount > 0) {
    return 'Recurring instability memory'
  }

  if (input.recoveryFailureCount > 0) {
    return 'Recovery durability memory'
  }

  if (input.coordinationIssueCount > 0) {
    return 'Coordination memory pressure'
  }

  if (input.auditReconstructionCount > 0) {
    return 'Audit reconstruction memory'
  }

  if (input.historicalRecords > 0) {
    return 'Preserved institutional continuity memory'
  }

  return 'No active institutional memory'
}

function deriveRequiredMovement(input: InstitutionalMemoryDoctrineInput) {
  if (input.survivabilityThreatCount > 0) {
    return 'Keep survivability memory under executive visibility until continuity protection is verified.'
  }

  if (input.crossSiteSignalCount > 0) {
    return 'Preserve cross-site memory and require enterprise pattern review before confidence is restored.'
  }

  if (input.commandInterventionCount > 0) {
    return 'Preserve command rationale, ownership, and evidence before reducing executive visibility.'
  }

  if (input.recurringInstabilityCount > 0) {
    return 'Preserve recurrence pattern memory and require structural ownership before closure.'
  }

  if (input.recoveryFailureCount > 0) {
    return 'Preserve recovery failure evidence and continue durability verification.'
  }

  if ((input.unresolvedMemoryGaps || 0) > 0) {
    return 'Require evidence follow-up before memory can support trusted stability.'
  }

  if (input.historicalRecords > 0) {
    return 'Preserve memory for future interpretation without manufacturing escalation.'
  }

  return 'Begin preserving continuity records before future instability disappears.'
}

function deriveCurrentMeaning(input: InstitutionalMemoryDoctrineInput) {
  if (input.lastKnownPattern && input.lastKnownPattern.trim().length > 0) {
    return `Institutional memory is preserving this pattern: ${input.lastKnownPattern}`
  }

  if (input.historicalRecords === 0) {
    return 'No governed institutional continuity memory has been established yet.'
  }

  return 'Institutional continuity memory is available and should inform current trust, recovery, recurrence, and audit interpretation.'
}

function deriveMemoryPostureLabel(input: InstitutionalMemoryDoctrineInput) {
  if (input.historicalRecords === 0) return 'NO_MEMORY'

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