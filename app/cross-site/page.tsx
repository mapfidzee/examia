'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIDemoScenario } from '@/lib/cgiDemoScenarioEngine'
import {
  formatCGIEvidenceLanguage,
  formatCGIGovernanceSafeLanguage,
  formatCGISurvivabilityLanguage,
} from '@/lib/cgiExecutivePostureFormatter'
import {
  loadCGISiteContinuityProfiles,
  saveCGISiteContinuityProfile,
} from '@/lib/cgiPersistenceEngine'
import {
  buildCGICrossSiteDoctrine,
  type CGISiteContinuityProfile,
} from '@/lib/cgiCrossSiteDoctrineEngine'

type PersistedSiteContinuityProfile = Record<string, unknown>

const sites: CGISiteContinuityProfile[] = [
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

  const doctrine = useMemo(
    () => buildCGICrossSiteDoctrine(sites, pilotThread.scenarioName),
    [pilotThread.scenarioName],
  )

  const { pattern, decision, dominantBriefing, siteBriefings } = doctrine

  const evidenceLanguage = formatCGIEvidenceLanguage(
    false,
    dominantBriefing.synthesis.synthesisPosture,
  )

  const survivabilityLanguage = formatCGISurvivabilityLanguage(
    dominantBriefing.synthesis.synthesisPosture,
  )

  const governanceLanguage = formatCGIGovernanceSafeLanguage()

  useEffect(() => {
    loadSiteProfiles()
  }, [])

  async function loadSiteProfiles() {
    try {
      setLoadingProfiles(true)
      setProfileMessage('Loading enterprise cross-site memory...')

      const loadedProfiles = await loadCGISiteContinuityProfiles()

      setProfiles(Array.isArray(loadedProfiles) ? loadedProfiles : [])
      setProfileMessage('Enterprise cross-site memory loaded.')
    } catch (error) {
      console.error(error)
      setProfileMessage('Enterprise cross-site memory could not be loaded.')
    } finally {
      setLoadingProfiles(false)
    }
  }

  async function handleSaveSiteProfiles() {
    try {
      setSaving(true)
      setSaveMessage('Saving enterprise cross-site memory...')

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
              doctrine,
              pilotThread,
              savedFrom: '/cross-site',
            },
          })
        }),
      )

      setSaveMessage('Enterprise cross-site memory saved.')
      await loadSiteProfiles()
    } catch (error) {
      console.error(error)
      setSaveMessage('Enterprise cross-site memory could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • ENTERPRISE CROSS-SITE</p>
            <h1 style={styles.title}>Enterprise Cross-Site Intelligence</h1>
            <p style={styles.subtitle}>
              Cross-Site determines whether visible instability is isolated,
              repeated, shared, structural, or enterprise-wide. It protects CGI
              from treating distributed continuity risk as a local site problem.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>CROSS-SITE MATURITY</p>
            <p style={styles.statusValue}>{pattern.maturity}</p>
            <p style={styles.statusMeaning}>{pattern.enterpriseExposure}</p>
          </div>
        </section>

        {(saveMessage || profileMessage) && (
          <div style={styles.message}>{saveMessage || profileMessage}</div>
        )}

        <section style={styles.commandDeck}>
          <div style={styles.primaryCard}>
            <p style={styles.sectionKicker}>Executive Cross-Site Question</p>
            <h2 style={styles.commandTitle}>{pattern.executiveQuestion}</h2>
            <p style={styles.primaryText}>
              Cross-Site compares site posture, shared dependency, evidence
              maturity, recovery durability, recurrence visibility, command
              meaning, coordination need, and structural memory before the chain
              moves to Situation Room, Executive Center, or Audit.
            </p>

            <div style={styles.commandMetaGrid}>
              <MiniStat label="Pattern" value={pattern.patternName} />
              <MiniStat label="Dominant Site" value={pattern.dominantSite} />
              <MiniStat label="Affected Sites" value={String(doctrine.affectedSites)} />
              <MiniStat label="Next" value={decision.nextGovernedDestination} />
            </div>
          </div>

          <div style={styles.consequenceCard}>
            <p style={styles.sectionKicker}>Board Warning</p>
            <h2 style={styles.consequenceTitle}>
              Local recovery can hide enterprise fragility.
            </h2>
            <p style={styles.bodyText}>{pattern.boardWarning}</p>
          </div>
        </section>

        <section style={styles.metricsGrid}>
          <Metric label="Critical Sites" value={doctrine.criticalSites} />
          <Metric label="Elevated Sites" value={doctrine.elevatedSites} />
          <Metric label="Affected Sites" value={doctrine.affectedSites} />
          <Metric label="Evidence Gaps" value={doctrine.evidenceGaps} />
          <Metric label="Memory Sites" value={doctrine.structuralMemorySites} />
          <Metric label="Profiles Saved" value={profiles.length} />
        </section>

        <section style={styles.gridFour}>
          <ExecutiveCard
            title="Instability Scope"
            value={pattern.maturity}
            body="Whether visible instability remains local or is becoming structural."
          />
          <ExecutiveCard
            title="Shared Dependency"
            value={pattern.sharedDependency}
            body="The dependency that may be linking multiple operational sites."
          />
          <ExecutiveCard
            title="Recovery Pattern"
            value={pattern.recoveryPattern}
            body="Whether recovery is becoming durable across sites or remaining uneven."
          />
          <ExecutiveCard
            title="Executive Meaning"
            value={pattern.executiveMeaning}
            body="What leadership should understand before trusting continuity."
          />
        </section>

        <section style={styles.gridFour}>
          <GateCard
            title="Coordination"
            active={decision.coordinationRequired}
            body="Whether coordination must repair ownership, alternatives, or evidence."
          />
          <GateCard
            title="Situation Room"
            active={decision.situationRoomRequired}
            body="Whether the pattern must enter the enterprise operating picture."
          />
          <GateCard
            title="Executive Review"
            active={decision.executiveReviewRequired}
            body="Whether leadership synthesis is required before continuity trust returns."
          />
          <GateCard
            title="Audit"
            active={decision.auditRequired}
            body="Whether cross-site meaning must remain reconstructable."
          />
        </section>

        <section style={styles.memoryPanel}>
          <p style={styles.sectionKicker}>Cross-Site Memory</p>
          <h2 style={styles.panelTitle}>
            The institution must remember whether instability was isolated,
            repeated, shared, structural, or enterprise-wide.
          </h2>

          <div style={styles.memoryGrid}>
            <MiniStat label="Dominant Site" value={pattern.dominantSite} />
            <MiniStat label="Dependency" value={pattern.sharedDependency} />
            <MiniStat label="Required Action" value={pattern.requiredAction} />
            <MiniStat label="Evidence" value={pattern.evidenceStandard} />
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Enterprise Movement Requirements">
            <Info label="Required Action" value={pattern.requiredAction} />
            <Info label="Chain Position" value={decision.chainPosition} />
            <Info label="Cross-Site Reason" value={decision.crossSiteReason} />
            <Info label="Next Destination" value={decision.nextGovernedDestination} />
          </Panel>

          <Panel title="Evidence + Governance Standard">
            <Info label="Evidence" value={evidenceLanguage} />
            <Info label="Survivability" value={survivabilityLanguage} />
            <Info label="Governance" value={governanceLanguage} />
            <Info label="Reconstruction" value={decision.evidenceStandard} />
          </Panel>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Cross-Site Memory Save</p>
            <h2 style={styles.actionTitle}>
              Preserve enterprise cross-site memory.
            </h2>
            <p style={styles.actionText}>
              Save the current cross-site interpretation, dependency pattern,
              dominant site, recovery meaning, executive meaning, and
              survivability posture so the institution can reconstruct how
              enterprise continuity exposure emerged.
            </p>
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
            {saving ? 'Saving...' : 'Save Cross-Site Memory'}
          </button>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Cross-Site Memory Retrieval</p>
            <h2 style={styles.actionTitle}>
              Retrieve persisted cross-site memory.
            </h2>
            <p style={styles.actionText}>
              Retrieve site continuity profiles to reconstruct which sites
              repeatedly stabilize, deteriorate, escalate, or carry structural
              memory across time.
            </p>
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

        <section style={styles.gridThree}>
          {siteBriefings.map(({ site, briefing }) => (
            <article key={site.siteName} style={styles.siteCard}>
              <p style={styles.sectionKicker}>{site.region}</p>
              <h3 style={styles.siteTitle}>{site.siteName}</h3>

              <div style={styles.siteMeta}>
                <MiniStat
                  label="Posture"
                  value={briefing.synthesis.synthesisPosture}
                />
                <MiniStat
                  label="Evidence"
                  value={site.evidenceVerified ? 'VERIFIED' : 'GAP'}
                />
              </div>

              <p style={styles.siteBody}>{site.continuityFinding}</p>
              <p style={styles.siteRecovery}>
                <strong>Recovery Meaning:</strong> {site.recoveryMeaning}
              </p>
            </article>
          ))}
        </section>

        <section style={styles.panel}>
          <p style={styles.sectionKicker}>Persisted Cross-Site Memory</p>
          <h2 style={styles.panelTitle}>
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
                  key={`${getProfileValue(item, 'createdAt') ?? 'profile'}-${index}`}
                  style={styles.archiveItem}
                >
                  <div style={styles.archiveHeader}>
                    <div>
                      <p style={styles.metricLabel}>
                        {getProfileValue(item, 'continuityPosture') ??
                          'SITE_PROFILE'}
                      </p>
                      <h3 style={styles.archiveTitle}>
                        {getProfileValue(item, 'siteName') ?? 'Unnamed Site'}
                      </h3>
                    </div>
                    <p style={styles.archiveDate}>
                      {formatDate(getProfileValue(item, 'createdAt'))}
                    </p>
                  </div>

                  <div style={styles.archiveGrid}>
                    <Info
                      label="Region"
                      value={getProfileValue(item, 'region') ?? 'Not recorded'}
                    />
                    <Info
                      label="Coordination"
                      value={
                        getProfileValue(item, 'coordinationNeed') ??
                        'Not recorded'
                      }
                    />
                    <Info
                      label="Evidence"
                      value={
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

        <section style={styles.orderPanel}>
          <p style={styles.sectionKicker}>Copy-Ready Cross-Site Brief</p>
          <h2 style={styles.panelTitle}>
            Is instability isolated or becoming enterprise-wide?
          </h2>
          <pre style={styles.summaryBox}>{doctrine.copyReadyBrief}</pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE CROSS-SITE DOCTRINE</strong>
          <span>
            Coordination synchronizes dependency. Cross-Site determines whether
            instability is isolated, repeated, shared, structural, or
            enterprise-wide. Situation Room interprets operating condition.
            Executive Center governs institutional meaning. Memory preserves
            continuity truth. Audit reconstructs the chain. Local recovery must
            never hide enterprise fragility.
          </span>
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
    getNestedRecord(profile, 'rawPayload')?.[key] ??
    getNestedRecord(profile, 'raw_payload')?.[key] ??
    null

  if (value === null || value === undefined) return null
  return String(value)
}

function getNestedRecord(
  value: PersistedSiteContinuityProfile,
  key: string,
): Record<string, unknown> | null {
  const nested = value[key]

  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return nested as Record<string, unknown>
  }

  return null
}

function formatDate(value: string | null) {
  if (!value) return 'Date not recorded'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString()
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{String(value)}</p>
    </article>
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

function ExecutiveCard({
  title,
  value,
  body,
}: {
  title: string
  value: string
  body: string
}) {
  return (
    <article style={styles.panelCard}>
      <p style={styles.sectionKicker}>{title}</p>
      <h3 style={styles.cardValue}>{value}</h3>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function GateCard({
  title,
  active,
  body,
}: {
  title: string
  active: boolean
  body: string
}) {
  return (
    <article
      style={{
        ...styles.panelCard,
        ...(active ? styles.activePanelCard : {}),
      }}
    >
      <p style={styles.sectionKicker}>{title}</p>
      <h3 style={styles.cardValue}>{active ? 'REQUIRED' : 'WATCH'}</h3>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={styles.panel}>
      <p style={styles.sectionKicker}>{title}</p>
      <div style={styles.infoList}>{children}</div>
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
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
    boxShadow: '0 28px 80px rgba(0,0,0,0.38)',
  },
  kicker: {
    margin: 0,
    color: '#c9a227',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.22em',
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
    overflowWrap: 'anywhere',
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
    border: '1px solid rgba(255,255,255,0.12)',
  },
  consequenceCard: {
    padding: 30,
    borderRadius: 28,
    background: 'rgba(0,0,0,0.38)',
    border: '1px solid rgba(201,162,39,0.28)',
  },
  sectionKicker: {
    margin: 0,
    color: '#c9a227',
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
    margin: '8px 0 0',
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
  metricsGrid: {
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
    fontSize: 28,
    fontWeight: 950,
    lineHeight: 1.15,
  },
  miniStat: {
    padding: 14,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.055)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  miniValue: {
    margin: '8px 0 0',
    color: '#fff',
    fontSize: 13,
    fontWeight: 850,
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  gridFour: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 16,
  },
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 16,
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 16,
  },
  panel: {
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  panelCard: {
    padding: 22,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.09)',
    minHeight: 150,
  },
  activePanelCard: {
    background:
      'linear-gradient(135deg, rgba(201,162,39,0.14), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.38)',
  },
  panelTitle: {
    margin: '12px 0 0',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
  },
  cardValue: {
    margin: '12px 0 0',
    color: '#fff',
    fontSize: 19,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
  },
  panelBody: {
    marginTop: 10,
    color: '#aeb6c2',
    fontSize: 14,
    lineHeight: 1.65,
  },
  memoryPanel: {
    padding: 28,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(201,162,39,0.13), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.32)',
  },
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 20,
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
  actionPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 16,
    alignItems: 'center',
    padding: 28,
    borderRadius: 28,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(201,162,39,0.24)',
  },
  actionTitle: {
    margin: '12px 0 0',
    color: '#fff',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.04em',
  },
  actionText: {
    margin: '12px 0 0',
    color: '#aeb6c2',
    lineHeight: 1.7,
    maxWidth: 820,
  },
  primaryButton: {
    border: 'none',
    borderRadius: 999,
    padding: '14px 22px',
    background: '#c9a227',
    color: '#090909',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  secondaryButton: {
    border: '1px solid rgba(201,162,39,0.34)',
    borderRadius: 999,
    padding: '14px 22px',
    background: 'rgba(201,162,39,0.1)',
    color: '#f8f6f1',
    fontWeight: 950,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  disabledButton: {
    cursor: 'not-allowed',
    opacity: 0.65,
  },
  siteCard: {
    padding: 24,
    borderRadius: 24,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  siteTitle: {
    margin: '12px 0',
    color: '#fff',
    fontSize: 24,
    lineHeight: 1.15,
  },
  siteMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    marginBottom: 16,
  },
  siteBody: {
    margin: 0,
    color: '#aeb6c2',
    lineHeight: 1.65,
  },
  siteRecovery: {
    margin: '14px 0 0',
    paddingTop: 14,
    borderTop: '1px solid rgba(255,255,255,0.08)',
    color: '#ece7d7',
    lineHeight: 1.65,
  },
  archiveList: {
    display: 'grid',
    gap: 14,
    marginTop: 20,
  },
  archiveItem: {
    padding: 20,
    borderRadius: 22,
    background: 'rgba(0,0,0,0.24)',
    border: '1px solid rgba(255,255,255,0.09)',
  },
  archiveHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 14,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  archiveTitle: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 1.2,
    margin: '8px 0 0',
  },
  archiveDate: {
    color: '#d7b84c',
    fontWeight: 850,
    fontSize: 13,
    lineHeight: 1.4,
    margin: 0,
    textAlign: 'right',
    minWidth: 180,
  },
  archiveGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 12,
  },
  archiveSummary: {
    color: '#aeb6c2',
    lineHeight: 1.65,
    margin: '14px 0 0',
  },
  emptyText: {
    color: '#aeb6c2',
    lineHeight: 1.6,
    margin: 0,
  },
  orderPanel: {
    padding: 28,
    borderRadius: 28,
    background: '#fff',
    color: '#0b0b0b',
  },
  summaryBox: {
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