'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { interpretBottleneck } from '@/lib/cgi/interpreters/interpretBottleneck'
import { clamp } from '@/lib/cgiConstraintInterpretationEngine'
import {
  buildEnterpriseConstraintIntelligence,
  type EnterpriseConstraintIntelligence,
} from '@/lib/cgiEnterpriseConstraintDoctrineEngine'
import { supabase } from '../../lib/supabase'

type BeneficiaryCase = {
  id: string
  beneficiary_name: string
  case_status: string
  safeguarding_flag: boolean
  region: string | null
  assigned_responder_id?: string | null
}

type RoutingAction = {
  id: string
  case_id: string
  assigned_responder_id?: string | null
}

type Intervention = {
  id: string
  case_id: string
}

type Outcome = {
  id: string
  case_id: string
  outcome_status?: string | null
}

type Responder = {
  id: string
  full_name: string
}

const ACTIVE_CASE_STATUSES = [
  'NEED_DETECTED',
  'UNDER_ASSESSMENT',
  'ROUTED',
  'RESPONDER_ASSIGNED',
  'INTERVENTION_ACTIVE',
  'STABILIZING',
  'ACCEPTED_FOR_GOVERNANCE',
  'STABILIZATION_OWNER_ROUTED',
  'GOVERNANCE_REVIEW_REQUIRED',
  'EVIDENCE_REQUIRED_BEFORE_ROUTING',
  'OWNERSHIP_CLARITY_REQUIRED',
  'ROUTING_STALLED',
  'ACTION_ACTIVE',
  'RECOVERY_MONITORING',
  'ESCALATED',
  'REOPENED',
]

export default function BottlenecksPage() {
  return (
    <CGIGovernanceShell>
      <BottlenecksContent />
    </CGIGovernanceShell>
  )
}

function BottlenecksContent() {
  const [cases, setCases] = useState<BeneficiaryCase[]>([])
  const [routingActions, setRoutingActions] = useState<RoutingAction[]>([])
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [outcomes, setOutcomes] = useState<Outcome[]>([])
  const [responders, setResponders] = useState<Responder[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setMessage('Loading enterprise constraint intelligence...')

    const [
      casesResult,
      routingResult,
      interventionsResult,
      outcomesResult,
      respondersResult,
    ] = await Promise.all([
      supabase.from('beneficiary_cases').select('*'),
      supabase.from('case_routing_actions').select('*'),
      supabase.from('case_interventions').select('*'),
      supabase.from('case_outcomes').select('*'),
      supabase.from('responders').select('*'),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (routingResult.error) console.error(routingResult.error)
    if (interventionsResult.error) console.error(interventionsResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)
    if (respondersResult.error) console.error(respondersResult.error)

    setCases((casesResult.data || []) as BeneficiaryCase[])
    setRoutingActions((routingResult.data || []) as RoutingAction[])
    setInterventions((interventionsResult.data || []) as Intervention[])
    setOutcomes((outcomesResult.data || []) as Outcome[])
    setResponders((respondersResult.data || []) as Responder[])

    setMessage('Enterprise constraint intelligence loaded.')
  }

  const intelligence = useMemo(() => {
    const safeguardingFlags = cases.filter((item) => item.safeguarding_flag).length

    const activeCases = cases.filter((item) =>
      ACTIVE_CASE_STATUSES.includes(item.case_status),
    )

    const interventionCaseIds = new Set(interventions.map((item) => item.case_id))
    const outcomeCaseIds = new Set(outcomes.map((item) => item.case_id))
    const routedCaseIds = new Set(routingActions.map((item) => item.case_id))

    const unresolvedCases = activeCases.filter(
      (item) => interventionCaseIds.has(item.id) && !outcomeCaseIds.has(item.id),
    ).length

    const stalledCases = activeCases.filter(
      (item) => outcomeCaseIds.has(item.id) && item.case_status !== 'STABILIZED',
    ).length

    const unroutedCases = activeCases.filter(
      (item) => !routedCaseIds.has(item.id),
    ).length

    const unclearOwnership = routingActions.filter(
      (item) => !item.assigned_responder_id,
    ).length

    const regionalMap: Record<string, number> = {}

    activeCases.forEach((item) => {
      const region = item.region || 'Unspecified region'
      regionalMap[region] = (regionalMap[region] || 0) + 1
    })

    const highestRegionalLoad = Math.max(...Object.values(regionalMap), 0)

    const responderLoadMap: Record<string, number> = {}

    routingActions.forEach((item) => {
      const responder = item.assigned_responder_id || 'UNASSIGNED'
      responderLoadMap[responder] = (responderLoadMap[responder] || 0) + 1
    })

    const highestResponderLoad = Math.max(...Object.values(responderLoadMap), 0)

    const centralizedConstraint = interpretBottleneck({
      routingCongestion: clamp(highestResponderLoad * 20 + unroutedCases * 15),
      responderConcentration: clamp(highestResponderLoad * 20),
      unresolvedMomentum: clamp(unresolvedCases * 25 + unclearOwnership * 15),
      continuityDrift: clamp(stalledCases * 25),
      propagationRisk: clamp(safeguardingFlags * 25 + highestRegionalLoad * 10),
    })

    const enterprise: EnterpriseConstraintIntelligence =
      buildEnterpriseConstraintIntelligence({
        reportTemplate: 'Executive constraint intelligence brief',
        constraintFocus: 'Routing constraint visibility',
        operatingScope: 'Enterprise continuity view',
        additionalNotes: '',
        bottleneckPosture: centralizedConstraint.posture,
        bottleneckInterpretation: centralizedConstraint.summary,
        bottleneckAction: centralizedConstraint.executiveAction,
        activeCases: activeCases.length,
        safeguardingFlags,
        unresolvedCases,
        stalledCases,
        unroutedCases,
        unclearOwnership,
        highestResponderLoad,
        highestRegionalLoad,
      })

    return {
      enterprise,
      activeCases: activeCases.length,
      safeguardingFlags,
      unresolvedCases,
      stalledCases,
      unroutedCases,
      unclearOwnership,
      highestRegionalLoad,
    }
  }, [cases, routingActions, interventions, outcomes, responders])

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • ENTERPRISE CONSTRAINTS</p>
            <h1 style={styles.title}>Enterprise Constraint Intelligence</h1>
            <p style={styles.subtitle}>
              Constraint Intelligence identifies what is preventing continuity
              from moving forward.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>CONSTRAINT POSTURE</p>
            <p style={styles.statusValue}>{intelligence.enterprise.posture}</p>
            <p style={styles.statusMeaning}>{intelligence.enterprise.thesis}</p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.gridTwo}>
          <Panel title="Executive Constraint Question">
            <h2 style={styles.bigText}>{intelligence.enterprise.question}</h2>
            <p style={styles.bodyText}>
              {intelligence.enterprise.dominantConstraint}
            </p>
          </Panel>

          <Panel title="Board Warning">
            <h2 style={styles.bigText}>
              Blocked movement becomes hidden instability.
            </h2>
            <p style={styles.bodyText}>
              {intelligence.enterprise.boardWarning}
            </p>
          </Panel>
        </section>

        <section style={styles.metricGrid}>
          <Metric label="Active Cases" value={String(intelligence.activeCases)} />
          <Metric label="Unrouted" value={String(intelligence.unroutedCases)} />
          <Metric
            label="Ownership Gaps"
            value={String(intelligence.unclearOwnership)}
          />
          <Metric label="Stalled" value={String(intelligence.stalledCases)} />
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Required Movement">
            <Info
              label="Required Action"
              value={intelligence.enterprise.executiveAction}
            />
            <Info
              label="Required Evidence"
              value="Preserve routing blockage, ownership gaps, stalled outcomes, safeguarding pressure, and evidence of movement."
            />
            <Info
              label="Cross-Site Impact"
              value={intelligence.enterprise.crossSiteImplication}
            />
          </Panel>

          <Panel title="Continuity Standard">
            <Info
              label="Command"
              value={intelligence.enterprise.commandImplication}
            />
            <Info
              label="Coordination"
              value={intelligence.enterprise.coordinationImplication}
            />
            <Info
              label="Reliability"
              value={intelligence.enterprise.reliabilityImplication}
            />
          </Panel>
        </section>

        <Panel title="Constraint Drivers">
          <div style={styles.infoGrid}>
            <Info
              label="Routing"
              value={intelligence.enterprise.routingConstraint}
            />
            <Info
              label="Ownership"
              value={intelligence.enterprise.ownershipConstraint}
            />
            <Info
              label="Stabilization"
              value={intelligence.enterprise.stabilizationConstraint}
            />
            <Info
              label="Safeguarding"
              value={intelligence.enterprise.safeguardingConstraint}
            />
          </div>
        </Panel>

        <Panel title="Enterprise Implications">
          <div style={styles.infoGrid}>
            <Info
              label="Regional"
              value={intelligence.enterprise.regionalConstraint}
            />
            <Info
              label="Command"
              value={intelligence.enterprise.commandImplication}
            />
            <Info
              label="Coordination"
              value={intelligence.enterprise.coordinationImplication}
            />
            <Info
              label="Reliability"
              value={intelligence.enterprise.reliabilityImplication}
            />
          </div>
        </Panel>

        <section style={styles.memoryPanel}>
          <div>
            <p style={styles.kicker}>Constraint Memory</p>
            <h2 style={styles.panelTitle}>Memory Signals</h2>
            <p style={styles.bodyText}>
              {intelligence.unresolvedCases} unresolved •{' '}
              {intelligence.stalledCases} stalled •{' '}
              {intelligence.safeguardingFlags} safeguarding • regional load{' '}
              {intelligence.highestRegionalLoad}
            </p>
          </div>

          <button onClick={loadData} style={styles.button}>
            Refresh Constraints
          </button>
        </section>

        <section style={styles.reportPanel}>
          <p style={styles.kicker}>CONSTRAINT BRIEF</p>
          <h2 style={styles.bigText}>
            What is preventing continuity from moving forward?
          </h2>

          <div style={styles.briefGrid}>
            <Info label="Question" value={intelligence.enterprise.question} />
            <Info
              label="Primary Constraint"
              value={intelligence.enterprise.dominantConstraint}
            />
            <Info
              label="Required Action"
              value={intelligence.enterprise.executiveAction}
            />
            <Info
              label="Evidence"
              value="Preserve routing blockage, ownership gaps, stalled outcomes, safeguarding pressure, and evidence of movement."
            />
            <Info
              label="Cross-Site"
              value={intelligence.enterprise.crossSiteImplication}
            />
            <Info
              label="Command Meaning"
              value={intelligence.enterprise.commandImplication}
            />
          </div>
        </section>

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE CONSTRAINT DOCTRINE</strong>
          <span>
            Constraints are not delays. Constraints are blocked continuity
            movement. When routing, ownership, evidence, stabilization, or
            coordination cannot move, instability can remain visible without
            becoming resolved.
          </span>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
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
    gap: 20,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.75fr)',
    gap: 20,
    padding: 22,
    border: '1px solid rgba(201,162,39,0.34)',
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
    boxShadow: '0 28px 80px rgba(0,0,0,0.38)',
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
    margin: '10px 0 0',
    fontSize: 'clamp(2.15rem, 4.6vw, 4.45rem)',
    lineHeight: 0.93,
    letterSpacing: '-0.07em',
    fontWeight: 950,
  },
  subtitle: {
    maxWidth: 820,
    margin: '12px 0 0',
    color: '#c8cdd4',
    fontSize: 16,
    lineHeight: 1.55,
  },
  statusBox: {
    border: '1px solid rgba(201,162,39,0.5)',
    borderRadius: 24,
    padding: 18,
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
    margin: '12px 0 0',
    fontSize: 27,
    fontWeight: 950,
    letterSpacing: '-0.04em',
    lineHeight: 1.05,
    overflowWrap: 'anywhere',
  },
  statusMeaning: {
    margin: '10px 0 0',
    color: '#ece7d7',
    fontSize: 13,
    lineHeight: 1.5,
  },
  message: {
    padding: '12px 16px',
    borderRadius: 16,
    color: '#d7b84c',
    background: 'rgba(201,162,39,0.1)',
    border: '1px solid rgba(201,162,39,0.22)',
    fontWeight: 800,
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
  },
  metricCard: {
    padding: 16,
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
    margin: '8px 0 0',
    color: '#fff',
    fontSize: 26,
    fontWeight: 950,
    lineHeight: 1.1,
  },
  panel: {
    padding: 20,
    borderRadius: 26,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  bigText: {
    margin: '12px 0',
    fontSize: 'clamp(1.5rem, 2.8vw, 2.55rem)',
    lineHeight: 1.03,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  panelTitle: {
    margin: '8px 0 0',
    fontSize: 23,
    lineHeight: 1.1,
    letterSpacing: '-0.045em',
  },
  bodyText: {
    margin: '8px 0 0',
    color: '#aeb6c2',
    lineHeight: 1.6,
    fontSize: 14,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
    marginTop: 14,
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '160px minmax(0, 1fr)',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  infoLabel: {
    color: '#858d98',
    fontWeight: 900,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  infoValue: {
    color: '#fff',
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  memoryPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 16,
    alignItems: 'center',
    padding: 18,
    borderRadius: 26,
    background:
      'linear-gradient(135deg, rgba(201,162,39,0.13), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.32)',
  },
  button: {
    border: 'none',
    borderRadius: 999,
    padding: '12px 20px',
    background: '#c9a227',
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  reportPanel: {
    padding: 22,
    borderRadius: 26,
    background: '#fff',
    color: '#0b0b0b',
  },
  briefGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
    marginTop: 14,
  },
  doctrineCard: {
    display: 'grid',
    gap: 10,
    padding: 22,
    borderRadius: 24,
    background: '#050505',
    border: '1px solid rgba(201,162,39,0.42)',
    color: '#fff',
    lineHeight: 1.65,
  },
}