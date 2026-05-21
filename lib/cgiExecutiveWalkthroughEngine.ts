import type { CGIDemoScenarioOutput } from './cgiDemoScenarioEngine'
import { buildCGIDemoScenario } from './cgiDemoScenarioEngine'

export type CGIWalkthroughStepType =
  | 'INSTABILITY_APPEARS'
  | 'MEANING_DERIVED'
  | 'STATE_TRANSITION'
  | 'COMMAND_POSTURE'
  | 'STRUCTURAL_MEMORY'
  | 'ACCOUNTABILITY_CHECK'
  | 'SECURITY_GOVERNANCE'
  | 'PILOT_INTERPRETATION'
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

function buildWalkthroughSteps(
  scenario: CGIDemoScenarioOutput
): CGIWalkthroughStep[] {
  return [
    {
      stepNumber: 1,
      stepType: 'INSTABILITY_APPEARS',
      title: 'Instability Becomes Visible',
      executiveQuestion: 'What is happening?',
      systemAnswer: scenario.scenarioPurpose,
      whyItMatters:
        'CGI begins when instability is visible enough to require governed continuity interpretation.',
    },
    {
      stepNumber: 2,
      stepType: 'MEANING_DERIVED',
      title: 'CGI Derives Continuity Meaning',
      executiveQuestion: 'What does this instability mean?',
      systemAnswer: scenario.derivation.dominantOperationalTruth,
      whyItMatters:
        'The system does not merely count events. It derives continuity significance.',
    },
    {
      stepNumber: 3,
      stepType: 'STATE_TRANSITION',
      title: 'Continuity State Is Governed',
      executiveQuestion: 'Has the continuity condition changed?',
      systemAnswer: `State moved from ${formatLabel(
        scenario.stateDecision.previousState
      )} to ${formatLabel(scenario.stateDecision.nextState)}.`,
      whyItMatters: scenario.stateDecision.reason,
    },
    {
      stepNumber: 4,
      stepType: 'COMMAND_POSTURE',
      title: 'Executive Posture Is Set',
      executiveQuestion: 'What leadership stance is required?',
      systemAnswer: formatLabel(scenario.command.executivePosture),
      whyItMatters:
        'Executives do not need more noise. They need the correct posture for the current continuity condition.',
    },
    {
      stepNumber: 5,
      stepType: 'STRUCTURAL_MEMORY',
      title: 'Structural Memory Checks for Reburn',
      executiveQuestion: 'Has this instability happened before?',
      systemAnswer: scenario.memory.executiveMemoryWarning,
      whyItMatters:
        'CGI remembers structurally so repeated instability is not falsely treated as isolated difficulty.',
    },
    {
      stepNumber: 6,
      stepType: 'ACCOUNTABILITY_CHECK',
      title: 'Accountability Is Assigned and Tested',
      executiveQuestion: 'Who owns stabilization and what evidence is required?',
      systemAnswer: `${scenario.accountability.ownerRequired} owns the action. Evidence required: ${scenario.accountability.evidenceRequired}`,
      whyItMatters:
        'Continuity intelligence must become owned, evidenced, and time-bound responsibility.',
    },
    {
      stepNumber: 7,
      stepType: 'SECURITY_GOVERNANCE',
      title: 'Governance Boundaries Are Checked',
      executiveQuestion: 'Can this intelligence be trusted and protected?',
      systemAnswer: scenario.security.governanceInterpretation,
      whyItMatters:
        'Institutional trust requires identity, role, audit, and institution-scope discipline.',
    },
    {
      stepNumber: 8,
      stepType: 'PILOT_INTERPRETATION',
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

export function buildCGIExecutiveWalkthrough(
  scenarioKey: CGIDemoScenarioOutput['scenarioKey'] = 'REBURN_RECURRENCE'
): CGIExecutiveWalkthrough {
  const featuredScenario = buildCGIDemoScenario(scenarioKey)

  return {
    walkthroughTitle: 'CGI Executive Continuity Walkthrough',
    walkthroughPurpose:
      'A guided explanation of how TSINAXA CGI converts visible instability into continuity reasoning, command posture, structural memory, accountability, governance protection, and pilot-ready executive meaning.',
    featuredScenario,
    steps: buildWalkthroughSteps(featuredScenario),
    closingDoctrine:
      'CGI does not govern events. CGI governs continuity credibility under pressure.',
    executiveTakeaway:
      'The value of CGI is not more alerts. The value is disciplined continuity interpretation that tells leaders whether the institution can still stabilize itself reliably.',
  }
}