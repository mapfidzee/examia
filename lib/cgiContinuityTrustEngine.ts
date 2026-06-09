export type EnterpriseTrustReading =
  | 'TRUSTED'
  | 'CONDITIONALLY TRUSTED'
  | 'NOT YET TRUSTED'
  | 'STRUCTURALLY UNTRUSTED'
  | 'NO ACTIVE TRUST QUESTION'

export type ContinuityTrustInput = {
  activeInstability: number
  recoveryRecords: number
  fragileRecovery: number
  commandPressure: number
  evidenceReturn: number
  absorbable: number
  historicalMemory: number
  recurrenceVisible: number
  coordinationPressure: number
  crossSitePressure: number
  auditPressure: number
  safeguardingVisible: number
  posture?: string
}

export type ContinuityTrustAssessment = {
  trustReading: EnterpriseTrustReading
  trustMeaning: string
  trustLevel: 'HIGH' | 'CONDITIONAL' | 'LOW' | 'WITHHELD' | 'NOT_APPLICABLE'
  primaryVulnerability: string
  secondaryVulnerability: string
  stabilityThesis: string
  ceoSentence: string
  executiveDecision: string
  boardLevelWarning: string
  institutionalMeaning: string
  finalInterpretation: string
}

export function buildContinuityTrustAssessment(
  input: ContinuityTrustInput,
): ContinuityTrustAssessment {
  const trustReading = deriveTrustReading(input)

  return {
    trustReading,
    trustMeaning: deriveTrustMeaning(trustReading),
    trustLevel: deriveTrustLevel(trustReading),
    primaryVulnerability: derivePrimaryVulnerability(input),
    secondaryVulnerability: deriveSecondaryVulnerability(input),
    stabilityThesis: deriveStabilityThesis(input, trustReading),
    ceoSentence: deriveCeoSentence(input, trustReading),
    executiveDecision: deriveExecutiveDecision(input, trustReading),
    boardLevelWarning: deriveBoardWarning(input, trustReading),
    institutionalMeaning: deriveInstitutionalMeaning(input),
    finalInterpretation: deriveFinalInterpretation(input, trustReading),
  }
}

function deriveTrustReading(input: ContinuityTrustInput): EnterpriseTrustReading {
  if (
    input.crossSitePressure > 1 &&
    (input.recurrenceVisible > 0 || input.auditPressure > 0)
  ) {
    return 'STRUCTURALLY UNTRUSTED'
  }

  if (
    input.commandPressure > 0 ||
    input.evidenceReturn > 0 ||
    input.fragileRecovery > 0 ||
    input.coordinationPressure > 0
  ) {
    return 'NOT YET TRUSTED'
  }

  if (input.absorbable > 0) {
    return 'CONDITIONALLY TRUSTED'
  }

  if (input.activeInstability === 0 && input.recoveryRecords === 0) {
    return 'NO ACTIVE TRUST QUESTION'
  }

  return 'CONDITIONALLY TRUSTED'
}

function deriveTrustLevel(reading: EnterpriseTrustReading) {
  if (reading === 'TRUSTED') return 'HIGH'
  if (reading === 'CONDITIONALLY TRUSTED') return 'CONDITIONAL'
  if (reading === 'NOT YET TRUSTED') return 'LOW'
  if (reading === 'STRUCTURALLY UNTRUSTED') return 'WITHHELD'
  return 'NOT_APPLICABLE'
}

function deriveTrustMeaning(reading: EnterpriseTrustReading) {
  if (reading === 'STRUCTURALLY UNTRUSTED') {
    return 'Leadership should not trust stability because the visible signal may reflect structural or distributed continuity exposure.'
  }

  if (reading === 'NOT YET TRUSTED') {
    return 'Leadership should continue visibility because recovery, command, evidence, or coordination conditions remain unresolved.'
  }

  if (reading === 'CONDITIONALLY TRUSTED') {
    return 'Leadership may cautiously accept progress, but only with memory, evidence, recurrence, and audit visibility preserved.'
  }

  if (reading === 'TRUSTED') {
    return 'Leadership can currently trust stability based on available continuity evidence.'
  }

  return 'No active continuity condition currently requires a trust decision.'
}

function derivePrimaryVulnerability(input: ContinuityTrustInput) {
  if (input.crossSitePressure > 1) return 'Cross-site dependency exposure'
  if (input.coordinationPressure > 0) return 'Ownership and synchronization weakness'
  if (input.commandPressure > 0) return 'Unresolved command pressure'
  if (input.evidenceReturn > 0) return 'Evidence credibility weakness'
  if (input.fragileRecovery > 0) return 'Recovery durability weakness'
  if (input.activeInstability > 0) return 'Active instability visibility'
  if (input.absorbable > 0) return 'Memory preservation during absorption'
  return 'No active vulnerability visible'
}

function deriveSecondaryVulnerability(input: ContinuityTrustInput) {
  if (input.auditPressure > 0) return 'Audit reconstructability risk'
  if (input.recurrenceVisible > 0) return 'Recurrence memory risk'
  if (input.safeguardingVisible > 0) return 'Safeguarding visibility risk'
  if (input.historicalMemory > 0) return 'Historical pattern interpretation risk'
  return 'No secondary vulnerability visible'
}

function deriveStabilityThesis(
  input: ContinuityTrustInput,
  reading: EnterpriseTrustReading,
) {
  if (reading === 'STRUCTURALLY UNTRUSTED') {
    return 'Operational improvement may be visible, but institutional stability is not yet credible.'
  }

  if (reading === 'NOT YET TRUSTED') {
    return 'The institution may be moving toward stabilization, but leadership should not restore full confidence yet.'
  }

  if (reading === 'CONDITIONALLY TRUSTED') {
    return 'Stability may be accepted conditionally if evidence, recurrence memory, and unresolved risk remain attached.'
  }

  if (reading === 'TRUSTED') {
    return 'Continuity is currently trusted and no major executive restriction is visible.'
  }

  return input.posture === 'EXECUTIVE CENTER CLEAR'
    ? 'No active stability decision is currently required.'
    : 'Stability requires continued executive interpretation.'
}

function deriveCeoSentence(
  input: ContinuityTrustInput,
  reading: EnterpriseTrustReading,
) {
  if (reading === 'STRUCTURALLY UNTRUSTED') {
    return 'Do not restore confidence yet; the instability may be structural, distributed, and not fully resolved.'
  }

  if (reading === 'NOT YET TRUSTED') {
    return 'Keep this visible until ownership, evidence, recovery, and command meaning are stronger.'
  }

  if (reading === 'CONDITIONALLY TRUSTED') {
    return 'Accept progress, but preserve memory and evidence before reducing visibility.'
  }

  if (input.posture === 'EXECUTIVE CENTER CLEAR') {
    return 'No active executive intervention is required, but memory remains available.'
  }

  return 'Continue executive interpretation until continuity confidence is clear.'
}

function deriveExecutiveDecision(
  input: ContinuityTrustInput,
  reading: EnterpriseTrustReading,
) {
  if (reading === 'STRUCTURALLY UNTRUSTED') {
    return 'Hold executive visibility and require cross-site, audit, and memory preservation.'
  }

  if (reading === 'NOT YET TRUSTED') {
    return 'Require evidence strengthening before reducing command or executive visibility.'
  }

  if (reading === 'CONDITIONALLY TRUSTED') {
    return 'Allow cautious movement toward stability absorption with memory preserved.'
  }

  if (input.activeInstability === 0) {
    return 'Maintain monitoring without manufacturing escalation.'
  }

  return 'Continue governed lifecycle movement.'
}

function deriveBoardWarning(
  input: ContinuityTrustInput,
  reading: EnterpriseTrustReading,
) {
  if (reading === 'STRUCTURALLY UNTRUSTED') {
    return 'The board should not confuse local recovery with enterprise stability.'
  }

  if (reading === 'NOT YET TRUSTED') {
    return 'The board should require evidence before accepting stability claims.'
  }

  if (reading === 'CONDITIONALLY TRUSTED') {
    return 'The board can accept progress only with memory and audit trail attached.'
  }

  if (input.posture === 'EXECUTIVE CENTER CLEAR') {
    return 'No board-level warning is currently active.'
  }

  return 'Board interpretation should remain evidence-aware.'
}

function deriveInstitutionalMeaning(input: ContinuityTrustInput) {
  if (input.crossSitePressure > 1) {
    return 'The institution may be carrying a structural continuity exposure rather than an isolated operational issue.'
  }

  if (input.coordinationPressure > 0) {
    return 'The institution needs stronger synchronization discipline before continuity confidence can be restored.'
  }

  if (input.commandPressure > 0) {
    return 'The institution still needs leadership attention because command pressure has not resolved into trusted stability.'
  }

  if (input.fragileRecovery > 0) {
    return 'The institution is improving, but improvement is not yet the same as durable stability.'
  }

  if (input.absorbable > 0) {
    return 'The institution can absorb stability while preserving the lesson that produced the instability.'
  }

  return 'The institution currently shows no executive continuity pressure requiring leadership intervention.'
}

function deriveFinalInterpretation(
  input: ContinuityTrustInput,
  reading: EnterpriseTrustReading,
) {
  if (reading === 'STRUCTURALLY UNTRUSTED') {
    return 'The institution may be seeing operational relief, but CGI is preserving the deeper continuity concern: distributed exposure can survive visible recovery.'
  }

  if (reading === 'NOT YET TRUSTED') {
    return 'The institution is not yet ready to treat improvement as stability because unresolved evidence, recovery, command, or coordination signals remain visible.'
  }

  if (reading === 'CONDITIONALLY TRUSTED') {
    return 'The institution can cautiously move forward, but CGI must preserve recurrence history, evidence meaning, and audit reconstructability.'
  }

  return 'Executive Center is not manufacturing urgency. It remains ready to synthesize future instability when evidence appears.'
}