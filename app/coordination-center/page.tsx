'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGICoordinationCenterDoctrine } from '@/lib/cgiCoordinationCenterDoctrineEngine'
import {
  loadCGICoordinationReviews,
  saveCGICoordinationReview,
} from '@/lib/cgiPersistenceEngine'

type PersistedCoordinationReview = Record<string, unknown>

export default function CoordinationCenterPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
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

  const coordination = useMemo(() => buildCGICoordinationCenterDoctrine(), [])
  const latestReviews = reviews.slice(0, 3)

  useEffect(() => {
    loadCoordinationReviews()
  }, [])

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

  async function handleSaveCoordinationReview() {
    try {
      setSaving(true)
      setSaveMessage('Saving coordination review...')

      await saveCGICoordinationReview({
        reviewTitle: 'Executive Continuity Coordination Center',
        coordinationScope: coordination.coordinationScope,
        dominantSiteName: coordination.dominantSite.name,
        coordinationPosture:
          coordination.dominantBriefing.synthesis.synthesisPosture,
        executiveCoordinationCount: coordination.executiveCoordinationCount,
        activeCoordinationCount: coordination.activeCoordinationCount,
        structuralMemoryCount: coordination.structuralMemoryCount,
        coordinationReading: coordination.dominantBriefing.executiveSummary,
        requiredAction: coordination.executivePosture.actionLanguage,
        requiredEvidence: coordination.evidenceLanguage,
        rawPayload: {
          dominantSite: coordination.dominantSite,
          dominantBriefing: coordination.dominantBriefing,
          siteBriefings: coordination.siteBriefings,
          executiveCoordinationCount: coordination.executiveCoordinationCount,
          activeCoordinationCount: coordination.activeCoordinationCount,
          structuralMemoryCount: coordination.structuralMemoryCount,
          coordinationQuestion: coordination.coordinationQuestion,
          coordinationThesis: coordination.coordinationThesis,
          coordinationDoctrine: coordination.coordinationDoctrine,
          stabilizationLogic: coordination.stabilizationLogic,
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
        <section style={styles.hero}>
          <div>
            <p style={styles.kicker}>TSINAXA CGI • COORDINATION CENTER</p>
            <h1 style={styles.title}>
              Executive Continuity Coordination Center
            </h1>
            <p style={styles.subtitle}>
              Coordination Center identifies what must synchronize before
              continuity can safely move.
            </p>
          </div>

          <div style={styles.statusBox}>
            <p style={styles.statusLabel}>COORDINATION PRIORITY</p>
            <p style={styles.statusValue}>{coordination.dominantSite.name}</p>
            <p style={styles.statusMeaning}>
              {coordination.executivePosture.label}
            </p>
          </div>
        </section>

        {(saveMessage || reviewMessage) && (
          <div style={styles.message}>{saveMessage || reviewMessage}</div>
        )}

        <section style={styles.gridTwo}>
          <Panel title="Executive Coordination Question">
            <h2 style={styles.bigText}>{coordination.coordinationQuestion}</h2>
            <p style={styles.bodyText}>
              {coordination.dominantBriefing.executiveSummary}
            </p>
          </Panel>

          <Panel title="Coordination Conclusion">
            <h2 style={styles.bigText}>
              {coordination.executivePosture.headline}
            </h2>
            <p style={styles.bodyText}>
              {coordination.executivePosture.actionLanguage}
            </p>
          </Panel>
        </section>

        <section style={styles.metricGrid}>
          <Metric
            label="Executive Coordination"
            value={coordination.executiveCoordinationCount}
          />
          <Metric
            label="Active Coordination"
            value={coordination.activeCoordinationCount}
          />
          <Metric
            label="Structural Memory"
            value={coordination.structuralMemoryCount}
          />
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Required Movement">
            <Info
              label="Required Action"
              value={coordination.executivePosture.actionLanguage}
            />
            <Info label="Required Evidence" value={coordination.evidenceLanguage} />
            <Info
              label="Dominant Site"
              value={coordination.dominantSite.name}
            />
          </Panel>

          <Panel title="Continuity Standard">
            <Info label="Evidence" value={coordination.evidenceLanguage} />
            <Info
              label="Survivability"
              value={coordination.survivabilityLanguage}
            />
            <Info
              label="Governance Meaning"
              value={coordination.governanceLanguage}
            />
          </Panel>
        </section>

        <Panel title="Coordination Implications">
          <div style={styles.infoGrid}>
            <Info
              label="Scope"
              value={coordination.coordinationScope}
            />
            <Info
              label="Posture"
              value={coordination.dominantBriefing.synthesis.synthesisPosture}
            />
            <Info
              label="Doctrine"
              value={coordination.coordinationDoctrine}
            />
            <Info
              label="Stabilization Logic"
              value={coordination.stabilizationLogic}
            />
          </div>
        </Panel>

        <section style={styles.memoryPanel}>
          <div>
            <p style={styles.kicker}>Coordination Memory</p>
            <h2 style={styles.panelTitle}>
              Preserve and retrieve coordination reviews.
            </h2>
            <p style={styles.bodyText}>
              Coordination memory keeps executive synchronization need,
              required evidence, and continuity exposure reconstructable.
            </p>
          </div>

          <div style={styles.memoryActions}>
            <button
              type="button"
              onClick={handleSaveCoordinationReview}
              disabled={saving}
              style={{
                ...styles.button,
                ...(saving ? styles.disabledButton : {}),
              }}
            >
              {saving ? 'Saving...' : 'Save Review'}
            </button>

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
          </div>
        </section>

        <section style={styles.gridThree}>
          {coordination.siteBriefings.map(({ site, briefing }) => (
            <article key={site.name} style={styles.siteCard}>
              <p style={styles.kicker}>{site.region}</p>
              <h3 style={styles.cardValue}>{site.name}</h3>

              <div style={styles.siteMeta}>
                <MiniStat label="Need" value={site.coordinationNeed} />
                <MiniStat
                  label="Posture"
                  value={briefing.synthesis.synthesisPosture}
                />
              </div>

              <p style={styles.bodyText}>{briefing.executiveSummary}</p>
            </article>
          ))}
        </section>

        <Panel title="Recent Coordination Memory">
          <p style={styles.bodyText}>Review Count: {reviews.length}</p>

          <div style={styles.profileGrid}>
            {latestReviews.length === 0 ? (
              <p style={styles.bodyText}>
                No persisted coordination reviews are currently available.
              </p>
            ) : (
              latestReviews.map((item, index) => (
                <article
                  key={item.id ? String(item.id) : `${getReviewValue(item, 'createdAt')}-${index}`}
                  style={styles.profileCard}
                >
                  <p style={styles.metricLabel}>
                    {getReviewValue(item, 'coordinationPosture') ??
                      'COORDINATION_REVIEW'}
                  </p>

                  <h3 style={styles.profileTitle}>
                    {getReviewValue(item, 'reviewTitle') ??
                      'Executive Coordination Review'}
                  </h3>

                  <p style={styles.profileDate}>
                    {formatDate(getReviewValue(item, 'createdAt'))}
                  </p>
                </article>
              ))
            )}
          </div>
        </Panel>

        <section style={styles.reportPanel}>
          <p style={styles.kicker}>COPY-READY COORDINATION BRIEF</p>
          <h2 style={styles.bigText}>
            Coordination must remain executive-readable, evidence-bound, and
            reconstructable.
          </h2>
          <pre style={styles.pre}>{coordination.copyReadyCoordinationBrief}</pre>
        </section>

        <section style={styles.doctrineCard}>
          <strong>COORDINATION CENTER DOCTRINE</strong>
          <span>
            CGI coordination does not route blame. It identifies where
            continuity exposure requires synchronized leadership attention,
            stabilization ownership, evidence verification, structural memory,
            and cross-site visibility before confidence improves.
          </span>
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

  const rawPayload = getNestedRecord(review, 'rawPayload')
  const rawPayloadSnake = getNestedRecord(review, 'raw_payload')

  const value =
    review[key] ??
    review[snakeKey] ??
    rawPayload?.[key] ??
    rawPayloadSnake?.[key] ??
    null

  if (value === null || value === undefined) return null
  return String(value)
}

function getNestedRecord(
  value: PersistedCoordinationReview,
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
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
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
  cardValue: {
    margin: '12px 0 0',
    color: '#fff',
    fontSize: 19,
    lineHeight: 1.25,
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