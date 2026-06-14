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
  const latestProfiles = profiles.slice(0, 3)

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
              repeated, shared, structural, or enterprise-wide before local
              recovery is trusted.
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

        <section style={styles.gridTwo}>
          <Panel title="Executive Cross-Site Question">
            <h2 style={styles.bigText}>{pattern.executiveQuestion}</h2>
            <p style={styles.bodyText}>
              Cross-Site protects CGI from treating distributed continuity risk
              as a local site problem.
            </p>
          </Panel>

          <Panel title="Board Warning">
            <h2 style={styles.bigText}>
              Local recovery can hide enterprise fragility.
            </h2>
            <p style={styles.bodyText}>{pattern.boardWarning}</p>
          </Panel>
        </section>

        <section style={styles.metricGrid}>
          <Metric label="Critical Sites" value={doctrine.criticalSites} />
          <Metric label="Elevated Sites" value={doctrine.elevatedSites} />
          <Metric label="Affected Sites" value={doctrine.affectedSites} />
          <Metric label="Evidence Gaps" value={doctrine.evidenceGaps} />
          <Metric label="Memory Sites" value={doctrine.structuralMemorySites} />
          <Metric label="Profiles Saved" value={profiles.length} />
        </section>

        <section style={styles.gridThree}>
          <Card
            title="Instability Scope"
            value={pattern.maturity}
            body="Whether instability is isolated or becoming structural."
          />
          <Card
            title="Shared Dependency"
            value={pattern.sharedDependency}
            body="The dependency linking multiple operational sites."
          />
          <Card
            title="Recovery Pattern"
            value={pattern.recoveryPattern}
            body="Whether recovery is durable or uneven across sites."
          />
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Required Movement">
            <Info label="Required Action" value={pattern.requiredAction} />
            <Info label="Chain Position" value={decision.chainPosition} />
            <Info label="Cross-Site Reason" value={decision.crossSiteReason} />
            <Info label="Next Destination" value={decision.nextGovernedDestination} />
          </Panel>

          <Panel title="Evidence Standard">
            <Info label="Evidence" value={evidenceLanguage} />
            <Info label="Governance Rule" value={governanceLanguage} />
            <Info label="Reconstruction" value={decision.evidenceStandard} />
          </Panel>
        </section>

        <Panel title="Cross-Site Implications">
          <div style={styles.infoGrid}>
            <Info
              label="Coordination"
              value={decision.coordinationRequired ? 'REQUIRED' : 'WATCH'}
            />
            <Info
              label="Situation Room"
              value={decision.situationRoomRequired ? 'REQUIRED' : 'WATCH'}
            />
            <Info
              label="Executive Review"
              value={decision.executiveReviewRequired ? 'REQUIRED' : 'WATCH'}
            />
            <Info label="Audit" value={decision.auditRequired ? 'REQUIRED' : 'WATCH'} />
            <Info label="Survivability" value={survivabilityLanguage} />
            <Info label="Executive Meaning" value={pattern.executiveMeaning} />
          </div>
        </Panel>

        <section style={styles.memoryPanel}>
          <div>
            <p style={styles.kicker}>Cross-Site Memory</p>
            <h2 style={styles.panelTitle}>
              Preserve and retrieve enterprise continuity memory.
            </h2>
            <p style={styles.bodyText}>
              Cross-Site memory preserves whether instability was isolated,
              repeated, shared, structural, or enterprise-wide.
            </p>
          </div>

          <div style={styles.memoryActions}>
            <button
              type="button"
              onClick={handleSaveSiteProfiles}
              disabled={saving}
              style={{
                ...styles.button,
                ...(saving ? styles.disabledButton : {}),
              }}
            >
              {saving ? 'Saving...' : 'Save Memory'}
            </button>

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
          </div>
        </section>

        <section style={styles.gridThree}>
          {siteBriefings.map(({ site, briefing }) => (
            <article key={site.siteName} style={styles.siteCard}>
              <p style={styles.kicker}>{site.region}</p>
              <h3 style={styles.cardValue}>{site.siteName}</h3>

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

              <p style={styles.bodyText}>{site.continuityFinding}</p>
            </article>
          ))}
        </section>

        <Panel title="Recent Enterprise Memory">
          <p style={styles.bodyText}>Profile Count: {profiles.length}</p>

          <div style={styles.profileGrid}>
            {latestProfiles.length === 0 ? (
              <p style={styles.bodyText}>
                No persisted site continuity profiles are currently available.
              </p>
            ) : (
              latestProfiles.map((item, index) => (
                <article
                  key={`${getProfileValue(item, 'createdAt') ?? 'profile'}-${index}`}
                  style={styles.profileCard}
                >
                  <p style={styles.metricLabel}>
                    {getProfileValue(item, 'continuityPosture') ?? 'SITE_PROFILE'}
                  </p>
                  <h3 style={styles.profileTitle}>
                    {getProfileValue(item, 'siteName') ?? 'Unnamed Site'}
                  </h3>
                  <p style={styles.profileDate}>
                    {formatDate(getProfileValue(item, 'createdAt'))}
                  </p>
                </article>
              ))
            )}
          </div>
        </Panel>

        <section style={styles.reportPanel}>
          <p style={styles.kicker}>COPY-READY CROSS-SITE BRIEF</p>
          <h2 style={styles.bigText}>
            Is instability isolated or becoming enterprise-wide?
          </h2>
          <pre style={styles.pre}>{doctrine.copyReadyBrief}</pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>ENTERPRISE CROSS-SITE DOCTRINE</strong>
          <span>
            Coordination synchronizes dependency. Cross-Site determines whether
            instability is isolated, repeated, shared, structural, or
            enterprise-wide. Local recovery must never hide enterprise fragility.
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
    background:
      'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))',
    boxShadow: '0 28px 80px rgba(0,0,0,0.38)',
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
    fontSize: 28,
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
  bigText: {
    margin: '14px 0',
    fontSize: 'clamp(1.55rem, 3vw, 2.7rem)',
    lineHeight: 1.05,
    letterSpacing: '-0.05em',
    fontWeight: 950,
  },
  panelTitle: {
    margin: '12px 0 0',
    fontSize: 26,
    lineHeight: 1.15,
    letterSpacing: '-0.045em',
  },
  bodyText: {
    margin: '10px 0 0',
    color: '#aeb6c2',
    lineHeight: 1.7,
    fontSize: 14,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 12,
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
  memoryPanel: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gap: 16,
    alignItems: 'center',
    padding: 28,
    borderRadius: 28,
    background:
      'linear-gradient(135deg, rgba(201,162,39,0.13), rgba(255,255,255,0.035))',
    border: '1px solid rgba(201,162,39,0.32)',
  },
  memoryActions: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  button: {
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
  siteMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    margin: '16px 0',
  },
  miniStat: {
    padding: 14,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  miniValue: {
    margin: '8px 0 0',
    color: '#fff',
    fontSize: 13,
    fontWeight: 850,
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 14,
    marginTop: 18,
  },
  profileCard: {
    padding: 18,
    borderRadius: 20,
    background: 'rgba(0,0,0,0.22)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  profileTitle: {
    margin: '10px 0 0',
    color: '#fff',
    fontSize: 18,
    lineHeight: 1.25,
  },
  profileDate: {
    margin: '8px 0 0',
    color: '#d7b84c',
    fontSize: 12,
    fontWeight: 850,
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