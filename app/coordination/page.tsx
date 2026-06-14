'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  buildCGICoordinationDoctrine,
  type CGIBeneficiaryCase,
  type CGICaseIntervention,
  type CGICaseOutcome,
  type CGICoordinationRow,
  type CGIInstitution,
  type CGIResponder,
  type CGIRoutingAction,
} from '@/lib/cgiCoordinationDoctrineEngine'
import { supabase } from '../../lib/supabase'

export default function CoordinationPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <CoordinationContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function CoordinationContent() {
  const [cases, setCases] = useState<CGIBeneficiaryCase[]>([])
  const [institutions, setInstitutions] = useState<CGIInstitution[]>([])
  const [responders, setResponders] = useState<CGIResponder[]>([])
  const [routingActions, setRoutingActions] = useState<CGIRoutingAction[]>([])
  const [interventions, setInterventions] = useState<CGICaseIntervention[]>([])
  const [outcomes, setOutcomes] = useState<CGICaseOutcome[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadCoordinationData()
  }, [])

  async function loadCoordinationData() {
    setMessage('Refreshing enterprise coordination intelligence...')

    const [
      caseResult,
      institutionResult,
      responderResult,
      routingResult,
      interventionResult,
      outcomeResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('institutions').select('*'),
      supabase.from('responders').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*'),
    ])

    if (caseResult.error) console.error(caseResult.error)
    if (institutionResult.error) console.error(institutionResult.error)
    if (responderResult.error) console.error(responderResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionResult.error) console.error(interventionResult.error)
    if (outcomeResult.error) console.error(outcomeResult.error)

    setCases((caseResult.data || []) as CGIBeneficiaryCase[])
    setInstitutions((institutionResult.data || []) as CGIInstitution[])
    setResponders((responderResult.data || []) as CGIResponder[])
    setRoutingActions((routingResult.data || []) as CGIRoutingAction[])
    setInterventions((interventionResult.data || []) as CGICaseIntervention[])
    setOutcomes((outcomeResult.data || []) as CGICaseOutcome[])
    setMessage('Enterprise coordination intelligence refreshed.')
  }

  const coordination = useMemo(
    () =>
      buildCGICoordinationDoctrine({
        cases,
        institutions,
        responders,
        routingActions,
        interventions,
        outcomes,
      }),
    [cases, institutions, responders, routingActions, interventions, outcomes],
  )

  const { reading, pattern } = coordination

  const memoryGroups = [
    {
      title: 'Regions',
      rows: coordination.regionRows,
    },
    {
      title: 'Institutions',
      rows: coordination.institutionRows,
    },
    {
      title: 'Responders',
      rows: coordination.responderRows,
    },
    {
      title: 'Lifecycle',
      rows: coordination.lifecycleRows,
    },
  ]

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • ENTERPRISE COORDINATION</p>
            <h1 style={styles.title}>Enterprise Coordination Intelligence</h1>
            <p style={styles.subtitle}>
              Coordination governs the dependencies that must synchronize before
              continuity can safely move.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>COORDINATION POSTURE</p>
            <p style={styles.statusValue}>{reading.status}</p>
            <p style={styles.statusMeaning}>{reading.synchronizationMeaning}</p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.gridTwo}>
          <Panel title="Executive Coordination Question">
            <h2 style={styles.bigText}>{reading.executiveQuestion}</h2>
            <p style={styles.bodyText}>{reading.chainPosition}</p>
          </Panel>

          <Panel title="Board Warning">
            <h2 style={styles.bigText}>
              Unsynchronized dependencies create false continuity confidence.
            </h2>
            <p style={styles.bodyText}>{reading.boardWarning}</p>
          </Panel>
        </section>

        <section style={styles.metricGrid}>
          <Metric label="Coordination Cases" value={coordination.activeCases.length} />
          <Metric label="Stalled" value={coordination.stalledCases.length} />
          <Metric label="Recurrence" value={coordination.recurrenceCases.length} />
          <Metric label="Intervention" value={coordination.interventionCoverage} suffix="%" />
          <Metric label="Outcome" value={coordination.outcomeCoverage} suffix="%" />
        </section>

        <section style={styles.gridFour}>
          <Card title="Pattern" value={pattern.patternName} body={pattern.patternMeaning} />
          <Card
            title="Enterprise Exposure"
            value={pattern.enterpriseExposure}
            body="Whether coordination remains local or is becoming enterprise-visible."
          />
          <Card
            title="Executive Meaning"
            value={pattern.executiveMeaning}
            body="What leadership should understand before movement."
          />
          <Card
            title="Cross-Site Question"
            value={pattern.crossSiteQuestion}
            body="What Coordination hands to Cross-Site."
          />
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Coordination Movement Requirements">
            <Info label="Required Action" value={reading.requiredAction} />
            <Info label="Next Destination" value={reading.nextDestination} />
            <Info label="Handoff Reason" value={reading.handoffReason} />
            <Info label="Continuity Risk" value={reading.continuityRisk} />
            <Info label="Evidence Standard" value={reading.evidenceStandard} />
          </Panel>

          <Panel title="Enterprise Movement Gates">
            <Info label="Coordination" value={reading.coordinationRequired ? 'REQUIRED' : 'WATCH'} />
            <Info label="Cross-Site" value={reading.crossSiteRequired ? 'REQUIRED' : 'CONDITIONAL'} />
            <Info label="Executive" value={reading.executiveReviewRequired ? 'REQUIRED' : 'CONDITIONAL'} />
            <Info label="Audit" value={reading.auditRequired ? 'REQUIRED' : 'CONDITIONAL'} />
            <Info label="History" value={reading.continuityHistoryRequired ? 'REQUIRED' : 'CONDITIONAL'} />
          </Panel>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.kicker}>Coordination Refresh</p>
            <h2 style={styles.panelTitle}>
              Refresh enterprise synchronization intelligence.
            </h2>
            <p style={styles.bodyText}>
              Reloads cases, institutions, responders, routing actions,
              interventions, and outcomes before recalculating doctrine.
            </p>
          </div>

          <button onClick={loadCoordinationData} style={styles.button}>
            Refresh Coordination
          </button>
        </section>

        <Panel title="Synchronization Memory">
          <div style={styles.memoryGrid}>
            {memoryGroups.map((group) => (
              <MemoryGroup key={group.title} title={group.title} rows={group.rows} />
            ))}
          </div>
        </Panel>

        <section style={styles.reportPanel}>
          <p style={styles.kicker}>COPY-READY COORDINATION BRIEF</p>
          <h2 style={styles.panelTitle}>
            What dependencies must synchronize before continuity can move?
          </h2>
          <pre style={styles.pre}>{coordination.copyReadyBrief}</pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE COORDINATION DOCTRINE</strong>
          <span>
            Command decides movement. Coordination synchronizes dependency.
            Cross-Site compares pattern. Situation Room interprets operating
            condition. Executive Center governs meaning. Audit preserves
            reconstructability.
          </span>
        </section>
      </div>
    </main>
  )
}

function Metric({
  label,
  value,
  suffix = '',
}: {
  label: string
  value: number
  suffix?: string
}) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>
        {value}
        {suffix}
      </p>
    </article>
  )
}

function Card({ title, value, body }: { title: string; value: string; body: string }) {
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
      <div style={styles.infoList}>{children}</div>
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

function MemoryGroup({ title, rows }: { title: string; rows: CGICoordinationRow[] }) {
  return (
    <article style={styles.memoryGroup}>
      <p style={styles.memoryTitle}>{title}</p>
      <RowList rows={rows} compact />
    </article>
  )
}

function RowList({
  rows,
  compact = false,
}: {
  rows: CGICoordinationRow[]
  compact?: boolean
}) {
  return (
    <div style={compact ? styles.compactRowList : styles.rowList}>
      {rows.length === 0 && (
        <p style={styles.bodyText}>No synchronization memory available yet.</p>
      )}

      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`} style={styles.rowItem}>
          <div>
            <strong style={styles.rowLabel}>{row.label}</strong>
            <p style={styles.rowDetail}>{row.detail}</p>
          </div>
          <strong style={styles.rowValue}>{row.value}</strong>
        </div>
      ))}
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
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
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
  infoList: {
    display: 'grid',
    gap: 10,
    marginTop: 18,
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '190px minmax(0, 1fr)',
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
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 14,
  },
  memoryGroup: {
    padding: 16,
    borderRadius: 20,
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  memoryTitle: {
    margin: '0 0 12px',
    color: '#d7b84c',
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  rowList: {
    display: 'grid',
    gap: 10,
  },
  compactRowList: {
    display: 'grid',
    gap: 8,
  },
  rowItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    padding: 14,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  rowLabel: {
    color: '#fff',
  },
  rowDetail: {
    color: '#aeb6c2',
    margin: '6px 0 0',
    fontSize: 12,
  },
  rowValue: {
    color: '#d7b84c',
    fontSize: 18,
  },
  reportPanel: {
    padding: 28,
    borderRadius: 28,
    background: '#fff',
    color: '#0b0b0b',
  },
  pre: {
    marginTop: 20,
    padding: 22,
    borderRadius: 20,
    background: '#0a0a0a',
    color: '#f8f6f1',
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
    color: '#fff',
    lineHeight: 1.7,
  },
}