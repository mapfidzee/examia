export type StabilityCase = {
  id: string
  beneficiary_name: string
  beneficiary_level: string | null
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  intervention_summary: string | null
  outcome_summary: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
  created_at?: string | null
}

export type StabilityAbsorptionClass =
  | 'STABILITY_ABSORBABLE'
  | 'STABILITY_WATCH'
  | 'COMMAND_PRESSURE'
  | 'EVIDENCE_RETURN'
  | 'RECOVERY_MONITORING'
  | 'NO_RECOVERY_MEMORY'

export type StabilityBoardRecord = {
  caseItem: StabilityCase
  latestRecoveryReview?: OutcomeRecord
  recoveryDisposition: string
  recommendedMovement: string
  movementReason: string
  recoveryMaturity: string
  commandPosture: string
  durabilityResult: string
  reburnSignal: string
  recoveryConfidence: string
  memoryImpact: string
  absorptionClass: StabilityAbsorptionClass
  stabilityMeaning: string
}

export type StabilityBoardSummary = {
  totalRecords: number
  absorbable: number
  watch: number
  commandPressure: number
  evidenceReturn: number
  recoveryMonitoring: number
  activeInstability: number
  stabilized: number
  fragileRecovery: number
  unresolvedCommandPressure: number
  memoryPreserved: number
  currentLifecycleClear: boolean
  boardPosture: string
  boardMeaning: string
}

export const STABILITY_BOARD_DOCTRINE = [
  'Current lifecycle truth overrides old metrics.',
  'Final posture must be absorbed, not hidden.',
  'Recovery is not durability.',
  'Memory must survive stabilization.',
]

export const ACTIVE_CASE_STATUSES = [
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
]

export function buildStabilityBoardRecords(
  cases: StabilityCase[],
  outcomes: OutcomeRecord[],
): StabilityBoardRecord[] {
  const records: StabilityBoardRecord[] = []

  cases.forEach((caseItem) => {
    const caseOutcomes = outcomes.filter(
      (outcome) => outcome.case_id === caseItem.id,
    )

    const latestRecoveryReview = caseOutcomes.find((outcome) =>
      isRecoveryReview(outcome),
    )

    const summary =
      latestRecoveryReview?.outcome_summary || caseItem.outcome_summary || ''

    if (!summary || !isRecoverySummary(summary)) return

    const recoveryDisposition =
      extractField(summary, 'RECOVERY DISPOSITION') ||
      deriveDispositionFromLegacySummary(summary)

    const recommendedMovement =
      extractField(summary, 'RECOMMENDED NEXT MOVEMENT') ||
      deriveLegacyMovement(recoveryDisposition)

    const movementReason =
      extractField(summary, 'MOVEMENT REASON') ||
      'Movement reason was not explicitly preserved.'

    const recoveryMaturity =
      extractField(summary, 'RECOVERY MATURITY') ||
      'RECOVERY_MATURITY_UNRECORDED'

    const commandPosture =
      extractField(summary, 'COMMAND POSTURE') ||
      'COMMAND_POSTURE_UNRECORDED'

    const durabilityResult =
      extractField(summary, 'DURABILITY RESULT') ||
      latestRecoveryReview?.outcome_status ||
      'DURABILITY_UNRECORDED'

    const reburnSignal =
      extractField(summary, 'REBURN SIGNAL') ||
      'REBURN_SIGNAL_UNRECORDED'

    const recoveryConfidence =
      extractField(summary, 'RECOVERY CONFIDENCE') ||
      'RECOVERY_CONFIDENCE_UNRECORDED'

    const memoryImpact =
      extractField(summary, 'MEMORY IMPACT') || 'MEMORY_IMPACT_UNRECORDED'

    const absorptionClass = deriveAbsorptionClass(recoveryDisposition)

    records.push({
      caseItem,
      latestRecoveryReview,
      recoveryDisposition,
      recommendedMovement,
      movementReason,
      recoveryMaturity,
      commandPosture,
      durabilityResult,
      reburnSignal,
      recoveryConfidence,
      memoryImpact,
      absorptionClass,
      stabilityMeaning: deriveStabilityMeaning(absorptionClass),
    })
  })

  return records
}

export function buildStabilityBoardSummary(
  cases: StabilityCase[],
  records: StabilityBoardRecord[],
): StabilityBoardSummary {
  const activeInstability = cases.filter((caseItem) =>
    ACTIVE_CASE_STATUSES.includes(caseItem.case_status),
  ).length

  const stabilized = cases.filter(
    (caseItem) => caseItem.case_status === 'STABILIZED',
  ).length

  const absorbable = records.filter(
    (record) => record.absorptionClass === 'STABILITY_ABSORBABLE',
  ).length

  const watch = records.filter(
    (record) => record.absorptionClass === 'STABILITY_WATCH',
  ).length

  const commandPressure = records.filter(
    (record) => record.absorptionClass === 'COMMAND_PRESSURE',
  ).length

  const evidenceReturn = records.filter(
    (record) => record.absorptionClass === 'EVIDENCE_RETURN',
  ).length

  const recoveryMonitoring = records.filter(
    (record) => record.absorptionClass === 'RECOVERY_MONITORING',
  ).length

  const memoryPreserved = records.filter(
    (record) =>
      record.memoryImpact.includes('MEMORY') ||
      record.memoryImpact.includes('STRUCTURAL'),
  ).length

  const fragileRecovery = watch + evidenceReturn + recoveryMonitoring

  const currentLifecycleClear =
    activeInstability === 0 &&
    records.length === 0 &&
    commandPressure === 0 &&
    evidenceReturn === 0 &&
    fragileRecovery === 0

  let boardPosture = 'STABILITY BOARD CLEAR'
  let boardMeaning =
    'No active final-posture pressure is currently visible. Stability Board remains available for lifecycle absorption.'

  if (commandPressure > 0) {
    boardPosture = 'COMMAND PRESSURE UNRESOLVED'
    boardMeaning =
      'One or more recovery records still require Command Watch or Command Escalation. Stability cannot absorb these cases as closure.'
  } else if (evidenceReturn > 0) {
    boardPosture = 'EVIDENCE RETURN REQUIRED'
    boardMeaning =
      'One or more recovery records require Outcomes or Intervention review before final posture can be trusted.'
  } else if (fragileRecovery > 0) {
    boardPosture = 'FRAGILE RECOVERY VISIBLE'
    boardMeaning =
      'Recovery is visible but not fully absorbable. Stability Board must preserve fragility until durability matures.'
  } else if (absorbable > 0) {
    boardPosture = 'STABILITY ABSORPTION READY'
    boardMeaning =
      'Durable recovery evidence is available for institutional absorption while structural memory remains preserved.'
  } else if (activeInstability > 0) {
    boardPosture = 'ACTIVE INSTABILITY PRESENT'
    boardMeaning =
      'Active lifecycle instability remains visible. Stability Board should not express final closure.'
  }

  return {
    totalRecords: records.length,
    absorbable,
    watch,
    commandPressure,
    evidenceReturn,
    recoveryMonitoring,
    activeInstability,
    stabilized,
    fragileRecovery,
    unresolvedCommandPressure: commandPressure,
    memoryPreserved,
    currentLifecycleClear,
    boardPosture,
    boardMeaning,
  }
}

export function isRecoveryReview(outcome: OutcomeRecord) {
  return isRecoverySummary(outcome.outcome_summary || '')
}

export function isRecoverySummary(summary: string) {
  return (
    summary.includes('DURABILITY RESULT') ||
    summary.includes('RECOVERY TRAJECTORY') ||
    summary.includes('RECOVERY MATURITY') ||
    summary.includes('RECOVERY CONFIDENCE') ||
    summary.includes('RECOVERY DISPOSITION') ||
    summary.includes('RECOMMENDED NEXT MOVEMENT')
  )
}

export function deriveDispositionFromLegacySummary(summary: string) {
  const durabilityResult = extractField(summary, 'DURABILITY RESULT')
  const confidence = extractField(summary, 'RECOVERY CONFIDENCE')
  const reburnSignal = extractField(summary, 'REBURN SIGNAL')

  if (
    durabilityResult === 'RECOVERY_COLLAPSE' ||
    durabilityResult === 'REBURN_DETECTED' ||
    reburnSignal === 'REBURN_DETECTED' ||
    reburnSignal === 'RECURRENT_REBURN_PATTERN'
  ) {
    return 'MOVE_TO_COMMAND_ESCALATION'
  }

  if (durabilityResult === 'DURABLE_RECOVERY_CONFIRMED') {
    return 'MOVE_TO_STABILITY_BOARD'
  }

  if (confidence === 'LOW') {
    return 'RETURN_TO_INTERVENTION_REVIEW'
  }

  if (
    durabilityResult === 'RECOVERY_HOLDING' ||
    durabilityResult === 'STABILITY_UNDER_VARIANCE'
  ) {
    return 'MOVE_TO_COMMAND_WATCH'
  }

  return 'CONTINUE_RECOVERY_MONITORING'
}

export function deriveLegacyMovement(disposition: string) {
  if (disposition === 'MOVE_TO_STABILITY_BOARD') {
    return '/system Stability Board — absorb into institutional continuity posture.'
  }

  if (disposition === 'MOVE_TO_COMMAND_ESCALATION') {
    return '/command Command Escalation — executive continuity review required.'
  }

  if (disposition === 'MOVE_TO_COMMAND_WATCH') {
    return '/command Command Watch — preserve executive visibility without full escalation.'
  }

  if (disposition === 'RETURN_TO_OUTCOMES_REVIEW') {
    return '/outcomes Outcomes Review — verification evidence requires strengthening.'
  }

  if (disposition === 'RETURN_TO_INTERVENTION_REVIEW') {
    return '/interventions Intervention Review — stabilization action requires renewed review.'
  }

  return '/recovery Recovery Monitoring — continue durability observation.'
}

export function deriveAbsorptionClass(
  disposition: string,
): StabilityAbsorptionClass {
  if (disposition === 'MOVE_TO_STABILITY_BOARD') {
    return 'STABILITY_ABSORBABLE'
  }

  if (
    disposition === 'MOVE_TO_COMMAND_ESCALATION' ||
    disposition === 'MOVE_TO_COMMAND_WATCH'
  ) {
    return 'COMMAND_PRESSURE'
  }

  if (
    disposition === 'RETURN_TO_OUTCOMES_REVIEW' ||
    disposition === 'RETURN_TO_INTERVENTION_REVIEW'
  ) {
    return 'EVIDENCE_RETURN'
  }

  if (disposition === 'CONTINUE_RECOVERY_MONITORING') {
    return 'RECOVERY_MONITORING'
  }

  return 'NO_RECOVERY_MEMORY'
}

export function deriveStabilityMeaning(
  absorptionClass: StabilityAbsorptionClass,
) {
  switch (absorptionClass) {
    case 'STABILITY_ABSORBABLE':
      return 'Durable recovery can be absorbed into institutional posture without erasing memory.'
    case 'STABILITY_WATCH':
      return 'Stability remains watchable and should not be treated as closure.'
    case 'COMMAND_PRESSURE':
      return 'Command pressure remains unresolved and must stay visible.'
    case 'EVIDENCE_RETURN':
      return 'Evidence or intervention credibility requires return review before stability can be trusted.'
    case 'RECOVERY_MONITORING':
      return 'Recovery remains under durability observation.'
    default:
      return 'No recovery memory is currently available for absorption.'
  }
}

export function extractField(summary: string, label: string) {
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