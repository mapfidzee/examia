export type PredictivePosture =
  | 'PREDICTIVE RISK LOW'
  | 'PREDICTIVE RISK WATCHED'
  | 'PREDICTIVE RISK ELEVATED'
  | 'PREDICTIVE RISK CRITICAL'

export type PredictiveSeverity =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'

type InterpretPredictiveInput = {
  propagationRisk: number
  trajectoryRisk: number
  structuralMemoryRisk: number
  unresolvedMomentum: number
  stabilizationDrag: number
}

type PredictiveInterpretation = {
  posture: PredictivePosture
  severity: PredictiveSeverity
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
        'Forecast signals indicate high probability of continuity disruption if no intervention occurs.',
      executiveAction:
        'Immediate executive prevention review recommended. Treat this as a pre-disruption continuity warning.',
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
      executiveAction:
        'Strengthen prevention actions before visible disruption escalates.',
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
      executiveAction:
        'Continue monitoring risk movement and preserve early-warning visibility.',
    }
  }

  return {
    posture: 'PREDICTIVE RISK LOW',
    severity: 'LOW',
    summary:
      'Predictive signals currently suggest low near-term continuity disruption risk.',
    executiveAction:
      'Maintain visibility and continue disciplined operational monitoring.',
  }
}