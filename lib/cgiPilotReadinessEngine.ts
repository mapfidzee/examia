import type { CGIDerivationOutput } from './cgiDerivationEngine'
import type { CGITransitionDecision } from './cgiContinuityStateEngine'
import type { CGICommandOutput } from './cgiExecutiveCommandEngine'
import type { CGIStructuralMemoryOutput } from './cgiStructuralMemoryEngine'
import type { CGIAccountabilityOutput } from './cgiAccountabilityEngine'
import type { CGISecurityGovernanceOutput } from './cgiSecurityGovernanceEngine'

export type CGIPilotReadinessLevel =
  | 'NOT_READY'
  | 'FOUNDATIONAL'
  | 'DEMONSTRABLE'
  | 'PILOT_READY'
  | 'EXECUTIVE_READY'

export type CGIPilotRisk =
  | 'LOW'
  | 'WATCH'
  | 'ELEVATED'
  | 'HIGH'

export type CGIPilotInput = {
  derivation: CGIDerivationOutput
  stateDecision: CGITransitionDecision
  command: CGICommandOutput
  memory: CGIStructuralMemoryOutput
  accountability: CGIAccountabilityOutput
  security: CGISecurityGovernanceOutput
  hasDemoOrganization: boolean
  hasDemoCases: boolean
  hasExecutiveWalkthrough: boolean
  hasPilotNarrative: boolean
  hasGovernanceAuditFlow: boolean
  hasInstitutionIsolation: boolean
  hasPricingLogic: boolean
  hasOperationalStoryline: boolean
}

export type CGIPilotReadinessOutput = {
  readinessLevel: CGIPilotReadinessLevel
  pilotRisk: CGIPilotRisk
  readinessScore: number
  strongestCapability: string
  primaryGap: string
  executiveDemonstrationFocus: string
  pilotNarrative: string
  recommendedNextAction: string
  investorReadinessInterpretation: string
}

function calculateReadinessScore(
  input: CGIPilotInput
): number {
  let score = 0

  if (input.hasDemoOrganization) score += 10
  if (input.hasDemoCases) score += 10
  if (input.hasExecutiveWalkthrough) score += 15
  if (input.hasPilotNarrative) score += 10
  if (input.hasGovernanceAuditFlow) score += 15
  if (input.hasInstitutionIsolation) score += 15
  if (input.hasPricingLogic) score += 10
  if (input.hasOperationalStoryline) score += 15

  return score
}

function deriveReadinessLevel(
  score: number
): CGIPilotReadinessLevel {
  if (score >= 90) return 'EXECUTIVE_READY'
  if (score >= 75) return 'PILOT_READY'
  if (score >= 50) return 'DEMONSTRABLE'
  if (score >= 25) return 'FOUNDATIONAL'
  return 'NOT_READY'
}

function derivePilotRisk(
  level: CGIPilotReadinessLevel
): CGIPilotRisk {
  if (level === 'NOT_READY') return 'HIGH'
  if (level === 'FOUNDATIONAL') return 'ELEVATED'
  if (level === 'DEMONSTRABLE') return 'WATCH'
  return 'LOW'
}

function deriveStrongestCapability(
  input: CGIPilotInput
): string {
  if (
    input.memory.structuralPatternDetected &&
    input.accountability.accountabilityRisk !== 'LOW'
  ) {
    return 'CGI can connect instability memory to governed accountability.'
  }

  if (
    input.command.executivePosture === 'COMMAND' ||
    input.command.executivePosture === 'EXECUTIVE_INTERVENTION'
  ) {
    return 'CGI can compress operational instability into executive command language.'
  }

  if (
    input.security.accessAllowed &&
    input.security.securityRiskLevel !== 'CRITICAL'
  ) {
    return 'CGI has governed continuity security boundaries.'
  }

  return 'CGI has a coherent continuity reasoning foundation.'
}

function derivePrimaryGap(
  input: CGIPilotInput
): string {
  if (!input.hasExecutiveWalkthrough) {
    return 'Executive walkthrough narrative is not yet operationalized.'
  }

  if (!input.hasDemoCases) {
    return 'Demonstration instability scenarios are still missing.'
  }

  if (!input.hasPricingLogic) {
    return 'Pilot pricing and institutional offer structure are incomplete.'
  }

  if (!input.hasOperationalStoryline) {
    return 'Operational continuity storyline is not yet packaged for institutions.'
  }

  return 'No major foundational pilot gap detected.'
}

function deriveExecutiveDemonstrationFocus(
  input: CGIPilotInput
): string {
  if (
    input.derivation.continuityCondition === 'RECURRENCE_RISK'
  ) {
    return 'Demonstrate how CGI detects repeated instability before leadership falsely declares stabilization.'
  }

  if (
    input.derivation.continuityCondition === 'FRAGILE_RECOVERY'
  ) {
    return 'Demonstrate how CGI distinguishes visible recovery from durable stabilization.'
  }

  if (
    input.derivation.continuityCondition ===
    'SURVIVABILITY_THREAT'
  ) {
    return 'Demonstrate executive command escalation and survivability protection logic.'
  }

  return 'Demonstrate continuity reasoning, structural memory, and accountability coherence.'
}

function buildPilotNarrative(
  input: CGIPilotInput
): string {
  return [
    'TSINAXA CGI governs visible instability until stabilization credibility exists.',
    'The infrastructure detects continuity degradation, derives executive meaning, governs recovery verification, remembers structural instability patterns, and enforces accountability discipline.',
    `Current continuity condition: ${input.derivation.continuityCondition}.`,
    `Executive posture: ${input.command.executivePosture}.`,
    `Structural memory signal: ${input.memory.primaryMemorySignal}.`,
    `Accountability status: ${input.accountability.accountabilityStatus}.`,
  ].join(' ')
}

function deriveRecommendedNextAction(
  input: CGIPilotInput
): string {
  if (!input.hasExecutiveWalkthrough) {
    return 'Build a guided executive walkthrough using one instability-to-recovery continuity scenario.'
  }

  if (!input.hasDemoCases) {
    return 'Create realistic instability cycles with recurrence, escalation, recovery, and reburn examples.'
  }

  if (!input.hasPricingLogic) {
    return 'Develop pilot pricing logic and institutional onboarding structure.'
  }

  if (!input.hasOperationalStoryline) {
    return 'Package CGI into a calm operational continuity narrative for executives.'
  }

  return 'Prepare pilot demonstrations and begin institutional validation discussions.'
}

function buildInvestorReadinessInterpretation(
  level: CGIPilotReadinessLevel
): string {
  if (level === 'EXECUTIVE_READY') {
    return 'CGI demonstrates strong executive positioning, governance coherence, and institutional commercialization readiness.'
  }

  if (level === 'PILOT_READY') {
    return 'CGI is structurally ready for controlled institutional pilot conversations.'
  }

  if (level === 'DEMONSTRABLE') {
    return 'CGI can now demonstrate meaningful continuity intelligence differentiation.'
  }

  if (level === 'FOUNDATIONAL') {
    return 'CGI has a credible foundation but still requires operational packaging.'
  }

  return 'CGI requires further operational readiness before institutional demonstration.'
}

export function evaluateCGIPilotReadiness(
  input: CGIPilotInput
): CGIPilotReadinessOutput {
  const readinessScore = calculateReadinessScore(input)
  const readinessLevel = deriveReadinessLevel(readinessScore)
  const pilotRisk = derivePilotRisk(readinessLevel)

  return {
    readinessLevel,
    pilotRisk,
    readinessScore,
    strongestCapability: deriveStrongestCapability(input),
    primaryGap: derivePrimaryGap(input),
    executiveDemonstrationFocus:
      deriveExecutiveDemonstrationFocus(input),
    pilotNarrative: buildPilotNarrative(input),
    recommendedNextAction: deriveRecommendedNextAction(input),
    investorReadinessInterpretation:
      buildInvestorReadinessInterpretation(readinessLevel),
  }
}