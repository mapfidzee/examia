import type { CGIExecutiveWalkthrough } from './cgiExecutiveWalkthroughEngine'
import { buildCGIExecutiveWalkthrough } from './cgiExecutiveWalkthroughEngine'
import {
  buildCGIDemoScenario,
  type CGIPilotScenarioThread,
} from './cgiDemoScenarioEngine'

export type CGIPilotPackageTier =
  | 'DISCOVERY_DEMO'
  | 'CONTROLLED_PILOT'
  | 'EXECUTIVE_VALIDATION'

export type CGIPilotPackageOutput = {
  packageTitle: string
  packagePositioning: string
  targetInstitution: string
  pilotTier: CGIPilotPackageTier
  pilotDuration: string
  pilotPriceRange: string
  executiveProblem: string
  pilotPromise: string
  whatCGIDemonstrates: string[]
  pilotDeliverables: string[]
  onboardingSequence: string[]
  successEvidence: string[]
  pilotScenarioThread: CGIPilotScenarioThread
  executiveWalkthrough: CGIExecutiveWalkthrough
  closingOffer: string
}

function derivePilotPriceRange(tier: CGIPilotPackageTier): string {
  if (tier === 'DISCOVERY_DEMO') {
    return '$500–$1,500 introductory executive demonstration'
  }

  if (tier === 'CONTROLLED_PILOT') {
    return '$2,500–$7,500 controlled institutional pilot'
  }

  return '$10,000–$25,000 executive validation engagement'
}

function derivePilotDuration(tier: CGIPilotPackageTier): string {
  if (tier === 'DISCOVERY_DEMO') return '1–2 weeks'
  if (tier === 'CONTROLLED_PILOT') return '30–60 days'
  return '60–90 days'
}

function deriveClosingOffer(tier: CGIPilotPackageTier): string {
  if (tier === 'DISCOVERY_DEMO') {
    return 'A focused executive demonstration showing one instability moving from request through recovery, command, executive interpretation, institutional memory, and audit reconstruction.'
  }

  if (tier === 'CONTROLLED_PILOT') {
    return 'A controlled pilot that tests CGI against one real or simulated continuity instability pattern across the full executive continuity chain.'
  }

  return 'An executive validation engagement designed to prove CGI as a continuity intelligence layer for leadership, governance, recovery credibility, institutional memory, and audit reconstructability.'
}

export function buildCGIInstitutionalPilotPackage(
  tier: CGIPilotPackageTier = 'CONTROLLED_PILOT',
): CGIPilotPackageOutput {
  const pilotScenario = buildCGIDemoScenario('FUEL_LOGISTICS_CHAIN_PROOF')
  const executiveWalkthrough = buildCGIExecutiveWalkthrough(
    'FUEL_LOGISTICS_CHAIN_PROOF',
  )

  return {
    packageTitle: 'TSINAXA CGI Institutional Pilot Package',
    packagePositioning:
      'A continuity governance intelligence pilot for institutions that need to prove that visible instability can be governed from first report through recovery, command visibility, executive interpretation, institutional memory, and audit reconstruction.',
    targetInstitution:
      'Military logistics units, hospitals, nursing homes, NGOs, public health programs, government coordination units, emergency management systems, education systems, and other continuity-sensitive institutions.',
    pilotTier: tier,
    pilotDuration: derivePilotDuration(tier),
    pilotPriceRange: derivePilotPriceRange(tier),
    executiveProblem:
      'Most institutions can see incidents, tasks, cases, and dashboards, but they struggle to prove whether stabilization is actually holding, whether risk is recurring, and whether leadership can reconstruct the chain later.',
    pilotPromise:
      'CGI helps leadership follow one visible instability through the full continuity chain so recovery is not mistaken for closure, command is not mistaken for resolution, and institutional memory is not lost after pressure fades.',
    whatCGIDemonstrates: [
      'How one instability enters CGI visibility through request intake.',
      'How triage converts a report into a governed continuity case.',
      'How routing, intervention, and outcome evidence remain attached.',
      'How recovery credibility is separated from apparent resolution.',
      'How command visibility activates when durability is not proven.',
      'How coordination and cross-site exposure reveal structural patterns.',
      'How the Situation Room interprets trajectory, pressure, and recurrence.',
      'How Executive Center converts operational fragments into leadership meaning.',
      'How Executive Report communicates posture, evidence, risk, and next movement.',
      'How Memory Board preserves institutional lessons after visible pressure fades.',
      'How Audit reconstructs the chain without losing the continuity story.',
    ],
    pilotDeliverables: [
      'One complete pilot continuity scenario.',
      'Full chain walkthrough from Request to Audit.',
      'Executive continuity briefing.',
      'Cross-site continuity interpretation.',
      'Recovery credibility and recurrence review.',
      'Command visibility rationale.',
      'Executive report narrative.',
      'Institutional memory statement.',
      'Audit reconstruction summary.',
      'Pilot readiness recommendation.',
    ],
    onboardingSequence: [
      'Define the institution or demo environment.',
      'Select one continuity-sensitive operational area.',
      'Confirm the pilot instability scenario.',
      'Map the instability from Request through Audit.',
      'Review recovery credibility and recurrence risk.',
      'Review command, coordination, and cross-site meaning.',
      'Review executive reporting and institutional memory.',
      'Confirm audit reconstructability.',
      'Complete executive walkthrough and pilot recommendation.',
    ],
    successEvidence: [
      'Executives can clearly explain what CGI does.',
      'One instability can be followed across the full continuity chain.',
      'The institution can distinguish recovery from durable stabilization.',
      'Recurring instability is no longer treated as isolated noise.',
      'Cross-site exposure can be interpreted without losing evidence.',
      'Leadership receives a clear executive report instead of fragmented operational updates.',
      'Institutional memory preserves the structural lesson.',
      'Audit can reconstruct the chain from request through memory.',
      'The pilot produces a clear next-step decision.',
    ],
    pilotScenarioThread: pilotScenario.pilotThread,
    executiveWalkthrough,
    closingOffer: deriveClosingOffer(tier),
  }
}