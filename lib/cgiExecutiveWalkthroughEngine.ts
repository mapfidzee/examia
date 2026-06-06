import type {
  CGIDemoScenarioOutput,
  CGIPilotChainStage,
} from './cgiDemoScenarioEngine'
import { buildCGIDemoScenario } from './cgiDemoScenarioEngine'

export type CGIWalkthroughStepType =
  | 'REQUEST_VISIBILITY'
  | 'TRIAGE_INTERPRETATION'
  | 'CASE_GOVERNANCE'
  | 'ROUTING_GOVERNANCE'
  | 'INTERVENTION_GOVERNANCE'
  | 'OUTCOME_VERIFICATION'
  | 'RECOVERY_DURABILITY'
  | 'COMMAND_VISIBILITY'
  | 'COORDINATION_VISIBILITY'
  | 'CROSS_SITE_INTELLIGENCE'
  | 'SITUATION_ROOM'
  | 'EXECUTIVE_CENTER'
  | 'EXECUTIVE_REPORT'
  | 'INSTITUTIONAL_MEMORY'
  | 'AUDIT_RECONSTRUCTION'
  | 'INTELLIGENCE_READING'
  | 'STABILIZATION_DOCTRINE'

export type CGIWalkthroughStep = {
  stepNumber: number
  stepType: CGIWalkthroughStepType
  title: string
  executiveQuestion: string
  systemAnswer: string
  whyItMatters: string
}

export type CGIExecutiveWalkthrough = {
  walkthroughTitle: string
  walkthroughPurpose: string
  featuredScenario: CGIDemoScenarioOutput
  steps: CGIWalkthroughStep[]
  closingDoctrine: string
  executiveTakeaway: string
}

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ')
}

function mapPilotStageToStepType(
  stage: CGIPilotChainStage['stage'],
): CGIWalkthroughStepType {
  if (stage === 'REQUEST') return 'REQUEST_VISIBILITY'
  if (stage === 'TRIAGE') return 'TRIAGE_INTERPRETATION'
  if (stage === 'CASES') return 'CASE_GOVERNANCE'
  if (stage === 'ROUTING') return 'ROUTING_GOVERNANCE'
  if (stage === 'INTERVENTIONS') return 'INTERVENTION_GOVERNANCE'
  if (stage === 'OUTCOMES') return 'OUTCOME_VERIFICATION'
  if (stage === 'RECOVERY') return 'RECOVERY_DURABILITY'
  if (stage === 'COMMAND') return 'COMMAND_VISIBILITY'
  if (stage === 'COORDINATION') return 'COORDINATION_VISIBILITY'
  if (stage === 'CROSS_SITE') return 'CROSS_SITE_INTELLIGENCE'
  if (stage === 'SITUATION_ROOM') return 'SITUATION_ROOM'
  if (stage === 'EXECUTIVE_CENTER') return 'EXECUTIVE_CENTER'
  if (stage === 'EXECUTIVE_REPORT') return 'EXECUTIVE_REPORT'
  if (stage === 'MEMORY_BOARD') return 'INSTITUTIONAL_MEMORY'
  return 'AUDIT_RECONSTRUCTION'
}

function buildPilotChainWalkthroughSteps(
  scenario: CGIDemoScenarioOutput,
): CGIWalkthroughStep[] {
  return scenario.pilotThread.chain.map((stage, index) => ({
    stepNumber: index + 1,
    stepType: mapPilotStageToStepType(stage.stage),
    title: stage.title,
    executiveQuestion: stage.continuityQuestion,
    systemAnswer: stage.executiveFinding,
    whyItMatters: stage.evidencePreserved,
  }))
}

function buildContinuityStateWalkthroughSteps(
  scenario: CGIDemoScenarioOutput,
): CGIWalkthroughStep[] {
  return [
    {
      stepNumber: 1,
      stepType: 'INTELLIGENCE_READING',
      title: 'Instability Becomes Visible',
      executiveQuestion: 'What is happening?',
      systemAnswer: scenario.scenarioPurpose,
      whyItMatters:
        'CGI begins when instability is visible enough to require governed continuity interpretation.',
    },
    {
      stepNumber: 2,
      stepType: 'INTELLIGENCE_READING',
      title: 'CGI Derives Continuity Meaning',
      executiveQuestion: 'What does this instability mean?',
      systemAnswer: scenario.derivation.dominantOperationalTruth,
      whyItMatters:
        'The system does not merely count events. It derives continuity significance.',
    },
    {
      stepNumber: 3,
      stepType: 'INTELLIGENCE_READING',
      title: 'Continuity State Is Governed',
      executiveQuestion: 'Has the continuity condition changed?',
      systemAnswer: `State moved from ${formatLabel(
        scenario.stateDecision.previousState,
      )} to ${formatLabel(scenario.stateDecision.nextState)}.`,
      whyItMatters: scenario.stateDecision.reason,
    },
    {
      stepNumber: 4,
      stepType: 'INTELLIGENCE_READING',
      title: 'Executive Posture Is Set',
      executiveQuestion: 'What leadership stance is required?',
      systemAnswer: formatLabel(scenario.command.executivePosture),
      whyItMatters:
        'Executives do not need more noise. They need the correct posture for the current continuity condition.',
    },
    {
      stepNumber: 5,
      stepType: 'INTELLIGENCE_READING',
      title: 'Structural Memory Is Checked',
      executiveQuestion: 'Has this instability happened before?',
      systemAnswer: scenario.memory.executiveMemoryWarning,
      whyItMatters:
        'CGI remembers structurally so repeated instability is not falsely treated as isolated difficulty.',
    },
    {
      stepNumber: 6,
      stepType: 'INTELLIGENCE_READING',
      title: 'Accountability Is Assigned and Tested',
      executiveQuestion: 'Who owns stabilization and what evidence is required?',
      systemAnswer: `${scenario.accountability.ownerRequired} owns the action. Evidence required: ${scenario.accountability.evidenceRequired}`,
      whyItMatters:
        'Continuity intelligence must become owned, evidenced, and time-bound responsibility.',
    },
    {
      stepNumber: 7,
      stepType: 'INTELLIGENCE_READING',
      title: 'Governance Boundaries Are Checked',
      executiveQuestion: 'Can this intelligence be trusted and protected?',
      systemAnswer: scenario.security.governanceInterpretation,
      whyItMatters:
        'Institutional trust requires identity, role, audit, and institution-scope discipline.',
    },
    {
      stepNumber: 8,
      stepType: 'INTELLIGENCE_READING',
      title: 'Pilot Readiness Is Interpreted',
      executiveQuestion: 'Is this ready for institutional demonstration?',
      systemAnswer: scenario.pilotReadiness.investorReadinessInterpretation,
      whyItMatters:
        'Pilot readiness converts infrastructure maturity into an explainable institutional offer.',
    },
    {
      stepNumber: 9,
      stepType: 'STABILIZATION_DOCTRINE',
      title: 'CGI Protects Against False Recovery',
      executiveQuestion: 'Can we safely declare stability?',
      systemAnswer: scenario.shell.shellDoctrine,
      whyItMatters:
        'Visible recovery is not the same as durable stabilization. This is the doctrine that separates CGI from ordinary dashboards.',
    },
  ]
}

function buildWalkthroughSteps(
  scenario: CGIDemoScenarioOutput,
): CGIWalkthroughStep[] {
  if (scenario.scenarioKey === 'FUEL_LOGISTICS_CHAIN_PROOF') {
    return buildPilotChainWalkthroughSteps(scenario)
  }

  return buildContinuityStateWalkthroughSteps(scenario)
}

function buildWalkthroughTitle(scenario: CGIDemoScenarioOutput): string {
  if (scenario.scenarioKey === 'FUEL_LOGISTICS_CHAIN_PROOF') {
    return 'CGI Full Continuity Chain Walkthrough'
  }

  return 'CGI Executive Continuity Walkthrough'
}

function buildWalkthroughPurpose(scenario: CGIDemoScenarioOutput): string {
  if (scenario.scenarioKey === 'FUEL_LOGISTICS_CHAIN_PROOF') {
    return 'A guided explanation of how one visible instability moves from request through triage, case governance, routing, intervention, outcome verification, recovery, command, coordination, cross-site interpretation, situation room, executive center, executive report, institutional memory, and audit reconstruction.'
  }

  return 'A guided explanation of how TSINAXA CGI converts visible instability into continuity reasoning, command posture, structural memory, accountability, governance protection, and pilot-ready executive meaning.'
}

function buildExecutiveTakeaway(scenario: CGIDemoScenarioOutput): string {
  if (scenario.scenarioKey === 'FUEL_LOGISTICS_CHAIN_PROOF') {
    return 'The value of CGI is that leadership can follow one instability through the entire continuity chain without losing evidence, executive meaning, institutional memory, or audit reconstructability.'
  }

  return 'The value of CGI is not more alerts. The value is disciplined continuity interpretation that tells leaders whether the institution can still stabilize itself reliably.'
}

export function buildCGIExecutiveWalkthrough(
  scenarioKey: CGIDemoScenarioOutput['scenarioKey'] = 'FUEL_LOGISTICS_CHAIN_PROOF',
): CGIExecutiveWalkthrough {
  const featuredScenario = buildCGIDemoScenario(scenarioKey)

  return {
    walkthroughTitle: buildWalkthroughTitle(featuredScenario),
    walkthroughPurpose: buildWalkthroughPurpose(featuredScenario),
    featuredScenario,
    steps: buildWalkthroughSteps(featuredScenario),
    closingDoctrine:
      'CGI does not govern events. CGI governs continuity credibility under pressure.',
    executiveTakeaway: buildExecutiveTakeaway(featuredScenario),
  }
}