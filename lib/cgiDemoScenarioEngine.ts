import { deriveCGIIntelligence } from './cgiDerivationEngine'
import { evaluateCGIContinuityState } from './cgiContinuityStateEngine'
import { buildCGIExecutiveCommand } from './cgiExecutiveCommandEngine'
import { buildCGIUnifiedExecutiveShell } from './cgiUnifiedExecutiveShell'
import { evaluateCGIStructuralMemory } from './cgiStructuralMemoryEngine'
import { evaluateCGIAccountability } from './cgiAccountabilityEngine'
import { evaluateCGISecurityGovernance } from './cgiSecurityGovernanceEngine'
import { evaluateCGIPilotReadiness } from './cgiPilotReadinessEngine'

export type CGIDemoScenarioKey =
  | 'STABLE_MONITORING'
  | 'EARLY_STRAIN'
  | 'ESCALATED_INSTABILITY'
  | 'FRAGILE_RECOVERY'
  | 'REBURN_RECURRENCE'
  | 'SURVIVABILITY_THREAT'

export type CGIDemoScenarioOutput = {
  scenarioKey: CGIDemoScenarioKey
  scenarioTitle: string
  scenarioPurpose: string
  derivation: ReturnType<typeof deriveCGIIntelligence>
  stateDecision: ReturnType<typeof evaluateCGIContinuityState>
  command: ReturnType<typeof buildCGIExecutiveCommand>
  shell: ReturnType<typeof buildCGIUnifiedExecutiveShell>
  memory: ReturnType<typeof evaluateCGIStructuralMemory>
  accountability: ReturnType<typeof evaluateCGIAccountability>
  security: ReturnType<typeof evaluateCGISecurityGovernance>
  pilotReadiness: ReturnType<typeof evaluateCGIPilotReadiness>
}

const scenarioDescriptions: Record<
  CGIDemoScenarioKey,
  { title: string; purpose: string }
> = {
  STABLE_MONITORING: {
    title: 'Stable Monitoring',
    purpose:
      'Shows CGI preserving calm visibility when no serious continuity strain is present.',
  },
  EARLY_STRAIN: {
    title: 'Early Strain',
    purpose:
      'Shows CGI detecting weak continuity signals before visible instability expands.',
  },
  ESCALATED_INSTABILITY: {
    title: 'Escalated Instability',
    purpose:
      'Shows CGI converting visible instability into command-level leadership attention.',
  },
  FRAGILE_RECOVERY: {
    title: 'Fragile Recovery',
    purpose:
      'Shows CGI refusing to treat visible recovery as durable stabilization without evidence.',
  },
  REBURN_RECURRENCE: {
    title: 'Reburn Recurrence',
    purpose:
      'Shows CGI detecting repeated instability after apparent recovery.',
  },
  SURVIVABILITY_THREAT: {
    title: 'Survivability Threat',
    purpose:
      'Shows CGI escalating severe continuity degradation into executive intervention.',
  },
}

function buildScenarioInput(scenario: CGIDemoScenarioKey) {
  if (scenario === 'STABLE_MONITORING') {
    return {
      previousState: 'STABLE' as const,
      openCases: 0,
      escalatedCases: 0,
      repeatedInstabilityCount: 0,
      unresolvedCriticalCount: 0,
      recoveryFailures: 0,
      verifiedRecoveries: 1,
      coordinationIssues: 0,
      averageUnresolvedDays: 0,
      dominantSeverity: 'LOW' as const,
      recoveryStatus: 'VERIFIED' as const,
      unresolvedDurationDays: 0,
      reburnCount: 0,
      priorEscalationCount: 0,
      priorSurvivabilityThreatCount: 0,
      ownerAssigned: true,
      actionStarted: true,
      evidenceSubmitted: true,
      evidenceVerified: true,
      deadlineMissed: false,
    }
  }

  if (scenario === 'EARLY_STRAIN') {
    return {
      previousState: 'STABLE' as const,
      openCases: 2,
      escalatedCases: 0,
      repeatedInstabilityCount: 0,
      unresolvedCriticalCount: 0,
      recoveryFailures: 0,
      verifiedRecoveries: 0,
      coordinationIssues: 1,
      averageUnresolvedDays: 2,
      dominantSeverity: 'MODERATE' as const,
      recoveryStatus: 'NOT_STARTED' as const,
      unresolvedDurationDays: 2,
      reburnCount: 0,
      priorEscalationCount: 0,
      priorSurvivabilityThreatCount: 0,
      ownerAssigned: false,
      actionStarted: false,
      evidenceSubmitted: false,
      evidenceVerified: false,
      deadlineMissed: false,
    }
  }

  if (scenario === 'ESCALATED_INSTABILITY') {
    return {
      previousState: 'ACTIVE_INSTABILITY' as const,
      openCases: 8,
      escalatedCases: 4,
      repeatedInstabilityCount: 1,
      unresolvedCriticalCount: 1,
      recoveryFailures: 1,
      verifiedRecoveries: 0,
      coordinationIssues: 4,
      averageUnresolvedDays: 9,
      dominantSeverity: 'HIGH' as const,
      recoveryStatus: 'IN_PROGRESS' as const,
      unresolvedDurationDays: 9,
      reburnCount: 0,
      priorEscalationCount: 2,
      priorSurvivabilityThreatCount: 0,
      ownerAssigned: true,
      actionStarted: true,
      evidenceSubmitted: false,
      evidenceVerified: false,
      deadlineMissed: false,
    }
  }

  if (scenario === 'FRAGILE_RECOVERY') {
    return {
      previousState: 'ESCALATED_INSTABILITY' as const,
      openCases: 1,
      escalatedCases: 0,
      repeatedInstabilityCount: 1,
      unresolvedCriticalCount: 0,
      recoveryFailures: 1,
      verifiedRecoveries: 0,
      coordinationIssues: 1,
      averageUnresolvedDays: 5,
      dominantSeverity: 'MODERATE' as const,
      recoveryStatus: 'RECOVERED' as const,
      unresolvedDurationDays: 5,
      reburnCount: 0,
      priorEscalationCount: 2,
      priorSurvivabilityThreatCount: 0,
      ownerAssigned: true,
      actionStarted: true,
      evidenceSubmitted: true,
      evidenceVerified: false,
      deadlineMissed: false,
    }
  }

  if (scenario === 'REBURN_RECURRENCE') {
    return {
      previousState: 'FRAGILE_RECOVERY' as const,
      openCases: 5,
      escalatedCases: 2,
      repeatedInstabilityCount: 6,
      unresolvedCriticalCount: 0,
      recoveryFailures: 3,
      verifiedRecoveries: 0,
      coordinationIssues: 4,
      averageUnresolvedDays: 12,
      dominantSeverity: 'HIGH' as const,
      recoveryStatus: 'PARTIAL' as const,
      unresolvedDurationDays: 12,
      reburnCount: 2,
      priorEscalationCount: 4,
      priorSurvivabilityThreatCount: 0,
      ownerAssigned: true,
      actionStarted: true,
      evidenceSubmitted: true,
      evidenceVerified: false,
      deadlineMissed: true,
    }
  }

  return {
    previousState: 'ESCALATED_INSTABILITY' as const,
    openCases: 14,
    escalatedCases: 7,
    repeatedInstabilityCount: 10,
    unresolvedCriticalCount: 3,
    recoveryFailures: 5,
    verifiedRecoveries: 0,
    coordinationIssues: 8,
    averageUnresolvedDays: 24,
    dominantSeverity: 'CRITICAL' as const,
    recoveryStatus: 'IN_PROGRESS' as const,
    unresolvedDurationDays: 24,
    reburnCount: 3,
    priorEscalationCount: 6,
    priorSurvivabilityThreatCount: 1,
    ownerAssigned: true,
    actionStarted: true,
    evidenceSubmitted: false,
    evidenceVerified: false,
    deadlineMissed: true,
  }
}

export function buildCGIDemoScenario(
  scenarioKey: CGIDemoScenarioKey
): CGIDemoScenarioOutput {
  const base = buildScenarioInput(scenarioKey)
  const description = scenarioDescriptions[scenarioKey]

  const derivation = deriveCGIIntelligence({
    openCases: base.openCases,
    escalatedCases: base.escalatedCases,
    repeatedInstabilityCount: base.repeatedInstabilityCount,
    unresolvedCriticalCount: base.unresolvedCriticalCount,
    recoveryFailures: base.recoveryFailures,
    verifiedRecoveries: base.verifiedRecoveries,
    coordinationIssues: base.coordinationIssues,
    averageUnresolvedDays: base.averageUnresolvedDays,
    dominantSeverity: base.dominantSeverity,
    recoveryStatus: base.recoveryStatus,
  })

  const stateDecision = evaluateCGIContinuityState({
    previousState: base.previousState,
    derivedCondition: derivation.continuityCondition,
    continuityConfidence: derivation.continuityConfidence,
    survivabilityPressure: derivation.survivabilityPressure,
    recoveryCredibility: derivation.recoveryCredibility,
    recurrenceSeverity: derivation.recurrenceSeverity,
    unresolvedDurationDays: base.unresolvedDurationDays,
    repeatedInstabilityCount: base.repeatedInstabilityCount,
    recoveryFailureCount: base.recoveryFailures,
    verifiedRecoveryCount: base.verifiedRecoveries,
    coordinationIssueCount: base.coordinationIssues,
  })

  const command = buildCGIExecutiveCommand({
    derivation,
    stateDecision,
  })

  const shell = buildCGIUnifiedExecutiveShell({
    derivation,
    stateDecision,
    command,
  })

  const memory = evaluateCGIStructuralMemory({
    continuityCondition: derivation.continuityCondition,
    recoveryCredibility: derivation.recoveryCredibility,
    recurrenceSeverity: derivation.recurrenceSeverity,
    survivabilityPressure: derivation.survivabilityPressure,
    repeatedInstabilityCount: base.repeatedInstabilityCount,
    recoveryFailureCount: base.recoveryFailures,
    reburnCount: base.reburnCount,
    unresolvedDurationDays: base.unresolvedDurationDays,
    priorEscalationCount: base.priorEscalationCount,
    priorSurvivabilityThreatCount: base.priorSurvivabilityThreatCount,
  })

  const accountability = evaluateCGIAccountability({
    derivation,
    stateDecision,
    command,
    memory,
    ownerAssigned: base.ownerAssigned,
    actionStarted: base.actionStarted,
    evidenceSubmitted: base.evidenceSubmitted,
    evidenceVerified: base.evidenceVerified,
    unresolvedDurationDays: base.unresolvedDurationDays,
    deadlineMissed: base.deadlineMissed,
  })

  const security = evaluateCGISecurityGovernance({
    role: 'EXECUTIVE',
    operation: 'VIEW_EXECUTIVE_COMMAND',
    hasInstitutionScope: true,
    hasAuditLogging: true,
    hasVerifiedIdentity: true,
    isProductionEnvironment: true,
    containsSensitiveContinuityData: true,
    attemptsCrossInstitutionAccess: false,
  })

  const pilotReadiness = evaluateCGIPilotReadiness({
    derivation,
    stateDecision,
    command,
    memory,
    accountability,
    security,
    hasDemoOrganization: true,
    hasDemoCases: true,
    hasExecutiveWalkthrough: true,
    hasPilotNarrative: true,
    hasGovernanceAuditFlow: true,
    hasInstitutionIsolation: true,
    hasPricingLogic: false,
    hasOperationalStoryline: true,
  })

  return {
    scenarioKey,
    scenarioTitle: description.title,
    scenarioPurpose: description.purpose,
    derivation,
    stateDecision,
    command,
    shell,
    memory,
    accountability,
    security,
    pilotReadiness,
  }
}

export const cgiDemoScenarioKeys: CGIDemoScenarioKey[] = [
  'STABLE_MONITORING',
  'EARLY_STRAIN',
  'ESCALATED_INSTABILITY',
  'FRAGILE_RECOVERY',
  'REBURN_RECURRENCE',
  'SURVIVABILITY_THREAT',
]