import {
  compactExecutiveAction,
  type CGISeverity,
} from './compactExecutiveAction'

export type StructuralMemoryPosture =
  | 'MEMORY CONTAINED'
  | 'RECURRING PATTERN VISIBLE'
  | 'STRUCTURAL FRAGILITY'
  | 'SYSTEMIC MEMORY RISK'

type InterpretStructuralMemoryInput = {
  structuralMemoryState?: string | null
  dominantMemoryPattern?: string | null
}

type StructuralMemoryInterpretation = {
  posture: StructuralMemoryPosture
  severity: CGISeverity
  summary: string
  executiveAction: string
}

export function interpretStructuralMemory(
  input: InterpretStructuralMemoryInput
): StructuralMemoryInterpretation {
  const state = String(input.structuralMemoryState || '').toUpperCase()

  if (state === 'SYSTEMIC_MEMORY_RISK') {
    return {
      posture: 'SYSTEMIC MEMORY RISK',
      severity: 'CRITICAL',
      summary:
        input.dominantMemoryPattern ||
        'Recurring instability may be becoming systemic across continuity memory.',
      executiveAction: compactExecutiveAction({
        severity: 'CRITICAL',
        primaryConcern:
          'Structural recurrence may be becoming systemic.',
        stabilizationNeed:
          'Review recurring instability corridors and preserve continuity memory.',
        escalationTrigger:
          'Executive structural memory review is required.',
      }),
    }
  }

  if (state === 'STRUCTURAL_FRAGILITY') {
    return {
      posture: 'STRUCTURAL FRAGILITY',
      severity: 'HIGH',
      summary:
        input.dominantMemoryPattern ||
        'Repeated instability patterns suggest institutional fragility.',
      executiveAction: compactExecutiveAction({
        severity: 'HIGH',
        primaryConcern:
          'Repeated instability patterns suggest structural fragility.',
        stabilizationNeed:
          'Review recurrence corridors before instability becomes normalized.',
      }),
    }
  }

  if (state === 'RECURRING_PATTERN') {
    return {
      posture: 'RECURRING PATTERN VISIBLE',
      severity: 'MODERATE',
      summary:
        input.dominantMemoryPattern ||
        'Repeated instability remains visible in continuity memory.',
      executiveAction: compactExecutiveAction({
        severity: 'MODERATE',
        primaryConcern:
          'Recurring instability remains visible.',
        stabilizationNeed:
          'Keep recurrence under governance review before treating stability as durable.',
      }),
    }
  }

  return {
    posture: 'MEMORY CONTAINED',
    severity: 'LOW',
    summary:
      input.dominantMemoryPattern ||
      'Structural memory risk is currently contained.',
    executiveAction: compactExecutiveAction({
      severity: 'LOW',
      primaryConcern:
        'Maintain continuity memory and recurrence visibility.',
    }),
  }
}