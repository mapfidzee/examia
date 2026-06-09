import {
  buildContinuityTrustAssessment,
  type ContinuityTrustAssessment,
  type ContinuityTrustInput,
} from './cgiContinuityTrustEngine'

export type ContinuityDerivationInput = ContinuityTrustInput & {
  visibleSignal: string
  stage: string
  posture: string
  currentMeaning: string
  nextMovement: string
}

export type ContinuityDerivationStandard = {
  whatIsVisible: string
  whyItMatters: string
  continuityRisk: string
  requiredMovement: string
  trustLevel: ContinuityTrustAssessment['trustLevel']
  institutionalMeaning: string
  trustAssessment: ContinuityTrustAssessment
}

export function buildContinuityDerivationStandard(
  input: ContinuityDerivationInput,
): ContinuityDerivationStandard {
  const trustAssessment = buildContinuityTrustAssessment(input)

  return {
    whatIsVisible: deriveVisibleSignal(input),
    whyItMatters: deriveWhyItMatters(input),
    continuityRisk: deriveContinuityRisk(input),
    requiredMovement: input.nextMovement,
    trustLevel: trustAssessment.trustLevel,
    institutionalMeaning: trustAssessment.institutionalMeaning,
    trustAssessment,
  }
}

function deriveVisibleSignal(input: ContinuityDerivationInput) {
  if (input.visibleSignal) return input.visibleSignal

  if (input.crossSitePressure > 1) return 'Cross-site continuity exposure'
  if (input.coordinationPressure > 0) return 'Coordination pressure'
  if (input.commandPressure > 0) return 'Command pressure'
  if (input.evidenceReturn > 0) return 'Evidence return requirement'
  if (input.fragileRecovery > 0) return 'Fragile recovery'
  if (input.activeInstability > 0) return 'Active instability'
  if (input.absorbable > 0) return 'Absorbable recovery'
  return 'No active continuity pressure'
}

function deriveWhyItMatters(input: ContinuityDerivationInput) {
  if (input.crossSitePressure > 1) {
    return 'Cross-site pressure may indicate that visible recovery in one place is hiding distributed institutional exposure.'
  }

  if (input.coordinationPressure > 0) {
    return 'Continuity cannot mature while ownership, routing, evidence, or responder alignment remain unclear.'
  }

  if (input.commandPressure > 0) {
    return 'Command pressure means leadership blindness remains a risk before stability can be trusted.'
  }

  if (input.evidenceReturn > 0) {
    return 'Without evidence, stabilization becomes an assumption rather than a governed conclusion.'
  }

  if (input.fragileRecovery > 0) {
    return 'Recovery can appear stable before durability is actually credible.'
  }

  if (input.activeInstability > 0) {
    return 'Visible instability must continue moving through governed action instead of disappearing.'
  }

  if (input.absorbable > 0) {
    return 'Stability has value only if memory, recurrence, and unresolved risk remain attached after recovery.'
  }

  return 'A clear posture prevents false escalation while preserving institutional memory.'
}

function deriveContinuityRisk(input: ContinuityDerivationInput) {
  if (input.crossSitePressure > 1) return 'Distributed structural exposure'
  if (input.coordinationPressure > 0) return 'Ownership and synchronization failure'
  if (input.commandPressure > 0) return 'Leadership blindness'
  if (input.evidenceReturn > 0) return 'Evidence fragility'
  if (input.fragileRecovery > 0) return 'Premature stability declaration'
  if (input.recurrenceVisible > 0) return 'Recurrence'
  if (input.activeInstability > 0) return 'Instability disappearance'
  if (input.absorbable > 0) return 'Memory erasure during stability absorption'
  return 'No active continuity risk visible'
}