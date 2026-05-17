export type CGISeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'

export type CGIActionInput = {
  severity: CGISeverity
  primaryConcern: string
  stabilizationNeed?: string
  escalationTrigger?: string
}

export function compactExecutiveAction(input: CGIActionInput): string {
  const { severity, primaryConcern, stabilizationNeed, escalationTrigger } = input

  if (severity === 'CRITICAL') {
    return `Immediate executive review required. ${primaryConcern}. ${stabilizationNeed ?? 'Stabilization credibility is not yet proven.'} ${escalationTrigger ?? 'Do not allow visible instability to disappear without continuity evidence.'}`
  }

  if (severity === 'HIGH') {
    return `Executive attention required. ${primaryConcern}. ${stabilizationNeed ?? 'Confirm whether current response is producing stabilization evidence.'}`
  }

  if (severity === 'MODERATE') {
    return `Continue governed monitoring. ${primaryConcern}. ${stabilizationNeed ?? 'Watch for recurrence, drift, or delayed recovery.'}`
  }

  return `Maintain continuity visibility. ${primaryConcern}.`
}