import type { CGISeverity } from './interpreters/compactExecutiveAction'
import type { CGICommandDriver } from './selectCommandDrivers'

export type CommandEscalationNode = {
  label: string
  posture: string
  severity: CGISeverity
  meaning: string
  action: string
  role: 'PRIMARY DRIVER' | 'SECONDARY EFFECT' | 'SUPPORTING SIGNAL'
}

export type CommandEscalationTree = {
  primaryDriver: CommandEscalationNode | null
  secondaryEffects: CommandEscalationNode[]
  supportingSignals: CommandEscalationNode[]
  escalationSummary: string
  executivePriorityOrder: CommandEscalationNode[]
}

const severityRank: Record<CGISeverity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MODERATE: 2,
  LOW: 1,
}

const rootDriverPriority = [
  'Routing Ownership',
  'Governance Integrity',
  'Recovery Credibility',
  'Continuity Reliability',
  'Structural Memory',
  'Pressure Propagation',
  'Trajectory Direction',
  'Predictive Forecast',
  'Bottleneck Pressure',
  'Safeguarding Visibility',
  'Responder Readiness',
  'Institution Readiness',
]

export function buildCommandEscalationTree(
  drivers: CGICommandDriver[]
): CommandEscalationTree {
  const rankedDrivers = [...drivers].sort((a, b) => {
    const severityDifference =
      severityRank[b.severity] - severityRank[a.severity]

    if (severityDifference !== 0) {
      return severityDifference
    }

    return (
      rootDriverPriority.indexOf(a.label) -
      rootDriverPriority.indexOf(b.label)
    )
  })

  const elevatedDrivers = rankedDrivers.filter(
    (driver) => driver.severity !== 'LOW'
  )

  const primaryDriver = elevatedDrivers[0]
    ? toNode(elevatedDrivers[0], 'PRIMARY DRIVER')
    : null

  const secondaryEffects = elevatedDrivers
    .slice(1, 4)
    .map((driver) => toNode(driver, 'SECONDARY EFFECT'))

  const supportingSignals = rankedDrivers
    .filter((driver) => !elevatedDrivers.includes(driver))
    .slice(0, 6)
    .map((driver) => toNode(driver, 'SUPPORTING SIGNAL'))

  return {
    primaryDriver,
    secondaryEffects,
    supportingSignals,
    escalationSummary: buildEscalationSummary(
      primaryDriver,
      secondaryEffects
    ),
    executivePriorityOrder: [
      ...(primaryDriver ? [primaryDriver] : []),
      ...secondaryEffects,
      ...supportingSignals,
    ],
  }
}

function toNode(
  driver: CGICommandDriver,
  role: CommandEscalationNode['role']
): CommandEscalationNode {
  return {
    label: driver.label,
    posture: driver.posture,
    severity: driver.severity,
    meaning: driver.meaning,
    action: driver.action,
    role,
  }
}

function buildEscalationSummary(
  primaryDriver: CommandEscalationNode | null,
  secondaryEffects: CommandEscalationNode[]
) {
  if (!primaryDriver) {
    return 'No elevated escalation driver is currently dominating the command view.'
  }

  if (secondaryEffects.length === 0) {
    return `${primaryDriver.label} is the primary command driver. No elevated secondary effects are currently dominant.`
  }

  return `${primaryDriver.label} is the primary command driver, with secondary effects visible in ${secondaryEffects
    .map((effect) => effect.label)
    .join(', ')}.`
}