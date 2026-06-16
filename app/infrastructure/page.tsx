import Link from 'next/link'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIInfrastructureDoctrine } from '@/lib/cgiInfrastructureDoctrineEngine'

export default function InfrastructurePage() {
  const infrastructure = buildCGIInfrastructureDoctrine()

  return (
    <CGIGovernanceShell>
      <main style={styles.page}>
        <section style={styles.container}>
          <header style={styles.hero}>
            <div>
              <p style={styles.kicker}>TSINAXA CGI • INFRASTRUCTURE</p>
              <h1 style={styles.title}>{infrastructure.title}</h1>
              <p style={styles.subtitle}>{infrastructure.subtitle}</p>
              <p style={styles.bodyText}>{infrastructure.thesis}</p>
            </div>

            <div style={styles.statusBox}>
              <p style={styles.statusLabel}>INFRASTRUCTURE POSTURE</p>
              <p style={styles.statusValue}>LOCKED</p>
              <p style={styles.statusMeaning}>
                Continuity governance is defined, bounded, and ready for
                disciplined institutional use.
              </p>
            </div>
          </header>

          <section style={styles.signalGrid}>
            {infrastructure.commandSignals.map((signal) => (
              <article key={signal.label} style={styles.signalCard}>
                <p style={styles.metricLabel}>{signal.label}</p>
                <h2 style={styles.signalValue}>{signal.value}</h2>
                <p style={styles.panelBody}>{signal.cue}</p>
              </article>
            ))}
          </section>

          <section style={styles.doctrinePanel}>
            <p style={styles.sectionKicker}>Locked Doctrine</p>
            <h2 style={styles.panelTitle}>
              Continuity must be governed until stabilization is credible.
            </h2>

            <div style={styles.doctrineGrid}>
              {infrastructure.doctrine.map((item) => (
                <div key={item} style={styles.doctrineItem}>
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section style={styles.commandDeck}>
            <div style={styles.primaryCard}>
              <p style={styles.sectionKicker}>Infrastructure Question</p>
              <h2 style={styles.commandTitle}>
                Can this continuity system be safely adopted without founder
                explanation?
              </h2>
              <p style={styles.bodyText}>
                {infrastructure.adoptionPathwayMeaning}
              </p>
            </div>

            <div style={styles.warningCard}>
              <p style={styles.sectionKicker}>Category Lock</p>
              <h2 style={styles.warningTitle}>{infrastructure.categoryLock}</h2>
              <p style={styles.bodyText}>{infrastructure.categoryMeaning}</p>
            </div>
          </section>

          <section style={styles.commandDeck}>
            <div style={styles.primaryCard}>
              <p style={styles.sectionKicker}>Next Hardening Layer</p>
              <h2 style={styles.panelTitle}>
                {infrastructure.nextHardeningTitle}
              </h2>
              <p style={styles.bodyText}>
                {infrastructure.nextHardeningMeaning}
              </p>
            </div>

            <div style={styles.warningCard}>
              <p style={styles.sectionKicker}>System Boundary</p>
              <h2 style={styles.panelTitle}>
                {infrastructure.systemBoundaryTitle}
              </h2>
              <p style={styles.bodyText}>
                {infrastructure.systemBoundaryMeaning}
              </p>
            </div>
          </section>

          <details style={styles.evidencePanel}>
            <summary style={styles.evidenceSummary}>
              <span>
                <span style={styles.sectionKicker}>
                  Supporting Infrastructure Evidence
                </span>
                <strong style={styles.evidenceTitle}>
                  Adoption stages, readiness checks, guardrails, and route access
                </strong>
              </span>

              <span style={styles.evidenceToggle}>Expand Infrastructure</span>
            </summary>

            <section style={styles.cardNested}>
              <p style={styles.sectionKicker}>Adoption Lifecycle</p>
              <h2 style={styles.panelTitle}>Institutional activation stages</h2>

              <div style={styles.stageGrid}>
                {infrastructure.adoptionStages.map((item) => (
                  <article key={item.status} style={styles.stageCard}>
                    <div style={styles.stageNumber}>{item.stage}</div>
                    <p style={styles.metricLabel}>{item.status}</p>
                    <h3 style={styles.cardValue}>{item.title}</h3>
                    <p style={styles.panelBody}>{item.meaning}</p>
                  </article>
                ))}
              </div>
            </section>

            <section style={styles.gridTwo}>
              <div style={styles.cardNested}>
                <p style={styles.sectionKicker}>Deployment Readiness</p>
                <h2 style={styles.panelTitle}>
                  Readiness checklist before activation
                </h2>

                <div style={styles.checkGrid}>
                  {infrastructure.readinessChecks.map((item) => (
                    <div key={item} style={styles.checkItem}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.cardNested}>
                <p style={styles.sectionKicker}>Deployment Guardrails</p>
                <h2 style={styles.panelTitle}>
                  Governance rules that protect trust
                </h2>

                <div style={styles.guardrailList}>
                  {infrastructure.deploymentLocks.map((item) => (
                    <article key={item.title} style={styles.guardrailItem}>
                      <h3 style={styles.cardValue}>{item.title}</h3>
                      <p style={styles.panelBody}>{item.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section style={styles.cardNested}>
              <p style={styles.sectionKicker}>Core Intelligence Routes</p>
              <h2 style={styles.panelTitle}>Continuity governance access</h2>

              <div style={styles.routeGrid}>
                {infrastructure.accessRoutes.map((route) => (
                  <GatewayLink
                    key={route.href}
                    label={route.label}
                    href={route.href}
                  />
                ))}
              </div>
            </section>
          </details>

          <section style={styles.doctrineCard}>
            <strong>INFRASTRUCTURE DOCTRINE</strong>
            <span>
              TSINAXA CGI is not a page collection. It is continuity governance
              infrastructure: visible instability remains governed until
              stabilization credibility, survivability meaning, executive
              accountability, and institutional memory are preserved.
            </span>
          </section>
        </section>
      </main>
    </CGIGovernanceShell>
  )
}

function GatewayLink({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} style={styles.routeLink}>
      <strong>{label}</strong>
      <span>{href}</span>
    </Link>
  )
}

const gold = '#d6b25e'
const mutedGold = '#9f8142'
const deepBlack = '#030303'
const panelBlack = '#090807'
const cardBlack = '#11100d'
const softLine = 'rgba(214,178,94,0.24)'
const strongLine = 'rgba(214,178,94,0.42)'

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(214,178,94,0.12), transparent 34%), linear-gradient(135deg, #030303 0%, #090807 48%, #11100d 100%)',
    color: '#fff8e7',
    padding: '40px 24px 72px',
  },
  container: {
    width: 'min(1440px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gap: 22,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.75fr)',
    gap: 24,
    padding: 30,
    border: `1px solid ${strongLine}`,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.08), rgba(255,255,255,0.018))',
  },
  kicker: {
    margin: 0,
    color: gold,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '14px 0 0',
    fontSize: 'clamp(2.4rem, 5vw, 5rem)',
    lineHeight: 0.95,
    letterSpacing: '-0.07em',
    fontWeight: 950,
  },
  subtitle: {
    margin: '16px 0 0',
    color: gold,
    fontSize: 19,
    fontWeight: 900,
    lineHeight: 1.35,
  },
  bodyText: {
    margin: '14px 0 0',
    color: '#cfc7b5',
    fontSize: 14,
    lineHeight: 1.75,
    maxWidth: 900,
  },
  statusBox: {
    border: `1px solid ${strongLine}`,
    borderRadius: 24,
    padding: 24,
    background:
      'linear-gradient(180deg, rgba(214,178,94,0.18), rgba(0,0,0,0.38))',
  },
  statusLabel: {
    margin: 0,
    color: gold,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.2em',
  },
  statusValue: {
    margin: '16px 0 0',
    fontSize: 30,
    fontWeight: 950,
    lineHeight: 1.05,
  },
  statusMeaning: {
    margin: '12px 0 0',
    color: '#f5f0e6',
    fontSize: 14,
    lineHeight: 1.7,
  },
  signalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 14,
  },
  signalCard: {
    padding: 18,
    borderRadius: 20,
    background: cardBlack,
    border: `1px solid ${softLine}`,
    minHeight: 132,
  },
  metricLabel: {
    margin: 0,
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  signalValue: {
    margin: '10px 0 0',
    color: gold,
    fontSize: 24,
    fontWeight: 950,
    lineHeight: 1.1,
    overflowWrap: 'anywhere',
  },
  panelBody: {
    marginTop: 10,
    color: '#cfc7b5',
    fontSize: 13,
    lineHeight: 1.6,
  },
  doctrinePanel: {
    padding: 26,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.13), rgba(255,255,255,0.035))',
    border: `1px solid ${strongLine}`,
  },
  sectionKicker: {
    margin: 0,
    color: mutedGold,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  panelTitle: {
    margin: '12px 0 0',
    color: '#fff8e7',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
  },
  doctrineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
  },
  doctrineItem: {
    padding: 14,
    borderRadius: 16,
    background: cardBlack,
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff8e7',
    fontSize: 13,
    lineHeight: 1.45,
    fontWeight: 850,
  },
  commandDeck: {
    display: 'grid',
    gridTemplateColumns: '1.35fr 0.8fr',
    gap: 22,
  },
  primaryCard: {
    padding: 28,
    borderRadius: 28,
    background: cardBlack,
    border: `1px solid ${softLine}`,
  },
  warningCard: {
    padding: 28,
    borderRadius: 28,
    background: deepBlack,
    border: `1px solid ${softLine}`,
  },
  commandTitle: {
    margin: '14px 0 0',
    fontSize: 'clamp(1.8rem, 3vw, 3rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  warningTitle: {
    margin: '14px 0 0',
    fontSize: 28,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
  evidencePanel: {
    padding: 24,
    borderRadius: 28,
    background: panelBlack,
    border: `1px solid ${softLine}`,
  },
  evidenceSummary: {
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 18,
    listStyle: 'none',
  },
  evidenceTitle: {
    display: 'block',
    color: '#fff8e7',
    fontSize: 22,
    lineHeight: 1.2,
    marginTop: 8,
    letterSpacing: '-0.035em',
  },
  evidenceToggle: {
    flex: '0 0 auto',
    borderRadius: 999,
    padding: '10px 14px',
    background: 'rgba(214,178,94,0.12)',
    border: `1px solid ${softLine}`,
    color: gold,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  cardNested: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: 22,
    padding: 22,
    marginTop: 18,
  },
  stageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 14,
    marginTop: 20,
  },
  stageCard: {
    background: cardBlack,
    border: `1px solid ${softLine}`,
    borderRadius: 18,
    padding: 16,
    minHeight: 190,
  },
  stageNumber: {
    width: 34,
    height: 34,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(214,178,94,0.12)',
    border: `1px solid ${softLine}`,
    color: gold,
    fontWeight: 950,
    marginBottom: 14,
  },
  cardValue: {
    margin: '10px 0 0',
    color: '#fff8e7',
    fontSize: 17,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 18,
  },
  checkGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    marginTop: 18,
  },
  checkItem: {
    padding: 14,
    borderRadius: 16,
    background: cardBlack,
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#f5f0e6',
    fontWeight: 800,
    fontSize: 13,
    lineHeight: 1.45,
  },
  guardrailList: {
    display: 'grid',
    gap: 12,
    marginTop: 18,
  },
  guardrailItem: {
    padding: 16,
    borderRadius: 18,
    background: cardBlack,
    border: `1px solid ${softLine}`,
  },
  routeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 18,
  },
  routeLink: {
    display: 'grid',
    gap: 6,
    padding: 14,
    borderRadius: 16,
    background: cardBlack,
    border: `1px solid ${softLine}`,
    color: '#fff8e7',
    textDecoration: 'none',
    fontSize: 13,
  },
  doctrineCard: {
    display: 'grid',
    gap: 10,
    padding: 24,
    borderRadius: 24,
    background: deepBlack,
    border: `1px solid ${strongLine}`,
    color: '#fff8e7',
    lineHeight: 1.7,
  },
} satisfies Record<string, React.CSSProperties>