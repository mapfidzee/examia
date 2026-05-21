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
  const driver = input.command.primaryDriver

  if (condition === 'SURVIVABILITY_THREAT') {
    return `${driver} The institution is moving beyond routine operational containment. Executive stabilization oversight is required before survivability weakens further.`
  }

  if (condition === 'RECURRENCE_RISK') {
    return `${driver} The repeated pattern suggests the institution may be cycling through instability instead of reaching dependable stabilization.`
  }

  if (condition === 'FRAGILE_RECOVERY') {
    return `${driver} Recovery is visible, but durability is not yet proven. Stabilization must be verified before leadership restores confidence.`
  }

  if (condition === 'ESCALATED_INSTABILITY') {
    return `${driver} The condition has crossed into command relevance. Leadership must control escalation, assign ownership, and require evidence.`
  }

  if (condition === 'ACTIVE_INSTABILITY') {
    return `${driver} Instability is active and must be coordinated before it spreads, repeats, or becomes harder to stabilize.`
  }

  if (condition === 'EARLY_STRAIN') {
    return `${driver} Early strain is visible. Timely action can prevent a larger continuity disruption.`
  }

  return 'The current condition appears stable under available evidence. Monitoring should continue so early strain does not go unseen.'
}

function buildConfidenceInterpretation(input: CGIShellInput): string {
  const confidence = input.derivation.continuityConfidence
  const condition = formatStateLabel(input.derivation.continuityCondition)

  if (confidence === 'CRITICAL') {
    return `${condition} is active and stabilization confidence is critically weakened. Leadership should not assume the institution can self-correct without direct oversight.`
  }

  if (confidence === 'DEGRADING') {
    return `${condition} is active and institutional reliability is weakening. The system is showing signs that stabilization capacity is declining.`
  }

  if (confidence === 'FRAGILE') {
    return `${condition} is active and confidence remains fragile because recovery or containment has not yet proven durability.`
  }

  if (confidence === 'GUARDED') {
    return `${condition} is active. Confidence exists, but leadership should continue close review until pressure, recurrence, or recovery uncertainty reduces.`
  }

  return 'Confidence is high because current evidence does not show serious instability, recurrence, or survivability pressure.'
}

function buildRecoveryInterpretation(input: CGIShellInput): string {
  const recovery = input.derivation.recoveryCredibility
  const condition = input.derivation.continuityCondition

  if (recovery === 'DURABLE') {
    return 'Recovery has held strongly enough to support restored confidence, provided monitoring continues and recurrence remains absent.'
  }

  if (recovery === 'CREDIBLE') {
    return 'Recovery activity appears operationally credible, but stabilization durability remains unverified under the current condition.'
  }

  if (recovery === 'PARTIAL') {
    return 'Recovery is incomplete. Leadership should treat stabilization as unfinished until pressure reduces and evidence confirms progress.'
  }

  if (recovery === 'EMERGING') {
    return 'Recovery activity has started, but it has not yet proven that the institution can sustain stabilization under pressure.'
  }

  if (condition === 'SURVIVABILITY_THREAT') {
    return 'Recovery is not yet verified while survivability pressure remains active. Executive protection of continuity is required.'
  }

  return 'Recovery has not yet been verified. The institution should not restore confidence until stabilization evidence is visible.'
}

function buildRecurrenceInterpretation(input: CGIShellInput): string {
  const recurrence = input.derivation.recurrenceSeverity

  if (recurrence === 'SYSTEMIC') {
    return 'Instability is broad enough to suggest system-level weakness. This should be treated as a continuity governance concern, not an isolated event.'
  }

  if (recurrence === 'STRUCTURAL') {
    return 'Repeated instability suggests a structural driver may be present. Leadership should investigate why the same pressure keeps returning.'
  }

  if (recurrence === 'PATTERNED') {
    return 'Instability is forming a recognizable pattern. CGI should preserve memory and prevent false closure.'
  }

  if (recurrence === 'RECURRING') {
    return 'Instability has repeated and should no longer be treated as fully isolated. Continued monitoring and prevention action are required.'
  }

  return 'No serious recurrence pattern is currently dominant. Continue monitoring for early repeat signals.'
}

function buildCommandInterpretation(input: CGIShellInput): string {
  const posture = input.derivation.executivePosture

  if (posture === 'EXECUTIVE_INTERVENTION') {
    return 'Operational containment is no longer sufficient. Executive leadership must directly coordinate stabilization, enforce accountability, and verify continuity protection actions.'
  }

  if (posture === 'COMMAND') {
    return 'Command-level control is required. Leadership must assign ownership, set action deadlines, and monitor evidence until escalation pressure reduces.'
  }

  if (posture === 'REINFORCE') {
    return 'The institution should reinforce the stabilization pathway because recurrence or structural weakness may undermine recovery.'
  }

  if (posture === 'VERIFY') {
    return 'Leadership should verify recovery before restoring confidence. The system is warning against premature closure.'
  }

  if (posture === 'COORDINATE') {
    return 'Operational coordination is required now to prevent active instability from spreading or hardening into a larger continuity problem.'
  }

  if (posture === 'PREPARE') {
    return 'Early preparation is required. Leadership should act before strain matures into visible disruption.'
  }

  return 'Routine monitoring is appropriate because current evidence does not require escalation, reinforcement, or executive intervention.'
}

function buildExecutiveSummary(input: CGIShellInput): string {
  return [
    input.command.dominantTruth,
    input.command.primaryDriver,
    `Executive posture is ${formatStateLabel(input.derivation.executivePosture)}.`,
    buildCommandInterpretation(input),
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
        'This is the compressed operational truth leadership should understand before reviewing supporting detail.',
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
      interpretation: buildCommandInterpretation(input),
    },
    requiredActionPanel: {
      label: 'Required Action',
      value: input.command.requiredAction,
      interpretation:
        'This is the action required to protect stabilization reliability under the current condition.',
    },
    evidencePanel: {
      label: 'Required Evidence',
      value: input.command.requiredEvidence,
      interpretation:
        'CGI requires evidence before treating recovery, containment, or pressure reduction as credible stabilization.',
    },
    riskPanel: {
      label: 'Consequence If Unresolved',
      value: input.command.consequenceIfUnresolved,
      interpretation:
        'This explains what may weaken if the current condition is not governed quickly enough.',
    },
    executiveSummary: buildExecutiveSummary(input),
    shellDoctrine:
      'Visible recovery is not the same as durable stabilization. CGI governs continuity credibility under pressure.',
  }
}