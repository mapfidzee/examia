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

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • ENTERPRISE COORDINATION</p>
            <h1 style={styles.title}>Enterprise Coordination Intelligence</h1>
            <p style={styles.subtitle}>
              Coordination governs the dependencies that must synchronize before
              continuity can safely move. It protects ownership, routing,
              responder capacity, institutional load, evidence maturity,
              recovery readiness, and shared dependency visibility.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>COORDINATION POSTURE</p>
            <p style={styles.statusValue}>{reading.status}</p>
            <p style={styles.statusMeaning}>{reading.synchronizationMeaning}</p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Executive Coordination Question</p>
            <h2 style={styles.commandTitle}>{reading.executiveQuestion}</h2>
            <p style={styles.primaryText}>{reading.chainPosition}</p>

            <div style={styles.commandMetaGrid}>
              <MiniStat label="Pattern" value={pattern.patternName} />
              <MiniStat label="Next" value={reading.nextDestination} />
              <MiniStat
                label="Cross-Site"
                value={reading.crossSiteRequired ? 'REQUIRED' : 'CONDITIONAL'}
              />
              <MiniStat
                label="Audit"
                value={reading.auditRequired ? 'REQUIRED' : 'CONDITIONAL'}
              />
            </div>
          </div>

          <div style={styles.consequenceCard}>
            <p style={styles.sectionKicker}>Board Warning</p>
            <h2 style={styles.consequenceTitle}>
              Unsynchronized dependencies create false continuity confidence.
            </h2>
            <p style={styles.bodyText}>{reading.boardWarning}</p>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Coordination Status" textValue={reading.status} />
          <Metric label="Active Cases" value={coordination.activeCases.length} />
          <Metric label="Coordination Sites" value={institutions.length} />
          <Metric
            label="Active Responders"
            value={coordination.activeResponders.length}
          />
          <Metric label="Routing Actions" value={routingActions.length} />
          <Metric
            label="Safeguarding Flags"
            value={coordination.safeguardingCases.length}
          />
          <Metric
            label="Intervention Coverage"
            value={coordination.interventionCoverage}
            suffix="%"
          />
          <Metric
            label="Outcome Coverage"
            value={coordination.outcomeCoverage}
            suffix="%"
          />
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Synchronization Pattern"
            value={pattern.patternName}
            body={pattern.patternMeaning}
          />
          <ExecutiveCard
            title="Enterprise Exposure"
            value={pattern.enterpriseExposure}
            body="Whether coordination pressure is still local or becoming enterprise-visible."
          />
          <ExecutiveCard
            title="Executive Meaning"
            value={pattern.executiveMeaning}
            body="What leadership should understand before the chain moves forward."
          />
          <ExecutiveCard
            title="Cross-Site Question"
            value={pattern.crossSiteQuestion}
            body="The question Coordination hands to Cross-Site when dependency visibility expands."
          />
        </section>

        <section style={styles.gridFour}>
          <RequirementCard
            label="Shared Ownership"
            active={pattern.sharedOwnershipVisible}
            body="Whether multiple records are converging around the same ownership structure."
          />
          <RequirementCard
            label="Shared Institution"
            active={pattern.sharedInstitutionVisible}
            body="Whether institutional load may be creating distributed coordination pressure."
          />
          <RequirementCard
            label="Shared Responder"
            active={pattern.sharedResponderVisible}
            body="Whether responder concentration may weaken continuity confidence."
          />
          <RequirementCard
            label="Shared Region"
            active={pattern.sharedRegionVisible}
            body="Whether visible pressure may be regional rather than isolated."
          />
        </section>

        <section style={styles.memoryPanel}>
          <p style={styles.sectionKicker}>Synchronization Memory</p>
          <h2 style={styles.panelTitle}>
            The institution must remember which dependencies repeatedly require
            synchronization.
          </h2>

          <div style={styles.memoryGrid}>
            <MiniStat
              label="Regions"
              value={String(coordination.regionRows.length)}
            />
            <MiniStat label="Institutions" value={String(institutions.length)} />
            <MiniStat label="Responders" value={String(responders.length)} />
            <MiniStat
              label="Lifecycle States"
              value={String(coordination.lifecycleRows.length)}
            />
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Coordination Movement Requirements">
            <Info label="Required Action" value={reading.requiredAction} />
            <Info label="Handoff Reason" value={reading.handoffReason} />
            <Info label="Continuity Risk" value={reading.continuityRisk} />
            <Info
              label="Synchronization Evidence"
              value={pattern.requiredSynchronizationEvidence}
            />
          </Panel>

          <Panel title="Enterprise Movement Gates">
            <Info
              label="Coordination"
              value={reading.coordinationRequired ? 'REQUIRED' : 'WATCH'}
            />
            <Info
              label="Cross-Site"
              value={reading.crossSiteRequired ? 'REQUIRED' : 'CONDITIONAL'}
            />
            <Info
              label="Executive"
              value={reading.executiveReviewRequired ? 'REQUIRED' : 'CONDITIONAL'}
            />
            <Info
              label="Audit"
              value={reading.auditRequired ? 'REQUIRED' : 'CONDITIONAL'}
            />
          </Panel>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Coordination Refresh</p>
            <h2 style={styles.actionTitle}>
              Refresh enterprise synchronization intelligence.
            </h2>
            <p style={styles.actionText}>
              Refreshing reloads cases, institutions, responders, routing
              actions, interventions, and outcomes before recalculating
              dependency posture.
            </p>
          </div>

          <button onClick={loadCoordinationData} style={styles.primaryButton}>
            Refresh Coordination
          </button>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Regional Synchronization Memory">
            <RowList rows={coordination.regionRows} />
          </Panel>
          <Panel title="Institution Synchronization Memory">
            <RowList rows={coordination.institutionRows} />
          </Panel>
          <Panel title="Responder Synchronization Memory">
            <RowList rows={coordination.responderRows} />
          </Panel>
          <Panel title="Lifecycle Synchronization Memory">
            <RowList rows={coordination.lifecycleRows} />
          </Panel>
        </section>

        <section style={styles.orderPanel}>
          <p style={styles.sectionKicker}>Copy-Ready Coordination Brief</p>
          <h2 style={styles.panelTitle}>
            What dependencies must synchronize before continuity can move?
          </h2>
          <pre style={styles.summaryBox}>{coordination.copyReadyBrief}</pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE COORDINATION DOCTRINE</strong>
          <span>
            Command decides movement. Coordination synchronizes dependency.
            Cross-Site compares pattern. Situation Room interprets operating
            condition. Executive Center governs meaning. Audit preserves
            reconstructability. Continuity must not move forward on hidden
            ownership, routing, responder, institutional, evidence, recovery, or
            shared dependency weakness.
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
  textValue,
}: {
  label: string
  value?: number
  suffix?: string
  textValue?: string
}) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={textValue ? styles.metricTextValue : styles.metricValue}>
        {textValue || `${value ?? 0}${suffix}`}
      </p>
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

function ExecutiveCard({
  title,
  value,
  body,
}: {
  title: string
  value: string
  body: string
}) {
  return (
    <article style={styles.panelCard}>
      <p style={styles.sectionKicker}>{title}</p>
      <h3 style={styles.cardValue}>{value}</h3>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function RequirementCard({
  label,
  active,
  body,
}: {
  label: string
  active: boolean
  body: string
}) {
  return (
    <article
      style={{
        ...styles.panelCard,
        ...(active ? styles.activePanelCard : {}),
      }}
    >
      <p style={styles.sectionKicker}>{label}</p>
      <h3 style={styles.cardValue}>{active ? 'REQUIRED' : 'WATCH'}</h3>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={styles.panel}>
      <p style={styles.sectionKicker}>{title}</p>
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

function RowList({ rows }: { rows: CGICoordinationRow[] }) {
  return (
    <div style={styles.rowList}>
      {rows.length === 0 && (
        <p style={styles.emptyText}>No synchronization memory available yet.</p>
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
    background:
      'linear-gradient(180deg, rgba(201,162,39,0.18), rgba(0,0,0,0.38))',
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
    overflowWrap: 'anywhere',
  },
  statusMeaning: {
    margin: '12px 0 0',
    color: '#ECE7D7',
    fontSize: 14,
    lineHeight: 1.7,
  },
  message: {
    padding: '14px 18px',
    borderRadius: 16,
    color: '#D7B84C',
    background: 'rgba(201,162,39,0.1)',
    border: '1px solid rgba(201,162,39,0.22)',
    fontWeight: 800,
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
  primaryText: {
    margin: 0,
    color: '#4A4A4A',
    lineHeight: 1.7,
    fontSize: 14,
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
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
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
    fontSize: 28,
    fontWeight: 950,
    lineHeight: 1.15,
    overflowWrap: 'anywhere',
  },
  metricTextValue: {
    margin: '10px 0 0',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 950,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
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
  activePanelCard: {
    background:
      'linear-gradient(135deg, rgba(201,162,39,0.14), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.38)',
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
    overflowWrap: 'anywhere',
  },
  panelBody: {
    marginTop: 10,
    color: '#AEB6C2',
    fontSize: 14,
    lineHeight: 1.65,
  },
  memoryPanel: {
    padding: 28,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(201,162,39,0.13), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.32)',
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
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
    color: '#858D98',
    fontWeight: 900,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  infoValue: {
    color: '#FFFFFF',
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
  actionTitle: {
    margin: '12px 0 0',
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.04em',
  },
  actionText: {
    margin: '12px 0 0',
    color: '#AEB6C2',
    lineHeight: 1.7,
    maxWidth: 820,
  },
  primaryButton: {
    border: 'none',
    borderRadius: 999,
    padding: '14px 22px',
    background: '#C9A227',
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  rowList: {
    display: 'grid',
    gap: 10,
  },
  rowItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  rowLabel: {
    color: '#FFFFFF',
    lineHeight: 1.35,
  },
  rowDetail: {
    color: '#AEB6C2',
    margin: '6px 0 0',
    fontSize: 12,
    lineHeight: 1.4,
  },
  rowValue: {
    color: '#D7B84C',
    fontSize: 18,
  },
  emptyText: {
    margin: 0,
    color: '#AEB6C2',
    lineHeight: 1.6,
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