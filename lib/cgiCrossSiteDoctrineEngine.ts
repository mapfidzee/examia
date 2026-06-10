 import { buildCGIExecutiveBriefing } from './cgiExecutiveBriefingGenerator'
import type { CGIRouteSynthesisPosture } from './cgiCrossRouteContinuitySynthesisEngine'

export type CGISiteContinuityProfile = {
  siteName: string
  region: string
  pressurePosture: CGIRouteSynthesisPosture
  trajectoryPosture: CGIRouteSynthesisPosture
  predictivePosture: CGIRouteSynthesisPosture
  recoveryPosture: CGIRouteSynthesisPosture
  reliabilityPosture: CGIRouteSynthesisPosture
  evidenceVerified: boolean
  accountabilityActive: boolean
  structuralMemoryVisible: boolean
  continuityFinding: string
  sharedDependency: string
  recoveryMeaning: string
}

export type CGICrossSiteMaturity =
  | 'ISOLATED INSTABILITY'
  | 'REPEATED INSTABILITY'
  | 'SHARED DEPENDENCY'
  | 'STRUCTURAL FRAGILITY'
  | 'ENTERPRISE EXPOSURE'

export type CGISiteBriefing = {
  site: CGISiteContinuityProfile
  briefing: ReturnType<typeof buildCGIExecutiveBriefing>
}

export type CGICrossSitePattern = {
  patternName: string
  maturity: CGICrossSiteMaturity
  affectedSites: string[]
  dominantSite: string
  sharedDependency: string
  executiveQuestion: string
  enterpriseExposure: string
  recoveryPattern: string
  commandMeaning: string
  coordinationMeaning: string
  executiveMeaning: string
  nextGovernedDestination: string
  evidenceStandard: string
  boardWarning: string
  requiredAction: string
}

export type CGICrossSiteDecision = {
  chainPosition: string
  crossSiteReason: string
  nextGovernedDestination: string
  executiveReviewRequired: boolean
  situationRoomRequired: boolean
  coordinationRequired: boolean
  auditRequired: boolean
  continuityHistoryRequired: boolean
  evidenceStandard: string
}

export type CGICrossSiteDoctrineReading = {
  siteBriefings: CGISiteBriefing[]
  dominantSite: CGISiteContinuityProfile
  dominantBriefing: ReturnType<typeof buildCGIExecutiveBriefing>
  pattern: CGICrossSitePattern
  decision: CGICrossSiteDecision
  criticalSites: number
  elevatedSites: number
  structuralMemorySites: number
  evidenceGaps: number
  affectedSites: number
  copyReadyBrief: string
}

const postureWeight: Record<CGIRouteSynthesisPosture, number> = {
  STABLE: 1,
  WATCHED: 2,
  ELEVATED: 3,
  CRITICAL: 4,
}

export function buildCGICrossSiteDoctrine(
  sites: CGISiteContinuityProfile[],
  pilotScenarioName = 'Cross-Site Continuity Scenario',
): CGICrossSiteDoctrineReading {
  const safeSites = sites.length > 0 ? sites : [buildEmptySiteProfile()]

  const siteBriefings = safeSites.map((site) => ({
    site,
    briefing: buildCGIExecutiveBriefing(site),
  }))

  const dominantSite = strongestSite(safeSites)
  const dominantBriefing = buildCGIExecutiveBriefing(dominantSite)
  const pattern = buildCrossSitePattern(siteBriefings)
  const decision = buildCrossSiteDecision(pattern)

  const criticalSites = siteBriefings.filter(
    ({ briefing }) => briefing.synthesis.synthesisPosture === 'CRITICAL',
  ).length

  const elevatedSites = siteBriefings.filter(
    ({ briefing }) => briefing.synthesis.synthesisPosture === 'ELEVATED',
  ).length

  const structuralMemorySites = safeSites.filter(
    (site) => site.structuralMemoryVisible,
  ).length

  const evidenceGaps = safeSites.filter((site) => !site.evidenceVerified).length

  const affectedSites = pattern.affectedSites.length

  const copyReadyBrief = buildCrossSiteBrief({
    pattern,
    decision,
    criticalSites,
    elevatedSites,
    evidenceGaps,
    structuralMemorySites,
    pilotScenario: pilotScenarioName,
  })

  return {
    siteBriefings,
    dominantSite,
    dominantBriefing,
    pattern,
    decision,
    criticalSites,
    elevatedSites,
    structuralMemorySites,
    evidenceGaps,
    affectedSites,
    copyReadyBrief,
  }
}

export function strongestSite(
  siteProfiles: CGISiteContinuityProfile[],
): CGISiteContinuityProfile {
  return [...siteProfiles].sort((a, b) => siteRiskScore(b) - siteRiskScore(a))[0]
}

export function siteRiskScore(site: CGISiteContinuityProfile) {
  return (
    postureWeight[site.pressurePosture] +
    postureWeight[site.trajectoryPosture] +
    postureWeight[site.predictivePosture] +
    postureWeight[site.recoveryPosture] +
    postureWeight[site.reliabilityPosture] +
    (site.evidenceVerified ? 0 : 2) +
    (site.structuralMemoryVisible ? 1 : 0)
  )
}

export function buildCrossSitePattern(
  siteBriefings: CGISiteBriefing[],
): CGICrossSitePattern {
  const affectedSites = siteBriefings.map(({ site }) => site.siteName)
  const dominant = strongestSite(siteBriefings.map(({ site }) => site))

  const dependencies = Array.from(
    new Set(
      siteBriefings
        .map(({ site }) => site.sharedDependency)
        .filter((value) => value.trim().length > 0),
    ),
  )

  const criticalSites = siteBriefings.filter(
    ({ briefing }) => briefing.synthesis.synthesisPosture === 'CRITICAL',
  ).length

  const elevatedSites = siteBriefings.filter(
    ({ briefing }) => briefing.synthesis.synthesisPosture === 'ELEVATED',
  ).length

  const evidenceGaps = siteBriefings.filter(({ site }) => !site.evidenceVerified)
    .length

  const sharedDependencyVisible =
    dependencies.length === 1 && dependencies[0].trim().length > 0

  const maturity = deriveCrossSiteMaturity({
    criticalSites,
    elevatedSites,
    evidenceGaps,
    sharedDependencyVisible,
    affectedSites: affectedSites.length,
  })

  return {
    patternName: derivePatternName(maturity, dependencies),
    maturity,
    affectedSites,
    dominantSite: dominant.siteName,
    sharedDependency:
      dependencies.length > 0 ? dependencies.join(', ') : 'No shared dependency recorded',
    executiveQuestion: 'Is instability isolated or becoming enterprise-wide?',
    enterpriseExposure: deriveEnterpriseExposure(maturity),
    recoveryPattern: deriveRecoveryPattern(maturity, evidenceGaps),
    commandMeaning: deriveCommandMeaning(maturity),
    coordinationMeaning:
      'Coordination must confirm alternatives, ownership, site-level recovery evidence, and continuity capacity before cross-site confidence is restored.',
    executiveMeaning: deriveExecutiveMeaning(maturity),
    nextGovernedDestination: deriveNextGovernedDestination(maturity),
    evidenceStandard:
      'Preserve affected sites, shared dependency, site posture, recovery status, command meaning, coordination need, evidence maturity, recurrence signals, and institutional memory statement.',
    boardWarning:
      'Do not allow local stabilization to conceal shared dependency, structural fragility, or enterprise continuity exposure.',
    requiredAction: deriveRequiredAction(maturity),
  }
}

export function deriveCrossSiteMaturity(input: {
  criticalSites: number
  elevatedSites: number
  evidenceGaps: number
  sharedDependencyVisible: boolean
  affectedSites: number
}): CGICrossSiteMaturity {
  if (input.criticalSites > 0 && input.sharedDependencyVisible) {
    return 'ENTERPRISE EXPOSURE'
  }

  if (input.criticalSites > 0 || input.elevatedSites >= 2) {
    return 'STRUCTURAL FRAGILITY'
  }

  if (input.sharedDependencyVisible && input.affectedSites > 1) {
    return 'SHARED DEPENDENCY'
  }

  if (input.evidenceGaps > 0 || input.elevatedSites > 0) {
    return 'REPEATED INSTABILITY'
  }

  return 'ISOLATED INSTABILITY'
}

export function buildCrossSiteDecision(
  pattern: CGICrossSitePattern,
): CGICrossSiteDecision {
  if (pattern.maturity === 'ENTERPRISE EXPOSURE') {
    return {
      chainPosition:
        'Coordination has escalated into cross-site enterprise exposure review.',
      crossSiteReason:
        'Cross-site review is required because one site carries critical continuity pressure while other sites share the same dependency.',
      nextGovernedDestination: 'Executive Center',
      executiveReviewRequired: true,
      situationRoomRequired: true,
      coordinationRequired: true,
      auditRequired: true,
      continuityHistoryRequired: true,
      evidenceStandard: pattern.evidenceStandard,
    }
  }

  if (pattern.maturity === 'STRUCTURAL FRAGILITY') {
    return {
      chainPosition:
        'Cross-site review has identified structural fragility across operational sites.',
      crossSiteReason:
        'The instability may no longer be isolated because multiple sites show elevated pressure, evidence gaps, or recovery weakness.',
      nextGovernedDestination: 'Situation Room',
      executiveReviewRequired: true,
      situationRoomRequired: true,
      coordinationRequired: true,
      auditRequired: true,
      continuityHistoryRequired: true,
      evidenceStandard: pattern.evidenceStandard,
    }
  }

  if (pattern.maturity === 'SHARED DEPENDENCY') {
    return {
      chainPosition:
        'Cross-site review has identified shared dependency requiring enterprise interpretation.',
      crossSiteReason:
        'Multiple sites appear connected by the same operational dependency.',
      nextGovernedDestination: 'Situation Room',
      executiveReviewRequired: false,
      situationRoomRequired: true,
      coordinationRequired: true,
      auditRequired: true,
      continuityHistoryRequired: true,
      evidenceStandard: pattern.evidenceStandard,
    }
  }

  if (pattern.maturity === 'REPEATED INSTABILITY') {
    return {
      chainPosition:
        'Cross-site review is holding repeated instability under coordination watch.',
      crossSiteReason:
        'Evidence gaps or repeated pressure remain visible, but enterprise exposure is not yet proven.',
      nextGovernedDestination: 'Coordination Center',
      executiveReviewRequired: false,
      situationRoomRequired: false,
      coordinationRequired: true,
      auditRequired: true,
      continuityHistoryRequired: false,
      evidenceStandard: pattern.evidenceStandard,
    }
  }

  return {
    chainPosition:
      'Cross-site review is stable and can remain under monitored enterprise visibility.',
    crossSiteReason:
      'Current comparison does not prove repeated, shared, structural, or enterprise-wide instability.',
    nextGovernedDestination: 'Audit Reconstruction',
    executiveReviewRequired: false,
    situationRoomRequired: false,
    coordinationRequired: false,
    auditRequired: true,
    continuityHistoryRequired: false,
    evidenceStandard: pattern.evidenceStandard,
  }
}

function derivePatternName(
  maturity: CGICrossSiteMaturity,
  dependencies: string[],
) {
  const dependency =
    dependencies.length === 1 ? dependencies[0] : 'Cross-Site Continuity'

  if (maturity === 'ENTERPRISE EXPOSURE') {
    return `${dependency} Enterprise Exposure Pattern`
  }

  if (maturity === 'STRUCTURAL FRAGILITY') {
    return `${dependency} Structural Fragility Pattern`
  }

  if (maturity === 'SHARED DEPENDENCY') {
    return `${dependency} Shared Dependency Pattern`
  }

  if (maturity === 'REPEATED INSTABILITY') {
    return `${dependency} Repeated Instability Pattern`
  }

  return `${dependency} Isolated Instability Pattern`
}

function deriveNextGovernedDestination(maturity: CGICrossSiteMaturity) {
  if (maturity === 'ENTERPRISE EXPOSURE') return 'Executive Center'
  if (maturity === 'STRUCTURAL FRAGILITY') return 'Situation Room'
  if (maturity === 'SHARED DEPENDENCY') return 'Situation Room'
  if (maturity === 'REPEATED INSTABILITY') return 'Coordination Center'

  return 'Audit Reconstruction'
}

function deriveEnterpriseExposure(maturity: CGICrossSiteMaturity) {
  if (maturity === 'ENTERPRISE EXPOSURE') {
    return 'Instability is no longer safely interpretable as local. Shared dependency and critical posture create enterprise continuity exposure.'
  }

  if (maturity === 'STRUCTURAL FRAGILITY') {
    return 'The pattern suggests structural fragility because multiple sites carry elevated pressure, evidence weakness, or recovery uncertainty.'
  }

  if (maturity === 'SHARED DEPENDENCY') {
    return 'Multiple sites appear linked by the same dependency. The risk may be systemic even if only one site is visibly severe.'
  }

  if (maturity === 'REPEATED INSTABILITY') {
    return 'Instability is repeating or evidence remains weak. Cross-site visibility should remain active until recurrence is disproven.'
  }

  return 'Current site comparison does not prove enterprise exposure.'
}

function deriveRecoveryPattern(
  maturity: CGICrossSiteMaturity,
  evidenceGaps: number,
) {
  if (maturity === 'ENTERPRISE EXPOSURE' || maturity === 'STRUCTURAL FRAGILITY') {
    return 'Recovery is uneven and cannot be trusted as durable until all affected sites preserve evidence of stabilization.'
  }

  if (maturity === 'SHARED DEPENDENCY') {
    return 'Recovery may appear local, but the shared dependency must be resolved before confidence is restored.'
  }

  if (evidenceGaps > 0) {
    return 'Recovery evidence remains incomplete and should not be treated as institutional stability.'
  }

  return 'Recovery appears contained, but cross-site memory should remain preserved.'
}

function deriveCommandMeaning(maturity: CGICrossSiteMaturity) {
  if (maturity === 'ENTERPRISE EXPOSURE') {
    return 'Command visibility should remain elevated because site-level recovery may not protect enterprise continuity.'
  }

  if (maturity === 'STRUCTURAL FRAGILITY') {
    return 'Command should watch structural weakness until coordination and site-level evidence mature.'
  }

  if (maturity === 'SHARED DEPENDENCY') {
    return 'Command should understand the dependency before releasing continuity confidence.'
  }

  return 'Command can remain available without immediate escalation.'
}

function deriveExecutiveMeaning(maturity: CGICrossSiteMaturity) {
  if (maturity === 'ENTERPRISE EXPOSURE') {
    return 'Leadership should treat the pattern as enterprise continuity exposure until dependency risk, recurrence risk, and recovery durability are proven across all affected sites.'
  }

  if (maturity === 'STRUCTURAL FRAGILITY') {
    return 'Leadership should understand that site-level issues may be connected by structural weakness rather than isolated events.'
  }

  if (maturity === 'SHARED DEPENDENCY') {
    return 'Leadership should know that multiple sites may inherit the same continuity weakness.'
  }

  if (maturity === 'REPEATED INSTABILITY') {
    return 'Leadership does not need full escalation yet, but repeated instability should remain visible.'
  }

  return 'Leadership can treat the current signal as local unless recurrence, shared dependency, or evidence weakness appears.'
}

function deriveRequiredAction(maturity: CGICrossSiteMaturity) {
  if (maturity === 'ENTERPRISE EXPOSURE') {
    return 'Escalate to Executive Center and preserve cross-site memory for audit reconstruction.'
  }

  if (maturity === 'STRUCTURAL FRAGILITY') {
    return 'Move to Situation Room for enterprise operating picture interpretation.'
  }

  if (maturity === 'SHARED DEPENDENCY') {
    return 'Move to Situation Room and require coordination evidence on the shared dependency.'
  }

  if (maturity === 'REPEATED INSTABILITY') {
    return 'Return to Coordination Center until recurrence, evidence, and ownership are clarified.'
  }

  return 'Preserve audit memory and continue monitored visibility.'
}

export function buildCrossSiteBrief(input: {
  pattern: CGICrossSitePattern
  decision: CGICrossSiteDecision
  criticalSites: number
  elevatedSites: number
  evidenceGaps: number
  structuralMemorySites: number
  pilotScenario: string
}) {
  return [
    'TSINAXA CGI ENTERPRISE CROSS-SITE INTELLIGENCE BRIEF',
    '',
    `Pilot Scenario: ${input.pilotScenario}`,
    '',
    `Executive Question: ${input.pattern.executiveQuestion}`,
    '',
    `Cross-Site Maturity: ${input.pattern.maturity}`,
    '',
    `Pattern: ${input.pattern.patternName}`,
    '',
    `Affected Sites: ${input.pattern.affectedSites.join(', ')}`,
    '',
    `Dominant Site: ${input.pattern.dominantSite}`,
    '',
    `Shared Dependency: ${input.pattern.sharedDependency}`,
    '',
    `Critical Sites: ${input.criticalSites}`,
    '',
    `Elevated Sites: ${input.elevatedSites}`,
    '',
    `Evidence Gaps: ${input.evidenceGaps}`,
    '',
    `Memory Sites: ${input.structuralMemorySites}`,
    '',
    `Enterprise Exposure: ${input.pattern.enterpriseExposure}`,
    '',
    `Recovery Pattern: ${input.pattern.recoveryPattern}`,
    '',
    `Command Meaning: ${input.pattern.commandMeaning}`,
    '',
    `Coordination Meaning: ${input.pattern.coordinationMeaning}`,
    '',
    `Executive Meaning: ${input.pattern.executiveMeaning}`,
    '',
    `Chain Position: ${input.decision.chainPosition}`,
    '',
    `Next Destination: ${input.decision.nextGovernedDestination}`,
    '',
    `Required Action: ${input.pattern.requiredAction}`,
    '',
    `Evidence Standard: ${input.pattern.evidenceStandard}`,
    '',
    `Board Warning: ${input.pattern.boardWarning}`,
    '',
    'Governance-Safe Meaning:',
    'Cross-Site determines whether visible instability remains local, repeated, shared, structural, or enterprise-wide before continuity meaning enters Situation Room, Executive Center, Memory Board, or Audit.',
  ].join('\n')
}

function buildEmptySiteProfile(): CGISiteContinuityProfile {
  return {
    siteName: 'No Site Recorded',
    region: 'No Region Recorded',
    pressurePosture: 'STABLE',
    trajectoryPosture: 'STABLE',
    predictivePosture: 'STABLE',
    recoveryPosture: 'STABLE',
    reliabilityPosture: 'STABLE',
    evidenceVerified: true,
    accountabilityActive: false,
    structuralMemoryVisible: false,
    continuityFinding:
      'No site continuity profile has been supplied for cross-site interpretation.',
    sharedDependency: '',
    recoveryMeaning:
      'No cross-site recovery meaning is currently available because no site profile exists.',
  }
}