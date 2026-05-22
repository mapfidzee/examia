import { deriveCGIIntelligence } from './cgiDerivationEngine'
import { evaluateCGIContinuityState } from './cgiContinuityStateEngine'
import { buildCGIExecutiveCommand } from './cgiExecutiveCommandEngine'
import { buildCGIUnifiedExecutiveShell } from './cgiUnifiedExecutiveShell'
import { evaluateCGIStructuralMemory } from './cgiStructuralMemoryEngine'
import { evaluateCGIAccountability } from './cgiAccountabilityEngine'

export type CGILiveOperationalRoute =
  | 'COMMAND'
  | 'OPERATIONS'
  | 'RECOVERY'
  | 'PRESSURE'
  | 'TRAJECTORY'

export type CGILiveOperationalInput = {
  route: CGILiveOperationalRoute
  openCases: number
  escalatedCases: number
  repeatedInstabilityCount: number
  unresolvedCriticalCount: number
  recoveryFailures: number
  verifiedRecoveries: number
  coordinationIssues: number
  averageUnresolvedDays: number
  unresolvedDurationDays: number
  reburnCount: number
  priorEscalationCount: number
  priorSurvivabilityThreatCount: number
  ownerAssigned: boolean
  actionStarted: boolean
  evidenceSubmitted: boolean
  evidenceVerified: boolean
  deadlineMissed: boolean
}

export type CGILiveOperationalOutput = {
  route: CGILiveOperationalRoute
  routePurpose: string
  executiveFocus: string
  derivation: ReturnType<typeof deriveCGIIntelligence>
  stateDecision: ReturnType<typeof evaluateCGIContinuityState>
  command: ReturnType<typeof buildCGIExecutiveCommand>
  shell: ReturnType<typeof buildCGIUnifiedExecutiveShell>
  memory: ReturnType<typeof evaluateCGIStructuralMemory>
  accountability: ReturnType<typeof evaluateCGIAccountability>
  operationalNarrative: string
}

function deriveRoutePurpose(route: CGILiveOperationalRoute): string {
  if (route === 'COMMAND') {
    return 'Translate continuity pressure into executive command visibility.'
  }

  if (route === 'OPERATIONS') {
    return 'Interpret operational strain through stabilization credibility.'
  }

  if (route === 'RECOVERY') {
    return 'Verify whether visible recovery is becoming durable stabilization.'
  }

  if (route === 'PRESSURE') {
    return 'Identify accumulated pressure that may weaken continuity survivability.'
  }

  return 'Track whether continuity is moving toward stabilization or degradation.'
}

function deriveExecutiveFocus(route: CGILiveOperationalRoute): string {
  if (route === 'COMMAND') {
    return 'What must leadership understand, coordinate, and protect now?'
  }

  if (route === 'OPERATIONS') {
    return 'Where is operational strain weakening stabilization capacity?'
  }

  if (route === 'RECOVERY') {
    return 'Is recovery credible, fragile, or durable?'
  }

  if (route === 'PRESSURE') {
    return 'Is pressure accumulating into survivability risk?'
  }

  return 'Is the institution stabilizing, stalling, or degrading?'
}

function deriveDominantSeverity(input: CGILiveOperationalInput) {
  if (input.unresolvedCriticalCount > 0) return 'CRITICAL' as const
  if (input.escalatedCases >= 3) return 'HIGH' as const

  if (input.openCases > 0 || input.coordinationIssues > 0) {
    return 'MODERATE' as const
  }

  return 'LOW' as const
}

function deriveRecoveryStatus(input: CGILiveOperationalInput) {
  if (input.evidenceVerified && input.verifiedRecoveries > 0) {
    return 'VERIFIED' as const
  }

  if (input.evidenceSubmitted && !input.evidenceVerified) {
    return 'RECOVERED' as const
  }

  if (input.actionStarted && input.recoveryFailures === 0) {
    return 'IN_PROGRESS' as const
  }

  if (input.recoveryFailures > 0 && input.actionStarted) {
    return 'PARTIAL' as const
  }

  return 'NOT_STARTED' as const
}

function derivePreviousState(input: CGILiveOperationalInput) {
  if (input.priorSurvivabilityThreatCount > 0) {
    return 'SURVIVABILITY_THREAT' as const
  }

  if (input.priorEscalationCount >= 3) {
    return 'ESCALATED_INSTABILITY' as const
  }

  if (input.reburnCount > 0) {
    return 'FRAGILE_RECOVERY' as const
  }

  if (input.openCases > 0) {
    return 'ACTIVE_INSTABILITY' as const
  }

  return 'STABLE' as const
}

function buildOperationalNarrative(input: {
  commandTruth: string
  primaryDriver: string
  requiredAction: string
  memoryWarning: string
  accountabilityStatus: string
}): string {
  return [
    `The current continuity reading indicates that ${input.commandTruth}`,
    `${input.primaryDriver}`,
    `${input.requiredAction}`,
    `Structural memory adds caution: ${input.memoryWarning}`,
    `Accountability remains ${input.accountabilityStatus.toLowerCase()}.`,
  ].join(' ')
}

export function evaluateCGILiveOperationalIntegration(
  input: CGILiveOperationalInput
): CGILiveOperationalOutput {
  const derivation = deriveCGIIntelligence({
    openCases: input.openCases,
    escalatedCases: input.escalatedCases,
    repeatedInstabilityCount: input.repeatedInstabilityCount,
    unresolvedCriticalCount: input.unresolvedCriticalCount,
    recoveryFailures: input.recoveryFailures,
    verifiedRecoveries: input.verifiedRecoveries,
    coordinationIssues: input.coordinationIssues,
    averageUnresolvedDays: input.averageUnresolvedDays,
    dominantSeverity: deriveDominantSeverity(input),
    recoveryStatus: deriveRecoveryStatus(input),
  })

  const stateDecision = evaluateCGIContinuityState({
    previousState: derivePreviousState(input),
    derivedCondition: derivation.continuityCondition,
    continuityConfidence: derivation.continuityConfidence,
    survivabilityPressure: derivation.survivabilityPressure,
    recoveryCredibility: derivation.recoveryCredibility,
    recurrenceSeverity: derivation.recurrenceSeverity,
    unresolvedDurationDays: input.unresolvedDurationDays,
    repeatedInstabilityCount: input.repeatedInstabilityCount,
    recoveryFailureCount: input.recoveryFailures,
    verifiedRecoveryCount: input.verifiedRecoveries,
    coordinationIssueCount: input.coordinationIssues,
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
    repeatedInstabilityCount: input.repeatedInstabilityCount,
    recoveryFailureCount: input.recoveryFailures,
    reburnCount: input.reburnCount,
    unresolvedDurationDays: input.unresolvedDurationDays,
    priorEscalationCount: input.priorEscalationCount,
    priorSurvivabilityThreatCount: input.priorSurvivabilityThreatCount,
  })

  const accountability = evaluateCGIAccountability({
    derivation,
    stateDecision,
    command,
    memory,
    ownerAssigned: input.ownerAssigned,
    actionStarted: input.actionStarted,
    evidenceSubmitted: input.evidenceSubmitted,
    evidenceVerified: input.evidenceVerified,
    unresolvedDurationDays: input.unresolvedDurationDays,
    deadlineMissed: input.deadlineMissed,
  })

  return {
    route: input.route,
    routePurpose: deriveRoutePurpose(input.route),
    executiveFocus: deriveExecutiveFocus(input.route),
    derivation,
    stateDecision,
    command,
    shell,
    memory,
    accountability,
    operationalNarrative: buildOperationalNarrative({
      commandTruth: command.dominantTruth,
      primaryDriver: command.primaryDriver,
      requiredAction: command.requiredAction,
      memoryWarning: memory.executiveMemoryWarning,
      accountabilityStatus: accountability.accountabilityStatus,
    }),
  }
}