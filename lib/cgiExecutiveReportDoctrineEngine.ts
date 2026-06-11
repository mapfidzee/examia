import { buildContinuityDerivationStandard } from '@/lib/cgiContinuityDerivationStandard'
import {
  buildContinuityTrustAssessment,
  type ContinuityTrustAssessment,
  type ContinuityTrustInput,
} from '@/lib/cgiContinuityTrustEngine'
import type { buildCGIDemoScenario } from '@/lib/cgiDemoScenarioEngine'

export type StabilityDecision =
  | 'DO_NOT_TRUST_STABILITY'
  | 'CONDITIONAL_STABILITY'
  | 'STABILITY_ABSORPTION_READY'

export type StabilityBoardEligibility =
  | 'NOT_ELIGIBLE'
  | 'CONDITIONALLY_ELIGIBLE'
  | 'READY_FOR_ABSORPTION'

export type ExecutiveConclusionReport = {
  classification: string
  title: string
  caseId: string
  subject: string
  currentPosture: string
  trajectory: string
  trustReading: string
  trustLevel: string
  stabilityDecision: StabilityDecision
  stabilityBoardEligibility: StabilityBoardEligibility
  enterpriseConclusion: string
  institutionalStabilityDecision: string
  ceoSentence: string
  boardBrief: string
  executiveRecommendation: string
  primaryVulnerability: string
  secondaryVulnerability: string
  dominantConcern: string
  requiredExecutiveAction: string
  requiredEvidence: string
  continuityStandard: {
    whatIsVisible: string
    whyItMatters: string
    continuityRisk: string
    requiredMovement: string
    trustLevel: string
    institutionalMeaning: string
  }
  memoryTransfer: {
    structuralLesson: string
    recurrenceRisk: string
    durabilityStatus: string
    evidenceStatus: string
    institutionalLearning: string
  }
  auditConfidence: string
  auditMeaning: string
  executiveSummary: string
  copyReadySummary: string
  copyReadyReport: string
}

type DemoScenario = ReturnType<typeof buildCGIDemoScenario>

export function buildExecutiveConclusionReport(
  featured: DemoScenario,
): ExecutiveConclusionReport {
  const pilotThread = featured.pilotThread

  const trustInput = buildReportTrustInput(featured)
  const trustAssessment = buildContinuityTrustAssessment(trustInput)

  const derivationStandard = buildContinuityDerivationStandard({
    ...trustInput,
    visibleSignal: 'Cross-site supplier concentration exposure',
    stage: 'Executive Report',
    posture: featured.derivation.executivePosture,
    currentMeaning:
      'Recovery is visible, but supplier concentration continues to create cross-site continuity exposure.',
    nextMovement: trustAssessment.executiveDecision,
  })

  const classification = 'INSTITUTIONAL_CONTINUITY_CONCLUSION_REPORT'
  const title = 'Institutional Continuity Conclusion Report'

  const stabilityDecision = deriveStabilityDecision(trustAssessment)
  const stabilityBoardEligibility =
    deriveStabilityBoardEligibility(trustAssessment)

  const enterpriseConclusion = trustAssessment.finalInterpretation
  const institutionalStabilityDecision = trustAssessment.stabilityThesis
  const ceoSentence = trustAssessment.ceoSentence
  const boardBrief = trustAssessment.boardLevelWarning
  const executiveRecommendation = trustAssessment.executiveDecision
  const primaryVulnerability = trustAssessment.primaryVulnerability
  const secondaryVulnerability = trustAssessment.secondaryVulnerability
  const dominantConcern = deriveDominantConcern(trustAssessment)
  const requiredExecutiveAction = trustAssessment.executiveDecision

  const requiredEvidence =
    'Request record, triage decision, case history, routing owner, intervention actions, outcome verification, recovery evidence, command rationale, coordination handoff, cross-site pattern, situation room reading, executive center thesis, executive report, memory statement, and audit trace.'

  const memoryTransfer = {
    structuralLesson:
      'Supplier concentration created enterprise exposure across North, South, and East operations.',
    recurrenceRisk:
      trustInput.recurrenceVisible > 0
        ? 'Moderate. Recurrence remains possible until supplier alternatives and durability evidence are proven.'
        : 'Low to moderate. Recurrence memory should remain attached until durability is confirmed.',
    durabilityStatus:
      trustInput.fragileRecovery > 0
        ? 'Partial. Recovery is visible, but durability remains conditional.'
        : 'Conditionally absorbable with evidence and memory preserved.',
    evidenceStatus: trustAssessment.trustMeaning,
    institutionalLearning: trustAssessment.institutionalMeaning,
  }

  const auditConfidence =
    'YES. The conclusion can be reconstructed from request through audit.'

  const auditMeaning =
    'Audit must preserve the conclusion path without forcing the executive report to repeat every operational detail. The report should retain enough chain evidence to prove why the institutional decision was made.'

  const executiveSummary =
    'Repeated fuel logistics disruption was governed as a continuity event, not treated as isolated operational noise. CGI preserved the chain from first report through recovery, command visibility, coordination, cross-site interpretation, situation room synthesis, executive center thesis, institutional conclusion, memory transfer, and audit reconstruction.'

  const continuityStandard = {
    whatIsVisible: derivationStandard.whatIsVisible,
    whyItMatters: derivationStandard.whyItMatters,
    continuityRisk: derivationStandard.continuityRisk,
    requiredMovement: derivationStandard.requiredMovement,
    trustLevel: derivationStandard.trustLevel,
    institutionalMeaning: derivationStandard.institutionalMeaning,
  }

  const copyReadySummary = [
    'TSINAXA CGI Executive Report Summary',
    '',
    `Case: ${pilotThread.scenarioName}`,
    `Case ID: ${pilotThread.caseId}`,
    `Trust Reading: ${trustAssessment.trustReading}`,
    `Trust Level: ${trustAssessment.trustLevel}`,
    `Stability Decision: ${stabilityDecision}`,
    `Stability Board Eligibility: ${stabilityBoardEligibility}`,
    '',
    `Enterprise Continuity Conclusion: ${enterpriseConclusion}`,
    '',
    `CEO Sentence: ${ceoSentence}`,
    '',
    `Executive Recommendation: ${executiveRecommendation}`,
    '',
    `Board Brief: ${boardBrief}`,
  ].join('\n')

  const copyReadyReport = [
    'TSINAXA CGI Institutional Continuity Conclusion Report',
    '',
    `Report Classification: ${classification}`,
    `Case ID: ${pilotThread.caseId}`,
    `Report Subject: ${pilotThread.scenarioName}`,
    `Current Continuity Posture: ${featured.derivation.executivePosture}`,
    `Continuity Condition: ${featured.derivation.continuityCondition}`,
    `Trust Reading: ${trustAssessment.trustReading}`,
    `Trust Level: ${trustAssessment.trustLevel}`,
    `Stability Decision: ${stabilityDecision}`,
    `Stability Board Eligibility: ${stabilityBoardEligibility}`,
    '',
    'Continuity Derivation Standard:',
    `- What Is Visible: ${continuityStandard.whatIsVisible}`,
    `- Why It Matters: ${continuityStandard.whyItMatters}`,
    `- Continuity Risk: ${continuityStandard.continuityRisk}`,
    `- Required Movement: ${continuityStandard.requiredMovement}`,
    `- Trust Level: ${continuityStandard.trustLevel}`,
    `- Institutional Meaning: ${continuityStandard.institutionalMeaning}`,
    '',
    `Enterprise Continuity Conclusion: ${enterpriseConclusion}`,
    '',
    `Institutional Stability Decision: ${institutionalStabilityDecision}`,
    '',
    `CEO Sentence: ${ceoSentence}`,
    '',
    `Board Brief: ${boardBrief}`,
    '',
    `Executive Recommendation: ${executiveRecommendation}`,
    '',
    `Primary Vulnerability: ${primaryVulnerability}`,
    '',
    `Secondary Vulnerability: ${secondaryVulnerability}`,
    '',
    `Dominant Concern: ${dominantConcern}`,
    '',
    `Required Executive Action: ${requiredExecutiveAction}`,
    '',
    `Required Evidence: ${requiredEvidence}`,
    '',
    'Memory Transfer Package:',
    `- Structural Lesson: ${memoryTransfer.structuralLesson}`,
    `- Recurrence Risk: ${memoryTransfer.recurrenceRisk}`,
    `- Durability Status: ${memoryTransfer.durabilityStatus}`,
    `- Evidence Status: ${memoryTransfer.evidenceStatus}`,
    `- Institutional Learning: ${memoryTransfer.institutionalLearning}`,
    '',
    `Audit Confidence: ${auditConfidence}`,
    '',
    `Audit Meaning: ${auditMeaning}`,
    '',
    'Continuity Chain Evidence:',
    ...pilotThread.chain.map(
      (stage, index) =>
        `${index + 1}. ${formatLabel(stage.stage)} — ${stage.executiveFinding}`,
    ),
  ].join('\n')

  return {
    classification,
    title,
    caseId: pilotThread.caseId,
    subject: pilotThread.scenarioName,
    currentPosture: featured.derivation.executivePosture,
    trajectory: 'ELEVATED WATCH',
    trustReading: trustAssessment.trustReading,
    trustLevel: trustAssessment.trustLevel,
    stabilityDecision,
    stabilityBoardEligibility,
    enterpriseConclusion,
    institutionalStabilityDecision,
    ceoSentence,
    boardBrief,
    executiveRecommendation,
    primaryVulnerability,
    secondaryVulnerability,
    dominantConcern,
    requiredExecutiveAction,
    requiredEvidence,
    continuityStandard,
    memoryTransfer,
    auditConfidence,
    auditMeaning,
    executiveSummary,
    copyReadySummary,
    copyReadyReport,
  }
}

function buildReportTrustInput(featured: DemoScenario): ContinuityTrustInput {
  return {
    activeInstability: 0,
    recoveryRecords: 1,
    fragileRecovery: 1,
    commandPressure: 0,
    evidenceReturn: 0,
    absorbable: 1,
    historicalMemory: featured.pilotThread.chain.length,
    recurrenceVisible: 1,
    coordinationPressure: 1,
    crossSitePressure: featured.pilotThread.sites.length,
    auditPressure: 1,
    safeguardingVisible: 0,
    posture: featured.derivation.executivePosture,
  }
}

function deriveStabilityDecision(
  trustAssessment: ContinuityTrustAssessment,
): StabilityDecision {
  if (
    trustAssessment.trustReading === 'STRUCTURALLY UNTRUSTED' ||
    trustAssessment.trustReading === 'NOT YET TRUSTED'
  ) {
    return 'DO_NOT_TRUST_STABILITY'
  }

  if (trustAssessment.trustReading === 'CONDITIONALLY TRUSTED') {
    return 'CONDITIONAL_STABILITY'
  }

  return 'STABILITY_ABSORPTION_READY'
}

function deriveStabilityBoardEligibility(
  trustAssessment: ContinuityTrustAssessment,
): StabilityBoardEligibility {
  if (
    trustAssessment.trustReading === 'STRUCTURALLY UNTRUSTED' ||
    trustAssessment.trustReading === 'NOT YET TRUSTED'
  ) {
    return 'NOT_ELIGIBLE'
  }

  if (trustAssessment.trustReading === 'CONDITIONALLY TRUSTED') {
    return 'CONDITIONALLY_ELIGIBLE'
  }

  return 'READY_FOR_ABSORPTION'
}

function deriveDominantConcern(trustAssessment: ContinuityTrustAssessment) {
  if (trustAssessment.primaryVulnerability !== 'No active vulnerability visible') {
    return trustAssessment.primaryVulnerability
  }

  return trustAssessment.secondaryVulnerability
}

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ')
}