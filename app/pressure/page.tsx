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
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
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
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • ENTERPRISE PRESSURE</p>
            <h1 style={styles.title}>Enterprise Pressure Intelligence</h1>
            <p style={styles.subtitle}>
              Pressure identifies where instability is accumulating before it
              forces Command action. CGI treats pressure as continuity strain,
              not simple workload.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>PRESSURE POSTURE</p>
            <p style={styles.statusValue}>{enterprisePressure.posture}</p>
            <p style={styles.statusMeaning}>{enterprisePressure.thesis}</p>
          </div>
        </section>

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Executive Pressure Question</p>
            <h2 style={styles.commandTitle}>
              {enterprisePressure.pressureQuestion}
            </h2>
            <p style={styles.bodyText}>
              Pressure becomes enterprise-significant when it concentrates
              across unresolved work, spreads across coordination channels,
              repeats across time, or weakens the institution&apos;s ability to
              stabilize itself.
            </p>

            <div style={styles.commandMetaGrid}>
              <MiniStat label="Threshold" value={enterprisePressure.escalationThreshold} />
              <MiniStat label="Open Cases" value={String(pressureInput.openCases)} />
              <MiniStat label="Escalated" value={String(pressureInput.escalatedCases)} />
              <MiniStat label="Repeated" value={String(pressureInput.repeatedInstabilityCount)} />
            </div>
          </div>

          <div style={styles.consequenceCard}>
            <p style={styles.sectionKicker}>Board Warning</p>
            <h2 style={styles.consequenceTitle}>Do not confuse activity with relief.</h2>
            <p style={styles.bodyText}>{enterprisePressure.boardWarning}</p>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Coordination Issues" value={String(pressureInput.coordinationIssues)} />
          <Metric label="Recovery Failures" value={String(pressureInput.recoveryFailures)} />
          <Metric label="Reburn Count" value={String(pressureInput.reburnCount)} />
          <Metric label="Critical Unresolved" value={String(pressureInput.unresolvedCriticalCount)} />
          <Metric label="Unresolved Days" value={String(pressureInput.averageUnresolvedDays)} />
          <Metric label="Evidence Verified" value={pressureInput.evidenceVerified ? 'YES' : 'NO'} />
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

        <section style={styles.panel}>
          <p style={styles.sectionKicker}>Synchronized Continuity Reading</p>
          <h2 style={styles.panelTitle}>{synchronizedPosture.label}</h2>
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

        <section style={styles.memoryPanel}>
          <p style={styles.sectionKicker}>Pressure Memory</p>
          <h2 style={styles.panelTitle}>
            Pressure that repeats must not be treated as isolated workload.
          </h2>

          <div style={styles.memoryGrid}>
            <MiniStat
              label="Structural Memory"
              value={formatLabel(
                pressureIntelligence.memory.primaryMemorySignal,
              )}
            />
            <MiniStat
              label="Memory Risk"
              value={formatLabel(pressureIntelligence.memory.memoryRiskLevel)}
            />
            <MiniStat
              label="Fragility"
              value={
                pressureIntelligence.memory.institutionalFragilityDetected
                  ? 'YES'
                  : 'NO'
              }
            />
            <MiniStat label="Memory Requirement" value={enterprisePressure.memoryRequirement} />
          </div>
        </section>

        <section style={styles.panel}>
          <p style={styles.sectionKicker}>Enterprise Pressure Doctrine</p>
          <h2 style={styles.panelTitle}>
            Pressure becomes dangerous when it weakens continuity credibility.
          </h2>
          <p style={styles.bodyText}>
            CGI does not treat pressure as simple workload. Pressure becomes
            command-relevant when it accumulates, concentrates, repeats, delays
            recovery, weakens reliability, exposes coordination gaps, or
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

        <section style={styles.panel}>
          <p style={styles.sectionKicker}>Pressure Interpretation</p>
          <h2 style={styles.panelTitle}>
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

        <section style={styles.orderPanel}>
          <p style={styles.sectionKicker}>Copy-Ready Pressure Brief</p>
          <h2 style={styles.panelTitle}>
            Where is instability accumulating before it forces command action?
          </h2>
          <pre style={styles.summaryBox}>
            {enterprisePressure.copyReadyBrief}
          </pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE PRESSURE DOCTRINE</strong>
          <span>
            Pressure is not volume. Pressure is accumulating continuity strain.
            Command should act before pressure becomes normalized, hidden, or
            structurally repeated.
          </span>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
    </article>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.miniStat}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.miniValue}>{value}</p>
    </article>
  )
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
    <section style={styles.panelCard}>
      <p style={styles.sectionKicker}>{title}</p>
      {value ? <h3 style={styles.cardValue}>{value}</h3> : null}
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
    <article style={styles.panelCard}>
      <p style={styles.sectionKicker}>{title}</p>
      <h3 style={styles.cardValue}>{value}</h3>
      <div style={styles.panelBody}>{body}</div>
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
      <p style={styles.sectionKicker}>CGI Pressure Principle</p>
      <h3 style={styles.principleTitle}>{title}</h3>
      <p style={styles.bodyText}>{body}</p>
    </article>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(201, 162, 39, 0.14), transparent 34%), linear-gradient(135deg, #050505 0%, #0B0B0B 45%, #111111 100%)',
    color: '#FFFFFF',
    padding: '40px 24px 72px',
  },
  container: {
    width: 'min(1440px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gap: 24,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.75fr)',
    gap: 24,
    padding: 32,
    border: '1px solid rgba(201, 162, 39, 0.34)',
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
    boxShadow: '0 28px 80px rgba(0,0,0,0.38)',
  },
  kicker: {
    margin: 0,
    color: '#C9A227',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '14px 0 0',
    fontSize: 'clamp(2.3rem, 5vw, 5rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.07em',
    fontWeight: 950,
  },
  subtitle: {
    maxWidth: 880,
    margin: '18px 0 0',
    color: '#C8CDD4',
    fontSize: 17,
    lineHeight: 1.8,
  },
  statusBox: {
    border: '1px solid rgba(201, 162, 39, 0.5)',
    borderRadius: 24,
    padding: 24,
    background: 'linear-gradient(180deg, rgba(201,162,39,0.18), rgba(0,0,0,0.38))',
  },
  statusLabel: {
    margin: 0,
    color: '#D7B84C',
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.2em',
  },
  statusValue: {
    margin: '16px 0 0',
    fontSize: 30,
    fontWeight: 950,
    letterSpacing: '-0.04em',
    lineHeight: 1.05,
  },
  statusMeaning: {
    margin: '12px 0 0',
    color: '#ECE7D7',
    fontSize: 14,
    lineHeight: 1.7,
  },
  commandDeck: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.8fr',
    gap: 24,
  },
  primaryCard: {
    padding: 30,
    borderRadius: 28,
    background: '#FFFFFF',
    color: '#0B0B0B',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  consequenceCard: {
    padding: 30,
    borderRadius: 28,
    background: 'rgba(0,0,0,0.38)',
    border: '1px solid rgba(201,162,39,0.28)',
  },
  sectionKicker: {
    margin: 0,
    color: '#C9A227',
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  commandTitle: {
    margin: '14px 0',
    fontSize: 'clamp(1.8rem, 3vw, 3.2rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  consequenceTitle: {
    margin: '14px 0',
    fontSize: 28,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
  bodyText: {
    margin: '8px 0 0',
    color: '#AEB6C2',
    lineHeight: 1.7,
    fontSize: 14,
  },
  commandMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 24,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 14,
  },
  metricCard: {
    padding: 18,
    borderRadius: 20,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  metricLabel: {
    margin: 0,
    color: '#858D98',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  metricValue: {
    margin: '10px 0 0',
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 950,
  },
  miniStat: {
    padding: 14,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  miniValue: {
    margin: '8px 0 0',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 850,
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
  },
  panel: {
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  panelCard: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.09)',
    minHeight: 150,
  },
  panelTitle: {
    margin: '12px 0 0',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
  },
  cardValue: {
    margin: '12px 0 0',
    color: '#FFFFFF',
    fontSize: 19,
    lineHeight: 1.25,
  },
  panelBody: {
    marginTop: 10,
    color: '#AEB6C2',
    fontSize: 14,
    lineHeight: 1.65,
  },
  infoList: {
    display: 'grid',
    gap: 10,
    marginTop: 18,
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '170px minmax(0, 1fr)',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  infoLabel: {
    color: '#858D98',
    fontWeight: 900,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  infoValue: {
    color: '#FFFFFF',
    lineHeight: 1.5,
  },
  memoryPanel: {
    padding: 28,
    borderRadius: 28,
    background: 'linear-gradient(135deg, rgba(201,162,39,0.13), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.32)',
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
  },
  principleCard: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.09)',
    minHeight: 160,
  },
  principleTitle: {
    margin: '12px 0 0',
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 1.15,
  },
  orderPanel: {
    padding: 28,
    borderRadius: 28,
    background: '#FFFFFF',
    color: '#0B0B0B',
  },
  summaryBox: {
    marginTop: 20,
    padding: 22,
    borderRadius: 20,
    background: '#0A0A0A',
    color: '#F8F6F1',
    whiteSpace: 'pre-wrap',
    fontSize: 13,
    lineHeight: 1.7,
    overflowX: 'auto',
  },
  doctrineCard: {
    display: 'grid',
    gap: 10,
    padding: 24,
    borderRadius: 24,
    background: '#050505',
    border: '1px solid rgba(201,162,39,0.42)',
    color: '#FFFFFF',
    lineHeight: 1.7,
  },
}