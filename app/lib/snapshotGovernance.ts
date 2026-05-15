export type SnapshotType =
  | 'DAILY_CONTINUITY_REVIEW'
  | 'WEEKLY_EXECUTIVE_REVIEW'
  | 'PRESSURE_ESCALATION_REVIEW'
  | 'RECOVERY_REVIEW'
  | 'RELIABILITY_REVIEW'
  | 'MANUAL_GOVERNANCE_SNAPSHOT'

export type ExecutiveVisibilityLevel =
  | 'OPERATIONAL'
  | 'GOVERNANCE'
  | 'EXECUTIVE'
  | 'BOARD_LEVEL'

export type StabilizationConfidence =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'NOT_YET_CREDIBLE'

export type SnapshotGovernanceInput = {
  snapshotReason: string
  snapshotScope: string
  snapshotType: SnapshotType
  governanceNote: string
  reviewPeriod: string
  continuityPosture: string
  pressureClassification: string
  trajectoryState: string
  recoveryStatus: string
  stabilizationConfidence: StabilizationConfidence
  executiveVisibilityLevel: ExecutiveVisibilityLevel
  snapshotTrigger: string
  reviewOwner: string
  savedBy?: string | null
  savedByEmail?: string | null
}

export function validateSnapshotGovernance(input: SnapshotGovernanceInput) {
  const missing: string[] = []

  if (!input.snapshotReason?.trim()) missing.push('snapshot reason')
  if (!input.snapshotScope?.trim()) missing.push('snapshot scope')
  if (!input.snapshotType?.trim()) missing.push('snapshot type')
  if (!input.governanceNote?.trim()) missing.push('governance note')
  if (!input.reviewPeriod?.trim()) missing.push('review period')
  if (!input.continuityPosture?.trim()) missing.push('continuity posture')
  if (!input.pressureClassification?.trim()) missing.push('pressure classification')
  if (!input.trajectoryState?.trim()) missing.push('trajectory state')
  if (!input.recoveryStatus?.trim()) missing.push('recovery status')
  if (!input.stabilizationConfidence?.trim()) missing.push('stabilization confidence')
  if (!input.executiveVisibilityLevel?.trim()) missing.push('executive visibility level')
  if (!input.snapshotTrigger?.trim()) missing.push('snapshot trigger')
  if (!input.reviewOwner?.trim()) missing.push('review owner')

  return {
    valid: missing.length === 0,
    missing,
  }
}

export function buildSnapshotGovernancePayload(input: SnapshotGovernanceInput) {
  return {
    snapshot_reason: input.snapshotReason.trim(),
    snapshot_scope: input.snapshotScope.trim(),
    snapshot_type: input.snapshotType,
    governance_note: input.governanceNote.trim(),
    review_period: input.reviewPeriod.trim(),
    snapshot_date: new Date().toISOString().slice(0, 10),
    saved_by: input.savedBy ?? null,
    saved_by_email: input.savedByEmail ?? null,
    continuity_posture: input.continuityPosture.trim(),
    pressure_classification: input.pressureClassification.trim(),
    trajectory_state: input.trajectoryState.trim(),
    recovery_status: input.recoveryStatus.trim(),
    stabilization_confidence: input.stabilizationConfidence,
    executive_visibility_level: input.executiveVisibilityLevel,
    snapshot_trigger: input.snapshotTrigger.trim(),
    review_owner: input.reviewOwner.trim(),
  }
}