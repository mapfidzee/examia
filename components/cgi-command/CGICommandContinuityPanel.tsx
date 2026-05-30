type CommandEvidence = {
  activeRecords?: number
  commandEscalations?: number
  recurrenceVisible?: number
  highPressureRecords?: number
  recoveryMonitoring?: number
}

function formatCount(value?: number): number {
  return Number.isFinite(value) ? Number(value) : 0
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

export default function CGICommandContinuityPanel({
  evidence,
}: {
  evidence?: CommandEvidence
}) {
  const activeRecords = formatCount(evidence?.activeRecords)
  const commandEscalations = formatCount(evidence?.commandEscalations)
  const recurrenceVisible = formatCount(evidence?.recurrenceVisible)
  const highPressureRecords = formatCount(evidence?.highPressureRecords)
  const recoveryMonitoring = formatCount(evidence?.recoveryMonitoring)

  const hasActiveEvidence = activeRecords > 0

  const elevated =
    commandEscalations > 0 || recurrenceVisible > 0 || highPressureRecords > 1

  const dominantTruth = !hasActiveEvidence
    ? 'No active command pressure is visible.'
    : elevated
      ? 'Command-visible continuity pressure requires executive review.'
      : 'Command-visible continuity pressure remains proportionate.'

  const narrative = !hasActiveEvidence
    ? 'The continuity command layer is calm because no active lifecycle records are currently attributed to Command. This panel is no longer using hardcoded test pressure.'
    : elevated
      ? 'Active lifecycle evidence shows command escalation, recurrence visibility, or high-pressure continuity exposure. Command should preserve executive visibility until ownership, evidence, action, outcome credibility, and durability are clarified.'
      : 'Active lifecycle evidence is visible, but current command exposure remains proportionate. Command should continue monitoring without manufacturing executive threat.'

  const continuityCondition = !hasActiveEvidence
    ? 'NO ACTIVE GOVERNED INSTABILITY'
    : elevated
      ? 'ELEVATED CONTINUITY EXPOSURE'
      : 'ACTIVE COMMAND WATCH'

  const executivePosture = !hasActiveEvidence
    ? 'NO EXECUTIVE INTERVENTION REQUIRED'
    : elevated
      ? 'EXECUTIVE REVIEW REQUIRED'
      : 'PROPORTIONAL COMMAND MONITORING'

  const recoveryCredibility = !hasActiveEvidence
    ? 'NO ACTIVE RECOVERY CONCERN'
    : recoveryMonitoring > 0
      ? 'RECOVERY MONITORING VISIBLE'
      : 'RECOVERY CREDIBILITY NOT YET ESTABLISHED'

  const structuralMemory = !hasActiveEvidence
    ? 'NO ACTIVE MEMORY SIGNAL'
    : recurrenceVisible > 0
      ? 'RECURRENCE MEMORY VISIBLE'
      : 'MEMORY VISIBLE'

  const accountability = !hasActiveEvidence
    ? 'NO ACTIVE ACCOUNTABILITY PRESSURE'
    : elevated
      ? 'EXECUTIVE ACCOUNTABILITY WATCH'
      : 'GOVERNED ACCOUNTABILITY MONITORING'

  const requiredEvidence = !hasActiveEvidence
    ? 'No active command evidence required.'
    : 'Evidence should show ownership, action movement, outcome credibility, recurrence status, and recovery durability before command concern relaxes.'

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
        {dominantTruth}
      </h2>

      <p
        style={{
          color: '#cbd5e1',
          lineHeight: 1.65,
          margin: 0,
          maxWidth: '860px',
        }}
      >
        {narrative}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '14px',
          marginTop: '18px',
        }}
      >
        <MiniPanel title="Continuity Condition" value={continuityCondition}>
          {!hasActiveEvidence
            ? 'No active lifecycle evidence is currently placing continuity under command pressure.'
            : elevated
              ? 'Active lifecycle evidence requires executive visibility before command concern can relax.'
              : 'Active lifecycle evidence remains visible but proportionate.'}
        </MiniPanel>

        <MiniPanel title="Executive Posture" value={executivePosture}>
          {!hasActiveEvidence
            ? 'Command should remain calm and avoid inherited threat language.'
            : elevated
              ? 'Executive review should confirm ownership, evidence, and follow-through.'
              : 'Executive monitoring may remain proportional.'}
        </MiniPanel>

        <MiniPanel title="Recovery Credibility" value={recoveryCredibility}>
          {!hasActiveEvidence
            ? 'No recovery credibility concern is visible without active command records.'
            : recoveryMonitoring > 0
              ? 'Recovery monitoring is visible, but durability must still be confirmed.'
              : 'Recovery credibility will mature only after outcome verification and durability observation.'}
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
        <MiniPanel title="Structural Memory" value={structuralMemory}>
          {!hasActiveEvidence
            ? 'No active structural memory signal is currently driving command interpretation.'
            : recurrenceVisible > 0
              ? 'Repeated instability remains visible and should not be dismissed as isolated noise.'
              : 'Command memory is visible through current lifecycle evidence.'}
        </MiniPanel>

        <MiniPanel title="Accountability" value={accountability}>
          {!hasActiveEvidence
            ? 'No active accountability pressure is currently visible.'
            : elevated
              ? 'Continuity risk must become owned, evidenced, and time-bound responsibility.'
              : 'Accountability remains under governed monitoring.'}
        </MiniPanel>

        <MiniPanel title="Required Evidence" value="Evidence Status">
          {requiredEvidence}
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
          Command must not manufacture threat from old tests. Visible recovery is
          not the same as durable stabilization, and active command pressure must
          be traceable to current lifecycle evidence.
        </p>
      </div>
    </section>
  )
}