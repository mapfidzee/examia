'use client'

import type { CSSProperties } from 'react'

import type { CGIExecutiveRecommendationReading } from '@/lib/cgiExecutiveRecommendationEngine'
import { cgiVisualStyles } from '@/lib/cgiVisualSystem'

type ExecutiveRecommendationPanelProps = {
  recommendation: CGIExecutiveRecommendationReading
}

export default function ExecutiveRecommendationPanel({
  recommendation,
}: ExecutiveRecommendationPanelProps) {
  return (
    <section style={cgiVisualStyles.decisionPanel}>
      <div>
        <p style={cgiVisualStyles.sectionKicker}>
          Executive Recommendation
        </p>

        <h2 style={cgiVisualStyles.executivePanelTitle}>
          {recommendation.recommendation}
        </h2>

        <p style={cgiVisualStyles.executiveBodyText}>
          {recommendation.boardSentence}
        </p>
      </div>

      <div style={gridFour}>
        <MetricCard label="Posture" value={recommendation.posture} />
        <MetricCard label="Urgency" value={recommendation.urgency} />
        <MetricCard
          label="Required Owner"
          value={recommendation.requiredOwner}
        />
        <MetricCard
          label="Next Move"
          value={recommendation.nextExecutiveMove}
        />
      </div>

      <div style={gridThree}>
        <TextCard title="Rationale" body={recommendation.rationale} />
        <TextCard
          title="Consequence Of Delay"
          body={recommendation.consequenceOfDelay}
        />
        <TextCard
          title="Required Evidence"
          body={recommendation.requiredEvidence}
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

const metricValueStyle: CSSProperties = {
  margin: '10px 0 0',
  color: '#fff8e7',
  fontSize: 18,
  fontWeight: 950,
  lineHeight: 1.1,
}

const bodyStyle: CSSProperties = {
  color: '#fff8e7',
  lineHeight: 1.5,
  fontSize: 12,
  margin: '8px 0 0',
  fontWeight: 700,
}