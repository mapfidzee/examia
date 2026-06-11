export type ConstraintPosture =
  | 'CONSTRAINTS CLEAR'
  | 'CONSTRAINTS VISIBLE'
  | 'CONSTRAINTS ACCUMULATING'
  | 'CONSTRAINTS STRUCTURAL'
  | 'CONSTRAINTS COMMAND THRESHOLD'

export type EnterpriseConstraintIntelligence = {
  posture: ConstraintPosture
  question: string
  thesis: string
  dominantConstraint: string
  routingConstraint: string
  ownershipConstraint: string
  stabilizationConstraint: string
  safeguardingConstraint: string
  regionalConstraint: string
  commandImplication: string
  coordinationImplication: string
  crossSiteImplication: string
  reliabilityImplication: string
  evidenceRequirement: string
  memoryRequirement: string
  boardWarning: string
  executiveAction: string
  generatedBrief: string
}

export type EnterpriseConstraintDoctrineInput = {
  reportTemplate: string
  constraintFocus: string
  operatingScope: string
  additionalNotes: string
  bottleneckPosture: string
  bottleneckInterpretation: string
  bottleneckAction: string
  activeCases: number
  safeguardingFlags: number
  unresolvedCases: number
  stalledCases: number
  unroutedCases: number
  unclearOwnership: number
  highestResponderLoad: number
  highestRegionalLoad: number
}

export function buildEnterpriseConstraintIntelligence(
  input: EnterpriseConstraintDoctrineInput,
): EnterpriseConstraintIntelligence {
  const constraintScore =
    input.unresolvedCases * 3 +
    input.stalledCases * 3 +
    input.unroutedCases * 3 +
    input.unclearOwnership * 2 +
    input.highestResponderLoad * 3 +
    input.highestRegionalLoad +
    input.safeguardingFlags * 4

  const posture = deriveConstraintPosture(constraintScore, input)

  const question = 'What is preventing continuity from moving forward?'

  const routingConstraint =
    input.unroutedCases > 0
      ? 'Routing is blocking movement because some active continuity records have not reached an owned pathway.'
      : 'Routing is not currently the dominant constraint.'

  const ownershipConstraint =
    input.unclearOwnership > 0 || input.highestResponderLoad >= 2
      ? 'Ownership is constrained by unclear assignment or concentrated responsibility.'
      : 'Ownership appears proportionally distributed.'

  const stabilizationConstraint =
    input.unresolvedCases > 0 || input.stalledCases > 0
      ? 'Stabilization is constrained because action has not converted into verified movement.'
      : 'Stabilization movement is not currently blocked by visible outcome gaps.'

  const safeguardingConstraint =
    input.safeguardingFlags > 0
      ? 'Safeguarding-visible pressure requires executive constraint visibility.'
      : 'Safeguarding pressure is not currently driving constraint posture.'

  const regionalConstraint =
    input.highestRegionalLoad >= 4
      ? 'Regional concentration suggests constraint pressure may be geographically structural.'
      : 'Regional constraint pressure is not yet structurally dominant.'

  const dominantConstraint = strongestConstraint({
    'Routing blockage': input.unroutedCases * 3,
    'Ownership concentration':
      input.highestResponderLoad * 3 + input.unclearOwnership * 2,
    'Stabilization blockage':
      input.unresolvedCases * 3 + input.stalledCases * 3,
    'Safeguarding constraint': input.safeguardingFlags * 4,
    'Regional concentration': input.highestRegionalLoad,
  })

  const commandImplication =
    posture === 'CONSTRAINTS COMMAND THRESHOLD' ||
    posture === 'CONSTRAINTS STRUCTURAL'
      ? 'Command must hold visibility until blocked movement is converted into owned action.'
      : posture === 'CONSTRAINTS ACCUMULATING'
        ? 'Command should keep constraint pressure visible before escalation is forced.'
        : 'Command can monitor constraints proportionally.'

  const coordinationImplication =
    input.unclearOwnership > 0 ||
    input.highestResponderLoad >= 2 ||
    input.unroutedCases > 0
      ? 'Coordination must synchronize ownership and unblock movement.'
      : 'Coordination remains watchable.'

  const crossSiteImplication =
    input.highestRegionalLoad >= 4 || input.safeguardingFlags >= 2
      ? 'Cross-site review may be required if the same constraint appears across regions or sites.'
      : 'Cross-site review remains conditional.'

  const reliabilityImplication =
    input.unresolvedCases > 0 || input.stalledCases > 0
      ? 'Reliability cannot be trusted while continuity movement remains blocked.'
      : 'Reliability remains watchable if constraint memory stays attached.'

  const evidenceRequirement =
    'Preserve routing blockage, ownership assignment, unresolved interventions, stalled outcomes, safeguarding flags, regional concentration, responder concentration, command implication, and evidence of movement.'

  const memoryRequirement =
    'Preserve repeated constraints so the institution does not normalize blocked continuity movement as ordinary delay.'

  const boardWarning =
    'Do not treat delay as administration. Blocked movement is continuity risk when ownership, evidence, action, or stabilization cannot advance.'

  const executiveAction =
    posture === 'CONSTRAINTS COMMAND THRESHOLD'
      ? 'Hold command visibility and require ownership correction, routing release, and stabilization evidence within 24 hours.'
      : posture === 'CONSTRAINTS STRUCTURAL'
        ? 'Escalate structural constraint review and preserve constraint memory.'
        : posture === 'CONSTRAINTS ACCUMULATING'
          ? 'Synchronize coordination and require movement evidence before constraints normalize.'
          : posture === 'CONSTRAINTS VISIBLE'
            ? 'Maintain constraint watch and preserve evidence of movement.'
            : 'Continue monitoring and preserve constraint baseline.'

  const thesis = `${posture}: ${dominantConstraint} is the dominant constraint. ${input.bottleneckInterpretation}`

  const generatedBrief = [
    'TSINAXA CGI ENTERPRISE CONSTRAINT INTELLIGENCE BRIEF',
    '',
    `Report Template: ${input.reportTemplate}`,
    '',
    `Constraint Focus: ${input.constraintFocus}`,
    '',
    `Operating Scope: ${input.operatingScope}`,
    '',
    `Executive Constraint Question: ${question}`,
    '',
    `Constraint Posture: ${posture}`,
    '',
    `Enterprise Thesis: ${thesis}`,
    '',
    `Dominant Constraint: ${dominantConstraint}`,
    '',
    `Routing Constraint: ${routingConstraint}`,
    '',
    `Ownership Constraint: ${ownershipConstraint}`,
    '',
    `Stabilization Constraint: ${stabilizationConstraint}`,
    '',
    `Safeguarding Constraint: ${safeguardingConstraint}`,
    '',
    `Regional Constraint: ${regionalConstraint}`,
    '',
    `Command Implication: ${commandImplication}`,
    '',
    `Coordination Implication: ${coordinationImplication}`,
    '',
    `Cross-Site Implication: ${crossSiteImplication}`,
    '',
    `Reliability Implication: ${reliabilityImplication}`,
    '',
    `Evidence Requirement: ${evidenceRequirement}`,
    '',
    `Memory Requirement: ${memoryRequirement}`,
    '',
    `Board Warning: ${boardWarning}`,
    '',
    `Executive Action: ${executiveAction}`,
    '',
    'Central Interpreter Reading:',
    input.bottleneckPosture,
    '',
    'Central Interpreter Action:',
    input.bottleneckAction,
    '',
    'Governance-Safe Meaning:',
    'Constraint intelligence assigns movement responsibility without assigning blame. It protects visibility over routing, ownership, evidence, stabilization, safeguarding, and cross-site movement before reliability is weakened.',
    '',
    'Additional Operational Notes:',
    input.additionalNotes.trim() || 'No additional operational notes entered.',
  ].join('\n')

  return {
    posture,
    question,
    thesis,
    dominantConstraint,
    routingConstraint,
    ownershipConstraint,
    stabilizationConstraint,
    safeguardingConstraint,
    regionalConstraint,
    commandImplication,
    coordinationImplication,
    crossSiteImplication,
    reliabilityImplication,
    evidenceRequirement,
    memoryRequirement,
    boardWarning,
    executiveAction,
    generatedBrief,
  }
}

export function deriveConstraintPosture(
  score: number,
  input: {
    safeguardingFlags: number
    unresolvedCases: number
    stalledCases: number
    unroutedCases: number
    unclearOwnership: number
    highestResponderLoad: number
    highestRegionalLoad: number
  },
): ConstraintPosture {
  if (
    score >= 24 ||
    input.safeguardingFlags >= 3 ||
    input.highestResponderLoad >= 5
  ) {
    return 'CONSTRAINTS COMMAND THRESHOLD'
  }

  if (
    input.unresolvedCases >= 3 ||
    input.stalledCases >= 3 ||
    input.highestRegionalLoad >= 5
  ) {
    return 'CONSTRAINTS STRUCTURAL'
  }

  if (
    score >= 12 ||
    input.unroutedCases >= 2 ||
    input.unclearOwnership >= 2 ||
    input.highestResponderLoad >= 3
  ) {
    return 'CONSTRAINTS ACCUMULATING'
  }

  if (score > 0) return 'CONSTRAINTS VISIBLE'

  return 'CONSTRAINTS CLEAR'
}

export function strongestConstraint(scores: Record<string, number>) {
  return (
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'No dominant constraint detected'
  )
}