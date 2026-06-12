'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import GovernanceRouteGuard from '@/components/GovernanceRouteGuard'
import CGIGovernanceShell from '@/components/cgi-shell/CGIGovernanceShell'
import { buildCGIExecutiveContinuityChain } from '@/lib/cgiExecutiveContinuityChainEngine'
import { buildCGIExecutiveDeltaReading } from '@/lib/cgiExecutiveDeltaEngine'
import {
  buildCopyReadyExecutiveBrief,
  buildEnterpriseContinuityReading,
  buildExecutiveSynthesis,
  buildRecoveryMemoryRecords,
  deriveDominantConcern,
} from '@/lib/cgiExecutiveMeaningDoctrineEngine'
import { buildCGIExecutiveRecommendation } from '@/lib/cgiExecutiveRecommendationEngine'
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
    setMessage('Loading executive continuity synthesis...')

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
    setMessage('Executive continuity synthesis loaded.')
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

  const executiveDelta = useMemo(
    () =>
      buildCGIExecutiveDeltaReading({
        current: {
          activeInstability: synthesis.activeInstability,
          recoveryRecords: synthesis.recoveryRecords,
          commandPressure: synthesis.commandPressure,
          historicalMemory: synthesis.historicalMemory,
          coordinationPressure: synthesis.coordinationPressure,
          crossSitePressure: synthesis.crossSitePressure,
          auditPressure: synthesis.auditPressure,
          safeguardingVisible: synthesis.safeguardingVisible,
          recurrenceVisible: synthesis.recurrenceVisible,
          fragileRecovery: synthesis.fragileRecovery,
        },
        previous: null,
      }),
    [synthesis],
  )

  const executiveRecommendation = useMemo(
    () =>
      buildCGIExecutiveRecommendation({
        activeInstability: synthesis.activeInstability,
        commandPressure: synthesis.commandPressure,
        recoveryRecords: synthesis.recoveryRecords,
        fragileRecovery: synthesis.fragileRecovery,
        recurrenceVisible: synthesis.recurrenceVisible,
        coordinationPressure: synthesis.coordinationPressure,
        crossSitePressure: synthesis.crossSitePressure,
        auditPressure: synthesis.auditPressure,
        safeguardingVisible: synthesis.safeguardingVisible,
        evidenceReturn: synthesis.evidenceReturn,
        historicalMemory: synthesis.historicalMemory,
        trustLevel: enterpriseReading.trustLevel,
        executiveDecision: enterpriseReading.executiveDecision,
        currentReading: executiveDelta.currentReading,
        deltaDirection: executiveDelta.direction,
        deltaConfidence: executiveDelta.confidence,
        topThreat: executiveDelta.threatStack[0],
      }),
    [synthesis, enterpriseReading, executiveDelta],
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

          <h1 style={styles.title}>
            Enterprise Continuity Intelligence Center
          </h1>

          <p style={styles.subtitle}>
            Apex leadership interpretation layer for converting recovery,
            command, coordination, cross-site exposure, situation posture,
            evidence, audit meaning, executive delta, recommendation, and
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

        <section style={styles.deltaPanel}>
          <div>
            <p style={styles.sectionKicker}>Executive Delta Intelligence</p>
            <h2 style={styles.cardTitle}>{executiveDelta.executiveChange}</h2>
            <p style={styles.bodyText}>{executiveDelta.boardSentence}</p>
          </div>

          <div style={styles.deltaMetricGrid}>
            <MemoryMetric
              label="Previous Reading"
              value={executiveDelta.previousReading}
            />
            <MemoryMetric
              label="Current Reading"
              value={executiveDelta.currentReading}
            />
            <MemoryMetric label="Direction" value={executiveDelta.direction} />
            <MemoryMetric
              label="Confidence"
              value={executiveDelta.confidence}
            />
          </div>

          <div style={styles.deltaExplanationGrid}>
            <PriorityItem
              title="Why It Changed"
              body={executiveDelta.whyItChanged}
            />
            <PriorityItem
              title="What Improved"
              body={executiveDelta.whatImproved}
            />
            <PriorityItem
              title="What Worsened"
              body={executiveDelta.whatWorsened}
            />
            <PriorityItem
              title="What Could Break It Again"
              body={executiveDelta.whatCouldBreakItAgain}
            />
          </div>

          <div style={styles.threatStack}>
            <p style={styles.metricLabel}>Institutional Threat Stack</p>

            <div style={styles.threatStackGrid}>
              {executiveDelta.threatStack.map((threat, index) => (
                <article key={`${threat}-${index}`} style={styles.threatCard}>
                  <span style={styles.threatNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span style={styles.threatText}>{threat}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.recommendationPanel}>
          <div>
            <p style={styles.sectionKicker}>Executive Recommendation</p>
            <h2 style={styles.cardTitle}>
              {executiveRecommendation.recommendation}
            </h2>
            <p style={styles.bodyText}>
              {executiveRecommendation.boardSentence}
            </p>
          </div>

          <div style={styles.recommendationMetricGrid}>
            <MemoryMetric
              label="Posture"
              value={executiveRecommendation.posture}
            />
            <MemoryMetric
              label="Urgency"
              value={executiveRecommendation.urgency}
            />
            <MemoryMetric
              label="Required Owner"
              value={executiveRecommendation.requiredOwner}
            />
            <MemoryMetric
              label="Next Move"
              value={executiveRecommendation.nextExecutiveMove}
            />
          </div>

          <div style={styles.recommendationGrid}>
            <PriorityItem
              title="Rationale"
              body={executiveRecommendation.rationale}
            />
            <PriorityItem
              title="Consequence Of Delay"
              body={executiveRecommendation.consequenceOfDelay}
            />
            <PriorityItem
              title="Required Evidence"
              body={executiveRecommendation.requiredEvidence}
            />
          </div>
        </section>

        <section style={styles.apexCard}>
          <div>
            <p style={styles.sectionKicker}>Executive Decision Layer</p>
            <h2 style={styles.cardTitle}>
              {enterpriseReading.stabilityThesis}
            </h2>
            <p style={styles.bodyText}>
              {enterpriseReading.finalInterpretation}
            </p>
          </div>

          <div style={styles.apexStack}>
            <MemoryMetric
              label="Executive Decision"
              value={enterpriseReading.executiveDecision}
            />
            <MemoryMetric
              label="Trust Level"
              value={enterpriseReading.trustLevel}
            />
            <MemoryMetric
              label="Primary Vulnerability"
              value={enterpriseReading.primaryVulnerability}
            />
            <MemoryMetric
              label="Secondary Vulnerability"
              value={enterpriseReading.secondaryVulnerability}
            />
          </div>
        </section>

        <section style={styles.postureCard}>
          <p style={styles.sectionKicker}>Executive Action Posture</p>

          <h2 style={styles.cardTitle}>{synthesis.posture}</h2>

          <p style={styles.bodyText}>{enterpriseReading.executiveDecision}</p>

          <div style={styles.priorityGrid}>
            <PriorityItem
              title="Dominant Concern"
              body={deriveDominantConcern(synthesis)}
            />
            <PriorityItem
              title="Evidence Meaning"
              body={synthesis.evidenceStatus}
            />
            <PriorityItem
              title="Governance Meaning"
              body="Leadership visibility must remain proportional, non-punitive, evidence-aware, chain-aware, and memory-preserving."
            />
          </div>
        </section>

        <section style={styles.trustPanel}>
          <div>
            <p style={styles.sectionKicker}>Trust Question</p>
            <h2 style={styles.cardTitle}>{enterpriseReading.trustReading}</h2>
            <p style={styles.bodyText}>{enterpriseReading.trustMeaning}</p>
          </div>

          <div style={styles.questionBox}>
            <p style={styles.metricLabel}>Board-Level Warning</p>
            <p style={styles.questionText}>
              {enterpriseReading.boardLevelWarning}
            </p>
          </div>
        </section>

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Required Movement</p>

          <h2 style={styles.cardTitle}>
            Executive Center derives meaning through the CGI doctrine layer.
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
              title="Required Movement"
              body={enterpriseReading.requiredMovement}
            />
            <PriorityItem
              title="Trust Level"
              body={enterpriseReading.trustLevel}
            />
            <PriorityItem
              title="Institutional Meaning"
              body={enterpriseReading.institutionalMeaning}
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
            body="Durability reviews available for executive synthesis."
          />
          <MetricCard
            label="Command Pressure"
            value={synthesis.commandPressure}
            body="Records requiring command watch or escalation."
          />
          <MetricCard
            label="Memory Records"
            value={synthesis.historicalMemory}
            body="Continuity memory preserved for institutional learning."
          />
        </section>

        <section style={styles.summaryGrid}>
          <MetricCard
            label="Coordination Pressure"
            value={synthesis.coordinationPressure}
            body="Ownership, routing, responder, or institutional synchronization pressure."
          />
          <MetricCard
            label="Cross-Site Pressure"
            value={synthesis.crossSitePressure}
            body="Signals that may no longer be isolated to one operational lane."
          />
          <MetricCard
            label="Audit Pressure"
            value={synthesis.auditPressure}
            body="Records requiring reconstructable executive interpretation."
          />
          <MetricCard
            label="Safeguarding"
            value={synthesis.safeguardingVisible}
            body="Safeguarding-visible records requiring careful executive visibility."
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

        <section style={styles.briefCard}>
          <p style={styles.sectionKicker}>Copy-Ready CEO Brief</p>

          <h2 style={styles.cardTitle}>
            One enterprise reading across pressure, recovery, evidence, command,
            coordination, cross-site exposure, situation posture, audit,
            executive delta, recommendation, and institutional memory.
          </h2>

          <pre style={styles.summaryBox}>{copyReadyExecutiveBrief}</pre>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="What Is Happening?">{synthesis.whatIsHappening}</Panel>
          <Panel title="Why It Matters">{enterpriseReading.whyItMatters}</Panel>
        </section>

        <section style={styles.gridTwo}>
          <Panel title="Lifecycle Movement">{synthesis.nextMovement}</Panel>
          <Panel title="Leadership Action">
            {enterpriseReading.executiveDecision}
          </Panel>
        </section>

        <section style={styles.signalStrip}>
          <SignalCard
            title="Pressure"
            value={synthesis.activeInstability > 0 ? 'Visible' : 'Clear'}
            body={
              synthesis.activeInstability > 0
                ? 'Active lifecycle pressure remains visible.'
                : 'No active lifecycle pressure is currently visible.'
            }
          />

          <SignalCard
            title="Recovery"
            value={
              synthesis.recoveryRecords > 0
                ? 'Memory Active'
                : 'No Active Review'
            }
            body={
              synthesis.recoveryRecords > 0
                ? 'Recovery evidence is available for executive synthesis.'
                : 'No recovery durability records currently require executive interpretation.'
            }
          />

          <SignalCard
            title="Command"
            value={synthesis.commandPressure > 0 ? 'Required' : 'Clear'}
            body={
              synthesis.commandPressure > 0
                ? 'Command attention remains necessary before stability can be absorbed.'
                : 'No current command pressure is visible from lifecycle records.'
            }
          />
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
                    <th style={styles.th}>Case</th>
                    <th style={styles.th}>Disposition</th>
                    <th style={styles.th}>Command Posture</th>
                    <th style={styles.th}>Durability</th>
                    <th style={styles.th}>Memory Impact</th>
                    <th style={styles.th}>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {recoveryMemory.slice(0, 12).map((record) => (
                    <tr
                      key={`${record.caseItem.id}-${
                        record.latestRecoveryReview?.id || 'case'
                      }`}
                    >
                      <td style={styles.td}>
                        <strong>{record.caseItem.beneficiary_name}</strong>
                        <br />
                        {record.caseItem.support_domain}
                      </td>
                      <td style={styles.td}>{record.disposition}</td>
                      <td style={styles.td}>{record.commandPosture}</td>
                      <td style={styles.td}>{record.durabilityResult}</td>
                      <td style={styles.td}>{record.memoryImpact}</td>
                      <td style={styles.td}>{record.movementReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section style={styles.card}>
          <p style={styles.sectionKicker}>Historical Memory Trail</p>

          <h2 style={styles.cardTitle}>
            Historical continuity memory remains preserved without driving the
            current posture.
          </h2>

          {metrics.length === 0 && (
            <div style={styles.emptyState}>
              No historical continuity metric records are currently available.
            </div>
          )}

          {metrics.length > 0 && (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Created</th>
                    <th style={styles.th}>Pressure Memory</th>
                    <th style={styles.th}>Trajectory Memory</th>
                    <th style={styles.th}>Structural Memory</th>
                    <th style={styles.th}>Executive Memory</th>
                  </tr>
                </thead>

                <tbody>
                  {metrics.slice(0, 10).map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>{formatDate(item.created_at)}</td>
                      <td style={styles.td}>
                        {item.dominant_pressure_source ||
                          'No pressure memory recorded'}
                      </td>
                      <td style={styles.td}>
                        {item.dominant_trajectory_signal ||
                          'No trajectory memory recorded'}
                      </td>
                      <td style={styles.td}>
                        {item.dominant_memory_pattern ||
                          'No structural memory recorded'}
                      </td>
                      <td style={styles.td}>
                        {item.executive_summary ||
                          'No executive memory summary recorded'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={styles.panel}>
      <p style={styles.panelKicker}>{title}</p>
      <div style={styles.panelBody}>{children}</div>
    </section>
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

  deltaPanel: v.decisionPanel,
  deltaMetricGrid: v.executiveMetricStrip,
  deltaExplanationGrid: v.gridFour,
  threatStack: v.darkPanel,
  threatStackGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 12,
    marginTop: 14,
  },
  threatCard: v.quietCard,
  threatNumber: {
    display: 'block',
    color: '#d6b25e',
    fontSize: 12,
    fontWeight: 950,
    letterSpacing: '0.14em',
    marginBottom: 8,
  },
  threatText: {
    display: 'block',
    color: '#fff8e7',
    fontSize: 13,
    fontWeight: 900,
    lineHeight: 1.4,
  },

  recommendationPanel: v.decisionPanel,
  recommendationMetricGrid: v.executiveMetricStrip,
  recommendationGrid: v.gridThree,

  apexCard: v.decisionPanel,
  apexStack: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 14,
  },

  postureCard: v.briefPanel,
  trustPanel: v.warningPanel,

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

  sectionKicker: v.sectionKicker,
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

  gridTwo: v.gridTwo,
  signalStrip: v.executiveSignalStrip,
  signalCard: v.executiveMetricCard,
  signalValue: {
    color: '#d6b25e',
    fontSize: 20,
    lineHeight: 1.15,
    margin: '10px 0',
    fontWeight: 900,
    textTransform: 'capitalize',
  },

  card: v.darkPanel,
  briefCard: v.briefPanel,
  cardTitle: v.executivePanelTitle,
  bodyText: v.executiveBodyText,
  priorityGrid: v.gridThree,
  priorityItem: v.goldCard,
  priorityBody: {
    color: '#fff8e7',
    lineHeight: 1.5,
    fontSize: 12,
    margin: '8px 0 0',
    fontWeight: 700,
  },

  panel: v.quietCard,
  panelKicker: v.sectionKicker,
  panelBody: {
    color: '#cfc7b5',
    fontSize: 13,
    lineHeight: 1.6,
    marginTop: 10,
  },

  doctrinePanel: v.doctrinePanel,
  doctrineTitle: v.sectionKicker,
  doctrineGrid: v.gridFour,
  doctrineCard: mergeCGIStyles(v.goldCard, {
    color: '#fff8e7',
    fontSize: 12,
    lineHeight: 1.45,
    fontWeight: 800,
  }),

  emptyState: v.emptyState,
  tableWrap: v.tableWrap,
  table: v.table,
  th: v.th,
  td: v.td,
  summaryBox: v.executiveSummaryBox,
  primaryButton: mergeCGIStyles(v.primaryButton, {
    width: '100%',
    borderRadius: 14,
  }),
}