'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import {
  buildCGIReliabilityDoctrine,
  type CGIReliabilityMetric,
} from '@/lib/cgiReliabilityDoctrineEngine'
import { supabase } from '../../lib/supabase'

const SAMPLE_LIMIT = 100

export default function ReliabilityPage() {
  return (
    <CGIGovernanceShell>
      <ReliabilityContent />
    </CGIGovernanceShell>
  )
}

function ReliabilityContent() {
  const [metrics, setMetrics] = useState<CGIReliabilityMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadReliabilityMetrics()
  }, [])

  async function loadReliabilityMetrics() {
    setMessage('Loading enterprise reliability memory...')

    const { data, error } = await supabase
      .from('cgi_operational_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(SAMPLE_LIMIT)

    if (error) {
      console.error(error)
      setMessage('Enterprise reliability memory could not be loaded.')
      return
    }

    setMetrics((data || []) as CGIReliabilityMetric[])
    setMessage('Enterprise reliability memory loaded.')
  }

  const reliability = useMemo(
    () => buildCGIReliabilityDoctrine(metrics),
    [metrics],
  )

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • RELIABILITY</p>
            <h1 style={styles.title}>Enterprise Reliability Intelligence</h1>
            <p style={styles.subtitle}>
              Reliability answers whether continuity can be trusted repeatedly
              under pressure. CGI does not treat one recovery as proof of
              institutional reliability.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>TRUST READING</p>
            <p style={styles.statusValue}>
              {reliability.trustAssessment.trustReading}
            </p>
            <p style={styles.statusMeaning}>
              {reliability.trustAssessment.trustMeaning}
            </p>
          </div>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.gridTwo}>
          <Panel title="Executive Reliability Question">
            <h2 style={styles.bigText}>{reliability.reliabilityQuestion}</h2>
            <p style={styles.bodyText}>{reliability.reliabilityConclusion}</p>
          </Panel>

          <Panel title="Reliability Conclusion">
            <h2 style={styles.bigText}>{reliability.reliabilityThesis}</h2>
            <p style={styles.bodyText}>
              {reliability.trustAssessment.finalInterpretation}
            </p>
          </Panel>
        </section>

        <section style={styles.metricGrid}>
          <Metric label="Reliability" value={reliability.scores.reliability} />
          <Metric label="Survivability" value={reliability.scores.survivability} />
          <Metric label="Continuity" value={reliability.scores.continuity} />
          <Metric label="Memory Risk" value={reliability.scores.memoryRisk} />
          <Metric label="Drift" value={reliability.scores.drift} />
          <Metric label="Volatility" value={reliability.scores.volatility} />
        </section>

        <Panel title="Continuity Derivation Standard">
          <div style={styles.infoGrid}>
            <Info
              label="What Is Visible"
              value={reliability.continuityStandard.whatIsVisible}
            />
            <Info
              label="Why It Matters"
              value={reliability.continuityStandard.whyItMatters}
            />
            <Info
              label="Continuity Risk"
              value={reliability.continuityStandard.continuityRisk}
            />
            <Info
              label="Required Movement"
              value={reliability.continuityStandard.requiredMovement}
            />
            <Info
              label="Trust Level"
              value={reliability.continuityStandard.trustLevel}
            />
            <Info
              label="Institutional Meaning"
              value={reliability.continuityStandard.institutionalMeaning}
            />
          </div>
        </Panel>

        <section style={styles.gridThree}>
          <Card
            title="Trust Doctrine"
            value={reliability.trustAssessment.executiveDecision}
            body={reliability.trustAssessment.trustMeaning}
          />
          <Card
            title="Memory Doctrine"
            value={reliability.memoryDoctrine.trustReading}
            body={reliability.memoryDoctrine.institutionalMeaning}
          />
          <Card
            title="Audit Doctrine"
            value={reliability.auditDoctrine.auditCredibility}
            body={reliability.auditDoctrine.evidenceGap}
          />
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Enterprise Reliability Requirements">
            <Info
              label="Evidence Requirement"
              value={reliability.evidenceRequirement}
            />
            <Info
              label="Executive Action"
              value={reliability.trustAssessment.executiveDecision}
            />
            <Info
              label="Board Warning"
              value={reliability.trustAssessment.boardLevelWarning}
            />
            <Info
              label="Stability Thesis"
              value={reliability.trustAssessment.stabilityThesis}
            />
          </Panel>

          <Panel title="Latest Continuity Context">
            <Info
              label="Continuity State"
              value={reliability.latest?.continuity_state || 'Not recorded'}
            />
            <Info
              label="Pressure State"
              value={
                reliability.latest?.pressure_propagation_state || 'Not recorded'
              }
            />
            <Info
              label="Trajectory Direction"
              value={reliability.latest?.trajectory_direction || 'Not recorded'}
            />
            <Info
              label="Structural Memory"
              value={
                reliability.latest?.structural_memory_state || 'Not recorded'
              }
            />
            <Info
              label="Dominant Memory Pattern"
              value={
                reliability.latest?.dominant_memory_pattern || 'Not recorded'
              }
            />
          </Panel>
        </section>

        <section style={styles.gridFour}>
          <Card
            title="Command"
            value={reliability.commandImplication}
            body="How command should interpret reliability."
          />
          <Card
            title="Executive Report"
            value={reliability.executiveReportImplication}
            body="How reliability should appear in executive reporting."
          />
          <Card
            title="Memory Board"
            value={reliability.memoryBoardImplication}
            body="What institutional memory must preserve."
          />
          <Card
            title="Audit"
            value={reliability.auditImplication}
            body="What audit must reconstruct."
          />
        </section>

        <Panel title="Recent Enterprise Reliability Memory">
          <div style={styles.cardHeader}>
            <p style={styles.bodyText}>
              Reliability readings are continuity observations, not personal
              performance judgments.
            </p>

            <button onClick={loadReliabilityMetrics} style={styles.button}>
              Refresh
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Reliability</th>
                  <th style={styles.th}>Continuity</th>
                  <th style={styles.th}>Drift</th>
                  <th style={styles.th}>Survivability</th>
                  <th style={styles.th}>Memory Risk</th>
                </tr>
              </thead>

              <tbody>
                {metrics.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={6}>
                      No persisted enterprise reliability memory found yet.
                    </td>
                  </tr>
                )}

                {metrics.slice(0, 10).map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>{formatDate(item.created_at)}</td>
                    <td style={styles.td}>{item.recovery_reliability_score}</td>
                    <td style={styles.td}>{item.continuity_integrity_score}</td>
                    <td style={styles.td}>{item.continuity_drift}</td>
                    <td style={styles.td}>
                      {item.operational_survivability_score}
                    </td>
                    <td style={styles.td}>{item.structural_memory_risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <section style={styles.reportPanel}>
          <p style={styles.kicker}>COPY-READY RELIABILITY BRIEF</p>
          <h2 style={styles.bigText}>
            Can the institution stabilize repeatedly under pressure?
          </h2>
          <pre style={styles.pre}>{reliability.copyReadyBrief}</pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE RELIABILITY DOCTRINE</strong>
          <span>
            Reliability is not a single recovery. Reliability is the demonstrated
            ability to stabilize repeatedly under pressure without continuity
            credibility collapsing.
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
  commandDeck: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.8fr',
    gap: 24,
  },
  primaryCard: {
    padding: 30,
    borderRadius: 28,
    background: '#fff',
    color: '#0b0b0b',
  },
  consequenceCard: {
    padding: 30,
    borderRadius: 28,
    background: 'rgba(0,0,0,0.38)',
    border: '1px solid rgba(201,162,39,0.28)',
  },
  bigText: {
    margin: '14px 0',
    fontSize: 'clamp(1.55rem, 3vw, 2.7rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
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
    color: '#4a4a4a',
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
    margin: '10px 0 0',
    color: '#aeb6c2',
    lineHeight: 1.7,
    fontSize: 14,
  },
  commandMetaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 24,
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
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
    marginTop: 18,
  },
  infoList: {
    display: 'grid',
    gap: 10,
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