import { buildContinuityDerivationStandard } from '@/lib/cgiContinuityDerivationStandard'
import {
  buildContinuityTrustAssessment,
  type ContinuityTrustAssessment,
  type ContinuityTrustInput,
} from '@/lib/cgiContinuityTrustEngine'
import type { CGIExecutiveContinuityChain } from '@/lib/cgiExecutiveContinuityChainEngine'

export type StabilityCaseForExecutiveMeaning = {
  id: string
  beneficiary_name: string
  support_domain: string
  case_status: string
  safeguarding_flag: boolean
  region: string | null
  institution_name: string | null
  outcome_summary: string | null
}

export type OutcomeRecordForExecutiveMeaning = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
}

export type CgiOperationalMetricForExecutiveMeaning = {
  id: string
}

export type ExecutivePosture =
  | 'EXECUTIVE CENTER CLEAR'
  | 'ACTIVE CONTINUITY WATCH'
  | 'RECOVERY WATCH'
  | 'EVIDENCE REVIEW REQUIRED'
  | 'EXECUTIVE REVIEW REQUIRED'
  | 'STABILITY ABSORPTION READY'

export type RecoveryDisposition =
  | 'MOVE_TO_STABILITY_BOARD'
  | 'MOVE_TO_COMMAND_WATCH'
  | 'MOVE_TO_COMMAND_ESCALATION'
  | 'RETURN_TO_OUTCOMES_REVIEW'
  | 'RETURN_TO_INTERVENTION_REVIEW'
  | 'CONTINUE_RECOVERY_MONITORING'
  | 'NO_RECOVERY_DISPOSITION'

export type RecoveryMemoryRecord = {
  caseItem: StabilityCaseForExecutiveMeaning
  latestRecoveryReview?: OutcomeRecordForExecutiveMeaning
  disposition: RecoveryDisposition
  durabilityResult: string
  commandPosture: string
  recoveryConfidence: string
  memoryImpact: string
  movementReason: string
}

export type ExecutiveSynthesis = ContinuityTrustInput & {
  posture: ExecutivePosture
  meaning: string
  executiveQuestion: string
  whatIsHappening: string
  nextMovement: string
  leadershipAction: string
  memoryStatus: string
  evidenceStatus: string
  recoveryCredibility: string
  survivabilityMeaning: string
  stabilized: number
}

export type EnterpriseContinuityReading = {
  continuityThesis: string
  institutionalMeaning: string
  trustReading: ContinuityTrustAssessment['trustReading']
  trustMeaning: string
  trustLevel: ContinuityTrustAssessment['trustLevel']
  primaryVulnerability: string
  secondaryVulnerability: string
  stabilityThesis: string
  ceoSentence: string
  executiveDecision: string
  boardLevelWarning: string
  finalInterpretation: string
  whatIsVisible: string
  whyItMatters: string
  continuityRisk: string
  requiredMovement: string
}

const ACTIVE_CASE_STATUSES = [
  'NEW',
  'TRIAGE',
  'UNDER_REVIEW',
  'ROUTED',
  'RESPONDER_ASSIGNED',
  'INTERVENTION_ACTIVE',
  'FOLLOW_UP_REQUIRED',
  'REOPENED',
  'RECOVERY_MONITORING',
  'PARTIAL_STABILIZATION',
  'IMPROVING',
  'ACTION_ACTIVE',
  'ROUTING_STALLED',
  'OWNERSHIP_CLARITY_REQUIRED',
]

export function buildRecoveryMemoryRecords(
  cases: StabilityCaseForExecutiveMeaning[],
  outcomes: OutcomeRecordForExecutiveMeaning[],
): RecoveryMemoryRecord[] {
  const records: RecoveryMemoryRecord[] = []

  cases.forEach((caseItem) => {
    const caseOutcomes = outcomes.filter(
      (outcome) => outcome.case_id === caseItem.id,
    )

    const latestRecoveryReview = caseOutcomes.find((outcome) =>
      isRecoverySummary(outcome.outcome_summary || ''),
    )

    const summary =
      latestRecoveryReview?.outcome_summary || caseItem.outcome_summary || ''

    if (!summary || !isRecoverySummary(summary)) return

    const disposition =
      (extractField(summary, 'RECOVERY DISPOSITION') ||
        'NO_RECOVERY_DISPOSITION') as RecoveryDisposition

    records.push({
      caseItem,
      latestRecoveryReview,
      disposition,
      durabilityResult:
        extractField(summary, 'DURABILITY RESULT') ||
        latestRecoveryReview?.outcome_status ||
        'DURABILITY_UNRECORDED',
      commandPosture:
        extractField(summary, 'COMMAND POSTURE') || 'COMMAND_POSTURE_UNRECORDED',
      recoveryConfidence:
        extractField(summary, 'RECOVERY CONFIDENCE') ||
        'RECOVERY_CONFIDENCE_UNRECORDED',
      memoryImpact:
        extractField(summary, 'MEMORY IMPACT') || 'MEMORY_IMPACT_UNRECORDED',
      movementReason:
        extractField(summary, 'MOVEMENT REASON') ||
        'Movement reason was not explicitly preserved.',
    })
  })

  return records
}

export function buildExecutiveSynthesis(
  cases: StabilityCaseForExecutiveMeaning[],
  recoveryMemory: RecoveryMemoryRecord[],
  metrics: CgiOperationalMetricForExecutiveMeaning[],
): ExecutiveSynthesis {
  const activeInstability = cases.filter((caseItem) =>
    ACTIVE_CASE_STATUSES.includes(caseItem.case_status),
  ).length

  const stabilized = cases.filter(
    (caseItem) => caseItem.case_status === 'STABILIZED',
  ).length

  const absorbable = recoveryMemory.filter(
    (record) => record.disposition === 'MOVE_TO_STABILITY_BOARD',
  ).length

  const commandPressure = recoveryMemory.filter(
    (record) =>
      record.disposition === 'MOVE_TO_COMMAND_WATCH' ||
      record.disposition === 'MOVE_TO_COMMAND_ESCALATION',
  ).length

  const evidenceReturn = recoveryMemory.filter(
    (record) =>
      record.disposition === 'RETURN_TO_OUTCOMES_REVIEW' ||
      record.disposition === 'RETURN_TO_INTERVENTION_REVIEW',
  ).length

  const fragileRecovery = recoveryMemory.filter(
    (record) =>
      record.disposition === 'CONTINUE_RECOVERY_MONITORING' ||
      record.disposition === 'MOVE_TO_COMMAND_WATCH' ||
      record.disposition === 'RETURN_TO_OUTCOMES_REVIEW' ||
      record.disposition === 'RETURN_TO_INTERVENTION_REVIEW',
  ).length

  const recurrenceVisible = recoveryMemory.filter(
    (record) =>
      record.memoryImpact.includes('RECURRENCE') ||
      record.caseItem.case_status.includes('RECURRENCE') ||
      record.caseItem.case_status === 'REOPENED' ||
      record.durabilityResult.includes('REBURN'),
  ).length

  const coordinationPressure = cases.filter(
    (caseItem) =>
      caseItem.support_domain === 'COORDINATION' ||
      caseItem.case_status === 'ROUTING_STALLED' ||
      caseItem.case_status === 'OWNERSHIP_CLARITY_REQUIRED',
  ).length

  const crossSitePressure = cases.filter(
    (caseItem) =>
      caseItem.region ||
      caseItem.institution_name ||
      caseItem.case_status.includes('RECURRENCE') ||
      caseItem.case_status === 'REOPENED',
  ).length

  const auditPressure = cases.filter(
    (caseItem) =>
      caseItem.safeguarding_flag ||
      caseItem.case_status.includes('ESCALATED') ||
      caseItem.case_status.includes('RECURRENCE') ||
      caseItem.case_status === 'REOPENED',
  ).length

  const safeguardingVisible = cases.filter(
    (caseItem) => caseItem.safeguarding_flag,
  ).length

  let posture: ExecutivePosture = 'EXECUTIVE CENTER CLEAR'
  let meaning =
    'No active lifecycle instability, command pressure, coordination pressure, cross-site exposure, or fragile recovery is currently visible.'
  let executiveQuestion =
    'What must leadership understand before instability is treated as stabilized?'
  let nextMovement =
    'Maintain executive visibility. No governed movement is currently required.'
  let leadershipAction =
    'Continue monitoring without creating artificial pressure. Preserve institutional memory for future recurrence learning.'

  if (crossSitePressure > 1 && (recurrenceVisible > 0 || auditPressure > 0)) {
    posture = 'EXECUTIVE REVIEW REQUIRED'
    meaning =
      'Cross-site or recurring continuity exposure is visible and should not be treated as isolated.'
    executiveQuestion =
      'Can leadership trust continuity if the signal may be distributed across sites?'
    nextMovement =
      'Review cross-site exposure, preserve audit evidence, and determine whether leadership action is required.'
    leadershipAction =
      'Interpret whether continuity pressure is isolated, repeated, or distributed before restoring confidence.'
  } else if (coordinationPressure > 0) {
    posture = 'ACTIVE CONTINUITY WATCH'
    meaning =
      'Coordination pressure is visible and ownership or routing synchronization must remain under executive awareness.'
    executiveQuestion =
      'Can continuity be trusted before ownership and evidence are synchronized?'
    nextMovement =
      'Confirm coordination ownership before moving toward recovery, cross-site review, or stability absorption.'
    leadershipAction =
      'Require clear routing ownership, responder alignment, evidence maturity, and capacity visibility.'
  } else if (commandPressure > 0) {
    posture = 'EXECUTIVE REVIEW REQUIRED'
    meaning =
      'Recovery or command pressure remains visible and should not be treated as resolved.'
    executiveQuestion = 'Does leadership need to intervene before stability is trusted?'
    nextMovement = 'Move through Command before any stability absorption is trusted.'
    leadershipAction =
      'Review command pressure, recurrence signals, recovery durability, and unresolved evidence before allowing final posture.'
  } else if (evidenceReturn > 0) {
    posture = 'EVIDENCE REVIEW REQUIRED'
    meaning =
      'Evidence or intervention credibility is not strong enough to support final stability confidence.'
    executiveQuestion = 'Can the evidence support recovery confidence?'
    nextMovement = 'Return to Outcomes or Interventions for evidence strengthening.'
    leadershipAction = 'Require clearer verification before recovery is treated as durable.'
  } else if (fragileRecovery > 0) {
    posture = 'RECOVERY WATCH'
    meaning =
      'Recovery is visible but still fragile enough to require executive awareness.'
    executiveQuestion = 'Is recovery durable enough to reduce visibility?'
    nextMovement = 'Continue Recovery Watch before stability absorption.'
    leadershipAction =
      'Maintain proportionate visibility until durability and recurrence conditions are clearer.'
  } else if (activeInstability > 0) {
    posture = 'ACTIVE CONTINUITY WATCH'
    meaning =
      'Active lifecycle instability remains visible and should not be hidden by executive summary language.'
    executiveQuestion = 'Is active instability moving through governed action?'
    nextMovement =
      'Continue governed lifecycle movement through cases, routing, intervention, outcomes, recovery, command, and coordination.'
    leadershipAction =
      'Protect visibility, ownership, evidence, and next movement until stabilization is credible.'
  } else if (absorbable > 0) {
    posture = 'STABILITY ABSORPTION READY'
    meaning =
      'Durable recovery evidence is available for institutional absorption while memory remains preserved.'
    executiveQuestion = 'Can recovered instability be absorbed without hiding memory?'
    nextMovement =
      'Move to Stability Board while preserving recurrence history, evidence meaning, and unresolved risk.'
    leadershipAction = 'Absorb final posture without erasing structural memory.'
  }

  return {
    posture,
    meaning,
    executiveQuestion,
    whatIsHappening: deriveWhatIsHappening({
      activeInstability,
      recoveryRecords: recoveryMemory.length,
      commandPressure,
      evidenceReturn,
      fragileRecovery,
      absorbable,
      coordinationPressure,
      crossSitePressure,
      recurrenceVisible,
    }),
    nextMovement,
    leadershipAction,
    memoryStatus: 'MEMORY PRESERVED',
    evidenceStatus:
      evidenceReturn > 0 || auditPressure > 0
        ? 'Evidence must remain reviewable before stability can be trusted.'
        : 'No active evidence gap is currently driving executive posture.',
    recoveryCredibility:
      recoveryMemory.length === 0
        ? 'No active recovery durability review is currently visible.'
        : fragileRecovery > 0 || commandPressure > 0
          ? 'Recovery remains visible but not yet fully durable.'
          : 'Recovery credibility is currently absorbable into institutional posture.',
    survivabilityMeaning:
      commandPressure > 0 ||
      activeInstability > 0 ||
      coordinationPressure > 0 ||
      crossSitePressure > 1
        ? 'Survivability requires continued executive visibility.'
        : 'No current survivability pressure is visible from lifecycle records.',
    activeInstability,
    stabilized,
    recoveryRecords: recoveryMemory.length,
    fragileRecovery,
    commandPressure,
    evidenceReturn,
    absorbable,
    historicalMemory: metrics.length,
    recurrenceVisible,
    coordinationPressure,
    crossSitePressure,
    auditPressure,
    safeguardingVisible,
  }
}

export function buildEnterpriseContinuityReading(
  synthesis: ExecutiveSynthesis,
  chain: CGIExecutiveContinuityChain,
): EnterpriseContinuityReading {
  const trustAssessment = buildContinuityTrustAssessment(synthesis)

  const derivationStandard = buildContinuityDerivationStandard({
    ...synthesis,
    visibleSignal: deriveVisibleSignal(synthesis, chain),
    stage: 'Executive Center',
    posture: synthesis.posture,
    currentMeaning: synthesis.meaning,
    nextMovement: synthesis.nextMovement,
  })

  return {
    continuityThesis: deriveContinuityThesis(synthesis, chain),
    institutionalMeaning: derivationStandard.institutionalMeaning,
    trustReading: trustAssessment.trustReading,
    trustMeaning: trustAssessment.trustMeaning,
    trustLevel: trustAssessment.trustLevel,
    primaryVulnerability: trustAssessment.primaryVulnerability,
    secondaryVulnerability: trustAssessment.secondaryVulnerability,
    stabilityThesis: trustAssessment.stabilityThesis,
    ceoSentence: trustAssessment.ceoSentence,
    executiveDecision: trustAssessment.executiveDecision,
    boardLevelWarning: trustAssessment.boardLevelWarning,
    finalInterpretation: trustAssessment.finalInterpretation,
    whatIsVisible: derivationStandard.whatIsVisible,
    whyItMatters: derivationStandard.whyItMatters,
    continuityRisk: derivationStandard.continuityRisk,
    requiredMovement: derivationStandard.requiredMovement,
  }
}

export function deriveDominantConcern(synthesis: ExecutiveSynthesis) {
  if (synthesis.crossSitePressure > 1 && synthesis.recurrenceVisible > 0) {
    return 'Cross-site recurrence or distributed continuity exposure may be visible.'
  }

  if (synthesis.coordinationPressure > 0) {
    return 'Coordination pressure requires ownership or evidence synchronization.'
  }

  if (synthesis.commandPressure > 0) return 'Command pressure remains unresolved.'
  if (synthesis.evidenceReturn > 0) return 'Evidence requires renewed review.'
  if (synthesis.fragileRecovery > 0) return 'Recovery remains fragile.'
  if (synthesis.activeInstability > 0) return 'Active lifecycle instability remains visible.'
  if (synthesis.absorbable > 0) return 'Stability absorption requires memory preservation.'
  return 'No active executive concern is currently visible.'
}

export function buildCopyReadyExecutiveBrief(
  synthesis: ExecutiveSynthesis,
  chain: CGIExecutiveContinuityChain,
  enterprise: EnterpriseContinuityReading,
) {
  return [
    'TSINAXA CGI Executive Continuity Brief',
    '',
    `Enterprise Continuity Thesis: ${enterprise.continuityThesis}`,
    '',
    `Institutional Stability Thesis: ${enterprise.stabilityThesis}`,
    '',
    `CEO Sentence: ${enterprise.ceoSentence}`,
    '',
    `Trust Reading: ${enterprise.trustReading}`,
    '',
    `Trust Level: ${enterprise.trustLevel}`,
    '',
    `Trust Meaning: ${enterprise.trustMeaning}`,
    '',
    `What Is Visible: ${enterprise.whatIsVisible}`,
    '',
    `Why It Matters: ${enterprise.whyItMatters}`,
    '',
    `Continuity Risk: ${enterprise.continuityRisk}`,
    '',
    `Required Movement: ${enterprise.requiredMovement}`,
    '',
    `Primary Vulnerability: ${enterprise.primaryVulnerability}`,
    '',
    `Secondary Vulnerability: ${enterprise.secondaryVulnerability}`,
    '',
    `Executive Decision: ${enterprise.executiveDecision}`,
    '',
    `Board-Level Warning: ${enterprise.boardLevelWarning}`,
    '',
    `Current Posture: ${synthesis.posture}`,
    '',
    `Dominant Origin: ${chain.dominantOrigin}`,
    '',
    `Chain Confidence: ${chain.chainConfidence}`,
    '',
    `Continuity Path: ${chain.continuityPath.join(' → ')}`,
    '',
    `Executive Question: ${synthesis.executiveQuestion}`,
    '',
    `Trust Question: ${chain.trustQuestion}`,
    '',
    `Meaning: ${synthesis.meaning}`,
    '',
    `Executive Reason: ${chain.executiveReason}`,
    '',
    `What is happening: ${synthesis.whatIsHappening}`,
    '',
    `Lifecycle movement: ${synthesis.nextMovement}`,
    '',
    `Next required movement: ${chain.nextRequiredMovement}`,
    '',
    `Leadership action: ${enterprise.executiveDecision}`,
    '',
    `Audit meaning: ${chain.auditMeaning}`,
    '',
    `Memory status: ${synthesis.memoryStatus}`,
    '',
    `Memory meaning: ${chain.memoryMeaning}`,
    '',
    `Evidence status: ${synthesis.evidenceStatus}`,
    '',
    `Recovery credibility: ${synthesis.recoveryCredibility}`,
  ].join('\n')
}

function deriveVisibleSignal(
  synthesis: ExecutiveSynthesis,
  chain: CGIExecutiveContinuityChain,
) {
  if (chain.dominantOrigin === 'CROSS_SITE') return 'Cross-site continuity exposure'
  if (synthesis.coordinationPressure > 0) return 'Coordination pressure'
  if (synthesis.commandPressure > 0) return 'Command pressure'
  if (synthesis.evidenceReturn > 0) return 'Evidence return requirement'
  if (synthesis.fragileRecovery > 0) return 'Fragile recovery'
  if (synthesis.activeInstability > 0) return 'Active instability'
  if (synthesis.absorbable > 0) return 'Absorbable recovery'
  return 'No active continuity pressure'
}

function deriveContinuityThesis(
  synthesis: ExecutiveSynthesis,
  chain: CGIExecutiveContinuityChain,
) {
  if (chain.dominantOrigin === 'CROSS_SITE') {
    return 'Continuity confidence should remain withheld because instability may be distributed across sites, dependencies, or operational lanes.'
  }

  if (synthesis.coordinationPressure > 0) {
    return 'Continuity cannot be trusted until ownership, routing, capacity, and evidence are synchronized.'
  }

  if (synthesis.commandPressure > 0) {
    return 'Continuity remains under executive concern because command pressure is still visible before stability can be trusted.'
  }

  if (synthesis.fragileRecovery > 0) {
    return 'Recovery is visible, but durability has not yet matured into institutional confidence.'
  }

  if (synthesis.evidenceReturn > 0) {
    return 'Stabilization cannot be trusted because evidence must return to outcomes or interventions before recovery credibility is accepted.'
  }

  if (synthesis.absorbable > 0) {
    return 'Recovery may be absorbed into institutional stability only if memory, recurrence, and evidence remain visible.'
  }

  return 'Executive Center is clear; no active continuity condition currently requires leadership synthesis.'
}

function deriveWhatIsHappening(input: {
  activeInstability: number
  recoveryRecords: number
  commandPressure: number
  evidenceReturn: number
  fragileRecovery: number
  absorbable: number
  coordinationPressure: number
  crossSitePressure: number
  recurrenceVisible: number
}) {
  if (input.crossSitePressure > 1 && input.recurrenceVisible > 0) {
    return 'Continuity may no longer be isolated. Cross-site exposure and recurrence visibility require executive interpretation before trust is restored.'
  }

  if (input.coordinationPressure > 0) {
    return 'Coordination pressure remains visible. Ownership, routing, capacity, or evidence synchronization must be clarified before continuity advances.'
  }

  if (input.commandPressure > 0) {
    return 'Command pressure remains active. Executive Center keeps leadership attention on unresolved instability before stability is trusted.'
  }

  if (input.evidenceReturn > 0) {
    return 'Some recovery evidence is not strong enough for final confidence. The lifecycle must return to evidence or intervention review.'
  }

  if (input.fragileRecovery > 0) {
    return 'Recovery is visible but still fragile. Durability must mature before institutional stability is declared.'
  }

  if (input.activeInstability > 0) {
    return 'Active instability remains in the lifecycle. CGI must keep visibility until governed movement reaches credible stabilization.'
  }

  if (input.absorbable > 0) {
    return 'Recovered instability appears ready for institutional absorption while preserving memory and recurrence history.'
  }

  return 'The current lifecycle is clear. Executive Center remains available as the synthesis layer when instability, recovery, command pressure, coordination pressure, cross-site exposure, or evidence gaps appear.'
}

function isRecoverySummary(summary: string) {
  return (
    summary.includes('DURABILITY RESULT') ||
    summary.includes('RECOVERY TRAJECTORY') ||
    summary.includes('RECOVERY MATURITY') ||
    summary.includes('RECOVERY CONFIDENCE') ||
    summary.includes('RECOVERY DISPOSITION') ||
    summary.includes('RECOMMENDED NEXT MOVEMENT')
  )
}

function extractField(summary: string, label: string) {
  if (!summary) return ''

  const lines = summary
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const target = label.trim().toLowerCase()
  const index = lines.findIndex((line) => line.toLowerCase() === target)

  if (index === -1) return ''

  return lines[index + 1] || ''
}