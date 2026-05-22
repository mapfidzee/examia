import type {
  CGIRouteSynthesisPosture,
} from './cgiCrossRouteContinuitySynthesisEngine'

export type CGIExecutivePostureFormat = {
  label: string
  tone: 'CALM' | 'WATCHED' | 'ELEVATED' | 'CRITICAL'
  headline: string
  description: string
  actionLanguage: string
}

export function formatCGIExecutivePosture(
  posture: CGIRouteSynthesisPosture
): CGIExecutivePostureFormat {
  if (posture === 'CRITICAL') {
    return {
      label: 'CRITICAL CONTINUITY CONCERN',
      tone: 'CRITICAL',
      headline: 'Continuity cannot yet be trusted.',
      description:
        'The current condition requires direct executive coordination, verified stabilization evidence, and visible survivability protection.',
      actionLanguage:
        'Activate executive review and keep continuity protection visible until credibility is restored.',
    }
  }

  if (posture === 'ELEVATED') {
    return {
      label: 'ELEVATED CONTINUITY EXPOSURE',
      tone: 'ELEVATED',
      headline: 'Continuity remains exposed.',
      description:
        'Stabilization may be present, but pressure, trajectory, recovery, or trustworthiness concerns remain strong enough to require active review.',
      actionLanguage:
        'Maintain executive review and verify whether stabilization is becoming durable.',
    }
  }

  if (posture === 'WATCHED') {
    return {
      label: 'CONTINUITY UNDER WATCH',
      tone: 'WATCHED',
      headline: 'Continuity is holding under observation.',
      description:
        'The current condition does not require emergency escalation, but closure confidence should remain conditional until evidence stays consistent.',
      actionLanguage:
        'Continue governance monitoring and preserve the continuity evidence trail.',
    }
  }

  return {
    label: 'CONTINUITY STABLE',
    tone: 'CALM',
    headline: 'Continuity appears stable.',
    description:
      'The reviewed intelligence surfaces do not currently show enough pressure to weaken continuity trust.',
    actionLanguage:
      'Maintain routine monitoring and preserve confirmation evidence.',
  }
}

export function formatCGIEvidenceLanguage(
  evidenceVerified: boolean,
  posture: CGIRouteSynthesisPosture
): string {
  if (evidenceVerified && posture === 'STABLE') {
    return 'Verified evidence currently supports routine continuity confidence.'
  }

  if (evidenceVerified) {
    return 'Verified evidence exists, but continued review is required because continuity exposure remains visible.'
  }

  return 'Verified stabilization evidence is required before continuity can be trusted as durable.'
}

export function formatCGISurvivabilityLanguage(
  posture: CGIRouteSynthesisPosture
): string {
  if (posture === 'CRITICAL') {
    return 'Survivability protection must remain visible until continuity credibility is restored.'
  }

  if (posture === 'ELEVATED') {
    return 'Survivability remains exposed and requires active executive monitoring.'
  }

  if (posture === 'WATCHED') {
    return 'Survivability appears to be holding, but continued confirmation is required.'
  }

  return 'Survivability appears stable under the reviewed continuity conditions.'
}

export function formatCGIGovernanceSafeLanguage(): string {
  return 'This interpretation does not judge individuals or assign blame. It reads continuity pressure, recovery credibility, trajectory, evidence, and trustworthiness as institutional conditions.'
}