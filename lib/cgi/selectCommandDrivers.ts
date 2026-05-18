import type { CGISeverity } from './interpreters/compactExecutiveAction'

export type CGICommandDriver = {
  label: string
  posture: string
  severity: CGISeverity
  meaning: string
  action: string
}

const severityRank: Record<CGISeverity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MODERATE: 2,
  LOW: 1,
}

export function selectCommandDrivers(
  drivers: CGICommandDriver[],
  limit = 3
): CGICommandDriver[] {
  return drivers
    .filter((driver) => driver.severity !== 'LOW')
    .sort((a, b) => {
      const severityDifference =
        severityRank[b.severity] - severityRank[a.severity]

      if (severityDifference !== 0) {
        return severityDifference
      }

      return a.label.localeCompare(b.label)
    })
    .slice(0, limit)
}