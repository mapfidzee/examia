'use client'

import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import CGICommandContinuityPanel from '@/components/cgi-command/CGICommandContinuityPanel'

export default function CommandPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
    >
      <CGIGovernanceShell>
        <main style={styles.page}>
          <div style={styles.container}>
            <section style={styles.header}>
              <p style={styles.kicker}>TSINAXA CGI • COMMAND</p>

              <h1 style={styles.title}>Continuity Command Center</h1>

              <p style={styles.subtitle}>
                Executive command visibility for continuity condition,
                recovery credibility, structural memory, accountability,
                required evidence, and stabilization discipline.
              </p>
            </section>

            <CGICommandContinuityPanel />

            <section style={styles.card}>
              <p style={styles.sectionKicker}>Command Doctrine</p>

              <h2 style={styles.cardTitle}>
                CGI does not govern events. It governs continuity credibility.
              </h2>

              <p style={styles.bodyText}>
                The command center must help leadership understand whether
                visible instability is being contained, whether recovery is
                truly holding, and whether the institution can still stabilize
                itself reliably under pressure.
              </p>
            </section>

            <section style={styles.grid}>
              <CommandPrinciple
                title="Dominant Truth"
                body="Executives need compressed operational truth before they review detail."
              />

              <CommandPrinciple
                title="Recovery Discipline"
                body="Visible recovery must not be treated as durable stabilization until evidence proves it held."
              />

              <CommandPrinciple
                title="Structural Memory"
                body="Repeated instability must be remembered structurally, not dismissed as isolated noise."
              />

              <CommandPrinciple
                title="Accountability"
                body="Continuity risk must become owned, evidenced, and time-bound responsibility."
              />
            </section>

            <section style={styles.card}>
              <p style={styles.sectionKicker}>Legacy Preservation</p>

              <h2 style={styles.cardTitle}>
                Previous command intelligence is preserved.
              </h2>

              <p style={styles.bodyText}>
                The earlier command center was backed up as{' '}
                <strong>app/command/page.legacy.tsx</strong>. Valuable legacy
                logic can now be reintroduced carefully as smaller governed
                components instead of keeping one oversized command file.
              </p>
            </section>
          </div>
        </main>
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function CommandPrinciple({
  title,
  body,
}: {
  title: string
  body: ReactNode
}) {
  return (
    <article style={styles.principleCard}>
      <p style={styles.principleKicker}>CGI Principle</p>
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
  sectionKicker: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '12px',
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
    maxWidth: '860px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '16px',
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
}