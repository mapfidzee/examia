import type {
  ContinuityCondition,
  RecoveryCredibility,
  RecurrenceSeverity,
  SurvivabilityPressure,
} from './cgiDerivationEngine'

export type CGIMemorySignal =
  | 'NO_STRUCTURAL_MEMORY'
  | 'EARLY_REPEAT_SIGNAL'
  | 'RECURRENCE_PATTERN'
  | 'RECOVERY_COLLAPSE'
  | 'REBURN_CYCLE'
  | 'PRESSURE_ACCUMULATION'
  | 'INSTITUTIONAL_FRAGILITY'

export type CGIMemoryRiskLevel =
  | 'LOW'
  | 'WATCH'
  | 'ELEVATED'
  | 'HIGH'
  | 'SEVERE'

export type CGIStructuralMemoryRecord = {
  continuityCondition: ContinuityCondition
  recoveryCredibility: RecoveryCredibility
  recurrenceSeverity: RecurrenceSeverity
  survivabilityPressure: SurvivabilityPressure
  repeatedInstabilityCount: number
  recoveryFailureCount: number
  reburnCount: number
  unresolvedDurationDays: number
  priorEscalationCount: number
  priorSurvivabilityThreatCount: number
}

export type CGIStructuralMemoryOutput = {
  primaryMemorySignal: CGIMemorySignal
  memoryRiskLevel: CGIMemoryRiskLevel
  structuralPatternDetected: boolean
  recoveryCollapseDetected: boolean
  reburnDetected: boolean
  institutionalFragilityDetected: boolean
  memoryInterpretation: string
  executiveMemoryWarning: string
  recommendedMemoryAction: string
}

function detectRecoveryCollapse(
  record: CGIStructuralMemoryRecord
): boolean {
  return (
    record.recoveryFailureCount >= 2 ||
    (record.recoveryCredibility === 'PARTIAL' &&
      record.priorEscalationCount >= 2) ||
    (record.recoveryCredibility === 'UNVERIFIED' &&
      record.continuityCondition === 'FRAGILE_RECOVERY')
  )
}

function detectReburn(record: CGIStructuralMemoryRecord): boolean {
  return (
    record.reburnCount > 0 ||
    (record.repeatedInstabilityCount >= 2 &&
      record.recoveryCredibility !== 'DURABLE')
  )
}

function detectInstitutionalFragility(
  record: CGIStructuralMemoryRecord
): boolean {
  return (
    record.priorSurvivabilityThreatCount > 0 ||
    record.survivabilityPressure === 'SEVERE' ||
    record.priorEscalationCount >= 5 ||
    record.unresolvedDurationDays >= 21
  )
}

function detectStructuralPattern(
  record: CGIStructuralMemoryRecord
): boolean {
  return (
    record.recurrenceSeverity === 'STRUCTURAL' ||
    record.recurrenceSeverity === 'SYSTEMIC' ||
    record.repeatedInstabilityCount >= 4 ||
    record.priorEscalationCount >= 3
  )
}

function derivePrimaryMemorySignal(
  record: CGIStructuralMemoryRecord,
  flags: {
    structuralPatternDetected: boolean
    recoveryCollapseDetected: boolean
    reburnDetected: boolean
    institutionalFragilityDetected: boolean
  }
): CGIMemorySignal {
  if (flags.institutionalFragilityDetected) {
    return 'INSTITUTIONAL_FRAGILITY'
  }

  if (flags.reburnDetected) {
    return 'REBURN_CYCLE'
  }

  if (flags.recoveryCollapseDetected) {
    return 'RECOVERY_COLLAPSE'
  }

  if (
    record.survivabilityPressure === 'HIGH' ||
    record.survivabilityPressure === 'SEVERE' ||
    record.unresolvedDurationDays >= 14
  ) {
    return 'PRESSURE_ACCUMULATION'
  }

  if (flags.structuralPatternDetected) {
    return 'RECURRENCE_PATTERN'
  }

  if (record.repeatedInstabilityCount > 0) {
    return 'EARLY_REPEAT_SIGNAL'
  }

  return 'NO_STRUCTURAL_MEMORY'
}

function deriveMemoryRiskLevel(
  signal: CGIMemorySignal
): CGIMemoryRiskLevel {
  if (signal === 'INSTITUTIONAL_FRAGILITY') return 'SEVERE'
  if (signal === 'REBURN_CYCLE') return 'HIGH'
  if (signal === 'RECOVERY_COLLAPSE') return 'HIGH'
  if (signal === 'PRESSURE_ACCUMULATION') return 'ELEVATED'
  if (signal === 'RECURRENCE_PATTERN') return 'ELEVATED'
  if (signal === 'EARLY_REPEAT_SIGNAL') return 'WATCH'
  return 'LOW'
}

function buildMemoryInterpretation(
  signal: CGIMemorySignal
): string {
  if (signal === 'INSTITUTIONAL_FRAGILITY') {
    return 'CGI memory indicates the institution has shown fragility under pressure and may require executive reinforcement.'
  }

  if (signal === 'REBURN_CYCLE') {
    return 'CGI memory indicates instability is returning after apparent recovery. This is reburn, not durable stabilization.'
  }

  if (signal === 'RECOVERY_COLLAPSE') {
    return 'CGI memory indicates prior recovery attempts have collapsed or failed to hold.'
  }

  if (signal === 'PRESSURE_ACCUMULATION') {
    return 'CGI memory indicates unresolved pressure is accumulating across time.'
  }

  if (signal === 'RECURRENCE_PATTERN') {
    return 'CGI memory indicates recurrence is forming a structural pattern.'
  }

  if (signal === 'EARLY_REPEAT_SIGNAL') {
    return 'CGI memory indicates early repeat instability. This should be watched before it becomes patterned.'
  }

  return 'CGI memory does not currently show a dominant structural instability pattern.'
}

function buildExecutiveMemoryWarning(
  signal: CGIMemorySignal
): string {
  if (signal === 'INSTITUTIONAL_FRAGILITY') {
    return 'Do not treat this as an isolated event. Prior pressure history suggests fragility.'
  }

  if (signal === 'REBURN_CYCLE') {
    return 'Do not declare stability yet. Instability has returned after apparent recovery.'
  }

  if (signal === 'RECOVERY_COLLAPSE') {
    return 'Do not trust visible recovery without verification. Prior recovery has failed to hold.'
  }

  if (signal === 'PRESSURE_ACCUMULATION') {
    return 'Unresolved pressure is becoming a continuity risk.'
  }

  if (signal === 'RECURRENCE_PATTERN') {
    return 'Repeated instability may now represent structural weakness.'
  }

  if (signal === 'EARLY_REPEAT_SIGNAL') {
    return 'Early repeat instability is visible and should be reviewed.'
  }

  return 'No structural memory warning is currently active.'
}

function buildRecommendedMemoryAction(
  signal: CGIMemorySignal
): string {
  if (signal === 'INSTITUTIONAL_FRAGILITY') {
    return 'Require executive review, ownership assignment, and a reinforced stabilization plan.'
  }

  if (signal === 'REBURN_CYCLE') {
    return 'Open a reburn review and verify why apparent recovery failed.'
  }

  if (signal === 'RECOVERY_COLLAPSE') {
    return 'Review recovery evidence and strengthen the recovery verification pathway.'
  }

  if (signal === 'PRESSURE_ACCUMULATION') {
    return 'Reduce unresolved duration and document pressure relief actions.'
  }

  if (signal === 'RECURRENCE_PATTERN') {
    return 'Investigate structural drivers and document recurrence controls.'
  }

  if (signal === 'EARLY_REPEAT_SIGNAL') {
    return 'Monitor closely and prepare prevention action if repetition continues.'
  }

  return 'Continue routine structural monitoring.'
}

export function evaluateCGIStructuralMemory(
  record: CGIStructuralMemoryRecord
): CGIStructuralMemoryOutput {
  const recoveryCollapseDetected = detectRecoveryCollapse(record)
  const reburnDetected = detectReburn(record)
  const institutionalFragilityDetected =
    detectInstitutionalFragility(record)
  const structuralPatternDetected = detectStructuralPattern(record)

  const primaryMemorySignal = derivePrimaryMemorySignal(record, {
    structuralPatternDetected,
    recoveryCollapseDetected,
    reburnDetected,
    institutionalFragilityDetected,
  })

  const memoryRiskLevel = deriveMemoryRiskLevel(primaryMemorySignal)

  return {
    primaryMemorySignal,
    memoryRiskLevel,
    structuralPatternDetected,
    recoveryCollapseDetected,
    reburnDetected,
    institutionalFragilityDetected,
    memoryInterpretation: buildMemoryInterpretation(primaryMemorySignal),
    executiveMemoryWarning:
      buildExecutiveMemoryWarning(primaryMemorySignal),
    recommendedMemoryAction:
      buildRecommendedMemoryAction(primaryMemorySignal),
  }
}