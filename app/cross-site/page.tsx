'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import InfrastructureNav from '@/components/InfrastructureNav'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIDemoScenario } from '@/lib/cgiDemoScenarioEngine'
import { buildCGIExecutiveBriefing } from '@/lib/cgiExecutiveBriefingGenerator'
import {
  formatCGIExecutivePosture,
  formatCGIEvidenceLanguage,
  formatCGISurvivabilityLanguage,
  formatCGIGovernanceSafeLanguage,
} from '@/lib/cgiExecutivePostureFormatter'
import {
  loadCGISiteContinuityProfiles,
  saveCGISiteContinuityProfile,
} from '@/lib/cgiPersistenceEngine'
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
  continuityFinding: string
  sharedDependency: string
  recoveryMeaning: string
}

type PersistedSiteContinuityProfile = Record<string, any>

type CrossSitePattern = {
  patternName: string
  patternType: string
  affectedSites: string[]
  dominantSite: string
  sharedDependency: string
  enterpriseExposure: string
  recoveryPattern: string
  commandMeaning: string
  coordinationMeaning: string
  executiveMeaning: string
  nextGovernedDestination: string
  evidenceStandard: string
}

type CrossSiteDecision = {
  chainPosition: string
  crossSitePattern: string
  crossSiteReason: string
  nextGovernedDestination: string
  executiveReviewRequired: boolean
  auditRequired: boolean
  continuityHistoryRequired: boolean
  evidenceStandard: string
}

const sites: SiteContinuityProfile[] = [
  {
    siteName: 'North Operations Site',
    region: 'Primary Operations',
    pressurePosture: 'ELEVATED',
    trajectoryPosture: 'WATCHED',
    predictivePosture: 'ELEVATED',
    recoveryPosture: 'WATCHED',
    reliabilityPosture: 'ELEVATED',
    evidenceVerified: true,
    accountabilityActive: true,
    structuralMemoryVisible: true,
    continuityFinding:
      'Fuel availability has been restored, but continuity confidence remains under observation.',
    sharedDependency: 'Shared regional fuel supplier',
    recoveryMeaning:
      'North is stabilizing, but recovery confidence still depends on whether supplier exposure is resolved.',
  },
  {
    siteName: 'South Operations Site',
    region: 'Secondary Operations',
    pressurePosture: 'ELEVATED',
    trajectoryPosture: 'ELEVATED',
    predictivePosture: 'ELEVATED',
    recoveryPosture: 'WATCHED',
    reliabilityPosture: 'ELEVATED',
    evidenceVerified: false,
    accountabilityActive: true,
    structuralMemoryVisible: true,
    continuityFinding:
      'Routing delay exposed dependence on the same supplier chain that affected North.',
    sharedDependency: 'Shared regional fuel supplier',
    recoveryMeaning:
      'South appears partially recovered, but evidence remains weaker than the operational claim.',
  },
  {
    siteName: 'East Operations Site',
    region: 'High Demand Operations',
    pressurePosture: 'CRITICAL',
    trajectoryPosture: 'ELEVATED',
    predictivePosture: 'ELEVATED',
    recoveryPosture: 'ELEVATED',
    reliabilityPosture: 'CRITICAL',
    evidenceVerified: false,
    accountabilityActive: true,
    structuralMemoryVisible: true,
    continuityFinding:
      'Recurring fuel delays continue to threaten operational continuity and regional reliability.',
    sharedDependency: 'Shared regional fuel supplier',
    recoveryMeaning:
      'East remains the dominant continuity exposure because recurrence signals are still visible.',
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

function buildCrossSitePattern(
  siteBriefings: {
    site: SiteContinuityProfile
    briefing: ReturnType<typeof buildCGIExecutiveBriefing>
  }[],
): CrossSitePattern {
  const affectedSites = siteBriefings.map(({ site }) => site.siteName)
  const dominant = strongestSite(siteBriefings.map(({ site }) => site))
  const sharedDependencies = Array.from(
    new Set(siteBriefings.map(({ site }) => site.sharedDependency)),
  )

  const criticalSites = siteBriefings.filter(
    ({ briefing }) => briefing.synthesis.synthesisPosture === 'CRITICAL',
  ).length

  const elevatedSites = siteBriefings.filter(
    ({ briefing }) => briefing.synthesis.synthesisPosture === 'ELEVATED',
  ).length

  const evidenceGaps = siteBriefings.filter(
    ({ site }) => !site.evidenceVerified,
  ).length

  const recoveryGaps = siteBriefings.filter(({ site }) =>
    ['WATCHED', 'ELEVATED', 'CRITICAL'].includes(site.recoveryPosture),
  ).length

  const patternType =
    criticalSites > 0
      ? 'ENTERPRISE EXPOSURE'
      : elevatedSites >= 2
        ? 'DISTRIBUTED CONTINUITY PATTERN'
        : evidenceGaps > 0
          ? 'EVIDENCE-WEAK CROSS-SITE PATTERN'
          : 'MONITORED CROSS-SITE PATTERN'

  return {
    patternName: 'Supplier Concentration Fuel Logistics Pattern',
    patternType,
    affectedSites,
    dominantSite: dominant.siteName,
    sharedDependency: sharedDependencies.join(', '),
    enterpriseExposure:
      'A repeated fuel logistics disruption is no longer only a site issue. It reveals shared supplier dependency across operational sites.',
    recoveryPattern:
      recoveryGaps > 1
        ? 'Recovery is uneven. At least two sites still require watch, elevated monitoring, or durability confirmation.'
        : 'Recovery is improving, but memory and evidence must remain attached.',
    commandMeaning:
      criticalSites > 0
        ? 'Command visibility should remain elevated because one site still carries critical continuity exposure.'
        : 'Command watch should remain available while cross-site evidence matures.',
    coordinationMeaning:
      'Coordination must confirm supplier alternatives, site-level recovery evidence, ownership, and continuity capacity before confidence is restored.',
    executiveMeaning:
      'Leadership should treat the pattern as enterprise continuity exposure until supplier concentration risk, recurrence risk, and recovery durability are proven across all affected sites.',
    nextGovernedDestination:
      criticalSites > 0 || elevatedSites >= 2
        ? 'Executive Center'
        : evidenceGaps > 0
          ? 'Coordination Center'
          : 'Audit Reconstruction',
    evidenceStandard:
      'Preserve affected sites, shared dependency, site posture, recovery status, command meaning, coordination need, evidence maturity, and institutional memory statement.',
  }
}

function buildCrossSiteDecision(pattern: CrossSitePattern): CrossSiteDecision {
  if (pattern.patternType === 'ENTERPRISE EXPOSURE') {
    return {
      chainPosition:
        'Coordination has escalated into cross-site enterprise exposure review.',
      crossSitePattern: pattern.patternName,
      crossSiteReason:
        'Cross-site review is required because one site carries critical continuity pressure while other sites share the same supplier dependency.',
      nextGovernedDestination: 'Executive Center',
      executiveReviewRequired: true,
      auditRequired: true,
      continuityHistoryRequired: true,
      evidenceStandard: pattern.evidenceStandard,
    }
  }

  if (pattern.patternType === 'DISTRIBUTED CONTINUITY PATTERN') {
    return {
      chainPosition:
        'Coordination has revealed a repeated or distributed continuity pattern.',
      crossSitePattern: pattern.patternName,
      crossSiteReason:
        'Cross-site governance is required because the instability may no longer be isolated to one site.',
      nextGovernedDestination: 'Situation Room',
      executiveReviewRequired: true,
      auditRequired: true,
      continuityHistoryRequired: true,
      evidenceStandard: pattern.evidenceStandard,
    }
  }

  if (pattern.patternType === 'EVIDENCE-WEAK CROSS-SITE PATTERN') {
    return {
      chainPosition:
        'Cross-site review is holding because evidence remains incomplete.',
      crossSitePattern: pattern.patternName,
      crossSiteReason:
        'The system must not allow weak evidence to become enterprise continuity confidence.',
      nextGovernedDestination: 'Coordination Center',
      executiveReviewRequired: false,
      auditRequired: true,
      continuityHistoryRequired: false,
      evidenceStandard: pattern.evidenceStandard,
    }
  }

  return {
    chainPosition:
      'Cross-site review is stable and can remain under monitored enterprise visibility.',
    crossSitePattern: pattern.patternName,
    crossSiteReason:
      'Cross-site review remains useful for memory preservation and comparative continuity awareness.',
    nextGovernedDestination: 'Audit Reconstruction',
    executiveReviewRequired: false,
    auditRequired: true,
    continuityHistoryRequired: false,
    evidenceStandard: pattern.evidenceStandard,
  }
}

export default function CrossSitePage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <CrossSiteContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function CrossSiteContent() {
  const [saveMessage, setSaveMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [profiles, setProfiles] = useState<PersistedSiteContinuityProfile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  const pilotScenario = buildCGIDemoScenario('FUEL_LOGISTICS_CHAIN_PROOF')
  const pilotThread = pilotScenario.pilotThread

  const siteBriefings = useMemo(
    () =>
      sites.map((site) => ({
        site,
        briefing: buildCGIExecutiveBriefing(site),
      })),
    [],
  )

  const dominantSite = strongestSite(sites)
  const dominantBriefing = buildCGIExecutiveBriefing(dominantSite)
  const crossSitePattern = buildCrossSitePattern(siteBriefings)
  const crossSiteDecision = buildCrossSiteDecision(crossSitePattern)

  const executivePosture = formatCGIExecutivePosture(
    dominantBriefing.synthesis.synthesisPosture,
  )

  const evidenceLanguage = formatCGIEvidenceLanguage(
    false,
    dominantBriefing.synthesis.synthesisPosture,
  )

  const survivabilityLanguage = formatCGISurvivabilityLanguage(
    dominantBriefing.synthesis.synthesisPosture,
  )

  const governanceLanguage = formatCGIGovernanceSafeLanguage()

  const criticalSites = siteBriefings.filter(
    ({ briefing }) => briefing.synthesis.synthesisPosture === 'CRITICAL',
  ).length

  const elevatedSites = siteBriefings.filter(
    ({ briefing }) => briefing.synthesis.synthesisPosture === 'ELEVATED',
  ).length

  const structuralMemorySites = sites.filter(
    (site) => site.structuralMemoryVisible,
  ).length

  const evidenceGaps = sites.filter((site) => !site.evidenceVerified).length

  async function loadSiteProfiles() {
    try {
      setLoadingProfiles(true)
      setProfileMessage('Loading persisted site continuity profiles...')

      const loadedProfiles = await loadCGISiteContinuityProfiles()

      setProfiles(Array.isArray(loadedProfiles) ? loadedProfiles : [])
      setProfileMessage('Site continuity profile archive loaded.')
    } catch (error) {
      console.error(error)
      setProfileMessage('Site continuity profile archive could not be loaded.')
    } finally {
      setLoadingProfiles(false)
    }
  }

  useEffect(() => {
    loadSiteProfiles()
  }, [])

  async function handleSaveSiteProfiles() {
    try {
      setSaving(true)
      setSaveMessage('Saving cross-site continuity profiles...')

      await Promise.all(
        siteBriefings.map(({ site, briefing }) => {
          const sitePosture = briefing.synthesis.synthesisPosture
          const coordinationNeed =
            sitePosture === 'CRITICAL'
              ? 'EXECUTIVE'
              : sitePosture === 'ELEVATED'
                ? 'ACTIVE'
                : 'ROUTINE'

          return saveCGISiteContinuityProfile({
            siteName: site.siteName,
            region: site.region,
            siteType: 'Operational Site',
            continuityPosture: sitePosture,
            coordinationNeed,
            pressurePosture: site.pressurePosture,
            trajectoryPosture: site.trajectoryPosture,
            predictivePosture: site.predictivePosture,
            recoveryPosture: site.recoveryPosture,
            reliabilityPosture: site.reliabilityPosture,
            evidenceVerified: site.evidenceVerified,
            accountabilityActive: site.accountabilityActive,
            structuralMemoryVisible: site.structuralMemoryVisible,
            executiveSummary: briefing.executiveSummary,
            rawPayload: {
              site,
              briefing,
              crossSitePattern,
              crossSiteDecision,
              pilotThread,
              savedFrom: '/cross-site',
            },
          })
        }),
      )

      setSaveMessage('Cross-site continuity profiles saved.')
      await loadSiteProfiles()
    } catch (error) {
      console.error(error)
      setSaveMessage('Cross-site continuity profiles could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <InfrastructureNav />

        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • CROSS-SITE</p>

          <h1 style={styles.title}>Cross-Site Continuity Intelligence</h1>

          <p style={styles.subtitle}>
            Enterprise continuity layer for identifying whether visible
            instability is isolated, distributed, recurring, evidence-weak, or
            structurally shared across operational sites.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Cross-Site Pattern</p>

            <h2 style={styles.heroTitle}>{crossSitePattern.patternName}</h2>

            <p style={styles.heroMeaning}>
              {crossSitePattern.enterpriseExposure}
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Pattern Type</p>

            <p style={styles.statusValue}>{crossSitePattern.patternType}</p>
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Pilot Chain Context</p>

          <h2 style={styles.cardTitle}>{pilotThread.scenarioName}</h2>

          <p style={styles.bodyText}>{pilotThread.scenarioSummary}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem
              title="Shared Dependency"
              body={crossSitePattern.sharedDependency}
            />

            <PriorityItem
              title="Dominant Site"
              body={crossSitePattern.dominantSite}
            />

            <PriorityItem
              title="Affected Sites"
              body={crossSitePattern.affectedSites.join(', ')}
            />
          </div>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Cross-Site Chain Position</p>

            <h2 style={styles.heroTitle}>{crossSiteDecision.chainPosition}</h2>

            <p style={styles.heroMeaning}>
              {crossSiteDecision.crossSiteReason}
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Next Destination</p>

            <p style={styles.statusValue}>
              {crossSiteDecision.nextGovernedDestination}
            </p>
          </div>
        </section>

        <section style={styles.chainPanel}>
          <ChainStep label="Recovery" value="Uneven durability" />
          <ChainStep label="Command" value={crossSitePattern.commandMeaning} />
          <ChainStep
            label="Coordination"
            value={crossSitePattern.coordinationMeaning}
          />
          <ChainStep label="Cross-Site" value={crossSitePattern.patternType} />
          <ChainStep
            label="Next"
            value={crossSiteDecision.nextGovernedDestination}
          />
        </section>

        <section style={styles.gridFour}>
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
            title="Memory Sites"
            value={String(structuralMemorySites)}
            body="Sites where prior instability remains relevant to current continuity interpretation."
          />

          <SignalCard
            title="Evidence Gaps"
            value={String(evidenceGaps)}
            body="Sites where continuity confidence cannot be fully trusted yet."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Enterprise Exposure Meaning</p>

          <h2 style={styles.cardTitle}>
            {crossSitePattern.executiveMeaning}
          </h2>

          <p style={styles.bodyText}>{crossSitePattern.recoveryPattern}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem
              title="Executive Review"
              body={
                crossSiteDecision.executiveReviewRequired
                  ? 'Required before continuity trust can be restored.'
                  : 'Not required yet. Continue governed visibility.'
              }
            />

            <PriorityItem
              title="Audit"
              body={
                crossSiteDecision.auditRequired
                  ? 'Required. Cross-site meaning must remain reconstructable.'
                  : 'Not required by current posture.'
              }
            />

            <PriorityItem
              title="Continuity History"
              body={
                crossSiteDecision.continuityHistoryRequired
                  ? 'Required. Pattern memory must be preserved.'
                  : 'Not required beyond routine memory preservation.'
              }
            />
          </div>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Persistence Action</p>

            <h2 style={styles.actionTitle}>
              Preserve cross-site pattern intelligence as institutional memory.
            </h2>

            <p style={styles.actionText}>
              Saving the profile set creates durable cross-site continuity
              records for site posture, shared dependency, recovery pattern,
              coordination need, evidence status, and next governed destination.
            </p>

            {saveMessage && <p style={styles.saveMessage}>{saveMessage}</p>}
          </div>

          <button
            type="button"
            onClick={handleSaveSiteProfiles}
            disabled={saving}
            style={{
              ...styles.primaryButton,
              ...(saving ? styles.disabledButton : {}),
            }}
          >
            {saving ? 'Saving...' : 'Save Site Profiles'}
          </button>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Cross-Site Memory Retrieval</p>

            <h2 style={styles.actionTitle}>
              Retrieve persisted site continuity profiles.
            </h2>

            <p style={styles.actionText}>
              CGI can reconstruct which sites repeatedly stabilize,
              deteriorate, escalate, or carry structural memory across time.
            </p>

            {profileMessage && (
              <p style={styles.saveMessage}>{profileMessage}</p>
            )}
          </div>

          <button
            type="button"
            onClick={loadSiteProfiles}
            disabled={loadingProfiles}
            style={{
              ...styles.secondaryButton,
              ...(loadingProfiles ? styles.disabledButton : {}),
            }}
          >
            {loadingProfiles ? 'Refreshing...' : 'Refresh Profiles'}
          </button>
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
          <p style={styles.sectionKicker}>Cross-Site Evidence Standard</p>

          <h2 style={styles.cardTitle}>
            Cross-site meaning must remain reconstructable.
          </h2>

          <p style={styles.bodyText}>
            {crossSiteDecision.evidenceStandard}
          </p>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Site Continuity Board</p>

          <h2 style={styles.cardTitle}>
            Continuity exposure must be interpreted as pattern, not just
            posture.
          </h2>

          <div style={styles.siteList}>
            {siteBriefings.map(({ site, briefing }) => (
              <article key={site.siteName} style={styles.siteCard}>
                <div>
                  <p style={styles.siteRegion}>{site.region}</p>

                  <h3 style={styles.siteTitle}>{site.siteName}</h3>

                  <p style={styles.siteMeaning}>
                    {site.continuityFinding}
                  </p>

                  <p style={styles.siteMemory}>
                    {site.recoveryMeaning}
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

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Persisted Site Profile Archive</p>

          <h2 style={styles.cardTitle}>
            Site continuity profiles retrieved from Supabase.
          </h2>

          <p style={styles.bodyText}>Profile Count: {profiles.length}</p>

          <div style={styles.archiveList}>
            {profiles.length === 0 ? (
              <p style={styles.emptyText}>
                No persisted site continuity profiles are currently available.
              </p>
            ) : (
              profiles.map((item, index) => (
                <article
                  key={item.id ?? `${getProfileValue(item, 'createdAt')}-${index}`}
                  style={styles.archiveItem}
                >
                  <div style={styles.archiveHeader}>
                    <div>
                      <p style={styles.panelKicker}>
                        {getProfileValue(item, 'continuityPosture') ??
                          'SITE_PROFILE'}
                      </p>

                      <h3 style={styles.archiveTitle}>
                        {getProfileValue(item, 'siteName') ??
                          'Unnamed Site'}
                      </h3>
                    </div>

                    <p style={styles.archiveDate}>
                      {formatDate(getProfileValue(item, 'createdAt'))}
                    </p>
                  </div>

                  <div style={styles.archiveGrid}>
                    <PriorityItem
                      title="Region"
                      body={
                        getProfileValue(item, 'region') ??
                        'Not recorded'
                      }
                    />

                    <PriorityItem
                      title="Coordination Need"
                      body={
                        getProfileValue(item, 'coordinationNeed') ??
                        'Not recorded'
                      }
                    />

                    <PriorityItem
                      title="Evidence Verified"
                      body={
                        getProfileValue(item, 'evidenceVerified') ??
                        'Not recorded'
                      }
                    />
                  </div>

                  <p style={styles.archiveSummary}>
                    {getProfileValue(item, 'executiveSummary') ??
                      'No executive summary was recorded for this site profile.'}
                  </p>
                </article>
              ))
            )}
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
            continuity exposure, structural memory, stabilization evidence,
            shared dependency, and survivability pressure across operational
            environments.
          </Panel>
        </section>
      </div>
    </main>
  )
}

function getProfileValue(
  profile: PersistedSiteContinuityProfile,
  key: string,
): string | null {
  const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

  const value =
    profile[key] ??
    profile[snakeKey] ??
    profile.rawPayload?.[key] ??
    profile.raw_payload?.[key] ??
    null

  if (value === null || value === undefined) return null

  return String(value)
}

function formatDate(value: string | null) {
  if (!value) return 'Date not recorded'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString()
}

function ChainStep({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.chainStep}>
      <p style={styles.panelKicker}>{label}</p>
      <p style={styles.chainValue}>{value}</p>
    </article>
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
  chainPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  chainStep: {
    background: '#082f49',
    border: '1px solid #0ea5e9',
    borderRadius: '16px',
    padding: '14px',
    minHeight: '120px',
  },
  chainValue: {
    color: '#e0f2fe',
    fontSize: '13px',
    fontWeight: 900,
    lineHeight: 1.35,
    margin: '10px 0 0',
  },
  actionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: '16px',
    alignItems: 'center',
    background: '#082f49',
    border: '1px solid #0ea5e9',
    borderRadius: '22px',
    padding: '18px',
    marginBottom: '16px',
    boxSizing: 'border-box',
  },
  actionTitle: {
    color: '#f8fafc',
    fontSize: '22px',
    lineHeight: 1.2,
    margin: '8px 0',
  },
  actionText: {
    color: '#cbd5e1',
    lineHeight: 1.55,
    margin: 0,
    maxWidth: '760px',
  },
  saveMessage: {
    color: '#cffafe',
    fontWeight: 900,
    margin: '12px 0 0',
  },
  primaryButton: {
    border: 'none',
    borderRadius: '14px',
    background: '#67e8f9',
    color: '#082f49',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 900,
    minHeight: '48px',
    padding: '0 18px',
    whiteSpace: 'nowrap',
  },
  secondaryButton: {
    border: '1px solid #67e8f9',
    borderRadius: '14px',
    background: '#0f172a',
    color: '#cffafe',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 900,
    minHeight: '48px',
    padding: '0 18px',
    whiteSpace: 'nowrap',
  },
  disabledButton: {
    cursor: 'not-allowed',
    opacity: 0.65,
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
    fontSize: 'clamp(30px, 4vw, 46px)',
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
    fontSize: '26px',
    lineHeight: 1.1,
    margin: 0,
    fontWeight: 900,
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
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
  siteMemory: {
    color: '#a5f3fc',
    borderTop: '1px solid #334155',
    lineHeight: 1.55,
    margin: '12px 0 0',
    paddingTop: '12px',
    fontWeight: 800,
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
  archiveList: {
    display: 'grid',
    gap: '14px',
    marginTop: '16px',
  },
  archiveItem: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '18px',
    padding: '16px',
  },
  archiveHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    alignItems: 'flex-start',
    marginBottom: '14px',
  },
  archiveTitle: {
    color: '#f8fafc',
    fontSize: '20px',
    lineHeight: 1.2,
    margin: '8px 0 0',
  },
  archiveDate: {
    color: '#a5f3fc',
    fontWeight: 800,
    fontSize: '13px',
    lineHeight: 1.4,
    margin: 0,
    textAlign: 'right',
    minWidth: '180px',
  },
  archiveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '12px',
  },
  archiveSummary: {
    color: '#cbd5e1',
    lineHeight: 1.65,
    margin: '14px 0 0',
  },
  emptyText: {
    color: '#cbd5e1',
    lineHeight: 1.6,
    margin: 0,
  },
}