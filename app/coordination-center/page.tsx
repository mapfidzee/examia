'use client'

import { useEffect, useState } from 'react'
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
import {
  loadCGICoordinationReviews,
  saveCGICoordinationReview,
} from '@/lib/cgiPersistenceEngine'
import type { CGIRouteSynthesisPosture } from '@/lib/cgiCrossRouteContinuitySynthesisEngine'

type CoordinationSite = {
  name: string
  region: string
  coordinationNeed: 'ROUTINE' | 'ACTIVE' | 'EXECUTIVE'
  pressurePosture: CGIRouteSynthesisPosture
  trajectoryPosture: CGIRouteSynthesisPosture
  predictivePosture: CGIRouteSynthesisPosture
  recoveryPosture: CGIRouteSynthesisPosture
  reliabilityPosture: CGIRouteSynthesisPosture
  evidenceVerified: boolean
  accountabilityActive: boolean
  structuralMemoryVisible: boolean
}

type PersistedCoordinationReview = Record<string, any>

const coordinationSites: CoordinationSite[] = [
  {
    name: 'North Unit',
    region: 'Primary Operations',
    coordinationNeed: 'ACTIVE',
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
    name: 'South Unit',
    region: 'Secondary Operations',
    coordinationNeed: 'ROUTINE',
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
    name: 'East Unit',
    region: 'High Demand Operations',
    coordinationNeed: 'EXECUTIVE',
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

function strongestCoordinationSite(sites: CoordinationSite[]) {
  return [...sites].sort((a, b) => {
    const aBriefing = buildCGIExecutiveBriefing(a)
    const bBriefing = buildCGIExecutiveBriefing(b)

    return (
      postureWeight[bBriefing.synthesis.synthesisPosture] -
      postureWeight[aBriefing.synthesis.synthesisPosture]
    )
  })[0]
}

export default function CoordinationCenterPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={[
        'SUPER_ADMIN',
        'COMMAND_ADMIN',
        'GOVERNANCE_OFFICER',
      ]}
    >
      <CGIGovernanceShell>
        <CoordinationCenterContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function CoordinationCenterContent() {
  const [saveMessage, setSaveMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [reviews, setReviews] = useState<PersistedCoordinationReview[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [reviewMessage, setReviewMessage] = useState('')

  const siteBriefings = coordinationSites.map((site) => ({
    site,
    briefing: buildCGIExecutiveBriefing(site),
  }))

  const dominantSite = strongestCoordinationSite(coordinationSites)
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

  const executiveCoordinationCount = coordinationSites.filter(
    (site) => site.coordinationNeed === 'EXECUTIVE'
  ).length

  const activeCoordinationCount = coordinationSites.filter(
    (site) => site.coordinationNeed === 'ACTIVE'
  ).length

  const structuralMemoryCount = coordinationSites.filter(
    (site) => site.structuralMemoryVisible
  ).length

  const coordinationScope = `${coordinationSites.length} sites reviewed • ${executiveCoordinationCount} executive • ${activeCoordinationCount} active`

  async function loadCoordinationReviews() {
    try {
      setLoadingReviews(true)
      setReviewMessage('Loading persisted coordination reviews...')

      const loadedReviews = await loadCGICoordinationReviews()

      setReviews(Array.isArray(loadedReviews) ? loadedReviews : [])
      setReviewMessage('Coordination review archive loaded.')
    } catch (error) {
      console.error(error)
      setReviewMessage('Coordination review archive could not be loaded.')
    } finally {
      setLoadingReviews(false)
    }
  }

  useEffect(() => {
    loadCoordinationReviews()
  }, [])

  async function handleSaveCoordinationReview() {
    try {
      setSaving(true)
      setSaveMessage('Saving coordination review...')

      await saveCGICoordinationReview({
        reviewTitle: 'Executive Continuity Coordination Center',
        coordinationScope,
        dominantSiteName: dominantSite.name,
        coordinationPosture: dominantBriefing.synthesis.synthesisPosture,
        executiveCoordinationCount,
        activeCoordinationCount,
        structuralMemoryCount,
        coordinationReading: dominantBriefing.executiveSummary,
        requiredAction: executivePosture.actionLanguage,
        requiredEvidence: evidenceLanguage,
        rawPayload: {
          dominantSite,
          dominantBriefing,
          siteBriefings,
          executiveCoordinationCount,
          activeCoordinationCount,
          structuralMemoryCount,
          savedFrom: '/coordination-center',
        },
      })

      setSaveMessage('Coordination review saved.')
      await loadCoordinationReviews()
    } catch (error) {
      console.error(error)
      setSaveMessage('Coordination review could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <InfrastructureNav />

        <section style={styles.header}>
          <p style={styles.kicker}>
            TSINAXA CGI • COORDINATION CENTER
          </p>

          <h1 style={styles.title}>
            Executive Continuity Coordination Center
          </h1>

          <p style={styles.subtitle}>
            Enterprise coordination visibility for sites requiring executive
            synchronization, survivability protection, stabilization ownership,
            and cross-site continuity governance.
          </p>
        </section>

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>
              Enterprise Coordination Reading
            </p>

            <h2 style={styles.heroTitle}>{executivePosture.label}</h2>

            <p style={styles.heroMeaning}>
              {dominantBriefing.executiveSummary}
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>Coordination Priority</p>

            <p style={styles.statusValue}>{dominantSite.name}</p>
          </div>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Persistence Action</p>

            <h2 style={styles.actionTitle}>
              Preserve this coordination review as continuity memory.
            </h2>

            <p style={styles.actionText}>
              Saving the coordination review creates a durable record of
              synchronization need, executive coordination pressure, evidence
              requirements, and cross-site continuity exposure.
            </p>

            {saveMessage && <p style={styles.saveMessage}>{saveMessage}</p>}
          </div>

          <button
            type="button"
            onClick={handleSaveCoordinationReview}
            disabled={saving}
            style={{
              ...styles.primaryButton,
              ...(saving ? styles.disabledButton : {}),
            }}
          >
            {saving ? 'Saving...' : 'Save Coordination Review'}
          </button>
        </section>

        <section style={styles.actionPanel}>
          <div>
            <p style={styles.sectionKicker}>Coordination Memory Retrieval</p>

            <h2 style={styles.actionTitle}>
              Retrieve persisted coordination reviews.
            </h2>

            <p style={styles.actionText}>
              CGI can now reconstruct cross-site synchronization posture,
              executive coordination need, required evidence, and coordination
              exposure across time.
            </p>

            {reviewMessage && (
              <p style={styles.saveMessage}>{reviewMessage}</p>
            )}
          </div>

          <button
            type="button"
            onClick={loadCoordinationReviews}
            disabled={loadingReviews}
            style={{
              ...styles.secondaryButton,
              ...(loadingReviews ? styles.disabledButton : {}),
            }}
          >
            {loadingReviews ? 'Refreshing...' : 'Refresh Reviews'}
          </button>
        </section>

        <section style={styles.gridThree}>
          <SignalCard
            title="Executive Coordination"
            value={String(executiveCoordinationCount)}
            body="Sites requiring direct executive synchronization before continuity can be trusted."
          />

          <SignalCard
            title="Active Coordination"
            value={String(activeCoordinationCount)}
            body="Sites requiring active coordination oversight, evidence follow-up, or stabilization review."
          />

          <SignalCard
            title="Structural Memory"
            value={String(structuralMemoryCount)}
            body="Sites where prior instability remains relevant to current continuity governance."
          />
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Coordination Action Posture</p>

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
          <p style={styles.sectionKicker}>Persisted Coordination Archive</p>

          <h2 style={styles.cardTitle}>
            Coordination reviews retrieved from Supabase.
          </h2>

          <p style={styles.bodyText}>
            Review Count: {reviews.length}
          </p>

          <div style={styles.archiveList}>
            {reviews.length === 0 ? (
              <p style={styles.emptyText}>
                No persisted coordination reviews are currently available.
              </p>
            ) : (
              reviews.map((item, index) => (
                <article
                  key={item.id ?? `${getReviewValue(item, 'createdAt')}-${index}`}
                  style={styles.archiveItem}
                >
                  <div style={styles.archiveHeader}>
                    <div>
                      <p style={styles.panelKicker}>
                        {getReviewValue(item, 'coordinationPosture') ??
                          'COORDINATION_REVIEW'}
                      </p>

                      <h3 style={styles.archiveTitle}>
                        {getReviewValue(item, 'reviewTitle') ??
                          'Executive Continuity Coordination Center'}
                      </h3>
                    </div>

                    <p style={styles.archiveDate}>
                      {formatDate(getReviewValue(item, 'createdAt'))}
                    </p>
                  </div>

                  <div style={styles.archiveGrid}>
                    <PriorityItem
                      title="Scope"
                      body={
                        getReviewValue(item, 'coordinationScope') ??
                        'Not recorded'
                      }
                    />

                    <PriorityItem
                      title="Executive Coordination"
                      body={
                        getReviewValue(
                          item,
                          'executiveCoordinationCount'
                        ) ?? '0'
                      }
                    />

                    <PriorityItem
                      title="Structural Memory"
                      body={
                        getReviewValue(item, 'structuralMemoryCount') ??
                        '0'
                      }
                    />
                  </div>

                  <p style={styles.archiveSummary}>
                    {getReviewValue(item, 'coordinationReading') ??
                      'No coordination reading was recorded for this review.'}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Coordination Board</p>

          <h2 style={styles.cardTitle}>
            Enterprise coordination must follow continuity exposure.
          </h2>

          <div style={styles.siteList}>
            {siteBriefings.map(({ site, briefing }) => (
              <article key={site.name} style={styles.siteCard}>
                <div>
                  <p style={styles.siteRegion}>{site.region}</p>

                  <h3 style={styles.siteTitle}>{site.name}</h3>

                  <p style={styles.siteMeaning}>
                    {briefing.executiveSummary}
                  </p>
                </div>

                <div style={styles.siteStatus}>
                  <p style={styles.statusLabel}>Need</p>

                  <p style={styles.sitePosture}>
                    {site.coordinationNeed}
                  </p>

                  <p style={styles.siteMeta}>
                    {briefing.synthesis.synthesisPosture}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Coordination Doctrine">
            CGI coordination does not route blame. It identifies where
            continuity exposure requires synchronized leadership attention,
            stabilization ownership, and verified evidence before confidence
            improves.
          </Panel>

          <Panel title="Enterprise Stabilization Logic">
            Coordination becomes executive-relevant when pressure, trajectory,
            recovery credibility, and trustworthiness concerns concentrate
            across one or more continuity environments.
          </Panel>
        </section>
      </div>
    </main>
  )
}

function getReviewValue(
  review: PersistedCoordinationReview,
  key: string,
): string | null {
  const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

  const value =
    review[key] ??
    review[snakeKey] ??
    review.rawPayload?.[key] ??
    review.raw_payload?.[key] ??
    null

  if (value === null || value === undefined) {
    return null
  }

  return String(value)
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Date not recorded'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
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
    gridTemplateColumns: 'minmax(0, 1fr) minmax(170px, 0.25fr)',
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
  siteMeta: {
    color: '#a5f3fc',
    fontSize: '13px',
    fontWeight: 900,
    margin: '10px 0 0',
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