'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { evaluateCGILiveOperationalIntegration } from '@/lib/cgiLiveOperationalIntegrationEngine'
import {
  buildCGIOperationsLiveDataInput,
  type OperationsCase,
  type OperationsIntervention,
  type OperationsOutcome,
  type OperationsRoutingAction,
  type OperationsTimelineEvent,
} from '@/lib/cgiOperationsLiveDataEngine'
import { supabase } from '../../lib/supabase'

function formatLabel(value: string): string {
  return value.replaceAll('_', ' ')
}

export default function OperationsPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
    >
      <CGIGovernanceShell>
        <OperationsContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function OperationsContent() {
  const [cases, setCases] = useState<OperationsCase[]>([])
  const [routingActions, setRoutingActions] = useState<
    OperationsRoutingAction[]
  >([])
  const [interventions, setInterventions] = useState<
    OperationsIntervention[]
  >([])
  const [outcomes, setOutcomes] = useState<OperationsOutcome[]>([])
  const [timelineEvents, setTimelineEvents] = useState<
    OperationsTimelineEvent[]
  >([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadOperationsData()
  }, [])

  async function loadOperationsData() {
    setMessage('Loading live operational continuity intelligence...')

    const [
      casesResult,
      routingResult,
      interventionsResult,
      outcomesResult,
      timelineResult,
    ] = await Promise.all([
      supabase
        .from('beneficiary_cases')
        .select('id, case_status, severity_level, safeguarding_flag, created_at, updated_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('case_routing_actions')
        .select('id, case_id, assigned_responder_id, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('case_interventions')
        .select('id, case_id, intervention_status, evidence_summary, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('case_outcomes')
        .select('id, case_id, outcome_status, outcome_summary, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('case_timeline')
        .select('id, case_id, event_type, event_summary, created_at')
        .order('created_at', { ascending: false }),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionsResult.error) console.error(interventionsResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)
    if (timelineResult.error) console.error(timelineResult.error)

    if (
      casesResult.error ||
      routingResult.error ||
      interventionsResult.error ||
      outcomesResult.error ||
      timelineResult.error
    ) {
      setMessage('Some live operational continuity intelligence failed to load.')
      return
    }

    setCases((casesResult.data || []) as OperationsCase[])
    setRoutingActions((routingResult.data || []) as OperationsRoutingAction[])
    setInterventions((interventionsResult.data || []) as OperationsIntervention[])
    setOutcomes((outcomesResult.data || []) as OperationsOutcome[])
    setTimelineEvents((timelineResult.data || []) as OperationsTimelineEvent[])

    setMessage('Live operational continuity intelligence loaded.')
  }

  const liveOperationalInput = useMemo(
    () =>
      buildCGIOperationsLiveDataInput({
        cases,
        routingActions,
        interventions,
        outcomes,
        timelineEvents,
      }),
    [cases, routingActions, interventions, outcomes, timelineEvents],
  )

  const operationsIntelligence = useMemo(
    () => evaluateCGILiveOperationalIntegration(liveOperationalInput),
    [liveOperationalInput],
  )

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • OPERATIONS</p>

          <h1 style={styles.title}>Operational Continuity Intelligence</h1>

          <p style={styles.subtitle}>
            Operations view for interpreting active strain, coordination
            weakness, recovery credibility, structural memory, and
            stabilization capacity.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Executive Focus</p>

            <h2 style={styles.heroTitle}>
              {operationsIntelligence.executiveFocus}
            </h2>

            <p style={styles.heroMeaning}>
              {operationsIntelligence.routePurpose}
            </p>
          </div>

          <div style={styles.toneBox}>
            <p style={styles.toneLabel}>Shell Tone</p>
            <p style={styles.toneValue}>
              {operationsIntelligence.shell.severityTone}
            </p>
          </div>
        </section>

        <section style={styles.gridThree}>
          <Panel title="Open Cases" value={String(liveOperationalInput.openCases)}>
            Active operational records currently visible to CGI.
          </Panel>

          <Panel
            title="Escalated Cases"
            value={String(liveOperationalInput.escalatedCases)}
          >
            Cases already carrying escalation or governance review posture.
          </Panel>

          <Panel
            title="Coordination Issues"
            value={String(liveOperationalInput.coordinationIssues)}
          >
            Routing or ownership issues that may block movement.
          </Panel>
        </section>

        <section style={styles.gridThree}>
          <Panel
            title="Continuity Condition"
            value={formatLabel(
              operationsIntelligence.derivation.continuityCondition,
            )}
          >
            {operationsIntelligence.shell.continuityPanel.interpretation}
          </Panel>

          <Panel
            title="Continuity Confidence"
            value={formatLabel(
              operationsIntelligence.derivation.continuityConfidence,
            )}
          >
            {operationsIntelligence.shell.confidencePanel.interpretation}
          </Panel>

          <Panel
            title="Operational Posture"
            value={formatLabel(
              operationsIntelligence.derivation.executivePosture,
            )}
          >
            {operationsIntelligence.shell.commandPanel.interpretation}
          </Panel>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Dominant Operational Truth">
            {operationsIntelligence.command.dominantTruth}
          </Panel>

          <Panel title="Primary Driver">
            {operationsIntelligence.command.primaryDriver}
          </Panel>
        </section>

        <section style={styles.gridThree}>
          <Panel
            title="Recovery Credibility"
            value={formatLabel(
              operationsIntelligence.derivation.recoveryCredibility,
            )}
          >
            {operationsIntelligence.shell.recoveryPanel.interpretation}
          </Panel>

          <Panel
            title="Structural Memory"
            value={formatLabel(
              operationsIntelligence.memory.primaryMemorySignal,
            )}
          >
            {operationsIntelligence.memory.executiveMemoryWarning}
          </Panel>

          <Panel
            title="Accountability"
            value={formatLabel(
              operationsIntelligence.accountability.accountabilityStatus,
            )}
          >
            {operationsIntelligence.accountability.escalationRule}
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Operational Interpretation</p>

          <h2 style={styles.cardTitle}>
            Operations must protect stabilization capacity.
          </h2>

          <p style={styles.bodyText}>
            {operationsIntelligence.operationalNarrative}
          </p>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Required Action">
            {operationsIntelligence.command.requiredAction}
          </Panel>

          <Panel title="Required Evidence">
            {operationsIntelligence.command.requiredEvidence}
          </Panel>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Operations Doctrine</p>

          <h2 style={styles.cardTitle}>
            Operations is where instability either stabilizes or spreads.
          </h2>

          <p style={styles.bodyText}>
            CGI operations intelligence does not simply show workload. It
            interprets whether coordination, recovery, recurrence, and
            accountability are strengthening or weakening continuity
            credibility.
          </p>
        </section>

        <section style={styles.gridTwo}>
          <OperationsPrinciple
            title="Coordination"
            body="Operational strain becomes dangerous when coordination weakens and unresolved pathways accumulate."
          />

          <OperationsPrinciple
            title="Recovery"
            body="Operational recovery must be verified before leadership can trust that stabilization is durable."
          />

          <OperationsPrinciple
            title="Memory"
            body="Repeated instability in operations should be treated as a structural signal, not isolated noise."
          />

          <OperationsPrinciple
            title="Action"
            body="Every serious operational strain must move toward owner, action, evidence, and verification."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Live Data Upgrade</p>

          <h2 style={styles.cardTitle}>
            Operations is now derived from live Supabase continuity records.
          </h2>

          <p style={styles.bodyText}>
            Static operational scenario inputs have been replaced by live
            derivation from cases, routing actions, interventions, outcomes, and
            timeline memory.
          </p>

          <button onClick={loadOperationsData} style={styles.primaryButton}>
            Refresh Live Operations
          </button>
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

function OperationsPrinciple({
  title,
  body,
}: {
  title: string
  body: ReactNode
}) {
  return (
    <article style={styles.principleCard}>
      <p style={styles.principleKicker}>CGI Operations Principle</p>
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
  message: {
    background: '#082f49',
    border: '1px solid #0ea5e9',
    borderRadius: '16px',
    color: '#cffafe',
    fontWeight: 900,
    marginBottom: '16px',
    padding: '12px 14px',
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
  primaryButton: {
    border: 'none',
    borderRadius: '14px',
    background: '#67e8f9',
    color: '#082f49',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 900,
    marginTop: '16px',
    minHeight: '46px',
    padding: '0 18px',
  },
}