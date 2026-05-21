import type { CGIExecutiveWalkthrough } from './cgiExecutiveWalkthroughEngine'
import { buildCGIExecutiveWalkthrough } from './cgiExecutiveWalkthroughEngine'

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
  if (tier === 'DISCOVERY_DEMO') {
    return '1–2 weeks'
  }

  if (tier === 'CONTROLLED_PILOT') {
    return '30–60 days'
  }

  return '60–90 days'
}

function deriveClosingOffer(tier: CGIPilotPackageTier): string {
  if (tier === 'DISCOVERY_DEMO') {
    return 'A focused executive demonstration showing how CGI interprets instability, recovery credibility, recurrence, and accountability.'
  }

  if (tier === 'CONTROLLED_PILOT') {
    return 'A controlled pilot that tests CGI against real or simulated continuity instability patterns inside one institutional environment.'
  }

  return 'An executive validation engagement designed to prove CGI as a continuity intelligence layer for leadership, governance, and operational stabilization.'
}

export function buildCGIInstitutionalPilotPackage(
  tier: CGIPilotPackageTier = 'CONTROLLED_PILOT'
): CGIPilotPackageOutput {
  const executiveWalkthrough = buildCGIExecutiveWalkthrough(
    'REBURN_RECURRENCE'
  )

  return {
    packageTitle: 'TSINAXA CGI Institutional Pilot Package',
    packagePositioning:
      'A continuity governance intelligence pilot for institutions that need clearer visibility into instability, recovery credibility, recurrence, accountability, and executive action.',
    targetInstitution:
      'Hospitals, nursing homes, NGOs, public health programs, government coordination units, logistics operations, education systems, and other continuity-sensitive institutions.',
    pilotTier: tier,
    pilotDuration: derivePilotDuration(tier),
    pilotPriceRange: derivePilotPriceRange(tier),
    executiveProblem:
      'Most institutions can see incidents, tasks, cases, and dashboards, but they struggle to know whether stabilization is actually holding under pressure.',
    pilotPromise:
      'CGI helps leadership understand whether visible recovery is becoming durable stabilization or whether instability is returning, spreading, or weakening continuity credibility.',
    whatCGIDemonstrates: [
      'How visible instability is converted into continuity condition.',
      'How recovery credibility is separated from apparent resolution.',
      'How reburn and recurrence are detected structurally.',
      'How executive posture is derived from continuity risk.',
      'How accountability is assigned, evidenced, and escalated.',
      'How governance boundaries protect institutional trust.',
      'How pilot readiness can be explained to executives.',
    ],
    pilotDeliverables: [
      'Executive continuity briefing.',
      'Demo organization continuity profile.',
      'Instability lifecycle walkthrough.',
      'CGI executive demo page review.',
      'Continuity condition interpretation.',
      'Structural memory and reburn review.',
      'Accountability and evidence pathway review.',
      'Pilot readiness recommendation.',
    ],
    onboardingSequence: [
      'Define the institution or demo environment.',
      'Select one continuity-sensitive operational area.',
      'Identify visible instability examples.',
      'Map instability into CGI demo scenarios.',
      'Review derived continuity condition and executive posture.',
      'Review recurrence, memory, and recovery credibility.',
      'Assign accountability and evidence expectations.',
      'Complete executive walkthrough and pilot recommendation.',
    ],
    successEvidence: [
      'Executives can clearly explain what CGI does.',
      'The institution can distinguish recovery from stabilization.',
      'Recurring instability is no longer treated as isolated noise.',
      'Accountability is tied to evidence, not vague follow-up.',
      'The pilot produces a clear next-step decision.',
    ],
    executiveWalkthrough,
    closingOffer: deriveClosingOffer(tier),
  }
}