import { buildContinuityDerivationStandard } from './cgiContinuityDerivationStandard'
import { buildContinuityTrustAssessment } from './cgiContinuityTrustEngine'
import type {
  ContinuityTrustAssessment,
  ContinuityTrustInput,
} from './cgiContinuityTrustEngine'
import {
  buildCGICrossRouteContinuitySynthesis,
  type CGICrossRouteContinuitySynthesis,
  type CGIRouteSynthesisInput,
} from './cgiCrossRouteContinuitySynthesisEngine'

export type CGIExecutiveBriefing = {
  title: string
  classification: string
  coreQuestion: string
  executiveSummary: string
  synthesis: CGICrossRouteContinuitySynthesis
  continuityReading: string
  dominantConcern: string
  executiveMeaning: string
  requiredExecutiveAction: string
  requiredEvidence: string
  governanceSafeMeaning: string
  trustAssessment: ContinuityTrustAssessment
  continuityStandard: {
    whatIsVisible: string
    whyItMatters: string
    continuityRisk: string
    requiredMovement: string
    trustLevel: string
    institutionalMeaning: string
  }
  briefingSections: {
    label: string
    content: string
  }[]
  copyReadyBrief: string
}

export function buildCGIExecutiveBriefing(
  input: CGIRouteSynthesisInput,
): CGIExecutiveBriefing {
  const synthesis = buildCGICrossRouteContinuitySynthesis(input)

  const trustInput = buildBriefingTrustInput(input, synthesis)
  const trustAssessment = buildContinuityTrustAssessment(trustInput)

  const derivation = buildContinuityDerivationStandard({
    ...trustInput,
    visibleSignal: deriveVisibleSignal(input, synthesis),
    stage: 'Executive Briefing',
    posture: String(synthesis.synthesisPosture),
    currentMeaning: synthesis.executiveMeaning,
    nextMovement: trustAssessment.executiveDecision,
  })

  const continuityStandard = {
    whatIsVisible: derivation.whatIsVisible,
    whyItMatters: derivation.whyItMatters,
    continuityRisk: derivation.continuityRisk,
    requiredMovement: derivation.requiredMovement,
    trustLevel: derivation.trustLevel,
    institutionalMeaning: derivation.institutionalMeaning,
  }

  const continuityReading = trustAssessment.trustReading
  const dominantConcern = trustAssessment.primaryVulnerability
  const executiveMeaning = trustAssessment.institutionalMeaning
  const requiredExecutiveAction = trustAssessment.executiveDecision
  const requiredEvidence = deriveRequiredEvidence({
    synthesis,
    trustAssessment,
    continuityRisk: continuityStandard.continuityRisk,
  })
  const governanceSafeMeaning = [
    synthesis.governanceSafeInterpretation,
    trustAssessment.trustMeaning,
  ].join(' ')

  const executiveSummary = [
    trustAssessment.ceoSentence,
    trustAssessment.finalInterpretation,
  ].join(' ')

  const briefingSections = [
    {
      label: 'Continuity Reading',
      content: continuityReading,
    },
    {
      label: 'Continuity Derivation Standard',
      content: [
        `What is visible: ${continuityStandard.whatIsVisible}`,
        `Why it matters: ${continuityStandard.whyItMatters}`,
        `Continuity risk: ${continuityStandard.continuityRisk}`,
        `Required movement: ${continuityStandard.requiredMovement}`,
        `Trust level: ${continuityStandard.trustLevel}`,
        `Institutional meaning: ${continuityStandard.institutionalMeaning}`,
      ].join('\n'),
    },
    {
      label: 'Dominant Concern',
      content: dominantConcern,
    },
    {
      label: 'Executive Meaning',
      content: executiveMeaning,
    },
    {
      label: 'Required Executive Action',
      content: requiredExecutiveAction,
    },
    {
      label: 'Required Stabilization Evidence',
      content: requiredEvidence,
    },
    {
      label: 'Governance-Safe Interpretation',
      content: governanceSafeMeaning,
    },
  ]

  const copyReadyBrief = `
TSINAXA CGI EXECUTIVE CONTINUITY BRIEF

Classification:
Executive Continuity Intelligence

Core Question:
${synthesis.continuityTrustQuestion}

Continuity Reading:
${continuityReading}

Trust Level:
${trustAssessment.trustLevel}

What Is Visible:
${continuityStandard.whatIsVisible}

Why It Matters:
${continuityStandard.whyItMatters}

Continuity Risk:
${continuityStandard.continuityRisk}

Dominant Concern:
${dominantConcern}

Executive Meaning:
${executiveMeaning}

Required Executive Action:
${requiredExecutiveAction}

Required Stabilization Evidence:
${requiredEvidence}

Governance-Safe Meaning:
${governanceSafeMeaning}

Board-Level Warning:
${trustAssessment.boardLevelWarning}

CEO Sentence:
${trustAssessment.ceoSentence}

Synthesis Posture:
${synthesis.synthesisPosture}
  `.trim()

  return {
    title: 'TSINAXA CGI Executive Continuity Brief',
    classification: 'Executive Continuity Intelligence',
    coreQuestion: synthesis.continuityTrustQuestion,
    executiveSummary,
    synthesis,
    continuityReading,
    dominantConcern,
    executiveMeaning,
    requiredExecutiveAction,
    requiredEvidence,
    governanceSafeMeaning,
    trustAssessment,
    continuityStandard,
    briefingSections,
    copyReadyBrief,
  }
}

function buildBriefingTrustInput(
  input: CGIRouteSynthesisInput,
  synthesis: CGICrossRouteContinuitySynthesis,
): ContinuityTrustInput {
  const unresolvedCriticalCount = getNumber(input, 'unresolvedCriticalCount')
  const escalatedCases = getNumber(input, 'escalatedCases')
  const repeatedInstabilityCount = getNumber(input, 'repeatedInstabilityCount')
  const recoveryFailures = getNumber(input, 'recoveryFailures')
  const verifiedRecoveries = getNumber(input, 'verifiedRecoveries')
  const coordinationIssues = getNumber(input, 'coordinationIssues')
  const crossSiteSignals = getNumber(input, 'crossSiteSignals')
  const commandReviews = getNumber(input, 'commandReviews')
  const auditGaps = getNumber(input, 'auditGaps')
  const openCases = getNumber(input, 'openCases')

  const evidenceVerified = getBoolean(input, 'evidenceVerified')
  const structuralMemoryVisible = getBoolean(input, 'structuralMemoryVisible')

  return {
    activeInstability: openCases + escalatedCases + unresolvedCriticalCount,
    recoveryRecords: verifiedRecoveries + recoveryFailures,
    fragileRecovery: recoveryFailures,
    commandPressure: commandReviews + escalatedCases + unresolvedCriticalCount,
    evidenceReturn: evidenceVerified ? 0 : Math.max(1, auditGaps),
    absorbable:
      verifiedRecoveries > 0 &&
      recoveryFailures === 0 &&
      escalatedCases === 0 &&
      unresolvedCriticalCount === 0 &&
      auditGaps === 0
        ? 1
        : 0,
    historicalMemory: structuralMemoryVisible ? Math.max(1, repeatedInstabilityCount) : 0,
    recurrenceVisible: repeatedInstabilityCount,
    coordinationPressure: coordinationIssues,
    crossSitePressure: crossSiteSignals,
    auditPressure: auditGaps,
    safeguardingVisible: unresolvedCriticalCount,
    posture: String(synthesis.synthesisPosture),
  }
}

function deriveVisibleSignal(
  input: CGIRouteSynthesisInput,
  synthesis: CGICrossRouteContinuitySynthesis,
) {
  if (getNumber(input, 'crossSiteSignals') > 0) {
    return 'Cross-route continuity exposure'
  }

  if (getNumber(input, 'commandReviews') > 0 || getNumber(input, 'escalatedCases') > 0) {
    return 'Command-visible continuity pressure'
  }

  if (getNumber(input, 'recoveryFailures') > 0) {
    return 'Recovery durability weakness'
  }

  if (getNumber(input, 'repeatedInstabilityCount') > 0) {
    return 'Recurring instability pattern'
  }

  if (getNumber(input, 'coordinationIssues') > 0) {
    return 'Coordination pressure'
  }

  if (getNumber(input, 'auditGaps') > 0 || !getBoolean(input, 'evidenceVerified')) {
    return 'Evidence credibility gap'
  }

  if (getNumber(input, 'verifiedRecoveries') > 0) {
    return 'Verified recovery signal'
  }

  return `Synthesis posture: ${synthesis.synthesisPosture}`
}

function deriveRequiredEvidence({
  synthesis,
  trustAssessment,
  continuityRisk,
}: {
  synthesis: CGICrossRouteContinuitySynthesis
  trustAssessment: ContinuityTrustAssessment
  continuityRisk: string
}) {
  if (trustAssessment.trustLevel === 'WITHHELD') {
    return [
      synthesis.requiredEvidence,
      'Cross-route evidence, recurrence history, audit reconstruction, and executive rationale must remain attached before stability is trusted.',
    ].join(' ')
  }

  if (trustAssessment.trustLevel === 'LOW') {
    return [
      synthesis.requiredEvidence,
      `Additional evidence is required because current continuity risk is ${continuityRisk}.`,
    ].join(' ')
  }

  if (trustAssessment.trustLevel === 'CONDITIONAL') {
    return [
      synthesis.requiredEvidence,
      'Preserve memory, recurrence signals, and stabilization proof before reducing visibility.',
    ].join(' ')
  }

  return synthesis.requiredEvidence
}

function getNumber(input: CGIRouteSynthesisInput, key: string) {
  const value = (input as Record<string, unknown>)[key]

  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }

  return 0
}

function getBoolean(input: CGIRouteSynthesisInput, key: string) {
  const value = (input as Record<string, unknown>)[key]

  if (typeof value === 'boolean') return value

  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }

  return false
}