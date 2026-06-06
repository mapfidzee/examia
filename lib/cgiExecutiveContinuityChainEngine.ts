export type CGIExecutiveContinuityOrigin =
  | 'RECOVERY'
  | 'COMMAND'
  | 'COORDINATION'
  | 'CROSS_SITE'
  | 'SITUATION_ROOM'
  | 'EXECUTIVE_CENTER'
  | 'EXECUTIVE_REPORT'
  | 'MEMORY_BOARD'
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
  situationRoomPressure?: number
  executiveReportPressure?: number
  memoryBoardPressure?: number
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
  if (hasValue(input.auditPressure)) {
    return 'AUDIT'
  }

  if (hasValue(input.memoryBoardPressure) || input.historicalMemory > 0) {
    return 'MEMORY_BOARD'
  }

  if (hasValue(input.executiveReportPressure)) {
    return 'EXECUTIVE_REPORT'
  }

  if (hasValue(input.situationRoomPressure)) {
    return 'SITUATION_ROOM'
  }

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

  return 'MONITORING'
}

function deriveContinuityPath(origin: CGIExecutiveContinuityOrigin): string[] {
  if (origin === 'AUDIT') {
    return [
      'Recovery',
      'Command',
      'Coordination',
      'Cross-Site',
      'Situation Room',
      'Executive Center',
      'Executive Report',
      'Memory Board',
      'Audit',
    ]
  }

  if (origin === 'MEMORY_BOARD') {
    return [
      'Recovery',
      'Command',
      'Coordination',
      'Cross-Site',
      'Situation Room',
      'Executive Center',
      'Executive Report',
      'Memory Board',
    ]
  }

  if (origin === 'EXECUTIVE_REPORT') {
    return [
      'Recovery',
      'Command',
      'Coordination',
      'Cross-Site',
      'Situation Room',
      'Executive Center',
      'Executive Report',
    ]
  }

  if (origin === 'EXECUTIVE_CENTER') {
    return [
      'Recovery',
      'Command',
      'Coordination',
      'Cross-Site',
      'Situation Room',
      'Executive Center',
    ]
  }

  if (origin === 'SITUATION_ROOM') {
    return [
      'Recovery',
      'Command',
      'Coordination',
      'Cross-Site',
      'Situation Room',
      'Executive Center',
    ]
  }

  if (origin === 'CROSS_SITE') {
    return [
      'Recovery',
      'Command',
      'Coordination',
      'Cross-Site',
      'Situation Room',
      'Executive Center',
    ]
  }

  if (origin === 'COORDINATION') {
    return [
      'Recovery',
      'Command',
      'Coordination',
      'Cross-Site',
      'Situation Room',
      'Executive Center',
    ]
  }

  if (origin === 'COMMAND') {
    return ['Recovery', 'Command', 'Situation Room', 'Executive Center']
  }

  if (origin === 'RECOVERY') {
    return ['Recovery', 'Situation Room', 'Executive Center']
  }

  return ['Monitoring', 'Executive Center']
}

function deriveChainConfidence(
  input: CGIExecutiveContinuityChainInput,
  origin: CGIExecutiveContinuityOrigin,
): CGIExecutiveChainConfidence {
  if (
    origin === 'AUDIT' ||
    origin === 'MEMORY_BOARD' ||
    origin === 'EXECUTIVE_REPORT' ||
    origin === 'SITUATION_ROOM' ||
    origin === 'CROSS_SITE' ||
    hasValue(input.safeguardingVisible)
  ) {
    return 'EXECUTIVE_CRITICAL'
  }

  if (
    origin === 'COORDINATION' ||
    input.commandPressure > 0 ||
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
  if (origin === 'AUDIT') {
    return 'Continuity reached Audit because the full chain must remain reconstructable from instability entry through executive memory.'
  }

  if (origin === 'MEMORY_BOARD') {
    return 'Continuity reached Memory Board because the institution must preserve what returned, what was learned, and what must not disappear after recovery.'
  }

  if (origin === 'EXECUTIVE_REPORT') {
    return 'Continuity reached Executive Report because leadership needs a formal continuity interpretation, not just operational activity.'
  }

  if (origin === 'SITUATION_ROOM') {
    return 'Continuity reached Situation Room because trajectory, recurrence, pressure, and recovery credibility require a live executive operating picture.'
  }

  if (origin === 'CROSS_SITE') {
    return 'Continuity reached Cross-Site because the signal may no longer be isolated to one case, site, or operational lane.'
  }

  if (origin === 'COORDINATION') {
    return 'Continuity reached Coordination because ownership, routing, responder capacity, institutional load, or evidence maturity required synchronized interpretation.'
  }

  if (origin === 'COMMAND') {
    return 'Continuity reached Command because command pressure remains visible before stability can be trusted.'
  }

  if (origin === 'RECOVERY') {
    if (input.fragileRecovery > 0) {
      return 'Continuity reached Recovery because visible recovery exists but durability has not yet been proven.'
    }

    return 'Continuity reached Recovery because recovery evidence exists and leadership must understand whether it can be trusted.'
  }

  return 'Executive Center remains clear. No active continuity handoff currently requires leadership synthesis.'
}

function deriveNextRequiredMovement(
  input: CGIExecutiveContinuityChainInput,
  origin: CGIExecutiveContinuityOrigin,
): string {
  if (origin === 'AUDIT') {
    return 'Confirm that request, triage, case, routing, intervention, outcome, recovery, command, coordination, cross-site, report, and memory evidence can be reconstructed without narrative gaps.'
  }

  if (origin === 'MEMORY_BOARD') {
    return 'Preserve the institutional lesson and keep recurrence, recovery credibility, and structural vulnerability attached to executive memory.'
  }

  if (origin === 'EXECUTIVE_REPORT') {
    return 'Convert the continuity signal into a formal executive report with posture, risk, evidence, recommendation, and institutional meaning.'
  }

  if (origin === 'SITUATION_ROOM') {
    return 'Maintain the live operating picture until trajectory, pressure, recurrence, and recovery credibility are no longer ambiguous.'
  }

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
      return 'Move toward institutional stability only if memory, recurrence, evidence, and unresolved risk remain visible.'
    }

    return 'Maintain recovery interpretation until credibility is clear.'
  }

  return 'Maintain monitoring. No governed executive movement is currently required.'
}

function deriveAuditMeaning(
  input: CGIExecutiveContinuityChainInput,
  origin: CGIExecutiveContinuityOrigin,
): string {
  if (
    origin === 'AUDIT' ||
    origin === 'MEMORY_BOARD' ||
    origin === 'EXECUTIVE_REPORT' ||
    origin === 'SITUATION_ROOM' ||
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

  return 'Routine evidence preservation is sufficient.'
}

function deriveMemoryMeaning(
  input: CGIExecutiveContinuityChainInput,
): string {
  if (hasValue(input.memoryBoardPressure)) {
    return 'Institutional memory is active because the continuity lesson must survive beyond the visible event.'
  }

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

function deriveTrustQuestion(origin: CGIExecutiveContinuityOrigin): string {
  if (origin === 'AUDIT') {
    return 'Can leadership reconstruct the full chain and justify why continuity was trusted?'
  }

  if (origin === 'MEMORY_BOARD') {
    return 'Can the institution remember the vulnerability after visible pressure fades?'
  }

  if (origin === 'EXECUTIVE_REPORT') {
    return 'Can leadership act from a clear continuity interpretation rather than scattered operational fragments?'
  }

  if (origin === 'SITUATION_ROOM') {
    return 'Can leadership trust the current trajectory before recurrence and recovery credibility are resolved?'
  }

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