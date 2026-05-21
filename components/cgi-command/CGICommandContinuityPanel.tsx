import { evaluateCGILiveOperationalIntegration } from '@/lib/cgiLiveOperationalIntegrationEngine'

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ')
}

function MiniPanel({
  title,
  value,
  children,
}: {
  title: string
  value?: string
  children?: React.ReactNode
}) {
  return (
    <section
      style={{
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '14px',
        background: '#0f172a',
      }}
    >
      <p
        style={{
          color: '#94a3b8',
          fontSize: '12px',
          fontWeight: 900,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          margin: 0,
        }}
      >
        {title}
      </p>

      {value ? (
        <h3
          style={{
            color: '#f8fafc',
            fontSize: '18px',
            lineHeight: 1.2,
            margin: '8px 0 0',
          }}
        >
          {value}
        </h3>
      ) : null}

      {children ? (
        <div
          style={{
            color: '#cbd5e1',
            fontSize: '14px',
            lineHeight: 1.55,
            marginTop: '8px',
          }}
        >
          {children}
        </div>
      ) : null}
    </section>
  )
}

export default function CGICommandContinuityPanel() {
  const commandIntelligence = evaluateCGILiveOperationalIntegration({
    route: 'COMMAND',
    openCases: 9,
    escalatedCases: 4,
    repeatedInstabilityCount: 6,
    unresolvedCriticalCount: 1,
    recoveryFailures: 3,
    verifiedRecoveries: 0,
    coordinationIssues: 5,
    averageUnresolvedDays: 12,
    unresolvedDurationDays: 12,
    reburnCount: 2,
    priorEscalationCount: 4,
    priorSurvivabilityThreatCount: 0,
    ownerAssigned: true,
    actionStarted: true,
    evidenceSubmitted: true,
    evidenceVerified: false,
    deadlineMissed: true,
  })

  return (
    <section
      style={{
        background: '#020617',
        border: '1px solid #22d3ee',
        borderRadius: '24px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.24)',
      }}
    >
      <p
        style={{
          color: '#67e8f9',
          fontSize: '12px',
          fontWeight: 900,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          margin: 0,
        }}
      >
        CGI Continuity Command Layer
      </p>

      <h2
        style={{
          color: '#f8fafc',
          fontSize: '28px',
          lineHeight: 1.15,
          margin: '10px 0 8px',
        }}
      >
        {commandIntelligence.command.dominantTruth}
      </h2>

      <p
        style={{
          color: '#cbd5e1',
          lineHeight: 1.65,
          margin: 0,
          maxWidth: '860px',
        }}
      >
        {commandIntelligence.operationalNarrative}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '14px',
          marginTop: '18px',
        }}
      >
        <MiniPanel
          title="Continuity Condition"
          value={formatLabel(
            commandIntelligence.derivation.continuityCondition
          )}
        >
          {commandIntelligence.shell.continuityPanel.interpretation}
        </MiniPanel>

        <MiniPanel
          title="Executive Posture"
          value={formatLabel(commandIntelligence.derivation.executivePosture)}
        >
          {commandIntelligence.shell.commandPanel.interpretation}
        </MiniPanel>

        <MiniPanel
          title="Recovery Credibility"
          value={formatLabel(
            commandIntelligence.derivation.recoveryCredibility
          )}
        >
          {commandIntelligence.shell.recoveryPanel.interpretation}
        </MiniPanel>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '14px',
          marginTop: '14px',
        }}
      >
        <MiniPanel
          title="Structural Memory"
          value={formatLabel(commandIntelligence.memory.primaryMemorySignal)}
        >
          {commandIntelligence.memory.executiveMemoryWarning}
        </MiniPanel>

        <MiniPanel
          title="Accountability"
          value={formatLabel(
            commandIntelligence.accountability.accountabilityStatus
          )}
        >
          {commandIntelligence.accountability.escalationRule}
        </MiniPanel>

        <MiniPanel
          title="Required Evidence"
          value="Evidence Required"
        >
          {commandIntelligence.command.requiredEvidence}
        </MiniPanel>
      </div>

      <div
        style={{
          marginTop: '16px',
          border: '1px solid #334155',
          borderRadius: '18px',
          padding: '16px',
          background: '#0f172a',
        }}
      >
        <p
          style={{
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: 900,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Doctrine Lock
        </p>

        <p
          style={{
            color: '#f8fafc',
            fontSize: '18px',
            lineHeight: 1.55,
            margin: '8px 0 0',
            fontWeight: 800,
          }}
        >
          Visible recovery is not the same as durable stabilization. CGI governs
          continuity credibility under pressure.
        </p>
      </div>
    </section>
  )
}