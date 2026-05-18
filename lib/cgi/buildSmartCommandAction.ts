import type { CGISeverity } from './interpreters/compactExecutiveAction'

export type SmartCommandActionInput = {
  label: string
  posture: string
  severity: CGISeverity
  meaning: string
  action: string
  evidenceMetric?: string
}

export type SmartCommandAction = {
  label: string
  posture: string
  severity: CGISeverity
  specific: string
  measurable: string
  achievable: string
  relevant: string
  timeBound: string
  executiveAction: string
}

export function buildSmartCommandAction(
  input: SmartCommandActionInput
): SmartCommandAction {
  const timeBound = resolveTimeBound(input.severity)

  const measurable =
    input.evidenceMetric ||
    'Current CGI signal severity is recorded as ' + input.severity + '.'

  const specific = `${input.label}: ${input.posture}.`

  const achievable = input.action

  const relevant = input.meaning

  return {
    label: input.label,
    posture: input.posture,
    severity: input.severity,
    specific,
    measurable,
    achievable,
    relevant,
    timeBound,
    executiveAction:
      `${specific} ${measurable} ${achievable} ${relevant} ${timeBound}`,
  }
}

export function buildSmartCommandActions(
  inputs: SmartCommandActionInput[]
): SmartCommandAction[] {
  return inputs.map((input) => buildSmartCommandAction(input))
}

function resolveTimeBound(severity: CGISeverity) {
  if (severity === 'CRITICAL') {
    return 'Action window: within 4 hours.'
  }

  if (severity === 'HIGH') {
    return 'Action window: within 24 hours.'
  }

  if (severity === 'MODERATE') {
    return 'Action window: by the next governance cycle.'
  }

  return 'Action window: routine review window.'
}