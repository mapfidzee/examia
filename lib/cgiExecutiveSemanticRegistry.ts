export type CGIExecutiveSemanticDomain =
  | 'COMMAND'
  | 'PRESSURE'
  | 'TRAJECTORY'
  | 'PREDICTIVE'
  | 'RECOVERY'
  | 'RELIABILITY'
  | 'SURVIVABILITY'
  | 'EVIDENCE'
  | 'ACCOUNTABILITY'
  | 'SYNTHESIS'

export type CGIExecutiveSemanticEntry = {
  domain: CGIExecutiveSemanticDomain
  preferredTerm: string
  meaning: string
  avoid: string[]
  executiveUse: string
}

export const cgiExecutiveSemanticRegistry: CGIExecutiveSemanticEntry[] = [
  {
    domain: 'COMMAND',
    preferredTerm: 'executive posture',
    meaning:
      'The leadership stance required by the current continuity condition.',
    avoid: ['status label', 'system mode', 'alert level'],
    executiveUse:
      'Use when describing what leadership must understand, coordinate, or protect.',
  },
  {
    domain: 'PRESSURE',
    preferredTerm: 'survivability pressure',
    meaning:
      'Accumulated operational strain that may weaken the institution’s ability to preserve continuity.',
    avoid: ['stress score', 'workload issue', 'pressure metric'],
    executiveUse:
      'Use when pressure may affect continuity protection or stabilization credibility.',
  },
  {
    domain: 'TRAJECTORY',
    preferredTerm: 'continuity direction',
    meaning:
      'The movement of continuity across time: stabilizing, holding, drifting, or degrading.',
    avoid: ['trend chart', 'performance direction', 'analytics movement'],
    executiveUse:
      'Use when explaining where continuity is heading.',
  },
  {
    domain: 'PREDICTIVE',
    preferredTerm: 'early-warning posture',
    meaning:
      'A prevention-facing reading of pressure that may become visible disruption.',
    avoid: ['prediction', 'forecast score', 'risk guess'],
    executiveUse:
      'Use when identifying continuity risk before disruption fully appears.',
  },
  {
    domain: 'RECOVERY',
    preferredTerm: 'recovery credibility',
    meaning:
      'The degree to which visible recovery is becoming durable stabilization.',
    avoid: ['task completion', 'case closure', 'resolved status'],
    executiveUse:
      'Use when separating apparent recovery from stabilization that can be trusted.',
  },
  {
    domain: 'RELIABILITY',
    preferredTerm: 'continuity trustworthiness',
    meaning:
      'The degree to which stabilization can still be trusted under sustained pressure.',
    avoid: ['reliability score', 'recovery rating', 'quality grade'],
    executiveUse:
      'Use when asking whether continuity can still hold.',
  },
  {
    domain: 'SURVIVABILITY',
    preferredTerm: 'survivability protection',
    meaning:
      'The institution’s ability to absorb instability without structural failure.',
    avoid: ['uptime', 'resilience score', 'system health'],
    executiveUse:
      'Use when pressure threatens the institution’s capacity to keep operating credibly.',
  },
  {
    domain: 'EVIDENCE',
    preferredTerm: 'stabilization evidence',
    meaning:
      'Proof that recovery is holding beyond visible activity or temporary containment.',
    avoid: ['documentation', 'paperwork', 'task proof'],
    executiveUse:
      'Use when leadership needs confirmation before trusting closure.',
  },
  {
    domain: 'ACCOUNTABILITY',
    preferredTerm: 'accountability state',
    meaning:
      'The ownership, action, evidence, and verification status required to protect continuity.',
    avoid: ['blame', 'fault', 'person responsible'],
    executiveUse:
      'Use only in a governance-safe, non-punitive way.',
  },
  {
    domain: 'SYNTHESIS',
    preferredTerm: 'executive continuity reading',
    meaning:
      'A compressed cross-route interpretation of whether continuity can still be trusted.',
    avoid: ['dashboard summary', 'report output', 'combined metrics'],
    executiveUse:
      'Use when CGI compresses pressure, trajectory, recovery, warning, and trustworthiness into one executive view.',
  },
]

export function getCGISemanticEntry(
  domain: CGIExecutiveSemanticDomain
): CGIExecutiveSemanticEntry {
  return (
    cgiExecutiveSemanticRegistry.find(
      (entry) => entry.domain === domain
    ) || cgiExecutiveSemanticRegistry[0]
  )
}

export function getCGIPreferredTerm(
  domain: CGIExecutiveSemanticDomain
): string {
  return getCGISemanticEntry(domain).preferredTerm
}

export function getCGIExecutiveUse(
  domain: CGIExecutiveSemanticDomain
): string {
  return getCGISemanticEntry(domain).executiveUse
}