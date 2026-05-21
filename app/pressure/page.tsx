'use client'

import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { evaluateCGILiveOperationalIntegration } from '@/lib/cgiLiveOperationalIntegrationEngine'

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ')
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
  const pressureIntelligence = evaluateCGILiveOperationalIntegration({
    route: 'PRESSURE',
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
  })

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • PRESSURE</p>

          <h1 style={styles.title}>Survivability Pressure Intelligence</h1>

          <p style={styles.subtitle}>
            Pressure view for identifying unresolved load, escalation
            concentration, coordination strain, recurrence, and survivability
            risk before continuity credibility weakens further.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Executive Focus</p>

            <h2 style={styles.heroTitle}>
              {pressureIntelligence.executiveFocus}
            </h2>

            <p style={styles.heroMeaning}>
              {pressureIntelligence.routePurpose}
            </p>
          </div>

          <div style={styles.toneBox}>
            <p style={styles.toneLabel}>Pressure Tone</p>
            <p style={styles.toneValue}>
              {pressureIntelligence.shell.severityTone}
            </p>
          </div>
        </section>

        <section style={styles.gridThree}>
          <Panel
            title="Survivability Pressure"
            value={formatLabel(
              pressureIntelligence.derivation.survivabilityPressure
            )}
          >
            This indicates whether operational pressure is becoming a
            continuity survivability concern.
          </Panel>

          <Panel
            title="Continuity Condition"
            value={formatLabel(
              pressureIntelligence.derivation.continuityCondition
            )}
          >
            {pressureIntelligence.shell.continuityPanel.interpretation}
          </Panel>

          <Panel
            title="Continuity Confidence"
            value={formatLabel(
              pressureIntelligence.derivation.continuityConfidence
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

        <section style={styles.gridThree}>
          <Panel
            title="Structural Memory"
            value={formatLabel(
              pressureIntelligence.memory.primaryMemorySignal
            )}
          >
            {pressureIntelligence.memory.executiveMemoryWarning}
          </Panel>

          <Panel
            title="Pressure Memory Risk"
            value={formatLabel(
              pressureIntelligence.memory.memoryRiskLevel
            )}
          >
            Pressure memory shows whether strain is accumulating across time.
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
          <p style={styles.sectionKicker}>Pressure Doctrine</p>

          <h2 style={styles.cardTitle}>
            Pressure becomes dangerous when it weakens continuity credibility.
          </h2>

          <p style={styles.bodyText}>
            CGI does not treat pressure as a simple workload issue. Pressure
            becomes command-relevant when it accumulates, concentrates, repeats,
            delays recovery, or threatens the institution&apos;s ability to
            stabilize itself under strain.
          </p>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Required Pressure Action">
            {pressureIntelligence.command.requiredAction}
          </Panel>

          <Panel title="Required Evidence">
            {pressureIntelligence.command.requiredEvidence}
          </Panel>
        </section>

        <section style={styles.gridThree}>
          <Panel
            title="Accountability Status"
            value={formatLabel(
              pressureIntelligence.accountability.accountabilityStatus
            )}
          >
            {pressureIntelligence.accountability.escalationRule}
          </Panel>

          <Panel
            title="Accountability Risk"
            value={formatLabel(
              pressureIntelligence.accountability.accountabilityRisk
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
          <p style={styles.sectionKicker}>Legacy Preservation</p>

          <h2 style={styles.cardTitle}>
            Previous pressure intelligence is preserved.
          </h2>

          <p style={styles.bodyText}>
            The earlier pressure page was backed up as{' '}
            <strong>app/pressure/page.legacy.tsx</strong>. Valuable legacy
            logic can now be reintroduced later as smaller governed components.
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