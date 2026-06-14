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

function logOperationsLoadError(label: string, error: unknown) {
  if (!error) return

  console.warn(`Operations load warning: ${label}`, {
    message: error instanceof Error ? error.message : String(error),
    raw: error,
  })
}

export default function OperationsPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <OperationsContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function OperationsContent() {
  const [cases, setCases] = useState<OperationsCase[]>([])
  const [routingActions, setRoutingActions] = useState<OperationsRoutingAction[]>([])
  const [interventions, setInterventions] = useState<OperationsIntervention[]>([])
  const [outcomes, setOutcomes] = useState<OperationsOutcome[]>([])
  const [timelineEvents, setTimelineEvents] = useState<OperationsTimelineEvent[]>([])
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
        .select('*')
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

    logOperationsLoadError('beneficiary_cases', casesResult.error)
    logOperationsLoadError('case_routing_actions', routingResult.error)
    logOperationsLoadError('case_interventions', interventionsResult.error)
    logOperationsLoadError('case_outcomes', outcomesResult.error)
    logOperationsLoadError('case_timeline', timelineResult.error)

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
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • OPERATIONS</p>
            <h1 style={styles.title}>Operational Continuity Intelligence</h1>
            <p style={styles.subtitle}>
              Operations interprets active strain, coordination weakness,
              recovery credibility, structural memory, and stabilization capacity.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>OPERATING POSTURE</p>
            <p style={styles.statusValue}>
              {operationsIntelligence.shell.severityTone}
            </p>
            <p style={styles.statusMeaning}>
              {operationsIntelligence.routePurpose}
            </p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.gridTwo}>
          <Panel title="Executive Operations Question">
            <h2 style={styles.bigText}>{operationsIntelligence.executiveFocus}</h2>
            <p style={styles.bodyText}>
              {operationsIntelligence.operationalNarrative}
            </p>
          </Panel>

          <Panel title="Operational Conclusion">
            <h2 style={styles.bigText}>
              Operations must protect stabilization capacity.
            </h2>
            <p style={styles.bodyText}>
              CGI operations intelligence does not show workload alone. It
              interprets whether active movement is strengthening or weakening
              continuity credibility.
            </p>
          </Panel>
        </section>

        <section style={styles.metricGrid}>
          <Metric label="Open Cases" value={liveOperationalInput.openCases} />
          <Metric label="Escalated" value={liveOperationalInput.escalatedCases} />
          <Metric label="Coordination" value={liveOperationalInput.coordinationIssues} />
        </section>

        <section style={styles.gridThree}>
          <Card
            title="Continuity Condition"
            value={formatLabel(
              operationsIntelligence.derivation.continuityCondition,
            )}
            body={operationsIntelligence.shell.continuityPanel.interpretation}
          />

          <Card
            title="Continuity Confidence"
            value={formatLabel(
              operationsIntelligence.derivation.continuityConfidence,
            )}
            body={operationsIntelligence.shell.confidencePanel.interpretation}
          />

          <Card
            title="Operational Posture"
            value={formatLabel(
              operationsIntelligence.derivation.executivePosture,
            )}
            body={operationsIntelligence.shell.commandPanel.interpretation}
          />
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Operational Truth">
            <Info
              label="Dominant Truth"
              value={operationsIntelligence.command.dominantTruth}
            />
            <Info
              label="Primary Driver"
              value={operationsIntelligence.command.primaryDriver}
            />
          </Panel>

          <Panel title="Required Movement">
            <Info
              label="Required Action"
              value={operationsIntelligence.command.requiredAction}
            />
            <Info
              label="Required Evidence"
              value={operationsIntelligence.command.requiredEvidence}
            />
          </Panel>
        </section>

        <section style={styles.gridThree}>
          <Card
            title="Recovery Credibility"
            value={formatLabel(
              operationsIntelligence.derivation.recoveryCredibility,
            )}
            body={operationsIntelligence.shell.recoveryPanel.interpretation}
          />

          <Card
            title="Structural Memory"
            value={formatLabel(
              operationsIntelligence.memory.primaryMemorySignal,
            )}
            body={operationsIntelligence.memory.executiveMemoryWarning}
          />

          <Card
            title="Accountability"
            value={formatLabel(
              operationsIntelligence.accountability.accountabilityStatus,
            )}
            body={operationsIntelligence.accountability.escalationRule}
          />
        </section>

        <Panel title="Operations Implications">
          <div style={styles.infoGrid}>
            <Info
              label="Coordination"
              value="Operational strain becomes dangerous when coordination weakens and unresolved pathways accumulate."
            />
            <Info
              label="Recovery"
              value="Operational recovery must be verified before leadership can trust that stabilization is durable."
            />
            <Info
              label="Memory"
              value="Repeated instability in operations should be treated as a structural signal, not isolated noise."
            />
            <Info
              label="Action"
              value="Every serious operational strain must move toward owner, action, evidence, and verification."
            />
          </div>
        </Panel>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.kicker}>Live Operations Refresh</p>
            <h2 style={styles.panelTitle}>
              Refresh live operational continuity intelligence.
            </h2>
            <p style={styles.bodyText}>
              Reloads cases, routing actions, interventions, outcomes, and
              timeline memory before recalculating operational doctrine.
            </p>
          </div>

          <button onClick={loadOperationsData} style={styles.button}>
            Refresh Operations
          </button>
        </section>

        <section style={styles.doctrineCard}>
          <strong>OPERATIONS DOCTRINE</strong>
          <span>
            Operations is where instability either stabilizes or spreads. CGI
            operations intelligence protects owner, action, evidence, recovery,
            accountability, and continuity credibility.
          </span>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
    </article>
  )
}

function Card({
  title,
  value,
  body,
}: {
  title: string
  value: string
  body: string
}) {
  return (
    <article style={styles.card}>
      <p style={styles.kicker}>{title}</p>
      <h3 style={styles.cardValue}>{value}</h3>
      <p style={styles.bodyText}>{body}</p>
    </article>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={styles.panel}>
      <p style={styles.kicker}>{title}</p>
      {children}
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

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(201,162,39,0.14), transparent 34%), linear-gradient(135deg, #050505 0%, #0b0b0b 45%, #111111 100%)',
    color: '#fff',
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
    border: '1px solid rgba(201,162,39,0.34)',
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
  },
  kicker: {
    margin: 0,
    color: '#c9a227',
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.18em',
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
    color: '#c8cdd4',
    fontSize: 17,
    lineHeight: 1.8,
  },
  statusBox: {
    border: '1px solid rgba(201,162,39,0.5)',
    borderRadius: 24,
    padding: 24,
    background:
      'linear-gradient(180deg, rgba(201,162,39,0.18), rgba(0,0,0,0.38))',
  },
  statusLabel: {
    margin: 0,
    color: '#d7b84c',
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
    color: '#ece7d7',
    fontSize: 14,
    lineHeight: 1.7,
  },
  message: {
    padding: '14px 18px',
    borderRadius: 16,
    color: '#d7b84c',
    background: 'rgba(201,162,39,0.1)',
    border: '1px solid rgba(201,162,39,0.22)',
    fontWeight: 800,
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
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
    color: '#858d98',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  metricValue: {
    margin: '10px 0 0',
    color: '#fff',
    fontSize: 26,
    fontWeight: 950,
    lineHeight: 1.15,
  },
  panel: {
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  card: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.09)',
    minHeight: 150,
  },
  cardValue: {
    margin: '12px 0 0',
    color: '#fff',
    fontSize: 19,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
  },
  bigText: {
    margin: '14px 0',
    fontSize: 'clamp(1.55rem, 3vw, 2.7rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  panelTitle: {
    margin: '12px 0 0',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
  },
  bodyText: {
    margin: '10px 0 0',
    color: '#aeb6c2',
    lineHeight: 1.7,
    fontSize: 14,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
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
    color: '#858d98',
    fontWeight: 900,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  infoValue: {
    color: '#fff',
    lineHeight: 1.5,
    overflowWrap: 'anywhere',
  },
  actionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 16,
    alignItems: 'center',
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(201,162,39,0.24)',
  },
  button: {
    border: 'none',
    borderRadius: 999,
    padding: '14px 22px',
    background: '#c9a227',
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  doctrineCard: {
    display: 'grid',
    gap: 10,
    padding: 24,
    borderRadius: 24,
    background: '#050505',
    border: '1px solid rgba(201,162,39,0.42)',
    color: '#fff',
    lineHeight: 1.7,
  },
}