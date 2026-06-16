'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'

type ActionCue = {
  code: string
  category: string
  severity: string
  meaning: string
  risk: string
  actionCue: string
  escalation: string
  governanceNote: string
}

const actionCues: ActionCue[] = [
  {
    code: 'HIGH_ROUTING_PRESSURE',
    category: 'Routing',
    severity: 'High',
    meaning:
      'Visible needs are entering the system faster than the current routing pathway can smoothly absorb.',
    risk:
      'Delayed coordination, unresolved cases, responder overload, and rising stabilization backlog.',
    actionCue:
      'Review routing load, rebalance response pathways, and prioritize cases with continuity risk.',
    escalation:
      'Escalate when high routing pressure repeats across more than one monitoring window or affects critical continuity pathways.',
    governanceNote:
      'Interpret as system pressure, not individual delay or responder failure.',
  },
  {
    code: 'HIGH_BOTTLENECK_PRESSURE',
    category: 'Bottlenecks',
    severity: 'High',
    meaning:
      'Coordination points are repeatedly slowing or blocking stabilization response.',
    risk:
      'Cases may remain stuck between intake, routing, intervention, outcome review, or recovery monitoring.',
    actionCue:
      'Identify the blocked pathway, inspect handoff friction, and assign a coordination repair action.',
    escalation:
      'Escalate when bottlenecks affect urgent cases, repeated handoffs, or cross-department coordination.',
    governanceNote:
      'Focus on blocked process points rather than blaming specific people or departments.',
  },
  {
    code: 'FRAGMENTED_CONTINUITY',
    category: 'Trajectory',
    severity: 'Moderate-High',
    meaning:
      'The stabilization pathway is moving unevenly, with weak continuity between response stages.',
    risk:
      'Cases may appear active but fail to progress toward stable recovery or resolution.',
    actionCue:
      'Review handoff quality, follow-up visibility, unresolved outcomes, and recovery ownership.',
    escalation:
      'Escalate when fragmented continuity appears across multiple cases or high-risk pathways.',
    governanceNote:
      'Treat fragmentation as a continuity design issue, not a person-level performance label.',
  },
  {
    code: 'RECOVERY_PRESSURE_VISIBLE',
    category: 'Recovery',
    severity: 'Moderate',
    meaning:
      'The system is carrying unresolved recovery burden after intervention activity.',
    risk:
      'Interventions may be occurring without enough recovery confirmation, continuity repair, or closure discipline.',
    actionCue:
      'Review unresolved recovery signals and confirm whether cases require follow-up, escalation, or closure.',
    escalation:
      'Escalate when recovery pressure increases while outcomes remain unresolved or delayed.',
    governanceNote:
      'Recovery pressure should guide support and continuity review, not punishment.',
  },
  {
    code: 'MODERATE_FORECAST_PRESSURE',
    category: 'Predictive',
    severity: 'Moderate',
    meaning:
      'Current stabilization patterns suggest pressure may increase if capacity, routing, or coordination does not adjust.',
    risk:
      'A manageable pressure pattern may become a high-pressure stabilization burden.',
    actionCue:
      'Prepare response capacity, review likely bottlenecks, and watch early continuity signals.',
    escalation:
      'Escalate when forecast pressure combines with high routing pressure or visible bottlenecks.',
    governanceNote:
      'Predictive cues are early warnings for preparation, not certainty claims.',
  },
  {
    code: 'CRITICAL_COMMAND_STATUS',
    category: 'Command',
    severity: 'Critical',
    meaning:
      'Multiple stabilization signals indicate serious pressure requiring leadership-level review.',
    risk:
      'The system may lose coordination reliability if leadership does not prioritize stabilization response.',
    actionCue:
      'Activate command review, prioritize urgent pathways, inspect bottlenecks, and assign response ownership.',
    escalation:
      'Escalate immediately when critical command status aligns with high pressure, recovery burden, and audit-confirmed traceability.',
    governanceNote:
      'Command status supports leadership response; it must not be used for blame, surveillance, or individual punishment.',
  },
  {
    code: 'STRONG_AUDIT_INTEGRITY',
    category: 'Audit',
    severity: 'Positive',
    meaning:
      'The system has enough traceability to support trusted interpretation of stabilization signals.',
    risk:
      'Low immediate governance risk, but pressure signals must still be interpreted carefully.',
    actionCue:
      'Use audit strength to support structured response decisions while preserving safe interpretation rules.',
    escalation:
      'Escalate only if audit strength declines, records become incomplete, or signal traceability weakens.',
    governanceNote:
      'Strong audit integrity makes signals usable; it does not make them punitive.',
  },
  {
    code: 'GOVERNANCE_ACTIVE',
    category: 'Governance',
    severity: 'Stable',
    meaning:
      'Safeguards, interpretation rules, and ethical boundaries are active within the stabilization system.',
    risk:
      'Governance drift may occur if new domains or routes introduce unclear meanings or unsafe language.',
    actionCue:
      'Keep interpretation structural, traceable, non-punitive, and aligned with stabilization response.',
    escalation:
      'Escalate when new pages, domains, or workflows weaken governance boundaries.',
    governanceNote:
      'Governance is the protection layer that keeps CGI safe for institutional use.',
  },
]

const registryRules = [
  'Every status must map to meaning, risk, action cue, escalation threshold, and governance note.',
  'Action cues must support stabilization response, not blame assignment.',
  'Predictive cues must be preparation signals, not certainty claims.',
  'Critical status requires leadership review, not person-level punishment.',
  'Audit strength supports signal trust, not punitive interpretation.',
  'Healthcare use remains operational, coordination-focused, and non-clinical.',
]

export default function ActionCuesPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <main style={styles.page}>
          <div style={styles.container}>
            <section style={styles.hero}>
              <div>
                <p style={styles.kicker}>TSINAXA CGI • ACTION CUES</p>
                <h1 style={styles.title}>Action Cues</h1>
                <p style={styles.subtitle}>
                  Govern how pressure, bottlenecks, continuity, recovery,
                  command, audit, and governance signals become safe response
                  guidance.
                </p>
              </div>

              <div style={styles.statusBox}>
                <p style={styles.statusLabel}>INTERPRETATION POSTURE</p>
                <p style={styles.statusValue}>CONTROLLED</p>
                <p style={styles.statusMeaning}>
                  Action cues guide coordination response. They do not diagnose,
                  blame, rank, punish, or replace leadership judgment.
                </p>
              </div>
            </section>

            <section style={styles.commandDeck}>
              <div style={styles.primaryCard}>
                <p style={styles.sectionKicker}>Executive Action Cue Question</p>
                <h2 style={styles.commandTitle}>
                  What should leadership do when a continuity signal becomes
                  visible?
                </h2>
                <p style={styles.bodyText}>
                  Action cues convert visible instability into governed response
                  guidance: meaning, risk, action, escalation, and safe
                  interpretation.
                </p>

                <div style={styles.metaGrid}>
                  <MiniStat label="Registry" value="CONTROLLED" />
                  <MiniStat label="Use" value="RESPONSE GUIDANCE" />
                  <MiniStat label="Boundary" value="NON-PUNITIVE" />
                  <MiniStat label="Role" value="OPERATIONAL" />
                </div>
              </div>

              <div style={styles.warningCard}>
                <p style={styles.sectionKicker}>Governance Boundary</p>
                <h2 style={styles.warningTitle}>Coordination, not diagnosis.</h2>
                <p style={styles.bodyText}>
                  Action cues support routing repair, recovery monitoring,
                  continuity review, and executive oversight. They must never
                  become surveillance, punishment, or person-level performance
                  labels.
                </p>
              </div>
            </section>

            <section style={styles.memoryPanel}>
              <p style={styles.sectionKicker}>Strategic Function</p>
              <h2 style={styles.panelTitle}>
                From signal visibility to governed response.
              </h2>
              <p style={styles.bodyText}>
                CGI preserves safe interpretation so leaders know what to
                review, what to repair, when to escalate, and what evidence must
                remain attached.
              </p>
            </section>

            <section style={styles.summaryGrid}>
              {actionCues.map((cue) => (
                <article key={cue.code} style={styles.summaryCard}>
                  <div style={styles.cardTop}>
                    <div>
                      <p style={styles.metricLabel}>{cue.category}</p>
                      <h3 style={styles.cardValue}>{cue.code}</h3>
                    </div>
                    <span style={severityBadge(cue.severity)}>
                      {cue.severity}
                    </span>
                  </div>
                  <p style={styles.panelBody}>{cue.actionCue}</p>
                </article>
              ))}
            </section>

            <details style={styles.evidencePanel}>
              <summary style={styles.evidenceSummary}>
                <span>
                  <span style={styles.sectionKicker}>Signal Registry</span>
                  <strong style={styles.evidenceTitle}>
                    Full signal interpretation
                  </strong>
                </span>
                <span style={styles.evidenceToggle}>Expand Cues</span>
              </summary>

              <div style={styles.registryGrid}>
                {actionCues.map((cue) => (
                  <article key={cue.code} style={styles.cueCard}>
                    <div style={styles.cardTop}>
                      <div>
                        <p style={styles.metricLabel}>{cue.category}</p>
                        <h3 style={styles.cardValue}>{cue.code}</h3>
                      </div>
                      <span style={severityBadge(cue.severity)}>
                        {cue.severity}
                      </span>
                    </div>

                    <div style={styles.cueRows}>
                      <CueRow label="Meaning" value={cue.meaning} />
                      <CueRow label="Risk" value={cue.risk} />
                      <CueRow label="Action Cue" value={cue.actionCue} />
                      <CueRow label="Escalation" value={cue.escalation} />
                      <CueRow
                        label="Governance Note"
                        value={cue.governanceNote}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </details>

            <section style={styles.rulesPanel}>
              <div>
                <p style={styles.sectionKicker}>Registry Control Rules</p>
                <h2 style={styles.panelTitle}>Prevent interpretation drift.</h2>
              </div>

              <div style={styles.rulesGrid}>
                {registryRules.map((rule) => (
                  <div key={rule} style={styles.ruleItem}>
                    {rule}
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.reminderPanel}>
              <div>
                <p style={styles.sectionKicker}>Governance Reminder</p>
                <h2 style={styles.panelTitle}>
                  Structural visibility without blame.
                </h2>
                <p style={styles.bodyText}>
                  Action cues preserve safe response movement without assigning
                  blame or creating surveillance.
                </p>
              </div>

              <div style={styles.linkRow}>
                <Link href="/case-flow" style={styles.linkButton}>
                  View Case Flow
                </Link>
                <Link href="/command" style={styles.secondaryButton}>
                  View Command
                </Link>
              </div>
            </section>

            <section style={styles.doctrineCard}>
              <strong>ACTION CUE DOCTRINE</strong>
              <span>
                Action cues are not diagnosis, blame, prediction certainty, or
                punishment. They are governed response guidance that preserves
                structural visibility, safe escalation, continuity repair, and
                executive accountability.
              </span>
            </section>
          </div>
        </main>
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
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

function CueRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.cueRow}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.cueText}>{value}</p>
    </div>
  )
}

function severityBadge(severity: string): CSSProperties {
  const base: CSSProperties = {
    borderRadius: 999,
    padding: '7px 10px',
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.11em',
    textTransform: 'uppercase',
    border: `1px solid ${softLine}`,
    background: 'rgba(214,178,94,0.1)',
    color: gold,
    whiteSpace: 'nowrap',
  }

  if (severity === 'Critical') {
    return {
      ...base,
      border: '1px solid rgba(214,178,94,0.44)',
      background: 'rgba(214,178,94,0.18)',
      color: '#fff8e7',
    }
  }

  if (severity === 'Positive' || severity === 'Stable') {
    return {
      ...base,
      background: 'rgba(255,255,255,0.07)',
      color: '#f5f0e6',
    }
  }

  return base
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
    gap: 24,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.75fr)',
    gap: 24,
    padding: 32,
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
    maxWidth: 880,
    margin: '18px 0 0',
    color: '#cfc7b5',
    fontSize: 17,
    lineHeight: 1.8,
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
    gap: 24,
  },
  primaryCard: {
    padding: 30,
    borderRadius: 28,
    background: cardBlack,
    border: `1px solid ${softLine}`,
  },
  warningCard: {
    padding: 30,
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
    margin: '14px 0',
    fontSize: 'clamp(1.8rem, 3vw, 3.2rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  warningTitle: {
    margin: '14px 0',
    fontSize: 28,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
  },
  bodyText: {
    margin: '8px 0 0',
    color: '#cfc7b5',
    lineHeight: 1.7,
    fontSize: 14,
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
    overflowWrap: 'anywhere',
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
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 14,
  },
  summaryCard: {
    padding: 18,
    borderRadius: 20,
    background: cardBlack,
    border: `1px solid ${softLine}`,
    minHeight: 150,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  cardValue: {
    margin: '10px 0 0',
    color: '#fff8e7',
    fontSize: 18,
    lineHeight: 1.18,
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
  },
  panelBody: {
    marginTop: 12,
    color: '#cfc7b5',
    fontSize: 13,
    lineHeight: 1.6,
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
  registryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
    marginTop: 22,
  },
  cueCard: {
    background: deepBlack,
    border: `1px solid ${softLine}`,
    borderRadius: 22,
    padding: 20,
  },
  cueRows: {
    display: 'grid',
    gap: 10,
    marginTop: 16,
  },
  cueRow: {
    padding: 14,
    borderRadius: 16,
    background: cardBlack,
    border: '1px solid rgba(255,255,255,0.08)',
  },
  cueText: {
    margin: '8px 0 0',
    color: '#cfc7b5',
    lineHeight: 1.55,
    fontSize: 13,
  },
  rulesPanel: {
    padding: 28,
    borderRadius: 28,
    background: deepBlack,
    border: `1px solid ${softLine}`,
  },
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
    marginTop: 18,
  },
  ruleItem: {
    padding: 14,
    borderRadius: 16,
    background: cardBlack,
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#cfc7b5',
    lineHeight: 1.6,
    fontSize: 13,
  },
  reminderPanel: {
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