import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIExecutiveBriefing } from '@/lib/cgiExecutiveBriefingGenerator'
import {
  formatCGIExecutivePosture,
  formatCGIEvidenceLanguage,
  formatCGISurvivabilityLanguage,
  formatCGIGovernanceSafeLanguage,
} from '@/lib/cgiExecutivePostureFormatter'
import type { CGIRouteSynthesisPosture } from '@/lib/cgiCrossRouteContinuitySynthesisEngine'

type SiteContinuityProfile = {
  siteName: string
  region: string
  pressurePosture: CGIRouteSynthesisPosture
  trajectoryPosture: CGIRouteSynthesisPosture
  predictivePosture: CGIRouteSynthesisPosture
  recoveryPosture: CGIRouteSynthesisPosture
  reliabilityPosture: CGIRouteSynthesisPosture
  evidenceVerified: boolean
  accountabilityActive: boolean
  structuralMemoryVisible: boolean
}

const sites: SiteContinuityProfile[] = [
  {
    siteName: 'North Unit',
    region: 'Primary Operations',
    pressurePosture: 'ELEVATED',
    trajectoryPosture: 'ELEVATED',
    predictivePosture: 'ELEVATED',
    recoveryPosture: 'WATCHED',
    reliabilityPosture: 'ELEVATED',
    evidenceVerified: false,
    accountabilityActive: true,
    structuralMemoryVisible: true,
  },
  {
    siteName: 'South Unit',
    region: 'Secondary Operations',
    pressurePosture: 'WATCHED',
    trajectoryPosture: 'WATCHED',
    predictivePosture: 'WATCHED',
    recoveryPosture: 'WATCHED',
    reliabilityPosture: 'WATCHED',
    evidenceVerified: true,
    accountabilityActive: true,
    structuralMemoryVisible: false,
  },
  {
    siteName: 'East Unit',
    region: 'High Demand Operations',
    pressurePosture: 'CRITICAL',
    trajectoryPosture: 'ELEVATED',
    predictivePosture: 'ELEVATED',
    recoveryPosture: 'ELEVATED',
    reliabilityPosture: 'CRITICAL',
    evidenceVerified: false,
    accountabilityActive: true,
    structuralMemoryVisible: true,
  },
]

const postureWeight: Record<CGIRouteSynthesisPosture, number> = {
  STABLE: 1,
  WATCHED: 2,
  ELEVATED: 3,
  CRITICAL: 4,
}

function strongestSite(sitesToReview: SiteContinuityProfile[]) {
  return [...sitesToReview].sort((a, b) => {
    const aBrief = buildCGIExecutiveBriefing(a)
    const bBrief = buildCGIExecutiveBriefing(b)

    return (
      postureWeight[bBrief.synthesis.synthesisPosture] -
      postureWeight[aBrief.synthesis.synthesisPosture]
    )
  })[0]
}

export default function CrossSitePage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
    >
      <CGIGovernanceShell>
        <CrossSiteContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function CrossSiteContent() {
  const siteBriefings = sites.map((site) => ({
    site,
    briefing: buildCGIExecutiveBriefing(site),
  }))

  const dominantSite = strongestSite(sites)
  const dominantBriefing = buildCGIExecutiveBriefing(dominantSite)

  const executivePosture = formatCGIExecutivePosture(
    dominantBriefing.synthesis.synthesisPosture
  )

  const evidenceLanguage = formatCGIEvidenceLanguage(
    false,
    dominantBriefing.synthesis.synthesisPosture
  )

  const survivabilityLanguage = formatCGISurvivabilityLanguage(
    dominantBriefing.synthesis.synthesisPosture
  )

  const governanceLanguage = formatCGIGovernanceSafeLanguage()

  const criticalSites = siteBriefings.filter(
    ({ briefing }) => briefing.synthesis.synthesisPosture === 'CRITICAL'
  ).length

  const elevatedSites = siteBriefings.filter(
    ({ briefing }) => briefing.synthesis.synthesisPosture === 'ELEVATED'
  ).length

  const structuralMemorySites = sites.filter(
    (site) => site.structuralMemoryVisible
  ).length

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <InfrastructureNav />

        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • CROSS-SITE</p>

          <h1 style={styles.title}>Cross-Site Continuity Intelligence</h1>

          <p style={styles.subtitle}>
            Enterprise visibility for comparing continuity posture,
            survivability exposure, executive stabilization pressure, and
            structural memory concentration across operational sites.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Enterprise Continuity Reading</p>

            <h2 style={styles.heroTitle}>{executivePosture.label}</h2>

            <p style={styles.heroMeaning}>
              {dominantBriefing.executiveSummary}
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Dominant Site</p>

            <p style={styles.statusValue}>{dominantSite.siteName}</p>
          </div>
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Critical Sites"
            value={String(criticalSites)}
            body="Sites currently requiring direct executive continuity attention."
          />

          <SignalCard
            title="Elevated Sites"
            value={String(elevatedSites)}
            body="Sites where continuity exposure remains active and must stay under review."
          />

          <SignalCard
            title="Structural Memory Sites"
            value={String(structuralMemorySites)}
            body="Sites where prior instability remains relevant to current continuity interpretation."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Enterprise Action Posture</p>

          <h2 style={styles.cardTitle}>{executivePosture.headline}</h2>

          <p style={styles.bodyText}>{executivePosture.actionLanguage}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem title="Evidence" body={evidenceLanguage} />

            <PriorityItem
              title="Survivability"
              body={survivabilityLanguage}
            />

            <PriorityItem
              title="Governance Meaning"
              body={governanceLanguage}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Site Continuity Board</p>

          <h2 style={styles.cardTitle}>
            Continuity exposure must be compared across sites.
          </h2>

          <div style={styles.siteList}>
            {siteBriefings.map(({ site, briefing }) => (
              <article key={site.siteName} style={styles.siteCard}>
                <div>
                  <p style={styles.siteRegion}>{site.region}</p>

                  <h3 style={styles.siteTitle}>{site.siteName}</h3>

                  <p style={styles.siteMeaning}>
                    {briefing.executiveSummary}
                  </p>
                </div>

                <div style={styles.siteStatus}>
                  <p style={styles.statusLabel}>Posture</p>

                  <p style={styles.sitePosture}>
                    {briefing.synthesis.synthesisPosture}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Survivability Concentration">
            Cross-site survivability becomes a leadership issue when the same
            pressure pattern appears across multiple sites or when one site
            carries disproportionate continuity exposure.
          </Panel>

          <Panel title="Cross-Site Governance Meaning">
            This view does not compare people or assign blame. It compares
            continuity exposure, structural memory, stabilization evidence, and
            survivability pressure across operational environments.
          </Panel>
        </section>
      </div>
    </main>
  )
}

function SignalCard({
  title,
  value,
  body,
}: {
  title: string
  value: string
  body: string
}) {
  return (
    <article style={styles.signalCard}>
      <p style={styles.panelKicker}>{title}</p>

      <h3 style={styles.signalValue}>{value}</h3>

      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function PriorityItem({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <article style={styles.priorityItem}>
      <p style={styles.panelKicker}>{title}</p>

      <p style={styles.priorityBody}>{body}</p>
    </article>
  )
}

function Panel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section style={styles.panel}>
      <p style={styles.panelKicker}>{title}</p>

      <div style={styles.panelBody}>{children}</div>
    </section>
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
    fontSize: 'clamp(34px, 5vw, 52px)',
    lineHeight: 1.05,
    margin: '10px 0',
  },
  subtitle: {
    color: '#cbd5e1',
    maxWidth: '820px',
    lineHeight: 1.65,
    fontSize: '16px',
    margin: 0,
  },
  heroCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.35fr) minmax(240px, 0.65fr)',
    gap: '16px',
    background: '#020617',
    border: '1px solid #67e8f9',
    borderRadius: '26px',
    padding: '24px',
    marginBottom: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.28)',
  },
  sectionKicker: {
    color: '#94a3b8',
    fontWeight: 900,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,
    fontSize: '12px',
  },
  heroTitle: {
    color: '#a5f3fc',
    fontSize: 'clamp(34px, 5vw, 54px)',
    lineHeight: 1,
    margin: '10px 0 14px',
    letterSpacing: '-0.04em',
  },
  heroMeaning: {
    color: '#e0f2fe',
    lineHeight: 1.65,
    margin: 0,
    maxWidth: '760px',
    fontSize: '16px',
  },
  statusBox: {
    background: '#083344',
    border: '1px solid #22d3ee',
    borderRadius: '20px',
    padding: '18px',
    alignSelf: 'stretch',
  },
  statusLabel: {
    color: '#67e8f9',
    fontWeight: 900,
    margin: '0 0 10px',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
  },
  statusValue: {
    color: '#cffafe',
    fontSize: '30px',
    lineHeight: 1.1,
    margin: 0,
    fontWeight: 900,
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
    marginBottom: '16px',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  signalCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
    boxSizing: 'border-box',
  },
  signalValue: {
    color: '#f8fafc',
    fontSize: '30px',
    lineHeight: 1.15,
    margin: '10px 0',
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
    maxWidth: '880px',
  },
  priorityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  priorityItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '14px',
  },
  priorityBody: {
    color: '#e2e8f0',
    lineHeight: 1.55,
    margin: '10px 0 0',
    fontWeight: 700,
  },
  siteList: {
    display: 'grid',
    gap: '12px',
    marginTop: '16px',
  },
  siteCard: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(160px, 0.25fr)',
    gap: '16px',
    alignItems: 'start',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },
  siteRegion: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 800,
    margin: 0,
  },
  siteTitle: {
    color: '#f8fafc',
    fontSize: '24px',
    margin: '8px 0',
  },
  siteMeaning: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    margin: 0,
  },
  siteStatus: {
    background: '#083344',
    border: '1px solid #164e63',
    borderRadius: '16px',
    padding: '14px',
  },
  sitePosture: {
    color: '#cffafe',
    fontSize: '20px',
    lineHeight: 1.1,
    margin: 0,
    fontWeight: 900,
  },
  panel: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
    minHeight: '150px',
    boxSizing: 'border-box',
  },
  panelKicker: {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  panelBody: {
    color: '#cbd5e1',
    fontSize: '14px',
    lineHeight: 1.6,
    marginTop: '10px',
  },
}