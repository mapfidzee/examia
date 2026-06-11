export type TeacherProfileForGovernanceDoctrine = {
  id: string
  full_name: string
  email: string
  subjects: string[] | null
  grade_levels: string[] | null
  province: string | null
  spoken_languages: string[] | null
  hourly_rate: number | null
  bio: string | null
  status: string
  created_at?: string
}

export type GovernancePosture =
  | 'AUTHORITY CONTROLLED'
  | 'AUTHORITY UNDER REVIEW'
  | 'AUTHORITY CONDITIONAL'
  | 'AUTHORITY RESTRICTED'
  | 'AUTHORITY COMPROMISED'
  | 'AUTHORITY MEMORY ABSENT'

export type AuthorityDecision =
  | 'ACTIVATE_WITH_EVIDENCE'
  | 'VERIFY_BEFORE_ACTIVATION'
  | 'RESTRICT_AUTHORITY'
  | 'SUSPEND_AUTHORITY'
  | 'REMOVE_AUTHORITY'
  | 'BUILD_GOVERNANCE_MEMORY'

export type GovernanceIntelligence = {
  posture: GovernancePosture
  decision: AuthorityDecision
  question: string
  thesis: string
  authorityMeaning: string
  accessRisk: string
  responderTrust: string
  restrictionMeaning: string
  auditMeaning: string
  doctrineMeaning: string
  executiveAction: string
  evidenceRequirement: string
  memoryRequirement: string
  boardWarning: string
  generatedBrief: string
  counts: {
    total: number
    pending: number
    underReview: number
    verified: number
    active: number
    restricted: number
    removed: number
  }
}

export const STATUS_FLOW = [
  'PENDING',
  'UNDER_REVIEW',
  'VERIFIED',
  'ACTIVE',
  'RESTRICTED',
  'SUSPENDED',
  'REMOVED',
]

export const GOVERNANCE_REASONS: Record<string, string[]> = {
  PENDING: ['Initial responder submission received', 'Awaiting governance review'],
  UNDER_REVIEW: [
    'Governance review initiated',
    'Verification evidence under assessment',
    'Safeguarding review in progress',
  ],
  VERIFIED: [
    'Identity reviewed',
    'Capability evidence accepted',
    'Safeguarding accepted',
    'Operational readiness confirmed',
    'Institutional recommendation accepted',
    'Regional approval completed',
  ],
  ACTIVE: [
    'Responder approved for assignment',
    'Governance activation completed',
    'District operational activation approved',
    'Institution-linked activation approved',
    'Responder cleared for intervention routing',
  ],
  RESTRICTED: [
    'Limited operational scope applied',
    'Temporary governance restriction',
    'Escalation monitoring active',
    'Operational visibility reduced',
  ],
  SUSPENDED: [
    'Safeguarding review pending',
    'Operational concern detected',
    'Repeated assignment non-response',
    'Institutional escalation pending',
    'Policy breach investigation',
  ],
  REMOVED: [
    'Governance removal approved',
    'Safeguarding violation confirmed',
    'Operational trust failure',
    'Institutional removal request',
    'Repeated governance breach',
  ],
}

export const doctrineLocks = [
  {
    title: 'Continuity Authority Must Be Governed',
    text:
      'Access, responder activation, restriction, suspension, and removal must remain governed by role, trust state, evidence, and continuity purpose.',
  },
  {
    title: 'Non-Punitive Interpretation',
    text:
      'Governance signals must protect continuity and safeguarding. They must not become blame, ranking, humiliation, or uncontrolled surveillance.',
  },
  {
    title: 'Authority Requires Evidence',
    text:
      'A responder is not operationally trusted because a profile exists. Authority requires verification, scope clarity, safeguarding review, and audit memory.',
  },
  {
    title: 'Audit Must Reconstruct Authority',
    text:
      'Every governance action must be reconstructable: who changed authority, why, from what status, to what status, and with what evidence.',
  },
]

export const deploymentHardening = [
  'Environment variables verified before deployment',
  'Supabase access and RLS policies reviewed',
  'Command route restricted to authorized leaders',
  'Audit route preserved as institutional memory layer',
  'Recovery protocol reviewed before pilot launch',
  'Access-denied pathway tested',
  'Responder suspension and restriction behavior tested',
  'Manual degraded-operations capture process defined',
  'Backup and export discipline scheduled',
  'Governance action logging verified',
]

export function buildGovernanceIntelligence(
  profiles: TeacherProfileForGovernanceDoctrine[],
): GovernanceIntelligence {
  const total = profiles.length

  const pending = profiles.filter(
    (item) => normalizedStatus(item.status) === 'PENDING',
  ).length

  const underReview = profiles.filter(
    (item) => normalizedStatus(item.status) === 'UNDER_REVIEW',
  ).length

  const verified = profiles.filter(
    (item) => normalizedStatus(item.status) === 'VERIFIED',
  ).length

  const active = profiles.filter(
    (item) => normalizedStatus(item.status) === 'ACTIVE',
  ).length

  const restricted = profiles.filter((item) =>
    ['RESTRICTED', 'SUSPENDED'].includes(normalizedStatus(item.status)),
  ).length

  const removed = profiles.filter(
    (item) => normalizedStatus(item.status) === 'REMOVED',
  ).length

  const posture = deriveGovernancePosture({
    total,
    pending,
    underReview,
    verified,
    active,
    restricted,
    removed,
  })

  const decision = deriveAuthorityDecision(posture)

  const question =
    'Can continuity authority be trusted, controlled, and reconstructed?'

  const accessRisk = deriveAccessRisk({
    total,
    pending,
    underReview,
    restricted,
    removed,
  })

  const responderTrust = deriveResponderTrust({
    total,
    verified,
    active,
    pending,
    underReview,
  })

  const restrictionMeaning = deriveRestrictionMeaning({
    restricted,
    removed,
  })

  const auditMeaning = deriveAuditMeaning(posture)

  const doctrineMeaning =
    'Governance protects authority from drifting beyond role, trust, evidence, safeguarding, and continuity purpose.'

  const authorityMeaning = deriveAuthorityMeaning(posture)
  const executiveAction = deriveExecutiveAction(posture)

  const evidenceRequirement =
    'Preserve profile identity, governance status, previous authority state, new authority state, reason, actor, trust score, safeguarding status, operational scope, and governance notes.'

  const memoryRequirement =
    'Preserve every authority change so activation, restriction, suspension, removal, and restoration remain reconstructable.'

  const boardWarning =
    'Do not allow operational authority to exceed evidence, role permission, safeguarding review, or audit memory.'

  const thesis = `${posture}: ${authorityMeaning}`

  const generatedBrief = [
    'TSINAXA CGI ENTERPRISE GOVERNANCE INTELLIGENCE BRIEF',
    '',
    `Executive Governance Question: ${question}`,
    '',
    `Governance Posture: ${posture}`,
    '',
    `Authority Decision: ${decision}`,
    '',
    `Enterprise Thesis: ${thesis}`,
    '',
    `Total Profiles: ${total}`,
    '',
    `Pending Review: ${pending}`,
    '',
    `Under Review: ${underReview}`,
    '',
    `Verified: ${verified}`,
    '',
    `Active: ${active}`,
    '',
    `Restricted / Suspended: ${restricted}`,
    '',
    `Removed: ${removed}`,
    '',
    `Access Risk: ${accessRisk}`,
    '',
    `Responder Trust: ${responderTrust}`,
    '',
    `Restriction Meaning: ${restrictionMeaning}`,
    '',
    `Audit Meaning: ${auditMeaning}`,
    '',
    `Doctrine Meaning: ${doctrineMeaning}`,
    '',
    `Evidence Requirement: ${evidenceRequirement}`,
    '',
    `Memory Requirement: ${memoryRequirement}`,
    '',
    `Board Warning: ${boardWarning}`,
    '',
    `Executive Action: ${executiveAction}`,
    '',
    'Governance-Safe Meaning:',
    'Governance controls authority without assigning blame. It protects continuity by ensuring that access, activation, restriction, suspension, and removal remain evidence-bound and reconstructable.',
  ].join('\n')

  return {
    posture,
    decision,
    question,
    thesis,
    authorityMeaning,
    accessRisk,
    responderTrust,
    restrictionMeaning,
    auditMeaning,
    doctrineMeaning,
    executiveAction,
    evidenceRequirement,
    memoryRequirement,
    boardWarning,
    generatedBrief,
    counts: {
      total,
      pending,
      underReview,
      verified,
      active,
      restricted,
      removed,
    },
  }
}

export function deriveGovernancePosture(input: {
  total: number
  pending: number
  underReview: number
  verified: number
  active: number
  restricted: number
  removed: number
}): GovernancePosture {
  if (input.total === 0) return 'AUTHORITY MEMORY ABSENT'

  if (input.removed > 0 || input.restricted >= 3) {
    return 'AUTHORITY COMPROMISED'
  }

  if (input.restricted > 0) {
    return 'AUTHORITY RESTRICTED'
  }

  if (input.pending > 0 || input.underReview > 0) {
    return 'AUTHORITY UNDER REVIEW'
  }

  if (input.verified > 0 && input.active === 0) {
    return 'AUTHORITY CONDITIONAL'
  }

  return 'AUTHORITY CONTROLLED'
}

export function deriveAuthorityDecision(
  posture: GovernancePosture,
): AuthorityDecision {
  if (posture === 'AUTHORITY CONTROLLED') return 'ACTIVATE_WITH_EVIDENCE'
  if (posture === 'AUTHORITY CONDITIONAL') return 'VERIFY_BEFORE_ACTIVATION'
  if (posture === 'AUTHORITY UNDER REVIEW') return 'VERIFY_BEFORE_ACTIVATION'
  if (posture === 'AUTHORITY RESTRICTED') return 'RESTRICT_AUTHORITY'
  if (posture === 'AUTHORITY COMPROMISED') return 'SUSPEND_AUTHORITY'
  return 'BUILD_GOVERNANCE_MEMORY'
}

export function deriveAccessRisk(input: {
  total: number
  pending: number
  underReview: number
  restricted: number
  removed: number
}) {
  if (input.total === 0) {
    return 'Access risk cannot be interpreted because no authority memory exists.'
  }

  if (input.removed > 0 || input.restricted >= 3) {
    return 'Access risk is elevated because restriction, suspension, or removal is visible.'
  }

  if (input.pending > 0 || input.underReview > 0) {
    return 'Access risk is conditional because some authority states remain under review.'
  }

  return 'Access risk appears controlled under current governance memory.'
}

export function deriveResponderTrust(input: {
  total: number
  verified: number
  active: number
  pending: number
  underReview: number
}) {
  if (input.total === 0) {
    return 'Responder trust cannot be established without governance memory.'
  }

  if (input.active > 0 && input.pending === 0 && input.underReview === 0) {
    return 'Responder trust is currently operationally usable with evidence preserved.'
  }

  if (input.verified > 0 || input.active > 0) {
    return 'Responder trust is partially established but remains conditional.'
  }

  return 'Responder trust requires further verification before operational authority expands.'
}

export function deriveRestrictionMeaning(input: {
  restricted: number
  removed: number
}) {
  if (input.removed > 0) {
    return 'Removal is visible, meaning authority failure must remain preserved for audit.'
  }

  if (input.restricted > 0) {
    return 'Restriction or suspension is active, meaning authority has been narrowed to protect continuity.'
  }

  return 'No restriction or removal is currently visible.'
}

export function deriveAuditMeaning(posture: GovernancePosture) {
  if (posture === 'AUTHORITY MEMORY ABSENT') {
    return 'Audit cannot reconstruct authority until governance memory exists.'
  }

  if (
    posture === 'AUTHORITY COMPROMISED' ||
    posture === 'AUTHORITY RESTRICTED'
  ) {
    return 'Audit must preserve why authority was narrowed, suspended, or removed.'
  }

  if (posture === 'AUTHORITY UNDER REVIEW') {
    return 'Audit must preserve why authority remains conditional before activation.'
  }

  return 'Audit can preserve the authority chain under current governance memory.'
}

export function deriveAuthorityMeaning(posture: GovernancePosture) {
  if (posture === 'AUTHORITY CONTROLLED') {
    return 'Continuity authority appears controlled by role, verification, trust state, and governance memory.'
  }

  if (posture === 'AUTHORITY CONDITIONAL') {
    return 'Continuity authority is forming, but activation should remain evidence-bound.'
  }

  if (posture === 'AUTHORITY UNDER REVIEW') {
    return 'Continuity authority cannot be fully trusted until review and verification are completed.'
  }

  if (posture === 'AUTHORITY RESTRICTED') {
    return 'Continuity authority has been narrowed to protect trust, safeguarding, and institutional control.'
  }

  if (posture === 'AUTHORITY COMPROMISED') {
    return 'Continuity authority is compromised and requires executive governance visibility.'
  }

  return 'Continuity authority cannot be interpreted because governance memory is absent.'
}

export function deriveExecutiveAction(posture: GovernancePosture) {
  if (posture === 'AUTHORITY CONTROLLED') {
    return 'Maintain authority monitoring and preserve governance action memory.'
  }

  if (posture === 'AUTHORITY CONDITIONAL') {
    return 'Complete verification before expanding operational authority.'
  }

  if (posture === 'AUTHORITY UNDER REVIEW') {
    return 'Hold authority under review and require evidence before activation.'
  }

  if (posture === 'AUTHORITY RESTRICTED') {
    return 'Maintain restricted authority until evidence supports restoration or escalation.'
  }

  if (posture === 'AUTHORITY COMPROMISED') {
    return 'Escalate governance review and preserve suspension, removal, or restriction evidence.'
  }

  return 'Build governance memory before authority decisions are trusted.'
}

export function normalizedStatus(status: string) {
  if (status === 'APPROVED') return 'VERIFIED'
  return status || 'PENDING'
}

export function trustScoreForStatus(status: string) {
  if (status === 'ACTIVE') return 75
  if (status === 'VERIFIED') return 65
  if (status === 'UNDER_REVIEW') return 50
  if (status === 'RESTRICTED') return 35
  if (status === 'SUSPENDED') return 20
  if (status === 'REMOVED') return 0
  return 45
}