export type InfrastructureSignal = {
  label: string
  value: string
  cue: string
}

export type AdoptionStage = {
  stage: string
  title: string
  status: string
  meaning: string
}

export type DeploymentLock = {
  title: string
  text: string
}

export type AccessRoute = {
  label: string
  href: string
}

export type CGIInfrastructureDoctrine = {
  title: string
  subtitle: string
  thesis: string
  categoryLock: string
  categoryMeaning: string
  infrastructureQuestion: string
  adoptionPathwayMeaning: string
  nextHardeningTitle: string
  nextHardeningMeaning: string
  systemBoundaryTitle: string
  systemBoundaryMeaning: string
  commandSignals: InfrastructureSignal[]
  adoptionStages: AdoptionStage[]
  readinessChecks: string[]
  deploymentLocks: DeploymentLock[]
  doctrine: string[]
  accessRoutes: AccessRoute[]
  copyReadyInfrastructureBrief: string
}

export function buildCGIInfrastructureDoctrine(): CGIInfrastructureDoctrine {
  const title = 'Continuity Governance Infrastructure'
  const subtitle = 'Executive Continuity Intelligence Infrastructure'

  const thesis =
    'TSINAXA CGI governs continuity after visible instability enters the pathway. It keeps pressure, trajectory, recovery, reliability, survivability, executive action, and institutional memory visible until stabilization is credible.'

  const categoryLock = 'Visible Instability Must Not Disappear'

  const categoryMeaning =
    'The infrastructure exists to keep visible instability governed until ownership, pressure, trajectory, recovery, survivability, and institutional memory are visible.'

  const infrastructureQuestion =
    'What conditions must exist before CGI can be trusted as deployable infrastructure?'

  const adoptionPathwayMeaning =
    'TSINAXA CGI should not depend on founder explanation to be adopted. This pathway gives institutions a clear route from first review to safe operational use, with governance review, readiness confirmation, deployment approval, historical metric snapshots, executive visibility, and continuity intelligence discipline.'

  const nextHardeningTitle = 'Snapshot Governance and Security Hardening'

  const nextHardeningMeaning =
    'The next maturity step is to tighten how TSINAXA CGI saves, protects, reviews, and interprets operational metric snapshots: authenticated insert discipline, snapshot timing rules, audit preservation, historical cleanup, and executive review cadence.'

  const systemBoundaryTitle = 'Standalone Continuity Governance Infrastructure'

  const systemBoundaryMeaning =
    'TSINAXA CGI is now a standalone continuity governance intelligence layer. It sits inside the TSINAXA ecosystem and governs continuity after visible instability enters the pathway.'

  const commandSignals: InfrastructureSignal[] = [
    {
      label: 'Infrastructure Identity',
      value: 'LOCKED',
      cue: 'TSINAXA CGI is the Continuity Governance Infrastructure layer.',
    },
    {
      label: 'Executive Subtitle',
      value: 'LOCKED',
      cue: 'Executive Continuity Intelligence Infrastructure.',
    },
    {
      label: 'Command Readiness',
      value: 'ACTIVE',
      cue: 'Executive continuity oversight is available.',
    },
    {
      label: 'Governance Boundary',
      value: 'LOCKED',
      cue:
        'TSINAXA CGI governs continuity after visible instability enters the pathway.',
    },
  ]

  const adoptionStages: AdoptionStage[] = [
    {
      stage: '1',
      title: 'Institution Identified',
      status: 'IDENTIFIED',
      meaning:
        'The institution, site, partner, district office, NGO, department, or operating unit is recognized as a continuity governance environment.',
    },
    {
      stage: '2',
      title: 'Governance Review',
      status: 'UNDER_REVIEW',
      meaning:
        'Leadership scope, access boundaries, coordination rules, privacy expectations, and interpretation limits are reviewed before activation.',
    },
    {
      stage: '3',
      title: 'Readiness Confirmation',
      status: 'GOVERNANCE_PENDING',
      meaning:
        'Routing ownership, escalation pathways, audit expectations, recovery confirmation, and snapshot discipline are confirmed.',
    },
    {
      stage: '4',
      title: 'Deployment Approved',
      status: 'READY_FOR_DEPLOYMENT',
      meaning:
        'The operating environment is ready to use TSINAXA CGI for continuity governance intelligence.',
    },
    {
      stage: '5',
      title: 'Continuity Intelligence Active',
      status: 'ACTIVE',
      meaning:
        'Visible instability can now move through continuity visibility, pressure review, trajectory analysis, recovery intelligence, command visibility, and audit memory.',
    },
  ]

  const readinessChecks = [
    'Institutional scope identified',
    'Executive continuity owner assigned',
    'Governance officer identified',
    'Routing ownership pathway defined',
    'Escalation route confirmed',
    'Audit expectations accepted',
    'Recovery confirmation process understood',
    'Snapshot saving discipline defined',
    'Data boundary and privacy rules acknowledged',
    'Non-punitive interpretation accepted',
    'Command review cadence identified',
    'Deployment support owner assigned',
  ]

  const deploymentLocks: DeploymentLock[] = [
    {
      title: 'No Hidden Surveillance',
      text:
        'TSINAXA CGI governs visible continuity pathways. It does not monitor private behavior, rank people, or create person-level surveillance logic.',
    },
    {
      title: 'No Clinical Replacement',
      text:
        'TSINAXA CGI supports continuity governance, routing visibility, recovery intelligence, survivability interpretation, and executive action cues. It does not diagnose or prescribe.',
    },
    {
      title: 'No Blame Logic',
      text:
        'Signals are interpreted at system level. The purpose is stabilization, continuity, survivability, and fair response — not punishment.',
    },
    {
      title: 'Trace Until Stabilized',
      text:
        'Visible instability should not disappear after it is noticed. Ownership, pressure, trajectory, recovery, survivability, and memory must remain visible until stabilization is credible.',
    },
  ]

  const doctrine = [
    'Detection is not stabilization.',
    'Routing is not intervention.',
    'Intervention is not recovery.',
    'Outcome is not continuity.',
    'Closure is not survivability.',
  ]

  const accessRoutes: AccessRoute[] = [
    { label: 'Executive Stability Board', href: '/system' },
    { label: 'Operational Intelligence', href: '/operations' },
    { label: 'Reliability Intelligence', href: '/reliability' },
    { label: 'Predictive Intelligence', href: '/predictive' },
    { label: 'Pressure Intelligence', href: '/pressure' },
    { label: 'Trajectory Intelligence', href: '/trajectory' },
    { label: 'Recovery Intelligence', href: '/recovery' },
    { label: 'Executive Command', href: '/command' },
    { label: 'Operational Audit', href: '/audit' },
    { label: 'Governance Framework', href: '/governance' },
    { label: 'Routing Intelligence', href: '/routing' },
    { label: 'Stabilization Cases', href: '/cases' },
  ]

  const copyReadyInfrastructureBrief = [
    'TSINAXA CGI INFRASTRUCTURE DOCTRINE BRIEF',
    '',
    `Infrastructure Question: ${infrastructureQuestion}`,
    '',
    `Title: ${title}`,
    `Subtitle: ${subtitle}`,
    '',
    `Infrastructure Thesis: ${thesis}`,
    '',
    `Category Lock: ${categoryLock}`,
    `Category Meaning: ${categoryMeaning}`,
    '',
    'Locked Doctrine:',
    ...doctrine.map((item) => `- ${item}`),
    '',
    'Deployment Guardrails:',
    ...deploymentLocks.map((item) => `- ${item.title}: ${item.text}`),
    '',
    'Readiness Checks:',
    ...readinessChecks.map((item) => `- ${item}`),
    '',
    `Adoption Pathway Meaning: ${adoptionPathwayMeaning}`,
    '',
    `Next Hardening Layer: ${nextHardeningTitle}`,
    `Next Hardening Meaning: ${nextHardeningMeaning}`,
    '',
    `System Boundary: ${systemBoundaryTitle}`,
    `System Boundary Meaning: ${systemBoundaryMeaning}`,
  ].join('\n')

  return {
    title,
    subtitle,
    thesis,
    categoryLock,
    categoryMeaning,
    infrastructureQuestion,
    adoptionPathwayMeaning,
    nextHardeningTitle,
    nextHardeningMeaning,
    systemBoundaryTitle,
    systemBoundaryMeaning,
    commandSignals,
    adoptionStages,
    readinessChecks,
    deploymentLocks,
    doctrine,
    accessRoutes,
    copyReadyInfrastructureBrief,
  }
}