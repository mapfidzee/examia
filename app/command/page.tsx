'use client'

import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import CGICommandContinuityPanel from '@/components/cgi-command/CGICommandContinuityPanel'
import {
  formatCGIExecutivePosture,
  formatCGIEvidenceLanguage,
  formatCGISurvivabilityLanguage,
  formatCGIGovernanceSafeLanguage,
} from '@/lib/cgiExecutivePostureFormatter'

export default function CommandPage() {
  const commandPosture = formatCGIExecutivePosture('ELEVATED')
  const evidenceLanguage = formatCGIEvidenceLanguage(false, 'ELEVATED')
  const survivabilityLanguage = formatCGISurvivabilityLanguage('ELEVATED')
  const governanceSafeLanguage = formatCGIGovernanceSafeLanguage()

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
            <InfrastructureNav />

            <section style={styles.header}>
              <p style={styles.kicker}>TSINAXA CGI • COMMAND</p>

              <h1 style={styles.title}>Continuity Command Center</h1>

              <p style={styles.subtitle}>
                Executive command visibility for continuity condition,
                recovery credibility, structural memory, accountability,
                required evidence, survivability protection, and stabilization
                discipline.
              </p>
            </section>

            <section style={styles.commandPostureCard}>
              <p style={styles.sectionKicker}>Executive Command Posture</p>

              <h2 style={styles.commandPostureTitle}>
                {commandPosture.label}
              </h2>

              <p style={styles.commandHeadline}>
                {commandPosture.headline}
              </p>

              <p style={styles.bodyText}>{commandPosture.description}</p>

              <div style={styles.commandGrid}>
                <CommandSignal
                  title="Command Action"
                  body={commandPosture.actionLanguage}
                />

                <CommandSignal
                  title="Evidence Requirement"
                  body={evidenceLanguage}
                />

                <CommandSignal
                  title="Survivability Protection"
                  body={survivabilityLanguage}
                />

                <CommandSignal
                  title="Governance-Safe Meaning"
                  body={governanceSafeLanguage}
                />
              </div>
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
          </div>
        </main>
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function CommandSignal({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <article style={styles.commandSignal}>
      <p style={styles.principleKicker}>{title}</p>

      <p style={styles.commandSignalBody}>{body}</p>
    </article>
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
  commandPostureCard: {
    background: '#082f49',
    border: '1px solid #67e8f9',
    borderRadius: '24px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  commandPostureTitle: {
    color: '#a5f3fc',
    fontSize: 'clamp(30px, 5vw, 46px)',
    lineHeight: 1.05,
    margin: '10px 0',
    letterSpacing: '-0.04em',
  },
  commandHeadline: {
    color: '#f8fafc',
    fontSize: '22px',
    lineHeight: 1.45,
    margin: '0 0 12px',
    fontWeight: 900,
  },
  commandGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '14px',
    marginTop: '18px',
  },
  commandSignal: {
    background: '#020617',
    border: '1px solid #164e63',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '130px',
  },
  commandSignalBody: {
    color: '#e0f2fe',
    lineHeight: 1.55,
    margin: '10px 0 0',
    fontWeight: 800,
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