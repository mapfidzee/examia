'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  buildCGIPressureDoctrine,
  type CGIPressureMetric,
} from '@/lib/cgiPressureDoctrineEngine'
import { supabase } from '../../lib/supabase'

const SAMPLE_LIMIT = 120

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
  const [metrics, setMetrics] = useState<CGIPressureMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPressureMetrics()
  }, [])

  async function loadPressureMetrics() {
    setMessage('Loading pressure intelligence...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Pressure intelligence could not be loaded.')
      return
    }

    setMetrics((data || []) as CGIPressureMetric[])
    setMessage('Pressure intelligence loaded.')
  }

  const pressure = useMemo(
    () => buildCGIPressureDoctrine(metrics),
    [metrics],
  )

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • PRESSURE</p>
            <h1 style={styles.title}>Enterprise Pressure Intelligence</h1>
            <p style={styles.subtitle}>
              Pressure answers whether continuity strain is still contained
              before it forces command action. CGI treats pressure as governed
              continuity exposure, not simple workload.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>TRUST READING</p>
            <p style={styles.statusValue}>
              {pressure.trustAssessment.trustReading}
            </p>
            <p style={styles.statusMeaning}>
              {pressure.trustAssessment.trustMeaning}
            </p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.gridTwo}>
          <Panel title="Executive Pressure Question">
            <h2 style={styles.bigText}>{pressure.pressureQuestion}</h2>
            <p style={styles.bodyText}>{pressure.pressureConclusion}</p>
          </Panel>

          <Panel title="Pressure Conclusion">
            <h2 style={styles.bigText}>{pressure.pressureThesis}</h2>
            <p style={styles.bodyText}>
              {pressure.trustAssessment.finalInterpretation}
            </p>
          </Panel>
        </section>

        <section style={styles.metricGrid}>
          <Metric label="Escalation" value={pressure.scores.escalation} />
          <Metric label="Propagation" value={pressure.scores.propagation} />
          <Metric label="Routing" value={pressure.scores.routing} />
          <Metric label="Coordination" value={pressure.scores.coordination} />
          <Metric label="Containment" value={pressure.scores.containment} />
          <Metric label="Volatility" value={pressure.scores.volatility} />
        </section>

        <Panel title="Continuity Derivation Standard">
          <div style={styles.infoGrid}>
            <Info
              label="What Is Visible"
              value={pressure.continuityStandard.whatIsVisible}
            />
            <Info
              label="Why It Matters"
              value={pressure.continuityStandard.whyItMatters}
            />
            <Info
              label="Continuity Risk"
              value={pressure.continuityStandard.continuityRisk}
            />
            <Info
              label="Required Movement"
              value={pressure.continuityStandard.requiredMovement}
            />
            <Info
              label="Trust Level"
              value={pressure.continuityStandard.trustLevel}
            />
            <Info
              label="Institutional Meaning"
              value={pressure.continuityStandard.institutionalMeaning}
            />
          </div>
        </Panel>

        <section style={styles.gridThree}>
          <Card
            title="Trust Doctrine"
            value={pressure.trustAssessment.executiveDecision}
            body={pressure.trustAssessment.trustMeaning}
          />
          <Card
            title="Memory Doctrine"
            value={pressure.memoryDoctrine.trustReading}
            body={pressure.memoryDoctrine.institutionalMeaning}
          />
          <Card
            title="Audit Doctrine"
            value={pressure.auditDoctrine.auditCredibility}
            body={pressure.auditDoctrine.evidenceGap}
          />
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Enterprise Pressure Requirements">
            <Info
              label="Evidence Requirement"
              value={pressure.evidenceRequirement}
            />
            <Info
              label="Executive Action"
              value={pressure.trustAssessment.executiveDecision}
            />
            <Info
              label="Board Warning"
              value={pressure.trustAssessment.boardLevelWarning}
            />
            <Info
              label="Dominant Driver"
              value={pressure.dominantPressureDriver}
            />
          </Panel>

          <Panel title="Latest Pressure Context">
            <Info
              label="Continuity State"
              value={pressure.latest?.continuity_state || 'Not recorded'}
            />
            <Info
              label="Pressure State"
              value={
                pressure.latest?.pressure_propagation_state || 'Not recorded'
              }
            />
            <Info
              label="Trajectory Direction"
              value={pressure.latest?.trajectory_direction || 'Not recorded'}
            />
            <Info
              label="Structural Memory"
              value={
                pressure.latest?.structural_memory_state || 'Not recorded'
              }
            />
            <Info
              label="Dominant Pressure"
              value={
                pressure.latest?.dominant_pressure_source || 'Not recorded'
              }
            />
          </Panel>
        </section>

        <section style={styles.gridFour}>
          <Card
            title="Command"
            value={pressure.commandImplication}
            body="How command should interpret pressure."
          />
          <Card
            title="Executive Report"
            value={pressure.executiveReportImplication}
            body="How pressure should appear in executive reporting."
          />
          <Card
            title="Memory Board"
            value={pressure.memoryBoardImplication}
            body="What institutional memory must preserve."
          />
          <Card
            title="Audit"
            value={pressure.auditImplication}
            body="What audit must reconstruct."
          />
        </section>

        <Panel title="Recent Pressure Memory Trail">
          <div style={styles.cardHeader}>
            <p style={styles.bodyText}>
              Pressure readings are continuity observations, not personal
              performance judgments.
            </p>

            <button onClick={loadPressureMetrics} style={styles.button}>
              Refresh
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Escalation</th>
                  <th style={styles.th}>Propagation</th>
                  <th style={styles.th}>Routing</th>
                  <th style={styles.th}>Coordination</th>
                  <th style={styles.th}>Drag</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No persisted pressure memory found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 10).map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{formatDate(item.created_at)}</td>
                    <td style={styles.td}>{item.escalation_pressure_index}</td>
                    <td style={styles.td}>{item.propagation_risk}</td>
                    <td style={styles.td}>{item.routing_friction}</td>
                    <td style={styles.td}>{item.coordination_instability}</td>
                    <td style={styles.td}>{item.stabilization_drag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <section style={styles.reportPanel}>
          <p style={styles.kicker}>COPY-READY PRESSURE BRIEF</p>
          <h2 style={styles.bigText}>
            Can continuity pressure still be contained?
          </h2>
          <pre style={styles.pre}>{pressure.copyReadyBrief}</pre>
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

function formatDate(value: string) {
  if (!value) return 'Not recorded'
  return new Date(value).toLocaleString()
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
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },
  metricGrid: {
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
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'flex-start',
  },
  button: {
    border: 'none',
    borderRadius: 999,
    padding: '12px 18px',
    background: '#c9a227',
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tableWrap: {
    marginTop: 20,
    overflowX: 'auto',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: 860,
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    color: '#d7b84c',
    background: 'rgba(201,162,39,0.08)',
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  td: {
    padding: 16,
    color: '#dce1e8',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    fontSize: 13,
    lineHeight: 1.55,
    verticalAlign: 'top',
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