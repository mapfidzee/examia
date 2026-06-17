import Link from 'next/link'
import type { CSSProperties } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'

const lifecycle = [
  ['01', 'Request', '/request', 'Visible need enters governance.'],
  ['02', 'Triage', '/triage', 'Eligibility and evidence are decided.'],
  ['03', 'Cases', '/cases', 'Accepted instability becomes governed.'],
  ['04', 'Routing', '/routing', 'Ownership and direction are assigned.'],
  ['05', 'Interventions', '/interventions', 'Action is recorded as evidence.'],
  ['06', 'Outcomes', '/outcomes', 'Impact is verified before recovery.'],
  ['07', 'Recovery', '/recovery', 'Durability is monitored before trust returns.'],
]

const rules = [
  'A case begins with visible need intake.',
  'Routing is not intervention.',
  'Intervention is not recovery.',
  'Outcome is not continuity.',
  'Recovery is not durability.',
  'Every movement must remain reconstructable.',
  'No signal may become blame, surveillance, or punishment.',
]

export default function CaseFlowPage() {
  return (
    <CGIGovernanceShell>
      <main style={styles.page}>
        <section style={styles.container}>
          <header style={styles.hero}>
            <div>
              <p style={styles.kicker}>TSINAXA CGI • CASE FLOW</p>
              <h1 style={styles.title}>Case Flow</h1>
              <p style={styles.subtitle}>
                Trace visible instability through the locked continuity lifecycle.
              </p>
            </div>

            <div style={styles.statusBox}>
              <p style={styles.statusLabel}>FLOW POSTURE</p>
              <p style={styles.statusValue}>CONTROLLED</p>
              <p style={styles.statusMeaning}>
                Case Flow explains movement. It does not create a new engine,
                route, or doctrine.
              </p>
            </div>
          </header>

          <section style={styles.metricsGrid}>
            <Metric label="Flow Type" value="GOVERNED" />
            <Metric label="Domain" value="HEALTHCARE-FIRST" />
            <Metric label="Logic" value="TRACEABLE" />
            <Metric label="Boundary" value="NON-PUNITIVE" />
          </section>

          <section style={styles.commandDeck}>
            <div style={styles.primaryCard}>
              <p style={styles.sectionKicker}>Case Flow Question</p>
              <h2 style={styles.commandTitle}>
                Can one instability path be reconstructed from request to recovery?
              </h2>
              <p style={styles.bodyText}>
                This surface preserves the chain of movement. It shows whether a
                visible need was captured, governed, routed, acted on, verified,
                and monitored for durable recovery.
              </p>
            </div>

            <div style={styles.warningCard}>
              <p style={styles.sectionKicker}>Boundary</p>
              <h2 style={styles.warningTitle}>Operational, not clinical.</h2>
              <p style={styles.bodyText}>
                Case Flow supports continuity review. It does not diagnose,
                prescribe, rank individuals, or assign blame.
              </p>
            </div>
          </section>

          <section style={styles.panel}>
            <p style={styles.sectionKicker}>Locked Lifecycle Trace</p>
            <h2 style={styles.panelTitle}>Request → Recovery</h2>

            <div style={styles.flowGrid}>
              {lifecycle.map(([number, title, route, purpose]) => (
                <Link key={route} href={route} style={styles.flowCard}>
                  <span style={styles.flowNumber}>{number}</span>
                  <strong style={styles.flowTitle}>{title}</strong>
                  <span style={styles.flowPurpose}>{purpose}</span>
                  <span style={styles.flowRoute}>{route}</span>
                </Link>
              ))}
            </div>
          </section>

          <section style={styles.panel}>
            <p style={styles.sectionKicker}>Case Drift Controls</p>
            <h2 style={styles.panelTitle}>Movement must remain governed.</h2>

            <div style={styles.ruleGrid}>
              {rules.map((rule) => (
                <div key={rule} style={styles.ruleItem}>
                  {rule}
                </div>
              ))}
            </div>
          </section>

          <section style={styles.nextPanel}>
            <div>
              <p style={styles.sectionKicker}>Governance Outcome</p>
              <h2 style={styles.panelTitle}>The case pathway remains traceable.</h2>
              <p style={styles.bodyText}>
                Case Flow exists only to make the continuity chain visible. The
                actual work remains inside Request, Triage, Cases, Routing,
                Interventions, Outcomes, Recovery, Command, and Audit.
              </p>
            </div>

            <div style={styles.linkRow}>
              <Link href="/command" style={styles.linkButton}>
                View Command
              </Link>
              <Link href="/audit" style={styles.secondaryButton}>
                View Audit
              </Link>
            </div>
          </section>

          <section style={styles.doctrineCard}>
            <strong>CASE FLOW DOCTRINE</strong>
            <span>
              Case Flow does not create a new lifecycle. It preserves the locked
              continuity chain so visible instability cannot disappear between
              request, action, outcome, recovery, command, and audit.
            </span>
          </section>
        </section>
      </main>
    </CGIGovernanceShell>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <strong style={styles.metricValue}>{value}</strong>
    </article>
  )
}

const gold = '#d6b25e'
const mutedGold = '#9f8142'
const deepBlack = '#030303'
const panelBlack = '#090807'
const cardBlack = '#11100d'
const softLine = 'rgba(214,178,94,0.24)'
const strongLine = 'rgba(214,178,94,0.42)'

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(214,178,94,0.08), transparent 30%), linear-gradient(180deg, #030303 0%, #090807 100%)',
    color: '#fff8e7',
    padding: '32px 24px 48px',
  },
  container: {
    width: 'min(1180px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gap: 16,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(280px, 0.65fr)',
    gap: 20,
    padding: 24,
    border: `1px solid ${strongLine}`,
    borderRadius: 24,
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.08), rgba(255,255,255,0.018))',
  },
  kicker: {
    margin: 0,
    color: gold,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '10px 0 0',
    fontSize: 'clamp(2.2rem, 4.5vw, 4.6rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.07em',
    fontWeight: 950,
  },
  subtitle: {
    margin: '14px 0 0',
    color: '#cfc7b5',
    fontSize: 14,
    lineHeight: 1.65,
  },
  statusBox: {
    border: `1px solid ${strongLine}`,
    borderRadius: 20,
    padding: 18,
    background:
      'linear-gradient(180deg, rgba(214,178,94,0.18), rgba(0,0,0,0.38))',
  },
  statusLabel: {
    margin: 0,
    color: gold,
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.18em',
  },
  statusValue: {
    margin: '10px 0',
    fontSize: 26,
    fontWeight: 950,
    lineHeight: 1,
  },
  statusMeaning: {
    margin: 0,
    color: '#f5f0e6',
    fontSize: 13,
    lineHeight: 1.6,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 10,
  },
  metricCard: {
    padding: 14,
    borderRadius: 16,
    background: cardBlack,
    border: `1px solid ${softLine}`,
  },
  metricLabel: {
    margin: 0,
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  metricValue: {
    display: 'block',
    marginTop: 8,
    color: gold,
    fontSize: 16,
    lineHeight: 1.2,
  },
  commandDeck: {
    display: 'grid',
    gridTemplateColumns: '1.35fr 0.8fr',
    gap: 16,
  },
  primaryCard: {
    padding: 20,
    borderRadius: 20,
    background: cardBlack,
    border: `1px solid ${softLine}`,
  },
  warningCard: {
    padding: 20,
    borderRadius: 20,
    background: deepBlack,
    border: `1px solid ${softLine}`,
  },
  sectionKicker: {
    margin: 0,
    color: mutedGold,
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
  commandTitle: {
    margin: '10px 0 0',
    fontSize: 'clamp(1.5rem, 3vw, 2.4rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  warningTitle: {
    margin: '10px 0 0',
    fontSize: 24,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
  bodyText: {
    margin: '10px 0 0',
    color: '#cfc7b5',
    fontSize: 13,
    lineHeight: 1.6,
  },
  panel: {
    padding: 18,
    borderRadius: 22,
    background: panelBlack,
    border: `1px solid ${softLine}`,
  },
  panelTitle: {
    margin: '8px 0 0',
    fontSize: 26,
    lineHeight: 1.12,
    letterSpacing: '-0.045em',
  },
  flowGrid: {
    marginTop: 14,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 10,
  },
  flowCard: {
    display: 'grid',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    background: cardBlack,
    border: `1px solid ${softLine}`,
    color: '#fff8e7',
    textDecoration: 'none',
  },
  flowNumber: {
    color: gold,
    fontSize: 11,
    fontWeight: 950,
  },
  flowTitle: {
    fontSize: 18,
    lineHeight: 1.1,
  },
  flowPurpose: {
    color: '#cfc7b5',
    fontSize: 12,
    lineHeight: 1.45,
  },
  flowRoute: {
    color: mutedGold,
    fontSize: 11,
    fontWeight: 900,
  },
  ruleGrid: {
    marginTop: 14,
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  ruleItem: {
    padding: 13,
    borderRadius: 14,
    background: deepBlack,
    border: '1px solid rgba(214,178,94,0.16)',
    color: '#cfc7b5',
    fontSize: 12,
    lineHeight: 1.5,
  },
  nextPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 16,
    alignItems: 'center',
    padding: 18,
    borderRadius: 22,
    background: panelBlack,
    border: `1px solid ${softLine}`,
  },
  linkRow: {
    display: 'flex',
    gap: 10,
  },
  linkButton: {
    borderRadius: 999,
    padding: '11px 14px',
    background: gold,
    color: '#11100d',
    fontWeight: 950,
    textDecoration: 'none',
    fontSize: 13,
  },
  secondaryButton: {
    borderRadius: 999,
    padding: '11px 14px',
    background: 'rgba(214,178,94,0.12)',
    border: `1px solid ${softLine}`,
    color: '#fff8e7',
    fontWeight: 950,
    textDecoration: 'none',
    fontSize: 13,
  },
  doctrineCard: {
    display: 'grid',
    gap: 8,
    padding: 18,
    borderRadius: 20,
    background: deepBlack,
    border: `1px solid ${strongLine}`,
    color: '#fff8e7',
    lineHeight: 1.6,
    fontSize: 13,
  },
}