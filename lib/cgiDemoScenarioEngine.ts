import { deriveCGIIntelligence } from './cgiDerivationEngine'
import { evaluateCGIContinuityState } from './cgiContinuityStateEngine'
import { buildCGIExecutiveCommand } from './cgiExecutiveCommandEngine'
import { buildCGIUnifiedExecutiveShell } from './cgiUnifiedExecutiveShell'
import { evaluateCGIStructuralMemory } from './cgiStructuralMemoryEngine'
import { evaluateCGIAccountability } from './cgiAccountabilityEngine'
import { evaluateCGISecurityGovernance } from './cgiSecurityGovernanceEngine'
import { evaluateCGIPilotReadiness } from './cgiPilotReadinessEngine'

export type CGIDemoScenarioKey =
  | 'STABLE_MONITORING'
  | 'EARLY_STRAIN'
  | 'ESCALATED_INSTABILITY'
  | 'FRAGILE_RECOVERY'
  | 'REBURN_RECURRENCE'
  | 'SURVIVABILITY_THREAT'
  | 'FUEL_LOGISTICS_CHAIN_PROOF'

export type CGIPilotChainStage = {
  stage:
    | 'REQUEST'
    | 'TRIAGE'
    | 'CASES'
    | 'ROUTING'
    | 'INTERVENTIONS'
    | 'OUTCOMES'
    | 'RECOVERY'
    | 'COMMAND'
    | 'COORDINATION'
    | 'CROSS_SITE'
    | 'SITUATION_ROOM'
    | 'EXECUTIVE_CENTER'
    | 'EXECUTIVE_REPORT'
    | 'MEMORY_BOARD'
    | 'AUDIT'
  title: string
  continuityQuestion: string
  executiveFinding: string
  evidencePreserved: string
}

export type CGIPilotScenarioThread = {
  caseId: string
  scenarioName: string
  scenarioSummary: string
  doctrine: string
  executiveThesis: string
  sites: {
    siteName: string
    posture: 'STABLE' | 'WATCH' | 'ELEVATED' | 'CRITICAL'
    finding: string
  }[]
  chain: CGIPilotChainStage[]
  executiveMemory: string
  auditReconstruction: string[]
}

export type CGIDemoScenarioOutput = {
  scenarioKey: CGIDemoScenarioKey
  scenarioTitle: string
  scenarioPurpose: string
  pilotThread: CGIPilotScenarioThread
  derivation: ReturnType<typeof deriveCGIIntelligence>
  stateDecision: ReturnType<typeof evaluateCGIContinuityState>
  command: ReturnType<typeof buildCGIExecutiveCommand>
  shell: ReturnType<typeof buildCGIUnifiedExecutiveShell>
  memory: ReturnType<typeof evaluateCGIStructuralMemory>
  accountability: ReturnType<typeof evaluateCGIAccountability>
  security: ReturnType<typeof evaluateCGISecurityGovernance>
  pilotReadiness: ReturnType<typeof evaluateCGIPilotReadiness>
}

const scenarioDescriptions: Record<
  CGIDemoScenarioKey,
  { title: string; purpose: string }
> = {
  STABLE_MONITORING: {
    title: 'Stable Monitoring',
    purpose:
      'Shows CGI preserving calm visibility when no serious continuity strain is present.',
  },
  EARLY_STRAIN: {
    title: 'Early Strain',
    purpose:
      'Shows CGI detecting weak continuity signals before visible instability expands.',
  },
  ESCALATED_INSTABILITY: {
    title: 'Escalated Instability',
    purpose:
      'Shows CGI converting visible instability into command-level leadership attention.',
  },
  FRAGILE_RECOVERY: {
    title: 'Fragile Recovery',
    purpose:
      'Shows CGI refusing to treat visible recovery as durable stabilization without evidence.',
  },
  REBURN_RECURRENCE: {
    title: 'Reburn Recurrence',
    purpose:
      'Shows CGI detecting repeated instability after apparent recovery.',
  },
  SURVIVABILITY_THREAT: {
    title: 'Survivability Threat',
    purpose:
      'Shows CGI escalating severe continuity degradation into executive intervention.',
  },
  FUEL_LOGISTICS_CHAIN_PROOF: {
    title: 'Repeated Fuel Logistics Disruption',
    purpose:
      'Shows one instability moving through the full CGI chain from request to audit reconstruction.',
  },
}

function buildScenarioInput(scenario: CGIDemoScenarioKey) {
  if (scenario === 'STABLE_MONITORING') {
    return {
      previousState: 'STABLE' as const,
      openCases: 0,
      escalatedCases: 0,
      repeatedInstabilityCount: 0,
      unresolvedCriticalCount: 0,
      recoveryFailures: 0,
      verifiedRecoveries: 1,
      coordinationIssues: 0,
      averageUnresolvedDays: 0,
      dominantSeverity: 'LOW' as const,
      recoveryStatus: 'VERIFIED' as const,
      unresolvedDurationDays: 0,
      reburnCount: 0,
      priorEscalationCount: 0,
      priorSurvivabilityThreatCount: 0,
      ownerAssigned: true,
      actionStarted: true,
      evidenceSubmitted: true,
      evidenceVerified: true,
      deadlineMissed: false,
    }
  }

  if (scenario === 'EARLY_STRAIN') {
    return {
      previousState: 'STABLE' as const,
      openCases: 2,
      escalatedCases: 0,
      repeatedInstabilityCount: 0,
      unresolvedCriticalCount: 0,
      recoveryFailures: 0,
      verifiedRecoveries: 0,
      coordinationIssues: 1,
      averageUnresolvedDays: 2,
      dominantSeverity: 'MODERATE' as const,
      recoveryStatus: 'NOT_STARTED' as const,
      unresolvedDurationDays: 2,
      reburnCount: 0,
      priorEscalationCount: 0,
      priorSurvivabilityThreatCount: 0,
      ownerAssigned: false,
      actionStarted: false,
      evidenceSubmitted: false,
      evidenceVerified: false,
      deadlineMissed: false,
    }
  }

  if (scenario === 'ESCALATED_INSTABILITY') {
    return {
      previousState: 'ACTIVE_INSTABILITY' as const,
      openCases: 8,
      escalatedCases: 4,
      repeatedInstabilityCount: 1,
      unresolvedCriticalCount: 1,
      recoveryFailures: 1,
      verifiedRecoveries: 0,
      coordinationIssues: 4,
      averageUnresolvedDays: 9,
      dominantSeverity: 'HIGH' as const,
      recoveryStatus: 'IN_PROGRESS' as const,
      unresolvedDurationDays: 9,
      reburnCount: 0,
      priorEscalationCount: 2,
      priorSurvivabilityThreatCount: 0,
      ownerAssigned: true,
      actionStarted: true,
      evidenceSubmitted: false,
      evidenceVerified: false,
      deadlineMissed: false,
    }
  }

  if (scenario === 'FRAGILE_RECOVERY') {
    return {
      previousState: 'ESCALATED_INSTABILITY' as const,
      openCases: 1,
      escalatedCases: 0,
      repeatedInstabilityCount: 1,
      unresolvedCriticalCount: 0,
      recoveryFailures: 1,
      verifiedRecoveries: 0,
      coordinationIssues: 1,
      averageUnresolvedDays: 5,
      dominantSeverity: 'MODERATE' as const,
      recoveryStatus: 'RECOVERED' as const,
      unresolvedDurationDays: 5,
      reburnCount: 0,
      priorEscalationCount: 2,
      priorSurvivabilityThreatCount: 0,
      ownerAssigned: true,
      actionStarted: true,
      evidenceSubmitted: true,
      evidenceVerified: false,
      deadlineMissed: false,
    }
  }

  if (scenario === 'REBURN_RECURRENCE') {
    return {
      previousState: 'FRAGILE_RECOVERY' as const,
      openCases: 5,
      escalatedCases: 2,
      repeatedInstabilityCount: 6,
      unresolvedCriticalCount: 0,
      recoveryFailures: 3,
      verifiedRecoveries: 0,
      coordinationIssues: 4,
      averageUnresolvedDays: 12,
      dominantSeverity: 'HIGH' as const,
      recoveryStatus: 'PARTIAL' as const,
      unresolvedDurationDays: 12,
      reburnCount: 2,
      priorEscalationCount: 4,
      priorSurvivabilityThreatCount: 0,
      ownerAssigned: true,
      actionStarted: true,
      evidenceSubmitted: true,
      evidenceVerified: false,
      deadlineMissed: true,
    }
  }

  if (scenario === 'FUEL_LOGISTICS_CHAIN_PROOF') {
    return {
      previousState: 'FRAGILE_RECOVERY' as const,
      openCases: 6,
      escalatedCases: 2,
      repeatedInstabilityCount: 5,
      unresolvedCriticalCount: 1,
      recoveryFailures: 2,
      verifiedRecoveries: 1,
      coordinationIssues: 5,
      averageUnresolvedDays: 11,
      dominantSeverity: 'HIGH' as const,
      recoveryStatus: 'PARTIAL' as const,
      unresolvedDurationDays: 11,
      reburnCount: 2,
      priorEscalationCount: 3,
      priorSurvivabilityThreatCount: 0,
      ownerAssigned: true,
      actionStarted: true,
      evidenceSubmitted: true,
      evidenceVerified: false,
      deadlineMissed: true,
    }
  }

  return {
    previousState: 'ESCALATED_INSTABILITY' as const,
    openCases: 14,
    escalatedCases: 7,
    repeatedInstabilityCount: 10,
    unresolvedCriticalCount: 3,
    recoveryFailures: 5,
    verifiedRecoveries: 0,
    coordinationIssues: 8,
    averageUnresolvedDays: 24,
    dominantSeverity: 'CRITICAL' as const,
    recoveryStatus: 'IN_PROGRESS' as const,
    unresolvedDurationDays: 24,
    reburnCount: 3,
    priorEscalationCount: 6,
    priorSurvivabilityThreatCount: 1,
    ownerAssigned: true,
    actionStarted: true,
    evidenceSubmitted: false,
    evidenceVerified: false,
    deadlineMissed: true,
  }
}

function buildPilotScenarioThread(
  scenarioKey: CGIDemoScenarioKey
): CGIPilotScenarioThread {
  if (scenarioKey !== 'FUEL_LOGISTICS_CHAIN_PROOF') {
    return {
      caseId: `CGI-DEMO-${scenarioKey}`,
      scenarioName: scenarioDescriptions[scenarioKey].title,
      scenarioSummary: scenarioDescriptions[scenarioKey].purpose,
      doctrine:
        'Visible instability must not disappear before durable stability is proven.',
      executiveThesis:
        'This scenario demonstrates a CGI continuity state rather than a full lifecycle chain.',
      sites: [
        {
          siteName: 'Primary Operations',
          posture: 'WATCH',
          finding: 'Continuity posture remains visible for executive interpretation.',
        },
      ],
      chain: [],
      executiveMemory:
        'Scenario retained for continuity intelligence calibration and executive interpretation.',
      auditReconstruction: [
        'Scenario input preserved',
        'Derived intelligence produced',
        'Continuity state evaluated',
        'Command posture generated',
      ],
    }
  }

  return {
    caseId: 'CGI-PILOT-FUEL-LOGISTICS-001',
    scenarioName: 'Repeated Fuel Logistics Disruption',
    scenarioSummary:
      'A repeated fuel delivery disruption begins as an operational complaint, becomes a governed continuity case, reveals cross-site supplier dependency, enters fragile recovery, triggers command visibility, and becomes institutional memory.',
    doctrine:
      'Visible instability must not disappear before durable stability is proven.',
    executiveThesis:
      'CGI proves value by keeping one instability visible from first report through recovery, command escalation, cross-site interpretation, executive reporting, institutional memory, and audit reconstruction.',
    sites: [
      {
        siteName: 'North Operations Site',
        posture: 'WATCH',
        finding:
          'Fuel availability restored, but continuity confidence remains under observation.',
      },
      {
        siteName: 'South Operations Site',
        posture: 'ELEVATED',
        finding:
          'Recovery is holding, but routing delays exposed dependence on the same supplier chain.',
      },
      {
        siteName: 'East Operations Site',
        posture: 'CRITICAL',
        finding:
          'Recurring fuel delays continue to threaten operational continuity and regional reliability.',
      },
    ],
    chain: [
      {
        stage: 'REQUEST',
        title: 'Fuel delivery delay reported',
        continuityQuestion: 'What entered CGI visibility?',
        executiveFinding:
          'A human-submitted report identified repeated fuel delivery delays affecting operational readiness.',
        evidencePreserved:
          'Original request, reporter context, affected site, severity, and logistics domain.',
      },
      {
        stage: 'TRIAGE',
        title: 'Accepted for governance',
        continuityQuestion: 'Should this become a governed continuity case?',
        executiveFinding:
          'The disruption was accepted because recurrence and operational dependency created continuity risk.',
        evidencePreserved:
          'Triage decision, acceptance rationale, severity, and governance visibility level.',
      },
      {
        stage: 'CASES',
        title: 'Active instability case opened',
        continuityQuestion: 'What instability must remain visible?',
        executiveFinding:
          'The case was classified as active instability because fuel disruption had repeated across operational time.',
        evidencePreserved:
          'Case status, lifecycle state, repeated instability count, and continuity meaning.',
      },
      {
        stage: 'ROUTING',
        title: 'Regional logistics owner assigned',
        continuityQuestion: 'Who owns stabilization direction?',
        executiveFinding:
          'The case was routed to regional logistics leadership after supplier dependency was identified.',
        evidencePreserved:
          'Routing owner, routing reason, ownership clarity, and supplier dependency evidence.',
      },
      {
        stage: 'INTERVENTIONS',
        title: 'Stabilization actions initiated',
        continuityQuestion: 'What was done to stabilize the disruption?',
        executiveFinding:
          'Emergency allocation, alternative supplier engagement, and cross-site redistribution were initiated.',
        evidencePreserved:
          'Action records, intervention timestamps, responsible owners, and stabilization evidence.',
      },
      {
        stage: 'OUTCOMES',
        title: 'Operational availability partially restored',
        continuityQuestion: 'Did action produce visible stabilization?',
        executiveFinding:
          'Fuel availability improved, but supplier concentration remained unresolved.',
        evidencePreserved:
          'Outcome verification, restoration evidence, residual vulnerability, and recurrence warning.',
      },
      {
        stage: 'RECOVERY',
        title: 'Recovery monitoring opened',
        continuityQuestion: 'Did recovery hold?',
        executiveFinding:
          'Recovery held unevenly: North stabilized, South remained watchlisted, East showed recurrence signals.',
        evidencePreserved:
          'Recovery confidence, site posture, durability concern, and recurrence evidence.',
      },
      {
        stage: 'COMMAND',
        title: 'Command visibility elevated',
        continuityQuestion: 'Does leadership need to see this?',
        executiveFinding:
          'Command posture moved to elevated because recovery credibility was not yet proven.',
        evidencePreserved:
          'Command posture, escalation reason, executive concern, and unresolved durability risk.',
      },
      {
        stage: 'COORDINATION',
        title: 'Regional coordination required',
        continuityQuestion: 'Who must act together?',
        executiveFinding:
          'The disruption required regional coordination because multiple sites shared the same supplier exposure.',
        evidencePreserved:
          'Coordination scope, participating sites, shared dependency, and governance need.',
      },
      {
        stage: 'CROSS_SITE',
        title: 'Cross-site pattern detected',
        continuityQuestion: 'Is this isolated or structural?',
        executiveFinding:
          'CGI identified a shared continuity pattern across North, South, and East operations.',
        evidencePreserved:
          'Site comparison, posture spread, recurrence distribution, and structural exposure.',
      },
      {
        stage: 'SITUATION_ROOM',
        title: 'Trajectory remains uncertain',
        continuityQuestion: 'Where is continuity heading?',
        executiveFinding:
          'The situation room shows declining pressure but unresolved recurrence risk.',
        evidencePreserved:
          'Trajectory signal, pressure reading, recovery status, and executive operating picture.',
      },
      {
        stage: 'EXECUTIVE_CENTER',
        title: 'Institutional posture elevated',
        continuityQuestion: 'What must leadership understand now?',
        executiveFinding:
          'Leadership must understand that apparent recovery has not removed structural supplier vulnerability.',
        evidencePreserved:
          'Executive posture, institutional risk, continuity meaning, and leadership interpretation.',
      },
      {
        stage: 'EXECUTIVE_REPORT',
        title: 'Executive report generated',
        continuityQuestion: 'What should be formally communicated?',
        executiveFinding:
          'The report states that stabilization occurred, recovery remains uneven, and supplier concentration remains a continuity risk.',
        evidencePreserved:
          'Executive summary, recommendation, risk statement, and reporting artifact.',
      },
      {
        stage: 'MEMORY_BOARD',
        title: 'Institutional memory preserved',
        continuityQuestion: 'What must the institution remember?',
        executiveFinding:
          'CGI preserved the lesson that supplier concentration created cross-site continuity exposure.',
        evidencePreserved:
          'Memory statement, structural lesson, recurrence warning, and future governance cue.',
      },
      {
        stage: 'AUDIT',
        title: 'Chain reconstructed',
        continuityQuestion: 'Can the full chain be reconstructed?',
        executiveFinding:
          'Audit can reconstruct the instability from request through memory without losing the continuity story.',
        evidencePreserved:
          'Request, triage, case, routing, intervention, outcome, recovery, command, coordination, report, memory, and audit trace.',
      },
    ],
    executiveMemory:
      'Supplier concentration created cross-site continuity exposure. Recovery occurred before structural vulnerability was fully removed, so durability evidence must remain attached until recurrence risk is closed.',
    auditReconstruction: [
      'Original request preserved',
      'Triage acceptance recorded',
      'Case lifecycle opened',
      'Routing owner assigned',
      'Stabilization actions documented',
      'Outcome verification completed',
      'Recovery monitoring started',
      'Command posture elevated',
      'Coordination need identified',
      'Cross-site pattern detected',
      'Situation room trajectory interpreted',
      'Executive center posture updated',
      'Executive report generated',
      'Institutional memory preserved',
      'Audit chain reconstructable',
    ],
  }
}

export function buildCGIDemoScenario(
  scenarioKey: CGIDemoScenarioKey
): CGIDemoScenarioOutput {
  const base = buildScenarioInput(scenarioKey)
  const description = scenarioDescriptions[scenarioKey]
  const pilotThread = buildPilotScenarioThread(scenarioKey)

  const derivation = deriveCGIIntelligence({
    openCases: base.openCases,
    escalatedCases: base.escalatedCases,
    repeatedInstabilityCount: base.repeatedInstabilityCount,
    unresolvedCriticalCount: base.unresolvedCriticalCount,
    recoveryFailures: base.recoveryFailures,
    verifiedRecoveries: base.verifiedRecoveries,
    coordinationIssues: base.coordinationIssues,
    averageUnresolvedDays: base.averageUnresolvedDays,
    dominantSeverity: base.dominantSeverity,
    recoveryStatus: base.recoveryStatus,
  })

  const stateDecision = evaluateCGIContinuityState({
    previousState: base.previousState,
    derivedCondition: derivation.continuityCondition,
    continuityConfidence: derivation.continuityConfidence,
    survivabilityPressure: derivation.survivabilityPressure,
    recoveryCredibility: derivation.recoveryCredibility,
    recurrenceSeverity: derivation.recurrenceSeverity,
    unresolvedDurationDays: base.unresolvedDurationDays,
    repeatedInstabilityCount: base.repeatedInstabilityCount,
    recoveryFailureCount: base.recoveryFailures,
    verifiedRecoveryCount: base.verifiedRecoveries,
    coordinationIssueCount: base.coordinationIssues,
  })

  const command = buildCGIExecutiveCommand({
    derivation,
    stateDecision,
  })

  const shell = buildCGIUnifiedExecutiveShell({
    derivation,
    stateDecision,
    command,
  })

  const memory = evaluateCGIStructuralMemory({
    continuityCondition: derivation.continuityCondition,
    recoveryCredibility: derivation.recoveryCredibility,
    recurrenceSeverity: derivation.recurrenceSeverity,
    survivabilityPressure: derivation.survivabilityPressure,
    repeatedInstabilityCount: base.repeatedInstabilityCount,
    recoveryFailureCount: base.recoveryFailures,
    reburnCount: base.reburnCount,
    unresolvedDurationDays: base.unresolvedDurationDays,
    priorEscalationCount: base.priorEscalationCount,
    priorSurvivabilityThreatCount: base.priorSurvivabilityThreatCount,
  })

  const accountability = evaluateCGIAccountability({
    derivation,
    stateDecision,
    command,
    memory,
    ownerAssigned: base.ownerAssigned,
    actionStarted: base.actionStarted,
    evidenceSubmitted: base.evidenceSubmitted,
    evidenceVerified: base.evidenceVerified,
    unresolvedDurationDays: base.unresolvedDurationDays,
    deadlineMissed: base.deadlineMissed,
  })

  const security = evaluateCGISecurityGovernance({
    role: 'EXECUTIVE',
    operation: 'VIEW_EXECUTIVE_COMMAND',
    hasInstitutionScope: true,
    hasAuditLogging: true,
    hasVerifiedIdentity: true,
    isProductionEnvironment: true,
    containsSensitiveContinuityData: true,
    attemptsCrossInstitutionAccess: false,
  })

  const pilotReadiness = evaluateCGIPilotReadiness({
    derivation,
    stateDecision,
    command,
    memory,
    accountability,
    security,
    hasDemoOrganization: true,
    hasDemoCases: true,
    hasExecutiveWalkthrough: true,
    hasPilotNarrative: true,
    hasGovernanceAuditFlow: true,
    hasInstitutionIsolation: true,
    hasPricingLogic: false,
    hasOperationalStoryline: true,
  })

  return {
    scenarioKey,
    scenarioTitle: description.title,
    scenarioPurpose: description.purpose,
    pilotThread,
    derivation,
    stateDecision,
    command,
    shell,
    memory,
    accountability,
    security,
    pilotReadiness,
  }
}

export const cgiDemoScenarioKeys: CGIDemoScenarioKey[] = [
  'STABLE_MONITORING',
  'EARLY_STRAIN',
  'ESCALATED_INSTABILITY',
  'FRAGILE_RECOVERY',
  'REBURN_RECURRENCE',
  'SURVIVABILITY_THREAT',
  'FUEL_LOGISTICS_CHAIN_PROOF',
]