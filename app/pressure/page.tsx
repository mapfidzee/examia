'use client'

import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { evaluateCGILiveOperationalIntegration } from '@/lib/cgiLiveOperationalIntegrationEngine'
import { buildCGIExecutiveBriefing } from '@/lib/cgiExecutiveBriefingGenerator'
import {
  formatCGIExecutivePosture,
  formatCGIEvidenceLanguage,
  formatCGISurvivabilityLanguage,
  formatCGIGovernanceSafeLanguage,
} from '@/lib/cgiExecutivePostureFormatter'
import type { CGIRouteSynthesisPosture } from '@/lib/cgiCrossRouteContinuitySynthesisEngine'

type PressurePosture =
  | 'PRESSURE CONTAINED'
  | 'PRESSURE ACCUMULATING'
  | 'PRESSURE CONVERGING'
  | 'PRESSURE STRUCTURAL'
  | 'PRESSURE COMMAND THRESHOLD'

type EnterprisePressureIntelligence = {
  posture: PressurePosture
  thesis: string
  pressureQuestion: string
  concentration: string
  propagation: string
  convergence: string
  structuralSignal: string
  escalationThreshold: string
  survivabilityMeaning: string
  commandImplication: string
  coordinationImplication: string
  crossSiteImplication: string
  reliabilityImplication: string
  executiveAction: string
  evidenceRequirement: string
  memoryRequirement: string
  forecast: string
  boardWarning: string
  copyReadyBrief: string
}

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ')
}

function mapToSynthesisPosture(value: unknown): CGIRouteSynthesisPosture {
  const normalized = String(value).toUpperCase()

  if (
    normalized.includes('SURVIVABILITY_THREAT') ||
    normalized.includes('CRITICAL') ||
    normalized.includes('HIGH') ||
    normalized.includes('FAILED') ||
    normalized.includes('SEVERE')
  ) {
    return 'CRITICAL'
  }

  if (
    normalized.includes('ELEVATED') ||
    normalized.includes('MODERATE') ||
    normalized.includes('ACTIVE_INSTABILITY') ||
    normalized.includes('FRAGILE') ||
    normalized.includes('PARTIAL') ||
    normalized.includes('UNCERTAIN') ||
    normalized.includes('LOW') ||
    normalized.includes('WEAK') ||
    normalized.includes('CONDITIONAL')
  ) {
    return 'ELEVATED'
  }

  return 'WATCHED'
}

export default function PressurePage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
    >
      <CGIGovernanceShell>
        <PressureContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function PressureContent() {
  const pressureInput = {
    route: 'PRESSURE' as const,
    openCases: 11,
    escalatedCases: 5,
    repeatedInstabilityCount: 5,
    unresolvedCriticalCount: 1,
    recoveryFailures: 2,
    verifiedRecoveries: 0,
    coordinationIssues: 6,
    averageUnresolvedDays: 16,
    unresolvedDurationDays: 16,
    reburnCount: 1,
    priorEscalationCount: 5,
    priorSurvivabilityThreatCount: 0,
    ownerAssigned: true,
    actionStarted: true,
    evidenceSubmitted: false,
    evidenceVerified: false,
    deadlineMissed: true,
  }

  const pressureIntelligence =
    evaluateCGILiveOperationalIntegration(pressureInput)

  const enterprisePressure =
    buildEnterprisePressureIntelligence(pressureInput)

  const synchronizedBriefing = buildCGIExecutiveBriefing({
    pressurePosture: mapToSynthesisPosture(
      pressureIntelligence.derivation.survivabilityPressure,
    ),
    trajectoryPosture: mapToSynthesisPosture(
      pressureIntelligence.derivation.continuityCondition,
    ),
    predictivePosture: mapToSynthesisPosture(
      pressureIntelligence.memory.memoryRiskLevel,
    ),
    recoveryPosture: mapToSynthesisPosture(
      pressureIntelligence.derivation.recoveryCredibility,
    ),
    reliabilityPosture: mapToSynthesisPosture(
      pressureIntelligence.derivation.continuityConfidence,
    ),
    evidenceVerified: false,
    accountabilityActive: true,
    structuralMemoryVisible: true,
  })

  const synchronizedPosture = formatCGIExecutivePosture(
    synchronizedBriefing.synthesis.synthesisPosture,
  )

  const synchronizedEvidence = formatCGIEvidenceLanguage(
    false,
    synchronizedBriefing.synthesis.synthesisPosture,
  )

  const synchronizedSurvivability = formatCGISurvivabilityLanguage(
    synchronizedBriefing.synthesis.synthesisPosture,
  )

  const synchronizedGovernance = formatCGIGovernanceSafeLanguage()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • ENTERPRISE PRESSURE</p>

          <h1 style={styles.title}>Enterprise Pressure Intelligence</h1>

          <p style={styles.subtitle}>
            Pressure intelligence identifies where instability is accumulating,
            spreading, converging, becoming structural, or approaching command
            threshold before continuity credibility weakens further.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Enterprise Pressure Thesis</p>

            <h2 style={styles.heroTitle}>{enterprisePressure.posture}</h2>

            <p style={styles.heroMeaning}>{enterprisePressure.thesis}</p>
          </div>

          <div style={styles.toneBox}>
            <p style={styles.toneLabel}>Command Threshold</p>
            <p style={styles.toneValue}>
              {enterprisePressure.escalationThreshold}
            </p>
          </div>
        </section>

        <section style={styles.questionCard}>
          <div>
            <p style={styles.sectionKicker}>Executive Pressure Question</p>

            <h2 style={styles.cardTitle}>
              {enterprisePressure.pressureQuestion}
            </h2>

            <p style={styles.bodyText}>
              Pressure becomes enterprise-significant when it concentrates
              across unresolved work, spreads across coordination channels,
              repeats across time, or weakens the institution&apos;s ability to
              stabilize itself.
            </p>
          </div>

          <div style={styles.questionStack}>
            <MiniBlock
              title="Pressure Forecast"
              value={enterprisePressure.forecast}
            />

            <MiniBlock
              title="Board Warning"
              value={enterprisePressure.boardWarning}
            />
          </div>
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Concentration"
            value={enterprisePressure.concentration}
            body="Where pressure is becoming dense enough to weaken continuity."
          />

          <ExecutiveCard
            title="Propagation"
            value={enterprisePressure.propagation}
            body="Whether pressure is spreading beyond one local problem."
          />

          <ExecutiveCard
            title="Convergence"
            value={enterprisePressure.convergence}
            body="Whether multiple pressure types are combining."
          />

          <ExecutiveCard
            title="Structural Signal"
            value={enterprisePressure.structuralSignal}
            body="Whether pressure has become part of institutional pattern."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Synchronized Continuity Reading</p>

          <h2 style={styles.cardTitle}>{synchronizedPosture.label}</h2>

          <p style={styles.bodyText}>{synchronizedPosture.description}</p>

          <div style={styles.infoList}>
            <Info label="Evidence" value={synchronizedEvidence} />
            <Info label="Survivability" value={synchronizedSurvivability} />
            <Info label="Governance" value={synchronizedGovernance} />
          </div>
        </section>

        <section style={styles.gridThree}>
          <Panel
            title="Survivability Pressure"
            value={formatLabel(
              pressureIntelligence.derivation.survivabilityPressure,
            )}
          >
            {enterprisePressure.survivabilityMeaning}
          </Panel>

          <Panel
            title="Continuity Condition"
            value={formatLabel(
              pressureIntelligence.derivation.continuityCondition,
            )}
          >
            {pressureIntelligence.shell.continuityPanel.interpretation}
          </Panel>

          <Panel
            title="Continuity Confidence"
            value={formatLabel(
              pressureIntelligence.derivation.continuityConfidence,
            )}
          >
            {pressureIntelligence.shell.confidencePanel.interpretation}
          </Panel>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Dominant Pressure Truth">
            {pressureIntelligence.command.dominantTruth}
          </Panel>

          <Panel title="Primary Pressure Driver">
            {pressureIntelligence.command.primaryDriver}
          </Panel>
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Command"
            value={enterprisePressure.commandImplication}
            body="How Command should treat the pressure posture."
          />

          <ExecutiveCard
            title="Coordination"
            value={enterprisePressure.coordinationImplication}
            body="Whether ownership synchronization is required."
          />

          <ExecutiveCard
            title="Cross-Site"
            value={enterprisePressure.crossSiteImplication}
            body="Whether pressure may no longer be isolated."
          />

          <ExecutiveCard
            title="Reliability"
            value={enterprisePressure.reliabilityImplication}
            body="How pressure affects repeated stabilization trust."
          />
        </section>

        <section style={styles.gridThree}>
          <Panel
            title="Structural Memory"
            value={formatLabel(
              pressureIntelligence.memory.primaryMemorySignal,
            )}
          >
            {pressureIntelligence.memory.executiveMemoryWarning}
          </Panel>

          <Panel
            title="Pressure Memory Risk"
            value={formatLabel(pressureIntelligence.memory.memoryRiskLevel)}
          >
            {enterprisePressure.memoryRequirement}
          </Panel>

          <Panel
            title="Institutional Fragility"
            value={
              pressureIntelligence.memory.institutionalFragilityDetected
                ? 'YES'
                : 'NO'
            }
          >
            Fragility means prior pressure history may be weakening
            stabilization capacity.
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Enterprise Pressure Doctrine</p>

          <h2 style={styles.cardTitle}>
            Pressure becomes dangerous when it weakens continuity credibility.
          </h2>

          <p style={styles.bodyText}>
            CGI does not treat pressure as simple workload. Pressure becomes
            command-relevant when it accumulates, concentrates, repeats,
            delays recovery, weakens reliability, exposes coordination gaps, or
            threatens the institution&apos;s ability to stabilize itself under
            strain.
          </p>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Required Pressure Action">
            {enterprisePressure.executiveAction}
          </Panel>

          <Panel title="Required Evidence">
            {enterprisePressure.evidenceRequirement}
          </Panel>
        </section>

        <section style={styles.gridThree}>
          <Panel
            title="Accountability Status"
            value={formatLabel(
              pressureIntelligence.accountability.accountabilityStatus,
            )}
          >
            {pressureIntelligence.accountability.escalationRule}
          </Panel>

          <Panel
            title="Accountability Risk"
            value={formatLabel(
              pressureIntelligence.accountability.accountabilityRisk,
            )}
          >
            Accountability must tighten when pressure remains unresolved.
          </Panel>

          <Panel title="Unresolved Duration Warning" value="Duration Active">
            {pressureIntelligence.accountability.unresolvedDurationWarning}
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Pressure Interpretation</p>

          <h2 style={styles.cardTitle}>
            Pressure must be interpreted before it becomes survivability risk.
          </h2>

          <p style={styles.bodyText}>
            {pressureIntelligence.operationalNarrative}
          </p>
        </section>

        <section style={styles.gridTwo}>
          <PressurePrinciple
            title="Pressure is not only volume"
            body="A small number of unresolved critical pressures may be more important than many low-significance events."
          />

          <PressurePrinciple
            title="Pressure concentrates"
            body="When escalation, coordination weakness, and unresolved duration combine, continuity credibility weakens."
          />

          <PressurePrinciple
            title="Pressure repeats"
            body="Recurring pressure is a structural warning, especially when recovery fails to hold."
          />

          <PressurePrinciple
            title="Pressure requires evidence"
            body="Relief must be evidenced. CGI should not assume pressure is resolved simply because action started."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Copy-Ready Pressure Brief</p>

          <h2 style={styles.cardTitle}>
            Where is instability accumulating before it forces command action?
          </h2>

          <pre style={styles.summaryBox}>
            {enterprisePressure.copyReadyBrief}
          </pre>
        </section>
      </div>
    </main>
  )
}

function buildEnterprisePressureIntelligence(input: {
  openCases: number
  escalatedCases: number
  repeatedInstabilityCount: number
  unresolvedCriticalCount: number
  recoveryFailures: number
  verifiedRecoveries: number
  coordinationIssues: number
  averageUnresolvedDays: number
  unresolvedDurationDays: number
  reburnCount: number
  priorEscalationCount: number
  priorSurvivabilityThreatCount: number
  ownerAssigned: boolean
  actionStarted: boolean
  evidenceSubmitted: boolean
  evidenceVerified: boolean
  deadlineMissed: boolean
}): EnterprisePressureIntelligence {
  const pressureScore =
    input.openCases +
    input.escalatedCases * 2 +
    input.repeatedInstabilityCount * 2 +
    input.unresolvedCriticalCount * 3 +
    input.recoveryFailures * 2 +
    input.coordinationIssues +
    input.reburnCount * 2 +
    input.priorEscalationCount +
    (input.deadlineMissed ? 3 : 0) +
    (!input.evidenceVerified ? 2 : 0)

  const posture = derivePressurePosture(pressureScore, input)

  const concentration =
    input.escalatedCases > 0 || input.unresolvedCriticalCount > 0
      ? 'Pressure is concentrated around escalation, critical unresolved risk, and delayed evidence.'
      : 'Pressure is visible but not yet concentrated around critical escalation.'

  const propagation =
    input.coordinationIssues >= 4
      ? 'Pressure is propagating through coordination channels and may require synchronization.'
      : 'Pressure has not yet shown strong coordination propagation.'

  const convergence =
    input.repeatedInstabilityCount > 0 &&
    input.recoveryFailures > 0 &&
    input.coordinationIssues > 0
      ? 'Recurrence, failed recovery, and coordination strain are converging.'
      : 'Pressure signals are visible but not fully converged.'

  const structuralSignal =
    input.repeatedInstabilityCount >= 3 || input.reburnCount > 0
      ? 'Pressure has structural memory and should not be treated as temporary workload.'
      : 'Pressure memory is emerging but not yet structurally dominant.'

  const escalationThreshold =
    pressureScore >= 35
      ? 'COMMAND THRESHOLD'
      : pressureScore >= 22
        ? 'ELEVATED WATCH'
        : pressureScore >= 12
          ? 'WATCH'
          : 'CONTAINED'

  const survivabilityMeaning =
    posture === 'PRESSURE COMMAND THRESHOLD' ||
    posture === 'PRESSURE STRUCTURAL'
      ? 'Pressure is strong enough to threaten survivability credibility if command action does not remain visible.'
      : 'Pressure is visible and should remain under proportional survivability watch.'

  const commandImplication =
    posture === 'PRESSURE COMMAND THRESHOLD'
      ? 'Command must hold visibility.'
      : posture === 'PRESSURE STRUCTURAL'
        ? 'Command should remain active until recurrence and evidence are resolved.'
        : posture === 'PRESSURE CONVERGING'
          ? 'Command should prepare escalation if convergence continues.'
          : 'Command can monitor proportionally.'

  const coordinationImplication =
    input.coordinationIssues >= 4
      ? 'Coordination synchronization is required.'
      : 'Coordination remains conditional.'

  const crossSiteImplication =
    input.repeatedInstabilityCount >= 4 || input.coordinationIssues >= 5
      ? 'Cross-site review may be required if the same pressure appears across sites.'
      : 'Cross-site review is not yet required.'

  const reliabilityImplication =
    input.recoveryFailures > 0 || input.reburnCount > 0
      ? 'Reliability cannot be trusted until pressure stops returning after recovery.'
      : 'Reliability remains watchable if evidence stays attached.'

  const evidenceRequirement =
    'Preserve unresolved duration, escalation reason, coordination strain, recurrence history, recovery failure evidence, owner action, deadline status, and survivability meaning.'

  const memoryRequirement =
    input.repeatedInstabilityCount > 0 || input.reburnCount > 0
      ? 'Preserve repeated pressure and reburn memory so pressure is not falsely treated as isolated.'
      : 'Preserve pressure evidence for future comparison.'

  const forecast =
    posture === 'PRESSURE COMMAND THRESHOLD'
      ? 'Pressure is likely to force command action if evidence and coordination do not improve.'
      : posture === 'PRESSURE STRUCTURAL'
        ? 'Pressure may keep returning unless structural memory is addressed.'
        : posture === 'PRESSURE CONVERGING'
          ? 'Pressure may escalate if recurrence, coordination, and recovery weakness continue to combine.'
          : 'Pressure can remain contained if evidence, ownership, and recovery confirmation improve.'

  const boardWarning =
    'Do not confuse activity with pressure relief. Pressure is relieved only when evidence shows survivability, coordination, and recovery credibility are improving.'

  const executiveAction =
    posture === 'PRESSURE COMMAND THRESHOLD'
      ? 'Hold command visibility, require evidence correction, and synchronize coordination within 24 hours.'
      : posture === 'PRESSURE STRUCTURAL'
        ? 'Preserve structural pressure memory and require durability evidence before posture reduction.'
        : posture === 'PRESSURE CONVERGING'
          ? 'Monitor convergence and prepare command escalation if pressure continues accumulating.'
          : 'Continue proportional monitoring and preserve pressure evidence.'

  const pressureQuestion =
    'Where is instability accumulating before it forces command action?'

  const thesis = `${posture}: ${convergence} ${structuralSignal}`

  const copyReadyBrief = [
    'TSINAXA CGI ENTERPRISE PRESSURE BRIEF',
    '',
    `Pressure Question: ${pressureQuestion}`,
    '',
    `Pressure Posture: ${posture}`,
    '',
    `Enterprise Thesis: ${thesis}`,
    '',
    `Concentration: ${concentration}`,
    '',
    `Propagation: ${propagation}`,
    '',
    `Convergence: ${convergence}`,
    '',
    `Structural Signal: ${structuralSignal}`,
    '',
    `Escalation Threshold: ${escalationThreshold}`,
    '',
    `Survivability Meaning: ${survivabilityMeaning}`,
    '',
    `Command Implication: ${commandImplication}`,
    '',
    `Coordination Implication: ${coordinationImplication}`,
    '',
    `Cross-Site Implication: ${crossSiteImplication}`,
    '',
    `Reliability Implication: ${reliabilityImplication}`,
    '',
    `Evidence Requirement: ${evidenceRequirement}`,
    '',
    `Memory Requirement: ${memoryRequirement}`,
    '',
    `Forecast: ${forecast}`,
    '',
    `Board Warning: ${boardWarning}`,
    '',
    `Executive Action: ${executiveAction}`,
  ].join('\n')

  return {
    posture,
    thesis,
    pressureQuestion,
    concentration,
    propagation,
    convergence,
    structuralSignal,
    escalationThreshold,
    survivabilityMeaning,
    commandImplication,
    coordinationImplication,
    crossSiteImplication,
    reliabilityImplication,
    executiveAction,
    evidenceRequirement,
    memoryRequirement,
    forecast,
    boardWarning,
    copyReadyBrief,
  }
}

function derivePressurePosture(
  score: number,
  input: {
    repeatedInstabilityCount: number
    recoveryFailures: number
    coordinationIssues: number
    reburnCount: number
    escalatedCases: number
    unresolvedCriticalCount: number
  },
): PressurePosture {
  if (score >= 35 || input.escalatedCases >= 5) {
    return 'PRESSURE COMMAND THRESHOLD'
  }

  if (
    input.repeatedInstabilityCount >= 4 ||
    input.reburnCount > 0 ||
    input.recoveryFailures >= 2
  ) {
    return 'PRESSURE STRUCTURAL'
  }

  if (
    input.coordinationIssues >= 4 &&
    (input.repeatedInstabilityCount > 0 || input.unresolvedCriticalCount > 0)
  ) {
    return 'PRESSURE CONVERGING'
  }

  if (score >= 12) {
    return 'PRESSURE ACCUMULATING'
  }

  return 'PRESSURE CONTAINED'
}

function Panel({
  title,
  value,
  children,
}: {
  title: string
  value?: string
  children?: ReactNode
}) {
  return (
    <section style={styles.panel}>
      <p style={styles.panelKicker}>{title}</p>
      {value ? <h3 style={styles.panelValue}>{value}</h3> : null}
      {children ? <div style={styles.panelBody}>{children}</div> : null}
    </section>
  )
}

function ExecutiveCard({
  title,
  value,
  body,
}: {
  title: string
  value: string
  body: ReactNode
}) {
  return (
    <article style={styles.panel}>
      <p style={styles.panelKicker}>{title}</p>
      <h3 style={styles.panelValue}>{value}</h3>
      <div style={styles.panelBody}>{body}</div>
    </article>
  )
}

function MiniBlock({ title, value }: { title: string; value: string }) {
  return (
    <article style={styles.miniBlock}>
      <p style={styles.panelKicker}>{title}</p>
      <p style={styles.miniValue}>{value}</p>
    </article>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value}</strong>
    </div>
  )
}

function PressurePrinciple({
  title,
  body,
}: {
  title: string
  body: ReactNode
}) {
  return (
    <article style={styles.principleCard}>
      <p style={styles.principleKicker}>CGI Pressure Principle</p>
      <h3 style={styles.principleTitle}>{title}</h3>
      <p style={styles.principleBody}>{body}</p>
    </article>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    color: 'white',
    overflowX: 'hidden',
  },
  container: {
    width: '100%',
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '0 20px 48px',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '20px',
    paddingTop: '4px',
  },
  kicker: {
    color: '#67e8f9',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '2px',
    margin: 0,
  },
  title: {
    fontSize: 'clamp(32px, 5vw, 48px)',
    lineHeight: 1.05,
    margin: '10px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '800px',
    lineHeight: 1.65,
    fontSize: '16px',
    margin: 0,
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(220px, 0.6fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #22d3ee',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  questionCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #facc15',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
  },
  questionStack: {
    display: 'grid',
    gap: '12px',
  },
  sectionKicker: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '12px',
  },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 'clamp(28px, 4vw, 42px)',
    lineHeight: 1.1,
    margin: '10px 0',
  },
  heroMeaning: {
    color: '#cbd5e1',
    lineHeight: 1.65,
    margin: 0,
    maxWidth: '760px',
  },
  toneBox: {
    background: '#083344',
    border: '1px solid #22d3ee',
    borderRadius: '18px',
    padding: '16px',
    alignSelf: 'stretch',
  },
  toneLabel: {
    color: '#67e8f9',
    fontWeight: 900,
    margin: '0 0 8px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  toneValue: {
    color: '#cffafe',
    fontSize: '24px',
    lineHeight: 1.1,
    margin: 0,
    fontWeight: 900,
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  panel: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
    boxSizing: 'border-box',
  },
  miniBlock: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '14px',
  },
  miniValue: {
    color: '#f8fafc',
    lineHeight: 1.45,
    margin: '10px 0 0',
    fontWeight: 800,
  },
  panelKicker: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  panelValue: {
    color: '#f8fafc',
    fontSize: '20px',
    lineHeight: 1.15,
    margin: '10px 0 0',
  },
  panelBody: {
    color: '#cbd5e1',
    fontSize: '14px',
    lineHeight: 1.6,
    marginTop: '10px',
  },
  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '22px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.24)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: '26px',
    lineHeight: 1.15,
    margin: '10px 0 10px',
  },
  bodyText: {
    color: '#cbd5e1',
    lineHeight: 1.7,
    margin: 0,
    maxWidth: '880px',
  },
  infoList: {
    display: 'grid',
    gap: '10px',
    marginTop: '14px',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '160px minmax(0, 1fr)',
    gap: '12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '12px',
    alignItems: 'start',
  },
  infoLabel: {
    color: '#94a3b8',
    fontWeight: 800,
    fontSize: '12px',
  },
  infoValue: {
    color: '#f8fafc',
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  principleCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '18px',
    minHeight: '160px',
  },
  principleKicker: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  principleTitle: {
    color: '#f8fafc',
    fontSize: '22px',
    lineHeight: 1.15,
    margin: '10px 0',
  },
  principleBody: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    margin: 0,
  },
  summaryBox: {
    whiteSpace: 'pre-wrap',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '16px',
    color: '#e2e8f0',
    lineHeight: 1.55,
    minHeight: '240px',
    fontSize: '14px',
    overflowX: 'auto',
  },
}