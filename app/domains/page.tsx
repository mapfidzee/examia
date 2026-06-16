import Link from 'next/link'
import type { CSSProperties } from 'react'

import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'

type Domain = {
  number: string
  title: string
  status: string
  purpose: string
  intake: string
  routing: string
  intervention: string
  recovery: string
}

const domains: Domain[] = [
  {
    number: '01',
    title: 'Healthcare Coordination',
    status: 'PRIMARY DEPLOYMENT DOMAIN',
    purpose:
      'Supports healthcare coordination, continuity protection, response routing, recovery monitoring, and operational stabilization across pressured care environments.',
    intake:
      'Visible operational need, coordination delay, handoff gap, discharge pressure, support delay, continuity disruption, or escalation concern.',
    routing:
      'Route need to the appropriate clinical, operational, administrative, support, or escalation pathway without assigning blame to individuals.',
    intervention:
      'Structured coordination action, escalation review, handoff support, continuity repair, resource coordination, or recovery pathway activation.',
    recovery:
      'Track whether the care coordination pathway has stabilized, remains fragile, or requires continued leadership attention.',
  },
  {
    number: '02',
    title: 'Education Stabilization',
    status: 'SECONDARY DEPLOYMENT DOMAIN',
    purpose:
      'Supports learning continuity, beneficiary support, intervention routing, and recovery tracking when educational progress is disrupted.',
    intake:
      'Learning need, continuity disruption, preparation gap, support request, or academic recovery concern.',
    routing:
      'Route beneficiary need to the appropriate responder or support pathway.',
    intervention:
      'Governed support session, structured explanation, file exchange, voice support, or live intervention.',
    recovery:
      'Track whether learning continuity has improved, remained fragile, or requires escalation.',
  },
  {
    number: '03',
    title: 'NGO Continuity Operations',
    status: 'EXPANSION DOMAIN',
    purpose:
      'Supports beneficiary intake, responder coordination, field response visibility, and program continuity across NGO operations.',
    intake:
      'Beneficiary need, field disruption, service access gap, program continuity risk, or urgent support request.',
    routing:
      'Route case to field worker, coordinator, partner, resource pathway, or support program.',
    intervention:
      'Governed assistance action, referral, field support, resource coordination, or follow-up pathway.',
    recovery:
      'Track whether beneficiary support has stabilized or requires continued coordination.',
  },
  {
    number: '04',
    title: 'Public Sector Response',
    status: 'EXPANSION DOMAIN',
    purpose:
      'Supports ministries, departments, councils, and public institutions that need governed coordination across visible service disruptions.',
    intake:
      'Public service need, departmental delay, coordination gap, response request, or continuity concern.',
    routing:
      'Route need to department, unit, officer, program, or escalation pathway.',
    intervention:
      'Structured response action, departmental coordination, service recovery, or escalation review.',
    recovery:
      'Track whether the public service pathway has resumed stable function.',
  },
  {
    number: '05',
    title: 'Humanitarian Routing',
    status: 'EXPANSION DOMAIN',
    purpose:
      'Supports urgent need intake, case prioritization, responder routing, and continuity monitoring across humanitarian response environments.',
    intake:
      'Urgent beneficiary need, displacement-related need, access barrier, resource request, or field response concern.',
    routing:
      'Route case to responder, partner organization, resource hub, field team, or escalation channel.',
    intervention:
      'Aid coordination, referral, emergency support pathway, field response, or follow-up action.',
    recovery:
      'Track whether immediate stabilization occurred and whether continued support is required.',
  },
  {
    number: '06',
    title: 'Workforce Recovery',
    status: 'EXPANSION DOMAIN',
    purpose:
      'Supports workforce disruption response, operational continuity, recovery monitoring, and stabilization coordination.',
    intake:
      'Workforce disruption, coverage gap, role strain, continuity risk, support need, or operational pressure signal.',
    routing:
      'Route disruption to leadership, staffing support, coordination team, recovery pathway, or operational response channel.',
    intervention:
      'Coverage response, workload redistribution, support activation, continuity repair, or stabilization review.',
    recovery:
      'Track whether workforce continuity is recovering or remaining structurally fragile.',
  },
]

const universalSpine = [
  'Need Intake',
  'Case Governance',
  'Routing Intelligence',
  'Intervention Governance',
  'Outcome Visibility',
  'Recovery Intelligence',
  'Trajectory Monitoring',
  'Pressure Visibility',
  'Bottleneck Detection',
  'Command Oversight',
  'Governance Audit',
]

const safeguards = [
  'Healthcare is the primary deployment domain, but CGI remains domain-adaptable continuity governance infrastructure.',
  'CGI supports operational coordination and continuity visibility; it does not replace clinical judgment.',
  'No domain may introduce blame-based interpretation.',
  'No domain may convert structural signals into person-level punishment.',
  'Every domain must preserve traceability, recovery logic, and governance-safe action cues.',
  'Domain expansion must strengthen stabilization response, not create dashboard sprawl.',
]

export default function DomainsPage() {
  return (
    <CGIGovernanceShell>
      <main style={styles.page}>
        <section style={styles.container}>
          <header style={styles.hero}>
            <div>
              <p style={styles.kicker}>TSINAXA CGI • DOMAINS</p>
              <h1 style={styles.title}>Domains</h1>
              <p style={styles.subtitle}>
                Healthcare-first continuity governance infrastructure.
              </p>
              <p style={styles.bodyText}>
                TSINAXA CGI begins with healthcare coordination because care
                systems expose continuity pressure clearly. The same governance
                spine may support other domains only when intake, routing,
                intervention, recovery, command, and audit remain traceable.
              </p>
            </div>

            <div style={styles.statusBox}>
              <p style={styles.statusLabel}>DOMAIN POSTURE</p>
              <p style={styles.statusValue}>CONTROLLED</p>
              <p style={styles.statusMeaning}>
                Healthcare is primary. Expansion is allowed only when the same
                continuity governance spine remains safe, traceable, and
                non-punitive.
              </p>
            </div>
          </header>

          <section style={styles.commandDeck}>
            <div style={styles.primaryCard}>
              <p style={styles.sectionKicker}>Infrastructure Question</p>
              <h2 style={styles.commandTitle}>
                Can a new domain use the same continuity governance spine?
              </h2>
              <p style={styles.bodyText}>
                A domain belongs only when visible need can move through
                governed intake, case ownership, routing, intervention, outcome
                visibility, recovery intelligence, command oversight, and audit
                reconstruction.
              </p>

              <div style={styles.metaGrid}>
                <MiniStat label="Primary Domain" value="HEALTHCARE" />
                <MiniStat label="Core Function" value="CONTINUITY RESPONSE" />
                <MiniStat label="Governance" value="TRACEABLE" />
                <MiniStat label="Expansion" value="CONTROLLED" />
              </div>
            </div>

            <div style={styles.warningCard}>
              <p style={styles.sectionKicker}>Identity Lock</p>
              <h2 style={styles.warningTitle}>Operational, not clinical.</h2>
              <p style={styles.bodyText}>
                CGI supports coordination, continuity, routing, recovery, and
                governance visibility. It does not diagnose, prescribe, replace
                clinical judgment, or create person-level punishment.
              </p>
            </div>
          </section>

          <section style={styles.memoryPanel}>
            <p style={styles.sectionKicker}>Universal Spine</p>
            <h2 style={styles.panelTitle}>
              Same governance logic across every approved domain.
            </h2>

            <div style={styles.spineGrid}>
              {universalSpine.map((step, index) => (
                <div key={step} style={styles.spineItem}>
                  <span style={styles.spineNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.commandDeck}>
            <div style={styles.primaryCard}>
              <p style={styles.sectionKicker}>Domain Admission Rule</p>
              <h2 style={styles.panelTitle}>
                Expansion must strengthen continuity governance.
              </h2>
              <p style={styles.bodyText}>
                A new domain should only be admitted when it can clearly use the
                same stabilization pathway without creating dashboard sprawl,
                blame logic, surveillance logic, or unsafe interpretation.
              </p>
            </div>

            <div style={styles.warningCard}>
              <p style={styles.sectionKicker}>Governance Safeguards</p>
              <h2 style={styles.panelTitle}>Expansion must stay safe.</h2>
              <div style={styles.safeguardList}>
                {safeguards.map((rule) => (
                  <div key={rule} style={styles.safeguardItem}>
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <details style={styles.evidencePanel}>
            <summary style={styles.evidenceSummary}>
              <span>
                <span style={styles.sectionKicker}>Domain Models</span>
                <strong style={styles.evidenceTitle}>
                  Healthcare, education, NGO, public sector, humanitarian, and
                  workforce continuity models
                </strong>
              </span>
              <span style={styles.evidenceToggle}>Expand Domains</span>
            </summary>

            <div style={styles.domainGrid}>
              {domains.map((domain) => (
                <article key={domain.number} style={styles.domainCard}>
                  <div style={styles.domainTop}>
                    <span style={styles.domainNumber}>{domain.number}</span>
                    <span style={styles.domainBadge}>{domain.status}</span>
                  </div>

                  <h3 style={styles.domainTitle}>{domain.title}</h3>
                  <p style={styles.panelBody}>{domain.purpose}</p>

                  <div style={styles.domainRows}>
                    <DomainRow label="Intake Signal" value={domain.intake} />
                    <DomainRow label="Routing Logic" value={domain.routing} />
                    <DomainRow
                      label="Intervention Pathway"
                      value={domain.intervention}
                    />
                    <DomainRow label="Recovery Signal" value={domain.recovery} />
                  </div>
                </article>
              ))}
            </div>
          </details>

          <section style={styles.nextPanel}>
            <div>
              <p style={styles.sectionKicker}>Infrastructure Continuity</p>
              <h2 style={styles.panelTitle}>
                Domain expansion follows locked CGI governance.
              </h2>
              <p style={styles.bodyText}>
                Action Cues, Command, System, and Audit already preserve the
                interpretation boundary. Domain expansion must use those locked
                surfaces rather than creating new intelligence.
              </p>
            </div>

            <div style={styles.linkRow}>
              <Link href="/system" style={styles.linkButton}>
                View System
              </Link>
              <Link href="/command" style={styles.secondaryButton}>
                View Command
              </Link>
            </div>
          </section>

          <section style={styles.doctrineCard}>
            <strong>DOMAIN DOCTRINE</strong>
            <span>
              Domains do not create new engines. Domains are approved only when
              they can use the same continuity governance spine: visible need,
              governed routing, stabilization response, recovery monitoring,
              command oversight, audit traceability, and non-punitive
              interpretation.
            </span>
          </section>
        </section>
      </main>
    </CGIGovernanceShell>
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

function DomainRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.domainRow}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.panelBody}>{value}</p>
    </div>
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
    lineHeight: 1.7,
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
  sectionKicker: {
    margin: 0,
    color: mutedGold,
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
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
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 24,
  },
  miniStat: {
    padding: 14,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  metricLabel: {
    margin: 0,
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  miniValue: {
    margin: '8px 0 0',
    color: '#fff8e7',
    fontSize: 13,
    fontWeight: 850,
    lineHeight: 1.45,
  },
  memoryPanel: {
    padding: 28,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(214,178,94,0.13), rgba(255,255,255,0.035))',
    border: `1px solid ${strongLine}`,
  },
  panelTitle: {
    margin: '12px 0 0',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
  },
  spineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
  },
  spineItem: {
    display: 'grid',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    background: cardBlack,
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff8e7',
    fontSize: 13,
  },
  spineNumber: {
    color: gold,
    fontWeight: 950,
    fontSize: 11,
  },
  safeguardList: {
    display: 'grid',
    gap: 10,
    marginTop: 16,
  },
  safeguardItem: {
    padding: 13,
    borderRadius: 16,
    background: cardBlack,
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#cfc7b5',
    lineHeight: 1.55,
    fontSize: 13,
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
  domainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
    marginTop: 22,
  },
  domainCard: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: 22,
    padding: 20,
  },
  domainTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  domainNumber: {
    width: 36,
    height: 36,
    borderRadius: 999,
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(214,178,94,0.12)',
    border: `1px solid ${softLine}`,
    color: gold,
    fontWeight: 950,
  },
  domainBadge: {
    borderRadius: 999,
    padding: '7px 10px',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.11em',
    textTransform: 'uppercase',
    border: `1px solid ${softLine}`,
    background: 'rgba(214,178,94,0.1)',
    color: gold,
  },
  domainTitle: {
    margin: '16px 0 0',
    color: '#fff8e7',
    fontSize: 24,
    lineHeight: 1.1,
  },
  panelBody: {
    marginTop: 10,
    color: '#cfc7b5',
    fontSize: 13,
    lineHeight: 1.6,
  },
  domainRows: {
    display: 'grid',
    gap: 10,
    marginTop: 16,
  },
  domainRow: {
    padding: 14,
    borderRadius: 16,
    background: cardBlack,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  nextPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 24,
    alignItems: 'center',
    padding: 28,
    borderRadius: 28,
    background: panelBlack,
    border: `1px solid ${strongLine}`,
  },
  linkRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  linkButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    padding: '12px 16px',
    background: gold,
    color: '#090909',
    fontWeight: 950,
    textDecoration: 'none',
    fontSize: 13,
  },
  secondaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    padding: '12px 16px',
    background: 'rgba(214,178,94,0.12)',
    border: `1px solid ${softLine}`,
    color: '#fff8e7',
    fontWeight: 950,
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
}