import type { CGIDerivationOutput } from './cgiDerivationEngine'
import type { CGITransitionDecision } from './cgiContinuityStateEngine'
import type { CGICommandOutput } from './cgiExecutiveCommandEngine'

export type CGIShellSeverityTone =
  | 'CALM'
  | 'WATCH'
  | 'CAUTION'
  | 'COMMAND'
  | 'CRITICAL'

export type CGIShellPanel = {
  label: string
  value: string
  interpretation: string
}

export type CGIUnifiedExecutiveShell = {
  systemTitle: string
  systemSubtitle: string
  executiveHeadline: string
  severityTone: CGIShellSeverityTone
  dominantTruthPanel: CGIShellPanel
  continuityPanel: CGIShellPanel
  confidencePanel: CGIShellPanel
  recoveryPanel: CGIShellPanel
  recurrencePanel: CGIShellPanel
  commandPanel: CGIShellPanel
  requiredActionPanel: CGIShellPanel
  evidencePanel: CGIShellPanel
  riskPanel: CGIShellPanel
  executiveSummary: string
  shellDoctrine: string
}

export type CGIShellInput = {
  derivation: CGIDerivationOutput
  stateDecision: CGITransitionDecision
  command: CGICommandOutput
}

function deriveSeverityTone(input: CGIShellInput): CGIShellSeverityTone {
  const condition = input.derivation.continuityCondition
  const pressure = input.derivation.survivabilityPressure
  const confidence = input.derivation.continuityConfidence

  if (
    condition === 'SURVIVABILITY_THREAT' ||
    pressure === 'SEVERE' ||
    confidence === 'CRITICAL'
  ) {
    return 'CRITICAL'
  }

  if (
    condition === 'ESCALATED_INSTABILITY' ||
    input.derivation.executivePosture === 'COMMAND' ||
    input.derivation.executivePosture === 'EXECUTIVE_INTERVENTION'
  ) {
    return 'COMMAND'
  }

  if (
    condition === 'RECURRENCE_RISK' ||
    condition === 'FRAGILE_RECOVERY' ||
    confidence === 'DEGRADING' ||
    confidence === 'FRAGILE'
  ) {
    return 'CAUTION'
  }

  if (
    condition === 'EARLY_STRAIN' ||
    condition === 'ACTIVE_INSTABILITY' ||
    pressure === 'ELEVATED' ||
    pressure === 'SERIOUS'
  ) {
    return 'WATCH'
  }

  return 'CALM'
}

function formatStateLabel(value: string): string {
  return value.replaceAll('_', ' ')
}

function buildExecutiveHeadline(input: CGIShellInput): string {
  const condition = formatStateLabel(input.derivation.continuityCondition)
  const posture = formatStateLabel(input.derivation.executivePosture)

  return `${condition} · ${posture}`
}

function buildContinuityInterpretation(input: CGIShellInput): string {
  const condition = input.derivation.continuityCondition

  if (condition === 'SURVIVABILITY_THREAT') {
    return 'The institution may not stabilize reliably without executive intervention.'
  }

  if (condition === 'RECURRENCE_RISK') {
    return 'Instability is repeating, which suggests recovery has not yet become structurally durable.'
  }

  if (condition === 'FRAGILE_RECOVERY') {
    return 'Recovery is visible, but CGI has not yet accepted it as durable stabilization.'
  }

  if (condition === 'ESCALATED_INSTABILITY') {
    return 'Instability has crossed into command relevance and requires controlled action.'
  }

  if (condition === 'ACTIVE_INSTABILITY') {
    return 'The institution is actively managing instability and must protect coordination.'
  }

  if (condition === 'EARLY_STRAIN') {
    return 'Early strain is present and should be addressed before visible disruption expands.'
  }

  return 'Continuity is currently stable under the available evidence.'
}

function buildConfidenceInterpretation(input: CGIShellInput): string {
  const confidence = input.derivation.continuityConfidence

  if (confidence === 'CRITICAL') {
    return 'Confidence is critically weakened and requires executive attention.'
  }

  if (confidence === 'DEGRADING') {
    return 'Confidence is weakening because instability patterns are not resolving cleanly.'
  }

  if (confidence === 'FRAGILE') {
    return 'Confidence is fragile because recovery has not yet proven durability.'
  }

  if (confidence === 'GUARDED') {
    return 'Confidence exists, but the condition still requires close review.'
  }

  return 'Confidence is high because no serious continuity weakening is currently visible.'
}

function buildRecoveryInterpretation(input: CGIShellInput): string {
  const recovery = input.derivation.recoveryCredibility

  if (recovery === 'DURABLE') {
    return 'Recovery has enough evidence to be treated as durable.'
  }

  if (recovery === 'CREDIBLE') {
    return 'Recovery appears credible, but continued verification is still required.'
  }

  if (recovery === 'PARTIAL') {
    return 'Recovery is incomplete and should not be treated as stabilization.'
  }

  if (recovery === 'EMERGING') {
    return 'Recovery has started, but its strength is still unproven.'
  }

  return 'Recovery has not yet been verified.'
}

function buildRecurrenceInterpretation(input: CGIShellInput): string {
  const recurrence = input.derivation.recurrenceSeverity

  if (recurrence === 'SYSTEMIC') {
    return 'Instability is broad enough to suggest system-level weakness.'
  }

  if (recurrence === 'STRUCTURAL') {
    return 'Repeated instability suggests a structural driver may be present.'
  }

  if (recurrence === 'PATTERNED') {
    return 'Instability is forming a recognizable pattern.'
  }

  if (recurrence === 'RECURRING') {
    return 'Instability has repeated and should not be treated as isolated.'
  }

  return 'No serious recurrence pattern is currently dominant.'
}

function buildExecutiveSummary(input: CGIShellInput): string {
  return [
    input.command.dominantTruth,
    input.command.primaryDriver,
    `Executive posture is ${formatStateLabel(input.derivation.executivePosture)}.`,
    `Required action: ${input.command.requiredAction}`,
    `Evidence required: ${input.command.requiredEvidence}`,
    `Risk if unresolved: ${input.command.consequenceIfUnresolved}`,
  ].join(' ')
}

export function buildCGIUnifiedExecutiveShell(
  input: CGIShellInput
): CGIUnifiedExecutiveShell {
  const severityTone = deriveSeverityTone(input)

  return {
    systemTitle: 'TSINAXA CGI',
    systemSubtitle: 'Continuity Governance Intelligence',
    executiveHeadline: buildExecutiveHeadline(input),
    severityTone,
    dominantTruthPanel: {
      label: 'Dominant Operational Truth',
      value: input.command.dominantTruth,
      interpretation:
        'This is the compressed truth executives need before reviewing details.',
    },
    continuityPanel: {
      label: 'Continuity Condition',
      value: formatStateLabel(input.derivation.continuityCondition),
      interpretation: buildContinuityInterpretation(input),
    },
    confidencePanel: {
      label: 'Continuity Confidence',
      value: formatStateLabel(input.derivation.continuityConfidence),
      interpretation: buildConfidenceInterpretation(input),
    },
    recoveryPanel: {
      label: 'Recovery Credibility',
      value: formatStateLabel(input.derivation.recoveryCredibility),
      interpretation: buildRecoveryInterpretation(input),
    },
    recurrencePanel: {
      label: 'Recurrence Severity',
      value: formatStateLabel(input.derivation.recurrenceSeverity),
      interpretation: buildRecurrenceInterpretation(input),
    },
    commandPanel: {
      label: 'Executive Posture',
      value: formatStateLabel(input.derivation.executivePosture),
      interpretation:
        'This defines the leadership stance required by the current continuity condition.',
    },
    requiredActionPanel: {
      label: 'Required Action',
      value: input.command.requiredAction,
      interpretation:
        'This converts intelligence into a clear stabilization responsibility.',
    },
    evidencePanel: {
      label: 'Required Evidence',
      value: input.command.requiredEvidence,
      interpretation:
        'CGI does not trust visible recovery until evidence supports stabilization credibility.',
    },
    riskPanel: {
      label: 'Consequence If Unresolved',
      value: input.command.consequenceIfUnresolved,
      interpretation:
        'This explains why delayed action may weaken continuity credibility.',
    },
    executiveSummary: buildExecutiveSummary(input),
    shellDoctrine:
      'Visible recovery is not the same as durable stabilization. CGI governs continuity credibility under pressure.',
  }
}