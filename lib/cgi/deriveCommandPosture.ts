import type { CGISeverity } from './interpreters/compactExecutiveAction'

export type CGICommandPosture =
  | 'STABLE COMMAND'
  | 'COMMAND WATCH'
  | 'ELEVATED COMMAND'
  | 'CRITICAL COMMAND'

type DeriveCommandPostureInput = {
  pressureSeverity: CGISeverity
  trajectorySeverity: CGISeverity
  recoverySeverity: CGISeverity
  predictiveSeverity: CGISeverity
  bottleneckSeverity: CGISeverity
  reliabilitySeverity: CGISeverity
  governanceSeverity?: CGISeverity
}

export function deriveCommandPosture(
  input: DeriveCommandPostureInput
): CGICommandPosture {
  const severities = [
    input.pressureSeverity,
    input.trajectorySeverity,
    input.recoverySeverity,
    input.predictiveSeverity,
    input.bottleneckSeverity,
    input.reliabilitySeverity,
    input.governanceSeverity ?? 'LOW',
  ]

  if (severities.includes('CRITICAL')) {
    return 'CRITICAL COMMAND'
  }

  if (severities.includes('HIGH')) {
    return 'ELEVATED COMMAND'
  }

  if (severities.includes('MODERATE')) {
    return 'COMMAND WATCH'
  }

  return 'STABLE COMMAND'
}

export function explainCommandPosture(
  posture: CGICommandPosture
): string {
  if (posture === 'CRITICAL COMMAND') {
    return 'Continuity survivability is under visible threat and requires executive intervention.'
  }

  if (posture === 'ELEVATED COMMAND') {
    return 'Visible instability is intensifying and requires executive prioritization.'
  }

  if (posture === 'COMMAND WATCH') {
    return 'Instability remains visible and should not be treated as resolved.'
  }

  return 'Continuity posture is currently stable with no dominant survivability escalation visible.'
}

export function deriveCommandImplication(
  posture: CGICommandPosture
): string {
  if (posture === 'CRITICAL COMMAND') {
    return 'Leadership should move from monitoring to direct command intervention.'
  }

  if (posture === 'ELEVATED COMMAND') {
    return 'Leadership should prioritize stabilization before survivability deteriorates further.'
  }

  if (posture === 'COMMAND WATCH') {
    return 'Governed monitoring should remain active until stabilization credibility becomes durable.'
  }

  return 'Routine governed continuity review remains appropriate.'
}

export function deriveCommandActionPosture(
  posture: CGICommandPosture
): string {
  if (posture === 'CRITICAL COMMAND') {
    return 'EXECUTIVE INTERVENTION'
  }

  if (posture === 'ELEVATED COMMAND') {
    return 'EXECUTIVE PRIORITIZATION'
  }

  if (posture === 'COMMAND WATCH') {
    return 'GOVERNED REVIEW'
  }

  return 'ROUTINE MONITORING'
}