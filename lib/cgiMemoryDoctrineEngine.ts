import { buildCGIDemoScenario } from '@/lib/cgiDemoScenarioEngine'
import {
  buildCGIExecutiveMemoryBoard,
  type CGIExecutiveMemoryBoard,
} from '@/lib/cgiExecutiveMemoryBoardEngine'
import type { CGIHistoricalContinuitySnapshot } from '@/lib/cgiHistoricalContinuityEngine'
import { buildCGIInstitutionalMemory } from '@/lib/cgiInstitutionalMemoryEngine'

type CGIInstitutionalMemory = ReturnType<typeof buildCGIInstitutionalMemory>


export type PersistedContinuitySnapshotForMemory =
  CGIHistoricalContinuitySnapshot & {
    id: string
    created_at: string
    snapshot_label: string | null
    source_route: string
    continuity_confidence: string | null
    survivability_pressure: string | null
    recovery_credibility: string | null
    recurrence_severity: string | null
    dominant_concern: string | null
    executive_reading: string | null
    required_action: string | null
    required_evidence: string | null
    evidence_verified: boolean
    accountability_active: boolean
    structural_memory_visible: boolean
    raw_payload: Record<string, unknown>
  }

export type CGIMemoryDoctrine = {
  board: CGIExecutiveMemoryBoard
  institutionalMemory: CGIInstitutionalMemory
  memoryQuestion: string
  memoryThesis: string
  rememberedVulnerability: string
  rememberedPattern: string
  rememberedRule: string
  boardMeaning: string
  institutionalMeaning: string
  memoryRiskMeaning: string
  memoryRecommendation: string
  persistenceRequirement: string
  continuityLearning: string
  evidenceToPreserve: string
  copyReadyMemoryBrief: string
}

export function buildCGIMemoryDoctrine(
  snapshots: PersistedContinuitySnapshotForMemory[],
): CGIMemoryDoctrine {
  const featured = buildCGIDemoScenario('FUEL_LOGISTICS_CHAIN_PROOF')
  const pilotThread = featured.pilotThread

  const board = buildCGIExecutiveMemoryBoard(snapshots)

  const institutionalMemory = buildCGIInstitutionalMemory({
    historicalRecords: snapshots.length,
    recurringInstabilityCount: snapshots.filter((item) =>
      String(item.recurrence_severity || '').toUpperCase().includes('RECUR'),
    ).length,
    recoveryFailureCount: snapshots.filter((item) =>
      String(item.recovery_credibility || '')
        .toUpperCase()
        .includes('UNVERIFIED'),
    ).length,
    verifiedRecoveryCount: snapshots.filter((item) =>
      Boolean(item.evidence_verified),
    ).length,
    commandInterventionCount: snapshots.filter((item) =>
      String(item.required_action || '').toUpperCase().includes('COMMAND'),
    ).length,
    coordinationIssueCount: snapshots.filter((item) =>
      String(item.required_action || '').toUpperCase().includes('COORDIN'),
    ).length,
    crossSiteSignalCount: snapshots.filter((item) =>
      String(item.source_route || '').toUpperCase().includes('CROSS'),
    ).length,
    executiveReviewCount: snapshots.filter((item) =>
      String(item.executive_reading || '').toUpperCase().includes('EXECUTIVE'),
    ).length,
    auditReconstructionCount: snapshots.filter((item) =>
      String(item.required_evidence || '').toUpperCase().includes('AUDIT'),
    ).length,
    survivabilityThreatCount: snapshots.filter((item) =>
      String(item.survivability_pressure || '').toUpperCase().includes('SEVERE'),
    ).length,
    unresolvedMemoryGaps: snapshots.filter((item) => !item.evidence_verified)
      .length,
    lastKnownPattern:
      snapshots[0]?.dominant_concern ||
      snapshots[0]?.executive_reading ||
      pilotThread.executiveMemory,
  })

  const memoryQuestion = 'What must the institution never forget?'

  const rememberedVulnerability = deriveRememberedVulnerability(snapshots)
  const rememberedPattern = deriveRememberedPattern(snapshots)
  const rememberedRule = deriveRememberedRule(snapshots)

  const boardMeaning = deriveBoardMeaning(board)
  const institutionalMeaning = deriveInstitutionalMeaning(institutionalMemory)
  const memoryRiskMeaning = deriveMemoryRiskMeaning(institutionalMemory)
  const memoryRecommendation = deriveMemoryRecommendation({
    board,
    institutionalMemory,
    snapshots,
  })
  const persistenceRequirement = derivePersistenceRequirement({
    board,
    institutionalMemory,
    snapshots,
  })
  const continuityLearning = deriveContinuityLearning({
    institutionalMemory,
    pilotMemory: pilotThread.executiveMemory,
  })
  const evidenceToPreserve = deriveEvidenceToPreserve(snapshots)

  const memoryThesis =
    'Memory Board preserves the meaning of instability after visible recovery so structural lessons, recurrence risk, evidence gaps, and survivability exposure do not disappear.'

  const copyReadyMemoryBrief = [
    'TSINAXA CGI EXECUTIVE MEMORY BRIEF',
    '',
    `Executive Memory Question: ${memoryQuestion}`,
    '',
    `Memory Thesis: ${memoryThesis}`,
    '',
    `Board Posture: ${board.boardPostureLabel}`,
    '',
    `Board Urgency: ${board.boardUrgencyLabel}`,
    '',
    `Institutional Memory Posture: ${institutionalMemory.memoryPosture}`,
    '',
    `Dominant Memory Domain: ${institutionalMemory.dominantMemoryDomain}`,
    '',
    `Remembered Vulnerability: ${rememberedVulnerability}`,
    '',
    `Remembered Pattern: ${rememberedPattern}`,
    '',
    `Remembered Rule: ${rememberedRule}`,
    '',
    `Board Meaning: ${boardMeaning}`,
    '',
    `Institutional Meaning: ${institutionalMeaning}`,
    '',
    `Memory Risk: ${memoryRiskMeaning}`,
    '',
    `Continuity Learning: ${continuityLearning}`,
    '',
    `Evidence To Preserve: ${evidenceToPreserve}`,
    '',
    `Memory Recommendation: ${memoryRecommendation}`,
    '',
    `Persistence Requirement: ${persistenceRequirement}`,
    '',
    `Memory Doctrine: ${board.memoryDoctrineStatement}`,
  ].join('\n')

  return {
    board,
    institutionalMemory,
    memoryQuestion,
    memoryThesis,
    rememberedVulnerability,
    rememberedPattern,
    rememberedRule,
    boardMeaning,
    institutionalMeaning,
    memoryRiskMeaning,
    memoryRecommendation,
    persistenceRequirement,
    continuityLearning,
    evidenceToPreserve,
    copyReadyMemoryBrief,
  }
}

export function deriveRememberedVulnerability(
  snapshots: PersistedContinuitySnapshotForMemory[],
) {
  const latestConcern =
    snapshots[0]?.dominant_concern || snapshots[0]?.executive_reading || ''

  if (containsAny(latestConcern, ['SUPPLIER', 'VENDOR'])) {
    return 'Supplier concentration'
  }

  if (containsAny(latestConcern, ['COORDINATION', 'HANDOFF', 'ROUTING'])) {
    return 'Coordination dependency'
  }

  if (containsAny(latestConcern, ['STAFFING', 'COVERAGE', 'CAPACITY'])) {
    return 'Capacity fragility'
  }

  if (containsAny(latestConcern, ['EVIDENCE', 'VERIFICATION'])) {
    return 'Evidence maturity weakness'
  }

  if (containsAny(latestConcern, ['RECOVERY', 'DURABILITY'])) {
    return 'Recovery durability weakness'
  }

  return 'Supplier concentration'
}

export function deriveRememberedPattern(
  snapshots: PersistedContinuitySnapshotForMemory[],
) {
  const crossSiteSignals = snapshots.filter((item) =>
    String(item.source_route || '').toUpperCase().includes('CROSS'),
  ).length

  const recurrenceSignals = snapshots.filter((item) =>
    String(item.recurrence_severity || '').toUpperCase().includes('RECUR'),
  ).length

  const commandSignals = snapshots.filter((item) =>
    String(item.required_action || '').toUpperCase().includes('COMMAND'),
  ).length

  const coordinationSignals = snapshots.filter((item) =>
    String(item.required_action || '').toUpperCase().includes('COORDIN'),
  ).length

  if (crossSiteSignals > 0) return 'Cross-site exposure'
  if (recurrenceSignals > 0) return 'Recurring instability'
  if (commandSignals > 0) return 'Executive command visibility'
  if (coordinationSignals > 0) return 'Coordination pressure'

  return 'Cross-site exposure'
}

export function deriveRememberedRule(
  snapshots: PersistedContinuitySnapshotForMemory[],
) {
  const recoverySignals = snapshots.filter((item) =>
    String(item.recovery_credibility || '').toUpperCase().includes('RECOVERY'),
  ).length

  const evidenceGaps = snapshots.filter((item) => !item.evidence_verified).length

  if (evidenceGaps > 0) return 'Evidence must survive recovery'
  if (recoverySignals > 0) return 'Recovery is not closure'

  return 'Recovery is not closure'
}

export function deriveBoardMeaning(board: CGIExecutiveMemoryBoard) {
  if (board.escalationRequired) {
    return 'Board memory requires continued executive visibility because preserved records show unresolved or recurring continuity exposure.'
  }

  if (board.evidenceGapVisible) {
    return 'Board memory is active because evidence gaps may weaken institutional learning if they are not preserved.'
  }

  if (board.recurrencePatternVisible) {
    return 'Board memory is active because recurrence signals must remain visible beyond apparent recovery.'
  }

  return 'Board memory is available for institutional learning and routine continuity preservation.'
}

export function deriveInstitutionalMeaning(memory: CGIInstitutionalMemory) {
  if (memory.memoryPosture.includes('CRITICAL')) {
    return 'Institutional memory is critical and should remain visible to leadership until structural lessons are acted upon.'
  }

  if (memory.memoryPosture.includes('STRUCTURAL')) {
    return 'Institutional memory has structural meaning and should influence future planning, governance, and continuity decisions.'
  }

  if (memory.memoryPosture.includes('ACTIVE')) {
    return 'Institutional memory is active and should be used to prevent repeated continuity blindness.'
  }

  if (memory.memoryPosture.includes('EMERGING')) {
    return 'Institutional memory is emerging; leadership should preserve the pattern before it becomes invisible.'
  }

  return 'Institutional memory is not yet mature enough to drive strong interpretation.'
}

export function deriveMemoryRiskMeaning(memory: CGIInstitutionalMemory) {
  if (memory.memoryRisk.includes('CRITICAL')) {
    return 'Ignoring this memory may allow a known structural weakness to re-enter operations as a surprise.'
  }

  if (memory.memoryRisk.includes('HIGH')) {
    return 'Ignoring this memory may allow recurrence, weak evidence, or fragile recovery to return unnoticed.'
  }

  if (memory.memoryRisk.includes('MODERATE')) {
    return 'Ignoring this memory may weaken learning and make future recovery less credible.'
  }

  return 'Current memory risk is manageable if preservation continues.'
}

export function deriveMemoryRecommendation(input: {
  board: CGIExecutiveMemoryBoard
  institutionalMemory: CGIInstitutionalMemory
  snapshots: PersistedContinuitySnapshotForMemory[]
}) {
  if (input.board.escalationRequired) {
    return 'Keep memory visible at executive level and require evidence that the remembered vulnerability is being reduced.'
  }

  if (input.institutionalMemory.memoryPosture.includes('STRUCTURAL')) {
    return 'Convert the remembered pattern into operational safeguards, governance review, and future readiness checks.'
  }

  if (input.snapshots.length === 0) {
    return 'Begin preserving continuity memory before institutional lessons are lost.'
  }

  return 'Maintain memory preservation and review the pattern during future continuity decisions.'
}

export function derivePersistenceRequirement(input: {
  board: CGIExecutiveMemoryBoard
  institutionalMemory: CGIInstitutionalMemory
  snapshots: PersistedContinuitySnapshotForMemory[]
}) {
  if (input.snapshots.length === 0) {
    return 'Preserve the first continuity memory snapshot with evidence, executive meaning, and audit reconstructability.'
  }

  if (input.board.evidenceGapVisible) {
    return 'Preserve missing evidence, unresolved gaps, and future verification requirements before memory is treated as complete.'
  }

  if (input.board.recurrencePatternVisible) {
    return 'Preserve recurrence pattern, structural lesson, recovery credibility, and executive interpretation.'
  }

  return 'Preserve board posture, institutional learning, evidence state, and next review requirement.'
}

export function deriveContinuityLearning(input: {
  institutionalMemory: CGIInstitutionalMemory
  pilotMemory: string
}) {
  if (input.institutionalMemory.continuityLearning) {
    return input.institutionalMemory.continuityLearning
  }

  return input.pilotMemory
}

export function deriveEvidenceToPreserve(
  snapshots: PersistedContinuitySnapshotForMemory[],
) {
  if (snapshots.length === 0) {
    return 'Preserve continuity posture, source route, executive reading, recovery credibility, recurrence severity, required action, required evidence, and audit link.'
  }

  const latest = snapshots[0]

  return [
    latest.snapshot_label || 'Continuity snapshot',
    latest.source_route || 'Source route',
    latest.continuity_posture || 'Continuity posture',
    latest.executive_reading || latest.dominant_concern || 'Executive reading',
    latest.required_evidence || 'Required evidence',
  ].join(' • ')
}

export function formatMemoryDate(value: string) {
  if (!value) return 'Not recorded'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString()
}

export function formatMemoryLabel(value: string) {
  return value.replaceAll('_', ' ')
}

function containsAny(value: string, terms: string[]) {
  const text = value.toUpperCase()
  return terms.some((term) => text.includes(term))
}