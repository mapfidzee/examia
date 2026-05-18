import type { CGISeverity } from './interpreters/compactExecutiveAction'

export type CGIInterpretiveThreshold =
  | 'CONTAINED'
  | 'WATCHABLE'
  | 'DESTABILIZING'
  | 'SURVIVABILITY THREAT'

export function deriveInterpretiveThreshold(
  severity: CGISeverity
): CGIInterpretiveThreshold {
  if (severity === 'CRITICAL') return 'SURVIVABILITY THREAT'
  if (severity === 'HIGH') return 'DESTABILIZING'
  if (severity === 'MODERATE') return 'WATCHABLE'
  return 'CONTAINED'
}