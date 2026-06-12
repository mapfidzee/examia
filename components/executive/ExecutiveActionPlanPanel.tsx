'use client'

import type { CSSProperties } from 'react'

import type { CGIExecutiveActionPlanReading } from '@/lib/cgiExecutiveActionPlanEngine'
import { cgiVisualStyles } from '@/lib/cgiVisualSystem'

type ExecutiveActionPlanPanelProps = {
  actionPlan: CGIExecutiveActionPlanReading
}

export default function ExecutiveActionPlanPanel({
  actionPlan,
}: ExecutiveActionPlanPanelProps) {
  return (
    <section style={cgiVisualStyles.decisionPanel}>
      <div>
        <p style={cgiVisualStyles.sectionKicker}>Executive Action Plan</p>

        <h2 style={cgiVisualStyles.executivePanelTitle}>
          {actionPlan.immediateAction}
        </h2>

        <p style={cgiVisualStyles.executiveBodyText}>
          {actionPlan.boardSentence}
        </p>
      </div>

      <div style={gridFour}>
        <MetricCard label="Owner" value={actionPlan.executiveOwner} />
        <MetricCard label="Review Window" value={actionPlan.reviewWindow} />
        <MetricCard
          label="Escalation Rule"
          value={actionPlan.escalationRule}
        />
        <MetricCard
          label="Required Evidence"
          value={actionPlan.requiredEvidence}
        />
      </div>

      <div style={cgiVisualStyles.darkPanel}>
        <p style={cgiVisualStyles.metricLabel}>Action Sequence</p>

        <div style={gridThreeCompact}>
          {actionPlan.actionSequence.map((item, index) => (
            <article key={`${item}-${index}`} style={cgiVisualStyles.quietCard}>
              <span style={numberStyle}>
                {String(index + 1).padStart(2, '0')}
              </span>

              <span style={textStyle}>{item}</span>
            </article>
          ))}
        </div>
      </div>

      <div style={gridThree}>
        <TextCard
          title="Success Condition"
          body={actionPlan.successCondition}
        />
        <TextCard
          title="Failure Condition"
          body={actionPlan.failureCondition}
        />
        <TextCard
          title="Evidence Standard"
          body={actionPlan.requiredEvidence}
        />
      </div>
    </section>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article style={cgiVisualStyles.goldCard}>
      <p style={cgiVisualStyles.metricLabel}>{label}</p>
      <p style={metricValueStyle}>{value}</p>
    </article>
  )
}

function TextCard({ title, body }: { title: string; body: string }) {
  return (
    <article style={cgiVisualStyles.goldCard}>
      <p style={cgiVisualStyles.sectionKicker}>{title}</p>
      <p style={bodyStyle}>{body}</p>
    </article>
  )
}

const gridFour: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: 16,
}

const gridThree: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 16,
}

const gridThreeCompact: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 12,
  marginTop: 14,
}

const metricValueStyle: CSSProperties = {
  margin: '10px 0 0',
  color: '#fff8e7',
  fontSize: 18,
  fontWeight: 950,
  lineHeight: 1.1,
}

const numberStyle: CSSProperties = {
  display: 'block',
  color: '#d6b25e',
  fontSize: 12,
  fontWeight: 950,
  letterSpacing: '0.14em',
  marginBottom: 8,
}

const textStyle: CSSProperties = {
  display: 'block',
  color: '#fff8e7',
  fontSize: 13,
  fontWeight: 900,
  lineHeight: 1.4,
}

const bodyStyle: CSSProperties = {
  color: '#fff8e7',
  lineHeight: 1.5,
  fontSize: 12,
  margin: '8px 0 0',
  fontWeight: 700,
}