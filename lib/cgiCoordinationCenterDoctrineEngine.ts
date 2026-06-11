import { buildCGIExecutiveBriefing } from '@/lib/cgiExecutiveBriefingGenerator'
import {
  formatCGIEvidenceLanguage,
  formatCGIExecutivePosture,
  formatCGIGovernanceSafeLanguage,
  formatCGISurvivabilityLanguage,
} from '@/lib/cgiExecutivePostureFormatter'
import type { CGIRouteSynthesisPosture } from '@/lib/cgiCrossRouteContinuitySynthesisEngine'

export type CoordinationSite = {
  name: string
  region: string
  coordinationNeed: 'ROUTINE' | 'ACTIVE' | 'EXECUTIVE'
  pressurePosture: CGIRouteSynthesisPosture
  trajectoryPosture: CGIRouteSynthesisPosture
  predictivePosture: CGIRouteSynthesisPosture
  recoveryPosture: CGIRouteSynthesisPosture
  reliabilityPosture: CGIRouteSynthesisPosture
  evidenceVerified: boolean
  accountabilityActive: boolean
  structuralMemoryVisible: boolean
}

export type CoordinationCenterDoctrine = {
  siteBriefings: Array<{
    site: CoordinationSite
    briefing: ReturnType<typeof buildCGIExecutiveBriefing>
  }>
  dominantSite: CoordinationSite
  dominantBriefing: ReturnType<typeof buildCGIExecutiveBriefing>
  executivePosture: ReturnType<typeof formatCGIExecutivePosture>
  evidenceLanguage: string
  survivabilityLanguage: string
  governanceLanguage: string
  executiveCoordinationCount: number
  activeCoordinationCount: number
  structuralMemoryCount: number
  coordinationScope: string
  coordinationQuestion: string
  coordinationThesis: string
  coordinationDoctrine: string
  stabilizationLogic: string
  copyReadyCoordinationBrief: string
}

export const coordinationSites: CoordinationSite[] = [
  {
    name: 'North Unit',
    region: 'Primary Operations',
    coordinationNeed: 'ACTIVE',
    pressurePosture: 'ELEVATED',
    trajectoryPosture: 'ELEVATED',
    predictivePosture: 'ELEVATED',
    recoveryPosture: 'WATCHED',
    reliabilityPosture: 'ELEVATED',
    evidenceVerified: false,
    accountabilityActive: true,
    structuralMemoryVisible: true,
  },
  {
    name: 'South Unit',
    region: 'Secondary Operations',
    coordinationNeed: 'ROUTINE',
    pressurePosture: 'WATCHED',
    trajectoryPosture: 'WATCHED',
    predictivePosture: 'WATCHED',
    recoveryPosture: 'WATCHED',
    reliabilityPosture: 'WATCHED',
    evidenceVerified: true,
    accountabilityActive: true,
    structuralMemoryVisible: false,
  },
  {
    name: 'East Unit',
    region: 'High Demand Operations',
    coordinationNeed: 'EXECUTIVE',
    pressurePosture: 'CRITICAL',
    trajectoryPosture: 'ELEVATED',
    predictivePosture: 'ELEVATED',
    recoveryPosture: 'ELEVATED',
    reliabilityPosture: 'CRITICAL',
    evidenceVerified: false,
    accountabilityActive: true,
    structuralMemoryVisible: true,
  },
]

export const postureWeight: Record<CGIRouteSynthesisPosture, number> = {
  STABLE: 1,
  WATCHED: 2,
  ELEVATED: 3,
  CRITICAL: 4,
}

export function buildCGICoordinationCenterDoctrine(
  sites: CoordinationSite[] = coordinationSites,
): CoordinationCenterDoctrine {
  const siteBriefings = sites.map((site) => ({
    site,
    briefing: buildCGIExecutiveBriefing(site),
  }))

  const dominantSite = strongestCoordinationSite(sites)
  const dominantBriefing = buildCGIExecutiveBriefing(dominantSite)

  const executivePosture = formatCGIExecutivePosture(
    dominantBriefing.synthesis.synthesisPosture,
  )

  const evidenceLanguage = formatCGIEvidenceLanguage(
    dominantSite.evidenceVerified,
    dominantBriefing.synthesis.synthesisPosture,
  )

  const survivabilityLanguage = formatCGISurvivabilityLanguage(
    dominantBriefing.synthesis.synthesisPosture,
  )

  const governanceLanguage = formatCGIGovernanceSafeLanguage()

  const executiveCoordinationCount = sites.filter(
    (site) => site.coordinationNeed === 'EXECUTIVE',
  ).length

  const activeCoordinationCount = sites.filter(
    (site) => site.coordinationNeed === 'ACTIVE',
  ).length

  const structuralMemoryCount = sites.filter(
    (site) => site.structuralMemoryVisible,
  ).length

  const coordinationScope = `${sites.length} sites reviewed • ${executiveCoordinationCount} executive • ${activeCoordinationCount} active`

  const coordinationQuestion =
    'What must synchronize before continuity can safely move?'

  const coordinationThesis = deriveCoordinationThesis({
    dominantSite,
    dominantBriefing,
    executiveCoordinationCount,
    activeCoordinationCount,
    structuralMemoryCount,
  })

  const coordinationDoctrine =
    'CGI coordination does not route blame. It identifies where continuity exposure requires synchronized leadership attention, stabilization ownership, evidence verification, structural memory, and cross-site visibility before confidence improves.'

  const stabilizationLogic =
    'Coordination becomes executive-relevant when pressure, trajectory, recovery credibility, reliability, and trustworthiness concerns concentrate across one or more continuity environments.'

  const copyReadyCoordinationBrief = [
    'TSINAXA CGI COORDINATION CENTER BRIEF',
    '',
    `Executive Coordination Question: ${coordinationQuestion}`,
    '',
    `Coordination Scope: ${coordinationScope}`,
    '',
    `Dominant Coordination Site: ${dominantSite.name}`,
    `Dominant Region: ${dominantSite.region}`,
    `Coordination Need: ${dominantSite.coordinationNeed}`,
    '',
    `Enterprise Posture: ${executivePosture.label}`,
    `Posture Headline: ${executivePosture.headline}`,
    '',
    `Coordination Thesis: ${coordinationThesis}`,
    '',
    `Executive Summary: ${dominantBriefing.executiveSummary}`,
    '',
    `Required Action: ${executivePosture.actionLanguage}`,
    '',
    `Required Evidence: ${evidenceLanguage}`,
    '',
    `Survivability Meaning: ${survivabilityLanguage}`,
    '',
    `Governance Meaning: ${governanceLanguage}`,
    '',
    `Executive Coordination Count: ${executiveCoordinationCount}`,
    `Active Coordination Count: ${activeCoordinationCount}`,
    `Structural Memory Count: ${structuralMemoryCount}`,
    '',
    `Doctrine: ${coordinationDoctrine}`,
    '',
    `Stabilization Logic: ${stabilizationLogic}`,
  ].join('\n')

  return {
    siteBriefings,
    dominantSite,
    dominantBriefing,
    executivePosture,
    evidenceLanguage,
    survivabilityLanguage,
    governanceLanguage,
    executiveCoordinationCount,
    activeCoordinationCount,
    structuralMemoryCount,
    coordinationScope,
    coordinationQuestion,
    coordinationThesis,
    coordinationDoctrine,
    stabilizationLogic,
    copyReadyCoordinationBrief,
  }
}

export function strongestCoordinationSite(sites: CoordinationSite[]) {
  return [...sites].sort((a, b) => {
    const aBriefing = buildCGIExecutiveBriefing(a)
    const bBriefing = buildCGIExecutiveBriefing(b)

    return (
      postureWeight[bBriefing.synthesis.synthesisPosture] -
      postureWeight[aBriefing.synthesis.synthesisPosture]
    )
  })[0]
}

export function deriveCoordinationThesis(input: {
  dominantSite: CoordinationSite
  dominantBriefing: ReturnType<typeof buildCGIExecutiveBriefing>
  executiveCoordinationCount: number
  activeCoordinationCount: number
  structuralMemoryCount: number
}) {
  if (input.executiveCoordinationCount > 0) {
    return `${input.dominantSite.name} requires executive coordination because continuity exposure has crossed routine synchronization boundaries.`
  }

  if (input.activeCoordinationCount > 0) {
    return `${input.dominantSite.name} requires active synchronization before continuity confidence can safely improve.`
  }

  if (input.structuralMemoryCount > 0) {
    return `${input.dominantSite.name} carries structural memory that must remain attached during coordination review.`
  }

  return 'Coordination is currently routine, but evidence and accountability must remain preserved.'
}