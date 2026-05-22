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
    normalized.includes('COLLAPSE') ||
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
    normalized.includes('CONDITIONAL') ||
    normalized.includes('REPEAT')
  ) {
    return 'ELEVATED'
  }

  return 'WATCHED'
}

export default function RecoveryPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
    >
      <CGIGovernanceShell>
        <RecoveryContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function RecoveryContent() {
  const recoveryIntelligence = evaluateCGILiveOperationalIntegration({
    route: 'RECOVERY',
    openCases: 4,
    escalatedCases: 1,
    repeatedInstabilityCount: 4,
    unresolvedCriticalCount: 0,
    recoveryFailures: 2,
    verifiedRecoveries: 0,
    coordinationIssues: 2,
    averageUnresolvedDays: 10,
    unresolvedDurationDays: 10,
    reburnCount: 2,
    priorEscalationCount: 3,
    priorSurvivabilityThreatCount: 0,
    ownerAssigned: true,
    actionStarted: true,
    evidenceSubmitted: true,
    evidenceVerified: false,
    deadlineMissed: false,
  })

  const synchronizedBriefing = buildCGIExecutiveBriefing({
    pressurePosture: mapToSynthesisPosture(
      recoveryIntelligence.derivation.survivabilityPressure
    ),
    trajectoryPosture: mapToSynthesisPosture(
      recoveryIntelligence.derivation.continuityCondition
    ),
    predictivePosture: mapToSynthesisPosture(
      recoveryIntelligence.memory.memoryRiskLevel
    ),
    recoveryPosture: mapToSynthesisPosture(
      recoveryIntelligence.derivation.recoveryCredibility
    ),
    reliabilityPosture: mapToSynthesisPosture(
      recoveryIntelligence.derivation.continuityConfidence
    ),
    evidenceVerified: false,
    accountabilityActive: true,
    structuralMemoryVisible: true,
  })

  const synchronizedPosture = formatCGIExecutivePosture(
    synchronizedBriefing.synthesis.synthesisPosture
  )

  const synchronizedEvidence = formatCGIEvidenceLanguage(
    false,
    synchronizedBriefing.synthesis.synthesisPosture
  )

  const synchronizedSurvivability = formatCGISurvivabilityLanguage(
    synchronizedBriefing.synthesis.synthesisPosture
  )

  const synchronizedGovernance = formatCGIGovernanceSafeLanguage()

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • RECOVERY</p>

          <h1 style={styles.title}>Recovery Credibility Intelligence</h1>

          <p style={styles.subtitle}>
            Recovery view for distinguishing visible recovery from durable
            stabilization, detecting reburn, and requiring evidence before
            confidence is restored.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Executive Focus</p>

            <h2 style={styles.heroTitle}>
              {recoveryIntelligence.executiveFocus}
            </h2>

            <p style={styles.heroMeaning}>
              {synchronizedBriefing.executiveSummary}
            </p>
          </div>

          <div style={styles.toneBox}>
            <p style={styles.toneLabel}>Shell Tone</p>
            <p style={styles.toneValue}>
              {recoveryIntelligence.shell.severityTone}
            </p>
          </div>
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
            title="Recovery Credibility"
            value={formatLabel(
              recoveryIntelligence.derivation.recoveryCredibility
            )}
          >
            {recoveryIntelligence.shell.recoveryPanel.interpretation}
          </Panel>

          <Panel
            title="Continuity Condition"
            value={formatLabel(
              recoveryIntelligence.derivation.continuityCondition
            )}
          >
            {recoveryIntelligence.shell.continuityPanel.interpretation}
          </Panel>

          <Panel
            title="Continuity Confidence"
            value={formatLabel(
              recoveryIntelligence.derivation.continuityConfidence
            )}
          >
            {recoveryIntelligence.shell.confidencePanel.interpretation}
          </Panel>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Dominant Recovery Truth">
            {recoveryIntelligence.command.dominantTruth}
          </Panel>

          <Panel title="Primary Recovery Driver">
            {recoveryIntelligence.command.primaryDriver}
          </Panel>
        </section>

        <section style={styles.gridThree}>
          <Panel
            title="Structural Memory"
            value={formatLabel(
              recoveryIntelligence.memory.primaryMemorySignal
            )}
          >
            {recoveryIntelligence.memory.executiveMemoryWarning}
          </Panel>

          <Panel
            title="Reburn Detected"
            value={recoveryIntelligence.memory.reburnDetected ? 'YES' : 'NO'}
          >
            Reburn means instability returned after apparent recovery.
          </Panel>

          <Panel
            title="Recovery Collapse"
            value={
              recoveryIntelligence.memory.recoveryCollapseDetected
                ? 'YES'
                : 'NO'
            }
          >
            Recovery collapse means earlier recovery did not hold.
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Recovery Doctrine</p>

          <h2 style={styles.cardTitle}>
            Visible recovery must prove durability.
          </h2>

          <p style={styles.bodyText}>
            CGI does not restore trust simply because a case appears recovered.
            Recovery must hold across time without reburn, relapse, unresolved
            pressure, or recurring instability.
          </p>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Required Recovery Action">
            {synchronizedPosture.actionLanguage}
          </Panel>

          <Panel title="Required Recovery Evidence">
            {synchronizedEvidence}
          </Panel>
        </section>

        <section style={styles.gridThree}>
          <Panel
            title="Accountability Status"
            value={formatLabel(
              recoveryIntelligence.accountability.accountabilityStatus
            )}
          >
            {recoveryIntelligence.accountability.escalationRule}
          </Panel>

          <Panel
            title="Accountability Risk"
            value={formatLabel(
              recoveryIntelligence.accountability.accountabilityRisk
            )}
          >
            Recovery accountability must remain active until stabilization is
            verified.
          </Panel>

          <Panel title="Verification Standard" value="Evidence Required">
            {recoveryIntelligence.accountability.verificationStandard}
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Recovery Interpretation</p>

          <h2 style={styles.cardTitle}>
            Recovery is a credibility test, not a status label.
          </h2>

          <p style={styles.bodyText}>
            {recoveryIntelligence.operationalNarrative}
          </p>
        </section>

        <section style={styles.gridTwo}>
          <RecoveryPrinciple
            title="Do not trust appearance alone"
            body="A recovery status is not enough. CGI requires evidence that stabilization is actually holding."
          />

          <RecoveryPrinciple
            title="Watch for reburn"
            body="If instability returns after apparent recovery, the system must treat it as a structural warning."
          />

          <RecoveryPrinciple
            title="Verify before confidence"
            body="Confidence should only improve after durable recovery evidence is visible."
          />

          <RecoveryPrinciple
            title="Protect against false closure"
            body="False closure creates leadership confidence before the institution has actually stabilized."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Expansion Readiness</p>

          <h2 style={styles.cardTitle}>
            Recovery intelligence now supports continuity trustworthiness.
          </h2>

          <p style={styles.bodyText}>
            This synchronized recovery layer supports executive briefing
            automation, continuity trustworthiness boards, survivability
            monitoring, governance intelligence layers, and cross-site
            continuity coordination.
          </p>
        </section>
      </div>
    </main>
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
    <section style={styles.panel}>
      <p style={styles.panelKicker}>{title}</p>

      {value ? <h3 style={styles.panelValue}>{value}</h3> : null}

      {children ? <div style={styles.panelBody}>{children}</div> : null}
    </section>
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

function RecoveryPrinciple({
  title,
  body,
}: {
  title: string
  body: ReactNode
}) {
  return (
    <article style={styles.principleCard}>
      <p style={styles.principleKicker}>CGI Recovery Principle</p>
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
    maxWidth: '780px',
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
    fontSize: '28px',
    lineHeight: 1.1,
    margin: 0,
    fontWeight: 900,
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
}