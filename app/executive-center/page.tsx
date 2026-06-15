'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIExecutiveContinuityChain } from '@/lib/cgiExecutiveContinuityChainEngine'
import {
  buildCopyReadyExecutiveBrief,
  buildEnterpriseContinuityReading,
  buildExecutiveSynthesis,
  buildRecoveryMemoryRecords,
  deriveDominantConcern,
} from '@/lib/cgiExecutiveMeaningDoctrineEngine'
import {
  cgiVisualStyles as v,
  mergeCGIStyles,
} from '@/lib/cgiVisualSystem'
import { supabase } from '../../lib/supabase'

type StabilityCase = {
  id: string
  beneficiary_name: string
  beneficiary_level: string | null
  support_domain: string
  case_status: string
  severity_level: string
  region: string | null
  institution_name: string | null
  safeguarding_flag: boolean
  intervention_summary: string | null
  outcome_summary: string | null
  created_at?: string | null
  updated_at?: string | null
}

type OutcomeRecord = {
  id: string
  case_id: string
  outcome_status: string | null
  outcome_summary: string | null
  created_at?: string | null
}

type CgiOperationalMetric = {
  id: string
  created_at: string
  executive_summary: string | null
  action_cue: string | null
  dominant_pressure_source: string | null
  dominant_trajectory_signal: string | null
  dominant_memory_pattern: string | null
}

const CASE_SAMPLE_LIMIT = 120
const METRIC_SAMPLE_LIMIT = 40

const DOCTRINE = [
  'Executive Center synthesizes; it does not close.',
  'Command is not closure.',
  'Recovery is not durability.',
  'Memory must survive stabilization.',
]

export default function ExecutiveCenterPage() {
  return (
    <GovernanceRouteGuard
      allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'GOVERNANCE_OFFICER']}
    >
      <CGIGovernanceShell>
        <ExecutiveCenterContent />
      </CGIGovernanceShell>
    </GovernanceRouteGuard>
  )
}

function ExecutiveCenterContent() {
  const [cases, setCases] = useState<StabilityCase[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([])
  const [metrics, setMetrics] = useState<CgiOperationalMetric[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadExecutiveCenter()
  }, [])

  async function loadExecutiveCenter() {
    setMessage('Loading executive continuity interpretation...')

    const [casesResult, outcomesResult, metricsResult] = await Promise.all([
      supabase
        .from('beneficiary_cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(CASE_SAMPLE_LIMIT),
      supabase
        .from('case_outcomes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(CASE_SAMPLE_LIMIT),
      supabase
        .from('cgi_operational_metrics')
        .select(
          'id, created_at, executive_summary, action_cue, dominant_pressure_source, dominant_trajectory_signal, dominant_memory_pattern',
        )
        .order('created_at', { ascending: false })
        .limit(METRIC_SAMPLE_LIMIT),
    ])

    if (casesResult.error) console.error(casesResult.error)
    if (outcomesResult.error) console.error(outcomesResult.error)
    if (metricsResult.error) console.error(metricsResult.error)

    if (casesResult.error || outcomesResult.error || metricsResult.error) {
      setMessage('Some executive continuity intelligence failed to load.')
      return
    }

    setCases(casesResult.data || [])
    setOutcomes(outcomesResult.data || [])
    setMetrics(metricsResult.data || [])
    setMessage('Executive continuity interpretation loaded.')
  }

  const recoveryMemory = useMemo(
    () => buildRecoveryMemoryRecords(cases, outcomes),
    [cases, outcomes],
  )

  const synthesis = useMemo(
    () => buildExecutiveSynthesis(cases, recoveryMemory, metrics),
    [cases, recoveryMemory, metrics],
  )

  const continuityChain = useMemo(
    () =>
      buildCGIExecutiveContinuityChain({
        activeInstability: synthesis.activeInstability,
        recoveryRecords: synthesis.recoveryRecords,
        fragileRecovery: synthesis.fragileRecovery,
        commandPressure: synthesis.commandPressure,
        evidenceReturn: synthesis.evidenceReturn,
        absorbable: synthesis.absorbable,
        historicalMemory: synthesis.historicalMemory,
        recurrenceVisible: synthesis.recurrenceVisible,
        coordinationPressure: synthesis.coordinationPressure,
        crossSitePressure: synthesis.crossSitePressure,
        auditPressure: synthesis.auditPressure,
        safeguardingVisible: synthesis.safeguardingVisible,
      }),
    [synthesis],
  )

  const enterpriseReading = useMemo(
    () => buildEnterpriseContinuityReading(synthesis, continuityChain),
    [synthesis, continuityChain],
  )

  const copyReadyExecutiveBrief = useMemo(
    () =>
      buildCopyReadyExecutiveBrief(
        synthesis,
        continuityChain,
        enterpriseReading,
      ),
    [synthesis, continuityChain, enterpriseReading],
  )

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <section style={styles.header}>
          <p style={styles.kicker}>TSINAXA CGI • EXECUTIVE CENTER</p>

          <h1 style={styles.title}>Enterprise Continuity Intelligence Center</h1>

          <p style={styles.subtitle}>
            Executive Center interprets recovery, command, coordination,
            cross-site exposure, evidence, audit meaning, survivability, and
            institutional memory into one continuity thesis.
          </p>
        </section>

        {message && <div style={styles.message}>{message}</div>}

        <section style={styles.heroCard}>
          <div>
            <p style={styles.sectionKicker}>Enterprise Continuity Thesis</p>
            <h2 style={styles.heroTitle}>{enterpriseReading.trustReading}</h2>
            <p style={styles.heroMeaning}>
              {enterpriseReading.continuityThesis}
            </p>
          </div>

          <div style={styles.questionBox}>
            <p style={styles.metricLabel}>CEO Sentence</p>
            <p style={styles.questionText}>{enterpriseReading.ceoSentence}</p>
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Executive Interpretation</p>

          <h2 style={styles.cardTitle}>
            What does the institution currently mean?
          </h2>

          <div style={styles.priorityGrid}>
            <PriorityItem
              title="Executive Decision"
              body={enterpriseReading.executiveDecision}
            />
            <PriorityItem
              title="Trust Level"
              body={enterpriseReading.trustLevel}
            />
            <PriorityItem
              title="Dominant Concern"
              body={deriveDominantConcern(synthesis)}
            />
            <PriorityItem
              title="Required Movement"
              body={enterpriseReading.requiredMovement}
            />
          </div>
        </section>

        <section style={styles.chainHero}>
          <div>
            <p style={styles.sectionKicker}>Executive Continuity Chain</p>
            <h2 style={styles.cardTitle}>
              Origin: {continuityChain.dominantOrigin}
            </h2>
            <p style={styles.bodyText}>{continuityChain.chainNarrative}</p>
          </div>

          <div style={styles.chainConfidenceBox}>
            <p style={styles.metricLabel}>Chain Confidence</p>
            <p style={styles.chainConfidence}>
              {continuityChain.chainConfidence}
            </p>
          </div>
        </section>

        <section style={styles.chainPath}>
          {continuityChain.continuityPath.map((step, index) => (
            <ChainStep
              key={`${step}-${index}`}
              label={`Step ${index + 1}`}
              value={step}
              active={step === 'Executive Center'}
            />
          ))}
        </section>

        <section style={styles.chainGrid}>
          <ChainPanel title="Executive Reason">
            {continuityChain.executiveReason}
          </ChainPanel>

          <ChainPanel title="Trust Question">
            {continuityChain.trustQuestion}
          </ChainPanel>

          <ChainPanel title="Next Required Movement">
            {continuityChain.nextRequiredMovement}
          </ChainPanel>

          <ChainPanel title="Audit Meaning">
            {continuityChain.auditMeaning}
          </ChainPanel>
        </section>

        <section style={styles.summaryGrid}>
          <MetricCard
            label="Active Instability"
            value={synthesis.activeInstability}
            body="Current lifecycle records still carrying instability."
          />
          <MetricCard
            label="Recovery Records"
            value={synthesis.recoveryRecords}
            body="Durability reviews available for executive interpretation."
          />
          <MetricCard
            label="Command Pressure"
            value={synthesis.commandPressure}
            body="Records requiring command watch or escalation."
          />
          <MetricCard
            label="Cross-Site Pressure"
            value={synthesis.crossSitePressure}
            body="Signals no longer isolated to one operational lane."
          />
        </section>

        <section style={styles.memoryCard}>
          <div>
            <p style={styles.sectionKicker}>Institutional Memory</p>
            <h2 style={styles.cardTitle}>{synthesis.memoryStatus}</h2>
            <p style={styles.bodyText}>
              {enterpriseReading.institutionalMeaning}
            </p>
          </div>

          <div style={styles.memoryGrid}>
            <MemoryMetric label="Evidence" value={synthesis.evidenceStatus} />
            <MemoryMetric
              label="Recovery"
              value={synthesis.recoveryCredibility}
            />
            <MemoryMetric
              label="Survivability"
              value={synthesis.survivabilityMeaning}
            />
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Executive Meaning</p>

          <h2 style={styles.cardTitle}>
            What must leadership understand before the posture moves?
          </h2>

          <div style={styles.priorityGrid}>
            <PriorityItem
              title="What Is Visible"
              body={enterpriseReading.whatIsVisible}
            />
            <PriorityItem
              title="Why It Matters"
              body={enterpriseReading.whyItMatters}
            />
            <PriorityItem
              title="Continuity Risk"
              body={enterpriseReading.continuityRisk}
            />
            <PriorityItem
              title="Leadership Understanding"
              body={enterpriseReading.executiveDecision}
            />
          </div>
        </section>

        {recoveryMemory.length > 0 && (
          <section style={styles.card}>
            <p style={styles.sectionKicker}>Recovery-to-Executive Synthesis</p>

            <h2 style={styles.cardTitle}>
              Recovery evidence remains visible before institutional confidence
              is restored.
            </h2>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Disposition</th>
                    <th style={styles.th}>Durability</th>
                    <th style={styles.th}>Memory Impact</th>
                  </tr>
                </thead>

                <tbody>
                  {recoveryMemory.slice(0, 8).map((record) => (
                    <tr
                      key={`${record.caseItem.id}-${
                        record.latestRecoveryReview?.id || 'case'
                      }`}
                    >
                      <td style={styles.td}>{record.disposition}</td>
                      <td style={styles.td}>{record.durabilityResult}</td>
                      <td style={styles.td}>{record.memoryImpact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section style={styles.briefCard}>
          <p style={styles.sectionKicker}>Copy-Ready CEO Brief</p>

          <h2 style={styles.cardTitle}>
            One institutional interpretation across pressure, recovery,
            evidence, command, coordination, cross-site exposure, audit, memory,
            and survivability meaning.
          </h2>

          <pre style={styles.summaryBox}>{copyReadyExecutiveBrief}</pre>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Historical Memory Trail</p>

          <h2 style={styles.cardTitle}>
            Historical continuity memory remains preserved without driving the
            current posture.
          </h2>

          {metrics.length === 0 ? (
            <div style={styles.emptyState}>
              No historical continuity metric records are currently available.
            </div>
          ) : (
            <div style={styles.metricMemoryList}>
              {metrics.slice(0, 4).map((item) => (
                <article key={item.id} style={styles.memoryTrailItem}>
                  <div>
                    <p style={styles.metricLabel}>
                      {formatDate(item.created_at)}
                    </p>
                    <h3 style={styles.memoryTrailTitle}>
                      {item.executive_summary ||
                        'No executive memory summary recorded'}
                    </h3>
                  </div>

                  <p style={styles.panelBody}>
                    {item.dominant_memory_pattern ||
                      item.dominant_trajectory_signal ||
                      item.dominant_pressure_source ||
                      'No dominant memory pattern recorded.'}
                  </p>
                </article>
              ))}
            </div>
          )}

          <button onClick={loadExecutiveCenter} style={styles.primaryButton}>
            Refresh Executive Center
          </button>
        </section>

        <section style={styles.doctrinePanel}>
          <p style={styles.doctrineTitle}>EXECUTIVE CENTER DOCTRINE</p>

          <div style={styles.doctrineGrid}>
            {DOCTRINE.map((item) => (
              <div key={item} style={styles.doctrineCard}>
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

function ChainStep({
  label,
  value,
  active,
}: {
  label: string
  value: string
  active?: boolean
}) {
  return (
    <article
      style={mergeCGIStyles(
        styles.chainStep,
        active && styles.chainStepActive,
      )}
    >
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.chainStepValue}>{value}</p>
    </article>
  )
}

function ChainPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <article style={styles.chainPanelCard}>
      <p style={styles.panelKicker}>{title}</p>
      <p style={styles.panelBody}>{children}</p>
    </article>
  )
}

function MetricCard({
  label,
  value,
  body,
}: {
  label: string
  value: number
  body: string
}) {
  return (
    <article style={styles.metricCard}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.metricValue}>{value}</p>
      <p style={styles.panelBody}>{body}</p>
    </article>
  )
}

function MemoryMetric({ label, value }: { label: string; value: string }) {
  return (
    <article style={styles.memoryMetric}>
      <p style={styles.metricLabel}>{label}</p>
      <p style={styles.memoryMetricValue}>{value}</p>
    </article>
  )
}

function PriorityItem({ title, body }: { title: string; body: string }) {
  return (
    <article style={styles.priorityItem}>
      <p style={styles.panelKicker}>{title}</p>
      <p style={styles.priorityBody}>{body}</p>
    </article>
  )
}

const styles: Record<string, CSSProperties> = {
  page: v.page,
  container: v.executivePageStack,

  header: {
    marginBottom: 2,
  },
  kicker: v.kicker,
  title: v.pageTitle,
  subtitle: v.subtitle,

  message: v.message,

  heroCard: v.executiveHeroSplit,
  heroTitle: v.executiveTitle,
  heroMeaning: v.executiveBodyText,
  questionBox: v.executiveQuestionCard,
  questionText: {
    color: '#fff8e7',
    fontSize: 22,
    lineHeight: 1.25,
    margin: '10px 0 0',
    fontWeight: 900,
  },

  card: v.darkPanel,
  briefCard: v.briefPanel,
  cardTitle: v.executivePanelTitle,
  bodyText: v.executiveBodyText,

  sectionKicker: v.sectionKicker,
  priorityGrid: v.gridFour,
  priorityItem: v.goldCard,
  priorityBody: {
    color: '#fff8e7',
    lineHeight: 1.5,
    fontSize: 12,
    margin: '8px 0 0',
    fontWeight: 700,
  },

  chainHero: v.executiveHeroSplit,
  chainConfidenceBox: v.executiveQuestionCard,
  chainConfidence: v.executiveMetricValue,

  chainPath: v.executiveChainPath,
  chainStep: v.quietCard,
  chainStepActive: v.goldCard,
  chainStepValue: {
    color: '#fff8e7',
    fontSize: 13,
    lineHeight: 1.3,
    fontWeight: 900,
    margin: '8px 0 0',
  },
  chainGrid: v.gridFour,
  chainPanelCard: v.quietCard,

  panelKicker: v.sectionKicker,
  panelBody: {
    color: '#cfc7b5',
    fontSize: 13,
    lineHeight: 1.6,
    marginTop: 10,
  },

  summaryGrid: v.executiveMetricStrip,
  metricCard: v.executiveMetricCard,
  metricLabel: v.metricLabel,
  metricValue: v.executiveMetricValue,

  memoryCard: v.memoryPanel,
  memoryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 14,
  },
  memoryMetric: v.goldCard,
  memoryMetricValue: {
    color: '#fff8e7',
    fontSize: 14,
    lineHeight: 1.35,
    fontWeight: 900,
    margin: '8px 0 0',
  },

  tableWrap: v.tableWrap,
  table: v.table,
  th: v.th,
  td: v.td,

  summaryBox: v.executiveSummaryBox,

  emptyState: v.emptyState,
  metricMemoryList: {
    display: 'grid',
    gap: 12,
    marginTop: 18,
  },
  memoryTrailItem: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)',
    gap: 16,
    padding: 18,
    borderRadius: 18,
    background: 'rgba(0,0,0,0.28)',
    border: '1px solid rgba(214,178,94,0.16)',
  },
  memoryTrailTitle: {
    color: '#fff8e7',
    fontSize: 15,
    lineHeight: 1.4,
    margin: '8px 0 0',
  },

  primaryButton: mergeCGIStyles(v.primaryButton, {
    width: '100%',
    borderRadius: 14,
    marginTop: 18,
  }),

  doctrinePanel: v.doctrinePanel,
  doctrineTitle: v.sectionKicker,
  doctrineGrid: v.gridFour,
  doctrineCard: mergeCGIStyles(v.goldCard, {
    color: '#fff8e7',
    fontSize: 12,
    lineHeight: 1.45,
    fontWeight: 800,
  }),
}