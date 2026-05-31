export type CGIExecutiveContinuityOrigin =
  | 'RECOVERY'
  | 'COMMAND'
  | 'COORDINATION'
  | 'CROSS_SITE'
  | 'AUDIT'
  | 'MONITORING'

export type CGIExecutiveChainConfidence =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'EXECUTIVE_CRITICAL'

export type CGIExecutiveContinuityChainInput = {
  activeInstability: number
  recoveryRecords: number
  fragileRecovery: number
  commandPressure: number
  evidenceReturn: number
  absorbable: number
  historicalMemory: number
  recurrenceVisible?: number
  coordinationPressure?: number
  crossSitePressure?: number
  auditPressure?: number
  safeguardingVisible?: number
}

export type CGIExecutiveContinuityChain = {
  dominantOrigin: CGIExecutiveContinuityOrigin
  chainConfidence: CGIExecutiveChainConfidence
  continuityPath: string[]
  chainNarrative: string
  executiveReason: string
  nextRequiredMovement: string
  auditMeaning: string
  memoryMeaning: string
  trustQuestion: string
}

function hasValue(value: number | undefined): boolean {
  return typeof value === 'number' && value > 0
}

function deriveDominantOrigin(
  input: CGIExecutiveContinuityChainInput,
): CGIExecutiveContinuityOrigin {
  if (hasValue(input.crossSitePressure)) {
    return 'CROSS_SITE'
  }

  if (hasValue(input.coordinationPressure)) {
    return 'COORDINATION'
  }

  if (input.commandPressure > 0) {
    return 'COMMAND'
  }

  if (input.fragileRecovery > 0 || input.recoveryRecords > 0) {
    return 'RECOVERY'
  }

  if (hasValue(input.auditPressure) || input.historicalMemory > 0) {
    return 'AUDIT'
  }

  return 'MONITORING'
}

function deriveContinuityPath(
  origin: CGIExecutiveContinuityOrigin,
): string[] {
  if (origin === 'CROSS_SITE') {
    return [
      'Recovery',
      'Command',
      'Coordination',
      'Cross-Site',
      'Executive Center',
    ]
  }

  if (origin === 'COORDINATION') {
    return ['Recovery', 'Command', 'Coordination', 'Executive Center']
  }

  if (origin === 'COMMAND') {
    return ['Recovery', 'Command', 'Executive Center']
  }

  if (origin === 'RECOVERY') {
    return ['Recovery', 'Executive Center']
  }

  if (origin === 'AUDIT') {
    return ['Audit', 'Executive Center']
  }

  return ['Monitoring', 'Executive Center']
}

function deriveChainConfidence(
  input: CGIExecutiveContinuityChainInput,
  origin: CGIExecutiveContinuityOrigin,
): CGIExecutiveChainConfidence {
  if (
    origin === 'CROSS_SITE' ||
    hasValue(input.safeguardingVisible) ||
    input.commandPressure > 0
  ) {
    return 'EXECUTIVE_CRITICAL'
  }

  if (
    origin === 'COORDINATION' ||
    input.fragileRecovery > 0 ||
    input.evidenceReturn > 0
  ) {
    return 'HIGH'
  }

  if (input.recoveryRecords > 0 || input.historicalMemory > 0) {
    return 'MODERATE'
  }

  return 'LOW'
}

function deriveExecutiveReason(
  input: CGIExecutiveContinuityChainInput,
  origin: CGIExecutiveContinuityOrigin,
): string {
  if (origin === 'CROSS_SITE') {
    return 'Continuity reached Executive Center because the signal may no longer be isolated to one case, site, or operational lane.'
  }

  if (origin === 'COORDINATION') {
    return 'Continuity reached Executive Center because ownership, routing, responder capacity, institutional load, or evidence maturity required synchronized interpretation.'
  }

  if (origin === 'COMMAND') {
    return 'Continuity reached Executive Center because command pressure remains visible before stability can be trusted.'
  }

  if (origin === 'RECOVERY') {
    if (input.fragileRecovery > 0) {
      return 'Continuity reached Executive Center because recovery is visible but durability has not yet been proven.'
    }

    return 'Continuity reached Executive Center because recovery evidence exists and leadership must understand whether it can be trusted.'
  }

  if (origin === 'AUDIT') {
    return 'Continuity reached Executive Center through audit memory because reconstructability or historical evidence remains relevant to leadership interpretation.'
  }

  return 'Executive Center remains clear. No active continuity handoff currently requires leadership synthesis.'
}

function deriveNextRequiredMovement(
  input: CGIExecutiveContinuityChainInput,
  origin: CGIExecutiveContinuityOrigin,
): string {
  if (origin === 'CROSS_SITE') {
    return 'Review cross-site pattern, preserve audit evidence, and determine whether leadership action is required before continuity trust is restored.'
  }

  if (origin === 'COORDINATION') {
    return 'Confirm ownership, routing clarity, responder capacity, and evidence maturity before moving to Cross-Site Review or Recovery Verification.'
  }

  if (origin === 'COMMAND') {
    return 'Return to Command decision gate if ownership, action deadline, evidence standard, or consequence remains unresolved.'
  }

  if (origin === 'RECOVERY') {
    if (input.fragileRecovery > 0) {
      return 'Continue Recovery Watch until durability is proven without recurrence, reburn, or unresolved pressure.'
    }

    if (input.absorbable > 0) {
      return 'Move toward Stability Board only if memory, recurrence, evidence, and unresolved risk remain visible.'
    }

    return 'Maintain recovery interpretation until credibility is clear.'
  }

  if (origin === 'AUDIT') {
    return 'Preserve reconstructability and use audit memory to support executive interpretation without manufacturing escalation.'
  }

  return 'Maintain monitoring. No governed executive movement is currently required.'
}

function deriveAuditMeaning(
  input: CGIExecutiveContinuityChainInput,
  origin: CGIExecutiveContinuityOrigin,
): string {
  if (
    origin === 'CROSS_SITE' ||
    origin === 'COMMAND' ||
    hasValue(input.auditPressure) ||
    hasValue(input.safeguardingVisible)
  ) {
    return 'Audit reconstruction is required because executive interpretation must remain evidence-traceable.'
  }

  if (origin === 'COORDINATION') {
    return 'Audit preservation is required for ownership, routing, capacity, and evidence maturity.'
  }

  if (origin === 'RECOVERY') {
    return 'Recovery evidence should be preserved so durability can be reconstructed if recurrence appears.'
  }

  if (origin === 'AUDIT') {
    return 'Audit memory is already the dominant executive input.'
  }

  return 'Routine evidence preservation is sufficient.'
}

function deriveMemoryMeaning(
  input: CGIExecutiveContinuityChainInput,
): string {
  if (hasValue(input.recurrenceVisible)) {
    return 'Continuity memory is active because recurrence or repeated instability remains relevant.'
  }

  if (input.historicalMemory > 0) {
    return 'Historical continuity memory is available and should remain visible without overstating current pressure.'
  }

  if (input.recoveryRecords > 0) {
    return 'Recovery memory is available and should remain attached to the executive interpretation.'
  }

  return 'No active structural memory is currently driving executive posture.'
}

function deriveTrustQuestion(
  origin: CGIExecutiveContinuityOrigin,
): string {
  if (origin === 'CROSS_SITE') {
    return 'Can leadership trust continuity if the pattern may be distributed across sites?'
  }

  if (origin === 'COORDINATION') {
    return 'Can leadership trust continuity before ownership and evidence are synchronized?'
  }

  if (origin === 'COMMAND') {
    return 'Can leadership trust continuity before command pressure is resolved?'
  }

  if (origin === 'RECOVERY') {
    return 'Can leadership trust recovery before durability is proven?'
  }

  if (origin === 'AUDIT') {
    return 'Can leadership reconstruct what happened and why continuity was trusted?'
  }

  return 'Is there any current reason to question continuity trust?'
}

function buildChainNarrative(
  origin: CGIExecutiveContinuityOrigin,
  path: string[],
  reason: string,
): string {
  return [
    `Dominant origin: ${origin}.`,
    `Continuity path: ${path.join(' → ')}.`,
    reason,
  ].join(' ')
}

export function buildCGIExecutiveContinuityChain(
  input: CGIExecutiveContinuityChainInput,
): CGIExecutiveContinuityChain {
  const dominantOrigin = deriveDominantOrigin(input)
  const continuityPath = deriveContinuityPath(dominantOrigin)
  const executiveReason = deriveExecutiveReason(input, dominantOrigin)

  return {
    dominantOrigin,
    chainConfidence: deriveChainConfidence(input, dominantOrigin),
    continuityPath,
    chainNarrative: buildChainNarrative(
      dominantOrigin,
      continuityPath,
      executiveReason,
    ),
    executiveReason,
    nextRequiredMovement: deriveNextRequiredMovement(input, dominantOrigin),
    auditMeaning: deriveAuditMeaning(input, dominantOrigin),
    memoryMeaning: deriveMemoryMeaning(input),
    trustQuestion: deriveTrustQuestion(dominantOrigin),
  }
}