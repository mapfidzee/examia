export type CGICommandPosture =
  | 'STABLE COMMAND'
  | 'COMMAND WATCH'
  | 'ELEVATED COMMAND'
  | 'CRITICAL COMMAND'

export type CGIExecutiveActionPosture =
  | 'ROUTINE GOVERNANCE'
  | 'ACTIVE MONITORING'
  | 'EXECUTIVE INTERVENTION'
  | 'IMMEDIATE EXECUTIVE ACTION'

export function deriveExecutiveActionPosture(
  posture: CGICommandPosture
): CGIExecutiveActionPosture {
  if (posture === 'CRITICAL COMMAND') {
    return 'IMMEDIATE EXECUTIVE ACTION'
  }

  if (posture === 'ELEVATED COMMAND') {
    return 'EXECUTIVE INTERVENTION'
  }

  if (posture === 'COMMAND WATCH') {
    return 'ACTIVE MONITORING'
  }

  return 'ROUTINE GOVERNANCE'
}