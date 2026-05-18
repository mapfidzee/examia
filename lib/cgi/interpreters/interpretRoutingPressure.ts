import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type RoutingPressurePosture =
  | 'ROUTING PRESSURE CONTAINED'
  | 'ROUTING PRESSURE VISIBLE'
  | 'ROUTING PRESSURE HIGH'
  | 'ROUTING PRESSURE CRITICAL'

type InterpretRoutingPressureInput = {
  highestResponderLoad: number
  highestRegionalPressure: number
  routedWithoutResponder: number
  activeWithoutRouting: number
  safeguardingFlags: number
}

type RoutingPressureInterpretation = {
  posture: RoutingPressurePosture
  severity: CGISeverity
  summary: string
  executiveAction: string
}

export function interpretRoutingPressure(
  input: InterpretRoutingPressureInput
): RoutingPressureInterpretation {
  if (
    input.routedWithoutResponder >= 3 ||
    input.highestResponderLoad >= 3 ||
    input.safeguardingFlags >= 3
  ) {
    return {
      posture: 'ROUTING PRESSURE CRITICAL',
      severity: 'CRITICAL',
      summary:
        'Routing ownership pressure may threaten continuity flow and stabilization responsiveness.',
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Routing ownership pressure is becoming critical.',
        stabilizationNeed:
          'Restore routing ownership and reduce concentration pressure.',
        escalationTrigger:
          'Immediate routing governance review is required.',
      }),
    }
  }

  if (
    input.highestResponderLoad >= 2 ||
    input.highestRegionalPressure >= 3 ||
    input.routedWithoutResponder >= 2
  ) {
    return {
      posture: 'ROUTING PRESSURE HIGH',
      severity: 'HIGH',
      summary:
        'Routing pressure is elevated and may weaken continuity ownership.',
      executiveAction: compactExecutiveAction({
        severity: 'HIGH',
        primaryConcern:
          'Routing pressure is elevated across ownership pathways.',
        stabilizationNeed:
          'Rebalance routing ownership and monitor unresolved routing load.',
      }),
    }
  }

  if (
    input.highestRegionalPressure >= 2 ||
    input.activeWithoutRouting >= 1
  ) {
    return {
      posture: 'ROUTING PRESSURE VISIBLE',
      severity: 'MODERATE',
      summary:
        'Routing pressure remains visible and requires continued governance review.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Routing pressure remains operationally visible.',
        stabilizationNeed:
          'Keep routing ownership under review until traceability is stable.',
      }),
    }
  }

  return {
    posture: 'ROUTING PRESSURE CONTAINED',
    severity: 'LOW',
    summary:
      'Routing pressure is currently contained within continuity tolerance.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain routing traceability and ownership visibility.',
    }),
  }
}