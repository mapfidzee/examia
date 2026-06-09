import { buildContinuityDerivationStandard } from './cgiContinuityDerivationStandard'
import type { ContinuityTrustInput } from './cgiContinuityTrustEngine'

export type AuditDoctrineInput = {
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
}

export type AuditDoctrineReading = {
  whatIsVisible: string
  whyItMatters: string
  continuityRisk: string
  requiredMovement: string
  trustLevel: string
  trustReading: string
  trustMeaning: string
  institutionalMeaning: string
  executiveDecision: string
  boardLevelWarning: string
  ceoSentence: string
  auditCredibility: string
  auditEscalation: string
  reconstructionPosture: string
  evidenceGap: string
}

export function buildAuditDoctrine(
  input: AuditDoctrineInput,
): AuditDoctrineReading {
  const trustInput = buildAuditTrustInput(input)

  const derivation = buildContinuityDerivationStandard({
    ...trustInput,
    visibleSignal: deriveVisibleSignal(input),
    stage: 'Audit',
    posture: deriveAuditPosture(input),
    currentMeaning: deriveCurrentMeaning(input),
    nextMovement: deriveRequiredMovement(input),
  })

  return {
    whatIsVisible: derivation.whatIsVisible,
    whyItMatters: derivation.whyItMatters,
    continuityRisk: derivation.continuityRisk,
    requiredMovement: derivation.requiredMovement,
    trustLevel: derivation.trustLevel,
    trustReading: derivation.trustAssessment.trustReading,
    trustMeaning: derivation.trustAssessment.trustMeaning,
    institutionalMeaning: derivation.institutionalMeaning,
    executiveDecision: derivation.trustAssessment.executiveDecision,
    boardLevelWarning: derivation.trustAssessment.boardLevelWarning,
    ceoSentence: derivation.trustAssessment.ceoSentence,
    auditCredibility: deriveAuditCredibility(input),
    auditEscalation: deriveAuditEscalation(input),
    reconstructionPosture: deriveReconstructionPosture(input),
    evidenceGap: deriveEvidenceGap(input),
  }
}

function buildAuditTrustInput(input: AuditDoctrineInput): ContinuityTrustInput {
  return {
    activeInstability: input.critical + input.high,
    recoveryRecords: input.total,
    fragileRecovery: input.legacyEvidence,
    commandPressure:
      input.critical > 0 || input.high > 2 || input.executiveReconstructable === 0
        ? 1
        : 0,
    evidenceReturn: deriveEvidenceGapCount(input),
    absorbable:
      input.total > 0 &&
      input.executiveReconstructable > 0 &&
      input.critical === 0 &&
      deriveEvidenceGapCount(input) === 0
        ? 1
        : 0,
    historicalMemory: input.total,
    recurrenceVisible: input.legacyEvidence > input.total / 2 && input.total > 0 ? 1 : 0,
    coordinationPressure:
      input.institutionScoped < input.total || input.uniqueActors === 0 ? 1 : 0,
    crossSitePressure:
      input.memoryBoardLinkVisible || input.activeChainStages >= 8 ? 2 : 0,
    auditPressure:
      input.auditLinkVisible && input.total > 0
        ? 1
        : input.total > 0
          ? 1
          : 0,
    safeguardingVisible: input.critical,
    posture: deriveAuditPosture(input),
  }
}

function deriveVisibleSignal(input: AuditDoctrineInput) {
  if (input.total === 0) return 'No audit evidence visible'
  if (input.critical > 0) return 'Critical audit evidence'
  if (input.executiveReconstructable === 0) return 'Executive reconstruction gap'
  if (input.missingChainStages > 0) return 'Chain reconstruction gap'
  if (input.legacyEvidence > input.total / 2) return 'Legacy evidence dominance'
  if (input.hardenedEvidence > 0 || input.executiveReconstructable > 0) {
    return 'Reconstructable governance evidence'
  }

  return 'Audit evidence visible'
}

function deriveAuditPosture(input: AuditDoctrineInput) {
  if (input.total === 0) return 'LEDGER EMPTY'
  if (input.critical > 0) return 'EXECUTIVE REVIEW'
  if (input.high > 2) return 'GOVERNANCE ESCALATION'
  if (input.executiveReconstructable === 0) return 'COMMAND WATCH'
  if (input.missingChainStages > 0) return 'CHAIN RECONSTRUCTION WATCH'
  return 'EVIDENCE HOLDING'
}

function deriveCurrentMeaning(input: AuditDoctrineInput) {
  if (input.total === 0) {
    return 'Audit cannot yet reconstruct continuity because no preserved evidence is visible.'
  }

  if (input.critical > 0) {
    return 'Critical evidence exists and should remain visible until continuity reconstruction is complete.'
  }

  if (input.executiveReconstructable === 0) {
    return 'Audit evidence exists, but executive reconstruction depth has not yet been established.'
  }

  if (input.missingChainStages > 0) {
    return 'The audit ledger contains evidence, but part of the continuity chain is still difficult to reconstruct.'
  }

  return 'Audit evidence is preserved and can support continuity reconstruction.'
}

function deriveRequiredMovement(input: AuditDoctrineInput) {
  if (input.total === 0) {
    return 'Begin preserving audit evidence before continuity claims are trusted.'
  }

  if (input.critical > 0) {
    return 'Hold executive review and preserve all linked evidence until reconstruction is complete.'
  }

  if (input.executiveReconstructable === 0) {
    return 'Strengthen actor, route, institution, visibility, linked record, and governance reason before trust is restored.'
  }

  if (input.missingChainStages > 0) {
    return 'Strengthen missing chain evidence before treating continuity proof as complete.'
  }

  if (input.legacyEvidence > input.total / 2) {
    return 'Harden legacy evidence into governance-readable reconstruction records.'
  }

  return 'Preserve reconstruction depth and monitor for recurring evidence gaps.'
}

function deriveAuditCredibility(input: AuditDoctrineInput) {
  if (input.total === 0) return 'CREDIBILITY NOT ESTABLISHED'
  if (input.critical > 0) return 'CREDIBILITY COMPROMISED'
  if (input.executiveReconstructable > 0 && input.missingChainStages === 0) {
    return 'CREDIBILITY STRONG'
  }
  if (input.executiveReconstructable > 0) return 'CREDIBILITY STRENGTHENING'
  return 'CREDIBILITY WATCH'
}

function deriveAuditEscalation(input: AuditDoctrineInput) {
  if (input.total === 0) return 'NO ESCALATION'
  if (input.critical > 0) return 'EXECUTIVE REVIEW'
  if (input.high > 2) return 'GOVERNANCE ESCALATION'
  if (input.executiveReconstructable === 0) return 'COMMAND WATCH'
  return 'NO ESCALATION'
}

function deriveReconstructionPosture(input: AuditDoctrineInput) {
  if (input.total === 0) return 'CHAIN NOT YET RECONSTRUCTABLE'
  if (input.missingChainStages === 0 && input.auditLinkVisible) {
    return 'EXECUTIVE CHAIN RECONSTRUCTABLE'
  }
  if (
    input.activeChainStages >= 8 &&
    input.executiveLinkVisible &&
    input.memoryBoardLinkVisible &&
    input.auditLinkVisible
  ) {
    return 'PILOT CHAIN RECONSTRUCTABLE'
  }
  if (input.activeChainStages >= 6) return 'CHAIN RECONSTRUCTION ACTIVE'
  return 'PARTIAL CHAIN RECONSTRUCTION'
}

function deriveEvidenceGap(input: AuditDoctrineInput) {
  if (input.total === 0) {
    return 'No audit records are currently visible.'
  }

  const gaps: string[] = []

  if (input.institutionScoped < input.total) gaps.push('institution scope')
  if (input.visibilityClassified < input.total) gaps.push('visibility classification')
  if (input.linkedSnapshots < input.total) gaps.push('linked lifecycle snapshots')
  if (input.executiveReconstructable === 0) gaps.push('executive reconstruction depth')
  if (input.missingChainStages > 0) gaps.push('continuity chain completeness')

  if (gaps.length === 0) {
    return 'No major audit doctrine gap is visible in the current evidence set.'
  }

  return `The audit doctrine should strengthen: ${gaps.join(', ')}.`
}

function deriveEvidenceGapCount(input: AuditDoctrineInput) {
  let count = 0

  if (input.institutionScoped < input.total) count += 1
  if (input.visibilityClassified < input.total) count += 1
  if (input.linkedSnapshots < input.total) count += 1
  if (input.executiveReconstructable === 0 && input.total > 0) count += 1
  if (input.missingChainStages > 0) count += 1

  return count
}