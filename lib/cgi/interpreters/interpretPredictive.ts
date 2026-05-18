import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type PredictivePosture =
  | 'PREDICTIVE RISK LOW'
  | 'PREDICTIVE RISK WATCHED'
  | 'PREDICTIVE RISK ELEVATED'
  | 'PREDICTIVE RISK CRITICAL'

type InterpretPredictiveInput = {
  propagationRisk: number
  trajectoryRisk: number
  structuralMemoryRisk: number
  unresolvedMomentum: number
  stabilizationDrag: number
}

type PredictiveInterpretation = {
  posture: PredictivePosture
  severity: CGISeverity
  summary: string
  executiveAction: string
}

export function interpretPredictive(
  input: InterpretPredictiveInput
): PredictiveInterpretation {
  const {
    propagationRisk,
    trajectoryRisk,
    structuralMemoryRisk,
    unresolvedMomentum,
    stabilizationDrag,
  } = input

  const forecastRisk =
    (
      propagationRisk +
      trajectoryRisk +
      structuralMemoryRisk +
      unresolvedMomentum +
      stabilizationDrag
    ) / 5

  if (
    forecastRisk >= 75 ||
    propagationRisk >= 80 ||
    structuralMemoryRisk >= 80
  ) {
    return {
      posture: 'PREDICTIVE RISK CRITICAL',
      severity: 'CRITICAL',
      summary:
        'Forecast signals indicate severe continuity risk exposure if instability propagation continues.',
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Predictive continuity risk exposure is becoming operationally severe.',
        stabilizationNeed:
          'Prevent instability propagation before visible disruption intensifies.',
        escalationTrigger:
          'Immediate executive prevention review is recommended.',
      }),
    }
  }

  if (
    forecastRisk >= 60 ||
    trajectoryRisk >= 65 ||
    unresolvedMomentum >= 65
  ) {
    return {
      posture: 'PREDICTIVE RISK ELEVATED',
      severity: 'HIGH',
      summary:
        'Predictive signals show rising continuity risk across operational memory.',
      executiveAction: compactExecutiveAction({
        severity: 'HIGH',
        primaryConcern:
          'Continuity risk exposure is increasing across predictive indicators.',
        stabilizationNeed:
          'Strengthen prevention actions before visible disruption escalates.',
      }),
    }
  }

  if (
    forecastRisk >= 40 ||
    stabilizationDrag >= 45
  ) {
    return {
      posture: 'PREDICTIVE RISK WATCHED',
      severity: 'MODERATE',
      summary:
        'Predictive risk remains visible and should stay under governed observation.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Early continuity risk indicators remain operationally visible.',
        stabilizationNeed:
          'Continue monitoring risk movement and preserve early-warning visibility.',
      }),
    }
  }

  return {
    posture: 'PREDICTIVE RISK LOW',
    severity: 'LOW',
    summary:
      'Predictive signals currently show low immediate continuity risk exposure.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain visibility and disciplined operational monitoring.',
    }),
  }
}